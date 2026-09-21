import { neon } from '@neondatabase/serverless';
import { captcha } from './data/site';
import { isHoneypotHit, leadProblems, normalizeLead, str } from './lib/lead-fields';
import { notificationPayload } from './lib/notification';
import { allowedCaptchaHostnames, isProductionHost, isPublishedTestSecret } from './lib/captcha-hosts';

/**
 * The site's Worker.
 *
 * Everything on this site is static except one route. Cloudflare serves the
 * built assets first and only calls this script for a request that matches no
 * asset, so the cost of having it is a single `env.ASSETS.fetch()` on the
 * paths that fall through.
 *
 * POST /api/submit-lead — Section 4.1 of the overhaul specification.
 *
 * WHY A WORKER AT ALL. The PPC form posts here and redirects to /thank-you/ on
 * a 200. Before this, every form on the site posted to `action="#"` and a
 * visitor's enquiry was dropped silently; that was the launch blocker.
 */

export interface Env {
  ASSETS: Fetcher;
  /**
   * Neon Postgres connection string, set as a Worker secret:
   *   wrangler secret put DATABASE_URL
   *
   * Neon rather than D1 because the account is at its D1 database limit, and
   * Neon's serverless driver talks HTTP rather than raw TCP, so it works from a
   * Worker with no tunnel, no pooler and nothing of ours to keep running.
   */
  DATABASE_URL?: string;
  /** Optional. When set, the lead is also emailed to the client via Resend. */
  RESEND_API_KEY?: string;
  LEAD_NOTIFY_TO?: string;
  LEAD_NOTIFY_FROM?: string;
  /**
   * The captcha secret, paired with whatever `captcha.provider` renders:
   *   wrangler secret put TURNSTILE_SECRET     (provider 'turnstile')
   *   wrangler secret put RECAPTCHA_SECRET     (provider 'recaptcha')
   *
   * Required. With no secret this endpoint answers 503 rather than accepting
   * unverified posts — an unconfigured captcha that quietly passes everything
   * is worse than no captcha, because the form looks protected.
   */
  TURNSTILE_SECRET?: string;
  RECAPTCHA_SECRET?: string;
}

type LeadBody = Record<string, unknown>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

/**
 * Email the lead to the client.
 *
 * A failure here must not fail the submission — the lead is already stored and
 * can be read back — but it must not be invisible either. An earlier version
 * swallowed everything, and a wrong API key then looked exactly like success:
 * the endpoint answered 200, the row landed, and no email was sent or logged
 * anywhere. Every outcome below is logged.
 */
async function notify(env: Env, lead: Record<string, string>) {
  const missing = (['RESEND_API_KEY', 'LEAD_NOTIFY_TO', 'LEAD_NOTIFY_FROM'] as const).filter(
    (k) => !env[k]
  );
  if (missing.length) {
    console.warn('notify: not configured, no email sent. missing:', missing.join(', '));
    return;
  }
  /* The body and the reply address are built in `lib/notification.ts`, where
     the exact JSON can be asserted on without an API key or a network. That
     matters here more than it usually would: `reply_to` used to be set from
     `work_email` unconditionally, which was fine only while the endpoint
     required an email on every lead. The short quote form takes a phone
     number instead, so an empty `reply_to` would now be sent — and a lead
     whose notification Resend refuses is a lead nobody is told about. */
  const payload = notificationPayload(lead, env.LEAD_NOTIFY_FROM!, env.LEAD_NOTIFY_TO!);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // the body carries Resend's reason — an invalid key, an unverified
      // sender — and without it this is undiagnosable from the outside
      console.error('notify: resend rejected the send', res.status, await res.text());
      return;
    }
    console.log('notify: sent', (await res.json<{ id?: string }>()).id ?? '');
  } catch (err) {
    console.error('notify: request to resend failed', err);
  }
}

/**
 * Ask the provider whether this token is real, and where it was solved.
 *
 * Turnstile and reCAPTCHA take the same form-encoded `secret`/`response` pair
 * and answer with the same `{ success, hostname, "error-codes" }` shape, so
 * one function covers both and only the URL changes.
 *
 * The reason is returned rather than logged here so the caller says something
 * specific — `timeout-or-duplicate` (a replayed or stale token) and
 * `invalid-input-secret` (the wrong key) look identical from the visitor's
 * side and need completely different fixes.
 *
 * `hostname` is where the visitor solved the challenge, which is not
 * necessarily this site: a token minted on any page carrying the same site key
 * verifies here too. The caller checks it against an allowlist.
 */
interface CaptchaResult {
  ok: boolean;
  reason: string;
  hostname: string;
}

async function verifyCaptcha(
  url: string,
  token: string,
  secret: string,
  ip: string
): Promise<CaptchaResult> {
  if (!token) return { ok: false, reason: 'no token submitted', hostname: '' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    if (!res.ok) return { ok: false, reason: `siteverify http ${res.status}`, hostname: '' };

    const body = await res.json<{
      success?: boolean;
      hostname?: string;
      'error-codes'?: string[];
    }>();
    const hostname = typeof body.hostname === 'string' ? body.hostname : '';
    if (!body.success) {
      return { ok: false, reason: (body['error-codes'] ?? ['unknown']).join(','), hostname };
    }
    return { ok: true, reason: '', hostname };
  } catch (err) {
    /* Provider unreachable. Reject rather than fail open: an outage that turns
       the captcha off is exactly when the form gets hammered. */
    return { ok: false, reason: `siteverify unreachable: ${String(err)}`, hostname: '' };
  }
}

async function submitLead(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  /* Honeypot. A real person never sees this field, so anything in it is a bot.
     Answer 200 rather than an error — telling a bot it failed teaches it to try
     again with the field left blank. Nothing is stored. */
  if (isHoneypotHit(body)) return json({ ok: true });

  /* --- captcha ------------------------------------------------------------
     After the honeypot, so a bot that fell into it costs nothing, and before
     the database, so an unverified post never reaches Neon or Resend. */
  const turnstile = captcha.provider === 'turnstile';
  const secret = turnstile ? env.TURNSTILE_SECRET : env.RECAPTCHA_SECRET;
  const secretName = turnstile ? 'TURNSTILE_SECRET' : 'RECAPTCHA_SECRET';

  if (!secret) {
    console.error(`submit-lead: no ${secretName}; refusing to accept unverified submissions`);
    return json({ error: 'captcha unavailable' }, 503);
  }

  /* Both providers publish a test pair that passes for any token on any
     domain. Either is the right default for staging and catastrophic on
     production, where it would wave through every bot on the internet. This
     is the ONLY layer that can see the secret's value, and therefore the only
     one that can catch this at all — a build cannot, and `wrangler secret
     list` shows names, not values. Cloudflare's always-fails test secret is
     refused too: on production it would reject every real lead. */
  const host = new URL(request.url).hostname;
  if (isPublishedTestSecret(secret) && isProductionHost(host)) {
    console.error(`submit-lead: ${secretName} is a published test key, on production host`, host);
    return json({ error: 'captcha misconfigured' }, 503);
  }

  const result = await verifyCaptcha(
    turnstile ? captcha.turnstile.verifyUrl : captcha.recaptcha.verifyUrl,
    str(body.captcha ?? body.recaptcha ?? body['g-recaptcha-response'] ?? body['cf-turnstile-response'], 4000),
    secret,
    request.headers.get('cf-connecting-ip') ?? ''
  );
  if (!result.ok) {
    console.warn('submit-lead: captcha rejected —', result.reason);
    return json({ error: 'captcha failed' }, 403);
  }

  /* The token is real. That is not the same as the token being ours.
     `hostname` is where the challenge was actually solved; a copy of this
     page on a host someone else controls, carrying the same public site key,
     mints tokens that verify here perfectly well. See `lib/captcha-hosts.ts`
     for the allowlist and for why production's is a closed one.

     An absent hostname is treated as a mismatch rather than waved through.
     Both providers document it as present on success, so its absence means
     either a provider change or something answering in their place, and
     neither should quietly buy a lead. If genuine submissions ever start
     failing, this is the log line to look for. */
  const allowed = allowedCaptchaHostnames(host, secret);
  if (!allowed.includes(result.hostname)) {
    console.warn(
      'submit-lead: captcha solved on an unexpected hostname —',
      JSON.stringify({ solvedOn: result.hostname, requestHost: host, allowed })
    );
    return json({ error: 'captcha failed' }, 403);
  }

  /* Normalisation, length limits and the sanitising of everything that came
     off a query string live in `src/lib/lead-fields.ts`, which is a pure
     function and is tested as one. */
  const lead = normalizeLead(body);

  /* A name, and one way to reply. Phone OR email — requiring both refused a
     visitor who only wanted a call unless they also handed over an email
     address, and the short quote form no longer asks for both. An address is
     not required and never was here. */
  const problems = leadProblems(lead);
  if (problems.length) return json({ error: 'invalid lead', fields: problems }, 422);

  if (!env.DATABASE_URL) {
    /* No database configured. Say so loudly rather than returning 200 and
       losing the enquiry — a form that reports success and drops the lead is
       the failure this endpoint exists to end. */
    console.error('submit-lead: no DATABASE_URL; lead not stored', lead.work_email);
    return json({ error: 'lead storage unavailable' }, 503);
  }

  try {
    const sql = neon(env.DATABASE_URL);
    await sql`
      INSERT INTO leads
        (form_id, full_name, work_email, phone, facility_size, facility_type,
         business_name, address, services, message, page_url,
         gclid, gbraid, wbraid, msclkid, gad_source, gclsrc,
         utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
         landing_page, referrer, touch_at,
         first_gclid, first_msclkid, first_utm_source, first_utm_medium,
         first_utm_campaign, first_landing_page, first_referrer, first_touch_at,
         ip_country, user_agent)
      VALUES
        (${lead.form_id}, ${lead.full_name}, ${lead.work_email}, ${lead.phone},
         ${lead.facility_size}, ${lead.facility_type},
         ${lead.business_name}, ${lead.address}, ${lead.services}, ${lead.message},
         ${lead.page_url},
         ${lead.gclid}, ${lead.gbraid}, ${lead.wbraid}, ${lead.msclkid},
         ${lead.gad_source}, ${lead.gclsrc},
         ${lead.utm_source}, ${lead.utm_medium}, ${lead.utm_campaign},
         ${lead.utm_term}, ${lead.utm_content}, ${lead.utm_id},
         ${lead.landing_page}, ${lead.referrer}, ${lead.touch_at},
         ${lead.first_gclid}, ${lead.first_msclkid}, ${lead.first_utm_source},
         ${lead.first_utm_medium}, ${lead.first_utm_campaign},
         ${lead.first_landing_page}, ${lead.first_referrer}, ${lead.first_touch_at},
         ${(request as Request & { cf?: { country?: string } }).cf?.country ?? ''},
         ${str(request.headers.get('user-agent'), 300)})
    `;
  } catch (err) {
    console.error('submit-lead: insert failed', err);
    return json({ error: 'lead storage failed' }, 500);
  }

  await notify(env, lead);
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/submit-lead') return submitLead(request, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

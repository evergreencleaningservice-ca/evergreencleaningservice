import { neon } from '@neondatabase/serverless';
import { captcha, PRODUCTION_HOSTS } from './data/site';
import { isHoneypotHit, looksLikeEmail, missingFields, normalizeLead, str } from './lib/lead-fields';

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
  const lines = Object.entries(lead)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.LEAD_NOTIFY_FROM,
        to: [env.LEAD_NOTIFY_TO],
        reply_to: lead.work_email,
        subject: `New proposal request — ${lead.full_name}`,
        text: lines,
      }),
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
 * Ask the provider whether this token is real.
 *
 * Turnstile and reCAPTCHA take the same form-encoded `secret`/`response` pair
 * and answer with the same `{ success, "error-codes" }` shape, so one function
 * covers both and only the URL changes.
 *
 * Returns a reason string on failure and null on success, so the caller logs
 * something specific rather than "captcha failed" — `timeout-or-duplicate`
 * (a replayed or stale token) and `invalid-input-secret` (the wrong key) look
 * identical from the visitor's side and need completely different fixes.
 */
async function verifyCaptcha(
  url: string,
  token: string,
  secret: string,
  ip: string
): Promise<string | null> {
  if (!token) return 'no token submitted';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    if (!res.ok) return `siteverify http ${res.status}`;

    const body = await res.json<{ success?: boolean; 'error-codes'?: string[] }>();
    return body.success ? null : (body['error-codes'] ?? ['unknown']).join(',');
  } catch (err) {
    /* Provider unreachable. Reject rather than fail open: an outage that turns
       the captcha off is exactly when the form gets hammered. */
    return `siteverify unreachable: ${String(err)}`;
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

  /* Both providers publish a test pair that passes for any token on any domain.
     Either is the right default for staging and catastrophic on production,
     where it would wave through every bot on the internet. Going live is a
     build and a secret away from happening by accident, so the check lives
     here rather than in anyone's memory. Cloudflare's always-fails test secret
     is refused too: on production it would reject every real lead. */
  const host = new URL(request.url).hostname;
  const TEST_SECRETS: readonly string[] = [
    captcha.turnstile.testSecretKey,
    captcha.turnstile.failSecretKey,
    captcha.recaptcha.testSecretKey,
  ];
  if (TEST_SECRETS.includes(secret) && (PRODUCTION_HOSTS as readonly string[]).includes(host)) {
    console.error(`submit-lead: ${secretName} is a published test key, on production host`, host);
    return json({ error: 'captcha misconfigured' }, 503);
  }

  const failure = await verifyCaptcha(
    turnstile ? captcha.turnstile.verifyUrl : captcha.recaptcha.verifyUrl,
    str(body.captcha ?? body.recaptcha ?? body['g-recaptcha-response'] ?? body['cf-turnstile-response'], 4000),
    secret,
    request.headers.get('cf-connecting-ip') ?? ''
  );
  if (failure) {
    console.warn('submit-lead: captcha rejected —', failure);
    return json({ error: 'captcha failed' }, 403);
  }

  /* Normalisation, length limits and the sanitising of everything that came
     off a query string live in `src/lib/lead-fields.ts`, which is a pure
     function and is tested as one. */
  const lead = normalizeLead(body);

  const missing = missingFields(lead);
  if (missing.length) return json({ error: 'missing required fields', fields: missing }, 422);
  if (!looksLikeEmail(lead.work_email)) return json({ error: 'invalid email' }, 422);

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

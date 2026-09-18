import { neon } from '@neondatabase/serverless';
import { PRODUCTION_HOSTS, recaptcha } from './data/site';

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
   * reCAPTCHA v2 secret, paired with the site key the forms render:
   *   wrangler secret put RECAPTCHA_SECRET
   *
   * Required. With no secret this endpoint answers 503 rather than accepting
   * unverified posts — an unconfigured captcha that quietly passes everything
   * is worse than no captcha, because the form looks protected.
   */
  RECAPTCHA_SECRET?: string;
}

type LeadBody = Record<string, unknown>;

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

/** Deliberately permissive: a shape check, not an attempt to validate email. */
const looksLikeEmail = (v: string) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v);

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
 * Ask Google whether this token is real.
 *
 * Returns a reason string on failure and null on success, so the caller logs
 * something specific rather than "captcha failed" — `timeout-or-duplicate`
 * (a replayed or stale token) and `invalid-input-secret` (the wrong key) look
 * identical from the visitor's side and need completely different fixes.
 */
async function verifyCaptcha(token: string, secret: string, ip: string): Promise<string | null> {
  if (!token) return 'no token submitted';

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    if (!res.ok) return `siteverify http ${res.status}`;

    const body = await res.json<{ success?: boolean; 'error-codes'?: string[] }>();
    return body.success ? null : (body['error-codes'] ?? ['unknown']).join(',');
  } catch (err) {
    /* Google unreachable. Reject rather than fail open: an outage that turns
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
  if (str(body.company_tax_id, 200) || str(body['company-website'], 200)) return json({ ok: true });

  /* --- captcha ------------------------------------------------------------
     After the honeypot, so a bot that fell into it costs nothing, and before
     the database, so an unverified post never reaches Neon or Resend. */
  if (!env.RECAPTCHA_SECRET) {
    console.error('submit-lead: no RECAPTCHA_SECRET; refusing to accept unverified submissions');
    return json({ error: 'captcha unavailable' }, 503);
  }

  /* Google publishes a v2 test pair that passes for any token on any domain.
     It is the right default for staging and catastrophic on production, where
     it would wave through every bot on the internet. Going live is a build and
     a secret away from happening by accident, so the check lives here rather
     than in anyone's memory. */
  const host = new URL(request.url).hostname;
  if (
    env.RECAPTCHA_SECRET === recaptcha.testSecretKey &&
    (PRODUCTION_HOSTS as readonly string[]).includes(host)
  ) {
    console.error('submit-lead: reCAPTCHA test secret is set on production host', host);
    return json({ error: 'captcha misconfigured' }, 503);
  }

  const failure = await verifyCaptcha(
    str(body.recaptcha ?? body['g-recaptcha-response'], 4000),
    env.RECAPTCHA_SECRET,
    request.headers.get('cf-connecting-ip') ?? ''
  );
  if (failure) {
    console.warn('submit-lead: captcha rejected —', failure);
    return json({ error: 'captcha failed' }, 403);
  }

  const lead = {
    form_id: str(body.form_id, 64) || 'ppc-lead-form',
    full_name: str(body.name ?? body.fullName, 120),
    work_email: str(body.email ?? body.workEmail, 200),
    phone: str(body.phone, 40),
    facility_size: str(body.size ?? body.facilitySize, 64),
    page_url: str(body.page_url, 500),
    referrer: str(body.referrer, 500),
    gclid: str(body.gclid, 200),
    utm_source: str(body.utm_source, 120),
    utm_medium: str(body.utm_medium, 120),
    utm_campaign: str(body.utm_campaign, 200),
    /* The site's own forms ask for these; the PPC form sends none of them. */
    facility_type: str(body.facility_type, 120),
    business_name: str(body.business_name, 200),
    address: str(body.address, 400),
    services: str(body.services, 400),
    message: str(body.message, 4000),
  };

  const missing = (['full_name', 'work_email', 'phone'] as const).filter((k) => !lead[k]);
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
        (form_id, full_name, work_email, phone, facility_size,
         page_url, referrer, gclid, utm_source, utm_medium, utm_campaign,
         facility_type, business_name, address, services, message,
         ip_country, user_agent)
      VALUES
        (${lead.form_id}, ${lead.full_name}, ${lead.work_email}, ${lead.phone},
         ${lead.facility_size}, ${lead.page_url}, ${lead.referrer}, ${lead.gclid},
         ${lead.utm_source}, ${lead.utm_medium}, ${lead.utm_campaign},
         ${lead.facility_type}, ${lead.business_name}, ${lead.address}, ${lead.services},
         ${lead.message},
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

import { neon } from '@neondatabase/serverless';

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

async function notify(env: Env, lead: Record<string, string>) {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_TO || !env.LEAD_NOTIFY_FROM) return;
  const lines = Object.entries(lead)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    await fetch('https://api.resend.com/emails', {
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
  } catch {
    // A failed notification must not fail the submission: the lead is already
    // in the database and can be read from there.
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
  if (str(body.company_tax_id, 200)) return json({ ok: true });

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
         ip_country, user_agent)
      VALUES
        (${lead.form_id}, ${lead.full_name}, ${lead.work_email}, ${lead.phone},
         ${lead.facility_size}, ${lead.page_url}, ${lead.referrer}, ${lead.gclid},
         ${lead.utm_source}, ${lead.utm_medium}, ${lead.utm_campaign},
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

/**
 * The lead notification email, as a value.
 *
 * Split out of `worker.ts` so the exact JSON that reaches Resend can be
 * asserted on without a Workers runtime, an API key or a network — and
 * because the bug this module exists to prevent was invisible in every other
 * kind of test.
 *
 * WHAT WENT WRONG. `notify()` sent `reply_to: lead.work_email` unconditionally.
 * That was harmless for as long as the endpoint required an email address on
 * every lead, which it did until Phase 9. The short quote form accepts a phone
 * number INSTEAD of an email, so `work_email` is now legitimately empty — and
 * `reply_to: ""` is not an email address. Resend validates that field, so the
 * likely outcome is a rejected send: the lead sits in the database and nobody
 * is told it arrived.
 *
 * Note the shape of the failure. The lead is not lost — it is stored before
 * this runs, and `notify()` catches its own errors so the visitor still gets a
 * 200. What is lost is anyone finding out, which is worse than a visible
 * error because nothing anywhere says a thing is wrong.
 *
 * So: `reply_to` is present only when there is a real address to put in it.
 * Omitted entirely, not emptied, not nulled, not filled with a placeholder —
 * an absent key is the only correct way to say "there is no reply address".
 */

import { looksLikeEmail } from './lead-fields';
import { isProductionHost } from './captcha-hosts';

/**
 * Who a lead's notification goes to, by the hostname it arrived on.
 *
 * Staging and production are one Worker sharing one set of secrets, so
 * changing LEAD_NOTIFY_TO to try the forms out would also send every real
 * lead to the tester. STAGING_LEAD_NOTIFY_TO gives staging its own inbox:
 *
 *   www. and the apex   LEAD_NOTIFY_TO, always
 *   anything else       STAGING_LEAD_NOTIFY_TO when set, else LEAD_NOTIFY_TO
 *
 * The fallback runs one way only. Production never reads the staging
 * address, so a test recipient cannot end up receiving real enquiries.
 */
export interface NotifyEnv {
  LEAD_NOTIFY_TO?: string;
  STAGING_LEAD_NOTIFY_TO?: string;
}

export const notifyRecipientFor = (host: string, env: NotifyEnv): string | undefined =>
  isProductionHost(host) ? env.LEAD_NOTIFY_TO : env.STAGING_LEAD_NOTIFY_TO || env.LEAD_NOTIFY_TO;

/** Exactly the body Resend's POST /emails accepts. */
export interface ResendPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
  /** Present only when the lead carries a usable address. */
  reply_to?: string;
}

/**
 * What the email shows, and nothing else.
 *
 * The client asked for a short message: who, how to reach them, what it is
 * about, where they asked from and when. Everything else the endpoint stores
 * — attribution, form_id, landing page, referrer, touch times — stays in the
 * database and out of the email.
 *
 * CORE_FIELDS are always listed, with `(not supplied)` where a value is
 * absent, because there is a real difference between "this visitor gave no
 * email" and "the email was lost somewhere between the form and here". The
 * first is a lead to phone; the second is a bug.
 *
 * OPTIONAL_FIELDS are listed only when the visitor filled them in. The quote
 * form never asks for either, so printing them would put two
 * "(not supplied)" lines on every quote lead; but the contact form does ask,
 * and a message the visitor typed must not be left out of the email.
 */
export const CORE_FIELDS: readonly (readonly [string, string])[] = [
  ['full_name', 'Name'],
  ['phone', 'Phone'],
  ['work_email', 'Email'],
  ['services', 'Service'],
] as const;

export const OPTIONAL_FIELDS: readonly (readonly [string, string])[] = [
  ['address', 'Address'],
  ['message', 'Details'],
] as const;

export const NOT_SUPPLIED = '(not supplied)';

const filled = (v: unknown): boolean => typeof v === 'string' && v.trim() !== '';

/** When the lead was sent, in Toronto time, e.g. "September 30, 2026 at 10:50 AM EDT". */
export const formatSentAt = (at: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(at);

/** The message body: the core fields, any optional field filled in, then the page and the time. */
export function notificationText(lead: Record<string, string>, sentAt: Date = new Date()): string {
  const core = CORE_FIELDS.map(
    ([key, label]) => `${label}: ${filled(lead[key]) ? lead[key] : NOT_SUPPLIED}`
  );
  const optional = OPTIONAL_FIELDS.filter(([key]) => filled(lead[key])).map(
    ([key, label]) => `${label}: ${lead[key]}`
  );

  return [
    ...core,
    ...optional,
    '',
    `Page URL: ${filled(lead.page_url) ? lead.page_url : NOT_SUPPLIED}`,
    `Time Sent: ${formatSentAt(sentAt)}`,
  ].join('\n');
}

/**
 * Build the Resend request body.
 *
 * `reply_to` is included only for an address that passes the same shape check
 * the endpoint validates with, so this cannot emit a field Resend will refuse
 * even if a malformed address somehow reached the database.
 */
export function notificationPayload(
  lead: Record<string, string>,
  from: string,
  to: string,
  sentAt: Date = new Date()
): ResendPayload {
  const payload: ResendPayload = {
    from,
    to: [to],
    subject: `New proposal request — ${lead.full_name}`,
    text: notificationText(lead, sentAt),
  };

  const email = (lead.work_email ?? '').trim();
  if (email && looksLikeEmail(email)) payload.reply_to = email;

  return payload;
}

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
 * The fields an account executive needs, always listed.
 *
 * Always, with `(not supplied)` where a value is absent, because the short
 * form legitimately omits things and there is a real difference between "this
 * visitor gave no email" and "the email was lost somewhere between the form
 * and here". The first is a lead to phone; the second is a bug.
 */
/**
 * Tracks the form. When the quote form took the reference design's field set,
 * `business_name` and `services` stopped being asked for — so they came out
 * of this list too. They are always-rendered fields: leaving them in would
 * have printed "Business: (not supplied)" and "Service needed: (not
 * supplied)" on every single lead from now on, which is exactly the noise the
 * `extra` pass below exists to keep out.
 *
 * Nothing is lost by removing them. The columns still exist and still hold
 * what earlier leads answered, and a lead that somehow carries either value
 * is picked up by `extra` and printed.
 */
export const CORE_FIELDS: readonly (readonly [string, string])[] = [
  ['full_name', 'Name'],
  ['phone', 'Phone'],
  ['work_email', 'Email'],
  ['address', 'Address'],
  ['province', 'Province'],
  ['message', 'Cleaning needs'],
] as const;

export const NOT_SUPPLIED = '(not supplied)';

const filled = (v: unknown): boolean => typeof v === 'string' && v.trim() !== '';

/** The message body: the core fields, then whatever else is non-empty. */
export function notificationText(lead: Record<string, string>): string {
  const core = CORE_FIELDS.map(
    ([key, label]) => `${label}: ${filled(lead[key]) ? lead[key] : NOT_SUPPLIED}`
  );

  /* Attribution, the page, the user agent — only when present. Thirty empty
     `utm_` lines are noise, and noise is what stops a person reading the
     seven lines that matter. */
  const extra = Object.entries(lead)
    .filter(([key, value]) => !CORE_FIELDS.some(([c]) => c === key) && filled(value))
    .map(([key, value]) => `${key}: ${value}`);

  return [...core, '', ...extra].join('\n');
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
  to: string
): ResendPayload {
  const payload: ResendPayload = {
    from,
    to: [to],
    subject: `New proposal request — ${lead.full_name}`,
    text: notificationText(lead),
  };

  const email = (lead.work_email ?? '').trim();
  if (email && looksLikeEmail(email)) payload.reply_to = email;

  return payload;
}

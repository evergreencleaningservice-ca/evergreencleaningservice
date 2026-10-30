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
import { images } from '../data/site';

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
 *
 * Either may hold several addresses separated by commas, e.g.
 * "evergreencleaning416@gmail.com,ads@brandingcentres.com" — see
 * `recipientList`.
 */
export interface NotifyEnv {
  LEAD_NOTIFY_TO?: string;
  STAGING_LEAD_NOTIFY_TO?: string;
}

export const notifyRecipientFor = (host: string, env: NotifyEnv): string | undefined =>
  isProductionHost(host) ? env.LEAD_NOTIFY_TO : env.STAGING_LEAD_NOTIFY_TO || env.LEAD_NOTIFY_TO;

/**
 * A recipient setting as the list Resend wants: split on commas, trimmed,
 * blanks dropped. Without the split, "a@x.com,b@y.com" would reach Resend as
 * ONE address, which it rejects — and a rejected send is a lead nobody hears
 * about.
 */
export const recipientList = (to: string): string[] =>
  to
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);

/** Exactly the body Resend's POST /emails accepts. */
export interface ResendPayload {
  from: string;
  to: string[];
  subject: string;
  /** The plain-text copy, for clients that do not render HTML. */
  text: string;
  html: string;
  /** Present only when the lead carries a usable address. */
  reply_to?: string;
}

/**
 * What the email shows, in the order it shows it.
 *
 * THE ORIGINAL SITE'S NOTIFICATION, rebuilt (2026-10-22). The client reads
 * every lead in this email and asked for it to look like the one WPForms sent
 * from the old site: the logo, then one block per field — Name, Name of
 * Business, Address, Email, Phone, the services ticked, Additional comments.
 * Everything else the endpoint stores — attribution, form_id, landing page,
 * referrer, touch times — stays in the database and out of the email.
 *
 * `always` fields are listed with `(not supplied)` where a value is absent,
 * because there is a real difference between "this visitor gave no email" and
 * "the email was lost somewhere between the form and here". The first is a
 * lead to phone; the second is a bug. The rest appear only when filled in, so
 * a lead from a form that does not ask for them carries no empty blocks.
 */
export interface NotificationField {
  key: string;
  label: string;
  always: boolean;
}

export const NOTIFICATION_FIELDS: readonly NotificationField[] = [
  { key: 'full_name', label: 'Name', always: true },
  { key: 'business_name', label: 'Name of Business', always: false },
  { key: 'address', label: 'Address', always: false },
  { key: 'work_email', label: 'Email', always: true },
  { key: 'phone', label: 'Phone', always: true },
  { key: 'services', label: "I'm interested in a quote for these services", always: false },
  { key: 'message', label: 'Additional comments', always: false },
];

/** The fields listed on every lead, filled or not. */
export const CORE_FIELDS: readonly (readonly [string, string])[] = NOTIFICATION_FIELDS.filter(
  (f) => f.always
).map((f) => [f.key, f.label] as const);

export const NOT_SUPPLIED = '(not supplied)';

/**
 * The logo at the top of the email. Absolute, from the image host, because a
 * mail client has no page to resolve a relative URL against.
 */
export const LOGO_URL = `${images.host}/images/cropped-evergreen-cleaning-toronto-logo-banner.jpg`;

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

/**
 * One field's value as lines, the way the original printed it: the address
 * with "CA" under it, one service per line, comments as typed.
 */
export function fieldLines(key: string, value: string): string[] {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim());
  if (key === 'address') return [...lines.filter(Boolean), 'CA'];
  if (key === 'services')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  if (key === 'message') return lines;
  return [value.trim()];
}

/** The fields this lead's email lists, with their lines. */
function shownFields(lead: Record<string, string>): { key: string; label: string; lines: string[] }[] {
  return NOTIFICATION_FIELDS.filter((f) => f.always || filled(lead[f.key])).map((f) => ({
    key: f.key,
    label: f.label,
    lines: filled(lead[f.key]) ? fieldLines(f.key, lead[f.key]) : [NOT_SUPPLIED],
  }));
}

/** The plain-text body: each field, then the page and the time. */
export function notificationText(lead: Record<string, string>, sentAt: Date = new Date()): string {
  const blocks = shownFields(lead).map(({ label, lines }) =>
    lines.length === 1 ? `${label}: ${lines[0]}` : `${label}:\n${lines.join('\n')}`
  );

  return [
    ...blocks,
    '',
    `Page URL: ${filled(lead.page_url) ? lead.page_url : NOT_SUPPLIED}`,
    `Time Sent: ${formatSentAt(sentAt)}`,
  ].join('\n');
}

/** Escape for HTML text and attribute values. Every value here came from a stranger. */
export const escapeHtml = (v: string): string =>
  v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* The original's link colour, WPForms's own orange. */
const LINK = 'color:#e27730;text-decoration:underline;';
const FONT = 'font-family:Helvetica,Arial,sans-serif;';

/** A field's value as HTML: the email a mailto link, the address a map link. */
function valueHtml(key: string, lines: string[], raw: string): string {
  const text = lines.map(escapeHtml).join('<br>');
  if (!filled(raw)) return text;
  if (key === 'work_email' && looksLikeEmail(raw.trim())) {
    return `<a href="mailto:${escapeHtml(raw.trim())}" style="${LINK}">${text}</a>`;
  }
  if (key === 'address') {
    const query = encodeURIComponent(lines.join(', '));
    return `<a href="https://www.google.com/maps/search/?api=1&amp;query=${query}" style="${LINK}">${text}</a>`;
  }
  return text;
}

/**
 * The HTML body, after the original: a grey page, the logo on a white panel,
 * then a white card with one block per field divided by hairlines. Tables and
 * inline styles, because that is what mail clients render.
 */
export function notificationHtml(lead: Record<string, string>, sentAt: Date = new Date()): string {
  const fields = shownFields(lead);
  const rows = fields
    .map(({ key, label, lines }, i) => {
      const rule = i < fields.length - 1 ? 'border-bottom:1px solid #dddddd;' : '';
      return (
        `<tr><td style="padding:18px 0;${rule}">` +
        `<p style="margin:0 0 8px;${FONT}font-size:15px;font-weight:bold;color:#333333;">${escapeHtml(label)}</p>` +
        `<p style="margin:0;${FONT}font-size:15px;line-height:1.5;color:#555555;">${valueHtml(key, lines, lead[key] ?? '')}</p>` +
        '</td></tr>'
      );
    })
    .join('');

  const page = filled(lead.page_url)
    ? `<a href="${escapeHtml(lead.page_url)}" style="color:#888888;">${escapeHtml(lead.page_url)}</a>`
    : NOT_SUPPLIED;

  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#e9eaec;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9eaec;">' +
    '<tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">' +
    '<tr><td align="center" style="background:#ffffff;padding:28px 24px;">' +
    `<img src="${LOGO_URL}" width="420" alt="Evergreen Commercial Cleaning &amp; Janitorial" ` +
    'style="display:block;width:100%;max-width:420px;height:auto;border:0;">' +
    '</td></tr>' +
    '<tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>' +
    '<tr><td style="background:#ffffff;border:1px solid #dddddd;border-top:3px solid #cccccc;padding:12px 30px;">' +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>` +
    '</td></tr>' +
    `<tr><td style="padding:16px 4px 0;${FONT}font-size:12px;line-height:1.6;color:#888888;">` +
    `Sent from ${page}<br>${escapeHtml(formatSentAt(sentAt))}` +
    '</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
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
    to: recipientList(to),
    subject: `New proposal request — ${lead.full_name}`,
    text: notificationText(lead, sentAt),
    html: notificationHtml(lead, sentAt),
  };

  const email = (lead.work_email ?? '').trim();
  if (email && looksLikeEmail(email)) payload.reply_to = email;

  return payload;
}

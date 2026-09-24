/**
 * The lead body, normalised — every field the Worker will insert, derived
 * from a request body that came off the public internet.
 *
 * Split out of `worker.ts` so it can be tested without a Workers runtime, a
 * database or a captcha provider. Every value that reaches Neon or the
 * notification email passes through here, which is also why the length limits
 * live here rather than being repeated at each call site.
 *
 * Nothing in here trusts the body. `utm_campaign` in particular is whatever
 * the last person to build a link decided it should be, and it ends up in a
 * database column and in an email a human reads.
 */

/** Trim, cap, and refuse anything that is not a string. */
export const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

/**
 * An affirmative, and only an affirmative.
 *
 * A checkbox posts nothing when it is unticked, so `undefined` is the common
 * case and must read as NO. Everything else is an allowlist rather than a
 * truthiness test: `Boolean("false")` is `true`, and that one line of
 * JavaScript would turn every declined consent into a granted one.
 */
export const isYes = (v: unknown): boolean =>
  v === true || (typeof v === 'string' && ['true', 'yes', 'on', '1'].includes(v.trim().toLowerCase()));

/**
 * The same, with control characters and markup-shaped characters removed.
 *
 * Applied to every attribution field, because those come from a query string
 * an advertiser — or anyone at all — composed, and they are read back by
 * people in a notification email and in whatever the client uses to look at
 * the table. The client already sanitises on the way in; this is the half
 * that does not depend on the client being ours.
 */
export const safeStr = (v: unknown, max: number): string =>
  str(v, max)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/**
 * An ISO timestamp, or null.
 *
 * `touch_at` and `first_touch_at` are TIMESTAMPTZ columns. A visitor with a
 * badly set clock, or anyone posting by hand, can send anything; an
 * unparseable value would fail the whole insert and lose the lead over a
 * field nobody would have missed. A date more than a day in the future is a
 * broken clock, not a touch, and is dropped the same way.
 */
export function isoOrNull(v: unknown, now: Date = new Date()): string | null {
  const raw = str(v, 40);
  if (!raw) return null;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return null;
  if (ms > now.getTime() + 24 * 60 * 60 * 1000) return null;
  return new Date(ms).toISOString();
}

/** Deliberately permissive: a shape check, not an attempt to validate email. */
export const looksLikeEmail = (v: string): boolean => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v);

/**
 * Deliberately permissive too: at least seven digits, however they are
 * written.
 *
 * Seven is the length of a local number without an area code. Anything
 * stricter rejects real numbers — extensions, "+1 (416) 803-4880", a number
 * typed with spaces where someone's keyboard put them — and a lead refused
 * because a regex disliked its punctuation is a lead lost to nothing.
 */
export const looksLikePhone = (v: string): boolean => (v.match(/\d/g) ?? []).length >= 7;

/** The honeypot names in use across the site's three forms. */
export const HONEYPOT_FIELDS = ['company_tax_id', 'company-website', 'website_trap'] as const;

export const isHoneypotHit = (body: Record<string, unknown>): boolean =>
  HONEYPOT_FIELDS.some((name) => Boolean(str(body[name], 200)));

export interface Lead {
  form_id: string;
  full_name: string;
  work_email: string;
  phone: string;
  facility_size: string;
  facility_type: string;
  business_name: string;
  address: string;
  /** Province of the building to be cleaned. Added with the reference field set. */
  province: string;
  services: string;
  message: string;
  page_url: string;

  /**
   * Express consent to marketing email, and the exact wording it was given
   * against. Both, because CASL puts the burden of proof on the sender and
   * "they ticked a box" is not a defence without the box's words.
   */
  marketing_consent: boolean;
  consent_text: string;

  /* latest touch — the click that produced this enquiry */
  gclid: string;
  gbraid: string;
  wbraid: string;
  msclkid: string;
  gad_source: string;
  gclsrc: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  utm_id: string;
  landing_page: string;
  referrer: string;
  touch_at: string | null;

  /* first touch — what introduced this customer */
  first_gclid: string;
  first_msclkid: string;
  first_utm_source: string;
  first_utm_medium: string;
  first_utm_campaign: string;
  first_landing_page: string;
  first_referrer: string;
  first_touch_at: string | null;
}

export function normalizeLead(body: Record<string, unknown>, now: Date = new Date()): Lead {
  return {
    form_id: str(body.form_id, 64) || 'ppc-lead-form',
    full_name: str(body.name ?? body.fullName, 120),
    work_email: str(body.email ?? body.workEmail, 200),
    phone: str(body.phone, 40),
    facility_size: str(body.size ?? body.facilitySize, 64),
    facility_type: str(body.facility_type, 120),
    business_name: str(body.business_name, 200),
    address: str(body.address, 400),
    province: str(body.province, 100),
    services: str(body.services, 400),
    message: str(body.message, 4000),
    page_url: safeStr(body.page_url, 500),

    /* Only a real affirmative counts. A checkbox that was never touched sends
       nothing at all, and an absent value must read as "no" rather than as
       "unknown" — under CASL the default is no consent. */
    marketing_consent: isYes(body.marketing_consent),
    /* Kept only when they actually agreed; storing the wording beside a `false`
       would suggest a record of something that did not happen. */
    consent_text: isYes(body.marketing_consent) ? str(body.consent_text, 500) : '',

    gclid: safeStr(body.gclid, 256),
    gbraid: safeStr(body.gbraid, 256),
    wbraid: safeStr(body.wbraid, 256),
    msclkid: safeStr(body.msclkid, 256),
    gad_source: safeStr(body.gad_source, 32),
    gclsrc: safeStr(body.gclsrc, 32),
    utm_source: safeStr(body.utm_source, 150),
    utm_medium: safeStr(body.utm_medium, 150),
    utm_campaign: safeStr(body.utm_campaign, 200),
    utm_term: safeStr(body.utm_term, 200),
    utm_content: safeStr(body.utm_content, 200),
    utm_id: safeStr(body.utm_id, 150),
    landing_page: safeStr(body.landing_page, 500),
    referrer: safeStr(body.referrer, 500),
    touch_at: isoOrNull(body.touch_at, now),

    first_gclid: safeStr(body.first_gclid, 256),
    first_msclkid: safeStr(body.first_msclkid, 256),
    first_utm_source: safeStr(body.first_utm_source, 150),
    first_utm_medium: safeStr(body.first_utm_medium, 150),
    first_utm_campaign: safeStr(body.first_utm_campaign, 200),
    first_landing_page: safeStr(body.first_landing_page, 500),
    first_referrer: safeStr(body.first_referrer, 500),
    first_touch_at: isoOrNull(body.first_touch_at, now),
  };
}

/**
 * What a lead cannot be accepted without.
 *
 * A name, and a way to reply. It used to be name AND email AND phone, all
 * three, which meant a visitor who only wanted to be called was refused
 * unless they also surrendered an email address — and one who only wanted to
 * be emailed had to invent a phone number. The short quote form removes that
 * on the page; this is the same rule on the server, so the endpoint agrees
 * with the form rather than quietly disagreeing with it.
 */
export const REQUIRED_FIELDS = ['full_name'] as const;

/**
 * Every reason this body cannot become a lead, as field names a client can
 * act on. Empty means it can.
 *
 * `contact` is the cross-field rule: phone or email, at least one. An address
 * is NOT required and never was on the server; the long form made it required
 * in the browser only.
 */
export function leadProblems(lead: Lead): string[] {
  const problems: string[] = REQUIRED_FIELDS.filter((key) => !lead[key]);

  /* A supplied contact method has to be a plausible one. An absent one is
     fine as long as the other is there — that is the whole point. */
  if (lead.work_email && !looksLikeEmail(lead.work_email)) problems.push('work_email');
  if (lead.phone && !looksLikePhone(lead.phone)) problems.push('phone');

  const hasEmail = Boolean(lead.work_email) && looksLikeEmail(lead.work_email);
  const hasPhone = Boolean(lead.phone) && looksLikePhone(lead.phone);
  if (!hasEmail && !hasPhone) problems.push('contact');

  return problems;
}

/** Kept for callers that only want the absent-and-mandatory list. */
export const missingFields = (lead: Lead): string[] =>
  REQUIRED_FIELDS.filter((key) => !lead[key]);

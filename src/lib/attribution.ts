/**
 * First-touch and latest-touch attribution.
 *
 * WHAT IT IS FOR. A visitor arrives on an ad, reads three pages, and submits
 * the form from `/contact-us/`. Before this, the form read `?gclid=` off
 * `location.search` at the moment of submission — which by then is empty, so
 * the lead arrived with no click id and Google Ads could not match it to the
 * click that paid for it. Every multi-page visit was attributed to nothing.
 *
 * It keeps two touches, because they answer different questions:
 *
 *   FIRST  what introduced this person to the business. Never overwritten.
 *   LAST   which click produced this enquiry. Updated by every later campaign
 *          arrival, and by nothing else.
 *
 * Direct and internal navigation update neither. That is the rule that makes
 * first-touch mean anything: a visitor who arrives on an ad, leaves, and comes
 * back by typing the address must not have the ad erased by their own return.
 *
 * ---------------------------------------------------------------------------
 * RETENTION, AND THE DECISION THAT IS NOT MINE TO MAKE
 *
 * This store defaults to `sessionStorage` — it lives for one browsing session
 * in one tab and is gone when the tab closes. That covers the case this exists
 * for (a visit that spans several pages) and it is not a marketing identifier
 * store: nothing outlives the visit, so there is nothing to disclose, retain
 * or offer a choice about.
 *
 * Being clear about what that does and does not deliver: it gives attribution
 * that survives internal navigation within one tab. It is NOT 90-day
 * cross-visit attribution, and it should not be described as such.
 *
 * A 90-day cross-visit store IS implemented, and is OFF. Switching `MODE` to
 * 'persistent' moves the record to `localStorage` with a 90-day TTL, which is
 * a materially different thing: advertising click identifiers, kept on a
 * person's device for three months, for marketing measurement.
 *
 * Three things are unresolved, and none of them is a developer's call:
 *
 *   - the site has no consent mechanism of any kind;
 *   - Google Consent Mode v2 is not configured;
 *   - `/privacy/` is still the inherited WordPress boilerplate. It describes
 *     login and comment cookies this static site does not set, and says
 *     nothing about advertising identifiers.
 *
 * That kind of processing is what Canadian privacy law (PIPEDA) and the
 * site's own policy are likely to have something to say about. **This is not
 * legal advice and no lawyer has reviewed it.** The switch stays off until
 * the site's consent and privacy requirements have been confirmed by someone
 * qualified to confirm them. See README.md and the Phase 3 report.
 * ---------------------------------------------------------------------------
 */

/** 'session' — one visit, no consent question. 'persistent' — 90 days. */
export type RetentionMode = 'session' | 'persistent';

/** The default, and deliberately not configurable from the page. */
export const MODE: RetentionMode = 'session';

/** Only consulted in 'persistent' mode. */
export const PERSISTENT_DAYS = 90;

export const STORAGE_KEY = 'ecs_attr_v1';

/** Google's click identifiers, plus the source parameter it now also sends. */
export const GOOGLE_PARAMS = ['gclid', 'gbraid', 'wbraid', 'gad_source', 'gclsrc'] as const;
/** Microsoft Advertising's. */
export const MICROSOFT_PARAMS = ['msclkid'] as const;
export const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
] as const;

export const CAMPAIGN_PARAMS = [
  ...GOOGLE_PARAMS,
  ...MICROSOFT_PARAMS,
  ...UTM_PARAMS,
] as const;

/**
 * A parameter present but empty (`?gclid=`) is not a campaign arrival, and
 * neither is a utm_term on its own. These are the ones that mean "an ad
 * network sent this visitor".
 */
const CAMPAIGN_SIGNALS = [
  ...GOOGLE_PARAMS,
  ...MICROSOFT_PARAMS,
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_id',
] as const;

export type Touch = Record<string, string> & {
  landing_page: string;
  referrer: string;
  ts: string;
};

export interface AttributionRecord {
  v: 1;
  first: Touch;
  last: Touch;
}

/** Per-field ceilings. Anything longer is truncated, never rejected. */
const LIMITS: Record<string, number> = {
  gclid: 256,
  gbraid: 256,
  wbraid: 256,
  msclkid: 256,
  gad_source: 32,
  gclsrc: 32,
  utm_source: 150,
  utm_medium: 150,
  utm_campaign: 200,
  utm_term: 200,
  utm_content: 200,
  utm_id: 150,
  landing_page: 500,
  referrer: 500,
};

/**
 * Make a value safe to store, to post, to insert and to put in an email.
 *
 * Query strings are attacker-controlled: anyone can send a visitor to this
 * site with whatever they like in `utm_campaign`, and that value ends up in
 * the database and in the notification email to the client. Control
 * characters are stripped because they corrupt a log line or an email header;
 * angle brackets and quotes because the value is read by people in contexts
 * that may render it. Nothing here is a substitute for escaping at the point
 * of use — it is the belt.
 */
export function clean(value: unknown, max = 200): string {
  if (typeof value !== 'string') return '';
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** The referrer, unless it is this site — internal links are not referrals. */
export function externalReferrer(referrer: string, ownOrigin: string): string {
  if (!referrer) return '';
  try {
    if (new URL(referrer).origin === new URL(ownOrigin).origin) return '';
  } catch {
    return '';
  }
  return clean(referrer, LIMITS.referrer);
}

/** Path and query only. The origin is ours and adds nothing but length. */
function landingPage(url: URL): string {
  return clean(url.pathname + url.search, LIMITS.landing_page);
}

/** Build the touch this page load represents. */
export function readTouch(href: string, referrer: string, now: Date): Touch {
  const url = new URL(href);
  const touch: Touch = {
    landing_page: landingPage(url),
    referrer: externalReferrer(referrer, url.origin),
    ts: now.toISOString(),
  };
  for (const key of CAMPAIGN_PARAMS) {
    const value = clean(url.searchParams.get(key), LIMITS[key] ?? 200);
    if (value) touch[key] = value;
  }
  return touch;
}

/** Did an ad network send this visitor? */
export const isCampaignTouch = (touch: Touch): boolean =>
  CAMPAIGN_SIGNALS.some((key) => Boolean(touch[key]));

const ttlMs = (mode: RetentionMode) =>
  mode === 'persistent' ? PERSISTENT_DAYS * 24 * 60 * 60 * 1000 : Number.POSITIVE_INFINITY;

/**
 * The backing store.
 *
 * Every access is wrapped: private browsing, blocked site data and a storage
 * quota all throw rather than returning nothing, and an attribution record is
 * never important enough to break a page over.
 */
function store(mode: RetentionMode): Storage | null {
  try {
    return mode === 'persistent' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readAttribution(
  now: Date = new Date(),
  mode: RetentionMode = MODE
): AttributionRecord | null {
  const storage = store(mode);
  if (!storage) return null;

  let parsed: unknown;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    /* Corrupt, or unreadable. Treat it as absent rather than as a failure —
       the next campaign arrival overwrites it. */
    return null;
  }

  const record = parsed as Partial<AttributionRecord>;
  if (!record || record.v !== 1 || !record.first?.ts || !record.last?.ts) return null;

  const started = Date.parse(record.first.ts);
  if (Number.isNaN(started)) return null;
  if (now.getTime() - started > ttlMs(mode)) {
    /* Expired. Clear it so a stale click id can never be attached to a lead
       three months after the click that it names. */
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to do, and nothing worth failing a page load over */
    }
    return null;
  }
  return record as AttributionRecord;
}

function write(record: AttributionRecord, mode: RetentionMode): void {
  const storage = store(mode);
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* quota, or a private window. */
  }
}

/**
 * Record this page load. Called once per page, from both layouts.
 *
 * - nothing stored yet  → this touch becomes first and last, campaign or not,
 *                         so an organic or direct first visit still keeps its
 *                         referrer and landing page.
 * - stored, campaign    → last is replaced. First is never touched.
 * - stored, not campaign→ nothing is written. This is what makes attribution
 *                         survive internal navigation.
 */
export function recordTouch(
  href: string = typeof location !== 'undefined' ? location.href : '',
  referrer: string = typeof document !== 'undefined' ? document.referrer : '',
  now: Date = new Date(),
  mode: RetentionMode = MODE
): AttributionRecord | null {
  if (!href) return null;
  const touch = readTouch(href, referrer, now);
  const existing = readAttribution(now, mode);

  if (!existing) {
    const record: AttributionRecord = { v: 1, first: touch, last: touch };
    write(record, mode);
    return record;
  }

  if (!isCampaignTouch(touch)) return existing;

  const record: AttributionRecord = { v: 1, first: existing.first, last: touch };
  write(record, mode);
  return record;
}

/**
 * Flatten the record into the POST body.
 *
 * Last-touch keeps the unprefixed names the `leads` table already uses, so
 * `gclid` and `utm_source` go on meaning what they have always meant: the
 * click that produced this enquiry. First-touch is prefixed.
 */
export function attributionPayload(
  now: Date = new Date(),
  mode: RetentionMode = MODE
): Record<string, string> {
  const record = readAttribution(now, mode);
  if (!record) return {};

  const out: Record<string, string> = {};
  for (const key of CAMPAIGN_PARAMS) if (record.last[key]) out[key] = record.last[key];
  out.landing_page = record.last.landing_page;
  out.referrer = record.last.referrer;
  out.touch_at = record.last.ts;

  const first = record.first;
  for (const key of ['gclid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign'] as const) {
    if (first[key]) out[`first_${key}`] = first[key];
  }
  out.first_landing_page = first.landing_page;
  out.first_referrer = first.referrer;
  out.first_touch_at = first.ts;

  for (const key of Object.keys(out)) if (!out[key]) delete out[key];
  return out;
}

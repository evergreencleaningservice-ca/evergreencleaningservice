/**
 * What the paid landing pages are allowed to say.
 *
 * Both pages read from here rather than each carrying its own copy, because
 * the two had already drifted: one said "WSIB compliant & bonded", the other
 * "WSIB Ontario — Registered and in good standing"; one listed four
 * differentiators, the other four different ones; one had five facility types,
 * the other five slightly different ones. Two pages selling the same service
 * to the same city should not disagree about what the business does.
 *
 * EVERY CLAIM BELOW IS ONE THE SITE ALREADY MAKES AND CAN SUPPORT. That is the
 * standing rule from Phase 7, which had to remove an invented "4.9/5 Google
 * Rating" from both of these pages, and from Phase 9, which held the quote
 * page's sidebar to the same line. Specifically there is:
 *
 *   no numeric rating and no review count   — four recovered Google reviews,
 *                                             no verified aggregate
 *   no certification beyond WSIB and bonded — both are the client's own words
 *   no guarantee                            — "100% Privacy Protected" and
 *                                             "No spam, ever" were guarantees
 *                                             and are gone
 *   no invented customer count              — nobody has one
 *   no claim of a service not on the site
 *
 * TWO THINGS THAT LOOK LIKE EXCEPTIONS AND ARE NOT:
 *
 *   "Serving Toronto since 1989" is on the homepage, /about-us/ and the
 *   service pages. It is the founding year, not a computed duration, so it
 *   does not go stale and does not need to be right every January.
 *
 *   "A reply as soon as possible" is the reply promise. Until 2026-09-30 it
 *   was "within 2 business hours", which the landing pages carried since
 *   Phase 3; the client asked for it to name no time. It is stated once here
 *   rather than three times in three wordings. The same day, the quote page
 *   alone was given "within 2 hours" for its Google Ads — see QUOTE_* at the
 *   foot of this file. "Same-day walkthrough" —
 *   which the quote page's submit button used to promise — is gone, because
 *   nobody has committed to it.
 */

/** The reasons to choose this business, as the site states them. */
export const BENEFITS = [
  {
    title: 'WSIB covered, bonded and insured',
    body: 'Full commercial liability cover, and crews vetted before they hold a key to your building.',
  },
  {
    title: 'After hours and weekends',
    body: 'Cleaning scheduled around your operating hours, so nobody works around us.',
  },
  {
    title: 'The same crew every visit',
    body: 'A dedicated team and one account executive who knows your building, not a rota of strangers.',
  },
  {
    title: 'A free on-site walkthrough',
    body: 'We scope the work in your space rather than pricing it down the phone.',
  },
] as const;

/** The property types the business cleans, in the words the service pages use. */
export const FACILITY_TYPES = [
  { title: 'Offices', body: 'Corporate floors, professional suites and multi-tenant buildings.' },
  { title: 'Medical and dental clinics', body: 'Treatment rooms, waiting areas and washrooms.' },
  { title: 'Industrial and warehouse', body: 'Production floors, loading areas and staff facilities.' },
  { title: 'Retail and showrooms', body: 'Sales floors, glass, entrances and back of house.' },
  { title: 'Post-construction', body: 'Renovation and build-out clean-up before handover.' },
  { title: 'Building maintenance', body: 'Carpet, hard floors, pressure washing and periodic work.' },
] as const;

/**
 * The trust line. Four points, each verifiable, and none of them a number
 * somebody would have to defend.
 */
export const TRUST_POINTS = [
  'Serving Toronto since 1989',
  'WSIB covered and bonded',
  'A reply as soon as possible',
  'No obligation',
] as const;

/**
 * Where the crews go. Plain text, not links — a paid landing page that links
 * out to ten location pages is a paid landing page a visitor leaves.
 */
export const SERVICE_AREA_LINE =
  'Toronto, North York, Scarborough, Etobicoke, East York and York, plus Mississauga, ' +
  'Vaughan, Markham, Brampton, Richmond Hill and Oakville.';

/** The reply promise, written once. */
export const REPLY_PROMISE = 'as soon as possible';

/* ---------------------------------------------------------------------------
 * THE QUOTE PAGE'S OWN COPY — /lp/commercial-cleaning-quote/ only.
 *
 * Source: "Evergreen Landing Page — Copy Changes" (Paolo Leone, 2026-09-30),
 * six edits so the page matches the new Google Ads. The ads quote this text
 * and Google checks the page against them, so every string below is the
 * document's wording exactly — do not tidy it.
 *
 * It overrides the shared copy above on that page only. The sibling,
 * /lp/commercial-cleaning/, still promises a reply "as soon as possible" and
 * lists the shorter service area; the document named the quote page and no
 * other. The offer (first month free, from $30/hr, 30 days' notice) and the
 * two-hour reply are the client's commitments as stated in that document,
 * not claims recovered from the old site.
 * ------------------------------------------------------------------------- */

/** The quote page's reply promise. */
export const QUOTE_REPLY_PROMISE = 'within 2 hours';

/** Hero bullets: the shared four with the reply reworded, then the offer. */
export const QUOTE_TRUST_POINTS = [
  'Serving Toronto since 1989',
  'WSIB covered and bonded',
  `We reply ${QUOTE_REPLY_PROMISE}`,
  'No obligation',
  'First month free on a signed recurring contract',
  'From $30/hr, supplies and equipment included',
  "Cancel anytime with 30 days' notice",
] as const;

/** The closing section's reply line. */
export const QUOTE_FINAL_REPLY = `We reply ${QUOTE_REPLY_PROMISE}`;

/** "Where we work", with the three Durham towns the ads now cover. */
export const QUOTE_SERVICE_AREA_LINE =
  'Toronto, North York, Scarborough, Etobicoke, East York and York, plus Mississauga, ' +
  'Vaughan, Markham, Brampton, Richmond Hill, Oakville, Pickering, Ajax and Oshawa.';

/** Under the submit button. The number itself comes from `nap`. */
export const QUOTE_EMERGENCY = {
  before: 'Emergency cleaning? Call',
  after: "and leave a message. We'll get back to you quickly.",
} as const;

/** Footer small print, above the copyright line. Qualifies the offer bullets. */
export const QUOTE_FINE_PRINT =
  'First month free applies to new clients on a signed monthly or recurring cleaning contract. ' +
  "Starting rate of $30/hr varies by scope. Cancellation requires 30 days' notice.";

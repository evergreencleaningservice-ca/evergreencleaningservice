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
 *   "A reply within 2 business hours" is the promise both landing pages have
 *   carried since Phase 3 and which /request-a-quote/ adopted in Phase 9. It
 *   is pre-existing and is stated once here rather than three times in three
 *   wordings. Nothing faster is claimed anywhere, and "same-day walkthrough" —
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
  'A reply within 2 business hours',
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
export const REPLY_PROMISE = 'within 2 business hours';

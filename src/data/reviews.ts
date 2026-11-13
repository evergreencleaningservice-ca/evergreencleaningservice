/**
 * The Google reviews the original shows in its Trustindex widget.
 *
 * The widget is a third-party script, so at first glance the reviews look
 * unrecoverable — but the Trustindex WordPress plugin writes the whole widget
 * into the page inside `<template id="trustindex-google-widget-html">` and lets
 * its script hydrate from there. The archive captured that template, so every
 * review below is the real one: name, date, rating and full text, taken from
 * it rather than retyped. Avatars are rendered as initials, not photos.
 *
 * Widget settings, from the template's own attributes:
 *   data-layout-category="slider"   ti-col-3   data-review-target-width="300"
 *   data-pager-autoplay-timeout="6" data-review-text-mode="readmore"
 *   ti-text-align-left              data-set-id="light-background"
 */
export interface Review {
  name: string;
  /** ISO date. The card shows its month ("May 2021"), not an age; see
      `reviewDate` below. Also the sort key on /reviews/. */
  date: string;
  /**
   * Set when Google gave only a relative age, so `date` is a reconstruction
   * rather than the day the review was left. 'month' means the month is about
   * right; 'year' means only the year is. The card then says "around ...",
   * and `datetime` carries no more precision than is known.
   */
  approx?: 'month' | 'year';
  rating: number;
  /** Trustindex marks each of these as verified against Google. */
  verified: boolean;
  text: string;
}

export const reviews: Review[] = [
  /* Added 2026-10-29 from the Google Business Profile's own review list,
     newest first: the archive's four were all from 2020-2021. Text is
     verbatim. Google shows these three only as a relative age, so none of
     their dates is a known day; each `date` was worked back from the age
     Google gave on 2026-10-29 and is marked approximate (2026-11-06, SEO
     audit item 31). Christopher Perera: "8 weeks ago", which covers 56 to 62
     days, so 2026-08-28 to 2026-09-03; `date` is the last day of that window,
     the card says "around September 2026", and it may be late August. Andy
     Handy: "9 months ago", which pins the month only roughly. av-ev: "a year
     ago", which on Google covers anything from 12 to 23 months, so only the
     year is claimed. */
  {
    name: 'Christopher Perera',
    date: '2026-09-03',
    approx: 'month',
    rating: 5,
    verified: true,
    text: 'Very reliable. Great service',
  },
  {
    name: 'Andy Handy',
    date: '2026-01-15',
    approx: 'month',
    rating: 5,
    verified: true,
    text: 'Excellent service at a very good price.',
  },
  {
    name: 'av-ev',
    date: '2025-07-04',
    approx: 'year',
    rating: 5,
    verified: true,
    text: 'They do the regular maintenance of our office space. Great company, very professional and quality services. Highly recommend.',
  },
  {
    name: 'Mark Post',
    date: '2021-05-31',
    rating: 5,
    verified: true,
    text: "I’d like to thank you for scheduling our cleaning so quickly. Your cleaner just finished and I'm very happy with the service and will definitely recommend Evergreen to my business network.",
  },
  {
    name: 'Edward Sherman',
    date: '2021-05-26',
    rating: 5,
    verified: true,
    text: "I highly recommend Art and the team at Evergreen Cleaning Service. I especially appreciate the personal service I get and wanted to express my appreciation for the team that's been cleaning our offices for the past 3 years.",
  },
  {
    name: 'Michael Katchen',
    date: '2021-05-20',
    rating: 5,
    verified: true,
    text: "I'm in the property management business and Evergreen Cleaning Services always comes through when I'm working within a tight schedule and need office cleaning or additional 'one off' services in a pinch. They also service a few of my clients for commercial and office cleaning and I'm happy to refer them. I especially appreciate having direct contact with the owner.",
  },
  {
    name: 'Ping Lee',
    date: '2020-10-05',
    rating: 5,
    verified: true,
    text: 'Thanks for fitting us in for the deep clean. Your staff did a terrific job and our manager is impressed. Will be in touch for follow up and regular cleaning service contract. Thanks again',
  },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface ReviewDate {
  /** For `<time datetime>`: YYYY-MM-DD, or YYYY-MM / YYYY when approximate. */
  datetime: string;
  /** What the visitor reads: "May 2021", or "around January 2026". */
  label: string;
}

/**
 * The review's date as a month and year. This replaced a build-time
 * "N months ago" on 2026-11-06 (SEO audit item 31): an age is only right on
 * the day the site is built, and between builds it drifts and understates
 * how old a review is. A month stays true.
 *
 * Read from the ISO string itself rather than through `Date`, so the month
 * cannot shift with the build machine's time zone.
 */
export function reviewDate(review: Pick<Review, 'date' | 'approx'>): ReviewDate {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(review.date);
  if (!m) throw new Error(`reviews: "${review.date}" is not a YYYY-MM-DD date`);
  const [, year, month] = m;
  const name = MONTHS[Number(month) - 1];
  if (!name) throw new Error(`reviews: "${review.date}" has no month ${month}`);

  if (review.approx === 'year') return { datetime: year, label: `around ${year}` };
  if (review.approx === 'month') {
    return { datetime: `${year}-${month}`, label: `around ${name} ${year}` };
  }
  return { datetime: review.date, label: `${name} ${year}` };
}

/**
 * The Google Business Profile's own star rating and review count, for the
 * rating strip at the top of every page and the home hero's proof row.
 *
 * 13 Nov 2026 (comparison with impact.ca, report items 1 and 7): a
 * competitor shows its Google review count on every page. We show ours only
 * as Google shows it, and we have not yet copied it from the profile, so the
 * record is `undefined` and nothing renders: no strip, no hero item, no
 * empty wrapper. The seven reviews above are not a substitute: they are the
 * ones the old widget carried plus three added by hand, not the profile's
 * full count, and an average of them would be a number Google never showed.
 *
 * THE RULE. Copy `rating` and `count` from the Google Business Profile
 * itself (the listing at `nap.mapUrl` in src/data/site.ts), exactly as it
 * shows them on the day, and set `checkedAt` to that day. `url` is the
 * profile a visitor should land on; `nap.mapUrl` is the listing. Re-check
 * and update all four together: a rating with an old `checkedAt` is a
 * stale claim.
 *
 * Never turn this into `aggregateRating` JSON-LD: Google ignores
 * self-serving ratings of a business on its own site and treats invented
 * ones as spam. tests/build/home-proof-faq.test.ts fails on any
 * `aggregateRating` in the build.
 */
export interface GoogleProfileRating {
  /** The star average as the profile shows it, e.g. 4.9. */
  rating: number;
  /** The number of reviews the profile shows. */
  count: number;
  /** ISO date (YYYY-MM-DD) the two figures were copied from the profile. */
  checkedAt: string;
  /** The Google Business Profile URL the strip links to. */
  url: string;
}

export const googleProfile: GoogleProfileRating | undefined = undefined;

export interface GoogleRatingDisplay {
  /** What the visitor reads: "★ 4.9 on Google · 12 reviews". */
  label: string;
  /** The same without the star, which the components print aria-hidden so
      the link's accessible name is the visible words (WCAG 2.5.3). */
  text: string;
  href: string;
  checkedAt: string;
}

/**
 * The rating as the strip and the hero print it, or `undefined` when there
 * is no record, which is the gate both components check. A pure function so
 * the gate can be tested both ways with a fictional fixture without setting
 * a real figure. A malformed record throws, so the build fails rather than
 * printing a wrong number.
 */
export function googleRatingDisplay(
  profile: GoogleProfileRating | undefined
): GoogleRatingDisplay | undefined {
  if (!profile) return undefined;
  const { rating, count, checkedAt, url } = profile;
  if (!(rating >= 1 && rating <= 5)) throw new Error(`reviews: Google rating ${rating} is not 1–5`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`reviews: Google review count ${count} is not a positive whole number`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) throw new Error(`reviews: checkedAt "${checkedAt}" is not YYYY-MM-DD`);
  if (!/^https:\/\//.test(url)) throw new Error(`reviews: Google profile URL "${url}" is not https`);
  const stars = rating.toFixed(1);
  const reviewsWord = count === 1 ? 'review' : 'reviews';
  const text = `${stars} on Google · ${count} ${reviewsWord}`;
  return {
    label: `★ ${text}`,
    text,
    href: url,
    checkedAt,
  };
}

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
     verbatim. Google shows only a relative age ("8 weeks ago"), so the two
     dates without an exact day are approximate. On 2026-10-29 Google said
     "9 months ago" for Andy Handy, which pins the month, and "a year ago"
     for av-ev, which on Google covers anything from 12 to 23 months, so only
     the year is claimed for that one (2026-11-06, SEO audit item 31). */
  {
    name: 'Christopher Perera',
    date: '2026-09-03',
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

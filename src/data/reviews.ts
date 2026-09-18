/**
 * The Google reviews the original shows in its Trustindex widget.
 *
 * The widget is a third-party script, so at first glance the reviews look
 * unrecoverable — but the Trustindex WordPress plugin writes the whole widget
 * into the page inside `<template id="trustindex-google-widget-html">` and lets
 * its script hydrate from there. The archive captured that template, so every
 * review below is the real one: name, date, rating and full text, taken from
 * it rather than retyped. The avatars came from the Google URLs in the same
 * template and are served from this site.
 *
 * Widget settings, from the template's own attributes:
 *   data-layout-category="slider"   ti-col-3   data-review-target-width="300"
 *   data-pager-autoplay-timeout="6" data-review-text-mode="readmore"
 *   ti-text-align-left              data-set-id="light-background"
 */
export interface Review {
  name: string;
  /** ISO date from the widget; the card shows this as "N years ago". */
  date: string;
  avatar: string;
  rating: number;
  /** Trustindex marks each of these as verified against Google. */
  verified: boolean;
  text: string;
}

export const reviews: Review[] = [
  {
    name: 'Mark Post',
    date: '2021-05-31',
    avatar: '/images/reviews/mark-post.png',
    rating: 5,
    verified: true,
    text: "I’d like to thank you for scheduling our cleaning so quickly. Your cleaner just finished and I'm very happy with the service and will definitely recommend Evergreen to my business network.",
  },
  {
    name: 'Edward Sherman',
    date: '2021-05-26',
    avatar: '/images/reviews/edward-sherman.png',
    rating: 5,
    verified: true,
    text: "I highly recommend Art and the team at Evergreen Cleaning Service. I especially appreciate the personal service I get and wanted to express my appreciation for the team that's been cleaning our offices for the past 3 years.",
  },
  {
    name: 'Michael Katchen',
    date: '2021-05-20',
    avatar: '/images/reviews/michael-katchen.png',
    rating: 5,
    verified: true,
    text: "I'm in the property management business and Evergreen Cleaning Services always comes through when I'm working within a tight schedule and need office cleaning or additional 'one off' services in a pinch. They also service a few of my clients for commercial and office cleaning and I'm happy to refer them. I especially appreciate having direct contact with the owner.",
  },
  {
    name: 'Ping Lee',
    date: '2020-10-05',
    avatar: '/images/reviews/ping-lee.png',
    rating: 5,
    verified: true,
    text: 'Thanks for fitting us in for the deep clean. Your staff did a terrific job and our manager is impressed. Will be in touch for follow up and regular cleaning service contract. Thanks again',
  },
];

/**
 * "5 years ago", the way the widget writes it. Worked out at build time, so it
 * stays right as the site is rebuilt rather than freezing at whatever it said
 * when these were captured.
 */
export function relativeAge(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const months =
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth()) -
    (now.getDate() < then.getDate() ? 1 : 0);

  if (months < 1) return 'a month ago';
  if (months < 12) return months === 1 ? 'a month ago' : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'a year ago' : `${years} years ago`;
}

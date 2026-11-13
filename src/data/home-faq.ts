/**
 * The homepage's short FAQ: six questions a commercial buyer asks before
 * calling.
 *
 * 13 Nov 2026 (comparison with impact.ca, report item 8): the homepage
 * answered none of these where a buyer looks for them; each lived on a
 * service page or a guide. Every answer below is a shortened restatement of
 * something the site already publishes, and names its source, so nothing
 * here is a new claim. Each ends with a link to the page that covers it in
 * depth.
 *
 * No FAQPage JSON-LD on the homepage: Google shows FAQ rich results for very
 * few sites now, and the comparison counted the existing FAQPage markup as
 * dead weight. tests/build/home-proof-faq.test.ts pins the questions, checks
 * every link resolves to a built page and that the 2-hour reply is qualified.
 */
import { offerPath } from './offer-pages';
import { REPLY_PROMISE } from './landing';

export interface HomeFaq {
  q: string;
  /** Plain text. */
  a: string;
  /** The page that covers the question in depth. */
  more: { href: string; label: string };
}

export const HOME_FAQS: HomeFaq[] = [
  {
    /* The cost guide's six factors and the office-cleaning FAQ "How is the
       price worked out?". No figure: the site publishes no price for a
       regular office contract, and the guide's numbers are illustrative. */
    q: 'How much does office cleaning cost?',
    a: 'It depends on the work your building needs and how often: the size and layout of the space, how often it is cleaned, the number of washrooms, the floor types, the hours the work must happen in and building access, and who supplies consumables. We price after a free on-site walkthrough, so we look before we quote.',
    more: { href: '/office-cleaning-cost-toronto-guide/', label: 'What drives office cleaning costs' },
  },
  {
    /* The office-cleaning FAQ "Do you clean after hours?"; the commercial
       cleaning page has the section on working after hours. */
    q: 'Do you clean after hours?',
    a: 'Yes. Cleaning is normally done in the evening or overnight after your staff leave, or at weekends, so nobody has to work around the crew.',
    more: { href: offerPath('commercial-cleaning'), label: 'Commercial cleaning after hours' },
  },
  {
    /* The office-cleaning FAQ "Are your cleaners screened and insured?" and
       the About page's answer, which say the same. */
    q: 'Are you insured and bonded?',
    a: 'Yes. The business is bonded and covered by liability insurance and WSIB Ontario, and our cleaning staff undergo background screening.',
    more: { href: '/about-us/', label: 'About Evergreen' },
  },
  {
    /* The office-cleaning FAQ "Which areas do you cover?". */
    q: 'Which areas do you serve?',
    a: 'Toronto (including North York, Scarborough, Etobicoke, East York and York), Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax and Oshawa.',
    more: { href: '/locations/', label: 'Our service areas' },
  },
  {
    /* The office-cleaning page's "Every visit" list and its scope note. */
    q: 'What does a regular office clean include?',
    a: 'On every visit: trash and recycling emptied, carpets vacuumed and hard floors swept and mopped, desks and common surfaces wiped, touch points disinfected, washrooms cleaned and sanitized, and kitchens and break rooms cleaned. The exact task list and how often each task is done are set out in your written proposal after the walkthrough.',
    more: { href: offerPath('office-cleaning'), label: 'Office cleaning services' },
  },
  {
    /* REPLY_PROMISE, the qualified wording used site-wide; the process page
       has the reply as its own step. */
    q: 'How quickly do you reply to a quote request?',
    a: `We reply ${REPLY_PROMISE}, and then arrange a free on-site walkthrough.`,
    more: { href: '/our-process/', label: 'How we work, step by step' },
  },
];

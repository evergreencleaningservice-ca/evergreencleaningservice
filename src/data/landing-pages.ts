/**
 * Data-driven PPC landing pages, rendered by src/pages/lp/[slug].astro.
 *
 * The two original pages (/lp/commercial-cleaning/ and
 * /lp/commercial-cleaning-quote/) stay as their own files: live ads point at
 * them, their copy is fixed by the client's Google Ads document, and their
 * `form_id`s line up with rows already in the leads table. New pages are
 * added HERE, so a new ad group is a data entry, not a new template.
 *
 * Every page: noindex, out of the sitemap (astro.config.mjs filters /lp/),
 * self-canonical, no site navigation (LandingLayout), one short form, the
 * phone number, verified proof, scope, the quote process and FAQs.
 *
 * OFFERS ARE NOT COPIED ACROSS BLINDLY. The first-month-free / from-$30/hr /
 * 30-days'-notice offer is the client's for recurring contracts, with its
 * small print. It appears on the recurring office page with that small
 * print, and NOT on the post-construction page, which is one-off work it
 * cannot apply to.
 */
import { REPLY_PROMISE, TRUST_POINTS, FINE_PRINT } from './landing';

export interface LandingPage {
  slug: string;
  /** Reporting identity: `form_id` on the conversion and in Neon. */
  formId: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  sub: string;
  image: string;
  trust: readonly string[];
  replyPromise: string;
  finePrint?: string;
  formHeading: string;
  reviewHeading: string;
  reviewers: readonly string[];
  benefitsHeading: string;
  benefitsNote: string;
  benefits: readonly { title: string; body: string }[];
  scopeHeading: string;
  scopeNote: string;
  scope: readonly { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  finalHeading: string;
  /** The organic page this campaign page shadows — for documentation only. */
  organicPage: string;
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'office-cleaning',
    formId: 'lp-office-cleaning',
    title: 'Office Cleaning — Toronto & GTA | Evergreen Office Cleaning',
    description:
      'Recurring after-hours office cleaning in Toronto and the GTA. Free walkthrough, written scope, WSIB covered and bonded crews.',
    eyebrow: 'Office cleaning — Toronto & the GTA',
    heading: 'After-hours office cleaning, by the same crew every visit.',
    sub: 'Nightly, weekly or a few times a week — scoped at a free walkthrough, written into a proposal, and run by one account executive you can call.',
    image: 'evergreen-modern-commercial-cleaning-hero',
    trust: TRUST_POINTS,
    replyPromise: REPLY_PROMISE,
    finePrint: FINE_PRINT,
    formHeading: 'Get your free office cleaning quote',
    reviewHeading: 'What office clients say',
    reviewers: ['Edward Sherman', 'Mark Post', 'Michael Katchen'],
    benefitsHeading: 'Why offices choose Evergreen',
    benefitsNote: 'Office cleaning across Toronto and the GTA since 1989.',
    benefits: [
      { title: 'WSIB covered, bonded and insured', body: 'Background-screened staff, liability insurance and WSIB Ontario.' },
      { title: 'After hours and weekends', body: 'Cleaned after your staff leave, so nobody works around us.' },
      { title: 'The same crew every visit', body: 'A team assigned to your office, and one account executive.' },
      { title: 'A free on-site walkthrough', body: 'We scope the work in your space rather than pricing it down the phone.' },
    ],
    scopeHeading: 'What a regular office clean covers',
    scopeNote: 'The exact list and frequency go into your written proposal.',
    scope: [
      { title: 'Desks and common areas', body: 'Workstations, reception, boardrooms and touch points.' },
      { title: 'Washrooms and kitchens', body: 'Cleaned and sanitized; kitchens and break rooms included.' },
      { title: 'Floors', body: 'Vacuuming and mopping; periodic carpet extraction and strip and wax available.' },
      { title: 'Trash and recycling', body: 'Emptied and liners replaced.' },
      { title: 'Glass and detail', body: 'Interior glass and high-touch detail.' },
      { title: 'Extras when you need them', body: 'Deep cleans, high dusting and one-off work.' },
    ],
    faqs: [
      { q: 'How is the price set?', a: 'After a free walkthrough. The size of the office, how often it is cleaned, floor types and the hours the work must happen in all change it. Rates start from $30/hr and vary by scope.' },
      { q: 'Do you bring supplies and equipment?', a: 'Yes. Supplies and equipment are included.' },
      { q: 'Is there a long contract?', a: "Recurring contracts can be cancelled with 30 days' notice." },
      { q: 'Which areas do you cover?', a: 'Toronto, North York, Scarborough, Etobicoke, East York and York, plus Mississauga, Vaughan, Markham, Brampton, Richmond Hill, Oakville, Pickering, Ajax and Oshawa.' },
    ],
    finalHeading: 'Get your office cleaning quote',
    organicPage: '/services/office-cleaning/',
  },
  {
    slug: 'post-construction-cleaning',
    formId: 'lp-post-construction',
    title: 'Post-Construction Cleaning — Toronto & GTA | Evergreen Office Cleaning',
    description:
      'Commercial post-construction and renovation clean-up in Toronto and the GTA, scheduled around your trades and handover date. WSIB covered and bonded.',
    eyebrow: 'Post-construction cleaning — Toronto & the GTA',
    heading: 'Post-construction cleaning, ready for handover.',
    sub: 'Debris, dust and detail cleaning for commercial buildouts and renovations — planned around your trades and your handover or opening date.',
    image: 'evergreen-modern-commercial-cleaning-hero',
    trust: [
      'Serving Toronto since 1989',
      'WSIB covered and bonded',
      'Quoted per project after a site visit',
      'No obligation quote',
    ],
    replyPromise: 'as soon as possible',
    formHeading: 'Get your post-construction quote',
    reviewHeading: 'What clients say',
    reviewers: ['Michael Katchen', 'Ping Lee', 'Mark Post'],
    benefitsHeading: 'Why contractors and property managers call us',
    benefitsNote: 'Commercial cleaning in Toronto and the GTA since 1989.',
    benefits: [
      { title: 'Planned around your trades', body: 'One visit or staged visits as the build progresses.' },
      { title: 'After hours and weekends', body: 'Where the site or the building is in use.' },
      { title: 'WSIB covered, bonded and insured', body: 'Background-screened staff on your site.' },
      { title: 'One point of contact', body: 'An account executive who coordinates the work.' },
    ],
    scopeHeading: 'What the clean covers',
    scopeNote: 'The scope is confirmed at the site visit and written into your quote.',
    scope: [
      { title: 'Debris and first pass', body: 'Removal of cleaning debris and a first clean while trades finish.' },
      { title: 'Construction dust', body: 'Ledges, fixtures, vents, frames and tracks.' },
      { title: 'Washrooms and kitchens', body: 'Cleaned and sanitized.' },
      { title: 'Glass', body: 'Interior glass, frames and tracks.' },
      { title: 'Floors and carpets', body: 'Cleaned to their finish; floor care where required.' },
      { title: 'Final detail clean', body: 'Before handover or opening.' },
    ],
    faqs: [
      { q: 'When should we book?', a: 'As soon as you have a handover or opening date. Construction dust keeps settling after the trades leave, so the work is best planned in stages.' },
      { q: 'How is it priced?', a: 'Per project, after a site visit — the size of the space, the stage of the build and the finishes all change the work.' },
      { q: 'Do you remove construction waste?', a: 'Bulk construction waste and hazardous materials are not cleaning work and should be arranged with your contractor. We remove the debris left from cleaning.' },
      { q: 'Can this lead into regular cleaning?', a: 'Yes. Once the space is open we can quote recurring office or commercial cleaning for it.' },
    ],
    finalHeading: 'Get your post-construction quote',
    organicPage: '/services/post-construction-cleaning/',
  },
];

/**
 * How Evergreen works, and the facts the site may state about it.
 *
 * EVERY LINE HAS A SOURCE IN THE BUSINESS'S OWN WORDS. Nothing here is a new
 * commitment; it is the client's existing copy, gathered into one place so the
 * homepage, the service pages, the landing pages and /our-process/ cannot
 * describe the same business four different ways.
 *
 *   homepage "3 Easy Steps"        Contact → Assess → Refresh; "we'll set up a
 *                                  time … go over your requirements … present
 *                                  you with a proposal for services"
 *   homepage About section         flexible after-hours and weekend work;
 *                                  proactive maintenance programs; a dedicated
 *                                  account executive
 *   Mississauga page (client copy) the account executive "coordinates your site
 *                                  walkthroughs, inspections, and adjustments";
 *                                  background-screened staff, liability
 *                                  insurance and WSIB Ontario
 *   Vaughan page (client copy)     dedicated cleaners assigned to your property;
 *                                  green products
 *   landing.ts (client ads doc)    free on-site walkthrough; supplies and
 *                                  equipment included; 30 days' notice
 *   /green-clean-products/         Armstrong ProSeries Green products
 *   reviews.ts                     four verified Google reviews
 *
 * WHAT IS NOT CLAIMED, because nobody has supplied it: a named inspection
 * system or checklist length, an inspection frequency, a response-time or
 * re-clean guarantee, a client count, a retention rate, a rating. Each is on
 * the client intake list (docs/growth/client-intake.md); add it here when it
 * is confirmed and every page that uses this file picks it up.
 */

export interface Step {
  title: string;
  body: string;
}

/** The five steps from first contact to an ongoing contract. */
export const PROCESS_STEPS: Step[] = [
  {
    title: 'Tell us about the space',
    body: 'Call (416) 803-4880 or send the short quote form. We ask what kind of building it is, where it is and what you need cleaned.',
  },
  {
    title: 'Free on-site walkthrough',
    body: 'We set up a time to walk the building with you and go over your requirements in detail, rather than pricing the work down the phone.',
  },
  {
    title: 'A written proposal',
    body: 'You receive a proposal for services that sets out the scope and the schedule, built around your operating hours.',
  },
  {
    title: 'A consistent crew, on your schedule',
    body: 'Cleaning runs after hours or at weekends where that suits you, by a team assigned to your property so the people who clean it know it.',
  },
  {
    title: 'Inspections and adjustments',
    body: 'Your account executive is your direct contact: they coordinate site walkthroughs and inspections and adjust the scope as your needs change.',
  },
];

/** Short trust points that are verified and safe to repeat anywhere. */
export const TRUST_FACTS = [
  { title: 'Serving Toronto since 1989', body: 'Commercial cleaning in Toronto and the GTA for more than three decades.' },
  { title: 'WSIB covered, bonded and insured', body: 'Background-screened staff, covered by liability insurance and WSIB Ontario.' },
  { title: 'One account executive', body: 'A direct contact who coordinates walkthroughs, inspections and changes.' },
  { title: 'After hours and weekends', body: 'Cleaning scheduled around your business, not the other way round.' },
] as const;

/**
 * What changes a price. No figures: the only rate the business publishes is
 * the "from $30/hr" in its Google Ads offer, and that stays on the paid pages
 * where its small print travels with it.
 */
export const PRICING_FACTORS = [
  'The size of the space and how it is laid out',
  'How often it is cleaned — nightly, a few times a week, weekly, or one-off',
  'The type of facility and any hygiene or security requirements that come with it',
  'Floor types and any periodic work, such as carpet extraction or strip and wax',
  'When the work has to happen — after hours, weekends or around shifts',
  'Access, parking and building rules',
] as const;

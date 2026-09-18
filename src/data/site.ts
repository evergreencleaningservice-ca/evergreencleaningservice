export const site = {
  name: 'Evergreen Office Cleaning',
  /* The business renamed itself: 2023 captures title every page "… - Evergreen
     Cleaning Service", 2025 captures title them "… - Evergreen Office
     Cleaning". `name` is the current one and is what titles use; `legalName`
     is kept for the few places the old name is still the copy. */
  legalName: 'Evergreen Cleaning Service',
  url: 'https://www.evergreencleaningservice.ca',
  tagline: 'Leaders in Commercial Cleaning and Building Maintenance in Toronto and the GTA',
  description:
    'Looking for commercial cleaning, office cleaning or janitorial services in Toronto and the GTA? Visit us to learn more about our services.',
  phone: '(416) 803-4880',
  /* The original writes `tel://416-803-4880`. Section 1 of the overhaul
     specification mandates a single anchor format, `tel:+14168034880`, which is
     also the correct E.164 form — so this now diverges from the original
     deliberately. Defined once in `nap` and mirrored here for the few callers
     that still read `site`. */
  phoneHref: 'tel:+14168034880',
  /* Superseded by `nap.email` (Section 1 deprecates this address). Kept only
     so the old value is on record; nothing renders it. */
  legacyEmail: 'evergreencleaning416@gmail.com',
  logo: '/images/cropped-evergreen-cleaning-toronto-logo-banner.jpg',
  since: 1989,
  gtmId: 'GTM-5PRC4HBV',
} as const;

/**
 * The canonical NAP, Section 1 of the overhaul specification. One definition,
 * used by the footer, the contact page, the location pages, the landing pages
 * and the JSON-LD graph, so the six cannot drift apart. Anything that needs a
 * name, address, phone or email reads it from here.
 *
 * TWO THINGS TO CONFIRM BEFORE GO-LIVE:
 *
 *  1. `info@evergreencleaningservice.ca` is what the spec mandates and it
 *     replaces evergreencleaning416@gmail.com everywhere. The domain has MX
 *     records (SiteGround), so it accepts mail — but that does not prove this
 *     local-part is a real mailbox. If it bounces, every contact route on the
 *     site is dead. Send a test message to it before the domain is cut over.
 *  2. The coordinates below are the spec's. 43.6503, -79.3892 is the generic
 *     centroid for "Toronto" rather than the pin for 243 Queen St W., which is
 *     nearer 43.6496, -79.3925. Left as specified; worth correcting with the
 *     client, since the geo is what a local pack reads.
 */
export const nap = {
  name: 'Evergreen Office Cleaning',
  streetAddress: '243 Queen St W.',
  addressLocality: 'Toronto',
  addressRegion: 'ON',
  postalCode: 'M5V 1Z4',
  addressCountry: 'CA',
  addressCountryName: 'Canada',
  /** One line, for places that cannot take the structured form. */
  addressLine: '243 Queen St W., Toronto, ON M5V 1Z4, Canada',
  phoneDisplay: '(416) 803-4880',
  /** The spec's anchor format, which is also the correct E.164 form. */
  phoneHref: 'tel:+14168034880',
  phoneSchema: '+1-416-803-4880',
  email: 'info@evergreencleaningservice.ca',
  latitude: 43.6503,
  longitude: -79.3892,
  priceRange: '$$',
} as const;

export const social = [
  { name: 'Facebook', href: 'https://www.facebook.com/Evergreen-Cleaning-Service-104007224426820' },
  { name: 'Twitter', href: 'https://twitter.com/EvergreenClean8/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/evergreen-cleaning-service-toronto/' },
] as const;

/** Footer service-area list, in the order the original site shows it. */
export const footerAreas = [
  'Toronto',
  'Greater Toronto Area',
  'Mississauga',
  'Etobicoke',
  'Richmond Hill',
  'Markham',
  'Vaughan',
  'Scarborough',
] as const;

/**
 * The longer service-area line in the contact section. The original writes the
 * first name loose and the rest inside a span — a leftover from a paste — so it
 * is two pieces here too, which is how it reads on the page.
 */
export const serviceAreas = {
  first: 'Toronto,',
  rest: 'East York, Etobicoke, North York, Scarborough, York, Mississauga, Vaughan, Brampton, Markham, Oakville, Richmond Hill',
} as const;

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: `Call Now: ${site.phone}`, href: site.phoneHref },
  {
    label: 'About',
    href: '/about-us/',
    children: [
      { label: 'Green Clean Products', href: '/green-clean-products/' },
      { label: 'Submit Your Testimonial', href: '/testimonials/' },
    ],
  },
  {
    label: 'Services',
    children: [
      { label: 'Disinfection Cleaning', href: '/services/disinfection-cleaning-service/' },
      { label: 'Office Cleaning', href: '/services/office-cleaning/' },
      { label: 'Emergency Cleaning', href: '/services/emergency-cleaning-services/' },
      { label: 'Commercial Cleaning', href: '/services/commercial-cleaning/' },
      { label: 'Industrial Cleaning', href: '/services/industrial-cleaning/' },
      {
        label: 'Property Management and Building Maintenance',
        href: '/services/building-maintenance/',
      },
    ],
  },
  { label: 'Blog', href: '/category/blog/' },
  { label: 'Contact Us', href: '/contact-us/' },
];

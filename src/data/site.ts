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
  /* The container the original carries on every 2025 capture. It holds Google
     Ads AW-16819334998, GA4 G-R27QW21PMT, Microsoft UET 187178776, a conversion
     linker and the SearchKings agency template — so this one id brings all of
     them. See src/components/GoogleTagManager.astro. */
  gtmId: 'GTM-5PRC4HBV',
  /* Hostnames the GTM container may load on. Anything else — a local dev
     server, a *.workers.dev URL, a branch preview — loads nothing at all.
     This is the only guard; see src/components/GoogleTagManager.astro.

     The staging hostname is on the list on purpose. A tag that cannot be
     observed anywhere but production cannot be verified before go-live, which
     is how this site shipped 76 pages with a dead loader on them. The cost is
     that staging pageviews reach the live GA4 property and the live
     remarketing lists — and that submitting the staging form registers a real
     conversion in the client's Google Ads account. The loader pushes
     `site_environment: 'staging'` ahead of `gtm.start`, so the agency can
     block staging inside the container without touching this repo. */
  analyticsHosts: [
    'www.evergreencleaningservice.ca',
    'evergreencleaningservice.ca',
    'evergreencleaningservice.10xconnections.com',
  ],
} as const;

/**
 * Image delivery — Backblaze B2 behind Cloudflare, the house pattern (AD-9).
 *
 * Every photo on the site lives in the B2 bucket named below and is served from
 * `host`, not from the Worker. The wiring is three pieces and they only work
 * together, so all three are named here:
 *
 *   bucket      B2 `img-evergreencleaningservice`, allPublic, region
 *               us-east-005. Keys mirror the repo exactly — `public/images/a.jpg`
 *               is stored as `images/a.jpg` — so a path is the same string on
 *               both hosts and the only thing that changes is the origin.
 *   DNS         CNAME img-evergreencleaningservice.10xconnections.com ->
 *               f005.backblazeb2.com, **proxied**. The orange cloud is not
 *               optional: B2 egress is free only through Cloudflare (Bandwidth
 *               Alliance), and grey-clouded it is billed at $0.01/GB.
 *   rewrite     a zone URL-rewrite rule prefixes `/file/img-evergreencleaningservice`
 *               onto the path, because B2's download endpoint addresses objects
 *               as /file/<bucket>/<key> and nothing else. Without the rule every
 *               request returns B2's own JSON 404.
 *
 * Source stays root-relative (`/images/a.jpg`) everywhere — components, markdown,
 * redirect targets — so `astro dev` serves the local files and nothing in the
 * content is pinned to a hostname. `scripts/images.mjs` swaps the origin in
 * `dist` after the build, and `scripts/b2-sync.mjs` puts the files in the bucket.
 */
export const images = {
  host: 'https://img-evergreencleaningservice.10xconnections.com',
  bucket: 'img-evergreencleaningservice',
  /* Hosts that may appear in front of `/images/` in built output — og:image and
     JSON-LD are absolute, so they carry the canonical origin and need swapping
     too. Anything not listed here is left alone rather than guessed at. */
  rewriteOrigins: [
    'https://www.evergreencleaningservice.ca',
    'https://evergreencleaningservice.ca',
    'https://evergreencleaningservice.10xconnections.com',
  ],
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
      { label: 'Submit Your Testimonial', href: '/reviews/' },
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

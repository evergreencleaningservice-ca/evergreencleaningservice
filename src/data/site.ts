/**
 * The hostnames this site is served from, named once because three unrelated
 * pieces of behaviour key off them — the analytics allowlist, the Worker's
 * refusal to run on reCAPTCHA test keys in production, and the image-origin
 * rewrite. Deriving them from one list keeps a change in one place from
 * quietly altering the meaning of another.
 */
export const PRODUCTION_HOSTS = [
  'www.evergreencleaningservice.ca',
  'evergreencleaningservice.ca',
] as const;

export const PREVIEW_HOST = 'evergreencleaningservice.10xconnections.com';

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
  analyticsHosts: [...PRODUCTION_HOSTS, PREVIEW_HOST],
} as const;

/**
 * Spam protection on every form.
 *
 * TWO PROVIDERS, one switch. `provider` decides what renders and what the
 * Worker verifies, so swapping is a one-word change plus a secret — not a
 * rebuild. Both are supported because the client has an existing reCAPTCHA key
 * and has not yet said which they will supply for production.
 *
 * TURNSTILE is the default and the better fit here: it is invisible, so it puts
 * no friction on a paid click, and it needs no third-party consent banner.
 * Its widget writes the token into a hidden `cf-turnstile-response` input that
 * it inserts into the form itself, which is what the submit handlers read.
 *
 * THE KEYS BELOW ARE CLOUDFLARE'S PUBLISHED TEST PAIR, not the client's.
 * The API token in this environment has no Turnstile permission — creating a
 * widget returns "Authentication error" — so a real one could not be
 * provisioned here. Unlike Google's reCAPTCHA test pair, Cloudflare publishes a
 * failing secret as well as a passing one, so both the accept and the reject
 * path are provable on staging rather than only the happy one.
 *
 * TO GO LIVE, either:
 *
 *   Turnstile   create a widget at dash.cloudflare.com → Turnstile (or grant
 *               the API token Account → Turnstile → Edit and ask for it), set
 *               PUBLIC_TURNSTILE_SITE_KEY at build time and
 *               `wrangler secret put TURNSTILE_SECRET`
 *   reCAPTCHA   set `provider: 'recaptcha'`, build with
 *               PUBLIC_RECAPTCHA_SITE_KEY=6Lcy1lwa… and
 *               `wrangler secret put RECAPTCHA_SECRET`
 *
 * Shipping on either test pair by accident is not possible: src/worker.ts
 * refuses both test secrets on a PRODUCTION_HOSTS hostname and answers 503.
 */
export const captcha = {
  provider: 'turnstile' as 'turnstile' | 'recaptcha',

  turnstile: {
    /** Cloudflare's published invisible test key. Any domain, always passes. */
    testSiteKey: '1x00000000000000000000BB',
    /** Published, always passes. Named so the Worker can refuse it in prod. */
    testSecretKey: '1x0000000000000000000000000000000AA',
    /** Published, always fails — used to prove the reject path really rejects. */
    failSecretKey: '2x0000000000000000000000000000000AA',
    verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  },

  recaptcha: {
    /* v2 checkbox, recovered from the original's own markup: WPForms renders
       `wpforms-is-recaptcha-type-v2` with this key. Domain-locked to
       evergreencleaningservice.ca — measured: asking Google for the widget with
       it and the staging origin returns "Invalid domain for site key". */
    clientSiteKey: '6Lcy1lwaAAAAAL_5DO8SACXqh0NF_QdzhkrAh-3K',
    /** Google's published v2 test site key. Any domain, always passes. */
    testSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
    /** Its matching secret. Published by Google, so not a credential. */
    testSecretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
  },
} as const;

/** Kept so existing imports keep resolving; `captcha.recaptcha` is the source. */
export const recaptcha = captcha.recaptcha;

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

/**
 * Footer service-area list, in the order the original site shows it.
 *
 * Every entry on the original is `href="#"` — eight links that go nowhere.
 * That was faithfully ported and is pure loss now that the location pages
 * exist, so each one points at a real page.
 *
 * Richmond Hill and Scarborough have no page of their own. They are areas the
 * business serves, named in `serviceAreas` on the contact section, so they are
 * kept here and aimed at the /locations/ hub rather than dropped — removing a
 * claimed service area to tidy a list would be a change to what the business
 * says it covers, which is not a developer's call.
 */
export const footerAreas = [
  { label: 'Toronto', href: '/locations/toronto-downtown/' },
  { label: 'Toronto & GTA', href: '/services/commercial-cleaning/' },
  { label: 'Mississauga', href: '/locations/mississauga/' },
  { label: 'Etobicoke', href: '/locations/etobicoke/' },
  { label: 'Richmond Hill', href: '/locations/' },
  { label: 'Markham', href: '/locations/markham/' },
  { label: 'Vaughan / Concord', href: '/locations/vaughan/' },
  { label: 'Scarborough', href: '/locations/' },
  { label: 'Brampton', href: '/locations/brampton/' },
  { label: 'Oakville', href: '/locations/oakville/' },
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
      { label: 'Disinfection Cleaning', href: '/services/disinfection-cleaning/' },
      { label: 'Office Cleaning', href: '/services/office-cleaning/' },
      { label: 'Emergency Cleaning', href: '/services/emergency-cleaning/' },
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

/**
 * The global structured-data graph — Section 2.4 of the overhaul specification.
 *
 * Built from `nap` in src/data/site.ts rather than written out as a literal, so
 * the address in the schema and the address in the footer cannot drift apart.
 * That drift is the whole point of the NAP section: Google reads both.
 *
 * WHAT THIS ADDS TO THE SPECIFICATION'S JSON
 *
 *  - `@id` on the WebSite node and a `publisher` link to the organisation, so
 *    the two are one graph rather than two unrelated records. The spec's
 *    `@graph` had a single node in it.
 *  - `sameAs` for the social profiles the site already links to. Rank Math was
 *    emitting these on the original; dropping them loses an entity signal for
 *    no reason.
 *  - `SearchAction`, which the original also carried.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 *  `aggregateRating`. The specification's landing-page mockup advertises a
 *  "4.9/5 Google Rating" and it would be easy to put that in the schema. There
 *  are four recovered Google reviews for this business and no verified rating
 *  count, and an invented `aggregateRating` is both a Google policy violation
 *  and a factual claim the client cannot support. It goes in when someone
 *  supplies the real figure from the Google Business Profile.
 */
import { hours, nap, site, social } from '../data/site';

/** Cities named in `areaServed`. Matches src/data/coverage.ts at city level. */
const SERVICE_AREA_NAMES = [
  'Toronto',
  'Mississauga',
  'Brampton',
  'Oakville',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Pickering',
  'Ajax',
  'Oshawa',
];

/** The service pages, for the organisation's catalog. */
const CATALOG = [
  { name: 'Office Cleaning', path: '/services/office-cleaning/' },
  { name: 'Commercial Cleaning', path: '/services/commercial-cleaning/' },
  { name: 'Industrial & Warehouse Cleaning', path: '/services/industrial-cleaning/' },
  { name: 'Post-Construction Cleaning', path: '/services/post-construction-cleaning/' },
  { name: 'Building Maintenance', path: '/services/building-maintenance/' },
  { name: 'Floor Stripping & Waxing', path: '/services/floor-stripping-waxing/' },
  { name: 'Disinfection Cleaning', path: '/services/disinfection-cleaning/' },
  { name: 'Emergency Cleaning', path: '/services/emergency-cleaning/' },
  { name: 'Pressure Washing', path: '/services/pressure-washing/' },
  { name: 'Graffiti Removal', path: '/services/graffiti-removal/' },
];

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

export const organizationGraph = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      /* ProfessionalService, a LocalBusiness subtype. It was `CleaningService`
         (inherited from the old Rank Math output), which is not a schema.org
         type, so every property on this node went unvalidated (SEO audit,
         30 Oct 2026). */
      '@type': 'ProfessionalService',
      '@id': ORG_ID,
      name: nap.name,
      alternateName: [...nap.alternateNames],
      foundingDate: String(site.since),
      url: `${site.url}/`,
      logo: `${site.url}${site.logo}`,
      image: `${site.url}${site.logo}`,
      telephone: nap.phoneSchema,
      email: nap.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: nap.streetAddress,
        addressLocality: nap.addressLocality,
        addressRegion: nap.addressRegion,
        postalCode: nap.postalCode,
        addressCountry: nap.addressCountry,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: nap.latitude,
        longitude: nap.longitude,
      },
      hasMap: nap.mapUrl,
      openingHoursSpecification: hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...h.days],
        opens: h.opens,
        closes: h.closes,
      })),
      areaServed: SERVICE_AREA_NAMES.map((name) => ({ '@type': 'City', name })),
      sameAs: social.map((s) => s.href),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: nap.phoneSchema,
        email: nap.email,
        url: `${site.url}/request-a-quote/`,
        areaServed: 'CA-ON',
        availableLanguage: 'English',
      },
      /* Each catalog item points at its page's own Service node by `@id`, so
         the catalog and the pages are one graph (SEO audit H12, 28 Oct). */
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Commercial Cleaning Services',
        itemListElement: CATALOG.map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': `${site.url}${s.path}#service`,
            name: s.name,
            url: `${site.url}${s.path}`,
          },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: `${site.url}/`,
      name: nap.name,
      publisher: { '@id': ORG_ID },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${site.url}/search/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

const ORG = { '@id': ORG_ID };

/**
 * Breadcrumbs.
 *
 * The original emitted BreadcrumbList on three pages of 64. This port emitted
 * it on none, while rendering a *visible* breadcrumb trail on service pages,
 * location pages, posts and the archives — the markup was there and the machine
 * -readable version was not. That is the regression this closes.
 *
 * Pass the trail without the current page's own URL: schema.org wants the last
 * item to be the page itself, named but not linked.
 */
export const breadcrumbSchema = (trail: { name: string; url?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.name,
    ...(step.url ? { item: step.url.startsWith('http') ? step.url : `${site.url}${step.url}` } : {}),
  })),
});

/**
 * A blog post.
 *
 * Rank Math emitted BlogPosting on 37 of the original's pages and Article on 15.
 * This port emitted neither, which left all 38 posts carrying nothing but the
 * business's own graph — no headline, no publish date, no author, nothing that
 * says "this is an article" at all.
 */
export const articleSchema = (post: {
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  image?: string;
  slug: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${site.url}/${post.slug}/#article`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${site.url}/${post.slug}/` },
  headline: post.title,
  ...(post.description ? { description: post.description } : {}),
  datePublished: post.pubDate.toISOString(),
  dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
  ...(post.image ? { image: `${site.url}${post.image}` } : {}),
  author: ORG,
  publisher: ORG,
  isPartOf: { '@id': SITE_ID },
});

/**
 * The page a Service or location sits on (SEO audit H12, 28 Oct 2026).
 *
 * `dateModified` is the last commit to the files the page is built from, the
 * same date the sitemap's lastmod uses (src/lib/sitemap-lastmod.mjs). It is
 * left out when it cannot be known, rather than set to the build time, which
 * would claim every page changed on every deploy.
 */
export const webPageSchema = (opts: {
  name: string;
  url: string;
  description?: string;
  image?: string;
  dateModified?: string;
  mainEntityId?: string;
}) => {
  const url = opts.url.startsWith('http') ? opts.url : `${site.url}${opts.url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image
      ? { primaryImageOfPage: { '@type': 'ImageObject', url: opts.image.startsWith('http') ? opts.image : `${site.url}${opts.image}` } }
      : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.mainEntityId ? { mainEntity: { '@id': opts.mainEntityId } } : {}),
    isPartOf: { '@id': SITE_ID },
    publisher: ORG,
  };
};

/** A listing page — the archives and the news index. */
export const collectionSchema = (opts: { name: string; url: string; description?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${site.url}${opts.url}#collection`,
  name: opts.name,
  url: `${site.url}${opts.url}`,
  ...(opts.description ? { description: opts.description } : {}),
  isPartOf: { '@id': SITE_ID },
  publisher: ORG,
});

/**
 * A service (or an industry offering) on its own page. Describes only what the
 * page shows: the name, the description, who provides it and where. No price,
 * no rating, no review markup.
 */
export const serviceSchema = (opts: { name: string; description?: string; url: string; serviceType?: string }) => {
  const url = opts.url.startsWith('http') ? opts.url : `${site.url}${opts.url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    /* The same `@id` the organisation's catalog points at. */
    '@id': `${url}#service`,
    name: opts.name,
    serviceType: opts.serviceType ?? opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url,
    provider: ORG,
    areaServed: SERVICE_AREA_NAMES.map((name) => ({ '@type': 'City', name })),
    /* Who it is for and how to ask for it (SEO audit H12 and M13). */
    audience: { '@type': 'BusinessAudience', audienceType: 'Businesses and property managers' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${site.url}/request-a-quote/`,
      servicePhone: { '@type': 'ContactPoint', telephone: nap.phoneSchema, contactType: 'sales' },
    },
  };
};

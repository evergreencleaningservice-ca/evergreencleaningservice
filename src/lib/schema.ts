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
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 *  `SearchAction`. The original carried one and so did this port until the
 *  SEO audit of 6 Nov 2026. It pointed at /search/, which is noindex, needs
 *  JavaScript and searches only the blog, and Google retired the sitelinks
 *  search box it fed in November 2024. Dead weight on every page.
 *
 *  `aggregateRating`. The specification's landing-page mockup advertises a
 *  "4.9/5 Google Rating" and it would be easy to put that in the schema. There
 *  are four recovered Google reviews for this business and no verified rating
 *  count, and an invented `aggregateRating` is both a Google policy violation
 *  and a factual claim the client cannot support. It goes in when someone
 *  supplies the real figure from the Google Business Profile.
 */
import { PLACES_WITHIN_TORONTO, SERVICE_LOCATION_SUGGESTIONS } from '../data/coverage';
import { hours, nap, site, social } from '../data/site';
import { offerPath } from '../data/offer-pages';
import {
  credentials as CREDENTIALS,
  memberships as MEMBERSHIPS,
  people as PEOPLE,
  type Credential,
  type Membership,
  type Person,
} from '../data/people';

/**
 * Places named in `areaServed`, on the organisation and on every Service node.
 *
 * Read from src/data/coverage.ts rather than written out here (SEO re-audit,
 * 7 Nov 2026, item 9). The hand-kept list named ten cities and had drifted:
 * it left out North York and Scarborough, which have their own location
 * pages, and Etobicoke, East York and York, which the site says it covers.
 * The quote form's city suggestions are the coverage list at city level, so
 * the schema now names exactly what the form offers and cannot claim a place
 * the site does not, or miss one it does.
 *
 * Most are typed `City`. North York, Scarborough and Etobicoke are former
 * municipalities merged into Toronto in 1998, still the names people search
 * by, and each has its own location page; `City` is the closest schema.org
 * type for them. East York and York have no page and are a Place inside
 * Toronto instead (13 Nov 2026, SEO audit 11 Nov, local L2 / schema N7), the
 * same `containedInPlace` shape the Durham page uses for its three towns.
 * (Durham Region, a regional municipality, is typed on its own location
 * page, not here.)
 */
const SERVICE_AREA_NAMES: readonly string[] = SERVICE_LOCATION_SUGGESTIONS;
const SERVICE_AREAS = () =>
  SERVICE_AREA_NAMES.map((name) =>
    PLACES_WITHIN_TORONTO.includes(name)
      ? { '@type': 'Place', name, containedInPlace: { '@type': 'City', name: 'Toronto' } }
      : { '@type': 'City', name },
  );

/** The service pages, for the organisation's catalog. */
const CATALOG = [
  { name: 'Office Cleaning', path: offerPath('office-cleaning') },
  { name: 'Commercial Cleaning', path: offerPath('commercial-cleaning') },
  { name: 'Janitorial Services', path: offerPath('janitorial-services') },
  { name: 'Industrial & Warehouse Cleaning', path: offerPath('industrial-cleaning') },
  { name: 'Post-Construction Cleaning', path: offerPath('post-construction-cleaning') },
  { name: 'Building Maintenance', path: offerPath('building-maintenance') },
  { name: 'Floor Stripping & Waxing', path: offerPath('floor-stripping-waxing') },
  { name: 'Disinfection Cleaning', path: offerPath('disinfection-cleaning') },
  { name: 'Emergency Cleaning', path: offerPath('emergency-cleaning') },
  { name: 'Pressure Washing', path: offerPath('pressure-washing') },
  { name: 'Graffiti Removal', path: offerPath('graffiti-removal') },
];

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

const credentialNode = (c: Credential) => ({
  '@type': 'EducationalOccupationalCredential',
  name: c.name,
  credentialCategory: c.credentialCategory,
  ...(c.recognizedBy
    ? { recognizedBy: { '@type': 'Organization', name: c.recognizedBy.name, ...(c.recognizedBy.url ? { url: c.recognizedBy.url } : {}) } }
    : {}),
  ...(c.url ? { url: c.url } : {}),
});

/**
 * A person from src/data/people.ts (13 Nov 2026, comparison with impact.ca,
 * item 2). The same node, with the same `@id`, is used on the organisation,
 * as a post's author and on /team/, so the three are one entity. Only fields
 * the client supplied are emitted.
 *
 * The `@id` lives under /team/ since 13 Nov 2026 (comparison with impact.ca):
 * the team page is where a person is described, so it is their home. It was
 * /about-us/#person-<id> before; nobody was published, so nothing pointed at
 * the old one.
 */
export const personNode = (p: Person) => ({
  '@type': 'Person',
  '@id': `${site.url}/team/#person-${p.id}`,
  name: p.name,
  jobTitle: p.jobTitle,
  worksFor: { '@id': ORG_ID },
  ...(p.description ? { description: p.description } : {}),
  ...(p.image ? { image: p.image.startsWith('http') ? p.image : `${site.url}${p.image}` } : {}),
  ...(p.sameAs?.length ? { sameAs: [...p.sameAs] } : {}),
  ...(p.knowsAbout?.length ? { knowsAbout: [...p.knowsAbout] } : {}),
  ...(p.credentials?.length ? { hasCredential: p.credentials.map(credentialNode) } : {}),
});

/**
 * People, credentials and memberships for the organisation node. Each key is
 * present only when its list has entries, so with today's empty lists the
 * graph is exactly what it was before 13 Nov 2026.
 */
const organisationPeople = (d: {
  people: readonly Person[];
  credentials: readonly Credential[];
  memberships: readonly Membership[];
}) => {
  const founders = d.people.filter((p) => p.role === 'founder').map(personNode);
  const staff = d.people.filter((p) => p.role !== 'founder').map(personNode);
  return {
    ...(founders.length ? { founder: founders } : {}),
    ...(staff.length ? { employee: staff } : {}),
    ...(d.credentials.length ? { hasCredential: d.credentials.map(credentialNode) } : {}),
    ...(d.memberships.length
      ? { memberOf: d.memberships.map((m) => ({ '@type': 'Organization', name: m.name, ...(m.url ? { url: m.url } : {}) })) }
      : {}),
  };
};

export const organizationGraph = (
  data: {
    people: readonly Person[];
    credentials: readonly Credential[];
    memberships: readonly Membership[];
  } = { people: PEOPLE, credentials: CREDENTIALS, memberships: MEMBERSHIPS },
) => ({
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
      areaServed: SERVICE_AREAS(),
      /* What the company does, named from the service catalog below (13 Nov
         2026, comparison with impact.ca, item 2): the same eleven services
         the site has pages for, so it claims no expertise the site does not
         describe. */
      knowsAbout: CATALOG.map((s) => s.name),
      ...organisationPeople(data),
      /* The Google Business Profile first, then the social profiles. */
      sameAs: [nap.mapUrl, ...social.map((s) => s.href)],
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
    },
  ],
});

const ORG = { '@id': ORG_ID };
const ORG_INLINE = { '@type': 'Organization', '@id': ORG_ID, name: nap.name, url: `${site.url}/` };

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
  /** A person from src/data/people.ts, when the post's front matter names one. */
  author?: Person;
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
  /* Name, URL and logo written out as well as the @id (SEO audit, 30 Oct
     2026): Google's article guidance reads `author.name` and the publisher's
     logo from the article itself rather than following the reference.
     A post that names its author in front matter (13 Nov 2026) is credited
     to that Person, with the same @id as on the organisation. */
  author: post.author ? personNode(post.author) : ORG_INLINE,
  publisher: { ...ORG_INLINE, logo: { '@type': 'ImageObject', url: `${site.url}${site.logo}` } },
  isPartOf: { '@id': SITE_ID },
});

/**
 * The page a Service or location sits on (SEO audit H12, 28 Oct 2026).
 *
 * `dateModified` is the date the page's own content last changed, the same
 * date the sitemap's lastmod uses (src/lib/sitemap-lastmod.mjs): a service
 * or industry page's content file, a location's `updated` field. Since 6 Nov
 * 2026 (SEO audit item 29) a commit to the shared template no longer counts.
 * It is left out when it cannot be known, rather than set to the build time,
 * which would claim every page changed on every deploy.
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
    areaServed: SERVICE_AREAS(),
    /* Who it is for and how to ask for it (SEO audit H12 and M13). */
    audience: { '@type': 'BusinessAudience', audienceType: 'Businesses and property managers' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${site.url}/request-a-quote/`,
      servicePhone: { '@type': 'ContactPoint', telephone: nap.phoneSchema, contactType: 'sales' },
    },
  };
};

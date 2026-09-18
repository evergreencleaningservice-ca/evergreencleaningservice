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
import { nap, site, social } from '../data/site';

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

export const organizationGraph = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CleaningService',
      '@id': ORG_ID,
      name: nap.name,
      url: `${site.url}/`,
      logo: `${site.url}${site.logo}`,
      image: `${site.url}${site.logo}`,
      telephone: nap.phoneSchema,
      email: nap.email,
      priceRange: nap.priceRange,
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
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:00',
          closes: '22:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday', 'Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
      ],
      areaServed: [
        'Toronto',
        'Mississauga',
        'Etobicoke',
        'Vaughan',
        'Markham',
        'Brampton',
        'Oakville',
      ].map((name) => ({ '@type': 'City', name })),
      sameAs: social.map((s) => s.href),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Commercial Cleaning & Janitorial Catalog',
        itemListElement: [
          {
            name: 'Office Cleaning Services',
            description:
              'Daily, weekly, and customized janitorial solutions for modern workspaces and corporate suites.',
          },
          {
            name: 'Industrial & Warehouse Cleaning',
            description:
              'Heavy-duty concrete floor scrubbing, high dusting, and warehouse maintenance.',
          },
          {
            name: 'Post-Construction Cleaning',
            description:
              'Complete rough, secondary, and final turnover cleaning for commercial buildouts.',
          },
        ].map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', ...s },
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
  dateModified: post.pubDate.toISOString(),
  ...(post.image ? { image: `${site.url}${post.image}` } : {}),
  author: ORG,
  publisher: ORG,
  isPartOf: { '@id': SITE_ID },
});

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

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

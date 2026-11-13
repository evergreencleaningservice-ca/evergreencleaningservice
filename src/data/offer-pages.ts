/**
 * The service and industry pages' addresses, in one place.
 *
 * URL MOVE, OWNER DECISION (13 Nov 2026). The 13 pages moved from
 * /services/<slug>/ and /industries/<slug>/ to /<slug>/, the root, where the
 * old WordPress site kept its service pages and where the blog posts already
 * live. The hubs /services/ and /industries/ stay as listing pages, and each
 * page's breadcrumb keeps its Services or Industries step, linking to its
 * hub. Only the URL changed.
 *
 * Every path to one of these pages that is built in code comes from
 * `offerPath` below, so the next move is one line. The slug lists are what
 * the redirects (src/data/redirects.ts) and the sitemap dates
 * (src/lib/sitemap-lastmod.mjs) read, outside Astro, where the content
 * collections cannot be loaded. The root route (src/pages/[slug].astro)
 * fails the build when either list and its collection disagree, and when two
 * root routes would claim one slug.
 *
 * Plain type-strippable TypeScript, imported with its extension by
 * scripts/redirects.mjs, which runs under node's bare type stripping.
 */

/** src/content/services/<slug>.md, one each. */
export const SERVICE_SLUGS = [
  'building-maintenance',
  'commercial-cleaning',
  'disinfection-cleaning',
  'emergency-cleaning',
  'floor-stripping-waxing',
  'graffiti-removal',
  'industrial-cleaning',
  'janitorial-services',
  'office-cleaning',
  'post-construction-cleaning',
  'pressure-washing',
] as const;

/** src/content/industries/<slug>.md, one each. */
export const INDUSTRY_SLUGS = ['medical-dental-clinics', 'property-management'] as const;

export type OfferCollection = 'services' | 'industries';

/** The address of a service or industry page. */
export const offerPath = (slug: string): string => `/${slug}/`;

/** Which collection a slug belongs to, or undefined for any other page. */
export const offerCollection = (slug: string): OfferCollection | undefined =>
  (SERVICE_SLUGS as readonly string[]).includes(slug)
    ? 'services'
    : (INDUSTRY_SLUGS as readonly string[]).includes(slug)
      ? 'industries'
      : undefined;

/** The hub a page path sits under in the menu and breadcrumb, or undefined. */
export const offerHub = (pathname: string): '/services/' | '/industries/' | undefined => {
  const collection = offerCollection(pathname.replace(/^\/|\/$/g, ''));
  return collection ? `/${collection}/` : undefined;
};

/**
 * Where the 13 pages were served from 15 Oct to 13 Nov 2026, each with its
 * new address. src/data/redirects.ts turns these into one-hop 301s.
 */
export const MOVED_OFFER_PATHS: { from: string; to: string }[] = [
  ...SERVICE_SLUGS.map((slug) => ({ from: `/services/${slug}/`, to: offerPath(slug) })),
  ...INDUSTRY_SLUGS.map((slug) => ({ from: `/industries/${slug}/`, to: offerPath(slug) })),
];

/**
 * When the addresses changed: the time of the move's edit (UTC). Each
 * moved page's sitemap <lastmod> is at least this, because a page at a new
 * address is a changed page to a crawler even where its words are not
 * (src/lib/sitemap-lastmod.mjs). Never set it ahead of the change.
 */
export const OFFER_URLS_MOVED = '2026-11-13T15:46:40Z';

/**
 * Slugs that more than one root-level route would claim: a blog post, a
 * service or industry page, a page file or folder in src/pages, or a file or
 * folder in public. Astro would quietly let one win, so the root route
 * throws on any of these instead. Exported for its test.
 */
export function rootSlugCollisions(groups: Record<string, readonly string[]>): string[] {
  const owners = new Map<string, string[]>();
  for (const [group, slugs] of Object.entries(groups)) {
    for (const slug of new Set(slugs)) owners.set(slug, [...(owners.get(slug) ?? []), group]);
  }
  return [...owners]
    .filter(([, list]) => list.length > 1)
    .map(([slug, list]) => `/${slug}/ is claimed by ${list.join(' and ')}`);
}

/**
 * Every permanent redirect the site serves, in one list.
 *
 * WHY NOT `redirects` IN astro.config
 * Astro's static redirects cannot emit an HTTP 301 without a server: each one
 * builds an HTML page that returns **200** with `<meta http-equiv="refresh">`.
 * Section 2.1 of the overhaul specification asks for 301s, and Section 5 tests
 * for them, so a meta refresh fails the checklist on its own terms. Cloudflare's
 * static-asset router reads a `_redirects` file and returns real 301s, so that
 * is where these go — written into dist/ by scripts/redirects.mjs.
 *
 * TWO CORRECTIONS TO THE SPECIFICATION'S MAP, both deliberate:
 *
 *  1. Six of its eight legacy source URLs never existed on this site. The full
 *     Internet Archive crawl of evergreencleaningservice.ca has no record of
 *     /commercial-cleaning-toronto-gta/, /office-cleaning-and-janitorial-toronto/,
 *     /property-management-and-building-maintenance/, /pressure-washing-services/,
 *     /graffiti-removal-services/ or /submit-your-testimonial/. They are kept
 *     anyway — a redirect from an address nobody links to costs nothing — but
 *     the addresses that DO carry equity were missing from the spec and are
 *     added below under "legacy addresses that actually exist".
 *
 *  2. Three of its targets do not exist either. A 301 into a 404 is worse than
 *     no redirect, so those point at the real equivalent instead:
 *       /services/disinfection-cleaning/  ->  /services/disinfection-cleaning-service/
 *       /services/emergency-cleaning/     ->  /services/emergency-cleaning-services/
 *       /services/pressure-washing/, /services/graffiti-removal/, /reviews/
 *                                         ->  the /services/ hub and /testimonials/
 *     The spec wants dedicated pages for pressure washing and graffiti removal.
 *     Building them means writing service copy and making commercial claims the
 *     client has not supplied, so they are not invented here. Flagged for copy.
 */

export type Redirect = { from: string; to: string };

/** Section 2.1, as specified — with targets corrected to pages that exist. */
export const specRedirects: Redirect[] = [
  { from: '/commercial-cleaning-toronto-gta/', to: '/services/commercial-cleaning/' },
  { from: '/office-cleaning-and-janitorial-toronto/', to: '/services/office-cleaning/' },
  { from: '/industrial-cleaning/', to: '/services/industrial-cleaning/' },
  { from: '/property-management-and-building-maintenance/', to: '/services/building-maintenance/' },
  { from: '/disinfection-cleaning/', to: '/services/disinfection-cleaning-service/' },
  { from: '/pressure-washing-services/', to: '/services/' },
  { from: '/graffiti-removal-services/', to: '/services/' },
  { from: '/emergency-cleaning/', to: '/services/emergency-cleaning-services/' },
  { from: '/blog/', to: '/insights/' },
  { from: '/submit-your-testimonial/', to: '/testimonials/' },
];

/**
 * Legacy addresses that actually exist, from the archive crawl. These are the
 * ones carrying real inbound links; see _research/url-preservation.md.
 */
export const legacyRedirects: Redirect[] = [
  // the 2019 service URLs the /services/ tree replaced
  { from: '/office-cleaning/', to: '/services/office-cleaning/' },
  { from: '/commercial-cleaning/', to: '/services/commercial-cleaning/' },
  { from: '/emergency-service/', to: '/services/emergency-cleaning-services/' },

  // WordPress pages that moved
  { from: '/testimonial/', to: '/testimonials/' },
  { from: '/portfolio/project-title-sixth/', to: '/cleaning-demo-gallery/' },

  // feeds and sitemaps — the port serves these under different names
  { from: '/feed/', to: '/rss.xml' },
  { from: '/blog/feed/', to: '/rss.xml' },
  { from: '/comments/feed/', to: '/rss.xml' },
  { from: '/sitemap.xml', to: '/sitemap-index.xml' },
  { from: '/sitemap_index.xml', to: '/sitemap-index.xml' },
];

/**
 * Wildcards. Cloudflare's `_redirects` supports a trailing `*` and `:splat`.
 *
 * The `/blog/:slug/` rule is the one that was actually broken: those addresses
 * 404'd on the port although the original redirected them, because the posts
 * moved to root-level slugs years ago. The uploads rule recovers every image
 * address at once, including the ones in the original's own og:image tags.
 */
export const wildcardRedirects: Redirect[] = [
  { from: '/blog/page/*', to: '/insights/page/:splat' },
  { from: '/blog/*', to: '/:splat' },
  { from: '/tag/*', to: '/category/blog/' },
  { from: '/author/*', to: '/category/blog/' },
];

/**
 * The image addresses, one rule each.
 *
 * A single `/wp-content/uploads/* -> /images/:splat` wildcard does not work:
 * the old paths are dated (`/wp-content/uploads/2021/03/file.jpg`) and this
 * site serves images flat under `/images/`, and `_redirects` has no way to take
 * just the basename from a splat. So the map is explicit — 101 paths, read out
 * of the archived pages and kept only where the file is one this site actually
 * serves, so none of them redirects into a 404.
 */
export { default as uploadRedirects } from './upload-redirects.json' with { type: 'json' };

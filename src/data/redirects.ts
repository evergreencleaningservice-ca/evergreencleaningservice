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
 * ON THE SPECIFICATION'S MAP
 *
 * An earlier pass of this file claimed six of Section 2.1's legacy sources
 * "never existed", on the evidence that the Internet Archive crawl has no
 * record of them. That was wrong, and the reasoning was wrong: Wayback's
 * coverage is partial, so absence from the crawl is "not captured", not "not
 * there". The client confirms these addresses exist on the live site. The live
 * origin cannot settle it from here — SiteGround answers this network with a
 * captcha interstitial that returns 202 for every path, which is neither a 200
 * nor a 404 — so the spec is taken at its word and implemented verbatim.
 *
 * Every target in the map is now a page that exists. Three were created and
 * two renamed to match the service tree in Section 2.2:
 *   /services/disinfection-cleaning-service/ -> /services/disinfection-cleaning/
 *   /services/emergency-cleaning-services/   -> /services/emergency-cleaning/
 *   /services/pressure-washing/, /services/post-construction-cleaning/,
 *   /services/graffiti-removal/              -> new, copy marked needsClientCopy
 */

export type Redirect = { from: string; to: string };

/** Section 2.1, as specified — with targets corrected to pages that exist. */
export const specRedirects: Redirect[] = [
  { from: '/commercial-cleaning-toronto-gta/', to: '/services/commercial-cleaning/' },
  { from: '/office-cleaning-and-janitorial-toronto/', to: '/services/office-cleaning/' },
  { from: '/industrial-cleaning/', to: '/services/industrial-cleaning/' },
  { from: '/property-management-and-building-maintenance/', to: '/services/building-maintenance/' },
  { from: '/disinfection-cleaning/', to: '/services/disinfection-cleaning/' },
  { from: '/pressure-washing-services/', to: '/services/pressure-washing/' },
  { from: '/graffiti-removal-services/', to: '/services/graffiti-removal/' },
  { from: '/emergency-cleaning/', to: '/services/emergency-cleaning/' },
  { from: '/blog/', to: '/insights/' },
  { from: '/submit-your-testimonial/', to: '/reviews/' },
];

/**
 * Legacy addresses that actually exist, from the archive crawl. These are the
 * ones carrying real inbound links; see _research/url-preservation.md.
 */
export const legacyRedirects: Redirect[] = [
  // the 2019 service URLs the /services/ tree replaced
  { from: '/office-cleaning/', to: '/services/office-cleaning/' },
  { from: '/commercial-cleaning/', to: '/services/commercial-cleaning/' },
  { from: '/emergency-service/', to: '/services/emergency-cleaning/' },

  // the two service pages this overhaul renamed, so their old paths keep working
  { from: '/services/disinfection-cleaning-service/', to: '/services/disinfection-cleaning/' },
  { from: '/services/emergency-cleaning-services/', to: '/services/emergency-cleaning/' },

  // WordPress pages that moved
  { from: '/testimonial/', to: '/reviews/' },
  { from: '/testimonials/', to: '/reviews/' },
  { from: '/portfolio/project-title-sixth/', to: '/cleaning-demo-gallery/' },

  // feeds and sitemaps — the port serves these under different names
  { from: '/feed/', to: '/rss.xml' },
  { from: '/blog/feed/', to: '/rss.xml' },
  { from: '/comments/feed/', to: '/rss.xml' },
  { from: '/sitemap.xml', to: '/sitemap-index.xml' },
  { from: '/sitemap_index.xml', to: '/sitemap-index.xml' },
];

/**
 * The paginated news archive, one rule per page rather than a wildcard.
 *
 * `/blog/page/*` was a wildcard sitting directly above `/blog/*`, which is
 * correct if `_redirects` is strictly first-match-in-file-order. It is not:
 * measured on the deployed site, `/blog/page/2/` matched the broader
 * `/blog/*` and redirected to `/page/2/`, which does not exist — a 301 into a
 * 404, the worst shape a redirect can take, because a crawler records the
 * move and then finds nothing. Both of the old site's pagination addresses
 * were doing it.
 *
 * Static rules do not depend on that ordering, and the page count is finite
 * and known, so they are generated from it. `LAST_NEWS_PAGE` tracks
 * `pageSize: 10` in src/pages/insights/[...page].astro — raise it when the
 * post count crosses a multiple of ten.
 */
const LAST_NEWS_PAGE = 4;

export const newsPageRedirects: Redirect[] = Array.from(
  { length: LAST_NEWS_PAGE - 1 },
  (_, i) => ({ from: `/blog/page/${i + 2}/`, to: `/insights/page/${i + 2}/` })
);

/**
 * Wildcards. Cloudflare's `_redirects` supports a trailing `*` and `:splat`.
 *
 * The `/blog/:slug/` rule is the one that was actually broken: those addresses
 * 404'd on the port although the original redirected them, because the posts
 * moved to root-level slugs years ago. The uploads rule recovers every image
 * address at once, including the ones in the original's own og:image tags.
 *
 * Nothing here may overlap anything else: these are matched last, and as the
 * pagination bug proved, a narrower wildcard above a broader one is not a
 * guarantee.
 */
export const wildcardRedirects: Redirect[] = [
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

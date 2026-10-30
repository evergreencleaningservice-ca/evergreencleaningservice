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

/* Extension included deliberately: scripts/redirects.mjs loads this file with
   node's bare type-stripping, which does not resolve extensionless specifiers.
   Every script→src import in this repo is written the same way. */
import { emptyTagSlugs } from './tags.ts';

export type Redirect = { from: string; to: string };

/**
 * Expand an exact-match rule into BOTH trailing-slash spellings.
 *
 * THE DEFECT THIS FIXES. `_redirects` matches a path exactly. A rule written
 * `/office-cleaning/` does not match `/office-cleaning`, and because there is
 * no asset at the slashless path either, the edge has nothing to normalise
 * onto and answers 404. Measured against the deployed Worker before this
 * existed: **all 24 exact-match legacy rules 404'd without the slash.**
 *
 * That is a regression created by the migration, not a pre-existing gap.
 * WordPress answers both spellings today — it 301s the slashless form onto
 * the slashed one — so every inbound link written without a trailing slash
 * works right now and would have died at cutover. Directory listings, email
 * signatures and citations omit the slash constantly.
 *
 * ONE HOP, NOT TWO. The slashless variant is mapped straight to the same
 * final target, never to the slashed source. Chaining
 * `/office-cleaning` → `/office-cleaning/` → `/services/office-cleaning/`
 * would work in a browser and is still worse: it doubles the latency on a
 * cold connection and spends redirect budget for nothing.
 *
 * QUERY STRINGS survive without being mentioned here. Cloudflare's static
 * router carries the original query onto the Location of a `_redirects` hop,
 * which matters because these are exactly the addresses a `?utm_source=` or a
 * `?gclid=` arrives on. Asserted against the deployed origin rather than
 * taken on trust — see `tests/build/redirect-variants.test.ts` and
 * `npm run parity`.
 *
 * NOT FOR WILDCARDS. A splat rule already matches both spellings, and
 * expanding one would emit a duplicate that shadows the rule beneath it.
 */
export function bothSlashSpellings(rules: Redirect[]): Redirect[] {
  const out: Redirect[] = [];
  const seen = new Set<string>();

  for (const rule of rules) {
    if (rule.from.includes('*')) {
      throw new Error(
        `bothSlashSpellings received the wildcard rule "${rule.from}". ` +
          'Wildcards already match both spellings and must not be expanded.'
      );
    }

    /**
     * A FILE ADDRESS HAS NO SLASHED SPELLING. `/sitemap.xml` is a file, and
     * `/sitemap.xml/` is not an address anybody has ever linked to — no
     * server produced it and no crawler will request it. An earlier version
     * of this function emitted it anyway, along with `/sitemap_index.xml/`,
     * because it treated every source as a directory.
     *
     * Harmless at the edge, but it puts rules in the map that can never
     * match, and a redirect map is read by people deciding what is covered.
     * Detected by an extension on the last segment, which is what separates
     * `/sitemap.xml` from `/feed` — the latter is a WordPress route and does
     * take both spellings.
     */
    const lastSegment = rule.from.replace(/\/$/, '').split('/').pop() ?? '';
    const isFile = /\.[a-z0-9]{2,5}$/i.test(lastSegment);

    const bare = rule.from.replace(/\/$/, '');
    const spellings = isFile ? [bare] : [`${bare}/`, bare];

    /* The slashed spelling first, so it keeps its original precedence among
       rules that were deliberately ordered. */
    for (const from of spellings) {
      /* `/` reduced to '' is not an address, and the root is never a legacy
         redirect source anyway. */
      if (from === '') continue;
      if (seen.has(from)) continue;
      seen.add(from);
      out.push({ from, to: rule.to });
    }
  }

  return out;
}

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
 * and known, so they are generated from it. The old blog had four pages.
 * `LAST_NEWS_PAGE` tracks `pageSize: 10` in src/pages/insights/[...page].astro
 * — change it when the post count crosses a multiple of ten. An old page past
 * the last one goes to the first.
 */
const OLD_NEWS_PAGES = 4;
const LAST_NEWS_PAGE = 3;

export const newsPageRedirects: Redirect[] = Array.from(
  { length: OLD_NEWS_PAGES - 1 },
  (_, i) => ({
    from: `/blog/page/${i + 2}/`,
    to: i + 2 <= LAST_NEWS_PAGE ? `/insights/page/${i + 2}/` : '/insights/',
  })
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
  { from: '/author/*', to: '/category/blog/' },
];

/**
 * The nine tag addresses that redirect — and the reason `/tag/*` is NOT here.
 *
 * `/tag/*` used to be a blanket 301 to `/category/blog/`, which was right
 * while this site had no tag archives. It has 26 of them now, and the
 * wildcard SHADOWED EVERY ONE.
 *
 * That is the finding, and it was measured rather than reasoned about:
 * deployed with both in place, `/tag/cleaning/` answered 301 to
 * `/category/blog/` even though `/tag/cleaning/index.html` was sitting in the
 * bundle. Cloudflare's asset router consults `_redirects` BEFORE it looks for
 * a matching asset, so a wildcard redirect beats a real file every time. An
 * asset does not win by being more specific, and nothing about the file order
 * changes it — the same lesson the `/blog/page/N/` bug taught one level up.
 *
 * So the wildcard is replaced by exactly the addresses that still need it:
 * the nine tags WordPress's theme-unit-test import left behind with zero
 * posts. A tag with nothing filed under it has no archive worth serving, and
 * the blog is the right place to land.
 *
 * WHAT THIS GIVES UP, stated plainly: a `/tag/<something-else>/` address now
 * 404s instead of redirecting. That matches the original, which 404s an
 * unknown term archive too — the old wildcard was more generous than the site
 * it was porting. Every tag address the original actually serves is covered,
 * 26 by a real page and 9 by a rule.
 */
export const emptyTagRedirects: Redirect[] = emptyTagSlugs.map((slug) => ({
  from: `/tag/${slug}/`,
  to: '/category/blog/',
}));

/**
 * Blog posts retired by the consolidation of 30 Oct 2026 (SEO audit H7: 38
 * posts to 23). Search Console showed no clicks and no external links to any
 * of them (16 months of data, 9-28 Oct populated, exported 30 Oct), so each
 * goes to the page that now covers its topic: the five COVID-era posts to the
 * rebuilt disinfection page, the post that competed with the commercial
 * cleaning pillar to the pillar, and the rest to the post they were merged
 * into. The old `/blog/<slug>/` spelling of each goes straight there too,
 * rather than through the `/blog/*` wildcard and a second hop.
 */
const retiredPosts: Record<string, string> = {
  'be-safe-from-coronavirus-work': '/services/disinfection-cleaning/',
  'clean-and-disinfect-public-areas-during-covid-19': '/services/disinfection-cleaning/',
  'coronavirus-bringing-more-urgency-cleaning': '/services/disinfection-cleaning/',
  'the-return-of-employees-post-covid-19-is-your-office-ready': '/services/disinfection-cleaning/',
  'covid-19-commercial-cleaning-expectations-examined': '/services/disinfection-cleaning/',
  'benefits-of-regular-commercial-cleaning-services': '/services/commercial-cleaning/',
  'key-office-areas-to-have-cleaned-and-disinfected': '/areas-in-your-office-where-germs-are-likely-hiding/',
  '5-tips-for-maintaining-clean-office-air': '/commercial-cleaning-air-quality/',
  'control-allergies-workplace-with-professional-janitorial-services': '/commercial-cleaning-air-quality/',
  'modern-vs-old-fashioned-cleaning-methods': '/robotic-vs-manual-cleaning-which-will-ultimately-succeed/',
  'does-hand-sanitization-actually-help-prevent-illnesses': '/importance-of-hand-washing/',
  'qualities-top-cleaning-professionals': '/how-to-decide-on-a-cleaning-company/',
  'workplace-cleaning-checklist-winter': '/seasonal-office-cleaning-checklist/',
  'tips-tricks-for-spring-cleaning-your-office': '/seasonal-office-cleaning-checklist/',
  'end-of-summer-cleaning': '/seasonal-office-cleaning-checklist/',
  'office-cleaning-fall': '/seasonal-office-cleaning-checklist/',
};

export const retiredPostSlugs = Object.keys(retiredPosts);

/**
 * Archive pages the consolidation removed: with 23 posts instead of 38, the
 * last page of these lists no longer exists. Each goes to its first page.
 */
export const removedArchivePageRedirects: Redirect[] = [
  ['/insights/page/4/', '/insights/'],
  ['/category/blog/page/4/', '/category/blog/'],
  ['/tag/commercial-cleaning/page/3/', '/tag/commercial-cleaning/'],
  ['/tag/commercial-office-cleaning/page/3/', '/tag/commercial-office-cleaning/'],
  ['/tag/janitorial-services/page/3/', '/tag/janitorial-services/'],
  ['/tag/office/page/2/', '/tag/office/'],
].map(([from, to]) => ({ from, to }));

/** The two tags the consolidation left with no posts. */
export const retiredTagRedirects: Redirect[] = ['coronavirus', 'covid-19'].map((slug) => ({
  from: `/tag/${slug}/`,
  to: '/services/disinfection-cleaning/',
}));

export const retiredPostRedirects: Redirect[] = Object.entries(retiredPosts).flatMap(
  ([slug, to]) => [
    { from: `/${slug}/`, to },
    { from: `/blog/${slug}/`, to },
  ]
);

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

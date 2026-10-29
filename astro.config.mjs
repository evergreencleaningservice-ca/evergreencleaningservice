// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { lastmodFor } from './src/lib/sitemap-lastmod.mjs';

export default defineConfig({
  site: 'https://www.evergreencleaningservice.ca',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    /* Inline every stylesheet into the page (2026-10-15). The site's CSS is
       small (four files, ~13KB compressed), but as four separate
       render-blocking requests it cost ~600ms of first paint under mobile
       throttling — measured with scripts/lh-masquerade.mjs. Inlined, the
       first response carries everything needed to paint. */
    inlineStylesheets: 'always',
  },
  // Redirects are NOT declared here. Astro's static redirects build an HTML
  // page that returns 200 with a meta refresh; the specification asks for 301s
  // and Section 5 tests for them. They live in src/data/redirects.ts and are
  // written to dist/_redirects by scripts/redirects.mjs, which Cloudflare's
  // asset router serves as real 301s.
  integrations: [
    sitemap({
      /*
       * Nothing noindexed goes in the sitemap. Submitting a URL and then
       * telling the crawler not to index it is a contradiction, and Search
       * Console reports it as an error against the property.
       *
       *   /category/blog/  "follow, noindex", matching the original. /insights/
       *                    covers the same posts and is indexable.
       *   /lp/*            PPC landing pages, noindex by design — they compete
       *                    with the service pages for the same intent and exist
       *                    only for paid traffic.
       *   /thank-you/      a conversion confirmation. Indexed, it can be landed
       *                    on directly, firing the conversion for someone who
       *                    submitted nothing.
       *   /tag/*           26 tag archives and their pages, "follow, noindex"
       *                    exactly as the original serves them. They exist to
       *                    be browsed and to carry crawlers through to the
       *                    posts, not to be indexed as 34 thin pages listing
       *                    the same 38 articles the indexable /insights/
       *                    already covers.
       *   /admin/*         the admin, behind Cloudflare Access.
       *   /eg-live-post-shell/  the template live posts are drawn in
       *                    (src/lib/admin/live-posts.ts); never served itself.
       *                    The live posts are added to the sitemap by the Worker.
       *   /search/         "follow, noindex" (2026-10-29, SEO audit M1): one
       *                    word of content until someone types a query, and
       *                    nothing links to it.
       *   /insights/page/N/  the archive's later pages (M2). They stay
       *                    crawlable and linked from /insights/; they are just
       *                    not pages anyone should land on from a search.
       */
      filter: (page) =>
        !/\/(category\/blog|lp|thank-you|tag|admin|eg-live-post-shell|search|insights\/page\/\d+)\//.test(page),
      /* Real content dates, never the build time — src/lib/sitemap-lastmod.mjs. */
      serialize: (item) => {
        const lastmod = lastmodFor(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});

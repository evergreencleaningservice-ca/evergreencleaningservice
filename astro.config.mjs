// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.evergreencleaningservice.ca',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Redirects are NOT declared here. Astro's static redirects build an HTML
  // page that returns 200 with a meta refresh; the specification asks for 301s
  // and Section 5 tests for them. They live in src/data/redirects.ts and are
  // written to dist/_redirects by scripts/redirects.mjs, which Cloudflare's
  // asset router serves as real 301s.
  integrations: [
    sitemap({
      // The category archive carries robots "follow, noindex" to match the
      // original, so listing it in the sitemap would invite crawlers to index
      // what those pages ask them not to. /blog/ covers the same posts.
      filter: (page) => !/\/category\/blog\//.test(page),
    }),
  ],
});

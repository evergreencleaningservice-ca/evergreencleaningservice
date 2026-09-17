// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.evergreencleaningservice.ca',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Old WordPress addresses that no longer have a page of their own. Kept so
  // existing links and search results still land somewhere useful.
  redirects: {
    // The 2019 service URLs the current /services/ tree replaced.
    '/office-cleaning/': '/services/office-cleaning/',
    '/commercial-cleaning/': '/services/commercial-cleaning/',
    '/industrial-cleaning/': '/services/industrial-cleaning/',
    '/emergency-service/': '/services/emergency-cleaning-services/',
    '/testimonial/': '/testimonials/',

    // WordPress tag and author archives. This port has no tag or author
    // taxonomy, so every archive URL the old site served (the list comes from
    // the 200-status captures in the archive crawl) goes to the news archive.
    '/author/webmaster/': '/category/blog/',
    '/tag/ai/': '/category/blog/',
    '/tag/air-quality/': '/category/blog/',
    '/tag/allergies/': '/category/blog/',
    '/tag/breakroom/': '/category/blog/',
    '/tag/cleaning/': '/category/blog/',
    '/tag/cleaning/page/2/': '/category/blog/',
    '/tag/cleaning-products/': '/category/blog/',
    '/tag/commercial-cleaning/': '/category/blog/',
    '/tag/commercial-cleaning/page/2/': '/category/blog/',
    '/tag/commercial-office-cleaning/': '/category/blog/',
    '/tag/commercial-office-cleaning/page/2/': '/category/blog/',
    '/tag/commercial-office-cleaning/page/3/': '/category/blog/',
    '/tag/coronavirus/': '/category/blog/',
    '/tag/covid-19/': '/category/blog/',
    '/tag/daycares/': '/category/blog/',
    '/tag/dental-office/': '/category/blog/',
    '/tag/dust/': '/category/blog/',
    '/tag/dusting/': '/category/blog/',
    '/tag/entrance/': '/category/blog/',
    '/tag/janitorial-services/': '/category/blog/',
    '/tag/janitorial-services/page/2/': '/category/blog/',
    '/tag/manual-cleaning/': '/category/blog/',
    '/tag/moving/': '/category/blog/',
    '/tag/office/': '/category/blog/',
    '/tag/office/page/2/': '/category/blog/',
    '/tag/plants/': '/category/blog/',
    '/tag/refrigerator/': '/category/blog/',
    '/tag/relocating/': '/category/blog/',
    '/tag/retail/': '/category/blog/',
    '/tag/robotic/': '/category/blog/',
    '/tag/schools/': '/category/blog/',
    '/tag/winter/': '/category/blog/',

    // Left over from the OnePress demo content the old install never removed.
    '/portfolio/project-title-sixth/': '/cleaning-demo-gallery/',
  },
  integrations: [
    sitemap({
      // The category archive carries robots "follow, noindex" to match the
      // original, so listing it in the sitemap would invite crawlers to index
      // what those pages ask them not to. /blog/ covers the same posts.
      filter: (page) => !/\/category\/blog\//.test(page),
    }),
  ],
});

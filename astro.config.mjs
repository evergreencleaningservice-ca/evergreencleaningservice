// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.evergreencleaningservice.ca',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // The 2019 service URLs the current navigation replaced. Kept so old links
  // and search results still land on the right page.
  redirects: {
    '/office-cleaning/': '/services/office-cleaning/',
    '/commercial-cleaning/': '/services/commercial-cleaning/',
    '/industrial-cleaning/': '/services/industrial-cleaning/',
    '/emergency-service/': '/services/emergency-cleaning-services/',
    '/testimonial/': '/testimonials/',
  },
  integrations: [sitemap()],
});

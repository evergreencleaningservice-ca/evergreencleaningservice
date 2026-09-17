/**
 * Marks a build as "preview only" so search engines ignore it.
 *
 * The preview is served from evergreencleaningservice.10xconnections.com while
 * the real site is still the WordPress install on evergreencleaningservice.ca.
 * Two copies of the same copy, both indexable, would compete with each other,
 * so every preview response carries X-Robots-Tag: noindex and robots.txt
 * disallows everything.
 *
 * This runs for `npm run build:preview` only. The production build
 * (`npm run build`) never calls it, so going live is just a matter of deploying
 * that instead.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');

if (!fs.existsSync(dist)) {
  console.error('noindex: dist/ not found — run the build first.');
  process.exit(1);
}

// Cloudflare Workers static assets reads _headers from the asset directory.
fs.writeFileSync(
  path.join(dist, '_headers'),
  ['/*', '  X-Robots-Tag: noindex, nofollow', ''].join('\n')
);

fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  ['# Preview deployment — not the live site.', 'User-agent: *', 'Disallow: /', ''].join('\n')
);

console.log('noindex: preview build marked noindex (X-Robots-Tag + robots.txt)');

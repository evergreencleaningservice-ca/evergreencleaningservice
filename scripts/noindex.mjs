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
//
// The 10xconnections.com zone caches HTML at the edge, so without the
// Cache-Control below a deploy keeps serving the previous build until the
// cache is purged. `no-cache` means "revalidate before serving", not "don't
// store", so ETags still do the heavy lifting — the right trade for a preview
// that gets redeployed far more often than it gets read.
fs.writeFileSync(
  path.join(dist, '_headers'),
  ['/*', '  X-Robots-Tag: noindex, nofollow', '  Cache-Control: no-cache', ''].join('\n')
);

// robots.txt must NOT disallow here. `Disallow: /` stops a crawler fetching the
// page at all, so it never reads the X-Robots-Tag above — and the URL can still
// be indexed from an inbound link, with no way for the noindex to be seen. The
// header is the single source of truth; robots.txt only says what this is.
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  ['# Preview deployment — not the live site.', 'User-agent: *', 'Allow: /', ''].join('\n')
);

console.log('noindex: preview build marked noindex (X-Robots-Tag + robots.txt)');

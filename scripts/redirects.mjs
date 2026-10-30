/**
 * Writes dist/_redirects — the real 301s.
 *
 * Cloudflare's static-asset router reads this file and returns an actual 301.
 * Astro's own `redirects` config cannot: it emits an HTML page that returns 200
 * with a meta refresh, which fails Section 5's "return HTTP 301 status codes"
 * check on its own terms.
 *
 * Order matters — Cloudflare takes the first rule that matches, so the specific
 * paths are written before the wildcards that would otherwise swallow them.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  specRedirects,
  legacyRedirects,
  newsPageRedirects,
  emptyTagRedirects,
  retiredPostRedirects,
  retiredTagRedirects,
  removedArchivePageRedirects,
  wildcardRedirects,
  bothSlashSpellings,
} from '../src/data/redirects.ts';

const uploadRedirects = JSON.parse(
  fs.readFileSync(path.resolve('src/data/upload-redirects.json'), 'utf8')
);

/* `DIST` lets a test build into a throwaway directory and generate the map
   beside it, so the rules under test are the ones this script really emits
   rather than a copy of the logic. Defaults to the real output directory. */
const dist = path.resolve(process.env.DIST || 'dist');
if (!fs.existsSync(dist)) {
  console.error('redirects: dist/ not found — run the build first.');
  process.exit(1);
}

const lines = [];
const section = (title, rows) => {
  lines.push(`# ${title}`);
  for (const { from, to } of rows) lines.push(`${from} ${to} 301`);
  lines.push('');
};

/* Every exact-match source is emitted in both trailing-slash spellings, each
   going straight to the same final target in one hop. See
   `bothSlashSpellings` in src/data/redirects.ts for why. */
section('Section 2.1 of the overhaul specification', bothSlashSpellings(specRedirects));
section(
  'Legacy addresses the archive shows this site actually served',
  bothSlashSpellings(legacyRedirects)
);
section(
  'Image addresses — explicit, because a splat cannot take just the basename',
  Object.entries(uploadRedirects).map(([from, to]) => ({ from, to }))
);
section(
  'News pagination — static, because wildcard order is not honoured',
  bothSlashSpellings(newsPageRedirects)
);
/* The nine zero-post tags, named one by one rather than swept up by a
   `/tag/*` wildcard. The wildcard shadowed all 26 real tag archives, because
   Cloudflare reads this file before it looks for a matching asset — see
   `emptyTagRedirects` in src/data/redirects.ts. */
section("Tags the original carries with no posts", bothSlashSpellings(emptyTagRedirects));
section('Blog posts retired by the consolidation (SEO audit H7)', bothSlashSpellings(retiredPostRedirects));
section('Tags the consolidation emptied', bothSlashSpellings(retiredTagRedirects));
section('Archive pages the consolidation removed', bothSlashSpellings(removedArchivePageRedirects));
/* The single sitemap was split by type on 30 Oct 2026 (SEO audit M2). Search
   Console had been reading sitemap-0.xml since 10 Oct, so it points at the
   pages sitemap rather than 404ing. */
section('Sitemap split', [{ from: '/sitemap-0.xml', to: '/sitemap-pages-0.xml' }]);

/* Every page this build serves, spelled without its trailing slash. Without a
   rule, Cloudflare's asset router answers `/about-us` with a 307 to
   `/about-us/`: temporary, so links to the slash-less spelling pass no signal
   (SEO audit M3, 28 Oct 2026). Exact rules, because a splat would also catch
   the slashed spelling and loop. Sources that an earlier rule already
   redirects elsewhere are skipped, so first-match order cannot change. */
const taken = new Set(lines.filter((l) => l.endsWith(' 301')).map((l) => l.split(' ')[0]));
const pagePaths = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (fs.existsSync(path.join(full, 'index.html'))) {
      pagePaths.push('/' + path.relative(dist, full).split(path.sep).join('/'));
    }
    walk(full);
  }
};
walk(dist);
section(
  'Pages, slash-less spelling to the canonical one',
  pagePaths
    .filter((p) => !p.startsWith('/admin') && !taken.has(p))
    .sort()
    .map((p) => ({ from: p, to: `${p}/` }))
);
/* Wildcards are NOT expanded: a splat already matches both spellings, and a
   duplicated rule here would shadow the one below it. */
section('Wildcards, last so the rules above win', wildcardRedirects);

fs.writeFileSync(path.join(dist, '_redirects'), lines.join('\n'));
const count = lines.filter((l) => l.endsWith(' 301')).length;
console.log(`redirects: ${count} rules written to ${path.relative(process.cwd(), path.join(dist, '_redirects'))}`);

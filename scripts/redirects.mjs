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
/* Wildcards are NOT expanded: a splat already matches both spellings, and a
   duplicated rule here would shadow the one below it. */
section('Wildcards, last so the rules above win', wildcardRedirects);

fs.writeFileSync(path.join(dist, '_redirects'), lines.join('\n'));
const count = lines.filter((l) => l.endsWith(' 301')).length;
console.log(`redirects: ${count} rules written to ${path.relative(process.cwd(), path.join(dist, '_redirects'))}`);

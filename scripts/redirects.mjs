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
} from '../src/data/redirects.ts';

const uploadRedirects = JSON.parse(
  fs.readFileSync(path.resolve('src/data/upload-redirects.json'), 'utf8')
);

const dist = path.resolve('dist');
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

section('Section 2.1 of the overhaul specification', specRedirects);
section('Legacy addresses the archive shows this site actually served', legacyRedirects);
section(
  'Image addresses — explicit, because a splat cannot take just the basename',
  Object.entries(uploadRedirects).map(([from, to]) => ({ from, to }))
);
section('News pagination — static, because wildcard order is not honoured', newsPageRedirects);
section('Wildcards, last so the rules above win', wildcardRedirects);

fs.writeFileSync(path.join(dist, '_redirects'), lines.join('\n'));
const count = lines.filter((l) => l.endsWith(' 301')).length;
console.log(`redirects: ${count} rules written to dist/_redirects`);

/**
 * Purges the Cloudflare edge cache for every hostname this Worker serves,
 * after a deploy — staging and both production addresses, because they are
 * one build and one deploy lands on all of them at once. Purging a production
 * URL before the cutover is harmless: it only empties a cache.
 *
 * Workers serves the new assets immediately, but the zone caches HTML at the
 * edge, so the custom domain can keep returning the previous build. Purge by
 * host is Enterprise-only, so this purges by URL, which every plan supports,
 * in the 30-per-request batches the API accepts.
 *
 * Needs CF_API_TOKEN in the environment. Skips quietly if it is absent, so a
 * plain `wrangler deploy` on a machine without the token still succeeds.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site.ts';

const ZONE = '86ba115f2d433837c1d8a93b62288142'; // evergreencleaningservice.ca
const HOSTS = [PREVIEW_HOST, ...PRODUCTION_HOSTS].map((h) => `https://${h}`);
const TOKEN = process.env.CF_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;

if (!TOKEN) {
  console.log('purge: no CF_API_TOKEN set — skipping cache purge.');
  process.exit(0);
}

// Every built page, plus the root-level files the sitemap does not list.
const dist = path.resolve('dist');
const paths = new Set(['/', '/robots.txt', '/rss.xml', '/sitemap-index.xml']);

/* Redirect sources are not assets, so they were never in this list — and the
   edge had cached their 404 from before the rules existed. A deploy that adds a
   redirect then serves a stale 404 from the address it was meant to fix looks
   exactly like a broken rule. Read them out of dist/_redirects so the list
   cannot drift from what was deployed. */
try {
  const rules = fs.readFileSync(path.join('dist', '_redirects'), 'utf8').split('\n');
  for (const line of rules) {
    const from = line.trim().split(/\s+/)[0];
    if (from && !from.startsWith('#') && !from.includes('*')) paths.add(from);
  }
} catch {
  // no _redirects in this build; nothing extra to purge
}

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') {
      const rel = path.relative(dist, path.dirname(full)).split(path.sep).join('/');
      paths.add(rel ? `/${rel}/` : '/');
    }
  }
};
walk(dist);

const list = HOSTS.flatMap((host) => [...paths].map((p) => host + p));
const batches = [];
for (let i = 0; i < list.length; i += 30) batches.push(list.slice(i, i + 30));

let purged = 0;
for (const [i, files] of batches.entries()) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  const body = await res.json();
  if (body.success) {
    purged += files.length;
  } else {
    console.error(`purge: batch ${i + 1} failed —`, JSON.stringify(body.errors));
    process.exitCode = 1;
  }
}

console.log(`purge: ${purged}/${list.length} URLs purged from the edge cache.`);

/**
 * Tells the IndexNow engines (Bing, Yandex and the others that share
 * submissions) which pages changed, after a production deploy. SEO audit
 * ACTION-PLAN item 28, added 2026-11-06.
 *
 *   npm run indexnow                    URLs whose lastmod is in the last 3 days
 *   npm run indexnow -- --days 14       ... in the last 14 days
 *   npm run indexnow -- --all           every URL in the sitemaps
 *   npm run indexnow -- --dry-run       print the payload; send nothing
 *   npm run indexnow -- --dist <dir>    read the sitemaps from another build
 *
 * It runs last in `npm run deploy`, after the purge, so an engine that
 * fetches a submitted URL straight away gets the new page rather than the
 * edge's cached copy. It is not in `deploy:preview`: staging is noindex, and
 * every submitted URL is on www.
 *
 * NEVER FAILS A DEPLOY. Any error, a network failure, a timeout or a non-2xx
 * answer is logged and the script still exits 0: by this point the site is
 * already live, and the sitemap still lists every URL for the next crawl.
 *
 * The selection and the payload are in scripts/lib/indexnow.mjs, tested by
 * tests/indexnow.test.ts with fixture sitemaps and a stub fetch.
 */
import fs from 'node:fs';
import { INDEXNOW_ENDPOINT, INDEXNOW_KEY } from '../src/data/indexnow.ts';
import { site } from '../src/data/site.ts';
import { run } from './lib/indexnow.mjs';

try {
  await run({
    argv: process.argv.slice(2),
    host: new URL(site.url).host,
    key: INDEXNOW_KEY,
    endpoint: INDEXNOW_ENDPOINT,
    readFile: (file) => fs.readFileSync(file, 'utf8'),
  });
} catch (err) {
  // run() reports its own failures; this is only for one it did not expect.
  console.log(`indexnow: ${err instanceof Error ? err.message : String(err)}. Not failing the deploy.`);
}
process.exitCode = 0;

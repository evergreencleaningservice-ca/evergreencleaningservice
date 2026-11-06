/**
 * SEO drift monitor, against a DEPLOYED origin (audit ACTION-PLAN item 32).
 *
 *   npm run seo:baseline                         capture the live site now
 *   npm run seo:drift                            compare the live site with it
 *   npm run seo:drift -- --origin https://stage.evergreencleaningservice.ca
 *   node scripts/seo-drift.mjs check --baseline <file>
 *
 * `baseline` reads every URL in the live sitemaps plus the pages that must
 * stay noindex (`MUST_STAY_NOINDEX` in `scripts/lib/seo-drift.mjs`) and writes
 * what a search engine reads from each one — status and redirect target,
 * title, description, robots meta, X-Robots-Tag, canonical, H1s, H2 count,
 * JSON-LD types, og:image, the word count and a hash of <main> — to
 * `evergreencleaningservice.ca-audit/baseline/seo-baseline.json`.
 *
 * `check` reads the same pages again and classifies every difference as
 * CRITICAL, WARNING or INFO (the rules are written out above
 * `compareSnapshots`). Exit codes: 0 nothing critical; 1 at least one
 * CRITICAL; 3 nothing critical but some page could not be read (a challenge,
 * a rate limit, a network error), so the run is incomplete rather than clean;
 * 2 usage or a missing baseline.
 *
 * WHY THIS IS NOT A UNIT TEST. Like `verify-indexing.mjs`, it is about what
 * the origin serves, which can differ from the build: a stale deploy, an edge
 * cache, a transform rule. The parsing and the classification ARE unit-tested
 * (`tests/tooling/seo-drift.test.ts`); the fetching is this script.
 *
 * READ-ONLY. GET only, one request at a time, no faster than one every
 * 300 ms, with a User-Agent that names this monitor. It changes nothing.
 *
 * When a reported change is intended, re-run `seo:baseline` and commit the
 * new JSON with the change, so the baseline always describes the site as it
 * is meant to be.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  capture,
  compareSnapshots,
  exitCode,
  formatReport,
  stableStringify,
  toBaseline,
} from './lib/seo-drift.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = path.join(ROOT, 'evergreencleaningservice.ca-audit/baseline/seo-baseline.json');
const DEFAULT_ORIGIN = 'https://www.evergreencleaningservice.ca';

const usage = () => {
  console.error(
    'usage: node scripts/seo-drift.mjs baseline|check [--origin <https://host>] [--baseline <file>] [--quiet]'
  );
  process.exit(2);
};

const args = process.argv.slice(2);
const mode = args[0];
if (mode !== 'baseline' && mode !== 'check') usage();
const option = (name) => {
  const at = args.indexOf(name);
  if (at === -1) return null;
  if (!args[at + 1] || args[at + 1].startsWith('--')) usage();
  return args[at + 1];
};
const baselinePath = path.resolve(option('--baseline') ?? DEFAULT_BASELINE);
const quiet = args.includes('--quiet');
const log = quiet ? () => {} : (line) => console.error(line);

const originOf = (raw) => {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('not http(s)');
    return u.origin;
  } catch {
    console.error(`seo-drift: --origin must be an http(s) URL, got ${raw}`);
    process.exit(2);
  }
};

if (mode === 'baseline') {
  const origin = originOf(option('--origin') ?? DEFAULT_ORIGIN);
  console.error(`seo-drift baseline: ${origin}`);
  const snapshot = await capture({ origin, log });

  /* A baseline with a challenge page in it would make every later check
     compare against the interstitial. Refuse to write one. */
  const unverified = Object.entries(snapshot.unverified);
  if (unverified.length || snapshot.sitemapUnverified || !snapshot.sitemap.ok) {
    console.error(
      `\nseo-drift: NOT writing a baseline. ${unverified.length} page(s) could not be read` +
        `${snapshot.sitemapUnverified || !snapshot.sitemap.ok ? ' and the sitemap was not read in full' : ''}:`
    );
    for (const [p, why] of unverified) console.error(`  ${p}  ${why}`);
    process.exit(3);
  }

  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(baselinePath, stableStringify(toBaseline(snapshot)));
  const pages = Object.values(snapshot.pages);
  console.log(
    `seo-drift: wrote ${path.relative(ROOT, baselinePath)} — ${pages.length} URLs ` +
      `(${pages.filter((p) => p.inSitemap).length} from the sitemap, ` +
      `${pages.filter((p) => p.mustStayNoindex).length} must-stay-noindex), captured ${snapshot.capturedAt}`
  );
} else {
  if (!fs.existsSync(baselinePath)) {
    console.error(`seo-drift: no baseline at ${baselinePath}. Run \`npm run seo:baseline\` first.`);
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const origin = originOf(option('--origin') ?? baseline.origin ?? DEFAULT_ORIGIN);
  log(`seo-drift check: ${origin}`);
  const current = await capture({
    origin,
    mustStayNoindex: baseline.mustStayNoindex,
    extraPaths: Object.keys(baseline.pages),
    log,
  });
  const findings = compareSnapshots(baseline, current);
  console.log(`\n${formatReport(findings, baseline, current)}`);
  process.exit(exitCode(findings, current));
}

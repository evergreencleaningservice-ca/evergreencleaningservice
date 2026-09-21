/**
 * Migration parity, checked against a DEPLOYED origin.
 *
 * THE QUESTION. At cutover, every address the old WordPress site served
 * starts being answered by this build instead. An address that answered 200
 * before and 404s after is a lost page, a lost backlink and, if it ranked, a
 * lost position. `dist/_redirects` is supposed to prevent that. This asks
 * whether the origin actually honours it.
 *
 * WHY NOT A BUILD TEST. `tests/build/headings-and-links.test.ts` already reads
 * the emitted `_redirects` and proves every internal link resolves. It cannot
 * prove Cloudflare PARSES that file the way the build assumes — rule order,
 * splat semantics, whether a rule is skipped for colliding with a real asset,
 * and the 2,100-rule limit are all properties of the edge, not of the file.
 * A `_redirects` that is right in the repository and inert at the edge looks
 * identical from here until someone requests an old URL.
 *
 * WHAT IT ASSERTS PER RULE
 *   1. the status is a real 301, not a 200 carrying a meta refresh
 *   2. the Location is the target the map names
 *   3. the target itself then answers 200 — a 301 into a 404 is still a dead
 *      address, and is the failure this catches that a rule-by-rule read of
 *      the file cannot
 *
 * READ-ONLY. GET and HEAD only. It changes nothing, and it is pointed at
 * staging because production is not this build.
 *
 * Usage:
 *   node scripts/migration-parity.mjs                 staging
 *   node scripts/migration-parity.mjs <origin>
 *   node scripts/migration-parity.mjs --json <file>
 */
import fs from 'node:fs';
import path from 'node:path';
import { PREVIEW_HOST } from '../src/data/site.ts';
import {
  specRedirects,
  legacyRedirects,
  newsPageRedirects,
  wildcardRedirects,
} from '../src/data/redirects.ts';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonPath = jsonAt !== -1 ? args[jsonAt + 1] : null;
const positional = args.filter((a, i) => a !== '--json' && i !== jsonAt + 1);
const origin = positional[0]
  ? new URL(positional[0]).origin
  : `https://${PREVIEW_HOST}`;

const uploadRedirects = JSON.parse(
  fs.readFileSync(path.resolve('src/data/upload-redirects.json'), 'utf8')
);

/**
 * A splat rule cannot be requested literally — `/blog/*` is a pattern, not an
 * address — so each one is exercised with a concrete path that the pattern
 * must match. The expected target substitutes the splat the same way
 * Cloudflare does, which is the behaviour actually under test.
 *
 * THE STAND-IN HAS TO BE A REAL SLUG, and an earlier version of this file
 * proved why: with an invented `parity-probe`, `/blog/*  ->  /:splat` was
 * reported FAIL because `/parity-probe/` answers 404. The rule was correct;
 * the probe had asked it to redirect to a page that does not exist. That is
 * the "confident wrong answer that looks like a finding" this codebase has
 * been bitten by before, so the stand-ins below are read off the content
 * collection rather than made up — a slug that stops existing breaks this
 * check loudly instead of turning it into a false alarm.
 */
/**
 * THE TRAILING SLASH IS PART OF THE ADDRESS. The site is built with
 * `trailingSlash: 'always'`, and WordPress served these addresses with one
 * too, so a stand-in without it is not the address anyone ever linked to.
 * Left off, `/blog/<slug>` redirects to `/<slug>`, which then takes a second
 * hop — a 307 from the edge's own slash normalisation — and the check
 * reported that as the rule pointing at a broken target. It was measuring a
 * URL nobody has.
 */
const STAND_IN = {
  '/blog/*': 'workplace-cleaning-checklist-winter/',
  /* /tag/ and /author/ collapse everything onto one page, so the value is
     genuinely arbitrary and any string exercises the rule. */
  '/tag/*': 'office-cleaning/',
  '/author/*': 'webmaster/',
};

const concrete = (rule) => {
  if (!rule.from.includes('*')) return { from: rule.from, to: rule.to };
  const stand = STAND_IN[rule.from];
  if (!stand) throw new Error(`no stand-in slug registered for the rule ${rule.from}`);
  return {
    from: rule.from.replace('*', stand),
    to: rule.to.replace(/:splat/g, stand).replace('*', stand),
    pattern: rule.from,
  };
};

const GROUPS = [
  { name: 'Section 2.1 specification map', rules: specRedirects },
  { name: 'Legacy addresses from the archive crawl', rules: legacyRedirects },
  {
    name: 'WordPress upload paths',
    rules: Object.entries(uploadRedirects).map(([from, to]) => ({ from, to })),
    /* 39 explicit image rules. Sampled rather than walked in full: they are
       one mechanism repeated, the cost is 39 extra round trips against a live
       edge, and a failure in one is a failure in all of them. The sample is
       the first, the last and every tenth. */
    sample: 10,
  },
  { name: 'News pagination', rules: newsPageRedirects },
  { name: 'Wildcards', rules: wildcardRedirects },
];

const rows = [];
let checked = 0;
let failed = 0;

const req = async (url, method = 'GET') => {
  const res = await fetch(url, {
    method,
    redirect: 'manual',
    headers: {
      'User-Agent': 'evergreen-migration-parity (read-only redirect check)',
      Accept: 'text/html,*/*;q=0.8',
    },
  });
  const body = method === 'GET' && /text|xml|json/.test(res.headers.get('content-type') ?? '')
    ? await res.text()
    : '';
  return { res, body };
};

console.log(`\nMigration parity — ${origin}\n`);

for (const group of GROUPS) {
  const rules = group.sample
    ? group.rules.filter((_, i) => i === 0 || i === group.rules.length - 1 || i % group.sample === 0)
    : group.rules;

  console.log(
    `\n=== ${group.name}  (${rules.length}${group.sample ? ` sampled of ${group.rules.length}` : ''})`
  );

  for (const rule of rules) {
    const { from, to, pattern } = concrete(rule);
    checked++;
    const problems = [];
    let status = null;
    let location = null;
    let targetStatus = null;

    try {
      const { res, body } = await req(new URL(from, origin));
      status = res.status;
      location = res.headers.get('location');

      if (status === 301) {
        /* Cloudflare returns an absolute Location; the map is written in
           relative paths. Compare the resolved paths, not the raw strings. */
        const got = new URL(location, origin).pathname;
        if (got !== to) problems.push(`Location ${got} ≠ ${to}`);
      } else if (status === 200 && /http-equiv=["']refresh/i.test(body)) {
        /* The exact failure this project replaced. A meta refresh resolves for
           a person and is explicitly weaker than a 301 for a crawler, so it
           must not silently come back. */
        problems.push('200 with a meta refresh — not a real 301');
      } else if ([302, 307, 308].includes(status)) {
        problems.push(`${status}, not a permanent 301`);
      } else {
        problems.push(`HTTP ${status}, no redirect`);
      }

      /* A 301 into a 404 is still a dead address. */
      if (status === 301 && location) {
        const t = await req(new URL(location, origin), 'HEAD');
        targetStatus = t.res.status;
        if (targetStatus !== 200) problems.push(`target answers ${targetStatus}`);
      }
    } catch (err) {
      problems.push(`request failed: ${err.message ?? err}`);
    }

    const ok = problems.length === 0;
    if (!ok) failed++;
    rows.push({ group: group.name, pattern: pattern ?? null, from, to, status, location, targetStatus, problems });
    console.log(
      `  ${ok ? ' ok ' : 'FAIL'}  ${from.padEnd(52)} → ${to}` +
        (ok ? '' : `\n          ${problems.join('; ')}`)
    );
  }
}

/* --- addresses that must NOT redirect ------------------------------------ */

/**
 * The other half of the question, and the one a redirect map cannot answer
 * about itself: a wildcard that is too greedy swallows a live page, and the
 * rule still looks correct in the file. So a handful of real pages are
 * requested and required to answer 200 DIRECTLY — no hop.
 */
const MUST_BE_DIRECT = [
  '/',
  '/about-us/',
  '/contact-us/',
  '/services/',
  '/services/office-cleaning/',
  '/services/commercial-cleaning/',
  '/request-a-quote/',
  '/insights/',
  /* `/reviews/`, NOT `/testimonials/`. The old address is a legacy one and is
     deliberately a 301 (see legacyRedirects); listing it here asserted the
     opposite of what the map says and reported the redirect map working as a
     failure. */
  '/reviews/',
  '/robots.txt',
  '/sitemap-index.xml',
  '/rss.xml',
  '/favicon.ico',
];

console.log('\n=== Live addresses that must answer directly');
for (const path of MUST_BE_DIRECT) {
  checked++;
  const { res } = await req(new URL(path, origin), 'HEAD');
  const ok = res.status === 200;
  if (!ok) failed++;
  rows.push({ group: 'must-be-direct', from: path, to: path, status: res.status, problems: ok ? [] : [`HTTP ${res.status}`] });
  console.log(`  ${ok ? ' ok ' : 'FAIL'}  ${path.padEnd(52)} HTTP ${res.status}`);
}

/* --- the dead classes the dossier named ---------------------------------- */

/**
 * `_research/url-preservation.md` listed eight classes of address that 404'd
 * on an earlier build. Each is re-requested here by name, so that a fix which
 * regresses is caught as a regression rather than rediscovered as a finding.
 */
const ONCE_DEAD = [
  ['old /blog/<slug>/ permalinks', '/blog/workplace-cleaning-checklist-winter/'],
  ['WordPress feed', '/feed/'],
  ['blog feed', '/blog/feed/'],
  ['Rank Math sitemap', '/sitemap_index.xml'],
  ['bare sitemap', '/sitemap.xml'],
  /* Read out of the map rather than invented. An earlier version of this line
     hardcoded `/wp-content/uploads/2020/03/office-cleaning.jpg`, which is not
     in the map and never was on the site — so it reported a 404 that proved
     nothing except that the probe had made the address up. */
  ['an upload path', Object.keys(uploadRedirects)[0]],
  ['favicon', '/favicon.ico'],
];

console.log('\n=== Classes the dossier recorded as dead — must now resolve');
for (const [label, path] of ONCE_DEAD) {
  checked++;
  const { res } = await req(new URL(path, origin));
  /* Either it is the page (200) or it redirects to one; both preserve the
     link. Only a 404 is a loss. */
  const ok = res.status !== 404;
  if (!ok) failed++;
  const loc = res.headers.get('location');
  rows.push({ group: 'once-dead', from: path, status: res.status, location: loc, problems: ok ? [] : ['404'] });
  console.log(
    `  ${ok ? ' ok ' : 'FAIL'}  ${label.padEnd(30)} ${path.padEnd(48)} HTTP ${res.status}${loc ? ` → ${new URL(loc, origin).pathname}` : ''}`
  );
}

/* --- what the upload map does NOT cover ---------------------------------- */

/**
 * Stated as a measured limit rather than asserted as a pass or a failure,
 * because it is a deliberate design decision with a known edge.
 *
 * `_redirects` has no way to take just the basename out of a splat, and the
 * old paths are dated while this site serves images flat, so
 * `/wp-content/uploads/* -> /images/:splat` cannot work. The map is therefore
 * an explicit allowlist built from the addresses the archive crawl recorded.
 * Every address IN it resolves; every upload address the crawl never captured
 * 404s, and no check inside this repository can enumerate those — only the
 * live WordPress media library can.
 *
 * So this prints the size of the covered set and names the follow-up, instead
 * of inventing a path and reporting its 404 as a defect.
 */
const uploadCount = Object.keys(uploadRedirects).length;
/* --- the slashless variant, recorded because a real link may omit it ------ */

/**
 * Not every inbound link carries the trailing slash WordPress served. Those
 * still arrive, and they take TWO hops: the `_redirects` 301, then the edge's
 * own 307 normalising the slash on. Both are followed by every crawler and by
 * every browser, so this is recorded as measured behaviour rather than
 * asserted as a pass — but it is recorded, because "two hops, second one
 * temporary" is the kind of detail that is invisible until someone audits a
 * redirect chain and reports it as a defect.
 */
console.log('\n=== Redirect chains for slashless legacy links (measured)');
for (const p of ['/blog/workplace-cleaning-checklist-winter', '/office-cleaning']) {
  const hops = [];
  let url = new URL(p, origin);
  for (let i = 0; i < 4; i++) {
    const { res } = await req(url, 'HEAD');
    hops.push(`${res.status}`);
    const loc = res.headers.get('location');
    if (!loc) break;
    url = new URL(loc, origin);
  }
  console.log(`  ${p.padEnd(46)} ${hops.join(' → ')}  final ${url.pathname}`);
}

console.log('\n=== Upload-path coverage (measured, not asserted)');
console.log(`  ${uploadCount} explicit /wp-content/uploads/ addresses are mapped to /images/.`);
console.log('  An upload address outside that set answers 404 by design — a splat cannot');
console.log('  take a basename. The covered set comes from the Internet Archive crawl, so');
console.log("  images the crawl never captured are not in it. Reconciling the map against");
console.log('  the live WordPress media library needs SiteGround access and is recorded in');
console.log('  the Phase 12 report as a manual pre-launch follow-up, not as a code defect.');

console.log(`\n${checked - failed} of ${checked} parity checks passed.\n`);
if (jsonPath) {
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
  console.log(`raw rows → ${jsonPath}\n`);
}
if (failed) process.exit(1);

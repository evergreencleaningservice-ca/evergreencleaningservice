/**
 * Lighthouse and screenshots, run the same way every time.
 *
 *   node --experimental-strip-types scripts/measure.mjs <label> [origin]
 *
 * WHY A SCRIPT RATHER THAN A COMMAND IN A REPORT. A before-and-after is only
 * worth anything if both halves were measured identically, and "identically"
 * is more conditions than anyone reproduces from memory a day later: the same
 * form factor, the same throttling, the same number of runs, the median
 * rather than the best, the same viewport for the screenshots. This file is
 * the record of those conditions, so a later comparison can be trusted or
 * challenged on the same terms.
 *
 * THREE RUNS, MEDIAN REPORTED. A single Lighthouse run on a shared machine
 * varies by several points for reasons that have nothing to do with the site.
 * Three runs and the middle value is the cheapest defence against reporting
 * noise as an improvement — and the spread is printed too, because a wide
 * spread is itself the finding.
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { requireChrome } from './lib/chrome.mjs';

const label = process.argv[2];
const origin = process.argv[3] ?? 'http://localhost:4321';
if (!label) {
  console.error('usage: node scripts/measure.mjs <label> [origin]');
  process.exit(2);
}

const outDir = path.resolve('.measure', label);
fs.mkdirSync(outDir, { recursive: true });

/** The page Lighthouse scores. The hero, and therefore the LCP, is here. */
const LH_PATH = '/';

/** Pages screenshotted for visual regression, at both form factors. */
const SHOTS = [
  ['home', '/'],
  ['quote', '/request-a-quote/'],
  ['service', '/services/office-cleaning/'],
  ['location', '/locations/mississauga/'],
];

/** Widths the hero has to survive. */
const WIDTHS = [390, 768, 1440];

const RUNS = 3;

/**
 * The browser both halves of this script drive, resolved by the shared
 * helper so this file cannot disagree with `perf-matrix.mjs` about where
 * Chromium is — which is exactly what went wrong before it existed.
 */
const CHROME = requireChrome();

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const round = (n) => (n === null || n === undefined ? null : Math.round(n));

/* ---------------------------------------------------------------- lighthouse */

const results = [];
for (let run = 1; run <= RUNS; run++) {
  const json = path.join(outDir, `lh-${run}.json`);
  execFileSync(
    'npx',
    [
      'lighthouse',
      `${origin}${LH_PATH}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile',
      '--throttling-method=simulate',
      '--output=json',
      `--output-path=${json}`,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --ignore-certificate-errors',
    ],
    { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, CHROME_PATH: CHROME } }
  );

  const lh = JSON.parse(fs.readFileSync(json, 'utf8'));
  const audit = (id) => lh.audits[id]?.numericValue ?? null;
  results.push({
    performance: Math.round(lh.categories.performance.score * 100),
    accessibility: Math.round(lh.categories.accessibility.score * 100),
    bestPractices: Math.round(lh.categories['best-practices'].score * 100),
    seo: Math.round(lh.categories.seo.score * 100),
    lcp: audit('largest-contentful-paint'),
    cls: lh.audits['cumulative-layout-shift']?.numericValue ?? null,
    tbt: audit('total-blocking-time'),
    fcp: audit('first-contentful-paint'),
    si: audit('speed-index'),
    bytes: audit('total-byte-weight'),
    lcpElement:
      lh.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet ??
      null,
    failing: Object.values(lh.audits)
      .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative')
      .map((a) => a.id),
  });
}

const key = (k) => median(results.map((r) => r[k]).filter((v) => v !== null));

const summary = {
  label,
  origin,
  path: LH_PATH,
  runs: RUNS,
  conditions: 'mobile, simulated throttling, headless chromium, lighthouse CLI',
  median: {
    performance: key('performance'),
    accessibility: key('accessibility'),
    bestPractices: key('bestPractices'),
    seo: key('seo'),
    lcpMs: round(key('lcp')),
    cls: Number(key('cls')?.toFixed(3)),
    tbtMs: round(key('tbt')),
    fcpMs: round(key('fcp')),
    speedIndexMs: round(key('si')),
    totalBytes: round(key('bytes')),
  },
  runs_raw: results.map((r) => ({
    performance: r.performance,
    accessibility: r.accessibility,
    bestPractices: r.bestPractices,
    seo: r.seo,
    lcpMs: round(r.lcp),
    tbtMs: round(r.tbt),
    totalBytes: round(r.bytes),
  })),
  lcpElement: results[0].lcpElement,
  /* Audits that failed in EVERY run. A one-run failure is noise. */
  failingAudits: results[0].failing.filter((id) => results.every((r) => r.failing.includes(id))),
};

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log(`\n=== ${label} — median of ${RUNS} mobile runs — ${origin}${LH_PATH} ===`);
console.table(summary.median);
console.log('per-run:', JSON.stringify(summary.runs_raw));
console.log('LCP element:', summary.lcpElement);
console.log('failing in every run:', summary.failingAudits.join(', ') || 'none');

/* --------------------------------------------------------------- screenshots */

const shots = spawn(
  'node',
  ['--input-type=module', '-e', `
    import { chromium } from 'playwright';
    /* This container pins a chromium build under PLAYWRIGHT_BROWSERS_PATH and
       the npm playwright package may expect a newer one. Launch the browser
       that is actually installed rather than the one it would download.

       The certificate flag is for measuring a DEPLOYED origin: outbound
       HTTPS goes through this environment's own proxy, which terminates TLS
       with its own CA, so the browser sees a certificate it has no reason to
       trust and refuses with ERR_CERT_AUTHORITY_INVALID. Both halves are
       needed: the ignoreHTTPSErrors context option did not help on its own
       once the navigation was blocked at the network layer. Against
       localhost neither does anything.

       NOTE, and it is the reason this file would not parse at all: this
       whole block is inside a TEMPLATE LITERAL passed to node --input-type
       via -e. A backtick anywhere in here — even in prose, even inside a
       comment — closes the literal and the file becomes a syntax error.
       Naming the option in backticks is what broke it. Do not reintroduce
       them; quote identifiers with plain words instead. */
    const browser = await chromium.launch({
      executablePath: ${JSON.stringify(CHROME)},
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors'],
    });
    for (const [name, url] of ${JSON.stringify(SHOTS)}) {
      for (const width of ${JSON.stringify(WIDTHS)}) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true });
        try {
          /* waitUntil load, NOT networkidle: a deployed page carries third-party
             tags that keep polling, so networkidle may never arrive. The
             wait after it is what lets the hero and the fonts settle. */
          await page.goto('${origin}' + url, { waitUntil: 'load', timeout: 45000 });
          await page.waitForTimeout(2500);
          await page.screenshot({ path: '${outDir}/' + name + '-' + width + '.png', fullPage: false });
        } catch (err) {
          console.error('screenshot failed:', url, width, String(err).split('\\n')[0]);
        }
        await page.close();
      }
    }
    await browser.close();
  `],
  { stdio: 'inherit' }
);
shots.on('exit', (code) => {
  console.log(`\nscreenshots -> ${outDir} (exit ${code})`);
});

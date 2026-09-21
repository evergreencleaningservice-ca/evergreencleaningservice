/**
 * Lighthouse against a BUILD DIRECTORY rather than a deployed origin.
 *
 * `npm run measure` and `npm run perf:matrix` both need a running origin, and
 * what they measure is a network on a day. This measures one build, served
 * from this process over loopback, which is the only way to compare two
 * builds and attribute the difference to the code rather than to the edge,
 * the proxy or the third-party tags.
 *
 * ABSOLUTE NUMBERS FROM HERE ARE NOT PRODUCTION NUMBERS. There is no network
 * and no third party. What it is for is the difference between two runs of
 * itself.
 *
 * WHY IT DOES NOT SHELL OUT TO THE LIGHTHOUSE CLI. In the agent container the
 * CLI hangs: chrome-launcher's Chrome inherits HTTPS_PROXY from the
 * environment, cannot reach 127.0.0.1 through it, and sits on about:blank
 * until something kills it — no error, no output, just a process that never
 * finishes. Playwright's Chromium reaches loopback, so it is launched here
 * with `--no-proxy-server` and a debugging port, and Lighthouse is pointed at
 * that. Measured against a deployed https origin the CLI is fine; it is
 * loopback that breaks it.
 *
 *   node scripts/lh-local.mjs <distDir> <label> [runs] [path]
 *
 * Prints the median of `runs` (default 3) plus every run, and the ids of any
 * accessibility audits that failed outright.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const [dist, label, runsArg, pathArg] = process.argv.slice(2);
const RUNS = Number(runsArg ?? 3);
const PAGE = pathArg ?? '/';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
};
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('nf');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}${PAGE}`;

const PORT = 9222 + Math.floor(Math.random() * 500);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-proxy-server',
    `--remote-debugging-port=${PORT}`,
  ],
});

const results = [];
for (let i = 0; i < RUNS; i++) {
  const r = await lighthouse(
    url,
    { port: PORT, output: 'json', logLevel: 'error' },
    {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
        throttlingMethod: 'simulate',
      },
    }
  );
  const j = r.lhr;
  const a11yIds = new Set(j.categories.accessibility.auditRefs.map((a) => a.id));
  results.push({
    perf: Math.round(j.categories.performance.score * 100),
    a11y: Math.round(j.categories.accessibility.score * 100),
    bp: Math.round(j.categories['best-practices'].score * 100),
    fcp: Math.round(j.audits['first-contentful-paint'].numericValue),
    lcp: Math.round(j.audits['largest-contentful-paint'].numericValue),
    cls: Number(j.audits['cumulative-layout-shift'].numericValue.toFixed(4)),
    tbt: Math.round(j.audits['total-blocking-time'].numericValue),
    a11yFails: Object.values(j.audits)
      .filter((a) => a.score === 0 && a.scoreDisplayMode === 'binary' && a11yIds.has(a.id))
      .map((a) => a.id),
  });
  console.error(`${label} run ${i + 1}/${RUNS} done`);
}

await browser.close();
server.close();

const med = (k) => results.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(results.length / 2)];
console.log(JSON.stringify({
  label, runs: results.length,
  median: { perf: med('perf'), a11y: med('a11y'), bp: med('bp'), fcp: med('fcp'), lcp: med('lcp'), cls: med('cls'), tbt: med('tbt') },
  a11yFails: results[0]?.a11yFails ?? [],
  all: results,
}, null, 2));

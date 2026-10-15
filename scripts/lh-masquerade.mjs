/**
 * Lighthouse against a BUILD DIRECTORY served under the PRODUCTION HOSTNAME,
 * so every third party behaves exactly as it does on the live site.
 *
 *   node scripts/lh-masquerade.mjs <distDir> <label> [runs] [path ...]
 *
 * WHY. `lh-local.mjs` measures a build with no third parties at all, because
 * on 127.0.0.1 the GTM loader refuses to run (hostname allowlist) and the
 * reCAPTCHA key is domain-locked. That isolates our code but hides the cost
 * the live page pays. Measuring the live site instead measures whatever is
 * deployed — it cannot compare an unmerged branch with main.
 *
 * This maps www.evergreencleaningservice.ca to a local server inside the
 * measuring browser only (`--host-resolver-rules`), so the page believes it
 * is production: GTM-5W69BTJQ loads with its Google Ads tags, reCAPTCHA
 * renders for the real key, and images come from the real image host through
 * the agent proxy. Two builds measured this way differ only in the code.
 *
 * WHAT IS NOT LIKE PRODUCTION. The document and same-origin assets are served
 * over plain HTTP from loopback, not HTTP/2 from Cloudflare's edge, and the
 * edge's cache headers do not apply. Every third party goes through the agent
 * proxy, which adds latency the field never pays. Treat absolutes as this
 * environment's; compare runs of this script with each other.
 *
 * SIDE EFFECT, stated plainly: page views here reach the client's Google Ads
 * tag exactly as a PageSpeed Insights run does. No form is submitted and no
 * conversion fires.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { requireChrome } from './lib/chrome.mjs';

const [dist, label, runsArg, ...pathArgs] = process.argv.slice(2);
const RUNS = Number(runsArg ?? 3);
const PATHS = pathArgs.length ? pathArgs : ['/'];
const HOST = 'www.evergreencleaningservice.ca';
const FORM = process.env.LH_FORM ?? 'mobile';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain', '.mp4': 'video/mp4',
};
const root = path.resolve(dist);
const server = createServer((req, res) => {
  if (process.env.LHM_DEBUG) console.error('HIT', req.url);
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const CHROME = requireChrome();
const desktop = FORM === 'desktop';
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];

/* Lighthouse's target manager occasionally rejects, unhandled, when a
   cross-origin iframe (reCAPTCHA, Google's call-tracking frame) attaches and
   detaches before it can be inspected: "Session with given id not found".
   It is not a page failure, but unhandled it kills the process mid-matrix.
   Swallow exactly that error; the run it belonged to is retried below if it
   produced no result. */
process.on('unhandledRejection', (err) => {
  if (/Session with given id not found/.test(String(err?.message ?? err))) {
    console.error('lh-masquerade: ignored detached-iframe session error');
    return;
  }
  throw err;
});

/* chrome-launcher (the browser the Lighthouse CLI itself uses) driven through
   the Node API, with the flags passed as an ARRAY. Two other routes failed:
   a Playwright-launched browser crashed Lighthouse on reCAPTCHA's
   short-lived iframes ("Session with given id not found"), and the CLI's
   --chrome-flags string could not carry a resolver rule containing spaces. */
const flags = [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  /* Chrome upgrades plain-HTTP navigations to HTTPS by default; the local
     server only speaks HTTP, and the upgraded request never reaches it. */
  '--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable',
  `--host-resolver-rules=MAP ${HOST}:80 127.0.0.1:${port}`,
  ...(process.env.HTTPS_PROXY
    ? [`--proxy-server=${process.env.HTTPS_PROXY}`, `--proxy-bypass-list=${HOST};127.0.0.1;localhost`]
    : []),
];

async function runOnce(pagePath) {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: flags });
  try {
    const r = await lighthouse(
      `http://${HOST}${pagePath}`,
      { port: chrome.port, output: 'json', logLevel: 'error' },
      desktop
        ? { extends: 'lighthouse:default', settings: { ...desktopConfig.settings, onlyCategories: CATS } }
        : { extends: 'lighthouse:default', settings: { onlyCategories: CATS, throttlingMethod: 'simulate' } }
    );
    if (process.env.LHM_SAVE) {
      fs.mkdirSync(process.env.LHM_SAVE, { recursive: true });
      fs.writeFileSync(path.join(process.env.LHM_SAVE, `${label}${pagePath.replace(/\W+/g, '_')}${Date.now()}.json`), r.report);
    }
    return r.lhr;
  } finally {
    await chrome.kill();
  }
}

const out = [];
for (const pagePath of PATHS) {
  const results = [];
  for (let i = 0; i < RUNS; i++) {
    let j;
    for (let attempt = 1; ; attempt++) {
      try {
        j = await runOnce(pagePath);
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        console.error(`lh-masquerade: ${pagePath} attempt ${attempt} failed (${err.message}); retrying`);
      }
    }
    if (j.runtimeError) throw new Error(`${pagePath}: ${j.runtimeError.code} ${j.runtimeError.message}`);
    const scripts = (j.audits['bootup-time']?.details?.items ?? [])
      .slice(0, 4)
      .map((s) => `${String(s.url).replace(/^https?:\/\//, '').slice(0, 60)} ${Math.round(s.scripting)}ms`);
    results.push({
      perf: Math.round(j.categories.performance.score * 100),
      a11y: Math.round(j.categories.accessibility.score * 100),
      bp: Math.round(j.categories['best-practices'].score * 100),
      seo: Math.round(j.categories.seo.score * 100),
      fcp: Math.round(j.audits['first-contentful-paint'].numericValue),
      lcp: Math.round(j.audits['largest-contentful-paint'].numericValue),
      tbt: Math.round(j.audits['total-blocking-time'].numericValue),
      cls: Number(j.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
      si: Math.round(j.audits['speed-index'].numericValue),
      bytes: Math.round((j.audits['total-byte-weight']?.numericValue ?? 0) / 1024),
      requests: j.audits['network-requests']?.details?.items?.length ?? null,
      scripts,
    });
    console.error(`${label} ${pagePath} run ${i + 1}/${RUNS} perf=${results.at(-1).perf}`);
  }
  const med = (k) => results.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(results.length / 2)];
  out.push({
    label,
    path: pagePath,
    form: FORM,
    runs: results.length,
    median: Object.fromEntries(['perf', 'a11y', 'bp', 'seo', 'fcp', 'lcp', 'tbt', 'cls', 'si', 'bytes', 'requests'].map((k) => [k, med(k)])),
    all: results,
  });
}

server.close();
console.log(JSON.stringify(out, null, 2));

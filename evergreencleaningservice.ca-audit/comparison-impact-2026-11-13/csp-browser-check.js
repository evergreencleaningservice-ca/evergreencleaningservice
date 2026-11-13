#!/usr/bin/env node
/**
 * CSP browser check, 13 Nov 2026 (comparison with impact.ca, report item 10).
 *
 * Why this exists: before the full Content-Security-Policy is enforced, it has
 * to be shown not to block anything the real pages load, including what Tag
 * Manager pulls in at run time. A unit test can only check the policy text;
 * this loads the built pages in Chromium with the policy ENFORCED and records
 * every violation.
 *
 * How it works:
 *   - https://www.evergreencleaningservice.ca/** is answered from dist/, so the
 *     GTM loader's hostname guard sees the production host and runs the
 *     container exactly as it does live.
 *   - Each HTML response carries the policy under test as an enforced
 *     `Content-Security-Policy` header. By default that is the enforced CSP in
 *     dist/_headers if it carries script-src, otherwise the report-only policy
 *     (the candidate for enforcement). `--policy "<csp>"` overrides it.
 *   - Third-party requests go to the real network, except analytics collect
 *     and ad pixel hits, which are aborted so nothing is recorded in GA4, Ads
 *     or Meta. CSP is checked before a request is sent, so aborting a hit
 *     cannot hide a violation.
 *   - /api/* is answered locally (204), so no lead is submitted and no CSP
 *     report reaches the live Worker log.
 *   - On each page: scroll to the bottom and back, then focus a form field, so
 *     deferred GTM, reCAPTCHA and the floating video all load.
 *
 * Usage (from the repo root, after a build):
 *   node evergreencleaningservice.ca-audit/comparison-impact-2026-11-13/csp-browser-check.js [--out results.json] [--policy "<csp>"]
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://www.evergreencleaningservice.ca';
const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

/** The policy under test: see the header comment for how it is chosen. */
function policyUnderTest() {
  const given = argVal('--policy');
  if (given) return { source: '--policy', policy: given };
  const headers = fs.readFileSync(path.join(DIST, '_headers'), 'utf8');
  const enforced = [...headers.matchAll(/^\s*Content-Security-Policy:\s*(.+)$/gm)].map((m) => m[1].trim());
  const full = enforced.find((p) => /script-src/.test(p));
  if (full) return { source: 'dist/_headers Content-Security-Policy', policy: full };
  const ro = headers.match(/^\s*Content-Security-Policy-Report-Only:\s*(.+)$/m)?.[1]?.trim();
  if (!ro) throw new Error('no full CSP found in dist/_headers');
  return { source: 'dist/_headers Content-Security-Policy-Report-Only (candidate)', policy: ro };
}

const PAGES = [
  '/',
  '/office-cleaning/',
  '/locations/mississauga/',
  '/request-a-quote/',
  '/lp/commercial-cleaning-quote/?gclid=test',
  '/how-often-should-an-office-be-cleaned/',
  '/reviews/',
];

/** Measurement hits: aborted so the check records nothing anywhere. */
const BLOCK = [
  /google-analytics\.com\/g\/collect/,
  /analytics\.google\.com\/g\/collect/,
  /googleadservices\.com\/pagead\//,
  /googleadservices\.com\/ccm\//,
  /doubleclick\.net\/pagead\//,
  /google\.[a-z.]+\/pagead\//,
  /google\.[a-z.]+\/ccm\/collect/,
  /google\.com\/rmkt\/collect/,
  /facebook\.com\/tr/,
];

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webmanifest': 'application/manifest+json' };

function fileFor(pathname) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, p);
  if (!f.startsWith(DIST)) return null;
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(path.join(f, 'index.html'))) return path.join(f, 'index.html');
  return null;
}

const { source, policy } = policyUnderTest();
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({ headless: true, ...(proxy ? { proxy: { server: proxy } } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

await context.addInitScript(() => {
  window.__cspViolations = [];
  document.addEventListener('securitypolicyviolation', (e) => {
    window.__cspViolations.push({ directive: e.effectiveDirective, blocked: e.blockedURI, source: e.sourceFile, line: e.lineNumber, disposition: e.disposition, sample: e.sample });
  });
});

const blockedHits = [];
await context.route('**/*', async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  if (url.origin === ORIGIN) {
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 204, body: '' });
    let f = fileFor(url.pathname);
    let status = 200;
    if (!f) {
      f = path.join(DIST, '404.html');
      status = 404;
    }
    const type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
    const headers = { 'content-type': type };
    if (type.startsWith('text/html')) headers['content-security-policy'] = policy;
    return route.fulfill({ status, headers, body: fs.readFileSync(f) });
  }
  if (BLOCK.some((re) => re.test(req.url()))) {
    blockedHits.push(`${url.host}${url.pathname}`);
    return route.abort('blockedbyclient');
  }
  return route.continue();
});

const results = [];
for (const p of PAGES) {
  const page = await context.newPage();
  const consoleCsp = [];
  const thirdParty = new Set();
  page.on('console', (m) => {
    if (/Content Security Policy|Content-Security-Policy/i.test(m.text())) consoleCsp.push(m.text().slice(0, 400));
  });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.origin !== ORIGIN && u.protocol.startsWith('http')) thirdParty.add(u.host);
  });
  let error;
  try {
    await page.goto(ORIGIN + p, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.mouse.move(400, 400);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    const field = page.locator('form input:not([type=hidden]), form textarea').first();
    if (await field.count()) {
      await field.scrollIntoViewIfNeeded();
      await field.focus();
      await field.type('a', { delay: 50 });
    }
    await page.waitForTimeout(8000);
  } catch (e) {
    error = String(e).slice(0, 300);
  }
  const violations = await page.evaluate(() => window.__cspViolations || []).catch(() => []);
  results.push({ page: p, violations, consoleCsp, thirdPartyHosts: [...thirdParty].sort(), error });
  console.log(`${p}: ${violations.length} violation(s), ${consoleCsp.length} console CSP message(s)${error ? `, error: ${error}` : ''}`);
  for (const v of violations) console.log(`  ${v.directive} ${v.blocked} (${v.source || 'inline'}:${v.line})`);
  await page.close();
}

await browser.close();
const out = { date: new Date().toISOString(), policySource: source, policy, blockedHits: [...new Set(blockedHits)].sort(), results };
const outFile = argVal('--out');
if (outFile) fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
const total = results.reduce((n, r) => n + r.violations.length, 0);
console.log(`TOTAL violations: ${total}`);
process.exitCode = total ? 1 : 0;

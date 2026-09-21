/**
 * Census the paid landing pages: what a visitor is asked, what they can click
 * away to, and how far down the page the form starts.
 *
 * Phase 10 needs the same instrument on both sides of the change, which is
 * why this is a script rather than something typed twice. It serves a build
 * over loopback, so the numbers are the code's and not the network's.
 *
 *   node scripts/lp-census.mjs <distDir> <outDir> [label]
 *
 * Writes census.json and full-page screenshots at 390, 768 and 1440.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [dist, outDir, label = 'census'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('nf');
    return;
  }
  const body = fs.readFileSync(file);
  res.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    /* Explicit, because the transferred-byte comparison reads it back off the
       response and Node does not set it for a Buffer write. */
    'content-length': String(body.length),
  });
  res.end(body);
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const PAGES = [
  ['lp1', '/lp/commercial-cleaning/'],
  ['lp2', '/lp/commercial-cleaning-quote/'],
];
const WIDTHS = [390, 768, 1440];

const CENSUS = `(() => {
  const painted = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || s.clipPath !== 'none') return false;
      if (parseFloat(s.opacity) === 0) return false;
      const b = n.getBoundingClientRect();
      if (b.left + b.width < 0 || b.width <= 1) return false;
    }
    return true;
  };

  const form = document.querySelector('form[data-endpoint], form[id]');
  const controls = form ? [...form.elements].filter((e) => ['INPUT','SELECT','TEXTAREA'].includes(e.tagName)) : [];
  const visible = controls.filter((e) => e.type !== 'hidden' && painted(e));

  /* Every way off the page, which is what "distraction" means here. */
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const offPage = links.filter((h) => h && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:'));

  const sticky = [...document.querySelectorAll('*')].filter((el) => {
    const s = getComputedStyle(el);
    return (s.position === 'fixed' || s.position === 'sticky') && painted(el);
  }).map((el) => ({ cls: el.className, rect: el.getBoundingClientRect().toJSON() }));

  const box = form ? form.getBoundingClientRect() : null;
  const submit = form ? form.querySelector('button[type="submit"], .lp-submit, .lpq-submit') : null;

  return {
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => h.tagName + ': ' + h.textContent.trim().slice(0, 70)),
    metaRobots: document.querySelector('meta[name="robots"]')?.content ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    description: document.querySelector('meta[name="description"]')?.content ?? null,

    formId: form?.id ?? null,
    visibleFields: visible.map((e) => e.name || e.id),
    requiredFields: visible.filter((e) => e.required).map((e) => e.name || e.id),
    totalControls: controls.length,
    placeholders: controls.filter((e) => e.placeholder).length,
    controlsUnder44: visible.filter((e) => e.getBoundingClientRect().height < 44).length,
    submitLabel: submit ? submit.textContent.trim() : null,

    formTop: box ? Math.round(box.top + window.scrollY) : null,
    formHeight: box ? Math.round(box.height) : null,
    aboveFold: box ? box.top + window.scrollY < window.innerHeight : null,

    pageHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,

    links: links.length,
    offPageLinks: [...new Set(offPage)],
    telLinks: links.filter((h) => h && h.startsWith('tel:')).length,
    anchorLinks: links.filter((h) => h && h.startsWith('#')),

    sticky,
    starGlyphs: (document.body.innerText.match(/★/g) || []).length,
    ratingClaim: /\\b\\d(?:\\.\\d)?\\s*\\/\\s*5\\b|\\b4\\.9\\b|\\d+\\+?\\s+reviews/i.test(document.body.innerText),
    text: document.body.innerText.replace(/\\s+/g, ' ').trim(),
  };
})()`;

const out = {};
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});

for (const [name, url] of PAGES) {
  out[name] = { url, widths: {} };
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
    const page = await ctx.newPage();

    const requests = [];
    page.on('response', async (r) => {
      let bytes = 0;
      try { bytes = Number((await r.allHeaders())['content-length'] ?? 0); } catch { /* ignore */ }
      requests.push({ url: r.url(), bytes, status: r.status() });
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(ORIGIN + url, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const census = await page.evaluate(CENSUS);
    const cls = await page.evaluate(
      () => new Promise((resolve) => {
        let total = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) total += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(Number(total.toFixed(4))), 300);
      })
    );

    out[name].widths[w] = {
      ...census,
      cls,
      jsErrors: errors,
      requests: requests.length,
      bytes: requests.reduce((a, r) => a + r.bytes, 0),
      turnstileRequests: requests.filter((r) => r.url.includes('challenges.cloudflare.com')).length,
    };

    await page.screenshot({ path: path.join(outDir, `${name}-${w}-${label}.png`), fullPage: true });
    await ctx.close();
  }
}

await browser.close();
server.close();
fs.writeFileSync(path.join(outDir, 'census.json'), JSON.stringify(out, null, 2));

for (const [name, d] of Object.entries(out)) {
  const w = d.widths[390];
  console.log(`\n${name} ${d.url}`);
  console.log(`  h1            : ${w.h1.join(' | ')}`);
  console.log(`  form id       : ${w.formId}`);
  console.log(`  visible fields: ${w.visibleFields.length} [${w.visibleFields.join(', ')}]`);
  console.log(`  required      : ${w.requiredFields.length} [${w.requiredFields.join(', ')}]`);
  console.log(`  placeholders  : ${w.placeholders}   under 44px: ${w.controlsUnder44}`);
  for (const ww of WIDTHS) {
    const x = d.widths[ww];
    console.log(`  @${ww}: formTop ${x.formTop}px  formH ${x.formHeight}px  page ${x.pageHeight}px  aboveFold ${x.aboveFold}  overflow ${x.overflow}  CLS ${x.cls}  req ${x.requests}  bytes ${x.bytes}`);
  }
  console.log(`  off-page links: ${w.offPageLinks.length} → ${w.offPageLinks.join(', ')}`);
  console.log(`  tel links     : ${w.telLinks}   anchors: ${w.anchorLinks.join(', ')}`);
  console.log(`  star glyphs   : ${w.starGlyphs}   rating-shaped claim: ${w.ratingClaim}`);
  console.log(`  js errors     : ${w.jsErrors.length ? w.jsErrors.join(' | ') : 'none'}`);
}

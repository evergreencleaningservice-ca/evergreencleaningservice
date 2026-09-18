// Full-site parity census: every paired page, old against new.
// Compares what a person would notice: visible text, links, headings, images,
// form fields. Counts are exact; text is compared as a set after normalising.
import { chromium } from 'playwright';
import http from 'node:http';
import { createReadStream, statSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/claude-0/-home-user-evergreencleaningservice/86352e80-f84f-53b0-a5ec-b9c034d891e3/scratchpad';
const pairs = JSON.parse(readFileSync(path.join(DIR, 'pairs.json'), 'utf8'));

function serve(root, types) {
  const srv = http.createServer((q, r) => {
    let f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
    try { if (statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    try { statSync(f); } catch { r.statusCode = 404; return r.end(); }
    r.setHeader('content-type', types[path.extname(f)] ?? 'application/octet-stream');
    createReadStream(f).pipe(r);
  });
  return srv;
}
const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.gif': 'image/gif' };

// the reference needs /images/... too, so serve both roots from one server
const refRoot = path.join(DIR, 'refall');
const distRoot = '/home/user/evergreencleaningservice/dist';
const both = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const roots = u.startsWith('/ref/') ? [[refRoot, u.slice(4)]] : [[distRoot, u], [refRoot, u], ['/home/user/evergreencleaningservice/public', u]];
  for (const [root, rel] of roots) {
    let f = path.join(root, rel);
    try { if (statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    try { statSync(f); } catch { continue; }
    r.setHeader('content-type', T[path.extname(f)] ?? 'application/octet-stream');
    return createReadStream(f).pipe(r);
  }
  r.statusCode = 404; r.end();
});
await new Promise((r) => both.listen(0, r));
const BASE = `http://127.0.0.1:${both.address().port}`;

const PAYLOAD = () => {
  const norm = (s) => s.replace(/\s+/g, ' ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim().toLowerCase();
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = getComputedStyle(n);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
      if (n.hasAttribute && n.hasAttribute('hidden')) return false;
    }
    return true;
  };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'PRE']);
  const text = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const p = n.parentElement;
    if (!p || SKIP.has(p.tagName)) continue;
    if (p.closest('.screen-reader-text, .wpf-hp, .honeypot, .c-bully, .leadnet')) continue;
    const t = norm(n.nodeValue || '');
    if (t.length > 2 && visible(p)) text.add(t);
  }
  const normHref = (h) => {
    if (!h) return null;
    let u;
    try { u = new URL(h, location.href); } catch { return h; }
    if (/^(mailto|tel):/.test(u.protocol)) return u.href.replace(/^tel:\/*/, 'tel:').replace(/[()\s-]/g, '');
    if (!/evergreencleaningservice\.ca$|^127\.0\.0\.1$|^localhost$/.test(u.hostname)) return u.origin + u.pathname.replace(/\/+$/, '/');
    let p = u.pathname.replace(/^\/ref\//, '/').replace(/\.html$/, '/').replace(/\/+$/, '/');
    if (p !== '/' && !p.endsWith('/')) p += '/';
    // the reference is a flat directory of files, so its own addresses come
    // back as /index/ and /services__office-cleaning/ — normalise them to the
    // routes they stand for, and reduce an image link to the file it points at,
    // since the port serves the same picture from /images/
    p = p.replace(/^\/index\/$/, '/').replace(/__/g, '/');
    const img = /^\/(?:wp-content\/uploads\/[^?]*|images)\/([^/]+\.(?:jpg|jpeg|png|gif|webp))\/?$/i.exec(p);
    if (img) return 'img:' + img[1];
    return p + (u.hash || '');
  };
  const links = new Set();
  for (const a of document.querySelectorAll('a[href]')) {
    if (a.closest('.c-bully, .leadnet')) continue;
    if (!visible(a)) continue;
    const h = normHref(a.getAttribute('href'));
    if (h) links.add(h);
  }
  const images = new Set();
  for (const i of document.querySelectorAll('img')) {
    if (i.closest('.leadnet')) continue;
    const s = i.getAttribute('src') || i.getAttribute('data-src') || '';
    const file = s.split('/').pop().split('?')[0];
    if (file && !/^data:/.test(s) && file.length > 3) images.add(file);
  }
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => visible(h) && !h.closest('.leadnet'))
    .map((h) => h.tagName + ':' + norm(h.textContent));
  const fields = [...document.querySelectorAll('input,select,textarea')]
    .filter((e) => !e.closest('.wpf-hp, .honeypot, .wpforms-field-hp') && e.type !== 'hidden')
    .map((e) => {
      const lab = e.labels && e.labels[0] ? norm(e.labels[0].textContent) : (e.getAttribute('aria-label') || e.placeholder || '');
      return `${e.tagName.toLowerCase()}:${e.type || ''}:${norm(lab)}${e.required ? ':req' : ''}`;
    });
  return { text: [...text], links: [...links], images: [...images], headings, fields,
    title: document.title, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
};

const grab = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  await page.waitForTimeout(450);
  // Step down the page instead of jumping: a jump with smooth scrolling still
  // in flight leaves entrance animations unfired and the census then reports
  // content as missing that a reader would have seen.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.9;
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(450);
  return page.evaluate(PAYLOAD);
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', () => {});

const report = [];
for (const p of pairs) {
  let o, m;
  try { o = await grab(page, BASE + '/ref' + p.ref); } catch (e) { report.push({ ...p, error: 'ref: ' + e.message }); continue; }
  try { m = await grab(page, BASE + p.route); } catch (e) { report.push({ ...p, error: 'port: ' + e.message }); continue; }
  const diff = (a, c) => a.filter((x) => !c.includes(x));
  report.push({
    slug: p.slug, route: p.route,
    textMissing: diff(o.text, m.text),
    textExtra: diff(m.text, o.text),
    linksMissing: diff(o.links, m.links),
    linksExtra: diff(m.links, o.links),
    imagesMissing: diff(o.images, m.images),
    headingsOrig: o.headings, headingsPort: m.headings,
    fieldsMissing: diff(o.fields, m.fields),
    fieldsExtra: diff(m.fields, o.fields),
    overflow: m.overflow,
  });
  process.stdout.write('.');
}
console.log('');
writeFileSync(path.join(DIR, 'audit.json'), JSON.stringify(report, null, 1));

// summary
let tot = { text: 0, links: 0, images: 0, headings: 0, fields: 0, overflow: 0 };
for (const r of report) {
  if (r.error) { console.log(`ERROR ${r.slug}: ${r.error}`); continue; }
  tot.text += r.textMissing.length;
  tot.links += r.linksMissing.length;
  tot.images += r.imagesMissing.length;
  tot.headings += JSON.stringify(r.headingsOrig) === JSON.stringify(r.headingsPort) ? 0 : 1;
  tot.fields += r.fieldsMissing.length;
  tot.overflow += r.overflow > 0 ? 1 : 0;
}
console.log(`pages: ${report.length}`);
console.log(`missing text nodes : ${tot.text}`);
console.log(`missing links      : ${tot.links}`);
console.log(`missing images     : ${tot.images}`);
console.log(`heading mismatches : ${tot.headings} pages`);
console.log(`missing form fields: ${tot.fields}`);
console.log(`pages overflowing  : ${tot.overflow}`);
await b.close(); both.close();

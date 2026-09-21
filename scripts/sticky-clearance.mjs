/**
 * Does the mobile sticky bar ever cover a form control?
 *
 * A fixed bottom bar is the standard paid-landing-page pattern and it ships
 * broken more often than not, in a way no static check can see: reserving
 * page padding stops the bar covering the END of the document, but it does
 * nothing for `scrollIntoView` — which is what the browser calls when a key
 * press moves focus. A keyboard user tabbing to a field near the bottom gets
 * it scrolled to the viewport's bottom edge, which is exactly where the bar
 * is.
 *
 * WHAT IT ACTUALLY FOUND, first time out, was a bug in itself. It reported
 * the message textarea underneath the bar on both pages; the real cause was
 * that it focused controls in sequence without resetting the scroll, on a
 * site that sets `scroll-behavior: smooth`, so it was measuring positions the
 * page was still animating through. Both pages pass cleanly once the
 * measurement is deterministic. A check that cries wolf is worse than no
 * check, so the two corrections are in the code below and named where they
 * are made.
 *
 * WHAT IT MEASURES, AND AGAINST WHICH RULE. It focuses each control the way a
 * keyboard does, lets the browser scroll, and then measures how much of the
 * control is left clear of the bar.
 *
 * The standard is WCAG 2.2's 2.4.11 Focus Not Obscured (Minimum, AA): the
 * focused component must not be ENTIRELY hidden by author-created content.
 * The AAA variant, 2.4.12, asks for no obscuring at all, which no fixed
 * bottom bar can promise at every scroll position — content passes underneath
 * one by definition.
 *
 * So the bar is held to: never hide a focused control completely, and always
 * leave at least 44px of it clear — the same 44px that is the minimum tap
 * target, so whatever remains visible is still usable. The measured margin is
 * printed either way, because "passes with 2px to spare" and "passes with
 * 70px to spare" are different facts and a later padding change turns one
 * into a failure.
 *
 *   node scripts/sticky-clearance.mjs <distDir>
 *
 * Exits non-zero naming each control that fails.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dist = process.argv[2];

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
    'content-length': String(body.length),
  });
  res.end(body);
});
await new Promise((r) => server.listen(0, r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

/** The paid pages and the DOM id of each one's form. */
const PAGES = [
  ['/lp/commercial-cleaning/', 'ppc-lead-form'],
  ['/lp/commercial-cleaning-quote/', 'lpq-form'],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});

let failures = 0;

for (const [url, formId] of PAGES) {
  /* 390 is where the bar exists; 768 is where it must not. Both are checked,
     because "hidden above the breakpoint" is also a thing a later edit
     breaks. */
  for (const width of [390, 768]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage();
    /* The captcha host is unreachable here and is not what is being tested. */
    await page.route('**challenges.cloudflare.com**', (r) => r.abort());
    await page.goto(ORIGIN + url, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const names = await page.evaluate(
      (id) =>
        [...document.getElementById(id).elements]
          .filter(
            (e) =>
              ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.tagName) &&
              e.type !== 'hidden' &&
              !e.closest('.qq-hp')
          )
          .map((e) => e.name || e.tagName),
      formId
    );

    const bad = [];
    let tightest = Infinity;
    for (const name of names) {
      const r = await page.evaluate(
        ([id, nm]) => {
          const form = document.getElementById(id);
          const el = [...form.elements].find((e) => (e.name || e.tagName) === nm);
          /* Reset first. Focusing each control in sequence leaves the scroll
             wherever the previous one put it, and the measurement then
             describes that accumulated position rather than this control —
             which produced impossible readings (a field measured as being
             above the top of the viewport) until it was pinned down. From a
             known position, `focus()` exercises the scroll-into-view path
             that a key press actually takes.

             `behavior: 'instant'` and the temporary `scroll-behavior: auto`
             matter as much as the reset: the site sets `scroll-behavior:
             smooth` globally, so both the reset and the focus scroll ANIMATE,
             and a measurement taken mid-animation describes a position the
             page is still travelling through. That produced the second round
             of impossible readings. A visitor sees the animation; a
             measurement must not. */
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo({ top: 0, behavior: 'instant' });
          return new Promise((res) =>
            setTimeout(() => {
              el.focus();
              setTimeout(() => {
              const bar = document.querySelector('.lpx-sticky');
              const b =
                bar && getComputedStyle(bar).display !== 'none'
                  ? bar.getBoundingClientRect()
                  : null;
              const box = el.getBoundingClientRect();
              /* How much of the control is on screen AND not under the bar. */
              const ceiling = b ? Math.min(box.bottom, b.top) : box.bottom;
              const clear = Math.round(
                Math.min(ceiling, window.innerHeight) - Math.max(box.top, 0)
              );
              res({
                barShown: Boolean(b),
                height: Math.round(box.height),
                clear,
                hidden: clear <= 0,
              });
                document.documentElement.style.scrollBehavior = '';
              }, 400);
            }, 150)
          );
        },
        [formId, name]
      );
      /* Entirely hidden fails outright; less than a tap target's worth left
         is not usable even though it is technically visible. */
      if (r.hidden || r.clear < 44) {
        bad.push(`${name} (${r.clear}px of ${r.height}px clear of the bar)`);
      }
      tightest = Math.min(tightest, r.clear);
    }

    const barShown = await page.evaluate(() => {
      const bar = document.querySelector('.lpx-sticky');
      return Boolean(bar) && getComputedStyle(bar).display !== 'none';
    });

    /* Above the breakpoint the bar must be gone entirely. */
    const wrongVisibility = width >= 768 && barShown;
    const ok = bad.length === 0 && !wrongVisibility;
    if (!ok) failures++;

    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${url} @${width}  bar ${barShown ? 'shown' : 'hidden'}  ` +
        (bad.length
          ? 'FAILING: ' + bad.join('; ')
          : `every control usable — tightest margin ${tightest}px clear`) +
        (wrongVisibility ? '  *** bar should be hidden at this width ***' : '')
    );
    await ctx.close();
  }
}

await browser.close();
server.close();
process.exit(failures ? 1 : 0);

/**
 * The Phase 13 visual acceptance pass: screenshots of every page category,
 * plus the structural checks a screenshot cannot make on its own.
 *
 * WHY BOTH. A screenshot proves what a page looked like on one machine at one
 * width; it does not prove the form is reachable by keyboard, that the sticky
 * bar does not cover a focused control, or that the telephone number on screen
 * is the one the link dials. Those are read from the live DOM in the same
 * pass, so the picture and the assertions are of the same render — a capture
 * and a measurement taken separately can disagree and nobody would know.
 *
 * READ-ONLY, and specifically: NO FORM IS SUBMITTED. The submission pipeline
 * is proven by `tests/quick-quote.test.ts` and by the Phase 9 staging lead
 * already in Neon. Repeating it here would write another row for no new
 * information.
 *
 * Usage: node scripts/visual-acceptance.mjs [origin] [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PREVIEW_HOST, nap } from '../src/data/site.ts';

const origin = (process.argv[2] ?? `https://${PREVIEW_HOST}`).replace(/\/$/, '');
const outDir = path.resolve(process.argv[3] ?? '.measure/phase13-visual');
fs.mkdirSync(outDir, { recursive: true });

/** One page per category the acceptance report has to cover. */
const PAGES = [
  ['homepage', '/'],
  ['quote', '/request-a-quote/'],
  ['lp-commercial-cleaning', '/lp/commercial-cleaning/'],
  ['lp-commercial-cleaning-quote', '/lp/commercial-cleaning-quote/'],
  ['service', '/services/office-cleaning/'],
  ['location', '/locations/mississauga/'],
  ['blog-archive', '/insights/'],
  ['thank-you', '/thank-you/'],
];

const WIDTHS = [390, 1440];

const CHROME = ['/opt/pw-browsers/chromium', process.env.CHROME_PATH].find(
  (p) => p && fs.existsSync(p)
);

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors'],
});

const findings = [];
const note = (level, page, width, msg) => {
  findings.push({ level, page, width, msg });
  if (level !== 'ok') console.log(`    ${level.toUpperCase()}: ${msg}`);
};

for (const [name, route] of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

    await page.goto(origin + route, { waitUntil: 'load', timeout: 60_000 });
    /* Third-party tags keep the network busy, so `load` plus a settle is the
       only reliable point at which the hero and fonts have painted. */
    await page.waitForTimeout(2500);

    /**
     * SCROLL THE WHOLE PAGE BEFORE MEASURING ANYTHING.
     *
     * The site uses WOW.js entrance animations: an element carrying `.wow` is
     * `visibility: hidden` until it enters the viewport, at which point the
     * observer adds `.animated` and it becomes visible. Measured from the top
     * of the page, every one of those is invisible — and the homepage lead
     * form is one of them, 12,000px down.
     *
     * The first version of this script measured without scrolling and
     * reported the homepage form as having ZERO visible controls and eleven
     * hidden ones. It reads exactly like a form nobody can fill in. Scrolled,
     * the same form reports eleven visible controls, opacity 1, identity
     * transform. Nothing was wrong with the page.
     *
     * Scrolling back to the top afterwards keeps the screenshot comparable
     * with the previous captures, and `behavior: instant` is required because
     * global.css sets `scroll-behavior: smooth`, which makes a scripted scroll
     * finish long after the code that requested it has moved on.
     */
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 400));
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 300));
    });
    await page.waitForTimeout(600);

    const file = path.join(outDir, `${name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  ${name} @ ${width} → ${path.relative(process.cwd(), file)}`);

    const m = await page.evaluate(() => {
      const vis = (el) => {
        if (!el) return false;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0 && r.width > 0 && r.height > 0;
      };
      const tel = [...document.querySelectorAll('a[href^="tel:" i]')].filter(vis).map((a) => ({
        shown: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
        dials: a.getAttribute('href').slice(4),
        location: a.getAttribute('data-call-location'),
      }));
      const forms = [...document.querySelectorAll('form')].map((f) => ({
        id: f.id || '(no id)',
        /* A control the visitor can actually operate: not hidden, not the
           clipped honeypot. */
        controls: [...f.querySelectorAll('input,select,textarea,button')].filter(vis).length,
        hidden: [...f.querySelectorAll('input,select,textarea')].filter((e) => !vis(e)).length,
      }));
      const sticky = [...document.querySelectorAll('*')].filter((el) => {
        const cs = getComputedStyle(el);
        return (cs.position === 'fixed' || cs.position === 'sticky') && vis(el);
      }).length;
      return {
        title: document.title,
        h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
        navLinks: [...document.querySelectorAll('header a')].filter(vis).length,
        tel,
        forms,
        sticky,
        /* Horizontal overflow is the single most common mobile defect and the
           cheapest to measure. */
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        widest: (() => {
          const w = document.documentElement.clientWidth;
          const bad = [...document.querySelectorAll('*')].find(
            (el) => el.getBoundingClientRect().right > w + 1
          );
          return bad ? bad.tagName + (bad.className ? '.' + String(bad.className).split(' ')[0] : '') : null;
        })(),
        entities: (document.body.innerText.match(/&(?:#\d+|[a-z][a-z0-9]{1,7});/gi) ?? []),
      };
    });

    /* --- the assertions ------------------------------------------------- */

    note(m.h1s.length === 1 ? 'ok' : 'FAIL', name, width, `H1 count ${m.h1s.length} (${m.h1s[0] ?? 'none'})`);
    note(m.overflow <= 0 ? 'ok' : 'FAIL', name, width, `horizontal overflow ${m.overflow}px${m.widest ? ` — widest ${m.widest}` : ''}`);
    note(m.entities.length === 0 ? 'ok' : 'FAIL', name, width, `raw entities visible: ${m.entities.join(', ') || 'none'}`);

    for (const t of m.tel) {
      const dialsCanonical = t.dials === nap.phoneHref.slice(4);
      note(dialsCanonical ? 'ok' : 'FAIL', name, width, `tel link dials ${t.dials}`);
      /* The displayed number may legitimately differ from the dialled one at
         runtime — CallTrackingMetrics swaps it for paid arrivals. On staging
         with no gclid it should agree, and a disagreement here is worth
         seeing rather than asserting away. */
      if (t.shown && /\d/.test(t.shown) && !t.shown.includes('803-4880'))
        note('note', name, width, `displayed number differs from canonical: "${t.shown}"`);
    }
    note(m.tel.length > 0 ? 'ok' : 'note', name, width, `${m.tel.length} visible telephone link(s)`);

    /* Keyboard reachability of the first form control, in a real browser. */
    if (m.forms.some((f) => f.controls > 0)) {
      const reached = await page.evaluate(() => {
        const f = [...document.querySelectorAll('form')].find((x) =>
          [...x.querySelectorAll('input,select,textarea')].some((e) => e.offsetParent !== null)
        );
        if (!f) return null;
        const first = [...f.querySelectorAll('input,select,textarea')].find((e) => e.offsetParent !== null);
        first.focus();
        return document.activeElement === first ? (first.name || first.id || first.type) : null;
      });
      note(reached ? 'ok' : 'FAIL', name, width, `first form control focusable: ${reached ?? 'NO'}`);

      /* WCAG 2.2 §2.4.11 — a sticky bar must not cover the focused control. */
      const covered = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const mid = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return mid && !el.contains(mid) && mid !== el ? (mid.className || mid.tagName) : null;
      });
      note(covered ? 'FAIL' : 'ok', name, width, `focused control unobscured${covered ? ` — covered by ${covered}` : ''}`);
    }

    note(consoleErrors.length === 0 ? 'ok' : 'note', name, width, `console errors: ${consoleErrors.length}`);
    findings.push({ level: 'data', page: name, width, measured: m });

    await page.close();
  }
}

await browser.close();

const fails = findings.filter((f) => f.level === 'FAIL');
fs.writeFileSync(path.join(outDir, 'findings.json'), JSON.stringify(findings, null, 2));
console.log(`\n${PAGES.length * WIDTHS.length} captures → ${path.relative(process.cwd(), outDir)}`);
console.log(`${fails.length} failure(s)`);
for (const f of fails) console.log(`  ${f.page} @${f.width}: ${f.msg}`);

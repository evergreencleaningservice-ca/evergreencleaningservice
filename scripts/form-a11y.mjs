/**
 * The quote form, driven by a keyboard alone, in a real browser.
 *
 * WHY THIS IS NOT A VITEST FILE. happy-dom has no layout, no focus ring, no
 * real tab order and no accessibility tree. It can prove that the code
 * focuses the right element; it cannot prove that a person pressing Tab
 * reaches that element, that the ring is visible when they do, or what a
 * screen reader is handed when they arrive. Those need a browser, and a
 * browser in the test suite would make every run of `npm test` slow enough
 * that people stop running it.
 *
 * So it is a script, run against a build, and its output belongs in a phase
 * report. Forty checks at 390px and 1440px:
 *
 *   - the form is reachable by Tab, and the tab order is the reading order
 *   - the honeypot is not one of the stops
 *   - every field takes a visible focus ring
 *   - Enter submits; focus lands on the error summary; it is an assertive
 *     alert; every empty required field is marked and messaged separately
 *   - errors clear as the visitor types
 *   - a phone-only lead goes through with no email and no street address
 *   - success replaces the form with a focused role="status" box that says
 *     what happens next
 *   - exactly one conversion event, carrying nothing personal
 *
 * The endpoint is stubbed inside the browser: nothing leaves this process,
 * and no lead is stored. The captcha host is deliberately blocked, which is
 * also a test — the pipeline must still submit once its token deadline
 * expires rather than hanging forever on a widget that will never resolve.
 *
 *   node scripts/form-a11y.mjs <distDir> [pagePath] [formDomId]
 *
 * Exits non-zero, naming each failure, if any check fails.
 */
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [dist, pageArg, formArg] = process.argv.slice(2);
/* Which page, and which form on it. Defaults to the quote page, which is what
   Phase 9 used this for; Phase 10 points it at the two landing pages, whose
   forms carry different DOM ids. */
const PAGE = pageArg ?? '/request-a-quote/';
const FORM = formArg ?? 'quote';
const F = (sel = '') => `#${CSS_ESCAPE(FORM)}${sel ? ' ' + sel : ''}`;
/* Node has no CSS.escape; the ids in use are plain, so a guard is enough. */
function CSS_ESCAPE(v) {
  if (!/^[A-Za-z][\w-]*$/.test(v)) throw new Error(`unsafe form id: ${v}`);
  return v;
}
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
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});

for (const width of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();

  /* The endpoint, stubbed. Nothing leaves this process. */
  let posted = null;
  await page.route('**/api/submit-lead', async (route) => {
    posted = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });
  /* Turnstile is not reachable from here and must not be needed. */
  await page.route('**challenges.cloudflare.com**', (r) => r.abort());

  await page.goto(`${ORIGIN}${PAGE}`, { waitUntil: 'load' });

  /* --- reach the form with the keyboard alone -------------------------- */
  const order = [];
  let landed = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate((FORMID) => {
      const el = document.activeElement;
      if (!el) return null;
      return {
        tag: el.tagName,
        name: el.getAttribute('name'),
        inForm: !!el.closest('form#' + FORMID),
        outline: getComputedStyle(el).outlineStyle,
        outlineWidth: getComputedStyle(el).outlineWidth,
      };
    }, FORM);
    if (!info) break;
    if (info.inForm) {
      landed = true;
      order.push(info.name ?? info.tag);
      if (info.tag === 'BUTTON') break;
    }
  }
  check(`${width}: the form is reachable by Tab alone`, landed, order.join(' → '));
  check(
    `${width}: tab order is the reading order`,
    JSON.stringify(order) ===
      JSON.stringify([
        'first-name', 'business-name', 'phone', 'email',
        'postal', 'services', 'message', 'BUTTON',
      ]),
    order.join(' → ')
  );

  /* The honeypot must never be one of the stops. */
  check(`${width}: the honeypot is not in the tab order`, !order.includes('company-website'));

  /* --- every focused control shows a focus ring ------------------------ */
  const noRing = [];
  for (const name of ['first-name', 'business-name', 'phone', 'email', 'postal', 'services', 'message']) {
    await page.focus(F(`[name="${name}"]`));
    const ring = await page.evaluate(([n, formId]) => {
      const el = document.querySelector(`#${formId} [name="${n}"]`);
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) || 0 };
    }, [name, FORM]);
    if (ring.style === 'none' || ring.width === 0) noRing.push(name);
  }
  check(`${width}: every field takes a visible focus ring`, noRing.length === 0, noRing.join(','));

  /* --- submit empty, with the keyboard --------------------------------- */
  await page.focus(F('[name="first-name"]'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  const afterEmpty = await page.evaluate((FORMID) => {
    const el = document.activeElement;
    const s = document.querySelector('[data-qq-summary]');
    return {
      focusIsSummary: el === s,
      summaryText: s?.textContent ?? '',
      role: s?.getAttribute('role'),
      live: s?.getAttribute('aria-live'),
      invalid: [...document.querySelectorAll(`#${FORMID} [aria-invalid="true"]`)].map((e) =>
        e.getAttribute('name')
      ),
      perField: [...document.querySelectorAll(`#${FORMID} [data-qq-error]`)]
        .filter((e) => e.textContent.trim())
        .map((e) => e.getAttribute('data-qq-error')),
    };
  }, FORM);
  check(`${width}: Enter in a field submits the form`, afterEmpty.summaryText !== '');
  check(`${width}: focus moves to the error summary`, afterEmpty.focusIsSummary);
  check(
    `${width}: the summary is an assertive alert`,
    afterEmpty.role === 'alert' && afterEmpty.live === 'assertive'
  );
  check(
    `${width}: every empty required field is marked and messaged`,
    JSON.stringify(afterEmpty.invalid.sort()) ===
      JSON.stringify(['business-name', 'first-name', 'postal', 'services']),
    afterEmpty.invalid.join(',')
  );
  check(
    `${width}: each message lands in its own slot`,
    afterEmpty.perField.length === 4,
    afterEmpty.perField.join(',')
  );

  /* --- fill it in by keyboard only, phone only ------------------------- */
  await page.focus(F('[name="first-name"]'));
  await page.keyboard.type('Dana');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Placeholder Holdings Inc');
  await page.keyboard.press('Tab');
  await page.keyboard.type('416 555 0142');
  await page.keyboard.press('Tab'); // email, left empty on purpose
  await page.keyboard.press('Tab');
  await page.keyboard.type('M5V 1Z4');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown'); // first real option in the select
  await page.waitForTimeout(100);

  const cleared = await page.evaluate(
    (FORMID) => [...document.querySelectorAll(`#${FORMID} [data-qq-error]`)].filter((e) => e.textContent.trim()).length,
    FORM
  );
  check(`${width}: errors clear as the visitor types`, cleared === 0, `${cleared} left`);

  /* Submit from the button, reached by keyboard. */
  await page.focus(F('button[type="submit"]'));
  await page.keyboard.press('Enter');
  /* Turnstile is unreachable here (aborted above), so the pipeline spends its
     full 6s token deadline before posting anyway. Wait for the outcome rather
     than for a guessed number of milliseconds. */
  const waited = Date.now();
  await page.waitForSelector('.qq-confirm', { timeout: 15000 });
  const tookMs = Date.now() - waited;
  check(`${width}: submits even with the captcha host unreachable`, true, `${tookMs}ms`);

  check(`${width}: the request was made`, posted !== null);
  check(
    `${width}: an email was never required`,
    posted?.email === '' && posted?.phone === '416 555 0142',
    JSON.stringify({ phone: posted?.phone, email: posted?.email })
  );
  check(`${width}: no street address was collected`, !('address1' in (posted ?? {})));
  check(
    `${width}: the postal box is what reached the address column`,
    posted?.address === 'M5V 1Z4'
  );

  const success = await page.evaluate((FORMID) => {
    const box = document.querySelector('.qq-confirm');
    return box
      ? {
          focused: document.activeElement === box,
          role: box.getAttribute('role'),
          text: box.textContent.replace(/\s+/g, ' ').trim(),
          formGone: !document.querySelector('form#' + FORMID),
        }
      : null;
  }, FORM);
  check(`${width}: success replaces the form`, success?.formGone === true);
  check(`${width}: success is a status region and takes focus`,
    success?.role === 'status' && success?.focused === true);
  check(`${width}: success says what happens next`,
    (success?.text ?? '').includes('2 business hours'));

  /* What a screen reader is handed at the end. */
  const snap = await page.locator('.qq-confirm').ariaSnapshot();
  console.log(`\n--- ${width}px, confirmation as exposed to assistive tech ---\n${snap}\n`);

  /* Conversion pushed exactly once, and carrying nothing personal. */
  const dl = await page.evaluate(() =>
    (window.dataLayer ?? []).filter((e) => e.event === 'lead_form_submission')
  );
  check(`${width}: exactly one conversion event`, dl.length === 1, JSON.stringify(dl));
  check(
    `${width}: the event carries no personal information`,
    !JSON.stringify(dl).match(/Dana|Placeholder|555 0142|M5V/),
    JSON.stringify(dl)
  );

  await ctx.close();
}

await browser.close();
server.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:');
  for (const f of failed) console.log(`  ${f.name} — ${f.detail}`);
  process.exit(1);
}

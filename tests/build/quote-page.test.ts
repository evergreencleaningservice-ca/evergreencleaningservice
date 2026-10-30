/**
 * @vitest-environment node
 *
 * Phase 9 — the quote page as it is actually emitted.
 *
 * TWO JOBS.
 *
 * The first is the page itself: one form where there used to be two identical
 * long ones, one H1, the full navigation still present, and a sidebar that now
 * carries a phone number and four supportable claims instead of a second copy
 * of the form the visitor is already looking at.
 *
 * The second is to keep tests/quick-quote.test.ts honest. That suite drives a
 * hand-built DOM fixture, which is the fastest way to test behaviour and the
 * easiest thing in a repository to leave behind when the component changes.
 * So the field contract in tests/fixtures/quick-quote.ts is asserted here
 * against the rendered `QuickQuoteForm.astro` — names, types, required flags,
 * autocomplete tokens and error slots. If the component grows a field, or
 * makes `email` required, this file fails and the behavioural suite stops
 * being a description of something that no longer exists.
 *
 * Everything here is read off a real `astro build`. What a deployed origin
 * does with it is a different question and a different check.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BANNED_FIELDS, FIELDS, REQUIRED_COUNT } from '../fixtures/quick-quote';
import { SERVICE_OPTIONS } from '../../src/data/services';
import { CAPTCHA_FIELD, CAPTCHA_MARKUP, questionRequiredCount } from './captcha-markup';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-quote');

let quote = '';

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
  quote = fs.readFileSync(path.join(out, 'request-a-quote', 'index.html'), 'utf8');
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- helpers -------------------------------------------------------------- */

/** Every `<form …>` opening tag on the page. */
const formTags = () => quote.match(/<form\b[^>]*>/gi) ?? [];

/** The whole `<form …>…</form>` for the quick quote. */
function quickQuoteForm(): string {
  const start = quote.search(/<form\b[^>]*data-quick-quote/i);
  expect(start).toBeGreaterThan(-1);
  const end = quote.indexOf('</form>', start);
  return quote.slice(start, end + 7);
}

/** The opening tag of the control named `name`, from anywhere in `html`. */
function control(html: string, name: string): string | null {
  const re = new RegExp(`<(input|select|textarea)\\b[^>]*\\bname="${name}"[^>]*>`, 'i');
  return html.match(re)?.[0] ?? null;
}

const attr = (tag: string, name: string): string | null =>
  tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] ?? null;

const hasFlag = (tag: string, name: string): boolean =>
  new RegExp(`\\b${name}(?=[\\s/>=])`, 'i').test(tag);

/* --- 1. one form, not two ------------------------------------------------- */

describe('the duplicate form is gone', () => {
  it('renders exactly one lead form on the page', () => {
    /* The search widget is a form too, and it is meant to be. Lead forms are
       the ones that post to the endpoint. */
    const leadForms = formTags().filter((t) => /data-endpoint=/.test(t));
    expect(leadForms).toHaveLength(1);
  });

  it('is the shared quote form, rendered once', () => {
    expect(quote).toContain('data-quick-quote');
    expect(quote).not.toContain('quote-form-1381');
  });

  it('carries one form_id, so the two cannot be confused in reporting', () => {
    const ids = [...quote.matchAll(/data-form-id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(['quick-quote']);
  });

  it('has no duplicate element ids', () => {
    const ids = [...quote.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* --- 2. the field contract ------------------------------------------------ */

describe('the rendered form matches the contract the unit suite tests', () => {
  const form = () => quickQuoteForm();

  it.each(FIELDS)('$name is rendered as specified', (spec) => {
    const tag = control(form(), spec.name);
    expect(tag, `no control named "${spec.name}" in the rendered form`).not.toBeNull();
    expect(tag!.startsWith(`<${spec.tag}`)).toBe(true);
    if (spec.type) expect(attr(tag!, 'type')).toBe(spec.type);
    expect(hasFlag(tag!, 'required')).toBe(spec.required);
    if (spec.autocomplete) expect(attr(tag!, 'autocomplete')).toBe(spec.autocomplete);
    if (spec.inputmode) expect(attr(tag!, 'inputmode')).toBe(spec.inputmode);
  });

  it('renders an error slot for every field that has one', () => {
    const keys = new Set(
      [...form().matchAll(/data-qq-error="([^"]+)"/g)].map((m) => m[1])
    );
    for (const spec of FIELDS) {
      if (spec.errorKey) expect(keys).toContain(spec.errorKey);
    }
  });

  it('asks eight required questions', () => {
    /* The original site's form 1381: name, business, four address boxes,
       email and phone. Pinned rather than loosened: a field quietly
       becoming required is a conversion cost somebody should have to state
       out loud. */
    const required = questionRequiredCount(form());
    expect(required).toBe(REQUIRED_COUNT);
    expect(required).toBe(8);
  });

  it.each(BANNED_FIELDS)('does not ask for %s', (name) => {
    expect(control(quote, name)).toBeNull();
  });

  it('asks exactly the contract fields, the services checklist, and nothing else', () => {
    /* The only extra controls are the honeypot, the captcha token and the
       eight service checkboxes, which share one name. */
    const named = [...form().matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)].map(
      (m) => m[1]
    );
    const EXTRAS = ['company-website', CAPTCHA_FIELD, 'services'];
    expect(named.filter((n) => !EXTRAS.includes(n)).sort()).toEqual(
      FIELDS.map((f) => f.name).sort()
    );
    expect(named.filter((n) => n === 'services')).toHaveLength(SERVICE_OPTIONS.length);
  });
});

/* --- 3. labels, not placeholders ------------------------------------------ */

describe('every field is labelled', () => {
  it('has a <label for> pointing at each visible control', () => {
    const form = quickQuoteForm();
    const labelled = new Set([...form.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
    for (const spec of FIELDS) {
      const tag = control(form, spec.name)!;
      const id = attr(tag, 'id')!;
      expect(labelled, `field "${spec.name}" has no <label for="${id}">`).toContain(id);
    }
  });

  it('uses no placeholder as a substitute for a label', () => {
    /* THIS USED TO FORBID `placeholder=` ENTIRELY, which was broader than the
       rule its own name states. The anti-pattern is a placeholder standing IN
       for a label — it disappears the moment someone types, taking the only
       description of the field with it, and it is invisible to assistive
       technology that looks for a label.

       A placeholder ALONGSIDE a real label is not that. It is an example of
       the format wanted, and the form now carries six of them. So the rule is
       enforced as written: a placeholder is allowed, a missing label is not. */
    const form = quickQuoteForm();
    const labelled = new Set(
      [...form.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1])
    );

    const placeholdered = [...form.matchAll(/<(?:input|textarea)\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((tag) => /\bplaceholder=/i.test(tag));

    expect(placeholdered.length, 'expected the form to use placeholders').toBeGreaterThan(0);
    for (const tag of placeholdered) {
      const id = attr(tag, 'id');
      expect(id, `a placeholdered field has no id: ${tag}`).toBeTruthy();
      expect(labelled, `placeholder with no <label for="${id}">`).toContain(id!);
    }
  });

  it('describes each field by the element that will hold its error', () => {
    const form = quickQuoteForm();
    for (const spec of FIELDS) {
      if (!spec.errorKey) continue;
      const described = attr(control(form, spec.name)!, 'aria-describedby');
      expect(described, `"${spec.name}" has no aria-describedby`).toBeTruthy();
      const slot = form.match(new RegExp(`<[^>]*\\bid="${described}"[^>]*>`, 'i'))?.[0];
      expect(slot, `aria-describedby="${described}" points at nothing`).toBeTruthy();
      expect(attr(slot!, 'data-qq-error')).toBe(spec.errorKey);
    }
  });

  it("uses the original form's labels", () => {
    const f = quickQuoteForm();
    for (const label of [
      'Name',
      'Name of Business',
      'Address',
      'Email',
      'Phone',
      'Additional comments',
    ]) {
      expect(f, label).toContain(label);
    }
    expect(f).toMatch(/I(?:'|&#39;)m interested in a quote for these services/);
  });
});

/* The marketing consent checkbox was removed from the form at the client's
   request, and its tests went with it. `marketing_consent` and
   `consent_text` keep their columns and the Worker still reads them — see
   tests/worker/submit-lead.test.ts — so a future form can set them again
   without a migration. Nothing on the site sets them today, which means every
   new lead stores false. */


/* --- 4. one H1, full navigation ------------------------------------------- */

describe('the page around the form', () => {
  it('has exactly one H1', () => {
    expect(quote.match(/<h1\b/gi) ?? []).toHaveLength(1);
    expect(quote).toMatch(/<h1[^>]*>Request a Quote<\/h1>/i);
  });

  it('keeps the complete site navigation', () => {
    /* Phase 10 is where minimal-navigation paid pages happen. This is an
       organic page and a visitor may have arrived mid-thought, so the claim
       is not "some nav exists" but "the same nav every other inner page
       has" — compared against one, link for link. */
    const about = fs.readFileSync(path.join(out, 'about-us', 'index.html'), 'utf8');
    const headerLinks = (html: string) => {
      const header = html.slice(html.search(/<header\b/i), html.search(/<\/header>/i));
      return [...header.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).sort();
    };
    const here = headerLinks(quote);
    expect(here.length).toBeGreaterThan(10);
    expect(here).toEqual(headerLinks(about));
  });

  it('opens the form with a heading below the H1, not another H1', () => {
    expect(quote).toMatch(/<h2[^>]*>Tell us where to send it<\/h2>/i);
  });

  it('states what happens after submission', () => {
    expect(quote).toMatch(/within 2 hours/i);
    expect(quote).not.toMatch(/as soon as possible/i);
    expect(quote).toMatch(/no obligation/i);
  });
});

/* --- 5. what replaced the sidebar form ------------------------------------ */

describe('the sidebar carries help, not a second form', () => {
  it('offers a click-to-call', () => {
    expect(quote).toContain('href="tel:+14168034880"');
  });

  it('keeps "Serving Toronto since 1989"', () => {
    expect(quote).toContain('Serving Toronto since 1989');
  });

  it('makes only claims the site already makes', () => {
    for (const claim of ['WSIB covered and bonded', 'A reply within 2 hours', 'No obligation']) {
      expect(quote).toContain(claim);
    }
  });

  it('introduces no rating, review count or certification', () => {
    /* Phase 7 removed an unverified 4.9/5 from two landing pages. Nothing on
       this page reintroduces that shape of claim. */
    expect(quote).not.toMatch(/\b4\.9\b/);
    expect(quote).not.toMatch(/\b\d(?:\.\d)?\s*\/\s*5\b/);
    expect(quote).not.toMatch(/\b\d+\+?\s+(?:google\s+)?reviews\b/i);
    expect(quote).not.toMatch(/\bISO\s?\d{4,}/i);
  });

  it('publishes hours that agree with the structured data', async () => {
    const { hours, hoursNote } = await import('../../src/data/site');
    /* Word joiners keep "8am–8pm" from breaking at the dash on screen. */
    expect(quote.replace(/\u2060/g, '')).toContain(hoursNote);
    /* 07:00 → 7am, 18:00 → 6pm: the note is the same fact in words, and
       both match the Google Business Profile (30 Oct 2026). Weekends are
       closed, so there is no second group. */
    expect(hours).toHaveLength(1);
    expect(hours[0].opens).toBe('07:00');
    expect(hours[0].closes).toBe('18:00');
    expect(hoursNote).toContain('Monday to Friday 7am–6pm');
  });
});

/* --- 6. the captcha is still the deferred one ----------------------------- */

describe('spam protection is unchanged', () => {
  it('renders the captcha container, and Turnstile with no eager api.js tag', () => {
    expect(quote).toMatch(CAPTCHA_MARKUP);
    expect(quote).not.toMatch(/<script[^>]+challenges\.cloudflare\.com/i);
  });

  it('keeps the honeypot, hidden from people and from assistive tech', () => {
    const form = quickQuoteForm();
    expect(control(form, 'company-website')).not.toBeNull();
    expect(form).toMatch(/<div class="qq-hp"[^>]*aria-hidden="true"/);
    expect(attr(control(form, 'company-website')!, 'tabindex')).toBe('-1');
  });
});

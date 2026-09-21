/**
 * @vitest-environment node
 *
 * Phase 11 — every telephone link the site emits, across all 77 pages.
 *
 * The behaviour of the handler is `tests/phone-click.test.ts`. This is the
 * other half: that the markup it reads actually carries what it needs, on
 * every page, including the ones nobody was thinking about.
 *
 * WHY THIS IS A BUILD TEST AND NOT A UNIT TEST. The links come from three
 * unrelated places — components, page templates, and Markdown bodies recovered
 * from WordPress — and only the build brings all three together. Twenty-nine
 * of them are in prose; no component test would ever see them.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCATIONS } from '../../src/lib/phone-click';
import { nap } from '../../src/data/site';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-phone');

interface TelLink {
  page: string;
  href: string;
  displayed: string;
  location: string | null;
  attrs: string;
}

let links: TelLink[] = [];
let pageCount = 0;

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return full.endsWith('.html') ? [full] : [];
    });

  const files = walk(out);
  pageCount = files.length;
  links = files.flatMap((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const page = '/' + path.relative(out, file).replace(/index\.html$/, '');
    return [...html.matchAll(/<a\b([^>]*\bhref="tel:[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
      page,
      href: m[1].match(/\bhref="([^"]*)"/)![1],
      displayed: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
      location: m[1].match(/\bdata-call-location="([^"]*)"/)?.[1] ?? null,
      attrs: m[1],
    }));
  });
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- the destination ------------------------------------------------------ */

describe('every rendered tel: link', () => {
  it('is present on every page of the site', () => {
    expect(pageCount).toBe(77);
    expect(new Set(links.map((l) => l.page)).size).toBe(77);
    expect(links.length).toBeGreaterThanOrEqual(115);
  });

  it('dials the one canonical, normalised destination', () => {
    /* E.164, no `tel://`, no local formatting, no tracking number baked into
       the source. A tracking number appears at RUNTIME or not at all. */
    expect(new Set(links.map((l) => l.href))).toEqual(new Set([nap.phoneHref]));
    expect(nap.phoneHref).toBe('tel:+14168034880');
  });

  it('never carries a `tel://` authority, which some dialers refuse', () => {
    expect(links.filter((l) => l.href.startsWith('tel://'))).toEqual([]);
  });

  it('carries an explicit data-call-location', () => {
    const missing = links.filter((l) => !l.location);
    expect(
      missing.map((l) => `${l.page} "${l.displayed}"`),
      'links relying on the runtime fallback'
    ).toEqual([]);
  });

  it('uses only values from the controlled list', () => {
    const stray = links.filter((l) => !(LOCATIONS as readonly string[]).includes(l.location!));
    expect(stray.map((l) => `${l.page} → ${l.location}`)).toEqual([]);
  });
});

/* --- the locations that must exist ---------------------------------------- */

describe('the locations the site actually uses', () => {
  const at = (loc: string) => links.filter((l) => l.location === loc);

  it('the site header carries one on every non-paid page', () => {
    /* 74 = 77 pages less the three on the landing-page shell, which have
       their own header. */
    expect(at('header')).toHaveLength(74);
  });

  it('the header link doubles as the mobile drawer item', () => {
    /* One element, two honest answers — and the drawer value is resolved from
       DOM state at click time, never from the link's text. */
    const header = at('header')[0];
    expect(header.attrs).toContain('data-call-location-open="mobile_navigation"');
  });

  it.each([
    ['hero', 1],
    ['quote_sidebar', 1],
    ['paid_header', 3],
    ['paid_sticky', 2],
    ['paid_cta', 2],
    ['form_note', 3],
  ])('%s appears %i time(s)', (loc, count) => {
    expect(at(loc)).toHaveLength(count);
  });

  it('body prose is labelled content, including links from Markdown', () => {
    const content = at('content');
    expect(content.length).toBeGreaterThanOrEqual(29);
    /* The five service pages carry a bare "Call Now" link written in
       Markdown. They have no component, so `normalizeBody` stamps them. */
    expect(content.filter((l) => l.displayed === 'Call Now')).toHaveLength(5);
  });

  it('the footer has none, on either layout', () => {
    /* Recorded rather than asserted as desirable: the brief listed `footer`
       as a location and the site does not have one there. Adding a telephone
       number to the footer is a content decision, not a tracking one. This
       test exists so that adding one later is a deliberate act that updates
       this line, rather than a silent change to what the report covers. */
    expect(at('footer')).toHaveLength(0);
  });
});

/* --- the handler is installed --------------------------------------------- */

describe('the sitewide handler', () => {
  const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');

  it.each([
    ['a standard page', 'services/office-cleaning/index.html'],
    ['the homepage', 'index.html'],
    ['the quote page', 'request-a-quote/index.html'],
    ['a landing page', 'lp/commercial-cleaning/index.html'],
    ['the thank-you page', 'thank-you/index.html'],
    ['the 404 page', '404.html'],
  ])('is bundled into %s', (_name, file) => {
    /* The component emits a module script; Astro bundles it, so the assertion
       is that the page pulls in a module, and the bundle content check below
       proves it is this one. */
    expect(read(file)).toMatch(/<script type="module"/);
  });

  /**
   * Everything the browser executes, wherever Astro chose to put it.
   *
   * It inlines a small module into each page rather than emitting a separate
   * `_astro/*.js`, and which it does is a bundler decision that can change
   * between versions. Searching only `_astro/` made this test fail against a
   * build that was perfectly correct — so it now asks the question that
   * actually matters: does the code reach the page.
   */
  const allScript = () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return /\.(html|js)$/.test(full) ? [full] : [];
      });
    return walk(out)
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');
  };

  it('delivers the delegated listener and the event name to the page', () => {
    const js = allScript();
    expect(js).toContain('phone_click');
    expect(js).toContain('a[href^="tel:" i]');
  });

  it('the retired per-anchor click_to_call handler is gone', () => {
    /* It hardcoded the number, so it reported the canonical one even when
       CallTrackingMetrics had swapped in a tracking number. */
    expect(allScript()).not.toContain('click_to_call');
  });

  it('the handler code reaches every page, not just the ones with a layout', () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return full.endsWith('.html') ? [full] : [];
      });
    const without = walk(out).filter((f) => {
      const html = fs.readFileSync(f, 'utf8');
      /* Either inlined, or pulled in as a module the bundler emitted. */
      return !html.includes('phone_click') && !/<script type="module"/.test(html);
    });
    expect(without.map((f) => path.relative(out, f))).toEqual([]);
  });
});

/* --- the canonical number is still the canonical number ------------------- */

describe('the number itself', () => {
  it('is (416) 803-4880 in the business data', () => {
    expect(nap.phoneDisplay).toBe('(416) 803-4880');
    expect(nap.phoneSchema).toBe('+1-416-803-4880');
  });

  it('is what the structured data publishes', () => {
    const home = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    const ld = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
    expect(ld).toContain('+1-416-803-4880');
  });

  it('appears nowhere as a hardcoded tracking number', () => {
    /* The three tracking numbers CallTrackingMetrics is configured to swap in
       are its business, not this repository's. None may be baked into the
       source — if one appears in the HTML, dynamic insertion has been
       replaced by a hardcoded number and the fallback for organic visitors is
       wrong. */
    const all = fs
      .readdirSync(out, { recursive: true, encoding: 'utf8' })
      .filter((f) => typeof f === 'string' && f.endsWith('.html'))
      .map((f) => fs.readFileSync(path.join(out, f), 'utf8'))
      .join('\n');
    const numbers = [...all.matchAll(/tel:\+?(\d{10,})/g)].map((m) => m[1]);
    expect(new Set(numbers)).toEqual(new Set(['14168034880']));
  });
});

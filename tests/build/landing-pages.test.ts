/**
 * @vitest-environment node
 *
 * Phase 10 — the two paid landing pages, as emitted.
 *
 * WHAT THIS FILE IS DEFENDING. Before Phase 10 these were two independent
 * implementations of one offer: two hero grids differing by 10px nobody could
 * explain, two sets of four "differentiators" of which only two agreed, two
 * honeypots, two sticky bars, ~400 lines of near-identical CSS each, and two
 * forms asking different questions. They drifted because nothing stopped
 * them, and the most expensive drift was Phase 7's: an invented "4.9/5 Google
 * Rating" had to be removed from BOTH, separately.
 *
 * So most of what follows is asserted for both pages from one table. A rule
 * that holds on one landing page and not the other is exactly the failure
 * this phase exists to end, and a test written twice is a test that gets
 * updated once.
 *
 * THE TWO THINGS THAT MUST NOT BE SHARED are the reporting identities. They
 * are checked here as explicitly as the shared parts, because "consolidate
 * the pages" and "merge their conversion data" are one careless edit apart,
 * and merging them destroys the only reason for running two pages.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BANNED_FIELDS, FIELDS } from '../fixtures/quick-quote';
import { BENEFITS, FACILITY_TYPES, TRUST_POINTS } from '../../src/data/landing';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-lp');

/**
 * The two pages, and the one thing that legitimately differs between them.
 *
 * `anchor` is the DOM id and the `#` target — what an existing link resolves
 * against. `reportingId` is what lands in `form_id` on the conversion event
 * and in the `form_id` column in Neon. On the quote page these are NOT the
 * same string, and that is not a mistake: the element has always been
 * `lpq-form` and the value it has always reported is
 * `lp-commercial-cleaning-quote`, which two rows in the leads table already
 * carry. Both are preserved, each doing its own job.
 */
const PAGES = [
  {
    name: 'commercial-cleaning',
    file: 'lp/commercial-cleaning/index.html',
    url: '/lp/commercial-cleaning/',
    anchor: 'ppc-lead-form',
    reportingId: 'ppc-lead-form',
  },
  {
    name: 'commercial-cleaning-quote',
    file: 'lp/commercial-cleaning-quote/index.html',
    url: '/lp/commercial-cleaning-quote/',
    anchor: 'lpq-form',
    reportingId: 'lp-commercial-cleaning-quote',
  },
] as const;

const html: Record<string, string> = {};
let sitemap = '';

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
  for (const p of PAGES) html[p.name] = fs.readFileSync(path.join(out, p.file), 'utf8');
  sitemap = fs
    .readdirSync(out)
    .filter((f) => f.startsWith('sitemap'))
    .map((f) => fs.readFileSync(path.join(out, f), 'utf8'))
    .join('\n');
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- helpers -------------------------------------------------------------- */

const leadForm = (page: string) => {
  const h = html[page];
  const start = h.search(/<form\b[^>]*data-quick-quote/i);
  expect(start, `${page}: no short form on the page`).toBeGreaterThan(-1);
  return h.slice(start, h.indexOf('</form>', start) + 7);
};

const control = (fragment: string, name: string) =>
  fragment.match(new RegExp(`<(input|select|textarea)\\b[^>]*\\bname="${name}"[^>]*>`, 'i'))?.[0] ?? null;

/**
 * Where an ANCHOR can take a visitor, minus in-page targets and the phone.
 *
 * `<a href>` specifically, not every `href` in the document: `<link>` carries
 * the canonical, the preconnect, the icons, the stylesheets and the font
 * preloads, and none of those is a thing a person can click.
 */
const offPageLinks = (page: string) =>
  [...html[page].matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:'));

/* --- 1. both routes use the shared system --------------------------------- */

describe('the two pages are one implementation', () => {
  it.each(PAGES)('$name renders the shared landing components', ({ name }) => {
    const h = html[name];
    /* Each of these markers belongs to exactly one shared component, so all
       five present means the page is built from the system rather than from
       its own copy of the markup. */
    expect(h, 'LpHero').toContain('lpx-hero-grid');
    expect(h, 'LpBenefits or LpFacilities').toContain('lpx-cards');
    expect(h, 'LpReviews').toContain('lpx-reviews');
    expect(h, 'LpAreas').toContain('lpx-areas');
    expect(h, 'LpFinalCta').toContain('lpx-final');
    expect(h, 'LpSticky').toContain('lpx-sticky');
  });

  it.each(PAGES)('$name no longer carries its own hero or form CSS', ({ name }) => {
    /* The old per-page class prefixes. Their absence is what proves the
       duplication is gone rather than merely hidden behind new names. */
    for (const dead of ['lp-hero-grid', 'lpq-hero-grid', 'lp-form-col', 'lpq-form-col', 'lp-field', 'lpq-field']) {
      expect(html[name], `${dead} should be gone`).not.toContain(dead);
    }
  });

  it('both pages print the same benefits, facilities and trust points', () => {
    for (const { name } of PAGES) {
      for (const b of BENEFITS) expect(html[name]).toContain(b.title);
      for (const f of FACILITY_TYPES) expect(html[name]).toContain(f.title);
      for (const t of TRUST_POINTS) expect(html[name]).toContain(t);
    }
  });

  it('neither page invents a benefit the other does not have', () => {
    /* The concrete form of "they agreed about the business". Both pages'
       card titles, as sets, must be identical. */
    const titles = (name: string) =>
      [...html[name].matchAll(/<strong>([^<]+)<\/strong>\s*<span>/g)].map((m) => m[1]).sort();
    expect(titles(PAGES[0].name)).toEqual(titles(PAGES[1].name));
  });
});

/* --- 2. the reporting identities stay distinct ---------------------------- */

describe('conversion identities', () => {
  it.each(PAGES)('$name reports as $reportingId', ({ name, reportingId }) => {
    const ids = [...html[name].matchAll(/data-form-id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual([reportingId]);
  });

  it.each(PAGES)('$name keeps $anchor as its element id and anchor target', ({ name, anchor }) => {
    expect(html[name]).toContain(`id="${anchor}"`);
    /* Every in-page anchor on the page points at this form and nothing else,
       so the header button, the final CTA and the sticky bar all land on it. */
    const anchors = [...html[name].matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(anchors.length).toBeGreaterThanOrEqual(3);
    expect(new Set(anchors)).toEqual(new Set([anchor]));
  });

  it('the two pages do not share a reporting identity', () => {
    expect(PAGES[0].reportingId).not.toBe(PAGES[1].reportingId);
    expect(html[PAGES[0].name]).not.toContain(PAGES[1].reportingId);
    expect(html[PAGES[1].name]).not.toContain(PAGES[0].reportingId);
  });
});

/* --- 3. both use the Phase 9 short form ----------------------------------- */

describe('the short form', () => {
  it.each(PAGES)('$name renders exactly one lead form', ({ name }) => {
    const forms = (html[name].match(/<form\b[^>]*>/gi) ?? []).filter((t) => /data-endpoint=/.test(t));
    expect(forms).toHaveLength(1);
  });

  it.each(PAGES)('$name asks five questions, all required', ({ name }) => {
    const form = leadForm(name);
    for (const spec of FIELDS) {
      const tag = control(form, spec.name);
      expect(tag, `${name}: missing ${spec.name}`).not.toBeNull();
      expect(new RegExp(`\\brequired(?=[\\s/>=])`, 'i').test(tag!)).toBe(spec.required);
    }
    /* Five. It was four, then briefly seven when the reference design's
       address and province boxes went in, then five when they came back out.
       The message stayed required through all of it. */
    expect((form.match(/\brequired(?=[\s/>])/g) ?? []).length).toBe(5);
  });

  it.each(PAGES)('$name asks for none of the fields nothing on this site asks for', ({ name }) => {
    /* `last-name`, `city`, `state` and `province` came OFF this list when the
       reference field set was adopted — the form asks for them now. What is
       left is split address lines and the qualification questions that belong
       in the account executive's first call. */
    for (const banned of [...BANNED_FIELDS, 'fullName', 'workEmail', 'facilityType', 'facilitySize']) {
      expect(control(html[name], banned), `${name} still asks for ${banned}`).toBeNull();
    }
  });

  it.each(PAGES)('$name requires BOTH a phone and an email, each with its own error', ({ name }) => {
    /* THIS ASSERTED THE OPPOSITE until the reference field set was adopted:
       "phone OR email, one is enough", sharing a single error slot keyed
       `contact` because the rule had no field of its own. Both are required
       now, so each needs somewhere separate to say what is wrong with it —
       one slot for two required fields shows one message and hides the
       other. */
    const form = leadForm(name);
    for (const field of ['phone', 'email']) {
      expect(/\brequired(?=[\s/>=])/i.test(control(form, field)!)).toBe(true);
    }
    expect(form).not.toContain('data-qq-error="contact"');
    expect(form).toContain('data-qq-error="phone"');
    expect(form).toContain('data-qq-error="email"');
  });

  it.each(PAGES)('$name labels every field and uses no placeholder as a label', ({ name }) => {
    /* The rule is a placeholder standing IN for a label, which vanishes the
       moment someone types and is invisible to a screen reader looking for a
       label. A placeholder ALONGSIDE a real label is a format hint, and the
       form now carries six. So: placeholders allowed, missing labels not.
       Mirrored in tests/build/quote-page.test.ts. */
    const form = leadForm(name);
    const labelled = new Set([...form.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
    for (const spec of FIELDS) {
      const id = control(form, spec.name)!.match(/\bid="([^"]+)"/)![1];
      expect(labelled, `${name}: ${spec.name} unlabelled`).toContain(id);
    }
    for (const tag of [...form.matchAll(/<(?:input|textarea)\b[^>]*>/g)].map((m) => m[0])) {
      if (!/\bplaceholder=/i.test(tag)) continue;
      const id = tag.match(/\bid="([^"]+)"/)?.[1];
      expect(labelled, `${name}: placeholder with no label (${id})`).toContain(id!);
    }
  });
});

/* --- 4. distraction is gone ----------------------------------------------- */

describe('isolation from the rest of the site', () => {
  it.each(PAGES)('$name carries no site navigation', ({ name }) => {
    const h = html[name];
    for (const nav of ['/services/', '/about-us/', '/contact-us/', '/locations/', '/category/blog/', '/reviews/', '/search/']) {
      expect(h, `${name} links to ${nav}`).not.toContain(`href="${nav}"`);
    }
    /* The site header and footer components, by their own markers. */
    expect(h).not.toContain('site-logo');
    expect(h).not.toContain('widget-recent');
    expect(h).not.toContain('search-form');
  });

  it.each(PAGES)('$name offers only itself and the privacy policy as links away', ({ name, url }) => {
    expect(new Set(offPageLinks(name))).toEqual(new Set([url, '/privacy/']));
  });

  it.each(PAGES)('$name has no Terms link, because there is no terms page', ({ name }) => {
    expect(html[name]).not.toMatch(/Terms of Service|Terms &amp; Conditions/i);
    expect(fs.existsSync(path.join(out, 'terms/index.html'))).toBe(false);
  });

  it.each(PAGES)('$name keeps a minimal header with the telephone and a quote button', ({ name, anchor }) => {
    const h = html[name];
    const header = h.slice(h.search(/<header\b/i), h.search(/<\/header>/i));
    expect(header).toContain('tel:+14168034880');
    expect(header).toContain(`href="#${anchor}"`);
    /* Logo, phone, quote — three links and no more. */
    expect([...header.matchAll(/<a\b/g)]).toHaveLength(3);
  });

  it.each(PAGES)('$name keeps a legal footer with the business identity', ({ name }) => {
    const h = html[name];
    const footer = h.slice(h.search(/<footer\b/i), h.search(/<\/footer>/i));
    expect(footer).toContain('Evergreen Office Cleaning');
    expect(footer).toContain('243 Queen St W.');
    expect(footer).toContain('/privacy/');
    expect([...footer.matchAll(/<a\b/g)]).toHaveLength(1);
  });
});

/* --- 5. the telephone number ---------------------------------------------- */

describe('the real telephone number, everywhere', () => {
  it.each(PAGES)('$name dials (416) 803-4880 and nothing else', ({ name }) => {
    const hrefs = [...html[name].matchAll(/href="(tel:[^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThanOrEqual(3); // header, final CTA, sticky bar
    expect(new Set(hrefs)).toEqual(new Set(['tel:+14168034880']));
    expect(html[name]).toContain('(416) 803-4880');
  });

  it.each(PAGES)('$name shows no tracking or substitute number', ({ name }) => {
    const numbers = [...html[name].matchAll(/\(?\b(?:416|647|437|905|289|800|888|877)\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)]
      .map((m) => m[0].replace(/\D/g, ''));
    expect(new Set(numbers)).toEqual(new Set(['4168034880']));
  });
});

/* --- 6. nothing unverifiable ---------------------------------------------- */

describe('claims', () => {
  it.each(PAGES)('$name makes no numeric rating or review-count claim', ({ name }) => {
    const h = html[name];
    expect(h).not.toMatch(/\b4\.9\b/);
    expect(h).not.toMatch(/\b\d(?:\.\d)?\s*(?:\/|out of)\s*5\b(?![^<]*<\/span>)/i);
    expect(h).not.toMatch(/\b\d+\+?\s*(?:google\s+)?reviews\b/i);
    expect(h).not.toMatch(/\b\d+\+?\s*(?:happy\s+)?(?:clients|customers|businesses)\b/i);
    expect(h).not.toMatch(/5-star|five-star/i);
  });

  it.each(PAGES)('$name claims no duration of trading except the founding year', ({ name }) => {
    /* Scoped to the page's OWN copy, with the review bodies removed: one of
       the genuine reviews says "for the past 3 years", which is the
       reviewer's sentence about their own contract and not a claim by the
       business. The claim being banned is the "20+ years" shape that Phase 7
       replaced with the founding year, because a computed duration goes
       stale and has to be right every January. */
    const ownCopy = html[name].replace(/<p class="lpx-review-body">[\s\S]*?<\/p>/g, '');
    expect(ownCopy).not.toMatch(/\b\d+\+\s*years\b/i);
    expect(ownCopy).not.toMatch(/\bover \d+ years\b/i);
    expect(ownCopy).not.toMatch(/\b\d+ years (?:of |in )?(?:experience|business|service)\b/i);
  });

  it.each(PAGES)('$name claims no certification beyond WSIB and bonded', ({ name }) => {
    const h = html[name];
    expect(h).not.toMatch(/\bISO\s?\d{3,}/i);
    expect(h).not.toMatch(/certified|accredited|award-winning/i);
    expect(h).not.toMatch(/good standing/i);
  });

  it.each(PAGES)('$name offers no guarantee and no promise faster than the published one', ({ name }) => {
    const h = html[name];
    expect(h).not.toMatch(/guarantee/i);
    expect(h).not.toMatch(/100%\s*(?:privacy|satisfaction)/i);
    expect(h).not.toMatch(/no spam,? ever/i);
    expect(h).not.toMatch(/same[- ]day|within (?:an|1) hour|instant quote/i);
    /* The one reply promise the site has published since Phase 3. */
    expect(h).toContain('2 business hours');
  });

  it.each(PAGES)('$name states the founding year rather than a computed duration', ({ name }) => {
    expect(html[name]).toContain('Serving Toronto since 1989');
  });

  it('review stars belong to individual reviews, never to an aggregate', () => {
    for (const { name } of PAGES) {
      const stars = [...html[name].matchAll(/★+/g)].map((m) => m[0]);
      /* Three reviews, five stars each, and every run inside a review card. */
      expect(stars).toHaveLength(3);
      for (const run of stars) expect(run).toBe('★★★★★');
      expect(html[name]).toContain('lpx-review-stars');
    }
  });
});

/* --- 7. indexing ---------------------------------------------------------- */

describe('indexing', () => {
  it.each(PAGES)('$name is noindex, nofollow', ({ name }) => {
    expect(html[name]).toMatch(/<meta name="robots" content="noindex, nofollow">/);
  });

  it.each(PAGES)('$name canonicalises to its own production URL', ({ name, url }) => {
    expect(html[name]).toContain(
      `<link rel="canonical" href="https://www.evergreencleaningservice.ca${url}">`
    );
  });

  it.each(PAGES)('$name is absent from the sitemap', ({ url }) => {
    expect(sitemap).not.toContain(url);
  });

  it.each(PAGES)('$name is not linked from any indexable page', ({ url }) => {
    /* A noindex page that the whole site links to still gets crawled, and
       still competes for attention in Search Console. */
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return full.endsWith('.html') ? [full] : [];
      });
    const linking = walk(out).filter((f) => {
      const h = fs.readFileSync(f, 'utf8');
      if (/<meta name="robots" content="noindex/.test(h)) return false;
      return h.includes(`href="${url}"`);
    });
    expect(linking.map((f) => path.relative(out, f))).toEqual([]);
  });

  it('the URLs themselves are unchanged, so advertising links keep working', () => {
    for (const p of PAGES) expect(fs.existsSync(path.join(out, p.file))).toBe(true);
  });
});

/* --- 8. the protections that must survive a redesign ---------------------- */

describe('spam, attribution and conversion protections', () => {
  it.each(PAGES)('$name keeps the honeypot, hidden from people and assistive tech', ({ name }) => {
    const form = leadForm(name);
    expect(control(form, 'company-website')).not.toBeNull();
    expect(form).toMatch(/<div class="qq-hp"[^>]*aria-hidden="true"/);
    expect(control(form, 'company-website')).toMatch(/tabindex="-1"/);
  });

  it.each(PAGES)('$name renders the Turnstile widget', ({ name }) => {
    expect(html[name]).toContain('class="cf-turnstile"');
    expect(html[name]).toContain('data-response-field-name="cf-turnstile-response"');
  });

  it.each(PAGES)('$name asks the captcha to load eagerly, since its form is in the first screen', ({ name }) => {
    expect(html[name]).toMatch(/class="cf-turnstile"[^>]*data-eager/);
  });

  it.each(PAGES)('$name loads attribution and the tag container', ({ name }) => {
    expect(html[name]).toContain('GTM-5PRC4HBV');
    /* Attribution runs in the head so a campaign arrival is recorded before
       anything else on the page can navigate. */
    expect(html[name]).toMatch(/first_touch|attribution/i);
  });

  it.each(PAGES)('$name no longer redirects to /thank-you/ on success', ({ name }) => {
    /* Phase 10 moved both pages to the in-page confirmation. The redirect is
       why they used to need `awaitTagDelivery` — a navigation can abort the
       conversion beacon it was racing. */
    expect(html[name]).not.toContain('/thank-you/');
  });

  it.each(PAGES)('$name pushes no conversion event in its own markup', ({ name }) => {
    /* `lead_form_submission` is pushed by lead-submit.ts after a 2xx and
       nowhere else. A page that names the event in its own HTML has grown a
       second path to it. */
    expect(html[name]).not.toContain('lead_form_submission');
  });
});

/* --- 9. the sticky bar cannot cover the form ------------------------------ */

describe('the mobile sticky bar', () => {
  it.each(PAGES)('$name reserves page padding at least as tall as the bar', ({ name }) => {
    expect(html[name]).toContain('lpx-sticky');
    const css = fs
      .readdirSync(path.join(out, '_astro'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => fs.readFileSync(path.join(out, '_astro', f), 'utf8'))
      .join('\n');

    const reserved = Number(css.match(/body\.lp\{[^}]*padding-bottom:(\d+)px/)?.[1] ?? 0);
    const barHeight = Number(css.match(/\.lpx-sticky a\{[^}]*min-height:(\d+)px/)?.[1] ?? 0);
    expect(barHeight).toBeGreaterThan(0);
    expect(reserved).toBeGreaterThanOrEqual(barHeight);
  });

  it('the bar is hidden on anything wider than a phone', () => {
    const css = fs
      .readdirSync(path.join(out, '_astro'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => fs.readFileSync(path.join(out, '_astro', f), 'utf8'))
      .join('\n');
    expect(css).toMatch(/@media \(width>=768px\)\{\.lpx-sticky\{display:none\}\}/);
  });
});

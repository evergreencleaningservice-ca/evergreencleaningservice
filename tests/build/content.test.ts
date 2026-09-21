/**
 * @vitest-environment node
 *
 * Phase 7 — the corrections stay corrected.
 *
 * Asserted against the built HTML rather than the source, because most of
 * this copy exists twice: the homepage's About band is an `.astro` component
 * and `/about-us/` is a Markdown page, and they carried the same four errors
 * independently. A source-level check would pass on a half-fix.
 *
 * The duration test is the one that matters most. The site made two claims
 * about its own age — "since 1989" in some places and "over 20 years" in
 * others — which cannot both be true, and the second understated the business
 * by sixteen years. Every one of them now reads from the founding year.
 * A computed "N+ years" is not an acceptable substitute: it goes stale
 * between builds and has to be right every January.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-content');

let pages: { page: string; text: string }[] = [];

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
      return full.endsWith('.html') ? [path.relative(out, full)] : [];
    });
  pages = walk(out).map((page) => ({
    page,
    /* Collapse whitespace: several of these errors straddle a line break in
       the source and would be missed by a literal search. */
    text: fs.readFileSync(path.join(out, page), 'utf8').replace(/\s+/g, ' '),
  }));
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const find = (pattern: RegExp) =>
  pages.filter(({ text }) => pattern.test(text)).map(({ page }) => page);

describe('the grammatical errors are gone from every page', () => {
  it.each([
    ['"best is services"', /best is services/i, /best in service\b/i],
    ['"cans ad make sure"', /cans ad make sure/i, /cans and make sure/i],
    ['"most populated area’s"', /populated area[’']s/i, /populated areas of our city/i],
    ['"when outsource their"', /when outsource their/i, /when they outsource their/i],
    ['"make a a bold statement"', /make a a bold/i, /make a bold statement/i],
    ['"medial clinics"', /medial clinic/i, /medical clinic/i],
    ['"if you’re ever have an emergency"', /ever have an emergency/i, /ever in an emergency/i],
    ['"There staff are professional"', /There staff are/i, /Their staff are/i],
  ])('%s is corrected', (_label, wrong, right) => {
    expect(find(wrong)).toEqual([]);
    expect(find(right).length).toBeGreaterThan(0);
  });

  it('fixes both copies of the About text, not just one', () => {
    /* The homepage band and /about-us/ are separate files carrying the same
       paragraphs. Three errors lived in both. */
    for (const page of ['index.html', 'about-us/index.html']) {
      const text = pages.find((p) => p.page === page)!.text;
      expect(text).not.toMatch(/make a a bold/i);
      expect(text).not.toMatch(/medial clinic/i);
      expect(text).not.toMatch(/ever have an emergency/i);
      expect(text).toMatch(/medical clinic/i);
    }
  });
});

describe('every duration claim reads from the founding year', () => {
  it.each([
    ['"20-plus years"', /20-plus/i],
    ['"over 20 years"', /over 20 years/i],
    ['"20+ years"', /20\+\s*years/i],
    ['"more than 20 years"', /more than 20 years/i],
    ['"two decades"', /two decades/i],
  ])('%s appears nowhere', (_label, pattern) => {
    expect(find(pattern)).toEqual([]);
  });

  it('the founding year is stated on the pages that make the claim', () => {
    expect(find(/since 1989/i).length).toBeGreaterThanOrEqual(10);
    for (const page of [
      'index.html',
      'about-us/index.html',
      'services/office-cleaning/index.html',
      'services/emergency-cleaning/index.html',
      'lp/commercial-cleaning/index.html',
      'lp/commercial-cleaning-quote/index.html',
    ]) {
      expect(pages.find((p) => p.page === page)!.text).toMatch(/1989/);
    }
  });

  it('no page states a years-in-business figure that would go stale', () => {
    /* The landing page used to compute `${new Date().getFullYear() - 1989}+
       years in business` at build time. Correct on the day it was built and
       wrong every January after. */
    const stale = find(/\b(3[0-9]|4[0-9])\+?\s*years\s+(in business|of experience)/i);
    expect(stale).toEqual([]);
  });

  it('the site contradicts itself nowhere: no page carries both claims', () => {
    const both = pages
      .filter(({ text }) => /1989/.test(text) && /\b2\d\+?\s*(-plus\s*)?years/i.test(text))
      .map(({ page }) => page);
    expect(both).toEqual([]);
  });
});

describe('nothing was invented', () => {
  it('no page anywhere states a numeric rating', () => {
    /* REMOVED, not confined. Both PPC landing pages displayed "4.9/5". It
       came from the PPC brief, nobody verified it against the business's
       Google Business Profile, and the four reviews recovered from the
       archive carry no aggregate. An invented rating is a factual claim and
       a Google policy violation, so it is gone and this is what keeps it
       gone.

       The replacement is the founding year — the one trust point that is
       verified and already stated across the site. Put a real, current
       rating and review count in `src/data/reviews.ts` and a rating line can
       come back; until then this test fails if one reappears. */
    const shapes = [
      /\b\d[.,]\d\s*\/\s*5\b/,          // 4.9 / 5
      /\b\d[.,]\d\s*(out of|of)\s*5\b/i,  // 4.9 out of 5
      /\b\d[.,]\d\s*star/i,               // 4.9 star
      /\brated\s+\d[.,]?\d?\b/i,          // rated 4.9
    ];
    for (const shape of shapes) expect(find(shape), String(shape)).toEqual([]);
  });

  it('star glyphs appear only on an individually quoted review', () => {
    /* Deliberately narrow, and it took a failing test to get it right.
       Stars on a single quoted review are that reviewer's own rating — real,
       attributable, and carrying an aria-label of its own. Stars on a
       standalone line are an AGGREGATE, which is the claim nobody has
       verified. So: every run of stars must sit inside a review item. */
    const stray: string[] = [];
    for (const { page, text } of pages) {
      const withoutReviews = text.replace(
        /<p class="lpq-review-stars"[^>]*>.*?<\/p>/g,
        ''
      );
      if (/[\u2605\u2606]{3,}|(&#9733;){3,}/.test(withoutReviews)) stray.push(page);
    }
    expect(stray).toEqual([]);
  });

  it('the landing pages say the verified thing instead', () => {
    for (const page of [
      'lp/commercial-cleaning/index.html',
      'lp/commercial-cleaning-quote/index.html',
    ]) {
      expect(pages.find((p) => p.page === page)!.text).toMatch(/Serving Toronto since 1989/);
    }
  });

  it('no rating reaches structured data', () => {
    /* An unverified `aggregateRating` in JSON-LD is a manual-action risk,
       not a rich result — and a verified one still has to be maintained,
       which nothing here does yet. */
    for (const { page, text } of pages) {
      for (const [, json] of text.matchAll(
        /<script type="application\/ld\+json">(.*?)<\/script>/g
      )) {
        expect(json, page).not.toContain('aggregateRating');
        expect(json, page).not.toContain('ratingValue');
        expect(json, page).not.toContain('reviewCount');
      }
    }
  });

  it('no page claims a review count', () => {
    expect(find(/\b\d+\+?\s*(google\s*)?reviews\b/i)).toEqual([]);
  });

  it('no page claims a certification the site did not already carry', () => {
    /* WSIB and "bonded" were on the original and stay. Anything else would
       be new, and none of it was added. */
    expect(find(/\bISO\s*\d/i)).toEqual([]);
    expect(find(/\bCIMS\b/)).toEqual([]);
    expect(find(/\bGreen\s*Seal\b/i)).toEqual([]);
  });

  it('no page promises a response time the original did not make', () => {
    /* "2 business hours" is the landing pages' own promise and is kept.
       Anything faster would be invented. */
    expect(find(/\b(15|30|60)[- ]minute (response|callback)/i)).toEqual([]);
    expect(find(/\b24\/7\b/)).toEqual([]);
  });
});

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
  it('the unverified 4.9/5 rating is confined to the two landing pages', () => {
    /* FLAGGED, NOT CHANGED. Both PPC landing pages display "4.9/5". Nobody
       here has checked that against the business's actual Google profile —
       four reviews were recovered from the archive and they carry no
       aggregate. It came from the PPC brief, so removing it is the client's
       call, not a content correction, and Phase 7 was told to identify a
       questionable factual statement rather than silently rewrite it.
       See the Phase 7 report.

       What this test does is stop it spreading. If the rating turns up on a
       third page, or in structured data, this fails. */
    expect(find(/\b\d\.\d\s*\/\s*5\b/).sort()).toEqual([
      'lp/commercial-cleaning-quote/index.html',
      'lp/commercial-cleaning/index.html',
    ]);
  });

  it('the rating is not in any page\'s structured data', () => {
    /* An unverified `aggregateRating` in JSON-LD is a manual-action risk,
       not a rich result. */
    for (const { page, text } of pages) {
      const blocks = [...text.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
      for (const [, json] of blocks) {
        expect(json, page).not.toContain('aggregateRating');
        expect(json, page).not.toContain('ratingValue');
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

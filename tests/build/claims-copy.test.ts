/**
 * @vitest-environment node
 *
 * The claims and copy fixes of the SEO re-audit (7 Nov 2026), read off a real
 * build: action plan items 2, 3, 5, 12, the pillar-to-deep-cleaning link of
 * item 13 and the office-cleaning definition of item 14.
 *
 * Each of these was copy that said slightly more than the business can stand
 * behind (a miscount, a contract claim, stock photos with no "stock") or an
 * instruction an assistant had to parse out of prose. The checks are on the
 * HTML because that is what a reader, a crawler or an assistant gets.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AREAS } from '../../src/data/coverage';
import { nap } from '../../src/data/site';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-claims');

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');
const text = (html: string) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&rsquo;|’/g, "'")
    .replace(/\s+/g, ' ');

describe('the commercial cleaning page counts and links its service area', () => {
  const html = () => read('services/commercial-cleaning/index.html');
  const paragraph = () =>
    html().match(/<p>Evergreen Office Cleaning cleans commercial premises across[\s\S]*?<\/p>/)?.[0] ?? '';

  it('says "nine other" and lists exactly nine municipalities after Toronto', () => {
    /* GEO N1: "Toronto and ten GTA municipalities" was followed by nine. */
    const p = text(paragraph());
    expect(p).toContain('across Toronto and nine other GTA municipalities');
    expect(p).not.toMatch(/\bten GTA\b/);
    const others = AREAS.filter((a) => a.group !== 'Toronto').map((a) => a.name.replace(/ &.*$/, ''));
    expect(others).toHaveLength(9);
    for (const place of others) expect(p).toContain(place);
  });

  it.each([
    ['North York', '/locations/north-york/'],
    ['Scarborough', '/locations/scarborough/'],
    ['Richmond Hill', '/locations/richmond-hill/'],
    ['Pickering, Ajax and Oshawa', '/locations/durham-region/'],
  ])('links %s to %s where it is named', (name, href) => {
    expect(paragraph()).toContain(`<a href="${href}">${name}</a>`);
  });

  it('links the deep-cleaning post where deep cleans are discussed (matrix row 4)', () => {
    expect(html()).toMatch(
      /Deep cleans before a move[^<]*<a href="\/benefits-of-commercial-deep-cleaning-services\/">/
    );
  });
});

describe('the homepage states commitments, not contract history', () => {
  const home = () => text(read('index.html'));

  it('no longer claims the four points are "written into every contract since 1989"', () => {
    expect(home()).not.toMatch(/written into every contract/i);
    expect(home()).toContain('Four commitments we make to every client');
  });

  it('qualifies the 2-hour reply with the office hours, in the intro and the hero', () => {
    expect(home()).toContain(
      'a reply to every enquiry within 2 hours during office hours (Monday to Friday 7am–6pm)'
    );
    expect(read('index.html')).toMatch(/<li[^>]*>A reply within 2 hours, Mon–Fri 7am–6pm<\/li>/);
  });
});

describe('the office cleaning page defines office cleaning once', () => {
  it('keeps the definition under its H2 and not in the summary (GEO N4)', () => {
    const html = read('services/office-cleaning/index.html');
    expect(text(html).match(/Office cleaning is the recurring cleaning of a workplace/g)).toHaveLength(1);
    const summary = html.match(/<p class="offer-summary"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
    expect(summary.length).toBeGreaterThan(40);
    expect(summary).not.toMatch(/Office cleaning is/);
    expect(html).toMatch(/What is office cleaning\?<\/h2>\s*<p>Office cleaning is the recurring cleaning/);
  });
});

describe('the gallery says its photographs are stock', () => {
  const html = () => read('cleaning-demo-gallery/index.html');

  it('in the intro and the meta description, and stays indexable', () => {
    const intro = html().match(/<article class="entry-content"[^>]*>\s*<p>([\s\S]*?)<\/p>/)?.[1] ?? '';
    expect(intro).toMatch(/illustrative stock photographs/i);
    expect(html()).toMatch(/<meta name="description" content="Illustrative stock photographs[^"]*"/);
    expect(html()).not.toMatch(/<meta name="robots"[^>]*noindex/i);
  });
});

describe('the quote page fallback is made of real links', () => {
  const intro = () =>
    read('request-a-quote/index.html').match(/<p class="qq-intro"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';

  it('links the email with mailto: and the phone with tel:, both from nap', () => {
    expect(intro()).toMatch(/Prefer not to use the form\?/);
    expect(intro()).toMatch(
      new RegExp(`<a href="mailto:${nap.email}"[^>]*>${nap.email.replace(/\./g, '\\.')}</a>`)
    );
    expect(intro()).toMatch(
      /<a href="tel:\+14168034880" data-call-location="content"[^>]*>\(416\) 803-4880<\/a>/
    );
    expect(nap.phoneHref).toBe('tel:+14168034880');
  });

  it('wires the CAPTCHA fallback into the form script', () => {
    /* The behaviour is tests/captcha-fallback.test.ts; this is that the
       shipped bundle carries it. */
    const bundles = fs
      .readdirSync(path.join(out, '_astro'))
      .filter((f) => f.endsWith('.js'))
      .map((f) => fs.readFileSync(path.join(out, '_astro', f), 'utf8'));
    expect(bundles.some((js) => js.includes('If the check will not work for you'))).toBe(true);
  });
});

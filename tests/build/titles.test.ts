/**
 * One title rule, sitewide (13 Nov 2026, SEO audit 11 Nov, onpage.md N4).
 *
 * The audit found four suffix forms live at once (" | Evergreen", " - Evergreen",
 * " - Evergreen Office Cleaning", " | Evergreen Office Cleaning") and ten
 * indexable titles with no brand, several of them short enough to carry it.
 * Each form came from a different path to the <title>: pageTitle(), a stored
 * seoTitle with the brand typed in, a hand-set title that skipped pageTitle().
 * This walks the built site so a new path cannot bring a fifth form back.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pageTitle, TITLE_LIMIT, TITLE_SUFFIX } from '../../src/lib/title';
import { isPrivatePage } from './private-pages';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, '.astro-test-dist-titles');

/** The homepage title is written whole, at 61 characters (src/pages/index.astro). */
const HOME_TITLE = 'Commercial Cleaning Company in Toronto Since 1989 | Evergreen';

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

interface Page {
  url: string;
  title: string;
  indexable: boolean;
}
let pages: Page[] = [];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out], {
    cwd: root,
    encoding: 'utf8',
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
  pages = walk(out)
    .filter((file) => !isPrivatePage(file, out))
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8');
      const url = '/' + path.relative(out, file).split(path.sep).join('/').replace(/index\.html$/, '');
      const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
      return { url, title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''), indexable: !/noindex/.test(robots) };
    });
}, 180_000);

afterAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

describe('pageTitle()', () => {
  it('adds " | Evergreen" when the result is 60 characters or fewer', () => {
    expect(pageTitle('Contact Us')).toBe('Contact Us | Evergreen');
    const fits = 'x'.repeat(TITLE_LIMIT - TITLE_SUFFIX.length);
    expect(pageTitle(fits)).toBe(`${fits} | Evergreen`);
    expect(pageTitle(fits).length).toBe(TITLE_LIMIT);
  });

  it('leaves a longer title whole: no other suffix, no truncation', () => {
    const long = 'x'.repeat(TITLE_LIMIT - TITLE_SUFFIX.length + 1);
    expect(pageTitle(long)).toBe(long);
  });
});

describe('every built page title', () => {
  it('finds the site', () => {
    expect(pages.filter((p) => p.indexable).length).toBeGreaterThan(55);
  });

  it('is 60 characters or fewer and branded wherever the brand fits, on every indexable page', () => {
    const problems: string[] = [];
    for (const { url, title, indexable } of pages) {
      if (!indexable) continue;
      if (url === '/') {
        if (title !== HOME_TITLE) problems.push(`/ changed: ${title}`);
        continue;
      }
      if (!title) problems.push(`${url} has no title`);
      if (title.length > TITLE_LIMIT) problems.push(`${url} is ${title.length}: ${title}`);
      if (!title.endsWith(TITLE_SUFFIX) && `${title}${TITLE_SUFFIX}`.length <= TITLE_LIMIT) {
        problems.push(`${url} has room for the brand and lacks it: ${title}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('uses no other suffix form and never doubles the brand, on any page', () => {
    /* The two data-driven landing pages (noindex, paid traffic) take their
       titles from src/data/landing-pages.ts, which still types in "| Evergreen
       Office Cleaning". Left for that file's owner; remove these entries when
       lp/[slug].astro passes its titles through pageTitle(). */
    const pending = new Set(['/lp/office-cleaning/', '/lp/post-construction-cleaning/']);
    const problems = pages
      .filter(({ url }) => !pending.has(url))
      .filter(({ title }) =>
        / [-–—] Evergreen/.test(title) ||
        /\| Evergreen Office Cleaning/.test(title) ||
        title.split(TITLE_SUFFIX).length > 2
      )
      .map(({ url, title }) => `${url}: ${title}`);
    expect(problems).toEqual([]);
  });

  it('brands the location pages where the rule fits, never shortening a place name', () => {
    const locations = pages.filter((p) => /^\/locations\/[^/]+\/$/.test(p.url));
    expect(locations.length).toBe(11);
    for (const { url, title } of locations) expect(title, url).toMatch(/^Office & Commercial Cleaning in /);
    const unbranded = locations.filter((p) => !p.title.endsWith(TITLE_SUFFIX)).map((p) => p.url).sort();
    expect(unbranded).toEqual(['/locations/durham-region/', '/locations/vaughan/']);
  });
});

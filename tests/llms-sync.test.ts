/**
 * @vitest-environment node
 *
 * public/llms.txt keeps up with the site (SEO re-audit, 7 Nov 2026, GEO N3).
 *
 * llms.txt is written by hand, and by the re-audit it had fallen behind: it
 * listed seven of the eleven location pages and none of the newest guide.
 * Nothing failed, because nothing read it. This file reads it against the two
 * sources it summarises:
 *
 *   src/data/locations.ts   every location page must be linked under
 *                           "## Service areas", and nothing else may be;
 *   src/content/blog/       every guide (front matter `guide:`) published in
 *                           2026 must be linked under "## Guides";
 *   src/content/services/   every service page under "## Services", and
 *   src/content/industries/ every industry page under "## Who we clean
 *                           for" (added 13 Nov 2026, SEO audit 11 Nov, N7).
 *
 * And the facts it repeats must match the ones the pages use: the coverage
 * sentence from src/data/coverage.ts, and the 2-hour reply always qualified
 * with the office hours from src/data/site.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { locations } from '../src/data/locations';
import { COVERAGE_SENTENCE } from '../src/data/coverage';
import { hours, site } from '../src/data/site';
import { offerPath } from '../src/data/offer-pages';

const repo = path.resolve(import.meta.dirname, '..');
const llms = fs.readFileSync(path.join(repo, 'public', 'llms.txt'), 'utf8');

/** The lines under one `## ` heading, up to the next. */
function section(title: string): string {
  const start = llms.indexOf(`\n## ${title}\n`);
  expect(start, `llms.txt has no "## ${title}" section`).toBeGreaterThan(-1);
  const rest = llms.slice(start + title.length + 5);
  const end = rest.indexOf('\n## ');
  return end === -1 ? rest : rest.slice(0, end);
}

const linksIn = (text: string) =>
  [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);

/** Blog posts that use the guide layout, with their publication year. */
function guides(): { slug: string; year: number }[] {
  const dir = path.join(repo, 'src', 'content', 'blog');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .flatMap((f) => {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      if (!/^guide:/m.test(front)) return [];
      const year = Number(front.match(/^pubDate:\s*["']?(\d{4})-/m)?.[1]);
      return [{ slug: f.replace(/\.md$/, ''), year }];
    });
}

describe('llms.txt lists every location page', () => {
  const areas = section('Service areas');

  it.each(locations.map((l) => [l.slug, l.name]))('links /locations/%s/ (%s)', (slug) => {
    expect(linksIn(areas)).toContain(`${site.url}/locations/${slug}/`);
  });

  it('links no location page that does not exist, and the hub', () => {
    const pages = linksIn(areas).filter((u) => /\/locations\/[^/]+\/$/.test(u));
    expect(pages.sort()).toEqual(locations.map((l) => `${site.url}/locations/${l.slug}/`).sort());
    expect(linksIn(areas)).toContain(`${site.url}/locations/`);
  });

  it('names the same places as the rest of the site, and the page count', () => {
    const line = llms.split('\n').find((l) => l.startsWith('- Areas served:')) ?? '';
    expect(line).toContain(COVERAGE_SENTENCE);
    expect(line).toContain(`The ${locations.length} location pages`);
    expect(locations).toHaveLength(11);
  });
});

describe('llms.txt lists every 2026 guide', () => {
  const list = guides().filter((g) => g.year === 2026);

  it('finds the guides it is checking', () => {
    /* The cost guide, the how-often guide and the checklist. A count that
       falls means the front-matter marker moved, not that guides vanished. */
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.map((g) => g.slug)).toContain('office-cleaning-checklist');
  });

  it.each(list.map((g) => [g.slug]))('links /%s/ under "## Guides"', (slug) => {
    expect(linksIn(section('Guides'))).toContain(`${site.url}/${slug}/`);
  });
});

/* 13 Nov 2026, SEO audit 11 Nov (geo N7): the services and industries were
   checked by nobody. /janitorial-services/ is in llms.txt only
   because someone added it by hand; the next new page could be missed the
   way seven location pages were (GEO N3). Each content file is a page, so
   each one must be linked under its section, and nothing there may point at
   a page that does not exist. */
function slugsIn(collection: string): string[] {
  return fs
    .readdirSync(path.join(repo, 'src', 'content', collection))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

describe.each([
  ['services', 'Services'],
  ['industries', 'Who we clean for'],
])('llms.txt lists every page in src/content/%s/', (collection, title) => {
  const slugs = slugsIn(collection);
  /* At the root since 13 Nov 2026 (URL move, owner decision), so a page link
     is any one-segment address in the section other than the hub. */
  const pageLinks = () =>
    linksIn(section(title)).filter((u) => {
      const p = new URL(u).pathname;
      return /^\/[^/]+\/$/.test(p) && p !== `/${collection}/`;
    });

  it('finds the pages it is checking', () => {
    // 11 services and 2 industries on 13 Nov 2026; a count of 0 means the folder moved.
    expect(slugs.length).toBeGreaterThan(collection === 'services' ? 10 : 1);
  });

  it.each(slugs.map((s) => [s]))(`links /%s/ under "## ${title}"`, (slug) => {
    expect(linksIn(section(title))).toContain(`${site.url}${offerPath(slug)}`);
  });

  it(`links no ${collection} page that does not exist`, () => {
    expect(pageLinks().sort()).toEqual(slugs.map((s) => `${site.url}${offerPath(s)}`));
  });
});

describe('llms.txt states the reply promise with its hours', () => {
  it('qualifies every "within 2 hours" with the office hours', () => {
    /* GEO N2: the promise holds during office hours only, as the how-often
       guide says. An unqualified copy is the one an assistant would quote. */
    const promises = [...llms.matchAll(/within 2 hours([^.\n]*)/g)];
    expect(promises.length).toBeGreaterThanOrEqual(2);
    for (const [, rest] of promises) {
      expect(rest).toMatch(/^ during office hours \(Monday to Friday 7am–6pm\)/);
    }
  });

  it('uses the hours the structured data publishes', () => {
    expect(hours).toHaveLength(1);
    expect(hours[0].days).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    expect([hours[0].opens, hours[0].closes]).toEqual(['07:00', '18:00']);
  });
});

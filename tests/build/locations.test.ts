/**
 * @vitest-environment node
 *
 * The location pages after the SEO re-audit of 7 Nov 2026 (Phase A items 4,
 * 8 and 14): honest review framing, no unconfirmed Durham operations,
 * metadata within length, Durham's schema typed by the cities the page
 * targets, East York and York as plain text, and a hub that says "ask us"
 * for places without a page.
 *
 * Built once, into its own directory, and read as emitted HTML: the review
 * block, the titles and the JSON-LD are all assembled by the page template
 * from several data files, so the output is the only place to check them.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { locations } from '../../src/data/locations';
import { LOCATION_LOCAL } from '../../src/data/location-local';
import { AREAS } from '../../src/data/coverage';
import { reviews } from '../../src/data/reviews';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, '.astro-test-dist-locations');
const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');
const page = (slug: string) => read(`locations/${slug}/index.html`);

/** Entities decoded, so lengths are what a search result shows. */
const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const titleOf = (html: string) => decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
const descriptionOf = (html: string) => decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
const mainText = (html: string) =>
  decode(
    (html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '')
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ');
const jsonLd = (html: string): any[] =>
  [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const data = JSON.parse(m[1]);
    return data['@graph'] ?? [data];
  });

const NEW_PAGES = ['north-york', 'scarborough', 'richmond-hill', 'durham-region'];

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out], {
    cwd: root,
    encoding: 'utf8',
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
}, 180_000);

afterAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

describe('location page metadata (SEO re-audit onpage N1, N2)', () => {
  it('keeps every /locations/ title to 60 characters and every description to 160', () => {
    const files = ['locations/index.html', ...locations.map((l) => `locations/${l.slug}/index.html`)];
    const over = files.flatMap((file) => {
      const html = read(file);
      const title = titleOf(html);
      const description = descriptionOf(html);
      expect(title, file).not.toBe('');
      expect(description, file).not.toBe('');
      return [
        ...(title.length > 60 ? [`${file} title ${title.length}: ${title}`] : []),
        ...(description.length > 160 ? [`${file} description ${description.length}: ${description}`] : []),
      ];
    });
    expect(over).toEqual([]);
  });

  it('brings the five descriptions the re-audit flagged to 155 or fewer', () => {
    for (const file of ['locations/index.html', ...['scarborough', 'richmond-hill', 'north-york', 'durham-region'].map((s) => `locations/${s}/index.html`)]) {
      expect(descriptionOf(read(file)).length, file).toBeLessThanOrEqual(155);
    }
  });

  it('gives Durham and Vaughan titles that fit, still leading with office cleaning', () => {
    expect(titleOf(page('durham-region'))).toBe('Office & Commercial Cleaning in Pickering, Ajax & Oshawa');
    expect(titleOf(page('vaughan'))).toBe('Office & Commercial Cleaning in Vaughan & Concord');
  });
});

describe('reviews on location pages (SEO re-audit C3, content 5c)', () => {
  it('never shows the same review on two location pages', () => {
    const shownOn = new Map<string, string[]>();
    for (const { slug } of locations) {
      const html = page(slug);
      for (const r of reviews) {
        if (new RegExp(`<strong[^>]*>${r.name}</strong>, Google review`).test(html)) shownOn.set(r.name, [...(shownOn.get(r.name) ?? []), slug]);
      }
    }
    const repeated = [...shownOn].filter(([, slugs]) => slugs.length > 1);
    expect(repeated).toEqual([]);
    /* Seven reviews, seven of the eleven pages: the check above saw them. */
    expect(shownOn.size).toBe(7);
  });

  it('names each review in the location data once at most, and only real ones', () => {
    const named = Object.values(LOCATION_LOCAL).flatMap((l) => (l.review ? [l.review] : []));
    expect(new Set(named).size).toBe(named.length);
    for (const name of named) expect(reviews.map((r) => r.name)).toContain(name);
  });

  it('frames the reviews as Google reviews, not as a local client, and links the full list', () => {
    for (const { slug } of locations) {
      const html = page(slug);
      expect(html, slug).not.toContain('What a client says');
      expect(html, slug).toMatch(/<a href="\/reviews\/"[^>]*>read our Google reviews/);
    }
    for (const slug of NEW_PAGES) {
      expect(page(slug), slug).not.toContain('From our Google reviews');
    }
    expect(page('mississauga')).toContain('From our Google reviews');
  });
});

describe('Durham and the new pages state no unconfirmed operations (SEO re-audit C3)', () => {
  it('drops "fixed evenings" and "one trip covers the evening" from the four new pages', () => {
    for (const slug of NEW_PAGES) {
      const text = mainText(page(slug));
      expect(text, slug).not.toMatch(/fixed evenings/i);
      expect(text, slug).not.toMatch(/one (evening )?trip covers/i);
      expect(text, slug).not.toMatch(/contracts run on/i);
    }
    expect(descriptionOf(page('durham-region'))).not.toMatch(/fixed evenings/i);
  });

  it('still says Pickering, Ajax and Oshawa are in the service area, and that scheduling is agreed at the walkthrough', () => {
    const text = mainText(page('durham-region'));
    expect(text).toContain('Are Pickering, Ajax and Oshawa in your service area? Yes, all three are.');
    expect(text).toMatch(/agreed at the walkthrough/);
    expect(text).not.toMatch(/including Whitby/);
  });

  it('keeps the client-review flags on the four new pages', () => {
    for (const slug of NEW_PAGES) expect(locations.find((l) => l.slug === slug)?.needsClientReview, slug).toBe(true);
  });
});

describe('Durham schema (SEO re-audit schema N2)', () => {
  it('serves Pickering, Ajax and Oshawa as cities inside Durham Region, not a city called Durham Region', () => {
    const service = jsonLd(page('durham-region')).find((n) => n['@type'] === 'Service');
    expect(service.areaServed).toEqual(
      ['Pickering', 'Ajax', 'Oshawa'].map((name) => ({
        '@type': 'City',
        name,
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Durham Region' },
      }))
    );
    expect(service.name).toBe('Commercial Cleaning in Pickering, Ajax and Oshawa');
  });

  it('leaves the other pages with their one City', () => {
    const service = jsonLd(page('mississauga')).find((n) => n['@type'] === 'Service');
    expect(service.areaServed).toEqual({ '@type': 'City', name: 'Mississauga' });
  });
});

describe('East York and York (SEO re-audit content N4)', () => {
  const htmlFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? htmlFiles(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : []
    );

  it('are not link text anywhere on the site', () => {
    const linked = htmlFiles(out).filter((file) => /<a\b[^>]*>\s*(East )?York\s*<\/a>/.test(fs.readFileSync(file, 'utf8')));
    expect(linked.map((f) => path.relative(out, f))).toEqual([]);
  });

  it('have no href in the coverage list, and are still named on the downtown page and the homepage', () => {
    for (const name of ['East York', 'York']) expect(AREAS.find((a) => a.name === name)?.href, name).toBeUndefined();
    const downtown = mainText(page('toronto-downtown'));
    expect(downtown).toContain('Do you cover East York and York, or only the core?');
    expect(mainText(read('index.html'))).toMatch(/East York/);
  });

  it('do not turn the Durham towns into three cards to one page', () => {
    const section = page('mississauga').match(/<section[^>]*aria-label="Other service areas"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect(section).not.toBe('');
    expect(section.match(/href="\/locations\/durham-region\/"/g)).toHaveLength(1);
    expect(decode(section)).toContain('Pickering, Ajax & Oshawa');
    expect(section).not.toContain('href="/locations/mississauga/"');
  });
});

describe('the /locations/ hub (SEO re-audit local N4)', () => {
  const hub = () => read('locations/index.html');

  it('no longer promises identical coverage for places without a page', () => {
    const text = mainText(hub());
    expect(text).not.toMatch(/exactly the same way/);
    expect(text).toMatch(/Ask us/);
  });

  it('groups the cards by region, and still links every location page', () => {
    const html = hub();
    const groups = [...html.matchAll(/<h2 class="loc-group-title"[^>]*>([^<]*)<\/h2>/g)].map((m) => decode(m[1]));
    expect(groups).toEqual(['Toronto', 'Peel & Halton', 'York Region', 'Durham']);
    for (const { slug } of locations) expect(html, slug).toContain(`href="/locations/${slug}/"`);
  });
});

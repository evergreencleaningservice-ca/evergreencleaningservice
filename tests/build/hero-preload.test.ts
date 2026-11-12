/**
 * @vitest-environment node
 *
 * The service and industry pages' photo hero, and the other LCP and
 * first-screen fixes from the SEO audit of 11 Nov 2026 (12 Nov 2026).
 *
 * - The hero photo is preloaded from <head> (performance P1, images N11), with
 *   exactly the AVIF URLs and sizes its <picture> uses: a preload that names
 *   a different file is a wasted download, not a head start. Pages without a
 *   photo hero emit no image preload at all.
 * - The hero <img> is not `decoding="async"`: it is the LCP element.
 * - A hero with no 1200w file (graffiti removal, from a 645px source) is not
 *   stretched full-bleed on a desktop (images N7).
 * - The location pages' first photo is `fetchpriority="high"` (P2).
 * - The video bubble's gate is on the hero and the trust list (visual V2).
 * - The quote page's email and phone fallbacks carry the touch-target class
 *   (visual V3).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Window } from 'happy-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-hero-preload');

let pages: string[] = [];
const docs = new Map<string, Document>();
const doc = (rel: string) => {
  let d = docs.get(rel);
  if (!d) {
    const w = new Window();
    w.document.write(fs.readFileSync(path.join(out, rel), 'utf8'));
    d = w.document as unknown as Document;
    docs.set(rel, d);
  }
  return d;
};
const imagePreloads = (d: Document) => [...d.querySelectorAll('head link[rel="preload"][as="image"]')];

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
  pages = walk(out);
}, 240_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const OFFICE = 'services/office-cleaning/index.html';
const JANITORIAL = 'services/janitorial-services/index.html';
const GRAFFITI = 'services/graffiti-removal/index.html';

describe('hero preload on offer pages', () => {
  it.each([OFFICE, JANITORIAL, GRAFFITI, 'industries/medical-dental-clinics/index.html'])(
    '%s preloads exactly the hero picture’s AVIF set',
    (rel) => {
      const d = doc(rel);
      const source = d.querySelector('section.offer-hero.has-image picture source[type="image/avif"]');
      expect(source).not.toBeNull();
      const links = imagePreloads(d);
      expect(links).toHaveLength(1);
      const link = links[0];
      expect(link.getAttribute('type')).toBe('image/avif');
      expect(link.getAttribute('fetchpriority')).toBe('high');
      expect(link.getAttribute('imagesrcset')).toBe(source!.getAttribute('srcset'));
      expect(link.getAttribute('imagesizes')).toBe(source!.getAttribute('sizes'));
      // Only widths that exist on disk are listed.
      for (const entry of link.getAttribute('imagesrcset')!.split(',')) {
        const url = entry.trim().split(/\s+/)[0];
        expect(fs.existsSync(path.join(repo, 'public', url)), url).toBe(true);
      }
    },
  );

  it('the hero <img> is eager and high priority, without async decoding', () => {
    const img = doc(OFFICE).querySelector('section.offer-hero picture img')!;
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.hasAttribute('decoding')).toBe(false);
  });

  it('pages without a photo hero emit no image preload', () => {
    const withPreload = pages.filter((rel) => imagePreloads(doc(rel)).length > 0);
    expect(withPreload.length).toBeGreaterThan(10);
    for (const rel of withPreload) {
      expect(doc(rel).querySelector('section.offer-hero.has-image'), rel).not.toBeNull();
    }
    for (const rel of ['index.html', 'request-a-quote/index.html', 'locations/mississauga/index.html']) {
      expect(imagePreloads(doc(rel)), rel).toHaveLength(0);
    }
  });
});

describe('a hero with no 1200w file (images N7)', () => {
  it('graffiti removal lists only real widths and is not sized full-bleed on a desktop', () => {
    const d = doc(GRAFFITI);
    const hero = d.querySelector('section.offer-hero')!;
    expect(hero.classList.contains('is-compact')).toBe(true);
    const srcset = d.querySelector('section.offer-hero source[type="image/avif"]')!.getAttribute('srcset')!;
    expect(srcset).not.toContain('1200w');
    expect(d.querySelector('section.offer-hero img')!.getAttribute('sizes')).not.toBe('100vw');
  });

  it('a hero with a 1200w file stays full-bleed', () => {
    const d = doc(OFFICE);
    expect(d.querySelector('section.offer-hero')!.classList.contains('is-compact')).toBe(false);
    expect(d.querySelector('section.offer-hero img')!.getAttribute('sizes')).toBe('100vw');
  });
});

describe('location pages (performance P2)', () => {
  it('the first page photo, and only it, is fetchpriority="high"', () => {
    const locations = pages.filter((p) => /^locations\/[^/]+\/index\.html$/.test(p));
    const withPhoto = locations.filter((rel) => doc(rel).querySelector('.loc-main figure.page-photo'));
    expect(withPhoto.length).toBeGreaterThan(0);
    for (const rel of withPhoto) {
      const d = doc(rel);
      const first = d.querySelector('.loc-main figure.page-photo img')!;
      expect(first.getAttribute('fetchpriority'), rel).toBe('high');
      expect(first.getAttribute('loading'), rel).toBe('eager');
      expect(d.querySelectorAll('img[fetchpriority="high"]'), rel).toHaveLength(1);
    }
  });
});

describe('video bubble gate (visual V2)', () => {
  it('the offer hero and its trust list are both gated', () => {
    const d = doc(JANITORIAL);
    expect(d.querySelector('section.offer-hero[data-leadnet-gate]')).not.toBeNull();
    expect(d.querySelector('.offer-trust[data-leadnet-gate]')).not.toBeNull();
  });
});

describe('quote page fallbacks (visual V3)', () => {
  it('the email and phone links carry the touch-target class', () => {
    const d = doc('request-a-quote/index.html');
    const links = [...d.querySelectorAll('a.rq-fallback')].map((a) => a.getAttribute('href'));
    expect(links).toHaveLength(2);
    expect(links[0]).toMatch(/^mailto:/);
    expect(links[1]).toMatch(/^tel:/);
  });
});

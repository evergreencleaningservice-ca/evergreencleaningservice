/**
 * @vitest-environment node
 *
 * Phase 8 — the hero is a real image element, and it is the only one the
 * first paint pays for.
 *
 * The site's LCP was a CSS `background-image` on a div. That element cannot
 * carry `fetchpriority`, cannot have a `srcset`, and is invisible to the
 * browser's preload scanner — it is not discovered until the stylesheet has
 * been fetched and parsed. Lighthouse measured 6.1s and named the cause.
 *
 * These tests assert the shape of the fix rather than the score, because a
 * score is a measurement and this is a contract: whatever the network does on
 * the day, the single hero image must be eager and prioritised, and every
 * modern-format file must be smaller than the JPEG it replaces.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-images');
const publicImages = path.join(repo, 'public', 'images');

let home = '';
let pages: string[] = [];
const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');

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
  home = read('index.html');
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const BASE = 'evergreen-commercial-cleaning-hero';
const WIDTHS = [480, 768, 1000, 1600];
const SOURCE_WIDTH = 1916;

/** The homepage hero <picture> blocks. There must be exactly one. */
const heroes = () => [...home.matchAll(/<picture class="hero-slide[^"]*"[\s\S]*?<\/picture>/g)].map((m) => m[0]);
const hero = () => heroes()[0];

describe('the hero is one image element, not a background or a carousel', () => {
  it('renders exactly one <picture>', () => {
    expect(heroes()).toHaveLength(1);
  });

  it('is not a CSS background-image', () => {
    expect(home).not.toMatch(/hero-slide[^>]*style="background-image/);
    expect(home).not.toMatch(/background-image:\s*url\(['"]?\/images\/evergreen-commercial-cleaning-hero/);
  });
});

describe('the hero is the LCP and is treated as one', () => {
  it('is eager, high priority, and carries its own source', () => {
    expect(hero()).toContain('loading="eager"');
    expect(hero()).toContain('fetchpriority="high"');
    expect(hero()).toMatch(new RegExp(String.raw`<img\b[^>]*(?<![\w-])src="[^"]+${BASE}-1000\.jpg"`));
  });

  it('is not lazy — a lazy LCP is a slower LCP', () => {
    expect(hero()).not.toContain('loading="lazy"');
  });

  it('declares the 1916x821 intrinsic size, so nothing reflows', () => {
    expect(hero()).toMatch(/width="1916"/);
    expect(hero()).toMatch(/height="821"/);
  });

  it('offers AVIF then WebP then JPEG, each with a 480/768/1000/1600 srcset', () => {
    const avif = hero().indexOf('<source type="image/avif"');
    const webp = hero().indexOf('<source type="image/webp"');
    const img = hero().indexOf('<img');
    expect(avif).toBeGreaterThan(-1);
    expect(webp).toBeGreaterThan(avif);
    expect(img).toBeGreaterThan(webp);
    for (const format of ['avif', 'webp', 'jpg'])
      for (const width of WIDTHS) expect(hero()).toContain(`${BASE}-${width}.${format} ${width}w`);
    expect(hero()).toContain('sizes="100vw"');
  });

  it('ships every candidate in the markup — nothing is deferred to script', () => {
    expect(hero()).not.toMatch(/data-src|data-srcset/);
    expect(hero()).toMatch(/<source type="image\/avif" srcset="/);
    expect(hero()).toMatch(/<source type="image\/webp" srcset="/);
  });

  it('is the only fetchable hero image in the markup', () => {
    const fetchable = [...home.matchAll(/<img\b[^>]*(?<![\w-])src="[^"]*evergreen-commercial-cleaning-hero/g)];
    expect(fetchable).toHaveLength(1);
    expect(home).not.toMatch(/business-team-\d+\.(avif|webp|jpg)/);
  });
});

describe('the generated variants are genuinely smaller', () => {
  it('every width exists in all three formats', () => {
    for (const width of WIDTHS)
      for (const ext of ['avif', 'webp', 'jpg'])
        expect(fs.existsSync(path.join(publicImages, `${BASE}-${width}.${ext}`)), `${BASE}-${width}.${ext}`).toBe(true);
  });

  it('no AVIF or WebP is larger than the JPEG at the same width', () => {
    /* A modern format that weighs more is a regression wearing a new
       extension. `scripts/hero-variants.mjs` refuses to emit one; this is
       the check that survives someone changing the quality settings. */
    const heavier: string[] = [];
    for (const width of WIDTHS) {
      const jpeg = fs.statSync(path.join(publicImages, `${BASE}-${width}.jpg`)).size;
      for (const ext of ['avif', 'webp']) {
        const bytes = fs.statSync(path.join(publicImages, `${BASE}-${width}.${ext}`)).size;
        if (bytes >= jpeg) heavier.push(`${BASE}-${width}.${ext} ${bytes} >= jpeg ${jpeg}`);
      }
    }
    expect(heavier).toEqual([]);
  });

  it('the 1600px ceiling is used, and nothing was upscaled past the 1916px source', () => {
    const widths = fs
      .readdirSync(publicImages)
      .filter((f) => f.startsWith(`${BASE}-`) && /-(\d+)\.(avif|webp|jpg)$/.test(f))
      .map((f) => Number(f.match(/-(\d+)\./)![1]));
    expect(Math.max(...widths)).toBe(1600);
    expect(widths.filter((w) => w > SOURCE_WIDTH)).toEqual([]);
  });
});

describe('alt attributes', () => {
  it('every image on the site has one', () => {
    const missing: string[] = [];
    for (const page of pages)
      for (const tag of read(page).matchAll(/<img\b[^>]*>/g))
        if (!/\salt[=\s>]/.test(tag[0])) missing.push(`${page}: ${tag[0].slice(0, 90)}`);
    expect(missing).toEqual([]);
  });

  it('the hero is decorative, because the heading says the same thing', () => {
    expect(hero()).toMatch(/<img\b[^>]*\salt(=""|\s|>)/);
  });

  it('no alt text is a filename in disguise', () => {
    const derived: string[] = [];
    for (const page of pages)
      for (const m of read(page).matchAll(/\balt="([^"]+)"/g))
        if (/^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(m[1].trim())) derived.push(`${page}: ${m[1]}`);
    expect(derived).toEqual([]);
  });

  it('no alt text is stuffed', () => {
    const stuffed: string[] = [];
    for (const page of pages)
      for (const m of read(page).matchAll(/\balt="([^"]+)"/g)) {
        const words = m[1].toLowerCase().split(/\s+/);
        if (words.length > 16) stuffed.push(`${page}: too long — ${m[1]}`);
        for (const w of new Set(words))
          if (w.length > 3 && words.filter((x) => x === w).length >= 3)
            stuffed.push(`${page}: "${w}" x3 — ${m[1]}`);
      }
    expect(stuffed).toEqual([]);
  });
});

describe('the console 404 is gone', () => {
  it('a favicon exists at the path every browser asks for unprompted', () => {
    expect(fs.existsSync(path.join(out, 'favicon.ico'))).toBe(true);
    expect(fs.existsSync(path.join(out, 'apple-touch-icon.png'))).toBe(true);
  });

  it('and every page declares it', () => {
    for (const page of pages.filter((p) => !/http-equiv="refresh"/.test(read(p)))) {
      expect(read(page), page).toMatch(/<link rel="icon"/);
    }
  });
});

describe('the image origin is preconnected', () => {
  it('without crossorigin, which would open a connection nothing can reuse', () => {
    /* Measured: with `crossorigin` the median Performance score fell from 95
       to 75 and FCP went 1607ms -> 3590ms, consistently across three runs.
       The images are fetched by plain <img> elements, which do not use a
       CORS connection, so the preconnected one sat unused while the real one
       still had to be opened. */
    expect(home).toMatch(/<link rel="preconnect" href="https:\/\/img-evergreencleaningservice\.10xconnections\.com"\s*\/?>/);
    expect(home).not.toMatch(/img-evergreencleaningservice[^>]*crossorigin/);
  });

  it('the hero is not also preloaded', () => {
    /* Measured too, because the brief asked for it to be preloaded only if
       it helped: it did not. Median Performance 74 with the preload against
       99 without, FCP 3551ms against 1625ms. The <img> is high in the
       document and already found by the preload scanner; the extra early
       request only competed with the render-blocking CSS. */
    expect(home).not.toMatch(/rel="preload"[^>]*as="image"/);
  });
});

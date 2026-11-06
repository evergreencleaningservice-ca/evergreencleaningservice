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

/* The first of the rotating office slides (31 Oct 2026): the page's LCP. */
const BASE = 'gallery-corporate-office-cleaning-hero';
const WIDTHS = [480, 768, 1000, 1200];
const SOURCE_WIDTH = 1200;

/** The homepage hero <picture> blocks: the first in the page, the rest in a <template>. */
const heroes = () => [...home.matchAll(/<picture class="hero-slide[^"]*"[\s\S]*?<\/picture>/g)].map((m) => m[0]);
const hero = () => heroes()[0];
const template = () => home.match(/<template data-hero-more[^>]*>([\s\S]*?)<\/template>/)?.[1] ?? '';

describe('the hero rotates without slowing the first paint', () => {
  it('renders one <picture> in the page, and the other slides only in a <template>', () => {
    const outside = home.replace(/<template data-hero-more[\s\S]*?<\/template>/, '');
    expect([...outside.matchAll(/<picture class="hero-slide/g)]).toHaveLength(1);
    expect([...template().matchAll(/<picture class="hero-slide/g)]).toHaveLength(2);
  });

  it('the first slide is the active one, so it shows without script', () => {
    expect(hero()).toMatch(/^<picture class="hero-slide is-active"/);
  });

  it('the later slides are not high priority and carry no description', () => {
    expect(template()).not.toContain('fetchpriority');
    /* Astro renders alt="" as a bare `alt`: both are an empty description. */
    for (const tag of template().matchAll(/<img\b[^>]*>/g)) expect(tag[0]).toMatch(/\salt(="")?[\s>]/);
  });

  it('is not a CSS background-image', () => {
    expect(home).not.toMatch(/hero-slide[^>]*style="background-image/);
    expect(home).not.toMatch(new RegExp(String.raw`background-image:\s*url\(['"]?/images/${BASE}`));
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

  it('declares the 1200x500 intrinsic size, so nothing reflows', () => {
    expect(hero()).toMatch(/width="1200"/);
    expect(hero()).toMatch(/height="500"/);
  });

  it('offers AVIF then WebP then JPEG, each with a 480/768/1000/1200 srcset', () => {
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
    const outside = home.replace(/<template data-hero-more[\s\S]*?<\/template>/, '');
    const fetchable = [...outside.matchAll(/<img\b[^>]*(?<![\w-])src="[^"]*-hero-\d+\.jpg"/g)];
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

  it('the 1200px ceiling is used, and nothing was upscaled past the 1200px source', () => {
    const widths = fs
      .readdirSync(publicImages)
      .filter((f) => f.startsWith(`${BASE}-`) && /-(\d+)\.(avif|webp|jpg)$/.test(f))
      .map((f) => Number(f.match(/-(\d+)\./)![1]));
    expect(Math.max(...widths)).toBe(1200);
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

  /* Decorative (alt="") until 2026-10-29. The SEO audit (H11) counted it
     among 19 meaningful images with no description: it is the homepage's
     main image, and the heading beside it does not say what is in it. */
  it('the hero is described', () => {
    expect(hero()).toMatch(/<img\b[^>]*\salt="[^"]{20,}"/);
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

/* SEO audit of 6 Nov 2026, images finding 1: the gallery drew thirteen full
   1200px JPEGs (1.1 MB) with no dimensions and no caption. */
describe('the gallery serves its photographs like the rest of the site', () => {
  const page = () => read('cleaning-demo-gallery/index.html');
  const figures = () => [...page().matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((m) => m[0]);

  it('offers each of the thirteen as AVIF, WebP then JPEG at 480 and 768, sized, lazy and captioned', () => {
    expect(figures()).toHaveLength(13);
    for (const figure of figures()) {
      const avif = figure.indexOf('<source type="image/avif"');
      const webp = figure.indexOf('<source type="image/webp"');
      const img = figure.indexOf('<img');
      expect(avif).toBeGreaterThan(-1);
      expect(webp).toBeGreaterThan(avif);
      expect(img).toBeGreaterThan(webp);
      for (const ext of ['avif', 'webp', 'jpg'])
        expect(figure).toMatch(new RegExp(String.raw`srcset="[^"]*gallery-[a-z-]+-480\.${ext} 480w, [^"]*gallery-[a-z-]+-768\.${ext} 768w"`));
      expect(figure).toMatch(/<img\b[^>]*\swidth="768"[^>]*\sheight="512"/);
      expect(figure).toMatch(/<img\b[^>]*\sloading="lazy"/);
      expect(figure).toMatch(/<figcaption[^>]*>[^<]{12,}<\/figcaption>/);
      /* Not the 1200px master: the srcset, the fallback and nothing else. */
      expect(figure).not.toMatch(/gallery-[a-z-]+\.jpg/);
    }
  });

  it('captions name the service illustrated, not a job or a place', () => {
    for (const m of page().matchAll(/<figcaption[^>]*>([^<]*)<\/figcaption>/g)) {
      expect(m[1]).toMatch(/^[A-Z][a-z ]+( cleaning| service| care| maintenance): /);
      expect(m[1]).not.toMatch(/Toronto|Evergreen|our (crew|team)|client/i);
    }
  });

  it('keeps one H1 and introduces the photos with links to the services and the quote page', () => {
    expect([...page().matchAll(/<h1\b/g)]).toHaveLength(1);
    const intro = page().match(/<article class="entry-content"[^>]*>\s*<p>([\s\S]*?)<\/p>/)?.[1] ?? '';
    expect(intro).toMatch(/illustrate/);
    expect(intro).toContain('href="/services/"');
    expect(intro).toContain('href="/request-a-quote/"');
  });
});

/* Images finding 4: thirty-two `-300x150.jpg` WordPress crops on the
   post lists and related cards, JPEG only, stretched to 380px on a phone. */
describe('the list thumbnails are the featured images’ own variants', () => {
  it('no page references a WordPress 300x150 crop any more', () => {
    const crops = pages.filter((p) => /-300x150\./.test(read(p)));
    expect(crops).toEqual([]);
  });

  const thumbs = (html: string) =>
    [...html.matchAll(/<div class="list-article-thumb"[\s\S]*?<\/picture>/g)].map((m) => m[0]);

  it('every post-list thumbnail offers a 480 and a 720 or 768 in all three formats, with sizes', () => {
    const list = thumbs(read('insights/index.html'));
    expect(list.length).toBeGreaterThanOrEqual(10);
    for (const thumb of [...list, ...thumbs(home)]) {
      for (const ext of ['avif', 'webp', 'jpg'])
        expect(thumb).toMatch(new RegExp(String.raw`srcset="[^"]*-480\.${ext} 480w, [^"]*-7(20|68)\.${ext} 7(20|68)w`));
      expect(thumb).toMatch(/<img\b[^>]*\ssrc="[^"]*-480\.jpg"/);
      expect(thumb).toMatch(/<img\b[^>]*\swidth="480"[^>]*\sheight="2(40|70)"/);
      expect(thumb).toMatch(/sizes="\(min-width: 941px\) 300px/);
    }
  });

  it('the guides’ related cards do the same, and stay lazy', () => {
    const cards = [...read('office-cleaning-cost-toronto-guide/index.html').matchAll(/<a class="guide-related-card"[\s\S]*?<\/picture>/g)].map((m) => m[0]);
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card).toMatch(/<source type="image\/avif" srcset="[^"]*-480\.avif 480w, [^"]*-7(20|68)\.avif/);
      expect(card).toMatch(/<img\b[^>]*\swidth="480"[^>]*\sheight="2(40|70)"[^>]*\sloading="lazy"/);
    }
  });
});

/* Performance finding 7: `100vw` on a phone picked the 768 for a 380px card. */
describe('the homepage service cards are sized to the card, not the viewport', () => {
  const cards = () => [...home.matchAll(/<ul class="hs-primary"[\s\S]*?<\/ul>/g)].flatMap((m) => [...m[0].matchAll(/<picture[\s\S]*?<\/picture>/g)].map((p) => p[0]));

  it('offer 480, 640 and 768 candidates in every format', () => {
    expect(cards()).toHaveLength(3);
    for (const card of cards())
      for (const ext of ['avif', 'webp', 'jpg'])
        expect(card).toMatch(new RegExp(String.raw`-480\.${ext} 480w, [^"]*-640\.${ext} 640w, [^"]*-768\.${ext} 768w`));
  });

  it('with a sizes hint that never claims the whole viewport', () => {
    for (const card of cards()) {
      /* A bare `100vw` fallback, not the gutter-aware `calc(100vw - 30px)`. */
      expect(card).not.toMatch(/[ ,"]100vw[,"]/);
      expect(card).toMatch(/sizes="\(min-width: 1400px\) 418px, [^"]*calc\(100vw - 30px\)"/);
    }
  });

  it('and the 640 variants are real downscales that beat their JPEG', () => {
    for (const base of ['office-backpack-vacuum-toronto', 'lobby-floor-scrubber-commercial', 'warehouse-floor-scrubber-industrial']) {
      const jpeg = fs.statSync(path.join(publicImages, `${base}-640.jpg`)).size;
      for (const ext of ['avif', 'webp'])
        expect(fs.statSync(path.join(publicImages, `${base}-640.${ext}`)).size, `${base}-640.${ext}`).toBeLessThan(jpeg);
    }
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
    expect(home).toMatch(/<link rel="preconnect" href="https:\/\/img\.evergreencleaningservice\.ca"\s*\/?>/);
    expect(home).not.toMatch(/img\.evergreencleaningservice\.ca[^>]*crossorigin/);
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

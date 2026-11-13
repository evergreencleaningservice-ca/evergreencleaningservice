/**
 * @vitest-environment node
 *
 * 13 Nov 2026 (comparison with impact.ca, report items 1, 7 and 8), read off
 * a real build:
 *
 *   - the Google rating strip and the hero's rating item are gated on real
 *     Google Business Profile figures, which we do not have yet, so neither
 *     is in the build, and no page carries an `aggregateRating` anywhere;
 *   - the homepage has a short visible FAQ, between the testimonials and the
 *     contact form, with pinned questions, every answer linking to a built
 *     page, the 2-hour reply qualified, and no FAQPage JSON-LD.
 *
 * The gate itself is tested both ways in tests/google-rating.test.ts.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { googleProfile } from '../../src/data/reviews';
import { HOME_FAQS } from '../../src/data/home-faq';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-home-proof-faq');

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

const files = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : [p];
  });
const TEXT = /\.(?:html|json|xml|txt|js|mjs|css|webmanifest)$/;
const htmlPages = () => files(out).filter((f) => f.endsWith('.html'));
const home = () => fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&rsquo;|’/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

describe('the Google rating is not shown until the profile figures exist', () => {
  it('the record is still unset', () => {
    expect(googleProfile).toBeUndefined();
  });

  it('no page has the rating strip, not even an empty wrapper', () => {
    const pages = htmlPages();
    expect(pages.length).toBeGreaterThan(20);
    for (const file of pages) {
      const html = fs.readFileSync(file, 'utf8');
      expect(html, file).not.toContain('data-google-rating-strip');
      expect(html, file).not.toMatch(/class="rating-strip/);
      expect(html, file).not.toMatch(/on Google · \d/);
    }
  });

  it('the hero proof row has its three points and no rating item', () => {
    const row = home().match(/<ul class="hero-points[^"]*"[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? '';
    expect(row).not.toBe('');
    expect(row).not.toContain('hero-rating');
    expect(row.match(/<li\b/g)).toHaveLength(3);
  });

  it('no aggregateRating anywhere in the build', () => {
    /* Google ignores self-serving ratings of a business on its own site;
       an invented one is a manual-action risk. Checked in every text file,
       not only JSON-LD, so a script or a JSON file cannot carry one either. */
    const hits = files(out)
      .filter((f) => TEXT.test(f))
      .filter((f) => /aggregateRating/i.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(out, f));
    expect(hits).toEqual([]);
  });
});

describe('the homepage FAQ', () => {
  const section = () => home().match(/<section[^>]*id="faq"[\s\S]*?<\/section>/)?.[0] ?? '';
  const items = () =>
    [...section().matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map(([, body]) => ({
      q: text(body.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? ''),
      body,
    }));

  it('asks exactly these questions, in this order', () => {
    expect(items().map((i) => i.q)).toEqual([
      'How much does office cleaning cost?',
      'Do you clean after hours?',
      'Are you insured and bonded?',
      'Which areas do you serve?',
      'What does a regular office clean include?',
      'How quickly do you reply to a quote request?',
    ]);
    expect(HOME_FAQS).toHaveLength(6);
  });

  it('sits after the testimonials and before the contact form', () => {
    const html = home();
    const at = (id: string) => html.indexOf(`id="${id}"`);
    expect(at('faq')).toBeGreaterThan(-1);
    expect(at('reviews')).toBeLessThan(at('faq'));
    expect(at('testimonials')).toBeLessThan(at('faq'));
    expect(at('faq')).toBeLessThan(at('contact'));
  });

  it('every answer links to a page that is in the build', () => {
    for (const { q, body } of items()) {
      const hrefs = [...body.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs, q).toHaveLength(1);
      const [href] = hrefs;
      expect(href, q).toMatch(/^\/[a-z0-9-/]*\/$/);
      expect(fs.existsSync(path.join(out, href, 'index.html')), `${q} → ${href}`).toBe(true);
    }
  });

  it('states the 2-hour reply only with the office hours', () => {
    const reply = items().find((i) => i.q.startsWith('How quickly'))!;
    expect(text(reply.body)).toContain('We reply within 2 hours during office hours (Mon–Fri 7am–6pm)');
    for (const m of text(section()).matchAll(/\bwithin (?:2|two) hours\b/gi)) {
      const after = text(section()).slice(m.index! + m[0].length, m.index! + m[0].length + 45);
      expect(after).toMatch(/^ during office hours \(Mon–Fri 7am–6pm\)/);
    }
  });

  it('states no price: the site publishes none for a regular office contract', () => {
    expect(text(section())).not.toMatch(/\$\s?\d/);
  });

  it('carries no FAQPage JSON-LD on the homepage', () => {
    for (const [, json] of home().matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      expect(json).not.toContain('FAQPage');
    }
  });
});

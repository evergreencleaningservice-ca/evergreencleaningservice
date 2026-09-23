/**
 * @vitest-environment node
 *
 * Phase 12 closeout — B4. Every exact-match legacy address, in BOTH
 * trailing-slash spellings, as the build actually emits them.
 *
 * WHAT WENT WRONG. `_redirects` matches a path exactly. Every legacy rule was
 * written with a trailing slash, so `/office-cleaning` — no slash — matched
 * nothing, and because there is no asset at that path either, the edge had
 * nothing to normalise onto and answered 404. Measured against the deployed
 * Worker: all 24 exact-match rules failed that way.
 *
 * It is a regression the migration introduced. WordPress answers both
 * spellings today, so those links work right now and would have died at
 * cutover, silently, on exactly the addresses with the most years of inbound
 * links behind them.
 *
 * WHY THIS IS A BUILD TEST. The expansion is a pure function and is unit
 * tested below, but the thing that actually has to be true is a property of
 * the FILE the edge reads. A correct `bothSlashSpellings` whose output never
 * reaches `dist/_redirects` — because a section was missed when it was wired
 * in — looks identical from a unit test and is worth nothing. So this reads
 * the emitted file.
 *
 * The deployed half of the claim is `npm run parity`, which requests all 48
 * against a real origin. A file is not an origin; both are asserted.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  bothSlashSpellings,
  specRedirects,
  legacyRedirects,
  newsPageRedirects,
  wildcardRedirects,
} from '../../src/data/redirects';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-redirects');

/** Every exact-match rule the map carries, before expansion. */
const EXACT = [...specRedirects, ...legacyRedirects, ...newsPageRedirects];

interface Rule {
  from: string;
  to: string;
  code: string;
}

let rules: Rule[] = [];
let byFrom = new Map<string, Rule>();

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  /* The generator is run exactly as the real build runs it, against this
     throwaway directory, so the rules under test are the ones it emits rather
     than a re-implementation of its logic. */
  const gen = spawnSync('node', ['--experimental-strip-types', 'scripts/redirects.mjs'], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, DIST: out },
  });
  if (gen.status !== 0) throw new Error(`redirects.mjs failed:\n${gen.stdout}\n${gen.stderr}`);

  rules = fs
    .readFileSync(path.join(out, '_redirects'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const [from, to, code] = l.trim().split(/\s+/);
      return { from, to, code };
    });
  byFrom = new Map(rules.map((r) => [r.from, r]));
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- the expansion itself -------------------------------------------------- */

describe('bothSlashSpellings', () => {
  it('emits both spellings of a directory-style source', () => {
    expect(bothSlashSpellings([{ from: '/office-cleaning/', to: '/services/office-cleaning/' }])).toEqual([
      { from: '/office-cleaning/', to: '/services/office-cleaning/' },
      { from: '/office-cleaning', to: '/services/office-cleaning/' },
    ]);
  });

  it('accepts a source written without the slash and still emits both', () => {
    expect(bothSlashSpellings([{ from: '/feed', to: '/rss.xml' }]).map((r) => r.from)).toEqual([
      '/feed/',
      '/feed',
    ]);
  });

  it('sends BOTH spellings to the same final target — never a chain', () => {
    /* A chain would work in a browser and is still wrong: two round trips on
       a cold connection, for nothing. */
    for (const rule of bothSlashSpellings(EXACT)) {
      const original = EXACT.find(
        (r) => r.from.replace(/\/$/, '') === rule.from.replace(/\/$/, '')
      );
      expect(rule.to).toBe(original!.to);
      expect(EXACT.some((r) => r.from === rule.to)).toBe(false);
    }
  });

  it('does not put a trailing slash on a file address', () => {
    /* `/sitemap.xml/` is not an address anyone has ever linked to. */
    expect(bothSlashSpellings([{ from: '/sitemap.xml', to: '/sitemap-index.xml' }])).toEqual([
      { from: '/sitemap.xml', to: '/sitemap-index.xml' },
    ]);
  });

  it('treats an extensionless WordPress route as a directory', () => {
    /* The distinction that makes the rule above safe: `/feed` is a route and
       does take both spellings; `/sitemap.xml` is a file and does not. */
    expect(bothSlashSpellings([{ from: '/feed/', to: '/rss.xml' }])).toHaveLength(2);
  });

  it('refuses a wildcard rather than silently shadowing the rule below it', () => {
    /* A splat already matches both spellings. Expanding one would emit a
       duplicate that swallows whatever follows. */
    expect(() => bothSlashSpellings([{ from: '/blog/*', to: '/:splat' }])).toThrow(/wildcard/i);
  });

  it('never emits the same source twice', () => {
    const froms = bothSlashSpellings(EXACT).map((r) => r.from);
    expect(froms.length).toBe(new Set(froms).size);
  });
});

/* --- the emitted file ------------------------------------------------------ */

describe('the emitted _redirects', () => {
  it('carries both spellings of every exact-match source', () => {
    const missing: string[] = [];
    for (const rule of EXACT) {
      const bare = rule.from.replace(/\/$/, '');
      const isFile = /\.[a-z0-9]{2,5}$/i.test(bare.split('/').pop() ?? '');
      for (const spelling of isFile ? [bare] : [`${bare}/`, bare]) {
        if (!byFrom.has(spelling)) missing.push(spelling);
      }
    }
    expect(missing).toEqual([]);
  });

  it('covers 48 variants of the 24 directory-style rules, plus 2 file addresses', () => {
    /**
     * THE ARITHMETIC, stated exactly, because the closeout is measured
     * against it and a round number that is slightly wrong is worse than an
     * awkward one that is right.
     *
     * There are 26 exact-match rules. Twenty-four are directory-style and
     * take both spellings — the 48 variants B4 is about. The other two,
     * `/sitemap.xml` and `/sitemap_index.xml`, are file addresses with one
     * legitimate spelling each. 48 + 2 = 50 emitted sources.
     *
     * The "24" in the original finding came from a measurement that filtered
     * on a trailing slash, so it counted the directory-style rules only. That
     * is the right set for the defect; it is not the whole exact-match map.
     */
    const isFile = (from: string) =>
      /\.[a-z0-9]{2,5}$/i.test(from.replace(/\/$/, '').split('/').pop() ?? '');

    expect(EXACT).toHaveLength(26);
    expect(EXACT.filter((r) => !isFile(r.from))).toHaveLength(24);
    expect(EXACT.filter((r) => isFile(r.from)).map((r) => r.from)).toEqual([
      '/sitemap.xml',
      '/sitemap_index.xml',
    ]);
    expect(bothSlashSpellings(EXACT)).toHaveLength(50);
  });

  it('sends every variant to a 301, not a 302 or a meta refresh', () => {
    const notPermanent = rules.filter((r) => r.code !== '301');
    expect(notPermanent).toEqual([]);
  });

  it('points every variant at a target that is not itself a redirect source', () => {
    /* The one-hop guarantee, asserted on the file rather than on intent. */
    const chained = rules.filter((r) => byFrom.has(r.to) && byFrom.get(r.to)!.to !== r.to);
    expect(chained.map((r) => `${r.from} → ${r.to} → ${byFrom.get(r.to)!.to}`)).toEqual([]);
  });

  it('leaves the wildcard rules exactly as they were', () => {
    /* B4 must not have disturbed them: a duplicated splat would shadow the
       rule beneath it, and these are matched last precisely so they cannot. */
    for (const w of wildcardRedirects) {
      expect(byFrom.get(w.from)).toEqual({ from: w.from, to: w.to, code: '301' });
    }
    expect(rules.filter((r) => r.from.includes('*'))).toHaveLength(wildcardRedirects.length);
  });

  it('keeps every wildcard below every exact rule that would collide', () => {
    /* Cloudflare takes the FIRST match. `/blog` and `/blog/page/2` both have
       to win against `/blog/*`, and the only thing making that true is
       position in the file. */
    const index = (from: string) => rules.findIndex((r) => r.from === from);
    const blogSplat = index('/blog/*');
    for (const specific of ['/blog/', '/blog', '/blog/page/2/', '/blog/page/2', '/blog/feed/']) {
      expect(index(specific), `${specific} must precede /blog/*`).toBeLessThan(blogSplat);
    }
  });

  it('stays far below the edge rule limit', () => {
    expect(rules.length).toBeLessThan(2000);
  });
});

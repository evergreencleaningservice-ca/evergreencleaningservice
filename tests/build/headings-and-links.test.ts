/**
 * @vitest-environment node
 *
 * Phase 6 — one meaningful H1 per page, and internal links that go straight
 * to a 200.
 *
 * WHY THIS IS A BUILD TEST. Every claim here is about the emitted HTML and
 * the emitted redirect map together. An H1 can be correct in a component and
 * doubled on the page because a Markdown body also opens with one — which is
 * exactly what two blog posts did. And a link can be perfectly valid and
 * still cost a redirect, which only the `_redirects` file can tell you.
 *
 * It builds the site once, the way the production build does, and reads the
 * result. `npm run verify:indexing` covers what only a deployed origin can
 * answer.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-links');

let pages: string[] = [];
let redirects: { from: string; to: string }[] = [];

const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');
const isRedirectStub = (html: string) => /http-equiv="refresh"/i.test(html);

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  /* The redirect map is written by a separate script, so generate it into
     the same directory rather than asserting against a stale dist/. */
  const rules = spawnSync(
    'node',
    ['--experimental-strip-types', path.join(repo, 'scripts', 'redirects.mjs')],
    { cwd: repo, encoding: 'utf8', env: { ...process.env, DIST: out } }
  );
  if (rules.status !== 0) throw new Error(`redirects.mjs failed:\n${rules.stderr}`);

  redirects = fs
    .readFileSync(path.join(out, '_redirects'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 2)
    .map(([from, to]) => ({ from, to }));

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return full.endsWith('.html') ? [path.relative(out, full)] : [];
    });
  pages = walk(out).filter((p) => !isRedirectStub(read(p)));
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- helpers -------------------------------------------------------------- */

const headings = (html: string, level: number) =>
  [...html.matchAll(new RegExp(`<h${level}[^>]*>(.*?)</h${level}>`, 'gs'))].map((m) =>
    m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );

/** Does this path resolve to a real page in the build? */
function exists(pathname: string): boolean {
  if (pathname === '/') return fs.existsSync(path.join(out, 'index.html'));
  const p = pathname.replace(/^\/|\/$/g, '');
  return (
    fs.existsSync(path.join(out, p, 'index.html')) ||
    fs.existsSync(path.join(out, p)) ||
    fs.existsSync(path.join(out, `${p}.html`))
  );
}

/** The redirect that would fire for this path, splat rules included. */
function redirectFor(pathname: string): string | null {
  const exact = redirects.find((r) => !r.from.includes('*') && r.from === pathname);
  if (exact) return exact.to;
  const splat = redirects.find(
    (r) => r.from.includes('*') && new RegExp(`^${r.from.replace(/\*/g, '.*')}$`).test(pathname)
  );
  return splat ? splat.to : null;
}

/** Every internal href on the site, mapped to the pages that use it. */
function internalLinks(): Map<string, string[]> {
  const links = new Map<string, string[]>();
  for (const page of pages) {
    for (const m of read(page).matchAll(/<a[^>]+href="([^"]+)"/g)) {
      const href = m[1].split('#')[0];
      if (!href || /^(https?:|mailto:|tel:|javascript:|#)/.test(href)) continue;
      links.set(href, [...(links.get(href) ?? []), page]);
    }
  }
  return links;
}

/* --- headings ------------------------------------------------------------- */

describe('every page has exactly one meaningful H1', () => {
  it('no page carries two, and none carries none', () => {
    const wrong = pages
      .map((page) => ({ page, h1: headings(read(page), 1) }))
      .filter(({ h1 }) => h1.length !== 1);
    expect(wrong).toEqual([]);
  });

  it('no H1 is empty or whitespace', () => {
    for (const page of pages) expect(headings(read(page), 1)[0]).not.toBe('');
  });

  it('the six pages that carried two H1s now carry one', () => {
    /* Named individually rather than folded into the sweep above, because
       these are the regressions with a known cause: two Markdown bodies
       opening with `# `, and a WordPress theme artefact that emitted a
       screen-reader-only duplicate of the visible title on every page of the
       news archive. */
    for (const page of [
      'a-cleaning-checklist-for-your-retail-store/index.html',
      'ask-the-office-cleaners-cleaning-break-rooms/index.html',
      'insights/index.html',
      'insights/page/2/index.html',
      'insights/page/3/index.html',
      'insights/page/4/index.html',
    ]) {
      expect(headings(read(page), 1)).toHaveLength(1);
    }
  });

  it('the news archive no longer says "News, News"', () => {
    for (const page of pages.filter((p) => p.startsWith('insights/'))) {
      expect(headings(read(page), 1)).toEqual(['News']);
    }
  });

  it('a blog post\'s H1 is its title, and its body headings start at H2', () => {
    const html = read('a-cleaning-checklist-for-your-retail-store/index.html');
    expect(headings(html, 1)).toEqual(['A Cleaning Checklist For Your Retail Store']);
    expect(headings(html, 2)).toContain('Retail Store Cleaning');
  });
});

describe('the homepage heading outline', () => {
  const home = () => read('index.html');

  it('the single H1 is stable, meaningful text', () => {
    /* It was the rotating brandmark, whose accessible name was five words
       read as a comma list — not a heading and not a sentence. */
    const h1 = headings(home(), 1);
    expect(h1).toEqual(['Professional Office &amp; Commercial Cleaning in Toronto']);
  });

  it('is present in the initial HTML, not injected by script', () => {
    expect(home()).toContain('<h1 class="hero-title"');
  });

  it('is not a visually hidden keyword line', () => {
    expect(home()).not.toMatch(/<h1[^>]*class="[^"]*screen-reader-text/);
    expect(home()).not.toMatch(/<h1[^>]*hidden/);
  });

  it('the rotating brandmark is decoration and hidden from assistive tech', () => {
    const brandmark = home().match(/<div class="hero-brandmark"[^>]*>/)?.[0] ?? '';
    expect(brandmark).toContain('aria-hidden="true"');
    /* and the five screen-reader commas that used to separate the words are
       gone with it — nothing in there is announced at all now. */
    expect(home()).not.toMatch(/hero-word[^>]*>[^<]*<span class="screen-reader-text">,/);
  });

  it('no rotating word is a heading any more', () => {
    for (const level of [1, 2, 3, 4, 5, 6])
      for (const h of headings(home(), level))
        expect(h).not.toMatch(/Janitorial Services|Disinfection Cleaning/);
  });

  it('keeps "Toronto Office Cleaning Services" on the page, as an H2', () => {
    /* The phrase is the homepage's main keyword. It moved from H1 to H2 so
       the hero could carry the single H1; it did not move off the page. */
    expect(headings(home(), 2)).toContain('Toronto Office Cleaning Services');
  });

  it('keeps the local-intent wording in the title tag', () => {
    expect(home()).toContain('<title>Office Cleaning Services Toronto - Evergreen Office Cleaning');
  });
});

/* --- internal links ------------------------------------------------------- */

describe('internal links', () => {
  it('none is broken', () => {
    const broken = [...internalLinks()]
      .filter(([href]) => !exists(href) && redirectFor(href) === null)
      .map(([href, on]) => `${href} (on ${on.length} page(s), e.g. ${on[0]})`);
    expect(broken).toEqual([]);
  });

  it('none goes through a redirect — every one points at a final 200', () => {
    const indirect = [...internalLinks()]
      .filter(([href]) => !exists(href) && redirectFor(href) !== null)
      .map(([href, on]) => `${href} -> ${redirectFor(href)} (on ${on.length} page(s))`);
    expect(indirect).toEqual([]);
  });

  it('the three known indirect links now point straight at the target', () => {
    const hrefs = new Set(internalLinks().keys());
    expect(hrefs).not.toContain('/services/disinfection-cleaning-service/');
    expect(hrefs).not.toContain('/services/emergency-cleaning-services/');
    expect(hrefs).not.toContain('/testimonials/');
    expect(hrefs).toContain('/services/disinfection-cleaning/');
    expect(hrefs).toContain('/services/emergency-cleaning/');
    expect(hrefs).toContain('/reviews/');
  });

  it('the tag cloud is gone from every page', () => {
    /* 26 links on 63 pages, all 301ing to the same archive. */
    const tagLinks = [...internalLinks().keys()].filter((href) => href.startsWith('/tag/'));
    expect(tagLinks).toEqual([]);
    for (const page of pages) expect(read(page)).not.toContain('widget-tags');
  });
});

/* --- redirects ------------------------------------------------------------ */

describe('the legacy redirect map', () => {
  it('still carries every rule — removing links did not remove redirects', () => {
    /* The tag cloud went; `/tag/*` did NOT. Those addresses still exist in
       backlinks and in Google's index, and deleting the rule would turn them
       into 404s.

       The count moved from 130 to 154 in the Phase 12 closeout, and the
       direction is the whole point of this assertion: every exact-match
       source is now emitted in both trailing-slash spellings (B4), so the map
       GREW by 24. A count that falls is a link class going dark, which is
       what this test is here to catch — so it is pinned rather than relaxed
       to a lower bound. `tests/build/redirect-variants.test.ts` owns the
       arithmetic behind the number. */
    expect(redirects.length).toBe(154);
    expect(redirects.some((r) => r.from === '/tag/*')).toBe(true);
    expect(redirects.some((r) => r.from === '/author/*')).toBe(true);
  });

  it('keeps the rules whose links this phase rewrote', () => {
    for (const from of [
      '/services/disinfection-cleaning-service/',
      '/services/emergency-cleaning-services/',
      '/testimonials/',
      '/testimonial/',
      '/emergency-service/',
      '/submit-your-testimonial/',
    ]) {
      expect(redirects.map((r) => r.from)).toContain(from);
    }
  });

  it('resolves every legacy address in exactly one hop', () => {
    const chains = redirects
      .filter((r) => !r.to.startsWith('http') && !r.to.includes(':splat'))
      .filter((r) => redirectFor(r.to) !== null)
      .map((r) => `${r.from} -> ${r.to} -> ${redirectFor(r.to)}`);
    expect(chains).toEqual([]);
  });

  it('every redirect lands on a page that exists', () => {
    const dead = redirects
      .filter((r) => !r.to.startsWith('http') && !r.to.includes(':splat'))
      .filter((r) => !exists(r.to))
      .map((r) => `${r.from} -> ${r.to}`);
    expect(dead).toEqual([]);
  });
});

/* --- nothing else moved --------------------------------------------------- */

describe('the rest of the page is untouched', () => {
  it('every page still has a title, a description, a canonical and JSON-LD', () => {
    for (const page of pages) {
      const html = read(page);
      expect(html).toMatch(/<title>.+?<\/title>/s);
      expect(html).toMatch(/<meta name="description" content=".+?"/s);
      expect(html).toMatch(/<link rel="canonical"/);
      expect(html).toMatch(/application\/ld\+json/);
    }
  });

  it('all 69 sitemap URLs were built', () => {
    const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const urls = locs(read('sitemap-index.xml')).flatMap((child) =>
      locs(read(path.basename(new URL(child).pathname)))
    );
    expect(urls).toHaveLength(69);
    const missing = urls.filter((u) => !exists(new URL(u).pathname));
    expect(missing).toEqual([]);
  });
});

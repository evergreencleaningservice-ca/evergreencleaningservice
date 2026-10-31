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
import {
  bothSlashSpellings,
  removedArchivePageRedirects,
  retiredPostRedirects,
  retiredPostSlugs,
  retiredTagRedirects,
} from '../../src/data/redirects';
import { isPrivatePage } from './private-pages';

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
  pages = walk(out).filter((p) => !isPrivatePage(p) && !isRedirectStub(read(p)));
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
    ]) {
      expect(headings(read(page), 1)).toHaveLength(1);
    }
  });

  it('the news archive no longer says "News, News"', () => {
    /* One H1 per page. Renamed from "News" on 2026-10-30 (SEO audit L1-L4:
       the blog hub is "Commercial Cleaning Insights"). */
    for (const page of pages.filter((p) => p.startsWith('insights/'))) {
      expect(headings(read(page), 1)).toEqual(['Commercial Cleaning Insights']);
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
    expect(h1).toEqual(['Office &amp; Commercial Cleaning in Toronto and the GTA']);
  });

  it('is present in the initial HTML, not injected by script', () => {
    expect(home()).toContain('<h1 class="hero-title"');
  });

  it('is not a visually hidden keyword line', () => {
    expect(home()).not.toMatch(/<h1[^>]*class="[^"]*screen-reader-text/);
    expect(home()).not.toMatch(/<h1[^>]*hidden/);
  });

  it('the rotating brandmark is gone entirely (2026-10-15)', () => {
    /* It was decoration (aria-hidden) that pushed the heading and both
       actions down the first screen; the hero now opens on the H1. */
    expect(home()).not.toContain('hero-brandmark');
    expect(home()).not.toContain('hero-word');
  });

  it('no rotating word is a heading any more', () => {
    for (const level of [1, 2, 3, 4, 5, 6])
      for (const h of headings(home(), level))
        expect(h).not.toMatch(/Janitorial Services|Disinfection Cleaning/);
  });

  it('keeps office cleaning and Toronto in the H1', () => {
    /* The old H2 "Toronto Office Cleaning Services" sat in the retired About
       essay; the intent now lives in the H1 itself. */
    expect(headings(home(), 1)[0]).toMatch(/Office .*Cleaning in Toronto/);
  });

  it('keeps the local-intent wording in the title tag, and leaves "office cleaning services" to the service page', () => {
    /* 30 Oct 2026: the homepage was outranking /services/office-cleaning/
       for that page's own queries (SEO audit). */
    expect(home()).toMatch(/<title>Commercial Cleaning Company in Toronto Since 1989/);
    expect(home()).not.toMatch(/<title>[^<]*Office Cleaning Services/);
    expect(read('services/office-cleaning/index.html')).toMatch(/<title>Office Cleaning Services in Toronto/);
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

  it('the tag cloud is back, and every link in it leads somewhere different', () => {
    /* THIS TEST USED TO ASSERT THE OPPOSITE, and the reason it did is worth
       keeping: the cloud was 26 links on 63 pages that all 301'd to the same
       archive, so it was 26 words for one destination. That was true, and it
       was fixed the wrong way round — by deleting the client's navigation and
       putting an invented "Request Quote" form in its place.

       The archives exist now, so the links lead to 26 different pages and the
       cloud means what it looks like it means. What this asserts is the part
       that was actually broken: distinct destinations, each one real. */
    const tagLinks = [...internalLinks().keys()].filter((href) => href.startsWith('/tag/'));

    /* The cloud's own 26 are the archive roots. The rest of the /tag/ links
       are the "Older posts" hops the five busiest tags need, which is why
       this counts the roots rather than every /tag/ href. */
    const roots = tagLinks.filter((href) => /^\/tag\/[^/]+\/$/.test(href));
    /* 24 since 30 Oct 2026: the consolidation emptied `coronavirus` and `covid-19`. */
    expect(new Set(roots).size).toBe(24);

    for (const href of tagLinks) {
      expect(fs.existsSync(path.join(out, href.slice(1), 'index.html')), href).toBe(true);
    }
  });
});

/* --- redirects ------------------------------------------------------------ */

describe('the legacy redirect map', () => {
  it('still carries every rule — removing links did not remove redirects', () => {
    /* The count moved from 130 to 154 in the Phase 12 closeout, and from 154
       to 171 when the tag archives were built: `/tag/*` came OUT (one rule)
       and the nine zero-post tags went in by name, in both trailing-slash
       spellings (eighteen). The wildcard had to go because Cloudflare reads
       `_redirects` before it looks for an asset, so it was answering 301 for
       all 26 real archives — see `emptyTagRedirects` in
       src/data/redirects.ts.

       The direction is the point of this assertion: every exact-match source
       is emitted in both spellings (B4), so the map GROWS. A count that falls
       is a link class going dark, which is what this test catches — so it is
       pinned rather than relaxed to a lower bound.
       `tests/build/redirect-variants.test.ts` owns the arithmetic. */
    /* Two sections were added on 30 Oct 2026 and are counted apart: the
       slash-less spelling of every built page (SEO audit M3), and the old
       single sitemap pointing at the pages sitemap (M2). */
    const pageSlash = redirects.filter((r) => r.to === `${r.from}/`);
    /* The blog consolidation of 30 Oct 2026 (SEO audit H7) added its own
       sections: retired posts, emptied tags and removed archive pages. */
    const consolidation = new Set(
      bothSlashSpellings([...retiredPostRedirects, ...retiredTagRedirects, ...removedArchivePageRedirects]).map(
        (r) => r.from
      )
    );
    const legacy = redirects.filter(
      (r) => r.to !== `${r.from}/` && r.from !== '/sitemap-0.xml' && !consolidation.has(r.from)
    );
    expect(legacy.length).toBe(171);
    expect(redirects.filter((r) => consolidation.has(r.from))).toHaveLength(consolidation.size);
    expect(redirects.some((r) => r.from === '/sitemap-0.xml' && r.to === '/sitemap-pages-0.xml')).toBe(true);
    for (const page of ['/about-us', '/insights', '/services/office-cleaning', '/locations/mississauga']) {
      expect(pageSlash.some((r) => r.from === page), page).toBe(true);
    }
    expect(redirects.some((r) => r.from === '/tag/*')).toBe(false);
    expect(redirects.some((r) => r.from === '/tag/markup/')).toBe(true);
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

  /* 69 until 2026-10-15; +4 for /industries/, its two pages and /our-process/.
     Back to 69 on 2026-10-29: /search/ and /insights/page/2-4/ left the
     sitemap (SEO audit M1, M2). 70 since 2026-10-30: floor stripping and
     waxing (M5). 55 since the blog consolidation the same day: 16 posts
     merged or retired, one seasonal checklist added (H7). */
  it('all 56 sitemap URLs were built', () => {
    const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const urls = locs(read('sitemap-index.xml')).flatMap((child) =>
      locs(read(path.basename(new URL(child).pathname)))
    );
    expect(urls).toHaveLength(56);
    const missing = urls.filter((u) => !exists(new URL(u).pathname));
    expect(missing).toEqual([]);
  });
});

/**
 * The location pages' uniqueness gate (SEO audit, 28 Oct 2026, Critical).
 *
 * Measured as the audit measures it: the text of <main> without its forms,
 * with the page's own city name replaced by a placeholder, cut into 6-word
 * shingles. A page's score is the share of its shingles that appear on no
 * other location page. The pages were 4-8% unique (29% for the two with
 * client copy) and failed the 60% bar. src/data/location-local.ts is what
 * lifted them; this keeps a new location page from going back to "one
 * template with the city swapped".
 */
describe('location pages are each their own page', () => {
  const CITY: Record<string, string[]> = {
    'toronto-downtown': ['downtown toronto', 'toronto downtown'],
    'vaughan': ['vaughan & concord', 'vaughan and concord', 'vaughan'],
  };

  const words = (slug: string): string[] => {
    const html = read(`locations/${slug}/index.html`);
    const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '';
    let text = main
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<form[\s\S]*?<\/form>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;|&rsquo;|’/g, "'")
      .toLowerCase();
    for (const name of CITY[slug] ?? [slug]) text = text.split(name).join(' city ');
    return text.match(/[a-z0-9']+/g) ?? [];
  };

  const shingles = (w: string[]) => w.slice(0, -5).map((_, i) => w.slice(i, i + 6).join(' '));

  it('every location page is at least 60% unique', () => {
    const slugs = fs.readdirSync(path.join(out, 'locations'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(slugs.length).toBeGreaterThanOrEqual(7);

    const all = Object.fromEntries(slugs.map((s) => [s, shingles(words(s))]));
    const scores = slugs.map((s) => {
      const others = new Set(slugs.filter((o) => o !== s).flatMap((o) => all[o]));
      const unique = all[s].filter((sh) => !others.has(sh)).length / all[s].length;
      return [s, Math.round(unique * 100)] as const;
    });
    const failing = scores.filter(([, pct]) => pct < 60);
    expect(failing, JSON.stringify(scores)).toEqual([]);
  });
});

describe('the blog consolidation (SEO audit H7, 30 Oct 2026)', () => {
  it('builds none of the retired posts and sends each to a page that exists', () => {
    for (const slug of retiredPostSlugs) {
      expect(fs.existsSync(path.join(out, slug, 'index.html')), slug).toBe(false);
      for (const from of [`/${slug}/`, `/${slug}`, `/blog/${slug}/`]) {
        const to = redirectFor(from);
        expect(to, from).not.toBeNull();
        expect(exists(to!), `${from} -> ${to}`).toBe(true);
      }
    }
  });

  it('dates a merged post as updated, on the page and in its data', () => {
    const html = read('commercial-cleaning-air-quality/index.html');
    expect(html).toMatch(/Updated <time datetime="2026-10-30"/);
    expect(html).toContain('"dateModified":"2026-10-30T00:00:00.000Z"');
    expect(html).toContain('"datePublished":"2020-08-31T00:00:00.000Z"');
    expect(html).toContain('<meta property="article:modified_time" content="2026-10-30T00:00:00.000Z">');
    expect(read('sitemap-insights-0.xml')).toMatch(
      /commercial-cleaning-air-quality\/<\/loc><lastmod>2026-10-30/
    );
  });

  it('leaves a post that was not revised without an updated date', () => {
    const html = read('how-to-properly-dust-office-building/index.html');
    expect(html).not.toContain('Updated <time');
    expect(html).not.toContain('article:modified_time');
  });
});

describe('the location pages people search as "office cleaning <city>"', () => {
  /* Search Console, Oct 2026: in Mississauga, Vaughan and Brampton "office
     cleaning" outnumbers "commercial cleaning", and Mississauga searchers
     name their neighbourhood. */
  it.each([
    ['mississauga', 'Mississauga'],
    ['vaughan', 'Vaughan and Concord'],
    ['brampton', 'Brampton'],
    ['etobicoke', 'Etobicoke'],
    ['markham', 'Markham'],
    ['oakville', 'Oakville'],
    ['toronto-downtown', 'Downtown Toronto'],
  ])('%s leads with office cleaning in its title, H1 and an office section', (slug, place) => {
    const html = read(`locations/${slug}/index.html`);
    expect(html).toMatch(/<title>Office &amp; Commercial Cleaning in /);
    expect(headings(html, 1)).toEqual([`Office &amp; Commercial Cleaning in ${place}`]);
    expect(html).toMatch(/<h2 id="loc-office-h"[^>]*>Office cleaning in /);
    expect(html).toContain('href="/services/office-cleaning/">office cleaning</a>');
  });

  it('names the Mississauga neighbourhoods searchers use', () => {
    const html = read('locations/mississauga/index.html');
    for (const place of ['Meadowvale', 'Lisgar', 'East Credit', 'Streetsville', 'Erin Mills', 'Malton']) {
      expect(html, place).toContain(place);
    }
  });
});

describe('the audit fixes of 30 Oct 2026', () => {
  const graphOf = (html: string) =>
    [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .flatMap((d) => d['@graph'] ?? [d]);

  it('types the business as a real schema.org LocalBusiness subtype, with no guessed price range', () => {
    const org = graphOf(read('index.html')).find((n) => String(n['@id']).endsWith('/#organization'));
    expect(org['@type']).toBe('ProfessionalService');
    expect(org).not.toHaveProperty('priceRange');
  });

  it('says the reply promise where people land, and never "no site visit"', () => {
    for (const page of ['index.html', 'services/office-cleaning/index.html', 'locations/mississauga/index.html']) {
      expect(read(page), page).toMatch(/reply within 2 hours/i);
    }
    for (const page of pages) expect(read(page), page).not.toContain('No site visit');
  });

  it('only the downtown page says the office is in its area', () => {
    expect(read('locations/etobicoke/index.html')).toContain('No. Etobicoke is in the City of Toronto');
    expect(read('locations/toronto-downtown/index.html')).toMatch(/Do you have an office in Downtown Toronto\?<\/summary><p[^>]*>Yes: /);
  });
});

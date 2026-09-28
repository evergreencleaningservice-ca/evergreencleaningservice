/**
 * @vitest-environment node
 *
 * Phase 5 — staging stays out of the index, production stays in it.
 *
 * The two expectations are opposites, which is the whole risk. Staging must be
 * noindex or it competes with the live site for its own rankings; production
 * must not be, and launching with the staging header still attached would
 * deindex the business. That is the most expensive mistake available at
 * cutover and it is invisible from the page.
 *
 * ONE BUILD, BOTH ADDRESSES. Staging and production are the same files on the
 * same Worker. The staging noindex is a `_headers` rule naming the staging
 * hostname, so it is present in production's build too and simply never
 * matches there. What this file guards is that no noindex rule can reach a
 * production hostname.
 *
 * WHAT THIS FILE PROVES AND WHAT IT CANNOT. It builds the site the way the
 * production build does and reads the emitted HTML, the sitemap and the build
 * scripts' own behaviour. It cannot prove what a deployed origin sends: an
 * `X-Robots-Tag` is `dist/_headers` as Cloudflare chooses to interpret it, and
 * that can be wrong while the repository is right — a stale deploy, an edge
 * cache, a zone transform rule, a `_headers` Workers static assets did not
 * pick up. `npm run verify:indexing -- staging|production` is the other half
 * and runs against the live origin.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../../src/data/site';
import {
  hostMatches,
  noindexProblems,
  noindexedHosts,
  parseHeaders,
  ruleHost,
} from '../../src/lib/noindex-rules';

const repo = path.resolve(import.meta.dirname, '../..');
const ORIGIN = `https://${PRODUCTION_HOSTS[0]}`;
const out = path.join(repo, '.astro-test-dist');

/**
 * Every public page must be indexable. These are the deliberate exceptions,
 * each with its own assertion below saying what it is and why.
 */
const NOINDEX_ROUTES = [
  'lp/commercial-cleaning/index.html',
  'lp/commercial-cleaning-quote/index.html',
  'thank-you/index.html',
];

/** The blog archive is `follow, noindex`, which is a different decision. */
const isBlogArchive = (page: string) => page.startsWith('category/blog/');

/**
 * The 26 tag archives are `follow, noindex` for the same reason, and because
 * the original serves them that way — measured on /tag/cleaning/. Crawlable
 * through to the posts; not 34 thin pages competing with /insights/, which
 * lists the same 38 articles and IS indexable.
 */
const isTagArchive = (page: string) => page.startsWith('tag/');

let pages: string[] = [];
const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const result = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (result.status !== 0) {
    throw new Error(`astro build failed:\n${result.stdout}\n${result.stderr}`);
  }

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return full.endsWith('.html') ? [path.relative(out, full)] : [];
    });
  pages = walk(out);
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const canonicalOf = (html: string) =>
  html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
const robotsMetaOf = (html: string) =>
  html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';

/** Astro emits legacy redirects as tiny meta-refresh pages; not real pages. */
const isRedirectStub = (html: string) => /http-equiv="refresh"/i.test(html);

describe('the production build', () => {
  it('builds every page', () => {
    expect(pages.length).toBeGreaterThan(60);
  });

  it('ships _headers whose only noindex is scoped to non-production hostnames', () => {
    /* One build serves staging and production from the same Worker, so a
       path-only noindex would reach the live site the moment its Custom
       Domain is attached. Every noindex must name a host, and none of those
       hosts may match www. or the apex. */
    const text = read('_headers');
    expect(noindexProblems(text, PRODUCTION_HOSTS)).toEqual([]);
    expect(noindexedHosts(text).some((h) => hostMatches(h, PREVIEW_HOST))).toBe(true);
  });

  it('ships the allow-all robots.txt from public/', () => {
    const robots = read('robots.txt');
    expect(robots).toMatch(/^\s*Allow:\s*\//m);
    expect(robots).not.toMatch(/^\s*Disallow:\s*\/\s*$/m);
    expect(robots).not.toMatch(/not the live site/i);
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap-index.xml`);
  });

  it('never uses Disallow: / as a noindex', () => {
    /* It blocks the crawl, so the noindex is never read, and the URL can
       still be indexed from an inbound link with no way to remove it. */
    expect(read('robots.txt')).not.toMatch(/Disallow:\s*\/\s*$/m);
  });
});

describe('canonicals', () => {
  it('every page has exactly one, on https://www.evergreencleaningservice.ca/', () => {
    const wrong: string[] = [];
    for (const page of pages) {
      const html = read(page);
      if (isRedirectStub(html) || page === '404.html') continue;
      const canonical = canonicalOf(html);
      if (!canonical.startsWith(`${ORIGIN}/`)) wrong.push(`${page}: ${canonical || '(none)'}`);
      expect((html.match(/rel="canonical"/g) ?? []).length).toBe(1);
    }
    expect(wrong).toEqual([]);
  });

  it('the canonical matches the page it is on', () => {
    for (const page of ['index.html', 'about-us/index.html', 'services/office-cleaning/index.html']) {
      const expected = `${ORIGIN}/${page.replace(/index\.html$/, '')}`;
      expect(canonicalOf(read(page))).toBe(expected);
    }
  });

  it('no canonical or og:url points at the staging host', () => {
    /* Deliberately narrow. The staging hostname DOES appear in every page,
       in GoogleTagManager's hostname allowlist — that is what makes the tags
       load on staging at all, and it is correct. What must never point there
       is anything a search engine treats as the address of the page. */
    for (const page of pages) {
      const html = read(page);
      expect(canonicalOf(html)).not.toContain(PREVIEW_HOST);
      expect(html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? '').not.toContain(
        PREVIEW_HOST
      );
    }
  });
});

describe('which pages are indexable', () => {
  it('no public page carries a noindex', () => {
    const noindexed = pages.filter((page) => {
      if (
        NOINDEX_ROUTES.includes(page) ||
        isBlogArchive(page) ||
        isTagArchive(page) ||
        page === '404.html'
      )
        return false;
      const html = read(page);
      if (isRedirectStub(html)) return false;
      return /noindex/i.test(robotsMetaOf(html));
    });
    expect(noindexed).toEqual([]);
  });

  it('the landing pages and the thank-you page still are', () => {
    for (const route of NOINDEX_ROUTES) {
      expect(robotsMetaOf(read(route))).toBe('noindex, nofollow');
    }
  });

  it('404 is noindex', () => {
    expect(robotsMetaOf(read('404.html'))).toMatch(/noindex/);
  });

  it('every page of the blog archive keeps follow, noindex', () => {
    /* The original's own choice. `noindex, nofollow` here would also cut the
       only crawl path to every post, which is not the same decision — so the
       distinction is asserted on each paginated page, not just the first. */
    const archive = pages.filter(isBlogArchive);
    expect(archive.length).toBeGreaterThan(1);
    for (const page of archive) expect(robotsMetaOf(read(page))).toBe('follow, noindex');
  });

  it('every tag archive keeps follow, noindex too', () => {
    /* Asserted positively as well as excused above, so a tag page cannot
       drift into being indexable without this failing. 26 archives plus the
       8 pagination pages the five busiest tags need. */
    const archives = pages.filter(isTagArchive);
    expect(archives).toHaveLength(34);
    for (const page of archives) expect(robotsMetaOf(read(page))).toBe('follow, noindex');
  });
});

describe('the sitemap', () => {
  const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const urls = () => {
    const index = read('sitemap-index.xml');
    return locs(index).flatMap((child) =>
      locs(read(path.basename(new URL(child).pathname)))
    );
  };

  it('lists every URL on the final domain', () => {
    const all = urls();
    expect(all.length).toBeGreaterThan(50);
    expect(all.filter((u) => !u.startsWith(`${ORIGIN}/`))).toEqual([]);
  });

  it('excludes everything that is noindexed', () => {
    expect(urls().filter((u) => /\/(lp|thank-you|category\/blog)\//.test(u))).toEqual([]);
  });

  it('includes the pages that carry the business', () => {
    const all = urls();
    for (const path of ['/', '/about-us/', '/contact-us/', '/services/office-cleaning/']) {
      expect(all).toContain(`${ORIGIN}${path}`);
    }
  });

  it('every sitemapped URL was actually built', () => {
    for (const url of urls()) {
      const rel = new URL(url).pathname.replace(/^\//, '') + 'index.html';
      expect(pages).toContain(rel === 'index.html' ? 'index.html' : rel);
    }
  });
});

describe('the hostname-scoped noindex', () => {
  /* Reads public/_headers directly, so these run against the file that ships
     in both builds, and proves the matching the rules rely on. */
  const text = fs.readFileSync(path.join(repo, 'public', '_headers'), 'utf8');
  const noindexedOn = (host: string) => noindexedHosts(text).some((h) => hostMatches(h, host));

  it('noindexes staging', () => {
    expect(noindexedOn(PREVIEW_HOST)).toBe(true);
    const stage = parseHeaders(text).find((r) => ruleHost(r.url) === PREVIEW_HOST)!;
    expect(stage.headers['x-robots-tag']).toBe('noindex, nofollow, noarchive');
  });

  it('never noindexes www or the apex', () => {
    for (const host of PRODUCTION_HOSTS) expect(noindexedOn(host)).toBe(false);
  });

  it('noindexes workers.dev and its version previews, and nothing under the real zone', () => {
    expect(noindexedOn('evergreencleaningservice.ash-47a.workers.dev')).toBe(true);
    expect(noindexedOn('1a2b3c4d-evergreencleaningservice.ash-47a.workers.dev')).toBe(true);
    expect(noindexedOn('evergreencleaningservice.ca')).toBe(false);
    expect(noindexedOn('mail.evergreencleaningservice.ca')).toBe(false);
  });

  it('has no path-only rule carrying a robots header', () => {
    for (const rule of parseHeaders(text)) {
      if ('x-robots-tag' in rule.headers) expect(ruleHost(rule.url)).not.toBeNull();
    }
  });

  it('the checker refuses a sitewide noindex and one naming production', () => {
    expect(noindexProblems('/*\n  X-Robots-Tag: noindex\n', PRODUCTION_HOSTS)).toHaveLength(1);
    expect(
      noindexProblems('https://www.evergreencleaningservice.ca/*\n  X-Robots-Tag: noindex\n', PRODUCTION_HOSTS)
    ).toHaveLength(1);
    expect(
      noindexProblems('https://:sub.evergreencleaningservice.ca/*\n  X-Robots-Tag: noindex\n', PRODUCTION_HOSTS)
    ).toHaveLength(1);
    /* A path-only rule for something else is fine. */
    expect(noindexProblems('/*\n  X-Frame-Options: DENY\n', PRODUCTION_HOSTS)).toEqual([]);
  });
});

describe('the built /thank-you/ page is not a measurement point', () => {
  /* Rides this file's production build rather than paying for a second one.
     The rule is Phase 2 closeout's, not Phase 5's: the site has exactly one
     conversion event, pushed on the form after a 2xx, and a destination
     conversion on this URL would double-count every PPC lead. */
  it('carries no lead event of any name', () => {
    const html = read('thank-you/index.html');
    expect(html).not.toMatch(/lead_form_confirmed/);
    expect(html).not.toMatch(/lead_form_submission/);
  });

  it("the page's own script touches the dataLayer nowhere", () => {
    /* Deliberately narrow, and checked against the page's OWN bundle rather
       than the whole document. Two other things on this page do mention the
       data layer and both are correct: the GTM loader, which names it, and
       the landing layout's click-to-call handler, which pushes
       `click_to_call` from a click — a Phase 11 event, not a conversion, and
       not something a page load can fire. What must be empty is the script
       that runs when /thank-you/ opens. */
    const entry = read('thank-you/index.html').match(
      /src="\/_astro\/(thank-you\.astro[^"]+\.js)"/
    )?.[1];
    expect(entry).toBeTruthy();

    /* Follow the imports: the entry chunk is two lines and everything it
       does is in the modules it pulls in, so reading only the entry would
       prove nothing. */
    const seen = new Set<string>();
    const collect = (name: string): string => {
      if (seen.has(name)) return '';
      seen.add(name);
      const code = fs.readFileSync(path.join(out, '_astro', name), 'utf8');
      const deps = [...code.matchAll(/["']\.\/([A-Za-z0-9._-]+\.js)["']/g)].map((m) => m[1]);
      return code + deps.map(collect).join('');
    };
    const bundle = collect(entry!);

    expect(bundle).not.toMatch(/dataLayer/);
    /* and it really is the confirmation logic that got bundled */
    expect(bundle).toContain('ecs_lead_confirmed_v1');
    expect(bundle).toMatch(/sessionStorage/);
  });

  it('no page on the site emits lead_form_confirmed any more', () => {
    for (const page of pages) expect(read(page)).not.toContain('lead_form_confirmed');
  });

  it('the conversion event ships in exactly one bundled module', () => {
    const scripts = fs
      .readdirSync(path.join(out, '_astro'))
      .filter((f) => f.endsWith('.js'))
      .filter((f) =>
        fs.readFileSync(path.join(out, '_astro', f), 'utf8').includes('lead_form_submission')
      );
    expect(scripts).toHaveLength(1);
  });
});

describe('the two builds cannot be confused', () => {
  const scripts = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).scripts;

  it('neither build adds a noindex step — _headers from public/ is the only source', () => {
    for (const name of ['build', 'build:preview']) expect(scripts[name]).not.toMatch(/noindex/);
    expect(fs.existsSync(path.join(repo, 'scripts', 'noindex.mjs'))).toBe(false);
  });

  it('only the production build runs the captcha gates', () => {
    expect(scripts.build).toContain('preflight');
    expect(scripts.build).toContain('captcha:check');
    expect(scripts['build:preview']).not.toContain('preflight');
    expect(scripts['build:preview']).not.toContain('captcha:check');
  });

  it('the site URL is the final domain, not the staging host', () => {
    const config = fs.readFileSync(path.join(repo, 'astro.config.mjs'), 'utf8');
    expect(config).toContain(`site: '${ORIGIN}'`);
    expect(config).not.toContain(PREVIEW_HOST);
  });
});

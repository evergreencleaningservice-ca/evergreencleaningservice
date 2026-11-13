/**
 * One title rule, sitewide (13 Nov 2026, SEO audit 11 Nov, onpage.md N4).
 *
 * The audit found four suffix forms live at once (" | Evergreen", " - Evergreen",
 * " - Evergreen Office Cleaning", " | Evergreen Office Cleaning") and ten
 * indexable titles with no brand, several of them short enough to carry it.
 * Each form came from a different path to the <title>: pageTitle(), a stored
 * seoTitle with the brand typed in, a hand-set title that skipped pageTitle().
 * This walks the built site so a new path cannot bring a fifth form back.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pageTitle, TITLE_LIMIT, TITLE_SUFFIX } from '../../src/lib/title';
import { isPrivatePage } from './private-pages';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, '.astro-test-dist-titles');

/** The homepage title is written whole, at 61 characters (src/pages/index.astro). */
const HOME_TITLE = 'Commercial Cleaning Company in Toronto Since 1989 | Evergreen';

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

interface Page {
  url: string;
  title: string;
  indexable: boolean;
  /** The page's first <h1>, tags stripped and decoded. */
  h1: string;
  /** The BlogPosting headline, on posts. */
  headline?: string;
}

/** A blog post's front matter as the title rule sees it. */
interface Post {
  slug: string;
  title: string;
  seoTitle?: string;
}
const blogDir = path.join(root, 'src/content/blog');
/* Every title and seoTitle is a double-quoted YAML string, which JSON reads the same way. */
const posts: Post[] = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = fs.readFileSync(path.join(blogDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)![1];
    const field = (name: string) => {
      const raw = fm.match(new RegExp(`^${name}:\\s*(".*")\\s*$`, 'm'))?.[1];
      return raw === undefined ? undefined : (JSON.parse(raw) as string);
    };
    return { slug: f.replace(/\.md$/, ''), title: field('title')!, seoTitle: field('seoTitle') };
  });

/**
 * The 13 Nov 2026 title/H1 split (comparison with impact.ca): posts whose H1 is
 * phrased for readers while people search other words. Pinned so a later pass
 * changes them on purpose. The reasons are in
 * evergreencleaningservice.ca-audit/reaudit-2026-11-11/titles-before-after.md.
 */
const SPLIT_13_NOV: Record<string, string> = {
  '/5-cleaning-tips-to-help-make-your-office-relocation-seamless/': 'Office Move-Out Cleaning: 5 Tips for Relocating | Evergreen',
  '/day-night-which-is-the-best-routine-for-your-office/': 'Day vs Night Office Cleaning: Benefits of Each | Evergreen',
  '/keep-your-office-at-home-clean/': 'Home Office Cleaning: 3 Simple Tips | Evergreen',
  '/how-to-decide-on-a-cleaning-company/': 'How to Choose a Commercial Cleaning Company | Evergreen',
  '/ask-the-office-cleaners-cleaning-break-rooms/': 'Office Break Room Cleaning: Furniture and Carpet | Evergreen',
};
let pages: Page[] = [];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out], {
    cwd: root,
    encoding: 'utf8',
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
  pages = walk(out)
    .filter((file) => !isPrivatePage(file, out))
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8');
      const url = '/' + path.relative(out, file).split(path.sep).join('/').replace(/index\.html$/, '');
      const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
      const h1 = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, '')).trim();
      const headline = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .flatMap((m) => {
          try {
            const data = JSON.parse(m[1]);
            return Array.isArray(data) ? data : data['@graph'] ?? [data];
          } catch {
            return [];
          }
        })
        .find((node) => node?.['@type'] === 'BlogPosting')?.headline as string | undefined;
      return {
        url,
        title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
        indexable: !/noindex/.test(robots),
        h1,
        headline,
      };
    });
}, 180_000);

afterAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

describe('pageTitle()', () => {
  it('adds " | Evergreen" when the result is 60 characters or fewer', () => {
    expect(pageTitle('Contact Us')).toBe('Contact Us | Evergreen');
    const fits = 'x'.repeat(TITLE_LIMIT - TITLE_SUFFIX.length);
    expect(pageTitle(fits)).toBe(`${fits} | Evergreen`);
    expect(pageTitle(fits).length).toBe(TITLE_LIMIT);
  });

  it('leaves a longer title whole: no other suffix, no truncation', () => {
    const long = 'x'.repeat(TITLE_LIMIT - TITLE_SUFFIX.length + 1);
    expect(pageTitle(long)).toBe(long);
  });
});

describe('every built page title', () => {
  it('finds the site', () => {
    expect(pages.filter((p) => p.indexable).length).toBeGreaterThan(55);
  });

  it('is 60 characters or fewer and branded wherever the brand fits, on every indexable page', () => {
    const problems: string[] = [];
    for (const { url, title, indexable } of pages) {
      if (!indexable) continue;
      if (url === '/') {
        if (title !== HOME_TITLE) problems.push(`/ changed: ${title}`);
        continue;
      }
      if (!title) problems.push(`${url} has no title`);
      if (title.length > TITLE_LIMIT) problems.push(`${url} is ${title.length}: ${title}`);
      if (!title.endsWith(TITLE_SUFFIX) && `${title}${TITLE_SUFFIX}`.length <= TITLE_LIMIT) {
        problems.push(`${url} has room for the brand and lacks it: ${title}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('uses no other suffix form and never doubles the brand, on any page', () => {
    /* The two data-driven landing pages (noindex, paid traffic) take their
       titles from src/data/landing-pages.ts, which still types in "| Evergreen
       Office Cleaning". Left for that file's owner; remove these entries when
       lp/[slug].astro passes its titles through pageTitle(). */
    const pending = new Set(['/lp/office-cleaning/', '/lp/post-construction-cleaning/']);
    const problems = pages
      .filter(({ url }) => !pending.has(url))
      .filter(({ title }) =>
        / [-–—] Evergreen/.test(title) ||
        /\| Evergreen Office Cleaning/.test(title) ||
        title.split(TITLE_SUFFIX).length > 2
      )
      .map(({ url, title }) => `${url}: ${title}`);
    expect(problems).toEqual([]);
  });

  it('brands the location pages where the rule fits, never shortening a place name', () => {
    const locations = pages.filter((p) => /^\/locations\/[^/]+\/$/.test(p.url));
    expect(locations.length).toBe(11);
    for (const { url, title } of locations) expect(title, url).toMatch(/^Office & Commercial Cleaning in /);
    const unbranded = locations.filter((p) => !p.title.endsWith(TITLE_SUFFIX)).map((p) => p.url).sort();
    expect(unbranded).toEqual(['/locations/durham-region/', '/locations/vaughan/']);
  });
});

/*
 * 13 Nov 2026 (comparison with impact.ca): a post's <title> may lead with the
 * search query while its H1 stays phrased for readers. That split is made only
 * through seoTitle, so a post without one shows its H1 as its title, and the
 * H1 and the BlogPosting headline never move with the <title>.
 */
describe('blog post titles and H1s', () => {
  const page = (slug: string) => pages.find((p) => p.url === `/${slug}/`);

  it('finds every post in the build', () => {
    expect(posts.length).toBeGreaterThan(20);
    expect(posts.filter((p) => !page(p.slug)).map((p) => p.slug)).toEqual([]);
  });

  it('differ only where a seoTitle is set; the H1 and schema headline stay the post title', () => {
    const problems: string[] = [];
    for (const post of posts) {
      const built = page(post.slug);
      if (!built) continue;
      if (built.h1 !== post.title) problems.push(`${post.slug}: H1 "${built.h1}" is not the title "${post.title}"`);
      if (built.headline !== post.title) problems.push(`${post.slug}: headline "${built.headline}" is not the title`);
      const expected = pageTitle(post.seoTitle ?? post.title);
      if (built.title !== expected) problems.push(`${post.slug}: <title> "${built.title}", expected "${expected}"`);
      if (post.seoTitle && built.title === pageTitle(post.title) && post.seoTitle !== post.title) {
        problems.push(`${post.slug}: seoTitle set but the <title> is the H1's`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('keeps the 13 Nov split titles as written', () => {
    for (const [url, title] of Object.entries(SPLIT_13_NOV)) {
      expect(pages.find((p) => p.url === url)?.title, url).toBe(title);
    }
  });
});

describe('titles across the site', () => {
  it('are unique: no two built pages share a <title>', () => {
    const seen = new Map<string, string[]>();
    for (const { url, title } of pages) seen.set(title, [...(seen.get(title) ?? []), url]);
    const dupes = [...seen].filter(([, urls]) => urls.length > 1).map(([title, urls]) => `${title}: ${urls.join(', ')}`);
    expect(dupes).toEqual([]);
  });
});

// @ts-check
/**
 * `<lastmod>` for the sitemap, from real content dates — never the build time.
 *
 * Search engines use lastmod to decide what to recrawl, and they learn to
 * ignore a sitemap whose every date is "now": a build stamp says every page
 * changed on every deploy, which is the same as saying nothing. So each URL
 * gets the date its content last changed:
 *
 *   a blog post      its `pubDate` (posts carry no separate updated date)
 *   /insights/       the newest post's `pubDate`
 *   everything else  the last commit touching the files the page is made
 *                    from — its content file, its page template, or the
 *                    data file it reads (`SOURCES` below)
 *
 * A date that cannot be known is LEFT OUT rather than guessed. That happens in
 * a shallow clone: a file last changed before the clone's history begins
 * reports the boundary commit's date, which is a date the file did not change
 * on. Those URLs simply have no lastmod; `git fetch --unshallow` before a
 * deploy gives every URL its date.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BLOG = path.join(ROOT, 'src/content/blog');

const git = (/** @type {string[]} */ args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

/** Commits at a shallow clone's boundary; their dates are not the files'. */
const boundary = new Set(
  (() => {
    const file = git(['rev-parse', '--git-path', 'shallow']);
    try {
      return fs.readFileSync(path.resolve(ROOT, file), 'utf8').split('\n').filter(Boolean);
    } catch {
      return [];
    }
  })(),
);

/** The newest commit date across `files`, or undefined when unknowable. */
const lastCommit = (/** @type {string[]} */ files) => {
  const existing = files.filter((f) => fs.existsSync(path.join(ROOT, f)));
  if (!existing.length) return undefined;
  const [hash, date] = git(['log', '-1', '--format=%H %cI', '--', ...existing]).split(' ');
  if (!hash || boundary.has(hash)) return undefined;
  return date;
};

/** Every post's pubDate, keyed by slug. */
const postDates = new Map(
  fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const front = fs.readFileSync(path.join(BLOG, f), 'utf8').split('\n---')[0];
      const m = front.match(/^pubDate:\s*['"]?([\d-]+(?:T[\d:.]+Z?)?)/m);
      return [f.replace(/\.md$/, ''), m ? new Date(m[1]).toISOString() : undefined];
    }),
);

const newestPost = [...postDates.values()].filter(Boolean).sort().at(-1);

/** The files a non-post page is made from, by path. */
const SOURCES = (/** @type {string} */ p) => {
  const parts = p.split('/').filter(Boolean);
  if (!parts.length) return ['src/pages/index.astro', 'src/components/home'];
  const [first, slug] = parts;
  if (first === 'services' || first === 'industries') {
    return slug
      ? [`src/content/${first}/${slug}.md`, `src/pages/${first}/[slug].astro`, 'src/components/OfferPage.astro']
      : [`src/pages/${first}/index.astro`, `src/content/${first}`];
  }
  if (first === 'locations') {
    return slug
      ? ['src/data/locations.ts', 'src/pages/locations/[slug].astro']
      : ['src/pages/locations/index.astro', 'src/data/locations.ts'];
  }
  if (first === 'projects') return ['src/pages/projects', 'src/content/projects'];
  return [`src/pages/${first}.astro`, `src/content/pages/${first}.md`];
};

/** The lastmod for a sitemap URL, or undefined to omit it. */
export function lastmodFor(/** @type {string} */ url) {
  const p = new URL(url).pathname;
  const slug = p.replace(/^\/|\/$/g, '');
  if (postDates.has(slug)) return postDates.get(slug);
  if (p === '/insights/') return newestPost;
  return lastCommit(SOURCES(p));
}

/**
 * Whether a sitemap URL belongs in the insights sitemap: a blog post or the
 * /insights/ hub (SEO audit M2, 28 Oct 2026). Everything else goes in pages.
 */
export function isInsightsUrl(/** @type {string} */ url) {
  const p = new URL(url).pathname;
  return p === '/insights/' || postDates.has(p.replace(/^\/|\/$/g, ''));
}

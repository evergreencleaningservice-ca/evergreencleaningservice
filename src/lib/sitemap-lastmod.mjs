// @ts-check
/**
 * `<lastmod>` for the sitemap, from real content dates — never the build time.
 *
 * Search engines use lastmod to decide what to recrawl, and they learn to
 * ignore a sitemap whose every date is "now": a build stamp says every page
 * changed on every deploy, which is the same as saying nothing. So each URL
 * gets the date its content last changed:
 *
 *   a blog post      its `updatedDate`, or its `pubDate` if it has none
 *   a service or     the newer of its content file's last commit and the
 *   industry page    date it moved to the root (below)
 *   /insights/       the newest of those
 *   a location page  its own `updated` field in src/data/locations.ts
 *   a section hub    its own date in src/data/hub-dates.ts, or the newest
 *                    of that and its members' dates where it shows their
 *                    content (/services/, /locations/; the rule is there)
 *   everything else  the last commit touching the page's own files: its
 *                    content file, or its page file where the page is
 *                    written there (`SOURCES` below)
 *
 * WHAT DOES NOT COUNT (6 Nov 2026, SEO audit item 29). Shared templates and
 * shared data: OfferPage.astro and the [slug].astro routes, the layouts, and
 * locations.ts and location-local.ts as whole files. They used to be in the
 * sources, so "Shrink the quote forms" on 31 Oct gave 16 service, industry
 * and location pages one timestamp, and a change to one city re-dated every
 * city. A template edit that does change what a page says should go into
 * that page's own content file (or, for a location, its `updated` field).
 * Nor do the hubs' page files: they hold markup and styles as well as words,
 * and a styling commit (#81, 6 Nov) gave /locations/ and /industries/ one
 * timestamp through them.
 *
 * The same date is the WebPage `dateModified` on the service, industry and
 * location pages (OfferPage.astro, locations/[slug].astro), so the schema and
 * the sitemap cannot disagree.
 *
 * THE URL MOVE (13 Nov 2026, owner decision). The 13 service and industry
 * pages moved from /services/<slug>/ and /industries/<slug>/ to /<slug>/.
 * A page at a new address is a changed page to a crawler, so each one's
 * lastmod is at least the move's own date, OFFER_URLS_MOVED in
 * src/data/offer-pages.ts: one dated field, as a hub has, rather than an
 * edit to 13 content files made only to move their commit dates. A later
 * edit to a page's own content file dates it as before.
 *
 * A date that cannot be known is LEFT OUT rather than guessed. That happens in
 * a shallow clone: a file last changed before the clone's history begins
 * reports the boundary commit's date, which is a date the file did not change
 * on. Those URLs simply have no lastmod; `git fetch --unshallow` before a
 * deploy gives every URL its date. Since 6 Nov 2026 the build test
 * (tests/build/indexability.test.ts) fails when any URL has no lastmod, and
 * the deploy scripts run the tests first.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { locations } from '../data/locations.ts';
import { HUB_UPDATED } from '../data/hub-dates.ts';
import { OFFER_URLS_MOVED, offerCollection, offerPath } from '../data/offer-pages.ts';

const ROOT = process.cwd();
const BLOG = path.join(ROOT, 'src/content/blog');
const SERVICES = path.join(ROOT, 'src/content/services');

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

/** Every post's updatedDate, or pubDate if it has none, keyed by slug. */
const postDates = new Map(
  fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const front = fs.readFileSync(path.join(BLOG, f), 'utf8').split('\n---')[0];
      const m =
        front.match(/^updatedDate:\s*['"]?([\d-]+(?:T[\d:.]+Z?)?)/m) ??
        front.match(/^pubDate:\s*['"]?([\d-]+(?:T[\d:.]+Z?)?)/m);
      return [f.replace(/\.md$/, ''), m ? new Date(m[1]).toISOString() : undefined];
    }),
);

const newestPost = [...postDates.values()].filter(Boolean).sort().at(-1);

/**
 * Each location's `updated` field, keyed by slug. A value that is not a date
 * stops the build: a typo here would otherwise drop or garble the page's date
 * without anyone seeing it.
 */
const locationDates = new Map(
  locations.map((l) => {
    if (l.updated === undefined) return [l.slug, undefined];
    const ms = Date.parse(l.updated);
    if (Number.isNaN(ms)) throw new Error(`src/data/locations.ts: ${l.slug} has updated '${l.updated}', which is not a date`);
    return [l.slug, new Date(ms).toISOString()];
  }),
);

/** Each hub's own date, checked the same way. */
const hubDates = new Map(
  Object.entries(HUB_UPDATED).map(([hub, date]) => {
    const ms = Date.parse(date);
    if (Number.isNaN(ms)) throw new Error(`src/data/hub-dates.ts: ${hub} has '${date}', which is not a date`);
    return [hub, new Date(ms).toISOString()];
  }),
);

/** The URL move's date, checked the same way. */
const movedDate = (() => {
  const ms = Date.parse(OFFER_URLS_MOVED);
  if (Number.isNaN(ms)) throw new Error(`src/data/offer-pages.ts: OFFER_URLS_MOVED is '${OFFER_URLS_MOVED}', which is not a date`);
  return new Date(ms).toISOString();
})();

/** The newest of `dates`, or undefined when any of them is unknowable. */
const newest = (/** @type {(string | undefined)[]} */ dates) =>
  dates.every(Boolean)
    ? /** @type {string[]} */ (dates).reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b))
    : undefined;

/**
 * The files whose last commit dates a page, by path: the page's own files
 * and nothing it shares with other pages. Exported for the build test, which
 * holds it to that.
 */
export const SOURCES = (/** @type {string} */ p) => {
  const parts = p.split('/').filter(Boolean);
  if (!parts.length) return ['src/pages/index.astro', 'src/components/home'];
  const [first, slug] = parts;
  /* A hub, and a location page, has no file of its own to date it by: a
     date field does (lastmodFor). */
  if (!slug && hubDates.has(p)) return [];
  /* A service or industry page, at the root since 13 Nov 2026. */
  const collection = slug ? undefined : offerCollection(first);
  if (collection) return [`src/content/${collection}/${first}.md`];
  if (first === 'locations') return [];
  if (first === 'projects') return ['src/pages/projects', 'src/content/projects'];
  return [`src/pages/${first}.astro`, `src/content/pages/${first}.md`];
};

/**
 * The pages whose dates a hub's date includes, because it shows their
 * content (src/data/hub-dates.ts says why /industries/ has none). Exported
 * for the build test.
 */
export const HUB_MEMBERS = (/** @type {string} */ hub) => {
  if (hub === '/services/') {
    return fs
      .readdirSync(SERVICES)
      .filter((f) => f.endsWith('.md'))
      .map((f) => offerPath(f.replace(/\.md$/, '')));
  }
  if (hub === '/locations/') return locations.map((l) => `/locations/${l.slug}/`);
  return [];
};

/** The lastmod for a sitemap URL, or undefined to omit it. */
export function lastmodFor(/** @type {string} */ url) {
  const p = new URL(url).pathname;
  const slug = p.replace(/^\/|\/$/g, '');
  if (postDates.has(slug)) return postDates.get(slug);
  if (p === '/insights/') return newestPost;
  const location = p.match(/^\/locations\/([^/]+)\/$/)?.[1];
  /* The two data files' last commit is only the fallback for an entry
     without an `updated` field; it re-dates every location at once. */
  if (location) return locationDates.get(location) ?? lastCommit(['src/data/locations.ts', 'src/data/location-local.ts']);
  if (offerCollection(slug)) return newest([lastCommit(SOURCES(p)), movedDate]);
  if (hubDates.has(p)) {
    return newest([hubDates.get(p), ...HUB_MEMBERS(p).map((m) => lastmodFor(new URL(m, url).href))]);
  }
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

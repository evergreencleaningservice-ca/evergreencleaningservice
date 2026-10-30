/**
 * Posts published from /admin/blog/create-blog/, served live from Neon.
 *
 * The site is static, and a post written in the admin is in the database, not
 * the repo. So the Worker serves it, the way stage.workweartoronto.com serves
 * Rana's posts ("instant" in her SITES): the moment it is published it is at
 * its address and on the blog list, with no rebuild.
 *
 * THE PAGE. The build makes one real post page with placeholder content,
 * /eg-live-post-shell/ (src/pages/eg-live-post-shell.astro), from the same
 * PostLayout every repo post uses: the header, footer, sidebar, comments,
 * fonts and tags are the site's own. `fillShell` swaps the placeholders for
 * the post. The shell is never served at its own address.
 *
 * THE LISTS. /insights/ (page one), /sitemap-insights-0.xml and /rss.xml get the live
 * posts added ahead of the repo's. The list entries copy the page's own
 * scoped-style attribute, so they look exactly like the entries beside them.
 *
 * COST. Only a path shaped like a post (/<slug>/) that no file answers ever
 * reaches a lookup, and the list of live slugs is kept for 30 seconds per
 * Worker instance, so a crawler's 404s do not wake the database. A database
 * that cannot be reached, or a table not yet created, reads as "no live
 * posts": the static site is never broken by this.
 */
import { pageTitle } from '../title';
import { articleSchema, breadcrumbSchema } from '../schema';
import { site } from '../../data/site';
import { esc } from './blocks';
import type { Sql } from '../posts-sync';

export const SHELL_PATH = '/eg-live-post-shell/';
export const SHELL = {
  slug: 'eg-live-post-shell',
  title: 'EG_SHELL_TITLE',
  description: 'EG_SHELL_DESCRIPTION',
  body: 'EG_SHELL_BODY',
  date: '2000-01-01T00:00:00.000Z',
  /* The visible date under the title (PostLayout) renders the same date as a
     day and as words; both are placeholders too. */
  day: '2000-01-01',
  dateLabel: 'January 1, 2000',
} as const;

/** The visible date, worded as PostLayout words it. */
export const dateLabel = (d: Date) =>
  d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export interface LivePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  image: string | null;
  image_alt: string | null;
  html: string;
  published_at: string;
}

export type LiveSummary = Omit<LivePost, 'html' | 'tags'>;

/** A path that could be a post: /<slug>/ and nothing more. */
export const postSlugOf = (pathname: string): string | null => {
  const m = pathname.match(/^\/([a-z0-9][a-z0-9-]{0,79})\/$/);
  return m && m[1] !== SHELL.slug ? m[1] : null;
};

// ------------------------------------------------------------ the cache ---

const TTL_MS = 30_000;
const lists = new Map<string, { at: number; posts: LiveSummary[] }>();
const pages = new Map<string, { at: number; post: LivePost | null }>();

/** Forget everything for one database, after a publish. */
export function forgetLive(dbKey?: string) {
  if (!dbKey) {
    lists.clear();
    pages.clear();
    return;
  }
  lists.delete(dbKey);
  for (const k of [...pages.keys()]) if (k.startsWith(`${dbKey} `)) pages.delete(k);
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : new Date(String(v)).toISOString());

/** The live posts, newest first. */
export async function livePosts(sql: Sql, dbKey: string, now = Date.now()): Promise<LiveSummary[]> {
  const kept = lists.get(dbKey);
  if (kept && now - kept.at < TTL_MS) return kept.posts;
  let posts: LiveSummary[] = [];
  try {
    const rows = await sql`
      SELECT slug, title, excerpt, image, image_alt, published_at
        FROM admin_posts
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT 500
    `;
    posts = rows.map((r) => ({
      slug: String(r.slug),
      title: String(r.title),
      excerpt: String(r.excerpt ?? ''),
      image: (r.image as string | null) ?? null,
      image_alt: (r.image_alt as string | null) ?? null,
      published_at: iso(r.published_at),
    }));
  } catch (err) {
    console.warn('live-posts: list unavailable', String(err));
  }
  lists.set(dbKey, { at: now, posts });
  return posts;
}

/** One live post, or null. Looked up only when the list says it exists. */
export async function livePost(sql: Sql, dbKey: string, slug: string, now = Date.now()): Promise<LivePost | null> {
  const list = await livePosts(sql, dbKey, now);
  if (!list.some((p) => p.slug === slug)) return null;
  const key = `${dbKey} ${slug}`;
  const kept = pages.get(key);
  if (kept && now - kept.at < TTL_MS) return kept.post;
  let post: LivePost | null = null;
  try {
    const rows = await sql`
      SELECT slug, title, excerpt, tags, image, image_alt, html, published_at
        FROM admin_posts
       WHERE status = 'published' AND slug = ${slug}
       LIMIT 1
    `;
    const r = rows[0];
    if (r) {
      post = {
        slug: String(r.slug),
        title: String(r.title),
        excerpt: String(r.excerpt ?? ''),
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        image: (r.image as string | null) ?? null,
        image_alt: (r.image_alt as string | null) ?? null,
        html: String(r.html ?? ''),
        published_at: iso(r.published_at),
      };
    }
  } catch (err) {
    console.warn('live-posts: post unavailable', String(err));
  }
  pages.set(key, { at: now, post });
  return post;
}

// ------------------------------------------------------------- the page ---

/** A value inside a JSON-LD script: JSON-escaped, and never able to close the script. */
const jsonText = (v: string) => JSON.stringify(v).slice(1, -1).replace(/</g, '\\u003c');
const jsonLd = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

/** Astro's scoped-style attributes on the first tag matching `open`, e.g. ` data-astro-cid-abc123`. */
const cidOf = (html: string, open: RegExp): string => {
  const tag = html.match(open)?.[0] ?? '';
  return [...tag.matchAll(/\s(data-astro-cid-[a-z0-9]+)(?:="")?/g)].map((m) => ` ${m[1]}`).join('');
};

/**
 * The shell page with the post in it. Every placeholder is replaced in the
 * context it sits in: escaped for HTML in the page, JSON-escaped in the
 * structured data, which is rebuilt from the post outright.
 */
export function fillShell(shell: string, post: LivePost): string {
  const description = post.excerpt || site.description;
  const pubDate = new Date(post.published_at);
  const article = { ...articleSchema({ title: post.title, description, pubDate, slug: post.slug }), ...(post.image ? { image: post.image } : {}) };
  const crumbs = breadcrumbSchema([
    { name: site.name, url: '/' },
    { name: 'Insights', url: '/insights/' },
    { name: post.title },
  ]);

  let html = shell.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (whole, body: string) => {
    if (!body.includes(SHELL.slug) && !body.includes(SHELL.title)) return whole;
    const data = body.includes('BreadcrumbList') ? crumbs : article;
    return `<script type="application/ld+json">${jsonLd(data)}</script>`;
  });

  // The shell is noindex so the template itself is never indexed; the post is not.
  html = html.replace(/<meta name="robots" content="noindex[^"]*">\s*/, '');

  if (post.image) {
    html = html
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(post.image)}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(post.image)}$2`);
  }

  // The picture at the top, unless the body already shows it (a thumbnail
  // taken from the post's own first image would otherwise appear twice).
  if (post.image && !post.html.includes(`src="${esc(post.image)}"`)) {
    const cid = cidOf(html, /<article class="entry-content"[^>]*>/);
    const featured = `<div class="post-featured"${cid}><picture${cid}><img src="${esc(post.image)}" alt="${esc(post.image_alt ?? '')}" width="1200" height="600" decoding="async"${cid}></picture></div>`;
    html = html.replace(/<article class="entry-content"/, `${featured}\n<article class="entry-content"`);
  }

  // One pass, longest placeholder first, so nothing the post itself says can
  // be read as a placeholder by a later replacement.
  const values = new Map<string, string>([
    [pageTitle(SHELL.title), esc(pageTitle(post.title))],
    [SHELL.title, esc(post.title)],
    [SHELL.description, esc(description)],
    [SHELL.date, pubDate.toISOString()],
    [SHELL.day, pubDate.toISOString().slice(0, 10)],
    [SHELL.dateLabel, dateLabel(pubDate)],
    [SHELL.slug, post.slug],
    [SHELL.body, post.html],
  ]);
  const pattern = new RegExp([...values.keys()].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return html.replace(pattern, (m) => values.get(m)!);
}

/** What the shell must hold for fillShell to work; the build test checks the built page against it. */
export const shellProblems = (shell: string): string[] => {
  const problems: string[] = [];
  if (!shell.includes(pageTitle(SHELL.title))) problems.push('the full title');
  if ((shell.match(new RegExp(SHELL.body, 'g')) ?? []).length !== 1) problems.push('exactly one body placeholder');
  if (!/<article class="entry-content"/.test(shell)) problems.push('article.entry-content');
  if (!/<meta name="robots" content="noindex/.test(shell)) problems.push('the robots noindex');
  if (!shell.includes(SHELL.description)) problems.push('the description');
  if (!shell.includes(`data-post-slug="${SHELL.slug}"`)) problems.push('the comment form slug');
  if (!/<meta property="og:image" content="/.test(shell)) problems.push('og:image');
  if (!/BreadcrumbList/.test(shell) || !/BlogPosting/.test(shell)) problems.push('the structured data');
  return problems;
};

// ------------------------------------------------------------ the lists ---

/** The list entries for /insights/, in PostList's own markup and scoped styles. */
export function injectList(html: string, posts: LiveSummary[]): string {
  if (!posts.length) return html;
  const first = html.match(/<article class="list-article"[^>]*>/);
  if (!first) return html;
  const c = cidOf(first[0], /^.*$/s);
  const items = posts
    .map((p, i) => {
      const href = `/${p.slug}/`;
      const thumb = p.image
        ? `<div class="list-article-thumb"${c}><a href="${href}" tabindex="-1" aria-hidden="true"${c}><img src="${esc(p.image)}" alt="" width="300" height="150" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"${c}></a></div>`
        : '';
      return `<article class="list-article"${c}>${thumb}<div class="list-article-content"${c}><div class="list-article-meta"${c}><a href="/category/blog/" rel="category tag"${c}>Blog</a></div><header class="entry-header"${c}><h2 class="entry-title"${c}><a href="${href}" rel="bookmark"${c}>${esc(p.title)}</a></h2></header><div class="entry-excerpt"${c}><p${c}>${esc(p.excerpt)}</p></div></div></article>`;
    })
    .join('');
  return html.replace(first[0], `${items}${first[0]}`);
}

// ------------------------------------------------------------ serving ---

export interface ServeEnv {
  ASSETS: Fetcher;
  DATABASE_URL?: string;
  STAGING_DATABASE_URL?: string;
}

/** The lists that carry live posts. They run the Worker first (wrangler.jsonc `run_worker_first`). */
export const LIST_PATHS = new Set(['/insights/', '/sitemap-insights-0.xml', '/rss.xml']);

/**
 * A response the Worker built from an asset: the asset's headers, minus the
 * ones that described the old body. `_headers` rules apply only to files the
 * asset router serves itself, so a non-production host's noindex is set here
 * too, as public/_headers sets it there.
 */
function rebuilt(body: string, from: Response, host: string, production: boolean, type?: string): Response {
  const headers = new Headers(from.headers);
  for (const h of ['content-length', 'etag', 'last-modified', 'content-encoding']) headers.delete(h);
  if (type) headers.set('content-type', type);
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  if (!production || host.endsWith('.workers.dev')) headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
  return new Response(body, { status: 200, headers });
}

/**
 * Everything that is not the forms or the admin: the static site, with the
 * live posts at their addresses and on the lists.
 */
export async function serveSite(
  request: Request,
  env: ServeEnv,
  open: (url: string) => Sql,
  dbFor: (host: string) => { url?: string; key: string; production: boolean }
): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') return env.ASSETS.fetch(request);

  // The template is never a page of its own.
  if (url.pathname.startsWith(SHELL_PATH)) return env.ASSETS.fetch(new Request(`${url.origin}/eg-no-such-page/`));

  const res = await env.ASSETS.fetch(request);
  const db = dbFor(url.hostname);
  if (!db.url) return res;

  if (LIST_PATHS.has(url.pathname)) {
    if (!res.ok) return res;
    const posts = await livePosts(open(db.url), db.key);
    if (!posts.length) return res;
    const text = await res.text();
    const out =
      url.pathname === '/insights/' ? injectList(text, posts) : url.pathname === '/rss.xml' ? injectRss(text, posts) : injectSitemap(text, posts);
    return rebuilt(method === 'HEAD' ? '' : out, res, url.hostname, db.production);
  }

  if (res.status !== 404) return res;
  const bare = url.pathname.match(/^\/([a-z0-9][a-z0-9-]{0,79})$/);
  const slug = postSlugOf(url.pathname) ?? bare?.[1] ?? null;
  if (!slug) return res;
  const post = await livePost(open(db.url), db.key, slug);
  if (!post) return res;
  if (bare) return Response.redirect(`${url.origin}/${slug}/${url.search}`, 301);

  const shell = await env.ASSETS.fetch(new Request(`${url.origin}${SHELL_PATH}`));
  if (!shell.ok) {
    console.error(`live-posts: the shell page answered ${shell.status}`);
    return res;
  }
  const html = fillShell(await shell.text(), post);
  return rebuilt(method === 'HEAD' ? '' : html, shell, url.hostname, db.production, 'text/html; charset=utf-8');
}

const xml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export function injectSitemap(text: string, posts: LiveSummary[]): string {
  if (!posts.length || !text.includes('</urlset>')) return text;
  const urls = posts.map((p) => `<url><loc>${xml(`${site.url}/${p.slug}/`)}</loc><lastmod>${p.published_at}</lastmod></url>`).join('');
  return text.replace('</urlset>', `${urls}</urlset>`);
}

export function injectRss(text: string, posts: LiveSummary[]): string {
  if (!posts.length || !text.includes('</channel>')) return text;
  const items = posts
    .map((p) => {
      const link = xml(`${site.url}/${p.slug}/`);
      return `<item><title>${xml(p.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><description>${xml(p.excerpt)}</description><pubDate>${new Date(p.published_at).toUTCString()}</pubDate></item>`;
    })
    .join('');
  const at = text.indexOf('<item>');
  return at === -1 ? text.replace('</channel>', `${items}</channel>`) : `${text.slice(0, at)}${items}${text.slice(at)}`;
}

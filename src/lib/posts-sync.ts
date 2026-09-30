/**
 * Mirrors the blog into the `posts` table (migrations/0008_posts.sql).
 *
 * The Markdown in src/content/blog/ is the master copy. Every build publishes
 * it as /data/blog-posts.json; the Worker's scheduled handler reads that from
 * its own assets and calls `syncPosts` once per Neon branch. Nothing renders
 * from the table, so a failed sync leaves the database stale, never the site
 * broken.
 *
 * Pure apart from the `sql` it is handed, so it is tested with a fake one.
 */

export interface PostRow {
  slug: string;
  url: string;
  title: string;
  description: string | null;
  pub_date: string;
  image: string | null;
  image_alt: string | null;
  tags: string[];
  body_markdown: string;
}

export type Sql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

export interface SyncResult {
  upserted: number;
  deleted: number;
  unchanged: number;
}

const str = (v: unknown) => typeof v === 'string';
const strOrNull = (v: unknown) => v === null || typeof v === 'string';

/**
 * Reads the build's JSON and refuses anything that is not a complete list.
 *
 * The refusal matters more than it looks: the sync deletes every slug not in
 * the list, so a truncated or empty file would otherwise empty the table.
 */
export function parsePosts(json: unknown): PostRow[] {
  const doc = json as { count?: unknown; posts?: unknown };
  if (!doc || !Array.isArray(doc.posts)) throw new Error('blog-posts.json has no posts array');
  if (doc.posts.length === 0) throw new Error('blog-posts.json lists zero posts; refusing to sync');
  if (doc.count !== doc.posts.length)
    throw new Error(`blog-posts.json says ${String(doc.count)} posts but holds ${doc.posts.length}`);

  for (const p of doc.posts as Record<string, unknown>[]) {
    const ok =
      str(p.slug) && (p.slug as string).length > 0 && str(p.url) && str(p.title) &&
      strOrNull(p.description) && str(p.pub_date) && !Number.isNaN(Date.parse(p.pub_date as string)) &&
      strOrNull(p.image) && strOrNull(p.image_alt) &&
      Array.isArray(p.tags) && (p.tags as unknown[]).every(str) && str(p.body_markdown);
    if (!ok) throw new Error(`blog-posts.json has a malformed post: ${JSON.stringify(p.slug)}`);
  }
  const slugs = new Set((doc.posts as PostRow[]).map((p) => p.slug));
  if (slugs.size !== doc.posts.length) throw new Error('blog-posts.json repeats a slug');
  return doc.posts as PostRow[];
}

/** sha256 of every stored field, in a fixed order. */
export async function hashPost(p: PostRow): Promise<string> {
  const canonical = JSON.stringify([
    p.slug, p.url, p.title, p.description, p.pub_date, p.image, p.image_alt, p.tags, p.body_markdown,
  ]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Brings one branch's `posts` table in line with `posts`: rewrites what
 * changed, deletes what the repo no longer has, and touches nothing else.
 * One read, at most one upsert and one delete.
 */
export async function syncPosts(sql: Sql, posts: PostRow[]): Promise<SyncResult> {
  if (posts.length === 0) throw new Error('refusing to sync zero posts');

  const existing = await sql`SELECT slug, content_hash FROM posts`;
  const have = new Map(existing.map((r) => [String(r.slug), String(r.content_hash)]));

  const hashed = await Promise.all(posts.map(async (p) => ({ ...p, content_hash: await hashPost(p) })));
  const changed = hashed.filter((p) => have.get(p.slug) !== p.content_hash);

  if (changed.length) {
    await sql`
      INSERT INTO posts
        (slug, url, title, description, pub_date, image, image_alt, tags,
         body_markdown, content_hash, synced_at)
      SELECT slug, url, title, description, pub_date, image, image_alt, tags,
             body_markdown, content_hash, now()
      FROM jsonb_to_recordset(${JSON.stringify(changed)}::jsonb) AS x(
        slug text, url text, title text, description text, pub_date timestamptz,
        image text, image_alt text, tags text[], body_markdown text, content_hash text)
      ON CONFLICT (slug) DO UPDATE SET
        url = EXCLUDED.url, title = EXCLUDED.title, description = EXCLUDED.description,
        pub_date = EXCLUDED.pub_date, image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
        tags = EXCLUDED.tags, body_markdown = EXCLUDED.body_markdown,
        content_hash = EXCLUDED.content_hash, synced_at = now()
    `;
  }

  const keep = new Set(posts.map((p) => p.slug));
  const gone = [...have.keys()].filter((slug) => !keep.has(slug));
  if (gone.length) await sql`DELETE FROM posts WHERE slug = ANY(${gone})`;

  return { upserted: changed.length, deleted: gone.length, unchanged: posts.length - changed.length };
}

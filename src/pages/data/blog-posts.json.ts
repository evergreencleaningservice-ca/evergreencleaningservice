import { getCollection } from 'astro:content';
import { site } from '../../data/site';
import type { PostRow } from '../../lib/posts-sync';

/**
 * Every blog post as one JSON file, for the database mirror.
 *
 * The Worker's scheduled handler reads this from its own assets and copies it
 * into the `posts` table on both Neon branches — see `lib/posts-sync.ts` and
 * migrations/0008_posts.sql. The Markdown files stay the master copy; this is
 * how the database learns what they say without the deploy machine ever
 * holding a database credential.
 *
 * Public, like the posts it contains. Not a page, so it is in neither the
 * sitemap nor the RSS feed.
 */
export async function GET() {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  /* No hash here: scripts/images.mjs rewrites the image paths in this file
     after it is written, so a hash taken now would describe a file that no
     longer exists. The Worker hashes what it actually reads. */
  const rows: PostRow[] = posts.map((post) => ({
    slug: post.id,
    url: `${site.url}/${post.id}/`,
    title: post.data.title,
    description: post.data.description ?? null,
    pub_date: post.data.pubDate.toISOString(),
    image: post.data.image ?? null,
    image_alt: post.data.imageAlt ?? null,
    tags: post.data.tags,
    body_markdown: post.body ?? '',
  }));

  return new Response(JSON.stringify({ count: rows.length, posts: rows }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

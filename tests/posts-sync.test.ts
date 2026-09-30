/**
 * The blog mirror (src/lib/posts-sync.ts) against a fake `sql` that behaves
 * like the `posts` table: it records every statement and applies the upserts
 * and deletes to an in-memory map, so each test reads the table's end state
 * rather than trusting which statements were sent.
 */
import { describe, expect, it } from 'vitest';
import { hashPost, parsePosts, syncPosts, type PostRow, type Sql } from '../src/lib/posts-sync';

const post = (slug: string, extra: Partial<PostRow> = {}): PostRow => ({
  slug,
  url: `https://www.evergreencleaningservice.ca/${slug}/`,
  title: `Title ${slug}`,
  description: null,
  pub_date: '2021-03-04T00:00:00.000Z',
  image: null,
  image_alt: null,
  tags: ['commercial-cleaning'],
  body_markdown: `Body of ${slug}.`,
  ...extra,
});

function fakeTable(initial: Record<string, string> = {}) {
  const rows = new Map<string, string>(Object.entries(initial));
  const statements: string[] = [];
  const sql: Sql = async (strings, ...values) => {
    const text = strings.join('?');
    statements.push(text.trim().split(/\s+/)[0]);
    if (/^\s*SELECT slug, content_hash/.test(text))
      return [...rows].map(([slug, content_hash]) => ({ slug, content_hash }));
    if (/^\s*INSERT INTO posts/.test(text)) {
      for (const r of JSON.parse(values[0] as string)) rows.set(r.slug, r.content_hash);
      return [];
    }
    if (/^\s*DELETE FROM posts/.test(text)) {
      for (const slug of values[0] as string[]) rows.delete(slug);
      return [];
    }
    throw new Error(`unexpected statement: ${text}`);
  };
  return { sql, rows, statements };
}

describe('syncPosts', () => {
  it('writes every post into an empty table', async () => {
    const t = fakeTable();
    const result = await syncPosts(t.sql, [post('a'), post('b')]);
    expect(result).toEqual({ upserted: 2, deleted: 0, unchanged: 0 });
    expect([...t.rows.keys()].sort()).toEqual(['a', 'b']);
  });

  it('writes nothing when nothing changed', async () => {
    const posts = [post('a'), post('b')];
    const t = fakeTable({ a: await hashPost(posts[0]), b: await hashPost(posts[1]) });
    expect(await syncPosts(t.sql, posts)).toEqual({ upserted: 0, deleted: 0, unchanged: 2 });
    expect(t.statements).toEqual(['SELECT']);
  });

  it('rewrites only the post that changed', async () => {
    const a = post('a');
    const t = fakeTable({ a: await hashPost(a), b: await hashPost(post('b')) });
    const result = await syncPosts(t.sql, [a, post('b', { title: 'Retitled' })]);
    expect(result).toEqual({ upserted: 1, deleted: 0, unchanged: 1 });
    expect(t.rows.get('b')).toBe(await hashPost(post('b', { title: 'Retitled' })));
  });

  it('deletes a post removed from the repo, and nothing else', async () => {
    const a = post('a');
    const t = fakeTable({ a: await hashPost(a), gone: 'x' });
    expect(await syncPosts(t.sql, [a])).toEqual({ upserted: 0, deleted: 1, unchanged: 1 });
    expect([...t.rows.keys()]).toEqual(['a']);
  });

  it('a change to any stored field changes the hash', async () => {
    const base = await hashPost(post('a'));
    for (const change of [
      { url: 'x' }, { title: 'x' }, { description: 'x' }, { pub_date: '2022-01-01T00:00:00.000Z' },
      { image: 'x' }, { image_alt: 'x' }, { tags: ['x'] }, { body_markdown: 'x' },
    ]) {
      expect(await hashPost(post('a', change))).not.toBe(base);
    }
  });

  it('refuses to sync an empty list, which would delete every row', async () => {
    const t = fakeTable({ a: 'x' });
    await expect(syncPosts(t.sql, [])).rejects.toThrow(/zero posts/);
    expect(t.rows.size).toBe(1);
  });
});

describe('parsePosts', () => {
  const doc = (posts: unknown[], count = posts.length) => ({ count, posts });

  it('accepts a well-formed file', () => {
    expect(parsePosts(doc([post('a')]))).toHaveLength(1);
  });

  it.each([
    ['no posts array', { count: 0 }],
    ['zero posts', doc([])],
    ['a count that does not match', doc([post('a')], 2)],
    ['a repeated slug', doc([post('a'), post('a')])],
    ['a missing title', doc([{ ...post('a'), title: undefined }])],
    ['an unparseable date', doc([post('a', { pub_date: 'yesterday' })])],
    ['tags that are not strings', doc([{ ...post('a'), tags: [1] }])],
  ])('refuses %s', (_label, input) => {
    expect(() => parsePosts(input)).toThrow();
  });
});

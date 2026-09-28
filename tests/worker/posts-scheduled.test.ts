/**
 * The Worker's scheduled handler: the blog mirror reaches BOTH Neon branches,
 * from the deployed build's own JSON, and never reports success over a
 * failure.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** statements sent, per connection string */
const calls: Record<string, string[]> = {};
let failOn = '';

vi.mock('@neondatabase/serverless', () => ({
  neon: (url: string) => async (strings: TemplateStringsArray) => {
    if (url === failOn) throw new Error('connection refused');
    (calls[url] ??= []).push(strings.join('?').trim().split(/\s+/)[0]);
    return [];
  },
}));

const { syncBlogPosts } = await import('../../src/worker');

const POSTS = {
  count: 1,
  posts: [
    {
      slug: 'a-post',
      url: 'https://www.evergreencleaningservice.ca/a-post/',
      title: 'A post',
      description: null,
      pub_date: '2021-03-04T00:00:00.000Z',
      image: null,
      image_alt: null,
      tags: [],
      body_markdown: 'Body.',
    },
  ],
};

const env = (over: Record<string, unknown> = {}, body: unknown = POSTS, status = 200) =>
  ({
    ASSETS: {
      fetch: vi.fn(async () => new Response(JSON.stringify(body), { status })),
    },
    DATABASE_URL: 'main-url',
    STAGING_DATABASE_URL: 'staging-url',
    ...over,
  }) as never;

beforeEach(() => {
  for (const k of Object.keys(calls)) delete calls[k];
  failOn = '';
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('syncBlogPosts', () => {
  it('reads its own build and writes to main and staging', async () => {
    const e = env();
    await syncBlogPosts(e);
    expect((e as { ASSETS: { fetch: ReturnType<typeof vi.fn> } }).ASSETS.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/data\/blog-posts\.json$/)
    );
    expect(calls['main-url']).toEqual(['SELECT', 'INSERT']);
    expect(calls['staging-url']).toEqual(['SELECT', 'INSERT']);
  });

  it('skips a branch with no secret and still syncs the other', async () => {
    await syncBlogPosts(env({ STAGING_DATABASE_URL: undefined }));
    expect(calls['main-url']).toEqual(['SELECT', 'INSERT']);
    expect(calls['staging-url']).toBeUndefined();
  });

  it('a failure on one branch still syncs the other, then fails the run', async () => {
    failOn = 'main-url';
    await expect(syncBlogPosts(env())).rejects.toThrow(/failed on main/);
    expect(calls['staging-url']).toEqual(['SELECT', 'INSERT']);
  });

  it('touches no database when the build file is missing or empty', async () => {
    await expect(syncBlogPosts(env({}, 'not found', 404))).rejects.toThrow(/404/);
    await expect(syncBlogPosts(env({}, { count: 0, posts: [] }))).rejects.toThrow(/zero posts/);
    expect(calls).toEqual({});
  });
});

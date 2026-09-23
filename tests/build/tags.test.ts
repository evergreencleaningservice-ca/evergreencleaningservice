/**
 * @vitest-environment node
 *
 * The tag taxonomy: the sidebar cloud, the archives behind it, and the
 * arithmetic that ties both to the original.
 *
 * WHAT WENT WRONG, and it is worth stating plainly because nothing caught it.
 * The port's sidebar carried three widgets: search, Recent Posts, and a
 * "Request Quote" form. The original's third widget is a tag cloud. There is
 * no Request Quote widget in the original's sidebar at all — it was invented
 * during the port, and the tag cloud it replaced was deleted.
 *
 * The deletion was at least reasoned: `/tag/*` was a blanket 301 to
 * `/category/blog/`, so all 26 links led to one page. But the answer to links
 * that all go to the same place is to build the pages. Deleting the
 * navigation and putting a lead form where the client's own site has a
 * taxonomy is a different site, not a port of this one.
 *
 * WHY NO EXISTING TEST NOTICED. Every sidebar assertion in this suite checks
 * what the sidebar contains. None asked what the ORIGINAL contains — the same
 * blind spot that lost 28 body images (see image-parity.test.ts). A person
 * looking at two browser windows found this one too.
 *
 * THE SOURCE OF TRUTH is the original's own WordPress, read through its REST
 * API and recorded in `src/data/tags.ts`. The reconciliation below is the
 * point of this file: the counts the original publishes must equal the counts
 * our own content produces, tag by tag. If someone edits a post's tags, or a
 * tag is renamed, or an archive silently stops building, the arithmetic stops
 * matching and this fails.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { tags, emptyTagSlugs } from '../../src/data/tags';
import { wildcardRedirects } from '../../src/data/redirects';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-tags');

const read = (...p: string[]) => fs.readFileSync(path.join(out, ...p), 'utf8');
const exists = (...p: string[]) => fs.existsSync(path.join(out, ...p));
/** Occurrences, not matching lines — the build emits one long line. */
const count = (haystack: string, needle: RegExp) => haystack.match(needle)?.length ?? 0;

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

describe('the tag registry matches the original', () => {
  it('carries the 26 tags the original clouds, and no empty ones', () => {
    expect(tags).toHaveLength(26);
    for (const tag of tags) expect(tag.count, tag.slug).toBeGreaterThan(0);
  });

  it('is in the original’s cloud order — alphabetical, ignoring case', () => {
    const names = tags.map((t) => t.name);
    const sorted = [...names].sort((a, b) =>
      a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0
    );
    expect(names).toEqual(sorted);
  });

  it('gives every tag a font size inside WordPress’s 8–22pt range', () => {
    /* Measured off the original's rendered cloud, not computed. A value
       outside the range means someone invented one. */
    for (const tag of tags) {
      expect(tag.size, tag.slug).toBeGreaterThanOrEqual(8);
      expect(tag.size, tag.slug).toBeLessThanOrEqual(22);
    }
    expect(tags.find((t) => t.slug === 'commercial-cleaning')?.size).toBe(22);
    expect(tags.filter((t) => t.count === 1).every((t) => t.size === 8)).toBe(true);
  });

  it('keeps the nine zero-post tags out of the cloud but on the record', () => {
    expect(emptyTagSlugs).toHaveLength(9);
    for (const slug of emptyTagSlugs) {
      expect(tags.find((t) => t.slug === slug), `${slug} must not be clouded`).toBeUndefined();
    }
  });
});

describe('every post’s tags are real', () => {
  const known = new Set(tags.map((t) => t.slug));
  const dir = path.join(repo, 'src/content/blog');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  it('covers all 38 posts', () => {
    expect(files).toHaveLength(38);
  });

  it('uses no tag slug that is not in the registry', () => {
    const bad: string[] = [];
    for (const file of files) {
      const fm = fs.readFileSync(path.join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
      const line = fm?.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1];
      if (!line) continue;
      for (const slug of line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))) {
        if (!known.has(slug)) bad.push(`${file}: ${slug}`);
      }
    }
    expect(bad, 'a post carries a tag no archive is built for').toEqual([]);
  });
});

describe('the reconciliation — our counts equal the original’s', () => {
  it('lists exactly the published number of posts across each tag’s pages', () => {
    /* Counted from the BUILT pages rather than the frontmatter, so this also
       catches an archive that stops paginating or stops building at all. */
    const wrong: string[] = [];

    for (const tag of tags) {
      let seen = 0;
      let page = 1;
      for (;;) {
        const parts =
          page === 1 ? ['tag', tag.slug, 'index.html'] : ['tag', tag.slug, 'page', `${page}`, 'index.html'];
        if (!exists(...parts)) break;
        seen += count(read(...parts), /<article/g);
        page += 1;
        if (page > 20) throw new Error(`${tag.slug}: runaway pagination`);
      }
      if (seen !== tag.count) wrong.push(`${tag.slug}: original ${tag.count}, built ${seen}`);
    }

    expect(wrong, 'the port and the original disagree about a tag').toEqual([]);
  });

  it('pages at ten, like the original', () => {
    expect(count(read('tag', 'cleaning', 'index.html'), /<article/g)).toBe(10);
    expect(count(read('tag', 'cleaning', 'page', '2', 'index.html'), /<article/g)).toBe(4);
  });

  it('builds no archive for a tag with no posts', () => {
    for (const slug of emptyTagSlugs) {
      expect(exists('tag', slug, 'index.html'), `/tag/${slug}/ must not be built`).toBe(false);
    }
  });
});

describe('an archive page matches the original’s', () => {
  /* Measured on https://evergreencleaningservice.ca/tag/cleaning/. */
  it('uses the original’s title, heading and breadcrumb', () => {
    const html = read('tag', 'cleaning', 'index.html');
    expect(html).toContain('<title>cleaning Archives - Evergreen Office Cleaning</title>');
    expect(html).toMatch(/<h1[^>]*>Tag: <span[^>]*>cleaning<\/span><\/h1>/);
    expect(html).toContain('>News</a>');
  });

  it('keeps the original’s casing in the heading', () => {
    /* "Dusting", not "dusting" — the display name, not the slug. */
    expect(read('tag', 'dusting', 'index.html')).toMatch(
      /<h1[^>]*>Tag: <span[^>]*>Dusting<\/span><\/h1>/
    );
  });

  it('is follow, noindex — crawlable through, not indexed', () => {
    expect(read('tag', 'cleaning', 'index.html')).toContain(
      '<meta name="robots" content="follow, noindex"'
    );
  });

  it('shows pagination only where there is a second page', () => {
    expect(count(read('tag', 'cleaning', 'index.html'), /aria-label="Posts navigation"/g)).toBe(1);
    expect(count(read('tag', 'winter', 'index.html'), /aria-label="Posts navigation"/g)).toBe(0);
  });

  it('stays out of the sitemap, being noindex', () => {
    /* Submitting a noindex URL is a contradiction Search Console reports as
       an error. 34 tag pages leaked in before the filter was widened. */
    const sitemap = read('sitemap-0.xml');
    expect(count(sitemap, /<loc>[^<]*\/tag\/[^<]*<\/loc>/g)).toBe(0);
  });
});

describe('the sidebar cloud', () => {
  const page = () => read('about-us', 'index.html');

  it('replaces the invented Request Quote widget with Tags', () => {
    expect(page()).toContain('>Tags</h2>');
    expect(page(), 'the original has no Request Quote widget').not.toContain('>Request Quote</h2>');
  });

  it('renders all 26 tags, each linking to its own archive', () => {
    const html = page();
    for (const tag of tags) {
      expect(html, tag.slug).toContain(`href="/tag/${tag.slug}/"`);
    }
    expect(count(html, /href="\/tag\/[a-z0-9-]+\/"/g)).toBe(26);
  });

  it('carries the original’s measured font sizes inline', () => {
    const html = page();
    expect(html).toContain('href="/tag/commercial-cleaning/" style="font-size: 22pt"');
    expect(html).toContain('href="/tag/winter/" style="font-size: 8pt"');
  });

  it('speaks the post count, because 8pt means nothing to a screen reader', () => {
    const html = page();
    expect(html).toContain('aria-label="commercial cleaning (29 items)"');
    expect(html).toContain('aria-label="winter (1 item)"');
  });

  it('every link in the cloud resolves to a page that was built', () => {
    const hrefs = [...page().matchAll(/href="(\/tag\/[a-z0-9-]+\/)"/g)].map((m) => m[1]);
    const missing = hrefs.filter((href) => !exists(href.slice(1), 'index.html'));
    expect(missing, 'the cloud links somewhere that does not exist').toEqual([]);
  });
});

describe('the /tag/* wildcard is a fallback, not the destination', () => {
  it('is still in the redirect map, for empty tags and stale inbound links', () => {
    /* Deleting it would turn every /tag/alignment/ and every stale backlink
       into a 404, which is the opposite of the point. */
    const rule = wildcardRedirects.find((r) => r.from === '/tag/*');
    expect(rule, '/tag/* must stay as the fallback').toBeDefined();
    expect(rule?.to).toBe('/category/blog/');
  });

  it('does not shadow the archives, which are real assets', () => {
    /* The wildcard cannot match what the asset router serves first. This
       asserts the assets exist; the deploy check confirms the live 200 vs
       301 split, because file-order precedence in _redirects is not a
       guarantee — see the /blog/page/N/ bug in src/data/redirects.ts. */
    expect(exists('tag', 'cleaning', 'index.html')).toBe(true);
    expect(exists('tag', 'commercial-cleaning', 'page', '3', 'index.html')).toBe(true);
  });
});

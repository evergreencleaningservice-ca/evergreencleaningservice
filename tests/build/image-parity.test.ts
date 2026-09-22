/**
 * @vitest-environment node
 *
 * Every body image the original page carried, still on the ported page.
 *
 * THE DEFECT THIS EXISTS TO CATCH, and it reached production-candidate status
 * without a single check noticing: `/green-clean-products/` serves **none** of
 * the four body images the original carries — including the Armstrong
 * Manufacturing logo and the ECOLOGO certification mark, which are the entire
 * evidential point of a page about certified green products. It also still
 * renders the figcaption "Pro Series Green Products" under the image that is
 * no longer there.
 *
 * WHY NOTHING CAUGHT IT. `tests/build/images.test.ts` checks the images the
 * port DOES serve — formats, dimensions, loading attributes, and that no local
 * `/images/` path survives the B2 rewrite. The Phase 13 acceptance crawl
 * counted 382 `<img>` elements and found none missing an `alt`. The Phase 12
 * parity run checked every URL and every redirect.
 *
 * Every one of those passes on a page that dropped an image entirely. They
 * audit what is present. **None of them asks what is absent.** A person
 * comparing two browser windows found it in seconds; three automated passes
 * did not, because none was looking.
 *
 * ROOT CAUSE: 41 images could not be harvested when the content was ported.
 * The port dropped the references rather than emitting broken images, which is
 * defensible, and then said nothing, which is not.
 *
 * RECOVERED — 23 of the 28 lost slots, after this test was written. Two
 * separate obstacles turned out to have separate answers. The page HTML is
 * behind SiteGround's IP-reputation challenge, so Firecrawl fetches it from
 * its own infrastructure. The image files are reachable directly, but only on
 * the APEX: `evergreencleaningservice.ca/wp-content/uploads/…` returns the
 * bytes while the same path on `www.` returns the interstitial. An earlier
 * check that used `www.` for both concluded, wrongly, that the files were
 * gone for good.
 *
 * THE MANIFEST is `src/data/original-page-images.json`, extracted once from
 * the archived originals and committed, because the archive rendering lived in
 * an ephemeral scratchpad. Matched by basename stem with the WordPress size
 * suffix stripped, since `armstrong-logo-300x89.jpg` and `armstrong-logo.jpg`
 * are the same asset.
 *
 * KNOWN_LOST is the honest part, and it is down to FOUR. Those five are still
 * challenged on every attempt and are not faked. The list is pinned in both
 * directions: a NEW loss fails, and a RECOVERY fails too, loudly, until the
 * entry is deleted. That is what took it from 28 to 5 rather than letting it
 * rot into a graveyard of things fixed long ago.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import originalImages from '../../src/data/original-page-images.json' with { type: 'json' };
import { bodyImages, isPaginatedArchive } from '../../src/lib/body-images';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-imgparity');

/**
 * Body images the ORIGINAL carries that the port cannot serve, because the
 * files were never harvested and are not reachable.
 *
 * Every entry is a real content loss, not an exemption earned on merit.
 * Closing them needs the WordPress media library — see the Phase 13 report.
 */
const KNOWN_LOST: Record<string, string[]> = {
  '/5-cleaning-tips-to-help-make-your-office-relocation-seamless/': [
    'moving-the-office',
    'moving-the-office-2',
  ],
  '/cleaning-check-list-dental-clinics/': ['dental-office-reception'],
  '/keep-your-office-at-home-clean/': ['office-cleaners'],
};

/** Routes the original served that the port deliberately redirects. */
const REDIRECTED = new Set([
  '/blog/',
  '/blog/page/2/',
  '/blog/page/3/',
  '/services/disinfection-cleaning-service/',
  '/services/emergency-cleaning-services/',
  '/testimonials/',
]);

/**
 * Images the port deliberately swapped for a different file. Same slot, same
 * count, new picture — a content decision made during the port, not a loss.
 * Listed so the strict check below can tell the two apart.
 */
const SUBSTITUTED: Record<string, string[]> = {
  '/be-safe-from-coronavirus-work/': ['safety-at-work'],
  '/coronavirus-bringing-more-urgency-cleaning/': ['medical-office-reception-area'],
  '/day-night-which-is-the-best-routine-for-your-office/': ['janitorial-cart'],
  '/qualities-top-cleaning-professionals/': ['istock-532149911-scaled'],
  '/cleaning-protocols-for-daycares-and-schools/': ['istock-532149911-scaled'],
};

const built = new Map<string, Set<string>>();

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  for (const slug of Object.keys(originalImages)) {
    const route = slug === 'index' || slug === 'home' ? '/' : `/${slug}/`;
    const file =
      route === '/' ? path.join(out, 'index.html') : path.join(out, route, 'index.html');
    if (!fs.existsSync(file)) continue;
    built.set(route, bodyImages(fs.readFileSync(file, 'utf8')));
  }
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

describe('body images carried over from the original', () => {
  it('covers every archived page that had one', () => {
    expect(Object.keys(originalImages).length).toBe(54);
  });

  it('loses no image that is not already on the known-lost list', () => {
    const unexpected: string[] = [];

    for (const [slug, images] of Object.entries(originalImages as Record<string, string[]>)) {
      const route = slug === 'index' || slug === 'home' ? '/' : `/${slug}/`;
      if (REDIRECTED.has(route) || isPaginatedArchive(route)) continue;
      const have = built.get(route);
      if (!have) continue;

      const allowed = new Set([...(KNOWN_LOST[route] ?? []), ...(SUBSTITUTED[route] ?? [])]);
      for (const stem of images) {
        if (have.has(stem) || allowed.has(stem)) continue;
        unexpected.push(`${route} lost ${stem}`);
      }
    }

    expect(unexpected, 'a body image disappeared that nothing accounts for').toEqual([]);
  });

  it('pins the known-lost set exactly — a recovery must update the list', () => {
    /* The other direction, and the one that keeps the list honest. When the
       media library is recovered and an image comes back, this fails and the
       entry has to be deleted deliberately. Without it the list silently
       becomes a graveyard of things that were fixed years ago. */
    const stillLost: string[] = [];
    const recovered: string[] = [];

    for (const [route, images] of Object.entries(KNOWN_LOST)) {
      const have = built.get(route);
      if (!have) continue;
      for (const stem of images) {
        (have.has(stem) ? recovered : stillLost).push(`${route}${stem}`);
      }
    }

    expect(recovered, 'these images are back — remove them from KNOWN_LOST').toEqual([]);
    expect(stillLost).toHaveLength(4);
  });

  it('/green-clean-products/ carries all four of its images again', () => {
    /* The page a person spotted by eye. Losing all four left it making a
       certification claim with the certification marks removed, so it is
       asserted by name rather than left to the aggregate. */
    const have = built.get('/green-clean-products/');
    expect(have, 'the page must still build').toBeDefined();
    expect([...have!].sort()).toEqual(
      ['armstrong-logo', 'ecologo', 'green_clean_products_large-1', 'proseriesgreen-logo'].sort()
    );
    expect(KNOWN_LOST['/green-clean-products/']).toBeUndefined();
  });

  it('places each image where the original has it, not at the end', () => {
    /* An image on the right page in the wrong place is still wrong: the
       Armstrong logo belongs above the line inviting the reader to visit
       Armstrong, and the ECOLOGO mark above the paragraph explaining what
       the mark means. Asserted on the emitted order. */
    const html = fs.readFileSync(path.join(out, 'green-clean-products', 'index.html'), 'utf8');
    const at = (needle: string) => html.indexOf(needle);
    expect(at('armstrong-logo')).toBeLessThan(at('For more information visit Armstrong'));
    expect(at('ECOLOGO')).toBeLessThan(at('In April of 2013'));
    expect(at('green_clean_products_LARGE-1')).toBeGreaterThan(at('In April of 2013'));
  });
});

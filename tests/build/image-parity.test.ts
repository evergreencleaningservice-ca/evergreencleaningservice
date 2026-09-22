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
 * ROOT CAUSE, recorded so the fix is not mistaken for a port bug: 41 images
 * could not be harvested when the content was ported — the live origin
 * answers this network with SiteGround's IP-reputation challenge, and the
 * Internet Archive holds only 5 of the 41. The port dropped the references
 * rather than emitting broken images, which is defensible, and then said
 * nothing, which is not.
 *
 * THE MANIFEST is `src/data/original-page-images.json`, extracted once from
 * the archived originals and committed, because the archive rendering lived in
 * an ephemeral scratchpad. Matched by basename stem with the WordPress size
 * suffix stripped, since `armstrong-logo-300x89.jpg` and `armstrong-logo.jpg`
 * are the same asset.
 *
 * KNOWN_LOST is the honest part. Those 28 image slots cannot be restored from any
 * source reachable here, so the test cannot demand them yet. It pins the exact
 * set instead: a NEW loss fails, and recovering one also fails, loudly, until
 * the list is updated. A list that silences a finding has to cost something to
 * keep.
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
  '/green-clean-products/': [
    'proseriesgreen-logo',
    'armstrong-logo',
    'ecologo',
    'green_clean_products_large-1',
  ],
  '/the-return-of-employees-post-covid-19-is-your-office-ready/': [
    'covid-19-elbow-bump',
    'covid19-office',
  ],
  '/services/industrial-cleaning/': ['industial-cleaning-demo-toronto-1'],
  '/5-cleaning-tips-to-help-make-your-office-relocation-seamless/': [
    'moving-the-office',
    'moving-the-office-2',
    'moving-the-office-3',
  ],
  '/5-tips-for-maintaining-clean-office-air/': ['clean-office-air'],
  '/cleaning-check-list-dental-clinics/': [
    'dental-office-1',
    'dental-office-break-room',
    'dental-office-reception',
  ],
  '/cleaning-protocols-for-daycares-and-schools/': ['classroom', 'school-cafeteria'],
  /* `clean-office-air` is used on two pages and unresolved for both, so it
     appears twice in this list rather than once. Counted per page, because
     the loss is per page: it is a hole in each of them. */
  '/commercial-cleaning-air-quality/': ['air-quality-1', 'stinky-air-in-the-office', 'clean-office-air'],
  '/does-hand-sanitization-actually-help-prevent-illnesses/': ['hand-sanitizer-in-a-store'],
  '/how-to-properly-dust-office-building/': ['dust-on-a-desk'],
  '/how-to-take-care-of-plants-in-the-office/': ['office-plants-2', 'office-plant-3'],
  '/keep-your-office-at-home-clean/': ['woman-wiping-down-her-desk', 'office-cleaners'],
  '/office-layout-tips-to-make-cleaning-easier-and-faster/': ['office-layout-2', 'office-layout'],
  '/preventing-slips-trips-falls-in-your-workplace/': ['slips'],
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
    expect(stillLost).toHaveLength(28);
  });

  it('records that /green-clean-products/ is the worst of them', () => {
    /* Named explicitly because it is the page a person spotted by eye, and
       because losing all four leaves the page making a certification claim
       with the certification marks removed. */
    const have = built.get('/green-clean-products/');
    expect(have, 'the page must still build').toBeDefined();
    expect([...have!]).toEqual([]);
    expect(KNOWN_LOST['/green-clean-products/']).toHaveLength(4);
  });
});

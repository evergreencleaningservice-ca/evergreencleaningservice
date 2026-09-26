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
 * RECOVERED — 26 of the 28 lost slots, after this test was written. Two
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
 * KNOWN_LOST is the honest part, and it is down to TWO. Those two are
 * still challenged on every attempt and are not faked. The list is pinned in
 * BOTH directions: a new loss fails, and a recovery fails too, loudly, until
 * the entry is deleted. It is that second half which walked the list down
 * from 28 to 2 as the images came back, instead of letting it rot into a
 * graveyard of things fixed long ago.
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
 * Body images the ORIGINAL carries that the port still cannot serve.
 *
 * TWO, down from twenty-eight. Each was requested repeatedly across three
 * harvesting passes and challenged every single time, while twenty-six of
 * their neighbours came back — including one on the third pass, which is why
 * the list keeps being worth re-attacking rather than declaring final.
 *
 * They are a real content loss, not an exemption earned on merit, and they
 * stay pinned rather than papered over: a page that quietly stops expecting
 * its image has lost it twice.
 *
 * Closing them needs either another harvest on a luckier egress address or
 * the WordPress media library — SiteGround file manager or FTP.
 */
const KNOWN_LOST: Record<string, string[]> = {
  '/5-cleaning-tips-to-help-make-your-office-relocation-seamless/': ['moving-the-office'],
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
/**
 * Pages that deliberately serve no body image at all.
 *
 * `/about-us/` is the only one, and it is an improvement rather than a loss:
 * the original's single "body image" there was `free-quote-cta-button.png`, a
 * picture of a button. It is now a real `<a class="btn">Request a Free
 * Quote</a>` — selectable text, keyboard reachable, announced as a link, and
 * no image request. A page that swaps a picture of a control for the control
 * is not a page that lost a picture.
 */
const NO_BODY_IMAGE = new Set(['/about-us/']);

/**
 * The floor under the whole site, measured rather than guessed.
 *
 * 130 body images across the 45 manifest pages that build, at the time the
 * imagery was refreshed. It is a FLOOR, not an equality: adding pictures is
 * fine and should not fail a test. What it catches is the thing that would
 * otherwise be invisible — a change that quietly strips images from many
 * pages at once, which is precisely how the original 28 went missing.
 */
const TOTAL_BODY_IMAGES_FLOOR = 130;

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

  it('leaves no page that had pictures showing none', () => {
    /**
     * THIS TEST USED TO COMPARE FILENAMES, one by one, against the original
     * WordPress site. That was the right check while the port was still
     * trying to reproduce that site: 28 images had been dropped silently and
     * nothing noticed until a person compared two browser windows.
     *
     * The site's imagery has since been deliberately replaced — old stock
     * photos swapped for new ones, several consolidated (three
     * `moving-the-office` variants became one `office-relocation-cleanup`),
     * and CTA graphics turned into real markup. 121 filenames stopped
     * matching across 45 pages, every one of them on purpose.
     *
     * So filename identity is no longer the contract, and pinning it would
     * mean this test fails on every legitimate refresh — which is how a test
     * gets deleted rather than fixed. What survives is the INVARIANT the
     * original bug actually broke: a page that illustrated itself must still
     * illustrate itself. `/green-clean-products/` is still asserted by name
     * below, because the specific images on it are the evidential point of
     * the page rather than decoration.
     */
    const bare: string[] = [];

    for (const [slug, images] of Object.entries(originalImages as Record<string, string[]>)) {
      const route = slug === 'index' || slug === 'home' ? '/' : `/${slug}/`;
      if (REDIRECTED.has(route) || isPaginatedArchive(route)) continue;
      if (NO_BODY_IMAGE.has(route)) continue;
      const have = built.get(route);
      if (!have || images.length === 0) continue;
      if (have.size === 0) bare.push(route);
    }

    expect(bare, 'this page illustrated itself and now shows nothing').toEqual([]);
  });

  it('pins the deliberately image-free pages, so a new one has to be declared', () => {
    /* The other direction, as with KNOWN_LOST. If a page joins this set by
       accident the test above passes and nobody hears about it, so the set
       itself is pinned: adding to it is a decision somebody has to write
       down. */
    for (const route of NO_BODY_IMAGE) {
      expect(built.get(route)?.size, `${route} is listed as image-free`).toBe(0);
    }
    expect(NO_BODY_IMAGE.size).toBe(1);
  });

  it('keeps at least as many body images as the refresh shipped with', () => {
    let total = 0;
    for (const [slug] of Object.entries(originalImages as Record<string, string[]>)) {
      const route = slug === 'index' || slug === 'home' ? '/' : `/${slug}/`;
      if (REDIRECTED.has(route) || isPaginatedArchive(route)) continue;
      total += built.get(route)?.size ?? 0;
    }
    expect(total, 'body images have been stripped somewhere').toBeGreaterThanOrEqual(
      TOTAL_BODY_IMAGES_FLOOR
    );
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
    expect(stillLost).toHaveLength(2);
  });

  it('/green-clean-products/ carries all four of its images', () => {
    /* The page a person spotted by eye. Losing all four left it making a
       certification claim with the certification marks removed, so it is
       asserted by name rather than left to the aggregate.

       THE THREE MARKS ARE PINNED BY NAME and the photograph is not: the
       Armstrong logo, the ECOLOGO mark and the ProSeries Green logo ARE the
       claim, and no refresh may quietly swap them for something prettier.
       The product photograph beside them is illustration, and the imagery
       refresh replaced `green_clean_products_LARGE-1` with
       `green-cleaning-products-unlabeled` — a swap the count still catches
       but the names should not forbid. */
    const have = built.get('/green-clean-products/');
    expect(have, 'the page must still build').toBeDefined();
    for (const mark of ['armstrong-logo', 'ecologo', 'proseriesgreen-logo']) {
      expect([...have!], `the ${mark} certification mark`).toContain(mark);
    }
    expect(have!.size, 'four images: three marks and the product photograph').toBe(4);
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
    /* The product photograph, whatever it is currently called, sits after
       the ECOLOGO paragraph. Located by elimination rather than by filename,
       so the imagery refresh does not have to be re-encoded here. */
    const photo = [...built.get('/green-clean-products/')!].find(
      (s) => !['armstrong-logo', 'ecologo', 'proseriesgreen-logo'].includes(s)
    )!;
    expect(html.toLowerCase().indexOf(photo)).toBeGreaterThan(at('In April of 2013'));
  });
});

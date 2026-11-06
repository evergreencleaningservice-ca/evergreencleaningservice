/**
 * Generates the AVIF/WebP/JPEG variants three places serve small photographs:
 *
 *   node --experimental-strip-types scripts/content-variants.mjs [--force]
 *
 *  1. THE GALLERY (/cleaning-demo-gallery/). Its photos are 1200x800 stock
 *     JPEGs shown about 250px wide in a three-column grid, so each gets a
 *     480 and a 768 (SEO audit, images finding 1, 6 Nov 2026). The page
 *     lists them in the `photos` frontmatter of
 *     src/content/pages/cleaning-demo-gallery.md.
 *
 *  2. THE POST-LIST THUMBNAILS. The post lists and the guides' related cards
 *     drew the WordPress `-300x150.jpg` crop stretched to about 380px on a
 *     phone (images finding 4). Every post's featured image needs a 480 and
 *     a 720-ish set: scripts/feature-variants.mjs already makes 480/720 for
 *     the `-feature.jpg` posts and the guides ship 480/768, so this only
 *     fills in a post whose image has neither (none today; a future one).
 *
 *  3. THE HOMEPAGE SERVICE CARDS (src/components/home/ServicesOverview.astro).
 *     The card is 298-418px wide on a desktop and 380px on a phone, which at
 *     a 1.5-1.75x pixel ratio falls between the 480 and the 768, so a 640
 *     sits between them (performance finding 7).
 *
 * Same house rules as scripts/hero-variants.mjs: written into public/images/,
 * uploaded by `npm run b2:sync`, never upscaled, idempotent unless --force,
 * and a modern-format file that is not smaller than the JPEG at the same
 * width fails the run — including one that was already on disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const QUALITY = { avif: 52, webp: 72, jpeg: 78 };
const dir = path.resolve('public/images');
const force = process.argv.includes('--force');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

const frontmatter = (file) => fs.readFileSync(file, 'utf8').split('\n---')[0];
const have = (name) => fs.existsSync(path.join(dir, name));

/* --- what to make ----------------------------------------------------------- */

/** @type {{ file: string, widths: number[], why: string }[]} */
const jobs = [];

/* 1. The gallery: every `src:` under `photos:` in the page's frontmatter. */
const gallery = frontmatter(path.resolve('src/content/pages/cleaning-demo-gallery.md'));
const galleryPhotos = [...gallery.matchAll(/^\s*-?\s*src:\s*["']?\/images\/([^"'\s]+\.jpe?g)/gim)].map((m) => m[1]);
if (galleryPhotos.length === 0) {
  console.error('content-variants: no photos found in src/content/pages/cleaning-demo-gallery.md');
  process.exit(1);
}
for (const file of galleryPhotos) jobs.push({ file, widths: [480, 768], why: 'gallery' });

/* 2. Post thumbnails: a featured image with no 480 set, or no 720/768 set. */
const blog = path.resolve('src/content/blog');
const posts = new Set();
for (const md of fs.readdirSync(blog).filter((f) => f.endsWith('.md'))) {
  const m = frontmatter(path.join(blog, md)).match(/^image:\s*["']?\/images\/([^"'\s]+\.jpe?g)/m);
  if (m) posts.add(m[1]);
}
const complete = (base, width) => ['avif', 'webp', 'jpg'].every((ext) => have(`${base}-${width}.${ext}`));
for (const file of [...posts].sort()) {
  const base = file.replace(/\.jpe?g$/i, '');
  const widths = [];
  if (!complete(base, 480)) widths.push(480);
  if (!complete(base, 720) && !complete(base, 768)) widths.push(720);
  if (widths.length) jobs.push({ file, widths, why: 'thumbnail' });
}

/* 3. The homepage cards: the `image:` names in ServicesOverview.astro. */
const overview = fs.readFileSync(path.resolve('src/components/home/ServicesOverview.astro'), 'utf8');
const cards = [...overview.matchAll(/^\s*image:\s*'([^']+)'/gm)].map((m) => `${m[1]}.jpg`);
if (cards.length < 3) {
  console.error(`content-variants: expected the three service-card images in ServicesOverview.astro, found ${cards.length}`);
  process.exit(1);
}
for (const file of cards) jobs.push({ file, widths: [480, 640, 768], why: 'service card' });

/* --- make them --------------------------------------------------------------- */

let written = 0;
let skipped = 0;
const oversized = [];

for (const { file, widths, why } of jobs) {
  const input = path.join(dir, file);
  if (!fs.existsSync(input)) {
    console.error(`content-variants: ${file} (${why}) not found in public/images`);
    process.exit(1);
  }
  const base = file.replace(/\.jpe?g$/i, '');
  const meta = await sharp(input).metadata();

  for (const width of widths) {
    if (width >= meta.width) continue; /* never upscale */

    /* The JPEG at this width is the baseline every modern format must beat. */
    const jpegName = `${base}-${width}.jpg`;
    const jpegPath = path.join(dir, jpegName);
    if (force || !fs.existsSync(jpegPath)) {
      await sharp(input).resize({ width }).jpeg({ quality: QUALITY.jpeg, mozjpeg: true }).toFile(jpegPath);
      written++;
    } else skipped++;
    const jpegBytes = fs.statSync(jpegPath).size;

    for (const format of ['avif', 'webp']) {
      const name = `${base}-${width}.${format}`;
      const out = path.join(dir, name);
      if (force || !fs.existsSync(out)) {
        await sharp(input).resize({ width })[format]({ quality: QUALITY[format] }).toFile(out);
        written++;
      } else skipped++;

      const bytes = fs.statSync(out).size;
      const line = `  ${name.padEnd(56)} ${kb(bytes).padStart(8)}  (jpeg ${kb(jpegBytes)})`;
      if (bytes >= jpegBytes) {
        oversized.push({ name, bytes, jpegBytes });
        console.log(`${line}  *** LARGER THAN THE JPEG ***`);
      } else {
        console.log(`${line}  -${Math.round((1 - bytes / jpegBytes) * 100)}%`);
      }
    }
  }
}

console.log(
  `\ncontent-variants: ${galleryPhotos.length} gallery photos, ${posts.size} post images, ${cards.length} service cards; ` +
    `${written} written, ${skipped} already present.`,
);

if (oversized.length) {
  console.error(
    `\ncontent-variants: ${oversized.length} variant(s) are BIGGER than the JPEG they replace.\n` +
      `  A modern format that weighs more is not an optimisation, it is a regression\n` +
      `  wearing a new extension. Lower the quality in QUALITY above, or drop the\n` +
      `  format for these sizes.\n` +
      oversized.map((o) => `    ${o.name}: ${kb(o.bytes)} vs ${kb(o.jpegBytes)}`).join('\n'),
  );
  process.exit(1);
}

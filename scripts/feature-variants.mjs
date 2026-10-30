/**
 * Generates the smaller variants a blog post's featured image serves on phones.
 *
 *   node --experimental-strip-types scripts/feature-variants.mjs [--force]
 *
 * The featured images ship at 960x480 as AVIF/WebP/JPEG siblings. On a phone
 * the image is shown about 380px wide, so a 960px file is more than it needs
 * even at a 1.75x pixel ratio; on the seasonal checklist it was also the
 * page's LCP element (SEO audit, 30 Oct 2026). This writes
 * `<name>-480` and `<name>-720` AVIF/WebP/JPEG files beside each one in use,
 * and `PostLayout.astro` offers all three widths through `srcset`.
 *
 * Same rules as scripts/hero-variants.mjs: generated into public/images/,
 * uploaded by `npm run b2:sync`, never upscaled, and any modern-format variant
 * larger than the JPEG at the same width fails the run.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTHS = [480, 720];
const QUALITY = { avif: 52, webp: 72, jpeg: 78 };

const dir = path.resolve('public/images');
const blog = path.resolve('src/content/blog');
const force = process.argv.includes('--force');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

/* Only the images posts actually use: the folder also holds the features of
   posts retired in the consolidation, which need no new variants. */
const sources = new Set();
for (const file of fs.readdirSync(blog).filter((f) => f.endsWith('.md'))) {
  const front = fs
    .readFileSync(path.join(blog, file), 'utf8')
    .split('\n---')[0];
  const m = front.match(/^image:\s*["']?\/images\/([^"'\s]+-feature\.jpg)/m);
  if (m) sources.add(m[1]);
}

let written = 0;
let skipped = 0;
const oversized = [];

for (const source of [...sources].sort()) {
  const input = path.join(dir, source);
  if (!fs.existsSync(input)) {
    console.error(`feature-variants: ${source} not found in public/images`);
    process.exit(1);
  }
  const meta = await sharp(input).metadata();
  const base = source.replace(/\.jpg$/, '');
  for (const WIDTH of WIDTHS) {
    if (WIDTH >= meta.width) continue; /* never upscale */

    const jpegPath = path.join(dir, `${base}-${WIDTH}.jpg`);
    if (force || !fs.existsSync(jpegPath)) {
      await sharp(input)
        .resize({ width: WIDTH })
        .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
        .toFile(jpegPath);
      written++;
    } else skipped++;
    const jpegBytes = fs.statSync(jpegPath).size;

    for (const format of ['avif', 'webp']) {
      const name = `${base}-${WIDTH}.${format}`;
      const out = path.join(dir, name);
      if (force || !fs.existsSync(out)) {
        await sharp(input)
          .resize({ width: WIDTH })
          [format]({ quality: QUALITY[format] })
          .toFile(out);
        written++;
      } else skipped++;
      const bytes = fs.statSync(out).size;
      if (bytes >= jpegBytes)
        oversized.push(`${name}: ${kb(bytes)} vs jpeg ${kb(jpegBytes)}`);
    }
  }
}

console.log(
  `feature-variants: ${sources.size} featured images, ${written} written, ${skipped} already present.`,
);
if (oversized.length) {
  console.error(
    `feature-variants: ${oversized.length} variant(s) are bigger than the JPEG:\n  ${oversized.join('\n  ')}`,
  );
  process.exit(1);
}

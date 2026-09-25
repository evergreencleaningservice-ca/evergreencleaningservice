/**
 * Generates responsive AVIF/WebP/JPEG derivatives from the dedicated masters
 * in `_research/dedicated-sources/` into `public/images/`.
 *
 *   node scripts/refresh-images.mjs [--force]
 *
 * Per master `<name>.png`:
 *   <name>-{480,768,1200}.{avif,webp,jpg}   responsive set (3:2)
 *   <name>.jpg                              1200px fallback / lightbox target
 *   <name>-300x150.jpg                      list thumbnail (2:1 crop)
 *   <name>-og.jpg                           1200x630 social crop
 * The hero master (1942x809) gets {480,768,1000,1600} instead, and mobile
 * crops (`-m480`, portrait-ish 4:5, focus on centre) for narrow screens.
 * Same house rules as hero-variants.mjs: a modern format larger than the JPEG
 * at the same width is refused.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = path.resolve('_research/dedicated-sources');
const out = path.resolve('public/images');
const force = process.argv.includes('--force');
const Q = { avif: 52, webp: 72, jpeg: 78 };
const HERO = 'evergreen-modern-commercial-cleaning-hero';
const bad = [];
let n = 0;

const write = async (img, file, fmt) => {
  const f = path.join(out, file);
  if (!force && fs.existsSync(f)) return null;
  const buf = await img.clone()[fmt === 'jpg' ? 'jpeg' : fmt](
    fmt === 'jpg' ? { quality: Q.jpeg, mozjpeg: true } : { quality: Q[fmt] },
  ).toBuffer();
  fs.writeFileSync(f, buf);
  n++;
  return buf.length;
};

for (const file of fs.readdirSync(src).filter((f) => f.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '');
  const input = path.join(src, file);
  const isHero = name === HERO;
  const widths = isHero ? [480, 768, 1000, 1600] : [480, 768, 1200];
  for (const w of widths) {
    const base = sharp(input).resize({ width: w });
    const sizes = {};
    for (const fmt of ['jpg', 'webp', 'avif']) sizes[fmt] = await write(base, `${name}-${w}.${fmt}`, fmt);
    for (const fmt of ['webp', 'avif']) {
      if (sizes[fmt] && sizes.jpg && sizes[fmt] > sizes.jpg) bad.push(`${name}-${w}.${fmt}`);
    }
  }
  if (isHero) {
    // Mobile focal crop: centre 4:5 slice of the wide montage.
    for (const fmt of ['jpg', 'webp', 'avif']) {
      await write(sharp(input).resize({ width: 640, height: 800, fit: 'cover', position: 'centre' }), `${name}-mobile-640x800.${fmt}`, fmt);
    }
    await write(sharp(input).resize({ width: 1200, height: 630, fit: 'cover' }), `${name}-og.jpg`, 'jpg');
    continue;
  }
  await write(sharp(input).resize({ width: 1200 }), `${name}.jpg`, 'jpg');
  await write(sharp(input).resize({ width: 300, height: 150, fit: 'cover', position: 'attention' }), `${name}-300x150.jpg`, 'jpg');
  await write(sharp(input).resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' }), `${name}-og.jpg`, 'jpg');
}
console.log(`wrote ${n} files`);
if (bad.length) { console.error('modern format larger than JPEG:', bad.join(', ')); process.exit(1); }

/**
 * Generates the responsive AVIF/WebP/JPEG variants the hero serves.
 *
 *   node --experimental-strip-types scripts/hero-variants.mjs [--force]
 *
 * WHY A SCRIPT AND NOT `astro:assets`. Astro's image service works on assets
 * imported from `src/` and emits them to `dist/_astro/`. Every image on this
 * site is served from the Backblaze bucket instead — that is the house
 * standard, and `scripts/images.mjs` fails the build if a `/images/`
 * reference survives into the output. Letting Astro emit hero variants would
 * split image delivery across two origins and route the single most important
 * request on the site through the Worker rather than the CDN.
 *
 * So the variants are generated into `public/images/`, uploaded by
 * `npm run b2:sync` with everything else, and referenced as ordinary
 * `/images/...` paths that the build repoints at the bucket.
 *
 * WIDTHS. The sources are 1000x667. There is no point emitting anything
 * wider — upscaling makes a bigger file that is not a sharper picture — so
 * 1000 is the ceiling and 480/768 cover phones and tablets. The hero is
 * full-bleed, so `sizes="100vw"`.
 *
 * SIZE IS A GATE, NOT A HOPE. A modern format is only an improvement if the
 * file is actually smaller. An AVIF encoder given the wrong quality will
 * happily produce something larger than the JPEG it replaces, and the page
 * then downloads more bytes for the same picture. Every variant is compared
 * against the JPEG at the same width and anything bigger is refused, loudly.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/* The current hero is the generated commercial-cleaning montage (1916x821
   PNG). Its 1600 variant keeps wide desktops sharp; 480/768/1000 cover phones
   and tablets. The earlier slideshow sources are kept so their existing
   variants stay reproducible, but the homepage no longer references them. */
const LEGACY_WIDTHS = [480, 768, 1000];
const SOURCES = [
  { file: 'business-team.jpg', widths: LEGACY_WIDTHS },
  { file: 'business-introductions.jpg', widths: LEGACY_WIDTHS },
  { file: 'toronto-commercial-cleaning-business-meeting.jpg', widths: LEGACY_WIDTHS },
];

/* Chosen by measuring, not by habit: these land every variant well under the
   JPEG at the same width while staying visually indistinguishable at hero
   scale behind a 30% black overlay. */
const QUALITY = { avif: 52, webp: 72, jpeg: 78 };

const dir = path.resolve('public/images');
const force = process.argv.includes('--force');

const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

let written = 0;
let skipped = 0;
const oversized = [];

for (const { file: source, widths } of SOURCES) {
  const input = path.join(dir, source);
  if (!fs.existsSync(input)) {
    console.error(`hero-variants: ${source} not found in public/images`);
    process.exit(1);
  }
  const base = source.replace(/\.(jpe?g|png)$/i, '');
  const meta = await sharp(input).metadata();

  for (const width of widths) {
    if (width > meta.width) continue; /* never upscale */

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
        await sharp(input)
          .resize({ width })
          [format]({ quality: QUALITY[format] })
          .toFile(out);
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

/* The homepage's rotating office slides (31 Oct 2026, client: "use an
   office", no people except the gloved hand). The sources are 1200x800
   stock photographs, so each is cut to the hero's 2.4:1 at 1200 wide — no
   1600, which would only be an upscale — and to a 640x800 phone crop.
   `y` and `x` place each crop on the photo's subject, as fractions of the
   spare height and width. */
const OFFICE_SLIDES = [
  { file: 'gallery-corporate-office-cleaning.jpg', y: 0.6, x: 0.62 },
  { file: 'office-cleaning-cost-boardroom.jpg', y: 0.45, x: 0.55 },
  { file: 'spring-office-desk-cleaning-toronto.jpg', y: 0.75, x: 0.85 },
];
const SLIDE_WIDTHS = [480, 768, 1000, 1200];

for (const { file, y, x } of OFFICE_SLIDES) {
  const input = path.join(dir, file);
  const base = `${file.replace(/\.jpe?g$/i, '')}-hero`;
  const { width: w, height: h } = await sharp(input).metadata();
  const wide = { left: 0, top: Math.round((h - Math.round(w / 2.4)) * y), width: w, height: Math.round(w / 2.4) };
  const tallW = Math.round(h * 0.8);
  const tall = { left: Math.round((w - tallW) * x), top: 0, width: tallW, height: h };

  const emit = async (name, pipeline) => {
    const sizes = {};
    for (const format of ['jpg', 'avif', 'webp']) {
      const out = path.join(dir, `${name}.${format}`);
      if (force || !fs.existsSync(out)) {
        await pipeline()[format === 'jpg' ? 'jpeg' : format](
          format === 'jpg' ? { quality: QUALITY.jpeg, mozjpeg: true } : { quality: QUALITY[format] },
        ).toFile(out);
        written++;
      } else skipped++;
      sizes[format] = fs.statSync(out).size;
    }
    for (const format of ['avif', 'webp'])
      if (sizes[format] >= sizes.jpg) oversized.push({ name: `${name}.${format}`, bytes: sizes[format], jpegBytes: sizes.jpg });
  };

  for (const width of SLIDE_WIDTHS.filter((sw) => sw <= w))
    await emit(`${base}-${width}`, () => sharp(input).extract(wide).resize({ width }));
  await emit(`${base}-mobile-640x800`, () => sharp(input).extract(tall).resize({ width: 640, height: 800 }));
}

console.log(`\nhero-variants: ${written} written, ${skipped} already present.`);

if (oversized.length) {
  console.error(
    `\nhero-variants: ${oversized.length} variant(s) are BIGGER than the JPEG they replace.\n` +
      `  A modern format that weighs more is not an optimisation, it is a regression\n` +
      `  wearing a new extension. Lower the quality in QUALITY above, or drop the\n` +
      `  format for these sizes.\n` +
      oversized.map((o) => `    ${o.name}: ${kb(o.bytes)} vs ${kb(o.jpegBytes)}`).join('\n')
  );
  process.exit(1);
}

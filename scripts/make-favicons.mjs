/**
 * Build the favicon set from the client's actual logo mark.
 *
 * WHAT WAS THERE BEFORE: a flat green rounded-square with a white letter "E"
 * on it. Nobody's brand — invented as a placeholder and never replaced, so
 * every browser tab, bookmark and phone home-screen showed a generic tile
 * instead of the company's mark.
 *
 * WHY IT COULD NOT JUST BE COPIED FROM THE ORIGINAL. There is nothing to
 * copy. The live site emits no `<link rel="icon">` at all, `/favicon.ico`
 * answers the challenge interstitial rather than a file, and the Internet
 * Archive holds no WordPress site-icon derivative for this domain. The
 * original never had a real favicon — which is a gap to close, not a
 * difference to preserve.
 *
 * SO IT IS CUT FROM THE LOGO. The brand mark is the house-and-leaves glyph at
 * the left of `cropped-evergreen-cleaning-toronto-logo-banner.jpg`. Its bounds
 * are MEASURED, not guessed: a column-by-column ink scan of the logo finds the
 * glyph running x 37–240 and y 31–235, with a clean 31px empty gutter at
 * 241–272 separating it from the "evergreen" wordmark. Those numbers are
 * recomputed on every run, so a change to the logo file moves the crop instead
 * of silently slicing through a letter.
 *
 * WHY THE WORDMARK IS LEFT OUT. At 32px a five-syllable word is a grey smear.
 * The glyph is the only part of this logo that survives being that small, and
 * it is the part people recognise.
 *
 * Usage: node scripts/make-favicons.mjs [--write]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WRITE = process.argv.includes('--write');
const LOGO = path.resolve('public/images/cropped-evergreen-cleaning-toronto-logo-banner.jpg');
const OUT = path.resolve('public');

/** Near-white is background; anything else is ink. */
const isInk = (r, g, b) => !(r > 235 && g > 235 && b > 235);

/**
 * Find the logo's leading glyph by scanning ink density per column and
 * stopping at the first gutter wide enough to be a real separation rather
 * than the space inside a letter.
 */
const measureGlyph = async () => {
  const { width, height } = await sharp(LOGO).metadata();
  const { data, info } = await sharp(LOGO).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  const col = new Array(width).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * ch;
      if (isInk(data[i], data[i + 1], data[i + 2])) col[x]++;
    }
  }

  const left = col.findIndex((v) => v > 0);
  if (left === -1) throw new Error('no ink found in the logo');

  /* The first gutter of 8px or more after the glyph starts. */
  let right = width - 1;
  let run = 0;
  for (let x = left; x < width; x++) {
    if (col[x] === 0) {
      run++;
      if (run >= 8) {
        right = x - run;
        break;
      }
    } else run = 0;
  }

  /* Vertical bounds of that column range only. */
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = left; x <= right; x++) {
      const i = (y * width + x) * ch;
      if (isInk(data[i], data[i + 1], data[i + 2])) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        break;
      }
    }
  }

  return { left, right, top, bottom, width: right - left + 1, height: bottom - top + 1 };
};

/**
 * A square PNG of the glyph, centred, on white, with breathing room.
 *
 * WHITE, NOT TRANSPARENT: the mark is drawn to sit on white, and a
 * transparent icon inverts badly against a dark browser theme. Apple's
 * home-screen icon flattens transparency onto black, which would put a green
 * house in a black box on every iPhone.
 *
 * 8% PADDING, not more. A favicon is read at 16 pixels; every pixel spent on
 * margin is one not spent on the mark. Enough to keep it off the edge, not
 * enough to shrink it.
 *
 * PALETTE-QUANTISED, which is the whole file-size story. The artwork is two
 * colours and an antialiased edge between them, so truecolour PNG is pure
 * waste: the 512 came out at 260KB before this and 8KB after. A favicon that
 * costs a quarter of a megabyte is a favicon that delays the page it
 * decorates.
 */
const tile = async (glyph, size) => {
  const pad = Math.round(size * 0.08);
  const inner = size - pad * 2;
  const mark = await sharp(LOGO)
    .extract({ left: glyph.left, top: glyph.top, width: glyph.width, height: glyph.height })
    .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    /* `colors`, the US spelling — sharp does NOT accept `colours` and
       silently ignores it, falling back to a 256-entry palette. That is why
       the 512 was 80KB after the first attempt at quantising it and 36KB
       after the option name was corrected. A silently-ignored option is worse
       than a rejected one. */
    .png({ palette: true, colors: 16, compressionLevel: 9, effort: 10 })
    .toBuffer();
};

/**
 * An ICO wrapping PNG payloads.
 *
 * sharp cannot write ICO, and it does not need to: since Windows Vista the
 * format accepts a whole PNG as an entry's payload, which every browser in
 * use understands. Three sizes because 16 is the tab, 32 the bookmark bar and
 * 48 the Windows shortcut, and a single-size ICO gets scaled badly at the
 * other two.
 */
const buildIco = (pngs) => {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width, 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
};

const glyph = await measureGlyph();
console.log(
  `glyph measured at x ${glyph.left}–${glyph.right}, y ${glyph.top}–${glyph.bottom} ` +
    `(${glyph.width}×${glyph.height})`
);

const sizes = [16, 32, 48, 180, 512];
const made = {};
for (const s of sizes) made[s] = await tile(glyph, s);

const files = {
  'favicon.ico': buildIco([16, 32, 48].map((size) => ({ size, buf: made[size] }))),
  'favicon-32.png': made[32],
  'favicon-512.png': made[512],
  'apple-touch-icon.png': made[180],
};

for (const [name, buf] of Object.entries(files)) {
  const dest = path.join(OUT, name);
  const before = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  if (WRITE) fs.writeFileSync(dest, buf);
  console.log(`  ${name.padEnd(22)} ${before}b → ${buf.length}b`);
}

console.log(WRITE ? '\nwritten' : '\ndry run — pass --write to apply');

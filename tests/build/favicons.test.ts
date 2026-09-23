/**
 * @vitest-environment node
 *
 * The favicon is the company's mark, and the files behind it are real.
 *
 * WHAT WAS THERE: a flat green rounded-square with a white letter "E" on it.
 * Nobody's brand — a placeholder that got invented early, never replaced, and
 * shipped to every browser tab, bookmark and phone home screen. It was found
 * by someone looking at a tab, which is the only way it ever gets found.
 *
 * It could not be copied from the original, because the original has none:
 * the live site emits no `<link rel="icon">` at all, `/favicon.ico` answers
 * the challenge interstitial rather than a file, and the Internet Archive
 * holds no WordPress site-icon derivative. So the set is cut from the logo's
 * house-and-leaves glyph by `scripts/make-favicons.mjs`, which MEASURES the
 * glyph's bounds rather than hardcoding a crop.
 *
 * WHAT THIS GUARDS. Three things, each of which has a way of going wrong
 * quietly:
 *
 *   the files EXIST and DECODE at the sizes they claim — a favicon nobody
 *   looks at is exactly where a truncated or zero-byte file survives;
 *
 *   the .ico is a real multi-size icon rather than a PNG with the wrong
 *   extension, and the markup's `sizes` matches what is actually inside it;
 *
 *   they stay SMALL. The 512 was 260KB before it was quantised, and again
 *   80KB when the quantise option was misspelled and silently ignored. A
 *   quarter-megabyte favicon delays the page it decorates.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const pub = path.join(repo, 'public');

const EXPECTED = [
  { file: 'favicon-32.png', size: 32, maxBytes: 4_000 },
  { file: 'favicon-512.png', size: 512, maxBytes: 60_000 },
  { file: 'apple-touch-icon.png', size: 180, maxBytes: 20_000 },
];

describe('the favicon set', () => {
  it.each(EXPECTED)('$file decodes at $size×$size', async ({ file, size }) => {
    const meta = await sharp(path.join(pub, file)).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(size);
    expect(meta.height).toBe(size);
  });

  it.each(EXPECTED)('$file stays under $maxBytes bytes', ({ file, maxBytes }) => {
    expect(fs.statSync(path.join(pub, file)).size).toBeLessThan(maxBytes);
  });

  it('favicon.ico is a real ICO carrying 16, 32 and 48', () => {
    const b = fs.readFileSync(path.join(pub, 'favicon.ico'));
    /* Header: reserved 0, type 1 (icon), then the count. A PNG renamed to
       .ico fails here rather than in a browser six months later. */
    expect(b.readUInt16LE(0)).toBe(0);
    expect(b.readUInt16LE(2)).toBe(1);
    const count = b.readUInt16LE(4);
    expect(count).toBe(3);

    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      const o = 6 + i * 16;
      sizes.push(b.readUInt8(o) || 256);
      /* Every entry must point at bytes that are actually in the file. */
      const length = b.readUInt32LE(o + 8);
      const offset = b.readUInt32LE(o + 12);
      expect(offset + length).toBeLessThanOrEqual(b.length);
      expect(length).toBeGreaterThan(0);
    }
    expect(sizes.sort((x, y) => x - y)).toEqual([16, 32, 48]);
  });

  it('is the brand mark, not a flat placeholder tile', async () => {
    /**
     * The "E" tile was one green, one white, and hard edges. The real mark is
     * a drawing: leaves, a roof, windows, and the antialiasing between them.
     *
     * Distinct-colour count is the cheap way to tell those apart — the
     * placeholder had a handful, the mark has many more even after palette
     * quantisation. It is a smoke test, not a likeness check; no automated
     * test can confirm a logo is the right logo.
     */
    const { data, info } = await sharp(path.join(pub, 'favicon-512.png'))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const seen = new Set<string>();
    for (let i = 0; i < data.length; i += info.channels) {
      seen.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    }
    expect(seen.size).toBeGreaterThan(8);
  });

  it('both layouts declare the icons, and the .ico claims the right sizes', () => {
    for (const layout of ['BaseLayout.astro', 'LandingLayout.astro']) {
      const src = fs.readFileSync(path.join(repo, 'src/layouts', layout), 'utf8');
      expect(src, layout).toContain('href="/favicon.ico" sizes="16x16 32x32 48x48"');
      expect(src, layout).toContain('href="/favicon-512.png"');
      expect(src, layout).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
    }
  });
});

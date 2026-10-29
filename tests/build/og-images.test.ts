/**
 * @vitest-environment node
 *
 * The layout declares og:image:width 1200 and og:image:height 630 on every
 * page (src/layouts/BaseLayout.astro). That is only true while every social
 * card in public/images is exactly that size, so this holds them to it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = path.resolve(import.meta.dirname, '../../public/images');

/** Width and height from a baseline or progressive JPEG's SOF marker. */
function jpegSize(file: string): [number, number] {
  const d = fs.readFileSync(file);
  let i = 2;
  while (i < d.length) {
    if (d[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = d[i + 1];
    if (marker >= 0xc0 && marker <= 0xc2) return [d.readUInt16BE(i + 7), d.readUInt16BE(i + 5)];
    i += 2 + d.readUInt16BE(i + 2);
  }
  return [0, 0];
}

describe('social card images', () => {
  const cards = fs.readdirSync(dir).filter((f) => f.endsWith('-og.jpg'));

  it('exist', () => {
    expect(cards.length).toBeGreaterThan(0);
  });

  it('are all 1200x630, as the layout says they are', () => {
    const wrong = cards.filter((f) => jpegSize(path.join(dir, f)).join('x') !== '1200x630');
    expect(wrong).toEqual([]);
  });
});

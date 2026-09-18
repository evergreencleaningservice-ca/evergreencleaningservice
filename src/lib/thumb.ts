/**
 * The 300x150 list thumbnail.
 *
 * WordPress generates a `-300x150` crop of every featured image and that crop —
 * not the full-size upload — is what the original's post lists render. A post's
 * frontmatter points at the full-size file, so this resolves the crop beside it
 * when one was recovered, and falls back to the full-size image when it was not.
 *
 * The lookup runs at build time against `public/images`, so a crop that arrives
 * later is picked up by the next build with no edit to the post.
 */
import { readdirSync } from 'node:fs';

const IMAGES = new URL('../../public/images/', import.meta.url);

let files: Set<string> | null = null;
const listing = () => {
  if (!files) {
    try {
      files = new Set(readdirSync(IMAGES));
    } catch {
      files = new Set();
    }
  }
  return files;
};

export function thumb(image: string | undefined): string | undefined {
  if (!image) return image;

  const name = image.split('/').pop() ?? '';
  if (/-300x150\.[a-z]+$/i.test(name)) return image;

  const ext = name.match(/\.([a-z]+)$/i)?.[1];
  if (!ext) return image;

  // `-scaled` and `-1024x682` are WordPress's other derivatives of the same
  // upload; strip either before asking for the list crop.
  const stem = name.slice(0, -(ext.length + 1)).replace(/-scaled$|-\d+x\d+$/, '');

  for (const candidate of [`${stem}-300x150.${ext}`, `${stem}-300x150.jpg`]) {
    if (listing().has(candidate)) return `/images/${candidate}`;
  }
  return image;
}

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
import path from 'node:path';

/* Bundled, `import.meta.url` points at a build chunk rather than at this file,
   so the directory is resolved from the project root the build runs in. */
const IMAGES = path.join(process.cwd(), 'public', 'images');

let files: Set<string> | null = null;
const listing = () => {
  if (!files) {
    files = new Set(readdirSync(IMAGES));
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

/**
 * The same list thumbnail, responsive (SEO audit H10, 29 Oct 2026).
 *
 * The 300x150 crop is drawn full width on a phone, about 3.6x its size, so it
 * looked soft. Refreshed posts have a 960x480 feature image beside the crop,
 * as JPEG, AVIF and WebP, which this offers alongside it. Posts without one
 * keep the plain crop.
 */
export function thumbSet(image: string | undefined):
  | { src: string; jpg: string; avif: string; webp: string }
  | null {
  const small = thumb(image);
  if (!small) return null;
  const m = small.match(/^\/images\/(.+)-300x150\.jpg$/);
  if (!m) return null;
  const stem = m[1];
  const has = (f: string) => listing().has(f);
  if (!has(`${stem}.jpg`) || !has(`${stem}.avif`) || !has(`${stem}.webp`)) return null;
  return {
    src: small,
    jpg: `/images/${stem}-300x150.jpg 300w, /images/${stem}.jpg 960w`,
    avif: `/images/${stem}.avif 960w`,
    webp: `/images/${stem}.webp 960w`,
  };
}

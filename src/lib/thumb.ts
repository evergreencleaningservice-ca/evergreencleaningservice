/**
 * The responsive set a post's featured image offers as a list thumbnail.
 *
 * Until 6 Nov 2026 the post lists and the guides' related cards drew
 * WordPress's `-300x150.jpg` crop of every featured image, as the original
 * did. On a phone the list column is about 380px, so the 300px crop was
 * stretched and soft on a 2x screen, and it shipped as JPEG only (SEO audit,
 * images finding 4). The crops stay in public/images because the legacy
 * upload URLs redirect to them (src/data/upload-redirects.json); nothing
 * renders them any more.
 *
 * A thumbnail now offers the featured image's own variants: the 480 and 720
 * (scripts/feature-variants.mjs) or 480 and 768 (the guides' sets)
 * AVIF/WebP/JPEG siblings, plus the full-size siblings where the image ships
 * in all three formats. scripts/content-variants.mjs fills in a post whose
 * image has neither. The 480 JPEG is the `src`, so the declared width and
 * height are its real ones and the box is reserved before the file arrives.
 *
 * The lookup runs at build time against `public/images`, so a set that
 * arrives later is picked up by the next build with no edit to the post.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { jpegSize } from './responsive-images.mjs';

/* Bundled, `import.meta.url` points at a build chunk rather than at this file,
   so the directory is resolved from the project root the build runs in. */
const IMAGES = path.join(process.cwd(), 'public', 'images');
const WIDTHS = [480, 720, 768];
const FORMATS = ['avif', 'webp', 'jpg'] as const;

export interface ThumbSet {
  /** The 480 JPEG: what a browser with no `srcset` support fetches. */
  src: string;
  width: number;
  height: number;
  avif: string;
  webp: string;
  jpg: string;
}

const stemOf = (image: string | undefined): string | null => {
  const m = image?.match(/^\/images\/([^/?#]+)\.jpe?g$/i);
  // `-scaled` and `-1024x682` are WordPress's other derivatives of the same
  // upload; strip either before looking for the set.
  return m ? m[1].replace(/-scaled$|-\d+x\d+$/, '') : null;
};

/** The image's own width and height, for a thumbnail that has no set. */
export function intrinsic(image: string | undefined): { width: number; height: number } | null {
  const file = image?.match(/^\/images\/([^/?#]+\.jpe?g)$/i)?.[1];
  return file ? jpegSize(path.join(IMAGES, decodeURIComponent(file))) : null;
}

export function thumbSet(image: string | undefined): ThumbSet | null {
  const stem = stemOf(image);
  if (!stem) return null;
  const has = (f: string) => existsSync(path.join(IMAGES, f));

  const candidates = WIDTHS.filter((w) => FORMATS.every((ext) => has(`${stem}-${w}.${ext}`))).map((w) => ({
    w,
    name: (ext: string) => `${stem}-${w}.${ext}`,
  }));
  if (!candidates.some((c) => c.w === 480)) return null;

  const full = jpegSize(path.join(IMAGES, `${stem}.jpg`));
  if (full && full.width > candidates.at(-1)!.w && FORMATS.every((ext) => has(`${stem}.${ext}`)))
    candidates.push({ w: full.width, name: (ext: string) => `${stem}.${ext}` });

  const size = jpegSize(path.join(IMAGES, `${stem}-480.jpg`));
  if (!size) return null;

  const set = (ext: string) => candidates.map((c) => `/images/${c.name(ext)} ${c.w}w`).join(', ');
  return {
    src: `/images/${stem}-480.jpg`,
    width: size.width,
    height: size.height,
    avif: set('avif'),
    webp: set('webp'),
    jpg: set('jpg'),
  };
}

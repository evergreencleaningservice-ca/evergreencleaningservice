// @ts-check
/**
 * Responsive body images, for every Markdown page (SEO audit H10, 29 Oct 2026).
 *
 * Content photos were written as `![alt](/images/name.jpg)`, which renders a
 * plain <img> of the full 1200x800 JPEG — 75-127 KB each, with no width or
 * height, sent to a 360px phone the same as to a desktop. Most of them already
 * have AVIF, WebP and JPEG siblings at 480, 768 and 1200px in public/images
 * (made for the service cards and the home page), so this rewrites such an
 * image as a <picture> that offers them, declares the master's size so the
 * page does not shift as it loads, and lazy-loads it.
 *
 * An image with no siblings is left exactly as it is, apart from gaining its
 * width and height when the master is a JPEG this can read.
 */
import fs from 'node:fs';
import path from 'node:path';

const IMAGES = path.join(process.cwd(), 'public', 'images');
const WIDTHS = [480, 768, 1200];
/* The content column: 790px beside a sidebar on a desktop, the full width on
   anything narrower. */
const SIZES = '(min-width: 1200px) 790px, (min-width: 992px) 650px, 100vw';

/** Width and height from a JPEG's SOF marker, or null. */
export function jpegSize(file) {
  let d;
  try {
    d = fs.readFileSync(file);
  } catch {
    return null;
  }
  if (d[0] !== 0xff || d[1] !== 0xd8) return null;
  let i = 2;
  while (i < d.length) {
    if (d[i] !== 0xff) {
      i++;
      continue;
    }
    const m = d[i + 1];
    if (m >= 0xc0 && m <= 0xc2) return { width: d.readUInt16BE(i + 7), height: d.readUInt16BE(i + 5) };
    i += 2 + d.readUInt16BE(i + 2);
  }
  return null;
}

/** The responsive set for `/images/<base>.jpg`, or null if it has none. */
export function responsiveSet(src) {
  const m = /^\/images\/([^/?#]+)\.jpe?g$/i.exec(src);
  if (!m) return null;
  const base = m[1];
  const widths = WIDTHS.filter((w) =>
    ['avif', 'webp', 'jpg'].every((ext) => fs.existsSync(path.join(IMAGES, `${base}-${w}.${ext}`)))
  );
  if (!widths.length) return null;
  const set = (ext) => widths.map((w) => `/images/${base}-${w}.${ext} ${w}w`).join(', ');
  return { base, widths, avif: set('avif'), webp: set('webp'), jpg: set('jpg') };
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/**
 * Rewrite the rendered HTML of a Markdown body: each `<img src="/images/x.jpg">`
 * that has a responsive set becomes a `<picture>` offering it. Images already
 * inside a <picture>, or already carrying a srcset, are left alone.
 *
 * (A rehype plugin would be the tidier home, but Astro 7's default Markdown
 * processor does not run rehype plugins without swapping the processor for
 * every page, so this runs on the HTML instead, from `normalizeBody`.)
 */
export function responsiveImagesHtml(html) {
  return html.replace(/(<source[^>]*>\s*)?<img\b[^>]*>/g, (tag, source) => {
    if (source || /\ssrcset=/.test(tag)) return tag;
    const src = attr(tag, 'src');
    if (!src) return tag;
    const set = responsiveSet(src);
    if (!set) return tag;
    const fallback = `/images/${set.base}-${set.widths.includes(768) ? 768 : set.widths.at(-1)}.jpg`;
    const img = tag
      .replace(/\ssrc="[^"]*"/, ` src="${fallback}" srcset="${set.jpg}" sizes="${SIZES}"`);
    return `<picture><source type="image/avif" srcset="${set.avif}" sizes="${SIZES}"><source type="image/webp" srcset="${set.webp}" sizes="${SIZES}">${img}</picture>`;
  });
}

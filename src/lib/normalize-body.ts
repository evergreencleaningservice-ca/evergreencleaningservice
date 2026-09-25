/**
 * Cleans up rendered Markdown bodies that came from the archived WordPress
 * HTML, so every route that renders ported copy behaves the same way.
 *
 * The body Markdown carries WordPress habits that do not belong in this build:
 *
 *  1. `/wp-content/uploads/<year>/<month>/<file>` is the old media path; this
 *     build serves the same files from `/images/<file>`.
 *  2. `astro.config.mjs` sets `trailingSlash: 'always'`, so an internal link
 *     written without its trailing slash would 404 rather than resolve.
 *  3. The archive writes `tel://` — the `//` turns the number into a URL
 *     authority, which some dialers refuse.
 *  4. Empty anchors are links with no accessible name, so assistive tech
 *     announces a link that leads nowhere.
 *  5. A `tel:` link written in Markdown has no component to carry its
 *     analytics location, so it is stamped here — `content`, which is what it
 *     is: a telephone number inside the prose of a page. Twenty-five of them
 *     came across from WordPress this way. Doing it at normalisation rather
 *     than leaving them to the runtime fallback means the inventory can
 *     require EVERY rendered link to carry explicit metadata, and a link with
 *     none becomes a build-time failure rather than a silent default.
 *  6. Every image in a body sits below the page header and any featured image,
 *     so they can all be lazy-loaded.
 *  7. Images with no `width`/`height` reserve no space until they load, which
 *     shifts the copy below them. Local `/images/` JPEG/PNG files are stamped
 *     with their intrinsic size so the browser can reserve the box.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function intrinsicSize(file: string): [number, number] | null {
  try {
    const path = join(process.cwd(), 'public', 'images', file);
    if (!existsSync(path)) return null;
    const b = readFileSync(path);
    if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
          return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return null;
}

export function normalizeBody(html: string): string {
  return html
    .replace(/(href|src)="\/wp-content\/uploads\/[^"]*?\/([^"/]+)"/g, '$1="/images/$2"')
    .replace(/href="(\/[^"?#]*)"/g, (whole, path: string) =>
      path.endsWith('/') || /\.[a-z0-9]{2,5}$/i.test(path) ? whole : `href="${path}/"`
    )
    .replace(/href="tel:\/\//g, 'href="tel:')
    .replace(
      /<a\b((?:[^>]*?\s)?href="tel:[^"]*"[^>]*)>/g,
      (whole, attrs: string) =>
        /\bdata-call-location=/.test(attrs) ? whole : `<a${attrs} data-call-location="content">`
    )
    .replace(/<a\b[^>]*>\s*<\/a>/g, '')
    .replace(/<img(?![^>]*\sloading=)\s/g, '<img loading="lazy" decoding="async" ')
    .replace(/<img(?![^>]*\swidth=)([^>]*?\ssrc="\/images\/([^"/]+\.(?:jpe?g|png))")/gi, (whole, _rest, file: string) => {
      const size = intrinsicSize(decodeURIComponent(file));
      return size ? whole.replace('<img', `<img width="${size[0]}" height="${size[1]}"`) : whole;
    });
}

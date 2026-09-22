/**
 * Which body images a page carries — the one definition, shared by the
 * manifest generator, the parity script and the build test.
 *
 * It lives here rather than in each caller because three copies of this
 * parsing already disagreed once, and the disagreement produced a finding
 * that was not real.
 */

/**
 * Site chrome: present on every page on both sides, so counting it tells you
 * nothing about a page and drowns what it would tell you.
 */
const CHROME = [
  /cropped-evergreen/i,
  /evergreen[-_]?logo/i,
  /evergreen-banner-logo/i,
  /Google-Review-Link/i,
];

/**
 * A placeholder rather than an asset.
 *
 * The obvious form is a `data:` URI — the 1×1 transparent GIF a lazy-loader
 * parks in `src` until it swaps the real address in. The non-obvious form is
 * what the locally-rendered archive contains: the renderer stripped the
 * `data:` prefix, leaving `image/gif;base64,R0lGODlh…`, which matches no
 * `data:` test at all. Both are matched here, and the second one is the
 * reason this function exists rather than a one-line regex at each call site.
 */
const isPlaceholder = (src: string): boolean =>
  /^data:/i.test(src.trim()) || /^[a-z]+\/[a-z0-9.+-]+;base64,/i.test(src.trim());

/**
 * The real address of one `<img>`, or '' if it has none.
 *
 * `data-src` WINS OVER `src` when `src` is a placeholder, and getting this
 * backwards is what made the homepage look as though it had lost an image:
 * the tag
 *
 *     <img src="image/gif;base64,R0lGODlh…" data-src="/images/free-quote-cta-button-1024x505.jpg">
 *
 * was recorded as carrying the base64 blob rather than the button, so the
 * manifest asked the port for an image that never existed and reported a loss
 * against a page that was complete.
 */
export function imageAddress(attrs: string): string {
  const src = attrs.match(/\bsrc="([^"]*)"/)?.[1] ?? '';
  const dataSrc = attrs.match(/\bdata-src="([^"]*)"/)?.[1] ?? '';
  if (src && !isPlaceholder(src)) return src;
  if (dataSrc && !isPlaceholder(dataSrc)) return dataSrc;
  return '';
}

/**
 * Strip the size suffix WordPress appends to a resized copy, so
 * `armstrong-logo-300x89.jpg` and `armstrong-logo.jpg` compare equal. A port
 * that serves one but not the other has not lost the image, and without this
 * the comparison is mostly false losses.
 */
export const imageStem = (name: string): string =>
  name
    .replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase();

/** Every non-chrome body image in a document, as comparable stems. */
export function bodyImages(html: string): Set<string> {
  const found = new Set<string>();
  for (const m of html.matchAll(/<img\b([^>]*?)\/?>/gi)) {
    const src = imageAddress(m[1]);
    if (!src) continue;
    const base = decodeURIComponent(src.split('?')[0].split('#')[0].split('/').pop() ?? '');
    if (!base) continue;
    if (CHROME.some((re) => re.test(base) || re.test(src))) continue;
    found.add(imageStem(base));
  }
  return found;
}

/**
 * Pages whose image set legitimately differs from the original.
 *
 * PAGINATED ARCHIVES. `/category/blog/page/N/` and `/insights/page/N/` list
 * post thumbnails, and the port paginates differently from WordPress. A
 * thumbnail that moved from page 3 to page 2 has not been lost, and comparing
 * these page by page reports a dozen losses that are all the same
 * non-problem.
 */
export const isPaginatedArchive = (route: string): boolean =>
  /^\/(category\/blog|insights)(\/page\/\d+)?\/$/.test(route);

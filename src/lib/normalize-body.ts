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
 *  5. Every image in a body sits below the page header and any featured image,
 *     so they can all be lazy-loaded.
 */
export function normalizeBody(html: string): string {
  return html
    .replace(/(href|src)="\/wp-content\/uploads\/[^"]*?\/([^"/]+)"/g, '$1="/images/$2"')
    .replace(/href="(\/[^"?#]*)"/g, (whole, path: string) =>
      path.endsWith('/') || /\.[a-z0-9]{2,5}$/i.test(path) ? whole : `href="${path}/"`
    )
    .replace(/href="tel:\/\//g, 'href="tel:')
    .replace(/<a\b[^>]*>\s*<\/a>/g, '')
    .replace(/<img(?![^>]*\sloading=)\s/g, '<img loading="lazy" decoding="async" ');
}

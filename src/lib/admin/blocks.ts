/**
 * A website post as blocks, and the blocks as the post's HTML.
 *
 * The editor (src/admin/blocks-editor.ts) edits a list of blocks, as UiD by
 * Rana's does (dist/post-blocks.js); the server turns them into HTML here
 * (Rana's server/blocks.mjs). Everything typed is escaped, and every image
 * and link address is checked, because this HTML is served on the live site
 * under its own origin.
 *
 *   h2, h3, h4   a heading (the post's title is its one h1)
 *   p            text, with **bold**, _italic_ and [words](address); a
 *                paragraph of "- " or "1. " lines is a list
 *   list         items, bulleted or numbered
 *   quote        a quotation
 *   img          an https image, its description, a caption, and whether it
 *                is the post's featured image (its picture on the blog list)
 *   grid         2 or 3 columns of cells: a heading, text, an optional picture
 *   embed        a YouTube, Instagram, TikTok, X, Facebook or LinkedIn link
 *
 * An embed is a picture card or a link, never an iframe: the site loads no
 * third-party frames, and a YouTube card links to the video with its own
 * thumbnail, as vinylwraptoronto.com's fallback does.
 */

export type Block =
  | { t: 'h2' | 'h3' | 'h4'; text: string }
  | { t: 'p'; text: string }
  | { t: 'list'; ordered: boolean; items: string[] }
  | { t: 'quote'; text: string }
  | { t: 'img'; url: string; alt: string; caption: string; featured?: boolean }
  | { t: 'grid'; cols: 2 | 3; cells: GridCell[] }
  | { t: 'embed'; url: string };

export interface GridCell {
  heading: string;
  text: string;
  url: string;
  alt: string;
}

export const BLOCK_TYPES = ['h2', 'h3', 'h4', 'p', 'list', 'quote', 'img', 'grid', 'embed'] as const;

const MAX_BLOCKS = 300;
const s = (v: unknown, max: number) => String(v ?? '').slice(0, max);

/** An image address the post may show: https, nothing that breaks out of an attribute. */
export const imageUrl = (raw: unknown): string => {
  const v = String(raw ?? '').trim();
  return /^https:\/\/[^\s"'<>\\]{1,500}$/.test(v) ? v : '';
};

/** A link a post may carry: https, http, mailto/tel, or a path on this site. */
export const linkUrl = (raw: string): string => {
  const v = String(raw ?? '').trim();
  if (/^\/(?!\/)[^\s"'<>\\]*$/.test(v)) return v;
  if (/^(https?:\/\/|mailto:|tel:)[^\s"'<>\\]+$/i.test(v)) return v;
  return '';
};

/** Keeps only well-formed blocks of known types; the page and the server both run it. */
export function cleanBlocks(raw: unknown[]): Block[] {
  const out: Block[] = [];
  for (const b of raw.slice(0, MAX_BLOCKS)) {
    if (!b || typeof b !== 'object') continue;
    const x = b as Record<string, unknown>;
    switch (x.t) {
      case 'h2':
      case 'h3':
      case 'h4':
        out.push({ t: x.t, text: s(x.text, 300) });
        break;
      case 'p':
        out.push({ t: 'p', text: s(x.text, 20000) });
        break;
      case 'quote':
        out.push({ t: 'quote', text: s(x.text, 4000) });
        break;
      case 'list':
        out.push({
          t: 'list',
          ordered: x.ordered === true,
          items: (Array.isArray(x.items) ? x.items : []).slice(0, 100).map((i) => s(i, 2000)),
        });
        break;
      case 'img':
        out.push({
          t: 'img',
          url: imageUrl(x.url),
          alt: s(x.alt, 300),
          caption: s(x.caption, 500),
          ...(x.featured === true ? { featured: true } : {}),
        });
        break;
      case 'grid':
        out.push({
          t: 'grid',
          cols: x.cols === 3 ? 3 : 2,
          cells: (Array.isArray(x.cells) ? x.cells : []).slice(0, 12).map((c) => {
            const cell = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
            return { heading: s(cell.heading, 300), text: s(cell.text, 4000), url: imageUrl(cell.url), alt: s(cell.alt, 300) };
          }),
        });
        break;
      case 'embed':
        out.push({ t: 'embed', url: s(x.url, 500).trim() });
        break;
    }
  }
  return out;
}

export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * One line of typed text as HTML: escaped first, then the marks. Only a link
 * whose address passes `linkUrl` becomes a link; anything else stays as the
 * words that were typed.
 */
export function inline(text: string): string {
  const links: string[] = [];
  // Links first, out of the way of the other marks (an address can hold "_").
  let out = String(text ?? '')
    .replace(/\u0000/g, '')
    .replace(/\[([^\]\n]{1,300})\]\(([^)\s]{1,500})\)/g, (whole, words: string, href: string) => {
    const ok = linkUrl(href);
    if (!ok) return whole;
    const external = /^https?:\/\//i.test(ok) && !/^https:\/\/(www\.)?evergreencleaningservice\.ca(\/|$)/i.test(ok);
    links.push(`<a href="${esc(ok)}"${external ? ' rel="noopener"' : ''}>${marks(esc(words))}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  out = marks(esc(out));
  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => links[Number(i)]);
}

const marks = (escaped: string) =>
  escaped
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_\n]+?)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');

const lines = (text: string) => text.split('\n').map(inline).join('<br>');

/** A paragraph block: blank lines split paragraphs, and a run of "- " or "1. " lines is a list. */
function paragraphs(text: string): string {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const ls = chunk.split('\n').map((l) => l.trim());
      if (ls.every((l) => /^[-*•]\s+/.test(l))) return `<ul>${ls.map((l) => `<li>${inline(l.replace(/^[-*•]\s+/, ''))}</li>`).join('')}</ul>`;
      if (ls.every((l) => /^\d+[.)]\s+/.test(l))) return `<ol>${ls.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
      const h = chunk.match(/^###\s+(.+)$/);
      if (h) return `<h3>${inline(h[1])}</h3>`;
      return `<p>${lines(chunk)}</p>`;
    })
    .join('\n');
}

export const youtubeId = (url: string): string | null =>
  (String(url).match(/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/) || [])[1] ?? null;

const EMBED_HOSTS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(x|twitter)\.com$/, 'X'],
  [/(^|\.)(facebook|fb)\.com$|(^|\.)fb\.watch$/, 'Facebook'],
  [/(^|\.)linkedin\.com$/, 'LinkedIn'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'],
];

/** Which platform an embed link is on, or null if it is not one the post takes. */
export function embedPlatform(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();
  return EMBED_HOSTS.find(([re]) => re.test(host))?.[1] ?? null;
}

const figure = (url: string, alt: string, caption: string, cls = 'post-image') =>
  `<figure class="${cls}"><img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async" style="max-width:100%;height:auto">${
    caption ? `<figcaption>${inline(caption)}</figcaption>` : ''
  }</figure>`;

function embed(url: string): string {
  const platform = embedPlatform(url);
  if (!platform) return '';
  const yt = platform === 'YouTube' ? youtubeId(url) : null;
  if (yt) {
    const watch = `https://www.youtube.com/watch?v=${yt}`;
    return `<figure class="post-embed-card post-embed-youtube"><a href="${esc(watch)}" rel="noopener"><img src="https://i.ytimg.com/vi/${esc(yt)}/hqdefault.jpg" alt="Watch the video on YouTube" width="480" height="360" loading="lazy" decoding="async" style="max-width:100%;height:auto"></a><figcaption><a href="${esc(watch)}" rel="noopener">Watch on YouTube</a></figcaption></figure>`;
  }
  return `<p class="post-embed-link"><a href="${esc(url)}" rel="noopener">See this on ${esc(platform)}</a></p>`;
}

export interface SocialSlot {
  name: string;
  href: string;
}

/** The "Follow this job on social" row at the end of the post. */
export function socialsHtml(slots: SocialSlot[]): string {
  const ok = slots.filter((x) => /^https:\/\//.test(x.href));
  if (!ok.length) return '';
  return `<aside class="post-socials" aria-label="Follow this job on social"><h2>Follow this job on social</h2><ul>${ok
    .map((x) => `<li><a href="${esc(x.href)}" rel="noopener">${esc(x.name)}</a></li>`)
    .join('')}</ul></aside>`;
}

/** The post's body as HTML. */
export function blocksToHtml(blocks: Block[], socials: SocialSlot[] = []): string {
  const parts = cleanBlocks(blocks).map((b) => {
    switch (b.t) {
      case 'h2':
      case 'h3':
      case 'h4':
        return b.text.trim() ? `<${b.t}>${inline(b.text)}</${b.t}>` : '';
      case 'p':
        return paragraphs(b.text);
      case 'quote':
        return b.text.trim() ? `<blockquote><p>${lines(b.text.trim())}</p></blockquote>` : '';
      case 'list': {
        const items = b.items.filter((i) => i.trim());
        const tag = b.ordered ? 'ol' : 'ul';
        return items.length ? `<${tag}>${items.map((i) => `<li>${lines(i.trim())}</li>`).join('')}</${tag}>` : '';
      }
      case 'img':
        return b.url ? figure(b.url, b.alt, b.caption) : '';
      case 'grid': {
        const cells = b.cells.filter((c) => c.heading.trim() || c.text.trim() || c.url);
        if (!cells.length) return '';
        const min = b.cols === 3 ? 200 : 280;
        return `<div class="post-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${min}px,1fr));gap:24px;margin:0 0 1.5em">${cells
          .map(
            (c) =>
              `<div class="post-grid-cell">${c.url ? figure(c.url, c.alt, '') : ''}${c.heading.trim() ? `<h3>${inline(c.heading)}</h3>` : ''}${
                c.text.trim() ? paragraphs(c.text) : ''
              }</div>`
          )
          .join('')}</div>`;
      }
      case 'embed':
        return embed(b.url);
    }
  });
  return [...parts, socialsHtml(socials)].filter(Boolean).join('\n');
}

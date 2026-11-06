/**
 * WordPress's `the_excerpt()` as the original's theme configures it: the post
 * body stripped to plain text, cut to the first 30 words, then an ellipsis.
 *
 * 30, not WordPress's default 55 — every excerpt on the original stops at
 * exactly 30 words.
 *
 * Headings are dropped whole, not just their `#` markers (SEO audit, visual
 * finding 5). Every post opens with an H2, and in some it restates the title
 * ("How Often Should an Office Be Cleaned? An office used every weekday…"),
 * so the card read the title twice. The excerpt is the first sentences of
 * the body's prose.
 */
export const EXCERPT_WORDS = 30;

export function excerpt(body: string | undefined, fallback = ''): string {
  const text = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their text
    .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ') // html headings, text included
    .replace(/<[^>]+>/g, ' ') // inline html
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, '') // markdown headings, text included
    .replace(/^\s{0,3}>\s?/gm, '') // block quotes
    .replace(/[*_~`]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return fallback;
  const words = text.split(' ');
  if (words.length <= EXCERPT_WORDS) return text;
  return `${words.slice(0, EXCERPT_WORDS).join(' ')} …`;
}

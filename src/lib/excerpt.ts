/**
 * WordPress's `the_excerpt()` as the original's theme configures it: the post
 * body stripped to plain text, cut to the first 30 words, then an ellipsis.
 *
 * 30, not WordPress's default 55 — every excerpt on the original stops at
 * exactly 30 words.
 */
export const EXCERPT_WORDS = 30;

export function excerpt(body: string | undefined, fallback = ''): string {
  const text = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their text
    .replace(/<[^>]+>/g, ' ') // inline html
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // heading markers
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

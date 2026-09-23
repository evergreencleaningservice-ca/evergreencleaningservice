/**
 * Page titles.
 *
 * Google truncates a result title at roughly 60 characters. The original site
 * appended " - Evergreen Cleaning Service" to every page regardless, which put
 * 35 of its 64 titles over the limit — the brand pushed the words people
 * actually search for off the end of the result.
 *
 * So the brand is appended only when it fits. Where it does not, the page's own
 * title stands alone: a reader scanning results gains more from seeing the whole
 * headline than from seeing the company name on a page they have not opened
 * yet. Nothing is truncated — a title cut mid-word reads worse than a long one,
 * and Google does its own truncating anyway.
 *
 * Money pages keep the brand because their titles are short enough to. Long
 * blog-post headlines lose it, which is the right way round.
 */
import { site } from '../data/site';

/** What Google gives a title before it starts cutting. */
export const TITLE_LIMIT = 60;

const SUFFIX = ` - ${site.name}`;

export function pageTitle(title: string): string {
  const full = `${title}${SUFFIX}`;
  return full.length <= TITLE_LIMIT ? full : title;
}

/**
 * A paginated listing's description. Page 2 of an archive is not the same page
 * as page 1 and should not claim to be — four archive pages sharing one
 * description is four pages telling Google they are interchangeable.
 */
export function pageDescription(base: string, page: number, last: number): string {
  if (page <= 1) return base;
  const suffix = ` Page ${page} of ${last}.`;
  const room = 158 - suffix.length;
  const trimmed = base.length > room ? `${base.slice(0, room).trimEnd().replace(/[,.;:]$/, '')}…` : base;
  return `${trimmed}${suffix}`;
}

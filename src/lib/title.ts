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
 * One suffix, one rule (13 Nov 2026, SEO audit 11 Nov, onpage.md N4). Until
 * then four forms were live at once: " - Evergreen Office Cleaning" and
 * " - Evergreen" from this function, " | Evergreen" hard-coded into the money
 * pages' stored titles, and nothing at all on hand-set titles that bypassed
 * it. Every <title> now comes through here and ends " | Evergreen" when that
 * fits in 60 characters. The full company name is no longer appended: it is
 * in the logo, the schema and og:site_name, which is where Google takes the
 * site name it shows above the result. Stored titles must not carry the
 * suffix themselves, or it would be doubled; tests/build/titles.test.ts
 * checks the built pages for that.
 */

/** What Google gives a title before it starts cutting. */
export const TITLE_LIMIT = 60;

/** The one brand suffix every title uses when it fits. */
export const TITLE_SUFFIX = ' | Evergreen';

export function pageTitle(title: string): string {
  const branded = `${title}${TITLE_SUFFIX}`;
  return branded.length <= TITLE_LIMIT ? branded : title;
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

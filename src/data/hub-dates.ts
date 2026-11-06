/**
 * When each section hub's own text last changed: part of its sitemap
 * <lastmod> (src/lib/sitemap-lastmod.mjs). Added 6 Nov 2026, SEO audit
 * item 29.
 *
 * WHY A FIELD AND NOT THE PAGE FILE'S LAST COMMIT. The hubs used to be dated
 * by their src/pages/.../index.astro file, so "Polish hovers and bring back a
 * safe scroll-in reveal" (#81, 6 Nov 2026 17:29:27Z), which added a
 * `data-reveal` attribute and some CSS to all three and changed none of their
 * text, gave /locations/ and /industries/ one timestamp. A page file holds
 * markup and styles as well as words, so its commits cannot tell the two
 * apart; this field can.
 *
 * THE RULE. Change a hub's date, to the date and time of the edit (ISO 8601,
 * UTC), when an edit changes what that hub says itself: its heading, intro,
 * meta description, or the cards it writes out in its own words (for
 * /industries/, the INDUSTRIES list in src/data/industries.ts). Leave it alone
 * for markup, classes, styles, scripts and the shared layout. Never set it
 * ahead of the edit or back past one.
 *
 * What the hub shows of its members is dated by the members, not here:
 *
 *   /services/    the newest of this date and every service page's date (each
 *                 card is that service's own title, description and photo)
 *   /locations/   the newest of this date and every location's `updated`
 *                 field (each card is that location's name and focus)
 *   /industries/  this date alone: its cards come from src/data/industries.ts,
 *                 not from the two industry pages, so an edit to one of those
 *                 pages does not change the hub
 *
 * The first values are the committer times of the last commit that changed
 * each hub's text, read from the diffs. /industries/ predates this clone's
 * history (it is shallow), so its date was read from the repository's
 * history on GitHub.
 */
export const HUB_UPDATED = {
  /* The intro paragraph (SEO audit Phase 2, M11). */
  '/services/': '2026-10-30T15:17:42Z',
  /* The meta description, rewritten (commit 3a698ef, 15 Oct). */
  '/industries/': '2026-10-15T17:55:46Z',
  /* The meta description and coverage sentence, with the four new areas. */
  '/locations/': '2026-11-06T16:12:26Z',
} as const satisfies Record<string, string>;

export type Hub = keyof typeof HUB_UPDATED;

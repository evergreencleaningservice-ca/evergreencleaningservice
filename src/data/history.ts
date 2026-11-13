/**
 * The company's dated milestones, for a timeline on /about-us/ (13 Nov 2026,
 * comparison with impact.ca).
 *
 * impact.ca tells its story as a timeline. Ours can only hold facts this repo
 * already states WITH A DATE, each recording where it came from, so a
 * milestone can always be traced back to the client or to a page they
 * approved. Nothing may be added from memory, from a competitor's pattern or
 * by working one out: a wrong year on an About page is a false claim.
 *
 * Today that is one fact: founded in Toronto in 1989. The change of name from
 * Evergreen Cleaning Service to Evergreen Office Cleaning is NOT here, because
 * nothing in the repo says when it happened; add it with `source:
 * 'client, <date>'` once the client gives the year.
 *
 * The timeline renders only with TIMELINE_MIN milestones or more: a
 * one-entry "timeline" is just the founding year, which the page already
 * states in its first paragraph and in the facts block.
 */
import { site } from './site';

export interface Milestone {
  year: number;
  /** 1–12, only when the source gives the month. */
  month?: number;
  /** One sentence, in the site's voice. */
  text: string;
  /** Where the fact came from: a file in this repo, or "client, <date>". */
  source: string;
}

export const history: readonly Milestone[] = [
  {
    year: site.since,
    text: 'Evergreen is founded in Toronto.',
    source: 'src/content/pages/about-us.md ("Founded: 1989, in Toronto"); src/data/site.ts (site.since)',
  },
];

/** Fewer milestones than this and no timeline is drawn. */
export const TIMELINE_MIN = 3;

/** The milestones to draw, oldest first, or none while there are too few. */
export function timeline(list: readonly Milestone[] = history): Milestone[] {
  if (list.length < TIMELINE_MIN) return [];
  return [...list].sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0));
}

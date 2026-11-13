/**
 * Blog `updatedDate`s after the 6-12 Nov 2026 edits (13 Nov 2026, SEO audit
 * 11 Nov, geo N8).
 *
 * `updatedDate` feeds the BlogPosting's dateModified, the post's "Updated"
 * line, the sitemap lastmod and the month on the listing cards. The cost
 * guide was retitled on 7 Nov but still reported 2026-10-31.
 *
 * The rule: a change to facts, sources, a title or a section sets the date
 * of that change; a link-only or wording-only edit does not. Each date below
 * is the last such change, from `git log --since=2026-11-06 -- src/content/blog/`:
 *
 *   f967371 (6 Nov)  retitles; the slips post's CCOHS statistic; a "When You
 *                    Need One" section and "Studies show" dropped in the
 *                    deep-clean post; the IPAC paragraph in the dental post;
 *                    "three tips" corrected to five in the floor post.
 *   6f4f4de (7 Nov)  the cost guide's title, H1 and description; the mixing
 *                    post's CCOHS bleach source; the sponge claim in the
 *                    techniques post replaced by a cited 2017 study.
 *
 * Left alone: everything else those commits touched was a link or a closing
 * sentence; 5eba139 (7 Nov) only qualified the reply promise; 3b249ba (12 Nov)
 * added links and re-cased headings, and the cost guide's 12 Nov sentence is
 * a pointer to the quote checklist, not a new fact. The office checklist (6
 * Nov) and quote checklist (10 Nov) are newer than any later change of
 * substance.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = path.resolve(import.meta.dirname, '../src/content/blog');
const front = (slug: string) => fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8').match(/^---\n([\s\S]*?)\n---/)![1];
const updated = (slug: string) => front(slug).match(/^updatedDate: (\S+)$/m)?.[1];

const dated: [string, string][] = [
  ['office-cleaning-cost-toronto-guide', '2026-11-07'],
  ['6-common-cleaning-products-that-you-should-never-mix-together', '2026-11-07'],
  ['commercial-cleaning-techniques-to-avoid', '2026-11-07'],
  ['5-cleaning-products-you-should-have-in-your-office', '2026-11-06'],
  ['5-easy-ways-to-keep-your-commercial-floor-clean', '2026-11-06'],
  ['a-cleaning-checklist-for-your-retail-store', '2026-11-06'],
  ['benefits-of-commercial-deep-cleaning-services', '2026-11-06'],
  ['cleaning-check-list-dental-clinics', '2026-11-06'],
  ['cleaning-protocols-for-daycares-and-schools', '2026-11-06'],
  ['preventing-slips-trips-falls-in-your-workplace', '2026-11-06'],
  ['robotic-vs-manual-cleaning-which-will-ultimately-succeed', '2026-11-06'],
  // Dated before this pass, unchanged by it.
  ['areas-in-your-office-where-germs-are-likely-hiding', '2026-11-06'],
  ['commercial-cleaning-air-quality', '2026-11-06'],
  ['how-to-decide-on-a-cleaning-company', '2026-10-30'],
];

describe('posts changed in substance carry the date of that change (geo N8)', () => {
  it.each(dated)('%s: updatedDate %s', (slug, date) => {
    expect(updated(slug)).toBe(date);
  });

  it('the cost guide no longer reports its publication date as its last change', () => {
    expect(front('office-cleaning-cost-toronto-guide')).toMatch(/^pubDate: 2026-10-31$/m);
    expect(updated('office-cleaning-cost-toronto-guide')).not.toBe('2026-10-31');
  });

  it('every updatedDate comes after its pubDate and is not in the future', () => {
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      const slug = f.replace(/\.md$/, '');
      const u = updated(slug);
      if (!u) continue;
      const pub = front(slug).match(/^pubDate:\s*["']?([\d-]{10})/m)![1];
      expect(u > pub, slug).toBe(true);
      expect(u <= '2026-11-13', slug).toBe(true);
    }
  });
});

describe('link-only and wording-only edits set no date (geo N8)', () => {
  it.each([
    'office-cleaning-checklist',
    'commercial-cleaning-quote-checklist',
    'how-often-should-an-office-be-cleaned',
    'seasonal-office-cleaning-checklist',
    'day-night-which-is-the-best-routine-for-your-office',
    'ask-the-office-cleaners-cleaning-break-rooms',
    'how-to-keep-your-office-fridge-clean',
  ])('%s has no updatedDate', (slug) => {
    expect(updated(slug)).toBeUndefined();
  });
});

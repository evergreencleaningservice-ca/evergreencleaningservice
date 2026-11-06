/**
 * @vitest-environment node
 *
 * SEO audit item 31 (2026-11-06): review dates are shown as a month, not as
 * "N months ago". An age worked out at build time is only right on the day
 * of the build; a month stays right. The emitted cards are checked in
 * tests/build/content.test.ts; this covers the formatting itself.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reviewDate, reviews } from '../src/data/reviews';

afterEach(() => vi.useRealTimers());

describe('reviewDate', () => {
  it('a dated review reads as its month and year, with the full date in datetime', () => {
    expect(reviewDate({ date: '2021-05-31' })).toEqual({
      datetime: '2021-05-31',
      label: 'May 2021',
    });
    expect(reviewDate({ date: '2020-10-05' }).label).toBe('October 2020');
    expect(reviewDate({ date: '2026-12-01' }).label).toBe('December 2026');
    expect(reviewDate({ date: '2026-01-31' }).label).toBe('January 2026');
  });

  it('a review dated only to the month says "around" and claims no day', () => {
    expect(reviewDate({ date: '2026-01-15', approx: 'month' })).toEqual({
      datetime: '2026-01',
      label: 'around January 2026',
    });
  });

  it('a review dated only to the year says "around" and claims no month', () => {
    expect(reviewDate({ date: '2025-07-04', approx: 'year' })).toEqual({
      datetime: '2025',
      label: 'around 2025',
    });
  });

  it('does not depend on the day the site is built', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T12:00:00Z'));
    const now = reviews.map(reviewDate);
    vi.setSystemTime(new Date('2031-03-01T12:00:00Z'));
    expect(reviews.map(reviewDate)).toEqual(now);
  });

  it('does not shift a month at either end of it, whatever the time zone', () => {
    /* `new Date('2021-05-01')` is midnight UTC, which is still April in
       Toronto. The formatter reads the string, so it cannot fall into that. */
    expect(reviewDate({ date: '2021-05-01' }).label).toBe('May 2021');
    expect(reviewDate({ date: '2021-04-30' }).label).toBe('April 2021');
  });

  it('refuses a date that is not YYYY-MM-DD rather than printing nonsense', () => {
    expect(() => reviewDate({ date: '2021-5-31' })).toThrow(/YYYY-MM-DD/);
    expect(() => reviewDate({ date: '2021-13-01' })).toThrow(/month/);
    expect(() => reviewDate({ date: 'May 2021' })).toThrow();
  });
});

describe('the reviews on file', () => {
  it('every one formats, and none as an age', () => {
    for (const r of reviews) {
      const { datetime, label } = reviewDate(r);
      expect(label, r.name).not.toMatch(/\bago\b/);
      expect(label, r.name).toMatch(/^(around )?([A-Z][a-z]+ )?\d{4}$/);
      expect(datetime, r.name).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      expect(r.date.startsWith(datetime), r.name).toBe(true);
    }
  });

  it('only the two Google dated roughly are marked approximate', () => {
    /* Andy Handy ("9 months ago" on 2026-10-29) and av-ev ("a year ago").
       Marking more would hide a known date; fewer would print a guessed one
       as fact. */
    expect(
      Object.fromEntries(reviews.filter((r) => r.approx).map((r) => [r.name, r.approx]))
    ).toEqual({ 'Andy Handy': 'month', 'av-ev': 'year' });
  });
});

/**
 * @vitest-environment node
 *
 * 13 Nov 2026 (comparison with impact.ca, report items 1 and 7): the Google
 * rating strip and the hero's rating item are gated on `googleProfile` in
 * src/data/reviews.ts. The gate is `googleRatingDisplay`, tested here both
 * ways. The fixture is fictional and exists only in this file: it is not
 * Evergreen's rating, and nothing here may be copied into the data.
 * tests/build/home-proof-faq.test.ts checks the build carries no strip today.
 */
import { describe, expect, it } from 'vitest';
import { googleProfile, googleRatingDisplay, type GoogleProfileRating } from '../src/data/reviews';

const FICTIONAL: GoogleProfileRating = {
  rating: 4.2,
  count: 17,
  checkedAt: '2000-01-01',
  url: 'https://example.com/fictional-profile',
};

describe('the Google rating gate', () => {
  it('is closed today: no figures have been copied from the profile', () => {
    expect(googleProfile).toBeUndefined();
    expect(googleRatingDisplay(googleProfile)).toBeUndefined();
  });

  it('closed, it gives nothing to render', () => {
    expect(googleRatingDisplay(undefined)).toBeUndefined();
  });

  it('open, it prints the figures exactly as given, with the link', () => {
    expect(googleRatingDisplay(FICTIONAL)).toEqual({
      label: '★ 4.2 on Google · 17 reviews',
      text: '4.2 on Google · 17 reviews',
      href: 'https://example.com/fictional-profile',
      checkedAt: '2000-01-01',
    });
  });

  it('keeps one decimal place and says "review" for one', () => {
    expect(googleRatingDisplay({ ...FICTIONAL, rating: 5, count: 1 })!.label).toBe('★ 5.0 on Google · 1 review');
  });

  it.each([
    ['a rating above 5', { rating: 5.1 }],
    ['a rating below 1', { rating: 0 }],
    ['a fractional count', { count: 2.5 }],
    ['a zero count', { count: 0 }],
    ['an undated check', { checkedAt: 'last week' }],
    ['a non-https URL', { url: 'http://example.com/' }],
  ])('refuses %s rather than printing it', (_name, change) => {
    expect(() => googleRatingDisplay({ ...FICTIONAL, ...change })).toThrow();
  });
});

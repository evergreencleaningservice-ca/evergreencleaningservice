/**
 * The URL move of 13 Nov 2026 (owner decision): the service and industry
 * pages' addresses, and the guard that keeps two root routes off one slug.
 * src/data/offer-pages.ts says why.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  INDUSTRY_SLUGS,
  MOVED_OFFER_PATHS,
  SERVICE_SLUGS,
  offerCollection,
  offerHub,
  offerPath,
  rootSlugCollisions,
} from '../src/data/offer-pages';

const repo = path.resolve(import.meta.dirname, '..');
const slugsIn = (dir: string) =>
  fs
    .readdirSync(path.join(repo, 'src/content', dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();

describe('the offer pages module', () => {
  it('lists exactly the service and industry content files', () => {
    expect([...SERVICE_SLUGS].sort()).toEqual(slugsIn('services'));
    expect([...INDUSTRY_SLUGS].sort()).toEqual(slugsIn('industries'));
  });

  it('puts every page at the root and knows its hub', () => {
    expect(offerPath('office-cleaning')).toBe('/office-cleaning/');
    expect(offerCollection('property-management')).toBe('industries');
    expect(offerCollection('about-us')).toBeUndefined();
    expect(offerHub('/office-cleaning/')).toBe('/services/');
    expect(offerHub('/medical-dental-clinics/')).toBe('/industries/');
    expect(offerHub('/services/')).toBeUndefined();
    expect(offerHub('/services/office-cleaning/')).toBeUndefined();
  });

  it('maps each of the 13 old addresses to its new one', () => {
    expect(MOVED_OFFER_PATHS).toHaveLength(13);
    expect(MOVED_OFFER_PATHS).toContainEqual({ from: '/services/office-cleaning/', to: '/office-cleaning/' });
    expect(MOVED_OFFER_PATHS).toContainEqual({ from: '/industries/property-management/', to: '/property-management/' });
  });

  it('shares no slug with a blog post, a page file or a public file', () => {
    const top = (dir: string) =>
      fs
        .readdirSync(path.join(repo, dir), { withFileTypes: true })
        .map((e) => (e.isDirectory() ? e.name : e.name.replace(/\.(astro|ts|js|md)$/, '')))
        .filter((n) => !n.startsWith('[') && !n.startsWith('.'));
    expect(
      rootSlugCollisions({
        'a blog post': slugsIn('blog'),
        'a service page': SERVICE_SLUGS,
        'an industry page': INDUSTRY_SLUGS,
        'a file in src/pages': top('src/pages'),
        'a file in public': top('public'),
      }),
    ).toEqual([]);
  });
});

describe('rootSlugCollisions', () => {
  it('names every slug two groups claim, and who claims it', () => {
    expect(
      rootSlugCollisions({ 'a blog post': ['a', 'b'], 'a service page': ['b', 'c'], 'a file in src/pages': ['c'] }),
    ).toEqual(['/b/ is claimed by a blog post and a service page', '/c/ is claimed by a service page and a file in src/pages']);
  });

  it('does not count a slug twice within one group', () => {
    expect(rootSlugCollisions({ 'a blog post': ['a', 'a'] })).toEqual([]);
  });
});

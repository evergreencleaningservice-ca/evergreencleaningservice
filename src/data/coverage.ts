/**
 * Where Evergreen works — one list, with where each part of it comes from.
 *
 * NO NEW TERRITORY IS CLAIMED HERE. Every name below is one the business
 * already states on its own site or in its own advertising copy:
 *
 *   CORE       the contact section's service-area line (`serviceAreas` in
 *              site.ts): Toronto, East York, Etobicoke, North York,
 *              Scarborough, York, Mississauga, Vaughan, Brampton, Markham,
 *              Oakville, Richmond Hill.
 *   EAST       Pickering, Ajax and Oshawa — added by the client's own Google
 *              Ads copy document (2026-09-30, `SERVICE_AREA_LINE` in
 *              landing.ts).
 *
 * The 2019 emergency-cleaning page also lists a wider ring (Burlington,
 * Milton, Caledon, Newmarket, Aurora, King, Clarington, Scugog, Brock…). Those
 * are NOT repeated sitewide: that copy is seven years old and nobody has
 * confirmed the business still travels that far. It stays where it is, on the
 * page that said it, until the client confirms it (client intake list).
 *
 * The business has ONE address, 243 Queen St W., Toronto. Nothing on a
 * location page may imply an office anywhere else.
 */

export interface Area {
  name: string;
  /** A location page, where one exists. */
  href?: string;
  group: 'Toronto' | 'Peel & Halton' | 'York Region' | 'Durham';
}

export const AREAS: Area[] = [
  { name: 'Downtown Toronto', href: '/locations/toronto-downtown/', group: 'Toronto' },
  { name: 'Etobicoke', href: '/locations/etobicoke/', group: 'Toronto' },
  { name: 'North York', group: 'Toronto' },
  { name: 'Scarborough', group: 'Toronto' },
  { name: 'East York', group: 'Toronto' },
  { name: 'York', group: 'Toronto' },
  { name: 'Mississauga', href: '/locations/mississauga/', group: 'Peel & Halton' },
  { name: 'Brampton', href: '/locations/brampton/', group: 'Peel & Halton' },
  { name: 'Oakville', href: '/locations/oakville/', group: 'Peel & Halton' },
  { name: 'Vaughan & Concord', href: '/locations/vaughan/', group: 'York Region' },
  { name: 'Markham', href: '/locations/markham/', group: 'York Region' },
  { name: 'Richmond Hill', group: 'York Region' },
  { name: 'Pickering', group: 'Durham' },
  { name: 'Ajax', group: 'Durham' },
  { name: 'Oshawa', group: 'Durham' },
];

export const AREA_GROUPS = ['Toronto', 'Peel & Halton', 'York Region', 'Durham'] as const;

/** One sentence, for places that need the coverage in prose. */
export const COVERAGE_SENTENCE =
  'Toronto (including North York, Scarborough, Etobicoke, East York and York), Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax and Oshawa';

/** The quote form's suggestions for "city or area". Free text is still allowed. */
export const SERVICE_LOCATION_SUGGESTIONS = [
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
  'East York',
  'York',
  'Mississauga',
  'Brampton',
  'Oakville',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Pickering',
  'Ajax',
  'Oshawa',
] as const;

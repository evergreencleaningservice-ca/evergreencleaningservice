/**
 * Who Evergreen cleans for — the industries hub and its two dedicated pages.
 *
 * ONLY FACILITY TYPES THE BUSINESS ALREADY NAMES. Each entry cites where the
 * client says it. The service pages' "we provide service to" lists (2019–2024
 * copy), /about-us/ ("professional firms and private offices, health, dental
 * and medical clinics, retail outlets, to industrial building and
 * warehouses"), the quote form's service list (client-supplied, 2026), the
 * client-written Mississauga and Vaughan pages, the gallery and the reviews.
 *
 * TWO GET THEIR OWN PAGE, and the rest do not, on purpose. A page needs
 * something to say that the service pages do not already say. Medical and
 * dental clinics, and property managers, have enough distinct evidence to
 * carry one each. Offices, industrial, retail and the rest are already the
 * subject of a service page, so the hub links there rather than publishing a
 * near-duplicate with the noun swapped.
 */

export interface Industry {
  slug: string;
  name: string;
  /** One line for the hub card. */
  summary: string;
  /** Facility types within it, as the client lists them. */
  examples: string[];
  /** Where the hub card points: a dedicated page or the matching service. */
  href: string;
  /** Where the claim comes from. Not rendered. */
  source: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'offices',
    name: 'Offices and professional firms',
    summary: 'Corporate floors, professional suites and multi-tenant office buildings, cleaned after hours.',
    examples: ['Office buildings', 'Professional firms and private offices', 'Training and call centres', 'Banks'],
    href: '/services/office-cleaning/',
    source: '/services/office-cleaning/ list; /about-us/; Edward Sherman review',
  },
  {
    slug: 'medical-dental-clinics',
    name: 'Medical and dental clinics',
    summary: 'Waiting rooms, treatment areas and washrooms, cleaned with attention to cross-contamination.',
    examples: ['Dental offices', 'Medical clinics', 'Health clinics', 'Labs'],
    href: '/industries/medical-dental-clinics/',
    source: '/about-us/; service lists "Medical Facilities / Hospitals / Labs"; Mississauga client copy; gallery; dental checklist post',
  },
  {
    slug: 'property-management',
    name: 'Property managers and condominiums',
    summary: 'Common areas, lobbies and tenant spaces, plus one-off work when a building needs it quickly.',
    examples: ['Condo common areas', 'Commercial and multi-tenant buildings', 'Lobbies and corridors', 'Tenant turnovers'],
    href: '/industries/property-management/',
    source: 'quote form "Condo Common Area Cleaning"; Michael Katchen review; Mississauga client copy; gallery condo lobby',
  },
  {
    slug: 'industrial',
    name: 'Industrial, warehouse and logistics',
    summary: 'Production and warehouse floors, high dusting, staff facilities and the offices beside them.',
    examples: ['Warehouses and distribution', 'Plants and factories', 'Industrial buildings'],
    href: '/services/industrial-cleaning/',
    source: '/services/industrial-cleaning/; quote form "Warehouse Cleaning"; gallery 50k sq ft warehouse',
  },
  {
    slug: 'retail',
    name: 'Retail stores and showrooms',
    summary: 'Sales floors, glass and entrances that customers judge you by.',
    examples: ['Retail stores and outlet malls', 'Showrooms'],
    href: '/services/commercial-cleaning/',
    source: '/services/commercial-cleaning/ list; Mississauga client copy; retail checklist post; gallery',
  },
  {
    slug: 'public-institutional',
    name: 'Education and public buildings',
    summary: 'Schools and daycares, municipal buildings, libraries and places of worship.',
    examples: [
      'Educational facilities',
      'Municipal buildings and police stations',
      'Court houses and libraries',
      'Religious institutions',
    ],
    href: '/services/commercial-cleaning/',
    source: 'service page lists; daycares and schools post',
  },
  {
    slug: 'hospitality',
    name: 'Hospitality and recreation',
    summary: 'Front-of-house spaces that have to look right every morning.',
    examples: ['Hotels', 'Golf and country clubs', 'Campgrounds'],
    href: '/services/commercial-cleaning/',
    source: '/services/commercial-cleaning/ list',
  },
];

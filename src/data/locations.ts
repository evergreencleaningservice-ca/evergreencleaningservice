/**
 * The GTA sub-location pages, per Section 2.3 of the overhaul specification.
 *
 * Each entry carries its own service-radius focus so the seven pages do not
 * read as one page with the city name swapped — which is what the spec means by
 * "without triggering duplicate content penalties". The `focus`, `facilities`
 * and `landmarks` fields are what differ; the page template is shared.
 *
 * MEASURED / SPECIFIED: the focus lines for Mississauga, Vaughan, Markham and
 * Etobicoke are taken verbatim from the specification.
 *
 * WRITTEN HERE: Toronto Downtown, Brampton and Oakville are in the spec's
 * directory tree but have no focus defined, so their copy was written to the
 * same pattern. It is plausible commercial-cleaning copy, not client-supplied
 * fact — have the client confirm it before this goes live.
 *
 * NOT INCLUDED: the spec's page anatomy asks for "local client testimonials".
 * There are four real Google reviews for the business and none of them names a
 * municipality, so attributing one to a city would be inventing an endorsement.
 * The shared review set is shown instead, unattributed to any location.
 */

export type Location = {
  /** URL slug under /locations/ */
  slug: string;
  /** Display name used in the H1 and copy */
  name: string;
  /** Longer form for prose where "Toronto Downtown" would read oddly */
  region: string;
  /** The service-radius focus — the reason this page is not the others */
  focus: string;
  /** Facility types served, shown as a list */
  facilities: string[];
  /** Named commercial areas, used in the opening paragraph */
  landmarks: string;
  /** Google Maps embed query, centred on the municipal zone */
  mapQuery: string;
  /** Meta description */
  description: string;
  /** true where the copy was written here rather than supplied */
  needsClientReview?: boolean;
  /** Explicit title tag, where the client has specified one */
  title?: string;
  /** Overrides the template's generated H1 on a page with no `detail` */
  h1?: string;
  /**
   * Long-form client-supplied copy. Where present the page renders this
   * instead of the generic body built from `focus`/`facilities`/`landmarks`,
   * which stays the fallback for the locations that have no long copy yet.
   */
  detail?: LocationDetail;
};

export type LocationDetail = {
  /** Overrides the template's generated H1 */
  h1: string;
  subtitle: string;
  intro: string[];
  servicesTitle: string;
  services: { label: string; body: string }[];
  reasonsTitle: string;
  reasons: { label: string; body: string }[];
  ctaLabel: string;
};

export const locations: Location[] = [
  {
    slug: 'toronto-downtown',
    name: 'Downtown Toronto',
    region: 'downtown Toronto',
    /* Rewritten 2026-10-15: the earlier focus and facility list named
       specific districts and building types nobody had confirmed Evergreen
       works in. These are the facility types the client itself lists. */
    focus:
      'Offices, multi-tenant buildings, clinics and retail space close to our Queen Street West office, cleaned after hours around building access and security rules.',
    facilities: [
      'Office buildings and professional offices',
      'Multi-tenant floors and shared common areas',
      'Medical and dental clinics',
      'Retail stores and showrooms',
      'Institutional and public buildings',
    ],
    landmarks: 'the Financial District, King West, the Entertainment District and the St. Lawrence area',
    mapQuery: 'Downtown Toronto, Ontario, Canada',
    description:
      'Commercial and office cleaning in downtown Toronto — offices, multi-tenant buildings, clinics and retail, cleaned after hours by a WSIB-covered crew.',
    needsClientReview: true,
  },
  {
    slug: 'mississauga',
    name: 'Mississauga',
    region: 'Mississauga',
    focus:
      'Offices in the business parks and City Centre, professional and medical offices, logistics hubs and flex space.',
    facilities: [
      'Corporate offices and business parks',
      'Professional and medical offices',
      'Logistics and distribution hubs',
      'Flex office and co-working space',
      'Light manufacturing with attached offices',
    ],
    landmarks: 'Meadowvale Business Park, the City Centre, the Airport Corporate Centre and Sheridan Park',
    mapQuery: 'Mississauga, Ontario, Canada',
    /* "Office" first since 2026-10-30: in Search Console "office cleaning
       mississauga" outnumbers "commercial cleaning mississauga", and
       searchers name Meadowvale, Lisgar and East Credit. */
    description:
      'Office and commercial cleaning in Mississauga: Meadowvale, Lisgar, East Credit, City Centre and the airport area. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in Mississauga | Evergreen',
    detail: {
      h1: 'Office & Commercial Cleaning in Mississauga',
      subtitle: 'Reliable, Professional Facility Maintenance for Mississauga Businesses',
      intro: [
        'From corporate headquarters along the Hurontario corridor and the Airport Corporate Centre to high-traffic industrial complexes in Meadowvale, Evergreen Office Cleaning provides comprehensive commercial cleaning and janitorial solutions tailored to your operational schedule.',
        'Serving Peel Region and the GTA since 1989, our WSIB-covered, bonded and insured teams keep your facility clean and healthy for employees, clients and visitors.',
      ],
      servicesTitle: 'Mississauga Commercial Facilities We Service:',
      services: [
        {
          label: 'Corporate Offices & Headquarters',
          body: 'Daily or multi-day evening janitorial care, boardroom maintenance, workstation sanitization, and washroom hygiene programs.',
        },
        {
          label: 'Logistics & Industrial Warehouses',
          body: "Heavy-duty floor scrubbing, high-dusting, and facility upkeep in Mississauga's major freight and manufacturing hubs.",
        },
        {
          label: 'Medical & Dental Clinics',
          body: 'Waiting rooms, treatment areas and washrooms, cleaned with care to avoid cross-contamination between rooms.',
        },
        {
          label: 'Retail & Showrooms',
          body: 'Strip and waxing, floor polishing, and post-construction detailing.',
        },
      ],
      reasonsTitle: 'Why Mississauga Property Managers Choose Evergreen:',
      reasons: [
        {
          label: 'Flexible Scheduling (Zero Disruption)',
          body: 'Complete after-hours and weekend coverage scheduled around your operational shifts.',
        },
        {
          label: 'Direct Account Management',
          body: 'You receive direct access to an account executive who coordinates your site walkthroughs, inspections, and adjustments.',
        },
        {
          label: 'Fully Insured & Background-Checked',
          body: 'All cleaning personnel undergo background screening and are covered under full liability insurance and WSIB Ontario.',
        },
      ],
      ctaLabel: 'Request a Free Mississauga Walkthrough & Proposal',
    },
  },
  {
    slug: 'etobicoke',
    name: 'Etobicoke',
    region: 'Etobicoke',
    /* Rewritten 2026-10-30 to the facility types the client lists: the
       earlier event centres, banquet halls and dealerships were unconfirmed. */
    focus:
      'Offices and clinics, retail plazas, condominium common areas and industrial buildings, from the lakeshore to the airport.',
    facilities: [
      'Offices and multi-tenant business buildings',
      'Medical and dental clinics',
      'Retail stores and plazas',
      'Condominium common areas',
      'Industrial buildings and the offices attached to them',
    ],
    landmarks: 'Islington–City Centre West, The Queensway, South Etobicoke and the airport area',
    mapQuery: 'Etobicoke, Toronto, Ontario, Canada',
    description:
      'Office and commercial cleaning in Etobicoke: offices, clinics, plazas, condo common areas and industrial buildings, cleaned after hours. WSIB covered.',
    title: 'Office & Commercial Cleaning in Etobicoke | Evergreen',
    h1: 'Office & Commercial Cleaning in Etobicoke',
  },
  {
    slug: 'vaughan',
    name: 'Vaughan',
    region: 'Vaughan',
    focus:
      'Major industrial distribution centres, manufacturing facilities, and corporate headquarters.',
    facilities: [
      'Industrial distribution centres',
      'Manufacturing facilities and plant floors',
      'Corporate headquarters and head-office suites',
      'Warehouse mezzanine offices',
      'Showrooms along Highway 7 and Jane',
    ],
    landmarks: 'the Highway 400 distribution corridor, Concord, Woodbridge and the Vaughan Metropolitan Centre',
    mapQuery: 'Vaughan, Ontario, Canada',
    description:
      'Office and commercial cleaning in Vaughan: the VMC, Concord, Woodbridge and Maple. Offices, showrooms and warehouses, cleaned after hours. WSIB covered.',
    title: 'Office & Commercial Cleaning in Vaughan & Concord | Evergreen',
    detail: {
      h1: 'Office & Commercial Cleaning in Vaughan and Concord',
      subtitle: 'Keep Your Vaughan Commercial Property Spotless, Professional, and Safe',
      intro: [
        'As Vaughan continues rapid corporate expansion across the Vaughan Metropolitan Centre (VMC) and industrial sectors in Concord and Woodbridge, maintaining an exceptional physical workspace is critical. Evergreen Office Cleaning provides top-tier commercial office cleaning and building maintenance designed for modern businesses.',
        'Whether you run a high-tech corporate office, a commercial showroom along Highway 7, or a high-capacity distribution warehouse near Highway 400, our dedicated cleaning teams deliver consistent, reliable service.',
      ],
      servicesTitle: 'Cleaning Services Tailored for Vaughan Enterprises:',
      services: [
        {
          label: 'Commercial Office Janitorial',
          body: 'Complete vacuuming, trash removal, touch-point disinfection, glass cleaning, and kitchen sanitization.',
        },
        {
          label: 'Industrial & Warehouse Floor Care',
          body: 'Auto-scrubbing, degreasing, concrete sealing, and post-construction cleaning.',
        },
        {
          label: 'Commercial Carpet & Hard Floor Care',
          body: 'Hot water extraction carpet cleaning and hard-surface floor strip, seal, and wax.',
        },
        {
          label: 'Short-Notice Clean-Ups',
          body: 'Spills, water damage or an inspection at short notice: call and we will tell you when a crew can be there.',
        },
      ],
      reasonsTitle: 'The Evergreen Difference for Vaughan Facilities:',
      reasons: [
        {
          label: 'Consistent Teams',
          body: 'You receive dedicated cleaners assigned to your specific property for consistent quality and site familiarity.',
        },
        {
          label: 'WSIB Ontario Registered & Bonded',
          body: 'Total peace of mind for property managers and building owners.',
        },
        {
          label: 'Eco-Friendly Solutions',
          body: 'Green cleaning products that protect indoor air quality without sacrificing disinfectant power.',
        },
      ],
      ctaLabel: 'Schedule an On-Site Vaughan Consultation',
    },
  },
  {
    slug: 'markham',
    name: 'Markham',
    region: 'Markham',
    /* Rewritten 2026-10-30 to the facility types the client lists. */
    focus:
      'Corporate and technology offices, multi-tenant buildings, clinics and business-park units with offices at the front.',
    facilities: [
      'Corporate and technology offices',
      'Multi-tenant office buildings',
      'Medical and dental clinics',
      'Business-park units with office and warehouse space',
      'Retail stores and showrooms',
    ],
    landmarks: 'Markham Centre, the Highway 404 and 407 corridor, Unionville and the Woodbine–Steeles business area',
    mapQuery: 'Markham, Ontario, Canada',
    description:
      'Office and commercial cleaning in Markham: corporate and tech offices, clinics and business-park units along Highway 7, 404 and 407. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in Markham | Evergreen',
    h1: 'Office & Commercial Cleaning in Markham',
  },
  {
    slug: 'brampton',
    name: 'Brampton',
    region: 'Brampton',
    /* Rewritten 2026-10-15 to the client's own facility list; the earlier
       corridor-by-corridor detail was unverified. */
    focus:
      'Offices and clinics, warehouses, industrial buildings and the offices attached to them, on schedules built around shifts.',
    facilities: [
      'Offices and multi-tenant business buildings',
      'Medical and dental clinics',
      'Warehouses and distribution facilities',
      'Industrial buildings and plants',
      'Retail stores and showrooms',
    ],
    landmarks: 'the Airport Road and Highway 407 logistics corridors, Bramalea and the Steeles Avenue industrial belt',
    mapQuery: 'Brampton, Ontario, Canada',
    description:
      'Office and commercial cleaning in Brampton: offices, clinics, warehouses and industrial buildings, cleaned after hours or around shifts. WSIB covered.',
    title: 'Office & Commercial Cleaning in Brampton | Evergreen',
    h1: 'Office & Commercial Cleaning in Brampton',
    needsClientReview: true,
  },
  {
    slug: 'oakville',
    name: 'Oakville',
    region: 'Oakville',
    /* Rewritten 2026-10-15 to the client's own facility list. */
    focus:
      'Professional offices, medical and dental clinics and client-facing commercial space, where presentation matters as much as hygiene.',
    facilities: [
      'Professional offices',
      'Medical and dental clinics',
      'Retail stores and showrooms',
      'Office and industrial buildings',
      'Condominium common areas',
    ],
    landmarks: 'the QEW corporate corridor, Winston Park, Bronte and the Kerr Street commercial area',
    mapQuery: 'Oakville, Ontario, Canada',
    description:
      'Office and commercial cleaning in Oakville: professional offices, clinics and business-park buildings, downtown to Winston Park. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in Oakville | Evergreen',
    h1: 'Office & Commercial Cleaning in Oakville',
    needsClientReview: true,
  },
];

export const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);

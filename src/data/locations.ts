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
    focus:
      'Tower suites and multi-tenant office floors in the Financial District, King West and the Entertainment District, where cleaning has to work around building security, loading-dock windows and shared elevator access.',
    facilities: [
      'Financial District tower suites',
      'King West and Entertainment District studios',
      'Multi-tenant floors with shared common areas',
      'Ground-floor retail and showroom space',
      'Boardroom and event floors',
    ],
    landmarks: 'the Financial District, King West, the Entertainment District and the St. Lawrence area',
    mapQuery: 'Downtown Toronto, Ontario, Canada',
    description:
      'Commercial and office cleaning in downtown Toronto — Financial District towers, King West studios and multi-tenant floors, cleaned after hours by a bonded, insured and WSIB-compliant crew.',
    needsClientReview: true,
  },
  {
    slug: 'mississauga',
    name: 'Mississauga',
    region: 'Mississauga',
    focus:
      'Logistics hubs, corporate business parks near Pearson Airport, and flex offices.',
    facilities: [
      'Logistics and distribution hubs',
      'Corporate business parks near Pearson Airport',
      'Flex office and co-working space',
      'Airport-corridor hotels and conference space',
      'Light manufacturing with attached offices',
    ],
    landmarks: 'the Airport Corporate Centre, Meadowvale Business Park, Sheridan Park and the Dixie–Britannia corridor',
    mapQuery: 'Mississauga, Ontario, Canada',
    description:
      'Trusted commercial cleaning and office janitorial services in Mississauga and the Airport Corporate Centre. WSIB insured, bonded, and reliable. Request a quote.',
    title: 'Commercial Cleaning & Office Janitorial Services Mississauga | Evergreen',
    detail: {
      h1: 'Commercial Cleaning & Office Janitorial Services in Mississauga',
      subtitle: 'Reliable, Professional Facility Maintenance for Mississauga Businesses',
      intro: [
        'From corporate headquarters along the Hurontario corridor and the Airport Corporate Centre to high-traffic industrial complexes in Meadowvale, Evergreen Cleaning Service provides comprehensive commercial cleaning and janitorial solutions tailored to your operational schedule.',
        'With over 20 years of commercial cleaning experience across Peel Region and the GTA, our certified, bonded, and WSIB-insured teams ensure your facility maintains an immaculate, healthy environment for employees, clients, and visitors.',
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
          body: 'Health-grade sanitization adhering strictly to clinical hygiene standards and cross-contamination prevention protocols.',
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
    focus: 'Commercial arteries, event centres, and industrial corridors.',
    facilities: [
      'Commercial arteries along The Queensway and Dundas West',
      'Event centres and banquet halls',
      'Industrial corridors off Kipling and Islington',
      'Automotive dealerships and service centres',
      'Medical and dental clinic buildings',
    ],
    landmarks: 'The Queensway, the Kipling and Islington industrial corridors, and the Humber Bay commercial strip',
    mapQuery: 'Etobicoke, Toronto, Ontario, Canada',
    description:
      'Commercial and office cleaning in Etobicoke — commercial arteries, event centres and industrial corridors, with turnaround cleans between bookings.',
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
      'Professional commercial cleaning and janitorial services in Vaughan, Concord, and Woodbridge. Reliable, WSIB insured, and bonded. Get a quote today.',
    title: 'Commercial Office Cleaning & Janitorial Vaughan & Concord | Evergreen',
    detail: {
      h1: 'Commercial Cleaning & Building Maintenance in Vaughan & Concord',
      subtitle: 'Keep Your Vaughan Commercial Property Spotless, Professional, and Safe',
      intro: [
        'As Vaughan continues rapid corporate expansion across the Vaughan Metropolitan Centre (VMC) and industrial sectors in Concord and Woodbridge, maintaining an exceptional physical workspace is critical. Evergreen Cleaning Service provides top-tier commercial office cleaning and building maintenance designed for modern businesses.',
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
          label: 'Emergency Clean-Up Services',
          body: 'Rapid dispatch for unexpected spills, water events, or last-minute property inspections.',
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
    focus:
      'Tech parks, multi-tenant corporate offices, and medical/dental clinic buildings.',
    facilities: [
      'Tech park campuses',
      'Multi-tenant corporate offices',
      'Medical and dental clinic buildings',
      'Data and server rooms requiring low-dust protocols',
      'Training and conference facilities',
    ],
    landmarks: 'the Markham tech corridor along Highway 404, Unionville and the Woodbine–Steeles business area',
    mapQuery: 'Markham, Ontario, Canada',
    description:
      'Commercial and office cleaning in Markham — tech parks, multi-tenant corporate offices and clinic buildings, cleaned to protocols suited to each.',
  },
  {
    slug: 'brampton',
    name: 'Brampton',
    region: 'Brampton',
    focus:
      'Warehousing and third-party logistics along the Highway 407 and Airport Road corridors, together with the multi-tenant offices and trade counters that sit beside them.',
    facilities: [
      'Warehousing and third-party logistics',
      'Trade counters and parts departments',
      'Multi-tenant offices and business centres',
      'Food-handling and packaging facilities',
      'Automotive and transport depots',
    ],
    landmarks: 'the Airport Road and Highway 407 logistics corridors, Bramalea and the Steeles Avenue industrial belt',
    mapQuery: 'Brampton, Ontario, Canada',
    description:
      'Commercial and industrial cleaning in Brampton — warehousing, logistics facilities and the offices attached to them, on schedules built around shift changes.',
    needsClientReview: true,
  },
  {
    slug: 'oakville',
    name: 'Oakville',
    region: 'Oakville',
    focus:
      'Professional offices, medical and dental practices, and the corporate campuses along the Queen Elizabeth Way, where presentation matters as much as hygiene.',
    facilities: [
      'Professional and legal offices',
      'Medical and dental practices',
      'Corporate campuses along the QEW',
      'Showrooms and client-facing reception areas',
      'Light industrial with office frontage',
    ],
    landmarks: 'the QEW corporate corridor, Winston Park, Bronte and the Kerr Street commercial area',
    mapQuery: 'Oakville, Ontario, Canada',
    description:
      'Commercial and office cleaning in Oakville — professional offices, medical practices and QEW corporate campuses, cleaned to a standard clients see.',
    needsClientReview: true,
  },
];

export const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);

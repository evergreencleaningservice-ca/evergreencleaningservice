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
  /**
   * When this page's own text last changed: the sitemap's <lastmod> and the
   * WebPage `dateModified` for the page (src/lib/sitemap-lastmod.mjs). Added
   * 6 Nov 2026, SEO audit item 29: the date used to be the last commit to
   * this file and to location-local.ts, so an edit to one city re-dated all
   * of them, and a commit to the shared page template did the same.
   *
   * THE RULE. Change it, to the date and time of the edit (ISO 8601, UTC),
   * when an edit changes what this location's page says: its entry here or
   * its entry in location-local.ts. Leave it alone for everything else,
   * including the shared template (src/pages/locations/[slug].astro), the
   * reviews, the footer and the coverage list, which every location page
   * shows alike. Never set it ahead of the edit or back past one.
   *
   * The first values are the committer times of the last commit that changed
   * each entry in either file, found with `git log -L` on the entry.
   * Without the field the page falls back to the last commit to the two
   * files.
   */
  updated?: string;
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
  /**
   * The cities the page targets, where `name` is not itself a city (Durham
   * Region is a regional municipality). The Service schema's `areaServed`
   * lists these as City nodes, each `containedInPlace` the AdministrativeArea
   * named by `name`; without it, `name` is the one City.
   */
  cities?: string[];
  /** Meta description */
  description: string;
  /** true where the copy was written here rather than supplied */
  needsClientReview?: boolean;
  /** The title text, where the client has specified one. Stored without the
      brand: the page passes it through pageTitle(), which adds " | Evergreen"
      when it fits in 60 characters (13 Nov 2026, SEO audit 11 Nov N4). Vaughan
      and Durham do not fit it and stand unbranded; the place names come
      first. */
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
    updated: '2026-11-06T16:12:26Z', // East York and York added to the areas, a building type and an FAQ
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
      'Office and commercial cleaning in downtown Toronto: offices, multi-tenant buildings, clinics and retail, cleaned after hours. WSIB covered.',
    title: 'Office & Commercial Cleaning in Downtown Toronto',
    h1: 'Office & Commercial Cleaning in Downtown Toronto',
    needsClientReview: true,
  },
  {
    slug: 'mississauga',
    updated: '2026-11-06T15:15:07Z', // intro and reasons rewritten (audit Phase 2)
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
    title: 'Office & Commercial Cleaning in Mississauga',
    detail: {
      h1: 'Office & Commercial Cleaning in Mississauga',
      subtitle: 'Office and commercial cleaning for Mississauga businesses, after hours, by the same crew each visit',
      intro: [
        'Mississauga’s workplaces run from head offices along Hurontario and the Airport Corporate Centre to the plants and warehouses of Meadowvale. Evergreen Office Cleaning cleans them after hours, on a schedule set at a free walkthrough and written into a proposal, so the work fits the hours your building keeps',
        'We have cleaned in Peel Region and across the GTA since 1989. Our crews are WSIB covered, bonded and insured, and the same people come back each visit, so they know your building',
      ],
      servicesTitle: 'Commercial facilities we clean in Mississauga',
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
      reasonsTitle: 'Why Mississauga property managers choose Evergreen',
      reasons: [
        {
          label: 'Cleaning around your hours',
          body: 'Evenings, overnight or weekends, scheduled around your shifts so nobody is cleaning while you work.',
        },
        {
          label: 'One person to call',
          body: 'An account executive arranges the walkthrough, checks the work and changes the scope when your needs change.',
        },
        {
          label: 'Insured and screened staff',
          body: 'Cleaning staff are background screened and covered by liability insurance and WSIB Ontario.',
        },
      ],
      ctaLabel: 'Request a Free Mississauga Walkthrough & Proposal',
    },
  },
  {
    slug: 'etobicoke',
    updated: '2026-11-06T14:57:18Z', // the paragraph linking the two planning guides (audit Phase 1)
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
    title: 'Office & Commercial Cleaning in Etobicoke',
    h1: 'Office & Commercial Cleaning in Etobicoke',
  },
  {
    slug: 'vaughan',
    updated: '2026-11-07T17:56:48Z', // title cut to 60 characters (SEO re-audit, 7 Nov 2026)
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
    /* 61 characters with " | Evergreen" until 7 Nov 2026 (SEO re-audit
       onpage item 1). The brand goes, as pageTitle() drops it when it does
       not fit: both place names and "office" first matter more here. */
    title: 'Office & Commercial Cleaning in Vaughan & Concord',
    detail: {
      h1: 'Office & Commercial Cleaning in Vaughan and Concord',
      subtitle: 'After-hours office and commercial cleaning for Vaughan and Concord, by a crew that knows your building',
      intro: [
        'Vaughan’s business space is spread between the office towers of the Vaughan Metropolitan Centre, the showrooms along Highway 7 and the warehouses and plants of Concord and Woodbridge. Evergreen Office Cleaning cleans all three kinds after hours, from a written scope agreed at a free walkthrough',
        'Each building gets the same crew every visit and one account executive to call. We have done this work across Toronto and the GTA since 1989, and our staff are WSIB covered, bonded and insured',
      ],
      servicesTitle: 'Cleaning services for Vaughan businesses',
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
      reasonsTitle: 'Why Vaughan facilities choose Evergreen',
      reasons: [
        {
          label: 'The same crew every visit',
          body: 'Cleaners are assigned to your building and stay on it, so they learn its rooms, its access rules and what you notice.',
        },
        {
          label: 'WSIB covered, bonded and insured',
          body: 'Coverage that a property manager or building owner can ask us to show before work starts.',
        },
        {
          label: 'Products chosen for indoor air',
          body: 'We use Armstrong ProSeries Green products, certified to UL ECOLOGO standards, which clean and disinfect without leaving a heavy fragrance behind.',
        },
      ],
      ctaLabel: 'Schedule an On-Site Vaughan Consultation',
    },
  },
  {
    slug: 'markham',
    updated: '2026-11-06T14:57:18Z', // the paragraph linking the two planning guides (audit Phase 1)
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
    title: 'Office & Commercial Cleaning in Markham',
    h1: 'Office & Commercial Cleaning in Markham',
  },
  {
    slug: 'brampton',
    updated: '2026-11-06T14:57:18Z', // the paragraph linking the two planning guides (audit Phase 1)
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
    title: 'Office & Commercial Cleaning in Brampton',
    h1: 'Office & Commercial Cleaning in Brampton',
    needsClientReview: true,
  },
  {
    slug: 'oakville',
    updated: '2026-11-06T16:12:26Z', // the QEW business-parks paragraph
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
    title: 'Office & Commercial Cleaning in Oakville',
    h1: 'Office & Commercial Cleaning in Oakville',
    needsClientReview: true,
  },
  /* Four pages added 6 Nov 2026 (SEO audit, Phase 3). The areas were already
     claimed sitewide (coverage.ts); what is new is a page each with its own
     geography, written from public knowledge of the districts, not from
     client-supplied facts. No clients, buildings or counts are named. */
  {
    slug: 'north-york',
    updated: '2026-11-07T17:56:48Z', // review removed, scheduling and description softened (SEO re-audit, 7 Nov 2026)
    name: 'North York',
    region: 'North York',
    focus:
      'Office towers around North York Centre, the business parks off Highway 401 and 404, clinics near the hospitals and the industrial units along Steeles and Finch.',
    facilities: [
      'Office towers and multi-tenant buildings around Yonge and Sheppard',
      'Business-park offices off Highway 401 and 404',
      'Medical and dental clinics and professional suites',
      'Industrial units with offices at the front',
      'Retail plazas and showrooms',
    ],
    landmarks: 'North York Centre, the Consumers Road business park, Don Mills and the Steeles–Finch industrial belt',
    mapQuery: 'North York, Toronto, Ontario, Canada',
    description:
      'Office and commercial cleaning in North York: Yonge–Sheppard towers, business parks off the 401 and 404, and clinics. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in North York',
    h1: 'Office & Commercial Cleaning in North York',
    needsClientReview: true,
  },
  {
    slug: 'scarborough',
    updated: '2026-11-07T17:56:48Z', // review removed, scheduling and description softened (SEO re-audit, 7 Nov 2026)
    name: 'Scarborough',
    region: 'Scarborough',
    focus:
      'Offices around Scarborough Centre, the Progress and Milliken business areas, clinics in the plazas and the warehouses and plants along Highway 401.',
    facilities: [
      'Office buildings around Scarborough Centre and Consilium Place',
      'Warehouses and plants along Highway 401 and in Milliken',
      'Medical and dental clinics in plazas and medical buildings',
      'Retail stores, showrooms and the Golden Mile',
      'Multi-tenant and institutional buildings',
    ],
    landmarks: 'Scarborough Centre, the Progress Avenue business area, the Golden Mile, Agincourt and Milliken',
    mapQuery: 'Scarborough, Toronto, Ontario, Canada',
    description:
      'Office and commercial cleaning in Scarborough: Scarborough Centre offices, Progress and Milliken business areas, 401 warehouses. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in Scarborough',
    h1: 'Office & Commercial Cleaning in Scarborough',
    needsClientReview: true,
  },
  {
    slug: 'richmond-hill',
    updated: '2026-11-07T17:56:48Z', // review removed, scheduling and description softened (SEO re-audit, 7 Nov 2026)
    name: 'Richmond Hill',
    region: 'Richmond Hill',
    focus:
      'Business-park offices in Beaver Creek and Headford, clinics and professional suites along Yonge Street, the buildings near Richmond Hill Centre, and the industrial units north of Elgin Mills.',
    facilities: [
      'Business-park offices in Beaver Creek and Headford',
      'Professional and medical suites along Yonge Street',
      'Multi-tenant office buildings near Richmond Hill Centre',
      'Industrial units with offices in the Newkirk and Elgin Mills areas',
      'Retail plazas and showrooms',
    ],
    landmarks: 'the Beaver Creek business park, Highway 7 and Highway 404, Richmond Hill Centre and the Yonge Street corridor',
    mapQuery: 'Richmond Hill, Ontario, Canada',
    description:
      'Office and commercial cleaning in Richmond Hill: Beaver Creek and Headford business parks and Yonge Street suites. After hours, WSIB covered.',
    title: 'Office & Commercial Cleaning in Richmond Hill',
    h1: 'Office & Commercial Cleaning in Richmond Hill',
    needsClientReview: true,
  },
  {
    slug: 'durham-region',
    updated: '2026-11-07T17:56:48Z', // unconfirmed scheduling claims out, review removed, title and description cut (SEO re-audit, 7 Nov 2026)
    name: 'Durham Region',
    region: 'Pickering, Ajax and Oshawa',
    focus:
      'Offices, clinics, plants and distribution buildings along the Highway 401 corridor through Pickering, Ajax and Oshawa.',
    facilities: [
      'Offices and professional suites in Pickering, Ajax and Oshawa',
      'Warehouses, plants and distribution buildings along Highway 401',
      'Medical and dental clinics',
      'Retail plazas and showrooms',
      'Multi-tenant buildings and institutional space',
    ],
    landmarks: 'the Brock Road and Highway 401 business area in Pickering, the Salem and Harwood areas of Ajax, and downtown Oshawa and the Stevenson Road industrial belt',
    mapQuery: 'Oshawa, Ontario, Canada',
    /* The page targets the three towns, not the region as a whole, so the
       Service schema names them (7 Nov 2026, SEO re-audit schema N2: it
       said City "Durham Region"). */
    cities: ['Pickering', 'Ajax', 'Oshawa'],
    description:
      'Office and commercial cleaning in Pickering, Ajax and Oshawa: offices, clinics, plants and distribution buildings along the 401. After hours, WSIB covered.',
    /* 68 characters until 7 Nov 2026 (SEO re-audit onpage N2); 56 now. The
       brand goes rather than "Office", which leads every location title
       because "office cleaning" is what searchers type (headings-and-links
       test); tests/build/locations.test.ts holds every title to 60. */
    title: 'Office & Commercial Cleaning in Pickering, Ajax & Oshawa',
    h1: 'Office & Commercial Cleaning in Pickering, Ajax and Oshawa',
    needsClientReview: true,
  },
];


export const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);

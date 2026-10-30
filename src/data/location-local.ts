/**
 * What is local about each location page (2026-10-29, SEO audit "location
 * pages fail the uniqueness gate", Critical).
 *
 * The audit measured the seven pages at 4-8% unique text once the city name
 * was normalised (Mississauga and Vaughan, with client copy, at 29%): one
 * template with the name swapped. This adds what differs from city to city.
 *
 * WHAT IS AND IS NOT CLAIMED HERE. The site's rule (see locations.ts) is that
 * nothing says Evergreen has worked in a place or for a client unless the
 * client has confirmed it. So:
 *
 *   - `areas` are the city's business districts, named as places the service
 *     area covers. The client confirmed the GTA service area; these are
 *     public geography, not a client list.
 *   - `buildings` describe the building stock of the area (public knowledge)
 *     and what that kind of building needs from a cleaner. Nothing says
 *     "we clean the X building".
 *   - `access` is about getting there from the one office at 243 Queen St W,
 *     with distances and drive times given as approximate, and about the
 *     scheduling that follows from that.
 *   - `faqs` answer local questions with things the site already commits to:
 *     after-hours and weekend work, scheduling around shifts, a written
 *     scope, one account executive.
 *
 * No testimonials, client names, building names, counts or prices.
 */

export type LocationLocal = {
  /** The one real Google review quoted on this page, by name (src/data/reviews.ts). It is not a review from this city; reviews are not attributed to places. */
  review: string;
  /** A stock photo for the page (SEO audit H6). The alt describes the picture and never claims it was taken in this city; outside Toronto, none shows the Toronto skyline. */
  photo: { src: string; alt: string };
  areasIntro: string;
  areas: string[];
  buildings: { title: string; body: string }[];
  access: string[];
  faqs: { q: string; a: string }[];
  /**
   * "Office cleaning in <city>", where searchers in that city mostly ask for
   * office cleaning (Search Console, Oct 2026). Paragraphs of trusted HTML,
   * so they can link to the service pages.
   */
  office?: string[];
};

export const LOCATION_LOCAL: Record<string, LocationLocal> = {
  'toronto-downtown': {
    review: 'Edward Sherman',
    photo: { src: '/images/night-janitorial-crew-office-toronto.jpg', alt: 'Industrial scrubber cleaning an office corridor' },
    areasIntro:
      'Downtown is where our office is. We cover the core from the waterfront to Bloor Street and from Bathurst to the Don Valley, including:',
    areas: [
      'The Financial District and South Core',
      'The Entertainment District, King West and Queen West',
      'Liberty Village and the Fashion District',
      'Yonge–Dundas and the Discovery District along University Avenue',
      'St. Lawrence, the Distillery District and Corktown',
    ],
    buildings: [
      {
        title: 'Multi-tenant office towers',
        body: 'Cleaning is coordinated with property management: security sign-in, key and fob control, freight-elevator bookings and a scope for each tenant suite, separate from the common areas the building looks after itself.',
      },
      {
        title: 'Converted brick-and-beam offices',
        body: 'The warehouse conversions around King West and Liberty Village have exposed ductwork, beams and open ceilings that collect dust, so high dusting goes into the schedule along with hardwood and polished-concrete floor care.',
      },
      {
        title: 'Street-level retail and showrooms',
        body: 'Glass, entrances and floors take the most wear on busy streets, and in winter the salt tracked in from the sidewalk has to be dealt with every visit, not once a week.',
      },
      {
        title: 'Professional and medical suites',
        body: 'Law, accounting and design offices and clinics in older mid-rise buildings, often without a loading dock, where crews and equipment come in through the front door after hours.',
      },
    ],
    access: [
      'Our office at 243 Queen St W. is a few minutes from most of downtown, so a downtown building is not a highway drive away. Adding a visit, covering an event night or sending someone back to fix a missed item is quick to arrange.',
      'Downtown work runs after tenants leave and is booked around the building: dock and freight-elevator times, security desk hours and, in buildings with residents above, the noise rules that apply to vacuuming and floor machines.',
    ],
    faqs: [
      {
        q: 'Can you work with our building’s security and freight-elevator rules?',
        a: 'Yes. The walkthrough includes how crews sign in, who holds keys or fobs, and when the freight elevator and dock can be used, and the schedule is set around them.',
      },
      {
        q: 'We share a floor with other tenants. Can you clean just our suite?',
        a: 'Yes. The written scope covers your space. Common areas stay with the building’s own contract unless you and the property manager want them included.',
      },
    ],
  },

  etobicoke: {
    review: 'Christopher Perera',
    photo: { src: '/images/gallery-industrial-cleaning-toronto.jpg', alt: 'Floor polishing machine in an industrial building' },
    areasIntro:
      'Etobicoke runs from the lake to the airport, and its business areas are very different from one end to the other. We cover:',
    areas: [
      'Islington–City Centre West, around Islington and Kipling stations',
      'The Queensway and the Kipling Avenue corridor',
      'South Etobicoke: New Toronto, Mimico and Long Branch along Lake Shore Boulevard',
      'Humber Bay Shores',
      'North Etobicoke around Highway 27, Rexdale and the airport',
    ],
    buildings: [
      {
        title: 'Industrial units and light manufacturing',
        body: 'South Etobicoke and the north end near the airport have older industrial buildings and multi-unit plazas: concrete floors that need machine scrubbing, shop washrooms and lunchrooms, and offices attached to the plant.',
      },
      {
        title: 'Offices around the subway',
        body: 'The office buildings around Islington and Kipling stations need the same recurring after-hours cleaning as downtown, with more parking and easier access for crews and equipment.',
      },
      {
        title: 'Condominium common areas',
        body: 'Lobbies, corridors, amenity rooms and garbage rooms in the towers along the waterfront, cleaned on a schedule set with the property manager.',
      },
      {
        title: 'Retail plazas and clinics',
        body: 'Plazas along The Queensway, Bloor and Dixon, with entrances and floors that take heavy winter salt, and clinics and dental offices that need to be ready for patients first thing in the morning.',
      },
    ],
    access: [
      'Etobicoke is still the City of Toronto. Crews head west along the Gardiner Expressway and The Queensway, 12 to 25 km depending on the end of Etobicoke, which is usually a 20 to 35 minute drive once the evening traffic has cleared.',
      'Industrial buildings are cleaned around their shift changes rather than in the middle of them.',
    ],
    faqs: [
      {
        q: 'We run a plant in South Etobicoke. Can you clean around our shifts?',
        a: 'Yes. The schedule is set at the walkthrough around when the floor is quiet: between shifts, overnight or at weekends.',
      },
      {
        q: 'Do you cover north Etobicoke near the airport as well as the lakeshore?',
        a: 'Yes. Both ends of Etobicoke are in our service area, and crews come from our Toronto office.',
      },
    ],
  },

  mississauga: {
    review: 'Michael Katchen',
    photo: { src: '/images/high-dusting-warehouse-lift.jpg', alt: 'Worker on a lifting platform cleaning a ceiling' },
    office: [
      'Mississauga’s office space runs from head offices in the business parks and single floors in the City Centre towers to the professional and medical suites in its neighbourhood plazas. Whichever yours is, we clean it the same way: after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers desks and workstations, kitchens and break rooms, washrooms, floors and glass, and the touch points everyone shares: door handles, light switches, elevator buttons. It can run every night, a few evenings a week or weekly. Carpet extraction, floor refinishing and window cleaning are planned through the year on the same contract. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
    ],
    areasIntro: 'We clean offices and commercial buildings across Mississauga, including:',
    areas: [
      'Meadowvale and Lisgar: the Meadowvale Business Park office campuses and the plazas along Derry Road, Argentia Road and Winston Churchill Boulevard',
      'East Credit and Heartland: offices, retail and light industrial space around Mavis Road and Britannia Road',
      'Mississauga City Centre and Cooksville: office towers and retail around Square One and along Hurontario Street',
      'Erin Mills, Churchill Meadows and Streetsville: professional and medical offices, plazas and the Queen Street South main street',
      'Malton and the Airport Corporate Centre: corporate offices, logistics and industrial buildings around Pearson',
      'Sheridan Park, Southdown and Clarkson: research campuses and industrial space in the south-west',
      'Port Credit and the Lakeshore Road corridor',
    ],
    buildings: [
      {
        title: 'Office campuses in the business parks',
        body: 'The low-rise office buildings of Meadowvale, the Airport Corporate Centre and Heartland are cleaned after hours like any office, with large parking lots that make equipment and crew access easy.',
      },
      {
        title: 'Professional and medical offices in the plazas',
        body: 'Dental, medical and professional suites in the neighbourhood plazas of Lisgar, Erin Mills, East Credit and Streetsville: a reception, treatment or meeting rooms and a washroom, cleaned after closing.',
      },
      {
        title: 'City Centre office and retail',
        body: 'Office floors and street-level retail around Square One, where cleaning is coordinated with building management much as it is downtown.',
      },
      {
        title: 'Distribution centres near the airport',
        body: 'Large single-storey warehouses with high racking, dock doors and long concrete floors: machine scrubbing, high dusting and staff facilities, scheduled around 24-hour operations.',
      },
    ],
    access: [
      'From Queen Street West it is 25 to 45 km: the Gardiner and the QEW for Port Credit and the south, Highway 401 and Highway 403 for the City Centre, Meadowvale and Lisgar, and Highway 427 for the airport area. Expect 30 to 50 minutes in the evening.',
      'Because of the drive, Mississauga visits are planned as regular evening or overnight routes rather than called in at short notice. Urgent requests still go through your account executive.',
    ],
    faqs: [
      {
        q: 'Do you clean offices in Meadowvale, Lisgar and East Credit?',
        a: 'Yes. Meadowvale, Lisgar, East Credit and the rest of Mississauga are all in our service area, and offices there are cleaned after hours like anywhere else we work.',
      },
      {
        q: 'How often can our Mississauga office be cleaned?',
        a: 'As often as you need: every night, a few evenings a week, or weekly. The walkthrough sets the frequency, and the written scope says what is done on each visit.',
      },
      {
        q: 'Can you clean a warehouse that runs 24 hours?',
        a: 'Yes. Cleaning is scheduled zone by zone around shift changes and dock activity, agreed at the walkthrough.',
      },
      {
        q: 'Do you cover both the airport area and Port Credit?',
        a: 'Yes. We cover Mississauga from Malton and the airport employment area down to the lake.',
      },
    ],
  },

  brampton: {
    review: 'Ping Lee',
    photo: { src: '/images/lobby-floor-scrubber-commercial.jpg', alt: 'Close-up of a floor machine cleaning a commercial lobby' },
    office: [
      'Brampton’s offices range from professional offices and clinics in downtown Brampton and the plazas along Queen Street and Bovaird Drive to the business parks in the south end and the offices attached to its plants and warehouses. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers desks, kitchens and lunchrooms, washrooms, floors and the shared touch points, every night, a few evenings a week or weekly. Where an office sits in front of a warehouse, the two go on one contract with their own schedules. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
    ],
    areasIntro:
      'Brampton’s commercial space is mostly industrial and logistics, with offices and retail in its older centres. We cover:',
    areas: [
      'Bramalea and the Steeles Avenue and Highway 410 industrial corridor',
      'The Gore Road, Highway 50 and Airport Road industrial areas',
      'Downtown Brampton around Main and Queen Streets',
      'The Highway 407 and Steeles business parks in the south end',
      'Retail plazas along Queen Street and Bovaird Drive',
    ],
    buildings: [
      {
        title: 'Warehouses and distribution centres',
        body: 'High-bay buildings with racking and long concrete floors, where the work is machine scrubbing, high dusting, dock areas and the washrooms, lunchrooms and offices the staff use around the clock.',
      },
      {
        title: 'Manufacturing with attached offices',
        body: 'Plants where the office side needs regular janitorial cleaning and the production side needs periodic floor care, usually on two different schedules.',
      },
      {
        title: 'Downtown offices and civic-area buildings',
        body: 'Smaller professional offices and clinics in downtown Brampton, cleaned after hours.',
      },
    ],
    access: [
      'Brampton is one of the longer regular drives in our area, 35 to 45 km up Highway 401 and Highway 410, or 40 to 60 minutes after the evening rush.',
      'Many Brampton buildings run shifts or never close, so the schedule is built around the operation: between shifts, overnight or at weekends, agreed at the walkthrough.',
    ],
    faqs: [
      {
        q: 'Can you clean around our shifts?',
        a: 'Yes. The walkthrough sets when each area can be cleaned without getting in the way of production or shipping.',
      },
      {
        q: 'Do you clean small offices in Brampton?',
        a: 'Yes. A single suite or a small professional office is cleaned after hours from a written scope, as often as you need it, the same as a larger building.',
      },
      {
        q: 'Can you handle both the warehouse floor and the offices?',
        a: 'Yes. They are usually two parts of one written scope: regular janitorial cleaning for the offices and staff areas, and scheduled floor care for the warehouse.',
      },
    ],
  },

  vaughan: {
    review: 'Andy Handy',
    photo: { src: '/images/warehouse-floor-scrubber-industrial.jpg', alt: 'Floor scrubber in a warehouse aisle' },
    office: [
      'Vaughan’s office space is a mix of new towers in the Vaughan Metropolitan Centre, head offices in the business parks along Highway 400 and Highway 7, and offices at the front of industrial units in Concord and Woodbridge. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers workstations, kitchens, washrooms, floors, glass and the touch points everyone shares, every night, a few evenings a week or weekly, with carpet and hard-floor care planned through the year. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
    ],
    areasIntro:
      'Vaughan combines a new downtown with one of the GTA’s largest industrial areas. We cover:',
    areas: [
      'The Vaughan Metropolitan Centre around Highway 7 and Jane Street',
      'Concord and the industrial area around Highway 7 and Keele Street',
      'Woodbridge and the Highway 7 and Weston Road corridor',
      'The Highway 400 and Rutherford Road business parks',
      'Maple and Thornhill-area offices and clinics',
    ],
    buildings: [
      {
        title: 'New office towers in the VMC',
        body: 'Recent office buildings with polished floors, glass and shared amenity space, cleaned after hours and coordinated with building management.',
      },
      {
        title: 'Industrial and flex space in Concord and Woodbridge',
        body: 'Warehouses, contractors’ yards and flex units with offices at the front: concrete floors, dock areas, staff washrooms and the office space.',
      },
      {
        title: 'Showrooms along Highway 7',
        body: 'Large showroom floors and glass that have to look right when the doors open, cleaned overnight or before opening.',
      },
    ],
    access: [
      'Crews reach Vaughan up Highway 400, or across the 401 to the 407, a trip of 25 to 40 km that takes 35 to 50 minutes once traffic eases.',
      'Vaughan work is set up as a standing evening or overnight route, and the industrial sites in Concord and Woodbridge are fitted around their shifts.',
    ],
    faqs: [
      {
        q: 'Do you cover Concord and Woodbridge as well as the VMC?',
        a: 'Yes. Concord, Woodbridge and the VMC are all inside our service area.',
      },
      {
        q: 'Do you clean the office at the front of an industrial unit?',
        a: 'Yes. Many Concord and Woodbridge units have an office at the front and warehouse space behind; both can go on one contract, with the office cleaned after hours and the warehouse floor on its own schedule.',
      },
      {
        q: 'Can our showroom be cleaned before we open?',
        a: 'Yes. Floors and glass can be scheduled overnight or early in the morning so the showroom is ready when the doors open.',
      },
    ],
  },

  markham: {
    review: 'av-ev',
    photo: { src: '/images/janitorial-cart-preparation-supplies.jpg', alt: 'Janitorial cart with mop bucket and warning sign' },
    areasIntro:
      'Markham’s commercial space runs along Highway 7 and the Highway 404 and 407 corridors. We cover:',
    areas: [
      'Markham Centre around Highway 7 and Warden Avenue',
      'The Highway 404 and 407 office and technology corridor',
      'Unionville and the Highway 7 East corridor',
      'The Steeles Avenue and Woodbine Avenue business areas',
      'The Markham Road (Highway 48) corridor',
    ],
    buildings: [
      {
        title: 'Technology and corporate offices',
        body: 'Low-rise office buildings and campuses with open-plan floors, kitchens and meeting rooms, cleaned after hours on a recurring schedule.',
      },
      {
        title: 'Business parks with office and warehouse',
        body: 'Units with offices at the front and storage or light assembly at the back, where the two halves need different care: janitorial for the office, floor scrubbing for the back.',
      },
      {
        title: 'Clinics and professional offices',
        body: 'Medical, dental and professional suites in plazas and small office buildings, which need to be ready before the first appointment of the day.',
      },
    ],
    access: [
      'The route to Markham is the Don Valley Parkway and Highway 404, 30 to 40 km north-east of downtown and around 35 to 50 minutes in the evening.',
      'Markham contracts run on fixed evenings agreed at the walkthrough, with the office side and any warehouse side scheduled separately if they need to be.',
    ],
    faqs: [
      {
        q: 'We are in a business park with offices and a warehouse. Can you do both?',
        a: 'Yes. They go into one written scope, with recurring cleaning for the office side and scheduled floor care for the back.',
      },
      {
        q: 'Can our clinic be cleaned after the last patient?',
        a: 'Yes. Clinics are cleaned in the evening so treatment rooms, waiting areas and washrooms are ready for the morning.',
      },
    ],
  },

  oakville: {
    review: 'Mark Post',
    photo: { src: '/images/eco-friendly-cleaning-spray-microfibre.jpg', alt: 'Spray bottle and microfibre cloths used for surface cleaning' },
    areasIntro:
      'Oakville’s commercial space is split between its historic downtown, a modern uptown and business parks along the highways. We cover:',
    areas: [
      'Downtown Oakville along Lakeshore Road',
      'The Uptown Core around Trafalgar Road and Dundas Street',
      'Winston Park and the business parks along Highway 403 and the QEW',
      'The Speers Road and South Service Road employment areas',
      'Bronte and Glen Abbey',
    ],
    buildings: [
      {
        title: 'Corporate offices in the business parks',
        body: 'Office buildings and head offices along the highways, cleaned after hours on a recurring schedule, often with boardrooms and client-facing areas that need detail work.',
      },
      {
        title: 'Professional offices and clinics downtown',
        body: 'Law, financial and medical offices in older buildings and storefronts, where presentation matters as much as hygiene.',
      },
      {
        title: 'Light industrial along Speers Road',
        body: 'Units with offices and a shop or warehouse floor, needing both janitorial cleaning and periodic floor care.',
      },
    ],
    access: [
      'Oakville sits 35 to 50 km west along the Gardiner and the QEW, a 40 to 55 minute drive once the QEW has cleared.',
      'Oakville visits are booked as a regular evening route rather than at short notice; anything urgent goes to your account executive, who arranges it.',
    ],
    faqs: [
      {
        q: 'Can you keep our client-facing areas presentation-ready?',
        a: 'Yes. Reception, boardrooms and washrooms can be given extra attention in the written scope, so they are right every morning.',
      },
      {
        q: 'Do you cover both downtown Oakville and the business parks?',
        a: 'Yes, both. The service area takes in every part of Oakville, from Lakeshore Road up to the Highway 403 corridor.',
      },
    ],
  },
};

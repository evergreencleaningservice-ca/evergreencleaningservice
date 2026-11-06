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
 *
 * DATES. An edit to an entry here changes what that one page says, so set
 * the same location's `updated` in locations.ts to the time of the edit. The
 * sitemap and the page's dateModified read that field, not this file's
 * commit date (6 Nov 2026, SEO audit item 29).
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
    office: [
      'Downtown office space runs from single floors in the Financial District towers to professional offices in King West and the converted warehouses around the Entertainment District. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough, and coordinate with building management on access and security.',
      'A routine visit covers workstations, kitchens, washrooms, floors, glass and the touch points everyone shares, every night, a few evenings a week or weekly. Our office is downtown, so extra visits are easy to arrange. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
      'Two guides help with the planning before a walkthrough: <a href="/office-cleaning-cost-toronto-guide/">how office cleaning is priced in Toronto</a>, and <a href="/how-often-should-an-office-be-cleaned/">how often an office should be cleaned</a>, which matters most for towers with long hours.',
    ],
    areasIntro:
      'Downtown is where our office is. We cover the core from the waterfront to Bloor Street and from Bathurst to the Don Valley, and the older neighbourhoods just beyond it in East York and York, including:',
    areas: [
      'The Financial District and South Core',
      'The Entertainment District, King West and Queen West',
      'Liberty Village and the Fashion District',
      'Yonge–Dundas and the Discovery District along University Avenue',
      'St. Lawrence, the Distillery District and Corktown',
      'East York: the Danforth, Pape and Donlands, Thorncliffe Park and the Leaside business park along Laird Drive',
      'York: Eglinton West, Weston Road and Keele, the St. Clair West strip and the Junction',
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
      {
        title: 'East York and York: Leaside and the Junction',
        body: 'The Leaside and Thorncliffe business park mixes offices with light industrial units, and the Junction and Weston Road have converted industrial buildings with offices in them. Both get the same split as a business park: janitorial for the office side, floor scrubbing for the shop floor, scheduled together.',
      },
    ],
    access: [
      'Our office at 243 Queen St W is a few minutes from most of downtown, so a downtown building is not a highway drive away. Adding a visit, covering an event night or sending someone back to fix a missed item is quick to arrange.',
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
      {
        q: 'Do you cover East York and York, or only the core?',
        a: 'Both. Leaside, Thorncliffe Park, the Danforth, St. Clair West, the Junction and Weston Road are inside the City of Toronto and a short drive from our office, so they are scheduled the same way as downtown.',
      },
    ],
  },

  etobicoke: {
    review: 'Christopher Perera',
    photo: { src: '/images/gallery-industrial-cleaning-toronto.jpg', alt: 'Floor polishing machine in an industrial building' },
    office: [
      'Etobicoke’s offices range from the buildings around Islington and Kipling stations to professional offices and clinics in the plazas along The Queensway, Bloor and Dixon, and the offices attached to industrial units in the south and north ends. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers workstations, kitchens, washrooms, floors, glass and the touch points everyone shares, every night, a few evenings a week or weekly. Etobicoke is close to our Queen Street West office, so an extra visit is easy to arrange. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
      'If you are still working out the budget, read <a href="/office-cleaning-cost-toronto-guide/">what sets the price of office cleaning</a> and <a href="/how-often-should-an-office-be-cleaned/">how many visits a week an office needs</a> before you call.',
    ],
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
        q: 'How often can our Etobicoke office be cleaned?',
        a: 'Every night, a few evenings a week or weekly, whichever suits the office. The written scope agreed at the walkthrough says what is done on each visit.',
      },
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
      'For a first budget figure, our guide to <a href="/office-cleaning-cost-toronto-guide/">office cleaning costs in the GTA</a> walks through a worked example, and <a href="/how-often-should-an-office-be-cleaned/">this schedule guide</a> explains which rooms need attention every day.',
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
      'Plants and warehouses with office space attached usually need a different schedule for each part of the building; <a href="/how-often-should-an-office-be-cleaned/">our frequency guide</a> explains how to set it, and <a href="/office-cleaning-cost-toronto-guide/">the pricing guide</a> shows what changes the monthly figure.',
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
      'Newer buildings with long occupancy hours tend to need more frequent visits than their size suggests: see <a href="/how-often-should-an-office-be-cleaned/">how often to clean an office</a>, then <a href="/office-cleaning-cost-toronto-guide/">what that schedule means for the price</a>.',
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
    office: [
      'Markham’s offices range from corporate and technology offices along Highway 7 and the 404 and 407 corridor to multi-tenant buildings in Markham Centre, clinics and professional suites in the plazas, and offices at the front of business-park units. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers open-plan floors and workstations, kitchens, meeting rooms, washrooms, glass and the touch points everyone shares, every night, a few evenings a week or weekly, with carpet and floor care planned through the year. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
      'A campus or a multi-tenant floor can be priced per tenant or as one scope; <a href="/office-cleaning-cost-toronto-guide/">the pricing guide</a> covers both, and <a href="/how-often-should-an-office-be-cleaned/">the frequency guide</a> helps split daily from weekly work.',
    ],
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
        q: 'Do you clean office space in Markham Centre and along Highway 7?',
        a: 'Yes. Markham Centre, the Highway 7 corridor and the business parks along Highway 404 and 407 are all in our service area, and offices there are cleaned after hours.',
      },
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
    office: [
      'Oakville’s offices range from law, financial and medical offices in downtown storefronts along Lakeshore Road to head offices in Winston Park and the business parks along the QEW and Highway 403, and the offices in front of the units on Speers Road. Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough.',
      'A routine visit covers reception, boardrooms and workstations, kitchens, washrooms, floors, glass and the shared touch points, every night, a few evenings a week or weekly. See <a href="/services/office-cleaning/">office cleaning</a> for the full scope.',
      'Before the walkthrough it helps to read <a href="/how-often-should-an-office-be-cleaned/">which office areas need daily cleaning</a> and <a href="/office-cleaning-cost-toronto-guide/">how a monthly cleaning budget is built</a>, so the proposal can be compared on the same scope.',
      'Oakville’s business parks along the QEW, from Bronte Road to Winston Churchill Boulevard, are mostly two- and three-storey buildings with their own parking, so there is no dock or freight elevator to book and the crew can start as soon as the last person has left for the evening.',
    ],
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
        q: 'How often can our Oakville office be cleaned?',
        a: 'As often as you need: nightly, a few evenings a week or weekly. The walkthrough sets the frequency, and the written scope lists what is done each visit.',
      },
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
  'north-york': {
    review: 'Edward Sherman',
    photo: { src: '/images/office-backpack-vacuum-toronto.jpg', alt: 'Vacuum cleaner being used on an office floor' },
    office: [
      'North York’s office space is concentrated in the towers around North York Centre, where Yonge Street runs from Sheppard to Finch over the subway, and in the low-rise business parks off Highway 401 and Highway 404 around Consumers Road and Don Mills. Further west, along Dufferin, Keele and Steeles, offices sit at the front of industrial units. We look after all three kinds in the evening, working to a task list we write down after walking the building with you.',
      'On a regular visit the crew works through the desks, the kitchen, the boardrooms, the washrooms and the glass, plus the handles and switches everybody touches; that can be nightly, on a few set evenings, or once a week. North York is inside the City of Toronto and a short drive up the Allen or the Don Valley from our office, so adding a visit or a one-off clean is easy to arrange. The full task list is on the <a href="/services/office-cleaning/">office cleaning</a> page.',
      'A tower floor and a business-park unit are priced differently because the access and the floor areas differ. Two guides are worth ten minutes before you ask for a quote: one on <a href="/office-cleaning-cost-toronto-guide/">what goes into a Toronto office cleaning price</a>, and one on <a href="/how-often-should-an-office-be-cleaned/">picking the number of visits</a>.',
    ],
    areasIntro:
      'Between Highway 401 and Steeles, and from the Humber to the Don Valley, these are the North York business areas we serve:',
    areas: [
      'North York Centre along Yonge Street from Sheppard to Finch',
      'The Consumers Road and Victoria Park business park at Highway 401 and 404',
      'Don Mills, Lesmill and the Leslie Street corridor',
      'York Mills and the Highway 401 office belt at Yonge',
      'Downsview, Dufferin and Keele, and the Steeles and Finch industrial units',
      'The Yorkdale and Lawrence Avenue West area',
    ],
    buildings: [
      {
        title: 'Office towers at North York Centre',
        body: 'Towers along Yonge where a property manager sets the rules: who signs crews in, which hours the freight elevator can be booked, and which corridors are the landlord’s to clean. Each tenant suite gets its own task list and the work starts once the last tenant has gone home.',
      },
      {
        title: 'Business-park offices',
        body: 'Two- and three-storey buildings around Consumers Road and Don Mills with open floors, a kitchen on each level and surface parking, which makes evening access simple. Carpet extraction and floor care are planned through the year.',
      },
      {
        title: 'Clinics near the hospitals',
        body: 'Medical and dental suites in the medical buildings and plazas near North York General, Sunnybrook and Humber River, done in the evening so each operatory and the waiting room are ready when the clinic unlocks in the morning.',
      },
      {
        title: 'Industrial units along Steeles and Finch',
        body: 'Units with a small office ahead of a shop or a warehouse. The office is kept up on a regular round and the floor behind it is machine-scrubbed on dates set in advance, under one agreement.',
      },
    ],
    access: [
      'North York is 15 to 25 km from our office at Queen Street West: up the Allen Road and Highway 401 for the west side, the DVP and the 404 for the east, or straight up Yonge Street for the centre. Expect 25 to 45 minutes in the evening.',
      'Because it is inside Toronto, North York visits are scheduled like downtown ones: fixed evenings, with extra visits and one-off cleans fitted in around them.',
    ],
    faqs: [
      {
        q: 'Do you clean offices in the towers at Yonge and Sheppard?',
        a: 'Yes. North York Centre is covered. Tower work is booked around the landlord’s sign-in and freight-elevator rules, which we go through when we walk the floor with you.',
      },
      {
        q: 'Our clinic is in a medical building near the hospital. Can you clean it after hours?',
        a: 'Yes. We come in once the clinic has closed, and the rooms, surfaces and tasks that are ours versus your staff’s are settled around your infection-prevention rules before the first visit.',
      },
      {
        q: 'We have an office at the front of a unit on Steeles. Do you do the warehouse too?',
        a: 'Yes. The office round and the warehouse floor work are planned together under one agreement, each on its own dates.',
      },
    ],
  },
  scarborough: {
    review: 'Michael Katchen',
    photo: { src: '/images/carpet-extraction-boardroom-toronto.jpg', alt: 'Carpet cleaning tool being used on a carpet' },
    office: [
      'Scarborough’s offices are grouped in a few clusters: the towers and multi-tenant buildings around Scarborough Centre and Consilium Place by Highway 401 and McCowan, the business area along Progress Avenue, the professional and medical suites in the plazas on Sheppard, Kennedy and Lawrence, and the offices attached to the warehouses and plants in Milliken and along the 401. We take them on in the evening with a crew that stays on the building, to a task list fixed when we walk it with you.',
      'Each visit takes in the desks and the open floor, the kitchen, the washrooms, the floors, the glass and the shared handles and switches; the rhythm can be nightly, several evenings a week or weekly, with carpet extraction and floor refinishing booked for set dates in the year. Everything a visit includes is listed under <a href="/services/office-cleaning/">office cleaning</a>.',
      'For a plaza suite or a plant office, the guide on <a href="/how-often-should-an-office-be-cleaned/">daily versus weekly office tasks</a> helps decide the visits, and the one on <a href="/office-cleaning-cost-toronto-guide/">building a monthly cleaning budget</a> shows how to line up two proposals on the same scope.',
    ],
    areasIntro:
      'Scarborough stretches from Victoria Park to the Rouge and from the lake to Steeles. We cover:',
    areas: [
      'Scarborough Centre, Consilium Place and the McCowan and Highway 401 area',
      'The Progress Avenue and Kennedy Road business area',
      'Agincourt and the Sheppard Avenue East corridor',
      'Milliken and the Steeles and Kennedy industrial area',
      'The Golden Mile along Eglinton Avenue East and Warden',
      'Kingston Road, Cliffside and West Hill',
    ],
    buildings: [
      {
        title: 'Offices at Scarborough Centre',
        body: 'The towers and public-sector offices around the town centre have a security desk, a dock and a freight elevator, and those three things decide when the crew can start and how it gets in. We fit the schedule to them.',
      },
      {
        title: 'Warehouses and plants along the 401',
        body: 'Distribution buildings and manufacturing plants with an office in the front corner. The office is done nightly or on set evenings; the production floor is machine-scrubbed in the gaps between shifts.',
      },
      {
        title: 'Plaza clinics and professional suites',
        body: 'Dental, medical and professional offices in plazas and small medical buildings along Sheppard, Kennedy, Lawrence and Kingston Road, where the crew comes in by the front door after the last appointment because there is no dock.',
      },
      {
        title: 'Retail along the Golden Mile',
        body: 'Big-box and showroom floors on Eglinton East where glass, entrances and hard floors take the most wear, and the salt tracked in from large parking lots has to be dealt with every winter visit.',
      },
    ],
    access: [
      'Scarborough is 20 to 35 km from Queen Street West: the Don Valley Parkway and Highway 401 for the north and centre, the Gardiner and Kingston Road for the lakeshore, about half an hour to fifty minutes once the rush hour has thinned.',
      'Scarborough is inside the City of Toronto, so visits are scheduled on fixed evenings like the rest of the city, with the plant side and the office side of an industrial building planned apart when that suits the shifts.',
    ],
    faqs: [
      {
        q: 'Do you clean offices near Scarborough Town Centre?',
        a: 'Yes. Scarborough Centre, Consilium Place and the Progress Avenue business area are all covered, and the work there runs in the evening around whatever rules the building sets.',
      },
      {
        q: 'We run shifts in a plant in Milliken. When would you clean the office?',
        a: 'Around the shifts. At the walkthrough we agree the window when the office and washrooms are free, and the floor scrubbing is scheduled when the shop floor is clear.',
      },
      {
        q: 'Can you handle a retail store on Eglinton East with a big parking lot?',
        a: 'Yes. Entrances, glass and floors are on every visit, and in winter the salt is dealt with each visit rather than once a week.',
      },
    ],
  },
  'richmond-hill': {
    review: 'Andy Handy',
    photo: { src: '/images/dust-on-office-desk-detail.jpg', alt: 'Duster beside a keyboard and office supplies' },
    office: [
      'Most of Richmond Hill’s office stock is in the parks along Highway 7 and Highway 404: Beaver Creek around Leslie Street and East Beaver Creek Road, Headford to the east, and the multi-tenant buildings near Richmond Hill Centre at Yonge and Highway 7. Along Yonge Street itself, professional and medical suites sit above and beside the plazas from Highway 7 north to Elgin Mills. We handle them in the evening, on terms set out in writing after a walkthrough.',
      'The regular round covers desks, the kitchen, meeting rooms, washrooms and glass, and the switches, handles and rails that get touched all day, on whatever rhythm the office needs: nightly, a few set evenings, or weekly. Richmond Hill contracts run on fixed evenings, with carpet and floor refinishing booked for dates in the year. What a visit includes is spelled out on the <a href="/services/office-cleaning/">office cleaning</a> page.',
      'A technology office that keeps long hours usually wants more visits than its floor area would suggest. The guide to <a href="/how-often-should-an-office-be-cleaned/">setting an office cleaning schedule</a> explains why, and the guide to <a href="/office-cleaning-cost-toronto-guide/">Toronto office cleaning prices</a> shows the effect on the monthly figure.',
    ],
    areasIntro:
      'Richmond Hill’s business areas are strung along Highway 7, Highway 404 and Yonge Street:',
    areas: [
      'Beaver Creek and East Beaver Creek, around Leslie Street and Highway 7',
      'Headford and the Highway 404 corridor',
      'Richmond Hill Centre at Yonge and Highway 7',
      'The Yonge Street corridor from Highway 7 to Elgin Mills, including the medical buildings near Mackenzie Health',
      'The Newkirk Road and Elgin Mills industrial area',
      'Oak Ridges along Yonge Street north',
    ],
    buildings: [
      {
        title: 'Beaver Creek technology offices',
        body: 'Low-rise office buildings where the open floor, the kitchen and the meeting rooms are ours and the server room is not, with surface parking that makes evening access straightforward.',
      },
      {
        title: 'Professional and medical suites along Yonge',
        body: 'Dental, medical and professional offices in small buildings and plazas, done once the last patient has left, so the operatories, the waiting room and the washrooms are ready before the first appointment.',
      },
      {
        title: 'Industrial units north of Elgin Mills',
        body: 'Units with an office in front of a shop or warehouse. The office is kept up on a regular round and the floor behind it gets machine scrubbing on dates fixed in advance, under one agreement.',
      },
    ],
    access: [
      'Richmond Hill is 30 to 40 km north of our office at Queen Street West: up the DVP to the 404 and off at Highway 7, or further to Elgin Mills for the north end. Allow 40 to 55 minutes in the evening.',
      'Visits fall on set evenings chosen when we walk the building; because of the drive, one-off work is grouped with the regular visits where possible.',
    ],
    faqs: [
      {
        q: 'Do you clean offices in the Beaver Creek business park?',
        a: 'Yes. Beaver Creek, Headford and the rest of the Highway 7 and 404 corridor are covered, and the work there is done on fixed evenings.',
      },
      {
        q: 'Our dental office is on Yonge Street. Can you clean after the last patient?',
        a: 'Yes. We come in after closing, with the rooms, surfaces and tasks that are ours settled at the walkthrough and the clinical procedures left with your staff.',
      },
      {
        q: 'Do you cover Oak Ridges and the north end of Richmond Hill?',
        a: 'Yes. Oak Ridges and the Elgin Mills area are inside the service area; the drive is a little longer, so visits there are planned on fixed evenings.',
      },
    ],
  },
  'durham-region': {
    review: 'Edward Sherman',
    photo: { src: '/images/commercial-disinfection-service.jpg', alt: 'Protected worker cleaning a doorknob' },
    office: [
      'Across Pickering, Ajax and Oshawa, offices are found in the business areas beside Highway 401: around Brock Road and the Pickering city centre, the Salem Road and Harwood Avenue areas of Ajax, and in downtown Oshawa and the office and industrial belt along Stevenson Road and Taunton Road. Many are offices at the front of a plant or distribution building. We take them on in the evening, under a task list we write down after walking the building with you.',
      'Every visit takes care of the desks, the kitchen, the washrooms, the floors, the glass and the handles and switches everyone uses, nightly, on fixed evenings or weekly. Because crews travel out from Toronto, Durham visits are planned so that one trip covers the evening’s work. The <a href="/services/office-cleaning/">office cleaning</a> page lists everything a visit includes.',
      'For an office attached to a plant, the guide on <a href="/how-often-should-an-office-be-cleaned/">visits per week for an office</a> and the one on <a href="/office-cleaning-cost-toronto-guide/">the parts of an office cleaning price</a> help get the office and the floor quoted together.',
    ],
    areasIntro:
      'The business areas of Durham Region sit beside Highway 401, from the Rouge to Oshawa:',
    areas: [
      'Pickering: the Brock Road and Highway 401 business area, the city centre and Bayly Street',
      'Ajax: Salem Road, Harwood Avenue and the Westney Road industrial area',
      'Oshawa: downtown, the Stevenson Road and Highway 401 industrial belt, and the Taunton Road offices',
      'The Highway 401 corridor between them, including Whitby when a building is on the way',
    ],
    buildings: [
      {
        title: 'Offices attached to plants and distribution buildings',
        body: 'Much of Durham’s office space is the front corner of a larger industrial building. The office is cleaned on a recurring schedule; the plant or warehouse floor is scrubbed on a schedule set around the shifts.',
      },
      {
        title: 'Professional suites and clinics',
        body: 'Dental, medical and professional offices in strip plazas and low-rise buildings on the main roads, visited after the day’s last appointment.',
      },
      {
        title: 'Downtown Oshawa offices',
        body: 'Older multi-storey buildings and converted ground floors in the core, where the crew carries its equipment in through the front door once the street has gone quiet.',
      },
    ],
    access: [
      'Pickering is about 35 km from our office at Queen Street West, Ajax about 45 km and Oshawa about 60 km, all by the Don Valley Parkway and Highway 401. Expect 45 to 70 minutes in the evening, depending on the town.',
      'Because of the drive, Durham work is booked on set evenings chosen when we walk the building, and one-off jobs are grouped with the regular visits whenever that works. Daily service is possible where the building needs it.',
    ],
    faqs: [
      {
        q: 'Do you really travel to Oshawa from Toronto?',
        a: 'Yes. Pickering, Ajax and Oshawa are in our service area. Crews come out on fixed evenings and the schedule is written so one trip covers the evening’s work.',
      },
      {
        q: 'Can you clean the office and the warehouse of our building in Ajax?',
        a: 'Yes. The office round and the warehouse floor are written up together, each with its own dates, so one evening trip covers both.',
      },
      {
        q: 'Is Whitby covered?',
        a: 'Whitby is not listed as a service area on its own. If a building is between Ajax and Oshawa on the route the crew already takes, ask at the walkthrough and we will tell you plainly whether it can be scheduled.',
      },
    ],
  },
};

Score: 56/100

Local SEO audit of https://www.evergreencleaningservice.ca/ (2026-11-06). Business type: hybrid (one storefront office at 243 Queen St W plus a 10-city service area). Vertical: commercial and office cleaning (home/commercial services family, B2B). Source: crawl data in raw/crawl, the repo, and 7 live probes. No DataForSEO, so no geo-grid or local-pack data.

| Dimension | Weight | Score | Note |
|---|---|---|---|
| GBP signals | 25 | 14 | GBP exists and is linked; no embed; category, photos, posts and the shared-address question unverified |
| Reviews and reputation | 20 | 9 | 7 reviews shown, 3 in the last year; no AggregateRating; total count and rating unknown |
| Local on-page | 20 | 13 | 7 distinct city pages with neighbourhoods; no proof, no map, 4 service-area cities without a page |
| NAP and citations | 15 | 8 | Site NAP is flawless; off-site citations not found where probed; Facebook/LinkedIn still carry the legacy name |
| Local schema | 10 | 8 | Valid, complete core properties; no rating, no per-city areas on the entity |
| Local links and authority | 10 | 4 | No BIA, trade-body or chamber links; BOMA is paywalled |
| Total | 100 | 56 | |

Proximity (about 55% of local ranking variance in the Search Atlas study) is outside the site's control. A Queen St W office helps for downtown searches and hurts for Brampton, Vaughan and Oshawa.

## What works

- NAP is identical on all 92 crawled pages. Footer reads "Evergreen Office Cleaning / 243 Queen St W. / Toronto, ON M5V 1Z4 / (416) 803-4880". The phone is the only format used in visible text (456 occurrences, no variants) and `tel:+14168034880` is the only tel link. Contact page, JSON-LD, llms.txt and the footer match.
- Hours match everywhere: footer, JSON-LD `openingHoursSpecification` (Mon-Fri 07:00-18:00), llms.txt, contact and quote pages. They also match the stated GBP hours.
- Name: "Evergreen Office Cleaning" is used 470 times against 21 legacy mentions. The legacy name is handled deliberately: schema `alternateName`, one "Formerly Evergreen Cleaning Service" line on /contact-us/, and "Formerly known as" in llms.txt.
- Schema: `ProfessionalService` (a valid LocalBusiness subtype) with `@id`, address, `geo` at 5 decimals (43.65019, -79.38856), `hasMap` to the cid URL, `openingHoursSpecification`, `telephone`, `email`, `foundingDate`, 10 `areaServed` City entries, `contactPoint`, and `sameAs` led by the Google listing. Each location page has a `Service` node with `areaServed` City, provider linked by `@id`, a `FAQPage` and breadcrumbs.
- The 7 location pages are not doorway pages. A 6-word shingle test gave 64-79% unique text per page (Mississauga 79, Vaughan 73, Downtown 70, Etobicoke 66, Brampton 66, Oakville 64, Markham 64). Each lists real districts and corridors (Meadowvale/Derry Rd, VMC/Highway 7, Bramalea/Highway 410, Liberty Village, Humber Bay Shores), building types, drive times, and says plainly that the office is not in that city. This passes the city-swap test.
- Internal linking: each location page links in the body to 5 service pages, the clinic industry page, /our-process/, the quote page and all sibling locations. All 12 service and industry pages link back to all 7 location pages. The footer links to the hub and every page.
- Reviews page lists all Google reviews with name, age and stars, and links to the review URL (g.page/r/CW9cqxQ9_IfYEBM/review) in the header area, footer and contact page.
- Insurance and compliance claims (WSIB, bonded, liability insurance, background screening) are on the home, service, location and quote pages.

## Findings

### 1. No Google Maps embed anywhere (Medium)
Evidence: no `maps/embed` iframe on any page. The only iframe is the GTM noscript. /contact-us/ has the address as a text link to `maps.google.com/?cid=15602716773318351983`, and /locations/ is text only. The contact page is also only 122 words, with no hours in its body (hours appear only in the footer) and no directions.
Recommendation: add an embedded map of the place (Embed a map > place, using the GBP listing) to /contact-us/ and the footer of /locations/toronto-downtown/. If the address is hidden on the GBP (see finding 3), skip the embed and use a text map link instead. Add hours, "how to find us" and transit notes (St Andrew and Osgoode stations, Queen/John area) to the contact page body. Edit the contact page under `src/pages/contact-us.astro`. Replace the contact form's required "Address *" field (street, city, province, postal code) with an optional one. A B2B lead form with a required full address cuts conversions.

### 2. Reviews: thin, ageing, and no AggregateRating (High)
Evidence: /reviews/ and `src/data/reviews.ts` hold 7 reviews, all 5-star. Dates: 2026-09-03, about 9 months ago, about a year ago, and four from 5-6 years ago. Only 3 are inside the last 12 months and none since early September. Total GBP review count and average rating are not on the site, and I could not read them from Google (the cid page is JS-rendered). No schema on any of the 92 pages carries `aggregateRating` or `Review`. The homepage has three named testimonials (Carmichael, Robinson, Lockheart) that the kit lists as unconfirmed; they carry no dates or links.
Recommendation:
- Keep the cadence going. The kit's review-request QR and short link are the right tool; aim for steady additions, not bursts. A company active since 1989 with 7 public reviews is well below what local competitors usually show. I cannot quote a competitor benchmark here.
- Schema: do not add an `aggregateRating` to the `ProfessionalService` that is hand-computed from 7 reviews. Google's policy for self-serving reviews applies to LocalBusiness. If the client wants rating markup, fill it from the live GBP count and rating only, and accept that it may not display. Visible text, such as "5.0 on Google, N reviews", with a link to the profile is safer and helps users. This needs the real count from the GBP.
- `reviews.ts` computes "N months ago" at build time. If the site is not rebuilt, the labels go stale. Show the ISO month ("September 2026") instead of a relative age, or rebuild on a schedule.
- Confirm that the homepage testimonials are genuine (open question 3 in the kit) and name the business and neighbourhood where the client permits.

### 3. GBP address model and category are unverified (High, needs the client)
Evidence: the repo records the client's decision to keep 243 Queen St W visible as a store-front address. The kit asks for confirmation of the "Floor 1, Green Offices Toronto Inc." line on the listing, i.e. whether this is a shared or serviced office, and whether customers visit. I could not open the GBP, so primary category, secondary categories, services, photos, posts and Q&A are all unverified from here.
Recommendation:
- If the office is a shared or virtual office with no signage and no customer visits, Google treats the listing as ineligible for a visible address. Hide the address and show the service area. This is the main suspension risk in the file.
- Category: "Janitorial service" as primary is the best Google-offered fit and I agree with the kit. Secondary categories: add only those that map to a real service line. Carpet cleaning and Window cleaning service are defensible; pressure washing and floor refinishing are weaker and dilute the primary. Do not add "House cleaning service". This cannot be verified without access.
- Photos: the site has real equipment photos (a warehouse high-dusting lift is on the Mississauga page). Upload real job photos to the GBP and add a street-level shot of the entrance only if customers visit.
- If the address is hidden, change the footer and contact copy to keep the address as text for NAP but remove "visit us" language and the map embed.

### 4. Citations: nothing found under the current NAP (High)
Evidence, 7 probes (all unverified where not listed):
- YellowPages.ca search "Evergreen Cleaning / Toronto ON": 3 results, none with phone (416) 803-4880 or 243 Queen St W. The two with visible phones are 647-831-2284 and 705-801-5403. These are other businesses or stale listings, not confirmed as Evergreen's.
- BBB search: results include "Evergreen Cleaning" and "Evergreen Cleaning Services" with other addresses and phones (130 Broadlands Blvd; 55 Village Centre Pl; (416) 281-4328, (416) 477-7279). No match for Evergreen.
- Yelp and HomeStars returned 403/Cloudflare challenge: unverified.
- Facebook (login wall) and LinkedIn (403): unverified, but the site links to `facebook.com/Evergreen-Cleaning-Service-104007224426820` and `linkedin.com/company/evergreen-cleaning-service-toronto/`, so both URLs still carry the legacy name, as the kit says.
- Bing Places, Apple Business Connect, Canada411, Foursquare: not probed.
Recommendation: follow the kit order (Bing, Apple, YellowPages.ca, Canada411, Yelp, HomeStars, BBB, Foursquare) with the exact NAP. Before creating a YellowPages or BBB entry, search for and claim or merge any old "Evergreen Cleaning" listing on 416-803-4880 so you do not create a duplicate. Per the Whitespark-based rule in this agent's brief, three of the top five AI-visibility factors are citation-related, so this is the main off-site gap. Update the Facebook page name and the LinkedIn company name and industry, then change the slugs in `sameAs` in `src/lib/schema.ts` (the Facebook slug and the LinkedIn slug both still say "evergreen-cleaning-service").

### 5. Service-area cities in schema and copy without a page (Medium)
Evidence: `areaServed` and copy name Richmond Hill, Pickering, Ajax and Oshawa, and the text names Scarborough, North York, East York and York. None has a page. The footer links "Richmond Hill" and "Scarborough" to /locations/ (the hub), not to a city page, which is a misleading anchor. The hub (229 words) says "the rest are covered in exactly the same way". The GBP service area also lists them. Note that `areaServed` in schema omits Scarborough, North York, East York and York even though llms.txt and the hub claim them (they are folded into "Toronto").
Recommendation: prioritise by value, not symmetry. Add /locations/richmond-hill/ and /locations/scarborough/ first (the footer already promises both, and Scarborough/North York have large office stock); then North York, Pickering/Ajax (one page "Durham Region" is acceptable) and Oshawa. Only write a page if it reaches the same bar as the existing seven (distinct districts, drive time, building types); otherwise leave them on the hub. Until a page exists, make the footer's Richmond Hill and Scarborough entries plain text, or point them at the hub with a clear anchor. Check Search Console for impressions per city before choosing. Edit `src/data/locations.ts`, `location-local.ts` and `coverage.ts`. Add Scarborough, North York, East York and York to `areaServed` in `src/lib/schema.ts` as `AdministrativeArea`/`City` entries so schema matches llms.txt.

### 6. No local proof on location pages (High)
Evidence: no case studies, named clients, building names, logos, project photos with a place, or before/after pairs on any location page. A grep for "case stud" returns 0 hits site-wide. The location pages name real corridors and landmarks (Square One, Airport Corporate Centre, Liberty Village, VMC) but never say "we clean at X". A portfolio section on the property-management page exists but names no clients. The kit and the repo's case-study model have a publish gate that blocks the build until approvals are recorded; none is.
Recommendation: this is what turns descriptive pages into trusted ones. Get one approved reference per city where one exists: "recurring office contract in Meadowvale since 2021" is enough, with permission and no logo needed. Add one real, geotagged crew or equipment photo per location page with descriptive alt text. Add a short "Clients in {city}" line with the review quote that mentions the area (Google reviews that name a neighbourhood help both humans and the map pack). Do not invent clients.

### 7. Trust and credential proof is stated but not shown (Medium)
Evidence: WSIB, bonded and insured appear in copy on about 25 pages but there is no certificate or clearance document, no named insurer, no WSIB clearance or coverage statement, no "request our certificate of insurance" line, and no link to the WSIB verification page. Zero mentions of BOMA, BSCAI, a chamber, CIMS, Green Seal or an equivalent. Products claim "UL ECOLOGO" certification via Armstrong ProSeries Green, with no link. The clinic page cites IPAC (once) but there is no downloadable checklist or reference.
Recommendation: add a "Insurance and WSIB" block on /about-us/ and the quote page: "Certificate of insurance and WSIB clearance certificate available on request, usually sent with the proposal." If the client will provide them, publish a redacted PDF. Link the product claim to the manufacturer's certification page. For clinics, add an IPAC-aligned cleaning checklist PDF (sourced from the RCDSO and Public Health Ontario documents already cited). After-hours service is the core offer and is stated well; add a line on key and fob control, alarm codes and insurance for after-hours access, since property managers ask first about this.

### 8. Social profiles and sameAs carry the legacy name (Medium)
Evidence: `sameAs` contains `facebook.com/Evergreen-Cleaning-Service-104007224426820` and `linkedin.com/company/evergreen-cleaning-service-toronto/`. The kit says the LinkedIn industry is "Retail". The X handle is @EvergreenClean8. Also, the street address in site text and schema is "243 Queen St W." with a trailing period, while the Google listing and the kit use "243 Queen St W" with no period (the kit block has none). This is a minor mismatch that structured-data checkers and citation tools may treat as different strings.
Recommendation: drop the trailing period in `src/data/site.ts` (and the llms.txt source) so the string is exactly "243 Queen St W, Toronto, ON M5V 1Z4". Rename the Facebook page and LinkedIn company, then update both `sameAs` URLs once the new slugs exist.

### 9. Schema refinements (Low)
Evidence: single `ProfessionalService` node is valid and complete. There is no `LocalBusiness` subtype closer to cleaning that is better: `HomeAndConstructionBusiness` is aimed at residential trades, so I would not switch. `CleaningService` is not a schema.org type (the repo already fixed that).
Recommendation:
- Keep `ProfessionalService`. Optionally add `"additionalType"` with a Wikidata/Google category URI is not needed.
- Add `knowsAbout`/`hasCredential` only when a real certificate is published (finding 7).
- Add `areaServed` entries with `sameAs` Wikipedia/Wikidata links for the cities (the reference file recommends it for SABs), and the four missing Toronto districts.
- If the address is hidden on the GBP, keep `address` in schema, since Google does not require a public address, but consider removing `hasMap`.
- No `priceRange` is correct: do not invent one.

### 10. Local links and authority (Medium)
Evidence: no inbound-link data available here beyond the kit's Moz summary (DA 52 is inflated by Google redirect pages; real linking sites probably single digits to low tens). The kit already rules out BOMA Toronto as a link source (member directory behind a login, $2,799 Allied tier, checked 30 Oct).
Recommendation, ranked by link value per effort:
1. The BIA whose boundary contains 243 Queen St W (confirm on the City map; the Downtown Yonge, Financial District and Queen West-type BIAs differ); a member directory link is both local and relevant.
2. BSCAI (bscai.org) and ISSA Canada member directories, if the listing is public and links out. Check logged out first.
3. Toronto Region Board of Trade or Toronto/GTA chambers (Mississauga Board of Trade, Brampton Board of Trade, Markham Board of Trade, Oakville Chamber): the same logged-out test. Each also supports a city page.
4. Property-manager "approved vendor" pages and client testimonial pages (ask existing property-management clients).
5. Supplier partner pages (Armstrong and equipment makers).
6. Local sponsorships and a Toronto office-hygiene guide for property-management blogs.
Do not buy links. Do not disavow the scraper links (agreeing with the kit).

### 11. Hub page and navigation (Low)
Evidence: /locations/ is 229 words, text-only, with no map and no list of the unpaged cities as separate sections. The nav "Service Areas" menu lists 7 entries but not Richmond Hill/Scarborough, which appear only in the footer.
Recommendation: add a simple SVG or embedded service-area map to the hub with the office marked, and group the cities by region (Toronto, Peel, York, Halton, Durham). Edit `src/pages/locations/index.astro`.

### 12. Facts to check with the client that affect local trust (Info)
- Confirm the "Floor 1, Green Offices Toronto Inc." line on the GBP and whether the space is shared.
- Confirm how many Google reviews and what average rating the listing shows, and whether any are older than the 7 displayed (the site shows 7).
- Whether Yelp, HomeStars or BBB profiles already exist under a different name or phone.

## Review health snapshot
Rating and total count: not verifiable from here (GBP is JS-rendered; no API). Displayed sample: 7 reviews, 7 x 5 stars. Newest 2026-09-03 (about 2 months before today). Velocity: 3 in the last 12 months, 0 in Oct-Nov. Response rate: the repo says every review was replied to on 29 Oct; not verified from here. Schema: no AggregateRating.

## NAP consistency table
| Source | Name | Address | Phone | Hours |
|---|---|---|---|---|
| Footer (all pages) | Evergreen Office Cleaning | 243 Queen St W. Toronto, ON M5V 1Z4 | (416) 803-4880 | Mon-Fri 7am-6pm |
| Contact page | Evergreen Office Cleaning ("Formerly Evergreen Cleaning Service") | 243 Queen St W., Toronto, ON M5V 1Z4 | +1 (416) 803-4880 | footer only |
| JSON-LD | Evergreen Office Cleaning (+2 alternateName) | 243 Queen St W. / Toronto / ON / M5V 1Z4 / CA | +1-416-803-4880 | Mon-Fri 07:00-18:00 |
| llms.txt | Evergreen Office Cleaning | 243 Queen St W., Toronto, ON M5V 1Z4, Canada | (416) 803-4880 | Mon-Fri 7am-6pm |
| Reviews page | Evergreen Office Cleaning (reviewers use the legacy name in their own words) | footer | footer | footer |
| Facebook / LinkedIn slugs | legacy "Evergreen Cleaning Service" | unverified | unverified | unverified |
| Kit / GBP (per repo) | Evergreen Office Cleaning | 243 Queen St W (no period) | (416) 803-4880 | Mon-Fri 7-18 |

Differences: the trailing period after "W", the "+1 (416)" vs "(416)" display on the contact page (cosmetic; the contact page is the only place), and the legacy name on two social URLs. No postal code, phone or hours conflicts.

## Industry-specific notes (commercial cleaning)
- Present: after-hours scheduling, same crew, WSIB/bonded/insured, background screening, free walkthrough, 2-hour reply, clinic page with IPAC reference.
- Missing or unproven: certificate of insurance, WSIB clearance, key/fob/alarm procedures, a named account contact (About page has no named people, a pending client item), BSCAI/ISSA/CIMS-type credentials, case studies, sample scope or inspection checklist download.

## Quick wins
1. Remove the trailing period from "243 Queen St W." in `src/data/site.ts`, schema and llms.txt, and make the Richmond Hill and Scarborough footer links plain text until pages exist.
2. Add a map embed (or at least a directions block and hours) to /contact-us/, and make the "Address" field in the contact form optional.
3. Publish "Certificate of insurance and WSIB clearance on request" on /about-us/ and /request-a-quote/.
4. Run the kit's directory sequence (Bing Places, Apple Business Connect, YellowPages.ca, Yelp, HomeStars, BBB) with the exact NAP, after searching for existing listings to claim.
5. Get the true GBP rating and count from the client, show it as visible text, and keep requesting reviews steadily (the last one is dated September).

## Limitations
- No access to the GBP, so category, photos, posts, services, review count and rating, response rate, address visibility and suspension risk are unverified.
- No DataForSEO, no local-pack or geo-grid data, no competitor review benchmarks.
- Yelp and HomeStars blocked automated requests (403); Facebook and LinkedIn were behind walls. Bing, Apple, Canada411 and Foursquare were not probed (request budget). The YellowPages and BBB checks were name searches only; absence from the first results is not proof there is no listing.
- Search Console data (impressions by city) was not available, so the order of new city pages is a judgement.
- Backlink data comes from the repo's Moz note only.

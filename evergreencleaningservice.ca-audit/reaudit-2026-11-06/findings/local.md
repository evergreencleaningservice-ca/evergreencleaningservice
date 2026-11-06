Score: 61/100
Previous: 56/100 (first audit)

Local SEO re-audit of https://www.evergreencleaningservice.ca/ (2026-11-06, evening). Business type: hybrid (one office at 243 Queen St W, 11-page service area). Vertical: commercial/office cleaning. Sources: raw/crawl (89 URLs, all 200), raw/llms.txt, and 4 live citation probes. No DataForSEO, no GBP access, no local-pack data.

| Dimension | Weight | Now | Was | Note |
|---|---|---|---|---|
| GBP signals | 25 | 14 | 14 | Nothing observable changed: still no map embed, GBP category/photos/posts/address model unverified |
| Reviews and reputation | 20 | 9 | 9 | Same 7 reviews, newest "around September 2026", no new reviews, no rating shown or marked up. Labels no longer go stale |
| Local on-page | 20 | 16 | 13 | 11 city pages, all linked from nav/footer/hub; still no local proof, no map, contact page thin |
| NAP and citations | 15 | 10 | 8 | Address string fixed. Citations still not found under the current name; social URLs still legacy |
| Local schema | 10 | 8 | 8 | Valid. Per-city Service nodes added for 4 new pages; entity `areaServed` not updated |
| Local links and authority | 10 | 4 | 4 | No change observed |
| Total | 100 | 61 | 56 | |

Proximity (about 55% of ranking variance in the Search Atlas study) is outside the site's control. Brampton, Scarborough, Richmond Hill and Durham remain far from a Queen St W office.

## 1. Status of every first-audit finding

| # | First-audit finding | Status | Evidence now |
|---|---|---|---|
| 1 | No Google Maps embed; contact page thin (122 words), no hours in body, no directions; required Address field in the form | Open | 0 of 89 crawled pages contain `maps/embed`. /contact-us/ body is still: name, "Formerly Evergreen Cleaning Service", address, phone, email, then the form. No hours, no directions, no transit note. The form inputs `address1`, `city`, `state` still carry `required`. |
| 2 | Reviews thin, ageing, no AggregateRating; relative "N months ago" labels go stale | Partly fixed | Labels are now absolute: "around September 2026", "around January 2026", "around 2025", "May 2021" (x3), "October 2020" (/reviews/). That fixes the build-time staleness. Still 7 reviews, all 5-star, 0 `aggregateRating`/`ratingValue` on any page, no total count or average shown. Three of the labels are approximate ("around"), so velocity cannot be read from the page. No new review since early September. Whether the homepage testimonials were confirmed is not observable. |
| 3 | GBP address model and category unverified | Open (needs client) | Not observable from outside. The site still presents 243 Queen St W as a visible store-front address with "one office" copy, so the shared-office eligibility question stands. |
| 4 | Citations: nothing under current NAP | Open | Probes today: YellowPages.ca search "Evergreen Office Cleaning / Toronto ON" returned unrelated cleaners (Buzu, True North Solution, Blue Sky and others); none with 416-803-4880 or 243 Queen St W. BBB search: "No Results Found". Yelp: 403. Canada411: 302 redirect, no data. Bing query on the phone number plus name: only unrelated "416" results. Absence in a name search is not proof of no listing, but nothing was found. |
| 5 | Service-area cities without pages; footer Richmond Hill/Scarborough linked to the hub; `areaServed` omits Scarborough/North York/East York/York | Partly fixed | Pages now exist and return 200: north-york (1,131 words), scarborough (1,081), richmond-hill (998), durham-region (1,005, covers Pickering, Ajax, Oshawa). Footer and nav link each directly to its page. Hub lists all 11. However the entity-level `areaServed` in the home JSON-LD is unchanged: 10 City entries (Toronto, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax, Oshawa), still no North York, Scarborough, East York or York. East York and York still have no page. |
| 6 | No local proof on location pages | Open | Site-wide: "case stud" 0 hits, "BOMA" 0, "Better Business" 0. The new pages follow the same descriptive-only pattern (districts, drive times, building types). No named client, building, or approved reference on any of the 11. |
| 7 | Credential proof stated, not shown | Open | "certificate of insurance" 0 hits; no "available on request" line anywhere; "clearance" appears only in advice text telling buyers to ask for it. No insurer, no WSIB link, no BSCAI/ISSA/chamber mention. |
| 8 | Legacy name on Facebook/LinkedIn `sameAs`; trailing period in "243 Queen St W." | Partly fixed | Period fixed: footer on every page now reads "243 Queen St W / Toronto, ON M5V 1Z4"; contact page body "243 Queen St W, Toronto, ON M5V 1Z4"; JSON-LD `streetAddress` "243 Queen St W"; llms.txt "243 Queen St W, Toronto, ON M5V 1Z4, Canada". Remaining "W." hits are sentence-ending periods in prose (about-us, contact meta description), which is harmless. Social slugs unchanged: `facebook.com/Evergreen-Cleaning-Service-104007224426820` and `linkedin.com/company/evergreen-cleaning-service-toronto/` appear in the footer of every page and in `sameAs`. |
| 9 | Schema refinements (keep ProfessionalService; add area entities) | Partly fixed | Still a single valid `ProfessionalService` with `@id`, geo 43.65019/-79.38856, `hasMap`, `openingHoursSpecification`, telephone. The 4 new pages each have `Service` (provider by `@id`), `WebPage`, `BreadcrumbList`, `FAQPage`. No per-city sameAs/Wikidata, no districts added. Durham Region is typed as `City` (see N3). |
| 10 | Local links and authority | Open | No BIA, chamber, BSCAI, ISSA or BOMA mention in any page. External action only. |
| 11 | Hub thin, text only, no map; nav lacked Richmond Hill/Scarborough | Partly fixed | Hub grew from 229 to 367 words and is now a card list of all 11 pages with one-line descriptions. Nav "Service Areas" and footer both list all 11. Still no map and no grouping by region. The intro still says "the rest are covered in exactly the same way", which is now only true for East York, York, Whitby and similar. |
| 12 | Facts to check with the client | Open | None can be confirmed from the site. See section 3. |

Items from the first audit's "What works" re-checked and still true: phone `(416) 803-4880` is the only visible format in the footer of all 89 pages and `tel:+14168034880` is the only tel link; hours match footer, JSON-LD and llms.txt; postal code M5V 1Z4 identical everywhere; geo at 5 decimals.

## 2. New findings

### N1. Location pages: 11, still not doorway pages (Info, positive)
6-word shingle test of each page's body text (header, nav, footer, scripts removed) against the union of the other 10 location pages: unique text is Mississauga 69%, Vaughan 67%, Downtown 66%, Richmond Hill 66%, North York 65%, Scarborough 65%, Durham 64%, Brampton 61%, Oakville 61%, Etobicoke 59%, Markham 59%. The new pages (65, 65, 66, 64%) are in line with the original seven and each carries its own corridors and districts (North York Centre, Highway 401/404, Steeles and Finch; Progress and Milliken; Beaver Creek and Headford; the Highway 401 corridor). The comparison is stricter than the first audit's because it uses ten siblings, so the percentages are not directly comparable to the earlier 64-79% figures. Each states the office is in Toronto (Durham FAQ: "No. Crews come to Durham Region from our one office"). This passes the swap test. No action; the weak point is proof (finding 6 above), not uniqueness.

### N2. llms.txt "Service areas" section is stale (Medium)
Evidence: raw/llms.txt "Service areas" still lists only the original 7 pages (Downtown, Etobicoke, Mississauga, Brampton, Oakville, Vaughan, Markham). North York, Scarborough, Richmond Hill and Durham Region pages are absent, and the guides section lacks /office-cleaning-checklist/. The "Areas served" line still nests North York and Scarborough under Toronto.
Recommendation: regenerate llms.txt from `src/data/locations.ts` so the list cannot drift again, and add the checklist guide. This is where AI assistants read the service-area structure.

### N3. Entity areaServed and Durham typing do not match the 11 pages (Medium)
Evidence: home JSON-LD `areaServed` has 10 `City` entries and omits North York and Scarborough, which now have their own pages. /locations/durham-region/ `Service.areaServed` is `{"@type":"City","name":"Durham Region"}`; Durham Region is a regional municipality, not a city.
Recommendation: in `src/lib/schema.ts` add North York and Scarborough (and East York, York) to the organisation `areaServed`, and type Durham as `AdministrativeArea` (or list Pickering, Ajax and Oshawa as three `City` entries). Optionally add `sameAs` Wikidata URLs for each place.

### N4. Hub copy and the coverage promise (Low)
Evidence: /locations/ still says "The areas below have a page with local detail; the rest are covered in exactly the same way." The FAQ on the Durham page says Whitby is "not listed as a service area on its own", while the same text offers to schedule it if on the route. These two statements are consistent but the hub reads as if everything outside the 11 is fully covered.
Recommendation: in `src/pages/locations/index.astro` name the unpaged places (East York, York, Whitby, Newmarket, Aurora, Burlington, Milton) as "ask us" rather than "covered in exactly the same way", or decide and state a boundary. Also add a region grouping (Toronto, Peel, York, Halton, Durham).

### N5. Review dates are now vague rather than wrong (Low)
Evidence: /reviews/ shows "around September 2026", "around January 2026", "around 2025". The first audit could read exact-ish ages; now the 2025 item gives no month. The labels avoid staleness but also hide velocity from users and from this audit.
Recommendation: store the real month for each review in `src/data/reviews.ts` (Google shows the relative age only, so take the month from the client's GBP dashboard) and render "Month YYYY". Avoid "around" unless truly unknown.

### N6. Contact and quote friction persists (Medium)
Evidence: /contact-us/ form has required street address, city and province fields for a B2B enquiry; the page offers no map, hours or access notes. This is the page Google associates with the NAP.
Recommendation: make the address block optional in `src/pages/contact-us.astro`; add hours, a "find us" paragraph and a map text link (or embed once the client confirms customers visit).

### N7. Brand-name entity split remains in social profiles (Medium)
Evidence: 178 occurrences across the crawl (footer on every page) link to Facebook/LinkedIn URLs carrying "Evergreen-Cleaning-Service". Anyone landing there sees the legacy name against a site now branded "Evergreen Office Cleaning".
Recommendation: rename the Facebook page and LinkedIn company, then update the slugs in `sameAs` (`src/lib/schema.ts`) and footer. Owner action.

## 3. What still needs the client or an account owner
- Google Business Profile: confirm the primary category (Janitorial service), secondary categories, services list, photos, posts and Q&A; confirm the "Floor 1, Green Offices Toronto Inc." line and whether the space is shared or customers visit (decides whether the address stays visible); confirm service-area list matches the 11 pages plus Pickering/Ajax/Oshawa.
- Read the true GBP review count and average rating; supply the month of each review; keep a steady review cadence (newest visible is about September 2026).
- Confirm whether the homepage testimonials are genuine and permitted.
- Create or claim directory listings with the exact NAP (Bing Places, Apple Business Connect, YellowPages.ca, Canada411, Yelp, HomeStars, BBB, Foursquare) after searching for old "Evergreen Cleaning" listings on 416-803-4880.
- Rename the Facebook page and LinkedIn company (and fix LinkedIn industry), then send the new slugs so `sameAs` can be updated.
- Provide approved local references (one per city where possible), certificate of insurance and WSIB clearance for publication or "on request" wording, and any trade or chamber memberships.
- Link-building outreach: BIA for 243 Queen St W, BSCAI/ISSA directories, boards of trade, property-manager vendor pages.
- Search Console access for impressions by city to judge whether East York, York or Whitby deserve pages.

## 4. Not verified
- GBP anything: category, address visibility, rating, count, response rate, photos, posts, suspension risk.
- Whether Yelp, HomeStars, Facebook, LinkedIn, Apple, Bing Places, Canada411 or Foursquare hold listings. Yelp returned 403, Canada411 redirected, others not probed. Bing's exact-phone query returned nothing relevant, but that is a weak probe.
- YellowPages and BBB were name searches only; absence from results is not proof of no listing.
- Local-pack rankings, geo-grid, competitor review benchmarks, inbound links.
- Crawl HTML was saved as Latin-1, so mojibake in text (for example in the review stars and dashes) is a crawler artefact, not a site defect.
- Rendering after JavaScript: map embeds injected client-side would not appear in the raw HTML; the first audit found none either, and the pages ship no map script.

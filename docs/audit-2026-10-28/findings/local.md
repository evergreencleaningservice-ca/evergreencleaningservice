# Local SEO findings: Evergreen Office Cleaning (evergreencleaningservice.ca)
Date: 2026-10-28. Business type: service-area business (SAB) with one staffed-address pin; vertical: commercial cleaning / janitorial (home-services-adjacent B2B).
Method: curl of live pages, Playwright on Google Maps "limited view" (not personalised, no Toronto IP), Bing snippets. No DataForSEO/GBP API. Anything not run is marked "not run".
Raw files: /tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/local/

## 1. GBP snapshot (Google Maps cid 15602716773318351983; feature id 0x89d4cdd99a1a51fb:0xd887fc3d14ab5c6f)
Review link on site: https://g.page/r/CW9cqxQ9_IfYEBM/review (resolves to this same place, so site and GBP are linked correctly).
| Field | Observed |
|---|---|
| Name as listed | Evergreen Office Cleaning (matches site; old name "Evergreen Cleaning Service" survives only in old reviews/directories) |
| Primary category | Janitorial service. Secondary categories: not visible from here |
| Rating / count | 5.0 / 10 reviews |
| Address | 243 Queen St W, Toronto, ON M5V 1Z4 with line "Floor 1 - Green Offices Toronto Inc." (shared/serviced-office address; site schema and footer omit suite/floor). Plus Code MJ26+3H |
| Pin | Plus Code decodes to about 43.65019, -79.38856 |
| Phone | +1 416-803-4880 (matches site) |
| Website link | evergreencleaningservice.ca (no UTM/landing page detected) |
| Hours | Shows "Opens 7 AM" (Wed), consistent with site Mon-Fri 7am-10pm; full weekly table not captured |
| Photos | "2 Photos" only (one is Street View-style storefront of Gianni's Gelato at 243). Very thin |
| Posts / "From the owner" | None visible (competitor Evergreen Cleaning Services shows an owner post dated May 7 2026; this profile shows none) |
| Q&A, attributes, products/services, service area | Not visible from here (limited view) |
| Review topics chips | "regular maintenance" (2), "recommendation" (2) |
| Owner responses | One visible: reply to Michael Katchen (5 years ago), generic. 0 of the 2 recent reviews answered |

## 2. NAP consistency
| Source | Name | Address | Phone | URL | Match? |
|---|---|---|---|---|---|
| Site footer / reviews page (curl) | Evergreen Office Cleaning | 243 Queen St W., Toronto, ON M5V 1Z4 | (416) 803-4880 | site | Baseline (stray period after "W") |
| Site JSON-LD CleaningService | Evergreen Office Cleaning | 243 Queen St W., Toronto ON M5V 1Z4 | +1-416-803-4880 | site | Yes |
| Google Business Profile | Evergreen Office Cleaning | 243 Queen St W ... Floor 1 - Green Offices Toronto Inc. | +1 416-803-4880 | evergreencleaningservice.ca | Yes, except floor/suite line absent on site |
| canada.chamberofcommerce.com/business-directory/ontario/toronto/commercial-cleaning-service/895150-evergreen-cleaning-service (Bing snippet only) | Evergreen Cleaning Service (OLD name) | 243 Queen St W, Toronto ON M5V 1Z4 | 416-803... (truncated) | not seen | Name mismatch |
| findglocal.com/CA/Toronto/104007224426820/Evergreen-Office-Cleaning (Bing snippet) | Evergreen Office Cleaning | 243 Queen Street W | not seen | not seen | Likely OK; derived from Facebook page 104007224426820 |
| mapquest.com/ca/ontario/evergreen-cleaning-service-454587596 (Bing snippet) | Evergreen Cleaning Service (OLD) | 130 Broadlands Blvd, Toronto M3A ... (OLD ADDRESS) | not seen | not seen | MISMATCH (name and address) |
| fyple.ca/company/evergreen-cleaning-service-616ewnk/ (snippet) | Evergreen Cleaning Service (OLD) | Toronto | not seen | not seen | Name mismatch; copy says "since 1990" vs site "since 1989" |
| whatsyourhours.com ... cleaners (snippet) | Evergreen Cleaning Service (OLD) | Toronto | (416)... | not seen | Name mismatch |
| canadianbusinessdirectory.ca/file1353875.htm (snippet) | Evergreen Cleaning Service (OLD) | not seen | not seen | not seen | Name mismatch |
| Facebook (Bing result title) | Evergreen Office Cleaning (page slug still "Evergreen-Cleaning-Service-104007224426820") | not seen | not seen | not seen | Name updated; slug old. Page itself is login-walled, not verified |
| LinkedIn (company slug evergreen-cleaning-service-toronto) | slug old | not run | not run | not run | Fetch returned 200 but page not parsed. Not run |
| Twitter/X (sameAs) | @EvergreenClean8 | not run | not run | not run | Not run |
| Yelp, HomeStars | not run (HTTP 403 to curl) | | | | Presence unknown |
| YellowPages.ca, Canada411/411.ca | not run (HTTP 202 bot challenge) | | | | Presence unknown |
| Cylex | not run (403) | | | | Presence unknown |
| BBB, Houzz, Instagram, Bing Places, Apple Maps | not run / not found in search results | | | | Presence unknown. No Houzz or Instagram link on the site |

Name collision: a separate Google profile "Evergreen Cleaning Services" (plural; 5.0, 15 reviews; phone 647-831-2284; site evergreencleaningservices.org; category Cleaners; pin 43.7294,-79.5025; residential/office, active owner posts and replies) shows next to ours when the old name is searched. Different entity; risk is review/phone mix-ups and branded-search confusion.

Key flag: the "since 1989" claim on site vs "since 1990" on directories; old name present on multiple aggregators; old address (130 Broadlands Blvd) on MapQuest.

## 3. Review comparison (Google Maps, seen today)
| Profile | Rating | Reviews | Address (as listed) |
|---|---|---|---|
| Evergreen Office Cleaning | 5.0 | 10 | 243 Queen St W (Floor 1, Green Offices Toronto Inc.) |
| JAN-PRO (Toronto East) | 4.8 | 366 | 1050 McNicoll Ave #1 |
| JAN-PRO Commercial Cleaning Services Toronto (Toronto West) | 4.9 | 211 | 2295 Dunwin Dr #1 (Mississauga) |
| JAN-PRO Commercial Cleaning Services Durham Region | 5.0 | 209 | 31 Barr Rd Unit 7 |
| JAN-PRO (Hamilton/Halton/Niagara, outside GTA core) | 4.8 | 81 | 16 Community Ave Unit 2 |
JAN-PRO GTA core (3 profiles): 786 reviews, weighted rating about 4.88. Evergreen has 1.3 percent of that volume. JAN-PRO has 3 GBP profiles for GTA coverage; Evergreen has 1.
Evergreen review recency: latest "a month ago" (Local Guide, 38 reviews), then "a year ago", then "5 years ago". Of the 4 homepage Trustindex quotes, dates 2021-2022 ("5-6 years ago"); the homepage widget shows no rating or count. Reviews visible from here: 3 of 10 (limited view). Response rate: 1 of 3 seen answered (generic, 5 years ago). Review velocity estimate: roughly 2 reviews in the last 12 months visible. Keywords in reviews: office, regular maintenance, one-off services, deep clean, property management; no neighbourhood or city keywords.
JAN-PRO site shows "4.8 average quality rating", "700+ Toronto clients" and 2 named testimonials on its Toronto West page.

## 4. On-site local signals (live curl)
- Homepage title "Office & Commercial Cleaning in Toronto & GTA | Evergreen". Header phone (416) 803-4880 click-to-call (tel:+14168034880), email info@evergreencleaningservice.ca.
- Footer on all pages: Evergreen Office Cleaning, 243 Queen St W., Toronto, ON M5V 1Z4, phone, email, hours "Mon-Fri 7am-10pm, weekends 8am-8pm". NAP consistent with schema and GBP.
- Schema (homepage JSON-LD @graph): type CleaningService (correct subtype), @id #organization, name, url, logo, image, telephone, email, priceRange, full PostalAddress, geo 43.6503,-79.3892 (only 4 decimals; recommended 5), openingHoursSpecification (Mon-Fri 07:00-22:00, Sat-Sun 08:00-20:00), areaServed list of 10 City objects, hasOfferCatalog (4 services), sameAs = Facebook, Twitter, LinkedIn. Missing: GBP/Maps URL (hasMap), Instagram/Yelp/HomeStars/BBB in sameAs, aggregateRating (intentionally omitted; correct while on-page ratings are not shown), foundingDate (1989), contact page url, address suite.
- Geo check: GBP pin (Plus Code MJ26+3H) is about 43.65019, -79.38856. Schema geo is about 53 m from it. The intake doc's alternative "43.6496, -79.3925" is about 324 m from the GBP pin and 277 m from the schema geo, so it is worse. Recommendation: set schema geo to GBP pin 43.65019, -79.38856. Check the pin in GBP itself against the storefront (Maps shows it at the 243 Queen St W storefront).
- Embedded map: none on homepage (no Google Maps iframe). Location-page map embeds were deliberately removed (docs/growth/adaptation-matrix.md). JAN-PRO Toronto West uses a Maps embed.
- Location pages: /locations/ hub and 7 city pages linked (downtown Toronto, Etobicoke, Mississauga, Brampton, Oakville, Vaughan, Markham). Not fetched, so uniqueness percentage and swap test: not run. Repo notes say they contain "where crews come from", services, nearby areas, FAQ, quote form. Gaps vs areaServed: no pages for Richmond Hill, Pickering, Ajax, Oshawa, North York, Scarborough (homepage lists them under "Where we work").
- /reviews/ (200): titled "Testimonials". It is a submission form only; it shows no reviews, no rating, no Google review link in body (footer has "Review us on Google" linking g.page/r/CW9cqxQ9_IfYEBM/review). Homepage has "Share a review on Google" link plus the Trustindex slider with 4 reviews dated 2021-2022 and 3 homepage testimonials from the old site.
- /contact/ returns 404 on this host; the real contact URL is /contact-us/ (linked in nav). /contact-us/ content: not run.
- No visible street-level proof of the office on site; the address is a shared serviced office (Green Offices Toronto Inc., Floor 1), so "our base at 243 Queen St W." is a claim that GBP guidelines may treat as non-staffed. Risk of suspension if inspected; verify the client has a staffed, signed premises or hide the address as an SAB.
- Hybrid/SAB status: site publishes the address and a 10-city area; GBP shows the address. For a SAB with a shared office, GBP service-area settings are not visible from here.

## 5. Local pack observations (Google Maps search, limited view, not Toronto-personalised, desktop, viewport centred on downtown Toronto 43.6532,-79.3832 z12; Mississauga query centred on 43.589,-79.644)
Evergreen did NOT appear in the first 6-8 results of any of the four queries. Counts shown are what Maps returned today.
- "office cleaning toronto": Toronto Office Cleaning Services 5.0 (29); Commercial office Cleaning Service (no reviews, 181 Bay St); Toronto Commercial Cleaning Service 5.0 (3); Toronto Office Cleaning Pros 5.0 (13); Dust 'Til Dawn Commercial Cleaning Services 5.0 (85); Toronto Shine Cleaning 4.8 (432); Great Commercial Cleaners 5.0 (110); Office Cleaning Services Toronto 5.0 (7).
- "commercial cleaning toronto": Toronto Commercial Cleaning Service 5.0 (3); Great Commercial Cleaners 5.0 (110); Dust 'Til Dawn 5.0 (85); Cleaning Bees Commercial Cleaning Services 5.0 (32); Commercial office Cleaning Service; Toronto Office Cleaning Services 5.0 (29); Focus Cleaning 4.8 (27); itsGLO Cleaning 4.9 (773).
- "janitorial services toronto": WhiteRose Janitorial Services 4.8 (595); Toronto Commercial Cleaning Service; Prime Cleaning 5.0 (14); Royal House Cleaning Toronto Midtown 5.0 (39); Stay Clean Solutions 5.0 (26); Cleaning Services for Toronto 5.0 (8); Clean Papi Toronto 4.9 (47); itsGLO 4.9 (773).
- "office cleaning mississauga" (Mississauga-centred): Squeaky Cleaning Mississauga 4.7 (124); Hellamaid 4.7 (134); Spotless House Cleaning Mississauga 5.0 (40); Arelli 4.4 (22); Longividade Cleaning 4.9 (201); Grandmother's Touch Commercial Cleaning Mississauga 4.4 (37). Toronto-centred run showed mostly residential names (Merry Maids, JEM, Go Clean Plus).
Observations: many pack entrants are keyword-in-name profiles (e.g. "Toronto Office Cleaning Services") with 3-110 reviews, so Evergreen's 10 reviews is not the main gap; JAN-PRO does not surface for generic queries in the first 8, but dominates branded "JAN-PRO" queries with 3 profiles. Evergreen's category (Janitorial service) is correct for the janitorial query, while many top office-cleaning listings use "Cleaners" or house-cleaning categories. Organic SERP and AI-overview results: not run (Bing returned irrelevant results, Google SERP blocked).

## 6. Prioritised actions
Critical
1. Resolve the shared-address risk: confirm 243 Queen St W is staffed/inspectable; if not, convert GBP to SAB (hide address, set service areas) and align site footer wording ("Crews dispatched from Toronto").
2. Start a review programme: only 10 Google reviews vs 786 for JAN-PRO GTA. Target 4-6 per month for 12 months (60+ reviews): QR/short-link (g.page/r/CW9cqxQ9_IfYEBM/review) in post-service emails and monthly account check-ins from the account executive; ask for service + area keywords naturally. Reply to every review within 48 h, including the two newest.
3. Fix citation name/address on aggregators (chamberofcommerce, fyple, whatsyourhours, canadianbusinessdirectory, MapQuest 130 Broadlands Blvd) to "Evergreen Office Cleaning, 243 Queen St W (or SAB), (416) 803-4880, evergreencleaningservice.ca" and set one founded date (1989 or 1990, whichever is true).
High
4. Build out GBP: add 25+ photos (crew, equipment, before/after, vehicles, buildings with permission), weekly Posts, services list with descriptions, Q&A seeded, attributes, secondary categories (e.g. Commercial cleaning service/Office cleaning service if offered), appointment/quote link with UTM, and confirm hours (phone vs service).
5. Claim and complete Yelp, HomeStars, BBB, YellowPages.ca, Canada411, Cylex, Bing Places, Apple Business Connect (presence not verified; Yelp/HomeStars/YP blocked from here). Add Facebook/LinkedIn/X and new ones to sameAs; also add the GBP Maps URL as hasMap.
6. Schema: set geo to 5 decimals matching the GBP pin (43.65019, -79.38856); add foundingDate, hasMap, address suite if kept, and sameAs.
Medium
7. Service-area page strategy: 7 city pages exist; add Richmond Hill, Pickering/Ajax/Oshawa (Durham), North York, Scarborough, and combine "office cleaning [city]" and "janitorial [city]" targets with unique local proof (real client types, building names with permission, local review quotes, truthful "no local office" note). Check the swap test on existing pages (not run).
8. Replace the /reviews/ submission form with a real reviews page (Google rating/count shown live if the client approves, recent dated reviews, a prominent Google review link); refresh the 2021-2022 homepage quotes with 2025-2026 reviews. Add aggregateRating only if the rating is displayed and derived from on-page reviews.
9. Add an embedded Google Map or directions block on /contact-us/ (even for SAB, show "head office"), and make /contact/ redirect to /contact-us/ if linked anywhere.
Low
10. Monitor name collision with "Evergreen Cleaning Services" (647-831-2284, evergreencleaningservices.org); use "Evergreen Office Cleaning" consistently and add differentiators (since 1989, WSIB) to GBP description. Local links: pursue Toronto BIAs, building-management associations, BOMA Toronto and supplier/partner mentions (not run).

## 7. Local SEO score: 46 / 100
| Dimension | Weight | Score | Reasoning |
|---|---|---|---|
| GBP signals | 25 | 12 | Verified-looking profile, right primary category, site/phone/hours present; only 2 photos, no posts, shared-office address, one profile for a 10-city market, absent from all 4 pack samples |
| Reviews & reputation | 20 | 7 | Perfect 5.0 but only 10 reviews; thin velocity (about 2 in a year), old homepage widget, 1 generic owner reply; JAN-PRO 786 across 3 GTA profiles |
| Local on-page SEO | 20 | 11 | NAP footer, tel link, 7 city pages, areaServed copy; /reviews/ is a form, no map, 4 service-area cities have no page, location page uniqueness not run |
| NAP consistency & citations | 15 | 6 | Core NAP matches GBP/site; old name on 4+ aggregators, old Broadlands Blvd address on MapQuest, 1989 vs 1990; Tier 1 directory presence unverified (Yelp, HomeStars, YP, BBB, Cylex blocked/not run) |
| Local schema | 10 | 7 | Correct CleaningService subtype, address/phone/hours/areaServed/sameAs; geo only 4 decimals and 53 m off the GBP pin; no hasMap/foundingDate |
| Local links & authority | 10 | 3 | Not run (no backlink data); estimated low |
Proximity note: pack rank depends heavily on searcher distance to the pin (outside our control); Toronto-personalised results not seen.

## 8. Limitations
No GBP dashboard (secondary categories, Q&A, insights, service area, post history not visible); Google Maps limited view showed only 3 of 10 reviews; pack results not personalised; Yelp/HomeStars/YellowPages/Canada411/Cylex blocked (403/202); Facebook login-walled; LinkedIn, BBB, Houzz, Instagram, Bing Places, Apple Maps not checked; third-party directory data comes from Bing snippets and not page fetches; location-page content and /contact-us/ not fetched; backlinks and organic SERPs not assessed; no DataForSEO.

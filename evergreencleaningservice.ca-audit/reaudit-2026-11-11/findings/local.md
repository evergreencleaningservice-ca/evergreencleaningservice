Score: 64/100
Previous: 61/100 (re-audit 7 Nov)

Local SEO audit of https://www.evergreencleaningservice.ca/ (2026-11-12). Business type: hybrid (one office at 243 Queen St W, 11 location pages). Vertical: commercial/office cleaning. Sources: raw/crawl (94 URLs, local pages all 200), raw/llms.txt, 3 citation probes. No GBP access, no DataForSEO, no local-pack data.

| Dimension | Weight | Now | Was | Note |
|---|---|---|---|---|
| GBP signals | 25 | 14 | 14 | Unchanged: 0 of 94 pages contain `maps/embed`; `hasMap` and `sameAs` still carry the `maps.google.com/?cid=` link. Category, photos, posts unverifiable |
| Reviews and reputation | 20 | 9 | 9 | Same 7 reviews, newest "around September 2026", no aggregateRating, no count or average |
| Local on-page | 20 | 17 | 16 | Neutral review framing, hub now names unpaged places as "ask us", metadata lengths fixed; still no local proof or map; contact page thin |
| NAP and citations | 15 | 10 | 10 | NAP consistent; citations still not found; social slugs still legacy |
| Local schema | 10 | 10 | 8 | Entity and page `areaServed` now identical to coverage (15 entries incl. North York, Scarborough, East York, York); Durham typed via `containedInPlace` |
| Local links and authority | 10 | 4 | 4 | No change |
| Total | 100 | 64 | 61 | |

Proximity (about 55% of ranking variance, Search Atlas study) is outside the site's control. Scarborough, Richmond Hill, Brampton and Durham are far from a Queen St W office.

## 1. Status of every re-audit finding

| # | Re-audit finding | Status | Evidence now |
|---|---|---|---|
| 1 | No Maps embed; contact page thin; required address fields in the form | Open | `maps/embed` count 0 across 94 pages. /contact-us/ is 149 words: name, "Formerly Evergreen Cleaning Service", address, phone, email, then form with "Address *, Address Line 1 *, City *, State / Province / Region *, Postal Code *". No hours or directions. |
| 2 | Reviews thin, no AggregateRating | Open | /reviews/ still 7 items (Sept 2026, Jan 2026, "around 2025", May 2021 x3, Oct 2020). `aggregateRating` 0 pages. Home sameAs/hasMap use the CID link only. |
| 3 | GBP address model and category unverified | Open (needs client) | Not observable. Site still shows 243 Queen St W with "one office" copy. |
| 4 | Citations absent under current NAP | Open | Probes 12 Nov: BBB search "Evergreen Office Cleaning / Toronto, ON" returned "No Results Found" (the 4 name hits are the echoed query). YellowPages.ca and Canada411 returned 403 to curl. Nothing found. Weak probe, not proof. |
| 5 | areaServed omits Scarborough/North York/East York/York; pages missing | Fixed | Home, /locations/north-york/, /toronto-downtown/ and /durham-region/ JSON-LD entity `areaServed` is 15 City entries: Toronto, North York, Scarborough, Etobicoke, East York, York, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax, Oshawa. Matches llms.txt and hub text. |
| 6 | No local proof on location pages | Open | Site-wide: "case stud" 0, "BOMA" 0, "Better Business" 0 pages. |
| 7 | Credential proof stated, not shown | Open | "certificate of insurance" 0 pages; llms.txt still says "bonded, liability insurance, WSIB Ontario" without evidence. |
| 8 | Legacy name on Facebook/LinkedIn sameAs | Open | Footer URLs unchanged on every page: 188 hits each of `facebook.com/Evergreen-Cleaning-Service-104007224426820` and `linkedin.com/company/evergreen-cleaning-service-toronto/`. Street address clean: 201 "243 Queen St W" variants, no trailing-period form in the footer. |
| 9 | Schema refinements | Partly fixed | Single ProfessionalService, geo 43.65019/-79.38856, hasMap, hours, telephone "+1-416-803-4880" intact. Durham Service `areaServed` is now Pickering, Ajax, Oshawa as City with `containedInPlace` AdministrativeArea "Durham Region" (the prior "Durham as City" defect is gone). Still no per-place sameAs/Wikidata. |
| 10 | Local links and authority | Open | No BIA/chamber/BSCAI/ISSA mention. External action. |
| 11 | Hub thin, no map, no grouping | Partly fixed | /locations/ is 402 words (was 367) with region labels (e.g. "Peel & Halton") and the "ask us" wording. No map. |
| N1 | Location pages unique (Info) | Still true | Re-ran 6-word shingle test, each page vs. the other 10: North York 67%, Downtown 68, Scarborough 68, Mississauga 73, Brampton 60, Vaughan 68, Oakville 59, Etobicoke 58, Durham 64, Richmond Hill 65, Markham 58. Word counts 869-1,225. Passes swap test. |
| N2 | llms.txt stale | Fixed | Service areas lists all 11 pages plus hub, Downtown "also covers East York and York", and the guides section lists the checklist and the new quote-checklist. |
| N3 | Entity areaServed and Durham typing | Fixed | See #5 and #9. |
| N4 | Hub "covered in exactly the same way" | Fixed | /locations/ now reads "Somewhere not listed, such as Whitby, Newmarket, Aurora, Burlington or Milton? Ask us ... we will tell you plainly whether we can schedule your building", and explains East York and York sit on the downtown page. |
| N5 | Vague review dates | Open | Still "around September 2026", "around 2025". |
| N6 | Contact/quote friction | Open | As #1. |
| N7 | Brand-name split in social profiles | Open | As #8. |

## 2. New findings

### L1. Time-limited proof is aging (Medium)
Newest visible review is "around September 2026", about 2 months before this audit; 3 of 7 are 2020-2021 and are labelled "Google review". With no rating, count or velocity visible, the page cannot show a steady cadence. Recommendation: set up a review request routine after each contract start; show the real GBP rating and count and add `aggregateRating` in `src/lib/schema.ts` only once it matches the live GBP numbers.

### L2. East York and York typed as City with no page (Low)
They are named in schema and on the downtown page (plain text) but are former municipalities now part of the City of Toronto. Typing them `City` alongside Toronto is slightly off. Recommendation: in `src/data/coverage.ts` / `src/lib/schema.ts` type them `Place`/`AdministrativeArea` with `containedInPlace` Toronto, as already done for Durham. Cosmetic.

### L3. Coverage claim vs proximity (Low)
Durham (Oshawa) and Richmond Hill pages are reasonable ("crews come from our one office"), and the Durham FAQ no longer claims local operations. No fix needed; keep the line, and confirm with the client that Oshawa is actually serviced regularly.

### L4. Shared "x.com" profile in sameAs (Info)
`sameAs` includes `https://x.com/EvergreenClean8`, a legacy handle. Confirm it is active and still branded correctly; remove if abandoned.

### L5. No regressions found in local signals from the 7-11 Nov changes (Info)
The new janitorial-services and quote-checklist pages carry the same footer NAP (phone `(416) 803-4880` 592 times, `416-803-4880` 201 times in links/text; no other number found in the crawl). The "2-hour reply" qualifier with office hours matches llms.txt and the contact page.

## 3. What still needs the client or an account owner
- GBP: confirm primary category (Janitorial service) and secondaries, services, photos, posts, Q&A; confirm the "Floor 1, Green Offices Toronto Inc." line, whether the premises are shared or customer-facing (decides whether the address stays visible) and that the service-area list equals the 11 pages plus Pickering/Ajax/Oshawa.
- Read the true GBP rating, count and response rate; supply exact months for the "around" reviews; start a review-request routine.
- Confirm homepage testimonials are genuine and permitted.
- Create/claim listings with exact NAP: Bing Places, Apple Business Connect, YellowPages.ca, Canada411, Yelp, HomeStars, BBB, Foursquare, after searching for old "Evergreen Cleaning" listings on 416-803-4880.
- Rename the Facebook page and LinkedIn company (and confirm the X handle), then supply new slugs for `sameAs` and the footer.
- Provide approved local references, certificate of insurance and WSIB clearance for "available on request" wording; trade or chamber memberships.
- Outreach for BIA, BSCAI/ISSA, boards of trade, property-manager vendor pages.
- Search Console access (impressions by city) to judge whether East York, York or Whitby merit pages.

## 4. Not verified
- Anything in GBP: category, address visibility, rating, count, responses, photos, posts, suspension risk.
- Listings on Yelp, HomeStars, Facebook, LinkedIn, Apple, Bing Places, Canada411, Foursquare; YellowPages and Canada411 gave 403, BBB was a name search only.
- Local-pack rankings, geo-grid, competitor benchmarks, inbound links.
- Client-side map embeds: raw HTML only, no map script shipped, so none expected.
- Crawl HTML was saved as Latin-1; mojibake is a crawler artefact.

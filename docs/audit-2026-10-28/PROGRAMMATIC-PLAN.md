# Programmatic location pages for Evergreen Office Cleaning — plan and evidence

Date: 2026-10-28. Method: claude-seo `seo-programmatic` skill (v2.5.0), run by hand because the plugin's Python scripts refuse the local proxy. Pages were fetched with `curl -sL -A "Mozilla/5.0 (compatible; seo-audit)"` and parsed with `python3 -I` scripts kept outside the raw folder. Nothing in the repo was changed.

Raw HTML and parsed outputs: `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/programmatic/` (JAN-PRO pages, 4 page sitemaps, 7 SERP-winning competitor pages, Evergreen's 7 live location pages, `analysis-*.json`, `analysis-janpro-hublinks.txt`). Scripts: `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/scripts/analyze_pages.py` and `hublinks.py`.

---

## 1. Verdict

**Build city pages, not service × city pages, and not industry × city pages — but only behind a data gate, and fix the seven that already exist first.**

- The 15 Oct decision ("no, for lack of local evidence") was right about the *pages that would have been built* and wrong about the *conclusion*. The three SERPs the client wants are won almost entirely by dedicated city pages (26 of 27 organic results), so "same intent as the location and service pages" does not hold: the city page *is* the ranking unit for "{service} {city}". The lack of local evidence is a data-collection task with a known owner (client intake C5, B3), not a reason to stay out of the SERP.
- Evergreen's **seven live location pages measure 4–27 % unique body text** against each other (city-name-normalised; §3.3). By the skill's own gate (<40 % = thin, <30 % = hard stop) the current set already fails. Adding more pages on the same template would add index bloat, not rankings. Raising the seven is step one.
- "Office cleaning {city}", "commercial cleaning {city}" and "janitorial services {city}" are one SERP cluster. Winners rank one city page for all three (CMG Clean's Vaughan page carries H3s "Office Cleaning Vaughan", "Janitorial Services Vaughan"; RBC's Markham page is titled "Janitorial Services & Office Cleaning in Markham"). Only one winner used a nested service × city URL (SKYREX `/locations/mississauga/office-cleaning/`, position 9) and it ranked *below* six plain city pages. So service × city is a second-year, evidence-triggered split, not the first build.
- Industry × city: no. Two industries have a GTA-level page and only because the evidence carried them; the client has not supplied a single city-attributed clinic or condo client. The one defensible future candidate is medical/dental × Markham or Mississauga, and only when a named or anonymised local clinic client exists.

**Recommended page count:** 7 existing city pages brought up to the gate → +3 new city pages (North York, Scarborough, Richmond Hill) in two batches once intake C5 data lands → at most 4 service × city children in year two, each individually triggered by Search Console data. **Ceiling: 14 indexable location URLs in 12 months.** Pickering, Ajax, Oshawa, East York and York stay as hub sections.

### Programmatic SEO score (current location set): 48/100

| Category | Status | Score | Why |
|---|---|---|---|
| Data quality | ⚠️ | 40 | `locations.ts` carries only `focus`, `facilities`, `landmarks`, `description`; 3 of 7 entries are `needsClientReview`; no travel, proof, local FAQ or verification date fields |
| Template uniqueness | ❌ | 20 | 4–27 % unique; 12–25 % of words are "mad-libs" (identical sentence, city swapped) |
| URL structure | ✅ | 90 | `/locations/<slug>/`, trailing slash, hub page, HTML breadcrumbs |
| Internal linking | ⚠️ | 60 | hub → all spokes ✓; spoke → all six siblings (not nearest); service pages list all 15 areas regardless of relevance; no `BreadcrumbList` JSON-LD on location pages |
| Thin-content risk | ❌ | 25 | 681–776 words per page vs 899–3,316 for the SERP winners; four pages are ≥95 % template |
| Index management | ✅ | 75 | noindex machinery and sitemap filter exist; all seven thin pages are nonetheless indexed and in the sitemap |

---

## 2. What JAN-PRO actually does (measured)

Scale from the four page sitemaps (`janpro-page-urls.txt`): **662 page URLs; 178 at hub level (one per franchise market), 428 at the third level, of which ~287 are sub-city places** and ~141 are service/franchising/other slugs. Max 17 sub-cities per hub; Phoenix 10, Denver 9, Atlanta 9, Chicago 10, Sacramento 1. `robots.txt` has `Crawl-delay: 10` and no disallows beyond `/wp-admin/`.

### 2.1 Unique-vs-templated text (body only, header/nav/footer removed, city names normalised before comparison)

| Page | Body words | Unique % | Mad-libs % | Body internal links | Local data injected | Schema |
|---|---|---|---|---|---|---|
| `/denver/thornton/` | 1,432 | 99.7 | 0.0 | 8 (hub with `utm_campaign=city+page`, 6 Denver blog posts) | 120th Ave corridor, Washington St, Orchard Town Center, Eastlake; "since 2005"; winter de-icing salt in lobbies; Adams County; an anonymised medical-practice case; **states the office is in Denver, not Thornton**; 6 FAQs | `FAQPage`, `LocalBusiness` + `City` |
| `/phoenix/tempe/` | 725 | 97.4 | 0.0 | 15 (hub + 13 `/who-we-clean/` pages) | Named HQs (Circle K, Amkor, Benchmark), Mill Ave, Tempe Town Lake, ASU Research Park, a small-business growth statistic | none |
| `/phoenix/scottsdale/` | 886 | 99.4 | 0.0 | 2 | industry list only; little that is Scottsdale-specific | none |
| `/phoenix/glendale/` | 11,404 | 99.5 | 0.4 | 145 (hub + the whole Phoenix blog) | "Fine desert dust / monsoon / hard water / event traffic", areas served, 11 service H3s | `FAQPage`, `CleaningService`, `OfferCatalog` |
| `/atlanta/buckhead/` | 1,334 | **42.4** | 0.4 | 18 | almost none: a 15-industry block shared verbatim with Sacramento | none |
| `/chicago/joliet/` | **349** | 96.6 | 1.7 | 11 (hub + all 10 sibling suburbs) | none beyond the name; still `index,follow` | none |
| `/sacramento/janitorial-services/` | 2,150 | 64.3 | 0.0 | 21 | the same industry block; a service-in-city page | none |
| Hubs `/atlanta/`, `/phoenix/`, `/sacramento/` | — | — | — | 103–150 | Atlanta links to 5 of its 9 sub-cities, Phoenix to 10/10, Sacramento to 1/1 | none; no breadcrumb markup anywhere |

Readings:

- JAN-PRO's sub-city pages are **not programmatic in the mad-libs sense**. Each is a separately written page (0–2 % mad-libs). What is shared is a block (the industries grid, the blog feed, the form), and where that block is the bulk of the page (Buckhead) uniqueness collapses to 42 %.
- The two pages with the most local substance (Thornton, Glendale) are the two with `FAQPage` schema, an honest "our office is in Denver" line, and links to **topical local blog posts** rather than sibling-suburb lists. The pages that link to every sibling (Joliet) are the thinnest. Hub → spoke is consistent; spoke → spoke is not, and is not what the strong pages do.
- Quality varies by franchisee, from 349 to 11,404 words, with no gate. JAN-PRO can afford that at 662 pages on a national domain. Evergreen cannot.
- Indexing (WebSearch tool, a US index, **not Google**; `site:` support is partial — `site:jan-pro.com/phoenix/` returned the hub and blog posts, `site:jan-pro.com/denver/` returned nothing from the domain): "commercial cleaning services Thornton CO" → JAN-PRO Thornton **#1**; "commercial cleaning Tempe AZ" → `/phoenix/tempe/` #6–7 behind Jani-King's and Anago's nested city pages; "JAN-PRO Glendale AZ" → `/phoenix/glendale/` #2, plus `/phoenix/scottsdale/` and `/phoenix/gilbert`. Sub-city pages are indexed and retrievable, the thin ones included.

### 2.2 What ranks for the three target queries

Source: WebSearch (extended), 2026-10-28. **These are not geo-personalised to Toronto**: the index is US-based, there is no local pack, and positions are indicative; the URL *type* of each winner is the finding.

| Query | Results that are a dedicated city page (city in path or on a city-specific domain) | Service × city nested URL among them | Generic homepage / service page |
|---|---|---|---|
| office cleaning mississauga | 9/9 — spotlessjanitorial `/office-cleaning-services-mississauga/`, mycleaningbees, pro-clean `/commercial-cleaning-service-mississauga/`, durals, smcleanmississauga.ca, dusttildawn, lowfaremaintenance `/locations/mississauga`, focuscleaning, SKYREX | 1 (SKYREX `/locations/mississauga/office-cleaning/`, #9) | 0 |
| commercial cleaning vaughan | 9/9 — impact.ca `/ontario/vaughan`, cleaningservicesvaughan.ca, vaughancleaningservices.ca, cmgclean `/commercial-cleaning-vaughan`, mycleaningbees, wecleanit `/vaughan/`, pro-clean, cleanertouch `/areas-of-service/vaughan-commercial-cleaning/`, topmax | 0 nested (two flat service-city slugs) | 0 |
| janitorial services markham | 8/9 — impact.ca `/ontario/markham`, rbcclean `/service-areas/markham-cleaning-janitorial-services/`, pro-clean, smcleanmarkham.ca, aceclean, onedayscleaning, SKYREX ×2 | 1 (SKYREX `/location/markham/commercial-cleaning/`) | 1 (swiftjanitorial.ca homepage) |

Measured winners (`analysis-serp-winners.json`): body word counts **899 (Spotless), 935 (Pro-Clean), 1,175 (Impact), 1,257 (RBC), 1,275 (CMG), 2,041 (SKYREX), 3,316 (Low Fare)**; every one carries `LocalBusiness`/`Organization` + `City`/`Place` `areaServed` schema; three carry `FAQPage`; five have an H2/H3 per service *inside* the city page. Low Fare's page is the closest to the model recommended below: H2 "Commercial Cleaning by Mississauga Business Corridor" with six corridor H3s (City Centre & Square One, Airport Corporate Centre, Meadowvale & Erin Mills, Heartland, Hurontario/Cooksville, Port Credit/Clarkson) — and it also shows where bloat starts (it then links out to "Neighbourhood cleaning pages").

Evergreen's domain did not appear in any of the three result sets, nor for a brand + "Queen Street West" query in that index.

### 2.3 Evergreen's seven live pages, same method (`analysis-evergreen-live-locations.json`)

| Page | Body words | Unique % | Mad-libs % | Note |
|---|---|---|---|---|
| `/locations/mississauga/` | 774 | 26.6 | 11.8 | client-written `detail` copy |
| `/locations/vaughan/` | 776 | 26.9 | 11.6 | client-written `detail` copy |
| `/locations/toronto-downtown/` | 698 | 19.6 | 4.4 | `needsClientReview` |
| `/locations/etobicoke/` | 681 | 4.6 | 17.8 | one sentence + 5 bullets are the only unique text |
| `/locations/markham/` | 702 | 4.3 | 24.8 | same |
| `/locations/brampton/` | 703 | 4.0 | 24.8 | `needsClientReview` |
| `/locations/oakville/` | 702 | 3.8 | 24.8 | `needsClientReview` |

Block dump of Markham (in the raw folder) shows the pattern: `[U]` one `focus` sentence and four facility bullets; everything else `[S]` shared (process, reviews, six service cards, FAQ answers) or `[M]` mad-libs ("Get a quote in Markham", "We do not have an office in Markham…"). This is exactly the "location pages with only city name swapped" row in the skill's penalty-risk list, and it is live and indexed today.

---

## 3. Template engine specification

### 3.1 URL patterns

| Level | Pattern | Rule |
|---|---|---|
| Hub | `/locations/` (existing) | unchanged |
| City | `/locations/<city-slug>/` (existing) | one per municipality or former Toronto borough with its own search demand; slugs lower-case, hyphenated, from `coverage.ts` names; no change to the seven live URLs |
| Service × city (year two, gated) | `/locations/<city-slug>/<service-slug>/` | nested under the city, like SKYREX, **not** flat `/office-cleaning-mississauga/`. Reasons: the flat form collides with the `src/pages/[slug].astro` blog catch-all; nesting gives breadcrumb, canonical and "merge back to parent" rules for free; `<service-slug>` must equal an id in `src/content/services/` or `industries/` |
| Neighbourhood / business park | none | sections with `id` anchors on the city page (`/locations/mississauga/#airport-corporate-centre`); never a URL |

Trailing slash always (site rule). No query parameters. Each page self-canonical.

### 3.2 Data model: `LocationEvidence` (extends `Location` in `src/data/locations.ts`)

Every field lists a realistic source for a one-office SMB. Nothing is rendered unless the field is filled; nothing is filled unless the source is recorded.

| Field | Type | Renders as | Source (realistic for Evergreen) | Required for |
|---|---|---|---|---|
| `status` | `'draft' \| 'noindex' \| 'indexed'` | draft builds nothing; noindex builds with `robots: noindex,follow`, out of sitemap | editor | build |
| `verifiedAt`, `verifiedBy` | ISO date, name | sitemap `<lastmod>`; "Reviewed {month year}" line | client sign-off recorded in the data file, same pattern as the case-study gate | index |
| `coords` | lat/lng of the municipal centroid | nearest-neighbour computation only (no map) | StatCan / Wikipedia centroid | build |
| `travelFromBase` | `{ offPeakMin: [lo, hi], peakMin: [lo, hi], via: string, checkedOn }` | "Crews reach {city} in about 30–40 minutes in the evening from Queen St W, via the Gardiner and 427" + a scheduling note | Google Maps directions from 243 Queen St W, departure 19:00 Tue and 08:00 Tue, read by hand once and dated; or the Distance Matrix API at build time if a key is ever added. Indicative to verify: Etobicoke 20–30, North York 25–35, Scarborough 30–40, Mississauga 30–40, Vaughan 35–45, Markham 35–45, Richmond Hill 40–50, Brampton 40–50, Oakville 40–50, Pickering 35–45, Ajax 40–50, Oshawa 50–60 | build |
| `districts[]` | `{ name, slug, what: string, facilityTypes[], note? }` ≥ 4 | H2 "Where we clean in {city}" with one H3 per business park/corridor, 40–80 words each: what kind of stock is there and what that means for cleaning (loading-dock access, after-hours security desks, shared-washroom floors, salt in lobbies on 400-series feeder roads) | Municipal economic-development "employment areas" pages (Mississauga, Vaughan, Markham, Brampton, Oakville all publish them); the client's own route knowledge at the walkthrough; existing `landmarks` strings are the seed | build |
| `facilityMix[]` | ordered facility types with a `source` each | "What we clean most in {city}" — ordered by what the client actually cleans there | QuickBooks/invoice customer list grouped by city (intake C5); until then the client's facility list with `source: 'client list, unranked'` | build |
| `cityServices[]` | subset of service ids + optional `note` | the service cards and anchors on the page; which services the page links to | client: what is realistically offered given travel (e.g. no same-hour emergency response in Oshawa; pressure washing only April–November) | build |
| `localProof[]` ≥ 1 | `{ kind: 'review' \| 'client' \| 'case' \| 'count', text, attribution, permission: true, source }` | a quoted review that names the city; "Cleaning N buildings in {city} today"; an anonymised case ("a 12-operatory dental clinic in Unionville, nightly since 2023") | Google Business Profile reviews that mention a city (intake B3); customer list counts; case studies via the existing `projects` collection with its approval gate. **Never attribute an existing review to a city** — none of the four names one | index (city page); build (child page) |
| `localFaqs[]` ≥ 3 | Q/A | FAQ block + `FAQPage` JSON-LD | questions the client is actually asked for that city: minimum contract size given travel; whether the crew is the same each night; parking/loading access in that park; winter salt programmes; building-security sign-in. Must not be rewordings of the four shared FAQs | build |
| `photos[]` | real job photos taken in that city, with caption | gallery strip | the client's phone; the existing gallery already has a 50k sq ft warehouse — ask where it is | counts toward score, not required |
| `titleOverride`, `description` | strings | `<title>` ≤ 60 chars combining the cluster ("Office Cleaning & Janitorial Services in Markham"), hand-written description | editor | build (description must be unique across the set) |
| `relatedPosts[]` | blog slugs | "From our blog" cards | editorial: dental checklist → Markham/Mississauga clinics section; warehouse posts → Vaughan/Brampton | optional |

Shared blocks (process steps, the trust strip, the three reviews, the quote form) stay shared and are **excluded from the uniqueness count but included in the word count only for the page total, never for the gate**.

### 3.3 Uniqueness measurement

Unique % = words in body blocks that appear on no other page in the location set, after city names and phone numbers are normalised to `{city}`/`{phone}`, divided by all body words, with header/nav/footer removed. Implemented in `analyze_pages.py`; re-implement as `scripts/location-gate.mjs` over `dist/locations/**/index.html` so it runs in the build test like the case-study publish gate.

Benchmarks: JAN-PRO's good pages 97–99 %; its worst 42 %; Evergreen today 4–27 %.

---

## 4. Quality gate (what blocks a page from building, and from indexing)

Three lines:

1. **Builds at all** only if `travelFromBase`, ≥ 4 `districts`, `facilityMix` with sources, `cityServices`, ≥ 3 `localFaqs` and a hand-written `description` are present, the body is **≥ 900 words** excluding shared blocks, and the page measures **≥ 50 % unique** against every other location page (hard stop < 30 %, warning 30–50 %).
2. **Indexed and in the sitemap** only if, in addition, `status: 'indexed'`, `verifiedAt` is set, `needsClientReview` is absent, and ≥ 1 `localProof` with `permission: true` exists; otherwise it builds as `noindex,follow`, self-canonical, out of the sitemap.
3. **A service × city child** builds only if its parent city page has been indexed ≥ 90 days, Search Console shows ≥ 100 impressions / 28 days for queries containing that service term *and* that city, the child has ≥ 1 `localProof` for that service in that city, and it measures ≥ 60 % unique against **both** its parent city page and its parent service page.

Also: the whole set is capped at 14 indexable URLs in 12 months; a human reviews every page (at this scale, 100 % not 5–10 %); `metadata`: titles may share the pattern (it is the query form) but descriptions must differ; no page claims an office outside Toronto (the "Where we work from" block stays mandatory).

---

## 5. Internal-linking automation rules

| Edge | Rule | Change from today |
|---|---|---|
| Hub → spokes | `/locations/` lists every `status: 'indexed'` city grouped by `AREA_GROUPS`, each card showing `travelFromBase` and the first two `facilityMix` entries; `noindex` cities are listed without a link (plain text, as coverage) | cards today show `focus` only; add travel and status filter |
| Spoke → nearest spokes | link the **3 nearest** indexed cities by `coords` haversine, anchor "Commercial cleaning in {name} ({minutes} min further / closer)" | today every page links all six others with the same anchors |
| Spoke → hub | breadcrumb + a "Service areas" link; add `BreadcrumbList` JSON-LD (helper exists in `src/lib/schema.ts`, not used on location pages) | add JSON-LD |
| Spoke → services | only services in `cityServices`, anchor text built from `facilityMix` ("warehouse and plant cleaning in Brampton" → `/services/industrial-cleaning/`); → `/industries/medical-dental-clinics/` and `/industries/property-management/` only when the mix includes clinics / condos | today six identical cards on every page |
| Service → cities | `showAreas` on `OfferPage` lists only indexed cities whose `cityServices` includes this service, anchor "{Service} in {City}" pointing to the child page where one exists, else to `/locations/<city>/#<service-slug>` | today all 15 area names on every service page regardless |
| Child ↔ parents | child links to its city page and its service page in the first paragraph and the breadcrumb; the city page links to each child from the matching service H2; the service page links to each child from the areas block | new |
| Child ↔ child | same-city siblings (max 3) and the same service in the nearest city (1) | new |
| Blog → spokes | `relatedPosts` is bidirectional: the post's related-links block gets the city page where the post is listed | new |
| Anchor rules | no two links on a page with the same anchor to different targets; no exact-match repetition beyond the H1 form; no `nofollow` on internal links (JAN-PRO's Joliet page has two, a mistake) | — |
| Density | 3–5 contextual body links per 1,000 words plus the cards; the strong JAN-PRO pages have 8–18 body links, the 145-link Glendale page is the ceiling to avoid | — |

What not to copy from JAN-PRO: sibling-suburb blasts (Joliet), `utm_campaign=city+page` on internal links (breaks canonical hygiene and inflates GSC noise), and 15-industry blocks shared verbatim across markets.

---

## 6. Index-bloat safeguards

- **noindex until complete.** `status` drives `BaseLayout`'s `noindex` prop; for location pages emit `noindex, follow` (the current `noindex, nofollow` is right for `/lp/` pages, wrong for a page whose links should still count). Self-canonical in every state; never canonical to the parent — a child that is not distinct enough should be deleted, not canonicalised.
- **Sitemap inclusion** is data-driven, not a regex: export `SITEMAP_EXCLUDE` from the data files and feed it to the `@astrojs/sitemap` `filter`; `<lastmod>` = `verifiedAt` via `serialize`. Only `status: 'indexed'` pages that passed the gate are listed. Build test: every URL in `dist/sitemap-0.xml` returns a page without `noindex`, and every indexed location page is in the sitemap.
- **Batches.** Fix the seven (one batch), then ≤ 4 new pages per batch, then 6–8 weeks of Search Console coverage and query observation before the next batch (the skill's 50–100 rule scaled to a 73-URL site).
- **Merge rule.** Any location page with 0 impressions for its city queries 90 days after indexing, or that drops below 50 % unique after a template change, goes back to `noindex` and then to a hub section with a 301 to `/locations/#<city>` (redirects live in `src/data/redirects.ts`).
- **No neighbourhood URLs, no "{service} {neighbourhood}" pages, no Durham-wide or "GTA east" catch-alls.** East York, York, Pickering, Ajax and Oshawa stay in the coverage sentence and hub list.
- **Monthly audit.** GSC "Pages" report indexed count vs the intended 7→10→14; `site:` spot checks; re-run the uniqueness script on `dist/`.
- **Paid pages** stay `noindex` and out of the sitemap; a location page never duplicates an `/lp/` offer.

---

## 7. Proposed page list, prioritised

### Tier 0 — fix what is live (before anything new)

| Page | Today | To do |
|---|---|---|
| `/locations/mississauga/` | 774 w, 27 % unique, client copy, best title on the site | add districts (Airport Corporate Centre, Meadowvale, Sheridan Park, Dixie–Britannia already named — write the 40–80 words each), travel, local FAQs, proof; keep the client's copy |
| `/locations/vaughan/` | 776 w, 27 % | same; districts: VMC, Concord, Woodbridge, the 400 corridor; industrial facility mix is its distinct angle |
| `/locations/toronto-downtown/` | 698 w, 20 %, `needsClientReview` | the one page where "our office is here" is true — lead with it; districts: Financial District, King West, Entertainment District, St Lawrence; proof is likeliest here (3-year office client in Sherman's review — ask where) |
| `/locations/markham/` | 702 w, 4 % | rewrite to spec; title "Office Cleaning & Janitorial Services in Markham"; clinics + tech-park mix; link the dental checklist post |
| `/locations/etobicoke/` | 681 w, 5 % | rewrite; Queensway, Kipling/Islington corridors, Humber Bay; shortest travel after downtown — say so |
| `/locations/brampton/` | 703 w, 4 %, `needsClientReview` | rewrite; warehouse/plant mix; Airport Rd / 407 corridors, Bramalea, Steeles belt |
| `/locations/oakville/` | 702 w, 4 %, `needsClientReview` | rewrite; QEW corridor, Winston Park, Bronte, Kerr St; professional offices and clinics |

Until each passes the gate it should be set `noindex` **only if** that can be done without losing an existing ranking — check GSC first (D3). If a page has impressions, leave it indexed and fix it in place; if it has none, noindex it until it passes.

### Tier 1 — new city pages (after intake C5 confirms work there; two batches)

| Page | Why | Facility angle |
|---|---|---|
| `/locations/north-york/` | largest office stock outside downtown (Yonge–Sheppard, Consumers Rd, Dufferin/Finch industrial); 25–35 min | offices, multi-tenant, clinics, light industrial |
| `/locations/scarborough/` | large industrial/office stock (Golden Mile, Progress Ave/Scarborough Centre, Milliken/Steeles); 30–40 min | industrial, offices, clinics |
| `/locations/richmond-hill/` | York Region's second office market (Hwy 7 / Leslie / Beaver Creek business park) and the only core area with no page; 40–50 min | offices, tech, clinics |

### Tier 2 — service × city children (year two, each triggered by §4 line 3)

| Candidate | Trigger evidence to look for | Why this pair |
|---|---|---|
| `/locations/mississauga/office-cleaning/` | GSC: "office cleaning mississauga" impressions on the city page ≥ 100/28 d, position 8–20 | largest city, biggest office stock, the one nested winner in the SERP is this exact pair |
| `/locations/vaughan/industrial-cleaning/` | "warehouse cleaning vaughan" / "industrial cleaning vaughan" impressions | the client's own Vaughan copy already leads with distribution and manufacturing; distinct facility type, distinct scope |
| `/locations/brampton/industrial-cleaning/` | same for Brampton | same |
| `/locations/markham/medical-dental-clinics/` (the only industry × city) | a named or anonymised Markham clinic client with permission | the industry page exists with real evidence; Markham's mix is clinic-heavy |

### Stays a section, not a page

- "commercial cleaning {city}" — it is the city page's own head term.
- "janitorial services {city}" — synonym; goes in the city page title/H2 as Mississauga already does.
- Building maintenance, post-construction, disinfection, emergency, pressure washing, graffiti × any city — low or no city-level demand in the SERPs seen; each city page gets an H3 under "Services in {city}" only where `cityServices` includes it.
- Offices, retail, education, hospitality × city — no GTA-level industry page exists, so no city child can.
- East York, York, Pickering, Ajax, Oshawa — coverage list and hub sections until the client shows work there.

---

## 8. How to measure

**Search Console (needs intake D3).** Per page, monthly export via the Search Analytics API, `dimensions: [page, query]`, 28-day window:

- `impressions`, `clicks`, `position` for queries containing the city name (the page's cluster) and, separately, for each `{service} {city}` variant — this is the trigger data for §4 line 3 and the kill data for §6.
- Coverage report: indexed count must equal the intended count; any location URL in "Crawled – currently not indexed" for > 60 days is a thin-content signal to act on.
- Baseline before Tier 0 is touched, so the fix can be shown to work.

**Leads.** The `leads` table already stores `form_id` (`location-<slug>` on every location page, `service-<slug>`, `industry-<slug>`), `page_url`, `landing_page`, `first_landing_page` and attribution. Two gaps to close:

1. The visitor's city is stored only inside the free-text `address` column. Add a `city` column (migration `0012_city.sql`) written from the form's `city` field so leads can be grouped by *where the work is*, not only by *which page sent them*; a Toronto page can produce a Mississauga lead and vice versa.
2. Apply `0009_lead_outcomes` so won/lost and value can be joined: `SELECT form_id, city, count(*), sum(won_value) FROM leads JOIN lead_outcomes … GROUP BY 1,2` answers intake C5 (which cities produce profitable work) with data instead of a guess, and is the ranking input for Tier 1 and Tier 2.

In GA4/GTM: `lead_form_submission` already carries `form_id`; `phone_click` and `quote_cta_click` carry page path. Report leads and calls per location page monthly beside GSC clicks; a page with impressions and no leads is a copy problem, a page with neither is an index-or-merge decision.

**Decision cadence.** Monthly: GSC per page, leads per `form_id`, uniqueness re-run on `dist/`. Quarterly: apply §6 merge rule; decide the next batch.

---

## 9. Priority list

**Critical (now):** none of the seven live pages passes the gate; four are ≥ 95 % template. Start with the `LocationEvidence` fields and rewrite Markham, Etobicoke, Brampton, Oakville; collect proof for Downtown (the 3-year office client) and Mississauga/Vaughan.

**High (within the first batch):** `BreadcrumbList` and `FAQPage` JSON-LD on location pages; `noindex, follow` variant; data-driven sitemap filter with `lastmod`; nearest-3 sibling links; `showAreas` filtered by `cityServices`; `scripts/location-gate.mjs` wired into the build test.

**Medium (before Tier 1):** `city` column on `leads`; `lead_outcomes` applied; GSC access and a baseline export; intake C5 and B3 answered.

**Low (backlog):** service × city children per §7 Tier 2; photo galleries per city; blog ↔ city related links.

---

## 10. Limits of this evidence

- SERP data comes from the WebSearch tool, not Google.ca: US index, no local pack, no Toronto personalisation, partial `site:` support. The URL-type pattern (26/27 dedicated city pages) is robust to that; positions are not.
- JAN-PRO measurements are of 7 sub-city pages and 3 hubs out of ~287 sub-city pages; chosen to cover the four pages named in the brief plus a thin one, a huge one and a shared-block one.
- No Search Console, Ads or analytics data for Evergreen was available (intake D1–D4), so the Tier 1 ordering is by facility stock and travel time, not demand, and must be re-ranked once C5 and D3 arrive.
- Travel times are indicative and must be read from Google Maps and dated before they are rendered.

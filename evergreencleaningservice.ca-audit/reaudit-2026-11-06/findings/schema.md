Score: 86/100
Previous: 82/100 (first audit)

# Structured data re-audit: www.evergreencleaningservice.ca (2026-11-06, evening)

Method: parsed every JSON-LD block in `raw/crawl/pages.json` (89 URLs, all status 200, no Microdata/RDFa), compared WebPage/BlogPosting dates with `raw/sitemap-*.xml` lastmod (60 sitemap URLs, all with lastmod), checked FAQ text against saved HTML, read `src/lib/schema.ts` and `src/data/site.ts`. No Rich Results Test or Schema Markup Validator (unreachable). Validation is by hand.

Block-level result: all blocks use `@context` `https://schema.org`; no duplicate `@id` on any page; no deprecated types; absolute URLs; no placeholder text. Counts: ProfessionalService 89, WebSite 89, BreadcrumbList 88 (none on `/`), BlogPosting 24, FAQPage 24, Service 23, WebPage 23, CollectionPage 31 (4 indexable). Breadcrumb positions are sequential on all 88; every non-leaf `item` URL is in the crawl with status 200; no leaf carries `item`.

Crawler artefact: "â" sequences in titles, descriptions, headlines and FAQ text are Latin-1 mojibake of the saved crawl; the HTML itself is double-mojibaked the same way, so these are not site bugs and I did not count them.

## 1. Status of first-audit findings

| ID | Finding | Status | Evidence |
|---|---|---|---|
| S1 | SearchAction pointing at noindex /search/ | Fixed | `SearchAction` string appears in 0 of 89 crawled JSON-LD payloads. Homepage WebSite node now has only `@id`, `url`, `name`, `publisher`. `src/lib/schema.ts` line 19 comment documents the removal. |
| S2 | FAQPage, no SERP benefit (Info) | Open (Info, unchanged by design) | 24 pages now carry FAQPage (was 20; +4 new location pages). 104 Q&As; every question and answer matched the page HTML after normalising whitespace/entities, except 12 strings that differ only by the crawl's double-mojibake apostrophe/dash (confirmed on durham-region and north-york: the JSON-LD text is the clean version of the visible text). So no real mismatch. Still no Google SERP feature since 7 May 2026; keep/remove is the owner's call. |
| S3 | No Review/AggregateRating | Not applicable (correct as is) | No Review or AggregateRating in any payload. Unchanged and still the right call. |
| S4a | `logo` and `image` are the same 884x265 banner | Open | Homepage ProfessionalService `logo` and `image` both `.../cropped-evergreen-cleaning-toronto-logo-banner.jpg`; BlogPosting publisher logo is the same file on all posts. |
| S4b | `streetAddress` has trailing period "243 Queen St W." | Fixed | Homepage address now `"streetAddress": "243 Queen St W"`, locality Toronto, region ON, postal M5V 1Z4, country CA. `src/data/site.ts` line 197 matches. (Whether this equals the Google Business Profile string is not verified.) |
| S4c | priceRange absent; hours Mon-Fri 07:00-18:00 vs GBP | Open (needs client) | Unchanged; priceRange still absent (correct without a verified figure). |
| S5 | ProfessionalService subtype | Not applicable | Still ProfessionalService; no change needed. |
| S6 | Location Service nodes thinner than service-page Services | Open (Low) | North York, Scarborough, Richmond Hill, Durham Region, Oakville all emit the same thin Service: name, serviceType, provider by `@id`, one-city `areaServed`, description, url, `@id` `/locations/<slug>/#service`. No `audience` or `availableChannel`. |
| S7a | BlogPosting author is Organization, no byline | Open (Low, acceptable) | Unchanged on all 24 posts. |
| S7b | Dates written as midnight UTC (`...T00:00:00.000Z`) | Open (Low) | e.g. `/office-cleaning-checklist/` datePublished and dateModified `2026-11-06T00:00:00.000Z`; all 24 posts use this form. |
| S7c | Post `image` is a 2:1 feature crop, single image | Open (Low) | Image URLs unchanged in form (`blog-*-feature.jpg` or `blog-*.jpg`, single string). I did not re-measure image dimensions this round. |
| S8 | WebPage dateModified batch-derived (17 identical) | Partly fixed | Now 23 WebPage nodes with varied values: 2026-10-30T15:43:57, 10-30T15:56:27, 11-06T14:57:18, 15:15:07, 16:01:24, 16:12:26, 18:57:29. Every one equals the sitemap lastmod for the same URL (see section 3). Remaining problem: the batch effect persists (all 7 locations edited 14:57-16:12 share three timestamps), and one node is formatted differently (below, N3). |
| S9 | CollectionPage uneven coverage | Open (Low) | 4 indexable CollectionPages (`/industries/`, `/insights/`, `/insights/page/2/`, `/insights/page/3/`) plus 27 on noindex archives. `/services/`, `/locations/`, `/about-us/` still BreadcrumbList only. No Google feature, tidiness only. |
| S10 | Breadcrumb root name "Home" vs "Evergreen Office Cleaning" | Regressed (Low) | Was 2 posts with "Home", now 3: `/how-often-should-an-office-be-cleaned/`, `/office-cleaning-cost-toronto-guide/` and the new `/office-cleaning-checklist/` (Home > Insights > Office Cleaning Checklist). The other 85 breadcrumbs start "Evergreen Office Cleaning". The new guide copied the inconsistent builder. |

## 2. Specific checks requested

- SearchAction removal: confirmed on the live crawl (0 occurrences). Fixed.
- Address string: confirmed "243 Queen St W", no period. Fixed.
- Service nodes on the 4 new location pages: all present and valid. Each page's graph is ProfessionalService, WebSite, Service, WebPage, BreadcrumbList, FAQPage. WebPage `mainEntity` points to `.../locations/<slug>/#service`, which resolves to the Service node on the same page; `isPartOf` `#website`, `publisher` `#organization`, `primaryImageOfPage` set. Breadcrumb is Evergreen Office Cleaning > Service Areas > <City>; position-2 URL `/locations/` returns 200. Durham Region's Service says "Commercial Cleaning in Durham Region" with `areaServed` type `City` "Durham Region"; Durham Region is a regional municipality, so `AdministrativeArea` would be more exact (see N2). WebPage name for Durham is "Office & Commercial Cleaning in Pickering, Ajax & Oshawa | Evergreen" while the Service name says "Durham Region": a small naming mismatch, not an error.
- BlogPosting on the new guide: `/office-cleaning-checklist/` has a complete BlogPosting (`@id` `#article`, headline, description, datePublished/dateModified, image `blog-office-cleaning-checklist.jpg`, author and publisher with logo, `mainEntityOfPage`). It has no FAQPage, which is fine. Valid.
- BlogPosting on retitled posts: headline matches the retitled title on `/areas-in-your-office-where-germs-are-likely-hiding/` ("Office Germ Hotspots and Hand Hygiene: ..." 66 chars), `/robotic-vs-manual-cleaning-...` (dateModified 2026-10-30), `/commercial-cleaning-air-quality/` (dateModified 2026-11-06), `/cleaning-protocols-for-daycares-and-schools/`, `/how-to-decide-on-a-cleaning-company/`. All headlines under 110 characters. dateModified on every post equals the sitemap lastmod date for that URL (all posts: day-level match, 24/24).
- Breadcrumb consistency: positions and URLs all valid; naming issue in S10 only.
- WebPage dateModified vs sitemap lastmod: 23 of 23 agree to the second (as instants).

## 3. WebPage dateModified vs sitemap lastmod (detail)

22 of 23 are byte-identical in the crawl (`2026-11-06T16:12:26.000Z` vs lastmod `2026-11-06T16:12:26.000Z`; service pages use `+00:00` instead of `.000Z`, same instant). The 23rd, `/services/graffiti-removal/`, emits `2026-10-31T11:27:36-04:00` against sitemap `2026-10-31T15:27:36.000Z`: same instant, different notation (N3). There is no disagreement in any case.

## 4. New findings

### N1. New guide copies the "Home" breadcrumb root. Severity: Low
Evidence: `/office-cleaning-checklist/` BreadcrumbList position 1 is "Home"; 85 other pages say "Evergreen Office Cleaning". Google shows breadcrumb names.
Recommendation: in the post-breadcrumb builder (`src/pages/[slug].astro`, and wherever the guide template calls `breadcrumbSchema`), use `site.name`. This also closes S10.

### N2. Durham Region typed as City. Severity: Low
Evidence: `/locations/durham-region/` Service `areaServed` is `{"@type":"City","name":"Durham Region"}`. Durham is a regional municipality containing Pickering, Ajax and Oshawa, which the page and WebPage name actually target.
Recommendation: emit `AdministrativeArea` for this entry (or list Pickering, Ajax and Oshawa as three `City` nodes) in `src/pages/locations/[slug].astro`. Not an error; precision only.

### N3. Mixed dateModified notation. Severity: Info
Evidence: 22 WebPage nodes use `Z`/`+00:00`, graffiti-removal uses `-04:00`. Same instant as the sitemap, so crawlers agree.
Recommendation: normalise to one format in `schema.ts` when convenient.

### N4. dateModified on the new guide equals datePublished and both are date-only midnight. Severity: Info
Evidence: `/office-cleaning-checklist/` published and modified `2026-11-06T00:00:00.000Z`, matches sitemap lastmod `2026-11-06T00:00:00`. Consistent; no action.

### N5. WebPage/Service nodes exist on only 23 pages; blog and hub pages carry no WebPage node. Severity: Info
Evidence: BlogPosting uses a typed `mainEntityOfPage` instead, which is valid. No action.

## 5. What still needs the client or an account owner

- Square logo (at least 112x112, ideally 512x512) and 1-2 real business photos for `logo`/`image` (S4a).
- Confirm the Google Business Profile address, hours and category match the schema: "243 Queen St W", Mon-Fri 07:00-18:00 (S4b/S4c).
- Decide whether to keep FAQPage JSON-LD now that Google shows no FAQ rich results (S2).
- Search Console owner: check the Enhancements/Structured data reports for the 4 new location pages and the new guide.
- A verified price range, if the client wants `priceRange` (otherwise leave out).

## 6. Not verified

- Rich Results Test / Schema Markup Validator output.
- Search Console structured-data reports.
- Image dimensions for the new guide's `blog-office-cleaning-checklist.jpg` and the post feature images this round.
- Google Business Profile string match.
- Git history behind WebPage `dateModified` values (I only compared with the sitemap).
- The 301-redirected old posts were not in the 89-URL crawl, so their redirect targets' schema is covered only through the destination pages shown above.

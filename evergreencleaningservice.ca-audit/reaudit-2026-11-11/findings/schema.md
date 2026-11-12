Score: 89/100
Previous: 86/100 (re-audit 7 Nov)

# Structured data audit: www.evergreencleaningservice.ca (2026-11-11)

Method: parsed every JSON-LD block of the 94 URLs in `raw/crawl/pages.json` (all 200), compared with the 62 sitemap lastmods, read `src/lib/schema.ts` and `src/data/coverage.ts`. Validation is by hand (no Rich Results Test / Schema Markup Validator).

Counts: ProfessionalService 94, WebSite 94, BreadcrumbList 93 (none on `/`), BlogPosting 25, FAQPage 25, Service 24, WebPage 24, CollectionPage 34. All use `https://schema.org`; no duplicate `@id` on any page; no deprecated types; no SearchAction, Review or AggregateRating; absolute URLs.

## 1. Status of re-audit findings

| ID | Finding | Status | Evidence |
|---|---|---|---|
| S1 | SearchAction | Fixed (stays fixed) | Not present in any payload. |
| S2 | FAQPage, no SERP benefit (Info) | Open (Info) | 25 pages carry FAQPage (+1: janitorial, 7 Qs). Commercial-cleaning has 9. Owner's call. |
| S3 | No Review/AggregateRating | Not applicable | Still none; correct. |
| S4a | logo and image are the same 884x265 banner | Open | Org node on every page: both `.../cropped-evergreen-cleaning-toronto-logo-banner.jpg`. |
| S4b | Address period | Fixed | `"streetAddress": "243 Queen St W"` on all pages. |
| S4c | priceRange / hours vs GBP | Open (client) | priceRange absent; Mon-Fri 07:00-18:00 unchanged. |
| S5 | Subtype | Not applicable | ProfessionalService. |
| S6 | Thin location Service nodes | Open (Low) | North York Service: name, serviceType, provider, one-city areaServed, description, url only. |
| S7a | Author is Organization | Open (Low) | Quote checklist post same. |
| S7b | Midnight-UTC post dates | Open (Low) | Checklist post `2026-11-10T00:00:00.000Z`. |
| S7c | Single 2:1 post image | Open (Low) | Checklist post `image` is one string (`blog-commercial-cleaning-quote.jpg`). Dimensions not re-measured. |
| S8 | WebPage dateModified batch-derived | Partly fixed | Agreement with sitemap is perfect (below); batch clustering persists (e.g. North York and Durham share `2026-11-07T17:56:48Z`). |
| S9 | CollectionPage coverage | Open (Low) | `/services/`, `/locations/`, `/about-us/` still breadcrumb only. |
| S10 / N1 | Breadcrumb root "Home" on 3 posts | Fixed | All 93 BreadcrumbLists start "Evergreen Office Cleaning". Zero "Home". |
| N2 | Durham typed as City | Fixed | `/locations/durham-region/` Service `areaServed` is now three `City` nodes (Pickering, Ajax, Oshawa), each `containedInPlace` `AdministrativeArea` "Durham Region". Service name now "Commercial Cleaning in Pickering, Ajax and Oshawa", matching the WebPage. |
| N3 | Mixed dateModified notation | Open (Info) | Still mixed: `Z`, `+00:00` and `-05:00` (janitorial and commercial-cleaning `2026-11-11T15:22:24-05:00`; graffiti `-04:00`). 13 service/industry WebPages differ in string from the sitemap `.000Z` but are the same instant. |
| N4 | Guide dateModified = datePublished | Open (Info) | Same pattern on new checklist post; consistent with sitemap. |
| N5 | WebPage on only some pages | Open (Info) | WebPage 24 (was 23; +janitorial). Posts use typed mainEntityOfPage. |

## 2. Specific checks requested

- areaServed from coverage.ts: confirmed. Organisation and 13 service/industry Service nodes emit the identical 15-City list (Toronto, North York, Scarborough, Etobicoke, East York, York, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax, Oshawa), which equals `SERVICE_LOCATION_SUGGESTIONS`. Location Services each carry one city (Downtown Toronto, North York, Scarborough, Etobicoke, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill) plus the Durham trio. Fixed (North York/Scarborough/Etobicoke now present).
- Durham typing: see N2 above. Fixed.
- One breadcrumb root: 93 of 93 "Evergreen Office Cleaning". Fixed.
- Janitorial page: valid Service (`#service`, serviceType, provider by id, 15-city areaServed, url) plus WebPage (`mainEntity` to the Service, `isPartOf` #website, publisher #organization, `primaryImageOfPage` janitorial-cart-preparation-supplies.jpg), BreadcrumbList Evergreen > Services > Janitorial Services, FAQPage (7). Also listed in the org `hasOfferCatalog` with matching `@id`. Valid. `/services/commercial-cleaning/` retitled and its WebPage name/description match ("Commercial Cleaning Services in Toronto | Evergreen").
- Quote checklist post: complete BlogPosting (`#article`, headline, description, dates, image, author, publisher with logo, mainEntityOfPage) and BreadcrumbList Evergreen > Insights > "Cleaning Quote Checklist". Valid. Breadcrumb leaf is shorter than the headline (acceptable).
- dateModified vs sitemap lastmod: 49 of 49 WebPage and BlogPosting nodes (24 + 25) equal the sitemap lastmod as instants; 0 disagreements. All 62 sitemap URLs are in the crawl.

## 3. New findings

### N6. Location Service areaServed typed City for "Downtown Toronto". Severity: Info
`/locations/toronto-downtown/` emits `{"@type":"City","name":"Downtown Toronto"}`. A neighbourhood, not a city; `AdministrativeArea` or `{"@type":"City","name":"Toronto"}` with the neighbourhood in the description is more exact. Same rationale as the documented North York/Scarborough choice in `src/lib/schema.ts`. Not an error.

### N7. East York and York claimed in areaServed without a page. Severity: Info
They appear as `City` in the sitewide list (derived from coverage.ts) while the site gives them plain text only. Consistent with the stated coverage; flag only if the client wants to narrow. No action in code.

### N8. dateModified timezone offset follows the build host, not UTC. Severity: Info
Janitorial and commercial-cleaning use `-05:00`, graffiti `-04:00`, others `+00:00`/`Z`. Normalise to `toISOString()` in `src/lib/schema.ts` when convenient.

No regressions introduced by the 0TBS changes (janitorial page, checklist post, photo heroes).

## 4. Needs the client or an account owner

- Square logo (112x112 minimum, ideally 512x512) and 1-2 real business photos for `logo`/`image` (S4a).
- Confirm GBP address, hours and category match schema (S4b/S4c); a verified price range if they want `priceRange`.
- Decide whether to keep FAQPage JSON-LD (S2).
- Search Console owner: check Enhancements/Structured data for the janitorial page and checklist post.

## 5. Not verified

- Rich Results Test / Schema Markup Validator output; Search Console reports.
- Image dimensions for blog and janitorial hero images.
- GBP string match.
- Git history behind WebPage dateModified values.
- FAQ text vs visible page text for the new janitorial page (not re-compared this round).

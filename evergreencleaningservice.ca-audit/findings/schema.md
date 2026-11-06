Score: 82/100

# Structured data audit: www.evergreencleaningservice.ca (2026-11-06)

Method: parsed `raw/crawl/pages.json` (92 URLs, 59 indexable HTTPS pages), read `src/lib/schema.ts` and `src/data/site.ts`, compared FAQ markup to the saved HTML, fetched every image referenced from JSON-LD to measure it. I did not run the Rich Results Test or Schema Markup Validator (no access to those from this sandbox). Validation below is by hand against schema.org and Google's documentation.

## Detection summary

| Type | Where | Format |
|---|---|---|
| ProfessionalService (`/#organization`) | all 92 crawled URLs | JSON-LD, one `@graph` |
| WebSite (`/#website`) | all 92 | same `@graph` |
| BreadcrumbList | 90 (not on `/`, which is correct) | JSON-LD |
| Service + WebPage (linked by `mainEntity`) | 19: 10 service pages, 2 industry pages, 7 location pages | JSON-LD |
| FAQPage | 20 indexable pages | JSON-LD |
| BlogPosting | 25 posts | JSON-LD |
| CollectionPage | 4 indexable (`/industries/`, `/insights/`, `/insights/page/2/`, `/insights/page/3/`) plus 32 noindex archives | JSON-LD |

No Microdata or RDFa. All `@context` values are `https://schema.org`. All URLs are absolute. No placeholder text. No duplicate `@id` within any page. Every JSON-LD block has a valid `@type` and none uses a deprecated type. `CleaningService` (not a schema.org type) was already replaced by ProfessionalService.

A note on a crawl artefact: `pages.json` shows "Day Or Night â Which..." for the day/night post. I fetched the live page: the bytes are a correct UTF-8 en dash (E2 80 93) in both `<title>` and `headline`. Not a site bug.

## What works

- The graph is coherent. Org and WebSite share `@id`s, every Service and WebPage points at `#organization` / `#website` by reference, and the 10 `hasOfferCatalog` entries use the same `@id`s (`/services/<slug>/#service`) as the full Service nodes on those pages. All 10 resolve to an existing node.
- NAP is built from one source (`nap` in `src/data/site.ts`), so schema and footer cannot drift.
- BreadcrumbList is clean on all 90 pages: positions are sequential from 1, every `item` URL returns 200 and is indexable, and the last item correctly omits `item`.
- FAQPage text matches the page. For all 20 pages, every question and answer string in the JSON-LD was found verbatim in the saved HTML (0 mismatches in 78 Q&As; they sit in `<details>` elements, visible on expand).
- BlogPosting is complete on all 25 posts: headline (max 61 chars, under the 110 limit), description, datePublished, dateModified, image, author, publisher with logo, `mainEntityOfPage`. Six posts have a `dateModified` later than `datePublished`; the other 19 are equal, which is honest.
- `aggregateRating` is deliberately absent and the code comment explains why. That is the correct call (see S3).
- Location Service nodes carry the single city in `areaServed`, not the 10-city list.

## Findings

### S1. WebSite SearchAction points at a noindex page and no longer has a use. Severity: Low
Evidence: `schema.ts` lines 132-139 emit `SearchAction` with `urlTemplate` `https://www.evergreencleaningservice.ca/search/?q={search_term_string}` on every page. `src/pages/search.astro` sets `robots: follow, noindex`, renders an empty shell, filters only the news posts in the browser (JS required), and is not in the sitemap. Google retired the sitelinks search box in November 2024, so the markup yields nothing in Google, and it advertises a site search that only covers blog posts.
Recommendation: remove `potentialAction` from the WebSite node in `src/lib/schema.ts`. Keep the `/search/` page itself if wanted. If you keep the markup for non-Google consumers, nothing breaks, but it is dead weight on 92 pages.

### S2. FAQPage: no Google SERP benefit now; markup is accurate. Severity: Info
Evidence: 20 pages carry FAQPage (12 service/industry, 7 location, `/our-process/`). The brief says Google "limits" FAQ rich results to government/health sites. That is out of date: Google retired FAQ rich results for all sites on 7 May 2026, so the earlier gov/health exception no longer applies either. A cleaning company would not have qualified under the old rule in any case.
Implication: the 20 blocks earn no SERP feature. They are not invalid and not harmful, and the visible FAQ content is the real value (it is on-page, matches the markup, and uses `<details>`). Any benefit to AI/generative answers is unconfirmed. Do not remove the visible FAQ sections. Do not add FAQPage to further pages. Whether to keep the JSON-LD is a low-stakes choice: keeping it costs a few KB per page; removing it saves that and nothing else. If the FAQ component (`FaqList`) emits the schema, removal is a one-line change there. `/our-process/` FAQ is the same case.
Do not convert to QAPage: these are publisher-authored FAQs, not user Q&A.

### S3. No reviews or AggregateRating markup; correctly so. Severity: Info
Evidence: `/reviews/` renders 7 Google reviews from `src/data/reviews.ts` as cards (name, star text, relative age, `<time datetime>`), and no Review or AggregateRating JSON-LD exists anywhere. `reviews.astro` states no aggregate is shown "until the client confirms one".
Would a self-serving AggregateRating be allowed? Google's review snippet policy says reviews of a LocalBusiness or Organization that the business controls on its own site (self-serving) are not eligible for star rich results, and the markup would be ignored for that purpose. ProfessionalService is a LocalBusiness subtype, so putting `aggregateRating` on `/#organization` would earn no stars. It also carries a policy risk if the numbers are not the visible, verifiable ones. Only 7 reviews exist, 3 of them from 2025-2026, and the rest from 2020-2021, with two dates approximate (per the code comment).
Recommendation: do not add `aggregateRating` for SERP purposes. If you later want it as an entity signal, add it only when the figure matches the Google Business Profile exactly and is shown on `/reviews/`; accept that Google will not show stars. Individual `Review` nodes on `/reviews/` have the same self-serving restriction. The real star-rating lever is the Google Business Profile, not this site.

### S4. ProfessionalService node: valid, a few gaps. Severity: Low
Evidence (homepage graph):
- Present and valid: name, alternateName, foundingDate, url, logo, image, telephone (+1-416-803-4880), email, PostalAddress, GeoCoordinates (43.65019, -79.38856), hasMap, openingHoursSpecification (Mon-Fri 07:00-18:00), areaServed (10 `City` nodes), sameAs (Maps cid, Facebook, X, LinkedIn), ContactPoint (sales, `areaServed: CA-ON`), OfferCatalog.
- `logo` and `image` are the same file, `cropped-evergreen-cleaning-toronto-logo-banner.jpg`, 884x265 (3.3:1). Google's logo guidance prefers an image that works at a square-ish crop; a wide banner can be cropped badly in a knowledge panel. `image` should be a photo of the business or work, not the logo, and Google asks for multiple images for LocalBusiness.
- `streetAddress` is "243 Queen St W." with a trailing period. Cosmetic, but it should match the Google Business Profile string exactly.
- `priceRange` is absent. It is recommended for LocalBusiness but this is a quote-only service and I found no verified range to state. Do not invent one. Leave it out unless the client supplies it.
- Opening hours say Mon-Fri 07:00-18:00 ("office hours") while crews work after hours and at weekends. That is a defensible reading (the code comment explains it), but I could not check it against the Business Profile. Make sure all three match.
Recommendation: in `src/data/site.ts`, supply a square logo (at least 112x112, ideally 512x512) and use it for `logo`; add an `image` array with 1-2 real photos (e.g. `night-janitorial-crew-office-toronto.jpg`, 1200x800, already used on the site). Drop the trailing period in `streetAddress` only if the GBP has none. Corrected fragment:

```json
{
  "@type": "ProfessionalService",
  "@id": "https://www.evergreencleaningservice.ca/#organization",
  "logo": {
    "@type": "ImageObject",
    "url": "https://img.evergreencleaningservice.ca/images/evergreen-logo-512.png",
    "width": 512,
    "height": 512
  },
  "image": [
    "https://img.evergreencleaningservice.ca/images/night-janitorial-crew-office-toronto.jpg",
    "https://img.evergreencleaningservice.ca/images/office-backpack-vacuum-toronto.jpg"
  ]
}
```
(`evergreen-logo-512.png` is a placeholder filename: the file does not exist yet and must be created by the client/designer. Do not ship the snippet with that URL until it does.)

### S5. LocalBusiness subtype choice: keep ProfessionalService. Severity: Info
schema.org has no cleaning-specific type (`CleaningService` does not exist). HomeAndConstructionBusiness covers contractors and home trades (electrician, roofing, plumber) and is a worse fit for a commercial janitorial firm. ProfessionalService is valid and is a LocalBusiness subtype, so Google's local business properties apply. No change needed. Adding a second type (`["ProfessionalService","LocalBusiness"]`) adds nothing.

### S6. Service nodes: valid, with minor inconsistency. Severity: Low
Evidence: service and industry pages emit provider (by `@id`), areaServed (10 cities), serviceType, audience (BusinessAudience), and `availableChannel` (ServiceChannel with serviceUrl and phone). Location pages emit a thinner Service (name, serviceType "Commercial Cleaning", provider, one-city areaServed, url) with no `audience` or `availableChannel`; the location Service nodes are built outside `serviceSchema()`, in `src/pages/locations/[slug].astro`. Downtown Toronto uses `City` "Downtown Toronto", and Etobicoke is a former municipality, not a city today; `City` is still accepted, `AdministrativeArea` or `Place` would be more precise, but it is not an error.
No Service has `offers`. That is right for quote-only work; do not add a price. The `Offer` wrappers in `hasOfferCatalog` have no price either. schema.org allows that and Google has no Service rich result, so it is harmless.
The industry Services (property management, medical/dental) and the 7 location Services are not in the org's OfferCatalog. This is fine; the catalog is described as the service list.
Recommendation: have the location template call `serviceSchema()` with an `areaServed` override so all 19 Service nodes carry the same fields. Low priority; no search feature depends on it.

### S7. BlogPosting: fine, with three small points. Severity: Low
Evidence:
- `author` is the Organization, repeated in full (name, url, `@id`). Google accepts Organization authors. No visible byline appears on posts (no author text found in `[slug].astro` or the layouts), so markup and page agree. A named Person author with a profile page would help article credibility; only do it if the client wants a real byline on the page.
- `datePublished`/`dateModified` are written as `2026-11-03T00:00:00.000Z`, `2021-05-31T00:00:00.000Z`, etc. This is valid ISO 8601, but midnight UTC is the evening of the previous day in Toronto. Harmless to Google; for tidiness, emit date-only (`2021-05-31`) or add the Toronto offset in `articleSchema()` (`toISOString()` on line 191-192 of `schema.ts`).
- `image` is the `-feature.jpg` file. Measured sizes: 23 of 25 posts are 960x480 (2:1); the two newest (`office-cleaning-frequency`, `office-cleaning-cost-toronto-guide`) are 1200x675. 960x480 clears Google's 50,000-pixel minimum, but Google recommends 16:9, 4:3 and 1:1 crops, and 2:1 is none of those. The `-og.jpg` files are 1200x630 (checked two). Cheapest improvement: pass an array `[ogImage, featureImage]` to `image` in `articleSchema()`. Longer term, add 1:1 and 4:3 crops.
- `headline` max 61 characters. `mainEntityOfPage` is a typed WebPage with `@id` equal to the canonical URL: valid.
- Not set (optional): `url`, `inLanguage` (en-CA), `articleSection`, `wordCount`.

### S8. WebPage dateModified values look batch-derived. Severity: Low
Evidence: of the 19 WebPage nodes, 17 share `2026-10-31T10:11:02-04:00` and 2 share `2026-10-31T11:27:36-04:00`. The comment in `schema.ts` says this is the last commit touching each page's source files, so 17 pages sharing one second means one commit touched all of them (probably a shared data file). The value is valid but does not tell crawlers when each page's own content changed. Not a defect; keep as is, but do not rely on it as an editorial freshness signal. I did not verify against git history.

### S9. CollectionPage: valid; coverage uneven. Severity: Low
Evidence: the 4 indexable CollectionPages are well-formed (`@id` with `#collection`, name, url, description, isPartOf, publisher). `/insights/page/2/` and `/page/3/` are named "News - Page 2 of 3" / "News - Page 3 of 3" with the same description as page 1. No `mainEntity`/`hasPart` ItemList, which is optional. The 32 noindex tag/category archives also emit CollectionPage, which is wasted but harmless. `/services/` and `/locations/` are hub pages of the same kind and get only BreadcrumbList. There is no Google feature for CollectionPage, so this is tidiness only.
Recommendation: optionally give `/services/` and `/locations/` a CollectionPage via `collectionSchema()`. Optionally suppress schema output on noindex archives.

### S10. Breadcrumb naming inconsistency. Severity: Low
Evidence: position-1 name is "Evergreen Office Cleaning" on 88 pages and "Home" on two posts (`/how-often-should-an-office-be-cleaned/`, `/office-cleaning-cost-toronto-guide/`), whose breadcrumb is built differently from the other 23. Leaf names on posts are shortened labels ("Office Cleaning Frequency") rather than the H1. Valid, but Google shows the names, so keep them consistent.
Recommendation: use one name for the root (`site.name` is used in the other callers of `breadcrumbSchema`) in whatever builds post breadcrumbs (`src/pages/[slug].astro`).

## Missing opportunities (assessed)

- **ImageObject for `/cleaning-demo-gallery/`**: 13 gallery photos, 71 words of text. There is no gallery-specific Google feature. The licensable-image badge needs `license`, `acquireLicensePage`, `creator` and `creditText`, and only makes sense if the client owns the photos and wants them licensed. Skip unless that is the intent. (`ImageGallery` is a valid schema.org type but has no Google feature either.)
- **VideoObject for the homepage video**: the video is the floating "Lead Net" widget (`src/components/LeadVideo.astro`, `public/video/lead-net.mp4`) that `BaseLayout.astro` includes site-wide, not content on a dedicated page. Google video rich results need the video to be a primary element of a page, and the clip is self-hosted with no landing page. Low value. If a `VideoObject` is still wanted, it needs a poster `thumbnailUrl`, `uploadDate` and `contentUrl`; the poster is under `public/images/` (`lead-net-poster.jpg` per the component comment). I did not check the actual upload date or whether the clip has a transcript, so I have not drafted one.
- **HowTo on `/our-process/`**: do not add. HowTo rich results were removed in September 2023. The page already has visible ProcessSteps and FAQ content, which is what users and AI systems can read.
- **AboutPage / ContactPage**: `/about-us/` and `/contact-us/` carry only BreadcrumbList. Typing them as AboutPage/ContactPage with `mainEntity` pointing at `#organization` is cheap and accurate but has no Google feature. Optional.
- **Person / founder**: the company dates to 1989; if a named owner is on the About page, a Person node linked via `founder` would strengthen the entity. Needs real content; not drafted.
- **Offer catalog**: exists and is correct. Do not add prices.

## Quick wins

1. Remove `SearchAction` from the WebSite node in `src/lib/schema.ts` (S1).
2. Replace the banner `logo`/`image` with a square logo plus real photos in `src/data/site.ts` and `schema.ts` (S4).
3. Pass `[og image, feature image]` as BlogPosting `image` and emit date-only or offset-aware dates in `articleSchema()` (S7).
4. Make post breadcrumbs use the same root name as everything else (S10).
5. Decide on the FAQPage JSON-LD (keep or remove); leave the visible FAQs (S2).

## Not verified

- Rich Results Test / Schema Markup Validator output (not reachable from this sandbox).
- Whether the Google Business Profile matches the schema's address string, hours, category and review count.
- Whether Search Console reports any structured-data enhancement errors.
- Per-page git history behind `dateModified`.

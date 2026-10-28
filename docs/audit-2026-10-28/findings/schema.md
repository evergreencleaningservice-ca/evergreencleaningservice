# Structured Data Audit: evergreencleaningservice.ca (2026-10-28)

Method: raw HTML fetched with curl (all 16 pages + 2 Jan-Pro pages), every `application/ld+json` block extracted and parsed with Python (`json.loads`), and checked structurally against Google's documented requirements. The Google Rich Results Test and Schema Markup Validator could NOT be called from this environment. Run the final markup through https://search.google.com/test/rich-results and https://validator.schema.org before shipping. No Microdata or RDFa found anywhere. All JSON-LD parses cleanly (0 invalid blocks), and all of it is in raw server HTML (no JS injection dependence).

## 1. Current implementation (by template)

| Template | URL(s) | JSON-LD blocks | Types |
|---|---|---|---|
| Site-wide (every page) | all 16 | 1 `@graph`, byte-identical (2,960 chars) | CleaningService (`#organization`), WebSite (`#website`) + SearchAction/EntryPoint, PostalAddress, GeoCoordinates, 2x OpeningHoursSpecification, 10x City, OfferCatalog, 4x Offer/Service |
| Home | / | site-wide only | no WebPage, no breadcrumb (appropriate) |
| Services hub | /services/ | site-wide only | no BreadcrumbList, no ItemList |
| Service detail | /services/office-cleaning/, /commercial-cleaning/, /post-construction-cleaning/ | +3 | BreadcrumbList, Service (provider by @id, 10 City areaServed), FAQPage (7 / 5 / 4 Qs) |
| Industry | /industries/medical-dental-clinics/ | +3 | BreadcrumbList, Service, FAQPage (4 Qs) |
| Location detail | /locations/mississauga/ | +2 | Service (areaServed single City), FAQPage (4 Qs). NO BreadcrumbList |
| Locations hub | /locations/ | site-wide only | no BreadcrumbList |
| Process | /our-process/ | +2 | BreadcrumbList, FAQPage (4 Qs) |
| About / Reviews / Contact / Quote | /about-us/, /reviews/, /contact-us/, /request-a-quote/ | site-wide only | no BreadcrumbList; no AboutPage/ContactPage |
| Blog index | /insights/ | +2 | CollectionPage (`#collection`), BreadcrumbList |
| Blog posts | both | +2 | BlogPosting (`#article`, mainEntityOfPage, headline, description, image, author/publisher by @id, datePublished, dateModified, isPartOf), BreadcrumbList (4 levels) |

## 2. Validation results

Pass (good practice already in place):
- `@context` is `https://schema.org` everywhere; all URLs absolute; no placeholder text; phone is E.164-style (`+1-416-803-4880`); `addressCountry: CA`; `priceRange: "$$"` acceptable; `logo`/`image` URLs return 200 image/jpeg.
- Consistent `@id` system: `#organization`, `#website`, `#article`, `#collection`. Service, BlogPosting, CollectionPage all reference `#organization`/`#website` by `@id` rather than redefining the business. Good entity linking.
- NAP in schema matches on-page footer/contact text (243 Queen St W., Toronto ON M5V 1Z4, (416) 803-4880, Mon-Fri 7am-10pm, weekends 8am-8pm). Schema hours match visible hours.
- FAQ markup matches visible on-page FAQ text (spot-checked office-cleaning, mississauga, our-process).
- Mississauga FAQ states plainly there is no Mississauga office, and schema correctly does NOT create a fake per-city LocalBusiness. Keep it that way.
- sameAs (Facebook, X, LinkedIn) all resolve (HTTP 200; platforms often return 200 for any slug, so confirm the handles are the live profiles).

Issues, ordered by priority:

| # | Severity | Issue |
|---|---|---|
| 1 | Medium | Name inconsistency. Schema `name` is "Evergreen Office Cleaning" everywhere (org, WebSite, breadcrumbs, og:site_name). But the logo alt text, social page slugs, reviewer text ("Evergreen Cleaning Service") and the domain say "Evergreen Cleaning Service". No `alternateName`/`legalName` bridges them. Pick one primary name and add the other as `alternateName`. |
| 2 | Medium | BreadcrumbList missing on 7 templates: /services/, /locations/, /locations/mississauga/, /about-us/, /reviews/, /contact-us/, /request-a-quote/ (home excluded by design). Present only on service, industry, process, insights and posts. |
| 3 | Medium | Blog `dateModified` equals `datePublished` and both are `T00:00:00.000Z` (CMS default, not a real timestamp: 2020-04-29, 2023-03-31). Neither date nor an author byline is visible on the post pages (checked: no `<time>`, no byline), so markup dates are not backed by visible content. Add a visible "Published / Updated" line and real ISO 8601 timestamps with Toronto offset (`-04:00`/`-05:00`). Only update `dateModified` on substantive edits. |
| 4 | Low-Med | Blog `author` = the Organization. Valid, but a named Person (e.g. owner, referred to in reviews as "Art"; surname unverified, do not guess) or "Evergreen Editorial Team" Person-less byline is a stronger E-E-A-T signal. |
| 5 | Low | `logo` is a plain string pointing at `cropped-...-logo-banner.jpg` (a wide banner). Google wants a logo that is square-ish or legible when cropped, min 112x112, on a crawlable URL. Use an `ImageObject` with width/height and a clean square/transparent PNG. `image` is the same banner; use 1x1, 4x3, 16x9 variants (or the hero OG image) for `image`. |
| 6 | Low | `areaServed` is a flat list of 10 `City` nodes with names only, repeated in full in the site-wide graph AND again on every Service. Valid, and City list is the right call for a named-city service area (a GeoCircle would add false precision and would sweep in Hamilton, Barrie etc. that you may not serve). Improve: add `containedInPlace` (AdministrativeArea Ontario / Country Canada) or `sameAs` Wikidata/Wikipedia URL so the cities disambiguate, and drop the repeated list from Service nodes in favour of one definition. The on-page FAQ also lists Toronto districts (North York, Scarborough, Etobicoke, East York, York); not in schema. |
| 7 | Low | `hasOfferCatalog` lists 4 services with no `url`, so they are not tied to the real service pages and not cross-referenced with the page-level Service nodes (which have no `@id`). "Industrial & Warehouse Floor Scrubbing" and "Building Maintenance & Floor Care" are not matched to a template in the audit set (no such page was in the list; verify a page exists). Give each page-level Service an `@id` (`.../#service`) and reference it from the catalog `itemOffered`. Offers have no price; fine for quote-based B2B. Do not add fake prices. |
| 8 | Low | `GeoCoordinates` 43.6503, -79.3892 looks like a downtown-Toronto approximation, roughly 200-300 m from 243 Queen St W. Re-copy lat/long from the Google Maps pin of the business profile. Not verifiable here. |
| 9 | Low | `SearchAction` on WebSite: Google retired the Sitelinks Search Box (2024); markup is harmless but has no search-feature benefit. `/search/?q=` works (200). Can keep or remove. Note target uses `EntryPoint`, which is correct. |
| 10 | Low | BreadcrumbList on posts passes through `/category/blog/`, which is `noindex, follow`. Prefer parent `/insights/` then post, or accept. Leaf items omit `item` (allowed by Google for the last crumb). Crumb 2 label "News" vs page title "Blog". |
| 11 | Info | Single entity typed `CleaningService` (a LocalBusiness subtype) carrying `@id #organization`. No separate Organization node, so there is NO Organization-vs-LocalBusiness duplication. This is the correct pattern. Do not add a second Organization with the same details. |
| 12 | Info | FAQPage is present on 6 pages (office, commercial, post-construction, medical/dental, mississauga, our-process). Google retired FAQ rich results for all sites on 2026-05-07: no SERP benefit, any AI/GEO value unconfirmed. Not an error; leave in place as low-maintenance (it is valid and matches visible content), do not invest more in it, do not add to new pages for SERP reasons. Content is already visible on-page, which is what matters. |
| 13 | Info | `foundingDate` (1989) is a prominent on-page claim but absent from schema. |
| 14 | Info | Missing optional LocalBusiness fields: `alternateName`, `legalName`, `foundingDate`, `contactPoint`, `hasMap`, `knowsAbout`, `slogan`, `paymentAccepted`, `currenciesAccepted`, and `Place`-level `identifier`s (GBP CID). |

Reviews policy assessment:
- Site correctly avoids `aggregateRating`. Keep it. Self-serving reviews of an Organization/LocalBusiness are not eligible for review rich results under Google's policy, and a count drawn from the Google Business Profile cannot be verified on-page.
- Named on-page testimonials do exist (home widget: Mark Post, Edward Sherman; Mississauga/Office/Commercial/Process pages: Edward Sherman, Michael Katchen, Ping Lee, labelled "Google review, 5-6 years ago"). Could they carry `Review` markup legitimately? Technically yes as informational markup (real names, verbatim text, `itemReviewed` the Service, honest `author`). But: (a) they are third-party Google reviews quoted back, relative dates only ("5 years ago", no real date), (b) Review snippets for a business reviewing its own service are ineligible for stars, (c) Service is not a Review-snippet-supported type. Net: no rich result, small spam-policy risk, little GEO value. Recommendation: do not add Review markup now. If you want it later, only add per-review `Review` nodes with exact dates and `itemReviewed: {"@id": ".../#organization"}`, without any `aggregateRating`.
- Content gap noticed while checking: /reviews/ ("Testimonials") renders only the submission form in raw HTML, with no testimonials listed. Worth confirming that is not a JS-loading issue; an empty testimonial page is a UX/E-E-A-T gap.

## 3. Competitor comparison: Jan-Pro (jan-pro.com)

| Aspect | Evergreen | Jan-Pro |
|---|---|---|
| Home blocks | 1 `@graph` (CleaningService + WebSite) | 1 `@graph`: Organization, WebSite+SearchAction, ImageObject, WebPage, VideoObject (Yoast/SEO-plugin style) |
| Entity | LocalBusiness subtype with full NAP, geo, hours, areaServed, catalog | Generic Organization only (national franchisor; no address/phone/geo/hours) |
| logo | string URL | ImageObject with width/height/caption |
| sameAs | 3 | 4 (adds Instagram) |
| Dental/industry page | Service + 10 cities + FAQPage + BreadcrumbList (separate blocks, no WebPage) | Service (`#service`, serviceType, hasOfferCatalog with Offers having `url`s, mainEntityOfPage to `#webpage`), WebPage with real `datePublished`/`dateModified`, primaryImageOfPage, BreadcrumbList with `@id`, all in one `@graph`; areaServed = Country "United States" |
| FAQPage | Yes (now no SERP benefit) | None |
| Reviews/ratings | None | None |
| Weak spots | Dates not real, banner logo, name mismatch | HTML entities in names (`&amp;` literal in JSON `"JAN-PRO Cleaning &amp; Disinfecting"`: a bug), breadcrumb `position` as strings, country-wide areaServed, no local data |

Takeaways: Evergreen is ahead on local-business data (the thing that matters for a single-office GTA company) and is not behind on service markup. Borrow from Jan-Pro: (1) single `@graph` per page with WebPage node carrying real `datePublished`/`dateModified` and `primaryImageOfPage`; (2) `@id` on Service and BreadcrumbList; (3) `hasOfferCatalog` items with URLs; (4) logo as ImageObject. Do NOT copy the HTML-entity bug or string positions.

## 4. Missing opportunities (priority order)

1. BreadcrumbList on /services/, /locations/, /locations/mississauga/ (and any other city pages), /about-us/, /contact-us/, /reviews/, /request-a-quote/. Easy, safe, shows path in SERP.
2. Fix blog dates and add visible byline/dates + `Person` author.
3. Name consistency (`alternateName`) + `foundingDate: 1989` + `ImageObject` logo + corrected geo.
4. Page-level `@id`s on Service nodes, and tie `hasOfferCatalog` to them (entity graph).
5. `WebPage` subtypes: `AboutPage` (/about-us/), `ContactPage` (/contact-us/), `CollectionPage`/`ItemList` for /services/ and /locations/ linking to child Service nodes. Low SERP value, modest entity clarity.
6. `ContactPoint` (sales, +1-416-803-4880, `availableLanguage: en`, `areaServed: CA`).
7. `Service.audience` (BusinessAudience) to signal B2B; `Service.serviceOutput`/`termsOfService` not needed.
8. Optional: `Person` node for the owner/account executive if the site names them publicly.

Do NOT add: HowTo (deprecated), SpecialAnnouncement, aggregateRating, per-city LocalBusiness/`branchOf` nodes (no per-city offices), JobPosting (unless careers page), Product/Offer prices.

## 5. Ready-to-paste JSON-LD

Replace every `REPLACE_...` placeholder before publishing. Items not verifiable from the site are marked.

### 5a. Site-wide CleaningService (corrected/completed), output in a single `@graph` on every page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CleaningService",
      "@id": "https://www.evergreencleaningservice.ca/#organization",
      "name": "Evergreen Office Cleaning",
      "alternateName": ["Evergreen Cleaning Service", "Evergreen Cleaning Service Toronto"],
      "legalName": "REPLACE_LEGAL_ENTITY_NAME_IF_DIFFERENT",
      "url": "https://www.evergreencleaningservice.ca/",
      "description": "Office, commercial and industrial cleaning in Toronto and the GTA since 1989: after hours, by a consistent crew, with a free on-site walkthrough and a written proposal.",
      "slogan": "REPLACE_OR_DELETE",
      "foundingDate": "1989",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.evergreencleaningservice.ca/#logo",
        "url": "https://img.evergreencleaningservice.ca/images/REPLACE_SQUARE_LOGO.png",
        "contentUrl": "https://img.evergreencleaningservice.ca/images/REPLACE_SQUARE_LOGO.png",
        "width": 512,
        "height": 512
      },
      "image": [
        "https://img.evergreencleaningservice.ca/images/evergreen-modern-commercial-cleaning-hero-og.jpg",
        "https://img.evergreencleaningservice.ca/images/cropped-evergreen-cleaning-toronto-logo-banner.jpg"
      ],
      "telephone": "+1-416-803-4880",
      "email": "info@evergreencleaningservice.ca",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "243 Queen St W",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "postalCode": "M5V 1Z4",
        "addressCountry": "CA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "REPLACE_FROM_GOOGLE_MAPS_PIN",
        "longitude": "REPLACE_FROM_GOOGLE_MAPS_PIN"
      },
      "hasMap": "REPLACE_GOOGLE_MAPS_SHARE_URL",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "07:00",
          "closes": "22:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday", "Sunday"],
          "opens": "08:00",
          "closes": "20:00"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "telephone": "+1-416-803-4880",
        "email": "info@evergreencleaningservice.ca",
        "areaServed": "CA",
        "availableLanguage": ["en"]
      },
      "areaServed": [
        {"@type": "City", "name": "Toronto", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Mississauga", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Brampton", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Oakville", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Vaughan", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Markham", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Richmond Hill", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Pickering", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Ajax", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}},
        {"@type": "City", "name": "Oshawa", "containedInPlace": {"@type": "AdministrativeArea", "name": "Ontario"}}
      ],
      "knowsAbout": ["Office cleaning", "Commercial cleaning", "Janitorial services", "Post-construction cleaning", "Medical and dental clinic cleaning", "Floor care"],
      "sameAs": [
        "https://www.facebook.com/Evergreen-Cleaning-Service-104007224426820",
        "https://twitter.com/EvergreenClean8/",
        "https://www.linkedin.com/company/evergreen-cleaning-service-toronto/",
        "REPLACE_GOOGLE_BUSINESS_PROFILE_URL_IF_ANY",
        "REPLACE_OTHER_VERIFIED_PROFILES_OR_DELETE"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Commercial Cleaning Services",
        "itemListElement": [
          {"@type": "Offer", "itemOffered": {"@type": "Service", "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#service", "name": "Office Cleaning & Janitorial", "url": "https://www.evergreencleaningservice.ca/services/office-cleaning/"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "@id": "https://www.evergreencleaningservice.ca/services/commercial-cleaning/#service", "name": "Commercial Cleaning", "url": "https://www.evergreencleaningservice.ca/services/commercial-cleaning/"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "@id": "https://www.evergreencleaningservice.ca/services/post-construction-cleaning/#service", "name": "Post-Construction Cleaning", "url": "https://www.evergreencleaningservice.ca/services/post-construction-cleaning/"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Building Maintenance & Floor Care", "url": "REPLACE_WITH_REAL_PAGE_URL_OR_DELETE_URL"}}
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.evergreencleaningservice.ca/#website",
      "url": "https://www.evergreencleaningservice.ca/",
      "name": "Evergreen Office Cleaning",
      "alternateName": "Evergreen Cleaning Service",
      "inLanguage": "en-CA",
      "publisher": {"@id": "https://www.evergreencleaningservice.ca/#organization"}
    }
  ]
}
```
Notes: SearchAction removed (no Google benefit; keep if the site search matters to you). The "Industrial & Warehouse Floor Scrubbing" offer was dropped because no matching page was in the audited set: re-add with a real URL if one exists. If you do not want to maintain `@id`s that point at `#service` fragments, those on the service pages must exist (see 5b).

### 5b. Service page (Service + BreadcrumbList + FAQPage), example /services/office-cleaning/

FAQPage is retained only because it already exists and mirrors visible text. No Google SERP benefit since 2026-05-07; do not extend it for SERP reasons.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#breadcrumb",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.evergreencleaningservice.ca/"},
        {"@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.evergreencleaningservice.ca/services/"},
        {"@type": "ListItem", "position": 3, "name": "Office Cleaning", "item": "https://www.evergreencleaningservice.ca/services/office-cleaning/"}
      ]
    },
    {
      "@type": "Service",
      "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#service",
      "name": "Office Cleaning",
      "serviceType": "Office cleaning",
      "description": "Recurring office cleaning in Toronto and the GTA: after hours, by a consistent crew, with a free on-site walkthrough and a written proposal.",
      "url": "https://www.evergreencleaningservice.ca/services/office-cleaning/",
      "mainEntityOfPage": {"@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#webpage"},
      "provider": {"@id": "https://www.evergreencleaningservice.ca/#organization"},
      "audience": {"@type": "BusinessAudience", "audienceType": "Businesses, property managers and multi-tenant buildings"},
      "areaServed": {"@id": "https://www.evergreencleaningservice.ca/#organization"},
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://www.evergreencleaningservice.ca/request-a-quote/",
        "servicePhone": {"@type": "ContactPoint", "telephone": "+1-416-803-4880", "contactType": "sales"}
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#webpage",
      "url": "https://www.evergreencleaningservice.ca/services/office-cleaning/",
      "name": "Office Cleaning in Toronto & the GTA",
      "isPartOf": {"@id": "https://www.evergreencleaningservice.ca/#website"},
      "breadcrumb": {"@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#breadcrumb"},
      "about": {"@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#service"},
      "dateModified": "REPLACE_REAL_ISO8601_E.G._2026-10-28T09:00:00-04:00",
      "inLanguage": "en-CA"
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#faq",
      "mainEntityOfPage": {"@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#webpage"},
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How often should our office be cleaned?",
          "acceptedAnswer": {"@type": "Answer", "text": "It depends on how many people use the space and how it is used. Busy offices are usually cleaned every weeknight; smaller or quieter offices a few evenings a week or weekly. We recommend a frequency at the walkthrough and put it in writing, and it can be changed later through your account executive."}
        },
        {
          "@type": "Question",
          "name": "Do you clean after hours?",
          "acceptedAnswer": {"@type": "Answer", "text": "Yes. Office cleaning is normally done in the evening or overnight after staff leave, or at weekends, so nobody has to work around the crew."}
        }
      ]
    }
  ]
}
```
(Keep the remaining 5 existing Q/A pairs verbatim from the page; the first two are shown for brevity. Answers must always match visible text.) Here `areaServed` references the site-wide node, so the 10-city list lives in one place. If you prefer Google-visible redundancy, keep the 10 `City` objects inline as today.

### 5c. Location page (Service with areaServed + BreadcrumbList), /locations/mississauga/

No per-city LocalBusiness: there is no Mississauga office (the page's own FAQ says so).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.evergreencleaningservice.ca/locations/mississauga/#breadcrumb",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.evergreencleaningservice.ca/"},
        {"@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://www.evergreencleaningservice.ca/locations/"},
        {"@type": "ListItem", "position": 3, "name": "Mississauga", "item": "https://www.evergreencleaningservice.ca/locations/mississauga/"}
      ]
    },
    {
      "@type": "Service",
      "@id": "https://www.evergreencleaningservice.ca/locations/mississauga/#service",
      "name": "Commercial Cleaning in Mississauga",
      "serviceType": "Commercial cleaning",
      "description": "Commercial cleaning and office janitorial services in Mississauga and the Airport Corporate Centre. Bonded, WSIB and liability insured. Request a quote.",
      "url": "https://www.evergreencleaningservice.ca/locations/mississauga/",
      "provider": {"@id": "https://www.evergreencleaningservice.ca/#organization"},
      "audience": {"@type": "BusinessAudience", "audienceType": "Businesses and property managers"},
      "areaServed": [
        {
          "@type": "City",
          "name": "Mississauga",
          "sameAs": "REPLACE_WIKIDATA_OR_WIKIPEDIA_URL_FOR_MISSISSAUGA",
          "containedInPlace": {"@type": "AdministrativeArea", "name": "Peel Region, Ontario"}
        }
      ],
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://www.evergreencleaningservice.ca/request-a-quote/",
        "servicePhone": {"@type": "ContactPoint", "telephone": "+1-416-803-4880", "contactType": "sales"}
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.evergreencleaningservice.ca/locations/mississauga/#webpage",
      "url": "https://www.evergreencleaningservice.ca/locations/mississauga/",
      "isPartOf": {"@id": "https://www.evergreencleaningservice.ca/#website"},
      "breadcrumb": {"@id": "https://www.evergreencleaningservice.ca/locations/mississauga/#breadcrumb"},
      "about": {"@id": "https://www.evergreencleaningservice.ca/locations/mississauga/#service"},
      "inLanguage": "en-CA"
    }
  ]
}
```
Keep the existing Mississauga FAQPage block as is (matches visible FAQ). Clone this pattern for every other city page (Brampton, Oakville, Vaughan/Concord, Markham, etc. as listed in the site nav). On /locations/ add the same BreadcrumbList (2 levels) plus optional `ItemList` of the city pages.

### 5d. Blog post (BlogPosting), example /cleaning-check-list-dental-clinics/

Dates below are the CMS-derived dates with the placeholder time removed; replace with the true publish/modify timestamps and show them on the page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/#article",
      "mainEntityOfPage": {"@id": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/#webpage"},
      "headline": "Cleaning Check List for Dental Clinics",
      "description": "Patients expect a neat and safe environment. So, you should definitely not make any compromises when it comes to your dental office's cleanliness.",
      "image": ["https://img.evergreencleaningservice.ca/images/blog-dental-clinic-cleaning-checklist-feature.jpg"],
      "datePublished": "2020-04-29T09:00:00-04:00",
      "dateModified": "REPLACE_REAL_LAST_EDIT_E.G._2026-10-28T09:00:00-04:00",
      "author": {
        "@type": "Person",
        "@id": "https://www.evergreencleaningservice.ca/about-us/#REPLACE_AUTHOR_SLUG",
        "name": "REPLACE_AUTHOR_NAME",
        "url": "https://www.evergreencleaningservice.ca/about-us/",
        "worksFor": {"@id": "https://www.evergreencleaningservice.ca/#organization"}
      },
      "publisher": {"@id": "https://www.evergreencleaningservice.ca/#organization"},
      "isPartOf": {"@id": "https://www.evergreencleaningservice.ca/#website"},
      "about": {"@type": "Thing", "name": "Dental clinic cleaning"},
      "inLanguage": "en-CA"
    },
    {
      "@type": "WebPage",
      "@id": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/#webpage",
      "url": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/",
      "name": "Cleaning Check List for Dental Clinics",
      "isPartOf": {"@id": "https://www.evergreencleaningservice.ca/#website"},
      "breadcrumb": {"@id": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/#breadcrumb"},
      "primaryImageOfPage": {"@type": "ImageObject", "url": "https://img.evergreencleaningservice.ca/images/blog-dental-clinic-cleaning-checklist-feature.jpg"}
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/#breadcrumb",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.evergreencleaningservice.ca/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.evergreencleaningservice.ca/insights/"},
        {"@type": "ListItem", "position": 3, "name": "Cleaning Check List for Dental Clinics", "item": "https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/"}
      ]
    }
  ]
}
```
If no named author is acceptable, keep `"author": {"@id": ".../#organization"}` (valid) and correct the dates only. Do not invent an author.

## 6. Score: 74 / 100

| Component | Max | Score | Reasoning |
|---|---|---|---|
| Local entity completeness (NAP, geo, hours, areaServed, catalog, sameAs) | 25 | 21 | Strong. Loses for banner-as-logo string, approximated geo, no foundingDate/alternateName/contactPoint |
| Validity and linking (parse, @id graph, absolute URLs, formats) | 20 | 18 | All 38 blocks parse, consistent `@id` references, no duplicate Organization. Minor: page-level nodes lack `@id`, duplicated city list |
| Page-type coverage | 20 | 13 | Service, industry, process, blog, collection covered. BreadcrumbList missing on 7 templates; Service on /services/ hub and city pages other than Mississauga unknown; no About/Contact page types |
| Content accuracy / eligibility | 15 | 10 | Dates are CMS placeholders (T00:00:00.000Z, modified = published) and not visible on page; name mismatch with site alt text/social; no spam-risk markup |
| Policy compliance / forward-looking | 10 | 9 | No aggregateRating, no deprecated types, FAQPage correctly treated as legacy |
| Rich-result relevance | 10 | 3 | Few rich-result types apply to this niche; breadcrumbs and logo/org are the only live ones, and breadcrumbs are partly missing |
| Total | 100 | 74 | |

Fix the blog dates, add breadcrumbs everywhere, and normalise the name/logo/geo and this is a 85-90 site.

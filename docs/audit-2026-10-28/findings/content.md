# Content Quality & E-E-A-T Audit: evergreencleaningservice.ca

- **Date:** 2026-10-28
- **Scope:** all 73 URLs in `/sitemap-0.xml` (all returned HTTP 200, Astro static build, no SPA rendering needed), plus 3 Jan-Pro benchmark pages.
- **Method:** HTML fetched with curl into `raw/content/pages/` and `raw/content/janpro/`. Parsed with BeautifulSoup.
  - Main content is `<main>` minus breadcrumbs, sidebar, comment form, quote-form aside and chat widget. For blog posts, prose is `article.entry-content`.
  - Readability is the Flesch-Kincaid grade on p/li/summary text, using a heuristic syllable counter.
  - "Unique words" are tokens not covered by any 6-word shingle that also appears on another sitewide page. For location pages, city names are normalized to a placeholder first, so find-and-replace templating counts as duplicate.
  - Scripts are in `scripts/content/` (`extract.py`, `dup.py`, `table.py`).
- **Business context:** B2B commercial and office cleaning, one office at 243 Queen St W, Toronto. In business since 1989. Serves the GTA.

## 1. Summary

**Content Quality score: 43/100.** E-E-A-T is 41/100 and AI-citation readiness is 45/100.

The site has two layers:

1. **A recently rebuilt commercial core: good.**
   - Pages: home, `/services/office-cleaning/`, `/services/commercial-cleaning/`, `/services/building-maintenance/`, `/services/post-construction-cleaning/`, the 2 industry pages and `/our-process/`.
   - These pages match intent and are readable (grade 7.7-8.6). They include "who it is for", inclusions, explicit scope and limits, "what affects the price" lists, and 3-7 FAQs with FAQPage schema.
   - On structure and buyer usefulness, they match or beat the Jan-Pro equivalents. Jan-Pro's dental and office pages have no FAQ and no price-factor section.
2. **Everything around that core: legacy or templated, with weak proof.**
   - 7 location pages are 94-97% boilerplate (Mississauga and Vaughan about 72%).
   - 5 service pages are legacy copy. Disinfection is still a COVID page with typos. Emergency and industrial contradict the stated service area.
   - The about page is 170 words with no people. `/reviews/` contains no reviews.
   - All visible imagery appears AI-generated, including a "Cleaning Demo Gallery" captioned as results.
   - The blog (38 posts):
     - Last published 2023-03-31.
     - Shows no dates or bylines.
     - Averages 679 words and contains zero lists.
     - 26 of 38 posts never link to a service, industry or location page.
     - 9 posts are COVID-era.

The fastest gains are trust and proof fixes, not more pages:

- named people
- real photos
- reviews on `/reviews/`
- dated, attributed posts
- removing the competitor link
- rewriting the disinfection page

After that:

- consolidate the blog
- either differentiate or reduce the location pages
- add the industry and service pages a Toronto buyer expects (see section 6)

### Templated metadata check (`metadata_template.py`, 73 title/description pairs)

- `site_risk`: **low**
- `templated_ratio`: **0.0** (0 templated)
- `shared_cta_phrases`: **none**
- No duplicate titles or descriptions.
- Secondary flags only:
  - `brand_suffix_in_description`: 7 (`/insights/` pages 1-4, `/our-process/`, `/reviews/`, `/search/`)
  - `description_echoes_title`: 2 (`/office-cleaning-fall/`, `/services/emergency-cleaning/`)
- Metadata is hand-written and is not a problem. The duplication problem is in the body copy (location and service blocks), not in the metadata.

## 2. Per-page table

Column definitions:

- **Words:** main-content words.
- **Unique:** words not shared with any other page (city-normalized for locations).
- **Grade:** Flesch-Kincaid grade.
- **Date:** JSON-LD `datePublished`. It is never shown on the page, and `dateModified` equals `datePublished` on every post.
- **Thin:** fewer than 300 unique words.

| URL | Type | Words | Unique | Grade | Date | Thin? | Notes |
|---|---|---|---|---|---|---|---|
| / | home | 1244 | 493 | 8.6 | - | no | Strong hub: H1 matches intent, trust strip, process, 4 Google reviews (all "5-6 years ago"), 3 testimonials with no company names. AI-generated hero image. 59% of copy is shared with other templates. |
| /how-to-decide-on-a-cleaning-company/ | blog | 405 | 362 | 8.5 | 2019-12-07 | no | Oldest post (2019), 400 words, buyer-intent topic. Rewrite as a Toronto buyer checklist. No deep link to a service or industry page (only /services/ hub). |
| /control-allergies-workplace-with-professional-janitorial-services/ | blog | 843 | 793 | 9.9 | 2020-01-10 | no | No H2 (jumps H1 to H3). |
| /workplace-cleaning-checklist-winter/ | blog | 884 | 841 | 8.8 | 2020-02-24 | no | No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /be-safe-from-coronavirus-work/ | blog | 888 | 820 | 8.8 | 2020-03-31 | no | COVID-era. No deep link to a service or industry page. |
| /cleaning-check-list-dental-clinics/ | blog | 894 | 851 | 7.8 | 2020-04-29 | no | Checklist with no list markup. Aimed at clinic owners (exterior, landscaping), not IPAC. Links wikihow and does not link /industries/medical-dental-clinics/. No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /clean-and-disinfect-public-areas-during-covid-19/ | blog | 468 | 424 | 10.3 | 2020-05-27 | no | COVID-era. No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /coronavirus-bringing-more-urgency-cleaning/ | blog | 648 | 607 | 12.8 | 2020-06-30 | no | COVID-era. No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /qualities-top-cleaning-professionals/ | blog | 537 | 499 | 10.8 | 2020-07-31 | no | No H2 (jumps H1 to H3). |
| /commercial-cleaning-air-quality/ | blog | 825 | 776 | 9.1 | 2020-08-31 | no | No deep link to a service or industry page. |
| /cleaning-protocols-for-daycares-and-schools/ | blog | 592 | 560 | 13.3 | 2020-09-29 | no | COVID-era. |
| /how-to-properly-dust-office-building/ | blog | 1020 | 973 | 9.2 | 2020-10-31 | no | No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /5-cleaning-products-you-should-have-in-your-office/ | blog | 509 | 456 | 8.1 | 2020-11-30 | no | No deep link to a service or industry page. |
| /does-hand-sanitization-actually-help-prevent-illnesses/ | blog | 589 | 546 | 9.4 | 2021-01-31 | no | COVID-era. No deep link to a service or industry page. |
| /keep-your-office-at-home-clean/ | blog | 502 | 462 | 7.7 | 2021-02-26 | no | COVID-era. Work-from-home consumer topic, off-intent. No deep link to a service or industry page. |
| /preventing-slips-trips-falls-in-your-workplace/ | blog | 592 | 534 | 9.2 | 2021-03-31 | no |  |
| /the-return-of-employees-post-covid-19-is-your-office-ready/ | blog | 621 | 584 | 11.7 | 2021-04-29 | no | COVID-era. No deep link to a service or industry page (only /services/ hub). No H2 (jumps H1 to H3). |
| /day-night-which-is-the-best-routine-for-your-office/ | blog | 806 | 754 | 8.9 | 2021-05-31 | no | No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /how-to-take-care-of-plants-in-the-office/ | blog | 454 | 389 | 8.5 | 2021-06-30 | no | Off-topic for a B2B cleaner. No deep link to a service or industry page. |
| /6-common-cleaning-products-that-you-should-never-mix-together/ | blog | 598 | 535 | 7.6 | 2021-07-30 | no | No deep link to a service or industry page. |
| /end-of-summer-cleaning/ | blog | 384 | 328 | 10.1 | 2021-08-25 | no | No deep link to a service or industry page. |
| /key-office-areas-to-have-cleaned-and-disinfected/ | blog | 386 | 338 | 10.1 | 2021-09-30 | no | COVID-era. No deep link to a service or industry page. |
| /areas-in-your-office-where-germs-are-likely-hiding/ | blog | 795 | 743 | 9.0 | 2021-10-28 | no | No deep link to a service or industry page (only /services/ hub). |
| /5-easy-ways-to-keep-your-commercial-floor-clean/ | blog | 690 | 658 | 9.7 | 2021-11-24 | no | No deep link to a service or industry page (only /services/ hub). |
| /covid-19-commercial-cleaning-expectations-examined/ | blog | 588 | 550 | 11.5 | 2022-01-18 | no | COVID-era. No deep link to a service or industry page (only /services/ hub). |
| /how-to-keep-your-office-fridge-clean/ | blog | 486 | 441 | 9.5 | 2022-02-25 | no | No deep link to a service or industry page. No H2 (jumps H1 to H3). |
| /tips-tricks-for-spring-cleaning-your-office/ | blog | 655 | 594 | 8.5 | 2022-03-23 | no | No deep link to a service or industry page (only /services/ hub). |
| /benefits-of-commercial-deep-cleaning-services/ | blog | 523 | 472 | 10.0 | 2022-04-26 | no | No deep link to a service or industry page. |
| /5-tips-for-maintaining-clean-office-air/ | blog | 535 | 506 | 8.9 | 2022-05-25 | no | No deep link to a service or industry page. |
| /5-cleaning-tips-to-help-make-your-office-relocation-seamless/ | blog | 785 | 740 | 8.8 | 2022-06-29 | no | No deep link to a service or industry page. |
| /importance-of-hand-washing/ | blog | 646 | 601 | 7.4 | 2022-08-02 | no | No deep link to a service or industry page. |
| /benefits-of-regular-commercial-cleaning-services/ | blog | 498 | 463 | 11.6 | 2022-08-31 | no | No deep link to a service or industry page (only /services/ hub). |
| /office-cleaning-fall/ | blog | 540 | 506 | 7.8 | 2022-09-30 | no | No deep link to a service or industry page. |
| /a-cleaning-checklist-for-your-retail-store/ | blog | 534 | 466 | 6.2 | 2022-10-27 | no | No deep link to a service or industry page (only /services/ hub). |
| /commercial-cleaning-techniques-to-avoid/ | blog | 1119 | 1088 | 6.7 | 2022-11-30 | no | No deep link to a service or industry page. |
| /modern-vs-old-fashioned-cleaning-methods/ | blog | 879 | 839 | 9.7 | 2022-12-07 | no | No deep link to a service or industry page. |
| /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ | blog | 1197 | 1155 | 11.1 | 2023-01-31 | no | Readable but generic. No Evergreen equipment or experience. No deep link to a service or industry page. |
| /office-layout-tips-to-make-cleaning-easier-and-faster/ | blog | 1192 | 1148 | 8.3 | 2023-02-07 | no | No deep link to a service or industry page. |
| /ask-the-office-cleaners-cleaning-break-rooms/ | blog | 962 | 918 | 9.2 | 2023-03-31 | no | Links to competitor greencleanofficemaintenance.com with anchor "Toronto office cleaners" (followed). Remove. Best first-person voice on the blog. No deep link to a service or industry page. |
| /insights/ | blog-index | 390 | 2 | 9.4 | - | yes (utility) | Paginated archive. No dates shown on cards. |
| /insights/page/2/ | blog-index | 400 | 3 | 8.7 | - | yes (utility) | Paginated archive. No dates shown on cards. |
| /insights/page/3/ | blog-index | 409 | 3 | 8.1 | - | yes (utility) | Paginated archive. No dates shown on cards. |
| /insights/page/4/ | blog-index | 315 | 3 | 8.7 | - | yes (utility) | Paginated archive. No dates shown on cards. |
| /industries/medical-dental-clinics/ | industry | 903 | 486 | 7.7 | - | no | Good: clinic types, scope limits (sterilization and sharps excluded), 4 FAQs, price factors. Not linked from the dental blog post. |
| /industries/property-management/ | industry | 872 | 399 | 8.3 | - | no | Good structure, 4 FAQs. Overlaps building-maintenance (TF-IDF 0.58). |
| /industries/ | industry-hub | 311 | 104 | 9.8 | - | yes | Hub lists 7 segments, but only 2 have pages. Others are bullet lists only. |
| /locations/brampton/ | location | 691 | 39 | 8.3 | - | yes | 6% unique after city-name normalization. Doorway-pattern risk. H1 includes '\| Evergreen Office Cleaning'. |
| /locations/etobicoke/ | location | 670 | 38 | 8.3 | - | yes | 6% unique after city-name normalization. Doorway-pattern risk. H1 includes '\| Evergreen Office Cleaning'. |
| /locations/markham/ | location | 687 | 38 | 8.3 | - | yes | 5% unique after city-name normalization. Doorway-pattern risk. H1 includes '\| Evergreen Office Cleaning'. |
| /locations/mississauga/ | location | 765 | 206 | 10.2 | - | yes | More unique copy (Hurontario, Airport Corporate Centre, Meadowvale). Unsupported "certified" and "health-grade" claims. |
| /locations/oakville/ | location | 690 | 30 | 8.5 | - | yes | 4% unique after city-name normalization. Doorway-pattern risk. H1 includes '\| Evergreen Office Cleaning'. |
| /locations/toronto-downtown/ | location | 686 | 42 | 8.3 | - | yes | 6% unique after city-name normalization. Doorway-pattern risk. H1 includes '\| Evergreen Office Cleaning'. |
| /locations/vaughan/ | location | 763 | 209 | 9.8 | - | yes | More unique copy (Concord, distribution centres). |
| /locations/ | location-hub | 193 | 46 | 12.5 | - | yes | Hub. Honest single-office statement. Lists 10 cities, 7 with pages. |
| /about-us/ | page | 172 | 148 | 11.7 | - | yes | Thin. No owner/founder name (reviews mention "Art"), no team, no photos, no WSIB/insurance evidence, no history beyond "since 1989". Weakest E-E-A-T page. |
| /cleaning-demo-gallery/ | page | 3 | 3 | - | - | yes | 13 images, 3 words. Images appear AI-generated but alt text calls them "cleaning results". Meta has typos ("smalling", "chorome"). |
| /green-clean-products/ | page | 195 | 197 | 11.3 | - | yes | Thin, supplier brochure copy. Dated ("46 years", "April of 2013"). No Evergreen-specific usage detail. |
| /our-process/ | page | 755 | 241 | 8.5 | - | yes | Good: walkthrough, proposal, account executive, quality controls, 4 FAQs. Largely reused blocks. |
| /services/building-maintenance/ | service | 968 | 442 | 8.3 | - | no | Rebuilt template, 3 FAQs (strip/wax frequency is a good expertise signal). Nav label says "Property Management and Building Maintenance". |
| /services/commercial-cleaning/ | service | 1058 | 439 | 7.7 | - | no | Rebuilt template, 5 FAQs and price factors. 41% unique. |
| /services/disinfection-cleaning/ | service | 587 | 482 | 8.3 | - | no | Legacy COVID copy ("Are You Concerned About Covid-19", "go back to the office after the Coronavirus crisis"). Typos "psychically", "everything is clean with". No FAQ. H1 is the bare "Disinfection Cleaning". |
| /services/emergency-cleaning/ | service | 457 | 310 | 10.6 | - | no | Legacy. Lists 22 service areas (Brock, Scugog, Clarington, King...) that contradict the 10-city list in schema and /locations/. Lists airports, casinos, hospitals. No FAQ or response-time specifics. |
| /services/graffiti-removal/ | service | 310 | 167 | 8.2 | - | yes | Thin (about 170 unique words) but specific (Toronto graffiti by-law, surface-matched methods). No FAQ. |
| /services/industrial-cleaning/ | service | 459 | 234 | 9.6 | - | yes | Legacy. "Industrial cleaning to" lists retail, banks, golf clubs, campgrounds (intent mismatch). Broken list item ("General"). Thin unique copy. |
| /services/office-cleaning/ | service | 1259 | 629 | 8.3 | - | no | Best page. Who it is for, inclusions, scope/limits, price factors (no figures), 7 FAQs plus FAQPage. About 50% shared blocks. |
| /services/post-construction-cleaning/ | service | 606 | 452 | 7.0 | - | no | Rebuilt, good scope limits, 4 FAQs. |
| /services/pressure-washing/ | service | 328 | 200 | 7.4 | - | yes | Thin (about 200 unique words) but specific. No FAQ. |
| /services/ | service-hub | 284 | 178 | 11.8 | - | yes | Hub. Cards only. No intro or comparison guidance. |
| /contact-us/ | utility | 23 | 15 | 8.4 | - | yes (utility) | NAP present (243 Queen St W, phone, email). Utility page, thin is acceptable. |
| /privacy/ | utility | 590 | 599 | 9.7 | - | no | Utility. |
| /request-a-quote/ | utility | 78 | 61 | 6.6 | - | yes (utility) | Utility. Good reassurance bullets (WSIB, no obligation). Thin is acceptable. |
| /reviews/ | utility | 35 | 33 | 4.1 | - | yes (utility) | Titled "Testimonials" and meta promises "real Google reviews", but the page has only a submission form and zero reviews. Mismatches its own description. |
| /search/ | utility | 1 | 1 | - | - | yes (utility) | Internal search page in sitemap and indexable. Remove from sitemap and noindex. |

### Aggregates

| Group | n | Mean words | Mean unique | Mean grade | Thin (<300 unique) |
|---|---|---|---|---|---|
| Home | 1 | 1,244 | 493 | 8.6 | 0 |
| Service pages | 9 | 670 | 373 | 8.4 | 3 (graffiti 167, pressure washing 200, industrial 234). Emergency is 310, borderline. |
| Industry pages | 2 | 888 | 442 | 8.0 | 0 |
| Location pages | 7 | 707 | 86 | 8.8 | **7 of 7** |
| Blog posts | 38 | 686 (article 679) | 640 | 9.3 (range 6.2-13.3) | 0, but **38 of 38 are under 1,500 words** (max 1,189) |
| Hubs (services, industries, locations, insights) | 7 | 330 | 75 | 9.6 | 7 (normal for hubs) |
| About, green, gallery, demo | 4 | 281 | 147 | 10.5 | 4 |

Readability is not a problem anywhere. Grade 8-9 is right for facility and office managers. Only `/cleaning-protocols-for-daycares-and-schools/` (13.3), `/coronavirus-bringing-more-urgency-cleaning/` (12.8) and `/locations/` (12.5) read heavily.

### Title / H1 / intent match

- **Core service and industry pages:** good. Title and H1 both target "[service] in Toronto & the GTA".
- **Legacy service pages:** H1 is a bare label ("Disinfection Cleaning", "Industrial Cleaning", "Pressure Washing", "Graffiti Removal") while the title adds "Toronto". Add the geo modifier to the H1.
- **Location pages:** the H1 contains the brand suffix "Commercial Cleaning in Brampton | Evergreen Office Cleaning". That is a title-tag string reused as the H1. Drop "| Evergreen Office Cleaning".
- **`/industries/`:** H1 is "Who we clean for". **`/insights/`:** H1 is "News" and the title is "News - ...". "Commercial Cleaning Insights" or "Office Cleaning Guides" would match the URL and intent.
- **`/reviews/`:** title, H1 and description promise reviews, but the page delivers a submission form. This is an intent mismatch.
- **`/services/industrial-cleaning/`:** the intent is industrial and warehouse, but the body lists retail, banks, golf clubs, campgrounds and casinos.
- **Blog posts:** title equals H1 on all 38. 10 posts have no H2 and jump from H1 to H3.

## 3. E-E-A-T assessment

The weights below are this skill's internal model. Google publishes no numeric E-E-A-T weights.

| Factor | Weight | Score | Evidence |
|---|---|---|---|
| Experience | 20% | **30** | **Positives:** rebuilt pages carry real operational detail (consistent crew, key holding, scope limits such as "sterilization and sharps stay with clinical staff", strip-and-wax frequency FAQ). The location FAQs honestly answer "We do not have an office in Brampton". **Negatives:** no project photos. Every sampled image (hero, gallery, dental, night-crew, condo lobby, blog features) shows AI-generation tells: the same uniformed pair recurs, the CN Tower is behind every interior, and a "cleaner" wears clinical scrubs while wiping a dental light. Metadata is stripped, so this is a visual judgement. No case studies, no before/after photos, no client names or logos. Blog posts contain zero quantified facts and almost no "we've seen" or "a client of ours" signals. |
| Expertise | 25% | **40** | **Positives:** service copy shows competent janitorial knowledge (clean-then-disinfect, surface-matched graffiti removal, Toronto graffiti by-law, carpet extraction and strip/wax cadence). **Negatives:** no author on any page; BlogPosting `author` is the Organization. No staff credentials or training (e.g. WHMIS 2015, IPAC). Blog health and safety posts cite the US CDC/EPA, Wikipedia, WikiHow, Healthline and WebMD rather than Health Canada, PHAC, Public Health Ontario or RCDSO. Factual and copy errors on a money page ("psychically remove dirt", "everything is clean with plain detergent"). The dental checklist covers landscaping and signage, not infection-prevention scope. |
| Authoritativeness | 25% | **35** | **Positives:** 37 years in business ("since 1989") is a strong, rare claim that is repeated consistently. Real LinkedIn, Facebook and X profiles appear in `sameAs`. **Negatives:** no associations (e.g. ISSA, BOMA Toronto, CSBM), awards, press or client logos. The 4 Google reviews shown are all "5-6 years ago". The 3 homepage testimonials give names and roles only ("Founder & CEO") with no company. The break-room post links out to a Toronto competitor with a keyword anchor. Very few owned resources are linkable. |
| Trustworthiness | 30% | **55** | **Positives:** full NAP and hours, consistent with the `CleaningService` schema. Privacy page. "WSIB covered, bonded and insured" and background screening are repeated on every money page. "No obligation" and honest scope-and-limits sections. Single-office transparency on the location pages. **Negatives:** WSIB, bonding and insurance are asserted but never evidenced (no clearance certificate, insurer or coverage amount). `/reviews/` has no reviews. AI images are presented as "cleaning results". Service-area claims conflict (10 cities in schema and `/locations/` vs 22 incl. Brock, Scugog, Clarington, King and Caledon on `/services/emergency-cleaning/`). Unsupported "certified" and "health-grade sanitization" claims on Mississauga. Live COVID copy on a service page. No pricing figures anywhere. |
| **Weighted E-E-A-T** | | **41/100** | |

### Specific trust and E-E-A-T fixes (priority order)

1. **About page: rebuild to 600-900 words.**
   - Name the owner. Reviews refer to "Art", but the site never says who he is.
   - Add the operations lead and account executives with photos, and the company history 1989 to today.
   - Give numbers you can verify (buildings under contract, average client tenure, crew size).
   - Link the WSIB clearance-certificate process, state the insurer and liability limit, and describe bonding.
   - Add `Person` and `AboutPage` schema.
2. **`/reviews/`:** embed the actual Google reviews, with dates, plus the testimonials with company names (with permission). Keep the form below them. Request new reviews: the newest shown are about 5 years old.
3. **Replace AI imagery** with real crew and site photos, at minimum on the home hero, the gallery and the clinic page. If any AI image stays, do not caption it as "results". Retitle or remove `/cleaning-demo-gallery/` until real photos exist.
4. **Blog attribution:**
   - Add a visible publish date and a "last reviewed" date.
   - Add a named author with a short bio (owner or operations manager).
   - Set `author` to a `Person` in BlogPosting.
5. **Remove the competitor link** in `/ask-the-office-cleaners-cleaning-break-rooms/` (`https://www.greencleanofficemaintenance.com/`, anchor "Toronto office cleaners").
6. **Make the service-area list consistent everywhere.** Use the 10 cities in schema. Strip the 22-place list from the emergency page.
7. **Back claims or remove them.** "Certified" (certified to what?) and "health-grade" on Mississauga. "Airports, Casinos, Hotels" and "Hospitals" on the legacy pages, unless there are references.

## 4. Thin, duplicate and outdated lists

### Thin (<300 unique words, excluding legitimate utility pages)

- `/locations/brampton/` (39), `/locations/etobicoke/` (38), `/locations/markham/` (38), `/locations/oakville/` (30), `/locations/toronto-downtown/` (42). Near-pure city swaps.
- `/locations/mississauga/` (206), `/locations/vaughan/` (209). Partly differentiated.
- `/services/graffiti-removal/` (167), `/services/pressure-washing/` (200), `/services/industrial-cleaning/` (234). `/services/emergency-cleaning/` (310) is borderline.
- `/about-us/` (148), `/green-clean-products/` (197), `/cleaning-demo-gallery/` (3), `/reviews/` (33).
- Hubs: `/services/` (178), `/industries/` (104), `/locations/` (46). These need a 100-200 word intro and selection guidance, not a long article.
- `/search/` is indexable and listed in the sitemap. Remove it from the sitemap and add noindex.

### Duplicate and boilerplate

**Location template.** Pairwise 6-gram Jaccard after city-normalization:

- Brampton, Markham and Oakville: 0.88 with each other.
- Etobicoke and Downtown: 0.86.
- Every other pair: 0.52-0.77.

Shared blocks on every location page:

- "How it works" (5 steps, 137 words)
- the same 3 review quotes (about 156 words)
- 2 of the 4 FAQs ("How do I get a quote?", "Can cleaning be done after hours?")
- the services list
- the quote band

The only city-specific content is one facility-type sentence, an "office in X?" FAQ and the H1. This fits the scaled, near-duplicate location-page pattern.

Options:

- (a) **Make each page earn its place.** Add 250-400 words of genuinely local substance: named business districts or corridors, building types actually served there, a local client quote, response logistics from Queen St W, a local photo, and a local project. Mississauga and Vaughan show the start of this.
- (b) **Consolidate.** Fold the five near-identical pages into `/locations/` with anchored sections, and 301 them.

Do not add pages for the remaining areaServed cities (North York, Scarborough, Richmond Hill, Pickering, Ajax, Oshawa) on the current template.

**Service and industry template.** The shared blocks are:

- trust strip (56 words)
- "How it works" (137 words)
- "What affects the price" bullets (about 72 words)
- "Where we work" (49 words)
- quote band

Repeated block counts sitewide:

- 14 pages: "Serving Toronto since 1989", "WSIB covered, bonded and insured" and the 5 process steps.
- 21 pages: the hours line.
- 12 and 10 pages: the review quotes "I'm in the property management business..." and "I highly recommend Art...".

Core service pages are 41-50% unique (office 629 and commercial 439 unique words). That is acceptable for a service template, but:

- `/industries/property-management/` vs `/services/building-maintenance/` have TF-IDF similarity of 0.58, the highest pair on the site. Differentiate them: building maintenance should cover the periodic floor and surface programme; property management should cover the portfolio, tenant and condo relationship.
- Collapse the process block to a 1-line summary linking `/our-process/` on service pages, to raise the unique share.

**Blog.** No textual duplication between posts: the highest blog-to-blog TF-IDF cosine is 0.22. Topics do overlap, though:

- air quality (3 posts)
- germ hotspots (2)
- hand hygiene (2)
- seasonal checklists (4)
- choosing a cleaner (2)

See the plan in section 7.

### Outdated

**COVID-era posts, 2020-2021 (8):**

| Published | URL | Words | Issue |
|---|---|---|---|
| 2020-03-31 | /be-safe-from-coronavirus-work/ | 888 | "new and deadly strain", WHO outbreak framing |
| 2020-05-27 | /clean-and-disinfect-public-areas-during-covid-19/ | 468 | COVID-specific disinfection guidance |
| 2020-06-30 | /coronavirus-bringing-more-urgency-cleaning/ | 648 | CDC and EPA framing, grade 12.8 |
| 2020-09-29 | /cleaning-protocols-for-daycares-and-schools/ | 592 | "economy is beginning the reopening process", grade 13.3 |
| 2021-01-31 | /does-hand-sanitization-actually-help-prevent-illnesses/ | 589 | COVID framing, overlaps hand-washing post |
| 2021-02-26 | /keep-your-office-at-home-clean/ | 502 | lockdown work-from-home consumer topic |
| 2021-04-29 | /the-return-of-employees-post-covid-19-is-your-office-ready/ | 621 | "lifting of the COVID-19 lockdown", "pandemic is still raging" (15 COVID mentions) |
| 2021-09-30 | /key-office-areas-to-have-cleaned-and-disinfected/ | 386 | disinfection framing, overlaps germ-hotspots post |

**Also COVID-dated:**

- `/covid-19-commercial-cleaning-expectations-examined/` (2022-01-18): "new normal", masks, social distancing, CDC.
- **`/services/disinfection-cleaning/` (money page):** "Are You Concerned About Covid-19 In Your Office", "go back to the office after the Coronavirus crisis", plus 2 typos.

**Other dated items:**

- `/green-clean-products/` ("46 years", "In April of 2013 changes occurred...").
- The 4 homepage Google reviews ("5-6 years ago").
- The blog itself: newest post 2023-03-31, and `dateModified` equals `datePublished` on every post.

## 5. Benchmark vs Jan-Pro

| Metric | Evergreen office | Jan-Pro office | Evergreen dental (`/industries/medical-dental-clinics/`) | Jan-Pro dental | Evergreen commercial | Jan-Pro commercial |
|---|---|---|---|---|---|---|
| Main words | 1,259 | 1,012 | 903 | 776 | 1,058 | 1,664 |
| Unique (non-template) | 629 | n/a | 486 | n/a | 439 | n/a |
| FK grade | 8.3 | 12.1 | 7.7 | 12.4 | 7.7 | 12.1 |
| FAQ block / FAQPage | 7 / yes | none | 4 / yes | none | 5 / yes | none |
| Price guidance | factor list, no figures | none | factor list | none | factor list | none |
| Scope / limits section | yes | no | yes (sterilization and sharps excluded) | no | yes | no |
| Named, proprietary systems | none | TRACKER inspections | none | MedMetrix (certified program), EnviroShield electrostatic | none | MedMetrix, EnviroShield, Jan-Pro Technics |
| Compliance language | WSIB, bonded, insured | CDC/OSHA/Joint Commission, EPA-approved products | "clean first then disinfect" | OSHA/CDC/ADA protocols, bloodborne-pathogen training | WSIB | EPA, OSHA |
| Specific sub-service sections | inclusions list | general, floor and carpet, breakroom, window (each H3 with lists) | patient vs clinical areas | operatory, waiting, restroom (colour-coded cloths), floors (HEPA), restocking | inclusions | 14 industry cards and special services |
| Dates (JSON-LD) | none | published 2019, **modified 2026-08** | none | published 2026-02, **modified 2026-10** | none | modified 2026-08 |
| Industry pages | 2 | 16 | | | | |
| Service pages | 9 | about 12+ | | | | |

**Takeaways:**

- Evergreen's core pages already beat Jan-Pro on readability, FAQs, scope transparency and price-factor guidance. Keep that template.
- Jan-Pro wins on:
  - **Breadth.** 16 `/who-we-clean/` pages, plus dedicated janitorial, day-porter, carpet, floor, tile and grout, strip and wax, window, electrostatic and restroom pages.
  - **Named methodology and training.** MedMetrix, the TRACKER inspection app, colour-coded cloths, HEPA.
  - **Visible freshness.** `dateModified` within the last 3 months.
- Jan-Pro's compliance language is US-centric (OSHA, CDC, ADA, EPA). Evergreen can out-position it for Toronto buyers with Canadian specifics, provided they are true:
  - WSIB clearance on request
  - Ontario OHSA and WHMIS 2015 training
  - Health Canada DIN-registered disinfectants
  - alignment with IPAC Canada and PIDAC best practices, and RCDSO expectations for dental clients
  - AODA-aware cleaning of accessible routes
  - a named, written inspection routine (give the account-executive inspection a name and a checklist)

## 6. Content gaps vs Jan-Pro (Toronto buyer)

**Industry pages missing.** The `/industries/` hub already lists these segments, but only medical-dental and property management have pages.

1. **Dental offices**, as its own page split from medical, matching Jan-Pro. Dental is Evergreen's strongest blog topic and is already in the nav. Add operatory vs clinical scope, RCDSO/IPAC-aligned checklist, after-hours keys and alarms.
2. **Medical and health clinics, labs.**
3. **Office buildings and professional firms (law, finance)**, as an industry page or by repurposing `/services/office-cleaning/` and cross-linking.
4. **Industrial, manufacturing and warehouse/logistics**, as an industry page. Currently it exists only as a legacy service page with a wrong audience list. This is a GTA strength (Brampton, Vaughan, Mississauga logistics).
5. **Retail stores and showrooms, and auto dealerships.** The retail checklist post exists to feed this.
6. **Schools, daycares and education.** The daycare post can be rewritten into this.
7. **Government, municipal, courthouses and libraries.** The site claims police stations and government buildings.
8. **Banks and financial institutions.** Security and confidentiality angle.
9. **Fitness centres**, **places of worship** and **hospitality** (hotels, golf and country clubs). Lower priority. Only build these if you have real clients.
10. **Condominiums**, as its own page or a strong section. Toronto condo common areas are a large local market.

**Service pages missing:**

1. **Janitorial services.** The homepage "Janitorial Services" card links to `/services/office-cleaning/`. "Janitorial services Toronto" is a distinct, high-intent query, and Jan-Pro has the page.
2. **Commercial carpet cleaning**, currently buried in building maintenance.
3. **Floor stripping, waxing and floor care.** Strip/seal/wax, burnishing, VCT, concrete.
4. **Day porter and day-time cleaning.** The commercial FAQ already says "Do you clean during business hours?".
5. **Interior window and glass cleaning, and high dusting.**
6. **Washroom/restroom sanitation and consumables supply.**
7. **Electrostatic / touch-point disinfection**, as a rewrite of `/services/disinfection-cleaning/` without COVID framing.
8. **Green cleaning**, turning `/green-clean-products/` into a service page (method, certified products, fragrance-free for clinics).
9. **Tenant turnover and move-in/move-out commercial cleaning.**
10. **Data room and raised-floor cleaning.** Already listed as an inclusion, and a niche with little competition.

**Supporting content a Toronto B2B buyer needs, which neither site does well:**

- A **pricing guide**: "How much does office cleaning cost in Toronto?" with ranges per sq ft or per visit, and what changes them. The price-factor lists already exist; add honest ranges.
- **2-3 case studies** (building type, scope, frequency, outcome, client quote).
- A **commercial cleaning RFP / scope-of-work checklist** download.
- An **in-house vs contracted cleaning** comparison.
- **Cleaning frequency by facility type** as a table.

## 7. Blog plan: prune, update, consolidate, redirect

**Ground rule:** before removing any URL, check GSC clicks and impressions for the last 16 months and referring domains. Any URL with clicks or backlinks gets a 301 to the closest relevant page, never a 410. URLs with no traffic and no links can be 410'd. Every kept or merged post must get:

- a visible date and "last updated" date
- a named author
- list and table markup for any checklist
- 2-3 contextual links to the matching service or industry page (currently 26 of 38 posts link to no service, industry or location page; the most-linked targets are `/contact-us/` 27x and `/about-us/` 21x)
- Canadian sources in place of US CDC/WebMD/Wikipedia

| Action | URL(s) | Target / new angle |
|---|---|---|
| **Prune, 301** | /be-safe-from-coronavirus-work/, /clean-and-disinfect-public-areas-during-covid-19/, /coronavirus-bringing-more-urgency-cleaning/, /covid-19-commercial-cleaning-expectations-examined/, /the-return-of-employees-post-covid-19-is-your-office-ready/ | 301 to the rewritten `/services/disinfection-cleaning/`. Use 410 only if no traffic or links. |
| **Prune** | /keep-your-office-at-home-clean/, /how-to-take-care-of-plants-in-the-office/ | Off-intent for B2B. 410 if no traffic, else 301 to `/insights/`. |
| **Merge** | /does-hand-sanitization-actually-help-prevent-illnesses/ + /importance-of-hand-washing/ | One "Workplace hand-hygiene stations: placement and maintenance" post. Link to washroom sanitation. 301 the other. |
| **Merge** | /key-office-areas-to-have-cleaned-and-disinfected/ + /areas-in-your-office-where-germs-are-likely-hiding/ | One "Office high-touch points: what to clean daily vs weekly" table. Link to `/services/office-cleaning/`. |
| **Merge** | /commercial-cleaning-air-quality/ + /5-tips-for-maintaining-clean-office-air/ + /control-allergies-workplace-with-professional-janitorial-services/ | One "Office indoor air quality and cleaning" guide (HEPA, dusting cadence, fragrance-free products). Link to building maintenance and green clean. |
| **Merge** | /how-to-decide-on-a-cleaning-company/ + /qualities-top-cleaning-professionals/ | "How to choose a commercial cleaning company in Toronto": a WSIB, insurance and references checklist plus RFP questions. Highest buyer intent. Link to `/our-process/` and `/request-a-quote/`. |
| **Merge** | /workplace-cleaning-checklist-winter/ + /tips-tricks-for-spring-cleaning-your-office/ + /end-of-summer-cleaning/ + /office-cleaning-fall/ | One "Seasonal commercial cleaning calendar for Toronto" (winter salt and slush matting, spring carpet extraction, fall high dusting). Link to building maintenance. |
| **Rewrite, keep URL** | /cleaning-check-list-dental-clinics/ | Real `<ol>` checklist split into "clinic staff" and "cleaning contractor" duties. IPAC-aligned. Link to `/industries/medical-dental-clinics/`. Later, feed the dental page. |
| **Rewrite, keep URL** | /cleaning-protocols-for-daycares-and-schools/ | Remove COVID framing. Make it a schools and daycares protocol. Becomes the seed for the education industry page. |
| **Rewrite, keep URL** | /a-cleaning-checklist-for-your-retail-store/ | `<ul>` checklist. Link to commercial cleaning and the future retail page. |
| **Update and interlink** | /5-easy-ways-to-keep-your-commercial-floor-clean/, /commercial-cleaning-techniques-to-avoid/, /modern-vs-old-fashioned-cleaning-methods/, /preventing-slips-trips-falls-in-your-workplace/ | Link to building maintenance and floor care. Add Ontario OHSA and winter-entrance specifics to the slips post. |
| **Update and interlink** | /benefits-of-regular-commercial-cleaning-services/, /benefits-of-commercial-deep-cleaning-services/, /day-night-which-is-the-best-routine-for-your-office/ | Link to commercial and office cleaning. Day/night links to the future day-porter page. |
| **Update and interlink** | /5-cleaning-tips-to-help-make-your-office-relocation-seamless/ | Link to post-construction and tenant-turnover cleaning. |
| **Keep, light refresh** | /how-to-properly-dust-office-building/, /6-common-cleaning-products-that-you-should-never-mix-together/ (add WHMIS 2015 note), /5-cleaning-products-you-should-have-in-your-office/, /how-to-keep-your-office-fridge-clean/, /robotic-vs-manual-cleaning-which-will-ultimately-succeed/, /office-layout-tips-to-make-cleaning-easier-and-faster/, /ask-the-office-cleaners-cleaning-break-rooms/ (**remove competitor link**) | Add dates, author, lists and service links. |

**Net result:** 38 posts become about 22-24 stronger URLs:

- 7 removed
- about 10 merged into 5
- 3 rewritten
- the rest refreshed

Then publish 1-2 posts per month that feed the new industry and service pages, plus the pricing guide and case studies.

## 8. AI-citation readiness: 45/100

**Strengths:**

- 14 pages carry FAQPage schema with concise 15-54 word answers.
- Lists for "what is included" and "what affects the price".
- Clear scope/limits sentences, e.g. "Sterilization of instruments and the handling of biomedical or sharps waste follow your own clinical procedures and are not part of a cleaning contract."
- Consistent entity facts (since 1989, 243 Queen St W, WSIB, single office).

**Weaknesses:**

- No quantified facts (prices, frequencies by sq ft, response times, number of clients or buildings).
- The blog has **zero `<ul>`/`<ol>`** across 38 posts, including two "checklist" posts. Their headings are H3-only in 10 posts.
- No visible dates or authors.
- Few definitional "X is..." openers. No comparison tables.
- Legacy pages carry long promotional sentences.

**Fixes:**

- Open each service page with a 40-60 word definitional answer ("Office cleaning from Evergreen is recurring after-hours janitorial service for... priced per visit after a free walkthrough; typical frequency...").
- Add a price-range table.
- Add a frequency-by-facility table.
- Convert blog checklists to real lists and tables with dates and authors.

## 9. Score reasoning: Content Quality 43/100

| Component | Weight | Score | Why |
|---|---|---|---|
| E-E-A-T | 30% | 41 | See section 3. Weak proof (AI imagery, empty reviews page, thin about page, no authors) outweighs honest, specific trust copy. |
| Depth and topical coverage | 20% | 50 | Core service and industry pages are deep and buyer-focused. Only 2 of 7 listed industries have pages. Key services are missing (janitorial, carpet, floor care, day porter, window). No pricing or case studies. |
| Uniqueness | 15% | 40 | 7 of 7 location pages and 3-4 service pages are thin on unique copy. Location pages are 94-97% city swaps. Template blocks are heavy on service pages. |
| Freshness | 10% | 15 | No post since 2023-03. No visible dates. 9 COVID-dated posts plus a COVID money page. Reviews about 5 years old. |
| Structure and AI-citation readiness | 15% | 45 | Good FAQs and lists on core pages. The blog has no lists or H2s in places, and no figures. |
| Intent match | 10% | 65 | Core titles and H1s match. `/reviews/`, industrial and legacy H1s, location H1 brand suffix, and off-intent posts drag it down. |
| **Weighted** | | **43** | |

## 10. Structured findings (for audit-data.json, category "Content Quality")

```json
{
  "category": "Content Quality",
  "score": 43,
  "subscores": {"eeat": 41, "experience": 30, "expertise": 40, "authoritativeness": 35, "trustworthiness": 55, "ai_citation_readiness": 45},
  "metadata_template": {"site_risk": "low", "templated_ratio": 0.0, "shared_cta_phrases": {}, "secondary_flags": {"brand_suffix_in_description": 7, "description_echoes_title": 2}},
  "findings": [
    {"id": "content-location-doorway", "severity": "high", "title": "Location pages are 94-97% boilerplate", "urls": ["/locations/brampton/", "/locations/etobicoke/", "/locations/markham/", "/locations/oakville/", "/locations/toronto-downtown/"], "evidence": "21-42 unique words per page after city normalization; pairwise 6-gram Jaccard 0.76-0.88", "fix": "Add 250-400 words of local substance per page or consolidate into /locations/ with 301s"},
    {"id": "content-proof-ai-images", "severity": "high", "title": "Site imagery appears AI-generated and is presented as cleaning results", "urls": ["/", "/cleaning-demo-gallery/", "/industries/medical-dental-clinics/"], "evidence": "Recurring identical models, CN Tower in every interior, cleaner in clinical scrubs; gallery alt text says 'cleaning results'", "fix": "Replace with real crew and site photos; retitle or remove the gallery"},
    {"id": "content-reviews-empty", "severity": "high", "title": "/reviews/ contains no reviews", "urls": ["/reviews/"], "evidence": "35 words; form only; meta promises 'real Google reviews'", "fix": "Embed dated Google reviews and attributed testimonials"},
    {"id": "content-about-thin", "severity": "high", "title": "About page thin and anonymous", "urls": ["/about-us/"], "evidence": "170 words; no owner, team, photos, or WSIB/insurance evidence", "fix": "600-900 words with named people, history, verifiable numbers, credentials"},
    {"id": "content-blog-stale-unattributed", "severity": "high", "title": "Blog stale, undated and unattributed", "urls": ["/insights/"], "evidence": "38 posts, newest 2023-03-31; no visible date or byline; JSON-LD author is the Organization; dateModified = datePublished", "fix": "Visible dates, named Person author, refresh/consolidate per plan"},
    {"id": "content-covid-outdated", "severity": "medium", "title": "9 COVID-era posts plus a COVID-framed money page", "urls": ["/services/disinfection-cleaning/", "/be-safe-from-coronavirus-work/", "/clean-and-disinfect-public-areas-during-covid-19/", "/coronavirus-bringing-more-urgency-cleaning/", "/cleaning-protocols-for-daycares-and-schools/", "/does-hand-sanitization-actually-help-prevent-illnesses/", "/keep-your-office-at-home-clean/", "/the-return-of-employees-post-covid-19-is-your-office-ready/", "/key-office-areas-to-have-cleaned-and-disinfected/", "/covid-19-commercial-cleaning-expectations-examined/"], "fix": "Rewrite disinfection page; 301/merge posts per plan"},
    {"id": "content-competitor-link", "severity": "medium", "title": "Blog links to a Toronto competitor with a keyword anchor", "urls": ["/ask-the-office-cleaners-cleaning-break-rooms/"], "evidence": "href=https://www.greencleanofficemaintenance.com/ anchor 'Toronto office cleaners'", "fix": "Remove link"},
    {"id": "content-blog-no-service-links", "severity": "medium", "title": "Blog posts do not link to money pages", "evidence": "26/38 posts link to no service, industry or location page; 8 link only to the /services/ hub; top targets are /contact-us/ (27) and /about-us/ (21)", "fix": "2-3 contextual links per post to the matching service or industry page"},
    {"id": "content-legacy-service-pages", "severity": "medium", "title": "Legacy service pages thin, inconsistent or erroneous", "urls": ["/services/disinfection-cleaning/", "/services/emergency-cleaning/", "/services/industrial-cleaning/", "/services/graffiti-removal/", "/services/pressure-washing/"], "evidence": "167-310 unique words; typos 'psychically'; 22-place service area contradicts 10-city schema; industrial page lists retail, banks, golf clubs", "fix": "Rebuild on the office-cleaning template with FAQs, scope, price factors"},
    {"id": "content-gaps-industries-services", "severity": "medium", "title": "Industry and service coverage gap vs Jan-Pro", "evidence": "2 industry pages vs 16; missing janitorial, carpet, floor care, day porter, window, dental, retail, education, industrial, government, banks", "fix": "Build priority pages per section 6"},
    {"id": "content-no-pricing-figures", "severity": "low", "title": "Price factors but no ranges", "fix": "Publish a Toronto pricing guide with honest ranges"},
    {"id": "content-blog-structure", "severity": "low", "title": "Blog has zero list markup; 10 posts have no H2; all under 1,500 words", "fix": "Convert checklists to lists and tables; fix heading hierarchy"},
    {"id": "content-unsupported-claims", "severity": "low", "title": "Unsupported 'certified' and 'health-grade' claims; WSIB/insurance asserted without evidence", "urls": ["/locations/mississauga/"], "fix": "Evidence or remove"},
    {"id": "content-search-indexable", "severity": "low", "title": "/search/ in sitemap and indexable", "urls": ["/search/"], "fix": "noindex and remove from sitemap"}
  ],
  "strengths": [
    "Rebuilt core pages (office, commercial, building maintenance, post-construction, 2 industries, our-process) have intent-matched H1s, scope and limits, price-factor lists and 3-7 FAQs with FAQPage schema; they beat Jan-Pro on FAQs, readability and transparency",
    "Consistent, specific trust facts: since 1989, full NAP and hours, WSIB/bonded/insured, single-office honesty on location pages",
    "Readable copy (FK grade about 8-9) and hand-written, non-templated metadata (templated_ratio 0.0)"
  ]
}
```

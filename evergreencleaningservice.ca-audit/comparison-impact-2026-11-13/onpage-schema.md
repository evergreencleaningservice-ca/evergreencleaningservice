# On-page and structured data: Evergreen vs Impact (13 Nov 2026)

## Evidence base and a big caveat

- Evergreen: fresh crawl, 90 URLs attempted, 85 fetched OK. 5 failed with proxy errors (a crawler artefact, not a site fault): /locations/brampton/, /locations/markham/, /insights/, /commercial-cleaning-quote-checklist/, /how-to-properly-dust-office-building/. Those 5 are unmeasured.
- Impact: the supplied crawl is unusable beyond the home page. Of 87 URLs, 67 returned 403 and 18 returned a 200 "Bot Verification" challenge page (empty title, no H1, no description). Only the home page is real. I therefore refetched 4 public pages (office-cleaning, mississauga, the blog post and oakville, 1 request each, 2 s gap, honest UA). That is 4 of the ~20 allowed. Impact crawl-wide duplicate/length stats cannot be computed; Impact numbers below are from 5 pages (home plus those 4), not from the site.
- Evergreen's own ProfessionalService/Service/FAQ/Breadcrumb JSON-LD is from crawl data. Impact JSON-LD was parsed from raw HTML.

## 1. Scores (on-page and structured data only)

| | Score /100 | Basis |
|---|---|---|
| Evergreen | 80 | Unique titles and descriptions on all 57 indexable pages, one H1 each, canonicals on 85/85, 0 missing alt on 358 images, breadcrumb nav and BreadcrumbList on 84/85 pages, Service schema on service and location pages, 5 pages unmeasured. Deducted for FAQPage on 23 pages (no SERP benefit since 7 May 2026), 5 short utility titles, 3 thin utility pages, indexability of 28 tag archives set to noindex (fine) but still 33% of crawled URLs. |
| Impact | 74 (provisional) | Strong Organization graph, multiple LocalBusiness offices, BlogPosting with Person author, titles and descriptions well formed on the 5 pages sampled. Deducted for no Service schema on service or city pages, FAQPage on 2 of 5, template-heavy city pages, generic city titles, and the inability to verify the rest of the site. |

Scores are not directly comparable in confidence: Evergreen has ~85 pages measured, Impact 5.

## 2. What each does better (evidence)

| Area | Winner | Evidence |
|---|---|---|
| Titles and descriptions, uniqueness | Evergreen (measured) | 0 duplicate titles or descriptions among 57 indexable pages. Duplicates only on noindex tag pages (e.g. "Tag: commercial cleaning" H1 x3). Titles median 49 chars, descriptions median 147; only 1 title over 60, 2 descriptions over 160. Impact: 5 sampled pages fine, home description is 214 chars (truncated in SERPs) and no sitewide check is possible. |
| Title quality on the 4 pairs | Mixed | Evergreen `/office-cleaning/` "Office Cleaning Services in Toronto & the GTA | Evergreen" (57) vs Impact `/office-cleaning` "Office Cleaning Services Canada | Impact Commercial Cleaning" (60). Impact blog title differs from H1 ("Toronto Office Cleaning Schedule and Frequency Guide" vs H1 "How Often Should an Office Be Professionally Cleaned in Toronto"), which is a deliberate and sound pattern. Evergreen blog "How Often Should an Office Be Cleaned? Toronto Guide" (52). Impact Mississauga "Office Cleaning Services Mississauga | Impact Cleaning" (54) is generic; Evergreen "Office & Commercial Cleaning in Mississauga | Evergreen" similar. A wash. |
| Heading outlines | Evergreen on location, Impact on service | Impact `/office-cleaning`: 1 H1, 14 H2, 29 H3, question-style H2s ("What does office cleaning include?", "How much does office cleaning cost?"), 3,468 words. Evergreen `/office-cleaning/`: 1 H1, 14 H2, question H2s too, 1,705 words. Impact `/ontario/mississauga/office-cleaning` H2s are keyword variations ("Commercial Cleaning That Supports Daily Operations", "Cleaning Service for Offices That Need Consistent Results") with no named Mississauga neighbourhoods in the text I searched for. Evergreen's Mississauga H2s name Meadowvale, Lisgar, East Credit, City Centre and the airport area. |
| City page uniqueness | Evergreen | Impact Mississauga vs Oakville office-cleaning: 43 of 130 long text lines identical and 47 of ~150 sentences shared (about 30%), same H2 pattern, title and H1 are only the city name swapped. Not measured for the other 153 city pages. 155 of 293 sitemap URLs (53%) are this pattern. Flag as a risk, not a model. |
| Organization / LocalBusiness | Impact | Organization with legalName, alternateName, numberOfEmployees (1100), hasCredential, memberOf, knowsAbout, foundingLocation, plus separate LocalBusiness nodes per office (Etobicoke, Burlington) each with address, hours, parentOrganization. Evergreen: single ProfessionalService with address, geo, hours, areaServed (15 areas), sameAs (4), contactPoint, hasOfferCatalog, hasMap. Complete for a one-office firm; Impact is richer because it has many offices. |
| Service markup | Evergreen | Service nodes on 22 pages (service and location pages, linked to the organization by @id, plus hasOfferCatalog). Impact: no Service type on office-cleaning or Mississauga (types seen: BreadcrumbList, Organization, WebPage, WebSite, plus LocalBusiness on Mississauga/office-cleaning). |
| Article markup | Impact slightly | Impact BlogPosting has author as Person (with sameAs, url), publisher, datePublished, dateModified, image. Evergreen BlogPosting present on 23 pages; I did not verify whether author is a Person (unverified). |
| Breadcrumbs | Evergreen | BreadcrumbList on 84/85 crawled pages plus visible breadcrumb nav. Impact: home BreadcrumbList has one ListItem with no item URL; sampled inner pages have BreadcrumbList (4 and 10 ListItems). Impact crawler flagged `breadcrumb_nav` 0, but that is from the blocked pages, so not evidence. |
| FAQ markup | Neither | Impact FAQPage on home (6 Q) and office-cleaning (7 Q), not on the blog post even though it has a "Frequently Asked Questions" H2 and not on the city page. Evergreen FAQPage on 23 pages. Google retired FAQ rich results for all sites on 7 May 2026; both are Info only, no SERP benefit, AI/GEO benefit unconfirmed. |
| Review / aggregateRating | Both comply | No aggregateRating or Review markup found on either site (Impact: 5 pages grepped; Evergreen: home source and JSON-LD type tally across 85 pages). Both display testimonials ("What Our Clients Say", Evergreen "Google reviews" and "Testimonials"). Self-serving LocalBusiness/Organization reviews are not eligible for stars, so the absence is correct. Do not add it. |
| Internal linking | Evergreen is measured, Impact is not | Evergreen median 91 internal links per page, 110 on home. Impact raw HTML has about 190-233 anchor matches per sampled page (mega-menu heavy), consistent with a large nav, but link depth and orphan analysis are impossible on blocked crawl data. |
| Image alt | Evergreen (measured) | 0 missing alt of 358 images. Impact home crawl: 0 of 76, only for the home page. |
| Thin pages | Evergreen | Only 3 indexable pages under 300 words (contact-us 149, request-a-quote 216, cleaning-demo-gallery 242), all utility pages. Impact unknown. |

## 3. Copy the pattern, not the content

1. Separate meta title from H1 on blog posts when the keyword intent differs (Impact blog pair). Files: the post layout in `src/` (title/H1 are currently near-identical). Write original titles.
2. Add Person author with `sameAs` on BlogPosting if not already present (verify first in the layout that emits BlogPosting JSON-LD under `src/`).
3. Add an `@id` graph that includes `knowsAbout`, `hasCredential` (WSIB, insurance, any real certifications with issuer) and `memberOf` to the ProfessionalService node, only where Evergreen can document them. No invented credentials.
4. Question-form H2s that match "how much" and "what is included" searches. Evergreen already does this on `/office-cleaning/`; extend to remaining service pages.
5. Keep dateModified honest on content updates (Impact shows 2026-10-26/27 modified dates on key pages).

## 4. Where Evergreen already beats Impact

- Local page specificity: Mississauga page names real neighbourhoods and includes a Service node tied to the organization. Impact's equivalent is a templated city swap with about 30% sentence overlap against Oakville.
- Service schema coverage (22 pages) and consistent BreadcrumbList.
- Zero duplicate titles/descriptions among indexable URLs, tag archives correctly set to noindex.
- Clean, correct JSON-LD context (`https://schema.org`, absolute URLs, @graph with @id cross-references) and correct decision not to publish aggregateRating.
- Smaller, tighter footprint: 57 indexable pages vs Impact's 155 city x service pages that risk doorway/scaled-content classification.
- Impact's site served 403 and bot-challenge pages to a 2-concurrent, 1 s-delay polite crawl. That is Impact's own bot-protection choice; it does not hinder real users or Googlebot necessarily, but it is a monitoring risk (unverified for Googlebot).

## 5. Evergreen actions

1. FAQPage on 23 pages: Info only. Keep visible FAQ content (useful for users) but do not expect SERP benefit; no urgent removal. Source: schema emitted from `src/` layouts/components (not inspected here).
2. Utility page titles are short ("About Us | Evergreen", "Contact Us | Evergreen", "Client Reviews | Evergreen"): add the service and Toronto context.
3. Tag archives: 28 of 85 crawled URLs are noindex tag pages with near-duplicate titles. Fine for indexing, but consider not generating them at all (saves crawl budget and sitemap noise).
4. Do not copy Impact's programmatic city x service model. If adding locations, require unique local facts per page (as Mississauga does).
5. Re-run the 5 failed crawl URLs to complete measurement.

## 6. Not verified

- Impact crawl-wide on-page stats (duplicates, lengths, H1s, internal link depth, the 155 city pages beyond Mississauga and Oakville): crawl was blocked, 403 or challenge pages.
- Whether Googlebot sees Impact's pages fully, and Impact's indexation status.
- Evergreen BlogPosting author type, and exact schema emitters in `src/` (read from crawl output only).
- The 5 Evergreen URLs that failed with proxy errors.
- Backlinks and authority: Moz quota exhausted, no data.
- Rich results eligibility was not tested in Google's Rich Results Test, only reasoned from schema content and current policy.
- The "Bot Verification" 200s at Impact were taken at face value from the crawl, not re-tested with a browser.
- Lighthouse for impact-location shows SEO 0 and best practices 0 with 269 KB, which looks like a failed or error page; the SEO score is not usable for that pair.

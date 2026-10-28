# Sitemap and site-architecture audit: www.evergreencleaningservice.ca

Date: 2026-10-28. Method: curl (proxy) on live site, 73/73 sitemap URLs fetched and parsed; repo read for config. Raw data: `.../evergreencleaningservice.ca-audit/raw/sitemap/` (urls.txt, status.tsv, pages.json, inlinks.json, maintext.json). Plugin scripts not used (they refuse the proxy).

**Score: 70/100** (Technical hygiene excellent, about 92/100 on its own; architecture, lastmod, utility-page inclusion and location-page quality pull it down. Reasoning at the end.)

## 1. Validation results

| Check | Result | Detail |
|---|---|---|
| robots.txt | PASS | 200; `User-agent: *`, `Allow: /`, one `Sitemap:` line pointing to /sitemap-index.xml. No Disallow (the noindex pages rely on meta robots, which is correct: do not Disallow /lp/ or /thank-you/ or Google never sees the noindex). |
| /sitemap-index.xml | PASS | 200, valid XML, 1 child (`/sitemap-0.xml`), no lastmod. |
| /sitemap.xml | PASS (note) | 301 to /sitemap-index.xml. Fine, but a sitemap URL that redirects is a minor friction if anyone submits it in Search Console. |
| /sitemap-0.xml | PASS | 200, valid XML, 7,199 bytes, 73 `<url>`, 73 unique, no duplicates. Far under the 50,000 URL / 50 MB limits. |
| URL count | PASS | 73 (matches the repo's docs/growth/page-inventory.md). |
| Status codes | PASS | 73/73 return 200 directly, 0 redirects, 0 non-200. |
| Self-canonical | PASS | 73/73 canonical equals the sitemap URL exactly (www, https, trailing slash). |
| Indexable | PASS (with 1 caveat) | 0 noindex via meta or X-Robots-Tag in the 73. Caveat: /search/ is indexable but should not be (see 2.1). |
| URL format | PASS | All lowercase, trailing slash, no params, single host. |
| `<changefreq>` / `<priority>` | PASS | Neither present (only `<loc>`). Good, Google ignores both. |
| `<lastmod>` | FAIL (Low-Medium) | Absent on all 73 static URLs. Inconsistent: the Worker (`injectSitemap` in src/lib/admin/live-posts.ts) adds `<lastmod>` only for admin-published posts, so any future post will have one and no other URL will. |
| Extra namespaces | INFO | news/xhtml/image/video namespaces declared but unused (Astro default). Harmless. |
| apex/http | PASS | `evergreencleaningservice.ca` and `http://www` 301 to https://www. |
| Slashless URLs | INFO | `/services`, `/locations`, `/services/office-cleaning` return **307** to the slashed URL (temporary). Should be 301/308 so link equity is clearly consolidated; fix at the Cloudflare/Astro layer (e.g. Cloudflare "html_handling" setting or add rules). |

## 2. Inclusion and exclusion issues

### 2.1 Included but should not be (High-Medium)
1. **/search/** is in the sitemap, returns 200, self-canonical, **no noindex**, and has **zero internal links** (an orphan; reached only through the sitemap). It is a client-side filter of the post index with a `?q=` form. Remove it from the sitemap and add `noindex, follow` (the `noindex` prop in BaseLayout/PageLayout exists). Add it to the `filter` regex in astro.config.mjs. Search-results/utility pages are not landing pages and `?q=` variants would be crawl noise.
2. **/insights/page/2/, /3/, /4/** are in the sitemap. They are self-canonical and indexable (rel=prev/next is unused by Google since 2019). They are archive pages, listing the same 38 posts the posts' own URLs already cover. Recommendation: keep them crawlable and indexable-if-you-wish, but **remove from the sitemap** (the sitemap should list destinations, and the posts are the destinations). Keep `/insights/` itself. Do not noindex them: they are the only internal path to most posts (see 3.2).
3. Optional: /privacy/ (886 words) is a legal page; harmless but low-value. Leave out of the sitemap in the ideal structure or leave in, low impact.

### 2.2 Correctly excluded (PASS)
- `/lp/*` (4 pages) are `noindex, nofollow`, self-canonical, absent from the sitemap, and nothing links to them from the site. Correct.
- `/thank-you/` noindex, absent. `/category/blog/` and 26 `/tag/*/` pages are `follow, noindex`, absent. `/admin/` redirects to sign-in and sends `X-Robots-Tag: noindex, nofollow`. `/eg-live-post-shell/` excluded. 404 page is noindex with canonical `/404/`.
- Minor note: 49 of the 73 pages sitewide link to all 26 noindex tag pages (27 linked URLs not in the sitemap, all noindex by design). It is not an error, but it spends crawl budget and puts a 26-link block on every post. Consider showing only the 5-8 top tags in the sidebar.

### 2.3 Redirects must not appear in the sitemap (PASS)
No sitemap URL is a redirect source. Probed live (all 301 to a sitemap URL, which is in the sitemap): `/commercial-cleaning-toronto-gta/`, `/office-cleaning/` (also slashless), `/industrial-cleaning/`, `/emergency-service/` -> `/services/...`; `/blog/` (and slashless), `/blog/page/2/` -> `/insights/page/2/`, `/blog/<slug>/` -> `/<slug>/`; `/author/admin/` -> `/category/blog/`; `/feed/` -> `/rss.xml`; `/sitemap.xml` and `/sitemap_index.xml` -> `/sitemap-index.xml`. Not redirected (by design or unmappable): `/?p=5`, `/?page_id=5` return the homepage with `canonical` = `/` (soft landing; acceptable, old numeric IDs cannot be mapped); `/tag/<unknown>/`, `/category/`, `/wp-admin/`, `/2020/11/post/` return 404 (correct); `/wp-sitemap.xml`, `/post-sitemap.xml` return 404. Cross-check against src/data/redirects.ts: none of the 73 sitemap URLs is a `from` rule.

## 3. Orphan and missing pages

### 3.1 Linked but not in sitemap
Crawled internal links from all 73 pages (home, /services/, /industries/, /locations/, /insights/ and header/footer on each): 100 distinct internal targets, 27 not in the sitemap: `/category/blog/` and 26 `/tag/*/` pages. All are intentionally `noindex`. **No indexable page is linked but missing from the sitemap.** No links to /lp/* anywhere.

### 3.2 In sitemap but weakly linked
- **/search/**: 0 internal inlinks (orphan).
- **Most of the 38 blog posts have exactly 1 internal inlink** (the /insights/ or /insights/page/N/ archive; they are not linked from service, industry or location pages). Posts are 2019-2023 (latest pubDate 2023-03-31, no updatedDate field in the content schema), so the blog is a dormant, thinly-connected cluster. The strongest posts for commercial intent (dental checklist, retail checklist, daycares/schools, how-to-decide-on-a-cleaning-company, benefits-of-regular-commercial-cleaning) should be linked from the matching industry/service pages and vice versa.

### 3.3 Missing pages (not built, no URL exists)
All of these 404 today: `/locations/north-york/`, `/locations/scarborough/`, `/locations/richmond-hill/`, `/locations/pickering|ajax|oshawa/`, `/industries/offices/`, and the other industry slugs in section 6. The hub /locations/ lists the six uncovered areas as plain text, so they cannot rank for themselves.

## 4. Location-page quality gate

Count: 7 location pages (+ hub) is under the 30-page warning and 50-page hard-stop thresholds, so the count gate does not fire. The **60% unique-content test** does fire. Method: main-content text only (header, footer, nav, forms, scripts removed), 5-word shingles, share of a page's shingles not found on the comparison page.

| Pair (unique share of the first page) | Mississauga | Vaughan | Brampton |
|---|---|---|---|
| Mississauga vs | - | 32% | 33% |
| Vaughan vs | 33% | - | 33% |
| Brampton vs | 25% | 25% | - |

With city names normalised to a token (strips the "swap the city" effect): Mississauga vs Vaughan 28%, Mississauga vs Brampton 29%, Brampton vs the other two 21%. Shingle Jaccard similarity 56-60%.

Against **all six other location pages combined**: Mississauga 32%, Vaughan 32%, Brampton 13%, Markham 13%, Oakville 12%, Etobicoke 12%, Toronto-downtown 14%. Share not found on any non-location page of the site: 41-49%.

Main-text length: Mississauga 782 words, Vaughan 784, Brampton 705, Markham 704, Oakville 704, Etobicoke 683, Downtown 702.

What is shared: the process steps (5 blocks), services list, 3 Google reviews, 4 of 5 FAQs, "Where we work from" block. What differs: the intro, the "facility types" list, and a short "what we clean" line. Mississauga and Vaughan carry client-written long copy (named areas: Hurontario corridor, Airport Corporate Centre, Meadowvale; 17 of 43 Mississauga sentences are absent from Vaughan and from Brampton). The other five run on the template `focus/facilities/landmarks` fields.

Positives: pages honestly state "We do not have an office in X; crews travel from 243 Queen St W" (no fake local-office signal, no map embed), distinct focus lines, FAQPage + CleaningService schema, real reviews (not attributed to a city), internal links to services. This is not classic doorway spam, and 7 is a small count.

| Page | Unique vs peers | 60% gate | Verdict |
|---|---|---|---|
| /locations/mississauga/ | 32-33% | Fail | **Keep indexed; borderline.** Best of the set (client copy, named business districts). Add 300-400 words of real specifics (client types served there, a project, access/parking/after-hours building rules, a Mississauga-attributed review) to pass. |
| /locations/vaughan/ | 32-33% | Fail | **Keep indexed; borderline.** Same as Mississauga (Concord/Vaughan Metropolitan Centre specifics, industrial Concord vs corporate VMC). |
| /locations/brampton/ | 13% vs all, 25% vs M/V | Fail | **Thin.** Keep indexed for now (real demand: "commercial cleaning Brampton", warehouse focus), but needs rewrite within one cycle or consolidate into a "Peel Region" page. |
| /locations/markham/ | 13% | Fail | **Thin.** Same; consolidate with Richmond Hill into "York Region" if no evidence appears. |
| /locations/oakville/ | 12% | Fail | **Thin.** Candidate for merging into "Halton" or noindex if not enriched. Copy flagged `needsClientReview`. |
| /locations/etobicoke/ | 12% | Fail | **Thin.** Etobicoke is inside Toronto and the near neighbour of the office, so it has real local relevance. Needs genuine detail (Airport Rd, Dixon Rd industrial areas, etc.) from the client. |
| /locations/toronto-downtown/ | 14% | Fail | **Thin.** Strongest local entity signal (office is at 243 Queen St W). Should be rebuilt as the "Toronto" page with office-tower, condo and heritage-building specifics, and with Google Business Profile tie-in. |

Gate result: **0 of 7 pass the 60% bar; 2 are borderline-viable, 5 are template-thin.** I do not recommend noindexing now (small count, genuine service areas, honest copy, the risk is a quality shortfall rather than a penalty), but I do recommend a hard rule: **no new location page until it reaches 60%+ unique text with at least 3 verifiable local facts**, and a deadline (e.g. 90 days) to enrich or merge the five thin pages. Re-measure with the same method after rewrites.

## 5. Uncovered cities: build pages or keep the hub?

Prior repo decision (docs/growth/page-inventory.md, "Considered and not built"): North York, Scarborough, Richmond Hill, Durham "no local evidence or priorities (intake C5)". C5 is an open client question; no analytics existed.

Arguments against the decision:
1. "No local evidence" is overstated. The business states all of these areas itself: site.ts service-area line (Toronto incl. North York, Scarborough, East York, York; Richmond Hill) and the client's own Google Ads copy of 2026-09-30 (Pickering, Ajax, Oshawa; landing.ts). The business is spending ad money to attract those searchers, and the 13 other pages in the site already name them. A paid landing page and an organic page for the same area are not in conflict.
2. The hub gives zero ranking surface: the six names are text, not links, and a "service areas" list cannot match a "commercial cleaning Scarborough" query.
3. North York and Scarborough are inside the City of Toronto and are two of the largest commercial/industrial districts in the GTA (North York Centre, Consumers Road, Scarborough Town Centre/Markham Rd industrial). Skipping them while having pages for Oakville is hard to justify on volume grounds.
4. Ads data already exist to settle it: Google Ads search terms and Search Console queries by city, which is the "analytics" that C5 said was missing.

Arguments for the decision (these hold, and decide the recommendation):
1. The existing seven pages fail the 60% test because they have no local evidence. Six more of the same would take the set to 13 thin pages and make the problem worse. The binding constraint is evidence, not page count.
2. The local pack is driven by proximity to a single Toronto office, so a city page outside Toronto helps organic blue-link results only, not the map pack.
3. Durham (Pickering/Ajax/Oshawa) is the furthest ring and the only support is a seven-month-old ad doc; the business also says it has no client list there.

Recommendation (a middle path):
- **Do now, no new URLs:** link every area on the hub (the six uncovered names go to the closest real page or to an anchored section), and pull Search Console and Google Ads search-term data by city to answer C5.
- **Build only on evidence, in this order:** (1) **North York** and (2) **Scarborough** as Toronto-district pages if the client can supply 3+ real facts each (named buildings or districts served, a client type, a project); (3) **Richmond Hill** only together with Markham as a stronger "York Region" treatment if Search Console shows impressions; (4) **one combined "Durham Region" page** (Pickering, Ajax, Oshawa) rather than three city pages, and only after the client confirms they still travel there. Do not build Pickering, Ajax and Oshawa as three templates.
- Hold the line that each new page must pass the 60% gate, otherwise the hub plus coverage text is enough.

## 6. Proposed sitemap structure (ideal)

Why split at only 73 URLs: not for limits (7 KB vs 50 MB), but for diagnostics. Search Console shows indexed/not-indexed per sitemap, so a type split tells you immediately whether locations are being indexed and whether posts are going stale. This mirrors Jan-Pro (benchmark below).

```
/sitemap-index.xml            (with <lastmod> = newest child lastmod)
 ├─ /sitemap-pages.xml        home, about-us, our-process, reviews, contact-us, request-a-quote, cleaning-demo-gallery, green-clean-products   (8)
 ├─ /sitemap-services.xml     /services/ + 9 service pages                                                                                     (10)
 ├─ /sitemap-industries.xml   /industries/ + industry pages (2 now, 6-10 target)                                                              (3 now)
 ├─ /sitemap-locations.xml    /locations/ + 7 city pages (+ future pages that pass the gate)                                                   (8)
 └─ /sitemap-insights.xml     /insights/ + 38 posts                                                                                            (39)
```
Total 68 URLs now (73 minus /search/, /insights/page/2-4/, /privacy/). Excluded: /search/, /insights/page/N/, /privacy/, /thank-you/, /lp/*, /category/*, /tag/*, /admin/*, 404.

Rules:
- `<lastmod>` only where real: static pages from the last git commit date touching that page's content/data file (about-us, services.ts entries, locations.ts entries), blog posts from `pubDate` and a new optional `updatedDate` in src/content.config.ts, hubs from the newest child. **Only the meaningful content date, never build time** (a build-time stamp makes all 73 identical and Google ignores the field). Format W3C date `YYYY-MM-DD`.
- No `changefreq`/`priority` (already correct).
- Implementation notes: @astrojs/sitemap supports `filter` and `serialize` (use for `lastmod` and exclusion; check the installed version for a `chunks` option for the split, otherwise a small post-build script that writes the five files and the index). The Worker's `LIST_PATHS`/`injectSitemap` currently target `/sitemap-0.xml` and must be pointed at `/sitemap-insights.xml`. Keep the `/sitemap.xml` -> index 301 or serve it directly.
- robots.txt: keep `Sitemap:` line; optionally add `Disallow: /admin/` and `/api/` (neither should be crawled), but never disallow `/lp/` or `/search/` (noindex must be seen).

### Benchmark: Jan-Pro (https://jan-pro.com/sitemap_index.xml, Rank Math)
Verified: 21 child sitemaps, each with `<lastmod>`: 16 `post-sitemapN.xml` (200 URLs each, last has ~46; about 3,000 posts), 4 `page-sitemapN.xml` (200/200/199/63 = 662 pages), 1 `industries-sitemap.xml` (25 URLs, a custom post type: /who-we-clean/office-cleaning/, /dental-offices/, /medical-facility/hospitals/, /schools-universities/, /day-care-centers-preschools/, /restaurants/, /banks-financial-institutions/, /auto-dealerships/, /fitness-centers/, /religious-facilities/, /laboratories/, /government/, /warehouses/, etc.), per-URL `<lastmod>` and image entries, no `changefreq`/`priority`. Takeaways: (1) type-split with real lastmod; (2) **industries are a first-class sitemap of 25 vertical pages**, which is the largest structural gap against Evergreen's 3; (3) Jan-Pro is a franchisor with ~660 pages and 3,000 posts, so scale is not comparable: copy the structure, not the volume. Evergreen's blog (38 posts, last 2023) is also a freshness gap: a few updated or new posts a quarter would give lastmod something real to say.

## 7. Industry-template page list (commercial cleaning)

Current industry data (src/data/industries.ts): 7 categories, 2 with their own page. Current services (9): office, commercial, building-maintenance, industrial, disinfection, emergency, post-construction, pressure-washing, graffiti-removal.

Principle: one page per **industry** (that is what buyers search: "dental office cleaning", "warehouse cleaning", "daycare cleaning"), carrying a services-for-this-industry matrix and linking down to the existing service pages. Do **not** generate the full services x industries cross-product (about 9 x 12 = 108 near-duplicates): that is exactly the doorway pattern the 60% gate exists to block. Build a cross-product page only for the few where the combination is a distinct service with its own compliance content (marked below).

| Industry hub page | URL | Status | Primary services linked | Evidence in repo | Priority |
|---|---|---|---|---|---|
| Medical and dental clinics | /industries/medical-dental-clinics/ | **EXISTS** (1,209 words) | disinfection, office | dental checklist post | done |
| Property management and condos | /industries/property-management/ | **EXISTS** (1,179 words) | building maintenance, emergency, pressure washing | review, quote-form | done |
| Offices and professional firms | /industries/offices/ | **MISSING** | office, commercial, disinfection | /services/office-cleaning/ (1,563 words) overlaps heavily | Decide: either build as a short buyer-guide that links to the service, or have the hub card keep pointing to the service page (current choice). Low priority. |
| Industrial, warehouse and logistics | /industries/industrial-warehouse/ | **MISSING** | industrial, building maintenance, pressure washing, post-construction | Brampton and Mississauga copy lead with warehouses; strongest unserved vertical | **P1** |
| Retail stores and showrooms | /industries/retail/ | **MISSING** | commercial, building maintenance (strip/wax), post-construction | a-cleaning-checklist-for-your-retail-store post | **P1** |
| Education, daycares and schools | /industries/education-daycares/ | **MISSING** | disinfection, commercial | cleaning-protocols-for-daycares-and-schools post | **P1** |
| Hospitality and restaurants | /industries/hospitality/ | **MISSING** | commercial, pressure washing, emergency | listed on hub; thin evidence | P2 (needs client facts) |
| Fitness and recreation | /industries/fitness-recreation/ | **MISSING** | disinfection, commercial | "recreation" on hub only | P3 |
| Banks and financial offices | /industries/financial-offices/ | **MISSING** | office, commercial | none | P3 (only if client has this work) |
| Auto dealerships and showrooms | /industries/auto-dealerships/ | **MISSING** | commercial, building maintenance | none | P3 |
| Government and public buildings | /industries/government-public/ | **MISSING** | commercial, disinfection | hub mention only | P3 |
| Religious / community buildings | /industries/community-religious/ | **MISSING** | commercial | none | P3 (Jan-Pro has it) |

Cross-product pages worth building later (only where the content is genuinely distinct): `/industries/medical-dental-clinics/` x disinfection (already a section), post-construction x medical (compliance-driven, infection-control during renovation), emergency/water-damage x property management. Everything else belongs as a section on the industry hub.

Target: 8-9 industry pages (P1 plus the existing two plus offices), each 800+ words, <40% overlap with its sibling and service page, with its own reviews/FAQ/quote tag (`industry-<slug>` pattern already exists). Industry sitemap file would then show about 10 URLs against Jan-Pro's 25.

## 8. Prioritised fixes

1. (High) Remove `/search/` from the sitemap and `noindex, follow` it. 15-minute change (astro.config.mjs filter + page prop).
2. (Medium) Drop `/insights/page/2-4/` from the sitemap; keep crawlable.
3. (Medium) Add accurate `<lastmod>` (git dates, post pubDate/updatedDate) and a lastmod on the index; make the Worker-injected entries consistent.
4. (Medium) Split sitemap by type (section 6); update the Worker's `LIST_PATHS`.
5. (Medium) Location rewrite plan: lift Mississauga/Vaughan to 60%, enrich or merge the other five; set up city-level Search Console/Ads data to answer intake C5 before building any new city page.
6. (Medium) Build industries P1 trio (industrial/warehouse, retail, education/daycares); link relevant blog posts to and from them. 
7. (Low) Change the 307 slash redirects to 301/308; link the six uncovered area names from the hub; cap the sidebar tag list; refresh or add 2-4 blog posts.

## 9. Score: 70/100

| Area | Points | Reasoning |
|---|---|---|
| XML validity, size, discovery | 15/15 | Valid, robots reference, index chain works, tiny. |
| URL health (200, canonical, indexable, no redirects, noindex excluded) | 24/25 | 73/73 clean. -1 because /search/ is indexable. |
| Inclusion hygiene | 6/10 | /search/ (orphan, utility) and 3 pagination URLs included. |
| lastmod | 2/10 | None on 73 URLs; inconsistent with Worker-added entries. Deprecated tags correctly absent (no deduction). |
| Architecture and splitting | 6/12 | Single flat file; no type split; posts barely linked from commercial pages; 3 industry URLs vs Jan-Pro's 25. |
| Location-page quality gate | 6/12 | Count gate passes and copy is honest, but 0 of 7 pass the 60% test (12-33% unique). |
| Coverage of stated service area | 4/8 | 6 of 15 areas have no page; hub text unlinked; the "no local evidence" decision is defensible only if C5 data is gathered. |
| Redirect handling | 7/8 | 154 rules work, none in the sitemap; -1 for 307 on slashless URLs. |
| **Total** | **70/100** | |

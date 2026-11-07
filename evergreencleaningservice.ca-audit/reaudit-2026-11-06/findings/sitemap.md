Score: 94/100
Previous: 90/100 (first audit)

# Sitemap re-audit: www.evergreencleaningservice.ca (6 Nov 2026, evening)

Method. I read raw/sitemap-index.xml, sitemap-pages-0.xml, sitemap-insights-0.xml and sitemap-urls.txt. I checked all 60 URLs against raw/crawl/pages.json (status, meta robots, canonical). I re-fetched 5 URLs live: /sitemap-index.xml, /sitemap-pages-0.xml (byte-identical to the raw copy), /locations/north-york/, /locations/durham-region/ and /office-cleaning-checklist/. All 5 returned 200. I read src/lib/sitemap-lastmod.mjs, src/data/hub-dates.ts and src/data/locations.ts, and mapped each lastmod timestamp to its git commit. The claude-seo discovery script was not run (it refuses this sandbox).

## 1. Status of first-audit findings

| # | First-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | 16 to 17 URLs shared one shared-template timestamp (2026-10-31T14:11:02Z) | Fixed | Live sitemap-pages-0.xml has no 10-31T14:11 stamp. The sources in sitemap-lastmod.mjs now exclude OfferPage.astro, the [slug] routes and the whole locations.ts / location-local.ts files. Locations use a per-location `updated` field and hubs use hub-dates.ts. The #81 hover-polish commit moved no hub date: /industries/ is still 2026-10-15T17:55:46Z, and /locations/ takes the newest of its members. Remaining clusters are real commits (see 2.2). |
| 2 | Insights lastmod rests on frontmatter dates (unverified) | Open (Info) | Still `updatedDate` or `pubDate`. Dates run 2020 to 2026-11-06, and 5 posts and the hub are dated 11-06. I did not diff post bodies. |
| 3 | Shallow-clone dependence of lastmod; add a CI check | Fixed (code only) | The header comment says the build test (tests/build/indexability.test.ts) now fails when any URL lacks lastmod, and the deploy scripts run the tests first. I did not open or run the test. Live: all 60 `<url>` entries have `<lastmod>`. The repo is still shallow locally. Whether CI uses full history is not verified. |
| 4 | /insights/page/2/ and /3/ left out of the sitemap | Not applicable (still correct) | Neither is in sitemap-urls.txt, and both are still 200 and indexable. No change needed. |
| 5 | Worker live-post sitemap entries untestable | Open (Info) | No admin-published posts exist: the insights file holds exactly the repo posts plus the hub (25 URLs). Still untestable. |
| 6 | Unused XML namespaces | Not applicable | Unchanged, harmless. |
| 7 | Image and video sitemaps not recommended | Not applicable | No change, and still no reason to add one. |
| 8 | robots.txt Sitemap directive | Fixed (was already correct) | raw/robots.txt still points to the absolute https://www host sitemap-index.xml. The index returns 200. The `Content-Signal` Lighthouse notice is out of scope. |
| 9 | Location gate: 7 pages, passes; consider North York, Scarborough, Richmond Hill, one Durham page | Fixed (recommendation adopted) | There are now 11 location pages plus the hub, all 200 and self-canonical. This is under the 30-page warning. See section 2.3. |
| - | Quick win: exclude shared templates from lastmod | Fixed | See #1. |
| - | Quick win: CI lastmod check | Fixed (code only) | See #3. |

## 2. Fresh checks

### 2.1 URL integrity: pass
- The index has 2 child sitemaps. The pages file has 35 URLs and the insights file has 25, so 60 in total. This matches sitemap-urls.txt (60, no duplicates).
- All 60 URLs are in pages.json with status 200, no noindex in meta robots, and a canonical equal to the URL. Zero issues. No redirects, no non-slashed forms.
- The XML is well formed. There is no `changefreq` or `priority`. Every lastmod is a valid W3C datetime. The files are about 5 KB each, far below the limits.
- The two blog posts merged with 301s are not listed. The merge targets are listed.
- The 4 new location pages and /office-cleaning-checklist/ are in the sitemap with a self-canonical, a unique title and a meta description.

### 2.2 Lastmod plausibility by section
- Posts (25): dates follow `updatedDate` or `pubDate`. 18 posts are dated 2020 to 2023 and not touched. The 11-06 dates fit the checklist (new), /commercial-cleaning-air-quality/ and /areas-in-your-office-where-germs-are-likely-hiding/. I did not diff the two older ones (see Not verified).
- Locations (11): every date comes from its own `updated` field, with a reason comment on each. The 11-06T14:57:18Z entries (Etobicoke, Markham, Brampton) match the guides-link paragraph added in e33ad58. The 15:15:07Z entries (Mississauga, Vaughan) match the intro rewrites in b49f253. The 16:12:26Z entries are the 4 new pages plus Toronto-downtown (areas and FAQ added) and Oakville (QEW paragraph). One edit to a city no longer moves the others. The schema `dateModified` equals the sitemap date (checked on durham-region: 2026-11-06T16:12:26.000Z).
- Hubs: /industries/ is 2026-10-15 (its own text), /services/ is 18:57:29Z (newest member) and /locations/ is 16:12:26Z (newest member). This is coherent and documented in hub-dates.ts.
- Other pages: the dates are the last commit to the page's own files. Several share a stamp because one commit really edited them: e33ad58 (Phase 1) gave 11-06T14:57:18Z to /privacy/, /green-clean-products/ and /services/building-maintenance/. b49f253 (Phase 2) gave 15:15:07Z to /contact-us/, /request-a-quote/, /services/disinfection-cleaning/ and /services/pressure-washing/. 19b8e53 (GEO copy) gave 18:57:29Z to /about-us/, /services/commercial-cleaning/ and /services/office-cleaning/. This is honest. The clusters are of an ordinary size (3 to 4 URLs) and tied to commits that did change copy.
- The pages sitemap shows 24 of 35 URLs stamped 11-06 and the insights sitemap shows 5 of 25. This is true to the day's work, but it is a heavy day for a site whose earlier pages were dated 10-29 to 10-31. It is not a defect (see N1).

### 2.3 Location quality gates (11 pages)
- Count: 11 location pages plus the hub is 12, under the 30-page warning and the 50-page hard stop. No gate triggered.
- Uniqueness (my 6-word-phrase measure of `<main>` text against the other 10 pages, so different from the first audit's 7-page measure):

| Page | Words | Unique 6-grams |
|---|---|---|
| Toronto-downtown | 1,065 | 69% |
| Mississauga | 1,197 | 71% |
| Etobicoke | 873 | 63% |
| Vaughan | 998 | 70% |
| Markham | 847 | 63% |
| Brampton | 862 | 64% |
| Oakville | 873 | 64% |
| North York (new) | 1,129 | 69% |
| Scarborough (new) | 1,070 | 68% |
| Richmond Hill (new) | 990 | 69% |
| Durham Region (new) | 997 | 67% |

  All 11 pass the 60% bar. The 4 new pages score 67 to 69%, above the 7 older ones, and the older 7 did not fall below it as the set grew. The two lowest are Etobicoke and Markham at 63%.
- Local signals on the new pages (src/data/locations.ts): named districts and roads (Yonge and Sheppard, Consumers Road, Don Mills, the Steeles and Finch industrial belt; Scarborough Centre, Progress Avenue, Golden Mile, Milliken; Beaver Creek, Headford, Elgin Mills; Brock Road, Salem, Harwood, Stevenson Road). Each page also has its own facilities list, FAQ and map query, plus Service, WebPage, BreadcrumbList and FAQPage JSON-LD, 1 iframe and 2 images. No page makes a false claim of a branch. Durham is one regional page, not three city pages, which is the structure the first audit recommended.
- Doorway risk: low to moderate. The content is not a city swap. Each page has its own geography, but the copy is "written from public knowledge of the districts, not from client-supplied facts". No clients, buildings or counts are named, so there is no first-party evidence on the page. Every one of the four sets `needsClientReview: true`. See N2.

### 2.4 The four new pages and the new guide
- /locations/north-york/, /scarborough/, /richmond-hill/ and /durham-region/: 200, indexable, self-canonical, with unique titles and meta descriptions. Each has about 88 to 94 internal links, and 88 other pages link to each of them (sitewide nav or footer). They are not orphaned.
- /office-cleaning-checklist/: 200, self-canonical, 2,098 words, BlogPosting schema, in the insights sitemap, with 60 pages linking to it. Its lastmod and `dateModified` are both 2026-11-06T00:00:00Z. The guide was committed at 16:01 UTC, so the same-day date is accurate.

## 3. New findings

N1. Info. The sitemap date spread is now thin for the week.
- Evidence: 24 of 35 pages-sitemap URLs fall on 6 Nov, because Phases 1 to 3 touched most pages.
- Recommendation: none. Do not touch any file just to move a date. Keep to the hub-dates.ts rule, and the dates will separate again over the coming weeks.

N2. Low. Doorway-page mitigation for the four new pages rests on client review that has not happened.
- Evidence: `needsClientReview: true` in src/data/locations.ts on 8 of the entries (I did not see which 3 older entries lack it). Nothing outside locations.ts reads the flag. The new pages have no client, project or testimonial evidence from those areas, and the Durham reach in src/data/coverage.ts is stated as unconfirmed.
- Recommendation: ask the client to confirm the crew travels to Pickering, Ajax and Oshawa. Add one real, permissioned fact per page (a building type actually served, a crew-travel note). Then clear the flag. If Durham is not confirmed, set the page to noindex or remove it from the sitemap until it is. Consider a build test that fails when a flagged page is listed, if client sign-off is meant to gate indexing.

N3. Low. Etobicoke and Markham are the closest to the 60% uniqueness bar (63%).
- Evidence: the table in 2.3. This is a measure of 6-word phrase overlap, not a Google metric.
- Recommendation: if more location pages are added, give those two a district-specific paragraph first (src/data/locations.ts or src/data/location-local.ts). Adding pages makes shared boilerplate count against each page more, so re-run the check on each addition.

N4. Info. Hub dates now depend on a manual rule.
- Evidence: src/data/hub-dates.ts and the `updated` fields need a person to bump them when text changes. A forgotten bump leaves the date too old, and it cannot be too new.
- Recommendation: acceptable. A code reviewer should check these two places whenever a location or hub text changes.

No regressions found.

## 4. Needs the client or an account owner
1. Confirm that the crew actually serves Pickering, Ajax and Oshawa (and Richmond Hill, North York, Scarborough). Supply one permissioned fact per new page. This clears `needsClientReview` (N2).
2. Search Console owner: submit or re-read https://www.evergreencleaningservice.ca/sitemap-index.xml. Check discovery of the 60 URLs and of the 4 new pages, and the status of the redirected old posts.
3. Whoever runs CI/deploy: confirm the deploy uses full git history (`fetch-depth: 0` or unshallow), so no URL loses lastmod.

## 5. Not verified
- Search Console coverage, indexing or submission status (no access). Live indexability was judged from the crawl and 5 live fetches, not from Google.
- Per-URL status for the other 55 URLs comes from pages.json (crawled earlier today), not a fresh fetch.
- Whether the 11-06 `updatedDate` on /commercial-cleaning-air-quality/ and /areas-in-your-office-where-germs-are-likely-hiding/ reflects a significant edit.
- The tests/build/indexability.test.ts assertion on lastmod: I read the description of it in the code comment, but did not run it.
- Worker-generated sitemap entries for live posts (none exist).
- Which 3 older location entries lack `needsClientReview` (grep count 8 of 11; I did not open each entry).
- Content quality beyond the 6-gram overlap and the data-file signals: I did not read the rendered new pages in full for factual accuracy of the local detail.

Score: 93/100
Previous: 94/100 (re-audit 7 Nov)

# Sitemap audit, 11 Nov 2026 (third audit)

Method: raw/sitemap-index.xml, sitemap-pages-0.xml, sitemap-insights-0.xml, sitemap-urls.txt checked against raw/crawl/pages.json (status, meta robots, canonical) with a script. Lastmod values mapped to git commits (git log, git show --stat). Location text from the saved HTML: 6-word-phrase overlap of `<main>` text across the 11 pages, plus a read of the review and Durham passages. No fresh live fetches (the crawl is from today). The claude-seo discovery script was not run (it refuses this sandbox).

The 1-point drop is for the Durham claim (N1) staying live and indexed with no client confirmation. The sitemap itself is clean.

## 1. Status of re-audit findings

| # | Re-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | Shared-template lastmod clusters fixed | Fixed (holds) | Photo-hero change #93 touched only OfferPage.astro and re-dated no page (13 pages unchanged). The 4 URLs stamped 2026-11-11T20:22:24Z (/, /services/, /services/commercial-cleaning/, /services/janitorial-services/) are all tied to commit 49583e2 (#91, 15:22:24 -05:00 = 20:22:24Z), which really changed them (see 2.2). |
| 2 | Insights lastmod rests on frontmatter dates | Open (Info) | Still `updatedDate`/`pubDate`. Post bodies not diffed. |
| 3 | CI lastmod check | Fixed (code only) | All 62 `<url>` entries have `<lastmod>`. I did not run tests/build/indexability.test.ts or check CI clone depth. |
| 4 | /insights/page/2/ and /3/ not listed | Not applicable (still correct) | Not in sitemap-urls.txt. |
| 5 | Worker live-post sitemap entries untestable | Open (Info) | The insights file is 26 URLs: the repo posts plus the hub, nothing admin-published that I can tell. |
| 6, 7 | Unused XML namespaces, image/video sitemaps | Not applicable | Unchanged and harmless. |
| 8 | robots.txt Sitemap directive | Fixed (holds) | raw/robots.txt unchanged; the index lists both children with absolute https://www URLs. |
| 9 | Location gate (11 pages) | Fixed (holds) | Still 11 pages plus hub; no gate triggered (see 2.3). |
| N1 | Date spread thin (24 of 35 on 6 Nov) | Fixed / resolved | Dates now spread over 29 Oct to 11 Nov. Pages sitemap: 11 on 6 Nov, 14 on 7 Nov, 4 on 11 Nov. No action was needed. |
| N2 | Doorway mitigation depends on unreviewed content; Durham reach unconfirmed | Partly fixed | 7 Nov removed the "we operate in Durham" claims: the page now says "We do not have an office in Durham Region: crews travel from our Toronto base at 243 Queen St W", and /locations/durham-region/ is only a service-area page. But the page still answers "Are Pickering, Ajax and Oshawa in your service area? Yes, all three are", and the Service JSON-LD `areaServed` lists the three cities. src/data/coverage.ts still says the reach is unconfirmed. `needsClientReview: true` is still set on 6 entries in src/data/locations.ts, and the page is still indexable and in the sitemap. See N1. |
| N3 | Etobicoke and Markham close to the 60% bar | Partly fixed | My measure (different from last time's, see 2.3) gives both exactly 60%. They are still the lowest, with no gap above the bar. |
| N4 | Hub dates depend on a manual rule | Open (Info) | Unchanged. /locations/ (11-07T17:56:48Z) matches its newest member. /services/ moved to 11-11T20:22:24Z with the new janitorial member, as the rule in hub-dates.ts says. |
| - | Client item: confirm Durham, supply a fact per page | Open | No sign of client input in the repo or on the pages. |

## 2. Fresh checks

### 2.1 Validity and URL integrity: pass
- Index: 2 children. Pages file 36 URLs, insights file 26, total 62 (was 60), matching sitemap-urls.txt (62, no duplicates). The two new URLs are in: /services/janitorial-services/ (pages) and /commercial-cleaning-quote-checklist/ (insights).
- All 62 URLs are in pages.json with status 200, no noindex, and a canonical equal to the URL. Zero exceptions, no redirects or non-slashed forms.
- No `changefreq` or `priority`. The XML parsed (regex check of `<url>` counts; the files are a few KB). The `/tag/*` noindex pages are not listed, correctly.

### 2.2 Lastmod honesty by section
- Pages (36): 10-15 (/industries/), 10-29, 10-30 and 10-31 (older), 11-06 (11), 11-07 (14), 11-11 (4). The 11-07 clusters are real commits: 17:56:48Z locations (3fa99a3), 18:09:44Z medical, disinfection, industrial and post-construction (6f4f4de, copy and claims), 21:20:18Z about, contact, quote, office-cleaning (5eba139, the office-hours qualifier).
- 2026-11-11T20:22:24Z for the home page, /services/, commercial-cleaning and the new janitorial page is honest. Commit 49583e2 edited commercial-cleaning.md (retitled), added janitorial-services.md, and changed ServicesOverview.astro (home) and the Footer. It was a content change on all four. /services/janitorial-services/ is new, so a same-day date is correct.
- The 13 photo-hero pages did not move. That is correct under the policy, since a hero image is not a content change. It also means these pages' lastmod does not reflect the new images. I count that as Info, not a defect.
- Insights (26): /commercial-cleaning-quote-checklist/ is 2026-11-10 (published 1b6abbf, 10 Nov), and /insights/ is also 2026-11-10 (newest member). That is accurate. The index-level lastmods (insights 11-10, pages 11-11T20:22:24Z) match the newest child entries. Not verified: the 11-06 dates on two older posts (carried over).
- Locations (11): per-location `updated`. The 7 Nov change moved 5 pages (North York, Richmond Hill, Scarborough, Durham, Vaughan) to 17:56:48Z and left Brampton, Etobicoke, Markham, Mississauga, Oakville and Toronto-downtown on 6 Nov. That fits the commit (3fa99a3: review framing and Durham edits). Etobicoke, Markham and Brampton also carry the review quote line, so check that their 6 Nov dates are right. See N3.

### 2.3 Location quality gates (11 pages, hub excluded)
- Count 11, under the 30-page warning and the 50-page stop. No gate triggered.
- Uniqueness (6-word-phrase overlap of `<main>` text vs the other 10 pages; the crawl text includes shared form and nav text, so numbers differ from last time): Mississauga 75%, Toronto-downtown 71%, North York 70%, Scarborough 70%, Vaughan 70%, Richmond Hill 68%, Durham 67%, Brampton 63%, Oakville 62%, Etobicoke 60%, Markham 60%. All meet 60%, with Etobicoke and Markham exactly at the bar. This is a phrase-overlap measure, not a Google metric.
- Review framing: pass. Where a quote is shown (Toronto-downtown, Mississauga, Brampton, Vaughan, Oakville, Etobicoke, Markham), it sits under "From our Google reviews", is attributed by name with "Google review" and a date, and is followed by a link to all the Google reviews. No page presents a quote as a client in that city. The four newest pages (North York, Scarborough, Richmond Hill, Durham) carry no quote, only "What our clients across the GTA say: read our Google reviews". Two quotes are dated "around" a month ("around September 2026", "around January 2026", "around 2025"). Fine, but vague.
- Durham: the page says it has no Durham office, crews travel from 243 Queen St W (distances stated as about 35, 45 and 60 km), and Whitby "is not listed as a service area on its own". No claim of a local branch. The unconfirmed item is the service itself (N1).

## 3. New findings

N1. Medium. Durham Region service claim is still public, indexable and unconfirmed.
- Evidence: /locations/durham-region/ (200, indexable, in sitemap, lastmod 11-07T17:56:48Z) answers "Are Pickering, Ajax and Oshawa in your service area? Yes, all three are", names "Facility types served" in the three towns, and has Service `areaServed` for the three cities. src/data/coverage.ts says the reach "stays where it is ... until the client confirms it". `needsClientReview: true` is set on 6 entries in src/data/locations.ts, and nothing outside locations.ts reads it.
- Recommendation: client confirms Pickering, Ajax and Oshawa. Until then, either soften the FAQ and `areaServed` in src/data/locations.ts (for example "ask us about Durham"), or add the page to a noindex/sitemap exclusion. Optionally add a build test that fails when a `needsClientReview` page is indexable, if sign-off is meant to gate indexing.

N2. Low. Location copy is still public-knowledge writing, with no first-party evidence.
- Evidence: no client, building or count is named on any of the 11 pages. Doorway risk stays low to moderate (own geography per page, not a city swap). The same flag applies to the 6 flagged pages.
- Recommendation: one permissioned, real fact per page, then clear `needsClientReview`.

N3. Low. Etobicoke and Markham sit exactly at 60% on this measure, and their lastmod (11-06T14:57:18Z) predates the 7 Nov review-framing edit.
- Evidence: section 2.3 and 2.2. I did not diff what 3fa99a3 changed on these two files.
- Recommendation: add a district-specific paragraph to each in src/data/locations.ts or src/data/location-local.ts before adding any twelfth location page. If the 7 Nov edit changed their visible text, check that their `updated` fields were bumped (hub-dates rule). A forgotten bump leaves the date too old, not too new.

N4. Info. No hard fails found. The new URLs (janitorial page, quote checklist) are 200, self-canonical, indexable, with unique titles (52 chars each) and meta descriptions (147 and 140 chars), and with honest lastmod. The pages' new photo heroes do not change lastmod, by policy.

No regressions found.

## 4. Needs the client or an account owner
1. Confirm whether the crew serves Pickering, Ajax and Oshawa, and supply one permissioned fact per location page. This clears `needsClientReview` (N1, N2).
2. Search Console owner: re-read https://www.evergreencleaningservice.ca/sitemap-index.xml and check discovery of all 62 URLs, including /services/janitorial-services/ and /commercial-cleaning-quote-checklist/.
3. Whoever runs CI/deploy: confirm the deploy uses full git history so no URL loses lastmod.

## 5. Not verified
- Search Console coverage, indexing and submission status (no access). Indexability was judged from the 11 Nov crawl, not from Google.
- A fresh per-URL live fetch: status, robots and canonical come from pages.json.
- The two 11-06 insights dates (older posts) and whether older insights `updatedDate` values reflect significant edits.
- The tests/build/indexability.test.ts lastmod assertion, and CI clone depth.
- What commit 3fa99a3 changed on Etobicoke, Markham and Brampton (N3).
- The factual accuracy of local detail (roads, distances, districts) on the location pages.

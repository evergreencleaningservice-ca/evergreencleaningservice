Score: 74/100
Previous: 72/100 (re-audit 7 Nov)

# Content Quality audit: www.evergreencleaningservice.ca (11 Nov 2026)

Scope and method:
- All 94 crawled URLs in raw/crawl/pages.json (all 200). Main-content text taken from `<main>` with nav, aside, script, style, form and noscript removed, after undoing the crawler's Latin-1 decoding. Cache: /tmp/claude-0/-home-user-evergreencleaningservice/692c77ca-669b-54d4-b608-18eee442d35d/scratchpad/c3/main.json.
- No page was refetched: the crawl post-dates every deploy listed in the brief.
- Overlap is measured as 5-word-shingle Jaccard and verbatim shared sentences (8+ words), same method as the 7 Nov re-audit.
- Git history 6 Nov..HEAD read for scope of the copy commit (6f4f4de) and the janitorial page (#91, 49583e2). Repo not modified.

Sub-scores (this skill's internal model, not Google's):

| Factor (weight) | 7 Nov | Now | Why it moved |
|---|---|---|---|
| Experience (20%) | 46 | 47 | Gallery is now honestly labelled as stock, which helps trust but not experience. Still no first-hand photos, case studies, named staff or city-matched jobs. |
| Expertise (25%) | 68 | 70 | The quote checklist is accurate, practical and cites CCOHS and WSIB. Remaining "research shows"/"according to experts" claims now cite sources (Cardinale et al. 2017, CCOHS bleach sheet). |
| Authoritativeness (25%) | 60 | 60 | No change: no associations, awards, press, client logos or named people. |
| Trustworthiness (30%) | 82 | 84 | Stock disclosure on the gallery; 2-hour reply qualified with office hours everywhere; cost guide title is honest. WSIB, insurance and bonding still asserted, not evidenced. Homepage testimonials still unsourced. |
| Weighted E-E-A-T | ~66 | ~67 | |
| AI citation readiness | 76 | 78 | New definitional opener on /services/janitorial-services/; the quote checklist uses question H2s with answer-first first sentences and a comparison table. "At a glance" blocks are still tables of contents. |

Overall 74: the 7 Nov copy fixes all landed, and the two new pieces are competent, but the janitorial page and the commercial page now compete for the same definition and the same query, and none of the E-E-A-T gaps that need the client moved.

---

## 1. Status of every 7 Nov finding (reaudit-2026-11-06/findings/content.md) and critic.md C4, C5, C7, C8, C9

### 1a. The 7 Nov copy fixes named in the brief

| Fix | Status | Evidence now |
|---|---|---|
| "nine other GTA municipalities" | **Fixed** | /services/commercial-cleaning/: "cleans commercial premises across Toronto and nine other GTA municipalities from one office at 243 Queen St W". Toronto plus Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax, Oshawa is nine. No other "eight/ten/11 other" count on any page. |
| Homepage "commitments" | **Fixed** | /: "Why Toronto businesses choose Evergreen. Four commitments we make to every client: the same crew at every visit, a scope agreed at a free walkthrough…". "guarantee" appears on 0 pages. |
| Gallery labelled as stock | **Fixed** | /cleaning-demo-gallery/: "The photographs on this page are illustrative stock photographs, not pictures of Evergreen Office Cleaning's own crews or of clients' buildings." Description: "Illustrative stock photographs of commercial cleaning equipment…" (140 chars). |
| Cost guide title has "cost" again | **Fixed** | /office-cleaning-cost-toronto-guide/ title "Office Cleaning Costs in Toronto: How Pricing Works" (51), H1 "What Drives Office Cleaning Costs in Toronto", description "Toronto office cleaning prices depend on floor area, washrooms, visit frequency and scope…" (154, no longer echoes the title). |
| Unsourced claims removed or cited | **Fixed** | Sitewide search for "studies show / according to / research shows / a report from / NN%" finds only the cited CCOHS 67% on the slips post (and its excerpt on /insights/page/2/) and Ontario's 13% HST on the cost guide. |
| Varied closing sentences | **Fixed** (2 legacy leftovers) | Closing sentences of all 25 posts are distinct, each tied to the post's topic (e.g. fridge: "ask for it to be written into the scope of Evergreen's office cleaning service"). Two pre-existing generic sign-offs remain: /5-easy-ways-to-keep-your-commercial-floor-clean/ "Contact us today for more information!" and /a-cleaning-checklist-for-your-retail-store/ "In the GTA, contact us today for all of your retail cleaning and janitorial needs !" (stray space before "!"). |
| Office-cleaning definition no longer duplicated | **Fixed**, but see N-A | "Office cleaning is the recurring cleaning of a workplace's desks…" now appears only on /services/office-cleaning/. The duplication has moved: the janitorial definition now opens both /services/commercial-cleaning/ and /services/janitorial-services/ (new finding N-A). |

### 1b. Every row of the 7 Nov content findings

| # | 7 Nov finding | Status | Evidence now |
|---|---|---|---|
| 1 | No named person (High) | **Open** | 0 occurrences of "Reviewed by", "Written by", "Founded by". The only "Founder" is the homepage testimonial "Allen Robinson, Founder & CEO". The new quote checklist is "By Evergreen Office Cleaning" and its BlogPosting `author` is the Organization. |
| 2 | WSIB, insurance, bonding, 1989 asserted not evidenced (Medium) | **Open** | Same claims on /about-us/, every service page ("WSIB covered, bonded and insured") and the new checklist ("We carry WSIB Ontario coverage and liability insurance"). No clearance number, insurer or "certificate on request". The checklist now tells buyers to ask for a WSIB clearance, which makes the site's own lack of one more visible. |
| 3 | Experience gap: all stock imagery (High) | **Partly fixed** | Disclosure fixed (C4). Still all stock; the page is still indexable (no meta robots); 177 main words. The new checklist's images are also "Illustrative stock photograph." |
| 4a | Thin /request-a-quote/ | **Partly fixed** (unchanged) | 3 main words outside the form; next-steps text sits inside the form. |
| 4b | Thin /contact-us/ | **Open** | 27 main words outside the form. No "what happens next" section. |
| 4c | /green-clean-products/ manufacturer copy | **Open** (C7) | 241 main words. "Armstrong Manufacturing have been a leading chemical manufacturer for 46 years" still present. |
| 4d | /insights/page/2/ and /page/3/ indexable and thin | **Open** | Both 200, no meta robots, 425 and 199 main words. |
| 5a | Mississauga and Vaughan marketing voice | **Fixed** (held) | Both still open with local facts ("Office and commercial cleaning for Mississauga businesses…", "After-hours office and commercial cleaning for Vaughan and Concord…"). |
| 5b | Shared location skeleton and opener | **Open** | 9 of 11 location pages still open "Evergreen Office Cleaning provides commercial and office cleaning in X as part of its coverage across the Greater Toronto Area, which it has served since 1989." "See office cleaning for the full scope." still on 7 pages. |
| 5c | Old testimonials recycled on location pages | **Fixed** | Recycling is gone. Edward Sherman (May 2021) now appears only on /locations/toronto-downtown/ among location pages (removed from North York and Durham); Michael Katchen only on /locations/mississauga/ (removed from Scarborough). North York, Scarborough, Durham, Richmond Hill, Markham, Brampton and Oakville show no client quote. Vaughan (Andy Handy) and Etobicoke (Christopher Perera) keep one each. No review is presented as a client in that city. |
| 6 | Service-page boilerplate | **Open** (now measured) | 35% of /services/janitorial-services/ 5-grams and 31% of /services/commercial-cleaning/ 5-grams also occur on other service pages ("What is included / Scheduling / Scope and limits / How it works / What affects the price" block plus the trust strip). |
| 7a, 7b | Footer anchors | **Fixed** (held) | /services/commercial-cleaning/ inlinks: "Commercial Cleaning" ×190, "Commercial cleaning" ×72; the "& janitorial" label is gone. /services/janitorial-services/ gets "Janitorial Services" ×189 and "Janitorial services" ×60 from all 94 pages. |
| 7c | Homepage vs commercial page both target "commercial cleaning Toronto" | **Open** | Commercial title is now "Commercial Cleaning Services in Toronto \| Evergreen" (dropped "& Janitorial" for #91), closer still to the homepage "Commercial Cleaning Company in Toronto Since 1989 \| Evergreen". |
| 8a | Over-length titles and descriptions | **Fixed** (held) | See N5. |
| 8b | Legacy hook descriptions | **Fixed** (held) | |
| 8c | Gallery description | **Fixed** | 140 chars, honest ("Illustrative stock photographs…"). |
| 9a | Homepage label headings | **Fixed** (held) | |
| 9b | Cost guide repeats H1 | **Fixed** (held) | No H2 repeats the H1. |
| 9c | Footer H2s; commercial page 28 H2s | **Partly fixed** | Footer headings no longer in the H2 outline on any crawled page. /services/commercial-cleaning/ still has 22 H2s across 2,551 words. |
| 10a | Cost guide title promise | **Fixed** | See 1a. |
| 10b | Cost guide gives no real price | **Open** (client) | Figures are still the hypothetical worked example. |
| 11a | Floor post errors | **Fixed** (held) | |
| 11b | Unsourced statistics | **Fixed** | See 1a. |
| 11c | Off-core posts (C9) | **Open** (owner decision) | /keep-your-office-at-home-clean/ (537 words) and /how-to-keep-your-office-fridge-clean/ (562) are indexable, no robots meta. Both now receive a contextual inlink (layout → home office, break rooms → fridge), which strengthens them, so a keep decision has in effect been made by default without GSC data. |
| 11d | Hand-washing merge | **Fixed** (held) | |
| 11e | Seven retitles | **Fixed** (held) | |
| 11f | Freshness: legacy dates, short posts | **Partly fixed** | 25 posts. Only 5 show "Updated …" (decide, daycares, robotic: 30 Oct; air quality, germ hotspots: 6 Nov). Retail, dental, supplies, floor and deep-clean retitles still show only 2020–2022 dates. |
| 12a | Service openers are fragments | **Partly fixed** | Now 2 of 13 service and industry pages open with a definition: /services/commercial-cleaning/ and the new /services/janitorial-services/. /services/office-cleaning/ now opens with a fragment ("Nightly, a few evenings a week or weekly cleaning for Toronto and GTA offices…") and keeps its definition under the H2 "What is office cleaning?", which is still extractable. The other 10 still open with fragments, e.g. disinfection "Surfaces cleaned first, then the points everyone touches disinfected —…". |
| 12b | "At a glance" = table of contents (C8) | **Open** | 19 posts still carry "At a glance:" followed by headings, e.g. /benefits-of-commercial-deep-cleaning-services/ "First Impressions are Important Motivate Your Employees…". Only /about-us/ uses the label for facts. |
| 12c | Few hard company facts | **Partly fixed** (held) | About facts block unchanged; still no quantities. |
| 13 | Homepage testimonials (C5) | **Open** | / still shows "Brenda Carmichael, Toronto Spa Business Owner", "Allen Robinson, Founder & CEO", "Paul Lockheart, Toronto Business Owner", undated and unsourced (src/components/home/Testimonials.astro). |
| N1 | Location pages: shared skeleton, no local proof | **Open** | Same opener on 9 of 11 (5b). |
| N2 | Checklist: "printable", title length, byline | **Partly fixed** | Title now "Office Cleaning Checklist: Daily, Weekly & Monthly Tasks" (56); "printable" is gone from the description ("What to clean in a Toronto office every day, week and month, room by room…"). Byline is still "By Evergreen Office Cleaning". |
| N3 | Guide cluster intent | **Not applicable** (watch item) | Needs Search Console. |
| N4 | East York/York anchors to Downtown | **Fixed** | No internal link anywhere has the anchor "East York" or "York" (0 across 94 pages); they are plain text now. |
| N5 | Over-length metadata | **Fixed** | Across 64 non-tag pages, no description is over 160 or under 70 characters. Only title over 60: the homepage at 61 ("Commercial Cleaning Company in Toronto Since 1989 \| Evergreen"), negligible. /locations/durham-region/ no longer exceeds 60. |
| N6 | Retitled legacy posts keep old preambles | **Open** | /a-cleaning-checklist-for-your-retail-store/ still opens "It takes a lot of work to run a retail storefront…" and ends "contact us today for all of your retail cleaning and janitorial needs !"; /cleaning-check-list-dental-clinics/ still opens "Successful dental offices must look presentable and professional…". Neither shows an "Updated" date. |

Tally for 1b (38 rows, 7a and 7b counted separately): Fixed 16, Partly fixed 7, Open 14, Regressed 0, Not applicable 1. The seven brief-named fixes in 1a are all observed live (one with two legacy leftovers). Nothing regressed; the one side effect is that the definition duplication moved from office cleaning to janitorial (N-A).

### 1c. critic.md items assigned to content

| Item | Status | Evidence now |
|---|---|---|
| C4 Gallery presents stock as own work | **Fixed** | Intro states "illustrative stock photographs, not pictures of Evergreen Office Cleaning's own crews or of clients' buildings"; description says the same. Captions are still job-style ("Dental clinic cleaning: disinfecting an operatory light") but the page-level disclosure covers them. Still indexable, which the critic offered as an alternative, not a requirement. |
| C5 Homepage testimonials undated and unsourced | **Open** | See row 13. |
| C7 /green-clean-products/ manufacturer copy | **Open** | See 4c. |
| C8 "At a glance" as tables of contents | **Open** | 19 posts. |
| C9 No decision on off-core posts | **Open** | See 11c. |

Tally for 1c: Fixed 1 (C4), Open 4 (C5, C7, C8, C9; each also counted in its 1b row).

---

## 2. New findings

### N-A. /services/janitorial-services/ and /services/commercial-cleaning/ define the same thing and target overlapping queries
**Severity: Medium**

Evidence:
- Both pages open with the janitorial definition. Commercial: "Commercial cleaning is the cleaning of business premises, and janitorial services are the scheduled part of it: washrooms, kitchens, floors, trash and touch points, kept up the same way every visit". Janitorial: "Janitorial services are the scheduled upkeep of a building: washrooms, kitchens, floors, trash and the surfaces everyone touches, done the same way every visit."
- The commercial page still carries janitorial sections from before #91: H2s "What commercial cleaning and janitorial services are", "Janitorial services: the daily upkeep", "Commercial cleaning, janitorial or office cleaning?". "janitorial" appears 13 times on it (22 on the janitorial page).
- The janitorial page has its own "Janitorial services or commercial cleaning?" H2 and FAQ "What is the difference between janitorial services and commercial cleaning?". So the same explainer exists twice.
- 31% of the janitorial page's 5-grams and 14 verbatim sentences (22% of its sentences) also appear on the commercial page. Most is the shared service-page block, but the definitions and "difference" sections are the part that matters for intent.
- The pages do link each other (2 in-main links each way), and the commercial title dropped "& Janitorial", so metadata is separated; the bodies are not.

Recommendation: make /services/janitorial-services/ the one page that defines janitorial service. In src/content/services/commercial-cleaning.md, change the opener to define commercial cleaning only (routine plus periodic and one-off work for retail, institutional and mixed-use buildings, as its description already says), cut "Janitorial services: the daily upkeep" to two sentences that link to the janitorial page, and drop one of the two "difference" explainers. Watch GSC for "janitorial services toronto" impressions splitting between the two URLs.

### N-B. The janitorial page repeats itself
**Severity: Low**

- "Janitorial services are the scheduled…" opens the page and is restated two paragraphs later under "What janitorial services are" ("Janitorial services are the scheduled, routine cleaning that keeps a building usable…"), with "since 1989" and the office address repeated.
- "How a janitorial contract starts" (4 steps: get in touch, walkthrough, written scope, same crew) duplicates the shared "How it works" block further down (5 steps, same content, the 2-hour reply stated in both).
- Of 1,705 main words, a noticeable share is this internal repetition plus the shared block (35% of 5-grams shared with other service pages).

Positives: the frequency table by building type and the "Janitorial services for different buildings" section are specific and useful; the scope-and-limits text is honest.

Recommendation: in src/content/services/janitorial-services.md, merge the two definitions into the opener and delete "How a janitorial contract starts" (the shared block covers it). Use the space for something only this page can say, such as a sample nightly task sheet or consumables policy.

### N-C. /commercial-cleaning-quote-checklist/: good, distinct guide with SEO-shaped phrasing and a cross-link gap
**Severity: Low**

For:
- 1,682 main words, published 10 Nov 2026 (BlogPosting datePublished = dateModified = 2026-11-10, matching the visible date).
- Answer-first question H2s, a quote-item table ("Quote item / What should be written down / Gap to resolve"), a 6,000 sq ft worked example explicitly labelled "illustrative… not a client story or a price estimate", and stock images labelled "Illustrative stock photograph."
- Two dated external sources (CCOHS Cleaning Products, WSIB clearance guidance, each "consulted in 2026"). The WSIB clearance vs liability insurance distinction is correct.
- Near-zero text overlap: 5-gram Jaccard 0.001 with the cost guide, 0.001 with /how-to-decide-on-a-cleaning-company/, 0.002 with /office-cleaning-checklist/. Not cannibalising on text.
- Inlinked from 62 pages ("Commercial Cleaning Quote Checklist: What to Include" ×70, from the recent-posts list).

Against:
- Exact-match repetition reads as written for a keyword: "commercial cleaning quote checklist" ×6 (1.4% of words) and "commercial cleaning scope of work" ×3, in sentences like "Use your commercial cleaning quote checklist to turn a proposal into a clear agreement" and the H2 "Use Your Commercial Cleaning Quote Checklist With Evergreen". Not stuffing, but it is the one QRG-style "generic phrasing" marker on an otherwise specific page.
- Topical overlap with the cost guide's "How Can You Compare Office Cleaning Quotes and Control Costs?" section (H3s "Compare written scopes of work", "Check insurance, bonding and WSIB", "Avoid common contract mistakes") and with /how-to-decide-on-a-cleaning-company/ ("Ask for a current WSIB clearance certificate…", "Read the Contract"). Both guides use a 6,000 sq ft example office.
- The checklist links to the cost guide, but the cost guide's main content does not link to the checklist.
- It promises a checklist but offers no downloadable or printable version (same issue the 7 Nov audit raised for /office-cleaning-checklist/).
- Organization byline (Finding 1).

Recommendation: in src/content/blog/office-cleaning-cost-toronto-guide.md, shorten "How Can You Compare Office Cleaning Quotes…" to a summary that links to the quote checklist, and in src/content/blog/how-to-decide-on-a-cleaning-company.md link "Read the Contract" to it. In src/content/blog/commercial-cleaning-quote-checklist.md, reduce the exact-match phrase to 2–3 uses and retitle the closing H2 (e.g. "Getting a quote from Evergreen"). Make the two 6,000 sq ft examples consistent (same washroom and kitchen assumptions) or cross-reference them.

### N-D. Location-page descriptions share one template (fixed prefix and suffix)
**Severity: Low**

The metadata_template.py heuristic could not run (the plugin runtime reported "Claude SEO runtime is not ready"), so I applied the same deterministic checks by hand to the 64 non-tag pages:
- All 11 location descriptions use the same frame: "Office and commercial cleaning in X: [local areas]. After hours, WSIB covered." 7 end with the exact phrase "After hours, WSIB covered." and the other 4 end "…cleaned after hours. WSIB covered." / "…around shifts. WSIB covered."
- The middle of each is specific and different (e.g. "Yonge–Sheppard towers, business parks off the 401 and 404"; "Beaver Creek and Headford business parks and Yonge Street suites"), so this is not a bulk job with no unique content. Rough equivalent of the tool's output: `site_risk` low-to-moderate, shared closing phrase "after hours, WSIB covered" on 11 of 64 pages (17%), no stock CTA.
- `description-echoes-title`: /services/commercial-cleaning/ ("Commercial cleaning services in Toronto and the GTA: …" under the title "Commercial Cleaning Services in Toronto \| Evergreen", new with the #91 retitle), /services/janitorial-services/ ("Janitorial services in Toronto and the GTA: …", new) and /services/emergency-cleaning/ (carried over).
- `brand-suffix-in-description`: none now (7 on 7 Nov).

Recommendation: in src/data/locations.ts, vary the closing clause per city (lead with the strongest local fact and end with something particular, such as the drive time or the building type), and drop "WSIB covered" from at least half. In src/content/services/commercial-cleaning.md and janitorial-services.md, start the description with the answer rather than the title words, e.g. "Routine, periodic and one-off cleaning for retail, institutional and mixed-use buildings in Toronto and the GTA, after hours."

---

## 3. What still needs the client or an account owner

1. A named owner or principal and account executive(s) with photos, for About, guide reviewer lines and schema Person (Finding 1).
2. WSIB clearance (or "certificate on request" approval), insurer and amount, bonding provider, screening method (Finding 2). The new quote checklist tells buyers to ask for exactly these.
3. A dated artefact for "since 1989".
4. Real job photos and 2–3 case-study facts; the gallery is honest now but still has no Experience value.
5. Real price bands for the cost guide (10b), or acceptance that it answers "how is it priced".
6. One city-matched client or job fact per location page (N1/5b).
7. Quantified company facts for the About block (12c).
8. Permission, company names and dates for the three homepage testimonials, or a decision to remove them (C5).
9. Search Console data to decide the home-office and fridge posts (C9) and to watch janitorial vs commercial and homepage vs commercial query splits (N-A, 7c).
10. A decision on rewriting /green-clean-products/ in house words with the ECOLOGO listing (C7).

## 4. Not verified

- Whether WSIB, bonding, insurance or the 1989 founding are true.
- Indexing and ranking of the two new pages; any query cannibalisation is inferred from content, not GSC.
- Readability metrics were not recomputed this round (textstat not installed; the 7 Nov figures used a home-made Flesch and showed no prose problem).
- metadata_template.py did not run (plugin runtime not ready); N-D uses equivalent hand-written string checks, not the tool's scoring.
- Whether the "Week 3" checklist has a print or PDF version outside the main HTML; none was found in the crawled main content.
- Full reading of every legacy post: I read the janitorial page and the quote checklist in full, and checked the rest by pattern search, openers and closing sentences.
- Screenshots of the new pages were not reviewed for content; the photo heroes (#93) were treated as a performance and images item.
- Whether the two remaining location reviews (Vaughan, Etobicoke) are framed neutrally; the location specialist covers review framing.

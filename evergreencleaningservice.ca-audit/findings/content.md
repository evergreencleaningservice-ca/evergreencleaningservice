Score: 68/100

Content Quality: www.evergreencleaningservice.ca (audited 2026-11-06)

Scope: 59 HTTPS indexable pages from raw/crawl/pages.json and raw/crawl/html/. The 60th crawl entry is the http:// homepage, which 301s to https. Main-content text was taken from `<main>` with nav, aside, script and form removed. Source checked read-only in /home/user/evergreencleaningservice (src/content, src/data, src/components, git log).

Note on the crawl data: the saved HTML files are double-encoded (UTF-8 bytes read as Latin-1), so en dashes show as "â€“" / "â\x80\x93" in summary-2.txt. The cause is the crawler, not the site. The live page serves correct UTF-8 (I checked /day-night-.../ with curl). The site sends `content-type: text/html` without a charset, but `<meta charset="utf-8">` is present. Info only.

Sub-scores (this skill's internal model, not Google's)
- Experience 45/100 (weight 20%): no first-hand photos, project evidence or case studies. All imagery is stock.
- Expertise 65/100 (25%): money pages are accurate and specific about process and scope, but no named person stands behind any of it.
- Authoritativeness 60/100 (25%): 1989 founding, 7 dated Google reviews, sameAs profiles. No associations, awards, press or client logos.
- Trustworthiness 80/100 (30%): full NAP, honest "no office in Brampton" statements, a privacy policy, and dated reviews with honest "illustrative/hypothetical" labels. Insurance and WSIB are claimed but not evidenced.
- Weighted E-E-A-T: about 64. Adding readability, structure and AI-readiness strengths gives 68 overall.
- AI citation readiness: 72/100.

## What works

- **Service and industry pages are substantive and specific.** 10 service pages (667–2,435 main words) and 2 industry pages (1,064–1,152) each have their own scope, scheduling, "scope and limits", "what affects the price" and FAQ (3–9 questions with FAQPage schema). /services/commercial-cleaning/ has a definitional section ("What commercial cleaning and janitorial services are") and a "Commercial cleaning, janitorial or office cleaning?" comparison.
- **Location pages are not city-swaps in the body.** Across all 7 location pages, pairwise 5-word-shingle Jaccard is 0.07–0.17. Verbatim sentences shared with other location pages make up only 2–12% of each page's words. Each page names real districts and corridors (e.g. Brampton: Bramalea, Steeles/Hwy 410, Gore Rd/Hwy 50; Downtown: Financial District, King West, Liberty Village). Each also has local building types and drive times.
- **Honest local claims.** /locations/brampton/ says "We do not have an office in Brampton: crews travel from our Toronto base". /locations/ says the areas without pages "are covered in exactly the same way". The Mississauga over-claim was removed in October.
- **Labelling is honest.** Stock imagery is labelled ("Illustrative stock photograph… not a photograph of the certified products"). The cost guide labels its figures as hypothetical. Reviews show real dates (src/data/reviews.ts copies them verbatim from GBP/Trustindex).
- **Readability is good.** Approximate Flesch / FK grade: service 63.5 / 8.3, location 57.1 / 9.2, blog 62.4 / 8.6. Average sentence length is 14–18 words. The hardest page is /locations/ (Flesch about 28), which is mostly a list of comma-separated places.
- **Plugin scan is clean.** content_quality.py on the main-content text of /, /services/office-cleaning/, /locations/brampton/, the cost guide and the plants post: filler 0, AI-pattern 0, overall 77–87, no flags. (Run on full HTML it counts CSS tokens and is meaningless, so I used extracted text.)
- **Metadata is not templated.** metadata_template.py over 59 pages: site_risk low, templated_ratio 0.0, no shared CTA phrases. Secondary flags: 1 `description-echoes-title` (/services/emergency-cleaning/) and 6 `brand-suffix-in-description` (our-process, reviews, insights x3, privacy), all minor.
- **Blog update dates are real.** 7 legacy posts carry updatedDate 2026-10-30, and git confirms substantive rewrites (e.g. commit 220371f: 45–66 changed lines per post). The visible `<time>` and BlogPosting dateModified match. Service and location dateModified comes from the last commit, not the build time (src/lib/schema.ts).
- **Supporting signals:** llms.txt is accurate and complete, and BlogPosting schema has an Organization author.

## Findings

### 1. No named person anywhere on the site (Experience, Expertise)
**Severity: High**

**Evidence:**
- The about page, /our-process/, the blog bylines ("By Evergreen Office Cleaning") and the BlogPosting author (Organization) name no owner, manager or account executive.
- The only personal name tied to the company is "Art", inside a 2021 customer review ("I highly recommend Art and the team…"). Another review mentions "direct contact with the owner" but the owner is never named.
- /about-us/ is 403 main words with no founding story, no photo of the team or office, and nothing to back up "since 1989".
- docs/growth/README.md lists "H5 About page (named people)" and "H6 photoshoot" as waiting on the client.

**Recommendation:**
- Get the owner's name, role and start year, plus the account executive(s), and add a "Who you deal with" section with real photos to src/content/pages/about-us.md.
- Add a `founder` / `employee` Person to the Organization in src/lib/schema.ts.
- Put a short reviewer line on the two Oct–Nov 2026 guides (e.g. "Reviewed by <name>, <role>, <years> in commercial cleaning") in the blog layout. src/content.config.ts would need an optional `reviewedBy` field.

### 2. Insurance, WSIB, bonding and "since 1989" are asserted, never evidenced (Trust)
**Severity: Medium**

**Evidence:**
- "WSIB covered, bonded and insured" and "background-screened" appear on 24–25 pages, and "since 1989" or "three decades" on 26.
- No WSIB clearance number or certificate, no insurer or coverage amount, and no association memberships, BBB listing or awards appear anywhere.
- Ironically, /office-cleaning-cost-toronto-guide/ tells readers to "Ask for current evidence of liability insurance… and applicable WSIB coverage or clearance".

**Recommendation:**
- Add a "Proof" block to about-us.md and /our-process/: WSIB account or clearance statement with a "certificate on request" line, liability coverage amount and insurer, bonding provider, and the screening method.
- Corroborate 1989 with a dated artefact, such as an old photo, an Ontario business registration year or the first client.

### 3. Experience gap: all imagery is stock and the gallery is thin
**Severity: High**

**Evidence:**
- /cleaning-demo-gallery/ is 71 words in total (4 in main content), all 13 images are stock, and the meta description says "Illustrative photographs".
- The filenames imply real jobs (gallery-toronto-office-janitorial.jpg, gallery-large-warehouse-clean-wax.jpg) but they are not.
- Blog images are Magnific/iStock replacements of earlier AI images (git 3cab0f8, cf0d153).
- The only real project evidence (src/content/projects/warehouse-floor-clean-and-wax.md, about 50k sq ft) is `status: draft` and renders nowhere.

**Recommendation:**
- Until real job photos exist, set noindex on /cleaning-demo-gallery/ (src/pages/cleaning-demo-gallery.astro) or remove it from the sitemap and nav.
- Prioritise the client photoshoot and publish 2–3 case studies via src/content/projects (the /projects/ hub already builds once one is published). Each needs facility type, area, scope, frequency, the problem and the result.

### 4. Thin utility and hub pages
**Severity: Medium (gallery High, covered above)**

**Evidence:**
- /contact-us/: 122 words. Main content is the address, phone, email and form.
- /request-a-quote/: 158 words, form only.
- /locations/: 229 words.
- /green-clean-products/: 304 words, largely manufacturer copy, including the undated "leading chemical manufacturer for 46 years" and 2013 Environment Canada/Ecologo news.
- /insights/page/2/ and /page/3/: 479 and 263 words, indexable, not in the sitemap.

**Recommendation:**
- Contact and quote pages don't need word count, but should add a "what happens next" (2-hour reply, walkthrough, written proposal) and a trust strip to src/content/pages/request-a-quote.md and contact-us.md.
- Rewrite green-clean-products.md in your own words: which products are used where, why, and SDS availability. Remove the 2013 and "46 years" lines.
- /locations/ is fine as a hub.

### 5. Location pages share a fixed template outline and two pages switch to a generic marketing voice
**Severity: Medium**

**Evidence (sample: toronto-downtown, brampton, markham):**
- The H2/H3 outline is identical with the city swapped in: What we clean in X / Facility types served / Office cleaning in X / Working in X / The buildings, and what they need / Getting there and scheduling / Where we work from / Get a quote in X / Services in X / What a client says / FAQ / Other service areas.
- 5 of 7 pages open with the same sentence: "Evergreen Office Cleaning provides commercial and office cleaning in X as part of its coverage across the Greater Toronto Area, which it has served since 1989."
- These sentences repeat verbatim on 5–7 pages: "Whichever yours is, we clean it after hours, by the same crew each visit, from a written scope agreed at a free walkthrough." and "See office cleaning for the full scope."
- /locations/mississauga/ and /locations/vaughan/ have bolted-on intros in a different, generic voice: "comprehensive commercial cleaning and janitorial solutions", "Flexible Scheduling (Zero Disruption)", "maintaining an exceptional physical workspace is critical", "top-tier", "Total peace of mind", "WSIB Ontario Registered". Source: src/data/locations.ts lines ~141 and ~200.
- Testimonials on location pages are 5–6 years old ("Ping Lee, 6 years ago" on Brampton).

**Overall:** body duplication is low. The risk is the "repetitive structure across pages" signal in the QRG, plus inconsistent voice.

**Recommendation:**
- Rewrite the Mississauga and Vaughan intros in the plain house voice (src/data/locations.ts).
- Give each page a unique opening that states one local fact first (e.g. Downtown: "Our office is on Queen St W, minutes from the Financial District").
- Vary the H2s per city where content allows.
- Use the newest review or a city-matched client where possible.

### 6. Rebuilt service pages carry 18–44% shared boilerplate
**Severity: Low**

**Evidence:**
- The trust band, "How it works" (5 steps), "Where we work" and the area list repeat verbatim. Shared share per page: building-maintenance 44%, emergency and industrial 31%, disinfection 29%, office 24%, commercial 22%.
- Pairwise Jaccard tops out at 0.27 (graffiti vs pressure-washing; disinfection vs industrial).
- /services/building-maintenance/ and /services/floor-stripping-waxing/ overlap topically: strip and wax is the lead item on both.

**Recommendation:**
- On the specialty service pages, shorten "How it works" to a 1-line link to /our-process/ (the component in src/pages/services/[slug].astro).
- Make building-maintenance the programme or hub page and link out to floor-stripping-waxing for the strip/wax detail, rather than describing it in full on both.

### 7. Keyword targeting and cannibalisation for "commercial cleaning Toronto" and "office cleaning <city>"
**Severity: Medium**

**Evidence:**
- **Homepage:** title "Commercial Cleaning Company in Toronto Since 1989 | Evergreen", H1 "Office & Commercial Cleaning in Toronto and the GTA".
- **/services/commercial-cleaning/:** title "Commercial Cleaning & Janitorial Services in Toronto | Evergreen", H1 "…in Toronto and the GTA". It is 2,435 words and gets 252 internal links.
- **/locations/toronto-downtown/:** "Office & Commercial Cleaning in Downtown Toronto".
- **Sitewide footer anchors:** src/data/site.ts `footerAreas` sends anchor "Toronto" to /locations/toronto-downtown/ (60 pages) and "Toronto & GTA" to /services/commercial-cleaning/ (59 pages). Three URLs therefore get the Toronto + commercial signal.
- The footer also links "Richmond Hill" and "Scarborough" to /locations/, which has no content for either.
- **Office cleaning:** every location page has an H2 "Office cleaning in X" plus a short paragraph that sends readers to /services/office-cleaning/ ("See office cleaning for the full scope"). That is a sensible hub-and-spoke pattern, low risk. But all 7 location titles lead with "Office & Commercial Cleaning in X", so for "office cleaning Mississauga" the location page is the intended target, and that's fine.

**Recommendation:** assign one primary query per URL.
- Homepage: brand + "office & commercial cleaning Toronto/GTA".
- /services/commercial-cleaning/: "commercial cleaning & janitorial services" for non-office buildings (retail, institutional, mixed-use). Consider dropping "Toronto" from its title in favour of "Retail, Institutional & Janitorial".
- /locations/toronto-downtown/: "downtown Toronto".
- In src/data/site.ts, change the footer anchor "Toronto" to "Downtown Toronto". Point "Toronto & GTA" at /locations/ or remove it. Stop labelling /locations/ as "Richmond Hill" or "Scarborough".

### 8. Title and description quality
**Severity: Low**

**Evidence:**
- **Titles over 60 characters:** /services/commercial-cleaning/ (64), homepage, /locations/vaughan/, and both list posts "5 Commercial Cleaning Products…" and "6 Common Cleaning Products…" (61 each). Only the 64-character one is likely to truncate.
- **Eight descriptions run 161–170 characters:** daycares 167, air quality 161, decide-on-company 165, hand-washing 162, reviews 168, robotic 170, seasonal 169, pressure-washing 166.
- **Legacy hook descriptions that say nothing specific:**
  - plants (108): "Like the look of plants… Here we discuss…"
  - floors (117): "Do your floors sparkle?"
  - deep cleaning (127)
  - relocation (128)
  - layout, retail, dental (139–146)
  - /contact-us/: "We'd love to hear from you and look forward to any question you may have for us."
  - /cleaning-demo-gallery/ (91)
- **Duplicate homepage title "on the http variant":** not a real duplicate. http://www… 301s to https (redirect_chain in pages.json). The crawler recorded the final page under the http seed, which came from an http link on /privacy/ (fix that link in src/content/pages/privacy.md).
- **H1s:** generic but acceptable on About Us, Contact Us, "Who we clean for" and "How we work".

**Recommendation:**
- Trim the 8 descriptions to 150–155 characters and the commercial title to 60 or fewer.
- Rewrite the legacy hook descriptions as answer-first summaries in the blog front matter (src/content/blog/*.md) and in contact-us.md.

### 9. Heading structure
**Severity: Low**

**Evidence:**
- The footer emits 5 `<h2>`s on every page: "Evergreen Office Cleaning", "Services", "Reviews", "Service Areas", "Follow us on Social Media" (src/components/Footer.astro lines 39–91).
- The homepage uses headings as labels: H3 "We are accepting new cleaning clients.", "Service Locations:", "Evergreen Office Cleaning". Its insight cards are H2s.
- /office-cleaning-cost-toronto-guide/ repeats its H1 as an H2 and has an H2 "In this guide".
- /services/commercial-cleaning/ has 28 H2s, which is long; consider grouping.

**Recommendation:**
- Change the footer titles to `<p class="footer-areas-title">` (or `<h2>` with role/visual only if needed for accessibility review).
- Demote the homepage label headings to `<p>`/`<strong>`.
- Drop the duplicate H2 in the cost guide.

### 10. The cost guide doesn't answer its own question
**Severity: High for this page**

**Evidence:**
- /office-cleaning-cost-toronto-guide/ (1,955 words, title "Office Cleaning Cost Toronto: 2026 Pricing Guide", H1 "How Much Does Office Cleaning Cost in Toronto?") gives no real price.
- It says: "These are hypothetical CAD calculations… not Evergreen quotes or verified GTA market averages. The assumed $100–$300 per visit is an arithmetic input."
- Its worked example uses "a charge of $150 per visit. The amount is hypothetical".
- This misses the intent of a pricing query, offers nothing quotable for AI answers, and the heavy hedging reads as low-confidence, generic content. The title's "2026 Pricing Guide" promises numbers the page refuses to give.

**Recommendation:**
- Get real ranges from the client (per-visit or per-sq-ft bands by office size and frequency, the minimum visit charge, and the typical initial deep-clean premium) and lead with a one-sentence answer.
- If the client won't publish prices, retitle the page "How Office Cleaning Is Priced in Toronto" so the title doesn't promise prices.

### 11. Blog quality and freshness
**Severity: Medium**

**Evidence:**
- **Dates:** 25 posts. 22 were originally published between 2019-12-07 and 2023-03-31. Then nothing until three new posts on 2026-10-30, 2026-10-31 and 2026-11-03. 7 legacy posts were genuinely updated on 2026-10-30. The other 15 legacy posts keep their 2020–2023 dates with no update.
- **Length:** only 2 posts reach about 1,500 main words (cost guide 1,955; how-often 1,906). Most legacy posts are 441–700.
- **Legacy defects:**
  - /5-easy-ways-to-keep-your-commercial-floor-clean/ is titled "5 Easy Ways", lists 5 items, but the body says "our top three tips". It also has the typo "Microfiber rubs".
  - /how-to-take-care-of-plants-in-the-office/ has unsourced stats: "According to studies… by as much as 15%", "A report from 2015… 15% of staff".
  - /benefits-of-commercial-deep-cleaning-services/: "Studies show…".
  - /preventing-slips-trips-falls-in-your-workplace/: "According to statistics…".
  - 13 posts have no outbound citation at all.
- **Off-core topics:** home-office cleaning, office plants and the office fridge add little topical authority for B2B commercial cleaning.

**Recommendation:**
- Fix the "three tips" line and the typo.
- Cite or delete each unsourced statistic.
- Update or consolidate the 15 untouched legacy posts in priority order: dental checklist, retail checklist, day vs night, deep cleaning, dusting. Add Toronto and first-hand specifics to each and set `updatedDate` only when the change is substantive.
- Consider noindexing or merging the plants, home-office and fridge posts.
- Plan a monthly cadence on commercial topics such as day porter, washroom programmes, winter salt and lobby floors, and RFP/scope templates.

### 12. AI citation readiness
**Severity: Medium (overall 72/100)**

**Evidence, positive:**
- FAQ blocks with FAQPage schema on 10 service pages, 2 industry pages, 7 location pages and /our-process/.
- Definitional sections on /services/commercial-cleaning/.
- /how-often-should-an-office-be-cleaned/ opens with a direct answer ("An office used every weekday should generally receive cleaning on each occupied day in its busiest shared areas…").
- Accurate llms.txt and consistent NAP.

**Evidence, gaps:**
- Legacy posts have an "At a glance" list (21 posts) that is just a table of contents, not facts. Examples: hand-washing ("When to wash / How to wash properly…") and plants ("Higher Productivity Rates…").
- Service pages open with marketing fragments rather than a definition sentence, e.g. office-cleaning: "Recurring janitorial cleaning for offices of every size, done after hours…". It has no subject or verb, so it isn't quotable on its own.
- The cost guide has no citable number (Finding 10).
- There are few hard facts an assistant could cite: crew size, buildings served, typical response time beyond "reply within 2 hours", sq ft cleaned.

**Recommendation:**
- Turn each "At a glance" into 3–5 answer sentences (e.g. "Wash for at least 20 seconds…").
- Open each service page with a one-sentence definition naming Evergreen, the service, Toronto/GTA and the key differentiator.
- Add 3–5 verifiable company facts to about-us.md and llms.txt (number of active contracts, staff, buildings, longest-standing client tenure).

### 13. Homepage testimonials are unverifiable
**Severity: Low**

**Evidence:**
- Three undated, unsourced testimonials (src/components/home/Testimonials.astro): "Brenda Carmichael, Toronto Spa Business Owner", "Allen Robinson, Founder & CEO" (no company named) and "Paul Lockheart, Toronto Business Owner".
- They sit next to the dated Google reviews.
- Overall, review volume is low: 7 reviews, 4 of them from 2020–2021, and the newest are one-liners.

**Recommendation:**
- Add company names and dates (with permission) or remove the three testimonials.
- Start an ongoing review request after each walkthrough or month one.

## Quick wins
1. In src/data/site.ts `footerAreas`, change the "Toronto" anchor to "Downtown Toronto", repoint or remove "Toronto & GTA", and stop labelling /locations/ as "Richmond Hill" or "Scarborough".
2. Rewrite the Mississauga and Vaughan intros in src/data/locations.ts in the house voice, removing "top-tier", "Zero Disruption", "Total peace of mind" and "WSIB Ontario Registered".
3. Noindex /cleaning-demo-gallery/ until real job photos exist.
4. Fix the blog defects: "top three tips" and "Microfiber rubs" in the floors post; cite or remove the unsourced statistics in the plants, deep-cleaning and slips posts.
5. Trim the 8 over-length descriptions and the 64-character commercial title, and rewrite the "Here we discuss…" legacy descriptions and the contact-page description.

## Not verified
- Whether WSIB coverage, bonding, insurance or the 1989 founding are true. There is no public evidence on the site, and I checked no external registry.
- Whether Armstrong ProSeries Green is currently UL ECOLOGO certified.
- Real search-query overlap and cannibalisation in Search Console. The analysis above is based on titles, H1s and anchors only.
- External authority: backlinks, press and directory citations.
- Whether the 15 untouched legacy posts get any traffic. GA4 was not reviewed.
- The full text of every blog post. I read the cost guide, 3 legacy posts and the openings of the others; the rest was checked by pattern search.
- The /lp/* PPC pages and noindex archives were out of scope.
- Readability figures use my own Flesch and Flesch–Kincaid implementation (textstat is not installed) and are approximate.

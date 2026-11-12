Score: 90/100
Previous: 88/100 (re-audit 7 Nov)

# On-page SEO, third audit: www.evergreencleaningservice.ca (11 Nov 2026)

Source: reaudit-2026-11-11/raw/crawl/pages.json, 94 URLs, all 200. 64 are indexable: the 62 sitemap URLs plus /insights/page/2/ and /page/3/. The other 30 are noindex tag archives. I also used the raw HTML in raw/crawl/html/ and raw/home-headers.txt. Titles, descriptions and anchors were re-decoded from Latin-1 to UTF-8 before measuring. I used the same definition of "contextual" as the 7 Nov re-audit. It means links inside `<main>` on indexable pages, excluding `aside#secondary`, breadcrumbs, `.post-topics`, the homepage "Latest insights" cards and the /insights/ listings. Body copy and on-page "Related" cards count. Lengths are character counts. Scripts: /tmp/claude-0/-home-user-evergreencleaningservice/692c77ca-669b-54d4-b608-18eee442d35d/scratchpad/onpage3/ (meta.py, links.py, ctx.py).

## Summary

Phase A closed most of the 7 Nov on-page list:
- Every description is now 160 characters or less.
- Only the homepage title is over 60 characters (61).
- The cost guide has "cost" back in its title and H1.
- The footer and guide-TOC headings are no longer H2s (critic C6).
- Each of the five orphan posts now has a contextual inlink.
- The misdirected and brand-name anchors are fixed.
- The templated closing sentence is gone.
- The charset header is live.

Four problems are new, and all come from the other contributor's pages and the commercial/janitorial split:
- the new quote-checklist post has no contextual inlink at all;
- the new /services/janitorial-services/ page gets contextual links from only 3 pages, while five pages still send the anchor "janitorial services" (or close variants) to /services/commercial-cleaning/;
- the commercial-cleaning page still carries a full janitorial H2 section and the same FAQ question as the janitorial page;
- the Related cards on the two main money pages still use the cost guide's old title ("How office cleaning is priced in Toronto").

The title suffix still has four variants, and 10 indexable titles carry no brand (up from 6).

## 1. Status of the 7 Nov re-audit's findings (and critic C6)

| # | Finding | Status | Evidence now |
|---|---|---|---|
| 1 | Titles over 60 characters | Partly fixed | Only / is over: "Commercial Cleaning Company in Toronto Since 1989 \| Evergreen" (61). /locations/vaughan/ is now 49, /locations/durham-region/ 56, /6-common-…/ 52 ("6 Cleaning Products You Should Never Mix - Evergreen"). |
| 2 | Descriptions over 160 characters (first audit's 8) | Fixed | None of the 64 indexable pages is over 160. The longest are /services/ and /locations/markham/ at 159. |
| 3 | Inconsistent title suffix | Partly fixed (unchanged) | Four forms remain: "\| Evergreen" 25, "- Evergreen" 15, "- Evergreen Office Cleaning" 13, "\| Evergreen Office Cleaning" 1 (/services/). 10 titles have no brand (was 6). See N4. |
| 4 | Thin pages | Fixed | Gallery 242 words, /locations/ 402 (was 229 in the first audit), /insights/page/3/ 265. /contact-us/ (149) and /request-a-quote/ (216) are conversion pages, acceptable. |
| 5 | Blog titles lack a brand or geo cue | Partly fixed | /6-common-…/ gained "- Evergreen". 8 of 25 posts now have no brand. They are /day-night-…/, /how-often-…/, /office-cleaning-checklist/, /office-cleaning-cost-toronto-guide/, /preventing-slips-…/, /5-cleaning-tips-…-relocation-…/ and /office-layout-tips-…/, plus the new /commercial-cleaning-quote-checklist/. The cost guide and checklist lost "\| Evergreen" to get under 60, a fair trade. |
| 6 | HTML Content-Type has no charset | Fixed | All 94 crawled responses: `content-type: text/html; charset=utf-8`. raw/home-headers.txt is the same. |
| 7 | Plain-http internal link on /privacy/ | Fixed | No internal href uses http:// across the 94 pages. |
| 8 | Posts link noindex tag archives | Not applicable | By design. The 30 /tag/ pages are noindex and linked only from `.post-topics`. |
| M-a | Matrix rows 5, 8–21, 25–32, 34–36 (body links) | Fixed | Still present. For example, all 11 location pages link to the cost guide, each with a different anchor ("office cleaning costs in the GTA", "the parts of an office cleaning price", …). |
| M-b | Matrix rows 1–3, 6, 7, 22–24, 27 (Related card only) | Fixed (as a Related card, unchanged) | /services/office-cleaning/ and /services/commercial-cleaning/ still reach the cost guide only through the `blk-links` card. The body pricing copy has no link. The card anchor is stale (N5). |
| M-4 | Matrix row 4: pillar → deep-cleaning post | Fixed | /services/commercial-cleaning/ under "Periodic work that keeps a building looking maintained": "what a commercial deep clean includes" → /benefits-of-commercial-deep-cleaning-services/. |
| M-33 | Matrix row 33: property-management → pressure washing, plus condo guide | Partly fixed | The card link exists. There is still no condo common-area guide (no URL with "condo" in the crawl). |
| N1 | Six descriptions over 160 | Fixed | /locations/ 138 (was 185), /locations/scarborough/ 155 (167), /services/post-construction-cleaning/ 152 (165), /locations/richmond-hill/ 141 (163), /locations/north-york/ 144 (161), /locations/durham-region/ 155 (161). |
| N2 | Two new titles over 60 | Fixed | /locations/durham-region/ "Office & Commercial Cleaning in Pickering, Ajax & Oshawa" (56). /office-cleaning-checklist/ "Office Cleaning Checklist: Daily, Weekly & Monthly Tasks" (56). |
| N3 | Cost guide lost "cost" | Fixed | Title "Office Cleaning Costs in Toronto: How Pricing Works" (51), H1 "What Drives Office Cleaning Costs in Toronto" (src/content/blog/office-cleaning-cost-toronto-guide.md lines 6–7). |
| N4 | Five posts with no contextual inlink; sidebar favours the newest | Partly fixed | All five now have exactly 1: relocation ← /services/post-construction-cleaning/, fridge ← break-rooms, office-layout ← break-rooms, home-office ← office-layout, robotic ← /services/industrial-cleaning/. All six recommended reverse links are live: disinfection → air-quality ("cleaning and indoor air quality"), medical-dental → dental checklist, pillar → deep-clean, and the others. But 14 of 25 posts still have fewer than 3, and the new post has 0 (N1 below). `src/components/Sidebar.astro` still sorts by `pubDate` and slices to 5 (lines 17–18). |
| N5 | Misdirected and brand-name anchors | Fixed | /5-cleaning-products-…/ "professional cleaning" → /services/commercial-cleaning/. /how-to-decide-…/ "professional cleaning company" → /services/commercial-cleaning/. /day-night-…/ "Evergreen Office Cleaning" → /about-us/. The floor post now uses "professional commercial cleaning" → /services/commercial-cleaning/. |
| N6 | 18 posts with the same closing sentence | Fixed | The sentence appears in 0 files in src/content/blog/. Across the 25 posts, the last paragraph that links a service page is distinct every time (25 distinct). |
| N7 | Related-card anchors are the whole card (Info) | Open (unchanged, Info) | 261 card links in `blk-links`/`guide-related-grid`. 19 anchors are over 80 characters; the longest is 129. |
| N8 | Paginated /insights/ pages share one H1 (Info) | Open | /insights/, /insights/page/2/ and /page/3/ all have the H1 "Commercial Cleaning Insights". This is the only duplicate H1 among the 64. |
| C6 | Footer H2s and the cost guide's "In this guide" H2 | Fixed | The footer titles are now `<p class="footer-areas-title">` ("Evergreen Office Cleaning", "Services", "Reviews", "Service Areas") and `<p class="footer-connect-title">`. The TOC is `<nav class="guide-toc">` with a `<p>` "In this guide". Neither text appears as a heading in any of the 64 indexable outlines (on 6 Nov: 89 and 3 pages). No heading-level skips anywhere. |

## 2. New findings

### N1. The new quote-checklist post has no contextual inlink (Medium)
Evidence: /commercial-cleaning-quote-checklist/ (contributor 0TBS) is linked only from the homepage "Latest insights" card and the /insights/ listing, both template links, plus the Recent Posts widget while it stays in the newest five. No body or Related link points to it. Not from /services/commercial-cleaning/, /services/janitorial-services/, /how-to-decide-on-a-cleaning-company/ or /request-a-quote/. Not from the cost guide, which shares its "compare quotes" and "6,000 sq ft worked example" sections. Its own outbound links go to office-cleaning, building-maintenance, green-clean, the quote form, the cost guide and how-often. It does not link /services/commercial-cleaning/, even though that is its head term. Once it drops out of the five newest it will be an orphan.
Recommendation:
- Add in-body links to it from /services/commercial-cleaning/ (the "Choosing a commercial cleaning company" section, which already links how-to-decide) and from /how-to-decide-on-a-cleaning-company/ (`src/content/blog/how-to-decide-on-a-cleaning-company.md`).
- In the cost guide, link it from "How Can You Compare Office Cleaning Quotes…".
- Add a Related card on /services/janitorial-services/ (`src/content/services/janitorial-services.md`).
- In the post itself (`src/content/blog/commercial-cleaning-quote-checklist.md`), link "commercial cleaning" → /services/commercial-cleaning/.

### N2. The janitorial page is barely linked, and "janitorial services" anchors still go to /services/commercial-cleaning/ (Medium)
Evidence: /services/janitorial-services/ gets contextual links from only 3 pages: / (card), /services/ (card) and /services/commercial-cleaning/ (body "janitorial services", plus a card). /services/commercial-cleaning/ gets them from 33 pages, and /services/office-cleaning/ from 36. Five pages still point janitorial anchors at the commercial page:
- /office-cleaning-cost-toronto-guide/ "janitorial services", an exact match;
- /preventing-slips-trips-falls-in-your-workplace/ "seeking janitorial services";
- /how-often-should-an-office-be-cleaned/ "commercial cleaning and janitorial services";
- /about-us/ "Commercial cleaning and janitorial services";
- /a-cleaning-checklist-for-your-retail-store/ "retail cleaning and janitorial needs".

The office-cleaning Related card text is "Recurring after-hours janitorial service" (or a close variant) on 7 pages, a third page claiming the term. The header and footer nav do link both pages, so the janitorial page is not orphaned.
Recommendation: repoint the cost guide's and the slips post's anchors to /services/janitorial-services/. Split the combined anchors on /about-us/ and /how-often-…/ so that "janitorial services" goes to the new page. Edit `src/content/blog/office-cleaning-cost-toronto-guide.md`, `preventing-slips-trips-falls-in-your-workplace.md`, `how-often-should-an-office-be-cleaned.md` and `src/content/pages/about-us.md`. Add body links to the janitorial page from /services/office-cleaning/, /industries/property-management/ and two or three location pages.

### N3. The commercial-cleaning page still targets "janitorial services" in headings and FAQ (Low)
Evidence: the title and H1 are now cleanly split. Commercial: "Commercial Cleaning Services in Toronto | Evergreen" / "Commercial Cleaning Services in Toronto and the GTA". Janitorial: "Janitorial Services in Toronto & the GTA | Evergreen" / "Janitorial Services in Toronto and the GTA". But the commercial page keeps three H2s that name janitorial work:
- "What commercial cleaning and janitorial services are";
- "Janitorial services: the daily upkeep", a full section describing the routine, which then links the new page;
- "Commercial cleaning, janitorial or office cleaning?".

It uses "janitorial" 14 times in 2,655 words, against 23 times on the janitorial page. Both pages carry the FAQ "What is the difference between commercial cleaning and janitorial services?" (worded in opposite order). The 5-word shingle overlap is moderate, about the same as for other pairs that share the template (Jaccard 0.16, against 0.15 for commercial vs office). So this is a targeting signal, not duplicate content.
Recommendation: in `src/content/services/commercial-cleaning.md`, shorten "Janitorial services: the daily upkeep" to two sentences plus the link, and rename it, for example "Routine upkeep between periodic work". Keep the comparison table but drop the duplicate FAQ from one of the two pages, ideally the commercial one. Watch GSC for "janitorial services toronto" to see which URL Google picks (not verifiable here).

### N4. Ten indexable titles carry no brand, and four suffix forms remain (Low)
Evidence: no brand on /locations/vaughan/ and /locations/durham-region/ (both lost "| Evergreen" in the length fix), /office-cleaning-checklist/, /office-cleaning-cost-toronto-guide/ and /commercial-cleaning-quote-checklist/ (whose `seoTitle` equals its `title`, set by hand), plus five older posts. The 11 location pages now use two patterns: 9 with "| Evergreen", 2 without.
Recommendation: one rule in `src/lib/title.ts` `pageTitle()`. Append " | Evergreen" when the result stays at 60 or under, otherwise none. Route the hard-coded `seoTitle`s and money-page titles through it, so all pages share "| Evergreen" and the "- Evergreen Office Cleaning" and "- Evergreen" forms go. For Vaughan, "Office & Commercial Cleaning in Vaughan & Concord | Evergreen" is 61 characters. Use "Commercial Cleaning in Vaughan & Concord | Evergreen" (52).

### N5. Related-card anchors to the cost guide still use its old title (Low)
Evidence: the Related cards on /services/office-cleaning/ and /services/commercial-cleaning/ say "How office cleaning is priced in Toronto …". /locations/toronto-downtown/ and /office-cleaning-checklist/ use the same phrase in body text. This was the cost guide's title until Phase A. The page is now "What Drives Office Cleaning Costs in Toronto", so the two strongest pages send it an anchor without "cost".
Recommendation: change the card titles in `src/content/services/office-cleaning.md` and `src/content/services/commercial-cleaning.md` (the only two files with the string) to "What drives office cleaning costs in Toronto". Optionally, add an in-body link from office-cleaning's "What affects the price" copy (the remaining part of matrix rows 1–3).

### N6. The quote-checklist post overlaps the cost guide and the how-to-decide post (Low)
Evidence:
- /commercial-cleaning-quote-checklist/ has "What Would a Quote for a 6,000 sq ft Office Look Like?". The cost guide has "Worked Example: Cleaning a 6,000-Square-Foot Toronto Office" and "How Can You Compare Office Cleaning Quotes and Control Costs?".
- The checklist's "What Should You Ask Before Signing a Cleaning Agreement?" covers the same ground as /how-to-decide-on-a-cleaning-company/ (description: "compare quotes on scope, check WSIB and insurance, read the contract…").
- Three posts now compete loosely for "cleaning quote" intent, and only one of them links another (checklist → cost guide).
- The post's H2s are Title Case questions, unlike the sentence-case H2s everywhere else on the site.

Recommendation: make the checklist the target for "cleaning quote checklist / what to include". Have the cost guide's quote-comparison section and the how-to-decide post summarise briefly and link to it (N1). Consider converting its H2s to sentence case for consistency.

### N7. Sidebar H2s on 30 pages (Info)
Evidence: "Recent Posts" and "Our Services" are `<h2 class="widget-title">` (Sidebar.astro line 62) on 30 pages, down from 57. They come after the main outline, so the impact is negligible.
Recommendation: optional. Make them `<p>` or `<h2>` with `aria-label` in the same pass as C6, or leave as is.

## 3. What still needs the client or an account owner
- GSC (owner access): which URL gets impressions for "janitorial services toronto" and "commercial cleaning toronto" since the #91 split (N2, N3). Whether "office cleaning cost toronto" impressions recovered after the cost-guide retitle. Clicks for /keep-your-office-at-home-clean/ and /how-to-keep-your-office-fridge-clean/ before any prune decision (critic C9).
- The other contributor (0TBS) should agree on the checklist post's role versus the cost guide and how-to-decide post before links are rewired (N1, N6).
- Matrix row 33 (condo common-area guide) still needs the client's input on the property-management scope.

## 4. Not verified
- Pixel-width truncation and Google title rewrites (character counts only).
- Rankings, impressions or CTR effects of any change (no GSC).
- Live pages beyond the 11 Nov crawl. Statuses are from the crawl and raw/home-headers.txt; no new requests were made.
- Whether Google treats Related-card links as contextual (counted as contextual here, as in both earlier audits).

Score: 88/100
Previous: 86/100 (first audit)

# On-Page SEO re-audit: www.evergreencleaningservice.ca (6 Nov 2026, evening)

Source: reaudit-2026-11-06/raw/crawl/pages.json (89 URLs, all 200; 62 indexable: the 60 sitemap URLs plus /insights/page/2/ and /page/3/) and the raw HTML in raw/crawl/html/. Titles and descriptions were re-decoded from the crawler's Latin-1 to UTF-8 before measuring length. "Contextual" links are the links inside `<main>` from indexable pages. The sidebar (`aside#secondary`), breadcrumbs, the post "Topics" line, the homepage "Latest insights" cards and the /insights/ listing pages are excluded. Body copy and on-page "Related" blocks count. This is the same definition as the first audit's cluster.md. I made one live request (`curl -sI /`) to confirm the Content-Type header.

## Summary of the change

The internal-linking work is the main improvement: 34 of the 36 rows in the link matrix are now live. Posts with no contextual inlink fell from 13 of 25 to 5 of 24. All 11 location pages now link to both planning guides with varied anchors. The gallery and /locations/ hub are no longer thin, the eight long descriptions were trimmed, the http link is gone, and 18 of 24 posts now carry the brand in the title. These items remain or are new:
- the charset header is still missing;
- the title suffix has four variants;
- six new or edited pages exceed 160-character descriptions, and two new pages exceed 60-character titles;
- the cost guide lost the word "cost" from its title and H1;
- five older posts still have no contextual inlink.

## 1. Status of the first audit's on-page findings

| # | Finding (first audit) | Status | Evidence now |
|---|---|---|---|
| 1 | Titles over 60 characters on six pages | Partly fixed | /services/commercial-cleaning/ is now 55 ("Commercial Cleaning & Janitorial in Toronto \| Evergreen"). Still over: / (61), /locations/vaughan/ (61), /6-common-cleaning-products-that-you-should-never-mix-together/ (61, no brand). The http variant was not crawled. New over-limit titles are in N2. |
| 2 | Meta descriptions over 160 characters on eight pages | Fixed | Now ≤155: /services/pressure-washing/ 155, /reviews/ 138, /seasonal-office-cleaning-checklist/ 154, /cleaning-protocols-for-daycares-and-schools/ 149, /how-to-decide-on-a-cleaning-company/ 155, /robotic-vs-manual-…/ 151, /commercial-cleaning-air-quality/ 153. /importance-of-hand-washing/ was merged (not in the sitemap or crawl). Six other pages are now over 160 (N1). |
| 3 | Inconsistent title suffix across templates | Partly fixed | Unbranded titles fell from 22 to 6. Four suffix forms remain across the 62 indexable pages: "\| Evergreen" 28, "- Evergreen" 14, "- Evergreen Office Cleaning" 13, "\| Evergreen Office Cleaning" 1 (/services/). This is by design: `src/lib/title.ts` `pageTitle()` appends " - Evergreen Office Cleaning" or " - Evergreen", while money pages hard-code "\| Evergreen". The audit asked for one pattern. |
| 4 | Thin pages (gallery 71 words, /locations/ 229, contact, quote, /insights/page/3/) | Fixed | /cleaning-demo-gallery/ has 227 words, an intro and 13 `<figcaption>`s naming service and setting. /locations/ has 367 words with a paragraph per area (11 areas). /contact-us/ (144) and /request-a-quote/ (206) are still short, which is acceptable for conversion pages as the first audit noted. /insights/page/3/ has 225. |
| 5 | Blog titles lack geo or brand cue | Partly fixed | 18 of 24 post titles now carry "Evergreen". Six do not: /how-often-should-an-office-be-cleaned/, /preventing-slips-trips-falls-…/, /day-night-…/, /6-common-…/, /office-layout-tips-…/, /5-cleaning-tips-…-relocation-…/. The cost guide keeps "Toronto" but lost "cost" (N3). /how-to-decide-on-a-cleaning-company/ still has no "Toronto" in its title or H1. |
| 6 | HTML Content-Type has no charset | Open | Live `curl -sI https://www.evergreencleaningservice.ca/` returns `content-type: text/html`. All 89 crawled responses are the same. `public/_headers` sets a charset only for a text/plain path (line 78). |
| 7 | Plain-http internal link on /privacy/ | Fixed | None of the internal hrefs across the 89 crawled pages uses http://. |
| 8 | Posts link to noindex tag archives (Info, no change recommended) | Not applicable | Unchanged by design. Posts still link their own tags via `.post-topics`. The sitewide tag cloud was replaced by a service-links widget (src/components/Sidebar.astro). /category/blog/ is no longer crawled. |

### Internal link matrix (36 rows, first audit findings/cluster.md)

| Rows | Status | Evidence now |
|---|---|---|
| 5, 8–21, 25–32, 34, 35, 36 | Fixed | Each link is present with the planned or a close anchor. Examples: /how-often…/ → cost guide "what each schedule costs"; floor post → /services/floor-stripping-waxing/ "floor stripping and waxing"; /robotic-vs-manual…/ → floor-stripping "auto-scrubbers and burnishers"; /green-clean-products/ → techniques-to-avoid "cleaning techniques to avoid". Row 34: all 11 location pages (the 4 new ones included) link to both guides in the "Office cleaning in X" section, each with a different anchor ("office cleaning costs in the GTA", "picking the number of visits", etc.). |
| 1, 2, 3, 6, 7, 22, 23, 24, 27 | Fixed (as a "Related" card) | The link exists only in the page's Related block (`blk-links`), not in body copy. Rows 1–3 and 6 asked for in-copy links under the pillar's "What affects the price" / "Cleaning through a Toronto year" H2s and office-cleaning's pricing copy. The card anchor is the card's title plus its description (up to 129 characters). |
| 4 | Open | /services/commercial-cleaning/ has no link to /benefits-of-commercial-deep-cleaning-services/. That post's only contextual inlink is from the cost guide. |
| 33 | Partly fixed | /industries/property-management/ → /services/pressure-washing/ exists (Related card). The condo common-area guide (Brief 5) does not exist. |

Contextual inlinks per post: zero went from 13 of 25 (first audit) to 5 of 24. Fewer than 3 went to 14 of 24. The first audit's target ("every spoke has at least 3") is not met. See N4.

## 2. New findings

### N1. Six new or edited pages have meta descriptions over 160 characters (Low)
Evidence: /locations/ 185, /locations/scarborough/ 167, /services/post-construction-cleaning/ 165, /locations/richmond-hill/ 163, /locations/north-york/ 161, /locations/durham-region/ 161. These are the four new location pages, the rewritten hub and one service page; none was in the first audit's list. Five more sit at 157–159 (/services/, /locations/markham/, /office-cleaning-checklist/, /office-layout-tips-…/, /5-cleaning-tips-…/).
Recommendation: cut to ≤155. The location descriptions all end "After hours, WSIB covered", which is the part that gets cut. Drop the third neighbourhood instead. For /locations/, list "Toronto, Peel, York and Durham" rather than 11 place names. Edit the description fields in the location data used by `src/pages/locations/[slug].astro`, `src/pages/locations/index.astro` and `src/content/services/post-construction-cleaning.md`.

### N2. Two new pages have titles over 60 characters (Low)
Evidence: /locations/durham-region/ "Office & Commercial Cleaning in Pickering, Ajax & Oshawa | Evergreen" (68). /office-cleaning-checklist/ "Office Cleaning Checklist: Daily, Weekly & Monthly | Evergreen" (62). The checklist's `seoTitle` is hard-coded in `src/content/blog/office-cleaning-checklist.md` and bypasses `pageTitle()`'s 60-character rule, because GuideLayout uses `seoTitle ?? title` directly.
Recommendation: "Commercial Cleaning in Pickering, Ajax & Oshawa | Evergreen" (59) and "Office Cleaning Checklist: Daily, Weekly & Monthly Tasks" (56, no brand), or "Office Cleaning Checklist: Daily to Monthly | Evergreen" (55).

### N3. The cost guide's title and H1 no longer contain "cost" (Medium)
Evidence: in the first audit, /office-cleaning-cost-toronto-guide/ had the title "Office Cleaning Cost Toronto: 2026 Pricing Guide" and the H1 "How Much Does Office Cleaning Cost in Toronto?". It now has the title "How Office Cleaning Is Priced in Toronto | Evergreen" and the H1 "How Office Cleaning Is Priced in Toronto" (commit e33ad58, "retitled to match what it delivers"). The page's target query, "office cleaning cost Toronto" (cluster.md SERP check), now appears only in the slug, H2s and FAQ. The honesty point stands: the figures are illustrative, not quotes. But the head term can be kept without promising a price list.
Recommendation: in `src/content/blog/office-cleaning-cost-toronto-guide.md`, set `seoTitle: "Office Cleaning Costs in Toronto: How Pricing Works"` (51; adding "| Evergreen" takes it to 63) and `title: "What Office Cleaning Costs in Toronto, and Why"`. Check GSC for impressions on "cost" queries before and after; I could not.

### N4. Five posts still have no contextual inlink, and the sidebar still favours the five newest (Medium)
Evidence: /5-cleaning-tips-to-help-make-your-office-relocation-seamless/, /how-to-keep-your-office-fridge-clean/, /keep-your-office-at-home-clean/, /office-layout-tips-to-make-cleaning-easier-and-faster/ and /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ get links only from /insights/ pagination. Office-layout also gets the Recent Posts widget. These five gained outbound links in Phase 1, but no page links in to them. Nine more have only 1–2 contextual inlinks, for example /areas-in-your-office-where-germs-are-likely-hiding/ (1, from disinfection), /commercial-cleaning-air-quality/ (1), /commercial-cleaning-techniques-to-avoid/ (1), /a-cleaning-checklist-for-your-retail-store/ (1), /cleaning-check-list-dental-clinics/ (1) and /benefits-of-commercial-deep-cleaning-services/ (1). `src/components/Sidebar.astro` still takes the 5 newest posts by `pubDate`; cluster F2's cluster-based "Related guides" widget was not built.
Recommendation: add the reverse links:
- /services/post-construction-cleaning/ → relocation post;
- break-rooms post → fridge post and office-layout post;
- /services/floor-stripping-waxing/ or /services/industrial-cleaning/ → robotic post;
- /services/disinfection-cleaning/ body → air-quality;
- /industries/medical-dental-clinics/ → dental checklist (the cluster audit already gave the reverse);
- pillar → deep-cleaning post (matrix row 4).

Then build the cluster-based sidebar from cluster F2.

### N5. Leftover misdirected and branded anchors (Low)
Evidence:
- /5-cleaning-products-you-should-have-in-your-office/ still links "professional cleaning" → /about-us/.
- /how-to-decide-on-a-cleaning-company/ still links "professional cleaning company" → /services/.

Cluster F5 fixed the other three of these five. Two posts use the brand name as the anchor to a service page:
- /day-night-…/ "Evergreen Office Cleaning" → /services/office-cleaning/;
- /5-easy-ways-…-floor-clean/ "Evergreen Office Cleaning" → /services/floor-stripping-waxing/, next to a correct "floor stripping and waxing" link to the same URL.
Recommendation: repoint the two service-intent anchors to /services/commercial-cleaning/, and unlink the brand-name anchors or point them at /about-us/. Edit the bodies in `src/content/blog/*.md`.

### N6. 18 posts end with the same templated sentence and the same two anchors (Low)
Evidence: "If you would rather leave it to a professional crew, Evergreen's office cleaning and commercial cleaning services cover it for workplaces across Toronto and the GTA." appears in 18 of 24 files in src/content/blog/. It links "office cleaning" → /services/office-cleaning/ and "commercial cleaning" → /services/commercial-cleaning/. The links are useful, but 18 identical sentences read as boilerplate, and the anchors never vary.
Recommendation: vary the sentence per post and point it at the service the post supports. For example, the floor post goes to floor-stripping-waxing and the germs post to disinfection.

### N7. Related-card anchors are the whole card, up to 129 characters (Info)
Evidence: 294 links in `blk-links` / `guide-related-grid` blocks. Each anchor is the card's title plus its description (17 are over 80 characters; the longest is /services/office-cleaning/ → cost guide, 129). Google weights the leading words most, so the title-first order is fine.
Recommendation: none required. To control the anchor more tightly, wrap only the card title in the `<a>` and keep the description outside it.

### N8. Paginated /insights/ pages share one H1 (Info)
Evidence: /insights/, /insights/page/2/ and /insights/page/3/ all have the H1 "Commercial Cleaning Insights". Titles and descriptions are unique ("Page 2 of 3").
Recommendation: optional. Append "– Page N" to the H1 on pages 2 and up, to match the title.

## 3. What still needs the client or an account owner
- GSC (owner access): which URL ranks for "office cleaning cost toronto" and "commercial cleaning toronto" before and after the cost-guide retitle (N3) and the homepage/pillar split. Also clicks and impressions for the five zero-inlink posts (N4) and /keep-your-office-at-home-clean/ before any prune decision.
- Client sign-off on adding real or ranged pricing to the cost guide, if they want the title to promise prices.
- Content for the remaining matrix row 33 (condo common-area guide, Brief 5) needs client input on the property-management scope they actually deliver.

## 4. Not verified
- Pixel-width truncation in live SERPs (lengths are character counts only), and whether Google rewrites any of these titles.
- Rankings, impressions or CTR effects of the title and description changes (no GSC access).
- The live site beyond the one header request. Everything else comes from today's evening crawl. The 301s for the two merged posts were not re-fetched here (technical area).
- Whether the anchors in Related cards are treated as contextual by Google. They are counted as contextual here, as in the first audit.

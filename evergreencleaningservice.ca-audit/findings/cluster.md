Score: 52/100

# Content Architecture: Semantic Clusters, Hub-and-Spoke and Internal Links

Scope: 25 blog posts (root-level URLs, listed under /insights/), 10 service pages plus the /services/ hub, /industries/ plus 2 industry pages (medical-dental-clinics, property-management; the brief's "3 industry pages" includes the hub), 8 location pages including the /locations/ hub. Link data comes from raw/crawl/pages.json (`internal_links`) and was checked against raw/crawl/html/*.html and src/. The SERP checks used 6 WebSearch queries. That tool returns US results, not google.ca, and some returned URLs were scraped or junk domains, so treat the overlap scores as directional.

## What works

- **The two new guides are strong spokes.** /how-often-should-an-office-be-cleaned/ (1,957 words) and /office-cleaning-cost-toronto-guide/ (2,004 words) use GuideLayout. Each has a table of contents, FAQs and a `guide.related` block (src/content/blog/*.md front matter). Both link to /services/office-cleaning/ in body copy.
- **The pillar sends some contextual links to posts.** /services/commercial-cleaning/ (2,513 words) links in body copy to the retail checklist, the daycare protocols, slips/trips/falls and how-to-decide, plus both industry pages, building maintenance, pressure washing, /green-clean-products/ and all 7 location pages.
- **The sidebar's tag cloud became a service widget on 2026-11-03.** src/components/Sidebar.astro now links to 6 service pages using query-matched anchors ("Commercial office cleaning", "Commercial cleaning & janitorial"). Before, the cloud sent sitewide links to noindex tag archives.
- **Most older posts link up to at least one service page.** 21 of 25 posts link in body copy to /services/office-cleaning/ and/or /services/commercial-cleaning/. Most of those anchors are "office cleaning" and "commercial cleaning".
- **/how-to-properly-dust-office-building/ is a good model spoke.** It gets body links from /services/office-cleaning/, /services/building-maintenance/, the seasonal checklist and the air-quality post.
- **No orphans.** Every post is reachable from /insights/ pagination, and there are no nofollow or empty-anchor internal links (summary-2.txt).

## Current hub-and-spoke map (as crawled)

### Service, industry and location pages → posts (body or "related" links only; nav, footer and sidebar excluded)

| Hub page | Posts it links to |
|---|---|
| /services/commercial-cleaning/ (pillar) | retail checklist, daycares/schools, slips/trips/falls, how-to-decide (4) |
| /services/office-cleaning/ | day-night, how-to-properly-dust (2) |
| /services/disinfection-cleaning/ | 6-products-never-mix (1) |
| /services/building-maintenance/ | how-to-properly-dust (1) |
| /industries/medical-dental-clinics/ | cleaning-check-list-dental-clinics (1) |
| /green-clean-products/ | 5-cleaning-products, 6-products-never-mix (2) |
| /services/floor-stripping-waxing/, /industrial-cleaning/, /post-construction-cleaning/, /emergency-cleaning/, /pressure-washing/, /graffiti-removal/, /industries/property-management/, /industries/ | **0** |
| All 8 /locations/ pages | **0** (they link only to services and other locations) |

None of the 10 service pages, 3 industry pages or 8 location pages links to /how-often-should-an-office-be-cleaned/, /office-cleaning-cost-toronto-guide/ or /seasonal-office-cleaning-checklist/. Only the homepage's "Latest insights" module links to them. The `related` arrays in src/content/services/*.md contain no blog posts at all.

### Posts: contextual inlinks vs template inlinks (indexable sources only, self-links and noindex tag/category archives excluded)

"Contextual" means a body link or a guide `related` link from an indexable page. "Template" means the sitewide Recent Posts widget, the homepage "Latest insights" module or the /insights/ pagination pages.

| Post | Contextual inlinks (from) | Template inlinks |
|---|---|---|
| how-often-should-an-office-be-cleaned | **0** | Recent Posts (sitewide), home, /insights/ |
| office-cleaning-cost-toronto-guide | **0** | Recent Posts, home, /insights/ |
| seasonal-office-cleaning-checklist | 1 (how-often related) | Recent Posts, home, /insights/ |
| ask-the-office-cleaners-cleaning-break-rooms | 2 (how-often, cost guide related) | Recent Posts, /insights/ |
| office-layout-tips-to-make-cleaning-easier-and-faster | **0** | Recent Posts, /insights/ |
| how-to-properly-dust-office-building | 4 (office-cleaning, building-maintenance, seasonal, air-quality) | /insights/page/3/ |
| day-night-which-is-the-best-routine-for-your-office | 2 (office-cleaning, seasonal) | /insights/page/2/ |
| how-to-decide-on-a-cleaning-company | 2 (pillar, cost guide) | /insights/page/3/ |
| 6-common-cleaning-products-that-you-should-never-mix-together | 2 (disinfection, green-clean-products) | /insights/page/2/ |
| 5-cleaning-products-you-should-have-in-your-office | 2 (green-clean-products, germs post) | /insights/page/2/ |
| cleaning-protocols-for-daycares-and-schools | 1 (pillar) | /insights/page/3/ |
| a-cleaning-checklist-for-your-retail-store | 1 (pillar) | /insights/ |
| preventing-slips-trips-falls-in-your-workplace | 1 (pillar) | /insights/page/2/ |
| cleaning-check-list-dental-clinics | 1 (medical-dental) | /insights/page/3/ |
| 5-easy-ways-to-keep-your-commercial-floor-clean | 1 (office-layout, anchor "Carpets require a lot of maintenance") | /insights/page/2/ |
| benefits-of-commercial-deep-cleaning-services | **0** | /insights/page/2/ |
| areas-in-your-office-where-germs-are-likely-hiding | **0** | /insights/page/2/ |
| importance-of-hand-washing | **0** | /insights/ |
| commercial-cleaning-air-quality | **0** | /insights/page/3/ |
| commercial-cleaning-techniques-to-avoid | **0** | /insights/ |
| robotic-vs-manual-cleaning-which-will-ultimately-succeed | **0** | /insights/ |
| 5-cleaning-tips-to-help-make-your-office-relocation-seamless | **0** | /insights/ |
| how-to-keep-your-office-fridge-clean | **0** | /insights/page/2/ |
| how-to-take-care-of-plants-in-the-office | **0** | /insights/page/2/ |
| keep-your-office-at-home-clean | **0** | /insights/page/2/ |

13 of 25 posts have no contextual inlink. 10 of those 13 are reachable only through /insights/ pagination and noindex archives, because the Recent Posts widget only covers the 5 newest posts. The brief's inlink counts (floor post 4, dental 6, home office 6) include noindex tag and category archives. Counting indexable sources only, those posts have 2, 2 and 1.

## Topic clusters and intent

Intent key: I = informational, C = commercial investigation, T = transactional. "Hub" is the money page each cluster should feed.

| Cluster | Hub page(s) | Posts (intent) | Health |
|---|---|---|---|
| 1. Office cleaning | /services/office-cleaning/ | how-often (I/C), day-night (C), seasonal checklist (I), break rooms (I), dust (I), office layout (I), fridge (I), relocation (I, partly C for move-out cleans) | Best-covered cluster, but the hub links to only 2 of its 8 posts, and how-often ↔ day-night ↔ seasonal are not linked together |
| 2. Cost and buying guides | /services/commercial-cleaning/ + /request-a-quote/ | cost guide (C), how-to-decide (C), benefits of deep cleaning (C) | Highest commercial value. The cost guide has 0 contextual inlinks, and the pillar's "What affects the price" H2 does not link to it |
| 3. Commercial / janitorial methods | /services/commercial-cleaning/, /green-clean-products/ | techniques to avoid (I), robotic vs manual (I), 5 products to have (I), 6 never mix (I) | Weak: 3 of 4 posts have 0 or only template links. Titles are generic |
| 4. Floor care and building maintenance | /services/floor-stripping-waxing/, /services/building-maintenance/ | 5 easy ways floor (I), slips/trips/falls (I) | **Broken.** The floor post has no body link to either floor service, and floor-stripping-waxing links to no post |
| 5. Disinfection and health | /services/disinfection-cleaning/ | germs hiding (I), hand-washing (I), air quality (I) | Disinfection links to none of these, and all 3 have 0 contextual inlinks |
| 6. Industry-specific | /industries/medical-dental-clinics/, /industries/property-management/, /industries/ | dental checklist (I/C), daycares/schools (I/C), retail checklist (I/C) | 1 link each. Retail and daycare have no industry page. Property management and industrial have 0 supporting posts |
| 7. Workplace tips (no service fit) | none | plants (I), home office (I, B2C), fridge (I) | Off-topic. Merge or prune (see below) |
| Location layer | 8 /locations/ pages | none | Location pages link to no guide, not even the Toronto cost guide |

### SERP overlap checks (6 queries, US results)

| Pair | Shared URLs in top 10 | Wider overlap (about top 20) | Verdict |
|---|---|---|---|
| "office cleaning checklist" vs "seasonal office cleaning checklist" | 0 | 0 (both SERPs are template/checklist tools: checklist.com, SafetyCulture, GoAudits, Connecteam vs Pritchard, Quill, Building Stars) | **Separate posts.** The site has no general office-cleaning checklist page, which is a gap (Brief 1) |
| "how often should an office be cleaned" vs "office cleaning frequency" | 4 (avantigreen, top4 print, ServiceMaster Building Care, cleanlink) | about 9 (adds jan-pro, top4 mobile, cleanzen, cleaning-express, odoo) | **Same post.** Target both from /how-often-should-an-office-be-cleaned/ by working "office cleaning frequency" into an H2 and the FAQ. Do not create a second page |
| "commercial cleaning cost Toronto" vs "office cleaning prices Toronto" | 2 (dev.to Toronto cost, titanedge) | about 7 (Hellamaid ×2 and HomeStars appear in both) | **Same cluster, interlink.** Keep one cost guide and add a "Commercial and janitorial cleaning costs" H2 rather than a new URL. Recheck on google.ca before splitting |

The cost SERPs are thin: directories, dev.to posts and provider blogs, with no clear authority. A 2,000-word Toronto guide with worked examples can compete there if it gets internal link support, and it currently has none.

## Findings

### F1. The money guides get no contextual links from money pages (Severity: High)
- **Evidence:** No service, industry or location page links to /office-cleaning-cost-toronto-guide/, /how-often-should-an-office-be-cleaned/ or /seasonal-office-cleaning-checklist/ (checked pages.json line ranges 934–20758). The pillar has H2s "What affects the price", "Cleaning through a Toronto year" and "Commercial cleaning, janitorial or office cleaning?", and none of them links to the matching guide. The two guides also don't link to each other: the `guide.related` front matter in each .md only names break-rooms, seasonal and how-to-decide.
- **Recommendation:** In src/content/services/commercial-cleaning.md, add in-copy links under "What affects the price" (→ cost guide) and "Cleaning through a Toronto year" (→ seasonal checklist), and add both guides to its `related` array. In src/content/services/office-cleaning.md, add the how-often guide, the cost guide and the seasonal checklist to `related`. The schema already accepts any `href`, so no code change is needed. Link the two guides to each other via `guide.related`.

### F2. 13 of 25 posts have no contextual inlinks; the Recent Posts widget concentrates equity on the 5 newest (Severity: High)
- **Evidence:** See the table above. Sidebar.astro takes `getCollection('blog')` sorted by `pubDate`, `.slice(0, 5)`, so how-often, cost, seasonal, break-rooms and office-layout get a link from every standard post and inner page. The other 20 posts get no sidebar links.
- **Recommendation:** Add an optional `cluster` field (enum: office, cost, methods, floor, health, industry) to the blog schema in src/content.config.ts. In Sidebar.astro, replace or augment "Recent Posts" with "Related guides": 3 posts from the same cluster plus 2 newest, excluding the current post. Then add the body links from the link matrix below.

### F3. The floor-care cluster is disconnected from its service pages (Severity: High)
- **Evidence:** /5-easy-ways-to-keep-your-commercial-floor-clean/ links in body copy only to /about-us/ ("professional commercial cleaning") and /contact-us/. It has no link to /services/floor-stripping-waxing/ or /services/building-maintenance/, and its front matter has no `tags` line. /services/floor-stripping-waxing/ links to no post. /preventing-slips-trips-falls-in-your-workplace/ links to the pillar with the anchor "seeking janitorial services", not to floor care.
- **Recommendation:** Rewrite the floor post as a spoke for floor-stripping-waxing (see the retitle list) and add the F-cluster links in the matrix.

### F4. Disinfection, industrial, post-construction, property management and all locations have zero supporting content (Severity: Medium)
- **Evidence:** /services/disinfection-cleaning/ links to 1 post (6-never-mix, which is a product-safety topic), even though germs, hand-washing and air-quality are natural spokes. Industrial, post-construction, emergency, pressure-washing, graffiti and property management have no posts at all. A warehouse floor clean-and-wax case study exists as a draft (src/content/projects/warehouse-floor-clean-and-wax.md) and is not published.
- **Recommendation:** Add the links in the matrix and write Briefs 2, 3, 5 and 6. Publish the warehouse case study once approved and link it from /services/industrial-cleaning/ and Brief 2.

### F5. Generic or misdirected anchors (Severity: Medium)
- **Evidence:** Three posts link to /about-us/ with service-style anchors: the floor post ("professional commercial cleaning"), the dental checklist ("commercial cleaning service") and 5-cleaning-products ("professional cleaning"). Two posts send service-intent anchors to /services/ instead of the pillar: retail checklist ("commercial cleaning and janitorial needs") and how-to-decide ("professional cleaning company").
- **Recommendation:** Point these anchors at /services/commercial-cleaning/, or at the specific service (dental → /industries/medical-dental-clinics/). Edit the corresponding src/content/blog/*.md bodies.

### F6. Cannibalization risks (Severity: Medium; not verified, no GSC access)
- **How-often vs cost guide:** both contain a "6,000 sq. ft. office" worked example and a hiring/quote-comparison section. Keep the frequency example in how-often and the dollar example in the cost guide. Cut the duplicated quote-comparison section from how-often and link to the cost guide instead.
- **Cost guide "Comparing cleaning quotes" vs /how-to-decide-on-a-cleaning-company/:** acceptable if how-to-decide is repositioned as the vendor-selection/contract piece (see retitles) and the two link to each other.
- **Homepage vs pillar:** the homepage title is "Commercial Cleaning Company in Toronto…" and the pillar title is "Commercial Cleaning & Janitorial Services in Toronto…". Check GSC for "commercial cleaning toronto" to see which URL Google ranks. If the homepage wins, keep the pillar focused on "janitorial services toronto" and add a homepage → pillar body link with the anchor "commercial cleaning and janitorial services".
- **/benefits-of-commercial-deep-cleaning-services/ vs /services/building-maintenance/:** no deep-cleaning service page exists, so the post is the only "commercial deep cleaning" target. Make it a proper spoke rather than competing with building maintenance.
- **No duplicate primary keywords** were found among the 25 post titles.

### F7. Off-topic and thin posts dilute the blog (Severity: Low)
- **Evidence:** /keep-your-office-at-home-clean/ (612 words, home-office/B2C intent), /how-to-take-care-of-plants-in-the-office/ (591), /importance-of-hand-washing/ (513), /cleaning-protocols-for-daycares-and-schools/ (553). All have little or no service fit or depth.
- **Recommendation:** See the merge list. Check GSC clicks and impressions for each URL before removing anything; I could not verify traffic.

## Recommended internal link matrix

Body links unless marked "related" (the `related` front matter array). Edit src/content/services/*.md, src/content/industries/*.md, src/content/blog/*.md, and the location template data in src/pages/locations/[slug].astro.

| # | From | To | Anchor |
|---|---|---|---|
| 1 | /services/commercial-cleaning/ ("What affects the price") | /office-cleaning-cost-toronto-guide/ | commercial cleaning costs in Toronto |
| 2 | /services/commercial-cleaning/ ("Cleaning through a Toronto year") | /seasonal-office-cleaning-checklist/ | seasonal cleaning checklist |
| 3 | /services/commercial-cleaning/ ("Scheduling") | /how-often-should-an-office-be-cleaned/ | how often a commercial space should be cleaned |
| 4 | /services/commercial-cleaning/ ("Periodic work…") | /benefits-of-commercial-deep-cleaning-services/ | commercial deep cleaning |
| 5 | /services/office-cleaning/ (related + scheduling copy) | /how-often-should-an-office-be-cleaned/ | office cleaning frequency |
| 6 | /services/office-cleaning/ (pricing section) | /office-cleaning-cost-toronto-guide/ | office cleaning cost in Toronto |
| 7 | /services/office-cleaning/ (related) | /seasonal-office-cleaning-checklist/ | seasonal office cleaning checklist |
| 8 | /how-often-should-an-office-be-cleaned/ | /office-cleaning-cost-toronto-guide/ | what each schedule costs |
| 9 | /how-often-should-an-office-be-cleaned/ | /day-night-which-is-the-best-routine-for-your-office/ | day or night cleaning |
| 10 | /how-often-should-an-office-be-cleaned/ | /services/commercial-cleaning/ | commercial cleaning and janitorial services |
| 11 | /office-cleaning-cost-toronto-guide/ | /how-often-should-an-office-be-cleaned/ | how often your office needs cleaning |
| 12 | /office-cleaning-cost-toronto-guide/ | /services/commercial-cleaning/ | janitorial services |
| 13 | /office-cleaning-cost-toronto-guide/ | /benefits-of-commercial-deep-cleaning-services/ | one-off deep clean |
| 14 | /day-night-which-is-the-best-routine-for-your-office/ | /how-often-should-an-office-be-cleaned/ | office cleaning schedule |
| 15 | /seasonal-office-cleaning-checklist/ | /how-often-should-an-office-be-cleaned/ | daily, weekly and monthly tasks |
| 16 | /how-to-decide-on-a-cleaning-company/ | /office-cleaning-cost-toronto-guide/ | compare cleaning quotes |
| 17 | /benefits-of-commercial-deep-cleaning-services/ | /services/building-maintenance/ (exists) + /request-a-quote/ | periodic deep cleaning; request a walkthrough |
| 18 | /services/floor-stripping-waxing/ | /5-easy-ways-to-keep-your-commercial-floor-clean/ | daily floor care between wax visits |
| 19 | /5-easy-ways-to-keep-your-commercial-floor-clean/ | /services/floor-stripping-waxing/ | floor stripping and waxing |
| 20 | /5-easy-ways-to-keep-your-commercial-floor-clean/ | /preventing-slips-trips-falls-in-your-workplace/ | prevent slips on wet floors |
| 21 | /preventing-slips-trips-falls-in-your-workplace/ | /services/building-maintenance/ | floor care and entrance matting |
| 22 | /services/building-maintenance/ | /5-easy-ways-to-keep-your-commercial-floor-clean/ | keeping commercial floors clean |
| 23 | /services/disinfection-cleaning/ | /areas-in-your-office-where-germs-are-likely-hiding/ | high-touch surfaces in an office |
| 24 | /services/disinfection-cleaning/ | /cleaning-protocols-for-daycares-and-schools/ | daycare and school disinfection |
| 25 | /areas-in-your-office-where-germs-are-likely-hiding/ | /services/disinfection-cleaning/ (exists) + /commercial-cleaning-air-quality/ | indoor air quality |
| 26 | /commercial-cleaning-air-quality/ | /services/disinfection-cleaning/ | disinfection cleaning |
| 27 | /industries/medical-dental-clinics/ | /services/disinfection-cleaning/ (related) | touch-point disinfection |
| 28 | /cleaning-check-list-dental-clinics/ | /industries/medical-dental-clinics/ (replace the /about-us/ anchor) | dental clinic cleaning in Toronto |
| 29 | /a-cleaning-checklist-for-your-retail-store/ | /services/commercial-cleaning/ (replace the /services/ link) | retail cleaning services |
| 30 | /commercial-cleaning-techniques-to-avoid/ | /6-common-cleaning-products-that-you-should-never-mix-together/ | products you should never mix |
| 31 | /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ | /services/floor-stripping-waxing/ | auto-scrubbing and burnishing |
| 32 | /green-clean-products/ | /commercial-cleaning-techniques-to-avoid/ | cleaning techniques to avoid |
| 33 | /industries/property-management/ | /services/pressure-washing/ (exists) + new condo common-area guide (Brief 5) | condo common-area cleaning checklist |
| 34 | All 8 /locations/* (shared template block) | /office-cleaning-cost-toronto-guide/ and /how-often-should-an-office-be-cleaned/ | office cleaning costs in the GTA; how often to clean your office |
| 35 | /5-cleaning-tips-to-help-make-your-office-relocation-seamless/ | /services/post-construction-cleaning/ | move-in cleaning after a fit-out |
| 36 | /how-to-keep-your-office-fridge-clean/ and /office-layout-tips…/ | /ask-the-office-cleaners-cleaning-break-rooms/ | break room cleaning |

After these changes, every spoke has at least 3 contextual inlinks and every service page except graffiti and emergency links to at least one post. The new briefs cover those two service pages through their checklists.

## Prioritized new content briefs

| P | Working title | Target query (secondary) | Intent | Cluster | Supports | Notes |
|---|---|---|---|---|---|---|
| 1 | Office Cleaning Checklist: Daily, Weekly and Monthly Tasks (Free PDF) | office cleaning checklist (commercial office cleaning checklist) | I (template) | Office | /services/office-cleaning/ | SERP overlap with "seasonal…" is 0, so make it a separate post. SERP is template-heavy, so ship a printable. Link to how-often and seasonal. 1,200–1,800 words |
| 2 | Warehouse Cleaning Checklist and Guide for GTA Facilities | warehouse cleaning checklist (warehouse cleaning services) | I/C | Industrial (new) | /services/industrial-cleaning/ | Industrial currently has 0 spokes. Cover racking, dock areas, auto-scrubbing and high dusting. Use the draft warehouse case study as proof |
| 3 | Post-Construction Cleaning Checklist for Commercial Fit-Outs | post construction cleaning checklist | I/C | Building / specialty | /services/post-construction-cleaning/ | Rough, final and touch-up phases. Hellamaid ranks a Toronto post-construction pricing guide in the cost SERP, so add a "what affects the price" section |
| 4 | How Often Should You Strip and Wax Commercial Floors? | how often to strip and wax floors (VCT floor maintenance) | I | Floor care | /services/floor-stripping-waxing/ | Pair with the retitled floor post. Floor-stripping currently has 0 spokes |
| 5 | Condo Common-Area Cleaning Checklist for Ontario Property Managers | condo common area cleaning (condo cleaning checklist) | I/C | Industry | /industries/property-management/ | Lobbies, garbage rooms, parking garages, amenity rooms. Link to pressure-washing and graffiti |
| 6 | Dental Office Cleaning and IPAC Checklist (Ontario) | dental office cleaning checklist (dental IPAC cleaning) | I/C | Industry | /industries/medical-dental-clinics/ | **Rewrite and replace** /cleaning-check-list-dental-clinics/ (2020) at the same URL rather than adding a new post. Cite current RCDSO/PHO IPAC guidance and separate the clinic's clinical IPAC duties from janitorial scope |
| 7 | Commercial Cleaning RFP Template (Free Download) | cleaning services RFP template (janitorial RFP) | C | Cost and buying | /services/commercial-cleaning/, /industries/property-management/ | Scope tables, frequencies, insurance/WSIB, KPIs. Link from how-to-decide and the cost guide |
| 8 | Comparing Commercial Cleaning Contracts: Scope, Terms and Red Flags | cleaning contract comparison (how to compare cleaning quotes) | C | Cost and buying | /services/commercial-cleaning/, /request-a-quote/ | Could instead be a major expansion of /how-to-decide-on-a-cleaning-company/ (650 words) at the same URL. Prefer that to avoid a 3-way overlap with the cost guide |
| 9 | Removing Winter Salt Stains From Commercial Floors and Entrances | how to remove salt stains from commercial floors | I | Floor care / seasonal | /services/building-maintenance/, /services/floor-stripping-waxing/ | Toronto-specific. Links to the seasonal checklist and slips/trips |
| 10 | Green Cleaning Certifications Explained (ECOLOGO, Green Seal, CIMS-GB) | green cleaning certification | I | Methods / products | /green-clean-products/, /services/commercial-cleaning/ | Do not imply Evergreen holds any certification unless it does. /green-clean-products/ is only 304 words |

The gap topics (warehouse, condo, dental IPAC, green certifications, RFP, contract comparison) came from the brief and the site inventory. I did not SERP-check them because of the 6-query limit, so verify search demand before committing writing time.

## Merge, retitle and move recommendations

**Merge (301 the weaker URL; add the redirect in Cloudflare/`public/_redirects` or wherever existing redirects live):**
- /importance-of-hand-washing/ (513 words) → /areas-in-your-office-where-germs-are-likely-hiding/. Retitle the merged post "Office Germ Hotspots and Hand Hygiene: What to Clean and How Often".
- /how-to-take-care-of-plants-in-the-office/ → /commercial-cleaning-air-quality/ (plants become a short section), or prune if it has no traffic.
- /keep-your-office-at-home-clean/: B2C home-office intent with no service fit. Prune (410) or noindex if GSC shows negligible clicks. Otherwise leave it but drop it from any related-post logic.

**Retitle in place (keep the URL; update `title`/`seoTitle` and refresh the content):**
- /5-easy-ways-to-keep-your-commercial-floor-clean/ → "Commercial Floor Care: Daily Maintenance Between Strip-and-Wax Visits". Also add `tags`.
- /cleaning-check-list-dental-clinics/ → "Dental Office Cleaning Checklist for Ontario Clinics" (Brief 6 rewrite).
- /benefits-of-commercial-deep-cleaning-services/ → "Commercial Deep Cleaning: What's Included and When You Need One".
- /a-cleaning-checklist-for-your-retail-store/ → "Retail Store Cleaning Checklist".
- /cleaning-protocols-for-daycares-and-schools/ → "Daycare and School Cleaning Checklist", and expand it from 553 words.
- /5-cleaning-products-you-should-have-in-your-office/ → "Office Cleaning Supplies List: What to Keep On Hand". The current "Commercial Cleaning Products" wording overlaps /green-clean-products/.
- /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ → "Robotic Floor Scrubbers vs Manual Cleaning in Commercial Buildings".
- /how-to-decide-on-a-cleaning-company/ → "How to Choose a Commercial Cleaning Company (and Compare Contracts)" if Brief 8 is folded in.
- /how-often-should-an-office-be-cleaned/: keep the title but add "office cleaning frequency" to an H2 and the FAQ (SERP overlap supports a single page).

**Move under /insights/: not recommended.** Moving 25 root-level URLs to /insights/<slug>/ would give no ranking benefit, would risk temporary losses, and adds a redirect layer. The breadcrumb (Home > Insights > Post) and BreadcrumbList schema already express the hierarchy. Fix the hierarchy with links instead.

## Quick wins (5 or fewer)
1. Add the cost guide, how-often and seasonal to the `related` arrays in src/content/services/office-cleaning.md and commercial-cleaning.md, and cross-link the two guides via `guide.related` (matrix rows 1–3, 5–8, 11).
2. Add one body link from the floor post to /services/floor-stripping-waxing/ and one back (rows 18–19).
3. Add germs, daycares and air-quality links on /services/disinfection-cleaning/ (rows 23–24) and their links back up.
4. Repoint the 5 misdirected anchors (/about-us/ ×3, /services/ ×2) to the pillar or the specific service.
5. Add a 2-link "Planning guides" block to the location template in src/pages/locations/[slug].astro (row 34).

## Not verified
- Search volumes, google.ca SERPs (the WebSearch tool is US-only) and GSC data on clicks, impressions or which URL ranks for which query.
- Traffic for the posts proposed for pruning or merging.

## Structured findings (for audit-data.json, category "Content Architecture")

```json
{
  "category": "Content Architecture",
  "score": 52,
  "findings": [
    {"id": "CA-1", "severity": "High", "title": "Money guides receive no contextual links from service/industry/location pages", "urls": ["/office-cleaning-cost-toronto-guide/", "/how-often-should-an-office-be-cleaned/", "/seasonal-office-cleaning-checklist/"], "fix": "Add to related arrays in src/content/services/office-cleaning.md and commercial-cleaning.md; link from pillar H2s; cross-link guides via guide.related"},
    {"id": "CA-2", "severity": "High", "title": "13/25 posts have zero contextual inlinks; Recent Posts widget favours the 5 newest", "file": "src/components/Sidebar.astro", "fix": "Cluster-based related posts via a new 'cluster' field in src/content.config.ts"},
    {"id": "CA-3", "severity": "High", "title": "Floor-care cluster disconnected from floor-stripping-waxing and building-maintenance", "urls": ["/5-easy-ways-to-keep-your-commercial-floor-clean/", "/services/floor-stripping-waxing/"]},
    {"id": "CA-4", "severity": "Medium", "title": "Disinfection, industrial, post-construction, property-management and all 8 location pages have no supporting posts"},
    {"id": "CA-5", "severity": "Medium", "title": "Service-intent anchors pointing to /about-us/ (3) and /services/ (2)"},
    {"id": "CA-6", "severity": "Medium", "title": "Overlap risk: how-often vs cost guide (shared 6,000 sq ft example + quote section); homepage vs pillar for 'commercial cleaning toronto' (unverified)"},
    {"id": "CA-7", "severity": "Low", "title": "Off-topic/thin posts: home office, plants, hand-washing"}
  ],
  "serp_overlap": [
    {"a": "office cleaning checklist", "b": "seasonal office cleaning checklist", "shared_top10": 0, "verdict": "separate"},
    {"a": "how often should an office be cleaned", "b": "office cleaning frequency", "shared_top10": 4, "shared_top20_approx": 9, "verdict": "same post"},
    {"a": "commercial cleaning cost Toronto", "b": "office cleaning prices Toronto", "shared_top10": 2, "shared_top20_approx": 7, "verdict": "same cluster / one guide with section"}
  ],
  "new_briefs": 10,
  "merges": ["/importance-of-hand-washing/ -> /areas-in-your-office-where-germs-are-likely-hiding/", "/how-to-take-care-of-plants-in-the-office/ -> /commercial-cleaning-air-quality/"],
  "prune_candidates": ["/keep-your-office-at-home-clean/"],
  "move_under_insights": false
}
```

Sources (SERP checks): [office cleaning checklist: checklist.com](https://checklist.com/office-cleaning-checklist), [SafetyCulture](https://safetyculture.com/checklists/office-cleaning), [Pritchard seasonal janitorial checklist](https://www.pritchardindustries.com/janitorial-checklist/), [Avanti Green frequency](https://www.avantigreen.com/how-often-should-your-office-be-cleaned-nightly-vs-3x-weekly-vs-weekly/), [Cleanlink](https://www.cleanlink.com/news/article/How-Often-Should-Offices-Be-Cleaned--32194), [ServiceMaster Building Care](https://www.servicemasterclean.com/servicemaster-building-care/tips-and-resources/local-blog/2025/october/how-often-should-your-office-be-cleaned-a-janitorial-cleaning-schedule-guide/), [Jan-Pro](https://jan-pro.com/oklahomacity/office-cleaning-frequency/), [Hellamaid Ontario commercial cost](https://hellamaid.ca/blog/how-much-does-commercial-cleaning-cost-in-ontario), [HomeStars Toronto cost guide](https://homestars.com/cost-guides/on/cleaning-services-cost-toronto/), [Bark commercial office cleaning costs](https://www.bark.com/en/ca/commercial-cleaning/commercial-office-cleaning-costs).

# FLOW analysis: www.evergreencleaningservice.ca

Framework and prompts © Daniel Agrici, CC BY 4.0: github.com/AgriciDaniel/flow

| | |
|---|---|
| Target | https://www.evergreencleaningservice.ca (Evergreen Office Cleaning, formerly "Evergreen Cleaning Service"; one office, 243 Queen St W, Toronto; B2B office/commercial cleaning across the GTA; "since 1989") |
| Date | 2026-10-28 |
| Named competitors | JAN-PRO Canada (https://jan-pro.ca/en/, the master franchise that serves Toronto via "Toronto – West" and "Toronto – East" offices) and JAN-PRO US (https://jan-pro.com), plus the local firms that rank for "office cleaning toronto" / "commercial cleaning toronto" |
| Known constraints | No Search Console, GA4 or Google Ads access (10XiD is requesting it). GTM `GTM-5W69BTJQ` holds Google Ads conversion tracking only. Site rebuilt and restructured 15 Oct 2026 (`/home/user/evergreencleaningservice/docs/growth/README.md`). |
| Skill run | `claude-seo` → `seo-flow`, references read: `flow-framework.md`, `bibliography.md`, `prompts/README.md`, all 5 Find, 1 Leverage, 3 Win prompts, 11 Local prompt headers, and the 3 selected Optimize prompts. |
| Environment | Plugin Python fetchers refuse the local proxy, so evidence was gathered with `curl -sL` (TLS kept on), WebSearch and WebFetch. Raw files: `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/flow/` (page HTML, JAN-PRO HTML, `search-log.md`). Earlier passes of this audit (`findings/*.md`, `raw/local/`, `raw/geo/`, `raw/cluster/`, `raw/backlinks/`) are cited where reused. |

**Evidence labels used below:** **[O]** observed directly (URL fetched or file read today), **[P]** observed in an earlier pass of this same audit (28 Oct 2026, raw files kept), **[A]** assumption, **[V]** claim that must be verified before it is published or acted on.

**A note on the prompt library.** In the synced copy of the FLOW library, the 5 Find, 1 Leverage, 21 Optimize and 11 Local prompt files share one generic prompt body ("create a [stage] deliverable… 1. Searcher or buyer intent, 2. Evidence available now, 3. Gaps…, 4. Recommended changes in priority order, 5. Measurement events and review cadence, 6. Claims that require source verification"). Only the 3 Win prompts have distinct bodies. Each stage below therefore follows that six-part structure, with the prompt's title used as the lens, and the Win stage follows the three specific prompts literally.

---

## 0. Operating-workflow checkpoint (flow-framework.md)

1. **Business outcome.** Qualified commercial-cleaning enquiries (walkthrough bookings) from Toronto/GTA facility, office and property managers, measured as stored leads (`lead_form_submission`) and connected calls, not impressions. [O: `docs/growth/tracking-spec.md`]
2. **Evidence inventory available now.** Live site HTML (73 sitemap URLs, all 200) [P: `findings/sitemap.md`]; the live GTM container decoded [O: tracking-spec]; the Google Business Profile as rendered in Maps [P: `raw/local/gbp_overview.txt`]; eight Maps-pack captures [P: `raw/local/maps_*.txt`]; 42 SERP pulls [P: `raw/cluster/serp-top10.md`]; JAN-PRO pages [O/P]; directory listings [P: `findings/geo.md` §5]; client intake list [O: `docs/growth/client-intake.md`]. **Not available:** any query, click, call, lead-count or revenue data.
3. **Which stage is blocking.** Two at once. **Win** is blocked because nothing but an Ads conversion is measured, so no page can be judged. **Leverage** is blocked because the brand is barely corroborated off-site (two names, stale NAP, 10 Google reviews, absent from every captured local pack). Find and Optimize are in reasonable shape after the 15 Oct rebuild and need refinement rather than rebuilding.
4. **Rewrite only after evidence is organised.** The intake list (A1–A12, B1–B6, C1–C5, D1–D5) is already the source table. Nothing below asks for new prose before those facts land.
5. **Three readers.** Buyer, search engine, AI agent. Each stage output names which reader the gap affects.

---

## 1. FIND: demand, intent, and what the SERP rewards

### Prompts applied
- `find/keyword-research-prompt.md` — Keyword research prompt
- `find/keyword-variations-for-topical-relevance-prompt.md` — Keyword variations for topical relevance
- `find/content-planning-for-topical-relevance-prompt.md` — Content planning for topical relevance
- `find/content-prioritization-prompt.md` — Content prioritization
- `find/prompt-audience-avatar.md` — Audience avatar

Cross-reference: for deeper SERP clustering see `/seo cluster <seed-keyword>` (already run: `findings/clusters.md`).

### Evidence gathered
| Evidence | Source | Label |
|---|---|---|
| Head-term SERPs for "office cleaning toronto", "commercial cleaning toronto", "best commercial cleaning companies toronto 2026", "JAN-PRO Toronto…": providers surfaced are Coverall of Toronto, Enviro-Master (Peel/Halton Toronto pages), WeCleanIt, Auraclean, Dust 'Til Dawn, Gemini, Swift, MCA Group; directories HomeStars, YellowPages, Bark, StarOfService, ThreeBestRated. **Evergreen appears in none.** | WebSearch 2026-10-28, logged in `raw/flow/search-log.md` (US index, not Toronto-personalised) | [O] |
| 42-keyword expansion, overlap pairs and intent codes. Evergreen appeared in 0 of 42 top-10 sets; JAN-PRO in 3 (retail cleaning, how to choose, commercial vs janitorial). | `findings/clusters.md` §0–2; `raw/cluster/serp-top10.md` | [P] |
| Maps pack for "office cleaning toronto" (Toronto-centred capture): Toronto Office Cleaning Services 5.0 (29), Commercial office Cleaning Service (0), Toronto Commercial Cleaning Service 5.0 (3), Toronto Office Cleaning Pros 5.0 (13), Dust 'Til Dawn 5.0 (85), Toronto Shine 4.8 (432), Great Commercial Cleaners 5.0 (110), Office Cleaning Services Toronto 5.0 (7). Evergreen absent. Same pattern for "commercial cleaning toronto" and "janitorial services toronto"; "office cleaning mississauga" pack is dominated by house-cleaning profiles. | `raw/local/maps_office_cleaning_toronto.txt`, `maps_commercial_cleaning_toronto.txt`, `maps_janitorial_services_toronto.txt`, `maps_office_cleaning_mississauga.txt` | [P] |
| Price-intent evidence: HomeStars quotes "$30 to $60 per hour" for Toronto office cleaning; JAN-PRO Canada's office page has a "What office cleaning services cost" section listing six price drivers but no figures. Evergreen gives price factors (no figures) on service pages and "from $30/hr" only on noindex paid pages. | WebSearch; `raw/flow/janpro_ca_office.html`; `raw/flow/home_services_office-cleaning.html`; `docs/growth/adaptation-matrix.md` row 6 | [O] |
| ThreeBestRated Toronto commercial cleaning: #1 MCA Group (founded 1993, "700 facilities"), #2 JAN-PRO (founded 2005, "1,100 properties monthly in eastern Toronto"), #3 Great Commercial Cleaners (founded 2023). Evergreen not listed. | https://threebestrated.ca/commercial-cleaning-services-in-toronto-on (WebFetch) | [O] |
| Current page targeting after the rebuild: `/` "Office & Commercial Cleaning in Toronto & GTA"; `/services/office-cleaning/` "Office Cleaning Services in Toronto & the GTA"; `/services/commercial-cleaning/`; `/locations/mississauga/` "Commercial Cleaning & Office Janitorial Services Mississauga"; 2 industry pages; `/our-process/`. | `raw/flow/home*.html` title/H1 extraction | [O] |
| Client's own priority order (no analytics): Commercial, then Office on the quote form; Ads copy = recurring commercial cleaning; brief = recurring office/commercial and post-construction. | `docs/growth/README.md` "Current state found" | [O] |

### Output

**1. Searcher / buyer intent (audience avatar).** Primary avatar: the office or facility manager (or owner of a 10–200-person professional firm) in Toronto/GTA who needs a recurring after-hours cleaner they will not have to chase. Secondary avatars: property/condo manager needing common areas plus short-notice one-offs (evidence: the Michael Katchen review, `/industries/property-management/`); clinic manager needing IPAC-aware cleaning; GC or tenant needing a post-construction clean before handover. Buying questions visible in the SERP: "how much does office cleaning cost in Toronto", "how often should an office be cleaned", "commercial vs janitorial", "how to choose a commercial cleaning company" (JAN-PRO ranks for the last two). [O/P]

**2. Evidence available now.** Qualitative only. Demand volume, Evergreen's current impressions and the queries that already bring leads are unknown (no GSC/GA4/Ads). Everything in this section is therefore a hypothesis ordered by SERP breadth, not by volume. [A]

**3. Gaps that block Find.**
- No query data: the office-vs-commercial priority is the client's guess. [V: GSC + Ads search terms]
- The SERP for the head terms is a **local pack plus directories plus franchise brands**. Evergreen is in neither the pack nor the directories that rank (HomeStars, ThreeBestRated, YellowPages), so it has no "surface" for these queries today. [O]
- Price intent is unanswered on indexable pages while competitors (HomeStars, Hellamaid, JAN-PRO Canada) answer it. [O]
- Mississauga-type location queries return house-cleaning profiles, which means Google treats the query as mixed intent; a commercial-only business needs an explicit commercial signal (GBP category and page copy) to show there. [P]

**4. Recommended changes (priority order).**
1. Keep the three transactional pillars as built (office, commercial, janitorial-as-service-section) and do not add service × city pages; the cluster evidence (overlap 4–8 shared URLs between office/commercial/janitorial variants) supports the current consolidation. [P]
2. Add one commercial-investigation asset: "What office cleaning costs in Toronto" (section on `/services/office-cleaning/` plus an indexable explainer), with ranges only after the client approves them (intake A7). This is the only high-intent query family with an obvious content gap. [V: client]
3. Fold the stale 2019–2023 blog into 3–4 decision guides that match observed informational intents (how often, checklist, how to choose, commercial vs janitorial). Check GSC clicks and backlinks before any 301. [P: `findings/content.md`, `findings/clusters.md` §0.5]
4. Treat local pack entry as a Find objective, not just a Local one: the pack is where the head-term demand is served (see Leverage and Local). [O]

**5. Measurement events and cadence.** Baseline the first full 28 days of GSC after verification: impressions and position for the 10 head terms (K1–K5, K12, K21, K24–K26), by page. Review monthly. Record pack presence for "office cleaning toronto" / "commercial cleaning toronto" from a Toronto IP (geo-grid or manual) weekly for 8 weeks after GBP changes. [A: cadence]

**6. Claims needing verification before publication.** "Since 1989" (two directories say 1990; no third-party corroboration found) [V: client — incorporation document or first invoice year]; which cities produce profitable work (intake C5) [V: client]; any price figure [V: client]; "Toronto's …" superlatives — none to be used.

### Evidence still required (Find)
- **Google accounts:** GSC query/page report (28 and 90 days); Ads search-terms report and the geographic report; Ads conversion-by-keyword.
- **Client:** intake C5 (profitable cities), B6 (industries wanted), A9 (residential yes/no), A7 (pricing offer scope).

---

## 2. LEVERAGE: distributed evidence and off-site authority

### Prompt applied
- `leverage/backlink-competition-prompt.md` — Backlink competition prompt

Cross-reference: for raw backlink data see `/seo backlinks <url>` (earlier pass in `raw/backlinks/`; its third-party index queries were degraded, see below).

### Evidence gathered
| Evidence | Source | Label |
|---|---|---|
| Google Business Profile: **"Evergreen Office Cleaning", 5.0 (10 reviews), category "Janitorial service", 243 Queen St W, "Floor 1 · Green Offices Toronto Inc.", 2 photos**, website and phone correct. Newest review "a month ago"; the others shown are 1 and 5 years old. Owner replied to a 5-year-old review. | `raw/local/gbp_overview.txt`, `gbp_reviews.txt` | [P] |
| Local-pack competitors carry 13–432 reviews (see Find). | `raw/local/maps_*.txt` | [P] |
| JAN-PRO Canada off-site footprint: Trustpilot 3.8/5 from 531 reviews (only 2 in the last 12 months); ThreeBestRated #2 in Toronto; franchising.com coverage since 2010; Toronto – West page with a local number (905) 569-1131, "15+ years", a named Regional Director; `/en/llms.txt` present. | https://ca.trustpilot.com/review/jan-pro.ca (WebFetch); threebestrated.ca; `raw/flow/janpro_ca_toronto_west_prior.html`; `findings/geo.md` §3–5 | [O/P] |
| Evergreen directory footprint: Chamber of Commerce, Canadian Business Directory, Fyple (×2, "since 1990"), MapQuest (**130 Broadlands Blvd**, wrong/old), WhatsYourHours (**(416) 281-…**, wrong/old), Facebook (slug = old name), LinkedIn/X slugs = old name. A different business, "Evergreen Cleaning Services", evergreencleaningservices.org, (647) 831-2284, is listed in Bing Places. | `findings/geo.md` §5 | [P] |
| Backlink discovery: the host-graph lookup matched no `evergreencleaningservice.ca` edges (`edges_hits.txt` empty); the Bing operator queries returned unrelated results (degraded); the Wayback "closest to 2000" snapshot for Evergreen is 2019-08-17 (jan-pro.ca: 2008, jan-pro.com: 2001), CDX detail blocked by egress policy. **No referring-domain count exists for Evergreen today.** | `raw/backlinks/edges_hits.txt`, `bing_q*.txt`, `wayback_*.json` | [P] |
| Old-URL redirects preserved (e.g. `/commercial-cleaning-toronto-gta/` → `/services/commercial-cleaning/`, `/testimonials/` → `/reviews/`), so any legacy links still resolve. `/wp-content/uploads/2018/05/logo.png` 404s. | `raw/backlinks/old_url_redirect_check.txt` | [P] |
| On-site entity signals: schema `name`, og:site_name, footer and RSS say "Evergreen Office Cleaning"; the domain, social slugs and the testimonials say "Evergreen Cleaning Service(s)". No `alternateName`, no `foundingDate`, no "formerly" statement anywhere. | `findings/geo.md` §5; `raw/flow/home.html` | [O/P] |
| Supplier relationship stated on site: Armstrong Manufacturing ProSeries Green (ECOLOGO). | `/services/office-cleaning/` FAQ | [O] |
| Blog post `/ask-the-office-cleaners-cleaning-break-rooms/` links out to a Toronto competitor with anchor "Toronto office cleaners". | `findings/content.md` | [P] |

### Output

**1. Intent served by Leverage.** Two readers: Google's local algorithm (prominence = reviews, citations, consistency) and AI agents that corroborate a business before naming it (seoClarity: 25% of top-cited ChatGPT URLs have no Google organic visibility, i.e. citation can come from off-site corroboration rather than rankings — bibliography.md). [bibliography]

**2. Evidence available now.** A 5.0 rating on 10 reviews, 2 GBP photos, one review in the last year, a split brand name, at least two wrong-NAP directory entries, a near-identical competitor name, and no measurable backlink profile. JAN-PRO Canada has 531 third-party reviews and a named person on its Toronto page. [O/P]

**3. Gaps that block trust.**
- **Review velocity**: 10 reviews vs 13–432 in the pack. The single biggest prominence gap. [P]
- **Entity split**: "Evergreen Office Cleaning" vs "Evergreen Cleaning Service" with a third party ("Evergreen Cleaning Services", .org) in the same city. Google and AI agents cannot be sure which entity a review or citation belongs to. [P]
- **NAP drift**: Broadlands Blvd address and a (416) 281 number still circulating. [P]
- **Zero named people**: no owner, no account executive, no author anywhere on the site, while the competitor names its Regional Director. [O/P]
- **Zero earned mentions found**: no press, association membership, supplier listing or client logo located. [P]
- **Outbound link to a competitor** from Evergreen's own blog. [P]

**4. Recommended changes (priority order).**
1. **Decide the legal/brand name once** (client), then: add `alternateName: "Evergreen Cleaning Service"` and `foundingDate` to the `CleaningService` node; write one sentence on `/about-us/` ("Evergreen Office Cleaning, operating as Evergreen Cleaning Service since 1989…"); align the GBP name, Facebook/LinkedIn/X display names. [V: client on name; O: schema]
2. **Correct the four stale citations** (MapQuest, WhatsYourHours, Fyple ×2) and claim/align Chamber of Commerce, Canadian Business Directory, Bing Places, Apple Business Connect, Yelp CA, BBB. Claim the HomeStars and ThreeBestRated/Bark listings only if the client will actively manage them (they rank for the head terms). [O]
3. **Review programme**: ask every active client's site contact after each inspection (the account-executive inspection step already exists in `/our-process/`); target the Google review link already on the homepage. Reply to every review. Goal: pass 25 reviews in 90 days, with recency. [A: target]
4. **Earned corroboration with no budget**: Armstrong ProSeries Green distributor/customer listing [V: ask supplier]; BOMA Toronto or ISSA Canada membership page [V: client decides]; one named client case study per quarter via the existing publish gate (intake B4). [O: gate exists]
5. Remove or re-point the competitor outbound link in the break-rooms post. [P]

**5. Measurement.** GBP Performance (calls, website clicks, direction requests, search queries) monthly, once the agency has GBP manager access; review count and recency weekly; a brand-SERP check ("evergreen office cleaning", "evergreen cleaning service toronto") monthly for entity confusion; referring domains quarterly from any backlink index once available. [A]

**6. Claims needing verification.** Founding year (1989 vs 1990); whether "Green Offices Toronto Inc." on the GBP is the legal entity or a co-tenant [V: client]; whether evergreencleaningservices.org is unrelated [V: client]; membership or certification claims — none to be written until shown.

### Evidence still required (Leverage)
- **Client:** legal entity name and trading name (A11/A12 context), founding document, permission to display GBP rating (B3), owner/AE names and photo (new), supplier and association memberships (new).
- **Google accounts:** GBP manager access (not on the intake list; add as D6) for Performance data, categories, services and photos.
- **Third-party tools (none available):** referring-domain count for Evergreen and for jan-pro.ca Toronto pages.

---

## 3. OPTIMIZE: owned assets for extraction and trust

### Prompt selection (3 of 21, per the skill's context-matching rule)
Context: local B2B service vertical; prior passes flagged technical items (307s, lastmod, performance), content items (thin location pages, stale blog, missing proof) and schema items (no `alternateName`/`foundingDate`, breadcrumbs missing on location pages). Selected:
- `optimize/technical-audit-prompt.md` — Technical Audit Prompt (performance regressions after the rebuild, redirects, sitemap, indexability)
- `optimize/prompt-core-30-content-audit.md` — Core 30 Content Audit (the ~30 pages that carry commercial intent: home, 9 services, 2 industries + hub, 7 locations + hub, process, about, reviews, quote, contact)
- `optimize/schema-prompt-1.md` — Schema Prompt 1 (entity reconciliation in JSON-LD)

Deferred until data exists: `ctr-audit-prompt.md` (needs GSC CTR by page), `visiblity-prompt.md` / `visibility-follow-up-prompt.md` (live AI-answer tests were blocked by automation limits in `findings/geo.md` §6), `paa-question-rewording-prompt.md` (use after GSC shows which FAQs earn impressions). All 21 remain listed via `/seo flow prompts`.

Cross-reference: full content and GEO analysis in `/seo content <url>` and `/seo geo <url>` (`findings/content.md`, `findings/geo.md`).

### Evidence gathered
| Evidence | Source | Label |
|---|---|---|
| **Technical.** robots.txt `Allow: /` + sitemap index; `/sitemap-0.xml` 73 URLs, all 200, all self-canonical, 0 noindex; no `<lastmod>` on any static URL; slashless URLs return **307** (temporary) to the slashed form; `/search/` indexable; `/sitemap.xml` 301s to the index. | `raw/flow/home_robots.txt.html`, `home_sitemap.xml.html`; `findings/sitemap.md` | [O/P] |
| Two blog hubs: `/category/blog/` is `noindex, follow`; `/insights/` is indexable and titled "News". Homepage links to `/category/blog/` three times and `/insights/` twice. | `raw/flow/home_category_blog.html`, `home_insights.html`, nav-link count | [O] |
| Performance: PSI 15 Oct (pre-rebuild) mobile 46 / desktop 71, mobile LCP 13.2 s; JAN-PRO US 96/100; JAN-PRO Canada 38/67. After the rebuild, local Lighthouse medians: `/` mobile 62→75, `/services/office-cleaning/` 61→87 (LCP 6.83→2.11 s), CLS 0 everywhere. **PSI could not be re-run** (quota); the `raw/technical/psi_*.json` files are empty. | `docs/growth/performance.md`; `raw/technical/psi_.json` | [O] |
| reCAPTCHA now loads on form intent; CSS inlined; `/_astro/*` cached 1 year; GTM still loads at page load because the call-tracking number swap needs it. | `docs/growth/adaptation-matrix.md` rows 11–12 | [O] |
| **Content (core pages).** Homepage: H1 "Office & Commercial Cleaning in Toronto and the GTA", 10 services, 7 industries, 4 Google reviews (all 5–6 years old), trust strip, 5-step process, areas, legacy testimonials, 3 blog posts; ~1,260 words. No homepage FAQ, no definitional entity sentence. | `raw/flow/home.html`; `findings/geo.md` §4 | [O/P] |
| `/services/office-cleaning/`: ~1,340 words; who-for, every-visit/periodic lists, scheduling, scope and limits, process, six price factors, 2 reviews (5 years old), 7 FAQs with FAQPage schema, related, areas, side quote form. Citability 74/100 in the GEO pass. Still contains two generic metaphor paragraphs ("friendly handshake"). | `raw/flow/home_services_office-cleaning.html` | [O] |
| `/reviews/` is titled "Testimonials", its meta description promises "real Google reviews", but the page body is only a submission form plus blog sidebar. | `raw/flow/home_reviews.html` | [O] |
| `/about-us/`: ~200 words of legacy copy, no people, no timeline, no "formerly". | `raw/flow/home_about-us.html` | [O] |
| Location pages: 5 of 7 have 21–42 unique words after city-normalisation (Jaccard 0.76–0.88 between pages). | `findings/content.md` | [P] |
| Blog: 38 posts, 2019-12 to 2023-03, no visible date or byline, Organization as author, no list markup, `/services/disinfection-cleaning/` has COVID-era copy and the typo "psychically". | `findings/content.md` | [P] |
| **Schema.** Site-wide `@graph`: `CleaningService` (#organization) with PostalAddress, GeoCoordinates (43.6503,-79.3892; intake C1 says the pin is nearer 43.6496,-79.3925), 2 OpeningHoursSpecification, 10 City areaServed, OfferCatalog with 4 Service/Offer, `WebSite` + SearchAction. Service pages add `BreadcrumbList`, `Service`, `FAQPage`. Location pages lack `BreadcrumbList`. No `alternateName`, `foundingDate`, `aggregateRating` (correctly absent), `AboutPage`/`ContactPage`. All JSON-LD parses. jan-pro.ca's JSON-LD has a parse error; jan-pro.com has `Organization`, `VideoObject`, `WebPage`. | `raw/flow/*.html` type counts; `findings/schema.md` | [O/P] |
| AI readability: all copy server-rendered; all 13 tested bots get identical 200s; no `/llms.txt` (jan-pro.ca has one); no `Content-Signal`. | `findings/geo.md` §2–3 | [P] |

### Output

**1. Intent (three readers).** Buyer: "can I trust them and what will it cost?" Search engine: "is this the canonical office-cleaning page for Toronto?" AI agent: "what is this entity, since when, where, and what exactly does it do?" [A]

**2. Evidence available now.** Technical hygiene is good and improved; content structure is good on the 4 rebuilt service pages and 2 industry pages; proof, people and entity facts are thin; location pages and blog are legacy. [O/P]

**3. Gaps that block extraction or trust.**
- Entity: no `alternateName`/`foundingDate`; name split (see Leverage). [O]
- Proof: every review shown is 5–6 years old; no case study live (gate blocks until approvals); `/reviews/` has no reviews. [O]
- Price: no figure anywhere indexable (competitor HomeStars/Hellamaid answer it). [O]
- Freshness: newest blog 2023-03, no dates shown; GEO pass flags this. [P]
- Duplication: the 5-step block and trust strip repeat verbatim across home, service, industry, location and paid pages; location pages are near-duplicates. [P]
- Technical residue: 307 vs 301 on slashless URLs; no `<lastmod>`; `/search/` indexable; two blog hubs with the noindex one receiving more homepage links; PSI not re-run on production. [O/P]
- No homepage FAQ; `/about-us/` is the weakest E-E-A-T page on the site. [O]

**4. Recommended changes (priority order).**
1. **Entity block in schema and prose** (needs client name decision): `alternateName`, `foundingDate`, `founder`/`employee` (owner and account executive, Person nodes), `knowsAbout`, `sameAs` with corrected slugs; one definitional first paragraph on `/` and `/about-us/`. [V: client]
2. **Proof refresh**: publish the warehouse floor case study once B4 approvals land; make `/reviews/` actually list the Google reviews it promises (text in HTML, no `aggregateRating` unless marked up from on-page reviews); add a "last inspected / updated" date to service pages only when the content genuinely changes. [V: client B3/B4]
3. **Cost section** on `/services/office-cleaning/` and `/services/commercial-cleaning/` ("What office cleaning costs in Toronto") mirroring the six factors already there, plus a range the client approves, plus one FAQ "How much does office cleaning cost in Toronto?" — this is also the highest-value AI-extraction target. [V: client A7]
4. **Location pages**: either give the 5 thin pages 200+ unique words of real local evidence (client list of buildings served per city, intake C5) or consolidate them into `/locations/` with anchors. Add `BreadcrumbList`. [V: client]
5. **Technical residue**: 307→301/308 for slashless URLs; `<lastmod>` from git/content dates for all 73 URLs; `noindex` on `/search/`; make `/insights/` the one blog hub (retitle from "News" to "Insights" or "Guides") and point homepage links there; re-run PSI on production and record field CrUX once GSC is verified. [O]
6. **Blog consolidation** per Find §4.3; fix "psychically"; remove the competitor outbound link. [P]
7. Optional: publish `/llms.txt` listing the 20 commercial pages (jan-pro.ca already does). Low effort, unproven benefit; label it as such. [A]

**5. Measurement.** GSC: indexed pages (expect 73 ± new), Page indexing report for the noindex hub, Core Web Vitals field report by page group; PSI monthly on `/` and `/services/office-cleaning/`; Rich Results Test on the entity schema after change; GSC "FAQ rich result" impressions. [A]

**6. Claims needing verification.** "Background-screened, bonded, liability-insured, WSIB" (A1); "dedicated account executive" (A2); "same crew" (A3); Armstrong ProSeries Green still standard (A5); all legacy testimonials (A11). These are live on the site now and should be confirmed in writing before the proof refresh adds weight to them.

### Evidence still required (Optimize)
- **Google accounts:** GSC (indexing, CWV, FAQ rich results, CTR per page for the deferred CTR audit); PSI API key or manual PSI runs.
- **Client:** A1–A5, A11 confirmations; B1 (QA routine), B2 (guarantee), B4 (case study approvals), B5 (real photos); C1 (coordinates); the name decision.

---

## 4. WIN: pages and measurement that connect discovery to revenue

### Prompts applied
- `win/conversion-audit-prompt.md` — Conversion Audit Prompt
- `win/bofu-page-brief-generator.md` — BOFU Page Brief Generator (applied to `/services/office-cleaning/` as the highest-priority BOFU page)
- `win/dual-surface-content-scorecard.md` — Dual-Surface Content Scorecard (applied to `/services/office-cleaning/`)

Cross-reference: for SXO persona scoring see `/seo sxo <url>` (`raw/sxo/`).

### Evidence gathered
| Evidence | Source | Label |
|---|---|---|
| Live GTM `GTM-5W69BTJQ`: Google tag `AW-18472921801`, conversion linker, Ads conversion on `lead_form_submission`, Ads website-call tracking (number swap on (416) 803-4880). **No GA4, no Microsoft UET, no triggers** for `phone_click`, `form_start`, `lead_form_error`, `email_click`, `quote_cta_click`, no staging block. Enhanced conversions off. Nobody has verified the Ads conversion actions' Primary/counting settings. | `docs/growth/tracking-spec.md` (container decoded 15 Oct) | [O] |
| Site pushes `form_start`, `lead_form_error` (validation/captcha/server/network), `phone_click` (with `tracking_provider`), `email_click`, `quote_cta_click` (9 `link_location` values), `site_environment`; `form_id` per page (`service-office-cleaning`, `industry-…`, `location-…`, `lp-…`). No PII in dataLayer. Session-scoped gclid/UTM attribution stored with the lead in Neon. Lead-outcome migration `0009` (qualified/quote_issued/won + offline-conversion view) written, **not applied**. | tracking-spec §1–2 | [O] |
| Conversion path on `/services/office-cleaning/`: header phone + "Get a quote", hero "Get a free quote" / "Call (416) 803-4880", trust strip, side quote form (4 required fields + optional city), bottom CTA "Book a free office walkthrough", FAQ "How is the price worked out? After a free on-site walkthrough…". 25 lead forms site-wide, honeypot + reCAPTCHA + server verification. | `raw/flow/home_services_office-cleaning.html`; `docs/growth/README.md` | [O] |
| Paid pages `/lp/office-cleaning/` etc. are `noindex, nofollow`, self-canonical, carry "from $30/hr", "first month free", "within 2 hours" reply promise (A6/A7 unconfirmed). | `raw/flow/home_lp_office-cleaning.html`; `client-intake.md` A6–A7 | [O] |
| `/privacy/` still describes the old WordPress site (A9 in tracking-spec §3). | tracking-spec §3 A9 | [O] |
| Competitor conversion pattern: JAN-PRO Canada's office page leads with "Most businesses want a sense of the number before they want a sales call", lists six price drivers, then "What happens after you request an estimate" (5 steps) and 6 FAQs; its Toronto – West page shows a local (905) number and a stats band ("15+ years…"). | `raw/flow/janpro_ca_office.html`; `janpro_ca_toronto_west_prior.html` | [O] |
| Hours on GBP "Opens 7 AM"; site footer hours Mon–Fri 7am–10pm / weekends 8am–8pm; intake C4 asks whether these are phone or cleaning hours. | `raw/local/gbp_overview.txt`; `client-intake.md` C4 | [O] |

### Output

#### 4a. Conversion Audit (`win/conversion-audit-prompt.md`)

**Executive summary.** The site now has a complete, test-covered conversion instrumentation layer that **nothing listens to**. The only measured outcomes are an Ads form conversion whose settings are unverified and connected calls from ad visitors. Organic leads, phone taps, form starts and failures are invisible. Reporting cannot connect to qualified leads or sales because migration 0009 is unapplied and no offline conversions exist. Per the prompt's own rule: do not recommend more spend until measurement is fixed.

**Top blockers.**
1. No GA4 and no GTM triggers for the funnel events (tracking-spec A4–A5). [O]
2. Ads conversion action settings (Primary, count One, window) unverified (A1–A2). [O]
3. Staging page views reach the live Ads tag (A6). [O]
4. Lead outcomes not recorded (migration 0009; A3). [O]
5. Microsoft UET missing: any Microsoft Ads spend records nothing (A8). [O]

**Lead-quality risks.** Residential enquiries (A9 undecided → no negative theme); "from $30/hr" and "first month free" on paid pages may attract price-only leads if the offer scope (A7) is narrower than the page implies; the "within 2 hours" promise on paid pages conflicts with "as soon as possible" on the post-construction paid page (A6). [O/V]

**Expectation mismatches.** Paid pages promise price and speed; organic pages say "we look before we quote". Both are defensible, but the paid-landing visitor who later converts on an organic page meets a different promise. Decide one position on price (see Find §4.2). [A]

**Language mismatches.** Customer language in the reviews is "reliable", "in a pinch", "tight schedule", "direct contact with the owner", "fitting us in". The pages lead with "recurring janitorial cleaning… consistent crew". Add the responsiveness language (short-notice, direct line) to hero and FAQ copy, because it is what clients actually praise. [O]

**CTA friction.** Low: 4 required fields, phone always visible. One gap: no "what happens next / how fast we reply" statement next to the organic forms (JAN-PRO has a 5-step "what happens after you request an estimate"). Add a one-line reply-time commitment once A6 is confirmed. [O/V]

**Tracking fixes (ordered).** (1) Create GA4 and add it to GTM; (2) add Custom Event triggers for the five funnel events → GA4; (3) add the `site_environment = staging` blocking trigger; (4) confirm Ads conversion settings and call minimum duration; (5) apply migration 0009 with a Neon snapshot, then create the three Secondary offline conversion actions and start weekly uploads; (6) re-add UET or retire Microsoft Ads; (7) rewrite `/privacy/` before adding anything else. All of this is in the agency's hands once D1–D5 access arrives. [O]

**First-party data to collect next.** Lead disposition for every lead (status + reason), call outcomes (connected ≥60 s vs not), the facility type/size fields already allow-listed, and the first five objections heard on walkthroughs. [A]

**Ranked test backlog (after measurement is live, not before).** (1) Reply-time line beside forms; (2) cost section on service pages; (3) real crew photos vs current imagery on `/services/office-cleaning/`; (4) side form vs bottom form prominence on mobile; (5) "Call" vs "Get a quote" order in the sticky header, judged on `phone_click` + `form_start` → `lead_form_submission`. [A]

#### 4b. BOFU Page Brief (`win/bofu-page-brief-generator.md`) for `/services/office-cleaning/`

- **Page goal:** a booked walkthrough from a Toronto/GTA office or facility manager.
- **Search/conversion intent:** "office cleaning toronto", "office cleaning services/company toronto", "office cleaning cost toronto" (CI). Local-transactional.
- **Primary audience:** office/facility manager at a 10–200-person firm; secondary: multi-tenant building manager.
- **Buyer questions (from SERP, reviews, competitor FAQs):** how much; how often; after hours; same people every time; screened/insured; what if something is missed; who supplies consumables; how fast can you start; do you serve my area.
- **Objections / hesitation:** price unknown until a walkthrough; switching cost from the incumbent; trust in an unknown firm with 10 reviews; "are the photos real?"; no named person.
- **Customer-language phrases to use naturally:** "reliable", "fit us in", "in a pinch", "tight schedule", "direct contact", "the same team for three years". [O: reviews]
- **Proof needed:** named account executive with photo; 2–3 recent reviews (≤12 months); one case study; QA routine with inspection frequency (B1); guarantee (B2); insurance/WSIB confirmation (A1); real site photos (B5).
- **Recommended H1:** keep "Office Cleaning in Toronto and the GTA" (already matches the head term). Sub-head option after A6 confirms: "Free walkthrough, written scope, a reply within [N] business hours."
- **Section outline:** Hero + trust strip → Who it is for → What is included (every visit / periodic) → **What it costs in Toronto (new)** → Scheduling → Scope and limits → How it works → **Quality and what happens if something is missed (new, needs B1/B2)** → Recent reviews + case study → FAQ (add cost, start time, guarantee, consumables) → Areas → Quote form with reply-time line.
- **CTA strategy:** primary "Book a free walkthrough" (form); secondary call; keep both in sticky header; add reply-time commitment.
- **FAQ topics to add:** cost range; how soon can you start; what if we are unhappy with a visit; do you bring supplies; minimum contract / notice (A7 says 30 days on paid pages).
- **Tracking notes:** `form_id=service-office-cleaning` → GA4 funnel `form_start` → `lead_form_submission`; `phone_click` with `link_location`; call ≥60 s as Ads call conversion; lead disposition via migration 0009 → offline conversions "Qualified lead / Quote issued / Customer won".
- **Missing inputs flagged:** A1–A7, B1–B5, C4; any price figure; recent reviews.

#### 4c. Dual-Surface Scorecard (`win/dual-surface-content-scorecard.md`) for `/services/office-cleaning/`

| Dimension | Score (0–10) | Basis |
|---|---|---|
| Original usefulness and specificity | 6 | Concrete task lists, scheduling, scope limits and price factors; two generic metaphor paragraphs; no numbers beyond 1989. [O] |
| Alignment with audience and decision stage | 7 | Who-for list, after-hours, consistent crew match the BOFU buyer; price and start-time unanswered. [O] |
| Evidence, examples, firsthand insight | 3 | Two 5-year-old reviews, no case study, no named person, imagery of uncertain provenance. [O/P] |
| Clear answers to buyer questions | 7 | 7 FAQs in FAQPage schema; cost FAQ answers "after a walkthrough" only. [O] |
| Conversion support | 7 | Sticky phone + quote, side form, bottom CTA, trust strip; no reply-time or guarantee. [O] |
| Refresh / update need | 5 | Rebuilt 15 Oct 2026, but proof elements are 2020-era; no visible update date. [O] |
| Measurement readiness | 2 | Events pushed but not captured; no GA4/GSC; Ads settings unverified. [O] |

- **Traditional search score: 6.5/10.** Structure and targeting are right; prominence (reviews, links, local pack) and proof are what hold it back, and those are Leverage-stage problems the page cannot fix alone.
- **AI-assisted discovery score: 6/10** (GEO pass gave this page 74/100 for passage citability; the entity and corroboration gaps pull it down). Quotable scope statements exist; missing: cost range, named people, update date, entity definition.
- **Conversion-readiness score: 5/10.** Path is clean; proof and reply-time are missing; nothing is measured.
- **Evidence strengths:** scope-and-limits language, ECOLOGO product fact with named supplier, honest "one office" positioning.
- **Gaps:** price, recency, people, measurement.
- **Risks:** publishing price or guarantee claims before A7/B2 confirmation; stale testimonials being read as the latest work.
- **Highest-impact next three actions for this page:** (1) wire measurement so the page can be judged (GA4 + triggers); (2) add the cost section and a reply-time line after client confirmation; (3) replace the 5-year-old proof with one recent review set and one case study.

### Evidence still required (Win)
- **Google accounts:** Ads (conversion settings, call-duration setting, search terms, geo report); GTM publish rights; GA4 creation or the decision not to; GSC.
- **Client:** A6–A9 (offer and reply promises), B1–B2 (QA routine, guarantee), C4 (hours meaning), approval to apply migration 0009 with a snapshot (D5), lead dispositions for existing leads (to backfill the offline-conversion view), five most common objections heard on walkthroughs.

---

## 5. LOCAL (supplementary FLOW stage, 11 prompts: applied as a gap list, not rewritten copy)

Prompts read: `local/gbp-categories-prompt.md`, `gbp-services-prompt.md`, `gbp-description-claude-prompt-1/2/3.md`, `prompt-generating-a-title-tag.md`, `prompt-generating-a-meta-description.md`, `prompt-rewriting-existing-homepage.md`, `prompt-rewriting-existing-service-page.md`, `ai-homepage-rewrite-prompt.md`, `claude-deep-research-prompt.md`. Cross-reference `/seo local <url>` and `/seo maps` (`raw/local/`).

No rewrite is produced here because the FLOW workflow says to rewrite only after the facts are organised (intake A/B/C). What the evidence supports now:

| Item | Observed | Gap / action | Who supplies |
|---|---|---|---|
| GBP primary category | "Janitorial service" [P] | Primary should match the money term: **Commercial cleaning service**, with Janitorial service and Office cleaning service (if available in the category list) as secondaries. Verify the live category list in the GBP editor. | Agency with GBP access; client approves |
| GBP services | Not visible in the captured view [P] | Add the 10 services as listed on the homepage, each with a 1–2 sentence description taken from the service pages (no prices unless A7 approved). | Agency |
| GBP description | Not captured [P] | 750-char description built from the entity sentence: who, since when, where crews come from, after-hours, account executive, WSIB/bonded (after A1). | Agency; client confirms A1–A3 |
| Photos | 2 [P] | Real crew, equipment, office exterior (243 Queen St W), before/after from approved projects (B5). Competitors in the pack show dozens. | Client |
| Reviews | 10, one in the last year [P] | Programme in Leverage §4.3. | Client's AEs |
| Hours | "Opens 7 AM" vs footer hours; meaning unclear (C4) [O] | Set GBP hours to **phone/office hours**; state cleaning hours on the site. | Client |
| NAP | Site and GBP agree; 4 directories do not [P] | Leverage §4.2. | Agency |
| Title tags | `/`: "Office & Commercial Cleaning in Toronto & GTA \| Evergreen" (55 chars); office page "Office Cleaning Services in Toronto & the GTA \| Evergreen" [O] | Keep. Fix legacy: `/about-us/` "About Us - Evergreen Office Cleaning" → "About Evergreen Office Cleaning: Toronto commercial cleaners since 1989"; `/reviews/` "Testimonials" → match the content once reviews are shown; `/contact-us/` meta description is generic ("We'd love to hear from you…") → name the city, phone and reply time. | Agency |
| Homepage rewrite | Already rewritten 15 Oct around what/where/who/why/how [O] | Only two additions: a definitional first paragraph (entity sentence) and a short FAQ (cost, areas, after hours, screening). | Agency after client facts |
| Service-page rewrite | Office/commercial pages rebuilt [O] | Additions only (cost section, QA/guarantee, recent proof). The 5 legacy service pages (industrial, disinfection, emergency, pressure washing, graffiti) still carry old body copy; prioritise industrial and disinfection. | Agency; client confirms scope |

---

## 6. FLOW loop summary: the five highest-leverage moves

Ordered by how much each unblocks the others. Each names the evidence that would prove it worked (the balanced scorecard from flow-framework.md: a visibility indicator and a business indicator for every move).

| # | Move | Stage | What is done | Evidence that proves it worked |
|---|---|---|---|---|
| 1 | **Make the funnel measurable before anything else is judged** | Win | GSC verified (domain property); GA4 created and added to GTM; Custom Event triggers for `form_start`, `lead_form_error`, `phone_click`, `email_click`, `quote_cta_click`; staging blocking trigger; Ads conversion settings confirmed; migration 0009 applied (snapshot first) and the three offline conversion actions created; `/privacy/` updated. | Within 14 days: GSC shows impressions/clicks by page; GA4 shows a `form_start` → `lead_form_submission` funnel with a rate per `form_id`; Ads shows "Recording conversions" with correct Primary/Secondary status; first weekly offline upload accepted. The baseline report this produces is the proof. |
| 2 | **Reconcile the entity and win the local pack** | Leverage + Local | Name decision; `alternateName` + `foundingDate` + Person nodes in schema; "formerly" sentence on `/about-us/`; GBP primary category → commercial cleaning service, services list, description, 20+ real photos; fix MapQuest/WhatsYourHours/Fyple; align Facebook/LinkedIn/X names; review request step added to every inspection. | Review count 10 → 25+ with ≥1 per month; GBP Performance shows calls + website clicks + direction requests trending up month over month; Evergreen appears in the Toronto-IP pack for "office cleaning toronto" or "commercial cleaning toronto" (weekly checks, 0 → present); brand SERP shows one entity with consistent NAP; `phone_click` with `tracking_provider=google_forwarding_number` vs organic taps separable in GA4. |
| 3 | **Replace 2020-era proof with current, named, verifiable proof** | Optimize | Client confirms A1–A5 and A11; publishes the warehouse case study through the existing gate (B4); `/reviews/` lists real Google reviews in HTML; owner and account executive named with photos; QA routine and guarantee written as specific commitments (B1–B2); real photos replace generated imagery on the office and commercial pages (B5). | GSC CTR on `/services/office-cleaning/` and `/services/commercial-cleaning/` rises at stable position (compare 28-day windows); GA4 `form_start` rate on those pages rises; qualified-lead share (migration 0009 `lead_status=qualified` / all leads) rises; manual AI-answer tests ("best office cleaning company Toronto", "Evergreen Office Cleaning reviews") start to cite Evergreen pages or the GBP. |
| 4 | **Answer the price question on indexable pages** | Find + Win | After A7 approval: "What office cleaning costs in Toronto" section on both main service pages with factors + an approved range or per-visit example; cost FAQ in FAQPage schema; one indexable explainer; reply-time line beside every form (after A6). | GSC impressions and clicks for cost-intent queries (K21/K22 family) from 0 → measurable; FAQ rich-result impressions in GSC; `lead_form_error` and abandoned `form_start` fall; `facility_size` filled on a larger share of leads; fewer "unqualified: price" dispositions in 0009. |
| 5 | **Consolidate the legacy content and close the technical residue** | Optimize | Fold 38 stale posts into 3–4 dated, bylined guides (check GSC clicks/links first); one blog hub (`/insights/`); remove the competitor outbound link; deepen or merge the 5 thin location pages with client-supplied local evidence (C5); 307 → 301; `<lastmod>`; `noindex /search/`; PSI re-run on production and CrUX monitored. | GSC Page indexing: no "Crawled – currently not indexed" growth on location/blog URLs; sitemap "discovered" count ≈ indexed count; CWV field report "Good" for mobile on the service-page group; location pages earn their first impressions for "[city] commercial cleaning"; crawl stats show no 307 chains. |

**How the loop closes.** Move 1 produces the baseline. Moves 2–4 are judged against it at 30/60/90 days using the events listed. Move 5 keeps the crawl and index clean so that the measured changes are attributable to content and prominence, not to indexing noise. If, at 90 days, impressions rise but qualified leads do not, return to Win (offer and reply promises); if impressions do not rise, return to Leverage (pack prominence) before touching copy again.

---

## 7. Consolidated evidence request

**From the client (10XiD to relay).** Intake A1–A12 (facts now live on the site), B1–B6 (QA routine, guarantee, GBP permission, case-study approvals, real photos, industry priorities), C1–C5 (coordinates, mailbox, coverage, hours meaning, profitable cities); plus three new items: the legal entity vs trading name and founding document; owner and account-executive names/photos; supplier and association memberships that may be cited.

**From Google accounts.** D1 Google Ads read-only (conversion settings, search terms, geo, call data); D2 GTM publish; D3 Search Console; D4 GA4 (or the decision to create it); D5 approval for migration 0009; **D6 (new) Google Business Profile manager access** for Performance, categories, services, photos and description.

**Not obtainable from here, note for the agency.** Toronto-geo-personalised SERPs and local packs (use a geo-grid tool or a Toronto device); referring-domain counts (no backlink index available); live AI-answer tests at scale; PSI field data until GSC is verified.

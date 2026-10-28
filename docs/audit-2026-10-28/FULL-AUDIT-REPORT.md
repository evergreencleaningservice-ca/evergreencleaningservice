# Full SEO Audit Report: www.evergreencleaningservice.ca

| | |
|---|---|
| **Client** | Evergreen Office Cleaning (formerly Evergreen Cleaning Service), 243 Queen St W, Toronto |
| **Prepared by** | 10XiD |
| **Date** | 2026-10-28 |
| **Business type** | Local service-area business (B2B commercial, office and janitorial cleaning), one office, serving Toronto and the GTA since 1989 |
| **Benchmark competitor** | JAN-PRO (jan-pro.com US brand; jan-pro.ca Toronto East / Toronto West franchises) |
| **Scope** | 73 sitemap URLs (111 crawled incl. noindex archives), 4 paid landing pages, Google Business Profile, directories, 42 SERP pulls, 2 page deep-dives |
| **Companion documents** | `findings/*.md` (16 specialist reports), `SEO-PLAN.md` (12-month plan), `PROGRAMMATIC-PLAN.md` (location pages), `FLOW-ANALYSIS.md` (Find/Leverage/Optimize/Win), `briefs/` (6 content briefs), `competitor-pages/` (comparison-page spec), `drift/` (baseline snapshot), `ACTION-PLAN.md`, `audit-data.json` |

---

## 1. Executive summary

### SEO Health Score: 66 / 100

| Component | Weight | Score | Weighted | Source |
|---|---|---|---|---|
| Technical SEO | 22% | 84 | 18.48 | `findings/technical.md` |
| Content Quality | 23% | 43 | 9.89 | `findings/content.md`, `content.json` |
| On-Page SEO | 20% | 68 (derived) | 13.60 | derived from `technical.md`, `sxo.md`, `clusters.md`, `page-home.md`, `page-office-cleaning.md` (section 4) |
| Schema / Structured Data | 10% | 74 | 7.40 | `findings/schema.md` |
| Performance (CWV) | 10% | 80 | 8.00 | `findings/performance.md` (lab only; no PSI/CrUX) |
| AI Search Readiness | 10% | 60 | 6.00 | `findings/geo.md` |
| Images | 5% | 61 | 3.05 | `findings/images.md` |
| **Total** | **100%** | | **66.42 → 66** | |

Arithmetic: 84×0.22 + 43×0.23 + 68×0.20 + 74×0.10 + 80×0.10 + 60×0.10 + 61×0.05 = 18.48 + 9.89 + 13.60 + 7.40 + 8.00 + 6.00 + 3.05 = 66.42.

Supplementary scores not in the weighted total: Local SEO 46/100 (`local.md`), SXO Gap Score 58/100 (`sxo.md`), Authority estimate about 12/100 at low confidence (`backlinks.md`, no Backlink Health Score issued), Agent-UX heuristic 82/100 with Lighthouse Agentic Browsing 2/2 (`agentic.md`), Visual/UX 72/100 (`visual.md`), Sitemap/architecture 70/100 (`sitemap.md`), Programmatic location set 48/100 (`PROGRAMMATIC-PLAN.md`), page scores 78 (home) and 80 (office cleaning).

**The picture in one paragraph.** The 15 October 2026 Astro rebuild delivered a technically clean, fast, fully server-rendered site: 111 of 111 URLs return 200, every page has one H1, a self-canonical and JSON-LD, and the core service and industry pages beat JAN-PRO on FAQs, scope transparency and readability. What holds the score down is proof and prominence, not plumbing: imagery that reads as AI-generated and is captioned as "cleaning results", a reviews page with no reviews, a 170-word anonymous About page, a blog unposted since March 2023 with no dates or bylines, seven location pages that are 94–97% boilerplate, a Google Business Profile with 10 reviews (JAN-PRO's three GTA profiles hold 786) and 2 photos, a split brand name across directories, and no measurement at all beyond a single Google Ads conversion. Fixing proof, local presence and measurement is the programme; the technical residue is a week of work.

### Top 5 critical issues

| # | Issue | Severity | Evidence |
|---|---|---|---|
| 1 | **Nothing is measurable.** No GA4, no GTM triggers for the five funnel events, no Search Console access, Ads conversion settings unverified, staging page views reach the live Ads tag. No fix below can be judged until this is live. | Critical (programme prerequisite; not a ranking penalty) | `docs/growth/tracking-spec.md` A1–A6; `FLOW-ANALYSIS.md` §4a; `SEO-PLAN.md` §5.4 |
| 2 | **Location pages fail the uniqueness gate.** 0 of 7 pass the 60% unique-text test; Brampton, Markham, Oakville, Etobicoke and Toronto-downtown are 4–6% unique after city normalisation (pairwise 6-gram Jaccard 0.76–0.88). Scaled near-duplicate pattern. | Critical (quality/doorway risk to the whole site) | https://www.evergreencleaningservice.ca/locations/brampton/ (and etobicoke, markham, oakville, toronto-downtown); `sitemap.md` §4, `content.md` §4, `PROGRAMMATIC-PLAN.md` §2.3 |
| 3 | **Google Business Profile is thin and at risk.** Address line reads "Floor 1 - Green Offices Toronto Inc." (shared serviced office; GBP guidelines may treat it as non-staffed, suspension risk); 5.0 from 10 reviews, about 2 in the last year; 2 photos; no posts; absent from the first 6–8 results of all four local-pack samples. | Critical (local visibility; profile-suspension risk) | Google Maps cid 15602716773318351983; `local.md` §1, §3, §5 |
| 4 | **Proof and E-E-A-T have collapsed (Content 43/100).** Every sampled image shows AI-generation tells and the gallery alt text calls them "cleaning results"; `/reviews/` is a submission form with zero reviews; `/about-us/` is 170 words with no people; 38 blog posts, newest 2023-03-31, no visible dates or authors, `dateModified = datePublished`. | High | https://www.evergreencleaningservice.ca/cleaning-demo-gallery/, https://www.evergreencleaningservice.ca/reviews/, https://www.evergreencleaningservice.ca/about-us/, https://www.evergreencleaningservice.ca/insights/; `content.md` §3 |
| 5 | **Split entity and stale citations.** Schema/footer say "Evergreen Office Cleaning"; the domain, Facebook/LinkedIn/X slugs and testimonials say "Evergreen Cleaning Service"; no `alternateName`, no "formerly" statement; MapQuest lists 130 Broadlands Blvd, WhatsYourHours an old (416) 281 phone, Fyple "since 1990"; a different "Evergreen Cleaning Services" (647-831-2284) competes on brand searches. | High | `geo.md` §5, `local.md` §2, `backlinks.md` §4 |

Also High, listed in the body: no security headers on any HTML response (`technical.md` #1); Google tag stack costs 440–590 ms of mobile TBT on every page (`performance.md` §6); "commercial cleaning toronto" intent split across four URLs and no janitorial or dental-only page (`sxo.md` §2); 8 of 21 money pages have no photograph (`images.md` 3.1); a followed outbound link to a Toronto competitor with the anchor "Toronto office cleaners" (`content.md`).

### Top 5 quick wins

| # | Win | Effort | Evidence |
|---|---|---|---|
| 1 | `noindex, follow` on `/search/` and drop it from the sitemap; drop `/insights/page/2-4/` from the sitemap; add real `<lastmod>` via the `@astrojs/sitemap` `serialize` hook | S (about 1 h) | https://www.evergreencleaningservice.ca/search/, https://www.evergreencleaningservice.ca/sitemap-0.xml; `technical.md` #2–3, `sitemap.md` §2.1 |
| 2 | Ship the security-header block in `public/_headers` (HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options; CSP report-only first) | S (30 min + CSP tuning) | `curl -D - https://www.evergreencleaningservice.ca/`; `technical.md` #1 |
| 3 | Remove the competitor link in the break-rooms post; fix "psychically" and the COVID framing on `/services/disinfection-cleaning/`; drop "\| Evergreen Office Cleaning" from the 7 location H1s; retitle `/services/` so it stops competing with `/services/commercial-cleaning/` | S (2 h) | https://www.evergreencleaningservice.ca/ask-the-office-cleaners-cleaning-break-rooms/, https://www.evergreencleaningservice.ca/services/disinfection-cleaning/, https://www.evergreencleaningservice.ca/locations/toronto-downtown/; `content.md`, `sxo.md` §7 |
| 4 | Schema entity pass: `alternateName`, `foundingDate: 1989`, geo set to the GBP pin (43.65019, -79.38856), `hasMap`, `ImageObject` logo, `contactPoint`; BreadcrumbList on the 7 templates that lack it | S–M (2–4 h) | `schema.md` §4–5a; `local.md` §4 |
| 5 | Image and media hygiene: alt text on the 19 empty-alt images (hero, 3 home cards, 13 thumbnails), `og:image:width/height/alt` in the layout, stop the 2.5 MB `/video/lead-net.mp4` auto-download and give `/video/*` a 30-day cache header | S–M (3 h) | `images.md` §4, §7; `performance.md` §7 fix 2 |

---

## 2. Methods and limits (read before acting on numbers)

- **Fetching.** The claude-seo plugin's Python fetchers (`fetch_page.py`, `parse_html.py`, `pagespeed_check.py`, `agentic_check.py`, `render_page.py`, `metadata_template.py`, `iptc_ai_label.py` and others) were unusable: they refuse the pre-configured egress proxy. All page data was gathered with `curl` (TLS verification on), Node Playwright 1.63 / Chromium (Pixel 7, iPhone 14, Moto G profiles), a local Lighthouse 13.5.0 (agentic and, for the two page deep-dives, Browserless-hosted Lighthouse), WebSearch and WebFetch. Equivalent parsers were written by hand (`scripts/`, `tools/`). Raw captures are under `raw/`.
- **Core Web Vitals.** PageSpeed Insights API returned HTTP 429 (daily quota, no key) and the CrUX API HTTP 403 (anonymous). There is **no PSI score and no field data (LCP/INP/CLS p75) in this audit**. The Performance score of 80 is a judgement on throttled Playwright lab runs (3 cold runs, medians) plus the two Browserless Lighthouse runs for `/` (mobile 63) and `/services/office-cleaning/` (mobile 84). Absolute values are not comparable to PSI; relative comparisons are.
- **SERPs.** All SERP tables come from a US-origin WebSearch index, not google.ca, and are **not Toronto-personalised**. No local pack, ads, AI Overview or People Also Ask was observable. Direct Google (429), Bing (bot wall), DuckDuckGo (202), Perplexity (403), Brave (429) and others were blocked; no workaround was attempted. Treat SERP positions as competitor discovery, not rank data. Evergreen appeared in 0 of 42 top-10 sets; a third-party directory places it near position 27 for "commercial cleaning service toronto" (unverified).
- **No credentials.** No Moz, DataForSEO, Bing Webmaster, Open PageRank, Google Search Console, GA4, Google Ads or GBP API access. DA/DR, referring domains, search volumes, rank positions and GBP insights are therefore **not measurable from here**. Backlink Health Score is INSUFFICIENT DATA by the skill's Tier 0 rule.
- **Turn limits.** Several specialist agents stopped at their turn limit. Items explicitly **not run**: multi-modal GEO audit, live AI-answer tests, Reddit/YouTube/press mention sweeps, Common Crawl inbound-edge scan (started, aborted; `raw/backlinks/edges_hits.txt` is incomplete, do not read it as "no links"), agent user-agent matrix, Web Bot Auth, live form submission/thank-you flow, Yelp/HomeStars/YellowPages/Canada411/Cylex presence (403/202), LinkedIn/X profile verification, image SERP analysis, Google Rich Results Test, Schema Markup Validator.
- **Local data.** Google Maps was read in "limited view" without a Toronto IP: only 3 of 10 reviews, no secondary categories, Q&A, attributes or service-area settings were visible.
- **Repository.** Read-only. Nothing in `/home/user/evergreencleaningservice` was changed by this audit.

---

## 3. Technical SEO: 84 / 100

Source: `findings/technical.md`, `findings/sitemap.md`, `findings/hreflang.md`. Crawl of 111 URLs (73 sitemap + 38 discovered); per-URL data in `raw/technical/crawl.csv`.

### What works
- Closed, clean crawl graph: 111/111 return 200, 0 broken or redirecting internal link targets, 0 duplicate titles or descriptions, exactly one H1 and a self-referencing canonical on every page.
- Indexation hygiene: sitemap lists only 200, indexable, canonical URLs; tag/category archives (38), `/thank-you/`, 404 and all 4 `/lp/*` paid pages are `noindex` and out of the sitemap; real 404s, no soft-404s; 154 legacy WordPress redirects all 301 in one hop (`backlinks.md` §4, `sitemap.md` §2.3).
- Fully server-rendered Astro build: 0 words appear only after JS; HTML about 26 KB Brotli from Cloudflare edge (cache HIT); HTTP/2 with h3 advertised; immutable fingerprinted assets; self-hosted preloaded fonts; CSS inlined.
- Correct host/protocol redirects (apex→www, http→https, 301, 1 hop); consistent trailing slashes; `lang="en-CA"` + `og:locale="en_CA"`; hreflang correctly absent for a single-language site.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | **No security headers on any HTML response**: no HSTS, CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options or Permissions-Policy (img.* host and /admin/ routes do send them). Not a ranking factor; a trust and best-practice gap. | `curl -D - https://www.evergreencleaningservice.ca/` | Add a `/*` block to `public/_headers` (HSTS without preload, nosniff, strict-origin-when-cross-origin, Permissions-Policy, SAMEORIGIN); CSP report-only first allowing GTM, Ads, Cloudflare Insights, Trustindex, img.* |
| Medium | `/search/` is indexable, in the sitemap and an orphan (0 inlinks, 1 word of content) | https://www.evergreencleaningservice.ca/search/ | `noindex, follow` + exclude in `astro.config.mjs` sitemap filter |
| Medium | Sitemap has no `<lastmod>` on any of 73 URLs; Worker-injected admin posts will have one, making it inconsistent | https://www.evergreencleaningservice.ca/sitemap-0.xml | Real content dates via `serialize` hook; never build time |
| Medium | Slash-less URLs redirect 307 (temporary), not 301/308 | `curl -I https://www.evergreencleaningservice.ca/about-us` | Explicit 301 rules for known legacy slash-less URLs, or Cloudflare `html_handling` |
| Medium | Core Web Vitals not verified (PSI 429, CrUX 403) | `performance.md` §2 | Re-run PSI with `PSI_API_KEY` for `/` and `/services/office-cleaning/` mobile; monitor CrUX once GSC is verified |
| Medium | Third-party script weight on every page: `gtm.js` 157 KB + `gtag/js` (AW-18472921801) 168 KB + doubleclick + call-tracking + Cloudflare Insights, about 610 KB of 30 requests on `/` | `raw/technical/pw/pw.json` | See Performance §7 |
| Medium | `/insights/page/2..4/` in the sitemap (self-canonical, indexable archive pages) | https://www.evergreencleaningservice.ca/insights/page/2/ | Remove from sitemap, keep crawlable (they are the only path to most posts) |
| Low | 5 titles over 60 chars (Mississauga 72, Vaughan 69, commercial-cleaning 61, two posts 61); short generic legacy titles lack geo/B2B intent | https://www.evergreencleaningservice.ca/locations/mississauga/, https://www.evergreencleaningservice.ca/services/graffiti-removal/ | Trim to 50–60, keep "Toronto" |
| Low | 13 descriptions over about 160 chars | https://www.evergreencleaningservice.ca/services/pressure-washing/ (166) | Trim to 150–158 |
| Low | 130 of 503 `<img>` lack width/height (lab CLS 0.017) | `raw/technical/crawl.csv` | Add dimensions; see Images |
| Low | Trustindex SVG `<title>` noise in body | https://www.evergreencleaningservice.ca/ | `aria-hidden` or remove SVG titles |
| Low | 49 of 73 pages link to all 26 noindex tag pages (crawl budget) | https://www.evergreencleaningservice.ca/tag/cleaning/ | Cap sidebar to 5–8 tags |
| Low | IndexNow not set up; `/llms.txt` 404; robots.txt allows all AI crawlers (deliberate choice needed) | https://www.evergreencleaningservice.ca/robots.txt | Decide; see AI Search Readiness |
| Info | Blog posts live at root `/<slug>/` (legacy WordPress URLs preserved); reserve static route names to avoid collisions with the Worker's `/<slug>/` admin posts | `technical.md` #13 | No change |

### Sitemap and architecture (70/100, `sitemap.md`)
Single flat `sitemap-0.xml` (73 URLs, valid, 7 KB). Proposed split for Search Console diagnostics: `sitemap-pages`, `-services`, `-industries`, `-locations`, `-insights` under `sitemap-index.xml`, each with real `lastmod`; point the Worker's `LIST_PATHS`/`injectSitemap` at `sitemap-insights.xml`. Six stated service areas (North York, Scarborough, Richmond Hill, Pickering, Ajax, Oshawa) have no page and are unlinked text on `/locations/`. 3 industry URLs vs JAN-PRO's 25-URL `industries-sitemap.xml`.

---

## 4. Content Quality: 43 / 100

Source: `findings/content.md` (73 pages, BeautifulSoup extraction, 6-word shingle uniqueness, Flesch-Kincaid), `content.json`. E-E-A-T 41/100 (Experience 30, Expertise 40, Authoritativeness 35, Trustworthiness 55). AI-citation readiness 45/100.

### What works
- Rebuilt core pages (`/services/office-cleaning/`, `/services/commercial-cleaning/`, `/services/building-maintenance/`, `/services/post-construction-cleaning/`, `/industries/medical-dental-clinics/`, `/industries/property-management/`, `/our-process/`) have intent-matched H1s, "who it is for", inclusions, explicit scope and limits, price-factor lists and 3–7 FAQs with FAQPage schema. They beat the JAN-PRO equivalents on FAQs, readability (grade 7.7–8.6 vs 12.1–12.4) and transparency.
- Consistent, specific trust facts: since 1989, full NAP and hours, WSIB/bonded/insured, honest single-office statement on every location page, strong scope sentences ("Sterilization of instruments and the handling of biomedical or sharps waste ... are not part of a cleaning contract").
- Hand-written metadata: `templated_ratio` 0.0, no duplicate titles or descriptions, no shared CTA phrases.

### E-E-A-T assessment

| Factor | Score | Key evidence |
|---|---|---|
| Experience | 30 | No project photos; every sampled image shows AI tells (same uniformed pair, CN Tower behind every interior, cleaner in clinical scrubs); no case studies, client names or logos; blog has zero quantified facts |
| Expertise | 40 | Competent janitorial copy; but no author on any page (BlogPosting `author` = Organization), no WHMIS/IPAC credentials, US sources (CDC/EPA/WebMD/WikiHow) instead of Health Canada/PHO/RCDSO; typos on a money page ("psychically remove dirt") |
| Authoritativeness | 35 | "Since 1989" is strong and consistent; real social profiles in `sameAs`; but no associations, awards, press, client logos; the 4 homepage reviews are 5–6 years old; a followed link to a competitor |
| Trustworthiness | 55 | NAP/hours consistent with schema; privacy page; WSIB/bonded/insured on every money page; but never evidenced; `/reviews/` empty; AI images captioned as results; service area contradicts itself (10 cities vs 22 places on emergency page); unsupported "certified"/"health-grade" claims on Mississauga |

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | Location pages are 94–97% boilerplate (21–42 unique words after city normalisation; Jaccard 0.76–0.88) | https://www.evergreencleaningservice.ca/locations/brampton/, /etobicoke/, /markham/, /oakville/, /toronto-downtown/ | 250–400 words of verifiable local substance each (districts, building types, local client quote, dispatch logistics) or consolidate into `/locations/` with 301s. No new city pages on this template. |
| High | Site imagery appears AI-generated and is presented as cleaning results; gallery is 13 images and 3 words with typos in meta ("smalling", "chorome") | https://www.evergreencleaningservice.ca/cleaning-demo-gallery/, https://www.evergreencleaningservice.ca/, https://www.evergreencleaningservice.ca/industries/medical-dental-clinics/ | Replace with real crew and site photos (intake B5); retitle or remove the gallery; never caption generated images as results |
| High | `/reviews/` contains no reviews (35 words, form only; title and meta promise "real Google reviews") | https://www.evergreencleaningservice.ca/reviews/ | Embed dated Google reviews and attributed testimonials; form below; request new reviews |
| High | About page thin and anonymous (170 words; reviews mention "Art" but the site never names him) | https://www.evergreencleaningservice.ca/about-us/ | 600–900 words: owner, operations lead, account executives with photos; 1989-to-today history; verifiable numbers; WSIB clearance process, insurer, limit; `Person`/`AboutPage` schema |
| High | Blog stale, undated, unattributed: 38 posts, newest 2023-03-31, no visible dates or bylines, `dateModified = datePublished` (CMS placeholders `T00:00:00.000Z`) | https://www.evergreencleaningservice.ca/insights/ | Visible published/updated line; named `Person` author; refresh and consolidate per plan (38 → about 22 URLs) |
| Medium | 9 COVID-era posts plus a COVID-framed money page ("Are You Concerned About Covid-19", "psychically", "everything is clean with plain detergent") | https://www.evergreencleaningservice.ca/services/disinfection-cleaning/, /be-safe-from-coronavirus-work/, /the-return-of-employees-post-covid-19-is-your-office-ready/ and 7 more | Rewrite disinfection page as electrostatic/touch-point disinfection; 301 or merge posts after checking GSC clicks and links |
| Medium | Followed outbound link to a Toronto competitor with keyword anchor | https://www.evergreencleaningservice.ca/ask-the-office-cleaners-cleaning-break-rooms/ (`greencleanofficemaintenance.com`, anchor "Toronto office cleaners") | Remove |
| Medium | 26 of 38 posts link to no service, industry or location page; top targets are `/contact-us/` (27) and `/about-us/` (21) | `content.md` §7 | 2–3 contextual links per post to the matching money page |
| Medium | Legacy service pages thin or wrong: graffiti 167 unique words, pressure washing 200, industrial 234 (lists retail, banks, golf clubs, casinos), emergency 310 with a 22-place service area that contradicts the 10-city schema | https://www.evergreencleaningservice.ca/services/industrial-cleaning/, /emergency-cleaning/, /graffiti-removal/, /pressure-washing/ | Rebuild on the office-cleaning template; one service-area list everywhere |
| Medium | Coverage gap vs JAN-PRO: 2 industry pages vs 16; no janitorial, carpet, floor care, day porter, window, dental-only, retail, education, warehouse, government pages | `content.md` §6, `clusters.md` §7, `briefs/README.md` | Build per the 12-page priority list and the 6 briefs, evidence-gated |
| Medium | `/industries/property-management/` vs `/services/building-maintenance/` TF-IDF similarity 0.58 (highest pair) | both URLs | Differentiate: maintenance = periodic floor/surface programme; PM = portfolio, tenant and condo relationship |
| Low | Price factors everywhere, ranges nowhere; competitors anchor $225–$500/month, from $400; HomeStars quotes $0.10–0.25/sq ft | https://www.evergreencleaningservice.ca/services/office-cleaning/ | Toronto pricing guide with honest ranges (intake A7) |
| Low | Blog structure: zero `<ul>`/`<ol>` across 38 posts (two are "checklists"); 10 posts jump H1→H3; all under 1,500 words | https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/ | Real lists and tables; fix heading hierarchy |
| Low | Unsupported claims: "certified", "health-grade sanitization" (Mississauga); "Airports, Casinos, Hospitals" (legacy pages); WSIB/insurance asserted without evidence | https://www.evergreencleaningservice.ca/locations/mississauga/ | Evidence or remove |
| Low | Hubs are cards only: `/services/` 178 unique words, `/industries/` 104 (lists 7 segments, 2 have pages), `/locations/` 46 | https://www.evergreencleaningservice.ca/services/ | 100–200 word intro and selection guidance on each hub |

Readability is not a problem (mean grade 8–9; three pages above 12). Thin pages (<300 unique words, excluding utility): 7 of 7 location pages, 3 service pages, about, green products, gallery, reviews, 3 hubs.

---

## 5. On-Page SEO: 68 / 100 (derived)

No specialist issued an On-Page score. It is derived here from `technical.md` (titles, descriptions, H1 counts, internal links), `sxo.md` (intent match, cannibalisation), `clusters.md` (primary-keyword ownership, blog clashes), `page-home.md` (On-Page 85) and `page-office-cleaning.md` (On-Page 88).

| Component | Max | Score | Reasoning |
|---|---|---|---|
| Title tags | 20 | 16 | 0 missing, 0 duplicate, 111/111 present; 5 over 60 chars; legacy titles ("Graffiti Removal - Evergreen Office Cleaning", "News - ...") lack geo and B2B intent; `/services/` hub title duplicates the commercial-cleaning page's target |
| Meta descriptions | 15 | 12 | 0 missing or duplicate; hand-written (templated ratio 0.0); 13 over 160 chars; the two best pages lack a CTA verb; 7 carry a brand suffix; 2 echo the title |
| Headings / H1 | 20 | 14 | Exactly 1 H1 on 111/111 and valid hierarchy on core pages; but 7 location H1s are the title string pasted in ("Commercial Cleaning in Brampton \| Evergreen Office Cleaning", ALL-CAPS on downtown), 4 legacy service H1s are bare labels without geo, `/insights/` H1 is "News", 10 posts skip H2, footer column H2s add noise |
| Intent match and cannibalisation | 20 | 11 | Core titles/H1s match intent and page types match the SERP; but "commercial cleaning toronto" is split across `/`, `/services/`, `/services/commercial-cleaning/` and `/locations/toronto-downtown/`; no janitorial page (homepage card links to office cleaning); combined medical+dental page vs a dental-only SERP; `/reviews/` promises reviews and delivers a form; industrial page audience mismatch; 2 off-intent consumer posts |
| Internal linking | 15 | 8 | Closed graph, 0 broken links, hubs link all spokes, every service page links all 7 locations; but 26/38 posts link to no money page, most posts have exactly 1 inlink (the archive), `/search/` is an orphan, 3 image-only blog links have empty anchor text, links are card-style not contextual, service pages list all 15 areas regardless of relevance |
| Keyword and entity use | 10 | 7 | Rich local/operational entities (10 municipalities, WSIB, ECOLOGO, account executive); no stuffing; but neither "office cleaning toronto" nor "commercial cleaning toronto" appears verbatim in body copy on the two pages that target them |
| **Total** | **100** | **68** | |

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | Toronto head-term cannibalisation across 4 URLs | https://www.evergreencleaningservice.ca/, /services/, /services/commercial-cleaning/, /locations/toronto-downtown/ | Homepage owns "commercial cleaning toronto/services toronto"; retitle `/services/` to "All Cleaning Services \| Evergreen" with a non-competing H1; make `/services/commercial-cleaning/` the pillar "Commercial Cleaning & Janitorial Services in Toronto" (2,500–3,000 words, janitorial as secondary target); downtown page targets "office cleaning downtown Toronto" |
| High | No janitorial services page; homepage "Janitorial Services" card links to office cleaning | https://www.evergreencleaningservice.ca/#what-we-clean | Two specialists disagree: `sxo.md` and `briefs/janitorial-services.md` propose `/services/janitorial-services/`; `clusters.md` finds 4–5 SERP overlap with office and commercial and recommends janitorial as the pillar's secondary target first, splitting out only if GSC shows janitorial queries landing on the office page. Recommended: pillar first, decide on the standalone page after 60 days of GSC data |
| Medium | Location H1s carry the brand suffix and (downtown) ALL-CAPS; no CTA or phone in the fold on location pages | https://www.evergreencleaningservice.ca/locations/toronto-downtown/ | Title-case H1 "Commercial Cleaning in Downtown Toronto"; hero CTAs; later rename `/locations/toronto-downtown/` → `/locations/toronto/` with 301 |
| Medium | Legacy service H1s are bare labels ("Disinfection Cleaning", "Industrial Cleaning") | https://www.evergreencleaningservice.ca/services/disinfection-cleaning/ | Add the geo modifier to match the title |
| Medium | `/reviews/` intent mismatch; `/insights/` titled "News" | https://www.evergreencleaningservice.ca/reviews/, https://www.evergreencleaningservice.ca/insights/ | See Content; rename to "Commercial Cleaning Insights" |
| Medium | Target phrases never verbatim; blog posts under-linked to money pages; card links instead of contextual in-paragraph links (JAN-PRO's pattern) | https://www.evergreencleaningservice.ca/services/office-cleaning/ | One natural sentence per phrase; 2–3 contextual links per post; in-sentence anchors ("strip, seal and wax" → building maintenance) per the matrix in `clusters.md` §6 |
| Medium | Blog topic clashes: 4 seasonal checklists, 5 COVID posts, 2 germ-hotspot, 3 air-quality, 3 methods, 2 hand-hygiene, 2 choosing-a-cleaner posts | `clusters.md` §5 | Consolidate to about 21 posts; `/benefits-of-regular-commercial-cleaning-services/` folds into the pillar; check GSC clicks and links before any 301 |
| Low | 5 titles > 60, 13 descriptions > 160, no CTA verb on best pages; `twitter:site` missing | `technical.md` #7–8; `page-home.md` §8 | Rewrites supplied in `page-home.md` §8 and `page-office-cleaning.md` §8 |
| Low | 3 blog-teaser image links on `/` have no anchor text; footer H2s dilute the outline | https://www.evergreencleaningservice.ca/ | Post title as link text; demote footer headings |

---

## 6. Schema and Structured Data: 74 / 100

Source: `findings/schema.md` (16 pages + 2 JAN-PRO, all `application/ld+json` parsed; 0 invalid blocks). Google Rich Results Test and Schema Markup Validator could not be called; run both before shipping.

### What works
- One `CleaningService` entity (`#organization`) on every page with full NAP, `GeoCoordinates`, 7-day `OpeningHoursSpecification`, 10 `City` areaServed, `hasOfferCatalog`, `sameAs`; no duplicate Organization node; consistent `@id` graph (`#organization`, `#website`, `#article`, `#collection`).
- Service + BreadcrumbList + FAQPage on service and industry pages; FAQ text matches the visible page; BlogPosting with publisher/author by `@id`; CollectionPage on `/insights/`.
- Policy-safe: no `aggregateRating`, no per-city LocalBusiness nodes (Mississauga FAQ states there is no office there), no deprecated HowTo; FAQPage correctly treated as legacy (rich results retired 2026-05-07).
- Ahead of JAN-PRO on local-business data; JAN-PRO has `&amp;` inside JSON strings and string `position` values (do not copy).

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| Medium | Name inconsistency: schema `name` "Evergreen Office Cleaning"; logo alt, social slugs, reviews and domain say "Evergreen Cleaning Service"; no `alternateName`/`legalName` | https://www.evergreencleaningservice.ca/ JSON-LD | `alternateName: ["Evergreen Cleaning Service", "Evergreen Cleaning Services"]`, `legalName` if different, `foundingDate: "1989"` |
| Medium | BreadcrumbList missing on 7 templates | https://www.evergreencleaningservice.ca/services/, /locations/, /locations/mississauga/, /about-us/, /reviews/, /contact-us/, /request-a-quote/ | Add per `schema.md` §5c |
| Medium | Blog `dateModified = datePublished`, both `T00:00:00.000Z`; no visible date or byline backs them | https://www.evergreencleaningservice.ca/cleaning-check-list-dental-clinics/ | Real ISO 8601 with Toronto offset; visible "Published / Updated"; `dateModified` only on substantive edits |
| Low–Medium | `author` is the Organization | all 38 posts | Named `Person` with bio (do not invent a name) |
| Low | `logo` is a 884×265 banner string; `image` is the same banner | JSON-LD on all pages | `ImageObject` square PNG ≥112 px for `logo`; real photo in 16:9/4:3/1:1 for `image` |
| Low | Geo 43.6503, -79.3892 is about 53 m from the GBP pin (43.65019, -79.38856), 4 decimals | `local.md` §4 | Copy the GBP pin at 5 decimals |
| Low | `areaServed` city list repeated in full on every Service node; no `containedInPlace`/Wikidata disambiguation; FAQ districts (North York, Scarborough, Etobicoke) not in schema | `schema.md` #6 | One definition on `#organization`, `containedInPlace` Ontario, reference by `@id` |
| Low | `hasOfferCatalog` items have no `url` and are not tied to page-level Service nodes (which lack `@id`); "Industrial & Warehouse Floor Scrubbing" has no matching page | `schema.md` #7 | `@id` `.../#service` on each Service; catalog `itemOffered` references them; no fake prices |
| Low | `SearchAction` on WebSite has no Google benefit since 2024; post breadcrumbs pass through noindex `/category/blog/` and label "News" | `schema.md` #9–10 | Optional removal; breadcrumb via `/insights/` |
| Info | Missing optional fields: `contactPoint`, `hasMap`, `knowsAbout`, `audience` (BusinessAudience), `WebPage` nodes with `dateModified`/`primaryImageOfPage`, `AboutPage`/`ContactPage`, `Service.availableChannel` → `/request-a-quote/`, `potentialAction` for the quote (`agentic.md` §5) | `schema.md` §4 | Ready-to-paste JSON in `schema.md` §5a–5d and `page-office-cleaning.md` §4 |

Do not add: HowTo, SpecialAnnouncement, `aggregateRating` (unless a rating is displayed and derived from on-page first-party reviews), per-city LocalBusiness, Review markup for quoted Google reviews, prices.

---

## 7. Performance: 80 / 100 (lab judgement, no field data)

Source: `findings/performance.md` (Playwright, 3 cold runs, mobile 4× CPU / 1.6 Mbps / 150 ms RTT; desktop unthrottled), `page-home.md` and `page-office-cleaning.md` (Browserless Lighthouse 13.5.0).

### What works
- The 15 Oct optimisation landed: reCAPTCHA loads on form intent only (0 requests before focus, 11 after); 0 render-blocking resources (CSS inlined); `/_astro/*` immutable 1-year cache, fonts 30 days; mobile page weight 0.49–0.70 MB; CLS 0 on home, service and paid pages.
- Mobile LCP under 1.7 s in the lab on every page; text-LCP pages (service, location) at about 0.6 s; desktop LCP under 0.6 s and TBT under 40 ms everywhere.
- Hero is a 23 KB art-directed AVIF with `fetchpriority="high"`; AVIF/WebP `<picture>` on hero, cards and post features.
- Versus jan-pro.ca/en/ (the real Toronto competitor): about a quarter of the TBT, a third of the requests, half the weight, no render-blocking files.

### Measured (medians of 3, mobile unless stated)

| Page | FCP | LCP | TBT proxy | CLS | Transfer | Lighthouse mobile perf (Browserless, simulated) |
|---|---|---|---|---|---|---|
| `/` | 732 ms | 1,608 ms (hero AVIF) | 442 ms | 0 | 658 KB / 30 req | **63** (LCP 4.6 s, TBT 840 ms, TTI 7.7 s) |
| `/services/office-cleaning/` | 604 ms | 604 ms (text) | 543 ms | 0 | 703 KB / 27 req | **84** (LCP 2.3 s, TBT 500 ms) |
| `/lp/office-cleaning/` | 536 ms | 1,624 ms | 588 ms | 0 | 531 KB | not run |
| `/locations/mississauga/` | 596 ms | 596 ms (text) | 539 ms | **0.034** (font swap) | 493 KB | not run |
| jan-pro.com `/` | 708 ms | 1,360 ms | 0 | 0 | 222 KB / 19 req | 94 |
| jan-pro.ca `/en/` | 1,292 ms | 2,240 ms | 2,009 ms | 0 | 1,501 KB / 87 req | not run |

INP: not measured. CrUX p75: unavailable (403). PSI: unavailable (429). The repo's own Lighthouse run on 15 Oct reported mobile 75 (home), 87 (office), 78 (paid), 83 (Mississauga); the Browserless run today gives 63 and 84. Expect mobile PSI in the 60s–80s, not the 90s, until the tag stack is addressed.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | **Google tag stack costs 440–590 ms of mobile TBT and 0.3–0.55 s of mobile LCP on every page.** Blocking googletagmanager hosts takes TBT to 0–4 ms (measured). `gtm.js` (GTM-5W69BTJQ) 153 KB + `gtag/js?id=AW-18472921801` 164 KB + doubleclick + `call-tracking_9.js`. The site's own JS contributes essentially nothing. | https://www.evergreencleaningservice.ca/ (`raw/performance/`) | Audit the container; one Google tag for GA4 + Ads; consider loading GTM after first interaction or a 3–4 s idle timer (trade-off: call-tracking number swap and non-interacting page views, so the ads owner decides). Not Partytown (call tracking needs `document`). |
| High | `/video/lead-net.mp4` (2.53 MB, `Cache-Control: max-age=0, must-revalidate`) downloads on every page view about 3 s after load; the code comment says "40KB+". Desktop page weight 3.1 MB vs 0.64 MB without it. | https://www.evergreencleaningservice.ca/video/lead-net.mp4; `src/components/LeadVideo.astro` | Load on click of the bubble or compress to <500 KB with a poster; add `/video/*` `max-age=2592000` to `public/_headers` |
| Medium | Homepage hero LCP path: new TLS connection to `img.` plus bandwidth contention with tags; request issued about 200 ms after HTML start | https://www.evergreencleaningservice.ca/ | `<link rel="preload" as="image" imagesrcset=... fetchpriority="high">`; consider same-origin image route |
| Medium | Font-swap CLS 0.033 on `/locations/*` mobile (`P.loc-lead`, H2, `UL.loc-detail`); blocking `/fonts/` removed it | https://www.evergreencleaningservice.ca/locations/mississauga/ | Metric-matched fallback (`size-adjust`, `ascent-override`) or `font-display: optional` for body |
| Medium | `/lp/office-cleaning/` uses the 1600w hero AVIF (45 KB) on a 390 px viewport; homepage has a 640×800 variant | https://www.evergreencleaningservice.ca/lp/office-cleaning/ | Use the mobile source |
| Low | `open-sans-italic.woff2` (50 KB) fetched at VeryHigh priority on every page | all pages | Subset, lazy-load or drop |
| Low | `img.evergreencleaningservice.ca` `max-age=86400` (repeat visits) | any image URL | Raise to 2592000 (`scripts/b2-sync.mjs`) |
| Low | Cloudflare Web Analytics beacon (11 KB) redundant once GA4 exists; DoubleClick third-party cookie → Lighthouse best-practices 77 | https://www.evergreencleaningservice.ca/ | Drop or accept knowingly |

---

## 8. Images: 61 / 100

Source: `findings/images.md` (21 pages, 66 placements × 2 viewports, 115 variants downloaded, Pillow metadata), `findings/image-plan.md` (OG/schema image plan). Image SERP analysis not run (no DataForSEO).

### What works
- 0 missing `alt` attributes; 20 well-written descriptive alts (45–90 chars) on body photos.
- Hero, logo, cards and post features are exemplary: AVIF/WebP `<picture>`, srcset + sizes, `fetchpriority="high"`, 23–45 KB LCP image, Cloudflare-fronted B2 CDN with `preconnect`.
- 21/21 pages have `og:image` and `twitter:card=summary_large_image`, all exactly 1200×630 JPEG, 63–149 KB; page-specific OG on services, industries and posts.
- Nothing over 200 KB; favicon set complete (ico 16/32/48, 512 png, apple-touch 180); descriptive hyphenated filenames.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| Critical (specialist label; High under the skill's definitions) | **8 of 21 money pages have no photograph at all** (logo only, no CSS backgrounds): building-maintenance, graffiti-removal, post-construction, pressure-washing, property-management, toronto-downtown, mississauga, about-us. Their existing OG photos are not used on-page. | https://www.evergreencleaningservice.ca/services/post-construction-cleaning/, https://www.evergreencleaningservice.ca/about-us/ | Add at least the page's OG photo as an in-page `<figure>` with a location-aware alt; ideally a real service-specific photo per page |
| Critical (specialist label; High) | **Body photos are unoptimised plain JPEGs**: 16 unique files / 36 placements inside `<p>`, 75–127 KB each, no `<picture>`, no srcset/sizes, no width/height; about 1.2 MB of the 1.64 MB unique image payload. `-768.avif` variants already exist on the CDN for some. | https://www.evergreencleaningservice.ca/services/office-cleaning/ (`office-backpack-vacuum-toronto.jpg` 116 KB) | One `ResponsiveImage` component (AVIF+WebP+JPEG, 480/800/1200/1600w, `sizes="(min-width: 992px) 790px, 100vw"`, dimensions). Est. −1.2 MB / −72% |
| High | Empty `alt=""` on 19 meaningful images incl. the homepage LCP hero, 3 home service-card photos, 13 blog thumbnails, 2 legacy logos | https://www.evergreencleaningservice.ca/, https://www.evergreencleaningservice.ca/insights/ | Rewrite list in `images.md` §4 |
| High | 23 placements lack width/height; CLS 0.075 measured on one post when a lazy dimensionless JPEG entered view; emergency and industrial pages have a lazy dimensionless JPEG as desktop LCP | https://www.evergreencleaningservice.ca/how-to-decide-on-a-cleaning-company/ | Dimensions or `aspect-ratio: 3/2`; no `loading="lazy"` on first-viewport images |
| High | Blog thumbnails are 300×150 WordPress crops upscaled 3.6× on phones, JPEG-only, in `aria-hidden` links with `alt=""` | https://www.evergreencleaningservice.ca/insights/ | Serve the existing 960×480 feature set via the component |
| High | Generic OG image on 7 pages (`evergreen-modern-commercial-cleaning-hero-og.jpg` on `/`, graffiti, post-construction, pressure-washing, both locations, `/insights/`); no `og:image:width/height/alt` or `twitter:image:alt` anywhere (JAN-PRO sets all four) | https://www.evergreencleaningservice.ca/locations/mississauga/ | Page-specific OG per `image-plan.md` §4; four meta tags in the layout |
| Medium | Legacy WordPress logo banners left inside 4 posts (one filename typo "torotno") | https://www.evergreencleaningservice.ca/benefits-of-commercial-deep-cleaning-services/ | Remove |
| Medium | Keyword-only alt "emergency office cleaning" | https://www.evergreencleaningservice.ca/services/emergency-cleaning/ | Describe the photo |
| Medium | Obviously AI-generated photography with no provenance metadata (no EXIF/XMP/IPTC/C2PA); no real crew, van or before/after photo on any of 21 pages | hero, `dental-office-cleaning-technician.jpg`, `night-janitorial-crew-office-toronto.jpg` | Inject IPTC `DigitalSourceType=trainedAlgorithmicMedia` on generated files; half-day photoshoot per `image-plan.md` §3 |
| Medium | Schema `image`/`logo` is the 884×265 banner; BlogPosting `image` is 960×480 (Google wants ≥1200 px in 16:9, 4:3, 1:1) | JSON-LD on all pages | `ImageObject` arrays per `image-plan.md` §5 |
| Low | Post feature images not 2× ready on desktop and no `fetchpriority`; no SVG favicon or web manifest; first home card lazy at 809 px on an 844 px viewport | `images.md` 3.10–3.14 | Minor |

---

## 9. AI Search Readiness (GEO): 60 / 100

Source: `findings/geo.md` (Citability 62, Structural readability 75, Multi-modal 35 provisional, Authority & brand 30, Technical accessibility 90; weighted 59.75). JAN-PRO about 66. Live AI answers could not be tested (Google 429, Perplexity 403, Copilot empty shell).

### What works
- Technical accessibility 90: server-rendered, `User-agent: *` / `Allow: /`, identical responses to GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Googlebot, Bingbot, CCBot, Applebot-Extended (spoofed UA test; Cloudflare verified-bot rules not tested).
- Structural readability 75: clean H2/H3, lists for inclusions and price factors, FAQPage on 14 pages with 15–54 word answers, strong scope statements.
- Quotable, specific facts exist on the office page ("Busy offices are usually cleaned every weeknight...", "Armstrong Manufacturing's ProSeries Green line ... UL Environment (ECOLOGO)").
- Evergreen ranked #1 and #3 on the one Bing branded SERP that worked, with a Bing Places listing.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | Authority and brand 30/100: split name, conflicting directory NAP, no named person, no Wikipedia/Wikidata entity, name collision with "Evergreen Cleaning Services" (evergreencleaningservices.org) | `geo.md` §5 | Unify the entity (schema `alternateName`, `foundingDate`, Person; visible "formerly Evergreen Cleaning Service" sentence on home and About; fix MapQuest, WhatsYourHours, Fyple, Chamber, Canadian Business Directory; align social display names) |
| High | Almost no quantified facts: no prices, frequencies by sq ft, response times, client or building counts; no definitional opening sentence ("Evergreen Office Cleaning is a Toronto commercial cleaning company founded in 1989 that..."); About page citability 25/100 | https://www.evergreencleaningservice.ca/about-us/ | Definitional opener on every page; hard numbers; named owner/account executive with bio and `Person` schema; price-range answer; cite Ontario IPAC/PIDAC on the clinic page |
| Medium | Freshness: blog dated 2020–2023, organisation as author, no `dateModified` on service pages; "How it works" and price-factor blocks repeated word-for-word across pages dilute uniqueness | https://www.evergreencleaningservice.ca/our-process/ | Visible dates; unique answer-first lead above shared blocks |
| Medium | Off-site footprint thin: YouTube presence not found; HomeStars, BBB, Clutch, Yelp unverified; Bing Places/Webmaster Tools and IndexNow matter for Copilot and ChatGPT search | `geo.md` §7.4 | Grow reviews; claim profiles under the new name; short process videos; LinkedIn cadence; BOMA Toronto/trade mentions |
| Low | `/llms.txt` 404 (jan-pro.ca has one; Google says it does not use it); no Content-Signal in robots.txt | https://www.evergreencleaningservice.ca/llms.txt | Cheap, do last: curated index of services, industries, locations, FAQ |
| Low | Cloudflare AI Crawl Control / bot settings unverified for verified search crawlers | Cloudflare dashboard | Confirm OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot are not challenged |
| Not run | Multi-modal audit, live AI answers, Reddit/YouTube/press mentions, LinkedIn/X verification | `geo.md` §8 | Manual prompt log (10 fixed prompts monthly in ChatGPT, Perplexity, Copilot, Google AI Mode) |

---

## 10. Local SEO and Reviews: 46 / 100

Source: `findings/local.md` (Google Maps limited view, not Toronto-personalised; GBP dashboard not accessible). GBP: cid 15602716773318351983; review link https://g.page/r/CW9cqxQ9_IfYEBM/review resolves to the same place.

### What works
- GBP name "Evergreen Office Cleaning" matches the site; primary category "Janitorial service" is correct for the janitorial query (many pack entrants use "Cleaners"); phone, website and hours match; rating 5.0.
- Core NAP on site, footer and JSON-LD matches GBP; click-to-call `tel:` link; "Review us on Google" link in the footer.
- Honest service-area copy: "We do not have an office in X; crews travel from 243 Queen St W", no fake per-city pins or map embeds.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| Critical | Shared serviced-office address ("Floor 1 - Green Offices Toronto Inc."; Street View shows Gianni's Gelato at 243) may be treated as non-staffed; suspension risk if inspected | Google Maps cid 15602716773318351983 | Confirm staffed, signed premises; otherwise convert GBP to service-area business (hide address, set service areas) and align footer wording |
| Critical | Review volume: 5.0 from 10 reviews, about 2 in the last 12 months, 1 generic owner reply 5 years ago; JAN-PRO GTA core 786 reviews across 3 profiles (4.88 weighted); homepage widget quotes are 2021–2022 | https://www.evergreencleaningservice.ca/ Trustindex widget | Review programme: 4–6 per month via post-service email and account-executive check-ins (QR/short link); reply within 48 h; ask for service and area keywords |
| Critical | Citation inconsistency: old name on chamberofcommerce.com, fyple.ca (2 duplicates, "since 1990"), whatsyourhours.com (old phone), canadianbusinessdirectory.ca; MapQuest lists 130 Broadlands Blvd | https://www.mapquest.com/ca/ontario/evergreen-cleaning-service-454587596 | Correct to "Evergreen Office Cleaning, 243 Queen St W (or SAB), (416) 803-4880"; settle 1989 vs 1990 |
| High | GBP content: 2 photos (one is a gelato storefront), no posts, Q&A/attributes/services not visible | GBP | 25+ real photos, weekly posts, services list with descriptions, seeded Q&A, secondary categories, UTM'd quote link |
| High | Tier-1 directories unverified or absent: Yelp, HomeStars, BBB (no Toronto profile found under either name), YellowPages.ca, Canada411, Cylex, Bing Places, Apple Business Connect | `local.md` §2, `backlinks.md` §2 | Claim and complete under the new name; add to `sameAs`; add GBP URL as `hasMap` |
| High | Absent from the first 6–8 results of all four local-pack samples ("office cleaning toronto", "commercial cleaning toronto", "janitorial services toronto", "office cleaning mississauga"); pack entrants are keyword-in-name profiles with 3–110 reviews | `raw/local/maps_*.txt` | Proximity is fixed by the single pin; reviews, photos, posts and category are the controllable levers |
| Medium | `/reviews/` is a form; no live rating/count on money pages; no map on `/contact-us/`; `/contact/` 404s | https://www.evergreencleaningservice.ca/reviews/, https://www.evergreencleaningservice.ca/contact-us/ | Real reviews page; show rating once intake B3 confirms; directions block |
| Medium | 6 stated service areas have no page (North York, Scarborough, Richmond Hill, Pickering, Ajax, Oshawa) and are unlinked hub text | https://www.evergreencleaningservice.ca/locations/ | Link every area name to the closest real page or anchored section now; build North York, Scarborough, Richmond Hill only after intake C5 and 3+ real local facts each; one combined Durham page at most (`PROGRAMMATIC-PLAN.md` §7) |
| Low | Schema geo 53 m off the pin, 4 decimals; no `hasMap`, `foundingDate`, suite line | JSON-LD | Set 43.65019, -79.38856 |
| Low | Name collision with "Evergreen Cleaning Services" (647-831-2284, 15 reviews, active posts) | Google Maps | Use "Evergreen Office Cleaning" consistently; differentiators (since 1989, WSIB) in the GBP description |

---

## 11. Search Experience (SXO): Gap Score 58 / 100

Source: `findings/sxo.md` (10 queries, page-type matrix, 3 personas × 6 criteria, 36 ranking competitors). Not geo-personalised; no SERP features observed.

### What works
- Page types mostly match the SERP: service, vertical and city pages exist where the SERP rewards them. `/industries/property-management/` (1,179 words) faces thin 454–573-word vertical pages: the most winnable SERP.
- On the page itself Evergreen's office page (73/100 persona score for an office manager) beats JAN-PRO's office page (63) and quote page (50): scope, limits, FAQ, "the team that holds your keys is the same team every visit".
- H1 and both CTAs above the fold on mobile; lab LCP 0.94 s; strong paid landing page pattern (`/lp/office-cleaning/`: big phone, specific offer, sticky Call/Quote bar).

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | Head-term split across 4 pages (see On-Page) | `sxo.md` §2 | Assign one owner per intent |
| High | No janitorial page; no dental-only page while 6/9 dental results are dental-specific (ProCity cites "operatory turnover... RCDSO-aligned") | query "dental office cleaning toronto" | Dental H2 and the checklist post as spoke first; `/industries/dental-office-cleaning/` when GSC shows dental impressions (brief 6 covers the clinic page improvement) |
| High | Proof far below ranking competitors: MCA 140 Google reviews, Dust 'til Dawn 83 with AggregateRating, Impact "53+", JAN-PRO "4.8★, 700+ Toronto clients"; Evergreen shows 4 reviews dated 5–6 years ago, no case studies, no certification beyond WSIB/bonded/insured (Impact and Everest cite CIMS) | https://mcagroup.ca/, https://dusttildawn.ca/ | Reviews, 2–4 case studies (intake B4), real photos (B5), consider CIMS |
| Medium | Price guidance 0–2/5 for every persona; competitors anchor $225–$250/month (Arelli), "from $250/month" (ServiceMaster), "fixed monthly rates" (We Clean It), "from CAD $400" (Clean Papi), HomeStars $0.10–0.25/sq ft/month | https://www.arellicleaning.com/blog/office-cleaning-companies-toronto | Price-guidance block on office, commercial, clinic and city pages (client-confirmed, intake A7); cost guide "How much does office cleaning cost in Toronto? (2026)" |
| Medium | No after-hours key/alarm/ID/security protocol block, the decision-stage trust question | https://www.evergreencleaningservice.ca/services/office-cleaning/ | Key and fob log, alarm handling, uniformed ID'd crew, confidentiality, named supervisor, re-clean promise (intake B1/B2) |
| Medium | Mississauga page: H1 above breadcrumb, no BreadcrumbList, "health-grade sanitization adhering strictly to clinical hygiene standards" over-claim, no local address (5/9 competitors show one) | https://www.evergreencleaningservice.ca/locations/mississauga/ | Fix order and schema; remove the claim; Mississauga client quote; accept organic-only target |
| Medium | Post-construction page lacks "Toronto" in the H1, phases and a price basis; SERP is 9/9 dedicated pages with price anchors | https://www.evergreencleaningservice.ca/services/post-construction-cleaning/ | Add geo, rough/final/touch-up phases, before/after photos |
| Low | Video bubble overlaps the trust strip on mobile; directories (Yelp, Bark, HomeStars) hold 1–3 slots on every commercial query | `sxo.md` §6 | Defer bubble on mobile; claim directories |

### Visual and mobile (72/100, `visual.md`)
P1: leadnet chat widget overlaps content on every mobile page (covers the phone field on the quote form; black-circle loading state; dismiss 26×26 at 3.64:1); location pages have no CTA/phone in the fold; `/reviews/` weak; quote form heavy (8 required fields incl. full address, captcha banner mentions a tick box that is not yet visible, 42 px inputs). P2: body copy 13.1 px/12.6 px on mobile (JAN-PRO 18 px); tap targets 40×44 header icons, 42 px CTAs, 28 px footer links, 24×24 social, 18 px checkboxes; mobile menu lacks overlay/close-on-tap. P3: AI-looking imagery; logo JPG with an off-white box; LP star rating #B8860B at 3.25:1. Jan-Pro patterns worth borrowing: persistent bottom action bar, 18 px body, trust badges near the fold.

---

## 12. Authority and Backlinks: about 12 / 100 (low confidence; Backlink Health Score INSUFFICIENT DATA)

Source: `findings/backlinks.md` (Common Crawl domain graph `cc-main-2026-aug-sep-oct`, CDX index CC-MAIN-2026-43, Wayback availability, live redirect checks). Tier 0: no Moz/Bing/DataForSEO/Open PageRank.

### What works
- Clean, complete redirect map: all probed legacy URLs (`/commercial-cleaning-toronto-gta/`, `/office-cleaning-and-janitorial-toronto/`, `/property-management-and-building-maintenance/`, `/disinfection-cleaning/`, `/testimonials/`, `/blog/*`, `/feed/`, `/author/admin/`) 301 in one hop to a 200 page, protecting whatever equity exists.
- Harmonic-centrality rank 15.3M of 135.0M (top 11.3%) indicates at least one inbound path from a well-connected domain.
- Real social profiles exist and are referenced in `sameAs`.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | PageRank at the graph floor (rank 53.2M of 135.0M; value 3.84e-9 vs floor 3.79e-9); 3 hosts; 64 captured URLs; first Wayback capture 2019-08-17. jan-pro.com: PageRank rank 204K (34× floor), 26 hosts; jan-pro.ca rank 3.3M | `raw/backlinks/ranks_hits.txt` | Realistic SMB link plan: supplier page (Armstrong ProSeries Green), client testimonial/vendor links, BOMA Toronto / Toronto Board of Trade / BIA directories (only if true memberships), BBB profile, HomeStars/Yelp/YellowPages/Canpages, local trade press with a data piece, partner vendors; reclaim old-brand mentions. No bought directory blasts or PBNs |
| Medium | Old brand split (see Entity) means citations under "Evergreen Cleaning Service" cannot be matched without a mention sweep; BBB name collisions (Evergreen Carpet Cleaning, Evergreen Cleaning Services) | `backlinks.md` §4 | Mention sweep once a working search tool is available; "formerly" statement |
| Not run | Inbound edge list (scan aborted), mention counts, DA/DR, spam score, anchor text, link velocity, 101 upload-path redirect rules untested | `backlinks.md` §1 | Finish the Common Crawl edge scan (`$2==ID`, map `from` IDs); get a free Open PageRank key; Moz free tier |

---

## 13. Agent Readiness: Lighthouse Agentic Browsing 2/2; agent-critical checks 12/13; Agent-UX heuristic 82 / 100 (PARTIAL)

Source: `findings/agentic.md` (local Lighthouse 13.5.0 `agentic-browsing`, Playwright AX tree, code read; nothing submitted). JAN-PRO 1/2, 5/11, 48.

### What works
- Content in server HTML; robots allows agents; labelled landmarks (nav Primary/Breadcrumb, skip link, named form); 0 unnamed interactive elements in the AX tree on all 4 pages tested; `label for=`, `fieldset/legend`, full `autocomplete` tokens, `inputmode`; `role=alert aria-live=assertive` error summary with per-field `aria-describedby`; thank-you replaces the form with a focused `role=status`; hours, `tel:` and `mailto:` fallbacks.
- Quote-intent structured data present (CleaningService with hours, areaServed, catalog; Service on the office page). JAN-PRO has none on its quote path and hides its form until scroll.

### Findings

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High (P1) | reCAPTCHA v2 checkbox (loads on intent, cross-origin iframe) is the one hard stop for an agent completing a quote; a risk-based image challenge may follow | https://www.evergreencleaningservice.ca/request-a-quote/ | Keep phone/mailto prominent; consider invisible/score-based protection (reCAPTCHA v3, Turnstile managed) for the hot path; callback alternative if spam controls allow. Tied to the quote-form decision in `ACTION-PLAN.md` |
| Medium (P2) | Service checkboxes do not match site service names (no Industrial & Warehouse or Post-Construction; "Reno Construction Clean-up"); no facility type/size/frequency fields; required state only via "*" (no `aria-required`), City/Province/Postal carry no required cue | same URL | Align names; optional facility fields; `aria-required="true"` |
| Medium (P2) | Schema lacks `Service.availableChannel`/`offers`/`potentialAction`; areaServed granularity inconsistent with form datalist (Etobicoke, Scarborough, North York, regions); "as soon as possible" (in-page) vs "within 2 hours" (`/thank-you/`) | https://www.evergreencleaningservice.ca/thank-you/ | Add ServiceChannel → `/request-a-quote/`; one response-time statement, machine-readable |
| Low (P3) | Honeypot `onHoneypot` fakes success for any filled trap field: a DOM-filling agent loses the lead silently; home h3 "WE ARE ACCEPTING NEW CLEANING CLIENTS." and footer H2s are odd | `src/lib/quick-quote.ts` | Neutral message advising a phone call; heading clean-up |
| Low | No `/llms.txt`, `ai-catalog.json`, WebMCP annotations, Markdown delivery (absent on both sites; no ranking claim) | `agentic.md` §6 | Optional; `llms.txt` adds one counted Lighthouse audit |

---

## 14. Competitor note: JAN-PRO

- **Which JAN-PRO matters.** jan-pro.com is the US franchisor (`areaServed: US`, `lang="en-US"`, ZIP finder, franchise recruiting shares the homepage). Toronto is served by **jan-pro.ca** (JAN-PRO Canada: Toronto East at 1050 McNicoll Ave, 4.8 from 366 reviews; Toronto West at 2295 Dunwin Dr, Mississauga, 4.9 from 211; Durham 5.0 from 209), with "4.8★ average quality rating", "700+ Toronto clients", "$250 a month" from-price, a written guarantee, a named Regional Director with bio, WHMIS/WSIB language, an `llms.txt`, and EN/FR with WPML (technically clean hreflang but `fr-FR`/`en-US` codes on a Canadian business).
- **Where Evergreen is ahead (on the page).** Readability (grade 8 vs 12–14), FAQs and scope/limits sections (JAN-PRO has none), price-factor lists, local-business schema (NAP, geo, hours, areaServed vs JAN-PRO's generic Organization), AVIF/WebP delivery, mobile TBT vs jan-pro.ca (442 vs 2,009 ms), agent readiness (form visible on load, labelled controls), Toronto geo in title/H1, sticky header with phone, 4.78:1 CTA contrast, no franchise/customer intent split.
- **Where JAN-PRO is ahead (mostly off the page).** Review volume (786 vs 10 in the GTA), three GBP pins with real local addresses, 25 industry pages and about 15 service pages (`industries-sitemap.xml`), named systems and proof (TRACKER inspections, MedMetrix, EnviroShield, "98.7% retention", Entrepreneur #1, BBB A+), `WebPage.dateModified` within the last 3 months, photographed uniformed staff, 18 px body text and a persistent bottom action bar, OG meta completeness, width/height on all images, domain authority (PageRank 34× floor, 20+ years of history).
- **What not to copy.** `&amp;` in JSON-LD strings, string breadcrumb positions, `alt="null"` icons, hidden-until-scroll quote form, Crawl-delay 10, `fr-FR` codes, US compliance language (OSHA/CDC/EPA). Evergreen can out-position with Canadian specifics (WSIB clearance, OHSA/WHMIS 2015, Health Canada DIN disinfectants, IPAC Canada/PIDAC, RCDSO for dental, AODA) once the client confirms they are true.
- **Comparison content.** `competitor-pages/RECOMMENDATIONS.md` recommends one trademark-free page, `/franchise-vs-local-commercial-cleaning-company-toronto/`, with sourced dated matrix, author, disclosure and quarterly review; a head-to-head page only if Search Console later shows "jan-pro" queries; no "alternatives" roundups or complaint content; PPC brand bidding only with counsel and never with the mark in ad copy. Pre-launch: publish a written Evergreen guarantee and obtain the live GBP rating, or the honest matrix favours JAN-PRO on the two rows buyers read first.
- **French.** `hreflang.md`: not now. Francophones are 2.8% of Toronto, GTA B2B buyers issue RFQs in English, FR Toronto SERPs are job boards and Quebec firms; full translation would cost about CAD 9–14k plus ongoing maintenance. Keep `en-CA`; revisit if a francophone institutional client lands or GSC shows French impressions.

---

## 15. Where to go next

- **`ACTION-PLAN.md`**: every finding above as a prioritised item with fix, evidence, effort, owner and the metric that proves it, in four phases. Measurement and access items come first; the 22 Oct 2026 quote-form revert is flagged as a client decision.
- **`SEO-PLAN.md`**: the 12-month roadmap (Foundation → Expansion → Scale → Authority) with KPIs and the client-intake dependencies (A1–A12, B1–B6, C1–C5, D1–D6).
- **`PROGRAMMATIC-PLAN.md`**: the location-page gate (60% unique, 3 verifiable facts), the `LocationEvidence` data model, the Tier 0 rewrite list and the 14-URL ceiling.
- **`FLOW-ANALYSIS.md`** §6: the five highest-leverage moves and the evidence that proves each worked.
- **`briefs/`**: six publish-ready content briefs (janitorial, floor stripping and waxing, warehouses and logistics, day porter, office cleaning improvement, medical and dental clinics improvement), each with a claims-to-verify table.
- **`competitor-pages/`**: comparison-page spec, JSON-LD and keyword strategy.
- **`drift/baseline-2026-10-28.json`**: the known-good snapshot of 78 URLs to diff after every deploy.

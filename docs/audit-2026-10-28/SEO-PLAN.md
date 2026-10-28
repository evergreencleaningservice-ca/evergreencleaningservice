# Evergreen Office Cleaning: Strategic SEO Plan (12 months)

**Client:** Evergreen Office Cleaning (legal/former name Evergreen Cleaning Service), https://www.evergreencleaningservice.ca
**Prepared by:** 10XiD
**Date:** 2026-10-28
**Template applied:** `local-service.md` (claude-seo seo-plan), adapted for a B2B commercial-cleaning, service-area business with one office (243 Queen St W, Toronto) serving the GTA since 1989.

## How this plan was produced, and its limits

- **Builds on, does not repeat, the 15 Oct 2026 growth programme** (`docs/growth/*.md`): header hubs (Services / Industries / Service Areas), the OfferPage template, `/industries/medical-dental-clinics/`, `/industries/property-management/`, `/our-process/`, the TrustStrip, a quote form on 25 pages, noindex paid pages, reCAPTCHA-on-intent, inlined CSS, long-lived asset caching, dataLayer events. Those items are treated as done. Where this plan says "extend", it means extend that work.
- **Audit findings read today** (same scratchpad, `findings/`): `schema.md` (74/100, complete), `sitemap.md` (70/100, complete), `content.md` and `geo.md` (partial first passes). Other audit streams were still running and are not cited.
- **Competitor claims:** every competitor fact below comes from a page opened on 2026-10-28 (WebFetch or `curl`). The URL is given beside each claim. Competitor self-descriptions (ratings, client counts, retention) are reported as *their claims*, not verified.
- **SERPs are not geo-personalised to Toronto.** The search tool available here is US-based and is not a Google index. Rankings quoted are therefore *who appears for Toronto-intent queries in a non-local SERP*, which over-represents directories, franchisor hubs and job boards. Treat them as a competitor-discovery source, not as rank data. Real Toronto rank tracking (Phase 1) is a prerequisite for every KPI below.
- **No keyword-volume API.** Demand is labelled qualitatively (**High / Medium / Low / Polluted**) from SERP composition and buyer logic, not from volumes. Replace with Search Console and Google Ads search-term data as soon as access (intake D1, D3) is granted.
- **Plugin fetch scripts were not usable** in this environment; `curl` and WebFetch were used instead. Google's Rich Results Test and PageSpeed Insights could not be called.
- Cancore (cancore.ca) could not be reached from this network (connection refused on both hostnames). It is listed as an unverified name only.

---

## 1. Discovery

### 1.1 Business

| Item | Finding | Source |
|---|---|---|
| Model | B2B commercial, office, industrial and janitorial cleaning; one office; crews travel across the GTA; quote-based pricing; recurring contracts plus one-off work (post-construction, emergency, pressure washing, graffiti) | Site, `docs/growth/page-inventory.md` |
| Since | 1989 (37 years), a longer record than every competitor opened today except Auraclean (1963) and Jani-King (1969) | Site; competitor pages §2 |
| Primary conversion | Lead form (`lead_form_submission`) and phone calls; Google Ads call tracking live; no GA4; no Search Console access | `docs/growth/tracking-spec.md` |
| Google Business Profile | "Evergreen Office Cleaning", category *Janitorial service*, 5.0 from **10 reviews**, **2 photos**, listed as "Floor 1 · Green Offices Toronto Inc." at 243 Queen St W | `raw/local/gbp_cid.txt` (captured 2026-10-28) |
| Brand-name split | Site and GBP say "Evergreen Office Cleaning"; domain, logo alt, social slugs and reviewers say "Evergreen Cleaning Service"; a *separate* Maps listing "Evergreen Cleaning Services" (category *Cleaners*, 5.0 from 15 reviews, open 24 hours, (647) 831-2284) appears beside the client's in a brand search | `findings/schema.md` issue 1; `raw/local/maps_Evergreen_Cleaning_Service_Toronto.txt` |
| Site size | 73 indexable URLs: 9 service pages, 2 industry pages, 7 location pages, 3 hubs, process, about, reviews, contact, quote, gallery, green products, privacy, search, 38 blog posts (2019-12 to 2023-03) + 3 pagination pages | `findings/sitemap.md` |
| Visibility today | Evergreen appeared in **0 of 42** top-10 sets collected for Toronto commercial-cleaning queries (non-geo SERP; see limits) | `raw/cluster/serp-top10.md` |

### 1.2 Audience and buyer questions

| Buyer | Typical query intent | What they need to see |
|---|---|---|
| Office / operations manager (10-200 staff) | "office cleaning toronto", "janitorial services toronto", "office cleaning cost toronto" | After-hours, same crew, insured/WSIB, what is included, price factors, fast quote |
| Property / facility manager (multi-tenant, condo corporations) | "property management cleaning toronto", "common area cleaning", "building maintenance" | One contact across buildings, short-notice one-offs, floor care programme, references |
| Clinic manager (medical, dental) | "dental office cleaning toronto", "medical clinic cleaning" | Infection-control boundaries, product list, after-hours, discretion |
| Warehouse / logistics ops (Peel, Vaughan) | "warehouse cleaning mississauga", "industrial cleaning brampton", "floor scrubbing" | Equipment, floor strip/wax, scheduling around shifts, WSIB |
| GC / project manager | "post construction cleaning toronto commercial" | Phases (rough/final), handover standard, scope exclusions, speed |

### 1.3 Goals and constraints

- **Goal:** qualified organic leads (not form fills) for recurring office/commercial contracts first, post-construction and industrial second; measured through the lead-status fields in migration 0009 once applied.
- **Constraints:** one office (no local pack reach outside downtown Toronto); claims must be substantiated (intake A1-A12 still open); client facts needed for case studies, photos and location specifics (B1-B6, C5); no analytics history.

### 1.4 Current-state scores (from today's audit streams)

| Area | Score | Headline |
|---|---|---|
| Sitemap and architecture | 70/100 | Hygiene excellent; `/search/` indexable orphan; no `lastmod`; 0 of 7 location pages pass the 60% unique-content gate; 3 industry URLs vs JAN-PRO's 25 |
| Structured data | 74/100 | Correct single CleaningService entity; breadcrumbs missing on 7 templates; blog dates are placeholders; name/logo/geo inconsistencies |
| Content and E-E-A-T | partial | No post in 3.5 years; no bylines or visible dates; `/reviews/` has no reviews; `/about-us/` 170 words, no people; imagery appears generated; one post links out to a Toronto competitor |
| GEO / AI readiness | partial | Server-rendered, all crawlers allowed; no `llms.txt` on either Evergreen or JAN-PRO; no brand-mention footprint yet measured |
| Performance (15 Oct lab) | mobile 75-87, desktop 98-100 | Remaining TBT is the Google Ads container; homepage LCP about 4 s in lab |

---

## 2. Competitive analysis

### 2.1 Competitor set (opened 2026-10-28)

**Tier 1: national franchisors with GTA pages**

| Competitor | URL opened | What they do well | Weakness Evergreen can exploit |
|---|---|---|---|
| **JAN-PRO** (US franchisor) | https://jan-pro.com/who-we-clean/ | 19 industry pages under `/who-we-clean/` (offices, dental, medical, daycare, fitness, government, hotels, labs, property management, religious, restaurants, retail, schools, warehouses, auto, banks, apartments, industrial, other); sitemap split by type with real `lastmod` (`findings/sitemap.md` §6); 3,000 posts; owns informational SERPs: 5 of 10 results for "how to choose a commercial cleaning company", 6 of 10 for "commercial cleaning vs janitorial" (`raw/cluster/serp-top10.md` K23, K28) | Generic Organization schema with no local data; US compliance framing (OSHA, CDC, ADA); `&amp;` bug in JSON-LD; franchise and cleaning leads mixed in one form |
| **JAN-PRO Canada: Toronto West** | https://jan-pro.ca/en/office/toronto-west/ | Local phone (905) 569-1131, local address (Mississauga), named regional director, claims "96% client retention", "700+ Toronto clients", "4.8★", bonded/insured/WSIB/background-checked/WHMIS; areas list (Brampton, Caledon, Etobicoke, Mississauga, Orangeville, York, Downtown Toronto) | Office is in Mississauga, not Toronto; mobile lab score 38 (15 Oct PSI); the "Janitorial" card links to the schools page |
| **JAN-PRO Canada: Toronto East** | https://jan-pro.ca/en/office/toronto-east/ | Scarborough address, local phone, 13 named areas (Aurora to Vaughan), 3 testimonials, services list includes construction cleaning and floor stripping | No retention/rating/client-count claims on this page (inconsistent with West); director unnamed |
| **Coverall of Toronto** | https://www.coverall.com/locations/canada/toronto-support-center/commercial-cleaning-services-in-toronto--the-gta-for-offices-healthcare-tech--more/ | Long Toronto article (H2s per sector: financial/professional, tech, healthcare, retail/education); claims est. 1985, "8,000+ franchise owners", "4.7/5 from 1,000+ reviews"; industry sub-pages under `/workplaces-facilities/`; appears in 9 of the 42 SERP sets (`K1-K5, K12, K27, K31, K39`) | 800-number only; no city pages for Mississauga/Markham; franchise-sales footer; no local NAP |
| **Enviro-Master (Peel / Mississauga)** | https://enviro-master.com/commercial-cleaning-locations/peel-ontario/ (redirects to the Mississauga location page) | Local owner named ("Meet the Owner"), local address (211 Watline Ave), **service × city and industry × city pages** (warehouse, gym, retail, healthcare, school/daycare, bank, hotel, parking lot, dentist); 12 named GTA areas; appears in K3, K4, K11, K18, K24, K25 | Washroom-hygiene franchise, not a janitorial contractor; thin programmatic pages; US-centric trust copy ("fastest growing privately held companies in the US") |

**Tier 2: Toronto independents with the strongest sites**

| Competitor | URL opened | What they do well | Weakness |
|---|---|---|---|
| **MCA Group** (North York, since 1993) | https://www.mcagroup.ca/ | Claims 140 Google reviews, 5,000+ businesses, 96.2% approval, 99.9% retention; menus for 14 industry/service pages (post-construction, industrial, retail, daycare, medical, school, hotel, restaurant, warehouse, dealership, food plant, gym) plus Pricing, Glossary, Case Studies, Clients; **blog posts dated October 2026**; on ThreeBestRated Toronto list | "Toronto's #1" and "Best" self-claims; handyman/painting dilute focus; Calgary and Miami locations |
| **Auraclean** (since 1963) | https://www.auraclean.com/ | ISSA, GBAC, **CIMS** certified; EcoLogo, Green Seal, BSCAI membership; client logos (BMO, McCain, Scholastic, Estee Lauder); "Smart Connect" QA reporting; city pages list incl. North York, Scarborough, Liberty Village; active blog | No industries section; H1 is "Cleaning services"; no pricing guidance |
| **CleanSpace Co.** | https://www.cleanspaceco.com/office-cleaning | Fixed recurring pricing with supplies, **published range $150-$400/visit for 500-3,000 sq ft**, WHMIS 2022 and **OHSA s.25.3 / O. Reg. 480/24 (1 Jan 2026) washroom-log** compliance copy, same-crew promise, frequency guide, comparison table, 12 GTA cities | No review count; "©2025" footer; 10+ years only |
| **Ergo Clean** (since 1986) | https://www.ergoclean.ca/ | Title "Premier Commercial Cleaning Services in Toronto & GTA \| Since 1986"; ISSA mentioned 15 times; family-owned; appears in K4, K5, K32 | Marketing superlatives; small site |
| **We Clean It** (Etobicoke, 20 years) | https://www.wecleanit.ca/ | Title "Commercial Office Cleaning Services Toronto"; ISSA, insured, bonded | Single-page internal link graph observed (1 internal `href`); thin |
| **Generations Cleaning** (Oshawa) | https://www.generationscleaning.ca/ | 13 GTA city pages, superintendent services for condos, medical/dental page, women-owned and Canadian-owned badges, client logos | Response "2-3 business days"; no founding year; name inconsistencies |
| **Take Care Cleaners** | https://takecarecleaners.com/office-cleaning-toronto/ | Title "Office Cleaning Toronto \| After-Hours Cleaners"; claims 4.9 from 400+ Google reviews; 60-point checklist; FAQs incl. medical offices and building access | Residential and Airbnb mixed with commercial; no in-person walkthrough |
| **Arelli Cleaning** | https://www.arellicleaning.com/blog/office-cleaning-companies-toronto | Publishes a self-ranked "Top 7 office cleaning companies Toronto [2026]" list (ranks itself first; lists JAN-PRO, Jani-King, ServiceMaster, Bark, HomeStars, YellowPages); Evergreen is **not** mentioned | Inconsistent award years; promotional |
| Mediclean | https://www.mediclean.ca/ | Medical/hospitality niche; appears in "best" searches | Two H1s ("BEST JANITORIAL SERVICE TORONTO", "We're Here"); title "Toronto's Best Janitorial Service" |

**Directories and marketplaces that occupy Toronto SERPs** (not competitors, but citation targets): HomeStars `/cleaning/office-cleaner-pros/toronto` (quotes $30-$60/hr), YellowPages.ca, ThreeBestRated Toronto commercial cleaning, Bark, Canadian Business Directory (chamberofcommerce.com), CleanLink news (all seen in `raw/cluster/serp-top10.md`).

### 2.2 Gap analysis against Evergreen

| Dimension | Competitors' position | Evergreen today | Gap to close |
|---|---|---|---|
| Industry pages | JAN-PRO 19-25, MCA 12+, Coverall 9, Enviro-Master ~20 per city | 2 (+ hub) | Build 6-7 more over 12 months, evidence-gated (§4.1) |
| Location pages | JAN-PRO.ca 2 offices with 7-13 named areas; Generations 13; CleanSpace 12 named cities | 7 pages, all under 60% unique | Enrich before adding; Toronto-district pages only with facts (§4.2) |
| Pricing transparency | CleanSpace publishes a per-visit range; HomeStars $30-$60/hr; Arelli cites JAN-PRO "$225/month", ServiceMaster "$250/month" | "What affects the price" list, no figures (paid pages: from $30/hr with fine print) | Publish an honest cost guide with ranges once A7 confirms (§4.4) |
| Compliance copy | CleanSpace cites OHSA s.25.3 / O. Reg. 480/24 washroom logs, WHMIS 2022; JAN-PRO.ca WSIB/WHMIS/confidentiality | WSIB, bonded, insured on TrustStrip; no WHMIS/OHSA/washroom-log content | Add an Ontario compliance section + downloadable sample log (§4.4), subject to A1 |
| Reviews | MCA "140 Google reviews", Take Care "400+", Coverall "1,000+" (claims) | 10 Google reviews, 5.0; `/reviews/` page empty | Review-velocity programme (§6.3); fill `/reviews/` from real Google reviews |
| Certifications | Auraclean ISSA/GBAC/CIMS; Ergo Clean and We Clean It ISSA | None shown | ISSA Canada membership and CIMS roadmap as an authority lever (§7) |
| People | JAN-PRO.ca names a regional director; Enviro-Master names the owner; MCA, Auraclean show client logos | No named person; About 170 words | Owner/account-exec bios, real photos (§4.5) |
| Freshness | MCA posts dated Oct 2026; JAN-PRO ~3,000 posts | Last post 2023-03 | Refresh 10 posts, publish 2/month (§4.3) |
| Informational SERPs | JAN-PRO owns "how to choose", "janitorial vs commercial" | 2019-2023 posts, 1 inlink each | Rewrite the 5 commercial-intent posts into Toronto-specific guides and link from service pages |
| Schema | Coverall/JAN-PRO: WebPage node with real dates, ImageObject logo | Stronger local entity than both; missing breadcrumbs/dates | Implement `findings/schema.md` §5 |
| Local entity | JAN-PRO.ca has Toronto West/East offices with local numbers | One Queen St W office, GBP with 2 photos | Make the one office count: Toronto page + GBP depth (§6) |

### 2.3 E-E-A-T and authority estimate (qualitative, no DA tool available)

| Competitor | Estimated authority | Why |
|---|---|---|
| jan-pro.com / jan-pro.ca | Very high / high | National brand, thousands of pages, media and franchise press |
| coverall.com | Very high | National; cited in multiple Toronto SERP sets |
| enviro-master.com | High | National programmatic footprint |
| mcagroup.ca, auraclean.com | Medium | 30-60 years, client logos, certifications, active blogs, ThreeBestRated/awards |
| cleanspaceco.com, ergoclean.ca, generationscleaning.ca, takecarecleaners.com | Low-medium | Small independents; review volume is their main signal |
| **evergreencleaningservice.ca** | **Low** | 37-year history not yet expressed as people, proof or citations; 10 reviews; no certifications shown; dormant blog |

Evergreen cannot out-publish the franchisors. It can out-*prove* the independents: longest Toronto record after Auraclean, a real downtown address, honest location copy, a cleaner entity graph than JAN-PRO. The plan is **depth over breadth**: fewer pages, each with evidence competitors do not have.

---

## 3. Architecture design (local-service template, adapted)

### 3.1 Target URL hierarchy (end of month 12)

```
/                                    Home (done 15 Oct)
/services/                           Hub (done)
  /services/office-cleaning/         + cost guide link, compliance section
  /services/commercial-cleaning/
  /services/building-maintenance/    (floor care: strip/wax, carpet)
  /services/industrial-cleaning/     rewrite to template depth
  /services/disinfection-cleaning/   rewrite (COVID-era copy, typo)
  /services/emergency-cleaning/
  /services/post-construction-cleaning/
  /services/pressure-washing/
  /services/graffiti-removal/
/industries/                         Hub (done)
  /industries/medical-dental-clinics/     (done)
  /industries/property-management/        (done)
  /industries/industrial-warehouse/       NEW P1  Q1
  /industries/retail/                     NEW P1  Q1
  /industries/education-daycares/         NEW P1  Q2
  /industries/offices-professional-firms/ NEW P2  Q2 (short buyer guide; the service page stays canonical for "office cleaning")
  /industries/hospitality-restaurants/    NEW P2  Q3 (needs client facts)
  /industries/fitness-recreation/         NEW P3  Q3-Q4 only with evidence
  /industries/government-public/          NEW P3  only with evidence
/locations/                          Hub (done): link every named area (no bare text)
  /locations/toronto/                RENAME of toronto-downtown (301), rebuilt as the office page
  /locations/etobicoke/              enrich
  /locations/mississauga/            enrich to 60%+
  /locations/vaughan/                enrich to 60%+
  /locations/brampton/               enrich or fold into Mississauga ("Peel")
  /locations/markham/                enrich or fold into "York Region"
  /locations/oakville/               enrich or noindex
  /locations/north-york/             NEW only with 3+ verified facts (Q2-Q3)
  /locations/scarborough/            NEW only with 3+ verified facts (Q2-Q3)
  /locations/durham-region/          NEW combined page only if client confirms travel (Q4)
/our-process/                        (done) + QA routine once B1 supplied
/pricing/ (or /office-cleaning-cost-toronto/)  NEW Q1-Q2 cost guide (depends on A7)
/about-us/                           rebuild: people, history, equipment, photos
/reviews/                            rebuild: real Google reviews, no aggregateRating
/projects/                           hub + case studies (template exists; gate on B4)
/insights/                           blog hub; posts stay at root slugs (no URL change)
/request-a-quote/, /contact-us/      (done)
/lp/*                                noindex paid pages (done)
```

Quality gates (template, enforced):
- Location pages: **max 12** total (well under the 30 warning); each must reach **60%+ unique main text** and **3 verifiable local facts** before indexing; re-measure with the 5-word-shingle method in `findings/sitemap.md` §4.
- Industry pages: 800+ words, <40% overlap with sibling and service pages, own FAQ and `industry-<slug>` form id (pattern exists).
- **No service × city cross-product** (would be ~108 near-duplicates). The only cross-product pages allowed are compliance-distinct ones (e.g. post-construction × medical) and only in year 2.

### 3.2 Internal linking plan

1. **Service ↔ industry ↔ location triangle.** Every industry page links to 2-4 services and the 2-3 locations where that industry clusters (warehouse → Mississauga, Brampton, Vaughan; clinics → Toronto, Etobicoke, Mississauga). Every location page links to the industries that dominate it.
2. **Blog → money pages.** Each refreshed post gets 2-3 contextual links to a service/industry page (today most posts link only to `/about-us/` and `/contact-us/`, `findings/content.md`). Remove the outbound link with anchor "Toronto office cleaners" to a competitor on `/ask-the-office-cleaners-cleaning-break-rooms/`.
3. **Money pages → blog.** "Related reading" block on the OfferPage template: dental checklist → clinics page; retail checklist → retail page; daycare protocols → education page; how-to-decide → process page.
4. **Hub lists.** `/locations/` turns the six uncovered area names into links (to the nearest page or an anchored section).
5. **Tag sidebar** capped at 5-8 tags (26 noindex tag pages are linked from 49 pages today).
6. **Breadcrumbs** on every template, matching the BreadcrumbList fix.

### 3.3 Sitemap structure

Adopt the type-split from `findings/sitemap.md` §6: `sitemap-pages`, `-services`, `-industries`, `-locations`, `-insights`, each with real `lastmod` (git content date or `pubDate`/`updatedDate`), index with newest child lastmod. Remove `/search/`, `/insights/page/N/`, `/privacy/`. Point the Worker's `injectSitemap` at `sitemap-insights.xml`.

---

## 4. Content strategy

### 4.1 Industry pages (evidence-gated, in priority order)

| Page | Demand (qualitative) | Evidence already in repo | Competitor benchmark | Quarter |
|---|---|---|---|---|
| Industrial, warehouse and logistics | **High** in Peel/Vaughan buyer logic; SERP polluted by job posts (`K14, K31`), which means a real service page faces weak competition | Brampton/Mississauga copy lead with warehouses; draft case study "warehouse floor clean and wax (~50,000 sq ft)" | JAN-PRO `/who-we-clean/industrial-manufacturing/warehouses/`; Enviro-Master Mississauga warehouse page; MCA warehouse page | Q1 |
| Retail stores and showrooms | Medium; `K15` shows JAN-PRO retail page ranking, few local pages | `a-cleaning-checklist-for-your-retail-store` post | JAN-PRO retail; MCA retail; Enviro-Master retail × city | Q1 |
| Education, daycares and schools | Medium; `K16/K17` mostly jobs and wiuwi spam, open field for a real page | `cleaning-protocols-for-daycares-and-schools` post | JAN-PRO day-care and schools pages; Coverall education | Q2 |
| Offices and professional firms (buyer guide) | High intent but overlaps the service page | `/services/office-cleaning/` (1,563 words) | CleanSpace office-type programmes (law, finance, tech, coworking) | Q2, short page that routes to the service |
| Hospitality and restaurants | Medium; needs client facts (B6) | Hub mention only | JAN-PRO restaurants, hotels; MCA hotel/restaurant | Q3 |
| Fitness and recreation | Low-medium; `K18` dominated by Enviro-Master | None | Enviro-Master gym pages; JAN-PRO fitness | Q3-Q4, only with a client |
| Government / public, banks, auto, religious | Low for Evergreen unless they have the work | None | JAN-PRO has all four | Only if B6 names them |

Each page follows the existing OfferPage structure plus: *who it is for; what we clean by area; frequency and timing (shift patterns, after close); compliance and products relevant to the vertical (Ontario framing: WHMIS, OHSA, Public Health Ontario guidance for clinics and daycares); scope limits; pricing factors; a review from that vertical (even one); FAQ; related services and areas.* Avoid US OSHA/CDC/ADA framing used by JAN-PRO and Coverall.

### 4.2 Location pages: enrich before expanding

Order and content source:

1. **Toronto** (rename `toronto-downtown` → `toronto`, 301): the office page. Office towers, PATH-connected buildings, King/Queen West creative offices, condo corporations, heritage buildings; access and freight-elevator rules; GBP tie-in; owner photo at 243 Queen St W. Target: pass 60% gate in Q1.
2. **Mississauga** and **Vaughan**: already client-written (Airport Corporate Centre, Hurontario, Meadowvale; Concord, VMC). Add 300-400 words: facility types served, one project, after-hours access norms, a city-attributed review. Q1.
3. **Etobicoke**: nearest neighbour to the office; Airport Rd/Dixon Rd industrial, Islington/Bloor offices. Q2.
4. **Brampton, Markham, Oakville**: 90-day deadline from Q1 start. Enrich with C5 data and client facts, or consolidate (Brampton → Peel section on Mississauga; Markham → "York Region" with Richmond Hill; Oakville → noindex until evidence).
5. **North York, Scarborough**: build in Q2-Q3 only if the client supplies 3+ real facts each (buildings/districts served, client types, a project). These are inside the City of Toronto and larger commercial districts than Oakville.
6. **Durham Region** (Pickering, Ajax, Oshawa): one combined page in Q4, only if the client confirms they still travel there (C3).

Gate: no new location URL until the existing ones pass. Pull Search Console and Google Ads search terms by city (D1, D3) in Phase 1 to settle C5.

### 4.3 Blog: prune, refresh, then publish

**Prune/consolidate (Q1).** Of 38 posts, the COVID cluster (`be-safe-from-coronavirus-work`, `clean-and-disinfect-public-areas-during-covid-19`, `coronavirus-bringing-more-urgency-cleaning`, `covid-19-commercial-cleaning-expectations-examined`, `the-return-of-employees-post-covid-19…`, `does-hand-sanitization…`, `importance-of-hand-washing`) is dated. Merge into one evergreen "Workplace disinfection: what still matters in 2026" guide; 301 the rest to it. Posts with no commercial relevance (`keep-your-office-at-home-clean`, `how-to-take-care-of-plants-in-the-office`, `robotic-vs-manual-cleaning`) are candidates for 301 to the nearest hub or deletion after checking inlinks/backlinks.

**Refresh (Q1-Q2), 10 posts with commercial intent**, each rewritten for Toronto/Ontario, given a visible date and author, list markup, and links to money pages: dental checklist; retail checklist; daycares/schools protocols; how to decide on a cleaning company (JAN-PRO owns this SERP; a Toronto-specific angle with WSIB clearance certificates, insurance proof, Ontario references); benefits of regular commercial cleaning; day vs night routine; commercial deep cleaning benefits; floor care tips; winter checklist (salt and matting for Toronto winters); slips/trips/falls (Ontario OHSA).

**New posts (2 per month from Q2 = ~18 in the year), pillar/cluster**:

| Pillar (money page) | Cluster posts |
|---|---|
| Office cleaning (service) + cost guide | How much does office cleaning cost in Toronto (per visit, per sq ft, factors); commercial cleaning vs janitorial: what Toronto buyers actually get; how often should an office be cleaned (by headcount and use); what a cleaning proposal should include; how to switch cleaning companies without a gap; after-hours access and alarm protocols |
| Compliance (service pages, process) | Ontario washroom-cleaning records: what O. Reg. 480/24 requires of workplaces (plain-language explainer, link to the regulation); WHMIS and SDS: what your cleaner should hand you; WSIB clearance certificates: how to check a vendor |
| Property management (industry) | Condo common-area cleaning scope template; turnover cleaning timelines; coordinating cleaners with building security |
| Industrial / warehouse (industry) | Floor strip and wax: when, how, downtime; dock and racking dust control; cleaning around shift patterns |
| Post-construction (service) | Rough vs final clean checklist; what GCs should put in the cleaning line item |
| Clinics (industry) | What a cleaning company may and may not touch in a dental operatory; Public Health Ontario environmental cleaning references for clinics |

Rules: every post has a named author with a bio (owner or account executive, A2), a visible published/updated date, original photos where possible, and 2-3 internal links to money pages. No post is published for freshness alone.

### 4.4 Conversion-content that competitors already have

- **Cost guide** (`/pricing/` or `/office-cleaning-cost-toronto/`): CleanSpace publishes $150-$400/visit; HomeStars $30-$60/hr; Arelli cites JAN-PRO/ServiceMaster monthly starting prices. Publish real ranges with the drivers list that already exists (`PRICING_FACTORS`), once A7 confirms what may be said publicly. Quotable figures are a GEO asset too.
- **Ontario compliance section** on `/services/office-cleaning/` and `/our-process/`: washroom-cleaning records, WHMIS 2022, WSIB clearance, insurance certificate on request, confidentiality agreements. Depends on A1 and B1. Offer a downloadable sample washroom-cleaning log (PDF) as a link magnet.
- **`/reviews/`**: replace the empty testimonials page with the 10 Google reviews verbatim (named, dated), the existing homepage quotes, and a "leave a review" link. No `aggregateRating` (policy, `findings/schema.md`).
- **Case studies** (`/projects/`): publish the warehouse floor case study first (B4 approvals), then one clinic and one property-management study. Each becomes the proof block on its industry page.

### 4.5 E-E-A-T plan

| Signal | Action | Dependency |
|---|---|---|
| Experience | Case studies with photos of Evergreen's own work; "what we clean by area" written from crew practice; replace generated imagery on service pages | B4, B5 |
| Expertise | Named author bios (owner, account executive) with years in the trade; WHMIS/other training stated honestly | A2, client |
| Authoritativeness | ISSA Canada membership, BOMA Toronto affiliate membership, Toronto Region Board of Trade; client logos with permission; mentions on curated lists (§7) | Budget decision |
| Trust | Full NAP + hours + photos on GBP; insurance/WSIB stated identically on site and GBP; privacy page updated for Ads/call tracking (tracking-spec A9); visible dates on posts | A1, legal review |

---

## 5. Technical foundation

Status: the big performance items were done on 15 Oct. What remains is hygiene, entity clarity and measurement. Items are ordered by effort-to-impact.

### 5.1 Quick fixes (Phase 1, weeks 1-4)

| # | Fix | Source |
|---|---|---|
| T1 | `/search/`: remove from sitemap, `noindex, follow` | sitemap.md §2.1 |
| T2 | Drop `/insights/page/2-4/` and `/privacy/` from the sitemap; keep crawlable | sitemap.md |
| T3 | Slashless URLs return 307; change to 301/308 at Cloudflare/Astro | sitemap.md §1 |
| T4 | BreadcrumbList on `/services/`, `/locations/`, all `/locations/*`, `/about-us/`, `/reviews/`, `/contact-us/`, `/request-a-quote/` | schema.md §4.1 |
| T5 | Site-wide entity: `alternateName` "Evergreen Cleaning Service", `foundingDate` 1989, `ImageObject` square logo, geo from the GBP pin (C1 suggests 43.6496, -79.3925), `contactPoint`, `knowsAbout`, offer catalog items with URLs and `@id`s | schema.md §5a |
| T6 | Blog dates: real ISO timestamps with Toronto offset, `updatedDate` field in `src/content.config.ts`, visible published/updated line and byline; `dateModified` only on substantive edits | schema.md §4.2 |
| T7 | Fix the competitor outbound link in the break-rooms post; fix "psychically" typo and COVID-era copy on `/services/disinfection-cleaning/` | content.md |
| T8 | Confirm `/reviews/` is not a JS-render failure, then rebuild (§4.4) | schema.md, content.md |
| T9 | Note: the homepage HTML carries four SVG `<title>` elements from the Trustindex badge ("Trustindex verifies…"). They are not document titles and do not affect Google, but some crawlers conflate them; add `aria-hidden`/`<desc>` or drop the SVG `<title>` to keep audits clean | raw/technical/crawl.csv |

### 5.2 Structural (Phase 2, weeks 5-12)

- Type-split sitemap with real `lastmod` (§3.3).
- `WebPage` node per template with `dateModified`, `primaryImageOfPage`, `about` → the page's `Service` `@id` (schema.md §5b-5d). `AboutPage`, `ContactPage`, `CollectionPage`/`ItemList` on hubs.
- Rename `/locations/toronto-downtown/` → `/locations/toronto/` with 301; update internal links and breadcrumb.
- Breadcrumb for posts should pass through `/insights/` not the noindex `/category/blog/`.
- B2 image cache: raise `max-age` to 30 days in `scripts/b2-sync.mjs` at the next approved deploy (performance.md §5).

### 5.3 Core Web Vitals targets

| Metric | 15 Oct lab (mobile) | 12-month target (field, p75) |
|---|---|---|
| LCP | home ~4.1 s; service ~2.1 s | ≤ 2.5 s on all templates |
| INP | not measurable (no CrUX) | ≤ 200 ms |
| CLS | 0 | ≤ 0.1 |
| Mobile Lighthouse | 75-87 | 85+ on home and service templates |

Levers left: the Google Ads container is most of the remaining blocking time (gtag ~400 ms, gtm ~300 ms). Options for the advertising owner: consolidate to one Google tag, add GA4 as a single tag rather than alongside, and decide whether to delay non-call-tracking tags until interaction (call-tracking swap must stay eager). Homepage LCP variance is main-thread contention, not discovery, so no preload fix applies.

### 5.4 Measurement stack (prerequisite for every KPI)

1. **Google Search Console**: verify `sc-domain:evergreencleaningservice.ca`; submit the split sitemaps; export queries by page and by city term monthly.
2. **GA4**: create a property, wire it in GTM as a single tag, add Custom Event triggers for `form_start`, `phone_click`, `email_click`, `quote_cta_click`, `lead_form_error` (tracking-spec A4-A5); blocking trigger for `site_environment = staging` (A6).
3. **Lead quality**: apply migration 0009 (with a Neon snapshot), run the weekly 15-minute lead review (ppc-blueprint §7), and tag organic leads by `form_id`/landing page.
4. **Rank tracking geo-located to Toronto** (and Mississauga, Vaughan, Scarborough) for the 40-keyword set below; the SERPs used in this plan were not local.
5. **GBP Performance** monthly export: calls, website clicks, direction requests, search terms.
6. **AI visibility log**: monthly, ask ChatGPT, Perplexity, Google AI Mode and Copilot 10 fixed prompts ("best office cleaning company in Toronto", "dental clinic cleaning Toronto", "warehouse cleaning Mississauga", …) and record whether Evergreen is named and which sources are cited (Whitespark 2026 ranks curated-list presence as the top AI-visibility factor; https://whitespark.ca/local-search-ranking-factors/).

### 5.5 AI search (GEO) readiness

- Already good: server-rendered HTML, all AI crawlers allowed, honest FAQs, consistent NAP in schema (`findings/geo.md`).
- Add: visible dates and authors (T6); quotable, specific facts on every page ("since 1989", "one office at 243 Queen St W", crew-travel statement, price ranges once approved, "we reply within N hours" if A6 confirms); an `llms.txt` (JAN-PRO Canada publishes one at https://jan-pro.ca/en/llms.txt; Evergreen and jan-pro.com have none) listing the 20 money pages with one-line descriptions; `Service.audience` BusinessAudience to signal B2B.
- Earn: presence on curated Toronto lists (ThreeBestRated, Clutch/GoodFirms if applicable, Toronto Board of Trade directory, BOMA Toronto member directory, HomeStars with verified reviews) because those are what AI answers cite today.
- Do not: add `aggregateRating`, `HowTo`, per-city `LocalBusiness` nodes, or FAQPage to new pages for SERP reasons (FAQ rich results ended 2026-05-07; markup remains valid, see https://ppc.land/google-kills-faq-rich-results-what-seos-saw-coming-since-2019/).

---

## 6. Local strategy

Reality check: one office means the local pack is reachable mainly for downtown-Toronto searches and for searchers whose location is near Queen St W. Every other city is a blue-link play. The local programme therefore concentrates on making the single profile as complete as a JAN-PRO regional office page, and on citations/reviews that both Maps and AI answers consume.

### 6.1 Google Business Profile (Phase 1)

| Item | Today | Action |
|---|---|---|
| Name | "Evergreen Office Cleaning" | Keep; align the website `legalName`/`alternateName`, social handles and logo alt so Google sees one entity |
| Categories | Janitorial service | Add secondary: Commercial cleaning service, Office cleaning service (if available), Carpet cleaning service / Pressure washing service only if offered as standalone |
| Photos | 2 | Target 30+: exterior at 243 Queen St W, crew, equipment, before/after (own work only; B5) ; add monthly |
| Services | unknown | List every service page with a 300-char description and link |
| Service areas | unknown | Named cities only (Google disallows provinces; max 20): Toronto, Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Oakville, Pickering, Ajax, Oshawa (10, matching `coverage.ts`); do not stack edits with name/address changes |
| Hours | Mon-Fri 7-22, Sat-Sun 8-20 | Confirm these are enquiry hours (C4); keep accurate, hours are a top local factor |
| Description | unknown | 750 chars using the approved claims list (ppc-blueprint §5) |
| Products/Posts | none seen | Monthly post (seasonal: salt-season floor care, year-end deep clean, post-construction) |
| Reviews | 10, owner replies present | Reply to all; see 6.3 |
| Address line | "Floor 1 · Green Offices Toronto Inc." | Confirm this suite label is wanted; it names a different company |

### 6.2 Brand-confusion item

A second Maps listing "Evergreen Cleaning Services" (5.0, 15 reviews, category Cleaners, open 24 hours, (647) 831-2284) appears next to the client's for a brand search. Determine whether it is (a) an old duplicate of the client's own profile (then merge/claim, moving 15 reviews), or (b) another business (then sharpen differentiation: "Office" in the name everywhere, B2B wording, and a knowledge-panel-friendly About page). Either way, this is Phase 1.

### 6.3 Reviews programme

- Ask at two moments: 30 days after a new contract starts, and after any one-off job the client praised. Use a short link to the GBP review form in the account executive's follow-up email; add it to invoices.
- Target velocity: 2-3 new Google reviews per month (10 → 40 in 12 months), descriptive, with the industry named ("our dental clinic", "our warehouse in Mississauga") because Google and AI answers surface review text.
- Mirror the newest reviews on `/reviews/` and the relevant industry/location pages (verbatim, dated, no markup).
- Also seed HomeStars (dominant in Toronto SERPs) and ThreeBestRated nomination; do not buy or incentivise reviews.

### 6.4 Citations and NAP

- Core: Google, Apple Business Connect, Bing Places, Yelp Canada, YellowPages.ca, 411.ca, Canada411, HomeStars, Bark, Canadian Business Directory, BBB (accreditation optional), Toronto Region Board of Trade member directory, BOMA Toronto directory (if member), ISSA Canada member directory.
- Rule: identical name, address format ("243 Queen St W, Toronto, ON M5V 1Z4"), phone (416) 803-4880 and URL everywhere; fix the old "Evergreen Cleaning Service" listings rather than creating new ones.

### 6.5 Local content

- The Toronto page carries the office story and the GBP embed/`hasMap`.
- Each enriched city page names 3+ real districts/facility types and states honestly where crews come from (already the pattern).
- Seasonal GBP posts and blog posts tied to Toronto conditions (salt season, spring window season, year-end office deep cleans).

---

## 7. Authority plan (links, mentions, lists)

Evergreen has no backlink tool access in this environment; the plan assumes a low-authority baseline and prioritises **mentions that AI answers and Maps also use**.

| Lever | Target | Why / evidence | Quarter |
|---|---|---|---|
| Industry membership | ISSA Canada (member directory listing); BOMA Toronto affiliate/associate member; Toronto Region Board of Trade; Mississauga Board of Trade | Auraclean, Ergo Clean and We Clean It display ISSA; BOMA Toronto puts Evergreen in front of property managers (its primary buyer) and yields a directory link | Q1 decision, Q2 live |
| Curated lists | ThreeBestRated Toronto (commercial cleaning / janitorial), Clutch or GoodFirms (if a cleaning category exists), local "best of" roundups by non-competitor publishers | Whitespark 2026: curated-list presence is the top AI-visibility factor; MCA Group is on ThreeBestRated today | Q1-Q2 |
| Supplier/partner pages | Armstrong ProSeries Green (if A5 confirms), equipment suppliers, the building at 243 Queen St W | Low effort, relevant | Q2 |
| Client testimonials with logo permission | 5-8 clients across offices, clinics, property management | MCA and Auraclean show logos; Evergreen shows none | Q2-Q3 |
| Case studies as linkable assets | Warehouse floor case study; clinic; condo corporation | Property-management blogs and condo-board newsletters link to practical scope docs | Q2-Q4 |
| Data/explainer piece | "What Toronto offices pay for cleaning in 2027" (ranges by size and frequency, based on Evergreen quotes, anonymised) and the Ontario washroom-record explainer | CleanSpace and HomeStars already rank on pricing; a Toronto-specific, dated source earns citations | Q3 |
| Local press / community | Queen West BIA, condo/property-management associations (ACMO events), trade publications (CleanLink appears in Toronto SERPs) | Mentions, not just links | Q3-Q4 |
| Reclaim | Any old links pointing to `/blog/...` or `evergreencleaningservice.ca` without www: redirects exist (154 rules); verify in Search Console once available | Preserves equity | Q1 |

Not recommended: paid directories beyond the core set, guest-post networks, reciprocal links with other cleaners.

---

## 8. Keyword map (qualitative demand, from SERP composition)

| Cluster | Target page | Demand | SERP character observed (non-geo) |
|---|---|---|---|
| office cleaning toronto / office cleaning services toronto / office cleaning company toronto | `/services/office-cleaning/` | High | Coverall article, HomeStars, Notion/wiuwi spam: weak local pages, winnable |
| commercial cleaning toronto / company / services gta | `/services/commercial-cleaning/` | High | Coverall, Enviro-Master, Ergo Clean, directories |
| janitorial services toronto | `/services/commercial-cleaning/` (secondary: office) | High | Swift, Gemini, Coverall, directories |
| office cleaning cost toronto / how much does office cleaning cost | cost guide | Medium | HomeStars price guide, Hellamaid, Airtasker: no commercial Toronto contractor owns it |
| post construction cleaning toronto commercial | `/services/post-construction-cleaning/` | Medium | Hellamaid pricing guide, RenoQuotes directories, residential noise |
| warehouse cleaning mississauga / industrial cleaning toronto | `/industries/industrial-warehouse/`, `/services/industrial-cleaning/` | Medium (polluted by jobs) | Enviro-Master, MWAC; many job posts: real page faces thin competition |
| dental office cleaning toronto / medical clinic cleaning | `/industries/medical-dental-clinics/` | Medium (polluted by dentist-navigational) | Coverall category, Clarkes, Enviro-Master |
| property management cleaning toronto / condo common area cleaning | `/industries/property-management/` | Medium (polluted by in-unit residential) | Hellamaid guides, job posts: B2B angle must be explicit in title |
| retail store cleaning toronto | `/industries/retail/` | Low-medium | JAN-PRO retail, directories |
| daycare / school cleaning toronto | `/industries/education-daycares/` | Low-medium (polluted by jobs) | wiuwi spam, Jani-King blog |
| floor stripping and waxing toronto / commercial floor cleaning | `/services/building-maintenance/` | Medium | Jani-King blog cluster, Kleen Kuip, Chem-Dry |
| disinfection services toronto | `/services/disinfection-cleaning/` | Low (post-COVID) | Enviro-Master, Rentokil, Orkin |
| commercial pressure washing toronto / graffiti removal toronto | respective service pages | Low; graffiti SERP is informational/municipal | Goodbye Graffiti, City of Toronto |
| how to choose a commercial cleaning company / janitorial vs commercial cleaning / how often should an office be cleaned | refreshed guides | Medium (informational) | JAN-PRO dominates; Toronto/Ontario angle is the differentiator |
| commercial cleaning mississauga / brampton / vaughan / etobicoke / markham / oakville | location pages | Medium (Mississauga) to Low | Enviro-Master Peel, HomeStars city pages, spam |
| day porter services toronto | none (do not build) | Polluted: 100% job intent | Dexterra job ads |

---

## 9. Implementation roadmap

### Phase 1: Foundation (weeks 1-4, Nov 2026)

- Access: Search Console, GA4 creation, GTM publish, Google Ads read-only (D1-D4); apply migration 0009 after snapshot (D5).
- Technical quick fixes T1-T9; schema entity fixes (T5) and blog dates (T6).
- GBP completion (§6.1) and the brand-confusion investigation (§6.2); core citations NAP audit.
- Rank tracking (Toronto-geolocated) and the AI-visibility prompt log set up; baseline captured.
- Client intake push on A1-A12, B1-B6, C1-C5: these unlock Phases 2-3.
- Content: rebuild `/reviews/` from real reviews; rebuild `/about-us/` with people and history; fix disinfection page copy.

### Phase 2: Expansion (weeks 5-12, Dec 2026 - Jan 2027)

- Type-split sitemap with `lastmod`; WebPage nodes; `toronto-downtown` → `toronto` rename.
- Location enrichment: Toronto, Mississauga, Vaughan to 60%+; Brampton/Markham/Oakville enrich-or-consolidate decision using Search Console/Ads city data.
- Industry pages P1: industrial/warehouse, retail (with the refreshed retail checklist post linked both ways).
- Blog prune/consolidate (COVID cluster) and first 5 refreshes with authors and dates.
- Internal-linking pass (service ↔ industry ↔ location; blog → money pages; hub area links; tag cap).
- Reviews programme live; first GBP posts and photo batches.
- Memberships decided (ISSA Canada, BOMA Toronto, Board of Trade).

### Phase 3: Scale (weeks 13-24, Feb - Apr 2027)

- Industry pages: education/daycares, offices buyer guide; hospitality if B6 supports it.
- Cost guide and Ontario compliance section + sample washroom log (depends A1, A7).
- First case study published (`/projects/`), then the second.
- North York / Scarborough pages only if facts supplied; otherwise keep hub links.
- 2 posts/month from the cluster list; remaining 5 refreshes.
- Curated-list and directory placements; supplier/partner mentions; client logo permissions.
- `llms.txt`; GEO prompt log reviewed; adjust quotable facts on pages.
- Container clean-up with the advertising owner (single Google tag, GA4 as one tag); B2 cache header change; re-run PSI and record field CWV once CrUX has data.

### Phase 4: Authority (months 7-12, May - Oct 2027)

- Data piece ("what Toronto offices pay", anonymised quotes) and the compliance explainer promoted to property-management and trade audiences.
- Remaining P2/P3 industry pages strictly on evidence; Durham Region combined page if C3 confirms.
- Third case study; testimonial/logo wall; owner/account-exec profiles and speaking/association presence.
- Quarterly content-decay review: re-measure location uniqueness, refresh any page with falling impressions, update dates only on real edits.
- Year-2 decision on compliance-distinct cross-product pages (post-construction × medical, emergency × property management).

### Quarter view (12 months from 1 Nov 2026)

| Quarter | Theme | Key deliverables | Exit criteria |
|---|---|---|---|
| **Q4 2026 (Nov-Dec)** | Foundation and measurement | GSC + GA4 + lead-status live; T1-T9; GBP complete; reviews/about rebuilt; Toronto + Mississauga + Vaughan enriched; sitemap split; brand-confusion resolved | Baselines recorded; 3 location pages pass the 60% gate; 10 → 14+ reviews |
| **Q1 2027 (Jan-Mar)** | Industry depth and blog revival | Industrial/warehouse, retail, education pages; COVID cluster consolidated; 10 posts refreshed with bylines; first 4 new posts; memberships live; HomeStars/ThreeBestRated/directories | 5 industry pages indexed; every service page has 2+ related posts; 20+ reviews |
| **Q2 2027 (Apr-Jun)** | Conversion content and proof | Cost guide; compliance section + log download; 2 case studies; offices buyer guide; hospitality page if evidenced; North York/Scarborough if evidenced; `llms.txt`; container clean-up | Organic qualified leads tracked by page; cost guide ranking for cost queries in Toronto tracking; 28+ reviews |
| **Q3 2027 (Jul-Oct)** | Authority and refresh | Data piece and PR; third case study; logo wall; Durham page if confirmed; decay review; year-2 plan | Named in at least 2 curated Toronto lists; AI prompt log shows Evergreen cited for at least 3 of 10 prompts; 36-40 reviews |

---

## 10. KPIs

Baselines are unknown for organic traffic and rankings because no Search Console or GA4 existed. Month-1 values become the baseline; targets below are set against the structural facts known today.

| Metric | Baseline (today) | 3 months | 6 months | 12 months |
|---|---|---|---|---|
| Organic qualified leads / month (form + call, `lead_status = qualified`) | not measured | measured; +25% vs month-1 | +60% | 2× month-1 |
| Toronto-geolocated top-10 rankings in the 40-keyword set | 0 of 42 in non-geo SERPs; local unknown | 8 | 15 | 25 (incl. office cleaning toronto, commercial cleaning toronto, janitorial services toronto, post construction cleaning toronto, dental office cleaning toronto, warehouse cleaning mississauga) |
| Local pack appearances (Toronto downtown grid) for "office cleaning near me"/"commercial cleaning toronto" | unknown | present in 30% of grid points | 50% | 70% |
| Google reviews (count / rating) | 10 / 5.0 | 16 / 4.9+ | 26 / 4.9+ | 40 / 4.8+ |
| GBP photos | 2 | 20 | 35 | 50 |
| Indexable pages in sitemap | 73 (68 after exclusions) | 72 | 80 | 88-92 (no thin pages) |
| Location pages passing 60% unique gate | 0 of 7 | 3 of 7 | 6 of 7 (or merged) | all live pages |
| Industry pages | 2 | 4 | 7 | 8-9 |
| Blog: posts with visible date + author / published in last 90 days | 0 / 0 | 15 / 4 | 25 / 6 | all / 6 |
| Structured-data audit score (`findings/schema.md` method) | 74 | 85 | 88 | 90 |
| Sitemap/architecture score (`findings/sitemap.md` method) | 70 | 82 | 88 | 90 |
| Core Web Vitals (mobile field p75) | no CrUX data | LCP measured | LCP ≤ 2.5 s on service pages | all three "Good" on all templates |
| Referring domains (once a tool is available) | unknown | baseline | +10 relevant (associations, directories, suppliers) | +25 |
| AI-answer citations (10 fixed prompts, 4 engines) | 0 known | 1 | 3 | 5+ |
| Curated Toronto lists naming Evergreen | 0 (Arelli's list omits it) | 1 | 2 | 3 |

### Success criteria per phase

- Phase 1: measurement live, every quick fix shipped, GBP complete, intake answers for A1-A7 received.
- Phase 2: all remaining location pages either pass the gate or have a merge decision; 2 P1 industry pages live; blog revived with authors.
- Phase 3: cost guide and compliance content live; 2 case studies; organic leads attributable by page.
- Phase 4: external mentions on 2+ curated lists; AI prompt log improving; year-2 roadmap approved.

### Dependencies and risks

| Risk | Mitigation |
|---|---|
| Client facts not supplied (A/B/C intake) | Build only evidence-gated pages; publish the technical and measurement work regardless; escalate monthly |
| Thin location/industry pages drift into doorway territory | Hard gates (60% unique, 3 facts, <40% sibling overlap), re-measured quarterly |
| Reviews stall | Make the ask part of the account executive's process, not marketing's |
| Container changes break call tracking | Advertising owner approves every GTM change; GTM Preview checks from tracking-spec §4 |
| Second "Evergreen Cleaning Services" listing captures brand searches | Resolve in Phase 1 (merge or differentiate) |
| Non-local SERP data misleads prioritisation | No KPI is judged until Toronto-geolocated tracking and Search Console are live |

---

## Appendix A: evidence URLs opened on 2026-10-28

Competitors: https://jan-pro.com/who-we-clean/ · https://jan-pro.ca/en/office/toronto-west/ · https://jan-pro.ca/en/office/toronto-east/ · https://jan-pro.ca/en/llms.txt (via raw/geo/disc) · https://www.coverall.com/locations/canada/toronto-support-center/commercial-cleaning-services-in-toronto--the-gta-for-offices-healthcare-tech--more/ · https://enviro-master.com/commercial-cleaning-locations/peel-ontario/ · https://www.mcagroup.ca/ · https://www.auraclean.com/ · https://www.cleanspaceco.com/office-cleaning · https://www.ergoclean.ca/ · https://www.wecleanit.ca/ · https://www.generationscleaning.ca/ · https://takecarecleaners.com/office-cleaning-toronto/ · https://www.arellicleaning.com/blog/office-cleaning-companies-toronto · https://www.mediclean.ca/ · (not reachable: https://www.cancore.ca/, https://www.clarkespropertyservices.com/)

Industry references: https://whitespark.ca/local-search-ranking-factors/ (2026 report; AI-visibility factors) · https://ppc.land/google-kills-faq-rich-results-what-seos-saw-coming-since-2019/ (FAQ rich results ended 2026-05-07) · https://ppc.land/google-bans-countries-and-states-from-business-profile-service-areas/ (service-area rules)

Internal: `docs/growth/README.md`, `adaptation-matrix.md`, `page-inventory.md`, `performance.md`, `tracking-spec.md`, `ppc-blueprint.md`, `client-intake.md`; audit `findings/schema.md`, `findings/sitemap.md`, `findings/content.md` (partial), `findings/geo.md` (partial); `raw/cluster/serp-top10.md`; `raw/local/*` GBP captures.

## Appendix B: what this plan deliberately does not propose

- Service × city page generation (doorway risk; see sitemap.md §7).
- New location pages before the existing seven pass the uniqueness gate.
- `aggregateRating`, per-city `LocalBusiness`, `HowTo`, or new FAQPage markup for SERP purposes.
- Copying JAN-PRO's numeric claims, proprietary system names or US compliance framing.
- Delaying the Google Ads container until interaction without the advertising owner's decision (it would break call-tracking attribution).
- Re-doing the 15 Oct work: hubs, templates, trust strip, forms, paid pages, reCAPTCHA loading, CSS inlining, asset caching.

Score: 58/100

# Search Experience (SXO): www.evergreencleaningservice.ca, 2026-11-06

This is the **SXO Gap Score** (search-experience fit). It is separate from any SEO health score. It combines the 7-dimension gap score (61/100, below) with the persona average (58/100); the persona number is the headline because it measures how well the pages serve the buyers who search these queries.

## Bottom line

The page types are mostly not the problem. Each core query has a matching Evergreen page of the right type: a service page, a local page, an industry page, or a cost guide. The pages are well written, specific, and honest about their limits. Two things keep them from ranking and converting:

1. **The SERPs for these queries reward third-party proof the site does not have.** Directories (HomeStars, Clutch, BBB, YellowPages, RenoQuotes, RenovationFind) and franchise brands (Coverall, Jani-King, Enviro-Master, Stratus) take most of the observed results. Their pages win on review volume and scale numbers. Coverall cites "4.7/5 from 1,000+ Google reviews", "50,000+ commercial customers" and a named author. Evergreen has **7 Google reviews in total, 4 of them 5 to 6 years old**. It has **no named person** on the site, **no published case study**, and **no photos of its own crews or work**. Search Console (docs/growth/README.md, 30 Oct export) shows **23 clicks in total** across the site.
2. **The one query with clear informational intent (cost) is answered with a non-answer.** `/office-cleaning-cost-toronto-guide/` is titled "2026 Pricing Guide" but says its figures are "hypothetical... not Evergreen quotes or verified GTA market averages". Competing results give numbers: HomeStars quotes $30–60/hr, Hellamaid gives $/sq ft for post-construction work, and a floor-care guide gives $0.50–2/sq ft.

## Method and limitations (read first)

- **The SERP data is not Google's.** The WebSearch tool returned a non-Google index: no local pack, no ads, no People Also Ask, no AI Overview, no rank positions. It also returned many spam results (gitbook, notion.site, pages.dev, blogspot). Page-type mix and intent are inferred from the 15–25 URLs returned per query. **I could not confirm whether Evergreen appears in the Google local pack for any query.** Evergreen did not appear in any of the 8 result sets.
- No rank tracking, CrUX or Google Business Profile (GBP) data was available. Search Console figures come from the repo's docs and were not verified.
- Page content comes from the saved HTML in `raw/crawl/html/` plus the mobile fold screenshots. The "â" mojibake in the saved HTML is a crawler artifact; the live page is correct UTF-8 (checked with curl).
- 3 competitor pages were spot-checked with WebFetch: Hellamaid Toronto commercial, Coverall Toronto, and a Hellamaid cost post (returned 410 Gone).
- Whether the site images are stock could not be confirmed (no reverse image search). The alt text and file names are generic ("Floor scrubber cleaning a supermarket aisle"). `src/content/projects/warehouse-floor-clean-and-wax.md` records that the only known own-work photo is unapproved.

## SERP-backwards analysis by query

Page types follow `page-type-taxonomy.md`. Directories are counted as "Comparison/aggregator".

| Query | What ranks (observed) | Intent rewarded | Evergreen page | Type match | Gap |
|---|---|---|---|---|---|
| commercial cleaning Toronto | Franchise service/article pages (Coverall ×2, Enviro-Master ×2, Stratus), aggregators (RenovationFind, Clutch, YellowPages, websites.ca), independent service pages (Hellamaid), spam | Commercial investigation: build a vendor shortlist | `/` (title "Commercial Cleaning Company in Toronto Since 1989") | **ALIGNED** (hybrid service/local homepage) | Proof volume. Franchise pages cite scale; aggregators carry reviews. |
| office cleaning Toronto | HomeStars "office-cleaner-pros/toronto" (several pages), Coverall, independents, Notion spam | Shortlist and compare reviews | `/services/office-cleaning/` | **ALIGNED** for the vendor slot; **MEDIUM** overall, because the SERP is directory-led | No HomeStars presence verified; 2 reviews on page, both 5 years old |
| office cleaning Mississauga | HomeStars Mississauga (says avg 4.7, ~51 reviews), Enviro-Master Peel franchise page, small local firms (After Eight Cleaning, since 1988), job boards | Local vendor | `/locations/mississauga/` | **ALIGNED** (local page) | No Mississauga address, so weaker local-pack proximity (the page says so honestly). Only proof is one review from 5 years ago. |
| janitorial services Toronto | Aggregators dominate (Clutch, YellowPages, BBB, Yabsta, HomeStars, websites.ca), plus Coverall and Stratus | Find and compare contractors | `/services/commercial-cleaning/` (title "Commercial Cleaning & Janitorial Services…", `#janitorial-services-the-daily-upkeep` section) | **ALIGNED** (service pillar) | A directory-heavy SERP; listings matter more than on-page work |
| office cleaning cost Toronto | HomeStars price guide ($30–60/hr), Hellamaid cost guide, vendor cost blogs, a dev.to "what it should actually cost" post | **Informational: a number or range** | `/office-cleaning-cost-toronto-guide/` | Type ALIGNED (blog guide); **intent mismatch: HIGH** | Gives no real price, so the title promises more than the page delivers |
| post construction cleaning Toronto | Hellamaid pricing guide ($/sq ft), aggregators (BBB 64–71 results, RenoQuotes ×3, HomeStars), vendor pages, Kijiji | Mixed: largely **residential/renovation** plus a price | `/services/post-construction-cleaning/` (commercial only) | **MEDIUM**: audience mismatch (residential-leaning SERP vs. commercial-only page) | Commercial-only scope is correct for the business but competes for a mostly residential query. No price, photos or projects. |
| floor stripping and waxing Toronto | Jani-King national pages and blog, BBB category pages, small vendor/Google Sites pages, US price guides ($0.50–2/sq ft) | Find a provider plus a price per sq ft | `/services/floor-stripping-waxing/` | **ALIGNED**. This is the **weakest local SERP** of the 8 and the best opportunity. | No $/sq ft guidance, no before/after photos |
| medical office cleaning Toronto | Coverall medical category and article, TitanEdge city pages ("IPAC"), Stratus, HomeStars | Compliance-aware vendor | `/industries/medical-dental-clinics/` | **ALIGNED** (industry service page) | Strong IPAC content (RCDSO, PHO citations), but no clinic client, clinic review or staff IPAC training shown |

**Mismatch summary:** no CRITICAL page-type mismatch. There is one HIGH intent mismatch (the cost guide), one MEDIUM audience mismatch (post-construction), and two MEDIUM "the SERP is directory-led" gaps (office cleaning Toronto and Mississauga, janitorial). The remaining gap is **trust and proof**, not page architecture.

## User stories (each cites the SERP signal it comes from)

1. **Facility manager comparing vendors** (consideration). *Signal: Clutch, HomeStars and YellowPages lists plus Coverall's scale claims on "commercial cleaning / janitorial services Toronto".* "As a facility manager shortlisting 3 contractors, I want evidence of comparable buildings cleaned, review volume and insurance documents, so I can defend the choice to my boss."
2. **Clinic office manager** (consideration → decision). *Signal: TitanEdge and Coverall lead with "IPAC" and "infection prevention protocols" on "medical office cleaning Toronto".* "As a dental-clinic manager, I want to know the crew is trained to IPAC practice and who does what in the operatory, so an inspection doesn't catch us out."
3. **Property manager needing periodic floor care** (decision). *Signal: "$0.50–2 per sq ft" price guides, Jani-King "questions to ask", and Master Building Services' "strip-and-wax cycles under one agreement" on "floor stripping and waxing Toronto".* "As a property manager with several lobbies, I want a per-sq-ft range, before/after examples and a yearly cycle plan, so I can budget floor care across my portfolio."
4. **Small business owner wanting a price** (awareness → consideration). *Signal: HomeStars' "$30–60 per hour" price guide and the dev.to "what office cleaning should actually cost" post on "office cleaning cost Toronto".* "As the owner of a 2,000 sq ft office, I want a ballpark monthly cost before I give anyone my address, so I know whether a contract is affordable."

## Persona scoring (Relevance / Clarity / Trust / Action, 25 each), weakest first

| Persona | Pages scored | R | C | T | A | Total |
|---|---|---|---|---|---|---|
| Small business owner wanting a price | `/office-cleaning-cost-toronto-guide/`, `/services/office-cleaning/`, `/request-a-quote/` | 14 | 10 | 12 | 9 | **45** |
| Property manager, periodic floor care | `/services/floor-stripping-waxing/`, `/industries/property-management/`, `/services/post-construction-cleaning/` | 21 | 19 | 7 | 14 | **61** |
| Clinic office manager | `/industries/medical-dental-clinics/` | 22 | 20 | 8 | 14 | **64** |
| Facility manager comparing vendors | `/`, `/services/commercial-cleaning/`, `/services/office-cleaning/`, `/locations/mississauga/` | 21 | 20 | 9 | 15 | **65** |
| **Average** | | | | | | **58.75** |

**Small business owner (45):** The guide's only numbers are a hypothetical "$100–$300 per visit". The page says repeatedly that these are not Evergreen prices. Its FAQ answer to "Can Evergreen provide an estimate over the phone?" ends with "this guide does not promise a firm phone price". The quote form (`src/components/ContactForm.astro`) has about 9 required fields, including first and last name, street address, city and postal code, before any price. A competing page (Hellamaid) asks for frequency, bathrooms and kitchenettes instead. Clarity is lost because the title promises a "2026 Pricing Guide".

**Property manager (61):** The cycle and scrub-and-recoat content is excellent and specific to Toronto (road salt). But the floor page has 1 photo (a generic "bright commercial hall"), no before/after, and no $/sq ft range. It does not show the property-manager review (Michael Katchen) that exists in `src/data/reviews.ts`. The post-construction page has no project examples and no testimonial at all.

**Clinic manager (64):** Best content on the site. It cites the RCDSO IPAC standard and PHO Best Practices, and the division of labour between clinic staff and cleaners is clear. Trust is weak: "for years" (no count of clinics), no clinic testimonial, and no statement that crews are trained in IPAC, colour-coding or cleaning logs. The page has 0 reviews.

**Facility manager (65):** Clear scope, written proposals, one account executive, and a consistent crew. The trust row (since 1989, WSIB, bonded, 2-hour reply) shows on every page. But it is all self-asserted: no insurance amount or certificate, no client names or logos, no case study, no named account executive, and 7 Google reviews against Coverall's 1,000+.

## SXO Gap Score: dimension detail (61/100)

| Dimension | Score | Evidence |
|---|---|---|
| Page type | 11/15 | Right types for all 8 queries; the cost-guide intent misses and post-construction has an audience mismatch |
| Content depth | 12/15 | 1,000–2,500 words per money page, specific (Mississauga neighbourhoods and highways, IPAC citations, strip vs. recoat). The same "How it works", "What affects the price" and "Where we work" blocks repeat on every service page. |
| UX signals | 12/15 | Clean fold on mobile: H1, quote and call CTAs, 3 trust ticks, sticky call/quote bar (screenshots). Friction: no instant estimate, 9-field form. Home mobile LCP 6.8s (brief). |
| Schema | 11/15 | ProfessionalService, Service, OfferCatalog, FAQPage, BreadcrumbList, BlogPosting. No Person anywhere (founder, author); BlogPosting author is the Organization. |
| Media | 4/15 | 2–3 images per money page, all generic in subject. Gallery is 13 images with 71 words, none showing an identifiable Evergreen crew, van, uniform or client site. |
| Authority | 4/15 | 7 Google reviews (3 in the last 12 months). No named staff; "Art" appears only inside a customer review. 0 published case studies. No HomeStars or Clutch profile seen in any SERP. |
| Freshness | 7/10 | Money pages rebuilt Oct 2026 and the cost guide is dated 31 Oct 2026. Most on-page testimonials are 5–6 years old. |

## What works

- Page-type alignment is right on every core query; no money page targets the wrong format (table above).
- The clinic page is genuinely expert: it cites the RCDSO IPAC standard and the PHO Best Practices (3rd ed.) and sets out what is "ours vs. your staff's" (`/industries/medical-dental-clinics/`).
- The Mississauga page has real local detail (Meadowvale, Airport Corporate Centre, 401/403/427, "30 to 50 minutes in the evening"). It honestly says "We do not have an office in Mississauga", which helps trust.
- The floor page explains the strip → burnish → scrub-and-recoat cycle and winter salt etching, which is better than the generic US vendor pages in that SERP.
- Every page has a clear fold: the H1 names the service and region, there are quote and call CTAs, the "reply within 2 hours" promise appears, and phones get a sticky call/quote bar (`screenshots/*-mobile-fold.png`).
- The scope-and-limits sections ("Sterilization... not part of a cleaning contract", "Hazardous materials... not cleaning work") show expertise and set expectations.
- The case-study infrastructure already exists, with a publish gate (`src/pages/projects/[slug].astro`, `src/lib/projects.ts`).

## Findings

### 1. The cost guide does not satisfy cost intent (HIGH)
- **Evidence:** `/office-cleaning-cost-toronto-guide/`. Title: "Office Cleaning Cost Toronto: 2026 Pricing Guide". Body: "These are hypothetical CAD calculations… not Evergreen quotes or verified GTA market averages"; the worked example is "$150 per visit… hypothetical"; the per-sq-ft FAQ says "This guide does not establish a verified Toronto rate per square foot." Competitors in the same SERP give numbers (HomeStars: $30–60/hr). A searcher who wants a number leaves and picks another result.
- **Recommendation:** Resolve decision D-D (docs/growth/README.md) with the client and publish **Evergreen's own ranges** from real contracts. For example, "Most offices under 3,000 sq ft cleaned 2–3 nights a week pay $X–$Y/month before HST", by size band and frequency, plus an hourly band. Cite HomeStars' $30–60/hr as an external reference. Cut the disclaimers to one line. If the client refuses ranges, retitle the page honestly ("How Office Cleaning Is Priced in Toronto") so the title matches the content. File: `src/content/blog/office-cleaning-cost-toronto-guide.md`.

### 2. Third-party proof is missing; this is the main reason good pages don't rank (HIGH)
- **Evidence:** `/reviews/` and `src/data/reviews.ts` show 7 Google reviews: 2 months, 9 months, 1 year, and 5, 5, 5 and 6 years old. HomeStars, Clutch and BBB pages fill 4 of the 8 SERPs, and Evergreen appeared in none. Coverall's Toronto page claims 1,000+ reviews. Search Console shows 23 clicks in total.
- **Recommendation:** Run the approved review kit (C5) as a weekly habit, aiming for 25+ dated reviews. Claim and complete HomeStars, Clutch and BBB profiles with the confirmed NAP (Phase 2 C6). These are SERP slots in their own right, not just citations. On-site, show the review count and newest-review date beside the trust ticks (`src/components/blocks/*` trust bar). Route local-pack work to `/seo local`.

### 3. No named people anywhere (HIGH)
- **Evidence:** `/about-us/` has no names and no photos. The account executive promised on every page is unnamed. The cost guide's byline is "By Evergreen Office Cleaning". The owner ("Art") is named only inside a 5-year-old customer review. There is no Person entity in the JSON-LD.
- **Recommendation:** Close H5. Name the owner and account executive(s) on `/about-us/` (`src/content/pages/about-us.md`) with a photo, years in the trade, and a direct line. Put the account executive's name and face in the "reply within 2 hours" block on service pages. Add `founder`/`employee` Person entries in `src/lib/schema.ts` and a named author on blog posts. Run `/seo content` for the E-E-A-T pass.

### 4. No case studies and no photos of real work (HIGH)
- **Evidence:** `/cleaning-demo-gallery/` has 13 images, 71 words, and generic subjects ("Desk and laptop in an empty coworking office", "Floor scrubber cleaning a supermarket aisle"). Money pages carry 2–3 generic images. `src/content/projects/warehouse-floor-clean-and-wax.md` is `status: draft` with the photo `approved: false`, so `/projects/` publishes nothing.
- **Recommendation:** Run the H6 photoshoot. Prioritise crew in uniform, the van, and before/after of a stripped-and-waxed floor, a post-construction handover and a clinic operatory. Publish 3 case studies (warehouse floor, a clinic, a multi-tenant office) through the existing gate, and link each from its service page's "Related" block. Even without client names, "a 6-operatory dental clinic in North York, nightly since 2019" is proof.

### 5. Persona-relevant reviews are not matched to pages (MEDIUM)
- **Evidence:** The clinic, floor-stripping and post-construction pages show no testimonial at all. The only property-manager review (Michael Katchen) sits on Mississauga and commercial-cleaning, not on `/industries/property-management/` or the floor page. The homepage "Testimonials" (Brenda Carmichael, Allen Robinson, Paul Lockheart) are undated and unsourced, unlike the dated Google reviews; they read as less credible.
- **Recommendation:** In `src/data/reviews.ts`, tag reviews by persona or service and render the matching one per page. Add a source and date to the three homepage testimonials, or drop them (`src/components/home/*`).

### 6. The quote form is too long for a first price question (MEDIUM)
- **Evidence:** `src/components/ContactForm.astro` requires first name, last name, business, street address, city, province, postal code, email and phone. The only path to a price is a walkthrough ("rather than pricing the work down the phone").
- **Recommendation:** Resolve D-A. Make the street address optional and keep postal code. Add 3 qualifying fields that predict price (approx. sq ft, visits per week, number of washrooms), as Hellamaid does. Offer "Get a ballpark by email" as a second path before the walkthrough. Keep the walkthrough for the firm quote.

### 7. Post-construction page competes for a residential-leaning SERP (MEDIUM)
- **Evidence:** "post construction cleaning Toronto" results are mostly renovation and residential (Hellamaid $/sq ft guide, RenoQuotes, Kijiji, HomeStars renovation cleaning). The Evergreen page is commercial-only and has no price, project or photo of its own work.
- **Recommendation:** Keep the commercial scope, but target "commercial post-construction cleaning Toronto" and "construction cleanup for contractors" in the title and H1 (`src/content/services/post-construction-cleaning.md`). Add a per-project pricing explanation with $/sq ft bands by phase (rough clean vs. final clean) and one handover case study.

### 8. The floor page lacks the $/sq ft and visual proof this weak SERP rewards (MEDIUM, best opportunity)
- **Evidence:** "floor stripping and waxing Toronto" returned no strong Toronto independent page; the results were Jani-King national pages, BBB category pages and US price guides. `/services/floor-stripping-waxing/` already beats those on content but has 1 generic image and no price guidance.
- **Recommendation:** Add a Toronto $/sq ft range for strip and wax vs. scrub and recoat, a before/after pair, and a sample annual cycle for a lobby (`src/content/services/floor-stripping-waxing.md`). This is the query where on-page work alone is most likely to move rankings.

### 9. Clinic page asserts no staff IPAC training or documentation (MEDIUM)
- **Evidence:** The page cites RCDSO and PHO but never says Evergreen's crews are trained to them, use colour-coded cloths, or keep cleaning logs. Competing pages (TitanEdge) lead with "IPAC standards".
- **Recommendation:** If true, state what training crews receive (e.g. PHO IPAC Core Competencies), colour-coding, and the sign-off log or checklist the clinic receives. Link the checklist post. Add one clinic testimonial. File: `src/content/industries/medical-dental-clinics.md`.

### 10. Generic marketing copy at the top of the Mississauga page (LOW)
- **Evidence:** The first block of `/locations/mississauga/` ("comprehensive commercial cleaning and janitorial solutions", "Flexible Scheduling (Zero Disruption)") reads like template filler. It sits above much better specific content ("Working in Mississauga", drive times).
- **Recommendation:** Lead with the "Office cleaning in Mississauga" and neighbourhood sections and shorten the generic block (`src/data/location-local.ts` / `src/data/locations.ts`).

### 11. Identical boilerplate blocks on every money page (LOW)
- **Evidence:** The trust row, "How it works" (5 steps), "What affects the price" (6 bullets) and "Where we work" appear verbatim on the office, clinic, floor, post-construction and commercial pages.
- **Recommendation:** Make "What affects the price" specific to each service (e.g. floors: coats of old finish and square footage; clinics: number of operatories). Collapse "How it works" to one link to `/our-process/` on the deeper pages.

## Quick wins (5 or fewer)

1. Retitle the cost guide, or replace the "hypothetical" figures with Evergreen's real ranges (D-D). This is the one HIGH item that is copy-only.
2. Show review count and newest-review date in the trust bar, and put the persona-matched Google review on the clinic, floor, post-construction and property-management pages (`src/data/reviews.ts`).
3. Make street address optional on the quote form and add sq ft, visits per week and washrooms fields (`src/components/ContactForm.astro`).
4. Name the account executive and owner on `/about-us/` and in the "reply within 2 hours" block (needs one client answer).
5. Create or claim HomeStars, Clutch and BBB profiles. They occupy 4 of the 8 observed SERPs.

Cross-skill: `/seo content` (E-E-A-T, named authors), `/seo local` (GBP, local pack, directories), `/seo schema` (Person and founder entities). A PDF version of this report is available via `/seo google report`.

### Sources (SERP and competitor checks)
- HomeStars office cleaners Toronto: https://www.homestars.com/cleaning/office-cleaner-pros/toronto-toronto
- HomeStars price guide: https://www.homestars.com/cleaning/cleaning-of-dwelling-house-office
- Coverall Toronto: https://www.coverall.com/locations/canada/toronto-support-center/commercial-cleaning-services-in-toronto--the-gta-for-offices-healthcare-tech--more/
- Hellamaid Toronto commercial: https://hellamaid.ca/commercial-cleaning-services/toronto-on
- Hellamaid post-construction pricing: https://hellamaid.ca/construction-cleaning-guide/how-much-is-post-construction-cleaning-services-rates-in-toronto-a-pricing-guide/
- Clutch Toronto janitorial: https://clutch.co/ca/real-estate/commercial-property-management/janitorial-cleaning/toronto
- BBB post-construction Toronto: https://bbb.org/ca/on/toronto/category/post-construction-cleaning
- Enviro-Master Mississauga: https://enviro-master.com/commercial-cleaning-locations/peel-ontario/commercial-office-cleaning-service
- Jani-King floor stripping: https://www.janiking.com/commercial-cleaning/specialty-cleaning-services/floor-stripping-waxing-services/
- Coverall medical office cleaning: https://www.coverall.com/category/medical-office-cleaning-services/

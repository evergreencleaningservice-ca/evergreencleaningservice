# Page analysis: Evergreen office-cleaning page vs Jan-Pro office-cleaning page

- **Page B:** https://www.evergreencleaningservice.ca/services/office-cleaning/
- **Comparator:** https://jan-pro.com/who-we-clean/office-cleaning/
- **Audited:** 2026-10-28 (curl + Python parser, Browserless Lighthouse 13.5.0 mobile & desktop, Playwright Chromium timings)
- **Raw data:** `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/page/` (`eg-office.html`, `jp-office.html`, `*.parsed.json`, `lh-eg-office-{mobile,desktop}.json`, `lh-jp-office-{mobile,desktop}.json`, `playwright-timings.jsonl`)
- **Method note:** the plugin's Python helpers could not run here; the title/description-restatement check was done manually. All numbers are from saved HTML, Lighthouse JSON or Playwright output.

---

## Page Score Card (Evergreen office cleaning)

```
Overall Score: 80/100

On-Page SEO:     88/100  ████████▊░
Content Quality: 80/100  ████████░░
Technical:       86/100  ████████▌░   (includes Lighthouse performance)
Schema:          82/100  ████████▏░
Images:          55/100  █████▌░░░░
```

**Reasoning.** This is a well-structured service page: keyword-first 57-char title, matching H1, 1,165 words of specific main-content copy (tasks per visit, periodic work, scheduling, scope limits, pricing factors, 7 FAQs, named ECOLOGO-certified product line, WSIB), self-canonical, complete social metadata, Service + BreadcrumbList + FAQPage schema, descriptive internal links to related services and location pages, and a fast text LCP (1.2 s desktop / 2.3 s mobile). It loses points for images (two 1200×800 JPEGs of 116 KB and 94 KB with no `width`/`height`, no `srcset`, no AVIF/WebP even though 29 KB / 23 KB AVIF variants already exist on the CDN), stale proof (both testimonials are 5 years old; no rating count, no team or dates), the exact phrases "office cleaning toronto"/"commercial cleaning toronto" never appearing verbatim, meta description slightly short with no CTA verb, and the same GTM/Ads JS weight (TBT 500 ms mobile). Jan-Pro's page scores ~74 on the same rubric: comparable length, better contextual in-body linking and stronger quantified authority (8,000 franchisees, 98.7 % retention, BBB A+), but a hard-to-read grade-14 style, `areaServed: US`, zero Toronto relevance, literal `alt="null"` images, heading-order and link-name accessibility failures, and a 3.9 s mobile LCP.

---

## 1. On-page SEO — side by side

| Element | Evergreen office cleaning | Jan-Pro office cleaning | Verdict |
|---|---|---|---|
| URL | `/services/office-cleaning/` | `/who-we-clean/office-cleaning/` | Both short, hyphenated, descriptive. |
| Title | "Office Cleaning Services in Toronto & the GTA \| Evergreen" (57) | "Professional Office Cleaning Services \| JAN-PRO" (47) | Evergreen: keyword first + geo + brand, in range ✓. Jan-Pro: no geo. |
| Meta description | "Recurring office cleaning in Toronto and the GTA — after hours, by a consistent crew, with a free on-site walkthrough and a written proposal." (141) | "JAN-PRO delivers custom office cleaning services with EPA-approved products and proven quality inspections. Get your free quote today." (134) | Both under 150; neither restates its title. Evergreen lacks an explicit CTA verb; Jan-Pro closes on a stock CTA ("Get your free quote today."). |
| H1 | "Office Cleaning in Toronto and the GTA" (1) | "Professional Office Cleaning Services" (1) | Evergreen H1 = keyword + geo ✓. |
| H2 / H3 / H4 | 18 / 11 / 0 (incl. 1 aside H2 "Get a free quote" + 4 footer H2) | 6 / 5 / 4 (H2→H4 skip flagged by Lighthouse `heading-order`) | Evergreen hierarchy valid. |
| Heading outline (main) | H2 Who it is for · A clean office does two jobs · Your equipment and your privacy are respected · What is included (H3 Every visit / Scheduled periodically) · Scheduling · Scope and limits · How it works (5 H3) · What affects the price · What clients say · Frequently asked questions · Related · Where we work (H3 Toronto / Peel & Halton / York Region / Durham) · Book a free office walkthrough | H2 Why a Clean Office Matters More Than You Think · A Custom Cleaning Plan That Works Around You · What's Included… (H3 General Office Cleaning / Floor & Carpet / Breakroom & Kitchen / Window & Glass / Green Cleaning) · Powered by Exclusive JAN-PRO Systems (H4 ENVIROSHIELD / TECHNICS / TRACKER) · Trusted by Businesses Nationwide · Get a Free Quote… | Evergreen covers buyer questions (scope, limits, price drivers, FAQ). Jan-Pro covers benefits + proprietary systems + proof. Evergreen could borrow the "systems/proof" block; Jan-Pro lacks scope/limits/pricing. |
| "office cleaning toronto" | exact 0; "office cleaning" ×11 (title, H1, desc, H2/H3), "toronto" ×13 — "Office Cleaning in Toronto" form used | 0; "office cleaning" ×9, no geo | Evergreen satisfies the intent; add one verbatim sentence. |
| "commercial cleaning toronto" | exact 0; "commercial cleaning" ×5 (Related card, form, footer) | "commercial cleaning" ×3 | This page should not chase this phrase (the commercial-cleaning page should); one cross-link sentence is enough. |
| Supporting entities | janitorial ×2, GTA ×4, 10 municipalities + 5 Toronto districts, WSIB Ontario, ECOLOGO/UL Environment, Armstrong ProSeries Green, account executive, strip & wax, hot-water extraction, data room/raised floor | EPA-approved, HEPA, CDC/OSHA/Joint Commission, ENVIROSHIELD®, TECHNICS®, TRACKER®, 50-point inspection, 8,000 franchisees, 41 states, 9 countries, BBB A+ | Both rich. Jan-Pro's are trust/system brands; Evergreen's are local/operational. |
| Word count (total / main) | 1,507 / ~1,165 | 1,440 / ~1,125 | Both exceed the 800-word service-page minimum. |
| Internal links (total / unique) | 75 / 31; **16 in main**: 6 "Related" cards (commercial cleaning, building maintenance, disinfection, clinics, property managers, how we work), 7 location pages, 2 quote links, skip link | 126 / 51; **15 in main**, mostly contextual in-sentence anchors ("janitorial services", "Restroom cleaning", "commercial floor cleaning", "carpet cleaning services", "commercial window cleaning", "green cleaning services", "electrostatic disinfection system", "over 8,000 certified franchisees") | Evergreen anchors are descriptive but card-style; Jan-Pro's in-paragraph contextual links are the pattern to copy (e.g., link "strip, seal and wax" → building-maintenance, "medical… offices" → clinic page is already done once). |
| External links | 4, footer only (Google review, Facebook, Twitter, LinkedIn; `noopener noreferrer`) | 6, footer only (Google Maps, portal, 4 social without link text) | Neither cites an authority inline; Evergreen could link UL ECOLOGO and WSIB where they are mentioned. |
| CTAs (distinct wording) | header "Get a quote" + "(416) 803-4880 Call"; hero "Get a free quote" (→ `#offer-quote`) ; sticky aside "Request a Free Quote"; form "Get my free quote"; closing "Request a quote" + "Call (416) 803-4880"; footer phone; `tel:` ×5 → ~9 CTA instances, consistent "quote/walkthrough" language, phone everywhere | header "Free Estimate", "Find A Location", "Franchising", phone; body "Schedule Free Estimate" ×2, "Get a Free Estimate", "Schedule Now"; form "Get Started" → ~8, plus franchise CTAs | Evergreen is consistent; "Book a free office walkthrough" is a strong, specific closing CTA. |
| Breadcrumbs | Visible (`Evergreen Office Cleaning > Services > Office Cleaning`) + `BreadcrumbList` | Visible (`Home / Who We Clean / Business Offices`) + `BreadcrumbList` (names differ from visible "Business Offices") | ✓ both |

## 2. Content quality

| Signal | Evergreen office | Jan-Pro office |
|---|---|---|
| Readability (paragraph text) | FRE 50.6, FK grade 12.2 (24 words/sentence — long sentences, plain vocabulary) | FRE 26.9, FK grade 14.2 (1.90 syllables/word — dense marketing vocabulary) |
| Experience | "cleaning offices in Toronto since 1989"; "trusted in… medical offices and labs to government buildings and police stations"; concrete scope lists; "we look before we quote" | "For over 30+ years"; franchisee training; systems named |
| Expertise | Task-level detail (liners replaced, touch points, hot-water extraction, strip/seal/wax, high dusting, data-room cleaning); named product line with third-party certification; price-driver explanation | Floor-care techniques (burnishing, recoating), colour-coded microfiber, HEPA, compliance frameworks |
| Authoritativeness | WSIB Ontario, bonded, liability insured; UL ECOLOGO-certified products | BBB A+, Entrepreneur #1 ×15 yrs, OSHA/CDC/Joint Commission, 8,000 franchisees, 98.7 % retention |
| Trust / proof | 2 quoted Google reviews (named, "5 years ago"); FAQ answers screening/insurance; address/hours in footer | Quantified claims; "independently owned franchisees" disclaimer; no on-page customer quotes |
| Author / team | None | None |
| Freshness | No visible or structured date; © 2026 | `og:updated_time` 2026-08-24, `WebPage.dateModified` 2026-08-24 |
| Keyword stuffing | None ("office" ×33 / "cleaning" ×41 in 1,507 words, natural) | None ("cleaning" ×71 is high but spread across a long nav) |
| Intent match for a Toronto office manager | High: scope, schedule, price logic, FAQ, local coverage, quote path | Medium-low: persuasive but US-centric; a Toronto visitor is routed to a ZIP-code finder |

**Gaps vs. quality gates:** word count ✓; no publication/updated date; E-E-A-T lacks named people and photos of the actual crew with captions; proof is 5 years old and unquantified (no client count, retention, buildings cleaned, average tenure); no case study; no pricing anchor (even "from $X/visit for offices under N sq ft" or "typical nightly office of 5,000 sq ft takes 2 cleaners ~2 h").

## 3. Technical metadata

| Item | Evergreen office | Jan-Pro office |
|---|---|---|
| HTTP | 200, HTTP/2, Cloudflare, 103 KB HTML, `max-age=0, must-revalidate` | 200, HTTP/2, Cloudflare + WP Rocket, 358 KB HTML, `max-age=600` |
| Canonical | self ✓ `…/services/office-cleaning/` | self ✓ |
| Meta robots | absent (index,follow default) ✓ | `follow, index, max-snippet:-1…` ✓ |
| `<html lang>` | `en-CA` ✓ | `en-US` |
| Hreflang | none (single language) ✓ | none; only RSS `rel=alternate` |
| Viewport / charset | ✓ / utf-8 | ✓ / UTF-8 |
| Open Graph | type `website`, title, description, url, image (`office-backpack-vacuum-toronto-og.jpg`, 85 KB), site_name, locale `en_CA` ✓ | type **`article`** (odd for a service page), title, description, url, site_name, `article:publisher`, updated_time, image (brand logo PNG, not a page image) |
| Twitter | `summary_large_image` + title/description/image ✓ (no `twitter:site`) | ✓ incl. `@janproint` |
| Stack | Astro static; CSS inlined; 3 module scripts | WordPress + WPBakery + Slider Revolution + WP Rocket + Gravity Forms |
| Render-blocking | none | none |
| Third-party JS | GTM 157 KB + gtag/Ads 168 KB + gstatic call-tracking 21 KB + Cloudflare Insights 10 KB (one DoubleClick third-party cookie → best-practices 77) | Google Fonts 45 KB; minimal JS on load |

## 4. Schema markup

**Evergreen office (4 JSON-LD blocks, all parse):**
1. `@graph`: `CleaningService` (#organization, full NAP, geo, hours, areaServed 10 cities, sameAs, offer catalog) + `WebSite` (+SearchAction → `/search/?q=`; verify the endpoint exists).
2. `BreadcrumbList` — 3 items; last item has `name` only (allowed) ✓.
3. `Service` — `name` "Office Cleaning", `serviceType`, `description`, `url`, `provider` → `@id #organization` ✓, `areaServed` 10× `City`. Missing: `image`, `offers` (even `priceSpecification` with `priceCurrency: CAD` and "quote on walkthrough"), `hasOfferCatalog` for the "Every visit / Scheduled periodically" items, `termsOfService`, `audience` (`BusinessAudience`).
4. `FAQPage` — 7 `Question`/`Answer` pairs matching the visible FAQ ✓ (valid; FAQ rich results are retired since May 2026 so expect no SERP enhancement — keep, don't expand for rich-result reasons).
- Missing `WebPage` node (dateModified, primaryImageOfPage, breadcrumb reference). No `aggregateRating`. The `Service` is not linked to the page via `mainEntityOfPage`.

**Jan-Pro office:** `Organization`, `WebSite`, `ImageObject`, `WebPage` (datePublished 2019-09-30, dateModified 2026-08-24), `Service` (serviceType "Office Cleaning", `provider` inline Organization, `areaServed: "US"`, `hasOfferCatalog` 5 services), `BreadcrumbList` with `position` as strings ("1") and names that differ from the visible crumb. HTML entities (`&amp;`) inside JSON strings. No LocalBusiness (correct for franchisor).

**Ready-to-use additions for Evergreen (merge, do not duplicate the existing nodes):**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#webpage",
  "url": "https://www.evergreencleaningservice.ca/services/office-cleaning/",
  "name": "Office Cleaning Services in Toronto & the GTA | Evergreen",
  "isPartOf": { "@id": "https://www.evergreencleaningservice.ca/#website" },
  "about": { "@id": "https://www.evergreencleaningservice.ca/#organization" },
  "primaryImageOfPage": { "@type": "ImageObject", "url": "https://img.evergreencleaningservice.ca/images/office-backpack-vacuum-toronto-og.jpg", "width": 1200, "height": 630 },
  "breadcrumb": { "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#breadcrumb" },
  "inLanguage": "en-CA",
  "dateModified": "2026-10-28",
  "mainEntity": { "@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#service" }
}
```

Extend the existing `Service` node:

```json
"@id": "https://www.evergreencleaningservice.ca/services/office-cleaning/#service",
"name": "Office Cleaning in Toronto and the GTA",
"image": "https://img.evergreencleaningservice.ca/images/office-backpack-vacuum-toronto-og.jpg",
"audience": { "@type": "BusinessAudience", "name": "Offices, professional firms and multi-tenant office buildings" },
"availableChannel": { "@type": "ServiceChannel", "serviceUrl": "https://www.evergreencleaningservice.ca/request-a-quote/", "servicePhone": "+1-416-803-4880" },
"offers": { "@type": "Offer", "priceCurrency": "CAD", "availability": "https://schema.org/InStock", "description": "Quoted after a free on-site walkthrough; written proposal with scope and schedule." },
"hasOfferCatalog": { "@type": "OfferCatalog", "name": "Office cleaning tasks", "itemListElement": [
  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nightly or weekly janitorial visit" } },
  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial carpet hot-water extraction" } },
  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hard-floor strip, seal and wax" } },
  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "High dusting and interior window cleaning" } }
]}
```

(Add `"@id": "…#breadcrumb"` to the existing `BreadcrumbList`.) Do not add HowTo for "How it works".

## 5. Images

| Metric | Evergreen office | Jan-Pro office |
|---|---|---|
| `<img>` count | 3 (logo in `<picture>` with AVIF/WebP; 2 body JPEGs) | 21 in HTML → ~10 real after removing WP Rocket `data:` placeholders (3 logos, 3 menu icons, hero PNG, 3 system icons) |
| Alt | 3/3 present and descriptive ("Cleaner vacuuming an open-plan office with a backpack vacuum", "Evening janitorial crew cleaning a Toronto office") ✓ | hero alt descriptive ✓; **two icons have literal `alt="null"`** (technics.svg, smarter.svg); footer logo `alt=""`; menu icons "Free Estimate Icon" etc. |
| Formats | body images **JPEG only** (`office-backpack-vacuum-toronto.jpg` 116 KB, `night-janitorial-crew-office-toronto.jpg` 94 KB) although `…-768.avif` versions (29 KB / 23 KB) exist on the CDN; no `srcset`/`sizes`; no `<picture>` | PNG hero 99 KB (Lighthouse: 39 KB savings), PNG logos 40 KB each; SVG icons |
| Size thresholds | none >200 KB; both body JPEGs flagged by Lighthouse `image-delivery` — 1200×800 served for ~721 px display, 131 KB wasted | hero PNG 99 KB flagged (46 KB savings incl. logo) |
| width/height | **missing on both body images** (CLS risk when they load; measured CLS 0 only because they are below the fold and lazy) | set on all ✓ |
| Lazy loading | native `loading="lazy"` on both body images ✓ (`lazy_method: native`) | WP Rocket JS lazyload (`lazy_method: js-generic`), hero excluded with `fetchpriority="high"` ✓ |
| LCP candidate | **text**: `main > section.offer-hero > p.offer-summary` (no hero image) — fast (1.2 s desktop / 2.3 s mobile simulated; 316–332 ms observed) | `img.vc_single_image-img` (hero PNG 450×800) — 3.9 s mobile simulated; `lcp-discovery` fails because the image is JS-lazy-loaded |
| Notes | Images sit inside `<p>` tags; use `<figure>` + `<figcaption>` with location-specific captions (e.g., "Evening crew, King St W office, Toronto") for extra local relevance | `og:image` is the brand logo, not a page image |

## 6. Performance (measured)

Lighthouse 13.5.0 via Browserless (mobile = simulated slow-4G, 4× CPU):

| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | TTI | Transfer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Evergreen office — mobile | 84 | 100 | 77 | 100 | 2.0 s | 2.3 s | **500 ms** | 0.000 | 2.0 s | 7.1 s | 698 KiB / 33 req |
| Evergreen office — desktop | 89 | 100 | 77 | 100 | 0.7 s | 1.2 s | 230 ms | 0 | 0.7 s | 2.0 s | 698 KiB |
| Jan-Pro office — mobile | 85 | 87 | 96 | 100 | 2.4 s | **3.9 s** | 0 ms | 0 | 2.4 s | 3.9 s | 358 KiB |
| Jan-Pro office — desktop | 99 | 86 | 100 | 100 | 0.6 s | 0.9 s | 0 ms | 0 | 0.6 s | 0.9 s | 358 KiB |

Playwright (unthrottled Chromium in this container):

| Run | TTFB | FCP | LCP (element) | CLS | Long tasks | Requests / bytes |
|---|---|---|---|---|---|---|
| Evergreen office — mobile | 131 ms | 316 ms | 316 ms (`P.offer-summary`) | 0 | 85 ms | 27 / 1.47 MB (1.05 MB third-party JS) |
| Evergreen office — desktop | 123 ms | 332 ms | 332 ms (`P.offer-summary`) | 0 | 82 ms | 27 / 1.47 MB |
| Jan-Pro office — mobile | 232 ms | 396 ms | 996 ms (`IMG.vc_single_image-img`) | 0 | 0 | 14 / 0.70 MB |
| Jan-Pro office — desktop | 236 ms | 408 ms | 964 ms (`IMG.vc_single_image-img`) | 0 | 0 | 14 / 0.70 MB |

**Interpretation.** Evergreen's text-first hero gives it the better LCP on every run. The remaining deficit is main-thread work from GTM + Google Ads + call-tracking (TBT 500 ms mobile, TTI 7.1 s; `unused-javascript` 133 KB) and the two unoptimised JPEGs (131 KB avoidable). Jan-Pro is lighter in JS but pays for a 99 KB PNG hero that the browser cannot discover from HTML.

## 7. Issues found (prioritised)

**Critical**
- None.

**High**
1. Two body images are 1200×800 JPEGs (116 KB, 94 KB) without `width`/`height`, `srcset` or AVIF/WebP, even though `-768.avif` variants already exist on `img.evergreencleaningservice.ca`. Wrap in `<picture>` with AVIF/WebP sources, add `srcset`/`sizes` (display ≈ 721 px on desktop, 412 px on mobile) and intrinsic dimensions. Saves ~131 KB and removes a latent CLS risk.
2. GTM + Google Ads + gstatic call-tracking (~325 KB) → TBT 500 ms mobile, TTI 7.1 s, best-practices 77 (third-party cookie). Defer to interaction/idle; consolidate tags.
3. Proof is dated: both quotes are "5 years ago"; no rating/count; no team or dated content. Add 2–3 recent office-client reviews with company type and district (e.g., "law office, Financial District"), a visible aggregate rating, and the collecting mechanism you already link to.

**Medium**
4. Add a verbatim "office cleaning in Toronto"/"Toronto office cleaning" sentence in the intro or "A clean office does two jobs", and link "commercial cleaning" in that paragraph to `/services/commercial-cleaning/` (the phrase "commercial cleaning toronto" belongs to that page).
5. Meta description (141 chars) has no CTA verb — rewrite (below).
6. Schema: add `WebPage` (+`dateModified`), extend `Service` with `image`, `offers`, `audience`, `hasOfferCatalog`, `@id`; verify the `SearchAction` target.
7. No people/credentials block: add supervisor/owner name + photo, "crew of N, average tenure N years", ECOLOGO and WSIB logos with outbound links to the certifying bodies (also fixes "no authoritative external links").
8. Convert some card-style "Related" links into in-sentence contextual links (Jan-Pro's pattern): "strip, seal and wax" → building maintenance; "disinfected" → disinfection cleaning; "Medical, dental and health offices" already links — good.
9. Quote form requires street address, city, province, postal code before submission; move address collection to the walkthrough booking step.

**Low**
10. Images inside `<p>`; use `<figure>/<figcaption>` with local captions.
11. `twitter:site` missing.
12. Image CDN `cache-control: max-age=86400` — lengthen for hashed assets.
13. Footer/aside H2s ("Get a free quote", "Services", "Service Areas", "Follow us on Social Media") dilute the outline; demote to `<p>`/`<h3>` or label with `aria-labelledby`.
14. Add a visible "Last reviewed: <month year>" line near the FAQ.

## 8. Rewritten metadata suggestions

- **Title (59):** `Office Cleaning Toronto & GTA | After-Hours Crews | Evergreen`  
  (current "Office Cleaning Services in Toronto & the GTA | Evergreen" is already acceptable; the rewrite moves "Toronto" immediately after the keyword and adds the differentiator)
- **Meta description (158):** `Office cleaning in Toronto and the GTA since 1989: nightly or weekly janitorial by the same after-hours crew, WSIB-covered and ECOLOGO products. Book a free walkthrough.`
- **H1 (keep):** `Office Cleaning in Toronto and the GTA` — or `Office Cleaning Services in Toronto and the GTA` to align H1 with title exactly.
- **Intro paragraph (adds the verbatim phrase + commercial cross-link):** `Recurring office cleaning in Toronto and the GTA for offices of every size, done after hours by a team assigned to your building — with one account executive to call when something needs to change. Need retail, institutional or mixed-use premises cleaned as well? See our commercial cleaning service.`
- **New H2 (proof block, borrow Jan-Pro's structure):** `Why Toronto offices stay with Evergreen` — bullets: years, retention/tenure figure, WSIB/bonded/insured, ECOLOGO products, inspection cadence.

## 9. Recommendations summary (expected impact)

| # | Action | Impact |
|---|---|---|
| 1 | AVIF/WebP + `srcset` + dimensions on the two body images | −131 KB, Lighthouse image audits pass, CLS safety |
| 2 | Defer GTM/Ads/call-tracking | TBT 500 → <200 ms, mobile perf 84 → ~92+, best-practices 77 → 90+ |
| 3 | Fresh reviews + rating + people/credentials block + dated review line | E-E-A-T, conversion, eligibility for review snippets |
| 4 | Verbatim phrase + contextual links + description rewrite | Relevance for "office cleaning toronto", internal PageRank flow, SERP CTR |
| 5 | WebPage/Service schema extensions | Entity completeness; dateModified signal |
| 6 | Shorter first-touch form | Lead conversion |

## 10. Jan-Pro office page — notable issues (for context)

- `areaServed: "US"`, `lang="en-US"`, ZIP-based routing: no Toronto relevance; not the page a Toronto searcher would land on (watch Jan-Pro's Canadian/Toronto franchise pages instead).
- Readability grade 14 (FRE 26.9) — dense marketing copy; heading order skips H2→H4; two `alt="null"` icons; 4 footer links without names; link-in-text-block contrast; a11y 87/86.
- `og:type article` on a service page; `og:image` is the corporate logo; `BreadcrumbList` positions as strings and names mismatching the visible crumb; `&amp;` in JSON-LD strings.
- LCP 3.9 s mobile from a JS-lazy-loaded 99 KB PNG hero.
- Strengths worth copying: contextual in-paragraph internal links, quantified proof ("98.7 % retention", "8,000 franchisees", "BBB A+", "#1 for 15 years"), named proprietary systems with a 50-point inspection story, `WebPage.dateModified`, zero TBT.

# Page analysis: Evergreen homepage vs Jan-Pro homepage

- **Page A:** https://www.evergreencleaningservice.ca/
- **Comparator:** https://jan-pro.com/
- **Audited:** 2026-10-28 (curl + Python parser, Browserless Lighthouse 13.5.0 mobile & desktop, Playwright Chromium timings)
- **Raw data:** `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/page/` (`eg-home.html`, `jp-home.html`, `*.parsed.json`, `lh-eg-home-{mobile,desktop}.json`, `lh-jp-home-{mobile,desktop}.json`, `playwright-timings.jsonl`)
- **Method note:** the claude-seo Python helpers (`metadata_template.py` etc.) could not run in this environment, so the title/description-restatement check was done as a manual string comparison. Everything below comes from the saved HTML, Lighthouse JSON or Playwright output; nothing is estimated.

---

## Page Score Card (Evergreen homepage)

```
Overall Score: 78/100

On-Page SEO:     85/100  ████████▌░
Content Quality: 72/100  ███████▏░░
Technical:       82/100  ████████▏░   (includes Lighthouse performance)
Schema:          78/100  ███████▊░░
Images:          70/100  ███████░░░
```

**Reasoning.** On-page fundamentals are already correct (56-char keyword-led title, single matching H1, self-canonical, complete OG/Twitter, descriptive anchors, consistent "free quote" CTA). Points are lost for: (1) content proof that is thin and stale (Google reviews shown are 5–6 years old, no rating count, no team/credential content, no dates); (2) the exact target phrases "office cleaning toronto" / "commercial cleaning toronto" appear only as the semantically-equivalent "Office & Commercial Cleaning in Toronto" (fine for ranking, but there is no body sentence that reads naturally with the phrase); (3) 7 of 8 `<img>` elements have empty alt, including three blog-teaser image links with no link text; (4) Lighthouse mobile performance is 63 because Google Tag Manager + gtag + call-tracking cost ~325 KB of JS and 840 ms TBT; (5) schema has no `aggregateRating`/`review` despite reviews on the page, and the `SearchAction` target (`/search/?q=`) should be verified to exist. Jan-Pro's homepage, by contrast, scores roughly 68 on the same rubric: it is faster and has richer Organization schema, but has almost no body copy (≈470 main-content words), a franchise-recruitment split intent, zero Toronto/Canada relevance, and accessibility/SEO Lighthouse failures.

---

## 1. On-page SEO — side by side

| Element | Evergreen home | Jan-Pro home | Verdict |
|---|---|---|---|
| URL | `/` | `/` | — |
| Title | "Office & Commercial Cleaning in Toronto & GTA \| Evergreen" (56 chars) | "Certified Commercial Cleaning Company \| JAN-PRO" (47 chars) | Evergreen: keyword + geo first, brand last, in range. Jan-Pro: no geo (national brand). |
| Meta description | "Office, commercial and industrial cleaning across Toronto and the GTA since 1989 — after hours, by a consistent crew, with a free on-site walkthrough." (150 chars) | "JAN-PRO is a leading commercial cleaning company. Certified janitorial & disinfecting services for every industry. Guaranteed results. Free estimate." (149 chars) | Both in range, neither restates its title. Evergreen has a differentiator but no explicit CTA verb; Jan-Pro ends on a stock "Free estimate." CTA (templated shape). |
| H1 (count) | "Office & Commercial Cleaning in Toronto and the GTA" (1) | "The Highest Level of Commercial Cleaning Services – Guaranteed." (1) | Evergreen H1 carries both target topics + geo. Jan-Pro H1 is a slogan with no geo. |
| H2 / H3 / H4 count | 16 / 18 / 0 (incl. 4 footer H2 + 3 blog-card H2) | 3 / 5 / 3 (h2→h4 skip in footer) | Evergreen hierarchy is clean; its footer column headings as H2 add noise but are not errors. |
| Heading outline (main) | H2 What we clean · Who we clean for · Google Reviews · Why Toronto businesses choose Evergreen (H3 Flexible scheduling / Proactive maintenance programmes / A dedicated account executive) · How it works (5 H3 steps) · Where we work (H3 Toronto / Peel & Halton / York Region / Durham) · Testimonials (3 H3) · Get in touch · Latest News | H2 "I am looking for" ×2 (H3 Commercial Cleaning Services / Franchising Opportunities) · H2 JAN-PRO Cleaning & Disinfecting Commercial Cleaning Company (H3 What it's like…, H4 Have multiple locations?, H4 Learn More…, H3 Let's Get Started, H3 Award Winning Service) | Evergreen outline reads like a service page; Jan-Pro outline is UI labels. Duplicate "I am looking for" H2 on Jan-Pro. |
| "office cleaning toronto" | exact phrase 0; "office cleaning" ×13, "toronto" ×18; in title/H1 as "Office & Commercial Cleaning in Toronto" | 0 / 0 / 0 | Evergreen covers intent; Jan-Pro does not target Toronto at all. |
| "commercial cleaning toronto" | exact 0; "commercial cleaning" ×9 (H1, title); "Commercial cleaning since 1989" eyebrow; "Why Toronto businesses choose Evergreen" H2 | "commercial cleaning" ×8, no geo | Evergreen covers; add one natural body sentence containing each exact phrase. |
| Related entities | janitorial ×6, GTA ×5, 10 GTA municipalities named, WSIB, bonded/insured, account executive | janitorial ×2, franchise ×18, EPA, Entrepreneur, awards | Evergreen's entity set matches local commercial intent; Jan-Pro's is split with franchise recruiting. |
| Word count (total / main content) | 1,463 / ~1,130 | 795 / ~470 | Homepage minimum (500) met by Evergreen; Jan-Pro main copy is under it. |
| Internal links (total / unique URLs) | 95 / 35 (mega-menu heavy) | 125 / 50 | Both sufficient. Evergreen main-body anchors are descriptive service/industry/location names; 3 blog-teaser image links have **empty anchor text**. |
| External links | 5: Google review link ×2, Facebook, Twitter, LinkedIn (all `noopener noreferrer`) | 6: Google Maps, customer portal, 4 social (no `rel`, several with no link text) | Neither links to an authoritative third party (e.g., UL ECOLOGO, WSIB). |
| CTAs (distinct, with wording) | 9: header "Get a quote" + "(416) 803-4880 Call"; hero "Get a free quote" + "Call (416) 803-4880"; sticky aside "Request a Free Quote"; form button "Get my free quote"; footer "Request a quote" + phone; `tel:` ×5 total | 8: header "Free Estimate", "Find A Location", "Franchising", phone; body "Request Free Estimate", "Get Started Today" (franchising), "Learn More About National Accounts"; form "Get Started" | Evergreen CTA wording is consistent (quote/walkthrough). Jan-Pro splits CTAs between customers and franchise buyers. |
| Forms on page | 1 (quote form, 6-field + service checkboxes) | 3 (lead form w/ SMS consent, ZIP finder, Gravity Forms) | Evergreen form asks for full address up front — long for a first-touch form. |

## 2. Content quality

| Signal | Evergreen home | Jan-Pro home |
|---|---|---|
| Readability (paragraph text, Flesch) | FRE 48.8, FK grade 10.5 (16.4 words/sentence) | FRE 38.3, FK grade 12.8 |
| Experience | "Since 1989" ×6; crews dispatched from 243 Queen St W; named processes (walkthrough → written proposal → consistent crew → inspections) | "30+ years", awards list, YouTube video |
| Expertise | Service descriptions are specific (strip & wax, hot-water extraction, high dusting, cross-contamination for clinics) | Generic ("quality products, innovative technology") |
| Authoritativeness | No certifications/badges on home; no media/partner mentions | Entrepreneur #1 ×15 years, Franchise Business Review, USA Today, BBB (badges as images) |
| Trust / proof | 4 embedded Google reviews (Trustindex widget, static HTML) — all dated "5–6 years ago", no aggregate rating or count shown; 3 named testimonials with role/city; WSIB covered, bonded, insured; address, phone, email, hours | Awards; "Measurable Cleaning. Guaranteed Results®"; no reviews/testimonials on home; disclaimer that services are by independent franchisees |
| Author / team | None (no "meet the team", no owner bio; one review names "Art") | None |
| Freshness | No visible dates; footer © 2026; `og:updated_time` absent | `og:updated_time` 2026-05-26, `WebPage.dateModified` in schema |
| Keyword stuffing | None detected; "cleaning" ×54 across 1,463 words is natural for a cleaning site | None |
| Intent fit for "office/commercial cleaning toronto" | Strong: service + geo + proof + CTA on one page | Weak: national brand/franchise page; a Toronto searcher would need the Canadian site or a local franchise page |

**Gaps vs. quality gates:** homepage word count OK; no publication/updated date; E-E-A-T lacks people (owner/supervisor bios, team photo), credentials (ECOLOGO product line is mentioned only on the office page, not here), recent reviews, and quantified proof (years, clients served, retention, buildings cleaned).

## 3. Technical metadata

| Item | Evergreen home | Jan-Pro home |
|---|---|---|
| HTTP | 200, HTTP/2, Cloudflare, `cache-control: public, max-age=0, must-revalidate`; 133 KB HTML | 200, HTTP/2, Cloudflare, WP Rocket, `max-age=600`; 297 KB HTML |
| Canonical | `https://www.evergreencleaningservice.ca/` (self) ✓ | `https://jan-pro.com/` (self) ✓ |
| Meta robots | absent (defaults to index,follow) — acceptable; no `X-Robots-Tag` header | `follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large` |
| `<html lang>` | `en-CA` ✓ (correct locale for Toronto) | `en-US` |
| Hreflang | none (single-language site — correct) | none (Jan-Pro has international sites but no hreflang cluster on this page) |
| Viewport | `width=device-width, initial-scale=1` ✓ | `width=device-width, initial-scale=1, shrink-to-fit=no` ✓ |
| Charset | utf-8 ✓ | UTF-8 ✓ |
| Open Graph | type, title, description, url, image (1200-class JPG, 79 KB), site_name, locale `en_CA` — complete ✓ | locale, type, title, description, url, site_name, updated_time, image + secure_url, width/height — complete ✓ |
| Twitter card | `summary_large_image`, title, description, image ✓ (no `twitter:site` — Evergreen has @EvergreenClean8) | `summary_large_image`, title, description, site/creator `@janproint`, image ✓ |
| Generator / stack | Astro static build; CSS fully inlined (0 external stylesheets); 3 module scripts | WordPress + WPBakery + Slider Revolution + WP Rocket |
| Favicon / icons | present (ico + 16/32/48 + 512 png) | present |
| Render-blocking | none (Lighthouse `render-blocking-insight` clean); fonts `raleway.woff2`, `open-sans.woff2` preloaded (`open-sans-italic.woff2`, 51 KB, is not preloaded but is requested at high priority) | none flagged; Google Fonts CSS via WP Rocket preload |
| Third-party JS | GTM container (157 KB) + gtag/Google Ads (168 KB) + gstatic call-tracking (21 KB) + Cloudflare Insights (10 KB) → ~1.05 MB uncompressed JS in Playwright, 325 KB transferred; 1 third-party cookie (DoubleClick) flagged by Lighthouse best-practices | Gravity Forms + WP Rocket lazyload only on initial load; ~20 KB JS |

## 4. Schema markup

**Evergreen home (JSON-LD, one `@graph`, parses cleanly):**
- `CleaningService` (`@id #organization`): name, url, logo, image, telephone, email, priceRange, `PostalAddress` (243 Queen St W, Toronto ON M5V 1Z4, CA), `GeoCoordinates`, 2× `OpeningHoursSpecification`, `areaServed` 10× `City`, `sameAs` ×3, `hasOfferCatalog` → 4 `Offer`/`Service`.
- `WebSite` with `publisher` → organization and `SearchAction` → `https://www.evergreencleaningservice.ca/search/?q={search_term_string}`.
- Validity: required properties for LocalBusiness-type rich results are present (name, address, telephone, image, url, hours, geo). `priceRange "$$"` is acceptable. **Verify** that `/search/?q=` actually exists (no search UI is visible on the page; an unresolvable SearchAction target should be removed). No `BreadcrumbList` (not needed on home). No `WebPage` node, no `aggregateRating`/`review`, no `foundingDate` (the page claims 1989 six times), no `description`, no `hasMap`, no `areaServed` beyond city names (could use `GeoCircle` or `AdministrativeArea` "Greater Toronto Area").

**Jan-Pro home:** `Organization` (logo `ImageObject`, sameAs ×4), `WebSite` (+SearchAction), `ImageObject`, `WebPage` (datePublished 2018-05-15, dateModified 2026-05-26, primaryImageOfPage), `VideoObject` (name copies the page title; description is YouTube boilerplate "Enjoy the videos and music you love…" — low quality, no `thumbnailUrl`/`duration`). Organization names contain the HTML entity `&amp;` inside JSON strings. No LocalBusiness/address/hours (appropriate for a franchisor), no Service.

**Opportunities for Evergreen (ready to paste, merge into the existing `@graph`):**

```json
{
  "@type": "WebPage",
  "@id": "https://www.evergreencleaningservice.ca/#webpage",
  "url": "https://www.evergreencleaningservice.ca/",
  "name": "Office & Commercial Cleaning in Toronto & GTA | Evergreen",
  "isPartOf": { "@id": "https://www.evergreencleaningservice.ca/#website" },
  "about": { "@id": "https://www.evergreencleaningservice.ca/#organization" },
  "primaryImageOfPage": { "@type": "ImageObject", "url": "https://img.evergreencleaningservice.ca/images/evergreen-modern-commercial-cleaning-hero-og.jpg" },
  "inLanguage": "en-CA",
  "dateModified": "2026-10-28"
}
```

Add to the `CleaningService` node (only with real values; the rating must match what is visible on the page and come from your own first-party review collection, not copied from Google):

```json
"foundingDate": "1989",
"description": "Office, commercial and industrial cleaning across Toronto and the GTA since 1989, after hours by a consistent crew.",
"hasMap": "https://maps.google.com/?q=243+Queen+St+W,+Toronto,+ON+M5V+1Z4",
"knowsAbout": ["Office cleaning", "Commercial janitorial services", "Industrial floor scrubbing", "Post-construction cleaning", "Medical office cleaning"],
"aggregateRating": { "@type": "AggregateRating", "ratingValue": "<visible value>", "reviewCount": "<visible count>", "bestRating": "5" }
```

Do **not** add FAQPage or HowTo for the "How it works" steps (HowTo deprecated; FAQ rich results retired May 2026).

## 5. Images

| Metric | Evergreen home | Jan-Pro home |
|---|---|---|
| `<img>` count (HTML) | 8 (+5 `<picture>` wrappers with AVIF/WebP sources) | 28 in HTML (13 are WP Rocket `data:` SVG placeholders → 15 real: logos ×3, 3 menu icons, 2 badges, 9 award SVGs) |
| Alt coverage | 1/8 meaningful ("Evergreen Cleaning Service Toronto logo"); hero `alt=""` (behind a gradient overlay, `z-index:-1`, arguably decorative); 3 service-card photos `alt=""` (not decorative — they illustrate office / lobby / warehouse cleaning); 3 blog thumbnails `alt=""` **and** are the only content of their `<a>` (no link text) | All real images have alt; several are filename-style ("entreprenuermag 1commercialclean", "franchisebizreview top200franchise"); 1 empty-alt logo in footer |
| Formats | AVIF → WebP → JPEG fallbacks via `<picture>`; blog thumbs JPEG only | PNG + SVG; no AVIF/WebP |
| Sizes (transfer) | hero mobile 640×800 AVIF 23 KB; hero 1600 AVIF 45 KB (JPEG fallback 102 KB); card AVIFs 26–30 KB; logo 6 KB; OG JPG 79 KB. Nothing over 200 KB ✓ | Shield 4 KB, badge 5 KB, logos 40 KB each, LCP gallery PNG (`philip-cedra-backtoback_REV-2-optim.png`) within 34 KB total image transfer |
| width/height set | 8/8 ✓ (CLS 0) | set on all ✓ |
| Lazy loading | native: hero `loading="eager"` + `fetchpriority="high"`; 6 below-fold `loading="lazy"` ✓ (`lazy_method: native`) | WP Rocket JS lazy-load (`data-lazy-src`, `lazy_method: js-generic/wp-rocket`) — do not flag missing native `loading` |
| `sizes` | hero `100vw` + `(max-width:640px)` art-direction; cards `(min-width: 992px) 360px, 100vw` ✓ | n/a |
| LCP candidate | `section#hero > div.hero-slides > picture.hero-slide > img` (hero AVIF) on mobile & desktop; on desktop the 1600w AVIF takes 676 ms to download under Lighthouse throttling | `div.wpb_gallery` background/gallery PNG (mobile & desktop); Lighthouse `lcp-discovery` fails (not discoverable from HTML, lazy-loaded by JS) |
| Cache TTL | image CDN `max-age=86400` (Lighthouse flags 52 KB "cache-insight"; raise to ≥1 year with hashed filenames) | OK |

## 6. Performance (measured, not estimated)

Lighthouse 13.5.0 via Browserless (simulated throttling: mobile = slow-4G 150 ms RTT, 1.6 Mbps, 4× CPU):

| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | TTI | Transfer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Evergreen home — mobile | **63** | 100 | 77 | 100 | 2.0 s | **4.6 s** | **840 ms** | 0 | 2.0 s | 7.7 s | 652 KiB / 36 req |
| Evergreen home — desktop | 88 | 100 | 77 | 100 | 0.6 s | 2.2 s | 70 ms | 0 | 0.8 s | 2.2 s | 631 KiB |
| Jan-Pro home — mobile | 94 | 88 | 96 | 92 | 2.0 s | 2.8 s | 60 ms | 0 | 2.0 s | 2.8 s | 214 KiB |
| Jan-Pro home — desktop | 99 | 88 | 100 | 92 | 0.6 s | 0.8 s | 0 ms | 0 | 0.6 s | 0.8 s | 214 KiB |

Playwright (unthrottled, this container, Chromium; mobile = 412×915 @2.6×):

| Run | TTFB | FCP | LCP (element) | CLS | Long tasks | Requests / bytes (uncompressed) |
|---|---|---|---|---|---|---|
| Evergreen home — mobile | 238 ms | 504 ms | 620 ms (`IMG` hero-mobile-640x800.avif) | 0 | 195 ms | 30 / 1.45 MB (1.05 MB third-party JS) |
| Evergreen home — desktop | 156 ms | 392 ms | 488 ms (`IMG` hero-1600.avif) | 0 | 165 ms | 36 / 1.43 MB |
| Jan-Pro home — mobile | 188 ms | 384 ms | 792 ms (`DIV.wpb_gallery`) | 0 | 0 | 15 / 0.49 MB |
| Jan-Pro home — desktop | 262 ms | 500 ms | 924 ms (`DIV.wpb_gallery`) | 0 | 0 | 15 / 0.49 MB |

**Interpretation.** Server/TTFB (50 ms root document) and the image pipeline are good; Lighthouse's own trace observed LCP at 336 ms before simulation. The 4.6 s simulated mobile LCP and 840 ms TBT are driven by JavaScript execution competing for the main thread on a 4×-slowed CPU: `mainthread-work-breakdown` 2.6 s, `bootup-time` 1.3 s, with GTM (`gtm.js` 157 KB) and Google Ads `gtag/js` (168 KB) as the top two scripts, plus `call-tracking_9.js`. These are also the source of the two best-practices failures (third-party cookie from DoubleClick; DevTools issues). Field CrUX data was not queried; treat these as lab indicators. Secondary: image CDN cache TTL 1 day (52 KB re-download), Cloudflare Insights beacon ships 10 KB of legacy polyfills, `open-sans-italic.woff2` (51 KB) is loaded but not preloaded.

## 7. Issues found (prioritised)

**Critical**
- None (page is indexable, canonical, mobile-friendly, has one H1 and valid schema).

**High**
1. Mobile Lighthouse performance 63 (LCP 4.6 s, TBT 840 ms, TTI 7.7 s) caused by ~325 KB of Google Tag Manager / Ads / call-tracking JS on first load. Load GTM after first interaction or on `requestIdleCallback`, move the Ads conversion tag inside GTM with a consent/interaction trigger, and drop the gstatic call-tracking swap if phone numbers are already tracked via the Astro `PhoneTracking` script.
2. Proof is stale: all four embedded Google reviews are 5–6 years old and no rating/count is shown. Collect and surface recent reviews (the page already links to the Google review URL) and show "4.x ★ from N Google reviews".
3. Six content images have empty alt, and three blog-teaser links have no accessible name or anchor text (the image is the whole link). Give each card photo a descriptive alt and each teaser link its post title.

**Medium**
4. Neither target phrase appears verbatim in body copy. Add one natural sentence each, e.g. in "Why Toronto businesses choose Evergreen": "Evergreen has provided office cleaning in Toronto and commercial cleaning across the GTA since 1989."
5. No E-E-A-T people content: add an owner/operations-manager blurb with photo (the reviews already name "Art"), years in role, and the ECOLOGO/WSIB credentials as a visible trust strip.
6. No visible "last reviewed/updated" date and no `WebPage.dateModified` in schema.
7. Schema: add `foundingDate`, `description`, `hasMap`, `WebPage`; verify or remove the `SearchAction` target `/search/?q=`.
8. Image CDN `cache-control: max-age=86400` — use immutable, long-lived caching for hashed assets.
9. The quote form requires a full street address before anything else; shorten to name / business / email / phone / service for the first touch and collect the address at the walkthrough step.

**Low**
10. Add `twitter:site` (`@EvergreenClean8`).
11. Preload `open-sans-italic.woff2` or avoid italic on first paint.
12. Replace the Cloudflare Insights beacon (10 KB legacy JS) or accept it knowingly.
13. Footer column headings are H2s ("Services", "Service Areas", "Follow us on Social Media"); use `<p>`/`<h3>` or `aria` labels to keep the H2 outline about the page's content.

## 8. Rewritten metadata suggestions

Current title is already good; alternatives only if you want the exact phrases earlier:

- **Title (58):** `Office Cleaning Toronto & GTA | Commercial Cleaners Since 1989`  
  or keep: `Office & Commercial Cleaning in Toronto & GTA | Evergreen` (56)
- **Meta description (157):** `Office and commercial cleaning in Toronto and the GTA since 1989. After-hours crews, one account executive, WSIB-covered staff. Book a free on-site walkthrough.`
- **H1 (keep structure, add intent words):** `Office & Commercial Cleaning in Toronto and the GTA` → `Office Cleaning & Commercial Janitorial Services in Toronto and the GTA`
- **Hero sub-line:** add "Toronto office cleaning" entity: `Recurring office cleaning, janitorial and floor care for Toronto offices, clinics, managed buildings and industrial sites — after hours, by the same crew every visit.`
- **H2 tweak:** "Why Toronto businesses choose Evergreen" → `Why Toronto businesses choose Evergreen for office and commercial cleaning`

## 9. Recommendations summary (expected impact)

| # | Action | Impact |
|---|---|---|
| 1 | Defer GTM/Ads/call-tracking until interaction or idle | Mobile perf 63 → likely 85+, TBT under 200 ms (Jan-Pro already 94 with ~20 KB JS) |
| 2 | Fresh reviews + visible aggregate rating + `AggregateRating` schema | Trust, CTR from SERP (stars where eligible), conversion |
| 3 | Alt text + anchor text on 6 images / 3 links | Image SEO, accessibility, link equity to blog |
| 4 | Exact-phrase sentences + owner/credentials block + dated "last updated" | Relevance for both target queries; E-E-A-T |
| 5 | Schema additions (WebPage, foundingDate, hasMap, description) and SearchAction verification | Entity completeness; avoid invalid SearchAction |
| 6 | Long cache TTL on img CDN, preload italic font | Repeat-visit speed, minor LCP/FCP |

## 10. Jan-Pro homepage — notable issues (for context)

- Main-content copy ≈470 words; H1 is a slogan; two identical "I am looking for" H2s; franchise recruiting shares the page with customer acquisition (18 "franchise" mentions).
- No Toronto/Canada targeting; `lang="en-US"`; no hreflang to Canadian properties. Not a direct SERP competitor for "office cleaning toronto" on this URL — the competitor to watch is the Jan-Pro Canadian/Toronto franchise page, not jan-pro.com.
- Lighthouse a11y 88 (contrast, unlabeled ZIP input, 4 links without names), SEO 92 (non-descriptive link text), low-res icons; `VideoObject` schema with YouTube boilerplate description; `&amp;` inside JSON-LD strings.
- Strengths worth copying: 214 KiB total transfer, LCP 0.8 s desktop / 2.8 s mobile, `WebPage.dateModified`, award/third-party badges as visible authority signals, ZIP-code location finder.

# SEO Re-audit: www.evergreencleaningservice.ca

Second full audit, 6 November 2026 (evening, finished 7 Nov 00:10 UTC), after Phases 1–4 were merged and deployed. First audit: `../FULL-AUDIT-REPORT.md` (morning of 6 Nov, 76/100).

## Executive summary

**SEO Health Score: 82 / 100** (was 76)

| Category | Weight | Was | Now | Source |
|---|---|---|---|---|
| Technical SEO | 22% | 86 | **91** | findings/technical.md (90), findings/sitemap.md (94) |
| Content Quality | 23% | 68 | **72** | findings/content.md; findings/sxo.md (62) informs it |
| On-Page SEO | 20% | 82 | **86** | findings/onpage.md (88), less 2 for the cluster gaps that remain |
| Schema / Structured Data | 10% | 82 | **86** | findings/schema.md |
| Performance (CWV) | 10% | 62 | **80** | findings/performance.md |
| AI Search Readiness | 10% | 68 | **74** | findings/geo.md (72), findings/agentic.md (77) |
| Images | 5% | 82 | **90** | findings/images.md |

Supplementary scores, not in the weighted total: Local SEO **61** (was 56), Search Experience **62** (was 58), Visual and mobile **87** (was 80), Agent readiness **77** (was 72).

Weighted total: 20.0 + 16.6 + 17.2 + 8.6 + 8.0 + 7.4 + 4.5 = 82.3. The component weights inside each category are the same as in the first audit, so the two scores are comparable.

**The short version.** Everything the developer could fix on the site moved, and nothing ranking-relevant went backwards. Every one of the 89 crawled URLs returns 200, all 60 sitemap URLs are indexable and self-canonical, the drift monitor shows no change since the baseline, and real visitors pass all three Core Web Vitals (p75 LCP 0.98 s, INP 32 ms, CLS 0.002). What did not move is the part that needs the client: named people, real prices, photos of real work, reviews and directory listings. Those now cap most category scores.

**Three problems were introduced by today's own fixes** and are the first thing to correct:

1. **Google Ads call tracking on paid visits (Medium).** The container's "calls from website" tag (confirmed in the live `gtm.js`: `__awcc`, forwarding for "(416) 803-4880") swaps in a Google forwarding number only after the tags load. Since Phase 1 they load after the page's `load` event. A paid visitor who taps a phone link before that dials the real number, and Ads records no call. The loader's phone-tap trigger cannot help, because the dialler opens on the same tap. The container also has no `click_to_call` trigger, although the comment in `src/components/GoogleTagManager.astro` says conversions fire on it.
2. **A wrong count in a sentence written for AI engines (Medium).** `/services/commercial-cleaning/` says "Toronto and ten GTA municipalities", then lists nine (`src/content/services/commercial-cleaning.md` line 190, from the GEO fixes).
3. **An unsupportable homepage claim (Medium).** "Four things, each written into every contract since 1989" (`src/components/home/WhyEvergreen.astro` line 32) includes a 2-hour reply, which cannot be a contract term, and nobody has evidenced the 1989 claim. The 2-hour reply also appears unqualified in the hero and `llms.txt`, while a guide says "during office hours".

### Top findings now

1. No named person anywhere: no owner, account executive, author or reviewer, and no `Person` schema (High, client).
2. The cost guide still gives no real price; the title is now honest, but the searcher's question is not answered (High, client).
3. Third-party proof is thin: 7 Google reviews (4 from 2020–2021), no rating shown, no case study, stock imagery, no citations found under the current name, social profiles still under the old name (High, client).
4. The deferred tag loader hides calls from paid visits (Medium, developer plus Ads owner).
5. The four new location pages reuse the same Google reviews under "What a client says", and Durham states operations ("crews come out on fixed evenings") that the client has not confirmed (Medium, developer plus client).

### What improved since the morning (observed on the live site)

- Mobile homepage Lighthouse 51 → 87 (median of 5), simulated LCP 6.8 s → 2.4 s, italic font no longer loaded.
- 4 new location pages (North York, Scarborough, Richmond Hill, Durham Region) and a 2,040-word office cleaning checklist, all indexable, linked sitewide, with Service/WebPage/FAQPage or BlogPosting JSON-LD.
- Sitemap and `WebPage.dateModified` now date each page from its own content (23 of 23 agree to the second).
- Footer anchors fixed; 34 of 36 internal-link matrix rows live; posts with no contextual inlink 13 → 5.
- Blog pass: seven retitles, two merges with single-hop 301s, unsourced statistics removed or cited (two minor leftovers, see Content).
- SearchAction removed, address string fixed, `/privacy/` http link fixed, image dimensions on every image, 640w card variants, legacy 300×150 thumbnails gone, gallery rebuilt with captions.
- Non-script CSP directives enforced; IndexNow live (32 URLs submitted, HTTP 202).
- Homepage definitional opener, question-led H2s on the two pillar pages, About-page fact block, documented email/phone path for agents blocked by reCAPTCHA.
- Mobile: video bubble no longer covers the hero, 24 px checkboxes, clearer form borders, equal service-hero buttons, trust row on location pages.

### How this was measured

- A fresh crawl of 89 URLs, `robots.txt`, both sitemaps, `llms.txt` and headers, taken this evening after all deploys.
- Screenshots at desktop 1366 and Pixel 7, plus Playwright checks at 360 px with reduced motion and with JavaScript off.
- Cloudflare Web Analytics field data for the last 6 days (106 human beacons).
- Lighthouse 12.8.2 median-of-5 from 19:30 UTC, after the last performance-relevant change.
- `npm run verify:indexing -- production`: 24 of 24 passed.
- `npm run seo:drift`: 0 critical, 0 warnings.
- Twelve specialist reviews. Each Critical/High finding, each "Regressed" status and each specialist's three main "Fixed" claims went to a separate reviewer told to disprove them. A final critic then looked for gaps and contradictions. The verifiers downgraded eight High findings to Medium, one Regressed item to a plain Low, and five "Fixed" claims to "Partly fixed". This report uses the corrected verdicts.
- Two probes sent an empty POST to `/api/submit-lead`; both were refused by the CAPTCHA check (403) before any lead was created. Nothing else was written to any service.

**Data limits:** no Search Console, GA4, Google Ads, Google Business Profile, CrUX or backlink access. The SERP checks use a non-Google index (no local pack, no AI Overview). The field data is small: 106 beacons, 18–28 on mobile.

---

## 1. Technical SEO (91, was 86)

**Works:** all 89 URLs 200; 0 broken or http:// internal links; 0 canonical mismatches; 0 duplicate titles or descriptions. Noindex set (27 archive, LP and thank-you URLs) correct and absent from the sitemap. Merged posts, `/tag/plants/`, `/insights/page/4/` and `/tag/office/page/2/` all 301 in one hop. Real 404. HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, and an enforced `frame-ancestors / base-uri / form-action / object-src` CSP next to the full report-only policy. Brotli, immutable `/_astro/*`, static HTML with content and JSON-LD before JavaScript. IndexNow key file served correctly. Sitemap 60/60 healthy with per-page lastmod.

| Item (first audit) | Status |
|---|---|
| `/privacy/` http link | Fixed |
| 13 images without dimensions | Fixed |
| Shared-template lastmod cluster | Fixed (remaining clusters of 7/6/6/4 match real batch edits) |
| CSP report-only | Partly fixed (non-script directives enforced) |
| HTML `Content-Type` without charset | Open |
| Content-Signal lines (Lighthouse SEO 92) | Open, owner decision |
| Two-hop http/apex redirect without slash | Open, Low |
| HSTS without includeSubDomains/preload | Open, deliberate |
| Noindex tag archives in the link graph | Open, Low |

| Severity | New or open finding | Fix |
|---|---|---|
| Low | HTML still served as `text/html` with no charset (the meta tag at byte 40 means browsers are fine) | `Content-Type: text/html; charset=utf-8` for HTML routes in `public/_headers` |
| Info | The report-only CSP lacks `pagead2.googlesyndication.com`, `adservice.google.com` and `cct.google`, which the live container uses; enforcing it as written on ~12 Nov would break parts of the Ads tags | Read `/api/csp-report` first and add the hosts the container really uses |
| Info | IndexNow submits sitemap URLs only, so redirected old URLs are never submitted | Optional: also submit the old URLs on deploys that add redirects |

## 2. Content Quality (72, was 68)

Weighted E-E-A-T about 66 (was 64); AI citation readiness 76 (was 72). Of 32 first-audit content items: 12 Fixed, 8 Partly fixed, 12 Open, none Regressed.

**Fixed:** floor-post defects; the unsourced statistics the first audit named; both merges; seven retitles with answer-first descriptions; footer anchors; Mississauga and Vaughan generic voice; over-length metadata; homepage label headings; the cost guide's price-promising title and duplicate H2.

**The new pages:** the four location pages are not doorways. Each has its own corridors, building types, drive times, city FAQs and an honest "no office here" line, and 64–69% of each page's text is unique against the other ten. But 9 of 11 location pages share one H2 skeleton and the same opening sentence, and the "What a client says" block reuses reviews (Edward Sherman, May 2021, on Downtown, North York and Durham; Michael Katchen on Mississauga and Scarborough; Andy Handy on Vaughan and Richmond Hill), none from that city. The new checklist is the strongest content on the site.

| Severity | Finding | Fix |
|---|---|---|
| High | No named owner, account executive, author or reviewer; no `founder`, `employee` or `reviewedBy` anywhere (customers in reviews are named, the business's own people are not) | Client: names, roles, years, photos. Developer: "Who you deal with" on /about-us/, `Person` nodes in `src/lib/schema.ts`, an optional `reviewedBy` in `src/content.config.ts` shown on the guides |
| Medium | Cost guide gives no real price (all figures labelled hypothetical); severity down from High now that the title is honest | Client: price bands by office size and frequency from recent proposals |
| Medium | Stock-only imagery, no case studies; the gallery says it "illustrates the kinds of work" without saying the photos are stock | Add "Illustrative stock photographs" to the gallery intro and captions now; photoshoot and 2–3 case studies through `src/content/projects` |
| Medium | Location pages: reused reviews framed as "a client", shared skeleton and opener; Durham states unconfirmed operations | Show a review on a city page only if the reviewer is there, or use a sitewide strip; lead each page with its district sentence; get the client to confirm Durham or noindex it |
| Medium | Homepage claim "written into every contract since 1989" and an unqualified 2-hour reply | "Four commitments we make to every client", and "within 2 hours during office hours (Mon–Fri, 7am–6pm)" in `WhyEvergreen.astro`, `Hero.astro` and `public/llms.txt` |
| Medium | WSIB, insurance and bonding asserted, never evidenced | Client: insurer, coverage, WSIB clearance or "certificate on request" |
| Low | Two leftover unsourced claims: "Almost 20 million individuals are allergic to dust mites" (day/night post, also the typo "may no appreciate") and "According to experts" (products-not-to-mix post) | Cite or delete in `src/content/blog/` |
| Low | Homepage testimonials (Carmichael, Robinson, Lockheart) still undated and unsourced | Client: confirm and date, or remove from `Testimonials.astro` |
| Low | /green-clean-products/ still mostly manufacturer copy; contact page has no "what happens next"; /insights/page/2–3 thin but indexable | Rewrite in house words; add next steps; leave pagination |
| Low | Footer emits five H2s on every page; cost guide keeps an "In this guide" H2; "At a glance" blocks are tables of contents on 19 pages | `<p>` titles in `Footer.astro`; drop the H2; turn the blocks into facts or remove them |
| Low | 8 service and 2 industry pages still open with fragments rather than a definition; the office-cleaning definition now appears twice | One definitional first sentence per page; keep the office definition under its H2 only |
| Low | "East York" and "York" anchors point to the Downtown page | Plain text, or a note on the Downtown page that it covers them |

## 3. On-Page SEO (86, was 82)

**Works:** one H1 everywhere, unique titles and descriptions, 18 of 24 post titles branded (22 of 25 had no brand before), 34 of 36 matrix links live, all 11 location pages link both planning guides with varied anchors.

| Severity | Finding | Fix |
|---|---|---|
| Medium | The cost guide's title and H1 lost the word "cost" ("How Office Cleaning Is Priced in Toronto"); its target query now appears only in the slug, H2s and FAQ | `seoTitle: "Office Cleaning Costs in Toronto: How Pricing Works"` and H1 "What Office Cleaning Costs in Toronto, and Why"; honest and still on-query |
| Medium | Five posts have no contextual inlink (relocation, fridge, home office, office layout, robotic); nine have only one; the sidebar still lists the five newest posts | Reverse links from post-construction, break rooms, floor-stripping/industrial, disinfection, clinics and the pillar (matrix row 4); a cluster-based "Related guides" sidebar |
| Low | Six descriptions over 160 characters (the 4 new location pages, /locations/ 185, post-construction 165) and two titles over 60 (Durham 68, checklist 62) | Trim; the checklist's `seoTitle` bypasses the 60-character rule in `pageTitle()` |
| Low | Four title-suffix variants | One pattern in `src/lib/title.ts` and the money pages |
| Low | Two misdirected anchors ("professional cleaning" → /about-us/, "professional cleaning company" → /services/) and two brand-name anchors; 18 posts end with the same templated sentence | Repoint and vary in `src/content/blog/*.md` |
| Low | /locations/ hub grew only by four new one-line cards; the original seven lines are unchanged | A short paragraph per city, grouped by region |

## 4. Schema and Structured Data (86, was 82)

All blocks valid by hand-check: no duplicate `@id`, no deprecated types, every breadcrumb position and URL valid. SearchAction removed; `streetAddress` "243 Queen St W"; 4 new location pages carry complete Service/WebPage/BreadcrumbList/FAQPage; the checklist has a complete BlogPosting; `WebPage.dateModified` equals the sitemap lastmod on 23 of 23 pages.

| Severity | Finding | Fix |
|---|---|---|
| Low | Organisation `areaServed` still 10 cities without North York and Scarborough, which now have pages; Durham Region typed as `City` | Add them (and East York, York) in `src/lib/schema.ts`; `AdministrativeArea` for Durham, or its three cities |
| Low | Breadcrumb root is "Home" on three guides (now including the checklist), the site name elsewhere | Use `site.name` in the guide breadcrumb builder |
| Low | `logo` and `image` are the same 884×265 banner; location Service nodes thinner than service-page ones; dates at midnight UTC | Square logo and real photos (client); consistency fixes |
| Info | FAQPage on 24 pages earns no rich result since May 2026 | Owner decision; harmless |

## 5. Performance (80, was 62)

| Page (mobile, median of 5) | Perf (was) | Simulated LCP (was) | TBT (was) |
|---|---|---|---|
| Home | 87 (51) | 2.43 s (6.85 s) | 425 ms (1,316) |
| Home, desktop | 99 (97) | 0.89 s (1.17 s) | 43 ms (42) |
| /services/office-cleaning/ | 88 (88) | 1.56 s (1.59 s) | 450 ms (453) |
| Blog post | 89 (86) | 1.41 s | 431 ms (536) |
| /locations/mississauga/ | 85 (83) | 2.20 s (2.43 s) | 522 ms (587) |

Field (real visitors, 6 days, 106 beacons): p75 LCP 0.98 s, INP 32 ms, CLS 0.002, all good. This data existed before the fixes too (the first audit missed it), so it is not evidence of an improvement; the before/after field comparison is due around 12 November.

| Severity | Finding | Fix |
|---|---|---|
| Medium | Home field LCP p75 2.24 s (28 beacons), close to the 2.5 s line; sitewide hides it | Re-check at 14 days; if it stays above 2.0 s, try the mobile hero preload in `Hero.astro` |
| Medium (score only) | Google tags still block the main thread for 530–610 ms on every page, capping lab scores at 85–89; field INP is fine | Container hygiene (one Google tag for Ads and GA4, prune unused tags); a longer delay only with the Ads owner, and only after the paid-visit fix in section 6 |
| Low | Desktop home CLS 0.014 on `section#services`, caused by the font swap | Metric-matched fallback (`size-adjust`) in `src/styles/fonts.css`, if wanted |
| Low | Scroll-in reveal and video orb add about 23 KB on inner pages; no LCP or CLS cost observed | Leave |

## 6. AI Search Readiness (74, was 68)

GEO 72 (first audit 66, after-fix analysis 70), agent readiness 77 (was 72). Every search and AI crawler user agent gets the full page; content is identical with JavaScript off and on, so the scroll-in reveal hides nothing from crawlers (also simulated with Google's tall-viewport rendering: all visible within 1.5 s).

| Severity | Finding | Fix |
|---|---|---|
| High | No named people (see Content); weak off-site entity (no Wikipedia/Wikidata, profiles under the old name, no video) | Client |
| Medium | **Introduced today:** "Toronto and ten GTA municipalities" lists nine; the sentence names North York, Scarborough, Richmond Hill and Durham towns without linking their new pages | "Toronto and nine other GTA municipalities", plus the four links, in `commercial-cleaning.md` line 190 |
| Medium | **Introduced today:** the homepage "every contract since 1989" claim (see Content) | Reword |
| Medium | **Introduced today:** the deferred tag loader hides calls from paid visits (see summary) | In `GoogleTagManager.astro`, load the container at once on `/lp/*` and when the URL carries `gclid`, `gbraid` or `wbraid`; keep the deferral for organic visits; correct the `click_to_call` comment. Ads owner: compare "calls from website" conversions before and after the Phase 1 deploy |
| Medium | reCAPTCHA v2 still blocks agents in the form; the email/phone path is documented (High → Medium) | Make the fallback's email and phone real `mailto:`/`tel:` links and repeat them in the CAPTCHA error message; Turnstile is the owner's call |
| Low | `llms.txt` omits the checklist and the 4 new location pages | Add them; a test that fails when a location or 2026 guide is missing |
| Low | Question-led structure stopped at the two pillars; the checklist cites no sources | Building-maintenance and clinic pages next; cite CCOHS/PHAC for frequencies |

## 7. Images (90, was 82)

Fixed: the gallery (picture, AVIF/WebP, dimensions, captions), the homepage card variants, the 300×150 thumbnails. 212 of 219 images are in `<picture>` with AVIF and WebP; 0 missing alt; all 759 image URLs return 200.

Open, all Low: hero slides 2 and 3 have no `loading` attribute; 22 pages (including the 4 new location pages) share one OG image; 10 empty alts on related-post thumbnails (likely correct); three legacy logos on /green-clean-products/; one post feature image outside `<picture>`.

## 8. Local SEO (61, was 56; supplementary)

NAP is consistent everywhere ("243 Queen St W", one phone format, one postal code). The verifiers judged four High findings Medium: they are real but rest on the client.

- **Medium, client:**
  - GBP address model and category unverified.
  - No citations found under the current name (YellowPages name search, BBB; Yelp blocked).
  - 7 reviews with no rating shown; the newest is "around September 2026".
  - No local proof on any of the 11 city pages.
  - Contact page still has no hours, directions or map, and requires a street address.
- **Low, developer:**
  - Make the contact-form address optional.
  - Name the places without pages on /locations/ as "ask us" rather than "covered in exactly the same way".
  - Store the month for each review instead of "around".

## 9. Search Experience (62, was 58; supplementary)

Persona scores:

| Persona | Was | Now |
|---|---|---|
| Price-seeking owner | 45 | 50 |
| Clinic manager | 64 | 64 |
| Property manager (floors) | 61 | 66 |
| Facility manager comparing vendors | 65 | 67 |

No critical page-type mismatch. "office cleaning cost Toronto" is led by HomeStars ($30–60/hr) and Hellamaid; the cost guide still has a High intent gap. "office cleaning North York" returned only HomeStars, so a directory listing is the only way into it. "office cleaning checklist" is led by printable templates, a Medium format gap for the new guide: add a print stylesheet or a PDF, since the page says it "can be printed".

## 10. Visual and mobile (87, was 80; supplementary)

No horizontal overflow at 360 px on any page checked. Fixed: the video bubble (now appears only after the hero), checkboxes, form borders and required markers, service hero buttons. Open, all Low:
- Footer, area and "Read more" tap targets are 24–28 px: they meet WCAG 2.2's 24 px minimum but are under 44 px.
- The logo sits on an off-white box.
- The nav says "Blog" for /insights/.
- The trust row on location pages wraps unevenly.
- Full-page screenshots that do not scroll show blank bands because of the reveal (tooling only; print, reduced-motion and no-JavaScript users see everything).

---

## Needs the client or an account owner

| Who | What |
|---|---|
| Client | Owner and account-executive names, roles, years, photos; real price bands; a photoshoot and 2–3 case studies; confirm Durham travel; approve which reviews appear on which city pages; date or drop the homepage testimonials; insurer/WSIB evidence; clinic IPAC facts; whether street address must stay required |
| Google Ads owner | "Calls from website" conversions for the week before and after the Phase 1 deploy (6 Nov 15:05 UTC); GA4 page views the same |
| GBP owner | Category, address model, service area, true review count and rating, review months, steady review requests |
| Social and directories | Rename Facebook, LinkedIn and X to the current name; list or claim Bing Places, Apple Business Connect, YellowPages, HomeStars, BBB, Yelp |
| Search Console | Index status of the 5 new pages and the redirects; queries per URL for "commercial cleaning Toronto" and "office cleaning cost Toronto"; URL Inspection of one reveal page |
| Bing Webmaster Tools | Verify the site, submit the sitemap, confirm the IndexNow key |
| Cloudflare | Bot settings (Block AI bots, Bot Fight Mode, AI Crawl Control) |
| Owner decisions | Content-Signal lines; FAQPage JSON-LD; Turnstile instead of reCAPTCHA |

## Files

- `findings/*.md`: twelve specialist files plus `critic.md` (gaps, contradictions and how each was resolved).
- `ACTION-PLAN.md`: the prioritised plan.
- `audit-data.json`, `Google-SEO-Report-www.evergreencleaningservice.ca-full.pdf` and `.html`: data and the formatted report.
- `raw/` (crawl, sitemaps, headers, field data), `screenshots/`, `BRIEF.md` (the brief every reviewer worked from).

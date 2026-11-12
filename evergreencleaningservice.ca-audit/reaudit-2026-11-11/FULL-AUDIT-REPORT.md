# SEO Audit: www.evergreencleaningservice.ca, 11–12 Nov 2026

Third full audit of the live site. The data was collected on 11 Nov (crawl, sitemaps, field data, lab runs and screenshots) and the reviews ran on 12 Nov.

Previous audits:
- 6 Nov, first audit: 76/100 (`../FULL-AUDIT-REPORT.md`).
- 6–7 Nov, re-audit: 82/100 (`../reaudit-2026-11-06/FULL-AUDIT-REPORT.md`). This is the baseline here.

## Executive summary

**SEO Health Score: 84 / 100** (82 on 7 Nov, 76 on 6 Nov)

| Category | Weight | 6 Nov | 7 Nov | Now | Source |
|---|---|---|---|---|---|
| Technical SEO | 22% | 86 | 91 | **92** | findings/technical.md (92), findings/sitemap.md (93) |
| Content Quality | 23% | 68 | 72 | **74** | findings/content.md; sxo.md (63) informs it |
| On-Page SEO | 20% | 82 | 86 | **88** | findings/onpage.md (90), less 2 for the linking gaps around the two new pages |
| Schema / Structured Data | 10% | 82 | 86 | **89** | findings/schema.md |
| Performance (CWV) | 10% | 62 | 80 | **82** | findings/performance.md |
| AI Search Readiness | 10% | 68 | 74 | **75** | findings/geo.md (73), findings/agentic.md (80) |
| Images | 5% | 82 | 90 | **89** | findings/images.md |

Supplementary scores, not part of the weighted score:

| Area | 7 Nov | Now |
|---|---|---|
| Local SEO | 61 | 64 |
| Search Experience | 62 | 63 |
| Visual and mobile | 87 | 86 |
| Agent readiness | 77 | 80 |

**How the score is worked out.** The weighted sum is 20.2 + 17.0 + 17.6 + 8.9 + 8.2 + 7.5 + 4.5 = 83.9, which rounds to 84. The weights inside each category are the same as in both earlier audits, so the three scores are comparable.

**The short version:**
- **Phase A is live and works.** The 7 Nov fixes hold on the live site, and nothing regressed:
  - Paid visits load the tag container at about 0.3 s.
  - The claims, review framing, metadata, schema, charset, links and qualified reply promise are all in place.
  - Real visitors still pass all three Core Web Vitals (p75 LCP 0.80 s, INP 48 ms, CLS 0.000).
- **The new work by the other contributor is sound.** The janitorial page, the commercial cleaning quote checklist and the service-page photo heroes all build correctly. It also opens the main new items:
  - The commercial and janitorial pages define the same thing and compete for the same searches.
  - Both new pages are thinly linked.
  - The photo heroes moved the office page's lab LCP from 1.56 s to 2.38 s, still inside 2.5 s.
- **The ceiling is still the client's material.** The cost guide gives no real price, nobody is named, there are no own-work photos or case studies, and reviews are thin. These cap Content, AI Search, Local and Search Experience, as they did on 7 Nov.

### What changed since 7 Nov (all deployed)

- **Phase A (#86):** paid-visit tag loading, claims and copy corrections, location-page honesty fixes, schema areas, one breadcrumb root, no boilerplate H2s, the HTML charset, 44 px tap targets, blog links, and the `llms.txt` sync.
- **Reply promise:** the 2-hour reply now carries the office hours everywhere (#88).
- **CSP:** `img-src` now allows the Google Ads conversion pixel, and the policy is still report-only (#95).
- **robots.txt charset (#98):** shipped during the audit window at your request, so the crawl and drift baseline predate it.
- **The other contributor (0TBS):**
  - the "Week 3" commercial cleaning quote checklist post;
  - a dedicated `/services/janitorial-services/` page, which retitled the commercial cleaning page (#91);
  - photo heroes on all 13 service and industry pages (#93).

### Top findings now (after adversarial verification)

1. The cost guide gives no Evergreen price (**High**, client). The Google Ads landing pages already state "From $30/hr". Whether that figure may appear on the organic pages is the client's decision; `src/data/process.ts` records a decision to keep it off them.
2. There are no case studies or photos of real work (**High**, client). Every image is stock; the gallery now says so.
3. Third-party proof is thin (**High**, client): 7 Google reviews, the newest from around September, and no rating shown.
4. The commercial and janitorial pages overlap (**Medium**, developer; fix in progress). Both open with the same janitorial definition and both carry a "difference between" explainer. The commercial page also keeps three janitorial H2s.
5. Both new pages are thinly linked (**Medium**, developer; fix in progress):
   - the quote checklist has no in-body link from any page;
   - the janitorial page gets body links from only 3 pages;
   - five "janitorial services" anchors still point at the commercial page.

The adversarial checks moved several findings to Medium: no named people, the reCAPTCHA blocker for agents, the GBP/reviews item, the janitorial page's missing proof block and the off-site entity.

### How this was measured

- A crawl of 94 URLs, all returning 200, plus the sitemaps (62 URLs), `robots.txt`, `llms.txt` and headers.
- Six days of Cloudflare field data (55 human beacons).
- Lighthouse 12.8.2, median of 5, on six pages. Analytics and Ads hits were blocked, so the Best Practices score of 100 is an artefact of that blocking (see `raw/lab-medians.txt`).
- Screenshots at desktop 1366 and Pixel 7.
- `npm run verify:indexing -- production`: 24 of 24 checks passed.
- `npm run seo:drift`: 0 changes since the 11 Nov baseline.
- Twelve specialist reviews. A separate reviewer tried to disprove every Critical or High finding, every regression and each specialist's three main "fixed" claims. A completeness critic then looked for gaps (`findings/critic.md`).
- No form was submitted, nothing was POSTed to `/api/`, and no browser run sent analytics or Ads hits.

### Data limits

- No Search Console, GA4, Google Ads, Google Business Profile or CrUX access.
- Field data is thin: about 9 human beacons a day, 14 of them mobile across the six days.
- The SERP checks used a non-Google index.
- **The paid landing pages (`/lp/*`) were not crawled, lab-tested or screenshotted** (critic R2). The field data for `/lp/commercial-cleaning-quote/` is good (LCP 0.80 s, 9 beacons), and a live check confirmed the container loads at about 0.3 s there. A lab run with Google hits blocked is still owed.

---

## 1. Technical SEO (92; was 91)

**What works:**
- All 94 URLs return 200, with no broken or http:// internal links and no canonical mismatches.
- 30 noindex pages, none of them in the sitemap.
- The HTML charset is on every page; JS, fonts and XML are unaffected.
- The enforced CSP subset is present on every route checked.
- The sitemap is valid: 62 URLs, all indexable and self-canonical, each with an honest lastmod (the two new URLs included).
- `verify:indexing` 24/24; drift clean.

| Severity | Finding | Fix |
|---|---|---|
| Low | Service-area links and breadcrumbs on the service pages are 24–30 px; the 44 px pass missed them (critic R4) | Second fix round |
| Low | Tag-chip links to noindex archives grow with each post (161, was 149) | Drop the chips from the post template, or accept them |
| Info | A missing path without a trailing slash returns a 404 with a bare `text/html` | Accept: the 404 body declares UTF-8 and is noindex |
| Info | The CSP is still report-only. Stored reports cannot be read with this token. The three hosts the 7 Nov critic predicted were never requested in the 11 Nov browser test | Read a week of Workers Logs (dashboard), then enforce |

## 2. Content (74; was 72)

E-E-A-T is about 66. On content: 17 items are Fixed, 7 Partly fixed and 14 Open, with none Regressed.

| Severity | Finding | Fix |
|---|---|---|
| High | No Evergreen price on the cost guide, while the Ads pages state "From $30/hr" (critic R3) | Client decision |
| High | No case studies or own-work photos; all imagery is stock | Photoshoot and 2–3 case studies (client) |
| Medium | No named owner, account executive, author or reviewer (verifier: Medium) | Client supplies names |
| Medium | Commercial and janitorial pages share a definition and a "difference" explainer; the commercial page keeps three janitorial H2s | **In progress** (service-copy) |
| Low | The janitorial page repeats its definition and its contract-start steps | **In progress** |
| Low | The quote checklist repeats its exact-match phrase, uses Title Case H2s, and overlaps the cost guide's quote-comparison section | **In progress** (blog-links) |
| Low | Location descriptions share one frame; three descriptions echo their titles | Echoes **in progress**; the shared frame is acceptable |
| Low | Etobicoke and Markham sit at or just under the 60% uniqueness bar | Needs one real local fact each (client) |

## 3. On-Page SEO (88; was 86)

**Fixed since 7 Nov:**
- every description is 155 characters or fewer;
- the cost guide's title has "cost" back;
- the misdirected and brand anchors are repointed;
- the 18 identical closing sentences are now all distinct;
- all five former orphan posts have a contextual link.

| Severity | Finding | Fix |
|---|---|---|
| Medium | The quote checklist has no in-body inlink; it will be orphaned once it leaves the five newest posts | **In progress** |
| Medium | The janitorial page has body links from only 3 pages; five "janitorial services" anchors point at the commercial page | **In progress** |
| Low | The Related cards still use the cost guide's old title | **In progress** |
| Low | Ten titles have no brand; four suffix forms remain | One rule in `src/lib/title.ts` (later) |
| Info | The paginated `/insights/` pages share one H1; the sidebar has H2s | Optional |

## 4. Schema (89; was 86)

**Fixed:**
- `areaServed` is derived from `coverage.ts` (15 places);
- Durham is three `City` nodes contained in Durham Region;
- one breadcrumb root sitewide;
- the janitorial Service node and the checklist BlogPosting are valid.

**Open, all Low or Info:**
- East York and York are typed `City` (second fix round);
- dateModified offsets are mixed (`Z`, `-05:00`) and follow the build host;
- the logo and image are still the banner (client).

## 5. Performance (82; was 80)

| Page (mobile, median of 5) | 6 Nov | Now |
|---|---|---|
| Home | 87, LCP 2.43 s, TBT 425 ms | **90**, LCP 2.46 s, TBT 328 ms |
| Home, desktop | 99, LCP 0.89 s | 96, LCP 1.36 s |
| /services/office-cleaning/ | 88, LCP 1.56 s | 91, **LCP 2.38 s** (runs 2.06–2.63 s) |
| /services/janitorial-services/ (new) | — | 89, LCP 2.33 s |
| /locations/mississauga/ | 85, LCP 2.20 s | 89, LCP 2.34 s |
| How-often post | 89, LCP 1.41 s | 91, LCP 1.70 s |

The lower TBT may partly come from blocking the hit requests, so it is not established as a site change.

**Field (6 days):** p75 LCP 0.80 s, INP 48 ms, CLS 0.000, all good. The saved before/after comparison for the Phase 1 work shows no measurable change; every interval overlaps (`docs/growth/performance.md` §8).

| Severity | Finding | Fix |
|---|---|---|
| Medium | The photo heroes made the LCP element a late image on every service page. Load delay is 0.5–1.0 s because there is no preload | **In progress:** AVIF `imagesrcset` preload; drop `decoding="async"` |
| Low | The location page's LCP photo has no `fetchpriority="high"` | **In progress** |
| Medium (lab only) | Google tags still cost 400–620 ms of main-thread time | Ads/GTM owner: one Google tag, prune unused tags |
| Low | Desktop CLS is 0.014 in 2 of 5 home runs (font swap) and 0.021 in one janitorial run; the medians read 0 | Metric-matched font fallback, optional |
| Info | Too few field beacons to judge the heroes | Re-check at 28 days (about 4 Dec) |

## 6. AI Search Readiness (75; was 74)

GEO scores 73 and agent readiness 80. All crawlers get the full page, and `llms.txt` lists all 11 locations, both guides and the janitorial page. The quote checklist is the best-structured page on the site for extraction.

| Severity | Finding | Fix |
|---|---|---|
| High | The cost guide gives no price (as above) | Client |
| Medium | No named people; the off-site entity is weak, with social profiles still under the old name | Client |
| Medium | The reCAPTCHA still blocks an agent from completing the form. The `mailto:`/`tel:` fallback is live, and the CAPTCHA error message now points to it | Turnstile decision (owner) |
| Low | The `llms.txt` sync test does not cover services or industries | Second fix round |
| Low | The cost guide was edited on 7 Nov but still reports dateModified 31 Oct | Second fix round |
| Low | The janitorial page has 1 question H2 of 17 and does not name the products | Second fix round |

## 7. Images (89; was 90)

| Severity | Finding | Fix |
|---|---|---|
| Medium | The graffiti-removal hero has no 1200 px variant; its source is only 645 px, so it is stretched full-width | **In progress** (choose an honest photo or treatment) |
| Low | Two generic hero alts (property management, building maintenance) | **In progress** |
| Low | The heroes reuse gallery stock photos with no "illustrative" label (images N8, SXO S4) | Decide on a caption, or replace after the photoshoot |
| Low | Carried over: 12 empty alts on decorative cards, three legacy logos, one post image outside `<picture>`, and the home hero's width and height attributes | Backlog |

## 8. Visual (86; was 87)

The photo heroes are legible but tall on mobile.

| Severity | Finding | Fix |
|---|---|---|
| Low (verifier) | The video bubble touches the hero trust line on the janitorial page on mobile | **In progress** |
| Low | The quote-page fallback links are 22 px tall | **In progress** |
| Low | The location trust row wraps 2+1 | Backlog |

## 9. Local (64; was 61) and Search Experience (63; was 62)

**Local:**
- NAP is consistent, and the review framing on the city pages is now honest.
- The Durham FAQ still answers "Yes, all three are" for Pickering, Ajax and Oshawa, and the client has not confirmed it (Medium, client).
- Citations under the current name are still not found (Low).
- Reviews are ageing: the newest is about 2 months old (Medium, client).

**Search Experience:**

| Persona | Score |
|---|---|
| Price-seeker | about 50 |
| Clinic manager | 64 |
| Property manager | 67 |
| Facility manager | 68 |

- The janitorial page has no reviews block (Medium after verification; second fix round).
- The quote-checklist search results are mostly written for cleaning businesses pricing their own bids. The post would gain from a printable "compare two quotes" sheet (Medium).

---

## Needs the client or an account owner

| Who | What |
|---|---|
| Client | Names and roles of the owner and account executive. Real price bands, or permission to show "from $30/hr" on the organic pages. A photoshoot and case studies. Confirm Durham coverage. One real local fact each for Etobicoke and Markham. Steady review requests. |
| Google Ads owner | Ads say "within 2 hours"; the landing pages now say "within 2 hours during office hours (Mon–Fri 7am–6pm)" (critic R1). This narrows the ad promise rather than contradicting it; align the ad text if you prefer exact matching. Compare "calls from website" before and after 6 Nov. Container hygiene: one Google tag. |
| Cloudflare | A week of `csp-violation` lines in Workers Logs (or a token with Workers Observability read), then enforce the CSP. |
| Search Console | Indexing of the janitorial page and the quote checklist; whether "janitorial services toronto" splits between the two pages. |
| GBP, social and directories | Rating and count, review cadence, renaming the social profiles, listings under the current name. |

## Files

- `findings/*.md`: twelve specialist files plus `critic.md`.
- `ACTION-PLAN.md`: the plan.
- `audit-data.json` and the `Google-SEO-Report-…` PDF and HTML.
- `raw/`: crawl index, sitemaps, headers, field data and lab medians.
- `screenshots/`.
- `BRIEF.md`: the brief every specialist worked from.

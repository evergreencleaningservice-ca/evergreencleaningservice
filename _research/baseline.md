# Phase 1 baseline — recorded before the launch-readiness work

Everything below was **measured**, on the deployed staging site, on 2026-09-21,
at commit `493cade`. It is the reference the final acceptance report compares
against. Nothing here is estimated.

Staging   https://evergreencleaningservice.10xconnections.com
Live      https://www.evergreencleaningservice.ca (client's WordPress, untouched)

---

## 1.1 Build

| | |
|---|---|
| `npm run build` (production) | **refuses**, by design — `scripts/preflight.mjs` blocks a production build with no real captcha site key |
| `npm run build:preview` (staging) | **succeeds** — 77 pages, 130 redirect rules, 957 image references repointed |

Both outcomes are reproducible. The production refusal is the guard working, not
a failure: a production build with the test key would reject every real lead.

## 1.2 Test suite — THERE ISN'T ONE

`package.json` has **no test script and no test runner**; there are no `.test.`
or `.spec.` files anywhere in the repo. Dependencies are `@astrojs/rss`,
`@astrojs/sitemap`, `@neondatabase/serverless`, `astro`, `wrangler` — nothing
else.

So "run the existing test suite" has no answer. The brief's Phase 2 and Phase 3
both require automated tests, so a runner has to be introduced as part of that
work. Recorded here rather than glossed, because "tests pass" would be a false
statement about a suite that does not exist.

## 1.3 Crawl — 69 sitemap URLs

| Measure | Value |
|---|---|
| Sitemap URLs | **69** |
| Status codes | **69 × 200**, nothing else |
| Sitemap hostname | `www.evergreencleaningservice.ca` (already the production origin) |
| Titles | 69 present, **69 unique** |
| Descriptions | 69 present, **69 unique** |
| Canonicals | 69 present, all on `www.evergreencleaningservice.ca` |
| `robots` meta | **absent on every page** — staging relies on the header |
| `X-Robots-Tag` | `noindex, nofollow` on every page |
| JSON-LD blocks per page | 1–3 |
| Broken internal links | **0** |
| Redirect chains | **0** |

### Pages with two H1 elements — 6

| Path | The two H1s |
|---|---|
| `/a-cleaning-checklist-for-your-retail-store/` | "A Cleaning Checklist For Your Retail Store" + "Retail Store Cleaning" |
| `/ask-the-office-cleaners-cleaning-break-rooms/` | "Ask the Office Cleaners: Cleaning Break Rooms" + "Cleaning Office Break Rooms" |
| `/insights/` | "News" + "News" |
| `/insights/page/2/` | "News" + "News" |
| `/insights/page/3/` | "News" + "News" |
| `/insights/page/4/` | "News" + "News" |

The `/insights/` pages carry a visible page-header H1 and a second
screen-reader-only H1 — a faithful port of WordPress's markup, and still two H1s.

### Internal links pointing through a redirect — 29 targets

Zero are broken and none chains, but each costs a hop:

| Target | Linked from | Redirects to |
|---|---|---|
| `/services/disinfection-cleaning-service/` | **69 pages** (main nav) | `/services/disinfection-cleaning/` |
| `/services/emergency-cleaning-services/` | **69 pages** (main nav) | `/services/emergency-cleaning/` |
| 26 × `/tag/<slug>/` | **59 pages** (sidebar tag cloud) | `/category/blog/` |
| `/testimonials/` | 1 page | `/reviews/` |

The 26 tag links all land on the same page, so the tag cloud passes 26 identical
redirects from 59 pages and offers a reader nothing distinct.

## 1.4 Lighthouse — mobile, 3 runs, median

Homepage, throttled mobile, median of three:

| Category | Runs | **Median** | Target |
|---|---|---|---|
| Performance | 46 / 51 / 52 | **51** | ≥ 85 |
| Accessibility | 87 / 87 / 87 | **87** | ≥ 95 |
| Best Practices | 75 / 75 / 75 | **75** | ≥ 95 |
| SEO | 69 / 69 / 69 | **69** | ≥ 95 |

| Metric | Median | Target |
|---|---|---|
| LCP | **6.19 s** | ≤ 2.5 s |
| CLS | **0.001** | ≤ 0.1 — already passing |
| TBT | 762 ms | — |
| FCP | 2.23 s | — |

**The SEO 69 is an artefact of staging, not a defect.** The only failing SEO
audit is `is-crawlable` — "Page is blocked from indexing" — which is the
`X-Robots-Tag` doing exactly what it is there for. It will resolve on the
production origin and must be re-measured there before anyone reads it as a
result.

**The LCP element is a CSS `background-image`** on `.hero-slide`. That is the
single biggest finding in this baseline: a background image cannot carry
`fetchpriority`, cannot be given a `srcset`, and cannot be usefully preloaded,
so the hero is structurally incapable of a good LCP in its current form. Phase 8
has to change the element, not just the file.

Failing accessibility audits: colour contrast (32 elements), heading order (7),
links distinguished by colour alone (1), touch-target size (1).
Failing best-practices audits: third-party cookies (3), one console error, one
DevTools issue.

## 1.5 Known-correct behaviour to preserve

Recorded so a later change cannot quietly undo it:

- 69 unique titles, 69 unique descriptions, 69 canonicals on the production origin
- `CleaningService` + `WebSite` JSON-LD in the global head
- 130 redirect rules, including 101 legacy `/wp-content/uploads/…` image URLs
- Staging `noindex, nofollow`; production must not inherit it
- CLS already at 0.001

## 1.6 The GTM container, read rather than assumed

Measured 21 Sep 2026 by fetching `https://www.googletagmanager.com/gtm.js?id=GTM-5PRC4HBV`
(477,122 bytes) and reading its `macros`, `predicates`, `rules` and `tags`
arrays. This section exists because an earlier claim in this session —
that the `FormRuntime` ordering defect was "actively costing money" — was
asserted without checking the container. It was wrong twice over: the code
has never run on production (production is still WordPress), and the
container has no trigger that would have heard it.

**What the container actually contains.**

| | |
|---|---|
| Google Ads account | `AW-16819334998` (macro 5) |
| Conversion labels | `lkxPCIq_14oaENbeitQ-`, `BzWyCJzt44oaENbeitQ-`, `ERU-CJ_t44oaENbeitQ-` |
| GA4 | `G-R27QW21PMT` |
| Microsoft Advertising UET | `187178776`, queue `uetq_sk` |

**Its triggers, decoded from `rules` and `predicates`:**

| Rule | Condition | Fires |
|---|---|---|
| 1 | `event == gtm.js` | the page-load tags, GA4 config, conversion linker |
| 2 | `event == gtm.formSubmit` **and** `gtm.elementId == "wpforms-form-1384"` | Ads conversion + UET |
| 3 | `event == gtm.formSubmit` **and** `gtm.elementId == "wpforms-form-1381"` | Ads conversion + UET |
| 4 | `event == gtm.linkClick` **and** the href starts with `mailto:` | Ads conversion |

Counted in the container source: `lead_form_submission` **0**,
`lead_form_confirmed` **0**, `thank-you` **0**, `tel:` **0**,
`click_to_call` **0**, `phone_click` **0**.

**Four consequences, all of them launch items rather than code defects:**

1. **Conversions would be zero, not inflated.** The two conversion triggers
   are gated on `gtm.elementId` being a WPForms DOM id. Neither id exists on
   this site, and these forms call `preventDefault()` and post by `fetch`.
   The container must gain a Custom Event trigger on `lead_form_submission`
   (and, for the landing pages' destination conversion, `lead_form_confirmed`)
   before the DNS cutover, or Smart Bidding loses its signal on day one.
2. **Click-to-call has never been tracked, on either site.** There is no
   `tel:` trigger — only `mailto:`. The `click_to_call` event
   `LandingLayout.astro` already pushes goes nowhere today. Phase 11 is
   therefore new tracking, not a port.
3. **Enhanced conversions depend on SearchKings' own script.** Macro 3 reads
   `sessionStorage.getItem("searchkings_galaxy_tracking_event_data")` and
   feeds macro 4, the enhanced-conversions data source. That script does not
   exist on this site, and will not exist anywhere once SearchKings is out.
   Enhanced conversions degrade to the `AUTO` collector (macro 17) unless the
   container is rebuilt.
4. **The container is configured for WPForms field names.** Macro 16 maps
   `wpforms[fields][0][first]` → "First name" and so on, with a click listener
   bound to `form`. None of those selectors match this site.

**Who can act on this is blocker A1** in the question list sent to
Harjit@BrandingCentres.com: who owns the Google Ads, GTM and GA4 accounts once
SearchKings is out. Nothing in this repository can change a container it does
not have credentials for.

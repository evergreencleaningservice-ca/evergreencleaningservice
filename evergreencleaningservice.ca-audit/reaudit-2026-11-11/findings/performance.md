Score: 82/100
Previous: 80/100 (re-audit 7 Nov)

# Performance / Core Web Vitals, third audit: www.evergreencleaningservice.ca (11-12 Nov 2026)

## Evidence base
- Lab: Lighthouse 12.8.2, median of 5, mobile simulated throttling, 11 Nov ~22:00 UTC, with GA4/Ads/RUM hits blocked (`raw/lab-medians.txt` plus my re-read of the JSON in the scratchpad `lab3/` folder: LCP subparts, prioritize-lcp-image, request lists). I did not re-run Lighthouse.
- Field: `raw/cwv-field-6d.txt` (Cloudflare Web Analytics, 6 days to 11 Nov 21:56 UTC, 55 human beacons) and `docs/growth/performance.md` section 8 (saved before/after, 122 vs 47 beacons). Not CrUX.
- Comparison caveat: the lab ran with the Ads/GA hits blocked. That is why best-practices reads 100 (was 79) and part of TBT may be lower. Neither is a site change. Perf and TBT gains below are "not established".

## Core Web Vitals status (field, p75, sitewide, 6 days)
| Metric | p75 | Verdict | Caveat |
|---|---|---|---|
| LCP | 0.80 s (95.3% good; CI 0.40-1.51 s, n=43) | Pass | Mobile n=11 (0.80 s), no CI |
| INP | 48 ms (100% good; CI 16-72 ms, n=30) | Pass | Mobile n=2: no mobile INP evidence at all |
| CLS | 0.000 (100% good) | Pass | `/lp/` page 0.018 (n=9), `/contact-us/` 0.037 (n=7), both good |

Saved before/after (docs section 8): every CI overlaps, so "no change, better or worse". Honest reading: passes before and after. Volume fell from about 21 to about 9 human beacons a day; unexplained by this data (needs GA4).

## Lab (mobile, median of 5)
| Page | Perf (6 Nov) | LCP s (6 Nov) | TBT ms (6 Nov) | CLS | LCP element |
|---|---|---|---|---|---|
| Home | 90 (87) | 2.46 (2.43) | 328 (425) | 0 | hero slide 1 img |
| Home desktop | 96 (99) | 1.36 (0.89) | 30 (43) | 0 (was 0.014) | hero img |
| /services/office-cleaning/ | 91 (88) | 2.38 (1.56) | 313 (450) | 0 | new photo hero |
| /services/janitorial-services/ | 89 (new) | 2.33 | 357 | 0 | new photo hero |
| /locations/mississauga/ | 89 (85) | 2.34 (2.20) | 332 (522) | 0 | in-body `figure.page-photo` img |
| Post (how-often) | 91 (89) | 1.70 (1.41) | 346 (431) | 0 | text paragraph |

Run spread is 5 to 9 points on inner pages (office 86-94, post 85-95), so perf changes of 1-3 points are noise. Home desktop LCP runs 0.96-1.57 s: 0.89 to 1.36 s is within that spread but not better. Requests/weight: office 34 / 543 KB, janitorial 33 / 529 KB, Mississauga 33 / 527 KB (was 32 / 532 KB and 31-33 / 517 KB).

## 1. Status of re-audit findings (and critic D1, D6)
| # | Finding (7 Nov file) | Status | Evidence |
|---|---|---|---|
| 1 | Third-party tags drive TBT (partly fixed) | **Partly fixed** (unchanged) | Home TBT 328 ms, inner 313-357 ms, third-party wasted time 400-620 ms across the 5 office runs. Gains vs 6 Nov unproven because hits were blocked. gtm.js still fires on idle after `load`. |
| 1b | Comments name old GA/AW IDs | **Open** (Info, not re-checked beyond 7 Nov; no repo change reported) | I did not re-read `GoogleTagManager.astro`; treat as still open. |
| 2 | Simulated LCP artefact; field caveat | **Fixed (score)** | Home 2.46 s mobile, stable. Field home LCP now 0.26 s (n=18). See N5 on the contradictory 2.24 s earlier figure. |
| 3 | Hero slides 2/3 fetched after load | **Still passing** | Not re-traced for slides; home LCP breakdown unchanged (TTFB 600, load delay 950, load 765, render 89 ms in run 3). Critic D6: unresolved, low impact, I did not re-open it. |
| 4 | Italic font on home | **Fixed** | Not regressed; I saw no italic request in the office/home request lists I filtered; did not re-count. |
| 5 | Preconnect hints | **Not applicable** | |
| 6 | Inline CSS / DOM | **Open (accepted)** | Not re-measured. |
| 7 | Oversized service-card images (critic D1: change to Fixed) | **Fixed** | Critic D1 accepted: 640w sources and a `calc(100vw - 30px)` `sizes` exist on the cards; Lighthouse fetching 768 at DPR 1.75 is correct. I did not re-inspect home card markup this run, so this rests on the critic's check. |
| 8 | Caching | **Fixed (docs only)** | Unchanged; not re-checked. |
| 9 | CF Web Analytics beacon on every page | **Open** | Still the field source (55 beacons this week). Keep. |
| 10 | LeadVideo orb | **Open (low)** | Not re-traced. |
| 11 | INP risk, thin mobile data | **Open, worse evidence** | Mobile INP n=2 this window (was 18). Cannot conclude anything about mobile INP. |
| N1 | Home field LCP 2.24 s near the line | **Cannot reconcile** | Now 0.26 s (n=18). docs section 8 says before-deploy home was 0.97 s (n=30), where the 7 Nov file said 2.24 s (n=28) for a similar window. Two different home figures for the same period: one of the two tools or windows is wrong. Treat the per-path number as noise. Lab 2.46 s mobile is the stricter, consistent figure. |
| N2 | Desktop CLS 0.014 from font swap | **Fixed in this run, not explained** | Desktop CLS 0 in the median; I did not check all 5 runs or why. Do not credit a code fix. |
| N3 | Reveal script | **Open (verify)** | Search Console live test never done by me. No LCP regression where the LCP element is not hidden by reveal. |
| N4 | Orb in load window | **Open (low)** | Unchanged. |
| N5 | Third-party blocking 530-610 ms | **Partly** | 400-620 ms across office runs (hits blocked, so the DoubleClick cost is excluded). Still the lab ceiling. |
| N6 | Mobile INP evidence thin | **Open** | See 11. |

## 2. New findings

### P1. Photo heroes (#93) are correctly loaded but make the LCP element a late image on every service page. Severity: Medium
- Markup (live, `/services/office-cleaning/`, `/services/janitorial-services/`; source `src/components/OfferPage.astro` L151-170): `<picture>` with AVIF, WebP and JPG sources, `sizes="100vw"`, 480/768/1200 widths, `width="1200" height="800"`, `loading="eager"`, `fetchpriority="high"`, `decoding="async"`. Lighthouse lcp-discovery checks all pass on office and janitorial (priority hinted, discoverable in the initial document, not lazy). No CLS: image is `position:absolute; inset:0` with `object-fit:cover`.
- Sized right: the mobile hero box is 412 x 513 to 574 CSS px; at DPR 1.75 Lighthouse picks the 768 AVIF (14.8 KB office, 18.3 KB janitorial), so there is no oversized download. The 480w variant (8.0 KB) is too small for a 720-device-px box, so 768 is the right pick.
- What it did to LCP: lab median 1.56 -> 2.38 s on office (runs 2.06-2.63 s), janitorial 2.33 s. Still inside 2.5 s, but the page moved from a text LCP to an image LCP and 3 of 5 office runs were above 2.4 s. Subparts (office, run 3): TTFB 600 ms, resource load delay 788 ms, load time 1,046 ms, render delay 78 ms. The 0.5 to 1.0 s of load delay is the gap between HTML and the image request, because there is no `<link rel="preload" as="image">` in the head, so the request is only issued once the parser reaches it.
- Field evidence: only 2 beacons on office (0.12 s), 1 on medical-dental, 1 on property-management. No field verdict on the new heroes exists yet.
- Recommendation: if the next field window shows service-page LCP above about 2.0 s, add an `imagesrcset` + `imagesizes="100vw"` preload (AVIF) from `OfferPage.astro`/`BaseLayout.astro` for the hero. Optionally ship a 640w AVIF. Both are small. No urgent action; do not remove the photo.

### P2. Mississauga (and likely every location page): LCP image is eager but not `fetchpriority="high"`. Severity: Low
- Lab: `div.loc-main > figure.page-photo > picture > img` is the LCP element at 2.34 s; the audit says "fetchpriority=high should be applied: false" (the other pages pass). LCP subparts run 2.2 to 2.8 s, load delay about 1.0 s, load time 1.14 s. It uses `loading="eager"` but no priority hint, `sizes="(min-width: 1200px) 730px, (min-width: 992px) 560px, 100vw"` (correct).
- Cheap fix: add `fetchpriority="high"` to the first photo in the location template (not looked up in the repo this run; find the `page-photo` figure component). Expect a few hundred ms of lab LCP. The page photo is below the H1 on mobile (top 388 px), so the gain is bounded.

### P3. `/lp/` paid-visit GTM change (`src/lib/gtm-loader.ts`): no cost seen, but not measured in lab. Severity: Low
- Code read: `paidVisit()` is true for `gclid|gbraid|wbraid|gad_source` in the query, any `/lp/` path, or `_gcl_aw/_gcl_gb/_gcl_ag` cookies. It calls `load()` at parse time, so gtm.js (~157 KB) and then gtag.js (~194 KB) compete with the LCP image on the landing page from the first parser tick. All other pages still wait for the first interaction, a tel: tap, or idle after `load`.
- Field: `/lp/commercial-cleaning-quote/` LCP 0.80 s, INP 80 ms, CLS 0.018 (n=9 this window, 0.80 s n=6 in the saved after window, 1.04 s n=18 before). Good on all three, consistent with "no visible cost", but n is too small for any comparison.
- Not lab-tested: the 6 lab pages do not include an `/lp/` page, and I did not load one because loading it with tags running would hit the client's Ads account. A paid-click visit that has no `gclid` in the URL and no cookie yet still loads at idle, so the first view of a non-tagged paid arrival can be late; that is by design.
- Recommendation: run Lighthouse once on `/lp/commercial-cleaning-quote/?gclid=test` with Google hits blocked, and check LCP and TBT against the non-paid variant. Low priority because it passes in the field.

### P4. Remaining third-party main-thread time. Severity: Medium (lab score only)
- Third-party summary (hits blocked, so the DoubleClick portion is excluded): 400-620 ms of main-thread time per office run; script bootup 636-825 ms; TBT 244-466 ms in the office runs, 313-357 median. Still the cap on lab score at about 89-91. Home chain: gtm.js (~157 KB), gtag.js (~194 KB), call-tracking (~21 KB), CF beacon (~10 KB).
- Field INP is 48 ms and LCP passes, so users are not affected. Same owner decisions as before: merge to one Google tag, prune unused GTM tags, and decide on a longer GTM delay. No new action for the repo.

### P5. Field monitoring is too thin to detect an LCP regression on the new heroes. Severity: Info
- 55 human beacons over 6 days (about 9 a day), down from about 21 a day. Only 14 mobile beacons, 2 with INP. Two different home LCP p75s have been published for the same pre-deploy week (0.97 s vs 2.24 s). Do not use the per-path field numbers to sign off P1.
- Recommendation: at the 28-day check (about 4 Dec) add per-path mobile LCP, and consider RUM with attribution (`web-vitals` library) on service pages.

## What improved (observed)
- Lab perf 89-91 on five of six pages (was 85-89), TBT 313-357 ms (was 425-522 ms), CLS 0 on every page including desktop home. The size of the gain is not established because of the blocked hits.
- Field CWV pass sitewide on all three metrics, with LCP 0.80 s, INP 48 ms, CLS 0.000.
- The new hero image is well formed for LCP: eager, high priority, discoverable, 14.8 to 18.3 KB AVIF, dimensions set, no layout shift. 
- Page weight is stable (527 to 543 KB, 33 to 34 requests) after the 13 hero additions.

## 3. What still needs the client or an account owner
1. Ads/GA4 owner: compare GA4 visits for 31 Oct-5 Nov vs 6-11 Nov (human beacons fell by more than half); decide whether a longer GTM delay is acceptable; confirm the intended AW and G- IDs.
2. GTM container owner: one Google tag for AW + GA4, prune unused tags.
3. Cloudflare account owner: confirm the Web Analytics configuration (it is the only field source) and consider providing CrUX/PSI access or a larger sample.
4. Search Console owner: URL Inspection live test on one `data-reveal="flow"` page and one photo-hero service page (rendered screenshot).

## 4. Not verified
- CrUX and PSI (no data fetched). Field is 55 beacons; mobile INP has 2.
- Mobile LCP on the photo-hero pages in the field (office 2 beacons).
- Any lab run of a `/lp/` page, or the cost of the parse-time GTM load on LCP.
- Repo-side confirmation of the 7 Nov items I marked "unchanged" (1b, 3, 4, 6, 8, 10): I did not re-read those components or re-trace the home request list this run.
- Why desktop CLS dropped to 0 (N2); only the median was read.
- Lab: Lighthouse 12.8.2, one time slot, hits blocked; the TBT improvement may be partly an artefact of blocked requests. Best-practices 100 is an artefact, not a fix.

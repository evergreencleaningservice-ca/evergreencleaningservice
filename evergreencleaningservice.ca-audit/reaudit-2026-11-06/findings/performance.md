Score: 80/100
Previous: 62/100 (first audit)

# Performance / Core Web Vitals re-audit: www.evergreencleaningservice.ca (2026-11-06 evening)

## Evidence base
- Field: `raw/cwv-field-6d.txt`, Cloudflare Web Analytics, 31 Oct to 6 Nov, humans only, 106 beacons (274 visits). This is not CrUX, and the sample is small.
- Lab: Lighthouse 12.8.2, median of 5 (my re-read of the 25 JSON files in the Phase 4 `lab/` folder, not only the Phase 4 summary), mobile simulated throttling unless noted. The lab run was taken after Phases 1 to 3.
- The first audit had no field data at all, so there is no field before/after. The only before/after is lab.

## Core Web Vitals status (field, p75, sitewide)
| Metric | p75 | Verdict | Caveat |
|---|---|---|---|
| LCP | 0.98 s (91% good; CI 0.84 to 1.70 s) | Pass | Home `/` alone is 2.24 s (n=28), `/contact-us/` 2.54 s (n=7, flagged "needs improvement") |
| INP | 32 ms (98% good; CI 8 to 56 ms) | Pass | Mobile n=18, CI upper bound 488 ms: indicative only |
| CLS | 0.002 (98.7% good) | Pass | Desktop 0.005, mobile 0.000 |

Sitewide passes on all three. The per-path figures matter more than the aggregate: the top-two paths (home, and the paid landing page `/lp/commercial-cleaning-quote/` at 1.04 s) carry 51 of 106 beacons, and home is the one path near the LCP line.

## Lab before/after (mobile, median of 5)
| Page | Perf (was) | Simulated LCP (was) | TBT (was) | CLS |
|---|---|---|---|---|
| Home | 87 (51) | 2.43 s (6.85 s) | 425 ms (1,316) | 0 |
| Home desktop | 99 (97) | 0.89 s | 43 ms | **0.014** in 4 of 5 runs (0 in the fifth) |
| /services/office-cleaning/ | 88 (88) | 1.56 s | 450 ms (453) | 0 |
| Blog post | 89 (86, different post) | 1.41 s | 431 ms | 0 |
| /locations/mississauga/ | 85 (83) | 2.20 s | 522 ms | 0 |

The home medians are verified from the JSON. Perf runs were 72, 85, 87, 88, 88, and the 72 is the slow-CPU run (TBT 1,062). Run-to-run spread is 3 to 7 points on inner pages, so inner-page changes of 1 to 3 points are noise. Request count and weight: home 35 requests / 590 KB; office 32 / 532 KB; blog 28 / 510 KB; Mississauga 31 to 33 / 517 KB.

## 2. Status of every first-audit finding
| # | First-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | Third-party tags (GTM/gtag) drive TBT and the lost score | **Partly fixed** | GTM loader now fires on `requestIdleCallback` after `load`. Home TBT 1,316 to 425 ms, perf 51 to 87. Inner pages are unchanged (TBT 431 to 522 ms, third-party blocking 578 to 610 ms) because the tags still load a few ms after `load`, inside the TBT window. In the home trace gtm.js (157 KB) starts at about 1.2 s, gtag.js (194 KB) at about 2.0 s, with a 413 ms long task from gtag. The 4 s ceiling never applies (4 to 27 ms after load in 25 runs, per Phase 4, which I did not re-time). The tel:/form-focus escape hatch was not needed because nothing is held back. The home gain is partly CPU variance (Phase 4 admits it; I agree: baseline ran on a slower CPU). Real gain is the LCP contention removal, which is genuine. |
| 1b | Doc drift: GTM comments name AW-16819334998 / G-R27QW21PMT, live uses AW-18472921801 / G-C0JHHPLFPJ | **Open** | The header comment of `src/components/GoogleTagManager.astro` still names the old IDs; the live trace loads `AW-18472921801`. Info only; confirm with the client that the IDs are intended. |
| 2 | Simulated 6.8 s LCP is an artefact; real hero LCP about 1.5 s | **Fixed (score), field caveat** | Simulated LCP 6.85 to 2.43 s on home (JSON: 2.16 to 2.55 s over 5 runs). The cause was gtm.js plus the italic font contending with the hero; both now sit behind the hero. But see New N1: home field LCP p75 is 2.24 s, so the real-user home LCP is not "about 1.5 s". |
| 3 | Hero slides: only slide 1 eager (passes) | **Still passing** | Home trace: slide 2/3 mobile AVIFs (24 KB, 15 KB) fetch at about 1.2 s, after load, as designed. They now sit in the same window as gtm.js (about 1.2 s) and compete with it. Low impact. |
| 4 | Italic font fetched on home | **Fixed** | Home trace has no `open-sans-italic` request. `src/styles/fonts.css` now declares only the normal face (comment at L35 to 40: italic moved to `fonts-italic.css`, `<cite>` made upright). Home saves 50.6 KB. |
| 5 | Preconnect hints for doubleclick/google.com: do not add | **Not applicable** | Recommendation was to not act. Not added. Correct. |
| 6 | Inline CSS / HTML size / DOM | **Open (accepted)** | Home document 34.9 KB transferred (was 32.7 KB), DOM 949 elements (was 923; limit 1,500). Slight growth from the reveal markup. No action needed. |
| 7 | Oversized service-card images (`sizes`, no 640w) | **Open** | Home trace still fetches `warehouse-floor-scrubber-industrial-768.avif` (19,980 B), lobby (16,939 B), backpack (15,555 B), all 768 variants. `ServicesOverview.astro` L71 to 73 still uses the shared `SIZES`; I did not see a 640w variant. About 25 to 30 KB, lazy, off the critical path. Low. |
| 8 | Caching | **Fixed (docs only)** | `_astro` immutable, fonts/images 30 d, HTML revalidated: unchanged and correct. I did not re-check whether `docs/growth/performance.md` image-cache note was corrected. |
| 9 | Cloudflare Web Analytics beacon | **Open** | `beacon.min.js` (10,478 B) still loads on every page; on home it starts at about 336 ms, early, alongside the hero. A `/cdn-cgi/rum` request also fires. It is also now what feeds the field data in `cwv-field-6d.txt`, so keep it (owner decision, see N5). |
| 10 | Floating video (LeadVideo) | **Open (low)** | `lead-net-orb.mp4` (18,133 B) now loads inside the trace window on the office page. Canvas crop script is unchanged (`getImageData` at L657 of `LeadVideo.astro`). No long task attributed to it that I could find. See N3. |
| 11 | INP risk, no field data | **Partly fixed** | Field INP now exists: p75 32 ms, 98.3% good. Mobile is thin (n=18, CI upper 488 ms). reCAPTCHA-on-first-touch risk (`Recaptcha.astro`) is unchanged and unmeasured. The field data come from Cloudflare's beacon, not the `web-vitals` library, so there is no attribution (which element/interaction). |
| Rec. 6 | Add real-user monitoring | **Fixed** | `npm run cwv:field` now reads Cloudflare RUM and gave the report above. Sample size is the limit. |

## 3. New findings

### N1. Home page field LCP is near the line: p75 2.24 s (n=28). Severity: Medium
- The sitewide p75 (0.98 s) hides it. Home is the page with the largest hero image, the carousel clone after load, and the heaviest main thread. Contact-us is 2.54 s (n=7, over the line, anecdote-sized). Lab simulated LCP on home is 2.43 s mobile, consistent with the field figure.
- I cannot split home mobile from desktop (home desktop and mobile beacons are not reported separately), and the 95% CI is not given for the path. Treat as a signal, not a verdict.
- Recommendation: re-run `npm run cwv:field -- --days 14` after about 12 Nov with the per-path breakdown; if home stays above about 2.0 s, test the optional mobile hero preload (`Hero.astro`, imagesrcset with `media="(max-width: 640px)"`). Do not touch the hero image itself (14.8 KB AVIF).

### N2. Desktop CLS 0.014 on `section#services` is caused by the font swap. Severity: Low
- Cause confirmed from the Lighthouse layout-shift audit (`home-desktop-3.json`): a single shift of 0.01407 on `div#main > section#services` (top 647 px, 1335 x 947 px), with the cause listed as "Web font loaded" (`/fonts/open-sans.woff2`). The shift occurs in 4 of 5 desktop runs; the 5 mobile runs have none.
- Field CLS is 0.005 on desktop, 0.002 sitewide, so users are not affected. Not a reveal problem: the reveal uses opacity and transform only.
- The font is preloaded with `font-display: swap`, so a late arrival re-flows text under the fold. Fix if wanted: add a metric-matched fallback (`size-adjust`, `ascent-override`) for the Open Sans fallback in `src/styles/fonts.css`, or `font-display: optional` for the normal face (visible trade-off: first view may use the fallback). Cosmetic; leave it unless CLS creeps up.

### N3. Scroll-in reveal (#81/#82): cheap, LCP-safe by design, not tested in the field. Severity: Low
- Cost: `_astro/reveal.B9SZD-i_.js` is 2,324 B (2.3 KB), one extra request on inner pages (office trace, 32 requests vs 29 before). One `getBoundingClientRect` pass on all targets then one `IntersectionObserver`. 23 `data-reveal` uses. CSS is opacity/transform animation only, so no layout work. No INP effect I can find.
- LCP safety verified by reading `src/lib/reveal.ts`: only blocks whose top is at or below the viewport height at start are armed. Disabled for `prefers-reduced-motion` and when IntersectionObserver is missing. Lab LCP on inner pages did not regress (office 1.56 s, was 1.59 s; blog 1.41 s).
- Residual risks (none observed): (a) `data-reveal="flow"` hides every child of a running-content block below the fold until scrolled to; a user who jumps by anchor is handled in code, but a full-page screenshot tool or print would show blank sections, and Googlebot rendering with a tall viewport is probably fine but I did not verify it. (b) `reveal.ts` runs a `getBoundingClientRect` loop at startup, a forced layout of up to ~23 blocks; negligible at this DOM size.
- Recommendation: confirm in Search Console URL Inspection (live test, rendered screenshot) on one `flow` page, e.g. a blog post, that nothing renders blank. That is the one check that matters for search.

### N4. Video orb now lands in the load window on inner pages. Severity: Low
- On `/services/office-cleaning/`, `lead-net-orb.mp4` (18,133 B) is requested in the 5-run trace window, next to `call-tracking_9.js` (21 KB) and the GTM chain. Lab TBT on inner pages stays about 450 ms and the Phase 4 note says about 23 KB came in with reveal and the orb together. This mostly matters on slow connections: those 23 KB compete with the tags, not with LCP (text on inner pages).
- Recommendation: leave it. If inner-page TBT matters, move the orb start (`data-delay="3000"` in `LeadVideo.astro`) behind the first user interaction, or wrap the canvas crop in `requestIdleCallback`. No evidence yet that it harms users.

### N5. Third-party blocking is still 530 to 610 ms on every page; the lab score is capped near 85 to 89. Severity: Medium (score only)
- On the home page, third-party transfer is about 395 KB (gtm 157 KB, gtag 194 KB, call-tracking 21 KB, beacon 10 KB, other beacons). Inner-page TBT of 430 to 520 ms is unchanged since the first audit. This is the remaining lab-score loss, not a user-facing problem, since field INP is 32 ms.
- Deferral is only a few milliseconds after `load`, so Lighthouse sees the whole chain. A longer fixed delay would score about 90+ but loses short-visit tracking: the Ads/GA4 owner's decision (agree with the Phase 4 note). My recommendation is to not do it unless the owner wants the lab score; the field data do not justify the measurement cost.
- Container hygiene (client): one Google tag carrying AW + G-; remove unused tags. A leaner `gtag.js` (194 KB) helps every page. The Ads view-through cookie is also what holds Best Practices at 79 (unchanged).

### N6. Mobile INP evidence is thin and its upper bound is high. Severity: Info
- Mobile INP p75 is 24 ms with 94.4% good, but the 95% CI runs 0 to 488 ms on 18 beacons. One in 18 mobile interactions was not "good". Cannot attribute it (no web-vitals attribution).
- Recommendation: re-check at 28 days. If the mobile tail persists, add the `web-vitals` attribution build behind the existing analytics hook to find the interaction. Candidate suspects are the first quote-form touch (reCAPTCHA load, `Recaptcha.astro`) and a tap during gtag's 413 ms long task.

## What improved (credit only for what was observed)
- Home mobile perf 51 to 87 (median of 5), simulated LCP 6.85 to 2.43 s, TBT 1,316 to 425 ms, with the caveat that part of the TBT gain is CPU variance.
- Italic font removed from home (50.6 KB less); gtm.js no longer in the hero's critical window.
- Field data now exists and passes sitewide on LCP, INP and CLS.
- No regression from the reveal script or hover polish on LCP, CLS (0 on all mobile runs) or the request/KB budget.

## 4. What still needs the client or an account owner
1. Ads / GA4 owner: decide whether a longer GTM delay is acceptable; compare GA4 page views and Ads conversions against the previous week (Phase 1 deploy plus one week, scheduled ~13 Nov). Confirm AW-18472921801 and G-C0JHHPLFPJ are the intended IDs.
2. GTM container owner: merge to one Google tag for AW + GA4, prune unused tags (reduces `gtm.js`/`gtag.js` weight and long tasks).
3. Cloudflare account owner: confirm the Web Analytics site configuration, since it feeds the field data, and the beacon (10.5 KB per page) is injected outside the repo.
4. Search Console owner: run a live URL Inspection on one `data-reveal="flow"` page and confirm the rendered screenshot is complete.

## 5. Not verified
- CrUX (Google's 28-day field data) and PSI. The only field source is Cloudflare RUM with 106 beacons; mobile has 18 to 28 samples per metric.
- Home mobile vs desktop field LCP separately, and any per-path confidence intervals.
- gtm.js timing after `load` (I took 4 to 27 ms from Phase 4; I did not re-time it). Whether GA4/Ads page_view counts dropped (requires GA4/Ads access).
- Whether the reveal changes how Googlebot sees blocks below the fold.
- Real-device behaviour of the orb canvas crop and reCAPTCHA first-touch cost (no trace).
- Lab runs are Lighthouse 12.8.2 on this container, not the latest 13.x, and a single time slot (19:30 UTC). I did not re-run Lighthouse.
- Whether `docs/growth/performance.md` was updated for the 30-day image cache.

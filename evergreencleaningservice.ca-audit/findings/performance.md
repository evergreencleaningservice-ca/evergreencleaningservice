Score: 62/100

# Performance / Core Web Vitals: www.evergreencleaningservice.ca (2026-11-06)

## Data limits (read first)
- **No CrUX / field data.** PSI quota was exhausted and there are no Google API credentials. No LCP, INP or CLS pass/fail verdict at p75 can be given. INP cannot be measured in the lab, so the INP section is risk analysis only.
- Evidence is 5 Lighthouse 12.8.2 mobile/desktop runs (HeadlessChrome 153, run from this container through a TLS-terminating proxy). Mobile throttling is simulated: 150 ms RTT, 1.6 Mbps, 4x CPU. Each run was taken once, so run-to-run variance is unknown.
- The brief's "blocked GTM gives 93-99" claim is not verified. The repo's own measurement (docs/gtm-handoff.md ~L495-520, older run) shows 51 normal and **86** with GTM blocked. I did not re-test blocked-GTM.

| Page (mobile) | Perf | Simulated LCP (scored) | Observed LCP | TBT | LCP element | Req / KB |
|---|---|---|---|---|---|---|
| Home | 51 | 6.8 s | **1.50 s** | 1316 ms | hero `<img>` | 34 / 636 |
| Home (desktop) | 97 | 1.2 s | 1.29 s | 42 ms | hero `<img>` | 35 / 622 |
| /services/office-cleaning/ | 88 | 1.6 s | 0.81 s | 453 ms | text `p.offer-summary` | 29 / 510 |
| Blog post | 86 | 1.3 s | 0.72 s | 536 ms | text `p.guide-intro` | 27 / 487 |
| /locations/mississauga/ | 83 | 2.4 s | 1.04 s | 587 ms | photo `<img>` | 28 / 495 |

CLS is 0 on every mobile run (0.005 desktop). The field CWV outlook from lab data is: CLS good, LCP probably good, INP unknown.

## What works
- CLS is 0. The hero `<img>` has width/height, and the Open Sans normal face is preloaded.
- The hero `<picture>` is well built (`src/components/home/Hero.astro`): AVIF, then WebP, then JPEG, with a 640x800 mobile crop. Lighthouse's lcp-discovery checklist is all green: `fetchpriority="high"`, `loading="eager"`, and the request is discoverable in the initial HTML.
- **Only slide 1 loads eagerly.** Slides 2 and 3 sit in `<template data-hero-more>` (fetches nothing). A script clones them only after `window.load`, and not at all under `prefers-reduced-motion`. Confirmed in the raw HTML. In the trace the second and third hero images were never requested during the observed window.
- The mobile hero AVIF is **14.1-14.8 KB** (`gallery-corporate-office-cleaning-hero-mobile-640x800.avif`). `preconnect` to img.evergreencleaningservice.ca is present.
- Observed (not simulated) timings are good: FCP 0.77 s, LCP 1.50 s, load event 2.0 s, Speed Index 1.16 s on the home mobile run. Root document 100 ms (Lighthouse server-response audit).
- All CSS is inlined (`inlineStylesheets: 'always'`), so there are zero render-blocking requests and no unused-CSS or render-blocking insight failures.
- The document is 160 KB raw but 32.7 KB over the wire. DOM is 923 elements (limit 1,500), and the city `<datalist>` is only 15 options and 944 bytes, so it is not a DOM problem.
- reCAPTCHA is loaded on form intent, not on arrival (removes ~700 KB and ~1.4 s of scripting). Verified: no recaptcha request in any trace.
- `/lead-net.mp4` (2.5 MB) is `preload="none"` and only fetched when the visitor opens it. Only the 17.8 KB orb loop plays, and only after `load` + 3 s (`data-delay="3000"`).
- `/_astro/*` is immutable for 1 year. The image host serves `max-age=30d, s-maxage=1y`, and Cloudflare was a HIT. Fonts and video are 30 d. The HTML is `max-age=0, must-revalidate` at Cloudflare HIT, which is correct for HTML.
- Site JS is tiny: the whole `_astro` chain is ~9 KB in 8 requests with a 1.06 s observed chain. Site scripting is under 50 ms.
- Desktop is 97 (TBT 42 ms), so the problem is mobile CPU and bandwidth, not the page weight.

## Findings

### 1. Third-party tag load drives the TBT and the lost score. Severity: High
- **Evidence (home mobile):** Third-party code blocked the main thread for 1,345 ms. `gtag/js?id=AW-18472921801` (194 KB) accounts for 912 ms of that, with a single 962 ms long task. `gtm.js?id=GTM-5W69BTJQ` (157 KB) has two long tasks of 281 and 252 ms. Unused JS is 135 KiB, all of it in those two files. The call-tracking script (gstatic, 21 KB, ~50 ms scripting) and the Cloudflare beacon add negligible blocking.
- The same scripts cost far less on the other pages: gtag blocking is ~500 ms on office, post and Mississauga, versus 962 ms on home. Home TBT is 1316 ms against 453-587 ms. The home-only extra is partly the page's own longer main thread (870 ms document task, 245 ms long task at 1.4 s, 923 elements) and partly run variance. **I cannot separate the two with one run per page.** Repeat 3-5 runs per page before quoting the delta.
- **There is no duplicate gtag load.** Every trace shows exactly one `gtm.js` and one `gtag/js` (the `cx=c&gtm=` parameters show gtag is injected by the container's Google tag). GA4 (`G-C0JHHPLFPJ`) and Ads (`AW-18472921801`) share that single gtag.js. The "drop duplicate gtag loads" fix therefore does not apply to the site code. Check inside the container that the Ads tag and the GA4 config share one Google tag, so no second gtag instance is added.
- Doc drift: `src/components/GoogleTagManager.astro` comments name AW-16819334998 / G-R27QW21PMT, but the live page uses AW-18472921801 / G-C0JHHPLFPJ. Someone should confirm the new IDs are intended.
- **Recommendations, ranked by value for risk:**
  1. **Defer the GTM loader, with an escape hatch.** Edit the inline loader in `src/components/GoogleTagManager.astro`. Load GTM on whichever comes first: first pointerdown/keydown/scroll/touchstart, or `requestIdleCallback`/a ~4 s timer after `load`. Also trigger it immediately on `pointerdown`/`touchstart` of any `tel:` link and on focus inside any form. This addresses the risk in `docs/growth/performance.md` ("Measurement trade-off"): a visitor who taps to call straight from the hero would otherwise reach an untracked number. The cost is that `page_view` is delayed or lost for bounces with no interaction before the timer, and Ads `gclid` attribution depends on the linker tag firing first. **Check the Ads/GA4 numbers for one week after shipping.** This is a measurement-owner decision.
  2. **Be honest about lab versus real gain.** Lighthouse's TBT window ends around 5 s, so a ~4 s timer plus interaction will remove most TBT in the lab. Real users gain less: 850 ms of gtag scripting at 4x slowdown is ~200-300 ms on a mid-range phone. The real gain is the first seconds being free for LCP and input.
  3. **Container hygiene (no code change).** Keep one Google tag carrying both AW and G- IDs. Remove unused triggers and tags. Consider moving only the Ads conversion tag onto the form-submit event, and keep the call-tracking swap early.
  4. **Partytown: not recommended here.** Call-tracking number swap, the conversion linker and Enhanced Conversions all need synchronous DOM and cookie access. Proxied main-thread access is brittle, and it can silently break conversion tracking.
  5. **Server-side tagging (sGTM) is a poor first step.** It reduces outbound client requests but `gtm.js`/`gtag.js` still ship to the browser, and it adds hosting cost. It is only worth it for data-quality reasons.
- **Expected impact:** TBT 1316 ms to roughly 100-300 ms and perf score from 51 to roughly the high 80s or low 90s in the lab, if deferral works as planned. The repo's own earlier test with GTM blocked reached 86, so a 93-99 score should be treated as optimistic until measured.

### 2. The "6.8 s LCP" is a simulation artefact; the real hero LCP is ~1.5 s. Severity: High (to the score), Medium (to users)
- **Evidence:** the scored LCP is 6,848 ms, but the same trace's observed LCP is 1,495 ms. Lighthouse 12.8 contains two breakdowns:
  - Legacy simulated: TTFB 600 / load delay 1,643 / load time 3,598 / render delay 1,007 ms.
  - Observed (lcp-breakdown-insight): TTFB 428 / load delay 51 / load duration 796 / render delay 220 ms.
- **The AVIF does not take 3.6 s.** The request ran 485 to 1,271 ms in the trace (786 ms) with a 14.8 KB body. The 3.6 s is Lantern's modelled load, in which the hero competes at 1.47 Mbps with everything else in flight.
- **Likely cause (consistent with the data, not proven):** in the first ~1 s the page requests, in parallel, the 33 KB document, two fonts (50 KB + 50 KB), the logo AVIF, the hero and `gtm.js` (157 KB, Low priority but issued at 490 ms). That is ~330 KB of contending bytes at 1.47 Mbps, i.e. well over 1.5 s of modelled transfer. Mississauga, with the same GTM and one image, simulates to 2.4 s. The inner text-LCP pages simulate to 1.3-1.6 s, so GTM alone does not explain home. The home-specific factors are the competing bytes, the hero image being the candidate, and the heavier home main thread.
- `fetchpriority`, `sizes`, `srcset` and eager loading are all correct, and `sizes="100vw"` on the hero is right because it is full-bleed. The srcset is bypassed on phones by the 640x800 `media` source, which is intended.
- **Recommendations:**
  1. Remove the competing bytes (Findings 1 and 4): defer GTM and stop italic loading. This is the lever that can pull the simulated LCP down.
  2. Optional: add `<link rel="preload" as="image" imagesrcset="…mobile-640x800.avif" media="(max-width: 640px)" fetchpriority="high">` for the mobile AVIF in Hero's head slot. This is a small win only, because the image already starts at 485 ms and the document finished at 442 ms. `docs/growth/performance.md` says a preload "would not help", and that is mostly right. Do it only if the preload scanner's start is later in the field.
  3. Re-measure with `--throttling-method=devtools` or WebPageTest on a real device profile, to confirm the 6.8 s versus 1.5 s gap before acting on any more LCP work. Do not tune the hero image further: 14 KB AVIF is already minimal.
- **Expected impact:** moves the scored LCP from 6.8 s toward 2-3 s as the contention is removed. The real-user LCP is probably already near "good" (unverified, no CrUX).

### 3. Hero slides: eager loading check. Severity: Info (passes)
- Only slide 1 is eager. Slides 2 and 3 fetch only after `load` (and the 6 s rotation timer). In the trace the boardroom and spring-desk mobile AVIFs (24 KB and 15 KB) appear in the cache audit, so they do download after load, as designed. Cost: ~39 KB after load, off the critical path. No change needed.

### 4. Italic font is fetched on the home page but only needed below the fold. Severity: Medium
- **Evidence:** `/fonts/open-sans-italic.woff2` (50.6 KB) is requested at 714 ms with **VeryHigh** priority, ahead of the lazy images and in the middle of the hero download. The CSS has only one italic rule, `.entry-content blockquote` (blog posts). On the home page italic comes from the browser default for `<cite class="tes-name">` and the `<blockquote>`s in `src/components/home/Testimonials.astro` (its own comment at L10 and L143 says "A `<cite>`, so italic without asking"). The browser fetches the face as soon as it lays out any text using it, even below the fold. The comment in `BaseLayout.astro` (~L112) claims italic carries the hero sub-line. I found no italic rule in `Hero.astro` or `global.css` for the hero, so that comment is stale. Confirm visually before removing.
- **Fix:** set `.tes-name { font-style: normal; }` in Testimonials.astro, then move the italic `@font-face` out of `src/styles/fonts.css` (L38-41) into the post layout only, since the blog is the one real user. If the testimonial italics are wanted, keep them, but load the face with `font-display: optional` or declare it only on post pages.
- Both fonts already use `font-display: swap` and are Latin-range subsetted woff2 with variable weight (400-700 / 400-800). Normal face 48.3 KB, italic 50.2 KB. Extra subsetting is possible (drop unused weights/axes with `pyftsubset` if the variable file carries a width axis; I did not inspect the axes). The italic removal is the cheaper win.
- **Expected impact:** -50 KB on the home page and every page with testimonials; less contention with the hero; roughly 100-250 ms off modelled LCP on the 1.6 Mbps profile.

### 5. Preconnect hints Lighthouse suggests (ad.doubleclick.net, www.google.com). Severity: Low
- Lighthouse estimates 300-330 ms of savings for each, but both origins are contacted by the tags after GTM runs (Ads view-through and the remarketing call), not by the LCP path. The page already has the one preconnect that matters (the image host).
- **Recommendation:** do not add them. They would open extra connections early on the 4G profile and compete with the hero, and the doubleclick request is also the source of the third-party cookie that costs Best Practices (79). If GTM is deferred (Finding 1), add `<link rel="preconnect" href="https://www.googletagmanager.com">` in the head only if the tag loads on a timer. Keep the total at 4 or fewer.

### 6. Inline CSS, HTML size and DOM. Severity: Low
- **Evidence:** 52.7 KB of inline `<style>` raw (my measure; the brief says ~38 KB), ~9.5 KB deflated, and 17.8 KB of inline scripts on a 160 KB document (32.7 KB transferred). The larger parts are the 5.4 KB reCAPTCHA loader comment and code, the hero template, 72 inline SVGs and the JSON-LD (4.9 KB organisation graph).
- Inlining is the right trade-off here: it removes the render-blocking request, and the extra ~10 KB compressed is tiny next to the 351 KB of Google tags. The Lighthouse unused-CSS audit passes. But `max-age=0, must-revalidate` HTML means the inline CSS is re-downloaded on every navigation, so repeat visitors pay ~10 KB per page that an external immutable CSS would not.
- **Recommendation:** no change now. If bytes ever matter, split the cacheable shared CSS (header, footer, forms) into one fingerprinted file loaded with the inline critical subset. Strip the long explanatory comments from the inline recaptcha script (the `<script>` body in `Recaptcha.astro` ships its comments to production), which would save ~2 KB raw. Low value.

### 7. Image delivery: warehouse-floor-scrubber-industrial-768.avif. Severity: Low
- **Evidence:** image-delivery insight: 19.5 KB served for a 380x253 CSS box, with 13.8 KB of estimated waste. The homepage service cards (`src/components/home/ServicesOverview.astro` L59-60) use `sizes="(min-width: 992px) 360px, 100vw"`, so at 412 px at DPR 1.75 the browser picks 768. The card is not full-viewport width (380 px), so the 100vw hint overstates it. The lobby and backpack cards are similarly oversized (17 KB and 15.3 KB).
- **Fix:** use a mobile `sizes` that matches the card, e.g. `(min-width: 992px) 360px, calc(100vw - 32px)` (check the actual padding in the CSS). With a 480w candidate in the srcset, DPR 1.75 x 380 = 665 px still picks 768, so also add a 640w variant in `scripts/images.mjs`. Total saving across the three cards ~25-30 KB. Not on the critical path (lazy, Low priority).

### 8. Caching. Severity: Low / Info
- Verified: HTML `public, max-age=0, must-revalidate` (Cloudflare HIT; fine for HTML, the revalidation is cheap); `/_astro/*` immutable 1 y; fonts 30 d; `/video/*` 30 d; image host `max-age=30d, s-maxage=1y` (header check on the hero AVIF: `cf-cache-status: HIT`). The note in `docs/growth/performance.md` that images have a one-day cache is stale; it is now 30 days.
- Lighthouse cache insight flags only third parties: `gstatic.com/wcm/loader.js` (1 h) and the Cloudflare Insights beacon (1 d). Neither is controllable. For the beacon see Finding 9.
- Optional: the non-fingerprinted fonts and images at 30 days is a sensible compromise. The image host could use `immutable` if filenames are versioned, but they are not (same name replaced on re-upload), so leave it.

### 9. Cloudflare Web Analytics beacon. Severity: Low
- **Evidence:** `static.cloudflareinsights.com/beacon.min.js` (10.5 KB, 44 ms main-thread, 1-day TTL) loads on every page. It is **not in the repo or in the saved HTML source** (0 matches in the raw HTML and in `src`), so it is auto-injected at the Cloudflare edge. It is CSP-allowlisted in `public/_headers`.
- **Fix:** if GA4 is the system of record, switch off Web Analytics auto-injection in the Cloudflare dashboard. Saves 10 KB and an extra request on every page. If the data is wanted, leave it. Owner decision.

### 10. Floating video (LeadVideo). Severity: Low (mobile cost looks small)
- **Evidence:** `src/components/LeadVideo.astro` is in `BaseLayout.astro` (every page). `<aside hidden data-delay="3000">`, orb `lead-net-orb.mp4` 17.7 KB with `preload="none"` until `load` + 3 s; the full 2.5 MB clip is `preload="none"` and fetched on click. Both files are `max-age=30d`. The inline script is ~3 KB and includes a canvas `getImageData` pass over a video frame to crop letterboxing, run on `loadeddata`/first `timeupdate`. That is a small, one-off cost on a 80 px orb.
- No CLS: it is fixed-position and revealed after load. It starts after `load` and the orb is 17.7 KB, so it should not affect LCP. In the lab it is outside the measured window, so I cannot show its mobile TBT cost; I saw no long task attributable to it.
- **Recommendation:** none needed. Consider `requestIdleCallback` around the canvas crop so it never lands on a user tap. Verify with a real-device trace after 3 s.

### 11. INP risk (no field data). Severity: Medium (unverified)
- Event-handler code is small: the quote form (1.9 KB + `lead-submit` 3 KB), the menu toggle (0.8 KB inline), the testimonial carousel (2 KB inline), attribution and engagement (~3 KB). I would not expect these to be slow.
- **Main risk 1: third-party scripts.** Eight long tasks on the home mobile trace, up to 962 ms. A tap landing during one would give a poor INP in the field. Finding 1 addresses it.
- **Main risk 2: reCAPTCHA load on first form interaction.** Loading on focus/press/keystroke moves ~700 KB and ~1.4 s of throttled scripting (docs figure; I did not re-measure) to the first time someone touches the form. That is when INP is measured, so the first keystroke or tap on the quote form can feel slow. Mitigations: load on `pointerenter`/`touchstart` over the form earlier, or on `requestIdleCallback` after the form scrolls into range (the existing 300 px proximity trigger). Alternatively, move to an invisible or lighter challenge (Turnstile hosts are already in the CSP) if the spam-guard design allows it.
- **Action:** record real INP. Add the `web-vitals` library, or enable Cloudflare/RUM, since there is no field data today. Without that, INP stays unverified.

## Homepage-specific versus site-wide
- **Site-wide:** GTM + gtag (~350 KB, ~500 ms of blocking even on small pages), the beacon, the call-tracking script and the oversized `sizes`. Every inner page still scores only 83-88 because of this.
- **Homepage-specific:** the image LCP (the inner pages' LCP is text and renders from the inlined CSS and the preloaded font), the italic font (testimonials), three below-the-fold service images, a 923-element DOM with the 5.4 KB inline reCAPTCHA loader plus quote form, and a heavier main thread (870 ms document task). Inner pages have ~450 ms TBT versus 1316 ms on home. I cannot attribute how much of that is run variance (one run per page).

## Prioritised fix list

| # | Fix | File | Expected impact | Effort / risk |
|---|---|---|---|---|
| 1 | Defer GTM to first interaction or idle (~4 s), with tel:/form-focus triggers | `src/components/GoogleTagManager.astro` | TBT 1316 to ~100-300 ms; mobile 51 to ~85-92 in the lab; frees bandwidth for the hero | Low code, **measurement risk**: agree with the Ads owner and monitor conversions |
| 2 | Stop the italic font loading on the home page (`.tes-name` normal; scope the face to post pages) | `src/components/home/Testimonials.astro`, `src/styles/fonts.css` | -50 KB; ~100-250 ms off modelled LCP; fewer contending bytes | Very low |
| 3 | Container hygiene: one Google tag for AW + GA4, prune unused tags | GTM container (not in repo) | Smaller `gtm.js`/`gtag.js`; may cut 100+ ms scripting | Medium; needs GTM access |
| 4 | Turn off the Cloudflare beacon if unused | Cloudflare dashboard | -10 KB, -1 request, -44 ms | Trivial |
| 5 | Fix the service-card `sizes` and add a 640w variant | `ServicesOverview.astro`, `scripts/images.mjs` | ~25-30 KB, off the critical path | Low |
| 6 | Add real-user monitoring (web-vitals) | `BaseLayout.astro` or the GTM container | Provides the missing LCP/INP/CLS field data | Low |
| 7 | Reduce reCAPTCHA first-touch INP risk | `src/components/Recaptcha.astro` | Avoids a ~1.4 s throttled main-thread burst at first form interaction | Medium |
| 8 | Optional hero preload for mobile AVIF | `Hero.astro` head slot | Small | Low; low value |

Do not do: Partytown, adding preconnects for doubleclick/google.com, further hero image compression, splitting out the inline CSS.

## Quick wins (5)
1. Defer GTM with interaction and `tel:` triggers (Finding 1).
2. Drop the italic font from the home page (Finding 4).
3. Disable the Cloudflare Web Analytics auto-inject if unused (Finding 9).
4. Correct the card `sizes` and add a 640w image variant (Finding 7).
5. Add `web-vitals` RUM to collect the missing field LCP/INP/CLS (Finding 11).

## Not verified
- Field CWV (CrUX), real INP, and real-device LCP.
- The effect of deferring GTM on conversion tracking. The 93-99 figure was not reproduced.
- Run-to-run variance (one run per page).
- Exact cause of the simulated-versus-observed LCP gap (hypothesis in Finding 2).
- Whether the variable fonts carry removable axes.
- Whether the hero sub-line uses italic (CSS shows no italic rule for it).

Source data: `/home/user/evergreencleaningservice/evergreencleaningservice.ca-audit/raw/lighthouse/*.json`, `/home/user/evergreencleaningservice/evergreencleaningservice.ca-audit/raw/crawl/html/259f5e4b229e.html`.

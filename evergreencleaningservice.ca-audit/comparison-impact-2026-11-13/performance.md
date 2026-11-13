# Performance: Evergreen vs Impact (13 Nov 2026)

Source: `lab/medians.txt` and the per-run Lighthouse 12.8.2 JSON (mobile, median of 3, analytics/ad/pixel hits blocked on both sites). No Lighthouse re-run, no new fetches. The crawl copy of `impact/home.html` was grepped for loader details.

## 1. Scores out of 100 (performance only, lab)

| Site | Score | Basis |
|---|---|---|
| Impact | 95 | Mobile perf 97/100/98/99 (home/office/Mississauga/post). LCP 1.2-2.4 s, TBT 56-100 ms, CLS 0. Held back by 650-700 KiB of PNG on home/office and a lab view that hides its analytics (section 3). |
| Evergreen | 80 | Mobile perf 83/82/76/85. LCP 1.8-3.2 s, TBT 480-633 ms, CLS 0. Page weight and requests are lower than Impact's, but TBT dominates. |

Mobile perf and the Lighthouse metrics:

| Page | Evergreen perf / LCP / TBT / KB / reqs | Impact perf / LCP / TBT / KB / reqs |
|---|---|---|
| Home | 83 / 2.19 s / 624 / 588 / 37 | 97 / 2.43 s / 75 / 861 / 30 |
| Office cleaning | 82 / 2.44 s / 633 / 513 / 33 | 100 / 1.34 s / 56 / 863 / 25 (2 valid runs) |
| Mississauga | 76 / 3.23 s / 480 / 515 / 33 | 98 / 1.40 s / 100 / 269 / 21 |
| Post | 85 / 1.83 s / 561 / 506 / 30 | 99 / 1.23 s / 98 / 597 / 18 |
| Home, desktop | 96 / 1.31 s / 80 | 98 / 1.05 s / 0 |

Evergreen is ahead on home LCP (2.19 s vs 2.43 s) and on bytes for home, office and post. Impact is ahead everywhere else, and ahead by a wide margin on TBT.

Field data is not part of this comparison. CWV pass/fail on real users is unverified.

## 2. Why Impact is faster: the main thread

| | Evergreen | Impact |
|---|---|---|
| Main-thread work (home run 2) | scriptEvaluation 946 ms, other 481, style/layout 190 | other 605, style/layout 424, scriptEvaluation 199 |
| Biggest script cost | `googletagmanager.com/gtag/js` 530-710 ms bootup on every page, plus `gtm.js` 294-376 ms on office and post | Only the document itself (HTML parse and layout, about 1.1-1.5 s attributed) and `altcha.js` 128-146 ms in some runs |
| Third-party blocking time | Google Tag Manager entity: 667-912 ms blocking, 834-1088 ms main-thread, 345 KiB, 16 requests, on every page | None recorded (0 third-party requests; the third-party summary has no details) |
| Long tasks | 4-7 per run; the longest is 517-695 ms at about 6.2-6.6 s (the GTM load) | 3-8, none dominant |
| DOM size | 510-960 elements | not compared (Elementor markup is heavy but TBT is low) |

**GTM/gtag is the whole TBT gap.** Evergreen's own code is small: 13-16 script requests, but only about 10 of those requests are first-party. The 345 KiB `googletagmanager.com` transfer is two files (gtm.js and gtag/js), and the GTM entity's blocking time of 667-912 ms exceeds the page's TBT of 480-633 ms.

The loader in `src/lib/gtm-loader.ts` waits for first interaction, but it also fires after `load` via `requestIdleCallback` with a 4 s timeout. Lighthouse waits for network and CPU quiet, so the idle-callback load lands inside the measured window as the 500-700 ms task at about 6.2-6.6 s. The loader is already well deferred for real users who interact within 4 s. It is not deferred in the lab.

**Why Impact shows no third-party cost.** `impact/home.html` contains `googletagmanager.com/gtag/js?id=GT-WKT3S3LR` and `gtag("config","GT-WKT3S3LR")`, and it is behind WP Rocket's `RocketLazyLoadScripts` (script delay until interaction). In the JSON every Impact page has 0 KiB of third-party transfer, and its only script request is WP Rocket's `lazyload.min.js` at 3 KiB. So the Lighthouse view of Impact is an interaction-delayed state: gtag is present but not executed. A real visitor who scrolls or taps will run it. This is a fair lab measurement of initial load, but it is not proof that Impact's users never pay a gtag cost. (Impact's other trackers were blocked by the brief's block list, so they are not visible either.)

## 3. LCP element and timing

| Page | Evergreen LCP element | Time | Impact LCP element | Time |
|---|---|---|---|---|
| Home | `img` gallery-corporate-office… (`img.evergreencleaningservice.ca`) | 2.15-2.52 s | Hero `<p>` text (Elementor) | 2.43 s (runs 2.43, 2.43, one outlier 4.60 s) |
| Office | `img` office-backpack-vacuum… | 2.38-2.49 s | Hero `<p>` text | 1.34 s |
| Mississauga | `img` high-dusting-warehouse-lift… | 2.84, 3.23, 4.37 s | `<p>` | 1.40 s (runs 2.34, 1.40, 1.40) |
| Post | `p.guide-intro` | 1.57-2.28 s | not recorded here | 1.23 s |

- Impact's LCP is a text paragraph, so no image download sits on the critical path. Its home also preloads the hero image with `fetchpriority="high"` (`rel="preload" data-rocket-preload as="image"`), and it inlines its CSS (zero stylesheet requests).
- Evergreen's LCP on home, office and Mississauga is an image on a second host, `img.evergreencleaningservice.ca`. Lighthouse's LCP breakdown shows TTFB of 210 ms (home), 467 ms (office) and 770 ms (Mississauga). The Mississauga root document took 470 ms in run 1 against 70-120 ms on other pages, which is a cache miss or cold edge, not a code difference. That one page has a 2.84-4.37 s LCP spread, so its median of 3.23 s is the least reliable number in the set.
- The second host costs a DNS, TCP and TLS connection before the hero image starts. A preconnect hint would remove that cost. Whether a preconnect already exists was not checked.

## 4. Bytes, requests, caching

- Evergreen: 506-592 KiB, 29-38 requests. Of that, about 379 KiB (65-75%) is Google third-party script, 16 requests, plus a 48 KiB font. Images are 23-109 KiB and `modern-image-formats` and `uses-responsive-images` both pass. `unused-javascript` estimates 135 KiB of savings, all in the Google files.
- Impact: 861 KiB (home), 863 KiB (office), 597 KiB (post), 269 KiB (Mississauga). On home and office, 3 PNGs of 176-279 KiB each are the bulk. `modern-image-formats` estimates 659 KiB savings and `uses-responsive-images` 714 KiB. Impact is heavy on images but light on script, which is the reverse of Evergreen's profile.
- Caching: Evergreen flags 6-10 resources under `uses-long-cache-ttl`. The home document headers on 11 Nov were `cache-control: public, max-age=0, must-revalidate` with `cf-cache-status: HIT`, which is normal for Cloudflare Pages HTML. Impact reports 0 resources failing the long-cache test, so its static assets carry long TTLs. The gap is small in score terms and is mostly the Google-hosted files that Evergreen cannot control.
- Impact's Mississauga run shows 269 KiB, and its image audits errored in the JSON ("Required ImageElements gatherer encountered an error ... CBOR: stack limit exceeded"). That is also why its SEO and best-practices scores read 0 in `medians.txt`. They are a gatherer failure, not a real result, so ignore those two zeros.

## 5. Evergreen TBT: 480-633 ms now vs 313-357 ms on 11 Nov

Evidence from the JSON and the repo:

- Within-session spread is wide (home 517-668, post 454-630), but every one of the 12 mobile runs (454-668 ms) is above the highest 11 Nov median (357 ms) and above the 6 Nov medians (425-522 ms). A uniform shift on all four pages is not single-run noise.
- The shift is not in Evergreen's own code. `git log` since 11 Nov shows only a comment change on `src/lib/ga4.ts`/the GTM component (`f7adc3f`). `src/lib/gtm-loader.ts` is unchanged. Page weight is unchanged: 506-592 KiB.
- The cost is in the GTM entity (667-912 ms blocking). The container itself is edited in the GTM UI, not in the repo. The 16 third-party requests include three DoubleClick requests (`ad.doubleclick.net`, `googleads.g.doubleclick.net` x2), `googleadservices.com`, `google-analytics.com`, and six `www.google.com` requests. If the container gained or changed tags since 11 Nov, TBT would rise with no commit. I could not check the container version or its history, so this is not confirmed.
- Lab CPU: `benchmarkIndex` was 1680-2362 in these runs. The 11 Nov benchmark index is not in the files I read, so I cannot say if the machine was slower today.
- The 11 Nov note itself says the lower TBT "may partly come from blocking the hit requests, so it is not established as a site change". The block list used today is the same kind, so that does not explain the rise either.

**Verdict.** Not a regression in the repo's code, and not simple run variance either. The most likely causes are a change in the GTM container or Google's served gtag bundle, or a slower lab machine. This is unresolved. Do not report 313-357 ms as the true figure, and do not report 480-633 ms as a code regression. Treat the 11 Nov and 13 Nov numbers as two sessions on different conditions, and re-run with the same script on the same day to compare.

## 6. Steps that would close the gap (for Evergreen)

1. **Stop the idle-callback GTM load from landing in the lab window and on real low-end phones.** In `src/lib/gtm-loader.ts`, drop the `requestIdleCallback(load, {timeout: 4000})` fallback for non-paid visits and load only on interaction, as Impact's WP Rocket does. Cost: pageviews from visitors who never scroll or tap would not be counted, so GA4 sessions for bouncers fall. The owner needs to decide that trade-off. Expected effect: TBT would drop towards 50-150 ms in the lab and the perf score would move to about 95. Paid visits (`gclid` etc.) and `tel:` taps still load immediately, so conversion tracking is unaffected.
2. **Audit the GTM container.** List every tag. Both a GA4 config tag in `gtm.js` and a separate `gtag/js` request suggest duplicate loading; the data shows both `gtag/js` and `gtm.js` on office and post. Remove duplicate, unused or legacy tags (the DoubleClick and `googleadservices` calls should only fire for paid visits). This is likely the largest real-user gain, because it also helps visitors who interact.
3. **Hero image host.** Add `<link rel="preconnect" href="https://img.evergreencleaningservice.ca">` in `src/layouts/BaseLayout.astro` if it is not already there, and `fetchpriority="high"` plus a preload on the hero image on service and location layouts. Or serve hero images from the main origin. Target: Mississauga LCP from 3.2 s to under 2.5 s.
4. **Mississauga TTFB.** The 470 ms root-document time on that page was one run; check Cloudflare cache hit on `/locations/*` HTML (a Cache Rule for HTML, with purge on deploy).
5. **Keep the advantage.** No render-blocking CSS, 1 font, small images, `uses-responsive-images` passing. Do not add a page builder or slider.
6. **Optional:** self-host the 48 KiB font with `preload` and `font-display: swap`. Small gain, low risk.

What not to do: do not copy Impact's approach of delaying all JS through a plugin without checking that forms and the click-to-call handlers still work on first tap.

## 7. Where Evergreen already beats Impact

- Home LCP in this lab (2.19 s vs 2.43 s, the Impact figure being the median of runs 2.43, 2.43 and 4.60 s).
- Page weight on home (588 vs 861 KiB), office (513 vs 863 KiB) and post (506 vs 597 KiB), because images are modern formats and responsive. Impact's three PNGs on home/office add about 700 KiB with an estimated 659 KiB saving available.
- Accessibility 100 vs 87-89 and best practices 100 on all pages (that last is partly the blocking artefact noted on 11 Nov).
- Zero CLS on both, so neither wins.

## 8. Not verified

- Field data (CrUX) for either site. Lab only.
- Whether Impact's gtag and other trackers cost real users anything. Impact's tracker delay hides them from the lab.
- Whether the Evergreen GTM container or Google's gtag bundle changed between 11 and 13 Nov, and the 11 Nov lab machine's benchmark index.
- Impact office has 2 valid runs. Impact home run 1 (LCP 4.60 s) is an outlier and the median hides it.
- Impact Mississauga image audits and its SEO/BP scores failed in the gatherer and are not valid.
- Whether `src/layouts/BaseLayout.astro` already has a preconnect to `img.evergreencleaningservice.ca`. I did not open the file.
- Desktop figures for the other three pages (only home was measured).

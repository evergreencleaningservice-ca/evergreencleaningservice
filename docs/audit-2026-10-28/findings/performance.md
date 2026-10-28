# Performance and Core Web Vitals audit: evergreencleaningservice.ca

Date: 2026-10-28. Compared with jan-pro.com and jan-pro.ca/en/.
Raw data: `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/performance/`

## 1. Headline

- **The 15 Oct optimisation work is live and measurable.**
  - reCAPTCHA is not requested on load on any page tested. It loads on first focus in the quote form (0 requests before interaction, 11 after).
  - There are zero render-blocking resources: CSS is inlined.
  - `/_astro/*` is served `max-age=31536000, immutable` and `/fonts/*` `max-age=2592000`.
  - Mobile page weight is 0.49 to 0.70 MB.
  - CLS is 0 on the homepage, service page and paid page.
- **Remaining problems, in order of size:**
  1. Google tag work (GTM plus the AW-18472921801 gtag and call-tracking) costs about 0.45 to 0.59 s of mobile TBT on every page. Blocking those hosts takes TBT to about 0 (measured).
  2. `/video/lead-net.mp4` (2.53 MB) is downloaded on every page view, starting about 3 s after `load`. It has `Cache-Control: max-age=0, must-revalidate`.
  3. The homepage LCP image (24 KB AVIF) takes about 1.1 to 1.4 s to load under throttling. Google tags compete for bandwidth with it.
  4. A small font-swap CLS of 0.033 appears on location pages on mobile. It is under the 0.1 threshold, but the repo doc claimed 0.
- **Not verifiable:**
  - PSI scores. The API returned HTTP 429.
  - CrUX field data. Anonymous access returned HTTP 403.
  - INP.
  - Whether the PSI 46 / 71 numbers from 15 Oct have moved. Re-run PSI with a key to confirm.

## 2. Method and limitations

| Item | What was done |
|---|---|
| PageSpeed Insights API (no key) | `runPagespeed` returned **HTTP 429** ("Queries per day" quota exhausted). **No PSI or Lighthouse score exists in this audit.** |
| CrUX API (anonymous) | `records:queryRecord` for the origin returned **HTTP 403** (needs an API key). **No field data (LCP, INP, CLS at p75) is available.** |
| Browserless MCP (Lighthouse) | **Not tried.** The ToolSearch tool needed to load it was not available in this sub-agent. Not a finding about the tool. |
| claude-seo Python scripts | Not usable (they refuse the local proxy), as the brief said. |
| What was used instead | Node Playwright 1.63 with Chromium (`/opt/pw-browsers`) through the agent proxy, with scripts in `.../scratchpad/tools/` (`measure.js`, `deep.js`, `cls.js`). |
| Mobile profile | 390x844, DPR 3, Moto G Power user agent, CDP CPU throttle 4x, network 1.6 Mbps down / 750 kbps up / 150 ms RTT, cache disabled. |
| Desktop profile | 1350x940, no CPU throttle, 10 Mbps, 40 ms RTT. |
| Runs | **3 cold runs per page and device, run sequentially, medians reported.** Each run waited for `load` plus 6 s. |
| Metric definitions | FCP, LCP and CLS come from PerformanceObserver. TBT = sum of (long task minus 50 ms) for tasks ending after FCP, over load plus 6 s. It is a **TBT proxy, not Lighthouse TBT**. Transfer KB = CDP `encodedDataLength` summed for all requests. |
| Discarded batch | A first batch ran three Node processes in parallel and was CPU-contended: TBT 0.75 to 1.4 s, LCP 2.4 to 3.2 s on the Evergreen homepage. It is kept in `raw/performance/contended-parallel/` and **not used**. It does show how much these numbers move with CPU contention. |
| Environment caveats | Traffic goes through the egress proxy, so the browser's measured protocol is HTTP/1.1. `curl` shows the origin serves HTTP/2 via Cloudflare with brotli. TTFB (about 110 to 230 ms) reflects this path, not real users. Throttling is applied (CDP), not simulated like Lighthouse. **Absolute values are not comparable to PSI.** Relative comparisons (page vs page, site vs site, tags blocked vs not) are valid because all runs used the same setup. |
| INP | **Not measured.** TBT and long-task counts are the only interactivity proxy. |

## 3. Results (median of 3 sequential cold runs)

Perf score: **not measurable here** (no Lighthouse run available). FCP, LCP and TBT in ms. Transfer is KB at about 6 s after `load`.

### Mobile (4x CPU, 1.6 Mbps)

| Page | Perf score | FCP | LCP | TBT proxy | CLS | Transfer KB | Requests |
|---|---|---|---|---|---|---|---|
| `/` | n/a | 732 | 1,608 | 442 | 0 | 658 (video partial, not counted) | 30 |
| `/services/office-cleaning/` | n/a | 604 | 604 | 543 | 0 | 703 | 27 |
| `/lp/office-cleaning/` | n/a | 536 | 1,624 | 588 | 0 | 531 | 25 |
| `/locations/mississauga/` | n/a | 596 | 596 | 539 | **0.034** | 493 | 25 |
| jan-pro.com `/` | n/a | 708 | 1,360 | 0 | 0 | 222 | 19 |
| jan-pro.ca `/en/` | n/a | 1,292 | 2,240 | **2,009** | 0 | 1,501 | 87 |

### Desktop (no CPU throttle, 10 Mbps)

| Page | Perf score | FCP | LCP | TBT proxy | CLS | Transfer KB | Requests |
|---|---|---|---|---|---|---|---|
| `/` | n/a | 388 | 592 | 31 | 0.001 | 3,111 (637 without video) | 30 |
| `/services/office-cleaning/` | n/a | 340 | 340 | 33 | 0.001 | 3,177 (703 without video) | 27 |
| `/lp/office-cleaning/` | n/a | 316 | 568 | 38 | 0 | 531 | 25 |
| `/locations/mississauga/` | n/a | 340 | 340 | 37 | 0.002 | 2,968 (494 without video) | 25 |
| jan-pro.com `/` | n/a | 448 | 872 | 0 | 0.001 | 222 | 19 |
| jan-pro.ca `/en/` | n/a | 872 | 872 | 158 | 0.017 | 1,522 | 92 |

Notes on the tables:

- **Spread across the 3 runs.** Evergreen mobile TBT ranged 353 to 685 ms and mobile LCP on the homepage ranged 1.53 to 2.04 s.
- **Single-run outliers.** Run 1 on the homepage mobile made 36 requests instead of 30, so the request count is a median.
- **Video bytes.** On mobile the mp4 had only started downloading when the window closed. About 0.6 MB had arrived by 6 s after `load` in the separate `deep.js` run. On desktop it completed (2,474 KB) in the same window.
- **Desktop vs mobile.** Desktop is clean on every Evergreen page: LCP under 0.6 s and TBT under 40 ms.

## 4. Did the 15 Oct work land?

| Change claimed (`docs/growth/performance.md`) | Live evidence | Verdict |
|---|---|---|
| reCAPTCHA deferred to form intent | No recaptcha script in HTML or network on load on any of the 4 pages (`recaptcha: false`). On `/lp/office-cleaning/`, focusing the first form input triggered `recaptcha/api.js` plus 10 more requests (0 requests before focus). | **Landed** |
| CSS inlined | `renderBlockingStatus` shows 0 blocking resources on all Evergreen pages. Homepage HTML is about 28 KB over the wire (brotli), about 134 KB decoded. | **Landed** |
| Long cache for `/_astro/*` and `/fonts/*` | `/_astro/*` is `public, max-age=31536000, immutable`; `/fonts/*` is `max-age=2592000`. | **Landed** |
| Fonts preloaded | `<link rel=preload>` for raleway and open-sans in the HTML. Italic is not preloaded (see §7). | **Landed** (partial) |
| Homepage transfer 1,538 KB to 721 KB | 658 KB measured (mobile, same order). | **Consistent** |
| Video fetched only when its bubble appears | It does appear after `load`, but the file is **2.53 MB**, not the "40KB+" the code comment says. The whole file downloads on every page that renders the widget. | **Partly: deferred but large** |
| CLS 0 everywhere | **0.034 on mobile `/locations/mississauga/`**; 0 on `/`, service and paid pages. | **Not quite** |
| Images cached 1 day only (flagged as not done) | `img.evergreencleaningservice.ca` still serves `public, max-age=86400, s-maxage=31536000`. | **As expected: still open** |
| Mobile TBT 400 to 600 ms from Google tags | Measured 442 to 588 ms. Blocking Google tags took it to 0 to 4 ms. | **Confirmed** |

Whether the 46 / 71 PSI scores moved cannot be checked here. The repo's local Lighthouse 13.5 run of the same build reported mobile 75 (home), 87 (office), 78 (paid), 83 (Mississauga) and desktop 98 to 100. Those are the previous team's numbers, not re-verified in this audit.

## 5. LCP element and what delays it

| Page | LCP element | Notes |
|---|---|---|
| `/` mobile | `<img>` `hero-mobile-640x800.avif` (24 KB, `fetchpriority=high`, `loading=eager`) | LCP is 0.9 s after FCP. |
| `/` desktop | `<img>` `hero-1600.avif` (45 KB) | LCP 592 ms. |
| `/services/office-cleaning/` | `<p class="offer-summary">` text | LCP equals FCP (604 ms). No image is LCP. |
| `/locations/mississauga/` | `<p class="loc-lead">` text | LCP equals FCP (596 ms). |
| `/lp/office-cleaning/` | `<img>` `hero-1600.avif` on both mobile and desktop | The 1600w file (about 45 KB) is used on a 390 px viewport. The homepage uses a 24 KB 640x800 art-directed source. |

LCP breakdown for the homepage mobile hero (from `deep.js`, 3 baseline runs):

| Phase | Time |
|---|---|
| TTFB | about 130 to 200 ms (proxy path) |
| Resource load delay (HTML start to image request issued) | about 200 ms (the request is issued at about 385 to 415 ms) |
| Resource load duration | about 1.1 to 1.4 s for 24 KB (includes a new TLS connection to `img.` under 150 ms RTT, plus bandwidth shared with GTM and gtag) |
| Element render delay | about 40 ms or less (render time equals load time) |

What the third parties add to that LCP (3 runs per scenario, mobile homepage):

| Scenario | LCP |
|---|---|
| Baseline | 1,540 to 1,820 ms |
| Google tags blocked | 1,376 to 1,624 ms |
| All third parties blocked | 1,032 to 1,256 ms |

So **third parties cost about 0.3 to 0.55 s of mobile LCP on the homepage**, by competing for the 1.6 Mbps link (`gtm.js` 153 KB and `gtag/js` 164 KB). Discovery is not the problem (the `<img>` is in the HTML, high priority). The cost is connection setup to `img.` and bandwidth.

## 6. Third-party impact

Measured on the homepage, mobile, first load.

| Third party | Requests | KB | Impact |
|---|---|---|---|
| `googletagmanager.com` (`gtm.js` GTM-5W69BTJQ, `gtag/js?id=AW-18472921801`) | 8 | 319 | **The dominant cost.** Blocking Google tag hosts: homepage TBT 531 to 886 ms down to 0 to 4 ms; service page 462 to 572 ms down to 0. |
| Google Ads (`googleads.g.doubleclick.net` viewthrough, `ad.doubleclick.net`, `google.com/ccm`, `rmkt`, `pagead`) | 8 | about 5 | Small bytes, but chatty (cross-origin `collect` calls after load). |
| Call tracking (`gstatic.com/call-tracking_9.js`, `wcm/loader.js`) | 2 | 24 | Needed for tracked phone leads. Loaded `async`. |
| Cloudflare Web Analytics (`beacon.min.js`, `/cdn-cgi/rum`) | 2 | 11 | Minor. Redundant if GA4 is in the container. |
| **Trustindex** | 0 | 0 | **Not present** on any page tested. Nothing to report. |
| **reCAPTCHA** | 0 on load | 0 | Loads on form intent only. Confirmed. |
| Fonts | 3 | 145 | Self-hosted woff2, `font-display: swap`, 30-day cache. No Google Fonts request. Italic (49.7 KB) is fetched on every page at VeryHigh priority. |
| Images host `img.evergreencleaningservice.ca` (Backblaze B2 via Cloudflare) | 1 to 5 | 6 to 115 | Separate origin (extra connection). `max-age=86400`. `preconnect` present. AVIF used. |
| Video (`/video/lead-net.mp4`, first-party) | 1 | **2,474** | Biggest byte item. See §7. |

TBT attribution (3 runs each, mobile):

| Page | Baseline | Google tags blocked | All third parties blocked |
|---|---|---|---|
| `/` | 531 / 886 / 819 ms | 4 / 0 / 0 ms | 0 / 0 / 0 ms |
| `/services/office-cleaning/` | 462 / 572 / 524 ms | 0 / 0 / 0 ms | 0 / 0 / 0 ms |

The site's own JavaScript contributes essentially nothing to blocking time.

## 7. Fixes, ordered by expected gain

Gains are from the measurements above unless marked as an estimate.

1. **Cut the Google tag main-thread cost.** *Largest gain: about 440 to 590 ms of mobile TBT (measured), plus about 0.2 to 0.5 s of mobile LCP where the LCP is an image.*
   - Audit the container for unused tags and send GA4 and Ads through one Google tag, as the repo doc already recommends.
   - Consider loading GTM after first interaction or a 3 to 4 s idle timer. This is a **measurement trade-off for the ads owner**: the call-tracking number swap and page views from non-interacting visitors would be delayed or lost (the repo doc §5 reasons the same way).
   - Not recommended: Partytown or similar, because call tracking needs `document` access.
2. **Stop downloading the 2.5 MB mp4 on every page view.** *About 2.4 MB saved per view; desktop page weight falls from 3.1 MB to 0.64 MB (measured). No LCP effect, but it competes for bandwidth after `load` on mobile data.*
   - Load the video on click of the bubble, or compress it to under 500 KB, or use a poster image until the visitor presses play.
   - Add `/video/*` to `public/_headers` with `Cache-Control: public, max-age=2592000`. It currently serves `max-age=0, must-revalidate`.
   - The comment in `src/components/LeadVideo.astro` says the clip is "a 40KB+ download". `public/video/lead-net.mp4` is 2,533,009 bytes, so the comment is wrong.
   - Whether Lighthouse counts this depends on timing: the request starts after `load`, so PSI may or may not catch it. Real users do pay it.
3. **Shorten the homepage hero image path.** *Estimated 0.1 to 0.3 s of mobile LCP (estimate, not measured).*
   - Add `<link rel="preload" as="image" fetchpriority="high" imagesrcset=... media="(max-width:640px)">` at the top of `<head>`. The image request is currently issued about 200 ms after the HTML starts.
   - Serve images through `www.evergreencleaningservice.ca` (or a same-origin Cloudflare route) so they reuse the existing connection instead of opening a new TLS connection to `img.`.
4. **Use the mobile hero source on `/lp/office-cleaning/`.** *About 20 KB (about 0.1 s at 1.6 Mbps).* The paid page loads the 1600w AVIF on a 390 px screen; the homepage already has a 640x800 variant.
5. **Remove the font-swap layout shift on location pages.** *CLS 0.033 to about 0 on mobile `/locations/*`.*
   - Confirmed by test: blocking `/fonts/` removed the shift entirely (2 of 2 runs). Blocking Google tags did not. The shifted nodes are `P.loc-lead`, an `H2` and `UL.loc-detail`.
   - Fix with a metric-matched fallback (`size-adjust`, `ascent-override`) for Open Sans and Raleway, or `font-display: optional` for body text.
6. **Look at the italic font.** *About 50 KB per page.* `open-sans-italic.woff2` loads at VeryHigh priority on every page. Subset it, lazy-load it, or drop it if italics are rare above the fold.
7. **B2 image cache lifetime** from `max-age=86400` to `2592000`. *Repeat visits only.* Already flagged in the repo doc.
8. **Drop the Cloudflare Web Analytics beacon** if GA4 covers the same need (about 11 KB and one XHR).

## 8. Jan-Pro comparison

| | Evergreen (home) | jan-pro.com | jan-pro.ca/en/ |
|---|---|---|---|
| Mobile LCP | 1,608 ms | 1,360 ms | 2,240 ms |
| Mobile TBT proxy | 442 ms | **0** | **2,009 ms** |
| Mobile transfer / requests | 658 KB / 30 | **222 KB / 19** | 1,501 KB / 87 |
| Render-blocking resources | 0 | 0 | 3 (two CSS files, `inventive-acute.com/js/818068.js`) |
| Third parties | Google tags, call tracking, CF beacon | none seen on load | GTM (12 requests), HubSpot, Clarity, Bing, LinkedIn, Facebook, privacy-center SDK |
| Desktop CLS | 0.001 | 0.001 | 0.017 |
| 15 Oct PSI (repo doc) | 46 / 71 | 96 / 100 | 38 / 67 |

- **Evergreen vs Jan-Pro Canada.** Evergreen is clearly better on the measures that matter: about 1/4 the TBT, 1/3 the requests, no render-blocking files, and half the weight. Its text-LCP pages (service, location) are the fastest in the set, at about 0.6 s on mobile.
- **Evergreen vs Jan-Pro US.** Jan-Pro US still wins on TBT and weight in this lab.
  - It does so by loading essentially no third-party scripts in the lab window. The repo doc attributes this to a caching plugin holding 56 of 73 scripts until first interaction.
  - That is a lab advantage, not proof of a better real-user experience: the deferred scripts run at first interaction, which could hurt INP and tracking. This was **not measured**.
- **LCP.** Jan-Pro US mobile LCP (1.36 s) is slightly ahead of Evergreen's homepage hero (1.61 s). The gap closes if fix 1 and fix 3 are done.

## 9. Performance score: 80 / 100

This is a judgement score, not a Lighthouse score (none could be run). It weighs the lab results above; there is no field data.

- **In the site's favour (about +50):**
  - Render path is clean. No render-blocking files, CSS inlined, small HTML.
  - Mobile LCP under 1.7 s on every page in this lab. Text-LCP pages at about 0.6 s.
  - CLS 0 on three of four pages tested, 0.034 on the fourth.
  - Desktop is excellent: LCP under 0.6 s, TBT under 40 ms.
  - Page weight under 0.7 MB on mobile (video aside). Long caching on scripts and fonts. AVIF images. reCAPTCHA genuinely deferred.
- **Deductions (about -20):**
  - Mobile TBT of 0.44 to 0.59 s on every page, almost entirely Google tags. It is the metric most likely to keep PSI mobile under 90. The repo's own Lighthouse run put mobile at 75 to 87.
  - 2.5 MB video downloaded on every view (a desktop page weight 5x higher than necessary).
  - Small font-swap CLS on location pages.
  - Hero image on a separate origin with a short image cache.
- **Uncertainty:** no field data (CrUX 403), no PSI (429), no INP, and the lab runs through a proxy. A PSI re-run with an API key is the single most useful follow-up. Expect mobile to land in the 70s to 80s, not the 90s, until fix 1 is addressed. That is an expectation based on the repo's Lighthouse run, not a measurement from this audit.

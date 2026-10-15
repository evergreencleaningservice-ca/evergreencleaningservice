# Performance: before and after

## 1. Baselines supplied in the brief

These are single PageSpeed Insights lab runs taken on 15 Oct 2026 at about 12:52 EDT.

| Site | Mobile | Desktop | Mobile FCP | Mobile LCP | Mobile TBT | CLS |
|---|---|---|---|---|---|---|
| Evergreen (production) | 46 | 71 | 9.0 s | 13.2 s | 420 ms | 0 |
| JAN-PRO US | 96 | 100 | — | 2.4 s | 0 ms | — |
| JAN-PRO Canada | 38 | 67 | — | 10.4 s | 1,650 ms | — |

Reports:

- https://pagespeed.web.dev/analysis/https-www-evergreencleaningservice-ca/1rmt5pxu65?form_factor=desktop
- https://pagespeed.web.dev/analysis/https-jan-pro-com/61oxtzpwru?form_factor=desktop
- https://pagespeed.web.dev/analysis/https-jan-pro-ca-en/hxp69abee5?form_factor=desktop

**PageSpeed Insights could not be re-run from this environment.** The anonymous API quota was exhausted (HTTP 429), and no API key was available. So the comparison below uses Lighthouse 13 run locally under fixed conditions instead. Run PSI again after deploying to get comparable public numbers.

## 2. Test conditions for the before/after comparison

- **Tool.** `scripts/lh-masquerade.mjs` (Lighthouse 13.5, Chromium 141.0.7390.37, headless).
- **What is served.** Each build is served from a local server, but the measuring browser resolves `www.evergreencleaningservice.ca` to it. As a result the page behaves as production: GTM-5W69BTJQ, the Google Ads tags, website call tracking and the real reCAPTCHA key all load. Images come from the real image host.
- **Throttling.** Mobile uses Lighthouse's default mobile profile with simulated throttling (Moto G Power emulation, 4× CPU, about 150 ms RTT and 1.6 Mbps). This is the same method PSI uses. Desktop uses Lighthouse's desktop preset.
- **Runs.** 5 runs per page on mobile and 3 on desktop. **Medians** are reported.
- **Builds.**
  - **Before** = `main` at `d5822bc`, which is byte-identical to what production served on 15 Oct.
  - **After** = this branch.
  - Both are production builds, built with the real reCAPTCHA site key.
- **Differences from production.** The HTML and same-origin assets are served over HTTP/1.1 from loopback rather than HTTP/2 from Cloudflare's edge, and third parties pass through the agent proxy. Treat absolute numbers as this environment's own. The **before/after difference** is the finding. Absolute values are not PSI numbers.

## 3. Results (lab, medians)

### Mobile

| Page | | Perf | FCP | LCP | TBT | CLS | Transfer | Requests |
|---|---|---|---|---|---|---|---|---|
| `/` (homepage) | before | 62 | 2.40 s | 4.81 s | 677 ms | 0.001 | 1,538 KB | 43 |
| | **after** | **75** | **1.85 s** | **4.08 s** | **451 ms** | **0** | **721 KB** | **27** |
| `/services/office-cleaning/` | before | 61 | 2.11 s | 6.83 s | 434 ms | 0.098 | 866 KB | 24 |
| | **after** | **87** | **1.63 s** | **2.11 s** | 443 ms | **0** | 741 KB | 24 |
| `/locations/mississauga/` | before | 87 | 1.95 s | 1.95 s | 465 ms | 0.005 | 991 KB | 38 |
| | **after** | 83 | **1.64 s** | 2.10 s | 588 ms | **0** | **527 KB** | **22** |
| `/lp/commercial-cleaning-quote/` | before | 60 | 1.27 s | 5.05 s | 921 ms | 0 | 1,290 KB | 39 |
| | **after** | **78** | 1.49 s | **3.34 s** | **562 ms** | 0 | **499 KB** | **23** |
| `/lp/office-cleaning/` (new) | after | 78 | 1.50 s | 3.19 s | 593 ms | 0 | 504 KB | 23 |

### Desktop

| Page | | Perf | LCP | TBT | CLS |
|---|---|---|---|---|---|
| `/` | before | 96 | 1.38 s | 49 ms | 0.002 |
| | **after** | **98** | **0.97 s** | 81 ms | 0 |
| `/services/office-cleaning/` | before | 96 | 1.22 s | 30 ms | 0.077 |
| | **after** | **100** | **0.52 s** | 35 ms | **0** |
| `/lp/commercial-cleaning-quote/` | after | 99 | 0.93 s | 42 ms | 0 |

### Accessibility and SEO (Lighthouse, after)

- **Accessibility: 100** on the home, office, Mississauga, our-process, industries and request-a-quote pages, and on the paid office page. These were checked after fixing contrast in the new footer and location sidebar, tap-target sizes, link underlines in running text, and three heading-order skips.
- **SEO: 100** on indexable pages. Paid pages score 69 only because they are `noindex` **on purpose**.

## 4. Targets and honest status

| Target | Status |
|---|---|
| Mobile performance 90+ on key pages | **Not met in this lab.** The office page is at 87 (runs 86–91). The homepage is at 75. The paid pages are at 78. |
| LCP ≤ 2.5 s | **Met on the service and location pages** (about 2.1 s). **Not met on the homepage** (about 4.1 s median, with runs spread between 2.9 and 4.2 s) or on the paid pages (about 3.2–3.3 s). |
| Low TBT | Improved on every page that loaded reCAPTCHA (the paid page dropped 921 → 562 ms). It remains **about 400–600 ms** — see §5. |
| CLS ≤ 0.1 | **Met: 0** on every page measured. |
| Field Core Web Vitals (INP ≤ 200 ms at p75) | **Not measurable here.** The brief's PSI report showed no field data for this origin. Field data needs CrUX volume or Search Console access (intake D3). |

## 5. What is left, and why

**The Google Ads container is now most of the blocking time.**

In every after-run, the two largest scripts were:

- `gtag/js?id=AW-18472921801`, about 360–440 ms of scripting
- `gtm.js?id=GTM-5W69BTJQ`, about 230–340 ms

Together they account for nearly all of the remaining 400–600 ms of TBT. The site's own document scripting is under 60 ms.

**Measurement trade-off — not taken, deliberately.**

- JAN-PRO US reaches 96 largely because a caching plugin holds 56 of its 73 scripts, analytics included, until the first user interaction (see adaptation-matrix #11).
- Doing the same here would remove most of the remaining TBT in the lab.
- It would also delay Google's call-tracking number swap until after a visitor's first tap. A visitor who calls straight from the hero would then dial the untracked number, so attributed phone leads would be lost.
- It would also drop page views from visitors who never interact.

That is a measurement decision for the advertising owner, so it was left out. The cleaner fixes are in the container itself: one Google tag, no unused tags, and GA4 configured as a single tag rather than added alongside.

**Homepage LCP variance.**

- The LCP element is the decorative hero photo: a 23 KB AVIF on mobile, discovered immediately (resource load delay about 25 ms).
- The variance comes from *element render delay*: main-thread contention from the container while the image is decoding and painting.
- A preload would not help, because discovery is not the problem.

**Not changed: B2 image caching.**

- Images are served with a one-day browser cache (`max-age=86400`).
- Raising that requires re-uploading every object with new metadata, which is an external side effect on the client's bucket.
- **Recommendation:** set `max-age=2592000` in `scripts/b2-sync.mjs` and re-sync during the next approved deploy.

## 6. Causes found, and fixes made

| Reported opportunity | Investigation | Fix |
|---|---|---|
| reCAPTCHA listed 3× (~1,039 KiB) | **Not a code duplicate.** One v2 widget loads `recaptcha__en.js` in the page, the anchor iframe and the challenge iframe. It was injected on first paint of every page that had a form, which was every inner page. It accounted for about 1.1–1.4 s of mobile scripting on the homepage. | The script now loads on focus, press or keystroke in the form, or once the visitor has scrolled the checkbox into range. The 78 px slot keeps its space (no CLS) and explains itself until the widget appears. Server-side verification is unchanged. Test: `tests/recaptcha-loader.test.ts`. |
| Unused JS: Google tagging (gtm.js and gtag) | Required for conversions and call tracking. The container is already lean: 4 tags. | Not deferred (see §5). Container-side recommendations are in tracking-spec. |
| Hero LCP (`section#hero … img`) | Discovery was fine (eager, high priority, srcset/AVIF). The large rotating brandmark and the 30% overlay were cosmetic. | Hero simplified, text-first, darker scrim. The remaining variance is attributed to container main-thread work (above). |
| Render-blocking (~900 ms) | Four small stylesheets. | `build.inlineStylesheets: 'always'`. HTML grew by about 6 KB gzipped; there are no blocking CSS requests. |
| Cache lifetime (~2,416 KiB) | `/_astro/*` was served with `max-age=0`. Images are on B2 with 1 day. | `/_astro/*` set to 1 year immutable and `/fonts/*` to 30 days via `public/_headers`. B2 caching is a recommendation (§5). |
| Total transfer (~4.7 MB) | reCAPTCHA, the floating video's mp4 (fetched at load), images. | Mobile homepage transfer is down 53% (1,538 → 721 KB in this lab). The video is fetched only when its bubble appears, after `load`. |
| JS execution (~2.1 s) | reCAPTCHA plus the scroll-reveal observer. | Both removed from initial load. Content is no longer hidden until JavaScript reveals it. |
| CLS | 0.098 on the service page (font swap on the large H1). | Fonts preloaded in the main layout: CLS 0. |

## 7. Reproduce

```bash
export PUBLIC_RECAPTCHA_SITE_KEY=6LcyzNctAAAAACGzkXLGxWE2M4LC7jJiCfcTzZE7
npm run build && cp -r dist /tmp/after
git stash; git checkout main; npm run build && cp -r dist /tmp/before; git checkout -; git stash pop
node scripts/lh-masquerade.mjs /tmp/before before 5 / /services/office-cleaning/
node scripts/lh-masquerade.mjs /tmp/after  after  5 / /services/office-cleaning/
LH_FORM=desktop node scripts/lh-masquerade.mjs /tmp/after after 3 /
```

Page views from these runs reach the client's Google Ads tag, exactly as a PSI run does. No conversion fires.

# Technical SEO audit: www.evergreencleaningservice.ca

Date: 2026-10-28. Stack: Astro static build served by a Cloudflare Worker with static assets. Auditor: technical-SEO subagent.

**Technical SEO score: 84 / 100**

## Method and limits
- Fetching: curl via the preconfigured proxy (TLS verification on), a Python crawler (0.5 s delay, robots.txt allow-all), Playwright Chromium (Pixel 7 emulation).
- Crawl: seeded from `/sitemap-0.xml` (73 URLs) plus internal links from the homepage. 111 unique URLs crawled, all fetched with redirects followed manually. The link-follow cap of 150 was not reached because the link graph is closed at 111 URLs. Full per-URL data (status, redirect chain, canonical, robots meta, X-Robots-Tag, title, description, H1 count, hreflang, response time): `raw/technical/crawl.csv`. Saved HTML: `raw/technical/html/`.
- Response times in the CSV are full-body fetch time through the agent proxy, not true TTFB.
- Core Web Vitals: the Browserless MCP tool could not be loaded (no ToolSearch available in this subagent), and the PageSpeed Insights API returned **HTTP 429 (daily quota exceeded)** for both URLs without a key. No Lighthouse score or CrUX field data was obtained. The only performance numbers below are my own Playwright lab measurements (unthrottled, via proxy, single run), labelled as such. They are not Lighthouse and not field data.
- The claude-seo Python scripts were not used (proxy refusal, as instructed).

## Crawl summary stats (raw/technical/crawl.csv)
| Metric | Result |
|---|---|
| URLs crawled | 111 (73 from sitemap, 38 discovered via links) |
| Final status | 111 x 200, 0 errors, 0 redirects on any internal link target |
| Sitemap URLs returning 200 / redirecting / noindex | 73 / 0 / 0 |
| Canonical self-referencing (200 HTML pages) | 111 of 111 |
| Missing title / meta description / viewport | 0 / 0 / 0 |
| H1 count | exactly 1 on all 111 |
| Duplicate titles / descriptions | 0 / 0 |
| Titles over 60 chars | 5 (Mississauga 72, Vaughan 69, three at 61) |
| Descriptions over about 160 chars | 13 (most only a few chars over) |
| hreflang | none (single-language site, correct) |
| JSON-LD | present on all 111 pages |
| Mixed content (http:// subresources) | 0 |
| Crawled but noindex | 38 (tag, category archives and their pagination: `noindex, follow`), none in sitemap |
| Median / p90 / max fetch time | 0.13 s / 0.37 s / 0.89 s |
| HTML size | max 134 KB decoded, about 26 KB Brotli on the homepage |

## Category pass/fail
| Category | Status | Note |
|---|---|---|
| Crawlability | Pass | robots.txt allow-all, valid sitemap chain, /search/ is the one leak |
| Indexability | Pass | clean canonicals, noindex hygiene is good |
| Security | **Fail** | HTTPS and redirects fine, but no security headers on HTML |
| URL structure | Pass | slash redirects are 307 not 301 |
| Mobile | Pass | viewport on all pages, responsive images |
| Core Web Vitals | Not measurable (Lighthouse/PSI unavailable); lab signals good |
| Structured data | Pass | JSON-LD on every page (CleaningService, PostalAddress, OfferCatalog, WebSite/SearchAction) |
| JS rendering | Pass | fully server-rendered |
| IndexNow | Not verified | no key file probed; see Low |

## Issues

### Critical
None found.

### High
1. **No security headers on any HTML response.** Checked `GET /` and several pages: no `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors` or `Permissions-Policy`. Evidence: `curl -D - https://www.evergreencleaningservice.ca/` shows only cache-control, server, alt-svc and Cloudflare headers. The image host `img.evergreencleaningservice.ca` and the `/admin/` Worker routes do send HSTS / nosniff, so the gap is only the static HTML and assets. `public/_headers` currently has no `/*` security block (by design for noindex, but it can still carry security headers).
   Fix: add to `public/_headers`:
   ```
   /*
     Strict-Transport-Security: max-age=31536000; includeSubDomains
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: camera=(), microphone=(), geolocation=()
     X-Frame-Options: SAMEORIGIN
   ```
   Add a Report-Only CSP first (GTM, Google Ads, Cloudflare Insights, Trustindex and img.* host must be allowed), then enforce. Do not add `preload` to HSTS until all subdomains are confirmed HTTPS.
   Note: this is a trust/best-practice item. Google does not use these headers as a direct ranking factor.

### Medium
2. **`/search/` is indexable, in the sitemap and an orphan.** `https://www.evergreencleaningservice.ca/search/` has no robots meta, is listed in `sitemap-0.xml`, has 0 internal inlinks, a 50-char description, and is a thin utility page. `/search/?q=test` canonicalises to `/search/` (good), but the page itself should not be offered for indexing. Fix: add `<meta name="robots" content="noindex, follow">` on the search template and exclude `/search/` from the `@astrojs/sitemap` filter. Keep the WebSite/SearchAction schema only if the search feature is genuinely useful; Google no longer shows the sitelinks search box.
3. **Sitemap has no `<lastmod>`** on any of the 73 URLs (0 of 73). Evidence: `/sitemap-0.xml`. Fix: set `lastmod` in the `sitemap()` integration `serialize` hook from each post's published/updated date (and build date for static pages, only when content changed). Only use accurate dates. The Worker-injected live posts should add `lastmod` as well.
4. **Slash-less URLs redirect with 307, not 301.** `/about-us` returns `HTTP/2 307 location: /about-us/`; same for `/lp/commercial-cleaning`. This is Cloudflare Workers static-assets `html_handling` behaviour. Internal links are all slashed (0 internal link targets redirect), so impact is only on external/legacy links. Fix: if you want permanent signals for old inbound links, add explicit 301 rules in `_redirects`/Worker for known legacy slash-less URLs, or accept as is.
5. **Core Web Vitals not verified with Lighthouse/CrUX.** PSI returned 429; Browserless unavailable. Re-run later with an API key (`PSI_API_KEY`) or from PageSpeed Insights in a browser for `/` and `/services/office-cleaning/`, mobile. See lab data below for what I could measure.
6. **Third-party script weight on every page.** Playwright shows GTM (`gtm.js` 157 KB) and `gtag/js` for Google Ads AW-18472921801 (168 KB) plus doubleclick, googleadservices and Cloudflare Insights. Total transfer on `/` about 610 KB across 30 requests; GTM+gtag are over half of that. Mobile TBT lab value was 96 ms (home) and 70 ms (office-cleaning), so not a problem today, but this is the most likely INP/LCP regressor on slower real devices. Fix: load GTM after first interaction or `requestIdleCallback`, and review whether both GTM and a direct gtag are needed.

### Low
7. **Title length.** 5 titles are over 60 chars and may truncate: `/locations/mississauga/` (72), `/locations/vaughan/` (69), `/services/commercial-cleaning/` (61), and two blog posts (61). Several short generic titles (`/services/graffiti-removal/` "Graffiti Removal - Evergreen Office Cleaning", `/services/pressure-washing/`, `/insights/` "News - ...") lack location/B2B intent. Fix: shorten to 50 to 60 and keep "Toronto" in service titles.
8. **Meta descriptions.** 13 are over 160 chars (e.g. `/services/pressure-washing/` 166). Trim to 150 to 158.
9. **Insights pagination pages are in the sitemap** (`/insights/page/2..4/`). They are self-canonical, have `rel="next"/"prev"` and are indexable, which is acceptable, but they add little. Optional: remove page 2 to 4 from the sitemap, keep indexable. `/insights/page/1/` correctly 404s.
10. **Inline SVG `<title>` noise on the homepage.** Trustindex widget emits repeated `<title>Trustindex verifies that the original source of the review is Google.</title>` inside the body. Not harmful to the real `<title>`, but it can confuse naive parsers; consider `aria-hidden`/removing SVG titles.
11. **Images without width/height.** 130 of 503 `<img>` tags lack explicit dimensions (hero has them). Lab CLS is 0.017 (home), so low risk; add dimensions to the remainder.
12. **Thin internal linking to a few old posts.** Lowest inbound internal links among sitemap URLs: `/insights/page/4/` (1), `/areas-in-your-office-where-germs-are-likely-hiding/` (2), `/how-to-decide-on-a-cleaning-company/` (2), `/insights/page/2/` and `/3/` (2). All are reachable, none are orphans except `/search/`.
13. **Blog posts at root (no /blog/ prefix).** About 40 posts live at `/<slug>/`, alongside `/services/`, `/locations/`, `/industries/`. This is consistent with the legacy WordPress URLs (preserves equity) and all are lowercase, hyphenated and slashed. Three slugs are long (about 70 chars) but fine. Only a risk of slug collision with future top-level pages (the Worker serves admin posts from `/<slug>/`). No change needed; just reserve static route names.
14. **IndexNow not verified.** No IndexNow key file was probed (unknown key name). If Bing visibility matters, add a key and ping on publish; Google ignores IndexNow.
15. **AI crawler policy / llms.txt.** robots.txt is `User-agent: * / Allow: /`, so GPTBot, ClaudeBot, PerplexityBot etc. are permitted. `/llms.txt` returns 404. Optional; decide deliberately.

## Lab performance data (Playwright, my measurement, not Lighthouse)
Pixel 7 emulation, no CPU or network throttling, through the agent proxy, single run, GTM/Ads loaded. Treat as directional only.
| Page | FCP | LCP | LCP element | CLS | TBT (long tasks) | Requests / transfer |
|---|---|---|---|---|---|---|
| `/` | 540 ms | 936 ms | hero `<img>` AVIF 640x800, 23 KB, from img.* host | 0.017 | 96 ms (2) | 30 / about 610 KB |
| `/services/office-cleaning/` | 560 ms | 560 ms | text paragraph | 0.0001 | 70 ms (2) | 27 / about 662 KB |
INP cannot be measured in a lab load; no field data available. Navigation protocol shows http/1.1 only because of the proxy; direct curl negotiated **HTTP/2** and the server advertises **h3** (`alt-svc: h3=":443"`).

## Detailed check results
- **robots.txt**: `User-agent: * Allow: /` and `Sitemap: https://www.evergreencleaningservice.ca/sitemap-index.xml`. The declaration is valid: sitemap-index lists `sitemap-0.xml`, which has 73 valid `<loc>` entries, all https/www/trailing-slash, all 200. `/sitemap.xml` 301s to `/sitemap-index.xml`. No `/admin/` disallow, but `/admin/*` and `/api/admin/*` send `X-Robots-Tag: noindex, nofollow` (and redirect/401), which is the safer pattern.
- **Redirects**: `http://www` to `https://www` 301 (1 hop); `https://apex` to `https://www` 301 (1 hop); `http://apex/about-us` to `https://www/about-us` 301 then 307 to `/about-us/` (2 hops). No chain over 2 hops. No internal link points to a redirecting URL (0 of 111 targets).
- **Trailing slash**: consistent (`trailingSlash: 'always'`); all canonicals, sitemap entries and internal links are slashed.
- **404**: unknown URLs (`/nonexistent-xyz/`, `/tag/zzz/`, `/locations/zzz/`, `/services/zzz/`, `/insights/page/99/`, `/lp/`) all return true HTTP 404 with the custom page, `noindex, nofollow`. No soft-404s found. `/thank-you/` is `noindex, nofollow`.
- **/lp/* paid pages**: `/lp/commercial-cleaning/` and `/lp/commercial-cleaning-quote/` return 200 with `<meta name="robots" content="noindex, nofollow">` and self-canonical; 0 `/lp/` URLs in the sitemap; no internal links from crawled pages. They are crawlable (robots allows), which is correct so the noindex is seen. Both pages stay `nofollow`, so no link equity leaks.
- **Archives**: 38 tag and category archive pages (including pagination) are `follow, noindex`, self-canonical and excluded from the sitemap. Good.
- **Compression**: Brotli (`content-encoding: br`) on HTML (26 KB over the wire for 134 KB) and on JS; browser negotiated zstd.
- **Caching**: HTML `public, max-age=0, must-revalidate` with `cf-cache-status: HIT` (fine for a revalidating static site); `/_astro/*` `max-age=31536000, immutable`; fonts 30 days; images on img.* host `max-age=86400, s-maxage=31536000`.
- **Mobile**: viewport meta on 111 of 111; responsive `srcset` and AVIF mobile hero; fonts self-hosted and preloaded (Raleway, Open Sans); CSS inlined.
- **JS rendering**: the curl HTML and the Playwright-rendered DOM contain the same text. Homepage: 1,569 words raw vs 1,415 rendered (innerText excludes hidden text); 0 words appear only after JS. Office-cleaning: 1,563 raw vs 1,240 rendered; 0 rendered-only. H1, links, JSON-LD are all in the initial HTML. Fully SSR/static; JS is only for forms, tracking and widgets.
- **Structured data**: homepage JSON-LD includes CleaningService (PostalAddress, GeoCoordinates, OpeningHoursSpecification, 10 City areaServed, OfferCatalog/Service) and WebSite/SearchAction. Rich-result validation was not run (no external validator access); recommend Google Rich Results Test.
- **Hreflang**: none present; not needed. Handoff to `seo-hreflang` not required.

## What works
1. Clean, closed crawl graph: 111 of 111 URLs return 200, zero broken or redirecting internal links, zero duplicate titles or descriptions, exactly one H1 and a self-referencing canonical on every page.
2. Excellent indexation hygiene: sitemap lists only 200, indexable, canonical URLs; tag/category/thank-you/404/LP pages are noindex and kept out of the sitemap; real 404 status with no soft-404s; all LP pages noindex.
3. Fast, fully server-rendered delivery: HTML about 26 KB Brotli from the Cloudflare edge (cache HIT), HTTP/2 plus h3 advertised, immutable fingerprinted assets, self-hosted preloaded fonts, responsive AVIF hero. Lab LCP under 1 s and CLS under 0.02.
4. Correct canonical host/protocol redirects (apex to www, http to https, all 301, 1 hop) and consistent trailing slashes.
5. Rich LocalBusiness-style structured data (CleaningService with address, geo, hours, areaServed, services) on every page.

## Score reasoning (84 / 100)
| Area | Weight | Score | Reason |
|---|---|---|---|
| Crawlability | 15 | 14 | clean robots and sitemap chain; minus for /search/ in sitemap and no lastmod |
| Indexability | 20 | 19 | canonical, noindex, 404 handling all correct; /search/ indexable |
| Security | 10 | 3 | HTTPS and redirects good; zero security headers on HTML |
| URL structure | 10 | 9 | clean slugs and slashes; 307 for slash-less |
| Mobile | 10 | 9 | viewport everywhere; 130 imgs lack dimensions |
| Core Web Vitals | 15 | 11 | lab signals good, but no Lighthouse/CrUX data obtained and heavy third-party tags; capped for lack of verification |
| Structured data | 10 | 9 | broad JSON-LD, not externally validated |
| JS rendering | 10 | 10 | fully SSR |
Sum before rounding: 84. Biggest lift available: ship the security header block (about +6) and noindex plus de-list /search/ and add lastmod (about +3).

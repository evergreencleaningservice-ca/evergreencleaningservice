Score: 90/100
Previous: 84/100 (first audit)

Scope: crawl set (89 URLs, raw/crawl/pages.json), robots.txt, sitemaps, raw/home-headers.txt, public/_headers, src/data/redirects.ts, and about 40 live curl probes on 2026-11-06 evening (1 s apart). Repo tools run against production: `npm run verify:indexing -- production` and `npm run seo:drift`.

## Tool results
- `npm run verify:indexing -- production`: 24 of 24 checks passed. Homepage has no X-Robots-Tag noindex. robots.txt is served, does not Disallow /, and names the sitemap on the final domain. Canonical present and no noindex on /, /about-us/, /contact-us/, /services/, /services/office-cleaning/, /request-a-quote/. /lp/commercial-cleaning/, /lp/commercial-cleaning-quote/ and /thank-you/ are noindex. Sitemap index lists 2 sitemaps, 60 URLs, all on the final domain, no noindexed route in the sitemap. The script also printed a list of 200 responses for the sitemap routes.
- `npm run seo:drift`: baseline 2026-11-06T20:26Z (64 URLs) vs now 22:07Z (64 URLs read, sitemap 60). 0 critical, 0 warning, 0 info, 0 unverified. This is a comparison with a baseline recorded a few hours earlier, so it shows stability since Phase 4 only. It does not prove the baseline itself is right.

## What works (verified this evening)
- Crawl: all 89 URLs return 200. 0 unresolved internal links (every internal href points at a crawled URL). 0 http:// internal links. No URL in the crawl has zero inbound internal links. One H1 on every page, meta description on all 62 indexable pages, lang en-CA and viewport on all 89, 0 images missing alt, 0 images without width/height.
- Sitemap vs crawl: 60 sitemap URLs, all crawled, all 200 and indexable. 62 indexable pages in the crawl; the 2 not in the sitemap are `/insights/page/2/` and `/page/3/` (intentional). 27 noindex pages (tag archives, `/tag/*/page/2/`, LPs, thank-you), none in the sitemap. 0 canonical mismatches (all self-canonical, absolute, https/www). 0 duplicate titles, 0 duplicate descriptions.
- Redirects, live: the two merged posts return single-hop 301s: `/importance-of-hand-washing/` and `/blog/importance-of-hand-washing/` to `/areas-in-your-office-where-germs-are-likely-hiding/`; `/how-to-take-care-of-plants-in-the-office/` to `/commercial-cleaning-air-quality/`. Both targets are in the sitemap and the old URLs are not. No crawled page links to either old slug. The emptied `/tag/plants/` (with or without slash) 301s to `/commercial-cleaning-air-quality/`; `/tag/covid-19/` 301s to `/services/disinfection-cleaning/`; `/insights/page/4/` 301s to `/insights/`; `/tag/office/page/2/` 301s to `/tag/office/`; `/sitemap.xml` 301s to `/sitemap-index.xml`; `/feed/` 301s to `/rss.xml` (200, application/xml).
- 404: `/nonexistent-page/` returns a real 404 with HTML.
- New pages: `/office-cleaning-checklist/` and `/locations/north-york/` are 200, in the sitemap, with JSON-LD (checklist BlogPosting + BreadcrumbList; north-york Service + WebPage + BreadcrumbList + FAQPage).
- IndexNow key file `/05031d78747205e65eb1ec4a04cc568d.txt`: 200, text/plain, body is exactly the key (matches the filename; no trailing text seen), public. Not submitted to any engine (see Not verified).
- Security headers on the home page: HSTS (1 year), nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, and now an enforced `content-security-policy: frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'` alongside the full report-only policy. Staging/workers.dev hosts get noindex by hostname in `public/_headers`; production is not matched (verify-indexing confirms no noindex on the live home page).
- Compression: `content-encoding: br` on `/` when brotli is requested. Caching: HTML `max-age=0, must-revalidate` with `cf-cache-status: HIT`; `/_astro/*` immutable one year; fonts and video 30 days. Charset: pages declare `<meta charset="utf-8">`; `/llms.txt` sends `text/plain; charset=utf-8`.
- Rendering: static Astro HTML; content, H1 and JSON-LD are in the raw HTML. Only a few small module scripts; no content depends on JS.
- Field Core Web Vitals (raw/cwv-field-6d.txt, 6 days, human traffic, 106 beacons): sitewide p75 LCP 0.98 s, INP 32 ms, CLS 0.002, all good. Mobile has only 28 beacons (indicative). Home path p75 LCP 2.24 s from 28 beacons, in the good band but close to the limit. Sample is small; no CI-backed before/after exists yet.

## Status of every finding in the first audit

| # | First-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | robots.txt Content-Signal lines flagged by Lighthouse (Low) | Open | Live robots.txt still has `Content-Signal: search=yes, ai-input=yes, ai-train=yes` inside both groups. Lighthouse 12.8 flags it as unknown directive (not re-run tonight). Cosmetic; deliberate per the file comment. Owner decision. |
| 2 | Two-hop redirect for http/apex URLs without trailing slash (Low) | Open | `http://evergreencleaningservice.ca/about-us` returns 301 to `https://www.evergreencleaningservice.ca/about-us` (still no slash, so a second 301 follows). Not changed. |
| 3 | Internal http:// link on /privacy/ (Low) | Fixed | Live `/privacy/` HTML contains no `http://www.` string; crawl has 0 http:// internal links. |
| 4 | CSP report-only with unsafe-inline/unsafe-eval (Medium) | Partly fixed | The four non-script directives are now enforced (`frame-ancestors`, `base-uri`, `form-action`, `object-src 'none'`) in a separate `content-security-policy` header. Full policy is still report-only with `'unsafe-inline' 'unsafe-eval'`, so script-src gives no XSS protection. Violation logs not seen. |
| 5 | HSTS without includeSubDomains/preload (Low) | Open | Header still `max-age=31536000`. Deliberate; backlog. |
| 6 | DoubleClick third-party cookie (Low) | Not verified | Not re-measured; Lighthouse was not re-run on best-practices tonight. Depends on the Google Ads tag, unchanged as far as I can tell. |
| 7 | Image host cache TTL (Low) | Open | Not re-probed; no change recorded in the repo. Treat as open. |
| 8 | Blog posts live at the root (Low/Info) | Open (decision recorded as keep) | 23 posts still at root level; unchanged by design. No action recommended. |
| 9 | Pagination /insights/page/N/ (Info) | Fixed / no action | `/insights/page/2/` still 200, self-canonical, outside the sitemap. `/insights/page/4/` now 301s to `/insights/` (3 pages remain after consolidation). `/tag/office/page/2/` now 301s to `/tag/office/`, so the earlier "empty page 2" oddity is gone. |
| 10 | 25 noindex archive URLs linked from indexable pages (Low) | Open | 149 internal links in the crawl point at `/tag/*` or `/category/*` pages. `/tag/*/` archives remain noindex and linked. Unchanged. |
| 11 | 404 canonical points at /404/ which 307s (Info) | Open | `/404/` still returns 307 to `/404`. Noindexed, no impact. |
| 12 | Missing image dimensions on 13 images (Low) | Fixed | Crawl `img_no_dims` sums to 0 across all 89 pages. |
| 13 | Core Web Vitals / rendering weight (High, performance) | Partly fixed | Live home still preloads only `/fonts/open-sans.woff2` (no hero image preload). Lab figures in PHASE-4-MONITORING.md (not re-run by me): home mobile performance 87 (was 51), simulated LCP 2.4 s (was 6.8 s). Field p75 is good on all three metrics (see above). Google tag main-thread time remains. |

## New findings

### N1. Tag and paginated tag archives remain crawlable and in the link graph; `/tag/*/page/2/` pages are thin noindex pages
Severity: Low
Evidence: crawl has 27 noindex URLs including `/tag/cleaning/page/2/`, `/tag/janitorial-services/page/2/`, `/tag/commercial-office-cleaning/page/2/`, `/tag/commercial-cleaning/page/2/`; `/category/blog/` is 200. None are in the sitemap.
Recommendation: No fix needed. Optionally drop the tag chips from post templates so link equity and crawl are not spent on noindex pages (same as first-audit item 10).

### N2. Redirect map breadth depends on a hand-kept list
Severity: Info
Evidence: `src/data/redirects.ts` holds `retiredPosts`, `removedArchivePageRedirects` and `retiredTagRedirects`. All three merge-related cases I probed (two posts, `/tag/plants/`) work as one-hop 301s with live targets. `/tag/plants/` redirects to a post rather than a tag page; that is reasonable but is a topical redirect, not a like-for-like one.
Recommendation: Keep. When a future merge empties another tag, add it to `retiredTagRedirects` in the same PR. The existing tests already cover this pattern.

### N3. Key file served without charset, cached with revalidation
Severity: Info
Evidence: `/05031d78747205e65eb1ec4a04cc568d.txt` returns `content-type: text/plain` (no charset) and `cache-control: public, max-age=0, must-revalidate`. The body is ASCII hex, so charset has no effect.
Recommendation: None required. Optionally add a `/05031d78747205e65eb1ec4a04cc568d.txt` rule with `Content-Type: text/plain; charset=utf-8` in `public/_headers`, as is done for `/llms.txt`.

### N4. Enforced CSP is minimal; full policy still gives no script protection
Severity: Info (overlaps first-audit item 4)
Evidence: enforced header covers only four directives. Report-only has `default-src 'self'` and a script-src with `'unsafe-inline' 'unsafe-eval'`. No regressions observed: the site renders, `seo:drift` shows no change, and verify-indexing passed.
Recommendation: After reviewing `/api/csp-report` logs, move report-only to enforcement and remove `'unsafe-eval'` once the GTM container is audited.

No Critical, High or Medium new issues found. No regressions introduced by the fixes were observed in my area.

## What still needs the client or an account owner
- Decide on the `Content-Signal` lines in robots.txt (keep and accept the Lighthouse flag, or remove) and confirm `ai-train=yes` is the intended policy.
- Review CSP violation reports (`/api/csp-report`, Worker logs) and audit the Google Tag Manager container before enforcing the full policy.
- Confirm that `img.` and `stage.` subdomains are HTTPS-only before adding `includeSubDomains`/`preload` to HSTS.
- Cloudflare dashboard: fold the slash-adding step into the apex/http to www redirect rule, if the two-hop case matters; review the image host cache rule TTL; decide whether Google Ads view-through/remarketing is needed (third-party cookie).
- Submit the IndexNow key (or URL list) to Bing/IndexNow if the owner wants it; this needs a write to an external service and was not done.
- Search Console: confirm the 4 new location pages, the checklist and the redirected URLs are being processed (I have no access).

## Not verified
- Search Console index status, coverage, and whether Google has recrawled the redirects and the merged posts.
- IndexNow: I confirmed the key file is live and matches its name, but did not submit to or test an IndexNow endpoint.
- `/api/csp-report` volume or violations.
- Lighthouse: not re-run by me this evening; lab numbers are from PHASE-4-MONITORING.md. Item 6 (third-party cookie) and item 7 (image host cache) were not re-probed.
- Field vitals: only 106 beacons in 6 days, mobile 28; the 95% CIs are wide, so "good" is indicative.
- Whether the crawl's `content-encoding: gzip` header (crawler default) differs from the live brotli response: I confirmed brotli live with `accept-encoding: br`.
- Cloudflare WAF/bot rules that could affect crawlers.
- Crawl HTML was saved as Latin-1 per the brief, so I did not judge character encoding from it.

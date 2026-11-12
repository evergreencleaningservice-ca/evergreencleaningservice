Score: 92/100
Previous: 90/100 (re-audit 7 Nov; note the earlier technical file scored itself 90, the overall re-audit was 82)

Scope: raw/crawl/pages.json (94 URLs), raw/home-headers.txt, raw/robots.txt, raw/sitemap-urls.txt, public/_headers, and about 30 polite curl probes on 12 Nov 2026 (1 s apart, no analytics pages loaded in a browser, no POSTs). Repo tools run against production.

## Tool results
- `npm run verify:indexing -- production`: 24 of 24 checks passed. Homepage has no noindex X-Robots-Tag; robots.txt 200, no Disallow /; sitemap named on final domain; canonical and no noindex on /, /about-us/, /contact-us/, /services/, /services/office-cleaning/, /request-a-quote/; /lp/commercial-cleaning/, /lp/commercial-cleaning-quote/ and /thank-you/ are `noindex, nofollow`; sitemap index lists 2 sitemaps, 62 URLs, all on the final domain, no noindexed route in the sitemap.
- `npm run seo:drift`: baseline 2026-11-11T20:44Z (66 URLs) vs now 2026-11-12T17:52Z (66 URLs read, sitemap 62). 0 critical, 0 warning, 0 info, 0 unverified. This only shows stability since the baseline was re-recorded yesterday; it does not prove the baseline is correct.

## What works (observed)
- Crawl: all 94 URLs return 200 (no 4xx/5xx). Every page has exactly one H1, lang en-CA, a viewport, and a canonical. 0 images missing alt, 0 images without dimensions.
- Sitemap vs crawl: 62 sitemap URLs, all in the crawl, all 200. 64 indexable pages in the crawl; the 2 not in the sitemap are `/insights/page/2/` and `/insights/page/3/` (intentional pagination, self-canonical). 30 noindex pages (tag archives, tag page 2/3, LPs, thank-you), none in the sitemap. 0 canonical mismatches (all absolute, https, www, self). 0 duplicate titles, 0 duplicate descriptions, 0 indexable pages without a description.
- Internal links: 0 unresolved internal hrefs (every internal link points at a crawled URL), 0 http:// internal links, 0 URLs with zero inbound links. New pages are well linked: `/services/janitorial-services/` has 252 inbound links, `/services/commercial-cleaning/` 288, `/commercial-cleaning-quote-checklist/` 80. The crawl recorded the 301s `/tag/office/page/2/`, `/tag/commercial-cleaning/page/3/` and `/tag/commercial-office-cleaning/page/3/` as one-hop redirects to the tag root; none is linked from a crawled page.
- New pages: janitorial-services is self-canonical, has a distinct title ("Janitorial Services in Toronto & the GTA | Evergreen") from commercial-cleaning ("Commercial Cleaning Services in Toronto | Evergreen"), and JSON-LD BreadcrumbList + Service + WebPage + FAQPage. The quote checklist post has BlogPosting + BreadcrumbList. Both are in the sitemap.
- Redirects live: `http://evergreencleaningservice.ca/about-us` ends at the slashed www URL (2 hops, unchanged); `https://evergreencleaningservice.ca/` 1 hop; `/services/office-cleaning` (no slash) 1 hop; `/importance-of-hand-washing/` 1 hop to the merged post; `/404/` still redirects to `/404`. `/nonexistent-page/` returns a real 404 with HTML.
- HTML charset header (the new change): `content-type: text/html; charset=utf-8` on `/`, `/request-a-quote/`, `/lp/commercial-cleaning/`, `/thank-you/`, `/search/` and the 404 response. All 94 crawled pages carry `text/html; charset=utf-8`. Unaffected types: JS `text/javascript` (immutable, 1 year, br), font `font/woff2` (30 days), sitemaps and `/rss.xml` `application/xml` (unchanged, no charset, XML declares UTF-8 so harmless), `/robots.txt` `text/plain` (no charset, ASCII), `/llms.txt` and the IndexNow key file `text/plain; charset=utf-8`, favicon `image/vnd.microsoft.icon`. No MIME regression seen. The `_headers` rules `/` and `/*/` set the charset (lines 121-125); `/*` keeps only nosniff.
- Security headers on `/` (raw/home-headers.txt and live): HSTS 1 year (no includeSubDomains/preload), nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, enforced CSP subset `frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'` present on HTML, Worker routes (/thank-you/, /search/, 404), llms.txt, sitemaps, rss, robots and JS. Report-only policy now has `https://www.googleadservices.com` in `img-src` (also in script-src and connect-src) with `report-uri /api/csp-report` and `report-to csp`. Still report-only, still `'unsafe-inline' 'unsafe-eval'` in script-src.
- Compression: `content-encoding: br` on HTML, JS, sitemaps, rss, robots, favicon when brotli is requested (crawl default shows gzip on all 94). Fonts are served without content-encoding (woff2 is already compressed; correct).
- Caching: HTML `public, max-age=0, must-revalidate` (67 of 94 crawl hits `cf-cache-status: HIT`, 27 MISS, normal for the first fetch of a crawl); `/_astro/*` immutable 1 year; `/fonts/*` 30 days.
- JS rendering: static Astro HTML; H1, content and JSON-LD are in the raw HTML. 3 to 4 small external module scripts per page, none needed for content. GTM is loaded by `gtm.js?id=` from an inline loader, with a `<noscript>` iframe fallback.

## Status of every finding in the 7 Nov technical file

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | robots.txt Content-Signal lines (Low) | Open | Live robots.txt still has `Content-Signal: search=yes, ai-input=yes, ai-train=yes` in both groups. Deliberate, owner decision. |
| 2 | Two-hop redirect for http/apex without trailing slash (Low) | Open | `http://evergreencleaningservice.ca/about-us` follows 2 redirects to `/about-us/`. |
| 3 | Internal http:// link on /privacy/ (Low) | Fixed | Crawl: 0 http:// internal links across 94 pages. |
| 4 | CSP report-only with unsafe-inline/unsafe-eval (Medium) | Partly fixed | Enforced subset unchanged; full policy still report-only and still has both unsafe keywords. googleadservices added to img-src only. No violation data seen. |
| 5 | HSTS without includeSubDomains/preload (Low) | Open | Header still `max-age=31536000`. |
| 6 | DoubleClick third-party cookie (Low) | Not verified | Not re-measured. |
| 7 | Image host cache TTL (Low) | Not verified | Not re-probed this round. |
| 8 | Blog posts at the root (Low/Info) | Open (decision: keep) | 24 root-level posts now, including the new checklist; by design. |
| 9 | Pagination (Info) | Fixed / no action | `/insights/page/2/` and `/3/` 200, self-canonical, not in sitemap. Tag overflow pages 301 to the tag root. |
| 10 | 25 noindex archive URLs linked from indexable pages (Low) | Open | 161 internal links in the crawl point to `/tag/` or `/category/` pages (149 last time; grows with each new post). 30 noindex URLs in the crawl. |
| 11 | 404 canonical points at /404/ which redirects (Info) | Open | `/404/` still redirects to `/404`. Noindexed, no impact. |
| 12 | Missing image dimensions (Low) | Fixed | `img_no_dims` is 0 across 94 pages, including the new photo heroes. |
| 13 | CWV / rendering weight (High, performance) | Not applicable here | Owned by the performance file; not re-measured by me. |
| N1 | Thin noindex tag page 2 archives (Low) | Open | Still crawlable and linked; harmless. |
| N2 | Hand-kept redirect map (Info) | Open (Info) | Merged-post and tag redirects still work as one-hop 301s. |
| N3 | Key file without charset, revalidated (Info) | Fixed | Key file now `text/plain; charset=utf-8` (`public/_headers` line 96-97). Cache stays `max-age=0, must-revalidate`, which is fine. |
| N4 | Minimal enforced CSP (Info) | Open | See finding 4. |

Critic items assigned from the previous audit (reaudit-2026-11-06/findings/critic.md):

| # | Status | Evidence |
|---|---|---|
| C11 HTML charset header | Fixed | Live `text/html; charset=utf-8` on `/`, `/request-a-quote/`, LP, thank-you, search and 404, and on all 94 crawled URLs; non-HTML types unaffected (see above). |
| C12 CSP allowlist lacks hosts the live GTM container uses | Open | The report-only policy in the live header still contains none of `pagead2.googlesyndication.com`, `adservice.google.com` or `cct.google`. Only googleadservices was added (img-src). The policy is still report-only, so nothing is blocked, but enforcing it as it stands would break those hosts if the container still uses them. I did not re-read the container or the violation logs. |
| C13 IndexNow submits only sitemap URLs, not the 301'd old URLs | Open (Info) | `scripts/lib/indexnow.mjs` still selects by sitemap `<lastmod>`; no old-URL handling found. No new redirects were added since, so nothing new is missed. |

## New findings
None Critical, High or Medium. No regressions found, including from the other contributor's changes (janitorial page, checklist post, photo heroes, retitle of commercial-cleaning).

### N5. Internal tag/category links keep growing (Low)
Evidence: 161 internal links to noindex `/tag/*` and `/category/*` URLs (was 149 on 7 Nov) after one new post. Each new post adds more tag chips.
Recommendation: when convenient, drop the tag chips from the post template (the post layout component under `src/`), or accept as is. No ranking impact expected.

### N6. Commercial-cleaning and janitorial-services overlap (Info)
Evidence: two near-adjacent head-term pages (`/services/commercial-cleaning/` 2,663 words, `/services/janitorial-services/` 1,817 words), both indexable, self-canonical, distinct titles. Not a technical defect.
Recommendation: watch Search Console for query overlap in a few weeks; if the pages swap for the same queries, differentiate H1s and internal anchor text.

### N7. robots.txt and sitemaps sent without a charset (Info)
Evidence: `/robots.txt` is `text/plain`, sitemaps and rss are `application/xml`, no charset. Content is ASCII or declares UTF-8 in the XML prolog. Parsers default to UTF-8.
Recommendation: none required. Optionally add `/robots.txt` to the `text/plain; charset=utf-8` rules in `public/_headers`.

## What still needs the client or an account owner
- Decide on the `Content-Signal` lines in robots.txt (keep, accepting the Lighthouse flag, or remove) and confirm `ai-train=yes` is intended.
- Review `/api/csp-report` logs and audit the GTM container (hosts in C12) before moving the report-only policy to enforcement.
- Confirm `img.` and `stage.` subdomains are HTTPS-only before adding includeSubDomains/preload to HSTS.
- Cloudflare dashboard: fold the slash step into the apex/http to www redirect (two-hop case); check the image host cache TTL; decide whether Ads view-through/remarketing cookies are needed.
- Search Console: confirm indexing of `/services/janitorial-services/`, the quote checklist, the retitled commercial-cleaning page and the merged-post redirects.

## Not verified
- Search Console coverage and whether Google has recrawled redirects or new pages.
- `/api/csp-report` volume, and what the live GTM container actually requests (C12 is judged from the header text only).
- Third-party cookie (item 6) and image host cache TTL (item 7): not re-probed.
- Cloudflare WAF/bot rules; IndexNow endpoint behaviour (key file live and valid, no submission made by me).
- Character encoding of page bodies: the crawl HTML is stored as Latin-1, so I judged charset only from headers.
- Core Web Vitals: owned by the performance file.

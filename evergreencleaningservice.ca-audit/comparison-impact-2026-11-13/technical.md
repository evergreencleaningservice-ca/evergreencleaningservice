# Technical SEO and architecture: Evergreen vs Impact (13 Nov 2026)

Area: technical. Read-only. Impact refetches: 12 requests, 1 s apart, public URLs only.

## 1. Scores (technical only, out of 100)

| Site | Score | Basis |
|---|---|---|
| Evergreen | 90 | Clean indexability, honest sitemaps, full security headers, clean redirects. Loses points for CSP only in report-only mode and for 5 crawl connection errors (proxy side, not the site). |
| Impact | 74 | Solid WordPress and AIOSEO basics, 301s and 404s correct, robots open. Loses points for no security headers, a bot wall that blocked 85 of 87 crawled URLs, and a sitemap with bulk-stamped lastmod dates. |

The Impact score is provisional. The bot wall means we could not check canonicals, noindex or schema on about 70 pages (see section 3).

## 2. Lighthouse "SEO 0 / best-practices 0" on impact /ontario/mississauga/office-cleaning: a measurement artefact, not a block

Source: `lab/impact-location-{1,2,3}.json`.

- All 3 runs loaded the real page (HTTP 200, no `runtimeError`, no `runWarnings`).
- Lighthouse's own `categories.seo.score` and `categories.best-practices.score` are `null` in all 3 runs. `lab/medians.txt` shows 0 because the median script read null as 0. The category was never scored.
- Cause: 11 audits ended in `scoreDisplayMode: error`. The `ImageElements` gatherer failed with "Protocol error (DOM.getDocument): Failed to convert response to JSON: CBOR: stack limit exceeded". This is a Chrome DevTools Protocol failure on a deeply nested DOM (2,899 elements). Lighthouse nulls a whole category when a required audit errors.
- The SEO audits that did run all passed:
  - `is-crawlable` = 1, with an empty blocking-directive list, so no noindex.
  - `document-title` = 1, `meta-description` = 1, `robots-txt` = 1 and `http-status-code` = 1.
  - `is-on-https` = 1.
- The page is not blocked and not noindexed, and the run did not fail on an HTTP error.
- Run 1 differs. The document transferred only 1,427 bytes (runs 2 and 3: 94,538 bytes) and the run reported a 404 console error. This is consistent with a small interstitial or bot-challenge response in that run (compare the "Bot Verification" pages in section 3). I did not confirm the body, so treat it as probable.
- Consequence: Impact's location row in `medians.txt` (SEO 0, BP 0) must not be read as a score. Report it as "not scored (tool error)". Performance 98, LCP 1.40 s and A11y 88 from that row are valid from runs 2 and 3. Run 1 is suspect.
- Re-measure fix: run Lighthouse with `--only-categories=seo,best-practices` plus `--skip-audits` for the image-element audits, or retry with a newer Chrome. This is a tooling workaround, not a site fix.

## 3. Crawl status mix

| | Evergreen | Impact |
|---|---|---|
| URLs attempted | 90 | 87 |
| Real pages returned | 85 (HTTP 200) | 2 real pages in the first 19 requests, then blocked |
| Blocked or failed | 5 connection errors (proxy `RemoteDisconnected`: `/locations/brampton/`, `/locations/markham/`, `/insights/` and 2 posts). These are crawler-side, not site-side. | 67 x HTTP 403 plus 18 x HTTP 200 whose title is "Bot Verification" = 85 of 87 |
| noindex found | 28 tag archive pages, `follow, noindex`, none in the sitemap. Correct. | none seen, but unverified (see below) |
| Missing canonical | 0 | not assessable |

- Impact serves an interstitial bot challenge (title "Bot Verification", 8 words) to the polite crawler after about 19 requests. The 403 bodies are a static page (last-modified 8 May 2024, `cache-control: public,max-age=10`).
- The 18 soft-block pages return HTTP 200, so a naive crawl counts them as OK.
- The crawl listing under "real" titles in `pages.json` (about 70 entries, including city hubs) is the only data that matches a real page. I have not verified the 85 blocked pages individually.
- Fair reading: this is the WAF reacting to our crawler (2 concurrent, 1 s delay). It is not evidence that Googlebot is blocked. Search engines are normally allow-listed, but we did not test that. Customers and verified bots probably see the real pages.
- Risk for Impact: if the same rules ever catch a legitimate crawler, 293 URLs are exposed. We cannot tell from outside.

## 4. Indexability and sitemaps

| Check | Evergreen | Impact |
|---|---|---|
| robots.txt | Allow all, named blocks for search and AI crawlers, `Content-Signal` lines, one sitemap index | `Disallow: /wp-admin/` with admin-ajax allowed; two sitemaps declared (`sitemap.xml`, `sitemap.rss`). Open to crawling. |
| Sitemap structure | `sitemap-index.xml` into `sitemap-pages-0.xml` (36 URLs) and `sitemap-insights-0.xml` (posts), split by type | `sitemap.xml` into `post-sitemap.xml` and `page-sitemap.xml` (272 URLs in page-sitemap). Plugin: All in One SEO 5.0.5. |
| Size | 62 indexable URLs. Note: the pages sitemap parsed to 36 and I did not separately count the posts file. | 293 URLs |
| lastmod honesty | Dates come from real content dates (`src/lib/sitemap-lastmod.mjs`, wired in `astro.config.mjs`). pages sitemap: 17 on 13 Nov, 9 on 6 Nov, 8 on 7 Nov, 2 older. Spread of dates; the 13 Nov cluster follows today's URL move. | page-sitemap: 126 of 272 URLs dated 2026-10-27 and 75 dated 2026-10-28 (201 of 272 = 74% on two consecutive days); 37 on 2026-09-24. Looks like bulk programmatic generation or a bulk edit, not per-page edits. Only 218 distinct timestamps. Not proof of dishonesty, but weak as a freshness signal. |
| Sitemap response header | normal | `x-robots-tag: noindex, follow` on `sitemap.xml`. This is the standard AIOSEO behaviour for sitemap files and is harmless. |
| Canonical | present on all 85 fetched pages, self-referencing | homepage canonical is `https://impact.ca` (no slash), consistent with its slashless URL scheme. Others not assessable because of the bot wall. |
| Noindex hygiene | tag archives noindexed, kept out of sitemap | not assessable |

## 5. Redirects, 404s, trailing slashes (probes)

| Probe | Evergreen | Impact |
|---|---|---|
| `http://` home | 301 to `https://www.` (single hop) | 301 to `https://impact.ca/` (single hop) |
| apex vs www | `https://evergreencleaningservice.ca/` 301 to www | n/a (apex is canonical) |
| Wrong trailing slash | `/office-cleaning` 301 to `/office-cleaning/` (one hop) | `/office-cleaning/` 301 to `/office-cleaning`; `/ontario/mississauga/office-cleaning/` 301 to no-slash (one hop) |
| Old URL after move | `/services/office-cleaning/` 301 to `/office-cleaning/`, one hop, no chain. This confirms today's URL move works. | none tested |
| Missing page | HTTP 404, true status | HTTP 404, true status |
| 404 cache | `cache-control: public, max-age=0, must-revalidate`, served by Cloudflare | `public,max-age=3600` (a 404 cached for an hour) |

Both sites use one consistent scheme and 301 the other form. Neither has a chain in the probes. The only odd thing on Evergreen: the home page crawl showed three `/tag/.../page/N/` URLs redirecting to the tag root (acceptable, and noindexed anyway).

## 6. Security headers and caching

| Header | Evergreen (`public/_headers`) | Impact (`/`) |
|---|---|---|
| HSTS | `max-age=31536000` | absent in the HEAD response |
| CSP | `frame-ancestors/base-uri/form-action/object-src` enforced plus a full report-only policy to `/api/csp-report` | absent |
| X-Frame-Options, X-Content-Type-Options | `SAMEORIGIN`, `nosniff` | absent |
| Referrer-Policy, Permissions-Policy | present | absent |
| Cache | HTML `max-age=0, must-revalidate` with `cf-cache-status: HIT`; hashed assets immutable 1 year | HTML `max-age=0, s-maxage=3600, stale-while-revalidate=21600` through LiteSpeed edge (WPX cloud, Toronto) |
| Server | Cloudflare | WPX CLOUD/TOR01, LiteSpeed, `x-powered-by: PHP` |

Caveat: Impact's headers were read from one HEAD request and a Cloudflare-style layer may differ per path. The `x-powered-by: PHP` disclosure is minor.

## 7. Rendering and URL structure

| | Evergreen | Impact |
|---|---|---|
| Rendering | Static Astro, HTML complete at first byte, `trailingSlash: 'always'` | WordPress 7.1, server-rendered PHP behind page cache. Location page is 2,899 DOM elements (the cause of the CDP error) and about 94 KB transfer. |
| Structure | Root services (`/office-cleaning/`), `/locations/<city>/`, posts at root | Root services (about 70), `/ontario/<city>`, `/ontario/<city>/<service>` (155 programmatic pages), `/blog/<slug>` |
| Page weight | 513 to 592 KB mobile | 269 KB on the location page, 861 to 863 KB on home and office (from `lab/medians.txt`) |
| Hierarchy | Flat, shallow | Three-level programmatic hierarchy under region and city; 26 cities. Breadth is a strength; whether each city x service page is distinct was not assessed here (content area). |
| Schema | See content area. Impact home carries an Organization graph, two LocalBusiness offices (Etobicoke, Burlington) and a FAQPage. | |

## 8. What each does better (evidence)

| Area | Better | Evidence |
|---|---|---|
| Security headers | Evergreen | HSTS, enforced CSP baseline, XFO, nosniff, referrer and permissions policies on `/office-cleaning` 301 and 404 responses; none on impact.ca `/`. |
| Sitemap honesty | Evergreen | Real content dates, split by type; Impact has 74% of the page-sitemap on two dates (27 and 28 Oct). |
| Crawl accessibility | Evergreen | 85 of 90 fetched; Impact 2 usable pages in the first 19 requests, then 85 of 87 challenged or 403. |
| Noindex hygiene | Evergreen | 28 tag archives noindexed and absent from the sitemap. |
| Redirect cleanliness | Tie | Both single-hop 301s, true 404s. |
| Rendering and weight on location | Impact (lab) | Location page 269 KB vs Evergreen 515 KB; Impact's URL-structure breadth (26 cities, three levels) is not matched. |
| Cache for 404s | Evergreen slightly | Impact caches 404s 1 hour; harmless but slower to recover if a page is restored. |
| Programmatic reach | Impact (scale), risk flagged | 155 city x service URLs; this is a scale advantage and also a thin-content risk that Evergreen should not copy blindly. |

## 9. Where Evergreen should copy the pattern, not the content

1. Location x service depth, only where it is earned. Impact's `/ontario/<city>/<service>` is a hierarchy worth studying. Evergreen could add `/locations/<city>/<service>/` only for the few city and service pairs where it has real local proof (clients, buildings, crew travel times). Treat Impact's 155 pages as a risk, not a model: mass-stamped lastmod dates (27 and 28 Oct) hint at templated pages, and templated pages risk being treated as doorway content. Keep to the 11 current location pages in `src/pages/locations/` until each can carry unique facts.
2. Separate office LocalBusiness entities. Impact marks up two real offices with address and geo. Evergreen has one office (243 Queen St W), so the pattern applies only as one accurate LocalBusiness.
3. Light pages. Impact's location page is 269 KB against Evergreen's 515 KB. Evergreen's mobile TBT of 480 to 633 ms (versus Impact's 56 to 100) is the real technical gap, and it is JavaScript, not bytes. Audit what loads on first paint (tag manager, `'unsafe-eval'` in the CSP report-only policy suggests script weight) and defer it. Check `src/layouts/` and the tag-manager loader.
4. Edge cache for HTML. Impact sets `s-maxage=3600, stale-while-revalidate=21600`. Evergreen's HTML is `max-age=0, must-revalidate` and Cloudflare reports HIT, so it is fine, but a stale-while-revalidate directive in `public/_headers` would shield users during revalidation.

## 10. Where Evergreen already beats Impact

- Enforced security headers plus a report-only CSP with a reporting endpoint.
- Honest, split sitemaps.
- Fully crawlable by a polite bot (no WAF challenge).
- Self-referencing canonicals everywhere and a clean old-URL redirect after the 13 Nov move (`/services/office-cleaning/` 301 to `/office-cleaning/`).
- AI-crawler policy stated explicitly in `robots.txt` with Content-Signal lines.

## 11. Recommended actions

1. Fix the comparison data: mark impact-location SEO and BP "not scored", not 0, and rerun with image audits skipped (tooling).
2. Mobile TBT: cut main-thread script on first paint (target under 200 ms, from 480 to 633 ms). Owner: Evergreen dev.
3. Move the CSP from report-only to enforced once reports are clean.
4. Add `stale-while-revalidate` for HTML in `public/_headers`.
5. Watch the 5 connection errors: re-fetch `/locations/brampton/`, `/locations/markham/`, `/insights/` and the 2 posts to confirm 200.

## 12. Not verified

- Googlebot access to impact.ca. The bot wall hit our crawler only; I did not test other user agents (not appropriate for this read-only job).
- Canonical, noindex and schema on about 70 of Impact's pages (blocked by the bot challenge). Impact's 155 programmatic pages were not inspected.
- Whether Lighthouse run 1's 1,427-byte document was a challenge page (probable, unconfirmed).
- Evergreen's `sitemap-insights-0.xml`: I did not parse it. The 62-URL total comes from the brief.
- Security headers on Impact pages other than `/`.
- Core Web Vitals field data (CrUX) for both sites, and backlinks (Moz quota exhausted; no link data).
- Whether Impact's `s-maxage`/LiteSpeed cache serves stale 404s after restoring a page.

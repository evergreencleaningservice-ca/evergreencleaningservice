Score: 84/100

Scope: crawl set (92 URLs, raw/crawl/pages.json), robots.txt, sitemaps, Lighthouse home-mobile.json, public/_headers, astro.config.mjs, and about 25 live curl probes on 2026-11-06 (1 s apart). Plugin network scripts were not used (per brief).

## What works
- Crawl set is clean: all 92 URLs return 200, 0 broken internal links (every internal href resolves to a crawled URL). Exactly one H1 on every page, a meta description on every indexable page, lang="en-CA" on all 92 pages, viewport `width=device-width, initial-scale=1` on all 92.
- Indexability matches the sitemap. 60 indexable pages; 57 in the sitemaps. The 3 not in the sitemap are `/insights/page/2/`, `/insights/page/3/` (intentional, filter in astro.config.mjs) and the crawler's http:// seed entry (a duplicate of `/`). No noindex URL is in the sitemap. Every sitemap URL was crawled and is 200 and indexable.
- Canonicals: every indexable page is self-canonical, absolute, https/www, trailing slash. Parameter URLs (`/?p=123&utm_source=x`) canonicalise to `/`. `/insights/page/2/` is self-canonical with a unique title ("Page 2 of 3"). No duplicate titles or descriptions across indexable pages (the only duplicate in the data is the http seed of the home page).
- Redirects (curl): http→https 301; apex→www 301 (https and http); slashless→slashed 301 (`/services/office-cleaning` → `/services/office-cleaning/`); `/index.html` 307→`/`; `//services/` 307→`/services/`; `/feed/` 301→`/rss.xml`; `/sitemap.xml` 301→`/sitemap-index.xml`. `/rss.xml` is valid RSS 2.0 and is advertised via `<link rel="alternate">`.
- 404 handling: unknown URLs return a real 404 (`/nonexistent-page/`, `/wp-login.php`, `/xmlrpc.php`, `/wp-content/uploads/a.jpg`, `/insights/feed/`, `/insights/page/1/`, `/insights/page/99/`, `/INSIGHTS/`) with `<meta name="robots" content="noindex, nofollow">`. No WordPress surface is exposed. `/?p=123` returns 200 (home page), canonicalised to `/`, so no soft 404.
- Compression: Brotli on HTML and /_astro assets (`content-encoding: br`); Lighthouse uses-text-compression and uses-http2 pass. HTTP/2 and h3 advertised.
- Caching: `/_astro/*` is `public, max-age=31536000, immutable`. Fonts and video get 30 days (_headers). Image host returns `max-age=2592000, s-maxage=31536000`. HTML is `max-age=0, must-revalidate` and served from the Cloudflare edge (`cf-cache-status: HIT`), which is correct for HTML.
- Security headers present on every response: HSTS (1 year), nosniff, Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options SAMEORIGIN, Permissions-Policy, CSP Report-Only with `frame-ancestors`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. Staging/workers.dev hosts get X-Robots-Tag noindex by hostname, production is never matched.
- Rendering: static Astro HTML. The raw HTML of `/` (160 KB) already contains the H1, body copy, JSON-LD and the hero `<img>` with width/height, `fetchpriority="high"`, `loading="eager"`, srcset. Only 3 to 5 small `type="module"` scripts per page (Attribution, PhoneTracking, QuickQuoteForm). Nothing depends on JS for content. Content parity for crawlers and AI fetchers is full.
- Structured data is present on all pages: ProfessionalService + WebSite on 92/92, BreadcrumbList 90, BlogPosting 25, FAQPage 20, Service 19, CollectionPage 36. 0 images missing alt.
- Lighthouse (home mobile): is-crawlable, canonical, hreflang, viewport, meta-description, http-status-code, link-text, crawlable-anchors, redirects all pass.

## Findings

### 1. robots.txt Content-Signal lines flagged by Lighthouse (SEO 92 on every page)
Severity: Low (cosmetic tooling noise, no crawl impact)
Evidence: lighthouse/home-mobile.json `robots-txt` score 0, 2 errors: lines 13 and 30 `Content-Signal: search=yes, ai-input=yes, ai-train=yes` → "Unknown directive". Both sit inside groups as the file's own comment intends. Google ignores unknown fields and the allow-all rules around them are valid, so Googlebot parsing is unaffected. The cost is a lost 8 points on the Lighthouse SEO category on every URL, which may also show in client-facing reports.
Recommendation: This is a judgement call. Options: (a) keep them (Content Signals is a Cloudflare-promoted standard, and the signals are the intended statement) and document that the Lighthouse flag is expected; (b) remove them, since they say "yes" to everything, which is already the default of `Allow: /`, so the lines add no behavioural information. If the aim is a clean Lighthouse score and the policy is allow-all, option (b) loses nothing. Edit `public/robots.txt`. Note: `ai-train=yes` is a policy decision for the owner, not a technical issue. Also check whether Cloudflare's "managed robots.txt" feature is prepending its own block (the live file matches the repo copy, so it is not at present).

### 2. Two-hop redirect for non-www/http URLs without trailing slash
Severity: Low
Evidence: `http://evergreencleaningservice.ca/about-us` → 301 `https://www.evergreencleaningservice.ca/about-us` → 301 `/about-us/` → 200. The scheme/host redirect keeps the path as typed, then Astro's slash redirect adds a second hop. Slashed legacy URLs take one hop. Old WordPress links were mostly slashed, so impact is small.
Recommendation: In the Cloudflare redirect rule (apex/http → www), append the slash for non-file paths in the same rule, or accept it. Low value.

### 3. Internal link to `http://` on /privacy/
Severity: Low
Evidence: crawl, `https://www.evergreencleaningservice.ca/privacy/` links to `http://www.evergreencleaningservice.ca` (anchor text "www.evergreencleaningservice.ca"). It resolves via a 301, so it is a wasted hop, a canonical-signal inconsistency, and the only http:// internal link in the crawl.
Recommendation: Change the href to `https://www.evergreencleaningservice.ca/` in the privacy page source (find with `grep -rn "http://www.evergreen" src/`).

### 4. CSP is Report-Only with 'unsafe-inline' and 'unsafe-eval'
Severity: Medium (security hardening, not an SEO ranking factor)
Evidence: live header `content-security-policy-report-only` with `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`; Lighthouse `csp-xss`: "No CSP found in enforcement mode" (High). The _headers comments say the plan is to enforce after two clean weeks and audit GTM tags (H2). Even when enforced, 'unsafe-inline' and 'unsafe-eval' provide almost no XSS protection for scripts.
Recommendation: The site is static so nonces are unavailable, but Astro 5+/7 supports CSP hashing (`security.csp` in astro.config.mjs) for its own inline scripts. Plan: (1) check `/api/csp-report` logs, (2) enforce with the current policy to at least get `frame-ancestors`/`object-src`/`base-uri`/`form-action` protections (these work regardless of unsafe-inline), (3) later drop 'unsafe-eval' once GTM tags are reviewed. I could not verify violation logs.

### 5. HSTS has no includeSubDomains or preload
Severity: Low
Evidence: `strict-transport-security: max-age=31536000` on all responses. Deliberate per _headers comment (subdomains `img.`, `stage.` unconfirmed).
Recommendation: Reasoning is sound. When `img.` and `stage.` are confirmed HTTPS-only (img host already serves https), add `includeSubDomains`, then `preload` and submit to hstspreload.org. No SEO benefit; keep as backlog.

### 6. Third-party cookie from DoubleClick (Lighthouse best-practices 79)
Severity: Low
Evidence: lighthouse `third-party-cookies` score 0: `test_cookie` set by `googleads.g.doubleclick.net/pagead/viewthroughconversion/...` (fired by gtag.config via GTM). `inspector-issues` also fails on the same cookie. `errors-in-console` passes.
Recommendation: Comes from the Google Ads conversion/remarketing tag, which the business needs. Options: gate the Ads remarketing tag behind consent mode, or disable "view-through" / remarketing in the Ads tag if unused. Otherwise accept the 79. Chrome is phasing out third-party cookies for this use, so impact on users is minor.

### 7. Image host cache: browser TTL 30 days, first hit was a MISS
Severity: Low
Evidence: `img.evergreencleaningservice.ca/images/...hero-og.jpg`: `cache-control: public, max-age=2592000, s-maxage=31536000`, `cf-cache-status: MISS` on first request (single probe, not conclusive). Lighthouse `uses-long-cache-ttl` 0.5 lists mostly third-party items (gstatic 1 h, Cloudflare Insights beacon 24 h) which cannot be fixed, plus fonts at 30 days.
Recommendation: If image filenames carry a size suffix but not a content hash, 30 days is a reasonable trade. If images are replaced under new names, raise to `max-age=31536000, immutable` in the img host's Transform/Cache Rule. Minor. Cloudflare Insights beacon (beacon.min.js) is a third-party request that could be dropped if Cloudflare Web Analytics is redundant with GA4.

### 8. Blog posts live at the root, not under /insights/
Severity: Low (Info if posts are intentionally preserved from WordPress)
Evidence: sitemap-insights-0.xml lists 24 posts at root level, e.g. `/how-often-should-an-office-be-cleaned/`, and the hub at `/insights/`. All posts keep their legacy WordPress URLs (good for preserving equity). Drawbacks: no URL-level grouping for Search Console / analytics, and the root namespace is shared with service/info pages (`/privacy/`, `/contact-us/`), which risks slug collisions and makes sitemap type-splitting depend on a custom `isInsightsUrl` function (src/lib/sitemap-lastmod.mjs).
Recommendation: Do not migrate. Moving would require ~25 redirects with likely small gain and some risk. Keep as is and record the decision. If ever done, 301 each old URL to `/insights/<slug>/` in one hop and update sitemap, canonicals, schema `url`s and internal links together.

### 9. Pagination /insights/page/N/
Severity: Info
Evidence: `/insights/page/2/` and `/3/` are 200, self-canonical, unique title "Commercial Cleaning Insights - Page 2 of 3", linked from `/insights/`, not in the sitemap. `/insights/page/1/` and `/page/99/` are real 404s. No rel=prev/next present (Google ignores these anyway). Page 3 is thin (263 words listing snippets).
Recommendation: Fine as designed. Leaving them out of the sitemap is acceptable because they are crawlable via links. Optionally set them to `noindex, follow` to be consistent with the tag archives, but Google also handles indexable paginated pages well; no action needed. Note that tag pages (`/tag/office/page/2/`) 301 to `/tag/office/`, which suggests an empty page 2 exists in link data: verify no internal link points at it (crawl shows it reached via a redirect chain).

### 10. 25 noindex archive URLs are linked from indexable pages
Severity: Low
Evidence: indexable pages link to `/category/blog/` (31 pages) and 7 `/tag/*/` archives (up to 17 pages each). They are "follow, noindex", so they pass through links but are not indexed. Spends internal-link equity and crawl on pages designed not to rank.
Recommendation: In the post template (src/pages or src/components for the post tag chips), consider removing the tag and "category/blog" links from indexable post pages or adding them only as non-link text. Minor. Keep the archives noindex.

### 11. 404 page canonical points at /404/, which itself 307s
Severity: Info
Evidence: 404 response contains `<link rel="canonical" href=".../404/">` plus noindex. `/404/` returns 307. Noindexed 404s are ignored by Google, so no impact.
Recommendation: Drop the canonical from the 404 layout if it is trivial. Optional.

### 12. Missing image dimensions on 13 images
Severity: Low
Evidence: crawl field `img_no_dims` totals 13 across pages (CLS was 0 in Lighthouse, so no measured impact).
Recommendation: Add width/height to those `<img>` tags (list per page from pages.json `images`). Low priority.

### 13. Core Web Vitals / rendering weight (from brief, lab data only)
Severity: High for performance, outside strict "crawl/index" scope
Evidence: home mobile Lighthouse: 51, LCP 6.8 s, TBT 1320 ms, CLS 0 (brief). Home HTML is 160 KB uncompressed with 52 KB inline script/CSS. The hero is a correctly marked LCP image (eager + fetchpriority=high), yet it is the preload of only the Open Sans font, not the hero, and srcset/`sizes="100vw"` was recorded in lab with 3.6 s load time, which indicates image-host bandwidth under throttling plus GTM/gtag contention (1350 ms main thread). These are lab numbers from a sandbox, not CrUX; I did not obtain field data.
Recommendation: (a) delay GTM/gtag until first interaction or `requestIdleCallback` / `load` + 2 s; the site has only 3 small first-party scripts, so third-party tags are the entire TBT problem. (b) Serve the hero as AVIF/WebP at the 768 and 1000 widths (check the `<picture>` sources); add `<link rel="preload" as="image" imagesrcset=... imagesizes=...>` for the hero in the home layout head. (c) Check the 52 KB inline payload on `/` for avoidable inline data. Re-measure with PSI/CrUX once quota is available.

## Not verified
- Field Core Web Vitals (no CrUX/PSI data). Lighthouse is lab only.
- `/api/csp-report` volume or violations; whether the Cloudflare account has Bot Fight/WAF rules affecting crawlers.
- Search Console indexing state, so "indexable" here means by tags and sitemap, not confirmed indexed.
- hreflang: none present, which is correct for a single en-CA site (nothing to validate).
- IndexNow: not tested (no key file probed). Low value for a Google-focused local site; optional for Bing.
- security.txt, ai.txt, humans.txt are 404 per brief (security.txt is a nice-to-have).

## Quick wins
1. Fix the `http://www.evergreencleaningservice.ca` link on /privacy/ to https.
2. Decide on the Content-Signal lines (remove to restore Lighthouse SEO 100, or document as intentional).
3. Enforce the CSP now for the non-script directives (frame-ancestors, object-src, base-uri, form-action), keeping script-src relaxed until GTM is audited.
4. Defer GTM/gtag load to cut ~1.3 s TBT on mobile (largest measured technical win).
5. Add a preload for the hero image on the home layout and add dimensions to the 13 images lacking them.

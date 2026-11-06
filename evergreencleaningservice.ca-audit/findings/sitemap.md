Score: 90/100

# Sitemap audit: www.evergreencleaningservice.ca (2026-11-06)

Scope: raw/sitemap-index.xml, sitemap-pages-0.xml, sitemap-insights-0.xml, sitemap-urls.txt, robots.txt, crawl/pages.json, astro.config.mjs, src/lib/sitemap-lastmod.mjs, src/data/{locations,coverage,location-local}.ts. I did not run sitemap_discovery.py (it refuses this sandbox, per the brief). I made 4 live requests, to /sitemap.xml, /sitemap_index.xml, /sitemap-index.xml and /sitemap-0.xml, headers only. Per-URL status comes from the earlier crawl in pages.json, not a fresh fetch.

## What works
- XML is well-formed and parses. The index has 2 child sitemaps. The two urlsets hold 31 URLs (pages) and 26 URLs (insights), 57 in total, which matches sitemap-urls.txt. The limits are nowhere near 50,000 URLs or 50 MB (files are about 4 KB).
- All 57 sitemap URLs are in pages.json. Every one returned 200, has no noindex in meta_robots, and has a canonical equal to its own URL. There are no redirects, no non-slashed forms and no duplicates.
- The sitemap and the crawl agree. 60 pages are 200 and indexable. 57 are in the sitemap. The 3 that are not:
  - /insights/page/2/ and /insights/page/3/, left out by design.
  - A `http://www...` crawl-seed row, which is a crawl artifact because the real URL 301s to https.
- No noindex URL is in the sitemap. The filter in astro.config.mjs excludes /category/blog, /lp/, /thank-you/, /tag/, /admin/, /eg-live-post-shell/, /search/ and /insights/page/N/. In pages.json the tag and category archives are noindex and none appear in the sitemap.
- The sitemap has no `changefreq` or `priority` tags. That is correct, since Google ignores both.
- lastmod is a valid W3C datetime (`...T..:..:...000Z`) on every entry. The sitemap is split by type (posts and the hub vs. everything else), so Search Console reports indexing for each separately.
- robots.txt ends with one absolute `Sitemap: https://www.evergreencleaningservice.ca/sitemap-index.xml`. The `www` host and https match the canonical host, and `Allow: /` applies to every group.
- Live redirect checks all behave correctly:
  - /sitemap.xml gives 301 to /sitemap-index.xml.
  - /sitemap_index.xml (the legacy WordPress name) gives 301 to /sitemap-index.xml.
  - /sitemap-0.xml gives 301 to /sitemap-pages-0.xml.
  - /sitemap-index.xml returns 200 with `application/xml`.
- The raw/sitemap.xml file is 0 bytes only because it is the body of that 301.

## Findings

### 1. lastmod is not the build time, but 17 URLs share one shared-template timestamp. Severity: Low
- Evidence:
  - The pages-0 dates are 2026-10-29 (2 URLs), 10-30 (7), 10-31 (21) and 11-04 (1). They are not all one build stamp.
  - They come from the last git commit touching the page's source files (SOURCES in src/lib/sitemap-lastmod.mjs).
  - 16 URLs show exactly `2026-10-31T14:11:02Z`: the services/*, industries/* and locations/* detail pages. That timestamp is commit 67a81ab, "Shrink the quote forms (#67)". It touched the shared src/components/OfferPage.astro and src/pages/locations/[slug].astro, and its message says nothing about the pages' content. The 16 detail pages are 9 services, 2 industries, 7 locations minus none overlapping, so the group is about 16 to 17 URLs.
  - /cleaning-demo-gallery/ (2026-11-04T14:38:17Z) matches the commit "Remove the stock-photo note from the gallery page", which is a real content edit (small).
  - The homepage date (10-31T21:04:11Z) matches "Rotate three office photos in the homepage hero (#72)", also a real visible change.
- Assessment: the dates are honest in the sense that the files did change. They are overstated for template-only edits, because a form-layout change re-dates every offer and location page. The effect is mild (a few days, one cluster), but the clustering is the kind of pattern Google learns to discount.
- Recommendation: in src/lib/sitemap-lastmod.mjs, stop counting shared templates (src/components/OfferPage.astro, src/pages/[slug].astro, src/pages/locations/[slug].astro) for the date. Keep the page's own content file. For locations, also drop src/data/locations.ts or, better, use a per-location `updated` field, because one edit to any city bumps all seven. Unrelated edits would then no longer move every URL. Do not backdate anything.

### 2. Insights lastmod depends on frontmatter dates I could not verify. Severity: Info
- Evidence:
  - Posts take `updatedDate`, or `pubDate` if there is none. 7 posts carry 2026-10-30 and 1 carries 2026-11-03 (/how-often-should-an-office-be-cleaned/). The other 17 posts range from 2020 to 2023.
  - /insights/ takes the newest post date (2026-11-03). The sitemap index lists insights as 2026-11-03T00:00:00Z.
- Assessment: the Oct 30 cluster fits the Oct 2026 SEO refresh (these are presumably real rewrites). I did not diff the post bodies, so I cannot confirm that each `updatedDate` reflects a significant change.
- Recommendation: keep `updatedDate` only for substantive edits and leave older posts alone.

### 3. Shallow-clone dependence of lastmod. Severity: Info
- Evidence: the local repo is shallow (`git rev-parse --is-shallow-repository` returns true, 103 commits starting 2026-10-17). The code is built to omit lastmod when a file's last commit is at the shallow boundary. The live sitemap has lastmod on all 57 URLs, so the production build had full enough history.
- Recommendation: a CI step should fail the build if any sitemap `<url>` lacks `<lastmod>`, so a shallow checkout cannot silently drop dates. Also confirm the deploy uses `fetch-depth: 0`.

### 4. /insights/page/2/ and /page/3/ are absent from the sitemap. This is correct. Severity: Info
- Evidence: both are 200, indexable (no robots meta) and self-canonical. astro.config.mjs excludes `insights/page/\d+/`. Both stay crawlable through links from /insights/.
- Assessment: this is the standard approach. Paginated archives are not landing pages, and every post is listed directly in sitemap-insights-0.xml (25 posts, matching the 25 .md files in src/content/blog). Listing the pages would add no discovery value.
- Optional: indexable but unsitemapped pagination is harmless. Do not switch them to `noindex`, because long-run noindex pages eventually lose their link-following, and these pages are what link to the older posts. If duplicate-snippet reports ever appear in Search Console, revisit this.

### 5. Live posts added by the Worker are not testable from here. Severity: Info (could not verify)
- Evidence: src/lib/admin/live-posts.ts adds admin-published posts to /sitemap-insights-0.xml (LIST_PATHS), /insights/ and /rss.xml. The current live file contains exactly the 25 repo posts plus the hub, so there are no live posts today.
- Not verified: the lastmod format the Worker emits for a live post, and whether a live post is checked for noindex or canonical consistency before it is listed.
- Recommendation: after the first admin-published post, fetch the sitemap and confirm the entry uses the same `...T00:00:00.000Z` format, a trailing-slash URL on the www host, and a lastmod no later than "now".

### 6. Unused XML namespaces. Severity: Info
- Evidence: the urlsets declare `news`, `xhtml`, `image` and `video` namespaces but use none of them. This is the default output of @astrojs/sitemap and is valid.
- Recommendation: none.

### 7. Image and video sitemaps. Low priority, not recommended now. Severity: Low
- Evidence: pages.json records 397 image references across the crawl. The 233 images on img.evergreencleaningservice.ca are discovered from ordinary `<img>` and `<picture>` tags, and Google finds those without help. Many pages also carry alt text and dimensions.
- Video: the only `<video>` elements found are in the homepage HTML (`/video/lead-net.mp4` and `/video/lead-net-orb.mp4`, `preload="none"`, with a poster on the image host). They look like decorative or product-animation clips, not content that stands as the page's main subject. Google's video indexing needs the video to be a primary part of the page. I would not add a video sitemap for these.
- Recommendation: skip both. Revisit an image sitemap only if the image host becomes a real organic channel (for example, project photos you want in Google Images). If you do, add `<image:image>` entries inside the existing urlset via the `serialize` hook in astro.config.mjs. Google accepts image URLs on another host, but the host must be verified in Search Console.

### 8. robots.txt Sitemap directive. Severity: Info
- Evidence: correct, as above. The two `Content-Signal:` lines are what Lighthouse flags as "Unknown directive" (SEO 92 on every page). This is not a sitemap problem. It is the cosmetic cost of the deliberate Content Signals policy, and it is out of this report's scope.

### 9. Location pages, quality gates. Severity: Info (passes)
- Count: 7 location pages plus the /locations/ hub = 8. This is under the 30-page warning and the 50-page hard stop, so neither gate applies.
- Content (my measure, for the 7 pages): rendered `<main>` word counts of 719 to 1,059 words. The share of 6-word phrases unique to each page versus the other six is:

| Page | Unique share |
|---|---|
| Mississauga | 80% |
| Vaughan | 74% |
| Downtown Toronto | 72% |
| Etobicoke | 67% |
| Brampton | 66% |
| Markham | 65% |
| Oakville | 64% |

  All pass the 60% bar, but Oakville, Markham and Brampton are close to it. Shared boilerplate (service list, FAQ frame) makes up the rest.
- Local signals present: each page has per-city copy, Service, WebPage, BreadcrumbList and FAQPage JSON-LD, an embedded iframe and 2 images. Mississauga names real neighbourhoods and areas (Lisgar, Erin Mills, East Credit, Streetsville, City Centre) in src/data/location-local.ts. I read Mississauga closely and sampled the others, so "real local detail on every page" is not fully confirmed.
- Honesty: src/data/coverage.ts states that the business has one address (243 Queen St W) and that no page may imply a branch elsewhere. That fits the doorway-page guidance.
- Coverage gap: of the 15 listed areas, 8 link to a page. North York, Scarborough, East York, York, Richmond Hill, Pickering, Ajax and Oshawa have no page. Of those, 6 are the cities you named: Richmond Hill, Pickering, Ajax, Oshawa, Scarborough and North York.
- Recommendation on the missing cities (no search-volume data was available to me, so this is judgment, not measurement):
  - Do not create all six now. Six pages built from the same template would push several pages below 60% unique content and invite the thin-location-page pattern, for areas where you have no evidence of demand or clients.
  - North York and Scarborough are the two worth building first. They are large Toronto office markets, and they are in Toronto proper, so the "serving from Toronto" claim stays true. Build each only with unique material: named office districts, real building types, an actual client or project reference (with permission), local FAQ items. Aim for 70% or more unique content.
  - Richmond Hill is a possible third, and it would pair naturally with Markham and Vaughan. Build it only if there is real work there.
  - For Pickering, Ajax and Oshawa, one honest "Durham Region" page beats three city pages, and only if the client confirms the crew really travels there. coverage.ts says that claim rests on a Google Ads copy document and has not been independently confirmed.
  - Until then, the current approach is fine: those cities are covered in the areas-served list, the hub and the quote form, without a doorway page.
  - Keep each new page out of the sitemap until it has its unique content, then it is picked up automatically. The sitemap filter needs no change.

## Missing and extra pages
- In crawl but not in sitemap: only /insights/page/2/ and /insights/page/3/ (intentional) and the http:// crawl-seed row (artifact).
- In sitemap but 404 or redirected: none.

## Quick wins
1. Exclude shared templates (OfferPage.astro, locations/[slug].astro) from the lastmod sources in src/lib/sitemap-lastmod.mjs, so a layout edit stops re-dating 16 to 17 URLs.
2. Add a CI check that every sitemap `<url>` has a `<lastmod>`, and confirm the deploy checks out full git history.
3. After the first admin-published post, spot-check the Worker's sitemap entry (format, trailing slash, lastmod).
4. Leave /insights/page/N/ out of the sitemap and indexable. No change needed.
5. If you expand locations, start with North York and Scarborough only, each with unique local content, before anything else.

## Not verified
- Fresh live status for every one of the 57 URLs (relied on pages.json).
- Full-text uniqueness of location pages beyond the 6-gram overlap measure, and local-detail quality on the six location pages other than Mississauga.
- Whether each 2026-10-30 `updatedDate` matches a substantive post edit.
- Worker-generated live-post sitemap entries (none exist yet).
- Search Console submission or coverage status (no access).

Score: 86/100

# On-Page SEO — www.evergreencleaningservice.ca (2026-11-06)

Source: crawl of 92 URLs (60 indexable HTML pages, 59 on https + the http variant), raw/crawl/pages.json and raw/crawl/summary-2.txt.

## What works
- Every indexable page has exactly one H1, a unique title, a unique meta description, `lang="en-CA"`, a viewport tag and a self-referencing canonical (http variant canonicalises to https).
- No heading-level skips on any indexable page; blog posts start at H2 under the H1.
- Zero generic anchors ("read more", "click here"), zero empty anchors, zero nofollow internal links. Breadcrumb navigation on 58/60 pages; skip link on all 60.
- Money-page titles carry the geo + service intent cleanly, e.g. "Office Cleaning Services in Toronto and the GTA | Evergreen", "Office & Commercial Cleaning in Mississauga | Evergreen".
- Internal linking is healthy: no orphans; the least-linked post still has 4 inlinks; services ↔ locations ↔ industries ↔ posts all cross-link; service pages link to the quote page.
- Word counts: 55 of 60 indexable pages exceed 300 words; service and location pages run 700–2,500 words with FAQ blocks.

## Findings

### 1. Title tags over 60 characters on six pages — Low
Evidence: homepage (61), `/services/commercial-cleaning/` (64), `/locations/vaughan/` (61), two blog posts (61), http variant (61). Google truncates by pixel width, roughly 580 px; "| Evergreen" is what gets cut, so the loss is cosmetic.
Recommendation: trim only where the brand is lost on mobile; e.g. "Commercial Cleaning & Janitorial Services Toronto | Evergreen" → "Commercial Cleaning & Janitorial in Toronto | Evergreen". Titles live in the page frontmatter / `src/data/services.ts`.

### 2. Meta descriptions over 160 characters on eight pages — Low
Evidence: `/services/pressure-washing/` (166), `/reviews/` (168), `/seasonal-office-cleaning-checklist/` (169), `/cleaning-protocols-for-daycares-and-schools/` (167), `/how-to-decide-on-a-cleaning-company/` (165), `/robotic-vs-manual-cleaning-which-will-ultimately-succeed/` (170), `/importance-of-hand-washing/` (162), `/commercial-cleaning-air-quality/` (161).
Recommendation: cut each to ≤155 characters, keeping the call to action ("reply within 2 hours") at the front rather than the end so it survives truncation.

### 3. Inconsistent title suffix across templates — Low
Evidence: 22 pages end "| Evergreen", 11 end "- Evergreen Office Cleaning", 22 legacy blog posts carry no brand at all (e.g. "How to Properly Dust an Office Building"), one is "Service Areas Across the GTA - Evergreen Office Cleaning".
Recommendation: one pattern site-wide, "Page title | Evergreen Office Cleaning" (or the shorter "| Evergreen" where length forces it). Bare post titles should gain the suffix: it is the only brand signal in a blog SERP. Set this once in the layout (`src/layouts/`) rather than per page.

### 4. Thin pages — Medium
Evidence: `/cleaning-demo-gallery/` 71 words (13 photos, no captions, no context), `/contact-us/` 122, `/request-a-quote/` 158, `/locations/` hub 229, `/insights/page/3/` 263.
Recommendation: the contact and quote pages are conversion pages and can stay short, but the gallery should become a portfolio page: one caption per photo naming the facility type, the service performed and the city (no client names needed). The `/locations/` hub should carry a short paragraph per city (what crews do there, travel radius) so it is a real hub rather than a list.

### 5. Blog titles lack any geo or brand cue — Low
Evidence: 25 posts; none mention Toronto/GTA in the title (correct for informational intent) and 22 have no brand suffix (see #3).
Recommendation: keep titles informational, add the brand suffix, and where the post is a buying guide (`/office-cleaning-cost-toronto-guide/`, `/how-to-decide-on-a-cleaning-company/`) keep "Toronto" in the title and H1.

### 6. HTTP Content-Type header has no charset — Low
Evidence: every HTML response is `content-type: text/html` with no `; charset=utf-8`. The page has `<meta charset="utf-8">`, so browsers and Googlebot render correctly, but naive fetchers (including this audit's crawler) decode em dashes as mojibake ("Day Or Night â Which…"). Some AI crawlers and scrapers will see the same.
Recommendation: add `Content-Type: text/html; charset=utf-8` for `/*` in `public/_headers` (or set it in the Worker for HTML responses).

### 7. One plain-http internal link — Low
Evidence: `/privacy/` links to `http://www.evergreencleaningservice.ca` (anchor "www.evergreencleaningservice.ca"), the only http internal link on the site. It 301s, so no user impact, but it adds a redirect hop for crawlers.
Recommendation: change the href to `https://www.evergreencleaningservice.ca/` in `src/pages/privacy.astro`.

### 8. Links to 25 noindex archives from every post — Info
Evidence: tag and category pages (`/tag/*`, `/category/blog/`) are `follow, noindex` and linked from each post's topic links. Crawl budget is not a concern at 92 URLs; Google will keep crawling them to honour "follow".
Recommendation: no change needed. If the tag pages ever gain unique intros, flip them to index; otherwise leave as is.

## Quick wins
1. Add the brand suffix to the 22 bare blog titles in the layout.
2. Trim the eight long meta descriptions.
3. Fix the http href on `/privacy/`.
4. Add `charset=utf-8` to the HTML Content-Type header.
5. Caption the 13 gallery photos.

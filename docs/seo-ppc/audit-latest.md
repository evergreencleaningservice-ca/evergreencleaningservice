# SEO / PPC audit: evergreencleaningservice.ca

Date: 2026-10-16. Auditor: automated technical SEO / PPC / CRO pass (Claude Code), for owner review.

## Hosts and method
- Live production: https://www.evergreencleaningservice.ca (apex 301s to www).
- Staging: https://stage.evergreencleaningservice.ca (same Worker and same build as production; noindex is applied by hostname in `public/_headers`).
- Read-only GET/HEAD only, User-Agent `seo-audit/2.0 (owner audit)`, 5 concurrent requests, redirects not followed (Location recorded). No forms submitted. Chromium and Lighthouse runs had GTM, analytics, reCAPTCHA and all non-owner hosts blocked.
- Crawl seeded from `sitemap-index.xml` (73 URLs) plus links discovered; 111 pages per host (cap 150 not reached). All internal links and same-host assets were HEAD-checked.
- Rendered in Chromium at 390px and 1440px: `/`, `/services/office-cleaning/`, `/services/commercial-cleaning/`, `/locations/mississauga/`, `/contact-us/`, `/request-a-quote/`, `/lp/commercial-cleaning/`, `/insights/`, on both hosts.
- Lighthouse 13, mobile emulation, lab data only (not field data, not a ranking signal): home and `/services/office-cleaning/` on both hosts.
- No prior audit existed in `docs/seo-ppc/`.

## Result summary (before fixes)
| Check | Live (111) | Staging (111) |
|---|---|---|
| Non-200 pages / broken internal links / broken same-host assets | 0 / 0 / 0 | 0 / 0 / 0 |
| Redirect chains | 0 | 0 |
| Missing or duplicate titles / descriptions | 0 / 0 | 0 / 0 |
| H1 count not exactly 1 | 0 | 0 |
| Canonical not self-referencing production `www` URL | 0 | 0 |
| Invalid JSON-LD blocks | 0 | 0 |
| `http://` links (mixed content) | 0 | 0 |
| Orphan pages | 0 | 0 |
| Stray noindex on live (excluding intended tag/category archives) | 0 | n/a |
| Staging serves `X-Robots-Tag: noindex, nofollow, noarchive` | n/a | 111 of 111 |
| Pages with `<img>` lacking width/height | 46 pages (130 images) | same |
| Titles over 60 characters (decoded) | 8 | same |
| Descriptions over 160 characters | 4 | same |
| Pages with no BreadcrumbList (excluding home) | 18 | same |

Live and staging were byte-equivalent on every checked field (title, description, H1, canonical, word count, image count). `robots.txt` is allow-all with an absolute Sitemap line on both hosts (intentional, see `public/_headers`). 38 tag/archive pages carry `follow, noindex` by design and are excluded from the sitemap.

Lighthouse (lab, mobile): live home performance 94 / accessibility 100 / best practices 100 / SEO 100 (LCP 3.1 s, CLS 0.016); live office-cleaning page 91 / 100 / 100 / 100 (LCP 2.5 s, CLS 0.134); staging home 92 / 100 / 100 / 69; staging office-cleaning 99 / 100 / 100 / 69. The 69 SEO score on staging is the expected noindex header, not a defect.

Browser checks: no horizontal overflow at 390px or 1440px, no broken images, one H1, `tel:` links and a quote form present and in the first viewport on all eight sampled pages, on both hosts.

## Failing items and fixes

### Fixed in this PR
1. **Images without width/height on 46 pages (130 images), CLS risk.** Root cause: a stray backspace control character inside the regex in `src/lib/normalize-body.ts` meant the dimension-stamping step never matched, so the documented behaviour (stamp intrinsic size on local JPEG/PNG body images) silently did nothing. Removed the character, extracted the step as `stampImageSizes()` and also applied it in `src/layouts/PageLayout.astro` (about, green-clean-products, etc.) and `src/pages/cleaning-demo-gallery.astro`, which had their own copies without it. Built `dist/`: 512 images, 0 without dimensions. Lab CLS on `/services/office-cleaning/` was 0.134 before; re-measure after deploy.
2. **BreadcrumbList missing** on `/services/`, `/locations/` and the 7 `/locations/<city>/` pages, although a visible breadcrumb trail is rendered. Added JSON-LD matching the visible trail.
3. **Titles over 60 characters:** `/locations/mississauga/` (72 to 58), `/locations/vaughan/` (69 to 52, keeps "Vaughan & Concord"), `/services/commercial-cleaning/` (61 to 52).
4. **Descriptions over 160 characters:** `/commercial-cleaning-techniques-to-avoid/` (179 to 147), `/reviews/` (164), `/services/pressure-washing/` (164), tag archive template (161 on the longest tag). All now 160 or under (verified on built `dist/`).

### Not fixed (owner decision or out of scope)
- Two blog titles are 61 characters (`/5-cleaning-products-you-should-have-in-your-office/`, `/6-common-cleaning-products-that-you-should-never-mix-together/`). These are the post headlines, the brand suffix is already dropped by `src/lib/title.ts`; shortening would change published headlines.
- `/search/` description is 50 characters (valid, above the 30 minimum, but short). Page is utility-only; left alone.
- `/lp/*` pages (noindex, unlinked, out of sitemap, by design) have titles of 63 to 70 characters; irrelevant for search, left alone.
- Live origin currently serves the pre-fix build; fixes only reach live after the PR is merged and deployed.
- 38 `follow, noindex` archive pages (tags, `/category/blog/`) are intentional per `astro.config.mjs`.
- `npm run build` (production script) refuses to run without `PUBLIC_RECAPTCHA_SITE_KEY` (by design, preflight). Verification used `npm run build:preview`.
- `astro check` is not available: `@astrojs/check` is not a dependency. No dependency was added.

## Page-level notes
- Thin-content flag (under 400 words, rendered text): `/cleaning-demo-gallery/` (303, image gallery), `/contact-us/` (366), `/request-a-quote/` (393), `/reviews/` (382), `/search/` (312), and tag archives (about 340, noindex). These are functional pages; no change suggested.
- External links per page repeat the same four brand/social hosts (g.page, facebook, twitter.com, linkedin). `twitter.com` links are the old domain (now x.com; still redirects). External HEAD checks were not run beyond what is noted in Limitations.

## PPC / CRO review (recommendations only; ads not touched)
Reviewed `/`, `/services/office-cleaning/`, `/services/commercial-cleaning/`, `/lp/commercial-cleaning/` (and the other three `/lp/` pages by structure).
- Strengths: single H1 matching service intent on every sampled page; click-to-call and a quote form in the first viewport at 390px and 1440px; `/lp/*` pages are noindex and out of the sitemap so paid and organic intent do not compete; GTM, phone-click and attribution components exist in the repo (not fired during this audit).
- Headline vs intent: `/lp/commercial-cleaning/` H1 ("Commercial cleaning in Toronto you can count on, every night.") matches the commercial-cleaning intent; consider keeping the ad group's headline-1 phrase identical to the H1 so Quality Score "landing page experience / ad relevance" stay high.
- Ad-copy suggestions (draft, test before using): headlines built from real facts already on the site (free on-site walkthrough, after-hours service, WSIB insured and bonded, Toronto and GTA coverage). Do not add review counts or ratings in ads unless they match the live Google profile at the time.
- Keyword ideas (themes only, no volumes): "office cleaning Toronto", "commercial cleaning Toronto", "janitorial services Toronto", "post construction cleaning Toronto", "medical clinic cleaning Toronto", plus city modifiers for pages that exist (Mississauga, Vaughan, Markham, Brampton, Oakville, Etobicoke). Suggested negatives: residential, home, maid, carpet (unless offered), jobs, careers, DIY, supplies.
- Keyword Planner and Search Console data: unavailable to this audit, not accessed.
- Page speed: lab LCP of 2.5 to 3.1 s on mobile for the live pages; improvement beyond image dimensions would require changes to hero image delivery, flagged but not attempted (no redesign).

## Verification
- `npm ci`: ok. `npm run build:preview`: passes (171 redirect rules, 1668 image references repointed). `npx vitest run`: 31 files, 737 tests pass.
- Built `dist/` re-checked: 116 HTML pages, all JSON-LD blocks parse, every page has exactly one H1, no title over 60 and no description over 160 outside the intentional exceptions listed above, all 512 `<img>` tags have width and height.

## Unchecked / limitations
- Field (CrUX) data, Search Console, Google Business Profile, ranking and backlink data not accessed.
- External links were not individually HEAD-checked (only external host names recorded).
- Lighthouse numbers are single-run lab results and vary run to run.
- Crawl covered the 111 pages reachable from the sitemap and links; unlinked `/lp/*` pages were only sampled in the browser.

# Week 1 office cleaning cost guide

## Editorial review

The requested route is `/office-cleaning-cost-toronto-guide/` and the article source is `src/content/blog/office-cleaning-cost-toronto-guide.md`.

The original ChatGPT conversation's full prose and FAQ answers could not be retrieved: its assistant messages were content references, and the browser reported that those responses could not load. This draft reconstructs the complete prose and seven FAQ answers from the user's detailed implementation brief. The title, SEO metadata, selected photos, section order, questions, CTA and budgeting figures follow that brief. **Review the reconstructed prose before production publication.** The draft is not represented as the recovered original article.

The examples are explicitly hypothetical CAD calculations before HST. To reproduce the exact supplied ranges, average monthly visits are rounded to two decimals before multiplying the assumed $100–$300 per visit. The worked example instead uses the exact annualized calculation: $150 × 5 × 52 ÷ 12 = $3,250; 13% HST = $422.50; total = $3,672.50. The article links to Ontario's HST guidance and makes no verified GTA market-rate claim.

## Reusable design

`GuideLayout.astro` opts into the existing `BaseLayout`, header, navigation, footer, fonts, colours, comments and form runtime. It adds a single reading column, article metadata, responsive featured image, contents links, scoped card/table/panel/FAQ styles, quote CTA and related cards. Existing articles continue using `PostLayout`.

For another monthly guide:

1. Add a Markdown post in `src/content/blog/` with `title`, optional `seoTitle`, `description`, `pubDate`, `image`, accurate `imageAlt` and existing tag slugs.
2. Copy this post's `guide` frontmatter structure: category, breadcrumb, intro, imageCredit, contents and related. The related slugs must identify real collection entries; the build rejects missing ones.
3. Match every contents ID to an article heading. Reuse `.guide-table` with a caption, table headers and a keyboard-focusable labelled overflow region; `.guide-factors` / `.guide-factor`; and `.guide-panel` / `.guide-example` where appropriate.
4. Use native `<details><summary>…</summary><p>…</p></details>` for accessible FAQs. Their answers are present in the generated HTML and do not require JavaScript to open.
5. Generate licensed image variants and social crops, retain source/licence evidence, update manual tag counts and page-count assertions when necessary, then build and test.

## Verification

- `npm run build:preview` passes: 103 generated pages, normal redirect/image processing.
- Eight new guide build tests pass. They check exact metadata, one H1, contents targets, seven FAQs, disclosed calculations, responsive image markup, BlogPosting/BreadcrumbList data, existing internal destinations, archive/sitemap/feed inclusion and the legacy layout.
- The targeted build test group reports **105 passing, one failing**. The remaining failure expects POSIX separators in the existing landing-page phone-link test, while Windows supplies backslashes. The guide's new phone locations/counts pass.
- An initial complete suite run on Windows/Node 25 fails to launch `npx` in build fixtures and encounters Node's experimental global `localStorage`. A temporary uncommitted Windows adapter launches Astro through Node and disables that experimental storage. The broader adapted run reports 818 passing, 13 failing, 26 skipped, with one suite failing to create a Windows symlink; the gate suite is excluded because its fake shell executables require POSIX. Two new-content count expectations were subsequently corrected and pass in the targeted run. Remaining failures concern Windows path normalization, symlinks and gate fixtures. This is **not an all-green production test certification**.
- Hosted review HTTP checks: article 200; requested title and canonical; one H1; valid JSON-LD objects for BlogPosting and BreadcrumbList; seven matching contents targets and seven native FAQs; 46 route/image checks, all 200; article appears in hosted Insights, sitemap and RSS; review responses carry `X-Robots-Tag: noindex`.
- Browser checks at desktop, 768px tablet, 390px mobile and 320px narrow mobile: reading column stays within viewport; the scope table scrolls within its container; featured and in-body pictures use optimized variants; contents navigation and Enter-key FAQ opening work. Header/footer and existing mobile actions are retained. No forms were submitted and no phone calls were initiated.

## Actual hosting and release status

Review URL: <https://week1-review-evergreencleaningservice.ash-47a.workers.dev/office-cleaning-cost-toronto-guide/>

Review Worker version: `f0bf846f-625c-4064-be58-b580fe236b8b`, uploaded with Wrangler `versions upload`, not rolled out to production. The version-preview feature was already enabled; access settings were not changed.

The review assets are a temporary copy of the normal build outside this repository. Only the 36 new photo renditions are restored into that copy, and only their image URLs are pointed at the review alias. The copy also has a universal noindex header. Production source/output keeps the existing Backblaze image-host workflow. **Do not promote this review version to production**: rebuild the merged source through the normal production process instead.

The production deployment remains `eb08438a-274e-4e78-9157-cd14ec03fb5a`, with version `567fcd33-62a5-4971-90aa-38928ef11a9c` at 100%, created 31 October 2026 at 15:29:07 UTC. After the review upload the production article URL still returns 404. The former staging domain does not resolve.

This checkout contains no GitHub Actions deployment workflow. Both package deployment scripts require a clean `main` matching `origin/main` and invoke `wrangler deploy`; `deploy:preview` also updates the same live Worker. A branch push or pull request is not evidence of a production deployment.

Before production: approve the reconstructed copy, retain the remaining kitchen licence PDF (see the stock record), merge through GitHub, run the production checks on the supported environment, synchronize the new images to the existing Backblaze bucket, build/deploy from clean main, and check the exact public URL plus image URLs. The Backblaze upload credentials are not available in this session; no image-bucket synchronization was attempted. Version previews use existing Worker configuration/resources; they are not an isolated database environment, so do not use the review forms for test submissions.

See `docs/stock-photos/office-cost-licensing.md` for licensing observations and `office-cost-renditions.json` for source checksums and rendition sizes.

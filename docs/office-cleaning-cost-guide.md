# Week 1 office cleaning cost guide

## Editorial review

The requested route is `/office-cleaning-cost-toronto-guide/` and the article source is `src/content/blog/office-cleaning-cost-toronto-guide.md`.

The original ChatGPT conversation's full prose and FAQ answers could not be retrieved: its assistant messages were content references, and the browser reported that those responses could not load. This draft reconstructs the complete prose and seven FAQ answers from the user's detailed implementation brief. The title, SEO metadata, selected photos, section order, questions, CTA and budgeting figures follow that brief. The user reviewed the hosted page and explicitly authorized publication on 31 October 2026, then requested removal of only the “Leave a Reply” form. The article is not represented as the recovered original prose.

The examples are explicitly hypothetical CAD calculations before HST. To reproduce the exact supplied ranges, average monthly visits are rounded to two decimals before multiplying the assumed $100–$300 per visit. The worked example instead uses the exact annualized calculation: $150 × 5 × 52 ÷ 12 = $3,250; 13% HST = $422.50; total = $3,672.50. The article links to Ontario's HST guidance and makes no verified GTA market-rate claim.

## Reusable design

`GuideLayout.astro` opts into the existing `BaseLayout`, header, navigation, footer, fonts, colours and navigation. Blog comment forms and their submission runtime are omitted from both guide and standard post layouts, including the CMS post shell, at the user’s request; the article content and quote links remain intact. It adds a single reading column, article metadata, responsive featured image, contents links, scoped card/table/panel/FAQ styles, quote CTA and related cards. Existing articles continue using `PostLayout`.

For another monthly guide:

1. Add a Markdown post in `src/content/blog/` with `title`, optional `seoTitle`, `description`, `pubDate`, `image`, accurate `imageAlt` and existing tag slugs.
2. Copy this post's `guide` frontmatter structure: category, breadcrumb, intro, imageCredit, contents and related. The related slugs must identify real collection entries; the build rejects missing ones.
3. Match every contents ID to an article heading. Reuse `.guide-table` with a caption, table headers and a keyboard-focusable labelled overflow region; `.guide-factors` / `.guide-factor`; and `.guide-panel` / `.guide-example` where appropriate.
4. Use native `<details><summary>…</summary><p>…</p></details>` for accessible FAQs. Their answers are present in the generated HTML and do not require JavaScript to open.
5. Generate licensed image variants and social crops, retain source/licence evidence, update manual tag counts and page-count assertions when necessary, then build and test.

## Verification

- `npm run build:preview` passes: 103 generated pages, normal redirect/image processing.
- Eight new guide build tests pass. They check exact metadata, one H1, contents targets, seven FAQs, disclosed calculations, responsive image markup, BlogPosting/BreadcrumbList data, existing internal destinations, archive/sitemap/feed inclusion and the legacy layout.
- The complete supported Linux/Node 22 suite passes: **39 test files, 874 tests**. Windows/Node 25 could not run the existing POSIX build fixtures reliably; the release was checked in Ubuntu instead. The form census verifies all 26 lead forms and the testimonial form remain protected, and no blog comment forms render. The CMS shell validator no longer requires a comment-form placeholder.
- Hosted review HTTP checks: article 200; requested title and canonical; one H1; valid JSON-LD objects for BlogPosting and BreadcrumbList; seven matching contents targets and seven native FAQs; 46 route/image checks, all 200; article appears in hosted Insights, sitemap and RSS; review responses carry `X-Robots-Tag: noindex`.
- Browser checks at desktop, 768px tablet, 390px mobile and 320px narrow mobile: reading column stays within viewport; the scope table scrolls within its container; featured and in-body pictures use optimized variants; contents navigation and Enter-key FAQ opening work. Header/footer and existing mobile actions are retained. No forms were submitted and no phone calls were initiated.

## Actual hosting and release status

Review URL: <https://week1-review-evergreencleaningservice.ash-47a.workers.dev/office-cleaning-cost-toronto-guide/>

Review Worker version: `f0bf846f-625c-4064-be58-b580fe236b8b`, uploaded with Wrangler `versions upload`, not rolled out to production. The version-preview feature was already enabled; access settings were not changed.

The review assets are a temporary copy of the normal build outside this repository. Only the 36 new photo renditions are restored into that copy, and only their image URLs are pointed at the review alias. The copy also has a universal noindex header. Production source/output keeps the existing Backblaze image-host workflow. **Do not promote this review version to production**: rebuild the merged source through the normal production process instead.

Before this release, the production deployment was `eb08438a-274e-4e78-9157-cd14ec03fb5a`, with version `567fcd33-62a5-4971-90aa-38928ef11a9c` at 100%, created 31 October 2026 at 15:29:07 UTC. After the review upload, before production release, the article URL returned 404. The former staging domain does not resolve.

This checkout contains no GitHub Actions deployment workflow. Both package deployment scripts require a clean `main` matching `origin/main` and invoke `wrangler deploy`; `deploy:preview` also updates the same live Worker. A branch push or pull request is not evidence of a production deployment.

Production release: publication was explicitly authorized by the user. All 36 new image renditions were synchronized to the existing Backblaze bucket using its previously authenticated deployment configuration (36 uploaded, 1,139 unchanged; no pruning or deletion). Merge through GitHub, then use the normal guarded production deployment from clean, current main with the real reCAPTCHA site key; verify the exact public article URL, Insights/Recent Posts, sitemap, RSS and hosted image URLs after deployment. The kitchen asset’s Premium licence and dated download record are verified; the website’s certificate-download button did not produce a PDF, as recorded in the stock record. Version previews use existing Worker configuration/resources and are not an isolated database environment.

See `docs/stock-photos/office-cost-licensing.md` for licensing observations and `office-cost-renditions.json` for source checksums and rendition sizes.

# Week 3 — commercial cleaning quote checklist

Route: /commercial-cleaning-quote-checklist/. Publication: 10 November 2026.

The buyer guide explains what a commercial cleaning proposal should include: tasks, scheduling, supplies, exclusions, approval of extras and agreement review. It complements the existing cost, frequency and task checklists. The worked 6,000 sq ft office is explicitly illustrative, with no invented customer story or pricing. The article has about 1,670 words, seven H2 sections, a scope table and six FAQs of 46–52 words. Focus keyword: commercial cleaning quote checklist. Secondary keyword: commercial cleaning scope of work (three uses).

The publishing deliverables include the full post, five titles under 60 characters, five descriptions of 110–140 characters, five slugs, three image ideas and alt text, internal links, Canadian sources, an excerpt, existing tags and prepared LinkedIn and Google Business Profile copy. Social posts have not been sent.

Existing licensed photography is reused; the featured image has article-specific filenames so archive image inventories retain distinct entries. No new stock purchases or generated imagery. Source/licence record: docs/stock-photos/office-frequency-licensing.md. All 12 featured image renditions are copies of the existing licensed derivatives; body kitchen and washroom images retain their existing paths.

GuideLayout now has an optional showCta field, defaulting to true. This article sets it false and places its quote link and telephone invitation before the FAQ, keeping the FAQ last in the article. Existing guides retain their CTA. The article is automatically included in the homepage news, Insights, RSS, sitemap and blog mirror; llms.txt and the existing tag counts have also been updated. The additional guide and three tag pagination pages bring the public page census from 99 to 103.

Browser preview checks: desktop, 390 px and 320 px layouts; no document overflow, the table scrolls in its labelled region, and Enter opens the native FAQ disclosure. No form submission was made for this article-only change.

Release validation uses a Linux clone with Git history and LF line endings. A plain directory copy cannot validate Git-based sitemap lastmod and preserves Windows CRLF that breaks source-pattern fixtures. Production publication retains the existing clean-main deploy guard, secret-name check, image synchronization, production build/captcha checks, Wrangler deployment, cache purge and IndexNow stages. Linux test results and live verification are recorded with the release evidence after publication.

## Production release

Source commit 1b6abbf was deployed on 10 November 2026. Cloudflare version: d4b5a33e-00fc-48d5-9fb1-c5b0b61a95aa. The production build produced 110 HTML pages including private and campaign pages; the public telephone census is 103 pages. Image synchronization uploaded the 12 new featured-image renditions. The production captcha build check passed. Required DATABASE_URL and RECAPTCHA_SECRET names were verified through Wrangler's JSON secret list; the standard Node script cannot resolve npx.cmd on Windows, so the release wrapper performed the same check through PowerShell. No secret values were printed or changed.

The Linux suite ran 1,178 tests: 1,177 passed, with the new article correctly increasing the pinned sitemap census from 60 URLs to 61. After updating that existing expectation, all 41 tests in the affected headings-and-links suite passed. The other 51 suites were already passing with the final article and image sources.

Live verification at 22:19:57 UTC (5:19:57 p.m. EST, Toronto): article HTTP 200; correct title, description, self-canonical, one H1, six FAQs, valid contents links, BlogPosting and BreadcrumbList; no noindex. All 11 route checks pass, including all six editorial internal destinations plus homepage, Insights, sitemap, RSS and llms.txt discovery. All five article/related-image requests return HTTP 200. All 12 new hosted image variants return 200 and match the local SHA-256 hashes. IndexNow accepted two changed URLs with HTTP 200. Optional cache purge had no token and was skipped; the live checks nevertheless confirm current production content.

Evidence: docs/evidence/week3-validation.json and docs/evidence/week3-production-verification.json. This post-release documentation commit does not alter the deployed website.

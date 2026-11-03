# Week 2 implementation — office cleaning frequency

## Content and design

The existing Week 1 article at /office-cleaning-cost-toronto-guide/ was confirmed live (HTTP 200). Its opt-in GuideLayout is reused with the unchanged BaseLayout, header, navigation, footer, font and colours. Optional CTA copy fields keep Week 1 defaults intact. The new guide adds no site redesign, plugin or client-side FAQ dependency.

Route: /how-often-should-an-office-be-cleaned/. Full article: src/content/blog/how-often-should-an-office-be-cleaned.md. Publication date: 3 November 2026. About 1,800 editorial words including the introductory paragraph, excluding navigation, captions and CTA. Seven FAQs are 47–54 words each. The focus phrase appears in the H1, opening, H2 and conclusion. The secondary phrase appears five times including the CTA heading.

Suggested frequencies are explicitly planning examples, not mandatory standards or survey statistics. The 6,000-square-foot, 40-employee, two-washroom example is labelled illustrative. Ontario washroom duties and cleaning-record guidance are sourced separately. No pricing, client story, efficacy claim, award or certification is invented.

The requested article title is rendered as “How Often Should an Office Be Cleaned Professionally?” to include the exact requested focus phrase. Supplied publication meta title, description and canonical are unchanged. BlogPosting and BreadcrumbList use the existing schema helpers.

The existing 24 article sources were reviewed for overlapping intent: seasonal tasks and day-versus-night scheduling are complementary; no existing article answers the whole-office frequency question. An eight-word phrase comparison found no shared eight-word prose phrases with those sources. The target returned 404 before implementation, so no existing article was replaced. Four approved internal destinations are used once each within the guide (service, two related articles and quote). All approved destinations returned HTTP 200 before publication.

## Photography and additional copy

Three new genuine stock interiors from Magnific, without visible people, replace no Week 1 assets. Premium+ account status and licensed-original download responses were checked before use. Source and licence record: stock-photos/office-frequency-licensing.md; optimization manifest: stock-photos/office-frequency-renditions.json. The 36 renditions include AVIF/WebP/JPEG responsive sources, thumbnails and social crops. Phone AVIFs are approximately 8–10 KB; 1200px AVIFs are approximately 36–43 KB.

See office-cleaning-frequency-deliverables.md for five title options, five description options, five slugs, the excerpt, existing tags, Canadian sources and prepared LinkedIn/Google Business Profile copy. Social posts are prepared only.

## Verification

- Local Astro build succeeds, producing 105 pages. The additional article and office-tag pagination account for two new pages. Existing tag, sitemap and telephone census expectations are updated for those additions.
- Browser checks at 1440px desktop, 768px tablet, 390px mobile and 320px narrow mobile: no document overflow; all guide photographs and related thumbnails load; phone tables scroll inside keyboard-focusable labelled regions; all seven contents links target real headings; Enter opens and closes the native FAQ disclosure. Smooth-scroll navigation was checked after settling and clears the sticky header.
- Linux/Node 22 release suite: 39 test files and all 876 tests pass. Astro content sync ran before the suite; serial execution avoids concurrent build-fixture writes to the shared content cache.
- Source diff whitespace check passes. Week 1 content and default CTA remain intact.

## Release

The established process is merge to GitHub main, then guarded npm run deploy using Wrangler and the existing Backblaze image sync. A push alone does not deploy this site. PR #74 was merged and source commit `9696ded7ebd904671e61e289e767be26675d3ff0` deployed successfully on 3 November 2026 at 22:39:49 UTC (5:39:49 p.m. EST, Toronto). Cloudflare version `d9bd9b36-9d32-441b-93ed-9dfe5cdbaa2f` is at 100%, deployment `d5a4b888-5c70-4bc7-88bf-78291904fbb6`. The guarded production process also passed all 876 tests, verified required secret names and the real captcha public key, and uploaded 36 new image renditions (1,220 unchanged; no pruning).

Live verification at 22:40 UTC: the exact article returns HTTP 200; title, supplied description and canonical match; no noindex directive; one H1; seven accessible FAQs; BlogPosting and BreadcrumbList; all contents targets valid. Nine route/discovery probes pass, including homepage, Insights, sitemap, RSS and Week 1. The article is first in Insights. All 36 hosted image renditions return 200 and match local SHA-256 checksums.

The published page was tested again at 1440px, 768px, 390px and 320px: all images load, no document overflow, tables remain within their containers, keyboard FAQ controls work and no page JavaScript errors occur. The deploy did not have a cache-purge token, so its optional purge was skipped; live probes nevertheless confirm the new page, listing and all current image bytes. No publishing issue remains. Evidence: `docs/evidence/week2-production-verification.json`. This post-release documentation commit does not change the deployed website.

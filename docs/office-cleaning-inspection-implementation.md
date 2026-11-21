# Week 7 implementation and review

Article: `/office-cleaning-inspection-checklist/`

Staged on `content/evergreen-week7-inspection` from main commit `35d7585013bf2718e187b59ae2a599c28841330c`. No production deployment, shared image upload or social publication. The current shared staging host uses the production Worker, so the review uses an isolated local build.

The guide uses the unmodified current GuideLayout, Open Sans, Evergreen brand green #47802a and existing responsive, table and native FAQ styles. No global layout or website behaviour was changed. Only the new content, photo renditions, editorial map additions and internal records are included.

Validation: Astro build passed (115 pages); 20 specific rendered-content checks passed. Rendered editorial copy is 1,771 words; Markdown count is 1,783 by the documented whitespace-token count including headings, table and captions, excluding image alt text. Six FAQs contain 49, 47, 48, 49, 48 and 48 words. The secondary keyword occurs three times. Meta titles are 51, 49, 50, 47 and 52 characters; descriptions are 136, 126, 127, 136 and 128 characters. Excerpt is 135 characters; LinkedIn and Google drafts are each 54 words.

Browser review: 1440, 768, 390 and 320 px widths showed no document overflow. The 580 px checklist scrolls within its own region on phones, and keyboard right-arrow scrolling was observed. Desktop Enter and mobile pointer interaction opened an FAQ. All three article images loaded; table-of-contents targets resolve. The canonical and BlogPosting metadata point to the proposed production URL. All six internal destinations and two Canadian source links returned HTTP 200. Public copy contains no photo credits or generic stock-photo notices.

Repository suite limitation: the selected existing suites produced 15 passing tests across two files and six blocked suite files. The Windows harness calls npx without a shell in five suites; titles parsing expects LF while existing checkout Markdown uses CRLF. These are documented environment/harness limitations, not reported as passes. A direct Astro build and rendered-content validation completed successfully without changing unrelated tests.

Before requested deployment: rebase if main changed; confirm actual publication date in frontmatter; run required production build and deployment gates in the supported environment; upload the new, unique image keys and verify CDN renditions, canonical, social image, archive inclusion and the published route. No promise of a correction deadline or invented inspection interval was added to Evergreen practice.

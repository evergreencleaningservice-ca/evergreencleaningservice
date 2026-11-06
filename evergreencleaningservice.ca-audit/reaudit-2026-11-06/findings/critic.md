Score: n/a (completeness critic; no area score)
Previous: n/a

# Completeness critic: re-audit of www.evergreencleaningservice.ca (6 Nov 2026, evening)

Inputs read: BRIEF.md, all 10 files in findings/ (technical, sitemap, onpage, schema, performance, images, visual, geo, agentic, local), the first audit's FULL-AUDIT-REPORT.md, ACTION-PLAN.md and findings/content.md, sxo.md, cluster.md. Live checks (read-only, about 45 requests, 1 s apart): headers on 11 routes, 25 page bodies, 9 redirect variants, the public GTM container (`gtm.js?id=GTM-5W69BTJQ`, a static GET that records no hit), and a Playwright run of 3 pages under 4 render scenarios with every analytics, ads, beacon, reCAPTCHA and `/api/` request blocked. Scratch output: /tmp/claude-0/-home-user-evergreencleaningservice/692c77ca-669b-54d4-b608-18eee442d35d/scratchpad/critic/.

## 1. Confirmed gaps (most severe first)

| # | Severity | Gap | Evidence (live unless noted) | Recommendation |
|---|---|---|---|---|
| C1 | High (process) | Two of the twelve specialist files are missing: `content.md` and `sxo.md`. Content Quality is the largest weight in the first audit's score (23%), so the re-audit cannot produce a like-for-like overall score. About 20 first-audit content and SXO findings had no status from anyone. | findings/ holds 10 files at 22:22; no content.md or sxo.md. | Do not publish a weighted overall score until both exist. Section 2 gives a stop-gap status for the orphaned items. |
| C2 | Medium | The deferred GTM loader delays Google Ads call tracking. Phone conversions in Ads depend on it, and nobody examined this. The container's phone tracking is a "calls from website" tag (`__awcc`, `vtp_phoneConversionNumber "(416) 803-4880"`). It swaps in a Google forwarding number only after gtm.js, gtag.js and call-tracking_9.js have loaded. The loader now waits for `load` plus `requestIdleCallback`, or for the first interaction. So a paid visitor who taps a `tel:` link in the header, hero or sticky bar before the swap dials the canonical number, and Ads records no call. The `tel:` pointerdown trigger in the loader cannot help, because the dialler opens on that same tap. The container has no `click_to_call` trigger: its only triggers are `gtm.init`, `gtm.js` and `lead_form_submission`, although the comment in `GoogleTagManager.astro` says conversions fire on `click_to_call`. | `/lp/commercial-cleaning-quote/` HTML has the deferred loader (`requestIdleCallback(load, { timeout: 4000 })`) and 4 `tel:+14168034880` links. Home has 6. Phase 4 timing: gtm.js 0.85 to 1.7 s into the visit (lab), and gtag about 0.8 s after that (performance.md). In the field data, this LP and the home page carry 51 of 106 beacons (performance.md). performance.md row 1 says the escape hatch "was not needed because nothing is held back". That misses this effect. | Ads owner: compare Ads "calls from website" conversions for the week before and after the PR #78 deploy. Developer: in `src/components/GoogleTagManager.astro`, load the container immediately on `/lp/*` and whenever the URL carries `gclid`, `gbraid` or `wbraid` (paid visits, where the swap matters), and keep the deferral for organic visits. Correct the `click_to_call` claim in the file comment, or add that trigger to the container. Do not lengthen the delay (performance.md N5 option) without this. |
| C3 | Medium | Doorway assessment of the 4 new location pages looked only at text uniqueness. The proof on those pages is recycled and unconfirmed. Under the heading "What a client says", the same Google review appears on several city pages: Edward Sherman (May 2021) on Downtown Toronto, North York and Durham Region; Michael Katchen on Mississauga and Scarborough; Andy Handy on Vaughan and Richmond Hill. None names a city. The Durham FAQ states operations as fact ("Crews come out on fixed evenings and the schedule is written so one trip covers the evening's work"). The source says these pages were "written from public knowledge of the districts, not from client-supplied facts", and all four carry `needsClientReview: true`. The action plan said to publish Durham "only if the client confirms crews travel there". 9 of 11 location pages, including all 4 new ones, share one city-swapped H2 outline. | /locations/durham-region/, /north-york/, /scarborough/, /richmond-hill/ (live). `src/data/locations.ts` lines 333-336 and the `needsClientReview` flags at 357, 379, 401 and 423. Crawl H2 outlines: 3 distinct patterns across 11 pages. | Show a review on a location page only when the reviewer is in that area, or label it with the reviewer's area. Otherwise use a sitewide review strip with no "client" framing. Get client confirmation (or noindex) for Durham before the FAQ operational claims stay live. Give each new page one permissioned local fact, then clear the flag (as sitemap.md N2 says). Raise the severity there from Low to Medium. |
| C4 | Medium | The gallery is credited as Fixed (images.md, onpage.md) for captions alone. It still presents stock photos as the company's work, indexable, with no stock disclosure. The first audit asked to "noindex or honestly caption the stock gallery" and rated it High. | /cleaning-demo-gallery/ (no robots meta): "The photographs on this page illustrate the kinds of work Evergreen Office Cleaning takes on", followed by job-style captions ("Dental clinic cleaning: disinfecting an operatory light"). Neither "stock" nor "illustrative" appears. Other pages label stock images as "Illustrative stock photograph" (first audit). | Add "Illustrative stock photographs" to the intro and to each caption, or noindex the page until real photos exist (H6). |
| C5 | Low | The three homepage testimonials are still undated and unsourced (action item 10, content #13). No file gives them a status: local.md says they are "not observable". | `/`: "Brenda Carmichael, Toronto Spa Business Owner", "Allen Robinson, Founder & CEO", "Paul Lockheart, Toronto Business Owner", with no date and no source, next to dated Google reviews. | Client: confirm and date them with permission, or remove them from `src/components/home/Testimonials.astro`. |
| C6 | Low | Heading defects from content #9 are still open and unreported. | The footer emits 5 `<h2>` on every page: "Evergreen Office Cleaning", "Services", "Reviews", "Service Areas", "Follow us on Social Media". The crawl shows them in every location outline. The cost guide still has the H2 "In this guide". | Change the footer titles to `<p>` in `src/components/Footer.astro`. Drop the "In this guide" H2 in `src/content/blog/office-cleaning-cost-toronto-guide.md` or its layout. |
| C7 | Low | /green-clean-products/ is still mostly manufacturer copy (content #4). Not reported. | Live: "In April of 2013 changes occurred between Environment Canada and Ecologo. UL Environment is now handling…", "The ProSeries Green™ line offers you an easy and economical way…". | Rewrite in house words, and link the ECOLOGO listing (action item 9). |
| C8 | Low | "At a glance" blocks are still tables of contents, not facts (content #12). Not reported. | Present on 19 crawled pages. Example: /benefits-of-commercial-deep-cleaning-services/: "First Impressions are Important / Motivate Your Employees / …". | Turn each into 3 to 5 answer sentences, or remove it. |
| C9 | Low | There is no decision on the off-core posts (cluster F7, action item 20). | /keep-your-office-at-home-clean/ and /how-to-keep-your-office-fridge-clean/ are indexable (no robots meta). onpage.md N4 lists them only as zero-inlink. | Check their GSC clicks, then noindex, merge or keep (owner decision). |
| C10 | Low (client) | The clinic page still has none of the requested proof (SXO #9, action item 19). | /industries/medical-dental-clinics/: "colour-coded" 0 matches, "training" 0, no sign-off log, no review shown. IPAC is mentioned only as "the clinic's own … procedures". | Client: crew IPAC training, colour-coded cloths, sign-off log, a clinic testimonial. |
| C11 | Info | The HTML charset header is still missing (Phase 1 item 5). onpage.md marks it Open, but technical.md, the file that owns it in the first report, gives it no status row and lists charset under "What works". | `content-type: text/html` on /, /request-a-quote/, /lp/…, /thank-you/, /search/ and 404. `public/_headers` has a charset only at line 78 (text/plain). `<meta charset="utf-8">` is at byte 40, so browsers are unaffected. | Add `Content-Type: text/html; charset=utf-8` for HTML routes, or record a decision not to. |
| C12 | Info | Forward risk from the CSP plan: the report-only allowlist lacks hosts that the live container uses, so enforcing it "after two clean weeks" as written would block parts of the Ads tags. | gtm.js references `pagead2.googlesyndication.com`, `adservice.google.com` and `cct.google`. None appears in the report-only policy in `public/_headers` line 88. | Read `/api/csp-report` before enforcing, and add the hosts the container actually uses. |
| C13 | Info | IndexNow submits only sitemap URLs, so the two 301'd post URLs are never submitted, and Bing learns about the merges only on recrawl. technical.md also states wrongly that nothing was submitted (see D3). | `scripts/lib/indexnow.mjs` selects from sitemap `<lastmod>`. Deploy log 20:24 UTC: "submitted 32 URLs … HTTP 202". | Optional: on a deploy that adds redirects, also submit the old URLs. |

## 2. First-audit items with no re-audit status (orphaned by the missing content and SXO files), checked live

| First-audit item | Status now | Evidence |
|---|---|---|
| Content #11: "our top three tips", "Microfiber rubs" | Fixed | /5-easy-ways-to-keep-your-commercial-floor-clean/ now says "our five tips". Neither string is present. |
| Content #11: unsourced "studies show" statistics (deep-cleaning, slips, plants) | Fixed | 0 matches for "studies show", "according to" and "statistic" on the deep-cleaning and slips posts. The plants post was merged with a 301. |
| Content #11: 15 untouched legacy posts | Open | sitemap.md: 18 posts still dated 2020 to 2023. |
| Content #11 and cluster F7: home-office and fridge posts | Open (decision) | Both indexable. See C9. |
| Content #5: Mississauga and Vaughan generic voice | Fixed | 0 matches for "top-tier", "Zero Disruption", "peace of mind" and "WSIB Ontario Registered" on either page. |
| Content #5: shared location outline | Open, now wider | 9 of 11 pages share one outline (C3). |
| Content #7 and action item 3: footer anchors | Fixed | Footer: "Downtown Toronto" → /locations/toronto-downtown/, "Commercial Cleaning" → pillar, and Richmond Hill and Scarborough link to real pages. |
| Content #6 and SXO #11: 18 to 44% boilerplate on service pages | Not verified by anyone | No file measured it. Neither did I. |
| Content #9: footer H2s, cost guide "In this guide" | Open | C6. |
| Content #4: green-products manufacturer copy | Open | C7. |
| Content #4: contact page "what happens next" and trust strip | Open | /contact-us/: no "what happens next" or next-step text. local.md N6 covers the form. |
| Content #3 and action item 17: gallery stock | Partly fixed (format only) | C4. |
| Content #12: "At a glance" as tables of contents | Open | C8. |
| Content #13 and action item 10: homepage testimonials | Open | C5. |
| SXO #5 and action item 10: persona-matched reviews | Open | The clinic page shows no review. The floor page shows the generic property-manager review (Katchen). Post-construction shows Mark Post (May 2021). |
| SXO #6 and action item 12: quote form | Open (client D-A) | /request-a-quote/ requires address1, city, province and postal. There is no sq ft, visits per week, washrooms or "ballpark" field (0 matches). |
| SXO #7 and action item 19: post-construction commercial angle and pricing explanation | Fixed | Title "Commercial Post-Construction Cleaning Toronto \| Evergreen", H1 "Commercial Post-Construction Cleaning in Toronto & the GTA", H2 "How a post-construction clean is priced", phases explained. |
| SXO #8 and action item 18: floor page | Partly fixed | "A sample year for a lobby floor" is present. $/sq ft bands and before/after photos are absent (client). |
| SXO #9 and action item 19: clinic IPAC | Open (client) | C10. |
| SXO persona scores (45 to 65) and SXO Gap Score 61 | Not re-scored | No sxo.md. |

## 3. Contradictions between files (resolved against the live site where possible)

| # | Files | Conflict | Resolution |
|---|---|---|---|
| D1 | performance #7 (Open) vs images #3 (Fixed) | Service-card 640w variants and `sizes` | images.md is right. The home markup has `-640.` sources and `sizes="(min-width: 1400px) 418px, … calc(100vw - 30px)"` on all three cards. The 768 fetch in Lighthouse is the correct choice at the emulated DPR of 1.75 (about 382 CSS px × 1.75 ≈ 668 px). Change performance #7 to Fixed. |
| D2 | sitemap 2.3 ("1 iframe … and map query") vs local #1 ("no Google Maps embed") | Maps on location pages | local.md is right. The single iframe on all 11 pages is the GTM `<noscript>` iframe (`ns.html?id=GTM-5W69BTJQ`). There is no Google Maps embed or link on the location pages checked. |
| D3 | technical (IndexNow "Not submitted to any engine") vs geo G12 (live in deploy) | IndexNow | geo.md is right. Deploy log (scratchpad/deploy5.log, 20:24 UTC): "indexnow: submitted 32 URLs … HTTP 202 (received; the key is still being checked)". Final acceptance is unconfirmed. |
| D4 | visual N1 recommends adding a `@media print` reveal rule | Print rule | The rule already exists (`src/styles/global.css` line 839, opacity 1 !important). Print emulation showed 0 hidden blocks on 3 pages. Drop the recommendation. |
| D5 | performance #1 ("escape hatch not needed … nothing is held back") vs source | GTM tel:/focus triggers | The source has `focusin` and `tel:` pointerdown triggers. The real problem is the call-number swap (C2). |
| D6 | images #2 (slides 2/3 eager, Open) vs performance #3 (fetched after load, passing) | Hero slides | Markup confirms slides 2 and 3 have no `loading` attribute (eager by default). The lab trace shows them fetched at about 1.2 s. Both can be true. Low impact, unresolved. |
| D7 | sitemap 2.3 vs local N1 | Location uniqueness | Sitemap: 63 to 71%, minimum Etobicoke and Markham at 63%. Local: 59 to 69%, with Etobicoke and Markham at 59%, under the sitemap's own 60% bar. Both say "pass". The synthesis must pick one method and state it. |
| D8 | geo N3 (Low) vs local N2 (Medium); schema N2 (Low) vs local N3 (Medium) | Severity | Same facts with different severities (llms.txt staleness; Durham typed as `City`). Harmonise. Low for both is defensible: llms.txt has no confirmed consumer, and the typing is precision only. |
| D9 | geo line 2 "Previous: 70" | Baseline | The brief defines "Previous" as the first audit. FULL-AUDIT-REPORT gives geo 66 (70 is the later GEO-ANALYSIS.md). Use 66, or state both. |
| D10 | technical "What works" (charset) vs onpage #6 (Open) | Charset | onpage.md is right (C11). |

## 4. Site-wide risks introduced today: what I checked

- **Scroll-in reveal (#81/#82): no crawler or reduced-motion gap.** Playwright, Googlebot smartphone UA, 412 px wide:
  - At 412×732 with the viewport then grown to the page height (as Google's renderer does), the home page had 4 blocks (2,254 of 9,943 characters) still at opacity 0 for 100 ms. All were visible by 1.5 s. The checklist and North York pages had none hidden.
  - With a tall viewport from the start, 0 to 1 blocks were armed and none hidden.
  - With no scrolling for 5 s, home had 4 blocks hidden (2,254 characters) and North York had 1 (211 characters). This affects only screenshot and agent tools that do not scroll.
  - Under print, 0 were hidden.
  - visual.md already showed JavaScript off and `prefers-reduced-motion` give 0 armed. The text is in the DOM in every case. Residual: Info only (D4).
- **IndexNow key file: clean.** 200 `text/plain`, body equals the key. A submission was made with `keyLocation` (D3). Info only (C13).
- **Enforced CSP subset: clean.** `frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'` is present on static pages, Worker routes (/thank-you/, /search/, the 404) and the key file. Every form on 25 pages posts to `action="#"` with a fetch to `/api/submit-lead`, or GETs `/search/`, so `form-action 'self'` blocks nothing. X-Frame-Options was already SAMEORIGIN. Forward risk only (C12).
- **Deferred GTM and call tracking: gap.** See C2.
- **301s for merged posts: clean.**
  - Slashless and `/blog/` variants are single-hop to the targets.
  - http-apex is 2 hops (known first-audit item).
  - `/rss.xml` has no old slug.
  - The merged content is really there: the "Hand Hygiene" section in the germs post, and the "Plants and air quality" section in the air-quality post.
  - `/tag/hand-washing/` is a 404 but was not in either crawl.
  - `/category/blog/page/2/` and `/3/` still return 200 noindex. They are not linked.
- **Four new location pages as a doorway pattern: gap in proof, not in text.** See C3.

## 5. Needs the client or an account owner (new from this review)
- Ads owner: check "calls from website" conversions before and after the PR #78 deploy, and decide whether paid landings load the container immediately (C2).
- Client: confirm Durham travel, or noindex the page. Approve which reviews may appear on which city pages (C3).
- Client: date or drop the three homepage testimonials (C5). Clinic IPAC and training facts (C10). A decision on the home-office and fridge posts after a GSC look (C9).

## 6. Not verified
- Real Ads call-conversion counts, and whether any forwarding number is actually shown to ad visitors (that needs a live ad click, which would write to the client's account).
- Whether Bing accepted the IndexNow batch after the 202.
- `/api/csp-report` contents.
- Google's own rendered snapshot (URL Inspection). My render test is a simulation.
- Service-page boilerplate percentage (content #6), SXO persona re-scoring and the remaining content briefs.
- Pages fetched once this evening. Nothing outside the 25 bodies and 11 header checks listed above was re-fetched.

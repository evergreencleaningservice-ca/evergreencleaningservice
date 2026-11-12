# Completeness critic: third audit (11-12 Nov 2026)

Scope: read BRIEF.md, all 12 specialist files in this folder, and the 7 Nov FULL-AUDIT-REPORT.md and ACTION-PLAN.md (Phase A, items 1-15, plus the "verify after the deploy" line). Each gap below was checked against the live site on 12 Nov (curl, about 20 requests, 1 s apart; two Playwright runs with every Google, Ads, DoubleClick, reCAPTCHA, `/cdn-cgi/rum`, Cloudflare beacon and `/api/` request aborted, so nothing reached the client's accounts; no form submitted), or against the saved crawl and the repo where the live page is the same bytes. No repo change other than this file.

Not a score file. The critic does not score; the numbers in the specialist files stand unless a correction below changes their evidence.

## 1. Phase A items that no new file gave a status for (now checked)

| # | Phase A item (7 Nov plan) | Who should have covered it | Status now | Evidence (12 Nov) |
|---|---|---|---|---|
| 1 | Paid visits load GTM at once; organic stays deferred (live check asked for in the plan) | performance (P3 read the code only) | **Fixed, observed live** | Playwright, Google hits aborted: `/lp/commercial-cleaning-quote/` requested `gtm.js?id=GTM-5W69BTJQ` at 288 ms (load at 1,087 ms); `/?gclid=test-critic` at 373 ms (load 1,031 ms); `/` at 1,662 ms, right after `load` (1,651 ms), with no interaction. `/services/office-cleaning/` on Pixel 7: 1,265 ms, after `load` 1,254 ms. So "deferred" on organic visits means "until onload/idle", which on a fast connection is about 10 ms after load. |
| 1b | Correct the `click_to_call` comment; add a test for the paid branch | performance (1b marked "Open, not re-checked") | **Fixed (repo)** | `src/components/GoogleTagManager.astro` lines 51-60 now say phone conversions come from the Ads "calls from website" number swap and that the container has no trigger on `phone_click`. `tests/gtm-loader.test.ts` has `describe('paid visits load the container at parse time')` covering gclid, `/lp/`, staging and the negative cases. Performance 1b should read Fixed. |
| 2 | Link North York, Scarborough, Richmond Hill and Durham where the "nine other GTA municipalities" sentence names them | content (checked the count only) | **Fixed** | The paragraph on `/services/commercial-cleaning/` links all 11 location pages, including `/locations/north-york/`, `/scarborough/`, `/richmond-hill/` and `/durham-region/` ("Pickering, Ajax and Oshawa"). |
| 4b | Remove the unconfirmed Durham FAQ line "Crews come out on fixed evenings…" | sitemap and local (implied, not stated) | **Fixed** | "fixed evening" absent from `/locations/durham-region/`. The service claim itself remains (see D6). |
| 6 | Cite or delete the dust-mite figure and fix "may no appreciate" in the day/night post | content (general search for statistics) | **Fixed** | Neither string is on `/day-night-which-is-the-best-routine-for-your-office/`. |
| 15 | 44 px tap targets for footer, area and "Read more" links | visual (said "not observed") | **Partly fixed; visual's evidence partly wrong** | Playwright, 360x740 and Pixel 7: header call and menu buttons are 44 px (visual reported 40x40); 28 of 29 footer links are 44 px or more (footer "Request a quote" 40 px). Not fixed: on `/services/janitorial-services/` the in-page service-area links in `<main>` are 24 px high (Downtown Toronto, Etobicoke, North York, Scarborough) and the breadcrumb links 30 px. `/services/office-cleaning/` is the same (24 px area links, 30 px breadcrumb). The only coarse-pointer rule found is `@media (width <= 767px), (pointer: coarse)` for `.footer-areas`, so the fix stopped at the footer. Home: all 7 "Read more" buttons are 44 px or more; "Visit Our Blog" 40 px. |
| - | "Verify after the deploy: `npm test`" | nobody ran the full suite | **Passes (local tree)** | `npx vitest run` on the working tree (HEAD includes 42c3943): 53 files, 1,187 tests passed. This tests the repo, not production. |

All other Phase A items have a status in at least one specialist file and I found no reason to change them.

## 2. Contradictions between files (resolved against the live site)

| ID | Files | Contradiction | What is true (12 Nov) | Correction |
|---|---|---|---|---|
| D1 | technical vs the crawl | technical says the 30 noindex crawled pages include "LPs, thank-you". | `raw/crawl/pages.json` holds no `/lp/` or `/thank-you/` URL; the 30 noindex pages are all `/tag/`. No specialist read the two Google Ads landing pages; `verify:indexing` only checked their robots header. Geo's "all 102 '2 hours' mentions are qualified" therefore excludes the paid pages. | Fix the technical wording. The paid pages were checked by me (R1, R2). |
| D2 | content 1b-5c vs sitemap 2.3 | content: "Markham, Brampton and Oakville show no client quote; Vaughan and Etobicoke keep one each". sitemap: quotes on Downtown, Mississauga, Brampton, Vaughan, Oakville, Etobicoke, Markham. | Sitemap is right. 7 of 11 location pages show a "From our Google reviews" quote (Downtown, Mississauga, Brampton, Vaughan, Oakville, Etobicoke, Markham); North York, Scarborough, Durham and Richmond Hill show none. | Correct content 5c. The "fixed" verdict on recycling stands (each quote appears on one city page). |
| D3 | sitemap 2.3 vs local N1 | Same test (6-word shingles vs the other 10 pages), different numbers: sitemap Etobicoke 60%, Markham 60%, Oakville 62% ("all meet 60%"); local Etobicoke 58%, Markham 58%, Oakville 59%. | Both say their text extraction differs. Three pages are on or below the bar depending on method. | Report should say "Etobicoke, Markham and Oakville are at or just under the 60% bar" and pick one method before any twelfth location page. |
| D4 | visual vs brief | visual: header call and menu 40x40, Phase A 44 px "not observed". | Header and footer meet 44 px; in-main area links and breadcrumbs do not (section 1, item 15). | Visual item 1 stays "Partly fixed" but with the corrected evidence. |
| D5 | sitemap 2.2 ("insights … accurate") vs geo N8 | geo: the cost guide was edited on 7 Nov but reports dateModified 2026-10-31. | Confirmed. `sitemap-insights-0.xml` lastmod for `/office-cleaning-cost-toronto-guide/` is `2026-10-31T00:00:00.000Z`; commit 6f4f4de (7 Nov 18:09 UTC) changed its title, H1 and claims (10 lines) and set no `updatedDate`. The sitemap's "accurate" verdict is wrong for this URL. | Low. Add `updatedDate: 2026-11-07` to `src/content/blog/office-cleaning-cost-toronto-guide.md` (and `office-cleaning-checklist.md` if its 7 Nov edit was substantive). |
| D6 | sitemap N1 (Medium) vs local L3 (Low, "no fix needed") | Severity of the Durham service claim. | `/locations/durham-region/` still answers "Yes, all three are" (Pickering, Ajax, Oshawa), lists facility types there and emits `areaServed` for the three cities, while `src/data/coverage.ts` says the reach is unconfirmed. Plan item 22 said confirm or noindex. | Report as Medium, client item: confirm, or soften the FAQ/`areaServed` until confirmed. |
| D7 | technical N7 vs live | technical: `/robots.txt` served `text/plain` with no charset (recommendation N7). | Live now `text/plain; charset=utf-8`. Commit 42c3943 ("Serve robots.txt as text/plain; charset=utf-8 (audit 11 Nov, technical N7)", 12 Nov 17:56 UTC) was merged in PR #98 and deployed during this audit, after the drift baseline and the crawl. | Mark technical N7 Fixed (12 Nov). Record in the report that one production change shipped mid-audit, against the brief's "no changes" rule; nothing else in the crawl is affected. |
| D8 | sxo, geo, content ("no Evergreen price on any page") vs the paid pages | All three treat the absence of any Evergreen price as a client item. | Both Ads landing pages publish "From $30/hr, supplies and equipment included", "First month free on a signed recurring contract", "Cancel anytime with 30 days' notice", and an FAQ answer "Rates start from $30/hr and vary by scope" (`src/data/landing.ts` lines 113-115, `src/data/landing-pages.ts` line 86). `src/data/process.ts` line 72 records a deliberate choice to keep the rate on paid pages only. | See R3. The statement "no price anywhere" is wrong; "no price on organic pages, by decision" is right. |
| D9 | geo section 3 | "Confirm that the GBP service area matches the 10 `areaServed` places". | Organisation `areaServed` is now 15 places (schema and local both confirm). | Use 15 in the report. |
| D10 | sxo vs onpage N1 | sxo credits the quote checklist as "linked from 61 pages"; onpage says it has 0 contextual inlinks and will be orphaned when it leaves the five-newest list. | Both counts are right about different link types: the 61 are template links (Recent Posts widget, home "Latest insights", /insights/). | Report should use onpage's reading: the post is not yet linked from any body copy. |

## 3. Risks introduced since 7 Nov that nobody examined (checked)

### R1. The Google Ads landing pages' reply promise no longer matches the wording the code says the ads quote. Medium (Ads owner)
- Evidence: `/lp/commercial-cleaning-quote/` and `/lp/commercial-cleaning/` (both 200, `noindex, nofollow`) now say "We reply within 2 hours, Mon–Fri 7am–6pm" and "We reply within 2 hours during office hours (Mon–Fri 7am–6pm)" in the trust strip, under the form and in the closing line; meta descriptions "reply in 2 hours, Mon–Fri 7am–6pm"; `/thank-you/` "will follow up within 2 hours during office hours (Mon–Fri 7am–6pm)". The site side is consistent.
- The risk is the ad side. `src/data/landing.ts` lines 25-32 say these strings come from the client's Google Ads copy document (30 Sep 2026), that "the ads quote this text and Google checks the page against them, so every string is the document's wording exactly: do not tidy it". Commit 5eba139 (#88, 7 Nov) qualified it; nothing in the repo shows the ad assets (headlines, descriptions, callouts, sitelinks) were changed to match. If an ad still says "Reply in 2 hours" without the hours, the ad promises more than the landing page, which is a misleading-claim risk with users and in Ads review.
- Recommendation: Ads owner checks every asset that mentions the reply time and either adds "Mon–Fri" or removes the time; record the outcome in `src/data/landing.ts`.

### R2. The paid landing pages were never audited. Medium (process)
- Evidence: not in the crawl (D1), not in the lab set (performance P3), not in the screenshots. The parse-time GTM load is live there (288 ms, section 1), so gtm.js (~157 KB) and the Google tag compete with the LCP image on exactly the pages Ads traffic lands on. The homepage with `?gclid=` behaves the same (373 ms).
- Recommendation: add both `/lp/` URLs (with and without `?gclid=test`) to the crawl and the Lighthouse set of the next audit, with Google hits blocked; compare LCP and TBT with the organic variant. The field figure (LCP p75 0.80 s, n=9) is too small to clear it.

### R3. A published rate exists but the organic cost guide says there is none. Medium (client decision)
- Evidence: D8. The cost guide says its figures are "not an Evergreen price, quote or verified market rate" while the paid pages state "From $30/hr, supplies and equipment included". The price-seeking persona (sxo, 51/100, the weakest) and geo G1 both hinge on a number; the HomeStars benchmark sxo found is "$30 to $60 per hour", the same floor.
- Recommendation: ask the client whether "from $30/hr, supplies included" may appear on `/office-cleaning-cost-toronto-guide/` and `/request-a-quote/` with the same small print. If yes, it is the fastest available fix for G1 and sxo #1; if no, record why in `src/data/process.ts` so the next audit does not ask again.

### R4. Offer-page area links missed the 44 px pass. Low
- Evidence: section 1, item 15. `/services/janitorial-services/` and `/services/office-cleaning/` (both rendered by `src/components/OfferPage.astro`) have 24 px service-area links in `<main>` and 30 px breadcrumb links at 360 px with a coarse pointer. This predates #91 (office-cleaning has it too), so it is a Phase A gap, not a regression from the other contributor.
- Recommendation: apply the footer's `(width <= 767px), (pointer: coarse)` sizing to the offer-page area list and the breadcrumb.

### R5. HTML charset rules in `public/_headers`: no defect found. Info
- Checked live: `/`, `/thank-you/`, both `/lp/` pages and `/services/janitorial-services/` send one `content-type: text/html; charset=utf-8`; `/rss.xml` stays `application/xml`; `/robots.txt` `text/plain; charset=utf-8` (own rule, D7); `/feed/` is a 301 to `/rss.xml` and carries the HTML type, which the `_headers` comment documents as harmless. The 404s for `/janitorial-services/`, `/services/janitorial/` and similar return the HTML type. No duplicated header. `tests/build/schema-layout.test.ts` guards the rule set.

### R6. Paid-visit loader: cookie branch is sticky. Info
- `src/lib/gtm-loader.ts` `paidVisit()` returns true whenever an `_gcl_aw`, `_gcl_gb` or `_gcl_ag` cookie exists, so any visitor who once arrived from an ad loads GTM at parse time on every later organic page for the cookie's life (90 days by default). Intended for call tracking; it means the organic lab numbers do not describe these returning visitors. No action, but the next performance run should know it.

### R7. Week 3 quote checklist post: no new defect beyond the specialists' findings. Info
- Checked: both cited sources return 200 (CCOHS cleaning-products page, WSIB clearances page); the post is in `/rss.xml`; no "Week 3" or series label leaks into the page; BlogPosting is valid (schema). Its unevidenced "We carry WSIB Ontario coverage and liability insurance, with bonded, background-screened staff" is covered by content finding 2.

### R8. Janitorial page FAQ markup matches the visible questions. Info
- schema listed this as not verified. The 7 FAQPage questions in the JSON-LD equal the 7 visible `<summary>` texts on `/services/janitorial-services/`. No `& Janitorial` remains in any title or `og:title` after the commercial-cleaning retitle; `llms.txt` describes the commercial page as "retail, institutional and mixed-use premises".

### R9. Legacy janitorial URL still redirects to office cleaning. Info
- `src/data/redirects.ts` line 118 sends `/office-cleaning-and-janitorial-toronto/` to `/services/office-cleaning/` (live: one 301 to that URL). Now that a janitorial page exists, the target is a judgement call. Leave it unless Search Console shows the old URL still earning janitorial queries.

## 4. Needs the client or an account owner (new from this review)
- Google Ads owner: check every ad asset that names the reply time against the qualified landing-page wording (R1).
- Client: decide whether "from $30/hr, supplies included" may appear on the organic cost guide and quote page (R3).
- Client: confirm Durham service, or approve softening the FAQ and `areaServed` (D6).

## 5. Not verified
- Whether the build-dependent tests under `tests/build/` exercised a fresh build (the suite passed, but I did not run `npm run build` first).
- Ad copy in the Google Ads account (no access).
- Tap sizes on offer pages other than janitorial and office-cleaning, and on location pages.
- The CAPTCHA error message with fallback links (needs a form submit, forbidden).
- LCP and TBT of the `/lp/` pages in the lab (R2): observed only the timing of the gtm.js request.

# RECOMMENDATIONS.md — competitor comparison pages for Evergreen Office Cleaning

Research date 2026-10-28. Companion files: COMPARISON-PAGE.md (page spec), comparison-schema.json (JSON-LD), KEYWORD-STRATEGY.md (terms and SERP evidence).

---

## 1. Build order

| # | Item | Why now | Effort |
|---|---|---|---|
| 0 | **Pre-launch fixes on Evergreen's side**: (a) adopt and publish a written service guarantee (the matrix otherwise shows JAN-PRO with one and Evergreen without); (b) obtain the live Google Business Profile rating + review count or leave that row as "see our Google reviews" with a link; (c) owner decision on whether any from-price goes on organic pages. | The page exposes these gaps; fix them before a competitor's reader sees them. | Small (copy + decision) |
| 1 | **Publish `/franchise-vs-local-commercial-cleaning-company-toronto/`** per COMPARISON-PAGE.md, with the JSON-LD in comparison-schema.json, named author, disclosure, methodology box and dated sources. | Only buyer-intent competitive query where a local page can realistically rank; doubles as the sales-enablement answer to "why not the franchise?". | 1 long post + table component |
| 2 | **Support posts that link to and from #1**: `/wsib-clearance-certificate-cleaning-contractor-ontario/`, `/commercial-cleaning-contract-checklist-toronto/` (the nine questions as a checklist), `/how-much-does-office-cleaning-cost-in-toronto/` (price drivers; from-price only if decided in #0c). | Each captures a long-tail from Group A and strengthens the hub. | 3 short posts |
| 3 | **Directory presence** for "best/office cleaning companies toronto": claim and complete HomeStars, Bark, threebestrated.ca (which currently lists JAN-PRO Toronto), Google Business Profile reviews drive. | Directories own those SERPs; being on them beats publishing a self-serving "best" list. | Ongoing |
| 4 | **Conditional Phase 2 — `/evergreen-vs-franchise-office-cleaning-toronto/`** (head-to-head, trademark-free slug, JAN-PRO named in H2/table only). Build only if Search Console shows "jan-pro" queries landing on #1, and after a legal glance. Could also be the PPC landing page (§6). | Zero organic demand today for "evergreen vs jan-pro"; #1 already carries the matrix. | 1 post |
| — | **Do not build**: "JAN-PRO alternatives in Toronto" roundup; anything about complaints, reviews or franchisee disputes. | Wrong audience (franchise investors / data aggregators), competitor exposure, maintenance burden, goodwill risk. | — |

---

## 2. Keeping the page accurate — quarterly review (first review 3 months after launch)

Checklist to run each quarter and after any JAN-PRO site redesign:

1. Re-open every URL in the matrix's source column and the methodology box. Save raw copies to `…/raw/competitor-pages/` with the date (same procedure used on 2026-10-28).
2. Re-verify these volatile cells: from-price ("$250 a month" on https://jan-pro.ca/en/why-choose-jan-pro/), guarantee wording (why-choose and get-an-estimate pages), Toronto – West address/phone/service list (https://jan-pro.ca/en/office/toronto-west/), office count ("29 local offices" on how-jan-pro-canada-works vs "30+ Locations Nationwide" on get-an-estimate — JAN-PRO's own pages disagree; quote one and cite it), Entrepreneur ranking year, GTA office list in the jan-pro.ca locations menu, green-product claims.
3. Re-verify Evergreen cells against the live site (hours, service area list, product line, guarantee text, GBP rating).
4. Update "Last reviewed" on page and `dateModified` in schema; log changes in a short changelog at the bottom of the page or in the repo.
5. If a cited page disappears, replace the cell with "Not publicly available (page removed {date})" rather than keeping stale text.
6. Honour any correction request from JAN-PRO or a franchisee within one business day; keep the email thread.
7. Watch Search Console for queries containing "jan-pro"/"janpro"; if they appear, consider Phase 2 (§1 #4).

Ownership: name one person (the page author) as accountable; put the quarterly date in the company calendar.

---

## 3. Schema

- Emit exactly what is in comparison-schema.json: **BlogPosting + FAQPage + BreadcrumbList** in one `@graph`, Person author (fallback to the site's Organization author if no named person is approved), `citation` and `mentions` arrays carrying the JAN-PRO/Coverall/Anago/ServiceMaster URLs.
- **Do not add** Product, Review, AggregateRating or any rating markup — service business, and ratings for a competitor would be both fabricated and a Google review-snippet policy breach. `src/lib/schema.ts` already documents this stance for the business's own graph; extend `articleSchema()` with optional `author: Person`, `citation`, `mentions`, `about` rather than hand-coding.
- **No ItemList** unless a genuine roundup is built later.
- FAQ answers in the schema must match the visible FAQ text verbatim; keep the "read 2026-10-28" dates inside the answers so the markup is as dated as the page.
- Replace every `REPLACE_` placeholder and strip the `_notes` object before emitting.

---

## 4. Conversion suggestions

1. **Publish a written Evergreen guarantee** (e.g. "scheduled visits completed as agreed; any reported issue addressed within one business day; if not, that visit is on us"). It closes the only row where JAN-PRO is clearly ahead and gives the sales team a like-for-like answer. Wording is the owner's call; keep it something operations can honour.
2. **"Compare us" quote path**: on `/request-a-quote/` add an optional field "Are you comparing quotes? Paste the scope you were given" — lets Evergreen quote on identical scope, which is the page's central advice.
3. **Printable "Nine questions" PDF/HTML** gated lightly (no form) — a shareable artefact that carries Evergreen's name into procurement conversations.
4. **CTA discipline** as specified: one text link above the fold, a button after the matrix, a button in the verdict, nothing beside competitor descriptions.
5. **Proof, not adjectives**: show the WSIB clearance certificate and certificate-of-insurance as the documents a buyer should ask for, with Evergreen's own available on request — turns a due-diligence step into a conversion step.
6. **Measure**: track `/request-a-quote/` submissions and calls with the referrer set to this page; add a UTM to the button links; review at the quarterly check.

---

## 5. Internal linking and site fit

- Post lives in `src/content/blog/` and renders at `/{slug}/` via `src/pages/[slug].astro` (matches the 38 existing posts); appears in `/insights/` and the RSS feed automatically.
- Contextual links to `/services/office-cleaning/`, `/our-process/`, `/request-a-quote/`, `/locations/`, `/green-clean-products/`, `/about-us/`, `/locations/mississauga/` and `/locations/toronto-downtown/` as mapped in COMPARISON-PAGE.md §7.
- Add a reciprocal "Related reading" link from `/services/office-cleaning/` and `/our-process/` to the new post so it is not an orphan on day one.

---

## 6. PPC tie-in — bidding on competitor brand terms

**What Google's policy says (read 2026-10-28, https://support.google.com/adspolicy/answer/6118):** Google reviews trademark use only on complaint, and only where "the trademark must be used in the ad, not only on the ad's landing page." The policy lists "Using trademarks as keywords" among uses that are *not* restricted, and lists "Using trademarks in an ad from a direct competitor" and "confusing, deceptive, or misleading" uses among those that *may be restricted* on complaint. Restrictions, once applied, attach to the advertiser's second-level domain going forward.

**Canadian law:** keyword bidding on a competitor's mark is not settled in Canada (search surfaced commentary describing it as "the unsettled debate over trademark keywords"; not opened). Risk rises sharply when the *ad text* could confuse a searcher about who is advertising. Get counsel's view before any brand-term campaign; this file is not legal advice.

**Recommended stance (if the owner wants to test):**
- Separate, low-budget campaign; exact/phrase match on `jan-pro toronto`, `jan pro office cleaning toronto`, `jan-pro mississauga`; negative-match `franchise`, `jobs`, `careers`, `reviews`, `complaints`, `cost to open`.
- **Ad copy never contains "JAN-PRO"**, no display-URL path with the mark, no sitelink using it, no "official"/"authorized"/"alternative to JAN-PRO" phrasing. Copy sells Evergreen on its own facts: "Local Toronto office cleaning since 1989 · Same crew · One account executive · Free walkthrough".
- Landing page: the Phase 1 comparison page (or the Phase 2 head-to-head if built). The page's disclosure and sourced table make the destination clearly non-affiliated.
- Monitor for a trademark complaint; if one arrives, pause and review rather than argue — the downside (a domain-wide restriction) outweighs the small volume.
- Do **not** bid on `jan-pro reviews`/`complaints` terms; intent is wrong and the association is negative.

---

## 7. Risk note (short)

| Risk | Mitigation |
|---|---|
| **Trademark / affiliation** — using "JAN-PRO" in a URL or title could be read as implying affiliation or as depreciating goodwill (Trademarks Act s.22) or as a false/misleading statement discrediting a competitor (s.7(a)); misleading representations (Competition Act s.52). | Phase 1 keeps the mark out of slug/title; body use is descriptive and truthful with linked, dated sources; no logos or stylised marks; explicit "we compete with…" disclosure; legal glance before any page that names the brand in a title/URL. |
| **Defamation / unfair statements** | Only quote what JAN-PRO publishes; use "Not publicly available"; never characterise service quality ("we have not used JAN-PRO's service and make no claim about its quality"); no complaint content; no third-party ratings that were not opened and dated. |
| **Stale data** | Quarterly review (§2); "Last reviewed" visible; raw snapshots kept. |
| **Franchisee variability** | Statements describe the published model and the Toronto – West page, not any individual CBO; say so in the table footnote. |
| **Self-inflicted comparison** | Fix Evergreen's guarantee gap and GBP figure before launch so the honest table does not favour the competitor on the two rows buyers read first. |
| **Review/ratings schema** | None emitted; schema.ts stance retained. |
| **Paid offer leakage** | Keep the paid-only offer (first month free, from $30/hr, 30 days' notice) off organic pages unless the owner decides to make it public with conditions and an "as of" date. |

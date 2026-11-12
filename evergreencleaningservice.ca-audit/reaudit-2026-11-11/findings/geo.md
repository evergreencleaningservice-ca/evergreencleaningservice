Score: 73/100
Previous: 72/100 (re-audit 7 Nov)

# GEO / AI Search Readiness, third audit: www.evergreencleaningservice.ca (11–12 Nov 2026)

Method:
- Passage-level analysis of `<main>` in the saved crawl HTML (`raw/crawl/pages.json`, 94 URLs, re-decoded from the Latin-1 artefact). I covered 20 pages: home, 4 service pages (office, commercial, janitorial, building maintenance), 2 industry pages, /about-us/, 5 guides, 4 location pages, and the quote, contact and process pages.
- A sitewide scan of visible text, titles, meta descriptions, og tags and JSON-LD for the 2-hour reply wording, `Person`, `VideoObject` and `msvalidate.01`.
- `raw/robots.txt`, `raw/llms.txt`, `public/llms.txt` and `tests/llms-sync.test.ts`. I ran the test read-only with `npx vitest run tests/llms-sync.test.ts`: 20 of 20 pass.
- Live requests, 1 s apart, about 22 in total:
  - `/robots.txt` and `/llms.txt`. Both are byte-identical to `raw/`, and llms.txt is also identical to `public/llms.txt`. The first robots.txt fetch was reset by the peer (curl 56); the retry returned 200.
  - `/llms-full.txt`, `/license.xml` and `/.well-known/ai.txt`.
  - 7 crawler user agents against the 2 new URLs.
  - A Playwright (Node) render of the 2 new URLs with JavaScript on and off. Analytics, Ads, `/cdn-cgi/rum`, reCAPTCHA and `/api/` requests were aborted.
  - 1 Wikipedia search (via WebFetch).
- Nothing below is a measured AI-visibility figure. No DataForSEO or answer-sampling tool was available.

## Score breakdown

| Dimension | Weight | Was | Now | Why |
|---|---|---|---|---|
| Citability | 25% | 77 | 80 | All three wrong or weak sentences that engines could lift from the site on 7 Nov are fixed: N1 (area count), N2 (contract claim and unqualified reply) and N4 (duplicate definition). The new quote-checklist guide opens with a definition. Each of its 5 question H2s is answered directly in the first sentence, and it cites CCOHS and WSIB. The new janitorial page opens "Janitorial services are the scheduled upkeep of a building…". Still missing: a real price on the cost guide and any countable first-party fact. |
| Structural readability | 20% | 84 | 85 | The quote checklist has 5 question H2s out of 8. The janitorial page has 1 of 17, and its topical H2s are declarative (N9). building-maintenance, medical-dental-clinics and property-management still have 0 question H2s. 9 of 11 location pages keep the templated first sentence. "What is included" still goes straight into a list on every offer page. |
| Multi-modal | 15% | 50 | 50 | The photo heroes on the 13 offer pages (#93) are stock photos (images.md N8), not first-party evidence. There are 0 `VideoObject` nodes. |
| Authority & brand | 20% | 49 | 50 | +1 because the new guide cites two primary Canadian sources, and Phase A either cited or removed unsourced blog claims. Still 0 `Person` and 0 `reviewedBy`. All 5 guides are bylined "By Evergreen Office Cleaning". sameAs and footer profiles still use the old name. Wikipedia still has no article. |
| Technical accessibility | 20% | 91 | 92 | llms.txt now matches the site and a test guards it. Every crawler user agent tested got 200 with an H1 on both new URLs. SSR parity is confirmed on both. No nosnippet on any of the 94 URLs. |

Weighted: 20.0 + 17.0 + 7.5 + 10.0 + 18.4 = 72.9, rounded to **73**.

## AI crawler access (live, 12 Nov)

robots.txt is the same policy as on 7 Nov: a wildcard group and a named group, both `Allow: /`, each with `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. The agents were spoofed from this container, so these results prove the robots and origin policy, not how Cloudflare treats verified bot IPs.

Each user agent below fetched `/commercial-cleaning-quote-checklist/` (104,588 bytes) and `/services/janitorial-services/` (129,635 bytes). Where a row says "200 + H1", both URLs returned 200 and contained an H1.

| Crawler | Governs | Result |
|---|---|---|
| Googlebot | Google Search, AI Overviews and AI Mode inclusion | Allowed (named); 200 + H1 |
| OAI-SearchBot | ChatGPT search citability | Allowed (named); 200 + H1 |
| Claude-SearchBot | Claude search citability | Allowed (named); 200 + H1 |
| PerplexityBot | Perplexity index | Allowed (named); 200 + H1 |
| Bingbot | Bing index, which feeds Copilot | Allowed (named); 200 + H1 |
| Applebot | Siri, Spotlight, Safari | Allowed (named); not fetched this run |
| GPTBot | OpenAI training only, not ChatGPT search | Allowed (named); 200 + H1 |
| ClaudeBot | Anthropic training only, not Claude search | Allowed (named); 200 + H1 |
| Google-Extended | Gemini/Vertex training and grounding; not Search or AIO inclusion | Allowed (named; robots token, not a fetcher) |
| Applebot-Extended | Apple Intelligence training only | Allowed (named; robots token) |
| CCBot, Bytespider, meta-externalagent, cohere-ai | Training corpora | Allowed (wildcard) |

## llms.txt and licensing

- `/llms.txt` returns 200, `text/plain; charset=utf-8`, 6,530 bytes (5,164 on 7 Nov). It is spec-shaped.
- **Sync test: both new URLs are listed.**
  - `/services/janitorial-services/` is under `## Services`, described as "scheduled day-to-day upkeep… after hours, by the same crew".
  - `/commercial-cleaning-quote-checklist/` is the first entry under `## Guides`.
  - All 11 location pages and the hub are under `## Service areas`, and all 4 guides published in 2026 are under `## Guides`.
- `tests/llms-sync.test.ts` checks:
  - location pages against `src/data/locations.ts`;
  - 2026 posts with `guide:` front matter against `src/content/blog/`;
  - the coverage sentence;
  - the office-hours qualifier on every "within 2 hours".
- The quote checklist has `guide:` front matter, so the test covers it. The janitorial page is listed by hand: the test does not read `## Services` or `## Who we clean for` (N7).
- `/llms-full.txt`, `/license.xml` and `/.well-known/ai.txt` all return 404, and there is no RSL `License:` line. The Content-Signal lines already state permissive terms. llms.txt carries no weight in the score.

## Platform readiness (auditor's heuristic, not measured)

| Platform | Readiness /100 | Was | Note |
|---|---|---|---|
| Google AI Overviews | 71 | 70 | Eligible: Googlebot allowed, SSR, self-canonical, no nosnippet. The question-led quote checklist is a strong new candidate. Citation follows ranking. |
| Google AI Mode | 65 | 64 | More dated, sourced guides help. Weak entity authority holds it back. |
| ChatGPT search | 57 | 56 | OAI-SearchBot gets the full page. No Wikipedia entity, and no confirmed Reddit or YouTube presence. |
| Perplexity | 60 | 58 | Two guides now cite Canadian government sources and answer each heading directly. |
| Bing Copilot | 58 | 58 | IndexNow is live, but none of the 94 URLs carries `msvalidate.01` and Bing Webmaster Tools verification is unconfirmed. |

## 1. Status of every finding in reaudit-2026-11-06/findings/geo.md (and critic.md items for geo)

| ID | Finding | Status | Evidence now |
|---|---|---|---|
| G1 / T1 / C1 | Cost guide gives no real price (High) | Open (needs client) | /office-cleaning-cost-toronto-guide/: the H2 "Why There Is No Single Office Cleaning Price" still opens "There is no single price that fits every Toronto office." The worked example still says "assume a charge of $150". No Evergreen price band. |
| G2 / T2 / S-Person | No named people; Organization authorship only (High) | Open (needs client) | 0 `Person` and 0 `reviewedBy` in the JSON-LD of all 94 URLs. All 5 guides have an Organization `author` and the byline "By Evergreen Office Cleaning", including the new quote checklist (published 10 Nov). |
| G3 / T3 | Weak off-site entity; sameAs under the old name (High) | Open (needs client) | Every page still links `facebook.com/Evergreen-Cleaning-Service-104007224426820`, `x.com/EvergreenClean8` and `linkedin.com/company/evergreen-cleaning-service-toronto/`. No YouTube. A Wikipedia search for "Evergreen Office Cleaning" (12 Nov) returns "There were no results matching the query". |
| G4 / §4 | llms.txt gaps: guides, reply qualifier, charset, residential line (Medium) | Fixed | Live /llms.txt: both "within 2 hours" mentions are followed by "during office hours (Monday to Friday 7am–6pm)". The guides, charset, "For assistants and agents" section and "Not offered: residential" line are all present. |
| G5 / C5 | Homepage: no definitional sentence, Trustindex boilerplate, generic "why" (Medium) | Fixed | `/` opens "Evergreen Office Cleaning is a Toronto commercial cleaning company, founded in 1989, …". The "why" intro now reads "Four commitments we make to every client: …". |
| G6 / C2 | Service pages: non-question headings, definition placement (Medium) | Partly fixed | /services/office-cleaning/ has 4 question H2s, and the definition now appears once, under "What is office cleaning?". Still open: every offer page's "What is included" goes straight into a list ("Trash and recycling emptied…"). /services/building-maintenance/ has 0 question H2s and still opens with the fragment "The periodic work that keeps a building looking maintained…". |
| C3 | Commercial "products" and "where" sections lack lead sentences | Fixed | /services/commercial-cleaning/ "Where does Evergreen clean commercial property?" opens "Evergreen Office Cleaning cleans commercial premises across Toronto and nine other GTA municipalities from one office at 243 Queen St W". |
| G7 / T4 / C4 | Few first-party facts (Medium) | Partly fixed | The /about-us/ "at a glance" block is still there, with a qualified reply line. There is still no countable fact (buildings, staff, client tenure, inspections) and no fact block on `/`. |
| G8 / S-Video | Generic multi-modal content; no topical video (Medium) | Open (needs client) | 0 `VideoObject`. The new offer-page heroes are stock gallery photos (images.md N8). |
| S-Logo | `logo` and `image` are both the banner | Open (needs client assets) | `/` ProfessionalService `logo` and `image` are both `…/cropped-evergreen-cleaning-toronto-logo-banner.jpg`. |
| S-Area | areaServed must match the GBP service area | Open (needs account owner) | `areaServed` is now derived from `coverage.ts` (Phase A). The GBP service area cannot be seen from here. |
| S-Keep | Keep FAQPage and BlogPosting; do not add aggregateRating or HowTo | Not applicable (complied) | FAQPage on 25 URLs and BlogPosting on 25. 0 `aggregateRating`, 0 `HowTo`. |
| C6 | Location pages: question-led FAQs | Fixed | Still in place. For example, North York's FAQ answer opens "Yes. North York Centre is covered." |
| G9 / A2 | Named group does not inherit wildcard Disallows (Info) | Not applicable (no defect) | Live robots.txt is byte-identical to `raw/robots.txt`, with the same policy. All 7 agents got 200 on both new URLs. |
| A1 | Cloudflare AI Crawl Control and verified-bot treatment | Open (needs account owner) | Cannot be checked from here; spoofed agents only. |
| G10 | No llms-full.txt, ai.txt or RSL (optional) | Open (optional) | `/llms-full.txt`, `/license.xml` and `/.well-known/ai.txt` all return 404 live. |
| G11 / T5 | Freshness: keep guides dated and sourced (Low) | Partly fixed | The new guide is dated 2026-11-10 and cites sources. But the cost guide was edited substantively on 7 Nov (title, unsourced claims) and still shows `dateModified` 2026-10-31 (N8). |
| G12 | Bing/Copilot plumbing not confirmed (Low) | Partly fixed | IndexNow is live (7 Nov). 0 of 94 URLs carry `msvalidate.01`, so Bing Webmaster Tools verification is unconfirmed. |
| §2 | Search Console "Search generative AI" control | Open (needs account owner) | Not visible from here. |
| §7 | SSR parity | Not applicable (no defect; re-confirmed) | `<main>` words with JavaScript off vs on: `/commercial-cleaning-quote-checklist/` 1,726 vs 1,726 (8 H2s and 6 `<details>` both ways); `/services/janitorial-services/` 2,746 vs 2,746 (17 H2s, 7 `<details>`). The #93 hero adds no client-only content. |
| N1 | Commercial page miscounts the service area (Medium) | Fixed | Live: "Toronto and nine other GTA municipalities". |
| N2 | Homepage "written into every contract since 1989" and unqualified 2-hour reply (Medium) | Fixed | `/`: "…and a reply to every enquiry within 2 hours during office hours (Monday to Friday 7am–6pm)". "Written into every contract" appears 0 times. Sitewide there are 102 visible "2 hours" mentions, and all 102 carry an office-hours or Mon–Fri qualifier. None is unqualified in titles, meta descriptions, og or JSON-LD. The hero badge now reads "A reply within 2 hours, Mon–Fri 7am–6pm"; the guides say "An account executive replies within 2 hours during office hours, Mon–Fri, 7 a.m.–6 p.m.". |
| N3 | llms.txt stale (Low) | Fixed | All 11 location pages, the checklist and the quote checklist are listed. `tests/llms-sync.test.ts` passes 20/20. |
| N4 | Office-cleaning definition duplicated (Low) | Fixed | The /services/office-cleaning/ intro is now an offer line ("Nightly, a few evenings a week or weekly cleaning for Toronto and GTA offices…"). The definition appears once, under the H2. |
| N5 | Question-led structure stopped at two service pages (Low) | Open | building-maintenance has 0 question H2s and the fragment opener. medical-dental-clinics has 0 and opens "Patients judge a clinic before they see a clinician." property-management has 0. North York, Durham Region and Downtown still open "Evergreen Office Cleaning provides commercial and office cleaning in <place> as part of its coverage across the Greater Toronto Area…". |
| N6 | Newest guide carries no sources or reviewer (Info) | Open | /office-cleaning-checklist/ has 0 external links in `<main>` and no reviewer. The newer quote checklist does cite sources, which shows the pattern. |
| critic D3 | IndexNow conflict between technical and geo | Not applicable (resolved) | geo G12 stands: IndexNow is live. Acceptance status sits with the technical findings. |
| critic D8 | llms.txt severity: geo Low vs local Medium | Not applicable (moot) | N3 is fixed. |
| critic D9 | Baseline label | Not applicable (complied) | This brief sets "Previous" to the 7 Nov re-audit (72). |

Counts: Fixed 8 (G4, G5, C3, C6, N1, N2, N3, N4). Partly fixed 4 (G6, G7, G11, G12). Open 11 (G1, G2, G3, G8, S-Logo, S-Area, A1, G10, §2, N5, N6). Regressed 0. Not applicable 6 (S-Keep, G9, §7, D3, D8, D9).

## 2. New findings

None is Critical or High. The other contributor's two pages caused no regression in GEO terms. Both are server-rendered, crawlable, listed in llms.txt and use the qualified reply.

### N7. The llms.txt sync test does not cover services or industries (Low)

- **Evidence:** `tests/llms-sync.test.ts` checks `## Service areas` against `src/data/locations.ts` and `## Guides` against 2026 `guide:` posts. Nothing checks `## Services` against `src/content/services/*.md` (11 files) or `## Who we clean for` against `src/content/industries/*.md` (2 files).
  - `/services/janitorial-services/` (#91) is in llms.txt today only because someone added it by hand.
  - The next service or industry page can be missed silently, which is how N3 happened.
- **Recommendation:** Add a `describe` block to `tests/llms-sync.test.ts` that requires every slug in `src/content/services/` under `## Services` and every slug in `src/content/industries/` under `## Who we clean for`.

### N8. The cost guide was edited on 7 Nov but still reports dateModified 2026-10-31 (Low)

- **Evidence:** Commit 6f4f4de (7 Nov, "cost guide title, unsourced claims, internal links") changed `src/content/blog/office-cleaning-cost-toronto-guide.md`. The front matter still has only `pubDate: 2026-10-31`, and the live BlogPosting shows `dateModified` "2026-10-31T00:00:00.000Z".
  - The same commit touched other posts. The 5 posts that already carry `updatedDate` show the mechanism works.
  - Engines that weigh freshness (Perplexity, AI Mode) see a guide that has not changed since it was published.
- **Recommendation:** Add `updatedDate: 2026-11-07` (the field is defined in `src/content.config.ts` line 17) to the cost guide, and to any other post 6f4f4de changed substantively. Do not bump posts that changed only in wording, such as the reply qualifier in 5eba139.

### N9. The new janitorial page is weaker at extraction than the office page (Low)

- **Evidence:** `/services/janitorial-services/` (#91, other contributor) opens with a good definition.
  - Only 1 of its 17 H2s is a question ("Janitorial services or commercial cleaning?").
  - The topical H2s are phrased as statements: "What janitorial services are", "How often janitorial service should visit", "How a janitorial contract starts".
  - "Products and safety" says only "an approved line of professional green cleaning products". The office and commercial pages, /about-us/ and llms.txt all name Armstrong Manufacturing ProSeries Green and ECOLOGO.
  - "What is included" starts with a list, as on every offer page.
- **Recommendation:** In `src/content/services/janitorial-services.md`:
  - Rename the H2s to "What are janitorial services?", "How often should janitorial service visit?" and "How does a janitorial contract start?".
  - Open "Products and safety" with "Evergreen Office Cleaning uses Armstrong Manufacturing's ProSeries Green line, third-party certified to UL Environment (ECOLOGO) standards…".
  - Give "What is included" one lead sentence, such as "A janitorial visit from Evergreen covers:".

### N10. The commercial and janitorial pages both define "janitorial services" (Info)

- **Evidence:** The `/services/commercial-cleaning/` intro and its H2 "What commercial cleaning and janitorial services are" both define janitorial services, as does `/services/janitorial-services/`. The definitions agree ("the scheduled part of it" and "the scheduled upkeep of a building"), so nothing contradicts, but two pages are competing to be the cited definition. The commercial H2 is also not phrased as a question.
- **Recommendation:** In `src/content/services/commercial-cleaning.md`, rename the H2 to "What is commercial cleaning?". Keep janitorial to one clause that links `/services/janitorial-services/`, so the janitorial page owns that definition.

### N11. The new quote checklist is the best-structured page for AI extraction (Info, positive)

- **Evidence:** `/commercial-cleaning-quote-checklist/` opens "A commercial cleaning quote checklist helps you confirm what your building will receive before you agree to a price."
  - Each of its 5 question H2s opens with a direct answer, for example "A complete quote should identify the premises, tasks, frequency, service hours, supplies, price, exclusions and responsibilities on both sides."
  - It cites CCOHS (cleaning products) and WSIB (clearances), has 6 `<details>` FAQs, and the same 6,000 sq ft example as the other guides.
  - It has no unsourced percentages and no reviewer.
- **Recommendation:** Use it as the template for N5. Add the named reviewer once G2 is resolved.

## 3. What still needs the client or an account owner

- Real price bands from recent proposals for the cost guide, with a "pricing data reviewed" date (G1).
- Names, roles and years for the owner and account executive, for /about-us/, `Person` schema and a reviewer line on the 5 guides (G2).
- Countable first-party facts with an "as of" date: buildings cleaned, staff, average client tenure, inspections per month (G7).
- Renaming the Facebook, LinkedIn and X display names to "Evergreen Office Cleaning" with a "formerly Evergreen Cleaning Service" line. Claiming or correcting GBP, Bing Places, Apple Business Connect, Yelp, YellowPages, BBB, HomeStars and Clutch listings under the current name and exact NAP (G3).
- Real job photos to replace the stock heroes on the 13 offer pages, two or three short YouTube clips with transcripts for `VideoObject`, and a square logo file (G8, S-Logo).
- Cloudflare: AI Crawl Control set to allow verified AI crawlers, "managed robots.txt" off, and a check of the crawler log for real OAI-SearchBot, Claude-SearchBot and PerplexityBot hits on the 2 new URLs (A1).
- Search Console: confirm the "Search generative AI" control and that `/services/janitorial-services/` and `/commercial-cleaning-quote-checklist/` are indexed (§2).
- Bing Webmaster Tools: site verified, sitemap submitted, IndexNow submissions accepted (G12).
- Confirm that the GBP service area matches the 10 `areaServed` places (S-Area).

## 4. Not verified

- Live AI answers or citations on any platform (no DataForSEO or answer-sampling tool).
- How Cloudflare treats real bots. All user-agent tests were spoofed. Applebot was not fetched this run.
- Wikidata (only Wikipedia was searched), Reddit and YouTube brand presence. These are carried forward from earlier audits as "none found", not re-checked.
- LinkedIn, Facebook and X display names, backlinks, and third-party brand mentions.
- Bing Webmaster Tools verification by DNS. Search Console settings and index status for the 2 new URLs.
- Whether each 6f4f4de edit to posts other than the cost guide was substantive enough to warrant `updatedDate`.

## audit-data.json (AI Search Readiness), JSON-compatible

```json
{
  "category": "AI Search Readiness",
  "score": 73,
  "previous_score": 72,
  "dimensions": {"citability": 80, "structural_readability": 85, "multi_modal": 50, "authority_brand": 50, "technical_accessibility": 92},
  "crawlers": {"OAI-SearchBot": "allowed, 200", "Claude-SearchBot": "allowed, 200", "PerplexityBot": "allowed, 200", "Googlebot": "allowed, 200", "Bingbot": "allowed, 200", "Applebot": "allowed (named)", "GPTBot": "allowed, 200 (training)", "ClaudeBot": "allowed, 200 (training)", "Google-Extended": "allowed (training/grounding)", "Applebot-Extended": "allowed (training)", "CCBot": "allowed via wildcard (training)"},
  "llms_txt": "present, well-formed, in sync: lists /services/janitorial-services/ and /commercial-cleaning-quote-checklist/; tests/llms-sync.test.ts 20/20 pass; services/industries sections not covered by the test",
  "status_counts": {"fixed": 8, "partly": 4, "open": 11, "regressed": 0, "na": 6},
  "findings": [
    {"id": "G1", "severity": "High", "status": "open", "title": "Cost guide gives no real price"},
    {"id": "G2", "severity": "High", "status": "open", "title": "No named people / Person schema"},
    {"id": "G3", "severity": "High", "status": "open", "title": "Weak off-site entity under current name"},
    {"id": "N7", "severity": "Low", "status": "new", "title": "llms.txt sync test does not cover services or industries"},
    {"id": "N8", "severity": "Low", "status": "new", "title": "Cost guide edited 7 Nov without updatedDate"},
    {"id": "N9", "severity": "Low", "status": "new", "title": "Janitorial page: declarative H2s, unnamed product line"},
    {"id": "N10", "severity": "Info", "status": "new", "title": "Janitorial definition on two pages"},
    {"id": "N11", "severity": "Info", "status": "new", "title": "Quote checklist is the model page (positive)"}
  ]
}
```

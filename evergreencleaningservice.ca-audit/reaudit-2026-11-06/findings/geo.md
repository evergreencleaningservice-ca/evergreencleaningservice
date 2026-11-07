Score: 72/100
Previous: 70/100 (first audit)

# GEO / AI Search Readiness re-audit: www.evergreencleaningservice.ca (2026-11-06, evening)

The baseline is `GEO-ANALYSIS.md` (70/100, written after the Phase 1–3 deploys). It superseded the morning `findings/geo.md` (66/100). Both sets of findings are tracked below.

Method:
- Passage-level analysis of `<main>` in the saved crawl HTML (`raw/crawl/pages.json`, 89 URLs, re-decoded from the Latin-1 artefact) for 16 money pages, guides and location pages.
- `raw/robots.txt` and `raw/llms.txt`.
- About 25 live requests, each 1 s apart:
  - 10 crawler user agents against `/office-cleaning-checklist/`.
  - `/llms.txt`, `/llms-full.txt`, `/license.xml`, `/.well-known/ai.txt` and the IndexNow key file.
  - A Playwright render of 4 pages with JavaScript on and off.
  - Wikipedia and Wikidata searches (via WebFetch, because the Wikimedia API returned 429 to this proxy).
  - A YouTube results page, which returned HTML I could not parse into results.
- Source read-only: commit 19b8e53 ("GEO copy fixes"), `public/llms.txt`, `src/content/services/*.md`, `src/components/home/WhyEvergreen.astro`, `package.json`.

The analysis tool here cannot measure live AI answers on any platform. Nothing below is a measured AI-visibility figure.

## Score breakdown

| Dimension | Weight | Was | Now | Why |
|---|---|---|---|---|
| Citability | 25% | 74 | 77 | Office page now has 4 question-led H2s, each opened by a direct answer. Commercial page "products" and "where" sections now start with a self-contained sentence naming the company. Homepage "why" intro is concrete. /about-us/ has an 8-line fact list. The new checklist guide opens with a definition. Still missing: a real price on the cost guide and any countable first-party fact. One extractable sentence is factually wrong (N1). |
| Structural readability | 20% | 82 | 84 | 4 question H2s on /services/office-cleaning/ and 3 on /services/commercial-cleaning/. All 11 location pages carry question-led FAQs answered "Yes. …" first. /services/building-maintenance/ and /industries/medical-dental-clinics/ still have 0 question H2s. "What is included" lists still start without a lead sentence. |
| Multi-modal | 15% | 50 | 50 | No change: stock imagery, 0 `VideoObject`. The only video is the sitewide LeadVideo avatar widget. |
| Authority & brand | 20% | 48 | 49 | +1 for the /about-us/ fact block, which states the former name, one office and coverage in one place (entity disambiguation). Still 0 `Person` nodes, no reviewer, and no new off-site entity. |
| Technical accessibility | 20% | 90 | 91 | Every AI and search crawler user agent got 200 with the full page. SSR is confirmed again after the #81/#82 reveal scripts. IndexNow is now live in the deploy. llms.txt is stale (N3), but it carries no weight. |

Weighted: 19.25 + 16.8 + 7.5 + 9.8 + 18.2 = 71.6, rounded to **72**.

### AI crawler access (live, 6 Nov evening)

robots.txt is unchanged since the first audit: a wildcard group plus a named group, both `Allow: /` with `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. Each user agent below fetched `/office-cleaning-checklist/` and got 200, 104,845 bytes, with an H1. The agents were spoofed from this container, so this proves robots and origin policy, not Cloudflare's handling of verified bot IPs.

| Crawler | Governs | Status |
|---|---|---|
| Googlebot | Google Search, AI Overviews and AI Mode inclusion | Allowed (named) |
| OAI-SearchBot | ChatGPT search citability | Allowed (named), 200 |
| Claude-SearchBot | Claude search citability | Allowed (named), 200 |
| PerplexityBot | Perplexity index | Allowed (named), 200 |
| Bingbot | Bing index, which feeds Copilot | Allowed (named), 200 |
| Applebot | Siri, Spotlight, Safari | Allowed (named), 200 |
| GPTBot | OpenAI training only, not ChatGPT search | Allowed (named), 200 |
| ClaudeBot | Anthropic training only, not Claude search | Allowed (named), 200 |
| Google-Extended | Gemini/Vertex training and grounding; not Search or AI Overviews inclusion | Allowed (named) |
| Applebot-Extended | Apple Intelligence training only | Allowed (named) |
| CCBot, Bytespider, meta-externalagent | Training corpora | Allowed (wildcard), 200 |

### llms.txt and licensing

- `/llms.txt`: 200, `text/plain; charset=utf-8`, 5,164 bytes, spec-shaped. It is stale (N3). It gets no weight in the score: Google does not use it, and no major engine has confirmed reading it.
- `/llms-full.txt`, `/license.xml` and `/.well-known/ai.txt`: all 404.
- No RSL `License:` line. The Content-Signal lines already state permissive terms.

### Platform readiness (auditor's heuristic, not measured)

| Platform | Readiness /100 | Note |
|---|---|---|
| Google AI Overviews | 70 | Eligible: Googlebot allowed, SSR, self-canonical, no nosnippet on any of 89 pages. Citation follows ranking, and the strongest candidates are the guides. |
| Google AI Mode | 64 | Fresh, dated guides help; weak entity authority holds it back. |
| ChatGPT search | 56 | OAI-SearchBot gets the full page. No Wikipedia, Reddit or YouTube presence. |
| Perplexity | 58 | Fresh, dated guides; the how-often guide cites three government sources "consulted in November 2026". |
| Bing Copilot | 58 | IndexNow is now live, but Bing Webmaster Tools verification is unconfirmed (no `msvalidate.01`). |

## 1. Status of first-audit findings

G# refers to morning `findings/geo.md`. T#, C# and S# refer to `GEO-ANALYSIS.md` sections 8, 10 and 9. A# refers to `GEO-ANALYSIS.md` section 3.

| ID | Finding | Status | Evidence now |
|---|---|---|---|
| G1 / T1 / C1 | Cost guide gives no real price (High) | Open (needs client) | /office-cleaning-cost-toronto-guide/: the H2 "Why There Is No Single Office Cleaning Price" still opens "There is no single price that fits every Toronto office." The only figures are "$100–$300 per visit is an arithmetic input" and a $150 worked example. No Evergreen price band. |
| G2 / T2 / S-Person | No named people; Organization authorship only (High) | Open (needs client) | 0 `Person` nodes and 0 `reviewedBy` in all 89 JSON-LD payloads. The guides' bylines read "By Evergreen Office Cleaning". /about-us/ (592 words) names nobody. The only person on the site is "Art" in a North York review quote. |
| G3 / T3 | Weak off-site entity; sameAs profiles under the old name (High) | Open (needs client) | Wikipedia search for "Evergreen Office Cleaning": "no results". Wikidata search: no items. sameAs and footer still point to `facebook.com/Evergreen-Cleaning-Service-104007224426820`, `x.com/EvergreenClean8` and `linkedin.com/company/evergreen-cleaning-service-toronto/`. No YouTube channel in sameAs. Display-name renames not verifiable. |
| G4 / §4 | llms.txt gaps: guides, reply qualifier, charset, residential line (Medium) | Partly fixed | Present: a `## Guides` section, `charset=utf-8`, a "For assistants and agents" section, and "Not offered: residential". Still present: "Replies to quote requests within 2 hours" with no office-hours qualifier. New gap: it omits the newest guide and 4 location pages (N3). |
| G5 / C5 | Homepage has no definitional sentence; Trustindex boilerplate ×7; generic "why" paragraph (Medium) | Fixed | `/`: the first paragraph is "Evergreen Office Cleaning is a Toronto commercial cleaning company, founded in 1989, providing recurring janitorial cleaning…". "Trustindex verifies" appears 0 times. The "Why Toronto businesses choose Evergreen" intro now lists four concrete commitments. That new copy overclaims (N2). |
| G6 / C2 | Service pages: non-question headings; office definition under the wrong H2 (Medium) | Partly fixed | /services/office-cleaning/ H2s are now "What is office cleaning?", "How often should an office be cleaned?", "Why does office cleaning matter for a business?" and "Who cleans the office, and are they screened?", each opened by a direct answer. Still open: "What is included" goes straight into a list ("Trash and recycling emptied…"). On /services/commercial-cleaning/, "Commercial spaces we clean" still comes before the definition H2, though the page intro already defines the term. /services/building-maintenance/ has 0 question H2s and opens with a sentence fragment ("The periodic work that keeps a building looking maintained…"). |
| C3 | Commercial "products" and "GTA" sections lack lead sentences | Fixed, with an error | /services/commercial-cleaning/ "What products does Evergreen use?" opens "Evergreen Office Cleaning uses Armstrong Manufacturing's ProSeries Green line…". "Where does Evergreen clean commercial property?" opens "Evergreen Office Cleaning cleans commercial premises across Toronto and ten GTA municipalities…", but the list after it has only nine besides Toronto (N1). |
| G7 / T4 / C4 | Few first-party facts (Medium) | Partly fixed | /about-us/ now has "Evergreen Office Cleaning at a glance" with 8 attributed facts (founded 1989, one office, commercial only, hours, WSIB/insurance/bonding/screening, products, 10 service areas, 2-hour reply). There is still no countable fact (buildings, staff, client tenure, inspections), and no fact block on the homepage. |
| G8 / S-Video | Generic multi-modal content; no topical video or VideoObject (Medium) | Open (needs client) | 0 `VideoObject` site-wide. The only `<video>` elements are LeadVideo (`/video/lead-net.mp4`, an avatar sales clip) on every page. Gallery images are still stock-style; images.md covers the captions. |
| S-Logo | `logo` and `image` are both the 884×265 banner | Open (needs client assets) | Homepage ProfessionalService `logo` and `image` are both `…/cropped-evergreen-cleaning-toronto-logo-banner.jpg`. |
| S-Area | areaServed must match the GBP service area | Open (needs account owner) | `areaServed` lists the same 10 City nodes (Toronto … Oshawa). The GBP service area cannot be seen from here. |
| S-Keep | Keep FAQPage and BlogPosting; do not add aggregateRating or HowTo | Not applicable (complied) | FAQPage on 24 pages, `aggregateRating` 0, `HowTo` 0. |
| C6 | Location pages: question-led FAQ consistency pass | Fixed | All 11 location pages carry question-led FAQs, for example North York "Do you clean offices in the towers at Yonge and Sheppard?", Richmond Hill "Do you clean offices in the Beaver Creek business park?". Answers open "Yes. …". The 4 new pages have 4 FAQs each. |
| G9 / A2 | Bot coverage; named group does not inherit wildcard Disallows (Low/Info) | Not applicable (no defect) | robots.txt is byte-for-byte the same policy. All 10 user agents tested got 200. The maintenance note still applies: any future Disallow must go in both groups. |
| A1 | Cloudflare AI Crawl Control and verified-bot treatment | Open (needs account owner) | Cannot be checked from here. Spoofed-agent 200s do not prove real GPTBot, OAI-SearchBot or Claude-SearchBot traffic gets through. |
| G10 | No llms-full.txt, markdown alternates, ai.txt or RSL (Low, optional) | Open (optional) | `/llms-full.txt`, `/license.xml` and `/.well-known/ai.txt` all 404. |
| G11 / T5 | Freshness: "Updated" bumps without substance; keep guides dated and sourced (Low) | Partly fixed | 5 older posts now have dateModified after datePublished. Two dated 2026-11-06 (`/commercial-cleaning-air-quality/`, `/areas-in-your-office-where-germs-are-likely-hiding/`) are the targets of today's merges, so the change is substantive. Three still show 2026-10-30 (`/how-to-decide-on-a-cleaning-company/`, `/cleaning-protocols-for-daycares-and-schools/`, `/robotic-vs-manual-cleaning-…`); I did not verify those edits. A new guide went out 2026-11-06. The how-often guide's sources say "consulted in November 2026". |
| G12 | Bing/Copilot plumbing not confirmed (Low) | Partly fixed | IndexNow is live: `/05031d78747205e65eb1ec4a04cc568d.txt` returns 200 `text/plain`, and `package.json` `deploy` ends with `npm run indexnow`. No `msvalidate.01` on `/`; Bing Webmaster Tools verification is unconfirmed. |
| §2 | Search Console "Search generative AI" control set to include | Open (needs account owner) | Not visible from here. |
| §7 | SSR parity | Not applicable (no defect; re-confirmed) | Playwright, JavaScript off vs on, `<main>` word counts: `/` 1,444 vs 1,444; `/services/office-cleaning/` 1,472 vs 1,472; `/office-cleaning-checklist/` 1,638 vs 1,638; `/locations/north-york/` 1,022 vs 1,022. Same H1 and `<details>` counts. The #81/#82 scroll-in reveal hides nothing from non-JavaScript crawlers. |

Counts: Fixed 3 (G5, C3, C6). Partly fixed 5 (G4, G6, G7, G11, G12). Open 9 (G1, G2, G3, G8, S-Logo, S-Area, A1, G10, §2). Regressed 0. Not applicable 3 (S-Keep, G9, §7). C3 counts as Fixed, but its new sentence carries the N1 error.

## 2. New findings

### N1. The purpose-built "where" sentence on the commercial page miscounts the service area (Medium)

- **Evidence:** /services/commercial-cleaning/ says "Evergreen Office Cleaning cleans commercial premises across Toronto and ten GTA municipalities from one office at 243 Queen St W: Toronto itself (…), Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax and Oshawa."
  - That list is Toronto plus nine. `areaServed`, /about-us/ and llms.txt all say ten places including Toronto.
  - This sentence was written to be lifted whole by AI engines, so the wrong count is the one they would quote.
  - The error came from the suggested copy in GEO-ANALYSIS.md §10 item 3 and went live in commit 19b8e53.
  - The sentence also links six location pages but names North York and Scarborough and lists Richmond Hill, Pickering, Ajax and Oshawa without linking their new pages.
- **Recommendation:** In `src/content/services/commercial-cleaning.md` (line 190), write "across Toronto and nine other GTA municipalities". Link `/locations/north-york/`, `/locations/scarborough/`, `/locations/richmond-hill/` and `/locations/durham-region/` where they are named.

### N2. The new homepage "why" intro states a claim the business cannot evidence (Medium)

- **Evidence:** `/` (from `src/components/home/WhyEvergreen.astro`) now reads "Four things, each written into every contract since 1989: the same crew at every visit, a scope agreed at a free walkthrough…, cleaning done after hours…, and a reply to every enquiry within 2 hours."
  - A reply time to enquiries cannot be a contract term.
  - "Written into every contract since 1989" is a historical claim nobody has evidenced.
  - The 2-hour reply is unqualified, but `/how-often-should-an-office-be-cleaned/` says "within two hours during office hours, Monday–Friday, 7 a.m.–6 p.m."
  - Engines attribute such sentences to the brand verbatim, and an inconsistent promise weakens trust signals.
- **Recommendation:** Change it to "Four commitments we make to every client: …, and a reply within 2 hours during office hours (Mon–Fri, 7am–6pm)." Apply the same qualifier in `src/components/home/Hero.astro` ("A reply within 2 hours") and `public/llms.txt`. This was first-audit G4 and is still open.

### N3. llms.txt has not kept up with Phases 3–4 (Low)

- **Evidence:** `raw/llms.txt`, matching the live file and `public/llms.txt`:
  - `## Guides` lists the cost, how-often and seasonal guides but not `/office-cleaning-checklist/`, the newest and most extractable guide (daily/weekly/monthly tables).
  - `## Service areas` links 7 of the 11 location pages and omits North York, Scarborough, Richmond Hill and Durham Region.
  - GEO-ANALYSIS.md §4 said the file "lists the three guides" and counted /office-cleaning-checklist/ among them. That was inaccurate then and is still inaccurate now.
- **Recommendation:** Add the checklist guide and the 4 location links to `public/llms.txt`. Consider a build-time test, next to the existing ones in `tests/`, that fails when a sitemap URL under `/locations/` or a 2026 guide is missing from llms.txt. Low priority, because llms.txt carries no weight with Google.

### N4. The office-cleaning definition now appears twice on the page (Low)

- **Evidence:** /services/office-cleaning/ has the intro "Office cleaning is the recurring cleaning of a workplace's desks, floors, washrooms, kitchens and shared areas, done after staff leave. Evergreen Office Cleaning has provided it…". The "What is office cleaning?" H2 that follows repeats it almost word for word ("…usually done after staff leave. Evergreen Office Cleaning has done it…"). Two near-identical passages split the extraction signal and read as padding.
- **Recommendation:** In `src/content/services/office-cleaning.md`, keep the definition under the H2. Make the intro a one-line offer, or make the H2 answer add something the intro does not: what is and is not included, and who does it.

### N5. Question-led structure stopped at two service pages (Low)

- **Evidence:** /services/building-maintenance/ has 0 question H2s and opens with a subjectless fragment. /industries/medical-dental-clinics/ has 0 question H2s and opens "Patients judge a clinic before they see a clinician." Neither has an "X is Y" first sentence. On 9 of 11 location pages, the first sentence is the same template: "Evergreen Office Cleaning provides commercial and office cleaning in <place> as part of its coverage across the Greater Toronto Area, which it has served since 1989." The district-specific detail (good on every page) only starts in the "Office cleaning in <place>" section.
- **Recommendation:**
  - In `src/content/services/building-maintenance.md`, open with "Building maintenance cleaning is the periodic work …" and use H2s like "What does building maintenance cleaning include?" and "How often should floors be stripped and waxed?".
  - Apply the same pattern in the industries content file.
  - On location pages, lead with the district-specific sentence that already exists in the "Office cleaning in <place>" section.

### N6. The newest guide carries no sources or reviewer (Info)

- **Evidence:** `/office-cleaning-checklist/` has 0 external links and no reviewer. `/office-cleaning-cost-toronto-guide/` links only to the Ontario HST page. `/how-often-should-an-office-be-cleaned/` cites CCOHS, Ontario and PHAC sources with "consulted" dates, which is the model to follow.
- **Recommendation:** Where a task frequency in the checklist rests on guidance (washrooms per shift, disinfection contact time), cite the same CCOHS, Ontario or PHAC pages. Add the named reviewer once G2 is resolved.

## 3. What still needs the client or an account owner

- Real price bands from recent proposals for the cost guide, with a "pricing data reviewed" date (G1).
- Names, roles and years for the owner and account executive, for /about-us/, `Person` schema and a reviewer line on the guides (G2).
- Countable first-party facts with an "as of" date: buildings cleaned, staff, average client tenure, inspections per month (G7).
- Renaming the Facebook, LinkedIn and X display names to "Evergreen Office Cleaning" with a "formerly Evergreen Cleaning Service" line. Claiming or correcting Google Business Profile, Bing Places, Apple Business Connect, Yelp, YellowPages, BBB, HomeStars and Clutch under the current name and exact NAP (G3).
- A photoshoot and two or three short YouTube clips of real work, to embed with `VideoObject` and a transcript. A square logo file (G8, S-Logo).
- Confirming the business can stand behind "written into every contract since 1989" and the unqualified 2-hour reply, or approving the qualified wording (N2).
- Cloudflare: AI Crawl Control set to allow verified AI crawlers, and "managed robots.txt" off. Check the crawler log for real OAI-SearchBot, Claude-SearchBot and PerplexityBot hits (A1).
- Search Console: the "Search generative AI" control reads include. Confirm the 4 new location pages and the checklist guide are indexed (§2).
- Bing Webmaster Tools: site verified, sitemap submitted, IndexNow submissions accepted (G12).
- Google Business Profile service area matches the 10 `areaServed` cities (S-Area).

## 4. Not verified

- Live AI answers or citations on any platform (no DataForSEO or answer-sampling tool).
- Real-bot treatment by Cloudflare. All user-agent tests were spoofed.
- Reddit mentions (automated search blocked).
- YouTube brand presence: the results page returned 200, but no results could be parsed, so the first audit's "no channel" finding is carried forward, not re-checked.
- LinkedIn, Facebook and X display names.
- Backlinks and third-party brand mentions.
- Whether the three 2026-10-30 dateModified bumps reflect substantive edits.
- Bing Webmaster Tools verification by DNS.

## audit-data.json (AI Search Readiness), JSON-compatible

```json
{
  "category": "AI Search Readiness",
  "score": 72,
  "previous_score": 70,
  "dimensions": {"citability": 77, "structural_readability": 84, "multi_modal": 50, "authority_brand": 49, "technical_accessibility": 91},
  "crawlers": {"OAI-SearchBot": "allowed", "Claude-SearchBot": "allowed", "PerplexityBot": "allowed", "Googlebot": "allowed", "Bingbot": "allowed", "Applebot": "allowed", "GPTBot": "allowed (training)", "ClaudeBot": "allowed (training)", "Google-Extended": "allowed (training/grounding)", "Applebot-Extended": "allowed (training)", "CCBot": "allowed via wildcard (training)"},
  "llms_txt": "present, well-formed, stale (omits /office-cleaning-checklist/ and 4 location pages)",
  "status_counts": {"fixed": 3, "partly": 5, "open": 9, "regressed": 0, "na": 3},
  "findings": [
    {"id": "G1", "severity": "High", "status": "open", "title": "Cost guide gives no real price"},
    {"id": "G2", "severity": "High", "status": "open", "title": "No named people / Person schema"},
    {"id": "G3", "severity": "High", "status": "open", "title": "Weak off-site entity under current name"},
    {"id": "N1", "severity": "Medium", "status": "new", "title": "Commercial page says 'Toronto and ten GTA municipalities' but lists nine"},
    {"id": "N2", "severity": "Medium", "status": "new", "title": "Homepage 'written into every contract since 1989' claim and unqualified 2-hour reply"},
    {"id": "N3", "severity": "Low", "status": "new", "title": "llms.txt omits newest guide and 4 location pages"},
    {"id": "N4", "severity": "Low", "status": "new", "title": "Office-cleaning definition duplicated"},
    {"id": "N5", "severity": "Low", "status": "new", "title": "Question-led structure not extended to building-maintenance, industries, location openers"},
    {"id": "N6", "severity": "Info", "status": "new", "title": "Checklist guide has no sources or reviewer"}
  ]
}
```

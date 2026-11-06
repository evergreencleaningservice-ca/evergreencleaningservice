Score: 66/100

# GEO / AI Search Readiness: www.evergreencleaningservice.ca (2026-11-06)

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 68 | 17.0 |
| Structural readability | 20% | 80 | 16.0 |
| Multi-modal content | 15% | 45 | 6.8 |
| Authority & brand signals | 20% | 45 | 9.0 |
| Technical accessibility | 20% | 88 | 17.6 |
| **Total** | | | **66** |

Platform readiness (my estimates from on-site signals only. No live ChatGPT/Perplexity/AIO answers were sampled because DataForSEO is not available): Google AI Overviews 62, Perplexity 62, ChatGPT search 55, Bing Copilot 55.

Note for other agents: the HTML files in raw/crawl/html are double-encoded (UTF-8 read as Latin-1, so "—" shows as "â€”"). The live site sends correct bytes (`\xe2\x80\x94` checked on the homepage). Titles like "Day Or Night â Which..." in pages.json are a crawler artifact, not a site defect.

## What works

- **Every AI crawler is allowed at every layer I could test.** raw/robots.txt = public/robots.txt: `User-agent: *` Allow / plus a named group (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot, Applebot-Extended) that also says Allow /. Both groups carry `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. Live requests to /services/office-cleaning/ using the OAI-SearchBot, GPTBot, ClaudeBot, Claude-SearchBot, PerplexityBot, CCBot, Bytespider, meta-externalagent and Amazonbot user agents all returned 200 with the full 116 KB page.
- **Content is in the server HTML.** It is static Astro and nothing depends on JavaScript. FAQ answers sit inside `<details>` and are present in the raw HTML. Crawlers that don't render JS see the same text as users.
- **/how-often-should-an-office-be-cleaned/ is citation-ready.** The first paragraph opens with the question and answers it straight away ("For a workplace occupied five days a week, start with daily attention to washrooms, kitchens, bins and busy floors..."). The page has two tables (size → starting schedule, area → daily vs periodic). It uses question H2s and has 7 FAQ answers of 47 to 54 words each. It cites CCOHS, Ontario washroom guidance and PHAC with "consulted in November 2026" dates. It shows a visible publish date of 2026-11-03 that matches the BlogPosting `datePublished`.
- **/services/commercial-cleaning/ has a clear definition and a comparison table.** "Commercial cleaning is the cleaning of business premises: stores, branch offices, schools, clinics..." (72 words). A table compares commercial cleaning, janitorial and office cleaning. Its 9 FAQs include "What is the difference between commercial cleaning and janitorial services?"
- **/services/office-cleaning/ defines the term in one extractable paragraph.** "Office cleaning is the recurring cleaning of a workplace's desks, floors, washrooms, kitchens and shared areas, usually done after staff leave. Evergreen Office Cleaning has done it for Toronto and GTA businesses since 1989..." (47 words). The page also has 7 FAQs and Service + FAQPage + WebPage schema with `dateModified`.
- **The entity name is consistent on the site.** "Evergreen Office Cleaning" appears 466 times across 91 crawled URLs. "Evergreen Cleaning Service(s)" appears only in quoted reviews and in one sentence on /about-us/ that explains the rename ("For many years the business was known as Evergreen Cleaning Service; the name changed, the company did not."). Schema `ProfessionalService` has `alternateName` ["Evergreen Cleaning Service", "Evergreen Cleaning Services"], `foundingDate` 1989, address, geo, `hasMap` (GBP CID) and 4 `sameAs`.
- **Freshness signals are present.** Posts show "Published" and, where edited, "Updated <time>" (src/layouts/PostLayout.astro:90), and these match the schema. Service and location pages carry `WebPage.dateModified` from git (src/lib/schema.ts). /rss.xml returns 200.
- **llms.txt is present and follows the spec structurally** (served as text/plain, 3,963 bytes). It has an H1, a blockquote summary, a details list with no headings, and H2 sections of `[name](url): note` links. It uses `## Optional` the way the spec intends. Its facts match the site (address, phone, 1989, former name, areas, WSIB/bonded, ECOLOGO products).

## Findings

### 1. The cost guide gives no real price, so AI answers for "office cleaning cost Toronto" will cite someone else (High)
- **Evidence:** /office-cleaning-cost-toronto-guide/ opens its answer section with "There is no single price that fits every Toronto office." Its only figures are labelled "hypothetical CAD calculations before HST, not Evergreen quotes or verified GTA market averages" ($100–$300 per visit; worked example $150 × 5 × 52 ÷ 12 = $3,250). The square-foot FAQ answers with method, not a number. The structure is excellent (2 tables, a `dl`, 7 FAQs, question H2s, visible date). But AI Overviews, ChatGPT and Perplexity answer cost queries with a range, and they will take that range from a competitor page that states one.
- **Recommendation:** Get real ranges from the client's recent proposals and publish them as first-party data. For example: "Across N recurring office contracts we priced in 2025–2026, offices of 2,000–5,000 sq ft cleaned 3×/week fell between $X and $Y per month before HST." Put the range in the first 40–60 words under the H2 and in the per-square-foot FAQ. Add a dated "Pricing data last reviewed" line. Edit src/content/blog/office-cleaning-cost-toronto-guide.md. Keep the hypothetical table as the method. This needs client input; do not invent numbers.

### 2. No named people anywhere; all articles are by the Organization (High)
- **Evidence:** All 25 BlogPosting entries have `author: {"@type":"Organization"}` (the bylines say "By Evergreen Office Cleaning"). /about-us/ (468 words) names nobody. The only person name on the site is "Art" in a review. docs/growth/README.md lists "H5 About page (named people)" as waiting on the client.
- **Recommendation:** Once the client supplies names, add a founder/owner and account executive to /about-us/ (src/pages/about-us.astro) with role, years in the trade and any BSCAI/ISSA or IICRC training. Emit `Person` nodes (`worksFor` → #organization) and `founder` on the ProfessionalService in src/lib/schema.ts. Set `author` (or `reviewedBy`) on the three 2026 guides to that Person, and render a byline in PostLayout.astro.

### 3. The off-site entity is weak and the sameAs profiles carry the old name (High)
- **Evidence:** A Wikidata search for "Evergreen Office Cleaning" and for "Evergreen Cleaning Service" returned no entities. A Wikipedia search for "Evergreen Cleaning" Toronto returned 0 hits. The `sameAs` URLs are facebook.com/Evergreen-Cleaning-Service-104007224426820, x.com/EvergreenClean8 and linkedin.com/company/evergreen-cleaning-service-toronto/. Their slugs use the former name, and I could not check the profile display names (they need a login). No YouTube channel is linked. I cannot see who links to or mentions the brand: there is no backlink or mention data in this audit.
- **Recommendation:** (a) Rename the Facebook, LinkedIn and X display names to "Evergreen Office Cleaning" with a "formerly Evergreen Cleaning Service" line in each bio. Keep the URLs; renaming the slugs breaks old links. (b) Do not create a Wikipedia article: a local cleaner will not meet notability. A Wikidata item is possible only if independent references exist (e.g. a BBB or news listing). (c) Build consistent citations under the new name: Google Business Profile (check the name), Bing Places, Apple Business Connect, Yelp.ca, YellowPages.ca, BBB (Toronto), the Toronto Region Board of Trade member directory, the BIA directory for the Queen St W area, and BSCAI/ISSA Canada membership listings. ChatGPT, Copilot and Perplexity lean on these for local "best X in Toronto" answers. (d) Earn mentions: a property-manager guest piece (e.g. for a BOMA Toronto newsletter), answers in r/toronto and r/PropertyManagement threads only where they genuinely help, and 2–3 short YouTube walkthroughs (strip and wax, after-hours routine) under the new name. YouTube mentions are the strongest third-party correlate with AI citation.

### 4. llms.txt leaves out the most citable pages and states one claim more strongly than the site does (Medium)
- **Evidence:** raw/llms.txt (source public/llms.txt) points to the blog only through `## Optional` → /insights/. The three 2026 guides (/office-cleaning-cost-toronto-guide/, /how-often-should-an-office-be-cleaned/, /seasonal-office-cleaning-checklist/) are not listed. It says "Replies to quote requests within 2 hours" with no qualifier, while /how-often-should-an-office-be-cleaned/ says "within two hours during office hours, Monday–Friday, 7 a.m.–6 p.m." (the homepage is also unqualified). It is served as `text/plain` with no charset, and it contains non-ASCII "7am–6pm". Nothing in it over-claims beyond the site itself. Bonded status, screening and ECOLOGO certification are repeated from site copy, and I could not verify them independently. The site does not link to a UL listing.
- **Recommendation:** Add a `## Guides` section that lists the three 2026 guides with one-line summaries. Change the reply promise to "within 2 hours during office hours (Mon–Fri 7am–6pm)" in llms.txt and in the homepage Hero and Contact copy (src/components/home/Hero.astro, Contact.astro) so AI answers repeat the qualified version. If the client confirms it, add a "Not offered: residential/home cleaning" line so assistants don't recommend Evergreen for house cleaning. Serve `text/plain; charset=utf-8` for /llms.txt via public/_headers. Link the ProSeries Green UL ECOLOGO listing from /green-clean-products/. Expectation: Google states it does not use llms.txt for Search or AI Overviews, and no major engine has committed to it. Treat the file as cheap and low-impact, not as a ranking lever.

### 5. The homepage has no definitional first sentence (Medium)
- **Evidence:** The homepage starts with "Commercial cleaning since 1989" / H1 "Office & Commercial Cleaning in Toronto and the GTA" / "Recurring janitorial cleaning, building maintenance and specialty cleaning for offices, clinics... — after hours, by a consistent crew." The brand name is not in the hero, and no sentence says "X is Y". The first body passage under "Why Toronto businesses choose Evergreen" is generic ("A clean, organised building makes a good first impression..."). The homepage text also contains the Trustindex boilerplate "Trustindex verifies that the original source of the review is Google." seven times, which dilutes the extracted text.
- **Recommendation:** In src/components/home/Hero.astro or WhyEvergreen.astro, add one plain sentence: "Evergreen Office Cleaning is a Toronto commercial cleaning company, founded in 1989, that provides after-hours office, janitorial and floor-care contracts across the GTA from its office at 243 Queen St W." If the review markup is generated in src/components/home/Reviews.astro, render the "verified by Trustindex" note once rather than per review.

### 6. Service pages have answers but non-question headings, and the office-cleaning definition sits under the wrong heading (Medium)
- **Evidence:** On /services/office-cleaning/, the definition paragraph is under H2 "Who it is for" (src/content/services/office-cleaning.md `fitHeading`). The other H2s are "A clean office does two jobs", "What is included", "Scheduling" and "Scope and limits". "What is included" / "Scheduling" / "Scope and limits" are lists with no lead sentence. On /services/commercial-cleaning/, the definition H2 comes after "Commercial spaces we clean", so it is not the first passage.
- **Recommendation:** Rename the office-cleaning `fitHeading` to "What is office cleaning?". Give "What is included" a one-sentence summary before each list ("Every visit covers desks, kitchens, washrooms, floors and touch points; periodic work such as carpet extraction is scheduled separately."). On commercial-cleaning, move "What commercial cleaning and janitorial services are" above "Commercial spaces we clean" in src/content/services/commercial-cleaning.md. Phrase 2–3 H2s per service page as the questions people ask ("How much does commercial cleaning cost in Toronto?" linking to the cost guide).

### 7. Few first-party facts or statistics (Medium)
- **Evidence:** Apart from "since 1989", the money pages have no countable facts: no number of buildings or square feet under contract, crew size, average client tenure, inspection frequency or response metrics. The testimonials mention 3- and 5-year client relationships, but these are not summarised.
- **Recommendation:** Add a short facts block to /about-us/ and the homepage, sourced from the client: e.g. "N buildings cleaned nightly", "average client relationship N years", "N staff, all WSIB-covered". Mark each with an "as of" date. These are the sentences engines quote.

### 8. Multi-modal content is generic (Medium)
- **Evidence:** The images on the five sampled pages are stock-style ("Empty modern office interior with glass partitions", "Floor scrubber in a warehouse aisle"). Alt text is good (0 missing; the 2 empty alts on each guide are decorative). The 2 `<video>` elements on every page are the sitewide LeadVideo widget (src/components/LeadVideo.astro), not topical video. There is no VideoObject or YouTube presence. The README lists "H6 photoshoot" as pending.
- **Recommendation:** After the photoshoot, use real crew and site photos with descriptive captions on the service pages. Publish 60–120 s YouTube clips (e.g. "How we strip and wax a commercial floor") and embed them on /services/floor-stripping-waxing/ and /services/office-cleaning/ with VideoObject schema and a transcript.

### 9. Bot coverage: which crawlers are named and which rely on the wildcard (Low/Info)
- **Evidence and capability:**

| Crawler | In robots.txt | What it governs | Status |
|---|---|---|---|
| OAI-SearchBot | Named | ChatGPT search citations | Allowed |
| ChatGPT-User | Named | User-initiated fetches in ChatGPT | Allowed |
| GPTBot | Named | OpenAI model training only (not ChatGPT search) | Allowed |
| Claude-SearchBot | Named | Claude search citations | Allowed |
| Claude-User | Named | User-initiated fetches | Allowed |
| ClaudeBot | Named | Anthropic training only | Allowed |
| PerplexityBot / Perplexity-User | Named | Perplexity index / user fetches | Allowed |
| Googlebot | Named | Google Search and AI Overviews/AI Mode inclusion | Allowed |
| Google-Extended | Named | Gemini/Vertex training and grounding (not AI Overviews) | Allowed |
| Bingbot | Named | Bing index, which also feeds Copilot | Allowed |
| Applebot | Named | Siri/Spotlight/Safari | Allowed |
| Applebot-Extended | Named | Apple Intelligence training only | Allowed |
| CCBot | Wildcard | Common Crawl (training corpora) | Allowed |
| Bytespider | Wildcard | ByteDance training | Allowed |
| Amazonbot | Wildcard | Amazon (Alexa/Rufus) | Allowed |
| Meta-ExternalAgent | Wildcard | Meta AI training | Allowed |
| DuckAssistBot, MistralAI-User, cohere-ai | Wildcard | Various | Allowed |

- The named group adds nothing today, because both groups say Allow. But a crawler that matches the named group ignores the `*` group. If anyone later adds a `Disallow` (e.g. /lp/ or /search/) only to `*`, the 13 named bots will not inherit it. The comment block explains the intent, so this is acceptable as long as edits go into both groups.
- The `Content-Signal` lines cause Lighthouse's "Unknown directive" (SEO 92). Search engines ignore unknown lines, so this is cosmetic. Keep them if the client wants the declared ai-train=yes signal.
- **Could not verify:** Cloudflare's dashboard-level "Block AI bots" / AI Crawl Control settings. My test requests used spoofed user agents from this container, and Cloudflare blocks *verified* bots by IP, so a 200 here does not prove real GPTBot or ClaudeBot traffic gets through. **Recommendation:** check Cloudflare → AI Crawl Control. Confirm AI bots are set to Allow and "Managed robots.txt" is off (the served file matches public/robots.txt, so it currently appears off). Look at the crawler request log for real OAI-SearchBot, Claude-SearchBot and PerplexityBot hits.

### 10. No markdown alternates, ai.txt or RSL license (Low)
- **Evidence:** /services/office-cleaning/index.md, /index.md, /llms-full.txt, /ai.txt and /license.xml all return 404 (the 404 page). `Accept: text/markdown` on /services/office-cleaning/ returns text/html. There is no RSL `License:` line in robots.txt.
- **Recommendation:** Optional. Generating /llms-full.txt (the service pages plus the three 2026 guides as markdown) at build time from src/content is a small Astro endpoint (src/pages/llms-full.txt.ts), and it helps agent-style fetchers. No major answer engine requires .md alternates or ai.txt. RSL 1.0 is not needed: the Content-Signal lines already state permissive terms, and a lead-generation business benefits from free reuse.

### 11. The 2023–2026 posting gap and old posts with "Updated" dates but no real changes (Low)
- **Evidence:** BlogPosting dates jump from 2023-03-31 to 2026-10-30. Six old posts (e.g. /how-to-decide-on-a-cleaning-company/, published 2019-12-07) show "Updated October 30, 2026", and 13 older posts keep 2020–2023 dates. Engines discount `dateModified` that changes without a substantive edit.
- **Recommendation:** Only bump `updatedDate` in src/content/blog/*.md when the content changes. Plan one substantive guide a month on the money queries (e.g. "commercial cleaning checklist for Toronto property managers", "janitorial contract: what to include").

### 12. Bing/Copilot plumbing not confirmed (Low)
- **Evidence:** No IndexNow key or integration in src/, public/ or scripts/. No `msvalidate.01` meta on the homepage (Bing Webmaster Tools may be verified by DNS; not checked).
- **Recommendation:** Verify the site in Bing Webmaster Tools, submit sitemap-index.xml, and add IndexNow pings in the deploy script (scripts/) so Copilot and ChatGPT, which draws partly on Bing, see the new guides quickly.

## Structured-answer coverage for target queries

| Query | Best page | Direct answer in first 60 words | Table/list | FAQ | Gap |
|---|---|---|---|---|---|
| office cleaning cost Toronto | /office-cleaning-cost-toronto-guide/ | No (says "no single price") | Yes (2) | Yes (7) | No real price range (Finding 1) |
| how often should an office be cleaned | /how-often-should-an-office-be-cleaned/ | Yes | Yes (2) | Yes (7) | None significant; add a named reviewer |
| commercial cleaning Toronto | /services/commercial-cleaning/ | Partly (definition is the 2nd H2) | Yes (1 table, 18 lists) | Yes (9) | No cost answer, no first-party stats; local-pack and listings carry this query |

## Platform notes

- **Google AI Overviews / AI Mode:** inclusion follows Googlebot (allowed) and normal ranking. Google-Extended affects Gemini grounding and training, not AIO. Google ignores llms.txt. For "commercial cleaning Toronto", Google shows the local pack, so Google Business Profile reviews, categories and name consistency matter more than on-page GEO. The how-often guide is the strongest AIO candidate.
- **ChatGPT search:** OAI-SearchBot is allowed (GPTBot status does not matter here). Local business answers rely heavily on third-party listings and review sites, and its web results partly come from Bing. Listings (Finding 3) and Bing setup (Finding 12) are the levers.
- **Perplexity:** PerplexityBot is allowed. It favours fresh, dated, well-structured pages with outbound citations, which describes the 2026 guides. It often answers "best X in Toronto" from Reddit, Yelp and list articles, where the brand has no visible presence.
- **Bing Copilot:** Bingbot is allowed. It uses the Bing index and Bing Places. IndexNow, BWT verification and Bing Places under the new name are not confirmed.

## Quick wins

1. Add the three 2026 guides to public/llms.txt, qualify "within 2 hours" with office hours, and add `charset=utf-8` for /llms.txt in public/_headers (about 30 min).
2. Add one definitional "Evergreen Office Cleaning is..." sentence to src/components/home/Hero.astro (about 15 min).
3. Rename the office-cleaning `fitHeading` to "What is office cleaning?" and move the commercial-cleaning definition H2 first in src/content/services/*.md (about 30 min).
4. Rename the Facebook, LinkedIn and X display names to "Evergreen Office Cleaning (formerly Evergreen Cleaning Service)", and claim Bing Places and Apple Business Connect under that name (about 1–2 h, owner access needed).
5. Check Cloudflare AI Crawl Control is set to Allow for verified AI crawlers, and verify Bing Webmaster Tools (about 20 min, account access needed).

Larger, higher-impact items that need client input: real price ranges in the cost guide (Finding 1), named people on /about-us/ with Person schema (Finding 2), first-party facts (Finding 7), and YouTube clips (Finding 8).

## Not verified

- Live AI answers on any platform. No DataForSEO tools were available, and I did not run manual prompts.
- Backlinks and brand mentions (no link data), Reddit or YouTube mentions, and GBP and listing name consistency.
- Cloudflare dashboard bot settings. The accuracy of the client's bonded, screening and ECOLOGO claims.

## audit-data.json (AI Search Readiness)

```json
{
  "category": "AI Search Readiness",
  "score": 66,
  "dimensions": {"citability": 68, "structural_readability": 80, "multimodal": 45, "authority_brand": 45, "technical_accessibility": 88},
  "platform_estimates": {"google_aio": 62, "perplexity": 62, "chatgpt_search": 55, "bing_copilot": 55},
  "crawler_access": {"named_allowed": ["Googlebot","Bingbot","OAI-SearchBot","ChatGPT-User","GPTBot","PerplexityBot","Perplexity-User","ClaudeBot","Claude-SearchBot","Claude-User","Google-Extended","Applebot","Applebot-Extended"], "wildcard_allowed": ["CCBot","Bytespider","Amazonbot","Meta-ExternalAgent"], "blocked": [], "cloudflare_bot_settings": "unverified"},
  "llms_txt": {"status": "present", "spec_compliant": true, "issues": ["2026 guides not listed", "unqualified 2-hour reply claim", "no charset in content-type"]},
  "markdown_alternates": false, "ai_txt": false, "rsl": false,
  "entity": {"name": "Evergreen Office Cleaning", "alternateName_in_schema": true, "wikidata": false, "wikipedia": false, "sameAs_count": 4, "sameAs_slugs_use_former_name": true},
  "findings": [
    {"id": "GEO-1", "severity": "High", "title": "Cost guide has no real price range"},
    {"id": "GEO-2", "severity": "High", "title": "No named people; Organization-only authorship"},
    {"id": "GEO-3", "severity": "High", "title": "Weak off-site entity; sameAs profiles carry former name"},
    {"id": "GEO-4", "severity": "Medium", "title": "llms.txt omits key guides; unqualified reply claim"},
    {"id": "GEO-5", "severity": "Medium", "title": "Homepage lacks definitional sentence; Trustindex boilerplate x7"},
    {"id": "GEO-6", "severity": "Medium", "title": "Service page headings not question-led; definition placement"},
    {"id": "GEO-7", "severity": "Medium", "title": "Few first-party statistics"},
    {"id": "GEO-8", "severity": "Medium", "title": "Stock imagery, no topical video"},
    {"id": "GEO-9", "severity": "Low", "title": "Named robots group needs future edits mirrored; CF bot settings unverified"},
    {"id": "GEO-10", "severity": "Low", "title": "No .md alternates / llms-full.txt / RSL"},
    {"id": "GEO-11", "severity": "Low", "title": "2023-2026 content gap; dateModified bumps"},
    {"id": "GEO-12", "severity": "Low", "title": "IndexNow / Bing Webmaster not confirmed"}
  ]
}
```

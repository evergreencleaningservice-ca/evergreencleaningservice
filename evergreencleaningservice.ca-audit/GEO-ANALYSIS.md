# GEO Analysis: www.evergreencleaningservice.ca

Date: 6 November 2026, after the Phase 1–3 deploys (Worker version b1d4a928). Live site fetched directly; no DataForSEO, Search Console or AI-answer sampling tools were available, so nothing here is a measured AI-visibility figure.

Framing, per Google's AI optimization guide (May 2026): optimizing for generative AI search is still SEO. The findings below are SEO fundamentals applied to AI surfaces. Where community advice conflicts with Google's guidance (llms.txt, chunking, AI rephrasing, mention-farming), Google's position is noted and followed.

## 1. GEO Readiness Score: 70 / 100

| Dimension | Weight | Score | Change since the 6 Nov audit (66) |
|---|---|---|---|
| Citability | 25% | 74 | +6: definitional openers on the homepage and both core service pages; a third guide with direct answers |
| Structural readability | 20% | 82 | +2: question-led headings and tables on the three guides |
| Multi-modal content | 15% | 50 | +5: captioned responsive gallery; still all stock, no video |
| Authority and brand signals | 20% | 48 | +3: dated, sourced guides; still no named person, no off-site entity |
| Technical accessibility | 20% | 90 | +2: llms.txt served with charset; SSR confirmed identical with JS off |

## 2. Platform readiness (qualitative; not measured with a tool)

| Platform | Readiness | Why |
|---|---|---|
| Google AI Overviews | Moderate | Follows classic ranking; the site's pages are eligible (Googlebot allowed, SSR, canonical, no `nosnippet`). Citation depends on ranking for the query, and Search Console shows few clicks site-wide (repo docs, 30 Oct). The "how often" and checklist guides are the strongest candidates. |
| Google AI Mode | Moderate | Draws from a broader pool and rewards freshness and entity authority. Three guides are days old with visible dates and primary sources; entity authority is weak (section 5). |
| ChatGPT search | Low to moderate | OAI-SearchBot allowed and served the full page. ChatGPT leans on Wikipedia and Reddit for local "best X" answers; the brand appears on neither. |
| Perplexity | Low to moderate | PerplexityBot allowed. Perplexity favours fresh, dated, sourced pages (the guides qualify) and Reddit discussions (none found). |
| Bing Copilot | Unverified | Bingbot allowed. Bing Webmaster Tools verification and IndexNow are not confirmed. |

Google's Search Console "Search generative AI" control (worldwide since 31 Aug 2026) decides eligibility for AI Overviews and AI Mode. It defaults to include, but it could not be checked from here; confirm it reads "include" in the property.

## 3. AI crawler access status

robots.txt allows every crawler, in a wildcard group and a named group, both carrying `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. Live fetches of `/services/office-cleaning/` with each user agent returned 200 and the full 127 KB page with the H1 present. Those were spoofed agents from this container, so they prove the robots and origin policy, not Cloudflare's treatment of verified bot IPs; check Cloudflare AI Crawl Control allows verified AI crawlers.

Search citability (each a separate finding):

| Crawler | Governs | Status |
|---|---|---|
| Googlebot | Google Search, AI Overviews, AI Mode | Allowed, named |
| OAI-SearchBot | ChatGPT search citability | Allowed, named; 200 live |
| Claude-SearchBot | Claude search citability | Allowed, named; 200 live |
| PerplexityBot | Perplexity index | Allowed, named; 200 live |
| Bingbot | Bing index, Copilot | Allowed, named |
| Applebot | Siri, Spotlight, Safari search | Allowed, named; 200 live |

Training and grounding (each a separate finding; a licensing choice, not a visibility one):

| Crawler | Governs | Status |
|---|---|---|
| GPTBot | OpenAI model training only | Allowed, named; 200 live |
| ClaudeBot | Anthropic model training only | Allowed, named; 200 live |
| Google-Extended | Gemini and Vertex training and grounding; not Search inclusion | Allowed, named; 200 live |
| Applebot-Extended | Apple Intelligence training opt-out signal | Allowed, named |
| CCBot | Common Crawl corpora | Allowed via wildcard only; 200 live |
| Bytespider, meta-externalagent, Amazonbot | ByteDance, Meta, Amazon training | Allowed via wildcard only; 200 live |

User-triggered fetchers (ChatGPT-User, Claude-User, Perplexity-User, Google-Agent) are named or covered; robots.txt cannot stop them anyway. One maintenance note: a bot matching the named group ignores the wildcard group, so any future `Disallow` must be added to both.

Content-Signal lines are what Lighthouse flags as "Unknown directive" (SEO 92). They are harmless to Google and state the owner's intent; keep or drop as a policy choice.

## 4. llms.txt status

Present at `/llms.txt`, 5.2 KB, served as `text/plain; charset=utf-8`. Spec-shaped (H1, blockquote summary, fact list, H2 link sections, `## Optional`). Since Phase 2 it lists the three guides and carries a "For assistants and agents" section explaining the quote path without the form and that residential cleaning is not offered. Facts match the site.

Weight in this score: none. Google states llms.txt is not used for Search or AI features, and no major AI provider has confirmed reading it. It is a cheap courtesy to other systems, nothing more. No `/llms-full.txt`, no Markdown alternates. No RSL 1.0 licence (`/license.xml` 404, no `License:` line); the Content-Signal lines already state permissive terms, which suits a lead-generation business.

## 5. Brand mention analysis

| Platform | Finding | Verified how |
|---|---|---|
| Wikipedia | 0 search hits for "Evergreen Office Cleaning"; 0 for "Evergreen Cleaning Service" Toronto | Wikipedia search API |
| Wikidata | No entity under either name | Wikidata search API |
| Reddit | Not verifiable from here (search returns 403 to automated requests) | Reddit search JSON |
| YouTube | No channel or video for the brand; the top results for the name are a different company, Evergreen Building Maintenance, with a US phone number | YouTube results page |
| LinkedIn | Company page exists at the former-name slug; content not readable from here (403) | HEAD request |
| Facebook, X | Profiles resolve (200) under the former name "Evergreen Cleaning Service" / @EvergreenClean8 | HEAD request |
| Open web | A web search for the exact brand name surfaced one lead-prospecting aggregator listing (Google rating 5.0 from 7 reviews; no Yelp or Facebook found by it) and nothing else; a search for the domain itself surfaced only unrelated companies with similar names | WebSearch, three queries |

This is the weakest area and the one the Ahrefs correlation data (75,000 brands, December 2025) says matters most: YouTube, Reddit and Wikipedia presence correlate far more strongly with AI citations than backlinks. A Wikipedia article is not realistic for a local cleaner; the realistic levers are YouTube, directory citations under the current name, and the social renames. Note that the one third-party listing found still carries the old name, which is the entity-consistency problem the audit flagged.

## 6. Passage-level citability

Measured on the saved live HTML (paragraphs of 12+ words inside `<main>`; 40–170 words is a heuristic, not a Google rule).

| Page | Words | Paragraphs | In 40–170 words | Definition sentences | Paragraphs with numbers | FAQ Qs | Direct answer in first 60 words |
|---|---|---|---|---|---|---|---|
| / | 1,407 | 26 | 5 | 5 | 5 | 0 | Yes: "Evergreen Office Cleaning is a Toronto commercial cleaning company, founded in 1989…" |
| /services/office-cleaning/ | 1,543 | 23 | 6 | 6 | 4 | 7 | Yes: "Office cleaning is the recurring cleaning of…" |
| /services/commercial-cleaning/ | 2,618 | 44 | 12 | 10 | 4 | 9 | Yes: "Commercial cleaning is the cleaning of business premises, and janitorial services are…" |
| /office-cleaning-cost-toronto-guide/ | 2,044 | 35 | 26 | 5 | 8 | 6 | Partly: explains method; no price figure |
| /how-often-should-an-office-be-cleaned/ | 2,013 | 31 | 17 | 5 | 8 | 7 | Yes: "For a workplace occupied five days a week, start with daily attention to…" |
| /office-cleaning-checklist/ | 2,085 | 20 | 11 | 6 | 2 | 7 | Yes: "An office cleaning checklist lists every task a workplace needs, sorted by…" |
| /about-us/ | 462 | 6 | 1 | 3 | 2 | 0 | Yes, but the page is thin and names nobody |

Self-contained answer blocks that an engine can lift as they stand: the three guide openers; the office and commercial definitions; the "what is the difference between commercial cleaning and janitorial services" FAQ; the frequency table by office size; the checklist's daily table; the cost guide's "what affects the price" list. The gap is unique data: beyond "since 1989" the site offers no figure an engine could quote and attribute (contract counts, staff, buildings, a price band), and the cost guide, the page whose query most wants a number, declines to give one.

## 7. Server-side rendering check

Static Astro HTML. With JavaScript disabled, `<main>` on the homepage carries 1,433 words and on the office page 1,330, identical to the counts with JavaScript enabled. The H1, body copy, FAQ answers (in `<details>`), JSON-LD and the hero image are in the raw HTML. Crawlers that do not execute JavaScript (OAI-SearchBot and PerplexityBot in public tests) see the same text as Googlebot. The only JavaScript-dependent content is `/search/`, which is noindex and not linked.

## 8. Top 5 highest-impact changes

1. **Give the cost guide a real number.** Publish Evergreen's own price bands by office size and visit frequency from recent proposals, with a "pricing data reviewed <date>" line, in the first 60 words under the H2. Until then, every AI answer to "office cleaning cost Toronto" quotes a competitor. (Client decision D-D.)
2. **Put a person on the site.** Owner and account executive on /about-us/ with role and years, `Person` schema linked by `founder`/`employee`, and a reviewer line on the three guides. Anonymous authorship is the single weakest authority signal across every platform. (Client item H5.)
3. **Build the off-site entity under the current name.** Rename the Facebook, LinkedIn and X display names with a "formerly Evergreen Cleaning Service" line; claim Google, Bing Places, Apple Business Connect, Yelp, YellowPages, BBB, HomeStars and Clutch with the exact NAP; publish two or three short YouTube clips of real work (strip and wax, an after-hours office round) and embed them on the matching service pages with `VideoObject`. YouTube is the strongest single correlate with AI citations in the Ahrefs data.
4. **Add first-party facts.** Three to five dated, countable facts on /about-us/, the homepage and llms.txt (buildings cleaned nightly, average client tenure, staff count, inspections per month). These are the sentences engines quote and attribute.
5. **Keep the guides fresh and sourced.** Review each of the three guides on a dated cycle (the SE Ranking 1.3M-citation study puts content under three months old at roughly three times the citation rate of stale pages) and keep the "consulted on" dates on their primary sources current. Add one guide a month from the cluster briefs, each with a direct answer in its first 60 words.

## 9. Schema recommendations for AI discoverability

- **Person** nodes for the owner and account executive, referenced from the `ProfessionalService` via `founder` and `employee`, and as `author` or `reviewedBy` on the guides. Needs the client's names.
- **`image` as real photos and a square `logo`** on the `ProfessionalService` (both are the 884×265 banner today). Needs the photoshoot.
- **`VideoObject`** on service pages once clips exist: `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl` or `embedUrl`, and a transcript on the page.
- **`areaServed`** already lists the ten cities; keep it as city level (schema.org has no district type that engines use) but make sure the Google Business Profile service area matches it exactly.
- **Keep** `FAQPage` JSON-LD as is (accurate; no SERP feature since May 2026; harmless), `BlogPosting` with `datePublished`/`dateModified`, and the `BreadcrumbList`. **Do not add** `aggregateRating` (self-serving) or `HowTo` (retired).

## 10. Content reformatting suggestions (specific passages)

1. **/office-cleaning-cost-toronto-guide/, first paragraph under "Why There Is No Single Office Cleaning Price".** Today: "There is no single price that fits every Toronto office…" Rewrite to lead with the band once the client supplies it: "Most Toronto offices under 3,000 sq ft cleaned two or three evenings a week pay $X to $Y a month before HST (Evergreen proposals, 2025–2026); larger or nightly schedules run higher. The rest of this guide shows what moves the figure." Keep the method tables below it.
2. **/services/office-cleaning/ headings.** "A clean office does two jobs" and "Your equipment and your privacy are respected" are statements. Turn two or three H2s into the questions people ask: "What does office cleaning include?", "How often should an office be cleaned?" (answer in one sentence, then link the guide), "Who cleans the office, and are they screened?"
3. **/services/commercial-cleaning/ "The products we use" and "Commercial cleaning across the GTA".** Each is a short section without a lead sentence. Open each with one self-contained sentence an engine can lift: "Evergreen uses Armstrong ProSeries Green products, certified to UL ECOLOGO standards, on every commercial contract." / "Evergreen cleans commercial premises in Toronto and ten GTA municipalities from one office at 243 Queen St W."
4. **/about-us/ (462 words).** Add a facts block in list form under the opening paragraph (founded 1989; one office; crews WSIB covered, bonded and insured; products; areas; and, when the client supplies them, counts and names). Lists of attributed facts are what AI Mode extracts from About pages.
5. **Homepage "Why Toronto businesses choose Evergreen".** The first paragraph is generic ("A clean, organised building makes a good first impression…"). Replace it with the four concrete reasons the site already commits to, one sentence each: same crew every visit, written scope from a free walkthrough, after-hours by default, a reply within 2 hours.
6. **Location pages.** Each already opens its office section with a district-specific sentence. Add one question-led FAQ per page that answers a search ("Do you clean offices in North York Centre after hours?") in one sentence first, then the detail; most already do, so this is a consistency pass.

## Not verified

Live AI answers on any platform; the Search Console generative-AI control; Cloudflare's bot settings for verified crawlers; Reddit mentions (automated access blocked); the content of the LinkedIn page; backlinks and brand mentions beyond the three web searches above.

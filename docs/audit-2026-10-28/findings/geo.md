# GEO / AI Search Readiness: evergreencleaningservice.ca vs JAN-PRO
Audit date: 2026-10-28. Raw evidence: `raw/geo/` (robots, `ua/`, `disc/`, `pages/`, `serp/`). Parsers: `scratchpad/geo-scripts/`.
Scope note: the research stopped at the coordinator's turn limit. Items that did not run are marked **NOT RUN**.

## 1. Score summary

| Dimension (weight) | Evergreen | jan-pro.com | Notes |
|---|---|---|---|
| Citability (25%) | 62 | 60 | Evergreen has good FAQ and scope blocks but almost no numbers. JAN-PRO has many numbers, but its copy is US-centric and full of filler |
| Structural readability (20%) | 75 | 65 | Evergreen has clean H2/H3, lists and FAQPage schema, but its blocks repeat across pages. JAN-PRO hides text behind "Read more" truncation |
| Multi-modal (15%) | 35 (provisional) | 50 (provisional) | Image and video audit **NOT RUN** in detail. No Evergreen YouTube presence was found |
| Authority & brand (20%) | 30 | 70 | Evergreen has a split name, conflicting directory NAP, no named person and no Wikipedia page. JAN-PRO is a national brand (Entrepreneur ranking, BBB), also without a Wikipedia article |
| Technical accessibility (20%) | 90 | 85 | Both sites are open to all bots and server-rendered. JAN-PRO sets Crawl-delay 10. jan-pro.ca has broken JSON-LD |
| **AI Search Readiness (0-100)** | **60** | **~66** | Weighted. Evergreen: 15.5 + 15 + 5.25 + 6 + 18 = 59.75 |

Estimated platform readiness for Evergreen: Google AI Overviews 55 · ChatGPT Search 50 · Perplexity 50 · Bing Copilot 55. These are estimates; live AI answers could not be tested (see section 6).

## 2. Crawler access matrix

Both robots.txt files contain only a `User-agent: *` group, so no bot is named specifically.
- **Evergreen:** `User-agent: * / Allow: /`, plus Sitemap `/sitemap-index.xml`. The file is 91 bytes and is not Cloudflare-managed.
- **jan-pro.com:** `User-agent: *`, `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php`, `Crawl-delay: 10`, plus Sitemap. Google ignores Crawl-delay; Bing honours it.
- **jan-pro.ca** (the JAN-PRO Canada master franchise that actually serves Toronto): two `User-agent: *` groups (theirs plus a Yoast block), both permissive, and comment lines that point to its llms.txt.

UA test method: one request per user agent to `/` and one service page on each site (Evergreen `/services/office-cleaning/`, JAN-PRO `/commercial-cleaning-services/`), comparing HTTP status, byte count and MD5.

| Bot (capability it governs) | Evergreen robots | Evergreen `/` and office page | jan-pro.com robots | jan-pro.com `/` and commercial page |
|---|---|---|---|---|
| Browser baseline | n/a | 200 / 133,670 B; 200 / 103,434 B | n/a | 200 / 296,562 B; 200 / 346,178 B |
| GPTBot (OpenAI training) | allowed | 200, identical | allowed | 200, identical |
| OAI-SearchBot (ChatGPT Search) | allowed | 200, identical | allowed | 200, identical |
| ChatGPT-User (user-triggered fetch) | allowed | 200, identical | allowed | 200, identical |
| ClaudeBot (Anthropic training) | allowed | 200, identical | allowed | 200, identical |
| Claude-SearchBot (Claude search) | allowed | 200, identical | allowed | 200, identical |
| anthropic-ai (legacy token) | allowed | 200, identical | allowed | 200, identical |
| PerplexityBot (Perplexity search) | allowed | 200, identical | allowed | 200, identical |
| Google-Extended (Gemini training and grounding; not Search or AIO) | allowed | 200, identical | allowed | 200, identical |
| Googlebot (Search and AI Overviews) | allowed | 200, identical | allowed | 200, identical |
| Bingbot (Bing, Copilot, and the index behind much of ChatGPT search) | allowed | 200, identical | allowed (Crawl-delay 10) | 200, identical |
| CCBot (Common Crawl training) | allowed | 200, identical | allowed | 200, identical |
| Applebot-Extended (Apple Intelligence training only) | allowed | 200, identical | allowed | 200, identical |

"Identical" means the same status code, byte size and MD5 as the browser baseline on both pages. The Cloudflare Worker does not vary its response by user agent.

**Caveat:** these were spoofed user agents sent from a non-bot IP. Cloudflare's "Block AI bots" and AI Crawl Control act on *verified* bot IPs, which this test cannot reproduce. To confirm, check Cloudflare dashboard → AI Crawl Control / Security → Bots and make sure OAI-SearchBot, Claude-SearchBot, PerplexityBot and Bingbot are not blocked or challenged.

## 3. Discovery files

| File / signal | Evergreen | jan-pro.com | jan-pro.ca |
|---|---|---|---|
| /llms.txt | 404 | 404 | **200** (481 B index; `/en/llms.txt` 6.7 KB lists services, industries, and Toronto East and West office pages) |
| /llms-full.txt | 404 | 404 | NOT RUN |
| /.well-known/llms.txt, ai.txt, ai-plugin.json, mcp.json, genai.txt, security.txt | all 404 | all 404 | NOT RUN |
| RSL licence (/license.xml, /rsl.xml, /.well-known/rsl.xml) | 404 | 404 | NOT RUN |
| Markdown alternates (/index.md, page.md, `Accept: text/markdown`) | 404; negotiation returns text/html | 404; text/html | NOT RUN |
| Content-Signal (robots.txt or header) | none | none | none in robots.txt |
| X-Robots-Tag | none | none | NOT RUN |
| Sitemap | /sitemap-index.xml → sitemap-0.xml | /sitemap_index.xml | /en/wp-sitemap.xml and /en/sitemap.xml |
| RSS | /rss.xml (38 items, newest "Ask the Office Cleaners: Cleaning Break Rooms") | /feed/ | NOT RUN |
| Rendering | Astro, server-rendered; all copy is in the raw HTML | WordPress SSR | WordPress SSR |

## 4. Passage-level citability

Method: block-level extraction from `<main>` with header, nav and footer removed. Trafilatura is not installed, so BeautifulSoup was used.

### Evergreen homepage: 55/100 (about 1,260 words)
- **Quotable:** "Recurring janitorial cleaning, building maintenance and specialty cleaning for offices, clinics, managed buildings and industrial sites — after hours, by a consistent crew."
- **Quotable:** "Crews are dispatched across the Greater Toronto Area from our base at 243 Queen St W., Toronto."
- **Quotable:** "Background-screened staff, covered by liability insurance and WSIB Ontario."
- **Missing:** a definitional entity sentence, for example "Evergreen Office Cleaning is a Toronto commercial cleaning company founded in 1989 that…".
- **Missing:** a homepage FAQ.
- **Missing:** numbers other than 1989 (clients served, buildings, staff, average client tenure).
- **Not quotable:** "A clean, organised building makes a good first impression…" is generic.
- **Entity conflict:** the testimonials say "Evergreen Cleaning Service(s)" while the schema and footer say "Evergreen Office Cleaning". Testimonial blocks are rendered twice in the DOM.

### /services/office-cleaning/: 74/100 (about 1,340 words; Service + FAQPage + Breadcrumb schema)
- **Quotable:** "Busy offices are usually cleaned every weeknight; smaller or quieter offices a few evenings a week or weekly."
- **Quotable:** "We use Armstrong Manufacturing's ProSeries Green line, which is third-party certified to UL Environment (ECOLOGO) standards, fragrance-free and free of VOCs." This is a specific fact attributed to a source.
- **Quotable:** "Periodic work such as carpet extraction or strip and wax is scheduled and quoted separately from routine visits."
- **Quotable:** the every-visit and periodic task lists, and the six "What affects the price" factors.
- **Not quotable:** "a clean space is like a friendly handshake that tells people this is a business that has its house in order."
- **Not quotable:** "…providing the kind of detailed, floor-to-ceiling clean that the people you want to attract … notice."
- **Missing:** any price range or typical cost (for example per square foot or per visit). "How much does office cleaning cost in Toronto" is a top AI query, and the page answers only "after a walkthrough".

### /our-process/: 66/100 (about 830 words; FAQPage schema)
- **Quotable:** "Every client is assigned an account executive. They are the person you call — not a switchboard…"
- **Quotable:** "Yes. The on-site walkthrough and the proposal that follows are free and carry no obligation."
- **Quotable:** "What is cleaned, how often and when is written into your proposal…"
- **Weak:** there are no inspection frequency, response-time SLA, checklist or reporting tool specifics. Compare JAN-PRO's named TRACKER® inspection system.
- **Weak:** the five-step "How it works" block is repeated word-for-word on the homepage, office and medical pages, which dilutes how unique each page looks.

### /industries/medical-dental-clinics/: 72/100 (about 930 words; Service + FAQPage schema)
- **Quotable:** "Sterilization of instruments and the handling of biomedical or sharps waste follow your own clinical procedures and are not part of a cleaning contract." This is a strong scope statement.
- **Quotable:** "We clean first and then disinfect: a disinfectant cannot work through dirt and residue."
- **Quotable:** the treatment-room FAQ answer.
- **Weak:** "Evergreen has cleaned health, dental and medical clinics in Toronto and the GTA for years" is vague.
- **Missing:** any reference to Ontario IPAC/PIDAC best practices. jan-pro.ca markets "IPAC-compliant" cleaning.
- **Missing:** clinic counts and named clinic types or case examples.

### Supporting pages
- **/about-us/: 25/100.** Only 209 words of legacy copy ("the Evergreen Cleaning way"). It has no owner or person names, no "formerly Evergreen Cleaning Service" statement and no timeline.
- **Blog posts:** dated 2020 (e.g. the dental checklist, 2020-04-29), with the organization as author. They are stale for AI freshness signals.

### JAN-PRO for comparison
- **/commercial-cleaning-services/: 58/100.**
  - Quotable: "more than 8,000 local franchisees", "over 30 years", "Signature Clean® certification".
  - Weak: much of the copy is self-referential filler ("JAN-PRO Cleaning & Disinfecting adopts a personal approach that guarantees…").
  - Weak: industry blurbs are cut off behind "Read more".
  - Weak: the claims are inconsistent (99.99% in one place, 99.9% in another).
  - Weak: it relies on US regulators (EPA, OSHA, CDC).
- **/who-we-clean/office-cleaning/: 64/100.**
  - Quotable: "98.7% long-term customer retention rate", "A+ rating from the Better Business Bureau", "Ranked #1 Commercial Cleaning Franchise by Entrepreneur for 15 consecutive years", "8,000 certified franchisees in 41 states and 9 countries".
  - Not quotable: "Studies show that clean environments can reduce employee sick days" has no source.
  - Both pages carry a WebPage dateModified (2026-08).
- **jan-pro.ca Toronto West** (the real local competitor):
  - Quotable: "founded in 2003", "bonded, insured, compliant with the WSIB", WHMIS training, and a named Regional Director (Matthew Freeman) with a bio.
  - It also has llms.txt.
  - Its JSON-LD has a parse error (invalid control character).

## 5. Brand-mention inventory

Source: one Bing SERP (`"Evergreen Cleaning Service" Toronto`, via WebFetch). Other Bing queries returned unrelated, degraded results (see section 6).

| Source | URL | Name / NAP shown | Issue |
|---|---|---|---|
| Bing local listing | (Bing Places) | Evergreen Office Cleaning, 243 Queen St W, (416) 803-4880 | OK |
| Bing local listing (different business?) | evergreencleaningservices.org | "Evergreen Cleaning Services", Toronto, (647) 831-2284, open 24 h | Near-identical name; a risk of entity confusion |
| Chamber of Commerce | https://canada.chamberofcommerce.com/business-directory/ontario/toronto/commercial-cleaning-service/895150-evergreen-cleaning-service | Evergreen Cleaning Service, 243 Queen St W M5V 1Z4 | Old name |
| FindGlocal (mirror of the Facebook page) | https://www.findglocal.com/CA/Toronto/104007224426820/Evergreen-Office-Cleaning | Evergreen Office Cleaning, 243 Queen St W | OK |
| Canadian Business Directory | https://www.canadianbusinessdirectory.ca/file1353875.htm | Evergreen Cleaning Service | Old name |
| Fyple (2 listings) | https://www.fyple.ca/company/evergreen-cleaning-service-616ewnk/ and https://www.fyple.ca/company/evergreen-cleaning-service-64eg9ic/ | "since **1990**", "over 20 years" | Duplicate listings; founding year conflicts with 1989 |
| MapQuest | https://www.mapquest.com/ca/ontario/evergreen-cleaning-service-454587596 | **130 Broadlands Blvd**, Toronto M3A | Wrong or old address |
| WhatsYourHours | https://www.whatsyourhours.com/canada/toronto/business-services/evergreen-cleaning-service | **(416) 281-…** | Wrong or old phone; "since 1990" |
| Facebook | https://www.facebook.com/evergreen-cleaning-service-104007224426820/ | Page titled "Evergreen Office Cleaning" (URL slug is the old name); "over 20 years" | Stale copy |
| LinkedIn (schema sameAs) | https://www.linkedin.com/company/evergreen-cleaning-service-toronto/ | Old slug | Display name not verified (NOT RUN) |
| X (schema sameAs) | https://twitter.com/EvergreenClean8/ | Not verified | NOT RUN |
| Wikipedia / Wikidata | none: 0 search hits for "Evergreen Office Cleaning" | — | No entity |
| Reddit, YouTube, press, HomeStars, Yelp, BBB, Clutch | **NOT RUN / not found.** Search engines blocked automation | — | — |
| Google Business Profile reviews | Homepage shows 4 Google reviews (5/5); review count not verified | — | NOT RUN |

On-site entity consistency:
- Schema `name`, og:site_name, the footer and the RSS title all say "Evergreen Office Cleaning".
- The domain, the Facebook, LinkedIn and X slugs, and the testimonials say "Evergreen Cleaning Service(s)".
- The schema has no `alternateName` and no `foundingDate`. "Formerly" appears nowhere on the site.

**JAN-PRO:**
- jan-pro.com is the US/international brand. Toronto is served by **jan-pro.ca** (JAN-PRO Canada: 2,400+ franchisees, 29 regional offices, Toronto East and Toronto West offices, 1-888-977-1444).
- There is no Wikipedia article for "JAN-PRO" (/wiki/JAN-PRO returns 404).
- jan-pro.com's sameAs covers Facebook, X, LinkedIn and Instagram.
- The Toronto directory, Reddit and YouTube inventory was **NOT RUN**. The Bing query was degraded.

## 6. AI-answer observations

- **WebSearch:** not available in this sub-agent (no ToolSearch). All attempts went through curl or WebFetch.
- **Google:** 429. Not reachable.
- **Perplexity** (`/search?q=`): 403. Not reachable.
- **Bing Copilot** (`/copilotsearch`): 200, but only an empty shell with no answer text. Not reachable in practice.
- **Bing SERP:** the branded query `"Evergreen Cleaning Service" Toronto` worked. Evergreen ranked #1 and #3 (home and office page), had a local listing, and Bing showed "People also ask" items such as "What is Evergreen office cleaning service?" with answers that would not load. No AI summary appeared.
- **Bing, non-branded queries:** "best office cleaning company Toronto", "commercial cleaning services Toronto recommendations", "JAN-PRO Toronto" and the phone-number query all returned unrelated results (COVID, Titanic, yoga, "Jan" names). That is anti-automation result degradation, so **the non-branded AI-answer test is effectively NOT RUN**.
- **DuckDuckGo:** CAPTCHA. **Startpage:** JavaScript challenge. **Brave:** 429. **Mojeek:** 403. **Ecosia:** 403. **Yahoo:** 500.
- I did not try to get around the bot checks.
- **Recommendation:** test these prompts manually in ChatGPT (search on), Perplexity, Copilot and Google AI Mode from a normal browser. Record which firms are named and which URLs are cited.

## 7. Prioritised recommendations

1. **Unify the entity.** Effort: 2-4 h on-site plus 3-6 h of directory work. Impact: high.
   - Add to the CleaningService schema: `alternateName: ["Evergreen Cleaning Service","Evergreen Cleaning Services"]`, `foundingDate: "1989"`, `founder`/`employee` Person, and sameAs entries for Google Business Profile and Bing Places.
   - Add one visible sentence on the homepage and About page: "Evergreen Office Cleaning (formerly Evergreen Cleaning Service) has cleaned Toronto businesses since 1989."
   - Fix the MapQuest address (130 Broadlands Blvd), the WhatsYourHours phone ((416) 281-…), the Fyple "since 1990" and its duplicate listing, and the Chamber of Commerce and Canadian Business Directory names.
   - Rename the Facebook, LinkedIn and X display names consistently, and update "over 20 years" to "since 1989".
2. **Add quote-ready facts and a real person.** Effort: 1 day. Impact: high.
   - Give each page a definitional opening sentence.
   - Add hard numbers: buildings under contract, average client tenure, crew size, square footage cleaned weekly, response time for one-off work.
   - Name the owner or account executive ("Art …" appears only in a review) and add a bio and Person schema.
   - Add an indicative price-range answer for "how much does office cleaning cost in Toronto".
   - Cite Ontario IPAC/PIDAC on the clinic page.
3. **Rebuild /about-us/ as the entity hub.** Effort: 3-4 h. Impact: medium-high. Cover history since 1989, the rename, ownership, the 243 Queen St W office, WSIB and insurance, the green-products certification, service area and an FAQ.
4. **Build the off-site footprint that AI engines cite.** Effort: ongoing. Impact: high.
   - Grow Google review volume and ask reviewers to name the service type.
   - Claim HomeStars, BBB, Clutch and Yelp listings with the new name.
   - Post short YouTube walkthrough or process videos (YouTube mentions correlate most strongly with AI citations).
   - Post regularly on LinkedIn, and seek local trade or BOMA Toronto mentions.
   - Bing Places and Bing Webmaster Tools matter because Copilot and much of ChatGPT search draw on Bing. Consider IndexNow.
5. **Improve freshness and uniqueness.** Effort: 1-2 days. Impact: medium.
   - Update or date the 2020 blog posts and add visible "last updated" dates plus `dateModified` on service pages.
   - Reduce the identical "How it works" and price-factor blocks, or keep them below a unique answer-first lead on each page.
6. **llms.txt.** Effort: about 30 min. Impact: low. Google has said it does not use llms.txt, and no major AI search engine has confirmed it uses the file. It is cheap, and jan-pro.ca already has one, so do it last, as a curated index of services, industries, locations and FAQ.
7. **Content-Signal in robots.txt** (e.g. `search=yes, ai-input=yes`, with `ai-train` as a business choice). Effort: 10 min. Impact: low. This is optional and only a declaration of preference.
8. **Verify Cloudflare AI Crawl Control and bot settings** so that verified search crawlers are not challenged. Effort: 15 min. Impact: this protects everything above.

## 8. Not run

- Multi-modal audit (images, alt text, video).
- Live AI answers on ChatGPT, Perplexity, Copilot and Google AI Overviews.
- Reddit, YouTube and press searches for either brand.
- Discovery-file probes on jan-pro.ca beyond llms.txt.
- LinkedIn and X profile verification.
- DataForSEO (tools not available).

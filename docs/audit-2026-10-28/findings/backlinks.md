# Backlink and Authority Profile: evergreencleaningservice.ca vs jan-pro.com / jan-pro.ca

Date: 2026-10-28. Tier 0 (no Moz, Bing Webmaster or DataForSEO credentials). The claude-seo scripts could not run (they refuse the local proxy), so the data was gathered by hand with curl.

**Status: PARTIAL.** The web-search mention sweep and the Common Crawl inbound-link list were not completed. Both are flagged below. Per Tier 0 rules, **no Backlink Health Score is issued (INSUFFICIENT DATA)**. The 0-100 Authority figure in section 8 is a qualitative estimate, not the Health Score.

## 1. Data sources and confidence

| Source | What was taken | Confidence | Notes |
|---|---|---|---|
| Common Crawl domain web graph `cc-main-2026-aug-sep-oct` (crawls CC-MAIN-2026-34/39/43; ranks file last modified 2026-10-22), streamed from data.commoncrawl.org | Harmonic centrality rank and value, PageRank rank and value, host count, vertex IDs | 0.50 (domain-level, quarterly, approximate) | Graph has 135.0M domain nodes. Raw hits in `raw/backlinks/ranks_hits.txt` and `raw/backlinks/vertex_ids.txt`. |
| Common Crawl CDX index CC-MAIN-2026-43 (`cluster.idx` plus one cdx block per domain, via data.commoncrawl.org) | Captured URL counts, hosts, status codes | 0.50 | Counted from the single cdx block that holds each domain's key. Block files are in `raw/backlinks/cdx/`. `index.commoncrawl.org` itself reset the connection, so the data.commoncrawl.org route was used. |
| Wayback availability API (`archive.org/wayback/available`, queried with timestamps 2000 and 1996) | Earliest capture, a proxy for domain age | 0.60 | The nearest-snapshot API is not a full history. The Wayback CDX endpoint was blocked by egress policy. WHOIS was not checked. |
| Live HTTP checks on www.evergreencleaningservice.ca (curl -I, redirects followed) | Old-URL 301 behaviour | 0.95 (direct observation) | `raw/backlinks/old_url_redirect_check.txt` |
| Repo and site files (`src/data/redirects.ts`, `_research/*.md`, homepage HTML in `raw/technical/home_curl.html`) | Redirect map, old-brand facts, sameAs links, supplier names | 0.90 | |
| BBB site search (plain curl, no bot-check workaround) | Directory presence | 0.50 | Search-result absence is not proof of absence. |

**Not obtained, with reasons**
- **Open PageRank:** the API returned 401 "Missing API key", and it needs a free key.
- **Web search mention sweep:**
  - The subagent had no WebSearch or WebFetch tool.
  - Bing via curl returned unrelated results for every query, including exact domain strings (toyota forums, games, London Eye). It was discarded as unusable.
  - DuckDuckGo returned a challenge page (HTTP 202). Google and Brave returned 429. Ecosia and Mojeek returned 403.
  - I stopped there. A further attempt that would have worked around a bot check was denied by the permission layer, and I did not retry it.
  - **Mention counts, the linking-domain list and the JAN-PRO Toronto mention gap are therefore "not measurable from here".**
- **Common Crawl inbound-link list:**
  - I found the vertex IDs: ca.evergreencleaningservice = 6793922, ca.jan-pro = 6957332, com.jan-pro = 45459097.
  - I started a streaming scan of the 7.1 GiB domain edges file for edges into those IDs.
  - It was aborted on instruction before finishing, and `raw/backlinks/edges_hits.txt` is empty or incomplete. **Do not read an empty file as "no inbound links".**
  - To finish later, re-run the scan with `$2==ID`, then map the `from` IDs through the vertices file.
- **Yellow Pages, HomeStars (both 403) and LinkedIn (999):** not checked.
- **Moz DA/PA, Bing, DataForSEO:** no credentials, so DA and DR are **not measurable from here**.

## 2. Side-by-side

| Metric | evergreencleaningservice.ca | jan-pro.com | jan-pro.ca |
|---|---|---|---|
| First Wayback capture (domain-age proxy, 0.60) | 2019-08-17 (www host). The domain may be older; WHOIS not checked. | 2000-09-25 (query for 1996 returned this; query for 2000 returned 2001-02-05) | 2008-02-07 |
| CC graph harmonic-centrality rank (of 135.0M, 0.50) | 15,316,711 (top 11.3%) | 6,135,426 (top 4.5%) | 10,247,652 (top 7.6%) |
| CC graph PageRank rank (0.50) | 53,176,492 (top 39.4%) | 204,178 (top 0.15%) | 3,304,682 (top 2.4%) |
| PageRank value | 3.84e-9, essentially the graph floor (about 3.79e-9) | 1.28e-7, about 34x the floor | 1.24e-8, about 3x the floor |
| Hosts in graph | 3 | 26 | 4 |
| CC-MAIN-2026-43 records / unique 200 URLs | 68 / 64 (www plus an apex 301 to www) | 756 / 676 across 11 hosts (franchise regional subdomains such as austin., chicago., orlando.) | 43 / 37 |
| Mentions found by web search | not measurable from here | not measurable from here | not measurable from here |
| BBB Toronto-area search | "evergreen cleaning service" and "evergreen office cleaning": No Results. "evergreen cleaning" returned Evergreen Carpet Cleaning (Mississauga) and Evergreen Cleaning Services (North York). These are likely different businesses; identity not verified. | First results page for "jan-pro" showed only unrelated "Pro" businesses. No JAN-PRO profile seen; not exhaustive. | same as .com |
| Social profiles linked from site | Facebook `Evergreen-Cleaning-Service-104007224426820`, X `@EvergreenClean8` (page title "Evergreen Cleaning Service (@EvergreenClean8)"), LinkedIn `evergreen-cleaning-service-toronto`. LinkedIn returned 999 and Facebook showed a generic login title, so their content is unverified. | not examined | not examined |
| Qualitative tier | local-small | national brand, franchise network | national-brand regional site |

How to read the Evergreen CC numbers:
- A PageRank at the graph floor means Common Crawl sees almost no link equity flowing in.
- A harmonic-centrality rank in the top 11% means at least one inbound path exists from a reasonably connected domain, probably a directory or social link. It is not evidence of a broad profile.
- Both are domain-level, quarterly and approximate.

## 3. Linking and mentioning domains

**Verified inbound linkers: none obtained** (see section 1). The domains below are neither verified mentions nor verified links.

Known outbound or sameAs relationships from the Evergreen site, observed in the homepage HTML:
- facebook.com/Evergreen-Cleaning-Service-104007224426820
- twitter.com/EvergreenClean8/
- linkedin.com/company/evergreen-cleaning-service-toronto/
- g.page (Google Business Profile)
- issa.com (editorial link inside `src/content/blog/qualities-top-cleaning-professionals.md`)

**Reference authority of target domains (Common Crawl, same graph)**

| Domain | Harmonic-centrality rank | PageRank rank |
|---|---|---|
| org.bbb | 322 | 422 |
| com.yelp | 158 | 236 |
| ca.yellowpages | 356,600 | 13,097 |
| com.issa | 352,715 | 5,715 |
| org.issa | 416,121 | 61,958 |
| org.boma | 409,406 | 64,658 |
| org.bomatoronto | 6,004,556 | 1,927,908 |
| com.homestars | 498,836 | 27,486 |
| ca.canpages | 458,858 | 675,216 |
| com.bot (likely Toronto Board of Trade; not verified) | 1,942,716 | 100,494 |
| ca.torontochamber (this is a separate vertex; do not confuse with the Board of Trade) | 108,604,345 | not captured in the filtered results |

Read these as ordering only. For comparison, Evergreen is at 15.3M (HC) and 53.2M (PR). One link from any of these domains would sit far above Evergreen's current neighbourhood.

## 4. Toxic and outdated-name links

No toxic or spam links were found, because no inbound list was obtained. Spam Score is not measurable from here.

**Old brand.** The business was renamed from "Evergreen Cleaning Service" to "Evergreen Office Cleaning" (per `_research/gaps.md` and `_research/seo.md`). The entity signals are split:
- Schema, og and footer say "Evergreen Office Cleaning".
- The Facebook, LinkedIn and X handles, the testimonials and the domain still say "Evergreen Cleaning Service".
- There is no `alternateName` and no "formerly" statement anywhere (`findings/geo.md`).
- Any third-party citations, directories or profiles under the old name are a name-variant risk (NAP inconsistency) and cannot be audited without the mention sweep.
- Name collisions on BBB (Evergreen Carpet Cleaning, Evergreen Cleaning Services) also make citation matching harder.

**Old URLs (live check, 2026-10-28, host: Cloudflare).** All five requested old URLs return a single-hop real 301 to a 200 page.

| Old URL | Result |
|---|---|
| /commercial-cleaning-toronto-gta/ | 301 to /services/commercial-cleaning/, then 200 |
| /office-cleaning-and-janitorial-toronto/ | 301 to /services/office-cleaning/, then 200 |
| /property-management-and-building-maintenance/ | 301 to /services/building-maintenance/, then 200 |
| /disinfection-cleaning/ | 301 to /services/disinfection-cleaning/, then 200 |
| /testimonials/ | 301 to /reviews/, then 200 |

Extra checks, all 301 then 200 in one hop:
- /blog/ to /insights/
- /blog/be-safe-from-coronavirus-work/ to /be-safe-from-coronavirus-work/
- /blog/workplace-cleaning-checklist-winter/ to /workplace-cleaning-checklist-winter/
- /feed/ to /rss.xml
- /sitemap.xml and /sitemap_index.xml to /sitemap-index.xml
- /submit-your-testimonial/ to /reviews/
- /author/admin/ to /category/blog/
- Slashless /office-cleaning to /services/office-cleaning/
- Apex http and https to https://www (301)

/tag/cleaning/ returns 200 directly.

One probe is not a valid test: `/wp-content/uploads/2018/05/logo.png` returned 404. That path was my guess, not a real archived file, so it says nothing. `redirects.ts` holds 101 explicit upload-path rules, and I did not test them. Re-test with real archived upload URLs.

## 5. Link-building opportunities (realistic for a Toronto cleaning SMB)

All are candidates. None is confirmed as an existing link or a non-link.

1. **Supplier page.** The site cites Armstrong Manufacturing's ProSeries Green (UL ECOLOGO). Ask for a "where to buy / service providers" or case-study listing.
2. **Client testimonials and case studies.** Offer clients a testimonial plus a link back, or ask building owners to link from vendor pages. The `/reviews/` page already exists.
3. **Property-management and building associations.** BOMA Toronto (org.bomatoronto in the graph), plus the Toronto Board of Trade and local BIA/Chamber member directories (pending identity check). ISSA is already cited editorially on the site. Membership is a cost, and the site claims no memberships today, so only claim what is true.
4. **Citation and directory cleanup.**
   - Google Business Profile.
   - BBB: no Toronto profile was found under either brand name, so open one.
   - HomeStars, Yelp, Yellow Pages, Canpages.
   - Use one NAP and both brand names consistently.
   - Add "formerly Evergreen Cleaning Service" where it is true.
5. **Local news and trade press.** Pitch a data-led item such as GTA office-cleaning cost benchmarks, or a seasonal checklist (the site already has winter and fall posts), to Toronto business media and building-management newsletters.
6. **Reclaim old-brand mentions.** After the mention sweep, ask sites that cite "Evergreen Cleaning Service" to update to the current name and the www URL.
7. **Partner and referral pages.** Complementary vendors (facility maintenance, HVAC, security, coworking operators) in the same GTA cities listed on `/locations/`.

Avoid bought directory blasts and PBN links. With a near-zero baseline they carry a higher risk than payoff.

## 6. Gap vs JAN-PRO

- **Backlink and mention gap sizing:** not measurable from here, because the mention sweep and edge scan did not complete.
- **Authority gap (Common Crawl, 0.50):**
  - Jan-pro.com PageRank is about 34x the graph floor, against about 1.01x for Evergreen.
  - Jan-pro.com has 26 hosts against 3, and about 676 captured URLs against 64.
  - Jan-pro.ca is mid-way: PageRank rank 3.3M, harmonic-centrality rank 10.2M.
- **Why the gap exists:** JAN-PRO is a national franchise brand with regional subdomains and 20+ years of web history. Evergreen is a single-office GTA operator, and its earliest Wayback capture is from 2019.
- **Comparable level:** the right comparison for a Toronto cleaning SMB is other local operators, not JAN-PRO. Local-pack and page-level relevance matter more than domain authority here.

## 7. Cross-skill and next steps

- Finish the edge scan and map linking domains (free).
- Run the mention sweep with a working search tool (Google, with the exact queries in the brief).
- Get a free Open PageRank key.
- Consider Moz free tier or the DataForSEO extension for DA/DR, spam score and link velocity.
- `/seo content` for E-E-A-T and `/seo technical` for crawlability are separate.

## 8. Authority score

**Authority estimate: about 12/100, low confidence (0.50). Not a Backlink Health Score.**

Reasoning:
- PageRank sits at the graph floor (rank 53.2M of 135.0M).
- Harmonic centrality is top 11%, which is typical of a domain with a few well-connected inbound paths and no broad profile.
- Only 3 hosts and 64 captured pages.
- First Wayback capture 2019.
- No verified memberships, directory profiles or press found.
- Split brand and entity naming.
- On the plus side, the redirect map is clean and complete, which protects whatever links exist.
- For calibration under the same method, jan-pro.com would be about 70/100 and jan-pro.ca about 35-40/100.

Factors scored: domain authority proxies (Common Crawl), domain age, crawl footprint. Factors skipped (no data): referring-domain count, domain-quality distribution, anchor text, toxic ratio, link velocity, follow/nofollow, geographic relevance. Four or more health-score factors are missing, so the Health Score stays INSUFFICIENT DATA.

## 9. Files

- Raw data: `/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/raw/backlinks/`
- Helper scripts: `.../evergreencleaningservice.ca-audit/scripts/` (bing_parse.py, rss_parse.py, br.sh, bq.sh, cdx_stats.py)
- The Bing outputs `bing_q*` and `rss_*` are unrelated junk results kept only as evidence of the engine failure.

# Evergreen's own backlink profile (12 Nov 2026)

Scope: evergreencleaningservice.ca (root domain; `www` is canonical). Sources: Moz API v2 (read-only) and live `curl` checks of the site. Raw data is in `data/evergreen-*.json`.

## Read this first: the Moz quota ran out after 52 rows

| | Rows consumed (`/v2/usage_data`) |
|---|---|
| Before this task | **75** |
| After this task | **127** |
| Used by this task | 52 (2 `url_metrics` + 50 `linking_root_domains`) |

The second page of `linking_root_domains` returned **HTTP 403 "The account does not have enough quota remaining for current period" (`insufficient-quota`)**. So did `anchor_text` (limit 50), `top_pages` (limit 50) and one small probe (`anchor_text`, limit 5). I stopped there and did not retry in a loop. The plan's real ceiling looks like about 125 to 130 rows per period, not the 1,500 the brief budgets. **Every other Moz task in this run will hit the same 403** until the period resets or the plan is upgraded. Evidence is in `data/evergreen-moz-quota.json`.

What this means for this file:
- **Delivered:** domain metrics for both hosts, and the top 50 linking root domains by DA.
- **Not delivered from Moz:** the remaining ~224 linking domains, anchor text, and top pages. In place of `top_pages` I checked every legacy URL the repo knows about on the live site (section 3). That check is complete for the URLs we know of. It cannot rank them by link count.
- Anchor findings in section 5 come from the earlier Moz pull summarised in `docs/growth/local-seo-kit.md` (crawled 20 Oct 2026), not from new data.

## 1. Headline metrics (Moz, `data/evergreen-url-metrics.json`)

| Metric | `evergreencleaningservice.ca` | `www.evergreencleaningservice.ca` |
|---|---|---|
| HTTP code seen by Moz | 301 (crawled 12 Oct) | 200 (crawled 20 Oct) |
| Domain Authority | 52 | 52 |
| Page Authority (home) | 37 | 28 |
| Spam Score | 1% | 1% |
| Linking root domains (whole domain) | 274 | 274 |
| of which nofollow | 38 | 38 |
| Linking root domains lost (deleted) | 23 | 23 |
| External linking pages (whole domain) | 1,289 | 1,289 |
| Linking pages lost (deleted) | 1,309 | 1,309 |
| Root domains linking to this host | 252 | 273 |
| Outbound root domains | 15 | 15 |

Caveats. DA is Moz's own score, not a Google metric. Moz's index is a sample, so these counts are incomplete. The bare-domain home page has a higher PA (37) than `www` (28) because many old links point at the non-www address. Both 301 to `https://www.` in one hop (checked live today), so that equity is passed on.

**DA 52 overstates this site.** A local cleaning company with real links from a few dozen sites would normally sit far lower. The top 50 linking domains below explain why.

## 2. Top 50 linking root domains by DA (`data/evergreen-linking-root-domains.json`)

| Group | Domains | DA | Spam score | Linking pages |
|---|---|---|---|---|
| Google country domains (google.de, .it, .fr, .ca, .co.jp, ... .com.hk) | **48** | 83–95 | 6–9% | 216 in total. Each has exactly 2, 4 or 6 pages (26 have 4, 17 have 6, 5 have 2) |
| maps.google.com | 1 | 97 | n/a | 4 |
| myspace.com | 1 | 95 | 8% | 1 |

48 of the top 50 are Google ccTLDs. Their counts come only in steps of two, are near-identical, and span 48 countries a Toronto cleaner has no tie to. That is the footprint of Google redirect URLs (`google.xx/url?q=https://evergreencleaningservice.ca...`). Automated "Google redirect backlink" packages and scraper tools create these. Google does not count its own redirect URLs as editorial links. I could not see the individual URLs because the link-level endpoints were out of quota, so treat the redirect mechanism as a strong inference, not a confirmed fact. Either way they are worthless, but not harmful: nobody can disavow their way out of a link from google.de, and nobody needs to.

The two non-Google entries:
- **maps.google.com**: the Google Business Profile / Maps listing. A real citation.
- **myspace.com**: one page. Probably an old profile or an auto-generated listing. Unverified.

**The DA-sorted top 50 contains no editorial link at all.** The links that matter are among the 224 domains Moz did not return. The earlier pull reached the same conclusion: real sites that chose to link are "probably in single digits to low tens".

### Classification

Only the 50 returned domains can be classified. Nothing has been invented for the rest.

| Category | Count (of 50 seen) | Domains |
|---|---|---|
| directories and citations | 1 | maps.google.com |
| local and community | 0 | — |
| industry and associations | 0 | — |
| suppliers and partners | 0 | — |
| news and media | 0 | — |
| education and government | 0 | — |
| blogs and articles | 0 | — |
| scraper or spam (non-editorial, auto-generated) | 48 | Google ccTLD redirect pages |
| unknown | 1 | myspace.com |
| **not retrieved (quota)** | **224** | — |

When quota returns, pull the remaining pages with the saved `next_token_unused` in `data/evergreen-linking-root-domains.json`. That costs about 230 rows. Sorting by `source_domain_authority` puts the Google noise first, so the useful rows are pages 2 to 6. A free alternative: Search Console > Links > "Top linking sites" and "Top linked pages". It is Google's own list, it is more relevant than Moz's, and it needs no quota.

## 3. Lost link reclamation (live checks, `data/evergreen-url-status.json`)

Because `top_pages` was blocked, I requested **every legacy URL the repo knows about** on the live site at 1 request per second. That is 69 Wayback-derived paths from `_research/url-preservation.md` and related research, the 10 Section 2.1 sources in `src/data/redirects.ts`, both sitemaps, and 3 host and protocol variants. I followed redirects and recorded the final status. I also tried 18 common WordPress paths and 9 slashless spellings to probe for gaps, 111 requests in all. Of the 18 guesses, `/locations/` returns 200 and the other 17 return 404.

**Results**

- **All 84 known URLs (including the 3 host and protocol variants) resolve: 0 hard 404s, 0 soft-404s.**
  - 31 return 200 directly. 53 return a 301 in **one hop** to a live 200 page. No chain is longer than one hop.
  - The old service URLs, `/blog/*`, `/blog/page/N/`, the COVID posts and other retired posts, `/feed/`, both sitemaps, `/testimonial(s)/`, `/submit-your-testimonial/` and `/author/webmaster/` all redirect correctly.
- `http://` and the bare domain both 301 to `https://www.` in one hop.
- Slashless spellings (`/about-us`, `/office-cleaning`, `/commercial-cleaning-toronto-gta`, ...) 301 correctly.
- No 200 page carried a "not found" title. Redirects land on topical pages, not the home page, so none of them looks like a soft-404.

**The only 404s are paths I guessed.** None appears in the Wayback crawl or the repo research, so there is **no evidence any of them carries a link**:

| Guessed path (404 today) | Best live target if Search Console shows links to it | Existing rule in `redirects.ts` |
|---|---|---|
| `/about/` | `/about-us/` | none |
| `/contact/` | `/contact-us/` | none |
| `/privacy-policy/` | `/privacy/` | none |
| `/get-a-quote/`, `/free-quote/`, `/quote/` | `/request-a-quote/` | none |
| `/home/` | `/` | none |
| `/our-services/` | `/services/` | none |
| `/janitorial-services/`, `/office-cleaning-toronto/` | `/services/office-cleaning/` | none |
| `/commercial-cleaning-toronto/` | `/services/commercial-cleaning/` | none |
| `/portfolio/` | `/cleaning-demo-gallery/` | `/portfolio/project-title-sixth/` only |
| `/faq/`, `/careers/`, `/team/`, `/our-team/` | no equivalent page; leave as 404 | none |
| `/wp-login.php` | leave as 404 | none |

Link counts: **unknown**. Moz `top_pages` was blocked and the Wayback CDX API was unreachable from this network (connection reset three times). **Recommendation:** add nothing yet. Open Search Console > Links > "Top linked pages" (external) and check whether any listed URL is not already a 200 or covered by a rule. Only those need new 301s. Any of the "best target" mappings above would be harmless to add if a link turns up.

**Verdict: no link equity is currently being wasted on a known legacy URL.** The migration's redirect work holds up on the live site.

## 4. Toxic links and disavow

| Signal | Evidence | Assessment |
|---|---|---|
| Domain spam score | 1% for both hosts (Moz) | Low |
| 48 Google ccTLD redirect domains | Uniform 2/4/6 pages each, spam score 6–9%, no Canadian relevance | Manipulative footprint, very likely from an automated tool or a purchased "Google redirect" package at some point. Google ignores its own redirect URLs. **Cannot and need not be disavowed.** |
| Scraper pages with anchors like "high quality dofollow backlinks … pbn network service evergreencleaningservice.ca" and unrelated `.xyz` domains | Earlier Moz pull, quoted in `docs/growth/local-seo-kit.md` §4 (not re-verified today: anchor endpoint out of quota) | Spam, but a handful of pages. Typical background noise that Google discounts. |
| Lost links | 23 root domains and 1,309 pages marked deleted by Moz | Normal churn for a site whose old pages and scraper listings come and go. Nothing to act on without link-level data. |

**Disavow: not warranted.** There is no manual action on record, and the spam is either Google's own redirect URLs (which cannot be disavowed) or a handful of scraper pages (which Google already ignores). Revisit only if Search Console shows a manual action under Security & Manual actions, or if a large new block of artificial links appears. This matches the position already in the local SEO kit.

If anyone at Evergreen ever bought a "DA booster" or "Google redirect backlinks" package, stop it. It is the most likely source of the inflated DA, and it adds nothing.

## 5. Anchors and the legacy brand name

No new anchor data: `anchor_text` was blocked (quota). From the 20 Oct pull (local SEO kit §4):
- **About 94% of anchors are the bare URL** (`evergreencleaningservice.ca`, `www.evergreencleaningservice.ca`, ...). That is the mark of scraper, "website worth" and auto-generated pages, not of people choosing to link.
- **Legacy brand name.** The domain itself is the old name "Evergreen Cleaning Service". Every bare-URL anchor therefore carries the legacy brand, as does any citation still listing "Evergreen Cleaning Service". The Facebook page name and URL, for example, still use it (kit §3). This does not hurt rankings, since Google ties both names to the same domain. For consistency, though:
  - New links should use **"Evergreen Office Cleaning"** or the business name with "since 1989", not keyword anchors.
  - When a citation is corrected to the new name, keep the URL as is.
  - Do not ask existing linkers to change anchors. That is not worth the effort.
- Re-pull `anchor_text` (about 50 rows) when quota allows, to confirm the 94% figure and search for "Evergreen Cleaning Service" and keyword anchors.

## 6. What this means for "better backlinks"

1. **Measure progress by editorial linking domains, not DA.** DA 52 is propped up by Google redirect pages. The real baseline is the small number of sites that chose to link, probably under 30.
2. **The site is ready to receive links.** Every legacy URL resolves in one hop, so any reclaimed or new link will count.
3. **Next steps, cheapest first.**
   - (a) Export Search Console's "Top linking sites" and "Top linked pages" to get the true list, at no Moz cost.
   - (b) When Moz quota resets, finish `linking_root_domains` pages 2 to 6 (about 230 rows) and `anchor_text` (about 50). Classify the editorial remainder into the categories above.
   - (c) Earn links from the sources in the local SEO kit §4: the BIA for 243 Queen St W, trade bodies with public directories, property-manager vendor pages, client case studies, supplier partner pages and community sponsorships. The competitor analysis in this folder should rank those.

No outreach, sign-ups or writes were made. Files written: this report, `data/evergreen-url-metrics.json`, `data/evergreen-linking-root-domains.json`, `data/evergreen-url-status.json` and `data/evergreen-moz-quota.json`.

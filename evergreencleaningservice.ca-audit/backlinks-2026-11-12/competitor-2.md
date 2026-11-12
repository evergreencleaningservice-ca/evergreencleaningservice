# Competitor backlinks, part 2: TitanEdge and Nova (12 Nov 2026)

Competitors covered:
- **TitanEdge Commercial Cleaning** (titanedgecleaning.com)
- **Nova Building Maintenance** (novabuildingmaintenance.com)

Raw data is in `data/competitor-titanedgecleaning.com-*.json` and `data/competitor-novabuildingmaintenance.com-*.json`.

## Read this first: Moz returned no data for either competitor

| | Rows consumed (`/v2/usage_data`) |
|---|---|
| Before this step | **127** |
| After this step | **127** |
| Used by this step | 0 of the ~320 allocated (about 160 per competitor) |

I made one probe per competitor:
- `linking_root_domains` for titanedgecleaning.com (limit 50, sorted by DA)
- `anchor_text` for novabuildingmaintenance.com (limit 25)

Both came back **HTTP 403 "The account does not have enough quota remaining for current period" (`insufficient-quota`)**. That is the same error the Evergreen-profile and competitor-selection steps hit. I did not retry and I did not call the other four endpoints. The account seems to stop at about 127 rows per period, far below the 1,500-row budget in the brief.

**So this file has no Moz numbers for TitanEdge or Nova.** That means:
- no Domain Authority (DA)
- no linking root domain list or count
- no anchor text
- no Moz top pages
- no spam score

The nine linking-domain categories the task asks for **cannot be filled in yet**, because there is no domain list to classify. I have not estimated any of these metrics. Each `-linking-root-domains`, `-anchor-text` and `-top-pages` JSON file holds the exact request body and an empty `results` array, ready to run when the quota resets (see "When the quota resets" below).

Because the brief's task gave me no WebSearch allowance, I used no web searches. What I could do was read-only `curl` of the competitors' own public pages. That shows **what each site has built that could earn links, and what looks manipulative**. It does not show who actually links to them. Everything under "likely link sources" below is a **hypothesis to check against Moz**, not a finding.

## TitanEdge Commercial Cleaning (titanedgecleaning.com)

*On-site evidence is in `data/competitor-titanedgecleaning.com-onsite.json`.*

### What the site is
- **Platform:** a static `.html` site with 92 URLs in its sitemap.
- **Title:** "Toronto's #1 Commercial Cleaning Service".
- **Experience:** it claims "4+ years", which puts its founding around 2022. Evergreen has been operating since 1989.
- **Pages:**
  - 6 Toronto service pages
  - **55 city-by-service pages:** 5 services across 11 GTA cities (Mississauga, Brampton, North York, Scarborough, Etobicoke, Markham, Vaughan, Richmond Hill, Oakville, Burlington, Ajax)
  - 21 blog posts
- **City pages are localised, not copies.** I compared the Mississauga and Markham office-cleaning pages with the city names swapped out. Their word sequences are only 28% alike, and the Mississauga page names real local places (Airport Corporate Centre, Pearson). That is the legitimate way to build location pages.
- **No credibility links appear anywhere I checked** (home, about, a blog post):
  - no association badges (ISSA, BOMA, BBB, chamber)
  - no press mentions
  - no sponsorships
  - no supplier or partner links
- **The only outbound link** is to its Google review page.

### Pages likely to earn links (hypotheses)
| Asset | Why it could attract links | Check in Moz `top_pages` |
|---|---|---|
| `/blog/commercial-cleaning-cost-toronto.html` | Cost guides are what local journalists and "how much does it cost" roundups cite | yes |
| `/blog/commercial-cleaning-checklist-toronto-businesses.html` | Checklists get bookmarked and shared by office managers and property managers | yes |
| `/blog/how-to-choose-commercial-cleaning-company-toronto.html`, `/blog/commercial-cleaning-contracts-explained.html`, `/blog/how-to-switch-commercial-cleaning-providers.html` | Buyer guides for facility managers | yes |
| 55 city-by-service pages | These earn citations, not editorial links. Expect directory profiles that point at the home page or a city page | yes |
| Home page | Expect most links here: GBP, directories, social | yes |

### Likely link sources (hypotheses, unverified)
- **Directories and citations.** An earlier step found it in HomeStars, Clutch and Yellow Pages-style results.
- **Its own `titanedge-cleaning.pages.dev` mirror.** In Moz that host rolls up under the root domain `pages.dev`, so it may show up as a high-DA "linking root domain".
- **Few or none of these:** association, news, education or community links. Nothing on the site points to memberships, sponsorships or press.

### Manipulative or risky patterns
- **Full duplicate of the site on `titanedge-cleaning.pages.dev`**, indexable (`index, follow`) and ranking in search. It is canonicalised to the main domain, which reduces the duplicate-content harm. But any links from it to titanedgecleaning.com are **self-created**, and they will inflate Moz's linking-domain and DA figures for no real authority. **Do not copy this.**
- **"Toronto's #1" in the title** is an unsupported superlative. It is not a link issue, but it is a credibility weakness Evergreen can contrast with 37 years of real history.
- **Nothing else showed up from the pages I checked:** no exact-match anchor footers, no "partner" link blocks, no sponsored posts on the site itself. Anchor text and referring pages need Moz to confirm.

## Nova Building Maintenance (novabuildingmaintenance.com)

*On-site evidence is in `data/competitor-novabuildingmaintenance.com-onsite.json`.*

### What the site is
- **Platform:** WordPress with the Avada theme and Yoast.
- **Size:** 129 pages and 19 posts.
- **Office:** 2275 Upper Middle Rd E, **Oakville**.
- **Experience:** it claims "20+ years", and says it is insured, bonded and WSIB-covered.
- **Its business model is unusual. Nova runs a subcontractor network and sells cleaning contracts.** The site has these pages:
  - `/cleaning-contracts-for-sale/`
  - `/subcontractor-application/`
  - `/subcontractor-agreement/`
  - `/network-contractor-terms-conditions/`
  - about **80 subcontractor profile pages**, for example `/dcd-cleaning/`, `/eco-clean-pros/` and `/peachy-clean/`

  The profile pages link only to Nova's own pages. They do not link out to the subcontractors.
- **About 30 "commercial-office-cleaning-services-in-<city>" pages**, including Winnipeg, Regina, Calgary, Edmonton, Halifax, Ottawa, Vancouver and Niagara Falls. The firm has one Oakville office.
- **The blog mostly targets other cleaning businesses:**
  - "How to secure more cleaning contracts"
  - "Why liability insurance is important for cleaning companies"
  - a "Cleaning training" series
  - a strip-and-wax guide

  Since 2025 it has added city cost and checklist posts (Mississauga, Brampton, Oakville, Toronto).
- **Related sites:**
  - **novabuildingsupply.com**, a sister Shopify supply store. Nova links to it sitewide, but the store's home page does not link back.
  - **cleaningcontractornetwork.com**, a US-focused contractor directory with a Nova profile. When I fetched that profile it had no link to Nova's domain.
- **Social profiles:** Facebook, Instagram, TikTok, X/Twitter and YouTube.
- **Associations, press, sponsorships:** none seen.

### Pages likely to earn links (hypotheses)
| Asset | Likely linkers | Relevance to Evergreen's buyers |
|---|---|---|
| `/cleaning-contracts-for-sale/`, subcontractor and network pages | Cleaning-business forums, small-business and franchise-opportunity sites, subcontractors' own sites | Low. The audience is other cleaners, not office managers |
| Blog posts for cleaning-business owners (insurance, winning contracts, training) | Cleaning-industry blogs and Q&A sites | Low to medium |
| City cost and checklist posts (2025–2026) | Local roundups | Medium |
| Home page | Directories, social, GBP, sister sites | n/a |

### Likely link sources (hypotheses, unverified)
- **Self-published satellite pages.** The selection step saw them on notion.site and sites.google.com, titled "Top Tier Toronto Office Cleaning" and "Reliable Toronto Janitorial Services".
- **Owned or related sites:** novabuildingsupply.com and cleaningcontractornetwork.com.
- **Subcontractors' sites,** linking to Nova as their contract source.
- **Cleaning-industry content sites.**
- **Directories.**

Expect the link count to look healthy while the **share of real local editorial links is small**.

### Manipulative or risky patterns
- **Self-made links on Notion and Google Sites, with keyword titles.** This matches "links you create yourself to manipulate rankings" in Google's spam policies. **Do not copy this.** The exact URLs were not recorded in the earlier step. Moz `linking_root_domains` would list them under `notion.site` and `google.com`.
- **Doorway-style city pages.** The Calgary and Halifax pages are **100% identical** once the city name is swapped (1,227 words each). There are about 30 of them, mostly for cities where Nova has no office. This breaks Google's doorway-page policy, and pages like these earn no links. **Do not copy this.**
- **A network of owned and related sites cross-linking:** Nova, Nova Building Supply and possibly Cleaning Contractor Network. The links I saw ran mostly outward from Nova, so this is a weak signal. Moz should show whether the reverse links exist and whether they use exact-match anchors.
- **A sitewide footer credit to 7venology.com** (its web agency). That is an outbound link, so it does not affect Nova's backlinks. It is only noted because sitewide footer links are a known pattern to look for in anchor data.

## How Evergreen can beat both (realistic, no manipulation)

Neither competitor shows **any** of the link types that are hardest to fake and most relevant to office-cleaning buyers:
- associations
- press
- community sponsorships
- supplier or partner links
- education and government

That gap is Evergreen's opening, and its 37-year history is an asset neither competitor can match.

1. **Association and certification listings.** These are real member directories. Check each one for a member listing with a link:
   - BOMA Toronto
   - ISSA / ISSA Canada
   - CSSA (Canadian Sanitation Supply Association)
   - Toronto Region Board of Trade
   - the BIA for Queen St W

   Neither competitor shows any of them.
2. **A "since 1989" local story for press.** Pitch a 37-year Queen St W business story to local outlets such as BIA newsletters, neighbourhood papers and business-anniversary features. That earns news and community links. TitanEdge (founded about 2022) and Nova (Oakville) cannot tell that story.
3. **Linkable buyer guides with first-hand data.** TitanEdge's cost, checklist and contract guides are generic. Evergreen already has `/office-cleaning-cost-toronto-guide` and `/office-cleaning-checklist`. Make them clearly better than TitanEdge's by adding:
   - real price ranges from Evergreen's own quotes
   - a downloadable checklist
   - an Ontario standards section for medical and dental clients

   Then offer them to property managers, BOMA resources and coworking operators as a citation.
4. **Supplier and partner links.** Ask equipment and chemical suppliers, and long-term building or property-management clients, whether they run customer or case-study pages. These are earned through real relationships. They are not link exchanges.
5. **Location pages done like TitanEdge's, not Nova's.** Build them only for areas Evergreen actually serves, with real local detail. Then use them as the target for genuine local citations and chamber listings.
6. **Clean directory hygiene.** Match TitanEdge on HomeStars, Clutch and Yellow Pages, using consistent NAP (business name, address and phone) at 243 Queen St W. That is the floor, not the advantage.

**Do not copy:**
- mirror sites on `pages.dev`
- Notion, Google Sites or similar satellite pages
- city-swap doorway pages
- networks of sister sites linking to each other
- paid or "exchange" links of any kind

## When the quota resets
Run these six calls once each, pausing 2 seconds between them. They come to about 300 rows, within the ~320 allocated:
- `/v2/linking_root_domains`: `{"target":"<domain>/","target_scope":"root_domain","limit":50,"sort":"source_domain_authority"}`, then one `next_token` page for 100 rows
- `/v2/anchor_text`: `{"target":"<domain>/","scope":"root_domain","limit":25}`
- `/v2/top_pages`: `{"target":"<domain>/","scope":"root_domain","limit":25}`

The bodies are already saved in the JSON files. Then:
- Classify the domains into the nine categories.
- Confirm or reject the hypotheses above. In particular, check for `pages.dev`, `notion.site`, `sites.google.com`, novabuildingsupply.com and exact-match anchors such as "office cleaning Toronto".

**Limits:**
- Moz's index is a sample, so its counts are never complete.
- DA is a Moz score, not a Google one.

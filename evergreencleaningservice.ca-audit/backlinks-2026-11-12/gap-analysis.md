# Link-gap analysis: Evergreen Office Cleaning vs six competitors (12 Nov 2026)

Target: evergreencleaningservice.ca (www canonical). Competitors: coverall.com, stratusclean.com, titanedgecleaning.com, novabuildingmaintenance.com, cancore.com, wecleanit.ca. Raw data: `data/gap.json`.

## Read this first: the link intersect could not be computed

| | Moz rows consumed (`/v2/usage_data`) |
|---|---|
| Before this step | **127** |
| After this step | **127** |
| Used by this step | **0** (allocation was 0 rows, saved data only) |

A real link intersect needs each competitor's list of linking root domains. **Moz returned zero linking domains for all six competitors.** Every call in the earlier steps was refused with 403 `insufficient-quota`, and each `data/competitor-*-linking-root-domains.json` and `*-moz.json` file holds an empty `results` array. For Evergreen itself only 50 of 274 linking domains were retrieved, and 48 of those are Google ccTLD redirect pages.

So, honestly:
- **Domains linking to 2 or more competitors but not to Evergreen: cannot be determined.** The list in `gap.json` is empty. I did not estimate one.
- **Strongest domains linking to only one competitor: cannot be ranked by DA,** because no DA values exist for any linking domain. The DA column below is "n/a" throughout.

**What I did instead.** I took every link source the earlier steps *saw or that a competitor claims on its own site* (memberships, certifications, directory profiles, press syndication, satellite pages). I opened each linking page, listing or join page read-only with `curl`, one request per second, about 75 requests in all. Then I added the obvious Toronto commercial-cleaning sources that none of the six showed, and checked that each one exists. I ran no web searches, because the task allowed none.

**To get the real intersect when quota resets:** run `linking_root_domains` (limit 50 plus one `next_token` page) for each competitor. That is about 600 rows for six. Also run Evergreen pages 2 to 6 with the saved `next_token_unused`, about 230 rows. Then intersect on `root_domain`. The request bodies are already saved in the JSON files.

## What the verification found

- **No competitor has a verified association, chamber, BIA, media or partner link.** Only two links to a competitor could be confirmed, and both are low value:
  - Stratus's PR Newswire release links to stratusclean.com through a `c212.net` redirect with `rel="nofollow"`. That is **paid, syndicated and nofollow**: not editorial.
  - TitanEdge's `titanedge-cleaning.pages.dev` mirror links to titanedgecleaning.com and canonicalises to it. That is **self-created**.
- **Cancore's claimed memberships could not be confirmed as links.** Cancore claims Landscape Ontario membership and Smart About Salt certification on its own site. Both directories exist, but they load their results by JavaScript or AJAX, so Cancore's entry and link were **not verified**.
- **Green Building Canada is a real, open directory with a cleaning company in it.** It lists Generations Cleaning, an alternate competitor, with a **`rel="nofollow external"`** link. It is the one verified directory link to a GTA commercial cleaner.
- **Nova's Cleaning Contractor Network profile exists but has no link** to novabuildingmaintenance.com (verified absence).
- **"websites.ca" is a web-design company.** The listing for Swift Janitorial is an agency page, not an independent directory.
- **HomeStars, Clutch and RenovationFind block automated requests** (Cloudflare 403). Competitor profiles there are **not verified**.
- **Manipulative patterns.** Self-made `pages.dev`, Notion and Google Sites pages (TitanEdge, Nova), an agency-hosted directory (We Clean It via xi-digital.com) and paid wire distribution (Stratus). **Evergreen should copy none of these.**

The gap is not a list of links competitors have that Evergreen lacks. **The six have almost no credible local links either.** The opportunity is to get the links none of them have.

## Ranked opportunity table

Ranking weighs relevance to a Toronto B2B office cleaner, likely authority and how obtainable each link is. DA is n/a for every row (no Moz data). "Verified" refers to what could be confirmed today: that the source exists, the cost and, where relevant, the competitor's link.

| # | Domain | DA | Competitors linked | Type | How to get it | Cost | Effort | Verified |
|---|---|---|---|---|---|---|---|---|
| 1 | queenstreetwest.ca (Queen Street West BIA) | n/a | none seen | Local BIA listing and sponsorship | Confirm 243 Queen St W is inside the BIA boundary, then ask the BIA office about the member listing and events | Not shown. Toronto BIAs are funded by a levy on commercial property, not a joining fee (general model, not confirmed on the page) | Low | Exists: yes (site live, listed by TABIA). Boundary and link: **not verified** |
| 2 | bot.com (Toronto Region Board of Trade) | n/a | none seen | Paid membership | Corporate membership. Benefits include "Member directory access" and "Features and branding on the Board's platforms". Ask whether the public directory links out **before** paying | PROFILE $1,625; PROFILE+ $5,300; INFLUENCE $11,250 per year (shown) | Medium | Exists and price: **verified**. Public link: **not verified** |
| 3 | Clients' and property managers' own sites | n/a | none confirmed (We Clean It links *out* to 11 clients) | Editorial or partner | Publish 2 to 3 real case studies with long-term clients (with permission). Ask whether they run vendor, partner or testimonial pages. No reciprocal swaps | Staff time | Medium | **Not verified** (no Moz data) |
| 4 | bomatoronto.org (BOMA Toronto) | n/a | none seen | Paid membership (Allied Member: suppliers to commercial real estate) | Join as an Allied Member for access to property managers, events and sponsorships. **The member directory is login-only**, so expect no public backlink from it | Allied Member $2,799 (shown) | Medium | Fee: **verified**. Directory: login-only (verified) |
| 5 | greenbuildingcanada.ca | n/a | generationscleaning.ca (alternate) | Directory listing | Submit a listing in the Green Building Directory, citing green cleaning practices | Not shown | Low | **Verified**: competitor link present, `rel="nofollow external"` |
| 6 | issa-canada.com (ISSA Canada) | n/a | none seen | Paid membership plus member directory; optional CIMS certification | Join as a building service contractor. The directory promises "additional visitor traffic directed to website". Consider CIMS later | Not shown (bot challenge) | Medium | Directory exists: **verified**. Listing link: **not verified** (directory.issa.com unreachable) |
| 7 | blogto.com, toronto.com, streetsoftoronto.com | n/a | none checked | Editorial (local media) | Pitch real stories only: 37 years on Queen St W, long-serving staff, a community clean-up, data from Evergreen's own cost guide | None | High | Sites exist: **verified** |
| 8 | Community sponsorships (BIA events, local teams) | n/a | none seen | Sponsorship | Sponsor events near the office for the relationship. Some sponsor pages use `rel="sponsored"` or nofollow | Varies | Medium | **Not verified** |
| 9 | yellowpages.ca and canada411.ca | n/a | none of the six on page 1 for "commercial cleaning Toronto ON" | Free directory listing (citation) | Claim or correct the free listing as "Evergreen Office Cleaning", 243 Queen St W | Free basic; paid ads | Low | Exists: **verified**. Website link not visible in listing HTML |
| 10 | homestars.com | n/a | titanedgecleaning.com (hypothesis) | Free listing, paid upgrades | Claim a free profile and collect real client reviews | Free basic | Low | **Not verified** (403) |
| 11 | bbb.org | n/a | none seen | Free profile; accreditation is paid | Check the profile. Accreditation is optional | Not shown | Low | Exists: **verified**. Profile link: **not verified** |
| 12 | bing.com/forbusiness (Bing Places) | n/a | n/a | Free listing (citation, not a crawlable backlink) | Import the Google Business Profile | Free | Low | Exists: **verified** |
| 13 | business.apple.com (Apple Business Connect) | n/a | n/a | Free listing (citation, not a crawlable backlink) | Claim the Apple Maps place card | Free | Low | Exists: **verified** |
| 14 | certified.greenseal.org (Green Seal GS-42) | n/a | stratusclean.com claims GS-37 *products* | Certification listing | GS-42 certifies cleaning *services*. Certified companies appear in Green Seal's directory | Paid audit; amount not shown | High | Directory exists: **verified**. Stratus entry: **not verified** (JavaScript search) |
| 15 | cleanlink.com | n/a | none seen | Trade press (editorial) | Offer a genuine expert article or real data. The buyers' guide is for manufacturers and distributors, not contractors | Free (editorial) | Medium | Exists: **verified** |
| 16 | bscai.org | n/a | none seen | Paid membership | Check for a public member directory with links before joining. US-centric | Not extracted | Medium | Exists: **verified**. Directory: **not verified** |
| 17 | clutch.co | n/a | titanedgecleaning.com (hypothesis) | Free listing | Only if a Toronto cleaning or facilities category exists. Clutch is mainly IT and agency services | Free basic | Medium | **Not verified** (403) |
| 18 | IFMA Toronto chapter | n/a | none seen | Paid membership (facility managers) | Highly relevant audience. Find the current chapter site first | Not shown | Medium | **Not verified**: ifmatoronto.org unreachable (proxy 502), ifma.org/chapters/toronto/ 404 |
| 19 | smartaboutsalt.com | n/a | cancore.com (claimed) | Certification listing | Only if Evergreen offers winter salt or snow services; requires training | Not shown | High | Directory exists: **verified**. Cancore entry: **not verified** (AJAX) |
| 20 | UL ECOLOGO (ul.com, spot.ul.com) | n/a | none | Product certification: **not obtainable** for a service firm | Use ECOLOGO-certified products and say so on the site. A supplier case study is the only link route | n/a | n/a | Exists: **verified**. No ECOLOGO "cleaning services" page found |
| 21 | Armstrong ProSeries Green distributor listings | n/a | none | Supplier page | **Could not confirm this programme exists** (guessed domain unreachable; no web search allowed). Ask Evergreen's real suppliers for "find a contractor" or customer pages instead | Unknown | Low | **Not verified** |
| 22 | cssa.com (Canadian Sanitation Supply Association) | n/a | none | Association | The domain serves a script redirect to `/lander` (parking pattern). The association was not found there | Unknown | n/a | **Not verified** |
| 23 | landscapeontario.com | n/a | cancore.com (claimed) | Paid trade membership | Not relevant unless Evergreen does landscaping | Plans on members site | High | **Not verified** |
| 24 | careerplug.com | n/a | cancore.com (careers microsite) | Supplier (applicant-tracking vendor) | Only a by-product of using a paid ATS. Low value | Paid software | Low | **Not verified** (now redirects to sign-in) |
| 25 | websites.ca | n/a | swiftjanitorial.ca (alternate) | Web-agency page | Skip: an agency, not a directory | n/a | n/a | **Not verified** |
| 26 | cleaningcontractornetwork.com | n/a | novabuildingmaintenance.com (profile, **no link**) | US contractor network | Skip | n/a | n/a | **Verified**: profile exists without a link |
| 27 | entrepreneur.com, franchisetimes.com, franchise.org | n/a | coverall.com, stratusclean.com | **Not obtainable** (franchisor rankings and association) | Local equivalent: local awards and earned press (rows 1, 7) | n/a | n/a | **Not verified** (no plain href to coverall.com on Entrepreneur page) |
| 28 | prnewswire.com and its syndication (Yahoo Finance, fox16.com, openpr.com, contentmassive.com) | n/a | stratusclean.com | Paid press release | **Not recommended**: paid, syndicated, nofollow, not editorial | Paid | n/a | **Verified**: `rel="nofollow"` via `c212.net` redirect |
| 29 | pages.dev, notion.site, sites.google.com | n/a | titanedgecleaning.com, novabuildingmaintenance.com | **Self-created (manipulative)** | **Do not copy.** Google's spam policies treat links you create to manipulate rankings as link spam | n/a | n/a | TitanEdge: **verified**. Nova: **not verified** (URLs not recorded) |
| 30 | xi-digital.com (blocal.dev4), novabuildingsupply.com | n/a | wecleanit.ca, novabuildingmaintenance.com | Agency-run directory and sister site (**not obtainable**) | **Do not copy** links a vendor or the business itself controls | n/a | n/a | **Not verified** |

## How Evergreen gets ahead

1. **Do the cheap groundwork this month.** Rows 9 to 13 are free:
   - Bing Places, Apple Business Connect, Yellow Pages/Canada411, HomeStars and BBB, all with one NAP: "Evergreen Office Cleaning", 243 Queen St W.
   - Green Building Canada (row 5).

   These are citations and nofollow listings. They are the floor, not the advantage.
2. **Get the local credibility links none of the six has.** Two to start:
   - **Queen Street West BIA** (row 1): confirm the boundary first.
   - **Toronto Region Board of Trade** (row 2): ask about the public directory before paying $1,625.

   Then decide on **BOMA Toronto** ($2,799) for the property-manager relationships, knowing its directory is login-only.
3. **Earn the hardest links to copy.** Real client case studies and vendor pages (row 3), plus local press with real stories (row 7). Evergreen's 37-year downtown history and its cost and checklist guides with first-hand price ranges are the hooks. TitanEdge's and We Clean It's generic guides have no data.
4. **Certify later, if the business case exists.** ISSA Canada membership, then CIMS or Green Seal GS-42 (rows 6, 14). These are expensive, but they rank as the most credible industry signals in this market.

**Never:** buy links, use PBNs or link exchanges, create satellite pages, use agency-run directories, pay for wire releases expecting links, or use exact-match anchors. New links should use "Evergreen Office Cleaning" or the bare URL.

## Limits

- **No Moz data for any competitor.** The intersect and every DA value are missing, not zero.
- **Moz is a sample.** Its counts are never complete, and DA is a Moz metric, not a Google one.
- **"Verified" means seen in the HTML fetched today.** JavaScript-rendered directories (Green Seal, Smart About Salt, Landscape Ontario) and Cloudflare-protected sites (HomeStars, Clutch, RenovationFind) could not be checked.
- **Costs are those shown on the pages on 12 Nov 2026.** Taxes and other terms were not checked.
- **Read-only throughout.** No sign-ups, forms, outreach or purchases.

# Backlink report: Evergreen Office Cleaning vs six GTA competitors

*www.evergreencleaningservice.ca · 12 Nov 2026 · for the business owner and the developer*

This report pulls together every file in this folder:
- `evergreen-profile.md`
- `competitors.md`
- `competitor-1.md`, `competitor-2.md` and `competitor-3.md`
- `gap-analysis.md`
- the raw data in `data/`

It also draws on `docs/growth/local-seo-kit.md` and `src/data/redirects.ts`.

## Read this first: how much of this is measured

The Moz account ran out of quota early in the run, so most of the planned measurement did not happen.

| | Moz rows consumed (`/v2/usage_data`) |
|---|---|
| Before the whole analysis | 75 |
| After the whole analysis | 127 |
| Used by this report | 0 (no Moz calls; it is written from saved files only) |

All 52 rows went on Evergreen: 2 `url_metrics` rows and the first 50 `linking_root_domains` rows. After that, every Moz call returned **HTTP 403 `insufficient-quota`**. That covers Evergreen's anchor text, top pages and remaining 224 linking domains, and one probe per competitor (TitanEdge, Nova, Cancore, We Clean It, and a shared `url_metrics` probe for Coverall and Stratus). The other competitor calls were not made once the probes failed; their request bodies are saved in `data/` (`"call_made": false`). The plan appears to stop at about 127 rows per period, far below the 1,500 rows the brief budgeted.

What that leaves:
- **Measured:** Evergreen's domain metrics; its top 50 linking domains by DA; live status checks of 111 Evergreen URLs; read-only checks of competitor sites and of the candidate link sources.
- **Not measured:**
  - any competitor's DA, linking-domain count, anchors or top pages;
  - a true link intersect;
  - 224 of Evergreen's 274 linking domains.

Where a competitor statement below rests on what is visible on their own website rather than on link data, this report says so.

---

## 1. Summary

**In one line:** Evergreen's DA of 52 looks strong but is mostly noise. None of the six competitors showed a single verified, credible local link either. The race is to earn the first real association, client, supplier and press links in this market. It is not to catch up with anyone.

### Comparison table

| | Evergreen | Coverall | Stratus | TitanEdge | Nova | Cancore | We Clean It |
|---|---|---|---|---|---|---|---|
| Type | Local, downtown office, since 1989 | National franchise | National franchise | Local GTA, about 2022 | Local, Oakville, subcontractor network | Local, Etobicoke, since 1984, mostly exterior work | Local Toronto, 20+ years, also franchises |
| Moz DA | **52** | n/a | n/a | n/a | n/a | n/a | n/a |
| Linking root domains (Moz) | **274** (38 nofollow, 23 lost) | n/a | n/a | n/a | n/a | n/a | n/a |
| Moz spam score | 1% | n/a | n/a | n/a | n/a | n/a | n/a |
| Quality mix: measured | Of the 50 seen: **48 Google ccTLD redirect pages** (non-editorial), 1 Google Maps (real citation), 1 myspace (unknown). 224 not retrieved | none | none | none | none | none | none |
| Quality mix: observed on or around their site (not link data) | Citations and social profiles. No association, press or partner links found | Franchise rankings (Entrepreneur, Franchise Times; link not verified); retired scholarship page | **Paid PR Newswire distribution (verified nofollow)**; Green Seal GS-37 product claim | `pages.dev` copy of the site (verified; most likely its own Cloudflare Pages default host, canonical to the main domain, so a hosting artefact rather than a link scheme); directories (hypothesis) | **Self-made Notion and Google Sites pages** (seen at competitor selection; URLs not recorded, not re-verified); sister store; profile without a link (verified) | Claims Landscape Ontario and Smart About Salt (listings not verified); CareerPlug microsite | Agency-hosted "directory" (not verified); links *out* to 11 clients |
| Verified credible local link | none found among the 50 seen | none | none | none | none | none | none |

n/a means Moz refused the call. It does not mean zero.

### What DA is, and what it is not

- **What it is.** Domain Authority is a 1–100 score that **Moz** computes from its own sample of the web. It predicts how likely a domain is to rank, compared with other domains. It is a useful yardstick for comparing sites, if everyone is measured the same way.
- **What it is not.** It is **not a Google metric**, and Google does not use it. Moz's index is a sample, so its link counts are never complete.
- **Why it misleads here.** DA can be inflated by links Google ignores. Evergreen's 52 is an example: 48 of its 50 highest-DA linking domains are Google country domains such as google.de and google.it. Each has exactly 2, 4 or 6 pages. That is the footprint of Google redirect URLs, not of anyone choosing to link.
- **What to measure instead.** Count **independent, relevant sites that chose to link**. For Evergreen that is probably under 30 today, and the earlier pull suggested "single digits to low tens". Do not set a DA target.

---

## 2. Evergreen's profile

### Strengths
- **The site is ready to receive links.** All 84 known URLs resolve live: the 69 Wayback-derived legacy paths, the 10 Section 2.1 sources, both sitemaps and 3 host and protocol variants.
  - 31 return 200 directly. 53 redirect with a 301 in **one hop** to a live 200 page.
  - No chains, no soft-404s.
  - `http://` and the bare domain both 301 to `https://www.` in one hop, so the higher-PA bare-domain home page (PA 37, against 28 for `www`) passes its equity on.
- **Low spam score** (1%, a Moz metric). Manual actions were **not checked**: this analysis had no Search Console access. Confirm under Security & Manual actions.
- **Real assets, most of which competitors lack:**
  - 37 years in Toronto (longer than every competitor here except Cancore, which claims 40 years, since 1984);
  - a real downtown office at 243 Queen St W (see the caveat on shared office space in section 6);
  - long-standing clients;
  - buyer guides that already exist: `office-cleaning-checklist`, `commercial-cleaning-quote-checklist`, `office-cleaning-cost-toronto-guide` and `seasonal-office-cleaning-checklist`.

### Weaknesses
- **Almost no visible editorial links.** The DA-sorted top 50 contains no editorial link at all. Any real links are among the 224 domains Moz did not return.
- **Anchors look automated.** In the 20 Oct pull, about 94% of anchors were the bare URL. That is the mark of scraper and "website worth" pages, not of people choosing to link. This was not re-checked today because the anchor endpoint was out of quota.
- **No association, chamber, BIA, supplier, client or press links were found.** That gap is shared with all six competitors.

### Toxic and spam assessment

| Signal | Assessment | Action |
|---|---|---|
| 48 Google ccTLD redirect "links" | A manipulative footprint, very likely from an automated tool or a bought "Google redirect backlinks" package at some point. They are worthless but not harmful: Google ignores its own redirect URLs. The redirect mechanism is a strong inference, because the individual URLs could not be pulled | None. They cannot be disavowed and do not need to be. If anyone is still paying for a "DA booster" or redirect-link package, **cancel it** |
| A handful of scraper pages with anchors like "high quality dofollow backlinks … pbn network service" (20 Oct pull) | Background spam that Google discounts | None |
| 23 lost domains and 1,309 lost pages (Moz) | Normal churn from old pages and scraper listings | None without link-level data |

**Disavow: not warranted.** Revisit it only if Search Console shows a manual action (Security & Manual actions > Manual actions), or if a large new block of artificial links appears.

### The legacy brand name in anchors
- The domain itself spells the old name, "Evergreen Cleaning Service". So every bare-URL anchor carries the legacy brand. So do old citations and the **Facebook page**, whose name and URL still use it.
- **This does not hurt rankings.** Google ties both names to the same domain.
- **Fix it for consistency, not for links:**
  - rename the Facebook page and the LinkedIn page (whose industry is wrongly set to "Retail");
  - correct citations to "Evergreen Office Cleaning" and keep the URL as it is.
- **New links** should use "Evergreen Office Cleaning", the business name with "since 1989", or the bare URL. Never use keyword anchors.
- **Do not ask existing linkers to change their anchors.** It is not worth the effort.

---

## 3. Lost-link reclamation (developer, immediate)

### The honest finding: no known legacy URL returns a 404
The live check in `data/evergreen-url-status.json` covered every legacy URL the repo knows about, and every one resolves: 31 return 200 and 53 redirect in one hop. The migration's redirect work holds up. **No link equity is being lost on any known legacy URL today.**

### The only 404s are 17 guessed paths, with no evidence of links
To probe for gaps, 18 common WordPress paths were guessed. 17 return 404; `/locations/` returns 200. None of the 17 appears in the Wayback crawl or the repo research. **Link count for each one: unknown.** Moz `top_pages` was blocked and the Wayback CDX API was unreachable.

| Guessed path (404 today) | Inbound links | 301 target if a link turns up | Rule exists in `redirects.ts`? |
|---|---|---|---|
| `/about/` | unknown | `/about-us/` | no |
| `/contact/` | unknown | `/contact-us/` | no |
| `/privacy-policy/` | unknown | `/privacy/` | no |
| `/get-a-quote/` | unknown | `/request-a-quote/` | no |
| `/free-quote/` | unknown | `/request-a-quote/` | no |
| `/quote/` | unknown | `/request-a-quote/` | no |
| `/home/` | unknown | `/` | no |
| `/our-services/` | unknown | `/services/` | no |
| `/janitorial-services/` | unknown | `/services/janitorial-services/` (live 200, "Janitorial Services in Toronto & the GTA", re-checked 12 Nov 2026) | no |
| `/office-cleaning-toronto/` | unknown | `/services/office-cleaning/` | no |
| `/commercial-cleaning-toronto/` | unknown | `/services/commercial-cleaning/` | no |
| `/portfolio/` | unknown | `/cleaning-demo-gallery/` | only `/portfolio/project-title-sixth/` |
| `/faq/`, `/careers/`, `/team/`, `/our-team/` | unknown | none: no equivalent page, so leave as 404 | no |
| `/wp-login.php` | n/a | leave as 404 | no |

### What the developer should do
1. **Today (15 minutes):** open Search Console > Links > **Top linked pages** (external). List any URL that is neither a live 200 nor covered by a rule. That is the authoritative list, and it costs no Moz quota.
2. **Add a rule only for a path that has links.** If Search Console shows one, add the matching line to the `legacyRedirects` array in `src/data/redirects.ts`, under `// WordPress pages that moved`. The exact lines are:

```ts
  // reclaimed: paths Search Console shows carry external links (add only those that do)
  { from: '/about/', to: '/about-us/' },
  { from: '/contact/', to: '/contact-us/' },
  { from: '/privacy-policy/', to: '/privacy/' },
  { from: '/get-a-quote/', to: '/request-a-quote/' },
  { from: '/free-quote/', to: '/request-a-quote/' },
  { from: '/quote/', to: '/request-a-quote/' },
  { from: '/home/', to: '/' },
  { from: '/our-services/', to: '/services/' },
  { from: '/janitorial-services/', to: '/services/janitorial-services/' },
  { from: '/office-cleaning-toronto/', to: '/services/office-cleaning/' },
  { from: '/commercial-cleaning-toronto/', to: '/services/commercial-cleaning/' },
  { from: '/portfolio/', to: '/cleaning-demo-gallery/' },
```

   - Write the source with the trailing slash only. `scripts/redirects.mjs` passes `legacyRedirects` through `bothSlashSpellings`, which emits the slashless spelling with the same one-hop target.
   - Then run `npm run parity` and `tests/build/redirect-variants.test.ts`.
   - Adding all twelve is harmless if you prefer belt and braces, because every target is a live 200 (all twelve re-checked on 12 Nov 2026, including `/services/janitorial-services/`).
3. **When Moz quota resets,** re-check with `top_pages` (about 50 rows).

---

## 4. What the competitors do to earn links

None of the competitor statements below comes from link data. Each is based on their own sites, checked read-only today, and is labelled observed, verified or hypothesis.

| Competitor | What they do (observed) | Links verified today | Evergreen's lesson |
|---|---|---|---|
| **Coverall** (coverall.com) | 95 location pages, 281 posts, a national "Ultimate Guide". Franchise rankings: Entrepreneur No. 74 (Oct 2026) and Franchise Times No. 124. Toronto presence is one support centre in Scarborough (M1T), with a block of about 45 suburb names | None. The Entrepreneur page shows no plain link | Franchisor press cannot be copied. The local equivalent is local awards and earned local press |
| **Stratus** (stratusclean.com) | About 2,716 location pages, about 12,900 service-by-location pages and about 40,200 blog posts (estimates). 83% of the sample are city-swap templates, published at volume today. 311 press items. Claims a Green Seal GS-37 product line | PR Newswire release: **paid, syndicated, `rel="nofollow"`** | Certification directories are a legitimate idea. Get one that certifies the *service* (GS-42 or CIMS), not a product line |
| **TitanEdge** (titanedgecleaning.com) | 92 URLs: 55 city-by-service pages that are genuinely localised (28% alike once city names are removed); 21 blog posts including cost, checklist and contract guides. No badges, press or partners A `titanedge-cleaning.pages.dev` copy that links to the main site. Re-checked: same Cloudflare server and build, `canonical` to titanedgecleaning.com. Most likely the default host of its Cloudflare Pages deploy: a hosting artefact with no link value, not proof of a scheme | Its guides are generic, with no data. Evergreen can beat them with first-hand data and printable versions |
| **Nova** (novabuildingmaintenance.com) | About 80 subcontractor pages, cleaning contracts for sale, about 30 city pages that are **100% identical** once the city is swapped (Calgary and Halifax, 1,227 words each). Blog aimed at other cleaners | Cleaning Contractor Network profile **with no link** | Nothing to copy. It is the clearest example of what not to do |
| **Cancore** (cancore.com) | 40 years, 100+ staff, mostly exterior work. Claims Landscape Ontario and Smart About Salt. Lists 25 big-name clients (Brookfield, Oxford, Cadillac Fairview and others) without links. A long property-manager guide | None. The directories load by JavaScript, so its entries could not be checked | **The model to follow:** membership and certification listings from industry bodies. Evergreen should use *cleaning* bodies |
| **We Clean It** (wecleanit.ca) | Exact-match title "Commercial Office Cleaning Services Toronto". 206 generic blog posts (the cost post has no prices). Links out to 11 clients. Franchise programme | None. A listing on its agency's dev host could not be loaded | Client relationships are an opening: real case studies that clients may host. No reciprocal swaps |

### Patterns not to copy
- **Self-made satellite pages:** Nova on Notion and Google Sites (seen at competitor selection; URLs not recorded). Google's spam policies treat links you create yourself to manipulate rankings as link spam. TitanEdge's `pages.dev` copy is more likely its Cloudflare Pages default hostname than a satellite. It is still worth nothing as a link. Evergreen is also on Cloudflare, so the developer should check that no default `*.pages.dev` or `*.workers.dev` host serves an indexable copy without a canonical.
- **City-swap doorway and scaled content:** Nova's identical city pages; Stratus's roughly 40,000 templated posts (scaled content abuse); We Clean It's 206 generic posts (similarity not measured). These earn no links and carry update risk.
- **Agency- or vendor-run "directories"** that the business's own supplier controls (We Clean It, unverified).
- **Paid wire distribution for links** (Stratus): nofollow and not editorial.
- **Scholarship link bait** (Coverall, now retired).
- **Unsupported superlatives** such as "Toronto's #1" (TitanEdge). This is a credibility issue rather than a link issue.

---

## 5. The gap: top 20 opportunities, ranked

A true intersect, meaning domains that link to two or more competitors but not to Evergreen, **could not be computed**, because Moz returned no competitor links. This list was built instead from three sources:
- sources the analysis saw, or that competitors claim;
- obvious Toronto B2B sources;
- a read-only check of each one.

The ranking weighs three things: relevance to Toronto office-cleaning buyers, likely authority, and how obtainable the link is. **DA is n/a for every row.**

"Verified" means the source exists and was seen in today's HTML. **Only one row has a confirmed competitor link (row 6).** No row has a confirmed link that Evergreen could get. Treat each row as an opportunity to check, not a guaranteed link.

| # | Source | Type | Competitor link seen | Cost (as shown on 12 Nov 2026) | Effort | What is verified |
|---|---|---|---|---|---|---|
| 1 | **Queen Street West BIA** (queenstreetwest.ca) | Local BIA member listing and events | none | No joining fee is expected: Toronto BIAs are funded by a levy on commercial property (general model, not confirmed on the page) | Low | **Re-checked 12 Nov:** the BIA's About page says it stretches "from Bathurst Street to Simcoe Street", so 243 Queen St W (south side, between Simcoe and John) appears to be inside; confirm on the City map. Its `/explore/` page links out to member businesses (17 external links, for example Horseshoe Tavern and Fook Communications, `rel="noopener"` only, so followed). Those are mostly shops, venues and restaurants, so whether a B2B cleaner would be featured: not verified |
| 2 | **Toronto Region Board of Trade** (bot.com) | Chamber membership | none | PROFILE $1,625; PROFILE+ $5,300; INFLUENCE $11,250 per year (a fourth tier, $19,950, is also shown) | Medium | Price verified (re-checked 12 Nov). Whether the public directory links out: **not verified**. Ask before paying |
| 3 | **Clients' and property managers' own sites** | Case studies, vendor pages, testimonials | none confirmed | Staff time | Medium | Not verified. Depends on real relationships |
| 4 | **Suppliers' "customers" or "find a contractor" pages** (Evergreen's actual chemical and equipment suppliers) | Supplier and partner | none | Free | Low | Not verified. The guessed Armstrong programme could not be confirmed, so ask the real suppliers |
| 5 | **Local media:** blogTO, toronto.com, Streets of Toronto, BIA newsletters | Editorial | none | Free | High | The sites exist. Coverage depends on a real story |
| 6 | **Green Building Canada** (greenbuildingcanada.ca) | Directory | Generations Cleaning (alternate competitor) | Not shown | Low | **Verified (re-checked 12 Nov):** a GTA cleaner is listed, with `rel="nofollow external noopener noreferrer"`. A citation and referral source, not a followed link |
| 7 | **ISSA Canada** (issa-canada.com) | Trade membership and directory; CIMS later | none | Not shown | Medium | Directory page seen earlier in the run; on re-check today the site served a bot challenge. Whether listings link out: not verified |
| 8 | **BOMA Toronto** (bomatoronto.org) | Allied Member (supplier to commercial real estate) | none | $2,799 | Medium | Fee verified (re-checked 12 Nov on www.bomatoronto.org). **The directory is login-only, so expect no public link.** Join for property-manager relationships, not for a link |
| 9 | **IFMA Toronto chapter** | Facility-manager association | none | Not shown | Medium | **Not verified, including whether the chapter exists under that name.** ifmatoronto.org was unreachable again on 12 Nov, and ifma.org/chapters/ showed no Toronto entry in its HTML. Find the chapter before planning around it |
| 10 | **Community sponsorships near the office** (BIA events, local teams, charity clean-ups) | Sponsorship | none | Varies | Medium | Not verified. A link given in return for payment must carry `rel="sponsored"` or nofollow under Google's spam policies. Never ask for a followed sponsor link |
| 11 | **CleanLink** (cleanlink.com) | Trade press | none | Free (editorial) | Medium | Exists. Needs a genuine article or real data |
| 12 | **Green Seal GS-42** (certified.greenseal.org) | Certification of cleaning *services* | Stratus claims GS-37 *products* | Paid audit; amount not shown | High | The directory exists. The Stratus entry could not be checked (JavaScript) |
| 13 | **Yellow Pages and Canada411** | Citation | none of the six on page 1 | Free basic | Low | Exists. A website link was not visible in the listing HTML |
| 14 | **HomeStars** | Citation and reviews | TitanEdge (hypothesis) | Free basic | Low | Not verified (Cloudflare 403) |
| 15 | **BBB** (bbb.org) | Citation; accreditation optional | none | Free profile | Low | Exists. Profile link not verified |
| 16 | **Bing Places** | Citation, not a crawlable backlink | n/a | Free | Low | Exists |
| 17 | **Apple Business Connect** | Citation, not a crawlable backlink | n/a | Free | Low | Exists |
| 18 | **Yelp.ca and Foursquare** (from the local SEO kit) | Citations | not checked | Free | Low | Not checked today |
| 19 | **BSCAI** (bscai.org) | Trade membership | none | Not extracted | Medium | Exists. US-centric; check the directory before joining |
| 20 | **Clutch** (clutch.co) | Listing | TitanEdge (hypothesis) | Free basic | Medium | Not verified (403). Use it only if a cleaning or facilities category exists |

### Excluded, and why
- **Smart About Salt and Landscape Ontario.** Cancore claims both. They are relevant only if Evergreen offers winter salt or landscaping services.
- **UL ECOLOGO.** It certifies products, so a service firm cannot get it. Use ECOLOGO-certified products and say so on the site.
- **CSSA.** The domain looks parked.
- **CareerPlug.** A by-product of paying for its applicant-tracking software.
- **websites.ca.** A web agency, not a directory.
- **Cleaning Contractor Network.** A US network; Nova's profile there has no link.
- **Franchise media.** Not obtainable for a non-franchise.
- **PR Newswire, Notion, Google Sites and agency directories.** These are manipulative or non-editorial. TitanEdge's `pages.dev` copy is excluded because it is a hosting duplicate, not a source anyone else can get a link from.

---

## 6. The plan to beat them

**Owners:**
- **Developer:** whoever maintains the Astro repo.
- **Client:** the business owner, or staff with the relationships and the logins.
- **Marketer:** whoever runs outreach and listings. The client can do this if there is no marketer.

**Value** means the expected effect on genuine link quality and on local visibility. It is a judgement, not a forecast.

### Before you start (client, 30 minutes)
The Google listing shows "Floor 1 · Green Offices Toronto Inc." under the address. Confirm whether 243 Queen St W is a shared or serviced office (local SEO kit §5). Two things depend on the answer:
- whether the Google Business Profile complies with Google's address rules;
- whether Evergreen counts as a commercial tenant for BIA membership.

### Month 1: quick wins

| Item | Owner | Effort | Expected value |
|---|---|---|---|
| Export Search Console > Links (top linking sites and top linked pages). This gives the true baseline of editorial linking domains | Developer | 30 min | **High.** It replaces the missing Moz data at no cost |
| Reclamation: add 301s only for 404 paths that Search Console shows carry links (section 3) | Developer | 15 to 60 min | Low to medium. Nothing known is broken today |
| Citations with one NAP ("Evergreen Office Cleaning", 243 Queen St W): Bing Places, Apple Business Connect, Yellow Pages and Canada411, Yelp, HomeStars, BBB, Foursquare, Green Building Canada | Marketer | 1 to 2 days | Medium for local visibility. Low as links: most are nofollow or not crawlable. This is the floor, not the advantage |
| Rename the Facebook page and correct the LinkedIn industry to Facilities Services. Correct any citation that still says "Evergreen Cleaning Service" | Client | 1 hour | Low for links. Fixes brand consistency |
| **Queen Street West BIA:** confirm the boundary on the City of Toronto BIA map, then ask the BIA office about the member listing and events | Client | 1 to 2 hours | **High.** Local and relevant, and none of the six was seen with one |
| **Toronto Region Board of Trade:** decide on the membership for its business value (buyers, events, referrals). Before paying $1,625, check whether the public member directory exists and links to member websites, so you know whether a listing is a by-product | Client | 1 hour, then the fee if justified by the business case | Medium to high for relationships. Any directory link is a by-product of a genuine membership, not something being bought |
| **Supplier listings:** ask each chemical, paper and equipment supplier whether they have a "customers", "certified contractor" or case-study page | Client | 2 to 3 hours of emails | Medium to high. Relevant and earned through a real relationship |
| **Associations:** decide on ISSA Canada (directory with outbound traffic) and BOMA Toronto ($2,799, login-only directory: join for property managers, not for a link). Check the IFMA Toronto chapter | Client | 2 hours to decide | Medium. A credibility signal and access to buyers |
| **Unlinked mentions under the old name:** search "Evergreen Cleaning Service" Toronto (excluding the domain itself) and "Evergreen Office Cleaning". Set Google Alerts for both. Where a page names the business without a link, ask politely for the link and the new name. **No mention search was run in this analysis, so the count is unknown** | Marketer | Half a day, then alerts | Low to medium. Cheap wins where relationships already exist |

### Months 2 and 3: linkable assets the site can genuinely offer

| Item | Owner | Effort | Expected value |
|---|---|---|---|
| **A printable office cleaning checklist.** `office-cleaning-checklist` exists, but the 7 Nov re-audit removed "printable" from its title because there is no print version. Add a print stylesheet and a one-page PDF (daily, weekly and monthly, plus which tasks fall to the crew and which to staff). Then put "printable" back in the title | Developer (build); client (check the tasks) | 1 to 2 days | **Medium to high.** Office and property managers bookmark and share checklists. TitanEdge's version is generic |
| **A printable quote checklist.** `commercial-cleaning-quote-checklist` (10 Nov) becomes a fill-in PDF a buyer can take to any supplier's walkthrough | Developer and client | 1 day | Medium. Purchasing and facilities blogs, BIA newsletters and coworking operators can cite a neutral tool |
| **A real Toronto price survey, once the client supplies data.** The cost guide's figures are currently *illustrative* (front matter, 7 Nov). Replace them with anonymised ranges from Evergreen's own recent quotes, by floor area, visit frequency and washroom count. Write a methodology note with the sample size and dates. **Publish nothing until the data is real** | Client (data); developer (page and table) | Client: about 1 day. Developer: about 1 day | **High.** First-hand Toronto price data is what local press and roundups cite. No competitor has any: We Clean It's cost post has no prices, and TitanEdge's guide is generic |
| **Local B2B guides,** for example: an Ontario workplace washroom and sanitation explainer; a cleaning-frequency guide for GTA office buildings; a guide to switching cleaners mid-lease for property managers. Write each from Evergreen's own experience | Marketer, with client review | 2 to 3 days each | Medium. Becomes the hook for an occasional contributed article on a facilities or property-management site that chooses to run it. Keep it rare and editorial, with a brand or bare-URL byline link: Google's spam policies name large-scale guest posting with keyword-rich anchors as a link scheme |
| **2 to 3 client case studies,** with permission: building type, scope, years of service, results. Offer each client a short version for their own vendor or partner page | Client (permission); marketer (writing) | 1 day each | **High.** These are the hardest links to copy, and Cancore's 25 named clients do not link to it |

### Ongoing: digital PR and community

| Item | Owner | Effort | Expected value |
|---|---|---|---|
| **Local stories, real news only:** 37 years in Toronto (confirm how long the office has been on Queen St W before saying so), long-serving staff, a long-standing client building, the price survey. Pitch blogTO, toronto.com, Streets of Toronto, BIA newsletters and CleanLink | Marketer | 2 to 4 hours a month | High per hit, with low odds per pitch |
| **Community sponsorship** near the office, chosen for the relationship: a local team, a BIA event, a charity clean-up | Client | Varies | Medium, for the relationship. A sponsor link should carry `rel="sponsored"` or nofollow; do not ask for a followed one, and do not count sponsor links toward the quality targets below |
| **Certification, if the business case exists:** ISSA CIMS / CIMS-GB, or Green Seal GS-42 | Client | High (audit and cost) | Medium to high. The most credible industry signal in this market, and it certifies the service, not just a product |
| **Quarterly re-measure:** Search Console Links, plus Moz when quota allows (about 830 rows: Evergreen pages 2 to 6, plus six competitors at about 100 rows each). The request bodies are saved in `data/` | Developer | 1 hour a quarter | Keeps the plan honest |

### What would make Evergreen better than the strongest competitor

On sheer link *volume*, the national franchises (Coverall, Stratus) will stay ahead. Their counts come from franchisor press, wire syndication and tens of thousands of pages, and Evergreen should not compete there.

Among the like-for-like local firms, there are two candidates for the strongest competitor:
- **TitanEdge** is the most visible;
- **Cancore** has the most credible claimed links: two industry-body listings, not yet verified.

Neither showed a single verified association, chamber, BIA, client, supplier or press link.

**"Better" therefore means more verified, relevant, independent links in the categories that are hardest to fake.**

**Targets, not forecasts.** These assume the client acts on the Month 1 items. None is predicted by the data.

| By | Target |
|---|---|
| End of month 1 | **8 to 10 citation listings live** with one NAP. Search Console baseline recorded |
| End of month 3 | **At least 3 new independent referring domains** from categories none of the six has shown: BIA, board of trade, supplier, or client |
| End of month 6 | **12 to 15 new quality referring domains** in total (independent, relevant to Toronto business or facilities, not citations, not self-made). At least 5 of them from association, chamber or BIA, client and partner, supplier, or press. Plus 2 to 3 published case studies, at least 1 client page linking back, at least 1 local or trade press mention, and the printable checklist cited by at least 2 outside sites |
| End of month 12 | **25 or more quality referring domains.** Today's editorial baseline is not measured: the earlier pull estimated "single digits to low tens", and the Month 1 Search Console export replaces that guess. If the baseline turns out higher, reset this target from it rather than reading 25 as progress. If Cancore's claimed listings are confirmed, Evergreen would by then lead it in verified cleaning-industry and local-business links |

- **Do not track DA.** It may not move. It could even fall if Moz drops the Google redirect pages.
- **Track instead:** quality referring domains and the share of non-URL brand anchors.

---

## 7. What not to do

- **Do not buy links,** "DA boosters", "Google redirect backlinks" or guest posts sold as links. The 48 Google ccTLD entries already show the residue of something like this. If anything like it is still running, cancel it.
- **No PBNs or private blog networks.** No link exchanges, including "I list you, you list me" arrangements with clients or suppliers. A real case study or vendor listing is fine. A swap is a link scheme.
- **No exact-match anchor campaigns** such as "office cleaning Toronto" or "commercial cleaning services Toronto". Use the brand name or the bare URL.
- **No self-made satellite sites:** no `pages.dev` mirrors, no Notion, Google Sites, Squarespace or Blogspot pages that link back.
- **No city-swap doorway pages or scaled AI posts.** Build area pages only where Evergreen genuinely works, with real local detail.
- **No agency-run or vendor-run directories,** and no sitewide footer links meant for SEO.
- **No paid wire releases for links,** and no scholarship link bait.
- **Do not pay for a membership for its link.** Join an association or chamber only when the membership is worth it on its own (buyers, events, credibility). Checking the directory logged out simply tells you whether a public listing comes with it. BOMA's directory is login-only, so it brings no public link; join it for the relationships if at all.
- **Do not disavow** the Google redirect or scraper links.

---

## 8. Limits of the data

- **Moz quota.** Only 52 rows were available for the whole analysis (75 before, 127 after). There is no competitor DA, no linking-domain counts, no anchors and no top pages. 224 of Evergreen's 274 linking domains were not retrieved. Every "n/a" means "not retrieved", not zero.
- **No link intersect.** The gap list comes from verified *sources*, not from links competitors are known to have. Only one competitor-style link was confirmed in a directory: Generations Cleaning on Green Building Canada, an alternate competitor and nofollow. Two competitor links that carry no editorial value were also confirmed: Stratus's paid, nofollow wire release, and TitanEdge's `pages.dev` copy (most likely a hosting duplicate, canonical to its main site).
- **Moz is a sample.** Its counts are never complete. DA is a Moz metric, not a Google one.
- **Anchor findings,** including the 94% bare-URL share, come from the 20 Oct pull and were not re-verified today.
- **The Google redirect mechanism** behind the 48 ccTLD domains is a strong inference. The individual URLs could not be pulled.
- **The 404 check** covers every URL the repo knows about. Paths nobody has recorded could still carry links, and Search Console is the way to find them.
- **Competitor tactics** are inferred from their own sites, sitemaps and a few fetched pages. Stratus's page and post totals are estimates from the first and last sitemap files. The similarity scores come from a few page pairs.
- **"Verified"** means seen in HTML fetched on 12 Nov 2026. Some directories render by JavaScript (Green Seal, Smart About Salt, Landscape Ontario). Others block automated requests (HomeStars, Clutch, RenovationFind). Neither kind could be checked.
- **Competitor selection** used a US-based search engine, not google.ca, so "appearances" is not a Toronto ranking.
- **Costs** are as shown on 12 Nov 2026, before tax and other terms.
- **No unlinked-mention search** was run for either brand name.
- **All targets in section 6 are goals,** not predictions.
- **Read-only throughout:** no outreach, sign-ups, forms, purchases or repo changes outside this folder.

---

## Review notes (adversarial review, 12 Nov 2026)

**Checked, and it holds:**
- **Moz numbers against `data/*.json`:** DA 52, PA 37 (bare) and 28 (www), spam score 1, 274 linking root domains (38 nofollow, 23 lost), 1,309 lost pages, usage 75 before and 127 after, 52 rows charged (2 + 50). Of the 50 domains returned, 48 are Google country domains with 2, 4 or 6 linking pages (5, 26 and 17 of them), plus maps.google.com and myspace.com. Every competitor file has empty results and either a 403 or `call_made: false`, so "n/a" throughout is correct.
- **URL counts:** `evergreen-url-status.json` holds 111 requests: 84 known URLs, 18 guesses and 9 slashless spellings. 94 end at 200 (32 direct, 62 one-hop 301s), 17 are 404, there are no chains and no soft-404s.
- **Reclamation:** all 17 guessed 404 paths were curled live and still return 404, as do the slashless `/about` and `/contact`. All twelve proposed 301 targets return 200, with titles that match their intent. `/projects/` is a 404, so `/cleaning-demo-gallery/` is the right target for `/portfolio/`. `legacyRedirects`, `bothSlashSpellings`, `npm run parity` and `tests/build/redirect-variants.test.ts` all exist as described.
- **Top 10 opportunities, fetched read-only:** the Board of Trade prices, the BOMA Allied fee ($2,799) and Green Building Canada's nofollow listing were all confirmed. blogTO, toronto.com, Streets of Toronto and CleanLink all return 200. ISSA Canada served a bot challenge, and IFMA Toronto was unreachable. Rows 3, 4 and 10 are relationship-dependent and cannot be checked from outside.
- **Targets:** they are labelled as goals, not forecasts, in sections 6 and 8, and "Expected value" is defined as a judgement.

**Changed:**
1. **Moz 403 wording.** The report said every competitor call was refused. In fact one probe per competitor was refused, and the other calls were never made.
2. **TitanEdge `pages.dev`.** It was described as a self-made manipulative mirror. A re-check found the same Cloudflare server and build as the main site, `canonical` to titanedgecleaning.com, and `index,follow`. That is most likely the default hostname of its Cloudflare Pages deploy, so it is now described as a hosting artefact with no link value, not as link spam (sections 1, 4, 5 and 8). A self-check for Evergreen, which is also on Cloudflare, was added.
3. **Nova's Notion and Google Sites pages** are now labelled as unverified, because their URLs were never recorded.
4. **"No manual action is on record"** had no source, since this analysis had no Search Console access. It now says manual actions were not checked.
5. **"37 years: an asset competitors lack"** was wrong for Cancore, which claims 40 years. The pitch line "37 years on Queen St W" is also unsupported, and now asks the client to confirm how long the office has been there.
6. **Queen Street West BIA (row 1).** The BIA's own page gives its stretch as Bathurst to Simcoe, so 243 Queen St W appears to be inside it. Its `/explore/` page does link out (followed) to member businesses. Both facts were added.
7. **The `/janitorial-services/` caveat was removed**, because its target is verified live.
8. **Spam-policy tightening.** Memberships are now framed as worth joining on their own merits, with any link a by-product, not bought. Sponsor links must be `sponsored` or nofollow, are never requested as followed, and are not counted toward the targets. Contributed articles must be occasional and editorial, with no keyword anchors.
9. **Month-12 target.** It called 25 domains "roughly double a baseline of under 30", which is internally inconsistent and rests on no measurement. It now points to the Search Console baseline instead.
10. **Small fixes:** the fourth Board of Trade tier ($19,950) was added, the full Green Building Canada `rel` value was given, and "near-duplicate" was changed to "generic" for We Clean It's posts, whose similarity was never measured.

**Not checked:** whether any of the top 10 would actually list or link to Evergreen, because that needs outreach, which is out of scope. Also unchecked are the ISSA Canada directory and IFMA Toronto (blocked or unreachable), the Board of Trade's public directory, and the competitor tactic figures in section 4 beyond TitanEdge (taken from the competitor files).

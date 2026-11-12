# Competitor backlinks, part 3: Cancore and We Clean It (12 Nov 2026)

Competitors covered:
- **Cancore Building Services** (cancore.com)
- **We Clean It** (wecleanit.ca)

Raw data is in `data/competitor-cancore.com-*.json` and `data/competitor-wecleanit.ca-*.json`.

## Read this first: Moz returned no data for either competitor

| | Rows consumed (`/v2/usage_data`) |
|---|---|
| Before this step | **127** |
| After this step | **127** |
| Used by this step | 0 of the ~320 allocated (about 160 per competitor) |

I made one probe per competitor:
- `linking_root_domains` for cancore.com (limit 50, sorted by DA)
- `anchor_text` for wecleanit.ca (limit 25)

Both came back **HTTP 403 "The account does not have enough quota remaining for current period" (`insufficient-quota`)**. That is the same error parts 1 and 2 hit. The account stops at 127 rows per period. I did not retry, and I did not call the other four endpoints.

**So this file has no Moz numbers for Cancore or We Clean It.** That means:
- no Domain Authority (DA)
- no linking root domain list or count
- no anchor text
- no Moz top pages
- no spam score

**The nine linking-domain categories cannot be filled in.** There is no domain list to classify. I have not estimated any counts. Each `-linking-root-domains`, `-anchor-text` and `-top-pages` JSON file holds the exact request body and an empty `results` array, so the calls can be run when the quota resets.

The task allowed no web searches, so I ran none. What I could do was read-only `curl` of the competitors' public pages: 12 Cancore URLs and 11 We Clean It URLs, plus their sitemaps. That shows **what each site has built that could earn links, and what looks risky**. It does not show who actually links to them. Every "likely source" below is a **hypothesis to check against Moz**, not a finding.

## Cancore Building Services (cancore.com)

*On-site evidence is in `data/competitor-cancore.com-onsite.json`.*

### What the site is
- **Platform and size:** a hand-built PHP site with 53 URLs in its sitemap.
- **Title:** "Commercial Property Maintenance Toronto and Etobicoke".
- **Claims:** 40 years in business (since 1984) and 100+ employees. **That is longer than Evergreen's 37 years**, so "since 1989" does not set Evergreen apart from Cancore. It does against the newer firms in part 2.
- **Services:** mostly **exterior and building services**: window and high-rise window cleaning, snow removal, pressure washing, graffiti removal, landscaping, caulking. Green cleaning and LEED have a page each. Office cleaning is not the core offer, so Cancore only partly overlaps with Evergreen's buyers.
- **21 city-by-service pages:** 3 services across 7 cities (Mississauga, Brampton, Markham, Vaughan, Scarborough, Oakville, Etobicoke).
  - Each page is about 300 words.
  - With the city name removed, pairs are **50–60% alike** in word sequence (Markham vs Oakville 0.50, Vaughan vs Brampton 0.60).
  - That is thin and partly templated. It is not the 100% city-swap copying seen at Nova in part 2.
- **Trust signals on the site:**
  - "Certified through the **Smart About Salt** Winter Salt Management Program"
  - "Member in good standing of **Landscape Ontario** Horticultural Trades Association"
  - Green Seal and Environmental Choice product standards, named on `/leed.php`
  - A **client list of 25 named firms**: major landlords such as Brookfield, Oxford, Cadillac Fairview, Morguard and QuadReal, plus hotels, the Bata Shoe Museum, MaRS and the Toronto Parking Authority. It has no outbound links.
- **Blog:** one `/blogs.php` page of about 7,600 words of long guides for property managers, for example roof snow and ice removal.
- **Outbound links on the home page:** only Facebook, Instagram, LinkedIn and a Google map. There is no web-agency footer credit.
- **Careers microsite:** the selection step found `cancore.careerplug.com` linking to cancore.com. Today it returns HTTP 202 and redirects to a CareerPlug sign-in page, so I could not confirm the link still exists.

### Pages likely to earn links (hypotheses)
| Asset | Why it could attract links | Check in Moz `top_pages` |
|---|---|---|
| Home page | Most directory, association, social and job-board links usually point here | yes |
| Association and certification status (Landscape Ontario, Smart About Salt) | Both bodies run public member or certified-contractor lists. These are the most credible links Cancore probably has | check for `landscapeontario.com` and `smartaboutsalt.com` in `linking_root_domains` |
| `/blogs.php` property-manager guides | Long, practical guides for facility managers are the kind of page that gets cited | yes |
| `/leed.php`, `/green-cleaning.php` | Green-building and sustainability resource lists sometimes cite vendors | yes |
| 21 city-by-service pages | Short and templated. These are unlikely to earn editorial links. Expect citations at most | yes |

### Likely link sources by category (hypotheses, unverified)
| Category | What to expect |
|---|---|
| Directories and citations | Yes: standard local directories, plus job boards via CareerPlug |
| Local and community | Possibly a few from a 40-year history. None are visible on-site |
| Industry and associations | **Most likely its strongest category:** Landscape Ontario and Smart About Salt listings |
| Suppliers and partners | CareerPlug (applicant-tracking vendor). The client list has no links, so links from clients are unlikely |
| News and media | None visible on-site |
| Education and government | None visible on-site. The Toronto Parking Authority appears as a client, not a linker |
| Blogs and articles | Possibly citations of the property-manager guides |
| Scraper or spam | Unknown until Moz returns data |
| Unknown | Unknown until Moz returns data |

### Manipulative or risky patterns
- **No manipulative linking seen on the pages I checked.** I found no footer link blocks, no "partner" link pages, no sponsored posts and no satellite sites.
- **The city pages are thin and partly templated.** They are a weak point for Cancore, but they are not doorway pages on the scale of Nova's.
- **Anchor text is unknown.** Moz `anchor_text` is needed to rule out exact-match anchors such as "property maintenance Toronto".

**What Evergreen can learn from Cancore:** membership and certification listings run by industry bodies. These are legitimate, hard to fake and earned through real operations.

## We Clean It (wecleanit.ca)

*On-site evidence is in `data/competitor-wecleanit.ca-onsite.json`.*

### What the site is
- **Title:** "Commercial Office Cleaning Services Toronto". That exactly matches Evergreen's main query.
- **Claims:** "more than 20 years" serving health care, education, commercial and industrial clients. It also runs a **franchise programme** (`/franchise`).
- **Size:** 247 URLs in its sitemap:
  - **206 blog posts**
  - 13 service pages
  - 4 city hubs (Toronto, Etobicoke, Mississauga, Vaughan) with 11 city-service pages
  - 6 `/page/` landing pages (Richmond Hill, Scarborough, Toronto East and others)
  - 7 other pages
- **City pages are reasonably localised.** With the city name removed, Mississauga vs Vaughan is 0.36 alike and Etobicoke vs Vaughan is 0.24.
- **The blog is high-volume and generic.** Many posts are the same topic with a city added ("...in Mississauga", "...in Toronto"). I sampled the cost post (`/blog/what-affects-professional-commercial-cleaning-costs-toronto/`, May 2023, about 1,000 words). It has **no prices and no first-hand data**. Posts like that rarely earn links.
- **The `/clients` page links out to 11 clients**, including McMaster University, Halton Healthcare, Humber River Hospital, St John Ambulance, StorageMart and several dental and fitness businesses. These are outbound links. Some of those clients may link back on vendor or partner pages, but none is confirmed. Moz would show it.
- **Sitewide footer credit:** "Web Development by **Xi Digital**" links to xi-digital.com. It is outbound, so it does not affect We Clean It's backlinks.
- **Associations, press, sponsorships:** none seen on any page I checked.

### The agency-hosted "directory"
The selection step found We Clean It through a business-directory profile on **`blocal.dev4.xi-digital.com`**. That host is a dev subdomain on the domain of **We Clean It's own web agency**.
- Today the host's TLS certificate does not match its name, and HTTP redirects to HTTPS, so **I could not load or verify it**.
- **If** that directory is run by the agency, its listings are not independent citations. They are links the business's own vendor created. In Moz they would roll up under the root domain `xi-digital.com` and could make the profile look broader than it is.
- **Treat this as unverified.** Do not copy it either way.

### Pages likely to earn links (hypotheses)
| Asset | Likely linkers | Relevance to Evergreen's buyers |
|---|---|---|
| Home page (exact-match title) | Directories, the agency, social profiles | n/a |
| `/franchise` | Franchise-opportunity portals and small-business sites | Low. The audience is buyers of a franchise, not office managers |
| `/clients` | Possible reciprocal vendor or partner pages at clients | Medium, if any exist |
| 206 blog posts | Few. Generic posts with no data rarely attract editorial links | Low |
| City hubs and `/page/` landing pages | Local citations | Medium |

### Likely link sources by category (hypotheses, unverified)
| Category | What to expect |
|---|---|
| Directories and citations | **Most likely its main category:** blocal and the other directories the selection step found (HomeStars, Yellow Pages-style sites, Bark and similar) |
| Local and community | None visible on-site |
| Industry and associations | None visible on-site |
| Suppliers and partners | xi-digital.com (agency, possibly including the blocal subdomain). Possibly some of the 11 linked clients |
| News and media | None visible on-site |
| Education and government | Possible only if McMaster or the hospitals list vendors. Unconfirmed and unlikely |
| Blogs and articles | Possibly franchise and small-business portals |
| Scraper or spam | Plausible, given a 206-post keyword blog that scrapers tend to copy. Unknown until Moz returns data |
| Unknown | Unknown until Moz returns data |

### Manipulative or risky patterns
- **Possible agency-run directory listings** (see above). If confirmed, these are self-created links. **Do not copy.**
- **A content mill of 206 near-duplicate keyword posts.** This is not a link scheme. It is the pattern Google's scaled-content policy targets, and it earns few links. **Do not copy.**
- **The exact-match keyword title** is an on-page choice, not a link issue. Moz `anchor_text` is needed to check whether backlink anchors are also exact-match ("commercial office cleaning services Toronto"). That would be a manipulation signal.
- **The sitewide footer credit** is outbound only, so it does not affect We Clean It's backlinks.

## How Evergreen can beat both (realistic, no manipulation)

| Gap | Cancore | We Clean It | Evergreen's move |
|---|---|---|---|
| Industry association or certification listings | **Yes** (landscape and salt bodies) | None seen | Match Cancore with **cleaning** bodies: check BOMA Toronto, ISSA / ISSA Canada (including whether CIMS certification is realistic), CSSA, the Toronto Region Board of Trade and the Queen St W BIA for member listings with links |
| Linkable guides with real data | Long property-manager guides, but no data | 206 generic posts, no data | Make fewer, better pages: Evergreen's `/office-cleaning-cost-toronto-guide` with real price ranges from its own quotes, and `/office-cleaning-checklist` as a downloadable resource. Offer them to property managers and coworking operators as a reference |
| Client and partner mentions | 25 big-name clients, no links | Links out to 11 clients | Ask long-term clients (property managers, coworking spaces, medical and dental offices) whether they publish vendor or case-study pages. Earn the mention with a real case study. **Do not set up "I link to you, you link to me" swaps**, which Google treats as a link scheme |
| Local and press story | 40 years, but no press seen | None | A downtown Queen St W office-cleaning firm since 1989 is still a good local-business story. Cancore is older but works mainly outside the core and on exteriors. Pitch BIA newsletters and neighbourhood and business press |
| Office-cleaning focus | Mainly exterior and property maintenance | Office-cleaning focus, exact-match title | Evergreen competes head-on with We Clean It. It wins on credibility (associations, data, press) and on location pages that are localised like We Clean It's, not templated like Cancore's |
| Citations | Directories, job boards | Directories, including possibly agency-run ones | Keep consistent NAP (business name, address and phone) at 243 Queen St W on genuine, independent directories only. Job postings on real job boards add citations, but they are a floor, not an advantage |

**Do not copy:**
- directories run by a web agency, or any listing that a vendor creates on a site it controls
- mass city-modified blog posts
- templated city pages
- exact-match anchors
- paid, exchange or sitewide footer links of any kind

## When the quota resets
Run these calls once per domain, pausing 2 seconds between them. They come to about 300 rows, within the ~320 allocated:
- `/v2/linking_root_domains`: `{"target":"<domain>/","target_scope":"root_domain","limit":50,"sort":"source_domain_authority"}`, then one `next_token` page for 100 rows
- `/v2/anchor_text`: `{"target":"<domain>/","scope":"root_domain","limit":25}`
- `/v2/top_pages`: `{"target":"<domain>/","scope":"root_domain","limit":25}`

The bodies are already saved in the JSON files. Then:
- Classify the domains into the nine categories.
- Confirm or reject these specific hypotheses:
  - **Cancore:** `landscapeontario.com`, `smartaboutsalt.com` and `careerplug.com`
  - **We Clean It:** `xi-digital.com` (agency and blocal), the 11 client domains, franchise portals, and exact-match anchors

**Limits:**
- Moz's index is a sample, so its counts are never complete.
- DA is a Moz score, not a Google one.
- On-site evidence shows what a site has built, not who links to it.

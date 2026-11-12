# Competitor backlinks, part 1: Coverall and Stratus (12 Nov 2026)

Competitors: **Coverall** (coverall.com, Toronto support center) and **Stratus Building Solutions** (stratusclean.com). Both are national franchises. Data files:
- `data/competitor-coverall.com-moz.json`
- `data/competitor-stratusclean.com-moz.json`
- `data/competitor-coverall.com-site-inventory.json`
- `data/competitor-stratusclean.com-site-inventory.json`

## Read this first: Moz returned nothing for either competitor

| | Rows consumed (`/v2/usage_data`) |
|---|---|
| Before this task | **127** |
| After this task | **127** |
| Used by this task | **0** (of the ~320 allocated) |

The Moz quota was already exhausted when this task started; see `evergreen-profile.md`. I made two small calls:
- `url_metrics` for both domains;
- a **1-row** `linking_root_domains` probe on coverall.com.

Both returned **HTTP 403 "The account does not have enough quota remaining for current period" (`insufficient-quota`)**, and no rows were charged. I did not try `anchor_text` or `top_pages`: the 1-row probe showed every links endpoint is shut, so more calls would only have repeated the 403.

**So this file contains no DA, no linking-domain counts, no anchor text and no top-pages data for either competitor.** Nothing below estimates them. The `*-moz.json` files hold empty arrays, which mean "not retrieved", not "none exist".

In place of Moz I read both competitors' **public sitemaps and key pages** (read-only `curl`, 1 request per second). That shows which assets each site has that *could* earn links, and some outbound links that point to where their links come from. It cannot show who actually links to them. Everything in sections 2 and 3 is labelled as either **observed** (seen on their site) or **inference**.

When the quota resets, run the planned pull. It costs about 150 rows per competitor:
- `linking_root_domains`, limit 100, sorted by `source_domain_authority`;
- `anchor_text`, limit 25;
- `top_pages`, limit 25.

Sorting by DA may again put Google-redirect noise first, as it did for Evergreen. If so, sort by `source_page_authority` or page past the first 50 rows.

## 1. Linking-domain classification

Neither competitor can be classified, because no linking domains were retrieved.

| Category | Coverall | Stratus |
|---|---|---|
| directories and citations | not retrieved | not retrieved |
| local and community | not retrieved | not retrieved |
| industry and associations | not retrieved | not retrieved |
| suppliers and partners | not retrieved | not retrieved |
| news and media | not retrieved | not retrieved |
| education and government | not retrieved | not retrieved |
| blogs and articles | not retrieved | not retrieved |
| scraper or spam | not retrieved | not retrieved |
| unknown | not retrieved | not retrieved |

What the sites suggest, as **inference only**, to check against Moz later:
- **news and media / franchise press.** Both publish franchise rankings and press releases (see below). These should show up as franchise-media domains (Entrepreneur, Franchise Times) and press-release syndication sites.
- **industry and associations.** Both have franchise-association landing pages (IFA, VetFran-style veteran programmes).
- **directories and citations.** One citation set per franchise location.

## 2. Coverall (coverall.com)

### What is on the site (observed)

| Asset | Count / detail |
|---|---|
| Location pages | 95 in `locations-sitemap.xml`; 6 in Canada (Toronto, Calgary, Edmonton, Langley, Winnipeg + `/locations/ontario/`) |
| Blog / article posts | 281 |
| Core pages | 62, incl. an **"Ultimate Guide" to commercial cleaning**, a **Franchise Ownership Guide**, 3 FAQ hubs, `/in-the-news/`, veterans and women franchise-opportunity pages, national accounts |
| Toronto page | `/locations/canada/toronto-commercial-janitorial-cleaning/`, 200. NAP: 2969 Sheppard Ave E, Toronto M1T 3J5, 416.431.7911. Lists about 45 GTA place names in one block. Has a "Leave a Review" link to Google |
| Press | Home and news pages feature "Named in Entrepreneur's 2026 Top Franchises Under $50K (No. 74)" (28 Oct 2026) and "Ranked No. 124 on the 2026 Franchise Times Top 400" (24 Oct 2026) |
| Scholarship | `/franchise-opportunities/college-scholarship-program/` is still in the sitemap, but it now serves the **Franchise Ownership Guide**. The scholarship appears to be retired |
| Association badges in HTML | none found (no ISSA, CIMS, Green Seal, BBB alt text or image names) |

### Link-earning tactics (inference from the assets)

1. **Franchise rankings and franchise press** (Entrepreneur, Franchise Times). These are probably Coverall's highest-authority editorial-ish links. They come from being a franchisor, so **Evergreen cannot replicate them**. The local equivalent is local business awards and press coverage (section 4).
   - The Entrepreneur listing page loads (200) but shows no plain `href` to coverall.com. Whether it links is **not verified**.
2. **Guides and FAQ hubs** (the Ultimate Guide, the franchise guide). These are generic national resources, not Toronto-specific.
3. **Location pages plus franchise-owner citations.** The Toronto page is a support-center page with one NAP and a long keyword list of suburbs. Its GTA presence is one address in Scarborough (M1T), not a downtown office.
4. **Franchise-programme pages** (veterans, women). These typically earn listings on franchise-association and veteran-programme directories.

### Manipulative or risky patterns

- **The scholarship page.** A "college scholarship program" on a franchise site is a well-known way to collect `.edu` links. Retiring it and redirecting the URL keeps any links it earned. **Do not copy it:** scholarship link bait is low quality, and it is the kind of "link scheme" Google's spam policies target when its main purpose is links.
- **The suburb keyword block** on the Toronto page is a weak on-page tactic, not a link tactic.
- **Not assessable without Moz:** exact-match anchors, sitewide footer links and PBN-like blogs. I found no evidence either way.

## 3. Stratus Building Solutions (stratusclean.com)

### What is on the site (observed)

| Asset | Count / detail |
|---|---|
| Location pages | 2,716 in `location-sitemap.xml` |
| Service × location pages | 13 sitemap files. File 1 has 1,000 URLs and file 13 has 918, so the total is **about 12,900** (estimate: files 2 to 12 were not counted). Toronto East alone has pages for janitorial, day porter, carpet, construction, healthcare, window, power washing, office, gyms, dental, banks, vets, government… |
| GTA hubs | `/locations/toronto-central/`, `/toronto-east/`, `/toronto-north/`, `/mississauga/`. Toronto Central uses (647) 946-2335 and claims a **Green Seal Certified (GS-37)** proprietary product line |
| Blog posts | 41 sitemap files. File 1 has 1,001 URLs and file 41 has 208, so the total is **about 40,200** (estimate) |
| City-swap posts | **1,003 of the 1,209** posts in files 1 and 41 (83%) follow two templates: `/blog/cleaning-company-in-<city>-<prov>/` and `/blog/post-construction-cleanup-in-<city>-on/`. Ontario examples include Scarborough, Oshawa, Pickering, Whitby, Uxbridge and Alliston. They show author "cmstartsingle" and the date **12 Nov 2026** (today). Samples run 870 to 1,012 words. After removing the city name, two pairs matched only 21–24% textually, so the pages are **reworded per city, not copied** |
| Press | 311 items. **120** of the URLs mention franchise, award, growth, owner or master. A sample release links out to **prnewswire.com, finance.yahoo.com, fox16.com, wate.com, wric.com, openpr.com and contentmassive.com** |
| Franchise landers | `/master-opportunity/ifa/`, `/ent/`, `/canada/`, `/toronoto/` (sic) and about 25 more markets |
| Awards | Blog post about an IFA Franchisee of the Year award (Nashville) |

### Link-earning tactics (inference from the assets)

1. **Paid press-release distribution.** The outbound hosts on the sample release are the typical footprint of a **PR Newswire distribution**: syndicated copies on Yahoo Finance and local TV-station sites, plus openpr.com and contentmassive.com. This probably produces many "news and media" linking domains. Those links are **syndicated, usually nofollow, and not editorial**, and Google's guidance does not count press-release links as earned. Inflated news-domain counts for Stratus should be read that way.
2. **Franchise-association and franchise-media links:** IFA, Entrepreneur (`/master-opportunity/ent/`), and growth rankings ("fastest-growing franchise").
3. **Certification:** the Green Seal GS-37 product line. Certified products are listed in Green Seal's public directory, which is a legitimate certification link.
4. **Location-page scale.** Thousands of location and service-location pages are a ranking tactic, not a link tactic. They give franchisees URLs to put in local citations.

### Manipulative or risky patterns

- **Scaled city-swap content.** Roughly 40,000 templated blog posts, about 83% of the counted sample, publishing at volume today. This fits what Google's spam policies call **scaled content abuse**: many pages generated mainly to rank, with little added value. It does not earn links. It is a liability that a core or spam update can wipe out. **Evergreen must not copy it.**
- **Paid wire distribution** (PR Newswire, contentmassive.com). This is not a violation in itself, because those links are usually nofollow, but it adds no editorial value. **Do not pay for distribution expecting links.**
- **Not assessable without Moz:** exact-match anchors, sitewide footer links and PBN-like blogs.

## 4. How Evergreen can beat them

The franchises win on **volume**: rankings, wire releases, thousands of pages. Evergreen cannot and should not compete there. It can win on **local, verifiable relevance**, which neither franchise has in Toronto. Evergreen has one real downtown office (243 Queen St W) and 37 years in Toronto, since 1989. Coverall has one support center in Scarborough, and Stratus has franchise-territory pages.

| Their tactic | Evergreen's better, policy-safe version |
|---|---|
| Franchise rankings (Entrepreneur, Franchise Times) | **Local credibility links:** Toronto Region Board of Trade member directory; BOMA Toronto and IFMA Toronto supplier or associate memberships, whose member directories link out; and the local BIA directory, if 243 Queen St W falls inside a BIA boundary (check). Each is a real relationship the franchises' Toronto pages lack. |
| Green Seal GS-37 products (Stratus) | **Service certifications with public directories:** ISSA CIMS / CIMS-GB, or Green Seal GS-42 for cleaning services. These certify the company itself, not a product line, so they beat a product listing on relevance. Check eligibility and cost first. |
| Generic national "Ultimate Guide" (Coverall) | **Toronto-specific linkable resources** that property managers and local media cite. Examples: an office-cleaning cost guide for Toronto with real price ranges from Evergreen's own quotes; an Ontario workplace washroom and sanitation requirements explainer; a cleaning-frequency checklist for GTA office buildings. Each one is a page worth linking to. |
| Wire press releases | **Earned local press** about real stories: 37 years in Toronto, long-tenured staff, a long-serving client building, a community clean-up. Pitch it to local and neighbourhood outlets and trade press (e.g. Canadian facility-management publications). Only real news; no paid distribution. |
| ~40k city-swap posts and ~13k service-location pages | **A few genuinely distinct area pages** (e.g. Downtown/Financial District, North York, Mississauga, Vaughan), each with real clients, photos, crews and case studies. Distinct pages earn citations and links; 40k clones do not. |
| Retired scholarship link bait (Coverall) | **Genuine community sponsorship** tied to where Evergreen works, e.g. a local sports team or a neighbourhood event. The organiser's sponsor page links because the relationship is real. Pick causes for the relationship, not the link. |
| One citation set per franchise | **Clean, consistent citations** for the one real office (Google Business Profile, HomeStars, Yellow Pages, Clutch, BBB if accredited), with the new brand name "Evergreen Office Cleaning" and one NAP. Also **reclaim old links** to retired WordPress URLs through the redirect map (`evergreen-profile.md`, section 3). |
| Supplier relationships (not visible here) | **Supplier and partner listings:** equipment and chemical suppliers' "find a contractor" pages, plus client case studies or testimonials on clients' own sites, with permission. |

**Do not copy:**
- city-swap or AI-templated location posts;
- scholarship link bait;
- paid press-release links;
- self-made satellite pages (see Nova in `competitors.md`);
- buying links, PBNs, or link exchanges.

## 5. Limits

- **No Moz data was retrieved for either competitor.** Every link-profile statement is inference from their own sites.
- DA is a Moz metric, not a Google one. Moz's index is a sample in any case.
- The sitemap totals for Stratus posts and service-location pages are **estimates**: only the first and last sitemap files were counted. Location (2,716), press (311) and Coverall's counts are exact for the files fetched.
- The 83% city-swap share is measured on 1,209 posts in two of 41 files. The share may differ in files 2 to 40.
- The text-similarity figures come from two page pairs only.
- No WebSearch was used, because the task allowed no queries.

# Content quality and E-E-A-T: Evergreen vs Impact (13 Nov 2026)

Area: content. Method: Evergreen measured from the fresh crawl (`cmp/evergreen/crawl/`, main-content text only, nav/header/footer stripped). Impact's crawl returned a LiteSpeed "Bot Verification" page for every URL except the home page (19 pages at 8 words, 67 at HTTP 403), so it could not be used. I refetched 17 public Impact pages through Playwright, one at a time with about 1.3 s between them, with Google, Meta, LinkedIn, Bing, Clarity, wp-json and admin-ajax requests blocked. That came to about 20 page requests including one curl probe and one retry. Text uniqueness was measured as 5-word-shingle Jaccard after replacing each page's own city name with a placeholder, so a pure city swap would score near 1.0.

## 1. Scores

| | Evergreen | Impact |
|---|---|---|
| **Content quality (overall)** | **69 / 100** | **74 / 100** |
| Experience (20) | 12 | 15 |
| Expertise (25) | 15 | 21 |
| Authoritativeness (25) | 10 | 21 |
| Trustworthiness (30) | 23 | 23 |
| E-E-A-T subtotal | 60 | 80 |
| Per-page quality on matched pages (service, location, blog) | 78 | 66 |
| AI citation readiness | 70 | 80 |

The weights are this audit's own model, not Google's. Impact wins on E-E-A-T: named people, a third-party standard (CIMS-GB), case studies, more reviews and a reference facts page. Evergreen wins per page. Its location pages are local and its posts cite sources, while Impact's 155 city × service pages pull Impact's average down. Normalised for size, Evergreen has the cleaner site. Impact has the stronger proof of who it is.

## 2. Who does what better

| Topic | Better | Evidence |
|---|---|---|
| Named people | **Impact** | `impact.ca/team` (1,018 words): about 20 named staff with titles (Chris Boutsalis CEO, George Boutsalis President, Lucy Reid VP Operations, cleaning-operations managers by name), plus head-office facts (10 languages, 1,100+ staff, 4 offices). Evergreen has no team page. The only named staff member is "Art", in a 2021 Google review on `/reviews/`. `/about-us/` names no one. |
| Blog authorship | **Impact** | Impact's matched post has JSON-LD `author` set to a `Person`, George Boutsalis. All 23 crawled Evergreen posts have `author` set to the Organization, "Evergreen Office Cleaning". |
| Certifications and memberships | **Impact** | `impact.ca/accreditations`: ISSA CIMS and CIMS-GB with Honours since 2012, IICRC technicians, ContractorCheck and ComplyWorks since 2006, BOMA, CAGBC, and EcoLogo or Green Seal products, plus "ask for the certificates for onboarding". Evergreen states WSIB, liability insurance, bonding, background screening and ECOLOGO-certified Armstrong ProSeries Green products (`/about-us/`). It holds no CIMS or other audited management standard. Note: the "ISSA" string on Evergreen pages is only a substring of "Mississauga". |
| Case studies | **Impact (thin)** | `impact.ca/case-studies` is 230 words and has one case study: Kingsway Boxing Club, Toronto, 5,000 sq ft, daily since 2024, "about 10 hours a week back". It also links video testimonials. Evergreen has none. `/cleaning-demo-gallery/` is 242 words. |
| Reviews | **Impact** | Impact shows "53+ 5-Star Google Reviews" site-wide and quotes 9 testimonials with business names on `/testimonials`. Evergreen's `/reviews/` (392 words) shows 7 Google reviews, each honestly dated, but 4 are from 2020–2021. |
| Reference or facts page | **Impact** | `impact.ca/company-facts` (2,060 words) has "Last updated: October 28, 2026", a facts table (founded, owners, HQ address, staff, offices, phones, hours, former names) and 12 question-style H2s. It is the most quotable page on either site. Evergreen's `/about-us/` has a good "at a glance" list but is 594 words with no FAQ. |
| History | **Impact** | `impact.ca/history` (1,240 words) gives a dated timeline from 1954 to 1978 to 1997 to today. Evergreen gives only "since 1989" and the former name. |
| Consistency of claims | **Evergreen** | Impact's home page says "Family-owned and Canadian since 1954", but `/history` says the Boutsalis company merged in 1997 and `/team` says "family-run since the 1990s". Evergreen's 1989, address and hours claims match on every page I checked. |
| Matched service page | **Even** | Evergreen `/office-cleaning/`: 1,704 main-content words and 16 H2s, including a question-led FAQ, "Who cleans the office, and are they screened?", "Scope and limits" and "What affects the price". Impact `/office-cleaning`: about 2,565 words including page chrome and 17 H2s, with switching steps, quality control, a CIMS mention (4 times), green certification and a cost section. Impact has more proof. Evergreen is plainer and more honest about limits. Neither shows a price figure. |
| Matched blog post | **Evergreen (narrowly)** | Evergreen `/how-often-should-an-office-be-cleaned/` (2,020 words): a size and occupancy table, a worked "6,000-square-foot Toronto office" schedule, an explicit "planning examples, not mandatory standards" disclaimer, and outbound citations to CCOHS, ontario.ca and canada.ca. Impact `/blog/how-often-should-an-office-be-professionally-cleaned-in-toronto` (published 25 Aug 2026, modified 31 Aug) has 10 question H2s with zones, size, seasons, hybrid work and an FAQ, and a named Person author. I could not extract its body text, so its word count and citations are unverified. |
| Location pages | **Evergreen** | Evergreen `/locations/mississauga/` names Hurontario, the Airport Corporate Centre, Meadowvale, Lisgar, East Credit and City Centre. Impact `/ontario/mississauga/office-cleaning` (2,183 words) mentions "Mississauga" 24 times but names no place in it (0 hits for Square One, Meadowvale, Heartland, Pearson, Port Credit, Hurontario, Streetsville). See section 2a. |
| Blog programme | **Mixed** | Impact has 22 posts, including strong buyer guides (vendor selection, switching companies, 2026 in-house vs outsourced cost, CIMS, APPA, day porter vs janitorial). At least 6 are newsletters or brand posts with little search value ("The Sweep" x3, "An Impactful Blog", "Born to Clean", "Cleaning on a Grand Scale"). Evergreen has 25 posts (23 crawled): 5 long-form 2026 guides of 900–2,100 words with tables and citations, and 18 legacy posts of 549–1,378 words. 14 legacy posts (first published 2020–2023) show `dateModified` 2026-11-06 or 2026-11-07, which looks like a bulk refresh. That is only a risk if the edits were trivial. |
| Metadata accuracy | **Evergreen** | Impact `/ontario/brampton/commercial-restroom-cleaning` has the meta description "Professional retail cleaning in Brampton…" on a restroom page, a copy-paste error typical of bulk production. Evergreen's sampled titles and descriptions match their pages. (`metadata_template.py` could not run because the Claude SEO runtime was not set up. This was a manual check.) |

### 2a. Impact's 155 /ontario/<city>/<service> pages: are they doorways?

Sample: 7 pages across 7 cities and 5 services. They were `mississauga`, `toronto` and `burlington` for office cleaning, plus `oakville/hotel-cleaning`, `brampton/commercial-restroom-cleaning`, `hamilton/janitorial-services` and `muskoka/retail-cleaning-service`.

| Measure | Impact sample (7) | Evergreen /locations/ (9 crawled) |
|---|---|---|
| Words per page | 1,061–2,183 (incl. ~400-word shared shell) | 893–1,218 |
| Mean 5-shingle Jaccard, city name masked | 0.13 (same-service office trio: 0.05) | 0.16 |
| Highest pair | 0.30 (burlington/office vs oakville/hotel) | 0.23 (oakville vs etobicoke) |
| Named local places | Occasional (Oakville hotel page: Bronte Harbour, GO Station). None on Mississauga. | Every page sampled (e.g. Hurontario, Meadowvale) |
| Local proof (local client, case, crew, office) | None seen | Shared Queen St W office. No local case either. |

**Verdict, stated plainly:** Impact's city pages are **not template swaps**. Each has its own body copy, and same-service pages share only 2–10% of their shingles. But they **do look like doorway pages in purpose**, and they show scaled-content traits:
- An identical ~400-word Elementor shell on every page. It says "Trusted by Toronto's top commercial property managers" and "Join the hundreds of Toronto businesses", even on the Burlington and Muskoka pages.
- Keyword-template headings such as "Office Cleaning Company Near Me" and "A Cleaning Company Mississauga Businesses Can Rely On".
- Empty H2 tags, and only 2 real H2s on the Burlington and Hamilton pages.
- A mismatched meta description (Brampton).
- 10 Muskoka pages with no office there.
- No city-specific evidence: no local client, case study, crew lead or photo.

The unique text is generic service copy with the city name in it, not local information. Under the QRG and Google's doorway and scaled-content policies, this is a **risk, not a model**. Evergreen should not build 155 city × service pages.

Fairness note: Evergreen's 9 location pages share *more* text with each other (mean 0.16) than Impact's sample does. They carry a common service block, FAQ, review strip and "Other service areas". They earn their place through local detail and small number, not through unique wording.

## 3. Copy the pattern, not the content

1. **Team page with real names and roles.** Add `src/pages/team.astro` (or a section in `src/pages/about-us.astro`) with the owner (the "Art" in the reviews, if he agrees), the account executive and crew supervisors. Give each a role, years with the company and a photo. Add `Person` JSON-LD linked to the Organization.
2. **Named post authors.** Change the blog `author` in the post layout and schema (the `src/content/` posts and their layout in `src/layouts/`) from the Organization to a named `Person` with a bio link. Start with the 5 long-form 2026 guides.
3. **Company facts page.** Add `src/pages/company-facts.astro`. Include a "Last updated" date, a facts table (founded 1989, former name, address, hours, service area, WSIB, insurance, bonding, products, response time) and 8–10 question H2s. Most of this already exists in `/about-us/`. It needs restructuring for quoting, not new claims.
4. **Case studies.** Write 2–3 real ones with client permission. For each, give the building type, square footage, schedule, scope and a measured result. Impact has only one. Two good ones would match it, and three would beat it.
5. **Third-party accreditation.** If Evergreen pursues ISSA CIMS, or joins BOMA Toronto or a similar body, list it on an accreditations section with what each body audits. Do not claim anything not yet held. Until then, state precisely what is verifiable (WSIB clearance, insurer, ECOLOGO product line).
6. **Fresher reviews.** Ask current clients for Google reviews. 4 of 7 shown are from 2020–2021, and Impact shows 53+. Keep showing dates on `src/pages/reviews.astro`, which is a trust strength.
7. **Dated history.** A short timeline on `/about-us/` (1989 founding, the rename, the 2026 rebuild, milestones) gives Experience signals Evergreen currently lacks.

## 4. Where Evergreen already beats Impact

- **No doorway risk.** Evergreen has 11 location pages, each naming real local business districts, with no city × service explosion. Impact's 155-page matrix is its biggest content liability.
- **Cited, bounded advice.** The matched post links CCOHS, ontario.ca and canada.ca and labels its schedules as examples, not standards. Impact's matched post is unverified on citations.
- **Honest scope.** `/office-cleaning/` has "Scope and limits" and "Who cleans the office, and are they screened?" sections, and `/about-us/` says "No residential cleaning". That is QRG-friendly transparency.
- **Consistent claims.** I found no contradiction like Impact's "family-owned since 1954" versus "family-run since the 1990s".
- **Clean metadata.** There are no copy-paste mismatches like Impact's Brampton restroom/retail description.
- **Per-page focus.** Every Evergreen service and location page is about one thing for one audience. Impact's city pages put the same quote form, service grid and Toronto-centric claims on every URL.

## 5. Not verified

- **Impact blog body text.** Article text did not extract (11 words), so word counts, citations and originality of Impact's 22 posts are unverified. I judged only the matched post's H2s, dates and author schema, and the other posts by title.
- **The other 148 Impact city pages.** 7 of 155 were sampled. BC and Alberta city pages were not sampled.
- **Impact pages not fetched:** `/who-we-are`, `/philosophy`, `/principles`, the city hub pages, and the 2 video testimonials.
- **Impact's claims** (CIMS-GB with Honours, 53+ reviews, 1,100+ staff, 35M sq ft) were read from its pages and not checked with ISSA or Google.
- **Evergreen pages missing from the crawl:** `/locations/brampton/`, `/locations/markham/`, `/insights/`, `/commercial-cleaning-quote-checklist/` and `/how-to-properly-dust-office-building/` returned no status, so 23 of 25 posts and 9 of 11 location pages were measured.
- **Evergreen dates:** whether the 2026-11-06/07 `dateModified` changes on legacy posts were substantive.
- **Backlinks and authority:** no backlink data, because the Moz quota is exhausted. The Authoritativeness scores rest on on-page evidence only.
- **Templated metadata:** `metadata_template.py` was not run because the runtime was not ready. Metadata was checked by hand for the 7 Impact samples and the Evergreen pages above.

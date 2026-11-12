Score: 63/100
Previous: 62/100 (re-audit 7 Nov)

# Search Experience (SXO): www.evergreencleaningservice.ca, third audit, 11 Nov 2026

This is the **SXO Gap Score** (search-experience fit). It is not an SEO health score. As in the previous two runs, the headline is the persona average (62.5, rounded to 63). The 7-dimension gap score is 65/100 (it was 64).

## Bottom line

Since 7 Nov the site gained coverage. It did not gain proof.
- **Better:**
  - `/services/janitorial-services/` (1,817 words) is a service page in a SERP of vendor service pages. Page type is ALIGNED.
  - `/commercial-cleaning-quote-checklist/` (1,739 words, 10 Nov 2026) speaks directly to the "compare vendors / get an itemized quote" story, and 61 crawled pages link to it.
  - The cost guide has "Costs" back in its title.
  - Field CWV is still good: LCP p75 0.80 s across 43 beacons.
- **Unchanged:**
  - Still 7 Google reviews, 4 of them from 2020–2021.
  - 0 Person entities and no named person anywhere.
  - 0 case studies, and no photos of Evergreen's own work.
  - The quote form still has 8 required fields, including street address.
  - No Evergreen price on any page.
  - The clinic page still has 0 mentions of training, colour-coding or a log.
- **New risks introduced since 7 Nov:**
  - The new janitorial page has no review block at all.
  - Its body overlaps the retitled commercial page.
  - The new photo heroes are unlabelled stock, while the gallery and the checklist post do label their photos as stock.
  - On the janitorial mobile fold, the video bubble covers the "liability insurance" trust line (owned by `visual.md` V2).
  - The "commercial cleaning quote checklist" SERP is largely *supply-side*: cleaners learning how to write a bid.
- **SERPs:** Evergreen did not appear in any of the 4 result sets. "office cleaning North York" is still 18 of 18 HomeStars results. "office cleaning cost Toronto" is still led by HomeStars ($30–60/hr), Hellamaid and the dev.to post.

## Method and limitations

- 4 WebSearch queries, as the brief allows. The tool returns a non-Google index: no local pack, ads, PAA, AI Overview or rank positions, and many spam or low-quality hosts (pages.dev, notion.site, lovable.app, yolasite, gitbook). Page-type mix is inferred from the 17–23 URLs returned per query.
- Page content comes from `raw/crawl/pages.json` and `raw/crawl/html/` (crawled after all changes were deployed). Text extracts are in `/tmp/claude-0/-home-user-evergreencleaningservice/692c77ca-669b-54d4-b608-18eee442d35d/scratchpad/sxo3/`. I did no live refetch. The plugin's render script refuses this sandbox's proxy, and the crawl is from today.
- 3 screenshots were viewed: the janitorial, quote-checklist and North York mobile folds.
- Field CWV comes from `raw/cwv-field-6d.txt` (6 days, 479 visits, 43 LCP beacons). Lab figures come from `raw/lab-medians.txt`. I did not re-run Lighthouse.

## SERP-backwards check (4 queries, this run)

| Query | What ranks (observed) | Intent | Evergreen page | Type match | Gap now |
|---|---|---|---|---|---|
| office cleaning cost Toronto | HomeStars Toronto directory pages ×15 (its summary gives "$30 to $60 per hour"), Hellamaid "how much does commercial cleaning cost in Ontario" ×2, dev.to "what office cleaning should actually cost… 2026" | Informational: a number | `/office-cleaning-cost-toronto-guide/`. Title: "Office Cleaning Costs in Toronto: How Pricing Works". H1: "What Drives Office Cleaning Costs in Toronto" | Type **ALIGNED** (guide). **Intent mismatch: HIGH (still open)** | The only figures are still an "assumed $100–$300 per visit" (the page calls it "an arithmetic input") and a "$150 per visit… hypothetical" example. "hypothetical" appears 6 times. Putting "Costs" back in the title raises the expectation of a number that the body still does not give. |
| janitorial services Toronto (new page) | Vendor service pages (Coverall Toronto support centre, Swift Janitorial, NOVA Building Maintenance on notion.site, RMB on blogspot, TitanEdge and Master Building Services on pages.dev), directories (Clutch "62 companies", HomeStars, YellowPages, Yabsta), TitanEdge "janitorial vs commercial cleaning" blog, Job Bank | Find and compare a provider | `/services/janitorial-services/` (Service + FAQPage, 1,817 words) | **ALIGNED** | Weak field: mostly thin or spam vendor pages, plus Coverall and directories. Evergreen's page is deeper than any vendor result observed, but it shows 0 reviews and 1 stock content image. It also overlaps `/services/commercial-cleaning/` (see N2). |
| commercial cleaning quote checklist (new post) | **Supply-side "how to quote/bid" content** (SweptWorks "How to Quote Commercial Cleaning Jobs", Housecall Pro "how to price", Clean Group "How to Write a Commercial Cleaning Quote", ShiftFlow "How do I bid", a bid-checklist .txt, a Udemy course). **Task checklists and templates** (Coverall checklist PDF, checklist.com, SafetyCulture, ServiceMaster). Vendor "what commercial cleaning should include" blogs. | Mixed: about half are cleaners writing bids; the rest want a task checklist or template | `/commercial-cleaning-quote-checklist/` (BlogPosting, buyer-side) | **MEDIUM**: buyer guide in a SERP split between bidder how-tos and printable templates | Buyer intent is a minority of this SERP. The post has no downloadable or printable checklist (0 PDF links), and its 6,000 sq ft example has 0 "$" figures. |
| office cleaning North York | HomeStars "office-cleaner-pros/north-york", 18 of 18 results (pages 8–62). Summary: "$30 to $60 per hour", "4.7 out of 5 based on 101 reviews" | Find and compare vendors | `/locations/north-york/` | Page **ALIGNED** (local page). SERP is **100% directory** | Unchanged. The only route in is a HomeStars listing (client action). |

**Mismatch summary:** no CRITICAL page-type mismatch.
- The cost guide's *intent* mismatch remains **HIGH**.
- The new quote-checklist post is a **MEDIUM** mismatch (mixed and largely supply-side SERP).
- The office-cleaning checklist's MEDIUM template mismatch (previous N1) is still open.
- The new janitorial page is ALIGNED.

## User stories (re-cited against this run's signals)

1. **Small business owner wanting a price** (awareness → consideration). *Signal: HomeStars "$30 to $60 per hour", plus the Hellamaid and dev.to cost posts on "office cleaning cost Toronto".* "I want a ballpark monthly cost before I hand over my street address."
2. **Facility manager comparing vendors** (consideration). *Signal: the HomeStars-only North York SERP ("4.7 out of 5 based on 101 reviews", "get an itemized quote") and Clutch's "62 companies" on "janitorial services Toronto".* "I want reviews, comparable buildings and an itemized quote so I can shortlist three contractors."
3. **Buyer checking a proposal before signing** (decision; new). *Signal: the "line by line" review and "never quote… without a site assessment" advice on "commercial cleaning quote checklist".* "I have two quotes. I want to know what each should include and what to ask before I sign."
4. **Property manager, periodic floor care** (decision). *Signal from the 7 Nov run: Jani-King "$0.50 to $2 per square foot" and "$1 million liability". Not re-queried.* "I want a $/sq ft range, a cycle plan and proof of insurance."
5. **Clinic office manager** (consideration → decision). *Signal from the first audit: TitanEdge and Coverall lead with IPAC. Not re-queried.* "I want to know the crew is trained to IPAC practice."

## Persona re-scoring (Relevance / Clarity / Trust / Action, 25 each), weakest first

| Persona | Pages scored | R | C | T | A | Total | 7 Nov | Change |
|---|---|---|---|---|---|---|---|---|
| Small business owner wanting a price | `/office-cleaning-cost-toronto-guide/`, `/commercial-cleaning-quote-checklist/`, `/services/office-cleaning/`, `/request-a-quote/` | 14 | 16 | 12 | 9 | **51** | 50 | +1 |
| Clinic office manager | `/industries/medical-dental-clinics/` | 22 | 20 | 8 | 14 | **64** | 64 | 0 |
| Property manager, periodic floor care | `/services/floor-stripping-waxing/`, `/industries/property-management/`, `/services/post-construction-cleaning/` | 23 | 20 | 9 | 14 | **66** | 66 | 0 |
| Facility manager comparing vendors | `/`, `/services/janitorial-services/`, `/services/commercial-cleaning/`, `/commercial-cleaning-quote-checklist/`, `/locations/north-york/` | 23 | 22 | 9 | 15 | **69** | 67 | +2 |
| **Average** | | | | | | **62.5** | 61.75 | +0.75 |

**Small business owner (51, +1).**
- *Clarity +1:* The new quote checklist gives this persona a way to compare like-for-like quotes. It covers tasks, frequency, supplies, exclusions, a 6,000 sq ft example and questions to ask before signing. It is linked from 61 pages.
- *Relevance flat:* The cost guide is unchanged in substance: "These are hypothetical CAD calculations before HST, not Evergreen quotes or verified GTA market averages". The 6,000 sq ft example in the new checklist contains no dollar figure.
- *Action flat:* `/request-a-quote/` still has 8 required inputs (`name`, `business-name`, `address1`, `city`, `province`, `postal`, `email`, `phone`). It has no sq ft, visits-per-week or washroom field. The previous file said "9". The markup shows 8, and the substance is unchanged. The `mailto:`/`tel:` fallback (Phase A) only helps when the script fails.
- **To raise it:** publish Evergreen's own monthly ranges (decision D-D), or cite the HomeStars $30–60/hr as an attributed benchmark. Make the street address optional and add sq ft and visit fields (D-A).

**Clinic office manager (64, unchanged).** `/industries/medical-dental-clinics/` still has "train" 0 times, "colour-coded" 0, log or sign-off 0, and no review block. It still says "for years". The new janitorial page links to it ("see our clinic page for what changes"), which helps discovery but not proof. **To raise it:** add the crews' IPAC training, colour-coded cloths, a sign-off log and a clinic testimonial (client).

**Property manager (66, unchanged).** The floor page still has the sample-year plan and the Katchen review. There are still 0 "$", no before/after and no insurance limit. The new photo hero (#93) is the stock "gallery-lobby-floor-care" image. It adds visual weight but no proof.

**Facility manager comparing vendors (69, +2).**
- *Relevance and Clarity, +1 each:* The janitorial page answers "what janitorial services are", "how often", "janitorial or commercial cleaning?" and "how a janitorial contract starts". The quote checklist matches HomeStars' "itemized quote" advice.
- *Trust flat at 9:*
  - The janitorial page has no "What clients say" block (0 star characters).
  - The mobile fold shows the video bubble over "Background-screened staff, covered by liability insurance" (screenshot).
  - The homepage "Testimonials" (Brenda Carmichael, "Allen Robinson Founder & CEO", Paul Lockheart) are still undated and unsourced.
  - Still 7 Google reviews.
- **To raise it:** put the strongest office or property-manager review on the janitorial page, add reviews and directory profiles, name the account executive, and publish case studies.

## SXO Gap Score: dimension detail (65/100, was 64)

| Dimension | Now | Was | Evidence |
|---|---|---|---|
| Page type | 12/15 | 12 | + Janitorial page ALIGNED. − The quote-checklist post sits in a mixed, largely supply-side SERP. The cost-guide intent gap is still HIGH. |
| Content depth | 13/15 | 13 | The janitorial page (1,817 words) and quote checklist (1,739) are substantive. But janitorial and commercial overlap (N2), and the new page repeats the "Scope and limits / How it works / What affects the price" blocks. |
| UX signals | 13/15 | 13 | Field LCP p75 0.80 s, INP 48 ms, CLS 0.000 (`raw/cwv-field-6d.txt`, 43/30/35 beacons). Lab mobile LCP on the office page went from 1.56 s to 2.38 s after the photo hero (janitorial runs 2.08–2.72 s), right at the 2.5 s line. Video bubble over trust text on janitorial mobile. 8 required form fields. |
| Schema | 11/15 | 11 | Service, FAQPage and BreadcrumbList on the janitorial page. `"Person"` 0 and `founder` 0 across all 94 crawled pages. The new BlogPosting byline is still "By Evergreen Office Cleaning". |
| Media | 5/15 | 4 | +1 for photo heroes on 13 offer pages (a better first impression). All are stock and unlabelled. 0 own-work photos and 0 before/after. |
| Authority | 4/15 | 4 | 7 Google reviews (Sep 2026, Jan 2026, 2025, May 2021 ×3, Oct 2020). Evergreen is absent from all 4 SERPs. 0 project or case URLs in the 94-URL crawl. |
| Freshness | 7/10 | 7 | Quote checklist dated 10 Nov 2026. Reviews and homepage testimonials are still mostly 5–6 years old or undated. |

## 1. Status of re-audit findings (`reaudit-2026-11-06/findings/sxo.md`, plus critic C10)

| # | Finding (severity) | Status | Evidence now |
|---|---|---|---|
| 1 | Cost guide does not satisfy cost intent (HIGH) | **Partly fixed** | `/office-cleaning-cost-toronto-guide/`: the title is now "Office Cleaning Costs in Toronto: How Pricing Works" and the H1 "What Drives Office Cleaning Costs in Toronto". The body still has only "hypothetical" figures ($100–$300 per visit; $150 per visit giving $3,250 per month). There is no Evergreen range and no attributed benchmark. |
| 2 | Third-party proof missing (HIGH) | **Open** | `/reviews/`: the same 7 Google reviews. Evergreen is absent from all 4 SERPs, and North York is 18 of 18 HomeStars results. |
| 3 | No named people (HIGH) | **Open** | `/about-us/` (600 words): no names. JSON-LD has 0 Person entities sitewide. The 10 Nov post byline is "By Evergreen Office Cleaning". "Account executive" appears 5 times on the janitorial page, never named. |
| 4 | No case studies, no own-work photos (HIGH) | **Open** | No project or case URL among 94 crawled URLs. The gallery is now openly "Illustrative stock photographs" (`/cleaning-demo-gallery/` meta description). New heroes are stock as well. |
| 5 | Persona-matched reviews (MEDIUM) | **Partly fixed** (no progress; new gap) | Katchen is still on the floor and property-management pages. The clinic page still has 0 reviews. **The new `/services/janitorial-services/` has no review block at all**, while office and commercial do ("What clients say" H2). |
| 6 | Quote form too long (MEDIUM) | **Open** | `/request-a-quote/`: 8 required inputs (name, business-name, address1, city, province, postal, email, phone). No sq ft, visits or washroom fields. |
| 7 | Post-construction residential SERP (MEDIUM) | **Partly fixed** | Unchanged since 7 Nov: commercial title and H1, plus a "How a post-construction clean is priced" H2. 0 "$", no handover case. |
| 8 | Floor page lacks $/sq ft and visual proof (MEDIUM) | **Partly fixed** | "A sample year for a lobby floor" is still present. 0 "$". The only content image is the stock "gallery-lobby-floor-care", now used as the hero. |
| 9 | Clinic IPAC training and documentation (MEDIUM) | **Open** | `/industries/medical-dental-clinics/`: train 0, colour-coded 0, log or sign-off 0, "for years" 1. |
| 10 | Generic Mississauga intro (LOW) | **Fixed** | `/locations/mississauga/` still opens "Mississauga's workplaces run from head offices along Hurontario and the Airport Corporate Centre to the plants and warehouses of Meadowvale". |
| 11 | Identical boilerplate on money pages (LOW) | **Open** | The new janitorial page carries the same "What is included / Scheduling / Scope and limits / How it works / What affects the price" H2 set as office, commercial, floor and clinic. |
| N1 | Office-cleaning checklist is a blog guide in a template SERP (MEDIUM) | **Open** | `/office-cleaning-checklist/`: 0 PDF links, no print button. The only `@media print` rule found handles the reveal animation. |
| N2 | Location pages lead into directory-only SERPs (MEDIUM) | **Open** | "office cleaning North York": HomeStars 18 of 18 again. |
| N3 | Cost-guide disclaimers undercut the page (LOW) | **Open** | "hypothetical" ×6, plus "not a statement of what your office should cost" and "not an Evergreen price, quote or verified market rate". |
| N4 | Blank band above the hero image on the North York mobile fold (INFO) | **Open** | `screenshots/locations_north-york-mobile-fold.png`: about 165 px of white space between the trust row and the vacuum image. A similar band of about 150 px appears above the breadcrumb on `commercial-cleaning-quote-checklist-mobile-fold.png`. |
| N5 | Field performance supports UX (INFO, positive) | **Not applicable** (still holds) | LCP p75 0.80 s (95.3% good), INP 48 ms, CLS 0.000 across 6 days. Small sample. |
| C10 | Clinic proof (critic, Low/client) | **Open** | Same as #9. |

Counts: Fixed 1, Partly fixed 4, Open 11, Regressed 0, Not applicable 1. The janitorial review gap (#5) and the stock-hero issue are reported below as new findings, not as regressions of earlier fixes.

## 2. New findings

### S1. New janitorial page has no proof block (HIGH for the vendor-comparison persona)
- **Evidence:** `/services/janitorial-services/` has no "What clients say" H2 and no star rating. Its one content image is the stock "Janitorial cart stocked with cleaning supplies". The "janitorial services Toronto" SERP is directories (Clutch, HomeStars, YellowPages) where buyers compare on reviews. On the mobile fold the video bubble sits over the "liability insurance" trust line (`screenshots/services_janitorial-services-mobile-fold.png`; layout owned by `visual.md` V2).
- **Recommendation:** Add the existing reviews block to the janitorial offer data. The best fits are the Paul Lockheart-style multi-year contract quote, if it can be dated and sourced, or Michael Katchen. The data lives in `src/components/OfferPage.astro` and the janitorial page's content entry. Fix the bubble gate in `LeadVideo.astro`, per visual V2.

### S2. Janitorial and commercial pages compete for the same intent (MEDIUM)
- **Evidence:**
  - `/services/commercial-cleaning/` was retitled from "Commercial Cleaning & Janitorial in Toronto" to "Commercial Cleaning Services in Toronto". But its body still has the H2s "What commercial cleaning and janitorial services are", "Janitorial services: the daily upkeep" and "Commercial cleaning, janitorial or office cleaning?".
  - `/services/janitorial-services/` has "Janitorial services or commercial cleaning?" and an FAQ on the same difference.
  - Both open with the same definition (see `content.md`).
  - The commercial page does link to the janitorial page 4 times.
- **Recommendation:** Cut the commercial page's "Janitorial services: the daily upkeep" section to two sentences plus a link. Rename "What commercial cleaning and janitorial services are" to "What commercial cleaning covers". Keep the "which one do I need" answer on one page only, ideally janitorial, and link to it from the other.

### S3. Quote-checklist post targets a mostly supply-side SERP and has no takeaway (MEDIUM)
- **Evidence:** "commercial cleaning quote checklist" returns bid and pricing how-tos aimed at cleaning businesses (SweptWorks, Housecall Pro, Clean Group, ShiftFlow, Udemy) and templates (the Coverall checklist PDF, checklist.com, SafetyCulture). `/commercial-cleaning-quote-checklist/` is a buyer guide. It has 0 PDF links, and its 6,000 sq ft "illustrative" quote has no dollar line.
- **Recommendation:**
  - Make the buyer angle explicit in the title, for example "…Checklist for Buyers: What a Cleaning Quote Should Include". Keep "commercial cleaning quote checklist" in the H1.
  - Add a one-page printable "compare two quotes" sheet with a download CTA.
  - Link it from `/request-a-quote/` ("what you will receive").
  - File: `src/content/blog/commercial-cleaning-quote-checklist.md` (other contributor's post).
  - Expect buyer long-tail traffic rather than the head term.

### S4. Stock photo heroes are labelled inconsistently (LOW)
- **Evidence:** The gallery's meta description reads "Illustrative stock photographs", and the quote checklist captions read "Illustrative stock photograph." The 13 new offer-page heroes (#93) carry no such label, for example office "Vacuum cleaner being used on an office floor" and janitorial "Janitorial cart…". The office page also uses a file named `night-janitorial-crew-office-toronto`, which implies Evergreen's own Toronto crew.
- **Recommendation:** Either add a small "Illustrative photo" caption in `src/components/OfferPage.astro`, or replace the heroes with own-work photos after the photoshoot (H6). Rename image files so that none implies they show Evergreen's own crew.

### S5. Photo heroes moved lab LCP toward the 2.5 s line (INFO)
- **Evidence:** In `raw/lab-medians.txt`, the office page's mobile LCP went from 1.56 s to 2.38 s (runs 2.06–2.63 s), and the janitorial page's runs are 2.08–2.72 s. The hero image is now the LCP element. Field data is still good (p75 0.80 s), but only 2 beacons cover `/services/office-cleaning/`.
- **Recommendation:** Owned by `performance.md`. From an SXO view, keep it under watch for paid landing traffic.

## 3. What still needs the client or an account owner

- **D-D:** real Evergreen monthly ranges by size and frequency, or approval to cite HomeStars $30–60/hr as an external benchmark. A $/sq ft band for floor care and post-construction.
- **D-A:** whether street address can become optional on the quote form and price-predicting fields can be added.
- Names, photos and publishing permission for the owner and account executive, for `/about-us/`, bylines and Person schema.
- Photoshoot (H6) to replace the stock heroes and gallery. Approval of the warehouse floor project. Consent for 3 case studies (floor, clinic, multi-tenant office).
- Weekly review requests. Claim or create HomeStars, Clutch and BBB profiles; HomeStars is the whole North York SERP and part of the janitorial and cost SERPs.
- Clinic: confirmation of IPAC training, colour-coding and the sign-off log; a clinic testimonial. The liability insurance limit.
- Dates and sources for the three homepage testimonials, including who "Allen Robinson, Founder & CEO" is, or permission to remove them.

## 4. Not verified

- Google's real SERP: rank positions, local pack, PAA, AI Overview. The search tool is a non-Google index. Evergreen was absent from all returned sets.
- Whether the janitorial or quote-checklist page is indexed or receives impressions. No Search Console access; both are too new.
- Whether the video bubble overlap happens on real devices or only at screenshot timing (see `visual.md`).
- Live quote-form server-side validation. Only the `required` attributes in the markup were checked; the form was not submitted.
- Floor, clinic and post-construction pages on mobile. Not viewed this run.
- Whether the site photos are stock beyond the site's own labels (no reverse image search).

Cross-skill: `/seo content` (E-E-A-T, named authors, janitorial/commercial overlap), `/seo local` (HomeStars and GBP), `/seo schema` (Person, founder). A PDF report is available via `/seo google report`.

### Sources (this run)
- dev.to cost post: https://dev.to/revenue_search_59822c24c6/what-office-cleaning-should-actually-cost-in-toronto-scarborough-etobicoke-and-north-york-2026-23p6
- HomeStars Toronto office cleaners: https://www.homestars.com/cleaning/office-cleaner-pros/toronto?page=7
- HomeStars North York: https://www.homestars.com/cleaning/office-cleaner-pros/north-york?page=8
- Hellamaid commercial cleaning cost Ontario: https://hellamaid.ca/blog/how-much-does-commercial-cleaning-cost-in-ontario
- Coverall Toronto: https://www.coverall.com/locations/canada/toronto-support-center/commercial-cleaning-services-in-toronto--the-gta-for-offices-healthcare-tech--more/
- Clutch Toronto janitorial: https://clutch.co/ca/real-estate/commercial-property-management/janitorial-cleaning/toronto?page=2
- TitanEdge janitorial vs commercial: https://titanedge-cleaning.pages.dev/blog/janitorial-vs-commercial-cleaning-difference
- SweptWorks how to quote: https://learn.sweptworks.com/how-to-quote-a-commercial-cleaning-job
- Housecall Pro pricing: https://www.housecallpro.com/resources/how-to-price-commercial-cleaning-jobs/
- Coverall checklist PDF: https://www.coverall.com/wp-content/uploads/2025/06/Coverall-Business-Cleaning-Checklist.pdf
- checklist.com commercial: https://checklist.com/commercial-cleaning-checklist

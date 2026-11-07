Score: 62/100
Previous: 58/100 (first audit)

# Search Experience (SXO) re-audit: www.evergreencleaningservice.ca, 6 Nov 2026 (evening)

This is the **SXO Gap Score** (search-experience fit). It is separate from any SEO health score. As in the first audit, the headline is the persona average (61.75, rounded to 62). The 7-dimension gap score is 64/100 (it was 61).

## Bottom line

The fixes improved how honest and how well targeted the pages are. The trust and proof problem has not moved.
- **Better:** The cost guide's title now matches its content ("How Office Cleaning Is Priced in Toronto"). Post-construction now targets commercial work. The floor page has a sample year for a lobby and the property-manager review. The generic block at the top of the Mississauga page is gone. Four new location pages (North York checked) and a 2,098-word office cleaning checklist were added. Field Core Web Vitals are good: LCP p75 is 0.98 s across 91 real-user beacons.
- **Unchanged:**
  - 7 Google reviews, 4 of them 5 to 6 years old.
  - No named person anywhere on the site, and no Person entity in the JSON-LD.
  - 0 published case studies, and no photos of Evergreen's own crews or work.
  - The quote form still requires 9 fields.
  - No price numbers on any page.
- **The SERPs still reward exactly what is missing.** "office cleaning North York" returned 18 of 18 results from HomeStars. "office cleaning cost Toronto" is led by HomeStars ($30–60/hr) and Hellamaid. "floor stripping and waxing Toronto" still carries the Jani-King "$0.50–2 per sq ft" guide. Evergreen did not appear in any of the 4 result sets.

## Method and limitations

- 4 WebSearch queries, as the brief allows. The tool returns a non-Google index: no local pack, ads, People Also Ask, AI Overview or rank positions, and several spam results (pages.dev, Google Sites, scraped .edu and .kz pages). Page-type mix is inferred from the 15–30 URLs returned per query.
- Page content comes from `raw/crawl/pages.json` and `raw/crawl/html/`, plus the text extracts already in the scratchpad (the cost guide was extracted fresh from saved HTML). The "â€”" mojibake in the saved HTML is a crawler artefact.
- One screenshot was checked: `screenshots/locations_north-york-mobile-fold.png`. No live refetch was done; the crawl is from tonight, after all fixes were deployed.
- No Google Business Profile, Search Console or rank data. Field CWV comes from `raw/cwv-field-6d.txt`, which covers only 6 days and about 274 visits.

## SERP-backwards check (4 queries, this run)

| Query | What ranks (observed) | Intent | Evergreen page | Type match | Gap now |
|---|---|---|---|---|---|
| office cleaning cost Toronto | HomeStars directory pages ×12 plus its price guide ($30–60/hr), Hellamaid "how much does commercial cleaning cost in Ontario" ×2, dev.to "what office cleaning should actually cost", TitanEdge cost blog | Informational: a number | `/office-cleaning-cost-toronto-guide/` (now titled "How Office Cleaning Is Priced in Toronto") | Type **ALIGNED** (guide). The title no longer over-promises. **Intent mismatch: HIGH (still open)** | The only figures are a "hypothetical $100–$300 per visit" and a "$150 per visit… hypothetical" worked example. The FAQ says "This guide does not establish a verified Toronto rate per square foot." |
| floor stripping and waxing Toronto | Jani-King national pages and blog (the $0.50–2/sq ft guide, "questions to ask", "$1 million liability"), BBB category pages, TitanEdge and Master Building Services (pages.dev), Google Sites vendors, soumissionrenovation | Find a provider plus a $/sq ft figure | `/services/floor-stripping-waxing/` | **ALIGNED** | Still the weakest local SERP: no strong Toronto independent. The page is better than any result on content but gives no $/sq ft and shows no before/after. |
| office cleaning North York | HomeStars "office-cleaner-pros/north-york", 18 of 18 results (paginated). The summary quotes $30–60/hr for North York. | Find and compare vendors | `/locations/north-york/` (new) | Page type **ALIGNED** (local page). The SERP is **100% directory**. | The only way into this SERP is a HomeStars listing. On-page work cannot reach it. |
| office cleaning checklist | Template and tool pages (checklist.com and its PDF, Connecteam template and PDF, SafetyCulture, GoAudits, checklist.gg, Oxmaint, process.st), cleaning-brand blog checklists (Molly Maid, Homeaglow, Luce, eMop, TaskRabbit), "printable" copies | Get a **template to print or download** | `/office-cleaning-checklist/` (new, BlogPosting, 2,098 words) | **MEDIUM**: blog guide vs. a template/tool-led SERP | The page says it "can be printed and adapted" but offers no PDF or download. The query is not local, and global template sites hold it. |

**Mismatch summary:** no CRITICAL page-type mismatch. The cost guide still has a HIGH *intent* mismatch: the title now matches the content, but the content still does not give searchers the number they want. The checklist has a new MEDIUM format mismatch. North York is a new directory-only SERP.

## User stories (unchanged from the first audit, re-cited against this run's signals)

1. **Small business owner wanting a price** (awareness → consideration). *Signal: HomeStars "$30 to $60 per hour" and the Hellamaid and dev.to cost posts on "office cleaning cost Toronto".* "I want a ballpark monthly cost for my office before I hand over my street address."
2. **Property manager, periodic floor care** (decision). *Signal: Jani-King's "$0.50 to $2 per square foot", "2 to 3 days for 5,000 sq ft" and "$1 million liability" on "floor stripping and waxing Toronto".* "I want a $/sq ft range, a cycle plan and proof of insurance so I can budget for several lobbies."
3. **Clinic office manager** (consideration → decision). *Signal from the first audit: TitanEdge and Coverall lead with IPAC. Not re-queried this run.* "I want to know the crew is trained to IPAC practice."
4. **Facility manager comparing vendors** (consideration). *Signal: the HomeStars-only North York SERP and the "request quotes from multiple… itemized quote" advice.* "I want reviews and comparable buildings so I can shortlist three contractors."
5. **New this run: office manager wanting a checklist template** (awareness). *Signal: checklist.com, Connecteam and SafetyCulture printable and downloadable templates on "office cleaning checklist".* "I want a printable daily, weekly and monthly checklist that I can hand to a cleaner or staff."

## Persona re-scoring (Relevance / Clarity / Trust / Action, 25 each), weakest first

| Persona | Pages scored | R | C | T | A | Total | First audit | Change |
|---|---|---|---|---|---|---|---|---|
| Small business owner wanting a price | `/office-cleaning-cost-toronto-guide/`, `/services/office-cleaning/`, `/request-a-quote/` | 14 | 15 | 12 | 9 | **50** | 45 | +5 |
| Clinic office manager | `/industries/medical-dental-clinics/` | 22 | 20 | 8 | 14 | **64** | 64 | 0 |
| Property manager, periodic floor care | `/services/floor-stripping-waxing/`, `/industries/property-management/`, `/services/post-construction-cleaning/` | 23 | 20 | 9 | 14 | **66** | 61 | +5 |
| Facility manager comparing vendors | `/`, `/services/commercial-cleaning/`, `/services/office-cleaning/`, `/locations/mississauga/`, `/locations/north-york/` | 22 | 21 | 9 | 15 | **67** | 65 | +2 |
| **Average** | | | | | | **61.75** | 58.75 | +3 |

**Small business owner (50, +5).** Clarity improved: the title and H1 are now "How Office Cleaning Is Priced in Toronto", so the page no longer promises a "2026 Pricing Guide" it cannot deliver. Relevance did not improve. The only numbers are still hypothetical ("The assumed $100–$300 per visit is an arithmetic input, not a statement of what your office should cost"), and the phone-estimate FAQ still says "this guide does not promise a firm phone price". Action did not improve either. `/request-a-quote/` still marks Name, Name of Business, Address, Street address & unit #, City, Province, Postal code, Email and Phone as required (*); the email alternative also asks for "the same details". **To raise it:** publish Evergreen's own monthly ranges by size and frequency (decision D-D), make the street address optional, and add sq ft, visits per week and washroom fields.

**Clinic office manager (64, unchanged).** `/industries/medical-dental-clinics/` still cites the RCDSO standard and PHO Best Practices well. It still says "for years" without a number of clinics, and it has no "What clients say" block (0 reviews). The words "train" or "training" appear 0 times, and there is nothing on colour-coding or a sign-off log. **To raise it:** state what IPAC training crews receive, describe colour-coded cloths and the log the clinic receives, and add a clinic testimonial or an anonymised case ("a 6-operatory dental clinic in North York, nightly since …").

**Property manager (66, +5).** The floor page now has a "A sample year for a lobby floor" section (spring strip and wax after salt season, an autumn recoat, winter entrance scrubbing). Michael Katchen's property-manager review now appears on both `/services/floor-stripping-waxing/` and `/industries/property-management/`. Still missing: no $ on the page (0 "$" characters on the floor, post-construction and office pages), one generic content image ("Bright commercial hall with reflective tile flooring"), no before/after, and no insurance amount (Jani-King's SERP page names "$1 million"). **To raise it:** add a Toronto $/sq ft band for strip and wax vs. scrub and recoat, one before/after pair, and the liability limit.

**Facility manager (67, +2).** The Mississauga page now opens with specific copy (Hurontario, Airport Corporate Centre, Meadowvale). The new North York page names real business areas (Consumers Road, the Yonge and Sheppard towers, clinics near North York General, Sunnybrook and Humber River) and gives "25 to 45 minutes in the evening" travel times. The mobile fold is clean: H1, two CTAs, three trust ticks and the sticky call/quote bar (screenshot). Trust is unchanged: 7 Google reviews, no named account executive, no client names or case studies, and the homepage "Testimonials" (Brenda Carmichael, Allen Robinson "Founder & CEO", Paul Lockheart) are still undated and unsourced. **To raise it:** add reviews and directory profiles, name the account executive, and publish case studies.

## SXO Gap Score: dimension detail (64/100, was 61)

| Dimension | Now | Was | Evidence |
|---|---|---|---|
| Page type | 12/15 | 11 | Post-construction retargeted to commercial. The cost-guide title is honest, but its intent is still unmet. New checklist is a blog guide in a template-led SERP. |
| Content depth | 13/15 | 12 | North York at 1,131 words with specific local detail; checklist at 2,098 words; floor sample-year plan; post-construction "How a post-construction clean is priced" section. Boilerplate blocks remain. |
| UX signals | 13/15 | 12 | Field LCP p75 0.98 s, INP 32 ms, CLS 0.002 (`raw/cwv-field-6d.txt`). The 9-required-field form is unchanged. |
| Schema | 11/15 | 11 | Service, FAQPage and BreadcrumbList on money pages. `"Person"` appears 0 times and `founder` 0 times across all 89 crawled pages. BlogPosting author is still the Organization, including on the checklist published 6 Nov 2026. |
| Media | 4/15 | 4 | Money pages carry 2–3 images, all generic. `/cleaning-demo-gallery/` has 14 images and 227 words. The North York hero is a generic vacuuming shot. |
| Authority | 4/15 | 4 | Still 7 Google reviews on `/reviews/` (Sep 2026, Jan 2026, 2025, May 2021 ×2, Michael Katchen, Oct 2020). Evergreen appears in 0 of the 4 SERPs. 0 published projects. |
| Freshness | 7/10 | 7 | Checklist dated 6 Nov 2026 and cost guide 31 Oct 2026. Most testimonials are 5–6 years old. |

## 1. Status of first-audit findings

| # | First-audit finding (severity) | Status | Evidence now |
|---|---|---|---|
| 1 | Cost guide does not satisfy cost intent (HIGH) | **Partly fixed** | `/office-cleaning-cost-toronto-guide/`: the title and H1 changed to "How Office Cleaning Is Priced in Toronto", which was the honest-retitle fallback. The body still uses only "hypothetical" figures ($100–$300 per visit; a $150 per visit example giving $3,250 per month). There is no Evergreen range and no external benchmark, although HomeStars' $30–60/hr is in this SERP. The intent gap is still HIGH. |
| 2 | Third-party proof missing (HIGH) | **Open** | `/reviews/` still lists the same 7 Google reviews. Evergreen is absent from all 4 SERPs. "office cleaning North York" is 18 of 18 HomeStars results. No review count or newest-review date in the trust row (North York fold shows "Since 1989 / WSIB… / We reply within 2 hours"). |
| 3 | No named people (HIGH) | **Open** | `/about-us/` (592 words) has an "at a glance" list but no names or photos. "Account executive" appears unnamed on every service page. JSON-LD has 0 Person entities. The new checklist byline is "By Evergreen Office Cleaning". |
| 4 | No case studies, no own-work photos (HIGH) | **Open** | No `/projects/` URL in the 89-page crawl. `src/content/projects/warehouse-floor-clean-and-wax.md` is still `status: draft` with `approved: false`. Gallery: 14 images, 227 words. |
| 5 | Persona-relevant reviews not matched to pages (MEDIUM) | **Partly fixed** | Michael Katchen now on `/services/floor-stripping-waxing/` and `/industries/property-management/`. `/services/post-construction-cleaning/` now has a review, but it is Mark Post's general "scheduling our cleaning so quickly" (May 2021), not a construction client. `/industries/medical-dental-clinics/` still has 0. Homepage "Testimonials" (Brenda Carmichael, Allen Robinson, Paul Lockheart) are still undated and unsourced. |
| 6 | Quote form too long for a first price question (MEDIUM) | **Open** | `/request-a-quote/`: all 9 fields still marked "*", including "Street address & unit #". There are no sq ft, visits-per-week or washroom fields, and no "ballpark by email" path. |
| 7 | Post-construction competes for a residential SERP (MEDIUM) | **Partly fixed** | The title is now "Commercial Post-Construction Cleaning Toronto" and the H1 "Commercial Post-Construction Cleaning in Toronto & the GTA". The page now has "How a post-construction clean is priced" and Phase 1/Phase 2 sections. But it gives no $/sq ft band (0 "$" on page), no handover case study and no own photos. |
| 8 | Floor page lacks $/sq ft and visual proof (MEDIUM, best opportunity) | **Partly fixed** | Added "A sample year for a lobby floor" and the Katchen review. Still no $/sq ft, 1 generic content image and no before/after. The Jani-King $0.50–2/sq ft guide still ranks. |
| 9 | Clinic page asserts no IPAC training or documentation (MEDIUM) | **Open** | `/industries/medical-dental-clinics/`: 0 mentions of training, no colour-coding, no log or sign-off. Still "for years". |
| 10 | Generic copy at the top of the Mississauga page (LOW) | **Fixed** | `/locations/mississauga/`: "comprehensive… solutions" and "Flexible Scheduling (Zero Disruption)" are gone. The page now opens with "Mississauga's workplaces run from head offices along Hurontario and the Airport Corporate Centre to the plants and warehouses of Meadowvale". The facility list below is still somewhat templated. |
| 11 | Identical boilerplate on every money page (LOW) | **Open** | The floor page's "What affects the price" still has the same 6 generic bullets ("The size of the space…", "Access, parking and building rules"), and the 5-step "How it works" is still repeated. The same blocks appear on post-construction and clinic. |

Counts: Fixed 1, Partly fixed 4, Open 6, Regressed 0, Not applicable 0.

## 2. New findings

### N1. The new checklist is a blog guide in a template-led SERP (MEDIUM)
- **Evidence:** `/office-cleaning-checklist/` (BlogPosting, 2,098 words, published 6 Nov 2026, by "Evergreen Office Cleaning"). The text says it "can be printed and adapted at a walkthrough", but there is no PDF, print view or download. The "office cleaning checklist" results are dominated by downloadable or printable templates (checklist.com PDF, Connecteam PDF, SafetyCulture, GoAudits, checklist.gg) and large brand blogs (Molly Maid, Homeaglow). The query is global, not Toronto.
- **Recommendation:** Add a one-page printable PDF or print stylesheet with a "Download the checklist" CTA above the fold, and keep the room-by-room tables. Make the commercial hook explicit: "Turn the Checklist Into a Written Scope" already exists, so add a quote CTA next to the download. Expect traffic from long-tail Toronto or commercial variants rather than the head term. Also link it from `/industries/medical-dental-clinics/` and `/services/office-cleaning/`. File: `src/content/blog/office-cleaning-checklist.md`.

### N2. New local pages lead into directory-only SERPs (MEDIUM; reinforces first-audit #2)
- **Evidence:** "office cleaning North York" returned only HomeStars pages (18 of 18). `/locations/north-york/` is a well-written local page, but none of the observed results are vendor pages. The four new location pages carry no location-matched proof. North York shows Edward Sherman (May 2021, location not stated) and Scarborough shows Michael Katchen.
- **Recommendation:** A HomeStars profile with the confirmed NAP is the gate for these SERPs (client action). On-page, show one review or anonymised client per area only where it is true ("a dental clinic near North York General since 20XX"). Route to `/seo local`.

### N3. The cost guide still has 4+ disclaimers that undercut the page (LOW, part of #1)
- **Evidence:** "hypothetical CAD calculations… not Evergreen quotes or verified GTA market averages"; "The amount is hypothetical: it is not an Evergreen price"; "This guide does not establish a verified Toronto rate per square foot"; "this guide does not promise a firm phone price".
- **Recommendation:** If D-D stays unresolved, cite HomeStars' $30–60/hr as an attributed external benchmark. Keep one disclaimer line and cut the rest. File: `src/content/blog/office-cleaning-cost-toronto-guide.md`.

### N4. Blank band above the hero image on the North York mobile fold (INFO, not verified on a device)
- **Evidence:** `screenshots/locations_north-york-mobile-fold.png` shows about 170 px of empty white space between the trust ticks and the hero image. This may be the scroll-in reveal from #81/#82 caught before it animated. Field CLS is 0.002, so it is not a layout-shift problem.
- **Recommendation:** Check that the reveal never applies to above-the-fold content on location pages (cross-check with `findings/visual.md`). If it does, exclude the first section from the reveal.

### N5. Field performance now supports the UX (INFO, positive)
- **Evidence:** `raw/cwv-field-6d.txt`: LCP p75 0.98 s (91.2% good), INP 32 ms and CLS 0.002 sitewide, over 6 days and about 274 visits. The first audit cited a 6.8 s lab mobile LCP.

No regressions from the fixes were observed in the SXO area.

## 3. What still needs the client or an account owner

- Decision D-D: real Evergreen monthly ranges by size and frequency, and a floor-care $/sq ft band (cost guide, floor page, post-construction).
- Decision D-A: whether street address can become optional on the quote form and price-predicting fields can be added.
- The owner's and account executive's names, photos and permission to publish (`/about-us/`, the service-page reply block, Person schema, article bylines).
- Photoshoot (H6) and approval of the existing warehouse floor project photo; consent for 3 case studies (floor, clinic, multi-tenant office).
- Review requests (C5 kit) as a weekly habit; claim or create HomeStars, Clutch and BBB profiles with the confirmed NAP. HomeStars is the whole North York SERP.
- Confirmation of the crews' IPAC training, colour-coding and logs for clinics; the liability insurance limit; a clinic testimonial.
- Dates and sources for the three homepage testimonials, or permission to remove them.

## 4. Not verified

- Google's actual SERP: rank positions, local pack, People Also Ask, AI Overview. The search tool is a non-Google index.
- Whether Evergreen ranks anywhere for the 4 queries (it was absent from all returned results).
- Whether the site photos are stock (no reverse image search).
- The live quote form's server-side validation (only the rendered "*" markers were checked).
- The clinic, office and floor persona pages on mobile (only the North York fold was viewed). Whether the North York blank band (N4) appears on real devices.
- Search Console or GBP impact of the fixes; it is too early, since the changes were deployed today.

Cross-skill: `/seo content` (E-E-A-T, named authors), `/seo local` (GBP, HomeStars and other directories), `/seo schema` (Person and founder). A PDF report is available via `/seo google report`.

### Sources (this run)
- HomeStars Toronto office cleaners: https://www.homestars.com/cleaning/office-cleaner-pros/toronto-toronto
- HomeStars price guide: https://www.homestars.com/cleaning/cleaning-of-dwelling-house-office
- HomeStars North York: https://www.homestars.com/cleaning/office-cleaner-pros/north-york
- Hellamaid commercial cleaning cost Ontario: https://hellamaid.ca/blog/how-much-does-commercial-cleaning-cost-in-ontario
- dev.to cost post: https://dev.to/revenue_search_59822c24c6/what-office-cleaning-should-actually-cost-in-toronto-scarborough-etobicoke-and-north-york-2026-23p6
- Jani-King floor stripping: https://www.janiking.com/commercial-cleaning/specialty-cleaning-services/floor-stripping-waxing-services/
- Jani-King questions to ask: https://blog.janiking.com/blog/stripping-and-waxing-questions-to-ask
- Master Building Services floor care: https://masterbuildingservices.pages.dev/services/floor-care
- checklist.com: https://checklist.com/office-cleaning-checklist
- Connecteam template: https://connecteam.com/templates/office-cleaning-checklist/
- SafetyCulture: https://safetyculture.com/checklists/office-cleaning

Score: 72/100
Previous: 68/100 (first audit)

# Content Quality re-audit: www.evergreencleaningservice.ca (6 Nov 2026, evening)

Scope and method:
- All 200-status HTML pages in raw/crawl/pages.json (89 crawled URLs, including 25 noindex tag archives). Main-content text was taken from `<main>` with nav, aside, script, style and form removed, after undoing the crawler's Latin-1 double-encoding. Text is cached in the scratchpad main.json.
- Merged-post redirects were checked live with curl (5 requests).
- Source was read in /home/user/evergreencleaningservice (read-only), with git history covering 7090f41..HEAD.
- No page was refetched for content: the crawl was taken after all six PRs were deployed.

Sub-scores (this skill's internal model, not Google's):

| Factor (weight) | Before | Now | Why it moved |
|---|---|---|---|
| Experience (20%) | 45 | 46 | Still no first-hand photos, case studies or named staff. The new location pages add local operating detail (routes, drive times, building rules) but no proof of local jobs. |
| Expertise (25%) | 65 | 68 | The new checklist guide is accurate and practical. The dental post now separates clinical IPAC from cleaning. The slips post cites CCOHS. Unsourced statistics are gone. |
| Authoritativeness (25%) | 60 | 60 | No change: no associations, awards, press, client logos or named people. |
| Trustworthiness (30%) | 80 | 82 | The cost guide's title no longer promises prices it won't give. The About facts block states the business plainly. WSIB, insurance and bonding are still asserted, not evidenced. |
| Weighted E-E-A-T | ~64 | ~66 | |
| AI citation readiness | 72 | 76 | About facts block, two definitional service openers, the checklist's definitional opener, and real 301s for merged posts. Ten service and industry pages still open with fragments. |

Readability is approximate, using the same home-made Flesch implementation as the first audit; textstat is not installed. Averages: service pages FRE 53.5 / FK 11.7, location pages 54.5 / 11.6, blog 60.0 / 9.7. Headings and list items without terminal punctuation inflate sentence length, so these are not directly comparable with the first audit's figures. There is no readability problem in the prose itself.

Metadata templating (metadata_template.py, 62 pages, heuristic): `site_risk` low, `templated_ratio` 0.0, `shared_cta_phrases` none. Secondary flags:
- `description-echoes-title` on /services/emergency-cleaning/ (carried over) and on /office-cleaning-cost-toronto-guide/ (new, a side effect of the retitle).
- `brand-suffix-in-description` on 7 pages: our-process, reviews, privacy, contact-us, insights, insights/page/2, insights/page/3.

---

## 1. Status of every finding in the first audit (findings/content.md)

| # | First-audit finding | Status | Evidence now (live crawl, 6 Nov evening) |
|---|---|---|---|
| 1 | No named person anywhere (High) | **Open** | Sitewide search of main text finds 0 occurrences of "Reviewed by", "Written by", "founder", "Founded by" or "owner,". Blog bylines are still "By Evergreen Office Cleaning", and /office-cleaning-checklist/ is too. /about-us/ (517 words) says "an account executive gets back to you" but names nobody. src/lib/schema.ts and src/content.config.ts have no `founder`, `employee` or `reviewedBy`. |
| 2 | WSIB, insurance, bonding and "since 1989" asserted, never evidenced (Medium) | **Open** | The /about-us/ facts block now lists "Coverage: WSIB Ontario, liability insurance and bonding; cleaning staff are background-screened", but there is still no clearance number, insurer, coverage amount, bonding provider or "certificate on request" line. 1989 has no dated artefact. |
| 3 | Experience gap: all imagery stock, gallery thin (High) | **Partly fixed** | /cleaning-demo-gallery/ now has an intro and captions: 162 main words (was 4). It is still all stock, the description still says "Illustrative photographs", and it is still indexable (no meta robots). src/content/projects/warehouse-floor-clean-and-wax.md is still `status: draft`. |
| 4a | Thin /request-a-quote/ | **Partly fixed** | The page now states the next steps: "We reply within 2 hours. A free walkthrough when you are ready, then a written quote. No obligation." These sit inside the form; there is no trust strip. |
| 4b | Thin /contact-us/ | **Open** | Main content is still the address, phone, email and form, with no "what happens next" section. The description was rewritten (NAP + "We reply within 2 hours"). |
| 4c | /green-clean-products/ manufacturer copy | **Open** | 240 main words. "Armstrong Manufacturing have been a leading chemical manufacturer for 46 years" and the manufacturer bullet list are still there. |
| 4d | /insights/page/2/ and /page/3/ indexable and thin | **Open** | Both are 200 with no meta robots: 411 and 155 main words. |
| 5a | Mississauga and Vaughan intros in a generic marketing voice | **Fixed** | "top-tier", "Zero Disruption", "peace of mind", "WSIB Ontario Registered", "exceptional" and "critical" are absent from both pages. The intros now open with local facts ("head offices along Hurontario and the Airport Corporate Centre to the plants and warehouses of Meadowvale"; "the office towers of the Vaughan Metropolitan Centre, the showrooms along Highway 7"). The service-list bullets are still terse fragments (e.g. "Heavy-duty floor scrubbing… major freight and manufacturing hubs"). |
| 5b | Fixed template outline and identical opening sentence on location pages | **Open (and wider)** | The pages have grown from 7 to 11. 9 of 11 still use the identical H2 skeleton (What we clean in X / Facility types served / Office cleaning in X / Working in X / The buildings, and what they need / Getting there and scheduling / Where we work from / Get a quote / Services / What a client says / FAQ). The same 9 still open "Evergreen Office Cleaning provides commercial and office cleaning in X as part of its coverage across the Greater Toronto Area, which it has served since 1989." "See office cleaning for the full scope." appears on 7 pages. |
| 5c | Old testimonials on location pages | **Partly fixed** | Some pages now carry newer reviews: Etobicoke has Christopher Perera, "around September 2026"; Vaughan and Richmond Hill have Andy Handy, "around January 2026". But Edward Sherman (May 2021) is reused on 3 pages (toronto-downtown, north-york, durham-region) and Michael Katchen (May 2021) on 2 (mississauga, scarborough). The Andy Handy review is a one-liner ("Excellent service at a very good price."). None is shown as a client in that city. |
| 6 | Service pages carry 18–44% shared boilerplate; building-maintenance overlaps floor-stripping-waxing (Low) | **Open** | `git log 7090f41..HEAD -- src/pages/services/ src/data/services.ts` shows only the hover/reveal commit (468e638), so the "How it works" block and the area list are unchanged in structure. Not re-measured. |
| 7a | Footer anchor "Toronto" sent to downtown and "Toronto & GTA" sent to commercial cleaning | **Fixed** | `footerAreas` in src/data/site.ts and the crawl both changed. /locations/toronto-downtown/ receives "Downtown Toronto" ×201 and no bare "Toronto" footer anchor. "Toronto & GTA" is gone: /services/commercial-cleaning/ now gets "Commercial Cleaning" ×180 (nav) and "Commercial cleaning & janitorial" ×57. |
| 7b | Footer labelled /locations/ as "Richmond Hill" and "Scarborough" | **Fixed** | Both anchors now go to their own new pages: "Richmond Hill" goes to /locations/richmond-hill/ and "Scarborough" to /locations/scarborough/ (each from 89 pages). /locations/ is now "All service areas" ×178. |
| 7c | Homepage and /services/commercial-cleaning/ both target "commercial cleaning Toronto" | **Partly fixed** | The commercial title is now "Commercial Cleaning & Janitorial in Toronto \| Evergreen" (55 characters, was 64). It still carries "Toronto", and the H1 is still "…Services in Toronto and the GTA". The homepage title is still "Commercial Cleaning Company in Toronto Since 1989 \| Evergreen". The overlap remains; the footer amplifier is gone. |
| 8a | Commercial title 64 characters; 8 descriptions 161–170 characters | **Fixed** | All 8 named descriptions (daycares, air quality, decide-on-company, hand-washing (merged away), reviews, robotic, seasonal, pressure-washing) are now 160 characters or fewer, and the commercial title is 55. New over-length items are covered in N5. |
| 8b | Legacy hook descriptions ("Do your floors sparkle?", "Here we discuss…", contact) | **Fixed** | The retitled posts have answer-first descriptions of 145–153 characters (e.g. floor: "How to keep a commercial floor clean between strip-and-wax visits: more bins, dirt-trapping mats…"). The plants post is gone. The contact description is now NAP plus the reply time. |
| 8c | Gallery description 91 characters, "Illustrative photographs" | **Open** | Unchanged: 91 characters. |
| 9a | Homepage label headings ("We are accepting new cleaning clients.", "Service Locations:") | **Fixed** | Homepage H3s are now content headings: "Flexible scheduling", "A dedicated account executive", "Free on-site walkthrough", "Toronto", "Peel & Halton". |
| 9b | Cost guide repeats its H1 as an H2 | **Fixed** | The H2s are now "In this guide", "Why There Is No Single Office Cleaning Price", and so on. The H1 is not repeated. |
| 9c | Footer emits 5 H2s on every page; /services/commercial-cleaning/ has 28 H2s | **Open** | "Evergreen Office Cleaning / Services / Reviews / Service Areas / Follow us on Social Media" are still H2s on every page (src/components/Footer.astro). The commercial page still has 28 H2s. |
| 10a | Cost guide title promises a "2026 Pricing Guide" it does not deliver | **Fixed** | The title and H1 are now "How Office Cleaning Is Priced in Toronto". The opener says "Office cleaning costs depend on the work your building needs…". The page no longer promises prices. |
| 10b | Cost guide gives no real price | **Open** | The only figures are still hypothetical: "The assumed $100–$300 per visit is an arithmetic input", a monthly table built from it ($433–$1,299 once weekly … $2,167–$6,501 five times weekly), and a "$150 per visit… hypothetical" worked example. There are 7 hedging phrases. Severity drops from High to Medium now that the title is honest. Real ranges still need the client. |
| 11a | Floor post: "top three tips" for 5 items and "Microfiber rubs" | **Fixed** | Neither string appears on /5-easy-ways-to-keep-your-commercial-floor-clean/. Retitled "Commercial Floor Care: Daily Maintenance Between Strip-and-Wax Visits". |
| 11b | Unsourced statistics (plants, deep cleaning, slips) | **Fixed** | Sitewide search for "studies show / according to / a report from / NN%" finds only:<br>- /preventing-slips-trips-falls-in-your-workplace/: "The Canadian Centre for Occupational Health and Safety reports that about two-thirds (67%) of falls happen on the same level… (CCOHS, Prevention of Slips, Trips and Falls)", with a link.<br>- The cost guide's 13% HST figure.<br>"Studies show" is gone from the deep-cleaning post. The plants post and its figures are gone (merged). |
| 11c | Off-core posts (plants, home office, fridge) | **Partly fixed** | Plants was merged into /commercial-cleaning-air-quality/ as "Plants and Air Quality" with no productivity claims. The 301 is live: /how-to-take-care-of-plants-in-the-office/ (with and without the trailing slash, and /blog/…) and /tag/plants/ all 301 in one hop to /commercial-cleaning-air-quality/. /keep-your-office-at-home-clean/ and /how-to-keep-your-office-fridge-clean/ are still indexed and unchanged. |
| 11d | Hand-washing overlapped germ hotspots | **Fixed** | /importance-of-hand-washing/ 301s to /areas-in-your-office-where-germs-are-likely-hiding/ (live), now titled "Office Germ Hotspots and Hand Hygiene: What to Clean and How Often". The visible "Updated November 6, 2026" matches BlogPosting dateModified 2026-11-06. The older hand-sanitizer redirect was repointed so it stays one hop (src/data/redirects.ts line 255). |
| 11e | Seven retitles | **Fixed** | All seven are live with new title, H1 and description:<br>- Office Cleaning Supplies List<br>- Commercial Floor Care<br>- Retail Store Cleaning Checklist<br>- Commercial Deep Cleaning: What's Included and When You Need One<br>- Dental Office Cleaning Checklist for Ontario Clinics<br>- Daycare and School Cleaning Checklist<br>- Robotic Floor Scrubbers vs Manual Cleaning<br>URLs are kept, and the `seoTitle` tags are 49–60 characters. |
| 11f | 15 legacy posts with no update; few posts reach 1,500 words; no cadence | **Partly fixed** | There are now 24 posts. Three guides are 1,500+ words (checklist 2,040, cost 2,002, how-often 1,955), and four new guides were published 30 Oct – 6 Nov. Ten posts are still under 700 words. 15 legacy posts still show only their 2020–2023 publish date. That includes five retitled ones (supplies, floor, retail, deep cleaning, dental) whose dateModified stays at 2020–2022. Leaving the date alone is honest for light edits, but it gives no freshness signal. |
| 12a | Service pages open with marketing fragments, not definitions | **Partly fixed** | /services/office-cleaning/ ("Office cleaning is the recurring cleaning of a workplace's desks, floors, washrooms, kitchens and shared areas, done after staff leave. Evergreen Office Cleaning has provided it…") and /services/commercial-cleaning/ ("Commercial cleaning is the cleaning of business premises, and janitorial services are the scheduled part of it…") now open with definitions. Eight service pages and both industry pages still open with fragments, e.g. disinfection: "Surfaces cleaned first, then the points everyone touches disinfected —…"; graffiti: "Graffiti removed from commercial property with a method chosen for the surface…". |
| 12b | "At a glance" lists are tables of contents, not facts | **Open** (mostly) | E.g. /5-cleaning-products-you-should-have-in-your-office/ still has "At a glance: Glass Cleaner Disinfecting Wipes Spot Remover White…". |
| 12c | Few hard company facts to cite | **Partly fixed** | /about-us/ now has an "Evergreen Office Cleaning at a glance" block (Founded 1989; formerly Evergreen Cleaning Service; one office at 243 Queen St W; commercial only; hours; coverage; products; service area; 2-hour reply). It is good for entity clarity, but it contains no quantified facts: no contracts, staff, buildings, square footage or longest client tenure. |
| 13 | Unverifiable homepage testimonials (Carmichael, Robinson, Lockheart) | **Open** | All three names are still in the homepage main content (src/components/home/Testimonials.astro), undated and unsourced. |

Tally (32 rows, sub-rows such as 5a/5b/5c counted separately): Fixed 12, Partly fixed 8, Open 12, Regressed 0, Not applicable 0.

---

## 2. New findings

### N1. Four new location pages: real local value, not doorways, but the same skeleton and no local proof
**Severity: Medium**

The four new pages are North York (1,017 main words), Scarborough (970), Richmond Hill (886) and Durham Region (893).

**For (unique value):**
- Each names real business areas and corridors:
  - North York: Yonge from Sheppard to Finch, Consumers Rd and Victoria Park, Don Mills/Lesmill, Downsview, Dufferin/Keele.
  - Scarborough: Scarborough Centre/Consilium Place, Progress Ave, Milliken, Golden Mile.
  - Richmond Hill: Beaver Creek, Headford, Richmond Hill Centre, Newkirk/Elgin Mills, Oak Ridges.
  - Durham: Brock Rd, Salem Rd/Harwood Ave, Westney Rd, Stevenson Rd/Taunton Rd.
- Each has building-type sections with operational detail, not adjectives. For example, the security desk, dock and freight elevator at Scarborough Centre, or the "server room is not" ours line on Beaver Creek tech offices.
- Each gives route and drive times (Pickering about 35 km, Ajax about 45 km, Oshawa about 60 km; "45 to 70 minutes in the evening").
- FAQs are city-specific ("Is Whitby covered?" answered plainly).
- Each is honest about the office ("We do not have an office in Richmond Hill: crews travel from our Toronto base").
- Body duplication is low:
  - pairwise 5-word-shingle Jaccard across all 11 location pages is 0.06–0.17;
  - verbatim shared sentences are 2–10% of each page;
  - after normalising city names the figure is 17–22% for the new pages, against 14–26% for the older ones.
- Footer links are exact-match ("North York", "Scarborough", "Richmond Hill", "Pickering, Ajax & Oshawa") and come from all 89 pages.

**Against (QRG "repetitive structure" and missing Experience):**
- The identical H2 outline and opening sentence now repeat on 9 of 11 pages (see 5b).
- The reviews are recycled: North York and Durham show the same May 2021 Edward Sherman review that also sits on Downtown; Scarborough reuses Michael Katchen (Mississauga).
- No page shows a client, building, photo or job in that city. All the local knowledge is descriptive.
- The pages read as competent area research, not as proof of work there.

**Verdict:** not doorway pages, because each has substantive, distinct and honest content. The scaled-template risk is now larger, though: 11 pages share one skeleton.

**Recommendation:**
- In src/data/locations.ts and src/data/location-local.ts, give each page a distinct first sentence that leads with its strongest local fact, and drop the shared "as part of its coverage… since 1989" opener.
- Vary 2–3 H2s per city.
- Replace reused reviews with a city-matched one, or show none.
- Add one local proof point per page when the client can supply it: "We have cleaned a 12,000 sq ft office at Consumers Rd since 2019" beats any amount of corridor detail.
- Do not add more location pages until at least the existing 11 have one such fact each.

### N2. The new /office-cleaning-checklist/ guide is the strongest content on the site, but it has no named author and its "printable" claim isn't backed by a printable version
**Severity: Low**

Positives:
- 2,040 main words. It opens with a quotable definition: "An office cleaning checklist lists every task a workplace needs, sorted by how often it needs doing and by room, so nothing depends on someone remembering it."
- Clear sections: daily, weekly, monthly and periodic tasks, room by room, and "Who Does What".
- No unsourced claims.
- Near-zero overlap with /how-often-should-an-office-be-cleaned/ (5-gram Jaccard 0.003), /seasonal-office-cleaning-checklist/ (0.002) and /services/office-cleaning/ (0.006).

Gaps:
- The description says "A printable office cleaning checklist" and the body says "Print it, walk the office with it". I found no print stylesheet link, PDF or download in the crawled main content. Not verified whether a print CSS exists.
- The byline is "By Evergreen Office Cleaning" (see Finding 1).
- The title "Office Cleaning Checklist: Daily, Weekly & Monthly | Evergreen" is 62 characters.

Recommendation:
- Add a downloadable PDF, or at least a print button and print CSS, in the guide layout. Otherwise drop "printable" from the description in src/content/blog/office-cleaning-checklist.md.
- Trim the `seoTitle` to 60 characters or fewer, e.g. drop " | Evergreen".
- Add a named reviewer once Finding 1 is resolved.

### N3. Guide cluster intent: checklist vs how-often vs seasonal
**Severity: Info**

These three guides target adjacent queries ("office cleaning checklist", "how often should an office be cleaned", "seasonal office cleaning checklist"). Their bodies barely overlap (see N2), and each links the others. Low cannibalisation risk on content. Watch Search Console: if /office-cleaning-checklist/ and /how-often-should-an-office-be-cleaned/ both show for "daily weekly monthly office cleaning", sharpen the how-often title toward frequency by building type.

### N4. "East York" and "York" anchors point to the Downtown Toronto page
**Severity: Low**

/locations/toronto-downtown/ receives "East York" ×24 and "York" ×24 as anchors. This is the service-area line on 24 pages, fed by `serviceAreas` in src/data/site.ts (around line 303). Neither district is downtown, and this sends mixed relevance to the one page now cleanly targeting "downtown Toronto". It is a leftover of the footer-anchor fix.

Recommendation: link East York and York to /locations/ (or leave them unlinked) until they have content.

### N5. Over-length descriptions and titles introduced with the new pages
**Severity: Low**

**Descriptions over 160 characters:**
- /locations/ 185
- /locations/scarborough/ 167
- /services/post-construction-cleaning/ 165
- /locations/richmond-hill/ 163
- /locations/north-york/ 161
- /locations/durham-region/ 161

**Titles over 60 characters:**
- /locations/durham-region/ "Office & Commercial Cleaning in Pickering, Ajax & Oshawa | Evergreen" 68
- /office-cleaning-checklist/ 62
- homepage, Vaughan and the "6 Common Cleaning Products…" post 61 each

The cost guide description now echoes its title ("How office cleaning is priced in Toronto: what sets the rate…"), a secondary `description-echoes-title` flag created by the retitle.

Recommendation: trim these in src/data/locations.ts and the relevant front matter. For the cost guide, lead the description with the answer (e.g. "Toronto office cleaning is priced per visit from area, frequency and scope. Build a monthly budget, read a quote and compare like for like.").

### N6. Retitled legacy posts kept their bodies' old voice and length
**Severity: Low**

Retitles like "Dental Office Cleaning Checklist for Ontario Clinics" and "Retail Store Cleaning Checklist" now promise checklists. The bodies are still the 2020–2022 posts (1,019 and 558 words), and they open with generic preambles, for example:
- dental: "Successful dental offices must look presentable and professional…"
- retail: "It takes a lot of work to run a retail storefront…"

The new titles raise expectations the openers don't meet.

Recommendation: in src/content/blog/a-cleaning-checklist-for-your-retail-store.md and cleaning-check-list-dental-clinics.md, replace the preamble with a one-sentence definition and the checklist itself. Then set `updatedDate`, because that is a substantive change.

---

## 3. What still needs the client or an account owner

1. A named owner or principal (name, role, start year) and the account executive(s), with real photos. These are needed for About, a reviewer line on the guides, and the `founder`/`employee` Person in schema (Finding 1).
2. Evidence for WSIB (clearance statement or number), liability insurer and amount, bonding provider, and the screening method (Finding 2).
3. A dated artefact for "since 1989", such as an Ontario business registration year, an early photo or the first client.
4. Real job photos and 2–3 case-study facts to publish src/content/projects. The warehouse project is still a draft (Finding 3).
5. Real price bands for the cost guide: per visit or per sq ft by office size and frequency, the minimum visit charge, and the deep-clean premium (Finding 10b). Otherwise accept that the page answers "how is it priced", not "how much".
6. One city-matched client or job fact per location page, and permission to show the client's city on reviews (N1, 5c).
7. Company facts to quantify the About block: active contracts, staff, buildings or sq ft, longest-standing client (12c).
8. Permission, company names and dates for the three homepage testimonials, or a decision to remove them (Finding 13).
9. A decision on the gallery: real photos, or noindex until they exist.
10. Ongoing review requests. The newest reviews are one-liners, and 2021 reviews carry four location pages.
11. Search Console access, to check real query overlap between the homepage, /services/commercial-cleaning/ and /locations/toronto-downtown/ after the footer change.

## 4. Not verified

- Whether WSIB coverage, bonding, insurance or the 1989 founding are true. No external registry was checked.
- The accuracy of the drive distances and times on the new location pages (they are plausible from a map reading, not measured), and whether Evergreen actually serves clients in each named corridor.
- Whether the new location pages and the checklist are indexed or ranking. No Search Console data.
- Whether a print stylesheet exists for the checklist (only main-content HTML was inspected).
- Whether the merged posts had external backlinks worth checking beyond the 301s, and real traffic on the 15 untouched legacy posts. No GA4 or backlink data.
- Full-text reading of every legacy post. I read the four new location pages in full, the openings and statistic contexts of all posts, and the cost and checklist guides by section and pattern. The rest was checked by pattern search.
- The service-page boilerplate percentages (Finding 6) were not re-measured; the status is based on git showing no structural change.
- Readability figures are approximate (home-made Flesch implementation, textstat not installed).
- The /lp/* PPC pages and the noindex tag archives were out of scope for quality scoring.

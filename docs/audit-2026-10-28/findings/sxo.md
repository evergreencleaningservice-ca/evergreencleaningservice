# SXO (Search Experience) findings: evergreencleaningservice.ca

Date: 2026-10-28. Analyst: SXO subagent. This is the **SXO Gap Score**. It is separate from the SEO Health Score.

## 0. Method and limitations (read first)

- **Pages:** fetched live with `curl -sL` because the plugin scripts refuse the local proxy. Raw HTML is in `raw/sxo/` (`eg-*.html` for Evergreen, `jp-*.html` for JAN-PRO, and `comp/*.html` for 25 ranking competitor pages). Mobile above-the-fold was checked against the existing Playwright screenshots in `screenshots/`. Mobile lab LCP on the homepage was 936 ms with CLS 0.017 (`raw/technical/pw/pw.json`).
- **SERPs:** all 10 queries were run with the WebSearch tool, which returned about 9 organic URLs per query. **These results are not geo-personalised to Toronto and may not match google.ca.** Direct SERP capture failed: Google returned 429 to the `/sorry` page, Bing served a bot wall with irrelevant results, and DuckDuckGo returned 202.
- **Not observed for any query:** ads count, local pack, AI Overview, featured snippets and People Also Ask. **No PAA question was seen, so none is quoted verbatim.** Local-pack presence is *inferred* from query type ("near me", "[service] [city]"), not observed. Re-capture these from a Toronto IP or with a SERP API before relying on them.
- **Not available:** rank positions, GSC data, live GBP rating or count, and mobile screenshots of /locations/mississauga/ and the JAN-PRO pages.
- **Unverified third-party data:** the d7leadfinder directory lists "Evergreen Cleaning Service" at **5.0 stars from 7 Google reviews** and position about **27** for "Commercial Cleaning Service Toronto".

## 1. SERP tables per query (organic, WebSearch, not geo-personalised)

Page types: H = company homepage, S = service page, C = city/location page, SC = service+city page, V = industry/vertical page, D = directory, A = aggregator/lead marketplace, Art = article/listicle, Soc = social/profile.

### Q1 "office cleaning toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | yelp.ca | https://www.yelp.ca/search?cflt=officecleaning&find_loc=Toronto%2C+ON | D |
| 2 | impact.ca | https://impact.ca/ontario/toronto/office-cleaning | SC (national firm, "53+ 5-Star Google Reviews", CIMS-GB, since 1954) |
| 3 | bark.com | https://www.bark.com/en/ca/commercial-cleaning/ontario/toronto/ | A |
| 4 | mcagroup.ca | https://mcagroup.ca/ | H (140 Google reviews widget) |
| 5 | wecleanit.ca | https://www.wecleanit.ca/ | H ("fixed monthly rates") |
| 6 | dusttildawn.ca | https://dusttildawn.ca/ | H (83 Google reviews, AggregateRating schema) |
| 7 | smcleantoronto.ca | https://smcleantoronto.ca/ | H ("plans from $250 per month") |
| 8 | arellicleaning.com | https://www.arellicleaning.com/blog/office-cleaning-companies-toronto | Art (Top-7 listicle with $225–$250/month figures) |
| 9 | torontoofficecleaningservices.com | https://torontoofficecleaningservices.com/ | H (exact-match domain) |

Features: not observable. Local pack is very likely. Dominant type: **Toronto-only company homepages (5/9)**, plus directory, aggregator and listicle (3/9). Intent: commercial-local, with a comparison layer.

### Q2 "commercial cleaning toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | wecleanit.ca | https://www.wecleanit.ca/ | H |
| 2 | newcanadiancleaning.ca | https://newcanadiancleaning.ca/ | H |
| 3 | everestcleaning.ca | https://everestcleaning.ca/toronto/ | C (CIMS) |
| 4 | greatcommercialcleaners.com | https://greatcommercialcleaners.com/ | H |
| 5 | securecleaningservices.ca | https://securecleaningservices.ca/ | H |
| 6 | smcleantoronto.ca | https://smcleantoronto.ca/ | H |
| 7 | generationscleaning.ca | https://www.generationscleaning.ca/ | H |
| 8 | torontocommercialclean.com | https://torontocommercialclean.com/ | H (exact-match domain, "50% off first month") |
| 9 | focuscleaning.ca | https://focuscleaning.ca/ | H |

Dominant type: **homepages (8/9)**. Intent: commercial-local.

### Q3 "commercial cleaning services toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | mcagroup.ca | https://mcagroup.ca/ | H |
| 2 | wecleanit.ca | https://www.wecleanit.ca/ | H |
| 3 | rbcclean.com | https://www.rbcclean.com/services/commercial-cleaning-services-toronto/ | SC |
| 4 | everestcleaning.ca | https://everestcleaning.ca/toronto/ | C |
| 5 | securecleaningservices.ca | https://securecleaningservices.ca/ | H |
| 6 | greatcommercialcleaners.com | https://greatcommercialcleaners.com/ | H |
| 7 | toronto-commercial-cleaning.com | https://toronto-commercial-cleaning.com/ | H (exact-match domain) |
| 8 | focuscleaning.ca | https://focuscleaning.ca/ | H |
| 9 | gdi.com | https://gdi.com/locations/toronto/ | C (national brand) |

Dominant type: homepages (6/9), with service+city or city pages (3/9). Intent: commercial-local.

### Q4 "janitorial services toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | yelp.ca | https://www.yelp.ca/search?find_desc=Janitorial+Services&find_loc=Toronto%2C+ON | D |
| 2 | janitor.ca | https://www.janitor.ca/ | H (Decca, AggregateRating, BBB A+) |
| 3 | smcleantoronto.ca | https://smcleantoronto.ca/services/janitorial | S |
| 4 | smcleantoronto.ca | https://smcleantoronto.ca/ | H |
| 5 | admiraljanitorial.ca | https://admiraljanitorial.ca/ | H ($5M liability) |
| 6 | aceclean.ca | https://www.aceclean.ca/ | H |
| 7 | cleannitjs.com | https://cleannitjs.com/ | H |
| 8 | focuscleaning.ca | https://focuscleaning.ca/ | H |
| 9 | gdi.com | https://gdi.com/locations/toronto/ | C |

Dominant type: homepages of janitorial-branded firms and janitorial service pages. Intent: commercial-local.

### Q5 "office cleaning company near me toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | yelp.ca | https://www.yelp.ca/search?cflt=officecleaning&find_loc=Toronto%2C+ON | D |
| 2 | mcagroup.ca | https://mcagroup.ca/ | H |
| 3 | impact.ca | https://impact.ca/ontario/toronto/office-cleaning | SC |
| 4 | nowitsclean.ca | https://nowitsclean.ca/services/office-cleaning-downtown-toronto/ | SC (neighbourhood) |
| 5 | wecleanit.ca | https://www.wecleanit.ca/ | H |
| 6 | dusttildawn.ca | https://dusttildawn.ca/ | H |
| 7 | newcanadiancleaning.ca | https://newcanadiancleaning.ca/ | H |
| 8 | smcleantoronto.ca | https://smcleantoronto.ca/ | H |
| 9 | aceclean.ca | https://www.aceclean.ca/ | H |

Intent: **local pack and GBP driven** (inferred from "near me"). The organic results mirror Q1, and Yelp showed a sponsored listing, according to the search summary.

### Q6 "post construction cleaning toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | cleany.ca | https://cleany.ca/locations/toronto/post-renovation-and-post-construction-cleaning-services/ | SC |
| 2 | mcagroup.ca | https://mcagroup.ca/post-construction-cleaning/ | S (3,160 words, FAQ, PriceSpecification) |
| 3 | torontohomecleaners.ca | https://torontohomecleaners.ca/post-construction/ | S (residential) |
| 4 | tidyuphandycrew.ca | https://tidyuphandycrew.ca/post-construction-cleaning-services-toronto/ | SC (rough, progress and final phases) |
| 5 | 360demo.ca | https://360demo.ca/post-construction-cleaning-services-in-toronto/ | SC |
| 6 | cleanpapi.ca | https://cleanpapi.ca/services/post-construction-cleaning | S ("from CAD $400", same/next day) |
| 7 | tidyuphandycrew.ca | https://tidyuphandycrew.ca/post-renovation-construction-cleaning-services-toronto/ | SC |
| 8 | squeakycleaning.ca | https://www.squeakycleaning.ca/post-construction-cleaning | S |
| 9 | focuscleaning.ca | https://focuscleaning.ca/construction-clean-up/ | S |

Dominant type: **dedicated service or service+city pages (9/9)**. Intent: transactional, mixing residential renovation with commercial work. Price anchors and phased scopes are common.

### Q7 "dental office cleaning toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | mycleaningbees.ca | https://mycleaningbees.ca/dental-office-cleaning-services-in-toronto/ | V/SC (dental-only) |
| 2 | dusttildawn.ca | https://dusttildawn.ca/dental-office-cleaning-toronto/ | V/SC (dental-only) |
| 3 | orcharddentalcare.ca | https://www.orcharddentalcare.ca/dental-cleaning-toronto/ | Off-intent (patient teeth cleaning) |
| 4 | pro-clean.ca | https://www.pro-clean.ca/medical-facility-cleaning-service/ | V (medical and dental) |
| 5 | procitymaids.ca | https://procitymaids.ca/medical-office-cleaning-toronto | V/SC (operatory turnover, RCDSO-aligned) |
| 6 | lowfaremaintenance.ca | https://www.lowfaremaintenance.ca/dental-office-cleaning-companies | Art (listicle) |
| 7 | torontodentalofficecleaningservices.com | https://torontodentalofficecleaningservices.com/dental-office-cleaning-downtown-toronto/ | SC (exact-match domain) |
| 8 | torontodentalofficecleaningservices.com | https://torontodentalofficecleaningservices.com/ | H (exact-match domain) |
| 9 | servicespro.ca | https://www.servicespro.ca/services/dental-office | V |

Dominant type: **dental-specific vertical pages (6/9)**. Intent: commercial, plus a patient-intent split.

### Q8 "commercial cleaning mississauga"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | vanguardcleaning.ca | https://www.vanguardcleaning.ca/cleaning/toronto-ontario/ | C (franchise territory) |
| 2 | mwaccommercialsanitation.ca | https://mwaccommercialsanitation.ca/areas-of-service/mississauga-commercial-cleaning-services/ | C |
| 3 | lowfaremaintenance.ca | https://www.lowfaremaintenance.ca/locations/mississauga | C |
| 4 | gocleanplus.ca | https://www.gocleanplus.ca/mississauga/commercial-cleaning-services | SC |
| 5 | procitymaids.ca | https://procitymaids.ca/blog/commercial-cleaning-mississauga-city-centre-pearson-logistics | Art |
| 6 | grandmotherstouch.com | https://grandmotherstouch.com/ | H (Mississauga-based since 1999, WSIB, 250+ staff) |
| 7 | mississaugacommercialcleaning.ca | https://www.mississaugacommercialcleaning.ca/commercial-cleaning.html | S (exact-match domain) |
| 8 | anagosouthgta.ca | https://anagosouthgta.ca/areas-we-serve/commercial-cleaning-mississauga/ | C (franchise, 2,779 words, LocalBusiness+FAQ schema) |
| 9 | bestwayclean.ca | https://www.bestwayclean.ca/ | H |

Dominant type: **city pages (5/9)**, plus homepages of locally based firms (3/9). Two franchises rank (Vanguard, Anago), which shows the franchise model wins locally. JAN-PRO Toronto West has its office in Mississauga (2295 Dunwin Dr).

### Q9 "cleaning company for property management toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | homestars.com | https://www.homestars.com/cleaning/cleaning-company-pros/toronto | D |
| 2 | nowitsclean.ca | https://nowitsclean.ca/ | H (cites Greenwin as a client) |
| 3 | bark.com | https://www.bark.com/en/ca/cleaners/ontario/toronto/ | A |
| 4 | nowitsclean.ca | https://nowitsclean.ca/services/real-estate-cleaning-toronto/ | S (turnovers) |
| 5 | applewoodgroup.com | https://applewoodgroup.com/property-management-cleaning/ | V (454 words) |
| 6 | thecleaningartists.ca | https://www.thecleaningartists.ca/propertymanagementcleaning | V |
| 7 | newcanadiancleaning.ca | https://newcanadiancleaning.ca/ | H |
| 8 | maid4condos.com | https://www.maid4condos.com/ | H (condo) |
| 9 | servicespro.ca | https://www.servicespro.ca/services/property-management | V |

Intent is mixed: commercial common-area janitorial work alongside residential turnover and condo cleaning. Directories and aggregators hold 2 slots and vertical pages hold 3. The vertical pages are thin (454–573 words), so this is a **winnable SERP**.

### Q10 "jan-pro toronto"
| # | Domain | URL | Type |
|---|---|---|---|
| 1 | instagram.com | https://www.instagram.com/janpro_toronto/ | Soc |
| 2 | facebook.com | https://www.facebook.com/janprotoronto/ | Soc |
| 3 | nicejob.com | https://nicejob.com/jan-pro-central-ontario | Review profile (4.7 from 490, unverified) |
| 4 | bbb.org | https://www.bbb.org/ca/on/mississauga/profile/commercial-cleaning-services/jan-pro-cleaning-systems-of-toronto-0107-1136462 | D (A+, not accredited) |
| 5 | jan-pro.ca | https://jan-pro.ca/en/office/toronto-west/ | C (Mississauga office, 4.8★ quality rating, 700+ Toronto clients) |
| 6 | jan-pro.ca | https://jan-pro.ca/en/office/toronto-east/ | C (Scarborough office) |
| 7 | jan-pro.ca | https://jan-pro.ca/en/national-coverage/ | C hub |
| 8 | officialreviews.ca | https://www.officialreviews.ca/reviews/jan-pro-toronto-cleaning-services-review | Review |

Intent: **navigational**. Evergreen cannot and should not try to rank here.

### People Also Ask
**No PAA box was observable for any query (see section 0).** A question-intent probe, "how much does office cleaning cost per square foot in Toronto", returned HomeStars price guides, hellamaid.ca, ISSA and Airtasker. Those pages give **$0.10–$0.25/sq ft/month** and **$30–$60/hr** (HomeStars, 2026). Evergreen has no page that competes for this cost question.

## 2. Page-type match matrix

| Query | SERP dominant type | Evergreen page | Evergreen type | Match | Severity |
|---|---|---|---|---|---|
| office cleaning toronto | Toronto homepages and SC pages, plus directories | /services/office-cleaning/ (the homepage H1 also targets it) | S (Toronto+GTA) | Type aligned. Home and service page split the intent | MEDIUM |
| commercial cleaning toronto | Homepages (8/9) | / , /services/ (title "Commercial Cleaning Services in Toronto"), /services/commercial-cleaning/, /locations/toronto-downtown/ | H / hub / S / C | Four pages compete, and the /services/ hub title duplicates the service page | MEDIUM-HIGH (cannibalisation) |
| commercial cleaning services toronto | Homepages plus SC | Same as above | | Same as above | MEDIUM-HIGH |
| janitorial services toronto | Janitorial homepages and janitorial service pages | **missing**. The homepage "Janitorial Services" card links to /services/office-cleaning/ | none | No matching page | HIGH |
| office cleaning company near me toronto | Local pack (inferred) plus directories | Homepage / GBP | H | The page cannot fix this. GBP proximity (243 Queen St W) and review count decide it | HIGH (off-page) |
| post construction cleaning toronto | Dedicated SC and S pages with prices | /services/post-construction-cleaning/ (909 words, H1 "Post-Construction Cleaning for Commercial Buildouts", no "Toronto" in the H1) | S | Type aligned. Weak locality and no price anchor | MEDIUM |
| dental office cleaning toronto | Dental-only vertical pages | /industries/medical-dental-clinics/ (combined), blog /cleaning-check-list-dental-clinics/ | V (combined) | A combined medical and dental page against dental-only pages | MEDIUM-HIGH |
| commercial cleaning mississauga | City pages, many with a local address | /locations/mississauga/ | C | Type aligned. The page states "We do not have an office in Mississauga" (honest). No BreadcrumbList schema, and the H1 renders above the breadcrumb | MEDIUM |
| cleaning co. for property management toronto | Directories plus thin vertical pages | /industries/property-management/ (1,179 words) | V | Aligned. This is the best opportunity | ALIGNED / LOW |
| jan-pro toronto | Navigational (brand) | n/a | n/a | Do not target organically | n/a |

**Primary finding:** the page types mostly *match*. The ranking gap is not mainly page type. It comes from **(a) splitting Toronto head-term intent across 4 pages, (b) missing janitorial and dental-specific pages, and (c) authority and local-pack signals** (section 6).

## 3. User stories (each tied to a SERP signal)

1. **Office manager, 20–100 staff (Consideration):** I want a reliable after-hours cleaner at a predictable monthly cost, because the last one missed nights. But I can't compare without a price range. *(Signals: Arelli listicle with $225–$250/month figures; ServiceMaster "from $250 per month"; We Clean It "fixed monthly rates"; HomeStars $0.10–0.25/sq ft.)*
2. **Office manager (Decision):** I want to know who holds our keys and alarm code, because cleaners work unsupervised at night. But I'm blocked by a trust gap. *(Signals: insurance, WSIB, "$5M liability", bonded and background-checked claims on Admiral, Secure, JAN-PRO Toronto West and RBC.)*
3. **Property or facility manager, several buildings (Consideration):** I want one contractor who covers all my sites across the GTA with inspections, because juggling vendors costs time. But I need proof they handle portfolios. *(Signals: Impact "towers, plazas and portfolios", "35 million sq ft"; JAN-PRO TRACKER inspections, "700+ Toronto clients"; Now It's Clean citing Greenwin; GDI's integrated facility services.)*
4. **Clinic owner or practice manager (Decision):** I want cleaners who understand operatories and infection control, because patients and inspectors judge the clinic. But generic office cleaners don't show dental-specific protocols. *(Signals: 6/9 dental-only pages; ProCity "operatory turnover… RCDSO-aligned"; Pro-Clean "bonded and insured, established 1995".)*
5. **Mississauga office or warehouse manager (Awareness to Consideration):** I want a nearby provider, because I assume local crews respond faster. But a Toronto-based firm looks distant. *(Signals: 5/9 Mississauga city pages; Grandmother's Touch "Mississauga since 1999"; JAN-PRO and Vanguard local franchises.)*

## 4. Persona scorecards

Six criteria, each scored 0–5: **5s** = answers the question in 5 seconds, **Proof**, **Price** = price guidance, **Next** = next step obvious, **AH-Trust** = trust for after-hours access, **Mob** = mobile. Totals are /30, and the % column scales them to /100.

### Evergreen homepage `/`
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Office manager | 5 | 2 | 0 | 5 | 3 | 4 | 19 | 63 |
| Property/facility mgr | 4 | 3 | 0 | 4 | 3 | 4 | 18 | 60 |
| Clinic owner | 3 | 1 | 0 | 4 | 3 | 4 | 15 | 50 |

Evidence for the homepage:
- **5s:** the H1 "Office & Commercial Cleaning in Toronto and the GTA" and the subhead "after hours, by a consistent crew" are fully visible on mobile.
- **Next:** "Get a free quote" and "Call (416) 803-4880" sit above the fold.
- **Proof:** only 4 Google reviews, dated 5–6 years ago, plus 3 old-site testimonials that are pending confirmation (intake A11). There is no rating, count, client logo or case study. The Michael Katchen review helps property managers. Nothing addresses clinics; the only health-adjacent testimonial is from a spa.
- **Price:** there is no price guidance at all.
- **AH-Trust:** "WSIB covered, bonded and insured" and "one account executive" appear, but there is no key, alarm or ID protocol.
- **Mobile:** lab LCP is 0.94 s. The video bubble ("Click to open ->") covers part of the trust list on mobile.

### `/services/office-cleaning/`
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Office manager | 5 | 2 | 2 | 5 | 4 | 4 | 22 | 73 |
| Property/facility mgr | 3 | 2 | 2 | 4 | 4 | 4 | 19 | 63 |
| Clinic owner | 2 | 1 | 2 | 4 | 4 | 4 | 17 | 57 |

Evidence for the office-cleaning page:
- **Content:** 1,563 words. It has a strong "What is included" (every visit / periodic) section, "Scope and limits", and a FAQ with FAQPage schema.
- **AH-Trust:** "Your equipment and your privacy are respected… the team that holds your keys is the same team every visit" is the best after-hours trust copy on the site.
- **Price:** "What affects the price" lists the factors but gives no number.
- **Proof:** two 5-year-old reviews.
- **Property managers:** multi-tenant buildings get only one bullet.

### `/industries/medical-dental-clinics/`
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Clinic owner | 5 | 1 | 2 | 5 | 4 | 4 | 21 | 70 |
| Office manager | 1 | 1 | 2 | 4 | 4 | 4 | 16 | 53 |
| Property/facility mgr | 2 | 1 | 2 | 4 | 4 | 4 | 17 | 57 |

Evidence for the clinic page:
- **Content:** a clear H1 and good protocol boundaries ("Sterilization of instruments and the handling of biomedical or sharps waste… are not part of a cleaning contract") with a clean-then-disinfect explanation.
- **Proof:** the page has **no testimonial section at all**, and no clinic client or case study.
- **Missing clinic detail:** no reference to Ontario IPAC/PIDAC practice, staff training, or confidentiality around patient records.
- **Dental keyword:** "Dental" is diluted, because the title leads with "Medical".

### `/locations/mississauga/`
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob* | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Office manager (Mississauga) | 4 | 3 | 0 | 5 | 3 | 3 | 18 | 60 |
| Property/facility mgr | 4 | 3 | 0 | 5 | 3 | 3 | 18 | 60 |
| Clinic owner | 2 | 1 | 0 | 4 | 3 | 3 | 13 | 43 |

\*No screenshot was available, so the mobile score is inferred from the HTML. The H1 renders before the breadcrumb and the form appears early.

Evidence for the Mississauga page:
- **Content:** a local intro (Hurontario, Airport Corporate Centre, Meadowvale), a "Why Mississauga Property Managers Choose Evergreen" section and 3 reviews (including the PM review). There is no price section.
- **Location:** "We do not have an office in Mississauga" is honest, but competitors show local addresses.
- **Claim inconsistency:** the bullet "Health-grade sanitization adhering strictly to clinical hygiene standards" over-claims compared with the clinic page's careful scope.
- **Schema:** no BreadcrumbList.

### JAN-PRO `/who-we-clean/office-cleaning/` (jan-pro.com)
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob* | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Office manager | 4 | 4 | 0 | 4 | 3 | 4 | 19 | 63 |
| Property/facility mgr | 3 | 4 | 0 | 4 | 3 | 4 | 18 | 60 |
| Clinic owner | 3 | 3 | 0 | 4 | 3 | 4 | 17 | 57 |

Evidence for this JAN-PRO page:
- **Content:** 1,472 words and 21 images. The H1 "Professional Office Cleaning Services" has no location.
- **Proof:** the TRACKER® digital inspection system, "Trusted by Businesses Nationwide", and daily, weekly and periodic "cleaning packs".
- **Market fit:** the page uses US references (EPA, OSHA, CDC, Joint Commission) that don't fit Canada.
- **Form:** asks for ZIP and mixes "Opening a cleaning franchise" with "Having my business cleaned", which adds friction.
- **AH-Trust:** franchisees are "bonded, insured". It is unclear who holds the keys.

### JAN-PRO `/how-we-quote/`
| Persona | 5s | Proof | Price | Next | AH-Trust | Mob* | /30 | % |
|---|---|---|---|---|---|---|---|---|
| Office manager | 4 | 1 | 0 | 5 | 1 | 4 | 15 | 50 |
| Property/facility mgr | 4 | 1 | 0 | 5 | 1 | 4 | 15 | 50 |
| Clinic owner | 4 | 1 | 0 | 5 | 1 | 4 | 15 | 50 |

Evidence for the quote page: 528 words with no schema. It says only "Custom quotes are provided based on a site visit and assessment", followed by the form.

**Head-to-head:** on the page itself, Evergreen's office page (73) **beats** JAN-PRO's office page (63) and its quote page (50). JAN-PRO wins *off the page*:
- local franchise offices with addresses (Mississauga, Scarborough)
- "4.8★ average quality rating" and "700+ Toronto clients" on jan-pro.ca/en/office/toronto-west/
- a BBB A+ profile and social profiles
- brand demand

**Weakest persona:** the clinic owner (43–57 across Evergreen pages), followed by the property manager on proof. **Systemic gaps:** Price (0–2 everywhere) and Proof (1–3 everywhere).

## 5. Ranking competitors (unique)

| Competitor | URL(s) |
|---|---|
| MCA Group | https://mcagroup.ca/ and https://mcagroup.ca/post-construction-cleaning/ |
| We Clean It | https://www.wecleanit.ca/ |
| Impact Cleaning Services | https://impact.ca/ontario/toronto/office-cleaning |
| Dust 'til Dawn | https://dusttildawn.ca/ and https://dusttildawn.ca/dental-office-cleaning-toronto/ |
| ServiceMaster Clean of Toronto | https://smcleantoronto.ca/ and https://smcleantoronto.ca/services/janitorial |
| Everest | https://everestcleaning.ca/toronto/ |
| RBC Clean | https://www.rbcclean.com/services/commercial-cleaning-services-toronto/ |
| GDI | https://gdi.com/locations/toronto/ |
| Secure Cleaning Services | https://securecleaningservices.ca/ |
| Great Commercial Cleaners | https://greatcommercialcleaners.com/ |
| Focus Cleaning | https://focuscleaning.ca/ |
| New Canadian Cleaning | https://newcanadiancleaning.ca/ |
| Generations Cleaning | https://www.generationscleaning.ca/ |
| torontocommercialclean.com | https://torontocommercialclean.com/ |
| toronto-commercial-cleaning.com | https://toronto-commercial-cleaning.com/ |
| torontoofficecleaningservices.com | https://torontoofficecleaningservices.com/ |
| Decca Janitorial | https://www.janitor.ca/ |
| Admiral Janitorial | https://admiraljanitorial.ca/ |
| Ace Clean | https://www.aceclean.ca/ |
| Cleannit | https://cleannitjs.com/ |
| Now It's Clean | https://nowitsclean.ca/ |
| Cleany | https://cleany.ca/ |
| TidyUp HandyCrew | https://tidyuphandycrew.ca/ |
| Clean Papi | https://cleanpapi.ca/ |
| Cleaning Bees | https://mycleaningbees.ca/ |
| Pro-Clean | https://www.pro-clean.ca/medical-facility-cleaning-service/ |
| ProCity Maids | https://procitymaids.ca/ |
| torontodentalofficecleaningservices.com | https://torontodentalofficecleaningservices.com/ |
| Services Pro | https://www.servicespro.ca/ |
| Vanguard | https://www.vanguardcleaning.ca/cleaning/toronto-ontario/ |
| Anago South GTA | https://anagosouthgta.ca/areas-we-serve/commercial-cleaning-mississauga/ |
| Grandmother's Touch | https://grandmotherstouch.com/ |
| MWAC | https://mwaccommercialsanitation.ca/areas-of-service/mississauga-commercial-cleaning-services/ |
| Low Fare Maintenance | https://www.lowfaremaintenance.ca/ |
| Applewood Group | https://applewoodgroup.com/property-management-cleaning/ |
| JAN-PRO | https://jan-pro.ca/en/office/toronto-west/ and https://jan-pro.ca/en/office/toronto-east/ |

Directories and aggregators that hold slots: Yelp, Bark, HomeStars, plus the Arelli listicle.

## 6. Why well-optimised Evergreen pages may still not rank

1. **Reviews and authority.** Evergreen shows 4 Google reviews dated 5–6 years ago. A third party lists about 7 reviews at 5.0 (unverified). Competitors display MCA 140, Dust 'til Dawn 83, Impact 53+ and JAN-PRO 4.8★ with 700+ clients. Review volume and recency drive the local pack and click-through, and several competitors put AggregateRating in schema.
2. **Local pack dominance (inferred).** "near me" and "[service] toronto" queries surface the map pack first. Pack ranking depends on the GBP's distance from the searcher; Evergreen's single address is 243 Queen St W. Evergreen can compete downtown only, and has **no address-based eligibility in Mississauga or other 905 areas**.
3. **Head-term cannibalisation.** The homepage, /services/ ("Commercial Cleaning Services in Toronto"), /services/commercial-cleaning/ and /locations/toronto-downtown/ all target "commercial cleaning toronto". The downtown H1 also includes "| Evergreen Office Cleaning".
4. **Missing page types.** There is no janitorial page and no dental-only page, while the SERPs reward both.
5. **Directories take 1–3 slots.** Yelp, Bark and HomeStars hold slots. If Evergreen is not listed there, it is absent from those slots too.
6. **Undifferentiated proof.** Evergreen has no case studies, no real crew photos (intake B5 flags generated-looking images), no certification beyond WSIB, bonding and insurance (Impact and Everest cite CIMS), and no price anchor. Competitors anchor at $225–$500/month or "from $400".
7. **New site and domain strength.** The Astro rebuild launched in October 2026, and its link equity is unknown (no GSC or backlink data). A third party puts it at about position 27 for "commercial cleaning service toronto".

## 7. Prioritised changes

**P0 (0–30 days)**
1. **GBP and review programme.** Target 25+ new Google reviews in 90 days, spread across office clients, property managers and clinics. Reply to every review. Once intake B3 is confirmed, show the live rating and count near the CTAs. Run `/seo local`.
2. **Fix Toronto cannibalisation.**
   - Assign "commercial cleaning toronto / services toronto" to the **homepage** (the SERP is homepages) and "office cleaning toronto" to /services/office-cleaning/.
   - Retitle /services/ to "All Cleaning Services | Evergreen" and make its H1 non-competing.
   - Fix the /locations/toronto-downtown/ H1 (remove "| Evergreen Office Cleaning") and target "office cleaning downtown Toronto".
3. **Add a price-guidance block** to office, commercial, clinic and city pages. Example: "Most 3,000–5,000 sq ft offices cleaned 3 nights a week fall between $X and $Y per month." Use client-confirmed figures; the "from $30/hr" offer on /lp/office-cleaning/ can be reused if intake A7 confirms it.
4. **Create /services/janitorial-services/** (Toronto janitorial; day porter, nightly janitorial, washroom programmes) and point the homepage "Janitorial Services" card to it.
5. **Add an "After-hours access and security" block** to the home, office, clinic and property-management pages. Cover key and fob log, alarm-code handling, uniformed and ID'd crew, police-checked staff, confidentiality agreement, named supervisor and a missed-area re-clean promise. Every item needs client confirmation (intake B1/B2).

**P1 (30–60 days)**
6. **Create /industries/dental-office-cleaning/ (Toronto).** Cover operatory and sterilization-room perimeter, reception, and IPAC-aligned scope boundaries, with a dental testimonial. Keep the medical page and link the existing dental checklist post to it.
7. **Publish proof:** 2–4 case studies (intake B4) and real crew and equipment photos (B5). Add testimonials to the clinic page, which has none.
8. **Mississauga page:**
   - Move the breadcrumb above the H1 and add BreadcrumbList schema.
   - Remove "Health-grade sanitization adhering strictly…".
   - Add a Mississauga client quote and the Peel coverage logic.
   - Accept that the page targets organic results, not the map pack.
9. **Post-construction page:** put "Toronto" in the H1, add commercial rough, final and touch-up phases, a price basis (per sq ft or "from"), and before/after photos.
10. **Directories:** list or claim Yelp, HomeStars, Bark and BBB with consistent name, address and phone.

**P2 (60–90 days)**
11. **Cost guide:** "How much does office cleaning cost in Toronto? (2026)". The cost SERP is held by HomeStars, hellamaid and ISSA, and Evergreen has nothing there.
12. **Comparison page:** "Franchise vs owner-run commercial cleaner in Toronto". JAN-PRO, Vanguard and Anago rank, and this positions owner contact, one account executive and the same crew. Avoid trademark misuse in titles and ads.
13. **Property-management page:** add a portfolio and multi-site section (one contract, one account executive, inspection cadence). The vertical SERP competitors are thin (454–573 words).
14. **Video bubble:** suppress or delay it on mobile, where it overlaps the trust strip.
15. **Certification:** evaluate CIMS, which Impact and Everest cite.
16. Run `/seo schema` (BreadcrumbList on the location pages, Review markup only if reviews are shown on the page) and `/seo content` (E-E-A-T, case studies).

## 8. SXO Gap Score: 58/100

| Dimension | Score | Evidence |
|---|---|---|
| Page type | 10/15 | Service, vertical and city pages exist and match the SERP types. Janitorial and dental pages are missing, and Toronto intent is split across 4 pages |
| Content depth | 11/15 | 900–1,560 words, scoped "what's included", scope limits, FAQs. Competitors run 1,000–3,160 words with prices and phases |
| UX signals | 12/15 | Clear H1 and both CTAs above the fold on mobile, forms on page, lab LCP 0.94 s. The video bubble overlaps content |
| Schema | 11/15 | CleaningService, Service, FAQPage, BreadcrumbList on service and industry pages. BreadcrumbList is missing on /locations/*. No rating markup, by design |
| Media | 5/15 | 1–8 images per page, possibly generated. No real crew photos, video or before/after |
| Authority | 3/15 | A handful of 5–6-year-old reviews, no case studies or client names, no certifications beyond WSIB, bonding and insurance |
| Freshness | 6/10 | The site was rebuilt in October 2026, but the reviews are 5–6 years old and the blog is mostly older or COVID-era |

**Reasoning:** on-page search experience is now competitive. Evergreen's office page out-scores JAN-PRO's office and quote pages. The score is held down by proof, price transparency and authority, which are the signals the Toronto local SERPs reward. Closing P0 items 1–5 should move it to about 70. Most of the remaining gap is off-page (reviews, GBP, directories).

Generate a PDF report? Use `/seo google report`.

## 9. Search Experience findings (JSON-compatible)
```json
{"category":"Search Experience","sxo_gap_score":58,"findings":[
{"id":"sxo-1","severity":"high","title":"Toronto head terms split across 4 pages","pages":["/","/services/","/services/commercial-cleaning/","/locations/toronto-downtown/"]},
{"id":"sxo-2","severity":"high","title":"No janitorial services page; homepage janitorial card links to office cleaning","query":"janitorial services toronto"},
{"id":"sxo-3","severity":"high","title":"Review volume/recency far below ranking competitors (4 shown, 5-6 yrs old vs 53-140)","query":"office cleaning company near me toronto"},
{"id":"sxo-4","severity":"medium","title":"Combined medical+dental page vs dental-only SERP","query":"dental office cleaning toronto"},
{"id":"sxo-5","severity":"medium","title":"No price guidance on any page; competitors anchor $225-$500/mo, from $400","pages":["/services/office-cleaning/","/locations/mississauga/"]},
{"id":"sxo-6","severity":"medium","title":"No after-hours key/alarm/security protocol block"},
{"id":"sxo-7","severity":"medium","title":"Mississauga page: H1 above breadcrumb, no BreadcrumbList, clinical over-claim, no local address"},
{"id":"sxo-8","severity":"low","title":"Mobile video bubble overlaps trust strip"},
{"id":"sxo-9","severity":"info","title":"SERP features (ads, local pack, AIO, PAA) not observable in this environment; re-capture from Toronto"}]}
```

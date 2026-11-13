# Page titles before and after the one-suffix rule (13 Nov 2026)

Finding: onpage.md N4, SEO audit 11 Nov. `pageTitle()` in `src/lib/title.ts` now
appends " | Evergreen" when the result is 60 characters or fewer and leaves the
title whole otherwise. Every `<title>` goes through it; the stored seoTitles and
location titles no longer carry the suffix themselves. Measured on a local
build, decoded, before and after the change. Admin pages and the live-post
shell are left out.

65 titles changed: 29 indexable, 36 noindex. The money pages (11 services, 2
industries, 9 branded locations, /industries/, /our-process/) render exactly
as before: their " | Evergreen" moved from the stored text to the rule.

Unbranded after the change, because the suffix would take them over 60 (10
indexable pages, the same 10 the audit counted, now all by rule):
/locations/vaughan/ (49), /locations/durham-region/ (56),
/office-cleaning-cost-toronto-guide/ (51), /office-cleaning-checklist/ (56),
/commercial-cleaning-quote-checklist/ (52),
/5-cleaning-tips-to-help-make-your-office-relocation-seamless/ (60),
/day-night-which-is-the-best-routine-for-your-office/ (57),
/how-often-should-an-office-be-cleaned/ (52),
/office-layout-tips-to-make-cleaning-easier-and-faster/ (53),
/preventing-slips-trips-falls-in-your-workplace/ (52).

The homepage is the one title written whole: "Commercial Cleaning Company in
Toronto Since 1989 | Evergreen", 61 characters, unchanged.
`tests/build/titles.test.ts` pins it as the single exception.

Not changed here: /lp/office-cleaning/ and /lp/post-construction-cleaning/
(noindex landing pages) still end "| Evergreen Office Cleaning", because their
titles live in `src/data/landing-pages.ts`, outside this change.

## Indexable pages

| Page | Before | After |
| --- | --- | --- |
| /5-cleaning-products-you-should-have-in-your-office/ | Office Cleaning Supplies List - Evergreen Office Cleaning (57) | Office Cleaning Supplies List \| Evergreen (41) |
| /5-easy-ways-to-keep-your-commercial-floor-clean/ | Commercial Floor Care: Daily Maintenance Tips - Evergreen (57) | Commercial Floor Care: Daily Maintenance Tips \| Evergreen (57) |
| /6-common-cleaning-products-that-you-should-never-mix-together/ | 6 Cleaning Products You Should Never Mix - Evergreen (52) | 6 Cleaning Products You Should Never Mix \| Evergreen (52) |
| /a-cleaning-checklist-for-your-retail-store/ | Retail Store Cleaning Checklist - Evergreen Office Cleaning (59) | Retail Store Cleaning Checklist \| Evergreen (43) |
| /about-us/ | About Us - Evergreen Office Cleaning (36) | About Us \| Evergreen (20) |
| /areas-in-your-office-where-germs-are-likely-hiding/ | Office Germ Hotspots and Hand Hygiene - Evergreen (49) | Office Germ Hotspots and Hand Hygiene \| Evergreen (49) |
| /ask-the-office-cleaners-cleaning-break-rooms/ | Ask the Office Cleaners: Cleaning Break Rooms - Evergreen (57) | Ask the Office Cleaners: Cleaning Break Rooms \| Evergreen (57) |
| /benefits-of-commercial-deep-cleaning-services/ | Commercial Deep Cleaning: What's Included - Evergreen (53) | Commercial Deep Cleaning: What's Included \| Evergreen (53) |
| /cleaning-check-list-dental-clinics/ | Dental Office Cleaning Checklist - Evergreen Office Cleaning (60) | Dental Office Cleaning Checklist \| Evergreen (44) |
| /cleaning-demo-gallery/ | Cleaning Services Photo Gallery - Evergreen Office Cleaning (59) | Cleaning Services Photo Gallery \| Evergreen (43) |
| /cleaning-protocols-for-daycares-and-schools/ | Daycare and School Cleaning Checklist - Evergreen (49) | Daycare and School Cleaning Checklist \| Evergreen (49) |
| /commercial-cleaning-air-quality/ | Commercial Cleaning and Air Quality - Evergreen (47) | Commercial Cleaning and Air Quality \| Evergreen (47) |
| /commercial-cleaning-techniques-to-avoid/ | Commercial Cleaning Techniques To Avoid - Evergreen (51) | Commercial Cleaning Techniques To Avoid \| Evergreen (51) |
| /contact-us/ | Contact Us - Evergreen Office Cleaning (38) | Contact Us \| Evergreen (22) |
| /green-clean-products/ | Green Clean Products - Evergreen Office Cleaning (48) | Green Clean Products \| Evergreen (32) |
| /how-to-decide-on-a-cleaning-company/ | How to Decide on a Cleaning Company - Evergreen (47) | How to Decide on a Cleaning Company \| Evergreen (47) |
| /how-to-keep-your-office-fridge-clean/ | How to Keep Your Office Fridge Clean - Evergreen (48) | How to Keep Your Office Fridge Clean \| Evergreen (48) |
| /how-to-properly-dust-office-building/ | How to Properly Dust an Office Building - Evergreen (51) | How to Properly Dust an Office Building \| Evergreen (51) |
| /insights/ | Commercial Cleaning Insights - Evergreen Office Cleaning (56) | Commercial Cleaning Insights \| Evergreen (40) |
| /insights/page/2/ | Commercial Cleaning Insights - Page 2 of 3 - Evergreen (54) | Commercial Cleaning Insights - Page 2 of 3 \| Evergreen (54) |
| /insights/page/3/ | Commercial Cleaning Insights - Page 3 of 3 - Evergreen (54) | Commercial Cleaning Insights - Page 3 of 3 \| Evergreen (54) |
| /keep-your-office-at-home-clean/ | Keep Your Office at Home Clean - Evergreen Office Cleaning (58) | Keep Your Office at Home Clean \| Evergreen (42) |
| /locations/ | Service Areas Across the GTA - Evergreen Office Cleaning (56) | Service Areas Across the GTA \| Evergreen (40) |
| /privacy/ | Privacy Policy - Evergreen Office Cleaning (42) | Privacy Policy \| Evergreen (26) |
| /request-a-quote/ | Request a Quote - Evergreen Office Cleaning (43) | Request a Quote \| Evergreen (27) |
| /reviews/ | Client Reviews - Evergreen Office Cleaning (42) | Client Reviews \| Evergreen (26) |
| /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ | Robotic Floor Scrubbers vs Manual Cleaning - Evergreen (54) | Robotic Floor Scrubbers vs Manual Cleaning \| Evergreen (54) |
| /seasonal-office-cleaning-checklist/ | Seasonal Office Cleaning Checklist for Toronto - Evergreen (58) | Seasonal Office Cleaning Checklist for Toronto \| Evergreen (58) |
| /services/ | All Cleaning Services \| Evergreen Office Cleaning (49) | All Cleaning Services \| Evergreen (33) |

## Noindex pages

| Page | Before | After |
| --- | --- | --- |
| /404.html | Page Not Found - Evergreen Office Cleaning (42) | Page Not Found \| Evergreen (26) |
| /category/blog/ | Blog Archives - Evergreen Office Cleaning (41) | Blog Archives \| Evergreen (25) |
| /category/blog/page/2/ | Blog Archives - Page 2 of 3 - Evergreen Office Cleaning (55) | Blog Archives - Page 2 of 3 \| Evergreen (39) |
| /category/blog/page/3/ | Blog Archives - Page 3 of 3 - Evergreen Office Cleaning (55) | Blog Archives - Page 3 of 3 \| Evergreen (39) |
| /lp/commercial-cleaning-quote/ | Commercial Cleaning Quote — Toronto & GTA \| Evergreen Office Cleaning (69) | Commercial Cleaning Quote — Toronto & GTA \| Evergreen (53) |
| /lp/commercial-cleaning/ | Commercial & Office Cleaning in Toronto and the GTA \| Evergreen (63) | Commercial & Office Cleaning in Toronto and the GTA (51) |
| /search/ | Search - Evergreen Office Cleaning (34) | Search \| Evergreen (18) |
| /tag/ai/ | AI Archives - Evergreen Office Cleaning (39) | AI Archives \| Evergreen (23) |
| /tag/air-quality/ | air quality Archives - Evergreen Office Cleaning (48) | air quality Archives \| Evergreen (32) |
| /tag/allergies/ | allergies Archives - Evergreen Office Cleaning (46) | allergies Archives \| Evergreen (30) |
| /tag/breakroom/ | breakroom Archives - Evergreen Office Cleaning (46) | breakroom Archives \| Evergreen (30) |
| /tag/cleaning-products/ | cleaning products Archives - Evergreen Office Cleaning (54) | cleaning products Archives \| Evergreen (38) |
| /tag/cleaning/ | cleaning Archives - Evergreen Office Cleaning (45) | cleaning Archives \| Evergreen (29) |
| /tag/cleaning/page/2/ | cleaning Archives - Page 2 of 2 - Evergreen Office Cleaning (59) | cleaning Archives - Page 2 of 2 \| Evergreen (43) |
| /tag/commercial-cleaning/ | commercial cleaning Archives - Evergreen Office Cleaning (56) | commercial cleaning Archives \| Evergreen (40) |
| /tag/commercial-cleaning/page/2/ | commercial cleaning Archives - Page 2 of 3 - Evergreen (54) | commercial cleaning Archives - Page 2 of 3 \| Evergreen (54) |
| /tag/commercial-cleaning/page/3/ | commercial cleaning Archives - Page 3 of 3 - Evergreen (54) | commercial cleaning Archives - Page 3 of 3 \| Evergreen (54) |
| /tag/commercial-office-cleaning/ | Commercial office cleaning Archives - Evergreen (47) | Commercial office cleaning Archives \| Evergreen (47) |
| /tag/daycares/ | daycares Archives - Evergreen Office Cleaning (45) | daycares Archives \| Evergreen (29) |
| /tag/dental-office/ | dental office Archives - Evergreen Office Cleaning (50) | dental office Archives \| Evergreen (34) |
| /tag/dust/ | Dust Archives - Evergreen Office Cleaning (41) | Dust Archives \| Evergreen (25) |
| /tag/dusting/ | Dusting Archives - Evergreen Office Cleaning (44) | Dusting Archives \| Evergreen (28) |
| /tag/entrance/ | entrance Archives - Evergreen Office Cleaning (45) | entrance Archives \| Evergreen (29) |
| /tag/janitorial-services/ | janitorial services Archives - Evergreen Office Cleaning (56) | janitorial services Archives \| Evergreen (40) |
| /tag/janitorial-services/page/2/ | janitorial services Archives - Page 2 of 2 - Evergreen (54) | janitorial services Archives - Page 2 of 2 \| Evergreen (54) |
| /tag/manual-cleaning/ | Manual cleaning Archives - Evergreen Office Cleaning (52) | Manual cleaning Archives \| Evergreen (36) |
| /tag/moving/ | moving Archives - Evergreen Office Cleaning (43) | moving Archives \| Evergreen (27) |
| /tag/office/ | office Archives - Evergreen Office Cleaning (43) | office Archives \| Evergreen (27) |
| /tag/office/page/2/ | office Archives - Page 2 of 2 - Evergreen Office Cleaning (57) | office Archives - Page 2 of 2 \| Evergreen (41) |
| /tag/refrigerator/ | refrigerator Archives - Evergreen Office Cleaning (49) | refrigerator Archives \| Evergreen (33) |
| /tag/relocating/ | relocating Archives - Evergreen Office Cleaning (47) | relocating Archives \| Evergreen (31) |
| /tag/retail/ | retail Archives - Evergreen Office Cleaning (43) | retail Archives \| Evergreen (27) |
| /tag/robotic/ | Robotic Archives - Evergreen Office Cleaning (44) | Robotic Archives \| Evergreen (28) |
| /tag/schools/ | schools Archives - Evergreen Office Cleaning (44) | schools Archives \| Evergreen (28) |
| /tag/winter/ | winter Archives - Evergreen Office Cleaning (43) | winter Archives \| Evergreen (27) |
| /thank-you/ | Thank You \| Evergreen Office Cleaning (37) | Thank You \| Evergreen (21) |

## 13 Nov 2026: blog title/H1 split

Source: the comparison with impact.ca, 13 Nov
(`comparison-impact-2026-11-13/onpage-schema.md`, recommendation 1). Impact's
matched post gives its `<title>` to the search query and keeps a question as
its H1. We copied the pattern, not the wording. Five posts get a `seoTitle`.
Each one had an H1 written for readers (a question, a list hook, a series
line) while people search other words. Only the `<title>` changes. The H1,
description, body, slug and BlogPosting headline stay as they were. No
`updatedDate` moves, because nothing a reader sees has changed. Lengths
include the suffix where `pageTitle()` adds it.

| Post | H1 (unchanged) | Old `<title>` | New `<title>` | Reason (target query) |
| --- | --- | --- | --- | --- |
| /5-cleaning-tips-to-help-make-your-office-relocation-seamless/ | 5 Cleaning Tips to Help Make Your Office Relocation Seamless | 5 Cleaning Tips to Help Make Your Office Relocation Seamless (60, no brand) | Office Move-Out Cleaning: 5 Tips for Relocating \| Evergreen (59) | "office move-out cleaning". The post covers cleaning the space you are leaving so it is ready for the landlord and the next tenant. The list hook buried that query at the end. |
| /day-night-which-is-the-best-routine-for-your-office/ | Day Or Night – Which Is the Best Routine For Your Office? | Day Or Night – Which Is the Best Routine For Your Office? (57, no brand) | Day vs Night Office Cleaning: Benefits of Each \| Evergreen (58) | "day vs night office cleaning". The H1 asks the question. The post sets out the benefits of each. |
| /keep-your-office-at-home-clean/ | Keep Your Office at Home Clean | Keep Your Office at Home Clean \| Evergreen (42) | Home Office Cleaning: 3 Simple Tips \| Evergreen (47) | "home office cleaning". The H1 puts "at home" last. The post gives three tips: products within reach, a filing system, and getting help. |
| /how-to-decide-on-a-cleaning-company/ | How to Decide on a Cleaning Company | How to Decide on a Cleaning Company \| Evergreen (47) | How to Choose a Commercial Cleaning Company \| Evergreen (55) | "how to choose a commercial cleaning company". The post's description and first heading already use that phrase. The H1 says "decide" and leaves out "commercial". |
| /ask-the-office-cleaners-cleaning-break-rooms/ | Ask the Office Cleaners: Cleaning Break Rooms | Ask the Office Cleaners: Cleaning Break Rooms \| Evergreen (57) | Office Break Room Cleaning: Furniture and Carpet \| Evergreen (60) | "office break room cleaning". "Ask the Office Cleaners" is a series line, not a query. The post covers the sofa and upholstery, benches, chairs and tables, and the carpet. |

Considered and left as they are. Either the title already leads with the
query, or it was set on 6-7 Nov and there was no clear reason to change it:

- /how-often-should-an-office-be-cleaned/: this is the post matched with
  Impact's. Its title, "How Often Should an Office Be Cleaned? Toronto Guide",
  is the question people actually type. A keyword-led rewrite of it comes out
  too close to Impact's own title.
- /office-cleaning-cost-toronto-guide/: already split on 7 Nov. The H1 is
  "What Drives Office Cleaning Costs in Toronto" and the title leads with
  "Office Cleaning Costs in Toronto".
- The checklist posts (office, seasonal, retail, dental, daycare and school,
  quote), the floor, supplies, mixing, germs, deep-clean and robotic posts:
  their H1 or 6 Nov seoTitle already leads with the query.
- The fridge, dusting, air-quality, techniques, office-layout and slips posts:
  each H1 is already the phrase people search, so a second title would only
  reword it.

`tests/build/titles.test.ts` pins the five titles. It also checks three things
on every post: the `<title>` and H1 differ only where a `seoTitle` is set, the
H1 and BlogPosting headline stay the post's `title`, and no two built pages
share a `<title>`.

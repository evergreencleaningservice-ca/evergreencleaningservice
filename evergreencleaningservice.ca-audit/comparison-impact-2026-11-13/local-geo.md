# Local SEO and AI-search readiness: Evergreen vs Impact (13 Nov 2026)

## 1. Scores (local and GEO only, out of 100)

| Dimension | Evergreen | Impact |
|---|---|---|
| NAP consistency and single-location clarity | 18/20 | 15/20 |
| GBP signals on site | 17/20 | 14/20 |
| Reviews (display, schema, recency) | 12/20 | 12/20 |
| LocalBusiness schema | 16/20 | 12/20 |
| AI-crawler access and llms.txt | 14/15 | 5/15 |
| Answer-first and question content | 4/5 | 4/5 |
| Search visibility | not scored (see section 5) | not scored |
| Total (of 100) | 81 | 62 |

Scores are my judgement from the evidence below. Search visibility could not be measured, so those points are redistributed and the totals are indicative.

## 2. What each does better (evidence)

| Site | Strength | Evidence |
|---|---|---|
| Impact | More real offices | Home footer and JSON-LD list Head office 21 Goodrich Rd #8 Etobicoke ON M8Z 6A3, (647) 492-6286, and Burlington office 1162 King Rd Unit 3, L7T 3L7, (289) 812-8412. Footer also lists Vancouver and Calgary as "(office)" with their own phones (778-800-5951, 587-871-5085). |
| Impact | Per-office LocalBusiness nodes | impact.ca/ JSON-LD has `LocalBusiness` with `@id` `#office-etobicoke` and `#office-burlington`, `parentOrganization` pointing at the Organization node, and geo to 7 decimals. |
| Impact | Review count in the first fold | Header strip: "53+ 5-Star Google Reviews" on the home page (impact/home.html, screenshots/impact/visual-data.json). This is an unverifiable claim in text; no aggregateRating schema. |
| Impact | Home FAQ block | 7 question H2/H3 on the home page (e.g. "How much does commercial cleaning cost?", "Which cities does Impact serve?"). |
| Impact | City pages carry an FAQ and a testimonials section | Desktop full screenshot of /ontario/mississauga/office-cleaning shows FAQ and "What Our Clients Say" sections plus a contact strip. Text was not machine-read (see section 6). |
| Evergreen | Honest single-location NAP | "Office: one, at 243 Queen St W, Toronto, ON M5V 1Z4" on /about-us/. Same NAP in JSON-LD, footer and llms.txt: +1-416-803-4880 (one phone across HTML tel: and schema). |
| Evergreen | Richer local schema | Home JSON-LD `ProfessionalService` with geo 43.65019, -79.38856 (5 decimals), openingHoursSpecification, `hasMap` and sameAs to the Google Maps cid, 15 `areaServed` cities, contactPoint. Impact home omits any schema rating and its Organization node has no address. |
| Evergreen | GBP linkage | Footer "Review us on Google (opens in a new tab)", Maps cid in `hasMap` and `sameAs`, address on all 90 crawled pages. Impact sameAs has a maps.app.goo.gl link only in the LocalBusiness node. |
| Evergreen | AI access | robots.txt names OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, Applebot with Content-Signal lines. /llms.txt returns 200 (73 lines, address, hours, services, area list). llms-full.txt 404. |
| Evergreen | Dedicated review page and FAQPage schema | /reviews/ (674 words, dated Google quotes, with Review schema). FAQPage JSON-LD on about 20 service and location pages. |
| Evergreen | Question-led posts | /how-often-should-an-office-be-cleaned/ has 11 question headings; /office-cleaning-cost-toronto-guide/ has 4; /office-cleaning/ has 4. |

## 3. Copy the pattern, not the content

- Show a review count in the header strip, but only the real, current Google count and with a link to the GBP listing. Evergreen's home shows review cards but no count in the fold. Edit the header component in `src/components/` (and the layout in `src/layouts/`).
- Add `aggregateRating` to the home `ProfessionalService` node only if the count and rating match the GBP exactly and are visible on the page. Neither site does this today, so it is a differentiator.
- Put a short question-heading FAQ on the home page (Impact has 7). Evergreen's home has no question headings. Write original answers from real customer questions.
- Keep per-location nodes only where a real staffed office exists. Evergreen has one, so keep the single `@id` and model city pages as `Service` with `areaServed`, not fake branches.

## 4. Where Evergreen already beats Impact

- Single, verifiable address with `hasMap`, 5-decimal geo and opening hours; no phone conflicts.
- llms.txt present and AI crawlers explicitly allowed. Impact has no llms.txt (404) and a robots.txt with only a wp-admin disallow (no AI policy, no content signals).
- Review page with dated quotes and Review schema; FAQPage schema across service and location pages.
- Impact's national office claim is thin for Ontario city pages: only Etobicoke and Burlington have addresses on the home page and in schema. Its 36 Toronto and other Ontario city pages (Mississauga, Brampton, Oakville, Hamilton, Muskoka and so on) are programmatic city by service pages and are not backed by a local office. I did not find address claims on them in the data I could read, but could not read the HTML (section 6). Treat that pattern as a doorway-page risk, not a model. Evergreen's 11 location pages are about 1,477 words for Mississauga, with local content.
- Impact's rating claim has no schema; the "53+" figure cannot be verified from the site.

## 5. Search visibility

WebSearch was not available in this session, so the four queries (office cleaning Toronto; commercial cleaning Toronto; office cleaning Mississauga; janitorial services Toronto) were not run. I have no ranking data for either site and will not guess. Run them from a logged-out Canadian IP, or with a rank tracker.

## 6. Not verified

- Search positions, local pack, GBP listing contents (category, photos, posts, review count, rating, response rate, recency). The "53+" Impact count and Evergreen's actual GBP count were not checked against Google.
- Impact's Ontario city page HTML: 67 of 87 crawl entries returned 403 (including /ontario/*), so I only have the screenshot for Mississauga. Whether those pages claim an office or address, their word count and their schema were not read. The Impact home was 2,584 words and the 20 root pages returned 200.
- Backlinks and citations (Yelp, BBB): no Moz quota and no citation checks were run.
- Whether Impact has LocalBusiness nodes for Vancouver and Calgary (only Etobicoke and Burlington nodes were seen in home JSON-LD).
- Whether the Evergreen Maps cid matches the claimed GBP listing; the review recency on Evergreen's cards ("around 2025", "September 2026", "May 2021") is as displayed on the page.

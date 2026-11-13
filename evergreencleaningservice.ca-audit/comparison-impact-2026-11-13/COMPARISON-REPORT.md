# Evergreen vs Impact: comparison report (13 Nov 2026)

For: the owner of Evergreen Office Cleaning (www.evergreencleaningservice.ca)
Compared with: Impact Commercial Cleaning (impact.ca)
Basis: six specialist reviews in this folder (technical, content, on-page and schema, performance, local and AI search, visual and UX). Each specialist's "we win" claims were then checked again by a separate reviewer. Claims that failed that check have been dropped or softened here. The specialist files still contain the original wording, so where they differ from this report, this report is the corrected version.

## 1. Bottom line

- **This is close.** On a simple average of the six area scores, Evergreen is at about 79 and Impact at about 76. Several of Evergreen's leads got smaller when they were checked again, so treat this as roughly level, not as an Evergreen win.
- **Impact's real advantage is proof of who it is.** It names 24 staff with titles and signs blog posts with a named person. It has an accreditations page, a dated company history and a quotable "company facts" page, and it shows a review count at the top of every desktop page. Evergreen names nobody and has no case studies, and 4 of the 7 reviews it shows are from 2020-21.
- **Impact's speed lead is real in the lab, but most of it comes from timing, not lighter code.** Impact holds back its tracking scripts until the visitor touches the page. Evergreen loads Google Tag Manager and the Google Ads tag early, and those two cost 0.5-0.9 s of phone processing time. A fix was committed later the same day (`src/lib/gtm-loader.ts`): unpaid visits now load the tags on first interaction or 15 s after load, and the reviews carousel's own scrolling no longer counts as an interaction. It still has to be deployed and measured.
- **Evergreen's real leads are smaller and more technical.** Its location pages name real local districts. It has full security headers, one consistent address with map and service-area data, an accessibility score of 100 against Impact's 87-89, modern compressed images, and a blog guide that links its government sources.
- **The way to beat Impact is mostly facts only you can supply.** That means fresh Google reviews, named people who agree to be named, two or three real case studies, and any credentials you actually hold. Do not copy Impact's 178 city-by-service pages. They are a risk, not a model.

## 2. Scorecard

Scores are each specialist's own model, out of 100. They are not Google's scores.

| Area | Evergreen | Impact | Winner | How firm, after the second check |
|---|---|---|---|---|
| Technical SEO | 90 | 74 | Evergreen | The gap is smaller than the score suggests. Impact lost points for a "bot wall" and "bulk-stamped" sitemap dates, and neither held up. Evergreen's confirmed edge is security headers, which matter for security, not ranking. |
| Content and E-E-A-T | 69 | 74 | Impact | Firm. Named people, a Person author, the facts page and the history page are all confirmed. |
| On-page and schema | 80 | 74 | Evergreen, narrowly | Weak. Impact was measured on only about 5 pages, and the breadcrumbs, ratings and titles "wins" turned out to be parity or untested. Impact's richer Organization schema is confirmed. Evergreen's Service schema edge is real but small. |
| Performance (lab) | 80 | 95 | Impact | Firm for Lighthouse scores. Most of the gap is Evergreen's eager Google tags (see section 3). |
| Local and AI search | 81 | 62 | Evergreen | Softer than shown. About 9 points of the gap came from "AI-search readiness", but Impact's robots.txt lets the same AI crawlers in. Evergreen's real edge is the single consistent address with `hasMap` and service areas, plus local detail. |
| Visual and conversion UX | 75 | 75 | Tie, leaning Impact | One Evergreen win was refuted (the form in the desktop fold on local pages) and another was softened (the sticky mobile bar). Impact's trust proof above the fold is confirmed. |
| **Simple average (indicative only)** | **79** | **76** | Roughly level | A straight average of six unequal areas. It ignores backlinks (no data) and real rankings (not measured). Do not quote it as a site score. |

## 3. Where Impact is ahead and why

### Proof of who they are (content and E-E-A-T)

| What | Evidence | Caveat |
|---|---|---|
| Named people | `impact.ca/team`: about 1,027 words and 24 named people with titles (CEO, President, VP Operations, operations managers). Evergreen has no team page, and `/about-us/` names no one. | None. Confirmed live. |
| Named blog author | The matched Impact post has a `Person` author (George Boutsalis) in its schema, a meta author tag and a visible byline. All 23 crawled Evergreen posts credit the company. | Only 1 of Impact's 22 posts was checked. |
| Company facts page | `impact.ca/company-facts`: about 2,129 words, "Last updated: October 28, 2026", a facts block (head office, founding, former names) and 11 question-style headings. The most quotable page on either site. | None. |
| Dated history | `impact.ca/history`: a timeline covering 1954, 1978, 1997 and today. Evergreen says only "since 1989" and gives its former name. | None. |
| Accreditations | `impact.ca/accreditations` lists ISSA CIMS / CIMS-GB, IICRC, ContractorCheck and ComplyWorks, plus BOMA, IFMA, CAGBC and RCO. Evergreen lists WSIB, insurance, bonding, screening and ECOLOGO products. | The audited status was not checked with ISSA. BOMA, IFMA, CAGBC and RCO are memberships, not audits. The gap on the page is real. |
| Case study and testimonials | One case study (Kingsway Boxing Club, 232 words) and nine testimonial quotes. Evergreen has no case studies. | Thin. Only one quote names a business, and one is from an Impact employee. "53+ 5-Star Google Reviews" is Impact's own banner and was not checked against Google. |

### Trust and selling on the page (visual and UX)

- **Trust bar above the fold on desktop.** Every Impact desktop page has a top strip with the phone number, "53+ 5-Star Google Reviews" and "Family-owned and Canadian since 1954". The home fold adds reviewer avatars, "1,100+ cleaners", "35M sq ft" and a CIMS-GB claim. Evergreen's folds show "Since 1989", "WSIB covered, bonded and insured" and the 2-hour reply promise, but no rating or review count. On mobile, Impact's strip shows only the phone number, though the home hero still shows the avatars and the review count.
- **A deeper home sales page.** Impact's home has a "Make-It-Right Guarantee", a 6-question FAQ, a technology section, awards, history and a closing CTA. Evergreen's home has reviews, "Why Evergreen", a 5-step "How it works" and testimonials, but no guarantee, FAQ, awards or history section.
- **One strong branded photo.** Impact's home hero shows an operator on an Impact-branded ride-on scrubber. Evergreen's home hero is an empty office. Its Mississauga hero does show real workers on a lift. This is one photo and one benefit-led H1 ("Office Cleaning Services, Without Chasing Your Cleaner"), not a site-wide pattern.

### Speed in the lab (performance)

Mobile Lighthouse medians:

| Page | Evergreen score / TBT | Impact score / TBT |
|---|---|---|
| Home | 83 / 624 ms | 97 / 75 ms |
| Office cleaning | 82 / 633 ms | 100 / 56 ms (2 valid runs) |
| Mississauga | 76 / 480 ms | 98 / 100 ms |
| Blog post | 85 / 561 ms | 99 / 98 ms |

Why Impact is ahead:

- **It is not running less JavaScript.** Its home HTML has about 40 scripts marked for delay by the WP Rocket plugin: jQuery, Elementor, HubSpot forms, Site Kit and GTM all wait until the visitor interacts. Lighthouse never interacts, so it saw only about 3-12 KB of Impact script. What Impact visitors pay after they interact (INP) was not measured.
- **Evergreen's biggest cost is Google's tags.** In every Evergreen mobile run, the largest single task is the Google Ads tag (`gtag/js?id=AW-...`, 517-695 ms), with two more `gtm.js` tasks of 120-250 ms. Google tags account for about 379 KiB of each Evergreen page. GTM explains most of the gap, not all of it: Evergreen also has first-party tasks of 131-138 ms on the location and post pages.
- **Impact is also much faster to show the main content on three of the four pages:** office 1.34 s vs 2.44 s, Mississauga 1.40 s vs 3.23 s, and post 1.23 s vs 1.83 s. Home is a tie within noise.

### Structured data and footprint

- **Richer Organization schema.** Impact's schema has `legalName`, `numberOfEmployees` (1,100), 4 `hasCredential` entries, `memberOf` (BOMA Canada, ISSA, RCO) and `knowsAbout`, on every page checked. Evergreen's has none of these. None of this produces a rich result in Google, but it is a clearer statement of who the business is.
- **Two real Ontario offices.** Etobicoke (21 Goodrich Rd) and Burlington (1162 King Rd) each have their own `LocalBusiness` node with address, phone and hours. Only Etobicoke has map coordinates. The Vancouver and Calgary "offices" in the footer are links only, with no address. Evergreen has one office, so this is a fact of the business, not something to copy.
- **More body copy on the service page.** Comparing main content only, Impact's `/office-cleaning` has 2,683 words against Evergreen's 1,707 (about 1.6x), and 29 H3 subheadings against 11.

## 4. Where Evergreen is ahead

Only the wins that survived the second check are listed here, and each is stated at its checked size.

- **Location pages with real local detail.** `/locations/mississauga/` names Hurontario, Airport Corporate Centre, Meadowvale, Lisgar, East Credit, City Centre, Port Credit, Streetsville and others. Impact's Mississauga office page uses "Mississauga" 26 times and names none of 20+ local places tested. Evergreen's doorway risk is lower than Impact's, not zero: its location pages share a similar proportion of text with each other.
- **Security headers.** Evergreen sends HSTS, an enforced baseline CSP plus a full report-only CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` and `Permissions-Policy`. Impact's home sends none of them. This is security hygiene, not a ranking factor.
- **One consistent address and local schema.** All 85 crawled pages carry 243 Queen St W and +1-416-803-4880, and `/llms.txt` matches. The home schema has coordinates, opening hours, `hasMap` (the Google Maps link) and 15 service areas. Impact's per-office details are also consistent, so the edge is `hasMap` plus city-level `areaServed`, not consistency alone.
- **Accessibility.** Evergreen scores 100 in every run. Impact scores 87-89, failing colour contrast (32-46 elements) and link names.
- **Images.** Evergreen passes the modern-format and responsive-image audits in every run. Impact's home and office pages carry three large PNGs, with an estimated 659 KiB of savings available.
- **Service schema.** 22 Evergreen pages carry a `Service` node. No Impact service or city page checked has one. This gives no rich result, so the practical edge is small.
- **Blog guide sources.** `/how-often-should-an-office-be-cleaned/` links CCOHS, ontario.ca and canada.ca and labels its schedules "not mandatory". Impact's matched post also has a table and is longer, so the edge is the linked government sources and the honest disclaimer, not length.
- **Accurate metadata.** Impact's `/ontario/brampton/commercial-restroom-cleaning` carries a retail-cleaning description, and its Burlington and Muskoka pages say "Trusted by Toronto's top commercial property managers". A scan of Evergreen's crawl found no mismatched descriptions.
- **Mobile action bar.** Evergreen has a fixed two-button bottom bar (Call and Free quote) on every mobile page. Impact has a sticky call-only strip at the top. Evergreen's is somewhat better, but this is a small difference.
- **Stated AI-crawler policy.** Evergreen's robots.txt names the AI crawlers with Content-Signal lines, and `/llms.txt` returns 200. Impact has no AI policy, but its robots.txt allows every crawler anyway. Access is the same on both sites; Evergreen's policy is only clearer.

### Claims dropped or reduced to parity after checking

These were claimed as Evergreen wins but do not hold up. Do not repeat them:

- **"Impact's firewall blocks crawlers."** It blocked our self-declared audit bot. Normal browsers and Lighthouse loaded every Impact page. There is no evidence that Googlebot is blocked.
- **"Evergreen's sitemap dates are honest, Impact's are bulk-stamped."** Both sites cluster dates. Evergreen's 13 Nov cluster comes from today's URL move.
- **"Cleaner redirects."** Both sites are clean. One Evergreen exception: `http://evergreencleaningservice.ca/services/office-cleaning` takes 2 hops.
- **Breadcrumb schema and "policy-compliant ratings".** Impact has both too. This is parity.
- **"Unique titles across the site."** True for Evergreen, but Impact was never measured site-wide.
- **"Review schema on /reviews/".** There is none. The page shows dated, Google-attributed quotes as text only.
- **"Location page shows the form and local copy in the desktop fold".** Refuted. Impact's form loads after the first mouse movement, at the same height as Evergreen's, and Evergreen's local copy sits below the desktop fold.
- **Home-page LCP and best practices.** Both are ties within noise. Impact's Mississauga "SEO 0 / best practices 0" in `medians.txt` was a Lighthouse tool error, not a score.
- **"Transparent scope" on the service page.** Impact's page has comparable scope, cost and quality-control sections. Only Evergreen's explicit "Scope and limits" framing is distinctive.

## 5. What Evergreen should do to beat Impact

Ranked by likely effect on enquiries and local ranking. "Client" means you or your staff supply facts. "Marketer" means whoever writes copy and runs Google accounts. "Developer" means whoever changes the site code.

| # | Action | Owner | Effort | Where in the repo |
|---|---|---|---|---|
| 1 | **Get fresh Google reviews, then show the real count.** Ask current clients for reviews, because 4 of the 7 shown are from 2020-21. Once the number is worth showing, add the real Google rating and count to a slim strip above the header, linked to your Google listing. Do not add `aggregateRating` markup: Google does not show stars for a business's own reviews of itself. | Client (asking), developer (strip) | Client: ongoing. Developer: half a day. | `src/components/Header.astro`, `src/components/home/Reviews.astro`, `src/data/reviews.ts` |
| 2 | **Name your people.** Add a team section with the owner and supervisors, each with a role, years with the company and, if they agree, a photo. Credit the five long-form 2026 guides to a named author. The schema plumbing is already in the working tree and fills itself once real entries exist. The list is deliberately empty until you supply names and permission. | Client (names, permission, photos), developer (page) | Client: 1 hour. Developer: about 1 day, mostly done. | `src/data/people.ts` (uncommitted), `src/lib/schema.ts`, `src/layouts/PostLayout.astro`, `src/layouts/GuideLayout.astro`, `src/pages/about-us.astro` or a new `src/pages/team.astro` |
| 3 | **Ship the Google Tag Manager deferral, and clean the container.** The working tree already changes the fallback to 15 s after page load (`GTM_FALLBACK_MS = 15000`). Commit it, deploy it, then re-run Lighthouse on both sites on the same day with the same script. The lab still showed the Ads tag running at about 6-7 s, so check which trigger fires during a Lighthouse run; the `scroll` listener is a likely candidate. Separately, list every tag in the GTM container and remove duplicates, so the Ads and DoubleClick tags fire only where needed. Trade-off: visitors who leave without touching the page within 15 s will not be counted in GA4. | Developer (loader), marketer (container) | Developer: 1-2 hours plus re-test. Marketer: 1-2 hours. | `src/lib/gtm-loader.ts`, `tests/gtm-loader.test.ts`, `src/components/GoogleTagManager.astro`, `src/lib/ga4.ts` |
| 4 | **Write 2-3 real case studies** with client permission: building type, square footage, schedule, scope and one measured result. Impact has one thin case study, so two good ones would beat it. | Client (permission, facts), marketer (writing) | 1-2 days | New pages, or `src/content/projects/` if that collection fits |
| 5 | **Make `/about-us/` quotable.** Add a dated timeline (1989 founding, the rename, milestones, the 2026 rebuild), a "Last updated" date, a facts list and 6-8 question headings. Most of the facts already exist. They need restructuring, not new claims. | Marketer, client (dates) | About 1 day | `src/pages/about-us.astro` |
| 6 | **List only credentials you hold.** Add WSIB, insurer, bonding and the ECOLOGO product line with the issuer named. If you join BOMA Toronto or pursue ISSA CIMS, add them once they can be shown. This is a business decision and a long-term one. | Client | Small to list. CIMS is months. | `credentials` and `memberships` in `src/data/people.ts` |
| 7 | **Put proof and people in the hero.** Add a proof row under the hero buttons (rating, 35+ years, insured and bonded, any real membership) and an original photo of your own crew at work, with their consent. | Client (photo), developer | Half a day after the photo exists | `src/components/home/Hero.astro` |
| 8 | **Strengthen the home page.** Add a short home FAQ written from real customer questions, and a written service promise, only if you will honour it. Visible FAQ is for readers: FAQ rich results are no longer shown. | Marketer, client (the promise) | 1 day | `src/pages/index.astro`, `src/components/home/` |
| 9 | **Add depth to service pages where buyers ask questions,** such as task lists by area, what a typical night shift covers, and how quality is checked. Use original copy, not length for its own sake. | Marketer | 1-2 days per page | `src/content/services/` |
| 10 | **Small technical tidy-ups.** Make the 2-hop redirect from `http://` apex `/services/office-cleaning` a single hop. Re-fetch the 5 URLs the crawl missed (`/locations/brampton/`, `/locations/markham/`, `/insights/` and 2 posts). Consider a longer browser cache on the image host (now 30 days). Move the CSP from report-only to enforced once reports are clean. | Developer | Half a day | `src/data/redirects.ts`, `src/worker.ts`, `public/_headers` |
| 11 | **Shorten the first step of the quote form** (name, contact, building address; the rest optional), with a "prefer to talk? call" line under it. Field-level friction was not fully verified on either site. | Developer, marketer | Half a day | `src/components/QuickQuoteForm.astro`, `src/components/ContactForm.astro` |

Already done and worth keeping: the preconnect to the image host and the font preload (`src/layouts/BaseLayout.astro`), the mobile action bar (`src/components/MobileActionBar.astro`), and modern responsive images.

### Patterns to copy vs content that must stay original

| Copy the pattern | Keep it original |
|---|---|
| A team page with names, roles and photos | Your own people, with their consent. Never placeholder or stock "staff". |
| A named Person author on guides | The author's real bio and credentials |
| A facts page with a "Last updated" date | Your own facts: 1989, 243 Queen St W, WSIB, hours |
| A dated history timeline | Your own milestones |
| A review count in a top strip | The real Google number, linked to the listing |
| A proof row and a crew photo in the hero | Your own photo and figures. Never Impact's wording, images or stats. |
| Case studies with size, schedule and result | Real clients, with permission |
| Organization schema with credentials and memberships | Only credentials that can be shown |
| Deferring tracking until interaction | Your own loader, tested so forms and tap-to-call still work on first tap |

### Impact tactics not to copy

- **The city-by-service matrix.** Impact has 178 city-by-service pages (139 in Ontario, 39 in BC and Alberta) plus city hubs. The content specialist found they are not simple city-name swaps. But they look like doorway pages in purpose: an identical shell that says "Trusted by Toronto's top commercial property managers" even on Burlington and Muskoka pages, keyword-template headings ("A Cleaning Company Mississauga Businesses Can Rely On"), no local places, clients or crews, and a mismatched meta description. Coverage is also uneven (Toronto 36 pages, Calgary 19, many cities a hub only). Keep Evergreen's 11 location pages. Add a city-by-service page only where you have real local proof such as a client, a building or a crew.
- **Unsourced claims in the fold:** "Award Winning" with no award named, or a review count with no link to its source.
- **Testimonials that are not client proof,** such as a quote from your own cleaner presented as a testimonial.
- **Heavy uncompressed PNG hero images.**
- **Delaying every script through a plugin** without checking that forms and click-to-call still work on first tap.

## 6. Data limits

- **No backlink data.** The Moz quota is exhausted, so neither site's links or domain authority were measured. Impact is 70 years old and national, and may well have a much stronger link profile, but that is not known. Every authority judgement in this report rests on what is visible on the pages.
- **No Google ranking data.** The search tool available here uses a non-Google index, and in this session the ranking queries were not run at all. This report makes no claim about who ranks where for "office cleaning Toronto" or any other search, or in the map pack. Check with a rank tracker or a logged-out Canadian Google search.
- **Lab variance, and no field data.**
  - All speed figures are Lighthouse lab runs: 3 per page, and only 2 valid runs for Impact's office page.
  - Evergreen's TBT was 313-357 ms on 11 Nov and 480-633 ms on 13 Nov, with no code change in between. The cause (a container change, Google's served script or the lab machine) is unresolved.
  - Evergreen's Mississauga LCP ranged from 2.84 s to 4.37 s across runs.
  - Impact's firewall returned 403 on some of its own fonts and images during the lab runs, so the two sites' lab conditions were not identical.
  - No real-user (CrUX) Core Web Vitals data was used for either site, and Impact's after-interaction responsiveness (INP) was not measured.
- **Impact's pages were sampled.** The saved crawl was blocked for our self-declared bot, so the specialists used the saved home page plus about 20 public pages fetched one at a time. Only 7 of 178 city-by-service pages and 1 of 22 blog posts were inspected.
- **Impact's claims are not verified.** CIMS-GB with Honours, "53+ 5-Star Google Reviews", 1,100+ staff and 35M sq ft were read from Impact's own pages and not checked with ISSA or Google.
- **Evergreen gaps.** 5 Evergreen URLs failed in the crawl and are unmeasured. The uncommitted working-tree changes (GTM fallback, `src/data/people.ts`, author support) are not deployed and were not part of any measurement.

# Full SEO Audit: www.evergreencleaningservice.ca

Audit date: 6 November 2026. Crawl of 92 URLs (60 indexable), Lighthouse lab runs on 5 pages, desktop and mobile screenshots, 11 specialist reviews (findings/*.md).

## Executive summary

**SEO Health Score: 76 / 100**

| Category | Weight | Score | Source |
|---|---|---|---|
| Technical SEO | 22% | 86 | findings/technical.md (84), findings/sitemap.md (90) |
| Content Quality | 23% | 68 | findings/content.md; findings/sxo.md (58) informs it |
| On-Page SEO | 20% | 82 | findings/onpage.md (86), findings/cluster.md (52) |
| Schema / Structured Data | 10% | 82 | findings/schema.md |
| Performance (CWV) | 10% | 62 | findings/performance.md |
| AI Search Readiness | 10% | 68 | findings/geo.md (66), findings/agentic.md (72) |
| Images | 5% | 82 | findings/images.md |

Supplementary scores, not in the weighted total: Local SEO 56 (findings/local.md), Search Experience 58 (findings/sxo.md), Visual and mobile 80 (findings/visual.md).

**Business type:** local service, hybrid. One office at 243 Queen St W, Toronto; crews travel to Toronto and nine GTA cities. Commercial and office cleaning, B2B, since 1989.

**The short version.** The site is technically clean and well built. Crawlability, indexing, canonicals, redirects, sitemaps, security headers, structured data, alt text and accessibility are all in good order, and the October 2026 rebuild shows in the service and location copy. What holds the site back is not architecture but proof and performance:

1. **Mobile homepage performance is 51** (Lighthouse lab). The Google Tag Manager and gtag scripts block the main thread for about 1.3 s and push the simulated LCP to 6.8 s. The real hero LCP is about 1.5 s, so this is largely a third-party script problem with one fix.
2. **Nobody is named anywhere on the site.** No owner, no account executive, no author. The About page has no people or photos. Every competitor result in the SERPs that was checked shows review volume, scale or a named person.
3. **The cost guide refuses to give a price.** It is titled "2026 Pricing Guide" and every figure is labelled hypothetical. Searchers and AI engines will take a number from HomeStars or a competitor instead.
4. **Third-party proof is thin.** Seven Google reviews, four of them five to six years old; no published case study; every image is stock; no citation found under the current name and phone number on YellowPages or BBB; Facebook, LinkedIn and X still carry "Evergreen Cleaning Service".
5. **Three URLs compete for "commercial cleaning Toronto"** (homepage, commercial-cleaning pillar, downtown Toronto page), and sitewide footer anchors make it worse. Service and location pages link to none of the three 2026 blog guides.

**Top quick wins** (each under a few hours, no client input):

- Defer the GTM loader to first interaction or idle, with immediate triggers on phone taps and form focus.
- Stop the italic Open Sans face loading on the homepage (50 KB in the LCP window).
- Fix the footer anchors in `src/data/site.ts` ("Toronto" to "Downtown Toronto"; repoint "Toronto & GTA"; Richmond Hill and Scarborough as plain text).
- Retitle the cost guide to match its content, or get real bands from the client.
- Add the brand suffix to the 22 bare blog titles; trim 8 long descriptions and the 64-character commercial title.
- Remove the dead WebSite SearchAction; drop the trailing period in the street address; fix the http link on /privacy/; add charset to the HTML Content-Type; add the three guides to llms.txt.
- Link every service page to its supporting guide and back (36-link matrix in findings/cluster.md).

**Data limits.** No field Core Web Vitals (PageSpeed Insights quota was exhausted and no Google credentials were configured), so performance is lab data from this container, one run per page. No Search Console, GA4, Google Business Profile or backlink API access; Search Console figures quoted come from the repository's own docs. No DataForSEO, so no local pack or geo-grid data and no live AI answer sampling. The WebSearch results used for SERP analysis were not Google's own results page. The plugin's own fetch scripts refuse this sandbox's proxy, so crawling and rendering were done with curl, Python and Playwright instead.

## 1. Technical SEO (86)

**Crawlability and indexability.** All 92 crawled URLs return 200; no internal link is broken. 60 pages are indexable; 32 tag and category archives, the PPC landing pages, /search/ and /thank-you/ are correctly noindex. Every indexable page has one H1, `lang="en-CA"`, a viewport tag and a self-referencing absolute canonical. The two paginated /insights/ pages are indexable, self-canonical and deliberately out of the sitemap, which is fine.

**Redirects and legacy URLs.** http to https, apex to www and slashless to slashed are all 301. `/index.html` is a 307. WordPress remnants (`/wp-login.php`, `/xmlrpc.php`, `/wp-content/`, `/feed/`, `/sitemap_index.xml`) return a real 404 or a 301 to the right place. `/?p=123` returns the homepage canonicalised to `/`. The 404 page is a real 404 with noindex.

**Rendering.** Static Astro HTML: text, JSON-LD and the hero image are all present without JavaScript. Three to five small module scripts per page.

**Security and caching.** HSTS (1 year), nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and a report-only CSP on every response. Brotli on HTML and assets, `/_astro/*` immutable for a year, images 30 days in the browser and a year at the edge, HTML revalidated at the Cloudflare edge. Staging hosts are noindexed by hostname and production is never matched.

**Sitemaps.** Two type-split sitemaps under an index, 57 URLs, all 200, indexable and self-canonical; no noindex URL listed; `/sitemap.xml` and the legacy WordPress sitemap both 301 to the index. Lastmod comes from git history, not the build time, but 17 service, industry and location URLs share one timestamp from a shared-template commit.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| Medium | CSP is report-only with `unsafe-inline` and `unsafe-eval` | Enforce the non-script directives (frame-ancestors, object-src, base-uri, form-action) now; drop unsafe-eval after the GTM audit |
| Low | Two `Content-Signal:` lines in robots.txt are what Lighthouse flags as "Unknown directive" (SEO 92 on every page) | Owner decision: keep and document, or remove (allow-all is already the default) |
| Low | 17 sitemap lastmods share a template-commit timestamp | Exclude shared templates from `src/lib/sitemap-lastmod.mjs`; CI check that every URL has a lastmod |
| Low | `/privacy/` links to `http://www.evergreencleaningservice.ca` | Change to https with trailing slash |
| Low | HTML served as `text/html` with no charset | Add `; charset=utf-8` in `public/_headers` (also for /llms.txt) |
| Low | Two-hop redirect for http/apex URLs without a trailing slash | Append the slash in the Cloudflare host redirect rule, or accept |
| Low | One third-party cookie (DoubleClick `test_cookie`) costs Best Practices 79 | Consent-gate remarketing or accept |
| Info | 13 images without width/height (all on the gallery page) | See Images |

## 2. Content Quality (68)

**What works.** Ten service pages (667 to 2,435 words) and two industry pages are specific about scope, scheduling, limits and pricing factors, with FAQ blocks. Readability sits around Flesch 57 to 64, grade 8 to 9. The seven location pages are not city-swaps: only 2 to 12 percent of each body repeats on another location page, and each names real districts, corridors and drive times while stating honestly that the office is in Toronto. Blog "updated" dates match real rewrites in git. The plugin's content-quality scan found no filler or AI-pattern flags, and the metadata-template check came back low risk.

**E-E-A-T.** Experience 45, Expertise 65, Authoritativeness 60, Trustworthiness 80 (the specialist's internal model). The gap is first-hand evidence: no named people, no real photos, no case studies, and insurance, bonding, WSIB and "since 1989" asserted on 24 to 26 pages without a certificate, insurer or dated artefact.

**Search experience.** Page types match intent on all eight core queries checked (commercial cleaning Toronto, office cleaning Toronto, office cleaning Mississauga, janitorial services Toronto, office cleaning cost Toronto, post construction cleaning Toronto, floor stripping and waxing Toronto, medical office cleaning Toronto). The SERPs are dominated by directories (HomeStars, Clutch, BBB, YellowPages) and franchise brands (Coverall, Jani-King, Enviro-Master) that win on review volume and scale claims. Evergreen appeared in none of the result sets. Four buyer personas score 45 to 65 out of 100, with trust the weakest dimension for every persona and the price-seeking small-business owner the weakest overall (45). The floor stripping and waxing SERP is the weakest competition and the best on-page opportunity.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| High | No named person anywhere; all 25 posts are by the Organization; About page names nobody | Owner and account executive(s) on /about-us/ with photos, roles, years; Person nodes in schema; a reviewer line on the 2026 guides (client input, repo item H5) |
| High | Cost guide titled "2026 Pricing Guide" gives only hypothetical figures | Publish real bands by office size and frequency from recent proposals (decision D-D), or retitle to "How Office Cleaning Is Priced in Toronto" |
| High | All imagery is stock; gallery is 71 words of stock photos with job-like filenames; the one real project is an unpublished draft | Photoshoot (H6); 2-3 case studies through the existing /projects/ gate; noindex the gallery until then |
| Medium | Trust claims never evidenced | Proof block: certificate of insurance and WSIB clearance on request, insurer and coverage, screening method; link the ECOLOGO listing |
| Medium | "Commercial cleaning Toronto" split across homepage, commercial pillar and downtown page; footer anchors on 60 pages reinforce it | One primary query per URL; fix `footerAreas` in `src/data/site.ts` |
| Medium | Location pages share one heading outline; Mississauga and Vaughan intros use a different, generic sales voice ("top-tier", "Zero Disruption") | Rewrite the two intros in `src/data/locations.ts`; unique local opening per page |
| Medium | 15 legacy posts untouched since 2019-2023; unsourced "studies show" statistics; "5 Easy Ways" post says "our top three tips" | Fix defects, cite or delete statistics, update or merge in priority order; consider noindexing plants, home-office and fridge posts |
| Medium | Quote form requires about nine fields including full street address before any price | Street address optional, keep postal code, add sq ft / visits per week / washrooms, offer a ballpark by email (decision D-A) |
| Medium | Persona-matched reviews not shown where needed; three homepage testimonials undated and unsourced | Tag reviews by service in `src/data/reviews.ts`; date or drop the testimonials |
| Medium | Thin utility pages: contact 122 words, quote 158, locations hub 229, green-products mostly manufacturer copy | Add "what happens next" and a trust strip; rewrite green-products in house words |
| Low | 18-44% shared boilerplate on service pages; building-maintenance and floor-stripping overlap | Shorten "How it works" to a link on specialty pages; make building-maintenance the hub |
| Low | Footer emits five H2s on every page; homepage uses headings as labels | Styled paragraphs instead |

## 3. On-Page SEO (82)

**What works.** Unique titles and descriptions on all 60 indexable pages, one H1 each, no heading-level skips, zero generic anchors ("read more", "click here"), zero empty anchors, zero nofollow, breadcrumbs on 58 pages, a skip link on all. No orphan pages. Money-page titles carry service and geo cleanly.

**Internal linking gap (from the cluster analysis).** Counting only links in page copy and "related" blocks from indexable pages: no service, industry or location page links to the cost guide, the "how often" guide or the seasonal checklist; the two guides do not link to each other; floor-stripping, industrial, post-construction, emergency, pressure-washing, graffiti, property-management and all eight location pages link to no post at all. Thirteen of 25 posts have no contextual inlink; ten of them are reachable only through /insights/ pagination and noindex tag archives. Five service-style anchors point at /about-us/ or /services/ instead of the commercial pillar. findings/cluster.md has a 36-link matrix with anchors and the exact `related` arrays to edit.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| Medium | Money pages do not link to the blog guides; 13 posts without contextual inlinks | Apply the link matrix in `src/content/services/*.md` and the blog front matter |
| Medium | Thin pages (gallery 71 words, contact 122, quote 158, locations hub 229) | Caption or noindex the gallery; a paragraph per city on the hub |
| Low | 22 blog titles have no brand suffix; three suffix patterns in use | One pattern set in the layout |
| Low | Six titles over 60 characters (commercial-cleaning 64); eight descriptions 161-170 | Trim; keep the call to action early |
| Low | Legacy hook descriptions ("Here we discuss…", "Do your floors sparkle?", contact page "We'd love to hear from you") | Answer-first summaries |

## 4. Schema and Structured Data (82)

**Current implementation.** One coherent JSON-LD graph on every page: ProfessionalService (`#organization`) with address, geo, hours, ten areaServed cities, sameAs, contactPoint and a ten-item offer catalog whose Service @ids resolve to real nodes; WebSite; BreadcrumbList valid on 90 pages; Service + WebPage on 19 pages; FAQPage on 20 pages with all 78 Q&As matching visible text; BlogPosting complete on 25 posts; CollectionPage on hubs. No parse errors, duplicate @ids or deprecated types. AggregateRating is correctly omitted: self-serving LocalBusiness reviews earn no stars, and the Google Business Profile is the real lever.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| Low | WebSite SearchAction targets /search/, which is noindex and JavaScript-only; Google retired the sitelinks search box in 2024 | Remove `potentialAction` in `src/lib/schema.ts` |
| Low | `logo` and `image` are the same 884x265 banner | Square 512 px logo; real photos as an `image` array after the shoot |
| Low | BlogPosting image is 2:1 on 23 posts; dates at midnight UTC | Pass `[ogImage, featureImage]`; date-only or offset-aware dates |
| Low | Breadcrumb root is "Home" on two posts and the site name elsewhere; location Service nodes thinner than service-page ones; `streetAddress` has a trailing period | Consistency fixes; drop the period if the Google listing has none |
| Info | FAQPage earns no rich result since May 2026 | Keep the visible FAQs; add no more markup; keeping the JSON-LD is harmless |
| Info | HowTo, VideoObject, ImageObject considered and not recommended | No action |

## 5. Performance (62)

**Lab results** (Lighthouse 12.8, this container, one run per page; no field data available):

| Page | Mobile perf | LCP (simulated) | LCP (observed) | TBT | CLS |
|---|---|---|---|---|---|
| Homepage | 51 | 6.8 s | 1.5 s | 1,316 ms | 0 |
| Homepage (desktop) | 97 | 1.2 s | 1.3 s | 42 ms | 0.005 |
| /services/office-cleaning/ | 88 | 1.6 s | 0.8 s | 453 ms | 0 |
| Blog post | 86 | 1.3 s | 0.7 s | 536 ms | 0 |
| /locations/mississauga/ | 83 | 2.4 s | 1.0 s | 587 ms | 0 |

**What works.** CLS is 0. The hero is correctly built: AVIF/WebP sources, 14.8 KB mobile crop, dimensions, `fetchpriority="high"`, preconnect to the image host; only slide 1 loads eagerly. All CSS is inlined so nothing blocks render. Site JavaScript is about 9 KB. reCAPTCHA loads only on form intent, the video widget only after load. Caching and compression are right.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| High | GTM + gtag (351 KB) block the main thread for 1,345 ms on the mobile homepage, with a single 962 ms long task; inner pages still pay about 500 ms | Defer the GTM loader to first interaction or idle (~4 s) in `src/components/GoogleTagManager.astro`, with immediate triggers on `tel:` pointerdown and form focus; one Google tag for Ads + GA4 in the container; prune unused tags. Agree the measurement trade-off with the Ads owner and watch conversions for a week. Not recommended: Partytown, server-side tagging as a first step, extra preconnects to doubleclick/google.com |
| Medium | Simulated LCP 6.8 s vs observed 1.5 s: about 330 KB of contending bytes (two 50 KB fonts, logo, hero, gtm.js) in the first second on the throttled profile | Remove the competing bytes (above and below); optional mobile hero preload; re-measure |
| Medium | Italic Open Sans (50 KB) fetched at very high priority on the homepage only because testimonial `<cite>` defaults to italic | `.tes-name { font-style: normal }`; scope the italic face to post pages |
| Medium | INP unmeasured; long third-party tasks and a ~700 KB reCAPTCHA burst on first form touch are the risks | Add web-vitals RUM; consider Turnstile (already supported in the Worker) |
| Low | Service-card `sizes="100vw"` picks the 768 variant for a 380 px card (~25-30 KB); Cloudflare Insights beacon (10 KB) injected at the edge | Fix sizes and add a 640w variant; switch the beacon off if GA4 is the system of record |

Note: the repository's own earlier test reached 86 with GTM blocked, not the 93-99 quoted in the growth docs, so treat the upper range as optimistic until measured.

## 6. Images (82)

0 of 233 images are missing alt text; alt text and file names are descriptive. Most images ship AVIF and WebP through `<picture>` with srcset and sizes, dimensions on 220 of 233, lazy loading below the fold, on a dedicated host with 30-day browser and 1-year edge caching. Every page has an og:image.

| Severity | Finding | Fix |
|---|---|---|
| Medium | Gallery serves 13 full-size JPGs (about 1.1 MB) with no responsive variants or dimensions | Run them through the existing pipeline; add captions |
| Medium | Blog archive and related-card thumbnails are 300x150 WordPress crops stretched to 382 px (32 occurrences), visibly soft | 480-768 px AVIF/WebP with srcset |
| Low | Mobile hero is 640 px wide (about 1.55x on a Pixel 7); three homepage cards oversized | Add an 828/960w hero variant; fix card sizes |
| Low | 20 pages share one generic OG image; header logo has a non-transparent background | Per-service OG images; transparent SVG/PNG logo |

## 7. AI Search Readiness (68)

**Access.** Every AI crawler is allowed: a wildcard group plus a named group of 13 bots, both with `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. Live fetches with nine AI user agents returned the full page (spoofed agents, so Cloudflare's treatment of verified bots is unconfirmed). Content is in the server HTML. llms.txt is present, spec-compliant and accurate; no llms-full.txt, Markdown alternates, ai-catalog.json or .well-known files. Accessibility 100; the hand-computed Lighthouse agentic fraction is 3/3 (unconfirmed).

**Citability.** /how-often-should-an-office-be-cleaned/ is the model page: direct first-sentence answer, two tables, seven FAQs, dated official sources, visible publish date matching schema. The commercial-cleaning pillar has a definition and a comparison table. The cost guide has the structure but no number.

**Issues**

| Severity | Finding | Fix |
|---|---|---|
| High | Cost guide gives AI engines nothing to quote | Real bands with a "pricing data last reviewed" date (client input) |
| High | Weak off-site entity: no Wikidata item, social slugs and names carry the former name, no YouTube, no citations found under the new NAP | Rename social display names with a "formerly" line; claim Bing Places, Apple Business Connect, Yelp, YellowPages, BBB, Board of Trade, BIA, BSCAI/ISSA under the new name |
| High | reCAPTCHA v2 blocks any agent-completed quote; the honeypot returns a fake success to a naive agent | Document the email/phone fallback on the quote page and in llms.txt now; evaluate Turnstile; later a verified-agent path |
| Medium | Homepage has no "Evergreen Office Cleaning is…" sentence; office-cleaning definition sits under "Who it is for"; commercial definition is the second section; Trustindex boilerplate repeated seven times | One definitional sentence in the hero; rename the heading to "What is office cleaning?"; move the definition first; render the Trustindex note once |
| Medium | llms.txt omits the three 2026 guides; "within 2 hours" lacks the office-hours qualifier the guides use; served without charset | Add a Guides section; qualify the promise everywhere; charset header |
| Medium | Few first-party facts; stock imagery; no topical video | 3-5 dated company facts on /about-us/ and in llms.txt; real photos; 2-3 short YouTube clips with VideoObject |
| Low | Seven identical "Read more" buttons; empty corner `<th>` in the commercial-cleaning table; Bing Webmaster Tools and IndexNow unconfirmed | Specific accessible names; caption and header text; verify Bing and submit the sitemap |

## 8. Local SEO (56, supplementary)

NAP is identical on all 92 pages, in schema, llms.txt and the footer, and hours match the Google listing. The seven location pages pass the doorway-page test. The gaps are off-site and proof-related: no Google Maps embed; seven reviews with the newest from September 2026 and no visible rating or count; no citation found under the current name on YellowPages or BBB; Facebook and LinkedIn still use the former name; no case study, client or geotagged photo on any location page; no certificate of insurance or WSIB proof; no BIA, BSCAI, chamber or Board of Trade links. Richmond Hill, Pickering, Ajax, Oshawa, Scarborough, North York, East York and York are claimed in copy and the GBP service area but have no page (the footer's Richmond Hill and Scarborough links go to the bare hub). The street address is written with a trailing period on the site and without one on the listing. The sitemap and local specialists both recommend building North York and Scarborough first, each only with unique local material, and one Durham Region page only if the client confirms crews travel there. Unverified: GBP category, photos, posts, review count and rating, and whether the office is a shared space (a visible-address eligibility risk).

## 9. Visual and mobile (80, supplementary)

Above the fold on mobile the H1, value proposition, quote and call buttons and three trust ticks are all visible; no horizontal overflow at 1366, 412 or 360 px; the menu and the sticky call/quote bar work cleanly; accessibility is 100. Issues: the floating video bubble appears about 2.5 s after load and at 360 px overlaps the "WSIB covered" trust tick; blog thumbnails are soft 300x150 crops and every card is labelled "BLOG"; the Mississauga hero has no trust row and a generic ceiling-cleaning photo; the quote form's input borders are faint and City/Province/Postal code are not marked required; footer and contact text links and the 18 px checkboxes are small tap targets; the logo has a non-transparent background. Extra captures are in screenshots/extra-*.png.

## 10. Content architecture (52, supplementary)

Seven topic clusters plus the location layer. Office cleaning is the best-covered cluster but its hub links to only two of eight posts. The cost and buying-guide cluster has the highest commercial value and zero contextual inlinks. Floor care is broken (the floor post links to no floor service and the floor service links to no post). Disinfection links to none of its three posts. Property management and industrial have no supporting posts. Three posts (plants, home office, fridge) have no service fit. SERP overlap checks: "how often should an office be cleaned" and "office cleaning frequency" are one page; "office cleaning checklist" and the seasonal checklist are separate pages, and a general checklist is a gap; one cost guide can cover commercial and office cost with a section each. Ten prioritised content briefs, eight retitles, two merges and the 36-link matrix are in findings/cluster.md. Do not move the posts under /insights/.

## Appendix: how this audit was run

- Crawl: Python requests + BeautifulSoup, 5 concurrent, 1 s delay, robots respected (allow-all), 92 URLs; index at raw/crawl/pages.json.
- Lab performance: Lighthouse 12.8.2 with the pre-installed Chromium, mobile and desktop presets; raw/lighthouse/ (kept locally, not committed).
- Screenshots: Playwright, 1366x768 desktop and Pixel 7 mobile, fold and full page; screenshots/.
- Specialist reviews: technical, sitemap, content, schema, performance, visual, GEO, agentic, local, SXO, cluster; findings/.
- Google updates ledger checked since May 2026 (status: fresh, verified 2026-10-22). No traffic data was analysed, so no update correlation was attempted.
- The saved HTML in raw/crawl/html is decoded as Latin-1 (the server sends no charset); the live site serves correct UTF-8. Treat mojibake in the raw files as a crawler artefact.

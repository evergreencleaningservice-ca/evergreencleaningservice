# Action Plan: www.evergreencleaningservice.ca

Prioritised from the 6 November 2026 audit (SEO Health Score 76/100). Severity definitions: Critical blocks indexing or causes penalties; High significantly affects rankings or conversions; Medium is an optimisation; Low is backlog. Nothing Critical was found.

"Client" items need facts or decisions only the business owner can supply; they are listed with the repo's existing decision labels (H5, H6, D-A, D-D, C6) where they match.

## Phase 1: Critical fixes (Week 1)

| # | Severity | Action | Where | Owner |
|---|---|---|---|---|
| 1 | High | Defer the GTM loader to first interaction or idle (~4 s), with immediate triggers on `tel:` pointerdown and any form focus. Agree the measurement trade-off with the Ads owner; watch Ads and GA4 conversions for a week after shipping. | `src/components/GoogleTagManager.astro` | Dev + Ads owner |
| 2 | Medium | Stop the italic Open Sans face loading on the homepage: `.tes-name { font-style: normal }` and scope the italic `@font-face` to post pages. | `src/components/home/Testimonials.astro`, `src/styles/fonts.css` | Dev |
| 3 | Medium | Fix the sitewide footer anchors: "Toronto" to "Downtown Toronto"; repoint or remove "Toronto & GTA"; make "Richmond Hill" and "Scarborough" plain text until pages exist. | `src/data/site.ts` (`footerAreas`) | Dev |
| 4 | High | Cost guide: either publish Evergreen's real price bands by office size and frequency (client decision D-D) or retitle to "How Office Cleaning Is Priced in Toronto" so the title matches the page. | `src/content/blog/office-cleaning-cost-toronto-guide.md` | Client + Dev |
| 5 | Low | Fix the `http://` link on /privacy/; add `Content-Type: text/html; charset=utf-8` (and `text/plain; charset=utf-8` for /llms.txt); remove the WebSite SearchAction; drop the trailing period in "243 Queen St W." if the Google listing has none. | privacy page source, `public/_headers`, `src/lib/schema.ts`, `src/data/site.ts` | Dev |
| 6 | Medium | Enforce the non-script CSP directives (frame-ancestors, object-src, base-uri, form-action); keep script-src relaxed until the GTM container is audited. | `public/_headers` | Dev |
| 7 | Medium | Internal links: apply the 36-link matrix so every service page links to its supporting guide and back, the cost and "how often" guides link to each other, and the five mis-targeted anchors point at the commercial pillar. | `src/content/services/*.md` `related` arrays, blog front matter | Dev |

## Phase 2: High-impact improvements (Weeks 2-3)

| # | Severity | Action | Where | Owner |
|---|---|---|---|---|
| 8 | High | Named people: owner and account executive(s) on /about-us/ with photo, role and years in the trade; put the account executive's name in the "reply within 2 hours" block; Person nodes (`founder`, `employee`) in schema; a reviewer line on the 2026 guides. (H5) | `src/content/pages/about-us.md`, `src/lib/schema.ts`, post layout | Client + Dev |
| 9 | Medium | Proof block: "Certificate of insurance and WSIB clearance available on request", insurer and coverage amount, bonding provider, screening method; link the ECOLOGO listing from the green-products page. | `about-us.md`, quote page, `green-clean-products.md` | Client + Dev |
| 10 | High | Reviews: run the approved review kit weekly; get the true Google count and rating and show it as visible text next to the trust ticks; tag reviews by service and show the matching one on the clinic, floor, post-construction and property-management pages; date or drop the three undated homepage testimonials. (C5) | `src/data/reviews.ts`, trust bar component, `Testimonials.astro` | Client + Dev |
| 11 | High | Citations under the new name: check the Google Business Profile name, category and shared-office status; claim Bing Places, Apple Business Connect, YellowPages.ca, Canada411, Yelp, HomeStars, BBB, Clutch with the exact NAP (search first to claim or merge old "Evergreen Cleaning Service" listings); rename the Facebook, LinkedIn and X display names with a "formerly" line. (C6) | Off-site | Client / account owner |
| 12 | Medium | Quote form: make the street address optional, keep postal code, add approximate sq ft, visits per week and number of washrooms; offer "get a ballpark by email" before the walkthrough; add a one-line "for assistants" fallback (email/phone) on the quote page and in llms.txt. (D-A) | `src/components/ContactForm.astro`, `public/llms.txt` | Client + Dev |
| 13 | Medium | Evaluate switching reCAPTCHA v2 to Turnstile (already supported in the Worker) to remove the checkbox blocker and the first-touch script burst. | `src/worker.ts`, `src/components/Recaptcha.astro` | Dev |
| 14 | Low | Titles and descriptions: one brand-suffix pattern set in the layout; trim the 64-character commercial title and the eight descriptions over 160; rewrite the legacy "Here we discuss…" descriptions and the contact page description. | layout, blog front matter, `contact-us.md` | Dev |
| 15 | Medium | AI readability: one "Evergreen Office Cleaning is…" sentence in the homepage hero; rename the office-cleaning `fitHeading` to "What is office cleaning?"; move the commercial-cleaning definition section first; render the Trustindex note once; add a Guides section to llms.txt and qualify "within 2 hours" with office hours everywhere. | `Hero.astro`, `src/content/services/*.md`, reviews component, `public/llms.txt` | Dev |
| 16 | Medium | Location pages: rewrite the Mississauga and Vaughan intros in the house voice; give each page a unique local opening; add the trust tick row to the location hero. | `src/data/locations.ts`, location hero component | Dev |

## Phase 3: Content and authority (Month 2)

| # | Severity | Action | Where | Owner |
|---|---|---|---|---|
| 17 | High | Photoshoot: crews in uniform, the van, before/after of a stripped-and-waxed floor, a post-construction handover, a clinic operatory. Publish 2-3 case studies through the existing `/projects/` gate and link each from its service page. Until then, noindex or honestly caption the stock gallery. (H6) | `src/content/projects/`, `cleaning-demo-gallery.astro` | Client + Dev |
| 18 | Medium | Floor stripping and waxing page: Toronto $/sq ft bands for strip-and-wax vs scrub-and-recoat, a before/after pair, a sample annual lobby cycle. This is the weakest competing SERP. | `src/content/services/floor-stripping-waxing.md` | Client + Dev |
| 19 | Medium | Clinic page: state crew IPAC training, colour-coded cloths and the sign-off log; add a clinic testimonial; downloadable IPAC-aligned checklist. Post-construction page: target commercial/contractor intent in the title and H1, add phase-based pricing explanation. | `src/content/industries/medical-dental-clinics.md`, `post-construction-cleaning.md` | Client + Dev |
| 20 | Medium | Legacy blog pass: fix "our top three tips" and "Microfiber rubs"; cite or delete the unsourced statistics; update or merge the 15 untouched posts (dental, retail, day vs night, deep cleaning, dusting first); merge hand-washing into the germs post and plants into air quality; noindex or remove the home-office post after checking its traffic; retitle the eight posts listed in findings/cluster.md without changing URLs. | `src/content/blog/*.md` | Dev + Client |
| 21 | Medium | New content, in order: office cleaning checklist; warehouse cleaning guide; post-construction checklist; how often to strip and wax floors; condo common-area checklist; dental IPAC checklist rewrite; cleaning RFP template; winter salt on commercial floors; green cleaning certifications. One per month on commercial topics, each linked from its service page. | `src/content/blog/` | Dev + Client |
| 22 | Medium | Local links: the BIA that covers 243 Queen St W; BSCAI and ISSA Canada member directories; Toronto Region Board of Trade and the Mississauga, Brampton, Markham and Oakville boards or chambers; property-manager approved-vendor pages; supplier partner pages. No bought links. | Off-site | Client |
| 23 | Low | Images: gallery and related-card images through the AVIF/WebP pipeline with dimensions; 828/960w hero variant; fix service-card `sizes` and add a 640w variant; per-service OG images; square 512 px logo for schema and a transparent header logo. | `scripts/images.mjs`, `ServicesOverview.astro`, `src/data/site.ts` | Dev |
| 24 | Low | Mobile polish: delay or hide the video bubble on the homepage hero under 480 px and give its close button a 44 px hit area; 44 px tap areas on footer and contact links and the form checkboxes; darker input borders; mark required address fields; replace the "BLOG" card label with the date or category. | `LeadVideo.astro`, global styles, insights index | Dev |
| 25 | Low | New location pages only with unique local material: North York and Scarborough first; Richmond Hill if there is real work there; one Durham Region page only if the client confirms crews travel there. Add the four Toronto districts to `areaServed`. | `src/data/locations.ts`, `location-local.ts`, `schema.ts` | Client + Dev |

## Phase 4: Monitoring and iteration (ongoing)

| # | Action |
|---|---|
| 26 | Add real-user monitoring (web-vitals library or the GTM container) to collect field LCP, INP and CLS; re-run Lighthouse 3-5 times per page after the GTM change and compare medians. |
| 27 | Search Console: watch the "commercial cleaning Toronto" query across the three URLs after the anchor fix; track impressions by city before building new location pages; confirm the `generate_lead` key event with the first real lead. |
| 28 | Check Cloudflare AI Crawl Control allows verified AI bots and that managed robots.txt is off; verify Bing Webmaster Tools and submit the sitemap; consider IndexNow pings in the deploy script. |
| 29 | Sitemap: exclude shared templates from lastmod sources; CI check that every URL has a lastmod and that the deploy checks out full git history; spot-check the first Worker-published live post. |
| 30 | Decide on the Content-Signal lines (Lighthouse SEO 92) and the FAQPage JSON-LD; switch the CSP to enforcing after two clean weeks of reports; switch off the Cloudflare Insights beacon if GA4 is the system of record. |
| 31 | Review cadence: aim for steady monthly Google reviews; reply to each; show the ISO month rather than "N months ago" so labels do not go stale between builds. |
| 32 | Quarterly re-audit; capture a drift baseline once the plugin can fetch through the proxy. |

## Items this audit could not verify

Field Core Web Vitals; Search Console and GA4 data; Google Business Profile category, photos, posts, review count, rating and shared-office status; backlinks and brand mentions; whether the WSIB, bonding, insurance and 1989 claims are documented; Cloudflare bot settings; live AI answers on any platform.

# Action plan after the re-audit (82/100)

The order follows impact and who can act. Items 1–3 correct problems introduced by today's own fixes. Everything in Phase A can be done by a developer now, without client input.

## Phase A: developer, now (about a day)

**Correct today's regressions**
1. **Paid-visit call tracking:** in `src/components/GoogleTagManager.astro`, load the GTM container immediately on `/lp/*` and whenever the URL carries `gclid`, `gbraid` or `wbraid`, and keep the deferral for everyone else. Correct the comment that says conversions fire on `click_to_call`: the container has no such trigger. Add a test for the paid-visit branch.
2. **Service-area count:** in `src/content/services/commercial-cleaning.md` line 190, change "ten GTA municipalities" to "nine other GTA municipalities", and link North York, Scarborough, Richmond Hill and the Durham page where they are named.
3. **Homepage claim:** in `src/components/home/WhyEvergreen.astro`, change "each written into every contract since 1989" to "four commitments we make to every client". Qualify the 2-hour reply as "during office hours (Mon–Fri, 7am–6pm)" there, in `Hero.astro` and in `public/llms.txt`.

**Honesty and proof framing**
4. **Location pages:** stop showing the same review as "What a client says" on several city pages. Show a review only where the reviewer is in that area; otherwise use a neutral "What clients say" strip. Remove the unconfirmed operational line from the Durham FAQ ("Crews come out on fixed evenings…") until the client confirms it.
5. **Gallery:** add "Illustrative stock photographs" to the /cleaning-demo-gallery/ intro.
6. **Unsourced claims:** cite or delete the dust-mite figure, and fix the typo "may no appreciate", in the day/night post. Do the same for "According to experts" in the products-not-to-mix post.

**On-page, schema and machine-readable files**
7. **Cost guide title:** put "cost" back into the cost guide's title and H1, honestly: "Office Cleaning Costs in Toronto: How Pricing Works".
8. **Metadata lengths:** trim the six descriptions over 160 characters and the two titles over 60 (Durham, checklist).
9. **Schema:** add North York and Scarborough (plus East York and York) to the organisation's `areaServed`. Type Durham as `AdministrativeArea`. Use the site name as the breadcrumb root on the three guides.
10. **llms.txt:** add the checklist and the four new location pages to `public/llms.txt`, with a test that keeps it in step with `src/data/locations.ts`.
11. **Charset:** serve HTML as `Content-Type: text/html; charset=utf-8` in `public/_headers`.
12. **Agent fallback:** make the email and phone in the quote page's fallback sentence real `mailto:` and `tel:` links, and repeat them in the CAPTCHA error message.

**Internal links and structure**
13. **Internal links:**
    - Add reverse links to the five posts that have no contextual inlink.
    - Add the pillar → deep-cleaning link (matrix row 4).
    - Repoint the two misdirected anchors.
    - Vary the templated closing sentence used by 18 posts.
14. **Markup and layout:**
    - Change the footer H2s to `<p>` (`Footer.astro`).
    - Drop the "In this guide" H2 from the cost guide.
    - Keep the office-cleaning definition only under its H2.
    - Make "East York" and "York" plain text.
15. **Tap targets:** give footer, area and "Read more" links at least 44 px of height.

Verify after the deploy: `npm test`, `npm run seo:drift` (record a new baseline afterwards), and a check that `gtm.js` loads at once on `/lp/commercial-cleaning-quote/?gclid=test` and stays deferred on `/`.

## Phase B: around 12 November (developer, read-only checks first)

16. **Field vitals:** run `npm run cwv:field -- --since 2026-11-06T15:05Z --json` and compare with the saved baseline. If home p75 LCP stays above 2.0 s, test the mobile hero preload.
17. **CSP:** read `/api/csp-report` and add the hosts the container uses (`pagead2.googlesyndication.com`, `adservice.google.com`, `cct.google`, and any others the reports show) before switching the full policy from report-only to enforced.
    - **Done 11 Nov 2026 (partly).** The live pages were loaded with the container's conversion and paid-visit paths firing, with every hit blocked. One gap: `img-src` lacked `www.googleadservices.com`, the Ads form-conversion pixel, so enforcing would have stopped Ads counting form leads. It is added, and `tests/csp-policy.test.ts` locks the observed hosts. The three hosts guessed above were never requested. Still report-only: the stored reports need Workers Logs access (dashboard, or a token with Workers Observability read), and redirect targets behind each hit were not exercised.
18. **Ads and GA4:** with the Ads owner, compare call and form conversions and GA4 page views for the week before and after 6 Nov 15:05 UTC.

## Phase C: client input (the remaining score is mostly here)

19. **Named people:** names, roles, years and photos for the owner and account executive(s). They go on /about-us/, as `Person` schema, and as the reviewer line on the guides.
20. **Prices:** real price bands for the cost guide, by office size and visits per week, from recent proposals.
21. **Proof of work:** a photoshoot and 2–3 case studies (the `/projects/` collection is built and waiting). Then replace the gallery and the per-page OG images.
22. **Durham:** confirm crews travel to Pickering, Ajax and Oshawa, and supply one permissioned local fact per new city page. Otherwise noindex the Durham page.
23. **Reviews:** the true GBP review count and rating, the month of each review, and a steady stream of new review requests. Also approve which reviews may appear on which city pages.
24. **Remaining evidence:**
    - Insurer and coverage, and the WSIB clearance (or "certificate on request" wording).
    - Clinic IPAC training facts.
    - Date the homepage testimonials, or drop them.
25. **Off-site:**
    - Rename Facebook, LinkedIn and X to the current name.
    - Create or claim Bing Places, Apple Business Connect, YellowPages, HomeStars (the North York results page is entirely HomeStars), BBB and Yelp listings under the exact NAP.
26. **Decisions:** whether street address must stay required on the quote form; Content-Signal lines; FAQPage JSON-LD; Turnstile instead of reCAPTCHA.

## Phase D: account owners

27. **Search Console:**
    - Check index status of the five new pages and the redirects.
    - See which URL wins "commercial cleaning Toronto" and "office cleaning cost Toronto".
    - Run URL Inspection on one page that uses the scroll-in reveal.
    - Pull impressions by city before building any more location pages.
28. **Bing Webmaster Tools:** verify the site, submit `sitemap-index.xml`, and confirm the IndexNow key.
29. **Cloudflare dashboard:** check the bot settings and consider a read-only API token for monitoring.

## Expected effect

Phase A corrects three self-inflicted errors and tidies about 25 small items. It should add roughly 2–3 points (On-Page, Schema and AI Search). Phase C is where the large gains are: named people, real prices, real photos and reviews would lift Content, AI Search, Local and SXO by 10–20 points each. Those gains depend on the client supplying the material and cannot be bought with code.

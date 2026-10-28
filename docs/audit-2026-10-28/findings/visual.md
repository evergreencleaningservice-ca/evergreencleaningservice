# Visual / mobile / above-the-fold audit: evergreencleaningservice.ca (2026-10-28)
Benchmark: jan-pro.com. Tooling: Playwright direct (Chromium); desktop 1366x768, mobile iPhone 14 390x844 @2x. Jan-Pro is a franchise brand with a different business model, so comparisons are about patterns, not parity.

Screenshots: /tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/screenshots/
Naming: `<site>-<page>-<desktop|mobile>-<fold|full>.png`. Pages: evergreen-home, -office-cleaning, -medical-dental, -toronto-downtown, -request-a-quote, -reviews, -insights, -blog-dental-checklist, -lp-office-cleaning; janpro-home, -how-we-quote, -who-we-clean, -commercial-cleaning-services (52 base files = 13 pages x 2 viewports x fold/full).
Extra shots: evergreen-home-mobile-scrolled-sticky, evergreen-home-mobile-menu-open, evergreen-home-mobile-menu-expanded, evergreen-home-desktop-scrolled-sticky, evergreen-home-desktop-services-dropdown, evergreen-home-320-fold, evergreen-request-a-quote-mobile-empty-submit(.png and -full.png).
Caveat: Jan-Pro mobile-menu open could not be captured (my headless click did not trigger it); Jan-Pro quote/consultation forms did not render in headless (no iframes, empty "Schedule Your Free Estimate" block), so Jan-Pro form UX is not assessed. Headless full-page shots also show fixed bars (Jan-Pro tab bar, Evergreen LP call bar) mid-page; that is a capture artefact, not a defect.

## 1. Screenshot index (what each shows)
| File prefix | Shows |
|---|---|
| evergreen-home | Dark-overlay hero (H1 "Office & Commercial Cleaning in Toronto and the GTA", "since 1989" eyebrow, 2 CTAs, 3 trust ticks), service cards, industries, Google review carousel, how-it-works, area list, quote form, news, big footer |
| evergreen-office-cleaning | Flat grey title band + H1 + 2 CTAs, trust grid, lists, 5-step process, testimonials, FAQ accordion, sidebar quote form on desktop |
| evergreen-medical-dental | Same template for clinics; copy is audience-specific ("Patients judge a clinic before they see a clinician") |
| evergreen-toronto-downtown | Location page: ALL-CAPS green H1 in grey band, no CTA in fold; form mid-page |
| evergreen-request-a-quote | H1 + form (Name, Business, Address x4, Email, Phone, 8 service checkboxes, comments) + phone box + 4 reassurance points |
| evergreen-reviews | /reviews/ is actually "TESTIMONIALS": a submit-a-testimonial form + blog sidebar + tag cloud; no reviews displayed |
| evergreen-insights | "NEWS" blog index with large AI-style thumbnails |
| evergreen-blog-dental-checklist | Long-form post, 3 inline images, end CTA text only, WP comment form, sidebar widgets/tag cloud (Coronavirus, Covid-19) |
| evergreen-lp-office-cleaning | Stripped landing page: logo + big phone, H1, 6 offer bullets, form, sticky bottom Call/Free quote bar |
| janpro-home | Serif blue H1, 2 grey buttons, fixed tri-colour bottom tab bar (Free Estimate/Franchising/Find Location), "California Residents" banner |
| janpro-how-we-quote | H1 + stock-model photo + "site visit and assessment" statement + (unrendered) form |
| janpro-who-we-clean | Industry grid, long page (10,146 CSS px mobile) |
| janpro-commercial-cleaning-services | Service cards each with pill CTA (15,448 px mobile) |
| *-mobile-menu-open / -expanded | Mobile menu: Services, Industries, Service Areas, About, Blog, Contact, Call; accordions list all sub-pages |
| *-empty-submit | Empty quote form submit: inline errors + top banner |

## 2. Per-page above-the-fold verdicts
Scoring of "what / where / who in 5 seconds".
- Home (mobile+desktop): PASS, strong. "Office & Commercial Cleaning in Toronto and the GTA" = what+where; "since 1989", "WSIB covered, bonded and insured" = trust; "who" is partly in the sub-copy (offices, clinics, managed buildings, industrial). Primary CTA "GET A FREE QUOTE" (white on #47802A = 4.78:1) full-width 360x42 at y=365; phone CTA outline button at y=418; header Get-a-Quote at y=8. Phone visible (header icon, hero button). H1 28px white over dark overlay: legible. Issue: leadnet chat widget (avatar + "Click to open ->") covers the bottom-right of the fold, collides with the 3rd tick and, on some loads, renders as a black circle.
- Office cleaning / Medical-dental: PASS. Text-only grey band, no imagery, but H1 + sub + 2 CTAs all in fold (CTAs y=325-427). Plain but clear. Mobile fold is ~60% text.
- Toronto downtown (location): FAIL-ish. Fold = 4-line ALL-CAPS green H1 "COMMERCIAL CLEANING IN DOWNTOWN TORONTO | EVERGREEN OFFICE CLEANING" (SEO title pasted as H1), breadcrumb, large white gap, intro paragraph. No CTA other than header button; no phone button; form is below. The only page without a hero CTA.
- Request-a-quote: PASS. H1 + form starts in fold (first field y~330 mobile). Chat widget overlaps the Email/Phone row on mobile (covers phone field).
- Reviews: WEAK. URL promises reviews; page is a testimonial submission form with sidebar. Visitor who wants proof sees nothing. Real reviews exist on home/office pages but are stamped "5 years ago" / "6 years ago".
- Insights: OK. Clear "NEWS" title, big image card. Large photo thumbnails are AI-looking and push content down (page 7,098 px on mobile).
- Blog post: OK as content; fold = breadcrumb + H1 + hero image, no conversion element until the very end ("contact us" italic text link) except the header button. No author/date visible.
- LP /lp/office-cleaning/: BEST page. Stripped nav, big phone ("CALL (416) 803-4880 / Talk to an account executive"), H1 "After-hours office cleaning, by the same crew every visit.", 6 specific offer bullets (first month free, from $30/hr, 30-day cancel), form directly below, sticky bottom bar Call (233x56) + Free quote (156x56). Weak points: bullets and form push down; ★ rating text #B8860B on white = 3.25:1 (fails 4.5:1); logo large relative to the viewport.
- Jan-Pro home (benchmark): H1 clear ("Highest Level of Commercial Cleaning Services - Guaranteed.") but no where (franchise network), no phone in mobile header, two grey generic buttons ("Cleaning Services", "Franchising Information") that dilute the CTA; real conversion path is the fixed bottom tab bar (Free Estimate). Hero uses Impact/Times-style fonts. Blue "California Residents" banner eats 80px of the fold.
- Jan-Pro interior pages: very long, serif H1s, big stock model photography; clean but slow to scan (15k px).

## 3. Mobile issues with measurements (390x844 unless noted)
Tap targets (CSS px, threshold 44x44):
| Element | Size | Verdict |
|---|---|---|
| Header phone icon (.header-phone) | 40x44 | under 44 wide |
| Hamburger (.menu-toggle) | 40x44 | under 44 wide |
| Header GET A QUOTE | 100x44 | OK |
| Logo link | 113x34 | under 44 high |
| Hero GET A FREE QUOTE / CALL buttons | 360x42 (home), 180x42 / 189x42 (interior) | 2px short (42 vs 44) |
| Form inputs | 42 high (full widths 153-360) | 2px short; font 16px so no iOS zoom |
| Form submit "Get my free quote" | 360x48 | OK |
| Service checkboxes | 18x18 box (label text row ~22) | small target; label not obviously clickable |
| Footer link lists (services/areas) | 28 high x 51-177 wide | fails 44 (passes WCAG 2.2 AA 24px) |
| Home "Where we work" links | 26 high | fails |
| Footer social icons Facebook/Twitter/LinkedIn | 24x24 | fails |
| Chat dismiss "x" (leadnet-dismiss) | 26x26, white on #868686 = 3.64:1 | fails size and contrast |
| Testimonial "Read more" | 77x22 | fails |
| Blog tag cloud, recent-post links | 20-31 high; tags 24 high | fails |
| Breadcrumb links | 15 high | fails |
| "Privacy Policy" footer link | 192x43 | OK-ish |
| LP sticky bar Call / Free quote | 233x56 / 156x56 | OK |
| LP header phone | 126x48 | OK |
Jan-Pro for comparison: "Menu" 79x30 (fails), bottom tabs ~92x89 each (pass, big), body 18px.

Overflow: no horizontal scroll at 320 or 390 on any of the 9 Evergreen pages (scrollWidth == viewport). Home has off-canvas testimonial carousel cards (intentional); leadnet video thumb pokes 9px past the edge on 8 pages but does not create scroll. At 320 px the header "GET A QUOTE" button disappears (only phone + menu remain); logo+icons fit.
Sticky header: position:sticky, z-index 1000, 60px tall on mobile, 72px desktop, always visible (no hide-on-scroll) - good; consumes 7% of mobile viewport; phone + quote remain reachable all page long. Jan-Pro header is NOT sticky (relative), but its 3-tab bar is fixed.
Mobile menu: PASS. Hamburger -> full-width list: Services, Industries, Service Areas, About, Blog, Contact, Call (416) 803-4880, each 390x44 with caret accordions. Expanded: Services lists 9 services + All services; Industries 4 + All; Service Areas 7 + All; About 5. Sub-items 41px high. Issues: opened panel leaves the dimmed hero visible underneath with a green CTA peeking beneath the panel (looks unfinished); no close-on-outside-tap overlay observed.
Type size: bulk body copy is 13.1px (2,348 chars) and 12.6px (1,150 chars) on mobile; hero lead 17px; headings 22-28px. Cards, lists, FAQs, footer (14px) all sit under the 16px target. Legible only because of high-contrast #555-on-white and generous line-height (~1.7). Jan-Pro body 18px.
Form UX (/request-a-quote/, mobile): 8 required fields, proper autocomplete (name, organization, address-line1, address-level2, postal-code, email, tel), inputmode tel/email, 16px input text: good. Empty submit shows inline red messages under each field ("Please add your name.", etc.) plus a top red banner "8 things need a moment. Please tick 'I'm not a robot' before sending." - the banner mentions a tick-box that is not visible (invisible reCAPTCHA; `.g-recaptcha` is 360x0 and leaves a ~90px empty gap above the submit button on every form). The banner is confusing and the empty gap looks like a broken widget. Province is a free-text field pre-filled "Ontario". Placeholder "Jane Doe" shown as grey placeholder in first field only. Pale-blue field fill (#E9EFF9-ish) vs white page: low-contrast input borders. The chat bubble covers the Phone field and error text while filling the form. 8 required fields incl. full address is heavy for a first-touch quote form on a phone (LP also asks full address).
Cookie/consent banners: none found on any page (no cmplz/cookiebot/onetrust elements; only WordPress comment-cookie checkbox on blog). If Canadian traffic includes Quebec or analytics/reCAPTCHA/Google reviews embeds load pre-consent, a banner may be needed (legal, not visual). Jan-Pro: none either.
Layout shift: CLS ~0.000-0.005 on all pages, both viewports (none visually noticeable). Black placeholder circle for the chat video avatar appears while the video loads (home 320, medical, quote, reviews, LP desktop) - looks like a broken element for several seconds.
Dark areas: hero overlay text (white on dark photo) legible; eyebrow in pale green on image OK. Footer: black/#222 band with white social icons and neon-green (#6f0 style) "Privacy Policy" link, light-grey copyright: contrast fine, but the footer is just social + copyright; real contact/services/areas columns are above it in white, centred text links. Automated contrast scan on solid backgrounds found only: chat dismiss (3.64:1) and LP star rating #B8860B (3.25:1). Jan-Pro: white on tab orange 2.97:1, white on green 2.29:1, white on light blue 2.70:1, green "Click Here" on blue 4.12:1 (all below 4.5).
Imagery: Evergreen home hero and card photos (cleaners in green uniforms in glass offices, CN Tower skyline, identical cleaner faces reused across pages) have a consistent AI-generated look (over-smooth floors, perfect reflections, identical uniforms, same skyline). Consistent brand colours help, but they read as stock/AI, not real crews, and conflict with "since 1989 / dedicated crew" claims. Blog thumbnails are the same style. Logo has a visible off-white box around the JPG (not transparent) on a white header; hairline mismatch visible on desktop and mobile. Jan-Pro uses licensed photography of real-looking staff (also stock-feel but professionally lit and on-brand).
Staleness: Google review cards say "5 years ago"/"6 years ago"; tag cloud shows Coronavirus/Covid-19; footer copyright 2026 - fine, but social proof looks dated.
Footer usefulness: Evergreen has address, phone, email, hours (Mon-Fri 7am-10pm, weekends 8am-8pm), Request-a-quote button, services list, 10 service areas, Google review button, social, privacy: genuinely useful but long (~1,800 px on mobile) and duplicated with the preceding contact block. Jan-Pro footer: HQ address in Georgia, national phone 866-355-1064, link columns, franchisee disclaimer: corporate, no local info.

## 4. Comparison vs Jan-Pro
| Area | Jan-Pro | Evergreen | Better |
|---|---|---|---|
| Hero clarity | Generic claim, no geography, 2 grey buttons | Service + geography + proof + 2 colour CTAs | Evergreen |
| Primary CTA on mobile | Fixed 3-tab bar, ~90px tall, always visible, colour coded | Sticky header Get a Quote (100x44) + in-hero buttons; LP has fixed Call/Free quote bar | Jan-Pro for persistent bar; Evergreen LP equals it |
| Phone visibility mobile | Not in header; only via tabs/footer | Header icon + hero button + LP big number | Evergreen |
| Header | Not sticky, Menu 79x30 | Sticky 60px, 40x44 icons | Evergreen |
| Mobile menu | Not captured | Clear accordions with all sections | Evergreen (verified) |
| Body text size | 18px | 13px | Jan-Pro |
| Tap target size | Large tabs | 24-42px footer/inline/form items | Jan-Pro (tabs) |
| Colour contrast on CTA | Tabs fail 2.3-3.0:1 | 4.78:1 | Evergreen |
| Imagery | Real-looking branded photography, badges ("Franchise 500") | AI-look scenes | Jan-Pro |
| Social proof | Awards wall, video testimonial | Google reviews (dated), no reviews page | Jan-Pro (awards); Evergreen (genuine reviews on pages) |
| Page length / scanability | Very long, serif headings, large gaps | Mid length, consistent cards | Evergreen |
| Local relevance | Franchise locator, ZIP search | Location/industry pages with local text | Evergreen |
| Quote process clarity | "Site visit and assessment" page | 5-step "How it works", "no obligation" | Evergreen |
| Fonts/branding | Impact + Times H1, inconsistent | Raleway + Open Sans, consistent green | Evergreen |
| Forms | Not rendered | 42px fields, autocomplete, inline errors; clutter + confusing captcha banner | Evergreen (observed) |
| Layout stability | CLS ~0.001 | CLS ~0.001-0.005 | Tie |
| Overlays | California banner, no chat | Chat widget covering content | Jan-Pro |

Jan-Pro patterns worth borrowing: persistent bottom action bar on mobile (big, labelled, thumb-reach), 18px body, certifications/awards badges near the hero, one stripe per audience on "Who we clean", per-service cards each with a clear pill CTA, short "How we quote" page that explains pricing logic.
Evergreen patterns that are better: geography+service in H1, phone as a button, sticky header, specific offer on LP ("from $30/hr", "first month free"), 5-step process, accordion FAQs, area/industry pages, consistent brand palette, 4.78:1 CTA colour, no cookie nag, working mobile menu.

## 5. Prioritised fixes
P1 (conversion)
1. Remove or defer the chat widget on mobile (or move it above the sticky action bar, make the X >=44px, fix the black-circle loading state, no overlap with form fields). It covers hero ticks, the phone field and body text on every page.
2. Add a mobile fixed bottom bar (Call + Free quote, as on the LP, 56px) site-wide; keep header minimal.
3. Fix location pages: hero CTAs + phone in fold, title-case H1 with a clean phrase ("Commercial Cleaning in Downtown Toronto"), remove the empty gap.
4. Fix /reviews/: show actual Google reviews/star rating and "Leave a review" link; move the testimonial form to bottom; refresh the "5-6 years ago" cards with recent ones; drop the blog sidebar/tag cloud (Coronavirus, Covid-19).
5. Quote form: reduce to Name, Email, Phone, Building address (or postal), Service; make the rest optional; remove the empty reCAPTCHA gap; reword the top error banner (drop "tick I'm not a robot" when no box is shown); enlarge inputs to 48px; make checkboxes 24px with whole-row tap targets; add stronger borders on the pale-blue fields.
P2 (mobile usability)
6. Raise body copy from 13px/12.6px to 16px (cards, lists, FAQs, footer to >=15px); keep 17px hero.
7. Raise header phone and hamburger to 44x44 (add 4px padding), hero/interior CTA buttons to 44-48px height, footer and area link rows to 44px with padding, social icons to 44px hit areas, "Read more" and breadcrumbs to >=44px or 24px minimum with spacing.
8. At 320px keep a quote CTA in the header or rely on the sticky bar.
9. Mobile menu: add a dimming overlay and close-on-tap; hide the hero behind it.
10. Home: collapse the footer contact block duplication; shorten mobile page (12,386 px).
P3 (visual quality)
11. Replace AI-style hero/card/blog images with real crew/site photos; show a real uniformed team and vehicle; use the same person/crew consistently with captions.
12. Export logo as transparent PNG/SVG (removes visible white box).
13. Add interior-page hero imagery or a cleaner band (currently flat grey); add author/date to posts and a mid-article CTA card.
14. Darken LP star-rating colour to >=#8A6500 (4.5:1); darken chat dismiss.
15. Add awards/trust badges (WSIB, insurance, years in business) as graphics near the fold, as Jan-Pro does.

## 6. Score: 72 / 100 (visual/UX)
- Above-the-fold clarity and CTAs: 17/20 (home and LP excellent; location pages missing CTA)
- Mobile layout (no overflow, sticky header, working menu): 15/20
- Tap targets and type size: 9/15 (13px body, many 24-42px targets)
- Forms: 9/15 (good autocomplete/errors; long, clutter, confusing banner, chat overlap)
- Imagery and brand polish: 9/15 (consistent but AI-looking, boxed logo, flat interior bands)
- Overlays/stability: 6/10 (chat widget intrusive; no cookie banner; CLS excellent)
- Footer/trust/social proof: 7/10 (useful footer; reviews page weak, stale reviews)
Reasoning: solid, fast, stable, well-structured site with unusually clear messaging and a strong LP, held back by small type, undersized targets, an intrusive chat overlay, weak reviews and location templates, and AI-style imagery. Jan-Pro rates roughly 60-65 on the same lens (big targets and 18px text, but weak above-the-fold clarity, non-sticky header, 2-3:1 CTA contrast, very long pages).

## Structured findings (Visual category, JSON-compatible)
```json
{"category":"Visual","score":72,"findings":[
{"id":"V1","severity":"high","page":"all mobile","issue":"leadnet chat widget overlaps content, black circle loading state, dismiss 26x26 at 3.64:1"},
{"id":"V2","severity":"high","page":"/locations/toronto-downtown/","issue":"No CTA/phone in fold; ALL-CAPS title-tag H1"},
{"id":"V3","severity":"high","page":"/reviews/","issue":"Page is a testimonial submission form; no reviews shown; stale 5-6 yr reviews elsewhere"},
{"id":"V4","severity":"medium","page":"/request-a-quote/","issue":"8 required fields; captcha banner mentions invisible tick box; 90px empty gap before submit; 42px inputs"},
{"id":"V5","severity":"medium","page":"all","issue":"Body text 13.1px/12.6px on mobile"},
{"id":"V6","severity":"medium","page":"all","issue":"Tap targets: header phone/menu 40x44, CTAs 42px tall, footer links 28px, social 24x24, checkboxes 18px"},
{"id":"V7","severity":"medium","page":"home/blog","issue":"AI-looking imagery; logo JPG with off-white box"},
{"id":"V8","severity":"low","page":"/lp/office-cleaning/","issue":"Star rating colour 3.25:1"},
{"id":"V9","severity":"info","page":"all","issue":"No horizontal overflow at 320/390; sticky header works; mobile menu lists Services/Industries/Service Areas; CLS <0.005; no cookie banner"}]}
```

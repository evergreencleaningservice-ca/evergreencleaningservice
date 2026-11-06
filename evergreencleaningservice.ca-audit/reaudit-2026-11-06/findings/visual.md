Score: 87/100
Previous: 80/100 (first audit)

Scope: screenshots/ (home, office-cleaning, north-york, insights, request-a-quote; desktop 1366 and Pixel 7, fold and full) read with Read, plus live Playwright (chromium) checks on 6 Nov 2026 evening: 360x740 touch context on /, /request-a-quote/, /insights/, /services/office-cleaning/, /locations/north-york/ (overflow, sub-44px targets, form styles), bubble timing at 360, and the scroll-in reveal under default, prefers-reduced-motion and JavaScript-off contexts. Extra captures are in the scratchpad v/ folder.

## 2. Status of the first audit's findings

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Small tap targets (footer/contact links, 18px checkboxes) | Partly fixed | Checkboxes now 24x24 (/request-a-quote/, 360px). Footer link lists and "All ... " links are 28px high (quote, insights, office) and the home's service-area links are 24px high with "Read more" buttons 77x24 (7 on /). Hit areas are still under 44px, though the 24px WCAG 2.2 minimum is met. Header call and menu are 40-44px. |
| 2 | Video bubble over the hero trust line, late, tiny close | Fixed | At 360x740 on / the bubble was not present at 1.5s, 4s or 7s after load, nor at scroll 300. After scrolling past the hero (y=1100) it appears at x296,y620, 52x52 (bottom edge 672, sticky bar starts about 688) with the close control at 44x44. Source comment in LeadVideo.astro describes the hero gate and it matches what I saw. I did not play the video. |
| 3 | Three simultaneous call prompts on mobile | Open (Info) | home-mobile-fold.png: header Call and Get a quote, hero buttons and sticky bar all still present. Unchanged by design; no evidence it hurts. |
| 4 | Hero slider: 640px mobile image, extra slides loading=auto | Not verified | Mobile hero still looks fine in home-mobile-fold.png under the dark overlay. I did not re-inspect srcset or slide loading attributes. |
| 5 | Blog thumbnails low-res; "BLOG" label on every card | Partly fixed | insights-mobile-fold.png: first card now shows a large sharp image and a green "NOVEMBER 2026" label instead of "BLOG", and the excerpt starts at the substance ("Print it, walk the office with it ..."). Label is a month, not category; I only inspected the top card's thumbnail closely and did not audit every card. Excerpts still end with a bare "...". |
| 6 | Quote form: faint borders, unclear required fields | Fixed (small gaps) | Computed styles: input border 1px rgb(127,138,153) (about 3.4:1 on white), bg rgb(235,242,250), 38px tall. Name, business, street, city, province, postal, email, phone all have required and a red asterisk in request-a-quote-mobile-full.png. No "* required" legend (text search of the form returned false), and the form is still a long address ask. Privacy and 2-hour note now sits under the button. |
| 7 | Blank cards in full-page screenshots | Open, now larger (see N1) | Same cause class as before but now caused by the reveal, not only lazy images. |
| 8 | Location hero: no trust row, generic photo | Partly fixed | north-york-mobile-fold.png: trust row (Since 1989, WSIB covered bonded and insured, We reply within 2 hours) now present under the CTAs. The row wraps 2+1 and the grey-text ticks are visually quieter than on the home. Photo is now a person vacuuming an office floor, on-topic, though not local. |
| 9 | Service hero buttons unequal | Fixed | services_office-cleaning-mobile-fold.png: both buttons are full width and equal at Pixel 7; trust list directly under. Hero is still text only. |
| 10 | Logo off-white box; tiny subtitle; Blog vs Insights label | Open | Every mobile and desktop screenshot still shows the pale rectangle behind the logo and unreadable subtitle. Nav still says "Blog" over /insights/ titled "Commercial Cleaning Insights". |
| 11 | Trust elements text-only | Open | No new badges, aggregate rating or certificate line visible in the screenshots. Home has a "Share a review on Google" widget. |
| 12 | Long mobile home page | Open (Info) | Home at 360 is 14,310 px tall (was about 13,300 at 412). Sticky bar still mitigates. |

No horizontal overflow: scrollWidth 360 on all five pages at 360px.

## 3. New findings

### N1. Scroll-in reveal hides most of the page in any capture that does not scroll. Severity: Low (Medium for tooling and audits)
Evidence: with default settings, the home had 13 armed blocks and 14 data-reveal blocks with opacity below 1 after load. A full-page screenshot without scrolling (home_default_full.png, and the supplied quote-page full shot) shows blank bands for service cards, industries, reviews, process steps, testimonials, areas, latest insights and the footer widgets. The same applies to the supplied home-desktop-full.png and the quote-page footer gap. The text under headings exists but the cards are opacity 0.
Crawler and accessibility: JavaScript off: 0 armed, 0 hidden, full text present (9,969 characters). prefers-reduced-motion: reduce: 0 armed, 0 hidden. So a first-fetch crawler and a reduced-motion user see everything; this is correct per lib/reveal.ts. Googlebot renders with a tall viewport, so most blocks start above the fold and would not arm; I did not test it directly.
Residual risks: (a) screenshot, PDF or print tools, and "reader" or site-capture tools that render without scrolling show blank sections; (b) a user who scrolls fast on a slow device sees blank cards briefly; (c) Ctrl+F finds text that is not yet visible, harmless. No layout shift was seen (animation uses opacity and transform only).
Recommendation: keep it. Add a `@media print` rule that sets `[data-reveal-armed]:not(.is-in), [data-reveal-armed]:not(.is-in) > * { opacity: 1 }` in src/styles/global.css, and for audit or screenshot tooling scroll the page or emulate reduced motion first. Note that reveal.ts treats `still` as read once at load; a user who changes the OS setting mid-session is unaffected until reload.

### N2. Tap targets still under 44px for footer, service-area and "Read more" controls. Severity: Low
Evidence: 360px, home: 13 area links 24px high, 7 "Read more" buttons 77x24, two 40x40 carousel buttons; quote and office: footer link rows 28px high, "Request a quote" link 40px; insights: sidebar link rows 23px. None undersized in header, hero or sticky bar.
Recommendation: `padding-block: .6rem` (or min-height 44px) on footer and area lists and sidebar links in the Footer, Areas and Sidebar components; enlarge the "Read more" toggle.

### N3. Location trust row wraps unevenly at 360px. Severity: Low
Evidence: north-york-mobile-fold.png: ticks 1 and 2 sit on one line and tick 3 wraps below. Fine, but unlike the stacked list on the office page. Recommendation: stack the ticks in one column below 480px in the location hero component.

### N4. Quote form has no "* required" legend and uses a long address ask. Severity: Info
Evidence: see item 6. All visible fields are required. Recommendation: add "All fields marked * are required" above the fields, and consider making street address optional.

## 4. Needs the client or an account owner
- Provide a transparent logo (SVG or PNG) and confirm the nav label: "Blog" or "Insights".
- Supply verifiable trust assets: insurance and WSIB clearance wording, an accurate aggregate Google rating, client logos with permission.
- Decide whether street address must be required on the quote form.
- Test on a real phone (bubble, review carousel, form).

## 5. Not verified
- Bubble video content, sound, autoplay and the 18 KB asset; actual real-device behaviour.
- Hero srcset and slide loading attributes; blog thumbnail resolution beyond the first card; month labels on every card.
- Googlebot rendering of reveal-armed content (not tested directly).
- Form submission, validation messages and reCAPTCHA badge placement.
- Contrast ratios computed only for form borders (about 3.4:1 estimated from the computed colour); others judged visually.

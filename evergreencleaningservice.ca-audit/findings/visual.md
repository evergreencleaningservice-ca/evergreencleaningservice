Score: 80/100

Scope: visual and mobile review of /, /services/office-cleaning/, /locations/mississauga/, /insights/, /request-a-quote/ (screenshots in screenshots/), plus extra Playwright captures at 360px and Pixel 7: menu open, /reviews/, lazy-loaded full-page home. All screenshot paths below are in /home/user/evergreencleaningservice/evergreencleaningservice.ca-audit/screenshots/.

## What works
- Homepage above the fold, mobile (412 and 360 wide): eyebrow "Commercial cleaning since 1989", H1, value proposition, a full-width green "Get a free quote" button, an outlined "Call (416) 803-4880" button, and three trust ticks (free walkthrough, WSIB covered/bonded/insured, reply within 2 hours). All are visible without scrolling at 412x~915 (home-mobile-fold.png). At 360x740 the three ticks sit at the very bottom, just above the sticky bar (extra-home-360-fold.png).
- Desktop fold (1366x768): the same content fits in a dark, text-overlaid hero. The header has the phone number and a "Get a quote" button, both always visible (home-desktop-fold.png). Contrast on the overlay is strong (white on a dark navy photo).
- The hero image is on-topic (empty, modern open-plan office with plants) and the alt text is descriptive. It is atmospheric rather than showing people or crews. LCP is good in the desktop lab run. Mobile Lighthouse numbers are in the brief; I did not re-measure.
- No horizontal overflow. scrollWidth equals innerWidth at 1366, 412 and 360 (I measured this directly).
- Mobile header: logo, phone icon, "Get a quote" and hamburger fit at 360px. The open menu is clear and uncluttered: Services, Industries, Service Areas, About, Blog, Contact and a tel link, each with large (~44px+) rows (extra-home-360-menu.png).
- Sticky mobile bar (Call | Free quote) is about 52px high, high contrast, and has no content collision. It does not hide the footer; page content ends above it.
- Typography is consistent: Open Sans, large body text on mobile (about 18px). Line length is controlled on desktop (about 70 characters in paragraphs). Link and button green on white is high contrast. Lighthouse accessibility is 100.
- The templates are consistent: grey title band with breadcrumb on inner pages, the same cards, the same green buttons. The quote page is clean and uncluttered.
- Trust elements: since-1989 eyebrow, the WSIB/bonded/insured line on the home, office, and quote pages, Google review carousel and testimonials on the home page, a /reviews/ page, and the address and phone in the footer.
- Footer NAP is complete and consistent: 243 Queen St W, Toronto, ON M5V 1Z4, tel link, email, and office hours Mon-Fri 7am-6pm. It appears on the home, quote and contact blocks. Phone is a tel: link everywhere I looked.
- Quote form: single column on mobile, labels above fields, required asterisks, Province pre-filled "Ontario", phone placeholder, a clear "Get my free quote" button, and a "Rather talk it through?" phone box plus trust bullets next to the form (desktop) or below it (mobile). Fields are 38px+ tall.

## Findings

### 1. The 8 "small tap targets" on the homepage are mostly false alarms. Severity: Low
Evidence: I enumerated every element under 24px with Playwright (desktop and Pixel 7).
- The skip link ("Skip to content", 32x20) is only visible on focus.
- 8 checkboxes (18x18) in the contact form's "interested in" list (their labels extend the clickable area).
- A 1x1 hidden reCAPTCHA input, plus a 22x38 input that is probably the honeypot or CAPTCHA wrapper.
- Inline text links 19-22px high: "All industries we serve →", "All service areas →", the phone and email links in the contact block, the footer phone/email, and "Privacy Policy" (87x19).
Nothing in the header, hero, or sticky bar is undersized. The real issues are the text links stacked closely in the footer and contact block (phone and email 24-30px apart), and the 18px checkboxes.
Recommendation: add `min-height:44px; display:inline-flex; align-items:center` (or padding) to footer and contact-block links, and `padding-block:.5rem` to the "All ... →" links, in the global stylesheet or the footer component. Enlarge the checkboxes to about 24px (`input[type=checkbox]{width:1.4rem;height:1.4rem}`) and make the whole label row the tap target. Ignore the skip link and the reCAPTCHA input.

### 2. Floating video bubble: appears late, sits on hero text, adds a third call-to-action layer. Severity: Medium
Evidence: it is not in the initial mobile fold screenshots, but at 360px about 2.5s after load it appears at bottom-right (about 52px photo bubble with a small x close button), directly above the sticky bar (extra-home-360-menu.png). In that frame it overlaps the right end of the "WSIB covered, bonded and insured" line, so it covers a trust element in the hero. The tag list in visual-data.json shows two buttons, "Open the video message" and "No thanks, hide this". The video is an 18 KB asset and is mobile only in the resource list.
Impact: low obstruction on content pages, but on the hero it competes with the trust ticks. It takes pointer space next to the sticky Call/Quote bar, which already carries those actions. Two unlabeled-looking controls (a photo and an x) are a small tap-target risk. The x is about 24px.
Recommendation: on viewports under 480px either delay the bubble until after the user scrolls past the hero, or hide it on the homepage hero and raise its bottom offset to clear the sticky bar by at least 16px. Enlarge the close "x" to a 44px hit area. Find the component by searching for "Open the video message" in src/components. I could not see the video itself (not played), so I cannot judge its quality or whether it autoplays with sound.

### 3. Three simultaneous "call" prompts on mobile. Severity: Low
Evidence: header "Call" button, hero "Call (416) 803-4880" button, and the sticky bottom "Call (416) 803-4880" bar are all on screen at once on the homepage fold (home-mobile-fold.png). Header has "Get a quote" plus hero "Get a free quote" plus sticky "Free quote". This is consistent and not harmful, but it is noise, and on short phones the sticky bar covers the last ~50px of the hero.
Recommendation: keep it, but on the homepage consider hiding the sticky bar until the hero CTAs scroll out of view (IntersectionObserver on the hero buttons). Low priority; conversion tests would be better evidence than my opinion.

### 4. Hero is a 3-slide slider with two empty-alt images; mobile hero images are only 640px wide. Severity: Low
Evidence: the DOM has three hero images, 640x800 AVIF on mobile; the first has descriptive alt text and the other two have alt="" (correct, they are decorative and the slides repeat the same H1). On a 2.6x DPR phone (Pixel 7) a 640px image rendered at 412 CSS px is about 1.55x, so it is slightly soft, which is less visible under the dark overlay. The empty alts are fine.
Recommendation: add an 828w or 960w variant to the srcset in the hero component. Confirm that the 2nd/3rd slides are `loading=lazy`/`fetchpriority=low` (visual-data shows `loading=auto` for them, so they could compete with the LCP image). Cheaper still: if the slider does not actually rotate visibly, drop it to a single image. I did not observe the rotation timing.

### 5. Blog archive thumbnails are low resolution and excerpts repeat the title. Severity: Medium
Evidence: on /insights/ the home blog cards use 300x150 JPG thumbnails shown at 382 CSS px wide on mobile, and they are visibly soft and blocky (insights-mobile-fold.png; blog-office-cleaning-frequency-300x150.jpg). The third home blog image is a better 411px AVIF, so quality is inconsistent. Excerpts begin by restating the title ("How Often Should an Office Be Cleaned? An office used every weekday...") and end with a bare "...", with no date, author, or reading time on the cards. Every card is labelled "BLOG", which carries no information. The desktop layout (image left, text right, sidebar search and recent posts) is clean and readable.
Recommendation: serve 600-768px AVIF/WebP for archive thumbnails, with srcset (in the insights index template under src/pages/insights/). Replace the repeated "BLOG" label with the post category or date. Generate excerpts from the first sentence after the heading, or use a dedicated `description` frontmatter field.

### 6. Quote form: usable, with small polish gaps. Severity: Low
Evidence (request-a-quote-desktop-fold.png, request-a-quote-mobile-full.png):
- Inputs use a pale blue fill (looks like a browser autofill tint, but it is the stylesheet), with low border contrast against the white page. Boundaries are visible but faint.
- "Address" is a required group with a sub-label "Street address & unit #", but City, Province and Postal code are not marked required. It is unclear which are mandatory. Asking for a full address of a prospect up front adds friction; a postal code or building address alone usually suffices for a cleaning quote.
- Required fields marked with a red asterisk only; no "* required" legend. No visible reassurance directly beside the button (privacy or "we reply within 2 hours" is above the form only).
- Checkbox grid is 2 columns on mobile and the checkboxes are 18px (see finding 1).
- Phone placeholder "(XXX) XXX-XXXX" is shown in a grey of low contrast, and it vanishes on focus.
Recommendation: darken input borders to at least 3:1 against the background (about #8a8f94); mark required fields explicitly; consider making the address optional or splitting out "Postal code" only; add a one-line privacy and response note under the submit button. I did not submit the form, so I could not check validation messages, the thank-you redirect, or the reCAPTCHA badge placement.

### 7. Homepage services cards render blank in static full-page screenshots; real users see them once scrolled. Severity: Info
Evidence: in the provided home-mobile-full.png the three featured service cards show empty white image areas. This is only because the images are `loading=lazy` and the full-page capture never scrolled. After scrolling in Playwright (extra-home-mobile-full-lazyloaded.png) all images load (380x214 AVIF). CLS is 0, so the space is reserved. No fix needed.
A related observation: the Google reviews widget on mobile (extra-home-mobile-services-scrolled.png) showed a carousel with its first card clipped and blank and the second card cut off at the right edge, mid-animation. It is a third-party widget; I saw it in one frame and could not tell whether it settles. Worth a manual check on a real phone.

### 8. Mississauga location page: weak above-the-fold proof and a generic image. Severity: Medium
Evidence (locations_mississauga-mobile-fold.png): a grey title band with the H1, a CTA pair (Get a free quote / Call) that fits, then a large photo of two workers on a scissor lift cleaning a high ceiling. There are no trust signals (since 1989, WSIB/insured) above the fold, unlike the homepage and office page. The photo shows a very large ceiling/atrium and is not specific to Mississauga or to office cleaning. Inner heading "Reliable, professional facility maintenance for Mississauga businesses" repeats the H1's idea and uses different wording ("facility maintenance" vs "cleaning"). The two CTA buttons are side by side on mobile and a bit tight, and the "Get a free quote" button sits at the left edge, inset differently from the hero on the home page.
Recommendation: add the same three-tick trust row used on the office-cleaning page to the location hero component, below the buttons. Replace or caption the image with something recognisably local or at least typical of an office or clinic. Use consistent heading vocabulary.

### 9. Office-cleaning service page: strong but the hero is text only. Severity: Low
Evidence (services_office-cleaning-mobile-fold.png): H1, lead paragraph, quote and call buttons, then a trust list (since 1989, WSIB, 2-hour reply) just below the fold start, fully visible by the first scroll. No image. The CTA buttons are left-aligned and not full width on mobile, unlike the homepage, so the two buttons differ in width (260 vs 272px) and look slightly misaligned. It reads well, but it is less persuasive than the homepage hero and there is no photo or review snippet near the top.
Recommendation: make the CTA buttons equal width/full width at under 480px (the same hero button class as the homepage). Consider one review snippet near the top.

### 10. Header logo and navigation. Severity: Low
Evidence: the logo is a 440px-wide image with a faint off-white box behind it (visible as a pale rectangle on the white header in every screenshot), which looks like a JPG/AVIF with a non-transparent background. The wordmark "commercial cleaning & janitorial" subtitle is tiny (about 7px) and unreadable at 127px wide. Desktop navigation is clear: five dropdowns/links, a visible phone number, and a green "Get a quote" button; "Blog" is highlighted green when active. Nav label "Blog" while the page title is "Insights" and the URL is /insights/ is a minor inconsistency.
Recommendation: re-export the logo as a transparent SVG or PNG (and increase the logo's rendered height to about 44px on mobile). Align the nav label with the URL ("Insights") or the reverse.

### 11. Footer and trust elements: complete, but some are text-only. Severity: Low
Evidence: footer NAP is good (see above). Trust elements are statements ("WSIB covered, bonded and insured", "since 1989") with no badges, certificates, insurance-document links, WSIB clearance mention, client logos, or review star totals. The Google reviews carousel shows individual 5-star reviews but no aggregate rating or count in the visual; /reviews/ lists three short reviews ("Very reliable. Great service", "Excellent service at a very good price") with names and "2 months / 9 months ago". The reviews page has very little content for a trust page. Two of the three homepage testimonials use initials avatars (BC, AR, PL) with no photos.
Recommendation: show the aggregate rating (for example "4.x from N Google reviews") only if it is accurate and verifiable; add a "WSIB clearance certificate and liability insurance available on request" line with a link; add client logos only with permission. Not verifiable by me: whether the review content is real and current.

### 12. Mobile services list on the homepage is long. Severity: Info
Evidence: the full home page on mobile is about 13,300 px tall (docWidth 412, home-mobile-full.png is 34,955 px at 2.6x), and the text cards for secondary services and industries are tall single-column stacks. Section spacing is generous. It is usable but long; the quote form sits near the very end. The sticky bar mitigates that.

## Could not verify
- Real-device rendering, video bubble content and sound, hero slider timing, form submission and validation, and the carousel behaviour of the review widget beyond a single frame.
- The /insights/tag/office-cleaning/ and /contact/ URLs I tried returned 404 (the guessed slugs do not exist; I did not look for the correct tag URL, so the tag-archive layout is unreviewed).
- Contrast ratios were judged visually, not computed (Lighthouse reports 100 for accessibility, which includes automated contrast checks).
- The `transfer` and `byType` byte counts in visual-data.json (about 31 KB total, images 342 bytes) look like cache or Resource Timing artifacts and should not be used as page weight.

## Quick wins
1. Hide or delay the mobile video bubble until after the hero and give it a 44px close target; lift it clear of the sticky bar (finding 2).
2. Replace the 300x150 JPG blog thumbnails with 600-768px AVIF/WebP and replace the "BLOG" label with a date or category (finding 5).
3. Add the trust tick row to the location hero template (/locations/*) and make hero CTA buttons consistent in width across templates (findings 8, 9).
4. Enlarge footer and contact-block text links and the form checkboxes to about 44px tap areas (finding 1).
5. Re-export the logo with a transparent background and darken the form input borders (findings 6, 10).

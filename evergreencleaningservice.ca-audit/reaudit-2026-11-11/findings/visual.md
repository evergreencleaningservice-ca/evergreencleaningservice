Score: 86/100
Previous: 87/100 (re-audit 7 Nov, as scored in reaudit-2026-11-06/findings/visual.md)

Scope: supplied screenshots read with Read (office-cleaning desktop fold, janitorial mobile fold, north-york mobile fold, quote mobile full; others judged from visual-data.json only), plus one live Playwright run (360x740, touch, isMobile; Google/Ads/doubleclick/GTM/cdn-cgi/rum aborted) measuring overflow and sub-44px controls on /, /request-a-quote/, /services/janitorial-services/, /locations/north-york/. The score drops one point: the 44px tap-target fix is not observed, and the new janitorial hero collides with the video bubble.

## 2. Status of re-audit findings

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Small tap targets | Partly fixed | Live 360px touch: header call and menu 40x40, form inputs 38px, footer/area/inline links 22-30px. Janitorial: 40 controls under 44px (area links 24px, "Services" 30px). Brief says 44px on touch; not observed. |
| 2 | Video bubble over hero | Partly fixed (regressed on photo heroes) | janitorial-mobile-fold.png: bubble (about x830-950,y1715-1840 of 983px image) overlaps the trust-list text "liability insurance" at the fold. See N1. |
| 3 | Three call prompts on mobile | Open (Info) | janitorial fold: header Call, hero Call button, sticky bar all visible. |
| 4 | Hero slider images | Not verified | Not inspected. |
| 5 | Blog thumbnails/labels | Not verified | Only the quote-checklist post was captured; I did not open its screenshots. |
| 6 | Quote form borders/required | Partly fixed | request-a-quote-mobile-full.png: red asterisks still, no "* required" legend. Fallback email and phone are now real links (info@... 253x22, tel 110x22). |
| 7 | Blank cards in full shots | Open | request-a-quote-mobile-full.png has a blank band of about 1/3 page height between the trust list and footer (reveal/gap in capture). Tooling artefact, but the print rule from N1 (old) was not verified. |
| 8 | Location hero trust row/photo | Partly fixed | north-york-mobile-fold.png: row now has 3 ticks incl. "We reply within 2 hours, Mon-Fri 7am-6pm". Still wraps 2+1 with grey text; the photo remains a below-hero generic vacuum image, not a photo hero. |
| 9 | Service hero buttons unequal | Fixed | janitorial mobile: both buttons full width, equal height; desktop office: two buttons side by side. |
| 10 | Logo box/subtitle/Blog label | Open | Pale box behind logo and tiny subtitle visible in every screenshot; nav still "BLOG". |
| 11 | Trust elements text-only | Open | No badges or rating on checked pages. |
| 12 | Long mobile home | Open (Info) | Not re-measured. |
| N1 | Scroll-in reveal | Open (Low) | Same blank band in quote full shot. |
| N2 | Tap targets under 44px | Open | See finding 1. |
| N3 | Location trust row wrap | Open (Low) | Wraps 2+1 at Pixel 7; longer reply text made the third item a full line. |
| N4 | No "* required" legend | Open (Info) | Still absent. |

No horizontal overflow: scrollWidth 360 on all four pages tested.

## 3. New findings

### V1. Photo heroes: legible, but busy and tall on mobile. Severity: Low
Evidence: office-cleaning desktop: white H1, body and buttons over a dark overlay read clearly; the vacuum photo is distinct but the hose crosses the paragraph (text sits at lines 3-4 over it). Janitorial mobile: H1 and a 9-line paragraph over a yellow caution sign and bucket; white text is readable but the left edge, where the yellow sign is brightest, is lowest contrast. The hero is about 1370 of 2000 display px (around 70% of the viewport) so the trust list is mostly below the fold.
Recommendation: darken the overlay slightly on the left or add a text-shadow in src/components/OfferPage.astro; shorten the mobile hero lede (clamp to 4-5 lines) so trust items surface.

### V2. Video bubble collides with hero trust text on janitorial mobile. Severity: Medium
Evidence: janitorial-services-mobile-fold.png: bubble and its close button sit over the "Background-screened staff, covered by liability insurance" line, and the sticky bar edge cuts the next line. The bubble was gated past the hero before; with the taller hero it appears in the fold in this capture. Not tested live over time.
Recommendation: check the bubble gate in LeadVideo.astro against the new hero height; keep it hidden until the hero plus trust list have scrolled past.

### V3. Quote-page fallback links are small. Severity: Low
Evidence: live 360px: mailto 253x22 and tel 110x22, inline in a paragraph (acceptable under WCAG 2.2 inline exception, but the phone number is the key fallback). A large phone card ("(416) 803-4880") sits below the form and is fine.
Recommendation: show the phone in the lead paragraph as a block link with 44px height, or keep the card.

### V4. Location page still not on the photo-hero pattern. Severity: Info
Evidence: north-york-mobile-fold.png grey hero with green H1; photo below the fold. Inconsistent with 13 service pages. Low priority.

## 4. Needs client or account owner
- Transparent logo file; "Blog" vs "Insights" label.
- Verifiable trust assets (aggregate rating, insurance wording, client logos).
- Whether street address must remain required.
- Real-device check of bubble, form and hero crop.

## 5. Not verified
- Desktop 1366 location, quote and janitorial shots, home shots, checklist post shots (not opened); tablet widths.
- Computed contrast ratios over the photo overlays (judged visually).
- Bubble timing live on the new heroes; hero image srcset and LCP element.
- The claim that touch targets are 44px: measured as not matching, but I did not confirm the media query (pointer: coarse) was matched in the emulation.
- Form submission, validation messages, reCAPTCHA.

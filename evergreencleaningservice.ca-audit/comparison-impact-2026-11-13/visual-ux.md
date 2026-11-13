# Visual design and conversion UX: Evergreen vs Impact (13 Nov 2026)

Method: viewed the fold screenshot (desktop 1366, Pixel 7) for all 4 page pairs on both sites. Viewed full-page screenshots for the home pages and the Mississauga pages. Did not open the mobile-full captures or the full-page captures of the other pairs. Screenshots are in `scratchpad/cmp/screenshots/{evergreen,impact}/`.

## 1. Scores (visual design and conversion UX only, /100)

| | Evergreen | Impact |
|---|---|---|
| Above-the-fold clarity | 17/20 | 17/20 |
| Trust signals visible | 11/20 | 18/20 |
| Primary CTA and phone prominence | 18/20 | 16/20 |
| Form friction | 8/15 | 8/15 (unverified, see section 5) |
| Mobile layout | 13/15 | 10/15 |
| Readability and consistency | 8/10 | 6/10 |
| **Total** | **75** | **75** |

Evergreen wins on clean, consistent CTA and phone treatment. Impact wins on proof and on selling. The tie is honest. Evergreen's gap is almost entirely trust proof, which is cheap to fix.

## 2. What each does better (evidence)

| Site | Does better | Evidence (page and what was seen) |
|---|---|---|
| Impact | Trust bar above the fold | Every Impact page has a top strip: "Free on-site quote: (647) 492-6286" and "5 stars 53+ 5-Star Google Reviews, Family-owned and Canadian since 1954". Reviewer avatars sit beside the H1 on `/` and `/office-cleaning`. Evergreen's fold has no review count or rating on any of the four pages. Its Google-reviews block on `/` renders as only a "Share a review on Google" widget. |
| Impact | Scale and credential proof | Home fold: "35 million square feet daily", "1,100+ cleaners", "ISSA CIMS-GB certified with Honours". A stat band sits just below the fold on `/`. The Mississauga page shows CIMS badges. Evergreen offers "Since 1989", "WSIB covered, bonded and insured" and "reply within 2 hours" only. |
| Impact | Human faces and real people | Home hero is a real operator on a branded scrubber. Office page hero is a cleaner in a tower. Evergreen's hero is an empty stock-style office, and the Mississauga hero is a ceiling-cleaning lift photo (real work, but no faces). |
| Impact | Benefit-led headline | `/office-cleaning`: "Office Cleaning Services, Without Chasing Your Cleaner". Evergreen's H1s are descriptive ("Office Cleaning Services in Toronto and the GTA"), which is good for SEO but says less about what the buyer gets. |
| Impact | Selling depth on the home page | Full-page `/` shows: client testimonials, "why property managers switch", a three-step "first call to first shift" process, technology and transparency section, awards, a "Make-It-Right Guarantee", FAQ and a closing CTA band with the phone number. Evergreen's home has similar sections, but several appear blank in the full-page capture (see section 5). |
| Impact | Sticky phone and quote on mobile at top | A full-width red "Get My Free Quote" button plus a navy phone bar sit above the H1 on every mobile page. The phone number is the tappable bar, not an icon. |
| Evergreen | Cleaner CTA pair | Desktop fold on `/` and `/office-cleaning`: filled green "GET A FREE QUOTE" next to outlined "CALL (416) 803-4880", with a header phone number and "GET A QUOTE" button. This is one clear action pair, and Impact's fold gives the phone number less weight. |
| Evergreen | Sticky bottom action bar on mobile | Pixel 7 folds on `/` and `/locations/mississauga/` show a fixed bottom bar: "Call (416) 803-4880" and "Free quote". It stays reachable while scrolling. Impact's mobile fold has no sticky bottom bar. |
| Evergreen | Mobile fold is faster to the action | Evergreen `/` mobile: H1, intro, two buttons and three ticks all fit in one screen. Impact's mobile fold puts a header, quote button, phone bar, reviews, eyebrow and H1 first, and its lead paragraph pushes the form card below the fold. |
| Evergreen | Local pages have an on-page form and visible specifics | Mississauga desktop fold: the form is visible beside the content, with a named-place intro (Meadowvale, Airport Corporate Centre). Impact's Mississauga page shows a blank form box in the capture and generic copy. |
| Evergreen | Honest, specific reassurance | "A reply within 2 hours, Mon-Fri 7am-6pm" and "Free on-site walkthrough" are concrete promises. Impact's equivalents are "within 24 hours" and "no obligation". |
| Evergreen | Readable, consistent typography and layout | One font family, one green, left-aligned hero, generous spacing, and no competing colours. Impact uses red, navy and cyan within one headline. The Mississauga H1 mixes navy and red across words, and the cyan inline link has weak contrast on white. |

## 3. Where Evergreen should copy the pattern, not the content

1. **Trust strip above the header or hero.** A slim bar with the Google rating and review count (only the real numbers), "Family-run since 1989", and the phone number. Build it as a small component used in the site layout (check `src/layouts` and the header component in `src/components`). Pull the rating from the real Google profile; do not invent a number.
2. **Proof row directly under the hero buttons.** Add real, verifiable items next to the existing three ticks: review rating, years in business (35+), insurance, any real certification or association membership. Impact's stat band is the pattern. Use Evergreen's own facts.
3. **Real photos of the actual crew and equipment.** The home hero is an empty office. Replace or supplement with an original photo of the team at work (with consent). Impact's operator-on-machine hero is the pattern.
4. **Benefit-led H1 or subhead on service pages.** Keep the keyword H1 and add a one-line promise above or below, e.g. a "same crew every visit" line. Do not copy the "Without Chasing Your Cleaner" wording.
5. **Three-step "how it works" and a written guarantee near the first CTA.** Evergreen's home already has a "How it works" section; move a compact version above the fold's second screen and add an explicit service promise.
6. **Shorter form.** See section 5 on friction. Offer a short first step (name, phone or email, building address) with the remaining fields optional. Pattern, not copy: Impact's card pitches "Free walkthrough. No obligation. Prefer to talk? Call ...", which pairs the form with a phone alternative. Evergreen's local pages can do the same under the form.
7. **Mobile top bar.** Keep Evergreen's sticky bottom bar. Do not copy Impact's stacked header, which uses about 370px of the fold before the H1.

## 4. Where Evergreen already beats Impact

- Cleaner, more consistent visual system and CTA hierarchy (one green, one action pair on every page).
- Sticky bottom call and quote bar on mobile (Impact has none in its mobile folds).
- Mobile fold gets to both CTAs inside one screen on the home page; Impact's mobile fold has the quote button above the H1 but no form or call button until after about 1,000px.
- Local pages show the form in the desktop fold with place-specific copy. Impact's programmatic Mississauga page leads with generic copy and a form box that was empty in the capture.
- Phone number is on every Evergreen header (desktop and, via "Call", on mobile).
- Blog article layout is more readable: narrow column, short intro, read time, a plain byline. Impact's post fold is a large H1 and hero image with a "12:00 pm" timestamp, which adds no value; it also reads as a tall header with no CTA inside the post fold.
- Evergreen's own pages do not lean on unverifiable claims ("Award Winning" in the Impact Mississauga eyebrow has no evidence next to it in the fold).

## 5. What was not verified

- **Form fields.** On Evergreen's Mississauga page and the home page (desktop full captures), required fields appear to be Name, Name of Business, Street address and unit, with City, Province, Postal code, Email, Phone and service checkboxes. I could not read every asterisk at the capture resolution. It looks like about 8 to 9 fields: high friction for a first enquiry. Impact's forms rendered as empty boxes in the captures (likely a third-party embed that did not load with trackers blocked), so Impact's field count and friction are not verified. Impact's score for form friction is a placeholder equal to Evergreen's.
- **Blank areas in the Evergreen full-page captures.** "What we clean", "Who we clean for", the Google reviews, "How it works", "Testimonials" and "Latest insights" appear as large empty regions on `/`, and "Services in Mississauga" and "From our Google reviews" are empty on the location page. Impact's home shows blank space in the testimonial carousel and technology cards as well. This is probably scroll-triggered or lazy-loaded content that the full-page capture did not trigger, so it is a probable screenshot artefact. It should be confirmed on a real device before treating it as a bug. If real users also see those blank blocks, that would be a serious conversion problem.
- Not viewed: mobile-full captures, full-page captures of `/office-cleaning` and the blog posts on both sites, Evergreen's `/office-cleaning/` mobile fold, Impact's mobile folds for `/office-cleaning` and the blog.
- Tablet and laptop viewports, touch-target sizes (measured only by eye; Evergreen's mobile buttons look at least 48px tall), actual conversion rates, and any user testing.
- Screenshots were taken with analytics blocked, so the third-party widgets (reviews, forms) may not match what real visitors see.
- No backlink or ranking data is part of this area.

## Files to check in the repo

`src/layouts` (site layout and header), `src/components` (hero, quote form, sticky mobile bar, reviews widget). Exact filenames were not inspected for this area.

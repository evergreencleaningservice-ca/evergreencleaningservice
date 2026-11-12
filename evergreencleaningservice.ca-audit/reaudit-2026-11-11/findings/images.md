Score: 89/100
Previous: 90/100 (re-audit 7 Nov)

# Images - www.evergreencleaningservice.ca (third audit, 2026-11-11)

Source: raw/crawl/pages.json plus saved HTML for the 62 sitemap URLs (228 `<img>` elements), and about 55 polite curl requests to img.evergreencleaningservice.ca (13 hero sets, one OG JPEG). Static analysis (Image Audit, no Lighthouse, screenshots not reviewed). The 1 point drop is the hero-image regressions/gaps below, not a site-wide change.

## 1. Status of re-audit findings

| # | Re-audit finding | Status | Evidence |
|---|---|---|---|
| 2 (carried) | Homepage hero slides 2 and 3 load eagerly, no slide-1 preload | Open | `/`: slide 1 `loading="eager" fetchpriority="high"`; slides 2 and 3 still have no `loading` attribute and `alt=""`. No image preload in head (only the open-sans font). Same as 7 Nov. |
| 5 (carried) | Shared OG image on many pages | Partly fixed | 22 of 62 pages still use evergreen-modern-commercial-cleaning-hero-og.jpg (was 22 of 60): `/`, /request-a-quote/, /services/, /industries/, /locations/ and 11 location pages, /our-process/, /contact-us/, /reviews/, /green-clean-products/, /insights/, /privacy/. 40 distinct OG images in total (was 38). All 13 service/industry pages now have their own `-og.jpg` matching the hero photo. The 11 location pages are the real remaining gap. 0 pages missing og:image. |
| 6 | No ImageObject / image sitemap | Open (Info) | Unchanged, no action needed at this size. |
| N1 | Empty alt count 10 | Open (Low) | Now 12 `alt=""`, all on cards or decorative slides: how-often-should-an-office-be-cleaned (4), office-cleaning-checklist (3), office-cleaning-cost-toronto-guide (3), new commercial-cleaning-quote-checklist (2). Pattern unchanged; 0 images lack an alt attribute except the 2 homepage slides which have a bare `alt`. Per-link heading not verified. |
| N2 | 3 legacy logos on /green-clean-products/ unpictured, WordPress names | Open (Low) | ProSeriesGreen-Logo-270x270.png, armstrong-logo-324x92.png, ECOLOGO-450x450.webp still bare `<img>`. |
| N3 | One post feature image not in `<picture>` | Open (Low) | /how-to-decide-on-a-cleaning-company/ still serves blog-top-cleaning-professional-qualities-feature.jpg as plain JPG. These 4 are the only non-`<picture>` images site-wide (224 pictures for 228 imgs). |
| N4 | Homepage hero width/height 1200x500 vs 640x800 mobile crop | Open (Low) | Attributes unchanged. Not tested for CLS here; see raw/cwv-field-6d.txt. |
| N5 | Odd gallery `sizes` breakpoint | Not verified | Not re-checked. |
| N6 | Large fallback JPGs 177-218 KB | Not applicable | Unchanged, fallback only. gta-office-building-exterior-plaza-1200.jpg is 218 KB and is now also a hero (see N8). |
| Gallery stock label (Phase A) | Gallery labelled as stock | Fixed | /cleaning-demo-gallery/ meta description, og/twitter description and body say "illustrative stock photographs ... not pictures of Evergreen's own crews or of clients' buildings". 13 figcaptions describe the service. |

## 2. New findings (hero images, #93, `src/components/OfferPage.astro`)

What is good, observed: all 13 offer pages have a `<picture class="offer-hero-media">` with AVIF + WebP + JPG sources, `sizes="100vw"`, width/height 1200x800, `loading="eager" fetchpriority="high" decoding="async"`, and a descriptive, non-stuffed alt. The 12 pages with 480/768/1200 sets return 200 for every variant I fetched. The hero is not duplicated in the body on any page: no page repeats an image base name, and body photos (e.g. commercial-disinfection-service on disinfection, high-dusting-warehouse-lift on industrial, night-janitorial-crew on office-cleaning) are different from the hero and are `loading="lazy"`. No two offer pages share a hero. 1200w AVIF sizes: 15-86 KB (typically 26-43 KB); 768w AVIF 9-40 KB. Largest: gta-office-building-exterior-plaza 86.5 KB AVIF, so the LCP photo stays under 100 KB on AVIF browsers.

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| N7 | Medium | /services/graffiti-removal/ hero has no 1200w variant | srcset lists only 480w and 768w; graffiti-removal-pressure-washer-1000/1200 (avif, webp, jpg) all return 404. The other 12 heroes list 480/768/1200. With `sizes="100vw"` on desktop the 768w file is stretched across the full-width hero (img is 1200x800 by attribute), so it will look soft and may be a lower-quality LCP. | Generate the 1200w AVIF/WebP/JPG for this image with the existing variant script, or confirm the source is smaller than 1200 and re-crop; check the variant manifest used by OfferPage.astro. |
| N8 | Low | Heroes are the same stock photos used as gallery items, and are not labelled as stock | e.g. gallery-condo-lobby-maintenance and gallery-lobby-floor-care are the property-management and floor-stripping heroes; the gallery now says "stock", but service-page alts present them as plain scenes with no label. Visible captions/credits on the offer pages were not checked. | Decide whether a short "illustrative photo" note is needed on offer pages to match the gallery disclosure; ideally replace with real jobs (client item below). |
| N9 | Low | Hero alt text is generic for two pages | /industries/property-management/ alt "Empty corridor in a modern building"; /services/building-maintenance/ "Office skyscrapers in downtown Toronto" (does not tie to the service); office-cleaning body image alt "Industrial scrubber cleaning an office corridor" for a file named night-janitorial-crew. Not stuffed, just thin. | Tighten alts to name the subject and the service context, in OfferPage.astro frontmatter or the page data. |
| N10 | Info | Hero photo is the OG image for every offer page, 1200x630 | OG for /services/janitorial-services/ is 1200x630 JPEG, 83 KB (the others were not fetched). The OG file is larger than the 53.9 KB shared one but within norms. | None. |
| N11 | Info | No image preload for the LCP photo | head has only the font preload; `fetchpriority="high"` on the hero partly compensates. LCP effect for the offer pages is covered by the performance specialist's Lighthouse data, not measured here. | Optional: test a preload with `imagesrcset`/`imagesizes` on offer pages. |

No regression found in the gallery, homepage cards, blog thumbnails or HTTP status (the 13 hero sets and 40 OG URLs aside, sampled URLs returned 200).

## 3. Needs the client or an account owner

- Real job photos (with permission) to replace stock heroes and the gallery, and per-location OG artwork if it should show real sites or branding.
- Decision on how to disclose stock imagery on offer pages.

## 4. Not verified

- Rendering and crop quality of the new heroes (screenshots not reviewed), including whether the 768w graffiti hero looks soft on desktop.
- Lighthouse LCP/transfer for the offer-page hero (not re-run).
- OG dimensions for 38 of 40 distinct OG files (only the shared one earlier and janitorial-cart this run).
- Whether every empty-alt thumbnail sits in a link with a heading.
- Whether the 11 other 1200w sets and all 480w/WebP variants load (I fetched AVIF 768/1200 and JPG 1200 only).
- Homepage hero mobile CLS (N4) and the gallery `sizes` breakpoint (N5).

Score: 90/100
Previous: 82/100 (first audit)

# Images - www.evergreencleaningservice.ca (re-audit, 2026-11-06 evening)

Source: raw/crawl/pages.json and raw HTML for the 60 sitemap URLs (219 `<img>` elements in HTML, 217 in the crawler's list), plus HEAD requests (polite, 4 parallel) to all 759 distinct img.evergreencleaningservice.ca URLs referenced in those pages, and one GET each of two OG JPEGs for dimensions. Static analysis; Lighthouse was not re-run.

## 1. Status of first-audit findings

| # | First-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | Gallery: 13 plain JPGs, no picture/srcset/dimensions, no captions | Fixed | /cleaning-demo-gallery/ now has 13 `<figure>` each with `<picture>` (AVIF + WebP + JPG, 480w/768w, `sizes` set), `width="768" height="512"`, `loading="lazy" decoding="async"`, and 13 `<figcaption>` (e.g. "Industrial cleaning: a floor polisher on an open plant floor"). Crawl shows 0 images without dimensions site-wide. Sample gallery-industrial-cleaning-toronto-768: AVIF 12.5 KB vs JPG 39.5 KB (HTTP 200). |
| 2 | Homepage hero slides 2 and 3 load eagerly; no slide-1 preload | Open | / : slides 2 and 3 `<img>` still have no `loading` attribute (eager by default) and no `fetchpriority`; slide 1 has `loading="eager" fetchpriority="high"`. Only preload in head is `/fonts/open-sans.woff2`; no image preload. Mobile-specific 640x800 AVIF/WebP/JPG sources exist for all three slides (slide 1 AVIF 14 KB). Not re-measured in Lighthouse, so LCP effect is not quantified here. |
| 3 | Oversized warehouse card on homepage | Fixed | / : warehouse-floor-scrubber-industrial card now has 480/640/768 variants in AVIF, WebP and JPG with a corrected `sizes` (418/358/298/218px at desktop breakpoints). All three 640 variants return 200 (AVIF 17.8 KB, WebP 29 KB, JPG 41 KB). The 640w card variants are present on the 3 homepage service cards. |
| 4 | Legacy WordPress `-300x150.jpg` thumbnails on related cards | Fixed | 0 `-300x150` URLs in any of the 60 pages. Related-post cards now use `<picture>` with AVIF/WebP/JPG `blog-*-480` and `-768` variants (e.g. blog-office-cleaning-checklist-480.avif 7.3 KB), width/height 480x270, lazy. Residual WordPress-style names remain only on /green-clean-products/ (see N2). |
| 5 | Shared OG image on 20 pages | Open | 22 of 60 pages (was 20 of 59) still use evergreen-modern-commercial-cleaning-hero-og.jpg, including all 4 new location pages (north-york, scarborough, richmond-hill, durham-region) and /locations/, /services/, /industries/. 38 distinct OG images in total. The shared file is 1200x630 JPEG, 53.9 KB. Home also emits `og:image:width/height/alt`. Every page has an og:image (0 missing). |
| 6 | No image sitemap / no ImageObject on gallery | Open (Info, no action needed) | Gallery has captions now but still no ImageObject markup; homepage JSON-LD `image` is the logo banner JPG. Unchanged and still reasonable at this scale. |

Carried-over positives re-confirmed: 0 images missing alt; 212 of 219 `<img>` sit inside `<picture>` with both AVIF and WebP sources; all 759 image URLs referenced return 200; mean sizes AVIF 14.9 KB, WebP 24.7 KB, JPG 50.8 KB; largest AVIF 86.5 KB (gta-office-building-exterior-plaza-1200), largest JPG 218 KB (same image, JPG fallback only). Hero slide 1 AVIF 1200w is 22 KB. OG images spot-checked are 1200x630 (2 of 38 fetched).

## 2. New findings

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| N1 | Low | Empty alt count rose from 4 to 10 | 10 `alt=""` on related-post thumbnails on /how-often-should-an-office-be-cleaned/, /office-cleaning-checklist/, /office-cleaning-cost-toronto-guide/ (plus homepage hero slides 2 and 3, which are decorative stacked slides). Pattern is the same as the first audit (thumbnail inside a card that carries the post title). I did not re-verify per link that each has a heading, so this is likely correct but not confirmed. | If the thumbnail is the only content in a link without a text sibling, give it the post title as alt. Otherwise leave as is. |
| N2 | Low | Three legacy logos on /green-clean-products/ are bare, un-pictured, with WordPress crop names | ProSeriesGreen-Logo-270x270.png, armstrong-logo-324x92.png, ECOLOGO-450x450.webp, 2 PNGs about 6 KB each; all have dimensions. | Rename and convert to WebP/AVIF via the existing variant script when convenient; tiny weight, cosmetic. |
| N3 | Low | One post feature image is not in a `<picture>` | /how-to-decide-on-a-cleaning-company/ serves blog-top-cleaning-professional-qualities-feature.jpg as a plain JPG. Size not measured. | Run it through the responsive-images pipeline like the other posts. |
| N4 | Low | Hero `<img>` width/height (1200x500) do not match the 640x800 mobile art-direction source | / : all three slides keep `width="1200" height="500"` while `<source media="(max-width: 640px)">` serves a 4:5 crop. Layout stability depends on CSS sizing the hero container, which I did not test. | Confirm the hero box is sized by CSS (aspect-ratio/min-height); otherwise this can cause CLS on mobile. Check field CLS in raw/cwv-field-6d.txt. |
| N5 | Info | Gallery `sizes` contains an odd breakpoint (`(min-width: 941px) 477px` between 992px and 768px rules) | Gallery `<picture>` markup. Probably a single-column to two-column layout switch; browser still picks 480 or 768 sensibly. | Verify against the CSS grid; low impact. |
| N6 | Info | Largest page fallback JPGs are 177-218 KB | gta-office-building-exterior-plaza-1200.jpg 218 KB, blog-office-cleaning-cost-toronto-guide-1200.jpg 177 KB; only reached by browsers without AVIF/WebP, so negligible. | None needed. |

No regressions found from the fixes.

## 3. Needs the client or an account owner

- Real job photos (with permission) to replace the stock-style gallery and to differentiate OG images for locations/services; captions written by someone who knows the jobs.
- Approval of any per-location OG artwork if it should show real sites or branding.

## 4. Not verified

- Lighthouse LCP/transfer effect of the unchanged hero slide loading (not re-run; no performance-relevant change was assumed).
- Visual quality of the AVIF/WebP outputs and mobile hero crops (screenshots not reviewed for this area).
- Whether every empty-alt thumbnail sits in a link with a heading.
- OG image dimensions for 36 of the 38 distinct OG files (only the shared one and the warehouse one were fetched).
- File sizes for the few images not referenced in `<picture>` (N3).
- Rendering of the gallery caption layout in a browser.

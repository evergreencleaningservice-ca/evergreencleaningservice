Score: 82/100

# Images — www.evergreencleaningservice.ca (2026-11-06)

Source: 233 `<img>` elements across 60 indexable pages (raw/crawl/pages.json), raw HTML inspection, HEAD requests to img.evergreencleaningservice.ca, Lighthouse network logs.

## What works
- **Alt text:** 0 images missing an alt attribute. 229 have descriptive alt text ("Clean, empty open-plan office with white desks…", "Floor scrubber cleaning a supermarket aisle"). The 4 with `alt=""` are decorative related-post thumbnails inside links that already carry an `<h3>` with the post title, which is correct.
- **Modern formats:** service, location, homepage and post images are wrapped in `<picture>` with AVIF and WebP sources and a JPG fallback; `srcset` + `sizes` on hero and body images; `width`/`height` set on 220 of 233 images.
- **Priority hints:** the LCP hero image carries `fetchpriority="high"`; below-fold images use `loading="lazy"` (130 lazy, 78 eager, 25 default).
- **Hosting and caching:** all images on a dedicated host (img.evergreencleaningservice.ca, Backblaze behind Cloudflare) with `cache-control: public, max-age=2592000, s-maxage=31536000`.
- **File names** are descriptive and keyword-bearing (`office-backpack-vacuum-toronto-480.avif`, `lobby-floor-scrubber-commercial-768.avif`).
- **Social images:** every indexable page has an `og:image`; 39 distinct images, 20 pages share the generic brand image.
- **Page weight:** images are a small share of transfer — 23–38 KB on service/location/post pages, 112 KB on the mobile homepage, against 500–650 KB total dominated by Google tag scripts.

## Findings

### 1. Gallery page serves 13 full-size JPGs with no responsive variants or dimensions — Medium
Evidence: `/cleaning-demo-gallery/` has 13 `<img>` tags pointing to plain `.jpg` files of 37–126 KB each (about 1.1 MB total), no `<picture>`, no `srcset`, no `width`/`height` (the only 13 images on the site without dimensions). They are `loading="lazy"`, so they do not block LCP, but each one shifts layout as it loads and a user who scrolls the page downloads ~1.1 MB of JPG where AVIF would be ~300 KB.
Recommendation: run the gallery through the same pipeline as the other images (`scripts/` image variants + `src/lib/responsive-images.mjs`), emit AVIF/WebP with 480/768 variants, and set intrinsic dimensions. Add a caption per photo (see on-page finding 4).

### 2. All three homepage hero slides are downloaded eagerly on mobile — Medium
Evidence: the hero rotates three `<picture>` slides. Slide 1 has `fetchpriority="high"` (correct); slides 2 and 3 have no `loading` attribute, so they load immediately: Lighthouse mobile shows `office-cleaning-cost-boardroom-hero-mobile-640x800.avif` (24 KB) and `spring-office-desk-cleaning-toronto-hero-mobile-640x800.avif` (15 KB) fetched during the LCP window. Lighthouse's LCP breakdown attributes 3.6 s to the hero "load time" on the throttled mobile profile.
Recommendation: in the hero component, give slides 2 and 3 `loading="lazy"` and `fetchpriority="low"`, or swap them in with JS after `load`. Also preload the slide-1 AVIF with `<link rel="preload" as="image" imagesrcset imagesizes>` so it is requested before the inline CSS is parsed (only the font is preloaded today).

### 3. One oversized card image — Low
Evidence: Lighthouse flags `warehouse-floor-scrubber-industrial-768.avif` (768×431) displayed at 380×253 on the homepage, 14 KB wasted.
Recommendation: use the 480 variant in that card's `srcset`/`sizes`, as the neighbouring cards already do.

### 4. Legacy WordPress thumbnail sizes still in use — Low
Evidence: 32 `-300x150.jpg` thumbnails (plus one each of `270x270`, `324x92`, `450x450`) on related-post cards, served as JPG only (about 7 KB each). Harmless, but inconsistent with the AVIF pipeline and the 300×150 crop is low-resolution on 2x screens.
Recommendation: generate 480-wide AVIF/WebP variants for the related-card images via the existing `images:feature-variants` script and drop the WordPress crop names.

### 5. Shared OG image on 20 pages — Low
Evidence: `evergreen-modern-commercial-cleaning-hero-og.jpg` (53 KB, JPEG) is the social image for 20 of 59 pages including most service and location pages.
Recommendation: per-service OG images already exist for industrial and commercial; extend to the remaining services and locations so shared links look specific. 1200×630 JPEG at ~60 KB is fine for OG; do not switch to AVIF (social scrapers do not support it).

### 6. No image sitemap and no `ImageObject` schema on the gallery — Info
Evidence: images are discoverable through `<img>` tags and the sitemap agent judged an image sitemap unnecessary at this scale.
Recommendation: none now; revisit if the gallery grows into a portfolio of real job photos (then an `ImageObject` per photo with `caption` and `contentLocation` is worth adding).

## Quick wins
1. Lazy-load hero slides 2 and 3 and preload slide 1 (homepage LCP).
2. Convert the 13 gallery JPGs to AVIF/WebP with dimensions.
3. Use the 480 variant for the warehouse card on the homepage.

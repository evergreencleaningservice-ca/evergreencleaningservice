# Images audit — evergreencleaningservice.ca

Skill: `claude-seo:seo-images` (v2.5.0). Date: 2026-10-28.
Scope: 21 pages (home, 9 service pages, 2 industry pages, 2 location pages, /about-us/, /insights/, 5 blog posts), rendered at 390x844 @3x and 1366x768 @1x with headless Chromium (Playwright), plus curl for static HTML, image bytes and headers. Comparison: jan-pro.com/ and jan-pro.com/commercial-cleaning-services/.

Not done: **Image SERP analysis skipped — DataForSEO MCP is not installed**, so no competitor image-SERP landscape or opportunity score. The plugin's own Python parsers (`parse_html.py`, `iptc_ai_label.py`) could not run here (they refuse the local HTTP proxy); equivalent checks were done with Playwright, curl and Pillow. `exiftool`/`cwebp` are not installed; metadata was read with Pillow (EXIF/XMP/IPTC/C2PA presence only).

Raw data: `raw/images/inventory.csv` (132 rows = 66 `<img>` placements x 2 viewports), `raw/images/page_stats.json`, `raw/images/evergreen.json` + `janpro.json` (full Playwright dumps), `raw/images/files/` (all 115 referenced variants), `raw/images/og/`, `raw/images/fav/`, `raw/images/html/`.

---

## 1. Image audit summary (21 pages, desktop placements unless noted)

| Metric | Status | Count |
|---|---|---|
| `<img>` placements audited | - | 66 per viewport (40 unique files served) |
| Pages with **no content image at all** (logo only) | ❌ | 8 of 21 (building-maintenance, graffiti-removal, post-construction, pressure-washing, property-management, toronto-downtown, mississauga, about-us) |
| Missing `alt` attribute | ✅ | 0 |
| Empty `alt=""` on meaningful images | ❌ | 19 (home hero LCP image, 3 home service-card photos, 13 blog thumbnails, 2 legacy logos in posts) |
| Generic alt ("logo", "company logo") | ⚠️ | 2 |
| Weak/keyword-only alt ("emergency office cleaning") | ⚠️ | 1 |
| Served as JPEG with no AVIF/WebP alternative | ❌ | 36 of 66 placements (16 unique 1200x800 body photos + 10 blog thumbnails + 3 legacy logos) |
| Served as AVIF via `<picture>` | ✅ | 30 of 66 (logo, hero, home cards, 5 blog feature images) |
| No `width`/`height` attributes | ⚠️ | 23 placements (every body image inside `<p>` + legacy logos) |
| No `srcset`/`sizes` on photos wider than their slot | ⚠️ | 16 unique body photos (1200px served into 740-790px slots) |
| Upscaled images (intrinsic < CSS px) | ⚠️ | 13 (300x150 blog thumbs rendered 360x180 on mobile, 1080 device px needed) |
| Oversized files (>100 KB content image, skill target <100 KB) | ⚠️ | 6 (max 127 KB); none >200 KB |
| Lazy-loading on above/near-fold images | ⚠️ | 3 borderline (lazy image whose top is 650-830 px, see 3.4) |
| LCP image preloaded | ⚠️ | 0 of 21 (hero uses `fetchpriority="high"` instead — acceptable) |
| CLS measured (max) | ✅ | 0.075 mobile on one blog post; all others <0.07, most <0.01 |
| OG/Twitter image present | ✅ | 21/21, all 1200x630 JPEG, 63-149 KB |
| OG image unique to the page | ⚠️ | 14/21 — 7 pages reuse the generic home hero |
| `og:image:width/height/alt`, `twitter:image:alt` | ❌ | 0/21 |
| Favicon set | ✅ (minor gaps) | favicon.ico 16/32/48, favicon-512.png, apple-touch-icon 180 — no SVG icon, no web manifest |
| CDN | ✅ | `img.evergreencleaningservice.ca` = Backblaze B2 behind Cloudflare (`cf-cache-status: HIT`, `cache-control: public, max-age=86400, s-maxage=31536000`), `preconnect` present |
| AI-provenance metadata on AI-generated photos | ❌ | 0 — no EXIF/XMP/IPTC/C2PA at all on any file |

### Bytes and savings (estimates — see method in 1.1)

| Scope | Image bytes now | Est. after fix | Est. saving |
|---|---|---|---|
| 36 unique files actually served on desktop | 1,640 KB | ~460 KB | **~1,180 KB (72%)** |
| Sum of all 21 pages, desktop @1x | 2,344 KB | ~610 KB | ~1,730 KB |
| Sum of all 21 pages, mobile @3x (capped at 2x target) | 2,365 KB | ~635 KB | ~1,730 KB |

**1.1 Estimation method (labelled estimate).** For each placement: (a) if the intrinsic width exceeds 1.15x the needed width (rendered CSS px x min(DPR, 2)), bytes scaled by the pixel-area ratio; (b) JPEG/PNG converted to AVIF at 0.47x bytes — the ratio measured on this site's own existing pairs (hero-1600: 102 KB JPEG -> 45 KB AVIF = 0.44; five blog features 0.45-0.53). Real encodes will vary ±15%. Phones at 3x would need ~1170 px for a full-width image; the 2x cap matches common practice and the site's own hero strategy.

### Per-page totals

| Page | Template | Imgs | Bytes mobile | Bytes desktop | Est. saving | LCP element (desk/mob) | CLS desk/mob |
|---|---|---|---|---|---|---|---|
| / | home | 8 | 143 KB | 122 KB | 21-51 KB | hero AVIF / hero AVIF | 0.001 / 0.000 |
| /services/building-maintenance/ | service | 1 (logo) | 5 KB | 5 KB | ~4 KB | H1 / P | 0.012 / 0.000 |
| /services/commercial-cleaning/ | service | 2 | 107 KB | 107 KB | 86-88 KB | H1 / P | 0.001 / 0.000 |
| /services/disinfection-cleaning/ | service | 4 | 255 KB | 255 KB | 204-209 KB | P / P | 0.003 / 0.022 |
| /services/emergency-cleaning/ | service | 2 | 129 KB | 129 KB | 103-106 KB | IMG (jpg, lazy) / P | 0.024 / 0.000 |
| /services/graffiti-removal/ | service | 1 (logo) | 5 KB | 5 KB | ~4 KB | P / P | 0.031 / 0.000 |
| /services/industrial-cleaning/ | service | 3 | 241 KB | 241 KB | 193-198 KB | IMG (jpg, lazy) / P | 0.013 / 0.000 |
| /services/office-cleaning/ | service | 3 | 210 KB | 210 KB | 168-172 KB | P / P | 0.001 / 0.000 |
| /services/post-construction-cleaning/ | service | 1 (logo) | 5 KB | 5 KB | ~4 KB | H1 / P | 0.001 / 0.021 |
| /services/pressure-washing/ | service | 1 (logo) | 5 KB | 5 KB | ~4 KB | P / H2 | 0.035 / 0.000 |
| /industries/medical-dental-clinics/ | industry | 2 | 84 KB | 84 KB | 67-68 KB | H1 / P | 0.001 / 0.000 |
| /industries/property-management/ | industry | 1 (logo) | 5 KB | 5 KB | ~4 KB | H1 / P | 0.001 / 0.001 |
| /locations/toronto-downtown/ | location | 1 (logo) | 5 KB | 5 KB | ~4 KB | P / H1 | 0.006 / 0.038 |
| /locations/mississauga/ | location | 1 (logo) | 5 KB | 5 KB | ~4 KB | P / P | 0.035 / 0.061 |
| /about-us/ | about | 1 (logo) | 5 KB | 5 KB | ~4 KB | P / P | 0.001 / 0.002 |
| /insights/ | blog index | 11 | 112 KB | 112 KB | ~60 KB | IMG (300x150 jpg) | 0.005 / 0.000 |
| /benefits-of-commercial-deep-cleaning-services/ | post | 5 | 252 KB | 252 KB | 174-189 KB | IMG (feature AVIF) / P | 0.002 / 0.000 |
| /how-to-decide-on-a-cleaning-company/ | post | 3 | 120 KB | 120 KB | 83-89 KB | IMG (feature AVIF) / P | 0.002 / **0.075** |
| /cleaning-check-list-dental-clinics/ | post | 5 | 204 KB | 204 KB | 148-158 KB | IMG (feature AVIF) / P | 0.002 / 0.006 |
| /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ | post | 5 | 261 KB | 261 KB | 191-203 KB | IMG / IMG | 0.003 / 0.000 |
| /areas-in-your-office-where-germs-are-likely-hiding/ | post | 5 | 209 KB | 209 KB | 151-161 KB | IMG / IMG | 0.014 / 0.003 |

Notes: bytes are the files the browser actually fetched (AVIF where `<picture>` exists, JPEG elsewhere). CLS on the image-free location pages comes from font swap, not images. Logo "saving" is just a 440 px AVIF served into a 200 px slot (trivial).

---

## 2. Inventory highlights (unique files served; full table in `raw/images/inventory.csv`)

**Well-built component images (AVIF/WebP/JPEG `<picture>`, width/height, decoding=async):**

| File | Served | Intrinsic | Rendered 390 / 1366 | Bytes | Notes |
|---|---|---|---|---|---|
| cropped-evergreen-cleaning-toronto-logo-banner.avif | AVIF | 440x132 | 113x34 / 200x60 | 5.1 KB | eager, in `<picture>`, alt OK; attrs say 884x265 (same ratio, fine) |
| evergreen-modern-commercial-cleaning-hero-mobile-640x800.avif | AVIF | 640x800 | 390x549 (@3x needs 1170) | 23.4 KB | LCP on mobile at ~560-1300 ms; fetchpriority=high; **alt=""** |
| evergreen-modern-commercial-cleaning-hero-1600.avif | AVIF | 1600x667 | — / 1366x515 | 44.8 KB | LCP on desktop ~580-720 ms; 480/768/1000/1600 srcset + sizes=100vw; **alt=""** |
| office-backpack-vacuum-toronto-{480,768}.avif (+lobby, warehouse) | AVIF | 480x320 / 768x512 | 358x201 / 356x237 | 12-29 KB | home service cards, sizes="(min-width:992px) 360px, 100vw", lazy; **alt=""** |
| blog-*-feature.avif (5 posts) | AVIF | 960x480 | 360x180 / 790x395 | 26-42 KB | post hero, eager, width/height set, good alt; no `fetchpriority`, no srcset (2x desktop would need 1580 px) |

**Problem group A — body photos dropped into `<p>` as plain `<img>` (16 unique files, JPEG only, no srcset, no width/height):**

| File | Intrinsic | Rendered 390 / 1366 | Bytes | Est. after 800w AVIF | Pages |
|---|---|---|---|---|---|
| flooded-office-water-extraction.jpg | 1200x800 | 390x260 / 740x493 | 127.2 KB | ~27 KB | emergency-cleaning |
| high-dusting-warehouse-lift.jpg | 1200x800 | 390x260 / 740x493 | 125.4 KB | ~26 KB | industrial-cleaning |
| warehouse-floor-scrubber-industrial.jpg | 1200x800 | 390x260 / 740-790 | 116.7 KB | ~24 KB | industrial-cleaning, robotic-vs-manual post |
| office-backpack-vacuum-toronto.jpg | 1200x800 | 390x260 / 740x493 | 116.3 KB | ~24 KB | office-cleaning |
| lobby-floor-scrubber-commercial.jpg | 1200x800 | 390x260 / 740-790 | 104.8 KB | ~22 KB | commercial-cleaning, robotic-vs-manual post |
| spring-office-desk-cleaning-toronto.jpg | 1200x800 | 360x240 / 790x527 | 95.7 KB | ~20 KB | germs post |
| night-janitorial-crew-office-toronto.jpg | 1200x800 | 390x260 / 740-790 | 93.6 KB | ~20 KB | office-cleaning, disinfection, deep-cleaning post |
| eco-friendly-surface-cleaning-green-cloths.jpg | 1200x800 | 360x240 / 790x527 | 91.6 KB | ~19 KB | deep-cleaning post |
| cleaning-quality-inspection-clipboard.jpg | 1200x800 | 360x240 / 790x527 | 91.1 KB | ~19 KB | how-to-decide post |
| door-handle-disinfection-office.jpg | 1200x800 | 390x260 / 740-790 | 87.2 KB | ~18 KB | disinfection, dental checklist post |
| dental-office-cleaning-technician.jpg | 1200x800 | 390x260 / 740-790 | 80.4 KB | ~17 KB | medical-dental industry, dental checklist post |
| touchpoint-disinfection-door-handle.jpg | 1200x800 | 360x240 / 790x527 | 77.1 KB | ~16 KB | germs post |
| commercial-disinfection-service.jpg | 1200x800 | 390x260 / 740x493 | 74.7 KB | ~16 KB | disinfection |
| cropped-evergreen-cleaning-torotno-site-logo-banner.jpg | 902x230 | 360x92 / 790x201 | 25.2 KB | remove | deep-cleaning post (legacy WP logo, typo "torotno") |
| evergreen-cleaning-toronto-logo-banner.jpg | 902x295 | 360x118 / 790x258 | 9.6 KB | remove | dental checklist post, robotic post (legacy logo) |
| cropped-evergreen-cleaning-toronto-logo-banner.jpg | 884x265 | 360x108 / 790x237 | 9.3 KB | remove | germs post (legacy logo, alt="") |

**Problem group B — blog-list thumbnails (10 unique files on /insights/, 3 reused on home):** `blog-*-feature-300x150.jpg`, 300x150 JPEG, 8.5-12 KB each, rendered 360x180 on mobile (1080 device px needed = 3.6x upscale, visibly soft), inside `<a tabindex="-1" aria-hidden="true">` with `alt=""`. The 960x480 feature image (and AVIF/WebP) already exists for every post that has been rebuilt — the 300x150 crops are leftovers from the WordPress media library.

---

## 3. Issues by severity

### Critical

**3.1 Eight of 21 money pages have no photograph at all.** `/services/building-maintenance/`, `/services/graffiti-removal/`, `/services/post-construction-cleaning/`, `/services/pressure-washing/`, `/industries/property-management/`, `/locations/toronto-downtown/`, `/locations/mississauga/`, `/about-us/` render only the header logo (no `<img>`, no CSS background images). Service and location pages with zero visuals lose Google Images exposure entirely, read as thin against Jan-Pro's photo-led service pages, and give social crawlers nothing page-specific (3.6). The OG images that already exist for these pages (e.g. `gta-office-building-exterior-plaza-og.jpg`, `gallery-condo-lobby-maintenance-og.jpg`, `toronto-skyline-modern-og.jpg`) are not used on-page.

**3.2 Body photos are unoptimised plain JPEGs (16 unique files, 36 placements).** Every image inside article/service copy is `<img src="...1200x800.jpg" alt="..." loading="lazy" decoding="async">` with no `<picture>`, no `srcset`/`sizes`, no `width`/`height`. They are 75-127 KB each and account for ~1.2 MB of the ~1.64 MB unique image payload across the audited pages. Desktop slots are 740-790 px; a 2x-ready 800w/1600w AVIF+WebP set would cut each to ~16-27 KB at 1x (estimate). Affected: all 9 service/industry pages that have photos, and all 5 blog posts.

### High

**3.3 Empty `alt=""` on 19 meaningful images, including the homepage LCP hero.** The home hero (`evergreen-modern-commercial-cleaning-hero-*`), the three home service-card photos, the 13 blog thumbnails (home + /insights/) and 2 legacy logos are all `alt=""`. The thumbnails sit in `aria-hidden` duplicate links, so screen readers are fine, but Google Images gets no text for any of them, and the hero — the single most prominent image on the site — is declared decorative. Rewrites in section 4.

**3.4 No `width`/`height` on 23 placements (CLS risk, confirmed on one page).** All group-A images and legacy logos. Measured CLS is low because they are lazy and below the fold, but `/how-to-decide-on-a-cleaning-company/` on mobile hit **0.075** when `cleaning-quality-inspection-clipboard.jpg` (top = 764 px, lazy, no dimensions) loaded into view; `/services/emergency-cleaning/` and `/services/industrial-cleaning/` desktop put a lazy, dimensionless JPEG at 650-700 px (first viewport on 768 px) and it became the LCP element at 470-590 ms. Add dimensions (or CSS `aspect-ratio: 3/2`) and drop `loading="lazy"` from the first body image when it sits in the first viewport.

**3.5 Blog thumbnails upscaled 3.6x on phones and JPEG-only.** 13 placements of 300x150 crops into 360 CSS px (1080 device px). Swap to the existing 960x480 feature set with `sizes="(min-width: 992px) 300px, 100vw"` and AVIF/WebP sources (~+10 KB/thumb on desktop, net -25% on mobile vs the current soft image — estimate).

**3.6 Generic OG image on 7 pages.** `/`, `/services/graffiti-removal/`, `/services/post-construction-cleaning/`, `/services/pressure-washing/`, `/locations/toronto-downtown/`, `/locations/mississauga/`, `/insights/` all share `evergreen-modern-commercial-cleaning-hero-og.jpg`. Shared links for three service pages and both location pages show the same office-vacuuming shot. No page declares `og:image:width`, `og:image:height`, `og:image:alt` or `twitter:image:alt` (Jan-Pro does all four).

### Medium

**3.7 Legacy WordPress logo images left inside 4 blog posts.** `cropped-evergreen-cleaning-torotno-site-logo-banner.jpg` (alt "logo", filename typo) on the deep-cleaning post, `evergreen-cleaning-toronto-logo-banner.jpg` (alt "" / "company logo") on the dental-checklist and robotic posts, `cropped-evergreen-cleaning-toronto-logo-banner.jpg` (alt "") on the germs post. They render as a 790 px wide banner at the end of the article, duplicate the header logo, and add 9-25 KB. Remove them from the content (or keep one small signature with `alt="Evergreen Cleaning Service"` and dimensions).

**3.8 Weak alt on `/services/emergency-cleaning/`:** `alt="emergency office cleaning"` is a keyword phrase, not a description of the photo (a technician extracting standing water from a flooded office floor).

**3.9 Obviously AI-generated photography with no provenance metadata.** Viewed: hero, office-backpack-vacuum, dental-office-cleaning-technician, blog-robotic feature, flooded-office, night-janitorial-crew, blog-break-room thumbnail. All share the tell-tale synthetic look: the CN Tower framed in the window of nearly every "office", identical green polos, render-smooth surfaces, no camera EXIF, no XMP/IPTC, no C2PA/JUMBF. Nothing on the site says the images are generated. Not a ranking issue, but (a) Google's guidance and the IPTC standard expect `DigitalSourceType = trainedAlgorithmicMedia` on AI imagery, (b) trust: a prospect who notices the same skyline in every "job site" photo will doubt the testimonials too, and (c) there is no real crew/van/before-after photo anywhere on the 21 pages (Jan-Pro at least shows photographed uniformed staff). Recommend injecting the IPTC label on every generated file and adding at least a few real photos (team, vehicle, a genuine before/after) to About, Locations and the gallery.

**3.10 Blog-post feature images are not responsive for 2x desktop and carry no `fetchpriority`.** Single 960 px AVIF/WebP/JPEG source rendered at 790 CSS px; on a 2x laptop it is upscaled 1.65x. It is the desktop LCP (380-656 ms, fine) but gets default priority. Add a 1600w candidate + `sizes`, and `fetchpriority="high"` on the post template.

### Low

**3.11 Home hero mobile source is 640 px for a 390 CSS px @3x slot (1170 px needed; 780 at 2x).** Deliberate trade-off (23 KB AVIF); acceptable. Consider a 960x1200 AVIF (~45 KB est.) for 2x+ phones.
**3.12 No `<link rel="preload" as="image" imagesrcset=...>` for the hero.** `fetchpriority="high"` inside the HTML `<picture>` already gets it discovered by the preload scanner; measured LCP 560-720 ms. Only worth adding if a render-blocking stylesheet grows.
**3.13 Favicon:** no `rel="icon" type="image/svg+xml"`, no web manifest / 192 px icon for Android install prompts. `favicon.ico` correctly packs 16/32/48. Minor.
**3.14 Lazy-loaded card images near the fold on mobile:** home `office-backpack-vacuum-toronto-768.avif` at top = 809 px (viewport 844) is `loading="lazy"`; consider eager for the first card.
**3.15 `Organization.image` in JSON-LD is the 884x265 logo** on every page; `LocalBusiness`/`Service` would benefit from a real photo as `image` and `ImageObject` with `license`/`creator` for the content images (cross-ref `seo-schema`).
**3.16 Filenames** are descriptive and hyphenated (good) except the typo `torotno` and the WP-era `-300x150` suffixes.

---

## 4. Alt-text rewrite list (every missing/empty/weak alt)

| Page(s) | Image | Current alt | Proposed alt |
|---|---|---|---|
| / | evergreen-modern-commercial-cleaning-hero-* (LCP hero, desktop + mobile source) | "" | `Evergreen cleaners vacuuming and wiping desks in a Toronto office with the CN Tower skyline behind` |
| / | office-backpack-vacuum-toronto-480/768 (Office Cleaning card) | "" | `Cleaner using a backpack vacuum on open-plan office carpet` |
| / | lobby-floor-scrubber-commercial-480/768 (Commercial Cleaning card) | "" | `Auto-scrubber polishing a commercial building lobby floor` |
| / | warehouse-floor-scrubber-industrial-480/768 (Industrial card) | "" | `Ride-on floor scrubber cleaning a warehouse aisle` |
| /, /insights/ | blog-break-room-cleaning-feature-300x150 | "" | `Cleaner wiping a break-room counter beside a stocked office fridge` |
| /, /insights/ | blog-cleanable-office-layout-feature-300x150 | "" | `Open office layout arranged so floors and desks are easy to clean` |
| /, /insights/ | blog-robotic-versus-manual-cleaning-feature-300x150 | "" | `Cleaner detailing lobby edges while a robotic scrubber cleans the floor` |
| /insights/ | blog-modern-versus-old-cleaning-feature-300x150 | "" | `Modern microfibre and machine cleaning tools next to a traditional mop and bucket` |
| /insights/ | blog-cleaning-techniques-to-avoid-feature-300x150 | "" | `Cleaner using the wrong product on a commercial floor, leaving streaks` |
| /insights/ | blog-retail-store-cleaning-checklist-feature-300x150 | "" | `Retail store aisle being cleaned before opening` |
| /insights/ | blog-fall-office-cleaning-feature-300x150 | "" | `Entrance mats and lobby floor being cleaned of autumn leaves` |
| /insights/ | blog-regular-commercial-cleaning-feature-300x150 | "" | `Janitorial crew on a scheduled evening clean of a commercial office` |
| /insights/ | blog-hand-washing-importance-feature-300x150 | "" | `Employee washing hands at an office washroom sink` |
| /insights/ | blog-office-relocation-cleaning-feature-300x150 | "" | `Empty office being cleaned after furniture removal for a relocation` |
| /services/emergency-cleaning/ | flooded-office-water-extraction.jpg | "emergency office cleaning" | `Technician extracting standing water from a flooded Toronto office floor with a wet vacuum` |
| /benefits-of-commercial-deep-cleaning-services/ | cropped-evergreen-cleaning-torotno-site-logo-banner.jpg | "logo" | Remove image; if kept: `Evergreen Cleaning Service logo` |
| /cleaning-check-list-dental-clinics/ | evergreen-cleaning-toronto-logo-banner.jpg | "" | Remove image; if kept: `Evergreen Cleaning Service logo` |
| /robotic-vs-manual-cleaning-which-will-ultimately-succeed/ | evergreen-cleaning-toronto-logo-banner.jpg | "company logo" | Remove image; if kept: `Evergreen Cleaning Service logo` |
| /areas-in-your-office-where-germs-are-likely-hiding/ | cropped-evergreen-cleaning-toronto-logo-banner.jpg | "" | Remove image; if kept: `Evergreen Cleaning Service logo` |

Thumbnail alts above assume the 300x150 crops match the post topics (verified visually for break-room; the rest are inferred from filenames — confirm before publishing). The 20 existing descriptive alts (45-90 chars, e.g. "Cleaner vacuuming an open-plan office with a backpack vacuum") are good and need no change; two could add location context where the page is local (e.g. dental-office-cleaning-technician on the industry page: `Cleaner disinfecting a dental treatment chair in a GTA clinic`).

---

## 5. OG / Twitter image gaps per template

| Template | Pages | og:image | Unique? | Size | Gaps |
|---|---|---|---|---|---|
| Home | 1 | evergreen-modern-commercial-cleaning-hero-og.jpg | yes (but shared by 6 others) | 1200x630, 79 KB | no width/height/alt |
| Service (9) | office, commercial, disinfection, emergency, industrial, building-maintenance | page-specific | yes | 1200x630, 68-149 KB | no width/height/alt |
| Service (9) | graffiti-removal, post-construction, pressure-washing | generic home hero | **no** | — | needs page-specific image (none exists on-page either) |
| Industry (2) | medical-dental, property-management | page-specific | yes | 63-107 KB | property-management OG photo (`gallery-condo-lobby-maintenance-og.jpg`) is not shown on the page itself |
| Location (2) | toronto-downtown, mississauga | generic home hero | **no** | — | needs a city-specific image (skyline / local street + crew) |
| About | 1 | toronto-skyline-modern-og.jpg | yes | 143 KB | the skyline photo is not on the page |
| Blog index | 1 | generic home hero | **no** | — | use a blog-specific composite |
| Blog post (5) | all five | post feature `-og.jpg` | yes | 79-123 KB | no width/height/alt |

All 21 use `twitter:card = summary_large_image` with `twitter:image` = og:image. Every OG file is exactly 1200x630 (correct); the largest (`gta-office-building-exterior-plaza-og.jpg` 149 KB, `toronto-skyline-modern-og.jpg` 143 KB) could drop to ~90 KB at q75 without visible loss (estimate). Add `og:image:width="1200"`, `og:image:height="630"`, `og:image:alt` and `twitter:image:alt` to the layout — one template change.

---

## 6. Jan-Pro comparison

| Check | Evergreen (21 pages) | jan-pro.com/ | jan-pro.com/commercial-cleaning-services/ |
|---|---|---|---|
| Stack | Astro static, images on Cloudflare-fronted B2 (`img.` subdomain) | WordPress + WP Rocket, same-origin uploads | same |
| `<img>` in DOM | 1-11 per page | 17 (8 SVG award badges, 5 PNG, 1 JPG) | 46 (16+ SVG icons, 5 PNG, 5 JPG) |
| Modern formats | AVIF+WebP `<picture>` on 30/66 placements | **0** WebP/AVIF, 0 `<picture>` | 0 |
| Image bytes fetched (desktop / mobile) | 5-261 KB per page | ~206 / 203 KB (67 KB PNG hero figure, 35 KB YouTube poster, ~100 KB of award SVGs) | ~408 / 348 KB incl. 227 KB `cedra-prop-1.png` (838x1200 PNG photo), 72 KB `Tory-microfiber-cropped.png`, 1024px JPEGs on mobile |
| Lazy loading | native `loading="lazy"` | WP Rocket JS (`data-lazy-src`, SVG placeholders; `lazy_method = js-generic`) — no native attr, by design | same; 46 JS-lazy |
| width/height | missing on 23 body placements | present on all | present on all |
| srcset | hero + cards only | none | 7 (WP core srcset) |
| LCP | hero AVIF 560-720 ms | DIV background PNG, 890-1100 ms | preloaded PNG with `fetchpriority=high`, ~690 ms |
| Alt text | 45 ok, 19 empty, 2 generic, 1 weak | all present; many filename-derived ("entreprenuermag 1commercialclean", "USAToday top50franchise") | all present; mix of good ("Image of a janitorial cleaning professional mopping a floor") and filename junk ("autodealer hover 1", 20+ icon alts) |
| OG | per-page photo 1200x630, no dims/alt | **logo PNG** 1569x521 for every page, with width/height/alt | same logo |
| Photos | AI-generated, Toronto-themed, consistent | photographed brand staff (studio) + Shutterstock (`shutterstock_1008151123` in filename) | same |
| CDN | yes (Cloudflare) | Cloudflare in front of WP | same |

Net: Evergreen is technically ahead on formats, bytes, LCP and CDN; Jan-Pro is ahead on width/height discipline, OG meta completeness, alt coverage, and on having photos (even if stock/studio) on every section of every page. Evergreen's biggest competitive gap is simply that 8 of its 21 key pages are image-less, and its body photos skip the optimisation its own hero already has.

---

## 7. Prioritised fixes

1. **Build one `ResponsiveImage` component and use it for every body/article image** (group A, 16 files, 36 placements): `<picture>` with AVIF+WebP+JPEG, 480/800/1200/1600w candidates, `sizes="(min-width: 992px) 790px, 100vw"`, `width="1200" height="800"`, `decoding="async"`, `loading="lazy"` only when not in the first viewport. Est. -1.2 MB unique / -80% per page; fixes 3.2 + 3.4 + 3.10 in one change. (Effort: low; it already exists for the hero/cards.)
2. **Add real content images to the 8 image-less pages** (3.1): at minimum the page's existing OG photo as an in-page figure with a descriptive, location-aware alt; ideally a service-specific photo per page (graffiti removal, pressure washing, post-construction, building exterior, condo lobby, Toronto/Mississauga crews, team photo on About). Also creates page-specific OG images for 3.6.
3. **Alt text pass** (section 4): hero, 3 home cards, 13 thumbnails, emergency-cleaning photo — 18 edits in 3 components + 1 page.
4. **Replace the 300x150 thumbnails** with the 960x480 feature set via the same component (3.5); regenerate feature images for the 5 older posts that only have the WP crop.
5. **Delete the legacy logo images from 4 blog posts** (3.7) and fix the `torotno` filename if the asset is kept anywhere.
6. **OG template**: add `og:image:width/height/alt` + `twitter:image:alt`; assign unique OG images to graffiti, post-construction, pressure-washing, both locations and /insights/ (3.6).
7. **Label AI imagery**: inject `XMP-iptcExt:DigitalSourceType=trainedAlgorithmicMedia` (plus Creator/Copyright) into every generated file at build time (exiftool or the plugin's `iptc_ai_label.py inject` where it can run), and add 3-5 genuine photos (3.9).
8. Minor: `fetchpriority="high"` on blog feature image; eager-load the first home card; add SVG favicon + manifest; `ImageObject`/`image` in LocalBusiness schema (cross-ref `seo-schema`); consider a 960 px-wide mobile hero for 3x phones.

---

## 8. Images score: **61 / 100**

Reasoning (weighted against the skill's checks):

- **Format & delivery (25 pts): 15.** Hero, logo, cards and post features are exemplary (AVIF/WebP `<picture>`, srcset, fetchpriority, 23-45 KB LCP image, Cloudflare CDN with 1-year edge cache). But 55% of placements and ~72% of bytes are plain JPEG with no modern format or responsive candidates.
- **Alt text (20 pts): 11.** No missing attributes and 20 well-written descriptive alts, but 19 meaningful images (including the LCP hero and every blog thumbnail) are `alt=""`, plus 2 generic and 1 keyword-only.
- **CLS / dimensions / lazy (15 pts): 9.** Measured CLS is good everywhere except one 0.075 mobile reading, but 23 placements lack width/height and three lazy images sit in the first viewport.
- **Coverage / content (15 pts): 4.** Eight of 21 commercial pages have no image at all; thumbnails are upscaled legacy crops; legacy logos litter 4 posts.
- **Social / OG / favicon (10 pts): 7.** 100% OG coverage at the right size, but 7 generic reuses and no width/height/alt; favicon fine bar SVG/manifest.
- **File size (10 pts): 8.** Nothing over 200 KB, hero tiny; six content images sit above the 100 KB target.
- **Provenance / metadata (5 pts): 2.** Descriptive filenames (good); no IPTC/XMP at all on AI-generated photography.

Fixing items 1-3 of section 7 (one component, image placement on 8 pages, alt pass) would move the score to roughly 85.

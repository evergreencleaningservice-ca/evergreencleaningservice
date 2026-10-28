# SEO Image Plan (OG / social / schema) — evergreencleaningservice.ca

Skill: claude-seo `seo-image-gen` (v2.5.0), **audit-only agent mode** — the nanobanana/Gemini MCP is not installed, so nothing was generated. This is the plan the owner/designer executes, preferably with the real crew photos the client has been asked for. Date: 2026-10-28.
Raw: `raw/i18n-images/eg-*.html`, downloaded OG files + headers in `raw/i18n-images/og/`.

## 1. Audit of existing og:image / twitter:image per template

All pages set `og:type`, `og:image`, `twitter:card=summary_large_image`, `twitter:image` (same URL). **No page sets `og:image:width`, `og:image:height` or `og:image:alt`.** All OG files are 1200x630 JPEG, served from `img.evergreencleaningservice.ca` with HTTP 200.

| Template | Page checked | og:image file | px | bytes | Generic? | Notes |
|---|---|---|---|---|---|---|
| Home | `/` | `evergreen-modern-commercial-cleaning-hero-og.jpg` | 1200x630 | 79,270 | **shared by 4+ pages** | Two green-polo cleaners, glass office, CN Tower. AI-rendered (uniform crews, flawless light). No logo/text. |
| Service | `/services/office-cleaning/` | `office-backpack-vacuum-toronto-og.jpg` | 1200x630 | 84,758 | page-specific | matches page hero image family |
| Service | `/services/commercial-cleaning/` | `lobby-floor-scrubber-commercial-og.jpg` | 1200x630 | 88,842 | page-specific | |
| Industry | `/industries/medical-dental-clinics/` | `dental-office-cleaning-technician-og.jpg` | 1200x630 | 63,145 | page-specific | AI-rendered dental op; green scrubs; fine subject |
| Industry | `/industries/property-management/` | `gallery-condo-lobby-maintenance-og.jpg` | 1200x630 | 107,361 | page-specific | |
| Location | `/locations/mississauga/`, `/locations/toronto-downtown/` | hero-og (same as home) | 1200x630 | 79,270 | **generic banner** | identical card for every city page |
| Blog index | `/insights/` | hero-og (same as home) | 1200x630 | 79,270 | **generic banner** | |
| Blog post | `/benefits-of-commercial-deep-cleaning-services/` | `blog-commercial-deep-cleaning-feature-og.jpg` | 1200x630 | 122,732 | per-post | AI carpet-extractor scene, no text |
| Blog post | `/a-cleaning-checklist-for-your-retail-store/` | `blog-retail-store-cleaning-checklist-feature-og.jpg` | 1200x630 | 99,481 | per-post | |
| About | `/about-us/` | `toronto-skyline-modern-og.jpg` | 1200x630 | 143,312 | **stock-style skyline** | sunset CN Tower; zero brand or people; heaviest file |

Schema `image` / `logo` (JSON-LD) on home, about, service, location pages = `cropped-evergreen-cleaning-toronto-logo-banner.jpg` (**884x265, 9 KB**, wide logo). Blog `BlogPosting.image` = `blog-*-feature.jpg` at **960x480** (80 KB). Google's Article/LocalBusiness guidance wants images >= 1200 px wide and supplied in 16:9, 4:3 and 1:1; the logo banner fails both the width and the "photo of the business" expectation, and 960 px blog features are under the bar.

What is right already: dimensions, JPEG, <150 KB, CDN subdomain, page-specific OG on services/industries/posts, consistent `summary_large_image`.
What is wrong: (1) four templates share one AI banner; (2) every image is visibly AI-generated (identical green polos, glass towers, no real faces/vans/branding) — a credibility risk for a company selling trust; (3) no text/logo overlay, so the card does not say who it is from or what page it is; (4) no `og:image:*` meta; (5) schema images are a logo strip and sub-1200 px blog features.

## 2. Brand tokens (read from `:root` in the site CSS, Astro build)

- `--brand: #47802a` (Evergreen green), `--brand-dark: #3c6d21`, `--brand-hover: #69ed3d` (accent only, too bright for fills)
- Accent yellow used 20x inline: `#f6bb06` (stars/CTA), `#d9a400` darker tone
- Ink: `--ink-heading #333`, `--ink #555`, `--ink-muted #6f6f6f`; surfaces `#fff`, `#f8f9f9`, `#efefef`; dark `#222`, footer `#111`
- Type: headings **Raleway** (700/800), body **Open Sans**
- Logo: `cropped-evergreen-cleaning-toronto-logo-banner.jpg` 884x265 (needs a transparent PNG/SVG export for overlays)

## 3. Global rules for every OG asset

- Canvas 1200x630, safe zone 1080x540 centred (LinkedIn/Slack/iMessage crop edges); keep faces and text inside it. Also export a 1200x1200 (1:1) and 1200x900 (4:3) crop of the same photo for schema.
- Photo-led: ~65% real photograph, ~35% left or bottom band in `#47802a` -> `#3c6d21` gradient (or white `#f8f9f9` band for medical/clean contexts) holding logo + one line.
- Text overlay: max 2 lines, Raleway 800, 54–64 px, white on green or `#333` on white; one `#f6bb06` accent rule or pill. No more than ~8 words. Logo bottom-left, 160–200 px wide. Never cover the subject's face or hands.
- Export JPEG q80 (or WebP q85 with JPEG fallback, since some crawlers still skip WebP) target 60–120 KB; filename `evergreen-<page-slug>-og-1200x630.jpg`; add `og:image:width/height/alt` and `og:image:type` meta site-wide (one Astro layout change).
- **No AI-looking crews.** The client has been asked for real photos. Use: actual staff in actual Evergreen uniforms (if they have no uniform, plain dark tops + the logo on a lanyard/van), real client sites (with permission), real equipment, real Toronto streets/lobbies, daylight or genuine after-hours lighting. Imperfection is the point: wet floors, caddies, a slightly cluttered desk. If a placeholder must be generated before the photoshoot, generate *scenes without people* (equipment on a lobby floor, a cleaned boardroom, a dental chair) and swap them out — never generate faces or uniformed teams.
- Photoshoot list (one half-day covers everything below): team portrait with van/logo; backpack vacuum in an open office; floor scrubber in a lobby; disinfection wipe-down in a clinic; warehouse/industrial floor; condo lobby + elevator; night-shift exterior of a downtown tower with the crew walking in; retail floor; close-ups of green-certified products.

## 4. Generation briefs, priority order

| # | Page / template | Purpose | Composition (1200x630) | Overlay text | Why this rank |
|---|---|---|---|---|---|
| 1 | **Home `/`** | Brand card shared in email signatures, GBP posts, LinkedIn; currently a 4-way generic | Real crew of 2–3 in uniform in a Toronto office lobby or in front of the branded van, skyline/CN Tower visible but secondary; left green band | "Commercial Cleaning / Toronto & GTA" + logo | Highest share volume; fixes the "who is this" problem |
| 2 | **Location template (7 pages)** | Each city gets its own card; today all 7 = home banner | Same crew photo family + a recognisable local cue (Mississauga Civic Centre, Markham Civic Centre, Vaughan Mills, Oakville waterfront, Brampton Rose Theatre, Etobicoke Humber Bay arch, Toronto downtown core) — a real exterior shot, not a skyline stock | "Office Cleaning in {City}" + logo | 7 pages, all duplicates; local cue drives CTR on local shares and GBP |
| 3 | **About `/about-us/`** | Trust page; replace skyline stock | Team portrait (owner front and centre), van or office door with logo, natural light | "Toronto-owned since {year}" + logo | E-E-A-T: real people on the page that claims them |
| 4 | **Service template (9)** | Already page-specific; re-shoot to replace AI scenes | One hero action per service: backpack vacuum (office), ride-on scrubber (commercial), electrostatic sprayer (disinfection), pressure washer on a storefront (pressure washing), post-construction debris sweep, graffiti removal before/after split, industrial floor, emergency water clean-up, maintenance toolbox | "{Service} / Toronto" + logo | Keep current until real photos exist; swap one-for-one |
| 5 | **Industry template (medical-dental, property-management, future ones)** | Replace AI dental/condo scenes | Clinic: real exam room, cleaner in disposable gloves; Property: real condo lobby/elevator bank with cart | "{Industry} Cleaning" + logo | Medical page is a high-value lead page |
| 6 | **Blog hero + OG (38 posts)** | Per-post `feature.jpg` is 960x480; OG exists per post | Shoot 10–12 reusable "editorial" scenes (break room, fridge, dusting a workstation, hand-sanitiser station, floor care, winter entrance mats, plants, retail counter) and map posts to them; crop hero at 1600x900 (16:9) and OG 1200x630 with a white bottom band carrying the post title | Post title (2 lines max) + "Insights" tag | 38 posts, mostly 2019–2022; images age well if generic-but-real |
| 7 | **Blog index `/insights/`** | Currently home banner | Flat-lay of the printed checklist + a tablet, or the break-room scene with the band | "Cleaning Insights for Toronto Workplaces" | low traffic page |
| 8 | **Request-a-quote / contact / reviews / process** | Not audited individually but share the layout default | Reuse #1 with alternate overlay ("Get a Free Quote", "Rated 4.9 on Google", "How We Work") | varies | cheap variants of #1 |

Suggested crafted prompt structure for any *placeholder* generation (people-free, as per rule above), using the skill's 6-component form: Subject (equipment/scene, no humans) 30% · Style (documentary photo, 35 mm, natural window light, slight grain) 25% · Context (named Toronto interior type) 15% · Composition (subject right third, empty left third for the green band) · Lighting (overcast daylight or warm evening fluorescent) · Negative (no text, no logos, no people, no CGI gloss).

## 5. Schema `image` needs

- `LocalBusiness` / `Organization` on home, about, locations, services: replace `"image": logo-banner` with an array of the real exterior/team photo in three crops: `evergreen-team-van-1200x675.jpg` (16:9), `-1200x900.jpg` (4:3), `-1200x1200.jpg` (1:1). Keep `logo` as the logo file but export a square-ish PNG >= 112x112 with the mark on white (`evergreen-logo-512.png`); the current 884x265 banner is acceptable for `logo` but not for `image`.
- `BlogPosting.image`: supply the same three crops of the post hero (>= 1200 px wide; today 960x480 fails). Use `ImageObject` with `width`/`height`:
  ```json
  "image": [
    {"@type":"ImageObject","url":"https://img.evergreencleaningservice.ca/images/blog-commercial-deep-cleaning-1200x675.jpg","width":1200,"height":675},
    {"@type":"ImageObject","url":"https://img.evergreencleaningservice.ca/images/blog-commercial-deep-cleaning-1200x900.jpg","width":1200,"height":900},
    {"@type":"ImageObject","url":"https://img.evergreencleaningservice.ca/images/blog-commercial-deep-cleaning-1200x1200.jpg","width":1200,"height":1200}
  ]
  ```
- `Service` schema on service pages: add `image` = the service OG photo (16:9) once real.
- Meta to add in the shared layout (once per page):
  ```html
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="{descriptive alt naming the crew/scene and page}">
  <meta name="twitter:image:alt" content="{same}">
  ```
- Alt-text pattern for OG/schema images: "Evergreen cleaning technician {action} in a {place}, {city}" — name the real subject, no keyword stuffing.

## 6. Order of work

1. Layout change: `og:image:*` + `twitter:image:alt` meta (30 min, no assets needed).
2. Photoshoot (half day) per the list above; obtain model releases from staff.
3. Produce #1 home, #3 about, #2 seven locations (nine cards) first; ship with schema `image` arrays.
4. Services and industries (11 cards), then blog heroes/OG in batches of 10 by traffic.
5. Delete the AI skyline and AI crew files once replaced; keep filenames stable or 301 the old image URLs on the CDN to avoid broken cached social cards.

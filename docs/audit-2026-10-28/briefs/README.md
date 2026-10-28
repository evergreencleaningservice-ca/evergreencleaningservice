# Content briefs — Evergreen Office Cleaning (2026-10-28)

Six competitive content briefs for https://www.evergreencleaningservice.ca, benchmarked against JAN-PRO (jan-pro.com) and the Toronto/GTA pages that surface for each target term. Four are for new pages; two improve existing pages.

## Method

- Competitor pages were fetched with curl (raw HTML saved under `../raw/briefs/`, 36 files) and parsed with `../tools/brief_parse.py` (main-content word count with nav/header/footer/forms removed; H1–H4 outline; FAQ-style questions; JSON-LD types; image, alt and link counts; entity presence; price mentions).
- Scoring: Depth / Formatting / SEO / UX, each 1–10, total /40.
- **SERP caveat:** the web search available here is US-based and not geo-personalised to Toronto. The real Toronto SERP for every one of these terms begins with a Google Business Profile local pack and often includes directories (HomeStars, Yelp, ThreeBestRated) and job boards. Competitor sets were built from Toronto-qualified queries and are the dedicated organic pages a Toronto buyer is likely to compare; positions are approximate. Excluded per the skill's list: Wikipedia, Notion-hosted pages, YellowPages, HomeStars, Job Bank, Indeed, forums, chambers, WP-JSON endpoints, off-topic pages (one "floor" result was a kitchen-remodelling page).
- Word counts are main-content words. The target per page is the competitor average plus the specific sections the gap analysis adds, not a round number.
- Every brief ends with a **claims-to-verify table** keyed to `/home/user/evergreencleaningservice/docs/growth/client-intake.md` (A1–A12, B1–B6, C1–C5). The client has confirmed nothing beyond what is live today; guarantees, inspection frequency and certifications beyond WSIB/bonded/insured must not be written until answered.
- Schema guidance follows the site's existing convention (Service + CleaningService + BreadcrumbList + OfferCatalog, with FAQPage already present on service and industry pages). FAQPage is kept for consistency only; no rich result or ranking benefit is expected from it.

## The six briefs

| # | File | Mode | Target term | Target words (competitor avg) | Top 3 must-have sections |
|---|---|---|---|---|---|
| 1 | `janitorial-services.md` | New: `/services/janitorial-services/` | janitorial services Toronto | ~1,600 (~1,320) | Janitorial vs commercial vs office vs day porter routing table · Every-visit / weekly / periodic scope · Who supplies what and how access works |
| 2 | `floor-stripping-waxing.md` | New: `/services/floor-stripping-waxing/` | floor stripping and waxing Toronto | ~1,700 (~1,420) | Strip / scrub-and-recoat / burnish decision table · Downtime and phasing (incl. warehouse safety lines) · Frequency-by-traffic table and price factors |
| 3 | `warehouses-logistics.md` | New: `/industries/warehouses-logistics/` | warehouse cleaning Toronto | ~1,500 (~1,220) | Zone / task / frequency table · Working on a live site (access checklist) · What is not included + Ontario O. Reg. 851 housekeeping paragraph |
| 4 | `day-porter-services.md` | New: `/services/day-porter-services/` (gated on client confirming the service exists) | day porter services Toronto | ~1,350 (~1,050) | Coverage-hours sizing table · Sample porter day timeline · Porter / night crew / both comparison |
| 5 | `office-cleaning.md` | Improve: `/services/office-cleaning/` | office cleaning Toronto | ~1,800 (now 1,239; ~1,390) | Office cleaning checklist by area and frequency · Switching-providers handover guide · Proof refresh (GBP rating, newer reviews, real photos) + 3 FAQs |
| 6 | `medical-dental-clinics.md` | Improve: `/industries/medical-dental-clinics/` | dental office cleaning Toronto | ~1,550 (now 896; ~1,190) | Ours-vs-clinic responsibilities table citing RCDSO IPAC standard and Public Health Ontario best practices · End-of-day order of work and cross-contamination controls · Room / frequency table + 4 FAQs |

## Cross-page decisions the client must make

1. **Day porter**: the site does not currently say Evergreen offers daytime on-site staff. Brief 4 is gated on a yes. If no, fold a "daytime touch-ups" line into office cleaning and property management instead.
2. **Warehouses vs industrial cleaning**: the page inventory recorded that a separate industrial industry page was considered and not built. Brief 3 makes the new page distinct by facility operations (live sites, docks, racking, shift patterns, safety lines) and recommends repositioning `/services/industrial-cleaning/` as the service page for plants and production areas. If the client declines, apply brief 3 as a rewrite of `/services/industrial-cleaning/`.
3. **Floor care**: brief 2 becomes the detailed spoke under `/services/building-maintenance/`; the maintenance page, office page and industrial page should link their "strip and wax" mentions to it.
4. **Case study**: the draft `src/content/projects/warehouse-floor-clean-and-wax.md` unlocks proof on briefs 2 and 3 once B4/B5 approvals are recorded.
5. **Publishing order suggested**: 5 (office, highest priority, mostly additive) → 1 (janitorial, routes everything) → 6 (clinics) → 2 (floors) → 3 (warehouses) → 4 (day porter, after confirmation).

## Files

- Briefs: this folder.
- Raw competitor HTML: `../raw/briefs/*.html` (filenames prefixed `jan-`, `floor-`, `wh-`, `dp-`, `off-`, `den-`, plus `janpro-*` benchmarks and `eg-*` Evergreen pages).
- Parser: `../tools/brief_parse.py` (run with `python3 -I`).

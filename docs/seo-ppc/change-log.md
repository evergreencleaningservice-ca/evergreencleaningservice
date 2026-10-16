# SEO / PPC change log

## 2026-10-16
- Fixed image dimension stamping (regex contained a stray control character), now shared via `stampImageSizes()` in `src/lib/normalize-body.ts` and used by `PageLayout.astro` and the demo gallery.
- Added BreadcrumbList JSON-LD to `/services/`, `/locations/` and each `/locations/<city>/` page.
- Shortened titles: Mississauga, Vaughan locations and the commercial-cleaning service page.
- Shortened over-length descriptions: commercial-cleaning-techniques-to-avoid post, reviews, pressure-washing, tag archive template.
- Added `docs/seo-ppc/audit-latest.md`.

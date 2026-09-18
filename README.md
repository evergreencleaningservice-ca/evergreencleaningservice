# evergreencleaningservice

An [Astro](https://astro.build) 7 port of **www.evergreencleaningservice.ca**, which ran on
WordPress with the OnePress theme. The site is a fully static marketing site: pages, service
pages and a news/blog archive. There is no CMS and no server runtime — `astro build` emits
plain HTML into `dist/`.

## Running it

```bash
npm install     # once
npm run dev     # dev server at http://localhost:4321
npm run build   # static build into dist/
npm run preview # serve the built output
npm run check   # astro check (types + content schema) — prompts to install
                # @astrojs/check + typescript on first run; they are not dependencies
npm run b2:sync # upload public/images to the Backblaze bucket
```

Node 20+ is required (Astro 7). There is no `.env`; everything that needs a
credential reads it from the environment or from a Worker secret:

| Where | What | For |
| --- | --- | --- |
| Worker secret | `DATABASE_URL` | Neon Postgres, `/api/submit-lead` |
| Worker secret | `RESEND_API_KEY` | the lead notification email |
| Worker secret | `RECAPTCHA_SECRET` | verifying form submissions; without it `/api/submit-lead` answers 503 |
| Build env | `PUBLIC_RECAPTCHA_SITE_KEY` | the client's real site key; defaults to Google's test key (HANDOFF §7.1) |
| Environment | `B2_KEY_ID`, `B2_APP_KEY` | `npm run b2:sync` |
| Environment | `CF_API_TOKEN` | the post-deploy edge purge |

`npm run dev` needs none of them, and cannot exercise the form: `astro dev` has
no Worker, so `/api/submit-lead` 404s there. Test submissions against a
deployed preview.

## Project layout

```
astro.config.mjs        site URL, trailingSlash: 'always', legacy redirects, sitemap
public/
  images/               all site imagery, original WordPress basenames. Source of
                        truth and what `astro dev` serves — but NOT deployed: the
                        build repoints every reference at the Backblaze bucket
                        (HANDOFF.md §3.1) and drops these from dist/.
  robots.txt            allow-all + sitemap pointer
src/
  pages/                routes (see below)
  layouts/              BaseLayout (head/meta), PageLayout, PostLayout
  components/           Header, Footer, ServiceCard, PostCard, home/* sections
  content/
    blog/               news posts        -> /<slug>/
    pages/              standalone pages  -> /<slug>/
    services/           service pages     -> /services/<slug>/
  content.config.ts     collection schemas
  data/site.ts          name, phone, email, social links, service areas, nav tree
  styles/global.css     design tokens + shared utility classes
```

### Routing

| Route | Source |
| --- | --- |
| `/` | `src/pages/index.astro` + `src/components/home/*` |
| `/<slug>/` | blog posts, via `src/pages/[slug].astro` |
| `/blog/`, `/blog/page/N/` | paginated news list |
| `/category/blog/`, `/category/blog/page/N/` | the same list at the original category URL (this is what the nav links to) |
| `/services/` and `/services/<slug>/` | the `services` collection |
| `/about-us/`, `/privacy/`, `/green-clean-products/`, `/cleaning-demo-gallery/`, `/contact-us/`, `/request-a-quote/`, `/testimonials/` | one `.astro` file each, pulling a `pages` collection entry |
| `/404.html` | `src/pages/404.astro` (noindex) |
| `/rss.xml`, `/sitemap-index.xml` | generated at build time |

`astro.config.mjs` also keeps redirects for old WordPress addresses that no longer have a page:
the 2019-era service URLs (`/office-cleaning/` etc.) go to their current `/services/...`
equivalents, and the tag and author archives (`/tag/<slug>/`, including their `/page/N/`
variants, and `/author/webmaster/`) go to `/category/blog/`, since this port has no tag or
author taxonomy. A static build emits each of these as a small meta-refresh page; they are
kept out of the sitemap.

## How content is organised

Page and post copy lives as Markdown in `src/content/`, loaded through Astro content
collections (`glob` loader, schemas in `src/content.config.ts`). The filename is the public
slug. Front matter is `title`, optional `description`, optional `image`, plus `pubDate` for
blog posts. To edit copy, edit the Markdown; to change a layout, edit the `.astro` file.

Shared facts — phone number, email, social profiles, service areas, the navigation tree —
come from `src/data/site.ts` so they exist in exactly one place.

## Conventions

- **Trailing slashes.** `trailingSlash: 'always'` and `build.format: 'directory'`, so every
  internal href must end in `/` (except `/`, `tel:`, `mailto:` and external links).
- **Images** are local under `public/images/` and referenced as `/images/<original-wordpress-basename>`.
  Set `width`/`height` (or an aspect ratio) and `loading="lazy"` below the fold.
- **Styling** is plain CSS: tokens and utilities (`.container`, `.section-padding`, `.grid-*`,
  `.btn-*`, `.page-header`, `.entry-content`, …) in `src/styles/global.css`, anything
  component-specific in a scoped `<style>` block. No CSS framework, no runtime dependencies.
- **Accessibility:** one `<h1>` per page, real landmarks, visible focus styles, no text baked
  into images. Layouts are expected to work from 320px up with no horizontal scroll.

## Known gaps

This port is not a complete reproduction of the live site. Outstanding items:

1. **The copy is from an Internet Archive snapshot, not the live site.** The origin
   (`www.evergreencleaningservice.ca`) blocks automated access at the firewall, so every page
   here was recovered from the Wayback Machine. The captures are not all from the same date:
   the homepage, `/about-us/`, `/contact-us/` and the news archive come from **8 April 2025**;
   most blog posts from 2024 captures; the current `/services/…` pages from **2024** captures
   (except `/services/office-cleaning/`, captured **October 2025**); and the older service
   URLs (`/office-cleaning/`, `/commercial-cleaning/`, `/industrial-cleaning/`,
   `/emergency-service/`) only exist as **October 2019** captures. Anything the client
   changed on the live site after its page's capture date is not reflected here and should be
   checked against the real site before launch.

2. **Two forms still go nowhere, and the captcha keys are Google's test pair.** The quote and
   contact forms now post to `/api/submit-lead` behind a reCAPTCHA v2 checkbox, but the
   comment form and the `/reviews/` testimonial form are still `action="#"` — neither is a
   lead, and both need a destination decided. Separately, the client's real reCAPTCHA secret
   has not been supplied, so the site runs on Google's published test key pair, which passes
   every token. See HANDOFF §7.1 for the two steps to go live.

3. **`/services/building-maintenance/` has almost no content.** That page was never archived.
   `src/content/services/building-maintenance.md` currently holds only the one-paragraph
   summary the homepage showed for it — including the excerpt's trailing ellipsis. The real
   body copy has to come from the client.

4. **Images the live site shows are missing here, or are only available small.** The pages
   referenced 177 image files; the archive fetch returned 104 and failed on 73. Nothing is
   broken — every `/images/…` reference in `src/` resolves to a file in `public/images/` (88
   files) — but it only resolves because the references were adjusted:

   - **7 assets survived only as a 300 × 150 thumbnail** (`AI-in-cleaning1`,
     `cleaning-a-counter`, `cleaning-products-2`, `hand-sanitizing-woman`, `microfibre-cloths`,
     `office-plants`, `were-moving`), and the 16 references to them now point at that
     thumbnail. Eight blog posts use one as their featured image, which `PostLayout` renders
     at 1200 × 600, so it looks soft. (`floodedoffice_1` was also remapped, but to the
     full-size original, so it loses nothing.)
   - **41 files could not be recovered at all**, and their references were removed. Those
     pages simply show no image where the live site shows one.

   Both sets need the originals from the client. Check that nothing is broken (no output =
   every reference resolves):

   ```bash
   comm -23 \
     <(grep -rhoE '/images/[A-Za-z0-9._@%-]+' src/ | sed 's|/images/||' | sort -u) \
     <(ls public/images | sort -u)
   ```

   <details>
   <summary>The 41 files the archive could not supply</summary>

   `ECOLOGO-150x150.jpg`, `ProSeriesGreen-Logo-150x150.png`,
   `Toronto-GTA-Commercial-Cleaning-Territory.png`, `air-quality-1.jpg`,
   `armstrong-logo-300x89.jpg`, `classroom.jpg`, `clean-office-air.jpg`,
   `covid-19-elbow-bump.jpg`, `covid19-office.jpg`, `dental-office-1.jpg`,
   `dental-office-break-room.jpg`, `dental-office-reception.jpg`,
   `disinfection-cleaning-tech-e1616794679911.jpg`, `dust-on-a-desk.jpg`, `duster.jpg`,
   `flooded-office-in-Toronto.jpg`, `green_clean_products_LARGE-1.jpg`,
   `hand-sanitizer-in-a-store.jpg`, `hand-sanitizer.jpg`, `handwashing.jpg`,
   `iStock-532149911-scaled.jpg`, `industial-cleaning-demo-Toronto-1.jpg`,
   `janitorial-cart.jpg`, `lobby_1-e1597778322357-1024x546.jpg`,
   `medical-office-reception-area.jpg`, `moving-the-office.jpg`, `moving-the-office-2.jpg`,
   `moving-the-office-3.jpg`, `office-building-exterior.jpg`, `office-cleaners.jpg`,
   `office-layout.jpg`, `office-layout-2.jpg`, `office-layout-3.jpg`, `office-plant-3.jpg`,
   `office-plants-2.jpg`, `post-covid-19-office.jpg`, `safety-at-work.jpg`,
   `school-cafeteria.jpg`, `slips-1024x958.jpg`, `stinky-air-in-the-office.jpg`,
   `woman-wiping-down-her-desk.jpg`

   </details>

5. **Not verified against the live site.** Because the origin is unreachable from the build
   environment, nothing here has been diffed against the production pages — page inventory,
   analytics/tag setup and any third-party embeds the client added recently may be missing.

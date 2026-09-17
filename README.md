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
npm run check   # astro check (types + content schema)
```

Node 20+ is required (Astro 7). There is no database, no API keys and no `.env`.

## Project layout

```
astro.config.mjs        site URL, trailingSlash: 'always', legacy redirects, sitemap
public/
  images/               all site imagery, flat, original WordPress basenames
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
| `/about-us/`, `/privacy/`, `/green-clean-products/`, `/cleaning-demo-gallery/` | one `.astro` file each, pulling a `pages` collection entry |
| `/404.html` | `src/pages/404.astro` (noindex) |
| `/rss.xml`, `/sitemap-index.xml` | generated at build time |

`astro.config.mjs` also keeps redirects from the 2019-era service URLs
(`/office-cleaning/` etc.) to their current `/services/...` equivalents.

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
   most blog posts from 2024 captures; the older service pages
   (`/office-cleaning/`, `/commercial-cleaning/`, `/industrial-cleaning/`, `/emergency-service/`)
   only exist as **October 2019** captures. Anything the client changed on the live site after
   its page's capture date is not reflected here and should be checked against the real site
   before launch.

2. **The forms are markup only.** The contact / quote form in
   `src/components/home/Contact.astro` has `action="#"` and no backend. A submission goes
   nowhere. It needs a form endpoint (serverless POST route or a hosted form service), and the
   visible "not connected yet" notice in that component should be removed once it delivers.

3. **`/services/building-maintenance/` has almost no content.** That page was never archived.
   `src/content/services/building-maintenance.md` currently holds only the one-paragraph
   summary the homepage showed for it — including the excerpt's trailing ellipsis. The real
   body copy has to come from the client.

4. **49 images could not be recovered.** The archive fetch returned 104 files and failed on 73
   (including size variants). Content still references the missing filenames, so those `<img>`
   tags will 404 until the originals are supplied by the client or replacements are chosen.
   Regenerate the list at any time with:

   ```bash
   comm -23 \
     <(grep -rhoE '/images/[A-Za-z0-9._@%-]+' src/ | sed 's|/images/||' | sort -u) \
     <(ls public/images | sort -u)
   ```

   <details>
   <summary>Missing at time of writing</summary>

   `AI-in-cleaning1.jpg`, `ECOLOGO-150x150.jpg`, `ProSeriesGreen-Logo-150x150.png`,
   `Toronto-GTA-Commercial-Cleaning-Territory.png`, `air-quality-1.jpg`,
   `armstrong-logo-300x89.jpg`, `classroom.jpg`, `clean-office-air.jpg`,
   `cleaning-a-counter.jpg`, `cleaning-products-2.jpg`, `covid-19-elbow-bump.jpg`,
   `covid19-office.jpg`, `dental-office-1.jpg`, `dental-office-break-room.jpg`,
   `dental-office-reception.jpg`, `disinfection-cleaning-tech-e1616794679911.jpg`,
   `dust-on-a-desk.jpg`, `duster.jpg`, `flooded-office-in-Toronto.jpg`,
   `floodedoffice_1-1024x742.jpg`, `green_clean_products_LARGE-1.jpg`,
   `hand-sanitizer-in-a-store.jpg`, `hand-sanitizer.jpg`, `hand-sanitizing-woman.jpg`,
   `handwashing.jpg`, `iStock-532149911-scaled.jpg`, `industial-cleaning-demo-Toronto-1.jpg`,
   `janitorial-cart.jpg`, `lobby_1-e1597778322357-1024x546.jpg`,
   `medical-office-reception-area.jpg`, `microfibre-cloths.jpg`, `moving-the-office.jpg`,
   `moving-the-office-2.jpg`, `moving-the-office-3.jpg`, `office-building-exterior.jpg`,
   `office-cleaners.jpg`, `office-layout.jpg`, `office-layout-2.jpg`, `office-layout-3.jpg`,
   `office-plant-3.jpg`, `office-plants.jpg`, `office-plants-2.jpg`, `post-covid-19-office.jpg`,
   `safety-at-work.jpg`, `school-cafeteria.jpg`, `slips-1024x958.jpg`,
   `stinky-air-in-the-office.jpg`, `were-moving-scaled.jpg`, `woman-wiping-down-her-desk.jpg`

   </details>

5. **Not verified against the live site.** Because the origin is unreachable from the build
   environment, nothing here has been diffed against the production pages — page inventory,
   analytics/tag setup and any third-party embeds the client added recently may be missing.

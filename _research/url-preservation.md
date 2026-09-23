# URL preservation — do the old site's addresses still work?

Real backlink data needs Ahrefs, Semrush or Search Console, none of which this
session can reach. What is checkable, and what actually decides whether an
inbound link survives, is whether every address the old site served still
resolves on the port.

**Method.** Every path the Internet Archive's crawl of `evergreencleaningservice.ca`
ever recorded — 76 addresses after dropping assets and crawler artifacts — plus
spot checks of the WordPress endpoints a crawl would not reach. Each requested
against the deployed preview and followed to its destination.

## Result

| | |
|---|---|
| resolve with real content (200) | **59** |
| redirect to the right page, but by meta refresh, not 301 | **46** (7 page-level + 39 tag/author) |
| dead — 404 | **8 classes**, listed below |

---

## 1. Dead addresses — a backlink here is lost

### The old `/blog/<slug>/` permalink structure

    /blog/be-safe-from-coronavirus-work/
    /blog/clean-and-disinfect-public-areas-during-covid-19/
    /blog/control-allergies-workplace-with-professional-janitorial-services/
    /blog/workplace-cleaning-checklist-winter/

These never returned 200 in the crawl, which means **the original redirected
them** — the posts moved to root-level slugs at some point. The port 404s them
instead. Four are proven by the crawl; the real set is every post that existed
under the old structure, so the fix should be a pattern, not four entries.

### WordPress feeds

    /feed/          /blog/feed/          /comments/feed/

The port serves `/rss.xml`. Directories, aggregators and blog readers link to
`/feed/` as a matter of course.

### Sitemaps

    /sitemap.xml    /sitemap_index.xml

The port emits `/sitemap-index.xml`. Rank Math's default on the original is
`/sitemap_index.xml`. (The live copies could not be fetched to confirm — the
origin's captcha blocks this network — so treat the exact old path as likely,
not certain.)

### Every image address

    /wp-content/uploads/**

The port serves images from `/images/`. This is the largest class by count.
It costs three things: image-search results, any hotlink, and **the original's
own `og:image` tags, which point at `/wp-content/uploads/…`** — so a social
share cached against the old URL breaks.

### Favicon

    /favicon.ico

Missing entirely. Not a backlink issue; every browser requests it.

### Not real losses

`/atom.xml`, `/index.xml`, `/feeds/all.atom.xml` and `/cdn-cgi/l/email-protection/`
are speculative crawler probes and a Cloudflare artifact — they never existed.

---

## 2. Preserved, but by meta refresh rather than 301

All 46 redirects resolve to the right page, but Astro's static `redirects`
cannot emit an HTTP 301 without a server: each one is an HTML page returning
**200** with `<meta http-equiv="refresh" content="0;url=…">`.

    /office-cleaning/          -> /services/office-cleaning/
    /commercial-cleaning/      -> /services/commercial-cleaning/
    /industrial-cleaning/      -> /services/industrial-cleaning/
    /emergency-service/        -> /services/emergency-cleaning-services/
    /testimonial/              -> /testimonials/
    /portfolio/project-title-sixth/ -> /cleaning-demo-gallery/
    /author/webmaster/         -> /category/blog/
    /tag/<39 tags>/            -> /category/blog/

Google generally treats a zero-delay meta refresh as a permanent redirect, but
it is explicitly weaker than a 301 and slower for the visitor. **Cloudflare
Workers can serve true 301s** — either with a `_redirects` file or a small
Worker script in front of the assets. Worth doing before cutover, since four of
these are the legacy service URLs that have had years to accumulate links.

---

## 3. What to do

1. **Redirect `/blog/<slug>/` to `/<slug>/`** as a pattern — this is the only
   class where links are provably dead rather than merely weakened.
2. **Redirect `/wp-content/uploads/<anything>/<file>` to `/images/<file>`.**
   One rule recovers every image address, including the ones in the original's
   own social tags.
3. `/feed/` → `/rss.xml`, and `/sitemap_index.xml` → `/sitemap-index.xml`.
4. Add `/favicon.ico`.
5. Convert the 46 meta-refresh redirects to real 301s.

Items 1 and 2 are the ones that lose link equity today.

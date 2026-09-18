# Handoff — Evergreen Office Cleaning, WordPress → Astro port

Written for another agent picking this up cold. Everything below is the state of
the repository at commit `eab08b5` on branch `claude/optimistic-clarke-wz1p8g`.

---

## 1. What this is

A **pixel-and-behaviour-faithful clone** of the client's live WordPress site,
`evergreencleaningservice.ca`, rebuilt as a static Astro site and deployed to a
Cloudflare Workers preview at **`evergreencleaningservice.10xconnections.com`**.

The brief is *match the original*, not improve it. That distinction has decided
a lot of the work: where the port had something the original does not — a post
date, previous/next navigation, a "this form is not connected" notice — it was
removed rather than kept, because the client reviews the result by taking
side-by-side screenshots and flagging differences.

The original runs the **OnePress** WordPress theme (Bootstrap-based grid) with
**WPForms**, **Rank Math** SEO, a **Trustindex** Google-reviews widget, and a
**Lead Net** floating video widget.

---

## 2. The single most important environment fact

**The live origin is firewall-blocked from this network.** SiteGround answers
this IP with an IP-reputation block. Every measurement of "the original" comes
from the **Internet Archive**, rendered locally with the site's own stylesheet.

That has a consequence that has caused more wrong turns than anything else:

> **Archive captures are of different dates, and the site changed between
> them.** A page whose newest snapshot is 2023 shows the old trading name; one
> from 2025 shows the new one. Two generations of the same WPForms form exist.
> `/blog/page/3/` holds different posts than it does today.

**Before treating any difference as a defect, check the capture date.** A
regression was shipped once by reading the older generation of a form off a page
whose newest capture was July 2024 and "correcting" the newer one to match.

Reference material lives in the scratchpad, not the repo:

```
<scratchpad>/pages/     raw archived HTML, one file per address (64)
<scratchpad>/refall/    the same, rewritten to render offline (58 paired)
<scratchpad>/best.json  the newest capture per URL, with timestamps
<scratchpad>/pairs.json  ref file ↔ built route, the audit's input
<scratchpad>/theme.css  the original's combined stylesheet — the source of truth
                        for every measured value
```

`theme.css` is the thing to read when a spacing question comes up. Most
"why is this 39px" answers are a single rule in it.

---

## 3. Repository layout

```
src/
  components/           Header, Footer, Sidebar, DotNav, LeadVideo,
                        QuoteForm (WPForms 1381), ContactForm (1384),
                        Comments, PostList, PostCard, ServiceCard
  components/home/      Hero, Features, Services, Reviews, About, Gallery,
                        Testimonials, Cta, News, Contact
  content/blog/         38 posts (markdown)
  content/pages/        7 pages
  content/services/     6 service pages
  data/site.ts          name, phone, email, nav, footer areas, service areas
  data/reviews.ts       the 4 real Google reviews, recovered from Trustindex
  layouts/              BaseLayout, PageLayout, PostLayout
  lib/excerpt.ts        WordPress's 30-word excerpt
  lib/thumb.ts          resolves a featured image to its 300x150 list crop
  pages/                routes; [slug].astro is the blog post route
  styles/global.css     the ported theme CSS
scripts/
  noindex.mjs           adds the preview's noindex headers
  purge.mjs             purges the Cloudflare edge cache after deploy
  mkcrops.mjs           regenerates WordPress's 300x150 list crops with sharp
  b2-sync.mjs           uploads public/images to the Backblaze bucket
  images.mjs            repoints dist at the image host, then drops dist/images
_research/
  gaps.md               EVERY known difference and why — read this first
  seo.md                the original's SEO, one entry per address (64 URLs)
  audit.mjs             the parity census harness
  fonts.md, README.md
public/images/          100 files
public/video/lead-net.mp4  the client's real clip, 720x540 H.264+AAC
```

### 3.1 Image delivery — Backblaze B2, not the Worker

Photos are not deployed with the site. They live in the B2 bucket
`img-evergreencleaningservice` (us-east-005, allPublic) and are served from
`https://img-evergreencleaningservice.10xconnections.com`. Three pieces, and
they only work together:

| Piece | Value |
|---|---|
| Bucket | `img-evergreencleaningservice`, keys mirror the repo — `public/images/a.jpg` → `images/a.jpg` |
| DNS | CNAME `img-evergreencleaningservice.10xconnections.com` → `f005.backblazeb2.com`, **proxied** |
| Rewrite | zone `10xconnections.com`, ruleset `dc23ca22b3244751a43bf30de1de73a2`, prefixes `/file/img-evergreencleaningservice` onto the path |

Three things that are easy to undo by accident:

- **The orange cloud is load-bearing.** B2 egress is free only through
  Cloudflare (Bandwidth Alliance). Grey-clouded, the same traffic is billed.
- **Without the rewrite rule every image 404s.** B2's download endpoint
  addresses objects as `/file/<bucket>/<key>` and nothing else, so a bare CNAME
  returns B2's own JSON error for every request.
- **Source stays root-relative.** Components, markdown and redirect targets all
  still write `/images/a.jpg`, so `astro dev` serves the local files and no
  hostname is baked into content. `scripts/images.mjs` swaps the origin in
  `dist` after the build and then deletes `dist/images` — and it *fails the
  build* if any reference was left behind, because a missed one would keep
  working from the Worker and the mistake would never surface.

Objects carry `Cache-Control: public, max-age=86400, s-maxage=31536000` — a day
in the browser, a year at the edge, and the edge is purgeable. Replacing a photo
is: overwrite the file in `public/images`, `npm run b2:sync`, purge that URL.
`npm run b2:sync -- --prune` also deletes bucket objects with no local
counterpart; it is opt-in because it is the one step here that running again
does not undo.

The 101 legacy `/wp-content/uploads/…` rules in `_redirects` 301 to the image
host, so every inbound link to an old WordPress upload still lands on the file.

Credentials are `B2_KEY_ID` / `B2_APP_KEY` in the environment — never committed.

---

## 4. Conventions that are not negotiable

- **Branch**: develop and push on `claude/optimistic-clarke-wz1p8g`. Never push
  to `main` without being told to.
- **Deploy with `npm run deploy:preview`, never `npm run deploy`.** The plain
  one skips `noindex.mjs`, which means the preview serves `Allow: /` with no
  `X-Robots-Tag` — a crawlable near-duplicate of the client's live site. This
  has happened three times. `deploy:preview` = build + noindex + wrangler
  deploy + edge purge.
- **Secrets** (`RECAPTCHA_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, …) are Worker
  secrets, never committed.
- **Never disable TLS verification or unset `HTTPS_PROXY`.** Report 403/407
  egress denials rather than retrying them.
- Product name in prose is **10XiD** — digits one-zero, capital X, lowercase i,
  capital D.
- Commits end with the Claude Code attribution trailer.

---

## 5. The measurement discipline

Two independent checks exist, and they catch different things.

### 5.1 The parity census — `_research/audit.mjs`

Diffs every paired URL against its archived counterpart at 1440px: visible text
nodes, links, images, heading outline, form fields, horizontal overflow. Run it
after any change:

```bash
node _research/audit.mjs      # needs the scratchpad refs; see §2
```

**Current state, 58 pages:**

```
missing text nodes ... 129     missing links .... 17
missing images ....... 60      form fields ...... 91
heading outlines ..... 6 pages  overflow ......... none

UNEXPLAINED DIFFERENCES ... 0
```

Every one of those is accounted for in `_research/gaps.md` §16 — capture-year
differences in the footer line, the stale `/blog/page/3/` snapshot, reCAPTCHA's
hidden input, the older generation of form 1381, images the archive never kept,
and empty headings the original's editor left behind.

**It counts what is present. It does not check spacing or computed style.** A
page can pass every count and still be several pixels out.

### 5.2 Measured values

Spacing, type and breakpoints were measured off the original's render and are
recorded in the component headers. Key facts that are easy to get wrong:

- **Root font-size steps**: 16px → 15px (≤991) → 14px (≤767). Everything
  measured is therefore expressed in rem.
- **Stepped container**: 540 / 720 / 960 / 1140 with 15px gutters.
- **The theme has its own 940px breakpoint**, separate from Bootstrap's
  576/768/992/1200. Section titles and the back-to-top arrow step at 940, not
  991. Getting this wrong left the 940–991 band a size small.
- **Inner page grid**: content column is `74.7747747748%` with 39px padding and
  a **1px `#e9e9e9` rule** to its right; the sidebar takes the rest. At 1440
  that is 790 + 39 + 1 + 280.
- `.grid-3` goes 2-across at 576 and 3-across at 992 (`col-sm-6 col-lg-4`).

---

## 6. Traps that have already cost time

These are the expensive ones. Read them before changing anything.

1. **Playwright's `newPage({ viewportSize })` is silently ignored** — the
   correct key is `viewport`. Several "three widths" checks were three runs at
   1280, which is how a visible breakpoint bug survived a parity gate.

2. **Node's `fetch()` ignores `HTTPS_PROXY`** here and is refused at the egress
   layer with a 403. Use `curl` for anything outbound.

3. **The proxy truncates archive transfers at exactly 1 MiB.** A file can have a
   valid JPEG header and no end-of-image marker. Validate by the terminator
   (`FFD9` for JPEG, `IEND` for PNG), never by MIME type — `file --mime-type`
   reads the header and passes a truncated file.

4. **Querying the archive for an exact URL under-reports.** The full-size upload
   often has no capture while a sibling size does. Query the stem as a prefix
   (`…/name*`) and take the largest. A claim that eight thumbnails were
   "unrecoverable" was made on exact-URL queries and proved wrong.

5. **Don't rebuild `dist/` while the audit is running** — it reads from disk and
   the results silently mix two builds.

6. **CSS animations override inline styles.** `animate.css`'s `slideInUp` sets
   `visibility` in its `from` keyframe; with `animation-fill-mode: both` the
   element's final visibility comes from the underlying value.

7. **`import.meta.url` points at a build chunk once bundled.** `lib/thumb.ts`
   silently fell back on every page until it resolved from `process.cwd()`.

8. **Chromium here is the open-source build with no H.264/AAC decoder**, so the
   Lead Net clip cannot be played in a headless check. It also does not trust
   the agent proxy's CA, so it cannot load the deployed preview over HTTPS —
   screenshot `dist/` from a local server instead.

9. **`remark-gfm` autolinks bare URLs.** The original renders one as plain text.
   An HTML comment breaks the autolinker but splits the text node in two; write
   the paragraph as raw HTML instead.

10. **The reference cannot render the hero** — the slideshow script is not in
    the archive, so the hero shows a spinner and its `<h2>` is invisible. The
    census cannot speak to the hero; it was measured separately.

---

## 7. What is known-missing or undecided

`_research/gaps.md` is the full record, 17 sections. The ones that need a human
decision:

### 7.1 The forms have no backend — **the launch blocker**

`QuoteForm`, `ContactForm` and `Comments` all post to `action="#"`. A visitor's
enquiry is **dropped silently**. A visible "this form is not connected" notice
used to say so; it was removed because the original has no such line and the
brief is to match. The component headers and `gaps.md` record this. Either wire
a handler or put the notice back — the client has not chosen.

### 7.2 Google Tag Manager is not rendered

`site.ts` defines `gtmId: 'GTM-5PRC4HBV'` and **nothing uses it**. The original
carries the container on every 2025 capture.

Reading the live container shows it is not decorative: Google Ads
`AW-16819334998` with three conversion actions and Enhanced Conversions,
remarketing, Microsoft Ads UET `187178776` with four tags, GA4
`G-R27QW21PMT`, a conversion linker, and a SearchKings agency template.
**Shipping without it loses all paid-ads conversion tracking on day one.**

It was deliberately not added yet: firing live conversion tags from a staging
site the client is clicking through would push fake conversions into their real
Google Ads and GA4 accounts. It needs a hostname condition, or to go in at
cutover.

### 7.3 The Simple Banner plugin

The April 2025 capture has it enabled — a `#2ca516` bar across every page
pointing at the disinfection service. **Not built**, because the client's own
screenshots of the live site show no such bar, so it appears to have been
switched off since. Worth one question.

### 7.4 Images the archive never kept

~54 photos exist only in the client's media library. Ten list crops were
regenerated from full-size sources already in the repo (`scripts/mkcrops.mjs`).
A sweep for the rest was **in flight when this was written** — see
`<scratchpad>/fetch-final.sh` and `fetch-final.log`. It classifies each file by
role (`roles.json`): a 300×150 crop is correct for a post list and **wrong
inside a post body**, where a 2:1 crop at 300px replaces a 3:2 photo.

### 7.5 `/services/building-maintenance/`

In the nav, never captured by the archive. The page carries the homepage's
summary paragraph as a placeholder. **Needs the real copy from the client.**

---

## 8. SEO

`_research/seo.md` has every field the original carries, per address, with the
snapshot date each record came from. Summary: technically clean, strategically
weak — Rank Math near its defaults.

The port currently **generates its own titles and descriptions** rather than
mirroring the original's. That is an open decision: reproduce them exactly
(flaws included), or fix them as part of the migration. The flaws are:

- only 3 of 64 titles name Toronto or the GTA, on a local service business
- four legacy URLs duplicate the `/services/*` pages with no description, no
  robots directive and an `http://` self-canonical (the port already 301s them)
- a typo, "Torotno", in `/services/commercial-cleaning/`'s description
- 35 of 64 titles exceed 60 characters, from a 29-character title suffix
- no `Service`, `FAQPage`, `Review` or `AggregateRating` schema anywhere
- `BreadcrumbList` on 3 pages of 64
- 7 pages with no description; 2 descriptions shared across 7 posts
- `og:site_name` is the old trading name; `og:locale` is `en_US` on a Canadian
  business; 18 pages have no `og:image`

---

## 9. Where to start

1. Read `_research/gaps.md`. It is the record of every known difference.
2. Run `node _research/audit.mjs` to confirm the census still reads zero
   unexplained. If the scratchpad refs are gone, rebuild them with
   `mkref-all.mjs` (it needs `<scratchpad>/pages/`).
3. `npm run build`, then serve `dist/` locally to look at anything.
4. Deploy only with `npm run deploy:preview`.

The two things a reviewer will ask about first are the forms (§7.1) and GTM
(§7.2). Neither is a code problem; both are decisions.

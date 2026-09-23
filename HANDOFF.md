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
                        QuickQuoteForm, ContactForm (WPForms 1384),
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

### 7.1 The forms — wired, and guarded by invisible Turnstile

`QuickQuoteForm` and `ContactForm` post to `/api/submit-lead` through
`FormRuntime.astro`, the same endpoint both landing pages use. They spent the
port on `action="#"`, validating in the browser and then dropping the enquiry;
that was the launch blocker.

`Comments` and the testimonial form on `/reviews/` are **still `action="#"`**.
Neither is a lead — a comment needs moderation, a testimonial needs a rating
and a body — so both need a destination and a schema decision nobody has made.

**Spam protection is `src/components/SpamGuard.astro`**, and which provider it
renders is one word in `captcha.provider` (`src/data/site.ts`). Turnstile is the
default: invisible, no checkbox, no consent banner, and no friction on a paid
click. It drops its token into a hidden `cf-turnstile-response` input it inserts
into the form; every submit handler reads that, falling back to reCAPTCHA's
field so either provider works without touching the handlers. The Worker
verifies against whichever provider is configured — both take the same
`secret`/`response` pair and answer the same shape, so one function covers both.

The arithmetic question the original asked (7+2, 7+1) is gone from every form,
on instruction. It was never protection: WPForms printed the expected answer
into the page beside the question.

Order of checks in the Worker: honeypot (answers 200, stores nothing), then
captcha, then required fields, then email shape.

**THE KEYS ARE PUBLISHED TEST KEYS, not the client's.** The API token here has
no Turnstile permission — creating a widget returns "Authentication error" — so
a real one could not be provisioned. Unlike Google's pair, Cloudflare publishes
a *failing* secret too, so both branches are provable rather than only the happy
one, and both were.

To go live, either:

| Provider | What is needed |
|---|---|
| Turnstile | a widget from dash.cloudflare.com → Turnstile (or grant the token Account → Turnstile → Edit), then `PUBLIC_TURNSTILE_SITE_KEY` at build time and `wrangler secret put TURNSTILE_SECRET` |
| reCAPTCHA | set `captcha.provider = 'recaptcha'`, build with `PUBLIC_RECAPTCHA_SITE_KEY=6Lcy1lwa…`, and `wrangler secret put RECAPTCHA_SECRET` |

Shipping on a test pair by accident is not possible: the Worker refuses all
three published test secrets on a `PRODUCTION_HOSTS` hostname and answers 503.
The client's reCAPTCHA key is domain-locked to evergreencleaningservice.ca —
measured, not assumed: the staging origin returns *Invalid domain for site key*.

Measured on the deployed staging site:

```
widget height ..................... 0px on every form — nothing to click
token issued ...................... yes, without any interaction
two forms on one page ............. /request-a-quote/ renders 2 widgets, and
                                    the SECOND form submits successfully
api.js loaded ..................... once per page, not once per widget
end-to-end ........................ filled 4 fields, pressed submit, landed on
                                    /thank-you/ — zero captcha interaction
endpoint, no token ................ 403
endpoint, always-FAILS secret ..... 403   <- the reject branch, proven
endpoint, always-passes secret .... 200
```

### 7.1b The two landing pages

`/lp/commercial-cleaning/` and `/lp/commercial-cleaning-quote/` are siblings,
not a page and its replacement. Both noindex, both excluded from the sitemap,
both post to `/api/submit-lead`, and they carry different `form_id`s
(`ppc-lead-form`, `lp-commercial-cleaning-quote`) so their conversion data does
not merge. Kill whichever loses.

Three things the second one settled that are worth not re-deciding:

- **The layout's logo used to link to `/lp/commercial-cleaning/` by hardcode.**
  On any other landing page that is an escape hatch to a different offer — the
  one thing `LandingLayout` exists to prevent. It self-links now.
- **`/thank-you/` is shared and the two promise different response times.** The
  promise arrives as `?t=2`. It cannot be read in frontmatter: this is a static
  build, so `Astro.url.searchParams` resolves once against a URL with no query
  string. The first version did exactly that and shipped a page that said 24
  after redirecting to `?t=2`. Both numbers are now in the HTML and a
  synchronous head script picks one by class before paint.
- **The conversion hook is a `dataLayer` push, not `gtag()`.** The container
  already holds AW-16819334998 with its conversion actions; a gtag call
  alongside it reports every lead twice, and Smart Bidding learns from the
  doubles. The page announces `lead_form_confirmed` with the `form_id`; the
  agency triggers on it.

Departures from the brief for the second page, each recorded in the page's own
header: "Since 2009" (the client's site says since **1989**, and separately
"over 20 years" — 2009 appears nowhere); Turnstile (the API token has no
Turnstile permission, so it ships on the v2 checkbox); and `tel:4168034880`
(the site's canonical anchor is E.164 `tel:+14168034880`).

The 4.9/5 rating renders as briefed and is deliberately **not** in the page's
JSON-LD — nobody here has checked it against the real Google profile, and an
unverified `aggregateRating` is a manual-action risk rather than a rich result.

### 7.2 Google Tag Manager — live on staging as well as production

`GTM-5PRC4HBV` loads on every page, in both halves the original has: the head
loader and the `<noscript>` iframe first inside `<body>`.

**One id, not five.** Verified against the 2026-09-18 archive capture: the
original's markup contains `GTM-5PRC4HBV` four times and no `AW-`, `G-`, `UA-`
or UET id anywhere. Everything else arrives inside the container — Google Ads
`AW-16819334998` (three conversion actions, two with Enhanced Conversions, plus
remarketing and a conversion linker), GA4 `G-R27QW21PMT`, Microsoft Ads UET
`187178776`, and the SearchKings template. Tag Assistant lists three Google tags
on a page whose source contains one, because it reports what loaded. Adding
gtag directly alongside this would double-count every conversion.

**Where it fires** is `site.analyticsHosts` and nothing else. An earlier version
also required a build-time `PUBLIC_ANALYTICS=1` that `build:preview` never set,
so staging shipped no tag at all and there was no way to confirm the port short
of going live — two mechanisms for one decision, and two ways to ship a silently
untagged site. That guard is gone; the hostname allowlist is the only one.

Staging is on the list deliberately, and it costs something: staging pageviews
reach the live GA4 property and the live remarketing lists. Loading a page is
not a conversion — those fire on `lead_form_submission` and `click_to_call` —
so **do not submit the staging form unless testing the form is the point**, or
it registers a real conversion in the client's Google Ads account.

The loader pushes `site_environment: 'staging' | 'production'` ahead of
`gtm.start`, so SearchKings can exclude staging with one blocking trigger on
`site_environment equals staging` without any change here.

Measured in Chromium on the deployed staging site — home, a blog post and the
PPC landing page: `google_tag_manager` holds `GTM-5PRC4HBV`, `G-R27QW21PMT` and
`AW-16819334998`; `analytics.google.com/g/collect`, the AW remarketing pixel and
`bat.bing.com/p/action/187178776.js` all fire. On `*.workers.dev`, nothing
loads.

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

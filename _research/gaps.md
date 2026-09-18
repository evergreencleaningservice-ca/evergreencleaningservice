# Known differences from the original

Every difference the parity check reports is either fixed or written down here
with a reason. A difference that is not on this list is a defect.

## 1. The reference snapshots are not all from the same date

The archive captured the **pages** in April 2025 and most **posts** in 2023, and
the site changed in between. Comparing a 2026 build against both at once
produces differences that are really differences between two versions of the
original.

| Reported as missing on posts | Why it is allowed |
|---|---|
| `Follow us on Social Media` + the three social links in the footer | The 2023 footer carried them; the 2025 footer does not. The port matches the newer one, and keeps the social links in the homepage contact section, where the 2025 original has them. |
| `Copyright © 2023 Evergreen Cleaning Service ~` | Snapshot year and the older business name. The port renders the current year and the current name, as the 2025 pages do. |
| Breadcrumb root `Evergreen Cleaning Service` | The business was renamed to *Evergreen Office Cleaning* between the two captures. The port uses the current name, matching the 2025 pages. |

## 2. Comments

**Ported.** The comment form is present on every post with the original's field
set — Comment, Name, Email, Website and the "save my name…" checkbox — and the
original's own wording and submit label.

None of the archived posts carried an actual comment thread: all 38 have the
area and an empty list. If threads were posted after the 2023 capture they live
in the client's WordPress database and would need importing.

The form does not submit yet. A comment needs somewhere to be stored, read back
from and moderated before it appears, so it waits on the same backend decision
as the contact and quote forms.

## 3. `tel:` scheme

The original writes `tel://4168034880`. The `//` makes the number a URL
authority, which some dialers reject. The port writes `tel:+14168034880` — the
same number, in the form dialers expect. **A deliberate bug fix**, applied to all
133 phone links.

## 4. Tag cloud addresses

The sidebar tag cloud is present with the original's 26 tags and their weights,
but **which post carried which tag is not recoverable** — the theme never
rendered tag links on individual posts, so the archive has no record of the
assignments.

The tag addresses therefore redirect to the news archive rather than filtering.
Every link resolves; none of them filters. Restoring real tag pages needs the
tag assignments from the client's WordPress database.

## 5. `/services/building-maintenance/`

In the site's navigation, never captured by the archive. The page exists and
carries the homepage's summary paragraph for that service, marked in the file as
a content gap. **Needs the real copy from the client.**

## 6. Hero slides

The archive's markup lists three hero background images. A screenshot of the
live site taken during this build shows roughly seven pagination dots, which
suggests the hero was changed after the April 2025 capture. The live origin
blocks this network at the firewall, so it could not be confirmed. Built with
the three the archive has, at the user's direction.

## 7. Elements at `opacity: 0`

The parity check flags six on the homepage: two inactive hero slides and four
inactive rotating words. These are the resting state of the hero slideshow and
the rotating headline, not entrance animations that failed to fire.

## 8. The Lead Net video widget

The floating video panel in the bottom right corner is **built, working and
site-wide**, but two things about it could not be taken from the record:

**Its source could not be read.** The widget was added to the live site after
the April 2025 archive capture — there is no snapshot of it, and the live origin
refuses this network at the firewall (SiteGround answers with its IP-reputation
captcha instead of the page; confirmed again while building this). So the panel
is reconstructed from a screenshot of it working.

It has the original's two states: **collapsed** to a round thumbnail with a
green ring, a "Click to open ->" pill and a small grey dismiss badge, and
**open** to the full panel.

| Measured off the screenshots | Inferred |
|---|---|
| Orb 80px with a 4px `#4e8b2b` ring — the site's own green | The delay before the bubble appears |
| Dismiss badge 20px of `#868686`, 6px left and 4px above the orb's corner | That the thumbnail loops while the panel's clip plays once |
| Pill 120x39, 7px from the orb | That closing the panel returns to the bubble, while dismissing the bubble ends it |
| Panel 320px wide; control bar, its three controls in order, the close button | That a dismissal is remembered for the rest of the session |
| "Request below", the "Request a Free Quote" button with its icon above the label, the "Powered by Lead Net" strip | |

**The clip is the client's own**, supplied from their Lead Net dashboard and
committed at `public/video/lead-net.mp4` — 720x540, H.264 and AAC, 42.2s, moov
atom ahead of the data so it starts without the whole file. If it is ever
missing the widget renders nothing rather than showing an empty black box.

The clip is 4:3 landscape and the widget shows portrait, so the orb fits the
frame while the panel takes a 320x477 slice out of the middle of it, which is
the picture area the original has.

The clip also carries **black letterbox bars baked in** — it is widescreen
footage inside a 4:3 container. The portrait crop keeps them, which put black
bands above and below the picture that the original does not have. Rather than
hard-code a bar height, the widget reads the first frame on a canvas and finds
the picture band, then scales and offsets the video so the bars fall outside the
panel. That survives the clip being replaced. The orb is deliberately left
alone: the original's orb shows the bars too.

**What has not been seen here.** This container's Chromium is the open-source
build with no H.264 decoder, so the client's clip has never been decoded during
this build. The layout and the bar-finding were proved against a generated
720x540 clip with 67.5px bars, which this Chromium can decode; how the portrait
crop frames the speaker still wants a human eye.

## 9. The Google reviews widget

The original's reviews band runs a Trustindex script. The script is not ported;
the band is a static slider carrying the same four reviews.

They are not retyped or approximated. The Trustindex WordPress plugin writes the
whole widget into the page inside `<template id="trustindex-google-widget-html">`
for its script to hydrate from, and the archive captured that template — so the
names, dates, ratings and full review text in `src/data/reviews.ts` are the real
ones, and the avatars were fetched from the Google URLs in the same template and
are served from this site.

The slider's settings come from the template's own attributes rather than from
guesswork: `data-layout-category="slider"`, `ti-col-3`,
`data-review-target-width="300"`, `data-pager-autoplay-timeout="6"`,
`ti-text-align-left`.

Its **behaviour** was read from Trustindex's `loader.js`, which is still served
from their CDN and is reachable from here even though the client's own origin is
not:

- Autoplay is `setInterval(move, 6000)` with a 1000ms animation, held while
  `isMouseOver`.
- This widget carries no `data-slider-loop`, and without it the slider does not
  wrap. `toggleNavigation` hides the next control at the last review and flips
  the autoplay direction to `prev`, then flips back at the first — it paces to
  the end and walks back. The port does the same.
- Its next/prev controls are not on show. The original's visible surface is the
  timer, a swipe, and the arrow keys while the widget is on screen.
- "Read more" appears only where the text is actually clipped. Where it is not,
  the widget replaces the label with a non-breaking space and sets opacity to 0
  rather than removing it — which is what keeps the cards in a row the same
  height. Opening animates the text box's height over half a second and swaps
  the label to the template's "Hide".

Two things follow from it being static rather than live:

- **New reviews will not appear by themselves.** The client's Google reviews are
  fixed at the four the archive holds. Adding one means adding it to that file.
- **The dates are worked out at build time**, so a rebuild keeps them honest —
  "5 years ago" rather than a frozen string.

Its five-star badge is a bare `<img>` whose alt calls it a button but which
links nowhere; here it links to the business's Google review page, and looks
identical.

## 10. The About band's second free-quote button

The April 2025 archive ends the "We are Evergreen Office Cleaning" block with a
second free-quote image button, inside a `wp-block-columns`. **The live site
does not have it** — the client confirmed after seeing it in the port — so it is
not built.

This is the same class of difference as section 1: the archive is from April
2025 and the site has changed since. The one button at the end of the editor
content above it is present on both and stays.

## 11. Entrance animations

Every `wow slideInUp` the original carries is present, on the same element in
the same section. Censused from both pages:

| Section | Animated block |
|---|---|
| features | each of the three steps |
| services | each of the three cards |
| about | the "We are Evergreen Office Cleaning" block — **not** the editor content above it |
| testimonials | the row |
| news | the post list |
| contact | the form, and the "WE ARE ACCEPTING NEW CLEANING CLIENTS" block |

The original has one more `wow` than the port: a twelfth on the footer's
copyright line. It carries **no animation class**, so WOW.js reveals it and
nothing moves — dead markup left over from an earlier theme version. It is not
reproduced.

## 12. Heading levels

The original's **hero title is an `<h2>`** and its only `<h1>` is "Toronto
Office Cleaning Services" in the About band. The port matches that. It had
briefly carried an `<h1>` in both places.

**Section subtitles** ("Evergreen Office Cleaning" above each section title)
were `<p>` here and are `<h5>` in the original; the full-page census in §16
caught it and they are `<h5>` now, as are the `h4` step, service-card and
testimonial titles. The outline reads oddly — each eyebrow is a heading that
sits *above* the `<h2>` it introduces — but it is the theme's outline, and
matching it is the brief.

## 13. The gallery's justified layout

The gallery images link to their full-size files and carry the theme's
`g-zoom-in` hover, as the original's do. What is **not** reproduced is the
justified-gallery script the original runs over them, which sizes each row to a
187px height and varies the widths to each image's own aspect ratio.

That script is not in the archive and does not run in the reference copy — its
gallery items measure 0x0 there — so there is nothing to port it from. The port
uses a uniform grid at the original's own `data-spacing="5"`. Side by side the
two read the same; the difference is that the original's rows can have unequal
image widths where the source aspect ratios differ.

## 14. Blog post thumbnails

Eight of the 38 posts have no featured image, and they are **not recoverable
from the archive** — retrying will not help.

The blog listing pages name the file for every one of the 38, so the addresses
are all known. But a CDX query for those eight returns no capture at all,
neither for the `-300x150` crop the listings use nor for the full-size upload
it is derived from:

    dental-office-1 · air-quality-1 · hand-sanitizer · duster · slips
    lobby_1-e1597778322357 · post-covid-19-office · office-building-exterior

They exist only in the client's media library. They affect the blog listings,
not the homepage.

The ninth, `office-layout-3-300x150.jpg`, was recovered this way and is in
place, so all three posts in the homepage's Latest News band have their
thumbnail.

## 15. Images the archive never captured

Roughly seventy images referenced by the original were never stored by the
Wayback crawler. Where a sibling size-variant of the same asset survived, the
port points at that; where nothing survived, the reference was removed rather
than left broken. Full list in the session notes; recoverable from the client's
media library.

## 16. The full-page census

Every paired URL diffed against its archived counterpart at 1440px — visible
text, links, images, heading outline, form fields, horizontal overflow — after
stepping down the page so entrance animations have fired. 58 pages: the home
page, 7 pages, 5 service pages, 45 posts, and the blog and category listings.

    pages diffed ...................... 58 of 58
    scrolled before census ............ yes, stepped

    MISSING
      visible text nodes .............. 129
      links ............................ 17
      images ........................... 60
      form fields ...................... 91
      heading outline .................. 6 pages differ
      horizontal overflow at 1440 ...... none

    ACCOUNTED FOR
      footer copyright line ........... 108 text   (capture year)
      /blog/page/3/ stale capture ..... 21 text · 14 links · 5 images · 1 page
      reCAPTCHA's hidden input ........ 60 fields
      older generation of form 1381 ... 31 fields
      images the archive never kept ... 42
      list crops with no source ....... 12
      lazy-load placeholder ............ 1
      green products' dead image links . 3
      empty headings in the original ... 4 pages
      hero the reference cannot render . 1 page

    UNEXPLAINED DIFFERENCES ........... 0

Each of those lines, and why it is not a defect:

**The footer copyright line** (108). The port writes the current year and the
current trading name, as the original's WordPress does. The reference pages are
2022, 2023 and 2025 captures, so they read 2022, 2023 and 2025 and name the
business as it was called then; the port reads 2026. One line, three years.

**`/blog/page/3/`** (21 text, 14 links, 5 images, 1 heading outline). That
page's snapshot predates eight posts, so its third page holds what is now the
fourth. `/category/blog/page/3/` has a newer capture and the port matches it
item for item, as it does pages 1 and 2 of both listings. The pagination is
right; the snapshot is old.

**reCAPTCHA** (60). Each archived form carries a hidden `g-recaptcha-hidden`
input the port has no equivalent for — no site key for this network, and no
backend to verify a token against.

**The older generation of form 1381** (31). The archive holds the quote form
twice: seven services and no address from December 2023 to July 2024, eight
services and an address from April 2025 on. The port carries the 2025 shape,
which is the current site, so every page whose capture is older reports an
address block as extra and a single "Name *" field as missing. An earlier pass
here read the older shape off `/request-a-quote/`, whose newest capture is July
2024, and removed a service and the address block; that was a regression and it
is reverted.

**Images** (42 + 12 + 1). Photos the Wayback crawler never stored, list crops
whose source upload is gone too, and one lazy-load placeholder in the reference.
See §14 and §15; a second sweep of the archive against every sibling size
confirmed there is nothing left to recover.

**The green products page** (3 links). Its three logos — ProSeries Green,
Armstrong, ECOLOGO — are gone, and the Armstrong logo carried the page's only
link to armstrongmanufacturing.com. The original's body text names the address
without linking it, so the link went with the image rather than being moved.

**Empty headings** (4 pages). `<h3></h3>` and `<h4></h4>` the editor left
behind. They render as nothing; the port does not reproduce them.

**The hero** (1 page). The reference never shows it — the slideshow script is
not in the archive, so the hero renders as a spinner and its `<h2>` is invisible
there. The hero was measured separately.

### Two differences of markup, not of rendering

Both were fixed rather than argued with, but they are worth knowing about,
because the census compares text *nodes* and a page can read identically while
splitting them differently:

- the privacy policy's Gravatar paragraph. remark-gfm autolinks a bare address
  that the original renders as plain text. A first attempt used an HTML comment
  to break the autolinker, which stopped the link but split the paragraph into
  two nodes — so the paragraph is written as raw HTML now.
- the homepage's "Service Locations" line, where the original writes "Toronto,"
  loose and the rest inside a leftover `<span>` from a paste.

### What the census does not cover

Spacing and computed style. This pass counts what is present; the measured
work — container steps, the 940px breakpoint, type scale, section padding — is
elsewhere in this file and in the session's measurement scripts. A page can pass
every count here and still be a few pixels out, which is why both passes exist.

## 17. The Simple Banner plugin

The April 2025 capture carries the **Simple Banner** plugin, configured with
`hide_simple_banner: "no"` and this text:

> Concerned about Coronavirus and Looking for a Disinfection Cleaning Services?
> -> LEARN MORE

linking to `/services/disinfection-cleaning-service/`, on a `#2ca516` bar
across the top of every page. The markup is an empty
`<div class="simple-banner simple-banner-text" style="display:none !important">`
that the plugin's own script fills and reveals, so it is invisible in the
reference copy and there is no capture of it rendered.

It is **not built**, deliberately: the client's own side-by-side screenshots of
the live site show no such bar, which suggests the banner was switched off some
time after that capture. It is recorded here rather than added, because adding
it would put a green bar across every page of a site the client is reviewing
against screenshots that do not have one. Worth one question to the client.

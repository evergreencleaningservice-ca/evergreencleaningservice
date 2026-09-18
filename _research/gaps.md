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

Two things follow from it being static rather than live:

- **New reviews will not appear by themselves.** The client's Google reviews are
  fixed at the four the archive holds. Adding one means adding it to that file.
- **The dates are worked out at build time**, so a rebuild keeps them honest —
  "5 years ago" rather than a frozen string.

The original's markup carries a "Read more" control that its own layout never
displays, so reviews here clamp to four lines with an ellipsis and no control,
which is what the original shows. Its five-star badge is a bare `<img>` whose
alt calls it a button but which links nowhere; here it links to the business's
Google review page, and looks identical.

## 10. Images the archive never captured

Roughly seventy images referenced by the original were never stored by the
Wayback crawler. Where a sibling size-variant of the same asset survived, the
port points at that; where nothing survived, the reference was removed rather
than left broken. Full list in the session notes; recoverable from the client's
media library.

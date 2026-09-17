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

Posts in the original carry a WordPress comment form — *Leave a Reply*, Comment,
Name, Email, Website, and the "save my name…" checkbox.

**Not ported.** A static build has nowhere to post them and nowhere to read
existing ones from, so the honest options were a form that silently fails or no
form. Shipping markup that looks like a working comment form and quietly drops
what people write is worse than not having one.

Reinstating comments means choosing a backend (a hosted comment service, or the
same database the forms will eventually use). That is a decision for the client,
not something to default into.

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

## 8. Images the archive never captured

Roughly seventy images referenced by the original were never stored by the
Wayback crawler. Where a sibling size-variant of the same asset survived, the
port points at that; where nothing survived, the reference was removed rather
than left broken. Full list in the session notes; recoverable from the client's
media library.

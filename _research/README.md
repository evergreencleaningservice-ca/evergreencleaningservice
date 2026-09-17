# Research dossier — evergreencleaningservice.ca

## Why this is not an Elementor clone

`wp-clone-elementor-design` was invoked against this site and **refused**, which
is the correct outcome. Recorded as **`wrong skill — handed back to gate 8`**.

The builder census across all 64 archived pages:

| Check | Result |
|---|---|
| Pages containing `elementor` | **0** |
| `data-widget_type` markers | **0** |
| Theme | `onepress` (plus `responsive-brix` on 2019-era pages) |
| Plugins | `contact-form-7`, `sg-cachepress` — no page builder |
| Generator | WordPress 5.2.4 / 5.7.2 |

This is the failure mode that skill documents at RexdaleMobileWash: a zero census
passes every check, the dossier comes back empty, and the port silently becomes a
rebuild by eye while the record says `clone`. It is not recorded as a clone here.

**What was kept from that procedure** is the rule it exists to enforce — *never
design from page text; read what the site actually renders.* The site has no
per-element Elementor stylesheets to read, so the equivalent source is the
theme's own combined stylesheet plus computed styles from a real render. That is
what was measured.

## How the dossier was collected

Not by Scrapling, and the record says so rather than implying otherwise.

Scrapling 0.4.15 **was** installed and run against the live origin. It cannot
reach it: SiteGround serves a proof-of-work interstitial to this network, and
while the challenge solves (21 bits, ~650ms, valid `_I_` clearance cookie
issued), the next request still returns **403**. Five TLS impersonation profiles
(Chrome 124/131/136, Safari 17, Firefox 135) make no difference, which places the
block at the firewall on the egress IP range rather than at the anti-bot layer.
Routing around that is not something this build does.

So the source is the **Internet Archive**, rendered locally against the site's own
stylesheet:

| Source | Detail |
|---|---|
| Page HTML | 64 pages, Wayback `id_` (raw, no toolbar rewriting) |
| Freshest captures | homepage + core pages Apr 2025; `/services/office-cleaning/` Oct 2025 |
| Stylesheet | the real 633 KB SiteGround-combined sheet, Apr 2025 |
| Renderer | Chromium via Playwright, local, at 390 / 768 / 1440 |

The archived pages lazy-load (`src` is a 1×1 GIF, the real file sits in
`data-src`), so the reference build promotes `data-src` to `src` before
measuring. Without that the logo measures 100×100 instead of 334×100 and every
image measurement is wrong while looking plausible.

## Files

| File | Contents |
|---|---|
| `pages.md` | page inventory grouped into template families |
| `design-tokens.md` | the measured type, colour and spacing system |
| `fonts.md` | declared vs computed faces — the step that caught faux-bold |
| `structure.md` | section outline per template family |
| `gaps.md` | what is known to differ from the original, and why |

The measurement harness itself lives outside the repo, in the session scratchpad:
`mkref.mjs` (build the reference), `refspec.mjs` (dump the original's computed
values), `measure.mjs` (diff port against original), `fontuse.mjs` (which faces
actually compute).

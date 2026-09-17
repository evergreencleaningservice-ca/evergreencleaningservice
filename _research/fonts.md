# Fonts — declared vs computed

Settled by testing which faces actually render, not by reading the site's
`@font-face` list. The two answers differ, and the difference was shipping.

## What the original serves

Sixteen `@font-face` blocks, inlined into the page by SiteGround's font
optimiser (not in the theme stylesheet, and not a `<link>` to Google Fonts —
they point at `fonts.gstatic.com` TTF files):

| Family | Weights served | Styles |
|---|---|---|
| Open Sans | 300, 400, 600, 700 | normal **and** italic |
| Raleway | 100, 300, 400, 500, 600, 700, 800, 900 | normal only |

## What actually computes

Measured across the homepage, about, contact, a post and a service page —
every element carrying text, by resolved family + weight + style:

| Family | Weight | Style | Elements |
|---|---|---|---|
| Open Sans | 400 | normal | 2297 |
| Open Sans | 600 | normal | 107 |
| Open Sans | 500 | normal | 22 |
| Open Sans | 700 | normal | 10 |
| Open Sans | 400 | *italic* | 8 |
| Open Sans | 700 | *italic* | 5 |
| Open Sans | 300 | normal | 2 |
| Open Sans | 100 | *italic* | 1 |
| Raleway | 600 | normal | 112 |
| Raleway | 700 | normal | 41 |
| **Raleway** | **800** | normal | **10** |
| Raleway | 400 | normal | 2 |

Open Sans 500 computes on 22 elements but is **not** among the four weights the
original serves, so it is synthesised on the original too. Matching the served
set reproduces the original's rendering; matching the computed set would not.

## The gap this caught

The port requested:

    Open+Sans:wght@400;600;700 & Raleway:wght@500;600;700

Missing **Raleway 800** — which carries the hero heading and every section
title — plus **both Open Sans italics** and Open Sans 300.

This is invisible to a computed-style diff. `getComputedStyle` reports
`font-weight: 800` whether the 800 face is loaded or the browser is faking bold
from 700, and reports `font-style: italic` whether the italic face is loaded or
the browser is slanting the roman. The numbers matched while the glyphs were
synthetic.

## What the port now requests

    Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700
    Raleway:wght@400;500;600;700;800

Italics are loaded for 400 and 700 only — the two the measurement found in real
use. The single italic-100 element is served by the nearest available face, as
it effectively is on the original.

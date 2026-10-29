# iStock photo replacements — partial preparation

The user requested a distinct stock replacement for each of 89 photographic
assets, with fewer visible faces. Logos, certification marks, functional
graphics, video/poster content, unused legacy files and the unpublished project
photo are outside this photo inventory.

37 selected originals were downloaded using the existing iStock allowance.
The subscription allowance then ran out. The user chose to keep 89 distinct
photos instead of reusing these 37 across the other placements. The remaining
52 entries in `manifest.json` are pending. No extra downloads were purchased.

This branch prepares the 37 licensed selections and their responsive, thumbnail
and social variants. Source alt text and the gallery's illustrative-stock label
are updated alongside them. Existing image dimensions and paths are preserved.
The other 52 photographic assets are unchanged and still require replacement.

The user authorized deploying this partial set of 37 replacements on October 29,
2026, and explicitly authorized updating the website repository with GitHub.
This is a partial rollout: the remaining 52 photos are still pending.
In particular, do not run `b2:sync` as a staging-only operation: that image host
is shared with production, and overwriting these keys changes production images.

## Reproduce

Keep licensed originals in private storage. This repository contains only
the cropped and optimized website renditions, not the full-resolution originals.
Provide JPEG working copies named `<stockId>.jpg` in a private directory.
The current working copies were reduced to a maximum width of 2400 pixels;
the original downloaded files remain on the user's device.

```sh
node scripts/import-stock-photos.mjs --sources /private/web-sources
node scripts/import-stock-photos.mjs --sources /private/web-sources --apply
```

The first command renders and validates a temporary set. `--apply` also copies
that complete validated set into the local website. Neither command uploads or
deploys anything. `prepared.json` records the dimensions and sizes of the output.

For the remaining selections, obtain licensed originals, add their crop choices,
mark only those actually licensed, and update their alt text before rendering.
Maintain the distinct-photo requirement and the face-avoiding direction.

The complete interactive source/replacement selection map is maintained
separately as `Evergreen-Stock-Photo-Replacement-Map.html`.

## Validation

- 117 tests passed across image, social-image, image-parity and landing-page checks.
- The preview build completed with 124 pages; the canonical image-host check passed.
- All 406 generated files were decoded and their dimensions validated before copying.
- Desktop/mobile hero crops and face-avoiding crops were visually reviewed.
- No deployment, CDN upload or live responsive-page verification was performed.

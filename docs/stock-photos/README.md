# Stock image replacements

All 89 assets in the photographic inventory now have distinct downloaded stock
selections: 37 from iStock and the remaining 52 from Magnific. The user authorized
Magnific for the remainder on October 30, 2026, including illustration-style
images. Logos, certification marks, functional graphics, video/poster content,
unused legacy files and the unpublished project photo are outside this inventory.

The 52 Magnific selections replace the remaining AI assets and update matching
source alt text. The isolated floor scrubber is illustration-style stock. Other
selections depict cleaning equipment, hands, surfaces and interiors; crops avoid
visible faces. Existing filenames and dimensions are retained across JPEG,
WebP, AVIF, responsive, thumbnail and social renditions.

## Reproduce

Keep downloaded originals private. The repository contains optimized website
renditions, not full-resolution originals. Provide JPEG working copies named
`<stockId>.jpg` in a private directory. Working copies use a maximum width of
2400 pixels; originals remain on the user's device. Source URLs and crop regions
are recorded in `manifest.json`.

```sh
node scripts/import-stock-photos.mjs --sources /private/all-stock-sources --apply
node scripts/import-stock-photos.mjs --sources /private/magnific-sources --provider Magnific --apply
```

Omit `--apply` to prepare and validate without copying into the website. The
provider filter allows a later batch to be rendered without changing earlier
stock replacements. `prepared.json` records the current batch, output dimensions
and byte sizes. Sources for both providers are needed when omitting the filter.

## Publishing

The working-tree import does not upload or deploy images. The image host is
shared with production: `b2:sync` immediately changes images at existing public
URLs and must never be described as staging-only. After the reviewed changes
reach main, run the normal deployment gates, sync the changed image keys, deploy
the pages and explicitly purge changed image URLs from the CDN. Verify live
images after the purge. Do not claim production changed merely because this
repository contains prepared images.

## Current batch validation

- 52 distinct Magnific selections; 400 changed website renditions, all decoded
  with expected dimensions and recorded byte sizes.
- The preview build and canonical image-host check pass.
- 28 image, social-image and image-parity tests pass.
- Full suite: 864 passed, one environment failure because no Chromium executable
  is installed. Browser installation was unavailable in this environment.
- Source crops and generated JPEG renditions were visually reviewed.
- Production publication must be verified separately after deployment.

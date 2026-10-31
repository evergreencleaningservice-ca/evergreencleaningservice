# Office cleaning cost guide — stock photo record

## Selected assets

| Use | Magnific ID | Author | Original JPEG | Source |
| --- | --- | --- | --- | --- |
| Featured, cropped 16:9 | 10810007 | wirestock | 6000 × 4000 | [Modern office](https://www.magnific.com/free-photo/beautiful-shot-modern-style-open-space-office-interior_10810007.htm) |
| In-body kitchen | 24747597 | Magnific | 6554 × 4369 | [Kitchen cleaning](https://www.magnific.com/free-photo/side-view-hand-cleaning-kitchen_24747597.htm) |
| In-body boardroom | 12615858 | pch.vector | 5516 × 3678 | [Empty boardroom](https://www.magnific.com/free-photo/empty-boardroom-glass-wall-meeting-room-with-conference-table-shared-desk-team-workplaces-trading-graphs-monitor-office-interior-commercial-real-estate-concept_12615858.htm) |

The three exact selections were obtained through the connected Magnific stock-download tool. Its catalogue describes all three as non-AI photos and free resources; the signed-in website's Information panel identifies the effective licence for each as **Premium**. These are different fields, not a claim that an asset-page URL alone grants a licence. All three appear in the account's stock download history with a download date of 31 October 2026. No editorial-only restriction was shown.

## Applicable terms and evidence

- [Magnific licences and attribution](https://www.magnific.com/ai/docs/licenses-attribution): Premium licences permit commercial websites, cropping and other modifications, and client projects. Attribution is not required for Premium downloads. Original-file redistribution and sublicensing are prohibited.
- [Magnific Terms of Use](https://www.magnific.com/legal/terms-of-use), June 2026, section 8.1 governs the stock licence and its restrictions.
- Premium licence certificates for IDs 10810007 and 12615858 were downloaded from **Stock downloads → Download license** and retained privately alongside the originals. Both certificates identify their respective item and the 31 October 2026 download date.
- The kitchen asset's Premium designation and dated account download record were verified. Its **Download license** button did not produce a saved PDF in this browser session, including an explicit download-event check. The Premium designation and dated download record establish the verified account licence; no PDF certificate is claimed to have been saved for this asset. A further attempt at release also produced no download event.
- Private originals and certificates are in the task workspace's sibling `.stock-originals` directory, outside this public repository. They contain account information and must not be committed or published. Signed download URLs are not retained in source.

Visible author/source credits remain beside all three photos. The office and boardroom contain no people. The kitchen image shows hands/part of a torso, with no face. These illustrative stock photographs are not represented as Evergreen's premises or staff.

The selected featured photograph shows glass partitions and seating rather than organized desks. Its alt text describes those visible features accurately; the selected asset itself has not been substituted.

## Web delivery

`scripts/prepare-office-cost-images.mjs <private-original-directory>` creates AVIF, WebP and JPEG files at 480, 768 and 1200 pixels, with explicit dimensions, plus fallback JPEGs, archive thumbnails and 1200 × 630 social crops. The featured image loads with high priority; in-body images and related thumbnails load lazily. The article supplies responsive sources through the existing image helpers.

`office-cost-renditions.json` records original dimensions and SHA-256 checksums, plus each generated filename, dimensions and byte size. It contains no account details. Only optimized website renditions are included in the public repository.

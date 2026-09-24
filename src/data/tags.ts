/**
 * The blog's tag taxonomy, as the original publishes it.
 *
 * WHY THIS FILE EXISTS. The port shipped without tags: the sidebar's third
 * widget was a "Request Quote" form that the original does not have, and the
 * original's tag cloud was dropped. `Sidebar.astro` documented the reason and
 * it was a fair one at the time — `/tag/*` was a blanket 301 to
 * `/category/blog/`, so twenty-six different words would all have meant "the
 * blog". The answer to that is to build the archives, not to delete the
 * navigation, and that is what this file feeds.
 *
 * WHERE THE DATA COMES FROM — the original's own WordPress, read through its
 * REST API, not inferred from the rendered page:
 *
 *   /wp-json/wp/v2/tags?per_page=100     names, slugs and post counts
 *   /wp-json/wp/v2/posts?per_page=100    which tag ids each post carries
 *
 * Harvested 2026-09-23. All 38 post slugs matched this repo's blog collection
 * exactly, and every count below was reproduced by counting the assignments
 * independently — 26 tags, zero disagreements. `tests/build/tags.test.ts`
 * re-runs that reconciliation against the built site, so the two can never
 * drift apart quietly.
 *
 * NINE TAGS ARE DELIBERATELY ABSENT. WordPress's theme-unit-test import left
 * `alignment`, `captions`, `content`, `css`, `image` and `markup` behind with
 * zero posts each. The original's own cloud excludes them, because an empty
 * archive is not a destination, and so does this.
 *
 * THE FONT SIZES ARE MEASURED, NOT COMPUTED. Every value in `size` is read
 * straight off the original's rendered `.tagcloud` markup, where WordPress
 * writes it as an inline `font-size` in points. They are kept at the precision
 * the original emits.
 *
 * They are NOT re-derived from `count`, and that is on purpose. WordPress's
 * published cloud does not match the linear interpolation its own
 * `wp_generate_tag_cloud` documents — 14 posts renders at 18.44pt where linear
 * scaling between 8pt and 22pt would give 14.5pt — so any formula written here
 * would be a guess dressed up as an algorithm. The measured number is the one
 * the client's visitors actually see.
 *
 * The trade is that these sizes are a snapshot: publish enough new posts and
 * the proportions here stop matching the counts. The count check in the test
 * is what catches that, loudly, rather than letting the cloud rot.
 */

export type Tag = {
  /** URL segment: /tag/<slug>/ */
  slug: string;
  /** Display name, in the original's own casing — "Dusting", not "dusting". */
  name: string;
  /** Post count the original publishes, used to verify ours matches. */
  count: number;
  /** Inline font-size in points, measured off the original's cloud. */
  size: number;
};

/**
 * In the original's cloud order, which is alphabetical ignoring case —
 * `tag-link-position-1` through `-26`.
 */
export const tags: Tag[] = [
  { slug: 'ai', name: 'AI', count: 1, size: 8 },
  { slug: 'air-quality', name: 'air quality', count: 1, size: 8 },
  { slug: 'allergies', name: 'allergies', count: 1, size: 8 },
  { slug: 'breakroom', name: 'breakroom', count: 1, size: 8 },
  { slug: 'cleaning', name: 'cleaning', count: 14, size: 18.440677966102 },
  { slug: 'cleaning-products', name: 'cleaning products', count: 4, size: 12.745762711864 },
  { slug: 'commercial-cleaning', name: 'commercial cleaning', count: 29, size: 22 },
  {
    slug: 'commercial-office-cleaning',
    name: 'Commercial office cleaning',
    count: 25,
    size: 21.169491525424,
  },
  { slug: 'coronavirus', name: 'Coronavirus', count: 5, size: 13.694915254237 },
  { slug: 'covid-19', name: 'Covid-19', count: 2, size: 10.135593220339 },
  { slug: 'daycares', name: 'daycares', count: 1, size: 8 },
  { slug: 'dental-office', name: 'dental office', count: 1, size: 8 },
  { slug: 'dust', name: 'Dust', count: 1, size: 8 },
  { slug: 'dusting', name: 'Dusting', count: 1, size: 8 },
  { slug: 'entrance', name: 'entrance', count: 1, size: 8 },
  { slug: 'janitorial-services', name: 'janitorial services', count: 21, size: 20.338983050847 },
  { slug: 'manual-cleaning', name: 'Manual cleaning', count: 1, size: 8 },
  { slug: 'moving', name: 'moving', count: 1, size: 8 },
  { slug: 'office', name: 'office', count: 14, size: 18.440677966102 },
  { slug: 'plants', name: 'plants', count: 1, size: 8 },
  { slug: 'refrigerator', name: 'refrigerator', count: 1, size: 8 },
  { slug: 'relocating', name: 'relocating', count: 1, size: 8 },
  { slug: 'retail', name: 'retail', count: 1, size: 8 },
  { slug: 'robotic', name: 'Robotic', count: 1, size: 8 },
  { slug: 'schools', name: 'schools', count: 1, size: 8 },
  { slug: 'winter', name: 'winter', count: 1, size: 8 },
];

/** Display name for a slug, or the slug itself if it is not one of ours. */
export const tagName = (slug: string): string =>
  tags.find((t) => t.slug === slug)?.name ?? slug;

/**
 * The nine zero-post tags the original's cloud omits.
 *
 * Listed rather than merely absent, because `/tag/alignment/` and friends are
 * still addresses the original serves. They keep falling through the
 * `/tag/*` wildcard to the blog archive, which is the right destination for a
 * tag with nothing filed under it.
 */
export const emptyTagSlugs = [
  'alignment',
  'alignment-2',
  'captions-2',
  'content',
  'content-2',
  'css',
  'image',
  'markup',
  'markup-2',
] as const;

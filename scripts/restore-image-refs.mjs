/**
 * Put the recovered images back into the content, in the right places.
 *
 * WHY NOT JUST APPEND THEM. Because an image at the bottom of a page is not
 * the image the page had. On `/green-clean-products/` the Armstrong logo sits
 * directly above "For more information visit Armstrong Manufacturing", and
 * the ECOLOGO mark directly above the paragraph explaining what the ECOLOGO
 * mark means. Move either one and the page still contains it while no longer
 * making sense.
 *
 * SO THE ORIGINAL IS THE GUIDE. `harvest-missing-images.mjs` keeps Firecrawl's
 * markdown of the live page, in which every image appears in document order
 * between the paragraphs it belongs to. This walks that markdown, and for each
 * image finds the paragraph that FOLLOWS it, locates the same paragraph in our
 * content file, and inserts the reference above it.
 *
 * Matching on the following paragraph rather than the preceding one is
 * deliberate: WordPress puts a figure before the text it introduces far more
 * often than after, and the text after an image is what a reader uses to
 * decide the image belongs there.
 *
 * ANCHORED ON TEXT, NOT ON LINE NUMBERS. The ported markdown is not a
 * character-for-character copy of the original — entities differ, the
 * navigation is gone, headings were rewritten. An anchor is the first several
 * words of a paragraph, normalised, which survives all of that.
 *
 * DRY RUN BY DEFAULT. It prints what it would change and writes nothing
 * unless `--write` is passed, because a script that edits fourteen content
 * files unattended should have to be asked twice.
 *
 * Usage:
 *   node scripts/restore-image-refs.mjs <harvest.json> [--write]
 */
import fs from 'node:fs';
import path from 'node:path';

const harvestFile = process.argv[2];
const WRITE = process.argv.includes('--write');

const harvest = JSON.parse(fs.readFileSync(harvestFile, 'utf8'));
const IMAGES_DIR = path.resolve('public/images');

/** Where a route's content lives. Blog posts and pages are separate trees. */
const contentFileFor = (route) => {
  const slug = route.replace(/^\/|\/$/g, '');
  const candidates = [
    `src/content/pages/${slug}.md`,
    `src/content/blog/${slug}.md`,
    `src/content/services/${slug.replace(/^services\//, '')}.md`,
  ];
  return candidates.find((p) => fs.existsSync(path.resolve(p))) ?? null;
};

/**
 * The file actually on disk for an image — whatever extension it landed with,
 * and whatever SIZE VARIANT was named.
 *
 * WordPress serves the same asset at several sizes, and the two places a page
 * names it disagree: the markdown link points at `ProSeriesGreen-Logo.png`
 * while the `<img src>` the harvester followed is
 * `ProSeriesGreen-Logo-150x150.png`. Matching stems exactly reported three of
 * the four green-clean-products images as "not recovered" when all three were
 * sitting in `public/images/`.
 *
 * So the size suffix is stripped from both sides before comparing, and the
 * LARGEST variant on disk wins — a page that had the full-size file should
 * not be rebuilt with a 150px thumbnail.
 */
const sizeless = (name) => name.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '').replace(/\.[a-z0-9]+$/i, '');

const savedAs = (file) => {
  const want = sizeless(file);
  const matches = fs.readdirSync(IMAGES_DIR).filter((f) => sizeless(f) === want);
  if (!matches.length) return null;
  /* Prefer the one with no size suffix; otherwise the widest. */
  const bare = matches.find((f) => !/-\d+x\d+\.[a-z0-9]+$/i.test(f));
  if (bare) return bare;
  return matches.sort((a, b) => {
    const w = (s) => Number(s.match(/-(\d+)x\d+\.[a-z0-9]+$/i)?.[1] ?? 0);
    return w(b) - w(a);
  })[0];
};

/**
 * Normalised opening of a paragraph, used as a position anchor.
 *
 * The leading `#`, `-` or `1.` has to come off. Without that, a heading in
 * our file reads as `## that's why we use…` and never matches the original's
 * `that's why we use…` — which is how the ProSeriesGreen logo, whose only
 * neighbours on the page are two headings, failed to place at all.
 *
 * Curly and straight apostrophes are folded together for the same reason: the
 * port normalised some of them and the original did not.
 */
const anchorOf = (text) =>
  text
    .replace(/^\s*(#{1,6}\s+|[-*+]\s+|\d+\.\s+)/, '')
    .replace(/[*_`[\]()]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .slice(0, 8)
    .join(' ');

/**
 * Walk the original markdown and pair each image with the paragraph that
 * follows it. Returns [{ file, alt, follows }] in document order.
 */
const imagePlacements = (markdown) => {
  const lines = markdown.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    /* `![alt](src)` possibly wrapped in a link, possibly with trailing text
       (a caption run onto the same line, as WordPress figcaptions arrive). */
    const m = line.match(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/);
    if (!m) continue;
    const src = m[2];
    if (!/wp-content\/uploads/i.test(src)) continue;
    const file = decodeURIComponent(src.split('?')[0].split('/').pop() ?? '');
    if (!file || /cropped-evergreen|evergreen[-_]?logo|Google-Review-Link/i.test(file)) continue;

    /**
     * Where the image sits, expressed as the text around it.
     *
     * `follows` is the paragraph AFTER the image, which is the better anchor
     * — WordPress puts a figure above the text it introduces. But the last
     * image on a page has no following prose: on
     * `/green-clean-products/` the next line is the sidebar's "Search for:",
     * and anchoring on that put the image nowhere. So `precedes` is captured
     * too, and used as the fallback.
     *
     * Sidebar boilerplate is excluded explicitly rather than hoped against —
     * Firecrawl returns the whole document, so the widgets are in the
     * markdown and they are the same few strings on every page.
     */
    const SIDEBAR = /^(search for:|recent posts|categories|tags|archives|request quote)/i;

    let follows = '';
    for (let j = i + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (!t) continue;
      if (/!\[/.test(t)) break;
      if (SIDEBAR.test(t)) break;
      follows = t.replace(/^(#{1,6}\s|-\s|\d+\.\s)/, '');
      break;
    }

    let precedes = '';
    for (let j = i - 1; j >= 0; j--) {
      const t = lines[j].trim();
      if (!t || /!\[/.test(t)) continue;
      if (SIDEBAR.test(t)) continue;
      precedes = t.replace(/^(#{1,6}\s|-\s|\d+\.\s)/, '');
      break;
    }

    out.push({ file, alt: m[1], follows, precedes });
  }
  return out;
};

let changed = 0;
let placed = 0;
let unplaced = 0;

for (const page of harvest) {
  if (!page.markdown) continue;
  const file = contentFileFor(page.route);
  if (!file) {
    console.log(`  no content file for ${page.route}`);
    continue;
  }

  let body = fs.readFileSync(path.resolve(file), 'utf8');
  const before = body;
  const placements = imagePlacements(page.markdown);
  const notes = [];

  for (const p of placements) {
    const saved = savedAs(p.file);
    if (!saved) {
      notes.push(`  SKIP  ${p.file} — not recovered`);
      unplaced++;
      continue;
    }
    const ref = `![${p.alt}](/images/${saved})`;
    if (body.includes(`/images/${saved}`)) {
      notes.push(`  have  ${saved}`);
      continue;
    }

    const paras = body.split(/\n\n+/);
    const find = (text) => {
      const a = anchorOf(text);
      if (!a) return -1;
      const key = a.split(' ').slice(0, 5).join(' ');
      if (!key) return -1;
      return paras.findIndex((para) => anchorOf(para).startsWith(key));
    };

    /* Above the paragraph it introduces; failing that, below the one it
       follows. Both come from the original's own ordering. */
    let idx = find(p.follows);
    let how = 'above';
    if (idx === -1) {
      const after = find(p.precedes);
      if (after !== -1) {
        idx = after + 1;
        how = 'below';
      }
    }

    if (idx === -1) {
      notes.push(
        `  SKIP  ${saved} — no anchor matched (after: "${anchorOf(p.follows).slice(0, 34)}", before: "${anchorOf(p.precedes).slice(0, 34)}")`
      );
      unplaced++;
      continue;
    }

    paras.splice(idx, 0, ref);
    body = paras.join('\n\n');
    const anchorText = how === 'above' ? p.follows : p.precedes;
    notes.push(`  place ${saved.padEnd(38)} ${how} "${anchorOf(anchorText).slice(0, 40)}…"`);
    placed++;
  }

  if (notes.length) {
    console.log(`\n${page.route}  (${file})`);
    for (const n of notes) console.log(n);
  }

  if (body !== before) {
    changed++;
    if (WRITE) fs.writeFileSync(path.resolve(file), body);
  }
}

console.log(
  `\n${placed} reference(s) placed, ${unplaced} skipped, ${changed} file(s) ${WRITE ? 'written' : 'would change'}`
);
if (!WRITE) console.log('dry run — pass --write to apply\n');

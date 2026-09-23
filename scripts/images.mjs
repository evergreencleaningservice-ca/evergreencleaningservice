/**
 * Repoints every image reference in `dist` at the Backblaze bucket's hostname,
 * then removes the images from the build output.
 *
 * The site's source keeps writing root-relative paths — `/images/a.jpg` in a
 * component, in markdown, in a redirect target — because that is what makes
 * `astro dev` work off the local files and what keeps the content free of a
 * hostname. The origin is swapped here, once, after the build, so there is
 * exactly one place that knows where images are served from.
 *
 * Deleting `dist/images` afterwards is the point of the exercise: leaving them
 * would ship every photo twice and, worse, would let a reference this script
 * missed keep working from the Worker — so the mistake would never surface.
 * That is why the swap is verified before the delete, and why a leftover
 * reference fails the build instead of being tidied away.
 */
import fs from 'node:fs';
import path from 'node:path';
import { images } from '../src/data/site.ts';

const dist = path.resolve('dist');
const IMG = images.host;

/* Text formats only. A rewrite pass over a JPEG would corrupt it. */
const REWRITABLE = new Set(['.html', '.css', '.xml', '.txt', '.json', '.js', '.svg']);
const REWRITABLE_NAMES = new Set(['_redirects', '_headers']);

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== path.join(dist, 'images')) walk(full);
    } else if (REWRITABLE.has(path.extname(entry.name)) || REWRITABLE_NAMES.has(entry.name)) {
      files.push(full);
    }
  }
};
walk(dist);

/* Absolute references first — og:image, JSON-LD and the sitemap carry the
   canonical origin, and rewriting the path half of those before the origin half
   would leave `https://www.evergreencleaningservice.cahttps://img-…`. */
const absolute = images.rewriteOrigins.map((origin) => new RegExp(`${origin}/images/`, 'g'));

/* Then what is left: a root-relative path, but only where one really starts —
   after a quote, a paren, a comma, an equals or a space (srcset). Not after a
   newline, which in `_redirects` would be the start of a rule's *source*
   column, and rewriting a source would delete the redirect rather than aim it. */
const relative = /(["'(,= ])\/images\//g;

let rewritten = 0;
let touched = 0;

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  for (const re of absolute) {
    after = after.replace(re, () => {
      rewritten++;
      return `${IMG}/images/`;
    });
  }
  after = after.replace(relative, (_, lead) => {
    rewritten++;
    return `${lead}${IMG}/images/`;
  });

  if (after !== before) {
    fs.writeFileSync(file, after);
    touched++;
  }
}

/* --- the gate --------------------------------------------------------------- */

const leftovers = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  /* Anything still addressing /images/ on this site's own origin. The bucket
     host is allowed; it contains "/images/" and is the whole point. */
  for (const match of text.matchAll(/["'(,= ](\/images\/[^"'),\s]*)/g)) {
    leftovers.push(`${path.relative(dist, file)} → ${match[1]}`);
  }
}

if (leftovers.length) {
  console.error(`images: ${leftovers.length} reference(s) were not rewritten:`);
  for (const line of leftovers.slice(0, 20)) console.error(`  ${line}`);
  console.error('images: dist/images left in place — fix the rewrite before deploying.');
  process.exit(1);
}

const source = path.join(dist, 'images');
let removed = 0;
if (fs.existsSync(source)) {
  const count = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).reduce(
      (n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1),
      0
    );
  removed = count(source);
  fs.rmSync(source, { recursive: true });
}

console.log(
  `images: ${rewritten} reference(s) repointed at ${new URL(IMG).host} across ${touched} file(s); ${removed} file(s) dropped from dist.`
);

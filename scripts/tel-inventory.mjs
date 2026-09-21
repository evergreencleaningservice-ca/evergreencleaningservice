/**
 * Every `tel:` link on every built page, classified by where it sits.
 *
 * Phase 11 needs this twice: once to establish what exists, and once to prove
 * that every link the site renders carries an explicit, controlled location
 * and a normalised destination.
 *
 * It reads the built HTML rather than the source, because what matters is what
 * the browser receives — a component used on four layouts produces four
 * classifications, and a link written into Markdown body copy years ago has no
 * component at all.
 *
 *   node scripts/tel-inventory.mjs <distDir> [--json <file>]
 *
 * Exits non-zero if any link has an unnormalised destination or falls back to
 * the catch-all location, so it works as a gate as well as a report.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
const jsonAt = process.argv.includes('--json')
  ? process.argv[process.argv.indexOf('--json') + 1]
  : null;

/** The one destination this site is allowed to dial. */
const CANONICAL_HREF = 'tel:+14168034880';

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return full.endsWith('.html') ? [full] : [];
  });

/**
 * Find each `<a … href="tel:…">…</a>`, with enough of what precedes it to
 * tell where on the page it sits.
 *
 * A regex rather than a parser because the question is narrow and the input is
 * this project's own build output, not the open web. Anchors do not nest, so
 * the closing tag is unambiguous.
 */
function telLinks(html) {
  const out = [];
  const re = /<a\b([^>]*\bhref="tel:[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const inner = m[2];
    out.push({
      href: attrs.match(/\bhref="([^"]*)"/)?.[1] ?? '',
      /** What the visitor reads, markup stripped. */
      text: inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
      /** Explicit metadata, once the components carry it. */
      location: attrs.match(/\bdata-call-location="([^"]*)"/)?.[1] ?? null,
      /* `data-call` the bare marker, NOT `data-call-location` — `\b` alone
         matches inside the longer name and reported every link as carrying
         both. The bare attribute is a legacy marker from earlier phases and
         is only counted here to show it is not what the tracking depends on. */
      hasDataCall: /\bdata-call(?![-\w])/.test(attrs),
      className: attrs.match(/\bclass="([^"]*)"/)?.[1] ?? '',
      /** Everything before this link, for the ancestry guess below. */
      before: html.slice(0, m.index),
      nested: /<[a-z]/i.test(inner),
    });
  }
  return out;
}

/**
 * Where a link sits, WITHOUT explicit metadata.
 *
 * Only for the baseline: it guesses from the class name and from whether the
 * link falls inside the header or footer, which is exactly the kind of
 * inference Phase 11 exists to replace. Anything it cannot place is
 * `content`, and the count of those is the number worth reporting.
 */
function inferLocation(link) {
  const cls = link.className;
  const openHeader = (link.before.match(/<header\b/gi) ?? []).length;
  const closeHeader = (link.before.match(/<\/header>/gi) ?? []).length;
  const openFooter = (link.before.match(/<footer\b/gi) ?? []).length;
  const closeFooter = (link.before.match(/<\/footer>/gi) ?? []).length;

  if (/lpx-sticky-call/.test(cls)) return 'paid_sticky';
  if (/lp-call\b/.test(cls)) return 'paid_header';
  if (/lpx-btn/.test(cls)) return 'content';
  if (/qa-call-link/.test(cls)) return 'quote_sidebar';
  if (openHeader > closeHeader) return 'header';
  if (openFooter > closeFooter) return 'footer';
  return 'content';
}

const pages = walk(dist);
const rows = [];

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '');
  for (const link of telLinks(html)) {
    rows.push({
      page: rel,
      href: link.href,
      displayed: link.text,
      location: link.location,
      inferred: inferLocation(link),
      hasDataCall: link.hasDataCall,
      nestedMarkup: link.nested,
      className: link.className,
    });
  }
}

/* --- report --------------------------------------------------------------- */

const byLocation = {};
for (const r of rows) {
  const key = r.location ?? `(inferred) ${r.inferred}`;
  byLocation[key] ??= { count: 0, pages: new Set(), displayed: new Set() };
  byLocation[key].count++;
  byLocation[key].pages.add(r.page);
  byLocation[key].displayed.add(r.displayed);
}

console.log(`pages scanned .............. ${pages.length}`);
console.log(`tel: links found ........... ${rows.length}`);
console.log(`pages carrying at least one  ${new Set(rows.map((r) => r.page)).size}`);
console.log(`distinct destinations ...... ${[...new Set(rows.map((r) => r.href))].join(', ')}`);
console.log(`carrying data-call ......... ${rows.filter((r) => r.hasDataCall).length}`);
console.log(`with nested markup inside .. ${rows.filter((r) => r.nestedMarkup).length}`);
console.log(`with explicit location ..... ${rows.filter((r) => r.location).length} of ${rows.length}`);
console.log('\nby location:');
for (const [loc, d] of Object.entries(byLocation).sort((a, b) => b[1].count - a[1].count)) {
  console.log(
    `  ${loc.padEnd(26)} ${String(d.count).padStart(4)} link(s) on ${String(d.pages.size).padStart(3)} page(s)`
  );
  for (const t of d.displayed) console.log(`      displayed: "${t}"`);
}

/* --- gate ----------------------------------------------------------------- */

const wrongHref = rows.filter((r) => r.href !== CANONICAL_HREF);
const unlabelled = rows.filter((r) => !r.location);

console.log('');
if (wrongHref.length) {
  console.log(`*** ${wrongHref.length} link(s) with a non-canonical destination:`);
  for (const r of wrongHref) console.log(`      ${r.page} → ${r.href}`);
}
if (unlabelled.length) {
  console.log(`*** ${unlabelled.length} link(s) with no data-call-location (inferred above)`);
}

if (jsonAt) {
  fs.writeFileSync(jsonAt, JSON.stringify(rows, null, 2));
  console.log(`\nwritten to ${jsonAt}`);
}

process.exit(wrongHref.length || unlabelled.length ? 1 : 0);

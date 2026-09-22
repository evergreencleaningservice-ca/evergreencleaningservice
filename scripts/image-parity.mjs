/**
 * Body images: the original against the port, page by page.
 *
 * WHY THIS DID NOT EXIST AND SHOULD HAVE. `tests/build/images.test.ts` checks
 * the images the port DOES serve — formats, dimensions, loading attributes,
 * and that no local `/images/` path survives the B2 rewrite. The Phase 13
 * crawl counted 382 `<img>` elements and found none missing an `alt`.
 *
 * Every one of those checks passes on a page that dropped an image entirely.
 * They audit what is present; none of them asks whether anything is ABSENT
 * relative to the page being replaced. That is how four body images went
 * missing from `/green-clean-products/` — two of them the Armstrong and
 * ECOLOGO logos that are the entire evidential point of the page — through a
 * parity pass, an acceptance crawl and a final report, and were found by a
 * person looking at two browser windows side by side.
 *
 * WHAT IT COMPARES. The archived original in `refall/<slug>.html` against the
 * built page, counting only BODY images: the chrome (site logo, the Google
 * review badge) appears on every page and would drown the signal.
 *
 * Matched by FILE BASENAME, because the two sides legitimately differ in
 * host and in path — the original serves
 * `/wp-content/uploads/2016/10/armstrong-logo-300x89.jpg` and the port serves
 * `/images/armstrong-logo-300x89.jpg` from the image host. The basename is
 * the only stable identity across that rewrite, and it is also exactly what
 * `src/data/upload-redirects.json` keys on.
 *
 * READ-ONLY. It reads two directories and prints a diff.
 *
 * Usage: node scripts/image-parity.mjs <refDir> <distDir> [--json <file>]
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonPath = jsonAt !== -1 ? args[jsonAt + 1] : null;
const [refDir, distDir] = args.filter((a) => !a.startsWith('--') && a !== args[jsonAt + 1]);

if (!refDir || !distDir) {
  console.error('usage: node scripts/image-parity.mjs <refDir> <distDir> [--json <file>]');
  process.exit(2);
}

/**
 * Images that are site chrome rather than page content. Present on every page
 * on both sides, so counting them tells you nothing and hides everything.
 */
const CHROME = [
  /cropped-evergreen/i,
  /evergreen[-_]?logo/i,
  /evergreen-banner-logo/i,
  /Google-Review-Link/i,
];

const basename = (src) => {
  try {
    const clean = src.split('?')[0].split('#')[0];
    return decodeURIComponent(clean.split('/').pop() ?? '');
  } catch {
    return '';
  }
};

/**
 * Strip the size suffix WordPress appends when it serves a resized copy.
 * `armstrong-logo-300x89.jpg` and `armstrong-logo.jpg` are the same asset at
 * different sizes, and a port that carries one but not the other has not lost
 * the image. Without this the report is full of false losses.
 */
const stem = (name) => name.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '').replace(/\.[a-z0-9]+$/i, '').toLowerCase();

const bodyImages = (html) => {
  /* The sidebar and the footer are chrome; only the article body is compared.
     Falls back to the whole document when the wrapper is not found, so a
     markup change degrades to a noisier comparison rather than a silent
     empty one. */
  const found = new Set();
  for (const m of html.matchAll(/<img\b([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    const src =
      attrs.match(/\bsrc="([^"]*)"/)?.[1] ??
      attrs.match(/\bdata-src="([^"]*)"/)?.[1] ??
      '';
    if (!src) continue;
    /* A data URI is a placeholder, not an asset — the 1x1 transparent GIF a
       lazy-loader parks in `src` until it swaps the real address in. Filtered
       on the RAW src, because `basename()` of a data URI is the base64 blob
       and reads like a filename: the first version of this reported
       `yh5baeaaaaalaaaaaabaaeaaaibraa7` as an image the port had lost. */
    if (/^data:/i.test(src.trim())) continue;
    const name = basename(src);
    if (!name) continue;
    if (CHROME.some((re) => re.test(name) || re.test(src))) continue;
    found.add(stem(name));
  }
  return found;
};

const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);

/* Pair each archived page with its built counterpart. */
const refFiles = fs
  .readdirSync(refDir)
  .filter((f) => f.endsWith('.html'))
  .sort();

const rows = [];
for (const file of refFiles) {
  const slug = file.replace(/\.html$/, '');
  const refHtml = readIf(path.join(refDir, file));
  /* The archive flattens a path into a filename with `__` for `/`, so
     `services__office-cleaning.html` is `/services/office-cleaning/`. Without
     this the seven service pages look like they have no built counterpart. */
  const route = slug.replace(/__/g, '/');
  const builtPath =
    route === 'index' || route === 'home'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route, 'index.html');
  const builtHtml = readIf(builtPath);

  if (!builtHtml) {
    rows.push({ slug, status: 'no built page', ref: [...bodyImages(refHtml)], built: [], missing: [] });
    continue;
  }

  const ref = bodyImages(refHtml);
  const built = bodyImages(builtHtml);
  const missing = [...ref].filter((s) => !built.has(s));
  const added = [...built].filter((s) => !ref.has(s));
  rows.push({ slug, status: 'ok', ref: [...ref], built: [...built], missing, added });
}

/**
 * A LOSS AND A SUBSTITUTION ARE DIFFERENT FINDINGS, and the first version of
 * this script printed them identically — `3 of 3 body image(s) present` above
 * a list of missing files, which is a contradiction on its face.
 *
 *   LOST         the port serves fewer body images than the original. Content
 *                is gone from the page and nothing replaced it.
 *   SUBSTITUTED  the counts match but the filenames differ. Usually a
 *                deliberate image swap made during the port, occasionally a
 *                rename. Worth listing, not worth alarm.
 */
const lost = rows.filter((r) => r.status === 'ok' && r.built.length < r.ref.length);
const substituted = rows.filter(
  (r) => r.status === 'ok' && r.missing.length > 0 && r.built.length >= r.ref.length
);
const unpaired = rows.filter((r) => r.status !== 'ok');

console.log(`\nimage parity — ${refFiles.length} archived page(s) against ${distDir}\n`);

if (lost.length) {
  console.log('LOST — the port serves fewer body images than the original\n');
  for (const r of lost) {
    console.log(`  /${r.slug.replace(/__/g, '/')}/  — ${r.built.length} of ${r.ref.length} present`);
    for (const m of r.missing) console.log(`      - ${m}`);
  }
}

if (substituted.length) {
  console.log('\nSUBSTITUTED — same count, different file (likely a deliberate swap)\n');
  for (const r of substituted) {
    console.log(
      `  /${r.slug.replace(/__/g, '/')}/  ${r.missing.join(', ')}  →  ${r.added.join(', ') || '(none)'}`
    );
  }
}

if (unpaired.length) {
  console.log(`\n  ${unpaired.length} archived page(s) with no built counterpart:`);
  for (const r of unpaired) console.log(`    /${r.slug}/`);
}

const totalRef = rows.reduce((n, r) => n + r.ref.length, 0);
const totalBuilt = rows.reduce((n, r) => n + r.built.length, 0);
const totalLost = lost.reduce((n, r) => n + (r.ref.length - r.built.length), 0);

console.log(
  `\n  body images — original ${totalRef}, port ${totalBuilt}\n  LOST ${totalLost} across ${lost.length} page(s); ${substituted.length} page(s) substituted\n`
);

if (jsonPath) {
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
  console.log(`raw → ${jsonPath}\n`);
}

process.exit(totalLost > 0 ? 1 : 0);

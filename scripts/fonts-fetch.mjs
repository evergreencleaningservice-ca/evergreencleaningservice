/**
 * Re-downloads the self-hosted webfonts and regenerates `src/styles/fonts.css`.
 *
 *   npm run fonts:fetch
 *
 * Run this to add a weight, add a style, or pick up an upstream revision of
 * either family. It is not part of the build — the files are committed, and a
 * build that silently re-fetched fonts from a third party would be a build
 * that could change what the site looks like without anyone editing anything.
 *
 * TWO THINGS IT GETS RIGHT THAT ARE EASY TO GET WRONG BY HAND:
 *
 *   1. Google's CSS lists a separate @font-face per weight, and copying that
 *      shape gives you ten files. They are not ten files. Each family+style
 *      is ONE variable font spanning the whole weight axis and the per-weight
 *      URLs return identical bytes — 475KB of downloads that are 143KB of
 *      distinct fonts. This hashes them and keeps one per family+style,
 *      declared with a `font-weight: <lo> <hi>` range.
 *   2. It takes the LATIN subset only. Google splits each face ten ways —
 *      cyrillic, greek, hebrew, vietnamese, math, symbols — and an
 *      English-language Toronto cleaning company needs none of them. Google's
 *      own `unicode-range` is carried through, so a browser that does need
 *      another script falls back to the system stack rather than rendering
 *      tofu.
 *
 * The browser user-agent matters: ask as an old browser and Google serves
 * woff/ttf instead of woff2.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Edit this to change which faces the site carries. */
const REQUEST =
  'https://fonts.googleapis.com/css2' +
  '?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400;1,700' +
  '&family=Raleway:wght@400;500;600;700;800' +
  '&display=swap';

/** Anything else and Google serves a format we do not want. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const KEEP_SUBSETS = new Set(['latin']);
const fontsDir = path.resolve('public/fonts');
const cssPath = path.resolve('src/styles/fonts.css');

const css = await (await fetch(REQUEST, { headers: { 'user-agent': UA } })).text();

const faces = [];
for (const [, subset, body] of css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face \{(.*?)\}/gs)) {
  if (!KEEP_SUBSETS.has(subset)) continue;
  const pick = (re) => body.match(re)?.[1];
  faces.push({
    family: pick(/font-family:\s*'([^']+)'/),
    style: pick(/font-style:\s*(\w+)/),
    weight: Number(pick(/font-weight:\s*(\d+)/)),
    url: pick(/url\((https:\/\/[^)]+\.woff2)\)/),
    range: pick(/unicode-range:\s*([^;]+);/)?.trim(),
  });
}
if (!faces.length) {
  console.error('fonts-fetch: no latin @font-face blocks found — did the request change?');
  process.exit(1);
}

/* Download once per URL, then group by content hash. */
fs.mkdirSync(fontsDir, { recursive: true });
const byHash = new Map();
for (const face of faces) {
  const bytes = Buffer.from(await (await fetch(face.url)).arrayBuffer());
  const hash = crypto.createHash('md5').update(bytes).digest('hex');
  if (!byHash.has(hash)) byHash.set(hash, { bytes, faces: [] });
  byHash.get(hash).faces.push(face);
}

const kept = [];
for (const { bytes, faces: group } of byHash.values()) {
  const sorted = [...group].sort((a, b) => a.weight - b.weight);
  const first = sorted[0];
  const file = `${first.family.toLowerCase().replace(/ /g, '-')}${
    first.style === 'italic' ? '-italic' : ''
  }.woff2`;
  fs.writeFileSync(path.join(fontsDir, file), bytes);
  kept.push({
    family: first.family,
    style: first.style,
    lo: first.weight,
    hi: sorted.at(-1).weight,
    range: first.range,
    file,
    size: bytes.length,
  });
}
kept.sort((a, b) => a.family.localeCompare(b.family) || a.style.localeCompare(b.style));

/* Anything left from a previous run with a different set of faces. */
const wanted = new Set(kept.map((k) => k.file));
for (const stale of fs.readdirSync(fontsDir).filter((f) => f.endsWith('.woff2') && !wanted.has(f))) {
  fs.rmSync(path.join(fontsDir, stale));
  console.log(`  removed stale ${stale}`);
}

const header = fs.existsSync(cssPath)
  ? fs.readFileSync(cssPath, 'utf8').match(/^\/\*\*[\s\S]*?\*\/\n/)?.[0]
  : null;

fs.writeFileSync(
  cssPath,
  (header ?? '') +
    '\n' +
    kept
      .map(
        (k) => `@font-face {
  font-family: '${k.family}';
  font-style: ${k.style};
  font-weight: ${k.lo} ${k.hi};
  font-display: swap;
  src: url('/fonts/${k.file}') format('woff2');
  unicode-range: ${k.range};
}
`
      )
      .join('\n')
);

const total = kept.reduce((n, k) => n + k.size, 0);
for (const k of kept) {
  console.log(
    `  ${k.file.padEnd(26)} ${k.family} ${k.lo}-${k.hi} ${k.style.padEnd(7)} ${(k.size / 1024).toFixed(1)}KB`
  );
}
console.log(
  `\nfonts-fetch: ${faces.length} latin face declarations -> ${kept.length} distinct file(s), ` +
    `${(total / 1024).toFixed(1)}KB. src/styles/fonts.css rewritten.`
);

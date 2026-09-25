/**
 * AD-9: every content image in the built output is served from the canonical
 * image host in image-hosts.json. Fails the build on
 *   - a root-relative /images/ reference (would be served from the Worker),
 *   - an image URL on any other host (legacy content hosts are NOT allowlisted),
 *   - any reference to a forbidden host,
 *   - a leftover dist/images directory or local raster/vector photo in dist.
 * Hosts listed in `exceptions` (third-party badges/avatars) are reported
 * separately, never silently accepted.
 */
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync(new URL('../image-hosts.json', import.meta.url), 'utf8'));
const dist = path.resolve('dist');
if (!fs.existsSync(dist)) {
  console.error('check-images: dist/ not found; run after astro build.');
  process.exit(1);
}

const TEXT = new Set(['.html', '.css', '.xml', '.txt', '.json', '.js', '.svg', '.webmanifest']);
const IMG_EXT = '(?:avif|webp|jpe?g|png|gif)';
const STOP = ' "\'()<>,\n\t\\';
const absRe = new RegExp(
  'https?://([a-z0-9.-]+)(?::[0-9]+)?/[^' + STOP.replace(/[\\\]]/g, '\\$&') + ']*?[.]' + IMG_EXT + '(?=[?#' + STOP.replace(/[\\\]]/g, '\\$&') + ']|$)',
  'gi'
);
const relRe = /(["'(,= ])(\/images\/[^"'),\s]*)/g;

const errors = [];
const excepted = new Map();
const hostCounts = new Map();
let scanned = 0;
let localBinaries = 0;

const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(dist, full).split(path.sep).join('/');
    if (e.isDirectory()) {
      if (rel === 'images') errors.push('dist/images still present');
      walk(full);
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    if (new RegExp('^[.]' + IMG_EXT + '$').test(ext) && !/^(favicon|apple-touch|android-chrome|icon)/i.test(e.name)) {
      localBinaries++;
      errors.push(`local image file in dist: ${rel}`);
    }
    if (!TEXT.has(ext)) continue;
    scanned++;
    const text = fs.readFileSync(full, 'utf8');
    for (const m of text.matchAll(absRe)) {
      const host = m[1].toLowerCase();
      hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
      if (host === cfg.canonicalHost) continue;
      if (cfg.exceptions.some((x) => host === x.host || host.endsWith(`.${x.host}`))) {
        excepted.set(host, (excepted.get(host) ?? 0) + 1);
        continue;
      }
      errors.push(`${rel}: off-host image ${m[0].slice(0, 140)}`);
    }
    for (const m of text.matchAll(relRe)) errors.push(`${rel}: local image path ${m[2]}`);
    for (const bad of cfg.forbiddenHosts) {
      if (text.includes(bad)) errors.push(`${rel}: forbidden host ${bad}`);
    }
  }
};
walk(dist);

console.log(`check-images (AD-9): canonical host ${cfg.canonicalHost}`);
console.log(`check-images: scanned ${scanned} text file(s); image URLs by host:`);
for (const [h, n] of [...hostCounts].sort()) console.log(`  ${h}: ${n}`);
console.log(`check-images: local image files in dist: ${localBinaries}`);
if (excepted.size) {
  console.log('check-images: EXCEPTIONS (third-party, reported separately):');
  for (const [h, n] of excepted) console.log(`  ${h}: ${n}`);
} else console.log('check-images: exceptions: none');
if (errors.length) {
  console.error(`check-images: FAIL — ${errors.length} violation(s)`);
  for (const l of [...new Set(errors)].slice(0, 40)) console.error(`  ${l}`);
  process.exit(1);
}
console.log('check-images: PASS');

/**
 * Turn the Phase 13 captures into durable, committable evidence.
 *
 * WHY. `.measure/` is gitignored and this container is ephemeral, so the 16
 * acceptance screenshots were evidence that existed only until the machine
 * went away. A handoff report that points at a directory nobody else can open
 * is not evidence.
 *
 * WHY NOT JUST COMMIT THE PNGs. 3.3 MB of raw captures for one report, in a
 * source tree, forever — and every future run adds another set. The captures
 * are proof of layout, not assets the site uses, so they are re-encoded to
 * WebP at a size where the text is still readable and the whole set costs a
 * fraction of the original.
 *
 * THE READABILITY CONSTRAINT IS THE POINT. Compressed far enough, a
 * screenshot stops being evidence and becomes decoration — you cannot check
 * that the bullet renders as `•` rather than `&bull;` in a thumbnail. So the
 * mobile column keeps its full 390px width (phone captures are already narrow)
 * and the desktop column is halved to 720px, which keeps body text legible at
 * 100% zoom. The script prints the resulting bytes so the trade is visible
 * rather than assumed.
 *
 * Usage: node scripts/evidence-sheet.mjs [srcDir] [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = path.resolve(process.argv[2] ?? '.measure/phase13-visual');
const out = path.resolve(process.argv[3] ?? 'docs/evidence/phase-13');
fs.mkdirSync(out, { recursive: true });

/** The eight categories the acceptance report has to cover, in reading order. */
const PAGES = [
  ['homepage', 'Homepage', '/'],
  ['quote', 'Request a quote', '/request-a-quote/'],
  ['lp-commercial-cleaning', 'Paid — commercial cleaning', '/lp/commercial-cleaning/'],
  ['lp-commercial-cleaning-quote', 'Paid — quote', '/lp/commercial-cleaning-quote/'],
  ['service', 'Service page', '/services/office-cleaning/'],
  ['location', 'Location page', '/locations/mississauga/'],
  ['blog-archive', 'Blog archive', '/insights/'],
  ['thank-you', 'Thank you', '/thank-you/'],
];

/* Mobile stays at native width; desktop is halved. Both keep text readable. */
const COLUMNS = [
  { width: 390, target: 390, label: '390px — mobile' },
  { width: 1440, target: 720, label: '1440px — desktop' },
];

const GUTTER = 16;
const LABEL_H = 34;
const HEADER_H = 64;
const BG = { r: 244, g: 245, b: 246, alpha: 1 };

/** Rendered as SVG because sharp has no text primitive of its own. */
const textPanel = (width, height, lines) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <rect width="100%" height="100%" fill="rgb(244,245,246)"/>
       ${lines
         .map(
           (l, i) =>
             `<text x="0" y="${l.y}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
                    font-size="${l.size}" font-weight="${l.weight ?? 400}"
                    fill="${l.fill ?? '#1b1b1b'}">${l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`
         )
         .join('\n')}
     </svg>`
  );

const built = [];

for (const [slug, title, route] of PAGES) {
  const tiles = [];
  for (const col of COLUMNS) {
    const file = path.join(src, `${slug}-${col.width}.png`);
    if (!fs.existsSync(file)) {
      console.error(`missing capture: ${path.relative(process.cwd(), file)}`);
      process.exit(2);
    }
    const resized = await sharp(file)
      .resize({ width: col.target, withoutEnlargement: true })
      .toBuffer();
    const meta = await sharp(resized).metadata();
    tiles.push({ buf: resized, w: meta.width, h: meta.height, label: col.label });
  }

  const contentH = Math.max(...tiles.map((t) => t.h));
  const totalW = tiles.reduce((n, t) => n + t.w, 0) + GUTTER * (tiles.length + 1);
  const totalH = HEADER_H + LABEL_H + contentH + GUTTER;

  const composites = [
    {
      input: textPanel(totalW, HEADER_H, [
        { text: title, y: 26, size: 19, weight: 700 },
        { text: `${route}  ·  staging bc76be72  ·  2026-09-21`, y: 48, size: 13, fill: '#555' },
      ]),
      top: 0,
      left: 0,
    },
  ];

  let x = GUTTER;
  for (const t of tiles) {
    composites.push({
      input: textPanel(t.w, LABEL_H, [{ text: t.label, y: 22, size: 13, weight: 600, fill: '#444' }]),
      top: HEADER_H,
      left: x,
    });
    composites.push({ input: t.buf, top: HEADER_H + LABEL_H, left: x });
    x += t.w + GUTTER;
  }

  const dest = path.join(out, `${slug}.webp`);
  await sharp({ create: { width: totalW, height: totalH, channels: 4, background: BG } })
    .composite(composites)
    /* Quality 80 keeps small body text crisp; below about 70 the 13px label
       text on the forms starts to smear, which defeats the purpose. */
    .webp({ quality: 80 })
    .toFile(dest);

  const bytes = fs.statSync(dest).size;
  built.push({ slug, title, route, file: path.basename(dest), bytes, width: totalW, height: totalH });
  console.log(
    `  ${path.relative(process.cwd(), dest).padEnd(44)} ${String(totalW).padStart(5)}×${String(totalH).padEnd(5)} ${(bytes / 1024).toFixed(0)} KB`
  );
}

const total = built.reduce((n, b) => n + b.bytes, 0);
fs.writeFileSync(
  path.join(out, 'index.json'),
  JSON.stringify(
    {
      phase: 13,
      capturedAt: '2026-09-21',
      origin: 'https://evergreencleaningservice.10xconnections.com',
      stagingVersion: 'bc76be72-8e51-4eb3-ad21-be433bbbcb23',
      widths: COLUMNS.map((c) => ({ captured: c.width, stored: c.target })),
      totalBytes: total,
      sheets: built,
    },
    null,
    2
  )
);

console.log(`\n${built.length} sheets, ${(total / 1024).toFixed(0)} KB total → ${path.relative(process.cwd(), out)}`);

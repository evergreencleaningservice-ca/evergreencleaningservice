/** Generate website renditions from the three privately retained stock JPEGs. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const sources = process.argv[2];
if (!sources) throw new Error('Pass the private directory containing <stock-id>.jpg originals.');
const out = path.resolve('public/images');
const items = [
  { id: 10810007, base: 'blog-office-cleaning-cost-toronto-guide', ratio: 16 / 9 },
  { id: 24747597, base: 'office-cleaning-cost-kitchen', ratio: 3 / 2 },
  { id: 12615858, base: 'office-cleaning-cost-boardroom', ratio: 3 / 2 },
];
const records = [];
for (const item of items) {
  const input = await fs.readFile(path.join(sources, `${item.id}.jpg`));
  const metadata = await sharp(input).metadata();
  const outputs = [];
  const render = async (suffix, width, height, format) => {
    const filename = `${item.base}${suffix}.${format}`;
    await sharp(input).rotate().resize(width, height, { fit: 'cover', position: 'centre' })
      .toFormat(format, { quality: format === 'avif' ? 50 : format === 'webp' ? 78 : 82 })
      .toFile(path.join(out, filename));
    outputs.push({ filename, width, height, bytes: (await fs.stat(path.join(out, filename))).size });
  };
  for (const width of [480, 768, 1200]) {
    for (const format of ['avif', 'webp', 'jpg']) {
      await render(`-${width}`, width, Math.round(width / item.ratio), format);
    }
  }
  await render('', 1200, Math.round(1200 / item.ratio), 'jpg');
  await render('-300x150', 300, 150, 'jpg');
  await render('-og', 1200, 630, 'jpg');
  records.push({ stockId: item.id, sourceDimensions: [metadata.width, metadata.height],
    sourceSha256: crypto.createHash('sha256').update(input).digest('hex'), outputs });
}
await fs.writeFile('docs/stock-photos/office-cost-renditions.json', JSON.stringify(records, null, 2) + '\n');
console.log(`Prepared ${records.reduce((n, item) => n + item.outputs.length, 0)} website renditions.`);

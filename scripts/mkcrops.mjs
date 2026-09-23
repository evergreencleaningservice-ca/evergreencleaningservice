// WordPress generates a hard 300x150 crop of every featured image and the post
// lists render that crop, not the full-size upload. Ten of them were never
// captured by the archive but their source upload was, so the crop is
// regenerated here the way WordPress makes it: cover, centred.
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIR = '/home/user/evergreencleaningservice/public/images';
const SOURCES = [
  'Coronavirus-at-work.jpg', 'Spacious.jpg', 'business-owner.jpg',
  'cleaning-supplies.jpg', 'cleaning-team.jpg', 'lobby.jpg',
  'office-cleaning-crew-Dell-Notebook.jpg', 'office-cleaning-services-Toronto.jpg',
  'office-interior.jpg', 'virus-molecule-1.jpg',
];

for (const src of SOURCES) {
  const from = path.join(DIR, src);
  const out = path.join(DIR, src.replace(/\.jpg$/, '-300x150.jpg'));
  if (!existsSync(from)) { console.log('missing source', src); continue; }
  if (existsSync(out)) { console.log('have', path.basename(out)); continue; }
  const meta = await sharp(from).metadata();
  await sharp(from)
    .resize(300, 150, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: false })
    .toFile(out);
  console.log('made', path.basename(out), `from ${meta.width}x${meta.height}`);
}

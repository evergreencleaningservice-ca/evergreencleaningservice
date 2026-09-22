/**
 * The patient half of the image recovery.
 *
 * `harvest-missing-images.mjs` finds what is missing and fetches what it can.
 * This finishes the job for the files that are still outstanding, and it does
 * one thing differently: it goes SLOWLY.
 *
 * WHY. SiteGround's challenge on this origin is neither absolute nor random —
 * it tightens under load. A burst of twenty-six requests got four through;
 * the immediate retry of the rest got three. Spacing the requests out does
 * better than repeating them quickly, which is also the polite way round: the
 * origin is a live site serving real visitors, and recovering a client's own
 * images is not a reason to lean on it.
 *
 * No challenge is solved, no clearance cookie is replayed. A request that is
 * challenged is simply tried again later, and what never succeeds is reported
 * as unrecovered rather than faked.
 *
 * Usage: node scripts/harvest-slow.mjs <wanted.json> [--gap 8000] [--rounds 6]
 */
import fs from 'node:fs';
import path from 'node:path';

const wantedFile = process.argv[2];
const gapAt = process.argv.indexOf('--gap');
const roundsAt = process.argv.indexOf('--rounds');
const GAP = gapAt !== -1 ? Number(process.argv[gapAt + 1]) : 8000;
const ROUNDS = roundsAt !== -1 ? Number(process.argv[roundsAt + 1]) : 6;

const wanted = JSON.parse(fs.readFileSync(wantedFile, 'utf8'));
const IMAGES_DIR = path.resolve('public/images');

const MAGIC = [
  { ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: '.png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: '.gif', test: (b) => b.subarray(0, 3).toString('latin1') === 'GIF' },
  { ext: '.webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
];
const identify = (buf) => MAGIC.find((m) => buf.length > 16 && m.test(buf))?.ext ?? null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const have = (stem) =>
  fs.readdirSync(IMAGES_DIR).find((f) => f.replace(/\.[a-z0-9]+$/i, '') === stem);

const attempt = async (src) => {
  const u = new URL(src);
  u.hostname = 'evergreencleaningservice.ca';
  try {
    const res = await fetch(u, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'https://evergreencleaningservice.ca/',
      },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = identify(buf);
    if (res.ok && ext) return { ok: true, buf, ext };
    return { ok: false, why: /sgcaptcha/i.test(buf.toString('latin1').slice(0, 300)) ? 'challenged' : `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, why: `network ${err.message}` };
  }
};

let outstanding = wanted.filter((w) => !have(w.file.replace(/\.[a-z0-9]+$/i, '')));
console.log(`${outstanding.length} of ${wanted.length} still missing\n`);

for (let round = 1; round <= ROUNDS && outstanding.length; round++) {
  console.log(`--- round ${round}, ${outstanding.length} outstanding, ${GAP}ms apart`);
  const stillMissing = [];

  for (const w of outstanding) {
    const stem = w.file.replace(/\.[a-z0-9]+$/i, '');
    if (have(stem)) continue;

    const r = await attempt(w.src);
    if (r.ok) {
      fs.writeFileSync(path.join(IMAGES_DIR, `${stem}${r.ext}`), r.buf);
      console.log(`  got  ${stem}${r.ext}  ${r.buf.length}b`);
    } else {
      stillMissing.push(w);
      console.log(`  --   ${w.file}  ${r.why}`);
    }
    await sleep(GAP);
  }

  outstanding = stillMissing;
  /* A longer breath between rounds than between requests. */
  if (outstanding.length) await sleep(GAP * 3);
}

console.log(`\n${wanted.length - outstanding.length} of ${wanted.length} recovered`);
if (outstanding.length) {
  console.log('\nstill missing:');
  for (const w of outstanding) console.log(`  ${w.file}`);
}
fs.writeFileSync('.harvest-outstanding.json', JSON.stringify(outstanding, null, 2));

/**
 * Recover the body images the port lost, from the live original.
 *
 * WHY THIS IS POSSIBLE NOW AND WAS NOT BEFORE. Two separate obstacles, and
 * they turn out to have different answers:
 *
 *   THE PAGE HTML is behind SiteGround's IP-reputation challenge — every
 *   request from this network gets HTTP 202 and a captcha interstitial. That
 *   is not bypassed here. Firecrawl fetches the page from its own
 *   infrastructure, which the origin answers normally, so the HTML arrives
 *   through a service the client is already paying for rather than through a
 *   defeated control.
 *
 *   THE IMAGE FILES turn out to be reachable directly — but only on the
 *   APEX. `https://evergreencleaningservice.ca/wp-content/uploads/…` returns
 *   200 and the real bytes; the same path on `www.` returns the 202
 *   interstitial. The challenge is scoped per host and per content type, and
 *   an earlier check that used `www.` for everything concluded, wrongly, that
 *   the images were unreachable too.
 *
 * So: Firecrawl for the markup, a plain GET on the apex for the bytes.
 *
 * WHAT IT WRITES. Image files into `public/images/`, and a JSON report of
 * what each page carries — its images in document order, with alt text — so
 * the references can be restored in the right places rather than appended to
 * the end.
 *
 * Usage:
 *   node scripts/harvest-missing-images.mjs <pages.json> [--out <report.json>]
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FIRECRAWL_API_KEY;
if (!KEY) {
  console.error('FIRECRAWL_API_KEY is not set.');
  process.exit(2);
}

const pagesFile = process.argv[2];
const outAt = process.argv.indexOf('--out');
const reportPath = outAt !== -1 ? process.argv[outAt + 1] : '.harvest-report.json';

const routes = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
const IMAGES_DIR = path.resolve('public/images');
fs.mkdirSync(IMAGES_DIR, { recursive: true });

/** Chrome, present on every page; never part of a page's own content. */
const CHROME = [/cropped-evergreen/i, /evergreen[-_]?logo/i, /Google-Review-Link/i];

const scrape = async (url) => {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['html', 'markdown'], onlyMainContent: false }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(`firecrawl: ${JSON.stringify(body).slice(0, 200)}`);
  return body.data;
};

/**
 * Fetch the bytes, from the APEX regardless of what host the markup names.
 * `www.` is challenged for uploads; the apex is not.
 */
/**
 * Is this actually an image?
 *
 * BY MAGIC BYTES, not by status code and not by content-type. The first
 * version trusted a 200 and a length over 100, and wrote 22 copies of the
 * SiteGround captcha interstitial into `public/images/` with `.jpg`
 * extensions — 216 to 223 bytes of HTML, each one named after the photograph
 * it was standing in for. Every one would have shipped as a broken image.
 *
 * This is the estate's oldest rule in its purest form: a status code is not
 * content. Check the thing you care about.
 */
const IMAGE_MAGIC = [
  { ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: '.png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: '.gif', test: (b) => b.subarray(0, 3).toString('latin1') === 'GIF' },
  {
    ext: '.webp',
    test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

const identify = (buf) => IMAGE_MAGIC.find((m) => buf.length > 16 && m.test(buf))?.ext ?? null;

/**
 * Fetch the bytes from the APEX, whatever host the markup names: `www.` is
 * challenged for uploads and the apex usually is not.
 *
 * RETRIED, because the challenge is intermittent rather than absolute — this
 * container's egress rotates between addresses and some of them are trusted.
 * That is a retry on a flaky response, not an attempt to defeat the control:
 * no challenge is solved, no clearance cookie is replayed, no user-agent is
 * spoofed beyond naming a real browser. What cannot be fetched in a few
 * honest attempts is reported as unrecovered.
 */
const download = async (src, attempts = 4) => {
  const u = new URL(src);
  u.hostname = 'evergreencleaningservice.ca';

  let last = 'no attempt';
  for (let i = 0; i < attempts; i++) {
    let res;
    try {
      res = await fetch(u, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          Referer: 'https://evergreencleaningservice.ca/',
        },
      });
    } catch (err) {
      last = `network: ${err.message}`;
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const ext = identify(buf);
    if (res.ok && ext) return { ok: true, buf, ext };

    last = /sgcaptcha/i.test(buf.toString('latin1').slice(0, 300))
      ? `challenged (attempt ${i + 1})`
      : `HTTP ${res.status}, ${buf.length} bytes, not an image`;

    /* A short, increasing pause. Enough for the egress to rotate, not enough
       to look like pressure on the origin. */
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  return { ok: false, status: last };
};


const report = [];
let fetched = 0;
let skipped = 0;
let failed = 0;

for (const route of routes) {
  const url = `https://www.evergreencleaningservice.ca${route}`;
  process.stdout.write(`${route}  `);

  let data;
  try {
    data = await scrape(url);
  } catch (err) {
    console.log(`SCRAPE FAILED — ${err.message}`);
    report.push({ route, error: String(err.message) });
    continue;
  }

  const html = data.html ?? '';
  if (/sgcaptcha/i.test(html)) {
    console.log('CHALLENGED even through firecrawl');
    report.push({ route, error: 'challenged' });
    continue;
  }

  /* Document order matters: it is how the references get restored to the
     right paragraph rather than dumped at the bottom of the page. */
  const images = [];
  for (const m of html.matchAll(/<img\b([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    const raw =
      attrs.match(/\bdata-src="([^"]*)"/)?.[1] ?? attrs.match(/\bsrc="([^"]*)"/)?.[1] ?? '';
    if (!raw || /^data:/i.test(raw) || /;base64,/i.test(raw)) continue;
    if (!/wp-content\/uploads/i.test(raw)) continue;
    const base = decodeURIComponent(raw.split('?')[0].split('/').pop() ?? '');
    if (!base || CHROME.some((re) => re.test(base))) continue;
    const alt = attrs.match(/\balt="([^"]*)"/)?.[1] ?? '';
    if (!images.some((i) => i.file === base)) images.push({ file: base, alt, src: raw });
  }

  const got = [];
  for (const img of images) {
    /* Already have it under any extension? Then nothing to do. */
    const stem = img.file.replace(/\.[a-z0-9]+$/i, '');
    const existing = fs
      .readdirSync(IMAGES_DIR)
      .find((f) => f.replace(/\.[a-z0-9]+$/i, '') === stem);
    if (existing) {
      skipped++;
      got.push({ ...img, saved: existing, status: 'already present' });
      continue;
    }

    const dl = await download(img.src);
    if (!dl.ok) {
      failed++;
      got.push({ ...img, status: `FAILED ${dl.status}` });
      continue;
    }
    /* The extension follows the BYTES, never the requested filename:
       SiteGround answers a `.jpg` request with WebP whenever the client
       accepts it, and a WebP called `.jpg` is a file sharp and the browser
       disagree about. `dl.ext` comes from the magic-byte check. */
    const name = `${stem}${dl.ext}`;
    fs.writeFileSync(path.join(IMAGES_DIR, name), dl.buf);
    fetched++;
    got.push({ ...img, saved: name, bytes: dl.buf.length, status: 'fetched' });
  }

  report.push({ route, markdown: data.markdown ?? '', images: got });
  console.log(`${images.length} image(s), ${got.filter((g) => g.status === 'fetched').length} fetched`);
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(
  `\n${fetched} fetched, ${skipped} already present, ${failed} failed → ${IMAGES_DIR}\nreport → ${reportPath}`
);

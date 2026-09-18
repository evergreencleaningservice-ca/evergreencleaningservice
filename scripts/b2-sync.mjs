/**
 * Syncs `public/images` into the Backblaze B2 bucket the site serves photos
 * from. Idempotent: it compares SHA-1s and uploads only what differs, so
 * running it on every deploy costs one list call when nothing has changed.
 *
 * Needs B2_KEY_ID and B2_APP_KEY in the environment. Exits non-zero without
 * them rather than skipping quietly — a deploy that silently did not publish
 * the images produces a site of broken pictures, and that is worth failing on.
 *
 *   node scripts/b2-sync.mjs           upload anything new or changed
 *   node scripts/b2-sync.mjs --prune   also delete bucket objects with no
 *                                      counterpart in public/images
 *
 * `--prune` is opt-in because deleting is the one thing here that cannot be
 * undone by running it again.
 *
 * Why the native B2 API and not the S3 one: uploads need a per-file
 * `b2-cache-control` header, the account already authorises with a native key
 * pair, and pulling in an S3 SDK to send three headers is not worth the
 * dependency.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { images } from '../src/data/site.ts';

const KEY_ID = process.env.B2_KEY_ID;
const APP_KEY = process.env.B2_APP_KEY;
const PRUNE = process.argv.includes('--prune');

if (!KEY_ID || !APP_KEY) {
  console.error('b2-sync: B2_KEY_ID and B2_APP_KEY must be set.');
  process.exit(1);
}

const LOCAL = path.resolve('public', 'images');
const PREFIX = 'images/'; // bucket keys mirror the site paths, minus the leading slash

/* One day in the browser, one year at the Cloudflare edge. The long edge TTL is
   what makes this cheap — B2 is hit once per object per year — and it stays
   correctable because a purge clears the edge, which `immutable` or a long
   browser max-age would not. */
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000';

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

const auth = await (async () => {
  const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${Buffer.from(`${KEY_ID}:${APP_KEY}`).toString('base64')}` },
  });
  if (!res.ok) throw new Error(`b2_authorize_account ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return {
    token: body.authorizationToken,
    api: body.apiInfo.storageApi.apiUrl,
    download: body.apiInfo.storageApi.downloadUrl,
    accountId: body.accountId,
  };
})();

const call = async (name, payload) => {
  const res = await fetch(`${auth.api}/b2api/v3/${name}`, {
    method: 'POST',
    headers: { Authorization: auth.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${name} ${res.status}: ${JSON.stringify(body)}`);
  return body;
};

/* --- the bucket ------------------------------------------------------------ */

let bucket = (await call('b2_list_buckets', { accountId: auth.accountId, bucketName: images.bucket }))
  .buckets?.[0];

if (!bucket) {
  bucket = await call('b2_create_bucket', {
    accountId: auth.accountId,
    bucketName: images.bucket,
    bucketType: 'allPublic',
  });
  console.log(`b2-sync: created bucket ${images.bucket} (allPublic).`);
} else if (bucket.bucketType !== 'allPublic') {
  /* A private bucket answers every request with 401 and the site renders empty
     frames. Say so rather than uploading into it. */
  console.error(`b2-sync: bucket ${images.bucket} is ${bucket.bucketType}, expected allPublic.`);
  process.exit(1);
}

/* --- what is already there -------------------------------------------------- */

const remote = new Map(); // key -> { sha1, fileId }
for (let startFileName = null; ; ) {
  const page = await call('b2_list_file_names', {
    bucketId: bucket.bucketId,
    prefix: PREFIX,
    maxFileCount: 10000,
    ...(startFileName ? { startFileName } : {}),
  });
  for (const f of page.files) remote.set(f.fileName, { sha1: f.contentSha1, fileId: f.fileId });
  if (!page.nextFileName) break;
  startFileName = page.nextFileName;
}

/* --- what should be there --------------------------------------------------- */

const local = new Map(); // key -> absolute path
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else local.set(PREFIX + path.relative(LOCAL, full).split(path.sep).join('/'), full);
  }
};
walk(LOCAL);

/* --- upload ----------------------------------------------------------------- */

let slot = null;
const uploadSlot = async () => (slot ??= await call('b2_get_upload_url', { bucketId: bucket.bucketId }));

let uploaded = 0;
let skipped = 0;
const failed = [];

for (const [key, file] of [...local].sort()) {
  const body = fs.readFileSync(file);
  const sha1 = crypto.createHash('sha1').update(body).digest('hex');

  if (remote.get(key)?.sha1 === sha1) {
    skipped++;
    continue;
  }

  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) {
    failed.push(`${key}: unknown file type, not uploaded`);
    continue;
  }

  /* An upload URL is single-threaded and dies on any error, so a failure means
     asking for a fresh one rather than retrying against the dead one. */
  let done = false;
  for (let attempt = 1; attempt <= 3 && !done; attempt++) {
    const { uploadUrl, authorizationToken } = await uploadSlot();
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(key),
        'Content-Type': type,
        'Content-Length': String(body.length),
        'X-Bz-Content-Sha1': sha1,
        'X-Bz-Info-b2-cache-control': encodeURIComponent(CACHE_CONTROL),
      },
      body,
    });
    if (res.ok) {
      uploaded++;
      done = true;
    } else {
      const text = await res.text();
      slot = null;
      if (attempt === 3) failed.push(`${key}: ${res.status} ${text}`);
    }
  }
}

/* --- prune ------------------------------------------------------------------ */

let pruned = 0;
const orphans = [...remote.keys()].filter((key) => !local.has(key));
if (orphans.length && PRUNE) {
  for (const key of orphans) {
    /* b2_delete_file_version removes one version; a bucket with versioning on
       can hold several, so list this key's versions and delete each. */
    const { files } = await call('b2_list_file_versions', {
      bucketId: bucket.bucketId,
      startFileName: key,
      prefix: key,
      maxFileCount: 1000,
    });
    for (const f of files) {
      await call('b2_delete_file_version', { fileName: f.fileName, fileId: f.fileId });
      pruned++;
    }
  }
}

/* --- report ----------------------------------------------------------------- */

console.log(
  `b2-sync: ${images.bucket} — ${uploaded} uploaded, ${skipped} unchanged, ${local.size} total.`
);
if (orphans.length) {
  console.log(
    PRUNE
      ? `b2-sync: pruned ${pruned} object version(s) with no local counterpart.`
      : `b2-sync: ${orphans.length} object(s) in the bucket have no local counterpart — run with --prune to delete: ${orphans.slice(0, 5).join(', ')}${orphans.length > 5 ? ', …' : ''}`
  );
}
if (failed.length) {
  for (const line of failed) console.error(`b2-sync: FAILED ${line}`);
  process.exit(1);
}

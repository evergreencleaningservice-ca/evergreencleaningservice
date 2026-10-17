/**
 * Images uploaded from the post editor, stored in the site's B2 bucket.
 *
 * Same bucket and same public host as every other photo on the site
 * (`images` in src/data/site.ts), through B2's native API exactly as
 * scripts/b2-sync.mjs uses it. Keys go under `uploads/`, never `images/`:
 * `images/` mirrors public/images/ in the repo, and `b2:sync --prune` deletes
 * any key there the repo does not have. Nothing prunes `uploads/`.
 *
 *   wrangler secret put B2_KEY_ID
 *   wrangler secret put B2_APP_KEY
 *
 * An application key restricted to this one bucket is enough (read and write
 * files). Without the two secrets the upload answers 503 and the editor says
 * to paste an image address instead.
 */
import { images } from '../../data/site';

export interface B2Env {
  B2_KEY_ID?: string;
  B2_APP_KEY?: string;
}

export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000';

interface Session {
  at: number;
  token: string;
  api: string;
  bucketId: string;
}

let session: Session | null = null;
/** For the tests. */
export const resetB2 = () => {
  session = null;
};

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** "Office Lobby (1).JPG" -> "office-lobby-1". */
export const fileStem = (name: string) =>
  String(name ?? '')
    .replace(/\.[a-z0-9]{1,5}$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';

/** uploads/blog/2026/10/k3j9x2-office-lobby.jpg */
export function uploadKey(name: string, type: string, now = new Date(), rand = crypto.randomUUID().slice(0, 8)) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `uploads/blog/${y}/${m}/${rand}-${fileStem(name)}.${IMAGE_TYPES[type]}`;
}

export const publicUrl = (key: string) => `${images.host}/${key}`;

async function open(env: B2Env, fetchImpl: typeof fetch, now: number): Promise<Session> {
  // B2 tokens last 24 hours; take a new one well before.
  if (session && now - session.at < 12 * 60 * 60 * 1000) return session;
  const res = await fetchImpl('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${btoa(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`)}` },
  });
  if (!res.ok) throw new Error(`b2_authorize_account ${res.status}`);
  const auth = (await res.json()) as {
    accountId: string;
    authorizationToken: string;
    apiInfo: { storageApi: { apiUrl: string; bucketId?: string | null; bucketName?: string | null } };
  };
  const api = auth.apiInfo.storageApi.apiUrl;
  let bucketId = auth.apiInfo.storageApi.bucketName === images.bucket ? auth.apiInfo.storageApi.bucketId : null;
  if (!bucketId) {
    const list = await fetchImpl(`${api}/b2api/v3/b2_list_buckets`, {
      method: 'POST',
      headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: auth.accountId, bucketName: images.bucket }),
    });
    const body = (await list.json()) as { buckets?: { bucketId: string }[] };
    bucketId = body.buckets?.[0]?.bucketId ?? null;
  }
  if (!bucketId) throw new Error(`b2: bucket ${images.bucket} not found for this key`);
  session = { at: now, token: auth.authorizationToken, api, bucketId };
  return session;
}

/**
 * Stores one image and returns its public address.
 */
export async function uploadImage(
  env: B2Env,
  bytes: ArrayBuffer,
  type: string,
  key: string,
  fetchImpl: typeof fetch = fetch,
  now = Date.now()
): Promise<string> {
  const s = await open(env, fetchImpl, now);
  const sha1 = hex(await crypto.subtle.digest('SHA-1', bytes));
  // An upload URL dies on any error, so a failure asks for a fresh one.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const slot = await fetchImpl(`${s.api}/b2api/v3/b2_get_upload_url`, {
      method: 'POST',
      headers: { Authorization: s.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketId: s.bucketId }),
    });
    if (!slot.ok) {
      if (slot.status === 401) session = null;
      throw new Error(`b2_get_upload_url ${slot.status}`);
    }
    const { uploadUrl, authorizationToken } = (await slot.json()) as { uploadUrl: string; authorizationToken: string };
    const res = await fetchImpl(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(key),
        'Content-Type': type,
        'Content-Length': String(bytes.byteLength),
        'X-Bz-Content-Sha1': sha1,
        'X-Bz-Info-b2-cache-control': encodeURIComponent(CACHE_CONTROL),
      },
      body: bytes,
    });
    if (res.ok) return publicUrl(key);
    console.error(`b2: upload attempt ${attempt} answered ${res.status}`);
  }
  throw new Error('b2: upload failed');
}

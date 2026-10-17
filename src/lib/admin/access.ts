/**
 * Who may open /admin/ and /api/admin/: Cloudflare Access, checked twice.
 *
 * Cloudflare Access sits in front of both paths (Zero Trust → Access →
 * Applications, one self-hosted application covering
 * www.evergreencleaningservice.ca/admin, …/api/admin and the same two on
 * stage.). It signs people in (a one-time code by email, or Google) and only
 * lets through the addresses its policy names. Every request it lets through
 * carries a signed token, `Cf-Access-Jwt-Assertion`.
 *
 * The Worker checks that token itself as well, rather than trusting that
 * Access is in front: a policy edited by mistake, or the workers.dev address
 * (which Access does not cover), would otherwise open the leads to anyone.
 * The token is RS256, signed by the team's keys at
 * https://<team>.cloudflareaccess.com/cdn-cgi/access/certs, for this
 * application's audience tag.
 *
 *   ACCESS_TEAM_DOMAIN  <team>.cloudflareaccess.com
 *   ACCESS_AUD          the application's Audience (AUD) tag
 *   ADMIN_EMAILS        optional: addresses allowed even if Access lets more
 *                       through, comma-separated
 *   ADMIN_DEV_EMAIL     only on localhost: who `wrangler dev` signs in as
 *
 * Without ACCESS_TEAM_DOMAIN and ACCESS_AUD every admin request answers 503:
 * an admin that is not set up stays shut, never open.
 *
 * No library: Web Crypto verifies RS256 in every runtime this code runs in
 * (the Worker, and Node 22 for the tests).
 */

export interface AccessEnv {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
  ADMIN_DEV_EMAIL?: string;
}

export type AccessResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 503; reason: string };

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
}

const CERTS_TTL_MS = 60 * 60 * 1000;
const certCache = new Map<string, { at: number; keys: Jwk[] }>();

/** For the tests: forget the fetched keys. */
export const clearAccessKeys = () => certCache.clear();

export const teamHost = (raw: string | undefined): string =>
  String(raw ?? '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .toLowerCase();

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const b64urlBytes = (s: string): Uint8Array => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const b64urlJson = (s: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
  } catch {
    return null;
  }
};

function readCookie(request: Request, name: string): string {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const at = part.indexOf('=');
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return '';
}

async function teamKeys(team: string, fetchImpl: typeof fetch, now: number, fresh = false): Promise<Jwk[]> {
  const kept = certCache.get(team);
  if (kept && !fresh && now - kept.at < CERTS_TTL_MS) return kept.keys;
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`access certs answered ${res.status}`);
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = Array.isArray(body.keys) ? body.keys.filter((k) => k && k.kty === 'RSA' && k.kid) : [];
  certCache.set(team, { at: now, keys });
  return keys;
}

/**
 * The verified address on this request, or why there is none.
 */
export async function adminFor(
  request: Request,
  env: AccessEnv,
  fetchImpl: typeof fetch = fetch,
  now = Date.now()
): Promise<AccessResult> {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname) && env.ADMIN_DEV_EMAIL?.trim()) {
    return { ok: true, email: env.ADMIN_DEV_EMAIL.trim().toLowerCase() };
  }

  const team = teamHost(env.ACCESS_TEAM_DOMAIN);
  const aud = env.ACCESS_AUD?.trim();
  if (!team || !aud) return { ok: false, status: 503, reason: 'admin sign-in is not set up' };

  const token = request.headers.get('cf-access-jwt-assertion') || readCookie(request, 'CF_Authorization');
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, status: 401, reason: 'not signed in' };

  const header = b64urlJson(parts[0]);
  const claims = b64urlJson(parts[1]);
  if (!header || !claims || header.alg !== 'RS256' || typeof header.kid !== 'string') {
    return { ok: false, status: 401, reason: 'not signed in' };
  }

  let keys: Jwk[];
  try {
    keys = await teamKeys(team, fetchImpl, now);
    if (!keys.some((k) => k.kid === header.kid)) keys = await teamKeys(team, fetchImpl, now, true);
  } catch (err) {
    console.error('admin: could not read the Access keys', err);
    return { ok: false, status: 503, reason: 'sign-in could not be checked' };
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return { ok: false, status: 401, reason: 'not signed in' };

  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      b64urlBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, status: 401, reason: 'not signed in' };

  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const exp = Number(claims.exp) * 1000;
  const nbf = claims.nbf === undefined ? 0 : Number(claims.nbf) * 1000;
  if (
    claims.iss !== `https://${team}` ||
    !audiences.includes(aud) ||
    !(exp > now) ||
    nbf > now + 60_000 ||
    typeof claims.email !== 'string' ||
    !claims.email
  ) {
    return { ok: false, status: 401, reason: 'not signed in' };
  }

  const email = claims.email.trim().toLowerCase();
  const allowed = (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(email)) {
    return { ok: false, status: 403, reason: `${email} may not open the admin` };
  }
  return { ok: true, email };
}

/**
 * A change may only come from the admin's own pages. Access's cookie is sent
 * on a cross-site form post too, so without this another site could make a
 * signed-in admin's browser change a lead or publish a post.
 */
export function sameOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  return request.headers.get('origin') === new URL(request.url).origin;
}

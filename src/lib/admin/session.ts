/**
 * Who may open /admin/ and /api/admin/: the admin's own sign-in.
 *
 * An address on ADMIN_EMAILS asks for a code at /admin/sign-in/. The Worker
 * emails a six-digit code through Resend (the lead notifications' key and
 * sender), keeps only a keyed hash of it (migrations/0011), and accepts it
 * once, within ten minutes, in five tries. A correct code sets a session
 * cookie for twelve hours, signed with ADMIN_SESSION_SECRET, HttpOnly,
 * Secure, SameSite=Strict and __Host- prefixed. Taking an address off
 * ADMIN_EMAILS ends its sessions at once.
 *
 * It replaced Cloudflare Access, whose Zero Trust Free plan asks for a
 * payment card. It works the way Access's one-time PIN does.
 *
 *   ADMIN_EMAILS          who may sign in, comma-separated
 *   ADMIN_SESSION_SECRET  32+ random characters: signs sessions, keys the
 *                         code hashes. Changing it signs everyone out.
 *   RESEND_API_KEY, LEAD_NOTIFY_FROM   already set for the lead emails
 *   ADMIN_DEV_EMAIL       only on localhost: who `wrangler dev` signs in as
 *
 * Without ADMIN_EMAILS and ADMIN_SESSION_SECRET every admin request answers
 * 503: an admin that is not set up stays shut, never open.
 *
 * No library: Web Crypto in the Worker, and in Node 22 for the tests.
 */
import type { Sql } from '../posts-sync';

export interface SessionEnv {
  ADMIN_EMAILS?: string;
  ADMIN_SESSION_SECRET?: string;
  ADMIN_DEV_EMAIL?: string;
  RESEND_API_KEY?: string;
  LEAD_NOTIFY_FROM?: string;
}

export type SessionResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 503; reason: string };

export const SESSION_MS = 12 * 60 * 60 * 1000;
export const CODE_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
/** Codes one address may be sent in an hour. */
export const MAX_CODES_PER_HOUR = 5;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const EMAIL = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

export const normEmail = (v: unknown) => String(v ?? '').trim().toLowerCase();

export const allowedEmails = (env: SessionEnv): string[] =>
  (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(normEmail)
    .filter((e) => EMAIL.test(e));

const secretOf = (env: SessionEnv) => {
  const s = env.ADMIN_SESSION_SECRET?.trim() ?? '';
  return s.length >= 32 ? s : null;
};

export const isConfigured = (env: SessionEnv) => Boolean(secretOf(env) && allowedEmails(env).length);

export const cookieName = (url: URL) => (url.protocol === 'https:' ? '__Host-eg_admin' : 'eg_admin');

// ---------------------------------------------------------------- crypto ---

const enc = new TextEncoder();
const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const fromB64url = (s: string) => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(pad + '='.repeat((4 - (pad.length % 4)) % 4)), (c) => c.charCodeAt(0));
};

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Equal strings, compared in time that does not depend on where they differ. */
export function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function seal(secret: string, value: unknown): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(value)));
  return `${body}.${await hmac(secret, `session:${body}`)}`;
}

export async function unseal<T>(secret: string, raw: string): Promise<T | null> {
  const [body, mac] = String(raw ?? '').split('.');
  if (!body || !mac || !same(mac, await hmac(secret, `session:${body}`))) return null;
  try {
    return JSON.parse(new TextDecoder().decode(fromB64url(body))) as T;
  } catch {
    return null;
  }
}

export const codeHash = (secret: string, email: string, code: string) => hmac(secret, `code:${email}:${code}`);

/** Six random digits, without modulo bias. */
export function newCode(): string {
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < 4_294_000_000) return String(buf[0] % 1_000_000).padStart(6, '0');
  }
}

function readCookie(request: Request, name: string): string {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const at = part.indexOf('=');
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return '';
}

// -------------------------------------------------------------- sessions ---

/** Who is signed in on this request, or why nobody is. */
export async function sessionFor(request: Request, env: SessionEnv, now = Date.now()): Promise<SessionResult> {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname) && env.ADMIN_DEV_EMAIL?.trim()) return { ok: true, email: normEmail(env.ADMIN_DEV_EMAIL) };
  const secret = secretOf(env);
  if (!secret || !allowedEmails(env).length) return { ok: false, status: 503, reason: 'admin sign-in is not set up' };
  const s = await unseal<{ email: string; exp: number }>(secret, readCookie(request, cookieName(url)));
  if (!s || typeof s.email !== 'string' || !(s.exp > now)) return { ok: false, status: 401, reason: 'not signed in' };
  // Off the list is out, whatever the cookie says.
  if (!allowedEmails(env).includes(s.email)) return { ok: false, status: 401, reason: 'not signed in' };
  return { ok: true, email: s.email };
}

const cookieAttrs = (url: URL, maxAge: number) =>
  ['Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`, ...(url.protocol === 'https:' ? ['Secure'] : [])].join('; ');

export async function sessionCookie(url: URL, env: SessionEnv, email: string, now = Date.now()): Promise<string> {
  const value = await seal(secretOf(env)!, { email, exp: now + SESSION_MS });
  return `${cookieName(url)}=${value}; ${cookieAttrs(url, SESSION_MS / 1000)}`;
}

export const clearCookie = (url: URL) => `${cookieName(url)}=; ${cookieAttrs(url, 0)}`;

/**
 * A change may only come from the admin's own pages. The cookie is
 * SameSite=Strict as well; this is the second lock.
 */
export function sameOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  return request.headers.get('origin') === new URL(request.url).origin;
}

/** A path in the admin to go back to after signing in: never another site, never a trick. */
export function safeReturn(raw: unknown): string {
  const p = String(raw ?? '');
  return /^\/admin\/[^\s\\]*$/.test(p) && !p.startsWith('//') && !p.startsWith('/admin/sign-in') ? p.slice(0, 500) : '/admin/';
}

// ----------------------------------------------------------------- codes ---

export type SendCode = (to: string, code: string) => Promise<boolean>;

/** The code by email, through Resend, from the lead notifications' sender. */
export const resendCode =
  (env: SessionEnv, fetchImpl: typeof fetch = fetch): SendCode =>
  async (to, code) => {
    if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_FROM) {
      console.error('admin sign-in: RESEND_API_KEY or LEAD_NOTIFY_FROM is not set; no code sent');
      return false;
    }
    try {
      const res = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: env.LEAD_NOTIFY_FROM,
          to: [to],
          subject: `${code} is your Evergreen admin code`,
          text: `Your code to sign in to the Evergreen admin is ${code}.\n\nIt works once, for 10 minutes. If you did not ask for it, ignore this email: nobody can sign in without the code.`,
        }),
      });
      if (!res.ok) console.error('admin sign-in: resend rejected the code email', res.status, await res.text());
      return res.ok;
    } catch (err) {
      console.error('admin sign-in: request to resend failed', err);
      return false;
    }
  };

/**
 * Send a code to an allowed address. The answer is the same whether the
 * address is allowed or not, so the page never tells a stranger who the
 * admins are.
 */
export async function startSignIn(sql: Sql, env: SessionEnv, rawEmail: unknown, country: string, send: SendCode, now = Date.now()) {
  const email = normEmail(rawEmail);
  if (!allowedEmails(env).includes(email)) return;
  await sql`DELETE FROM admin_sign_in_codes WHERE expires_at < ${new Date(now - 86_400_000).toISOString()}`;
  const recent = await sql`
    SELECT count(*)::int AS n FROM admin_sign_in_codes
     WHERE email = ${email} AND created_at > ${new Date(now - 3_600_000).toISOString()}`;
  if (Number(recent[0]?.n ?? 0) >= MAX_CODES_PER_HOUR) {
    console.warn('admin sign-in: code limit reached for an allowed address');
    return;
  }
  const code = newCode();
  await sql`
    INSERT INTO admin_sign_in_codes (email, code_hash, expires_at, ip_country)
    VALUES (${email}, ${await codeHash(secretOf(env)!, email, code)}, ${new Date(now + CODE_MS).toISOString()}, ${country.slice(0, 8)})`;
  await send(email, code);
}

/**
 * The address a code signs in, or null. The try is counted before the code
 * is compared, in the same statement that refuses a sixth, so guesses made
 * in parallel cannot get round the limit; a right code is used once.
 */
export async function verifySignIn(sql: Sql, env: SessionEnv, rawEmail: unknown, rawCode: unknown, now = Date.now()): Promise<string | null> {
  const email = normEmail(rawEmail);
  const code = String(rawCode ?? '').replace(/\D/g, '');
  if (!allowedEmails(env).includes(email) || code.length !== 6) return null;
  const rows = await sql`
    UPDATE admin_sign_in_codes SET attempts = attempts + 1
     WHERE id = (
       SELECT id FROM admin_sign_in_codes
        WHERE email = ${email} AND used_at IS NULL AND expires_at > ${new Date(now).toISOString()}
        ORDER BY id DESC LIMIT 1)
       AND attempts < ${MAX_ATTEMPTS}
     RETURNING id, code_hash`;
  const row = rows[0];
  if (!row || !same(String(row.code_hash), await codeHash(secretOf(env)!, email, code))) return null;
  const used = await sql`UPDATE admin_sign_in_codes SET used_at = now() WHERE id = ${row.id} AND used_at IS NULL RETURNING id`;
  return used[0] ? email : null;
}

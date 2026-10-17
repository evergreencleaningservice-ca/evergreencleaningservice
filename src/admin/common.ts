/**
 * What every admin page shares: the API, who is signed in, dates in Toronto,
 * and the little notice at the bottom of the screen.
 */

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as T;

export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: Record<string, unknown>
  ) {
    super(message);
  }
}

/** /api/admin/<path>, as JSON. A lapsed sign-in reloads the page, which signs in again. */
export async function api<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === 'string') headers.set('content-type', 'application/json');
  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, { ...init, headers, credentials: 'same-origin', redirect: 'manual' });
  } catch {
    throw new ApiError('No connection. Check the network and try again.', 0, {});
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    // The session ended (twelve hours, or the address came off the list): sign in again, then come back.
    if (res.status === 401 && !path.startsWith('/auth/')) location.href = signInUrl();
    throw new ApiError(String(body.error ?? `The request failed (${res.status}).`), res.status, body);
  }
  return body as T;
}

export const signInUrl = () => `/admin/sign-in/?return=${encodeURIComponent(location.pathname + location.search)}`;

// Every admin page imports this file, so the header's Sign out works on every page.
document.querySelector('[data-signout]')?.addEventListener('click', async () => {
  await fetch('/api/admin/auth/sign-out', { method: 'POST', credentials: 'same-origin' }).catch(() => null);
  location.href = '/admin/sign-in/';
});

const TZ = 'America/Toronto';

export const fmtDate = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' });
};

export const fmtDateTime = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-CA', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const fmtMoney = (v: unknown) =>
  v === null || v === undefined || v === '' ? '' : Number(v).toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

/** "+1 (416) 738-7236" from whatever was typed. */
export function fmtPhone(raw: unknown): string {
  const d = String(raw ?? '').replace(/\D/g, '');
  const n = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  return n.length === 10 ? `+1 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}` : String(raw ?? '');
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string, bad = false) {
  const el = $('[data-toast]');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('is-bad', bad);
  el.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-shown'), bad ? 6000 : 2600);
}

export function notice(text: string | null) {
  const el = $('[data-notice]');
  if (!el) return;
  el.hidden = !text;
  el.textContent = text ?? '';
}

export interface Me {
  email: string;
  database: 'main' | 'staging';
  features: { outcomes: boolean; posts: boolean; skip: boolean };
}

/** Fills in the header (who, which database) and returns the session. */
export async function signedIn(): Promise<Me | null> {
  try {
    const me = await api<Me>('/me');
    $('[data-email]').textContent = me.email;
    const db = $('[data-db]');
    db.hidden = me.database === 'main';
    db.textContent = 'Staging data';
    db.title = 'This address reads and writes the staging database, not the live one.';
    return me;
  } catch (err) {
    notice((err as Error).message);
    return null;
  }
}

export async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${what} copied`);
  } catch {
    toast(`Could not copy the ${what.toLowerCase()}: select it and copy instead.`, true);
  }
}

export function debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const run = (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
  run.flush = (...a: A) => {
    clearTimeout(t);
    fn(...a);
  };
  return run;
}

export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(`eg-admin.${key}`);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(`eg-admin.${key}`, value);
    } catch {
      /* private mode: remembered until the tab closes */
    }
  },
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  qualified: 'Qualified',
  quote_issued: 'Quote issued',
  won: 'Won',
  lost: 'Lost',
  unqualified: 'Unqualified',
};

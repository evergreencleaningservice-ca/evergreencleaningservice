/**
 * @vitest-environment node
 *
 * The admin, through the Worker's own `fetch`: who gets in (a Cloudflare
 * Access token, checked here with a real RS256 signature), what each route
 * asks the database, and what a published post becomes on the site.
 *
 * Neon is replaced by a fake that records every query and answers from a
 * script, as tests/worker/submit-lead.test.ts does. No Workers runtime, no
 * Access, no B2: TESTING.md says what that leaves unproven.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
const queries: { sql: string; values: unknown[] }[] = [];
let answer: (sql: string, values: unknown[]) => Row[] | Promise<Row[]> = () => [];

vi.mock('@neondatabase/serverless', () => ({
  neon: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = strings.join('?').replace(/\s+/g, ' ').trim();
    queries.push({ sql, values });
    try {
      return Promise.resolve(answer(sql, values));
    } catch (err) {
      return Promise.reject(err);
    }
  },
}));

const worker = (await import('../../src/worker')).default;
const { clearAccessKeys } = await import('../../src/lib/admin/access');
const { clearFeatures, csvCell } = await import('../../src/lib/admin/api');
const { forgetLive } = await import('../../src/lib/admin/live-posts');

const TEAM = 'evergreen.cloudflareaccess.com';
const AUD = 'aud-tag-123';
const WWW = 'https://www.evergreencleaningservice.ca';
const STAGE = 'https://stage.evergreencleaningservice.ca';

let keyPair: CryptoKeyPair;
let otherPair: CryptoKeyPair;
let jwk: JsonWebKey;

const b64url = (bytes: ArrayBuffer | Uint8Array | string) =>
  Buffer.from(typeof bytes === 'string' ? bytes : new Uint8Array(bytes as ArrayBuffer)).toString('base64url');

async function token(claims: Record<string, unknown> = {}, pair = keyPair, kid = 'k1') {
  const header = b64url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }));
  const body = b64url(
    JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email: 'Paolo@10XiD.com', exp: Math.floor(Date.now() / 1000) + 600, ...claims })
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(sig)}`;
}

/** The files the build would hold: a shell page, an insights page, the sitemap, the 404 page. */
const SHELL_HTML = `<!doctype html><html><head><title>EG_SHELL_TITLE - Evergreen Office Cleaning</title><meta name="description" content="EG_SHELL_DESCRIPTION"><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://www.evergreencleaningservice.ca/eg-live-post-shell/"><meta property="og:title" content="EG_SHELL_TITLE - Evergreen Office Cleaning"><meta property="og:image" content="https://img.example/default-og.jpg"><meta name="twitter:image" content="https://img.example/default-og.jpg"><meta property="article:published_time" content="2000-01-01T00:00:00.000Z"><script type="application/ld+json">{"@type":"CleaningService"}</script><script type="application/ld+json">{"@type":"BlogPosting","@id":"https://www.evergreencleaningservice.ca/eg-live-post-shell/#article","headline":"EG_SHELL_TITLE"}</script><script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"name":"EG_SHELL_TITLE"}]}</script></head><body><h1 class="entry-title" data-astro-cid-x1>EG_SHELL_TITLE</h1><article class="entry-content" data-astro-cid-x1>EG_SHELL_BODY</article><section data-post-slug="eg-live-post-shell"></section></body></html>`;
const INSIGHTS_HTML = `<div class="post-list is-flush" data-astro-cid-oxe><article class="list-article" data-astro-cid-oxe><h2>Old post</h2></article></div>`;

const assetCalls: string[] = [];
const ASSETS = {
  fetch: async (input: Request | string) => {
    const req = typeof input === 'string' ? new Request(input) : input;
    const { pathname } = new URL(req.url);
    assetCalls.push(pathname);
    if (pathname === '/eg-live-post-shell/') return new Response(SHELL_HTML, { headers: { 'content-type': 'text/html', etag: '"x"' } });
    if (pathname === '/insights/') return new Response(INSIGHTS_HTML, { headers: { 'content-type': 'text/html' } });
    if (pathname === '/sitemap-0.xml') return new Response('<urlset><url><loc>a</loc></url></urlset>');
    if (pathname === '/office-cleaning/' || pathname === '/services/') return new Response('page');
    if (pathname === '/data/blog-posts.json') return new Response(JSON.stringify([{ slug: 'old', title: 'Old', pub_date: '2020-01-01' }]));
    if (pathname.startsWith('/admin')) return new Response('<html>admin page</html>', { headers: { 'content-type': 'text/html' } });
    return new Response('not found page', { status: 404, headers: { 'content-type': 'text/html' } });
  },
} as unknown as Fetcher;

const ENV = { ASSETS, DATABASE_URL: 'postgres://main', STAGING_DATABASE_URL: 'postgres://staging', ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD };

/** information_schema as a fully migrated database answers it. */
const OUTCOME_COLS = ['lead_status', 'status_reason', 'quote_value_cad', 'won_value_cad', 'qualified_at', 'quote_issued_at', 'won_at', 'outcome_updated_at'];
const POST_COLS = ['id', 'version', 'status', 'lead_id', 'draft', 'slug', 'published_at', 'updated_at', 'updated_by', 'title', 'excerpt', 'tags', 'image', 'image_alt', 'html'];
const FEATURES: Row[] = [
  ...[...OUTCOME_COLS, 'post_skipped_at'].map((c) => ({ table_name: 'leads', column_name: c })),
  ...POST_COLS.map((c) => ({ table_name: 'admin_posts', column_name: c })),
];

async function call(path: string, init: RequestInit & { origin?: string; auth?: string | null; env?: object } = {}) {
  const origin = init.origin ?? WWW;
  const headers = new Headers(init.headers);
  const auth = init.auth === undefined ? await token() : init.auth;
  if (auth) headers.set('cf-access-jwt-assertion', auth);
  if (init.method && init.method !== 'GET' && !headers.has('origin')) headers.set('origin', origin);
  if (init.body && typeof init.body === 'string') headers.set('content-type', 'application/json');
  return worker.fetch(new Request(`${origin}${path}`, { ...init, headers }), { ...ENV, ...(init.env ?? {}) } as never, {} as never);
}

beforeAll(async () => {
  const params = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
  keyPair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
  otherPair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
  jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
});

beforeEach(() => {
  queries.length = 0;
  assetCalls.length = 0;
  answer = (sql) => (sql.includes('information_schema') ? FEATURES : []);
  clearAccessKeys();
  clearFeatures();
  forgetLive();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url) === `https://${TEAM}/cdn-cgi/access/certs`) return new Response(JSON.stringify({ keys: [{ ...jwk, kid: 'k1' }] }));
      return new Response('unexpected', { status: 500 });
    })
  );
});

// ---------------------------------------------------------------- access ---

describe('who may open the admin', () => {
  it('lets a valid Access token in and says who it is', async () => {
    const res = await call('/api/admin/me');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ email: 'paolo@10xid.com', database: 'main' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
  });

  it('serves the admin pages only once signed in', async () => {
    expect((await call('/admin/leads/', { auth: null })).status).toBe(401);
    const res = await call('/admin/leads/');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('admin page');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('stays shut when Access is not set up', async () => {
    const res = await call('/api/admin/me', { env: { ACCESS_TEAM_DOMAIN: '', ACCESS_AUD: '' } });
    expect(res.status).toBe(503);
    const page = await call('/admin/', { env: { ACCESS_AUD: '' } });
    expect(page.status).toBe(503);
    expect(await page.text()).toContain('not set up');
  });

  it('refuses no token, an expired one, the wrong audience, issuer or key', async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    for (const auth of [
      null,
      'garbage',
      await token({ exp: past }),
      await token({ aud: ['other'] }),
      await token({ iss: 'https://evil.cloudflareaccess.com' }),
      await token({}, otherPair),
      await token({}, keyPair, 'unknown-kid'),
      await token({ email: '' }),
    ]) {
      expect((await call('/api/admin/me', { auth })).status).toBe(401);
    }
  });

  it('keeps to ADMIN_EMAILS when it is set', async () => {
    expect((await call('/api/admin/me', { env: { ADMIN_EMAILS: 'someone@else.com' } })).status).toBe(403);
    expect((await call('/api/admin/me', { env: { ADMIN_EMAILS: 'someone@else.com, paolo@10xid.com' } })).status).toBe(200);
  });

  it('honours the dev sign-in on localhost only', async () => {
    const dev = { ADMIN_DEV_EMAIL: 'dev@example.com' };
    const local = await call('/api/admin/me', { origin: 'http://localhost:8787', auth: null, env: dev });
    expect(await local.json()).toMatchObject({ email: 'dev@example.com', database: 'staging' });
    expect((await call('/api/admin/me', { auth: null, env: dev })).status).toBe(401);
  });

  it('refuses a change from another site', async () => {
    const res = await call('/api/admin/posts', { method: 'POST', body: '{}', headers: { origin: 'https://evil.example' } });
    expect(res.status).toBe(403);
    expect(queries).toEqual([]);
  });

  it('uses the staging database on the staging host', async () => {
    expect(await (await call('/api/admin/me', { origin: STAGE })).json()).toMatchObject({ database: 'staging' });
  });
});

// ----------------------------------------------------------------- leads ---

describe('leads', () => {
  it('lists newest first with the filter and search as parameters, never as SQL', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.includes('FROM leads WHERE') ? [{ id: 3 }, { id: 2 }] : [{ status: 'new', n: 2 }]);
    const res = await call(`/api/admin/leads?status=won&q=${encodeURIComponent("o'brien%")}`);
    const body = await res.json();
    expect(body.leads).toHaveLength(2);
    expect(body.counts).toEqual({ new: 2 });
    const q = queries.find((x) => x.sql.includes('FROM leads WHERE'))!;
    expect(q.sql).toContain('ORDER BY id DESC');
    expect(q.values).toContain('won');
    expect(q.values).toContain("%o'brien\\%%");
    expect(q.sql).not.toContain('brien');
  });

  it('reads a half-applied 0009 as not applied, and says so instead of failing', async () => {
    answer = (sql) =>
      sql.includes('information_schema') ? FEATURES.filter((r) => r.column_name !== 'won_at') : sql.includes('FROM leads WHERE') ? [] : [];
    const res = await call('/api/admin/leads');
    expect(res.status).toBe(200);
    expect((await res.json()).notice).toContain('0009_lead_outcomes.sql');
    expect(queries.find((x) => x.sql.includes('FROM leads WHERE'))!.sql).not.toContain('lead_status');
  });

  it('fetches one lead by id, for links to a lead far down the list', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.includes('FROM leads WHERE') ? [{ id: '77' }] : []);
    const body = await (await call('/api/admin/leads?id=77')).json();
    expect(body.leads).toEqual([{ id: 77 }]);
    const q = queries.find((x) => x.sql.includes('FROM leads WHERE'))!;
    expect(q.sql).toContain('id = ?');
    expect(q.values).toContain(77);
  });

  it('ignores an unknown status filter', async () => {
    await call('/api/admin/leads?status=DROP');
    expect(queries.find((x) => x.sql.includes('FROM leads WHERE'))!.values).not.toContain('DROP');
  });

  it('says what to apply when the outcome columns are missing', async () => {
    answer = (sql) => (sql.includes('information_schema') ? [] : []);
    const body = await (await call('/api/admin/leads')).json();
    expect(body.notice).toContain('0009_lead_outcomes.sql');
    expect((await call('/api/admin/leads/1', { method: 'PATCH', body: '{"status":"won"}' })).status).toBe(409);
  });

  it('records an outcome and the stages it reached', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.startsWith('UPDATE leads') ? [{ id: 5, lead_status: 'won' }] : []);
    const res = await call('/api/admin/leads/5', { method: 'PATCH', body: JSON.stringify({ status: 'won', wonValue: '$12,500' }) });
    expect(res.status).toBe(200);
    const q = queries.find((x) => x.sql.startsWith('UPDATE leads'))!;
    expect(q.values).toContain('won');
    expect(q.values).toContain(12500);
    expect(q.values.at(-1)).toBe(5);
  });

  it('refuses an unknown status', async () => {
    expect((await call('/api/admin/leads/5', { method: 'PATCH', body: '{"status":"maybe"}' })).status).toBe(400);
  });

  it('exports CSV a spreadsheet cannot run as a formula', async () => {
    answer = (sql) =>
      sql.includes('information_schema') ? FEATURES : [{ id: 1, full_name: '=HYPERLINK("x")', message: 'a, "b"\nc', created_at: new Date('2026-10-01T00:00:00Z') }];
    const res = await call('/api/admin/leads.csv');
    expect(res.headers.get('content-type')).toContain('text/csv');
    const text = await res.text();
    expect(text).toContain(`"'=HYPERLINK(""x"")"`);
    expect(text).toContain('"a, ""b""\nc"');
    expect(csvCell('-1')).toBe("'-1");
    expect(csvCell(null)).toBe('');
  });
});

// ------------------------------------------------------------------ posts ---

const ROW = (over: Row = {}): Row => ({
  id: 9,
  version: 3,
  status: 'draft',
  lead_id: null,
  draft: { job: { service: 'office', facility: 'dental', area: 'Mississauga' }, edits: {}, blocks: null, tags: null, links: {}, thumb: null, leadId: null },
  slug: null,
  published_at: null,
  updated_at: '2026-10-17T00:00:00Z',
  updated_by: 'a@b.c',
  ...over,
});

describe('posts', () => {
  it('starts one post per job, filled in from the lead', async () => {
    answer = (sql) => {
      if (sql.includes('information_schema')) return FEATURES;
      if (sql.startsWith('SELECT id FROM admin_posts WHERE lead_id')) return [];
      if (sql.includes('FROM leads WHERE id')) return [{ id: 4, business_name: 'Bright Dental', facility_type: 'dental clinic', services: 'Office Cleaning' }];
      if (sql.startsWith('INSERT INTO admin_posts')) return [ROW({ lead_id: 4 })];
      return [];
    };
    const res = await call('/api/admin/posts', { method: 'POST', body: '{"fromLead":4}' });
    expect(res.status).toBe(201);
    const insert = queries.find((x) => x.sql.startsWith('INSERT INTO admin_posts'))!;
    const draft = JSON.parse(String(insert.values[0]));
    expect(draft.job).toMatchObject({ facility: 'dental', client: 'Bright Dental', nameClient: false });
    expect(insert.values[1]).toBe(4);
    expect(insert.values[2]).toBe('paolo@10xid.com');
  });

  it('opens the existing post when a job already has one', async () => {
    answer = (sql) =>
      sql.includes('information_schema') ? FEATURES : sql.startsWith('SELECT id FROM admin_posts') ? [{ id: 9 }] : sql.includes('FROM admin_posts WHERE id') ? [ROW()] : [];
    const body = await (await call('/api/admin/posts', { method: 'POST', body: '{"fromLead":4}' })).json();
    expect(body).toMatchObject({ existing: true, post: { id: 9 } });
    expect(queries.some((x) => x.sql.startsWith('INSERT'))).toBe(false);
  });

  it('makes one post per job even when two starts race: the second opens the first', async () => {
    answer = (sql) => {
      if (sql.includes('information_schema')) return FEATURES;
      if (sql.startsWith('SELECT id FROM admin_posts WHERE lead_id') && !sql.includes('LIMIT 1')) return [];
      if (sql.startsWith('SELECT id FROM admin_posts WHERE lead_id = ? ORDER BY')) return [];
      if (sql.startsWith('SELECT id FROM admin_posts WHERE lead_id = ? LIMIT 1')) return [{ id: '9' }];
      if (sql.includes('FROM leads WHERE id')) return [{ id: '4', business_name: 'Bright Dental' }];
      if (sql.startsWith('INSERT INTO admin_posts')) return []; // the other request won
      if (sql.includes('FROM admin_posts WHERE id')) return [ROW({ lead_id: '4' })];
      return [];
    };
    const res = await call('/api/admin/posts', { method: 'POST', body: '{"fromLead":4}' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ existing: true, post: { id: 9, leadId: 4 } });
    expect(queries.find((x) => x.sql.startsWith('INSERT INTO admin_posts'))!.sql).toContain('ON CONFLICT (lead_id) WHERE lead_id IS NOT NULL DO NOTHING');
  });

  it('says a live post is out of date when only its picture description changed', async () => {
    const draft = { ...(ROW().draft as Row), thumb: { url: 'https://a.example/t.jpg', alt: 'New words' } };
    // What the site holds: the same post, published with the old description.
    const { render, socialSlots, sanitizeDraft } = await import('../../src/lib/admin/post-model');
    const { blocksToHtml } = await import('../../src/lib/admin/blocks');
    const d = sanitizeDraft(draft);
    const r = render(d);
    const live = ROW({
      status: 'published', draft, slug: r.slug, title: r.title, excerpt: r.excerpt, tags: r.tags,
      image: 'https://a.example/t.jpg', image_alt: 'New words', html: blocksToHtml(r.blocks, socialSlots(d)),
    });
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.includes('FROM admin_posts WHERE id') ? [live] : []);
    expect((await (await call('/api/admin/posts/9')).json()).post.stale).toBe(false);
    live.image_alt = 'Old words';
    expect((await (await call('/api/admin/posts/9')).json()).post.stale).toBe(true);
  });

  it('refuses a save based on an older version, and hands back the newer one', async () => {
    answer = (sql) =>
      sql.includes('information_schema') ? FEATURES : sql.startsWith('UPDATE admin_posts') ? [] : sql.includes('FROM admin_posts WHERE id') ? [ROW({ version: 5 })] : [];
    const res = await call('/api/admin/posts/9', { method: 'PUT', body: JSON.stringify({ version: 3, draft: {} }) });
    expect(res.status).toBe(409);
    expect((await res.json()).post.version).toBe(5);
  });

  it('saves only a sanitized draft', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.startsWith('UPDATE admin_posts') ? [ROW({ version: 4 })] : []);
    await call('/api/admin/posts/9', { method: 'PUT', body: JSON.stringify({ version: 3, draft: { job: { evil: '<x>' }, blocks: [{ t: 'script' }] } }) });
    const saved = JSON.parse(String(queries.find((x) => x.sql.startsWith('UPDATE admin_posts'))!.values[0]));
    expect(saved.job.evil).toBeUndefined();
    expect(saved.blocks).toEqual([]);
  });

  it('will not delete a live post', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.startsWith('DELETE') ? [] : sql.includes('FROM admin_posts WHERE id') ? [ROW({ status: 'published' })] : []);
    expect((await call('/api/admin/posts/9', { method: 'DELETE' })).status).toBe(409);
  });

  const publish = async (row: Row, live = true) => {
    answer = (sql) => {
      if (sql.includes('information_schema')) return FEATURES;
      if (sql.includes('FROM admin_posts WHERE id')) return [row];
      if (sql.startsWith('UPDATE admin_posts SET status')) return [{ ...row, status: live ? 'published' : 'draft', version: Number(row.version) + 1 }];
      return [];
    };
    return call('/api/admin/posts/9/publish', { method: 'POST', body: JSON.stringify({ version: row.version, live }) });
  };

  it('publishes: renders the blocks to escaped HTML at the post address', async () => {
    const row = ROW({
      draft: { ...(ROW().draft as Row), edits: { postTitle: 'Clean <b>teeth</b>' }, blocks: [{ t: 'p', text: '<img src=x onerror=alert(1)>' }] },
    });
    const res = await publish(row);
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe(`${WWW}/clean-b-teeth-b/`);
    const q = queries.find((x) => x.sql.startsWith('UPDATE admin_posts SET status'))!;
    expect(q.values[0]).toBe('published');
    expect(q.values).toContain('clean-b-teeth-b');
    const html = q.values.find((v) => typeof v === 'string' && v.startsWith('<p>')) as string;
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img');
    // The social row: the business's own profiles.
    expect(html).toContain('Follow this job on social');
  });

  it('refuses an address the site already has, or keeps for itself', async () => {
    for (const slug of ['office-cleaning', 'admin', 'eg-live-post-shell']) {
      const res = await publish(ROW({ draft: { ...(ROW().draft as Row), edits: { slug } } }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/already a page|kept for the site/);
    }
  });

  it('refuses a publish based on an older version', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.includes('FROM admin_posts WHERE id') ? [ROW({ version: 7 })] : []);
    const res = await call('/api/admin/posts/9/publish', { method: 'POST', body: JSON.stringify({ version: 3, live: true }) });
    expect(res.status).toBe(409);
  });

  it('takes a post off the site without an address check', async () => {
    const res = await publish(ROW({ status: 'published', draft: { ...(ROW().draft as Row), edits: { slug: 'office-cleaning' } } }), false);
    expect(res.status).toBe(200);
    expect(queries.find((x) => x.sql.startsWith('UPDATE admin_posts SET status'))!.values[0]).toBe('draft');
  });

  it('takes a post off the site even when its title has been cleared', async () => {
    const res = await publish(ROW({ status: 'published', draft: { ...(ROW().draft as Row), edits: { postTitle: '' } } }), false);
    expect(res.status).toBe(200);
  });

  it('will not publish a post with no title', async () => {
    const res = await publish(ROW({ draft: { ...(ROW().draft as Row), edits: { postTitle: '  ' } } }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('title');
  });

  it('says to apply 0010 when the table is missing', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES.filter((r) => r.table_name === 'leads') : []);
    const body = await (await call('/api/admin/posts')).json();
    expect(body.error).toContain('0010_admin_posts.sql');
  });

  it('lists the repo posts beside the admin ones', async () => {
    answer = (sql) => (sql.includes('information_schema') ? FEATURES : sql.includes('FROM admin_posts ORDER BY') ? [ROW()] : []);
    const body = await (await call('/api/admin/posts')).json();
    expect(body.posts[0]).toMatchObject({ id: 9, title: 'Office cleaning for a dental office in Mississauga' });
    expect(body.site).toEqual([{ slug: 'old', title: 'Old', pubDate: '2020-01-01' }]);
  });

  it('says uploads are not set up without the B2 keys', async () => {
    const form = new FormData();
    form.set('file', new File([new Uint8Array([1])], 'a.jpg', { type: 'image/jpeg' }));
    const res = await call('/api/admin/image', { method: 'POST', body: form });
    expect(res.status).toBe(503);
  });

  it('refuses a file that is not an image', async () => {
    const form = new FormData();
    form.set('file', new File(['<svg onload=x>'], 'a.svg', { type: 'image/svg+xml' }));
    const res = await call('/api/admin/image', { method: 'POST', body: form, env: { B2_KEY_ID: 'k', B2_APP_KEY: 's' } });
    expect(res.status).toBe(415);
  });
});

// ------------------------------------------------------------ live posts ---

const LIVE: Row = {
  slug: 'clean-teeth',
  title: 'Clean "teeth" & <more>',
  excerpt: 'Short.',
  tags: ['office'],
  image: 'https://img.evergreencleaningservice.ca/uploads/blog/a.jpg',
  image_alt: 'Lobby',
  html: '<p>Body EG_SHELL_TITLE</p>',
  published_at: '2026-10-17T12:00:00.000Z',
};

const site = (path: string, origin = WWW, method = 'GET') =>
  worker.fetch(new Request(`${origin}${path}`, { method }), ENV as never, {} as never);

describe('posts published from the admin, on the site', () => {
  beforeEach(() => {
    answer = (sql) => (sql.includes("status = 'published' AND slug") ? [LIVE] : sql.includes("WHERE status = 'published'") ? [LIVE] : []);
  });

  it('serves a live post in the site\'s own post page', async () => {
    const res = await site('/clean-teeth/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>Clean &quot;teeth&quot; &amp; &lt;more&gt; - Evergreen Office Cleaning</title>');
    expect(html).toContain('<h1 class="entry-title" data-astro-cid-x1>Clean &quot;teeth&quot; &amp; &lt;more&gt;</h1>');
    expect(html).toContain('<p>Body EG_SHELL_TITLE</p>');
    expect(html).toContain('https://www.evergreencleaningservice.ca/clean-teeth/');
    expect(html).toContain('data-post-slug="clean-teeth"');
    expect(html).toContain('content="2026-10-17T12:00:00.000Z"');
    expect(html).not.toContain('noindex');
    expect(html).not.toContain('eg-live-post-shell');
    expect(html).toContain('<div class="post-featured" data-astro-cid-x1><picture data-astro-cid-x1><img src="https://img.evergreencleaningservice.ca/uploads/blog/a.jpg" alt="Lobby"');
    expect(html).toContain('<meta property="og:image" content="https://img.evergreencleaningservice.ca/uploads/blog/a.jpg">');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(ld[1]).toMatchObject({ '@type': 'BlogPosting', headline: 'Clean "teeth" & <more>', image: LIVE.image });
    expect(ld[2]['@type']).toBe('BreadcrumbList');
    expect(html).not.toMatch(/<script type="application\/ld\+json">[^<]*<more>/);
    expect(res.headers.get('etag')).toBeNull();
    expect(res.headers.get('x-robots-tag')).toBeNull();
  });

  it('does not show the picture twice when the body already has it', async () => {
    const own = { ...LIVE, html: `<figure><img src="${LIVE.image}" alt="x"></figure>` };
    answer = () => [own];
    const html = await (await site('/clean-teeth/')).text();
    expect(html).not.toContain('class="post-featured"');
    expect(html).toContain(`<meta property="og:image" content="${LIVE.image}">`);
  });

  it('noindexes it on staging, as _headers does for the files', async () => {
    const res = await site('/clean-teeth/', STAGE);
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive');
  });

  it('redirects the address without its slash', async () => {
    const res = await site('/clean-teeth');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe(`${WWW}/clean-teeth/`);
  });

  it('leaves a missing post as the site\'s 404, and never looks up a path that is not a post', async () => {
    expect((await site('/no-such-post/')).status).toBe(404);
    queries.length = 0;
    forgetLive();
    expect((await site('/wp-login.php')).status).toBe(404);
    expect((await site('/a/b/')).status).toBe(404);
    expect(queries).toEqual([]);
  });

  it('never lets a live post shadow a page the build has', async () => {
    const res = await site('/office-cleaning/');
    expect(await res.text()).toBe('page');
    expect(queries).toEqual([]);
  });

  it('never serves the template at its own address', async () => {
    const res = await site('/eg-live-post-shell/');
    expect(res.status).toBe(404);
  });

  it('adds live posts to /insights/ and the sitemap', async () => {
    const list = await (await site('/insights/')).text();
    expect(list.indexOf('clean-teeth')).toBeLessThan(list.indexOf('Old post'));
    expect(list).toContain('<article class="list-article" data-astro-cid-oxe>');
    expect(list).toContain('Clean &quot;teeth&quot; &amp; &lt;more&gt;');
    const map = await (await site('/sitemap-0.xml')).text();
    expect(map).toContain('<loc>https://www.evergreencleaningservice.ca/clean-teeth/</loc>');
  });

  it('keeps the list for 30 seconds rather than asking on every request', async () => {
    await site('/insights/');
    await site('/insights/');
    await site('/no-such-post/');
    expect(queries.filter((q) => q.sql.includes("WHERE status = 'published' ORDER BY"))).toHaveLength(1);
  });

  it('serves the static site unchanged when the table is not there yet', async () => {
    answer = () => {
      throw new Error('relation "admin_posts" does not exist');
    };
    expect(await (await site('/insights/')).text()).toBe(INSIGHTS_HTML);
    expect((await site('/clean-teeth/')).status).toBe(404);
  });
});

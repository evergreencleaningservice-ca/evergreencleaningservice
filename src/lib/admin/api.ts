/**
 * /admin/ and /api/admin/: leads, jobs and the blog.
 *
 *   GET    /api/admin/me                    who is signed in, which database, what is set up
 *   GET    /api/admin/leads                 newest first; ?status= ?q= ?before=<id>
 *   GET    /api/admin/leads.csv             every lead (up to 10,000), for a spreadsheet
 *   PATCH  /api/admin/leads/<id>            its outcome: status, reason, quote and won values
 *   GET    /api/admin/jobs                  won leads, with the post about each, if any
 *   POST   /api/admin/jobs/<id>/skip        "No post needed" ({ skip: true }), or undo it
 *   GET    /api/admin/posts                 the admin's posts, and the repo's for reference
 *   POST   /api/admin/posts                 a new draft ({ draft } or { fromLead: <id> })
 *   GET    /api/admin/posts/<id>            one post, with its lead
 *   PUT    /api/admin/posts/<id>            save the draft ({ version, draft }); 409 if older
 *   DELETE /api/admin/posts/<id>            a draft; a live post must be taken off first
 *   POST   /api/admin/posts/<id>/publish    { version, live }: publish now, or take it off
 *   POST   /api/admin/image                 one image (multipart "file"), stored in B2
 *
 * Every request is checked against Cloudflare Access (access.ts) before
 * anything else, and every change must come from the admin's own pages.
 * The database is the one the hostname selects (lib/database-url.ts), so the
 * staging admin edits staging's leads and posts and never production's.
 */
import { neon } from '@neondatabase/serverless';
import { adminFor, sameOrigin, type AccessEnv } from './access';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, uploadImage, uploadKey, type B2Env } from './b2';
import { blocksToHtml } from './blocks';
import { forgetLive, SHELL } from './live-posts';
import { draftFromLead, render, sanitizeDraft, slugify, socialSlots, thumbFor, type Draft } from './post-model';
import { databaseSecretFor, databaseUrlFor, type DatabaseEnv } from '../database-url';
import type { Sql } from '../posts-sync';

export interface AdminEnv extends AccessEnv, B2Env, DatabaseEnv {
  ASSETS: Fetcher;
}

export const LEAD_STATUSES = ['new', 'qualified', 'unqualified', 'quote_issued', 'won', 'lost'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * First path segments a post may never take, on top of every address the
 * build already answers (checked against the assets at publish time).
 */
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'data', 'images', 'uploads', 'fonts', 'video', '_astro', 'cdn-cgi', 'feed', 'page', 'blog',
  'wp-admin', 'wp-content', 'wp-includes', 'wp-login', 'wp-json', 'xmlrpc', SHELL.slug,
]);

const SECURITY_HEADERS: Record<string, string> = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  'x-frame-options': 'DENY',
  'referrer-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...SECURITY_HEADERS } });

const withHeaders = (res: Response) => {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
};

const deniedPage = (status: number, reason: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Admin</title><body style="font:16px system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px"><h1 style="font-size:1.4rem">Evergreen admin</h1><p>${
      status === 503
        ? 'The admin is not set up on this address yet: it needs Cloudflare Access (ACCESS_TEAM_DOMAIN and ACCESS_AUD). See HANDOFF.md, "The admin".'
        : status === 403
          ? 'This account may not open the admin. Ask for your address to be added.'
          : 'Sign in to open the admin.'
    }</p><p style="color:#666;font-size:.9rem">${reason.replace(/[<>&]/g, '')}</p>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', ...SECURITY_HEADERS } }
  );

/** Which tables and columns the database has, so a migration not yet applied says so instead of failing. */
interface Features {
  outcomes: boolean;
  posts: boolean;
  skip: boolean;
}
const featureCache = new Map<string, { at: number; f: Features }>();
export const clearFeatures = () => featureCache.clear();

async function features(sql: Sql, key: string, now = Date.now()): Promise<Features> {
  const kept = featureCache.get(key);
  if (kept && now - kept.at < 60_000) return kept.f;
  const rows = await sql`
    SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public'
       AND ((table_name = 'leads' AND column_name IN ('lead_status', 'post_skipped_at')) OR (table_name = 'admin_posts' AND column_name = 'draft'))
  `;
  const has = (t: string, c: string) => rows.some((r) => r.table_name === t && r.column_name === c);
  const f = { outcomes: has('leads', 'lead_status'), posts: has('admin_posts', 'draft'), skip: has('leads', 'post_skipped_at') };
  // Only a complete answer is kept: a database midway through its migrations is asked again.
  if (f.outcomes && f.posts && f.skip) featureCache.set(key, { at: now, f });
  return f;
}

const MISSING = {
  outcomes: 'Lead outcomes need migrations/0009_lead_outcomes.sql applied to this database.',
  posts: 'Posts need migrations/0010_admin_posts.sql applied to this database.',
};

const LEAD_COLUMNS = [
  'id', 'created_at', 'form_id', 'full_name', 'work_email', 'phone', 'business_name', 'address', 'province',
  'services', 'facility_type', 'facility_size', 'message', 'page_url', 'landing_page', 'referrer', 'gclid',
  'utm_source', 'utm_medium', 'utm_campaign', 'first_utm_source', 'first_utm_medium', 'first_utm_campaign',
  'marketing_consent',
] as const;
const OUTCOME_COLUMNS = ['lead_status', 'status_reason', 'quote_value_cad', 'won_value_cad', 'qualified_at', 'quote_issued_at', 'won_at'] as const;

/**
 * Postgres sends a BIGINT as a string (Neon's driver as pg does), so ids are
 * made numbers here, once, rather than compared as "12" and 12 on the page.
 */
const ids = <T extends Record<string, unknown>>(row: T, ...keys: string[]): T => {
  const out: Record<string, unknown> = { ...row };
  for (const k of keys) if (out[k] !== null && out[k] !== undefined) out[k] = Number(out[k]);
  return out as T;
};

const intParam = (v: string | null) => (v && /^\d{1,15}$/.test(v) ? Number(v) : null);
const money = (v: unknown): number | null | undefined => {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 && n < 1e10 ? Math.round(n * 100) / 100 : undefined;
};

/** CSV that a spreadsheet opens as text, never as a formula. */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// --------------------------------------------------------------- leads ---

async function listLeads(sql: Sql, f: Features, url: URL) {
  const status = url.searchParams.get('status');
  const st = status && (LEAD_STATUSES as readonly string[]).includes(status) && f.outcomes ? status : null;
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  const like = q ? `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%` : null;
  const before = intParam(url.searchParams.get('before'));
  const limit = 50;
  const rows = f.outcomes
    ? await sql`
        SELECT id, created_at, form_id, full_name, work_email, phone, business_name, address, province,
               services, facility_type, facility_size, message, page_url, landing_page, referrer, gclid,
               utm_source, utm_medium, utm_campaign, first_utm_source, first_utm_medium, first_utm_campaign,
               marketing_consent,
               lead_status, status_reason, quote_value_cad, won_value_cad, qualified_at, quote_issued_at, won_at
          FROM leads
         WHERE (${before}::bigint IS NULL OR id < ${before})
           AND (${st}::text IS NULL OR lead_status = ${st})
           AND (${like}::text IS NULL OR full_name ILIKE ${like} OR work_email ILIKE ${like} OR phone ILIKE ${like}
                OR business_name ILIKE ${like} OR address ILIKE ${like} OR message ILIKE ${like})
         ORDER BY id DESC
         LIMIT ${limit + 1}
      `
    : await sql`
        SELECT id, created_at, form_id, full_name, work_email, phone, business_name, address, province,
               services, facility_type, facility_size, message, page_url, landing_page, referrer, gclid,
               utm_source, utm_medium, utm_campaign, first_utm_source, first_utm_medium, first_utm_campaign,
               marketing_consent
          FROM leads
         WHERE (${before}::bigint IS NULL OR id < ${before})
           AND (${like}::text IS NULL OR full_name ILIKE ${like} OR work_email ILIKE ${like} OR phone ILIKE ${like}
                OR business_name ILIKE ${like} OR address ILIKE ${like} OR message ILIKE ${like})
         ORDER BY id DESC
         LIMIT ${limit + 1}
      `;
  const counts = f.outcomes
    ? await sql`SELECT lead_status AS status, count(*)::int AS n FROM leads GROUP BY lead_status`
    : await sql`SELECT 'all' AS status, count(*)::int AS n FROM leads`;
  return {
    leads: rows.slice(0, limit).map((r) => ids(r, 'id')),
    more: rows.length > limit,
    counts: Object.fromEntries(counts.map((r) => [r.status, r.n])),
    outcomes: f.outcomes,
    ...(f.outcomes ? {} : { notice: MISSING.outcomes }),
  };
}

async function leadsCsv(sql: Sql, f: Features) {
  const rows = f.outcomes
    ? await sql`
        SELECT id, created_at, form_id, full_name, work_email, phone, business_name, address, province,
               services, facility_type, facility_size, message, page_url, landing_page, referrer, gclid,
               utm_source, utm_medium, utm_campaign, first_utm_source, first_utm_medium, first_utm_campaign,
               marketing_consent,
               lead_status, status_reason, quote_value_cad, won_value_cad, qualified_at, quote_issued_at, won_at
          FROM leads ORDER BY id DESC LIMIT 10000`
    : await sql`
        SELECT id, created_at, form_id, full_name, work_email, phone, business_name, address, province,
               services, facility_type, facility_size, message, page_url, landing_page, referrer, gclid,
               utm_source, utm_medium, utm_campaign, first_utm_source, first_utm_medium, first_utm_campaign,
               marketing_consent
          FROM leads ORDER BY id DESC LIMIT 10000`;
  const cols: readonly string[] = f.outcomes ? [...LEAD_COLUMNS, ...OUTCOME_COLUMNS] : LEAD_COLUMNS;
  const text = [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${text}\r\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="evergreen-leads-${day}.csv"`,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * A lead's outcome. Each status sets the time it was reached, once; moving
 * back down clears the stages above it, so the offline-conversion view
 * (migrations/0009) never exports a stage the lead no longer holds.
 */
async function updateLead(sql: Sql, id: number, body: Record<string, unknown>) {
  const status = String(body.status ?? '') as LeadStatus;
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) return json({ error: 'unknown status' }, 400);
  const reason = body.reason === undefined ? undefined : String(body.reason ?? '').trim().slice(0, 300) || null;
  const quote = money(body.quoteValue);
  const won = money(body.wonValue);
  const reached = {
    qualified: ['qualified', 'quote_issued', 'won', 'lost'].includes(status),
    quote: ['quote_issued', 'won', 'lost'].includes(status),
    won: status === 'won',
  };
  const rows = await sql`
    UPDATE leads SET
      lead_status = ${status},
      status_reason = CASE WHEN ${reason !== undefined} THEN ${reason ?? null} ELSE status_reason END,
      qualified_at = CASE WHEN ${reached.qualified} THEN COALESCE(qualified_at, now()) ELSE NULL END,
      quote_issued_at = CASE WHEN ${reached.quote} THEN COALESCE(quote_issued_at, now()) ELSE NULL END,
      won_at = CASE WHEN ${reached.won} THEN COALESCE(won_at, now()) ELSE NULL END,
      quote_value_cad = CASE WHEN ${quote !== undefined} THEN ${quote ?? null}::numeric ELSE quote_value_cad END,
      won_value_cad = CASE WHEN ${won !== undefined} THEN ${won ?? null}::numeric ELSE won_value_cad END,
      outcome_updated_at = now()
    WHERE id = ${id}
    RETURNING id, lead_status, status_reason, quote_value_cad, won_value_cad, qualified_at, quote_issued_at, won_at
  `;
  return rows[0] ? json({ lead: ids(rows[0], 'id') }) : json({ error: 'no such lead' }, 404);
}

// ---------------------------------------------------------------- jobs ---

async function listJobs(sql: Sql, f: Features) {
  if (!f.outcomes) return json({ jobs: [], notice: MISSING.outcomes });
  if (!f.posts || !f.skip) {
    const jobs = await sql`
      SELECT id, created_at, won_at, won_value_cad, full_name, business_name, address, services,
             facility_type, facility_size, message
        FROM leads WHERE lead_status = 'won' ORDER BY won_at DESC NULLS LAST, id DESC LIMIT 500`;
    return json({ jobs: jobs.map((j) => ids(j, 'id')), notice: MISSING.posts });
  }
  const jobs = await sql`
    SELECT l.id, l.created_at, l.won_at, l.won_value_cad, l.full_name, l.business_name, l.address, l.services,
           l.facility_type, l.facility_size, l.message, l.post_skipped_at,
           p.id AS post_id, p.status AS post_status, p.slug AS post_slug
      FROM leads l
      LEFT JOIN LATERAL (
        SELECT id, status, slug FROM admin_posts WHERE lead_id = l.id ORDER BY (status = 'published') DESC, id DESC LIMIT 1
      ) p ON true
     WHERE l.lead_status = 'won'
     ORDER BY l.won_at DESC NULLS LAST, l.id DESC
     LIMIT 500`;
  return json({ jobs: jobs.map((j) => ids(j, 'id', 'post_id')) });
}

// --------------------------------------------------------------- posts ---

interface PostRow {
  id: number;
  version: number;
  status: 'draft' | 'published';
  lead_id: number | null;
  draft: unknown;
  slug: string | null;
  published_at: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Has the draft moved on from what the site shows? Worked out from what
 * publishing it again would write, so the editor can say "not on the site
 * yet" truthfully, on any device.
 */
function staleness(r: Record<string, unknown>, draft: Draft): boolean {
  if (r.status !== 'published') return false;
  const fresh = render(draft);
  const thumb = thumbFor(draft, fresh.blocks);
  return (
    r.html !== blocksToHtml(fresh.blocks, socialSlots(draft)) ||
    r.title !== fresh.title ||
    r.slug !== fresh.slug ||
    (r.excerpt ?? '') !== fresh.excerpt ||
    (r.image ?? null) !== (thumb?.url ?? null) ||
    (r.image_alt ?? null) !== (thumb?.alt ?? null) ||
    JSON.stringify(r.tags ?? []) !== JSON.stringify(fresh.tags)
  );
}

const postOut = (r: Record<string, unknown>) => {
  const draft = sanitizeDraft(r.draft);
  return {
    stale: staleness(r, draft),
    id: Number(r.id),
    version: Number(r.version),
    status: r.status,
    leadId: r.lead_id === null || r.lead_id === undefined ? null : Number(r.lead_id),
    draft,
    liveSlug: r.status === 'published' ? r.slug : null,
    slug: r.slug ?? null,
    publishedAt: r.published_at ?? null,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by ?? null,
  };
};

async function getPost(sql: Sql, id: number) {
  const rows = await sql`
    SELECT id, version, status, lead_id, draft, slug, published_at, updated_at, updated_by, title, excerpt, tags, image, image_alt, html
      FROM admin_posts WHERE id = ${id}`;
  return (rows[0] as (PostRow & Record<string, unknown>) | undefined) ?? null;
}

async function leadFor(sql: Sql, id: number | null) {
  if (!id) return null;
  const rows = await sql`
    SELECT id, created_at, won_at, full_name, business_name, address, services, facility_type, facility_size, message
      FROM leads WHERE id = ${id}`;
  return rows[0] ? ids(rows[0], 'id') : null;
}

async function listPosts(sql: Sql, env: AdminEnv) {
  const rows = await sql`
    SELECT id, version, status, lead_id, draft, slug, published_at, updated_at, updated_by, title, excerpt, tags, image, image_alt, html
      FROM admin_posts ORDER BY updated_at DESC LIMIT 500`;
  const posts = rows.map((r) => {
    const p = postOut(r);
    const rd = render(p.draft);
    return { ...p, draft: undefined, title: rd.title, address: rd.slug };
  });
  let site: { slug: string; title: string; pubDate: string }[] = [];
  try {
    const res = await env.ASSETS.fetch('https://assets.local/data/blog-posts.json');
    if (res.ok) {
      const all = (await res.json()) as { posts?: { slug: string; title: string; pub_date?: string; pubDate?: string }[] } | unknown[];
      const list = Array.isArray(all) ? all : (all as { posts?: unknown[] }).posts ?? [];
      site = (list as Record<string, unknown>[]).map((p) => ({
        slug: String(p.slug),
        title: String(p.title),
        pubDate: String(p.pub_date ?? p.pubDate ?? ''),
      }));
    }
  } catch {
    site = [];
  }
  return json({ posts, site });
}

async function createPost(sql: Sql, email: string, body: Record<string, unknown>) {
  let draft: Draft;
  const fromLead = Number(body.fromLead);
  if (Number.isSafeInteger(fromLead) && fromLead > 0) {
    // One post per job: starting again opens the one already there.
    const existing = await sql`SELECT id FROM admin_posts WHERE lead_id = ${fromLead} ORDER BY id DESC LIMIT 1`;
    if (existing[0]) return json({ post: postOut((await getPost(sql, Number(existing[0].id)))!), existing: true });
    const lead = await leadFor(sql, fromLead);
    if (!lead) return json({ error: 'no such job' }, 404);
    draft = draftFromLead({ ...(lead as Record<string, unknown>), id: fromLead } as Parameters<typeof draftFromLead>[0]);
  } else {
    draft = sanitizeDraft(body.draft);
  }
  // One post per job, enforced by the database (admin_posts_lead_idx is
  // unique): two "Start post" clicks at once make one post, and the second
  // opens it.
  const rows = await sql`
    INSERT INTO admin_posts (draft, lead_id, updated_by)
    VALUES (${JSON.stringify(draft)}::jsonb, ${draft.leadId}, ${email})
    ON CONFLICT (lead_id) WHERE lead_id IS NOT NULL DO NOTHING
    RETURNING id, version, status, lead_id, draft, slug, published_at, updated_at, updated_by, title, excerpt, tags, image, image_alt, html`;
  if (!rows[0]) {
    const existing = await sql`SELECT id FROM admin_posts WHERE lead_id = ${draft.leadId} LIMIT 1`;
    return json({ post: postOut((await getPost(sql, Number(existing[0].id)))!), existing: true });
  }
  return json({ post: postOut(rows[0]) }, 201);
}

async function savePost(sql: Sql, email: string, id: number, body: Record<string, unknown>) {
  const version = Number(body.version);
  if (!Number.isSafeInteger(version)) return json({ error: 'version required' }, 400);
  const draft = sanitizeDraft(body.draft);
  const rows = await sql`
    UPDATE admin_posts
       SET draft = ${JSON.stringify(draft)}::jsonb, version = version + 1, updated_at = now(), updated_by = ${email}
     WHERE id = ${id} AND version = ${version}
     RETURNING id, version, status, lead_id, draft, slug, published_at, updated_at, updated_by, title, excerpt, tags, image, image_alt, html`;
  if (rows[0]) return json({ post: postOut(rows[0]) });
  const current = await getPost(sql, id);
  if (!current) return json({ error: 'no such post' }, 404);
  return json({ error: 'changed elsewhere', post: postOut(current as unknown as Record<string, unknown>) }, 409);
}

async function deletePost(sql: Sql, id: number) {
  const rows = await sql`DELETE FROM admin_posts WHERE id = ${id} AND status = 'draft' RETURNING id`;
  if (rows[0]) return json({ ok: true });
  const current = await getPost(sql, id);
  return current ? json({ error: 'Take the post off the site before deleting it.' }, 409) : json({ error: 'no such post' }, 404);
}

/** Why a post cannot go live at this address, or null. */
export async function slugProblem(slug: string, env: AdminEnv, origin: string): Promise<string | null> {
  if (!slug || slugify(slug) !== slug) return 'The address can only hold lowercase letters, numbers and dashes.';
  if (RESERVED_SLUGS.has(slug)) return `/${slug}/ is kept for the site itself. Choose another address.`;
  // Anything the build answers — a page, a redirect — wins over a live post, so it may not be taken.
  const res = await env.ASSETS.fetch(new Request(`${origin}/${slug}/`, { redirect: 'manual' }));
  if (res.status < 400) return `/${slug}/ is already a page on the site. Choose another address.`;
  return null;
}

async function publishPost(sql: Sql, env: AdminEnv, email: string, id: number, body: Record<string, unknown>, origin: string, dbKey: string) {
  const version = Number(body.version);
  const live = body.live === true;
  const row = await getPost(sql, id);
  if (!row) return json({ error: 'no such post' }, 404);
  if (row.version !== version) return json({ error: 'changed elsewhere', post: postOut(row as unknown as Record<string, unknown>) }, 409);

  const draft = sanitizeDraft(row.draft);
  const r = render(draft);
  // Checked only to go live: taking a post off the site must always work,
  // however unfinished the draft is.
  if (live) {
    if (!r.title.trim()) return json({ error: 'The post needs a title.' }, 400);
    const problem = await slugProblem(r.slug, env, origin);
    if (problem) return json({ error: problem }, 400);
    if (!r.blocks.length) return json({ error: 'The post is empty.' }, 400);
  }
  const thumb = thumbFor(draft, r.blocks);
  const html = blocksToHtml(r.blocks, socialSlots(draft));
  let rows: Record<string, unknown>[];
  try {
    rows = await sql`
      UPDATE admin_posts SET
        status = ${live ? 'published' : 'draft'},
        slug = ${r.slug}, title = ${r.title}, excerpt = ${r.excerpt}, tags = ${r.tags},
        image = ${thumb?.url ?? null}, image_alt = ${thumb?.alt ?? null}, html = ${html},
        published_at = CASE WHEN ${live} THEN COALESCE(published_at, now()) ELSE published_at END,
        version = version + 1, updated_at = now(), updated_by = ${email}
      WHERE id = ${id} AND version = ${version}
      RETURNING id, version, status, lead_id, draft, slug, published_at, updated_at, updated_by, title, excerpt, tags, image, image_alt, html`;
  } catch (err) {
    if (/admin_posts_live_slug_idx|duplicate key/.test(String(err))) {
      return json({ error: `Another live post is already at /${r.slug}/. Choose another address.` }, 409);
    }
    throw err;
  }
  if (!rows[0]) {
    const current = await getPost(sql, id);
    return json({ error: 'changed elsewhere', post: current && postOut(current as unknown as Record<string, unknown>) }, 409);
  }
  forgetLive(dbKey);
  return json({ post: postOut(rows[0]), url: `${origin}/${r.slug}/` });
}

async function image(request: Request, env: AdminEnv) {
  if (!env.B2_KEY_ID || !env.B2_APP_KEY) {
    return json({ error: 'Uploads are not set up (B2_KEY_ID and B2_APP_KEY). Paste an image address instead.' }, 503);
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'expected a file' }, 400);
  }
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'expected a file' }, 400);
  const blob = file as File;
  if (!IMAGE_TYPES[blob.type]) return json({ error: 'JPEG, PNG, WebP, AVIF or GIF only.' }, 415);
  if (blob.size > MAX_IMAGE_BYTES) return json({ error: 'Images up to 10 MB.' }, 413);
  try {
    const url = await uploadImage(env, await blob.arrayBuffer(), blob.type, uploadKey(blob.name, blob.type));
    return json({ url }, 201);
  } catch (err) {
    console.error('admin: image upload failed', err);
    return json({ error: 'The upload failed. Try again, or paste an image address.' }, 502);
  }
}

// -------------------------------------------------------------- router ---

const readJson = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const v = await request.json();
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

export const isAdminPath = (pathname: string) =>
  pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/');

export async function handleAdmin(request: Request, env: AdminEnv): Promise<Response> {
  const url = new URL(request.url);
  const api = url.pathname.startsWith('/api/admin/');
  const who = await adminFor(request, env);
  if (!who.ok) return api ? json({ error: who.reason }, who.status) : deniedPage(who.status, who.reason);

  // The admin's pages are the build's own files, served only once signed in.
  if (!api) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method not allowed' }, 405);
    return withHeaders(await env.ASSETS.fetch(request));
  }

  if (!sameOrigin(request)) return json({ error: 'changes must come from the admin itself' }, 403);

  const dbUrl = databaseUrlFor(url.hostname, env);
  const database = databaseSecretFor(url.hostname) === 'DATABASE_URL' ? 'main' : 'staging';
  if (!dbUrl) return json({ error: `the ${database} database is not configured` }, 503);
  const sql = neon(dbUrl) as unknown as Sql;
  const dbKey = `${database}`;
  const path = url.pathname.slice('/api/admin'.length);
  const m = request.method;

  try {
    const f = await features(sql, dbKey);
    if (path === '/me' && m === 'GET') return json({ email: who.email, database, features: f });

    if (path === '/leads' && m === 'GET') return json(await listLeads(sql, f, url));
    if (path === '/leads.csv' && m === 'GET') return leadsCsv(sql, f);
    let id = intParam(path.match(/^\/leads\/(\d+)$/)?.[1] ?? null);
    if (id && m === 'PATCH') {
      if (!f.outcomes) return json({ error: MISSING.outcomes }, 409);
      return updateLead(sql, id, await readJson(request));
    }

    if (path === '/jobs' && m === 'GET') return listJobs(sql, f);
    id = intParam(path.match(/^\/jobs\/(\d+)\/skip$/)?.[1] ?? null);
    if (id && m === 'POST') {
      if (!f.skip) return json({ error: MISSING.posts }, 409);
      const skip = (await readJson(request)).skip === true;
      const rows = await sql`
        UPDATE leads SET post_skipped_at = CASE WHEN ${skip} THEN now() ELSE NULL END
         WHERE id = ${id} AND lead_status = 'won' RETURNING id, post_skipped_at`;
      return rows[0] ? json({ job: ids(rows[0], 'id') }) : json({ error: 'no such job' }, 404);
    }

    if (path === '/image' && m === 'POST') return image(request, env);

    if (path.startsWith('/posts') && !f.posts) return json({ error: MISSING.posts }, 409);
    if (path === '/posts' && m === 'GET') return listPosts(sql, env);
    if (path === '/posts' && m === 'POST') return createPost(sql, who.email, await readJson(request));
    id = intParam(path.match(/^\/posts\/(\d+)$/)?.[1] ?? null);
    if (id && m === 'GET') {
      const row = await getPost(sql, id);
      if (!row) return json({ error: 'no such post' }, 404);
      return json({ post: postOut(row as unknown as Record<string, unknown>), lead: await leadFor(sql, row.lead_id) });
    }
    if (id && m === 'PUT') return savePost(sql, who.email, id, await readJson(request));
    if (id && m === 'DELETE') {
      const res = await deletePost(sql, id);
      if (res.ok) forgetLive(dbKey);
      return res;
    }
    id = intParam(path.match(/^\/posts\/(\d+)\/publish$/)?.[1] ?? null);
    if (id && m === 'POST') return publishPost(sql, env, who.email, id, await readJson(request), url.origin, dbKey);

    return json({ error: 'not found' }, 404);
  } catch (err) {
    console.error('admin: request failed', m, path, err);
    return json({ error: 'The database request failed. Try again in a moment.' }, 500);
  }
}

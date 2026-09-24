/**
 * @vitest-environment node
 *
 * EVERY form on the site that accepts input is behind a captcha and a
 * honeypot, and posts somewhere real.
 *
 * WHAT THIS EXISTS TO CATCH. Two forms shipped the whole port with neither:
 * the blog comment form, on all 38 posts, and the testimonial form on
 * /reviews/. Both posted to `action="#"` — they validated in the browser,
 * reloaded the page, and threw the submission away. No error, no notice,
 * nothing stored, on the two forms most exposed to drive-by spam.
 *
 * The existing suite did not notice because every form assertion in it was
 * written against a form that already worked. Nothing asked the question the
 * other way round: is there a form here that nothing is guarding?
 *
 * So this test enumerates forms from the BUILT HTML rather than from a list
 * someone maintains. A new form added anywhere on the site is picked up
 * automatically and has to justify itself, which is the only version of this
 * check that stays true.
 *
 * GET FORMS ARE EXEMPT, and only GET forms. The two search forms submit a
 * query string to a static page: there is nothing to store, nothing to email,
 * and no cost to a bot running one. A captcha on them would be friction with
 * no threat behind it.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-forms');

type Form = {
  page: string;
  classes: string;
  method: string;
  action: string;
  postKind: string;
  endpoint: string;
  hasCaptcha: boolean;
  hasHoneypot: boolean;
};

let forms: Form[] = [];

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const attr = (attrs: string, name: string) =>
  attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '';

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  forms = walk(out).flatMap((file) => {
    const html = fs.readFileSync(file, 'utf8');
    return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map((m) => {
      const [, attrs, body] = m;
      const postKind = attr(attrs, 'data-post-kind');
      return {
        page: file.replace(out, '') || '/',
        classes: attr(attrs, 'class'),
        method: (attr(attrs, 'method') || 'get').toLowerCase(),
        action: attr(attrs, 'action'),
        postKind,
        endpoint: attr(attrs, 'data-endpoint') || (postKind ? '/api/submit-post' : ''),
        /* Turnstile's own markup, which `SpamGuard` renders. */
        hasCaptcha: /cf-turnstile/.test(attrs + body),
        hasHoneypot: /company-website|company_tax_id|website_trap/.test(body),
      };
    });
  });
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/** Anything that is not a plain GET search. */
const accepting = () => forms.filter((f) => f.method === 'post');

describe('every form that accepts a submission', () => {
  it('there are forms to check, on the pages expected', () => {
    /* A guard on the guard: a selector that silently matched nothing would
       make every assertion below vacuously true. */
    expect(accepting().length).toBeGreaterThanOrEqual(44);
    expect(new Set(accepting().map((f) => f.page)).size).toBeGreaterThanOrEqual(41);
  });

  it('carries a captcha', () => {
    const naked = accepting().filter((f) => !f.hasCaptcha);
    expect(
      naked.map((f) => `${f.page} (${f.classes})`),
      'a form takes input with nothing verifying the submitter'
    ).toEqual([]);
  });

  it('carries a honeypot', () => {
    const naked = accepting().filter((f) => !f.hasHoneypot);
    expect(naked.map((f) => `${f.page} (${f.classes})`)).toEqual([]);
  });

  it('posts to an endpoint that exists, never to action="#" alone', () => {
    /* `action="#"` stays in the markup — the handler calls preventDefault and
       it is the no-JS fallback — but it must never be the ONLY destination.
       That combination is exactly what dropped comments for the whole port. */
    const nowhere = accepting().filter((f) => !f.endpoint);
    expect(
      nowhere.map((f) => `${f.page} (${f.classes}) -> ${f.action}`),
      'this form discards what a visitor types'
    ).toEqual([]);

    for (const f of accepting()) {
      expect(['/api/submit-lead', '/api/submit-post'], f.page).toContain(f.endpoint);
    }
  });
});

describe('the two search forms', () => {
  it('are GET, and are the only forms without a captcha', () => {
    const get = forms.filter((f) => f.method !== 'post');
    expect(get.length).toBeGreaterThan(0);
    for (const f of get) {
      expect(f.action, f.page).toBe('/search/');
      expect(f.hasCaptcha, `${f.page} should not need one`).toBe(false);
    }
  });
});

describe('comments and testimonials are not leads', () => {
  it('post to /api/submit-post, never to the lead endpoint', () => {
    const posts = accepting().filter((f) => f.postKind);
    expect(posts.length).toBeGreaterThanOrEqual(39);
    for (const f of posts) expect(f.endpoint, f.page).toBe('/api/submit-post');
  });

  it('declares which kind it is, so the endpoint does not have to guess', () => {
    for (const f of accepting().filter((f) => f.postKind)) {
      expect(['comment', 'review'], f.page).toContain(f.postKind);
    }
  });

  it('the comment form names the post it belongs to', () => {
    const comments = accepting().filter((f) => f.postKind === 'comment');
    expect(comments).toHaveLength(38);
  });

  it('the lead forms are untouched and still post to /api/submit-lead', () => {
    const leads = accepting().filter((f) => !f.postKind);
    expect(leads).toHaveLength(5);
    for (const f of leads) expect(f.endpoint, f.page).toBe('/api/submit-lead');
  });
});

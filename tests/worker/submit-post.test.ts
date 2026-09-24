/**
 * @vitest-environment node
 *
 * POST /api/submit-post — the comment and testimonial endpoint.
 *
 * Called the same way `submit-lead.test.ts` calls its endpoint: the Worker's
 * entry point is a plain `fetch(request, env)`, so these build a real
 * `Request` and a hand-built `env`, with Neon replaced by a tagged-template
 * spy and `siteverify` stubbed. What that buys is the INSERT itself — the
 * column list and the bound values the Worker really issues — rather than
 * trust that a field named in the normaliser reached the database.
 *
 * THE TWO THINGS MOST WORTH PINNING HERE:
 *
 *   it writes to `submissions`, NOT to `leads`. A comment in the leads table
 *   would be emailed to the client as an enquiry to chase and counted in the
 *   one number their ad spend is judged on.
 *
 *   it is behind the SAME captcha gate as the lead endpoint. The gate was
 *   extracted into `captchaGuard` rather than copied, and these tests are
 *   what stop the two drifting apart — a second implementation would
 *   eventually differ, and the endpoint nobody was watching is the one that
 *   would lose its guard.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queries: { sql: string; values: unknown[] }[] = [];
let insertShouldThrow = false;

vi.mock('@neondatabase/serverless', () => ({
  neon: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (insertShouldThrow) return Promise.reject(new Error('relation "submissions" does not exist'));
    queries.push({ sql: strings.join('?'), values });
    return Promise.resolve([]);
  },
}));

const worker = (await import('../../src/worker')).default;

const ENV = {
  ASSETS: { fetch: async () => new Response('asset') } as unknown as Fetcher,
  DATABASE_URL: 'postgres://user:pw@example.neon.tech/evergreen',
  TURNSTILE_SECRET: 'a-real-looking-production-secret',
};

const PREVIEW = 'https://evergreencleaningservice.10xconnections.com';

const COMMENT = {
  kind: 'comment',
  post_slug: 'keep-your-office-at-home-clean',
  author_name: 'Jane Doe',
  author_email: 'jane@example.com',
  body: 'This helped, thank you.',
  captcha: 'a-token',
  page_url: `${PREVIEW}/keep-your-office-at-home-clean/`,
};

const REVIEW = {
  kind: 'review',
  author_name: 'Sam Patel',
  author_email: 'sam@example.com',
  business_title: 'Facilities Manager, Acme Dental',
  body: 'Reliable, thorough and easy to deal with.',
  captcha: 'a-token',
  page_url: `${PREVIEW}/reviews/`,
};

const captchaPasses = (hostname = 'evergreencleaningservice.10xconnections.com') =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (String(input).includes('siteverify')) return Response.json({ success: true, hostname });
    return Response.json({ id: 'email-id' });
  });

const post = (body: unknown, url = `${PREVIEW}/api/submit-post`) =>
  worker.fetch(
    new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-agent': 'test-agent' },
      body: JSON.stringify(body),
    }),
    ENV as never
  );

/** The single INSERT the Worker issued, as columns and bound values. */
function insert() {
  expect(queries).toHaveLength(1);
  const { sql, values } = queries[0];
  const columns = (sql.match(/INSERT INTO\s+\w+\s*\(([\s\S]*?)\)/)?.[1] ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return { sql, columns, values, at: (c: string) => values[columns.indexOf(c)] };
}

beforeEach(() => {
  queries.length = 0;
  insertShouldThrow = false;
  vi.restoreAllMocks();
});

describe('a comment', () => {
  it('is stored, and answers 200', async () => {
    captchaPasses();
    const res = await post(COMMENT);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('goes into `submissions`, never into `leads`', async () => {
    captchaPasses();
    await post(COMMENT);
    const { sql } = insert();
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('submissions');
    expect(sql).not.toContain('INTO leads');
  });

  it('retains what the visitor typed, and which post it was on', async () => {
    captchaPasses();
    await post(COMMENT);
    const { at } = insert();
    expect(at('kind')).toBe('comment');
    expect(at('post_slug')).toBe('keep-your-office-at-home-clean');
    expect(at('author_name')).toBe('Jane Doe');
    expect(at('author_email')).toBe('jane@example.com');
    expect(at('body')).toBe('This helped, thank you.');
    expect(at('user_agent')).toBe('test-agent');
  });

  it('never writes a status, so the column default (pending) stands', async () => {
    /* Moderation is the point of the table. An endpoint that could set the
       status is an endpoint that could publish. */
    captchaPasses();
    await post(COMMENT);
    const { columns, sql } = insert();
    expect(columns).not.toContain('status');
    expect(sql).not.toMatch(/\bstatus\b/);
  });

  it('sends no notification email — a comment is not an enquiry', async () => {
    const spy = captchaPasses();
    await post(COMMENT);
    const calls = spy.mock.calls.map((c) => String(c[0]));
    expect(calls.filter((u) => u.includes('resend'))).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('siteverify');
  });
});

describe('a testimonial', () => {
  it('is stored with its business title and no post slug', async () => {
    captchaPasses();
    const res = await post(REVIEW);
    expect(res.status).toBe(200);
    const { at } = insert();
    expect(at('kind')).toBe('review');
    expect(at('business_title')).toBe('Facilities Manager, Acme Dental');
    expect(at('post_slug')).toBeNull();
  });
});

describe('the same gate as the lead endpoint', () => {
  it('refuses a submission whose captcha fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ success: false, 'error-codes': ['invalid-input-response'] })
    );
    const res = await post(COMMENT);
    expect(res.status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('refuses a token solved on someone else’s host', async () => {
    captchaPasses('evil.example');
    const res = await post(COMMENT);
    expect(res.status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('refuses rather than failing open when siteverify is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const res = await post(COMMENT);
    expect(res.status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('refuses when no captcha secret is configured', async () => {
    captchaPasses();
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(COMMENT),
      }),
      { ...ENV, TURNSTILE_SECRET: undefined } as never
    );
    expect(res.status).toBe(503);
    expect(queries).toHaveLength(0);
  });

  it('swallows a honeypot hit: 200, nothing stored, no captcha call', async () => {
    const spy = captchaPasses();
    const res = await post({ ...COMMENT, 'company-website': 'http://spam.example' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(queries).toHaveLength(0);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('what it refuses to store', () => {
  it('answers 422 and names the fields', async () => {
    captchaPasses();
    const res = await post({ ...COMMENT, author_name: '', body: '' });
    expect(res.status).toBe(422);
    const json = (await res.json()) as { fields: string[] };
    expect(json.fields).toEqual(expect.arrayContaining(['author_name', 'body']));
    expect(queries).toHaveLength(0);
  });

  it('answers 422 for a comment with no post slug', async () => {
    captchaPasses();
    const res = await post({ ...COMMENT, post_slug: '' });
    expect(res.status).toBe(422);
    expect(queries).toHaveLength(0);
  });

  it('answers 503 rather than 200 when there is no database', async () => {
    /* The bug these forms had for the whole port was reporting success and
       discarding the submission. Not worth re-creating one layer down. */
    captchaPasses();
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(COMMENT),
      }),
      { ...ENV, DATABASE_URL: undefined } as never
    );
    expect(res.status).toBe(503);
  });

  it('answers 500 when the insert throws, never 200', async () => {
    captchaPasses();
    insertShouldThrow = true;
    const res = await post(COMMENT);
    expect(res.status).toBe(500);
  });

  it('answers 400 for a body that is not JSON', async () => {
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      ENV as never
    );
    expect(res.status).toBe(400);
  });

  it('answers 405 to anything but POST', async () => {
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-post`, { method: 'GET' }),
      ENV as never
    );
    expect(res.status).toBe(405);
  });
});

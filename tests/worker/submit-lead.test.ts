/**
 * @vitest-environment node
 *
 * Phase 3 — the backend accepts and retains the attribution fields.
 *
 * The Worker's entry point is a plain `fetch(request, env)`, so these tests
 * call it directly with a real `Request` and a hand-built `env`. Neon is
 * replaced by a tagged-template spy, which is what makes "retains" provable:
 * the test reads back the column list and the bound values of the INSERT the
 * Worker actually issues, rather than trusting that a field named in the
 * normaliser reached the database.
 *
 * What this does NOT prove is in TESTING.md: there is no Workers runtime
 * here, no Neon, and `siteverify` is stubbed.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Captures every tagged-template call the Worker makes. */
const queries: { sql: string; values: unknown[] }[] = [];
let insertShouldThrow = false;

vi.mock('@neondatabase/serverless', () => ({
  neon: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (insertShouldThrow) return Promise.reject(new Error('relation "leads" does not exist'));
    queries.push({ sql: strings.join('?'), values });
    return Promise.resolve([]);
  },
}));

const worker = (await import('../../src/worker')).default;
const { captcha } = await import('../../src/data/site');

const ENV = {
  ASSETS: { fetch: async () => new Response('asset') } as unknown as Fetcher,
  DATABASE_URL: 'postgres://user:pw@example.neon.tech/evergreen',
  TURNSTILE_SECRET: 'a-real-looking-production-secret',
};

const PREVIEW = 'https://evergreencleaningservice.10xconnections.com';

/** A body with everything a real submission from the site now carries. */
const FULL_BODY = {
  form_id: 'lp-commercial-cleaning-quote',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '416 555 0199',
  facility_type: 'Medical / dental clinic',
  size: '10,000–25,000 sq ft',
  captcha: 'a-token',
  page_url: `${PREVIEW}/contact-us/`,

  gclid: 'EAIaIQ1',
  gbraid: 'GB1',
  wbraid: 'WB1',
  msclkid: 'M1',
  gad_source: '1',
  gclsrc: 'aw.ds',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'gta-office',
  utm_term: 'office cleaning toronto',
  utm_content: 'ad1',
  utm_id: '17',
  landing_page: '/lp/commercial-cleaning/?gclid=EAIaIQ1',
  referrer: 'https://www.google.com/',
  touch_at: '2026-09-21T10:00:00.000Z',

  first_gclid: 'FIRST1',
  first_msclkid: 'FIRSTM1',
  first_utm_source: 'bing',
  first_utm_medium: 'organic',
  first_utm_campaign: 'brand',
  first_landing_page: '/services/',
  first_referrer: 'https://www.bing.com/',
  first_touch_at: '2026-08-01T09:00:00.000Z',
};

const post = (body: unknown, origin = PREVIEW, env: Partial<typeof ENV> = {}) =>
  worker.fetch(
    new Request(`${origin}/api/submit-lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
      body: JSON.stringify(body),
    }),
    { ...ENV, ...env } as never
  );

/** Every siteverify call succeeds unless a test says otherwise. */
const captchaPasses = (hostname = 'evergreencleaningservice.10xconnections.com') =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes('siteverify')) return Response.json({ success: true, hostname });
    return Response.json({ id: 'email-id' });
  });

/** Read the single INSERT the Worker issued, as columns and bound values. */
function insert() {
  expect(queries).toHaveLength(1);
  const { sql, values } = queries[0];
  const columns = sql
    .slice(sql.indexOf('(') + 1, sql.indexOf(')'))
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return { columns, values, byName: Object.fromEntries(columns.map((c, i) => [c, values[i]])) };
}

beforeEach(() => {
  queries.length = 0;
  insertShouldThrow = false;
  vi.restoreAllMocks();
});

describe('the attribution fields are accepted and retained', () => {
  it('every identifier the client sends reaches the INSERT, in the right column', async () => {
    captchaPasses();
    const res = await post(FULL_BODY);
    expect(res.status).toBe(200);

    const { columns, byName } = insert();
    /* One value per column — an off-by-one here would silently write the
       gclid into utm_source, which is exactly the kind of thing that is
       never noticed until a campaign report looks wrong. */
    expect(columns).toHaveLength(insert().values.length);

    expect(byName).toMatchObject({
      gclid: 'EAIaIQ1',
      gbraid: 'GB1',
      wbraid: 'WB1',
      msclkid: 'M1',
      gad_source: '1',
      gclsrc: 'aw.ds',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'gta-office',
      utm_term: 'office cleaning toronto',
      utm_content: 'ad1',
      utm_id: '17',
      landing_page: '/lp/commercial-cleaning/?gclid=EAIaIQ1',
      referrer: 'https://www.google.com/',
      touch_at: '2026-09-21T10:00:00.000Z',
      first_gclid: 'FIRST1',
      first_msclkid: 'FIRSTM1',
      first_utm_source: 'bing',
      first_utm_medium: 'organic',
      first_utm_campaign: 'brand',
      first_landing_page: '/services/',
      first_referrer: 'https://www.bing.com/',
      first_touch_at: '2026-08-01T09:00:00.000Z',
    });
  });

  it('names every column migration 0004 adds', async () => {
    captchaPasses();
    await post(FULL_BODY);
    const { columns } = insert();
    for (const column of [
      'gbraid',
      'wbraid',
      'msclkid',
      'gad_source',
      'gclsrc',
      'utm_term',
      'utm_content',
      'utm_id',
      'landing_page',
      'touch_at',
      'first_gclid',
      'first_msclkid',
      'first_utm_source',
      'first_utm_medium',
      'first_utm_campaign',
      'first_landing_page',
      'first_referrer',
      'first_touch_at',
    ]) {
      expect(columns).toContain(column);
    }
  });

  it('still stores a lead that carries no attribution at all', async () => {
    captchaPasses();
    const res = await post({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '416 555 0199',
      captcha: 'a-token',
    });
    expect(res.status).toBe(200);
    const { byName } = insert();
    expect(byName.gclid).toBe('');
    expect(byName.touch_at).toBeNull();
    expect(byName.first_touch_at).toBeNull();
  });
});

describe('the backend does not trust what the client sent', () => {
  it('strips markup and control characters from campaign values', async () => {
    captchaPasses();
    await post({
      ...FULL_BODY,
      utm_campaign: '<img src=x onerror="alert(1)">',
      utm_source: "go\u0000og'le",
      first_referrer: 'https://evil.example/`backtick`',
    });
    const { byName } = insert();
    expect(byName.utm_campaign).toBe('img src=x onerror=alert(1)');
    expect(byName.utm_source).toBe('go ogle');
    expect(byName.first_referrer).toBe('https://evil.example/backtick');
    for (const key of ['utm_campaign', 'utm_source', 'first_referrer']) {
      expect(String(byName[key])).not.toMatch(/[<>"'`]/);
    }
  });

  it('caps each field at its own length, independently of the client', async () => {
    captchaPasses();
    const long = 'x'.repeat(2000);
    await post({
      ...FULL_BODY,
      gclid: long,
      utm_source: long,
      gad_source: long,
      landing_page: long,
      utm_campaign: long,
    });
    const { byName } = insert();
    expect(String(byName.gclid)).toHaveLength(256);
    expect(String(byName.utm_source)).toHaveLength(150);
    expect(String(byName.gad_source)).toHaveLength(32);
    expect(String(byName.landing_page)).toHaveLength(500);
    expect(String(byName.utm_campaign)).toHaveLength(200);
  });

  it('drops an unparseable or impossible timestamp rather than failing the lead', async () => {
    captchaPasses();
    await post({ ...FULL_BODY, touch_at: 'yesterday', first_touch_at: '3026-01-01T00:00:00Z' });
    const { byName } = insert();
    expect(byName.touch_at).toBeNull();
    expect(byName.first_touch_at).toBeNull();
    /* and the lead is still stored */
    expect(byName.work_email).toBe('jane@example.com');
  });

  it('ignores a non-string identifier instead of coercing it', async () => {
    captchaPasses();
    await post({ ...FULL_BODY, gclid: { toString: 'nope' }, utm_source: 42 });
    const { byName } = insert();
    expect(byName.gclid).toBe('');
    expect(byName.utm_source).toBe('');
  });
});

describe('the endpoint still behaves as it did', () => {
  it('rejects a non-POST', async () => {
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-lead`, { method: 'GET' }),
      ENV as never
    );
    expect(res.status).toBe(405);
  });

  it('rejects a body that is not JSON', async () => {
    const res = await worker.fetch(
      new Request(`${PREVIEW}/api/submit-lead`, { method: 'POST', body: 'not json' }),
      ENV as never
    );
    expect(res.status).toBe(400);
  });

  it.each([
    ['company_tax_id', 'x'],
    ['company-website', 'http://spam.example'],
    ['website_trap', 'anything'],
  ])('answers 200 and stores nothing for honeypot %s', async (field, value) => {
    captchaPasses();
    const res = await post({ ...FULL_BODY, [field]: value });
    expect(res.status).toBe(200);
    expect(queries).toHaveLength(0);
  });

  it('answers 403 when the captcha does not verify, and stores nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ success: false, 'error-codes': ['invalid-input-response'] })
    );
    const res = await post(FULL_BODY);
    expect(res.status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('answers 403 when no token was submitted at all', async () => {
    const fetchSpy = captchaPasses();
    const res = await post({ ...FULL_BODY, captcha: '' });
    expect(res.status).toBe(403);
    /* and does not waste a siteverify round trip on an empty token */
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(queries).toHaveLength(0);
  });

  it('answers 403 rather than failing open when siteverify is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    expect((await post(FULL_BODY)).status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('answers 503 with no captcha secret configured', async () => {
    captchaPasses();
    const res = await post(FULL_BODY, PREVIEW, { TURNSTILE_SECRET: undefined });
    expect(res.status).toBe(503);
    expect(queries).toHaveLength(0);
  });

  it('answers 422 for missing required fields, naming them', async () => {
    captchaPasses();
    const res = await post({ captcha: 'a-token', email: 'jane@example.com' });
    expect(res.status).toBe(422);
    /* PHASE 9 CHANGED THIS ASSERTION, deliberately. It used to expect
       `['full_name', 'phone']`, because the endpoint required a name AND an
       email AND a phone. A valid email is now a complete way to reply, so a
       body carrying one is short of a name and nothing else. The rule and
       every case around it are in tests/worker/lead-validation.test.ts. */
    expect((await res.json()).fields).toEqual(['full_name']);
  });

  it('answers 422 for an email that is not one', async () => {
    captchaPasses();
    const res = await post({ ...FULL_BODY, email: 'jane@example' });
    expect(res.status).toBe(422);
  });

  it('answers 503 rather than 200 when no database is configured', async () => {
    captchaPasses();
    const res = await post(FULL_BODY, PREVIEW, { DATABASE_URL: undefined });
    expect(res.status).toBe(503);
  });

  it('answers 500 when the insert fails, and never reports success', async () => {
    captchaPasses();
    insertShouldThrow = true;
    const res = await post(FULL_BODY);
    expect(res.status).toBe(500);
  });

  it('passes anything that is not /api/submit-lead to the asset fetcher', async () => {
    const res = await worker.fetch(new Request(`${PREVIEW}/about-us/`), ENV as never);
    expect(await res.text()).toBe('asset');
  });

  it('refuses a published test secret on a production host', async () => {
    captchaPasses();
    for (const secret of [
      captcha.turnstile.testSecretKey,
      captcha.turnstile.failSecretKey,
      captcha.recaptcha.testSecretKey,
    ]) {
      queries.length = 0;
      const res = await post(FULL_BODY, 'https://www.evergreencleaningservice.ca', {
        TURNSTILE_SECRET: secret,
      });
      expect(res.status).toBe(503);
      expect(queries).toHaveLength(0);
    }
  });

  it('allows a test secret on the staging host, which is what it is for', async () => {
    /* Cloudflare's dummy siteverify reports example.com whatever host asked. */
    captchaPasses('example.com');
    const res = await post(FULL_BODY, PREVIEW, {
      TURNSTILE_SECRET: captcha.turnstile.testSecretKey,
    });
    expect(res.status).toBe(200);
  });
});

describe('Phase 4 — the token has to have been solved on one of our hostnames', () => {
  const PROD = 'https://www.evergreencleaningservice.ca';

  it('accepts a token solved on the host that was asked', async () => {
    captchaPasses('www.evergreencleaningservice.ca');
    expect((await post(FULL_BODY, PROD)).status).toBe(200);
    expect(queries).toHaveLength(1);
  });

  it('accepts the apex on the www host and vice versa', async () => {
    captchaPasses('evergreencleaningservice.ca');
    expect((await post(FULL_BODY, PROD)).status).toBe(200);
  });

  it.each([
    ['a host an attacker controls', 'evil.example'],
    ['a lookalike', 'www.evergreencleaningservice.ca.evil.example'],
    ['the staging host', 'evergreencleaningservice.10xconnections.com'],
    ["the test key's dummy hostname", 'example.com'],
    ['nothing at all', ''],
  ])('rejects a token solved on %s, and stores nothing', async (_label, hostname) => {
    captchaPasses(hostname);
    const res = await post(FULL_BODY, PROD, { TURNSTILE_SECRET: 'a-real-production-secret' });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'captcha failed' });
    expect(queries).toHaveLength(0);
  });

  it('rejects a production token replayed at staging', async () => {
    captchaPasses('www.evergreencleaningservice.ca');
    const res = await post(FULL_BODY, PREVIEW, { TURNSTILE_SECRET: 'a-real-production-secret' });
    expect(res.status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('a missing hostname is treated as a mismatch, not waved through', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
      String(input).includes('siteverify')
        ? Response.json({ success: true })
        : Response.json({ id: 'email-id' })
    );
    expect((await post(FULL_BODY, PROD)).status).toBe(403);
    expect(queries).toHaveLength(0);
  });

  it('a rejected hostname never reaches Neon or Resend', async () => {
    const fetchSpy = captchaPasses('evil.example');
    await post(FULL_BODY, PROD, { TURNSTILE_SECRET: 'a-real-production-secret' });
    expect(queries).toHaveLength(0);
    /* one call: siteverify. No Resend. */
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain('siteverify');
  });
});

describe('marketing consent reaches the row truthfully', () => {
  /**
   * CASL puts the burden of proving express consent on the sender, so the
   * failure that matters here is a FALSE POSITIVE: a row claiming a consent
   * nobody gave. Every case below is a way that has happened in real code.
   */
  it('stores true and the exact wording when the box was ticked', async () => {
    captchaPasses();
    await post({
      ...FULL_BODY,
      marketing_consent: 'yes',
      consent_text: 'Email me occasional cleaning tips and offers from Evergreen Office Cleaning.',
    });
    const { byName } = insert();
    expect(byName.marketing_consent).toBe(true);
    expect(String(byName.consent_text)).toContain('Evergreen Office Cleaning');
  });

  it('stores false when the box was left alone and nothing was sent', async () => {
    /* An unticked checkbox posts NOTHING. Absent has to read as "no". */
    captchaPasses();
    await post(FULL_BODY);
    const { byName } = insert();
    expect(byName.marketing_consent).toBe(false);
    expect(byName.consent_text).toBeNull();
  });

  it('does not let the string "false" become a yes', async () => {
    /* `Boolean("false")` is true — one line of JavaScript away from turning
       every declined consent into a granted one. */
    captchaPasses();
    await post({ ...FULL_BODY, marketing_consent: 'false' });
    expect(insert().byName.marketing_consent).toBe(false);
  });

  it.each(['no', '0', 'off', '', 'maybe', 'null'])('treats %s as no consent', async (value) => {
    captchaPasses();
    await post({ ...FULL_BODY, marketing_consent: value });
    expect(insert().byName.marketing_consent).toBe(false);
  });

  it('keeps no wording for a consent that was not given', async () => {
    /* Storing the text beside a false would read, later, as a record of
       something that did not happen. */
    captchaPasses();
    await post({ ...FULL_BODY, marketing_consent: 'no', consent_text: 'Email me offers.' });
    const { byName } = insert();
    expect(byName.marketing_consent).toBe(false);
    expect(byName.consent_text).toBeNull();
  });
});

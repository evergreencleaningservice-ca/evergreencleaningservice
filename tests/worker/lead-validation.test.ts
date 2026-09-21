/**
 * @vitest-environment node
 *
 * Phase 9 — the endpoint agrees with the form about what a lead is.
 *
 * A short form is only short if the server accepts what it sends. Before this
 * phase `/api/submit-lead` required a name AND an email AND a phone, so a
 * visitor who gave a phone number and no email would have been refused by the
 * backend after the browser had already let them through — the worst possible
 * shape of failure, because the lead is lost after the visitor believed they
 * had sent it.
 *
 * Two levels here. `leadProblems` is the rule itself, tested directly because
 * it is where the decision lives. Then the Worker, end to end with Neon and
 * siteverify stubbed, because a rule that is right in a module and unused in
 * the handler is worth nothing.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { leadProblems, looksLikeEmail, looksLikePhone, normalizeLead } from '../../src/lib/lead-fields';

/* --- the rule ------------------------------------------------------------- */

const lead = (over: Record<string, unknown> = {}) =>
  normalizeLead({ name: 'Dana', business_name: 'Placeholder Holdings Inc', ...over });

describe('leadProblems — a name, and one way to reply', () => {
  it('accepts a phone number with no email', () => {
    expect(leadProblems(lead({ phone: '416 555 0142' }))).toEqual([]);
  });

  it('accepts an email with no phone number', () => {
    expect(leadProblems(lead({ email: 'dana@placeholder.example' }))).toEqual([]);
  });

  it('accepts both', () => {
    expect(
      leadProblems(lead({ phone: '416 555 0142', email: 'dana@placeholder.example' }))
    ).toEqual([]);
  });

  it('refuses neither, and says which rule failed', () => {
    expect(leadProblems(lead())).toEqual(['contact']);
  });

  it('refuses a missing name', () => {
    expect(leadProblems(lead({ name: '', phone: '416 555 0142' }))).toEqual(['full_name']);
  });

  it('refuses a malformed contact method even when the other is absent', () => {
    expect(leadProblems(lead({ email: 'dana@' }))).toEqual(['work_email', 'contact']);
    expect(leadProblems(lead({ phone: '12' }))).toEqual(['phone', 'contact']);
  });

  it('refuses a malformed one even when the other is valid', () => {
    /* A typo is worth reporting: the visitor meant to give both, and a
       silently dropped address is a reply that never arrives. */
    expect(leadProblems(lead({ phone: '416 555 0142', email: 'dana@' }))).toEqual(['work_email']);
  });

  it('never requires an address', () => {
    expect(leadProblems(lead({ phone: '416 555 0142', address: '' }))).toEqual([]);
  });

  it('never requires a business name, a service or a message', () => {
    const bare = normalizeLead({ name: 'Dana', phone: '416 555 0142' });
    expect(leadProblems(bare)).toEqual([]);
  });
});

describe('the shape checks are permissive on purpose', () => {
  it.each([
    '416 555 0142',
    '+1 (416) 803-4880',
    '4168034880',
    '416-803-4880 x221',
    '(416) 803 4880',
  ])('accepts %s as a phone number', (value) => {
    expect(looksLikePhone(value)).toBe(true);
  });

  it.each(['', '123', '416-555', 'call me', 'M5V 1Z4'])('rejects %s', (value) => {
    expect(looksLikePhone(value)).toBe(false);
  });

  it('does not mistake a size range for a phone number', () => {
    /* The regression this replaced: a seven-digits-anywhere heuristic matched
       "10,000–25,000 sq ft" and classified it as a telephone number. */
    expect(looksLikePhone('10,000')).toBe(false);
  });

  it.each(['dana@placeholder.example', 'a.b+c@sub.example.co.uk'])('accepts %s', (value) => {
    expect(looksLikeEmail(value)).toBe(true);
  });

  it.each(['dana@', '@example.com', 'dana@example', 'dana example.com', ''])(
    'rejects %s',
    (value) => {
      expect(looksLikeEmail(value)).toBe(false);
    }
  );
});

/* --- the endpoint --------------------------------------------------------- */

const queries: { sql: string; values: unknown[] }[] = [];

vi.mock('@neondatabase/serverless', () => ({
  neon: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    queries.push({ sql: strings.join('?'), values });
    return Promise.resolve([]);
  },
}));

const worker = (await import('../../src/worker')).default;

const PREVIEW = 'https://evergreencleaningservice.10xconnections.com';
const ENV = {
  ASSETS: { fetch: async () => new Response('asset') } as unknown as Fetcher,
  DATABASE_URL: 'postgres://user:pw@example.neon.tech/evergreen',
  TURNSTILE_SECRET: 'a-real-looking-production-secret',
};

const post = (body: unknown) =>
  worker.fetch(
    new Request(`${PREVIEW}/api/submit-lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
      body: JSON.stringify(body),
    }),
    ENV as never
  );

const captchaPasses = () =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (String(input).includes('siteverify'))
      return Response.json({
        success: true,
        hostname: 'evergreencleaningservice.10xconnections.com',
      });
    return Response.json({ id: 'email-id' });
  });

/** What the short form actually sends, with placeholder values. */
const QUICK = {
  form_id: 'quick-quote',
  name: 'Dana',
  business_name: 'Placeholder Holdings Inc',
  phone: '416 555 0142',
  email: '',
  address: 'M5V 1Z4',
  services: 'Office cleaning & janitorial',
  message: '',
  captcha: 'a-token',
  page_url: `${PREVIEW}/request-a-quote/`,
};

const byName = () => {
  expect(queries).toHaveLength(1);
  const { sql, values } = queries[0];
  const columns = sql
    .slice(sql.indexOf('(') + 1, sql.indexOf(')'))
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return Object.fromEntries(columns.map((c, i) => [c, values[i]]));
};

beforeEach(() => {
  queries.length = 0;
  vi.restoreAllMocks();
});

describe('/api/submit-lead accepts what the short form sends', () => {
  it('stores a phone-only lead', async () => {
    captchaPasses();
    const res = await post(QUICK);

    expect(res.status).toBe(200);
    expect(byName()).toMatchObject({
      form_id: 'quick-quote',
      full_name: 'Dana',
      business_name: 'Placeholder Holdings Inc',
      phone: '416 555 0142',
      work_email: '',
      address: 'M5V 1Z4',
      services: 'Office cleaning & janitorial',
    });
  });

  it('stores an email-only lead', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, phone: '', email: 'dana@placeholder.example' });

    expect(res.status).toBe(200);
    expect(byName()).toMatchObject({ phone: '', work_email: 'dana@placeholder.example' });
  });

  it('stores a lead with no address at all', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, address: '' });

    expect(res.status).toBe(200);
    expect(byName()).toMatchObject({ address: '' });
  });

  it('refuses a lead with no way to reply, and names the rule', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, phone: '', email: '' });

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ fields: ['contact'] });
    expect(queries).toHaveLength(0);
  });

  it('refuses a malformed email and names the field', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, email: 'dana@' });

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ fields: ['work_email'] });
    expect(queries).toHaveLength(0);
  });

  it('refuses a missing name', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, name: '' });

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ fields: ['full_name'] });
  });

  it('answers a honeypot hit like a success, and stores nothing', async () => {
    captchaPasses();
    const res = await post({ ...QUICK, 'company-website': 'http://spam.example' });

    expect(res.status).toBe(200);
    expect(queries).toHaveLength(0);
  });
});

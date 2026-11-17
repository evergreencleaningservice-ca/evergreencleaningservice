/**
 * @vitest-environment node
 *
 * Failure logs keep their diagnostic context and carry no customer values.
 * Workers observability retains console output, so a lead's email, name or
 * phone in an error line is stored outside the leads table.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

let insertError: Error | null = null;
vi.mock('@neondatabase/serverless', () => ({
  neon: () => () => (insertError ? Promise.reject(insertError) : Promise.resolve([])),
}));

const worker = (await import('../../src/worker')).default;
const { captcha } = await import('../../src/data/site');

const SECRET = captcha.provider === 'turnstile' ? 'TURNSTILE_SECRET' : 'RECAPTCHA_SECRET';
const HOST = 'https://stage.evergreencleaningservice.ca';
const PII = ['pii.person@synthetic.test', 'Synthetic Person', '416 555 0123', 'synthetic-message-text'];
const RESEND_SECRET = 're_synthetic_secret_value';
const DB = 'postgres://user:dbpassword-synthetic@staging.example.neon.tech/evergreen';

const env = (extra: Record<string, unknown> = {}) =>
  ({
    ASSETS: { fetch: async () => new Response('asset') },
    STAGING_DATABASE_URL: DB,
    [SECRET]: 'a-real-looking-production-secret',
    ...extra,
  }) as never;

const post = (path: string, e: never) =>
  worker.fetch(
    new Request(`${HOST}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        form_id: 'f', name: PII[1], email: PII[0], phone: PII[2], message: PII[3],
        author_name: PII[1], author_email: PII[0], body: PII[3], kind: 'comment', post_slug: 'x',
        captcha: 'tok',
      }),
    }),
    e
  );

const logged = (spies: ReturnType<typeof vi.spyOn>[]) => JSON.stringify(spies.flatMap((s) => s.mock.calls));

let spies: ReturnType<typeof vi.spyOn>[];
beforeEach(() => {
  insertError = null;
  vi.restoreAllMocks();
  spies = (['log', 'warn', 'error'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}));
});

const verifyOk = (resend: () => Response = () => Response.json({ id: 'e1' })) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    String(input).includes('siteverify')
      ? Response.json({ success: true, hostname: 'stage.evergreencleaningservice.ca' })
      : resend()
  );

const expectClean = () => {
  const out = logged(spies);
  for (const v of [...PII, RESEND_SECRET, 'dbpassword-synthetic']) expect(out).not.toContain(v);
};

describe('submit-lead failure logs', () => {
  it('missing database: still names the secret and host, not the email', async () => {
    verifyOk();
    const res = await post('/api/submit-lead', env({ STAGING_DATABASE_URL: undefined }));
    expect(res.status).toBe(503);
    expect(logged(spies)).toContain('STAGING_DATABASE_URL');
    expect(logged(spies)).toContain('stage.evergreencleaningservice.ca');
    expectClean();
  });

  it('insert failure: error class and code logged, driver message (which may echo values) is not', async () => {
    verifyOk();
    insertError = Object.assign(new Error(`bad value ${PII[0]} ${PII[1]} ${DB}`), { name: 'NeonDbError', code: '23505' });
    const res = await post('/api/submit-lead', env());
    expect(res.status).toBe(500);
    expect(logged(spies)).toContain('NeonDbError:23505');
    expectClean();
  });

  it('Resend rejection: status and error name logged, body that quotes the address is not', async () => {
    verifyOk(() =>
      Response.json({ name: 'validation_error', message: `Invalid to ${PII[0]} key ${RESEND_SECRET}` }, { status: 422 })
    );
    const res = await post(
      '/api/submit-lead',
      env({ RESEND_API_KEY: RESEND_SECRET, LEAD_NOTIFY_FROM: 'a@b.test', STAGING_LEAD_NOTIFY_TO: 'c@d.test', LEAD_NOTIFY_TO: 'c@d.test' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(logged(spies)).toContain('validation_error');
    expect(logged(spies)).toContain('422');
    expectClean();
  });

  it('Resend unreachable: still 200, error not echoed', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('siteverify'))
        return Response.json({ success: true, hostname: 'stage.evergreencleaningservice.ca' });
      throw Object.assign(new Error(`connect failed for ${PII[0]}`), { name: 'TypeError' });
    });
    const res = await post(
      '/api/submit-lead',
      env({ RESEND_API_KEY: RESEND_SECRET, LEAD_NOTIFY_FROM: 'a@b.test', STAGING_LEAD_NOTIFY_TO: 'c@d.test', LEAD_NOTIFY_TO: 'c@d.test' })
    );
    expect(res.status).toBe(200);
    expectClean();
  });

  it('success is unchanged', async () => {
    verifyOk();
    const res = await post('/api/submit-lead', env());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe('submit-post failure logs', () => {
  it('missing database and failed insert carry no submitted values', async () => {
    verifyOk();
    expect((await post('/api/submit-post', env({ STAGING_DATABASE_URL: undefined }))).status).toBe(503);
    insertError = Object.assign(new Error(`dup ${PII[0]}`), { name: 'NeonDbError', code: '22001' });
    expect((await post('/api/submit-post', env())).status).toBe(500);
    expect(logged(spies)).toContain('NeonDbError:22001');
    expectClean();
  });
});

describe('allowlists do not echo provider-controlled name or code', () => {
  it('hostile error name/code (even short, punctuation-free) never reach the log', async () => {
    verifyOk();
    insertError = Object.assign(new Error('x'), { name: 'pii.person.synthetic.test', code: 'Synthetic Person' });
    expect((await post('/api/submit-lead', env())).status).toBe(500);
    insertError = Object.assign(new Error('x'), { name: 'SyntheticPerson', code: 'pii4160123' });
    expect((await post('/api/submit-post', env())).status).toBe(500);
    const out = logged(spies);
    for (const v of ['synthetic', 'Synthetic', 'pii', '4160123']) expect(out).not.toContain(v);
    expect(out).toContain('insert failed","Error"');
    expectClean();
  });

  it('hostile Resend error name is replaced, response unchanged', async () => {
    verifyOk(() => Response.json({ name: 'pii.person@synthetic.test', message: 'm' }, { status: 422 }));
    const res = await post(
      '/api/submit-lead',
      env({ RESEND_API_KEY: RESEND_SECRET, LEAD_NOTIFY_FROM: 'a@b.test', STAGING_LEAD_NOTIFY_TO: 'c@d.test', LEAD_NOTIFY_TO: 'c@d.test' })
    );
    expect(res.status).toBe(200);
    expect(logged(spies)).toContain('unknown');
    expectClean();
    expect(logged(spies)).not.toContain('synthetic');
  });
});

/**
 * @vitest-environment node
 *
 * Phase 9 closeout — the notification email for a lead with no email address.
 *
 * THE DEFECT. `notify()` sent `reply_to: lead.work_email` unconditionally.
 * That was correct for exactly as long as the endpoint required an email on
 * every lead, which it did until Phase 9 made a phone number sufficient. From
 * then on a phone-only lead would have sent `reply_to: ""`, which is not an
 * email address — and a notification Resend refuses is a lead sitting in the
 * database that nobody is told about.
 *
 * It had never executed: Resend is not configured on staging or anywhere else,
 * so `notify()` has only ever hit its "not configured" branch. A bug that has
 * never run is still a bug, and this one would have fired on the first real
 * phone-only enquiry after launch.
 *
 * Two levels, because the defect lived between them. `notificationPayload` is
 * the decision and is tested directly. Then the Worker end to end, with Neon
 * and `siteverify` stubbed, reading the actual bytes sent to Resend — because
 * a correct builder that the handler does not call is worth nothing, and the
 * handler calling it wrongly is exactly the class of mistake being fixed.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CORE_FIELDS,
  NOT_SUPPLIED,
  formatSentAt,
  notificationPayload,
  notificationText,
  notifyRecipientFor,
} from '../../src/lib/notification';
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../../src/data/site';
import { normalizeLead } from '../../src/lib/lead-fields';

const FROM = 'leads@send.example';
const TO = 'info@evergreencleaningservice.ca';

const lead = (over: Record<string, unknown> = {}) =>
  normalizeLead({
    name: 'Dana',
    business_name: 'Placeholder Holdings Inc',
    address: 'M5V 1Z4',
    services: 'Office cleaning & janitorial',
    ...over,
  }) as unknown as Record<string, string>;

/* --- 1. the decision ------------------------------------------------------ */

describe('reply_to is present only when there is an address to reply to', () => {
  it('omits the key entirely for a phone-only lead', () => {
    const payload = notificationPayload(lead({ phone: '416 555 0142' }), FROM, TO);

    /* Not '', not null, not undefined, not a placeholder. Absent. */
    expect('reply_to' in payload).toBe(false);
    expect(Object.keys(payload).sort()).toEqual(['from', 'subject', 'text', 'to']);
  });

  it('survives the JSON round trip without reappearing', () => {
    /* `JSON.stringify` drops an undefined value but keeps an empty string, so
       the only way to be sure is to read back the bytes that would be sent. */
    const wire = JSON.parse(
      JSON.stringify(notificationPayload(lead({ phone: '416 555 0142' }), FROM, TO))
    );
    expect('reply_to' in wire).toBe(false);
  });

  it('keeps the address for an email-only lead', () => {
    const payload = notificationPayload(lead({ email: 'dana@placeholder.example' }), FROM, TO);
    expect(payload.reply_to).toBe('dana@placeholder.example');
  });

  it('keeps the address when both are supplied', () => {
    const payload = notificationPayload(
      lead({ phone: '416 555 0142', email: 'dana@placeholder.example' }),
      FROM,
      TO
    );
    expect(payload.reply_to).toBe('dana@placeholder.example');
  });

  it.each(['', '   ', '\t'])('treats %j as no address at all', (value) => {
    expect('reply_to' in notificationPayload(lead({ email: value }), FROM, TO)).toBe(false);
  });

  it('refuses an address that is not one, rather than passing it on', () => {
    /* `leadProblems` already rejects these before an insert, so this is the
       second line: if a malformed address ever reached the database — a
       hand-written row, a future import — the notification still cannot carry
       a value Resend will refuse. */
    for (const bad of ['dana@', '@example.com', 'dana example.com', 'dana@example']) {
      expect('reply_to' in notificationPayload(lead({ email: bad }), FROM, TO)).toBe(false);
    }
  });
});

describe('the payload is always well formed', () => {
  const cases = [
    ['phone only', { phone: '416 555 0142' }],
    ['email only', { email: 'dana@placeholder.example' }],
    ['both', { phone: '416 555 0142', email: 'dana@placeholder.example' }],
    ['neither — should never reach here, but must not produce nonsense', {}],
    ['a long message', { phone: '416 555 0142', message: 'x'.repeat(4000) }],
  ] as const;

  it.each(cases)('%s', (_name, over) => {
    const payload = notificationPayload(lead(over), FROM, TO);

    expect(payload.from).toBe(FROM);
    expect(payload.to).toEqual([TO]);
    expect(typeof payload.subject).toBe('string');
    expect(payload.subject.length).toBeGreaterThan(0);
    expect(typeof payload.text).toBe('string');

    /* Every key Resend is given is one it accepts, and no key holds a value
       of the wrong kind. */
    for (const [key, value] of Object.entries(payload)) {
      expect(['from', 'to', 'subject', 'text', 'reply_to']).toContain(key);
      expect(value).not.toBeNull();
      expect(value).not.toBeUndefined();
      if (key === 'to') expect(Array.isArray(value)).toBe(true);
      else expect(typeof value).toBe('string');
      if (typeof value === 'string') expect(value).not.toBe('');
    }
  });
});

/* --- 2. the body ---------------------------------------------------------- */

describe('the message body', () => {
  const SENT = new Date('2026-09-30T14:50:14Z');

  it('is exactly the requested shape for a quote-form lead', () => {
    const text = notificationText(
      lead({
        name: 'test',
        phone: '6471112233',
        email: 'test@test.com',
        address: '',
        services: 'Office Cleaning',
        form_id: 'lp-commercial-cleaning-quote',
        page_url: 'https://stage.evergreencleaningservice.ca/lp/commercial-cleaning-quote/',
        landing_page: '/lp/commercial-cleaning-quote/',
        referrer: 'https://tagassistant.google.com/',
        touch_at: '2026-09-30T14:50:14.407Z',
      }),
      SENT
    );

    expect(text).toBe(
      [
        'Name: test',
        'Phone: 6471112233',
        'Email: test@test.com',
        'Service: Office Cleaning',
        '',
        'Page URL: https://stage.evergreencleaningservice.ca/lp/commercial-cleaning-quote/',
        'Time Sent: September 30, 2026 at 10:50 AM EDT',
      ].join('\n')
    );
  });

  it('leaves out form_id, landing page, referrer, touch times and attribution', () => {
    const text = notificationText(
      lead({
        phone: '416 555 0142',
        form_id: 'quick-quote',
        landing_page: '/lp/x/',
        referrer: 'https://www.google.com/',
        touch_at: '2026-09-30T14:50:14.407Z',
        first_touch_at: '2026-09-30T14:50:14.407Z',
        gclid: 'P9TEST',
        utm_source: 'google',
      }),
      SENT
    );
    for (const gone of ['form_id', 'landing_page', 'referrer', 'touch_at', 'gclid', 'utm_source', 'P9TEST']) {
      expect(text).not.toContain(gone);
    }
  });

  it('shows Address and Details only when the visitor filled them in', () => {
    const empty = notificationText(lead({ phone: '416 555 0142', address: '' }), SENT);
    expect(empty).not.toContain('Address:');
    expect(empty).not.toContain('Details:');

    const filledIn = notificationText(
      lead({ phone: '416 555 0142', address: '100 King St W', message: 'Two floors, nightly.' }),
      SENT
    );
    expect(filledIn).toContain('Address: 100 King St W');
    expect(filledIn).toContain('Details: Two floors, nightly.');
  });

  it('shows (not supplied) for a missing email on a phone-only lead', () => {
    const text = notificationText(lead({ phone: '416 555 0142' }), SENT);

    expect(text).toContain('Phone: 416 555 0142');
    expect(text).toContain(`Email: ${NOT_SUPPLIED}`);
    expect(text).toContain('Service: Office cleaning & janitorial');
  });

  it('shows (not supplied) for a missing phone on an email-only lead', () => {
    const text = notificationText(lead({ email: 'dana@placeholder.example' }), SENT);

    expect(text).toContain(`Phone: ${NOT_SUPPLIED}`);
    expect(text).toContain('Email: dana@placeholder.example');
  });

  it('lists every core field, the page and the time even when the lead is nearly empty', () => {
    const text = notificationText(normalizeLead({ name: 'Dana' }) as unknown as Record<string, string>, SENT);
    for (const [, label] of CORE_FIELDS) expect(text).toContain(`${label}:`);
    expect(CORE_FIELDS).toHaveLength(4);
    expect(text).toContain(`Page URL: ${NOT_SUPPLIED}`);
    expect(text).toContain('Time Sent: ');
  });

  it('gives the time sent in Toronto time, winter and summer', () => {
    expect(formatSentAt(new Date('2026-09-30T14:50:14Z'))).toBe('September 30, 2026 at 10:50 AM EDT');
    expect(formatSentAt(new Date('2026-01-15T17:05:00Z'))).toBe('January 15, 2026 at 12:05 PM EST');
  });

  it('never prints the word undefined', () => {
    expect(notificationText(lead({ phone: '416 555 0142' }))).not.toContain('undefined');
  });
});

/* --- 3. the handler, end to end ------------------------------------------- */

const queries: { sql: string; values: unknown[] }[] = [];

vi.mock('@neondatabase/serverless', () => ({
  neon: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    queries.push({ sql: strings.join('?'), values });
    return Promise.resolve([]);
  },
}));

const worker = (await import('../../src/worker')).default;

const PREVIEW = 'https://stage.evergreencleaningservice.ca';
const ENV = {
  ASSETS: { fetch: async () => new Response('asset') } as unknown as Fetcher,
  DATABASE_URL: 'postgres://user:pw@example.neon.tech/evergreen',
  STAGING_DATABASE_URL: 'postgres://user:pw@staging.example.neon.tech/evergreen',
  TURNSTILE_SECRET: 'a-real-looking-production-secret',
  RECAPTCHA_SECRET: 'a-real-looking-production-secret',
  RESEND_API_KEY: 're_test_key',
  LEAD_NOTIFY_TO: TO,
  LEAD_NOTIFY_FROM: FROM,
};

const QUICK = {
  form_id: 'quick-quote',
  name: 'Dana',
  business_name: 'Placeholder Holdings Inc',
  phone: '416 555 0142',
  email: '',
  address: 'M5V 1Z4',
  services: 'Office cleaning & janitorial',
  captcha: 'a-token',
  page_url: `${PREVIEW}/request-a-quote/`,
};

const post = (body: unknown, env: Partial<typeof ENV> = {}) =>
  worker.fetch(
    new Request(`${PREVIEW}/api/submit-lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
      body: JSON.stringify(body),
    }),
    { ...ENV, ...env } as never
  );

/** Stub siteverify and Resend; `resend` decides what Resend answers. */
function stubNetwork(resend: () => Response, hostname = 'stage.evergreencleaningservice.ca') {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.includes('siteverify'))
      return Response.json({
        success: true,
        hostname,
      });
    if (url.includes('api.resend.com')) {
      calls.push({ url, body: JSON.parse(String((init as RequestInit).body)) });
      return resend();
    }
    return Response.json({});
  });
  return calls;
}

const ok = () => Response.json({ id: 'email-id' });

/** The stored row, by column name. */
function stored() {
  expect(queries).toHaveLength(1);
  const { sql, values } = queries[0];
  const columns = sql
    .slice(sql.indexOf('(') + 1, sql.indexOf(')'))
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return Object.fromEntries(columns.map((c, i) => [c, values[i]]));
}

beforeEach(() => {
  queries.length = 0;
  vi.restoreAllMocks();
});

describe('the Worker sends what the builder built', () => {
  it('phone-only: stored, and the Resend body carries no reply_to', async () => {
    const sent = stubNetwork(ok);
    const res = await post(QUICK);

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({ phone: '416 555 0142', work_email: '' });

    expect(sent).toHaveLength(1);
    expect('reply_to' in sent[0].body).toBe(false);
    expect(sent[0].body.text).toContain(`Email: ${NOT_SUPPLIED}`);
    expect(sent[0].body.text).toContain('Phone: 416 555 0142');
  });

  it('email-only: stored, and the address is the reply_to', async () => {
    const sent = stubNetwork(ok);
    const res = await post({ ...QUICK, phone: '', email: 'dana@placeholder.example' });

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({ phone: '', work_email: 'dana@placeholder.example' });
    expect(sent[0].body.reply_to).toBe('dana@placeholder.example');
    expect(sent[0].body.text).toContain(`Phone: ${NOT_SUPPLIED}`);
  });

  it('both: both stored, and the address is the reply_to', async () => {
    const sent = stubNetwork(ok);
    const res = await post({ ...QUICK, email: 'dana@placeholder.example' });

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({
      phone: '416 555 0142',
      work_email: 'dana@placeholder.example',
    });
    expect(sent[0].body.reply_to).toBe('dana@placeholder.example');
    expect(sent[0].body.text).toContain('Phone: 416 555 0142');
    expect(sent[0].body.text).toContain('Email: dana@placeholder.example');
  });

  it('sends one Resend request per lead, to the configured pair', async () => {
    const sent = stubNetwork(ok);
    await post(QUICK);

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe('https://api.resend.com/emails');
    expect(sent[0].body).toMatchObject({ from: FROM, to: [TO] });
  });
});

describe('a failed notification never costs the lead', () => {
  it('Resend rejects the send: the row is still stored and the visitor gets 200', async () => {
    stubNetwork(() => new Response('{"message":"invalid reply_to"}', { status: 422 }));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await post(QUICK);

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({ full_name: 'Dana' });
    /* Rejected, but not silently — an earlier version swallowed this and a
       wrong API key looked exactly like success. */
    expect(error).toHaveBeenCalled();
  });

  it('the request to Resend throws: the row is still stored and the visitor gets 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('siteverify'))
        return Response.json({
          success: true,
          hostname: 'stage.evergreencleaningservice.ca',
        });
      throw new TypeError('network down');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await post(QUICK);

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({ full_name: 'Dana' });
    expect(error).toHaveBeenCalled();
  });

  it('Resend unconfigured: the row is still stored, nothing is sent, and it is logged', async () => {
    const sent = stubNetwork(ok);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await post(QUICK, { RESEND_API_KEY: undefined });

    expect(res.status).toBe(200);
    expect(stored()).toMatchObject({ full_name: 'Dana' });
    expect(sent).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });
});

/* --- who it goes to ------------------------------------------------------- */

const TESTER = 'tester@placeholder.example';

describe('notifyRecipientFor', () => {
  const env = { LEAD_NOTIFY_TO: TO, STAGING_LEAD_NOTIFY_TO: TESTER };

  it.each(PRODUCTION_HOSTS)('%s always uses LEAD_NOTIFY_TO', (host) => {
    expect(notifyRecipientFor(host, env)).toBe(TO);
  });

  it.each([PREVIEW_HOST, 'localhost', 'www.evergreencleaningservice.ca.evil.example'])(
    '%s uses STAGING_LEAD_NOTIFY_TO when set',
    (host) => {
      expect(notifyRecipientFor(host, env)).toBe(TESTER);
    }
  );

  it('staging falls back to LEAD_NOTIFY_TO when no staging address is set', () => {
    expect(notifyRecipientFor(PREVIEW_HOST, { LEAD_NOTIFY_TO: TO })).toBe(TO);
  });

  it('production never falls back to the staging address', () => {
    expect(notifyRecipientFor(PRODUCTION_HOSTS[0], { STAGING_LEAD_NOTIFY_TO: TESTER })).toBeUndefined();
  });
});

describe('the Worker sends each host to its own recipient', () => {
  const PROD = 'www.evergreencleaningservice.ca';
  const postTo = (origin: string, env: Partial<typeof ENV> & { STAGING_LEAD_NOTIFY_TO?: string }) =>
    worker.fetch(
      new Request(`${origin}/api/submit-lead`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
        body: JSON.stringify({ ...QUICK, page_url: `${origin}/request-a-quote/` }),
      }),
      { ...ENV, ...env } as never
    );

  it('a staging lead goes to STAGING_LEAD_NOTIFY_TO', async () => {
    const sent = stubNetwork(ok);
    const res = await postTo(PREVIEW, { STAGING_LEAD_NOTIFY_TO: TESTER });

    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].body.to).toEqual([TESTER]);
  });

  it('a www. lead still goes to LEAD_NOTIFY_TO with a staging address set', async () => {
    const sent = stubNetwork(ok, PROD);
    const res = await postTo(`https://${PROD}`, { STAGING_LEAD_NOTIFY_TO: TESTER });

    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].body.to).toEqual([TO]);
  });

  it('staging with only a staging address still sends', async () => {
    const sent = stubNetwork(ok);
    const res = await postTo(PREVIEW, { LEAD_NOTIFY_TO: undefined, STAGING_LEAD_NOTIFY_TO: TESTER });

    expect(res.status).toBe(200);
    expect(sent[0].body.to).toEqual([TESTER]);
  });

  it('www. with only a staging address sends nothing, and says so', async () => {
    const sent = stubNetwork(ok, PROD);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await postTo(`https://${PROD}`, { LEAD_NOTIFY_TO: undefined, STAGING_LEAD_NOTIFY_TO: TESTER });

    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
    expect(warn.mock.calls.flat().join(' ')).toContain('LEAD_NOTIFY_TO');
  });
});

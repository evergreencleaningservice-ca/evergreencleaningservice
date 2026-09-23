/**
 * Phase 2 — the conversion event fires once, after a stored lead, and never
 * otherwise.
 *
 * Every case below is one of the acceptance criteria, named as such. The
 * module under test is the one all three forms now import, so a pass here is
 * a pass for the two PPC landing pages and for the site's own quote and
 * contact forms at the same time — which is the point of there being one
 * module rather than three copies.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MESSAGES,
  captchaToken,
  pushLeadEvent,
  sanitizeEventParams,
  wireLeadForm,
} from '../src/lib/lead-submit';

/** A form shaped like the landing pages': required fields, honeypots, token. */
function buildForm({ token = 'turnstile-token', honeypot = '' } = {}) {
  document.body.innerHTML = `
    <form id="f" novalidate>
      <input name="fullName" value="Jane Doe" required />
      <input name="workEmail" type="email" value="jane@example.com" required />
      <input name="phone" value="416 555 0199" required />
      <select name="facilityType" required>
        <option value="Office" selected>Office</option>
      </select>
      <select name="facilitySize">
        <option value="10,000–25,000 sq ft" selected>10,000–25,000 sq ft</option>
      </select>
      <input name="company_tax_id" value="${honeypot}" />
      <input name="website_trap" value="" />
      <input type="hidden" name="cf-turnstile-response" value="${token}" />
      <button type="submit">Request Free Walkthrough</button>
    </form>`;
  return document.getElementById('f') as HTMLFormElement;
}

/** The hooks a page supplies, with the side effects recorded rather than done. */
function hooks(form: HTMLFormElement, over: Record<string, unknown> = {}) {
  const calls = { success: 0, honeypot: 0, errors: [] as string[] };
  return {
    calls,
    opts: {
      formId: 'ppc-lead-form',
      honeypots: ['company_tax_id', 'website_trap'],
      tokenWaitMs: 50,
      payload: () => ({
        form_id: 'ppc-lead-form',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '416 555 0199',
      }),
      eventParams: () => ({
        facility_type: 'Office',
        facility_size: '10,000–25,000 sq ft',
      }),
      onSuccess: () => {
        calls.success++;
      },
      onHoneypot: () => {
        calls.honeypot++;
      },
      onError: (_f: HTMLFormElement, message: string) => {
        calls.errors.push(message);
      },
      ...over,
    },
  };
}

const leadEvents = () =>
  (window.dataLayer ?? []).filter((e) => e.event === 'lead_form_submission');

/**
 * Submit and let the pipeline settle.
 *
 * 200ms clears the 50ms token deadline plus one 50ms poll, with room to
 * spare. Real time rather than fake timers because the pipeline interleaves
 * `setTimeout` with awaited `fetch`, and advancing fake timers through that
 * mix is more machinery than the wait costs.
 */
async function submit(form: HTMLFormElement, times = 1) {
  for (let i = 0; i < times; i++) form.dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 200));
}

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
const status = (code: number) => new Response(JSON.stringify({ error: 'no' }), { status: code });

beforeEach(() => {
  window.dataLayer = [];
  vi.restoreAllMocks();
});

describe('successful submission', () => {
  it('produces exactly one lead_form_submission', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
    expect(h.calls.success).toBe(1);
    expect(h.calls.errors).toEqual([]);
  });

  it('pushes the event after the response, not before', async () => {
    const order: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      order.push('fetch');
      return ok();
    });
    const form = buildForm();
    const h = hooks(form, {
      onSuccess: () => order.push('success'),
    });
    wireLeadForm(form, h.opts as never);

    const push = window.dataLayer!.push.bind(window.dataLayer);
    window.dataLayer!.push = ((e: Record<string, unknown>) => {
      order.push(String(e.event));
      return push(e);
    }) as typeof push;

    await submit(form);

    expect(order).toEqual(['fetch', 'lead_form_submission', 'success']);
  });

  it('accepts any 2xx, not only 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 202 }));
    const form = buildForm();
    wireLeadForm(form, hooks(form).opts as never);
    await submit(form);
    expect(leadEvents()).toHaveLength(1);
  });
});

describe('failures produce zero conversion events', () => {
  it('validation failure: no fetch, no event', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    (form.elements.namedItem('fullName') as HTMLInputElement).value = '';
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(h.calls.success).toBe(0);
  });

  it('captcha failure (403): no event, and the widget is reset', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const reset = vi.fn();
    window.turnstile = { reset };
    const form = buildForm();
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(h.calls.success).toBe(0);
    expect(h.calls.errors).toEqual([MESSAGES.captcha]);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it.each([400, 401, 404, 422, 429, 500, 502, 503])(
    'HTTP %i: no event, recoverable error shown',
    async (code) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(code));
      const form = buildForm();
      const h = hooks(form);
      wireLeadForm(form, h.opts as never);

      await submit(form);

      expect(leadEvents()).toHaveLength(0);
      expect(h.calls.success).toBe(0);
      expect(h.calls.errors).toEqual([MESSAGES.server]);
    }
  );

  it('network failure: no event', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const form = buildForm();
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(h.calls.errors).toEqual([MESSAGES.network]);
  });

  it('honeypot: no fetch, no event, no navigation hook', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm({ honeypot: 'http://spam.example' });
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(h.calls.honeypot).toBe(1);
    /* onSuccess is what navigates to /thank-you/, and /thank-you/ pushes
       lead_form_confirmed. A bot must not reach it. */
    expect(h.calls.success).toBe(0);
  });

  it('honeypot falls back to onSuccess only when no onHoneypot is given', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm({ honeypot: 'x' });
    const h = hooks(form, { onHoneypot: undefined });
    wireLeadForm(form, h.opts as never);
    await submit(form);
    expect(h.calls.success).toBe(1);
    expect(leadEvents()).toHaveLength(0);
  });
});

describe('duplicate submissions', () => {
  it('three rapid submits produce one request and one event', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form, 3);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
    expect(h.calls.success).toBe(1);
  });

  it('a submit that bypasses the button is still guarded', async () => {
    /* The disabled button does not cover Enter in a text field, which submits
       the form without touching it. The in-flight flag is what does. */
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((r) => setTimeout(() => r(ok()), 80))
    );
    const form = buildForm();
    wireLeadForm(form, hooks(form).opts as never);

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 60));
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 250));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('wiring the same form twice binds one pipeline', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    wireLeadForm(form, hooks(form).opts as never);
    wireLeadForm(form, hooks(form).opts as never);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('the default submit action is always prevented', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    wireLeadForm(form, hooks(form).opts as never);
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    /* Let the pipeline settle inside this test. Left running, it reaches the
       real fetch after the next beforeEach restores the mock. */
    await new Promise((r) => setTimeout(r, 200));
  });
});

describe('the submit control recovers', () => {
  it('after a 403, the button is enabled with its original label', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const form = buildForm();
    const button = form.querySelector('button')!;
    const label = button.textContent;
    wireLeadForm(form, hooks(form).opts as never);

    await submit(form);

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe(label);
  });

  it('after a network failure, a retry is accepted and converts', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(ok());
    const form = buildForm();
    const h = hooks(form);
    wireLeadForm(form, h.opts as never);

    await submit(form);
    expect(leadEvents()).toHaveLength(0);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(leadEvents()).toHaveLength(1);
    expect(h.calls.success).toBe(1);
  });

  it('shows "Sending…" while the request is in flight', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((r) => setTimeout(() => r(ok()), 120))
    );
    const form = buildForm();
    const button = form.querySelector('button')!;
    wireLeadForm(form, hooks(form).opts as never);

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 90));

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Sending…');
    await new Promise((r) => setTimeout(r, 200));
  });
});

describe('no personally identifiable information reaches the data layer', () => {
  it('the pushed event carries only allowlisted keys', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    wireLeadForm(form, hooks(form).opts as never);

    await submit(form);

    expect(leadEvents()[0]).toEqual({
      event: 'lead_form_submission',
      form_id: 'ppc-lead-form',
      facility_type: 'Office',
      facility_size: '10,000–25,000 sq ft',
    });
  });

  it('a page that tries to push a name, email or phone is overruled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    const h = hooks(form, {
      eventParams: () => ({
        facility_type: 'Office',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '416 555 0199',
        address: '12 King St W, Toronto',
      }),
    });
    wireLeadForm(form, h.opts as never);

    await submit(form);

    const event = leadEvents()[0];
    expect(Object.keys(event).sort()).toEqual(['event', 'facility_type', 'form_id']);
    expect(JSON.stringify(event)).not.toContain('Jane');
    expect(JSON.stringify(event)).not.toContain('@example.com');
    expect(JSON.stringify(event)).not.toContain('555');
  });

  it('an allowlisted key carrying an email or a phone is dropped too', () => {
    expect(sanitizeEventParams({ facility_type: 'jane@example.com' })).toEqual({});
    expect(sanitizeEventParams({ facility_type: '(416) 555-0199' })).toEqual({});
    expect(sanitizeEventParams({ facility_type: '416 555 0199' })).toEqual({});
    expect(sanitizeEventParams({ facility_type: '+1 416 555 0199' })).toEqual({});
    expect(sanitizeEventParams({ facility_type: '4165550199' })).toEqual({});
    expect(sanitizeEventParams({ facility_type: 'Office' })).toEqual({ facility_type: 'Office' });
  });

  it('a facility size range is not mistaken for a phone number', () => {
    /* The first version of the phone heuristic was "seven digits however
       spaced", which ate every size option on both landing pages. */
    for (const size of [
      'Under 5,000 sq ft',
      '5,000–10,000 sq ft',
      '10,000–25,000 sq ft',
      '25,000–50,000 sq ft',
      'Over 50,000 sq ft',
    ]) {
      expect(sanitizeEventParams({ facility_size: size })).toEqual({ facility_size: size });
    }
  });

  it('values are length-limited and empties are dropped', () => {
    expect(sanitizeEventParams({ facility_type: 'x'.repeat(500) }).facility_type).toHaveLength(120);
    expect(sanitizeEventParams({ facility_type: '   ' })).toEqual({});
  });

  it('pushLeadEvent creates the dataLayer if the container has not yet', () => {
    delete (window as { dataLayer?: unknown[] }).dataLayer;
    pushLeadEvent({ form_id: 'contact-form-1384' });
    expect(window.dataLayer).toEqual([
      { event: 'lead_form_submission', form_id: 'contact-form-1384' },
    ]);
  });
});

describe('the captcha token', () => {
  it('is read from Turnstile, reCAPTCHA, or neither', () => {
    const form = buildForm({ token: 'ts-token' });
    expect(captchaToken(form)).toBe('ts-token');

    document.body.innerHTML = `<form id="g">
      <input type="hidden" name="g-recaptcha-hidden" value="rc-token" />
    </form>`;
    expect(captchaToken(document.getElementById('g') as HTMLFormElement)).toBe('rc-token');

    document.body.innerHTML = `<form id="n"></form>`;
    expect(captchaToken(document.getElementById('n') as HTMLFormElement)).toBe('');
  });

  it('is sent in the POST body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm({ token: 'ts-token' });
    wireLeadForm(form, hooks(form).opts as never);

    await submit(form);

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.captcha).toBe('ts-token');
  });

  it('posts anyway once the wait expires, rather than stranding the visitor', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm({ token: '' });
    wireLeadForm(form, hooks(form).opts as never);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string).captcha).toBe('');
  });
});

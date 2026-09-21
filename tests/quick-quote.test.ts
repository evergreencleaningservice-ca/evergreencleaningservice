/**
 * Phase 9 — the short quote form.
 *
 * Every `it` below is one of the acceptance cases for the new form. They run
 * against `wireQuickQuote`, which is the function `QuickQuoteForm.astro`'s own
 * inline script calls, on a DOM fixture whose field contract is checked
 * against the rendered component in tests/build/quote-page.test.ts. So a pass
 * here is a statement about the code the page ships, not about a
 * reimplementation of it.
 *
 * THE RULE THIS FILE EXISTS FOR: phone or email, at least one, never both.
 * It is the whole reason the form is shorter than the one it replaces, it
 * cannot be expressed in HTML, and it is therefore the rule most likely to be
 * quietly broken by a later edit. Six of the cases below are that rule from
 * six directions.
 *
 * What is NOT re-proved here, because tests/lead-submit.test.ts already proves
 * it for every form on the site: the single conversion event, the honeypot,
 * the attribution merge, the HTTP failure matrix. What IS re-proved is that
 * the short form still goes through that same pipeline — the risk of a new
 * form is that it grows its own submit path and drifts, which is exactly what
 * had happened to the three forms Phase 2 consolidated.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEAD_EVENT } from '../src/lib/lead-submit';
import { contactMethodProblem, wireQuickQuote } from '../src/lib/quick-quote';
import { recordTouch } from '../src/lib/attribution';
import {
  VALID_EMAIL_ONLY,
  VALID_PHONE_ONLY,
  fill,
  quickQuoteMarkup,
} from './fixtures/quick-quote';

/* ---------- harness ------------------------------------------------------ */

function mount(opts: Parameters<typeof quickQuoteMarkup>[0] = {}): HTMLFormElement {
  document.body.innerHTML = quickQuoteMarkup(opts);
  const form = document.querySelector<HTMLFormElement>('form[data-quick-quote]')!;
  wireQuickQuote(form, { tokenWaitMs: 50, tagDeliveryTimeoutMs: 50 });
  return form;
}

/** Mount, fill, and return the form ready to submit. */
function ready(values: Record<string, string>, opts = {}): HTMLFormElement {
  const form = mount(opts);
  fill(form, values);
  return form;
}

/** Submit and let the pipeline settle — same 200ms budget as Phase 2's suite. */
async function submit(form: HTMLFormElement, times = 1) {
  for (let i = 0; i < times; i++) form.dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 200));
}

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
const status = (code: number) => new Response(JSON.stringify({ error: 'no' }), { status: code });

const leadEvents = () => (window.dataLayer ?? []).filter((e) => e.event === LEAD_EVENT);
const summary = () => document.querySelector<HTMLElement>('[data-qq-summary]')?.textContent ?? '';
const errorFor = (key: string) =>
  document.querySelector<HTMLElement>(`[data-qq-error="${key}"]`)?.textContent ?? '';
const confirmation = () => document.querySelector<HTMLElement>('.qq-confirm');

/** The JSON body of the single POST a successful submit makes. */
const sentBody = (spy: ReturnType<typeof vi.spyOn>) =>
  JSON.parse((spy.mock.calls[0]![1] as RequestInit).body as string) as Record<string, unknown>;

beforeEach(() => {
  window.dataLayer = [];
  sessionStorage.clear();
  localStorage.clear();
  vi.restoreAllMocks();
});

/* ---------- 1. one contact method is enough ------------------------------ */

describe('phone or email, at least one, never both', () => {
  it('accepts a telephone number with no email address', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy)).toMatchObject({
      phone: '416 555 0142',
      email: '',
      name: 'Dana',
      business_name: 'Placeholder Holdings Inc',
    });
    expect(leadEvents()).toHaveLength(1);
    expect(confirmation()).not.toBeNull();
  });

  it('accepts an email address with no telephone number', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_EMAIL_ONLY);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy)).toMatchObject({
      phone: '',
      email: 'dana@placeholder-holdings.example',
    });
    expect(leadEvents()).toHaveLength(1);
  });

  it('accepts both when a visitor chooses to give both', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, email: 'dana@placeholder-holdings.example' });

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('refuses neither, without posting and without a conversion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, phone: '', email: '' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(confirmation()).toBeNull();
    expect(summary()).toContain('phone number or an email address');
    /* And it says either is fine, rather than leaving a visitor to guess that
       the form wants both back. */
    expect(summary()).toContain('Either is fine');
  });

  it('sends the visitor to the phone field when neither is filled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, phone: '', email: '' });

    await submit(form);

    expect(document.activeElement).toBe(form.elements.namedItem('phone'));
  });

  it('neither field is marked required in the markup', () => {
    const form = mount();
    expect((form.elements.namedItem('phone') as HTMLInputElement).required).toBe(false);
    expect((form.elements.namedItem('email') as HTMLInputElement).required).toBe(false);
  });

  it('contactMethodProblem is exact about what satisfies it', () => {
    const form = mount();

    fill(form, { phone: '', email: '' });
    expect(contactMethodProblem(form)).not.toBeNull();

    fill(form, { phone: '416 555 0142', email: '' });
    expect(contactMethodProblem(form)).toBeNull();

    fill(form, { phone: '', email: 'a@b.example' });
    expect(contactMethodProblem(form)).toBeNull();

    /* Whitespace is not a contact method. */
    fill(form, { phone: '   ', email: '  ' });
    expect(contactMethodProblem(form)).not.toBeNull();
  });
});

/* ---------- 2. a malformed optional field is still rejected -------------- */

describe('an optional field that is filled in badly', () => {
  it('rejects a malformed email even though email is optional', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, email: 'dana@' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(errorFor('contact')).toContain('does not look complete');
    expect((form.elements.namedItem('email') as HTMLInputElement).getAttribute('aria-invalid')).toBe(
      'true'
    );
  });

  it('reports a malformed email before the cross-field rule, not after', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    /* Both a bad email AND no phone. The visitor should be told the thing they
       can act on — fix the address they are clearly trying to give — not be
       told to supply a different contact method entirely. */
    const form = ready({ ...VALID_PHONE_ONLY, phone: '', email: 'dana@' });

    await submit(form);

    expect(errorFor('contact')).toContain('does not look complete');
    expect(summary()).not.toContain('Either is fine');
  });
});

/* ---------- 3. what the form no longer asks for -------------------------- */

describe('the fields the long form required and this one does not', () => {
  it('succeeds with no street address anywhere in the payload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    const body = sentBody(fetchSpy);
    /* `address` carries the postal-code-or-city box, which is one short field
       and not a street address. Nothing asks for a street, a unit or a
       province. */
    expect(body.address).toBe('M5V 1Z4');
    expect(Object.keys(body)).not.toContain('address1');
    expect(Object.keys(body)).not.toContain('city');
    expect(Object.keys(body)).not.toContain('state');
  });

  it('succeeds with no last name', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(sentBody(fetchSpy).name).toBe('Dana');
    expect(form.elements.namedItem('last-name')).toBeNull();
  });

  it('succeeds with the optional message left empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(sentBody(fetchSpy).message).toBe('');
    expect(leadEvents()).toHaveLength(1);
  });

  it('asks for four required fields, not nine', () => {
    const form = mount();
    const required = Array.from(form.elements).filter(
      (el) => (el as HTMLInputElement).required
    ).length;
    expect(required).toBe(4);
  });
});

/* ---------- 4. every way it can fail produces no conversion -------------- */

describe('failures never report a conversion', () => {
  it.each([400, 401, 404, 422, 429, 500, 502, 503])('HTTP %i', async (code) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(code));
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(confirmation()).toBeNull();
    expect(summary()).toContain('(416) 803-4880');
  });

  it('a rejected captcha says so, resets the widget and keeps the form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const reset = vi.fn();
    window.turnstile = { reset } as never;
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(summary()).toContain('security check');
    expect(reset).toHaveBeenCalledTimes(1);
    expect(confirmation()).toBeNull();
    /* The visitor can try again: the button is live and the fields are intact. */
    expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    expect((form.elements.namedItem('first-name') as HTMLInputElement).value).toBe('Dana');
  });

  it('a network failure says call us, and reports nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(summary()).toContain('could not reach the server');
  });

  it('a missing required field posts nothing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, 'business-name': '' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
  });
});

/* ---------- 5. it is still the one pipeline ------------------------------ */

describe('the short form uses the site pipeline, not its own', () => {
  it('posts exactly one request and one event for repeated clicks', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form, 5);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('a second submit after a success is still one conversion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);
    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('carries the attribution recorded at the campaign arrival', async () => {
    recordTouch(
      'https://www.evergreencleaningservice.ca/request-a-quote/?gclid=P9TEST&utm_source=google&utm_medium=cpc&utm_campaign=gta-office',
      'https://www.google.com/'
    );
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(sentBody(fetchSpy)).toMatchObject({
      gclid: 'P9TEST',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'gta-office',
    });
  });

  it('identifies itself as quick-quote in the payload and the event', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(sentBody(fetchSpy).form_id).toBe('quick-quote');
    expect(leadEvents()[0]).toMatchObject({ event: LEAD_EVENT, form_id: 'quick-quote' });
  });

  it('puts no personal information in the dataLayer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, email: 'dana@placeholder-holdings.example' });

    await submit(form);

    const serialised = JSON.stringify(window.dataLayer);
    for (const pii of [
      'Dana',
      'Placeholder Holdings Inc',
      '416 555 0142',
      'dana@placeholder-holdings.example',
      'M5V 1Z4',
    ]) {
      expect(serialised).not.toContain(pii);
    }
    /* Only the allowlisted keys survive. */
    expect(Object.keys(leadEvents()[0]!).sort()).toEqual(['event', 'form_id']);
  });

  it('answers a honeypot hit like a success, without posting or converting', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY, { honeypot: 'http://spam.example' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    /* A bot is told nothing useful: it sees what a person sees. */
    expect(confirmation()).not.toBeNull();
  });
});

/* ---------- 6. Turnstile, both timings ----------------------------------- */

describe('the deferred captcha', () => {
  it('submits immediately when the token is already present', async () => {
    let postedAfter = Infinity;
    const started = Date.now();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      postedAfter = Date.now() - started;
      return ok();
    });
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy).captcha).toBe('turnstile-token');
    /* No waiting on a token that is already there: the token loop is never
       entered, so the POST leaves within a tick rather than after a 50ms
       poll. Measured at the request, not after the suite's settle wait. */
    expect(postedAfter).toBeLessThan(50);
  });

  it('waits for a token that arrives after the visitor has hit submit', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY, { token: null });

    /* Turnstile resolving late — the deferred loader's whole point is that the
       widget may not have executed when a fast visitor submits. */
    setTimeout(() => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'cf-turnstile-response';
      input.value = 'late-token';
      form.appendChild(input);
    }, 20);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy).captcha).toBe('late-token');
    expect(leadEvents()).toHaveLength(1);
  });

  it('still posts when no token ever arrives, and lets the server decide', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const form = ready(VALID_PHONE_ONLY, { token: null });

    await submit(form);

    /* The deadline expires and the request goes anyway. The alternative is a
       form that silently never submits — the server's 403 is at least a
       message the visitor can act on. */
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy).captcha).toBe('');
    expect(leadEvents()).toHaveLength(0);
    expect(summary()).toContain('security check');
  });
});

/* ---------- 7. errors and success a screen reader can follow ------------- */

describe('errors are announced, not just coloured', () => {
  it('reports every problem at once rather than one per attempt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({
      'first-name': '',
      'business-name': '',
      phone: '416 555 0142',
      email: '',
      postal: '',
      services: '',
    });

    await submit(form);

    expect(errorFor('first-name')).toContain('first name');
    expect(errorFor('business-name')).toContain('business name');
    expect(errorFor('postal')).toContain('postal code');
    expect(errorFor('services')).toContain('service');
    expect(summary()).toContain('4 things need a moment');
  });

  it('marks each bad field aria-invalid and each error is described by id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, 'first-name': '' });

    await submit(form);

    const first = form.elements.namedItem('first-name') as HTMLInputElement;
    expect(first.getAttribute('aria-invalid')).toBe('true');
    const describedBy = first.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain('first name');
  });

  it('the summary is a live region and takes focus', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, 'first-name': '' });

    await submit(form);

    const box = document.querySelector<HTMLElement>('[data-qq-summary]')!;
    expect(box.getAttribute('role')).toBe('alert');
    expect(box.getAttribute('aria-live')).toBe('assertive');
    expect(box.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(box);
  });

  it('clears a field error the moment the visitor starts fixing it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, 'first-name': '' });
    await submit(form);
    expect(errorFor('first-name')).not.toBe('');

    const first = form.elements.namedItem('first-name') as HTMLInputElement;
    first.value = 'D';
    first.dispatchEvent(new Event('input', { bubbles: true }));

    expect(errorFor('first-name')).toBe('');
    expect(first.hasAttribute('aria-invalid')).toBe(false);
  });

  it('clears the contact error when either phone or email is touched', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, phone: '', email: '' });
    await submit(form);
    expect(summary()).not.toBe('');

    const email = form.elements.namedItem('email') as HTMLInputElement;
    email.value = 'd';
    email.dispatchEvent(new Event('input', { bubbles: true }));

    expect(errorFor('contact')).toBe('');
  });

  it('a stale error does not survive the next attempt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_PHONE_ONLY, 'first-name': '', postal: '' });
    await submit(form);
    expect(summary()).toContain('2 things');

    fill(form, { 'first-name': 'Dana' });
    await submit(form);

    expect(errorFor('first-name')).toBe('');
    expect(summary()).toContain('postal code');
    expect(summary()).not.toContain('2 things');
  });
});

describe('success is announced, and the visitor keeps their place', () => {
  it('replaces the form with a focusable status box', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    const box = confirmation()!;
    expect(box).not.toBeNull();
    expect(box.getAttribute('role')).toBe('status');
    expect(box.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(box);
    /* The form is gone, so there is nothing left to submit twice. */
    expect(document.querySelector('form[data-quick-quote]')).toBeNull();
  });

  it('says what happens next and offers the phone number', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    await submit(form);

    const text = confirmation()!.textContent ?? '';
    expect(text).toContain('2 business hours');
    expect(confirmation()!.querySelector('a')?.getAttribute('href')).toBe('tel:+14168034880');
  });
});

/* ---------- 8. the keyboard ---------------------------------------------- */

describe('keyboard behaviour', () => {
  it('Enter in a text field submits, as a visitor expects', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_PHONE_ONLY);

    const postal = form.elements.namedItem('postal') as HTMLInputElement;
    postal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    /* happy-dom does not synthesise the implicit submit, so the assertion is
       that nothing intercepted the key on a real field. */
    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('Enter inside the honeypot is swallowed', () => {
    const form = mount();
    const hp = form.elements.namedItem('company-website') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    hp.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('every control is reachable and none is removed from the tab order', () => {
    const form = mount();
    const visible = Array.from(form.elements).filter(
      (el) => (el as HTMLElement).closest('.qq-hp') === null && (el as HTMLElement).tagName !== 'FIELDSET'
    );
    for (const el of visible) {
      expect((el as HTMLElement).getAttribute('tabindex')).not.toBe('-1');
    }
  });
});

/* ---------- 9. the button -------------------------------------------------*/

describe('the submit button', () => {
  it('disables itself while sending and restores its label on failure', async () => {
    let resolve!: (r: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(
      new Promise<Response>((r) => {
        resolve = r;
      })
    );
    const form = ready(VALID_PHONE_ONLY);
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const label = button.textContent;

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 100));
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Sending…');

    resolve(status(500));
    await new Promise((r) => setTimeout(r, 50));
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe(label);
  });
});

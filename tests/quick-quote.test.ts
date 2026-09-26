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
import { wireQuickQuote } from '../src/lib/quick-quote';
import { recordTouch } from '../src/lib/attribution';
import {
  VALID_LEAD,
  VALID_LEAD_OTHER,
  fill,
  quickQuoteMarkup,
} from './fixtures/quick-quote';
import { SERVICE_OPTIONS } from '../src/data/services';

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

describe('every field the form asks for is required', () => {
  /**
   * THIS BLOCK USED TO ASSERT THE OPPOSITE, and the change is a decision
   * rather than a drift. The form took "phone OR email, one is enough" —
   * deliberately, because it is what cold paid traffic sees and every extra
   * box is a place to give up. The client chose the reference design's field
   * set instead: seven fields, all required.
   *
   * It converts somewhat worse and qualifies somewhat better. What these
   * tests hold is that the rule is now stated by the browser rather than by
   * a hand-written cross-field check, and that nothing posts until it is met.
   */
  it('accepts a complete submission', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

    await submit(form);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentBody(fetchSpy)).toMatchObject({
      name: 'Dana Okonkwo',
      phone: '416 555 0142',
      email: 'dana@placeholder-holdings.example',
      /* The SELECTION, under the column's name. A listed service sends no
         free text at all — there is nowhere to type one. */
      services: 'Office Cleaning',
      message: '',
    });
    expect(leadEvents()).toHaveLength(1);
    expect(confirmation()).not.toBeNull();
  });

  it('takes the whole name in one box', () => {
    /* Two boxes for one revision, now one — which is what the database
       always stored anyway. The split bought a surname the client could
       address people by and cost a field; merging returns the field and
       keeps the surname, because people type both into one box. */
    expect(VALID_LEAD.name).toBe('Dana Okonkwo');
  });

  it.each(['name', 'phone', 'email', 'service'])(
    'marks %s required in the markup',
    (name) => {
      const form = mount();
      const el = form.elements.namedItem(name) as HTMLInputElement;
      expect(el, `no field named ${name}`).toBeTruthy();
      expect(el.required, `${name} should be required`).toBe(true);
    }
  );

  it('ships the free-text box hidden and NOT required', () => {
    /* The pair that must never disagree. A hidden control carrying
       `required` fails `checkValidity()` where the visitor cannot see it,
       and the form then refuses them with a message in a hidden slot — the
       silent refusal this component has been bitten by before. */
    const form = mount();
    const box = form.querySelector<HTMLElement>('[data-qq-other]')!;
    const detail = form.elements.namedItem('message') as HTMLTextAreaElement;
    expect(box.hidden, 'the other box should start hidden').toBe(true);
    expect(detail.required, 'a hidden field must not be required').toBe(false);
  });

  it('asks for four required fields', () => {
    const form = mount();
    const required = Array.from(form.elements).filter(
      (el) => (el as HTMLInputElement).required
    ).length;
    expect(required).toBe(4);
  });

  it('no longer carries a shared contact error slot', () => {
    /* Phone and email each have their own now. One slot for two required
       fields would show one message and hide the other. */
    mount();
    expect(document.querySelector('[data-qq-error="contact"]')).toBeNull();
    expect(document.querySelector('[data-qq-error="phone"]')).not.toBeNull();
    expect(document.querySelector('[data-qq-error="email"]')).not.toBeNull();
  });
});

/* ---------- 2. a required field filled in badly -------------------------- */

describe('a field that is filled in badly', () => {
  it('rejects a malformed email and says so on the email field', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, email: 'dana@' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(errorFor('email')).toContain('does not look complete');
    expect((form.elements.namedItem('email') as HTMLInputElement).getAttribute('aria-invalid')).toBe(
      'true'
    );
  });

  it('posts nothing when a required field is simply empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
    expect(confirmation()).toBeNull();
  });
});

/* ---------- 3. what the form asks for now -------------------------------- */

describe('the field set, as it reaches the endpoint', () => {
  it('sends only what the form now asks for', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

    await submit(form);

    const body = sentBody(fetchSpy);
    expect(body.name).toBe('Dana Okonkwo');
    expect(body.phone).toBe('416 555 0142');
    expect(body.email).toBe('dana@placeholder-holdings.example');
    expect(body.services).toBe('Office Cleaning');
    expect(body.message).toBe('');
  });

  it('sends the typed detail when "Other" is the service', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD_OTHER);

    await submit(form);

    const body = sentBody(fetchSpy);
    /* BOTH, not one standing in for the other. "Other" is a real answer to
       "which service", and the prose is a separate fact; collapsing them
       would make the service column unusable for comparison the moment
       anyone picked Other. */
    expect(body.services).toBe('Other');
    expect(body.message).toBe('Pressure washing the loading dock, quarterly.');
  });

  it('stops sending the fields the form stopped asking for', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

    await submit(form);

    const body = sentBody(fetchSpy);
    /* Their COLUMNS survive — earlier leads answered them, and `address` is
       still filled by the contact form on /contact-us/. The payload does not,
       because nothing on this form fills them any more.

       `services` CAME OFF THIS LIST when the service dropdown came back. It
       is asserted as SENT, above, rather than quietly dropped from both
       lists — a field that is neither required nor forbidden is a field no
       test is watching. */
    for (const key of ['business_name', 'address', 'province']) {
      expect(Object.keys(body), `${key} should not be sent`).not.toContain(key);
    }
    for (const name of ['business-name', 'services', 'postal', 'address', 'province', 'first-name', 'last-name']) {
      expect(form.elements.namedItem(name), `${name} should not be on the form`).toBeNull();
    }
  });
});

/* ---------- 4. every way it can fail produces no conversion -------------- */

describe('failures never report a conversion', () => {
  it.each([400, 401, 404, 422, 429, 500, 502, 503])('HTTP %i', async (code) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(code));
    const form = ready(VALID_LEAD);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(confirmation()).toBeNull();
    expect(summary()).toContain('(416) 803-4880');
  });

  it('a rejected captcha says so, resets the widget and keeps the form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const reset = vi.fn();
    window.turnstile = { reset } as never;
    const form = ready(VALID_LEAD);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(summary()).toContain('security check');
    expect(reset).toHaveBeenCalledTimes(1);
    expect(confirmation()).toBeNull();
    /* The visitor can try again: the button is live and the fields are intact. */
    expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    expect((form.elements.namedItem('name') as HTMLInputElement).value).toBe('Dana Okonkwo');
  });

  it('a network failure says call us, and reports nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const form = ready(VALID_LEAD);

    await submit(form);

    expect(leadEvents()).toHaveLength(0);
    expect(summary()).toContain('could not reach the server');
  });

  it('a missing required field posts nothing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '' });

    await submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(leadEvents()).toHaveLength(0);
  });
});

/* ---------- 5. it is still the one pipeline ------------------------------ */

describe('the short form uses the site pipeline, not its own', () => {
  it('posts exactly one request and one event for repeated clicks', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

    await submit(form, 5);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(leadEvents()).toHaveLength(1);
  });

  it('a second submit after a success is still one conversion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

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
    const form = ready(VALID_LEAD);

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
    const form = ready(VALID_LEAD);

    await submit(form);

    expect(sentBody(fetchSpy).form_id).toBe('quick-quote');
    expect(leadEvents()[0]).toMatchObject({ event: LEAD_EVENT, form_id: 'quick-quote' });
  });

  it('puts no personal information in the dataLayer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, email: 'dana@placeholder-holdings.example' });

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
    const form = ready(VALID_LEAD, { honeypot: 'http://spam.example' });

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
    const form = ready(VALID_LEAD);

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
    const form = ready(VALID_LEAD, { token: null });

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
    const form = ready(VALID_LEAD, { token: null });

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
      ...VALID_LEAD,
      name: '',
      phone: '',
      email: '',
      service: '',
    });

    await submit(form);

    expect(errorFor('name')).toContain('name');
    expect(errorFor('phone')).toContain('phone');
    expect(errorFor('email')).toContain('email');
    expect(errorFor('service')).toContain('service');
    expect(summary()).toContain('4 things need a moment');
  });

  it('does not count the hidden free-text box among the problems', async () => {
    /* Four, not five. The box is hidden and not required, so an empty one is
       not a problem — and if it ever were counted, the visitor would be told
       about a field that is not on their screen. */
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '', phone: '', email: '', service: '' });

    await submit(form);

    expect(errorFor('message')).toBe('');
    expect(summary()).toContain('4 things need a moment');
  });

  it('marks each bad field aria-invalid and each error is described by id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '' });

    await submit(form);

    const nameBox = form.elements.namedItem('name') as HTMLInputElement;
    expect(nameBox.getAttribute('aria-invalid')).toBe('true');
    const describedBy = nameBox.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain('name');
  });

  it('the summary is a live region and takes focus', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '' });

    await submit(form);

    const box = document.querySelector<HTMLElement>('[data-qq-summary]')!;
    expect(box.getAttribute('role')).toBe('alert');
    expect(box.getAttribute('aria-live')).toBe('assertive');
    expect(box.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(box);
  });

  it('clears a field error the moment the visitor starts fixing it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '' });
    await submit(form);
    expect(errorFor('name')).not.toBe('');

    const nameBox = form.elements.namedItem('name') as HTMLInputElement;
    nameBox.value = 'D';
    nameBox.dispatchEvent(new Event('input', { bubbles: true }));

    expect(errorFor('name')).toBe('');
    expect(nameBox.hasAttribute('aria-invalid')).toBe(false);
  });

  it('clears the contact error when either phone or email is touched', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    /* Phone and email each own their slot now — they shared one keyed
       `contact` while the rule was "either is enough". Touching one must
       clear ITS message and leave the other's standing. */
    const form = ready({ ...VALID_LEAD, phone: '', email: '' });
    await submit(form);
    expect(summary()).not.toBe('');
    expect(errorFor('phone')).not.toBe('');
    expect(errorFor('email')).not.toBe('');

    const email = form.elements.namedItem('email') as HTMLInputElement;
    email.value = 'd';
    email.dispatchEvent(new Event('input', { bubbles: true }));

    expect(errorFor('email')).toBe('');
    expect(errorFor('phone'), 'the phone message must survive').not.toBe('');
  });

  it('a stale error does not survive the next attempt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, name: '', phone: '' });
    await submit(form);
    expect(summary()).toContain('2 things');

    fill(form, { name: 'Dana Okonkwo' });
    await submit(form);

    expect(errorFor('name')).toBe('');
    expect(summary()).toContain('phone');
    expect(summary()).not.toContain('2 things');
  });
});

describe('success is announced, and the visitor keeps their place', () => {
  it('replaces the form with a focusable status box', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);

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
    const form = ready(VALID_LEAD);

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
    const form = ready(VALID_LEAD);

    const nameBox = form.elements.namedItem('name') as HTMLInputElement;
    nameBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
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
    const form = ready(VALID_LEAD);
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

/* ---------- 8. the "Other" free-text box --------------------------------- */

/**
 * The one control on this form that changes the shape of the form.
 *
 * Every test here is about the pair of attributes `hidden` and `required`
 * staying in step. They are what stands between this feature and the failure
 * mode this component has already been bitten by once: a control the visitor
 * cannot see, blocking a submission for a reason they cannot read.
 */
describe('choosing "Other" reveals somewhere to type', () => {
  const box = (form: HTMLFormElement) => form.querySelector<HTMLElement>('[data-qq-other]')!;
  const detail = (form: HTMLFormElement) =>
    form.elements.namedItem('message') as HTMLTextAreaElement;
  const pick = (form: HTMLFormElement, value: string) => {
    const select = form.elements.namedItem('service') as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  it('offers the client\'s seven options, in their order', () => {
    const form = mount();
    const select = form.elements.namedItem('service') as HTMLSelectElement;
    const values = Array.from(select.options)
      .map((o) => o.value)
      .filter(Boolean);
    expect(values).toEqual([...SERVICE_OPTIONS]);
    /* SEVEN, not the original site's eight. The client supplied their own
       list; the count is pinned so shrinking or padding it is a deliberate
       edit here rather than a quiet drift in a data file. */
    expect(values).toHaveLength(7);
    expect(values[0]).toBe('Commercial Cleaning');
    expect(values.at(-1)).toBe('Other');
  });

  it('has an unselectable placeholder, so `required` means something', () => {
    /* Without a valueless FIRST option the browser pre-selects the first
       real service, and every visitor who ignores the field silently reports
       wanting whatever happens to be listed first. */
    const form = mount();
    const first = (form.elements.namedItem('service') as HTMLSelectElement).options[0];
    expect(first.value).toBe('');
    expect(first.disabled).toBe(true);
  });

  it('shows the box and makes it required when "Other" is picked', () => {
    const form = mount();
    pick(form, 'Other');
    expect(box(form).hidden).toBe(false);
    expect(detail(form).required).toBe(true);
  });

  it('hides it again, drops `required`, and clears what was typed', () => {
    const form = mount();
    pick(form, 'Other');
    detail(form).value = 'Something I changed my mind about';

    pick(form, 'Office Cleaning');

    expect(box(form).hidden).toBe(true);
    expect(detail(form).required).toBe(false);
    /* Cleared, not kept. Sending prose the visitor believes they removed
       would put words in a lead that nobody agreed to send. */
    expect(detail(form).value).toBe('');
  });

  it('refuses an empty box once "Other" is showing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready({ ...VALID_LEAD, service: 'Other' });
    pick(form, 'Other');

    await submit(form);

    expect(errorFor('message')).toContain('cleaned');
    expect(confirmation()).toBeNull();
  });

  it('does not send the cleared note after a change of mind', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = ready(VALID_LEAD);
    pick(form, 'Other');
    detail(form).value = 'Abandoned note';
    pick(form, 'Janitorial Services');

    await submit(form);

    const body = sentBody(fetchSpy);
    expect(body.services).toBe('Janitorial Services');
    expect(body.message).toBe('');
  });
});

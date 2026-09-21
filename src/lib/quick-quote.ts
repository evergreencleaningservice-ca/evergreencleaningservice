/**
 * The short quote form's behaviour: validation messages a person can act on,
 * focus that goes where the problem is, and a success state a screen reader
 * announces.
 *
 * It sits on top of `wireLeadForm`, which still owns everything that must not
 * vary between forms — the single `lead_form_submission` after a 2xx, the
 * honeypot, the duplicate-submit guard, attribution, Turnstile. What is here
 * is only the part that is specific to a form rendering its own errors.
 *
 * WHY `novalidate` AND OUR OWN MESSAGES. Two reasons, and the second is the
 * real one:
 *
 *   1. The browser's bubble shows one problem at a time, disappears on the
 *      next click, and cannot be read back by a screen reader after it has
 *      gone.
 *   2. "Phone or email, at least one" cannot be expressed in HTML at all.
 *      `required` says "this field, always". Marking both required is exactly
 *      the friction this form exists to remove, and marking neither means the
 *      browser has nothing to say when a visitor submits with both empty.
 *
 * So the form carries `novalidate`, the constraint API is still used for
 * per-field validity (it knows what a valid email looks like better than a
 * regex does), and the messages are rendered into elements that were already
 * on the page with their height reserved — an error that shifts the layout
 * moves the field the visitor is about to correct.
 */

import { fieldValue, wireLeadForm } from './lead-submit';

/**
 * Which error slot a field's message belongs in.
 *
 * Every field writes into `[data-qq-error="<its own name>"]` except phone and
 * email, which share one slot keyed `contact` — because they are one question
 * ("how should we reach you?") with two boxes, and the cross-field rule has no
 * field of its own to hang a message on.
 *
 * Getting this wrong is silent: `markInvalid` looks up a slot that does not
 * exist, finds nothing, and the visitor is refused with no message at all.
 * That is exactly what happened before this mapping existed.
 */
const slotKey = (name: string): string =>
  name === 'phone' || name === 'email' ? 'contact' : name;

/** Errors are written into `[data-qq-error="<key>"]`; `contact` is the pair. */
const errorSlot = (form: HTMLFormElement, key: string) =>
  form.querySelector<HTMLElement>(`[data-qq-error="${slotKey(key)}"]`);

const summarySlot = (form: HTMLFormElement) =>
  form.querySelector<HTMLElement>('[data-qq-summary]');

const control = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as (HTMLElement & { focus(): void }) | null;

/** A message for a field the browser has judged invalid. */
function messageFor(name: string, el: HTMLInputElement | HTMLSelectElement): string {
  if (el.validity.valueMissing) {
    switch (name) {
      case 'first-name':
        return 'Please add your first name.';
      case 'business-name':
        return 'Please add your business name.';
      case 'postal':
        return 'Please add a postal code or your city.';
      case 'services':
        return 'Please choose the service you need.';
      default:
        return 'This one is needed.';
    }
  }
  if (el.validity.typeMismatch && name === 'email')
    return 'That email address does not look complete.';
  return 'Please check this one.';
}

/** Clear every message and every aria-invalid on the form. */
function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('[data-qq-error]').forEach((slot) => {
    slot.textContent = '';
  });
  form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((el) => {
    el.removeAttribute('aria-invalid');
  });
  const summary = summarySlot(form);
  if (summary) summary.textContent = '';
}

/** Mark one field, write its message, and return the element. */
function markInvalid(form: HTMLFormElement, name: string, message: string): HTMLElement | null {
  const el = control(form, name);
  el?.setAttribute('aria-invalid', 'true');
  const slot = errorSlot(form, name);
  if (slot) slot.textContent = message;
  return el;
}

/**
 * Show every per-field problem at once, summarise, and send the visitor to
 * the first one.
 *
 * All of them, not the first: someone who fixes one field and is then told
 * about the next has been made to submit three times to learn three things
 * that were all knowable at once.
 */
export function reportInvalidFields(form: HTMLFormElement): void {
  clearErrors(form);

  const problems: string[] = [];
  let first: HTMLElement | null = null;

  for (const el of Array.from(form.elements)) {
    const field = el as HTMLInputElement | HTMLSelectElement;
    if (!field.name || typeof field.checkValidity !== 'function') continue;
    if (field.disabled || field.type === 'hidden') continue;
    if (field.checkValidity()) continue;

    const message = messageFor(field.name, field);
    const marked = markInvalid(form, field.name, message);
    problems.push(message);
    if (!first) first = marked;
  }

  const summary = summarySlot(form);
  if (summary && problems.length) {
    summary.textContent =
      problems.length === 1
        ? problems[0]
        : `${problems.length} things need a moment: ${problems.join(' ')}`;
    /* Focus the summary rather than the field, so a screen reader reads the
       whole list before the visitor lands in the first box. */
    summary.focus();
  }
  if (!summary) first?.focus();
}

/** Phone or email — the rule HTML has no word for. */
export function contactMethodProblem(
  form: HTMLFormElement
): { message: string; field?: string } | null {
  const phone = fieldValue(form, 'phone');
  const email = fieldValue(form, 'email');
  if (phone || email) return null;
  return {
    message: 'Please add a phone number or an email address, so we can reply. Either is fine.',
    field: 'phone',
  };
}

export interface QuickQuoteOptions {
  /** Small numbers in tests; the real one is the module default. */
  tokenWaitMs?: number;
  tagDeliveryTimeoutMs?: number;
}

/**
 * Wire one short quote form.
 *
 * Idempotent through `wireLeadForm`, which refuses a form it has already
 * bound.
 */
export function wireQuickQuote(form: HTMLFormElement, options: QuickQuoteOptions = {}): void {
  /* Clear a stale summary at the START of every attempt.
     REGISTERED BEFORE `wireLeadForm`, and that ordering is the whole point:
     submit listeners run in the order they were added, so a clear registered
     after the pipeline would wipe the message the pipeline had just written
     and refuse the visitor in silence. */
  form.addEventListener('submit', () => {
    const summary = summarySlot(form);
    if (summary) summary.textContent = '';
  });

  /* Clearing on input is what makes the errors feel like help rather than a
     verdict: the message goes the moment the visitor starts fixing it. */
  form.addEventListener('input', (event) => {
    const el = event.target as HTMLInputElement | null;
    if (!el?.name) return;
    el.removeAttribute('aria-invalid');
    /* `slotKey` sends phone and email to the shared `contact` slot, so
       touching either one clears the pair's message. */
    const slot = errorSlot(form, el.name);
    if (slot) slot.textContent = '';
  });

  /* Enter inside the message box should write a new line, which is what it
     already does — but Enter anywhere else submits, and that is correct and
     expected. The one case worth stopping is a stray Enter on the honeypot. */
  form.addEventListener('keydown', (event) => {
    const el = event.target as HTMLElement | null;
    if (event.key === 'Enter' && el?.closest('.qq-hp')) event.preventDefault();
  });

  const confirm = (f: HTMLFormElement) => {
    const box = document.createElement('div');
    box.className = 'qq-confirm';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML =
      '<strong>Thank you — we have your request.</strong>' +
      '<span>An account executive will reply within 2 business hours on a working day. ' +
      'If it is urgent, call <a href="tel:+14168034880">(416) 803-4880</a>.</span>';
    f.replaceWith(box);
    /* Focus, not just `role="status"`: the form the visitor was inside has
       been removed from the document, so focus would otherwise fall back to
       <body> and a screen-reader user would lose their place entirely. */
    box.focus();
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const fail = (f: HTMLFormElement, message: string) => {
    const summary = summarySlot(f);
    if (!summary) return;
    summary.textContent = message;
    summary.focus();
  };

  wireLeadForm(form, {
    formId: form.dataset.formId ?? 'quick-quote',
    endpoint: form.dataset.endpoint ?? '/api/submit-lead',
    honeypots: ['company-website', 'company_tax_id', 'website_trap'],
    tokenWaitMs: options.tokenWaitMs,
    tagDeliveryTimeoutMs: options.tagDeliveryTimeoutMs,

    reportInvalid: reportInvalidFields,
    validate: contactMethodProblem,

    payload: (f) => ({
      form_id: f.dataset.formId ?? 'quick-quote',
      name: fieldValue(f, 'first-name'),
      business_name: fieldValue(f, 'business-name'),
      phone: fieldValue(f, 'phone'),
      email: fieldValue(f, 'email'),
      /* One box, either format. The Worker stores it as the address it is —
         a postal code or a place name is what we have, and pretending it is
         a street address would be a lie in a column. */
      address: fieldValue(f, 'postal'),
      services: fieldValue(f, 'services'),
      message: fieldValue(f, 'message'),
      page_url: location.href,
    }),

    onSuccess: confirm,
    /* Mimics success without storing, navigating or reporting a conversion. */
    onHoneypot: confirm,
    onError: fail,
  });
}

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
 *   2. A message that names the field — "Please add your last name" rather
 *      than "Please fill in this field" — and that can be shown for every
 *      empty box at once instead of whichever one the browser reached first.
 *
 * Reason 2 used to read differently: "phone or email, at least one" could not
 * be expressed in HTML at all, and that rule was the reason this machinery
 * existed. The reference field set marks every field required, so HTML can
 * now state the rule — but not the messages, and not all of them at once,
 * which is why none of this went away with it.
 *
 * So the form carries `novalidate`, the constraint API is still used for
 * per-field validity (it knows what a valid email looks like better than a
 * regex does), and the messages are rendered into elements that were already
 * on the page with their height reserved — an error that shifts the layout
 * moves the field the visitor is about to correct.
 */

import { fieldValue, wireLeadForm } from './lead-submit';

/**
 * Errors are written into `[data-qq-error="<the field's own name>"]`.
 *
 * ONE SLOT PER FIELD, and it did not used to be. Phone and email shared a
 * slot keyed `contact`, because they were one question with two boxes and the
 * "either is enough" rule had no field of its own to hang a message on. With
 * the reference field set both are required and each has something separate
 * to say, so the mapping is gone.
 *
 * Getting this wrong is SILENT, which is why it is worth a comment rather
 * than being obvious: a lookup for a slot that does not exist finds nothing,
 * writes nothing, and the visitor is refused with no message at all. That is
 * exactly what happened when this mapping was first missing — and again, for
 * one test run, when the `contact` slot was removed from the markup while
 * this function still pointed at it.
 */
const errorSlot = (form: HTMLFormElement, key: string) =>
  form.querySelector<HTMLElement>(`[data-qq-error="${key}"]`);

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
      case 'last-name':
        return 'Please add your last name.';
      case 'phone':
        return 'Please add a mobile phone number.';
      case 'email':
        return 'Please add a work email address.';
      case 'address':
        return 'Please add the address of the property to be cleaned.';
      case 'province':
        return 'Please choose the province.';
      case 'message':
        return 'Please tell us what you need cleaned.';
      default:
        /* Every field on this form has a case above. The fallback is for a
           field added later whose message nobody wrote — it is a worse
           message, not a missing one, so a visitor is never refused in
           silence. */
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

/* `contactMethodProblem` lived here: "phone OR email, one is enough", the
   rule HTML has no word for and `validate` existed to carry. The reference
   field set marks both required, so the browser now states the rule itself
   and the function had no caller left. Removed rather than kept warm — an
   exported validator nothing validates is a trap for the next person, who
   would reasonably assume the site still accepts one or the other. */

export interface QuickQuoteOptions {
  /** Small numbers in tests; the real one is the module default. */
  tokenWaitMs?: number;
  tagDeliveryTimeoutMs?: number;
}

/**
 * The marketing-consent pair: whether it was ticked, and the exact wording it
 * was ticked against.
 *
 * THE WORDING IS READ OFF THE PAGE rather than imported as a constant. Under
 * CASL the sender has to be able to show what was agreed to, and the only text
 * that can honestly claim to be that is the text the visitor was actually
 * looking at. Reading it from the label makes the record true even if someone
 * edits the copy and forgets there was a second copy of it elsewhere.
 *
 * Both keys are omitted entirely when the box is not ticked. An untouched
 * checkbox is not a declined consent to be recorded; it is nothing happening.
 */
const consent = (form: HTMLFormElement): Record<string, string> => {
  const box = form.querySelector<HTMLInputElement>('input[name="marketing-consent"]');
  if (!box?.checked) return {};
  const label = form.querySelector<HTMLLabelElement>(`label[for="${box.id}"]`);
  return {
    marketing_consent: 'yes',
    consent_text: (label?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 500),
  };
};

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
    /* NO CROSS-FIELD RULE ANY MORE. This form used to accept "phone OR
       email, one is enough", which `required` cannot express and
       `contactMethodProblem` checked by hand. The reference field set marks
       both required, so the browser states the rule on its own and the hook
       has nothing left to add. */

    payload: (f) => ({
      form_id: f.dataset.formId ?? 'quick-quote',
      /* One name in the database, two boxes on screen. Composed here so the
         endpoint and the notification email see the shape they always saw. */
      name: [fieldValue(f, 'first-name'), fieldValue(f, 'last-name')].filter(Boolean).join(' '),
      phone: fieldValue(f, 'phone'),
      email: fieldValue(f, 'email'),
      /* A street address now, where this field carried "postal code or city"
         before. Both are addresses and both are what the visitor typed, so
         they share a column; see migrations/0007_province.sql. */
      address: fieldValue(f, 'address'),
      province: fieldValue(f, 'province'),
      message: fieldValue(f, 'message'),
      page_url: location.href,

      /* Express marketing consent. An unticked checkbox posts nothing at all,
         so this reads `.checked` rather than a field value — an absent value
         has to mean NO, which is what CASL assumes by default. */
      ...consent(f),
    }),

    onSuccess: confirm,
    /* Mimics success without storing, navigating or reporting a conversion. */
    onHoneypot: confirm,
    onError: fail,
  });
}

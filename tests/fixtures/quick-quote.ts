/**
 * The short quote form's field contract, in one place.
 *
 * Two suites need it and they need it to be the same thing:
 *
 *   tests/quick-quote.test.ts   builds a DOM from `quickQuoteMarkup()` and
 *                               exercises the behaviour in happy-dom.
 *   tests/build/quote-page.test.ts
 *                               builds the real site and asserts the rendered
 *                               `QuickQuoteForm.astro` matches `FIELDS`.
 *
 * That pairing is what stops the usual failure of a hand-built fixture: a unit
 * test that passes against markup the component stopped emitting six commits
 * ago. The fixture proves the behaviour; the build test proves the fixture is
 * still a description of the component.
 */

import { SERVICE_OPTIONS } from '../../src/data/services';

export interface FieldSpec {
  name: string;
  /** The tag the control is rendered as. */
  tag: 'input' | 'select' | 'textarea';
  /** `type` attribute, for inputs. */
  type?: string;
  required: boolean;
  autocomplete?: string;
  inputmode?: string;
  /** Whether a `[data-qq-error="<key>"]` slot exists for it. */
  errorKey?: string;
}

/**
 * Every visible control, in document order, except the service checkboxes
 * (eight of one name, listed in `SERVICE_OPTIONS`).
 *
 * The original site's WPForms form 1381, as the client asked for it back
 * (2026-10-22): Name, Name of Business, a four-box address, Email, Phone, the
 * services checklist and Additional comments. Every box but the checklist
 * and the comments is required.
 */
export const FIELDS: FieldSpec[] = [
  { name: 'name', tag: 'input', type: 'text', required: true, autocomplete: 'name', errorKey: 'name' },
  {
    name: 'business-name',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'organization',
    errorKey: 'business-name',
  },
  {
    name: 'address1',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'address-line1',
    errorKey: 'address1',
  },
  { name: 'city', tag: 'input', type: 'text', required: true, autocomplete: 'address-level2', errorKey: 'city' },
  {
    name: 'province',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'address-level1',
    errorKey: 'province',
  },
  { name: 'postal', tag: 'input', type: 'text', required: true, autocomplete: 'postal-code', errorKey: 'postal' },
  {
    name: 'email',
    tag: 'input',
    type: 'email',
    required: true,
    autocomplete: 'email',
    inputmode: 'email',
    errorKey: 'email',
  },
  { name: 'phone', tag: 'input', type: 'tel', required: true, autocomplete: 'tel', inputmode: 'tel', errorKey: 'phone' },
  { name: 'message', tag: 'textarea', required: false },
];

/**
 * Names the form must never ask for: the qualification questions (square
 * footage, frequency) that belong in the account executive's first call, and
 * the second address line the original never had.
 */
export const BANNED_FIELDS = ['address2', 'street', 'size', 'facility_size', 'frequency', 'square-feet'] as const;

export const REQUIRED_COUNT = FIELDS.filter((f) => f.required).length;

/**
 * A DOM copy of the component, for the behavioural suite.
 *
 * Kept deliberately close to `QuickQuoteForm.astro` — same names, same
 * `required`, same error slots, same honeypot, same hidden token field that
 * `SpamGuard` injects. `novalidate` matters: the component carries it, and
 * without it happy-dom would never dispatch the submit the pipeline listens
 * for once a required field is empty.
 */
export function quickQuoteMarkup({
  token = 'turnstile-token',
  honeypot = '',
  id = 'quote',
}: { token?: string | null; honeypot?: string; id?: string } = {}): string {
  const input = (spec: FieldSpec) =>
    spec.tag === 'textarea'
      ? `<label for="${id}-${spec.name}">${spec.name}</label>
         <textarea id="${id}-${spec.name}" name="${spec.name}" rows="5"></textarea>`
      : `<label for="${id}-${spec.name}">${spec.name}</label>
         <input type="${spec.type}" id="${id}-${spec.name}" name="${spec.name}"
                ${spec.autocomplete ? `autocomplete="${spec.autocomplete}"` : ''}
                ${spec.inputmode ? `inputmode="${spec.inputmode}"` : ''}
                ${spec.name === 'province' ? 'value="Ontario"' : ''}
                ${spec.required ? 'required' : ''} aria-describedby="${id}-${spec.name}-error" />
         <p class="qq-error" id="${id}-${spec.name}-error" data-qq-error="${spec.name}"></p>`;

  const before = FIELDS.filter((f) => f.name !== 'message');
  const comments = FIELDS.find((f) => f.name === 'message')!;

  return `
    <form class="qq" id="${id}" method="post" action="#" novalidate
          data-endpoint="/api/submit-lead" data-form-id="quick-quote" data-quick-quote
          aria-label="Request a quote">
      <div class="qq-summary" data-qq-summary role="alert" aria-live="assertive" tabindex="-1"></div>

      ${before.map(input).join('\n')}

      <fieldset>
        <legend>I'm interested in a quote for these services</legend>
        <ul>
          ${SERVICE_OPTIONS.map(
            (s, i) =>
              `<li><input type="checkbox" id="${id}-service-${i}" name="services" value="${s}" />` +
              `<label for="${id}-service-${i}">${s}</label></li>`
          ).join('')}
        </ul>
      </fieldset>

      ${input(comments)}

      <div class="qq-hp" aria-hidden="true">
        <label for="${id}-hp">Company website</label>
        <input type="text" id="${id}-hp" name="company-website" tabindex="-1" value="${honeypot}" />
      </div>

      <div class="spamguard">
        <div class="cf-turnstile" data-response-field-name="cf-turnstile-response"></div>
        ${token === null ? '' : `<input type="hidden" name="cf-turnstile-response" value="${token}" />`}
      </div>

      <button class="qq-submit" type="submit">Get my free quote</button>
    </form>`;
}

/** Fill the fixture the way a visitor would, field by field. */
export function fill(
  form: HTMLFormElement,
  values: Record<string, string>
): void {
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (!el) throw new Error(`fixture has no field named "${name}"`);
    el.value = value;
  }
}

/**
 * A complete submission: every required box filled. The services checklist
 * and the comments are optional and are ticked/typed with `tick` and `fill`
 * where a test needs them.
 */
export const VALID_LEAD = {
  name: 'Dana Okonkwo',
  'business-name': 'Placeholder Holdings',
  address1: '716 Gordon Baker Rd., Ste. 201',
  city: 'North York',
  province: 'Ontario',
  postal: 'm2h 3b4',
  email: 'dana@placeholder-holdings.example',
  phone: '416 555 0142',
};

/** Tick service checkboxes by their value. */
export function tick(form: HTMLFormElement, services: string[]): void {
  for (const service of services) {
    const box = form.querySelector<HTMLInputElement>(`input[name="services"][value="${service}"]`);
    if (!box) throw new Error(`fixture has no service "${service}"`);
    box.checked = true;
  }
}

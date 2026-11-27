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
 * Every visible control, in document order.
 *
 * Since 27 Nov 2026 (client): Name, Name of Business, Email, Phone
 * (optional), City, one Service dropdown (optional) and Additional comments.
 * Until then it copied the original's WPForms form 1381, with a four-box
 * address, a required phone and an eight-box service checklist.
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
    name: 'email',
    tag: 'input',
    type: 'email',
    required: true,
    autocomplete: 'email',
    inputmode: 'email',
    errorKey: 'email',
  },
  { name: 'phone', tag: 'input', type: 'tel', required: false, autocomplete: 'tel', inputmode: 'tel', errorKey: 'phone' },
  { name: 'city', tag: 'input', type: 'text', required: true, autocomplete: 'address-level2', errorKey: 'city' },
  { name: 'services', tag: 'select', required: false },
  { name: 'message', tag: 'textarea', required: false },
];

/**
 * Names the form must never ask for: the qualification questions (square
 * footage, frequency) that belong in the account executive's first call, and
 * the second address line the original never had.
 */
export const BANNED_FIELDS = [
  'address1',
  'address2',
  'street',
  'province',
  'postal',
  'size',
  'facility_size',
  'frequency',
  'square-feet',
] as const;

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
    spec.tag === 'select'
      ? `<label for="${id}-${spec.name}">${spec.name}</label>
         <select id="${id}-${spec.name}" name="${spec.name}">
           <option value="">Choose one</option>
           ${SERVICE_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
         </select>`
      : spec.tag === 'textarea'
      ? `<label for="${id}-${spec.name}">${spec.name}</label>
         <textarea id="${id}-${spec.name}" name="${spec.name}" rows="5"></textarea>`
      : `<label for="${id}-${spec.name}">${spec.name}</label>
         <input type="${spec.type}" id="${id}-${spec.name}" name="${spec.name}"
                ${spec.autocomplete ? `autocomplete="${spec.autocomplete}"` : ''}
                ${spec.inputmode ? `inputmode="${spec.inputmode}"` : ''}
                ${spec.name === 'phone' ? 'pattern="(?:\\D*\\d){7,}\\D*"' : ''}
                ${spec.required ? 'required' : ''} aria-describedby="${id}-${spec.name}-error" />
         <p class="qq-error" id="${id}-${spec.name}-error" data-qq-error="${spec.name}"></p>`;

  return `
    <form class="qq" id="${id}" method="post" action="#" novalidate
          data-endpoint="/api/submit-lead" data-form-id="quick-quote" data-quick-quote
          aria-label="Request a quote">
      <div class="qq-summary" data-qq-summary role="alert" aria-live="assertive" tabindex="-1"></div>

      ${FIELDS.map(input).join('\n')}

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
 * A complete submission: every required box filled. Phone, the service and
 * the comments are optional and are set with `fill` or `choose` where a test
 * needs them.
 */
export const VALID_LEAD = {
  name: 'Dana Okonkwo',
  'business-name': 'Placeholder Holdings',
  email: 'dana@placeholder-holdings.example',
  phone: '416 555 0142',
  city: 'North York',
};

/** Pick a service in the dropdown by its value. */
export function choose(form: HTMLFormElement, service: string): void {
  const select = form.querySelector<HTMLSelectElement>('select[name="services"]');
  if (!select) throw new Error('fixture has no service dropdown');
  if (![...select.options].some((o) => o.value === service)) throw new Error(`fixture has no service "${service}"`);
  select.value = service;
}

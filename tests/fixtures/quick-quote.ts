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
 * SEVEN fields, TWO of which are one either/or pair, and FOUR required —
 * against eighteen and nine on the form this replaces. `phone` and `email` are
 * deliberately `required: false`: the rule is "one of the two", which HTML
 * cannot state, so it lives in `contactMethodProblem` and is tested there.
 */
export const FIELDS: FieldSpec[] = [
  {
    name: 'first-name',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'given-name',
    errorKey: 'first-name',
  },
  {
    name: 'business-name',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'organization',
    errorKey: 'business-name',
  },
  {
    name: 'phone',
    tag: 'input',
    type: 'tel',
    required: false,
    autocomplete: 'tel',
    inputmode: 'tel',
    errorKey: 'contact',
  },
  {
    name: 'email',
    tag: 'input',
    type: 'email',
    required: false,
    autocomplete: 'email',
    inputmode: 'email',
    errorKey: 'contact',
  },
  {
    name: 'postal',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'postal-code',
    errorKey: 'postal',
  },
  { name: 'services', tag: 'select', required: true, errorKey: 'services' },
  { name: 'message', tag: 'textarea', required: false },
];

/** Names the form must never ask for. Each was on the form it replaces. */
export const BANNED_FIELDS = [
  'last-name',
  'lastName',
  'address1',
  'address2',
  'street',
  'city',
  'state',
  'province',
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
  const err = (key: string) => `<p class="qq-error" id="${id}-${key}-error" data-qq-error="${key}"></p>`;
  return `
    <form class="qq" id="${id}" method="post" action="#" novalidate
          data-endpoint="/api/submit-lead" data-form-id="quick-quote" data-quick-quote
          aria-label="Request a quote">
      <div class="qq-summary" data-qq-summary role="alert" aria-live="assertive" tabindex="-1"></div>

      <label for="${id}-first">First name</label>
      <input type="text" id="${id}-first" name="first-name" autocomplete="given-name" required
             aria-describedby="${id}-first-name-error" />
      ${err('first-name')}

      <label for="${id}-business">Business name</label>
      <input type="text" id="${id}-business" name="business-name" autocomplete="organization" required
             aria-describedby="${id}-business-name-error" />
      ${err('business-name')}

      <fieldset class="qq-contact">
        <legend>How should we reach you?</legend>
        <label for="${id}-phone">Phone</label>
        <input type="tel" id="${id}-phone" name="phone" inputmode="tel" autocomplete="tel"
               aria-describedby="${id}-contact-error" />
        <label for="${id}-email">Email</label>
        <input type="email" id="${id}-email" name="email" inputmode="email" autocomplete="email"
               aria-describedby="${id}-contact-error" />
        ${err('contact')}
      </fieldset>

      <label for="${id}-postal">Postal code or city</label>
      <input type="text" id="${id}-postal" name="postal" autocomplete="postal-code" required
             aria-describedby="${id}-postal-error" />
      ${err('postal')}

      <label for="${id}-service">Service needed</label>
      <select id="${id}-service" name="services" required aria-describedby="${id}-services-error">
        <option value="">Choose one…</option>
        <option value="Office cleaning &amp; janitorial">Office cleaning &amp; janitorial</option>
      </select>
      ${err('services')}

      <label for="${id}-message">Anything we should know?</label>
      <textarea id="${id}-message" name="message" rows="3"></textarea>

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

/** The minimum a lead needs, with a phone as the contact method. */
export const VALID_PHONE_ONLY = {
  'first-name': 'Dana',
  'business-name': 'Placeholder Holdings Inc',
  phone: '416 555 0142',
  email: '',
  postal: 'M5V 1Z4',
  services: 'Office cleaning & janitorial',
};

/** The same, with an email instead. */
export const VALID_EMAIL_ONLY = {
  ...VALID_PHONE_ONLY,
  phone: '',
  email: 'dana@placeholder-holdings.example',
};

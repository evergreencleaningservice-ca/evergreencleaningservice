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

import { SERVICE_OPTIONS, SERVICE_OTHER } from '../../src/data/services';

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
/**
 * The reference design's field set, adopted wholesale.
 *
 * WHAT CHANGED AND WHY IT IS WORTH READING. This form was deliberately short
 * — first name, business name, phone OR email, postal code, one service
 * select — because it is what cold paid traffic sees and every field is a
 * place to give up. That is now replaced by the client's chosen reference:
 * four fields, ALL REQUIRED.

 * A street address and a province were asked for on one revision in between
 * and taken back out: where the building is is a question the account
 * executive asks on the call, not a condition of making contact. First and
 * last name were two boxes for one revision and are now one, which is what
 * the database always stored anyway.
 *
 * It asks more and it will convert somewhat worse; that is a business
 * decision the client made with the trade-off in front of them, not an
 * oversight. What it buys is a lead that can be dispatched without a
 * qualifying call.
 *
 * Gone: `business-name`, `postal`, the `services` select, and the `address`
 * and `province` boxes that briefly replaced the postal one. Their columns
 * survive in the database — earlier leads answered them, and `address` is
 * still filled by the contact form on /contact-us/.
 *
 * Note every field now has its OWN error key. The old form shared one
 * `contact` slot between phone and email, because the rule was "either of
 * these"; with both required there is a separate thing to say about each.
 */
export const FIELDS: FieldSpec[] = [
  {
    name: 'name',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'name',
    errorKey: 'name',
  },
  {
    name: 'phone',
    tag: 'input',
    type: 'tel',
    required: true,
    autocomplete: 'tel',
    inputmode: 'tel',
    errorKey: 'phone',
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
  { name: 'service', tag: 'select', required: true, errorKey: 'service' },
  /**
   * `required: false` AS RENDERED, and that is the assertion, not an
   * oversight. The box is hidden until "Other" is picked, and a hidden
   * control that is `required` fails validation where nobody can see it.
   * `wireServiceOther` adds the attribute at the moment it reveals the box
   * and removes it again when it hides it, so the served markup must ship
   * WITHOUT it. A build test that demanded `required` here would be
   * demanding the bug.
   */
  { name: 'message', tag: 'textarea', required: false, errorKey: 'message' },
];

/**
 * Names the form must never ask for.
 *
 * MUCH SHORTER THAN IT WAS. This list began as "everything the eighteen-field
 * form asked that the short form refused", and `last-name`, `address1`,
 * `city`, `state` and `province` were on it — the short form existed to not
 * ask those. The client has since chosen the reference design, which asks for
 * a surname, a street address and a province, so keeping them banned would be
 * testing a decision that was reversed.
 *
 * What stays banned is what NOTHING on the site asks for and nothing should
 * start asking for without a deliberate change: the split address lines, and
 * the qualification questions (square footage, frequency) that belong in the
 * account executive's first call rather than in front of a stranger.
 */
export const BANNED_FIELDS = [
  'address1',
  'address2',
  'street',
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

      <label for="${id}-name">Full name</label>
      <input type="text" id="${id}-name" name="name" autocomplete="name" required
             aria-describedby="${id}-name-error" />
      ${err('name')}

      <label for="${id}-phone">Mobile phone</label>
      <input type="tel" id="${id}-phone" name="phone" inputmode="tel" autocomplete="tel" required
             aria-describedby="${id}-phone-error" />
      ${err('phone')}

      <label for="${id}-email">Email</label>
      <input type="email" id="${id}-email" name="email" inputmode="email" autocomplete="email" required
             aria-describedby="${id}-email-error" />
      ${err('email')}

      <label for="${id}-service">Cleaning needs</label>
      <select id="${id}-service" name="service" required aria-describedby="${id}-service-error">
        <option value="" disabled selected>Select the service you need</option>
        ${SERVICE_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
      </select>
      ${err('service')}

      <div class="qq-field" data-qq-other hidden>
        <label for="${id}-message">Tell us what you need</label>
        <textarea id="${id}-message" name="message" rows="3"
                  aria-describedby="${id}-message-error"></textarea>
        ${err('message')}
      </div>

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
 * A complete submission. Every field on the reference form is required, so
 * there is no longer a "minimum" that omits one — this IS the minimum.
 *
 * `VALID_PHONE_ONLY` and `VALID_EMAIL_ONLY` are gone with the rule they
 * existed for: the form used to take a phone OR an email and those two
 * constants were the two shapes that satisfied it. Both are now required.
 */
export const VALID_LEAD = {
  name: 'Dana Okonkwo',
  phone: '416 555 0142',
  email: 'dana@placeholder-holdings.example',
  service: 'Office Cleaning',
};

/**
 * The other branch: "Other" picked, so the free-text box is revealed and
 * required, and the detail is part of a complete submission.
 */
export const VALID_LEAD_OTHER = {
  name: 'Dana Okonkwo',
  phone: '416 555 0142',
  email: 'dana@placeholder-holdings.example',
  service: SERVICE_OTHER,
  message: 'Pressure washing the loading dock, quarterly.',
};

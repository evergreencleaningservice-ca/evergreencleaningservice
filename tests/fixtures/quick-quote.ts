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
/**
 * The reference design's field set, adopted wholesale.
 *
 * WHAT CHANGED AND WHY IT IS WORTH READING. This form was deliberately short
 * — first name, business name, phone OR email, postal code, one service
 * select — because it is what cold paid traffic sees and every field is a
 * place to give up. That is now replaced by the client's chosen reference:
 * seven fields, ALL REQUIRED, including a surname, a street address and a
 * province.
 *
 * It asks more and it will convert somewhat worse; that is a business
 * decision the client made with the trade-off in front of them, not an
 * oversight. What it buys is a lead that can be dispatched without a
 * qualifying call.
 *
 * Gone: `business-name`, `postal` and the `services` select. Their columns
 * survive in the database because 23 earlier leads answered them.
 *
 * Note every field now has its OWN error key. The old form shared one
 * `contact` slot between phone and email, because the rule was "either of
 * these"; with both required there is a separate thing to say about each.
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
    name: 'last-name',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'family-name',
    errorKey: 'last-name',
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
  {
    name: 'address',
    tag: 'input',
    type: 'text',
    required: true,
    autocomplete: 'street-address',
    errorKey: 'address',
  },
  { name: 'province', tag: 'select', required: true, errorKey: 'province' },
  { name: 'message', tag: 'textarea', required: true, errorKey: 'message' },
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

      <label for="${id}-first">First name</label>
      <input type="text" id="${id}-first" name="first-name" autocomplete="given-name" required
             aria-describedby="${id}-first-name-error" />
      ${err('first-name')}

      <label for="${id}-last">Last name</label>
      <input type="text" id="${id}-last" name="last-name" autocomplete="family-name" required
             aria-describedby="${id}-last-name-error" />
      ${err('last-name')}

      <label for="${id}-phone">Mobile phone</label>
      <input type="tel" id="${id}-phone" name="phone" inputmode="tel" autocomplete="tel" required
             aria-describedby="${id}-phone-error" />
      ${err('phone')}

      <label for="${id}-email">Work email</label>
      <input type="email" id="${id}-email" name="email" inputmode="email" autocomplete="email" required
             aria-describedby="${id}-email-error" />
      ${err('email')}

      <label for="${id}-address">Address</label>
      <input type="text" id="${id}-address" name="address" autocomplete="street-address" required
             aria-describedby="${id}-address-error" />
      ${err('address')}

      <label for="${id}-province">Province</label>
      <select id="${id}-province" name="province" required aria-describedby="${id}-province-error">
        <option value=""></option>
        <option value="Ontario">Ontario</option>
      </select>
      ${err('province')}

      <label for="${id}-message">Cleaning needs</label>
      <textarea id="${id}-message" name="message" rows="4" required
                aria-describedby="${id}-message-error"></textarea>
      ${err('message')}

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
  'first-name': 'Dana',
  'last-name': 'Okonkwo',
  phone: '416 555 0142',
  email: 'dana@placeholder-holdings.example',
  address: '243 Queen St W',
  province: 'Ontario',
  message: 'Two floors of open-plan office, nightly.',
};

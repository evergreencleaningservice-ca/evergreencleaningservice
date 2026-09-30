/**
 * What the active captcha provider puts into a form, for the build tests that
 * inspect emitted HTML. `captcha.provider` in src/data/site.ts decides which
 * one renders, so the tests ask it rather than assuming either.
 *
 *   Turnstile   invisible; a `.cf-turnstile` div, deferred api.js, and a
 *               hidden `cf-turnstile-response` input Cloudflare inserts itself
 *   reCAPTCHA   the v2 checkbox; a `.g-recaptcha` div plus our own
 *               `g-recaptcha-hidden` text input, which is `required` so the
 *               form cannot submit unticked
 */
import { captcha } from '../../src/data/site';

export const TURNSTILE = captcha.provider === 'turnstile';

/** The token field's name, which is not one of the form's questions. */
export const CAPTCHA_FIELD = TURNSTILE ? 'cf-turnstile-response' : 'g-recaptcha-hidden';

/** The widget's container markup. */
export const CAPTCHA_MARKUP = TURNSTILE ? /class="cf-turnstile"/ : /class="g-recaptcha"/;

/**
 * `required` attributes in `form` that belong to the captcha rather than to a
 * question — zero for Turnstile, one per reCAPTCHA widget.
 */
export const captchaRequired = (form: string): number =>
  TURNSTILE ? 0 : (form.match(/name="g-recaptcha-hidden"[^>]*\brequired\b/g) ?? []).length;

/**
 * `required` attributes on the form's questions. Scripts are cut out first:
 * the reCAPTCHA component emits its loader inside the form, and its source
 * says `hidden.required = false`, which a count of the word would include.
 */
export const questionRequiredCount = (form: string): number => {
  const markup = form.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  return (markup.match(/\brequired(?=[\s/>])/g) ?? []).length - captchaRequired(markup);
};

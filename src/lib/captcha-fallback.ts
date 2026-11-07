/**
 * The way round the CAPTCHA, offered at the moment the CAPTCHA stops someone.
 *
 * SEO re-audit, 7 Nov 2026 (agentic findings 1 and 2, action plan item 12).
 * The quote page already says, above the form, that the same details can be
 * emailed or phoned in. But a person whose checkbox will not tick, or an
 * assistant filling the form for someone, meets the refusal in the form's
 * error summary, not in the intro they read a minute earlier. So when the
 * summary is reporting a CAPTCHA failure, the same email and phone are added
 * to it as real `mailto:` and `tel:` links.
 *
 * TWO WAYS THE CAPTCHA FAILS, and both are read from state the pipeline
 * already keeps, never from the wording of a message:
 *
 *   before sending   the reCAPTCHA token field (`g-recaptcha-hidden`, which
 *                    is `required`) is still invalid, so `quick-quote.ts`
 *                    put "Please tick "I'm not a robot"" in the summary;
 *   after sending    the Worker answered 403 and `lead-submit.ts` wrote
 *                    `MESSAGES.captcha`. Turnstile only fails this way.
 *
 * Every other error (a missing field, a server error, no network) is left as
 * it is: those already say what to do, and the server and network ones
 * already give the phone number.
 *
 * Built in the browser rather than shipped in the markup: a `<template>` with
 * a `tel:` link in it would sit in the HTML of every page that carries the
 * sidebar form, where the build tests count telephone links as page content.
 * The contact details come from `nap`, the one definition of them.
 */
import { nap } from '../data/site';
import { MESSAGES } from './lead-submit';

/** Marks the added sentence, so it is added once per message. */
export const FALLBACK_ATTR = 'data-qq-fallback';

export interface FallbackContact {
  email: string;
  phoneDisplay: string;
  phoneHref: string;
}

const NAP_CONTACT: FallbackContact = {
  email: nap.email,
  phoneDisplay: nap.phoneDisplay,
  phoneHref: nap.phoneHref,
};

/** Is the message now in `summary` the CAPTCHA refusing the visitor? */
export function isCaptchaFailure(form: HTMLFormElement, summary: HTMLElement): boolean {
  const text = summary.textContent ?? '';
  if (!text) return false;
  if (text.startsWith(MESSAGES.captcha)) return true;
  const token = form.querySelector<HTMLInputElement>('input[name="g-recaptcha-hidden"]');
  return !!token && token.required && !token.validity.valid;
}

/** Add the email and phone alternative to the summary, once. */
export function appendFallback(
  summary: HTMLElement,
  contact: FallbackContact = NAP_CONTACT
): void {
  if (summary.querySelector(`[${FALLBACK_ATTR}]`)) return;
  const doc = summary.ownerDocument;

  const mail = doc.createElement('a');
  mail.href = `mailto:${contact.email}`;
  mail.textContent = contact.email;
  mail.setAttribute('data-cta-location', 'content');

  const tel = doc.createElement('a');
  tel.href = contact.phoneHref;
  tel.textContent = contact.phoneDisplay;
  tel.setAttribute('data-call-location', 'content');

  const note = doc.createElement('span');
  note.setAttribute(FALLBACK_ATTR, '');
  note.append(
    ' If the check will not work for you, email the same details to ',
    mail,
    ' or call ',
    tel,
    ' and we reply the same way.'
  );
  summary.append(note);
}

/**
 * Watch one quick-quote form's error summary.
 *
 * A MutationObserver rather than a hook in the submit pipeline: the summary
 * is written by two modules on three paths, and watching the one element
 * they all write to keeps this out of their way. Each new attempt clears the
 * summary (`textContent = ''`), which removes the sentence with it.
 */
export function wireCaptchaFallback(
  form: HTMLFormElement,
  contact: FallbackContact = NAP_CONTACT
): void {
  const summary = form.querySelector<HTMLElement>('[data-qq-summary]');
  if (!summary || summary.dataset.fallbackWired === 'true') return;
  summary.dataset.fallbackWired = 'true';

  const check = () => {
    if (isCaptchaFailure(form, summary)) appendFallback(summary, contact);
  };
  new MutationObserver(check).observe(summary, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

/**
 * The CAPTCHA fallback in the quote form's error summary (SEO re-audit,
 * 7 Nov 2026, agentic finding 2).
 *
 * Runs `wireQuickQuote` and `wireCaptchaFallback` together, as
 * `QuickQuoteForm.astro`'s script does, on the shared form fixture. The rule:
 * the email and phone alternative appears, as real links, when the CAPTCHA
 * is what stopped the visitor, and only then.
 */
import { describe, expect, it, vi } from 'vitest';
import { wireQuickQuote } from '../src/lib/quick-quote';
import { FALLBACK_ATTR, wireCaptchaFallback } from '../src/lib/captcha-fallback';
import { MESSAGES } from '../src/lib/lead-submit';
import { nap } from '../src/data/site';
import { VALID_LEAD, fill, quickQuoteMarkup } from './fixtures/quick-quote';

const RECAPTCHA_FIELD =
  '<input type="text" name="g-recaptcha-hidden" class="wpf-recaptcha-hidden" tabindex="-1" aria-hidden="true" required>';

function mount({ recaptcha = false, token = 'turnstile-token' as string | null } = {}) {
  document.body.innerHTML = quickQuoteMarkup({ token });
  const form = document.querySelector<HTMLFormElement>('form[data-quick-quote]')!;
  if (recaptcha) form.insertAdjacentHTML('beforeend', RECAPTCHA_FIELD);
  wireQuickQuote(form, { tokenWaitMs: 50, tagDeliveryTimeoutMs: 50 });
  wireCaptchaFallback(form);
  return form;
}

async function submit(form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 200));
}

const summary = () => document.querySelector<HTMLElement>('[data-qq-summary]')!;
const fallback = () => summary().querySelectorAll(`[${FALLBACK_ATTR}]`);
const status = (code: number) => new Response(JSON.stringify({ error: 'no' }), { status: code });

describe('the CAPTCHA fallback', () => {
  it('follows the "not a robot" message with mailto: and tel: links', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(200));
    const form = mount({ recaptcha: true });
    fill(form, VALID_LEAD);

    await submit(form);

    expect(spy).not.toHaveBeenCalled();
    expect(summary().textContent).toContain("I'm not a robot");
    expect(fallback()).toHaveLength(1);
    expect(summary().querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe(
      `mailto:${nap.email}`
    );
    const tel = summary().querySelector('a[href^="tel:"]');
    expect(tel?.getAttribute('href')).toBe(nap.phoneHref);
    expect(tel?.textContent).toBe(nap.phoneDisplay);
    expect(tel?.getAttribute('data-call-location')).toBe('content');
    expect(summary().textContent).toContain(nap.email);
  });

  it('is offered when the CAPTCHA is one of several problems', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(200));
    const form = mount({ recaptcha: true });
    fill(form, { ...VALID_LEAD, name: '', phone: '' });

    await submit(form);

    expect(summary().textContent).toMatch(/3 things need a moment/);
    expect(fallback()).toHaveLength(1);
  });

  it('follows the server refusing the token (403)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const form = mount();
    fill(form, VALID_LEAD);

    await submit(form);

    expect(summary().textContent?.startsWith(MESSAGES.captcha)).toBe(true);
    expect(fallback()).toHaveLength(1);
    expect(summary().querySelector('a[href^="tel:"]')).not.toBeNull();
  });

  it('is added once, however often the check fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(403));
    const form = mount();
    fill(form, VALID_LEAD);

    await submit(form);
    await submit(form);

    expect(summary().textContent?.startsWith(MESSAGES.captcha)).toBe(true);
    expect(fallback()).toHaveLength(1);
  });

  it('is not added for a missing field when the CAPTCHA is fine', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(200));
    const form = mount();
    fill(form, { ...VALID_LEAD, name: '' });

    await submit(form);

    expect(summary().textContent).toBe('Please add your name.');
    expect(fallback()).toHaveLength(0);
  });

  it('is not added to a server error, which already gives the phone number', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(status(500));
    const form = mount();
    fill(form, VALID_LEAD);

    await submit(form);

    expect(summary().textContent).toBe(MESSAGES.server);
    expect(fallback()).toHaveLength(0);
  });
});

/**
 * reCAPTCHA loads on intent, never on arrival.
 *
 * Runs the component's real inline loader in happy-dom and watches for the
 * api.js <script> it injects. On arrival nothing may be injected; focusing a
 * field must inject it, exactly once.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/components/Recaptcha.astro'), 'utf8');
const loader = source.match(/<script is:inline>([\s\S]*?)<\/script>/)![1];

const apiScripts = () =>
  [...document.querySelectorAll('script')].filter((s) => s.src.includes('recaptcha/api.js'));

beforeEach(() => {
  delete (window as unknown as Record<string, unknown>).__wpfRecaptcha;
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <form id="f"><input id="name" name="name" />
      <div class="wpf-recaptcha"><div class="g-recaptcha" data-sitekey="k"></div>
      <input class="wpf-recaptcha-hidden" name="g-recaptcha-hidden" required /></div>
    </form>`;
  new Function(loader)();
});

describe('reCAPTCHA loader', () => {
  it('injects nothing on arrival', () => {
    expect(apiScripts()).toHaveLength(0);
  });

  it('explains itself if submitted before the widget exists', () => {
    const hidden = document.querySelector<HTMLInputElement>('.wpf-recaptcha-hidden')!;
    expect(hidden.validationMessage || hidden.validity.customError).toBeTruthy();
  });

  it('injects api.js once when a field is focused', () => {
    const input = document.getElementById('name')!;
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(apiScripts()).toHaveLength(1);
    expect(apiScripts()[0].src).toContain('render=explicit');
  });
});

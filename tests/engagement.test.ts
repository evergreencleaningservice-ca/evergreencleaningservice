/**
 * The secondary measurement events: form_start, lead_form_error,
 * email_click and quote_cta_click.
 *
 * What matters most here is the same as for the conversion: each action is
 * reported once, and nothing a visitor typed can reach the dataLayer.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  EMAIL_EVENT,
  FORM_ERROR_EVENT,
  FORM_START_EVENT,
  QUOTE_CTA_EVENT,
  isQuoteLink,
  pushFormError,
  wireEngagement,
} from '../src/lib/engagement';

type Entry = Record<string, unknown>;
const layer = () => ((window as Window & { dataLayer?: Entry[] }).dataLayer ?? []) as Entry[];
const events = (name: string) => layer().filter((e) => e.event === name);

function page(): void {
  document.body.innerHTML = `
    <form id="lead" data-endpoint="/api/submit-lead" data-form-id="quick-quote">
      <input name="name" id="name" />
      <input name="email" id="email" />
      <div class="qq-hp" aria-hidden="true"><input name="company-website" id="hp" /></div>
    </form>
    <form id="second" data-endpoint="/api/submit-lead" data-form-id="lp-office-cleaning">
      <input name="name" id="name2" />
    </form>
    <form id="comment" data-endpoint="/api/submit-post" data-form-id="comment">
      <input name="body" id="body" />
    </form>
    <a id="mail" href="mailto:info@evergreencleaningservice.ca" data-cta-location="footer">Email</a>
    <a id="quote" href="/request-a-quote/" data-cta-location="hero">Get a quote</a>
    <a id="anchor" href="#lpq-form" data-quote-cta data-cta-location="paid_sticky">Quote</a>
    <a id="other" href="/services/">Services</a>
    <a id="tel" href="tel:+14168034880">Call</a>`;
}

const focus = (id: string) =>
  document.getElementById(id)!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
const type = (id: string, value: string) => {
  const el = document.getElementById(id) as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
const click = (id: string) =>
  document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

/* One document for the file: the listeners are bound once, by design. */
wireEngagement();
/* happy-dom follows a clicked link; the page under test must stay put. The
   engagement listener runs in the capture phase, before this. */
document.addEventListener('click', (e) => e.preventDefault());

beforeEach(() => {
  (window as Window & { dataLayer?: Entry[] }).dataLayer = [];
  page();
});

describe('form_start', () => {
  it('fires once per lead form, however many fields are touched', () => {
    focus('name');
    type('name', 'Jane');
    focus('email');
    type('email', 'jane@example.com');
    expect(events(FORM_START_EVENT)).toEqual([{ event: FORM_START_EVENT, form_id: 'quick-quote' }]);
  });

  it('a second form on the same page starts separately', () => {
    focus('name');
    focus('name2');
    expect(events(FORM_START_EVENT).map((e) => e.form_id)).toEqual(['quick-quote', 'lp-office-cleaning']);
  });

  it('ignores forms that are not lead forms', () => {
    focus('body');
    expect(events(FORM_START_EVENT)).toHaveLength(0);
  });

  it('ignores the honeypot', () => {
    focus('hp');
    expect(events(FORM_START_EVENT)).toHaveLength(0);
  });

  it('never carries what was typed', () => {
    type('email', 'jane@example.com');
    expect(JSON.stringify(layer())).not.toContain('jane');
  });

  it('wiring twice does not double-report', () => {
    wireEngagement();
    focus('name');
    expect(events(FORM_START_EVENT)).toHaveLength(1);
  });
});

describe('email_click and quote_cta_click', () => {
  it('reports a mailto tap with its location and no address', () => {
    click('mail');
    expect(events(EMAIL_EVENT)).toEqual([
      { event: EMAIL_EVENT, page_path: location.pathname, link_location: 'footer' },
    ]);
    expect(JSON.stringify(layer())).not.toContain('info@');
  });

  it('reports links to the quote page and marked in-page anchors', () => {
    click('quote');
    click('anchor');
    expect(events(QUOTE_CTA_EVENT).map((e) => e.link_location)).toEqual(['hero', 'paid_sticky']);
  });

  it('ignores ordinary links and telephone links', () => {
    click('other');
    click('tel');
    expect(events(QUOTE_CTA_EVENT)).toHaveLength(0);
    expect(events(EMAIL_EVENT)).toHaveLength(0);
  });

  it('isQuoteLink refuses other origins', () => {
    const a = document.createElement('a');
    a.href = 'https://example.com/request-a-quote/';
    expect(isQuoteLink(a)).toBe(false);
  });
});

describe('lead_form_error', () => {
  it('carries the form id and a category only', () => {
    pushFormError('quick-quote', 'captcha');
    expect(events(FORM_ERROR_EVENT)).toEqual([
      { event: FORM_ERROR_EVENT, form_id: 'quick-quote', error_type: 'captcha' },
    ]);
  });

  it('cleans a form id it is handed', () => {
    pushFormError('quick quote <script>', 'server');
    expect(events(FORM_ERROR_EVENT)[0].form_id).toBe('quickquotescript');
  });
});

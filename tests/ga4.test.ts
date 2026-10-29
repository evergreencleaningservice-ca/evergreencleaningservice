/**
 * src/lib/ga4.ts: events reach GA4 as gtag commands, on production only,
 * with only plain site-chosen values, and never to Google Ads.
 */
import { describe, expect, it } from 'vitest';
import { GA4_ID, ga4Params, sendGa4 } from '../src/lib/ga4';

const fakeWindow = (hostname: string) =>
  ({ location: { hostname }, dataLayer: [] as unknown[] }) as unknown as Window & { dataLayer: unknown[] };

describe('sendGa4', () => {
  it('queues one gtag event command addressed to the GA4 stream only', () => {
    const w = fakeWindow('www.evergreencleaningservice.ca');
    sendGa4('form_start', { event: 'form_start', form_id: 'quick-quote' }, w);
    expect(w.dataLayer).toHaveLength(1);
    const cmd = Array.from(w.dataLayer[0] as ArrayLike<unknown>);
    expect(cmd).toEqual(['event', 'form_start', { form_id: 'quick-quote', send_to: GA4_ID }]);
    /* gtag.js ignores arrays; it must be a real arguments object. */
    expect(Object.prototype.toString.call(w.dataLayer[0])).toBe('[object Arguments]');
  });

  it('sends on the apex too', () => {
    const w = fakeWindow('evergreencleaningservice.ca');
    sendGa4('email_click', {}, w);
    expect(w.dataLayer).toHaveLength(1);
  });

  it('sends nothing on staging or anywhere else', () => {
    for (const host of ['stage.evergreencleaningservice.ca', 'localhost', 'evergreencleaningservice.ash-47a.workers.dev']) {
      const w = fakeWindow(host);
      sendGa4('form_start', { form_id: 'x' }, w);
      expect(w.dataLayer, host).toHaveLength(0);
    }
  });

  it('never throws', () => {
    expect(() => sendGa4('x', {}, {} as Window)).not.toThrow();
  });
});

describe('ga4Params', () => {
  it('keeps plain values and drops the dataLayer plumbing', () => {
    expect(
      ga4Params({
        event: 'lead_form_submission',
        form_id: 'lp-office-cleaning',
        eventCallback: () => {},
        eventTimeout: 2000,
        empty: '',
        nested: { a: 1 },
        count: 3,
        ok: true,
      })
    ).toEqual({ form_id: 'lp-office-cleaning', count: 3, ok: true });
  });

  it('caps strings at 100 characters, GA4’s parameter limit', () => {
    expect(ga4Params({ v: 'x'.repeat(150) }).v).toHaveLength(100);
  });
});

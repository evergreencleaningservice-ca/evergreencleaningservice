/**
 * Phase 2 closeout — one canonical conversion event, and only one.
 *
 * `lead_form_submission` is the site's single conversion. It is pushed by
 * `lead-submit.ts` after `/api/submit-lead` answers 2xx, and by nothing else.
 * `/thank-you/` pushes nothing: it consumes a one-time, non-PII success
 * marker so it can tell a genuine arrival from a reload, a bookmark, a
 * back-button return or someone simply opening the URL.
 *
 * Each `describe` below is one of the required proofs. The tests exercise the
 * real modules the pages import — `wireLeadForm` for the form, and
 * `applyThankYouConfirmation`, which is literally the function
 * `src/pages/thank-you.astro` calls — rather than a reimplementation of
 * either.
 *
 * GTM IS SIMULATED, NOT REAL. `installFakeGtm` behaves the way gtm.js does
 * with `eventCallback`/`eventTimeout`: it invokes the callback asynchronously
 * once it has "delivered" the tags. That proves this site holds the
 * navigation until the callback fires. It cannot prove the real container
 * does anything with the event — as of the Phase 1 baseline it has no trigger
 * for it at all. See `docs/gtm-handoff.md`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONFIRMATION_KEY,
  CONFIRMATION_TTL_MS,
  applyThankYouConfirmation,
  consumeLeadConfirmation,
  markLeadConfirmed,
} from '../src/lib/confirmation';
import { LEAD_EVENT, wireLeadForm } from '../src/lib/lead-submit';

/* --- the page under test, assembled the way a landing page is ------------ */

function buildForm(id = 'f') {
  document.body.innerHTML = `
    <form id="${id}" novalidate>
      <input name="fullName" value="Jane Doe" required />
      <input name="workEmail" type="email" value="jane@example.com" required />
      <input name="phone" value="416 555 0199" required />
      <select name="facilityType"><option value="Office" selected>Office</option></select>
      <input name="company_tax_id" value="" />
      <input type="hidden" name="cf-turnstile-response" value="token" />
      <button type="submit">Request Free Walkthrough</button>
    </form>`;
  return document.getElementById(id) as HTMLFormElement;
}

/** Records where a landing page would have navigated to. */
const navigations: string[] = [];

function wireLandingPage(
  form: HTMLFormElement,
  formId = 'ppc-lead-form',
  tagDeliveryTimeoutMs = 300
) {
  wireLeadForm(form, {
    formId,
    honeypots: ['company_tax_id'],
    tokenWaitMs: 20,
    tagDeliveryTimeoutMs,
    awaitTagDelivery: true,
    payload: () => ({ form_id: formId, name: 'Jane Doe', email: 'jane@example.com' }),
    eventParams: () => ({ facility_type: 'Office' }),
    onSuccess: () => navigations.push('/thank-you/'),
    onHoneypot: () => {},
    onError: () => {},
  });
}

/* --- the fake container -------------------------------------------------- */

/**
 * Behaves the way gtm.js does: wraps `dataLayer.push`, and for an event
 * carrying `eventCallback` invokes it asynchronously once the tags have been
 * "delivered". `delayMs` stands in for the beacons.
 */
function installFakeGtm(delayMs = 20) {
  const delivered: string[] = [];
  const layer = (window.dataLayer = window.dataLayer ?? []);
  const original = layer.push.bind(layer);
  layer.push = ((entry: Record<string, unknown>) => {
    const result = original(entry);
    const callback = entry.eventCallback as (() => void) | undefined;
    if (typeof callback === 'function') {
      setTimeout(() => {
        delivered.push(String(entry.event));
        callback();
      }, delayMs);
    }
    return result;
  }) as typeof layer.push;
  return { delivered };
}

/* --- helpers ------------------------------------------------------------- */

/** Every conversion event in the data layer, stripped of GTM's control keys. */
const conversions = () =>
  (window.dataLayer ?? [])
    .filter((entry) => entry.event === LEAD_EVENT)
    .map(({ eventCallback: _cb, eventTimeout: _to, ...data }) => data);

/** Anything at all that looks like it could be configured as a conversion. */
const allEvents = () => (window.dataLayer ?? []).map((entry) => String(entry.event ?? ''));

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

const settle = (ms = 500) => new Promise((r) => setTimeout(r, ms));

async function submit(form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await settle();
}

const T0 = new Date('2026-09-21T10:00:00.000Z');
const later = (ms: number) => new Date(T0.getTime() + ms);

beforeEach(() => {
  window.dataLayer = [];
  navigations.length = 0;
  sessionStorage.clear();
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  document.body.removeAttribute('data-lead-confirmed');
});

/* ------------------------------------------------------------------------ */

describe('one successful submission produces one canonical conversion', () => {
  it('exactly one lead_form_submission, and no other event of any kind', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);

    expect(conversions()).toEqual([
      { event: LEAD_EVENT, form_id: 'ppc-lead-form', facility_type: 'Office' },
    ]);
    expect(allEvents()).toEqual([LEAD_EVENT]);
  });

  it('the canonical event name is the only one the site emits', () => {
    expect(LEAD_EVENT).toBe('lead_form_submission');
  });

  it('a failed submission produces none, and no success marker', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 503 }));
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);

    expect(conversions()).toHaveLength(0);
    expect(navigations).toEqual([]);
    expect(sessionStorage.getItem(CONFIRMATION_KEY)).toBeNull();
  });
});

describe('redirecting after success neither loses nor duplicates the event', () => {
  it('navigation waits for GTM to report the tags delivered', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    /* Tags take 400ms to deliver; the ceiling is 1500ms, so the callback —
       not the fallback timer — is what releases the navigation. */
    const gtm = installFakeGtm(400);
    const form = buildForm();
    wireLandingPage(form, 'ppc-lead-form', 1500);

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    /* The event is pushed, and the page has NOT navigated yet. This is the
       whole point: `window.location.href = …` here would abort the Google
       Ads and GA4 beacons and the conversion would be silently lost. */
    await settle(150);
    expect(conversions()).toHaveLength(1);
    expect(gtm.delivered).toEqual([]);
    expect(navigations).toEqual([]);

    await settle(500);
    expect(gtm.delivered).toEqual([LEAD_EVENT]);
    expect(navigations).toEqual(['/thank-you/']);
    expect(conversions()).toHaveLength(1);
  });

  it('navigates anyway when no container is present to call back', async () => {
    /* No fake GTM. `eventCallback` is then never invoked by anyone, so the
       local timer has to release the navigation or the visitor is stranded
       on a form that says "Sending…" forever. */
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);

    expect(navigations).toEqual(['/thank-you/']);
    expect(conversions()).toHaveLength(1);
  });

  it('releases the navigation exactly once even if GTM also calls back', async () => {
    /* Both the container and the local timer can fire. If the release were
       not guarded, the page would navigate twice. */
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm(400); /* deliberately later than tagDeliveryTimeoutMs */
    const form = buildForm();
    wireLandingPage(form, 'ppc-lead-form', 100);

    await submit(form);
    await settle(600);

    expect(navigations).toEqual(['/thank-you/']);
    expect(conversions()).toHaveLength(1);
  });

  it('carries the success marker across the redirect, exactly once', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);

    /* /thank-you/ loads and consumes it. */
    const confirmation = applyThankYouConfirmation();
    expect(confirmation?.form_id).toBe('ppc-lead-form');
    expect(document.body.dataset.leadConfirmed).toBe('true');
    expect(sessionStorage.getItem(CONFIRMATION_KEY)).toBeNull();

    /* and consuming it pushed nothing */
    expect(conversions()).toHaveLength(1);
    expect(allEvents()).toEqual([LEAD_EVENT]);
  });

  it('the marker carries no personal information', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    const form = buildForm();
    wireLandingPage(form);
    await submit(form);

    const raw = sessionStorage.getItem(CONFIRMATION_KEY)!;
    expect(JSON.parse(raw)).toEqual({
      v: 1,
      form_id: 'ppc-lead-form',
      ts: expect.any(String),
    });
    expect(raw).not.toMatch(/Jane|jane@|555|0199/);
  });
});

describe('reloading /thank-you/ produces zero conversions', () => {
  it('the second load finds no marker and pushes nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);
    await submit(form);

    expect(applyThankYouConfirmation()).not.toBeNull();
    const after = window.dataLayer!.length;

    /* F5, and again, and again. */
    for (let i = 0; i < 5; i++) expect(applyThankYouConfirmation()).toBeNull();

    expect(window.dataLayer!.length).toBe(after);
    expect(conversions()).toHaveLength(1);
  });
});

describe('directly visiting /thank-you/ produces zero conversions', () => {
  it('with nothing stored at all', () => {
    installFakeGtm();
    expect(applyThankYouConfirmation()).toBeNull();
    expect(conversions()).toHaveLength(0);
    expect(allEvents()).toEqual([]);
    expect(document.body.dataset.leadConfirmed).toBeUndefined();
  });

  it('with a ?f= parameter someone typed, which is read by nothing', () => {
    /* The old page trusted `?f=` to name the form. A query parameter is
       whatever the person in the address bar decides it is. */
    installFakeGtm();
    expect(applyThankYouConfirmation()).toBeNull();
    expect(allEvents()).toEqual([]);
  });

  it('with a marker that has aged past its TTL', () => {
    markLeadConfirmed('ppc-lead-form', T0);
    installFakeGtm();
    expect(consumeLeadConfirmation(later(CONFIRMATION_TTL_MS + 1))).toBeNull();
    expect(allEvents()).toEqual([]);
  });

  it('with a corrupt, truncated or wrong-version marker', () => {
    installFakeGtm();
    for (const bad of ['{{{', '{}', 'null', '[]', JSON.stringify({ v: 2, ts: T0.toISOString() })]) {
      sessionStorage.setItem(CONFIRMATION_KEY, bad);
      expect(consumeLeadConfirmation(T0)).toBeNull();
    }
    expect(allEvents()).toEqual([]);
  });

  it('a marker is spent even when it is rejected, so it cannot be retried', () => {
    sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify({ v: 2, ts: T0.toISOString() }));
    expect(consumeLeadConfirmation(T0)).toBeNull();
    expect(sessionStorage.getItem(CONFIRMATION_KEY)).toBeNull();
  });
});

describe('back-button navigation produces zero additional conversions', () => {
  it('returning to /thank-you/ after leaving it finds nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);
    await submit(form);

    applyThankYouConfirmation(); /* arrive */
    /* …navigate away, then press Back. The browser re-runs the page script,
       or restores it from bfcache; either way nothing is left to consume. */
    expect(applyThankYouConfirmation()).toBeNull();
    expect(conversions()).toHaveLength(1);
  });

  it('going back to the landing page and not resubmitting adds nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const first = buildForm();
    wireLandingPage(first);
    await submit(first);
    expect(conversions()).toHaveLength(1);

    /* Back: the landing page is re-created. Merely being there is not a
       conversion — only a submit that reaches a 2xx is. */
    const restored = buildForm();
    wireLandingPage(restored);
    await settle(50);

    expect(conversions()).toHaveLength(1);
  });

  it('resubmitting a form that already converted does not convert again', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);
    await submit(form);
    await submit(form);

    expect(conversions()).toHaveLength(1);
    expect(navigations).toEqual(['/thank-you/']);
  });
});

describe('a second genuinely successful submission still converts', () => {
  it('a fresh page load, a new submission, a new conversion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm();

    const first = buildForm('first');
    wireLandingPage(first, 'ppc-lead-form');
    await submit(first);
    expect(applyThankYouConfirmation()?.form_id).toBe('ppc-lead-form');

    /* The visitor comes back — a second enquiry, from the other landing
       page, later in the same session. */
    const second = buildForm('second');
    wireLandingPage(second, 'lp-commercial-cleaning-quote');
    await submit(second);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(conversions()).toEqual([
      { event: LEAD_EVENT, form_id: 'ppc-lead-form', facility_type: 'Office' },
      { event: LEAD_EVENT, form_id: 'lp-commercial-cleaning-quote', facility_type: 'Office' },
    ]);
    expect(navigations).toEqual(['/thank-you/', '/thank-you/']);
    expect(applyThankYouConfirmation()?.form_id).toBe('lp-commercial-cleaning-quote');
  });

  it('a retry after a real failure converts once, not twice', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValue(ok());
    installFakeGtm();
    const form = buildForm();
    wireLandingPage(form);

    await submit(form);
    expect(conversions()).toHaveLength(0);

    await submit(form);
    expect(conversions()).toHaveLength(1);
  });
});

describe('the in-page confirmation path pushes the same single event', () => {
  it('a form that does not navigate converts once, immediately', async () => {
    /* FormRuntime's shape: onSuccess replaces the form in place, so there is
       no navigation to protect and no reason to make the visitor wait. */
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok());
    installFakeGtm(1000);
    const form = buildForm();
    const confirmed: string[] = [];
    wireLeadForm(form, {
      formId: 'contact-form-1384',
      honeypots: ['company_tax_id'],
      tokenWaitMs: 20,
      payload: () => ({ form_id: 'contact-form-1384' }),
      onSuccess: () => confirmed.push('shown'),
      onError: () => {},
    });

    await submit(form);

    expect(confirmed).toEqual(['shown']);
    expect(conversions()).toEqual([{ event: LEAD_EVENT, form_id: 'contact-form-1384' }]);
  });
});

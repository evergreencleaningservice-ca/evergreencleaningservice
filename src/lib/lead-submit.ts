/**
 * One submit pipeline for every lead form on the site.
 *
 * WHY THIS MODULE EXISTS. There were three copies of this logic — the shared
 * `FormRuntime.astro` used by the quote and contact forms, and an inline
 * `<script>` in each of the two PPC landing pages. They had drifted:
 * different honeypot field names, different honeypot behaviour, different
 * duplicate-click handling. All three shared one defect, and one of them had a
 * second defect the others did not. Three copies is how that happens, so there
 * is now one.
 *
 * THE DEFECT THIS MODULE FIXES. All three pushed `lead_form_submission` into
 * the dataLayer *before* awaiting the fetch:
 *
 *     window.dataLayer.push({ event: 'lead_form_submission', ... });   // then
 *     const res = await fetch(endpoint, ...);                          // this
 *
 * So the conversion event was announced for every attempt — a rejected
 * captcha, a 503 from an unconfigured database, a dropped connection — not for
 * every stored lead. Once a GTM trigger listens for that event, Google Ads
 * learns from submissions that never became enquiries. The push now happens
 * only after a 2xx, and nowhere else.
 *
 * The second defect, in `/lp/commercial-cleaning-quote/` only: a honeypot hit
 * redirected the bot to `/thank-you/`, which pushed a second conversion-shaped
 * event. A bot filling a field no person can see would have reported a
 * conversion. The honeypot now mimics success *in place*, with no navigation
 * and no event — which deceives a bot exactly as well, because a bot does not
 * compare.
 *
 * THE EVENT CONTRACT, for whoever holds the GTM container:
 *
 *   lead_form_submission   ONE event. Pushed here, once, only after
 *                          /api/submit-lead answers 2xx. This is the lead,
 *                          and it is the only conversion on the site.
 *
 * There is deliberately no second event. `/thank-you/` pushes nothing, and a
 * destination conversion must not be configured on that URL — a container
 * counting both would report every PPC lead twice, and Smart Bidding would
 * learn from the doubled number. `confirmation.ts` explains how the
 * confirmation page tells a genuine arrival from a reload without measuring
 * anything. `docs/gtm-handoff.md` is the specification for the container.
 *
 * NOTE, and it is a launch blocker rather than a code problem: container
 * GTM-5PRC4HBV as published today has **no trigger for this event**. Its
 * three Google Ads conversion tags fire on GTM's native `gtm.formSubmit` with
 * `gtm.elementId` equal to `wpforms-form-1381` or `wpforms-form-1384` — the
 * WordPress WPForms DOM ids. Neither id exists on this site and these forms
 * call `preventDefault()`, so on the current container this site reports zero
 * conversions. See `_research/baseline.md`.
 */

import { attributionPayload } from './attribution';
import { markLeadConfirmed } from './confirmation';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    turnstile?: { reset?: () => void };
    grecaptcha?: { reset?: () => void };
  }
}

export type Dict = Record<string, string>;

/**
 * The only keys allowed into the dataLayer, and therefore into Google Ads,
 * GA4 and Microsoft Advertising.
 *
 * An allowlist rather than a denylist, because the failure mode is one-way: a
 * name or an email pushed into the dataLayer is out of our hands the moment
 * the container reads it, and no later change takes it back. Facility type and
 * size are campaign segmentation, not a person.
 */
export const EVENT_PARAM_ALLOWLIST: readonly string[] = [
  'form_id',
  'facility_type',
  'facility_size',
];

/** Looks like an email address. */
const EMAIL_SHAPE = /@/;

/**
 * Looks like a phone number: seven or more digits in one run, separated only
 * by the characters people write phone numbers with.
 *
 * The separator set is the whole point and was arrived at by being wrong
 * first. "seven or more digits, however they are spaced" also matches
 * `10,000–25,000 sq ft` — a real facility-size option on both landing pages —
 * and silently dropped a legitimate campaign dimension. A comma and an en
 * dash are how ranges are written; a space, a hyphen, brackets and a plus are
 * how phone numbers are written; and no number is written both ways.
 */
const PHONE_SHAPE = /\d(?:[ \-().+]{0,3}\d){6,}/;

/**
 * Strip anything that is not on the allowlist, and then anything that is on
 * the allowlist but carries a value shaped like a person.
 *
 * The second pass is the one that earns its keep. `facility_type` is a select
 * with fixed options today; the belt is there for the day someone makes it a
 * free-text field and nobody remembers this module exists.
 */
export function sanitizeEventParams(params: Dict): Dict {
  const out: Dict = {};
  for (const [key, raw] of Object.entries(params)) {
    if (!EVENT_PARAM_ALLOWLIST.includes(key)) continue;
    const value = String(raw ?? '').trim().slice(0, 120);
    if (!value) continue;
    if (EMAIL_SHAPE.test(value) || PHONE_SHAPE.test(value)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * THE site's conversion event. One name, one place it is pushed.
 *
 * `/thank-you/` deliberately pushes nothing — see `confirmation.ts`. A
 * container that triggered on both this and a confirmation-page event would
 * count every PPC lead twice.
 */
export const LEAD_EVENT = 'lead_form_submission';

/**
 * How long to give GTM to deliver the tags before navigating anyway.
 *
 * Two seconds is the usual figure for `eventTimeout` and it is a ceiling, not
 * a wait: with GTM present the callback normally fires in tens of
 * milliseconds. The visitor sees "Sending…" throughout either way.
 */
export const TAG_DELIVERY_TIMEOUT_MS = 2000;

/**
 * Push the conversion event, and optionally wait until it has been delivered.
 *
 * WHY THE WAIT EXISTS. `dataLayer.push` is synchronous, but what it starts is
 * not: the Google Ads conversion tag and the GA4 event each send a network
 * beacon, and `window.location.href = …` immediately afterwards can abort
 * them in flight. The lead is stored either way, so the failure is invisible —
 * the row is in Neon, the email arrives, and the conversion is missing from
 * Google Ads. That is the worst shape of bug this project has: silent, and
 * only visible in a report weeks later.
 *
 * GTM's answer is `eventCallback`, which it invokes once every tag for the
 * event has fired, bounded by `eventTimeout`. Neither key is data — GTM
 * strips both — so they are added after sanitising rather than through it.
 *
 * Belt AND braces, because `eventCallback` only works if GTM is there to
 * honour it. With no container on the page the push is an ordinary array push
 * and the callback would never be invoked at all, so a local timer of the
 * same length guarantees the caller is always released exactly once.
 */
export function pushLeadEvent(
  params: Dict,
  onDelivered?: () => void,
  timeoutMs: number = TAG_DELIVERY_TIMEOUT_MS
): void {
  window.dataLayer = window.dataLayer || [];

  const event: Record<string, unknown> = { event: LEAD_EVENT, ...sanitizeEventParams(params) };

  if (!onDelivered) {
    window.dataLayer.push(event);
    return;
  }

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    onDelivered();
  };

  event.eventCallback = release;
  event.eventTimeout = timeoutMs;
  window.dataLayer.push(event);
  setTimeout(release, timeoutMs);
}

/** Read a field's trimmed value, by `name`, without caring which kind it is. */
export const fieldValue = (form: HTMLFormElement, name: string): string => {
  const el = form.elements.namedItem(name);
  const value = (el as HTMLInputElement | HTMLSelectElement | null)?.value;
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Whichever captcha is on the page.
 *
 * Turnstile writes a hidden `cf-turnstile-response`; reCAPTCHA's checkbox is
 * read into `g-recaptcha-hidden` by `SpamGuard`. One of the two is present,
 * never both, and the Worker knows which provider it is verifying against.
 */
export const captchaToken = (form: HTMLFormElement): string =>
  fieldValue(form, 'cf-turnstile-response') ||
  fieldValue(form, 'g-recaptcha-hidden') ||
  (form.querySelector<HTMLInputElement>('.wpf-recaptcha-hidden')?.value ?? '').trim();

export interface LeadFormHooks {
  /** Stable id. Goes into the POST body and into the dataLayer event. */
  formId: string;
  /** Defaults to the site's only endpoint. */
  endpoint?: string;
  /** Hidden field names a person never fills. Anything in one is a bot. */
  honeypots?: string[];
  /** The POST body. Built after validation, once the captcha has resolved. */
  payload: (form: HTMLFormElement) => Dict;
  /** Extra event keys. Re-filtered through the allowlist before the push. */
  eventParams?: (form: HTMLFormElement) => Dict;
  /** A stored lead. Redirect, or swap the form for a confirmation. */
  onSuccess: (form: HTMLFormElement) => void;
  /**
   * True when `onSuccess` navigates away.
   *
   * It then runs from GTM's `eventCallback` instead of immediately, so the
   * conversion beacons are not aborted by the navigation. A form that stays
   * on the page leaves this false and shows its confirmation at once —
   * waiting would be a delay the visitor can see and nothing would be gained.
   */
  awaitTagDelivery?: boolean;
  /** Mimic success without storing, navigating or reporting a conversion. */
  onHoneypot?: (form: HTMLFormElement) => void;
  /** Something a visitor can act on. Called for every non-2xx and for a throw. */
  onError: (form: HTMLFormElement, message: string) => void;
  /** Button text while the request is in flight. */
  sendingLabel?: string;
  /**
   * How long to wait for an invisible captcha to resolve before posting
   * anyway. Six seconds in the browser; tests pass a small number.
   */
  tokenWaitMs?: number;
  /** Ceiling on the wait for tag delivery. Tests pass a small number. */
  tagDeliveryTimeoutMs?: number;
}

export const MESSAGES = {
  captcha: 'That security check did not verify. Please try submitting again.',
  server:
    'Something went wrong sending that. Please call (416) 803-4880 and we will take the details directly.',
  network:
    'We could not reach the server. Please call (416) 803-4880 and we will take the details directly.',
} as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Bind the pipeline to one form.
 *
 * Idempotent: a second call on the same form is ignored, so a page that
 * imports this twice does not submit twice.
 */
export function wireLeadForm(form: HTMLFormElement, hooks: LeadFormHooks): void {
  if (form.dataset.leadWired === 'true') return;
  form.dataset.leadWired = 'true';

  const endpoint = hooks.endpoint ?? '/api/submit-lead';
  const honeypots = hooks.honeypots ?? ['company_tax_id', 'company-website', 'website_trap'];
  const tokenWaitMs = hooks.tokenWaitMs ?? 6000;

  /* The duplicate-click guard.
     Disabling the button is not enough on its own: a form also submits on
     Enter in a text field and via requestSubmit(), neither of which goes near
     the button. This flag is what actually guarantees one request and one
     event per attempt; the disabled button is the part a visitor can see. */
  let inFlight = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (inFlight) return;

    /* Honeypot first, so a bot costs nothing — no captcha call, no request,
       no event. Behave as success would: telling a bot it failed teaches it
       to try again with the field empty. */
    if (honeypots.some((name) => fieldValue(form, name))) {
      (hooks.onHoneypot ?? hooks.onSuccess)(form);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    inFlight = true;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = submit?.textContent ?? 'Submit';
    if (submit) {
      submit.disabled = true;
      submit.textContent = hooks.sendingLabel ?? 'Sending…';
    }

    /* Turnstile is invisible and resolves on its own, but a visitor who fills
       four fields quickly can beat it. Wait for the token rather than posting
       without one and collecting a 403 they cannot act on. */
    const deadline = Date.now() + tokenWaitMs;
    while (!captchaToken(form) && Date.now() < deadline) await sleep(50);

    const restore = () => {
      if (submit) {
        submit.disabled = false;
        submit.textContent = label;
      }
      inFlight = false;
    };

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* Attribution is merged here rather than by each caller, so the
           three forms cannot disagree about it, and it is merged FIRST so a
           page can still override a field deliberately. Reading it at submit
           time rather than at page load means a campaign arrival in another
           tab of the same session is already accounted for. */
        body: JSON.stringify({
          ...attributionPayload(),
          ...hooks.payload(form),
          captcha: captchaToken(form),
        }),
      });
    } catch {
      hooks.onError(form, MESSAGES.network);
      restore();
      return;
    }

    if (res.ok) {
      /* The lead is stored. Record that this visitor genuinely submitted,
         for `/thank-you/` to consume exactly once — it is how a real arrival
         is told from a reload, a bookmark or a direct visit, and it carries
         no personal information. */
      markLeadConfirmed(hooks.formId);

      /* THE ONE PLACE THE CONVERSION EVENT IS PUSHED. After a 2xx, so it
         means a lead was stored, and nowhere else on the site.

         inFlight is deliberately left set. The attempt succeeded and the form
         is about to be replaced or the page left; a second submit of a form
         that has already converted is a duplicate, never a new lead. A
         genuinely new submission comes from a fresh page load. */
      const params = { form_id: hooks.formId, ...(hooks.eventParams?.(form) ?? {}) };

      if (hooks.awaitTagDelivery) {
        pushLeadEvent(params, () => hooks.onSuccess(form), hooks.tagDeliveryTimeoutMs);
      } else {
        pushLeadEvent(params);
        hooks.onSuccess(form);
      }
      return;
    }

    /* A rejected captcha is the one failure a visitor can act on, so it gets
       its own message and the widget is reset for another try. */
    if (res.status === 403) {
      window.turnstile?.reset?.();
      window.grecaptcha?.reset?.();
      hooks.onError(form, MESSAGES.captcha);
    } else {
      hooks.onError(form, MESSAGES.server);
    }
    restore();
  });
}

/**
 * GA4 events, sent from the site rather than from the Tag Manager container.
 *
 * WHY HERE (2026-10-29). The site's events — the lead, phone and email taps,
 * form starts and errors, quote-button clicks — are pushed to the dataLayer
 * for Tag Manager, and the container GTM-5W69BTJQ has no tags that read them.
 * The login that manages the site's tracking can manage the Google tag
 * (GT-PBCTCTX6, which carries both Google Ads AW-18472921801 and the GA4
 * stream) but not that container. So each event is also handed to the Google
 * tag directly, as a standard `gtag('event', …)` command addressed to the GA4
 * stream alone.
 *
 * HOW IT REACHES GA4. gtag.js reads its commands from the same `dataLayer`
 * array, as `arguments` objects. The Google tag is loaded by the container on
 * every page, so a command pushed here is picked up whenever gtag.js is
 * running, including one queued just before it starts. `send_to` keeps these
 * events out of Google Ads: the Ads conversion stays the container's own tag
 * on `lead_form_submission`, exactly as before, so nothing is counted twice.
 *
 * WHAT IS SENT. Only the parameters the dataLayer events already carry, and
 * those are site-chosen values: form ids, closed lists of link locations and
 * error types, the business's own phone number. Nothing a visitor typed.
 *
 * PRODUCTION ONLY. The container also loads on staging, and staging visits
 * must not become GA4 events. These commands are sent on the production
 * hostnames and nowhere else.
 *
 * IF THE CONTAINER IS EVER WIRED UP. Someone with access to GTM-5W69BTJQ may
 * add GA4 event tags for the same events. If they do, delete this module's
 * calls, or every event will be counted twice.
 */
import { PRODUCTION_HOSTS } from '../data/site';

/** The GA4 web stream ("Website") on the Evergreen Office Cleaning property. */
export const GA4_ID = 'G-C0JHHPLFPJ';

/** The lead is `generate_lead` in GA4, its recommended name for one. */
export const GA4_LEAD_EVENT = 'generate_lead';

type Primitive = string | number | boolean;
type GtagWindow = Window & { dataLayer?: unknown[] };

/** Only plain values reach GA4: no objects, no callbacks, no empties. */
export function ga4Params(params: Record<string, unknown>): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === 'event' || key === 'eventCallback' || key === 'eventTimeout') continue;
    if (typeof value === 'number' || typeof value === 'boolean') out[key] = value;
    else if (typeof value === 'string' && value !== '') out[key] = value.slice(0, 100);
  }
  return out;
}

/**
 * Send one event to the GA4 stream. A no-op off the production hostnames.
 * Never throws: measurement must not get in the way of what the visitor did.
 */
export function sendGa4(name: string, params: Record<string, unknown> = {}, win: Window = window): void {
  try {
    if (!PRODUCTION_HOSTS.includes(win.location.hostname as (typeof PRODUCTION_HOSTS)[number])) return;
    const w = win as GtagWindow;
    w.dataLayer = w.dataLayer || [];
    // gtag.js only acts on a real `arguments` object, not on an array.
    const gtag = function (..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    gtag('event', name, { ...ga4Params(params), send_to: GA4_ID });
  } catch {
    /* measurement is best-effort */
  }
}

/**
 * The one-time success marker that gets a visitor from a submitted form to
 * `/thank-you/` without `/thank-you/` becoming a second conversion.
 *
 * THE PROBLEM THIS SOLVES. `/thank-you/` used to push `lead_form_confirmed`
 * on every load, and its own comment invited the agency to fire a
 * destination-based conversion on the URL as well. Three ways that
 * over-reports, none of them obvious:
 *
 *   1. Two events for one lead. A container triggering on both
 *      `lead_form_submission` and `lead_form_confirmed` counts every PPC
 *      enquiry twice, and Smart Bidding learns from the doubled number.
 *   2. A reload. F5 on the confirmation page was another conversion. So was
 *      the back button returning to it, and so was a bookmark.
 *   3. A direct visit. Anyone — a person who saved the link, a crawler that
 *      found it, someone typing the path — reported a conversion for a form
 *      they never filled in.
 *
 * THE RULE NOW. There is exactly one conversion event on this site:
 * `lead_form_submission`, pushed by `lead-submit.ts` once, only after
 * `/api/submit-lead` answers 2xx. **`/thank-you/` pushes nothing at all.**
 * It is a confirmation view, not a measurement point, and a destination
 * conversion must not be configured on it. See `docs/gtm-handoff.md`.
 *
 * WHAT THE MARKER IS FOR, THEN. It is how `/thank-you/` knows whether this
 * visitor actually submitted something — for the page's own state, not for
 * analytics. It is written at the moment of a successful submission and
 * **consumed on first read**, so a reload, a back-button return, a bookmark
 * and a direct visit all find nothing.
 *
 * It carries no personal information: a form id and a timestamp. The form id
 * is one of two fixed strings chosen by us, not anything a visitor typed.
 */

/** Bumped if the shape changes, so an old record is ignored rather than read. */
export const CONFIRMATION_KEY = 'ecs_lead_confirmed_v1';

/**
 * How long a marker stays valid.
 *
 * It is consumed on first read, so this only covers one case: a submission
 * that succeeded while the visitor never reached `/thank-you/` — they closed
 * the tab mid-redirect, or the navigation failed — and who then opens
 * `/thank-you/` from history much later in the same session. Five minutes is
 * longer than any redirect and far shorter than a browsing session.
 */
export const CONFIRMATION_TTL_MS = 5 * 60 * 1000;

export interface Confirmation {
  v: 1;
  /** One of the site's own fixed form ids. Never anything a visitor typed. */
  form_id: string;
  ts: string;
}

/** sessionStorage, wrapped: private browsing throws on the first access. */
function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Record that this visitor really did submit a lead that was really stored.
 *
 * Called by `lead-submit.ts` after a 2xx and before any navigation.
 */
export function markLeadConfirmed(formId: string, now: Date = new Date()): void {
  const store = storage();
  if (!store) return;
  const record: Confirmation = {
    v: 1,
    form_id: String(formId).slice(0, 64),
    ts: now.toISOString(),
  };
  try {
    store.setItem(CONFIRMATION_KEY, JSON.stringify(record));
  } catch {
    /* quota, or a private window. The page still works; it simply cannot
       tell a genuine arrival from a direct one. */
  }
}

/**
 * Read the marker and destroy it, in that order.
 *
 * Destroying it first would lose the confirmation if the read threw; reading
 * first and removing unconditionally afterwards means a marker is spent
 * whether or not the caller liked what it found. Both are deliberate: the
 * guarantee this function exists to make is that a second call returns null.
 */
export function consumeLeadConfirmation(now: Date = new Date()): Confirmation | null {
  const store = storage();
  if (!store) return null;

  let raw: string | null = null;
  try {
    raw = store.getItem(CONFIRMATION_KEY);
  } catch {
    return null;
  }

  try {
    store.removeItem(CONFIRMATION_KEY);
  } catch {
    /* nothing useful to do; the TTL below is the backstop */
  }

  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const record = parsed as Partial<Confirmation>;
  if (!record || record.v !== 1 || typeof record.ts !== 'string') return null;

  const at = Date.parse(record.ts);
  if (Number.isNaN(at) || now.getTime() - at > CONFIRMATION_TTL_MS) return null;
  if (at > now.getTime() + 60_000) return null; /* a clock far in the future */

  return { v: 1, form_id: String(record.form_id ?? ''), ts: record.ts };
}

/**
 * Everything `/thank-you/` does on load. Exported so it is the same code in
 * the page and in the test, rather than two versions of it.
 *
 * It pushes NOTHING into the dataLayer, and that is the point of the whole
 * module. If a future change adds a push here, `tests/conversion-event.test.ts`
 * fails.
 */
export function applyThankYouConfirmation(now: Date = new Date()): Confirmation | null {
  const confirmation = consumeLeadConfirmation(now);
  if (confirmation && typeof document !== 'undefined' && document.body) {
    /* For the page's own state only. Never a trigger, never a conversion. */
    document.body.dataset.leadConfirmed = 'true';
  }
  return confirmation;
}

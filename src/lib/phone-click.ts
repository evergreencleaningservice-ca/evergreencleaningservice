/**
 * One sitewide telephone-click event.
 *
 * WHAT WAS THERE BEFORE. A per-anchor listener in `LandingLayout`, on three
 * pages out of seventy-seven, pushing `click_to_call` with the phone number
 * **hardcoded**:
 *
 *     { event: 'click_to_call', phone_number: '+14168034880', … }
 *
 * Three things were wrong with that, in ascending order of expense:
 *
 *   1. Seventy-four pages had no telephone tracking at all.
 *   2. Per-anchor listeners mean a second initialisation binds a second
 *      listener to every link, and one tap then reports two calls.
 *   3. **The hardcoded number is wrong for exactly the visitors who matter.**
 *      The GTM container loads CallTrackingMetrics (account 535014, served
 *      from 535014.tctm.co), which rewrites both the displayed text and the
 *      `tel:` href when a visitor arrives from Google Ads, Performance Max or
 *      Bing Paid — three rules, three distinct tracking numbers, read out of
 *      the live script. A paid visitor taps a tracking number and the event
 *      reports the canonical one, so the report cannot be reconciled against
 *      the call-tracking account it is supposed to match.
 *
 * So this reads the number **at click time, off the element the visitor
 * actually activated**, and reports both halves separately: what was on
 * screen, and where it dialled. If they disagree with the canonical number,
 * that is a dynamic-number system doing its job and the event says so.
 *
 * WHAT IT DOES NOT DO. It does not call `preventDefault`, so the phone still
 * dials; it does not fire on load, on render, or on a link that is not
 * `tel:`; and it carries nothing about the visitor. The six fields are the
 * page, where on the page, the two numbers, and which provider was detected.
 * There is no name, no email, no form content, no identifier of any kind.
 */

/** The single event name. Settled here so the container can be built once. */
export const PHONE_EVENT = 'phone_click';

/**
 * The controlled list of places a telephone link can be.
 *
 * A closed set on purpose. The alternative — deriving a dimension from the
 * link's visible text — turns page copy into an analytics dimension, so a
 * caption edit silently splits a report in two, and the values differ by
 * whitespace. Every value below is chosen by a component, not by a sentence.
 */
export const LOCATIONS = [
  'header',
  'mobile_navigation',
  'hero',
  'content',
  'quote_sidebar',
  'paid_header',
  'paid_sticky',
  'paid_cta',
  'form_note',
  'footer',
] as const;

export type PhoneLocation = (typeof LOCATIONS)[number];

/**
 * What a link with no metadata reports.
 *
 * `content` rather than `unknown`, because a link that reaches here IS in the
 * body of a page — the legacy ones are inside Markdown recovered from the old
 * WordPress site, where they sit in prose. Reporting them as content is true;
 * reporting them as unknown would only say that this file failed to classify
 * them.
 */
export const FALLBACK_LOCATION: PhoneLocation = 'content';

/** Only a value from the list may become a dimension. */
const asLocation = (value: string | null | undefined): PhoneLocation | null =>
  value && (LOCATIONS as readonly string[]).includes(value) ? (value as PhoneLocation) : null;

/**
 * Where this link is, at the moment it was activated.
 *
 * `data-call-location` is the answer for every link a component renders. The
 * one refinement is the primary navigation, which is a horizontal bar on a
 * desktop and a drawer on a phone — the same element in both cases. A link
 * inside it may also carry `data-call-location-open`, used when the drawer is
 * actually open, so "tapped the number in the menu" and "clicked it in the
 * header" are separable without either being guessed from copy.
 */
export function resolveLocation(anchor: HTMLAnchorElement): PhoneLocation {
  const whenOpen = asLocation(anchor.getAttribute('data-call-location-open'));
  if (whenOpen) {
    const drawer = anchor.closest('[data-call-drawer]');
    if (drawer?.classList.contains('is-open')) return whenOpen;
  }
  return asLocation(anchor.getAttribute('data-call-location')) ?? FALLBACK_LOCATION;
}

/**
 * A telephone number that looks like one: at least seven digits, however they
 * are punctuated.
 *
 * Deliberately the same permissiveness as `looksLikePhone` in `lead-fields`,
 * for the same reason — a tracking number can be formatted any way the
 * provider likes, and a stricter pattern would silently report nothing.
 *
 * The optional leading `(` is not decoration. Without it the match starts at
 * the first digit and "(416) 803-4880" is reported as "416) 803-4880" — an
 * unbalanced bracket in every row of the report, which a test caught.
 */
const NUMBER_IN_TEXT = /\+?\(?\d[\d\s().+‐-―-]{5,}\d/;

/**
 * The number as the visitor saw it, or '' if the link shows no number.
 *
 * Read from `textContent` at click time, so a dynamic-number system that has
 * rewritten the label is reflected. Some links legitimately show no number —
 * five service pages carry a bare "Call Now" — and for those the honest value
 * is empty rather than the canonical number the code happens to know.
 */
export function displayedNumber(anchor: HTMLAnchorElement): string {
  const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  return text.match(NUMBER_IN_TEXT)?.[0].trim() ?? '';
}

/**
 * Where it actually dials, at click time.
 *
 * The `tel:` scheme and any `;ext=`, `,` pause or query the provider appended
 * are stripped to leave the number, because the destination is what has to be
 * reconciled against a call-tracking account and that account does not know
 * about URL syntax.
 */
export function destinationNumber(anchor: HTMLAnchorElement): string {
  const href = anchor.getAttribute('href') ?? '';
  if (!/^tel:/i.test(href)) return '';
  return decodeURIComponent(href.slice(4)).split(/[;,?]/)[0].trim();
}

/**
 * Which dynamic-number provider is present.
 *
 * Positive detection only. CallTrackingMetrics announces itself as
 * `window.__ctm` and is the provider this container actually loads. Anything
 * else reports `unknown` — NOT `none`: this code cannot prove the absence of
 * a provider it has never heard of, and a confident "none" beside a number
 * that was in fact swapped would be worse than admitting the limit.
 */
export function trackingProvider(win: Window = window): string {
  const w = win as Window & { __ctm?: unknown };
  if (w.__ctm) return 'calltrackingmetrics';
  return 'unknown';
}

export interface PhoneClickEvent {
  event: typeof PHONE_EVENT;
  page_path: string;
  link_location: PhoneLocation;
  displayed_number: string;
  destination_number: string;
  tracking_provider: string;
}

/** Build the event for one activated link. Exported so tests can read it. */
export function phoneClickEvent(
  anchor: HTMLAnchorElement,
  win: Window = window
): PhoneClickEvent {
  return {
    event: PHONE_EVENT,
    /* Path only — no query string. A `gclid` in the URL is campaign data the
       container already has, and copying it into a second dimension only
       creates a high-cardinality field that can also carry whatever a visitor
       put in the address bar. */
    page_path: win.location.pathname,
    link_location: resolveLocation(anchor),
    displayed_number: displayedNumber(anchor),
    destination_number: destinationNumber(anchor),
    tracking_provider: trackingProvider(win),
  };
}

/** The property the guard is stored on, so a second call is a no-op. */
const BOUND = 'phoneClickBound';
/** The listener itself, kept so `unwirePhoneClicks` can remove exactly it. */
const HANDLER = 'phoneClickHandler';

type WiredDocument = Document & {
  [BOUND]?: boolean;
  [HANDLER]?: EventListener;
};

/**
 * Bind the one delegated listener.
 *
 * DELEGATED, not per-anchor, and that is the whole design. A tracking script
 * that rewrites a number replaces the anchor's contents — and CallTrackingMetrics
 * replaces `innerHTML` — so a listener bound to a child would be discarded
 * with it. Delegation also means links added after load are covered, and one
 * listener cannot be bound twice to the same link.
 *
 * Idempotent: the guard is on the document, so importing this module twice, or
 * a re-initialisation after a client-side navigation, cannot produce a second
 * listener and therefore cannot report one tap as two calls.
 *
 * KEYBOARD COMES FREE, and it is worth saying why rather than leaving it to
 * chance: activating a focused link with Enter dispatches a real `click`
 * event, so the same listener sees it. Space does not activate a link at all
 * (it scrolls), so there is nothing to handle.
 */
export function wirePhoneClicks(doc: Document = document, win: Window = window): void {
  const root = doc as WiredDocument;
  if (root[BOUND]) return;
  root[BOUND] = true;

  const onClick: EventListener = (event) => {
      /* `closest` from the event target, so a click on an icon, a <span> or
         any other element nested inside the link still resolves to the link
         and still produces exactly one event. */
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href^="tel:" i]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const w = win as Window & { dataLayer?: Record<string, unknown>[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push(phoneClickEvent(anchor, win));

    /* No preventDefault, no return false, no delay. The call is the point;
       the measurement is not allowed to get in its way. */
  };

  root[HANDLER] = onClick;
  doc.addEventListener(
    'click',
    onClick,
    /* Capture phase: the event is recorded before any other handler on the
       page can stop its propagation. Nothing on this site does, but a tag
       added to the container later might, and a measurement that a third
       party can silently switch off is not a measurement. */
    true
  );
}

/**
 * Remove the listener and clear the guard.
 *
 * Nothing in the site calls this — a page that has loaded keeps its listener
 * until it unloads. It exists so the idempotence guard can be TESTED rather
 * than assumed: without a real teardown, a suite that clears the guard between
 * cases leaves the previous listener attached to the same document, every
 * later case sees a growing pile of duplicate events, and the tests that
 * matter most here fail for a reason that has nothing to do with the code.
 * That is exactly what happened before this existed.
 */
export function unwirePhoneClicks(doc: Document = document): void {
  const root = doc as WiredDocument;
  const handler = root[HANDLER];
  if (handler) doc.removeEventListener('click', handler, true);
  delete root[HANDLER];
  delete root[BOUND];
}

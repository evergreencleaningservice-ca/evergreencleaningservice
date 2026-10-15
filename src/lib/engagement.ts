/**
 * The site's secondary measurement events — everything that is NOT the lead.
 *
 * THE EVENT SET, and what each one is allowed to mean:
 *
 *   lead_form_submission  the conversion. Pushed by `lead-submit.ts` only after
 *                         /api/submit-lead answered 2xx. Not here.
 *   phone_click           a tap on a `tel:` link. `phone-click.ts`. A tap is
 *                         not a connected call.
 *   form_start            the first focus or keystroke inside a lead form, once
 *                         per form per page view. Here.
 *   lead_form_error       a submission that did not become a lead — rejected
 *                         captcha, server error, no network. `lead-submit.ts`
 *                         pushes it through `pushFormError` below.
 *   email_click           a tap on a `mailto:` link. Here. Not an enquiry.
 *   quote_cta_click       a click on a link to /request-a-quote/ or on an
 *                         in-page form anchor marked `data-quote-cta`. A
 *                         navigation, not an enquiry.
 *
 * Only `lead_form_submission` may be used as a primary conversion. The others
 * exist to diagnose the funnel — form starts against submissions shows where
 * people give up, and errors show submissions the site lost.
 *
 * NOTHING PERSONAL GOES IN. Every value below is chosen by the site — a form
 * id, a closed list of link locations, an error category, a path. No field
 * value is ever read, so nothing a visitor typed can reach the dataLayer.
 */

export const FORM_START_EVENT = 'form_start';
export const FORM_ERROR_EVENT = 'lead_form_error';
export const EMAIL_EVENT = 'email_click';
export const QUOTE_CTA_EVENT = 'quote_cta_click';

/** The error categories a failed submission can report. A closed set. */
export const FORM_ERROR_TYPES = ['validation', 'captcha', 'server', 'network'] as const;
export type FormErrorType = (typeof FORM_ERROR_TYPES)[number];

/** Where a CTA or email link sits. Closed, like phone-click's LOCATIONS. */
export const CTA_LOCATIONS = [
  'header',
  'hero',
  'content',
  'sidebar',
  'service_cta',
  'footer',
  'paid_header',
  'paid_cta',
  'paid_sticky',
] as const;
export type CtaLocation = (typeof CTA_LOCATIONS)[number];

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

const push = (win: Window, event: Record<string, unknown>) => {
  const w = win as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(event);
};

/** A form id is site-chosen, but it is still trimmed and bounded. */
const cleanId = (value: string | undefined | null): string =>
  String(value ?? '')
    .replace(/[^a-z0-9_-]/gi, '')
    .slice(0, 60) || 'unknown-form';

const ctaLocation = (el: Element): CtaLocation => {
  const raw = el.getAttribute('data-cta-location');
  return raw && (CTA_LOCATIONS as readonly string[]).includes(raw) ? (raw as CtaLocation) : 'content';
};

/** Push one `lead_form_error`. Called by the submit pipeline. */
export function pushFormError(formId: string, type: FormErrorType, win: Window = window): void {
  push(win, { event: FORM_ERROR_EVENT, form_id: cleanId(formId), error_type: type });
}

/** Is this anchor a way into a quote form? */
export function isQuoteLink(anchor: HTMLAnchorElement, win: Window = window): boolean {
  if (anchor.hasAttribute('data-quote-cta')) return true;
  const href = anchor.getAttribute('href') ?? '';
  if (!href || /^(tel|mailto):/i.test(href)) return false;
  let url: URL;
  try {
    url = new URL(href, win.location.href);
  } catch {
    return false;
  }
  if (url.origin !== win.location.origin) return false;
  return url.pathname === '/request-a-quote/';
}

const BOUND = 'engagementBound';
type WiredDocument = Document & { [BOUND]?: boolean };

/**
 * Bind the delegated listeners. Idempotent, like `wirePhoneClicks`: a second
 * call is a no-op, so one action can never report twice.
 */
export function wireEngagement(doc: Document = document, win: Window = window): void {
  const root = doc as WiredDocument;
  if (root[BOUND]) return;
  root[BOUND] = true;

  /* form_start: once per lead form per page view. A lead form is one posting
     to the lead endpoint — the comment and testimonial forms are not. */
  const started = new WeakSet<HTMLFormElement>();
  const onStart = (event: Event) => {
    const form = (event.target as Element | null)?.closest?.('form');
    if (!(form instanceof win.HTMLFormElement)) return;
    if (form.dataset.endpoint !== '/api/submit-lead') return;
    /* The honeypot is invisible to people; a bot touching it starts nothing. */
    if ((event.target as Element).closest('.qq-hp, .wpf-hp, [aria-hidden="true"]')) return;
    if (started.has(form)) return;
    started.add(form);
    push(win, { event: FORM_START_EVENT, form_id: cleanId(form.dataset.formId) });
  };
  doc.addEventListener('focusin', onStart, true);
  doc.addEventListener('input', onStart, true);

  doc.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (/^mailto:/i.test(href)) {
        push(win, {
          event: EMAIL_EVENT,
          page_path: win.location.pathname,
          link_location: ctaLocation(anchor),
        });
        return;
      }
      if (isQuoteLink(anchor, win)) {
        push(win, {
          event: QUOTE_CTA_EVENT,
          page_path: win.location.pathname,
          link_location: ctaLocation(anchor),
        });
      }
    },
    true
  );
}

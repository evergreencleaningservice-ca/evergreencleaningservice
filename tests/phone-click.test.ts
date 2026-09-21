/**
 * Phase 11 — one telephone-click event, and only one.
 *
 * THE DEFECT THIS REPLACES was not that telephone clicks went untracked on
 * seventy-four pages, though they did. It was that on the three pages where
 * they WERE tracked, the number was hardcoded:
 *
 *     { event: 'click_to_call', phone_number: '+14168034880', … }
 *
 * The GTM container loads CallTrackingMetrics, which rewrites both the
 * displayed text and the `tel:` href for visitors arriving from Google Ads,
 * Performance Max or Bing Paid. So the visitors whose calls most need
 * attributing were the ones whose events named the wrong number — the report
 * could never be reconciled against the call-tracking account it exists to
 * match.
 *
 * Hence the shape of this file: the dynamic-number cases are not an edge, they
 * are the point.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FALLBACK_LOCATION,
  LOCATIONS,
  PHONE_EVENT,
  destinationNumber,
  displayedNumber,
  phoneClickEvent,
  resolveLocation,
  trackingProvider,
  unwirePhoneClicks,
  wirePhoneClicks,
} from '../src/lib/phone-click';

/* --- harness -------------------------------------------------------------- */

/** A page with one of each link shape the site actually renders. */
function page(): void {
  document.body.innerHTML = `
    <nav class="site-nav" data-call-drawer>
      <a id="nav-phone" href="tel:+14168034880"
         data-call-location="header" data-call-location-open="mobile_navigation">Call Now: (416) 803-4880</a>
      <a id="nav-home" href="/">Home</a>
    </nav>

    <a id="hero" class="btn" href="tel:+14168034880" data-call-location="hero">Call now (416) 803-4880</a>

    <a id="nested" href="tel:+14168034880" data-call-location="paid_header">
      <span class="lp-call-label">Call</span><span class="lp-call-number">(416) 803-4880</span>
    </a>

    <a id="bare" href="tel:+14168034880" data-call-location="content">Call Now</a>

    <a id="legacy" href="tel:+14168034880">(416) 803-4880</a>

    <a id="bogus" href="tel:+14168034880" data-call-location="wherever-i-like">(416) 803-4880</a>

    <a id="mail" href="mailto:info@example.com">Email us</a>
    <a id="internal" href="/services/">Services</a>
    <button id="button">Not a link</button>`;
}

const events = () => (window.dataLayer ?? []).filter((e) => e.event === PHONE_EVENT);
const el = (id: string) => document.getElementById(id) as HTMLAnchorElement;

/** Click, the way a pointer does: on the element, bubbling, cancelable. */
const click = (id: string) =>
  document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

beforeEach(() => {
  window.dataLayer = [];
  delete (window as { __ctm?: unknown }).__ctm;
  /* A real teardown, not just clearing the flag. happy-dom reuses one
     document across a file, so merely deleting the guard leaves the previous
     listener attached and every later case sees a growing pile of duplicate
     events — which is how this suite first "failed": twelve cases red for a
     reason that had nothing to do with the code under test. */
  unwirePhoneClicks();
  page();
});

/* --- 1. one activation, one event ----------------------------------------- */

describe('one genuine activation produces exactly one event', () => {
  it('a mouse click on a telephone link', () => {
    wirePhoneClicks();
    click('hero');
    expect(events()).toHaveLength(1);
    expect(events()[0]).toMatchObject({ event: PHONE_EVENT, link_location: 'hero' });
  });

  it('a keyboard activation', () => {
    /* Enter on a focused link dispatches a real `click`, which is why the
       one delegated listener covers the keyboard without a keydown handler.
       Space does not activate a link at all, so there is nothing to catch. */
    wirePhoneClicks();
    const link = el('hero');
    link.focus();
    link.click();
    expect(events()).toHaveLength(1);
  });

  it('a click on an icon nested inside the link', () => {
    wirePhoneClicks();
    const span = document.querySelector('#nested .lp-call-number') as HTMLElement;
    span.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(events()).toHaveLength(1);
    expect(events()[0].link_location).toBe('paid_header');
    /* And the displayed number is read from the whole link, not the one span
       that happened to be clicked. */
    expect(events()[0].displayed_number).toBe('(416) 803-4880');
  });

  it('two separate intentional activations produce two events', () => {
    wirePhoneClicks();
    click('hero');
    click('nav-phone');
    expect(events()).toHaveLength(2);
    expect(events().map((e) => e.link_location)).toEqual(['hero', 'header']);
  });
});

/* --- 2. what must never fire ---------------------------------------------- */

describe('what produces no event at all', () => {
  it('page load and wiring', () => {
    wirePhoneClicks();
    expect(events()).toHaveLength(0);
  });

  it('a mailto link', () => {
    wirePhoneClicks();
    click('mail');
    expect(events()).toHaveLength(0);
  });

  it('an internal link', () => {
    wirePhoneClicks();
    click('internal');
    expect(events()).toHaveLength(0);
  });

  it('a button that is not a link', () => {
    wirePhoneClicks();
    click('button');
    expect(events()).toHaveLength(0);
  });

  it('a click on the page background', () => {
    wirePhoneClicks();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(events()).toHaveLength(0);
  });
});

/* --- 3. re-initialisation -------------------------------------------------- */

describe('initialising more than once', () => {
  it('does not bind a second listener', () => {
    wirePhoneClicks();
    wirePhoneClicks();
    wirePhoneClicks();
    click('hero');
    /* The failure this guards against reports one tap as three calls, which
       would be invisible in the data and expensive in Smart Bidding. */
    expect(events()).toHaveLength(1);
  });

  it('the guard is what prevents the duplicate, not luck', () => {
    /* Tear down properly and wire again: one listener, one event. If the
       second `wirePhoneClicks` were a no-op for some other reason, this would
       report zero. */
    wirePhoneClicks();
    unwirePhoneClicks();
    wirePhoneClicks();
    click('hero');
    expect(events()).toHaveLength(1);
  });

  it('after teardown, nothing is reported at all', () => {
    wirePhoneClicks();
    unwirePhoneClicks();
    click('hero');
    expect(events()).toHaveLength(0);
  });
});

/* --- 4. the call must still happen ---------------------------------------- */

describe('the telephone action', () => {
  it('is not prevented', () => {
    wirePhoneClicks();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    el('hero').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('is not delayed — the event is pushed synchronously', () => {
    wirePhoneClicks();
    click('hero');
    /* No await, no timers: by the time the click returns, the event is in the
       dataLayer. Anything asynchronous here races the navigation the click
       starts. */
    expect(events()).toHaveLength(1);
  });
});

/* --- 5. dynamic number insertion ------------------------------------------ */

describe('dynamic number replacement', () => {
  /**
   * What CallTrackingMetrics does: rewrites the anchor's contents AND its
   * href. Simulated exactly that way — innerHTML and the attribute — because
   * that is what the live script's own code does ("doing the href swap").
   */
  const swap = (id: string, display: string, href: string) => {
    const link = el(id);
    link.innerHTML = display;
    link.setAttribute('href', href);
  };

  it('reports the number the visitor saw, not the one in the source', () => {
    wirePhoneClicks();
    swap('hero', 'Call now (833) 555-0142', 'tel:+18335550142');
    click('hero');

    expect(events()[0]).toMatchObject({
      displayed_number: '(833) 555-0142',
      destination_number: '+18335550142',
    });
  });

  it('reports the destination the visitor actually dialled', () => {
    wirePhoneClicks();
    /* The nastier case: the label is swapped but the href is not, or the
       other way round. Both halves are read independently so the event
       records the disagreement rather than hiding it. */
    swap('hero', 'Call now (833) 555-0142', 'tel:+14168034880');
    click('hero');

    expect(events()[0].displayed_number).toBe('(833) 555-0142');
    expect(events()[0].destination_number).toBe('+14168034880');
  });

  it('survives the provider replacing the link contents entirely', () => {
    wirePhoneClicks();
    /* Delegation is what makes this work: a listener bound to the anchor's
       children would have been discarded with them. */
    el('nested').innerHTML = '<span><em>Call</em></span><span>(833) 555-0142</span>';
    document
      .querySelector('#nested em')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(events()).toHaveLength(1);
    expect(events()[0].displayed_number).toBe('(833) 555-0142');
  });

  it('names CallTrackingMetrics when its global is present', () => {
    (window as { __ctm?: unknown }).__ctm = { config: { aid: 535014 } };
    wirePhoneClicks();
    click('hero');
    expect(events()[0].tracking_provider).toBe('calltrackingmetrics');
  });

  it('says unknown rather than guessing when no provider is detected', () => {
    wirePhoneClicks();
    click('hero');
    /* Not "none": this cannot prove the absence of a provider it has never
       heard of, and a confident "none" beside a number that was in fact
       swapped would be worse than admitting the limit. */
    expect(events()[0].tracking_provider).toBe('unknown');
    expect(trackingProvider(window)).toBe('unknown');
  });

  it('a link showing no number reports an empty displayed number', () => {
    wirePhoneClicks();
    click('bare');
    expect(events()[0]).toMatchObject({
      displayed_number: '',
      destination_number: '+14168034880',
      link_location: 'content',
    });
  });
});

/* --- 6. location metadata -------------------------------------------------- */

describe('link_location', () => {
  it('comes from the component, not from the link text', () => {
    wirePhoneClicks();
    el('hero').textContent = 'Something else entirely';
    click('hero');
    expect(events()[0].link_location).toBe('hero');
  });

  it('is always one of the controlled values', () => {
    wirePhoneClicks();
    for (const id of ['nav-phone', 'hero', 'nested', 'bare', 'legacy', 'bogus']) click(id);
    for (const e of events()) {
      expect(LOCATIONS as readonly string[]).toContain(e.link_location);
    }
  });

  it('falls back for a legacy link with no metadata', () => {
    wirePhoneClicks();
    click('legacy');
    expect(events()[0].link_location).toBe(FALLBACK_LOCATION);
    expect(FALLBACK_LOCATION).toBe('content');
  });

  it('refuses a value that is not on the list', () => {
    /* Otherwise any page could invent a dimension, and the report would grow
       a long tail of one-off values nobody can aggregate. */
    expect(resolveLocation(el('bogus'))).toBe(FALLBACK_LOCATION);
  });

  it('reports the navigation as mobile_navigation only while the drawer is open', () => {
    wirePhoneClicks();

    click('nav-phone');
    expect(events()[0].link_location).toBe('header');

    document.querySelector('.site-nav')!.classList.add('is-open');
    click('nav-phone');
    expect(events()[1].link_location).toBe('mobile_navigation');

    document.querySelector('.site-nav')!.classList.remove('is-open');
    click('nav-phone');
    expect(events()[2].link_location).toBe('header');
  });
});

/* --- 7. the event body ----------------------------------------------------- */

describe('the event carries six fields and no visitor information', () => {
  it('has exactly the specified shape', () => {
    wirePhoneClicks();
    click('hero');
    expect(Object.keys(events()[0]).sort()).toEqual([
      'destination_number',
      'displayed_number',
      'event',
      'link_location',
      'page_path',
      'tracking_provider',
    ]);
  });

  it('carries the path without the query string', () => {
    /* A `gclid` is campaign data the container already has. Copying it into a
       second dimension only creates a high-cardinality field that can carry
       whatever someone typed into the address bar. */
    const win = {
      location: { pathname: '/services/office-cleaning/', search: '?gclid=SECRET&utm_term=x' },
    } as unknown as Window;
    const event = phoneClickEvent(el('hero'), win);
    expect(event.page_path).toBe('/services/office-cleaning/');
    expect(JSON.stringify(event)).not.toContain('gclid');
  });

  it('contains nothing that identifies a visitor', () => {
    /* A form on the page is the obvious source of an accidental leak, so one
       is present and filled in while the click happens. */
    document.body.insertAdjacentHTML(
      'beforeend',
      `<form><input name="first-name" value="Dana"><input name="email" value="dana@example.com"></form>`
    );
    wirePhoneClicks();
    click('hero');

    const serialised = JSON.stringify(events());
    for (const pii of ['Dana', 'dana@example.com', 'first-name']) {
      expect(serialised).not.toContain(pii);
    }
  });
});

/* --- 8. the pieces, directly ---------------------------------------------- */

describe('the helpers', () => {
  it('reads a number out of whatever wraps it', () => {
    const cases: [string, string][] = [
      ['Call Now: (416) 803-4880', '(416) 803-4880'],
      ['+1 (416) 803-4880', '+1 (416) 803-4880'],
      ['Call (416) 803-4880 now', '(416) 803-4880'],
      ['416-803-4880', '416-803-4880'],
      ['Call Now', ''],
      ['', ''],
    ];
    for (const [text, expected] of cases) {
      const a = document.createElement('a');
      a.href = 'tel:+14168034880';
      a.textContent = text;
      expect(displayedNumber(a), text).toBe(expected);
    }
  });

  it('strips the scheme, extensions and pauses off the destination', () => {
    const cases: [string, string][] = [
      ['tel:+14168034880', '+14168034880'],
      ['tel:+14168034880;ext=221', '+14168034880'],
      ['tel:+14168034880,,221', '+14168034880'],
      ['tel:416-803-4880', '416-803-4880'],
      ['TEL:+14168034880', '+14168034880'],
      ['/services/', ''],
    ];
    for (const [href, expected] of cases) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      expect(destinationNumber(a), href).toBe(expected);
    }
  });

  it('matches an uppercase TEL: scheme, because HTML is case-insensitive there', () => {
    wirePhoneClicks();
    const a = document.createElement('a');
    a.setAttribute('href', 'TEL:+14168034880');
    a.setAttribute('data-call-location', 'content');
    a.textContent = '(416) 803-4880';
    document.body.append(a);
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(events()).toHaveLength(1);
  });
});

/* --- 9. the form conversion is untouched ---------------------------------- */

describe('telephone clicks are not form conversions', () => {
  it('never pushes the lead event', () => {
    wirePhoneClicks();
    click('hero');
    click('nav-phone');
    expect((window.dataLayer ?? []).filter((e) => e.event === 'lead_form_submission')).toHaveLength(0);
  });

  it('uses a distinct event name from the one the forms push', () => {
    expect(PHONE_EVENT).toBe('phone_click');
    expect(PHONE_EVENT).not.toBe('lead_form_submission');
  });

  it('does not push the retired click_to_call name', () => {
    /* The container has no trigger for either name today. Settling on one
       before the container is built is the point of naming it here. */
    wirePhoneClicks();
    click('hero');
    expect((window.dataLayer ?? []).filter((e) => e.event === 'click_to_call')).toHaveLength(0);
  });
});

/**
 * The GTM loader's two speeds (SEO re-audit, 7 Nov 2026).
 *
 * Since Phase 1 (6 Nov 2026) the container waits for the load event plus an
 * idle callback, or the first interaction. That cost Google Ads its phone
 * conversions: the "calls from website" tag swaps in a forwarding number only
 * once gtm.js has loaded, and a paid visitor who taps the number before that
 * dials the real one, uncounted. So paid visits (a click id in the URL, an
 * /lp/ page, or a Google Ads click cookie) load the container at parse time,
 * as the original snippet did, and everyone else keeps the deferral.
 *
 * These tests run the exact string the component writes into the page, in a
 * fresh happy-dom window per case so the URL, cookies and readyState can be
 * set as each scenario needs. Script fetching is disabled: nothing here
 * reaches googletagmanager.com.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import { gtmLoaderScript } from '../src/lib/gtm-loader';
import { PRODUCTION_HOSTS, site } from '../src/data/site';

const GTM_SRC = `https://www.googletagmanager.com/gtm.js?id=${site.gtmId}`;
const PROD = 'https://www.evergreencleaningservice.ca';
const STAGING = 'https://stage.evergreencleaningservice.ca';

interface Run {
  win: Window;
  /** Idle callbacks the loader queued, so a test can fire them on cue. */
  idle: Array<() => void>;
  gtmScripts: () => number;
  dataLayer: () => Array<Record<string, unknown>>;
}

const windows: Window[] = [];

afterEach(async () => {
  while (windows.length) await windows.pop()!.happyDOM.close();
});

function run(
  url: string,
  opts: { cookie?: string; readyState?: 'loading' | 'complete' } = {},
): Run {
  const win = new Window({
    url,
    settings: {
      disableJavaScriptFileLoading: true,
      handleDisabledFileLoadingAsSuccess: true,
      disableJavaScriptEvaluation: true,
    },
  });
  windows.push(win);
  const doc = win.document;
  /* The real page has the loader's own inline <script> in the head; gtm.js is
     inserted before the first script element, so one must exist. */
  doc.head.innerHTML = '<script id="gtm-inline"></script>';
  doc.body.innerHTML = '<a id="tel" href="tel:+14168034880">(416) 803-4880</a><p id="text">Text</p>';
  /* happy-dom's cookie setter, like a browser's, takes one cookie per
     assignment: split on '; ' so multi-cookie cases really set them all. */
  if (opts.cookie) for (const c of opts.cookie.split('; ')) doc.cookie = c;
  Object.defineProperty(doc, 'readyState', { value: opts.readyState ?? 'loading', configurable: true });

  const idle: Array<() => void> = [];
  (win as unknown as { requestIdleCallback: unknown }).requestIdleCallback = (cb: () => void) => {
    idle.push(cb);
    return idle.length;
  };

  const script = gtmLoaderScript(site.gtmId, site.analyticsHosts, PRODUCTION_HOSTS);
  // eslint-disable-next-line no-new-func
  new Function('window', 'document', script)(win, doc);

  return {
    win,
    idle,
    gtmScripts: () =>
      Array.from(doc.querySelectorAll('script')).filter((s) => s.getAttribute('src') === GTM_SRC).length,
    dataLayer: () => (win as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer ?? [],
  };
}

describe('paid visits load the container at parse time', () => {
  it.each([
    ['gclid', `${PROD}/?gclid=abc123`],
    ['gbraid', `${PROD}/services/?gbraid=abc123`],
    ['wbraid', `${PROD}/?utm_source=google&wbraid=abc123`],
    ['gad_source', `${PROD}/?gad_source=1`],
  ])('a %s in the URL', (_name, url) => {
    const r = run(url);
    expect(r.gtmScripts()).toBe(1);
    expect(r.idle).toHaveLength(0);
  });

  it('an /lp/ landing page, with no click id', () => {
    const r = run(`${PROD}/lp/commercial-cleaning-quote/`);
    expect(r.gtmScripts()).toBe(1);
  });

  it.each(['_gcl_aw', '_gcl_gb', '_gcl_ag'])('a %s cookie on a later page of the visit', (name) => {
    const r = run(`${PROD}/office-cleaning/`, { cookie: `${name}=GCL.1762500000.abc123` });
    expect(r.gtmScripts()).toBe(1);
  });

  it('inserts gtm.js before the first script, pushing site_environment before gtm.start', () => {
    const r = run(`${PROD}/?gclid=abc123`);
    const first = r.win.document.getElementsByTagName('script')[0];
    expect(first.getAttribute('src')).toBe(GTM_SRC);
    expect((first as unknown as { async: boolean }).async).toBe(true);
    const events = r.dataLayer();
    expect(events[0]).toEqual({ site_environment: 'production' });
    expect(events[1]).toMatchObject({ event: 'gtm.js' });
  });

  it('loads once: later interaction and idle do not add a second gtm.js', () => {
    const r = run(`${PROD}/lp/commercial-cleaning-quote/`, { readyState: 'complete' });
    r.win.document.getElementById('tel')!.dispatchEvent(new r.win.Event('pointerdown', { bubbles: true }));
    r.win.dispatchEvent(new r.win.Event('load'));
    r.idle.forEach((cb) => cb());
    expect(r.gtmScripts()).toBe(1);
    expect(r.dataLayer().filter((e) => e.event === 'gtm.js')).toHaveLength(1);
  });

  it('staging follows the same rule, marked as staging', () => {
    const r = run(`${STAGING}/lp/commercial-cleaning-quote/`);
    expect(r.gtmScripts()).toBe(1);
    expect(r.dataLayer()[0]).toEqual({ site_environment: 'staging' });
  });
});

describe('every other visit keeps the deferral', () => {
  it.each([
    ['the homepage', `${PROD}/`],
    ['a utm-only Google link', `${PROD}/?utm_source=google&utm_medium=organic`],
    ['a parameter that merely contains a click-id name', `${PROD}/?notgclid=1&xgad_source=2`],
    ['a path containing /lp/ further down', `${PROD}/blog/lp/`],
  ])('%s, with only non-Ads Google cookies (and one whose name merely ends in _gcl_aw): nothing until load + idle', (_name, url) => {
    const r = run(url, { cookie: '_ga=GA1.1.123.456; _gcl_au=1.1.789.012; x_gcl_aw=1' });
    expect(r.win.document.cookie).toContain('_gcl_au=');
    expect(r.win.document.cookie).toContain('x_gcl_aw=');
    expect(r.gtmScripts()).toBe(0);
    expect(r.dataLayer()).toEqual([{ site_environment: 'production' }]);

    r.win.dispatchEvent(new r.win.Event('load'));
    expect(r.gtmScripts()).toBe(0);
    expect(r.idle).toHaveLength(1);
    r.idle[0]();
    expect(r.gtmScripts()).toBe(1);
  });

  it('a page already loaded queues the idle wait straight away', () => {
    const r = run(`${PROD}/`, { readyState: 'complete' });
    expect(r.gtmScripts()).toBe(0);
    expect(r.idle).toHaveLength(1);
    r.idle[0]();
    expect(r.gtmScripts()).toBe(1);
  });

  it.each(['pointerdown', 'keydown', 'touchstart', 'scroll', 'focusin'])('the first %s loads it', (type) => {
    const r = run(`${PROD}/`);
    expect(r.gtmScripts()).toBe(0);
    r.win.document.getElementById('text')!.dispatchEvent(new r.win.Event(type, { bubbles: true }));
    expect(r.gtmScripts()).toBe(1);
  });

  it('falls back to a 4 s timer where requestIdleCallback is missing', () => {
    {
      const win = new Window({
        url: `${PROD}/`,
        settings: { disableJavaScriptFileLoading: true, handleDisabledFileLoadingAsSuccess: true },
      });
      windows.push(win);
      win.document.head.innerHTML = '<script></script>';
      Object.defineProperty(win.document, 'readyState', { value: 'complete', configurable: true });
      (win as unknown as { requestIdleCallback: unknown }).requestIdleCallback = undefined;
      const timers: Array<{ ms: number; fn: () => void }> = [];
      (win as unknown as { setTimeout: unknown }).setTimeout = (fn: () => void, ms: number) => {
        timers.push({ fn, ms });
        return timers.length;
      };
      new Function('window', 'document', gtmLoaderScript(site.gtmId, site.analyticsHosts, PRODUCTION_HOSTS))(
        win,
        win.document,
      );
      expect(win.document.querySelectorAll('script[src]').length).toBe(0);
      expect(timers.map((t) => t.ms)).toEqual([4000]);
      timers[0].fn();
      expect(win.document.querySelectorAll('script[src]').length).toBe(1);
    }
  });
});

describe('hostname guard comes first', () => {
  it.each([
    ['localhost', 'http://localhost:4321/?gclid=abc123'],
    ['a workers.dev preview', 'https://evergreen.example.workers.dev/lp/commercial-cleaning-quote/'],
  ])('%s loads nothing, paid signal or not', (_name, url) => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const r = run(url, { cookie: '_gcl_aw=GCL.1762500000.abc123', readyState: 'complete' });
    expect(r.gtmScripts()).toBe(0);
    expect(r.dataLayer()).toEqual([]);
    expect(r.idle).toHaveLength(0);

    r.win.document.getElementById('tel')!.dispatchEvent(new r.win.Event('pointerdown', { bubbles: true }));
    r.win.dispatchEvent(new r.win.Event('load'));
    expect(r.gtmScripts()).toBe(0);
    expect(info).toHaveBeenCalledWith(expect.stringContaining('analytics: suppressed on'));
  });
});

describe('the emitted text', () => {
  const text = gtmLoaderScript(site.gtmId, site.analyticsHosts, PRODUCTION_HOSTS);

  it('stays ES5: no arrow functions, let/const, template literals or backslash escapes', () => {
    expect(text).not.toMatch(/=>/);
    expect(text).not.toMatch(/\b(let|const)\s/);
    expect(text).not.toContain('`');
    expect(text).not.toContain('\\');
  });

  it('carries the container id and both host lists as literals', () => {
    expect(text).toContain(JSON.stringify(site.gtmId));
    expect(text).toContain(JSON.stringify(site.analyticsHosts));
    expect(text).toContain(JSON.stringify(PRODUCTION_HOSTS));
  });
});

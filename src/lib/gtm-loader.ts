/**
 * The inline GTM loader, as the exact text that reaches the page.
 *
 * It lives here rather than inside `src/components/GoogleTagManager.astro` so
 * that tests/gtm-loader.test.ts can run the same bytes in a DOM and watch what
 * they do (SEO re-audit, 7 Nov 2026). The component writes this string with
 * `set:html`; why it is a plain string and not an `is:inline` body, and when
 * the container loads and why, are explained in the component.
 *
 * ES5 only, no regex backslashes: this is a template literal that becomes an
 * inline script, so `\s` here would reach the page as `s`. The cookie test
 * uses indexOf for that reason.
 */
/**
 * How long after the load event an unpaid visit that has not interacted
 * waits before the container loads anyway (13 Nov 2026, comparison with
 * impact.ca, item 1). It was "load plus an idle callback", which fired within
 * milliseconds of load and so put gtm.js and gtag.js (about 0.5-0.9 s of
 * main-thread work) inside every lab trace: TBT 480-633 ms on the mobile
 * pages measured that day. Fifteen seconds is past the point where a lab run
 * has settled, and short enough that a visitor who reads for a while without
 * scrolling is still recorded. Any interaction loads it sooner.
 */
export const GTM_FALLBACK_MS = 15000;

export function gtmLoaderScript(
  gtmId: string,
  hosts: readonly string[],
  productionHosts: readonly string[],
): string {
  return `
(function (w, d, s, l, i, hosts, production) {
  w[l] = w[l] || [];
  if (hosts.indexOf(d.location.hostname) === -1) {
    if (w.console && console.info) console.info('analytics: suppressed on ' + d.location.hostname);
    return;
  }
  w[l].push({ site_environment: production.indexOf(d.location.hostname) === -1 ? 'staging' : 'production' });
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  }
  function paidVisit() {
    if (/[?&](gclid|gbraid|wbraid|gad_source)=/.test(d.location.search)) return true;
    if (d.location.pathname.indexOf('/lp/') === 0) return true;
    var c = '';
    try { c = '; ' + d.cookie; } catch (e) {}
    var names = ['_gcl_aw=', '_gcl_gb=', '_gcl_ag='];
    for (var m = 0; m < names.length; m++) if (c.indexOf('; ' + names[m]) !== -1) return true;
    return false;
  }
  if (paidVisit()) {
    load();
    return;
  }
  var events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'focusin'];
  function onFirstInteraction(e) {
    /* Only a scroll of the page itself counts. The capture listener also
       hears scrolls inside elements, and the reviews carousel scrolls its own
       track on a timer: that loaded the container about 6 s in with nobody
       touching the page (13 Nov 2026). A visitor swiping the carousel still
       counts, through touchstart or pointerdown. */
    if (e && e.type === 'scroll' && e.target !== d && e.target !== d.documentElement && e.target !== d.body) return;
    for (var k = 0; k < events.length; k++) d.removeEventListener(events[k], onFirstInteraction, true);
    load();
  }
  for (var n = 0; n < events.length; n++) d.addEventListener(events[n], onFirstInteraction, { capture: true, passive: true });
  d.addEventListener('pointerdown', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) load();
  }, { capture: true, passive: true });
  function afterLoad() {
    w.setTimeout(load, ${GTM_FALLBACK_MS});
  }
  if (d.readyState === 'complete') afterLoad();
  else w.addEventListener('load', afterLoad);
})(window, document, 'script', 'dataLayer', ${JSON.stringify(gtmId)}, ${JSON.stringify(hosts)}, ${JSON.stringify(productionHosts)});
`.trim();
}

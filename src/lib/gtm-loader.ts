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
  function onFirstInteraction() {
    for (var k = 0; k < events.length; k++) d.removeEventListener(events[k], onFirstInteraction, true);
    load();
  }
  for (var n = 0; n < events.length; n++) d.addEventListener(events[n], onFirstInteraction, { capture: true, passive: true });
  d.addEventListener('pointerdown', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) load();
  }, { capture: true, passive: true });
  function afterLoad() {
    if (w.requestIdleCallback) w.requestIdleCallback(load, { timeout: 4000 });
    else w.setTimeout(load, 4000);
  }
  if (d.readyState === 'complete') afterLoad();
  else w.addEventListener('load', afterLoad);
})(window, document, 'script', 'dataLayer', ${JSON.stringify(gtmId)}, ${JSON.stringify(hosts)}, ${JSON.stringify(productionHosts)});
`.trim();
}

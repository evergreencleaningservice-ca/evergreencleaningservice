/**
 * The pre-cutover gate. One command, run against a build and the deployed
 * staging origin, answering: is this safe to put in front of the domain?
 *
 * WHY THIS EXISTS SEPARATELY FROM `npm test`. The suite proves the code is
 * correct. This asks a different question — whether the ARTEFACT about to be
 * promoted carries anything that only matters at launch: a test captcha key, a
 * staging noindex header, copy that renders as a raw HTML entity, a legacy
 * address that will 404 the moment the domain moves. None of those are bugs in
 * the usual sense. Every one of them is invisible until it is live, and
 * expensive from that moment.
 *
 * It is READ-ONLY and it changes nothing. It is also not a deploy step: it is
 * deliberately run and read by a person before a cutover, because the decision
 * it informs is a judgement, not an exit code.
 *
 * Usage:
 *   node scripts/launch-check.mjs [distDir] [origin]
 *   node scripts/launch-check.mjs dist https://evergreencleaningservice.10xconnections.com
 */
import fs from 'node:fs';
import path from 'node:path';
import { PREVIEW_HOST, PRODUCTION_HOSTS, captcha } from '../src/data/site.ts';
import { specRedirects, legacyRedirects, newsPageRedirects } from '../src/data/redirects.ts';

const dist = path.resolve(process.argv[2] || 'dist');
const origin = process.argv[3] || `https://${PREVIEW_HOST}`;

if (!fs.existsSync(dist)) {
  console.error(`launch-check: ${dist} not found — run a build first.`);
  process.exit(2);
}

const results = [];
const record = (level, label, detail) => {
  results.push({ level, label, detail });
  const tag = { pass: '  ok  ', block: ' BLOCK', warn: ' warn ', info: ' info ' }[level];
  console.log(`${tag} ${label}${detail ? ` — ${detail}` : ''}`);
};

const htmlFiles = (() => {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return full.endsWith('.html') ? [full] : [];
    });
  return walk(dist);
})();

console.log(`\nlaunch-check\n  build:  ${dist} (${htmlFiles.length} pages)\n  origin: ${origin}\n`);

/* --- 1. copy that renders as a raw HTML entity ---------------------------- */

/**
 * THE DOUBLE-ESCAPE. Astro escapes the output of a `{expression}`, so an HTML
 * entity written inside a PROP — `callNote="Free walkthrough &bull; No
 * obligation"` — is emitted as `&amp;bull;` and the visitor reads the literal
 * text `&bull;`. The same entity written directly in template markup is fine,
 * which is what makes this so easy to miss: both spellings look identical in
 * the source, and only one of them is wrong.
 *
 * MATCHED CASE-INSENSITIVELY, and that is not fussiness. The first version of
 * this check was case-sensitive and missed a live instance outright: the
 * element carrying it is `text-transform: uppercase`, so the rendered text
 * reads `&MDASH;`. It was found only because a second look asked why the
 * element had not been flagged.
 */
console.log('1. Copy rendered as a raw HTML entity');
{
  const offenders = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/&amp;(#?[a-z0-9]{2,8});/gi)) {
      offenders.push({
        page: '/' + path.relative(dist, file).replace(/index\.html$/, ''),
        entity: `&${m[1]};`,
        context: html.slice(Math.max(0, m.index - 45), m.index + 25).replace(/\s+/g, ' '),
      });
    }
  }
  if (offenders.length === 0) record('pass', 'no double-escaped entity in any page');
  else
    for (const o of offenders)
      record('block', `visitor reads "${o.entity}" literally on ${o.page}`, `…${o.context}…`);
}

/* --- 2. captcha keys ------------------------------------------------------ */

console.log('\n2. Spam protection');
{
  const all = htmlFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const testKeys = [
    ['Turnstile test site key', captcha.turnstile.testSiteKey],
    ['reCAPTCHA test site key', captcha.recaptcha.testSiteKey],
  ];
  let found = false;
  for (const [name, key] of testKeys) {
    if (all.includes(key)) {
      found = true;
      record('block', `${name} is baked into the build`, key);
    }
  }
  if (!found) record('pass', 'no published test key in the build');

  /* A secret must never be in a page, whatever else is true. */
  for (const secret of [captcha.turnstile.testSecretKey, captcha.turnstile.failSecretKey]) {
    if (all.includes(secret)) record('block', 'a captcha SECRET appears in the built HTML', secret);
  }
}

/* --- 3. the indexing posture of the artefact ------------------------------ */

console.log('\n3. Indexing posture of this build');
{
  const headers = path.join(dist, '_headers');
  const text = fs.existsSync(headers) ? fs.readFileSync(headers, 'utf8') : '';
  const sitewideNoindex = /^\/\*[\s\S]{0,200}?X-Robots-Tag:\s*[^\n]*noindex/im.test(text);
  if (sitewideNoindex)
    record(
      'block',
      'this build carries the sitewide staging noindex',
      'correct for staging; deindexes the business if promoted to production'
    );
  else record('pass', 'no sitewide noindex in _headers');

  const robots = path.join(dist, 'robots.txt');
  const rb = fs.existsSync(robots) ? fs.readFileSync(robots, 'utf8') : '';
  if (/^\s*Disallow:\s*\/\s*$/im.test(rb))
    record(
      'block',
      'robots.txt carries Disallow: /',
      'this blocks the CRAWL, so a noindex is never read and the URL can still be indexed from a link'
    );
  else record('pass', 'robots.txt does not Disallow: /');

  /* The pages that must stay noindex wherever they are served. */
  for (const p of ['lp/commercial-cleaning', 'lp/commercial-cleaning-quote', 'thank-you']) {
    const f = path.join(dist, p, 'index.html');
    if (!fs.existsSync(f)) { record('warn', `${p} not in this build`); continue; }
    const meta = fs.readFileSync(f, 'utf8').match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
    record(/noindex/i.test(meta) ? 'pass' : 'block', `/${p}/ carries a robots noindex`, meta || '(none)');
  }
}

/* --- 4. legacy addresses, including the slashless spelling ---------------- */

/**
 * `_redirects` matches a path exactly, so a rule written `/office-cleaning/`
 * does not match `/office-cleaning`. WordPress answered both — it 301'd the
 * slashless form onto the slashed one — so every inbound link written without
 * the trailing slash works today and stops working at cutover. There is no
 * page at the slashless path for the edge's own normalisation to find, so it
 * is a 404 rather than a second hop.
 *
 * Splat rules are exempt: `/blog/*` matches with or without the slash.
 */
console.log('\n4. Legacy addresses (both spellings)');
{
  const exact = [...specRedirects, ...legacyRedirects, ...newsPageRedirects].filter(
    (r) => r.from.endsWith('/') && r.from !== '/'
  );
  const lost = [];
  for (const r of exact) {
    const res = await fetch(new URL(r.from.replace(/\/$/, ''), origin), {
      method: 'HEAD',
      redirect: 'follow',
    });
    if (res.status === 404) lost.push(r.from.replace(/\/$/, ''));
  }
  if (lost.length === 0) record('pass', `all ${exact.length} legacy addresses resolve without the trailing slash`);
  else
    record(
      'block',
      `${lost.length} of ${exact.length} legacy addresses 404 without the trailing slash`,
      lost.slice(0, 4).join(', ') + (lost.length > 4 ? `, +${lost.length - 4} more` : '')
    );
}

/* --- 5. the origin agrees with the artefact ------------------------------- */

console.log('\n5. The deployed origin');
{
  const res = await fetch(origin, { redirect: 'follow' });
  const body = await res.text();

  /* A challenge interstitial is not a page, and nothing below can be read off
     one. Said plainly rather than reported as a pile of failures. */
  if (res.status === 202 || res.headers.has('sg-captcha')) {
    record('warn', 'origin served a challenge interstitial, not the site', `HTTP ${res.status} — nothing here can be measured from this network`);
  } else {
    record(res.ok ? 'pass' : 'block', 'origin serves the homepage', `HTTP ${res.status}`);
    const tag = res.headers.get('x-robots-tag') ?? '';
    const isProd = PRODUCTION_HOSTS.some((h) => origin.includes(h));
    if (isProd)
      record(/noindex/i.test(tag) ? 'block' : 'pass', 'production origin is not noindexed', tag || '(absent)');
    else record(/noindex/i.test(tag) ? 'pass' : 'block', 'staging origin is noindexed', tag || '(absent)');

    const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
    record(
      canonical.startsWith(`https://${PRODUCTION_HOSTS[0]}`) ? 'pass' : 'block',
      'canonical names the final domain',
      canonical || '(none)'
    );
  }
}

/* --- verdict -------------------------------------------------------------- */

const blockers = results.filter((r) => r.level === 'block');
const warns = results.filter((r) => r.level === 'warn');
console.log(
  `\n${results.filter((r) => r.level === 'pass').length} passed, ${blockers.length} blocking, ${warns.length} warning\n`
);
if (blockers.length) {
  console.log('BLOCKING:');
  for (const b of blockers) console.log(`  · ${b.label}${b.detail ? ` — ${b.detail}` : ''}`);
  console.log(
    '\nA blocker here is not automatically a stop — a staging build is SUPPOSED to\n' +
      'carry the noindex and the test key. Read each one against what this build is\n' +
      'for. The list exists so the decision is made deliberately, not by omission.\n'
  );
}

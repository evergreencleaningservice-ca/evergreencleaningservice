/**
 * The final acceptance crawl, against a DEPLOYED origin.
 *
 * Measures exactly what `_research/baseline.md` §1.3 measured at Phase 1, by
 * the same definitions, so the two columns of the acceptance table are
 * comparable. A final number produced by a different method than the baseline
 * is not a comparison, it is two unrelated facts printed side by side.
 *
 * READ-ONLY. GET and HEAD only; it submits nothing and stores nothing.
 *
 * Usage:
 *   node scripts/final-crawl.mjs [origin] [--json <file>]
 */
import fs from 'node:fs';
import { PREVIEW_HOST, PRODUCTION_HOSTS, nap } from '../src/data/site.ts';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonPath = jsonAt !== -1 ? args[jsonAt + 1] : null;
const origin = (args.find((a) => a.startsWith('http')) ?? `https://${PREVIEW_HOST}`).replace(/\/$/, '');
const CANONICAL_ORIGIN = `https://${PRODUCTION_HOSTS[0]}`;

const get = async (url, method = 'GET') => {
  const res = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': 'evergreen-final-crawl (read-only)' } });
  const body = method === 'GET' && /text|xml|html/.test(res.headers.get('content-type') ?? '') ? await res.text() : '';
  return { res, body };
};

/* --- 1. the sitemap ------------------------------------------------------- */

const index = await get(`${origin}/sitemap-index.xml`);
const childSitemaps = [...index.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapUrls = [];
for (const child of childSitemaps) {
  const { body } = await get(child.replace(CANONICAL_ORIGIN, origin));
  sitemapUrls.push(...[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

console.log(`\nfinal-crawl: ${origin}`);
console.log(`sitemap index → ${childSitemaps.length} child sitemap(s), ${sitemapUrls.length} URL(s)\n`);

/* --- 2. fetch every sitemap page ------------------------------------------ */

const pages = [];
for (const canonicalUrl of sitemapUrls) {
  const url = canonicalUrl.replace(CANONICAL_ORIGIN, origin);
  const { res, body } = await get(url);

  /* Everything read per page, in one pass, so a page is fetched once. */
  const h1s = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  );

  pages.push({
    url,
    canonicalUrl,
    path: new URL(url).pathname,
    status: res.status,
    xRobotsTag: res.headers.get('x-robots-tag'),
    title: body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? null,
    description: body.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? null,
    canonical: body.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? null,
    robotsMeta: body.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? null,
    h1s,
    jsonLd: [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]),
    /* Internal links, de-duplicated per page, with the fragment and any
       query stripped — a link to `#form` is not a separate destination. */
    links: [
      ...new Set(
        [...body.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)]
          .map((m) => m[1])
          .filter((h) => h.startsWith('/') || h.startsWith(origin) || h.startsWith(CANONICAL_ORIGIN))
          .map((h) => new URL(h, origin).pathname)
      ),
    ],
    /**
     * `alt` WITHOUT A VALUE IS STILL AN ALT. `<img … alt loading="lazy">` is
     * valid HTML and means exactly what `alt=""` means: the image is
     * decorative and assistive technology should skip it.
     *
     * The first version of this matched only `alt="…"`, so it reported three
     * homepage hero images as missing their alt text. They were not missing
     * anything — they were correctly marked decorative in the shorter
     * spelling. That is a crawler defect presented as a site defect, and it
     * is the exact failure this project has been bitten by before.
     *
     * `data-src` is read alongside `src` because the lazy-loaded slides carry
     * the address there until the loader promotes it.
     */
    images: [...body.matchAll(/<img\b([^>]*?)\/?>/gi)].map((m) => {
      const attrs = m[1];
      const valued = attrs.match(/\balt="([^"]*)"/);
      /* A bare `alt` — followed by whitespace, `/` or end of tag, never `=`. */
      const bare = /\balt(?=[\s/]|$)/.test(attrs);
      return {
        src: attrs.match(/\b(?:src|data-src)="([^"]*)"/)?.[1] ?? '',
        alt: valued ? valued[1] : bare ? '' : null,
        hasAltAttr: Boolean(valued) || bare,
      };
    }),
    telLinks: (body.match(/href="tel:[^"]*"/gi) ?? []).length,
    forms: [...body.matchAll(/<form\b([^>]*)>/gi)].map((m) => m[1].match(/\bid="([^"]*)"/)?.[1] ?? '(no id)'),
  });
}

/* --- 3. link resolution: broken, redirected, chained ---------------------- */

/**
 * Each distinct internal destination is resolved ONCE and the verdict reused,
 * which is what makes a 77-page crawl finish: the navigation alone repeats the
 * same twenty destinations on every page.
 */
const destinations = new Map();
const allTargets = [...new Set(pages.flatMap((p) => p.links))];

for (const path of allTargets) {
  const hops = [];
  let url = `${origin}${path}`;
  let status = null;
  for (let i = 0; i < 5; i++) {
    const { res } = await get(url, 'HEAD');
    status = res.status;
    const loc = res.headers.get('location');
    if (!loc) break;
    hops.push(new URL(loc, origin).pathname);
    url = new URL(loc, origin).href;
  }
  destinations.set(path, { finalStatus: status, hops, final: new URL(url).pathname });
}

const broken = allTargets.filter((p) => {
  const d = destinations.get(p);
  return d.finalStatus >= 400;
});
const throughRedirect = allTargets.filter((p) => destinations.get(p).hops.length >= 1);
const chains = allTargets.filter((p) => destinations.get(p).hops.length >= 2);

/* Linked-from counts, because "29 targets" understates a nav link on 69 pages. */
const linkedFrom = (path) => pages.filter((p) => p.links.includes(path)).length;

/* --- 4. report ------------------------------------------------------------ */

const uniq = (xs) => new Set(xs.filter(Boolean)).size;
const line = (label, value) => console.log(`  ${label.padEnd(44)} ${value}`);

console.log('=== Crawl');
line('sitemap URLs', sitemapUrls.length);
line('pages fetched', pages.length);
line('HTTP 200', pages.filter((p) => p.status === 200).length);
line('non-200', pages.filter((p) => p.status !== 200).map((p) => `${p.path} ${p.status}`).join(', ') || '0');

console.log('\n=== Metadata');
line('titles present', pages.filter((p) => p.title).length);
line('titles unique', uniq(pages.map((p) => p.title)));
line('descriptions present', pages.filter((p) => p.description).length);
line('descriptions unique', uniq(pages.map((p) => p.description)));
line('canonicals present', pages.filter((p) => p.canonical).length);
line(
  'canonicals on the production origin',
  pages.filter((p) => p.canonical?.startsWith(CANONICAL_ORIGIN)).length
);
const canonicalMismatch = pages.filter((p) => p.canonical !== p.canonicalUrl);
line('canonical matches its sitemap URL', `${pages.length - canonicalMismatch.length} of ${pages.length}`);
if (canonicalMismatch.length)
  for (const p of canonicalMismatch.slice(0, 5)) console.log(`      ${p.path} → ${p.canonical}`);

console.log('\n=== Headings');
const oneH1 = pages.filter((p) => p.h1s.length === 1);
line('exactly one H1', `${oneH1.length} of ${pages.length}`);
const multiH1 = pages.filter((p) => p.h1s.length > 1);
const noH1 = pages.filter((p) => p.h1s.length === 0);
line('two or more H1', multiH1.length);
for (const p of multiH1) console.log(`      ${p.path} → ${p.h1s.map((h) => `"${h}"`).join(' + ')}`);
line('no H1', noH1.length);
for (const p of noH1) console.log(`      ${p.path}`);

console.log('\n=== Internal links');
line('distinct internal destinations', allTargets.length);
line('broken (4xx/5xx)', broken.length);
for (const p of broken) console.log(`      ${p} → ${destinations.get(p).finalStatus} (linked from ${linkedFrom(p)} page(s))`);
line('pass through a redirect', throughRedirect.length);
for (const p of throughRedirect)
  console.log(
    `      ${p} → ${destinations.get(p).hops.join(' → ')} (from ${linkedFrom(p)} page(s))`
  );
line('redirect chains (2+ hops)', chains.length);
for (const p of chains) console.log(`      ${p} → ${destinations.get(p).hops.join(' → ')}`);

console.log('\n=== Indexability');
const noindexHeader = pages.filter((p) => /noindex/i.test(p.xRobotsTag ?? ''));
line('X-Robots-Tag noindex', `${noindexHeader.length} of ${pages.length}`);
line('robots meta present', pages.filter((p) => p.robotsMeta).length);
line('robots meta noindex', pages.filter((p) => /noindex/i.test(p.robotsMeta ?? '')).length);

console.log('\n=== Structured data');
const ldTypes = new Map();
let malformed = 0;
for (const p of pages) {
  for (const raw of p.jsonLd) {
    try {
      const parsed = JSON.parse(raw);
      /**
       * WALK `@graph`. The site's global block is a single `@graph` holding
       * the organisation, the website and the page entity — the normal way to
       * publish several linked entities at once.
       *
       * Counting only the root object reported 69 blocks as "(no @type)",
       * which reads as 69 malformed entities and is the opposite of the truth:
       * the root of an `@graph` document is not supposed to have a type.
       */
      const nodes = [];
      const visit = (node) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node['@graph'])) return node['@graph'].forEach(visit);
        nodes.push(node);
      };
      visit(parsed);

      for (const node of nodes) {
        const t = node['@type'] ?? '(no @type)';
        const key = Array.isArray(t) ? t.join('+') : t;
        ldTypes.set(key, (ldTypes.get(key) ?? 0) + 1);
      }
    } catch {
      malformed++;
      console.log(`      MALFORMED JSON-LD on ${p.path}`);
    }
  }
}
line('JSON-LD blocks total', pages.reduce((n, p) => n + p.jsonLd.length, 0));
line('malformed', malformed);
for (const [t, n] of [...ldTypes].sort((a, b) => b[1] - a[1])) line(`  @type ${t}`, n);

/* Ratings and review counts are the single most common structured-data
   penalty, so they are counted explicitly rather than left inside the type
   tally. */
const ratingPages = pages.filter((p) => p.jsonLd.some((j) => /aggregateRating|reviewCount|ratingValue/.test(j)));
line('pages publishing aggregateRating', ratingPages.length);
for (const p of ratingPages.slice(0, 5)) console.log(`      ${p.path}`);

console.log('\n=== NAP in structured data');
const napPages = pages.filter((p) => p.jsonLd.some((j) => j.includes(nap.phoneSchema)));
line(`pages publishing ${nap.phoneSchema}`, napPages.length);
const otherPhones = new Set();
for (const p of pages)
  for (const j of p.jsonLd)
    for (const m of j.matchAll(/"telephone"\s*:\s*"([^"]+)"/g)) otherPhones.add(m[1]);
line('distinct telephone values in JSON-LD', [...otherPhones].join(', ') || 'none');

console.log('\n=== Images');
const allImages = pages.flatMap((p) => p.images.map((i) => ({ ...i, page: p.path })));
line('img elements', allImages.length);
line('missing an alt attribute', allImages.filter((i) => !i.hasAltAttr).length);
for (const i of allImages.filter((x) => !x.hasAltAttr).slice(0, 10))
  console.log(`      ${i.page} → ${i.src.slice(-55)}`);
line('empty alt (decorative)', allImages.filter((i) => i.hasAltAttr && i.alt === '').length);
line('non-empty alt', allImages.filter((i) => i.alt).length);
const offOrigin = allImages.filter((i) => /^https?:\/\//.test(i.src) && !i.src.includes('img-evergreencleaningservice'));
line('images not on the image host', offOrigin.length);

console.log('\n=== Forms and telephone links');
const formPages = pages.filter((p) => p.forms.length);
line('pages carrying a form', formPages.length);
for (const p of formPages) console.log(`      ${p.path} → ${p.forms.join(', ')}`);
line('tel: links total', pages.reduce((n, p) => n + p.telLinks, 0));
line('pages with at least one tel: link', pages.filter((p) => p.telLinks > 0).length);

if (jsonPath) {
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      { origin, sitemapUrls, pages, destinations: Object.fromEntries(destinations) },
      null,
      2
    )
  );
  console.log(`\nraw → ${jsonPath}`);
}
console.log();

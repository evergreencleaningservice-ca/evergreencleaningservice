/**
 * Checks a DEPLOYED site's indexability against what it is supposed to be.
 *
 *   npm run verify:indexing -- staging
 *   npm run verify:indexing -- production
 *   npm run verify:indexing -- https://some-other-host/
 *
 * WHY THIS IS NOT A UNIT TEST. Everything it looks at is a property of the
 * deployed response, not of the build: an `X-Robots-Tag` comes from
 * `dist/_headers` as Cloudflare interprets it, `robots.txt` is whatever is
 * actually being served, and both can be right in the repository and wrong on
 * the origin — a stale deploy, an edge cache, a zone-level transform rule, a
 * `_headers` file that Workers static assets did not pick up. The build tests
 * in `tests/build/indexability.test.ts` prove the artefact; this proves the
 * site. They are different claims and the brief asks for both.
 *
 * The two expectations are opposites, which is the whole risk:
 *
 *   STAGING      must be noindex, or it competes with the live site for its
 *                own rankings.
 *   PRODUCTION   must NOT be noindex. Launching with the staging header still
 *                attached would deindex the business. It is the single most
 *                expensive mistake available at cutover, and it is invisible
 *                from the page.
 */
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site.ts';

const TARGETS = {
  staging: { origin: `https://${PREVIEW_HOST}`, indexable: false },
  production: { origin: `https://${PRODUCTION_HOSTS[0]}`, indexable: true },
};

const arg = process.argv[2];
if (!arg) {
  console.error('usage: npm run verify:indexing -- staging | production | <origin>');
  process.exit(2);
}

const target =
  TARGETS[arg] ??
  (() => {
    const origin = new URL(arg).origin;
    return { origin, indexable: PRODUCTION_HOSTS.includes(new URL(origin).hostname) };
  })();

const CANONICAL_ORIGIN = `https://${PRODUCTION_HOSTS[0]}`;

/** Pages that must be crawlable and indexable wherever the site is live. */
const PUBLIC_PAGES = [
  '/',
  '/about-us/',
  '/contact-us/',
  '/services/',
  '/services/office-cleaning/',
  '/request-a-quote/',
];

/** Pages that must carry a robots meta wherever they are served. */
const NOINDEX_PAGES = [
  '/lp/commercial-cleaning/',
  '/lp/commercial-cleaning-quote/',
  '/thank-you/',
];

const results = [];
const record = (ok, label, detail) => {
  results.push({ ok, label, detail });
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
};

const get = async (path) => {
  const res = await fetch(new URL(path, target.origin), { redirect: 'follow' });
  return { res, body: await res.text() };
};

console.log(`\nverify-indexing: ${target.origin} (expected ${target.indexable ? 'INDEXABLE' : 'NOINDEX'})\n`);

/* --- 1. the X-Robots-Tag header, which is the source of truth ------------ */
{
  const { res } = await get('/');
  const tag = res.headers.get('x-robots-tag') ?? '';
  if (target.indexable) {
    record(!/noindex/i.test(tag), 'X-Robots-Tag does not noindex the homepage', tag || '(absent)');
  } else {
    record(/noindex/i.test(tag), 'X-Robots-Tag noindexes the homepage', tag || '(absent)');
  }
}

/* --- 2. robots.txt ------------------------------------------------------- */
{
  const { res, body } = await get('/robots.txt');
  record(res.ok, 'robots.txt is served', `HTTP ${res.status}`);

  /* Never `Disallow: /` as a noindex. It stops the crawl, so the noindex
     header is never read, and the URL can still be indexed from an inbound
     link with no way for the noindex to be seen. */
  const disallowAll = /^\s*Disallow:\s*\/\s*$/im.test(body);
  record(!disallowAll, 'robots.txt does not Disallow: /', disallowAll ? 'it does' : '');

  if (target.indexable) {
    record(/^\s*Allow:\s*\//im.test(body), 'robots.txt allows the public pages');
    const sitemap = body.match(/^\s*Sitemap:\s*(\S+)/im)?.[1] ?? '';
    record(
      sitemap.startsWith(CANONICAL_ORIGIN),
      'robots.txt names the sitemap on the final domain',
      sitemap || '(no Sitemap line)'
    );
  }
}

/* --- 3. canonicals, on the final domain ---------------------------------- */
for (const path of PUBLIC_PAGES) {
  const { res, body } = await get(path);
  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const expected = `${CANONICAL_ORIGIN}${path}`;
  record(res.ok && canonical === expected, `canonical on ${path}`, canonical || '(none)');

  const meta = body.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  record(!/noindex/i.test(meta), `no robots noindex meta on ${path}`, meta || '(none)');
}

/* --- 4. the pages that are meant to be noindex, still are ---------------- */
for (const path of NOINDEX_PAGES) {
  const { body } = await get(path);
  const meta = body.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  record(/noindex/i.test(meta), `${path} is noindex`, meta || '(none)');
}

/* --- 5. the sitemap ------------------------------------------------------ */
{
  const { res, body } = await get('/sitemap-index.xml');
  record(res.ok, 'sitemap-index.xml is served', `HTTP ${res.status}`);

  const children = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  record(children.length > 0, 'sitemap index lists at least one sitemap', `${children.length}`);

  const urls = [];
  for (const child of children) {
    const sub = await fetch(child.replace(CANONICAL_ORIGIN, target.origin));
    if (!sub.ok) {
      record(false, `sitemap ${child} is served`, `HTTP ${sub.status}`);
      continue;
    }
    urls.push(...[...(await sub.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }

  const wrongOrigin = urls.filter((u) => !u.startsWith(`${CANONICAL_ORIGIN}/`));
  record(
    urls.length > 0 && wrongOrigin.length === 0,
    'every sitemap URL is on the final domain',
    `${urls.length} URL(s)${wrongOrigin.length ? `, ${wrongOrigin.length} wrong: ${wrongOrigin[0]}` : ''}`
  );

  const leaked = urls.filter((u) => /\/(lp|thank-you|category\/blog)\//.test(u));
  record(leaked.length === 0, 'no noindexed route is in the sitemap', leaked[0] ?? '');
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed.\n`);
if (failed.length) {
  console.error(`verify-indexing: FAILED\n${failed.map((f) => `  ${f.label} — ${f.detail}`).join('\n')}\n`);
  process.exit(1);
}

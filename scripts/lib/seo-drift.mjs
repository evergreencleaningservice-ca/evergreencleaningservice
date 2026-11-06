/**
 * SEO drift: the parsing, capture and comparison behind `scripts/seo-drift.mjs`.
 *
 * WHY THIS EXISTS (2026-11-06, audit ACTION-PLAN item 32). The audit asked for
 * a drift baseline so that a later deploy which quietly drops a page from the
 * sitemap, noindexes a service page or points a canonical somewhere else is
 * caught by a command rather than by a fall in traffic weeks later. The
 * claude-seo plugin's drift scripts refuse the proxy this environment fetches
 * through, so this is the same idea written for this repository: plain fetch,
 * no new dependency.
 *
 * WHY REGEX AND NOT A DOM. The site's HTML is emitted by Astro and is regular:
 * one <title>, one <main>, meta tags in the head. Every other script in
 * `scripts/` reads it with regular expressions, and happy-dom (the one DOM in
 * package.json) is a test dependency that would also try to load the page's
 * scripts and stylesheets. The one place a naive regex goes wrong — attribute
 * order and quoting — is handled by `parseAttributes`, and the tests feed it
 * the awkward spellings on purpose.
 *
 * Everything here is pure apart from `capture`, which takes its `fetch` and
 * its delay as arguments so the tests can drive it with a fake site.
 */
import { createHash } from 'node:crypto';

/* --- small HTML helpers ------------------------------------------------- */

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  middot: '·',
  bull: '•',
  rarr: '→',
  larr: '←',
};

/** Decodes the entities Astro and the copy actually use; others are left as written. */
export const decodeEntities = (s) =>
  s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });

const collapse = (s) => s.replace(/\s+/g, ' ').trim();

/**
 * Attributes of one start tag, names lower-cased, values decoded. Handles
 * double, single and unquoted values, bare attributes and any order — the
 * site writes `<meta name="robots" content="…">` today, and a component
 * change that writes `<meta content='…' name=robots>` must read the same.
 */
export const parseAttributes = (tag) => {
  const attrs = {};
  const inner = tag.replace(/^<[a-z0-9-]+/i, '').replace(/\/?>$/, '');
  for (const m of inner.matchAll(/([^\s"'=<>/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = m[1].toLowerCase();
    if (name in attrs) continue; /* the first wins, as in a browser */
    attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
};

/** A start tag, with quoted attribute values allowed to contain `>`. */
const startTag = (name) => new RegExp(`<${name}(?=[\\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');

/** The attributes of every `<name …>` start tag, in document order. */
export const findTags = (html, name) => [...html.matchAll(startTag(name))].map((m) => parseAttributes(m[0]));

/** Every `<name …>…</name>` element as { attrs, inner }, in document order. Not for nested same-name elements. */
export const findElements = (html, name) =>
  [
    ...html.matchAll(
      new RegExp(`(<${name}(?=[\\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>)([\\s\\S]*?)</${name}\\s*>`, 'gi')
    ),
  ].map((m) => ({ attrs: parseAttributes(m[1]), inner: m[2] }));

/* Inline elements join their neighbours without a space ("<b>Toron</b>to" is
   one word); every other tag is a boundary. */
const INLINE =
  'a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|mark|q|s|samp|small|span|strong|sub|sup|time|u|var|wbr';

/**
 * The visible text of an HTML fragment: no scripts, styles, templates,
 * noscript fallbacks, inline SVG or comments, entities decoded, whitespace
 * collapsed.
 */
export const visibleText = (html) =>
  collapse(
    decodeEntities(
      html
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<(script|style|template|noscript|svg)(?=[\s/>])[\s\S]*?<\/\1\s*>/gi, ' ')
        .replace(new RegExp(`</?(?:${INLINE})(?=[\\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi'), '')
        .replace(/<[^>]*>/g, ' ')
    )
  );

/** Words are runs of non-space that contain a letter or a digit, so "—" and "|" do not count. */
export const wordCount = (text) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** Short, stable fingerprint of a page's main text. 16 hex characters is plenty to notice a change. */
export const textHash = (text) => `sha256:${createHash('sha256').update(text).digest('hex').slice(0, 16)}`;

/**
 * Every `@type` in a JSON-LD value, recursively — top-level nodes, `@graph`
 * members and nested ones (PostalAddress, AggregateRating, ListItem). A type
 * that disappears anywhere is what a schema regression looks like.
 */
const collectTypes = (value, out) => {
  if (Array.isArray(value)) {
    for (const v of value) collectTypes(v, out);
  } else if (value && typeof value === 'object') {
    const t = value['@type'];
    for (const one of Array.isArray(t) ? t : t == null ? [] : [t]) if (typeof one === 'string') out.add(one);
    for (const [k, v] of Object.entries(value)) if (k !== '@type') collectTypes(v, out);
  }
};

/** JSON-LD @types, sorted and de-duplicated, plus how many blocks failed to parse. */
export const jsonLd = (html) => {
  const types = new Set();
  let invalid = 0;
  for (const { attrs, inner } of findElements(html, 'script')) {
    if ((attrs.type ?? '').trim().toLowerCase() !== 'application/ld+json') continue;
    try {
      collectTypes(JSON.parse(inner), types);
    } catch {
      invalid += 1;
    }
  }
  return { types: [...types].sort(), invalid };
};

const metaContent = (metas, key, value) => {
  const hit = metas.find((a) => (a[key] ?? '').toLowerCase() === value);
  return hit ? collapse(hit.content ?? '') : null;
};

/**
 * Everything the monitor reads from one page's HTML. Response facts (status,
 * redirect target, X-Robots-Tag) are added by `pageRecord`, not here.
 */
export const extractSeo = (html) => {
  const metas = findTags(html, 'meta');
  const title = findElements(html, 'title')[0];
  const canonical = findTags(html, 'link').find((a) =>
    (a.rel ?? '').toLowerCase().split(/\s+/).includes('canonical')
  );
  const main = findElements(html, 'main')[0];
  const mainText = main ? visibleText(main.inner) : null;
  const schema = jsonLd(html);
  return {
    title: title ? collapse(decodeEntities(title.inner.replace(/<[^>]*>/g, ''))) : null,
    description: metaContent(metas, 'name', 'description'),
    metaRobots: metaContent(metas, 'name', 'robots'),
    metaGooglebot: metaContent(metas, 'name', 'googlebot'),
    canonical: canonical ? (canonical.href ?? '').trim() || null : null,
    h1: findElements(html, 'h1').map((e) => visibleText(e.inner)),
    h2Count: findTags(html, 'h2').length,
    schemaTypes: schema.types,
    jsonLdInvalid: schema.invalid,
    ogImage: metaContent(metas, 'property', 'og:image') ?? metaContent(metas, 'name', 'og:image'),
    /* null rather than 0 when there is no <main>, so "the landmark went
       missing" and "the page is empty" are not the same reading. */
    wordCount: mainText === null ? null : wordCount(mainText),
    mainHash: mainText === null ? null : textHash(mainText),
  };
};

/** `<loc>` values of a sitemap or sitemap index, decoded. */
export const sitemapLocs = (xml) =>
  [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((m) =>
    decodeEntities(m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim())
  );

/** The baseline is keyed by path, so a staging or local run compares with production. */
export const pathOf = (url) => {
  const u = new URL(url);
  return `${u.pathname}${u.search}`;
};

/* --- indexability -------------------------------------------------------- */

const NOINDEX = /\b(noindex|none)\b/i;

/** Noindex by any of the three places it can be said. */
export const isNoindex = (rec) =>
  NOINDEX.test(rec.metaRobots ?? '') || NOINDEX.test(rec.metaGooglebot ?? '') || NOINDEX.test(rec.xRobotsTag ?? '');

/** Indexable means: answers 200 and nothing says noindex. */
export const isIndexable = (rec) => rec.status === 200 && !isNoindex(rec);

/* --- capture --------------------------------------------------------------- */

/**
 * The pages that must never become indexable, checked on every run whether or
 * not the sitemap mentions them. The form's confirmation page, on-site search,
 * one of the two paid landing pages and one tag archive (the archives are
 * `follow, noindex`; see `src/pages/tag/[tag]/[...page].astro`).
 */
export const MUST_STAY_NOINDEX = ['/thank-you/', '/search/', '/lp/commercial-cleaning/', '/tag/cleaning/'];

export const USER_AGENT =
  'EvergreenSEODriftMonitor/1.0 (+https://www.evergreencleaningservice.ca/; the site\'s own read-only SEO monitor)';

/**
 * A response that is not the page. A Cloudflare challenge or a rate limit
 * would otherwise be read as "the title vanished, the canonical is gone and
 * the page is noindex", which is a page of false CRITICALs. Such a page is
 * reported as unverified instead. `cf-mitigated` is Cloudflare's documented
 * marker for a challenge; the body test is a fallback for a 403/503 that
 * carries the interstitial without it.
 */
export const isChallenge = (status, headers, body) =>
  (headers['cf-mitigated'] ?? '').toLowerCase() === 'challenge' ||
  status === 429 ||
  ((status === 403 || status === 503) && /Just a moment\.\.\.|cf-chl-|challenge-platform\/h\/[bg]\/orchestrate/i.test(body));

/** One page's record, from the response facts and the body. */
export const pageRecord = ({ status, headers, body, url }) => {
  const location = headers.location ? new URL(headers.location, url).href : null;
  const base = {
    status,
    redirect: status >= 300 && status < 400 ? location : null,
    xRobotsTag: headers['x-robots-tag'] ?? null,
  };
  const html = status === 200 && /html/i.test(headers['content-type'] ?? 'text/html') ? body : '';
  return { ...base, ...extractSeo(html) };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Reads the live sitemaps and every page, one request at a time and no faster
 * than one every `delayMs`. Returns a snapshot in the baseline's shape.
 *
 * `canonicalOrigin` is where the sitemap's own URLs point (always production);
 * they are rewritten onto `origin`, so `--origin` at staging reads staging's
 * pages rather than production's.
 */
export const capture = async ({
  origin,
  canonicalOrigin = 'https://www.evergreencleaningservice.ca',
  mustStayNoindex = MUST_STAY_NOINDEX,
  extraPaths = [],
  fetchImpl = fetch,
  delayMs = 300,
  now = () => new Date(),
  log = () => {},
}) => {
  origin = origin.replace(/\/$/, '');
  let last = 0;
  const get = async (url) => {
    const wait = last + delayMs - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const res = await fetchImpl(url, {
        redirect: 'manual',
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xml;q=0.9,*/*;q=0.8' },
        signal: AbortSignal.timeout(30_000),
      });
      const headers = Object.fromEntries([...res.headers].map(([k, v]) => [k.toLowerCase(), v]));
      const body = await res.text();
      return { status: res.status, headers, body, url };
    } catch (err) {
      /* undici says only "fetch failed"; the reason (DNS, refused, a proxy
         403, a timeout) is on `cause`, and it is the useful half. */
      const cause = err?.cause?.code ?? err?.cause?.message;
      return { status: 0, headers: {}, body: '', url, error: `${err?.message ?? err}${cause ? ` (${cause})` : ''}` };
    }
  };
  const onOrigin = (u) => (u.startsWith(canonicalOrigin) ? origin + u.slice(canonicalOrigin.length) : u);

  /* 1. the sitemaps */
  const sitemap = { index: `${origin}/sitemap-index.xml`, status: 0, children: [], ok: false, unverified: false };
  const index = await get(sitemap.index);
  sitemap.status = index.status;
  const inSitemap = new Set();
  if (index.status === 0 || isChallenge(index.status, index.headers, index.body)) {
    sitemap.unverified = true;
  } else if (index.status === 200) {
    sitemap.ok = true;
    for (const child of sitemapLocs(index.body)) {
      const res = await get(onOrigin(child));
      sitemap.children.push({ url: child, status: res.status });
      if (res.status === 0 || isChallenge(res.status, res.headers, res.body)) sitemap.unverified = true;
      if (res.status !== 200) {
        sitemap.ok = false;
        continue;
      }
      for (const loc of sitemapLocs(res.body)) inSitemap.add(pathOf(loc));
    }
    if (inSitemap.size === 0) sitemap.ok = false;
  }
  log(`sitemap: ${sitemap.children.length} child sitemap(s), ${inSitemap.size} URL(s)`);

  /* 2. every page */
  const must = new Set(mustStayNoindex);
  const paths = [...new Set([...inSitemap, ...mustStayNoindex, ...extraPaths])].sort();
  const pages = {};
  const unverified = {};
  for (const path of paths) {
    const res = await get(origin + path);
    if (res.status === 0 || isChallenge(res.status, res.headers, res.body)) {
      unverified[path] = res.error ?? `HTTP ${res.status}${res.headers['cf-mitigated'] ? ' (cf-mitigated)' : ''}`;
      log(`  ?? ${path} ${unverified[path]}`);
      continue;
    }
    pages[path] = { ...pageRecord(res), inSitemap: inSitemap.has(path), mustStayNoindex: must.has(path) };
    log(`  ${res.status} ${path}`);
  }

  return {
    capturedAt: now().toISOString(),
    origin,
    userAgent: USER_AGENT,
    sitemap: { index: sitemap.index, children: sitemap.children, ok: sitemap.ok, urlCount: inSitemap.size },
    sitemapUnverified: sitemap.unverified,
    mustStayNoindex: [...mustStayNoindex].sort(),
    pages,
    unverified,
  };
};

/* --- the baseline file ---------------------------------------------------- */

const sortKeys = (v) =>
  Array.isArray(v)
    ? v.map(sortKeys)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, sortKeys(v[k])])
        )
      : v;

/** JSON with every object's keys sorted and two-space indent, so a re-capture diffs line by line. */
export const stableStringify = (value) => `${JSON.stringify(sortKeys(value), null, 2)}\n`;

/** What is written to disk: the snapshot without the run-only fields. */
export const toBaseline = (snapshot) => {
  const { unverified, sitemapUnverified, ...rest } = snapshot;
  return { tool: 'scripts/seo-drift.mjs', ...rest };
};

/* --- comparison ----------------------------------------------------------- */

export const SEVERITIES = ['CRITICAL', 'WARNING', 'INFO'];

const sameList = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);
const show = (v) => (v === null || v === undefined || v === '' ? '(none)' : JSON.stringify(v));

/**
 * The X-Robots-Tag a non-production host puts on every page, or null.
 *
 * One build is served on every host, and `public/_headers` noindexes the
 * staging and workers.dev hosts with a header on every response (by hostname,
 * never by path). Checking staging against the production baseline is the
 * useful pre-promotion run, but read page by page that header is "noindex
 * appeared" on every indexable page: 60 false CRITICALs against the first
 * baseline, and exit 1 even when staging matches production exactly (review
 * finding, 2026-11-06).
 *
 * So when the check origin is not the baseline's and every page that answered
 * 200 carries a noindex X-Robots-Tag, the most common value is taken to be the
 * host's rule. `compareSnapshots` reports it once and judges each page's own
 * indexability without it: the robots and googlebot metas still count, and so
 * does any X-Robots-Tag value other than the host's. Against the baseline's
 * own origin this never applies; a site-wide noindex on production is exactly
 * what the per-page rule is there to catch. Whether staging SHOULD carry the
 * header is `scripts/verify-indexing.mjs`'s check, not this one.
 */
export const hostWideNoindex = (baseline, current) => {
  if (!baseline.origin || baseline.origin === current.origin) return null;
  const tags = Object.values(current.pages)
    .filter((p) => p.status === 200)
    .map((p) => p.xRobotsTag ?? '');
  if (!tags.length || !tags.every((t) => NOINDEX.test(t))) return null;
  const counts = new Map();
  for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0];
};

/**
 * Compares a fresh snapshot with the baseline and classifies every difference.
 *
 *   CRITICAL  something that costs rankings on its own: a page that answered
 *             200 no longer does, noindex appeared on an indexable page, an
 *             indexable page's canonical now names another URL, a page left
 *             the sitemap, a must-stay-noindex page became indexable or was
 *             listed in the sitemap, the sitemap itself is not served.
 *   WARNING   a change worth a human look: title, description or H1 changed,
 *             schema types removed or JSON-LD stopped parsing, main text down
 *             by more than 30%, a canonical removed, a redirect retargeted.
 *   INFO      expected churn: the main text changed, new URLs, H2 count,
 *             og:image, schema types added; on another host, that host's
 *             blanket noindex header (once; see `hostWideNoindex`).
 */
export const compareSnapshots = (baseline, current) => {
  const findings = [];
  const add = (severity, path, rule, message) => findings.push({ severity, path, rule, message });
  const resolve = (u) => {
    try {
      return new URL(u, `${baseline.origin}/`).href;
    } catch {
      return u;
    }
  };

  const sitemapUsable = current.sitemap.ok && !current.sitemapUnverified;
  if (!current.sitemapUnverified && !current.sitemap.ok) {
    add(
      'CRITICAL',
      '(sitemap)',
      'sitemap-unavailable',
      `the sitemap could not be read: index HTTP ${current.sitemap.status}` +
        `${current.sitemap.children.filter((c) => c.status !== 200).map((c) => `, ${c.url} HTTP ${c.status}`).join('')}` +
        `${current.sitemap.urlCount === 0 ? ', no URLs listed' : ''}`
    );
  }

  const hostTag = hostWideNoindex(baseline, current);
  if (hostTag !== null) {
    add(
      'INFO',
      '(host)',
      'host-noindex',
      `every page on ${current.origin} sends X-Robots-Tag ${show(hostTag)}, expected for a non-production host; ` +
        'each page is judged below without it'
    );
  }

  const paths = [...new Set([...Object.keys(baseline.pages), ...Object.keys(current.pages)])].sort();
  for (const path of paths) {
    const b = baseline.pages[path];
    const read = current.pages[path];
    if (!read) continue; /* unverified this run; listed separately */
    /* the page as it would be without the host's blanket header */
    const c = hostTag !== null && read.xRobotsTag === hostTag ? { ...read, xRobotsTag: null } : read;

    if (!b) {
      if (c.inSitemap) {
        add('INFO', path, 'new-url', `new URL in the sitemap (HTTP ${c.status})`);
        if (!isIndexable(c)) {
          add('WARNING', path, 'new-url-not-indexable', `new sitemap URL is not an indexable 200 (HTTP ${c.status}${isNoindex(c) ? ', noindex' : ''})`);
        }
      }
      continue;
    }

    /* sitemap membership */
    if (sitemapUsable) {
      if (b.inSitemap && !c.inSitemap) add('CRITICAL', path, 'dropped-from-sitemap', 'no longer listed in the sitemap');
      if (b.mustStayNoindex && c.inSitemap) add('CRITICAL', path, 'noindex-page-in-sitemap', 'a must-stay-noindex page is listed in the sitemap');
      if (!b.inSitemap && c.inSitemap && !b.mustStayNoindex) add('INFO', path, 'added-to-sitemap', 'now listed in the sitemap');
    }

    /* status and redirects */
    if (b.status === 200 && c.status !== 200) {
      add('CRITICAL', path, 'status', `HTTP 200 → ${c.status}${c.redirect ? ` → ${c.redirect}` : ''}`);
      continue;
    }
    if (b.status !== 200) {
      if (c.status === 200) add('INFO', path, 'status', `HTTP ${b.status} → 200`);
      else if (c.status !== b.status) add('WARNING', path, 'status', `HTTP ${b.status} → ${c.status}${c.redirect ? ` → ${c.redirect}` : ''}`);
      else if (b.redirect !== c.redirect) add('WARNING', path, 'redirect-target', `redirect ${show(b.redirect)} → ${show(c.redirect)}`);
    }
    if (c.status !== 200) continue;

    /* indexability */
    const wasIndexable = isIndexable(b);
    if (b.mustStayNoindex) {
      if (isIndexable(c)) {
        add('CRITICAL', path, 'must-stay-noindex-indexable', `must stay noindex but is now indexable (robots ${show(c.metaRobots)}, X-Robots-Tag ${show(c.xRobotsTag)})`);
      }
    } else if (wasIndexable && isNoindex(c)) {
      add('CRITICAL', path, 'noindex-appeared', `noindex appeared (robots ${show(c.metaRobots)}, googlebot ${show(c.metaGooglebot)}, X-Robots-Tag ${show(c.xRobotsTag)})`);
    } else if (b.status === 200 && !wasIndexable && isIndexable(c)) {
      add('INFO', path, 'noindex-removed', 'was noindex, is now indexable');
    }
    if (b.status !== 200) continue; /* nothing earlier to compare the content with */

    /* canonical */
    if (b.canonical && c.canonical && resolve(b.canonical) !== resolve(c.canonical)) {
      add(wasIndexable ? 'CRITICAL' : 'WARNING', path, 'canonical-changed', `canonical ${b.canonical} → ${c.canonical}`);
    } else if (b.canonical && !c.canonical) {
      add('WARNING', path, 'canonical-removed', `canonical removed (was ${b.canonical})`);
    } else if (!b.canonical && c.canonical) {
      add('INFO', path, 'canonical-added', `canonical added: ${c.canonical}`);
    }

    /* on-page */
    if (b.title !== c.title) add('WARNING', path, 'title', `title ${show(b.title)} → ${show(c.title)}`);
    if (b.description !== c.description) add('WARNING', path, 'description', `description ${show(b.description)} → ${show(c.description)}`);
    if (!sameList(b.h1, c.h1)) add('WARNING', path, 'h1', `H1 ${show(b.h1)} → ${show(c.h1)}`);

    const removed = (b.schemaTypes ?? []).filter((t) => !(c.schemaTypes ?? []).includes(t));
    const added = (c.schemaTypes ?? []).filter((t) => !(b.schemaTypes ?? []).includes(t));
    if (removed.length) add('WARNING', path, 'schema-removed', `schema types removed: ${removed.join(', ')}`);
    if (added.length) add('INFO', path, 'schema-added', `schema types added: ${added.join(', ')}`);
    if ((c.jsonLdInvalid ?? 0) > (b.jsonLdInvalid ?? 0)) {
      add('WARNING', path, 'json-ld-invalid', `${c.jsonLdInvalid} JSON-LD block(s) no longer parse`);
    }

    if (b.wordCount && c.wordCount !== null && c.wordCount < b.wordCount * 0.7) {
      const pct = Math.round((1 - c.wordCount / b.wordCount) * 100);
      add('WARNING', path, 'word-count', `main text down ${pct}%: ${b.wordCount} → ${c.wordCount} words`);
    } else if (b.wordCount !== null && c.wordCount === null) {
      add('WARNING', path, 'main-missing', 'the <main> landmark is gone');
    }
    if (b.mainHash && c.mainHash && b.mainHash !== c.mainHash) {
      add('INFO', path, 'content', `main text changed (${b.wordCount} → ${c.wordCount} words)`);
    }
    if (b.h2Count !== c.h2Count) add('INFO', path, 'h2-count', `H2 count ${b.h2Count} → ${c.h2Count}`);
    if (b.ogImage !== c.ogImage) add('INFO', path, 'og-image', `og:image ${show(b.ogImage)} → ${show(c.ogImage)}`);
    if (b.xRobotsTag !== c.xRobotsTag && !(wasIndexable && isNoindex(c))) {
      add('INFO', path, 'x-robots-tag', `X-Robots-Tag ${show(b.xRobotsTag)} → ${show(c.xRobotsTag)}`);
    }
  }

  const rank = (s) => SEVERITIES.indexOf(s);
  return findings.sort((x, y) => rank(x.severity) - rank(y.severity) || x.path.localeCompare(y.path) || x.rule.localeCompare(y.rule));
};

/** 1 on any CRITICAL; 3 when nothing is critical but part of the site could not be read; else 0. */
export const exitCode = (findings, current) =>
  findings.some((f) => f.severity === 'CRITICAL')
    ? 1
    : Object.keys(current.unverified ?? {}).length || current.sitemapUnverified
      ? 3
      : 0;

/** The human-readable report. */
export const formatReport = (findings, baseline, current) => {
  const lines = [];
  lines.push(`seo-drift check: ${current.origin}`);
  lines.push(`  baseline  ${baseline.capturedAt} from ${baseline.origin} (${Object.keys(baseline.pages).length} URLs)`);
  lines.push(`  now       ${current.capturedAt} (${Object.keys(current.pages).length} URLs read, sitemap ${current.sitemap.urlCount} URLs)`);
  if (baseline.origin !== current.origin) {
    lines.push(`  note      comparing ${current.origin} with a baseline taken from ${baseline.origin}; pages are matched by path`);
  }
  for (const severity of SEVERITIES) {
    const these = findings.filter((f) => f.severity === severity);
    lines.push('', `${severity} (${these.length})`);
    for (const f of these) lines.push(`  ${f.path}  [${f.rule}] ${f.message}`);
  }
  const unverified = Object.entries(current.unverified ?? {});
  if (unverified.length || current.sitemapUnverified) {
    lines.push('', `UNVERIFIED (${unverified.length + (current.sitemapUnverified ? 1 : 0)}) — not the page; challenged, rate-limited or unreachable, so not compared`);
    if (current.sitemapUnverified) lines.push('  (sitemap)  could not be read; sitemap membership was not compared');
    for (const [path, why] of unverified) lines.push(`  ${path}  ${why}`);
  }
  const count = (s) => findings.filter((f) => f.severity === s).length;
  lines.push('', `${count('CRITICAL')} critical, ${count('WARNING')} warning, ${count('INFO')} info, ${unverified.length} unverified`);
  return `${lines.join('\n')}\n`;
};

/**
 * @vitest-environment node
 *
 * The SEO drift monitor's parsing and classification (`scripts/lib/seo-drift.mjs`).
 *
 * WHY THESE ARE TESTED AND THE FETCHING IS NOT. The monitor is only worth
 * running if a CRITICAL means something broke and silence means nothing did.
 * Both depend on two pure pieces: reading the right value out of a page
 * (attribute order, quoting, entities, a script inside <main>) and putting a
 * difference in the right class. Those are tested here against fixture HTML
 * and hand-built snapshots. `capture` is driven with a fake `fetch` standing
 * in for the site — no request leaves the machine — so the sitemap rewrite,
 * the must-stay-noindex list and the refusal to read a challenge page as the
 * page are covered too. Whether production answers is the script's job.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MUST_STAY_NOINDEX,
  capture,
  compareSnapshots,
  decodeEntities,
  exitCode,
  extractSeo,
  formatReport,
  isChallenge,
  isNoindex,
  pageRecord,
  parseAttributes,
  sitemapLocs,
  stableStringify,
  toBaseline,
  visibleText,
  wordCount,
} from '../../scripts/lib/seo-drift.mjs';

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '../fixtures/seo-drift', name), 'utf8');

describe('parsing helpers', () => {
  it('decodes named and numeric entities and leaves unknown ones alone', () => {
    expect(decodeEntities('A &amp; B &#8211; C &#x2019; &rsquo; &bogus;')).toBe('A & B – C ’ ’ &bogus;');
  });

  it('reads attributes in any order and any quoting', () => {
    expect(parseAttributes(`<meta content='noindex, follow' name=robots data-x="a > b">`)).toEqual({
      content: 'noindex, follow',
      name: 'robots',
      'data-x': 'a > b',
    });
    expect(parseAttributes('<input disabled value="A &amp; B" />')).toEqual({ disabled: '', value: 'A & B' });
  });

  it('keeps the first of a repeated attribute, as a browser does', () => {
    expect(parseAttributes('<meta name="robots" name="googlebot" content="x">').name).toBe('robots');
  });

  it('drops scripts, styles, noscript, svg and comments from visible text, and joins inline tags', () => {
    expect(visibleText('<p>Toron<b>to</b></p><script>var no = 1;</script><p>yes<!-- no --></p>')).toBe('Toronto yes');
  });

  it('counts words that contain a letter or digit, not punctuation', () => {
    /* Same crew every visit since 1989 — six; the dash and the bar are not words. */
    expect(wordCount('Same crew — every visit | since 1989.')).toBe(6);
  });

  it('reads sitemap and sitemap-index <loc>s, decoding &amp;', () => {
    const xml =
      '<urlset><url><loc>https://www.evergreencleaningservice.ca/</loc></url>' +
      '<url><loc> https://www.evergreencleaningservice.ca/a/?x=1&amp;y=2 </loc></url></urlset>';
    expect(sitemapLocs(xml)).toEqual([
      'https://www.evergreencleaningservice.ca/',
      'https://www.evergreencleaningservice.ca/a/?x=1&y=2',
    ]);
  });
});

describe('extractSeo on fixture HTML', () => {
  const page = extractSeo(fixture('service-page.html'));

  it('reads the title with entities decoded and whitespace collapsed', () => {
    expect(page.title).toBe('Office Cleaning in Toronto & the GTA – Evergreen Office Cleaning');
  });

  it('reads the meta description, not the twitter one, whatever the attribute order', () => {
    expect(page.description).toBe('Nightly office cleaning across Toronto & the GTA. Same crew every visit.');
  });

  it('reads robots, canonical and og:image', () => {
    expect(page.metaRobots).toBe('index, follow, max-image-preview:large');
    expect(page.metaGooglebot).toBeNull();
    expect(page.canonical).toBe('https://www.evergreencleaningservice.ca/services/office-cleaning/');
    expect(page.ogImage).toBe('https://img.evergreencleaningservice.ca/images/office-og.jpg');
  });

  it('reads every H1 as text, in order, and counts every H2 on the page', () => {
    expect(page.h1).toEqual(['Office Cleaning in Toronto', 'Second heading']);
    expect(page.h2Count).toBe(4);
  });

  it('lists every JSON-LD @type, nested and @graph ones included, and counts a block that does not parse', () => {
    expect(page.schemaTypes).toEqual([
      'Answer',
      'BreadcrumbList',
      'FAQPage',
      'ListItem',
      'PostalAddress',
      'ProfessionalService',
      'Question',
      'Service',
      'Thing',
    ]);
    expect(page.jsonLdInvalid).toBe(1);
  });

  it('counts only the words of <main>, without its script, style, noscript, svg or comments', () => {
    /* Office Cleaning in Toronto (4) We clean offices after hours the same
       crew every visit (10) What is office cleaning (4) Toronto offices 5
       days a week since 1989 (8) How often (2) Second heading (2) */
    expect(page.wordCount).toBe(30);
    expect(page.mainHash).toMatch(/^sha256:[0-9a-f]{16}$/);
  });

  it('gives the same hash for the same text and a different one when a word changes', () => {
    const html = fixture('service-page.html');
    expect(extractSeo(html).mainHash).toBe(page.mainHash);
    expect(extractSeo(html.replace('after hours', 'before hours')).mainHash).not.toBe(page.mainHash);
    /* Markup-only changes outside the text are not content changes. */
    expect(extractSeo(html.replace('class="site-main"', 'class="site-main wide"')).mainHash).toBe(page.mainHash);
  });

  it('reads an unquoted robots meta, a relative canonical, and no <main> as null rather than zero', () => {
    const thanks = extractSeo(fixture('noindex-page.html'));
    expect(thanks.metaRobots).toBe('noindex, nofollow');
    expect(thanks.canonical).toBe('/thank-you/');
    expect(thanks.wordCount).toBeNull();
    expect(thanks.mainHash).toBeNull();
    expect(thanks.schemaTypes).toEqual([]);
    expect(thanks.ogImage).toBeNull();
  });

  it('returns empty readings for an empty document', () => {
    expect(extractSeo('')).toMatchObject({ title: null, description: null, canonical: null, h1: [], h2Count: 0 });
  });
});

describe('response facts', () => {
  it('records a redirect target resolved against the page URL, and reads no HTML from a non-200', () => {
    const rec = pageRecord({
      status: 301,
      headers: { location: '/new/' },
      body: '<title>Moved</title>',
      url: 'https://www.evergreencleaningservice.ca/old/',
    });
    expect(rec.redirect).toBe('https://www.evergreencleaningservice.ca/new/');
    expect(rec.title).toBeNull();
  });

  it('treats noindex in the meta, a googlebot meta or the header alike', () => {
    expect(isNoindex({ metaRobots: 'follow, noindex' })).toBe(true);
    expect(isNoindex({ metaGooglebot: 'none' })).toBe(true);
    expect(isNoindex({ xRobotsTag: 'noindex' })).toBe(true);
    expect(isNoindex({ metaRobots: 'index, follow', xRobotsTag: null })).toBe(false);
  });

  it('recognises a challenge or a rate limit, and not an ordinary page', () => {
    expect(isChallenge(403, { 'cf-mitigated': 'challenge' }, '')).toBe(true);
    expect(isChallenge(503, {}, '<title>Just a moment...</title>')).toBe(true);
    expect(isChallenge(429, {}, '')).toBe(true);
    expect(isChallenge(200, {}, fixture('service-page.html'))).toBe(false);
    expect(isChallenge(404, {}, 'Not found')).toBe(false);
  });
});

/* --- comparison ----------------------------------------------------------- */

const ORIGIN = 'https://www.evergreencleaningservice.ca';

const page = (over: Record<string, unknown> = {}) => ({
  status: 200,
  redirect: null,
  xRobotsTag: null,
  title: 'Office Cleaning Toronto',
  description: 'Nightly office cleaning.',
  metaRobots: 'index, follow',
  metaGooglebot: null,
  canonical: `${ORIGIN}/services/office-cleaning/`,
  h1: ['Office Cleaning'],
  h2Count: 5,
  schemaTypes: ['BreadcrumbList', 'Service'],
  jsonLdInvalid: 0,
  ogImage: 'https://img.evergreencleaningservice.ca/images/a.jpg',
  wordCount: 1000,
  mainHash: 'sha256:aaaaaaaaaaaaaaaa',
  inSitemap: true,
  mustStayNoindex: false,
  ...over,
});

const noindexPage = (over: Record<string, unknown> = {}) =>
  page({
    metaRobots: 'noindex, nofollow',
    canonical: `${ORIGIN}/thank-you/`,
    inSitemap: false,
    mustStayNoindex: true,
    ...over,
  });

const snapshot = (pages: Record<string, ReturnType<typeof page>>, over: Record<string, unknown> = {}) => ({
  capturedAt: '2026-11-06T20:00:00.000Z',
  origin: ORIGIN,
  sitemap: { index: `${ORIGIN}/sitemap-index.xml`, status: 200, children: [], ok: true, urlCount: Object.keys(pages).length },
  sitemapUnverified: false,
  mustStayNoindex: ['/thank-you/'],
  pages,
  unverified: {},
  ...over,
});

const P = '/services/office-cleaning/';
const T = '/thank-you/';
const base = snapshot({ [P]: page(), [T]: noindexPage() });
const run = (pages: Record<string, ReturnType<typeof page>>, over: Record<string, unknown> = {}) =>
  compareSnapshots(base, snapshot(pages, over));
const rules = (findings: { severity: string; rule: string; path: string }[]) =>
  findings.map((f) => `${f.severity} ${f.path} ${f.rule}`);

describe('compareSnapshots', () => {
  it('reports nothing when nothing changed, and exits 0', () => {
    const findings = run({ [P]: page(), [T]: noindexPage() });
    expect(findings).toEqual([]);
    expect(exitCode(findings, snapshot({}))).toBe(0);
  });

  describe('CRITICAL', () => {
    it('a page that answered 200 now redirects', () => {
      const findings = run({ [P]: page({ status: 301, redirect: `${ORIGIN}/services/` }), [T]: noindexPage() });
      expect(rules(findings)).toEqual([`CRITICAL ${P} status`]);
      expect(findings[0].message).toContain(`HTTP 200 → 301 → ${ORIGIN}/services/`);
      expect(exitCode(findings, snapshot({}))).toBe(1);
    });

    it('noindex appeared on an indexable page, by meta or by header', () => {
      expect(rules(run({ [P]: page({ metaRobots: 'noindex, follow' }), [T]: noindexPage() }))).toEqual([
        `CRITICAL ${P} noindex-appeared`,
      ]);
      expect(rules(run({ [P]: page({ xRobotsTag: 'noindex' }), [T]: noindexPage() }))).toEqual([
        `CRITICAL ${P} noindex-appeared`,
      ]);
    });

    it("an indexable page's canonical now names another URL", () => {
      const findings = run({ [P]: page({ canonical: `${ORIGIN}/services/` }), [T]: noindexPage() });
      expect(rules(findings)).toEqual([`CRITICAL ${P} canonical-changed`]);
    });

    it('but a relative and an absolute spelling of the same canonical is no change', () => {
      expect(run({ [P]: page({ canonical: P }), [T]: noindexPage() })).toEqual([]);
    });

    it('a page dropped out of the sitemap', () => {
      expect(rules(run({ [P]: page({ inSitemap: false }), [T]: noindexPage() }))).toEqual([
        `CRITICAL ${P} dropped-from-sitemap`,
      ]);
    });

    it('a must-stay-noindex page became indexable', () => {
      expect(rules(run({ [P]: page(), [T]: noindexPage({ metaRobots: 'index, follow' }) }))).toEqual([
        `CRITICAL ${T} must-stay-noindex-indexable`,
      ]);
    });

    it('a must-stay-noindex page was listed in the sitemap', () => {
      expect(rules(run({ [P]: page(), [T]: noindexPage({ inSitemap: true }) }))).toEqual([
        `CRITICAL ${T} noindex-page-in-sitemap`,
      ]);
    });

    it('the sitemap is not served, once, instead of every page "dropping out"', () => {
      const findings = run(
        { [P]: page({ inSitemap: false }), [T]: noindexPage() },
        { sitemap: { index: `${ORIGIN}/sitemap-index.xml`, status: 404, children: [], ok: false, urlCount: 0 } }
      );
      expect(rules(findings)).toEqual(['CRITICAL (sitemap) sitemap-unavailable']);
      expect(findings[0].message).toContain('HTTP 404');
    });
  });

  describe('WARNING', () => {
    it('title, description and H1 changed', () => {
      const findings = run({
        [P]: page({ title: 'Office Cleaning', description: 'Other.', h1: ['Office Cleaning', 'Two'] }),
        [T]: noindexPage(),
      });
      expect(rules(findings)).toEqual([`WARNING ${P} description`, `WARNING ${P} h1`, `WARNING ${P} title`]);
      expect(findings.find((f) => f.rule === 'title')!.message).toBe(
        'title "Office Cleaning Toronto" → "Office Cleaning"'
      );
    });

    it('schema types removed (and an added one is only INFO)', () => {
      const findings = run({ [P]: page({ schemaTypes: ['BreadcrumbList', 'FAQPage'] }), [T]: noindexPage() });
      expect(rules(findings)).toEqual([`WARNING ${P} schema-removed`, `INFO ${P} schema-added`]);
      expect(findings[0].message).toBe('schema types removed: Service');
    });

    it('a JSON-LD block that stops parsing', () => {
      expect(rules(run({ [P]: page({ jsonLdInvalid: 1 }), [T]: noindexPage() }))).toEqual([
        `WARNING ${P} json-ld-invalid`,
      ]);
    });

    it('word count down more than 30%, but not exactly 30%', () => {
      const down31 = run({ [P]: page({ wordCount: 690, mainHash: 'sha256:bbbbbbbbbbbbbbbb' }), [T]: noindexPage() });
      expect(rules(down31)).toEqual([`WARNING ${P} word-count`, `INFO ${P} content`]);
      expect(down31[0].message).toBe('main text down 31%: 1000 → 690 words');

      const down30 = run({ [P]: page({ wordCount: 700, mainHash: 'sha256:bbbbbbbbbbbbbbbb' }), [T]: noindexPage() });
      expect(rules(down30)).toEqual([`INFO ${P} content`]);
    });

    it('a canonical that disappeared, rather than moved', () => {
      expect(rules(run({ [P]: page({ canonical: null }), [T]: noindexPage() }))).toEqual([
        `WARNING ${P} canonical-removed`,
      ]);
    });

    it('a canonical change on a noindex page is a warning, not a critical', () => {
      expect(rules(run({ [P]: page(), [T]: noindexPage({ canonical: `${ORIGIN}/` }) }))).toEqual([
        `WARNING ${T} canonical-changed`,
      ]);
    });

    it('a new sitemap URL that is not an indexable 200', () => {
      const findings = run({ [P]: page(), [T]: noindexPage(), '/new/': page({ status: 404 }) });
      expect(rules(findings)).toEqual(['WARNING /new/ new-url-not-indexable', 'INFO /new/ new-url']);
    });
  });

  describe('INFO', () => {
    it('the content hash changed with the word count steady', () => {
      expect(rules(run({ [P]: page({ mainHash: 'sha256:cccccccccccccccc' }), [T]: noindexPage() }))).toEqual([
        `INFO ${P} content`,
      ]);
    });

    it('a new URL in the sitemap', () => {
      const findings = run({ [P]: page(), [T]: noindexPage(), '/locations/oakville/': page() });
      expect(rules(findings)).toEqual(['INFO /locations/oakville/ new-url']);
      expect(exitCode(findings, snapshot({}))).toBe(0);
    });

    it('H2 count and og:image', () => {
      expect(rules(run({ [P]: page({ h2Count: 6, ogImage: null }), [T]: noindexPage() }))).toEqual([
        `INFO ${P} h2-count`,
        `INFO ${P} og-image`,
      ]);
    });
  });

  it('sorts CRITICAL before WARNING before INFO, then by path', () => {
    const findings = run({
      [P]: page({ title: 'x', mainHash: 'sha256:dddddddddddddddd' }),
      [T]: noindexPage({ metaRobots: 'index' }),
      '/a/': page(),
    });
    expect(findings.map((f) => f.severity)).toEqual(['CRITICAL', 'WARNING', 'INFO', 'INFO']);
    expect(findings.slice(2).map((f) => f.path)).toEqual(['/a/', P]);
  });

  it('does not compare a page it could not read, and says the run is incomplete (exit 3)', () => {
    const current = snapshot({ [T]: noindexPage() }, { unverified: { [P]: 'HTTP 403 (cf-mitigated)' } });
    const findings = compareSnapshots(base, current);
    expect(findings).toEqual([]);
    expect(exitCode(findings, current)).toBe(3);
    const report = formatReport(findings, base, current);
    expect(report).toContain('UNVERIFIED (1)');
    expect(report).toContain(`${P}  HTTP 403 (cf-mitigated)`);
  });

  it('does not report sitemap drops when the sitemap itself was challenged', () => {
    const current = snapshot(
      { [P]: page({ inSitemap: false }), [T]: noindexPage() },
      { sitemapUnverified: true, sitemap: { index: '', status: 403, children: [], ok: false, urlCount: 0 } }
    );
    const findings = compareSnapshots(base, current);
    expect(findings).toEqual([]);
    expect(exitCode(findings, current)).toBe(3);
  });

  it('prints a report with every section and a summary line', () => {
    const current = snapshot({ [P]: page({ status: 404 }), [T]: noindexPage(), '/b/': page() });
    const report = formatReport(compareSnapshots(base, current), base, current);
    expect(report).toContain('CRITICAL (1)\n  /services/office-cleaning/  [status] HTTP 200 → 404');
    expect(report).toContain('WARNING (0)');
    expect(report).toContain('INFO (1)\n  /b/  [new-url] new URL in the sitemap (HTTP 200)');
    expect(report).toMatch(/1 critical, 0 warning, 1 info, 0 unverified\n$/);
  });
});

/* --- capture, against a fake site ------------------------------------------ */

const STAGE = 'https://stage.example.test';

/** A tiny site: two sitemap pages, a redirect, the must-stay-noindex pages. */
const fakeSite = (routes: Record<string, { status?: number; headers?: Record<string, string>; body?: string }>) => {
  const requested: { url: string; ua: string | null; redirect: string | undefined }[] = [];
  const fetchImpl = async (url: string, init: RequestInit) => {
    requested.push({ url, ua: new Headers(init.headers).get('user-agent'), redirect: init.redirect });
    const route = routes[new URL(url).pathname] ?? { status: 404, body: 'Not found' };
    return new Response(route.body ?? '', {
      status: route.status ?? 200,
      headers: { 'content-type': 'text/html', ...route.headers },
    });
  };
  return { fetchImpl, requested };
};

const routes = {
  '/sitemap-index.xml': {
    headers: { 'content-type': 'application/xml' },
    body: `<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-pages-0.xml</loc></sitemap></sitemapindex>`,
  },
  '/sitemap-pages-0.xml': {
    headers: { 'content-type': 'application/xml' },
    body: `<urlset><url><loc>${ORIGIN}${P}</loc></url><url><loc>${ORIGIN}/old/</loc></url></urlset>`,
  },
  [P]: { body: fixture('service-page.html') },
  '/old/': { status: 301, headers: { location: '/services/' } },
  '/thank-you/': { body: fixture('noindex-page.html') },
  '/search/': { body: fixture('noindex-page.html') },
  '/lp/commercial-cleaning/': { body: fixture('noindex-page.html') },
  '/tag/cleaning/': { status: 403, headers: { 'cf-mitigated': 'challenge' }, body: 'Just a moment...' },
};

describe('capture', () => {
  it('reads the sitemap on the target origin, every page once, with the monitor User-Agent and no redirect following', async () => {
    const { fetchImpl, requested } = fakeSite(routes);
    const snap = await capture({
      origin: `${STAGE}/`,
      fetchImpl,
      delayMs: 0,
      now: () => new Date('2026-11-06T20:00:00Z'),
    });

    /* The sitemap names production URLs; they are read from the target. */
    expect(requested.every((r) => r.url.startsWith(STAGE))).toBe(true);
    expect(requested.every((r) => r.redirect === 'manual')).toBe(true);
    expect(requested.every((r) => /EvergreenSEODriftMonitor/.test(r.ua ?? ''))).toBe(true);
    expect(new Set(requested.map((r) => r.url)).size).toBe(requested.length);

    expect(snap.origin).toBe(STAGE);
    expect(snap.capturedAt).toBe('2026-11-06T20:00:00.000Z');
    expect(snap.sitemap).toMatchObject({ ok: true, urlCount: 2 });
    expect(Object.keys(snap.pages)).toEqual(['/lp/commercial-cleaning/', '/old/', '/search/', P, '/thank-you/']);
    expect(snap.pages[P]).toMatchObject({ status: 200, inSitemap: true, mustStayNoindex: false, wordCount: 30 });
    expect(snap.pages['/old/']).toMatchObject({ status: 301, redirect: `${STAGE}/services/`, inSitemap: true });
    expect(snap.pages['/thank-you/']).toMatchObject({ inSitemap: false, mustStayNoindex: true });

    /* The challenged page is not recorded as a page. */
    expect(snap.pages['/tag/cleaning/']).toBeUndefined();
    expect(snap.unverified['/tag/cleaning/']).toContain('403');
  });

  it('checks the must-stay-noindex list it is given, and the fixed list covers the four the audit names', async () => {
    expect(MUST_STAY_NOINDEX).toEqual(['/thank-you/', '/search/', '/lp/commercial-cleaning/', '/tag/cleaning/']);
    const { fetchImpl, requested } = fakeSite(routes);
    await capture({ origin: STAGE, fetchImpl, delayMs: 0, mustStayNoindex: ['/thank-you/'], extraPaths: ['/gone/'] });
    const paths = requested.map((r) => new URL(r.url).pathname);
    expect(paths).toContain('/gone/');
    expect(paths).not.toContain('/search/');
  });

  it('waits between requests', async () => {
    const { fetchImpl } = fakeSite(routes);
    const started = Date.now();
    await capture({ origin: STAGE, fetchImpl, delayMs: 25, mustStayNoindex: [] });
    /* sitemap index, one child sitemap, two pages: three gaps of 25 ms */
    expect(Date.now() - started).toBeGreaterThanOrEqual(70);
  });

  it('records a network failure as unverified, not as a broken page', async () => {
    const snap = await capture({
      origin: STAGE,
      delayMs: 0,
      mustStayNoindex: ['/thank-you/'],
      fetchImpl: async () => {
        throw new Error('getaddrinfo ENOTFOUND');
      },
    });
    expect(snap.sitemapUnverified).toBe(true);
    expect(snap.pages).toEqual({});
    expect(snap.unverified['/thank-you/']).toContain('ENOTFOUND');
  });

  it('round-trips through the baseline file: sorted keys, stable text, run-only fields dropped', async () => {
    const { fetchImpl } = fakeSite({ ...routes, '/tag/cleaning/': { body: fixture('noindex-page.html') } });
    const snap = await capture({ origin: STAGE, fetchImpl, delayMs: 0, now: () => new Date('2026-11-06T20:00:00Z') });
    const text = stableStringify(toBaseline(snap));
    const parsed = JSON.parse(text);

    expect(text).toBe(stableStringify(JSON.parse(text)));
    expect(text.endsWith('}\n')).toBe(true);
    expect(Object.keys(parsed)).toEqual([...Object.keys(parsed)].sort());
    expect(Object.keys(parsed.pages[P])).toEqual([...Object.keys(parsed.pages[P])].sort());
    expect(parsed.unverified).toBeUndefined();
    expect(parsed.tool).toBe('scripts/seo-drift.mjs');

    /* The same site read again is no drift at all. */
    const again = await capture({ origin: STAGE, fetchImpl, delayMs: 0, extraPaths: Object.keys(parsed.pages) });
    expect(compareSnapshots(parsed, again)).toEqual([]);
  });
});

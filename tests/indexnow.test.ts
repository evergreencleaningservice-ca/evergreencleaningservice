/**
 * @vitest-environment node
 *
 * IndexNow on deploy (SEO audit ACTION-PLAN item 28, 2026-11-06).
 *
 * What is proven here: which sitemap URLs a deploy submits, the JSON body it
 * sends, that no failure of the engine or the network can fail a deploy, and
 * that the key file the engines fetch to verify a submission is in public/,
 * holds exactly the key, and is served by the asset layer rather than the
 * Worker. The command itself is run as a child process (as
 * tests/build/gates.test.ts does for the build gates), but only with
 * --dry-run or with nothing to send: no test reaches api.indexnow.org. Every
 * real POST goes to a stub `fetch`.
 *
 * tests/build/indexability.test.ts adds the half that needs a build: the key
 * file in the emitted dist/, and a dry run over the real sitemaps.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INDEXNOW_ENDPOINT, INDEXNOW_KEY } from '../src/data/indexnow';
import { PREVIEW_HOST, site } from '../src/data/site';
import { parseHeaders } from '../src/lib/noindex-rules';
import {
  MAX_URLS,
  SITEMAPS,
  buildPayload,
  parseArgs,
  parseSitemap,
  run,
  selectUrls,
  submit,
} from '../scripts/lib/indexnow.mjs';

const repo = path.resolve(import.meta.dirname, '..');
const HOST = new URL(site.url).host;
const ORIGIN = `https://${HOST}`;
const NOW = new Date('2026-11-06T15:05:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

/** A sitemap in the shape @astrojs/sitemap writes: one line, no whitespace. */
const sitemap = (urls: { loc: string; lastmod?: string }[]) =>
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('') +
  '</urlset>';

const PAGES = sitemap([
  { loc: `${ORIGIN}/`, lastmod: daysAgo(0.1) },
  { loc: `${ORIGIN}/about-us/`, lastmod: daysAgo(2) },
  { loc: `${ORIGIN}/contact-us/`, lastmod: daysAgo(10) },
  { loc: `${ORIGIN}/services/` }, // no lastmod: a shallow clone left it out
]);
const INSIGHTS = sitemap([
  { loc: `${ORIGIN}/insights/`, lastmod: daysAgo(1) },
  { loc: `${ORIGIN}/an-old-post/`, lastmod: '2020-11-30T00:00:00.000Z' },
]);
const FILES: Record<string, string> = {
  'dist/sitemap-pages-0.xml': PAGES,
  'dist/sitemap-insights-0.xml': INSIGHTS,
};
const readFixture = (file: string) => {
  if (!(file in FILES)) throw Object.assign(new Error(`ENOENT: ${file}`), { code: 'ENOENT' });
  return FILES[file];
};

const okResponse = (status = 200) => new Response(null, { status });

function deps(overrides: Partial<Parameters<typeof run>[0]> = {}) {
  const lines: string[] = [];
  const fetch = vi.fn(async () => okResponse());
  return {
    lines,
    fetch,
    args: {
      argv: [],
      host: HOST,
      key: INDEXNOW_KEY,
      endpoint: INDEXNOW_ENDPOINT,
      readFile: readFixture,
      fetch: fetch as unknown as typeof globalThis.fetch,
      now: NOW,
      log: (line: string) => lines.push(line),
      ...overrides,
    },
  };
}

describe('the key', () => {
  const keyFile = path.join(repo, 'public', `${INDEXNOW_KEY}.txt`);

  it('is 32 lower-case hex characters, inside what IndexNow accepts', () => {
    expect(INDEXNOW_KEY).toMatch(/^[0-9a-f]{32}$/);
  });

  it('is in public/<key>.txt, holding the key and nothing else', () => {
    /* The engine compares the file's contents with the key it was sent. A
       trailing newline is tolerated by Bing, but nothing obliges every
       engine to trim, so there is none. */
    expect(fs.readFileSync(keyFile, 'utf8')).toBe(INDEXNOW_KEY);
  });

  it('has no stale key file beside it', () => {
    /* A key file left over from a rotation still verifies submissions made
       with the old key; it should go when the key changes. */
    const keyLike = fs.readdirSync(path.join(repo, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
    expect(keyLike).toEqual([`${INDEXNOW_KEY}.txt`]);
  });

  it('is served by the asset layer: no run_worker_first path reaches it', () => {
    const config = fs.readFileSync(path.join(repo, 'wrangler.jsonc'), 'utf8');
    const block = config.match(/"run_worker_first"\s*:\s*\[([\s\S]*?)\]/)?.[1];
    expect(block).toBeTruthy();
    const patterns = [...block!.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(patterns).toContain('/api/*'); // the parse found the real list
    const matches = (pattern: string, p: string) =>
      new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`).test(p);
    expect(patterns.filter((p) => matches(p, `/${INDEXNOW_KEY}.txt`))).toEqual([]);
  });

  it('gets no _headers rule of its own, and no robots header on production', () => {
    /* Only the sitewide security headers apply. A noindex on www. would not
       stop verification, but nothing should be attached to the file that
       could make it anything other than plain text. */
    const rules = parseHeaders(fs.readFileSync(path.join(repo, 'public', '_headers'), 'utf8'));
    expect(rules.filter((r) => r.url.includes(INDEXNOW_KEY))).toEqual([]);
    const pathOnly = rules.filter((r) => r.url.startsWith('/'));
    for (const rule of pathOnly) expect(rule.headers['x-robots-tag']).toBeUndefined();
    expect(pathOnly.filter((r) => r.url === '/*' && r.headers['content-type'])).toEqual([]);
  });
});

describe('the deploy scripts', () => {
  const scripts = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).scripts;

  it('the production deploy submits last, after the purge', () => {
    /* After the purge so an engine fetching a URL at once gets the new page,
       not the edge's cached copy of the old one. */
    expect(scripts.deploy).toMatch(/&& wrangler deploy && npm run purge && npm run indexnow$/);
    expect(scripts.indexnow).toBe('node --experimental-strip-types scripts/indexnow.mjs');
  });

  it('the staging deploy never submits', () => {
    expect(scripts['deploy:preview']).not.toMatch(/indexnow/);
  });
});

describe('parseSitemap', () => {
  it('reads every <url>, with its lastmod when it has one', () => {
    expect(parseSitemap(PAGES)).toEqual([
      { loc: `${ORIGIN}/`, lastmod: daysAgo(0.1) },
      { loc: `${ORIGIN}/about-us/`, lastmod: daysAgo(2) },
      { loc: `${ORIGIN}/contact-us/`, lastmod: daysAgo(10) },
      { loc: `${ORIGIN}/services/` },
    ]);
  });

  it('unescapes XML entities in the address and tolerates whitespace', () => {
    const xml = `<urlset>\n  <url>\n    <loc> ${ORIGIN}/a/?x=1&amp;y=2 </loc>\n    <lastmod>2026-11-05</lastmod>\n  </url>\n</urlset>`;
    expect(parseSitemap(xml)).toEqual([{ loc: `${ORIGIN}/a/?x=1&y=2`, lastmod: '2026-11-05' }]);
  });

  it('skips a <url> with no <loc>, and reads nothing from an empty set', () => {
    expect(parseSitemap('<urlset><url><lastmod>2026-11-05</lastmod></url></urlset>')).toEqual([]);
    expect(parseSitemap('<urlset></urlset>')).toEqual([]);
  });
});

describe('selectUrls', () => {
  const entries = [...parseSitemap(PAGES), ...parseSitemap(INSIGHTS)];

  it('takes only URLs whose lastmod is after the cutoff, newest first', () => {
    expect(selectUrls(entries, { host: HOST, since: new Date(daysAgo(3)) })).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/insights/`,
      `${ORIGIN}/about-us/`,
    ]);
  });

  it('treats the cutoff as exclusive', () => {
    const at = daysAgo(2);
    expect(selectUrls([{ loc: `${ORIGIN}/x/`, lastmod: at }], { host: HOST, since: new Date(at) })).toEqual([]);
  });

  it('leaves out a URL with no lastmod, or an unreadable one, unless every URL is asked for', () => {
    const odd = [
      { loc: `${ORIGIN}/services/` },
      { loc: `${ORIGIN}/bad-date/`, lastmod: 'yesterday-ish' },
    ];
    expect(selectUrls(odd, { host: HOST, since: new Date(0) })).toEqual([]);
    expect(selectUrls(odd, { host: HOST, all: true })).toEqual([`${ORIGIN}/bad-date/`, `${ORIGIN}/services/`]);
  });

  it('with all, sends every URL whatever its date', () => {
    expect(selectUrls(entries, { host: HOST, all: true })).toHaveLength(6);
  });

  it('drops any URL not on the submitted host, since one would sink the batch', () => {
    const recent = daysAgo(0.5);
    const mixed = [
      { loc: `${ORIGIN}/ok/`, lastmod: recent },
      { loc: `https://evergreencleaningservice.ca/apex/`, lastmod: recent },
      { loc: `https://${PREVIEW_HOST}/staging/`, lastmod: recent },
      { loc: `http://${HOST}/plain-http/`, lastmod: recent },
      { loc: 'not a url', lastmod: recent },
    ];
    expect(selectUrls(mixed, { host: HOST, all: true })).toEqual([`${ORIGIN}/ok/`]);
  });

  it('lists a URL once even if both sitemaps carry it', () => {
    const twice = [
      { loc: `${ORIGIN}/insights/`, lastmod: daysAgo(2) },
      { loc: `${ORIGIN}/insights/`, lastmod: daysAgo(1) },
    ];
    expect(selectUrls(twice, { host: HOST, since: new Date(daysAgo(3)) })).toEqual([`${ORIGIN}/insights/`]);
  });

  it('refuses to guess a cutoff', () => {
    expect(() => selectUrls(entries, { host: HOST })).toThrow(/cutoff/);
  });
});

describe('parseArgs', () => {
  it('defaults to the last three days, for real, from dist/', () => {
    expect(parseArgs([])).toEqual({ all: false, days: 3, dryRun: false, dist: 'dist' });
  });

  it('reads --days in both spellings, --all, --dry-run and --dist', () => {
    expect(parseArgs(['--days', '14']).days).toBe(14);
    expect(parseArgs(['--days=0.5']).days).toBe(0.5);
    expect(parseArgs(['--all', '--dry-run', '--dist', 'out']).all).toBe(true);
    expect(parseArgs(['--dry-run']).dryRun).toBe(true);
    expect(parseArgs(['--dist=build/']).dist).toBe('build/');
  });

  it('refuses a missing, zero, negative or non-numeric --days, and anything unknown', () => {
    for (const bad of [['--days'], ['--days='], ['--days', '0'], ['--days', '-2'], ['--days', 'abc'], ['--days', '3d']]) {
      expect(() => parseArgs(bad), bad.join(' ')).toThrow(/--days/);
    }
    expect(() => parseArgs(['--force'])).toThrow(/unknown argument/);
  });
});

describe('buildPayload', () => {
  it('is the body IndexNow documents: host, key, keyLocation and urlList', () => {
    const urls = [`${ORIGIN}/`, `${ORIGIN}/about-us/`];
    expect(buildPayload({ host: HOST, key: INDEXNOW_KEY, urls })).toEqual({
      host: 'www.evergreencleaningservice.ca',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.evergreencleaningservice.ca/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    });
  });

  it('never sends more than 10,000 URLs in one request', () => {
    const urls = Array.from({ length: MAX_URLS + 5 }, (_, i) => `${ORIGIN}/p${i}/`);
    const payload = buildPayload({ host: HOST, key: INDEXNOW_KEY, urls });
    expect(MAX_URLS).toBe(10_000);
    expect(payload.urlList).toHaveLength(MAX_URLS);
    expect(payload.urlList[0]).toBe(`${ORIGIN}/p0/`);
  });
});

describe('submit', () => {
  const payload = buildPayload({ host: HOST, key: INDEXNOW_KEY, urls: [`${ORIGIN}/`] });

  it('POSTs the payload as JSON to the endpoint', async () => {
    const fetch = vi.fn(async () => okResponse(200));
    const result = await submit(payload, { endpoint: INDEXNOW_ENDPOINT, fetch: fetch as never });
    expect(result).toMatchObject({ ok: true, status: 200 });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.indexnow.org/indexnow');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toMatch(/^application\/json/);
    expect(JSON.parse(init.body as string)).toEqual(payload);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('counts 202 (key still being checked) as accepted', async () => {
    const result = await submit(payload, { endpoint: INDEXNOW_ENDPOINT, fetch: (async () => okResponse(202)) as never });
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/202.*key/);
  });

  it('reports a non-2xx with its meaning and body, without throwing', async () => {
    const fetch = async () => new Response('Key not valid', { status: 403 });
    const result = await submit(payload, { endpoint: INDEXNOW_ENDPOINT, fetch: fetch as never });
    expect(result).toMatchObject({ ok: false, status: 403 });
    expect(result.message).toMatch(/403.*key file.*Key not valid/);
  });

  it('reports a network failure or a timeout without throwing', async () => {
    const down = async () => {
      throw new TypeError('fetch failed');
    };
    await expect(submit(payload, { endpoint: INDEXNOW_ENDPOINT, fetch: down as never })).resolves.toEqual({
      ok: false,
      message: 'request failed: fetch failed',
    });
    const timeout = async () => {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    };
    const result = await submit(payload, { endpoint: INDEXNOW_ENDPOINT, fetch: timeout as never });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/timeout/);
  });
});

describe('run', () => {
  it('submits the recently changed URLs from both sitemaps in one request', async () => {
    const { args, fetch, lines } = deps();
    const result = await run(args);
    expect(result.outcome).toBe('submitted');
    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.urlList).toEqual([`${ORIGIN}/`, `${ORIGIN}/insights/`, `${ORIGIN}/about-us/`]);
    expect(body.host).toBe(HOST);
    expect(lines.at(-1)).toMatch(/submitted 3 URLs/);
  });

  it('--days widens the window and --all sends everything', async () => {
    const wide = deps({ argv: ['--days', '30'] });
    expect((await run(wide.args)).urls).toHaveLength(4);
    const all = deps({ argv: ['--all'] });
    expect((await run(all.args)).urls).toHaveLength(6);
  });

  it('--dry-run prints the payload and sends nothing', async () => {
    const { args, fetch, lines } = deps({ argv: ['--dry-run'] });
    const result = await run(args);
    expect(result.outcome).toBe('dry-run');
    expect(fetch).not.toHaveBeenCalled();
    expect(JSON.parse(lines.at(-1)!)).toEqual(result.payload);
  });

  it('sends nothing when nothing changed in the window', async () => {
    const { args, fetch, lines } = deps({ now: new Date('2027-06-01T00:00:00Z') });
    expect((await run(args)).outcome).toBe('nothing');
    expect(fetch).not.toHaveBeenCalled();
    expect(lines.at(-1)).toMatch(/nothing to submit/);
  });

  it('a refused submission or a dead network is logged, not thrown', async () => {
    const refused = deps({ fetch: (async () => new Response('', { status: 429 })) as never });
    expect((await run(refused.args)).outcome).toBe('failed');
    expect(refused.lines.at(-1)).toMatch(/429.*Not failing the deploy/);

    const down = deps({
      fetch: (async () => {
        throw new Error('getaddrinfo ENOTFOUND api.indexnow.org');
      }) as never,
    });
    expect((await run(down.args)).outcome).toBe('failed');
    expect(down.lines.at(-1)).toMatch(/ENOTFOUND.*Not failing the deploy/);
  });

  it('carries on with one sitemap if the other is missing', async () => {
    const { args } = deps({
      readFile: (file: string) => {
        if (file.endsWith('sitemap-insights-0.xml')) throw new Error('ENOENT');
        return readFixture(file);
      },
    });
    const result = await run(args);
    expect(result.urls).toEqual([`${ORIGIN}/`, `${ORIGIN}/about-us/`]);
  });

  it('with no build, or a bad argument, sends nothing and still returns', async () => {
    const noBuild = deps({ readFile: () => { throw new Error('ENOENT'); } });
    expect((await run(noBuild.args)).outcome).toBe('error');
    expect(noBuild.fetch).not.toHaveBeenCalled();
    expect(noBuild.lines.at(-1)).toMatch(/no sitemap in dist\//);

    const badArg = deps({ argv: ['--days', 'soon'] });
    expect((await run(badArg.args)).outcome).toBe('error');
    expect(badArg.fetch).not.toHaveBeenCalled();
  });

  it('reads the sitemaps the build actually names', () => {
    expect(SITEMAPS).toEqual(['sitemap-pages-0.xml', 'sitemap-insights-0.xml']);
  });
});

describe('npm run indexnow, as the deploy runs it', () => {
  const temps: string[] = [];
  afterEach(() => {
    for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  /* Real node, real argv, the real imports of src/data/*.ts under
     --experimental-strip-types: an import that only Vite can resolve would
     crash the command on deploy and pass every test above. Only --dry-run and
     runs with nothing to send, so nothing leaves this machine. */
  const cli = (args: string[], cwd = repo) => {
    const result = spawnSync('node', ['--experimental-strip-types', path.join(repo, 'scripts/indexnow.mjs'), ...args], {
      cwd,
      encoding: 'utf8',
    });
    return { code: result.status, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
  };

  it('--dry-run prints the payload for a build and exits 0', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecs-indexnow-'));
    temps.push(dir);
    fs.mkdirSync(path.join(dir, 'dist'));
    const recent = new Date(Date.now() - 3_600_000).toISOString();
    fs.writeFileSync(
      path.join(dir, 'dist', 'sitemap-pages-0.xml'),
      sitemap([{ loc: `${ORIGIN}/`, lastmod: recent }, { loc: `${ORIGIN}/old/`, lastmod: '2020-01-01T00:00:00.000Z' }]),
    );
    const { code, out } = cli(['--dry-run'], dir);
    expect(code).toBe(0);
    expect(out).toContain('dry run, 1 URL with a lastmod after');
    const json = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
    expect(json).toEqual({
      host: 'www.evergreencleaningservice.ca',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.evergreencleaningservice.ca/${INDEXNOW_KEY}.txt`,
      urlList: [`${ORIGIN}/`],
    });
  });

  it('exits 0 with no build and with a bad argument', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecs-indexnow-'));
    temps.push(dir);
    const noBuild = cli([], dir);
    expect(noBuild.code).toBe(0);
    expect(noBuild.out).toMatch(/no sitemap in dist\//);
    const bad = cli(['--days', 'abc'], dir);
    expect(bad.code).toBe(0);
    expect(bad.out).toMatch(/--days must be a positive number/);
  });
});

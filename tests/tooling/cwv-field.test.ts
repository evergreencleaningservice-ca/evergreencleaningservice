/**
 * @vitest-environment node
 *
 * The field Core Web Vitals report (`npm run cwv:field`, ACTION-PLAN item 26).
 *
 * WHY THESE TESTS. The report's job is to say whether real visitors get a
 * good LCP, INP and CLS, and the ways it can be quietly wrong are all in the
 * plumbing rather than the arithmetic most people would check: microseconds
 * read as milliseconds, a -1 "not reported" counted as a very fast page, a
 * 1-in-10 sampled week counted as a tenth of the traffic, a busy window cut
 * off at the row limit, a bot run blended into the human p75, a grouped count
 * that is already scaled being scaled again. Each of those has a test below.
 *
 * NO NETWORK. Every request goes through a fake `fetch` answering from the
 * fixtures in `tests/fixtures/cwv-field/`, and the real global `fetch` is
 * replaced with one that fails the test if anything reaches it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCOUNT,
  CwvApiError,
  CwvUsageError,
  ENDPOINT,
  HOST,
  MAX_CHUNK_MS,
  buildQuery,
  buildReport,
  chunkWindow,
  classify,
  extractChunk,
  fetchEvents,
  formatText,
  main,
  normaliseEvent,
  p75Interval,
  parseArgs,
  summarise,
  weightedQuantile,
} from '../../scripts/lib/cwv-field.mjs';

const FIXTURES = path.resolve(__dirname, '../fixtures/cwv-field');
const read = (name: string) => fs.readFileSync(path.join(FIXTURES, name), 'utf8');
const WEEK = read('week.json');
const WEEK_EVENTS = JSON.parse(WEEK).data.viewer.accounts[0].events;
const AUTH_ERROR = read('auth-error.json');

const TOKEN = 'test-token-0123456789abcdef';
const NOW = Date.parse('2026-11-06T19:40:00Z');
const T = (s: string) => Date.parse(s);

beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('a test reached the real network');
  });
});

/** A fake fetch that records each request and answers with `respond`. */
function fakeFetch(respond: (vars: any, call: number) => { status?: number; body: string }) {
  const calls: { url: string; init: any; vars: any }[] = [];
  const impl = async (url: string, init: any) => {
    const { variables } = JSON.parse(init.body);
    calls.push({ url, init, vars: variables });
    const { status = 200, body } = respond(variables, calls.length);
    return { status, text: async () => body };
  };
  return { impl, calls };
}

/** A response holding the given rows, with a consistent grouped count. */
function responseWith(events: any[], extra: Record<string, unknown> = {}) {
  const total = events.reduce((a, e) => a + e.sampleInterval, 0);
  return JSON.stringify({
    data: {
      viewer: {
        accounts: [{ events, vitalsTotal: [{ count: total }], pageloads: [{ count: total * 2, sum: { visits: total } }], ...extra }],
      },
    },
    errors: null,
  });
}

const row = (over: Record<string, unknown> = {}) => ({
  datetime: '2026-11-03T12:00:00Z',
  sampleInterval: 1,
  bot: 0,
  deviceType: 'desktop',
  requestPath: '/',
  largestContentfulPaint: 1_000_000,
  interactionToNextPaint: 50_000,
  cumulativeLayoutShift: 0,
  ...over,
});

/* ------------------------------------------------------------------------ */

describe("Google's thresholds", () => {
  it('puts each boundary value in the band Google does: at the "good" limit is good', () => {
    expect(classify('LCP', 2500)).toBe('good');
    expect(classify('LCP', 2501)).toBe('needs-improvement');
    expect(classify('LCP', 4000)).toBe('needs-improvement');
    expect(classify('LCP', 4001)).toBe('poor');
    expect(classify('INP', 200)).toBe('good');
    expect(classify('INP', 201)).toBe('needs-improvement');
    expect(classify('INP', 500)).toBe('needs-improvement');
    expect(classify('INP', 501)).toBe('poor');
    expect(classify('CLS', 0.1)).toBe('good');
    expect(classify('CLS', 0.11)).toBe('needs-improvement');
    expect(classify('CLS', 0.25)).toBe('needs-improvement');
    expect(classify('CLS', 0.26)).toBe('poor');
  });

  it('has no rating for a metric with no data', () => {
    expect(classify('LCP', null)).toBeNull();
  });
});

describe('reading a beacon row', () => {
  it('converts LCP and INP from microseconds to milliseconds and leaves CLS alone', () => {
    const r = normaliseEvent(row({ largestContentfulPaint: 2_345_000, interactionToNextPaint: 72_000, cumulativeLayoutShift: 0.038 }));
    expect(r.LCP).toBe(2345);
    expect(r.INP).toBe(72);
    expect(r.CLS).toBe(0.038);
  });

  it('treats -1 as "not reported" and 0 as a real value', () => {
    const r = normaliseEvent(row({ largestContentfulPaint: -1, interactionToNextPaint: 0, cumulativeLayoutShift: 0 }));
    expect(r.LCP).toBeNull();
    expect(r.INP).toBe(0);
    expect(r.CLS).toBe(0);
  });

  it('carries the sample interval as the weight and the bot flag', () => {
    const r = normaliseEvent(row({ sampleInterval: 10, bot: 1 }));
    expect(r.weight).toBe(10);
    expect(r.bot).toBe(true);
  });
});

describe('weighted p75', () => {
  it('is the nearest-rank p75 when every weight is 1', () => {
    expect(weightedQuantile([[1, 1], [2, 1], [3, 1], [4, 1]])).toBe(3);
    expect(weightedQuantile([[5, 1], [1, 1], [3, 1], [2, 1], [4, 1]])).toBe(4);
  });

  it('lets one sampled row stand for ten', () => {
    /* Three fast unsampled views and one slow view sampled at 1-in-10: the
       slow one is really ten page views out of thirteen. */
    expect(weightedQuantile([[100, 1], [100, 1], [100, 1], [5000, 10]])).toBe(5000);
    expect(weightedQuantile([[100, 1], [100, 1], [100, 1], [5000, 1]])).toBe(100);
  });

  it('is null with nothing to rank', () => {
    expect(weightedQuantile([])).toBeNull();
  });
});

describe('the 95% interval on a p75', () => {
  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  it('matches the order-statistic ranks computed independently for n = 20 and n = 100', () => {
    /* Reference ranks from an exact binomial computation in Python. */
    expect(p75Interval(range(20))).toEqual([11, 19]);
    expect(p75Interval(range(100))).toEqual([66, 84]);
  });

  it('declines to give an interval when the sample is too small for one to exist', () => {
    expect(p75Interval(range(10))).toBeNull();
    expect(p75Interval([])).toBeNull();
  });

  it('stays finite for a sample large enough to underflow a naive binomial', () => {
    const ci = p75Interval(range(5000));
    expect(ci).not.toBeNull();
    expect(ci![0]).toBeLessThan(3750);
    expect(ci![1]).toBeGreaterThan(3750);
  });
});

describe('summarising a set of beacons', () => {
  const human = WEEK_EVENTS.filter((e: any) => e.bot === 0).map(normaliseEvent);

  it('computes p75, rating, counts and good share per metric', () => {
    const s = summarise(human);
    expect(s.rows).toBe(6);
    expect(s.metrics.LCP).toMatchObject({ n: 5, nEst: 5, p75: 3000, rating: 'needs-improvement', good: 3, needsImprovement: 1, poor: 1, goodShare: 0.6 });
    expect(s.metrics.INP).toMatchObject({ n: 5, p75: 250, rating: 'needs-improvement', good: 3, needsImprovement: 1, poor: 1 });
    expect(s.metrics.CLS).toMatchObject({ n: 5, p75: 0.2, rating: 'needs-improvement', good: 3, needsImprovement: 1, poor: 1 });
  });

  it('marks a handful of beacons as indicative only', () => {
    expect(summarise(human).metrics.LCP.lowSample).toBe(true);
  });

  it('gives an interval only when every row has the same sample interval', () => {
    const uniform = Array.from({ length: 40 }, (_, i) => normaliseEvent(row({ largestContentfulPaint: (i + 1) * 100_000 })));
    expect(summarise(uniform).metrics.LCP.ci95).not.toBeNull();
    const mixed = [...uniform, normaliseEvent(row({ sampleInterval: 10 }))];
    expect(summarise(mixed).metrics.LCP.ci95).toBeNull();
  });

  it('weights good share by sample interval', () => {
    const s = summarise([
      normaliseEvent(row({ largestContentfulPaint: 1_000_000 })),
      normaliseEvent(row({ largestContentfulPaint: 6_000_000, sampleInterval: 10 })),
    ]);
    expect(s.estimated).toBe(11);
    expect(s.metrics.LCP.goodShare).toBe(0.091);
    expect(s.metrics.LCP.rating).toBe('poor');
  });
});

describe('arguments and windows', () => {
  it('defaults to the last 28 days ending now', () => {
    const o = parseArgs([], NOW);
    expect(o.until).toBe(NOW);
    expect(o.until - o.since).toBe(28 * 86_400_000);
    expect(o.json).toBe(false);
    expect(o.includeBots).toBe(false);
    expect(o.top).toBe(10);
  });

  it('takes --days, in either spelling', () => {
    expect(NOW - parseArgs(['--days', '7'], NOW).since).toBe(7 * 86_400_000);
    expect(NOW - parseArgs(['--days=3'], NOW).since).toBe(3 * 86_400_000);
  });

  it('reads bare dates and zone-less date-times as UTC', () => {
    const o = parseArgs(['--since', '2026-10-31', '--until', '2026-11-06T15:05'], NOW);
    expect(o.since).toBe(T('2026-10-31T00:00:00Z'));
    expect(o.until).toBe(T('2026-11-06T15:05:00Z'));
  });

  it('accepts a --compare-at inside the window and refuses one outside it', () => {
    expect(parseArgs(['--days', '14', '--compare-at', '2026-11-06T15:05Z'], NOW).compareAt).toBe(T('2026-11-06T15:05:00Z'));
    expect(() => parseArgs(['--days', '1', '--compare-at', '2026-10-01'], NOW)).toThrow(CwvUsageError);
  });

  it('refuses contradictions, empty windows, nonsense and unknown flags', () => {
    expect(() => parseArgs(['--days', '7', '--since', '2026-11-01'], NOW)).toThrow(CwvUsageError);
    expect(() => parseArgs(['--since', '2026-11-06', '--until', '2026-11-01'], NOW)).toThrow(CwvUsageError);
    expect(() => parseArgs(['--days', 'many'], NOW)).toThrow(CwvUsageError);
    expect(() => parseArgs(['--since', 'last tuesday'], NOW)).toThrow(CwvUsageError);
    expect(() => parseArgs(['--since'], NOW)).toThrow(CwvUsageError);
    expect(() => parseArgs(['--verbose'], NOW)).toThrow(CwvUsageError);
  });

  it('splits a window into contiguous pieces of six days or less', () => {
    const since = T('2026-10-09T19:40:00Z');
    const chunks = chunkWindow(since, NOW);
    expect(chunks).toHaveLength(5);
    expect(chunks[0][0]).toBe(since);
    expect(chunks.at(-1)![1]).toBe(NOW);
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i][1] - chunks[i][0]).toBeLessThanOrEqual(MAX_CHUNK_MS);
      if (i) expect(chunks[i][0]).toBe(chunks[i - 1][1]);
    }
  });

  it('cuts from the end, so the newest six days are one window that starts inside the unsampled week', () => {
    /* Cloudflare samples a window by how long ago it starts. Cut from the
       front, the newest days of a 28-day pull landed in a window starting
       eight days back and came back 1-in-10. */
    const chunks = chunkWindow(NOW - 28 * 86_400_000, NOW);
    expect(chunks.at(-1)).toEqual([NOW - MAX_CHUNK_MS, NOW]);
    expect(chunks[0][1] - chunks[0][0]).toBe(4 * 86_400_000); // the remainder is the oldest piece
  });
});

describe('the query', () => {
  const q = buildQuery();

  it('asks for the per-beacon rows with the fields the maths needs', () => {
    expect(q).toMatch(/rumWebVitalsEventsAdaptive\(limit: 10000/);
    for (const f of ['datetime', 'sampleInterval', 'bot', 'deviceType', 'requestPath', 'largestContentfulPaint', 'interactionToNextPaint', 'cumulativeLayoutShift']) {
      expect(q).toContain(f);
    }
    expect(q).toMatch(/datetime_geq: \$since, datetime_lt: \$until/);
  });

  it('uses no fragments and no confidence block', () => {
    expect(q).not.toContain('...');
    expect(q).not.toMatch(/\bfragment\b/);
    expect(q).not.toContain('confidence');
  });
});

describe('reading a response', () => {
  it('returns the rows, the grouped count and the page loads, without rescaling counts that are already scaled', () => {
    const c = extractChunk(200, WEEK);
    expect(c.events).toHaveLength(7);
    expect(c.vitalsTotal).toBe(7);
    expect(c.pageloads).toEqual({ estimated: 20, visits: 12 });
  });

  it('treats an authentication error as a failure whether it comes as a 401, a 403 or a 200', () => {
    expect(() => extractChunk(401, AUTH_ERROR)).toThrow(/authentication failed \(HTTP 401\)/);
    expect(() => extractChunk(403, '{}')).toThrow(CwvApiError);
    expect(() => extractChunk(200, AUTH_ERROR)).toThrow(/GraphQL error: authentication error/);
  });

  it('fails on a body that is not JSON, a server error, or an account the token cannot see', () => {
    expect(() => extractChunk(502, '<html>bad gateway</html>')).toThrow(/not JSON/);
    expect(() => extractChunk(500, '{"data":null}')).toThrow(/HTTP 500/);
    expect(() => extractChunk(200, '{"data":{"viewer":{"accounts":[]}}}')).toThrow(/cannot see account/);
  });
});

describe('fetching', () => {
  it('sends one request per six-day window, to the GraphQL endpoint, with the token only in the header', async () => {
    const { impl, calls } = fakeFetch(() => ({ body: responseWith([]) }));
    const since = T('2026-10-09T19:40:00Z');
    const out = await fetchEvents({ token: TOKEN, since, until: NOW, fetchImpl: impl });
    expect(out.requests).toBe(5);
    expect(calls).toHaveLength(5);
    for (const c of calls) {
      expect(c.url).toBe(ENDPOINT);
      expect(c.init.method).toBe('POST');
      expect(c.init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
      expect(c.init.body).not.toContain(TOKEN);
      expect(c.vars.account).toBe(ACCOUNT);
      expect(c.vars.host).toBe(HOST);
      expect(c.vars.since).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    }
    expect(calls[0].vars.since).toBe('2026-10-09T19:40:00Z');
    expect(calls[4].vars.until).toBe('2026-11-06T19:40:00Z');
  });

  it('splits a window that comes back full instead of keeping a truncated sample', async () => {
    const all = Array.from({ length: 5 }, (_, i) => row({ datetime: `2026-11-0${i + 1}T12:00:00Z` }));
    const { impl, calls } = fakeFetch((v) => {
      const rows = all.filter((e) => e.datetime >= v.since && e.datetime < v.until);
      return { body: responseWith(rows.slice(0, 3)) }; // the "API" never returns more than 3
    });
    const out = await fetchEvents({ token: TOKEN, since: T('2026-11-01T00:00:00Z'), until: T('2026-11-06T00:00:00Z'), fetchImpl: impl, limit: 3 });
    expect(out.events.map((e: any) => e.datetime)).toEqual(all.map((e) => e.datetime));
    expect(calls.length).toBeGreaterThan(1);
    expect(out.warnings).toEqual([]);
  });

  it('compares the grouped count with the weighted rows and warns when they disagree', async () => {
    const sampled = [row({ sampleInterval: 10 }), row({ sampleInterval: 10 })];
    const ok = fakeFetch(() => ({ body: responseWith(sampled) }));
    expect((await fetchEvents({ token: TOKEN, since: T('2026-11-01'), until: T('2026-11-02'), fetchImpl: ok.impl })).warnings).toEqual([]);

    const short = fakeFetch(() => ({ body: responseWith(sampled, { vitalsTotal: [{ count: 30 }] }) }));
    const { warnings } = await fetchEvents({ token: TOKEN, since: T('2026-11-01'), until: T('2026-11-02'), fetchImpl: short.impl });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/counts 30 beacons but the 2 rows returned represent 20/);
  });

  it('refuses to run without a token, and never repeats the token in an error', async () => {
    await expect(fetchEvents({ token: '', since: 0, until: 1000, fetchImpl: vi.fn() })).rejects.toThrow(/CF_API_TOKEN is not set/);

    const echo = async () => {
      throw new Error(`proxy refused Authorization: Bearer ${TOKEN}`);
    };
    const err = await fetchEvents({ token: TOKEN, since: T('2026-11-01'), until: T('2026-11-02'), fetchImpl: echo }).catch((e) => e);
    expect(err).toBeInstanceOf(CwvApiError);
    expect(err.message).not.toContain(TOKEN);
    expect(err.message).toContain('[token]');
  });
});

describe('the report', () => {
  const opts = { since: T('2026-11-01T00:00:00Z'), until: T('2026-11-07T00:00:00Z') };

  it('leaves bot beacons out by default and says how many', () => {
    const r = buildReport(WEEK_EVENTS, opts);
    expect(r.traffic).toBe('human');
    expect(r.beacons).toMatchObject({ rows: 6, botRowsExcluded: 1 });
    expect(r.sitewide.metrics.LCP.p75).toBe(3000);
  });

  it('includes them when asked, which moves the p75', () => {
    const r = buildReport(WEEK_EVENTS, { ...opts, includeBots: true });
    expect(r.beacons).toMatchObject({ rows: 7, botRowsExcluded: 0 });
    expect(r.sitewide.metrics.LCP.p75).toBe(5000);
    expect(r.sitewide.metrics.LCP.rating).toBe('poor');
  });

  it('breaks the window down by device type', () => {
    const r = buildReport(WEEK_EVENTS, opts);
    expect(r.byDevice.map((d: any) => [d.deviceType, d.rows])).toEqual([['desktop', 4], ['mobile', 2]]);
    expect(r.byDevice[0].metrics.LCP.p75).toBe(2000);
    expect(r.byDevice[1].metrics.LCP.p75).toBe(5000);
  });

  it('lists the busiest paths first, counting a sampled row as the views it stands for, up to --top', () => {
    const rows = [
      ...Array.from({ length: 4 }, () => row({ requestPath: '/a/' })),
      row({ requestPath: '/b/', sampleInterval: 10 }),
      row({ requestPath: '/c/' }),
    ];
    const r = buildReport(rows, { ...opts, top: 2 });
    expect(r.topPaths.map((p: any) => [p.path, p.estimated])).toEqual([['/b/', 10], ['/a/', 4]]);
  });

  it('splits the window at --compare-at and reports the change in p75', () => {
    const r = buildReport(WEEK_EVENTS, { ...opts, compareAt: T('2026-11-04T00:00:00Z') });
    expect(r.compare.before.sitewide.rows).toBe(3);
    expect(r.compare.after.sitewide.rows).toBe(3);
    expect(r.compare.before.sitewide.metrics.LCP.p75).toBe(3000);
    expect(r.compare.after.sitewide.metrics.LCP.p75).toBe(5000);
    expect(r.compare.delta.LCP).toBe(2000);
    expect(r.compare.before.until).toBe('2026-11-04T00:00:00Z');
  });

  /* Review of 6 Nov 2026: a before/after run made a week or two after a
     deploy has a sampled "before" side and a mixed "after" side, so neither
     has an interval, and the report used to tell the reader to judge the
     change against intervals it had not printed. */
  describe('judging a before/after change', () => {
    const at = T('2026-11-04T00:00:00Z');
    const many = (n: number, over: Record<string, unknown>) =>
      Array.from({ length: n }, (_, i) => row({ largestContentfulPaint: (1000 + i * 10) * 1000, ...over }));

    it('points at the intervals when both sides have one', () => {
      const rows = [...many(40, { datetime: '2026-11-02T12:00:00Z' }), ...many(40, { datetime: '2026-11-05T12:00:00Z' })];
      const r = buildReport(rows, { ...opts, compareAt: at });
      expect(r.compare.judgeable).toEqual({ LCP: true, INP: true, CLS: true });
      const text = formatText(r);
      expect(text).toContain('A change smaller than the 95% intervals above is not evidence of an effect.');
      expect(text).not.toMatch(/cannot say whether/);
    });

    it('says the change cannot be judged when the before side is a small 1-in-10 sample and the after side is mixed', () => {
      const rows = [
        ...many(12, { datetime: '2026-11-02T12:00:00Z', sampleInterval: 10 }),
        ...many(20, { datetime: '2026-11-05T12:00:00Z', sampleInterval: 10 }),
        ...many(20, { datetime: '2026-11-06T12:00:00Z' }),
      ];
      const r = buildReport(rows, { ...opts, compareAt: at });
      expect(r.compare.before.sitewide.metrics.LCP).toMatchObject({ ci95: null, ciMissing: 'too-few-beacons' });
      expect(r.compare.after.sitewide.metrics.LCP).toMatchObject({ ci95: null, ciMissing: 'mixed-sample-rates' });
      expect(r.compare.judgeable).toEqual({ LCP: false, INP: false, CLS: false });
      const text = formatText(r);
      expect(text).not.toContain('A change smaller than the 95% intervals');
      expect(text).toContain(
        'LCP: no 95% interval (before: too few beacons; after: sampled and unsampled beacons are mixed), so this run cannot say whether LCP changed.',
      );
      expect(text).toMatch(/none \(sampled and unsampled beacons are mixed\)/);
      expect(r.notes.join(' ')).toMatch(/before side of the comparison is a 1-in-10 sample/);
      expect(r.notes.join(' ')).toMatch(/after side of the comparison is partly a 1-in-10 sample/);
    });

    it('names only the metrics that can be judged when some can and some cannot', () => {
      const rows = [
        ...many(40, { datetime: '2026-11-02T12:00:00Z' }),
        ...many(40, { datetime: '2026-11-05T12:00:00Z', interactionToNextPaint: -1 }),
      ];
      const r = buildReport(rows, { ...opts, compareAt: at });
      expect(r.compare.judgeable).toEqual({ LCP: true, INP: false, CLS: true });
      const text = formatText(r);
      expect(text).toContain('LCP, CLS: a change smaller than the 95% intervals above is not evidence of an effect.');
      expect(text).toContain('INP: no 95% interval (after: no beacons reported it), so this run cannot say whether INP changed.');
    });
  });

  it('says when part of the window is a 1-in-10 sample', () => {
    const r = buildReport([row(), row({ sampleInterval: 10 })], opts);
    expect(r.beacons.rowsBySampleInterval).toEqual({ 1: 1, 10: 1 });
    expect(r.notes.join(' ')).toMatch(/1-in-10 sample/);
  });

  it('prints every section in plain text, with units', () => {
    const text = formatText(buildReport(WEEK_EVENTS, { ...opts, compareAt: T('2026-11-04T00:00:00Z'), pageloads: { estimated: 20, visits: 12 } }));
    for (const heading of ['SITEWIDE', 'BY DEVICE', 'TOP 3 PATHS BY BEACONS', 'BEFORE / AFTER 2026-11-04T00:00Z']) {
      expect(text).toContain(heading);
    }
    expect(text).toMatch(/LCP\s+3\.00 s\s+needs impr\./);
    expect(text).toMatch(/INP\s+250 ms/);
    expect(text).toMatch(/CLS\s+0\.200/);
    expect(text).toContain('LCP good <= 2.5 s');
    expect(text).toContain('change in sitewide p75: LCP +2.00 s');
    expect(text).toContain('Page loads seen by the beacon: est. 20');
  });

  it('copes with a window that has no beacons at all', () => {
    const r = buildReport([], opts);
    expect(r.sitewide.metrics.LCP.p75).toBeNull();
    expect(r.notes).toContain('No beacons in this window.');
    expect(() => formatText(r)).not.toThrow();
  });
});

describe('the command', () => {
  const run = async (argv: string[], respond: Parameters<typeof fakeFetch>[0], env: Record<string, string> = { CF_API_TOKEN: TOKEN }) => {
    const out: string[] = [];
    const err: string[] = [];
    const { impl, calls } = fakeFetch(respond);
    const code = await main({ argv, env, fetchImpl: impl, stdout: (s: string) => out.push(s), stderr: (s: string) => err.push(s), now: NOW });
    return { code, out: out.join('\n'), err: err.join('\n'), calls };
  };
  const window = ['--since', '2026-11-01', '--until', '2026-11-07'];

  it('exits 0 with a report even when every vital is poor', async () => {
    const poor = [row({ largestContentfulPaint: 9_000_000, interactionToNextPaint: 900_000, cumulativeLayoutShift: 0.9 })];
    const r = await run(window, () => ({ body: responseWith(poor) }));
    expect(r.code).toBe(0);
    expect(r.out).toContain('POOR');
  });

  it('prints JSON that parses, for machines', async () => {
    const r = await run([...window, '--json', '--compare-at', '2026-11-04'], () => ({ body: WEEK }));
    expect(r.code).toBe(0);
    const j = JSON.parse(r.out);
    expect(j.window).toEqual({ since: '2026-11-01T00:00:00Z', until: '2026-11-07T00:00:00Z', days: 6 });
    expect(j.units).toEqual({ LCP: 'ms', INP: 'ms', CLS: 'unitless' });
    expect(j.thresholds.INP).toEqual({ good: 200, poor: 500 });
    expect(j.sitewide.metrics.INP.p75).toBe(250);
    expect(j.compare.delta.LCP).toBe(2000);
    expect(j.pageloads).toEqual({ estimated: 20, visits: 12 });
  });

  it('exits 1 on an authentication failure and does not print the token', async () => {
    const r = await run(window, () => ({ status: 401, body: AUTH_ERROR }));
    expect(r.code).toBe(1);
    expect(r.out).toBe('');
    expect(r.err).toMatch(/authentication failed/);
    expect(r.err).not.toContain(TOKEN);
  });

  it('exits 1 without a token, before touching the network', async () => {
    const r = await run(window, () => ({ body: WEEK }), {});
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/CF_API_TOKEN is not set/);
    expect(r.calls).toHaveLength(0);
  });

  it('exits 2 on bad arguments, with the usage, before touching the network', async () => {
    const r = await run(['--days', '0'], () => ({ body: WEEK }));
    expect(r.code).toBe(2);
    expect(r.err).toMatch(/usage: npm run cwv:field/);
    expect(r.calls).toHaveLength(0);
  });

  it('prints the usage for --help and exits 0', async () => {
    const r = await run(['--help'], () => ({ body: WEEK }));
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/--compare-at ISO/);
    expect(r.calls).toHaveLength(0);
  });
});

/* The saved Phase 1 baseline (docs/growth/performance.md section 8). It was
   measured on deploy day because the same window re-run a week later comes
   back as a 1-in-10 sample; these checks keep the file what the docs say it
   is: unsampled, 5.8 days ending at the deploy, with an interval on every
   sitewide p75. It starts at 20:00 UTC on 31 Oct, not 15:05, to leave out a
   five-hour burst of what looks like the site's own testing (Phase 4 review). */
describe('the saved Phase 1 baseline', () => {
  const baseline = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../docs/growth/cwv-baselines/2026-11-06-phase1-before.json'), 'utf8'),
  );

  it('is the unsampled 5.8 days before the deploy, human traffic only', () => {
    expect(baseline.window).toEqual({ since: '2026-10-31T20:00:00Z', until: '2026-11-06T15:05:00Z', days: 5.8 });
    expect(baseline.traffic).toBe('human');
    expect(Object.keys(baseline.beacons.rowsBySampleInterval)).toEqual(['1']);
    expect(baseline.compare).toBeNull();
  });

  it('has a 95% interval on every sitewide p75, which is what a later window is compared with', () => {
    for (const m of ['LCP', 'INP', 'CLS']) {
      const x = baseline.sitewide.metrics[m];
      expect(x.ci95).toHaveLength(2);
      expect(x.ci95[0]).toBeLessThanOrEqual(x.p75);
      expect(x.p75).toBeLessThanOrEqual(x.ci95[1]);
    }
  });
});

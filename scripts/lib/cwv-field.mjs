/**
 * Field Core Web Vitals from Cloudflare Web Analytics: the pure parts.
 *
 * WHY THIS EXISTS. Until November 2026 the performance work on this site was
 * judged on lab numbers only (Lighthouse, run locally; see
 * docs/growth/performance.md). The PageSpeed report in the brief showed no
 * CrUX field data for the origin, and there is no Search Console access, so
 * "field data is not measurable" was written down as a gap. It was not one:
 * the zone is proxied by Cloudflare, which injects its Web Analytics beacon at
 * the edge, and that beacon reports LCP, INP and CLS from real visits; on
 * 6 Nov 2026 the API held them back to early October. ACTION-PLAN item 26
 * asked for real-user monitoring; this
 * reads the monitoring that already exists instead of adding a second one.
 *
 * WHAT IS IN THIS FILE AND WHAT IS NOT. Everything here is a pure function of
 * its arguments except `fetchEvents`, which takes `fetch` as a parameter. The
 * CLI wrapper (`scripts/cwv-field.mjs`) is the only place that reads the
 * environment or the real network, so `tests/tooling/cwv-field.test.ts` can
 * drive the whole pipeline — arguments, paging, errors, maths, output — from
 * fixture responses without a token and without a connection.
 *
 * HOW THE NUMBERS ARE MADE. Cloudflare returns the server-side p75 for a
 * grouped query, but a p75 cannot be merged across windows, and the API will
 * only return an unsampled answer for a window of about six days. So this
 * pulls the per-beacon rows in windows of six days or less and computes the
 * percentiles itself, the same way the measurement pass of 6 Nov 2026 did:
 *
 *   - LCP and INP arrive in MICROSECONDS; CLS is unitless; -1 means the
 *     browser did not report that metric for that page view (INP, for
 *     example, needs an interaction). Values of 0 and above
 *     count. That rule reproduces Cloudflare's own `lcpTotal`, `inpTotal` and
 *     `clsTotal` exactly on the 31 Oct–6 Nov window, which is how it was
 *     checked.
 *   - Rows older than about seven days come back as a 1-in-10 sample with
 *     `sampleInterval: 10`. Each row is weighted by its `sampleInterval`, so a
 *     28-day window that is part sampled and part not still adds up.
 *   - p75 is the weighted nearest-rank value: the smallest value at which the
 *     cumulative weight reaches 75% of the total. Google's assessment of a
 *     page is the p75 against the thresholds below, and so is this.
 */

export const ACCOUNT = '47a82355b575e264047206a36c2cd05c';
export const HOST = 'www.evergreencleaningservice.ca';
export const ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';

/** Rows per request. Cloudflare's ceiling for this dataset. */
export const ROW_LIMIT = 10000;

/**
 * Six days, not seven. A window that starts more than about seven days back is
 * answered from the 1-in-10 sample whatever its length; one of six days or
 * less that starts inside the last week is answered in full. Observed in the
 * measurement pass of 6 Nov 2026: every six-day window starting before
 * 31 Oct came back with `sampleInterval: 10`, the one starting 31 Oct with 1.
 */
export const MAX_CHUNK_MS = 6 * 24 * 60 * 60 * 1000;

/**
 * Below this many reporting page views a p75 is shown but marked as
 * indicative. Thirty is a round reading aid, not a statistical test; the
 * interval printed beside each p75 is the real measure of how much to trust it.
 */
export const MIN_SAMPLES = 30;

/**
 * Google's Core Web Vitals thresholds, applied to the p75. "good" is at or
 * under `good`; "poor" is over `poor`; between is "needs improvement".
 * https://web.dev/articles/vitals — unchanged since INP replaced FID in
 * March 2024.
 */
export const THRESHOLDS = {
  LCP: { field: 'largestContentfulPaint', good: 2500, poor: 4000, unit: 'ms', fromRaw: (v) => v / 1000 },
  INP: { field: 'interactionToNextPaint', good: 200, poor: 500, unit: 'ms', fromRaw: (v) => v / 1000 },
  CLS: { field: 'cumulativeLayoutShift', good: 0.1, poor: 0.25, unit: '', fromRaw: (v) => v },
};
export const METRICS = /** @type {const} */ (['LCP', 'INP', 'CLS']);

/** An API or authentication failure: the only thing that exits non-zero. */
export class CwvApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CwvApiError';
  }
}

/** Bad command-line arguments. */
export class CwvUsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CwvUsageError';
  }
}

/* ------------------------------------------------------------------------ */
/* Arguments and windows                                                     */
/* ------------------------------------------------------------------------ */

const DAY_MS = 24 * 60 * 60 * 1000;

/** RFC3339 in UTC, to the second, which is what the API's `Time` accepts. */
export const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');

/**
 * Parse a date or date-time given on the command line. A bare date is
 * midnight UTC; a date-time without a zone is read as UTC too, rather than as
 * the local time of whichever machine runs this, so the same command gives the
 * same window everywhere.
 */
export function parseTime(text, flag) {
  if (typeof text !== 'string' || !text) throw new CwvUsageError(`${flag} needs a date, e.g. 2026-11-06 or 2026-11-06T15:05Z`);
  let t = text.trim();
  if (/T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t)) t += 'Z';
  const ms = Date.parse(t);
  if (!/^\d{4}-\d{2}-\d{2}/.test(t) || Number.isNaN(ms)) {
    throw new CwvUsageError(`${flag}: "${text}" is not an ISO date, e.g. 2026-11-06 or 2026-11-06T15:05Z`);
  }
  return ms;
}

export const USAGE = `usage: npm run cwv:field -- [options]

  --days N             window of the last N days (default 28)
  --since ISO          window start (date or date-time, UTC)
  --until ISO          window end (default: now)
  --compare-at ISO     also split the window before/after this moment; the
                       change can be judged only while both sides are
                       unsampled (the last six days), so keep a --json
                       baseline before it ages (docs/growth/performance.md 8)
  --top N              how many paths to list (default 10)
  --include-bots       keep beacons Cloudflare flags as bots (default: human only)
  --json               machine-readable output

Needs CF_API_TOKEN with Account Analytics read. Exits 1 only on an API or
authentication failure, 2 on bad arguments; poor vitals still exit 0.`;

/**
 * Turn argv into a window and options. `now` is a parameter so the tests can
 * pin it.
 */
export function parseArgs(argv, now = Date.now()) {
  const opts = { days: null, since: null, until: null, compareAt: null, json: false, includeBots: false, top: 10, help: false };
  const need = (i, flag) => {
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new CwvUsageError(`${flag} needs a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let inline = null;
    if (a.startsWith('--') && a.includes('=')) [a, inline] = [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)];
    const value = () => {
      if (inline !== null) return inline;
      const v = need(i, a);
      i++;
      return v;
    };
    switch (a) {
      case '--days': {
        const v = value();
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) throw new CwvUsageError(`--days needs a positive number, not "${v}"`);
        opts.days = n;
        break;
      }
      case '--since': opts.since = parseTime(value(), '--since'); break;
      case '--until': opts.until = parseTime(value(), '--until'); break;
      case '--compare-at': opts.compareAt = parseTime(value(), '--compare-at'); break;
      case '--top': {
        const v = value();
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0) throw new CwvUsageError(`--top needs a positive whole number, not "${v}"`);
        opts.top = n;
        break;
      }
      case '--json': opts.json = true; break;
      case '--include-bots': opts.includeBots = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: throw new CwvUsageError(`unknown argument "${argv[i]}"`);
    }
  }
  if (opts.days !== null && opts.since !== null) throw new CwvUsageError('give --days or --since, not both');

  const until = opts.until ?? Math.floor(now / 1000) * 1000;
  const since = opts.since ?? until - (opts.days ?? 28) * DAY_MS;
  if (!(since < until)) throw new CwvUsageError(`the window is empty: ${iso(since)} is not before ${iso(until)}`);
  if (opts.compareAt !== null && !(since < opts.compareAt && opts.compareAt < until)) {
    throw new CwvUsageError(`--compare-at ${iso(opts.compareAt)} is outside the window ${iso(since)} to ${iso(until)}`);
  }
  return { ...opts, since, until };
}

/**
 * Split [since, until) into consecutive windows no longer than `max`, in
 * time order, laid out BACKWARDS from `until` so any short remainder is the
 * oldest piece. Whether Cloudflare samples a window depends on how long ago
 * it STARTS, so cutting from the front put the newest unsampled days into a
 * window that began eight days back: the first real run (6 Nov 2026) got
 * 93 unsampled rows out of a 28-day pull against 122 from a plain 6-day one.
 */
export function chunkWindow(since, until, max = MAX_CHUNK_MS) {
  const out = [];
  for (let t = until; t > since; t -= max) out.unshift([Math.max(t - max, since), t]);
  return out;
}

/* ------------------------------------------------------------------------ */
/* The query                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * One request per window: the per-beacon rows, plus two grouped totals used
 * as cross-checks. Plain fields only, no fragments and no `confidence {}`
 * block, keeping to the shape the 6 Nov 2026 measurement pass established
 * against this account.
 *
 * A grouped `count` is ALREADY scaled for sampling: on 6 Nov 2026 a 1-in-10
 * window returned 4 rows of `sampleInterval: 10` and a grouped count of 40.
 * So `vitalsTotal.count` is compared with the SUM of the rows' sample
 * intervals, and if they disagree something was cut off and the report says
 * so rather than quietly using a partial sample. (Multiplying a grouped count
 * by its average sample interval, which an earlier draft of this did for
 * page loads, overstates it tenfold.)
 *
 * `pageloads` gives the denominator: how many page loads the beacon saw in
 * the window, whether or not the browser reported vitals for them.
 */
export function buildQuery(limit = ROW_LIMIT) {
  const filter = '{requestHost: $host, datetime_geq: $since, datetime_lt: $until}';
  return `query EvergreenCwvField($account: string!, $host: string!, $since: Time!, $until: Time!) {
  viewer {
    accounts(filter: {accountTag: $account}) {
      events: rumWebVitalsEventsAdaptive(limit: ${limit}, filter: ${filter}, orderBy: [datetime_ASC]) {
        datetime sampleInterval bot deviceType requestPath
        largestContentfulPaint interactionToNextPaint cumulativeLayoutShift
      }
      vitalsTotal: rumWebVitalsEventsAdaptiveGroups(limit: 1, filter: ${filter}) {
        count
      }
      pageloads: rumPageloadEventsAdaptiveGroups(limit: 1, filter: ${filter}) {
        count
        sum { visits }
      }
    }
  }
}`;
}

/**
 * Pull one GraphQL response apart, or say exactly why it cannot be. Cloudflare
 * answers a bad token with HTTP 200 and an `errors` array as often as with a
 * 401, so the body is checked whatever the status.
 */
export function extractChunk(status, body) {
  let json;
  try {
    json = typeof body === 'string' ? JSON.parse(body) : body;
  } catch {
    throw new CwvApiError(`Cloudflare answered HTTP ${status} with a body that is not JSON`);
  }
  const errors = Array.isArray(json?.errors) ? json.errors : [];
  if (status === 401 || status === 403) {
    const why = errors.map((e) => e?.message).filter(Boolean).join('; ');
    throw new CwvApiError(`authentication failed (HTTP ${status})${why ? `: ${why}` : ''}`);
  }
  if (errors.length) {
    throw new CwvApiError(`GraphQL error: ${errors.map((e) => e?.message ?? JSON.stringify(e)).join('; ')}`);
  }
  if (status < 200 || status >= 300) throw new CwvApiError(`Cloudflare answered HTTP ${status}`);
  const accounts = json?.data?.viewer?.accounts;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new CwvApiError(`the token cannot see account ${ACCOUNT} (no account in the response)`);
  }
  const a = accounts[0];
  if (!Array.isArray(a.events)) throw new CwvApiError('the response has no events list');
  const pl = a.pageloads?.[0];
  return {
    events: a.events,
    vitalsTotal: a.vitalsTotal?.[0]?.count ?? null,
    /* Grouped counts and sums come back already scaled for sampling. */
    pageloads: { estimated: pl?.count ?? 0, visits: pl?.sum?.visits ?? 0 },
  };
}

/**
 * Fetch every beacon in [since, until), six days at a time, splitting a
 * window in half whenever it comes back full so that a busy week cannot be
 * silently truncated at the row limit.
 *
 * `fetchImpl` is a parameter so tests can answer from fixtures. The token is
 * only ever placed in the Authorization header; it is never part of a message.
 */
export async function fetchEvents({ token, since, until, fetchImpl, limit = ROW_LIMIT, maxChunkMs = MAX_CHUNK_MS }) {
  if (!token) throw new CwvApiError('CF_API_TOKEN is not set');
  const query = buildQuery(limit);
  const events = [];
  const pageloads = { estimated: 0, visits: 0 };
  const warnings = [];
  let requests = 0;

  const scrub = (msg) => String(msg).split(token).join('[token]');

  const pull = async (from, to) => {
    requests++;
    let res;
    let text;
    try {
      res = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { account: ACCOUNT, host: HOST, since: iso(from), until: iso(to) } }),
      });
      text = await res.text();
    } catch (err) {
      throw new CwvApiError(scrub(`request to Cloudflare failed: ${err?.message ?? err}`));
    }
    let chunk;
    try {
      chunk = extractChunk(res.status, text);
    } catch (err) {
      throw new CwvApiError(scrub(err.message));
    }
    if (chunk.events.length >= limit) {
      if (to - from <= 60_000) throw new CwvApiError(`more than ${limit} beacons in one minute at ${iso(from)}; cannot page further`);
      const mid = from + Math.floor((to - from) / 2 / 1000) * 1000;
      await pull(from, mid);
      await pull(mid, to);
      return;
    }
    const weighted = chunk.events.reduce((acc, e) => acc + (e.sampleInterval > 0 ? e.sampleInterval : 1), 0);
    if (chunk.vitalsTotal !== null && chunk.vitalsTotal !== weighted) {
      warnings.push(
        `${iso(from)} to ${iso(to)}: Cloudflare counts ${chunk.vitalsTotal} beacons but the ${chunk.events.length} rows returned represent ${weighted}`,
      );
    }
    events.push(...chunk.events);
    pageloads.estimated += chunk.pageloads.estimated;
    pageloads.visits += chunk.pageloads.visits;
  };

  for (const [from, to] of chunkWindow(since, until, maxChunkMs)) await pull(from, to);
  events.sort((a, b) => (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0));
  return { events, pageloads, warnings, requests };
}

/* ------------------------------------------------------------------------ */
/* The maths                                                                 */
/* ------------------------------------------------------------------------ */

/** good / needs-improvement / poor for one value of one metric. */
export function classify(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t) throw new Error(`unknown metric ${metric}`);
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Weighted nearest-rank quantile over [value, weight] pairs: the smallest
 * value at which the running weight reaches p of the total. With every weight
 * 1 it is the ordinary nearest-rank p75. The small epsilon absorbs float error
 * in p * total, so 4 equal weights give the 3rd value and not the 4th.
 */
export function weightedQuantile(pairs, p = 0.75) {
  if (!pairs.length) return null;
  const s = [...pairs].sort((a, b) => a[0] - b[0]);
  const total = s.reduce((acc, [, w]) => acc + w, 0);
  let acc = 0;
  for (const [v, w] of s) {
    acc += w;
    if (acc >= p * total - 1e-9) return v;
  }
  return s[s.length - 1][0];
}

/**
 * The Binomial(n, p) CDF at every k from 0 to n, in one pass. Accumulated in
 * log space, because (1 - p)^n underflows to zero long before n reaches the
 * number of beacons a busy month produces.
 */
function binomCdfs(n, p) {
  const lp = Math.log(p);
  const lq = Math.log(1 - p);
  const out = new Array(n + 1);
  let logPmf = n * lq; // P(B = 0)
  let logCdf = logPmf;
  out[0] = Math.exp(logCdf);
  for (let i = 0; i < n; i++) {
    logPmf += Math.log((n - i) / (i + 1)) + lp - lq;
    const hi = Math.max(logCdf, logPmf);
    logCdf = hi + Math.log(Math.exp(logCdf - hi) + Math.exp(logPmf - hi));
    out[i + 1] = Math.min(1, Math.exp(logCdf));
  }
  return out;
}

/**
 * Distribution-free 95% interval for the 75th percentile from order
 * statistics (unweighted). Returns null when the sample is too small for
 * either end to exist, and is only used when every row carries the same
 * weight; a mix of sampled and unsampled rows is not a simple random sample
 * and an interval computed as if it were would be falsely narrow.
 */
export function p75Interval(values, conf = 0.95) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return null;
  const alpha = (1 - conf) / 2;
  const cdf = binomCdfs(n, 0.75);
  /* The k-th smallest value is below the true p75 with probability
     P(B >= k), B ~ Binomial(n, 0.75). Lower end: the largest l with
     P(B <= l-1) <= alpha. Upper end: the smallest u with P(B <= u-1) >= 1 - alpha. */
  let lo = null;
  let hi = null;
  for (let l = 1; l <= n; l++) if (cdf[l - 1] <= alpha) lo = l;
  for (let u = n; u >= 1; u--) if (cdf[u - 1] >= 1 - alpha) hi = u;
  if (lo === null || hi === null) return null;
  return [s[lo - 1], s[hi - 1]];
}

/** One beacon row in report units, or null for each metric it did not report. */
export function normaliseEvent(e) {
  const out = {
    datetime: e.datetime,
    weight: Number.isFinite(e.sampleInterval) && e.sampleInterval > 0 ? e.sampleInterval : 1,
    bot: e.bot === 1 || e.bot === true,
    deviceType: e.deviceType || 'unknown',
    path: e.requestPath || '(unknown)',
  };
  for (const m of METRICS) {
    const t = THRESHOLDS[m];
    const raw = e[t.field];
    out[m] = typeof raw === 'number' && raw >= 0 ? t.fromRaw(raw) : null;
  }
  return out;
}

const round = (v, dp) => (v === null ? null : Math.round(v * 10 ** dp) / 10 ** dp);

/** Everything the report says about one set of beacons. */
export function summarise(rows) {
  const out = {
    rows: rows.length,
    estimated: rows.reduce((a, r) => a + r.weight, 0),
    metrics: {},
  };
  for (const m of METRICS) {
    const pairs = rows.filter((r) => r[m] !== null).map((r) => [r[m], r.weight]);
    const nEst = pairs.reduce((a, [, w]) => a + w, 0);
    let good = 0;
    let ni = 0;
    let poor = 0;
    for (const [v, w] of pairs) {
      const c = classify(m, v);
      if (c === 'good') good += w;
      else if (c === 'needs-improvement') ni += w;
      else poor += w;
    }
    const p75 = weightedQuantile(pairs);
    const uniform = new Set(pairs.map(([, w]) => w)).size <= 1;
    const ci95 = uniform && pairs.length ? p75Interval(pairs.map(([v]) => v)) : null;
    out.metrics[m] = {
      n: pairs.length,
      nEst,
      p75: p75 === null ? null : round(p75, m === 'CLS' ? 3 : 0),
      rating: classify(m, p75),
      good,
      needsImprovement: ni,
      poor,
      goodShare: nEst ? round(good / nEst, 3) : null,
      ci95,
      /* Why there is no interval, when there is none, so the output can say
         so instead of leaving a bare "n/a" for the reader to interpret. */
      ciMissing: ci95 ? null : !pairs.length ? 'no-data' : !uniform ? 'mixed-sample-rates' : 'too-few-beacons',
      lowSample: pairs.length < MIN_SAMPLES,
    };
  }
  return out;
}

/** Group rows by a key and summarise each group, largest (by estimated beacons) first. */
export function summariseBy(rows, key) {
  const groups = new Map();
  for (const r of rows) {
    const k = r[key];
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  return [...groups.entries()]
    .map(([k, rs]) => ({ [key]: k, ...summarise(rs) }))
    .sort((a, b) => b.estimated - a.estimated || b.rows - a.rows || String(a[key]).localeCompare(String(b[key])));
}

/**
 * The whole report from raw API rows. Pure: the same rows and options always
 * give the same object, which is what `--json` prints.
 */
export function buildReport(rawEvents, { since, until, compareAt = null, includeBots = false, top = 10, pageloads = null, warnings = [] }) {
  const all = rawEvents.map(normaliseEvent);
  const rows = includeBots ? all : all.filter((r) => !r.bot);
  const byInterval = {};
  for (const r of rows) byInterval[r.weight] = (byInterval[r.weight] ?? 0) + 1;

  const notes = [...warnings];
  if (Object.keys(byInterval).some((k) => Number(k) > 1)) {
    notes.push('Part of this window is a 1-in-10 sample (Cloudflare samples beacons older than about 7 days); each row is weighted by its sample interval, so counts marked "est." are estimates.');
  }
  if (rows.length === 0) notes.push('No beacons in this window.');

  const section = (rs) => ({ sitewide: summarise(rs), byDevice: summariseBy(rs, 'deviceType') });

  let compare = null;
  if (compareAt !== null) {
    const at = iso(compareAt);
    /* Compared as instants, not strings: the API writes whole seconds, but a
       row's datetime and the cut point need not share a spelling. */
    const beforeRows = rows.filter((r) => Date.parse(r.datetime) < compareAt);
    const afterRows = rows.filter((r) => Date.parse(r.datetime) >= compareAt);
    const before = section(beforeRows);
    const after = section(afterRows);
    /* A metric's change can be judged only when both sides have an interval.
       Review of 6 Nov 2026: a before/after run made a week or two after a
       deploy finds the "before" side aged into Cloudflare's 1-in-10 sample
       (a dozen rows, too few for an interval) and the "after" side mixed
       1-in-1 and 1-in-10 (no honest interval), and the report used to say
       "judge against the intervals" with none printed. */
    const judgeable = Object.fromEntries(
      METRICS.map((m) => [m, Boolean(before.sitewide.metrics[m].ci95 && after.sitewide.metrics[m].ci95)]),
    );
    for (const [label, rs] of [['before', beforeRows], ['after', afterRows]]) {
      if (rs.some((r) => r.weight > 1)) {
        notes.push(
          `The ${label} side of the comparison is ${rs.every((r) => r.weight > 1) ? 'a' : 'partly a'} 1-in-10 sample. ` +
            'For a before/after judgement, measure each side as its own window of six days or less while it is still in the last week (unsampled), and keep the earlier one with --json; see docs/growth/performance.md section 8.',
        );
      }
    }
    compare = {
      at,
      before: { since: iso(since), until: at, ...before },
      after: { since: at, until: iso(until), ...after },
      judgeable,
      delta: Object.fromEntries(
        METRICS.map((m) => {
          const b = before.sitewide.metrics[m].p75;
          const a = after.sitewide.metrics[m].p75;
          return [m, a === null || b === null ? null : round(a - b, m === 'CLS' ? 3 : 0)];
        }),
      ),
    };
  }

  return {
    source: 'Cloudflare Web Analytics (real-user beacons)',
    host: HOST,
    window: { since: iso(since), until: iso(until), days: round((until - since) / DAY_MS, 2) },
    traffic: includeBots ? 'all' : 'human',
    units: { LCP: 'ms', INP: 'ms', CLS: 'unitless' },
    thresholds: Object.fromEntries(METRICS.map((m) => [m, { good: THRESHOLDS[m].good, poor: THRESHOLDS[m].poor }])),
    beacons: {
      rows: rows.length,
      estimated: rows.reduce((a, r) => a + r.weight, 0),
      botRowsExcluded: includeBots ? 0 : all.length - rows.length,
      rowsBySampleInterval: byInterval,
    },
    pageloads,
    ...section(rows),
    topPaths: summariseBy(rows, 'path').slice(0, top),
    compare,
    notes,
  };
}

/* ------------------------------------------------------------------------ */
/* Plain-text output                                                         */
/* ------------------------------------------------------------------------ */

export function formatValue(metric, v) {
  if (v === null || v === undefined) return '—';
  if (metric === 'LCP') return `${(v / 1000).toFixed(2)} s`;
  if (metric === 'INP') return `${Math.round(v)} ms`;
  return v.toFixed(3);
}

const RATING = { good: 'good', 'needs-improvement': 'needs impr.', poor: 'POOR' };
const pct = (x) => (x === null ? '—' : `${(x * 100).toFixed(1)}%`);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const shortTime = (t) => t.replace(/:00Z$/, 'Z');

function metricTable(summary, indent = '  ') {
  const lines = [`${indent}${pad('', 5)}${lpad('p75', 9)}  ${pad('rating', 12)}${lpad('good', 7)}  ${lpad('n', 5)}  ${pad('est.', 6)}  95% CI of p75`];
  for (const m of METRICS) {
    const x = summary.metrics[m];
    const ci = x.ci95 ? `${formatValue(m, x.ci95[0])} to ${formatValue(m, x.ci95[1])}` : x.n ? `none (${CI_MISSING[x.ciMissing]})` : '';
    lines.push(
      `${indent}${pad(m, 5)}${lpad(formatValue(m, x.p75), 9)}  ${pad(x.rating ? RATING[x.rating] : '—', 12)}${lpad(pct(x.goodShare), 7)}  ${lpad(x.n, 5)}  ${pad(x.nEst, 6)}  ${ci}${x.n && x.lowSample ? '  (few samples: indicative)' : ''}`,
    );
  }
  return lines;
}

function deviceLines(byDevice) {
  const lines = [];
  for (const d of byDevice) {
    lines.push(`  ${d.deviceType}  (${d.rows} beacon${d.rows === 1 ? '' : 's'}${d.estimated !== d.rows ? `, est. ${d.estimated}` : ''})`);
    lines.push(...metricTable(d, '    '));
  }
  return lines.length ? lines : ['  (none)'];
}

const CI_MISSING = {
  'no-data': 'no beacons reported it',
  'mixed-sample-rates': 'sampled and unsampled beacons are mixed',
  'too-few-beacons': 'too few beacons',
};

/**
 * The closing advice on a before/after split. It points at the intervals only
 * for metrics where both sides have one; for the rest it says plainly that
 * this run cannot judge the change, and why.
 */
function judgementLines(c) {
  const ok = METRICS.filter((m) => c.judgeable[m]);
  const missing = METRICS.filter((m) => !c.judgeable[m]);
  const lines = [];
  if (ok.length) {
    lines.push(
      `  ${ok.length === METRICS.length ? 'A' : `${ok.join(', ')}: a`} change smaller than the 95% intervals above is not evidence of an effect.`,
    );
  }
  for (const m of missing) {
    const why = ['before', 'after']
      .filter((side) => !c[side].sitewide.metrics[m].ci95)
      .map((side) => `${side}: ${CI_MISSING[c[side].sitewide.metrics[m].ciMissing] ?? 'none'}`)
      .join('; ');
    lines.push(`  ${m}: no 95% interval (${why}), so this run cannot say whether ${m} changed.`);
  }
  if (missing.length) {
    lines.push('  Compare unsampled windows instead: a saved baseline against a window of six days or less in the last week.');
  }
  return lines;
}

export function formatText(r) {
  const out = [];
  const t = r.thresholds;
  out.push(`Field Core Web Vitals: ${r.host}`);
  out.push(`Source:  ${r.source}, ${r.traffic === 'human' ? 'human traffic only' : 'bots included'}`);
  out.push(`Window:  ${shortTime(r.window.since)} to ${shortTime(r.window.until)} (${r.window.days} days)`);
  const si = Object.entries(r.beacons.rowsBySampleInterval)
    .map(([k, n]) => `${n} at 1-in-${k}`)
    .join(', ');
  out.push(
    `Beacons: ${r.beacons.rows} rows${r.beacons.estimated !== r.beacons.rows ? `, est. ${r.beacons.estimated} page views` : ''}${si ? ` (${si})` : ''}` +
      `${r.traffic === 'human' ? `; ${r.beacons.botRowsExcluded} bot rows excluded` : ''}`,
  );
  if (r.pageloads) {
    out.push(`Page loads seen by the beacon: est. ${r.pageloads.estimated} (bots included), ${r.pageloads.visits} visits`);
  }
  out.push(
    `Thresholds (Google, at p75): LCP good <= ${t.LCP.good / 1000} s, poor > ${t.LCP.poor / 1000} s; INP good <= ${t.INP.good} ms, poor > ${t.INP.poor} ms; CLS good <= ${t.CLS.good}, poor > ${t.CLS.poor}`,
  );
  out.push('"good" column = share of page views in the good band; n = beacons reporting that metric; est. = weighted by sample interval.');
  out.push('');
  out.push('SITEWIDE');
  out.push(...metricTable(r.sitewide));
  out.push('');
  out.push('BY DEVICE');
  out.push(...deviceLines(r.byDevice));
  out.push('');
  out.push(`TOP ${r.topPaths.length} PATHS BY BEACONS`);
  if (!r.topPaths.length) out.push('  (none)');
  else {
    const w = Math.max(4, ...r.topPaths.map((p) => p.path.length));
    out.push(`  ${pad('path', w)}  ${lpad('n', 5)}  ${lpad('LCP p75', 9)}  ${lpad('INP p75', 8)}  ${lpad('CLS p75', 7)}`);
    for (const p of r.topPaths) {
      const flag = (m) => (p.metrics[m].rating === 'poor' ? '!' : p.metrics[m].rating === 'needs-improvement' ? '~' : ' ');
      out.push(
        `  ${pad(p.path, w)}  ${lpad(p.estimated, 5)}  ${lpad(formatValue('LCP', p.metrics.LCP.p75), 8)}${flag('LCP')}  ${lpad(formatValue('INP', p.metrics.INP.p75), 7)}${flag('INP')}  ${lpad(formatValue('CLS', p.metrics.CLS.p75), 6)}${flag('CLS')}`,
      );
    }
    out.push('  (n = est. beacons; ~ needs improvement, ! poor; a path with few beacons is anecdote, not a p75)');
  }
  if (r.compare) {
    const c = r.compare;
    out.push('');
    out.push(`BEFORE / AFTER ${shortTime(c.at)}`);
    for (const [label, s] of [['before', c.before], ['after', c.after]]) {
      out.push(`  ${label}: ${shortTime(s.since)} to ${shortTime(s.until)}, ${s.sitewide.rows} beacons${s.sitewide.estimated !== s.sitewide.rows ? ` (est. ${s.sitewide.estimated})` : ''}`);
      out.push(...metricTable(s.sitewide, '    '));
      for (const d of s.byDevice) {
        out.push(`    ${d.deviceType}: ${METRICS.map((m) => `${m} ${formatValue(m, d.metrics[m].p75)} (n ${d.metrics[m].n})`).join(', ')}`);
      }
    }
    const sign = (m, v) => (v === null ? '—' : `${v > 0 ? '+' : v < 0 ? '-' : '±'}${formatValue(m, Math.abs(v))}`);
    out.push(`  change in sitewide p75: ${METRICS.map((m) => `${m} ${sign(m, c.delta[m])}`).join(', ')}`);
    out.push(...judgementLines(c));
  }
  if (r.notes.length) {
    out.push('');
    out.push('NOTES');
    for (const n of r.notes) out.push(`  - ${n}`);
  }
  return out.join('\n');
}

/* ------------------------------------------------------------------------ */
/* The CLI, minus process                                                    */
/* ------------------------------------------------------------------------ */

/**
 * Run the report. Everything the outside world provides comes in as an
 * argument, so the tests can run the real CLI path end to end on fixtures.
 * Returns the exit code: 0 for any report, however bad the vitals; 1 for an
 * API or authentication failure; 2 for bad arguments.
 */
export async function main({ argv, env, fetchImpl, stdout, stderr, now = Date.now() }) {
  let opts;
  try {
    opts = parseArgs(argv, now);
  } catch (err) {
    if (err instanceof CwvUsageError) {
      stderr(`cwv-field: ${err.message}\n\n${USAGE}`);
      return 2;
    }
    throw err;
  }
  if (opts.help) {
    stdout(USAGE);
    return 0;
  }
  const token = env.CF_API_TOKEN;
  try {
    const { events, pageloads, warnings } = await fetchEvents({ token, since: opts.since, until: opts.until, fetchImpl });
    const report = buildReport(events, { ...opts, pageloads, warnings });
    stdout(opts.json ? JSON.stringify(report, null, 2) : formatText(report));
    return 0;
  } catch (err) {
    if (err instanceof CwvApiError) {
      const msg = token ? err.message.split(token).join('[token]') : err.message;
      stderr(`cwv-field: ${msg}`);
      return 1;
    }
    throw err;
  }
}

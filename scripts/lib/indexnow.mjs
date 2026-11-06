// @ts-check
/**
 * The parts of `scripts/indexnow.mjs` that decide something, kept apart from
 * the command so tests/indexnow.test.ts can drive them with fixture sitemaps
 * and a stub `fetch`, and never reach the network.
 *
 * WHAT IS SUBMITTED. The URLs in the built sitemaps (dist/sitemap-pages-0.xml
 * and dist/sitemap-insights-0.xml) whose <lastmod> is newer than a cutoff.
 * Those dates are real content dates from git (src/lib/sitemap-lastmod.mjs),
 * not the build time, so "changed in the last three days" means a page whose
 * content or template was committed in that window, which is what an engine
 * wants to hear about. A URL with no <lastmod> (a shallow clone leaves some
 * out rather than guess) is only sent with --all.
 *
 * WHAT IS NOT. Posts published from the admin are added to the insights
 * sitemap by the Worker at request time (src/lib/admin/live-posts.ts); they
 * are not in dist/ and are not deployed, so this script never sees them.
 */

/** IndexNow accepts at most 10,000 URLs in one POST. */
export const MAX_URLS = 10_000;

/** The sitemaps `astro build` writes, by type (SEO audit M2). */
export const SITEMAPS = ['sitemap-pages-0.xml', 'sitemap-insights-0.xml'];

export const DEFAULT_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

const unescapeXml = (/** @type {string} */ s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * `<url>` entries from one sitemap. A regex rather than an XML parser: the
 * input is the file @astrojs/sitemap wrote moments earlier, and the project
 * has no XML dependency to add for it.
 *
 * @param {string} xml
 * @returns {{ loc: string, lastmod?: string }[]}
 */
export function parseSitemap(xml) {
  const entries = [];
  for (const [, body] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = body.match(/<loc>\s*([^<]+?)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    const lastmod = body.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/)?.[1];
    entries.push(lastmod ? { loc: unescapeXml(loc), lastmod } : { loc: unescapeXml(loc) });
  }
  return entries;
}

/**
 * Reads the command line. Throws on anything it does not understand, and the
 * command turns that into a logged message and exit 0 like every other
 * failure (see scripts/indexnow.mjs).
 *
 * @param {string[]} argv
 * @returns {{ all: boolean, days: number, dryRun: boolean, dist: string }}
 */
export function parseArgs(argv) {
  const opts = { all: false, days: DEFAULT_DAYS, dryRun: false, dist: 'dist' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [flag, inline] = arg.split(/=(.*)/s, 2);
    const value = () => {
      const v = inline ?? argv[++i];
      if (v === undefined || v === '') throw new Error(`${flag} needs a value`);
      return v;
    };
    if (flag === '--all') opts.all = true;
    else if (flag === '--dry-run') opts.dryRun = true;
    else if (flag === '--dist') opts.dist = value();
    else if (flag === '--days') {
      const raw = value();
      const days = Number(raw);
      if (!/^\d+(\.\d+)?$/.test(raw) || !(days > 0)) {
        throw new Error(`--days must be a positive number, got "${raw}"`);
      }
      opts.days = days;
    } else throw new Error(`unknown argument "${arg}"`);
  }
  return opts;
}

/**
 * The URLs to submit, newest first, one of each, on `host` only.
 *
 * IndexNow refuses a whole batch if any URL is on a host other than the one
 * named in the payload, so a stray URL is dropped here instead of costing
 * every other one. With `all`, every URL goes regardless of date.
 *
 * @param {{ loc: string, lastmod?: string }[]} entries
 * @param {{ host: string, all?: boolean, since?: Date }} options
 * @returns {string[]}
 */
export function selectUrls(entries, { host, all = false, since }) {
  if (!all && !since) throw new Error('selectUrls needs a cutoff date unless all is set');
  const cutoff = since ? since.getTime() : -Infinity;
  /** @type {Map<string, number>} */
  const chosen = new Map();
  for (const { loc, lastmod } of entries) {
    let url;
    try {
      url = new URL(loc);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:' || url.host !== host) continue;
    const time = lastmod ? Date.parse(lastmod) : NaN;
    if (!all && !(time > cutoff)) continue;
    const sortKey = Number.isNaN(time) ? -Infinity : time;
    chosen.set(loc, Math.max(chosen.get(loc) ?? -Infinity, sortKey));
  }
  return [...chosen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([loc]) => loc);
}

/**
 * The JSON body IndexNow expects. `keyLocation` names the key file outright;
 * at the site root it is optional, but stating it costs nothing and removes a
 * guess on the engine's side.
 *
 * @param {{ host: string, key: string, urls: string[] }} input
 */
export function buildPayload({ host, key, urls }) {
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls.slice(0, MAX_URLS),
  };
}

/** What each documented IndexNow status means, for the log. */
const STATUS_MEANING = {
  200: 'accepted',
  202: 'received; the key is still being checked',
  400: 'bad request: the payload is malformed',
  403: 'forbidden: the key file was not found or does not match',
  422: 'unprocessable: a URL is not on the host, or the key does not match the pattern',
  429: 'too many requests: the engine is rate-limiting this host',
};

/**
 * POSTs the payload. Never throws: a network error, a timeout or a non-2xx
 * comes back as `{ ok: false }` with a message, because a deploy must not
 * fail because a search engine did not answer.
 *
 * @param {ReturnType<typeof buildPayload>} payload
 * @param {{ endpoint: string, fetch?: typeof fetch, timeoutMs?: number }} options
 * @returns {Promise<{ ok: boolean, status?: number, message: string }>}
 */
export async function submit(payload, { endpoint, fetch: doFetch = fetch, timeoutMs = 15_000 }) {
  try {
    const res = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const meaning = STATUS_MEANING[/** @type {keyof typeof STATUS_MEANING} */ (res.status)] ?? res.statusText ?? '';
    let detail = '';
    if (!res.ok) {
      try {
        detail = (await res.text()).trim().slice(0, 300);
      } catch {
        // no body to report
      }
    }
    const message = `HTTP ${res.status}${meaning ? ` (${meaning})` : ''}${detail ? `: ${detail}` : ''}`;
    return { ok: res.ok, status: res.status, message };
  } catch (err) {
    return { ok: false, message: `request failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * The whole run, with every outside dependency passed in. Returns what it
 * did rather than exiting, so the command decides the exit code (always 0)
 * and a test can read the outcome.
 *
 * @param {{
 *   argv: string[],
 *   host: string,
 *   key: string,
 *   endpoint: string,
 *   readFile: (file: string) => string,
 *   fetch?: typeof fetch,
 *   now?: Date,
 *   log?: (line: string) => void,
 * }} deps
 * @returns {Promise<{ outcome: 'submitted' | 'failed' | 'dry-run' | 'nothing' | 'error', urls: string[], payload?: ReturnType<typeof buildPayload> }>}
 */
export async function run({ argv, host, key, endpoint, readFile, fetch: doFetch, now = new Date(), log = console.log }) {
  /** @type {string[]} */
  let urls = [];
  try {
    const opts = parseArgs(argv);

    const entries = [];
    let found = 0;
    for (const name of SITEMAPS) {
      const file = `${opts.dist.replace(/\/+$/, '')}/${name}`;
      let xml;
      try {
        xml = readFile(file);
      } catch {
        log(`indexnow: ${file} not found; skipping it.`);
        continue;
      }
      found++;
      entries.push(...parseSitemap(xml));
    }
    if (!found) {
      log(`indexnow: no sitemap in ${opts.dist}/ (run it after the build). Nothing submitted; not failing the deploy.`);
      return { outcome: 'error', urls };
    }

    const since = opts.all ? undefined : new Date(now.getTime() - opts.days * DAY_MS);
    urls = selectUrls(entries, { host, all: opts.all, since });
    const scope = opts.all ? 'from the sitemaps (--all)' : `with a lastmod after ${since?.toISOString()}`;
    const count = (/** @type {number} */ n) => `${n} URL${n === 1 ? '' : 's'}`;

    if (!urls.length) {
      log(`indexnow: no URLs ${scope}; nothing to submit.`);
      return { outcome: 'nothing', urls };
    }
    if (urls.length > MAX_URLS) {
      log(`indexnow: ${urls.length} URLs selected; sending the newest ${MAX_URLS}, the most one request takes.`);
    }

    const payload = buildPayload({ host, key, urls });
    if (opts.dryRun) {
      log(`indexnow: dry run, ${count(payload.urlList.length)} ${scope}. Would POST to ${endpoint}:`);
      log(JSON.stringify(payload, null, 2));
      return { outcome: 'dry-run', urls, payload };
    }

    const result = await submit(payload, { endpoint, fetch: doFetch });
    if (result.ok) {
      log(`indexnow: submitted ${count(payload.urlList.length)} ${scope}: ${result.message}.`);
      return { outcome: 'submitted', urls, payload };
    }
    log(`indexnow: submission not accepted (${result.message}). Not failing the deploy; the sitemap still lists every URL.`);
    return { outcome: 'failed', urls, payload };
  } catch (err) {
    log(`indexnow: ${err instanceof Error ? err.message : String(err)}. Nothing submitted; not failing the deploy.`);
    return { outcome: 'error', urls };
  }
}

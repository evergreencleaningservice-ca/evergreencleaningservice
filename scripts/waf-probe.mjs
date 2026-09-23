/**
 * WAF / crawler-reachability probe. READ-ONLY, and deliberately unable to
 * bypass anything.
 *
 * WHAT IT IS FOR. Production (evergreencleaningservice.ca, on SiteGround)
 * answers this container with an HTTP 202 and a SiteGround captcha
 * interstitial instead of the page. Staging (a Cloudflare Worker) answers
 * 200. Before a cutover that moves the domain from one to the other, the
 * difference has to be characterised rather than guessed at: which responses
 * differ, on what, and what that implies for a crawler.
 *
 * WHAT IT DOES NOT DO, and this is the point.
 *
 *   It does not bypass. It sends GET and HEAD requests with a `User-Agent`
 *   header and reads what comes back. There is no cookie replay, no captcha
 *   solve, no header-order trickery, no proxy hopping, no rate manipulation.
 *   If the interstitial is served, that is the finding and the probe records
 *   it.
 *
 *   IT DOES NOT PRODUCE CRAWLER EVIDENCE. A `User-Agent` string is a claim
 *   made by the client, and every WAF worth the name verifies a crawler by
 *   reverse DNS on the connecting IP (Googlebot: *.googlebot.com /
 *   *.google.com, forward-confirmed) or by Google's published IP list — never
 *   by the header. This container's requests come from an agent-proxy egress
 *   IP, which resolves to none of those. So a request from here carrying
 *   `Googlebot/2.1` is a SPOOFED user-agent and is labelled as such in every
 *   row of output.
 *
 *   What that means for reading the results: a 200 for the spoofed Googlebot
 *   row says the WAF did NOT block on the string alone. It does NOT say
 *   Googlebot can reach the site, and a 202 in that row does not say Googlebot
 *   is blocked. Only Search Console's URL Inspection — a request from a
 *   verified Googlebot IP — can answer that, and it is listed as a blocked
 *   check in the Phase 12 report because it needs an account this session does
 *   not have.
 *
 * Usage:
 *   node scripts/waf-probe.mjs                        both origins, all agents
 *   node scripts/waf-probe.mjs --json <file>          also write the raw rows
 */
import fs from 'node:fs';
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site.ts';

const ORIGINS = [
  { label: 'production', origin: `https://${PRODUCTION_HOSTS[0]}`, stack: 'SiteGround / WordPress' },
  { label: 'production-apex', origin: `https://${PRODUCTION_HOSTS[1]}`, stack: 'SiteGround / WordPress' },
  { label: 'staging', origin: `https://${PREVIEW_HOST}`, stack: 'Cloudflare Workers' },
];

/**
 * The agents. `verified` is false on every row that claims to be a crawler,
 * because from this network it cannot be anything else — see the header.
 */
const AGENTS = [
  {
    key: 'desktop',
    kind: 'real',
    verified: true,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  },
  {
    key: 'mobile',
    kind: 'real',
    verified: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
  {
    key: 'googlebot-desktop',
    kind: 'claimed-crawler',
    verified: false,
    ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
  {
    key: 'googlebot-smartphone',
    kind: 'claimed-crawler',
    verified: false,
    ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
  {
    key: 'bingbot',
    kind: 'claimed-crawler',
    verified: false,
    ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  },
  {
    key: 'adsbot-google',
    kind: 'claimed-crawler',
    verified: false,
    /* The one that decides whether a paid landing page is servable. An
       AdsBot block is a Google Ads landing-page disapproval, not merely a
       crawl gap, so it is probed separately from Googlebot. */
    ua: 'AdsBot-Google (+http://www.google.com/adsbot.html)',
  },
  {
    key: 'none',
    kind: 'no-ua',
    verified: true,
    /* Sent as an empty string; many WAFs treat a missing UA as hostile. Worth
       one row because a monitoring or uptime checker often looks like this. */
    ua: '',
  },
];

const PATHS = ['/', '/robots.txt', '/sitemap_index.xml', '/about-us/'];

/** What the SiteGround interstitial looks like, so it can be named not guessed. */
const sgCaptcha = (status, body, headers) =>
  status === 202 ||
  /sgcaptcha/i.test(body) ||
  /\.well-known\/sgcaptcha/i.test(body) ||
  /sgcaptcha/i.test(headers['location'] ?? '');

const rows = [];

const probe = async (origin, path, agent, method = 'GET') => {
  const url = new URL(path, origin.origin);
  const started = Date.now();
  const headers = {};
  /* An empty string is a real case; `fetch` drops the header entirely if the
     value is empty, which is exactly the "no user-agent" condition wanted. */
  if (agent.ua) headers['User-Agent'] = agent.ua;
  headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  headers['Accept-Language'] = 'en-CA,en;q=0.9';

  let row = {
    origin: origin.label,
    stack: origin.stack,
    url: url.href,
    path,
    method,
    agent: agent.key,
    agentKind: agent.kind,
    /* Carried into every row so no reader can mistake a 200 here for crawler
       access. See the header of this file. */
    identityVerified: agent.verified,
  };

  try {
    const res = await fetch(url, { method, headers, redirect: 'manual' });
    const body = method === 'GET' ? await res.text() : '';
    const h = Object.fromEntries([...res.headers].map(([k, v]) => [k.toLowerCase(), v]));
    row = {
      ...row,
      ms: Date.now() - started,
      status: res.status,
      location: h['location'] ?? null,
      server: h['server'] ?? null,
      contentType: h['content-type'] ?? null,
      xRobotsTag: h['x-robots-tag'] ?? null,
      cacheControl: h['cache-control'] ?? null,
      cfRay: h['cf-ray'] ?? null,
      setCookieNames: (h['set-cookie'] ?? '')
        .split(/,(?=[^;,]*=)/)
        .map((c) => c.split('=')[0].trim())
        .filter(Boolean),
      bytes: body.length,
      title: body.match(/<title[^>]*>([\s\S]{0,120}?)<\/title>/i)?.[1].trim() ?? null,
      interstitial: sgCaptcha(res.status, body, h),
      /* A positive signal that the real page was served: the site's own H1 or
         the canonical link. A 200 alone is not evidence of content — that is
         the estate rule this row exists to satisfy. */
      hasCanonical: /<link[^>]+rel="canonical"/i.test(body),
      h1: body.match(/<h1[^>]*>([\s\S]{0,160}?)<\/h1>/i)?.[1].replace(/<[^>]+>/g, '').trim() ?? null,
      error: null,
    };
  } catch (err) {
    row = { ...row, ms: Date.now() - started, status: null, error: String(err.message ?? err) };
  }

  rows.push(row);
  return row;
};

console.log('\nWAF / crawler-reachability probe');
console.log('All crawler user-agents below are SPOOFED — this container is not a verified crawler.\n');

for (const origin of ORIGINS) {
  console.log(`\n=== ${origin.label}  ${origin.origin}  (${origin.stack})`);
  for (const path of PATHS) {
    console.log(`\n  ${path}`);
    for (const agent of AGENTS) {
      const r = await probe(origin, path, agent);
      const verdict = r.error
        ? `ERROR ${r.error}`
        : `${r.status}${r.location ? ` → ${r.location}` : ''}` +
          `  ${r.bytes}B` +
          (r.interstitial ? '  [SG CAPTCHA INTERSTITIAL]' : '') +
          (r.h1 ? `  h1="${r.h1.slice(0, 48)}"` : r.title ? `  title="${r.title.slice(0, 48)}"` : '');
      const mark = r.identityVerified ? ' ' : '~';
      console.log(`   ${mark} ${agent.key.padEnd(22)} ${verdict}`);
    }
  }
}

console.log('\n  ~ = user-agent asserted by this client and NOT verified by reverse DNS.');
console.log('      A 200 on one of those rows means the WAF did not block on the string.');
console.log('      It is not evidence that the real crawler can reach the site.\n');

const jsonAt = process.argv.indexOf('--json');
if (jsonAt !== -1 && process.argv[jsonAt + 1]) {
  fs.writeFileSync(process.argv[jsonAt + 1], JSON.stringify(rows, null, 2));
  console.log(`raw rows → ${process.argv[jsonAt + 1]}\n`);
}

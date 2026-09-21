/**
 * Controlled third-party attribution, by request blocking.
 *
 *   node --experimental-strip-types scripts/perf-matrix.mjs [origin] [runs]
 *
 * WHY THIS EXISTS. The Phase 8 report concluded that third-party scripts
 * caused the deployed regression, and the only evidence offered was a table
 * of transferred bytes per host. Bytes are a correlation. A 500KB script that
 * loads async after onload and a 50KB one that blocks the main thread for
 * 400ms have opposite effects on the numbers people care about, and the byte
 * table cannot tell them apart. This measures instead: same page, same
 * conditions, one variable changed at a time.
 *
 * BLOCKING IS MEASUREMENT-ONLY. `--blocked-url-patterns` refuses the request
 * inside the measuring browser. Nothing is changed on the site, nothing is
 * changed in the GTM container, and the next visitor sees exactly what they
 * saw before.
 *
 * READ THE CONDITIONS CAREFULLY. ClickCease, SearchKings and tctm.co are
 * loaded BY the container, so "GTM blocked" already removes them — it is the
 * ceiling for everything the container costs, not an independent measurement
 * alongside them. Blocking one vendor while the container still loads is what
 * isolates that vendor.
 *
 * WHAT THIS ENVIRONMENT CANNOT TELL YOU. Outbound HTTPS here goes through a
 * proxy that terminates TLS, so every absolute timing includes an extra hop
 * and a re-encryption this site will never pay in the field. Treat the
 * absolute milliseconds as this container's, and the DIFFERENCES BETWEEN
 * CONDITIONS as the finding — both halves of each comparison carry the same
 * proxy overhead, so it subtracts out.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const origin = process.argv[2] ?? 'https://evergreencleaningservice.10xconnections.com';
const RUNS = Number(process.argv[3] ?? 3);
const outDir = path.resolve('.measure', 'matrix');
fs.mkdirSync(outDir, { recursive: true });

const GTM = ['*googletagmanager.com*'];
const SEARCHKINGS = ['*searchkings.ca*'];
const CLICKCEASE = ['*clickcease.com*'];
const TCTM = ['*tctm.co*'];
const TURNSTILE = ['*challenges.cloudflare.com*'];
const FONTS = ['*fonts.googleapis.com*', '*fonts.gstatic.com*'];
const BING = ['*bat.bing.com*'];
const DOUBLECLICK = ['*doubleclick.net*', '*google.com/ccm*', '*google-analytics.com*'];

const CONDITIONS = [
  ['1-normal', []],
  ['2-no-gtm', GTM],
  ['3-no-searchkings', SEARCHKINGS],
  ['4-no-clickcease', CLICKCEASE],
  ['5-no-tctm', TCTM],
  ['6-no-turnstile', TURNSTILE],
  ['7-no-fonts', FONTS],
  [
    '8-no-optional-third-parties',
    [...GTM, ...SEARCHKINGS, ...CLICKCEASE, ...TCTM, ...TURNSTILE, ...BING, ...DOUBLECLICK],
  ],
];

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const round = (n) => (n === null || n === undefined ? null : Math.round(n));

function runOnce(label, blocked, run) {
  const json = path.join(outDir, `${label}-${run}.json`);
  const args = [
    'lighthouse',
    `${origin}/`,
    '--only-categories=performance',
    '--form-factor=mobile',
    '--screenEmulation.mobile',
    '--throttling-method=simulate',
    '--output=json',
    `--output-path=${json}`,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --ignore-certificate-errors',
  ];
  for (const pattern of blocked) args.push(`--blocked-url-patterns=${pattern}`);

  execFileSync('npx', args, { stdio: ['ignore', 'ignore', 'inherit'], env: process.env });
  const lh = JSON.parse(fs.readFileSync(json, 'utf8'));
  const n = (id) => lh.audits[id]?.numericValue ?? null;
  const requests = lh.audits['network-requests']?.details?.items ?? [];

  /* The LCP request, found by matching the LCP element's URL against the
     network log. Reported as start/end so a slow LCP can be told apart from
     a late-DISCOVERED one. */
  const lcpUrl =
    lh.audits['largest-contentful-paint-element']?.details?.items
      ?.flatMap((i) => i.items ?? [])
      ?.map((i) => i.node?.nodeLabel)
      ?.find((v) => typeof v === 'string' && v.startsWith('http')) ?? null;
  const heroReq = requests.find((r) => /business-team-\d+\.(avif|webp|jpg)$/.test(r.url));

  return {
    performance: Math.round(lh.categories.performance.score * 100),
    ttfb: n('server-response-time'),
    fcp: n('first-contentful-paint'),
    lcp: n('largest-contentful-paint'),
    tbt: n('total-blocking-time'),
    cls: lh.audits['cumulative-layout-shift']?.numericValue ?? 0,
    requests: requests.length,
    bytes: n('total-byte-weight'),
    mainThread: n('mainthread-work-breakdown'),
    lcpReqStart: heroReq ? round(heroReq.networkRequestTime) : null,
    lcpReqEnd: heroReq ? round(heroReq.networkEndTime) : null,
    renderBlocking: (lh.audits['render-blocking-resources']?.details?.items ?? []).length,
    longTasks: (lh.audits['long-tasks']?.details?.items ?? []).length,
    lcpUrl,
  };
}

const table = [];
for (const [label, blocked] of CONDITIONS) {
  const runs = [];
  for (let r = 1; r <= RUNS; r++) runs.push(runOnce(label, blocked, r));
  const k = (key) => median(runs.map((x) => x[key]).filter((v) => v !== null));
  table.push({
    condition: label,
    blocked: blocked.length,
    perf: k('performance'),
    ttfbMs: round(k('ttfb')),
    fcpMs: round(k('fcp')),
    lcpMs: round(k('lcp')),
    tbtMs: round(k('tbt')),
    cls: Number((k('cls') ?? 0).toFixed(3)),
    reqs: k('requests'),
    kb: round((k('bytes') ?? 0) / 1024),
    mainMs: round(k('mainThread')),
    lcpStart: round(k('lcpReqStart')),
    lcpEnd: round(k('lcpReqEnd')),
    blockingRes: k('renderBlocking'),
    longTasks: k('longTasks'),
    runsPerf: runs.map((x) => x.performance).join('/'),
  });
  console.log(`  ${label.padEnd(30)} perf ${table.at(-1).perf}  lcp ${table.at(-1).lcpMs}ms  fcp ${table.at(-1).fcpMs}ms  tbt ${table.at(-1).tbtMs}ms`);
}

fs.writeFileSync(path.join(outDir, 'matrix.json'), JSON.stringify(table, null, 2));
console.log(`\n=== controlled third-party matrix — ${origin} — median of ${RUNS} mobile runs ===`);
console.table(table);
console.log(`\nwritten to ${path.join(outDir, 'matrix.json')}`);

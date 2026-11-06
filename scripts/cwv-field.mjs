/**
 * Field Core Web Vitals for www.evergreencleaningservice.ca, from the
 * Cloudflare Web Analytics beacon the zone already injects at the edge.
 *
 *   npm run cwv:field                                   # last 28 days
 *   npm run cwv:field -- --days 7
 *   npm run cwv:field -- --since 2026-10-31 --until 2026-11-06T15:05Z
 *   npm run cwv:field -- --days 6 --compare-at 2026-11-06T15:05Z  # only while unsampled
 *   npm run cwv:field -- --json > cwv.json
 *
 * WHY. ACTION-PLAN item 26 (6 Nov 2026 audit) asked for field LCP, INP and
 * CLS. The PageSpeed report had no CrUX data for the origin and there is no
 * Search Console access, but Cloudflare's Web Analytics beacon, injected at
 * the edge, already reports vitals from real visits, in the browsers that
 * support those measurements. This reads them. It is
 * read-only: one GraphQL query per six-day window, nothing written anywhere.
 *
 * Needs CF_API_TOKEN with Account Analytics read on the Evergreen account.
 * The token goes into the Authorization header and nowhere else; error
 * messages are scrubbed of it in case an upstream message ever echoes it.
 *
 * EXIT CODES. 0 whenever a report is printed, however poor the vitals: this
 * is a measurement, not a gate, and a gate on a handful of beacons would flap.
 * 1 on an API or authentication failure. 2 on bad arguments.
 *
 * The logic lives in `scripts/lib/cwv-field.mjs` and is tested in
 * `tests/tooling/cwv-field.test.ts` against fixture responses.
 */
import { main } from './lib/cwv-field.mjs';

const code = await main({
  argv: process.argv.slice(2),
  env: process.env,
  fetchImpl: globalThis.fetch,
  stdout: (s) => process.stdout.write(`${s}\n`),
  stderr: (s) => process.stderr.write(`${s}\n`),
});
process.exitCode = code;

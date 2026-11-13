# CSP review: report-only to enforced? (report item 10)

13 Nov 2026 (comparison with impact.ca). Scope: `public/_headers`, `src/lib/csp-report.ts`, the Worker log, and a browser check of the built pages.

## Decision: NOT enforced

The full policy stays `Content-Security-Policy-Report-Only`. The task's rule is to enforce only if the violation reports are clean, and **the reports could not be read**:

- The Worker log holds them (observability is on with `logs.persist: true`), but the API token has no Workers Observability access. The query endpoint answered `403` with `workers_observability.api.error.authentication.no_access_to_workers_observability`. This is the same gap the 11 Nov review hit.
- Reports **are** arriving. Zone analytics, which the token can read, shows **41 report POSTs to `/api/csp-report` in the last 7 days**. They are still arriving on 12 and 13 Nov, after the 11 Nov `img-src` widening went live. The contents of those reports are unknown, so "clean" cannot be claimed.

The browser check found **zero violations** on all seven pages with the full policy enforced (below). That is good evidence, but it is one headless Chromium on one network. It cannot stand in for 41 real-visitor reports nobody has read.

## 1. The logs

### What was tried (read-only: GETs and query POSTs only, no setting changed)

| Call | Result |
|---|---|
| `GET /accounts` | Account `47a8…cd05c` found |
| `GET /user/tokens/verify` | Token active |
| `POST /accounts/{id}/workers/observability/telemetry/query` (7 days, `$metadata.service = evergreencleaningservice`, needle `csp-violation`) | **403 Forbidden** |
| `POST /accounts/{id}/workers/observability/telemetry/keys` | **403**, `no_access_to_workers_observability` |
| `GET /accounts/{id}/workers/scripts/evergreencleaningservice/settings` | 200: observability enabled, logs persisted, head sampling 1 (every request logged) |
| `GET …/scripts/evergreencleaningservice/tails` | 200, no tails. A live tail was **not** opened: creating one is a write. |
| GraphQL `httpRequestsAdaptiveGroups`, path `/api/csp-report`, 7 days | 200 (counts below). The referrer dimension is not available on this plan, so the pages that sent the reports are unknown. |

### Report traffic, 7 days to 13 Nov 2026 18:28 UTC (www host only)

| Date (UTC) | POST → 204 | GET → 405 |
|---|---|---|
| 7 Nov | 5 | |
| 8 Nov | 1 | |
| 9 Nov | 2 | |
| 10 Nov | 4 | |
| 11 Nov | 5 | |
| 12 Nov | 6 | 2 |
| 13 Nov | 18 | |
| **Total** | **41** | 2 |

By browser: Chrome 34, Chrome Mobile 3, Firefox 2 (+2 GETs), Chrome Headless 1, Android WebView 1.

What this does and does not show:

- One POST is not one violation. A Reporting API (`report-to`) POST can carry several, and a single page view can send more than one POST.
- The 13 Nov spike (18) fits audit and crawler sessions run that day, including impact.ca comparison work. Only one is labelled headless, though, so real visitors cannot be ruled out.
- The two Firefox GETs (405) are not reports. They are someone opening the URL.
- **Grouping by effective-directive and blocked-uri host, and separating noise from real resources, could not be done.** Those fields exist only in the log lines (`csp-violation {"page","directive","blocked","source"}`, written by `src/lib/csp-report.ts`).

### What is needed to finish this

One of these:

1. **A token with Workers Observability read access** for the account, then rerun the query with `csp-log-query.py` in this folder: `python3 csp-log-query.py 7 events csp-violation`. It reads `$CF_API_TOKEN` and makes a query POST only. The query body:
   ```json
   {"queryId":"csp-review","timeframe":{"from":<ms>,"to":<ms>},"view":"events","limit":100,
    "parameters":{"datasets":["cloudflare-workers"],
      "filters":[{"key":"$metadata.service","operation":"eq","type":"string","value":"evergreencleaningservice"}],
      "needle":{"value":"csp-violation","isRegex":false,"matchCase":false}}}
   ```
2. **Or someone with dashboard access** opens Workers & Pages → evergreencleaningservice → Observability → Events, searches `csp-violation` over the last 7 days, and exports the results.

Then group by `directive` and the host of `blocked`. Treat as noise: `chrome-extension://`, `moz-extension://`, `safari-web-extension://`, `about`, `inline` from `source` files the site does not serve, and hosts no page or GTM tag uses. Anything left that is a real site or Google resource gets added to the policy first, with evidence. If nothing real is left, apply the change in section 2.

## 2. Enforcement, prepared but not applied

### How `_headers` rules combine

On Workers static assets, every rule whose path matches is applied. If two matching rules set the **same** header, the values are **joined with a comma**, not replaced. The repo already notes this for Content-Type in `public/_headers`. A comma-joined `Content-Security-Policy` is two policies, and the browser enforces both: their intersection.

Today, exactly one rule (`/*`) sets `Content-Security-Policy` (the four-directive baseline), and the same rule sets `Content-Security-Policy-Report-Only`. No other rule sets either header. The `/`, `/*/`, `/_astro/*`, `/fonts/*` and `/video/*` rules set other headers only.

### The change, once the logs are clean

In the `/*` rule, delete the baseline `Content-Security-Policy:` line and rename `Content-Security-Policy-Report-Only:` to `Content-Security-Policy:`. Keep `Reporting-Endpoints` as it is. The full policy already contains the four baseline directives (`frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'`) and `report-uri /api/csp-report; report-to csp`. The result is one enforced policy per path that keeps reporting.

A separate report-only copy is not worth keeping once enforced. It would only report the same violations twice. Keep one only to trial a **stricter** policy later, for example after the GTM audit (H2) removes `'unsafe-eval'`.

Also update in the same change:

- `tests/csp-policy.test.ts`: read the enforced policy instead of the report-only one.
- The `src/lib/csp-report.ts` header comment.

The test added today, "exactly one enforced CSP line", already guards against the double-header mistake.

### Worker-served pages get the same headers

Corrected 13 Nov 2026 (comparison with impact.ca). An earlier draft of this section said the HTML the Worker renders gets no `_headers` rules and is sent with no CSP. That was wrong, and no `src/worker.ts` change is needed. Adding one would send a second `Content-Security-Policy`, which the browser would intersect with the first.

The Worker builds these pages from `env.ASSETS.fetch()`, and that response already carries the `_headers` rules for its path:

- **The `/insights/` list and the live-post shell** go through `rebuilt()` in `src/lib/admin/live-posts.ts`. It copies the asset's headers. It drops `content-length`, `etag`, `last-modified` and `content-encoding`, and sets `content-type`, `cache-control` and, off production, `x-robots-tag`. The CSP headers pass through unchanged.
- **The admin sign-in and admin pages** go through `withHeaders()` in `src/lib/admin/api.ts`, which keeps the asset's headers and adds the admin security headers.

Checked live on 13 Nov 2026 with `curl -sI`:

| URL | Worker ran first? | `Content-Security-Policy` | `Content-Security-Policy-Report-Only` |
|---|---|---|---|
| `/insights/` | yes: in `run_worker_first`, and it carries `rebuilt()`'s `cache-control: public, max-age=0, must-revalidate` | the four-directive baseline | the full policy |
| `/admin/sign-in/` | yes: `cache-control: no-store` from the admin headers | the four-directive baseline | the full policy |

A live post at `/<slug>/` uses the same `rebuilt()` path as `/insights/`. It was not curled, because none could be picked out from outside without the database. So the change above reaches these pages without any Worker change.

**What was not checked.** A few Worker responses are built from scratch with `new Response()` and carry no CSP:

- `deniedPage()` in `src/lib/admin/api.ts`: the small admin HTML page for 401, 403 and 503. It loads no scripts, uses inline styles only, and already sends `x-frame-options: DENY`. It shows only when the admin is not set up or the account may not open it, so it was not triggered here.
- The admin JSON and CSV responses and the sign-in redirect (`302`), also in `src/lib/admin/api.ts`. They are not rendered as pages.
- The `/api/csp-report` replies (`204`, `405`) in `src/lib/csp-report.ts`. They have no body.

Only `deniedPage()` is HTML. Giving it the baseline `frame-ancestors`, `base-uri`, `form-action` and `object-src` would be a small hardening step, separate from item 10. It is optional, and it does not block enforcement.

## 3. Browser check (`csp-browser-check.js`)

Run on 13 Nov 2026 against a fresh build (`npm run build`). Chromium (Playwright, headless) loaded `https://www.evergreencleaningservice.ca/**` from `dist/`, with the full policy sent as an **enforced** `Content-Security-Policy` on every HTML response. Each page was scrolled, then had a form field focused and typed into. Collect and pixel hits were aborted. `/api/*` was answered locally, so no lead was sent and no report reached the live log.

| Page | Violations | Console CSP errors | Third-party hosts requested |
|---|---|---|---|
| `/` | 0 | 0 | ad.doubleclick.net, fonts.gstatic.com, googleads.g.doubleclick.net, img.evergreencleaningservice.ca, www.google-analytics.com, www.google.com, www.googleadservices.com, www.googletagmanager.com, www.gstatic.com |
| `/office-cleaning/` | 0 | 0 | the same, without ad.doubleclick.net |
| `/locations/mississauga/` | 0 | 0 | the same, without ad.doubleclick.net |
| `/request-a-quote/` | 0 | 0 | the same, without ad.doubleclick.net |
| `/lp/commercial-cleaning-quote/?gclid=test` | 0 | 0 | the same as `/` |
| `/how-often-should-an-office-be-cleaned/` (blog) | 0 | 0 | the same as `/`, without fonts.gstatic.com |
| `/reviews/` | 0 | 0 | the same, without ad.doubleclick.net |

**Total: 0 violations.** Hits aborted (CSP is checked before a request is sent, so aborting cannot hide a violation):

- `www.google-analytics.com/g/collect`
- `www.google.com/ccm/collect`
- `www.google.com/rmkt/collect/…`
- `www.googleadservices.com/pagead/conversion/…/wcm`
- `www.googleadservices.com/pagead/set_partitioned_cookie`
- `googleads.g.doubleclick.net/pagead/viewthroughconversion/…`

**Control run.** The same pages under a deliberately narrow policy (`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`) produced **66 violations**, so the listener does catch them.

Limits of the check:

- It is one headless Chromium. Safari and Firefox were not run.
- The Cloudflare Web Analytics beacon is injected at the edge, not in `dist/`, so it was not exercised. The policy allows `static.cloudflareinsights.com` (script) and `cloudflareinsights.com` (connect).
- Redirect targets behind the aborted hits were not followed.

Rerun from the repo root after a build:

```
node evergreencleaningservice.ca-audit/comparison-impact-2026-11-13/csp-browser-check.js --out results.json
```

## 4. Image host cache (report only, nothing changed)

`curl -sI https://img.evergreencleaningservice.ca/images/evergreen-modern-commercial-cleaning-hero-og.jpg` returns:

```
cache-control: public, max-age=2592000, s-maxage=31536000
cf-cache-status: HIT
```

That is 30 days in the browser and a year at the edge. The repo controls this header: `scripts/b2-sync.mjs` sets `CACHE_CONTROL` per file at upload (`X-Bz-Info-b2-cache-control`), and it reaches an existing object only when that object is re-uploaded.

**Recommendation: keep 30 days for now.** The image names are descriptive, not content-hashed (for example `office-backpack-vacuum-toronto-480.avif`). A photo replaced under the same name would stay stale in a returning visitor's browser for up to a year, and a Cloudflare purge cannot clear browser caches. A year is safe only if the team commits to a new file name for every changed image (for example a `-v2` suffix, or a short hash added by `b2-sync.mjs`). Any longer lifetime should come with `immutable`, and that commitment should come first. The gain from 30 days to a year is small: it helps only visitors returning after more than a month.

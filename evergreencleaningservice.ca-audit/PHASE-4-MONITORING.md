# Phase 4: Monitoring and Measurement

6 November 2026, after the Phase 1–3 and GEO deploys. Measured from this environment with read-only access: Cloudflare's GraphQL analytics and zone settings, Lighthouse 12.8.2 in headless Chromium, and the live site. Nothing in Cloudflare was changed; nothing was submitted to any external service.

## Summary

- **Real visitors already pass all three Core Web Vitals, with a wide margin.** Cloudflare Web Analytics has been collecting field data all along (the audit thought there was none). In the 5.8 days before the Phase 1 deploy, human traffic only: p75 LCP 0.90 s, INP 24 ms, CLS 0.001, against Google's 2.5 s, 200 ms and 0.1. Mobile LCP 0.94 s.
- **There is no field before/after for the Phase 1 performance work yet.** In the first 4.6 hours after the deploy there were zero human beacons. The site gets roughly 5 mobile beacons a day, so a real comparison needs 2–4 weeks. The clean "before" window has been saved; the "after" should be measured on or around 12 November (procedure below).
- **The lab gain on the mobile homepage is real but narrower than forecast.** Median of 5 runs: performance 87 (was 51), simulated LCP 2.4 s (was 6.8 s), italic font no longer fetched. But the Google tags still run in the lab window and still block the main thread for about 500–600 ms on every mobile page; the audit's forecast of 100–300 ms total blocking time did not happen.
- **The Cloudflare layer is crawler-friendly.** robots.txt is served byte-for-byte from the repo, real AI crawlers received only 200s in the last 24 hours, and nothing at the Cloudflare layer blocks search or AI crawlers. Several bot settings could not be read with this token and need a dashboard check.
- **Five pieces of monitoring tooling were built, reviewed adversarially and merged:** honest sitemap dates, absolute review dates, IndexNow on deploy, an SEO drift monitor with a production baseline, and a field-vitals report.

## 1. Field Core Web Vitals (real visitors)

Source: Cloudflare Web Analytics beacons, read with `npm run cwv:field`. Google's own assessment uses CrUX, which has no data for this origin at this traffic level; the thresholds are the same, the population differs.

| Window (human traffic) | Beacons | p75 LCP (95% CI) | p75 INP (95% CI) | p75 CLS (95% CI) |
|---|---|---|---|---|
| Before Phase 1: 31 Oct 20:00 → 6 Nov 15:05 UTC, unsampled | 122 | 0.90 s (0.72–1.15) | 24 ms (8–56) | 0.001 (0–0.012) |
| — mobile | 31 | 0.94 s (0.72–1.10) | 24 ms (0–488, 18 samples) | 0.000 |
| — desktop | 91 | 0.87 s (0.55–2.15) | 32 ms (8–64) | 0.003 |
| After Phase 1: first 4.6 hours | 0 | — | — | — |

The baseline window starts at 20:00 UTC on 31 October on purpose: the five hours before it held a burst of 69 Chrome/Windows beacons from Canada (about a third of the week), which looks like the site's own testing. It is saved in `docs/growth/cwv-baselines/2026-11-06-phase1-before.json`, because Cloudflare returns any window older than about seven days only as a 1-in-10 sample.

Traffic context: about 1,700 page loads and 300 web-vitals beacons in the last 30 days; about 22% of beacons are headless Chrome (bots), excluded by default. Only one page had a p75 outside "good" in the baseline week: `/contact-us/`, LCP 2.54 s from 7 beacons, too few to call.

**To judge Phase 1 in the field:** on or after 12 November, run

```bash
npm run cwv:field -- --since 2026-11-06T15:05Z --json > after.json
```

and compare its intervals with the saved baseline. Overlapping intervals are not evidence of a change. With this volume, a lab-sized improvement may not show at all; that is a limit of the traffic, not a result. Then repeat at about 28 days.

## 2. Lab re-measure (Lighthouse, median of 5, mobile unless stated)

| Page | Performance (was) | Simulated LCP | TBT (was) | Third-party blocking (was) |
|---|---|---|---|---|
| Home | **87** (51) | 2.4 s (6.8 s) | 425 ms (1,316) | 532 ms (1,345) |
| Home, desktop | 99 (97) | 0.89 s (1.17 s) | 43 ms (42) | 74 ms (83) |
| /services/office-cleaning/ | 88 (88) | 1.56 s (1.59 s) | 450 ms (453) | 610 ms (639) |
| /how-often-should-an-office-be-cleaned/ | 89 (86, different post) | 1.41 s | 431 ms (536) | 585 ms (654) |
| /locations/mississauga/ | 85 (83) | 2.20 s (2.43 s) | 522 ms (587) | 578 ms (591) |

SEO 92, accessibility 100 and best practices 79 on every page, unchanged. The SEO point loss is the two `Content-Signal:` lines in robots.txt; best practices is the Google Ads view-through cookie.

How to read it:

- **The homepage gain is mostly the simulated LCP.** Before, gtm.js was requested at 0.49 s, ahead of the hero, so its bytes and CPU were counted into the simulated LCP. Now it starts after the load event. The italic font is gone (−50.6 KB).
- **The TBT drop on the homepage is partly run conditions.** The baseline ran on a slower CPU (benchmark 1,899 vs about 2,500 now); the one slow-CPU run today gave TBT 1,062. Inner pages, where the CPU matched, show essentially no TBT change.
- **The deferral is shorter than its comment said.** `requestIdleCallback` fires within milliseconds of `load` on an idle page, so gtm.js loaded 4–27 ms after the load event in all 25 runs; the 4-second ceiling never applies. The code comment in `src/components/GoogleTagManager.astro` has been corrected. The measurement cost is correspondingly small: only visitors who leave before the page has loaded, without touching it, go unrecorded. Removing more of the tags' 400–600 ms of main-thread work would need a longer fixed delay, which loses more short visits from GA4 and Ads: the Ads owner's decision.
- **New since the baseline:** about 23 KB on inner pages from the scroll-in reveal (#81/#82) and the video orb now loading inside the trace window, and a desktop homepage CLS of 0.014 from `section#services` (still well under 0.1, worth a look).

## 3. Cloudflare configuration (read-only)

Free plan. www is served by the Worker on its own custom domain, so zone features that rewrite HTML do not reach it.

| Area | Finding |
|---|---|
| robots.txt | Live file matches `public/robots.txt` byte for byte, so Cloudflare's managed robots.txt is off. |
| AI crawlers, last 24 h | ClaudeBot, GPTBot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, CCBot, Amazonbot, Bytespider and meta-externalagent all received 200s; no 403 or 429. "Block AI bots" is therefore very likely off (inferred; the setting itself is not readable). |
| 403s, last 7 days | WordPress probe paths (wp-config.php, wp-login.php, wp-json) and a few browser requests to `/`: the free managed ruleset and browser check at work, not crawler blocking. |
| Helps | always_use_https with 301; apex → www 301 keeping path and query; HTTP/3; Brotli (HTML served as zstd); images cached 30 days in the browser and a year at the edge; Rocket Loader and minify off. |
| Neutral or small risk | browser_check on and security level medium (crawlers are normally exempt); SSL mode "full" rather than "full (strict)" and minimum TLS 1.0 (security hygiene, not SEO). |
| Not active on www | The Cloudflare Web Analytics beacon does not appear in the live HTML (the Worker serves it), yet beacons arrive, so collection is configured some other way; email obfuscation is on at zone level but does not touch www. |

**The token has edit permissions** (zone settings, WAF, DNS, Workers, cache purge). Nothing was changed, but a separate read-only token would be safer for monitoring.

**Needs a dashboard check** (the token cannot read it): Security → Bots (Block AI bots, Bot Fight Mode, AI Labyrinth, AI Crawl Control), the managed and custom WAF rules, rate limiting, and the Web Analytics site configuration.

## 4. Tooling built (merged, 1,067 tests passing)

| Tool | What it does | Run |
|---|---|---|
| Honest sitemap dates | Each URL's `lastmod` (and its `WebPage.dateModified`) now comes from its own content: content files for services and industries, a per-location `updated` field, hub dates from their own text. A test fails if any sitemap URL lacks a `lastmod`, if one is in the future, or if all location pages share one date. | Automatic at build |
| Absolute review dates | Review cards show "September 2026" in a `<time>` element instead of "N months ago", which went stale between builds. The three reviews Google dated only roughly read "around …". | Automatic at build |
| IndexNow | A public key file and a post-deploy step that submits sitemap URLs changed in the last 3 days to IndexNow (Bing, and through it Copilot and ChatGPT search). Non-fatal: it can never fail a deploy. Not yet called for real. | Last step of `npm run deploy`; `npm run indexnow -- --dry-run` to preview |
| SEO drift monitor | Records title, description, robots, canonical, H1s, schema types, og:image, word count and a content hash for every sitemap URL plus four must-stay-noindex pages; compares later and exits 1 on anything critical (a page losing 200, gaining noindex, changing canonical, leaving the sitemap). Baseline captured from production on 6 Nov. | `npm run seo:drift`; `npm run seo:baseline` to re-record |
| Field vitals report | Real-user p75 LCP, INP and CLS from Cloudflare, sitewide, by device and by page, with 95% intervals where the data supports one; `--compare-at` for before/after. | `npm run cwv:field` (needs `CF_API_TOKEN`) |

Each was built in its own worktree and reviewed by an adversarial reviewer that re-ran the tests. Four reviews raised blocking findings, all fixed: a review date shown as exact when Google gave only "8 weeks ago"; two hub pages still dated by a styling commit; the drift monitor raising false criticals against staging; and the field baseline including the 31 October testing burst.

## 5. Schedule

| When | What | Who |
|---|---|---|
| By 7 Nov 20:00 UTC | Nothing: the clean field baseline is already saved. | — |
| First production deploy with this branch | Check Bing Webmaster Tools shows the IndexNow key verified (the first submission may return 202 while it is checked). | Account owner |
| ~12 Nov | `npm run cwv:field -- --since 2026-11-06T15:05Z --json > after.json`; compare with the baseline. Then re-check at ~28 days. | Developer |
| ~12 Nov | Two weeks of CSP reports since 29 Oct: read the Worker's `/api/csp-report` log and, if clean, switch the full policy from report-only to enforcing. | Developer |
| Every deploy | `npm run seo:drift` after the deploy; investigate any CRITICAL. | Developer |
| One week after the Phase 1 deploy | Compare GA4 page views and Ads conversions with the previous week (the GTM change). | Ads / GA4 owner |
| Quarterly | Re-run the full audit; re-record the drift baseline after intended changes. | — |

## 6. Needs account access (cannot be done from here)

- **Search Console:** the "Search generative AI" control reads "include"; query distribution for "commercial cleaning Toronto" across the homepage, the commercial pillar and the downtown page after the anchor fix; impressions by city before building more location pages.
- **GA4 and Google Ads:** the week-on-week check above; the `generate_lead` key event with the first real lead.
- **Bing Webmaster Tools:** verify the property, submit `sitemap-index.xml`, confirm IndexNow.
- **Cloudflare dashboard:** the bot settings listed in section 3; consider a read-only API token for monitoring.
- **Owner decisions still open:** keep or remove the two `Content-Signal:` lines (Lighthouse SEO 92 vs 100); keep or remove the FAQPage JSON-LD (accurate, no SERP feature since May 2026); whether a longer GTM delay is worth the analytics loss.

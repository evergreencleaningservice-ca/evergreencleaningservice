# Phase 12 — WAF, crawler and launch-readiness audit

2026-09-21. Investigation only. Nothing was deployed, no DNS record was
changed, no Neon branch was created, no analytics or WAF account was touched,
and no production Turnstile key was created.

The SiteGround challenge was **investigated and not bypassed**: no user-agent
was whitelisted, no crawler-specific content was created, and no challenge was
solved, replayed or routed around.

---

## 1. The go/no-go table

The site does not launch until Turnstile, lead notifications and conversion
tracking are all operational. Against that bar:

| # | Blocker | State | Owner | Blocks launch? |
|---|---|---|---|---|
| **B1** | **No production Turnstile key pair.** Staging serves Cloudflare's published test sitekey `1x00000000000000000000BB` — confirmed on the live origin. `npm run build` refuses to produce a production build without a real one (verified: exit 1). | **Open** | Cloudflare account | **Yes** |
| **B2** | **GTM consumes neither conversion event.** The site pushes `lead_form_submission` and `phone_click` into `dataLayer`; container `GTM-5PRC4HBV` has no trigger for either. Cutting over today would report zero form and zero telephone conversions. | **Open** | Agency / GTM | **Yes** |
| **B3** | **Two paid landing pages show a raw HTML entity to visitors.** `/lp/commercial-cleaning/` reads "Free walkthrough **&bull;** No obligation"; `/lp/commercial-cleaning-quote/` reads "FREE QUOTE **&MDASH;** TORONTO & THE GTA" in the hero, above the H1. Both confirmed in a real browser. These are the pages behind paid clicks. | **Open** | This repo — 2 lines | **Yes** |
| **B4** | **All 24 exact-match legacy redirects 404 without a trailing slash.** WordPress answers both spellings today; after cutover the slashless form is a dead link. Measured against the deployed origin. | **Open** | This repo | **Yes** |
| **B5** | **Staging and production share one Neon branch.** 20 rows, all test data, none from production — so nothing is at risk today, but from cutover real leads land where staging writes. Branch creation is not authorised; needs approval, a snapshot and a rollback plan. | **Open, approved in principle** | Decision + Neon | **Yes** |
| **B6** | **Six-hour PITR only.** Free plan. Shorter than a cutover day. A snapshot is a separate explicit action before cutover. | **Open** | Neon | **Yes** |
| B7 | Upload-path map covers 101 archive-derived addresses; any image the Internet Archive never captured 404s. Cannot be enumerated without the live media library. | Open | SiteGround | No — degrades |
| B8 | Neon `main` branch is not protected. | Open | Neon | No |
| B9 | Whether a verified crawler reaches production **cannot be determined from this network**. | **Blocked** | Search Console | No — see §3 |
| **R1** | Lead notification email is **operational**. Verified: the Phase 9 staging lead was delivered from `leads@brandingcentres.com` to `info@evergreencleaningservice.ca`, `reply_to` correctly absent for a phone-only lead. | **Resolved** | — | — |

**Verdict: no-go.** Six blockers, three of which (B3, B4, B5) were found by
this audit. B1 and B2 were already known and remain the two that matter most —
a launch without them is a site that cannot prove it works.

---

## 2. Production versus staging: the WAF comparison

`npm run waf:probe` — 4 paths × 7 user-agents × 3 origins, GET, read-only.

| Origin | Every request |
|---|---|
| `www.evergreencleaningservice.ca` | **HTTP 202**, `sg-captcha: challenge`, ~170 B interstitial |
| `evergreencleaningservice.ca` | identical |
| `evergreencleaningservice.10xconnections.com` | **HTTP 200**, the real page |

Production returned the interstitial for **every** path tested — including
`/robots.txt` and `/sitemap_index.xml` — and for every user-agent: desktop
Chrome, iOS Safari, Googlebot desktop, Googlebot smartphone, bingbot,
AdsBot-Google, and no user-agent at all. Responses differed only by a byte or
two of nonce.

### What the challenge is actually keyed to

The interstitial body:

```
<meta http-equiv="refresh" content="0;/.well-known/sgcaptcha/?r=%2F&y=ipr:160.79.106.136:1790010375.869">
```

`ipr:` is followed by **this container's own egress IP**, and the value
changed across consecutive requests (`…136`, `…130`, `…129`) exactly as the
agent proxy rotated egress. That is direct evidence, not inference: the
challenge is an **IP-reputation** decision about the requesting address, and
it is a property of this network rather than of the site.

The response also carries **`x-robots-tag: noindex`**. Anything served the
interstitial is told not to index the page.

### The trap this created, and the tool that now refuses it

`npm run verify:indexing -- production` previously read the interstitial and
emitted **14 confident failures** — missing canonicals, landing pages not
noindexed, an empty sitemap. Every one was false; none was about the site.

The script now detects the challenge and refuses to report at all, exiting 3
with an explanation. A tool that cannot see the site must say so rather than
invent findings.

---

## 3. Spoofed user-agents are not crawler evidence

Every crawler row in the probe is a **string this client asserted**. A WAF
verifies a crawler by forward-confirmed reverse DNS on the connecting IP
(Googlebot: `*.googlebot.com` / `*.google.com`) or by Google's published
ranges. This container's egress resolves to none of those.

So the probe's output supports exactly one conclusion and not its neighbour:

- **Supported:** the WAF does not block on the user-agent string alone — all
  seven agents were treated identically.
- **Not supported:** that Googlebot, bingbot or AdsBot can or cannot reach
  production. A 202 in a spoofed row is not a crawler being blocked, and a 200
  would not have been a crawler being allowed.

Every row in the probe output is marked `~` for this reason.

**Answering it properly requires Search Console's URL Inspection**, which
fetches from a verified Googlebot address. That needs an account this session
does not have — **B9, blocked**.

The question also has an expiry date: after cutover, Cloudflare Workers serves
the site and SiteGround's WAF leaves the path entirely.

---

## 4. URL, redirect and migration parity

`npm run parity` against the deployed staging origin — **60 of 60 passed**.

| Group | Checked | Result |
|---|---|---|
| Section 2.1 specification map | 10 | all 301, correct target, target 200 |
| Legacy addresses from the archive | 13 | all 301 |
| WordPress upload paths | 11 sampled of 101 | all 301 |
| News pagination | 3 | all 301 |
| Wildcards | 3 | all 301 |
| Live pages that must answer directly | 13 | all 200 |
| Classes the dossier recorded as dead | 7 | all resolve |

Every redirect is a real HTTP 301, not a meta refresh, and every target
answers 200 — a 301 into a 404 is still a dead address, so both halves are
asserted.

### B4 — the slashless gap

Measured separately, against the deployed origin:

```
0 survive slashless, 24 return 404, of 24 exact-match rules.
```

`_redirects` matches a path exactly, so `/office-cleaning/` does not match
`/office-cleaning`. WordPress 301s the slashless form onto the slashed one
today, so those links work now and stop working at cutover. Splat rules
(`/blog/*`, `/tag/*`, `/author/*`) are unaffected.

Lost addresses include `/office-cleaning`, `/commercial-cleaning`,
`/industrial-cleaning`, `/blog`, `/feed`, `/testimonials` and
`/submit-your-testimonial` — the legacy service URLs with the most years to
accumulate links.

**Fix:** emit both spellings for every exact-match rule in
`scripts/redirects.mjs`. 24 extra lines in a file that already holds 130 and
is nowhere near Cloudflare's limit. Not applied — Phase 12 is investigation
only.

### Three findings that were my own errors, not the site's

Recorded because a confident wrong answer that looks like a finding is worse
than no answer:

1. **`/blog/*` reported as redirecting to a 404.** The probe used an invented
   slug, so the rule correctly redirected to a page that does not exist. Fixed
   to use real slugs read from the content collection.
2. **`/testimonials/` reported as a failure for returning 301.** It is
   deliberately a legacy redirect to `/reviews/`; the assertion list was
   wrong.
3. **Two DNS "resolver disagreements".** One was TXT quoting (dns.google
   returns SPF bare, Cloudflare wraps it in quotes); the other was a rotating
   CDN A-record pool — the *same* resolver returns different four-address
   subsets on consecutive queries. Both comparisons now normalise. Hand-checked
   before either was reported.

A fourth: `npm run tel:inventory` displays `paid_header` as
`Call(416) 803-4880`. Rendered in a browser, the two spans are
`flex-direction: column` and stack vertically. **Not a defect** — a
`textContent` artifact of the inventory script. The `phone_click` event reads
the number correctly through it.

---

## 5. DNS and registry

`npm run dns:snapshot` — two public resolvers plus CIRA's RDAP, agreeing.

| | |
|---|---|
| Registrar | Go Daddy Domains Canada, Inc |
| Registered / expires | 2016-08-26 / **2027-08-26** |
| Registry status | `client update prohibited`, `client transfer prohibited`, `client delete prohibited` |
| Nameservers | `ns1.siteground.net`, `ns2.siteground.net` — registry and resolvers agree |
| A (apex and `www`) | rotating pool, 8 Google Cloud addresses, **TTL 30 s** |
| MX | `mx10/20/30.antispam.mailspamprotection.com`, TTL 21 600 s |
| SPF | `v=spf1 +a +mx +ip4:35.209.221.162 include:…dnssmarthost.net ~all` |
| DMARC | **`p=reject`** |
| `mail`, `autodiscover`, `ftp` | `35.209.221.162` |
| CAA / AAAA | none |

Three consequences:

- **The 30-second A-record TTL is the single best fact in this report.** Cut
  over inside the SiteGround zone and both the switch and the rollback take
  about thirty seconds. Moving nameservers instead makes rollback a six-hour
  operation.
- **DMARC `p=reject` makes the sender choice load-bearing.** Notification mail
  is sent from `leads@brandingcentres.com`, a verified Resend domain, so
  alignment holds. Sending from `@evergreencleaningservice.ca` would fail —
  that domain is not in Resend at all.
- **The registry lock must be confirmed editable before the window opens.**

Full runbook: `docs/dns-cutover-runbook.md`.

---

## 6. Preconditions

### Turnstile — **not operational (B1)**

Staging serves `1x00000000000000000000BB`, Cloudflare's published test key,
confirmed on the live origin. No production pair exists; the API token in this
environment has no Turnstile permission. `npm run build` refuses to build for
production without a real key — verified, exit 1. The Worker additionally
refuses the published test secrets on a production hostname.

### Resend — **operational (R1)**

The only precondition this audit closed rather than opened.

| | |
|---|---|
| Sending domain | `brandingcentres.com`, **verified** — the house shared sender |
| From | `Evergreen Website <leads@brandingcentres.com>` |
| To | `info@evergreencleaningservice.ca` |
| Last send | 2026-09-21 11:48:45 UTC, **delivered** |
| `reply_to` | correctly **absent** — the lead carried a phone and no email |

This is the Phase 9 closeout fix confirmed on a real delivery, not a stub.
`TESTING.md` claimed Resend had never been configured; that claim was stale
and has been corrected.

Not covered: bounces, suppressions and rate limits. The Worker logs a Resend
rejection to `console.error` and nowhere a person will see it. Worth an alert
before launch.

### Database — **shared (B5), thin recovery window (B6)**

One Neon branch, `main`, not protected (B8). 20 rows, max id 20, oldest
2026-09-18, newest the Phase 9 test lead. 12 rows name the staging host; **0
name a production host** — so there is no production data at risk today.

Free plan: six-hour PITR, 0.5 GiB per branch, 10 branches per org with 1 in
use. Branch creation not authorised.

### Analytics — **B2, and the reason a launch today would measure nothing**

Container `GTM-5PRC4HBV` is present on staging and loads on the staging
hostname by design. It carries Google Ads `AW-16819334998`, GA4 `G-R27QW21PMT`
and Microsoft UET `187178776`.

The site emits `lead_form_submission` and `phone_click`. The container has no
trigger for either. The events are produced and discarded.

CallTrackingMetrics (account 535014) performs dynamic number insertion for
paid arrivals; `phone_click` reads both the displayed and dialled number at
click time, so a swapped number is reported as what the visitor actually saw.

**All account-level analytics checks are blocked** — no access to GTM, Google
Ads, GA4, UET or CallTrackingMetrics. `docs/gtm-handoff.md` §7 is the
container specification and §8 the manual checklist.

---

## 7. Tests, builds, dry run, staging verification

| Check | Result |
|---|---|
| `npm test` | **509 passed, 17 files** |
| `npm run build` (production) | **refuses**, exit 1 — no real Turnstile key. The gate working. |
| `npm run build:preview` | **passes** — 77 pages, 130 redirect rules, 1138 image references repointed |
| `npx wrangler deploy --dry-run` | **passes** — 185 files, 214.16 KiB, `env.ASSETS` bound |
| `npm run verify:indexing -- staging` | **22 of 22 passed** |
| `npm run verify:indexing -- production` | **refuses** (exit 3) — origin served a challenge |
| `npm run parity` | **60 of 60 passed** |
| `npm run tel:inventory` | 115 links, 77 pages, one canonical destination |
| `npm run launch:check` | 7 passed, 5 blocking — 2 deliberate for staging, **3 real** |

Staging is correctly `noindex, nofollow`, canonicals name the final domain,
and all three genuinely-noindex routes are excluded from the sitemap.

---

## 8. Blocked — needs access this session does not have

| Check | Needs |
|---|---|
| Whether a verified crawler reaches production (B9) | Search Console URL Inspection |
| Current index coverage and impressions | Search Console |
| GTM triggers, tags and variables | GTM container access |
| Google Ads conversion actions and final URLs | Google Ads |
| GA4 event configuration | GA4 |
| Microsoft UET | Microsoft Ads |
| CallTrackingMetrics swap rules and numbers | CTM account 535014 |
| WAF rule set and whether crawlers are exempted | SiteGround (not requested) |
| Live `robots.txt`, sitemap, media library, page inventory, `.htaccess` | SiteGround (not requested) |
| Production Turnstile key pair | Cloudflare Turnstile permission |

---

## 9. What Phase 13 needs before it can start

In dependency order:

1. **B3** — two-line copy fix, then rebuild. Smallest and entirely in this repo.
2. **B4** — emit both slash spellings, then re-run `npm run parity`.
3. **B1** — create the Turnstile pair, set the build variable and the Worker
   secret, then prove one real submission on staging with a genuine key.
4. **B2** — build the container per `docs/gtm-handoff.md` §7 and verify both
   events in Tag Assistant against staging.
5. **B5 / B6** — approve database separation, snapshot, then branch.
6. Re-run everything in §7 and re-issue the go/no-go table.

Phase 13 is the final acceptance report and is not started. The site has not
been launched.

---

## 10. New in this phase

| File | What it does |
|---|---|
| `scripts/waf-probe.mjs` | `npm run waf:probe` — WAF comparison; labels every crawler row unverified |
| `scripts/dns-snapshot.mjs` | `npm run dns:snapshot` — two resolvers plus RDAP; normalises TXT quoting and CDN pools |
| `scripts/migration-parity.mjs` | `npm run parity` — every redirect against a deployed origin, both hops |
| `scripts/launch-check.mjs` | `npm run launch:check` — the pre-cutover gate |
| `docs/dns-cutover-runbook.md` | Cutover, rollback thresholds, indexing safeguards, SiteGround follow-ups |
| `scripts/verify-indexing.mjs` | **changed** — refuses to report when served a challenge |
| `TESTING.md` | **corrected** — the stale claim that Resend was never configured |

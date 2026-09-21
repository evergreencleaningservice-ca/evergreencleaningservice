# Phase 12 — WAF, crawler and launch-readiness audit

2026-09-21. Audit `bb2ede0`, corrective closeout `f3ed583`, staging version
`bc76be72-8e51-4eb3-ad21-be433bbbcb23`.

The audit was investigation only. The closeout that follows it fixed the two
defects the audit found in this repository (B3, B4) and deployed them to
**staging only**. No DNS record or nameserver was changed, no Neon branch was
created and no Neon row was altered, and nothing was touched in GTM, Google
Ads, GA4, UET, CallTrackingMetrics, Turnstile, Resend or SiteGround.
Production was not deployed to and has not been launched.

The SiteGround challenge was **investigated and not bypassed**: no user-agent
was whitelisted, no crawler-specific content was created, and no challenge was
solved, replayed or routed around.

---

## 1. The go/no-go table

Updated after the corrective closeout (`f3ed583`, staging version
`bc76be72-8e51-4eb3-ad21-be433bbbcb23`). Each item is classified by what it
actually blocks, because "blocker" alone flattens a deindexing risk and a
reporting gap into the same word.

| # | Blocker | Class | State | Owner | Resolution needed |
|---|---|---|---|---|---|
| **B1** | No production Turnstile key pair. Staging serves Cloudflare's published test sitekey `1x00000000000000000000BB`. | **Launch-blocking** | **Open** | Cloudflare account holder | Create a Turnstile widget for the production hostnames; set `PUBLIC_TURNSTILE_SITE_KEY` at build time and `wrangler secret put TURNSTILE_SECRET`; prove one real staging submission with the genuine pair. |
| **B2** | GTM consumes neither conversion event. The site pushes `lead_form_submission` and `phone_click`; container `GTM-5PRC4HBV` has no trigger for either. | **Launch-blocking** and **paid-media-blocking** | **Open** | Agency (GTM container) | Build triggers, tags and variables per `docs/gtm-handoff.md` §7; verify both events in Tag Assistant against staging; confirm the Ads conversion action fires. |
| ~~**B3**~~ | ~~Raw HTML entity visible to visitors on both paid landing pages.~~ | ~~Paid-media-blocking~~ | **CLOSED** `f3ed583` | — | Evidence in §1.1. |
| ~~**B4**~~ | ~~Exact-match legacy redirects 404 without a trailing slash.~~ | ~~Launch-blocking~~ | **CLOSED** `f3ed583` | — | Evidence in §1.2. |
| **B5** | Staging and production share one Neon branch. 20 rows, all test data, **none from production**. From cutover, real leads land where staging writes. | **Operational risk** — becomes launch-blocking at cutover | **Open, approved in principle** | Paolo (approval) + Neon | Explicit approval, a snapshot, a rollback plan, then a separate production branch and a `DATABASE_URL` per environment. Branch creation remains unauthorised. |
| **B6** | Six-hour PITR only (Neon free plan). Shorter than a cutover day. | **Operational risk** | **Open** | Neon | Take an explicit snapshot before cutover; PITR alone is not a recovery plan for a launch. |
| B7 | Upload-path map covers 101 archive-derived addresses. An upload address the Internet Archive never captured 404s. | Operational risk (SEO/image traffic) | Open | SiteGround access | Reconcile the map against the live WordPress media library. Cannot be enumerated from outside. |
| B8 | Neon `main` branch is not protected. | Operational risk | Open | Neon | Enable branch protection. One setting. |
| B9 | Whether a **verified** crawler reaches production cannot be determined from this network. | Informational — **Blocked** | **Blocked** | Search Console access | URL Inspection from a verified Googlebot address. Moot after cutover: SiteGround's WAF leaves the path entirely. |
| **R1** | Lead notification email. | — | **Resolved** | — | Verified delivered: `leads@brandingcentres.com` → `info@evergreencleaningservice.ca`, `reply_to` correctly absent for a phone-only lead. |

**Verdict: still no-go, and for the two reasons that were always the real
ones.** B1 and B2 are untouched by this closeout and neither is fixable in
this repository — a site that cannot verify a human and cannot report a
conversion should not take a paid click. B5 and B6 are operational risks that
become launch-blocking the moment real leads arrive.

**Launch-blocking:** B1, B2 (and B5 at cutover).
**Paid-media-blocking:** B2.
**Operational risk:** B5, B6, B7, B8.
**Blocked, informational:** B9.

### 1.1 B3 — closed, with evidence

Both strings were props rendered through `{expression}`, and Astro escapes
expression output, so the entity reached the visitor verbatim. Replaced with
literal `•` and `—` in named frontmatter constants.

Verified in Chromium against the **deployed** staging origin at 390 px and
1440 px — not against a local build:

```
/lp/commercial-cleaning/       textContent: "Free walkthrough • No obligation"
/lp/commercial-cleaning-quote/ textContent: "Free quote — Toronto & the GTA"
                               innerText:   "FREE QUOTE — TORONTO & THE GTA"
both: visible: true | raw entities in element: none | anywhere on page: none
```

`npm run launch:check` now reports *"no double-escaped entity in any page"*
across all 77 pages, matching **case-insensitively** — the em dash sits in a
`text-transform: uppercase` element, renders as `&MDASH;`, and the original
case-sensitive detector walked straight past it.

### 1.2 B4 — closed, with evidence

`bothSlashSpellings` in `src/data/redirects.ts` expands every exact-match rule
into both spellings, each pointing at the same final target in one hop.
Wildcards untouched. The map grew 130 → 154.

Verified against the **deployed Worker**:

```
=== B4 — every exact-match source, both spellings, one hop
  50 of 50 variants: 301, correct target, single hop; both spellings agree

=== B4 — query strings survive, both spellings
   ok  /office-cleaning/?gclid=TEST123        301 → /services/office-cleaning/?gclid=TEST123
   ok  /office-cleaning?gclid=TEST123         301 → /services/office-cleaning/?gclid=TEST123
   ok  /commercial-cleaning/?utm_source=…     301 → /services/commercial-cleaning/?utm_source=…
   ok  /commercial-cleaning?utm_source=…      301 → /services/commercial-cleaning/?utm_source=…
   ok  /blog/?page=2                          301 → /insights/?page=2
   ok  /blog?page=2                           301 → /insights/?page=2
   ok  /testimonials?msclkid=abc&utm_term=…   301 → /reviews/?msclkid=abc&utm_term=…
```

`gclid` and `msclkid` surviving matters specifically: these are the addresses
a paid click lands on, and a redirect that drops them breaks attribution on
exactly the traffic that is paid for.

**The arithmetic, corrected.** The original finding said "24 exact-match
rules / 48 variants". There are **26** exact-match rules. Twenty-four are
directory-style and take both spellings — the 48 the finding meant. The other
two, `/sitemap.xml` and `/sitemap_index.xml`, are file addresses with one
legitimate spelling each: **48 + 2 = 50 emitted sources.** The "24" came from
a measurement that filtered on a trailing slash, so it counted the
directory-style rules only. That is the right set for the defect and not the
whole map. A first pass of the fix emitted `/sitemap.xml/` — an address no
server produces and no crawler requests — and that is now explicitly excluded.

Coverage: `tests/build/redirect-variants.test.ts`, 14 tests, asserting the
expansion and the emitted file, including that no wildcard was disturbed and
that every specific rule still precedes the splat it would collide with.
Phase 6's rule-count assertion moved 130 → 154 rather than being relaxed to a
bound — a count that *falls* is a link class going dark, which is what that
test exists to catch.

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

## 5. DNS, registry and the cutover architecture

> **Correction.** The first version of the runbook recommended leaving DNS at
> SiteGround and repointing the A records at the Worker, and called cutover
> and rollback a thirty-second operation. **Both claims were wrong.** A Worker
> Custom Domain requires an *active Cloudflare zone*; Cloudflare creates the
> record itself and it points directly at the Worker, so there is no stable
> address for third-party DNS to target. The partial-zone alternative is real
> but **Business/Enterprise-only**. The 30-second A-record TTL is measured and
> true, and it was never a rollback plan for an architecture that did not
> apply. The runbook is rewritten around the three supported options; see
> `docs/dns-cutover-runbook.md` §0 and §2.

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
| DKIM | `default._domainkey` **CNAME** → `evergreencleaningservice.ca.default.dkim.auto.dnssmarthost.net.` |
| `mail`, `autodiscover`, `ftp` | `35.209.221.162` |
| CAA / AAAA | none |
| **DNSSEC** | **Unsigned** — no DS at the parent, no DNSKEY |
| **Microsoft 365** | **None.** `lyncdiscover`, `sip`, `enterpriseregistration`, `enterpriseenrollment`, `msoid` and the M365 SRV records were each probed and are absent. |

Four consequences:

- **Mail is SiteGround end to end** — `mailspamprotection.com` inbound,
  `dnssmarthost.net` for SPF and DKIM. `autodiscover` is an A record at
  SiteGround's mail IP, not a CNAME to Outlook. A cutover checklist listing
  Microsoft 365 steps for this domain would be describing records that do not
  exist.
- **DKIM is the record most often lost in a provider move**, because the
  selector is provider-chosen and undiscoverable from the apex. This one is
  `default`, and it is a **CNAME into SiteGround's autoconfig** — so it cannot
  be recreated by copying a public key. The target hostname must be reproduced
  verbatim, and it resolves only while the SiteGround mail service exists.
  Combined with `p=reject`, a broken DKIM CNAME means mail is **rejected
  outright**, not filed as spam.
- **DNSSEC is unsigned, which removes a sequencing hazard** — there is no DS
  to withdraw before a nameserver change. Re-verify on the day: it can be
  switched on from a control panel at any time, and moving nameservers with a
  live DS takes the domain dark with SERVFAIL in a way that putting the
  records back does not fix.
- **The registry lock must be confirmed editable before the window opens.**

The 30-second A-record TTL is real, and it is **not** a rollback plan: the
supported architectures all involve a nameserver change, bounded by the
21 600 s NS TTL and realistically by 24–48 h for full convergence.

Full runbook, including the three supported architectures and the
record-by-record rebuild list: `docs/dns-cutover-runbook.md`.

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

Re-run in full after the closeout, against staging version
`bc76be72-8e51-4eb3-ad21-be433bbbcb23`.

| Check | Result |
|---|---|
| `npm test` | **523 passed, 18 files** (+14 for B4 coverage) |
| `npm run build` (production) | **refuses**, exit 1 — no real Turnstile key. The gate working. |
| `npm run build:preview` | **passes** — 77 pages, **154** redirect rules, 1138 image references repointed |
| `npx wrangler deploy --dry-run` | **passes** — 185 files, 214.16 KiB, `env.ASSETS` bound |
| `npm run deploy:preview` | **deployed** — version `bc76be72-8e51-4eb3-ad21-be433bbbcb23`, 230 URLs purged |
| `npm run verify:indexing -- staging` | **22 of 22 passed** |
| `npm run verify:indexing -- production` | **refuses** (exit 3) — origin served a challenge |
| `npm run parity` | **117 of 117 passed** (was 60; +50 variants, +7 query-string cases) |
| B4 — all variants on the deployed Worker | **50 of 50**, single hop, both spellings agree, query strings preserved |
| B3 — browser verification, deployed origin | **passed** at 390 px and 1440 px, both pages, no raw entity |
| `npm run tel:inventory` | 115 links, 77 pages, one canonical destination, exit 0 |
| `npm run launch:check` | **only the 2 deliberate staging blockers remain** — the test key and the staging noindex. B3 and B4 both clear. |

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

B3 and B4 are done. What remains is entirely outside this repository:

1. **B1** — create the Turnstile pair, set the build variable and the Worker
   secret, then prove one real submission on staging with a genuine key.
   *Needs Cloudflare Turnstile permission, which the API token here lacks.*
2. **B2** — build the container per `docs/gtm-handoff.md` §7 and verify both
   events in Tag Assistant against staging. *Needs GTM access.*
3. **B5 / B6** — approve database separation, snapshot, then branch, and give
   production its own `DATABASE_URL`. *Needs explicit approval.*
4. **Decide the DNS architecture** — see the runbook §2. This needs one fact
   nobody here can read: the Cloudflare account plan. Free or Pro means
   Option 1 (move authoritative DNS to Cloudflare) is the only supported route
   to a Worker Custom Domain.
5. Re-run everything in §7 and re-issue the go/no-go table.

Phase 13 is the final acceptance report and is not started. The site has not
been launched. No DNS record, nameserver, Neon branch, Neon row, GTM
container, Ads, GA4, UET, CallTrackingMetrics, Turnstile, Resend or SiteGround
setting was changed by this closeout.

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

### Added by the corrective closeout (`f3ed583`)

| File | What changed |
|---|---|
| `src/pages/lp/commercial-cleaning.astro` | B3 — literal `•` in a named constant |
| `src/pages/lp/commercial-cleaning-quote.astro` | B3 — literal `—` in a named constant |
| `src/data/redirects.ts` | B4 — `bothSlashSpellings`, the central expansion |
| `scripts/redirects.mjs` | B4 — applies it to spec, legacy and pagination rules; wildcards untouched |
| `tests/build/redirect-variants.test.ts` | B4 — 14 tests over the expansion and the emitted file |
| `tests/build/headings-and-links.test.ts` | rule count 130 → 154, pinned not relaxed |
| `scripts/migration-parity.mjs` | all 50 variants and 7 query-string cases against a deployed origin |
| `scripts/dns-snapshot.mjs` | mail/service record inventory (incl. DKIM selectors and M365 probes) and DNSSEC state |
| `docs/dns-cutover-runbook.md` | **rewritten** around the three supported Cloudflare architectures |

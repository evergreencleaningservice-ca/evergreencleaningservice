# Final acceptance and handoff report

**2026-09-21.** Evidence and reporting only. Nothing was launched, no DNS
record or nameserver changed, no Neon branch created and no Neon row altered,
and nothing was touched in GTM, Google Ads, GA4, UET, CallTrackingMetrics,
Turnstile, Resend or SiteGround.

This report **supersedes** the Phase 1–12 reports wherever they disagree with
it. Section 11 lists every claim an earlier report got wrong, so an obsolete
statement cannot survive by being quoted from a file nobody reopened.

---

## 1. Repository and deployment state

| | |
|---|---|
| Branch | `claude/optimistic-clarke-wz1p8g` |
| HEAD | `8c676dc` at the start of Phase 13; see §12 for the report commit |
| Working tree | clean, local and remote in sync |
| Staging origin | `https://evergreencleaningservice.10xconnections.com` |
| Deployed version | **`bc76be72-8e51-4eb3-ad21-be433bbbcb23`**, active at 100%, verified with `wrangler deployments list` **before** any result below was read |
| Production origin | `https://www.evergreencleaningservice.ca` — **still the client's WordPress on SiteGround, untouched** |

### Verification run from this state

| Check | Result |
|---|---|
| `npm test` | **523 passed, 18 files, 0 failed** |
| `npm run build:preview` | **passes** — 77 pages, 154 redirect rules, 1138 image references repointed |
| `npm run build` (production) | **refuses, exit 1** — see below |
| `npx wrangler deploy --dry-run` | **passes** — 185 files, 214.16 KiB (58.29 KiB gzip), `env.ASSETS` bound |
| `npm run verify:indexing -- staging` | **22 of 22 passed** |
| `npm run parity` | **117 of 117 passed** |
| `npm run tel:inventory -- dist` | **115 links, exit 0** |
| `npm run form:a11y` × 3 forms | **40/40 each, 120/120 total** |
| `node scripts/final-crawl.mjs` | 69 URLs — full table in §2 |
| `node scripts/visual-acceptance.mjs` | 16 captures, **0 failures** |

**The production build gate refusing is the gate working, not a failure.**
`scripts/preflight.mjs` exits 1 with:

> `PUBLIC_TURNSTILE_SITE_KEY is not set, so this build would ship the turnstile TEST site key.`

A production build carrying the published test key would accept every bot
submission. The refusal is the single most valuable line of build tooling in
the repository and it cannot be cleared from here — only by issuing a real key
pair (blocker **B1**).

---

## 2. Crawl and SEO — Phase 1 baseline beside the final result

Both columns measured on the **deployed staging origin** by the same
definitions. The baseline is `_research/baseline.md` §1.3 at commit `493cade`.

| Measure | Phase 1 baseline | **Final** | |
|---|---|---|---|
| Sitemap URLs | 69 | **69** | — |
| HTTP status | 69 × 200 | **69 × 200** | — |
| Titles present / unique | 69 / 69 | **69 / 69** | — |
| Descriptions present / unique | 69 / 69 | **69 / 69** | — |
| Canonicals present | 69 | **69** | — |
| Canonicals on the production origin | 69 | **69** | — |
| Canonical matches its own sitemap URL | not measured | **69 of 69** | new |
| **Exactly one H1** | **63 of 69** | **69 of 69** | ✔ fixed |
| Pages with two H1 | 6 | **0** | ✔ fixed |
| Broken internal links | 0 | **0** | held |
| **Internal links through a redirect** | **29 targets** | **0** | ✔ fixed |
| Redirect chains | 0 | **0** | held |
| JSON-LD malformed | not measured | **0** | new |
| `X-Robots-Tag` noindex | 69 of 69 | **69 of 69** | intentional, see below |
| `robots` meta present | 0 | **0** | — |

The six two-H1 pages named in the baseline — four `/insights/` pagination
pages and two blog posts — now carry exactly one each. The 29 redirected
internal links are gone: the two `/services/…-service(s)/` nav links were
repointed, and the 26-link tag cloud was removed along with `/testimonials/`.

### Staging noindex versus production readiness

Every page on staging serves `X-Robots-Tag: noindex, nofollow`. **That is
deliberate and correct**, and it is the only reason Lighthouse SEO scores 69
rather than ~100: the single failing SEO audit is `is-crawlable`.

It also means **staging cannot demonstrate production indexability**. The
build separation is what carries that risk, and it is guarded four ways
(§9.4). `npm run verify:indexing -- production` is the check that settles it,
and it can only be run after cutover.

---

## 3. Redirect migration

| | |
|---|---|
| Total rules in `dist/_redirects` | **154** (was 130 before the B4 fix) |
| Wildcard rules | **3** — `/blog/*` → `/:splat`, `/tag/*` and `/author/*` → `/category/blog/` |
| Exact-match legacy rules | **26** — 24 directory-style + 2 file addresses |
| Emitted sources from those 26 | **50** — 24 × 2 spellings + 2 × 1 |
| Explicit `/wp-content/uploads/` rules | **101** |
| Slash and slashless coverage | **both, for all 24 directory-style rules** |
| One-hop behaviour | **50 of 50** — Location is the final target; following it lands on 200 |
| Query-string preservation | **verified** for `gclid`, `msclkid` and `utm_*`, in both spellings |
| Redirect chains | **0** |
| Final parity result | **117 of 117 passed** against the deployed Worker |

Every redirect is a real HTTP 301, never a 200 carrying a meta refresh.

**The upload map is an allowlist, not a pattern.** `_redirects` cannot take a
basename out of a splat, and the old paths are dated (`/wp-content/uploads/
2021/03/file.jpg`) while this site serves images flat. So the 101 entries come
from the Internet Archive crawl, and an upload address the crawl never
captured answers 404. Reconciling it against the live WordPress media library
needs SiteGround access — open item **O5**.

---

## 4. Content and accessibility

### Corrections made

| Correction | Final verified state |
|---|---|
| **Unsupported claims removed** | No page states a numeric rating, a review count, or a certification the site did not already carry. No rating reaches structured data. Asserted by `tests/build/content.test.ts` and re-verified by crawl: **0 of 69 pages publish `aggregateRating`**. |
| **Star glyphs** | Appear only beside an individually quoted, attributed review — never as a summary rating. |
| **Duration claims** | Every "since"/"years" claim derives from the founding year (1989) rather than a hardcoded figure that goes stale. No page states a years-in-business number, and no page carries both forms of the claim. |
| **Response-time promise** | No page promises a response time the original did not make. The pages that do say "within 2 business hours" are the paid landing pages, where it is the offer. |
| **Homepage H1** | One H1: *"Professional Office & Commercial Cleaning in Toronto"*. Six pages previously carried two H1s; **0 do now**. |
| **Landing-page raw entities (B3)** | `/lp/commercial-cleaning/` now renders `Free walkthrough • No obligation`; `/lp/commercial-cleaning-quote/` renders `Free quote — Toronto & the GTA`. Verified in a browser on the deployed origin at 390 px and 1440 px: **no raw entity anywhere on either page**, and none on any of the 8 categories captured. |

### Image alt audit

Measured across all 69 crawled pages:

| | |
|---|---|
| `<img>` elements | **382** |
| Missing an `alt` attribute | **0** |
| Empty `alt` (explicitly decorative) | **139** |
| Non-empty `alt` | **243** |
| Images not served from the image host | **0** |

Three homepage hero images carry `alt` as a **valueless attribute** — valid
HTML, identical in meaning to `alt=""`, i.e. explicitly decorative. An earlier
version of the crawler matched only `alt="…"` and reported them as missing;
they were not. See §11.

### Accessibility

| | |
|---|---|
| Lighthouse Accessibility, deployed staging, median of 3 | **100** (baseline 87) |
| Lighthouse Accessibility, isolated local build | **100** |
| Failing accessibility audits | **none, in any run** |
| `npm run form:a11y` | **40/40 on each of the three lead forms — 120/120** |

The baseline's four failing audit classes — colour contrast on 32 elements,
heading order on 7, link-distinguished-by-colour, and one touch-target — are
all resolved.

### Mobile control sizing and keyboard

- Every lead-form control meets the 44 px minimum target size; covered by the
  `form:a11y` pass at 390 px.
- **Keyboard verified in a real browser** on all 8 page categories at 390 px
  and 1440 px: the first form control takes focus, and the focused control is
  not obscured by any fixed or sticky element.
- **Sticky bar clearance, hand-measured per control** on
  `/lp/commercial-cleaning/` at 390 px against the deployed origin: every real
  control clears the bar by **356–380 px** when focused, and
  `elementFromPoint` at each control's centre returns the control itself.
- **No horizontal overflow** at 390 px on any of the 8 categories.

### Remaining content risks

1. **Nine pages carry no lead form** — the eight `/locations/*` pages and
   `/services/`. Each location page has three telephone links, so a phone
   conversion path exists, but there is no form path on a page built to rank
   locally. Recorded as an observation; adding one is content work and is
   **not authorised here**.
2. **Entrance animations gate visibility.** Elements carrying `.wow` are
   `visibility: hidden` until an observer fires. On the homepage that includes
   the lead form, ~12,000 px down. It works — verified — but if the observer
   never runs, the content is invisible rather than merely unanimated. Ported
   behaviour from the original; worth revisiting, not a launch blocker.
3. **The header telephone number wraps** at 390 px on the landing-page shell
   (`(416) 803-` / `4880`). Cosmetic, legible, visible in the captures.

---

## 5. Forms and lead handling

Five distinct form implementations are live. All five post to
`/api/submit-lead` and all import `src/lib/lead-submit.ts`, so one pipeline
serves every one of them.

| Form | `data-form-id` | Where | Visible controls | Honeypot |
|---|---|---|---|---|
| Contact | `contact-form-1384` | homepage, `/contact-us/` | 12 | 1 |
| Sidebar quote | `quote-form-1381` | 58 pages | 20 | 1 |
| Short quote | `quick-quote` (DOM id `quote`) | `/request-a-quote/` | 9 | 1 |
| Paid — broad | `ppc-lead-form` | `/lp/commercial-cleaning/` | 9 | 1 |
| Paid — quote | `lp-commercial-cleaning-quote` (DOM id `lpq-form`) | `/lp/commercial-cleaning-quote/` | 9 | 1 |

The two landing-page reporting identities are **deliberately distinct and were
not renamed**: the DOM anchor `lpq-form` and the reporting `form_id`
`lp-commercial-cleaning-quote` are both preserved, so existing `#lpq-form`
links and existing conversion rows still line up.

### Behaviour

| Aspect | State |
|---|---|
| Phone-or-email rule | Either satisfies the form; **neither is individually required**. Proven from six directions in `tests/quick-quote.test.ts` and again server-side in `tests/worker/lead-validation.test.ts`. |
| Client/server agreement | Asserted as one contract: the form and `leadProblems` accept and reject the same inputs — phone-only, email-only, no address, no surname — and the 422 names the field. |
| Honeypot | One clipped, non-visible field per form; excluded from keyboard order and not announced. |
| Turnstile | Invisible, `interaction-only`. **Running on Cloudflare's published TEST key** `1x00000000000000000000BB` — confirmed on the deployed origin. |
| Database | Neon Postgres over HTTP. Columns named and bound explicitly; server-side sanitising before insert. |
| Resend notification | Sent on every stored lead, from `Evergreen Website <leads@brandingcentres.com>` to `info@evergreencleaningservice.ca`. |
| Phone-only `reply_to` | **Omitted entirely** when no email is supplied. Was a real defect (`reply_to: ""`), fixed in the Phase 9 closeout, and confirmed on a genuinely delivered message. |
| Conversion-event timing | Exactly one `lead_form_submission`, pushed **after** the endpoint confirms the store, with `eventCallback`/`eventTimeout` protecting delivery across the redirect. |
| Thank-you page | `/thank-you/` — `noindex`, out of the sitemap, carries the telephone number and a route home. A reload, a direct visit, a back-button return and a resubmit each produce **zero** additional conversions. |
| Failure paths | A 4xx/5xx or a network failure restores the control, shows the error to assistive technology, and pushes **no** conversion event. |
| PII | An allowlist governs what reaches `dataLayer`. No name, email, phone or message content is ever pushed. |

### What is proven, and how

| Claim | Evidence |
|---|---|
| Validation, ordering, failure matrix, duplicate clicks, PII allowlist, one-conversion rule | **Automated** — 523 tests |
| Rendered field contract matches the behavioural fixture | **Automated** — build test against emitted HTML |
| Focus, tab order, accessible names, error announcement, 44 px targets | **Real browser** — `form:a11y`, 40/40 × 3 |
| End-to-end submission → Neon row → Resend delivery | **Proven once on staging** (Phase 9, row 20, delivered 11:48 UTC). **Not repeated here** — Neon is unchanged at 20 rows, max id 20. |
| Turnstile accepting a genuine key pair | **UNVERIFIED.** No production key exists. Only the published test key has ever been exercised. |
| Resend behaviour on bounce, suppression or rate limit | **UNVERIFIED.** The Worker logs a rejection to `console.error` and nowhere a person will see it. |
| Workers runtime, `env.ASSETS`, edge caching | **UNVERIFIED by tests** — the suite calls the `fetch` handler directly. Covered only by the deployed preview. |

---

## 6. Attribution and measurement

### What the site captures

| | |
|---|---|
| Google | `gclid`, `gbraid`, `wbraid`, `gad_source`, `gclsrc` |
| Microsoft | `msclkid` |
| UTM | the five standard `utm_*` parameters |
| Landing page and timestamp | first and latest touch, both stored |

**First-touch wins.** The first campaign record of a session is preserved
across internal navigation; a later touch updates the "latest" fields without
overwriting the first. Nothing reaches the DOM, and values are sanitised and
length-limited.

### Storage duration — the limitation, stated plainly

| | |
|---|---|
| Current mode | **`session`** — `sessionStorage`, one browsing session |
| Persistent mode | Implemented, **disabled**: `localStorage`, 90-day TTL |
| Consequence | A visitor who arrives on a paid click, leaves, and returns days later to convert is attributed to the **return** visit, not the ad. |

Persistent mode is off because it is a **consent and privacy decision, not an
engineering one** — a 90-day identifier in `localStorage` is a different
proposition under PIPEDA and under the client's own privacy policy. Enabling
it is open item **O7** and is explicitly **not** authorised here.

### The two website events

| Event | Fires | Fields |
|---|---|---|
| `lead_form_submission` | once, after the lead is stored | `form_id`, page, attribution — no PII |
| `phone_click` | once per activation of any `tel:` link | page path, link location, **displayed** number, **destination** number, detected provider |

`phone_click` covers all **115** telephone links across all 77 built pages
(69 in the sitemap plus the noindexed routes). Both numbers are read from the
activated element **at click time**, so a swapped number is reported as what
the visitor actually saw and dialled.

### CallTrackingMetrics

The GTM container loads CallTrackingMetrics (account **535014**, served from
`535014.tctm.co`). It performs **dynamic number insertion**, rewriting both the
visible text and the `tel:` href for paid arrivals, under three rules with
three distinct tracking numbers — read out of the live script, not assumed.

No tracking number is hardcoded anywhere in this repository; a build test
asserts that the only telephone number in the emitted HTML is the canonical
`+14168034880`. A tracking number appears at runtime or not at all.

### What consumes these events today: **nothing**

Container `GTM-5PRC4HBV` carries Google Ads `AW-16819334998`, GA4
`G-R27QW21PMT` and Microsoft UET `187178776`. Counted in the container source:

> `lead_form_submission` **0** · `phone_click` **0** · `lead_form_confirmed` **0** · `tel:` **0**

Its two conversion triggers are gated on `gtm.elementId` matching a WPForms
DOM id (`wpforms-form-1384`, `wpforms-form-1381`). **Neither id exists on this
site**, and these forms call `preventDefault()` and post by `fetch`, so no
`gtm.formSubmit` is raised at all. The fourth trigger listens for `mailto:`
links — there is no `tel:` trigger, so click-to-call has never been tracked on
either site.

> **These are website events, not advertising conversions.** The site produces
> them correctly and completely. Nothing in GTM, Google Ads, GA4 or UET
> currently consumes either one, so **cutting over today would report zero
> form conversions and zero call conversions** — not wrong numbers, no
> numbers. Until the container is built, no claim of an operational
> advertising conversion is supportable. This is blocker **B2**.

Enhanced conversions are a further dependency: container macro 3 reads
`sessionStorage.getItem("searchkings_galaxy_tracking_event_data")`, a script
that does not exist on this site and will not exist anywhere once SearchKings
is out.

---

## 7. Performance

Homepage, mobile form factor, simulated throttling, **median of 3 runs**, with
the spread shown because a wide spread is itself the finding.

### Deployed staging — the number that counts

| Category | Runs | **Median** | Target | |
|---|---|---|---|---|
| Performance | 39 / 41 / 45 | **41** | ≥ 85 | ✘ **not met** |
| Accessibility | 100 / 100 / 100 | **100** | ≥ 95 | ✔ |
| Best Practices | 77 / 77 / 77 | **77** | ≥ 95 | ✘ |
| SEO | 69 / 69 / 69 | **69** | ≥ 95 | ✘ — staging `noindex`, see §2 |

| Metric | **Median** | Target | |
|---|---|---|---|
| FCP | **5 840 ms** | — | |
| LCP | **10 750 ms** | ≤ 2 500 ms | ✘ |
| CLS | **0.001** | ≤ 0.1 | ✔ |
| TBT | **744 ms** | — | |
| Speed Index | 6 758 ms | — | |
| Transferred | **1 008 868 B** (~985 KB) | — | |

**The performance target is not met on the deployed origin.** The median is
41 against a target of 85, and it is **below the Phase 1 baseline of 51**.
That is stated plainly rather than explained away.

### Site-controlled performance, measured in isolation

Same build, served over loopback with no network and no third party:

| Category | **Median of 3** |
|---|---|
| Performance | **94** |
| Accessibility | **100** |
| Best Practices | **96** |
| FCP | 2 404 ms |
| LCP | 2 554 ms |
| CLS | 0.001 |
| TBT | **0 ms** |

**These are not production numbers** and must never be quoted as the visitor
experience. They isolate one variable: the code.

### Third-party attribution — controlled, by request blocking

Same deployed origin, same conditions, one variable changed at a time. Blocking
happens **inside the measuring browser**; nothing on the site or in the
container was changed.

| Condition | Perf | LCP | TBT | Requests | KB |
|---|---|---|---|---|---|
| 1 — normal | **47** | 10 302 ms | 798 ms | 37 | 913 |
| 2 — **GTM blocked** | **85** | 3 222 ms | **0 ms** | 21 | 305 |
| 3 — SearchKings blocked | 46 | 10 426 ms | 766 ms | 37 | 967 |
| 4 — ClickCease blocked | 48 | 10 329 ms | 733 ms | 37 | 869 |
| 5 — CallTrackingMetrics blocked | 48 | 9 985 ms | 706 ms | 37 | 945 |
| 8 — all optional third parties blocked | **86** | 3 164 ms | **0 ms** | 21 | 354 |

**GTM and everything it loads costs 38 Lighthouse points, ~7 seconds of LCP,
all 798 ms of TBT, 16 requests and ~600 KB.** Blocking any single vendor
changes almost nothing, because the container loads them all — condition 2 is
the ceiling for the whole stack, not one vendor's share.

### How to read these three numbers together

- **94 isolated** — what the code is worth.
- **85–86 deployed with the container blocked** — what the code is worth over
  a real network, through this container's TLS-terminating proxy.
- **41–47 deployed as visitors get it** — what the container costs on top.

The gap between the second and third rows is not this repository's to close.
It is a container decision.

### What this environment cannot tell you

- **No field data.** No CrUX, no Search Console Core Web Vitals, no
  independent PageSpeed Insights run — production is behind an IP-reputation
  challenge (§9.5) and staging is `noindex` and has no traffic.
- **Every absolute timing includes a proxy hop** this site will never pay in
  the field. The **differences between conditions** are the finding; both
  halves of each comparison carry the same overhead, so it subtracts out.
- **A Lighthouse score is a measurement of a network on a day**, not a
  property of the code. Re-measure on production after cutover before anyone
  treats 41 or 85 as the answer.

---

## 8. Structured data and technical SEO — audit

Read from the **rendered** output of all 69 crawled pages.

| `@type` | Count | Where |
|---|---|---|
| `CleaningService` | **69** | global — every page |
| `WebSite` | **69** | global — every page |
| `BreadcrumbList` | **51** | 38 posts, 9 service pages, 4 `/insights/` pages |
| `BlogPosting` | **38** | every blog post |
| `Service` | **7** | the seven service pages |
| `CollectionPage` | **4** | `/insights/` and its pagination |

| Audit | Result |
|---|---|
| JSON-LD blocks | **169**, **0 malformed** |
| Duplicate entities | none — the global block is one `@graph` with stable `@id`s |
| NAP consistency | **one** telephone value across all 69 pages: `+1-416-803-4880`. Address, name and URL likewise single-sourced. |
| Breadcrumbs | present on **51** pages — 38 posts, 9 service pages, 4 `/insights/` pages. Absent on **18**: the homepage, 8 location pages, `/services/`, and 8 standalone pages. Absence on the homepage and top-level indexes is correct; **absence on the 8 location pages is a gap**, listed below. |
| Services | 7 `Service` entities, one per service page |
| Locations | the 8 `/locations/*` pages carry the global `CleaningService` and `WebSite` plus a `Service` entity — **no `BreadcrumbList`, and no `LocalBusiness`/`Place`/`areaServed` entity of their own** |
| **Unsupported ratings or review counts** | **0 pages** publish `aggregateRating`, `ratingValue` or `reviewCount` |

### Intentionally deferred

1. **Per-location structured data and breadcrumbs.** The 8 `/locations/*`
   pages carry no `BreadcrumbList` and no `LocalBusiness`/`areaServed` entity.
   The breadcrumb is a mechanical gap and cheap to close. The location entity
   is not: it requires facts this repository does not have — whether each is a
   real service area or a served city, and whether any has its own address.
   **Inventing them is exactly what the ratings rule forbids**, and
   location-content work is not authorised here.
2. **`FAQPage`.** No page carries FAQ markup. Would need genuine Q&A copy.
3. **`Review` / `aggregateRating`.** Deliberately absent. The site quotes
   attributed reviews without claiming a numeric rating it cannot substantiate.

---

## 9. Reference — indexing safeguards and the production WAF

### 9.4 Four independent guards against launching noindexed

1. `npm run build` (production) does not run `scripts/noindex.mjs`; only
   `build:preview` does.
2. `tests/build/indexability.test.ts` asserts only the preview build is marked.
3. `npm run launch:check` refuses a build carrying a sitewide noindex.
4. `npm run verify:indexing -- production` reads the **deployed origin** — the
   only one of the four that catches a stale deploy or an edge cache.

### 9.5 The production WAF, and why it ends at cutover

`www.evergreencleaningservice.ca` answers this network with **HTTP 202**,
`sg-captcha: challenge`, and a 170-byte interstitial carrying
**`x-robots-tag: noindex`** — for every path and every user-agent tested.

The challenge is keyed to the **requesting IP**: the interstitial's own token
contains it (`?y=ipr:<egress IP>:…`) and it changed as this container's egress
rotated. It is **not** a user-agent rule.

**Investigated and not bypassed.** No user-agent whitelisted, no
crawler-specific content, no challenge solved or replayed.

Whether a **verified** Googlebot is challenged **cannot be determined from this
network** — a spoofed user-agent proves nothing either way. It needs Search
Console URL Inspection (open item **O6**). After cutover the question
disappears: Cloudflare serves the site and SiteGround's WAF leaves the path.

---

## 10. Visual verification

16 captures, 8 page categories × 390 px and 1440 px, against the deployed
staging origin. **0 failures.**

**Location:** `.measure/phase13-visual/` — `<category>-<width>.png`
**Structured findings:** `.measure/phase13-visual/findings.json`
**Lighthouse captures and JSON:** `.measure/phase13-staging/`
**Third-party matrix:** `.measure/matrix/matrix.json`

> **`.measure/` is gitignored, and this container is ephemeral.** The captures
> are evidence for this report, not repository artefacts — 65 MB of PNGs and
> Lighthouse JSON do not belong in a source tree. Everything above regenerates
> from the deployed origin with:
>
> ```
> node --experimental-strip-types scripts/visual-acceptance.mjs
> node --experimental-strip-types scripts/measure.mjs <label> https://evergreencleaningservice.10xconnections.com
> CHROME_PATH=/opt/pw-browsers/chromium node --experimental-strip-types scripts/perf-matrix.mjs
> ```
>
> Anyone who needs the images filed against the handoff should run the first
> command and attach the output; re-running it against a **different** deployed
> version will not reproduce these exact captures.

| Category | Route | 390 px | 1440 px |
|---|---|---|---|
| Homepage | `/` | `homepage-390.png` | `homepage-1440.png` |
| Quote | `/request-a-quote/` | `quote-390.png` | `quote-1440.png` |
| Paid — broad | `/lp/commercial-cleaning/` | `lp-commercial-cleaning-390.png` | `…-1440.png` |
| Paid — quote | `/lp/commercial-cleaning-quote/` | `lp-commercial-cleaning-quote-390.png` | `…-1440.png` |
| Service | `/services/office-cleaning/` | `service-390.png` | `service-1440.png` |
| Location | `/locations/mississauga/` | `location-390.png` | `location-1440.png` |
| Blog archive | `/insights/` | `blog-archive-390.png` | `blog-archive-1440.png` |
| Thank-you | `/thank-you/` | `thank-you-390.png` | `thank-you-1440.png` |

Verified in the same render as each capture:

- **Layout** — exactly one H1 per page; **no horizontal overflow** at 390 px.
- **Forms** — first control focusable by keyboard; focused control unobscured.
- **Navigation** — the main shell exposes 14–24 visible header links; the paid
  shell deliberately exposes 2–3 and carries no site navigation.
- **Sticky controls** — present on the paid pages at 390 px, absent at 1440 px
  by design; hand-measured clearance 356–380 px per control.
- **Telephone numbers** — every visible `tel:` link dials `+14168034880`; the
  displayed number matches on staging, where no dynamic-number swap applies.
- **No raw entity text** on any category at either width.

---

## 11. Reconciliation — claims an earlier report got wrong

The final verified fact is on the right. The obsolete claim is named so it
cannot be quoted back from an unopened file.

| # | Obsolete claim | **Final verified fact** |
|---|---|---|
| 1 | Phase 6 described 29 internal links as **"broken links"** | They were never broken. All 29 resolved with **HTTP 200 after one redirect hop** — a hop cost, not a 404. Broken links were **0** then and are **0** now; links through a redirect were **29** then and are **0** now. |
| 2 | An early claim that a `FormRuntime` ordering defect was "actively costing money" | Wrong twice: the code has never run on production, and the container has **no trigger** that would have heard the event. Corrected in the Phase 1 baseline and restated here. |
| 3 | Conversion architecture described loosely across Phases 2–3 | **One** canonical event, `lead_form_submission`, pushed **after** the store confirms, protected across the redirect by `eventCallback`/`eventTimeout`. A reload, direct visit, back-button return or resubmit produces **zero**. |
| 4 | Attribution described as if durable | **Session-only.** `sessionStorage`, one browsing session. Persistent mode (`localStorage`, 90 days) is implemented and **disabled**, pending a consent decision. |
| 5 | Turnstile described as "integrated" | Integrated **against Cloudflare's published test key**. No genuine key pair has ever been exercised. The production build gate refuses to ship without one. |
| 6 | A Performance score of **99** quoted from a local run | That was `lh:local` — loopback, no network, no third party. The comparable isolated figure now is **94**. The **deployed** median is **41**. Only the deployed figure describes a visitor. |
| 7 | Phase 9 field counts: "8 visible fields", "19 labels", "0 placeholders" | The short form has **seven visitor-visible fields**, **one** clipped non-visible honeypot, **eight** form controls total; 39 labels; 3 placeholders. |
| 8 | Phase 9 notification: `reply_to` set for every lead | A phone-only lead sent `reply_to: ""` — a real defect, now fixed. `reply_to` is **omitted entirely** when no email is supplied, confirmed on a delivered message. |
| 9 | Landing-page reporting identities described as interchangeable | **Deliberately distinct and preserved.** DOM anchor `lpq-form`; reporting `form_id` `lp-commercial-cleaning-quote`. The sibling page is `ppc-lead-form` for both. Neither was renamed. |
| 10 | Telephone tracking described as ported | **New.** The old `click_to_call` ran on 3 of 77 pages and **hardcoded** the number, so a paid visitor who tapped a CallTrackingMetrics number had the canonical one reported. `phone_click` covers all 115 links and reads both numbers at click time. |
| 11 | TESTING.md: "Resend has never been configured on this project" | **Stale.** Resend is configured and has **delivered** — `leads@brandingcentres.com` → `info@evergreencleaningservice.ca`, with `reply_to` correctly absent. Corrected in Phase 12. |
| 12 | B3 and B4 listed as open blockers | **Both closed** in `f3ed583`, verified on the deployed Worker. Entity rendering confirmed in a browser; 50 of 50 redirect variants confirmed single-hop with query strings preserved. |
| 13 | DNS runbook v1: leave DNS at SiteGround, repoint A records, "30-second cutover and rollback" | **Wrong, and it described an unsupported architecture.** A Worker Custom Domain requires an **active Cloudflare zone**; Cloudflare creates the record itself and it points directly at the Worker, so **there is no stable Worker A-record** for third-party DNS to target. Partial (CNAME) zones are **Business/Enterprise-only**. Rollback is bounded by the NS TTL — **hours, up to 48 h** — not seconds. Rewritten in `docs/dns-cutover-runbook.md`. |
| 14 | "Six blockers" | Superseded. **Recounted from scratch in §13.** |

### Measurement errors made during this audit, and corrected

Recorded because a confident wrong answer that looks like a finding is worse
than no answer.

| Reported | Reality |
|---|---|
| 3 homepage images "missing alt" | They carry a **valueless `alt`** attribute — valid HTML, means decorative. The crawler matched only `alt="…"`. **0 images lack alt.** |
| 69 JSON-LD blocks with "no `@type`" | The global block is an **`@graph`**; the root of an `@graph` document is not supposed to carry a type. Walking the graph gives `CleaningService` 69 and `WebSite` 69. |
| Homepage form: "0 visible controls, 11 hidden" | The harness measured **without scrolling**. `.wow` elements are `visibility: hidden` until observed. Scrolled: **12 visible, 1 hidden**. |
| `lp:sticky`: `business-name` obscured at 390 px | **False positive, the fourth from this script.** Hand-measured per control: **380 px clear**. The only element measuring as obscured is the clipped honeypot. Disclosed in the script's own header. |
| `scripts/measure.mjs` "hangs/fails" | It had a **syntax error** — backticks in a comment inside a template literal — and a wrong `CHROME_PATH` default treating a symlink-to-binary as a directory. Both fixed; disclosed in §12. |

---

## 12. Changes committed during Phase 13

Phase 13 is a reporting phase. **No site code, content, schema or
configuration was changed.** The only edits are reporting tooling, disclosed
here as the brief requires.

| File | Change | Why |
|---|---|---|
| `scripts/measure.mjs` | Fixed a **syntax error** (backticks inside a template literal, twice) and a wrong `CHROME_PATH` default | The script could not parse at all, so no deployed Lighthouse measurement was possible |
| `scripts/final-crawl.mjs` | **New** | The acceptance crawl, matching the Phase 1 baseline's definitions |
| `scripts/visual-acceptance.mjs` | **New** | 8 categories × 2 widths, with structural checks in the same render |
| `scripts/sticky-clearance.mjs` | Header note only | Discloses the fourth false positive so a FAIL is not reported as a finding |
| `docs/final-acceptance-report.md` | **New** | This document |

**One defect left unfixed, deliberately.** `scripts/perf-matrix.mjs` carries
the same wrong `CHROME_PATH` default that `measure.mjs` did, and fails the
same way. It was run with `CHROME_PATH=/opt/pw-browsers/chromium` set in the
environment rather than edited, to keep the number of files touched during an
acceptance audit to the minimum that made the audit possible. It is a
one-line fix for whoever picks it up next; the third-party matrix in §7 was
produced with the environment variable set.

---

## 13. Open items — recounted from scratch

**There are eight.** The "six blockers" count is retired: B3 and B4 are closed,
and the remaining items are re-enumerated and reclassified below.

| # | Condition | Class | Owner | Action required | Evidence to close |
|---|---|---|---|---|---|
| **O1** | No production Turnstile key pair. Staging serves the published test sitekey `1x00000000000000000000BB`; `npm run build` refuses to build for production (exit 1). | **Launch blocker** | Cloudflare account holder | Create a Turnstile widget for `www.evergreencleaningservice.ca` and the apex. Set `PUBLIC_TURNSTILE_SITE_KEY` at build time and `wrangler secret put TURNSTILE_SECRET`. | A production build completing, plus **one real staging submission accepted with the genuine pair** and one rejected with the published failing secret. |
| **O2** | Container `GTM-5PRC4HBV` has **no trigger** for `lead_form_submission` or `phone_click`. Its two conversion triggers are gated on WPForms DOM ids that do not exist here. | **Launch blocker** and **paid-media blocker** | Agency / whoever owns GTM after SearchKings | Build triggers, tags and variables per `docs/gtm-handoff.md` §7. Rebuild enhanced conversions, which currently depend on a SearchKings script that will not exist. | Tag Assistant against staging showing both events firing their tags, and a test conversion visible in Google Ads and GA4. |
| **O3** | Staging and production share one Neon branch. 20 rows, all test data, **none from production**. | **Operational risk** → **launch blocker at cutover** | Paolo (approval) + Neon | Approve separation, take a snapshot, create a production branch, give production its own `DATABASE_URL`. Branch creation remains unauthorised. | Two branches; a staging submission landing in staging only; production `DATABASE_URL` set as a Worker secret. |
| **O4** | Neon free plan: **six-hour PITR**, shorter than a cutover day. Branch `main` is also **not protected**. | **Operational risk** | Neon account holder | Take an explicit snapshot before cutover; enable branch protection. | Snapshot listed; protection enabled. |
| **O5** | The upload-path map is an allowlist of **101** archive-derived addresses. An upload URL the Internet Archive never captured answers 404. | **Operational risk** (image/SEO traffic) | SiteGround access | Export the live WordPress media library and reconcile against the map. | A diff showing every live media path either mapped or deliberately excluded. |
| **O6** | Whether a **verified** crawler currently reaches production cannot be determined from this network; the challenge interstitial carries `x-robots-tag: noindex`. | **Informational — blocked** | Search Console access | URL Inspection from a verified Googlebot address. Moot after cutover. | A live URL-Inspection fetch returning the page. |
| **O7** | Persistent attribution (`localStorage`, 90 days) is implemented and **disabled**. Session-only attribution under-credits paid clicks that convert on a later visit. | **Paid-media blocker** (measurement quality) | Paolo + whoever owns the privacy policy | Decide whether a 90-day identifier is acceptable under PIPEDA and the site's own policy; if yes, enable the mode and update the policy. | A recorded decision; if enabled, the policy text and the mode change. |
| **O8** | **Authoritative-DNS migration not approved.** A Worker Custom Domain requires an active Cloudflare zone; the zone must be built and every record reproduced before nameservers move. | **Launch blocker** | Paolo (approval) + Cloudflare + GoDaddy | Approve Option 1 in `docs/dns-cutover-runbook.md` §2. Build the Cloudflare zone and reconcile **every** record in §1 of the runbook — MX ×3, SPF, the `default._domainkey` DKIM **CNAME**, DMARC `p=reject`, and the `mail`/`autodiscover`/`ftp` A records, all DNS-only. Confirm the registrar lock is editable and re-check DNSSEC on the day. | Cloudflare's assigned nameservers answering **every** record correctly **before** delegation; mail verified in both directions after. |

### Two dependencies that are not blockers, stated precisely

**CallTrackingMetrics ownership.** Account **535014** performs dynamic number
insertion for paid arrivals, loaded by the GTM container. Nothing in this
repository configures it and no tracking number is hardcoded here. Whether the
account survives the SearchKings transition, and who administers it, is a
dependency of **O2** — if the container is rebuilt without CTM, the numbers
stop being swapped and `phone_click` simply reports the canonical number. No
code change is required either way.

**Resend sender branding.** Lead notification is **operational** — verified
delivered from `leads@brandingcentres.com` to `info@evergreencleaningservice.ca`,
with `reply_to` correctly omitted for a phone-only lead. That is the house
shared-sender pattern and it works. Sending from an
`@evergreencleaningservice.ca` address would require adding and verifying that
domain in Resend, and the domain's DMARC is `p=reject`, so an unaligned sender
would be **rejected outright**. Changing the sender is **cosmetic
brand cleanup, not an operational fix** — it must not be confused with a
delivery problem, because there is none.

### The Cloudflare plan question, scoped correctly

The account's Cloudflare plan is unknown. It is relevant **only** to whether
the partial-zone (CNAME) alternative exists, since that is Business/Enterprise
only. **It does not block the recommended full-zone path**, which works on
every plan including Free. O8 does not wait on it.

### The mail finding, scoped correctly

**Public DNS for `evergreencleaningservice.ca` indicates that this domain
currently uses SiteGround mail and exposes no Microsoft 365 records.** MX
points at `mailspamprotection.com`; SPF and the `default._domainkey` DKIM CNAME
point at `dnssmarthost.net`; `autodiscover` is an A record at SiteGround's mail
IP rather than a CNAME to Outlook. Probed and absent: `lyncdiscover`, `sip`,
`enterpriseregistration`, `enterpriseenrollment`, `msoid` and the M365 SRV
records.

This is a statement about **this domain's public DNS on 2026-09-21** and
nothing more. It is **not** a statement about the client's organisation, their
other domains, or what mail platform they use elsewhere. Re-verify with
`npm run dns:snapshot` on the day.

---

## 14. Scoring

Three separate scores, because they measure different things and collapsing
them hides the only one that decides a launch date.

### Rubric

Each dimension scores 0–100 from named, weighted criteria. **A criterion that
cannot be evidenced scores 0**, never a benefit of the doubt.

### 14.1 Staging SEO implementation — **93**

| Criterion | Weight | Score | Evidence / deduction |
|---|---|---|---|
| Crawlability and status | 15 | 15 | 69/69 × 200, 0 broken links, 0 chains |
| Metadata uniqueness | 15 | 15 | 69/69 unique titles and descriptions |
| Canonicals | 10 | 10 | 69/69 present, correct, on the final domain |
| Heading structure | 10 | 10 | 69/69 exactly one H1 (was 63/69) |
| Redirect migration | 15 | 15 | 154 rules, 117/117 parity, both slash spellings, one hop, query strings preserved |
| Structured data | 10 | 8 | 0 malformed, NAP consistent, no invented ratings. **−2**: no per-location entity |
| Images | 5 | 5 | 0 missing alt, all on the image host |
| Accessibility | 10 | 10 | Lighthouse 100, 120/120 form checks |
| Performance contribution to SEO | 10 | 5 | **−5**: deployed mobile LCP 10.75 s |
| **Total** | **100** | **93** | |

### 14.2 Staging PPC implementation — **88**

| Criterion | Weight | Score | Evidence / deduction |
|---|---|---|---|
| Landing-page structure | 15 | 15 | Two purpose-built pages, no site nav, minimal header, sticky CTA |
| Form friction | 15 | 15 | 7 visible fields, phone-or-email, one shared component |
| Conversion event correctness | 15 | 15 | One canonical event, after storage, protected across redirect, zero on reload/back/resubmit |
| Telephone tracking | 10 | 10 | All 115 links; both numbers read at click time; no hardcoded tracking number |
| Attribution capture | 10 | 10 | Google, Microsoft and UTM parameters; first-touch preserved |
| Attribution durability | 10 | 4 | **−6**: session-only; a paid click converting on a later visit is misattributed |
| Spam protection | 10 | 5 | **−5**: Turnstile runs on the published **test** key |
| Noindex and sitemap exclusion | 5 | 5 | Both paid pages noindexed and excluded |
| Reporting identity integrity | 10 | 9 | Three distinct `form_id`s preserved. **−1**: `quick-quote` vs DOM id `quote` is a readability trap |
| **Total** | **100** | **88** | |

### 14.3 Production launch readiness — **42**

Scored against **can this go live today**, not against the quality of the
repository. External blockers stay as deductions.

| Criterion | Weight | Score | Evidence / deduction |
|---|---|---|---|
| Code and content ready | 20 | 20 | 523 tests, builds clean, 0 visual failures |
| Build and deploy pipeline | 10 | 10 | Preview build, dry run and deploy all verified |
| Spam protection operational | 15 | **0** | **O1** — no genuine Turnstile key has ever been exercised |
| Conversion measurement operational | 20 | **0** | **O2** — nothing consumes either event; cutover today reports **zero** conversions |
| Lead capture and notification | 10 | 9 | Storage and delivery proven end to end. **−1**: no alerting on a Resend rejection |
| Data separation and recovery | 10 | **2** | **O3** shared branch, **O4** six-hour PITR, branch unprotected |
| DNS cutover readiness | 10 | **1** | **O8** — architecture corrected and runbook written, but migration unapproved and the Cloudflare zone does not exist |
| Production verification possible | 5 | **0** | **O6** — production unreachable from here; indexability unverifiable until cutover |
| **Total** | **100** | **42** | |

### 14.4 Against the provisional scores

| | Provisional | **Final** | |
|---|---|---|---|
| WordPress SEO | 61 | — | superseded by the replacement |
| WordPress PPC | 56 | — | superseded |
| Staging SEO | 79 | **93** | **+14** |
| Staging PPC | 67 | **88** | **+21** |
| Production launch readiness | — | **42** | first measurement |

The two staging scores rose because the work is measurably done. **The
production score is low and must stay low**: it measures operational
readiness, and five of its eight criteria depend on accounts and approvals
that do not exist yet. Inflating it because the repository is strong would
invert the one number that decides whether to launch.

---

## 15. Verdict and launch order

### **NO-GO.**

The site must not launch until Turnstile, lead notifications and conversion
tracking are all operational. Lead notification **is** operational. The other
two are not, and a third blocker — the DNS architecture — has no approved path
yet.

Launching today would produce a site that cannot verify a human, cannot report
a single form or call conversion to Google Ads or GA4, and writes real leads
into the same database staging writes to.

### Minimum actions to reach GO, in order

Sequence matters: 1–2 can run in parallel, 3 depends on 1, and 4 gates
everything after it.

| # | Action | Closes | Blocks |
|---|---|---|---|
| 1 | Issue a production Turnstile key pair; set the build variable and the Worker secret. | O1 | 3, 5 |
| 2 | Build the GTM container per `docs/gtm-handoff.md` §7; verify both events in Tag Assistant. | O2 | 5 |
| 3 | Rebuild staging with the genuine key; submit **one** real lead end to end; confirm accept **and** reject paths. | O1 evidence | 5 |
| 4 | Approve database separation; snapshot; create the production branch; set production `DATABASE_URL`; protect `main`. | O3, O4 | 5 |
| 5 | Approve the DNS architecture (runbook §2, Option 1). Build the Cloudflare zone; reconcile **every** record; verify against Cloudflare's nameservers **before** delegating. | O8 | cutover |
| 6 | Decide persistent attribution and update the privacy policy if enabling. | O7 | — (not a launch gate) |
| 7 | Re-run everything in §1, re-issue §13 and §14, and only then schedule the cutover. | — | cutover |

Cutover date remains **`TBD`** — correctly, because it depends on 1, 2, 4 and
5, none of which has a date.

### Launch day and rollback — the short form

The authoritative procedure is **`docs/dns-cutover-runbook.md`**; it is not
duplicated here. In outline:

1. **T−48 h** — lower NS, MX, SPF and DKIM TTLs. Export and snapshot the zone.
2. **T−24 h** — Cloudflare zone built and reconciled record by record.
3. **T−2 h** — deploy the production build; verify on `workers.dev`; run
   `npm run launch:check`.
4. **T** — change nameservers at GoDaddy.
5. **T+1 h** — certificate **active**; run the §4 launch-day checks.
6. **T+6 h / +24 h / +48 h** — re-run; submit the sitemap in Search Console.

**Roll back immediately on any one of** (runbook §5):

- **any** interruption to mail in either direction — with DMARC `p=reject`, a
  broken DKIM CNAME means outright rejection, not spam-filing;
- SPF, DKIM or DMARC failing at a receiving server;
- homepage not rendering 30 minutes after the certificate is active;
- lead submission failing, or a lead accepted and not stored;
- production serving `noindex`;
- more than 5 % of the 154 redirect rules returning 404;
- 5xx above 1 % over any 10-minute window;
- anything unexplained 4 hours after the certificate is active.

**Rollback takes hours, not minutes** — it is bounded by the NS TTL and by
resolvers that ignore it. The SiteGround site stays up and unchanged for at
least 14 days, because it is the rollback target.

---

*Phase 13 ends here. The site has not been launched.*

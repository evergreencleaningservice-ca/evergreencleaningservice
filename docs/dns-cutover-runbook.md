# DNS cutover and rollback runbook

**Cutover date: `TBD`.** Not yet determined, and not needed to complete this
plan. Everything below is written so that fixing the date is the only thing
left to decide.

**This runbook does not authorise itself.** Phase 12 is an investigation. No
step here has been executed, and none may be until the go/no-go table in
`docs/phase-12-report.md` clears and the cutover is explicitly approved.

---

## 0. The shape of the problem

| | Today | After cutover |
|---|---|---|
| Registrar | Go Daddy Domains Canada | unchanged |
| Nameservers | `ns1.siteground.net`, `ns2.siteground.net` | **decision below** |
| Web origin | SiteGround CDN, 8 rotating Google Cloud addresses | Cloudflare Worker |
| Mail | SiteGround (`mx10/20/30.antispam.mailspamprotection.com`) | **unchanged — must not move** |
| A-record TTL | 30 s | 30 s |
| NS TTL | 21 600 s (6 h) | 6 h |

Measured 2026-09-21 from dns.google and cloudflare-dns, agreeing, and from
CIRA's RDAP. Re-measure on the day: `npm run dns:snapshot`.

### The registry lock

RDAP reports `client update prohibited`, `client transfer prohibited`,
`client delete prohibited` — GoDaddy's standard lock. Changing nameservers
from inside the GoDaddy account normally works despite it; a registrar
*transfer* does not. **Confirm the nameserver field is editable before the
cutover window opens, not during it.**

---

## 1. The decision that shapes everything: which level to cut at

Two ways to move the site. They are not equivalent and the difference is six
hours and the client's email.

### Option A — change the A records inside the SiteGround DNS zone (recommended)

Leave the nameservers at SiteGround. Replace the apex and `www` A records with
the Cloudflare Worker's.

- **Propagates in ~30 seconds.** The A-record TTL is 30 s, measured.
- **Rollback is the same 30 seconds** — put the old addresses back.
- **MX, SPF, DMARC and the `mail`/`autodiscover`/`ftp` records are never
  touched**, so email cannot break.
- Costs: the zone stays on SiteGround, so the SiteGround account must remain
  open and paid, and a Worker custom hostname needs a domain-control proof
  that SiteGround DNS must serve.

### Option B — move the nameservers to Cloudflare

- **Six-hour TTL**, so both rollback and cutover are slow, and slow is the
  opposite of what a rollback needs.
- **It is the step that breaks client email on this estate.** GoDaddy and
  Cloudflare both mint a fresh default zone on delegation, and the real MX,
  SPF and DMARC records are simply absent from it.

**Recommendation: Option A.** Move to Cloudflare nameservers later, as a
separate, unhurried change, if the zone is wanted there at all.

### Non-negotiable, whichever option

> **Export the full SiteGround DNS zone before changing anything, and attach
> the export to the cutover record.**

Three domains on this estate were reported migrated on the strength of a
registrar panel that had accepted the input and not persisted it. The
nameservers had never changed and the apex A records had not taken. A panel
shows what was typed; only a resolver shows what is true.

Minimum to capture, per `npm run dns:snapshot`: `NS`, `A` (all 8), `MX` (all
3), apex `TXT`/SPF, `_dmarc` `TXT`, `SOA`, and the `mail`, `autodiscover` and
`ftp` A records at `35.209.221.162`.

---

## 2. Before the window opens

Each of these is a gate. None is optional.

1. **Go/no-go table in `docs/phase-12-report.md` clears.** Turnstile, lead
   notification and conversion tracking are all operational — the site does
   not launch otherwise.
2. **A production build exists and was built with a real Turnstile site key.**
   `npm run build` refuses without one; that refusal is the gate working.
3. **`npm run launch:check dist` reports no blocker that is not deliberate.**
   The staging noindex and the test key must both be absent from a production
   build.
4. **DNS zone exported** (§1) and attached.
5. **Neon: snapshot taken.** Retention on the free plan is a six-hour PITR
   window, which is shorter than a cutover day. A snapshot is a separate,
   explicit action.
6. **Database separation decided.** Staging and production currently share one
   Neon branch. Twenty rows exist, all test data, none from production —
   measured — so nothing is at risk today, but from cutover real leads land in
   the same place staging writes to. See `docs/database-separation.md`.
7. **Rollback rehearsed on paper**, with the old A records in the hand of the
   person making the change, not in a browser tab.

---

## 3. The cutover

Times are relative to T, the moment the A records change.

| When | Step |
|---|---|
| T−60m | Re-run `npm run dns:snapshot`; confirm it matches the export. Freeze WordPress edits. |
| T−30m | Deploy the production build to the Worker. **Do not yet attach the custom hostname.** Verify on the `workers.dev` URL. |
| T−15m | `npm run launch:check dist https://<workers.dev URL>`. |
| T−5m | Attach `www.evergreencleaningservice.ca` and the apex as Worker custom hostnames. Certificate issuance can take minutes — it must be **issued and active** before T. |
| **T** | Change the apex and `www` A records in the SiteGround zone to the Cloudflare addresses. |
| T+2m | `npm run dns:snapshot` — both public resolvers must return the new addresses. Not the panel. |
| T+5m | §4 launch-day checks. |
| T+30m | Re-run §4. Check Worker logs for 5xx. |
| T+2h | Re-run §4. Submit one real lead end to end (§4.6). |
| T+24h | Search Console: submit the sitemap, request indexing on the homepage, check Coverage for a spike in 404s. |

**The SiteGround site is not switched off at cutover.** It stays up, unchanged
and reachable, for at least 14 days — it is the rollback target, and a
rollback into a site that has been deleted is not a rollback.

---

## 4. Launch-day checks

Run every one after cutover, and again at T+30m and T+2h.

1. **The homepage renders.** Load it and read the body text. HTTP 200 is not a
   website; 44 domains on this estate were once reported as "serving a site"
   on the strength of a status code and 25 of them served nothing.
2. **`npm run verify:indexing -- production`.** Must report the site is
   indexable. If it refuses with "CANNOT REPORT", the origin is serving a
   challenge, not the site — read §6.
3. **`npm run parity -- https://www.evergreencleaningservice.ca`.** Every
   legacy address still resolves.
4. **Both paid landing pages** load, are `noindex`, and show the form.
5. **Telephone links dial** `+14168034880` on a real phone, and a tap pushes
   one `phone_click` into `dataLayer`.
6. **One real lead, submitted end to end** — form → Neon row → Resend email in
   the client's inbox. Not a simulation. Delete the row afterwards.
7. **Email still works.** Send a message to `info@evergreencleaningservice.ca`
   from outside and confirm it arrives. This is the check that catches a zone
   edit that took more than it should have.
8. **Mobile, at 390 px**, in a normal window and in incognito, **then refresh**
   — a page on this estate once passed incognito on first load and 403'd on
   refresh.

---

## 5. Rollback

### Thresholds — decided now, so nobody has to decide them at the time

Roll back immediately, without further discussion, on any one of:

| Threshold | Why it is absolute |
|---|---|
| The homepage does not render for more than **5 minutes** | Beyond a certificate-issuance delay; something is wrong. |
| **Any** interruption to mail delivery | Email is the business. Nothing about a website justifies it. |
| Lead submission fails, or a lead is accepted and not stored | A lost lead cannot be recovered and is not visible as a failure. |
| Production is serving `noindex` | Every hour compounds. Deindexing is slow to happen and slower to undo. |
| More than **5%** of the 130 redirect rules 404 | Link equity is leaving. |
| 5xx above **1%** of requests over any 10-minute window | |
| Anything unexplained after **60 minutes** | An unknown cause at 60 minutes is not about to become clear at 90. Roll back, then diagnose without the clock running. |

Do **not** roll back for: a slow first byte on a cold cache, a single 404 on an
address nobody links to, or a Lighthouse score. Those are Monday's work.

### The procedure

1. Restore the previous apex and `www` A records in the SiteGround zone from
   the export. **~30 seconds**, because the TTL is 30 s.
2. Confirm from two public resolvers (`npm run dns:snapshot`) — never from the
   panel.
3. Load the homepage and read the body text.
4. Send a test email to `info@evergreencleaningservice.ca`.
5. Detach the Worker custom hostnames.
6. Write down what happened **before** attempting a fix.

If nameservers were moved (Option B), rollback takes up to six hours and the
full zone must be recreated from the export. This is the reason Option A is
recommended.

---

## 6. Production indexing safeguards

The single most expensive mistake available at cutover is launching with
staging's `noindex` still attached. It deindexes the business, it is invisible
from the page, and nobody notices for weeks.

**Four independent guards, because one is a single point of failure:**

1. `npm run build` (production) does not run `scripts/noindex.mjs`. Only
   `build:preview` does.
2. `tests/build/indexability.test.ts` asserts that only the preview build is
   marked noindex.
3. `npm run launch:check` refuses a build carrying a sitewide noindex.
4. `npm run verify:indexing -- production` reads the **deployed origin**,
   which is the only one of the four that can catch a stale deploy, an edge
   cache or a zone transform rule.

**Also required at cutover, and not automatable from here:**

- `robots.txt` on production must **not** `Disallow: /`. That blocks the
  crawl, so the noindex is never read, and the URL can still be indexed from
  an inbound link with no way for the noindex to be seen.
- The three genuinely-noindex routes — both `/lp/` pages and `/thank-you/` —
  must still be noindex, and still absent from the sitemap.
- Submit `https://www.evergreencleaningservice.ca/sitemap-index.xml` in Search
  Console after cutover.

### The SiteGround challenge, and why cutover ends it

Production answers this network with HTTP 202, `sg-captcha: challenge`, and a
170-byte interstitial — for every path, every user-agent, including
`robots.txt`. The interstitial carries **`x-robots-tag: noindex`**.

The challenge is keyed to the **requesting IP address**: the interstitial's
own token contains it (`?y=ipr:<our egress IP>:…`), and it changes as this
container's egress rotates. It is not a user-agent rule — identical responses
came back for desktop, mobile, three crawler strings and no user-agent at all.

**This was investigated and not bypassed.** No user-agent was whitelisted, no
crawler-specific content exists, and no challenge was solved or replayed.

Whether a *verified* Googlebot is challenged **cannot be determined from
here** and is listed as blocked in the Phase 12 report. What can be said is
that after cutover the question disappears: Cloudflare Workers serves the site
and SiteGround's WAF is no longer in the path.

---

## 7. What needs SiteGround access, and is therefore not done

Credentials were deliberately not requested. Each of these is a manual
follow-up for someone who has them:

| Item | Why it matters |
|---|---|
| Whether the WAF challenges verified crawlers | Decides whether the current site is being crawled at all. |
| The live `robots.txt` and `sitemap_index.xml` | The port's redirect targets assume Rank Math's defaults; unconfirmed. |
| The WordPress media library, reconciled against the 101-entry upload map | Images the Internet Archive never captured are not in the map and will 404. |
| The live page inventory | The port's URL list came from the archive, whose coverage is partial. |
| Any `.htaccess` redirects | Would be lost at cutover and are invisible from outside. |
| Whether SiteGround also serves mail | Decides whether the hosting account can ever be closed. |

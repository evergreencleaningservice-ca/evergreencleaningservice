# DNS cutover and rollback runbook

**Cutover date: `TBD`.** Not yet determined, and not needed to complete this
plan.

**This runbook does not authorise itself.** No step here has been executed.
None may be until the go/no-go table in `docs/phase-12-report.md` clears and
the cutover is explicitly approved.

---

## 0. Correction to the first version of this document

The first version recommended leaving DNS at SiteGround and simply repointing
the apex and `www` A records at the Worker, and called the cutover and
rollback a thirty-second operation. **That was wrong, and it was wrong in the
way that matters: it described an architecture Cloudflare does not support.**

A Worker Custom Domain requires the hostname to be inside an **active
Cloudflare zone**. Cloudflare's documentation is explicit:

> To add a Custom Domain, you must have: 1. An active Cloudflare zone. 2. A
> Worker to invoke.
>
> You cannot create a Custom Domain on a hostname with an existing CNAME DNS
> record or **on a zone you do not own**.
>
> After you set up a Custom Domain for your Worker, Cloudflare will create DNS
> records and issue necessary certificates on your behalf. The created DNS
> records will point directly to your Worker.

— <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>

Two consequences kill the original plan:

1. **Cloudflare creates the record; you do not.** The record points "directly
   to your Worker" and is an internal binding, not an address published for
   third-party DNS to copy. There is **no stable Worker A-record address**,
   and none is invented here.
2. **The certificate follows the zone.** A Custom Domain generates an Advanced
   Certificate on the target zone. Without the zone, there is no certificate
   path at all.

The 30-second A-record TTL is still true and still useful — it is measured. It
simply is not a rollback plan for an architecture that never applied. TTL is
one input to propagation, not the whole of it; caching resolvers, negative
caching and certificate issuance all add time. **Nothing in this runbook
describes cutover or rollback as guaranteed in thirty seconds.**

---

## 1. Measured starting state

All measured 2026-09-21 via `npm run dns:snapshot` — two public resolvers in
agreement, plus CIRA's RDAP. **Re-run on the day; do not trust this table as
current.**

### Registry

| | |
|---|---|
| Registrar | Go Daddy Domains Canada, Inc |
| Registered / expires | 2016-08-26 / 2027-08-26 |
| Status | `client update prohibited`, `client transfer prohibited`, `client delete prohibited` |
| Nameservers | `ns1.siteground.net`, `ns2.siteground.net` — registry and resolvers agree |
| **DNSSEC** | **Unsigned.** No DS at the parent, no DNSKEY. |

### The zone, in full

| Name | Type | Value | TTL |
|---|---|---|---|
| apex | A | rotating pool of 8 Google Cloud addresses (SiteGround CDN) | 30 s |
| `www` | A | same rotating pool | 30 s |
| apex | MX | `mx10`, `mx20`, `mx30`.`antispam.mailspamprotection.com` (10/20/30) | 21 600 s |
| apex | TXT (SPF) | `v=spf1 +a +mx +ip4:35.209.221.162 include:evergreencleaningservice.ca.spf.auto.dnssmarthost.net ~all` | 14 400 s |
| `_dmarc` | TXT | `v=DMARC1; p=reject; rua=mailto:no-reply@evergreencleaningservice.ca` | 300 s |
| `default._domainkey` | CNAME | `evergreencleaningservice.ca.default.dkim.auto.dnssmarthost.net.` | |
| `mail` | A | `35.209.221.162` | 21 600 s |
| `autodiscover` | A | `35.209.221.162` | 21 600 s |
| `ftp` | A | `35.209.221.162` | 21 600 s |
| apex | SOA | `ns1.siteground.net root.c90221.sgvps.net` | |
| apex | CAA | **none** | |
| apex | AAAA | **none** | |

### Microsoft 365: there is none

Probed explicitly and **absent**: `lyncdiscover`, `sip`,
`enterpriseregistration`, `enterpriseenrollment`, `msoid`, and every M365 SRV
record. `autodiscover` exists but is an A record at SiteGround's mail IP, not
a CNAME to `autodiscover.outlook.com`.

**Mail is SiteGround end to end** — `mailspamprotection.com` for inbound
filtering, `dnssmarthost.net` for SPF and DKIM. A cutover checklist listing
M365 steps for this domain would be describing records that do not exist.
Re-verify with `npm run dns:snapshot` on the day; if M365 has been adopted
since, those records join the inventory below and nothing else changes.

**DKIM is the record most often lost in a provider move**, because the
selector is provider-chosen and cannot be discovered from the apex. This
domain's selector is `default`. It is a CNAME into SiteGround's autoconfig,
so **it cannot be recreated by copying a public key** — the target hostname
must be reproduced verbatim, and it only resolves while the SiteGround mail
service exists.

---

## 2. The three supported architectures

### Option 1 — Move authoritative DNS to Cloudflare (**recommended**)

The only arrangement that supports a Worker Custom Domain on this account's
plan.

**Prerequisite, and it is the whole risk:** every record in §1 is inventoried
and recreated in the Cloudflare zone *before* the nameservers change.
Cloudflare's scan finds most records; it does not reliably find all of them,
and the failure mode is a zone that looks complete and is missing mail.

| | |
|---|---|
| Supports Worker Custom Domain | Yes |
| Plan required | Free is sufficient |
| Apex support | Yes (CNAME flattening) |
| Propagation | NS TTL 21 600 s (6 h); realistically up to 24–48 h for full worldwide convergence |
| Rollback | Hours, not minutes — see §5 |

### Option 2 — Partial (CNAME) zone, keeping SiteGround authoritative

Genuinely supported by Cloudflare, and **almost certainly unavailable here**:

> A CNAME setup (partial) is only available to customers on a **Business or
> Enterprise plan**.

— <https://developers.cloudflare.com/dns/zone-setups/partial-setup/>

Two further constraints:

- The apex can only be proxied if the authoritative provider supports **CNAME
  flattening**. Whether SiteGround's DNS does is **unverified** — it needs the
  SiteGround control panel.
- A Custom Domain cannot be created on a hostname that already has a CNAME
  record, which is exactly what a partial setup puts there. The Worker would
  be attached by **route**, not Custom Domain.

**Do not plan on this option without first confirming the Cloudflare plan and
SiteGround's CNAME-flattening support.** Both are listed as blocked checks.

### Option 3 — Deploy to a conventional origin with a real address

Put the site somewhere with a stable, publishable IP that SiteGround DNS can
target with an A record.

| | |
|---|---|
| Supports Worker Custom Domain | N/A — no Worker |
| DNS change | A records only; MX, SPF, DKIM, DMARC never touched |
| Rollback | Fast, bounded by the 30 s A-record TTL |
| Cost | Abandons the Workers deployment this project is built on |

The honest trade: Option 3 is by far the safest DNS change and the most
expensive engineering change. It is listed because it is a real alternative,
not because it is recommended.

**Recommendation: Option 1.** Option 2 only if both its preconditions are
confirmed. Option 3 only if moving authoritative DNS is refused outright.

---

## 3. Option 1, in detail

### 3.1 Before anything changes

1. **Export the full zone** and attach it to the cutover record. §1 is the
   checklist; `npm run dns:snapshot` regenerates it.

   > Three domains on this estate were reported migrated on the strength of a
   > registrar panel that had accepted the input and not persisted it. The
   > nameservers had never changed and the apex A records had not taken. A
   > panel shows what was typed; only a resolver shows what is true.

2. **Confirm the Cloudflare account plan** — decides whether Option 2 exists.
3. **Confirm the registry lock is editable.** `client update prohibited` is
   GoDaddy's standard lock; changing nameservers from inside the GoDaddy
   account normally works despite it. Confirm **before** the window opens.
4. **Re-check DNSSEC.** Currently unsigned, so there is no sequencing
   constraint. **If it has been signed since:** remove the DS at the registrar
   and wait for it to expire from the parent *before* touching nameservers. A
   signed delegation the new nameservers cannot validate returns SERVFAIL —
   the domain goes dark, and putting the records back does not fix it.
5. **Lower TTLs 48 h ahead** if possible: drop the NS TTL and the MX/SPF/DKIM
   TTLs from 21 600 s to 300 s. This is the single most effective thing
   available for shortening rollback, and it must be done days in advance to
   have any effect.

### 3.2 Build the Cloudflare zone — before the nameservers move

Add the domain to Cloudflare, let the scan run, then **reconcile every row of
§1 by hand**. Required before delegation:

- [ ] apex and `www` — placeholder proxied records; the Custom Domain will
      replace them (see 3.3)
- [ ] MX ×3 → `mx10/20/30.antispam.mailspamprotection.com`, priorities 10/20/30
- [ ] SPF TXT at apex — **exactly one record**, verbatim
- [ ] DKIM `default._domainkey` CNAME → `evergreencleaningservice.ca.default.dkim.auto.dnssmarthost.net.`, **DNS-only, never proxied**
- [ ] DMARC `_dmarc` TXT — verbatim, `p=reject`
- [ ] `mail`, `autodiscover`, `ftp` A → `35.209.221.162`, **DNS-only, never proxied**
- [ ] CAA — none today; if one is added later it must permit Cloudflare
- [ ] Any M365 records, if they exist by then — **always DNS-only**

**Proxying a mail or service record breaks it.** `mail`, `autodiscover`,
`ftp` and every `_domainkey` record stay grey-clouded.

Then verify the Cloudflare zone answers correctly **before** delegating, by
querying its assigned nameservers directly.

### 3.3 Worker Custom Domain and TLS

A Custom Domain requires an **exact hostname match** — a Worker attached to
`example.com` does not receive `www.example.com`. So:

- Add **two** Custom Domains: `evergreencleaningservice.ca` and
  `www.evergreencleaningservice.ca`; **or**
- Add one Custom Domain and a **Redirect Rule** for the other, which also
  needs a proxied placeholder record on the redirecting hostname
  (`192.0.2.0` A or `100::` AAAA — reserved originless placeholders).

Decide which before the window; the site's canonical is
`https://www.evergreencleaningservice.ca/`, so `www` is the Custom Domain and
the apex redirects to it.

Cloudflare issues an **Advanced Certificate** on the zone for each Custom
Domain. Issuance is **not instant** — allow for it explicitly and confirm the
certificate is *active* before announcing cutover. Note: deleting a Custom
Domain does **not** delete its certificate; that is a manual cleanup.

### 3.4 Sequence

`T` is the nameserver change. No step is assigned a duration it cannot
guarantee.

| When | Step |
|---|---|
| T−48h | Lower NS and MX/SPF/DKIM TTLs. Re-run `npm run dns:snapshot`. |
| T−24h | Cloudflare zone built and reconciled against §1. Verify by querying Cloudflare's nameservers directly. |
| T−2h | Deploy the production build. Verify on the `workers.dev` URL. `npm run launch:check dist <workers.dev URL>`. |
| T−1h | Freeze WordPress edits. Final `npm run dns:snapshot` — must match the export. |
| **T** | Change nameservers at GoDaddy to the Cloudflare pair. |
| T+15m | Cloudflare reports the zone active. Custom Domains attach; certificate issuance begins. |
| T+1h | Certificate **active**. §4 checks. Expect mixed results while delegation propagates — that is propagation, not failure. |
| T+6h | Past the old 6 h NS TTL. §4 again; most resolvers now on Cloudflare. |
| T+24h | §4 again. Search Console: submit sitemap, check Coverage for a 404 spike. |
| T+48h | Convergence assumed complete. Final §4. |

**The SiteGround site stays up, unchanged, for at least 14 days.** It is the
rollback target, and a rollback into a deleted site is not a rollback.

---

## 4. Launch-day checks

Run all of these at every checkpoint in §3.4.

1. **The homepage renders.** Load it and read the body text. HTTP 200 is not a
   website — 44 domains on this estate were once reported as "serving a site"
   on the strength of a status code; 25 of them served nothing.
2. **`npm run verify:indexing -- production`** — must report indexable. A
   "CANNOT REPORT" means a challenge interstitial, not a verdict; see §6.
3. **`npm run parity -- https://www.evergreencleaningservice.ca`** — all 50
   redirect variants, both slash spellings, query strings preserved.
4. **Both paid landing pages** load, are `noindex`, show the form, and show
   `•` and `—` rather than raw entity text.
5. **Telephone links dial** `+14168034880`; one tap pushes one `phone_click`.
6. **One real lead, end to end** — form → Neon row → Resend email in the
   client's inbox. Not a simulation. Delete the row afterwards.
7. **Mail works, in both directions.** Send *to*
   `info@evergreencleaningservice.ca` from outside and confirm arrival; send
   *from* it and confirm SPF, DKIM and DMARC all pass at the receiving end.
   DMARC is `p=reject`, so a broken DKIM CNAME means mail is rejected
   outright, not filed as spam.
8. **Mobile at 390 px**, normal window and incognito, **then refresh** — a
   page on this estate once passed incognito on first load and 403'd on
   refresh.

---

## 5. Rollback

### Thresholds — decided now, so nobody has to decide them under pressure

Roll back on any one of:

| Threshold | Why it is absolute |
|---|---|
| **Any** interruption to mail delivery, in either direction | Email is the business. No website change justifies it. |
| SPF, DKIM or DMARC failing at a receiving server | With `p=reject`, this is silent total mail loss. |
| Homepage not rendering more than **30 minutes** after the certificate is active | Beyond issuance and propagation; something is wrong. |
| Lead submission fails, or a lead is accepted and not stored | A lost lead is unrecoverable and invisible. |
| Production serving `noindex` | Compounds hourly; slow to happen, slower to undo. |
| More than **5%** of the 154 redirect rules 404 | Link equity leaving. |
| 5xx above **1%** of requests over any 10-minute window | |
| Anything unexplained **4 hours** after the certificate is active | An unknown cause at 4 h will not clarify at 6. Roll back, then diagnose without the clock running. |

Do **not** roll back for: resolvers still returning old records inside the
propagation window, a slow first byte on a cold cache, a single 404 on an
unlinked address, or a Lighthouse score.

### The procedure, and its honest timing

1. Change the nameservers at GoDaddy back to `ns1`/`ns2.siteground.net`.
2. Confirm from two public resolvers (`npm run dns:snapshot`) — never from a
   panel.
3. Load the homepage and read the body text.
4. Test mail in both directions.
5. Detach the Worker Custom Domains.
6. Write down what happened **before** attempting a fix.

**Rollback is not fast, and pretending otherwise is the most dangerous thing
this document could do.** A nameserver change is bounded by the NS TTL — 6 h
at today's value, lower only if §3.1 step 5 was done days ahead — plus
resolvers that ignore TTLs, plus negative caching. **Plan for hours, and up to
48 h for full worldwide convergence.** The SiteGround zone still exists
throughout, which is what makes rollback possible at all.

This asymmetry is the strongest argument for Option 3 if the business cannot
tolerate a multi-hour worst case.

---

## 6. Production indexing safeguards

Launching with staging's `noindex` still attached deindexes the business. It
is invisible from the page and nobody notices for weeks.

**Four independent guards:**

1. `npm run build` (production) does not run `scripts/noindex.mjs`. Only
   `build:preview` does.
2. `tests/build/indexability.test.ts` asserts only the preview build is
   noindexed.
3. `npm run launch:check` refuses a build carrying a sitewide noindex.
4. `npm run verify:indexing -- production` reads the **deployed origin** — the
   only one of the four that catches a stale deploy, an edge cache or a zone
   transform rule.

Also required, and not automatable from here:

- `robots.txt` must **not** `Disallow: /`. That blocks the crawl, so the
  noindex is never read, and the URL can still be indexed from an inbound
  link with no way for the noindex to be seen.
- Both `/lp/` pages and `/thank-you/` stay noindex and stay out of the sitemap.
- Submit `https://www.evergreencleaningservice.ca/sitemap-index.xml` in Search
  Console after cutover.

### The SiteGround challenge, and why cutover ends it

Production answers this network with HTTP 202, `sg-captcha: challenge`, and a
170-byte interstitial — every path, every user-agent, including `robots.txt`.
The interstitial carries **`x-robots-tag: noindex`**.

The challenge is keyed to the **requesting IP**: the interstitial's own token
contains it (`?y=ipr:<egress IP>:…`) and it changed as this container's egress
rotated. It is not a user-agent rule — desktop, mobile, three crawler strings
and no user-agent all got identical responses.

**Investigated and not bypassed.** No user-agent whitelisted, no
crawler-specific content, no challenge solved or replayed.

Whether a *verified* Googlebot is challenged **cannot be determined from
here**. After cutover the question disappears: Cloudflare serves the site and
SiteGround's WAF leaves the path.

---

## 7. Blocked — needs access not held

| Item | Needed for |
|---|---|
| **Cloudflare account plan** | Decides whether Option 2 exists at all |
| **SiteGround CNAME-flattening support** | Decides whether Option 2 can cover the apex |
| Whether the WAF challenges verified crawlers | Whether the current site is being crawled |
| Live `robots.txt` and `sitemap_index.xml` | Redirect targets assume Rank Math defaults; unconfirmed |
| WordPress media library vs the 101-entry upload map | Images the archive never captured will 404 |
| Live page inventory | The port's URL list came from the archive; partial coverage |
| Any `.htaccess` redirects | Lost at cutover, invisible from outside |
| Full SiteGround DNS zone export | §1 is built from public resolvers and may miss a record nothing queries |
| Whether SiteGround also serves mail | It does, on this evidence — decides whether the account can ever close |

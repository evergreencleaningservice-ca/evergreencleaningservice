# Phase 11 — telephone-click and advertising-platform tracking

**Commit** `3b3c39e` on `claude/optimistic-clarke-wz1p8g`. Deployed to staging
as version **`c922f141-60ae-4e19-b128-215228203461`**.

**509 tests pass across 17 files**, 61 of them new.

Nothing in production, DNS, GTM, Google Ads, GA4, Microsoft UET,
CallTrackingMetrics, the Neon schema or data was touched. **No test lead was
created.** The container specification in `docs/gtm-handoff.md` §7 is written
for the account owner and has **not** been applied.

---

## 1. The baseline

### 1.1 What existed

**115 `tel:` links across all 77 pages.** Every page carries at least one.
Every destination was already the canonical `tel:+14168034880` — no
unnormalised `tel://`, no local formatting, no stray numbers.

| Location (inferred — nothing was labelled) | Links | Pages | Displayed as |
| --- | --- | --- | --- |
| Site header navigation | 74 | 74 | "Call Now: (416) 803-4880" |
| Body content | 35 | 23 | five different wordings, incl. a bare "Call Now" |
| Paid landing-page header | 3 | 3 | "Call(416) 803-4880" |
| Paid sticky bar | 2 | 2 | "Call (416) 803-4880" |
| Quote-page trust panel | 1 | 1 | "(416) 803-4880" |
| **Footer** | **0** | — | **the site has no footer telephone link** |

Raw data: `.measure/p11/tel-before.json`.

### 1.2 Could they be dynamically replaced?

**Yes — and they are.** See §1.4.

### 1.3 Did duplicate listeners already exist?

Yes, in the sense that mattered. `LandingLayout` bound a **separate listener
to every `tel:` anchor** on the three pages using that shell. Per-anchor
binding is the pattern where a second initialisation silently doubles every
event. Eight links carried a legacy `data-call` marker that nothing read.

### 1.4 Does the container recognise telephone clicks?

**No.** From the Phase 1 container read, unchanged: four trigger rules, and
the only link trigger is on `mailto:`. Counted in the container source:
`tel:` **0**, `click_to_call` **0**, `phone_click` **0**.

So the old event had no trigger and went nowhere — which, given §1.5, was
fortunate.

### 1.5 What `535014.tctm.co` does

Determined by reading it, not by assuming.

- `535014.tctm.co` is a CNAME to `drb0k2mg1d7gh.cloudfront.net`. Its root
  serves a 43-byte 1×1 GIF; the container requests **`/t.js`**, 47,325 bytes.
- The script declares `window.__ctm` with `config: { aid: 535014, cookie_dur:
  30, host: "535014.tctm.co" }`. **This is CallTrackingMetrics** — `__ctm` is
  their namespace, `tctm.co` their tracking domain, `aid` the account id. It
  reaches the page through the SearchKings container template, account 535014.
- It carries **three dynamic-number-insertion rules**, each replacing the
  canonical `1.416.803.4880`:

  | Rule | Fires for | CTM number id |
  | --- | --- | --- |
  | Google Ads (Performance Max) [Cleaning] | `pmax=true` with google/cpc, or `gclid`/`wbraid`/`gbraid` | 2278896 |
  | Google Ads [Cleaning] | google/cpc, or `gclid`/`wbraid`/`gbraid` | 2161590 |
  | Bing Paid [Cleaning] | Microsoft paid traffic | 2176788 |

- Its own code rewrites **both** the anchor's `innerHTML` and its `href`
  (`"doing the href swap"`), and honours `.ctm-no-swap` and `__ctm.no_swap`
  opt-outs. **Nothing was added to opt out** — the swapping is wanted.

**Nothing was removed or changed.** ClickCease and the SearchKings script also
load; both are left exactly as they are.

### 1.6 The defect this exposed

The old handler pushed the number **hardcoded**:

```js
{ event: 'click_to_call', phone_number: '+14168034880', phone_destination: 'tel:…' }
```

A visitor arriving on a Google Ads click sees and dials a **tracking** number.
The event named the canonical one. **The report could never be reconciled
against the call-tracking account it exists to match** — and it was wrong for
exactly the visitors whose calls are being paid for.

---

## 2. What was built

One delegated, sitewide listener in `src/lib/phone-click.ts`, installed by
`src/components/PhoneTracking.astro` from both layouts.

```js
{
  event:              'phone_click',
  page_path:          '/services/office-cleaning/',
  link_location:      'header',
  displayed_number:   '(416) 803-4880',
  destination_number: '+14168034880',
  tracking_provider:  'calltrackingmetrics'
}
```

**Delegated, not per-anchor**, for a reason specific to this site:
CallTrackingMetrics replaces the anchor's `innerHTML`, so a listener bound to a
child would be discarded with it. Delegation also makes double-binding
impossible, and covers links added after load.

**Capture phase**, so the event is recorded before any handler added later by
the container could stop propagation.

**Idempotent** — the guard is on the document, so a second initialisation is a
no-op.

`click_to_call` is **retired**; a test asserts the string no longer appears in
anything the browser executes.

### Requirements, point by point

| Requirement | How |
| --- | --- |
| Number displayed at click time | Read from `textContent` on activation, not from source |
| Destination at click time | Read from the `href` attribute on activation |
| Stable `link_location` | Controlled list of ten, chosen by the component |
| No visitor or caller information | Six fields, asserted exactly; no identifier of any kind |
| No PII | Tested with a filled-in form on the page |
| Never on load or render | Tested |
| Never for non-telephone links | Tested: mailto, internal, button, background |
| Nested icon → one event | `closest()` from the event target; tested |
| Keyboard activation | Enter on a link dispatches a real `click`; tested, and verified on staging |
| Re-init → no duplicates | Guard on the document; tested three ways |
| Two intentional clicks → two events | Tested, and verified on staging |
| Does not prevent or delay the call | No `preventDefault`; pushed synchronously; tested |

---

## 3. Dynamic-number compatibility

`(416) 803-4880` remains canonical in the source HTML, `src/data/site.ts`, the
footer, the JSON-LD (`+1-416-803-4880`) and every non-replaced fallback. **No
tracking number is hardcoded anywhere** — a test scans every built page and
asserts `tel:` resolves to exactly one number.

`tracking_provider` is `calltrackingmetrics` when `window.__ctm` is present and
**`unknown`** otherwise — never `none`, because this cannot prove the absence
of a provider it has not heard of.

---

## 4. Location metadata

Ten controlled values. **All 115 links now carry an explicit
`data-call-location`** — verified as a build gate, so a link without one is a
failure rather than a silent default.

| Value | Source | Links |
| --- | --- | --- |
| `header` | `Header.astro` nav item | 74 |
| `mobile_navigation` | the same anchor, while the drawer is open | — |
| `hero` | `home/Hero.astro` | 1 |
| `content` | page templates and Markdown prose | 29 |
| `quote_sidebar` | `QuoteAside.astro` | 1 |
| `paid_header` | `LandingLayout.astro` | 3 |
| `paid_sticky` | `LpSticky.astro` | 2 |
| `paid_cta` | `LpFinalCta.astro` | 2 |
| `form_note` | `QuickQuoteForm.astro` | 3 |
| `footer` | **unused — no footer telephone link exists** | 0 |

**The fallback.** A link with no metadata reports `content`, and a value not on
the list is rejected rather than passed through — otherwise any page could
invent a dimension. But the fallback is now unreachable from this site's own
markup: the twenty-nine Markdown-authored links are stamped `content` by
`normalizeBody`, at build time, where they can be counted.

**The navigation is one anchor with two honest answers.** It is a horizontal
bar on a desktop and a drawer on a phone. The value is resolved from whether
the drawer is open when it is clicked — never from the link's text.

---

## 5. Form tracking

Unchanged and verified unchanged: `lead_form_submission`, all four form ids
(`quick-quote`, `ppc-lead-form`, `lp-commercial-cleaning-quote`,
`contact-form-1384`), attribution storage, validation, confirmation, Turnstile,
Neon, Resend, and every existing conversion protection.

A test asserts a telephone click never pushes the lead event. On staging, all
three forms still report the right `form_id`, seven fields, four required, four
fields marked invalid on an empty submit, Turnstile token present, and **zero
`lead_form_submission` and zero `phone_click` events** from form interaction.

---

## 6. Advertising-platform handoff

`docs/gtm-handoff.md` §7 is rewritten from "not yet in scope" into the full
specification: the five Data Layer Variables, the Custom Event trigger, the
GA4 event tag with a recommendation on the key event, a **separate** Google Ads
conversion action, the UET mapping, three layers of duplicate protection, and a
twelve-step verification sequence ending with the dynamic-number case.

**It states plainly that a telephone click is not a qualified call**, and that
it must not be given the same value as a stored quote request without the
advertising owner's approval. The honest default recommended is **no value,
count One**, until call-duration data from CallTrackingMetrics exists to base
one on.

**None of it has been applied.**

---

## 7. Tests

**509 pass, 17 files.** 61 new:

| File | Env | Tests |
| --- | --- | --- |
| `tests/phone-click.test.ts` | happy-dom | 34 |
| `tests/build/phone-links.test.ts` | node | 27 |

Every case the brief listed is covered, plus the uppercase `TEL:` scheme,
extension and pause suffixes, a link showing no number, and a value not on the
controlled list.

### Two defects the tests found

1. **The displayed-number pattern dropped the leading bracket**, reporting
   `416) 803-4880` — an unbalanced bracket in every row of the eventual report.
2. **The suite was wrong before the code was.** It cleared the idempotence
   guard between cases without removing the listener; on a document happy-dom
   reuses across a file, the listeners piled up and twelve cases failed for a
   reason unrelated to the code. `unwirePhoneClicks` exists so the guard can be
   *tested* rather than assumed.

A third correction, in a test rather than the code: the build test looked for
the handler only in `_astro/*.js`, but Astro inlines a module this small into
each page. The assertion now asks the question that matters — does the code
reach the page.

---

## 8. Staging verification

Deployed from `3b3c39e`, edge cache purged. Verified in a real browser.

**The dialer was suppressed inside the harness only**, by a listener bound at
the **bubble** phase — after the site's capture-phase listener had already
pushed the event. The real click path is what was measured; only the hand-off
of a `tel:` URL to an operating system with no telephone was prevented.

### Every location, both widths — 13 of 13 passed

| Location | Page | Width | Events | `link_location` | Displayed | Destination | Provider |
| --- | --- | --- | --- | --- | --- | --- | --- |
| header | `/` | 1440 | +1 | `header` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| header → drawer opened | `/` | 390 | +1 | `mobile_navigation` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| hero | `/` | 1440 | +1 | `hero` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| content | `/services/office-cleaning/` | 1440 | +1 | `content` | *(empty — "Call Now")* | +14168034880 | calltrackingmetrics |
| quote sidebar | `/request-a-quote/` | 1440, 390 | +1 | `quote_sidebar` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| paid header | `/lp/commercial-cleaning/` | 1440, 390 | +1 | `paid_header` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| paid sticky | `/lp/commercial-cleaning/` | 390 | +1 | `paid_sticky` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| paid CTA | `/lp/commercial-cleaning-quote/` | 1440 | +1 | `paid_cta` | (416) 803-4880 | +14168034880 | calltrackingmetrics |
| form note | `/lp/commercial-cleaning-quote/` | 1440 | +1 | `form_note` | (416) 803-4880 | +14168034880 | calltrackingmetrics |

Plus: **keyboard Enter → 1 event; a second activation → 2 total.** An internal
link → **0**. Zero `lead_form_submission`, zero `click_to_call`, **no
JavaScript errors** anywhere.

### Sample events from deployed staging

```json
{"event":"phone_click","page_path":"/","link_location":"header",
 "displayed_number":"(416) 803-4880","destination_number":"+14168034880",
 "tracking_provider":"calltrackingmetrics","gtm.uniqueEventId":16}

{"event":"phone_click","page_path":"/","link_location":"mobile_navigation",
 "displayed_number":"(416) 803-4880","destination_number":"+14168034880",
 "tracking_provider":"calltrackingmetrics","gtm.uniqueEventId":16}

{"event":"phone_click","page_path":"/services/office-cleaning/","link_location":"content",
 "displayed_number":"","destination_number":"+14168034880",
 "tracking_provider":"calltrackingmetrics","gtm.uniqueEventId":16}
```

`gtm.uniqueEventId` is GTM's, stamped onto every pushed object after the fact.
The site pushes six fields; the seventh is the container's. An earlier run of
this check failed on a strict six-key assertion — the assertion was wrong, not
the event.

### Dynamic-number evidence — the decisive test

Run against **deployed staging with real CallTrackingMetrics**, not a
simulation:

| Arrival | Page shows | `tel:` href | Event `displayed_number` | Event `destination_number` |
| --- | --- | --- | --- | --- |
| organic, no parameters | "Call now (416) 803-4880" | `tel:+14168034880` | **(416) 803-4880** | **+14168034880** |
| `?gclid=P11VERIFY456` | "Call now **(437) 291-7507**" | `tel:+14372917507` | **(437) 291-7507** | **+14372917507** |

**CallTrackingMetrics really does swap the number on this site**, to
**(437) 291-7507** for a Google Ads arrival, and the event reports exactly what
the visitor saw and dialled. The old hardcoded handler would have reported
`+14168034880` for that call.

Also verified: a simulated swap of both halves is reported correctly, and a
**half-applied** swap — label changed, href not — is reported as the
disagreement it is rather than being reconciled away.

### What was not touched

| | Evidence |
| --- | --- |
| Production | Nameservers still `ns1/ns2.siteground.net`. Worker bound to the staging hostname alone. |
| DNS | No record created, edited or deleted. |
| GTM | Staging still serves `GTM-5PRC4HBV`. No Tag Manager API call. |
| Google Ads / GA4 / UET | No API call, no credential used. |
| CallTrackingMetrics | Read its public script only. No account access, nothing changed, nothing removed. |
| Neon | Read-only `SELECT`. **20 rows, highest id 20, newest still the 11:48 UTC Phase 9 test lead.** |

---

## 9. What needs account access

Everything downstream of the website. The site's half is finished and tested.

| Needs | For |
| --- | --- |
| GTM publish rights on `GTM-5PRC4HBV` | The variables, trigger and tags in §7 of the handoff |
| Google Ads access to `AW-16819334998` | The separate telephone-click conversion action |
| GA4 access to `G-R27QW21PMT` | The event, its custom dimensions, the key-event decision |
| Microsoft Ads access to UET `187178776` | The custom-event mapping |
| CallTrackingMetrics account `535014` | Call outcomes and durations — the only place a defensible conversion **value** can come from. Also where the (437) 291-7507 number lives. |
| Ownership after SearchKings | Still blocker A1, unresolved |

Until ownership is resolved the site reports zero form conversions **and zero
telephone clicks** from the moment DNS moves, because nothing consumes either
event.

---

## 10. Two things worth your attention

**The footer has no telephone link, on either layout.** The brief listed
`footer` as a location and the site does not have one. Adding one is a content
decision rather than a tracking one, so nothing was added; the value exists and
reads zero, and a test records it so that adding one later is deliberate.

**Five service pages show a bare "Call Now" with no number.** Those events
carry `displayed_number: ""`, which is the honest value — the visitor saw no
number. Worth deciding whether the copy should show one.

---

## 11. Proposed scope for Phase 12 — crawler/WAF testing and launch readiness

For approval. Not started.

### 11.1 The thing that makes this phase necessary

`https://www.evergreencleaningservice.ca/` answers **HTTP 202 with a SiteGround
captcha interstitial** (`/.well-known/sgcaptcha/`) to this container — with a
browser user agent, repeatedly. That is SiteGround's bot protection responding
to a datacentre IP.

**Whatever refuses this container may also refuse a crawler.** That is the
question Phase 12 exists to answer, before DNS moves rather than after.

### 11.2 Proposed work

1. **Crawl the built site as a search engine would.** Every one of the 77
   pages plus the 130 redirect rules: status, redirect chains, canonical,
   robots directives, and the `_headers`/`_redirects` behaviour as Cloudflare
   actually applies them rather than as the repository states them.
2. **Test what the production WAF does to crawlers.** Establish whether
   SiteGround's interstitial affects Googlebot and Bingbot today, and whether
   anything equivalent exists on the Cloudflare side that would after cutover.
   Read-only; nothing in either account changes without approval.
3. **Verify the 1,638 legacy addresses still resolve**, against the gate 0.4
   inventory — the check that has to pass before the old site can be switched
   off.
4. **The go-live checklist as an executable gate**: remove the staging noindex,
   confirm production indexability, confirm the sitemap, confirm the canonical
   host, confirm `X-Robots-Tag` is gone from production and present on staging.
5. **Separate the staging and production databases**, per the decision already
   recorded — one Neon branch, the credential swap, and the test rows dealt
   with. Branch limit 10, one in use; the plan limits were re-verified in the
   Phase 9 report §10.
6. **A launch-readiness report**: what is proven, what is blocked on account
   access, and what carries residual risk at cutover.

### 11.3 What Phase 12 should not do

- Not cut DNS over. That is a decision and an attended operation, not an
  automated step.
- Not change the WAF, SiteGround or Cloudflare security settings without
  naming the change and getting approval first.
- Not delete the 20 test rows without authorisation.
- Not apply the GTM container changes — still blocked on ownership.

### 11.4 What I would need

- Confirmation of the intended cutover date, since several checks are
  time-sensitive.
- Whether SiteGround access exists, for the WAF question in 11.2.
- Approval to create one Neon branch for 11.5.

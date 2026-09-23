# Phase 10 — the paid-search landing pages

**Commit** `c4ca12a` on `claude/optimistic-clarke-wz1p8g`. Deployed to staging
as version **`9fa184b8-e280-4f22-8757-cd890bf1a9df`**.

Scope as agreed: the two existing landing pages only. **No new landing pages
were created** — not until the real Google Ads and Microsoft Ads ad groups and
final URLs are known. Both URLs are unchanged.

Nothing in production, DNS, GTM, Google Ads, GA4, Microsoft UET, the Neon
schema or data, or the Turnstile credentials was touched. **No test lead was
created**; §9 says how submission was verified without one.

---

## 1. Baseline — what the two pages were

Measured before any edit, both pages at three widths, one instrument.
Screenshots in `.measure/p10/`, raw data in `.measure/p10/census-before.json`.

| | `/lp/commercial-cleaning/` | `/lp/commercial-cleaning-quote/` |
| --- | --- | --- |
| **Intent** | broad service search — "commercial cleaning Toronto" | quote-intent — "commercial cleaning quote" |
| **H1** | "Reliable Commercial Cleaning You Can Count On Every Single Night." | "Toronto & GTA Commercial Cleaning You Can Count On." |
| **Title** | Toronto & GTA Commercial Office Cleaning Quotes \| Evergreen | Commercial Cleaning Quote — Toronto & GTA \| Evergreen Office Cleaning |
| **Visible offer** | free on-site proposal, reply within 2 business hours | free walkthrough and custom quote, reply within 2 business hours |
| **Form fields** | 5 — fullName, workEmail, phone, facilityType, facilitySize | 5 — name, email, phone, facility_type, size |
| **Required** | 4 of 5 | **5 of 5** |
| **Form top @390** | **1,006px** (below the fold) | 598px |
| **Form top @1440** | 121px | 117px |
| **Form height @390** | 589px | 626px |
| **Page height @390** | 3,424px | 2,778px |
| **Navigation** | already minimal — logo, phone | already minimal — logo, phone |
| **Footer** | copyright, address, Privacy Policy, **Terms of Service** | same |
| **CTAs** | submit, sticky call, sticky quote, header phone | submit, sticky call, sticky quote, header phone, mid-page jump |
| **Trust claims** | 3 badges + "Serving Toronto since 1989" | 4 badges + "Serving Toronto since 1989" |
| **Testimonials** | 4 reviews, no stars | 3 reviews **with star rows** |
| **Service content** | 4 differentiators, 3-step process | 4 differentiators, no process |
| **Facility content** | 5 types, inside the form as a required select | 5 types, inside the form as a required select |
| **`form_id` (reporting)** | `ppc-lead-form` | **`lp-commercial-cleaning-quote`** |
| **Form element id** | `ppc-lead-form` | `lpq-form` |
| **Success** | redirect to `/thank-you/?f=…` | redirect to `/thank-you/?f=…` |
| **Turnstile** | deferred (observer + focus) | deferred (observer + focus) |
| **Lighthouse** | perf 98, **a11y 100**, BP 96, FCP 1,811ms, LCP 1,811ms, CLS 0.0307 | perf 98, **a11y 96**, BP 96, FCP 1,881ms, LCP 1,956ms, CLS 0.0013 |
| **Service areas** | none on the page | none on the page |

### The duplication

Not similar pages — two independent implementations of one offer:

- Two hero grids differing by **10px of gap and 10px of column width**, with no
  recorded reason.
- **Two sets of four "differentiators", of which only two agreed.** One page
  said "WSIB Insured & Bonded", the other "WSIB Insured, Bonded &
  Background-Checked Cleaners"; one "Dedicated Crew", the other "Dedicated
  Account Representative for Every Client".
- Two honeypots with different field sets, two sticky bars, two error boxes,
  two submit pipelines with the same options typed twice.
- **~400 lines of near-identical CSS each**, including a
  `@media (min-width: 768px)` block on `/lp/commercial-cleaning/` that
  re-declared `.lp-eyebrow` and `.lp-rating` identically to the rules above it
  — dead weight from an edit that was never finished.
- Two facility-type lists, five entries each, differently worded.

They drifted because nothing stopped them. The most expensive drift was Phase
7's: an invented **"4.9/5 Google Rating"** had to be found and removed from
**both**, separately.

### Three defects the baseline surfaced

1. **`/lp/commercial-cleaning/`'s form was below the fold at 390px** — 1,006px
   down, behind four bullet points a visitor had to scroll past before they
   could act on a click somebody paid for.
2. **`/lp/commercial-cleaning-quote/` scored 96 on accessibility**, failing
   `aria-prohibited-attr`: the review cards put `aria-label` on a `<p>`, and a
   paragraph has no accessible name to set.
3. **The footer's "Terms of Service" pointed at `/privacy/`.** There is no
   terms document on this site.

---

## 2. The reusable system

| File | What it is |
| --- | --- |
| `src/layouts/LandingLayout.astro` | The shell: minimal header, legal footer, noindex, canonical, GTM, attribution. Gains a `quoteAnchor` prop for the header Quote button. |
| `src/styles/landing.css` | One stylesheet in place of ~800 lines of duplicated CSS. |
| `src/data/landing.ts` | **The copy.** Benefits, facility types, trust points, service area, the reply promise — stated once. |
| `src/components/lp/LpHero.astro` | Eyebrow, H1, sub-line, trust points, and a slot for the form. |
| `src/components/lp/LpBenefits.astro` | The four verified benefits. |
| `src/components/lp/LpFacilities.astro` | The six facility types. |
| `src/components/lp/LpReviews.astro` | Genuine reviews, selectable by name. |
| `src/components/lp/LpAreas.astro` | The service area as text, not ten links. |
| `src/components/lp/LpFinalCta.astro` | Call, or back to the form. |
| `src/components/lp/LpSticky.astro` | The phone-only sticky bar. |

Each page file is now **~90 lines, most of it comment**, carrying the three
things that genuinely differ: intent, headline, reporting identity.

A test asserts both pages print the same benefits, facilities and trust points,
and that neither has a benefit card the other lacks — the concrete form of
"they agree about the business".

### The reporting identities, and one that is not what it looks like

**This is the one thing in Phase 10 worth reading twice.**

The brief asked to preserve `ppc-lead-form` and `lpq-form`. `ppc-lead-form` is
correct. **`lpq-form` is the form's DOM element id, not its reporting
identity.** The value that page has always sent in `form_id` — on the
conversion event and into the `form_id` column in Neon, where **two rows
already carry it** — is `lp-commercial-cleaning-quote`.

That discrepancy came from my own Phase 9 report, which listed the DOM id in a
table headed "Form id". It is corrected here.

Both are preserved, each doing its own job:

| | Element id / anchor | Reporting identity |
| --- | --- | --- |
| `/lp/commercial-cleaning/` | `ppc-lead-form` | `ppc-lead-form` |
| `/lp/commercial-cleaning-quote/` | `lpq-form` | `lp-commercial-cleaning-quote` |

So `#lpq-form` links still resolve, and the rows already recorded still line up
with the rows to come. **Say the word and the reporting id becomes `lpq-form`
instead** — it is one constant and two test expectations — but it would orphan
the two existing rows, so the default here is continuity.

---

## 3. The layout, against the brief

| Required | Where |
| --- | --- |
| One clear, intent-matched H1 | One `<h1>` per page, verified on the deployed origin |
| Toronto/GTA value proposition | `LpHero` sub-line, both pages |
| The real number, (416) 803-4880 | Header, final CTA, sticky bar — 4 `tel:` links, all `tel:+14168034880` |
| Visible Call Now | Header call block, final CTA button, sticky bar |
| Short form above the fold | @390: **498px** and **474px**, viewport 844 — above the fold at all three widths on both |
| "Serving Toronto since 1989" | First of the four trust points in `LpHero` |
| Verified service benefits | `LpBenefits`, four cards |
| Relevant facility types | `LpFacilities`, six cards — on the page, not as a required form field |
| Genuine testimonials | `LpReviews`, three real Google reviews |
| Service-area information | `LpAreas`, one line, no links |
| Final call and quote CTA | `LpFinalCta` |

### Claims removed

| Removed | Why |
| --- | --- |
| "Google Verified Reviews — 5-star rated by local clients" | An aggregate rating nobody has verified — the same shape Phase 7 removed |
| "Request Same-Day Walkthrough" | A response time nobody has committed to |
| "100% Privacy Protected. No spam, ever." | A guarantee |
| "WSIB Ontario — Registered and in good standing" | Stronger than the client's own words |
| "Terms of Service" link | Labelled a document that does not exist |

Per-review star rows **stay**: each is the rating that reviewer left, which is
a fact about that review. There is no average, no count and no "rated N/5"
anywhere, and a test enforces it.

**"A reply within 2 business hours" is kept.** It is not new — it is the
promise both pages have carried since Phase 3 and which `/request-a-quote/`
adopted in Phase 9. It is now stated once, in `src/data/landing.ts`, instead of
in three wordings. Nothing faster is claimed anywhere.

---

## 4. Distraction

| | Before | After |
| --- | --- | --- |
| Links that leave the page | 2 (self, `/privacy/`) | 2 (self, `/privacy/`) |
| Header links | 2 — logo, phone | 3 — logo, phone, **Quote** |
| Footer links | 2 — Privacy, **Terms (mislabelled)** | **1** — Privacy |
| In-page anchors | 1–2 | 3, all to this page's form |
| Site navigation | already absent | still absent, now asserted |

The pages were already isolated; Phase 10 adds the Quote button, removes the
mislabelled link, and makes the isolation a tested property rather than a
convention. Tests assert no `/services/`, `/about-us/`, `/contact-us/`,
`/locations/`, `/category/blog/`, `/reviews/` or `/search/` link, and no site
header or sidebar markers.

The sticky bar is phones-only, carries Call and Free quote, and `body.lp`
reserves 76px of bottom padding against its 56px height. §7 has the
measurement.

---

## 5. Forms and conversion tracking

Both pages use the Phase 9 `QuickQuoteForm`, which gained three props:
`formId` (the reporting identity), `submitLabel`, and `eagerCaptcha`.

| Requirement | Status |
| --- | --- |
| Telephone or email required, both accepted | Neither field is `required`; `contactMethodProblem` enforces the pair |
| No street address required | No `address1`, `city`, `state` field exists; one "postal code or city" box |
| Existing `form_id` preserved | `ppc-lead-form` and `lp-commercial-cleaning-quote`, asserted per page |
| First-touch and session attribution | Merged by `lead-submit.ts`, unchanged |
| Honeypot and Turnstile | Both present, asserted in the build tests |
| `lead_form_submission` sole conversion | Pushed only by `lead-submit.ts` after a 2xx; neither page's HTML names the event |
| Exactly one event per stored lead | Verified in a real browser, both pages, both widths |
| No PII in the data layer | Verified — the event carries `event` and `form_id` only |
| No thank-you-page conversion | **Both pages no longer navigate to `/thank-you/` at all** |
| In-page success state preferred | Adopted; `awaitTagDelivery` dropped with the redirect it existed for |
| Turnstile may load immediately | `eagerCaptcha` — the form is in the first screen, so the observer would fire on load anyway and the focus path would be a race |

---

## 6. SEO and indexing

| | Both pages |
| --- | --- |
| `<meta name="robots">` | `noindex, nofollow` |
| Deployed `X-Robots-Tag` | `noindex, nofollow`, HTTP 200 |
| Sitemap | absent |
| Canonical | each to its own production URL, deliberately self-referential |
| Linked from indexable pages | **none** — asserted by walking every built page and checking which are not noindex |
| URLs | unchanged, so future advertising links cannot break |

---

## 7. Accessibility and mobile usability

| Check | Result |
| --- | --- |
| Heading hierarchy | Lighthouse `heading-order` passes; one H1, sections H2 |
| Labels and error association | 7 labels, 0 placeholders, `aria-describedby` to each error slot |
| Keyboard completion | **40/40 checks, both pages, 390 and 1440** |
| Screen-reader success and failure | Error summary `role="alert" aria-live="assertive"`, takes focus; success `role="status"`, takes focus |
| Visible focus indicators | Every field takes a visible ring; asserted |
| Horizontal overflow | none at 390, 768, 1440 |
| CTA covering form controls | **none** — every control lands ≥48px clear of the bar |
| Colour contrast | Lighthouse `color-contrast` passes on both; a11y **100** |
| Tap targets | 0 controls under 44px (was 5 and 3) |
| Layout shift from validation | Error slots are height-reserved; CLS 0 |
| Telephone links | 4 per page, all `tel:+14168034880` |

### A caution about one of those checks

`scripts/sticky-clearance.mjs` is new, and **its first three runs reported a
defect that does not exist.** It focused controls in sequence without resetting
the scroll, on a site that sets `scroll-behavior: smooth`, so it was measuring
positions the page was still travelling through — including one impossible
reading of a field above the top of the viewport.

Measured properly, both pages pass with **48px** of clearance on the tightest
control. The `scroll-margin-bottom` rule added in response to the false alarm
is **kept as a guard and labelled as one**: both pages pass with it and without
it, verified by building both ways. Nothing here claims it repaired anything.

The check is now held to WCAG 2.2's **2.4.11 Focus Not Obscured (Minimum, AA)**
— a focused control must never be entirely hidden — plus a requirement that at
least 44px stays clear, so what remains is usable. The AAA variant, 2.4.12, is
not achievable with any fixed bottom bar: content passes underneath one by
definition.

---

## 8. Measurements

One instrument on both sides (`scripts/lp-census.mjs`, `scripts/lh-local.mjs`),
served over loopback. **Absolute timings are not production numbers**; the
difference is the change.

### `/lp/commercial-cleaning/`

| | Before | After |
| --- | --- | --- |
| Visible fields | 5 | **7** |
| Required fields | 4 | **4** |
| Placeholders used | 3 | **0** |
| Controls under 44px | 5 | **0** |
| Form top @390 | 1,006px (**below fold**) | **498px** |
| Form top @768 / @1440 | 703px / 121px | 447px / 151px |
| Page height @390 | 3,424px | 4,620px |
| Requests | 11 | 11 |
| Transferred bytes | 144,996 | 147,814 |
| Performance | 98 | **99** |
| Accessibility | 100 | 100 |
| Best Practices | 96 | 96 |
| FCP | 1,811ms | **1,348ms** |
| LCP | 1,811ms | 1,952ms |
| CLS @390 / 768 / 1440 | 0.0286 / 0.0082 / 0.0089 | **0 / 0 / 0** |

### `/lp/commercial-cleaning-quote/`

| | Before | After |
| --- | --- | --- |
| Visible fields | 5 | **7** |
| Required fields | **5** | **4** |
| Placeholders used | 3 | **0** |
| Controls under 44px | 3 | **0** |
| Form top @390 | 598px | **474px** |
| Form top @768 / @1440 | 485px / 117px | 447px / 151px |
| Page height @390 | 2,778px | 4,596px |
| Requests | 11 | 11 |
| Transferred bytes | 144,384 | 147,672 |
| Performance | 98 | **99** |
| Accessibility | **96** | **100** |
| Best Practices | 96 | 96 |
| FCP | 1,881ms | **1,279ms** |
| LCP | 1,956ms | 1,877ms |
| CLS @390 / 768 / 1440 | 0.0012 / 0.0028 / 0.0041 | **0 / 0 / 0** |

### Reading those numbers honestly

**More fields, fewer required.** Seven visible against five, because the short
form asks for a business name and an optional message the old ones did not. But
the quote page went from requiring *all five* of its fields to requiring four
of seven, and on both pages a phone number **or** an email is now enough. The
number that matters is what a visitor must supply before the form will accept
them, and that fell.

**The pages are longer** — 3,424px → 4,620px at 390. That is the benefits,
facilities, service area and final CTA the brief asks for. The trade is that
the form sits 508px higher up on `/lp/commercial-cleaning/` and is in the first
screen at every width on both.

**CLS is zero, and the cause is worth recording.** Blocking woff2 took it to
exactly 0, which identified the whole of it as the webfont swap: the fonts are
same-origin and not discoverable until `global.css` has been fetched and
parsed, so the headline painted in the fallback and the page reflowed when
Raleway arrived. Preloading the two faces the first screen uses fixes it **with
no extra requests** — they were already being fetched, just later.
`font-display: swap` is kept.

**LCP rose slightly on `/lp/commercial-cleaning/`**, 1,811 → 1,952ms, while FCP
fell 463ms. The largest element changed: the page now paints its headline
sooner and its LCP candidate is further down. Both figures are loopback
medians of three and neither is a production number.

**+2,818 and +3,288 bytes** for the two pages: the added sections, less the
logo now served as AVIF.

### Screenshots

`.measure/p10/` — `lp1-{390,768,1440}-{before,after}.png` and the same for
`lp2`, plus `census-before.json` and `census.json`.

---

## 9. Deployment and verification

Deployed to staging only, from `c4ca12a`, after 448 tests passed.

| | |
| --- | --- |
| Staging version | **`9fa184b8-e280-4f22-8757-cd890bf1a9df`** |
| Worker hostname binding | `evergreencleaningservice.10xconnections.com` only |
| Test suite | **448 pass, 15 files** (70 new) |
| Preview build | clean — 130 redirect rules, noindex applied, 1,138 image references repointed |

Verified on the deployed origin, both pages at 390 and 1440:

| Check | Result |
| --- | --- |
| HTTP status | 200, both |
| `X-Robots-Tag` | `noindex, nofollow`, both |
| Form element id | `ppc-lead-form` / `lpq-form` |
| Reporting `form_id` | `ppc-lead-form` / `lp-commercial-cleaning-quote` |
| Fields / required | 7 / 4, both |
| H1 count | 1, both |
| Telephone | one distinct `tel:` href, `tel:+14168034880`, and the number in the text |
| Turnstile token field | present — the eager loader ran and Cloudflare answered |
| Stray navigation links | 0 |
| Horizontal overflow | none |
| Client-side validation | empty submit refused, 4 fields marked `aria-invalid`, summary shown |
| JavaScript errors | **none** |

### Submission verified without writing a lead

No Neon row was created. Three non-writing lines of evidence:

1. **448 automated tests**, including 45 behavioural tests of the shared form
   and 34 of the endpoint's validation.
2. **The keyboard script**, run against the built pages, which stubs the
   endpoint *inside the browser* — a full phone-only submission, the conversion
   event, and the in-place confirmation, with nothing leaving the process.
   40/40 on both pages.
3. **The deployed pages driven in a real browser** as far as client-side
   validation: an empty submit is refused before any request is made.

**Neon afterwards: 20 rows, highest id 20, newest still the 11:48 UTC Phase 9
test lead.** Read-only `SELECT`.

### What was not touched

| | Evidence |
| --- | --- |
| Production | Nameservers still `ns1/ns2.siteground.net`. The Worker is bound to the staging hostname alone. |
| DNS | No record created, edited or deleted. |
| GTM | Staging still serves `GTM-5PRC4HBV`. No Tag Manager API call. |
| Google Ads / GA4 / Microsoft UET | No API call, no credential used. |
| Neon | Read-only `SELECT` only. No schema change, no write. |
| Turnstile | Staging still uses the published test key. |

One note on the DNS reading: the apex A records returned two of the same four
addresses as the Phase 9 check and two different ones. That is Google Cloud
load-balancer rotation at SiteGround's end — round-robin DNS handing out a
different subset — not a change to the zone. The nameservers, which are what
would actually indicate a change, are identical.

---

## 10. What Phase 10 did not do

- **No new landing pages.** Per the recorded decision: not until the actual ad
  groups, keywords and final URLs are known.
- **No tracking number.** The real number everywhere, in visible content,
  schema and footer. Dynamic number insertion is Phase 11.
- **No change to GTM, Ads, GA4 or UET.**
- **No conversion-rate claim.** This reduced form friction, moved the form into
  the first screen, removed five unsupportable claims and fixed an
  accessibility defect. Whether any of that produces more leads is not knowable
  until real advertising data exists.
- **`astro check` still not run** — `@astrojs/check` is not installed and
  installing it would change the environment mid-phase.

---

## 11. Remaining blockers

Unchanged from Phase 9, none introduced here:

| | |
| --- | --- |
| **A production Turnstile key pair** | None issued. Staging runs the published test key. |
| **GTM has no trigger for `lead_form_submission`** | The site pushes the event correctly; nothing consumes it. Needs container access. |
| **Ad-account structure unknown** | Blocks any decision about further landing pages, and is the first input Phase 11 needs. |
| **Staging and production share one database** | Recommendation written, nothing executed, Phase 12. |
| **Six-hour PITR on Neon free_v3** | A business decision. |

---

## 12. One open question for you

The quote page's reporting identity is `lp-commercial-cleaning-quote`, not
`lpq-form` as the brief assumed — see §2. It is preserved as-is so the two
existing Neon rows stay comparable with future ones.

If you would rather it became `lpq-form`, that is a one-line change plus two
test expectations, and best done before any real traffic runs. It is the only
thing in Phase 10 I have decided on your behalf.

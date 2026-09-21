# Phase 9 — improve the quote experience

**Commits** `2302e7c` (the change) and `dfa1f6d` (the measurement tooling), on
`claude/optimistic-clarke-wz1p8g`. Deployed to staging as version
`2af2e691-0f1a-4dec-9434-a35fbb65f513`.

Nothing in production, DNS, GTM, Google Ads, GA4, Microsoft Ads, the Neon
schema, persistent attribution or the Turnstile production credentials was
touched. One row was written to Neon by the authorised staging test and is
identified in §9.

---

## 1. Baseline — what the quote experience was

Measured on the built site before any edit, at three widths, with screenshots
in `.measure/p9/`.

| Surface | Lead forms | Visible fields | Required | Form height @390 |
| --- | --- | --- | --- | --- |
| `/request-a-quote/` | **2** — the page form and an identical sidebar copy, both `data-form-id="quote-form-1381"` | 18 each | 9 each | 1,363px, then 1,236px more, on a 4,376px page |
| homepage | 1 (`contact-form-1384`) | 10 | **10** | 1,021px |
| `/services/office-cleaning/` | 1 (sidebar quote) | 18 | 9 | 1,236px |
| `/lp/commercial-cleaning/` | 1 (`ppc-lead-form`) | 5 | 4 | 589px |
| `/lp/commercial-cleaning-quote/` | 1 (`lpq-form`) | 5 | 5 | 626px |

The long form's eighteen fields: first name\*, last name\*, business name\*,
address line 1\*, city\*, province\* (prefilled "Ontario"), postal code\*,
email\*, phone\*, eight service checkboxes, comments.

Three things were wrong beyond length:

1. **The same form twice on one page**, with the same `form_id`, so the two
   were indistinguishable in conversion data and a visitor who scrolled past
   the first met what reads as a second, different thing to fill in.
2. **Email AND phone both required.** Someone who only wanted to be called had
   to surrender an email address; someone who only wanted to be emailed had to
   invent a phone number.
3. **A complete street address required** before the business would accept an
   enquiry from a person who had not yet decided to buy anything.

`.measure/p9/quote-390-before.png` shows all three at once.

---

## 2. What was built

| File | What it is |
| --- | --- |
| `src/components/QuickQuoteForm.astro` | The short form. Seven questions, four required. Reusable — `id`, `heading` and `intro` props, so two can share a page. |
| `src/lib/quick-quote.ts` | Its behaviour: every problem reported at once, into slots whose height is already reserved, with focus sent to a summary a screen reader announces. |
| `src/components/QuoteAside.astro` | What replaced the duplicate sidebar form. |
| `src/lib/lead-submit.ts` | Two new hooks — `validate` and `reportInvalid` — on the existing shared pipeline. |
| `src/lib/lead-fields.ts` | `leadProblems`, `looksLikePhone`: the server's version of the same rule. |
| `src/data/site.ts` | `hours` and `hoursNote` — opening hours as one fact instead of a literal inside the JSON-LD. |

**What the form asks:** first name, business name, phone **or** email, postal
code or city, service, and an optional message.

**What it refuses to ask:** a surname, a street address, a city and province as
separate boxes, square footage, frequency, preferred schedule. Those are
qualification, and qualification happens after a lead exists, not as a
condition of creating one.

"Phone or email, at least one" cannot be written in HTML — `required` only says
"this field, always", and marking both is exactly the friction being removed.
It lives in `contactMethodProblem`, wired through the new `validate` hook, and
runs *after* the browser has finished with per-field validity so a visitor is
never told about a cross-field rule while a single field is still malformed.

---

## 3. The endpoint now agrees with the form

`/api/submit-lead` previously required a name **and** an email **and** a phone.
A short form is only short if the server accepts what it sends, so
`leadProblems` replaces that with: a name, and one plausible way to reply.

```
accepted   name + phone
accepted   name + email
accepted   name + both
accepted   with no address at all
422        neither            → { fields: ["contact"] }
422        phone + "dana@"    → { fields: ["work_email"] }
422        no name            → { fields: ["full_name"] }
```

The response names the field, so a client can act on it rather than showing a
generic failure. No schema change was needed or made — `address` already
existed and was never required server-side; the long form made it required in
the browser only.

`looksLikePhone` is seven digits however they are written, which accepts
`+1 (416) 803-4880`, `416-803-4880 x221` and a number typed with spaces, and
rejects `10,000` — the size-range false positive that an earlier
seven-digits-anywhere heuristic produced.

---

## 4. `/request-a-quote/` as it is now

- The short form is the page, once.
- The sidebar carries a 48px-high click-to-call, the published opening hours,
  and four claims: *Serving Toronto since 1989*, *WSIB covered and bonded*,
  *A reply within 2 business hours*, *No obligation*. **Every one is a claim
  this site already makes and can support.** No rating, no review count, no
  certification, no response time faster than the one already published — the
  build test asserts the absence of all four shapes, because Phase 7 had to
  remove an unverified 4.9/5 from two landing pages.
- The complete site navigation stays. Minimal-navigation paid pages are Phase
  10; this is an organic page and a visitor may have arrived mid-thought. The
  build test compares this page's header links against `/about-us/` link for
  link rather than asserting that "some nav exists".
- One H1 — "Request a Quote", from the page header. The form's heading is an
  H2 beneath it.
- What happens after submission is stated twice: under the button before
  submitting, and in the confirmation after.

---

## 5. Form usability and accessibility

| | Before | After |
| --- | --- | --- |
| Labels (not placeholders) | 19 labels, 0 placeholder-only | 7 labels, 0 placeholder-only, `placeholder=` absent from the form entirely |
| `autocomplete` tokens | 20 of 38 controls | 6 of 6 applicable controls |
| Input types / `inputmode` | mixed | `tel` + `inputmode="tel"`, `email` + `inputmode="email"`, `postal-code`, `organization`, `given-name` |
| Controls under 44px tall | **36** | **0** (48px fields, 52px submit) |
| Font size in inputs | below 16px | 16px — under that, iOS zooms the page on focus |
| Inline errors | browser bubbles, one at a time | every problem at once, in its own slot, `aria-describedby` to the field |
| Error summary | none | `role="alert" aria-live="assertive" tabindex="-1"`, takes focus |
| Focus after error | undefined | the summary, so a screen reader reads the whole list before the visitor lands in the first box |
| Success | navigation to `/thank-you/` | `role="status" tabindex="-1"` box replaces the form and takes focus |
| Layout shift on error | fields move | slots are height-reserved; CLS 0.0004 → 0.0002 |
| Button state | none | disabled + "Sending…", restored on failure |
| Enter key | submits | submits, except inside the honeypot |

**Errors are shown all at once, not one per attempt.** Someone who fixes one
field and is then told about the next has been made to submit three times to
learn three things that were all knowable at once.

---

## 6. Tests

**353 pass, 13 files.** 120 of them are new.

| File | Env | Tests |
| --- | --- | --- |
| `tests/quick-quote.test.ts` | happy-dom | 45 |
| `tests/worker/lead-validation.test.ts` | node | 34 |
| `tests/build/quote-page.test.ts` | node | 41 |

Every case the phase brief listed is covered: telephone-only, email-only, both,
neither-rejected, a malformed optional contact, success with no address and no
surname, the full HTTP failure matrix (400/401/403/404/422/429/500/502/503 and
a network failure), attribution retention through the form, exactly one
conversion event, no PII in the dataLayer, repeat clicks, accessible errors and
success, and Turnstile on both timings — token already present, token arriving
after submit, and token never arriving.

`tests/fixtures/quick-quote.ts` holds the field contract once.
`tests/quick-quote.test.ts` drives it; `tests/build/quote-page.test.ts` asserts
the *built* component still matches it. That pairing is deliberate: a
hand-built DOM fixture is the fastest way to test behaviour and the easiest
thing in a repository to leave behind when the component changes.

### Three real defects the tests found

1. **The summary-clearing submit listener was registered after the pipeline's**
   and wiped the message the pipeline had just written. A visitor with an empty
   required field would have been refused in silence.
2. **`phone` and `email` wrote their errors to slots that do not exist** — they
   share one `contact` slot — so a malformed email address was rejected with no
   message shown at all.
3. The paragraph under the button rendered `talk now?Call (416) 803-4880` with
   no space, because Astro collapses the newline before an element.

### One existing assertion was changed, deliberately

`tests/worker/submit-lead.test.ts` expected `['full_name', 'phone']` for a body
carrying only an email. A valid email is now a complete way to reply, so that
body is short of a name and nothing else. The assertion now reads
`['full_name']` and carries a comment saying why.

---

## 7. Measured, before and after

Both builds served over loopback by the same instrument
(`scripts/lh-local.mjs`, `.measure/p9/census-*.json`), so the difference is the
change and not the network.

### `/request-a-quote/`

| | Before | After |
| --- | --- | --- |
| Lead forms on the page | 2 | **1** |
| Visible fields | 38 | **8** (7 asked + the 1×1 honeypot) |
| Required fields | 18 | **4** |
| Completion steps | 18 fields → submit → navigate to `/thank-you/` | 7 fields → submit → confirmation in place |
| Form height @390 | 1,363px + 1,236px | **1,086px** |
| Form height @768 | 1,216px | **720px** |
| Form height @1440 | 1,216px | **770px** |
| Page height @390 | 4,376px | **2,925px** |
| Page height @1440 | 2,910px | **1,956px** |
| Controls under 44px | 36 | **0** |
| Unlabelled controls | 0 | 0 |
| Horizontal overflow @390 | none | none |
| Page requests | 14 | 15 |
| CLS (harness) | 0.0004 | 0.0002 |

The one extra request is the second stylesheet Astro emits for the new
components.

### Lighthouse, median of 3, mobile, same loopback server

| | Before | After |
| --- | --- | --- |
| **Accessibility** | **97** | **100** |
| Failing a11y audit | `color-contrast` | none |
| Performance | 98 | 98 |
| Best practices | 92 | 92 |
| FCP | 1,954 ms | 1,954 ms |
| LCP | 1,954 ms | 2,029 ms |
| TBT | 0 ms | 0 ms |
| CLS | 0.0004 | 0.0002 |

All three before-runs scored 97/98; all three after-runs scored 100/98. **These
are not production numbers** — there is no network and no third party in this
harness. The staged site's real performance is dominated by the GTM container,
as the Phase 6/8 follow-up established, and nothing in Phase 9 changes that.

### Keyboard and assistive technology, real browser

`npm run form:a11y -- <dist>` — **40 of 40 checks pass** at 390px and 1440px:

- the form is reachable by Tab; tab order is
  `first-name → business-name → phone → email → postal → services → message → submit`
- the honeypot is not one of the stops
- every field takes a visible focus ring
- Enter submits; focus lands on the error summary; it is an assertive alert;
  all four empty required fields are marked and messaged separately
- errors clear as the visitor types
- a phone-only lead goes through with no email and no street address
- success replaces the form with a focused `role="status"` box that says what
  happens next
- exactly one conversion event, carrying nothing but `event` and `form_id`

The confirmation as an assistive technology receives it:

```
- status:
  - strong: Thank you — we have your request.
  - text: An account executive will reply within 2 business hours on a
          working day. If it is urgent, call
  - link "(416) 803-4880": /url: tel:+14168034880
```

### Screenshots

`.measure/p9/` — `quote-{390,768,1440}-{before,after}.png`, plus the untouched
homepage, service page and both landing pages at 390px as controls.

### A note on the noise floor

The service page is unchanged by this phase and its harness CLS moved
0.1311 → 0.2779 at 768px between the two runs. That is run-to-run variance in
this measuring setup, and it is the reason the Lighthouse figures above are a
median of three rather than a single pass.

---

## 8. Turnstile

The deferred architecture is unchanged. `SpamGuard.astro` still injects
`api.js` only on `IntersectionObserver` at 600px or on `focusin`/`input` in the
form, and the quote page still emits **no eager `<script>` to
challenges.cloudflare.com** — asserted in `tests/build/quote-page.test.ts`.

Verified on the deployed staging site: the widget armed and a token was present
in `cf-turnstile-response` before submit (`XXXX.DUMMY.TOKEN.XXXX`, which is
what the published test key `1x00000000000000000000BB` returns), and the
endpoint answered 200.

Verified in the suite and in the browser script: when the token arrives late
the pipeline waits for it and sends the real one; when it never arrives the
pipeline spends its 6-second deadline and posts anyway, letting the server
answer 403 — measured at 6,334 ms with the captcha host blocked. A form that
silently never submits is worse than an error a visitor can act on.

**Still not proven, and unchanged from Phase 4:** no production Turnstile key
pair has been issued, so no staging submission has ever been made with a real
one. Staging runs on Cloudflare's published test key.

---

## 9. The stored test lead

One submission was made against staging with values that could not be mistaken
for a real enquiry. It reached Neon.

| | |
| --- | --- |
| **Row id** | **20** |
| `created_at` | 2026-09-21 11:48:44 UTC |
| `form_id` | `quick-quote` |
| `full_name` | `ZZTEST` |
| `business_name` | `ZZ TEST — Phase 9 staging check, not a real lead` |
| `phone` | `416 555 0142` (the reserved fictional 555-01xx range) |
| `work_email` | *(empty — this is the phone-only path)* |
| `address` | `M5V 1Z4` |
| `message` | `AUTOMATED PHASE 9 STAGING TEST at 2026-09-21T11:48:38.784Z. Not a real enquiry. Do not contact.` |
| `page_url` | `https://evergreencleaningservice.10xconnections.com/request-a-quote/` |

**It has not been deleted.** `docs/database-separation.md` is updated to
account for it.

It also pushed one `lead_form_submission` into the dataLayer on staging. As of
the Phase 1 baseline the container has no trigger for that event, so no
advertising conversion was reported; that remains unverified against the live
container, which is §8 of `docs/gtm-handoff.md`.

Auditing the row count also corrected an error in
`docs/database-separation.md`: it said "11 staging, 8 probes" and attributed
the probes to `form_id = 'probe'`. Counted from the live database, it is 12
staging-hostname rows, 7 with no `page_url` at all, and 1 with an
`example.com` URL; only three rows carry that `form_id`. The document now
carries the corrected table and says it was wrong.

---

## 10. Neon plan limits, re-verified

Read from the live project on 21 Sep 2026 as instructed. **Nothing was
changed.**

| | |
| --- | --- |
| Plan | `free_v3`, org `org-lively-mode-86729145` |
| Branch limit | **10 per organisation**; this project uses 1 (`main`) |
| Per-branch logical size limit | **0.5 GiB**; current branch 31.1 MB |
| History retention (PITR) | **21,600 s — six hours** |
| Compute | fixed 0.25 CU, `suspend_timeout_seconds: 0` |
| Usage this period (1 Sep – 1 Oct) | 1,189 s compute, 4,692 s active |

The compute-hour allowance is **not exposed** by the project or organisation
API, so it is not stated as a figure here — read it off the Neon billing page
before relying on headroom. Branch count is not a constraint: the separation
plan needs one more branch and nine are free.

Six-hour PITR remains the thing worth raising before this database holds real
customer enquiries. That is a business call and it does not block the
separation, which stays in the Phase 12 launch plan as agreed.

---

## 11. What Phase 9 did not do

- **Only `/request-a-quote/` was changed.** The homepage contact form, the
  service-page sidebar form and both landing-page forms are untouched and
  still carry their original field counts. The short form is built to be
  reused; where else it should go is a decision, not a leftover.
- **No conversion-rate claim is made.** This phase reduced form friction —
  fewer fields, fewer required fields, a shorter page, one form instead of
  two, and an accessible error and success path. Whether that produces more
  leads is not knowable until real conversion data exists, and nothing here
  should be reported as an expected percentage.
- **`astro check` was not run.** `@astrojs/check` is not installed and
  installing it would change the environment mid-phase. The build compiles and
  Vitest transforms the same TypeScript through the same Vite pipeline.

---

## 12. Remaining blockers

| | |
| --- | --- |
| **A production Turnstile key pair** | None issued. Staging runs the published test key, so no submission anywhere has ever exercised a real one. Blocks a truthful "spam protection works" claim at launch. |
| **The GTM container has no trigger for `lead_form_submission`** | Unchanged since Phase 1. The site pushes the event correctly; nothing consumes it. `docs/gtm-handoff.md` is the specification and needs container access. |
| **Deployed performance** | Dominated by the GTM container, per the Phase 6/8 follow-up. Not a Phase 9 matter and not improved by it. |
| **Staging and production share one database** | Recommendation written, nothing executed, Phase 12 as agreed. |
| **Six-hour PITR** | A business decision, per §10. |

---

## 13. Proposed Phase 10 — dedicated paid-search landing pages

For approval, not started.

### What exists

Two landing pages, both built in earlier phases, both already short-form:

| | Fields | Required | Form id |
| --- | --- | --- | --- |
| `/lp/commercial-cleaning/` | 5 | 4 | `ppc-lead-form` |
| `/lp/commercial-cleaning-quote/` | 5 | 5 | `lpq-form` |

Both still render the full site navigation and the full footer, which is the
single biggest difference between them and a page built for paid traffic.

### What I propose, in order

1. **A landing-page layout.** One `PaidLayout.astro`: logo, phone number, and
   nothing else clickable in the header; a minimal footer carrying only the
   legal links and the NAP. No main navigation, no search, no recent posts, no
   service-area link list. Every removed link is a way out of a page someone
   was paid to arrive on.

   This is where the "keep the complete navigation for now" note in the Phase 9
   brief gets discharged: organic pages keep it, paid pages do not.

2. **Consolidate onto the short form.** Both landing pages adopt
   `QuickQuoteForm` so there is one form component on the site rather than
   four, with per-page `heading` and `intro`. That also gives them the
   phone-or-email rule, the accessible error path and the in-place
   confirmation, none of which they have today.

   Their `form_id`s stay distinct — `ppc-lead-form`, `lpq-form` — because
   distinguishing them is the entire point of the conversion data.

3. **Decide the page set with the ad accounts, not from the codebase.** The
   right number of landing pages is the number of ad groups that deserve their
   own message. I do not have access to the Google Ads or Microsoft Ads
   accounts, so I would propose the structure and stop:

   - `/lp/office-cleaning/` — the largest term set
   - `/lp/commercial-cleaning/` — exists
   - `/lp/janitorial-services/`
   - `/lp/post-construction-cleaning/` — a distinct, higher-value intent

   **Whether these match real ad groups is a question for whoever holds the
   accounts.** Building four pages against guessed ad groups is four pages
   nobody sends traffic to.

4. **Above-the-fold contract.** Each page: one headline naming the service and
   the city, one sub-line naming the proof (since 1989, WSIB, bonded), the form
   or a phone number visible without scrolling at 390px, and one dominant
   action. Measured, not asserted — the same instrument as §7.

5. **Keep them out of the index.** `/lp/*` pages are noindex today and stay
   that way. `tests/build/indexability.test.ts` already asserts it and would
   need extending to any new page.

6. **Tests.** Every landing page gets the `quote-page.test.ts` treatment: one
   lead form, one H1, the minimal-navigation contract asserted as the *absence*
   of the main nav links, no unverifiable claims, and the field contract
   matched against the shared fixture.

### What Phase 10 should not do

- Not touch Google Ads, Microsoft Ads or GTM. Landing pages are the site's
  half of that work; the accounts are Phase 11.
- Not invent proof. The same rule as Phase 7 and Phase 9: no rating, no review
  count, no certification, no guarantee the client has not made.
- Not add call tracking. That is Phase 11 and it interacts with the NAP on
  every page, so it should be designed once rather than sprinkled onto landing
  pages first.

### Open questions I would need answered before starting

1. Which ad groups are actually running, and what do they bid on?
2. Is there a call-tracking number in use today, and on which pages?
3. Should the landing pages carry the same phone number as the site, or a
   tracked one? (This is really a Phase 11 question, but it changes the
   layout.)

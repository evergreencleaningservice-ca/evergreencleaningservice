# GTM implementation specification — Evergreen Office Cleaning

**For:** whoever holds Google Tag Manager `GTM-5PRC4HBV`, Google Ads
`AW-16819334998`, GA4 `G-R27QW21PMT` and Microsoft Advertising UET `187178776`.

**Status:** nothing in this document has been applied. The container has not
been opened or changed, and will not be without explicit authorisation and
appropriate access.

**Why this exists:** as published today, **the container will record zero form
conversions on the new site.** Not inflated — zero. That is the single largest
launch risk, and it is fixed in the container, not in the website.

---

## 1. What the container does today, read from `gtm.js`

Measured 21 Sep 2026 by fetching `https://www.googletagmanager.com/gtm.js?id=GTM-5PRC4HBV`
(477,122 bytes) and decoding its `macros`, `predicates`, `rules` and `tags`.

| Rule | Fires when | Tags |
| --- | --- | --- |
| 1 | `gtm.js` (container load) | GA4 config, Google Ads conversion linker, remarketing, UET init |
| 2 | `gtm.formSubmit` **AND** `gtm.elementId == "wpforms-form-1384"` | Google Ads conversion, UET |
| 3 | `gtm.formSubmit` **AND** `gtm.elementId == "wpforms-form-1381"` | Google Ads conversion, UET |
| 4 | `gtm.linkClick` **AND** href starts with `mailto:` | Google Ads conversion |

Counted in the container source: `lead_form_submission` **0**,
`lead_form_confirmed` **0**, `thank-you` **0**, `tel:` **0**,
`click_to_call` **0**, `phone_click` **0**.

**Three consequences.**

1. **Rules 2 and 3 cannot fire on the new site.** They are gated on
   `gtm.elementId` being a WordPress WPForms DOM id. Neither id exists on the
   Astro site, and its forms call `preventDefault()` and submit by `fetch`.
2. **Click-to-call has never been tracked, on either site.** There is no
   `tel:` trigger — only `mailto:`. Phase 11 is new tracking, not a port.
3. **Enhanced conversions depend on a SearchKings script.** Macro 3 reads
   `sessionStorage.getItem("searchkings_galaxy_tracking_event_data")` and feeds
   macro 4, the enhanced-conversions data source. That script does not exist on
   the new site and will not exist anywhere after the handover.

---

## 2. The website's side of the contract — already built and tested

**There is exactly one conversion event.**

```js
window.dataLayer.push({
  event: 'lead_form_submission',
  form_id: '<one of four fixed strings>',
  facility_type: '<optional, landing pages only>',
  facility_size: '<optional, landing pages only>',
  eventCallback: fn,      // GTM's, added by the site
  eventTimeout: 2000      // GTM's, added by the site
});
```

It is pushed **once**, by one shared module, **only after `/api/submit-lead`
returns a 2xx** — meaning the lead is stored in the database. It is not pushed
for a validation failure, a rejected CAPTCHA, a 403, a 4xx, a 5xx, a network
failure, or a honeypot hit. 20 automated tests cover exactly this
(`tests/conversion-event.test.ts`).

`form_id` values, all fixed strings chosen by the site — never anything a
visitor types:

| `form_id` | Where |
| --- | --- |
| `ppc-lead-form` | `/lp/commercial-cleaning/` |
| `lp-commercial-cleaning-quote` | `/lp/commercial-cleaning-quote/` |
| `quote-form-1381` | the site's quote form |
| `contact-form-1384` | the site's contact form |

**No personal information is in the data layer.** The event carries only the
three keys above, enforced by a key allowlist plus a value-shape check, and
tested. Names, emails, phone numbers and addresses go to the server in the POST
body and never to the data layer.

**`/thank-you/` pushes nothing.** See §5.

---

## 3. What to build in the container

### 3.1 Trigger

| | |
| --- | --- |
| **Name** | `CE - lead_form_submission` |
| **Type** | Custom Event |
| **Event name** | `lead_form_submission` |
| **Fires on** | All Custom Events |

Optionally add two Data Layer Variables — `DLV - form_id`, `DLV - facility_type` —
for reporting segmentation. Do **not** make them trigger conditions; a missing
variable would silently stop the conversion.

### 3.2 Tags that fire from it

| Tag | Type | Notes |
| --- | --- | --- |
| Google Ads conversion — lead | Google Ads Conversion Tracking | `AW-16819334998`; reuse the existing conversion label from the WPForms tag so history is continuous. **One** Ads conversion tag, not three. |
| GA4 event — `generate_lead` | GA4 Event | Send `form_id` as an event parameter. Mark as a key event in GA4 (see §4). |
| Microsoft UET — lead | UET event | `187178776`, event action `lead_form_submission`. |

**Nothing else fires from this trigger.** In particular: no second Ads
conversion for "all form submissions", no page-view conversion, and no
duplicate GA4 event.

### 3.3 Retire at cutover

| Item | Action | When |
| --- | --- | --- |
| Trigger: `gtm.formSubmit` + `wpforms-form-1384` | **Pause** | at DNS cutover |
| Trigger: `gtm.formSubmit` + `wpforms-form-1381` | **Pause** | at DNS cutover |
| Macro reading `searchkings_galaxy_tracking_event_data` | **Remove**, after §6 | at cutover |
| WPForms field-name mapping variable | **Remove** | at cutover |
| Trigger: `mailto:` link click | **Keep** | it still works |

**Pause, do not delete, and do not pause before cutover.** While DNS still
points at WordPress those triggers are the only thing recording conversions.
Pausing them early loses real conversions; deleting them loses the ability to
roll back. Review after two weeks of clean data on the new site, then delete.

---

## 4. Preventing duplicate conversions

Four rules. Each one has a real way of being got wrong.

1. **One Google Ads conversion action for a website form lead.** If the
   existing container has more than one Ads conversion tag reachable from a
   single form submission, keep one and pause the rest. Three conversion
   labels exist in the container today.
2. **Do not configure a destination or page-view conversion on `/thank-you/`.**
   This is the most likely mistake, because that is how the WordPress site was
   set up to work and the page still exists. See §5.
3. **In GA4, mark exactly one event as the key event.** Use `generate_lead`
   from the trigger above. Do **not** also mark a `page_view` on `/thank-you/`
   as a key event, and do not import both a GA4 key event and the native Ads
   conversion into Google Ads — that is the classic double count. Pick one
   source of truth for Ads: the native Ads tag.
4. **Set the Ads conversion count to "One" per click, not "Every".** A lead is
   one lead, however many times someone submits the form.

---

## 5. `/thank-you/` must not count as a conversion

The confirmation page **pushes nothing into the data layer**, by design and
under test. The website used to push a second event there, and it was wrong in
three separate ways:

- a container triggering on both events counted every PPC lead twice;
- a reload, a back-button return or a bookmark each counted again;
- anyone who simply opened the URL — a person, a crawler — reported a
  conversion for a form they never filled in.

The site now sends a **one-time, non-PII success marker** (a `form_id` and a
timestamp in `sessionStorage`) from the form to `/thank-you/`, consumed on
first read. It is for the page's own state. It is not a measurement signal and
must not be made one.

**So:** no destination conversion, no page-view trigger, no GA4 key event on
`/thank-you/`. Automated tests assert that the built page's own script never
touches `window.dataLayer`.

**Event delivery is protected.** The landing pages navigate to `/thank-you/`
after a successful submission, and a navigation can abort an in-flight
conversion beacon. The site therefore pushes with `eventCallback` and
`eventTimeout: 2000` and **waits for GTM to report the tags delivered before
navigating**, with a local 2-second fallback so a visitor is never stranded if
no container is present. Four tests cover this. **Please leave `eventTimeout`
alone** and do not add a tag to this trigger that never completes — everything
firing from `lead_form_submission` sits inside that 2-second budget.

---

## 6. Enhanced conversions after SearchKings

Enhanced conversions are currently fed by macro 3, reading
`sessionStorage["searchkings_galaxy_tracking_event_data"]`. That script will
not exist on the new site.

**Recommended:** switch the Ads conversion tag to **automatic** enhanced
conversions collection (the container already contains an `AUTO` collector,
macro 17) and confirm in Google Ads → Conversions → Diagnostics that the
success rate recovers within 7 days.

**If automatic collection does not reach an acceptable match rate**, the
alternative is manual CSS-selector or data-layer supply. The website can
provide hashed user-provided data on request — but it currently does not, and
**it must not be added without a decision**: it means putting a hashed email
into the data layer, which is a privacy question, not a tagging question. See
the unresolved consent items in the project README.

**Do not** attempt to keep the SearchKings macro. It will read an empty value
and silently degrade enhanced conversions to nothing.

---

## 7. Phase 11 — `phone_click`, when it is built

Not yet in scope, specified here so the container is not rebuilt twice.

The site already pushes, from the landing-page layout only:

```js
{ event: 'click_to_call', phone_number: '+14168034880', phone_destination: 'tel:…' }
```

There is **no trigger for it**, so it currently goes nowhere. Phase 11 will
extend it site-wide and settle on one name. Until then:

- do not build a trigger on `click_to_call` yet;
- when Phase 11 lands, the event name will be confirmed in writing before any
  container change;
- a phone click is **not** the same conversion action as a form lead. Create a
  separate Ads conversion action for it, with its own value, or Smart Bidding
  will treat a tap on a phone number as equivalent to a qualified enquiry.

---

## 8. Verification checklist

Run against the staging origin `https://evergreencleaningservice.10xconnections.com`
**before** the DNS cutover, then again on production immediately after.

### 8.1 Tag Assistant

1. Connect Tag Assistant to the staging URL.
2. Confirm `GTM-5PRC4HBV` loads. (Verified working on staging.)
3. **Failed-form test — proves zero conversions.** Submit the quote form with
   the email field left empty, then again with a deliberately broken CAPTCHA.
   **Expected: no `lead_form_submission` in the Tag Assistant timeline, and
   the Google Ads / GA4 / UET tags do not fire.**
4. **Successful-form test — proves exactly one conversion.** Submit
   `/lp/commercial-cleaning/` completely and correctly.
   **Expected:** exactly one `lead_form_submission`; the Ads conversion tag,
   the GA4 event and the UET tag each fire **once**; `form_id` reads
   `ppc-lead-form`; the event contains **no** name, email, phone or address.
5. **Thank-you test.** After step 4 you land on `/thank-you/`.
   **Expected: no further tag fires.** Now reload the page, press Back, then
   open `/thank-you/` directly in a new tab. **Expected: no tag fires on any
   of the three.**
6. **Double-click test.** Submit the contact form and click the button
   repeatedly. **Expected: exactly one event, one lead row.**

### 8.2 GA4 DebugView

7. Enable debug mode and repeat steps 3 and 4.
8. **Expected:** `generate_lead` appears exactly once per successful
   submission and not at all for a failed one; `form_id` is present; no
   parameter contains personal information.
9. Confirm `/thank-you/` produces a `page_view` and **no** key event.

### 8.3 Reconciliation, 48 hours after cutover

10. Compare: rows in the `leads` table, notification emails received, Google
    Ads conversions, GA4 `generate_lead` count. **They should agree within
    normal attribution lag.** A count roughly double the lead rows means a
    duplicate trigger — check §4 and §5 first.

---

## 9. Access still required

| Need | Status |
| --- | --- |
| Who owns Google Ads, GTM and GA4 after SearchKings | **Unresolved.** This is blocker A1 in the question list sent to Harjit@BrandingCentres.com. |
| GTM publish rights on `GTM-5PRC4HBV` | Not held |
| Google Ads access to `AW-16819334998` | Not held |
| GA4 access to `G-R27QW21PMT` | Not held |
| Microsoft Advertising access to UET `187178776` | Not held |

Until ownership is resolved, none of §3 can be applied, and the new site will
report zero form conversions from the moment DNS moves. **This is the item to
settle first.**

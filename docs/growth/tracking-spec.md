# Tracking event specification

This covers what the website pushes into `dataLayer`, what each push means, and what has to be configured in the advertising accounts.

**What was checked on 15 Oct 2026.** We decoded the live container, `GTM-5W69BTJQ`, from `https://www.googletagmanager.com/gtm.js?id=GTM-5W69BTJQ`. It contains:

| Tag | Fires on | Notes |
|---|---|---|
| Google tag `AW-18472921801` | `gtm.init` | Google Ads only. **There is no GA4 tag and no Microsoft UET tag** in this container. |
| Conversion linker | `gtm.init` | |
| Google Ads conversion (label `gu9jCLqh74sdEMnVyehE`) | custom event `lead_form_submission` | Matches the site's contract. Enhanced conversions are off. |
| Google Ads "calls from website" (label `_klRCNWT7IsdEMnVyehE`, number (416) 803-4880) | `gtm.js` | Swaps in a Google forwarding number for ad visitors and measures **connected calls**. |

The container has no triggers for `phone_click`, `form_start`, `lead_form_error`, `email_click` or `quote_cta_click`. Those events are pushed by the site and currently ignored by the container.

We only read the container. We did not open it in GTM or change it, and we did not access Google Ads or GA4. **Nobody here has verified that the Ads conversion actions are set as Primary, have the intended counting settings, or record correctly.**

**Update, 29 Oct 2026: GA4 is live.**

- GA4 property "Evergreen Office Cleaning" (account `413966610`, property `561394338`), web stream "Website" (stream ID `16231230875`), measurement ID **`G-C0JHHPLFPJ`**. It is linked to Search Console (`sc-domain:evergreencleaningservice.ca`).
- It was attached as a second destination of the Google tag `GT-PBCTCTX6`, the tag that also carries Google Ads `AW-18472921801`. The Ads account is named "Green Clean Office Maintenance" but it is Evergreen's. Because the container loads that tag on every page, **page views reach GA4 with no container change**. Do not add a separate GA4 Google tag in GTM, or page views will be counted twice.
- The login that manages the Google tag (`ads@brandingcentres.com`) has **no access to `GTM-5W69BTJQ`**. So the site sends its six events to GA4 itself. `src/lib/ga4.ts` queues a `gtag('event', …, { send_to: 'G-C0JHHPLFPJ' })` command alongside each dataLayer push:
  - `lead_form_submission` goes to GA4 as **`generate_lead`**.
  - `phone_click`, `form_start`, `lead_form_error`, `email_click` and `quote_cta_click` keep their names.
  - The parameters are the same sanitised ones the dataLayer carries.
  - Commands go on the production hostnames only.
  - `send_to` keeps them out of Google Ads; the Ads conversion is still the container's tag.
- **If anyone wires GA4 event tags into `GTM-5W69BTJQ`, remove the `sendGa4` calls first**, or every event is counted twice.
- **GA4 property settings, done 29 Oct 2026** (by the account owner; reported, and checked from the live tag where that was possible):
  - Event-scoped custom dimensions `form_id`, `link_location` and `error_type`.
  - Enhanced measurement → **Form interactions off**, so GA4's automatic `form_start` / `form_submit` do not duplicate the site's own `form_start`.
  - **`generate_lead` created as a key event** in advance. It is fed by the site's instrumentation above, not by a page-view or `/thank-you/` rule.
  - Google Ads conversion settings left unchanged.
- **Verified on 29 Oct 2026** against the live site, with every outgoing Google hit intercepted (answered locally, so nothing reached GA4 or Ads):
  - One page view sends exactly one GA4 `page_view`. Focusing the quote form sends exactly one `form_start`. There is no automatic duplicate.
  - The container still holds the Ads lead conversion (`AW-18472921801` / `gu9jCLqh74sdEMnVyehE`) on `lead_form_submission` and the call-tracking tag (`_klRCNWT7IsdEMnVyehE`). It has no GA4 tag and no `site_environment` blocking trigger. The one `generate_lead` string in `gtm.js` is the tag library's built-in event-name table, not a tag.
  - Staging (`stage.evergreencleaningservice.ca`) loads the container and sends GA4 `page_view` and Ads remarketing hits. The site's own `sendGa4` events do not fire there.
- Still open:
  - **Confirm the first genuine quote request appears in GA4 as `generate_lead` and counts as a key event.** As of 29 Oct 2026 no lead has arrived since the form fix (the last row in `leads` is 2026-10-17 02:17 UTC). Do not submit a test lead to check this.
  - ~~Exclude staging~~: resolved on 29 Oct 2026 by removing the staging domain (A6).
  - **User-provided data.** The Google tag `GT-PBCTCTX6` has automatic detection of user-provided data switched on: email, phone and address (`__ogt_1p_data_v2`, set by "Allow user-provided data capabilities"). Confirm whether enhanced conversions are actually in use in the Ads account. If they are, the privacy policy should say that a hashed email or phone number may be shared with Google to match an enquiry to an ad click.
---

## 1. Events the site pushes

Every event carries **no personal data**: no name, email, phone, message, address or free text. Values are site-chosen ids or closed lists.

| Event | Fires when | Parameters | Meaning | Use as |
|---|---|---|---|---|
| `lead_form_submission` | `/api/submit-lead` answered **2xx**. It fires once per successful submission and is never pushed on a click, a failure or a reload of `/thank-you/`. | `form_id`, optional `facility_type`, `facility_size` (allow-listed and screened for phone/email shapes) | An enquiry was **stored** | **Primary conversion** (the only one) |
| `phone_click` | A `tel:` link was activated (click or keyboard). | `page_path`, `link_location` (closed list), `displayed_number`, `destination_number`, `tracking_provider` (`calltrackingmetrics` · `google_forwarding_number` · `unknown`) | A tap. **Not a connected call.** | Secondary / observation |
| `form_start` *(new)* | First focus or keystroke inside a lead form, once per form per page view. Ignores the honeypot and non-lead forms. | `form_id` | The visitor started a form | Secondary, used for funnel diagnosis |
| `lead_form_error` *(new)* | A lead form attempt did not become a lead. | `form_id`, `error_type` ∈ `validation` · `captcha` · `server` · `network` | A submission was lost or refused | Diagnostics only. **Never a conversion.** |
| `email_click` *(new)* | A `mailto:` link was activated. | `page_path`, `link_location` | A tap on the email address | Secondary |
| `quote_cta_click` *(new)* | A link to `/request-a-quote/`, or an in-page form anchor marked `data-quote-cta`, was activated. | `page_path`, `link_location` (`header`, `hero`, `content`, `sidebar`, `service_cta`, `footer`, `paid_header`, `paid_cta`, `paid_sticky`) | A navigation towards a form | Observation and CTA testing |
| `site_environment` | Pushed before `gtm.start` on every page. | `production` or `staging` | Lets the container exclude staging | Blocking trigger |

**Form identities (`form_id`).**

- Existing: `quick-quote`, `contact`, `ppc-lead-form`, `lp-commercial-cleaning-quote`.
- New, one per page so leads can be attributed by page:
  - `service-<slug>`, for example `service-office-cleaning`
  - `industry-<slug>`
  - `location-<slug>`
  - `lp-office-cleaning`, `lp-post-construction`

**Duplicate protection.**

- One delegated listener per document, with an idempotence guard.
- An in-flight flag stops double submits, including Enter and `requestSubmit`.
- `lead_form_submission` is pushed in exactly one code path, after a 2xx response.
- `/thank-you/` pushes nothing.
- Tests: `tests/conversion-event.test.ts`, `tests/engagement.test.ts`, `tests/phone-click.test.ts`.

**Attribution.**

- `src/lib/attribution.ts` keeps the first and latest campaign touch for the browser session: gclid, gbraid, wbraid, msclkid, gad_source and the UTM parameters.
- It merges them into the lead payload. The Worker stores them in Neon next to the lead.
- Persistence is session-scoped and deliberately not 90-day, pending a consent decision (see README, "Attribution").

---

## 2. Lead-quality hooks (offline conversions)

`migrations/0009_lead_outcomes.sql` adds the following columns to `leads`:

- `lead_status`: new, qualified, unqualified, quote_issued, won, lost
- `status_reason`
- `qualified_at`
- `quote_issued_at` and `quote_value_cad`
- `won_at` and `won_value_cad`

It also adds a view, `lead_offline_conversions`, with one row per stage reached. Rows carry the click id, conversion name, time, value and currency, in the shape Google Ads offline conversion import expects.

**Status: written, NOT applied.** Applying it to Neon (project `long-firefly-62771888`) needs explicit approval and a snapshot first. The migration is additive. Rollback is in its header.

---

## 3. Account-side setup still needed

Status as of 29 Oct 2026. Rows not marked done are not done, and are not verifiable from here.

| # | Where | Action | Why |
|---|---|---|---|
| A1 | Google Ads | **Reviewed by the account owner, 29 Oct 2026.** Confirm the `lead_form_submission` conversion action (label `gu9jCLqh…`) is **Primary**, counts **One**, has a sensible click-through window, and appears in the bidding goal. | It is the only lead conversion. |
| A2 | Google Ads | **Reviewed by the account owner, 29 Oct 2026.** Confirm the "calls from website" action (`_klRCNWT…`) has a minimum call length that represents a real enquiry, for example 60 s. Decide whether it is Primary. | A connected call is a stronger signal than a tap. |
| A3 | Google Ads | **Actions created as Secondary, 29 Oct 2026; the weekly upload is not started.** Create three offline conversion actions named exactly `Evergreen - Qualified lead`, `Evergreen - Quote issued` and `Evergreen - Customer won`. Start them as **Secondary**. Upload from the `lead_offline_conversions` view weekly. | This lets you judge, and later bid on, lead quality. Do not switch them to Primary before there are enough uploads to be meaningful. |
| A4 | GTM → **site** | **Done another way, 29 Oct 2026.** The five events (and the lead as `generate_lead`) go to GA4 from the site itself (`src/lib/ga4.ts`), because no available login can edit the container. If the container is ever wired for these, remove the site-side calls first. | Funnel visibility. |
| A5 | GA4 | **Done, 29 Oct 2026.** New property `G-C0JHHPLFPJ`, attached to the Google tag `GT-PBCTCTX6`. Custom dimensions, Form interactions off and the `generate_lead` key event are set; see the update at the top. `G-R27QW21PMT` from the old container is not used. | Analytics beyond Google Ads. |
| A6 | GTM | **Resolved another way, 29 Oct 2026:** `stage.evergreencleaningservice.ca` was removed (no DNS), so staging no longer sends anything. If staging is ever restored, either add this trigger or remove the staging host from `site.analyticsHosts`. Original action: Add a blocking trigger, `site_environment equals staging`, and add it as an exception on the Google tag and the Ads tags. Verified 29 Oct 2026 that staging still sends GA4 page views and Ads hits. | Staging page views reach GA4 and the live Ads tag. |
| A7 | GTM / Ads | Consider enhanced conversions for leads. The site does not push hashed user data. **Found 29 Oct 2026:** the Google tag `GT-PBCTCTX6` has automatic detection of user-provided data switched on, so confirm in the Ads account whether enhanced conversions are active. Either way it needs a privacy decision. | It could improve match rates. |
| A8 | Microsoft Ads | The UET tag `187178776` from the old container is not in the new one. Re-add it or retire Microsoft Ads. | Microsoft campaigns record nothing right now. |
| A9 | Privacy | **Done, 29 Oct 2026.** `/privacy/` now describes the forms, reCAPTCHA, Tag Manager, Ads and Analytics, Cloudflare's statistics, the session attribution note and the providers. Open point: user-provided data (see the update at the top). | PIPEDA transparency. Not legal advice. |

## 4. How to verify (after deploy)

1. GTM Preview (Tag Assistant) on the production URL with `?gtm_debug=x`:
   - Load a service page. Expect `site_environment` → `gtm.js`, and the Google tag firing.
   - Focus a form field. Expect `form_start` once only, and `form_id=service-<slug>`.
   - Tap the phone link. Expect `phone_click` with `link_location`.
2. Submit **one clearly identified test lead** with the name "TEST – do not contact", on staging or by agreement on production. Expect exactly one `lead_form_submission` and the Ads conversion tag firing once. Mark the Neon row `unqualified` with reason `test`.
3. Force a captcha failure by submitting without ticking it. Expect `lead_form_error` with `error_type=validation`, and no conversion.

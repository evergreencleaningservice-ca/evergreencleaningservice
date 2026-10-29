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

- GA4 property "Evergreen Office Cleaning", web stream "Website", measurement ID **`G-C0JHHPLFPJ`**.
- It was attached as a second destination of the Google tag `GT-PBCTCTX6`, the tag that also carries Google Ads `AW-18472921801`. The Ads account is named "Green Clean Office Maintenance" but it is Evergreen's. Because the container loads that tag on every page, **page views reach GA4 with no container change**. Do not add a separate GA4 Google tag in GTM, or page views will be counted twice.
- The login that manages the Google tag (`ads@brandingcentres.com`) has **no access to `GTM-5W69BTJQ`**. So the site sends its six events to GA4 itself. `src/lib/ga4.ts` queues a `gtag('event', …, { send_to: 'G-C0JHHPLFPJ' })` command alongside each dataLayer push:
  - `lead_form_submission` goes to GA4 as **`generate_lead`**.
  - `phone_click`, `form_start`, `lead_form_error`, `email_click` and `quote_cta_click` keep their names.
  - The parameters are the same sanitised ones the dataLayer carries.
  - Commands go on the production hostnames only.
  - `send_to` keeps them out of Google Ads; the Ads conversion is still the container's tag.
- **If anyone wires GA4 event tags into `GTM-5W69BTJQ`, remove the `sendGa4` calls first**, or every event is counted twice.
- Still open:
  - **Staging page views reach GA4** (and Ads) through the Google tag, because the container has no `site_environment equals staging` blocking trigger (A6).
  - In GA4, mark `generate_lead` as the key event once it has been received.
  - Register `form_id`, `link_location` and `error_type` as event-scoped custom dimensions.

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

These are not done and not verifiable from here.

| # | Where | Action | Why |
|---|---|---|---|
| A1 | Google Ads | Confirm the `lead_form_submission` conversion action (label `gu9jCLqh…`) is **Primary**, counts **One**, has a sensible click-through window, and appears in the bidding goal. | It is the only lead conversion. |
| A2 | Google Ads | Confirm the "calls from website" action (`_klRCNWT…`) has a minimum call length that represents a real enquiry, for example 60 s. Decide whether it is Primary. | A connected call is a stronger signal than a tap. |
| A3 | Google Ads | Create three offline conversion actions named exactly `Evergreen - Qualified lead`, `Evergreen - Quote issued` and `Evergreen - Customer won`. Start them as **Secondary**. Upload from the `lead_offline_conversions` view weekly. | This lets you judge, and later bid on, lead quality. Do not switch them to Primary before there are enough uploads to be meaningful. |
| A4 | GTM | Add Custom Event triggers for `form_start`, `lead_form_error`, `phone_click`, `email_click` and `quote_cta_click`. Send them to GA4 (once a GA4 tag exists) as events. **Do not** attach them to Ads conversion tags as Primary. | Funnel visibility. |
| A5 | GTM / GA4 | Decide whether a GA4 property should be wired. The container has none, although the old container had `G-R27QW21PMT`. Without it, none of the funnel events are visible anywhere. | There are no analytics today beyond Google Ads. |
| A6 | GTM | Add a blocking trigger: `site_environment equals staging`. | Staging page views currently reach the live Ads tag. |
| A7 | GTM | Consider enhanced conversions for leads. The site does not push hashed user data today, and adding it needs a privacy and consent decision first. | It could improve match rates. |
| A8 | Microsoft Ads | The UET tag `187178776` from the old container is not in the new one. Re-add it or retire Microsoft Ads. | Microsoft campaigns record nothing right now. |
| A9 | Privacy | `/privacy/` still describes the old WordPress site. It should describe Google Ads tags, call tracking, session attribution storage and the lead form before any further tags are added. | PIPEDA transparency. Not legal advice. |

## 4. How to verify (after deploy)

1. GTM Preview (Tag Assistant) on the production URL with `?gtm_debug=x`:
   - Load a service page. Expect `site_environment` → `gtm.js`, and the Google tag firing.
   - Focus a form field. Expect `form_start` once only, and `form_id=service-<slug>`.
   - Tap the phone link. Expect `phone_click` with `link_location`.
2. Submit **one clearly identified test lead** with the name "TEST – do not contact", on staging or by agreement on production. Expect exactly one `lead_form_submission` and the Ads conversion tag firing once. Mark the Neon row `unqualified` with reason `test`.
3. Force a captcha failure by submitting without ticking it. Expect `lead_form_error` with `error_type=validation`, and no conversion.

# PPC campaign blueprint (Google Ads)

This is a planning document. **Nothing has been launched, changed or paused in any advertising account.** We had no access to the Google Ads account, its search-terms report or Keyword Planner. So there are **no keyword volumes, CPCs, results or data-driven negative keyword decisions here**. Every keyword below is a candidate to validate against real data.

## 1. Principles

- **Organise by service intent, not by city.** One office serves the whole GTA. Geography is handled by location targeting, not by duplicating ad groups per city.
- **Each ad group gets one landing page whose headline repeats the intent.** Paid pages are noindex and shadow an indexable service page (see `page-inventory.md`).
- **Ad copy may only use substantiated claims** (section 5). The landing page and the ad must agree, because Google checks them against each other.
- **Optimise toward real leads.** `lead_form_submission` is the only Primary conversion today. Add offline "qualified" and "won" uploads (tracking-spec A3) before letting Smart Bidding weigh value.

## 2. Structure

| Campaign | Ad group | Intent examples (candidates, unvalidated) | Landing page | Offer shown |
|---|---|---|---|---|
| **Search – Office & Janitorial (recurring)** | Office cleaning | office cleaning toronto · office cleaning services · office cleaners near me | `/lp/office-cleaning/` | First month free on a signed recurring contract · from $30/hr · 30 days' notice, plus fine print |
| | Janitorial | janitorial services toronto · commercial janitorial · janitorial company gta | `/lp/office-cleaning/` | same |
| **Search – Commercial cleaning (recurring)** | Commercial cleaning | commercial cleaning toronto · commercial cleaning company · commercial cleaners | `/lp/commercial-cleaning/` (existing) | same as the existing page |
| | Quote intent | commercial cleaning quote · cleaning company quote · cleaning estimate | `/lp/commercial-cleaning-quote/` (existing) | same |
| **Search – Post-construction (one-off)** | Post-construction | post construction cleaning toronto · construction cleanup · renovation cleaning commercial | `/lp/post-construction-cleaning/` | **No** first-month offer (one-off work). Quoted per project after a site visit. |
| *(later, only if data supports it)* Search – Specialty | Floor care / strip & wax · Medical & dental clinic cleaning | strip and wax toronto · floor waxing commercial · dental office cleaning | Organic pages `/services/building-maintenance/`, `/industries/medical-dental-clinics/` until a paid page is justified | none |

Keep the two existing commercial pages separate, with different `form_id`s, until one clearly wins on **qualified** leads, not just form fills. Then retire the other.

## 3. Geographic targeting

- **Use only verified areas.** Target "presence: people in or regularly in" these places: Toronto (including North York, Scarborough, Etobicoke, East York and York), Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering, Ajax and Oshawa. This is the coverage stated in the client's own copy (`src/data/coverage.ts`).
- **Do not target** the wider 2019 list (Burlington, Milton, Caledon, Newmarket, Aurora, King, Clarington, Scugog, Brock) until the client confirms they still travel there. It is item C3 on the intake list.
- **Use presence, not interest,** so people outside the GTA who are merely researching Toronto are excluded.

## 4. Initial negative-keyword candidates

These are hypotheses only. Each must be confirmed against the search-terms report before it is applied.

| Theme | Candidates | Why it's a candidate |
|---|---|---|
| Jobs | jobs, hiring, career, salary, wage, indeed, part time | Job seekers rather than buyers |
| Residential *(confirm first: C2)* | house cleaning, home cleaning, maid, apartment cleaning, move out cleaning (residential) | The site describes commercial work only |
| DIY / products | how to, diy, supplies, products, equipment for sale, chemicals | Research and shopping intent |
| Training / franchise | franchise, training, course, certification, start a cleaning business | Not a buyer |
| Out of scope *(confirm first)* | carpet cleaning residential, car cleaning, window washing residential, duct cleaning | Services not on the site |

## 5. Ad copy: approved claims only

Each claim is substantiated and listed with its source.

| Claim | Source |
|---|---|
| Serving Toronto since 1989 | Client site (homepage, about, service pages) |
| WSIB covered, bonded and insured | Client copy (Mississauga page, existing paid pages) |
| Free on-site walkthrough · written proposal | Client copy (homepage steps, existing paid pages) |
| After-hours and weekend cleaning | Client copy (homepage "Flexible Scheduling") |
| Dedicated account executive | Client copy (homepage) |
| Same crew every visit | Client copy (Vaughan page "Consistent Teams") |
| We reply within 2 hours | Client Google Ads copy document (2026-09-30). **Paid recurring pages only.** |
| First month free · from $30/hr · cancel with 30 days' notice | Client Google Ads copy document. **Recurring campaigns only, with the fine print on the page.** |
| Green, ECOLOGO-certified products | `/green-clean-products/` (Armstrong ProSeries Green) |

**Example responsive search ad assets (office ad group):**

- **Headlines:**
  - Office Cleaning in Toronto
  - After-Hours Office Cleaning
  - Serving Toronto Since 1989
  - WSIB Covered & Bonded Crews
  - Free On-Site Walkthrough
  - Same Crew Every Visit
  - First Month Free*
  - From $30/hr, Supplies Included
- **Descriptions:**
  - Recurring office cleaning across the GTA, scoped at a free walkthrough. Get a quote.
  - One account executive, a consistent crew, and cleaning after your staff leave.

\*Only where the offer applies. The fine print must remain on the page.

**Do not use:** ratings or review counts, "best", "#1", "guaranteed", response times other than the one above, certifications other than WSIB and bonded, or any service area not listed in section 3.

## 6. Conversions

| Role | Conversion | State |
|---|---|---|
| **Primary** | `lead_form_submission` (Ads label `gu9jCLqh…`) | Live in the container. **Account settings unverified** (A1). |
| Primary or Secondary (decide) | Calls from website ≥ N seconds (`_klRCNWT…`) | Live in the container. Settings unverified (A2). |
| Secondary | Offline: Qualified lead, Quote issued, Customer won | Needs migration 0009 plus a weekly upload (A3) |
| Observation only | `phone_click`, `form_start`, `quote_cta_click`, `email_click` | Pushed by the site, with no container triggers yet (A4) |
| Never | `lead_form_error`, page views of `/thank-you/` | n/a |

## 7. Lead-quality review (weekly, 15 minutes)

1. In Neon, set `lead_status` on every new lead: `qualified` or `unqualified` with `status_reason` (residential, out_of_area, job_seeker, vendor, spam, test, duplicate).
2. When a proposal goes out, set `quote_issued_at` and `quote_value_cad`. When it's signed, set `won_at` and `won_value_cad`.
3. Export `SELECT * FROM lead_offline_conversions WHERE conversion_time > now() - interval '8 days'` and upload it to Google Ads.
4. Review **qualified rate by `form_id`, `utm_campaign` and `gclid` presence.** Feed the unqualified reasons back into negatives (section 4) and into ad copy.
5. Monthly: compare cost per **qualified** lead by ad group, not cost per form fill.

## 8. Test hypotheses (need traffic to judge)

| Hypothesis | Change | Success measure | Minimum to judge |
|---|---|---|---|
| A dedicated office-cleaning page converts office searches better than the general commercial page | Route the office ad group to `/lp/office-cleaning/` | Qualified-lead rate per click, not form fills | About 30 qualified leads per arm, or 6 weeks |
| The optional city/area field does not reduce form completion | Field added 2026-10-15 | `lead_form_submission` ÷ `form_start` before and after | 4 weeks each side |
| Header "Get a quote" on organic pages increases enquiries | Added 2026-10-15 | Organic leads per 1,000 sessions; `quote_cta_click` with `link_location=header` | Needs GA4 (A5) |
| A quote form beside service content beats sending visitors to `/request-a-quote/` | Added 2026-10-15 | Leads by `form_id` `service-*` against `quick-quote` | 8 weeks |

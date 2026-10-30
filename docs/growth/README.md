# Evergreen growth programme

## Project status, 29 Oct 2026

The 15 Oct implementation record follows below; this section is the current state.

**Live on production** (each merged to `main` and deployed with `npm run deploy`):

| PR | What | Notes |
|---|---|---|
| #35 | **Quote forms fixed.** `/api/*` was missing from `run_worker_first`, so every form POST got a Cloudflare 405 from 17 Oct to 29 Oct. | No leads were received in that window. `tests/tooling/worker-routes.test.ts` now guards it. |
| #36, #37 | SEO audit (28 Oct) Phase 1, except C1: sitemap and `/search/`, security headers with a report-only CSP, content fixes, the video bubble, alt text and OG image metadata, the schema entity pass | CSP violations go to `/api/csp-report` (Worker log). Switch to enforcing after two clean weeks, around 12 Nov. |
| #38 | Layout audit at 360–3440 px: margins, phone type size, grids, forms, header, footer | Report in the session; no open defects. |
| #39 | GA4 events via the Google tag; the privacy policy rewritten | See tracking-spec.md. |
| this branch | SEO audit Phase 2, the parts that need no client input: `/reviews/` shows every Google review with its date (H4); the WordPress logo banners are gone from 34 posts (H10); Service `@id`s, catalog URLs, `contactPoint`, `BusinessAudience` and a `ServiceChannel` to `/request-a-quote/` (H12); slash-less URLs 301 instead of 307 (M3); the sitemap split into `sitemap-pages-0.xml` and `sitemap-insights-0.xml`, with `sitemap-0.xml` 301ing to the pages one (M2); the Mississauga over-claim removed and post-construction given a geo H1 and phases (M9); a `/services/` intro and linked area names on `/locations/` (M11); browser image cache 30 days | Waiting on the client or an account owner: H2 container audit (GTM access), H5 About page (named people), H6 photoshoot, H13 and C6 listings, C3 rewrites with client facts, D-A form fields. |

**Measurement:**

| Item | State |
|---|---|
| GA4 property `G-C0JHHPLFPJ` ("Website" stream; account `413966610`, property `561394338`) | **Done.** Attached to Google tag `GT-PBCTCTX6` (with Ads `AW-18472921801`). Page views and the site's events are verified arriving. |
| Custom dimensions `form_id`, `link_location`, `error_type` | **Done** (account owner, 29 Oct). |
| Enhanced measurement → Form interactions | **Off** (account owner, 29 Oct). Verified: one `form_start` per form, no duplicate. |
| `generate_lead` key event | **Created** (account owner, 29 Oct). **Not yet confirmed**: no genuine lead since the form fix. Check the first one in GA4 Realtime or Events. Do not submit a test lead. |
| Google Ads conversions | **Unchanged.** Verified: lead conversion `gu9jCLqh74sdEMnVyehE` on `lead_form_submission`, and call tracking. |
| Staging excluded from GA4 and Ads | **Done, 29 Oct.** The staging domain was removed. |
| User-provided data on the Google tag | **To confirm.** Automatic detection is on; check whether Ads enhanced conversions use it, then add a line to `/privacy/` if so. |
| Search Console | **Done, 29 Oct.** Domain property `sc-domain:evergreencleaningservice.ca` is verified for `ads@brandingcentres.com`, by the existing `google-site-verification` TXT record. `sitemap-index.xml` submitted (Success); `sitemap-0.xml` has been read since 10 Oct. The 2021 WordPress `sitemap_index.xml` 301s to the new index. Linked to GA4 (property `561394338`, stream "Website"). |

**Client decisions, confirmed 29 Oct 2026:**

- **Address (C4).** 243 Queen St W is correct and stays on the Google Business Profile as it is, so there is no switch to a service-area business. The site, the schema and the footer already use it.
- **Name and founding year (D-C).** "Evergreen Office Cleaning", founded **1989**. The site and schema already match. "Evergreen Cleaning Service(s)" is in the schema's `alternateName`.
- **Review requests (C5).** Approved. The kit (QR code, short link, post-service email line) is ready for the client's team to use. Every Google review has been replied to as of 29 Oct.

**Done from the Ads and Business Profile logins, 29 Oct 2026** (by the account owner; not checked from here):

- Google Ads: the lead and call conversion settings were reviewed (A1, A2). The three Secondary offline conversion actions were created (A3): `Evergreen - Qualified lead`, `Evergreen - Quote issued`, `Evergreen - Customer won`.
- Staging: `stage.evergreencleaningservice.ca` was removed (no DNS record), which ends the staging hits to GA4 and Ads (A6). GA4 and Ads data from before 29 Oct includes some staging visits.

**Client decisions, 30 Oct 2026:** the reply promise is "within 2 hours" everywhere, the site's forms as well as the ads; for the other Phase 2 calls, do what serves the site's SEO. So the quote form's checkboxes now use the service pages' names (M13), and the location pages carry the breadcrumb above the H1 (M9).

**Still open:**

- The weekly lead review in `/admin/leads/` and the weekly offline-conversion upload (C2 routine).
- Correct the directory citations to the confirmed details (Phase 2, C6): "Evergreen Office Cleaning, 243 Queen St W, (416) 803-4880, since 1989".
- The baseline file `drift/baseline-2026-10-28.json` for L9 is not in the repo.
- Switch the CSP from report-only to enforcing after two clean weeks (around 12 Nov).
- Confirm the first genuine `generate_lead` in GA4.
---

# Implementation record (15 Oct 2026)

Branch `claude/nice-mayer-r2gmzt`. This is the reviewable record of one coordinated change. It covers the six phases of the brief, implemented together.

| Document | Contents |
|---|---|
| [adaptation-matrix.md](adaptation-matrix.md) | What JAN-PRO does well, the evidence URL for each point, and what Evergreen adapted |
| [page-inventory.md](page-inventory.md) | New, improved, campaign-only and unpublished pages, with intent, audience, sources and links |
| [performance.md](performance.md) | Before and after Lighthouse medians, test conditions, causes found, and remaining limits |
| [tracking-spec.md](tracking-spec.md) | Every dataLayer event, the decoded live container, and the account-side setup still needed |
| [ppc-blueprint.md](ppc-blueprint.md) | Campaign and ad group structure, geo targeting, landing pages, approved claims, negatives, conversions and lead review |
| [client-intake.md](client-intake.md) | Facts, evidence and access still needed |

## Preview

There is a **non-serving preview version** at https://5342ef75-evergreencleaningservice.ash-47a.workers.dev. It is Worker version `5342ef75-29e4-4ea8-818f-2dd7d34753b4`, uploaded with `wrangler versions upload` on 15 Oct 2026.

Production traffic was **not** moved to it. The production pages and the Worker's active deployment were checked afterwards and are unchanged.

On the preview host:

- every response carries `X-Robots-Tag: noindex`
- GTM does not load
- leads cannot be submitted, because the domain-locked reCAPTCHA cannot render there, so the Worker refuses the submission

It mirrors the third commit on this branch; later commits are docs-only.

## Current state found (Phase 1)

- **Production already runs this Astro site.** On 15 Oct, `www.evergreencleaningservice.ca` served HTML byte-identical to a local build of `main` (apart from one relative date) and to staging. Production and staging are one Cloudflare Worker. Any `wrangler deploy` is a production deploy.
- **The live GTM container (`GTM-5W69BTJQ`)** holds only Google Ads: a Google tag, the conversion linker, a lead conversion on `lead_form_submission`, and website call tracking. There is no GA4 and no Microsoft UET. See tracking-spec.md.
- **No analytics or Search Console access was available.** The service and geographic priorities below are therefore **provisional**. They are based on the client's own ordering of services (the quote form lists Commercial, then Office), the Google Ads copy document (recurring commercial cleaning), the homepage title (office cleaning), and the user's brief (recurring office/commercial and post-construction).

## What changed and why

**Performance.**

- reCAPTCHA now loads only when a visitor approaches or touches a form. Before, it loaded on every page with a form, which was every page.
- The three `recaptcha__en.js` rows Lighthouse reported are the page, the anchor iframe and the challenge iframe of **one** widget. They are separate frames, not duplicated code.
- Content is no longer hidden until JavaScript reveals it on scroll.
- All CSS is inlined, removing four render-blocking requests.
- Fingerprinted assets are cached for a year.
- The floating video no longer downloads on page load.
- Measured results are in performance.md.

**Measurement.** New events: `form_start`, `lead_form_error`, `email_click` and `quote_cta_click`. `phone_click` now recognises Google forwarding numbers. A lead-outcome migration and an offline-conversion view are ready but not applied. The conversion event itself is unchanged.

**Structure.**

- Services, Industries and Service Areas hubs in the header and footer.
- A persistent phone link and quote button.
- One template for service and industry pages.
- A quote form on every service, industry and location page.
- Data-driven paid landing pages.
- A case-study model whose publish gate fails the build until the client's approvals are recorded.

**Content.**

- The homepage is rewritten around what, where, who, why and how.
- Four service pages are rebuilt, including the placeholder building-maintenance page.
- New pages: two industry pages and `/our-process/`.
- Location pages are made honest (one office) and more useful.
- Two new noindex paid pages.
- Unverifiable claims were removed instead of repeated: "best", "80% referrals", "certified", "each area has its own crews", and named districts the business was never confirmed to work in.

**Forms.** The short quote form gains one optional "city or area" field and nothing else. Labels, inline errors, focus management, the honeypot, the captcha and server-side verification are unchanged.

## Validation run on this branch

| Check | Result |
|---|---|
| `npm test` (unit, build and worker suites) | **737 passed, 0 failed** (31 files) |
| `npm run build` (production, real reCAPTCHA key) | Passes: preflight, image repointing and the captcha-key gate |
| Internal links (build test) | 0 broken, 0 through a redirect |
| One H1 per page, canonical present, JSON-LD parses (build tests) | Pass |
| Sitemap | 73 URLs, all built, no noindex page included |
| Horizontal overflow at 320 and 390 px | None on the home, service, industry, process, location and paid pages checked |
| Lighthouse before and after | performance.md |

## Deployment (needs explicit approval, because it is production)

Production and staging are the same Worker, so there is no separate production step to approve later.

1. Review and merge the PR into `main`.
2. Optional, but recommended before merge: `npx wrangler versions upload` from the branch creates a **non-serving preview version** with its own `*.workers.dev` preview URL. Production traffic is untouched. On that host GTM does not load (hostname allowlist), and the domain-locked reCAPTCHA cannot render, so **the preview cannot submit leads**. Use it for visual review only.
3. From a clean `main`:
   ```bash
   export PUBLIC_RECAPTCHA_SITE_KEY=6LcyzNctAAAAACGzkXLGxWE2M4LC7jJiCfcTzZE7
   npm run deploy      # guard → tests → secret check → B2 sync → build → wrangler deploy → purge
   ```
4. Immediately afterwards, run:
   - `npm run verify:indexing -- production`
   - GTM Preview checks from tracking-spec.md §4
   - one clearly marked test lead, if the client agrees
5. Ten minutes afterwards, spot-check `/`, `/services/office-cleaning/`, `/locations/mississauga/` and `/lp/office-cleaning/` on a phone.

**Not part of the deploy:**

- Migration `0009`: apply separately, with approval and a Neon snapshot first.
- GTM and Ads changes (tracking-spec §3): they are made in those accounts.

## Rollback

- **Fastest:** `npx wrangler deployments list`, then `npx wrangler rollback <previous-version-id>`. This restores the previous Worker version, including its static assets, in seconds. Then purge the cache with `npm run purge`.
- **In git:** `git revert -m 1 <merge-commit>` on `main`, then `npm run deploy`.
- **Data:** no change in this branch writes to the database or alters a table. Migration 0009, if applied later, is additive, and its rollback statements are in the file header.
- **URLs:** no URL was removed or renamed, so a rollback leaves no broken links. The new pages would return 404 until redeployed. None of them is in a live ad yet.

## End-to-end browser checks (built site, Chromium)

These were run on `/services/office-cleaning/` with the lead endpoint intercepted, so **no real lead was sent and no customer was contacted**:

- Keyboard order runs: skip link → logo → phone → quote → menu. Submenus open on keyboard focus.
- The mobile drawer opens and sets `aria-expanded="true"`.
- An empty submit marks every required field invalid, inline, and pushes `lead_form_error` (validation).
- `form_start` is pushed exactly once.
- A server 500 shows a recovery message with the phone number, re-enables the button, and pushes no conversion.
- A server 200 replaces the form with a confirmation and pushes **exactly one** `lead_form_submission`.
- A `gclid` and UTMs from the landing URL arrive in the payload of a lead submitted from a **later** page.
- The payload carries `form_id=service-office-cleaning` and the optional city.
- The dataLayer contains no name, phone or email.

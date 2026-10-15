# Evergreen growth programme: implementation record (15 Oct 2026)

Branch `claude/nice-mayer-r2gmzt`. This is the reviewable record of one coordinated change. It covers the six phases of the brief, implemented together.

| Document | Contents |
|---|---|
| [adaptation-matrix.md](adaptation-matrix.md) | What JAN-PRO does well, the evidence URL for each point, and what Evergreen adapted |
| [page-inventory.md](page-inventory.md) | New, improved, campaign-only and unpublished pages, with intent, audience, sources and links |
| [performance.md](performance.md) | Before and after Lighthouse medians, test conditions, causes found, and remaining limits |
| [tracking-spec.md](tracking-spec.md) | Every dataLayer event, the decoded live container, and the account-side setup still needed |
| [ppc-blueprint.md](ppc-blueprint.md) | Campaign and ad group structure, geo targeting, landing pages, approved claims, negatives, conversions and lead review |
| [client-intake.md](client-intake.md) | Facts, evidence and access still needed |

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

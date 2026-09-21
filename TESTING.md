# Testing

```bash
npm test          # one pass, what CI and the deploy scripts run
npm run test:watch
```

`npm run deploy:preview` and `npm run deploy` both run `npm test` first, so
nothing reaches staging or production without the suite passing.

## The framework, and why this one

**Vitest**, with **happy-dom**.

Astro is Vite. Vitest is Vite's own test runner, so the modules under test are
resolved and transformed by the same pipeline that `astro build` uses — same
resolver, same TypeScript handling, same `import.meta.env`. A Jest or Node
`--test` setup would mean a second transform to keep in step with the first,
and the failure mode of that drifting is a suite that passes on code the build
compiles differently. That is not a theoretical worry on this project: the two
most expensive bugs in the port so far were both cases of the emitted bytes
differing from what the source appeared to say.

happy-dom rather than jsdom because the client code needs a DOM, events and a
stubbable `fetch`, and nothing else — no canvas, no layout. happy-dom starts in
about a quarter of a second.

`src/worker.ts` is tested in the **node** environment instead, declared per
file with a `@vitest-environment node` docblock rather than by a glob, so
moving a test file cannot silently change its runtime. The Worker's entry
point is a plain `fetch(request, env)` function, so a test calls it directly
with a real `Request` and a hand-built `env`. That covers every decision the
endpoint makes. It does **not** run the Workers runtime; see *What is not
tested* below.

There is deliberately no browser-automation layer. Playwright against a
deployed preview is the right tool for the handful of things that genuinely
need a browser, and those are listed as manual staging checks in the phase
reports rather than pretended away in a unit test.

## What the suite covers

| File | Environment | Covers |
| --- | --- | --- |
| `tests/lead-submit.test.ts` | happy-dom | Phase 2. The shared submit pipeline: event ordering, the failure matrix, duplicate clicks, control recovery, the PII allowlist, captcha token handling. |
| `tests/conversion-event.test.ts` | happy-dom | Phase 2 closeout. One canonical conversion event: delivery protection across the redirect (against a simulated container), and zero conversions from a reload, a direct visit, a back-button return or a resubmit. |
| `tests/attribution.test.ts` | happy-dom | Phase 3. First- and latest-touch rules, survival across internal navigation, expiry in both retention modes, sanitising and length limits, and that nothing reaches the DOM. |
| `tests/captcha-hosts.test.ts` | node | Phase 4. The production and staging hostname allowlists, and detection of every published key. |
| `tests/build/indexability.test.ts` | node | Phase 5. Builds the site in production mode into a throwaway directory and reads the emitted HTML: canonicals on the final domain, which pages are noindex, the sitemap's contents and origin, the allow-all `robots.txt`, and that only `build:preview` marks the output noindex. |
| `tests/build/gates.test.ts` | node | Phase 4. `preflight.mjs`, `captcha-check.mjs` and `secret-check.mjs` run as child processes — real argv, real exit codes, a real `dist/` — because a gate that crashes instead of checking exits non-zero either way. |
| `tests/worker/submit-lead.test.ts` | node | Phase 3 and Phase 4. `/api/submit-lead`: which columns the INSERT actually names and binds, server-side sanitising, the honeypot, the captcha failure paths, and the refusal of published test secrets on a production host. |
| `tests/build/headings-and-links.test.ts` | node | Phase 6. One meaningful H1 per emitted page, and internal links that reach a 200 without a redirect, read off the build and the generated `_redirects` together. |
| `tests/build/content.test.ts` | node | Phase 7. The corrections to the copy, asserted against the emitted HTML so a claim cannot come back through a component. |
| `tests/build/images.test.ts` | node | Phase 8. Image formats, dimensions, loading and decoding attributes, and that no reference to a local `/images/` path survives the B2 rewrite. |
| `tests/quick-quote.test.ts` | happy-dom | Phase 9. The short quote form: phone-or-email from six directions, a malformed optional field, no address and no surname, the failure matrix, one conversion, no PII, repeat clicks, both Turnstile timings, and errors and success as assistive technology receives them. |
| `tests/worker/lead-validation.test.ts` | node | Phase 9. `leadProblems` — a name and one way to reply — and the endpoint agreeing with the form: phone-only, email-only, no address, and the 422s that name the field. |
| `tests/build/quote-page.test.ts` | node | Phase 9. `/request-a-quote/` as emitted: one lead form where there were two, one H1, the full navigation, the sidebar's verified claims, no placeholder-as-label, and the rendered field contract matched against the fixture the behavioural suite drives. |

Because all the lead forms — the two PPC landing pages, the shared
`FormRuntime` used by the quote and contact forms, and the short quote form —
import `src/lib/lead-submit.ts`, a pass here is a pass for all of them. Before
this they were three copies of the same logic, and they had drifted.

`tests/fixtures/quick-quote.ts` is the one description of the short form's
fields. `tests/quick-quote.test.ts` drives it; `tests/build/quote-page.test.ts`
asserts the built component still matches it. That pairing is deliberate: a
hand-built DOM fixture is the fastest way to test behaviour and the easiest
thing in a repository to leave behind when the component changes.

## What is not tested

Stated plainly, because an untested area that nobody has written down reads as
a tested one.

- **The Workers runtime.** Tests call the exported `fetch` handler directly.
  Bindings (`env.ASSETS`), `request.cf`, edge caching and the routing between
  static assets and the Worker are not exercised. `wrangler dev` or a deployed
  preview is the only place those are real.
- **Neon.** The database insert is not reached in tests; there is no test
  database. An insert failure is covered only as "the endpoint answers 500".
- **Resend.** The notification email is fire-and-log; not asserted on.
- **The captcha providers.** `siteverify` is stubbed. Whether Cloudflare
  accepts a given key pair is a deployed-preview check.
- **Rendered Astro pages.** Nothing asserts on the HTML of a built page beyond
  what the build scripts already check. Page-level fidelity is covered by the
  `wp-check-nothing-is-missing` diff, which is a separate, browser-based
  procedure run against the preview hostname.
- **Anything visual.** No layout, no breakpoints, no screenshots.
- **Performance.** Nothing in the suite measures speed. `npm run measure`
  runs Lighthouse three times and reports the median; `npm run perf:matrix`
  attributes third-party cost by blocking one origin at a time inside the
  measuring browser. Both need a running origin, both are slow, and both
  belong in a report rather than in a test — a Lighthouse score is a
  measurement of a network on a day, not a property of the code.
- **Deployed response headers.** `X-Robots-Tag` is `dist/_headers` as
  Cloudflare interprets it, and that can be wrong while the repository is
  right — a stale deploy, an edge cache, a zone transform rule. The build
  tests prove the artefact; `npm run verify:indexing -- staging|production`
  proves the origin, and has to be run against a deployed site.
- **The GTM container.** Tests prove what this site pushes into
  `window.dataLayer`, and `tests/conversion-event.test.ts` simulates a
  container that honours `eventCallback`. They cannot prove what container
  GTM-5PRC4HBV does with the event — that needs Tag Assistant against the
  deployed preview, and, as of the Phase 1 baseline, the container has **no
  trigger for `lead_form_submission` at all**. `docs/gtm-handoff.md` is the
  specification for fixing that, and §8 of it is the manual checklist.
- **A real Turnstile key pair.** The build and deploy gates prove that a
  missing key, a malformed key and the published test keys are refused. They
  do **not** prove that a genuine Cloudflare sitekey and secret work together:
  no production key pair has been issued, so no real staging submission has
  ever been made with one. That is a deployed check, and it is blocked on
  Cloudflare access.

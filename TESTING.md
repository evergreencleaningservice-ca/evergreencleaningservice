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

Because all three lead forms — the two PPC landing pages and the shared
`FormRuntime` used by the quote and contact forms — import
`src/lib/lead-submit.ts`, a pass here is a pass for all three. Before this they
were three copies of the same logic, and they had drifted.

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
- **The GTM container.** Tests prove what this site pushes into
  `window.dataLayer`. They cannot prove what container GTM-5PRC4HBV does with
  it — that needs Tag Assistant against the deployed preview, and, as of the
  Phase 1 baseline, the container has no trigger for either event this site
  emits.

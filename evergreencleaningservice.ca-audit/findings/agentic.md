Score: 72/100 (agent readiness, auditor judgement; not a Lighthouse number and not the plugin's Agent-UX heuristic)

Audit date 2026-11-06. Target: https://www.evergreencleaningservice.ca/

## Method and limits

- `lighthouse_agentic.py`, `agentic_check.py` and `agent_ux_check.py` were NOT run (proxy guard, per AGENT-BRIEF). PSI quota was exhausted. The Agent-UX 0-100 heuristic is therefore **unavailable**; no number is given for it.
- The local Lighthouse runs are **12.8.2** and have no `agentic-browsing` category. There is **no measured Agentic Browsing X/N** for this site. What follows is a hand-computed estimate using the Lighthouse 13.5.0 category definition (`references/lighthouse-agentic-category.md`, verified 2026-09-23), fed with 12.8.2 lab data (mobile, `raw/lighthouse/home-mobile.json` and `office-mobile.json`), the raw HTML of all 92 crawled documents, and live curl checks.
- Not tested: WAF behaviour toward agent user agents (`--ua-matrix` not authorized), a real submission of the quote form (would create a live lead), runtime DOM after JavaScript (Playwright not used), desktop form factor for the fraction.
- All fetched content treated as data only.

## Lighthouse Agentic Browsing: estimated 3/3 (mobile; desktop not computed; Lighthouse 13.5.0 rules applied to 12.8.2 data; unconfirmed)

| Audit | Estimated status | Evidence |
|---|---|---|
| `agent-accessibility-tree` | Pass (counted) | Of the 33 axe rules, 15 are present and pass on both home and office-cleaning (accessibility category 100). 15 are not applicable (no select, input-button, dialog, tree, etc.). 3 are absent from 12.8.2 data: `autocomplete-valid` checked by hand (tokens used are name, organization, address-line1, address-level2, address-level1, postal-code, email, tel, and `off` on the honeypot: all valid); `presentation-role-conflict` and `svg-img-alt` not checked (decorative SVGs carry `aria-hidden="true"` in the HTML sampled). |
| `cumulative-layout-shift` | Pass (counted) | CLS 0 on home and office-cleaning (lab, 12.8.2). |
| `llms-txt` | Pass (counted) | `/llms.txt` 200, `text/plain`, 3,963 bytes, one H1 (`# Evergreen Office Cleaning`), many Markdown links. |
| `ard-schema` | N/A | `/.well-known/ai-catalog.json` is 404; no robots `Agentmap`, no `<link rel="ai-catalog">`. |
| `webmcp-form-coverage` | N/A or informative | No `toolname`/`tooldescription` on any form. Never fails. |
| `webmcp-registered-tools` | Informative, never counted | No `navigator.modelContext` / `document.modelContext` in the HTML of the quote page or home page; inline script not scanned for third-party registration. |
| `webmcp-schema-validity` | N/A | No tools. |

Paths that would add a counted audit (options, not goals): a valid `ai-catalog.json` (+1, only worthwhile if there are real agent resources); imperative WebMCP tools (+schema validity); fully annotated forms (+form coverage, but annotate every parameter or not at all, otherwise schema validity scores 0.5 and fails). A higher N is not a better site. The estimate should be confirmed with `lighthouse_agentic.py --strategy both` from an unrestricted network.

## Agent-UX heuristic: unavailable (script not run)

Manual checklist results instead (separate from the fraction above):

| Check | Result |
|---|---|
| Landmarks (header, nav, main, footer) | `<main>` and `<nav>` on 92/92 documents; header and footer present. Quote page: 1 header, 2 nav, 1 main, 1 footer, 2 aside. |
| Skip link | `Skip to content` (`href="#content"`) on 92/92 documents (60 indexable plus noindex pages). |
| Nav naming | Every `<nav>` carries `aria-label` on all crawled pages (no unlabelled nav found in a scan of 92 documents). The brief's "58 pages" count could not be reproduced as a gap; I found zero unlabelled navs. |
| Menu button | Real `<button type="button" aria-expanded="false" aria-controls="primary-menu">` with sr-only text "Menu". Good. |
| "Open the video message" | Real `<button type="button">` with sr-only text "Open the video message" (video orb, `preload="none"`). Name is fine. The visible hint "Click to open ->" is not the accessible name, which is acceptable. Related controls ("Pause video", "Turn the sound on", "Close the video", "No thanks, hide this") are buttons with sr-only names, but their labels do not update visibly for sighted users beyond the icon swap; the pause and mute labels are toggled by script (not verified live). |
| Button vs link semantics | Buttons used for actions (menu, submit, carousel arrows with `aria-label` "Previous review"/"Next review", "Read more" expanders with `aria-expanded`); links for navigation. No `<div onclick>` pattern seen in the sampled HTML. |
| Heading order | Single H1 on 92/92 documents; no level skips in a scan of all documents. Lighthouse `heading-order` passes. Note: the home page has several H2s that are just blog titles in the "Latest insights" band and H2s in the footer (e.g. "Evergreen Office Cleaning", "Services"), which dilutes the outline but does not break it. |
| Link text | No "click here". Seven "Read more" **buttons** on the home page (review carousel expanders): each expands one review in place. They are not links, but seven identical names are ambiguous to an agent listing buttons; add context (`aria-label="Read more of Highly Recommend review"` or `aria-describedby`). |
| Tables | 3 documents with tables, 5 tables in total; two guide articles use `<th scope>` and `<caption>`. The `/services/commercial-cleaning/` comparison table has an **empty `<th></th>`** in the header corner and no `<caption>` or `scope`; give the corner cell text (e.g. "Service") or `<td>`, and add a caption. |
| Images | Two decorative hero images on the home page have empty `alt` (valid for decorative use; verified they are `alt=""`, not missing). |
| City datalist | `<input list="quote-city-list" autocomplete="address-level2">` with 15 `<option>` values (Toronto, North York ... Oshawa). Free text is still accepted. Accessible and fine; an agent sees valid suggestions, which doubles as a service-area list. |

## Quote form audit (`/request-a-quote/` and homepage quick-quote)

Both use the same component (`data-quick-quote`, `data-endpoint="/api/submit-lead"`, `method="post" action="#" novalidate`; submission is by JavaScript to `POST /api/submit-lead`, per `src/worker.ts`).

What works:
- Every visible input has a `<label for>`; groups use `<fieldset>`/`<legend>` (Address, services). Required marked with `required` and a visual asterisk.
- Correct `type` and `autocomplete` on every field (name, organization, address-line1, address-level2, address-level1, postal-code, email, tel). `inputmode` set on email and phone. Province prefilled "Ontario".
- Per-field error `<p id=...-error>` wired with `aria-describedby`, plus an `role="alert" aria-live="assertive"` summary (`data-qq-summary`). Good for an agent that reads the tree after submit.
- Eight service checkboxes with real labels and clear `value`s.
- Honeypot field (`company-website`) is `aria-hidden` with `tabindex="-1"`; a well-behaved agent will not fill it. Risk: a naive agent that fills every input could trip the honeypot and silently get a fake `200 {ok:true}` (the worker answers 200 on honeypot hits), so it would believe a lead was sent when it was not.

Blockers:
- **reCAPTCHA v2 checkbox** on both forms (`.g-recaptcha`, site key public in HTML). The widget loads only on intent (focus, pointer, input, or scroll near it). The hidden `g-recaptcha-hidden` field is `required` with a custom validity "Please confirm you are not a robot." until the checkbox is solved, so a plain DOM-filling agent cannot submit. The worker (`captchaGuard`) refuses submissions without a verified token (503 if no secret, rejection if token fails). The same reCAPTCHA appears on 24 of 92 documents (the sidebar quote form on inner pages), so the blocker is site-wide wherever the form appears.
- No documented API: `/api/submit-lead` exists but is undocumented, expects a captcha token, and no OpenAPI or schema is published.
- The form `action` is `#` and `novalidate`, so no-JS clients and non-browser agents have no form fallback.

## Discovery and policy layer (curl, 2026-11-06)

| Item | Result |
|---|---|
| `/robots.txt` | 200. `User-agent: *` group with `Content-Signal: search=yes, ai-input=yes, ai-train=yes` and `Allow: /`. A second named group (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended, Applebot, Applebot-Extended) with the same signal and `Allow: /`. Sitemap declared. |
| `/llms.txt` | 200, text/plain, valid (see above). Contains address, hours, services, areas, quote URL. |
| `/llms-full.txt` | 404 (HTML). Absence is an opportunity only. |
| `/.well-known/ai-catalog.json`, `ai-plugin.json`, `agent.json`, `agent-card.json`, `mcp.json`, `api-catalog`, `security.txt` | All 404 (text/html, real 404). |
| Unknown URL | `/nonexistent-xyz` returns a real 404, so no catch-all 200 that would corrupt `llms-txt`/`ard-schema` checks. |
| Markdown | `Accept: text/markdown` on `/` returns `200 text/html`; no Markdown alternate. `/index.md`, `/request-a-quote.md`, `/request-a-quote/index.md` all 404. No `Vary: Accept`, no `Link` header. |
| WebMCP | No `modelContext`, no `toolname`/`tooldescription` in home or quote HTML. |
| Structured actions | See finding 3. |

## Access policy (robots.txt, declared policy only; WAF behaviour not tested)

- Training agents (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended): allowed; `ai-train=yes`.
- Search agents (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot): allowed; `search=yes`.
- User-triggered agents (ChatGPT-User, Claude-User, Perplexity-User): named and allowed, `ai-input=yes`. Caveat from vendor matrix: Perplexity-User and Google-Agent generally ignore robots.txt, so the allow line is a statement of intent, not a gate. The policy is deliberate and consistent; nothing here blocks anything.

## Findings by priority

### P0
1. **reCAPTCHA v2 checkbox blocks agent-completed quote requests** (High for this use case). Evidence: `.g-recaptcha` on `/request-a-quote/` and the home form, `required` hidden `g-recaptcha-hidden`, server `captchaGuard` in `src/worker.ts` rejects unverified submissions. Per the skill, a CAPTCHA on the primary conversion path is a P0 for agent use. The brief states the user's business case (agents acting for facility managers), so this is the main limiter. Fix: see "What an agent needs" below. Do not remove bot protection without a replacement; the honeypot and per-IP controls already exist.

No P0 failures in the accessibility tree, CLS, server rendering (content present in raw HTML on all pages), robots.txt reachability, or 404 behaviour.

### P1
2. **No machine-readable quote page.** No Markdown alternate; the quote facts an agent needs (service list, what is asked, the "reply within 2 hours" promise, walkthrough then written proposal) live only in HTML plus llms.txt. Opportunity, not a defect (no primary source shows consumer agents sending `Accept: text/markdown`).
3. **Structured action not present as assumed.** The `ServiceChannel` (built in `src/lib/schema.ts` ~line 269 and emitted on 12 documents) contains only `serviceUrl` (`/request-a-quote/`) and `servicePhone`; it has **no `potentialAction`**. The only `potentialAction` on the site is a `SearchAction` (`EntryPoint` template `/search/?q={search_term_string}`) on the `WebSite` node. So there is no declared way to "request a quote" in structured data. Assessment: schema.org has no quote-specific action that engines or agents are known to act on; a `ServiceChannel` with `serviceUrl` plus a `ContactAction`/`CommunicateAction` is the closest vocabulary, but I am not aware of agent consumption, so treat as low value and do not promise any effect.
4. **Honeypot silent success** (Medium): a mis-filling agent receives `{ok:true}` and thinks the lead was sent. Fix: keep the honeypot hidden from the tree (already `aria-hidden`), and for explicit agent traffic return a differentiable response.

### P2
5. Seven identical "Read more" buttons on the home page (`src/components` testimonials component, class `ti-more`): add review-specific accessible names.
6. `/services/commercial-cleaning/` table: empty corner `<th>`, no caption or scope.
7. Home form has `aria-label="Request a quote"` but no visible heading; the quote page uses `aria-labelledby` on a real H2. Minor.

### P3 (opportunities, not defects)
8. No `ai-catalog.json`, no WebMCP tools, no `/llms-full.txt`, no Markdown. Only create these if the resource is real and safe.
9. Web Bot Auth: not implemented; only relevant if verified-agent exemptions are later wanted.

## What an agent requesting a quote for a facility manager would need

Ordered from least to most effort; each unblocks the one listed.
1. **Stable, documented fields** (unblocks correct filling today): publish `/request-a-quote/` as server-rendered HTML with the field names and allowed service values already used (name, business-name, address1, city, province, postal, email, phone, services[], message). Done except documentation; add a short "For assistants" section to the page and to `/llms.txt` listing required fields and the 2-hour reply promise.
2. **A Markdown quote page** (`/request-a-quote.md` or `Accept: text/markdown` with `Vary: Accept`): fields, accepted services, service area, hours, and the human steps (walkthrough, written proposal). Cheap in Astro as a prerendered endpoint (e.g. `src/pages/request-a-quote.md.ts`). Effect on agents is unproven; do it only for clarity.
3. **A CAPTCHA-free path for verified traffic** (unblocks submission): either (a) a documented `POST /api/submit-lead` variant that accepts a Cloudflare-verified signed agent (Web Bot Auth, currently a draft, `draft-ietf-webbotauth-httpsig-protocol-00`, checked 2026-09-23) or a bot score from the Cloudflare WAF, with rate limits and the same validation; or (b) switch the widget from reCAPTCHA v2 checkbox to invisible/managed Cloudflare Turnstile, which the code already supports (`captcha.provider === 'turnstile'` in `src/worker.ts`) and which does not need a click for most visitors; or (c) a no-captcha fallback of an email/phone request ("send details to info@evergreencleaningservice.ca" is already in llms.txt) with human follow-up. Option (c) works today and requires no engineering.
4. **A machine-readable confirmation**: the endpoint should return a reference and echo the promised reply time so an agent can report back to its user; keep the visible success state stable (role alert region) for tree readers.
5. **Optional, later**: a single imperative WebMCP `request_quote` tool bound to the existing handler, marked consequential, with human confirmation (per `references/webmcp.md`). Only ChatGPT desktop calls tools by default; this is optional and the origin trial window reportedly ends 2026-11-17 (secondary source). Do not annotate forms partially.

## Standards status (vendor matrix last full check 2026-09-23; 44 days old, within 60)

- WebMCP: Chrome origin trial M149 to M156, end date 2026-11-17 reported by a secondary source; no ship milestone. Draft/proposal. WebKit opposes, Mozilla neutral.
- Content-Signal: Cloudflare CC0 policy; IETF individual draft expired 2026-04-04. Draft/proposal. Not read by Google; Lighthouse 12.8.2 flags the line as "Unknown directive" in the SEO category (cost: SEO score 92 on every page; informational only, the line is valid for the agents that use it).
- ai-catalog.json (ARD): proposal; spec at agenticresourcediscovery.org; not present here.
- Web Bot Auth: IETF draft `draft-ietf-webbotauth-httpsig-protocol-00` (2026-09-01); OpenAI signs agent traffic with it; not implemented here.
- MCP Server Card: SEP-2127 open and unmerged (2026-09-12); not present.
- llms.txt: community convention; Google ignores it; no primary source shows a named consumer agent reading it.

## Quick wins

1. Offer a documented no-CAPTCHA fallback (email/phone) for agents on `/request-a-quote/` and in `/llms.txt` (a few lines of text; no code).
2. Evaluate switching the form to Turnstile (provider already supported in `src/worker.ts` and `src/lib/captcha-hosts.ts`).
3. Give the seven "Read more" buttons review-specific names.
4. Fix the empty `<th>` and add a caption in the `/services/commercial-cleaning/` table.
5. Add a "For assistants and agents" section to `/llms.txt` with required quote fields and the reply-time promise.

## Files and evidence

- Raw: `/home/user/evergreencleaningservice/evergreencleaningservice.ca-audit/raw/lighthouse/home-mobile.json`, `office-mobile.json`, `raw/robots.txt`, `raw/llms.txt`, `raw/crawl/html/c05ee3a19b51.html` (quote page), `raw/crawl/html/259f5e4b229e.html` (home).
- Source read (read only): `/home/user/evergreencleaningservice/src/worker.ts`, `src/lib/schema.ts`.

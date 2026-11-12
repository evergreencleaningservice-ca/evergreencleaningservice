Score: 80/100
Previous: 77/100 (re-audit 7 Nov)

Agent readiness, auditor judgement. Not a Lighthouse number and not the plugin's Agent-UX heuristic. Target https://www.evergreencleaningservice.ca/, checked 12 Nov 2026 (live curl, Playwright with analytics/Ads/RUM blocked and any POST to /api/ aborted: 0 posts made; static scan of all 94 crawled documents).

## Method and limits
- claude-seo plugin scripts not run (proxy guard per BRIEF). Agent-UX 0-100 heuristic: unavailable. Lighthouse Agentic Browsing X/N: not measured (local Lighthouse 12.8.2 has no agentic category; PSI not used). Hand estimate, unconfirmed: the same 3 counted audits as before (accessibility tree, CLS, llms-txt) look satisfied; do not read as a measured fraction.
- Live: `/llms.txt` 200 text/plain, 57 lines, now lists all 11 location pages, janitorial-services and the checklist post.
- Static scan of 94 crawled HTML docs (Latin-1 saved): all have a skip link, a `<main>`, exactly one H1; 0 unlabeled visible inputs, 0 unnamed buttons, every `<nav>` has an aria-label, 0 heading-level skips.

## 2. Status of re-audit (7 Nov) findings

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | reCAPTCHA v2 blocks agent-completed quote requests | Open (partly mitigated) | `/request-a-quote/` runtime: reCAPTCHA anchor and bframe iframes present; hidden `g-recaptcha-hidden` is `required`. Not adopted: Turnstile. Documented no-CAPTCHA path remains (rows 9 and N1). |
| 2 | No Markdown delivery | Open (opportunity) | `Accept: text/markdown` on `/` returns 200 text/html; `/index.md`, `/request-a-quote.md` 404. |
| 3 | No `potentialAction` quote action | Open (low value) | Not re-parsed this round; no change in the deployed changes. Not a defect. |
| 4 | Honeypot silent success | Not verified | Would need a POST to /api/ (forbidden). |
| 5 | Seven identical "Read more" buttons on home | Open | Live home HTML: 7 x `<button class="ti-more" type="button" aria-expanded="false">Read more`, no review-specific name; only home carries them. |
| 6 | Empty corner `<th>` in commercial-cleaning table | Open | Crawl: `/services/commercial-cleaning/` is the only one of 94 pages with `<th></th>`. New janitorial table has named headers (Type of space / Usual frequency / Why). |
| 7 | Home form has aria-label but no visible heading | Not re-checked | Home form markup not re-inspected this round; minor. |
| 8 | No ai-catalog / WebMCP / llms-full / Markdown | Open (opportunity) | `/llms-full.txt`, `/.well-known/ai-catalog.json`, `agent-card.json`, `mcp.json`, `api-catalog`, `security.txt` all 404 text/html. |
| 9 | Documented no-CAPTCHA fallback (page and llms.txt) | Fixed (still present) | Quote page paragraph and llms.txt "## For assistants and agents" both intact; reply promise now qualified with office hours Mon-Fri 7am-6pm. |
| 10 | Web Bot Auth | Open (opportunity) | No change; draft. |
| N1 | Fallback sentence not real links | Fixed | Live quote page: `mailto:info@evergreencleaningservice.ca` and `tel:+14168034880` anchors in the intro; aria snapshot shows both as links. |
| N2 | CAPTCHA error does not point to fallback | Fixed in code, not observed live | `src/components/QuickQuoteForm.astro` (lines ~303-380) appends mailto/tel links to `[data-qq-summary]` when the token field is invalid or the 403 message appears; covered by `tests/captcha-fallback.test.ts`. I did not trigger the error live (would mean submitting the form), so not credited as seen on production. Shipped script is present on the live page (`MESSAGES.captcha` string in HTML). |
| N3 | llms.txt is a community convention | Info, unchanged | No confirmed consumer agent. |
| N4 | Content-Signal flagged "Unknown directive" by Lighthouse | Info, unchanged | robots.txt: `Content-Signal: search=yes, ai-input=yes, ai-train=yes` in `*` and the named group. |

## 3. New findings
1. Info: Quote form accessibility tree is clean for an agent. Runtime aria snapshot: form named "Tell us where to send it", each field has a computed name with `*` for required, Address as a named group, City is a combobox, service checkboxes grouped, alert region present, reCAPTCHA iframe titled "reCAPTCHA". No change needed.
2. Low: Required fields are marked with `*` in the label and `required` in markup, but the quote form's `novalidate` plus script validation means an agent relying on native validation gets no hint until submit. Recommendation: optional `aria-required="true"` on required inputs in `src/components/QuickQuoteForm.astro` (not verified whether already set; the visible label asterisk is in the accessible name).
3. Low: Form heading is an H2 inside the form while the page H1 is "Request a Quote"; fine structurally, no action.
4. No regressions from Phase A, the other contributor's janitorial page, the checklist post or OfferPage photo heroes in this area: new pages have skip link, main, one H1, labelled forms (sidebar form with reCAPTCHA) and named table headers.
5. Info/opportunity: llms.txt is accurate and in sync with the sitemap pages; adding a "last updated" line is optional.

## Access policy (declared in robots.txt; WAF behaviour not tested)
- Training (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended): allowed; `ai-train=yes`.
- Search (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot): allowed; `search=yes`.
- User-triggered (ChatGPT-User, Claude-User, Perplexity-User): named and allowed; `ai-input=yes`. Perplexity-User often ignores robots.txt, so this is intent, not a gate.

## Standards status (vendor-matrix check date 2026-09-23, now about 50 days old; not refreshed)
- WebMCP: draft; Chrome origin trial reportedly ending 2026-11-17 (secondary source); not implemented, optional.
- Content-Signal: Cloudflare CC0 policy, IETF individual draft expired 2026-04-04; draft/proposal.
- ai-catalog.json: proposal; absent.
- Web Bot Auth: IETF draft; not implemented.
- llms.txt: community convention; Google ignores it.
Absence of WebMCP, ai-catalog.json and Markdown is an opportunity, not a defect. No ranking, citation or traffic effect is promised.

## 4. Needs the client or an account owner
- Decide whether to move from reCAPTCHA v2 to Cloudflare Turnstile (code supports it; needs site key and secret and a Cloudflare account owner).
- Confirm info@evergreencleaningservice.ca and (416) 803-4880 are monitored in office hours so the documented fallback promise holds.
- Authorise `--ua-matrix` testing if WAF behaviour toward agent user agents should be checked.

## 5. Not verified
- Agent-UX heuristic and measured Lighthouse Agentic Browsing X/N.
- The live CAPTCHA error text with the appended fallback links (needs a form submit attempt).
- Honeypot behaviour; real submission.
- Home form markup and `potentialAction` JSON-LD (not re-inspected).
- Accessibility tree only rendered for the quote and janitorial pages; the rest are static-HTML heuristics.

Score: 77/100
Previous: 72/100 (first audit)

Agent readiness, auditor judgement. Not a Lighthouse number and not the plugin's Agent-UX heuristic. Re-audit 2026-11-06 evening. Target https://www.evergreencleaningservice.ca/

## Method and limits
- The claude-seo plugin scripts were not run (proxy guard, per BRIEF). Agent-UX 0-100 heuristic: unavailable. Lighthouse Agentic Browsing X/N: not measured (local Lighthouse is 12.8.2, no agentic category; PSI not used).
- Estimated fraction, unchanged logic from the first audit (Lighthouse 13.5.0 category definition applied by hand, unconfirmed): 3/3 counted audits on mobile (`agent-accessibility-tree`, `cumulative-layout-shift`, `llms-txt`); `ard-schema`, `webmcp-*` N/A or informative. Desktop not computed. `llms-txt` re-checked live: `/llms.txt` 200, `text/plain; charset=utf-8`, 5,164 bytes (was 3,963), H1 `# Evergreen Office Cleaning`.
- Live curl checks today on `/`, `/request-a-quote/`, `/services/commercial-cleaning/`, `/llms.txt`, `/robots.txt` and the well-known paths. One probe: an empty-body `POST /api/submit-lead` returned `403 {"error":"captcha failed"}` (no lead created).

## 2. Status of first-audit findings

| # | First-audit finding | Status | Evidence |
|---|---|---|---|
| 1 | reCAPTCHA v2 blocks agent-completed quote requests (P0) | Partly fixed | Widget unchanged (`g-recaptcha` on `/request-a-quote/`, `g-recaptcha-hidden` present, endpoint answers 403 "captcha failed" without a token). A no-CAPTCHA path is now documented (see row 9), which is the audit's option (c). The in-form path is still blocked for agents; Turnstile not adopted. |
| 2 | No machine-readable quote page / Markdown | Open (opportunity only) | `Accept: text/markdown` on `/` returns `200 text/html`; `/index.md`, `/request-a-quote.md`, `/request-a-quote/index.md` 404. |
| 3 | No `potentialAction` / quote action in structured data | Open (low value) | `/request-a-quote/` JSON-LD: no `potentialAction`, no `ServiceChannel`; only a ContactPoint-type node. Not a defect. |
| 4 | Honeypot silent success | Not verified | Honeypot `company-website` still present (`tabindex="-1" autocomplete="off"`). Worker response to a honeypot hit not tested (would hit the live endpoint). |
| 5 | Seven identical "Read more" buttons (home) | Open | Home HTML: `<button class="ti-more" type="button" aria-expanded="false">Read more</button>`, 13 `ti-more` occurrences, still no review-specific name. |
| 6 | Empty corner `<th>` in commercial-cleaning table | Open | `/services/commercial-cleaning/` table header row still `<th></th><th>What it covers</th><th>How it is booked</th>`. |
| 7 | Home form has aria-label but no visible heading | Open | `#home-quote` still `aria-label="Request a quote"`; quote page form uses `aria-labelledby="quote-heading"`. Minor. |
| 8 | No ai-catalog / WebMCP / llms-full / Markdown (P3) | Open (opportunity only) | `/llms-full.txt`, `/.well-known/ai-catalog.json`, `agent-card.json`, `mcp.json`, `api-catalog`, `security.txt` all real 404 (text/html). No `modelContext`/`toolname` on the quote page. |
| 9 | Quick win: documented no-CAPTCHA fallback on quote page and in llms.txt | Fixed | Quote page: "Prefer not to use the form? Email the same details to info@evergreencleaningservice.ca or call (416) 803-4880 and we reply the same way." `/llms.txt` has a new "## For assistants and agents" section naming required details, the reCAPTCHA, the email and phone path, the 2-hour reply, and "Not offered: residential". |
| 10 | Web Bot Auth not implemented (P3) | Open (opportunity only) | No change; draft, not needed. |
| - | Landmarks, skip link, nav labels, heading order, form labels, autocomplete, error wiring, `role=alert` summary | Fixed/unchanged (still good) | Quote page: 18 labels for 18 inputs, `<nav aria-label="Primary">` and `aria-label="Breadcrumb"`, form `aria-labelledby`. Full 92-document scan not repeated; spot-checked only. |
| - | robots.txt policy and Content-Signal | Fixed/unchanged | `User-agent: *` and the named group (Googlebot ... Applebot-Extended) each carry `Content-Signal: search=yes, ai-input=yes, ai-train=yes` and `Allow: /`. Comments in the file now explain the placement. |

## 3. New findings

1. Info/Low: the fallback is not marked up for tools. It is plain text only (a `mailto:`/`tel:` link was not confirmed in the fallback sentence). Recommendation: make the sentence's email and phone real `mailto:` and `tel:` links in the quote page template (`src/pages/request-a-quote.astro` or its form component) so an agent can follow them without parsing prose. Not verified whether they are already links.
2. Low: the fallback sentence sits above the form but the in-form CAPTCHA error ("Please confirm you are not a robot.") does not point to it. Recommendation: add the email/phone alternative to the `data-qq-summary` error message in the quick-quote component so an agent that hits the blocker is told the fallback at the moment it fails.
3. Info: `/llms.txt` states the CAPTCHA and fallback accurately, but it is a community convention with no confirmed consumer agent; credit is for clarity, not for a proven effect.
4. Info: Lighthouse 12.8.2 still flags the Content-Signal line as "Unknown directive" in SEO (carried over, informational only).

No regressions found from the fixes in this area.

## Access policy (declared in robots.txt; WAF behaviour not tested)
- Training (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended): allowed; `ai-train=yes`.
- Search (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot): allowed; `search=yes`.
- User-triggered (ChatGPT-User, Claude-User, Perplexity-User): named and allowed; `ai-input=yes`. Perplexity-User generally ignores robots.txt, so this is intent, not a gate.

## Standards status (vendor-matrix check date 2026-09-23, now 44 days old; draft/proposal labels)
- WebMCP: draft; Chrome origin trial, end date 2026-11-17 reported by a secondary source (11 days away). Not implemented here; optional.
- Content-Signal: Cloudflare CC0 policy, IETF individual draft expired 2026-04-04; draft/proposal.
- ai-catalog.json (ARD): proposal; not present.
- Web Bot Auth: IETF draft `draft-ietf-webbotauth-httpsig-protocol-00`; not implemented.
- llms.txt: community convention; Google ignores it.
Absence of WebMCP, ai-catalog.json and Markdown is an opportunity, not a defect. No ranking, citation or traffic effect is promised.

## 4. Needs the client or an account owner
- Decide whether to switch the form from reCAPTCHA v2 to Cloudflare Turnstile (code already supports it; needs a Turnstile site key and secret in the Worker config, and a Cloudflare account owner).
- Confirm that info@evergreencleaningservice.ca and (416) 803-4880 are monitored so the documented 2-hour fallback promise holds for agent-originated requests.
- Authorise `--ua-matrix` testing if WAF behaviour toward agent user agents should be checked.

## 5. Not verified
- Agent-UX heuristic and measured Lighthouse Agentic Browsing X/N (both form factors).
- Runtime DOM after JavaScript, reCAPTCHA lazy-load behaviour, and a real form submission.
- Honeypot response behaviour.
- Whether the fallback email/phone are `mailto:`/`tel:` links.
- Full 92-document rescan of landmarks, nav labels and headings (new location pages and checklist guide only covered by the first audit's logic, not rescanned).
- Rows marked "unchanged" rely on spot checks of the quote page, home and commercial-cleaning only.

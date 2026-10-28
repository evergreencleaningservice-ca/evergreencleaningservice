# Agent-readiness audit: evergreencleaningservice.ca vs jan-pro.com (2026-10-28)

Question: can an AI agent acting for a facility manager understand the site, find services and service areas, and complete a quote request?

## Method and limits
- The claude-seo scripts (agentic_check.py, render_page.py, agent_ux_check.py) fail in this sandbox because they refuse the local HTTP proxy. The PSI path (lighthouse_agentic.py) returned HTTP 429 (daily quota) for mobile and desktop.
- Reproduced instead with: local Lighthouse 13.5.0 (npm, Chromium 153, `--only-categories=agentic-browsing`, mobile and desktop), Playwright 1.63 (CDP Accessibility.getFullAXTree, ariaSnapshot, DOM inspection), and curl.
- Form tests: filled with fake values ("Test Agent", test-agent@example.invalid, 416-555-0100). Nothing was submitted. Submission endpoints were route-aborted as a safety net (0 Evergreen POSTs observed). The captcha was not clicked or solved.
- The `--ua-matrix` agent user-agent test was NOT run (not authorized). Cloudflare WAF behaviour toward AI bots was not tested.
- Scripts: scratchpad/agentic-scripts/{ax,evform,jpform,jpform2,jpform3}.cjs. Raw output: scratchpad/agentic-raw/ and scratchpad/lhx/.

## 1. Lighthouse Agentic Browsing fraction (Lighthouse 13.5.0, local run, not PSI)
| Page | Form factor | Result | Counted audits |
|---|---|---|---|
| Evergreen / | mobile, desktop | **2/2** | agent-accessibility-tree PASS, cumulative-layout-shift PASS (0 / 0.001) |
| Evergreen /request-a-quote/ | mobile, desktop | **2/2** | tree PASS, CLS PASS (0.02 / 0) |
| Jan-Pro / | mobile, desktop | **1/2** | tree FAIL, CLS PASS |
| Jan-Pro /how-we-quote/ | mobile, desktop | **1/2** | tree FAIL, CLS PASS |

Per-audit status (same on every run): webmcp-form-coverage informative ("1 form missing annotations" Evergreen; 3 forms home / 2 forms quote page for Jan-Pro); webmcp-registered-tools informative (no tools); webmcp-schema-validity N/A; llms-txt N/A (404); ard-schema N/A (no catalog).
Paths that would add a counted audit for either site: a valid /llms.txt (+1, N=3); imperative WebMCP tools (+1 schema validity); every form annotated with toolname/tooldescription (+1 form coverage); a valid ai-catalog.json (+1). Higher N is not a better site.

Jan-Pro tree failures: (a) `input#jp_zip_search` (ZIP-search spinbutton on /) has no label ("Form elements must have labels"); (b) `a.footer-logo` (footer logo link on / and /how-we-quote/) has no discernible text.

## 2. Agent-critical checks passed over checks run (my own list, not a Lighthouse figure)
**Evergreen: 12/13. Jan-Pro: 5/11 (2 not run).**

| # | Check | Evergreen | Jan-Pro |
|---|---|---|---|
| 1 | Content in server-rendered HTML (no JS needed) | PASS (Astro, 10k chars home, 9.9k office page) | PASS |
| 2 | robots.txt allows agent access | PASS (`User-agent: *` / `Allow: /`, sitemap-index) | PASS (only /wp-admin/ disallowed, Crawl-delay 10) |
| 3 | Landmarks header/nav/main/footer | PASS (nav labelled Primary, Breadcrumb; skip link; form named) | PASS but 3 unlabelled `<nav>`, no skip link |
| 4 | Heading hierarchy | PASS (one h1, no skipped levels on 4 pages; footer headings are h2 and the home h3 "WE ARE ACCEPTING NEW CLEANING CLIENTS." is odd) | FAIL on /how-we-quote/: h1 jumps to h3, no h2 |
| 5 | Link and button names | PASS (0 unnamed interactive of 98/75/58/25 in the AX tree; 3 image-only blog-card links on / are aria-hidden + tabindex=-1, so not exposed) | FAIL (footer logo link; 4 social icon links unnamed in the CDP tree; unlabelled ZIP input) |
| 6 | Form labels and autocomplete | PASS (label for=, fieldset/legend, autocomplete name, organization, address-line1, address-level2, address-level1, postal-code, email, tel) | PARTIAL (labels fine; no autocomplete tokens on person fields) = not passed |
| 7 | Required-field indication | PASS (asterisk in label + native `required`; no aria-required; address sub-fields marked only via legend "Address *") | PASS (asterisk + aria-required="true") |
| 8 | Error messaging via aria-live | PASS by code read (`div[role=alert][aria-live=assertive]` summary, per-field `aria-describedby` error `<p>`, `aria-invalid`, focus moved to summary). Not exercised live (no submit). | NOT RUN (Gravity Forms validation needs a submit) |
| 9 | Quote form visible and fillable without hidden gating | PASS (form on /request-a-quote/, sidebar on service pages, /lp/office-cleaning/) | FAIL: `#gform_wrapper_30` is `display:none` on load on / and /how-we-quote/; it appears only after a scroll or interaction event (delayed JS). The page text says "fill out the form below" with nothing there |
| 10 | Captcha passable by an agent | FAIL (reCAPTCHA v2 checkbox, see section 4) | FAIL / unverified (Cloudflare Turnstile; headless run rendered an empty div, no iframe, empty `cf-turnstile-response_30` token) |
| 11 | Form fillable up to the captcha | PASS (all 8 text fields, a service checkbox and the comments box filled by accessible name) | PASS (7 fields filled; "Business Name" only appears after choosing "Having my business cleaned") |
| 12 | Thank-you flow machine-readable | PASS by code read (form replaced by `div.qq-confirm[role=status][tabindex=-1]`, focused: "Thank you - we have your request. An account executive will reply as soon as possible...") | NOT RUN |
| 13 | Quote-intent structured data | PASS, partial (see section 5) | FAIL (Organization/WebSite/WebPage/VideoObject only on /; no JSON-LD at all on /how-we-quote/) |

Not counted (opportunities, not defects): llms.txt, ai-catalog.json, WebMCP, Markdown delivery (all absent on both).

## 3. Accessibility-tree issues (element names and pages)
Evergreen (/ , /services/office-cleaning/, /request-a-quote/, /lp/office-cleaning/):
- 0 unnamed interactive elements in the CDP AX tree on all four pages. Lighthouse tree audit passes.
- Low: the quote form's required marking is the literal "*" in the accessible name ("Name *", "Email *"); no `aria-required`. City, Province, Postal code and Street address are required but their names carry no "required" cue (only the group legend "Address *").
- Low: duplicate CTA names "Get a quote" / "Request a quote" (header, hero, footer) all go to /request-a-quote/. Same target, so low risk. "Blog" links to two URLs (/insights/ and /category/blog/) on /.
- Low: the service checkbox list (Office, Commercial, Property Management and Building Maintenance, Janitorial, Commercial Carpet, Floor Services / Finishing, Reno Construction Clean-up, Other) does not match the site's service names (Industrial & Warehouse and Post-Construction have no matching box). An agent must guess a mapping.
- /lp/office-cleaning/ is `noindex, nofollow`, has no nav and no skip link (intended focus page); one h1, form named by heading.
- Honeypot `input[name=company-website]` and `g-recaptcha-hidden` are `aria-hidden` and tabindex -1, so they are not in the tree. Risk: a DOM-reading agent that fills every input would hit the honeypot and the code then fakes a success message (`onHoneypot` = onSuccess), so the lead is silently dropped.
Jan-Pro (/ and /how-we-quote/):
- `input#jp_zip_search` (spinbutton, no name) on /; `a.footer-logo` (no name) on both pages; Facebook/Twitter/YouTube/Instagram icon links unnamed in the CDP tree (Lighthouse flagged only the footer logo).
- Three `<nav>` with no labels; no skip link; /how-we-quote/ has h1 then h3 (no h2).
- Many same-name links with two URL forms (absolute and relative), minor. "Click Here" link text on /.
- The "I am looking for" chooser is two cards, each an h2 "I am looking for" followed by an h3 ("Commercial Cleaning Services", "Franchising Opportunities") and a link ("Request Free Estimate" -> `/#schedule`, "Get Started Today" -> /franchising/). The repeated h2 text gives no distinction. The estimate CTA points to an anchor on the homepage, not to the /how-we-quote/ page.
- The quote form (select "I am interested in...": franchise or business cleaned) mixes franchise-seeker and customer intent in one form; the SMS opt-in checkbox is unticked by default (good).

## 4. Agent quote-flow walkthrough
Evergreen, /request-a-quote/ (task: request an office-cleaning quote for a Toronto building)
1. Home: h1 "Office & Commercial Cleaning in Toronto and the GTA", `link "Get a free quote"` and `link "Call (416) 803-4880"` are in the first screen. Services are links in a "What we clean" region; "Where we work" has h3 Toronto / Peel & Halton / York Region / Durham. Findable in one step.
2. /request-a-quote/ (h1 "Request a Quote"): form "Tell us where to send it". 19 elements (8 required text fields incl. full street address, 8 service checkboxes, comments, 2 aria-hidden anti-spam fields). No facility size, type or frequency fields; free text only. Hours (Mon-Fri 7am-10pm, weekends 8am-8pm) and a phone link are in the sidebar as a fallback.
3. Captcha BEFORE focus: nothing. The `.g-recaptcha` slot is an empty 472x0 div, `grecaptcha` is undefined, the AX tree shows only `alert` (empty) and `button "Get my free quote"`. The hidden required input already carries the validity message "Please confirm you are not a robot."
4. Captcha AFTER focus/typing/pointerdown or scrolling near it: api.js loads (9 recaptcha requests). Three iframes are added: `iframe[title="reCAPTCHA"]` (304x78, anchor, contains `checkbox "I'm not a robot"`), a blank one, and `iframe[title="recaptcha challenge expires in two minutes"]` (bframe). In the page-level CDP tree the widget is just an "IframePresentational: reCAPTCHA" node, so an agent that cannot descend into the cross-origin frame cannot tick it, and a risk-based image challenge may follow.
5. Fill: every field was filled by accessible name with no trouble. After fill, the only invalid control was `g-recaptcha-hidden`. STOP: captcha unsolved by design, not submitted.
6. Submit: it POSTs JSON to `/api/submit-lead` with the captcha token (waits up to 6 s for the token). Errors: 403 -> "That security check did not verify. Please try submitting again."; other -> "...Please call (416) 803-4880". Success replaces the form with a focused `role=status` message. No URL change and no reference number. A separate /thank-you/ page exists (`noindex`) and says "within 2 hours", which conflicts with "as soon as possible" in the in-page message; the two are not linked.
Verdict: an agent can understand the services and areas and fill the form, but it cannot finish without a human for the reCAPTCHA. Fallback paths (tel:, mailto:info@..., stated hours) are good.

Jan-Pro, / and /how-we-quote/
1. Home chooser leads to `/#schedule` (home form) or franchising; /how-we-quote/ explains "Custom quotes are provided based on a site visit and assessment" (thin text, about 1.1k chars) and says "fill out the form below".
2. The form wrapper is `display:none` until a scroll/interaction event fires; an agent that only reads the initial DOM or tree sees no form and no fields. After a scroll it shows 9 fields (First/Last name, Email, Phone, ZIP, "I am interested in...", Business Name after choosing "Having my business cleaned", SMS opt-in).
3. Turnstile (sitekey 0x4AAAAAAA1-PIErm_p7M6cw) rendered as an empty div; no iframe and no token in my headless run, so the outcome for a real agent browser is unknown (Turnstile may be non-interactive). Not submitted.
4. Service area is by ZIP search (`/locations/`, franchise-based); the ZIP input is unlabelled. The page is US-first, with "California Residents" notices; Canada runs on jan-pro.ca (not audited here).
Verdict: fewer fields, but the hidden-until-scroll form and weaker semantics are bigger agent blockers than Evergreen's captcha. Turnstile may pass silently, which would favour Jan-Pro at the final step (unverified).

## 5. Structured data for quote intent (Evergreen)
Present on every page: CleaningService (name, address, geo, telephone, email, priceRange, openingHoursSpecification 7-day, areaServed = 10 City objects, sameAs, hasOfferCatalog) and WebSite with SearchAction (/search/?q= returns 200). Service + BreadcrumbList + FAQPage on /services/office-cleaning/; FAQPage on /lp/office-cleaning/.
Gaps for the quote task: Service has no `hasOfferCatalog`/`offers` or `availableChannel` (ServiceChannel with serviceUrl = /request-a-quote/, servicePhone, serviceType); no `potentialAction` pointing to the quote form; areaServed lists 10 cities but the site pages and form datalist also use Etobicoke, Scarborough, North York, Peel/Halton/York/Durham regions (inconsistent granularity); the sidebar says "reply as soon as possible" while /thank-you/ says 2 hours (no machine-readable response-time claim). Jan-Pro has none of Service/areaServed/hours on the audited pages.

## 6. Discovery files
| Resource | Evergreen | Jan-Pro |
|---|---|---|
| /robots.txt | 200; `User-agent: *` `Allow: /`; Sitemap sitemap-index.xml; no Content-Signal; no AI-specific groups | 200; `User-agent: *` `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php`, `Crawl-delay: 10`; Sitemap sitemap_index.xml; no Content-Signal; no AI-specific groups |
| X-Robots-Tag header | none | none (meta robots `index, follow, max-snippet:-1` instead) |
| /llms.txt, /llms-full.txt | 404 | 404 |
| /ai-catalog.json, /.well-known/ai-catalog.json | 404 | 404 |
| /.well-known/ai-plugin.json, agent.json, agent-card.json, mcp.json, mcp/server-card.json, http-message-signatures-directory | all 404 | all 404 |
| Markdown (Accept: text/markdown; /index.md; .md paths) | returns text/html; .md 404 | returns text/html; .md 404 |
| WebMCP (navigator.modelContext, toolname/tooldescription, script strings) | none | none |
| Link headers / link rel to agent resources | none (RSS only) | WP REST API (`rel=https://api.w.org/`, JSON alternate) only |
| Sitemap | sitemap-index.xml 200 (sitemap.xml 301 to it) | sitemap_index.xml 200 |

## 7. Access policy (from robots.txt only)
- Training agents (GPTBot, ClaudeBot, Google-Extended, CCBot...): not restricted by either site (no per-bot group). Evergreen allows all; Jan-Pro blocks /wp-admin/ only.
- Search agents (OAI-SearchBot, Claude-SearchBot, PerplexityBot): not restricted by either site.
- User-triggered agents (ChatGPT-User, Claude-User, Perplexity-User, Google-Agent): not restricted; note several of these ignore robots.txt anyway. Whether Cloudflare bot rules block any of them is NOT TESTED (no UA matrix authorization).
- No Content-Signal on either site (Content-Signal is a Cloudflare CC0 policy; the IETF draft expired 2026-04-04). Not a defect.

## 8. Standards-status notes (dated; vendor-matrix last full check 2026-09-23, report date 2026-10-28)
- WebMCP: draft; Chrome origin trial M149 to M156, no ship milestone; ChatGPT desktop calls imperative tools only; no public evidence of Claude or Gemini consuming it. Absence is an opportunity.
- Content-Signal: Cloudflare policy; IETF individual draft expired 2026-04-04; Google's robots.txt spec does not list the field.
- ai-catalog.json / ARD: open spec (agenticresourcediscovery.org); Lighthouse validates it when present.
- Web Bot Auth: `draft-ietf-webbotauth-httpsig-protocol-00` (2026-09-01). Not run.
- Lighthouse Agentic Browsing is labelled "under development". 13.5.0 used here (the vendor matrix lists 13.5.0 as current at 2026-09-23; npm showed 13.6.0 on 2026-10-28, which was not used).
- No ranking, citation or traffic effects are implied by any of the above.

## 9. Findings by priority
P0: none.
P1 (Evergreen)
- reCAPTCHA v2 checkbox is the one hard stop for an agent completing the quote; it appears only after form intent (focus/pointerdown/input/scroll) and sits in a cross-origin iframe. Fix: keep the phone/mailto fallback prominent and add machine-readable fallback (below); consider invisible/score-based protection (reCAPTCHA v3, Turnstile managed) for the hot path. Offer a "request a callback" alternative without a captcha only if spam controls allow.
P1 (Jan-Pro, for comparison): quote form is `display:none` until a scroll/interaction event; render it on load.
P2 (Evergreen)
- Align the form's service checkboxes with site service names (add Industrial & Warehouse; rename "Reno Construction Clean-up" to Post-Construction) and add optional facility type, size (sq ft) and frequency fields so an agent can pass the facts a facility manager has.
- Add `aria-required="true"` (and required cues on City/Province/Postal sub-labels), so required state is explicit beyond the "*" in the name.
- Enrich schema for the quote intent: `Service.hasOfferCatalog` or `offers`, `availableChannel` (ServiceChannel -> /request-a-quote/ + phone), a `potentialAction` for the quote, consistent areaServed (include Etobicoke, Scarborough, North York).
- Reconcile the response-time wording ("as soon as possible" vs "within 2 hours"); add a `role=status` message that includes a reference or next step and the stated SLA.
P3 (Evergreen)
- Honeypot behaviour: `onHoneypot` fakes success for any filled trap field; an agent filling every DOM input loses the lead silently. Keep the fields aria-hidden (done) and consider returning a neutral message that advises phoning.
- Optional: /llms.txt (+1 counted Lighthouse audit, no search-ranking claim), WebMCP declarative annotation of the quote form only if fully annotated (an incomplete annotation makes `webmcp-schema-validity` count and score 0.5), ai-catalog.json only if a real catalog exists, Markdown delivery.
- Minor heading oddities (home h3 "WE ARE ACCEPTING NEW CLEANING CLIENTS."; footer headings as h2).
Jan-Pro issues are listed in sections 2 and 3 for comparison only.

## 10. Scores
- Lighthouse Agentic Browsing: Evergreen **2/2**, Jan-Pro **1/2** (13.5.0, mobile and desktop, local run, PSI 429).
- Agent-critical checks: Evergreen **12/13**, Jan-Pro **5/11** (2 not run).
- Agent-UX heuristic (0-100, separate from the Lighthouse fraction; status: PARTIAL because the bundled agent_ux_check.py could not run and this is a manual reproduction): **Evergreen 82**, **Jan-Pro 48**.
  - Evergreen reasoning: starts at 100; -10 reCAPTCHA v2 behind an iframe (hard stop for agents); -3 service-checkbox mismatch; -3 no facility size/type/frequency fields; -2 schema lacks offer/ServiceChannel/potentialAction; -2 required state only via "*"; headline-time wording inconsistency (-1); honeypot silent-success risk (-1); no machine-readable discovery files (WebMCP, llms.txt, catalog) are not penalised.
  - Jan-Pro reasoning: -20 quote form hidden until scroll; -10 failed tree audit (unlabelled ZIP input, unnamed logo/social links); -8 captcha unverified/empty widget; -6 no structured data on the quote path; -4 heading skip and unlabelled navs; -4 mixed franchise/customer intent and unlabelled chooser headings.

## 11. Not run
Agent user-agent matrix (not authorized); Web Bot Auth; live validation-error rendering and live thank-you flow (would need a submit); Jan-Pro thank-you flow and error messaging; solving or clicking either captcha; Jan-Pro /locations/ and jan-pro.ca Canadian pages; Cloudflare bot-rule behaviour for AI user agents; PSI-hosted Lighthouse run (quota).

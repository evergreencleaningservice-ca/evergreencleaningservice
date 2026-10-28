# Evergreen Office Cleaning — SEO audit and Jan-Pro comparison (28 Oct 2026)

Prepared by 10XiD. Report for Paolo: https://claude.ai/artifact/Lp4u4E4Q95dmH6mR5WEtpN (exported here as `Jan-Pro-vs-Evergreen-Report-2026-10-28.pdf` / `.md`, final revision of 28 Oct 2026)

## Start here

| File | What it is |
|---|---|
| `FULL-AUDIT-REPORT.md` | Scored full-site audit (claude-seo `seo-audit`), every finding with evidence URL and severity |
| `ACTION-PLAN.md` | Prioritised fixes: Critical > High > Medium > Low, with owner, effort and proof metric; four phases |
| `audit-data.json` | Structured envelope the PDF generator reads |
| `SEO-Audit-Report-2026-10-28.pdf` | 26-page A4 report produced by the plugin's `google_report.py` (SEO Health Score 66/100) |
| `SEO-PLAN.md` | 12-month strategy and roadmap (`seo-plan`) |
| `PROGRAMMATIC-PLAN.md` | Verdict and quality gate for city / service × city pages (`seo-programmatic`) |
| `FLOW-ANALYSIS.md` | Find → Leverage → Optimize → Win evidence loop (`seo-flow`) |

## Specialist findings (`findings/`)

| File | Score | Lens |
|---|---|---|
| `technical.md` | 84 | Crawl of 111 URLs, headers, redirects, indexability |
| `performance.md` | 80 (lab, judgement) | Throttled Playwright timings; PSI/CrUX blocked |
| `schema.md` | 74 | JSON-LD per template, validation, ready-to-paste blocks |
| `visual.md` | 72 | 60 screenshots, mobile measurements, tap targets |
| `sitemap.md` | 70 | XML validity, inclusion, location-page uniqueness |
| `images.md` | 61 | 132-row inventory, alt rewrite list, savings estimate |
| `geo.md` | 60 | AI crawler access, citability, brand entity |
| `sxo.md` | 58 | SERP page types, persona scorecards, cannibalisation |
| `local.md` | 46 | GBP snapshot, NAP table, Jan-Pro GTA review counts |
| `content.md` + `content.json` | 43 | Per-page table for 73 URLs, E-E-A-T, blog plan |
| `backlinks.md` | ~12 (confidence 0.5) | Common Crawl ranks, domain age, redirect checks |
| `agentic.md` | 12/13 checks | Lighthouse agentic audits, accessibility tree, quote flow |
| `page-home.md`, `page-office-cleaning.md` | 78, 80 | Single-page deep dives vs the Jan-Pro counterparts |
| `clusters.md` | — | 42 keywords, SERP-overlap clusters, hub-and-spoke, link matrix |
| `hreflang.md` | — | French: not now; implementation if later |
| `image-plan.md` | — | OG / hero image briefs and photoshoot shot list |

## Content and competitor deliverables

- `briefs/` — six content briefs (janitorial, floor stripping & waxing, warehouses/logistics, day porter, office cleaning improve, medical/dental improve) with `README.md`
- `competitor-pages/` — `COMPARISON-PAGE.md`, `KEYWORD-STRATEGY.md`, `RECOMMENDATIONS.md`, `comparison-schema.json`
- `drift/` — SEO drift baseline of 78 pages + 58 redirect probes (`baseline-2026-10-28.json`) and the diff procedure (`README.md`)
- `screenshots/` — 12 of the 60 captures (above-the-fold views; the full set stayed with the agency)

## Raw evidence

The fetched HTML, headers, Lighthouse JSON, SERP captures and downloaded images (about 230 MB) stayed in the agency's working folder and are not in this repository. Nothing else in the repository was changed by the audit.

## Limits

- The claude-seo plugin's own fetchers refuse this environment's local proxy, so curl, Playwright and WebSearch were used instead.
- Search results came from a US-origin tool and are not personalised to Toronto; Maps were read in limited view.
- PageSpeed Insights returned 429 and CrUX 403; performance numbers are lab medians, not field data.
- No Moz, DataForSEO or Google API credentials: authority and rankings are proxies or "not measurable".
- Jan-Pro's own figures are recorded as shown, not verified.

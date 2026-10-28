# SEO drift baseline — evergreencleaningservice.ca

First "known good" snapshot of the SEO-critical elements of
https://www.evergreencleaningservice.ca, captured **2026-10-28** so that any
later change (deploy, CMS edit, Cloudflare rule change) can be diffed against it.

This is the claude-seo `seo-drift` skill's `baseline` step. The plugin's own
fetcher could not run in this environment (see *Why this was done by hand*), so
the capture was reproduced with `curl` + a small parser that mirrors the
plugin's `parse_html.py` / `drift_baseline.py`, and the result was written both
to the plugin's SQLite store and to a standalone JSON file.

## What was captured

**78 URLs, all HTTP 200, zero redirects on the requested URL:**

| Set | Count | Source |
|---|---|---|
| Sitemap URLs | 73 | `https://www.evergreencleaningservice.ca/sitemap-0.xml` (copy in `raw/sitemap-0.xml`) |
| Paid landing pages (noindex by design) | 4 | `/lp/office-cleaning/`, `/lp/commercial-cleaning/`, `/lp/commercial-cleaning-quote/`, `/lp/post-construction-cleaning/` |
| Form thank-you page (noindex by design) | 1 | `/thank-you/` |

Per page (`pages[]` in the JSON):

- `status_code`, `num_redirects`, `url_effective`
- `title`, `meta_description`, `canonical`, `robots` (meta), `x_robots_tag` (header), derived `indexable`
- `h1` (first) + `h1_all`, `h2[]`, `h3[]`
- `schema[]` (full JSON-LD, `@graph` flattened like the plugin does), `schema_types[]`,
  `schema_blocks[]` (type + SHA-256 per block), `schema_hash` (SHA-256 of the sorted array)
- `open_graph{}`, `twitter_card{}`, `hreflang[]`
- `links.internal_count`, `links.external_count`, `links.internal_unique[]`
- `images.count`, `images.missing_alt[]` (no `alt` attribute at all), `images.empty_alt[]` (`alt=""`, decorative), `images.alts[]`
- `word_count` (visible text, script/style/nav/header/footer stripped, same as the plugin)
- `headers{}`: content-type, cache-control, x-robots-tag, link, location, last-modified, etag, server, cf-cache-status, HSTS, x-frame-options, CSP, vary (only those present are recorded)
- `html_hash` (SHA-256 of the body), `html_bytes`
- `cwv: null` (Core Web Vitals not captured; needs the PageSpeed API key)

Site level (`redirects[]`): **58 redirect probes** — every rule in
`src/data/redirects.ts` (spec + legacy + news-page rules, both trailing-slash
spellings exactly as `bothSlashSpellings()` emits them), one `/blog/*` splat
sample, one `/author/*` sample, and the host-level redirects
(http→https, apex→www, `/services`→`/services/`, `/sitemap.xml`→`/sitemap-index.xml`).
Each records `status_code`, `location`, `expected_location`, `ok`.

### State on 2026-10-28 (the baseline facts)

- 73 indexable pages; exactly 5 `noindex, nofollow` pages (the 4 `/lp/` pages and `/thank-you/`).
- No `X-Robots-Tag` header on any production URL (the `_headers` file scopes noindex to `stage.` and `workers.dev` hosts only).
- Every page has a self-referencing canonical with trailing slash; no page lacks a canonical.
- Every page has exactly one H1.
- Every page carries JSON-LD. Type counts: `CleaningService` 78, `WebSite` 78, `BreadcrumbList` 55, `BlogPosting` 38, `Service` 18, `FAQPage` 16, `CollectionPage` 5.
- Open Graph present on the 73 indexable pages, absent on the 5 noindex pages (expected). No hreflang anywhere (single-language site).
- 304 images, 0 missing an `alt` attribute, 85 decorative `alt=""`.
- 57 of 58 redirect probes are 301 to the expected target; `/services` → `/services/` is a 307 (Cloudflare's trailing-slash normaliser, fine). The one `ok: false` is the slashless `/blog/*` splat sample (`/blog/green-clean-products` → `/green-clean-products` without the slash, which then 307s to the slashed page — a two-hop chain only for slashless wildcard sources, not a broken rule).
- Response headers: `server: cloudflare`, `cache-control: public, max-age=0, must-revalidate`, `cf-cache-status` HIT/MISS/DYNAMIC. No CSP / HSTS / X-Frame-Options headers on HTML.

## Where it lives

```
<this folder>/                               (scratchpad: .../evergreencleaningservice.ca-audit/drift/)
├── README.md                                this file
├── baseline-2026-10-28.json                 the full baseline (1.1 MB)
├── urls.txt                                 the 78 URLs in fetch order
├── fetch-index.tsv                          NNN  url  status  redirects  url_effective  bytes
├── redirect-rules.tsv  redirect-hosts.tsv   inputs for the redirect probes
├── redirect-probes.tsv                      from  expected  status  location
├── raw/sitemap-0.xml, raw/pages/NNN.{html,headers,meta}   the untrusted downloads
└── scripts/
    ├── refetch.sh                           re-fetch pages + probes (curl)
    ├── build_baseline.py                    raw/ -> baseline-<date>.json (+ SQLite rows)
    └── diff_baselines.py                    old.json vs new.json -> severity-ranked findings
```

Plugin storage (what `drift_compare.py` / `drift_history.py` read):

```
~/.cache/claude-seo/drift/baselines.db      table `baselines`, rows id 1..78, one per URL
```

Rows use the plugin's exact schema and URL normalisation (lower-case host, trailing
slash stripped, so the homepage is stored as `https://www.evergreencleaningservice.ca/`
and `/lp/office-cleaning/` as `.../lp/office-cleaning`). `drift_history.py` was
verified to read them. `cwv_json` is NULL, so the plugin's CWV rules (11, 12) are
skipped during a compare, as designed.

## Why this was done by hand

The plugin's fetch pipeline (`fetch_page.py` → `url_safety.py`) refuses to run
when the HTTP(S) proxy is a loopback address, and this environment routes all
egress through a proxy on `127.0.0.1`:

```
Fetch failed: Error: url_safety: Refusing configured HTTP proxy '127.0.0.1':
blocked hostname 127.0.0.1. Point the proxy environment variable at a publicly
routable address, or unset it.
```

The plugin was not modified. Fetching was done with
`curl -sL --max-time 30 -A "Mozilla/5.0 (compatible; seo-audit)"` through the
preconfigured proxy with TLS verification intact, and parsing with
`scripts/build_baseline.py` run as `python3 -I` from outside the download folder.

## How to re-run the diff

### Option A — plugin, on a machine without a loopback proxy

The SQLite rows are in the plugin's own format, so on a normal machine the skill
works as documented (copy `~/.cache/claude-seo/drift/baselines.db` there first):

```bash
PLUGIN="$HOME/.claude/plugins/synced/<id>/claude-seo"
"$PLUGIN/scripts/claude-seo" run drift_compare.py https://www.evergreencleaningservice.ca/ --skip-cwv
"$PLUGIN/scripts/claude-seo" run drift_history.py https://www.evergreencleaningservice.ca/
# loop it:
while read -r u; do "$PLUGIN/scripts/claude-seo" run drift_compare.py "$u" --skip-cwv; done < urls.txt
```

`drift_compare.py` is per-URL and applies the 17 rules in
`skills/seo-drift/references/comparison-rules.md`. It does not know about the
redirect probes or X-Robots-Tag headers; use Option B for those.

### Option B — manual procedure (works here, and anywhere with curl + python3 + bs4/lxml)

```bash
D=/tmp/claude-0/-home-user-evergreencleaningservice/8be70c01-c6c4-5c8a-8a38-3ab3f7538679/scratchpad/evergreencleaningservice.ca-audit/drift
TODAY=$(date +%F)

# 1. re-fetch all 78 pages + 58 redirect probes (about a minute)
bash "$D/scripts/refetch.sh" "$D"            # overwrites raw/, fetch-index.tsv, redirect-probes.tsv

# 2. build the new snapshot (JSON only; add rows to the plugin DB by dropping --no-db)
python3 -I "$D/scripts/build_baseline.py" "$D" "$TODAY" --no-db

# 3. diff against the 2026-10-28 baseline
python3 -I "$D/scripts/diff_baselines.py" "$D/baseline-2026-10-28.json" "$D/baseline-$TODAY.json" \
    --json "$D/diff-2026-10-28-to-$TODAY.json"
# exit code: 2 = CRITICAL findings, 1 = WARNING only, 0 = clean / INFO only
```

To check a single URL by eye instead:

```bash
curl -sL -A "Mozilla/5.0 (compatible; seo-audit)" https://www.evergreencleaningservice.ca/services/office-cleaning/ \
  | grep -oE '<title>[^<]*|<meta name="(robots|description)"[^>]*|<link rel="canonical"[^>]*|<h1[^>]*>[^<]*'
python3 -I -c 'import json,sys; b=json.load(open(sys.argv[1])); p=[p for p in b["pages"] if p["url"].endswith("/services/office-cleaning")][0]; print(json.dumps({k:p[k] for k in ("title","meta_description","canonical","robots","h1","schema_types")},indent=1))' "$D/baseline-2026-10-28.json"
```

If the site adds pages, append them to `urls.txt` (or regenerate it from
`sitemap-0.xml` plus the five noindex paths) before step 1; `diff_baselines.py`
reports new URLs as INFO and missing ones as CRITICAL.

## Drift checks that matter most for this site

In priority order. `diff_baselines.py` classifies each as shown.

1. **Noindex leaking onto production — CRITICAL.** The build is one Worker
   serving every hostname; noindex is applied by hostname in `public/_headers`
   (`stage.`, `*.workers.dev`) and by path only on the 4 `/lp/` pages and
   `/thank-you/`. Any of the 73 indexable URLs gaining `noindex` in
   `<meta name="robots">` *or* an `X-Robots-Tag` header means the staging rule
   matched production or a template flag flipped. Conversely, an `/lp/` page
   *losing* noindex puts paid-traffic duplicates of the service pages into the
   index (WARNING). Baseline: exactly 5 noindex URLs, no X-Robots-Tag anywhere.
2. **Canonical changes — CRITICAL.** Every page is self-canonical with a
   trailing slash. A canonical that disappears, loses the slash, points at the
   apex/`stage.` host, or points at another page re-routes ranking signals.
3. **Title / meta description changes — WARNING.** Titles were rewritten for
   this overhaul (e.g. homepage `Office & Commercial Cleaning in Toronto & GTA | Evergreen`);
   unplanned changes usually mean a template regression or a CMS edit on a
   live post. Title removed is CRITICAL.
4. **Schema loss — CRITICAL.** Every page carries `CleaningService` + `WebSite`;
   service pages add `Service` (+ `FAQPage` on 16), posts add `BlogPosting` +
   `BreadcrumbList`, listing pages add `CollectionPage`. A type dropping from a
   page, or a page losing JSON-LD entirely, is a rich-result and entity loss.
   Same types with a changed `schema_hash` is INFO (content edit, e.g. new review count).
5. **Redirect rule loss — CRITICAL.** The 301 map is generated into
   `dist/_redirects` from `src/data/redirects.ts` by `scripts/redirects.mjs`
   on every build; if the script is skipped or the file is dropped, every
   legacy WordPress URL in that map (26 exact-match rules, each probed in both
   trailing-slash spellings) 404s at once. Also covers
   http→https, apex→www and `/sitemap.xml`→`/sitemap-index.xml`.
6. **Status / redirect of a baselined page — CRITICAL/WARNING.** A sitemap URL
   returning 404/5xx or starting to redirect.
7. **H1 removed or changed beyond recognition — CRITICAL**; multiple H1s — WARNING.
8. **Open Graph removed — WARNING**; `content-type` change — WARNING.
9. **INFO**: schema content edits, hreflang appearing, word-count or internal-link
   count swings over 30%, new images without an `alt` attribute, HTML hash
   changes with no SEO element differing (expected on most deploys).

Also worth re-checking by hand after a deploy, outside this diff: `robots.txt`
still `Allow: /` with the sitemap line, and `/sitemap-0.xml` still lists 73 URLs
(the Worker injects admin-published posts into it, so the count can legitimately grow).

#!/usr/bin/env python3 -I
"""
Diff two baseline JSON files produced by build_baseline.py.

Applies the claude-seo drift rules that can be evaluated without CWV data, in
the same severity classes, plus the site-specific checks that matter for
evergreencleaningservice.ca (noindex leaking onto production pages, canonical
changes, schema type loss, redirect rule loss, X-Robots-Tag on production).

Usage:
    python3 -I diff_baselines.py <old baseline.json> <new baseline.json> [--json out.json]

Exit code: 2 if any CRITICAL finding, 1 if only WARNING, 0 if clean/INFO only.
"""

import argparse
import json
import sys
from difflib import SequenceMatcher


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def by_url(b):
    return {p["url"]: p for p in b["pages"]}


def noindex(p):
    return "noindex" in ((p.get("robots") or "") + " " + str(p.get("x_robots_tag") or "")).lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("old")
    ap.add_argument("new")
    ap.add_argument("--json", help="also write findings to this file")
    args = ap.parse_args()

    old, new = load(args.old), load(args.new)
    o, n = by_url(old), by_url(new)
    findings = []

    def add(sev, rule, url, detail, old_v=None, new_v=None):
        findings.append({"severity": sev, "rule": rule, "url": url, "detail": detail, "old": old_v, "new": new_v})

    for url, op in o.items():
        np_ = n.get(url)
        if np_ is None:
            add("CRITICAL", "page missing from new capture", url, "URL not present in new baseline")
            continue

        # Rule 8 / status
        if 200 <= op["status_code"] < 300 and not (200 <= np_["status_code"] < 300):
            add("CRITICAL", "R8 status changed to error", url, "", op["status_code"], np_["status_code"])
        elif op["status_code"] != np_["status_code"]:
            add("WARNING", "status code changed", url, "", op["status_code"], np_["status_code"])
        if np_.get("num_redirects", 0) and not op.get("num_redirects", 0):
            add("WARNING", "page now redirects", url, "", op.get("url_effective"), np_.get("url_effective"))

        # Rule 4 / noindex leak (the single most important check for this site)
        if not noindex(op) and noindex(np_):
            add("CRITICAL", "R4 noindex added", url, "robots/X-Robots-Tag now contains noindex",
                {"robots": op.get("robots"), "x_robots_tag": op.get("x_robots_tag")},
                {"robots": np_.get("robots"), "x_robots_tag": np_.get("x_robots_tag")})
        elif noindex(op) and not noindex(np_):
            add("WARNING", "noindex removed", url, "a deliberately hidden page (paid LP / thank-you) is now indexable",
                op.get("robots"), np_.get("robots"))
        elif (op.get("robots") or "") != (np_.get("robots") or ""):
            add("INFO", "robots directive changed", url, "", op.get("robots"), np_.get("robots"))

        # Rules 2 & 3 / canonical
        if op.get("canonical") and not np_.get("canonical"):
            add("CRITICAL", "R3 canonical removed", url, "", op["canonical"], None)
        elif op.get("canonical") and np_.get("canonical") and op["canonical"].rstrip("/") != np_["canonical"].rstrip("/"):
            add("CRITICAL", "R2 canonical changed", url, "", op["canonical"], np_["canonical"])

        # Rules 7 & 9 / title
        if op.get("title") and not np_.get("title"):
            add("CRITICAL", "R7 title removed", url, "", op["title"], None)
        elif (op.get("title") or "").strip() != (np_.get("title") or "").strip():
            add("WARNING", "R9 title changed", url, "", op.get("title"), np_.get("title"))

        # Rule 10 / meta description
        if (op.get("meta_description") or "").strip() != (np_.get("meta_description") or "").strip():
            sev = "WARNING" if np_.get("meta_description") else "CRITICAL"
            add(sev, "R10 meta description changed" if np_.get("meta_description") else "meta description removed",
                url, "", op.get("meta_description"), np_.get("meta_description"))

        # Rules 5 & 6 / H1
        if op.get("h1_all") and not np_.get("h1_all"):
            add("CRITICAL", "R5 H1 removed", url, "", op["h1_all"], [])
        elif op.get("h1") and np_.get("h1") and op["h1"] != np_["h1"]:
            ratio = SequenceMatcher(None, op["h1"], np_["h1"]).ratio()
            add("CRITICAL" if ratio < 0.5 else "INFO", "R6 H1 text changed", url,
                f"similarity {ratio:.2f}", op["h1"], np_["h1"])
        if len(np_.get("h1_all") or []) > 1 and len(op.get("h1_all") or []) <= 1:
            add("WARNING", "multiple H1s introduced", url, "", op.get("h1_all"), np_.get("h1_all"))

        # Rules 1, 13 / schema
        if op.get("schema") and not np_.get("schema"):
            add("CRITICAL", "R1 schema removed entirely", url, "", op.get("schema_types"), [])
        else:
            lost = sorted(set(op.get("schema_types") or []) - set(np_.get("schema_types") or []))
            gained = sorted(set(np_.get("schema_types") or []) - set(op.get("schema_types") or []))
            if lost:
                add("CRITICAL", "schema type lost", url, "", lost, np_.get("schema_types"))
            if gained:
                add("INFO", "schema type added", url, "", op.get("schema_types"), gained)
            if not lost and not gained and op.get("schema_hash") != np_.get("schema_hash"):
                add("INFO", "R13 schema content changed (same types)", url, "", op.get("schema_hash"), np_.get("schema_hash"))

        # Rule 14 / Open Graph
        if op.get("open_graph") and not np_.get("open_graph"):
            add("WARNING", "R14 Open Graph tags removed", url, "", sorted(op["open_graph"]), [])
        else:
            lost_og = sorted(set(op.get("open_graph") or {}) - set(np_.get("open_graph") or {}))
            if lost_og:
                add("WARNING", "Open Graph tag(s) removed", url, "", lost_og, None)

        # hreflang (none today; appearing or disappearing is worth a look)
        if bool(op.get("hreflang")) != bool(np_.get("hreflang")):
            add("INFO", "hreflang presence changed", url, "", op.get("hreflang"), np_.get("hreflang"))

        # headers of interest
        oh, nh = op.get("headers") or {}, np_.get("headers") or {}
        if nh.get("x-robots-tag") and not oh.get("x-robots-tag"):
            add("CRITICAL", "X-Robots-Tag header appeared on production host", url, "", None, nh["x-robots-tag"])
        if (oh.get("content-type") or "").split(";")[0] != (nh.get("content-type") or "").split(";")[0]:
            add("WARNING", "content-type changed", url, "", oh.get("content-type"), nh.get("content-type"))

        # content volume & links (INFO)
        ow, nw = op.get("word_count") or 0, np_.get("word_count") or 0
        if ow and abs(nw - ow) / ow > 0.30:
            add("INFO", "word count changed >30%", url, "", ow, nw)
        ol, nl = (op.get("links") or {}).get("internal_count", 0), (np_.get("links") or {}).get("internal_count", 0)
        if ol and abs(nl - ol) / ol > 0.30:
            add("INFO", "internal link count changed >30%", url, "", ol, nl)
        om = len((op.get("images") or {}).get("missing_alt") or [])
        nm = len((np_.get("images") or {}).get("missing_alt") or [])
        if nm > om:
            add("INFO", "images without alt attribute increased", url, "", om, nm)
        if op.get("html_hash") != np_.get("html_hash") and not any(f["url"] == url for f in findings):
            add("INFO", "R16 html changed (no SEO element differs)", url, "", op.get("html_hash", "")[:12], np_.get("html_hash", "")[:12])

    for url in sorted(set(n) - set(o)):
        add("INFO", "new page in capture", url, "URL not in old baseline")

    # redirect rule loss
    o_red = {r["from"]: r for r in old.get("redirects") or []}
    n_red = {r["from"]: r for r in new.get("redirects") or []}
    for frm, r in o_red.items():
        nr = n_red.get(frm)
        if nr is None:
            add("WARNING", "redirect probe missing", frm, "not probed in new capture")
            continue
        if r.get("ok") and not nr.get("ok"):
            add("CRITICAL", "redirect rule lost", frm,
                f"expected -> {r['expected_location']}", {"status": r["status_code"], "location": r["location"]},
                {"status": nr["status_code"], "location": nr["location"]})
        elif (r.get("status_code"), r.get("location")) != (nr.get("status_code"), nr.get("location")):
            add("INFO", "redirect behaviour changed", frm, "", {"status": r["status_code"], "location": r["location"]},
                {"status": nr["status_code"], "location": nr["location"]})

    # site-wide sanity: production noindex set must still be exactly the LP/thank-you set
    o_noindex = {u for u, p in o.items() if noindex(p)}
    n_noindex = {u for u, p in n.items() if noindex(p)}
    for u in sorted(n_noindex - o_noindex):
        if not any(f["url"] == u and f["rule"].startswith("R4") for f in findings):
            add("CRITICAL", "R4 noindex added", u, "")

    order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    findings.sort(key=lambda f: (order[f["severity"]], f["url"]))
    counts = {s: sum(1 for f in findings if f["severity"] == s) for s in order}

    report = {
        "old": {"file": args.old, "captured_at": old.get("captured_at"), "pages": len(o)},
        "new": {"file": args.new, "captured_at": new.get("captured_at"), "pages": len(n)},
        "counts": counts,
        "findings": findings,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

    sys.exit(2 if counts["CRITICAL"] else 1 if counts["WARNING"] else 0)


if __name__ == "__main__":
    main()

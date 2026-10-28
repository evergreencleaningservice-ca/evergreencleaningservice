#!/usr/bin/env python3 -I
"""
Build an SEO drift baseline from curl-fetched pages.

Reproduces what claude-seo's drift_baseline.py records (title, meta
description, canonical, robots, h1/h2/h3, JSON-LD schema, OG tags, html_hash,
schema_hash, status_code) with the same URL normalisation and the same SQLite
schema, plus extra fields the compare step benefits from (schema types with a
per-block hash, internal/external link counts, images and missing alts, word
count, hreflang, response headers of interest, redirect probes).

Usage (run from OUTSIDE the download folder, with -I):
    python3 -I build_baseline.py <drift_dir> <date> [--db <sqlite path>] [--no-db]

Inputs expected inside <drift_dir>:
    urls.txt                 one URL per line (fetch order)
    fetch-index.tsv          NNN<TAB>url<TAB>http_code<TAB>num_redirects<TAB>url_effective<TAB>size
    raw/pages/NNN.html       body as fetched by curl -sL
    raw/pages/NNN.headers    response headers as written by curl -D
    redirect-probes.tsv      from<TAB>expected<TAB>status<TAB>location (optional)

Outputs:
    <drift_dir>/baseline-<date>.json
    rows in the SQLite `baselines` table (default ~/.cache/claude-seo/drift/baselines.db)
"""

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

from bs4 import BeautifulSoup

UTM_PARAMS = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"}
HEADERS_OF_INTEREST = [
    "content-type",
    "cache-control",
    "x-robots-tag",
    "link",
    "location",
    "last-modified",
    "etag",
    "server",
    "cf-cache-status",
    "strict-transport-security",
    "x-frame-options",
    "content-security-policy",
    "vary",
]


# --- identical to drift_baseline.py ---------------------------------------
def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    hostname = (parsed.hostname or "").lower()
    port = parsed.port
    if (scheme == "http" and port == 80) or (scheme == "https" and port == 443):
        port = None
    netloc = hostname if not port else f"{hostname}:{port}"
    query_params = parse_qs(parsed.query, keep_blank_values=True)
    filtered = {k: v for k, v in sorted(query_params.items()) if k not in UTM_PARAMS}
    query = urlencode(filtered, doseq=True)
    path = parsed.path.rstrip("/") or "/"
    return urlunparse((scheme, netloc, path, "", query, ""))


def url_hash(url: str) -> str:
    return hashlib.sha256(normalize_url(url).encode()).hexdigest()[:16]


def hash_content(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def init_db(db_path: str) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS baselines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            url_hash TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            title TEXT,
            meta_description TEXT,
            canonical TEXT,
            robots TEXT,
            h1 TEXT,
            h2_json TEXT,
            h3_json TEXT,
            schema_json TEXT,
            og_json TEXT,
            cwv_json TEXT,
            html_hash TEXT,
            schema_hash TEXT,
            status_code INTEGER
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_url_hash ON baselines(url_hash)")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS comparisons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            url_hash TEXT NOT NULL,
            baseline_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            results_json TEXT NOT NULL,
            critical_count INTEGER DEFAULT 0,
            warning_count INTEGER DEFAULT 0,
            info_count INTEGER DEFAULT 0,
            FOREIGN KEY (baseline_id) REFERENCES baselines(id)
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_comp_url_hash ON comparisons(url_hash)")
    conn.commit()
    return conn


# --- mirrors parse_html.py --------------------------------------------------
def _has_rel_token(tag, token: str) -> bool:
    rel = tag.get("rel")
    if rel is None:
        return False
    if isinstance(rel, str):
        rel = rel.split()
    return token in [r.lower() for r in rel]


def parse_html(html: str, base_url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    result = {
        "title": None,
        "meta_description": None,
        "meta_robots": None,
        "canonical": None,
        "h1": [],
        "h2": [],
        "h3": [],
        "images": [],
        "links": {"internal": [], "external": []},
        "schema": [],
        "open_graph": {},
        "twitter_card": {},
        "word_count": 0,
        "hreflang": [],
    }

    title_tag = soup.find("title")
    if title_tag:
        result["title"] = title_tag.get_text(strip=True)

    for meta in soup.find_all("meta"):
        name = (meta.get("name") or "").lower()
        prop = (meta.get("property") or "").lower()
        content = meta.get("content") or ""
        if name == "description":
            result["meta_description"] = content
        elif name == "robots":
            result["meta_robots"] = content
        if prop.startswith("og:"):
            result["open_graph"][prop] = content
        if name.startswith("twitter:"):
            result["twitter_card"][name] = content

    canonical = next((l for l in soup.find_all("link") if _has_rel_token(l, "canonical")), None)
    if canonical:
        result["canonical"] = canonical.get("href")

    for link in soup.find_all("link"):
        if _has_rel_token(link, "alternate") and link.get("hreflang"):
            result["hreflang"].append({"lang": link.get("hreflang"), "href": link.get("href")})

    for tag in ("h1", "h2", "h3"):
        for heading in soup.find_all(tag):
            text = heading.get_text(strip=True)
            if text:
                result[tag].append(text)

    for img in soup.find_all("img"):
        src = img.get("src") or ""
        if src:
            src = urljoin(base_url, src)
        result["images"].append({"src": src, "alt": img.get("alt")})

    base_domain = urlparse(base_url).netloc
    for a in soup.find_all("a", href=True):
        href = a.get("href") or ""
        if not href or href.startswith("#") or href.startswith("javascript:"):
            continue
        full = urljoin(base_url, href)
        bucket = "internal" if urlparse(full).netloc == base_domain else "external"
        result["links"][bucket].append({"href": full, "text": a.get_text(strip=True)[:100]})

    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, dict) and "@graph" in data:
            result["schema"].extend(i for i in data["@graph"] if isinstance(i, dict))
        elif isinstance(data, list):
            result["schema"].extend(i for i in data if isinstance(i, dict))
        else:
            result["schema"].append(data)

    for el in soup(["script", "style", "nav", "footer", "header"]):
        el.decompose()
    text = soup.get_text(separator=" ", strip=True)
    result["word_count"] = len(re.findall(r"\b\w+\b", text))
    return result


def parse_headers(raw: str) -> dict:
    """curl -D through a CONNECT proxy writes two blocks; keep the last one."""
    blocks = [b for b in re.split(r"\r?\n\r?\n", raw.strip()) if b.strip()]
    last = blocks[-1] if blocks else ""
    out = {}
    for line in last.splitlines()[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            k = k.strip().lower()
            if k in HEADERS_OF_INTEREST:
                out.setdefault(k, []).append(v.strip())
    return {k: (v[0] if len(v) == 1 else v) for k, v in out.items()}


def schema_types(items):
    out = []
    for item in items:
        t = item.get("@type") if isinstance(item, dict) else None
        if isinstance(t, list):
            out.append("/".join(str(x) for x in t))
        else:
            out.append(str(t) if t else "(untyped)")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("drift_dir")
    ap.add_argument("date")
    ap.add_argument("--db", default=os.path.expanduser("~/.cache/claude-seo/drift/baselines.db"))
    ap.add_argument("--no-db", action="store_true")
    args = ap.parse_args()

    d = args.drift_dir
    now = datetime.now(timezone.utc).isoformat()

    index = {}
    with open(os.path.join(d, "fetch-index.tsv"), encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 6:
                index[parts[0]] = {
                    "url": parts[1],
                    "status_code": int(parts[2]),
                    "num_redirects": int(parts[3]),
                    "url_effective": parts[4],
                    "size": int(parts[5]),
                }

    pages = []
    for n in sorted(index):
        meta = index[n]
        url = meta["url"]
        html_path = os.path.join(d, "raw", "pages", f"{n}.html")
        hdr_path = os.path.join(d, "raw", "pages", f"{n}.headers")
        with open(html_path, encoding="utf-8", errors="replace") as f:
            html = f.read()
        with open(hdr_path, encoding="utf-8", errors="replace") as f:
            headers = parse_headers(f.read())

        p = parse_html(html, url)
        schema_sorted = json.dumps(p["schema"], sort_keys=True)
        schema_hash = hash_content(schema_sorted) if p["schema"] else None
        schema_blocks = [
            {"type": t, "hash": hash_content(json.dumps(item, sort_keys=True))}
            for t, item in zip(schema_types(p["schema"]), p["schema"])
        ]
        robots = p["meta_robots"]
        robots_l = (robots or "").lower()
        xrobots = str(headers.get("x-robots-tag") or "").lower()
        indexable = (
            meta["status_code"] == 200
            and "noindex" not in robots_l
            and "noindex" not in xrobots
            and (p["canonical"] is None or normalize_url(p["canonical"]) == normalize_url(url))
        )

        pages.append(
            {
                "url": normalize_url(url),
                "url_hash": url_hash(url),
                "requested_url": url,
                "url_effective": meta["url_effective"],
                "num_redirects": meta["num_redirects"],
                "timestamp": now,
                "status_code": meta["status_code"],
                "title": p["title"],
                "meta_description": p["meta_description"],
                "canonical": p["canonical"],
                "robots": robots,
                "x_robots_tag": headers.get("x-robots-tag"),
                "indexable": indexable,
                "h1": p["h1"][0] if p["h1"] else None,
                "h1_all": p["h1"],
                "h2": p["h2"],
                "h3": p["h3"],
                "schema_types": schema_types(p["schema"]),
                "schema_blocks": schema_blocks,
                "schema": p["schema"],
                "schema_hash": schema_hash,
                "open_graph": p["open_graph"],
                "twitter_card": p["twitter_card"],
                "hreflang": p["hreflang"],
                "links": {
                    "internal_count": len(p["links"]["internal"]),
                    "external_count": len(p["links"]["external"]),
                    "internal_unique": sorted({l["href"] for l in p["links"]["internal"]}),
                },
                "images": {
                    "count": len(p["images"]),
                    # alt attribute absent entirely (a defect) vs alt="" (decorative, valid)
                    "missing_alt": [i["src"] for i in p["images"] if i["alt"] is None],
                    "empty_alt": [i["src"] for i in p["images"] if i["alt"] == ""],
                    "alts": [i["alt"] for i in p["images"]],
                },
                "word_count": p["word_count"],
                "headers": headers,
                "html_hash": hash_content(html),
                "html_bytes": len(html.encode("utf-8")),
                "cwv": None,
            }
        )

    redirects = []
    rp = os.path.join(d, "redirect-probes.tsv")
    if os.path.exists(rp):
        with open(rp, encoding="utf-8") as f:
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) >= 4:
                    frm, exp, status, loc = parts[:4]
                    redirects.append(
                        {
                            "from": frm,
                            "expected_location": exp,
                            "status_code": int(status) if status.isdigit() else None,
                            "location": loc or None,
                            "ok": status in ("301", "307", "308") and loc == exp,
                        }
                    )

    noindex_pages = [pg["url"] for pg in pages if "noindex" in (pg["robots"] or "").lower()]
    baseline = {
        "schema_version": "claude-seo-drift/2.5.0+manual",
        "site": "https://www.evergreencleaningservice.ca",
        "captured_at": now,
        "capture_date": args.date,
        "method": (
            "curl -sL --max-time 30 -A 'Mozilla/5.0 (compatible; seo-audit)' per URL; parsed with "
            "scripts/build_baseline.py (python3 -I, bs4/lxml), mirroring claude-seo parse_html.py "
            "and drift_baseline.py. CWV not captured (cwv=null)."
        ),
        "summary": {
            "pages": len(pages),
            "status_counts": {
                str(k): v for k, v in sorted(
                    {s: sum(1 for pg in pages if pg["status_code"] == s) for s in {pg["status_code"] for pg in pages}}.items()
                )
            },
            "indexable": sum(1 for pg in pages if pg["indexable"]),
            "noindex": noindex_pages,
            "pages_without_schema": [pg["url"] for pg in pages if not pg["schema"]],
            "pages_without_canonical": [pg["url"] for pg in pages if not pg["canonical"]],
            "pages_with_multiple_h1": [pg["url"] for pg in pages if len(pg["h1_all"]) > 1],
            "pages_without_h1": [pg["url"] for pg in pages if not pg["h1_all"]],
            "redirect_probes": len(redirects),
            "redirect_failures": [r for r in redirects if not r["ok"]],
        },
        "pages": pages,
        "redirects": redirects,
    }

    out_path = os.path.join(d, f"baseline-{args.date}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(baseline, f, indent=2, ensure_ascii=False)
    print(f"wrote {out_path} ({len(pages)} pages, {len(redirects)} redirect probes)")

    if not args.no_db:
        conn = init_db(args.db)
        ids = []
        try:
            for pg in pages:
                cur = conn.execute(
                    """
                    INSERT INTO baselines (
                        url, url_hash, timestamp, title, meta_description, canonical,
                        robots, h1, h2_json, h3_json, schema_json, og_json, cwv_json,
                        html_hash, schema_hash, status_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        pg["url"],
                        pg["url_hash"],
                        pg["timestamp"],
                        pg["title"],
                        pg["meta_description"],
                        pg["canonical"],
                        pg["robots"],
                        pg["h1"],
                        json.dumps(pg["h2"]),
                        json.dumps(pg["h3"]),
                        json.dumps(pg["schema"]),
                        json.dumps(pg["open_graph"]),
                        None,
                        pg["html_hash"],
                        pg["schema_hash"],
                        pg["status_code"],
                    ),
                )
                ids.append(cur.lastrowid)
            conn.commit()
        finally:
            conn.close()
        print(f"inserted baseline ids {ids[0]}..{ids[-1]} into {args.db}")


if __name__ == "__main__":
    main()

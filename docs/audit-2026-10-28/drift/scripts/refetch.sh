#!/usr/bin/env bash
# Re-fetch every baselined URL plus the redirect probes, so build_baseline.py
# can produce a fresh snapshot to diff against baseline-<date>.json.
#
# Usage:  bash scripts/refetch.sh <drift_dir> [out_dir]
#   drift_dir  the folder holding urls.txt, redirect-rules.tsv, redirect-hosts.tsv
#   out_dir    where to write raw/pages, fetch-index.tsv, redirect-probes.tsv
#              (default: drift_dir itself, overwriting the previous raw capture)
#
# Uses the system proxy if one is configured. Never disables TLS verification.
set -euo pipefail

DRIFT="${1:?drift_dir required}"
OUT="${2:-$DRIFT}"
UA="Mozilla/5.0 (compatible; seo-audit)"
B=https://www.evergreencleaningservice.ca

mkdir -p "$OUT/raw/pages"
cp "$DRIFT/urls.txt" "$OUT/urls.txt" 2>/dev/null || true

# --- pages -----------------------------------------------------------------
i=0
while read -r u; do
  [ -z "$u" ] && continue
  i=$((i+1)); n=$(printf '%03d' "$i")
  curl -sL --max-time 30 -A "$UA" \
    -D "$OUT/raw/pages/$n.headers" -o "$OUT/raw/pages/$n.html" \
    -w '%{http_code}\t%{num_redirects}\t%{url_effective}\t%{size_download}\n' \
    "$u" > "$OUT/raw/pages/$n.meta" &
  if (( i % 8 == 0 )); then wait; fi
done < "$DRIFT/urls.txt"
wait

: > "$OUT/fetch-index.tsv"
i=0
while read -r u; do
  [ -z "$u" ] && continue
  i=$((i+1)); n=$(printf '%03d' "$i")
  printf '%s\t%s\t%s\n' "$n" "$u" "$(cat "$OUT/raw/pages/$n.meta")" >> "$OUT/fetch-index.tsv"
done < "$DRIFT/urls.txt"

# --- redirect probes -------------------------------------------------------
: > "$OUT/redirect-probes.tsv"
probe() { # $1 from-url  $2 expected Location
  curl -s --max-time 30 -o /dev/null -A "$UA" \
    -w "$1\t$2\t%{http_code}\t%{redirect_url}\n" "$1" >> "$OUT/redirect-probes.tsv"
}
while IFS=$'\t' read -r from to; do
  [ -z "$from" ] && continue
  bare="${from%/}"
  if [[ "$from" =~ \.[a-z0-9]{2,5}$ ]]; then probe "$B$from" "$B$to"
  else probe "$B$bare/" "$B$to"; probe "$B$bare" "$B$to"; fi
done < "$DRIFT/redirect-rules.tsv"
while IFS=$'\t' read -r from to; do
  [ -z "$from" ] && continue
  probe "$from" "$to"
done < "$DRIFT/redirect-hosts.tsv"

echo "fetched $i pages -> $OUT/raw/pages ; $(wc -l < "$OUT/redirect-probes.tsv") redirect probes"
echo "status counts:"; awk -F'\t' '{print $3}' "$OUT/fetch-index.tsv" | sort | uniq -c

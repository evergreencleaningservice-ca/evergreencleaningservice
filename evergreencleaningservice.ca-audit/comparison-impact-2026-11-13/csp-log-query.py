"""Read-only Workers Observability query for csp-violation log lines.

13 Nov 2026 (comparison with impact.ca): written to read the reports that
src/lib/csp-report.ts logs, before enforcing the CSP. It only POSTs a query;
it changes nothing. The token needs Workers Observability read access, which
the token used on 13 Nov lacked (403). Retries on 429 because other sessions
share the token's rate limit.

Usage: CF_ACCOUNT_ID=<id> python3 csp-log-query.py [days=7] [view=events] [needle=csp-violation]
"""
import json, os, sys, time, urllib.request

ACC = os.environ["CF_ACCOUNT_ID"]  # the Cloudflare account id; GET /client/v4/accounts lists it
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACC}/workers/observability/telemetry/query"
now = int(time.time() * 1000)
days = float(sys.argv[1]) if len(sys.argv) > 1 else 7
view = sys.argv[2] if len(sys.argv) > 2 else "events"
needle = sys.argv[3] if len(sys.argv) > 3 else "csp-violation"
offset = sys.argv[4] if len(sys.argv) > 4 else None
body = {
    "queryId": "csp-review-" + str(now),
    "timeframe": {"from": now - int(days * 86400000), "to": now},
    "view": view,
    "limit": 100,
    "parameters": {
        "datasets": ["cloudflare-workers"],
        "filters": [{"key": "$metadata.service", "operation": "eq", "type": "string", "value": "evergreencleaningservice"}],
    },
}
if needle:
    body["parameters"]["needle"] = {"value": needle, "isRegex": False, "matchCase": False}
if offset:
    body["offset"] = offset
req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST", headers={
    "Authorization": "Bearer " + os.environ["CF_API_TOKEN"], "Content-Type": "application/json"})
for attempt in range(12):
    try:
        with urllib.request.urlopen(req) as r:
            out = r.read().decode()
            code = r.status
    except urllib.error.HTTPError as e:
        out = e.read().decode(); code = e.code
    if code != 429:
        break
    time.sleep(15 + attempt * 5)
print(code)
print(out)

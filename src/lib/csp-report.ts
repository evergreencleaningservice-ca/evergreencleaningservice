/**
 * /api/csp-report — where the report-only Content-Security-Policy in
 * `public/_headers` sends its violations (SEO audit H1, 2026-10-29).
 *
 * The policy ships report-only first: nothing is blocked, and each thing it
 * WOULD block arrives here and is written to the Worker log, which
 * observability keeps. Two weeks of an empty log is the evidence for
 * switching the header to enforcing.
 *
 * Browsers send one of two shapes: the legacy `report-uri` body
 * (`application/csp-report`, one `{"csp-report": {...}}`) or the Reporting
 * API (`application/reports+json`, an array of `{type, body}`). Both are
 * reduced to the four fields that say what to allow, and logged one line per
 * violation. Nothing is stored, and the answer is always 204, so a malformed
 * or hostile body costs a log line at most.
 */

/** Large enough for any real report; anything bigger is not one. */
const MAX_BODY = 16_384;

interface Violation {
  page: string;
  directive: string;
  blocked: string;
  source?: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v.slice(0, 300) : '');

/** The violations in a report body, in either format. Never throws. */
export function parseCspReport(body: string): Violation[] {
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return [];
  }
  const items: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const r of data) {
      if (r && typeof r === 'object' && (r as { type?: unknown }).type === 'csp-violation') {
        const b = (r as { body?: unknown }).body;
        if (b && typeof b === 'object') items.push(b as Record<string, unknown>);
      }
    }
  } else if (data && typeof data === 'object' && 'csp-report' in data) {
    const b = (data as Record<string, unknown>)['csp-report'];
    if (b && typeof b === 'object') items.push(b as Record<string, unknown>);
  }
  return items.slice(0, 20).map((b) => ({
    page: str(b.documentURL ?? b['document-uri']),
    directive: str(b.effectiveDirective ?? b['effective-directive'] ?? b['violated-directive']),
    blocked: str(b.blockedURL ?? b['blocked-uri']),
    source: str(b.sourceFile ?? b['source-file']) || undefined,
  }));
}

export async function cspReport(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const text = await request.text();
  if (text.length <= MAX_BODY) {
    for (const v of parseCspReport(text)) console.warn('csp-violation', JSON.stringify(v));
  }
  return new Response(null, { status: 204 });
}

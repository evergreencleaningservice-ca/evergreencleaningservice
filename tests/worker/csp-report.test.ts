/**
 * /api/csp-report: both report formats reduce to the same four fields, and
 * nothing a sender can put in the body makes the endpoint fail or store it.
 */
import { describe, expect, it, vi } from 'vitest';
import { cspReport, parseCspReport } from '../../src/lib/csp-report';

const legacy = JSON.stringify({
  'csp-report': {
    'document-uri': 'https://www.evergreencleaningservice.ca/',
    'effective-directive': 'script-src-elem',
    'blocked-uri': 'https://example.net/x.js',
    'source-file': 'https://www.evergreencleaningservice.ca/',
  },
});

const reportingApi = JSON.stringify([
  { type: 'csp-violation', body: { documentURL: 'https://www.evergreencleaningservice.ca/a/', effectiveDirective: 'img-src', blockedURL: 'https://example.net/p.gif' } },
  { type: 'deprecation', body: { id: 'x' } },
]);

describe('parseCspReport', () => {
  it('reads the legacy report-uri body', () => {
    expect(parseCspReport(legacy)).toEqual([
      { page: 'https://www.evergreencleaningservice.ca/', directive: 'script-src-elem', blocked: 'https://example.net/x.js', source: 'https://www.evergreencleaningservice.ca/' },
    ]);
  });

  it('reads the Reporting API body and skips other report types', () => {
    expect(parseCspReport(reportingApi)).toEqual([
      { page: 'https://www.evergreencleaningservice.ca/a/', directive: 'img-src', blocked: 'https://example.net/p.gif', source: undefined },
    ]);
  });

  it('returns nothing for garbage', () => {
    for (const body of ['', 'not json', '42', 'null', '{"csp-report":7}', '[null,1]']) {
      expect(parseCspReport(body)).toEqual([]);
    }
  });
});

describe('cspReport', () => {
  it('answers 204 and logs one line per violation', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await cspReport(new Request('https://x/api/csp-report', { method: 'POST', body: legacy }));
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('refuses anything but POST', async () => {
    expect((await cspReport(new Request('https://x/api/csp-report'))).status).toBe(405);
  });

  it('ignores an oversized body without failing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await cspReport(new Request('https://x/api/csp-report', { method: 'POST', body: 'x'.repeat(20_000) }));
    expect(res.status).toBe(204);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

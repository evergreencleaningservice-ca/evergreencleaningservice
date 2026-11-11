/**
 * The report-only Content-Security-Policy in public/_headers must allow what
 * the live pages actually load, or enforcing it would break them.
 *
 * CSP review, 11 Nov 2026: the live pages were loaded in a browser with the
 * Tag Manager container running, its Google Ads conversion (the
 * `lead_form_submission` trigger) and paid-visit (`?gclid=`) paths firing,
 * the reCAPTCHA widget loaded and a review opened, while every hit, pixel and
 * report request was aborted so nothing reached Analytics, Ads or the Worker
 * log. Each host below is one those pages requested under that directive.
 * The one the policy lacked, www.googleadservices.com under img-src, is the
 * Ads form-conversion pixel: enforcing without it would have stopped Ads
 * counting form leads.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const headers = fs.readFileSync(path.resolve(import.meta.dirname, '../public/_headers'), 'utf8');
const reportOnly = headers.match(/^\s*Content-Security-Policy-Report-Only:\s*(.+)$/m)?.[1] ?? '';
const directives = Object.fromEntries(
  reportOnly
    .split(';')
    .map((d) => d.trim().split(/\s+/))
    .filter((parts) => parts[0])
    .map(([name, ...sources]) => [name, sources]),
);

/** What the live pages requested on 11 Nov 2026, by the directive that governs it. */
const OBSERVED: Record<string, string[]> = {
  'script-src': ['https://www.googletagmanager.com', 'https://www.google.com', 'https://www.gstatic.com', 'https://googleads.g.doubleclick.net', 'https://static.cloudflareinsights.com'],
  'img-src': ['https://img.evergreencleaningservice.ca', 'https://www.google.com', 'https://www.gstatic.com', 'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://ad.doubleclick.net', 'https://www.googletagmanager.com'],
  'connect-src': ['https://www.google.com', 'https://www.googleadservices.com', 'https://ad.doubleclick.net', 'https://*.google-analytics.com'],
  'style-src': ['https://www.gstatic.com'],
  'frame-src': ['https://www.google.com'],
  'font-src': ['https://fonts.gstatic.com'],
};

describe('the report-only CSP allows what the live pages load', () => {
  it('is present and reports to the Worker', () => {
    expect(reportOnly).not.toBe('');
    expect(directives['report-uri']).toEqual(['/api/csp-report']);
  });

  it.each(Object.entries(OBSERVED))('%s lists every host the pages used', (directive, hosts) => {
    for (const host of hosts) expect(directives[directive], `${directive} ${host}`).toContain(host);
  });
});

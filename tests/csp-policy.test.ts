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

/**
 * 13 Nov 2026 (comparison with impact.ca, item 10): the full policy was NOT
 * enforced, because the violation reports could not be read
 * (evergreencleaningservice.ca-audit/comparison-impact-2026-11-13/csp-review.md).
 * These checks hold before and after that switch. When a path matches two
 * rules that both set Content-Security-Policy, Workers static assets joins the
 * values with a comma. Browsers then enforce both policies, so the stricter
 * one silently wins. Exactly one enforced line, carrying the four baseline
 * directives, rules that out.
 */
describe('one enforced CSP for HTML paths', () => {
  const enforcedLines = [...headers.matchAll(/^\s*Content-Security-Policy:\s*(.+)$/gm)].map((m) => m[1].trim());

  it('has exactly one enforced Content-Security-Policy line', () => {
    expect(enforcedLines).toHaveLength(1);
  });

  it('sits in the /* rule, which every HTML path matches', () => {
    const rule = headers.split(/\n(?=\S)/).find((block) => /^\s*Content-Security-Policy:/m.test(block)) ?? '';
    expect(rule.split('\n')[0].trim()).toBe('/*');
  });

  it('enforces the baseline directives', () => {
    const enforced = Object.fromEntries(
      (enforcedLines[0] ?? '')
        .split(';')
        .map((d) => d.trim().split(/\s+/))
        .filter((parts) => parts[0])
        .map(([name, ...sources]) => [name, sources]),
    );
    expect(enforced['frame-ancestors']).toEqual(["'self'"]);
    expect(enforced['base-uri']).toEqual(["'self'"]);
    expect(enforced['form-action']).toEqual(["'self'"]);
    expect(enforced['object-src']).toEqual(["'none'"]);
  });
});

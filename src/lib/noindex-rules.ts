/**
 * Reads `_headers` the way Workers static assets does, far enough to answer
 * one question: which hostnames does it noindex?
 *
 * Staging and production are one build on one Worker. The noindex is scoped
 * by hostname in `public/_headers`, and the whole safety of that arrangement
 * is that no rule can reach a production address. A path-only rule (`/*`)
 * matches every host, so it would noindex the live site the moment its Custom
 * Domain is attached — the failure this file exists to catch before it ships.
 *
 * Used by tests/build/indexability.test.ts and scripts/launch-check.mjs, so
 * the build and the pre-cutover gate apply the same reading.
 */

export interface HeaderRule {
  /** The rule's first line, exactly: `/path` or `https://host/path`. */
  url: string;
  /** Header name (lower-cased) → value. */
  headers: Record<string, string>;
}

export function parseHeaders(text: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({ url: line.trim(), headers: {} });
      continue;
    }
    const current = rules[rules.length - 1];
    const m = line.trim().match(/^([^:]+):\s*(.*)$/);
    if (current && m) current.headers[m[1].toLowerCase()] = m[2];
  }
  return rules;
}

/** The hostname part of an absolute rule, or null for a path-only rule. */
export const ruleHost = (url: string): string | null =>
  url.match(/^https:\/\/([^/]+)\//)?.[1] ?? null;

/**
 * Whether a rule's host pattern matches a hostname. `:name` placeholders
 * match anything except a dot, as Cloudflare documents for the host part.
 */
export function hostMatches(pattern: string, host: string): boolean {
  const re = pattern
    .split(/(:[A-Za-z]\w*)/)
    .map((part) => (/^:[A-Za-z]/.test(part) ? '[^.]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${re}$`, 'i').test(host);
}

export const isNoindexRule = (rule: HeaderRule) => /noindex/i.test(rule.headers['x-robots-tag'] ?? '');

/**
 * Everything wrong with a `_headers` file's noindex rules, as sentences.
 * Empty means every noindex is scoped to a named host and none of those
 * hosts is production.
 */
export function noindexProblems(text: string, productionHosts: readonly string[]): string[] {
  const problems: string[] = [];
  for (const rule of parseHeaders(text).filter(isNoindexRule)) {
    const host = ruleHost(rule.url);
    if (!host) {
      problems.push(`"${rule.url}" noindexes by path, which matches every host including production`);
      continue;
    }
    for (const prod of productionHosts) {
      if (hostMatches(host, prod)) problems.push(`"${rule.url}" matches the production host ${prod}`);
    }
  }
  return problems;
}

/** The host patterns that carry a noindex. */
export const noindexedHosts = (text: string): string[] =>
  parseHeaders(text)
    .filter(isNoindexRule)
    .map((r) => ruleHost(r.url))
    .filter((h): h is string => h !== null);

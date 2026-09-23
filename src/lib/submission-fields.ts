/**
 * Comments and testimonials: what arrives off the wire, and what may be stored.
 *
 * The counterpart of `lead-fields.ts`, and deliberately a pure module for the
 * same reason — every rule here is a decision about untrusted input from a
 * stranger, and a pure function is the only kind you can test exhaustively
 * without a Worker, a database or a network.
 *
 * WHAT MAKES THIS DIFFERENT FROM A LEAD. A lead is read by the client and
 * acted on. A comment and a testimonial are written to be PUBLISHED, which
 * means the text is eventually rendered to other visitors. Nothing here
 * escapes or sanitises HTML, and that is on purpose: escaping belongs at the
 * point of rendering, where the context is known, not at the point of storage
 * where it would silently corrupt the stored text and still be wrong for
 * attribute or URL contexts. What this module does is bound the input, reject
 * what is unusable, and refuse to invent anything the visitor did not type.
 */

/** Trim, collapse newlines to at most two, and cap. */
export const clean = (value: unknown, max: number): string =>
  typeof value === 'string'
    ? value.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max)
    : '';

/** The two things this endpoint accepts. Anything else is rejected outright. */
export const KINDS = ['comment', 'review'] as const;
export type Kind = (typeof KINDS)[number];

export const isKind = (value: unknown): value is Kind =>
  typeof value === 'string' && (KINDS as readonly string[]).includes(value);

export type Submission = {
  kind: Kind;
  post_slug: string;
  author_name: string;
  author_email: string;
  author_url: string;
  business_title: string;
  body: string;
  page_url: string;
};

/**
 * Field limits.
 *
 * `body` is 8,000 rather than something rounder: long enough that nobody with
 * a genuine testimonial or a considered comment is ever truncated, short
 * enough that a single row cannot be used to push a megabyte into the table.
 */
const LIMITS = {
  post_slug: 200,
  author_name: 120,
  author_email: 320,
  author_url: 500,
  business_title: 200,
  body: 8_000,
  page_url: 1_000,
} as const;

/**
 * A post slug, or ''.
 *
 * Constrained to the shape this site's slugs actually take, because it is
 * written into a column that a future read will use to look posts up. A
 * stranger choosing the key another query filters on is worth bounding even
 * when the driver parameterises the value.
 */
export const normalizeSlug = (value: unknown): string => {
  const raw = clean(value, LIMITS.post_slug)
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  return /^[a-z0-9][a-z0-9-]*$/.test(raw) ? raw : '';
};

/**
 * A website, or ''.
 *
 * The comment form has a `url` field the original carried, and it is the one
 * input here that becomes an href. Only http and https survive: `javascript:`
 * and `data:` are the reason this is an allowlist rather than a format check,
 * and they are rejected at the door rather than relied on to be caught by
 * whatever renders the link later.
 */
export const normalizeUrl = (value: unknown): string => {
  const raw = clean(value, LIMITS.author_url);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href.slice(0, LIMITS.author_url) : '';
  } catch {
    return '';
  }
};

export function normalizeSubmission(body: Record<string, unknown>): Submission {
  return {
    kind: isKind(body.kind) ? body.kind : ('comment' as Kind),
    post_slug: normalizeSlug(body.post_slug),
    author_name: clean(body.author_name ?? body.name ?? body.author, LIMITS.author_name),
    author_email: clean(body.author_email ?? body.email, LIMITS.author_email).toLowerCase(),
    author_url: normalizeUrl(body.author_url ?? body.url),
    business_title: clean(body.business_title, LIMITS.business_title),
    body: clean(body.body ?? body.comment ?? body.review, LIMITS.body),
    page_url: clean(body.page_url, LIMITS.page_url),
  };
}

/**
 * Deliberately the same shape of check the contact form uses, and no stricter.
 *
 * An email is required here where a lead may give a phone instead, because
 * there is no phone field on either form and a comment with no way to reach
 * its author cannot be moderated — a reply, a clarification, or a notice that
 * it was published all need it.
 */
export function submissionProblems(s: Submission): string[] {
  const problems: string[] = [];
  if (!(KINDS as readonly string[]).includes(s.kind)) problems.push('kind');
  if (!s.author_name) problems.push('author_name');
  /* The same shape test as the lead forms: something, an @, something with a
     dot. Not RFC 5322 — that rejects addresses that work and accepts ones
     that do not. The confirmation a real address gets is a reply to it. */
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.author_email)) problems.push('author_email');
  if (!s.body) problems.push('body');
  /* A comment that does not say which post it is on cannot be shown on one. */
  if (s.kind === 'comment' && !s.post_slug) problems.push('post_slug');
  return problems;
}

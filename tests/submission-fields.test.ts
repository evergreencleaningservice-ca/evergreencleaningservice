/**
 * @vitest-environment node
 *
 * What a stranger may put in the `submissions` table.
 *
 * These two forms are different from every other input on this site in one
 * way that matters: a lead is read by the client and acted on, but a comment
 * and a testimonial are written in order to be PUBLISHED — eventually
 * rendered back to other visitors. That makes the normaliser the boundary
 * between anonymous input and the site's own pages, so it is a pure module
 * and tested as one.
 *
 * The `javascript:` case below is the reason `normalizeUrl` is an allowlist
 * rather than a format check. The comment form's Website field is the only
 * input on the site that becomes an `href`, and a renderer that trusted the
 * stored value would put an attacker's script behind a commenter's name.
 */
import { describe, expect, it } from 'vitest';
import {
  isKind,
  normalizeSlug,
  normalizeSubmission,
  normalizeUrl,
  submissionProblems,
} from '../src/lib/submission-fields';

const comment = (over: Record<string, unknown> = {}) =>
  normalizeSubmission({
    kind: 'comment',
    post_slug: 'keep-your-office-at-home-clean',
    author_name: 'Jane Doe',
    author_email: 'Jane@Example.com',
    body: 'Useful, thanks.',
    ...over,
  });

describe('the website field, which is the one input that becomes a link', () => {
  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)  ',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ])('refuses %s', (hostile) => {
    expect(normalizeUrl(hostile)).toBe('');
  });

  it('keeps an ordinary http and https address', () => {
    expect(normalizeUrl('https://example.com/about')).toBe('https://example.com/about');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('drops anything that is not a URL at all, rather than guessing', () => {
    expect(normalizeUrl('example.com')).toBe('');
    expect(normalizeUrl('not a url')).toBe('');
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl(undefined)).toBe('');
  });
});

describe('the post slug, which a later read will filter on', () => {
  it('accepts the shape this site’s slugs take', () => {
    expect(normalizeSlug('keep-your-office-at-home-clean')).toBe('keep-your-office-at-home-clean');
    expect(normalizeSlug('/keep-your-office-at-home-clean/')).toBe(
      'keep-your-office-at-home-clean'
    );
    expect(normalizeSlug('5-tips-for-maintaining-clean-office-air')).toBe(
      '5-tips-for-maintaining-clean-office-air'
    );
  });

  it('refuses anything else instead of storing it', () => {
    for (const bad of ['../../etc/passwd', 'a/b', 'has space', "o'brien", '<script>', '-leading']) {
      expect(normalizeSlug(bad), bad).toBe('');
    }
  });
});

describe('normalising a submission', () => {
  it('lowercases the email and keeps the name as typed', () => {
    const s = comment();
    expect(s.author_email).toBe('jane@example.com');
    expect(s.author_name).toBe('Jane Doe');
  });

  it('accepts the form field names as well as the canonical ones', () => {
    /* The comment form posts `comment`; the testimonial form posts `review`.
       Both mean "the text". */
    expect(normalizeSubmission({ kind: 'comment', comment: 'from a comment' }).body).toBe(
      'from a comment'
    );
    expect(normalizeSubmission({ kind: 'review', review: 'from a review' }).body).toBe(
      'from a review'
    );
  });

  it('does not escape or strip HTML, deliberately', () => {
    /* Escaping at storage time corrupts the stored text and is still wrong
       for attribute and URL contexts. It belongs where the value is
       rendered. This asserts the decision so nobody "fixes" it here. */
    const s = comment({ body: '<b>bold</b> & <i>italic</i>' });
    expect(s.body).toBe('<b>bold</b> & <i>italic</i>');
  });

  it('collapses runaway blank lines and caps the body', () => {
    expect(normalizeSubmission({ body: 'a\n\n\n\n\nb' }).body).toBe('a\n\nb');
    expect(normalizeSubmission({ body: 'x'.repeat(20_000) }).body).toHaveLength(8_000);
  });

  it('falls back to a comment rather than inventing a third kind', () => {
    expect(normalizeSubmission({ kind: 'spam-machine' }).kind).toBe('comment');
    expect(isKind('comment')).toBe(true);
    expect(isKind('review')).toBe(true);
    expect(isKind('anything-else')).toBe(false);
  });
});

describe('what is rejected outright', () => {
  it('accepts a complete comment', () => {
    expect(submissionProblems(comment())).toEqual([]);
  });

  it('needs a name, an email and some text', () => {
    expect(submissionProblems(comment({ author_name: '' }))).toContain('author_name');
    expect(submissionProblems(comment({ body: '' }))).toContain('body');
    expect(submissionProblems(comment({ author_email: 'not-an-email' }))).toContain('author_email');
  });

  it('needs a comment to say which post it is on', () => {
    /* Without it the row cannot be shown anywhere, so it is refused at the
       door rather than stored and stranded. */
    expect(submissionProblems(comment({ post_slug: '' }))).toContain('post_slug');
  });

  it('does not ask a testimonial for a post slug', () => {
    const review = normalizeSubmission({
      kind: 'review',
      author_name: 'Sam',
      author_email: 'sam@example.com',
      review: 'They are excellent.',
    });
    expect(submissionProblems(review)).toEqual([]);
  });
});

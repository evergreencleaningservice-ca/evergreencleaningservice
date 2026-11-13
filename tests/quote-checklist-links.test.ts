/** @vitest-environment node */
/**
 * SEO audit 11 Nov 2026, fixed 12 Nov 2026 (findings/onpage.md N1, N2 and N6;
 * findings/content.md N-C).
 *
 * - The quote-checklist post had no contextual inlink. The cost guide's
 *   quote-comparison section and how-to-decide's "Read the Contract" now
 *   point at it as the detailed version, so it is the one page for
 *   "cleaning quote checklist" intent.
 * - "janitorial services" anchors went to /services/commercial-cleaning/,
 *   which left the janitorial page with three contextual inlinks. They now go
 *   to /services/janitorial-services/; combined anchors are split so each
 *   term links its own page.
 * - The checklist post repeated its keyword six times and used Title Case
 *   question H2s. It now keeps the phrase in the title, description and
 *   intro only, with sentence-case H2s, and links "commercial cleaning" to
 *   the service page. Its facts, sources and illustrative labels stay.
 *
 * Like blog-links.test.ts, these read the Markdown sources: the build suites
 * already prove that links resolve and headings render.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '..');

function parse(rel: string) {
  const text = fs.readFileSync(path.join(repo, 'src/content', rel), 'utf8');
  const [, front = '', ...rest] = text.split(/^---$/m);
  const field = (key: string) => front.match(new RegExp(`^\\s*${key}:\\s*"(.*)"\\s*$`, 'm'))?.[1];
  return { front, body: rest.join('---'), field };
}
/** Markdown links as [anchor, href] pairs; images (`![alt](src)`) are skipped. */
const links = (text: string) =>
  [...text.matchAll(/(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => [m[1], m[2]] as const);
/** The Markdown between an `<h2 id="…">` and the next H2. */
const section = (body: string, id: string) => {
  const start = body.indexOf(`<h2 id="${id}">`);
  if (start < 0) throw new Error(`no section ${id}`);
  const next = body.indexOf('<h2 ', start + 1);
  return body.slice(start, next < 0 ? undefined : next);
};

const CHECKLIST = '/commercial-cleaning-quote-checklist/';
const costGuide = parse('blog/office-cleaning-cost-toronto-guide.md');
const howToDecide = parse('blog/how-to-decide-on-a-cleaning-company.md');
const checklist = parse('blog/commercial-cleaning-quote-checklist.md');

describe('the quote checklist gets contextual inlinks (onpage N1, N6)', () => {
  it('the cost guide summarises quote comparison and links the checklist as the detailed version', () => {
    const compare = section(costGuide.body, 'comparing-cleaning-quotes');
    expect(links(compare).some(([, href]) => href === CHECKLIST)).toBe(true);
    // The summary keeps all five sub-topics and their facts.
    for (const h3 of [
      'Compare written scopes of work',
      'Check insurance, bonding and WSIB',
      'Ask about staff consistency and inspections',
      'Confirm access and consumables',
      'Avoid common contract mistakes',
    ]) {
      expect(compare).toContain(`### ${h3}`);
    }
    // The worked example is untouched.
    expect(section(costGuide.body, 'worked-example')).toContain('$150 × 5 visits × 52 weeks ÷ 12 months = $3,250');
  });

  it('how-to-decide links the checklist from "Read the Contract"', () => {
    const contract = howToDecide.body.split('### Read the Contract')[1]!.split('\n### ')[0]!;
    expect(links(contract).some(([, href]) => href === CHECKLIST)).toBe(true);
  });
});

describe('"janitorial services" anchors link the janitorial page (onpage N2)', () => {
  const files = {
    'blog/office-cleaning-cost-toronto-guide.md': 1,
    'blog/preventing-slips-trips-falls-in-your-workplace.md': 1,
    'blog/how-often-should-an-office-be-cleaned.md': 1,
    'pages/about-us.md': 1,
  };

  for (const [file, expected] of Object.entries(files)) {
    it(`${file}: every janitorial anchor goes to /services/janitorial-services/`, () => {
      const found = links(parse(file).body).filter(([anchor]) => /janitorial/i.test(anchor));
      expect(found.length).toBeGreaterThanOrEqual(expected);
      for (const [anchor, href] of found) expect(href, anchor).toBe('/services/janitorial-services/');
    });
  }

  it('splits the combined anchors so "commercial cleaning" keeps the commercial page', () => {
    for (const file of ['blog/how-often-should-an-office-be-cleaned.md', 'pages/about-us.md']) {
      const found = links(parse(file).body);
      expect(found.some(([a, h]) => /^commercial cleaning$/i.test(a) && h === '/services/commercial-cleaning/'), file).toBe(true);
      expect(found.some(([a]) => /commercial cleaning and janitorial/i.test(a)), file).toBe(false);
    }
  });
});

describe('the quote-checklist post reads less like it was written for a keyword (content N-C)', () => {
  const phrase = /commercial cleaning quote checklist/gi;
  const count = (text = '') => text.match(phrase)?.length ?? 0;

  it('keeps the exact phrase in the title and intro, and nowhere in the body', () => {
    expect(count(checklist.field('title'))).toBe(1);
    expect(count(checklist.field('intro'))).toBe(1);
    expect(count(checklist.body)).toBe(0);
    // title (also the seoTitle), description and intro: three uses at most.
    expect(count(checklist.field('title')) + count(checklist.field('description')) + count(checklist.field('intro'))).toBeLessThanOrEqual(3);
  });

  it('has sentence-case H2s and a plain closing heading, with the same ids', () => {
    const h2s = [...checklist.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((m) => [m[1], m[2]] as const);
    expect(h2s.map(([id]) => id)).toEqual([
      'quote-checklist',
      'tasks-frequency-supplies',
      'price-exclusions',
      'sample-office-scope',
      'before-signing',
      'review-your-quote',
      'frequently-asked-questions',
    ]);
    // Proper nouns and acronyms may stay capitalised; nothing else after the first word.
    const allowed = new Set(['Evergreen', 'Toronto', 'GTA', 'WSIB', 'CAD', 'HST']);
    for (const [, text] of h2s) {
      const later = text.split(/\s+/).slice(1).filter((w) => !allowed.has(w.replace(/[?,.]/g, '')));
      expect(later.filter((w) => /^[A-Z]/.test(w)), text).toEqual([]);
    }
    expect(h2s.find(([id]) => id === 'review-your-quote')![1]).toBe('Getting a quote from Evergreen');
    // The contents list follows the heading.
    expect(checklist.front).toContain('{ label: "Getting a quote from Evergreen", id: "review-your-quote" }');
  });

  it('links "commercial cleaning" to the commercial cleaning service in the body', () => {
    expect(links(checklist.body).some(([a, h]) => a === 'commercial cleaning' && h === '/services/commercial-cleaning/')).toBe(true);
  });

  it('keeps its sources and the illustrative labelling', () => {
    expect(checklist.body).toContain('](https://www.ccohs.ca/oshanswers/chemicals/cleaning-products-working-safely.html)');
    expect(checklist.body).toContain('](https://www.wsib.ca/en/businesses/premiums-and-payment/clearances)');
    expect(checklist.body).toContain('it is not a client story or a price estimate');
    expect(checklist.body.match(/Illustrative stock photograph\./g)?.length).toBe(2);
  });
});

describe('link-only edits leave the dates alone', () => {
  // The repo bumps updatedDate only for merges and material revisions (see the
  // 7 Nov commit "Blog and service copy: ..."); these are link and copy edits.
  it('adds no updatedDate and keeps the existing one', () => {
    /* 13 Nov 2026, SEO audit 11 Nov (geo N8): the cost guide and the slips
       post now carry an updatedDate, for their retitle (7 Nov) and CCOHS
       source (6 Nov). What this test guards is that the 12 Nov link edits did
       not set one, so any date must come before 12 Nov. */
    for (const file of [
      'blog/commercial-cleaning-quote-checklist.md',
      'blog/office-cleaning-cost-toronto-guide.md',
      'blog/preventing-slips-trips-falls-in-your-workplace.md',
      'blog/how-often-should-an-office-be-cleaned.md',
    ]) {
      const date = parse(file).front.match(/^updatedDate: (\S+)$/m)?.[1];
      if (date) expect(date < '2026-11-12', file).toBe(true);
    }
    expect(howToDecide.front).toMatch(/^updatedDate: 2026-10-30$/m);
  });
});

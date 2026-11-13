/** @vitest-environment node */
/**
 * SEO re-audit, 7 Nov 2026 (ACTION-PLAN items 6, 7, part of 8 and 13;
 * findings/onpage.md N3–N6, findings/content.md N2 and N5).
 *
 * These read the Markdown sources rather than a build: every check here is
 * about what the content says and where its links point, and the build suites
 * (headings-and-links, office-cost-guide) already prove that the links
 * resolve and the guide renders. Reading the sources keeps this file fast and
 * makes a failure name the file to fix.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageTitle, TITLE_LIMIT } from '../src/lib/title';
import { offerHub } from '../src/data/offer-pages';

const repo = path.resolve(import.meta.dirname, '..');
const dir = (name: string) => path.join(repo, 'src/content', name);
const files = (name: string) =>
  fs.readdirSync(dir(name)).filter((f) => f.endsWith('.md')).map((f) => path.join(dir(name), f));

/** Front matter and body, split at the second `---`. */
function parse(file: string) {
  const text = fs.readFileSync(file, 'utf8');
  const [, front = '', ...rest] = text.split(/^---$/m);
  const field = (key: string) => front.match(new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm'))?.[1];
  return { slug: path.basename(file, '.md'), front, body: rest.join('---'), field };
}

const blog = files('blog').map(parse);
const post = (slug: string) => {
  const found = blog.find((p) => p.slug === slug);
  if (!found) throw new Error(`no post ${slug}`);
  return found;
};
/** Every content file this workstream owns: posts, services (less the two
    pillar pages edited elsewhere) and industries. */
const owned = [
  ...blog,
  ...files('services')
    .filter((f) => !/\/(commercial|office)-cleaning\.md$/.test(f))
    .map(parse),
  ...files('industries').map(parse),
];
/** Markdown links in a body, as [anchor, href] pairs. */
const links = (body: string) => [...body.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => [m[1], m[2]] as const);

describe('the cost guide keeps "cost" without promising a price list', () => {
  const guide = post('office-cleaning-cost-toronto-guide');

  it('puts "cost" back in the <title> and the H1, inside 60 characters', () => {
    // Both layouts pass seoTitle through pageTitle(), which adds the brand when it fits.
    const title = guide.field('seoTitle')!;
    expect(title).toBe('Office Cleaning Costs in Toronto: How Pricing Works');
    expect(title.length).toBeLessThanOrEqual(TITLE_LIMIT);
    expect(guide.field('title')).toMatch(/Costs in Toronto/);
  });

  it('leads the description with the answer instead of echoing the title', () => {
    const description = guide.field('description')!;
    expect(description.toLowerCase().startsWith(guide.field('title')!.toLowerCase().slice(0, 20))).toBe(false);
    expect(description).toMatch(/^Toronto office cleaning prices depend on/);
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it('is labelled by its new title wherever a guide lists it as related', () => {
    for (const p of blog) {
      const label = p.front.match(/slug: "office-cleaning-cost-toronto-guide", label: "([^"]+)"/)?.[1];
      if (label) expect(label, p.slug).toBe(guide.field('title'));
    }
  });
});

describe('titles and descriptions fit', () => {
  it('the checklist guide title is 60 characters or fewer and no longer promises a printable version', () => {
    const checklist = post('office-cleaning-checklist');
    expect(checklist.field('seoTitle')!.length).toBeLessThanOrEqual(TITLE_LIMIT);
    expect(checklist.field('description')).not.toMatch(/printable/i);
  });

  it('every post title, as the layouts emit it, is 60 characters or fewer', () => {
    for (const p of blog) {
      // Both layouts run seoTitle through pageTitle() (13 Nov 2026, SEO audit 11 Nov N4).
      const headline = p.field('seoTitle') ?? p.field('title')!;
      const shown = pageTitle(headline);
      expect(shown.length, `${p.slug}: ${shown}`).toBeLessThanOrEqual(TITLE_LIMIT);
    }
  });

  it('every description in these collections is 155 characters or fewer', () => {
    for (const p of owned) {
      const description = p.field('description');
      if (description) expect(description.length, p.slug).toBeLessThanOrEqual(155);
    }
  });
});

describe('no unsourced claims', () => {
  it('drops the dust-mite figure and the appeal to unnamed experts, and fixes the typo', () => {
    const text = blog.map((p) => p.body).join('\n');
    expect(text).not.toMatch(/20 million/);
    expect(text).not.toMatch(/may no appreciate/);
    expect(text).not.toMatch(/according to experts|experts say|studies show|research shows|research that shows/i);
  });

  it('names its source wherever a post leans on one', () => {
    const products = post('6-common-cleaning-products-that-you-should-never-mix-together').body;
    expect(products).toContain('](https://www.ccohs.ca/oshanswers/chemicals/bleach.html)');
    const techniques = post('commercial-cleaning-techniques-to-avoid').body;
    expect(techniques).toContain('](https://www.nature.com/articles/s41598-017-06055-9)');
  });
});

describe('internal links', () => {
  const everyBody = [...owned, ...files('pages').map(parse)];
  const inlinks = (slug: string) =>
    everyBody.filter((p) => p.slug !== slug && links(p.body).some(([, href]) => href === `/${slug}/`)).map((p) => p.slug);

  it('the five posts that had no contextual inlink now have one', () => {
    for (const slug of [
      '5-cleaning-tips-to-help-make-your-office-relocation-seamless',
      'how-to-keep-your-office-fridge-clean',
      'keep-your-office-at-home-clean',
      'office-layout-tips-to-make-cleaning-easier-and-faster',
      'robotic-vs-manual-cleaning-which-will-ultimately-succeed',
    ]) {
      expect(inlinks(slug).length, slug).toBeGreaterThan(0);
    }
  });

  it('carries the planned reverse links in the page bodies', () => {
    const has = (from: string, to: string) => {
      const p = owned.find((o) => o.slug === from)!;
      return links(p.body).some(([, href]) => href === to);
    };
    expect(has('post-construction-cleaning', '/5-cleaning-tips-to-help-make-your-office-relocation-seamless/')).toBe(true);
    expect(has('ask-the-office-cleaners-cleaning-break-rooms', '/how-to-keep-your-office-fridge-clean/')).toBe(true);
    expect(has('ask-the-office-cleaners-cleaning-break-rooms', '/office-layout-tips-to-make-cleaning-easier-and-faster/')).toBe(true);
    expect(has('industrial-cleaning', '/robotic-vs-manual-cleaning-which-will-ultimately-succeed/')).toBe(true);
    expect(has('office-layout-tips-to-make-cleaning-easier-and-faster', '/keep-your-office-at-home-clean/')).toBe(true);
    expect(has('disinfection-cleaning', '/commercial-cleaning-air-quality/')).toBe(true);
    expect(has('medical-dental-clinics', '/cleaning-check-list-dental-clinics/')).toBe(true);
  });

  it('sends service-intent anchors to a service, and the brand name nowhere but About', () => {
    for (const p of owned) {
      for (const [anchor, href] of links(p.body)) {
        if (/^professional cleaning/i.test(anchor)) expect(offerHub(href), `${p.slug}: ${anchor} -> ${href}`).toBe('/services/');
        if (/^Evergreen( Office Cleaning)?$/.test(anchor)) expect(href, `${p.slug}: ${anchor}`).toBe('/about-us/');
      }
    }
  });

  it('no two posts end on the same sentence, and the old template is gone', () => {
    const template = /If you would rather leave it to a professional crew/;
    const last = blog.map((p) => p.body.trim().split('\n').filter(Boolean).pop()!);
    expect(last.filter((line) => template.test(line))).toEqual([]);
    const repeated = last.filter((line, i) => last.indexOf(line) !== i && !line.startsWith('</'));
    expect(repeated).toEqual([]);
  });

  it('keeps each of the 18 rewritten closing sentences to one or two links, one of them a service or industry page', () => {
    const rewritten = [
      '5-cleaning-products-you-should-have-in-your-office',
      '5-cleaning-tips-to-help-make-your-office-relocation-seamless',
      '6-common-cleaning-products-that-you-should-never-mix-together',
      'areas-in-your-office-where-germs-are-likely-hiding',
      'ask-the-office-cleaners-cleaning-break-rooms',
      'benefits-of-commercial-deep-cleaning-services',
      'cleaning-check-list-dental-clinics',
      'cleaning-protocols-for-daycares-and-schools',
      'commercial-cleaning-air-quality',
      'commercial-cleaning-techniques-to-avoid',
      'day-night-which-is-the-best-routine-for-your-office',
      'how-to-decide-on-a-cleaning-company',
      'how-to-keep-your-office-fridge-clean',
      'how-to-properly-dust-office-building',
      'keep-your-office-at-home-clean',
      'office-layout-tips-to-make-cleaning-easier-and-faster',
      'robotic-vs-manual-cleaning-which-will-ultimately-succeed',
      'seasonal-office-cleaning-checklist',
    ];
    const targets = new Set<string>();
    for (const slug of rewritten) {
      const line = post(slug).body.trim().split('\n').filter(Boolean).pop()!;
      const found = links(line);
      expect(found.some(([, href]) => offerHub(href)), slug).toBe(true);
      for (const [, href] of found) targets.add(href);
      expect(found.length, slug).toBeLessThanOrEqual(2);
    }
    // The point of N6: the anchors now vary with the post, not two for all 18.
    expect(targets.size).toBeGreaterThanOrEqual(6);
  });
});

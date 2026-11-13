/**
 * Service-page copy fixes of the SEO audit of 11 Nov 2026 (12 Nov 2026):
 * content N-A, N-B, N-D; onpage N1, N2, N3, N5; images N9.
 *
 * Read off the Markdown sources, not a build: every check here is about what
 * the content files say, and the build tests already prove they render. Kept
 * cheap so it can run alongside the build suites without competing for CPU.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '..');

function page(rel: string) {
  const src = fs.readFileSync(path.join(repo, 'src/content', rel), 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`no front matter in ${rel}`);
  const [, front, body] = m;
  const field = (name: string) => front.match(new RegExp(`^${name}: "([^"]*)"`, 'm'))?.[1] ?? '';
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((h) => h[1].trim());
  const faqs = [...front.matchAll(/^\s+- q: "([^"]*)"/gm)].map((q) => q[1]);
  const related = [...front.matchAll(/^\s+- title: "([^"]*)"\n\s+href: "([^"]*)"/gm)].map((r) => ({
    title: r[1],
    href: r[2],
  }));
  return { front, body, field, h2s, faqs, related };
}

const commercial = () => page('services/commercial-cleaning.md');
const janitorial = () => page('services/janitorial-services.md');
const office = () => page('services/office-cleaning.md');
const property = () => page('industries/property-management.md');
const maintenance = () => page('services/building-maintenance.md');

const isDifferenceFaq = (q: string) => /difference between/i.test(q) && /janitorial/i.test(q) && /commercial/i.test(q);

describe('one page defines janitorial service (content N-A, onpage N3)', () => {
  it('the commercial opener defines commercial cleaning, not janitorial services', () => {
    const { field } = commercial();
    expect(field('summary')).toMatch(/^Commercial cleaning is the routine, periodic and one-off cleaning/);
    expect(field('summary')).not.toMatch(/janitorial/i);
  });

  it('no commercial H2 is about janitorial services, apart from the comparison table', () => {
    const { h2s } = commercial();
    expect(h2s).not.toContain('What commercial cleaning and janitorial services are');
    expect(h2s).not.toContain('Janitorial services: the daily upkeep');
    expect(h2s).toContain('What commercial cleaning covers');
    expect(h2s).toContain('Routine upkeep between periodic work');
    expect(h2s.filter((h) => /janitorial/i.test(h))).toEqual(['Commercial cleaning, janitorial or office cleaning?']);
  });

  it('the routine-upkeep section is two sentences and links the janitorial page', () => {
    const { body } = commercial();
    const section = body.split('## Routine upkeep between periodic work')[1].split('\n## ')[0].trim();
    expect(section.split(/\n\n/)).toHaveLength(1);
    expect(section.replace(/\([^)]*\)/g, '').match(/[.!?](\s|$)/g)).toHaveLength(2);
    expect(section).toContain('](/services/janitorial-services/)');
  });

  it('the "difference" FAQ lives on the janitorial page only', () => {
    expect(commercial().faqs.filter(isDifferenceFaq)).toEqual([]);
    expect(janitorial().faqs.filter(isDifferenceFaq)).toHaveLength(1);
  });
});

describe('the janitorial page does not repeat itself (content N-B)', () => {
  it('has no second definition under its own heading', () => {
    const { h2s, body } = janitorial();
    expect(h2s).not.toContain('What janitorial services are');
    expect(body).not.toMatch(/Janitorial services are the scheduled/);
  });

  it('keeps the facts of the removed definition in the opener', () => {
    const summary = janitorial().field('summary');
    expect(summary).toMatch(/^Janitorial services are the scheduled upkeep of a building/);
    for (const fact of ['since 1989', 'after hours or at weekends', 'ready each morning'])
      expect(summary).toContain(fact);
    /* 13 Nov 2026, SEO audit 11 Nov (geo N9): the opener was trimmed to under
       300 characters and the office address moved to the body's "Who does
       the work, and when?". It must still be on the page. */
    expect(janitorial().body).toContain('243 Queen St W');
  });

  it('leaves the contract steps to the shared "How it works" block', () => {
    const { h2s, front, body } = janitorial();
    expect(h2s).not.toContain('How a janitorial contract starts');
    expect(front).toMatch(/^showProcess: true$/m);
    expect(body).toContain('](/our-process/)');
  });
});

describe('descriptions lead with the answer, not the title (content N-D)', () => {
  it.each([
    ['commercial cleaning', commercial],
    ['janitorial services', janitorial],
  ])('%s', (_name, get) => {
    const p = get();
    const description = p.field('description');
    const titleWords = p.field('title').toLowerCase().split(/\s+/).slice(0, 2).join(' ');
    expect(description.toLowerCase().startsWith(titleWords)).toBe(false);
    expect(description.length).toBeGreaterThanOrEqual(120);
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe('internal links (onpage N1, N2, N5)', () => {
  it('commercial cleaning links the quote checklist where it discusses choosing a company', () => {
    const section = commercial().body.split('## Choosing a commercial cleaning company')[1];
    expect(section).toContain('](/commercial-cleaning-quote-checklist/)');
  });

  it('the janitorial page has a Related card to the quote checklist', () => {
    expect(janitorial().related.map((r) => r.href)).toContain('/commercial-cleaning-quote-checklist/');
  });

  it.each([
    ['office cleaning', office],
    ['property management', property],
  ])('%s links the janitorial page in its body', (_name, get) => {
    expect(get().body).toContain('](/services/janitorial-services/)');
  });

  it.each([
    ['office cleaning', office],
    ['commercial cleaning', commercial],
  ])('%s names the cost guide by its H1', (_name, get) => {
    const guide = fs.readFileSync(path.join(repo, 'src/content/blog/office-cleaning-cost-toronto-guide.md'), 'utf8');
    const h1 = guide.match(/^title: "([^"]*)"/m)![1];
    const card = get().related.find((r) => r.href === '/office-cleaning-cost-toronto-guide/');
    expect(card?.title.toLowerCase()).toBe(h1.toLowerCase());
  });
});

describe('hero alt text names the subject in the service context (images N9)', () => {
  it.each([
    ['property management', property, 'Empty corridor in a modern building', /corridor/],
    ['building maintenance', maintenance, 'Office skyscrapers in downtown Toronto', /maintenance/],
  ])('%s', (_name, get, old, subject) => {
    const alt = get().field('imageAlt');
    expect(alt).not.toBe(old);
    expect(alt).toMatch(subject);
    expect(alt.split(/\s+/).length).toBeLessThanOrEqual(16);
    expect(alt).not.toMatch(/\b(our|Evergreen)\b/);
  });
});

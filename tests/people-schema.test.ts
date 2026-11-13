/**
 * People, credentials and memberships in the structured data (13 Nov 2026,
 * comparison with impact.ca, item 2).
 *
 * src/data/people.ts is empty until the client supplies real names and
 * credentials, so these tests check two things: that the empty lists change
 * nothing (no founder, employee, hasCredential or memberOf, and the company
 * stays every post's author), and that a filled list produces the right
 * nodes. The filled cases use an obviously fictional fixture passed straight
 * to the builders; it never reaches the site.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { credentials, memberships, people, resolveAuthor, type Person } from '../src/data/people';
import { articleSchema, organizationGraph, personNode } from '../src/lib/schema';
import { site } from '../src/data/site';

type Node = Record<string, any>;
const orgOf = (g: Node) => g['@graph'].find((n: Node) => n['@type'] === 'ProfessionalService') as Node;

const FIXTURE: Person[] = [
  {
    id: 'test-founder',
    name: 'Test Founder',
    jobTitle: 'Founder',
    role: 'founder',
    sameAs: ['https://example.com/test-founder'],
    credentials: [{ name: 'Example Credential', credentialCategory: 'certification', recognizedBy: { name: 'Example Body' } }],
  },
  { id: 'test-staff', name: 'Test Staff', jobTitle: 'Account Executive', role: 'employee' },
];

describe('with the lists empty, as shipped', () => {
  const org = orgOf(organizationGraph());

  it('the lists are empty: nothing about people is claimed without the client', () => {
    expect(people).toHaveLength(0);
    expect(credentials).toHaveLength(0);
    expect(memberships).toHaveLength(0);
  });

  it('the organisation carries no founder, employee, hasCredential or memberOf', () => {
    for (const key of ['founder', 'employee', 'hasCredential', 'memberOf']) expect(org).not.toHaveProperty(key);
  });

  it('knowsAbout names exactly the catalog services', () => {
    const catalog = org.hasOfferCatalog.itemListElement.map((o: Node) => o.itemOffered.name);
    expect(org.knowsAbout).toEqual(catalog);
    expect(org.knowsAbout).toContain('Office Cleaning');
    expect(org.knowsAbout).toHaveLength(11);
  });

  it('a post with no author is credited to the company', () => {
    const a = articleSchema({ title: 'T', pubDate: new Date('2026-01-01'), slug: 'x' }) as Node;
    expect(a.author).toMatchObject({ '@type': 'Organization', '@id': `${site.url}/#organization` });
  });

  it('every author a post names is in src/data/people.ts', () => {
    const dir = join(__dirname, '../src/content/blog');
    const named = readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => [f, /^---[\s\S]*?^author:\s*(.+)$[\s\S]*?^---/m.exec(readFileSync(join(dir, f), 'utf8'))?.[1]] as const)
      .filter(([, id]) => id);
    for (const [file, id] of named) expect(() => resolveAuthor(id!.trim().replace(/^['"]|['"]$/g, '')), file).not.toThrow();
  });
});

describe('with people supplied (fictional fixture)', () => {
  const org = orgOf(organizationGraph({ people: FIXTURE, credentials: [], memberships: [{ name: 'Example Association', url: 'https://example.org/' }] }));

  it('splits founders from staff', () => {
    expect(org.founder.map((p: Node) => p.name)).toEqual(['Test Founder']);
    expect(org.employee.map((p: Node) => p.name)).toEqual(['Test Staff']);
  });

  it('each person works for the organisation and has a stable @id', () => {
    expect(org.founder[0]).toMatchObject({
      '@type': 'Person',
      '@id': `${site.url}/about-us/#person-test-founder`,
      jobTitle: 'Founder',
      worksFor: { '@id': `${site.url}/#organization` },
      sameAs: ['https://example.com/test-founder'],
    });
    expect(org.founder[0].hasCredential[0]).toEqual({
      '@type': 'EducationalOccupationalCredential',
      name: 'Example Credential',
      credentialCategory: 'certification',
      recognizedBy: { '@type': 'Organization', name: 'Example Body' },
    });
  });

  it('emits only the fields supplied', () => {
    expect(Object.keys(personNode(FIXTURE[1])).sort()).toEqual(['@id', '@type', 'jobTitle', 'name', 'worksFor']);
  });

  it('memberships become memberOf; no credentials means no hasCredential', () => {
    expect(org.memberOf).toEqual([{ '@type': 'Organization', name: 'Example Association', url: 'https://example.org/' }]);
    expect(org).not.toHaveProperty('hasCredential');
  });

  it('a post author is the same Person as on the organisation', () => {
    const a = articleSchema({ title: 'T', pubDate: new Date('2026-01-01'), slug: 'x', author: FIXTURE[0] }) as Node;
    expect(a.author['@id']).toBe(org.founder[0]['@id']);
    expect(a.author.name).toBe('Test Founder');
  });

  it('an unknown author id throws rather than silently crediting the company', () => {
    expect(() => resolveAuthor('nobody', FIXTURE)).toThrow(/not in src\/data\/people.ts/);
    expect(resolveAuthor('test-staff', FIXTURE)?.name).toBe('Test Staff');
    expect(resolveAuthor(undefined, FIXTURE)).toBeUndefined();
  });
});

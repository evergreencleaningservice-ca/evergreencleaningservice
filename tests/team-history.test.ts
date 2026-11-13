/**
 * The team page and the About timeline are both gated on real data (13 Nov
 * 2026, comparison with impact.ca). These tests prove each gate both ways:
 * with the data as shipped, nothing is built or linked; with a filled list,
 * the model is right. The filled cases use obviously fictional fixtures
 * passed straight to the helpers; they never reach src/data/ or the site.
 * tests/build/schema-layout.test.ts checks the built site agrees.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { people, type Person } from '../src/data/people';
import { history, timeline, TIMELINE_MIN, type Milestone } from '../src/data/history';
import { hasTeam, personPageUrl, teamModel, teamUrl, TEAM_PATH } from '../src/lib/team';
import { organizationGraph, personNode } from '../src/lib/schema';
import { site } from '../src/data/site';

type Node = Record<string, any>;
const repo = path.resolve(import.meta.dirname, '..');

const FIXTURE: Person[] = [
  {
    id: 'test-founder',
    name: 'Test Founder',
    jobTitle: 'Founder',
    role: 'founder',
    description: 'A fictional person for this test.',
    image: '/images/test-founder.jpg',
    credentials: [{ name: 'Example Credential', credentialCategory: 'certification', recognizedBy: { name: 'Example Body' } }],
  },
  { id: 'test-staff', name: 'Test Staff', jobTitle: 'Account Executive', role: 'employee' },
];

describe('the team page, with src/data/people.ts empty as shipped', () => {
  it('is not built and nothing links to it', () => {
    expect(people).toHaveLength(0);
    expect(hasTeam()).toBe(false);
    expect(teamUrl()).toBeUndefined();
    expect(teamModel()).toBeUndefined();
    expect(personPageUrl(FIXTURE[0])).toBeUndefined();
  });

  it('is not in llms.txt', () => {
    expect(fs.readFileSync(path.join(repo, 'public/llms.txt'), 'utf8')).not.toContain('/team/');
  });
});

describe('the team page, with people supplied (fictional fixture)', () => {
  const model = teamModel(FIXTURE)!;

  it('is built at /team/ and linked', () => {
    expect(hasTeam(FIXTURE)).toBe(true);
    expect(teamUrl(FIXTURE)).toBe(TEAM_PATH);
    expect(personPageUrl(FIXTURE[1], FIXTURE)).toBe('/team/#test-staff');
    expect(personPageUrl({ ...FIXTURE[1], id: 'not-listed' }, FIXTURE)).toBeUndefined();
  });

  it('shows each person, with only the fields supplied', () => {
    expect(model.members).toEqual([
      {
        id: 'test-founder',
        name: 'Test Founder',
        jobTitle: 'Founder',
        description: 'A fictional person for this test.',
        image: '/images/test-founder.jpg',
        imageAlt: 'Test Founder, Founder',
        credentials: FIXTURE[0].credentials,
      },
      { id: 'test-staff', name: 'Test Staff', jobTitle: 'Account Executive', credentials: [] },
    ]);
  });

  it('a photo is never shown without alt text that names the person', () => {
    for (const m of model.members) if (m.image) expect(m.imageAlt).toContain(m.name);
  });

  it("puts each Person in the page's JSON-LD with the organisation's @id for them", () => {
    const graph = model.schema['@graph'] as Node[];
    const persons = graph.filter((n) => n['@type'] === 'Person');
    expect(persons).toEqual(FIXTURE.map(personNode));
    const org = (organizationGraph({ people: FIXTURE, credentials: [], memberships: [] })['@graph'] as Node[]).find(
      (n) => n['@type'] === 'ProfessionalService',
    )!;
    expect(persons.map((p) => p['@id'])).toEqual([org.founder[0]['@id'], org.employee[0]['@id']]);
    expect(persons[0]['@id']).toBe(`${site.url}/team/#person-test-founder`);
    const page = graph.find((n) => n['@type'] === 'WebPage')!;
    expect(page['@id']).toBe(`${site.url}/team/`);
    expect(page.mainEntity.itemListElement.map((i: Node) => i.item['@id'])).toEqual(persons.map((p) => p['@id']));
    expect(graph.some((n) => n['@type'] === 'BreadcrumbList')).toBe(true);
  });
});

describe('the About timeline', () => {
  const m = (year: number, text = `Fictional event ${year}.`): Milestone => ({ year, text, source: 'test fixture' });

  it('holds only the founding year, from the repo, with its source', () => {
    expect(history.map((h) => h.year)).toEqual([1989]);
    expect(history[0].year).toBe(site.since);
    expect(history[0].month).toBeUndefined();
    expect(history[0].source).toMatch(/src\/content\/pages\/about-us\.md/);
    for (const h of history) expect(h.source.trim()).not.toBe('');
  });

  it('does not claim a date for the change of name, which the repo does not give', () => {
    expect(history.filter((h) => /name|renam|formerly/i.test(h.text))).toEqual([]);
  });

  it(`draws nothing with fewer than ${TIMELINE_MIN} milestones, as shipped`, () => {
    expect(timeline()).toEqual([]);
    expect(timeline([m(2000), m(2010)])).toEqual([]);
  });

  it(`draws all of them, oldest first, from ${TIMELINE_MIN}`, () => {
    const list = [{ ...m(2010, 'June 2010.'), month: 6 }, m(1989), { ...m(2010, 'March 2010.'), month: 3 }];
    expect(timeline(list).map((x) => x.text)).toEqual(['Fictional event 1989.', 'March 2010.', 'June 2010.']);
  });
});

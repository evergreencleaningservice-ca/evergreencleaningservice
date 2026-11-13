/**
 * SEO audit 11 Nov 2026 (local L2, schema N7), fixed 13 Nov 2026: East York
 * and York are former boroughs inside the City of Toronto, so `areaServed`
 * gives each as a Place contained in Toronto rather than a City beside it.
 * Every other place keeps its plain City node, and the organisation and
 * every Service node carry the same list.
 *
 * A fast check on the schema helpers; tests/build/schema-layout.test.ts
 * checks the same on the built pages.
 */
import { describe, expect, it } from 'vitest';
import { PLACES_WITHIN_TORONTO, SERVICE_LOCATION_SUGGESTIONS } from '../src/data/coverage';
import { organizationGraph, serviceSchema } from '../src/lib/schema';

type Node = Record<string, any>;

const org = (organizationGraph() as Node)['@graph'].find((n: Node) => n['@type'] === 'ProfessionalService') as Node;
const service = serviceSchema({ name: 'Office Cleaning', url: '/office-cleaning/' }) as Node;

describe('areaServed typing', () => {
  it('lists only East York and York as places within Toronto', () => {
    expect([...PLACES_WITHIN_TORONTO]).toEqual(['East York', 'York']);
    for (const name of PLACES_WITHIN_TORONTO) expect(SERVICE_LOCATION_SUGGESTIONS).toContain(name);
  });

  it('gives East York and York as a Place contained in the City of Toronto', () => {
    for (const name of ['East York', 'York']) {
      expect(org.areaServed.find((a: Node) => a.name === name)).toEqual({
        '@type': 'Place',
        name,
        containedInPlace: { '@type': 'City', name: 'Toronto' },
      });
    }
  });

  it('keeps every other place a plain City, in the coverage order', () => {
    expect(org.areaServed.map((a: Node) => a.name)).toEqual([...SERVICE_LOCATION_SUGGESTIONS]);
    const others = org.areaServed.filter((a: Node) => !PLACES_WITHIN_TORONTO.includes(a.name));
    expect(others.length).toBe(SERVICE_LOCATION_SUGGESTIONS.length - 2);
    for (const area of others) expect(area).toEqual({ '@type': 'City', name: area.name });
    expect(others.map((a: Node) => a.name)).toEqual(
      expect.arrayContaining(['Toronto', 'North York', 'Scarborough', 'Etobicoke']),
    );
  });

  it('gives the Service node the same list as the organisation', () => {
    expect(service.areaServed).toEqual(org.areaServed);
  });
});

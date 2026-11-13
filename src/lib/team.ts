/**
 * The team page's gate and model (13 Nov 2026, comparison with impact.ca).
 *
 * impact.ca puts its people on a page of their own. This site can only do
 * that once the client has named real people and agreed to publish them, so
 * /team/ follows the /projects/ rule (src/lib/projects.ts): with no one in
 * src/data/people.ts there is no page, no link to it from anywhere and
 * nothing in the sitemap or llms.txt, rather than an empty "meet the team"
 * page. Everything that links to /team/ asks `teamUrl()` first, so the page
 * and its links appear together on the build after the first person is added.
 *
 * Each helper takes the list as an argument (defaulting to the real one) so
 * the tests can prove the gate both ways with a fictional fixture that never
 * reaches the site.
 */
import { people, type Credential, type Person } from '../data/people';
import { breadcrumbSchema, personNode } from './schema';
import { site } from '../data/site';

/** The page's path. */
export const TEAM_PATH = '/team/';

/** Whether the team page is built: at least one person. */
export const hasTeam = (list: readonly Person[] = people): boolean => list.length > 0;

/** The team page's URL, or undefined while it is not built. Links use this. */
export const teamUrl = (list: readonly Person[] = people): string | undefined =>
  hasTeam(list) ? TEAM_PATH : undefined;

/**
 * Where a person is described on the team page: `/team/#<id>`, or undefined
 * when the team page is not built or the person is not on it. The blog byline
 * links here.
 */
export const personPageUrl = (p: Person, list: readonly Person[] = people): string | undefined =>
  hasTeam(list) && list.some((q) => q.id === p.id) ? `${TEAM_PATH}#${p.id}` : undefined;

export interface TeamMember {
  /** The HTML id, so /team/#<id> lands on the person. */
  id: string;
  name: string;
  jobTitle: string;
  description?: string;
  image?: string;
  /** Names the person, so the photo is never "a person" to a screen reader. */
  imageAlt?: string;
  credentials: readonly Credential[];
}

export interface TeamModel {
  members: TeamMember[];
  /** The page's own JSON-LD: the page, its trail and each Person, with the
      same @id the organisation's founder and employee nodes use. */
  schema: Record<string, unknown>;
}

/** The team page's content, or undefined while there is no one to show. */
export function teamModel(list: readonly Person[] = people): TeamModel | undefined {
  if (!hasTeam(list)) return undefined;
  const url = `${site.url}${TEAM_PATH}`;
  const members = list.map((p) => ({
    id: p.id,
    name: p.name,
    jobTitle: p.jobTitle,
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: p.image, imageAlt: `${p.name}, ${p.jobTitle}` } : {}),
    credentials: p.credentials ?? [],
  }));
  const nodes = list.map(personNode);
  const { '@context': _ctx, ...trail } = breadcrumbSchema([{ name: site.name, url: '/' }, { name: 'Our team' }]);
  return {
    members,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': url,
          url,
          name: 'Our team',
          about: { '@id': `${site.url}/#organization` },
          mainEntity: { '@type': 'ItemList', itemListElement: nodes.map((n, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@id': n['@id'] } })) },
        },
        trail,
        ...nodes,
      ],
    },
  };
}

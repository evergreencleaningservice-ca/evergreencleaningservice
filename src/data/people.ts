/**
 * People, credentials and memberships, for the structured data (13 Nov 2026,
 * comparison with impact.ca, item 2).
 *
 * impact.ca names its team, signs its blog posts with a person and lists its
 * accreditations and association memberships. This site names nobody: every
 * post's author is the company, and the organisation node carries no founder,
 * staff, credential or membership. These lists are where those facts go.
 *
 * THEY ARE EMPTY ON PURPOSE. Nothing here may be invented: a made-up person,
 * job title, certificate or membership is a false claim to clients and a
 * structured-data policy violation. Fill an entry only from facts the client
 * has supplied, with their permission to publish the name, and only a
 * credential or membership that can be shown (a certificate, a member
 * directory listing). Until then the schema emits exactly what it did before.
 *
 * What each list does once it has entries:
 *  - `people`: each person becomes a `Person` on the organisation, as
 *    `founder` (role 'founder') or `employee`. A blog post whose front matter
 *    sets `author: <id>` is credited to that person, in its BlogPosting
 *    schema and in a visible byline, instead of to the company. The build
 *    fails if a post names an id that is not here
 *    (and tests/people-schema.test.ts checks it without a build).
 *  - `credentials`: the company's own certifications (e.g. a cleaning
 *    industry standard), as `hasCredential` on the organisation.
 *  - `memberships`: associations the company belongs to, as `memberOf`.
 */

export interface Credential {
  /** The credential's name as the issuer writes it. */
  name: string;
  /** e.g. 'certification', 'licence', 'certificate'. */
  credentialCategory: string;
  /** The body that grants it. */
  recognizedBy?: { name: string; url?: string };
  /** A public page that verifies it, if there is one. */
  url?: string;
}

export interface Person {
  /** Lower-case slug, used in front matter (`author: <id>`) and the @id. */
  id: string;
  name: string;
  jobTitle: string;
  /** 'founder' becomes `founder` on the organisation; anything else `employee`. */
  role: 'founder' | 'employee';
  /** One or two sentences, in the client's own words. */
  description?: string;
  /** A site-relative photo path, only with the person's permission. */
  image?: string;
  /** Public profiles (e.g. LinkedIn) that are this person. */
  sameAs?: string[];
  /** Topics the person can speak to with authority. */
  knowsAbout?: string[];
  /** Personal credentials (training, certification). */
  credentials?: Credential[];
}

export interface Membership {
  name: string;
  url?: string;
}

export const people: readonly Person[] = [];

export const credentials: readonly Credential[] = [];

export const memberships: readonly Membership[] = [];

/**
 * When the team page's content last changed: its sitemap <lastmod>
 * (src/lib/sitemap-lastmod.mjs), as a location's `updated` field dates a
 * location page. 13 Nov 2026 (comparison with impact.ca).
 *
 * THE RULE. Set it to the date and time of the edit (ISO 8601, UTC) whenever
 * an edit adds, removes or changes a person in `people`. Leave it undefined
 * while `people` is empty: there is no /team/ page to date.
 * tests/team-history.test.ts fails if people has entries and this is unset.
 */
export const TEAM_UPDATED: string | undefined = undefined;

export const personById = (id: string, list: readonly Person[] = people): Person | undefined =>
  list.find((p) => p.id === id);

/**
 * A post's author, from its front matter. Undefined means the company. An id
 * that matches nobody throws, so a typo fails the build instead of quietly
 * crediting the company.
 */
export function resolveAuthor(id: string | undefined, list: readonly Person[] = people): Person | undefined {
  if (!id) return undefined;
  const p = personById(id, list);
  if (!p) throw new Error(`Post author "${id}" is not in src/data/people.ts`);
  return p;
}

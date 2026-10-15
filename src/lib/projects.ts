/**
 * The publish gate for case studies (src/content/projects).
 *
 * A case study is evidence, so publishing one is a claim the business has to
 * be able to stand behind. A `published` entry must satisfy every rule below
 * or the BUILD FAILS — a missing approval is caught before deploy rather than
 * after a prospect reads it.
 *
 *   - every photograph is marked approved by the client;
 *   - a testimonial, if present, is marked approved;
 *   - a client name appears only if naming them was approved;
 *   - outcomes, if stated, record who verified them;
 *   - there is something to say: needs, scope and at least one photo or an
 *     approved testimonial.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { publishProblems } from './project-gate';

export type Project = CollectionEntry<'projects'>;

/** Published, approved case studies only. Throws on a published entry that fails the gate. */
export async function publishedProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  const published = all.filter((p) => p.data.status === 'published');
  for (const p of published) {
    const problems = publishProblems(p.data);
    if (problems.length) {
      throw new Error(`projects/${p.id} is marked published but ${problems.join('; ')}.`);
    }
  }
  return published;
}

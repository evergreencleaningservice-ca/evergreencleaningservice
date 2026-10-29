/**
 * @vitest-environment node
 *
 * Every path the Worker answers must reach it.
 *
 * `run_worker_first` in wrangler.jsonc is a whitelist: once it exists, a path
 * not on it is answered by the asset layer and never reaches the Worker — a
 * POST gets a bare 405. When the list was added on 2026-10-17 it left out
 * /api/submit-lead, and every quote form on the site failed for twelve days
 * with nothing in any log. This reads the routes out of src/worker.ts and
 * checks each one is covered.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repo = path.resolve(import.meta.dirname, '../..');
const read = (f: string) => fs.readFileSync(path.join(repo, f), 'utf8');

/** wrangler.jsonc without its comments, which are all whole-line `//` ones. */
const config = JSON.parse(
  read('wrangler.jsonc')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,(\s*[}\]])/g, '$1')
) as { assets: { run_worker_first: string[] } };

const patterns = config.assets.run_worker_first;
const covered = (p: string) =>
  patterns.some((pat) => (pat.endsWith('/*') ? p.startsWith(pat.slice(0, -1)) : p === pat));

describe('run_worker_first', () => {
  const routes = [...read('src/worker.ts').matchAll(/url\.pathname === '([^']+)'/g)].map((m) => m[1]);

  it('the Worker has routes to check', () => {
    expect(routes).toContain('/api/submit-lead');
  });

  it('covers every route the Worker answers', () => {
    expect(routes.filter((r) => !covered(r))).toEqual([]);
  });
});

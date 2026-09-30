/**
 * Refuses a deploy from anything but a clean checkout of `main` that matches
 * `origin/main`.
 *
 * Staging and production are one Worker, and a deploy replaces whatever it is
 * serving. On 2026-09-28 staging was deployed from a feature branch that had
 * never been merged and that predated the image-host move, so it pointed every
 * photo at a hostname that had just been deleted. The fix lived on another
 * unmerged branch, and nothing showed the two had diverged until the images
 * broke. If every deploy comes from `main`, what is deployed is what is merged.
 *
 * Checked, in order:
 *   - the checked-out branch is `main`
 *   - the working tree has no changes, staged or not (an uncommitted edit
 *     would ship without ever reaching the repository)
 *   - HEAD equals `main` on origin right now (a stale or unpushed `main`
 *     would ship something nobody else can see)
 *
 * GitHub Actions checks out the pushed commit on a detached HEAD, so there the
 * branch comes from GITHUB_REF instead. The last check still has to pass, which
 * is what stops a run for an older push from deploying over a newer one.
 *
 * Runs first in `npm run deploy` and `npm run deploy:preview`, and so in
 * .github/workflows/deploy-staging.yml.
 */
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const refuse = (why) => {
  console.error(`deploy-guard: ${why}`);
  console.error('deploy-guard: deploys go out from main only. Merge the branch, then deploy from an up-to-date main.');
  process.exit(1);
};

let branch = git('rev-parse', '--abbrev-ref', 'HEAD');
if (branch === 'HEAD' && process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REF?.startsWith('refs/heads/')) {
  branch = process.env.GITHUB_REF.slice('refs/heads/'.length);
}
if (branch !== 'main') refuse(`checked out on "${branch}", not main.`);

if (git('status', '--porcelain') !== '') refuse('the working tree has uncommitted changes.');

/* ls-remote rather than fetch + origin/main: a shallow CI checkout may not
   track origin/main at all, and this asks the one question that matters. */
let remote;
try {
  remote = git('ls-remote', 'origin', 'refs/heads/main').split(/\s/)[0];
} catch {
  refuse('could not reach origin, so cannot prove this checkout matches main.');
}
if (!remote) refuse('origin has no main branch.');

const head = git('rev-parse', 'HEAD');
if (head !== remote) {
  refuse(`HEAD ${head.slice(0, 7)} is not origin/main ${remote.slice(0, 7)} — pull or push first.`);
}

console.log(`deploy-guard: deploying main at ${head.slice(0, 7)}.`);

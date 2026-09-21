/**
 * Find the Chromium binary the measurement scripts drive.
 *
 * WHY THIS IS A MODULE AND NOT A ONE-LINER IN EACH SCRIPT. Seven scripts in
 * this directory launch a browser, and before this existed they disagreed
 * about how to find it. Five used `/opt/pw-browsers/chromium` directly, one
 * appended `/chrome-linux/chrome` to that same path, and one had no fallback
 * at all. The odd one out was `measure.mjs`, and the result was Lighthouse
 * reporting
 *
 *     The CHROME_PATH environment variable must be set to a Chrome/Chromium
 *     executable no older than Chrome stable
 *
 * on a machine where Chromium was installed and every other script was using
 * it happily. `perf-matrix.mjs` had the same defect and had to be run with an
 * environment-variable workaround for the Phase 13 audit.
 *
 * WHAT MAKES IT AWKWARD is that `/opt/pw-browsers/chromium` is a SYMLINK TO
 * THE BINARY in this container, while on another machine the same-looking
 * path may be the DIRECTORY that contains the binary. Both spellings are
 * reasonable and neither is guessable, so this resolves all four shapes:
 *
 *   an executable file                  → used as-is
 *   a symlink resolving to an executable → followed, then used
 *   a directory containing the binary    → searched at the known layouts
 *   an explicit CHROME_PATH              → tried first, and if it is set but
 *                                          unusable that is an ERROR rather
 *                                          than a silent fallback, because a
 *                                          deliberate override that is quietly
 *                                          ignored is worse than one that fails
 */
import fs from 'node:fs';
import path from 'node:path';

/** Where a Playwright/Chrome install puts the binary inside its directory. */
const INSIDE_DIR = [
  'chrome-linux/chrome',
  'chrome-linux64/chrome',
  'chrome-linux/headless_shell',
  'chrome',
  'headless_shell',
];

/** Candidates tried in order when nothing is specified. */
export const DEFAULT_CANDIDATES = [
  '/opt/pw-browsers/chromium',
  '/opt/pw-browsers/chromium-1194',
  '/opt/pw-browsers/chromium_headless_shell-1194',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
];

const isExecutableFile = (p) => {
  try {
    if (!fs.statSync(p).isFile()) return false;
    fs.accessSync(p, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve ONE candidate to an executable, or null.
 *
 * `fs.statSync` follows symlinks, so a link to the binary already answers
 * `isFile()`; the explicit `realpathSync` is for reporting a resolved path
 * rather than the link, which is what makes a failure message useful.
 */
export function resolveCandidate(candidate) {
  if (!candidate) return null;
  let p;
  try {
    p = fs.realpathSync(candidate);
  } catch {
    return null;
  }

  if (isExecutableFile(p)) return p;

  let stat;
  try {
    stat = fs.statSync(p);
  } catch {
    return null;
  }
  if (!stat.isDirectory()) return null;

  for (const rel of INSIDE_DIR) {
    const inside = path.join(p, rel);
    if (isExecutableFile(inside)) return inside;
  }
  return null;
}

/**
 * The browser to launch.
 *
 * Throws with every path it tried rather than returning null, because every
 * caller's only sensible response to "no browser" is to stop, and a thrown
 * message naming the candidates is the difference between a one-line fix and
 * a chrome-launcher stack trace.
 */
export function findChrome({ env = process.env, candidates = DEFAULT_CANDIDATES } = {}) {
  if (env.CHROME_PATH) {
    const explicit = resolveCandidate(env.CHROME_PATH);
    if (explicit) return explicit;
    throw new Error(
      `CHROME_PATH is set to "${env.CHROME_PATH}" but no executable was found there.\n` +
        'Point it at the browser binary, a symlink to it, or the directory containing it.'
    );
  }

  for (const candidate of candidates) {
    const found = resolveCandidate(candidate);
    if (found) return found;
  }

  throw new Error(
    `No Chromium executable found. Tried:\n  ${candidates.join('\n  ')}\n` +
      'Set CHROME_PATH to the binary, a symlink to it, or the directory containing it.'
  );
}

/** Resolve, or exit(2) with the message. For scripts, where a stack is noise. */
export function requireChrome(options) {
  try {
    return findChrome(options);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

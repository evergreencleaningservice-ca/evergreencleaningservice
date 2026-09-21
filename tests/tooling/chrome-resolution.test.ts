/**
 * @vitest-environment node
 *
 * The browser resolver the measurement scripts share.
 *
 * WHY A TEST FOR A HELPER THAT FINDS A FILE. Because getting it wrong cost
 * this project two measurement runs and produced an error message that
 * pointed at the wrong thing. `measure.mjs` defaulted to
 * `/opt/pw-browsers/chromium/chrome-linux/chrome`, appending a subpath to
 * what is a SYMLINK TO THE BINARY, and chrome-launcher then reported
 *
 *     The CHROME_PATH environment variable must be set to a Chrome/Chromium
 *     executable no older than Chrome stable
 *
 * on a machine where Chromium was installed and five other scripts in the
 * same directory were using it happily. `perf-matrix.mjs` had no resolution
 * at all and had to be run with an environment-variable workaround.
 *
 * Both spellings are legitimate — on one machine the path is the binary, on
 * another it is the directory containing it — so the resolver has to accept
 * both, and a test is the only way to keep it accepting both. The fixtures
 * below are built on a real filesystem rather than mocked, because what is
 * under test is filesystem behaviour: `realpathSync` following a link, and
 * `statSync` distinguishing a file from a directory.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { findChrome, resolveCandidate, DEFAULT_CANDIDATES } from '../../scripts/lib/chrome.mjs';

let tmp: string;
/** A real executable file. */
let binary: string;
/** A symlink pointing at it. */
let link: string;
/** A directory laid out the way Playwright lays one out. */
let dir: string;
/** A directory with nothing usable in it. */
let empty: string;
/** A file that exists but is not executable. */
let notExecutable: string;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-resolve-'));

  binary = path.join(tmp, 'chrome');
  fs.writeFileSync(binary, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(binary, 0o755);

  link = path.join(tmp, 'chromium-link');
  fs.symlinkSync(binary, link);

  dir = path.join(tmp, 'chromium-dir');
  fs.mkdirSync(path.join(dir, 'chrome-linux'), { recursive: true });
  const inside = path.join(dir, 'chrome-linux', 'chrome');
  fs.writeFileSync(inside, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(inside, 0o755);

  empty = path.join(tmp, 'empty-dir');
  fs.mkdirSync(empty);

  notExecutable = path.join(tmp, 'readme.txt');
  fs.writeFileSync(notExecutable, 'not a browser');
  fs.chmodSync(notExecutable, 0o644);
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('resolveCandidate — the four shapes a Chrome path comes in', () => {
  it('accepts an executable file', () => {
    expect(resolveCandidate(binary)).toBe(fs.realpathSync(binary));
  });

  it('follows a symlink that resolves to an executable', () => {
    /* This is the shape that broke `measure.mjs`: `/opt/pw-browsers/chromium`
       is a link to the binary, and the old default treated it as a folder. */
    expect(resolveCandidate(link)).toBe(fs.realpathSync(binary));
  });

  it('searches a directory that contains the executable', () => {
    expect(resolveCandidate(dir)).toBe(path.join(fs.realpathSync(dir), 'chrome-linux', 'chrome'));
  });

  it('rejects a directory with no browser in it', () => {
    expect(resolveCandidate(empty)).toBeNull();
  });

  it('rejects a file that exists but is not executable', () => {
    /* A readable file is not a browser. Returning it would move the failure
       to launch time, where the message is far less useful. */
    expect(resolveCandidate(notExecutable)).toBeNull();
  });

  it('rejects a path that does not exist, and a missing argument', () => {
    expect(resolveCandidate(path.join(tmp, 'nope'))).toBeNull();
    expect(resolveCandidate(undefined)).toBeNull();
    expect(resolveCandidate('')).toBeNull();
  });
});

describe('findChrome', () => {
  it('prefers an explicit CHROME_PATH over every default', () => {
    expect(findChrome({ env: { CHROME_PATH: link }, candidates: [dir] })).toBe(
      fs.realpathSync(binary)
    );
  });

  it('THROWS on an unusable CHROME_PATH rather than falling back', () => {
    /* A deliberate override that is silently ignored is worse than one that
       fails: the run succeeds while measuring something other than what was
       asked for, and nothing says so. */
    expect(() => findChrome({ env: { CHROME_PATH: empty }, candidates: [binary] })).toThrow(
      /CHROME_PATH is set/
    );
  });

  it('falls through the candidate list in order', () => {
    expect(
      findChrome({ env: {}, candidates: [path.join(tmp, 'nope'), empty, dir] })
    ).toBe(path.join(fs.realpathSync(dir), 'chrome-linux', 'chrome'));
  });

  it('names every path it tried when it finds nothing', () => {
    let message = '';
    try {
      findChrome({ env: {}, candidates: [path.join(tmp, 'a'), path.join(tmp, 'b')] });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain(path.join(tmp, 'a'));
    expect(message).toContain(path.join(tmp, 'b'));
  });

  it('finds a real browser in this environment with no CHROME_PATH set', () => {
    /* The regression that started this: both measurement scripts must start
       WITHOUT the workaround environment variable. If this container ever
       stops shipping Chromium the test says so plainly rather than a
       measurement script failing later with a launcher stack trace. */
    const found = findChrome({ env: {} });
    expect(fs.statSync(found).isFile()).toBe(true);
    expect(() => fs.accessSync(found, fs.constants.X_OK)).not.toThrow();
  });

  it('lists the container path first, so the common case costs one stat', () => {
    expect(DEFAULT_CANDIDATES[0]).toBe('/opt/pw-browsers/chromium');
  });
});

describe('every browser-driving script uses the shared resolver', () => {
  /**
   * The point of the helper is that seven scripts stop disagreeing about
   * where Chromium is. Asserted on the source, because the drift is what
   * caused the bug and a new script pasting the old one-liner would
   * reintroduce it without failing anything else.
   */
  const SCRIPTS = [
    'measure.mjs',
    'perf-matrix.mjs',
    'lh-local.mjs',
    'form-a11y.mjs',
    'lp-census.mjs',
    'sticky-clearance.mjs',
    'visual-acceptance.mjs',
  ];

  it.each(SCRIPTS)('%s imports requireChrome', (file) => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../scripts', file),
      'utf8'
    );
    expect(src).toMatch(/from '\.\/lib\/chrome\.mjs'/);
  });

  it.each(SCRIPTS)('%s hardcodes no browser path of its own', (file) => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../scripts', file),
      'utf8'
    );
    /* Comments may name the path while explaining the bug; code may not. */
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/^\s*\*.*$/gm, '');
    expect(code).not.toMatch(/executablePath:\s*['"`]\//);
    expect(code).not.toMatch(/CHROME_PATH:\s*process\.env\.CHROME_PATH\s*\?\?\s*['"`]/);
  });
});

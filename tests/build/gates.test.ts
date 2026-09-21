/**
 * @vitest-environment node
 *
 * Phase 4 — the build-time gates, run as the build runs them.
 *
 * WHY AS CHILD PROCESSES. These tests exist because of a bug they would have
 * caught: `scripts/captcha-check.mjs` imported `../src/lib/captcha-hosts.ts`,
 * which imported `'../data/site'` without an extension. Vite resolves that;
 * bare Node with `--experimental-strip-types` does not. The script crashed
 * with ERR_MODULE_NOT_FOUND on every run — so the gate that is supposed to
 * refuse a build shipping a published captcha key had never once inspected a
 * page, and would have failed the build for the wrong reason while looking
 * like it worked.
 *
 * Importing the module under test would not have found that. Only running the
 * command the way `npm run build` runs it does, which is what these do: real
 * `node`, real argv, real exit codes, a real `dist/` on disk.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { captcha } from '../../src/data/site';

const repo = path.resolve(import.meta.dirname, '../..');
const script = (name: string) => path.join(repo, 'scripts', name);

interface Run {
  code: number;
  out: string;
}

/**
 * spawnSync rather than execFileSync, because these gates write their
 * refusals to stderr and their confirmations to stdout, and a test that reads
 * only one of the two misses half of what the gate said.
 */
function run(file: string, { cwd = repo, env = {} as Record<string, string> } = {}): Run {
  const result = spawnSync('node', ['--experimental-strip-types', script(file)], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: result.status ?? 1, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

const temps: string[] = [];

/** A throwaway working directory holding a `dist/` of the given pages. */
function fakeDist(pages: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecs-gate-'));
  temps.push(dir);
  for (const [name, html] of Object.entries(pages)) {
    const file = path.join(dir, 'dist', name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  return dir;
}

afterEach(() => {
  while (temps.length) fs.rmSync(temps.pop()!, { recursive: true, force: true });
});

const CLEAN = '<html><body><div class="cf-turnstile" data-sitekey="0x4AAAAAAAreal"></div></body></html>';

describe('captcha-check — the artefact gate', () => {
  it('runs at all', () => {
    /* The regression this file exists for: a gate that cannot start is not a
       gate. A crash and a refusal both exit non-zero, so the message matters
       as much as the code. */
    const { code, out } = run('captcha-check.mjs', { cwd: fakeDist({ 'index.html': CLEAN }) });
    expect(out).not.toMatch(/ERR_MODULE_NOT_FOUND|Cannot find module/);
    expect(code).toBe(0);
  });

  it('passes a build with no published key, and says how many pages it read', () => {
    const cwd = fakeDist({ 'index.html': CLEAN, 'contact-us/index.html': CLEAN });
    const { code, out } = run('captcha-check.mjs', { cwd });
    expect(code).toBe(0);
    expect(out).toContain('no published captcha key in any of 2 built page(s)');
  });

  it('fails a build carrying a published test SITE key, and names the page', () => {
    const cwd = fakeDist({
      'index.html': CLEAN,
      'contact-us/index.html': `<div data-sitekey="${captcha.turnstile.testSiteKey}"></div>`,
    });
    const { code, out } = run('captcha-check.mjs', { cwd });
    expect(code).toBe(1);
    expect(out).toContain('refusing to ship this build');
    expect(out).toContain('contact-us/index.html');
    expect(out).toContain(captcha.turnstile.testSiteKey);
  });

  it('fails a build carrying a captcha SECRET, which belongs nowhere near a page', () => {
    const cwd = fakeDist({
      'index.html': `<script>var s = "${captcha.turnstile.testSecretKey}";</script>`,
    });
    expect(run('captcha-check.mjs', { cwd }).code).toBe(1);
  });

  it("does not flag the client's own reCAPTCHA site key", () => {
    const cwd = fakeDist({
      'index.html': `<div data-sitekey="${captcha.recaptcha.clientSiteKey}"></div>`,
    });
    expect(run('captcha-check.mjs', { cwd }).code).toBe(0);
  });

  it('fails rather than passing when there is no build to inspect', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecs-gate-'));
    temps.push(dir);
    const { code, out } = run('captcha-check.mjs', { cwd: dir });
    expect(code).toBe(1);
    expect(out).toContain('dist/ not found');
  });
});

describe('preflight — the variable gate', () => {
  it('refuses a production build with no site key set', () => {
    const { code, out } = run('preflight.mjs', { env: { PUBLIC_TURNSTILE_SITE_KEY: '' } });
    expect(code).toBe(1);
    expect(out).toContain('refusing to build for production');
    expect(out).toContain('PUBLIC_TURNSTILE_SITE_KEY is not set');
  });

  it('refuses a published test site key', () => {
    const { code, out } = run('preflight.mjs', {
      env: { PUBLIC_TURNSTILE_SITE_KEY: captcha.turnstile.testSiteKey },
    });
    expect(code).toBe(1);
    expect(out).toContain('PUBLISHED TEST KEY');
  });

  it('allows a key that is neither missing nor published', () => {
    const { code, out } = run('preflight.mjs', {
      env: { PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
    });
    expect(code).toBe(0);
    expect(out).toContain('site key set and not a test key');
  });
});

describe('secret-check — the deploy gate', () => {
  /**
   * Stands a fake `npx` in front of the real one on PATH, so the gate's three
   * branches are exercised without a Cloudflare account, without the network
   * and without waiting on `npx wrangler`.
   */
  function withFakeNpx(body: string) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecs-bin-'));
    temps.push(dir);
    const bin = path.join(dir, 'npx');
    fs.writeFileSync(bin, `#!/bin/sh\n${body}\n`);
    fs.chmodSync(bin, 0o755);
    return { PATH: `${dir}${path.delimiter}${process.env.PATH}` };
  }

  const listing = (names: string[]) =>
    `cat <<'JSON'\n${JSON.stringify(names.map((name) => ({ name })))}\nJSON`;

  it('runs at all', () => {
    const { out } = run('secret-check.mjs', {
      env: withFakeNpx(listing(['DATABASE_URL', 'TURNSTILE_SECRET'])),
    });
    expect(out).not.toMatch(/ERR_MODULE_NOT_FOUND|Cannot find module/);
  });

  it('passes when both required secrets are set, and says values are not checkable', () => {
    const { code, out } = run('secret-check.mjs', {
      env: withFakeNpx(listing(['DATABASE_URL', 'TURNSTILE_SECRET'])),
    });
    expect(code).toBe(0);
    expect(out).toContain('DATABASE_URL and TURNSTILE_SECRET are set');
    expect(out).toContain('VALUES are not checkable from here');
  });

  it.each([
    [['TURNSTILE_SECRET'], 'DATABASE_URL'],
    [['DATABASE_URL'], 'TURNSTILE_SECRET'],
    [[], 'DATABASE_URL'],
  ])('refuses the deploy when a required secret is missing', (present, expected) => {
    const { code, out } = run('secret-check.mjs', { env: withFakeNpx(listing(present)) });
    expect(code).toBe(1);
    expect(out).toContain('refusing to deploy to production');
    expect(out).toContain(`${expected} is not set`);
    expect(out).toContain(`npx wrangler secret put ${expected}`);
  });

  it('warns but does not refuse when only the optional email secrets are absent', () => {
    const { code, out } = run('secret-check.mjs', {
      env: withFakeNpx(listing(['DATABASE_URL', 'TURNSTILE_SECRET'])),
    });
    expect(code).toBe(0);
    expect(out).toContain('RESEND_API_KEY');
    expect(out).toContain('no email will be sent');
  });

  it('refuses rather than passing when it cannot read the secret list at all', () => {
    /* An unauthenticated wrangler. A gate that cannot verify must not report
       success — deploying unchecked means every form answers 503 in silence. */
    const { code, out } = run('secret-check.mjs', {
      env: withFakeNpx('echo "Authentication error [code: 10000]" >&2; exit 1'),
    });
    expect(code).toBe(1);
    expect(out).toContain('not verified');
    expect(out).toContain('wrangler login');
  });

  it('never prints a secret value, only names', () => {
    const { out } = run('secret-check.mjs', {
      env: withFakeNpx(listing(['DATABASE_URL', 'TURNSTILE_SECRET', 'RESEND_API_KEY'])),
    });
    expect(out).not.toMatch(/postgres:\/\/|0x4AAAAAAA|re_[A-Za-z0-9]/);
  });
});

/**
 * @vitest-environment node
 *
 * The scroll-in reveal, as emitted: on every public page, and never able to
 * hide content from anything that does not run the script.
 *
 * The behaviour of the observer is tests/reveal.test.ts. This is the other
 * half: that every page actually opts in (the site asked for the reveal on
 * every page, blog posts included), and that the served HTML and CSS cannot
 * hide a word on their own. A crawler that indexes the HTML before rendering,
 * a reader mode and a browser with scripts off must all see the whole page;
 * only the script hides anything, and only below the first screen.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isPrivatePage } from './private-pages';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-reveal');

const walk = (dir: string, ext: RegExp): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, ext);
    return ext.test(full) ? [full] : [];
  });

let pages: { page: string; html: string }[] = [];
let css = '';
let js = '';

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' },
  });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);

  pages = walk(out, /\.html$/)
    .filter((f) => !isPrivatePage(f, out))
    .map((f) => ({ page: '/' + path.relative(out, f).replace(/index\.html$/, ''), html: fs.readFileSync(f, 'utf8') }));
  const styles = pages.map((p) => [...p.html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n'));
  css = [...walk(out, /\.css$/).map((f) => fs.readFileSync(f, 'utf8')), ...styles].join('\n');
  js = [...walk(out, /\.js$/).map((f) => fs.readFileSync(f, 'utf8')), ...pages.map((p) => p.html)].join('\n');
}, 300_000);

afterAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

describe('the scroll-in reveal', () => {
  it('is on every public page, blog posts and landing pages included', () => {
    expect(pages.length).toBeGreaterThan(50);
    const without = pages
      .filter((p) => !/<[a-z]+\b[^>]*\sdata-reveal(="(stagger|flow)")?[\s>]/.test(p.html))
      .map((p) => p.page);
    expect(without).toEqual([]);
  });

  it('ships the observer that arms it', () => {
    expect(js).toContain('data-reveal-armed');
  });

  it('never arrives armed: the served HTML hides nothing', () => {
    const armed = pages.filter((p) => /\sdata-reveal-armed[\s>=]/.test(p.html)).map((p) => p.page);
    expect(armed).toEqual([]);
  });

  it('hides only what the script has armed', () => {
    /* Every rule that sets a reveal's opacity to 0 must require the armed
       attribute, or the stylesheet alone could hide content. */
    const rules = [...css.matchAll(/([^{}]*data-reveal[^{}]*)\{([^}]*)\}/g)];
    const hiding = rules.filter(([, , body]) => /opacity:\s*0(?![.\d])/.test(body));
    expect(hiding.length).toBeGreaterThan(0);
    for (const [, selector] of hiding) {
      for (const part of selector.split(',')) {
        expect(part, part.trim()).toContain('data-reveal-armed');
      }
    }
  });
});

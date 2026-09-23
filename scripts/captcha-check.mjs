/**
 * Refuses a production build whose OUTPUT contains a published captcha key.
 *
 * `scripts/preflight.mjs` checks the input — is PUBLIC_TURNSTILE_SITE_KEY set,
 * and is it not a test key. This checks the artefact, which is the only thing
 * that is actually true. They catch different mistakes:
 *
 *   preflight       the variable was never exported. The usual mistake.
 *   this            the variable was exported and something else still put a
 *                   test key into a page — a hardcoded fallback, a component
 *                   that did not read the variable, a stale cached build, a
 *                   secret pasted into a template by accident.
 *
 * A build that ships a published test SITE key looks completely normal. The
 * widget resolves, forms submit, nothing errors — and every bot on the
 * internet is waved through, because the test key passes for anybody. That is
 * why it is a build failure rather than a warning.
 *
 * It also fails on a published test SECRET, and on the shape of a real one.
 * A secret has no business in a static page at all; the point of it being a
 * Worker secret is that it never reaches a build.
 *
 * Runs on `npm run build` only. `npm run build:preview` skips it, because
 * staging is meant to run on test keys.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findPublishedTestKeys } from '../src/lib/captcha-hosts.ts';

const dist = path.resolve('dist');

if (!fs.existsSync(dist)) {
  console.error('captcha-check: dist/ not found — run the build first.');
  process.exit(1);
}

/** Every .html the build emitted. */
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && full.endsWith('.html') ? [full] : [];
  });
}

const files = htmlFiles(dist);
const offences = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const found = findPublishedTestKeys(text);
  if (found.length) offences.push({ file: path.relative(dist, file), found });
}

if (offences.length) {
  console.error(
    `\ncaptcha-check: refusing to ship this build.\n\n` +
      `  A published captcha key is baked into ${offences.length} of ${files.length} page(s).\n` +
      `  A published key passes for every visitor, including every bot.\n\n` +
      offences
        .slice(0, 10)
        .map((o) => `    ${o.file}\n      ${o.found.join('\n      ')}`)
        .join('\n') +
      (offences.length > 10 ? `\n    … and ${offences.length - 10} more\n` : '\n') +
      `\n  Set the client's own key and rebuild:\n` +
      `    export PUBLIC_TURNSTILE_SITE_KEY=<the real site key>\n` +
      `    npx wrangler secret put TURNSTILE_SECRET\n` +
      `    npm run build\n`
  );
  process.exit(1);
}

console.log(`captcha-check: no published captcha key in any of ${files.length} built page(s).`);

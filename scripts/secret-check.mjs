/**
 * Refuses a production deploy when the Worker is missing a secret it cannot
 * run without.
 *
 * WHAT THIS CAN AND CANNOT SEE, because the distinction is the whole design:
 *
 *   `wrangler secret list` returns NAMES, not values. That is the point of a
 *   secret. So this layer can prove a secret EXISTS and nothing more — it
 *   cannot tell Cloudflare's published test secret from the client's real one,
 *   and it cannot tell a real one from a typo.
 *
 *   The Worker, at runtime, is the only thing that ever sees the value, and
 *   is therefore the only place a published test secret can be refused. It
 *   does that, on production hostnames, in `src/worker.ts`.
 *
 * So this is not the enforcement. It is the early, loud version of a failure
 * that would otherwise be found by a visitor: deploy with no TURNSTILE_SECRET
 * and every form answers 503 while the site looks perfectly healthy.
 *
 * Runs before `npm run deploy` only. The preview deploy skips it, because
 * staging is allowed to run unconfigured.
 */
import { execFileSync } from 'node:child_process';
import { captcha } from '../src/data/site.ts';

const REQUIRED = [
  ['DATABASE_URL', 'Neon; without it /api/submit-lead answers 503 and the lead is lost'],
  [
    captcha.provider === 'turnstile' ? 'TURNSTILE_SECRET' : 'RECAPTCHA_SECRET',
    'captcha verification; without it /api/submit-lead answers 503',
  ],
];

const OPTIONAL = [
  ['RESEND_API_KEY', 'the lead notification email'],
  ['LEAD_NOTIFY_TO', 'who the notification goes to'],
  ['LEAD_NOTIFY_FROM', 'the sending address'],
];

let names;
try {
  const out = execFileSync('npx', ['wrangler', 'secret', 'list', '--format', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  names = new Set(JSON.parse(out).map((s) => s.name));
} catch (err) {
  console.error(
    `\nsecret-check: could not list the Worker's secrets, so this deploy is not verified.\n\n` +
      `  ${String(err.stderr || err.message).trim().split('\n').slice(0, 4).join('\n  ')}\n\n` +
      `  Usually this is an unauthenticated wrangler: run \`npx wrangler login\`.\n` +
      `  Refusing rather than deploying unchecked — a missing secret means every\n` +
      `  form on the live site answers 503 and every enquiry is lost, silently.\n`
  );
  process.exit(1);
}

const missing = REQUIRED.filter(([name]) => !names.has(name));
if (missing.length) {
  console.error(
    `\nsecret-check: refusing to deploy to production.\n\n` +
      missing.map(([name, why]) => `  ${name} is not set — ${why}`).join('\n') +
      `\n\n  Set each one, then deploy:\n` +
      missing.map(([name]) => `    npx wrangler secret put ${name}`).join('\n') +
      `\n`
  );
  process.exit(1);
}

const absent = OPTIONAL.filter(([name]) => !names.has(name));
if (absent.length) {
  console.warn(
    `secret-check: optional secret(s) not set — ${absent
      .map(([name, why]) => `${name} (${why})`)
      .join(', ')}. Leads will still be stored; no email will be sent.`
  );
}

console.log(
  `secret-check: ${REQUIRED.map(([n]) => n).join(' and ')} are set. ` +
    `Their VALUES are not checkable from here — the Worker refuses a published ` +
    `test secret at runtime.`
);

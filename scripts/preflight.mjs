/**
 * Refuses to produce a production build that would ship a published test key.
 *
 * Runs on `npm run build` only. `npm run build:preview` skips it, because
 * staging is *meant* to run on test keys.
 *
 * WHY THIS EXISTS. Going live is two separate actions in two separate places,
 * and doing one without the other breaks the forms in a way nobody sees until
 * a lead is lost:
 *
 *   the SECRET   is a Worker secret — `wrangler secret put TURNSTILE_SECRET`.
 *                It never appears in the repo or in a build.
 *   the SITE KEY is a build-time variable — PUBLIC_TURNSTILE_SITE_KEY. It is
 *                baked into the HTML at `astro build` and cannot be injected
 *                afterwards.
 *
 * Set the secret and forget the site key and the widget issues a *test* token
 * that the *production* secret rejects: every submission answers 403 and every
 * enquiry is refused. The site looks fine. The Worker already covers the other
 * half — a test secret on a production hostname answers 503 — so this closes
 * the pair.
 *
 * `astro build` itself cannot check this: `import.meta.env` is read during the
 * build, so by the time a page renders the wrong key it is already too late to
 * fail usefully. Hence a gate in front of it.
 */
import { captcha } from '../src/data/site.ts';

const provider = captcha.provider;
const siteKey =
  provider === 'turnstile'
    ? process.env.PUBLIC_TURNSTILE_SITE_KEY
    : process.env.PUBLIC_RECAPTCHA_SITE_KEY;

const variable = provider === 'turnstile' ? 'PUBLIC_TURNSTILE_SITE_KEY' : 'PUBLIC_RECAPTCHA_SITE_KEY';
const secretName = provider === 'turnstile' ? 'TURNSTILE_SECRET' : 'RECAPTCHA_SECRET';
const testKeys = [captcha.turnstile.testSiteKey, captcha.recaptcha.testSiteKey];

const fail = (why, fix) => {
  console.error(`\npreflight: refusing to build for production.\n\n  ${why}\n\n${fix}\n`);
  process.exit(1);
};

if (!siteKey) {
  fail(
    `${variable} is not set, so this build would ship the ${provider} TEST site key.`,
    `  Set both halves, then build:\n` +
      `    export ${variable}=<the real site key>\n` +
      `    npx wrangler secret put ${secretName}\n\n` +
      `  Or build the staging site instead, which is allowed to use test keys:\n` +
      `    npm run build:preview`
  );
}

if (testKeys.includes(siteKey)) {
  fail(
    `${variable} is set to a PUBLISHED TEST KEY. It accepts every visitor, including every bot.`,
    `  Replace it with the client's own key from their ${provider} admin, and make\n` +
      `  sure ${secretName} is the matching secret — a real secret with a test site\n` +
      `  key rejects every genuine submission with a 403.`
  );
}

console.log(`preflight: ${provider} site key set and not a test key.`);

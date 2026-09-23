/**
 * Which hostnames a captcha token is allowed to have been solved on, and how
 * a published test key is detected.
 *
 * WHY A HOSTNAME CHECK. `siteverify` answering `success: true` means the token
 * is real and unused. It does not mean it came from this site. A token solved
 * on any page carrying the same site key verifies here too, so an attacker who
 * can render the widget elsewhere — a copy of the landing page on a host they
 * control, an iframe, a scraped page rehosted — can mint valid tokens and post
 * them at `/api/submit-lead` all day. Cloudflare and Google both tell you
 * where the challenge was solved, in `hostname`, and checking it is the
 * difference between "this token is real" and "this token is ours".
 *
 * THE THREE PLACES THIS IS ENFORCED, and what each one can actually see:
 *
 *   1. `astro build`        sees PUBLIC_TURNSTILE_SITE_KEY and the emitted
 *                           HTML. It can refuse to produce a production build
 *                           that bakes in a test SITE key — `scripts/preflight.mjs`
 *                           checks the variable, `scripts/captcha-check.mjs`
 *                           checks the artefact. It cannot see the secret,
 *                           which does not exist at build time.
 *   2. `wrangler deploy`    can list secret NAMES, so it can prove a secret is
 *                           set. It cannot read the value — that is the whole
 *                           point of a secret — so it cannot tell a real one
 *                           from a published test one.
 *                           `scripts/secret-check.mjs`.
 *   3. the Worker, at       sees the secret value and `siteverify`'s answer.
 *      runtime              It is therefore the ONLY place that can refuse a
 *                           published test secret, and the only place that can
 *                           check the solving hostname. It is the strongest
 *                           mechanism this architecture supports, and the
 *                           other two are there so a mistake is caught earlier
 *                           and more loudly, not because they are sufficient.
 */
import { PREVIEW_HOST, PRODUCTION_HOSTS, captcha } from '../data/site.ts';

/** Accepted on the production origin. Nothing else is. */
export const PRODUCTION_CAPTCHA_HOSTNAMES: readonly string[] = [...PRODUCTION_HOSTS];

/** Accepted on staging. */
export const STAGING_CAPTCHA_HOSTNAMES: readonly string[] = [PREVIEW_HOST];

/**
 * What Cloudflare's dummy `siteverify` reports when a published test key pair
 * is used. Measured, not guessed: the test pair answers
 * `{"success":true,"hostname":"example.com", …}` whatever host asked.
 *
 * Allowed only where a test secret is also allowed — never on production.
 */
export const TEST_KEY_HOSTNAME = 'example.com';

/** Every published key on both providers. None of these is a credential. */
export const PUBLISHED_TEST_SECRETS: readonly string[] = [
  captcha.turnstile.testSecretKey,
  captcha.turnstile.failSecretKey,
  captcha.recaptcha.testSecretKey,
];

export const PUBLISHED_TEST_SITE_KEYS: readonly string[] = [
  captcha.turnstile.testSiteKey,
  captcha.recaptcha.testSiteKey,
];

export const isProductionHost = (host: string): boolean =>
  PRODUCTION_CAPTCHA_HOSTNAMES.includes(host);

export const isPublishedTestSecret = (secret: string): boolean =>
  PUBLISHED_TEST_SECRETS.includes(secret);

/**
 * The hostnames a token may legitimately have been solved on, for this
 * request.
 *
 * Production is a closed list and never includes the staging host or the test
 * key's `example.com` — a token minted against staging must not buy a lead on
 * the live site. Everywhere else the request's own host is allowed, which
 * covers the staging origin, a `*.workers.dev` preview and `wrangler dev` on
 * localhost without any of them being written down and going stale.
 */
export function allowedCaptchaHostnames(requestHost: string, secret: string): readonly string[] {
  if (isProductionHost(requestHost)) return PRODUCTION_CAPTCHA_HOSTNAMES;

  const allowed = new Set<string>([requestHost, ...STAGING_CAPTCHA_HOSTNAMES]);
  if (isPublishedTestSecret(secret)) allowed.add(TEST_KEY_HOSTNAME);
  return [...allowed];
}

/**
 * Find any published test key in a blob of text — used to scan the built HTML.
 *
 * A build that ships a test SITE key looks completely normal: forms submit,
 * the widget resolves, and every bot on the internet is waved through. The
 * variable check in `scripts/preflight.mjs` catches the usual way that
 * happens; this checks what was actually emitted, which is the only thing
 * that is true.
 */
export function findPublishedTestKeys(text: string): string[] {
  return [...PUBLISHED_TEST_SITE_KEYS, ...PUBLISHED_TEST_SECRETS].filter((key) =>
    text.includes(key)
  );
}

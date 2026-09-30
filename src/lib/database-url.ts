import { isProductionHost } from './captcha-hosts.ts';

/**
 * Which Neon branch a request writes to.
 *
 * Staging and production are one Worker, so the only thing that tells a
 * staging submission from a real one is the hostname it arrived on — the same
 * test `public/_headers` uses for the noindex and `captcha-hosts.ts` uses for
 * the token check.
 *
 *   www. and the apex   DATABASE_URL          Neon branch `main`
 *   anything else       STAGING_DATABASE_URL  Neon branch `staging`
 *
 * NEVER FALLS BACK. A staging host with no STAGING_DATABASE_URL gets
 * `undefined`, which the endpoints answer with a 503 — it does not borrow
 * production's string. Falling back is exactly how a staging test ends up as
 * a row among real leads, which is the thing the split exists to stop.
 */
export interface DatabaseEnv {
  DATABASE_URL?: string;
  STAGING_DATABASE_URL?: string;
}

export const databaseSecretFor = (host: string) =>
  isProductionHost(host) ? ('DATABASE_URL' as const) : ('STAGING_DATABASE_URL' as const);

export const databaseUrlFor = (host: string, env: DatabaseEnv): string | undefined =>
  env[databaseSecretFor(host)];

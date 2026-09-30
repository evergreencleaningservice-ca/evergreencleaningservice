/**
 * Which Neon branch each hostname writes to. The Worker-level proof is in
 * tests/worker/submit-lead.test.ts; this pins the rule itself.
 */
import { describe, expect, it } from 'vitest';
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site';
import { databaseSecretFor, databaseUrlFor } from '../src/lib/database-url';

const env = { DATABASE_URL: 'main', STAGING_DATABASE_URL: 'staging' };

describe('databaseUrlFor', () => {
  it.each(PRODUCTION_HOSTS)('%s uses main', (host) => {
    expect(databaseSecretFor(host)).toBe('DATABASE_URL');
    expect(databaseUrlFor(host, env)).toBe('main');
  });

  it.each([
    PREVIEW_HOST,
    'evergreencleaningservice.ash-47a.workers.dev',
    'localhost',
    'www.evergreencleaningservice.ca.evil.example',
  ])('%s uses staging', (host) => {
    expect(databaseUrlFor(host, env)).toBe('staging');
  });

  it('never falls back from staging to main', () => {
    expect(databaseUrlFor(PREVIEW_HOST, { DATABASE_URL: 'main' })).toBeUndefined();
  });

  it('never falls back from main to staging', () => {
    expect(databaseUrlFor(PRODUCTION_HOSTS[0], { STAGING_DATABASE_URL: 'staging' })).toBeUndefined();
  });
});

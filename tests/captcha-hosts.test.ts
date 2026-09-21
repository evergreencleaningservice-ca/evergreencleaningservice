/**
 * @vitest-environment node
 *
 * Phase 4 — which hostnames a captcha token may have been solved on, and how
 * a published key is detected in a build.
 *
 * The documented allowlists, asserted here so a change to either is a test
 * failure rather than a silent widening:
 *
 *   PRODUCTION   www.evergreencleaningservice.ca
 *                evergreencleaningservice.ca
 *   STAGING      evergreencleaningservice.10xconnections.com
 *                example.com — only while a published test secret is in use,
 *                because that is what Cloudflare's dummy siteverify reports
 */
import { describe, expect, it } from 'vitest';
import { captcha, PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site';
import {
  PRODUCTION_CAPTCHA_HOSTNAMES,
  STAGING_CAPTCHA_HOSTNAMES,
  TEST_KEY_HOSTNAME,
  allowedCaptchaHostnames,
  findPublishedTestKeys,
  isProductionHost,
  isPublishedTestSecret,
} from '../src/lib/captcha-hosts';

const REAL_SECRET = '0x4AAAAAAA-a-real-looking-production-secret';

describe('the documented allowlists', () => {
  it('production is exactly the two production hostnames', () => {
    expect(PRODUCTION_CAPTCHA_HOSTNAMES).toEqual([
      'www.evergreencleaningservice.ca',
      'evergreencleaningservice.ca',
    ]);
    expect(PRODUCTION_CAPTCHA_HOSTNAMES).toEqual([...PRODUCTION_HOSTS]);
  });

  it('staging is the preview hostname', () => {
    expect(STAGING_CAPTCHA_HOSTNAMES).toEqual(['evergreencleaningservice.10xconnections.com']);
    expect(STAGING_CAPTCHA_HOSTNAMES).toEqual([PREVIEW_HOST]);
  });
});

describe('the allowlist for a production request', () => {
  it.each([...PRODUCTION_HOSTS])('%s accepts only production hostnames', (host) => {
    const allowed = allowedCaptchaHostnames(host, REAL_SECRET);
    expect(allowed).toEqual(PRODUCTION_CAPTCHA_HOSTNAMES);
    expect(allowed).not.toContain(PREVIEW_HOST);
    expect(allowed).not.toContain(TEST_KEY_HOSTNAME);
  });

  it('a token solved on staging cannot buy a lead on production', () => {
    expect(allowedCaptchaHostnames('www.evergreencleaningservice.ca', REAL_SECRET)).not.toContain(
      PREVIEW_HOST
    );
  });

  it('a published test secret does not widen production, it is refused outright', () => {
    /* The Worker answers 503 before it ever reaches the allowlist; this only
       confirms the allowlist would not have helped either. */
    for (const secret of [
      captcha.turnstile.testSecretKey,
      captcha.turnstile.failSecretKey,
      captcha.recaptcha.testSecretKey,
    ]) {
      expect(allowedCaptchaHostnames('evergreencleaningservice.ca', secret)).toEqual(
        PRODUCTION_CAPTCHA_HOSTNAMES
      );
    }
  });

  it('a lookalike hostname is not a production host', () => {
    for (const host of [
      'evergreencleaningservice.ca.evil.example',
      'wwwevergreencleaningservice.ca',
      'www.evergreencleaningservice.com',
      'staging.evergreencleaningservice.ca',
      '',
    ]) {
      expect(isProductionHost(host)).toBe(false);
    }
  });
});

describe('the allowlist off production', () => {
  it('staging accepts itself, and example.com only on a test secret', () => {
    expect(allowedCaptchaHostnames(PREVIEW_HOST, captcha.turnstile.testSecretKey)).toContain(
      TEST_KEY_HOSTNAME
    );
    expect(allowedCaptchaHostnames(PREVIEW_HOST, REAL_SECRET)).not.toContain(TEST_KEY_HOSTNAME);
    expect(allowedCaptchaHostnames(PREVIEW_HOST, REAL_SECRET)).toContain(PREVIEW_HOST);
  });

  it('a workers.dev preview or wrangler dev accepts its own host', () => {
    expect(allowedCaptchaHostnames('evergreen.workers.dev', REAL_SECRET)).toContain(
      'evergreen.workers.dev'
    );
    expect(allowedCaptchaHostnames('127.0.0.1', REAL_SECRET)).toContain('127.0.0.1');
  });
});

describe('published keys are recognised', () => {
  it('every published secret on both providers', () => {
    expect(isPublishedTestSecret(captcha.turnstile.testSecretKey)).toBe(true);
    expect(isPublishedTestSecret(captcha.turnstile.failSecretKey)).toBe(true);
    expect(isPublishedTestSecret(captcha.recaptcha.testSecretKey)).toBe(true);
    expect(isPublishedTestSecret(REAL_SECRET)).toBe(false);
    expect(isPublishedTestSecret('')).toBe(false);
  });

  it('a build artefact carrying a test site key is detected', () => {
    const page = `<div class="cf-turnstile" data-sitekey="${captcha.turnstile.testSiteKey}"></div>`;
    expect(findPublishedTestKeys(page)).toEqual([captcha.turnstile.testSiteKey]);
  });

  it('a build artefact carrying a secret is detected', () => {
    expect(
      findPublishedTestKeys(`<script>var s="${captcha.turnstile.testSecretKey}"</script>`)
    ).toEqual([captcha.turnstile.testSecretKey]);
  });

  it("the client's real reCAPTCHA site key is not flagged", () => {
    expect(findPublishedTestKeys(`data-sitekey="${captcha.recaptcha.clientSiteKey}"`)).toEqual([]);
  });

  it('a clean page reports nothing', () => {
    expect(findPublishedTestKeys('<div data-sitekey="0x4AAAAAAAreal"></div>')).toEqual([]);
  });
});

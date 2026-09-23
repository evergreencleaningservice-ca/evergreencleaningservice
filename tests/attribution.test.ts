/**
 * Phase 3 — first-touch and latest-touch attribution.
 *
 * Each `describe` below is one of the acceptance criteria.
 *
 * Retention is exercised in both modes. The site ships `MODE = 'session'`,
 * where the browser ends the record when the tab closes; the 90-day
 * `'persistent'` mode is implemented, tested, and off pending the consent
 * decision recorded in `src/lib/attribution.ts`.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  MODE,
  PERSISTENT_DAYS,
  STORAGE_KEY,
  attributionPayload,
  clean,
  externalReferrer,
  isCampaignTouch,
  readAttribution,
  readTouch,
  recordTouch,
} from '../src/lib/attribution';

const SITE = 'https://www.evergreencleaningservice.ca';
const AD = `${SITE}/lp/commercial-cleaning/?gclid=EAIaIQ1&utm_source=google&utm_medium=cpc&utm_campaign=gta-office&utm_term=office%20cleaning%20toronto&utm_content=ad1&gad_source=1`;

const at = (iso: string) => new Date(iso);
const T0 = at('2026-09-21T10:00:00.000Z');
const plusDays = (d: number) => new Date(T0.getTime() + d * 24 * 60 * 60 * 1000);

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('the touch parsed off a URL', () => {
  it('captures every Google, Microsoft and UTM identifier', () => {
    const touch = readTouch(
      `${SITE}/lp/x/?gclid=G1&gbraid=GB1&wbraid=WB1&gad_source=1&gclsrc=aw.ds&msclkid=M1` +
        '&utm_source=bing&utm_medium=cpc&utm_campaign=c&utm_term=t&utm_content=ct&utm_id=17',
      'https://www.google.com/',
      T0
    );
    expect(touch).toMatchObject({
      gclid: 'G1',
      gbraid: 'GB1',
      wbraid: 'WB1',
      gad_source: '1',
      gclsrc: 'aw.ds',
      msclkid: 'M1',
      utm_source: 'bing',
      utm_medium: 'cpc',
      utm_campaign: 'c',
      utm_term: 't',
      utm_content: 'ct',
      utm_id: '17',
      landing_page: '/lp/x/?gclid=G1&gbraid=GB1&wbraid=WB1&gad_source=1&gclsrc=aw.ds&msclkid=M1&utm_source=bing&utm_medium=cpc&utm_campaign=c&utm_term=t&utm_content=ct&utm_id=17',
      referrer: 'https://www.google.com/',
      ts: T0.toISOString(),
    });
  });

  it('records the landing page and referrer for a direct or organic arrival', () => {
    const touch = readTouch(`${SITE}/services/office-cleaning/`, 'https://duckduckgo.com/', T0);
    expect(touch.landing_page).toBe('/services/office-cleaning/');
    expect(touch.referrer).toBe('https://duckduckgo.com/');
    expect(isCampaignTouch(touch)).toBe(false);
  });

  it('does not treat an empty parameter as a campaign', () => {
    expect(isCampaignTouch(readTouch(`${SITE}/?gclid=`, '', T0))).toBe(false);
    expect(isCampaignTouch(readTouch(`${SITE}/?utm_term=x`, '', T0))).toBe(false);
    expect(isCampaignTouch(readTouch(`${SITE}/?utm_source=google`, '', T0))).toBe(true);
    expect(isCampaignTouch(readTouch(`${SITE}/?msclkid=M1`, '', T0))).toBe(true);
  });

  it('ignores a referrer from this site — an internal link is not a referral', () => {
    expect(externalReferrer(`${SITE}/about-us/`, `${SITE}/contact-us/`)).toBe('');
    expect(externalReferrer('https://www.google.com/', `${SITE}/`)).toBe('https://www.google.com/');
    expect(externalReferrer('', `${SITE}/`)).toBe('');
    expect(externalReferrer('not a url', `${SITE}/`)).toBe('');
  });
});

describe('attribution survives internal navigation', () => {
  it('a gclid captured on arrival is still submitted three pages later', () => {
    recordTouch(AD, 'https://www.google.com/', T0);

    /* Three internal pages, each with an internal referrer and no params. */
    recordTouch(`${SITE}/services/`, `${SITE}/lp/commercial-cleaning/`, plusDays(0));
    recordTouch(`${SITE}/services/office-cleaning/`, `${SITE}/services/`, plusDays(0));
    recordTouch(`${SITE}/contact-us/`, `${SITE}/services/office-cleaning/`, plusDays(0));

    const payload = attributionPayload(plusDays(0));
    expect(payload.gclid).toBe('EAIaIQ1');
    expect(payload.utm_campaign).toBe('gta-office');
    expect(payload.landing_page).toBe(
      '/lp/commercial-cleaning/?gclid=EAIaIQ1&utm_source=google&utm_medium=cpc&utm_campaign=gta-office&utm_term=office%20cleaning%20toronto&utm_content=ad1&gad_source=1'
    );
    expect(payload.referrer).toBe('https://www.google.com/');
    expect(payload.first_gclid).toBe('EAIaIQ1');
  });

  it('internal navigation writes nothing at all', () => {
    recordTouch(AD, 'https://www.google.com/', T0);
    const after = sessionStorage.getItem(STORAGE_KEY);
    recordTouch(`${SITE}/about-us/`, `${SITE}/`, plusDays(0));
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(after);
  });
});

describe('first touch is not overwritten by direct traffic', () => {
  it('a later direct visit changes neither first nor last', () => {
    recordTouch(AD, 'https://www.google.com/', T0);
    recordTouch(`${SITE}/`, '', plusDays(1));

    const payload = attributionPayload(plusDays(1));
    expect(payload.first_gclid).toBe('EAIaIQ1');
    expect(payload.first_utm_campaign).toBe('gta-office');
    expect(payload.gclid).toBe('EAIaIQ1');
    expect(payload.first_referrer).toBe('https://www.google.com/');
  });

  it('a later organic visit changes neither', () => {
    recordTouch(AD, 'https://www.google.com/', T0);
    recordTouch(`${SITE}/services/`, 'https://www.bing.com/search?q=cleaners', plusDays(2));

    const record = readAttribution(plusDays(2))!;
    expect(record.first.gclid).toBe('EAIaIQ1');
    expect(record.last.gclid).toBe('EAIaIQ1');
    expect(record.last.referrer).toBe('https://www.google.com/');
  });

  it('a direct first arrival is still recorded, so organic is attributable', () => {
    recordTouch(`${SITE}/`, 'https://duckduckgo.com/', T0);
    const payload = attributionPayload(T0);
    expect(payload.first_landing_page).toBe('/');
    expect(payload.first_referrer).toBe('https://duckduckgo.com/');
    expect(payload.gclid).toBeUndefined();
  });
});

describe('a later valid campaign updates the latest touch', () => {
  it('replaces last, preserves first', () => {
    recordTouch(AD, 'https://www.google.com/', T0);
    recordTouch(
      `${SITE}/lp/commercial-cleaning-quote/?msclkid=M2&utm_source=bing&utm_medium=cpc&utm_campaign=retarget`,
      'https://www.bing.com/',
      plusDays(3)
    );

    const payload = attributionPayload(plusDays(3));
    /* last */
    expect(payload.msclkid).toBe('M2');
    expect(payload.utm_campaign).toBe('retarget');
    expect(payload.touch_at).toBe(plusDays(3).toISOString());
    /* first, untouched */
    expect(payload.first_gclid).toBe('EAIaIQ1');
    expect(payload.first_utm_campaign).toBe('gta-office');
    expect(payload.first_touch_at).toBe(T0.toISOString());
    /* the old click id is gone from last — it did not produce this enquiry */
    expect(payload.gclid).toBeUndefined();
  });

  it('a third campaign replaces the second, not the first', () => {
    recordTouch(AD, '', T0);
    recordTouch(`${SITE}/?utm_source=bing&utm_medium=cpc&utm_campaign=two`, '', plusDays(1));
    recordTouch(`${SITE}/?utm_source=meta&utm_medium=paid&utm_campaign=three`, '', plusDays(2));

    const payload = attributionPayload(plusDays(2));
    expect(payload.utm_campaign).toBe('three');
    expect(payload.first_utm_campaign).toBe('gta-office');
  });
});

describe('expiry', () => {
  it('a persistent record is discarded and cleared after the TTL', () => {
    recordTouch(AD, 'https://www.google.com/', T0, 'persistent');
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    const justInside = new Date(T0.getTime() + (PERSISTENT_DAYS * 24 * 60 - 1) * 60 * 1000);
    expect(readAttribution(justInside, 'persistent')?.first.gclid).toBe('EAIaIQ1');

    const past = plusDays(PERSISTENT_DAYS + 1);
    expect(readAttribution(past, 'persistent')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(attributionPayload(past, 'persistent')).toEqual({});
  });

  it('a stale click id is never attached to a lead after expiry', () => {
    recordTouch(AD, '', T0, 'persistent');
    const record = recordTouch(`${SITE}/`, '', plusDays(PERSISTENT_DAYS + 5), 'persistent')!;
    /* the expired record was cleared, so this direct visit starts a new one */
    expect(record.first.gclid).toBeUndefined();
    expect(record.first.ts).toBe(plusDays(PERSISTENT_DAYS + 5).toISOString());
  });

  it('a session record is not time-expired — the tab closing ends it', () => {
    recordTouch(AD, '', T0);
    expect(readAttribution(plusDays(365))?.first.gclid).toBe('EAIaIQ1');
  });

  it('corrupt, truncated or wrong-version stored data is treated as absent', () => {
    for (const bad of [
      'not json',
      '{}',
      '[]',
      'null',
      JSON.stringify({ v: 1 }),
      JSON.stringify({ v: 2, first: { ts: T0.toISOString() }, last: { ts: T0.toISOString() } }),
      JSON.stringify({ v: 1, first: { ts: 'nonsense' }, last: { ts: 'nonsense' } }),
    ]) {
      sessionStorage.setItem(STORAGE_KEY, bad);
      expect(readAttribution(T0)).toBeNull();
      expect(attributionPayload(T0)).toEqual({});
    }
  });

  it('a campaign arrival recovers from a corrupt record', () => {
    sessionStorage.setItem(STORAGE_KEY, '{{{');
    const record = recordTouch(AD, '', T0)!;
    expect(record.first.gclid).toBe('EAIaIQ1');
  });
});

describe('stored and submitted values are sanitized and length-limited', () => {
  it('strips control characters, markup characters and collapses whitespace', () => {
    expect(clean('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    expect(clean('a\u0000b\u001fc')).toBe('a b c');
    expect(clean('  spaced   out  ')).toBe('spaced out');
    expect(clean('he said "hi" and `that`')).toBe('he said hi and that');
    expect(clean(undefined)).toBe('');
    expect(clean(12345 as unknown)).toBe('');
  });

  it('caps each field at its own limit', () => {
    const long = 'x'.repeat(900);
    const touch = readTouch(
      `${SITE}/${long}?gclid=${long}&utm_source=${long}&gad_source=${long}`,
      '',
      T0
    );
    expect(touch.gclid).toHaveLength(256);
    expect(touch.utm_source).toHaveLength(150);
    expect(touch.gad_source).toHaveLength(32);
    expect(touch.landing_page).toHaveLength(500);
  });

  it('sanitizes a hostile campaign value all the way into the payload', () => {
    recordTouch(`${SITE}/?utm_source=google&utm_campaign=%3Cimg%20onerror%3Dx%3E`, '', T0);
    const payload = attributionPayload(T0);
    expect(payload.utm_campaign).toBe('img onerror=x');
    /* Every value, not the JSON envelope — JSON's own quotes are not a finding. */
    for (const value of Object.values(payload)) expect(value).not.toMatch(/[<>"'`]/);
  });

  it('keeps landing_page percent-encoded rather than decoding it into markup', () => {
    /* The landing page is what the browser asked for. Decoding it would turn
       a harmless %3C back into a raw angle bracket on its way to an email. */
    recordTouch(`${SITE}/?utm_source=google&q=%3Cimg%20onerror%3Dx%3E`, '', T0);
    const landing = attributionPayload(T0).landing_page;
    expect(landing).toBe('/?utm_source=google&q=%3Cimg%20onerror%3Dx%3E');
    expect(landing).not.toMatch(/[<>]/);
  });

  it('never emits an empty-string field', () => {
    recordTouch(`${SITE}/`, '', T0);
    const payload = attributionPayload(T0);
    expect(Object.values(payload).every((v) => v !== '')).toBe(true);
  });
});

describe('no attribution data appears on the page', () => {
  it('recording writes nothing into the DOM', () => {
    document.body.innerHTML = '<main><h1>Office Cleaning</h1></main>';
    const before = document.documentElement.outerHTML;

    recordTouch(AD, 'https://www.google.com/', T0);

    expect(document.documentElement.outerHTML).toBe(before);
    expect(document.body.textContent).not.toContain('EAIaIQ1');
    expect(document.querySelectorAll('input')).toHaveLength(0);
    expect(document.querySelector('[name*="gclid"]')).toBeNull();
    expect(document.querySelector('meta[content*="EAIaIQ1"]')).toBeNull();
  });

  it('the values live only in the configured storage', () => {
    recordTouch(AD, '', T0);
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('EAIaIQ1');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(document.cookie).toBe('');
  });
});

describe('retention defaults', () => {
  it('ships session-scoped, which is the consent-neutral option', () => {
    expect(MODE).toBe('session');
  });

  it('writes to sessionStorage and not to localStorage', () => {
    recordTouch(AD, '', T0);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

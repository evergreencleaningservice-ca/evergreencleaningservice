/**
 * @vitest-environment node
 *
 * The post stage's model: from a cleaning job, the website post and a post
 * for each social platform, as UiD by Rana writes them for the wrap shops.
 */
import { describe, expect, it } from 'vitest';
import {
  CHANNELS,
  blocksFromText,
  blocksToText,
  brief,
  caption,
  draftFromLead,
  excerpt,
  newDraft,
  render,
  sanitizeDraft,
  slugify,
  socialLink,
  socialSlots,
  tagsFor,
  thumbFor,
  xLength,
  type Draft,
} from '../../src/lib/admin/post-model';
import { tags } from '../../src/data/tags';

const job = (over: Partial<Draft['job']> = {}): Draft => {
  const d = newDraft();
  Object.assign(d.job, { service: 'office', facility: 'dental', area: 'Mississauga', frequency: 'nightly', size: '4,000 sq ft', ...over });
  return d;
};

describe('what a job becomes', () => {
  it('writes a title, address and excerpt from the job', () => {
    const r = render(job());
    expect(r.title).toBe('Office cleaning for a dental office in Mississauga');
    expect(r.slug).toBe('office-cleaning-for-a-dental-office-in-mississauga');
    expect(r.url).toBe('https://www.evergreencleaningservice.ca/office-cleaning-for-a-dental-office-in-mississauga/');
    expect(r.excerpt).toBe('Office cleaning for a dental office in Mississauga by Evergreen Office Cleaning, every weeknight.');
  });

  it('says "an" before a vowel', () => {
    expect(render(job({ facility: 'office', area: '' })).title).toBe('Office cleaning for an office');
  });

  it('names the client only when allowed', () => {
    expect(render(job({ client: 'Smile Dental' })).title).not.toContain('Smile');
    const named = render(job({ client: 'Smile Dental', nameClient: true }));
    expect(named.title).toBe('Office cleaning for Smile Dental in Mississauga');
    expect(named.body).toContain('## The client');
  });

  it('writes the body in sections ending with the call to action', () => {
    const r = render(job({ green: true, afterHours: true, notes: 'The team loved it.' }));
    const heads = r.blocks.filter((b) => b.t === 'h2').map((b) => (b as { text: string }).text);
    expect(heads).toEqual(['The facility', 'The cleaning', 'The result', 'Need a cleaning team for your dental office?']);
    expect(r.body).toContain('[office cleaning](/services/office-cleaning/)');
    expect(r.body).toContain('[Mississauga](/locations/mississauga/)');
    expect(r.body).toContain('[Green Clean products](/green-clean-products/)');
    expect(r.body).toContain('after hours');
    expect(r.body).toContain('[Request a quote](/request-a-quote/)');
  });

  it('files the post under existing site tags only', () => {
    const known = new Set(tags.map((t) => t.slug));
    const t = tagsFor(job({ green: true }).job);
    expect(t).toContain('dental-office');
    expect(t).toContain('commercial-office-cleaning');
    expect(t).toContain('cleaning-products');
    expect(t.every((x) => known.has(x))).toBe(true);
  });

  it('keeps what the editor typed over what the stage wrote', () => {
    const d = job();
    d.edits = { postTitle: 'A clean smile', excerpt: 'Mine.', s_fb: 'My words' };
    const r = render(d);
    expect(r.title).toBe('A clean smile');
    expect(r.slug).toBe('a-clean-smile');
    expect(r.excerpt).toBe('Mine.');
    expect(r.social.fb).toBe('My words');
    expect(r.social.li).toContain(r.url);
  });

  it('caps the excerpt at 160 characters', () => {
    expect(excerpt(job({ client: 'A'.repeat(150), nameClient: true }).job).length).toBeLessThanOrEqual(160);
  });
});

describe('social posts', () => {
  it('writes one per channel, each pointing back to the website post (Instagram and TikTok to the bio)', () => {
    const r = render(job());
    for (const c of CHANNELS) {
      if (c.id === 'ig' || c.id === 'tt') expect(r.social[c.id]).toContain('link in bio');
      else expect(r.social[c.id]).toContain(r.url);
    }
  });

  it('uses the website post\'s title once it is edited', () => {
    const d = job();
    d.edits = { postTitle: 'A spotless clinic' };
    const r = render(d);
    expect(r.social.li.startsWith('A spotless clinic\n')).toBe(true);
    expect(r.ytTitle).toBe('A spotless clinic');
  });

  it('keeps X within 280, trimming the words and never the link', () => {
    const d = job({ client: 'A very long client name '.repeat(12), nameClient: true });
    const r = render(d);
    const x = caption('x', d.job, r.url);
    expect(xLength(x)).toBeLessThanOrEqual(280);
    expect(x).toContain(r.url);
  });

  it('takes a post link only on its own platform, over https', () => {
    expect(socialLink('fb', 'https://www.facebook.com/x/posts/1')).toBe('https://www.facebook.com/x/posts/1');
    expect(socialLink('fb', 'https://www.instagram.com/p/1')).toBeNull();
    expect(socialLink('x', 'http://x.com/a/status/1')).toBeNull();
    expect(socialLink('x', 'https://notx.com/a')).toBeNull();
  });

  it('gives the social row a slot per profile, opening a linked post instead once there is one', () => {
    const d = job();
    const before = socialSlots(d);
    expect(before.map((s) => s.name)).toEqual(['LinkedIn', 'Facebook', 'X']);
    d.links = { ig: 'https://www.instagram.com/p/abc/', fb: 'https://www.facebook.com/p/1' };
    const after = socialSlots(d);
    expect(after.map((s) => s.name)).toEqual(['LinkedIn', 'Facebook', 'Instagram', 'X']);
    expect(after.find((s) => s.id === 'fb')).toMatchObject({ href: 'https://www.facebook.com/p/1', posted: true });
  });
});

describe('text and blocks', () => {
  it('turns written text into blocks and back', () => {
    const text = '# Title\n\nIntro.\n\n## Part\n\n- a\n- b\n\n> Quote\n\n#### Small';
    const blocks = blocksFromText(text);
    expect(blocks.map((b) => b.t)).toEqual(['h2', 'p', 'h2', 'list', 'quote', 'h4']);
    expect(blocksToText(blocks)).toBe('## Title\n\nIntro.\n\n## Part\n\n- a\n- b\n\n> Quote\n\n#### Small');
  });

  it('writes a ChatGPT brief that carries the job', () => {
    const b = brief(job({ notes: 'Floors stripped.' }));
    expect(b).toContain('Service: Office cleaning');
    expect(b).toContain('Area: Mississauga');
    expect(b).toContain('Floors stripped.');
    expect(b).toContain('not named (do not name them)');
  });

  it('uses the chosen thumbnail, else the featured or first image', () => {
    const d = job();
    d.blocks = [
      { t: 'img', url: 'https://a.example/1.jpg', alt: 'one', caption: '' },
      { t: 'img', url: 'https://a.example/2.jpg', alt: 'two', caption: '', featured: true },
    ];
    expect(thumbFor(d)?.url).toBe('https://a.example/2.jpg');
    d.thumb = { url: 'https://a.example/t.jpg', alt: 't' };
    expect(thumbFor(d)?.url).toBe('https://a.example/t.jpg');
  });
});

describe('sanitizing a draft', () => {
  it('drops unknown fields, values and tags, and keeps the rest', () => {
    const d = sanitizeDraft({
      job: { service: 'nope', facility: 'school', green: 'yes', nameClient: true, notes: 'x'.repeat(9000), evil: 1 },
      edits: { postTitle: 'T', slug: 'Hello World!', body: 'no', s_x: 'tweet' },
      tags: ['office', 'not-a-tag'],
      links: { fb: 'https://facebook.com/a', zz: 'x' },
      thumb: { url: 'javascript:alert(1)', alt: '' },
      blocks: [{ t: 'p', text: 'ok' }, { t: 'iframe' }],
      leadId: 12,
    });
    expect(d.job.service).toBe('office');
    expect(d.job.facility).toBe('school');
    expect(d.job.green).toBe(false);
    expect(d.job.nameClient).toBe(true);
    expect(d.job.notes.length).toBe(4000);
    expect(d.edits).toEqual({ postTitle: 'T', slug: 'hello-world', s_x: 'tweet' });
    expect(d.tags).toEqual(['office']);
    expect(d.links).toEqual({ fb: 'https://facebook.com/a' });
    expect(d.thumb).toBeNull();
    expect(d.blocks).toEqual([{ t: 'p', text: 'ok' }]);
    expect(d.leadId).toBe(12);
  });

  it('turns rubbish into a blank draft', () => {
    expect(sanitizeDraft(null)).toEqual(newDraft());
    expect(sanitizeDraft('x')).toEqual(newDraft());
  });

  it('slugifies to the site\'s shape', () => {
    expect(slugify("Joe's Café & Bar — Toronto!")).toBe('joes-cafe-and-bar-toronto');
  });
});

describe('a draft from a won lead', () => {
  it('reads the service, facility and area, and does not name the client', () => {
    const d = draftFromLead({
      id: 7,
      business_name: 'Bright Smiles Dental',
      address: '100 City Centre Dr, Mississauga, ON',
      services: 'Office Cleaning',
      facility_type: 'Dental clinic',
      facility_size: '3,500 sq ft',
      message: 'Call me at 416-555-0100',
    });
    expect(d.leadId).toBe(7);
    expect(d.job).toMatchObject({ service: 'office', facility: 'dental', area: 'Mississauga', size: '3,500 sq ft', client: 'Bright Smiles Dental', nameClient: false });
    expect(d.job.notes).toBe('');
    expect(render(d).body).not.toContain('416-555-0100');
    expect(render(d).title).not.toContain('Bright');
  });

  it('matches whole area names only', () => {
    expect(draftFromLead({ id: 1, address: '5 Yorkville Ave, Toronto' }).job.area).toBe('');
    expect(draftFromLead({ id: 1, address: '5 Sheppard Ave, North York' }).job.area).toBe('North York');
    expect(draftFromLead({ id: 1, address: '9 Main St, Concord ON' }).job.area).toBe('Vaughan & Concord');
  });
});

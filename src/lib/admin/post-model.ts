/**
 * The post stage's model: the lists, and what a draft becomes.
 *
 * Ported from UiD by Rana (10xid-com/10xid-id-preview,
 * prototypes/control-room-rana/dist/post-model.js), which does this for the
 * wrap shops: the job is filled in once, and from it the stage writes
 *
 *   ① the website post (title, address on the site, tags, excerpt, body), and
 *   ② one post each for LinkedIn, Facebook, Instagram, YouTube, TikTok and X,
 *      every one pointing back to the website post's address.
 *
 * Rana's job is a vehicle and a vinyl; Evergreen's is a cleaning job:
 *
 *   Title · Service · Facility · Area · The work (how often, size, products,
 *   hours) · Client info · Description / notes
 *
 * Anything edited keeps the editor's words (`edits`); ↺ hands the field back
 * to the stage. No page code here — the page is src/admin/create-blog.ts, the
 * server is src/lib/admin/api.ts, and both read this file. The tests load it
 * directly.
 */
import { AREAS } from '../../data/coverage';
import { tags as SITE_TAGS } from '../../data/tags';
import { site, social as SITE_SOCIAL } from '../../data/site';
import { cleanBlocks, type Block } from './blocks';

// --------------------------------------------------------------- data ---

export interface Service {
  id: string;
  label: string;
  /** As a sentence names it: "We provided ___". */
  noun: string;
  /** The site's own page for it, linked from the post. */
  href?: string;
  /** Site tag slugs (src/data/tags.ts) a post about it files under. */
  tags: string[];
}

/** The services a job can be, following the site's service pages. */
export const SERVICES: Service[] = [
  { id: 'office', label: 'Office cleaning', noun: 'office cleaning', href: '/services/office-cleaning/', tags: ['commercial-office-cleaning', 'office', 'commercial-cleaning'] },
  { id: 'commercial', label: 'Commercial cleaning', noun: 'commercial cleaning', href: '/services/commercial-cleaning/', tags: ['commercial-cleaning', 'cleaning'] },
  { id: 'janitorial', label: 'Janitorial services', noun: 'janitorial services', href: '/services/commercial-cleaning/', tags: ['janitorial-services', 'commercial-cleaning'] },
  { id: 'industrial', label: 'Industrial cleaning', noun: 'industrial cleaning', href: '/services/industrial-cleaning/', tags: ['commercial-cleaning', 'cleaning'] },
  { id: 'warehouse', label: 'Warehouse cleaning', noun: 'warehouse cleaning', href: '/services/industrial-cleaning/', tags: ['commercial-cleaning', 'cleaning'] },
  { id: 'disinfection', label: 'Disinfection cleaning', noun: 'disinfection cleaning', href: '/services/disinfection-cleaning/', tags: ['cleaning', 'commercial-cleaning'] },
  { id: 'post-construction', label: 'Post-construction cleaning', noun: 'post-construction cleaning', href: '/services/post-construction-cleaning/', tags: ['cleaning', 'commercial-cleaning'] },
  { id: 'building-maintenance', label: 'Building maintenance', noun: 'building maintenance', href: '/services/building-maintenance/', tags: ['commercial-cleaning', 'janitorial-services'] },
  { id: 'condo', label: 'Condo common area cleaning', noun: 'common area cleaning', href: '/industries/property-management/', tags: ['commercial-cleaning', 'janitorial-services'] },
  { id: 'emergency', label: 'Emergency cleaning', noun: 'emergency cleaning', href: '/services/emergency-cleaning/', tags: ['cleaning', 'commercial-cleaning'] },
  { id: 'pressure-washing', label: 'Pressure washing', noun: 'pressure washing', href: '/services/pressure-washing/', tags: ['cleaning', 'entrance'] },
  { id: 'graffiti', label: 'Graffiti removal', noun: 'graffiti removal', href: '/services/graffiti-removal/', tags: ['cleaning'] },
];

export interface Facility {
  id: string;
  label: string;
  /** "a ___", "the ___". */
  noun: string;
  tags: string[];
  /** A hashtag for it, after the business's own. */
  hashtag: string;
}

export const FACILITIES: Facility[] = [
  { id: 'office', label: 'Office', noun: 'office', tags: ['office'], hashtag: 'OfficeCleaning' },
  { id: 'medical', label: 'Medical clinic', noun: 'medical clinic', tags: [], hashtag: 'ClinicCleaning' },
  { id: 'dental', label: 'Dental office', noun: 'dental office', tags: ['dental-office'], hashtag: 'DentalOffice' },
  { id: 'daycare', label: 'Daycare', noun: 'daycare', tags: ['daycares'], hashtag: 'Daycare' },
  { id: 'school', label: 'School', noun: 'school', tags: ['schools'], hashtag: 'SchoolCleaning' },
  { id: 'retail', label: 'Retail store', noun: 'retail store', tags: ['retail'], hashtag: 'RetailCleaning' },
  { id: 'warehouse', label: 'Warehouse', noun: 'warehouse', tags: [], hashtag: 'WarehouseCleaning' },
  { id: 'industrial', label: 'Industrial facility', noun: 'industrial facility', tags: [], hashtag: 'IndustrialCleaning' },
  { id: 'condo', label: 'Condo or residential building', noun: 'condo building', tags: [], hashtag: 'PropertyManagement' },
  { id: 'property', label: 'Managed commercial building', noun: 'commercial building', tags: [], hashtag: 'PropertyManagement' },
  { id: 'restaurant', label: 'Restaurant', noun: 'restaurant', tags: [], hashtag: 'RestaurantCleaning' },
  { id: 'gym', label: 'Gym or fitness centre', noun: 'fitness centre', tags: [], hashtag: 'GymCleaning' },
  { id: 'other', label: 'Other facility', noun: 'facility', tags: [], hashtag: 'FacilityCleaning' },
];

export interface Frequency {
  id: string;
  label: string;
  /** After a comma in a sentence: "office cleaning, ___". */
  phrase: string;
}

export const FREQUENCIES: Frequency[] = [
  { id: '', label: 'Not set', phrase: '' },
  { id: 'once', label: 'One-time clean', phrase: 'as a one-time clean' },
  { id: 'nightly', label: 'Every weeknight', phrase: 'every weeknight' },
  { id: 'daily', label: 'Daily', phrase: 'every day' },
  { id: 'twice-weekly', label: 'Twice a week', phrase: 'twice a week' },
  { id: 'weekly', label: 'Weekly', phrase: 'once a week' },
  { id: 'biweekly', label: 'Every two weeks', phrase: 'every two weeks' },
  { id: 'monthly', label: 'Monthly', phrase: 'once a month' },
];

/** The areas the site covers (src/data/coverage.ts), plus "not set". */
export const AREA_NAMES = AREAS.map((a) => a.name);

export const BUSINESS = {
  name: site.name,
  site: site.url,
  phone: site.phone,
  hashtags: ['EvergreenOfficeCleaning', 'CommercialCleaning', 'Toronto', 'GTA'],
};

/**
 * Every social post points back to the website post. Limits are each
 * platform's caption limit; X counts any link as 23 characters. `profile` is
 * the business's own page there (src/data/site.ts), where it has one.
 */
export interface Channel {
  id: 'li' | 'fb' | 'ig' | 'yt' | 'tt' | 'x';
  name: string;
  limit: number;
  hosts: string[];
  note?: string;
  profile?: string;
}

const profileOf = (name: string) => SITE_SOCIAL.find((s) => s.name === name)?.href;

export const CHANNELS: Channel[] = [
  { id: 'li', name: 'LinkedIn', limit: 3000, hosts: ['linkedin.com'], profile: profileOf('LinkedIn') },
  { id: 'fb', name: 'Facebook', limit: 63206, hosts: ['facebook.com', 'fb.com', 'fb.watch'], profile: profileOf('Facebook') },
  { id: 'ig', name: 'Instagram', limit: 2200, hosts: ['instagram.com'], note: 'Links in Instagram captions are not clickable: point to the link in bio.' },
  { id: 'yt', name: 'YouTube', limit: 5000, hosts: ['youtube.com', 'youtu.be'], note: 'Needs a video. Title up to 100 characters.' },
  { id: 'tt', name: 'TikTok', limit: 2200, hosts: ['tiktok.com'], note: 'Needs a video.' },
  { id: 'x', name: 'X', limit: 280, hosts: ['x.com', 'twitter.com'], profile: profileOf('Twitter') },
];

export type ChannelId = Channel['id'];

export const TAGS = SITE_TAGS.map((t) => ({ slug: t.slug, name: t.name }));
const TAG_SLUGS = new Set(TAGS.map((t) => t.slug));

// -------------------------------------------------------------- types ---

export interface Job {
  title: string;
  service: string;
  facility: string;
  area: string;
  frequency: string;
  size: string;
  green: boolean;
  afterHours: boolean;
  client: string;
  /** May the post name the client? Off unless they agreed. */
  nameClient: boolean;
  /** Their website or social handle, when they are named. */
  handle: string;
  notes: string;
}

export interface Thumb {
  url: string;
  alt: string;
}

export interface Draft {
  job: Job;
  /** Fields the editor typed over: postTitle, slug, excerpt, ytTitle, s_<channel>. */
  edits: Record<string, string>;
  /** Null until the post is edited: then the stage stops rewriting it. */
  blocks: Block[] | null;
  /** Null: the tags follow the job. */
  tags: string[] | null;
  /** Each social post's own link, once it is posted. */
  links: Partial<Record<ChannelId, string>>;
  thumb: Thumb | null;
  /** The won lead this post is about. */
  leadId: number | null;
}

export const JOB_TEXT_FIELDS = ['title', 'service', 'facility', 'area', 'frequency', 'size', 'client', 'handle', 'notes'] as const;
const JOB_LIMITS: Record<string, number> = { notes: 4000, title: 160 };

// -------------------------------------------------------------- model ---

export function blankJob(): Job {
  return {
    title: '',
    service: SERVICES[0].id,
    facility: FACILITIES[0].id,
    area: '',
    frequency: '',
    size: '',
    green: false,
    afterHours: false,
    client: '',
    nameClient: false,
    handle: '',
    notes: '',
  };
}

export function newDraft(): Draft {
  return { job: blankJob(), edits: {}, blocks: null, tags: null, links: {}, thumb: null, leadId: null };
}

export function slugify(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

const clean = (s: unknown) => String(s ?? '').trim().replace(/\s+/g, ' ');
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const serviceOf = (job: Job) => SERVICES.find((s) => s.id === job.service) ?? SERVICES[0];
export const facilityOf = (job: Job) => FACILITIES.find((f) => f.id === job.facility) ?? FACILITIES[0];
const frequencyOf = (job: Job) => FREQUENCIES.find((f) => f.id === job.frequency) ?? FREQUENCIES[0];
const areaOf = (job: Job) => AREAS.find((a) => a.name === job.area);
/** "a office" never: "an" before a vowel sound. */
const article = (noun: string) => (/^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`);

/** What the job is, in words the posts reuse. */
export function facts(job: Job) {
  const service = serviceOf(job);
  const facility = facilityOf(job);
  const frequency = frequencyOf(job);
  const area = clean(job.area);
  const client = job.nameClient ? clean(job.client) : '';
  const handle = job.nameClient ? clean(job.handle) : '';
  const size = clean(job.size);
  const where = area ? ` in ${area}` : '';
  const who = client || article(facility.noun);
  const title = clean(job.title) || cap(`${service.noun} for ${who}${where}`);
  const summary = `${cap(service.noun)} for ${who}${where}${frequency.phrase ? `, ${frequency.phrase}` : ''}.`;
  return {
    service,
    facility,
    frequency,
    area,
    areaHref: areaOf(job)?.href,
    client,
    handle,
    size,
    green: Boolean(job.green),
    afterHours: Boolean(job.afterHours),
    notes: String(job.notes ?? '').trim(),
    title,
    summary,
    whole: `The whole job, from the scope to the finished ${facility.noun}`,
    extraTags: [facility.hashtag],
  };
}

export const postUrl = (slug: string) => `${BUSINESS.site}/${slug ? `${slug}/` : ''}`;

export function excerpt(job: Job): string {
  const f = facts(job);
  const s = `${cap(f.service.noun)} for ${f.client || article(f.facility.noun)}${f.area ? ` in ${f.area}` : ''} by ${BUSINESS.name}${f.frequency.phrase ? `, ${f.frequency.phrase}` : ''}.`;
  return s.length > 160 ? `${s.slice(0, 157).replace(/\s+\S*$/, '')}…` : s;
}

/** The site tags a post about this job files under, most specific first. */
export function tagsFor(job: Job): string[] {
  const f = facts(job);
  return [...new Set([...f.facility.tags, ...f.service.tags, ...(f.green ? ['cleaning-products'] : [])])].filter((t) =>
    TAG_SLUGS.has(t)
  );
}

/**
 * The website post as text with "## " headings, the shape of a project
 * post: the client, the facility, the cleaning, the result, then the call to
 * action. Links are [words](/path/), which the block renderer turns into
 * links on the site.
 */
export function body(job: Job): string {
  const f = facts(job);
  const place = `${f.facility.noun}${f.area ? ` in ${f.area}` : ''}`;
  const parts = [
    `${f.client ? `${f.client} asked ${BUSINESS.name} to look after their ${place}` : `${cap(article(place))} asked ${BUSINESS.name} for ${f.service.noun}`}. Here is what the job involved, from the scope we agreed to the finished result.`,
  ];
  if (f.client) {
    parts.push('## The client', `${f.client} wanted a ${f.facility.noun} that staff and visitors could count on to be clean${f.handle ? ` (${f.handle})` : ''}.`);
  }
  const facility = [
    `The ${f.facility.noun}${f.size ? ` covers ${f.size}` : ''}${f.area ? `${f.size ? ',' : ''} in ${f.areaHref ? `[${f.area}](${f.areaHref})` : f.area}` : ''}.`,
  ];
  parts.push('## The facility', facility.join(' '));
  const work = [
    `We provided ${f.service.href ? `[${f.service.noun}](${f.service.href})` : f.service.noun}${f.frequency.phrase ? `, ${f.frequency.phrase}` : ''}${f.afterHours ? ', after hours so the space was ready before anyone arrived' : ''}.`,
  ];
  if (f.green) work.push('We used our [Green Clean products](/green-clean-products/), which are safer for the people who work in the space.');
  parts.push('## The cleaning', work.join(' '));
  if (f.notes) parts.push('## The result', f.notes);
  parts.push(
    `## Need a cleaning team for your ${f.facility.noun}?`,
    `${BUSINESS.name} looks after facilities across Toronto and the GTA. [Request a quote](/request-a-quote/) or call ${BUSINESS.phone}.`
  );
  return parts.join('\n\n');
}

/**
 * Written text as blocks: "# " and "## " a Heading 2 (the post's title is its
 * one Heading 1), "### " a Heading 3, "#### " a Heading 4, "- " or "1. "
 * lines a list, "> " a quote, the rest paragraphs (blank lines between). How
 * the job's draft becomes blocks, and how a post written elsewhere (ChatGPT)
 * is pasted in.
 */
export function blocksFromText(text: string): Block[] {
  const blocks: Block[] = [];
  const chunks = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
  for (const chunk of chunks) {
    const h = chunk.match(/^(#{1,4})\s+([\s\S]+)$/);
    if (h) {
      const level = Math.max(2, h[1].length) as 2 | 3 | 4;
      blocks.push({ t: `h${level}`, text: h[2].replace(/\s*\n\s*/g, ' ').replace(/^\*\*(.+)\*\*$/, '$1') });
      continue;
    }
    const lines = chunk.split('\n').map((l) => l.trim());
    if (lines.every((l) => /^[-*•]\s+/.test(l))) {
      blocks.push({ t: 'list', ordered: false, items: lines.map((l) => l.replace(/^[-*•]\s+/, '')) });
      continue;
    }
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ t: 'list', ordered: true, items: lines.map((l) => l.replace(/^\d+[.)]\s+/, '')) });
      continue;
    }
    if (lines.every((l) => /^>\s?/.test(l))) {
      blocks.push({ t: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join('\n') });
      continue;
    }
    blocks.push({ t: 'p', text: chunk });
  }
  return blocks;
}

/** The post as plain text again, for copying and for the ChatGPT brief. */
export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.t) {
        case 'h2':
        case 'h3':
        case 'h4':
          return `${'#'.repeat(Number(b.t[1]))} ${b.text}`;
        case 'p':
          return b.text;
        case 'quote':
          return b.text
            .split('\n')
            .map((l) => `> ${l}`)
            .join('\n');
        case 'list':
          return b.items.map((it, i) => `${b.ordered ? `${i + 1}.` : '-'} ${it.replace(/\n+/g, ' ')}`).join('\n');
        case 'img':
          return b.url ? `[Image: ${b.alt || b.url}]` : '';
        case 'grid':
          return b.cells
            .map((c) => [c.heading && `### ${c.heading}`, c.text].filter(Boolean).join('\n\n'))
            .filter(Boolean)
            .join('\n\n');
        case 'embed':
          return b.url;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

const tagLine = (job: Job, n: number) => {
  const f = facts(job);
  return [...new Set([...BUSINESS.hashtags, ...f.extraTags])]
    .slice(0, n)
    .map((t) => `#${t}`)
    .join(' ');
};

export function xLength(text: string): number {
  return String(text ?? '').replace(/https?:\/\/\S+/g, 'x'.repeat(23)).length;
}

export const lengthFor = (channel: ChannelId, text: string) =>
  channel === 'x' ? xLength(text) : String(text ?? '').length;

/**
 * One post per channel, every one pointing back to the website post, under
 * the website post's title (the job's, unless it was edited).
 */
export function caption(channel: ChannelId, job: Job, url: string, title = facts(job).title): string {
  const f = { ...facts(job), title };
  const summary = f.summary;
  switch (channel) {
    case 'li':
      return `${f.title}\n\n${summary}\n\n${f.whole}: ${url}\n\n${tagLine(job, 4)}`;
    case 'fb':
      return `${summary} ✨\n\nSee the whole job: ${url}`;
    case 'ig':
      return `${summary}\n\nThe whole job is on our site: link in bio.\n\n${tagLine(job, 8)}`;
    case 'yt':
      return `${f.title}\n\n${summary}\n\nRead about the job: ${url}\n\n${tagLine(job, 3)}`;
    case 'tt':
      return `${summary} The whole job: link in bio. ${tagLine(job, 5)}`;
    case 'x': {
      const tags = tagLine(job, 2);
      let s = summary;
      let text = `${s} ${url} ${tags}`;
      // Trim the summary, never the link, until it fits.
      while (xLength(text) > 280 && s.length > 20) {
        s = `${s.slice(0, s.length - 12).replace(/\s+\S*$/, '')}…`;
        text = `${s} ${url} ${tags}`;
      }
      return text;
    }
  }
}

export interface Rendered {
  title: string;
  slug: string;
  url: string;
  tags: string[];
  excerpt: string;
  blocks: Block[];
  ytTitle: string;
  social: Record<ChannelId, string>;
  body: string;
}

/** Everything one draft shows: what the editor typed wins over what the stage wrote. */
export function render(draft: Draft): Rendered {
  const { job, edits } = draft;
  const f = facts(job);
  const slug = edits.slug ?? slugify(edits.postTitle ?? f.title);
  const url = postUrl(slug);
  const blocks = draft.blocks ?? blocksFromText(body(job));
  const title = edits.postTitle ?? f.title;
  const social = {} as Record<ChannelId, string>;
  for (const c of CHANNELS) social[c.id] = edits[`s_${c.id}`] ?? caption(c.id, job, url, title);
  return {
    title,
    slug,
    url,
    tags: draft.tags ?? tagsFor(job),
    excerpt: edits.excerpt ?? excerpt(job),
    blocks,
    ytTitle: edits.ytTitle ?? title.slice(0, 100),
    social,
    body: blocksToText(blocks),
  };
}

/** A brief to paste into ChatGPT, to have the website post written there and pasted back. */
export function brief(draft: Draft): string {
  const f = facts(draft.job);
  const r = render(draft);
  return [
    `Write a blog post for ${BUSINESS.name} (${BUSINESS.site}), a commercial cleaning company in Toronto and the GTA, about a recent job.`,
    '',
    `Title: ${r.title}`,
    `Service: ${f.service.label}`,
    `Facility: ${f.facility.label}${f.size ? `, ${f.size}` : ''}`,
    `Area: ${f.area || 'not set'}`,
    `How often: ${f.frequency.label}`,
    `Green Clean products: ${f.green ? 'yes' : 'no'}`,
    `After hours: ${f.afterHours ? 'yes' : 'no'}`,
    `Client: ${f.client || 'not named (do not name them)'}${f.handle ? ` (${f.handle})` : ''}`,
    `Tags: ${r.tags.join(', ') || 'none'}`,
    '',
    'Notes from the job:',
    f.notes || '(none)',
    '',
    'Use "# " for the title and "## " for section headings. Sections: the client, the facility, the cleaning, the result, and a call to action to request a quote. Canadian English. No prices.',
  ].join('\n');
}

/** A social post's own link, if it is an https link on that platform. */
export function socialLink(channel: ChannelId, raw: unknown): string | null {
  const c = CHANNELS.find((x) => x.id === channel);
  let u: URL;
  try {
    u = new URL(String(raw ?? '').trim());
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
  return c && u.protocol === 'https:' && c.hosts.some((h) => host === h || host.endsWith(`.${h}`)) ? u.href : null;
}

/**
 * The "Follow this job on social" row at the end of the website post: a slot
 * for every platform the business is on, opening its profile, and for any
 * platform a post about this job is linked on, opening that post.
 */
export function socialSlots(draft: Draft): { id: ChannelId; name: string; href: string; posted: boolean }[] {
  return CHANNELS.flatMap((c) => {
    const posted = socialLink(c.id, draft.links?.[c.id]);
    const href = posted ?? c.profile;
    return href ? [{ id: c.id, name: c.name, href, posted: Boolean(posted) }] : [];
  });
}

/** The post's picture on the blog list and when shared: the chosen one, else its featured or first image. */
export function thumbFor(draft: Draft, blocks = render(draft).blocks): Thumb | null {
  if (draft.thumb?.url) return draft.thumb;
  const imgs = blocks.filter((b): b is Extract<Block, { t: 'img' }> => b.t === 'img' && Boolean(b.url));
  const img = imgs.find((b) => b.featured) ?? imgs[0];
  return img ? { url: img.url, alt: img.alt } : null;
}

const HTTPS_IMAGE = /^https:\/\/[^\s"'<>]{1,500}$/;

/**
 * Keeps only a well-formed draft. The page and the server both run it: the
 * page on what it loads, the server on what it is sent, so nothing else
 * reaches the database.
 */
export function sanitizeDraft(raw: unknown): Draft {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawJob = (d.job && typeof d.job === 'object' ? d.job : {}) as Record<string, unknown>;
  const job = blankJob();
  for (const k of JOB_TEXT_FIELDS) {
    if (k in rawJob) job[k] = String(rawJob[k] ?? '').slice(0, JOB_LIMITS[k] ?? 200);
  }
  job.green = rawJob.green === true;
  job.afterHours = rawJob.afterHours === true;
  job.nameClient = rawJob.nameClient === true;
  if (!SERVICES.some((s) => s.id === job.service)) job.service = SERVICES[0].id;
  if (!FACILITIES.some((f) => f.id === job.facility)) job.facility = FACILITIES[0].id;
  if (!FREQUENCIES.some((f) => f.id === job.frequency)) job.frequency = '';

  const edits: Record<string, string> = {};
  const EDITABLE = new Set(['postTitle', 'slug', 'excerpt', 'ytTitle', ...CHANNELS.map((c) => `s_${c.id}`)]);
  for (const [k, v] of Object.entries((d.edits && typeof d.edits === 'object' ? d.edits : {}) as Record<string, unknown>)) {
    if (EDITABLE.has(k) && typeof v === 'string') edits[k] = v.slice(0, k.startsWith('s_') ? 6000 : 400);
  }
  if ('slug' in edits) edits.slug = slugify(edits.slug);

  const links: Partial<Record<ChannelId, string>> = {};
  const rawLinks = (d.links && typeof d.links === 'object' ? d.links : {}) as Record<string, unknown>;
  for (const c of CHANNELS) if (typeof rawLinks[c.id] === 'string') links[c.id] = String(rawLinks[c.id]).slice(0, 500);

  const t = d.thumb as Record<string, unknown> | null | undefined;
  const thumb = t && typeof t.url === 'string' && HTTPS_IMAGE.test(t.url) ? { url: t.url, alt: String(t.alt ?? '').slice(0, 300) } : null;

  const tags = Array.isArray(d.tags) ? [...new Set(d.tags.filter((x): x is string => typeof x === 'string' && TAG_SLUGS.has(x)))] : null;
  const leadId = Number.isSafeInteger(d.leadId) && (d.leadId as number) > 0 ? (d.leadId as number) : null;

  return { job, edits, blocks: Array.isArray(d.blocks) ? cleanBlocks(d.blocks) : null, tags, links, thumb, leadId };
}

// --------------------------------------------------------- from a job ---

export interface LeadJob {
  id: number;
  business_name?: string | null;
  full_name?: string | null;
  address?: string | null;
  services?: string | null;
  facility_type?: string | null;
  facility_size?: string | null;
  message?: string | null;
}

const SERVICE_WORDS: [string, RegExp][] = [
  ['post-construction', /construction|renovation/i],
  ['disinfection', /disinfect|sanitiz|covid/i],
  ['condo', /condo|common area/i],
  ['warehouse', /warehouse/i],
  ['industrial', /industrial|plant|factory/i],
  ['janitorial', /janitor/i],
  ['pressure-washing', /pressure|power wash/i],
  ['graffiti', /graffiti/i],
  ['emergency', /emergency|flood/i],
  ['office', /office/i],
  ['commercial', /commercial/i],
];

const FACILITY_WORDS: [string, RegExp][] = [
  ['dental', /dental|dentist|orthodont/i],
  ['medical', /medical|clinic|physio|health|lab/i],
  ['daycare', /daycare|child ?care|nursery/i],
  ['school', /school|college|university|academy/i],
  ['retail', /retail|store|shop|showroom/i],
  ['warehouse', /warehouse|distribution/i],
  ['industrial', /industrial|plant|factory|manufactur/i],
  ['condo', /condo|residential|apartment/i],
  ['property', /property|building|plaza/i],
  ['restaurant', /restaurant|cafe|kitchen/i],
  ['gym', /gym|fitness|studio/i],
  ['office', /office|corporate|firm/i],
];

/**
 * A draft filled in from a won lead, as Rana's "Start post" fills one from a
 * shop job. The client is NOT named by default: a lead never agreed to be
 * featured, so naming them is a box the editor ticks once they have.
 */
export function draftFromLead(lead: LeadJob): Draft {
  const d = newDraft();
  const said = `${lead.services ?? ''} ${lead.facility_type ?? ''}`;
  const service = SERVICE_WORDS.find(([id, re]) => re.test(said) && SERVICES.some((s) => s.id === id))?.[0];
  const facility = FACILITY_WORDS.find(([, re]) => re.test(`${lead.facility_type ?? ''} ${lead.business_name ?? ''}`))?.[0];
  // A whole area name in the address ("Vaughan & Concord" either half).
  // "Toronto" alone says nothing about which part, so it sets no area.
  const address = ` ${String(lead.address ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  const area = AREAS.find((a) =>
    a.name
      .toLowerCase()
      .split(' & ')
      .some((n) => address.includes(` ${n.replace(/[^a-z0-9]+/g, ' ').trim()} `))
  )?.name;
  Object.assign(d.job, {
    ...(service ? { service } : {}),
    ...(facility ? { facility } : {}),
    area: area ?? '',
    size: String(lead.facility_size ?? '').slice(0, 200),
    client: String(lead.business_name || lead.full_name || '').slice(0, 200),
    nameClient: false,
  });
  // The lead's own message is NOT copied into the notes: it is the client's
  // words, often with a name and a phone number, and the notes become the
  // post's "The result". The job tab shows it beside the form instead.
  d.leadId = lead.id;
  return d;
}

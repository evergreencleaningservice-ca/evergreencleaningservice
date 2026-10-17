/**
 * /admin/blog/create-blog/: the post stage, after UiD by Rana's
 * (dist/post-stage.js and dist/post-publish.js).
 *
 * The draft is saved on the server a moment after each change (one copy for
 * every device; an older copy is refused, and the newer one shown). The
 * model — what the job becomes — is src/lib/admin/post-model.ts, shared with
 * the server, so what is shown here is what publishing writes.
 */
import { blocksToHtml, imageUrl, type Block } from '../lib/admin/blocks';
import {
  AREA_NAMES,
  CHANNELS,
  FACILITIES,
  FREQUENCIES,
  SERVICES,
  TAGS,
  blocksFromText,
  brief,
  facts,
  lengthFor,
  newDraft,
  render,
  sanitizeDraft,
  slugify,
  socialLink,
  socialSlots,
  thumbFor,
  type ChannelId,
  type Draft,
  type Job,
} from '../lib/admin/post-model';
import { mountBlocks, type BlocksEditor } from './blocks-editor';
import { $, api, ApiError, copyText, debounce, esc, fmtDate, fmtDateTime, notice, signedIn, store, toast } from './common';

interface PostDoc {
  id: number;
  version: number;
  status: 'draft' | 'published';
  leadId: number | null;
  liveSlug: string | null;
  publishedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  stale: boolean;
}

type Lead = Record<string, unknown> | null;

const params = new URLSearchParams(location.search);
const editorEl = $('[data-editor]');
const statusEl = $('[data-status]');
let post: PostDoc | null = null;
let draft: Draft = newDraft();
let lead: Lead = null;
let blocksEditor: BlocksEditor | null = null;
let tab = store.get('tab') ?? 'job';
let saveState: 'saved' | 'dirty' | 'saving' | 'error' = 'saved';
let saveError = '';
let inflight = false;
let again = false;

const keep = (p: PostDoc & { draft?: Draft }): PostDoc => {
  const { draft: _d, ...rest } = p;
  return rest;
};

// ------------------------------------------------------------- opening ---

async function openPost(id: number) {
  const { post: p, lead: l } = await api<{ post: PostDoc & { draft: Draft }; lead: Lead }>(`/posts/${id}`);
  load(p, l);
}

async function startFromJob(leadId: number) {
  const body = await api<{ post: PostDoc & { draft: Draft }; existing?: boolean }>('/posts', {
    method: 'POST',
    body: JSON.stringify({ fromLead: leadId }),
  });
  if (body.existing) toast('This job already has a post: opened it.');
  history.replaceState(null, '', `?id=${body.post.id}`);
  await openPost(body.post.id);
}

async function startNew() {
  const { post: p } = await api<{ post: PostDoc & { draft: Draft } }>('/posts', { method: 'POST', body: JSON.stringify({ draft: newDraft() }) });
  history.replaceState(null, '', `?id=${p.id}`);
  load(p, null);
}

function load(p: PostDoc & { draft: Draft }, l: Lead) {
  post = keep(p);
  draft = sanitizeDraft(p.draft);
  lead = l;
  // A live post keeps its address unless it is changed on purpose: a new
  // title must never quietly move it and break the old link.
  if (post.liveSlug && draft.edits.slug === undefined) draft.edits.slug = post.liveSlug;
  saveState = 'saved';
  $('[data-empty]').hidden = true;
  editorEl.hidden = false;
  drawAll();
}

function showEmpty() {
  $('[data-empty]').hidden = false;
  editorEl.hidden = true;
}

// --------------------------------------------------------------- picker ---

async function picker() {
  const sel = $<HTMLSelectElement>('[data-picker]');
  const [posts, jobs] = await Promise.all([
    api<{ posts: { id: number; status: string; title: string; updatedAt: string }[] }>('/posts').then((b) => b.posts).catch(() => []),
    api<{ jobs: { id: number; business_name?: string; full_name?: string; services?: string; won_at?: string; post_id?: number | null; post_skipped_at?: string | null }[] }>('/jobs')
      .then((b) => b.jobs)
      .catch(() => []),
  ]);
  const opt = (value: string, label: string) => `<option value="${esc(value)}"${post && value === `id:${post.id}` ? ' selected' : ''}>${esc(label)}</option>`;
  const drafts = posts.filter((p) => p.status !== 'published');
  const live = posts.filter((p) => p.status === 'published');
  const waiting = jobs.filter((j) => !j.post_id && !j.post_skipped_at);
  sel.innerHTML = [
    `<option value="">${post ? 'Open another…' : 'Open a draft, a live post or a job…'}</option>`,
    drafts.length ? `<optgroup label="Drafts">${drafts.map((p) => opt(`id:${p.id}`, `${p.title || 'Untitled'} · saved ${fmtDate(p.updatedAt)}`)).join('')}</optgroup>` : '',
    live.length ? `<optgroup label="Live">${live.map((p) => opt(`id:${p.id}`, p.title || 'Untitled')).join('')}</optgroup>` : '',
    waiting.length
      ? `<optgroup label="Jobs waiting for a post">${waiting
          .map((j) => opt(`job:${j.id}`, [j.business_name || j.full_name || `Job #${j.id}`, j.services, j.won_at && `won ${fmtDate(j.won_at)}`].filter(Boolean).join(' · ')))
          .join('')}</optgroup>`
      : '',
  ].join('');
  sel.onchange = () => {
    const [kind, id] = sel.value.split(':');
    if (!id) return;
    saveNow().finally(() => {
      location.href = kind === 'job' ? `?job=${id}` : `?id=${id}`;
    });
  };
}

// --------------------------------------------------------------- drawing ---

const opts = (list: { id: string; label: string }[], value: string) =>
  list.map((o) => `<option value="${esc(o.id)}"${o.id === value ? ' selected' : ''}>${esc(o.label)}</option>`).join('');

const redo = (k: string) => `<button class="ad-redo" type="button" data-redo="${k}" title="Rewrite from the job" hidden>↺ Rewrite</button>`;

function jobPane(job: Job): string {
  const areas = [{ id: '', label: 'Not set' }, ...AREA_NAMES.map((a) => ({ id: a, label: a }))];
  if (job.area && !AREA_NAMES.includes(job.area)) areas.push({ id: job.area, label: job.area });
  return `<div class="ad-panel">
    <div class="ad-panel-head"><h2>The job</h2><span class="ad-hint">Fill this in once: the website post and every social post are written from it.</span></div>
    <label class="ad-field"><span class="ad-label">Title <span class="ad-hint">leave empty to have it written from the job</span></span>
      <input class="ad-input" data-job="title" maxlength="160" value="${esc(job.title)}" /></label>
    <div class="ad-grid-2">
      <label class="ad-field"><span class="ad-label">Service</span><select class="ad-select" data-job="service">${opts(SERVICES, job.service)}</select></label>
      <label class="ad-field"><span class="ad-label">Facility</span><select class="ad-select" data-job="facility">${opts(FACILITIES, job.facility)}</select></label>
      <label class="ad-field"><span class="ad-label">Area</span><select class="ad-select" data-job="area">${opts(areas, job.area)}</select></label>
      <label class="ad-field"><span class="ad-label">How often</span><select class="ad-select" data-job="frequency">${opts(FREQUENCIES, job.frequency)}</select></label>
    </div>
    <label class="ad-field"><span class="ad-label">Size <span class="ad-hint">optional, e.g. 6,000 sq ft over two floors</span></span>
      <input class="ad-input" data-job="size" maxlength="200" value="${esc(job.size)}" /></label>
    <label class="ad-check"><input type="checkbox" data-job="green" ${job.green ? 'checked' : ''} /> Cleaned with Green Clean products</label>
    <label class="ad-check"><input type="checkbox" data-job="afterHours" ${job.afterHours ? 'checked' : ''} /> Cleaned after hours</label>
    <h3 style="margin:18px 0 10px">Client</h3>
    <label class="ad-field"><span class="ad-label">Client name</span><input class="ad-input" data-job="client" maxlength="200" value="${esc(job.client)}" /></label>
    <label class="ad-check"><input type="checkbox" data-job="nameClient" ${job.nameClient ? 'checked' : ''} /> Name the client in the posts <span class="ad-hint">only once they have agreed</span></label>
    <label class="ad-field" data-handle ${job.nameClient ? '' : 'hidden'}><span class="ad-label">Their website or social handle <span class="ad-hint">optional</span></span>
      <input class="ad-input" data-job="handle" maxlength="200" value="${esc(job.handle)}" /></label>
    <label class="ad-field"><span class="ad-label">Description / notes <span class="ad-hint">what was done and how it turned out: this becomes "The result"</span></span>
      <textarea class="ad-textarea" data-job="notes" rows="6" maxlength="4000">${esc(job.notes)}</textarea></label>
  </div>`;
}

function webPane(): string {
  return `<div class="ad-panel">
    <label class="ad-field"><span class="ad-label">Title ${redo('postTitle')}</span><input class="ad-input" data-edit="postTitle" maxlength="160" /></label>
    <label class="ad-field"><span class="ad-label">Address on the site ${redo('slug')}</span>
      <span class="ad-slug"><span>evergreencleaningservice.ca/</span><input class="ad-input" data-edit="slug" maxlength="80" autocapitalize="off" spellcheck="false" /></span>
      <span class="ad-hint" data-slug-hint></span></label>
    <div class="ad-field"><span class="ad-label">Tags ${redo('tags')}</span><div class="ad-tagset" data-tags>${TAGS.map(
      (t) => `<button class="ad-chip" type="button" data-tag="${esc(t.slug)}" aria-pressed="false">${esc(t.name)}</button>`
    ).join('')}</div></div>
    <label class="ad-field"><span class="ad-label">Excerpt <span><span class="ad-count" data-count="excerpt"></span> ${redo('excerpt')}</span></span>
      <textarea class="ad-textarea" data-edit="excerpt" rows="2" maxlength="400" style="min-height:60px"></textarea>
      <span class="ad-hint">Shown on the blog list and in search results. Up to 160 characters.</span></label>
    <div class="ad-field"><span class="ad-label">Thumbnail</span><div data-thumb></div></div>
  </div>
  <div class="ad-panel">
    <div class="ad-panel-head"><h2>The post</h2>${redo('blocks')}</div>
    <div data-blocks></div>
  </div>`;
}

function socialPane(): string {
  return `<div class="ad-live is-stale" data-update hidden style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <span style="flex:1">The website post has changes that are not on the site yet.</span>
      <button class="ad-btn ad-btn-primary ad-btn-sm" type="button" data-act="republish">Update the website post</button>
    </div>
    <p class="ad-hint" style="margin:0 0 14px">Post each one on its platform, then paste the link to it here. Once the website post is updated, its "Follow this job on social" row opens these posts.</p>
    <div class="ad-socials">${CHANNELS.map(
      (c) => `<div class="ad-panel" data-ch="${c.id}">
        <div class="ad-social-head"><h3>${esc(c.name)}</h3><span class="ad-posted" data-posted="${c.id}"></span><span class="ad-count" data-count="s_${c.id}"></span></div>
        ${c.note ? `<p class="ad-hint" style="margin:-4px 0 10px">${esc(c.note)}</p>` : ''}
        ${c.id === 'yt' ? `<label class="ad-field"><span class="ad-label">Video title <span><span class="ad-count" data-count="ytTitle"></span> ${redo('ytTitle')}</span></span><input class="ad-input" data-edit="ytTitle" maxlength="100" /></label>` : ''}
        <label class="ad-field"><span class="ad-label">Post ${redo(`s_${c.id}`)}</span><textarea class="ad-textarea" data-edit="s_${c.id}" rows="6"></textarea></label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button class="ad-btn ad-btn-sm" type="button" data-copy="${c.id}">Copy</button>
          <input class="ad-input" style="flex:1;min-width:220px" data-link="${c.id}" inputmode="url" placeholder="Link to the ${esc(c.name)} post, once it is up" />
        </div>
        <p class="ad-hint" style="margin:6px 0 0" data-link-hint="${c.id}"></p>
      </div>`
    ).join('')}</div>`;
}

function leadBox() {
  const el = $('[data-lead]');
  if (!lead) {
    el.hidden = true;
    return;
  }
  const dd = (k: string, v: unknown) => (v ? `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>` : '');
  el.hidden = false;
  el.innerHTML = `<h3 style="margin-bottom:8px">From the job</h3>
    <dl class="ad-dl">${dd('Client', lead.business_name || lead.full_name)}${dd('Services', lead.services)}${dd('Facility', [lead.facility_type, lead.facility_size].filter(Boolean).join(', '))}${dd('Address', lead.address)}${dd('Won', fmtDate(lead.won_at))}</dl>
    ${lead.message ? `<p class="ad-hint" style="margin:10px 0 4px">What they asked for (not copied into the post):</p><p class="ad-message" style="font-size:.85rem">${esc(lead.message)}</p>` : ''}
    <p style="margin:10px 0 0"><a href="/admin/leads/?id=${esc(lead.id)}&status=won">Open the lead</a></p>`;
}

function drawAll() {
  $('[data-pane="job"]').innerHTML = jobPane(draft.job);
  $('[data-pane="web"]').innerHTML = webPane();
  $('[data-pane="social"]').innerHTML = socialPane();
  const r = render(draft);
  blocksEditor = mountBlocks($('[data-blocks]'), r.blocks, {
    onChange: (blocks: Block[]) => {
      draft.blocks = blocks;
      changed();
    },
    upload,
    onError: (m) => toast(m, true),
  });
  for (const c of CHANNELS) {
    const input = $<HTMLInputElement>(`[data-link="${c.id}"]`);
    input.value = draft.links[c.id] ?? '';
  }
  leadBox();
  showTab(tab);
  refresh();
}

/** Everything that follows from the draft, without touching the field being typed in. */
function refresh() {
  const r = render(draft);
  const focused = document.activeElement;
  const editValue = (k: string): string => {
    if (k === 'postTitle') return r.title;
    if (k === 'slug') return r.slug;
    if (k === 'excerpt') return r.excerpt;
    if (k === 'ytTitle') return r.ytTitle;
    return r.social[k.slice(2) as ChannelId] ?? '';
  };
  document.querySelectorAll<HTMLInputElement>('[data-edit]').forEach((el) => {
    const k = el.dataset.edit!;
    if (el !== focused) el.value = editValue(k);
  });
  document.querySelectorAll<HTMLElement>('[data-redo]').forEach((el) => {
    const k = el.dataset.redo!;
    el.hidden = k === 'tags' ? draft.tags === null : k === 'blocks' ? draft.blocks === null : !(k in draft.edits);
  });
  const count = (k: string, n: number, limit: number) => {
    const el = $(`[data-count="${k}"]`);
    if (!el) return;
    el.textContent = `${n} / ${limit}`;
    el.classList.toggle('is-over', n > limit);
  };
  count('excerpt', r.excerpt.length, 160);
  count('ytTitle', r.ytTitle.length, 100);
  for (const c of CHANNELS) count(`s_${c.id}`, lengthFor(c.id, r.social[c.id]), c.limit);

  const title = $<HTMLInputElement>('[data-job="title"]');
  if (title) title.placeholder = facts({ ...draft.job, title: '' }).title;
  $('[data-handle]').hidden = !draft.job.nameClient;

  document.querySelectorAll<HTMLElement>('[data-tag]').forEach((el) => el.setAttribute('aria-pressed', String(r.tags.includes(el.dataset.tag!))));

  const slugHint = $('[data-slug-hint]');
  if (slugHint) {
    slugHint.textContent =
      post?.liveSlug && r.slug !== post.liveSlug
        ? `Publishing moves the post from /${post.liveSlug}/ to /${r.slug}/: the old address will stop working.`
        : `${location.origin}/${r.slug}/`;
  }

  drawThumb(r.blocks);

  let posted = 0;
  for (const c of CHANNELS) {
    const raw = draft.links[c.id] ?? '';
    const ok = socialLink(c.id, raw);
    if (ok) posted++;
    $(`[data-posted="${c.id}"]`).textContent = ok ? '✓ Posted' : '';
    $(`[data-link-hint="${c.id}"]`).innerHTML = !raw.trim()
      ? ''
      : ok
        ? `Its slot at the end of the website post opens this ${esc(c.name)} post.`
        : `<span style="color:var(--ad-bad)">Not a link to a ${esc(c.name)} post (it must be https on ${esc(c.hosts[0])}).</span>`;
  }
  $('[data-social-count]').textContent = `${posted}/${CHANNELS.length} posted`;
  $('[data-web-tick]').textContent = post?.status === 'published' ? '✓' : '';

  const live = $('[data-live]');
  const stale = post?.status === 'published' && (post.stale || saveState !== 'saved');
  live.className = `ad-live${post?.status === 'published' ? (stale ? ' is-stale' : '') : ' is-draft'}`;
  live.innerHTML =
    post?.status === 'published'
      ? `Live at <a href="/${esc(post.liveSlug)}/" target="_blank" rel="noopener">/${esc(post.liveSlug)}/</a>${
          post.publishedAt ? ` since ${esc(fmtDate(post.publishedAt))}` : ''
        }${stale ? '<br><small>Has changes not on the site yet: publish again to update it.</small>' : ''}`
      : `Not on the site yet. Publishing puts it at <strong>/${esc(r.slug)}/</strong> and first on News.`;
  const update = $('[data-update]');
  if (update) update.hidden = !stale;
  $<HTMLButtonElement>('[data-publish]').textContent = post?.status === 'published' ? 'Publish again…' : 'Publish…';
  status();
}

function drawThumb(blocks: Block[]) {
  const el = $('[data-thumb]');
  if (!el) return;
  const chosen = draft.thumb;
  const auto = chosen ? null : thumbFor(draft, blocks);
  const shown = chosen ?? auto;
  if (el.contains(document.activeElement)) return;
  el.innerHTML = `<div class="ad-thumb">
    ${shown ? `<img src="${esc(shown.url)}" alt="" />` : '<div class="ad-thumb-empty">No picture</div>'}
    <div style="display:grid;gap:6px;flex:1;min-width:220px">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <label class="ad-btn ad-btn-sm">Upload a thumbnail<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden data-thumb-upload /></label>
        <button class="ad-btn ad-btn-sm" type="button" data-thumb-url>Use an address…</button>
        ${chosen ? '<button class="ad-btn ad-btn-sm ad-btn-quiet" type="button" data-thumb-remove>Remove</button>' : ''}
      </div>
      ${chosen ? `<input class="ad-input" data-thumb-alt maxlength="300" placeholder="Describe the picture" value="${esc(chosen.alt)}" />` : ''}
      <span class="ad-hint">${chosen ? 'The picture on the blog list, at the top of the post, and when it is shared.' : auto ? "Using the post's featured or first image. Upload one to choose another." : 'Without one, the post has no picture on the blog list.'}</span>
    </div>
  </div>`;
}

function status() {
  statusEl.classList.toggle('is-bad', saveState === 'error');
  statusEl.textContent =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'dirty'
        ? 'Not saved yet'
        : saveState === 'error'
          ? `Not saved: ${saveError}`
          : post
            ? `Saved ${fmtDateTime(post.updatedAt)}${post.updatedBy ? ` by ${post.updatedBy}` : ''}`
            : '';
}

function showTab(id: string) {
  tab = ['job', 'web', 'social'].includes(id) ? id : 'job';
  store.set('tab', tab);
  document.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll<HTMLElement>('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== tab));
}

// ---------------------------------------------------------------- saving ---

const queueSave = debounce(() => void save(), 700);

function changed() {
  saveState = 'dirty';
  refresh();
  queueSave();
}

async function save(): Promise<void> {
  if (!post) return;
  if (inflight) {
    again = true;
    return;
  }
  inflight = true;
  saveState = 'saving';
  status();
  try {
    const sent = JSON.stringify({ version: post.version, draft });
    const { post: p } = await api<{ post: PostDoc & { draft: Draft } }>(`/posts/${post.id}`, { method: 'PUT', body: sent });
    post = keep(p);
    saveState = again ? 'dirty' : 'saved';
  } catch (err) {
    const e = err as ApiError;
    if (e.status === 409 && e.body.post) {
      load(e.body.post as PostDoc & { draft: Draft }, lead);
      toast('This post was changed on another device: showing the newer copy.', true);
      again = false;
    } else {
      saveState = 'error';
      saveError = e.message;
      setTimeout(() => saveState === 'error' && void save(), 5000);
    }
  } finally {
    inflight = false;
    refresh();
    if (again) {
      again = false;
      await save();
    }
  }
}

/** Save now, and wait for it: before publishing or leaving. */
async function saveNow() {
  if (saveState === 'saved' && !inflight) return;
  queueSave.flush();
  while (inflight) await new Promise((r) => setTimeout(r, 50));
  if (saveState === 'dirty') await save();
}

async function upload(file: File): Promise<string> {
  const form = new FormData();
  form.set('file', file);
  const { url } = await api<{ url: string }>('/image', { method: 'POST', body: form });
  return url;
}

// ------------------------------------------------------------ publishing ---

async function publish(live: boolean): Promise<string | null> {
  if (!post) return 'No post open.';
  await saveNow();
  if (saveState === 'error') return `It could not be saved first: ${saveError}`;
  try {
    const { post: p, url } = await api<{ post: PostDoc & { draft: Draft }; url: string }>(`/posts/${post.id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ version: post.version, live }),
    });
    post = keep(p);
    refresh();
    toast(live ? `Live at ${url}` : post.liveSlug === null ? 'Kept as a draft' : 'Taken off the site');
    picker();
    return null;
  } catch (err) {
    const e = err as ApiError;
    if (e.status === 409 && e.body.post) load(e.body.post as PostDoc & { draft: Draft }, lead);
    return e.message;
  }
}

function openPublish() {
  const dialog = $<HTMLDialogElement>('[data-publish-dialog]');
  const r = render(draft);
  const isLive = post?.status === 'published';
  $('[data-publish-where]').textContent = `At ${location.origin}/${r.slug}/ straight away, and first on News, the sitemap and the RSS feed.`;
  $('[data-draft-label]').textContent = isLive ? 'Take it off the site (draft)' : 'Keep it as a draft';
  $('[data-draft-hint]').textContent = isLive ? 'It leaves its address and the News list. Nothing is deleted.' : 'Saved here, not on the site.';
  $('[data-publish-error]').hidden = true;
  const form = $<HTMLFormElement>('[data-publish-form]');
  (form.elements.namedItem('live') as RadioNodeList).value = '1';
  $('[data-publish-go]').textContent = 'Publish';
  dialog.showModal();
}

$('[data-publish-form]').addEventListener('change', (e) => {
  const v = (e.target as HTMLInputElement).value;
  $('[data-publish-go]').textContent = v === '1' ? 'Publish' : post?.status === 'published' ? 'Take it off' : 'Keep as draft';
});

$('[data-publish-form]').addEventListener('submit', async (e) => {
  const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value !== 'go') return;
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const live = (form.elements.namedItem('live') as RadioNodeList).value === '1';
  if (!live && post?.status !== 'published') {
    $<HTMLDialogElement>('[data-publish-dialog]').close();
    await saveNow();
    toast('Kept as a draft');
    return;
  }
  submitter.disabled = true;
  submitter.textContent = live ? 'Publishing…' : 'Taking it off…';
  const problem = await publish(live);
  submitter.disabled = false;
  if (problem) {
    const el = $('[data-publish-error]');
    el.hidden = false;
    el.textContent = problem;
    submitter.textContent = live ? 'Publish' : 'Take it off';
  } else {
    $<HTMLDialogElement>('[data-publish-dialog]').close();
  }
});

// ---------------------------------------------------------------- events ---

editorEl.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.job) {
    const job = draft.job as unknown as Record<string, string | boolean>;
    job[el.dataset.job] = el.type === 'checkbox' ? el.checked : el.value;
    // Blocks nobody has edited follow the job.
    if (draft.blocks === null) blocksEditor?.set(render(draft).blocks);
    changed();
  } else if (el.dataset.edit) {
    const k = el.dataset.edit;
    draft.edits[k] = k === 'slug' ? slugify(el.value) : el.value;
    if (draft.blocks === null && k === 'postTitle') blocksEditor?.set(render(draft).blocks);
    changed();
  } else if (el.dataset.link) {
    draft.links[el.dataset.link as ChannelId] = el.value.trim();
    changed();
  } else if (el.dataset.thumbAlt !== undefined && draft.thumb) {
    draft.thumb.alt = el.value;
    changed();
  }
});

editorEl.addEventListener('focusout', (e) => {
  // The address shown as it will be, once typing in it stops.
  if ((e.target as HTMLElement).dataset?.edit === 'slug') setTimeout(refresh, 0);
});

editorEl.addEventListener('change', async (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.thumbUpload !== undefined && el.files?.[0]) {
    const label = el.closest('label');
    if (label) label.firstChild!.textContent = 'Uploading…';
    try {
      const url = await upload(el.files[0]);
      draft.thumb = { url, alt: draft.thumb?.alt ?? '' };
      changed();
    } catch (err) {
      toast((err as Error).message, true);
      refresh();
    }
  }
});

editorEl.addEventListener('click', async (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button, [data-tab]');
  if (!t) return;
  if (t.dataset.tab) return showTab(t.dataset.tab);
  if (t.dataset.redo) {
    const k = t.dataset.redo;
    if (k === 'tags') draft.tags = null;
    else if (k === 'blocks') {
      if (!confirm('Rewrite the post from the job? Its text and blocks are replaced.')) return;
      draft.blocks = null;
      blocksEditor?.set(render(draft).blocks);
    } else {
      if (k === 'slug' && post?.liveSlug && !confirm(`Rewrite the address from the title? Publishing would then move the post from /${post.liveSlug}/.`)) return;
      delete draft.edits[k];
    }
    changed();
    return;
  }
  if (t.dataset.tag) {
    const tags = new Set(render(draft).tags);
    if (tags.has(t.dataset.tag)) tags.delete(t.dataset.tag);
    else tags.add(t.dataset.tag);
    draft.tags = TAGS.map((x) => x.slug).filter((s) => tags.has(s));
    changed();
    return;
  }
  if (t.dataset.copy) {
    const c = CHANNELS.find((x) => x.id === t.dataset.copy)!;
    const r = render(draft);
    copyText(c.id === 'yt' ? `${r.ytTitle}\n\n${r.social.yt}` : r.social[c.id], `${c.name} post`);
    return;
  }
  if (t.hasAttribute('data-thumb-url')) {
    const v = prompt('The picture\'s address (https://…)', draft.thumb?.url ?? 'https://');
    if (v === null) return;
    const url = imageUrl(v);
    if (!url) return toast('That is not an https image address.', true);
    draft.thumb = { url, alt: draft.thumb?.alt ?? '' };
    changed();
    return;
  }
  if (t.hasAttribute('data-thumb-remove')) {
    draft.thumb = null;
    changed();
    return;
  }
  if (t.hasAttribute('data-publish')) return openPublish();
  if (t.hasAttribute('data-menu-toggle')) {
    const menu = $('[data-menu]');
    menu.hidden = !menu.hidden;
    t.setAttribute('aria-expanded', String(!menu.hidden));
    return;
  }
  const act = t.dataset.act;
  if (!act) return;
  $('[data-menu]').hidden = true;
  const r = render(draft);
  if (act === 'rewrite') {
    if (!confirm('Rewrite the post from the job? Its text and blocks are replaced.')) return;
    draft.blocks = null;
    blocksEditor?.set(render(draft).blocks);
    changed();
  } else if (act === 'paste') {
    $<HTMLTextAreaElement>('[data-paste-text]').value = '';
    $<HTMLDialogElement>('[data-paste-dialog]').showModal();
  } else if (act === 'brief') {
    copyText(brief(draft), 'Brief');
  } else if (act === 'copy') {
    copyText(`# ${r.title}\n\n${r.body}`, 'Post');
  } else if (act === 'preview') {
    const thumb = thumbFor(draft, r.blocks);
    $('[data-preview]').innerHTML = `<h1>${esc(r.title)}</h1>${thumb ? `<p><img src="${esc(thumb.url)}" alt="${esc(thumb.alt)}" style="width:100%;aspect-ratio:2/1;object-fit:cover"></p>` : ''}${blocksToHtml(r.blocks, socialSlots(draft))}`;
    $<HTMLDialogElement>('[data-preview-dialog]').showModal();
  } else if (act === 'republish') {
    const btn = t as HTMLButtonElement;
    btn.disabled = true;
    const problem = await publish(true);
    btn.disabled = false;
    if (problem) toast(problem, true);
  } else if (act === 'delete') {
    if (post?.status === 'published') return toast('Take it off the site first: Publish again… → Take it off the site.', true);
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    try {
      await api(`/posts/${post!.id}`, { method: 'DELETE' });
      saveState = 'saved';
      location.href = '/admin/blog/';
    } catch (err) {
      toast((err as Error).message, true);
    }
  }
});

document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('.ad-menu')) {
    const menu = $('[data-menu]');
    if (menu && !menu.hidden) menu.hidden = true;
  }
});

$('[data-paste-dialog] form').addEventListener('submit', (e) => {
  const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value !== 'go') return;
  let text = $<HTMLTextAreaElement>('[data-paste-text]').value.replace(/\r\n?/g, '\n').trim();
  if (!text) return;
  const first = text.match(/^#\s+(.+)\n?/);
  if (first) {
    draft.edits.postTitle = first[1].replace(/^\*\*(.+)\*\*$/, '$1').trim();
    text = text.slice(first[0].length).trim();
  }
  draft.blocks = blocksFromText(text);
  blocksEditor?.set(draft.blocks);
  changed();
  toast('Pasted into the post');
});

window.addEventListener('beforeunload', (e) => {
  if (saveState === 'dirty' || saveState === 'saving' || inflight) {
    queueSave.flush();
    e.preventDefault();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveState === 'dirty') queueSave.flush();
});

// ------------------------------------------------------------------ start ---

(async () => {
  if (!(await signedIn())) return;
  try {
    const id = Number(params.get('id'));
    const job = Number(params.get('job'));
    if (id > 0) await openPost(id);
    else if (job > 0) await startFromJob(job);
    else if (params.get('new')) await startNew();
    else showEmpty();
  } catch (err) {
    notice((err as Error).message);
    showEmpty();
  }
  picker();
})();

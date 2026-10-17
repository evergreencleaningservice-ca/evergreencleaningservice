/**
 * /admin/jobs/: won leads in four groups — waiting for a post, a post started,
 * posted, and no post needed — with Start post, as Rana's shop screen has it.
 */
import { $, api, esc, fmtDate, fmtMoney, notice, signedIn, toast } from './common';

interface Job {
  id: number;
  won_at: string | null;
  won_value_cad: string | null;
  full_name: string | null;
  business_name: string | null;
  address: string | null;
  services: string | null;
  facility_type: string | null;
  facility_size: string | null;
  post_skipped_at?: string | null;
  post_id?: number | null;
  post_status?: 'draft' | 'published' | null;
  post_slug?: string | null;
}

const root = $('[data-jobs]');
let jobs: Job[] = [];
let postsReady = true;

function card(j: Job): string {
  const what = [j.services, j.facility_type, j.facility_size].filter(Boolean).join(' · ');
  const meta = [j.won_at && `Won ${fmtDate(j.won_at)}`, fmtMoney(j.won_value_cad), j.address].filter(Boolean).join(' · ');
  let actions = '';
  if (!postsReady) actions = '';
  else if (j.post_status === 'published')
    actions = `<a class="ad-btn" href="/${esc(j.post_slug)}/" target="_blank" rel="noopener">View post</a><a class="ad-btn ad-btn-quiet" href="/admin/blog/create-blog/?id=${j.post_id}">Edit</a>`;
  else if (j.post_id) actions = `<a class="ad-btn ad-btn-primary" href="/admin/blog/create-blog/?id=${j.post_id}">Open the draft</a>`;
  else if (j.post_skipped_at) actions = `<button class="ad-btn ad-btn-quiet" type="button" data-skip="false">Undo</button>`;
  else
    actions = `<a class="ad-btn ad-btn-primary" href="/admin/blog/create-blog/?job=${j.id}">Start post</a><button class="ad-btn ad-btn-quiet" type="button" data-skip="true">No post needed</button>`;
  return `<div class="ad-card ad-job" data-id="${j.id}">
    <h3>${esc(j.business_name || j.full_name || `Job #${j.id}`)}</h3>
    ${what ? `<div>${esc(what)}</div>` : ''}
    <div class="ad-job-meta">${esc(meta)}</div>
    <div class="ad-job-actions">${actions}<a class="ad-btn ad-btn-quiet" href="/admin/leads/?id=${j.id}&status=won">Lead</a></div>
  </div>`;
}

function group(title: string, list: Job[], empty: string): string {
  return `<div class="ad-section-title"><h2>${esc(title)}</h2><span class="ad-pill">${list.length}</span></div>${
    list.length ? `<div class="ad-cards">${list.map(card).join('')}</div>` : `<p class="ad-empty">${esc(empty)}</p>`
  }`;
}

function draw() {
  if (!jobs.length) {
    root.innerHTML = `<p class="ad-empty">No won jobs yet. Mark a lead Won on the <a href="/admin/leads/">Leads</a> page and it appears here.</p>`;
    return;
  }
  const waiting = jobs.filter((j) => !j.post_id && !j.post_skipped_at);
  const started = jobs.filter((j) => j.post_id && j.post_status !== 'published');
  const posted = jobs.filter((j) => j.post_status === 'published');
  const skipped = jobs.filter((j) => !j.post_id && j.post_skipped_at);
  root.innerHTML = [
    group('Jobs to post', waiting, 'Every won job has a post or is marked as not needing one.'),
    started.length ? group('Post started', started, '') : '',
    group('Posted', posted, 'No posts about jobs yet.'),
    skipped.length ? group('No post needed', skipped, '') : '',
  ].join('');
}

root.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-skip]');
  if (!b) return;
  const id = Number(b.closest<HTMLElement>('[data-id]')!.dataset.id);
  const skip = b.dataset.skip === 'true';
  b.disabled = true;
  try {
    const { job } = await api<{ job: { post_skipped_at: string | null } }>(`/jobs/${id}/skip`, { method: 'POST', body: JSON.stringify({ skip }) });
    jobs = jobs.map((j) => (j.id === id ? { ...j, post_skipped_at: job.post_skipped_at } : j));
    toast(skip ? 'Marked as not needing a post' : 'Back on the list');
    draw();
  } catch (err) {
    toast((err as Error).message, true);
    b.disabled = false;
  }
});

(async () => {
  if (!(await signedIn())) {
    root.innerHTML = '';
    return;
  }
  try {
    const body = await api<{ jobs: Job[]; notice?: string }>('/jobs');
    jobs = body.jobs;
    postsReady = !body.notice || !body.notice.includes('0010');
    notice(body.notice ?? null);
    draw();
  } catch (err) {
    root.innerHTML = `<p class="ad-empty">${esc((err as Error).message)}</p>`;
  }
})();

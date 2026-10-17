/** /admin/blog/: the admin's posts, live and drafts, and the repo's posts beside them. */
import { $, api, esc, fmtDate, fmtDateTime, notice, signedIn } from './common';

interface Post {
  id: number;
  status: 'draft' | 'published';
  title: string;
  address: string;
  liveSlug: string | null;
  publishedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  leadId: number | null;
}

const postsEl = $('[data-posts]');
const siteEl = $('[data-site]');

function postRow(p: Post): string {
  const live = p.status === 'published';
  return `<div class="ad-row"><a class="ad-btn-quiet" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 16px;text-decoration:none;color:inherit" href="/admin/blog/create-blog/?id=${p.id}">
    <span class="ad-row-main"><strong>${esc(p.title || 'Untitled')}</strong><span>/${esc(live ? p.liveSlug : p.address)}/ · ${
      live ? `published ${esc(fmtDate(p.publishedAt))}` : 'not on the site'
    } · saved ${esc(fmtDateTime(p.updatedAt))}${p.updatedBy ? ` by ${esc(p.updatedBy)}` : ''}${p.leadId ? ' · from a job' : ''}</span></span>
    <span class="ad-pill ${live ? 'ad-pill-live' : ''}">${live ? 'Live' : 'Draft'}</span>
  </a></div>`;
}

$('[data-site-toggle]').addEventListener('click', (e) => {
  const b = e.currentTarget as HTMLButtonElement;
  const show = siteEl.hidden;
  siteEl.hidden = !show;
  b.textContent = show ? 'Hide' : 'Show';
  b.setAttribute('aria-expanded', String(show));
});

(async () => {
  if (!(await signedIn())) {
    postsEl.innerHTML = '';
    return;
  }
  try {
    const { posts, site } = await api<{ posts: Post[]; site: { slug: string; title: string; pubDate: string }[] }>('/posts');
    postsEl.innerHTML = posts.length
      ? posts.map(postRow).join('')
      : `<p class="ad-empty">Nothing written here yet. <a href="/admin/blog/create-blog/?new=1">Start a post</a>, or start one from a won job on the <a href="/admin/jobs/">Jobs</a> page.</p>`;
    siteEl.innerHTML = site
      .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
      .map(
        (p) =>
          `<div class="ad-row"><a style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:10px 16px;text-decoration:none;color:inherit" href="/${esc(p.slug)}/" target="_blank" rel="noopener"><span class="ad-row-main"><strong>${esc(p.title)}</strong><span>/${esc(p.slug)}/</span></span><span class="ad-row-date">${esc(fmtDate(p.pubDate))}</span></a></div>`
      )
      .join('');
  } catch (err) {
    notice((err as Error).message);
    postsEl.innerHTML = '';
  }
})();

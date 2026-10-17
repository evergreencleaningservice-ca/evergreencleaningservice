/** /admin/: the four numbers. Each fails on its own, so one missing migration blanks one card. */
import { $, api, notice, signedIn } from './common';

const set = (key: string, value: string | number) => {
  const el = $(`[data-n="${key}"]`);
  if (el) el.textContent = String(value);
};

(async () => {
  const me = await signedIn();
  if (!me) return;
  const missing: string[] = [];

  api<{ counts: Record<string, number>; outcomes: boolean }>('/leads')
    .then(({ counts, outcomes }) => {
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      set('all', total);
      if (outcomes) set('new', counts.new ?? 0);
      else {
        set('new', '–');
        $('[data-n-hint="new"]').textContent = 'Needs migration 0009';
      }
    })
    .catch(() => set('all', '?'));

  api<{ jobs: { post_id?: number | null; post_skipped_at?: string | null }[]; notice?: string }>('/jobs')
    .then(({ jobs, notice: n }) => {
      if (n) missing.push(n);
      set('jobs', jobs.filter((j) => !j.post_id && !j.post_skipped_at).length);
    })
    .catch(() => set('jobs', '?'))
    .finally(() => notice(missing[0] ?? null));

  api<{ posts: { status: string }[] }>('/posts')
    .then(({ posts }) => {
      set('live', posts.filter((p) => p.status === 'published').length);
      const drafts = posts.filter((p) => p.status !== 'published').length;
      $('[data-n-hint="drafts"]').textContent = `Live from here · ${drafts} draft${drafts === 1 ? '' : 's'}`;
    })
    .catch(() => set('live', '–'));
})();

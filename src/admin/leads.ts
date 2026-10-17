/**
 * /admin/leads/: the list, the search, the status filter, and each lead's
 * outcome (migrations/0009). Marking a lead Won puts it on /admin/jobs/,
 * where a blog post about the job can be started.
 */
import { $, api, esc, fmtDate, fmtDateTime, fmtMoney, fmtPhone, notice, signedIn, STATUS_LABELS, toast, debounce, type Me } from './common';

type Lead = Record<string, unknown> & { id: number };

interface LeadsResponse {
  leads: Lead[];
  more: boolean;
  counts: Record<string, number>;
  outcomes: boolean;
  notice?: string;
}

const FILTERS = ['', 'new', 'qualified', 'quote_issued', 'won', 'lost', 'unqualified'];

let me: Me | null = null;
let status = new URLSearchParams(location.search).get('status') ?? '';
let q = '';
let leads: Lead[] = [];
let outcomes = false;
let open: number | null = Number(new URLSearchParams(location.search).get('id')) || null;

const list = $('[data-list]');
const more = $<HTMLButtonElement>('[data-more]');

async function load(append = false) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  if (append && leads.length) params.set('before', String(leads.at(-1)!.id));
  try {
    const body = await api<LeadsResponse>(`/leads?${params}`);
    outcomes = body.outcomes;
    notice(body.notice ?? null);
    leads = append ? [...leads, ...body.leads] : body.leads;
    more.hidden = !body.more;
    chips(body.counts);
    draw();
  } catch (err) {
    list.innerHTML = `<p class="ad-empty">${esc((err as Error).message)}</p>`;
  }
}

function chips(counts: Record<string, number>) {
  const el = $('[data-chips]');
  if (!outcomes) {
    el.innerHTML = '';
    return;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  el.innerHTML = FILTERS.map((f) => {
    const n = f ? counts[f] ?? 0 : total;
    return `<button class="ad-chip" type="button" data-filter="${f}" aria-pressed="${f === status}">${esc(f ? STATUS_LABELS[f] : 'All')}<b>${n}</b></button>`;
  }).join('');
}

const pill = (s: unknown) => (s ? `<span class="ad-pill ad-pill-${esc(s)}">${esc(STATUS_LABELS[String(s)] ?? s)}</span>` : '');

function source(l: Lead): string {
  const utm = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ');
  if (l.gclid) return `Google Ads${utm ? ` (${utm})` : ''}`;
  if (utm) return utm;
  if (l.referrer) {
    try {
      return new URL(String(l.referrer)).hostname;
    } catch {
      return String(l.referrer);
    }
  }
  return 'Direct';
}

function row(l: Lead): string {
  const isOpen = open === l.id;
  return `<div class="ad-row" data-id="${l.id}">
    <button type="button" aria-expanded="${isOpen}" data-toggle>
      <span class="ad-row-date">${esc(fmtDateTime(l.created_at))}</span>
      <span class="ad-row-main"><strong>${esc(l.full_name || '(no name)')}</strong><span>${esc(l.business_name || l.work_email || '')}</span></span>
      <span class="ad-row-main ad-row-hide-sm"><strong>${esc(l.services || l.facility_type || '')}</strong><span>${esc(l.address || '')}</span></span>
      <span class="ad-row-main ad-row-hide-sm"><span>${esc(source(l))}</span></span>
      <span>${outcomes ? pill(l.lead_status) : ''}</span>
    </button>
    ${isOpen ? detail(l) : ''}
  </div>`;
}

const dd = (label: string, value: string) => (value ? `<dt>${esc(label)}</dt><dd>${value}</dd>` : '');

function detail(l: Lead): string {
  const email = l.work_email ? `<a href="mailto:${esc(l.work_email)}">${esc(l.work_email)}</a>` : '';
  const phone = l.phone ? `<a href="tel:${esc(String(l.phone).replace(/[^\d+]/g, ''))}">${esc(fmtPhone(l.phone))}</a>` : '';
  // Every field here was typed by the public: only an http(s) page becomes a link.
  const pageUrl = String(l.page_url ?? '');
  const page = /^https?:\/\//i.test(pageUrl)
    ? `<a href="${esc(pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(pageUrl.replace(/^https?:\/\/[^/]+/, '') || '/')}</a>`
    : esc(pageUrl);
  const facts = [
    dd('Received', esc(fmtDateTime(l.created_at))),
    dd('Name', esc(l.full_name)),
    dd('Business', esc(l.business_name)),
    dd('Email', email),
    dd('Phone', phone),
    // The province only when the address does not already end with it.
    dd(
      'Address',
      esc(
        l.province && !String(l.address ?? '').toLowerCase().trimEnd().endsWith(String(l.province).toLowerCase())
          ? [l.address, l.province].filter(Boolean).join(', ')
          : l.address
      )
    ),
    dd('Services', esc(l.services)),
    dd('Facility', esc([l.facility_type, l.facility_size].filter(Boolean).join(', '))),
    dd('Form', esc(l.form_id)),
    dd('Page', page),
    dd('Came from', esc(source(l))),
    dd('First visit from', esc([l.first_utm_source, l.first_utm_medium, l.first_utm_campaign].filter(Boolean).join(' / '))),
    dd('Google click', l.gclid ? 'Yes (can be sent back to Google Ads)' : ''),
    dd('Marketing email', l.marketing_consent ? 'Agreed' : 'Not agreed'),
  ].join('');
  const message = l.message ? `<h3 style="margin:16px 0 6px">Message</h3><p class="ad-message">${esc(l.message)}</p>` : '';
  return `<div class="ad-detail">
    <div><dl class="ad-dl">${facts}</dl>${message}</div>
    ${outcomes ? outcomeForm(l) : '<div class="ad-outcome"><p class="ad-hint">Recording outcomes needs migrations/0009_lead_outcomes.sql applied.</p></div>'}
  </div>`;
}

function outcomeForm(l: Lead): string {
  const s = String(l.lead_status ?? 'new');
  const reached = [
    l.qualified_at && `Qualified ${fmtDate(l.qualified_at)}`,
    l.quote_issued_at && `Quoted ${fmtDate(l.quote_issued_at)}`,
    l.won_at && `Won ${fmtDate(l.won_at)}`,
  ].filter(Boolean);
  return `<form class="ad-outcome" data-outcome>
    <h3 style="margin-bottom:12px">What happened next</h3>
    <label class="ad-field"><span class="ad-label">Status</span>
      <select class="ad-select" name="status">${Object.entries(STATUS_LABELS)
        .map(([k, v]) => `<option value="${k}"${k === s ? ' selected' : ''}>${esc(v)}</option>`)
        .join('')}</select></label>
    <label class="ad-field"><span class="ad-label">Reason <span class="ad-hint">optional</span></span>
      <input class="ad-input" name="reason" maxlength="300" value="${esc(l.status_reason ?? '')}" placeholder="e.g. residential, out of area, went with another company" /></label>
    <div class="ad-grid-2">
      <label class="ad-field"><span class="ad-label">Quote (CAD)</span>
        <input class="ad-input" name="quoteValue" inputmode="decimal" value="${esc(l.quote_value_cad ?? '')}" placeholder="${esc(fmtMoney(0))}" /></label>
      <label class="ad-field"><span class="ad-label">Won (CAD)</span>
        <input class="ad-input" name="wonValue" inputmode="decimal" value="${esc(l.won_value_cad ?? '')}" placeholder="${esc(fmtMoney(0))}" /></label>
    </div>
    ${reached.length ? `<p class="ad-hint" style="margin:0 0 12px">${esc(reached.join(' · '))}</p>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="ad-btn ad-btn-primary" type="submit">Save</button>
      ${s === 'won' ? `<a class="ad-btn" href="/admin/jobs/">See it in Jobs</a>` : ''}
    </div>
  </form>`;
}

function draw() {
  if (!leads.length) {
    list.innerHTML = `<p class="ad-empty">${q || status ? 'No leads match.' : 'No leads yet.'}</p>`;
    return;
  }
  list.innerHTML = leads.map(row).join('');
}

list.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('[data-toggle]');
  if (!t) return;
  const id = Number(t.closest<HTMLElement>('[data-id]')!.dataset.id);
  open = open === id ? null : id;
  draw();
});

list.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const id = Number(form.closest<HTMLElement>('[data-id]')!.dataset.id);
  const data = Object.fromEntries(new FormData(form));
  const btn = form.querySelector('button[type=submit]') as HTMLButtonElement;
  btn.disabled = true;
  try {
    const { lead } = await api<{ lead: Lead }>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    leads = leads.map((l) => (l.id === id ? { ...l, ...lead } : l));
    toast(data.status === 'won' ? 'Saved. It is on the Jobs page now.' : 'Saved');
    draw();
  } catch (err) {
    toast((err as Error).message, true);
    btn.disabled = false;
  }
});

$('[data-chips]').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-filter]');
  if (!b) return;
  status = b.dataset.filter ?? '';
  const url = new URL(location.href);
  if (status) url.searchParams.set('status', status);
  else url.searchParams.delete('status');
  history.replaceState(null, '', url);
  load();
});

const search = debounce(() => load(), 300);
$<HTMLInputElement>('[data-q]').addEventListener('input', (e) => {
  q = (e.target as HTMLInputElement).value.trim();
  search();
});

more.addEventListener('click', () => load(true));

(async () => {
  me = await signedIn();
  if (me) load();
  else list.innerHTML = '';
})();

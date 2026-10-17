/**
 * The website post's block editor, after UiD by Rana's (dist/post-blocks.js).
 *
 * A post is a list of blocks (src/lib/admin/blocks.ts), each with its own
 * controls; only the block being worked in (the last one tapped) shows its
 * text bar and ↑ ↓ ×. Text marks are the renderer's: **bold**, _italic_,
 * [words](address), "- " and "1. " lines.
 *
 * mountBlocks() draws the editor into a container and reports every change
 * through onChange; typing changes the model without redrawing, so the caret
 * never jumps.
 */
import { embedPlatform, youtubeId, type Block, type GridCell } from '../lib/admin/blocks';
import { esc } from './common';

const TYPES: { t: Block['t']; label: string; name: string }[] = [
  { t: 'h2', label: 'H2', name: 'Heading 2' },
  { t: 'h3', label: 'H3', name: 'Heading 3' },
  { t: 'h4', label: 'H4', name: 'Heading 4' },
  { t: 'p', label: 'Text', name: 'Text' },
  { t: 'list', label: 'List', name: 'List' },
  { t: 'quote', label: 'Quote', name: 'Quote' },
  { t: 'img', label: 'Image', name: 'Image' },
  { t: 'grid', label: 'Grid', name: 'Grid' },
  { t: 'embed', label: 'Embed', name: 'Embed' },
];

const blankCell = (): GridCell => ({ heading: '', text: '', url: '', alt: '' });

function blank(t: Block['t']): Block {
  switch (t) {
    case 'h2':
    case 'h3':
    case 'h4':
      return { t, text: '' };
    case 'p':
      return { t: 'p', text: '' };
    case 'quote':
      return { t: 'quote', text: '' };
    case 'list':
      return { t: 'list', ordered: false, items: [''] };
    case 'img':
      return { t: 'img', url: '', alt: '', caption: '' };
    case 'grid':
      return { t: 'grid', cols: 2, cells: [blankCell(), blankCell()] };
    case 'embed':
      return { t: 'embed', url: '' };
  }
}

export interface BlocksOptions {
  onChange: (blocks: Block[]) => void;
  /** Stores an image and resolves to its https address. */
  upload: (file: File) => Promise<string>;
  onError: (message: string) => void;
}

export interface BlocksEditor {
  set(blocks: Block[]): void;
}

export function mountBlocks(root: HTMLElement, initial: Block[], opts: BlocksOptions): BlocksEditor {
  let blocks: Block[] = structuredClone(initial);
  let active = -1;

  const changed = () => opts.onChange(structuredClone(blocks));

  const field = (i: number, key: string, value: string, attrs = '', cls = 'ad-input') =>
    `<input class="${cls}" data-i="${i}" data-k="${key}" value="${esc(value)}" ${attrs} />`;
  const area = (i: number, key: string, value: string, attrs = '') =>
    `<textarea class="ad-textarea" data-i="${i}" data-k="${key}" ${attrs}>${esc(value)}</textarea>`;

  const formatBar = (i: number, key: string) =>
    `<div class="ad-format" data-format="${i}" data-fk="${key}">
      <button type="button" data-mark="bold" title="Bold"><b>B</b></button>
      <button type="button" data-mark="italic" title="Italic"><i>I</i></button>
      <button type="button" data-mark="link" title="Link">Link</button>
      <button type="button" data-mark="ul" title="Bulleted list">• List</button>
      <button type="button" data-mark="ol" title="Numbered list">1. List</button>
    </div>`;

  const imagePicker = (i: number, key: string, url: string, cell = -1) =>
    `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      ${field(i, key, url, `placeholder="https://… image address" ${cell >= 0 ? `data-cell="${cell}"` : ''} inputmode="url"`)}
      <label class="ad-btn ad-btn-sm">Upload<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden data-upload="${i}" data-uk="${key}" ${cell >= 0 ? `data-cell="${cell}"` : ''} /></label>
    </div>`;

  function body(b: Block, i: number): string {
    switch (b.t) {
      case 'h2':
      case 'h3':
      case 'h4':
        return `${field(i, 'text', b.text, `placeholder="${b.t === 'h2' ? 'Section heading' : 'Sub-heading'}"`, `ad-input is-${b.t}`)}`;
      case 'p':
        return `${formatBar(i, 'text')}${area(i, 'text', b.text, 'rows="4" placeholder="Write here. **bold**, _italic_, [words](/page/)"')}`;
      case 'quote':
        return area(i, 'text', b.text, 'rows="2" placeholder="A quotation"');
      case 'list':
        return `<label class="ad-check" style="font-weight:400"><input type="checkbox" data-i="${i}" data-k="ordered" ${b.ordered ? 'checked' : ''} /> Numbered</label>
          ${area(i, 'items', b.items.join('\n'), 'rows="4" placeholder="One item per line"')}`;
      case 'img':
        return `<div class="ad-block-img">
            ${b.url ? `<img src="${esc(b.url)}" alt="" />` : '<div class="ad-thumb-empty">No image</div>'}
            <div>
              ${imagePicker(i, 'url', b.url)}
              <div class="ad-grid-2" style="margin-top:8px">
                ${field(i, 'alt', b.alt, 'placeholder="Describe the image (for screen readers and search)"')}
                ${field(i, 'caption', b.caption, 'placeholder="Caption (optional)"')}
              </div>
              <label class="ad-check" style="font-weight:400;margin:8px 0 0"><input type="checkbox" data-i="${i}" data-k="featured" ${b.featured ? 'checked' : ''} /> The post's picture on the blog list</label>
            </div>
          </div>`;
      case 'grid':
        return `<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <select class="ad-select" style="width:auto" data-i="${i}" data-k="cols"><option value="2"${b.cols === 2 ? ' selected' : ''}>2 columns</option><option value="3"${b.cols === 3 ? ' selected' : ''}>3 columns</option></select>
            <button class="ad-btn ad-btn-sm" type="button" data-cell-add="${i}">+ Cell</button>
          </div>
          <div class="ad-cells">${b.cells
            .map(
              (c, ci) => `<div class="ad-cell">
              <div style="display:flex;gap:6px;margin-bottom:6px">${field(i, 'heading', c.heading, `data-cell="${ci}" placeholder="Heading"`)}<button class="ad-btn ad-btn-sm ad-btn-quiet" type="button" data-cell-remove="${i}" data-cell="${ci}" title="Remove this cell">×</button></div>
              <textarea class="ad-textarea" rows="2" data-i="${i}" data-k="text" data-cell="${ci}" placeholder="Text">${esc(c.text)}</textarea>
              <div style="margin-top:6px">${imagePicker(i, 'url', c.url, ci)}</div>
              <div style="margin-top:6px">${field(i, 'alt', c.alt, `data-cell="${ci}" placeholder="Describe the image, if it has one"`)}</div>
            </div>`
            )
            .join('')}</div>`;
      case 'embed': {
        const platform = b.url ? embedPlatform(b.url) : null;
        const yt = b.url ? youtubeId(b.url) : null;
        return `${field(i, 'url', b.url, 'placeholder="A YouTube, Instagram, TikTok, X, Facebook or LinkedIn link" inputmode="url"')}
          <p class="ad-hint" style="margin:6px 0 0">${
            !b.url
              ? 'Shown on the site as a picture card (YouTube) or a link: the site loads no outside frames.'
              : platform
                ? `${esc(platform)}${yt ? ' video' : ' post'}: shown as ${yt ? 'its picture, opening the video' : 'a link to it'}.`
                : '<span style="color:var(--ad-bad)">Not a link the post takes (https on YouTube, Instagram, TikTok, X, Facebook or LinkedIn).</span>'
          }</p>
          ${yt ? `<img src="https://i.ytimg.com/vi/${esc(yt)}/hqdefault.jpg" alt="" style="width:200px;border-radius:8px;margin-top:6px" />` : ''}`;
      }
    }
  }

  function draw() {
    root.innerHTML = `<div class="ad-blocks">${blocks
      .map((b, i) => {
        const type = TYPES.find((x) => x.t === b.t)!;
        const headingSwitch = /^h[234]$/.test(b.t)
          ? `<select class="ad-select" style="width:auto;min-height:28px;padding:2px 6px;font-size:.75rem" data-i="${i}" data-k="level">${['h2', 'h3', 'h4']
              .map((h) => `<option value="${h}"${h === b.t ? ' selected' : ''}>${h.toUpperCase()}</option>`)
              .join('')}</select>`
          : esc(type.name);
        return `<div class="ad-block${i === active ? ' is-active' : ''}" data-block="${i}">
          <div class="ad-block-bar">${headingSwitch}
            <span class="ad-tools">
              <button type="button" data-move="-1" data-i="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" data-move="1" data-i="${i}" title="Move down" ${i === blocks.length - 1 ? 'disabled' : ''}>↓</button>
              <button type="button" data-remove="${i}" title="Remove this block">×</button>
            </span>
          </div>
          ${body(b, i)}
        </div>`;
      })
      .join('')}</div>
      <div class="ad-add" style="margin-top:10px"><span>Add</span>${TYPES.map(
        (x) => `<button class="ad-btn ad-btn-sm" type="button" data-add="${x.t}">${esc(x.label)}</button>`
      ).join('')}</div>`;
  }

  function cellOf(b: Block, el: HTMLElement): GridCell | null {
    if (b.t !== 'grid' || el.dataset.cell === undefined) return null;
    return b.cells[Number(el.dataset.cell)] ?? null;
  }

  root.addEventListener('focusin', (e) => {
    const blk = (e.target as HTMLElement).closest<HTMLElement>('[data-block]');
    if (!blk) return;
    const i = Number(blk.dataset.block);
    if (i === active) return;
    active = i;
    root.querySelectorAll('.ad-block').forEach((el, n) => el.classList.toggle('is-active', n === active));
  });

  root.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.i === undefined || !el.dataset.k || el.type === 'file') return;
    const b = blocks[Number(el.dataset.i)];
    const k = el.dataset.k;
    const cell = cellOf(b, el);
    if (cell) (cell as unknown as Record<string, string>)[k] = el.value;
    else if (b.t === 'list' && k === 'items') b.items = el.value.split('\n');
    else if (k === 'text' || k === 'url' || k === 'alt' || k === 'caption') (b as Record<string, unknown>)[k] = el.value;
    changed();
  });

  root.addEventListener('change', async (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.upload !== undefined && el.files?.[0]) {
      const i = Number(el.dataset.upload);
      const b = blocks[i];
      const label = el.closest('label');
      if (label) label.firstChild!.textContent = 'Uploading…';
      try {
        const url = await opts.upload(el.files[0]);
        const cell = cellOf(b, el);
        if (cell) cell.url = url;
        else if (b.t === 'img') b.url = url;
        changed();
        draw();
      } catch (err) {
        opts.onError((err as Error).message);
        if (label) label.firstChild!.textContent = 'Upload';
      }
      return;
    }
    if (el.dataset.i === undefined) return;
    const i = Number(el.dataset.i);
    const b = blocks[i];
    if (el.dataset.k === 'level' && /^h[234]$/.test(b.t)) {
      blocks[i] = { t: el.value as 'h2', text: (b as { text: string }).text };
      changed();
      draw();
    } else if (el.dataset.k === 'ordered' && b.t === 'list') {
      b.ordered = el.checked;
      changed();
    } else if (el.dataset.k === 'featured' && b.t === 'img') {
      // One featured image per post.
      for (const x of blocks) if (x.t === 'img') delete x.featured;
      if (el.checked) b.featured = true;
      changed();
      draw();
    } else if (el.dataset.k === 'cols' && b.t === 'grid') {
      b.cols = el.value === '3' ? 3 : 2;
      changed();
    } else if (el.dataset.k === 'url') {
      // Show the new picture, or what the embed is, without redrawing the
      // editor: the field this change came from losing focus is usually a
      // click into the next one, which a redraw would replace.
      const blk = root.querySelector<HTMLElement>(`[data-block="${i}"]`);
      if (b.t === 'img' && blk) {
        const preview = blk.querySelector('.ad-block-img > :first-child');
        if (preview) preview.outerHTML = b.url ? `<img src="${esc(b.url)}" alt="" />` : '<div class="ad-thumb-empty">No image</div>';
      } else if (b.t === 'embed' && blk && !blk.contains(document.activeElement)) {
        const holder = document.createElement('div');
        holder.innerHTML = body(b, i);
        blk.querySelectorAll(':scope > :not(.ad-block-bar)').forEach((n) => n.remove());
        blk.append(...holder.childNodes);
      }
    }
  });

  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!t) return;
    if (t.dataset.add) {
      blocks.push(blank(t.dataset.add as Block['t']));
      active = blocks.length - 1;
      changed();
      draw();
      root.querySelector<HTMLElement>(`[data-block="${active}"] input:not([type=checkbox]), [data-block="${active}"] textarea`)?.focus();
    } else if (t.dataset.move) {
      const i = Number(t.dataset.i);
      const j = i + Number(t.dataset.move);
      if (j < 0 || j >= blocks.length) return;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      active = j;
      changed();
      draw();
    } else if (t.dataset.remove) {
      blocks.splice(Number(t.dataset.remove), 1);
      active = -1;
      changed();
      draw();
    } else if (t.dataset.cellAdd) {
      const b = blocks[Number(t.dataset.cellAdd)];
      if (b.t === 'grid' && b.cells.length < 12) b.cells.push(blankCell());
      changed();
      draw();
    } else if (t.dataset.cellRemove) {
      const b = blocks[Number(t.dataset.cellRemove)];
      if (b.t === 'grid') b.cells.splice(Number(t.dataset.cell), 1);
      changed();
      draw();
    } else if (t.dataset.mark) {
      const bar = t.closest<HTMLElement>('[data-format]')!;
      const ta = root.querySelector<HTMLTextAreaElement>(`textarea[data-i="${bar.dataset.format}"][data-k="${bar.dataset.fk}"]`);
      if (ta) applyMark(ta, t.dataset.mark);
    }
  });

  // Keep the caret in the text while a format button is pressed.
  root.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('[data-mark]')) e.preventDefault();
  });

  function applyMark(ta: HTMLTextAreaElement, mark: string) {
    const { selectionStart: s, selectionEnd: en, value } = ta;
    const sel = value.slice(s, en);
    let out = sel;
    if (mark === 'bold') out = `**${sel || 'bold'}**`;
    else if (mark === 'italic') out = `_${sel || 'italic'}_`;
    else if (mark === 'link') {
      const href = prompt('Link to (an https address, or a page on this site like /services/office-cleaning/)', 'https://');
      if (!href) return;
      out = `[${sel || 'words'}](${href.trim()})`;
    } else if (mark === 'ul' || mark === 'ol') {
      const lines = (sel || 'item').split('\n');
      out = lines.map((l, n) => `${mark === 'ul' ? '-' : `${n + 1}.`} ${l.replace(/^([-*•]|\d+[.)])\s+/, '')}`).join('\n');
      // A list is its own paragraph.
      if (s > 0 && !value.slice(0, s).endsWith('\n\n')) out = `${value.slice(0, s).endsWith('\n') ? '\n' : '\n\n'}${out}`;
    }
    ta.setRangeText(out, s, en, 'select');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
  }

  draw();
  return {
    set(next: Block[]) {
      blocks = structuredClone(next);
      active = -1;
      draw();
    },
  };
}

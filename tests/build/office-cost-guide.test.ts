/** @vitest-environment node */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Window } from 'happy-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const output = path.join(root, '.astro-test-dist-office-cost');
const slug = 'office-cleaning-cost-toronto-guide';
const url = `https://www.evergreencleaningservice.ca/${slug}/`;
let window: Window;
let document: Window['document'];

beforeAll(() => {
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', output], {
    cwd: root, encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`Build failed: ${result.stdout}\n${result.stderr}`);
  window = new Window({ url });
  document = window.document;
  document.body.innerHTML = fs.readFileSync(path.join(output, slug, 'index.html'), 'utf8');
}, 120_000);

afterAll(async () => {
  await window?.happyDOM.close();
  fs.rmSync(output, { recursive: true, force: true });
});

describe('the Toronto office cleaning guide', () => {
  it('uses the requested title, description, canonical and social card', () => {
    expect(document.querySelector('title')?.textContent).toBe('Office Cleaning Cost Toronto: 2026 Pricing Guide');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Office cleaning cost Toronto: compare pricing examples, understand monthly cleaning costs and learn what to ask before hiring.');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(url);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('blog-office-cleaning-cost-toronto-guide-og.jpg');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('has seven working contents links and seven native accessible FAQs', () => {
    const contents = [...document.querySelectorAll('.guide-toc a')];
    expect(contents).toHaveLength(7);
    for (const anchor of contents) expect(document.getElementById(anchor.getAttribute('href')!.slice(1))).not.toBeNull();
    const questions = [...document.querySelectorAll('details')];
    expect(questions).toHaveLength(7);
    for (const question of questions) {
      expect(question.querySelector('summary')?.textContent?.length).toBeGreaterThan(15);
      expect(question.querySelector('p')?.textContent?.length).toBeGreaterThan(100);
    }
  });

  it('labels budgeting examples and preserves the exact worked calculation', () => {
    const guide = document.querySelector('.guide-body')!.textContent;
    expect(guide).toContain('not Evergreen quotes or verified GTA market averages');
    for (const amount of ['$433–$1,299', '$867–$2,601', '$1,300–$3,900', '$2,167–$6,501']) expect(guide).toContain(amount);
    expect(150 * 5 * 52 / 12).toBe(3250);
    expect((3250 * 1.13).toFixed(2)).toBe('3672.50');
    expect(document.querySelector('.guide-panel')?.textContent).toContain('$3,672.50');
    expect(document.querySelectorAll('table caption')).toHaveLength(2);
  });

  it('offers responsive real photos and keeps body images lazy', () => {
    const featured = document.querySelector('.guide-featured img')!;
    expect(featured.getAttribute('width')).toBe('1200');
    expect(featured.getAttribute('height')).toBe('675');
    expect(featured.getAttribute('fetchpriority')).toBe('high');
    expect(featured.getAttribute('srcset')).toContain('480w');
    const bodyImages = [...document.querySelectorAll('.guide-body img')];
    expect(bodyImages).toHaveLength(2);
    for (const img of bodyImages) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('srcset')).toContain('1200w');
      expect(img.getAttribute('alt')?.length).toBeGreaterThan(20);
    }
    expect(document.querySelectorAll('figcaption a[href*="magnific.com"]')).toHaveLength(3);
  });

  it('emits matching BlogPosting and breadcrumb structured data', () => {
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => JSON.parse(el.textContent!));
    const article = schemas.find((schema) => schema['@type'] === 'BlogPosting');
    expect(article.mainEntityOfPage['@id']).toBe(url);
    expect(article.headline).toBe('How Much Does Office Cleaning Cost in Toronto?');
    expect(article.author.name).toBe('Evergreen Office Cleaning');
    const breadcrumbs = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
    expect(breadcrumbs.itemListElement.map((item: { name: string }) => item.name)).toEqual(['Home', 'Insights', 'Office Cleaning']);
  });

  it('links the quote CTA, phone and both existing related articles', () => {
    expect(document.querySelector('.guide-cta .btn')?.getAttribute('href')).toBe('/request-a-quote/');
    expect(document.querySelector('.guide-cta a[href^="tel:"]')?.getAttribute('href')).toBe('tel:+14168034880');
    const links = [...document.querySelectorAll('.guide-related-card')].map((el) => el.getAttribute('href'));
    expect(links).toEqual(['/ask-the-office-cleaners-cleaning-break-rooms/', '/how-to-decide-on-a-cleaning-company/']);
    for (const link of [...document.querySelectorAll('.guide a[href^="/"]')]) {
      const target = new URL(link.getAttribute('href')!, url).pathname;
      if (!path.extname(target)) expect(fs.existsSync(path.join(output, target, 'index.html')), target).toBe(true);
    }
  });

  it('is discoverable through the archive, sitemap and feed', () => {
    for (const file of ['insights/index.html', 'sitemap-insights-0.xml', 'rss.xml']) {
      expect(fs.readFileSync(path.join(output, file), 'utf8'), file).toContain(`/${slug}/`);
    }
  });

  it('keeps the legacy article layout available', () => {
    const legacy = fs.readFileSync(path.join(output, 'how-to-decide-on-a-cleaning-company/index.html'), 'utf8');
    expect(legacy).toContain('post-container content-grid');
    expect(legacy).not.toMatch(/class="guide-column"/);
  });
});

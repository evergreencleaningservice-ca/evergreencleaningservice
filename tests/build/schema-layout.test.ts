/**
 * @vitest-environment node
 *
 * SEO re-audit, 7 Nov 2026 (Phase A items 9, 11, 14 and 15): the
 * organisation's areaServed, one breadcrumb root, no boilerplate H2s, the
 * HTML charset header, and 44px tap targets on touch screens.
 *
 * Builds the site once and reads the result, because each claim is about
 * what ships: a breadcrumb root can be right in one template and wrong in
 * another, and a `_headers` rule is only safe if it matches every page and
 * no other file in the build.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PLACES_WITHIN_TORONTO, SERVICE_LOCATION_SUGGESTIONS } from '../../src/data/coverage';
import { INDEXNOW_KEY } from '../../src/data/indexnow';
import { PREVIEW_HOST, PRODUCTION_HOSTS, site } from '../../src/data/site';
import { parseHeaders, type HeaderRule } from '../../src/lib/noindex-rules';
import { isPrivatePage } from './private-pages';
import { offerHub } from '../../src/data/offer-pages';

const repo = path.resolve(import.meta.dirname, '../..');
const out = path.join(repo, '.astro-test-dist-schema-layout');

let files: string[] = [];
let pages: string[] = [];

const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');
const isRedirectStub = (html: string) => /http-equiv="refresh"/i.test(html);

beforeAll(() => {
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], { cwd: repo, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`astro build failed:\n${build.stdout}\n${build.stderr}`);
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : [path.relative(out, full).split(path.sep).join('/')];
    });
  files = walk(out);
  pages = files.filter((f) => f.endsWith('.html') && !isPrivatePage(f) && !isRedirectStub(read(f)));
}, 180_000);

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

/* --- helpers -------------------------------------------------------------- */

type Node = Record<string, any>;

/** Every JSON-LD node on a page, `@graph` members included. */
const nodesOf = (html: string): Node[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]))
    .flatMap((block) => (Array.isArray(block['@graph']) ? block['@graph'] : [block]));

const placeNames = (areaServed: unknown) => (areaServed as Node[]).map((a) => a.name);

/**
 * The rules Workers static assets applies to a request, matched the way its
 * rules engine does (workers-shared asset-worker `generateRuleRegExp`): `*`
 * is `.*` anywhere in the pattern, `:name` is one path segment (or one host
 * label), the whole URL must match, and a rule naming a host is tested
 * against `https://<host><path>`.
 */
function rulesFor(rules: HeaderRule[], host: string, pathname: string): HeaderRule[] {
  const esc = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return rules.filter((rule) => {
    let re = rule.url.split('*').map(esc).join('.*');
    re = re.replace(/(?<=^https:\\\/\\\/[^/]*?):[A-Za-z]\w*(?=\\)/g, '[^/.]+');
    re = re.replace(/:[A-Za-z]\w*/g, '[^/]+');
    const subject = rule.url.startsWith('https://') ? `https://${host}${pathname}` : pathname;
    return new RegExp(`^${re}$`).test(subject);
  });
}

/** The address the asset layer serves a file at (trailingSlash 'always'). */
const servedAt = (file: string) =>
  file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -'index.html'.length)}` : `/${file}`;

/* --- schema --------------------------------------------------------------- */

describe('areaServed', () => {
  const places = [...SERVICE_LOCATION_SUGGESTIONS];

  /* East York and York are a Place inside Toronto, the rest City (13 Nov
     2026, SEO audit 11 Nov, local L2). */
  it('names every place in src/data/coverage.ts on the organisation, typed City or Place in Toronto', () => {
    const org = nodesOf(read('index.html')).find((n) => n['@type'] === 'ProfessionalService')!;
    expect(placeNames(org.areaServed)).toEqual(places);
    for (const area of org.areaServed) {
      if (PLACES_WITHIN_TORONTO.includes(area.name)) {
        expect(area).toEqual({ '@type': 'Place', name: area.name, containedInPlace: { '@type': 'City', name: 'Toronto' } });
      } else {
        expect(area).toEqual({ '@type': 'City', name: area.name });
      }
    }
  });

  it('now includes North York, Scarborough, East York and York', () => {
    const org = nodesOf(read('index.html')).find((n) => n['@type'] === 'ProfessionalService')!;
    for (const name of ['North York', 'Scarborough', 'East York', 'York']) {
      expect(placeNames(org.areaServed)).toContain(name);
    }
  });

  it('is the same list on the organisation on every page and on every service page Service', () => {
    /* The whole nodes, types included, so a Service cannot drift back to
       typing East York as a City while the names still match. */
    const orgAreas = nodesOf(read('index.html')).find((n) => n['@type'] === 'ProfessionalService')!.areaServed;
    let services = 0;
    for (const page of pages) {
      for (const node of nodesOf(read(page))) {
        if (node['@type'] === 'ProfessionalService') expect(node.areaServed, page).toEqual(orgAreas);
        if (node['@type'] === 'Service' && /#service$/.test(node['@id'] ?? '') && offerHub(new URL(node['@id'], site.url).pathname) === '/services/') {
          services++;
          expect(node.areaServed, page).toEqual(orgAreas);
        }
      }
    }
    expect(services).toBeGreaterThanOrEqual(10);
  });
});

describe('breadcrumbs', () => {
  it('every BreadcrumbList starts with the site name at position 1, linked to the home page', () => {
    const roots = new Map<string, string[]>();
    for (const page of pages) {
      for (const node of nodesOf(read(page)).filter((n) => n['@type'] === 'BreadcrumbList')) {
        const first = node.itemListElement[0];
        expect(first.position, page).toBe(1);
        expect(first.item, page).toBe(`${site.url}/`);
        roots.set(first.name, [...(roots.get(first.name) ?? []), page]);
      }
    }
    expect([...roots.keys()]).toEqual([site.name]);
    expect(roots.get(site.name)!.length).toBeGreaterThan(80);
  });

  it('the three guides no longer say "Home" in their structured data', () => {
    for (const slug of ['office-cleaning-cost-toronto-guide', 'how-often-should-an-office-be-cleaned', 'office-cleaning-checklist']) {
      const crumbs = nodesOf(read(`${slug}/index.html`)).find((n) => n['@type'] === 'BreadcrumbList')!;
      expect(crumbs.itemListElement.map((i: Node) => i.name).slice(0, 2), slug).toEqual([site.name, 'Insights']);
    }
  });
});

/* --- headings ------------------------------------------------------------- */

describe('boilerplate is not in the heading outline', () => {
  const footerOf = (html: string) => html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];

  it('the footer has no headings, on any page', () => {
    for (const page of pages) {
      const footer = footerOf(read(page));
      if (!footer) continue; // the landing pages have their own footer
      expect(footer, page).not.toMatch(/<h[1-6][\s>]/);
    }
  });

  it('the footer titles are still there, as paragraphs', () => {
    const footer = footerOf(read('about-us/index.html'))!;
    const titles = [...footer.matchAll(/<p class="(footer-areas-title|footer-connect-title)"[^>]*>([^<]*)<\/p>/g)].map((m) => m[2]);
    expect(titles).toEqual([site.name, 'Services', 'Reviews', 'Service Areas', 'Follow us on Social Media']);
  });

  it('no page has an "In this guide" heading; the guides keep a labelled contents nav', () => {
    for (const page of pages) expect(read(page), page).not.toMatch(/<h[1-6][^>]*>\s*In this guide/);
    for (const slug of ['office-cleaning-cost-toronto-guide', 'how-often-should-an-office-be-cleaned', 'office-cleaning-checklist']) {
      const html = read(`${slug}/index.html`);
      expect(html, slug).toMatch(/<nav class="guide-toc" aria-labelledby="guide-toc-title"/);
      expect(html, slug).toMatch(/<p class="guide-toc-title" id="guide-toc-title"[^>]*>In this guide<\/p>/);
    }
  });
});

/* --- the charset header --------------------------------------------------- */

describe('_headers: Content-Type', () => {
  const rules = () => parseHeaders(read('_headers'));
  const hosts = [...PRODUCTION_HOSTS, PREVIEW_HOST];
  const typeRules = (host: string, pathname: string) =>
    rulesFor(rules(), host, pathname).filter((r) => 'content-type' in r.headers);

  it('the only HTML file served away from a slashed address is the 404 page', () => {
    expect(files.filter((f) => f.endsWith('.html') && !f.endsWith('index.html'))).toEqual(['404.html']);
  });

  it('sends every page as text/html; charset=utf-8, from exactly one rule', () => {
    const html = files.filter((f) => f.endsWith('index.html'));
    expect(html.length).toBeGreaterThan(90);
    for (const host of hosts) {
      for (const file of html) {
        const matched = typeRules(host, servedAt(file));
        expect(matched.map((r) => r.headers['content-type']), `${host} ${file}`).toEqual(['text/html; charset=utf-8']);
      }
    }
  });

  it('gives no other file a Content-Type, except the plain-text files that name their charset', () => {
    const plain = new Set(['llms.txt', `${INDEXNOW_KEY}.txt`, 'robots.txt']);
    const others = files.filter((f) => !f.endsWith('.html') && f !== '_headers');
    expect(others.some((f) => f.endsWith('.css') || f.startsWith('_astro/'))).toBe(true);
    for (const host of hosts) {
      for (const file of others) {
        const matched = typeRules(host, servedAt(file)).map((r) => r.headers['content-type']);
        expect(matched, `${host} ${file}`).toEqual(plain.has(file) ? ['text/plain; charset=utf-8'] : []);
      }
    }
  });

  it('leaves a slash-less address (answered by a redirect) and the API alone', () => {
    for (const pathname of ['/about-us', '/api/submit-lead', '/sitemap-index.xml']) {
      expect(typeRules('www.evergreencleaningservice.ca', pathname), pathname).toEqual([]);
    }
    /* robots.txt has its own plain-text rule since 11 Nov 2026 (technical
       N7); the HTML rules must still never reach it. */
    expect(typeRules('www.evergreencleaningservice.ca', '/robots.txt').map((r) => r.headers['content-type'])).toEqual([
      'text/plain; charset=utf-8',
    ]);
  });
});

/* --- tap targets ---------------------------------------------------------- */

describe('44px tap targets on touch screens (visual N2)', () => {
  /* Layout cannot be measured without a browser; this pins the rules in the
     source so a refactor cannot drop them quietly. */
  const touch = /@media \(max-width: 767px\), \(pointer: coarse\) \{([\s\S]*?)\n  \}\n/;
  for (const [file, selector] of [
    ['src/components/Footer.astro', '.site-footer .footer-areas a'],
    ['src/components/home/Areas.astro', '.ar-grid li > a'],
    ['src/components/Sidebar.astro', '.widget-services a'],
    ['src/components/home/Reviews.astro', '.ti-more'],
    /* Service and industry pages: the "Where we work" list and the
       breadcrumb (13 Nov 2026, SEO audit 11 Nov, critic R4). */
    ['src/components/OfferPage.astro', '.offer-areas li > a'],
    ['src/components/OfferPage.astro', '.offer-hero .breadcrumbs a'],
  ] as const) {
    it(`${file}: ${selector}`, () => {
      const block = fs.readFileSync(path.join(repo, file), 'utf8').match(touch)?.[1];
      expect(block, file).toBeTruthy();
      expect(block).toContain(selector);
      expect(block).toContain('min-height: 44px;');
    });
  }
});

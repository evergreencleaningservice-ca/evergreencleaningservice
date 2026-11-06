/**
 * The scroll-in reveal (src/lib/reveal.ts).
 *
 * What matters: nothing that should be seen is ever hidden. Nothing on the
 * first screen is armed (so the Largest Contentful Paint is never delayed),
 * nothing is armed under reduced motion or without IntersectionObserver,
 * and a block the visitor jumps past is shown rather than left hidden.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARMED_ATTR, IN_CLASS, revealTargets, wireReveal } from '../src/lib/reveal';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callbacks: Callback[];
let observed: Element[];
let unobserved: Element[];

class FakeObserver {
  constructor(cb: Callback) {
    callbacks.push(cb);
  }
  observe(el: Element) {
    observed.push(el);
  }
  unobserve(el: Element) {
    unobserved.push(el);
  }
  disconnect() {}
}

const matchMedia = (reduce: boolean) =>
  vi.fn().mockImplementation((q: string) => ({ matches: reduce && q.includes('reduce') }));

/* happy-dom has no layout, so each element's top is given by a data-top. */
function place(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-top]')) {
    const top = Number(el.dataset.top);
    el.getBoundingClientRect = () => ({ top, bottom: top + 100 }) as DOMRect;
  }
}

function page(): void {
  document.body.innerHTML = `
    <section data-reveal id="hero" data-top="100"></section>
    <section data-reveal id="a" data-top="1400"></section>
    <ul data-reveal="stagger" id="b" data-top="2000"><li></li><li></li></ul>
    <article data-reveal="flow" id="post" data-top="300">
      <p id="p1" data-top="300"></p>
      <p id="p2" data-top="1200"></p>
      <script id="s"></script>
      <div id="nested" data-top="1600"><ul data-reveal="stagger" id="inner" data-top="1650"></ul></div>
      <figure id="fig" data-top="1900"></figure>
    </article>
    <section id="plain" data-top="2400"></section>`;
  place();
}

const armed = () => [...document.querySelectorAll(`[${ARMED_ATTR}]`)].map((e) => e.id);
const shown = () => [...document.querySelectorAll(`.${IN_CLASS}`)].map((e) => e.id);

beforeEach(() => {
  callbacks = [];
  observed = [];
  unobserved = [];
  page();
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  vi.stubGlobal('matchMedia', matchMedia(false));
  vi.stubGlobal('innerHeight', 800);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('revealTargets', () => {
  it('takes explicit blocks whole and each child of a flow, skipping scripts and nested reveals', () => {
    expect(revealTargets(document).map((e) => e.id).sort()).toEqual(['a', 'b', 'fig', 'hero', 'inner', 'p1', 'p2']);
  });
});

describe('wireReveal', () => {
  it('arms only what starts below the first screen', () => {
    wireReveal(document);
    expect(armed().sort()).toEqual(['a', 'b', 'fig', 'inner', 'p2']);
    expect(observed.map((e) => e.id).sort()).toEqual(['a', 'b', 'fig', 'inner', 'p2']);
  });

  it('never arms anything on the first screen, so the largest paint is never held back', () => {
    wireReveal(document);
    for (const id of ['hero', 'p1', 'post']) {
      expect(document.getElementById(id)!.hasAttribute(ARMED_ATTR)).toBe(false);
    }
  });

  it('turns an armed flow child into a plain reveal, and keeps an explicit mode', () => {
    wireReveal(document);
    expect(document.getElementById('p2')!.getAttribute('data-reveal')).toBe('');
    expect(document.getElementById('b')!.getAttribute('data-reveal')).toBe('stagger');
  });

  it('marks a block in when it intersects, then stops watching it', () => {
    wireReveal(document);
    const a = document.getElementById('a')!;
    callbacks[0]([{ target: a, isIntersecting: true, boundingClientRect: { bottom: 400 } as DOMRect }]);
    expect(shown()).toEqual(['a']);
    expect(unobserved).toEqual([a]);
  });

  it('shows a block the visitor has jumped past', () => {
    wireReveal(document);
    const b = document.getElementById('b')!;
    callbacks[0]([{ target: b, isIntersecting: false, boundingClientRect: { bottom: -120 } as DOMRect }]);
    expect(shown()).toEqual(['b']);
  });

  it('leaves a block below the viewport waiting until it arrives', () => {
    wireReveal(document);
    const b = document.getElementById('b')!;
    callbacks[0]([{ target: b, isIntersecting: false, boundingClientRect: { bottom: 2400 } as DOMRect }]);
    expect(shown()).toEqual([]);
    expect(unobserved).toEqual([]);
  });

  it('arms nothing under reduced motion', () => {
    vi.stubGlobal('matchMedia', matchMedia(true));
    wireReveal(document);
    expect(armed()).toEqual([]);
    expect(callbacks).toEqual([]);
  });

  it('arms nothing without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    wireReveal(document);
    expect(armed()).toEqual([]);
  });

  it('does nothing when everything fits on the first screen', () => {
    vi.stubGlobal('innerHeight', 5000);
    wireReveal(document);
    expect(armed()).toEqual([]);
    expect(callbacks).toEqual([]);
  });
});

/**
 * The scroll-in reveal observer (src/lib/reveal.ts).
 *
 * What matters: nothing stays hidden for a visitor who should see it — not
 * with reduced motion, not in a browser without IntersectionObserver, and
 * not for a block the visitor is scrolling back up to.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IN_CLASS, wireReveal } from '../src/lib/reveal';

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

function page(): void {
  document.body.innerHTML = `
    <section data-reveal id="a"></section>
    <ul data-reveal="stagger" id="b"><li></li><li></li></ul>
    <section id="plain"></section>`;
}

const shown = () => [...document.querySelectorAll(`.${IN_CLASS}`)].map((e) => e.id);

beforeEach(() => {
  callbacks = [];
  observed = [];
  unobserved = [];
  page();
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  vi.stubGlobal('matchMedia', matchMedia(false));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('wireReveal', () => {
  it('observes every data-reveal block and nothing else', () => {
    wireReveal(document);
    expect(observed.map((e) => e.id)).toEqual(['a', 'b']);
    expect(shown()).toEqual([]);
  });

  it('marks a block in when it intersects, then stops watching it', () => {
    wireReveal(document);
    const a = document.getElementById('a')!;
    callbacks[0]([{ target: a, isIntersecting: true, boundingClientRect: { bottom: 400 } as DOMRect }]);
    expect(shown()).toEqual(['a']);
    expect(unobserved).toEqual([a]);
  });

  it('marks a block in at once when it is already above the viewport', () => {
    wireReveal(document);
    const b = document.getElementById('b')!;
    callbacks[0]([{ target: b, isIntersecting: false, boundingClientRect: { bottom: -120 } as DOMRect }]);
    expect(shown()).toEqual(['b']);
  });

  it('leaves a block below the viewport alone until it arrives', () => {
    wireReveal(document);
    const b = document.getElementById('b')!;
    callbacks[0]([{ target: b, isIntersecting: false, boundingClientRect: { bottom: 2400 } as DOMRect }]);
    expect(shown()).toEqual([]);
    expect(unobserved).toEqual([]);
  });

  it('shows everything immediately under reduced motion', () => {
    vi.stubGlobal('matchMedia', matchMedia(true));
    wireReveal(document);
    expect(shown()).toEqual(['a', 'b']);
    expect(observed).toEqual([]);
  });

  it('shows everything immediately without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    wireReveal(document);
    expect(shown()).toEqual(['a', 'b']);
  });

  it('does nothing on a page with no reveal blocks', () => {
    document.body.innerHTML = '<p>plain</p>';
    wireReveal(document);
    expect(callbacks).toEqual([]);
  });
});

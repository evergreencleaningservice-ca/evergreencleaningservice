/**
 * The scroll-in reveal. The styling lives in styles/global.css under
 * "scroll-in reveal"; this decides what waits to be revealed.
 *
 * Two ways a page opts in:
 *
 *   data-reveal            the block fades in as one piece
 *   data-reveal="stagger"  the block's children fade in one after another
 *   data-reveal="flow"     every child of the block is its own reveal — for
 *                          running content (a post body, a page's copy, a
 *                          list of articles, a sidebar), where a long column
 *                          should arrive a paragraph at a time as it is read
 *                          rather than all at once when its top appears
 *
 * The rule that matters most, for visitors and for search: NOTHING ON THE
 * FIRST SCREEN IS EVER HIDDEN. CSS hides a block only once this script has
 * "armed" it (`data-reveal-armed`), and it arms only blocks whose top is
 * below the viewport when the page starts. So:
 *
 *   - The Largest Contentful Paint — a hero, a post's featured image, the
 *     first cards — paints at once, exactly as it would with no reveal.
 *     Hiding it until a script ran is what would have cost ranking.
 *   - Without JavaScript nothing is armed, so nothing is hidden: a crawler's
 *     first fetch, reader mode and a browser with scripts off see the page
 *     as it is.
 *   - With reduced motion asked for, or no IntersectionObserver, nothing is
 *     armed either.
 *   - Arming happens off-screen, so it never makes something visible vanish.
 *   - A block opened over by an anchor jump or a restored scroll position is
 *     above the viewport, not below it, so it is never armed; and an armed
 *     block that ends up above the viewport (a jump to the end of the page)
 *     is revealed at once rather than left hidden behind the reader.
 *   - Each block is let go once it is in. There is no reverse.
 */

export const REVEAL_ATTR = 'data-reveal';
export const ARMED_ATTR = 'data-reveal-armed';
export const IN_CLASS = 'is-in';

/* The bottom 10% of the viewport is the trigger band: a block starts its
   fade just before its top edge would have been visible, so by the time
   the eye reaches it the motion is mostly done. */
const ROOT_MARGIN = '0px 0px -10% 0px';

/* Never made into a reveal of their own inside a flow: they draw nothing,
   or they already reveal themselves. */
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'LINK', 'META', 'NOSCRIPT', 'BR', 'HR']);

/** The elements that should reveal: explicit blocks, and each child of a flow. */
export function revealTargets(root: ParentNode): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`)) {
    if (el.getAttribute(REVEAL_ATTR) !== 'flow') {
      out.push(el);
      continue;
    }
    for (const child of el.children) {
      if (!(child instanceof HTMLElement) || SKIP.has(child.tagName) || child.hidden) continue;
      /* A child that is, or holds, a reveal of its own is left to that one:
         a section fading in while its cards stagger in is two motions for
         one arrival. */
      if (child.hasAttribute(REVEAL_ATTR) || child.querySelector(`[${REVEAL_ATTR}]`)) continue;
      out.push(child);
    }
  }
  return out;
}

export function wireReveal(root: Document = document): void {
  const win = root.defaultView ?? window;
  const still = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const Observer = (win as Window & typeof globalThis).IntersectionObserver;
  if (still || typeof Observer !== 'function') return;

  /* Read every position first and write afterwards, so arming one block
     cannot move the next one before it has been measured. */
  const fold = win.innerHeight;
  const below = revealTargets(root).filter((el) => el.getBoundingClientRect().top >= fold);
  if (below.length === 0) return;

  const io = new Observer(
    (entries) => {
      for (const entry of entries) {
        const above = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !above) continue;
        entry.target.classList.add(IN_CLASS);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: 0.01 },
  );

  for (const el of below) {
    /* A flow child is a plain reveal; an explicit block keeps its own mode. */
    if (!el.hasAttribute(REVEAL_ATTR)) el.setAttribute(REVEAL_ATTR, '');
    el.setAttribute(ARMED_ATTR, '');
    io.observe(el);
  }
}

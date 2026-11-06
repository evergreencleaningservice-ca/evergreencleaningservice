/**
 * The scroll-in reveal: `is-in` on every `[data-reveal]` block as it
 * approaches the viewport. The styling lives in styles/global.css under
 * "scroll-in reveal"; this is only the observer.
 *
 * The rules it keeps, each of which the 2026-10-15 removal of the theme's
 * own `.wow` reveal was there to protect:
 *
 *   - Without JavaScript nothing is hidden (the CSS is gated on `html.js`,
 *     which BaseLayout sets inline before the body parses, not here).
 *   - With reduced motion asked for, or no IntersectionObserver, every block
 *     is marked in at once: the CSS hides nothing under reduced motion, and
 *     an old browser gets the page as it was.
 *   - A block already ABOVE the viewport when it is first observed — the
 *     page restored its scroll position, or opened at an anchor — is marked
 *     in immediately. An observer only reports "intersecting" for what is
 *     in view, so without this a visitor scrolling back up would find the
 *     blocks they skipped still invisible.
 *   - Each block is observed once and let go once it is in. There is no
 *     reverse: content that has been read does not fade out again.
 */

export const REVEAL_ATTR = 'data-reveal';
export const IN_CLASS = 'is-in';

/* The bottom 10% of the viewport is the trigger band: a block starts its
   fade just before its top edge would have been visible, so by the time
   the eye reaches it the motion is mostly done. */
const ROOT_MARGIN = '0px 0px -10% 0px';

export function wireReveal(root: Document = document): void {
  const blocks = [...root.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`)];
  if (blocks.length === 0) return;

  const win = root.defaultView ?? window;
  const still = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const Observer = (win as Window & typeof globalThis).IntersectionObserver;

  const show = (el: Element) => el.classList.add(IN_CLASS);

  if (still || typeof Observer !== 'function') {
    blocks.forEach(show);
    return;
  }

  const io = new Observer(
    (entries) => {
      for (const entry of entries) {
        const above = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !above) continue;
        show(entry.target);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: 0.01 },
  );

  blocks.forEach((el) => io.observe(el));
}

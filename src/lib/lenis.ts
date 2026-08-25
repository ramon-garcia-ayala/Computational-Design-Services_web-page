import type Lenis from "lenis";

/**
 * The one live Lenis instance, published for anything that has to move the
 * page itself.
 *
 * `SmoothScroll` owns the instance and it is deliberately a local inside that
 * effect, so nothing else could reach it. That is fine for links — Lenis
 * intercepts those through its `anchors` option — but not for a control that
 * scrolls on click, and **a native scroll is not a substitute**: it moves the
 * document without Lenis knowing, leaving Lenis and the document at different
 * positions. ScrollTrigger then still believes the page is where it was, and
 * every reveal on it stops firing. Same trap the hash-landing code in
 * `SmoothScroll` exists to avoid.
 *
 * This is a module-scoped variable rather than a context because the consumers
 * are leaf components on unrelated pages and there is only ever one instance;
 * a provider would be ceremony around a single value.
 */
let current: Lenis | null = null;

/** Called by `SmoothScroll` on create, and with `null` on destroy. */
export function setLenis(instance: Lenis | null) {
  current = instance;
}

/**
 * Send the page back to the top, through Lenis when it is running.
 *
 * `immediate` skips Lenis's easing, which is what these pages want: a project
 * runs to twenty-odd screen-heights and the home page longer, and animating
 * that distance is a second of streaked motion that tells the reader nothing.
 *
 * It still goes through Lenis rather than jumping natively. `immediate` moves
 * Lenis's own position with the document, so the two stay agreed; a native
 * `window.scrollTo` moves only the document and leaves ScrollTrigger reading a
 * stale position, after which nothing below reveals.
 *
 * The fallback looks like an oversight and is not: no instance means
 * `SmoothScroll` declined to create one, and it only declines under
 * `prefers-reduced-motion` — where an instant jump is the correct behaviour.
 */
export function scrollToTop() {
  if (current) {
    current.scrollTo(0, { immediate: true });
    return;
  }
  window.scrollTo(0, 0);
}

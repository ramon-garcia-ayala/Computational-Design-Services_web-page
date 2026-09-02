/**
 * A latch for "the page is not ready to be scrolled to a position yet".
 *
 * It exists for one interaction. Landing on a URL with a hash makes
 * `SmoothScroll` jump to that element on mount, and on Home the `Preloader` is
 * mounted at the same time and spends ~2.75s holding `html { overflow: hidden }`,
 * calling `window.scrollTo(0, 0)`, and — the part that actually breaks the
 * jump — waiting on `document.fonts.ready` before it will fade. The display
 * face swapping in reflows every heading below the fold, so a jump measured
 * before the swap lands somewhere else after it. Measured across four viewport
 * heights on one build, the section a hash pointed at came to rest anywhere
 * from 101px above the header's bottom edge to 61px below it, and the error
 * tracked the viewport width — which is what a stale measurement looks like,
 * not a wrong offset.
 *
 * So the jump waits for the page to stop moving instead of being tuned against
 * where it happens to land. Anything that will change layout during startup
 * takes a hold; the jump runs when the last one is released.
 *
 * **Deliberately not a React context.** The two parties are a provider in the
 * root layout and a component several levels down inside a route, so a context
 * would have to be threaded through everything between them for a handshake
 * neither of them wants to expose. This is the same shape `lib/lenis.ts`
 * already uses to publish the Lenis instance across the same gap.
 *
 * Module state is only ever written from effects, never during render, so the
 * server's copy of this module stays at zero for every request — the same rule
 * `Preloader`'s own `hasPlayed` flag documents, and for the same reason.
 */

let holds = 0;
let waiters: Array<() => void> = [];

/**
 * Take a hold. Returns its release, which is safe to call twice — a React
 * effect cleanup can run after the holder has already released on its own.
 */
export function holdScrollGate(): () => void {
  holds += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds -= 1;
    if (holds > 0) return;

    /* Swap before draining: a waiter is free to take a new hold as it runs,
       and it must land in a fresh list rather than one being iterated. */
    const pending = waiters;
    waiters = [];
    for (const resolve of pending) resolve();
  };
}

/**
 * Resolves once nothing is holding. Resolves *synchronously into a microtask*
 * when the gate is already open, which is every route that does not mount a
 * `Preloader` — callers on those pages are not made to wait a frame for a
 * handshake that has no other party.
 */
export function whenScrollGateOpen(): Promise<void> {
  if (holds <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    waiters.push(resolve);
  });
}

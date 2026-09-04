"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { whenScrollGateOpen } from "@/lib/scroll-gate";

/**
 * Global smooth scroll (Lenis) coupled to GSAP.
 *
 * Key points:
 *  - Lenis is instantiated ONCE and driven from the GSAP ticker. If each
 *    library ran its own requestAnimationFrame, the scroll and the
 *    ScrollTriggers would drift one frame apart.
 *  - `lenis.on("scroll", ScrollTrigger.update)` keeps the triggers up to date,
 *    because Lenis never fires the document's native scroll event.
 *  - Anchor jumps MUST go through Lenis. A native jump moves the document
 *    without Lenis knowing, so ScrollTrigger still believes we are at the top
 *    and nothing it animates ever reveals itself: the page looks blank. Hence
 *    `anchors` and the initial jump below.
 *  - With `prefers-reduced-motion` nothing is instantiated: native browser scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Soft ease-out curve; no overshoot so the pin does not jitter.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Lenis intercepts clicks on internal links and animates them itself.
      anchors: true,
    });

    /* Guards the gated jump below against this effect being cleaned up while
       it is still waiting. */
    let cancelled = false;

    lenis.on("scroll", ScrollTrigger.update);

    /* Published so a control that scrolls on click can go through Lenis
       rather than past it — see `lib/lenis.ts`. */
    setLenis(lenis);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // The GSAP ticker normally clamps the delta; here it gets in the way.
    gsap.ticker.lagSmoothing(0);

    /* Landing straight on a URL with a hash: the browser has already jumped on
       its own, before Lenis existed. The jump is redone through Lenis so that
       its position and the document's line up again. */
    const { hash } = window.location;
    if (hash.length > 1) {
      /* Not every hash is a selector. `/labs/tool` carries its whole spec in
         the fragment, and a payload starting with a digit throws inside
         `querySelector` — which would take the Lenis setup, and with it every
         reveal on the page, down with it. */
      let target: Element | null = null;
      try {
        target = document.querySelector(hash);
      } catch {
        target = null;
      }

      if (target) {
        /* The jump waits for the page to stop moving.
           
           Two things move it. Home pins two `PanelSection` runways above the
           document band, and a pin's spacer height is only decided by
           `ScrollTrigger.refresh()` — so the refresh has to come *before* the
           jump, or the target is measured against a layout that then shifts
           underneath it. And `Preloader`, mounted on the same commit, holds
           the scroll gate until it has faded, which it will not do until
           `document.fonts.ready` has settled: the display face swapping in
           reflows every heading below the fold. Jumping before either of
           those left the section a hash pointed at anywhere from 101px above
           the header's bottom edge to 61px below it, varying with viewport
           size — a stale measurement, not a wrong offset, which is why no
           amount of `scroll-margin-top` could correct it.
           
           On every route that mounts no preloader the gate is already open and
           this costs one microtask. `scroll-margin-top` on the target is read
           by Lenis's own `scrollTo`, which is what clears the fixed header. */
        void whenScrollGateOpen().then(() => {
          /* The effect can be torn down while we wait — a route change, or
             StrictMode's second pass — and Lenis is destroyed in its cleanup.
             Same guard as the encode effect in `ToolViewerPage`. */
          if (cancelled) return;
          ScrollTrigger.refresh();
          lenis.scrollTo(target as HTMLElement, { immediate: true });
        });
      }
    }

    return () => {
      cancelled = true;
      setLenis(null);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

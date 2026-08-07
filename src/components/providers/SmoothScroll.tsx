"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

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

    lenis.on("scroll", ScrollTrigger.update);

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
        window.scrollTo(0, 0);
        lenis.scrollTo(target as HTMLElement, { immediate: true });
        ScrollTrigger.refresh();
      }
    }

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

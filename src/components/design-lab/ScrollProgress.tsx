"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * A persistent position marker down the right edge of the viewport.
 *
 * **This replaces nothing.** The small circular icon in the bottom-left corner
 * during development is `nextjs-portal`, the Next.js dev overlay — it is not
 * ours and does not exist in a production build. This is the real indicator.
 *
 * The right edge rather than the left: the header's controls, the hero lockup
 * and every panel's copy all begin at the left margin, so a full-height rule
 * there would run straight through the type. The right edge is empty at every
 * breakpoint.
 *
 * **It is white with `mix-blend-mode: difference`, which is what makes it
 * read as solid black.** A literally black bar works on the greige hero and
 * then vanishes against the dark panels, which are only a few steps off black
 * themselves — the marker would disappear for most of the page. Difference
 * blending inverts whatever is behind it, so it renders near-black on the
 * pale hero and light on the dark panels: one element, always legible,
 * without tracking which panel is currently underneath.
 *
 * No reduced-motion branch. The bar reports position rather than animating
 * for effect, and `scrub: 0.25` only smooths the value it already has — there
 * is nothing here for that preference to object to, and hiding a wayfinding
 * aid would take information away from the people who asked for less motion.
 */
export function ScrollProgress() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const fill = rootRef.current?.querySelector("[data-fill]");
      if (!fill) return;

      const tween = gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            // The document itself, so the bar tracks the whole page rather
            // than any one section.
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        },
      );

      // The page grows as the frame sequence decodes and the panels mount, so
      // the end position measured on the first pass is not the final one.
      ScrollTrigger.refresh();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-0 z-[60] w-[3px] mix-blend-difference"
    >
      <div
        data-fill
        className="h-full w-full origin-top bg-white"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}

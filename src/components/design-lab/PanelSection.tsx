"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

type PanelSectionProps = {
  children: React.ReactNode;
  /** Scroll runway in `svh`. The extra over 100 is the hold. */
  runway?: number;
  /**
   * Soften the panel's leading edge into whatever it is rising over
   * (spec §12.11). Only the first panel needs it: it is the one that meets
   * the light hero plate, and a solid edge against that reads as a cut.
   * Panel-on-panel is carbon over carbon, where there is no seam to hide.
   */
  blend?: boolean;
  className?: string;
};

/**
 * One full-bleed panel that morphs up from the bottom (spec §6).
 *
 * The mechanism is a tall section with a `sticky top-0` stage inside it, and
 * the panel translated from `yPercent: 100` to `0` across the window between
 * the section's top touching the bottom of the viewport and touching the top
 * of it. During that window the stage is still travelling up the screen while
 * the panel rises within it, so the panel closes on the viewport faster than
 * the scroll does — which is what makes it read as rising *over* whatever is
 * behind rather than merely scrolling into place. Once the section's top
 * reaches the top, the panel is at zero and the sticky holds it there for the
 * remaining runway.
 *
 * It is `scrub`bed rather than played, so scrolling back up reverses it
 * exactly, as §6 requires, without a second set of triggers.
 *
 * Panels stack by document order: each one is later in the DOM than the one
 * before, so it paints over it and no z-index bookkeeping is needed. The
 * first panel rises over the geodesic sequence the moment that sequence ends,
 * because the sequence's runway finishes exactly where this section's top
 * reaches the viewport bottom.
 *
 * Reduced motion changes the markup, not just the tween: the runway and the
 * sticky are dropped entirely, because keeping them would leave the reader
 * scrolling through empty viewports with nothing moving (§7).
 */
export function PanelSection({
  children,
  runway = 160,
  blend = false,
  className,
}: PanelSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      const panel = panelRef.current;
      if (!section || !panel) return;

      /* `y: 0` on both ends is load-bearing, not decoration.
         The panel ships from the server with an inline
         `transform: translateY(100%)` so it cannot flash over the hero before
         hydration. GSAP reads that existing transform, resolves it to pixels,
         and keeps it as a *separate* `y` baseline — then stacks its own
         `yPercent` on top. Without pinning `y`, the panel starts at 200% and
         finishes at 100%: the tween runs perfectly and lands one whole
         viewport low, where `overflow-hidden` clips it, so the panel simply
         never appears. Measured at a 802px viewport: 1604 -> 802 instead of
         1604 -> 0. Naming `y` hands the whole transform to GSAP. */
      const tween = gsap.fromTo(
        panel,
        { yPercent: 100, y: 0 },
        {
          yPercent: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: 0.6,
            // The runway is sized in `svh`, so a mobile URL bar collapsing
            // changes it mid-scroll; without this the trigger keeps the
            // positions it measured on load and the panel stops short of
            // covering.
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  if (reducedMotion) {
    return (
      <section className={cn("relative w-full bg-carbon", className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${runway}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={panelRef}
          className={cn(
            "absolute inset-0 flex flex-col justify-center will-change-transform",
            !blend && "bg-carbon",
            className,
          )}
          style={{
            transform: "translateY(100%)",
            /* The blend is the panel's own background, not a strip laid over
               it: a gradient drawn on top of an opaque plate would have
               nothing to blend into. Past the last stop the gradient is
               solid carbon, so only the leading band is translucent and the
               hero shows through it as the panel climbs. */
            ...(blend
              ? {
                  background:
                    "linear-gradient(to bottom, transparent 0, var(--color-carbon) 16svh)",
                }
              : null),
          }}
        >
          {blend ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-lab-ink/20"
            />
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

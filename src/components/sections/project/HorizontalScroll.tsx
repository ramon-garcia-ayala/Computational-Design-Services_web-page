"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ProjectPanel } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Horizontal walkthrough of the case study.
 *
 * From `lg` up the section is pinned and the row of panels moves along X,
 * following the vertical scroll. Below 1024px, or with
 * `prefers-reduced-motion`, the panels stack vertically and no ScrollTrigger is
 * created: the content is the same, only the way you move through it changes.
 *
 * `gsap.matchMedia` is what decides: crossing the breakpoint reverts whatever
 * the previous condition created, with no hand-rolled resize listeners.
 */
export function HorizontalScroll({ panels }: { panels: ProjectPanel[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // The condition deliberately includes the system preference: it is
      // evaluated at effect time, so the pin is never created under reduced
      // motion, not even on the hydration render (where the hook cannot yet
      // know the real preference).
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = trackRef.current;
          const section = sectionRef.current;
          if (!track || !section) return;

          // The real distance to travel; recomputed on every refresh in case
          // the fonts or the window width change.
          const getDistance = () => track.scrollWidth - window.innerWidth;

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Case study"
      className={cn(
        "relative border-t border-line",
        // Only the animated variant needs to fill the whole viewport.
        !reducedMotion && "lg:h-screen lg:overflow-hidden",
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex flex-col",
          !reducedMotion && "lg:h-full lg:flex-row lg:items-center lg:will-change-transform",
        )}
      >
        {panels.map((panel, index) => (
          <article
            key={panel.id}
            className={cn(
              "flex shrink-0 flex-col justify-center border-b border-line px-5 py-16 sm:px-8 sm:py-20",
              "lg:border-b-0 lg:px-12",
              !reducedMotion && "lg:h-full lg:w-[min(46rem,80vw)] lg:border-r lg:border-line",
              reducedMotion && "lg:px-12",
              index === 0 && "lg:pl-12",
            )}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {panel.kicker}
            </p>
            <h2 className="mt-6 max-w-xl font-display text-2xl leading-tight font-semibold tracking-tight text-fg sm:text-3xl lg:text-4xl">
              {panel.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted">
              {panel.body}
            </p>

            {panel.facts ? (
              <dl className="mt-10 grid max-w-xl gap-6 sm:grid-cols-2">
                {panel.facts.map((fact) => (
                  <div key={fact.label} className="border-t border-line pt-4">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-lg font-semibold text-fg">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

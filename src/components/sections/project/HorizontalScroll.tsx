"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { trackOf, type Project } from "@/data/projects";
import { MediaPanel } from "./MediaPanel";
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
/**
 * Scroll budget for the pin, as a fraction of the distance travelled.
 *
 * The tween moves the track by its full `getDistance()`; this only decides how
 * much vertical scrolling that is spread across. At 1 the track follows the
 * wheel exactly, which is the most direct feel and also the reason sizing the
 * media properly doubled the section: the longest case study went from 16 to 31
 * screen-heights of scrolling. Below 1 the track moves faster than the wheel,
 * which buys the larger media back at no cost in patience.
 */
const PIN_RATIO = 0.55;

export function HorizontalScroll({ project }: { project: Project }) {
  const track = trackOf(project);
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
              end: () => `+=${getDistance() * PIN_RATIO}`,
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
        {track.map((entry, index) => (
          <article
            key={entry.key}
            id={entry.kind === "panel" ? entry.panel.id : undefined}
            className={cn(
              "flex shrink-0 flex-col justify-center border-b border-line px-5 py-16 sm:px-8 sm:py-20",
              "lg:border-b-0 lg:px-12",
              !reducedMotion && "lg:h-full lg:border-r lg:border-line",
              /* Text keeps the prose measure; media shrink-wraps whatever the
                 picture works out to, which is the whole point of sizing it by
                 height. Applying one width to both is what made every asset
                 640px wide regardless of shape. */
              !reducedMotion && entry.kind === "panel" && "lg:w-[min(46rem,80vw)]",
              !reducedMotion && entry.kind === "media" && "lg:w-auto",
              reducedMotion && "lg:px-12",
              index === 0 && "lg:pl-12",
            )}
          >
            {entry.kind === "panel" ? (
              <>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {entry.panel.kicker}
                </p>
                <h2 className="mt-6 max-w-xl text-h3 font-display font-semibold text-fg">
                  {entry.panel.title}
                </h2>
                <p className="text-justify hyphens-auto mt-6 max-w-xl text-base leading-relaxed text-fg-muted">
                  {entry.panel.body}
                </p>

                {entry.panel.facts ? (
                  <dl className="mt-10 grid max-w-xl gap-6 sm:grid-cols-2">
                    {entry.panel.facts.map((fact) => (
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
              </>
            ) : (
              <MediaPanel
                asset={entry.asset}
                alt={`${project.title} — ${entry.index + 1}`}
                /* Only the first asset of the track is worth preloading; the
                   rest are off-screen until the pin starts moving. */
                priority={index <= 1}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

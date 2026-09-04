"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/ui/Reveal";
import { coverOf, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Deterministic slot for each project's cover inside the channel — never
 * randomised, so a shared link renders the same thing twice.
 *
 * `top` is capped at 55% so a ~4:3 cover cannot spill far past the list's
 * bottom edge. `left` and `width` are percentages *of the channel* (columns
 * 9–11), and every pair sums to at most 100 so a cover can never reach the
 * text columns either side of it — which is what keeps the row type off a
 * photograph, and the contrast guaranteed structurally rather than tuned.
 */
const COVER_SLOTS = [
  { top: "2%", left: "0%", width: "92%" },
  { top: "26%", left: "14%", width: "86%" },
  { top: "12%", left: "4%", width: "78%" },
  { top: "44%", left: "8%", width: "90%" },
  { top: "55%", left: "0%", width: "82%" },
  { top: "34%", left: "20%", width: "74%" },
  { top: "48%", left: "6%", width: "94%" },
  { top: "8%", left: "16%", width: "80%" },
  { top: "30%", left: "2%", width: "88%" },
] as const;

/**
 * Editorial index for `/projects`: a typographic list in the language of
 * kuhlandhan.com/, rows dimmed at rest and snapping to full ink on hover or
 * focus. Hovering a row also fades in that project's cover, in a fixed
 * channel behind the list (columns 9–11) so it can never sit under a row's
 * own text — see the plan doc for the contrast arithmetic that ruled out
 * putting a cover on top of type instead.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  /* Hover and focus are tracked separately, with focus winning, rather than
     one shared `active` index last-write-wins between them. Chromium
     recomputes `:hover` after any scroll — including the one `focus()`
     triggers via `scrollIntoView` — and can fire a real `pointerenter` on
     whatever row now sits under a mouse that never moved. Without this
     split, that stray event silently steals the cover from the row a
     keyboard user just tabbed to. */
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const active = focusIndex ?? hoverIndex;
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const covers = gsap.utils.toArray<HTMLElement>("[data-cover]");
          covers.forEach((el, i) => {
            gsap.to(el, {
              xPercent: 4,
              yPercent: -6,
              duration: 7 + i * 0.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: layerRef, dependencies: [reducedMotion] },
  );

  /* The top padding is this section's own now — the hero that used to supply
     it is gone. `<main>` already clears the fixed header with `pt-20`; this
     is the breathing room above the first column rule. */
  return (
    <section aria-label="All projects" className="pt-16 pb-24 sm:pt-20 sm:pb-32">
      <div className="shell relative">
        {/* Column headings, lg and up only — the reference's tiny masthead
            row above the list. `border-edge`, not `border-line`: a rule the
            reader relies on to read the grid is structure, not decoration. */}
        <div className="hidden border-b border-edge pb-3 lg:grid lg:grid-cols-12 lg:gap-x-4">
          <span className="col-span-4 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Discipline
          </span>
          <span className="col-span-4 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Project
          </span>
          <span className="col-span-1 col-start-12 text-right font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Year
          </span>
        </div>

        <div className="relative" ref={layerRef} onPointerLeave={() => setHoverIndex(null)}>
          {/* Cover channel: fixed to columns 9–11, behind the list, never
              overlapping a row's own text. `pointer-events-none` and
              `aria-hidden` because it only ever echoes what the row link
              beside it already says. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 hidden grid-cols-12 gap-x-4 lg:grid"
          >
            {/* One cell for all nine covers, not one cell each. Nine cells
                all asking for `col-start-8` are auto-placed into nine
                implicit rows, which makes each cell a ninth of the list and
                resolves every `top` percentage against ~51px instead of the
                full height — the covers end up pinned beside their own row
                with no vertical variation at all. */}
            <div className="relative col-span-3 col-start-9">
              {projects.map((project, i) => {
                const cover = coverOf(project.slug);
                if (!cover) return null;
                const slot = COVER_SLOTS[i % COVER_SLOTS.length];

                return (
                  <figure
                    key={project.slug}
                    data-cover
                    data-active={active === i || undefined}
                    style={{ top: slot.top, left: slot.left, width: slot.width }}
                    className="absolute opacity-0 transition-opacity duration-300 ease-out data-[active]:opacity-100"
                  >
                    <Image
                      src={cover.src}
                      alt=""
                      width={cover.width}
                      height={cover.height}
                      sizes="25vw"
                      className="h-auto w-full rounded-surface object-cover"
                    />
                  </figure>
                );
              })}
            </div>
          </div>

          <Reveal as="ul" stagger="[data-reveal]" className="relative z-10">
            {projects.map((project, i) => {
              const cover = coverOf(project.slug);

              return (
                <li key={project.slug} data-reveal className="reveal-init">
                  <Link
                    href={`/projects/${project.slug}`}
                    onPointerEnter={() => setHoverIndex(i)}
                    onFocus={() => setFocusIndex(i)}
                    onBlur={() => setFocusIndex(null)}
                    className={cn(
                      "group grid grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-1 border-b border-edge py-4",
                      /* One family for the whole row, inherited by every
                         column, so nothing has to restate it. */
                      "font-display font-light text-fg-muted transition-colors duration-200",
                      /* Weight carries the hover as much as colour does. The
                         idle row is deliberately light so 300 → 500 reads as
                         a real change; colour alone (#4a4642 → #2a2826) is
                         two dark browns on greige and barely registers. */
                      "hover:font-medium hover:text-fg focus-visible:font-medium focus-visible:text-fg",
                      "lg:grid-cols-12 lg:items-baseline lg:border-b-0 lg:py-2.5",
                    )}
                  >
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt=""
                        width={64}
                        height={64}
                        className="row-span-3 h-16 w-16 rounded-surface object-cover lg:hidden"
                      />
                    ) : (
                      <span className="row-span-3 h-16 w-16 rounded-surface bg-graphite lg:hidden" aria-hidden="true" />
                    )}

                    {/* Discipline, not context: `context` is the identical
                        "IAAC · Barcelona" on all nine projects, so as a
                        column it was dead weight in the widest slot. The
                        first tag varies row to row, which is the job the
                        reference's leading column does. */}
                    {/* The `lg:` type is spelled out on each column rather
                        than shared through a constant: Tailwind's scanner
                        did not extract these candidates from a module-level
                        string, so the utilities silently never reached the
                        stylesheet and every row fell back to `text-sm`.
                        Written out, it also matches how the rest of the
                        codebase carries its clamps (see `HeroOverlay`).

                        The size is its own clamp rather than `text-h3`,
                        which is tuned for section subheadings and lands at
                        22px on a 1440 laptop — under the 26px this index
                        reads at. Measured: 20px at 1024, 26.6px at 1440,
                        capped at 32px so a 4K display does not turn nine
                        rows into nine headlines. */}
                    <span className="col-start-2 text-sm lg:col-span-4 lg:col-start-1 lg:text-[clamp(1.25rem,1.85vw,2rem)] lg:leading-[1.1] lg:tracking-[-0.03em]">
                      {project.tags[0]}
                    </span>
                    <span className="col-start-2 text-lg lg:col-span-4 lg:col-start-5 lg:text-[clamp(1.25rem,1.85vw,2rem)] lg:leading-[1.1] lg:tracking-[-0.03em]">
                      {project.title}
                    </span>
                    <span className="col-start-2 text-sm lg:col-span-1 lg:col-start-12 lg:text-right lg:text-[clamp(1.25rem,1.85vw,2rem)] lg:leading-[1.1] lg:tracking-[-0.03em]">
                      {project.year}
                    </span>
                  </Link>
                </li>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

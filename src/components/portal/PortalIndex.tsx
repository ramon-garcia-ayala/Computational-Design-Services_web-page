"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PortalIndexEntry = { id: string; label: string };

/**
 * The panel's section index, in two forms driven by one observer.
 *
 * Above `lg` it is the left-margin tick rail, the same mechanism
 * `ProposalIndex` uses. Below `lg` it is a sticky strip of chips under the
 * header. A distinct component from `ProposalIndex` because it carries
 * `data-portal-chrome`, not `data-proposal-chrome` — the two print scopes must
 * stay independently toggleable.
 *
 * ## Why the mobile strip exists
 *
 * The rail was `hidden lg:block` and nothing replaced it, so on a phone this
 * seven-section panel had no index at all: a client checking whether the
 * budget had moved scrolled past Performance, Timeline, Scope, To-do and
 * Documents to find out. The strip is the same seven entries, the same active
 * state, and the same anchors — it is the rail, in the one shape that fits
 * 390px.
 *
 * It sits *after* the hero in the DOM rather than before it. `position:
 * sticky` pins an element once its flow position would pass `top`, so mounted
 * at the top of the document the strip would stick immediately, behind the
 * fixed header, and reserve a band above the hero for nothing. After the hero
 * it behaves the way a section tab bar should: it is part of the sections it
 * indexes, and it arrives when they do.
 *
 * ## Why there is no `data-lenis-prevent` on it
 *
 * The reflex on this codebase is that anything scrollable inside the page
 * needs it, and here it would be the bug rather than the fix. Lenis runs with
 * `syncTouch` at its default `false`, so on a touch device scrolling is
 * entirely native and Lenis only reads the result — a sideways swipe on the
 * strip already works. What the attribute would add is Lenis declining to
 * scroll the page whenever a gesture starts on the strip, and the strip has no
 * vertical overflow to hand it to: a downward swipe that happened to begin on
 * a chip would move nothing. That is the same failure `ChatWidget` documents
 * for its transcript, arriving from the opposite direction.
 *
 * ## The desktop label
 *
 * It is hover/focus-only and plated. `.shell` is capped at `max-width: 1440px`
 * with 3rem of `lg` padding, so the margin the rail lives in is 48px while the
 * label needs 130 — at 1440px the label ran to x=123 over a content column
 * starting at x=48, and `01 · OVERVIEW` was drawn across the hero's own lead
 * paragraph. `group-focus-visible` is the accessibility half: every label was
 * `opacity-0` for keyboard users, so tabbing the rail moved a focus ring
 * through seven links with nothing readable beside any of them.
 */
export function PortalIndex({ entries }: { entries: PortalIndexEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");
  const stripRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries_) => {
        const visible = entries_
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [entries]);

  /* Keep the active chip in view as the reader scrolls, or the index silently
     stops indexing: by Documents the current chip has left the strip to the
     left and the strip still reads "Overview · Timeline · Scope".
     `scrollIntoView` on the strip only — `block: "nearest"` so it never also
     scrolls the page — and `behavior` follows the reduced-motion preference,
     which is read here rather than through `useReducedMotion` because this is
     a one-shot response to a state change, not a mounted animation. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const chip = strip.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!chip) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chip.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  return (
    <>
      {/* Desktop: the tick rail, in the page margin. */}
      <nav
        aria-label="Panel sections"
        data-portal-chrome
        className="fixed top-1/2 left-3 z-40 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col gap-1">
          {entries.map((entry, index) => {
            const active = entry.id === activeId;

            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  aria-current={active ? "true" : undefined}
                  className="group relative flex h-6 items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px transition-all duration-300",
                      active
                        ? "w-6 bg-accent"
                        : "w-3 bg-line group-hover:w-5 group-hover:bg-fg-muted",
                    )}
                  />

                  {/* Absolute so revealing it never reflows the rail. */}
                  <span
                    className={cn(
                      "pointer-events-none absolute left-8 rounded-control border px-2.5 py-1",
                      "font-mono text-[10px] whitespace-nowrap uppercase tracking-widest",
                      "opacity-0 transition-opacity duration-200",
                      "group-hover:opacity-100 group-focus-visible:opacity-100",
                      active
                        ? "border-accent-ink bg-carbon text-accent-ink"
                        : "border-line bg-carbon text-fg-muted",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")} · {entry.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: the same seven entries as a sticky strip.
          `top-14` is the fixed header's own height, so the two stack rather
          than overlap. The wrapper carries the plate and the rule; the list
          inside is what scrolls, bled to the viewport edges with `-mx-5` so a
          chip clipped at the edge reads as "there is more" instead of
          stopping short inside the gutter. */}
      <nav
        aria-label="Panel sections"
        data-portal-chrome
        className="sticky top-14 z-30 border-b border-line-soft bg-carbon/90 backdrop-blur-sm lg:hidden"
      >
        <div className="shell">
          <ul
            ref={stripRef}
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-2.5 sm:-mx-8 sm:px-8"
          >
            {entries.map((entry, index) => {
              const active = entry.id === activeId;

              return (
                <li key={entry.id} className="shrink-0">
                  <a
                    data-chip={entry.id}
                    href={`#${entry.id}`}
                    aria-current={active ? "true" : undefined}
                    /* `min-h-11` is 44px. The chip's own type sets a ~27px
                       box, which clears WCAG 2.2's 24px web minimum and is
                       still a poor thumb target on a strip where the
                       neighbours are 8px away. */
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-control border px-3.5",
                      "font-mono text-[11px] whitespace-nowrap uppercase tracking-widest",
                      "transition-colors duration-200",
                      active
                        ? "border-accent-ink text-accent-ink"
                        : "border-line text-fg-muted",
                    )}
                  >
                    <span aria-hidden="true" className="mr-1.5 opacity-60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {entry.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

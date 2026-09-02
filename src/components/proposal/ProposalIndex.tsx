"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type IndexEntry = { id: string; label: string };

/**
 * Navigation rail for the document. Below `lg`, and when printing, it is not
 * shown.
 *
 * ## The label cannot live in the margin, so it no longer tries
 *
 * This used to print the active entry's label permanently, on the stated
 * reasoning that `.shell`'s 3rem of `lg`-and-up padding was margin enough that
 * it "never encroaches on the content at any width". Measured, that margin is
 * 48px and the label needs 130 — so at 1440px the label ran to x=123 while the
 * content column started at x=48, and `01 · SUMMARY` was drawn straight across
 * the proposal's own headline. Widening the padding cannot fix it either:
 * `.shell` is capped at `max-width: 1440px`, so below that width there is no
 * margin at all and the overlap is structural.
 *
 * So the rail is a column of ticks, and the label appears only for the entry
 * the reader is pointing at or has tabbed to — plated, in the site's chip
 * idiom, because a label revealed on demand still lands on whatever is
 * underneath it.
 *
 * `group-focus-visible` is not decoration: every label was `opacity-0` for
 * keyboard users, so tabbing through the rail moved a focus ring across seven
 * links with nothing legible beside any of them.
 *
 * Kept in step with `PortalIndex`, which is the same rail under its own chrome
 * attribute — the two are deliberate duplicates so the print scopes stay
 * independently toggleable, which means a fix to one belongs in both.
 */
export function ProposalIndex({ entries }: { entries: IndexEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    /* The active section is the last one to have crossed the top third of the
       viewport. With a single observer and an aggressive bottom margin, the
       reading matches whatever the eye is actually on. */
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

  return (
    <nav
      aria-label="Document sections"
      data-proposal-chrome
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
  );
}

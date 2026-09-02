"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type PortalIndexEntry = { id: string; label: string };

/**
 * Left-margin scrollspy rail, same mechanism as `ProposalIndex` — a single
 * `IntersectionObserver`, and the ticks live in the page margin. A distinct
 * component (rather than reusing `ProposalIndex` directly) because it carries
 * `data-portal-chrome`, not `data-proposal-chrome` — the two chrome scopes
 * must stay independently toggleable in print.
 *
 * ## The label cannot live in the margin, so it no longer tries
 *
 * The previous version printed the active entry's label permanently, on the
 * stated reasoning that `.shell`'s `lg`-and-up 3rem padding was the margin it
 * sat in. Measured, that margin is 48px and the label needs 130 — so at
 * 1440px the label ran to x=123 while the content column started at x=48, and
 * "01 · OVERVIEW" was drawn straight across the hero's own lead paragraph. It
 * could not be fixed by widening the padding either: `.shell` is capped at
 * `max-width: 1440px`, so below that width there is no margin at all, and the
 * overlap is structural rather than a tuning problem.
 *
 * So the rail is now what it can afford to be at this width — a column of
 * ticks, the same thing `ScrollProgress` is on the home page — and the label
 * appears only for the entry the reader is pointing at or has tabbed to. Over
 * content it carries its own plate, in the site's chip idiom, because a label
 * revealed on demand still lands on top of whatever is underneath it.
 *
 * `group-focus-visible` is not decoration: the label was `opacity-0` for
 * everyone before, keyboard users included, so tabbing into the rail moved
 * focus through seven links that announced themselves to a screen reader and
 * showed a focus ring around nothing legible.
 */
export function PortalIndex({ entries }: { entries: PortalIndexEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");

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

  return (
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

                {/* Absolutely positioned so revealing it never reflows the
                    rail, and plated so it stays readable over the content
                    column it necessarily covers. */}
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

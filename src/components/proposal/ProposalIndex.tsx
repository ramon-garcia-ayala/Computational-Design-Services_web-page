"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type IndexEntry = { id: string; label: string };

/**
 * Rail de navegación del documento. Vive en el margen izquierdo (`.shell` deja
 * 3rem de padding a partir de 1024px), así que no invade el contenido en ningún
 * ancho. Por debajo de `lg` y al imprimir, no se muestra.
 */
export function ProposalIndex({ entries }: { entries: IndexEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    /* La sección activa es la última que ha cruzado el tercio superior de la
       ventana. Con un solo observer y un margen inferior agresivo, la lectura
       coincide con lo que el ojo tiene delante. */
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
                className="group flex h-6 items-center gap-2"
              >
                <span
                  className={cn(
                    "h-px transition-all duration-300",
                    active
                      ? "w-6 bg-accent"
                      : "w-3 bg-line group-hover:w-5 group-hover:bg-fg-muted",
                  )}
                />
                <span
                  className={cn(
                    "font-mono text-[10px] whitespace-nowrap uppercase tracking-widest transition-opacity duration-300",
                    active
                      ? "text-accent opacity-100"
                      : "text-fg-muted opacity-0 group-hover:opacity-100",
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

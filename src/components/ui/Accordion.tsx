"use client";

import { useState } from "react";
import type { ExpertiseArea } from "@/data/expertise";
import { cn } from "@/lib/utils";

/**
 * Áreas de expertise: acordeón en móvil y tabs a partir de `lg`.
 *
 * Ambas variantes comparten el mismo estado (`activeId`), así que al cambiar de
 * breakpoint no se pierde la selección. Solo una está visible a la vez, por eso
 * los paneles de escritorio se marcan `aria-hidden` cuando no son el activo.
 */
export function Accordion({ items }: { items: ExpertiseArea[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div>
      {/* Acordeón (móvil y tablet) */}
      <div className="flex flex-col lg:hidden">
        {items.map((item) => {
          const open = item.id === activeId;
          return (
            <div key={item.id} className="border-t border-line last:border-b">
              <h3>
                <button
                  type="button"
                  onClick={() => setActiveId(open ? "" : item.id)}
                  aria-expanded={open}
                  aria-controls={`panel-${item.id}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span
                    className={cn(
                      "font-display text-lg font-semibold tracking-tight transition-colors",
                      open ? "text-accent" : "text-fg",
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 font-mono text-accent transition-transform duration-300",
                      open && "rotate-45",
                    )}
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                id={`panel-${item.id}`}
                hidden={!open}
                className="pb-6"
              >
                <p className="text-sm leading-relaxed text-fg-muted">
                  {item.body}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {item.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="flex gap-3 text-sm text-fg-muted"
                    >
                      <span className="text-accent" aria-hidden="true">
                        ·
                      </span>
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs (lg en adelante) */}
      <div className="hidden gap-12 lg:grid lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div role="tablist" aria-label="Expertise areas" className="flex flex-col">
          {items.map((item) => {
            const selected = item.id === active?.id;
            return (
              <button
                key={item.id}
                role="tab"
                type="button"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`tabpanel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "border-l-2 py-4 pl-5 text-left font-display text-lg font-semibold tracking-tight transition-colors",
                  selected
                    ? "border-accent text-accent"
                    : "border-line text-fg-muted hover:text-fg",
                )}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`tabpanel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            hidden={item.id !== active?.id}
          >
            <p className="max-w-xl text-lg leading-relaxed text-fg">
              {item.body}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {item.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex gap-3 rounded-lg border border-line bg-graphite px-4 py-3 text-sm text-fg-muted"
                >
                  <span className="text-accent" aria-hidden="true">
                    ·
                  </span>
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

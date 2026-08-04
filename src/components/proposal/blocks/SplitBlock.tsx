import { Reveal } from "@/components/ui/Reveal";
import type { SplitBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { BlockShell } from "./BlockShell";

/**
 * Two status columns. It borrows the convention of technical drawing itself: a
 * solid line for what is built, a dashed one for what is proposed.
 */
export function SplitBlock({ block }: { block: SplitBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal
        stagger="[data-reveal]"
        className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16"
      >
        {block.columns.map((column) => (
          <div key={column.title} className="reveal-init" data-reveal>
            <h3
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                column.tone === "solid" ? "text-accent" : "text-fg-muted",
              )}
            >
              {column.title}
            </h3>

            <ul className="mt-6">
              {column.items.map((item) => (
                <li
                  key={item}
                  className={cn(
                    "py-4 pl-5 text-sm leading-relaxed",
                    column.tone === "solid"
                      ? "border-l-2 border-accent text-fg"
                      : "border-l-2 border-dashed border-line text-fg-muted",
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </BlockShell>
  );
}

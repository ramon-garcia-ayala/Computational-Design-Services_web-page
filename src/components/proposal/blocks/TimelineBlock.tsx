import { Reveal } from "@/components/ui/Reveal";
import type { TimelineBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { BlockShell } from "./BlockShell";

const stateLabel = {
  done: "Complete",
  active: "In progress",
  next: "Planned",
} as const;

/** Engagement phases. Same convention: solid for closed, dashed for upcoming. */
export function TimelineBlock({ block }: { block: TimelineBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal
        stagger="[data-reveal]"
        as="ul"
        className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2"
      >
        {block.phases.map((phase) => {
          const settled = phase.state !== "next";

          return (
            <li
              key={phase.label}
              className="reveal-init flex flex-col bg-carbon p-8 lg:p-10"
              data-reveal
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    settled ? "text-accent" : "text-fg-muted",
                  )}
                >
                  {phase.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest",
                    phase.state === "active"
                      ? "bg-accent text-carbon"
                      : phase.state === "done"
                        ? "border border-accent text-accent"
                        : "border border-dashed border-line text-fg-muted",
                  )}
                >
                  {stateLabel[phase.state]}
                </span>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-fg">
                {phase.title}
              </h3>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {phase.dates}
              </p>

              <ul
                className={cn(
                  "mt-6 border-l-2 pl-5",
                  settled ? "border-accent" : "border-dashed border-line",
                )}
              >
                {phase.items.map((item) =>
                  typeof item === "string" ? (
                    <li
                      key={item}
                      className="py-2 text-sm leading-relaxed text-fg-muted"
                    >
                      {item}
                    </li>
                  ) : (
                    <li key={item.title} className="py-3">
                      <p className="text-sm font-semibold text-fg">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                        {item.body}
                      </p>
                    </li>
                  ),
                )}
              </ul>
            </li>
          );
        })}
      </Reveal>
    </BlockShell>
  );
}

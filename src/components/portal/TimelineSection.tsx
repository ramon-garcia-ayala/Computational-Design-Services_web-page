import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { cardGrid } from "@/components/proposal/blocks/cardGrid";
import { PortalSection } from "./PortalSection";
import { StatusChip } from "./StatusChip";
import type { PortalPhase } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

export function TimelineSection({ phases }: { phases: PortalPhase[] }) {
  const copy = portalCopy.sections.timeline;

  return (
    <PortalSection
      id="timeline"
      kicker={copy.kicker}
      title={copy.title}
      empty={phases.length === 0 ? copy.empty : undefined}
    >
      <Reveal
        stagger="[data-reveal]"
        as="ul"
        className={cn(
          "mt-10 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge",
          cardGrid(phases.length, 3),
        )}
      >
        {phases.map((phase) => {
          const settled = phase.state !== "next";

          return (
            <li key={phase.id} className="reveal-init flex flex-col bg-carbon p-6 lg:p-8" data-reveal>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    settled ? "text-accent-ink" : "text-fg-muted",
                  )}
                >
                  {phase.label}
                </span>
                <StatusChip status={phase.state === "done" ? "done" : phase.state === "active" ? "active" : "planned"}>
                  {portalCopy.phaseState[phase.state]}
                </StatusChip>
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-fg">{phase.title}</h3>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">{phase.dates}</p>

              <ul className={cn("mt-5 border-l-2 pl-5", settled ? "border-accent-ink" : "border-dashed border-edge")}>
                {phase.items.map((item) =>
                  typeof item === "string" ? (
                    <li key={item} className="py-1.5 text-sm leading-relaxed text-fg-muted">
                      {item}
                    </li>
                  ) : (
                    <li key={item.title} className="py-2.5">
                      <p className="text-sm font-semibold text-fg">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.body}</p>
                    </li>
                  ),
                )}
              </ul>
            </li>
          );
        })}
      </Reveal>
    </PortalSection>
  );
}

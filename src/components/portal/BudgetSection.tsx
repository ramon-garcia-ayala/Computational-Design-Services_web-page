import { Reveal } from "@/components/ui/Reveal";
import { StatusChip } from "./StatusChip";
import { PortalSection } from "./PortalSection";
import type { PortalBudget } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

export function BudgetSection({ budget }: { budget: PortalBudget | undefined }) {
  const copy = portalCopy.sections.budget;

  return (
    <PortalSection id="budget" kicker={copy.kicker} title={copy.title} empty={!budget ? copy.empty : undefined}>
      {budget ? (
        <Reveal className="mt-8 max-w-2xl">
          <div className="rounded-surface border border-edge bg-graphite p-6 lg:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{copy.totalLabel}</p>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-accent-ink tabular-nums sm:text-3xl">
                  {budget.currency} {budget.total}
                </p>
              </div>
              {budget.paid ? (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{copy.paidLabel}</p>
                  <p className="mt-2 font-mono text-lg text-fg tabular-nums">
                    {budget.currency} {budget.paid}
                  </p>
                </div>
              ) : null}
            </div>

            {budget.note ? <p className="mt-5 text-sm leading-relaxed text-fg-muted">{budget.note}</p> : null}

            {budget.breakdown ? (
              <ul className="mt-7 border-t border-edge">
                {budget.breakdown.map((line) => (
                  <li
                    key={line.label}
                    className="flex flex-col gap-2 border-b border-edge py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <span className="flex items-center gap-3 text-sm leading-relaxed text-fg-muted">
                      {line.label}
                      {line.state ? (
                        <StatusChip status={line.state === "done" ? "done" : line.state === "active" ? "active" : "planned"}>
                          {portalCopy.phaseState[line.state]}
                        </StatusChip>
                      ) : null}
                    </span>
                    <span className="font-mono text-sm whitespace-nowrap text-fg tabular-nums">{line.amount}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      ) : null}
    </PortalSection>
  );
}

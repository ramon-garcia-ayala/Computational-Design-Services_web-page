import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { cardGrid } from "@/components/proposal/blocks/cardGrid";
import { PortalSection } from "./PortalSection";
import { KpiBar } from "./KpiBar";
import type { PortalKpi } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/**
 * The KPIs as a `gap-px` card grid, the same construction Timeline, To-do and
 * Documents already use here and the same one the proposals use — the lines
 * between cards are the `bg-edge` container showing through the gaps, so
 * `cardGrid` has to pick a column count that divides the item count exactly
 * or the last row renders as a solid bar of border colour.
 */
export function KpiSection({ kpis }: { kpis: PortalKpi[] }) {
  const copy = portalCopy.sections.overview;

  return (
    <PortalSection
      id="overview"
      kicker={copy.kicker}
      title={copy.title}
      empty={kpis.length === 0 ? copy.empty : undefined}
    >
      <Reveal
        as="ul"
        stagger="[data-reveal]"
        className={cn(
          "mt-10 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge",
          cardGrid(kpis.length, 3),
        )}
      >
        {kpis.map((kpi) => (
          <KpiBar key={kpi.id} kpi={kpi} />
        ))}
      </Reveal>
    </PortalSection>
  );
}

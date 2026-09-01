import { Reveal } from "@/components/ui/Reveal";
import { PortalSection } from "./PortalSection";
import { KpiBar } from "./KpiBar";
import type { PortalKpi } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

export function KpiSection({ kpis }: { kpis: PortalKpi[] }) {
  const copy = portalCopy.sections.overview;

  return (
    <PortalSection
      id="overview"
      kicker={copy.kicker}
      title={copy.title}
      empty={kpis.length === 0 ? copy.empty : undefined}
    >
      <Reveal as="ul" stagger="[data-reveal]" className="mt-10">
        {kpis.map((kpi) => (
          <KpiBar key={kpi.id} kpi={kpi} />
        ))}
      </Reveal>
    </PortalSection>
  );
}

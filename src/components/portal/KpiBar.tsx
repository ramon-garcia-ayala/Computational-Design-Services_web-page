import { StatusChip } from "./StatusChip";
import type { PortalKpi } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

function formatValue(value: number, format: PortalKpi["format"], unit?: string): string {
  switch (format) {
    case "percent":
      return `${value}%`;
    case "currency":
      return `${unit ?? "$"}${value.toLocaleString()}`;
    case "duration":
      return `${value} ${unit ?? ""}`.trim();
    default:
      return unit ? `${value} ${unit}` : String(value);
  }
}

/**
 * A bullet-chart row rather than a gauge: with three or more KPIs on one
 * screen, the data guidance is explicit that a gauge grid reads worse than a
 * row of bars, and that the target has to be legible as text, not just a
 * mark on a scale. So the numbers are printed first — `68% · target 80%` —
 * and the bar is the secondary, visual confirmation, not the only channel.
 *
 * The bar itself shows `value` and `target` as proportions of whichever is
 * larger, with a tick at the target's position. That keeps the same geometry
 * whether the metric is "higher is better" or not — the state chip is what
 * actually says whether the number is good news, never the bar's colour
 * alone.
 */
export function KpiBar({ kpi }: { kpi: PortalKpi }) {
  const scale = Math.max(kpi.value, kpi.target, 1e-6);
  const fillPct = Math.max(0, Math.min(100, (kpi.value / scale) * 100));
  const targetPct = Math.max(0, Math.min(100, (kpi.target / scale) * 100));

  return (
    <li className="reveal-init border-t border-edge py-6" data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-fg">{kpi.label}</p>
        <p className="font-mono text-xs text-fg-muted tabular-nums">
          {formatValue(kpi.value, kpi.format, kpi.unit)}
          <span className="mx-1.5 text-fg-muted">·</span>
          target {formatValue(kpi.target, kpi.format, kpi.unit)}
        </p>
      </div>

      <div className="relative mt-4 h-2 rounded-control bg-edge/40" role="img" aria-hidden="true">
        <div className="h-2 rounded-control bg-accent" style={{ width: `${fillPct}%` }} />
        <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-fg" style={{ left: `${targetPct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <StatusChip status={kpi.state}>{portalCopy.kpiState[kpi.state]}</StatusChip>
        {kpi.note ? <p className="text-xs leading-relaxed text-fg-muted">{kpi.note}</p> : null}
      </div>
    </li>
  );
}

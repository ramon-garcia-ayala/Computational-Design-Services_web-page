import { StatusChip } from "./StatusChip";
import type { PortalKpi } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/**
 * A unit is authored in the plural (`"days"`, `"steps"`) because that is how
 * it reads for every value but one, and the one it does not is printed as
 * often as any other: `Estimate cycle time` renders `3 days · target 1 days`.
 * Trimming a trailing `s` at exactly 1 is the whole rule — English-only, which
 * this site is, and applied at the point of display so the data stays in one
 * form rather than carrying two spellings of every unit.
 */
function withUnit(value: number, unit: string): string {
  const singular = value === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit;
  return `${value} ${singular}`;
}

function formatValue(value: number, format: PortalKpi["format"], unit?: string): string {
  switch (format) {
    case "percent":
      return `${value}%`;
    case "currency":
      return `${unit ?? "$"}${value.toLocaleString()}`;
    case "duration":
      return unit ? withUnit(value, unit) : String(value);
    default:
      return unit ? withUnit(value, unit) : String(value);
  }
}

/**
 * A bullet-chart card rather than a gauge: with three or more KPIs on one
 * screen, the data guidance is explicit that a gauge grid reads worse than a
 * row of bars, and that the target has to be legible as text, not just a mark
 * on a scale. So the numbers are printed first — `68% · target 80%` — and the
 * bar is the secondary, visual confirmation, not the only channel.
 *
 * The bar itself shows `value` and `target` as proportions of whichever is
 * larger, with a tick at the target's position. That keeps the same geometry
 * whether the metric is "higher is better" or not — the state chip is what
 * actually says whether the number is good news, never the bar's colour alone.
 *
 * ## Why this is a card and not a full-width row
 *
 * It used to be a `border-t` row spanning the whole content column, which on
 * a 1440px screen made every bar 1338px long. At that length a bullet chart
 * stops working: the fill and its target tick are too far apart to compare in
 * one fixation, and the note — the sentence explaining *why* the number is
 * where it is — sat 1200px to the right of the chip it qualifies, reading as
 * an unrelated caption. In the card the bar is roughly 380px and the chip,
 * the note and the tick are all inside one glance.
 *
 * It also puts the section in the landing's own idiom: the document band
 * shows its four services as a card row, and the panel already draws Timeline,
 * To-do and Documents as `gap-px` grids over `bg-edge`. This was the one
 * section that did not.
 */
export function KpiBar({ kpi }: { kpi: PortalKpi }) {
  const scale = Math.max(kpi.value, kpi.target, 1e-6);
  const fillPct = Math.max(0, Math.min(100, (kpi.value / scale) * 100));
  const targetPct = Math.max(0, Math.min(100, (kpi.target / scale) * 100));

  return (
    <li className="reveal-init flex flex-col bg-carbon p-6 lg:p-8" data-reveal>
      <p className="text-sm font-semibold text-fg">{kpi.label}</p>

      <p className="mt-3 font-mono text-xs text-fg-muted tabular-nums">
        <span className="text-base text-fg">
          {formatValue(kpi.value, kpi.format, kpi.unit)}
        </span>
        <span className="mx-1.5">·</span>
        target {formatValue(kpi.target, kpi.format, kpi.unit)}
      </p>

      <div className="relative mt-4 h-2 rounded-control bg-edge/40" role="img" aria-hidden="true">
        <div className="h-2 rounded-control bg-accent" style={{ width: `${fillPct}%` }} />
        <div
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-fg"
          style={{ left: `${targetPct}%` }}
        />
      </div>

      {/* `mt-auto` on the chip row so the chips line up across the row even
          when one card's label wraps to two lines and its neighbours' do
          not — the same reason the document band reserves two lines for a
          service name. */}
      <div className="mt-auto pt-5">
        <StatusChip status={kpi.state}>{portalCopy.kpiState[kpi.state]}</StatusChip>
        {kpi.note ? (
          <p className="mt-3 text-xs leading-relaxed text-fg-muted">{kpi.note}</p>
        ) : null}
      </div>
    </li>
  );
}

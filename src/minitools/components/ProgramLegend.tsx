import { PROGRAM_COLORS, PROGRAM_LABELS } from "../lib/palette";
import type { ProgramUse } from "../schema/spec";
import { viewerCopy } from "../data/copy";

export type LegendEntry = {
  use: ProgramUse;
  /** What this band or room is called in the generated brief. */
  name: string;
  /** Right-hand figure: floor count, area, whatever the archetype measures. */
  value: string;
};

/**
 * Ties the colours in the model to the words in the brief. Without it a
 * massing study is a striped box; with it, it is a program.
 */
export function ProgramLegend({ entries }: { entries: LegendEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        {viewerCopy.legend}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {entries.map((entry, index) => (
          <li
            key={`${entry.use}-${entry.name}-${index}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: PROGRAM_COLORS[entry.use] }}
              />
              <span className="truncate text-fg">{entry.name}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-fg-muted">
              {entry.value}
              <span className="sr-only"> — {PROGRAM_LABELS[entry.use]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

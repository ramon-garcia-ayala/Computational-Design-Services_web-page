import { viewerCopy } from "../data/copy";

/**
 * A row carries its own colour and its own screen-reader label rather than a
 * key into the program palette. It used to be keyed by `ProgramUse`, which was
 * exactly right while only `massing` and `layout` had legends and both were
 * about program — and it quietly locked the component to that one vocabulary.
 * An archetype whose colours mean tile type, or utilisation, had no way in.
 */
export type LegendEntry = {
  /** What this row is called in the generated brief. */
  name: string;
  /** Right-hand figure: floor count, area, whatever the archetype measures. */
  value: string;
  /** The swatch, matching what the scene draws. */
  color: string;
  /**
   * Read out after the value for anyone who cannot see the swatch. Skip it
   * when `name` already says what the colour means — repeating it just makes
   * the row longer to listen to.
   */
  srLabel?: string;
};

/**
 * Ties the colours in the model to the words in the brief. Without it a
 * massing study is a striped box; with it, it is a program.
 */
export function ProgramLegend({
  entries,
  heading = viewerCopy.legend,
}: {
  entries: LegendEntry[];
  heading?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        {heading}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {entries.map((entry, index) => (
          <li
            key={`${entry.name}-${index}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate text-fg">{entry.name}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-fg-muted">
              {entry.value}
              {entry.srLabel ? <span className="sr-only"> — {entry.srLabel}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

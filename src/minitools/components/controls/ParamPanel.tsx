"use client";

import type { ParamDef } from "../../schema/registry";
import { viewerCopy } from "../../data/copy";
import { formatParamValue } from "../../lib/format";

export type ParamValues = Record<string, number | string>;

/**
 * The dials for a generated tool. Driven entirely by `ParamDef`s, so a fixed
 * archetype and a freeform one with model-authored sliders render through the
 * same component.
 */
export function ParamPanel({
  defs,
  values,
  onChange,
}: {
  defs: readonly ParamDef[];
  values: ParamValues;
  onChange: (key: string, value: number | string) => void;
}) {
  if (defs.length === 0) {
    return <p className="text-sm text-fg-muted">{viewerCopy.emptyParameters}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {defs.map((def) => {
        if (def.kind === "option") {
          const current = String(values[def.key] ?? def.default);
          return (
            <fieldset key={def.key}>
              <legend className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {def.label}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {def.options.map((option) => {
                  const active = option === current;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange(def.key, option)}
                      className={`rounded-full border px-3 py-1 font-mono text-xs tracking-wide uppercase transition-colors duration-200 ${
                        active
                          ? "border-accent bg-accent text-carbon"
                          : "border-line text-fg-muted hover:border-accent hover:text-accent"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        }

        const value = Number(values[def.key] ?? def.default);

        return (
          <div key={def.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor={`param-${def.key}`}
                className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
              >
                {def.label}
              </label>
              <span className="font-mono text-xs text-fg">
                {formatParamValue(def, value)}
              </span>
            </div>
            <input
              id={`param-${def.key}`}
              type="range"
              min={def.min}
              max={def.max}
              step={def.step}
              value={value}
              onChange={(event) => onChange(def.key, Number(event.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </div>
        );
      })}
    </div>
  );
}

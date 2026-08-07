/**
 * The one place a parameter's value becomes a display string.
 *
 * Both the slider panel and the composed inquiry email need to say the exact
 * same thing about a given value — a discrepancy would read as a bug the
 * moment someone compares the two. Route both through here rather than
 * formatting twice.
 */

import type { ParamDef } from "../schema/registry";

/**
 * How many decimals to show, taken from the step's own precision — a step of
 * 0.5 reads as "3.5", a step of 1 as "4". Capped, because a model-authored
 * step can carry floating-point noise and no readout is worth seventeen
 * digits.
 */
export function decimalsOf(step: number): number {
  if (step >= 1) return 0;
  const text = String(step);
  const point = text.indexOf(".");
  return point === -1 ? 0 : Math.min(4, text.length - point - 1);
}

/** "3.5m", "18", "curved" — whatever a slider or a segmented control holds. */
export function formatParamValue(def: ParamDef, value: number | string | undefined): string {
  if (def.kind === "option") return String(value ?? def.default);
  const numeric = Number(value ?? def.default);
  return `${numeric.toFixed(decimalsOf(def.step))}${def.unit ?? ""}`;
}

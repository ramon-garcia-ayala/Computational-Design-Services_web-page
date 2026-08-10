/**
 * One hand-written configuration per archetype.
 *
 * A preset earns its keep three times over, and each use wants something
 * slightly different from it:
 *
 * 1. **The few-shot example** in `specInstruction`. The JSON Schema already
 *    guarantees the shape, so the only thing an example can still teach is
 *    judgement — what a considered set of numbers looks like for this
 *    archetype, and how a title reads when it is not marketing.
 * 2. **The fallback** when generation fails. A visitor who confirmed a build
 *    and got an error learned nothing about the studio; one who got a working
 *    tool can still turn it around and see what we do. `fallbackSpec` is
 *    honest about the swap rather than passing someone else's numbers off as
 *    theirs — the numbers would give it away in seconds anyway.
 * 3. **The fast path** for a visitor who only wants to see an example of the
 *    domain, where paying for Sonnet buys nothing they asked for.
 *
 * Every preset goes through `parseSpec` at module load. That is the same gate
 * the model's output passes, so a preset that would not survive it is not a
 * valid example to be showing the model in the first place; and it snaps the
 * numbers onto the registry's step grid, so a preset cannot quietly teach
 * values the sliders are unable to reproduce.
 *
 * A preset that fails is dropped with a loud log rather than thrown. The
 * assistant then behaves exactly as it did before presets existed — no
 * example, no fallback — which is a much better failure than a chat endpoint
 * that 500s on every request because of a typo in one example.
 */

import type { MinitoolSpec, TemplateId } from "../../schema/spec";
import { parseSpec } from "../../schema/validate";
import { presetCopy } from "../copy";
import { facadePreset } from "./facade";
import { freeformPreset } from "./freeform";
import { layoutPreset } from "./layout";
import { massingPreset } from "./massing";
import { pitchPreset } from "./pitch";
import { structurePreset } from "./structure";
import { wfcPreset } from "./wfc";

const AUTHORED: Partial<Record<TemplateId, MinitoolSpec>> = {
  facade: facadePreset,
  massing: massingPreset,
  layout: layoutPreset,
  structure: structurePreset,
  wfc: wfcPreset,
  freeform: freeformPreset,
  pitch: pitchPreset,
};

export const PRESETS: Partial<Record<TemplateId, MinitoolSpec>> = (() => {
  const out: Partial<Record<TemplateId, MinitoolSpec>> = {};

  for (const [template, authored] of Object.entries(AUTHORED)) {
    const parsed = parseSpec(authored);
    if (parsed) {
      out[template as TemplateId] = parsed;
    } else {
      console.error(
        `[minitools] preset "${template}" does not survive parseSpec — dropped. ` +
          "The assistant will fall back to generating without an example.",
      );
    }
  }

  return out;
})();

export function presetFor(template: TemplateId): MinitoolSpec | null {
  return PRESETS[template] ?? null;
}

/**
 * The preset, relabelled for a visitor whose own build did not come through.
 *
 * Only the tagline changes. Rewriting the title from their brief was the first
 * idea and it is the wrong one: a brief is a paragraph, it truncates badly at
 * eighty characters, and a title that promises their project over someone
 * else's numbers is a small lie the model itself would expose on the next
 * line. Saying plainly that this is the reference example costs one sentence
 * and buys the visitor a tool they can still learn something from.
 */
export function fallbackSpec(template: TemplateId): MinitoolSpec | null {
  const preset = presetFor(template);
  if (!preset) return null;

  return {
    ...preset,
    meta: { ...preset.meta, tagline: presetCopy.fallbackTagline },
  };
}

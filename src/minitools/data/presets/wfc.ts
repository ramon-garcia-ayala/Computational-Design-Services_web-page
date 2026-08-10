import type { WfcSpec } from "../../schema/spec";

/**
 * A masterplan block rather than a facade pattern, because the request this
 * archetype gets is almost always about a *site* — and because `city` is the
 * ruleset whose result is hardest to mistake for something someone drew.
 *
 * The openness is set well above zero on purpose. A field with no gaps in it
 * looks like a solved packing problem, which is the wrong idea of what this
 * does: the interesting output is where the rules decide to leave nothing.
 */
export const wfcPreset: WfcSpec = {
  version: 1,
  template: "wfc",
  meta: {
    title: "Masterplan block aggregation",
    tagline: "A nine-by-nine site collapsed under adjacency rules that keep towers apart.",
    pitch:
      "Nothing here is drawn. The rules say a tower may only meet mid-rise or open ground, and the field is whatever satisfies them — so the seed is the control worth moving first, because every value of it is a different valid answer to the same brief.",
  },
  params: {
    rules: "city",
    grid: 9,
    seed: 7,
    height: 6,
    openness: 0.22,
  },
};

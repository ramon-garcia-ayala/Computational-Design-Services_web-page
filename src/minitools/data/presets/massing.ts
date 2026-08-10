import type { MassingSpec } from "../../schema/spec";

/**
 * The bands are weights, not floor counts, and this preset is written so that
 * reading it makes that obvious: five bands summing to thirty-two against a
 * `floors` of thirty-two. A model that copies the pattern without copying the
 * numbers still gets a mix that survives the floors slider.
 */
export const massingPreset: MassingSpec = {
  version: 1,
  template: "massing",
  meta: {
    title: "Mixed-use tower massing",
    tagline: "Thirty-two floors over a retail base, tapering into residential at the top.",
    pitch:
      "The program bands hold their proportions as the tower grows or shrinks, so the mix survives the question every client asks second: what if it were shorter? Start with the floor count, then the taper — the twist is the last thing to touch, not the first.",
  },
  params: {
    plan: "rect",
    floors: 32,
    baseWidth: 34,
    taper: 0.74,
    twistDeg: 18,
  },
  program: [
    { use: "parking", floors: 2 },
    { use: "retail", floors: 2 },
    { use: "office", floors: 12 },
    { use: "amenity", floors: 1 },
    { use: "residential", floors: 15 },
  ],
};

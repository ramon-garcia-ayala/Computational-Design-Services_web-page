import type { LayoutSpec } from "../../schema/spec";

/**
 * A clinic floor, because the areas have to hang together for the plan to be
 * worth looking at: a waiting room three times a consulting room reads right,
 * and six identical consulting rooms is what the brief would actually say.
 * Ratios rather than square metres, so widening the footprint grows every
 * room together instead of stretching one.
 */
export const layoutPreset: LayoutSpec = {
  version: 1,
  template: "layout",
  meta: {
    title: "Outpatient clinic floor",
    tagline: "Six consulting rooms and a waiting area off one central corridor.",
    pitch:
      "Every room is held as a share of the usable area, so the plan re-proportions itself the moment the footprint changes rather than leaving one room to absorb the difference. The arrangement slider reshuffles the subdivision without touching a single area.",
  },
  params: {
    footprintW: 24,
    footprintD: 14,
    corridor: 1.8,
    seed: 12,
    wallHeight: 1.2,
  },
  spaces: [
    { name: "Waiting", ratio: 3, use: "amenity" },
    { name: "Reception", ratio: 1.2, use: "office" },
    { name: "Consulting 1", ratio: 1, use: "office" },
    { name: "Consulting 2", ratio: 1, use: "office" },
    { name: "Consulting 3", ratio: 1, use: "office" },
    { name: "Consulting 4", ratio: 1, use: "office" },
    { name: "Treatment", ratio: 1.6, use: "office" },
    { name: "Staff room", ratio: 1.2, use: "amenity" },
    { name: "Stores", ratio: 0.8, use: "core" },
  ],
};

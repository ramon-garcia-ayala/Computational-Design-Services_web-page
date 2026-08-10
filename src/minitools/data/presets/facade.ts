import type { FacadeSpec } from "../../schema/spec";

/**
 * A shading system rather than a flat perforated panel, because that is the
 * request this archetype actually receives, and because a curved surface
 * exercises the two parameters a model left to itself tends to leave at their
 * defaults: the curvature and where the attractor sits.
 */
export const facadePreset: FacadeSpec = {
  version: 1,
  template: "facade",
  meta: {
    title: "West brise-soleil study",
    tagline: "Vertical fins over a curved office elevation, closing toward the afternoon sun.",
    pitch:
      "Each fin turns by how far it sits from the attractor, so the elevation reads shut where the low sun lands and open where it does not. Move the attractor across the surface first: everything else on this panel only decides what the fins are made to do about it.",
  },
  params: {
    mode: "rotate",
    curvatureDeg: 38,
    columns: 24,
    attractorX: 0.72,
    attractorY: 0.38,
  },
};

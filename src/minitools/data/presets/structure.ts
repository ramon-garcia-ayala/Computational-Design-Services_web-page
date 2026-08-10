import type { StructureSpec } from "../../schema/spec";

/**
 * A truss rather than a beam, and a span long enough that the depth matters.
 *
 * The default is chosen to sit around two thirds utilisation: comfortably
 * inside the allowable, but close enough that pushing the load or thinning
 * the depth turns the members warm within a couple of steps. A preset that
 * starts at ten percent teaches the visitor that the colours never change,
 * and they stop moving anything.
 */
export const structurePreset: StructureSpec = {
  version: 1,
  template: "structure",
  meta: {
    title: "Long-span roof truss check",
    tagline: "A 24 m warehouse bay carrying snow and services on 1.4 m of depth.",
    pitch:
      "Colour along each member is its utilisation, so the gradient you see is the bending diagram — chords work hardest at mid-span, webs at the supports. Pull the depth down first: it is the one number you actually get to choose on site, and it is the one the deflection reacts to fastest.",
  },
  params: {
    system: "truss",
    span: 24,
    load: 6,
    depth: 1.4,
    bays: 5,
  },
};

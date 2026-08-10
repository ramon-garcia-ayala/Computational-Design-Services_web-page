import type { FreeformSpec } from "../../schema/spec";

/**
 * A pavilion: three nodes, one radial repeat, one revolution.
 *
 * Written to be read by the model as much as rendered, so it demonstrates the
 * two moves that separate a scene graph worth orbiting from a pile of boxes.
 * One repeat stands in for nine columns instead of nine near-identical nodes.
 * And every slider drives more than one node — raising the columns also lifts
 * the canopy that sits on them, which is the difference between a parametric
 * model and four dials that each nudge one thing out of alignment with the
 * rest.
 *
 * The defaults are deliberately consistent with the base geometry: `height`
 * defaults to 3.2 against a column half-height of 1.6 and a canopy at 3.2, so
 * the scene as authored is exactly the scene the sliders reproduce at rest.
 * A preset whose defaults disagree with its own nodes teaches the model that
 * the two need not line up, and the tool then jumps the first time anything is
 * touched.
 */
export const freeformPreset: FreeformSpec = {
  version: 1,
  template: "freeform",
  meta: {
    title: "Timber pavilion frame",
    tagline: "A ring of columns under a shallow revolved canopy.",
    pitch:
      "The canopy is a single revolution and the columns are one node repeated around the centre, so the whole pavilion is four numbers rather than a model to rebuild. Pull the span first — the column count is what stops it reading as a drum.",
  },
  scene: [
    {
      shape: "cylinder",
      size: { x: 10, y: 0.18, z: 10 },
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: "ghost",
    },
    {
      shape: "cylinder",
      size: { x: 0.32, y: 3.2, z: 0.32 },
      position: { x: 4.2, y: 1.6, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: "solid",
      repeat: { mode: "radial", count: 9, angleDeg: 360 },
    },
    {
      shape: "lathe",
      size: { x: 10, y: 1.4, z: 10 },
      profile: [
        { x: 0, y: 1.4 },
        { x: 1.2, y: 1.3 },
        { x: 2.6, y: 1.02 },
        { x: 3.8, y: 0.62 },
        { x: 4.7, y: 0.2 },
        { x: 5, y: 0 },
      ],
      position: { x: 0, y: 3.2, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: "wire",
    },
  ],
  controls: [
    {
      key: "columns",
      label: "Columns",
      min: 5,
      max: 16,
      step: 1,
      default: 9,
      bindings: [{ node: 1, property: "repeat.count", factor: 1 }],
    },
    {
      key: "span",
      label: "Span",
      min: 3,
      max: 6,
      step: 0.1,
      default: 4.2,
      bindings: [
        { node: 1, property: "position.x", factor: 1 },
        { node: 2, property: "scale.x", factor: 0.2381 },
        { node: 2, property: "scale.z", factor: 0.2381 },
        { node: 0, property: "scale.x", factor: 0.2381 },
        { node: 0, property: "scale.z", factor: 0.2381 },
      ],
    },
    {
      key: "height",
      label: "Column height",
      min: 2.4,
      max: 4.2,
      step: 0.1,
      default: 3.2,
      bindings: [
        { node: 1, property: "scale.y", factor: 0.3125 },
        { node: 1, property: "position.y", factor: 0.5 },
        { node: 2, property: "position.y", factor: 1 },
      ],
    },
    {
      key: "rise",
      label: "Canopy rise",
      min: 0.6,
      max: 2.4,
      step: 0.05,
      default: 1,
      bindings: [{ node: 2, property: "scale.y", factor: 1 }],
    },
  ],
  params: {
    columns: 9,
    span: 4.2,
    height: 3.2,
    rise: 1,
  },
};

/**
 * The single source of truth for every adjustable parameter.
 *
 * Three things read this file and must never drift apart: the slider panel,
 * the clamping in `validate.ts`, and the ranges written into the JSON Schema
 * the model fills in (`json-schema.ts` — keep it in sync by hand, structured
 * outputs rejects numeric `minimum`/`maximum`).
 */

import type {
  FacadeParams,
  LayoutParams,
  MassingParams,
  StructureParams,
  TemplateId,
  WfcParams,
} from "./spec";

export type NumberParamDef = {
  kind: "number";
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Suffix shown next to the value, e.g. "m". */
  unit?: string;
};

export type OptionParamDef = {
  kind: "option";
  key: string;
  label: string;
  options: readonly string[];
  default: string;
};

export type ParamDef = NumberParamDef | OptionParamDef;

/**
 * Cut from ten to five, and the cut is the same one every archetype faces:
 * keep what reconfigures, drop what resizes.
 *
 * `surface` folded into `curvatureDeg`, where zero is flat — one continuous
 * control doing what a toggle plus a slider did, with no state where the
 * slider is present and inert. `rows` is derived from `columns`, because a
 * panel grid that is not roughly square reads as a mistake rather than as a
 * choice. `falloff` and the aperture range became constants in `FacadeMesh`:
 * they tune the gradient the attractor already produces, and nobody who has
 * not read the code knows what "Falloff 2.4" is going to do, which is the
 * definition of a dial that costs a row and earns nothing.
 */
const facadeParams = [
  {
    kind: "option",
    key: "mode",
    label: "Driven by",
    options: ["rotate", "scale", "depth"],
    default: "rotate",
  },
  {
    kind: "number",
    key: "curvatureDeg",
    label: "Curvature",
    min: 0,
    max: 120,
    step: 1,
    default: 38,
    unit: "°",
  },
  { kind: "number", key: "columns", label: "Columns", min: 6, max: 40, step: 1, default: 24 },
  {
    kind: "number",
    key: "attractorX",
    label: "Attractor X",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
  },
  {
    kind: "number",
    key: "attractorY",
    label: "Attractor Y",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
  },
] as const satisfies readonly ParamDef[];

/**
 * Seven down to five, dropping the two that only measured: `floorHeight` and
 * `baseDepth`. Both now live in `lib/program.ts`, so the areas in the legend
 * are still real — they just are not adjustable, which nobody asked for.
 */
const massingParams = [
  {
    kind: "option",
    key: "plan",
    label: "Plan shape",
    options: ["rect", "ellipse"],
    default: "rect",
  },
  { kind: "number", key: "floors", label: "Floors", min: 6, max: 80, step: 1, default: 28 },
  {
    kind: "number",
    key: "baseWidth",
    label: "Base width",
    min: 15,
    max: 60,
    step: 1,
    default: 32,
    unit: "m",
  },
  { kind: "number", key: "taper", label: "Taper", min: 0.3, max: 1, step: 0.01, default: 0.8 },
  { kind: "number", key: "twistDeg", label: "Twist", min: 0, max: 270, step: 1, default: 0, unit: "°" },
] as const satisfies readonly ParamDef[];

const layoutParams = [
  {
    kind: "number",
    key: "footprintW",
    label: "Footprint width",
    min: 8,
    max: 40,
    step: 0.5,
    default: 18,
    unit: "m",
  },
  {
    kind: "number",
    key: "footprintD",
    label: "Footprint depth",
    min: 8,
    max: 40,
    step: 0.5,
    default: 12,
    unit: "m",
  },
  {
    kind: "number",
    key: "corridor",
    label: "Circulation",
    min: 0,
    max: 2.4,
    step: 0.1,
    default: 1.5,
    unit: "m",
  },
  { kind: "number", key: "seed", label: "Arrangement", min: 1, max: 99, step: 1, default: 7 },
  {
    kind: "number",
    key: "wallHeight",
    label: "Wall height",
    min: 0.2,
    max: 3,
    step: 0.1,
    default: 1,
    unit: "m",
  },
] as const satisfies readonly ParamDef[];

/**
 * Load and depth are the two an engineer reaches for first — one is the
 * demand, the other is the only thing they get to choose — so they sit next
 * to each other. `bays` earns its row by turning a section into a roof: a
 * single frame reads as a diagram, four read as a building, and it is the
 * cheapest way to make the tool feel like it is about a real thing.
 */
const structureParams = [
  {
    kind: "option",
    key: "system",
    label: "System",
    options: ["beam", "truss", "arch"],
    default: "truss",
  },
  { kind: "number", key: "span", label: "Span", min: 6, max: 40, step: 0.5, default: 18, unit: "m" },
  {
    kind: "number",
    key: "load",
    label: "Load",
    min: 1,
    max: 20,
    step: 0.5,
    default: 5,
    unit: "kN/m²",
  },
  {
    kind: "number",
    key: "depth",
    label: "Depth",
    min: 0.3,
    max: 3,
    step: 0.05,
    default: 1.2,
    unit: "m",
  },
  { kind: "number", key: "bays", label: "Bays", min: 1, max: 8, step: 1, default: 4 },
] as const satisfies readonly ParamDef[];

/**
 * Five controls, and the ruleset comes first because it is the only one that
 * changes what is being generated rather than how much of it there is. The
 * two that were cut in drafting were a cell-size slider and a storey-height
 * slider: both resize, neither reconfigures, and a tool where three of five
 * dials only zoom is a tool nobody moves.
 */
const wfcParams = [
  {
    kind: "option",
    key: "rules",
    label: "Ruleset",
    options: ["city", "terrace", "lattice"],
    default: "city",
  },
  { kind: "number", key: "grid", label: "Site", min: 4, max: 14, step: 1, default: 9 },
  { kind: "number", key: "seed", label: "Seed", min: 1, max: 99, step: 1, default: 7 },
  { kind: "number", key: "height", label: "Tallest", min: 2, max: 10, step: 1, default: 6 },
  {
    kind: "number",
    key: "openness",
    label: "Openness",
    min: 0,
    max: 0.6,
    step: 0.02,
    default: 0.22,
  },
] as const satisfies readonly ParamDef[];

/**
 * Fixed-shape archetypes only. `freeform` carries its own slider definitions
 * inside the spec, and `pitch` has no parameters at all.
 */
export const PARAM_REGISTRY: Record<
  Extract<TemplateId, "facade" | "massing" | "layout" | "structure" | "wfc">,
  readonly ParamDef[]
> = {
  facade: facadeParams,
  massing: massingParams,
  layout: layoutParams,
  structure: structureParams,
  wfc: wfcParams,
};

function defaultsOf(defs: readonly ParamDef[]): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const def of defs) out[def.key] = def.default;
  return out;
}

export const FACADE_DEFAULTS = defaultsOf(facadeParams) as unknown as FacadeParams;
export const MASSING_DEFAULTS = defaultsOf(massingParams) as unknown as MassingParams;
export const LAYOUT_DEFAULTS = defaultsOf(layoutParams) as unknown as LayoutParams;
export const STRUCTURE_DEFAULTS = defaultsOf(structureParams) as unknown as StructureParams;
export const WFC_DEFAULTS = defaultsOf(wfcParams) as unknown as WfcParams;

/* -------------------------------------------------------------------------
   Hard limits on anything the model can size freely. The URL is untrusted
   input as well, so these are enforced on decode, not just on generation.
------------------------------------------------------------------------- */

export const LIMITS = {
  titleChars: 80,
  taglineChars: 140,
  pitchChars: 600,
  /** Longest single string anywhere else in a spec. */
  textChars: 400,
  programBands: 8,
  layoutSpaces: 10,
  sceneNodes: 48,
  profilePoints: 16,
  /**
   * Five is the ceiling for any tool, not just `freeform` — the panel is a
   * 340px column with no scroll and no collapse, so a long list just stretches
   * the page, and a visitor faced with ten dials moves none of them. Fixed
   * archetypes get no runtime check because their count is decided by the
   * length of the array above; this is the number to hold them to.
   */
  freeformControls: 5,
  bindingsPerControl: 8,
  repeatCount: 40,
  /**
   * Cells the aggregation solver will lay out, as a backstop above the `grid`
   * slider's own range. Propagation is worst-case quadratic in the cell count,
   * and this runs synchronously on every drag of a slider, so the ceiling is
   * about the frame budget rather than about memory.
   */
  wfcCells: 256,
  pitchSteps: 5,
  pitchStack: 8,
  pitchDeliverables: 6,
  /** Stack entries are names; deliverables are short phrases. */
  stackItemChars: 60,
  deliverableChars: 160,
} as const;

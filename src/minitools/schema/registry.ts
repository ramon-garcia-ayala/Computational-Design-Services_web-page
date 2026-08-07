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
  TemplateId,
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

const facadeParams = [
  {
    kind: "option",
    key: "surface",
    label: "Surface",
    options: ["flat", "curved"],
    default: "flat",
  },
  {
    kind: "number",
    key: "curvatureDeg",
    label: "Curvature",
    min: 0,
    max: 120,
    step: 1,
    default: 45,
    unit: "°",
  },
  { kind: "number", key: "columns", label: "Columns", min: 4, max: 40, step: 1, default: 18 },
  { kind: "number", key: "rows", label: "Rows", min: 4, max: 24, step: 1, default: 10 },
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
  { kind: "number", key: "falloff", label: "Falloff", min: 0.5, max: 5, step: 0.1, default: 2 },
  {
    kind: "number",
    key: "minOpen",
    label: "Min aperture",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.1,
  },
  {
    kind: "number",
    key: "maxOpen",
    label: "Max aperture",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.9,
  },
  {
    kind: "option",
    key: "mode",
    label: "Driven by",
    options: ["rotate", "scale", "depth"],
    default: "rotate",
  },
] as const satisfies readonly ParamDef[];

const massingParams = [
  { kind: "number", key: "floors", label: "Floors", min: 6, max: 80, step: 1, default: 28 },
  {
    kind: "number",
    key: "floorHeight",
    label: "Floor height",
    min: 2.8,
    max: 5,
    step: 0.1,
    default: 3.5,
    unit: "m",
  },
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
  {
    kind: "number",
    key: "baseDepth",
    label: "Base depth",
    min: 15,
    max: 60,
    step: 1,
    default: 24,
    unit: "m",
  },
  { kind: "number", key: "taper", label: "Taper", min: 0.3, max: 1, step: 0.01, default: 0.8 },
  { kind: "number", key: "twistDeg", label: "Twist", min: 0, max: 270, step: 1, default: 0, unit: "°" },
  {
    kind: "option",
    key: "plan",
    label: "Plan shape",
    options: ["rect", "ellipse"],
    default: "rect",
  },
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
 * Fixed-shape archetypes only. `freeform` carries its own slider definitions
 * inside the spec, and `pitch` has no parameters at all.
 */
export const PARAM_REGISTRY: Record<
  Extract<TemplateId, "facade" | "massing" | "layout">,
  readonly ParamDef[]
> = {
  facade: facadeParams,
  massing: massingParams,
  layout: layoutParams,
};

function defaultsOf(defs: readonly ParamDef[]): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const def of defs) out[def.key] = def.default;
  return out;
}

export const FACADE_DEFAULTS = defaultsOf(facadeParams) as unknown as FacadeParams;
export const MASSING_DEFAULTS = defaultsOf(massingParams) as unknown as MassingParams;
export const LAYOUT_DEFAULTS = defaultsOf(layoutParams) as unknown as LayoutParams;

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
  freeformControls: 4,
  bindingsPerControl: 8,
  repeatCount: 40,
  pitchSteps: 5,
  pitchStack: 8,
  pitchDeliverables: 6,
  /** Stack entries are names; deliverables are short phrases. */
  stackItemChars: 60,
  deliverableChars: 160,
} as const;

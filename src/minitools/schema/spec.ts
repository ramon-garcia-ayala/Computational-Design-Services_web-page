/**
 * The mini tool spec: what the assistant produces and the viewer renders.
 *
 * The model never writes code. It fills in one of five archetypes, and a
 * discriminated union maps `template` to a component — the same shape the
 * proposals use (`src/data/proposals/types.ts` + `ProposalRenderer`).
 *
 * Four archetypes are interactive 3D. The fifth, `pitch`, is the escape hatch:
 * when a request cannot honestly be demonstrated live (it needs a file upload,
 * a Revit session, a client dataset), the page becomes a short generated
 * proposal instead. The assistant therefore never has to answer "I can't".
 *
 * Every archetype carries `params`, a flat bag of live values the panel edits
 * and the URL round-trips. Anything the visitor cannot change — a program mix,
 * a room list, a scene graph — sits beside it as its own field.
 */

export const TEMPLATE_IDS = [
  "facade",
  "massing",
  "layout",
  "freeform",
  "pitch",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Archetypes the router may pick. */
export const ROUTABLE_TEMPLATE_IDS = [
  "facade",
  "massing",
  "layout",
  "freeform",
  "pitch",
] as const satisfies readonly TemplateId[];

export type SpecMeta = {
  title: string;
  /** One line under the title. */
  tagline: string;
  /** Two or three sentences on what the tool does and why it matters. */
  pitch: string;
  /** Measured server side; feeds the "we built this in N seconds" line. */
  generationMs?: number;
};

type SpecBase = {
  version: 1;
  meta: SpecMeta;
};

/* -------------------------------------------------------------------------
   1. facade — parametric panelisation of a surface
   Covers building skins, louvres, shading systems, panel sequences.
------------------------------------------------------------------------- */

export type FacadeParams = {
  surface: "flat" | "curved";
  /** Sweep of the cylindrical segment. Ignored when `surface` is flat. */
  curvatureDeg: number;
  columns: number;
  rows: number;
  /** Attractor position in normalised surface coordinates. */
  attractorX: number;
  attractorY: number;
  /** Exponent of the attractor falloff: higher concentrates the effect. */
  falloff: number;
  minOpen: number;
  maxOpen: number;
  /** What openness drives on each panel. */
  mode: "rotate" | "scale" | "depth";
};

export type FacadeSpec = SpecBase & {
  template: "facade";
  params: FacadeParams;
};

/* -------------------------------------------------------------------------
   2. massing — stacked floors with a program mix
   Covers towers, mixed-use blocks, massing studies.
------------------------------------------------------------------------- */

export const PROGRAM_USES = [
  "retail",
  "office",
  "residential",
  "amenity",
  "parking",
  "core",
] as const;

export type ProgramUse = (typeof PROGRAM_USES)[number];

/**
 * One band of the stack, bottom-up. `floors` is a weight, not an absolute:
 * the viewer redistributes the current floor count across the bands in
 * proportion, so the mix survives the floors slider.
 */
export type ProgramBand = {
  use: ProgramUse;
  floors: number;
};

export type MassingParams = {
  floors: number;
  /** Metres. Drives both the model and the reported areas. */
  floorHeight: number;
  baseWidth: number;
  baseDepth: number;
  /** Footprint scale at the top relative to the base. */
  taper: number;
  twistDeg: number;
  plan: "rect" | "ellipse";
};

export type MassingSpec = SpecBase & {
  template: "massing";
  params: MassingParams;
  program: ProgramBand[];
};

/* -------------------------------------------------------------------------
   3. layout — floor plan generator
   Covers space planning, program distribution, unit layouts.
------------------------------------------------------------------------- */

export type LayoutSpace = {
  name: string;
  /** Relative share of the usable area. Normalised at render time. */
  ratio: number;
  use: ProgramUse;
};

export type LayoutParams = {
  footprintW: number;
  footprintD: number;
  /** Width of the circulation strip in metres. Zero removes it. */
  corridor: number;
  /** Reshuffles the subdivision without changing the areas. */
  seed: number;
  wallHeight: number;
};

export type LayoutSpec = SpecBase & {
  template: "layout";
  params: LayoutParams;
  spaces: LayoutSpace[];
};

/* -------------------------------------------------------------------------
   4. freeform — declarative scene graph
   The interactive escape hatch: vessels, pavilions, furniture, schematic
   houses. The model emits nodes, never code, so there is nothing to evaluate.
------------------------------------------------------------------------- */

export type Vec3 = { x: number; y: number; z: number };

/** Structured outputs has no tuple type, so points are objects too. */
export type Point2 = { x: number; y: number };

export type NodeShape = "box" | "cylinder" | "sphere" | "lathe" | "prism";

export type NodeMaterial = "solid" | "wire" | "ghost";

export type NodeRepeat = {
  mode: "linear" | "radial";
  count: number;
  /** Step between copies, for `linear`. */
  offset?: Vec3;
  /** Total sweep, for `radial`. */
  angleDeg?: number;
};

export type SceneNode = {
  shape: NodeShape;
  size?: Vec3;
  /** Revolution profile (`lathe`) or extrusion outline (`prism`). */
  profile?: Point2[];
  position?: Vec3;
  rotationDeg?: Vec3;
  scale?: Vec3;
  material?: NodeMaterial;
  repeat?: NodeRepeat;
};

export const BINDABLE_PROPS = [
  "position.x",
  "position.y",
  "position.z",
  "rotationDeg.x",
  "rotationDeg.y",
  "rotationDeg.z",
  "scale.x",
  "scale.y",
  "scale.z",
  "repeat.count",
  "repeat.angleDeg",
] as const;

export type BindableProp = (typeof BINDABLE_PROPS)[number];

/**
 * How a slider reaches the scene. The applied value is `value * factor +
 * offset` — linear only, on purpose: no expressions means no evaluator.
 */
export type ParamBinding = {
  /** Index into `scene`. */
  node: number;
  property: BindableProp;
  factor?: number;
  offset?: number;
};

export type ExposedParam = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  bindings: ParamBinding[];
};

export type FreeformSpec = SpecBase & {
  template: "freeform";
  scene: SceneNode[];
  /** Slider definitions. May be empty: orbit alone still reads as a tool. */
  controls: ExposedParam[];
  /** Live values, keyed by control key. Seeded from the defaults. */
  params: Record<string, number>;
};

/* -------------------------------------------------------------------------
   5. pitch — the no-3D fallback
------------------------------------------------------------------------- */

export type PitchStep = {
  title: string;
  detail: string;
};

export type PitchSpec = SpecBase & {
  template: "pitch";
  /** The visitor's problem, restated so they can see it was understood. */
  problem: string;
  approach: PitchStep[];
  /** Tools and libraries, rendered as chips. */
  stack: string[];
  deliverables: string[];
  timelineHint: string;
};

/* ---------------------------------------------------------------------- */

export type MinitoolSpec =
  | FacadeSpec
  | MassingSpec
  | LayoutSpec
  | FreeformSpec
  | PitchSpec;

/** The archetypes that mount a canvas. `pitch` is the one that does not. */
export type ViewerSpec = Exclude<MinitoolSpec, PitchSpec>;

export function isViewerSpec(spec: MinitoolSpec): spec is ViewerSpec {
  return spec.template !== "pitch";
}

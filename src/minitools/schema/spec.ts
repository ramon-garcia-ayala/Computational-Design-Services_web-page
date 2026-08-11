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
  "structure",
  "wfc",
  "freeform",
  "pitch",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/**
 * Archetypes the router may pick. Deliberately a separate list: leaving an id
 * out keeps it renderable from a link while hiding it from the assistant,
 * which is how a half-finished archetype is staged.
 */
export const ROUTABLE_TEMPLATE_IDS = [
  "facade",
  "massing",
  "layout",
  "structure",
  "wfc",
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
  /**
   * Sweep of the cylindrical segment. Zero is a flat surface — this used to be
   * a separate `surface` toggle, and folding it in cost nothing: flat is just
   * the left end of the slider, and one control does what two did.
   */
  curvatureDeg: number;
  /** Panels across. The row count follows from it, so the grid stays square-ish. */
  columns: number;
  /** Attractor position in normalised surface coordinates. */
  attractorX: number;
  attractorY: number;
  /** What openness drives on each panel. */
  mode: "rotate" | "scale" | "depth";

  /* Carried from links written before the panel was cut to five, and only
     from those: no control writes them, and the JSON Schema comes from the
     registry so the model cannot either. See the legacy block in
     `validate.ts` for why they are read at all. */
  rows?: number;
  falloff?: number;
  minOpen?: number;
  maxOpen?: number;
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

/**
 * `floorHeight` and `baseDepth` used to be dials too. Both were measurements
 * rather than moves: one scaled the tower vertically and the other made the
 * plate less square, and neither changed what the study was about. They live
 * in `lib/program.ts` now as `FLOOR_HEIGHT` and a ratio off the width, which
 * keeps the reported areas honest without spending two of five rows on them.
 */
export type MassingParams = {
  floors: number;
  /** Metres. The plate depth follows from it. */
  baseWidth: number;
  /** Footprint scale at the top relative to the base. */
  taper: number;
  twistDeg: number;
  plan: "rect" | "ellipse";

  /* Legacy only, same as on `FacadeParams`. */
  floorHeight?: number;
  baseDepth?: number;
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
   4. structure — a span sized against a load
   Covers beams, trusses and arches: the archetype where the answer is a
   number and the geometry is there to make the number legible.
------------------------------------------------------------------------- */

export const STRUCTURE_SYSTEMS = ["beam", "truss", "arch"] as const;

export type StructureSystem = (typeof STRUCTURE_SYSTEMS)[number];

export type StructureParams = {
  system: StructureSystem;
  /** Clear span in metres. */
  span: number;
  /** Uniformly distributed load, kN/m². */
  load: number;
  /** Structural depth in metres: beam depth, or chord separation for a truss. */
  depth: number;
  /** Frames drawn across, so the span reads as a roof rather than a section. */
  bays: number;
};

export type StructureSpec = SpecBase & {
  template: "structure";
  params: StructureParams;
};

/* -------------------------------------------------------------------------
   5. wfc — rule-based aggregation
   Covers wave function collapse, modular and volumetric aggregation, tile
   sets, generated urban blocks. The archetype where the ruleset is the design
   and the geometry is only what falls out of it.
------------------------------------------------------------------------- */

/**
 * Which adjacency rules the solver runs. Not a cosmetic choice — each set
 * produces a different kind of settlement, which is the point of the
 * archetype, so it is the first control rather than a hidden constant.
 */
export const WFC_RULESETS = ["city", "terrace", "lattice"] as const;

export type WfcRuleset = (typeof WFC_RULESETS)[number];

export type WfcParams = {
  rules: WfcRuleset;
  /** Cells per side of the square site. */
  grid: number;
  /** Reseeds the collapse without changing any rule. */
  seed: number;
  /** Storeys the tallest tile reaches; every other tile is a fraction of it. */
  height: number;
  /** Extra weight on the empty tile, so the grid can breathe. */
  openness: number;
};

export type WfcSpec = SpecBase & {
  template: "wfc";
  params: WfcParams;
};

/* -------------------------------------------------------------------------
   6. freeform — declarative scene graph
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
   7. pitch — the no-3D fallback
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
  | StructureSpec
  | WfcSpec
  | FreeformSpec
  | PitchSpec;

/** The archetypes that mount a canvas. `pitch` is the one that does not. */
export type ViewerSpec = Exclude<MinitoolSpec, PitchSpec>;

export function isViewerSpec(spec: MinitoolSpec): spec is ViewerSpec {
  return spec.template !== "pitch";
}

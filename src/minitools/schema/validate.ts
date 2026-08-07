/**
 * Turns unknown input into a spec the viewer can render, or `null`.
 *
 * Two callers, both untrusted: the model's structured output (well shaped but
 * free to invent out-of-range numbers) and the URL fragment (hand-editable by
 * anyone). So this never trusts and never throws — it clamps, truncates and
 * falls back, and only gives up when there is no usable `template`.
 *
 * Deliberately hand written. Adding a validation library for one file this
 * size would be the project's first runtime dependency for something the
 * ranges in `registry.ts` already describe.
 */

import {
  BINDABLE_PROPS,
  PROGRAM_USES,
  TEMPLATE_IDS,
  type BindableProp,
  type ExposedParam,
  type FacadeParams,
  type FreeformSpec,
  type LayoutParams,
  type LayoutSpace,
  type MassingParams,
  type MinitoolSpec,
  type NodeMaterial,
  type NodeShape,
  type ParamBinding,
  type Point2,
  type ProgramBand,
  type ProgramUse,
  type SceneNode,
  type SpecMeta,
  type TemplateId,
  type Vec3,
} from "./spec";
import {
  FACADE_DEFAULTS,
  LAYOUT_DEFAULTS,
  LIMITS,
  MASSING_DEFAULTS,
  PARAM_REGISTRY,
  type NumberParamDef,
  type ParamDef,
} from "./registry";

/* ------------------------------------------------------------------ atoms */

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Drops the entries the parsers rejected, and narrows the array with them. */
function present<T>(value: T | null): value is T {
  return value !== null;
}

function text(value: unknown, max: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Snaps to the definition's grid so the slider thumb always lands on a stop. */
function snap(value: number, def: NumberParamDef): number {
  const clamped = clamp(value, def.min, def.max);
  if (def.step <= 0) return clamped;
  const stepped = def.min + Math.round((clamped - def.min) / def.step) * def.step;
  return Number(clamp(stepped, def.min, def.max).toFixed(4));
}

function numberIn(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function list(value: unknown, max: number): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

/* ----------------------------------------------------------- param bundles */

/** Applies a registry's definitions to a raw bag, filling every key. */
function params(defs: readonly ParamDef[], raw: unknown): Record<string, unknown> {
  const source = record(raw) ?? {};
  const out: Record<string, unknown> = {};

  for (const def of defs) {
    const value = source[def.key];
    out[def.key] =
      def.kind === "number"
        ? typeof value === "number" && Number.isFinite(value)
          ? snap(value, def)
          : def.default
        : oneOf(value, def.options, def.default);
  }

  return out;
}

function meta(raw: unknown): SpecMeta {
  const source = record(raw) ?? {};
  const generationMs = source.generationMs;

  return {
    title: text(source.title, LIMITS.titleChars, "Your parametric tool"),
    tagline: text(source.tagline, LIMITS.taglineChars, "Built from your brief."),
    pitch: text(source.pitch, LIMITS.pitchChars, ""),
    ...(typeof generationMs === "number" && Number.isFinite(generationMs)
      ? { generationMs: clamp(Math.round(generationMs), 0, 600_000) }
      : {}),
  };
}

/* -------------------------------------------------------------- archetypes */

function programBands(raw: unknown): ProgramBand[] {
  const bands = list(raw, LIMITS.programBands)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;
      return {
        use: oneOf<ProgramUse>(source.use, PROGRAM_USES, "office"),
        floors: Math.round(numberIn(source.floors, 1, 80, 1)),
      };
    })
    .filter(present);

  /* A massing with no program is still a valid model, just an unlabelled one.
     One office band keeps the legend and the colouring meaningful. */
  return bands.length > 0 ? bands : [{ use: "office", floors: 1 }];
}

function layoutSpaces(raw: unknown): LayoutSpace[] {
  const spaces = list(raw, LIMITS.layoutSpaces)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;
      return {
        name: text(source.name, 40, "Space"),
        ratio: numberIn(source.ratio, 0.01, 100, 1),
        use: oneOf<ProgramUse>(source.use, PROGRAM_USES, "office"),
      };
    })
    .filter(present);

  return spaces.length > 0
    ? spaces
    : [
        { name: "Open area", ratio: 2, use: "office" },
        { name: "Support", ratio: 1, use: "amenity" },
      ];
}

/* ------------------------------------------------------------- freeform */

const SHAPES: readonly NodeShape[] = ["box", "cylinder", "sphere", "lathe", "prism"];
const MATERIALS: readonly NodeMaterial[] = ["solid", "wire", "ghost"];

/**
 * How far a model-authored slider may reach.
 *
 * Wide enough for the things these sliders actually drive — a 360° sweep, a
 * repeat count, a position in scene units — and still bounded, because the
 * value lands in a transform. Anything tighter silently rewrites the design:
 * a full revolution clamped to a quarter turn looks like a bug in the model,
 * not a guardrail.
 */
const CONTROL_BOUND = 1000;

/** Scene units are bounded so a generated node can never fill the viewport. */
function vec3(raw: unknown, fallback: number, min = -20, max = 20): Vec3 {
  const source = record(raw);
  if (!source) return { x: fallback, y: fallback, z: fallback };
  return {
    x: numberIn(source.x, min, max, fallback),
    y: numberIn(source.y, min, max, fallback),
    z: numberIn(source.z, min, max, fallback),
  };
}

function profile(raw: unknown): Point2[] {
  return list(raw, LIMITS.profilePoints)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;
      return {
        x: numberIn(source.x, -20, 20, 0),
        y: numberIn(source.y, -20, 20, 0),
      };
    })
    .filter(present);
}

function sceneNodes(raw: unknown): SceneNode[] {
  return list(raw, LIMITS.sceneNodes)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;

      const node: SceneNode = {
        shape: oneOf<NodeShape>(source.shape, SHAPES, "box"),
        size: vec3(source.size, 1, 0.01, 20),
        position: vec3(source.position, 0),
        rotationDeg: vec3(source.rotationDeg, 0, -360, 360),
        scale: vec3(source.scale, 1, 0.01, 20),
        material: oneOf<NodeMaterial>(source.material, MATERIALS, "solid"),
      };

      const points = profile(source.profile);
      /* Two points cannot describe a revolution or an extrusion; dropping the
         profile makes the interpreter fall back to a primitive instead of
         building a degenerate geometry. */
      if (points.length >= 3) node.profile = points;

      const repeat = record(source.repeat);
      if (repeat) {
        node.repeat = {
          mode: oneOf(repeat.mode, ["linear", "radial"] as const, "linear"),
          count: Math.round(numberIn(repeat.count, 1, LIMITS.repeatCount, 1)),
          offset: vec3(repeat.offset, 0),
          angleDeg: numberIn(repeat.angleDeg, 0, 360, 360),
        };
      }

      return node;
    })
    .filter(present);
}

function bindings(raw: unknown, nodeCount: number): ParamBinding[] {
  return list(raw, LIMITS.bindingsPerControl)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;

      /* A binding pointing past the end of the scene is dropped, not clamped.
         Clamping would hand the slider to whichever node happens to sit at the
         end — a control labelled "Roof pitch" quietly rotating something else
         is worse than a control that does nothing, and worse than no control
         at all, which is what `controls` falls back to when every binding of a
         slider is dropped. */
      const index = source.node;
      if (typeof index !== "number" || !Number.isFinite(index)) return null;

      const node = Math.round(index);
      if (node < 0 || node >= nodeCount) return null;

      return {
        node,
        property: oneOf<BindableProp>(source.property, BINDABLE_PROPS, "position.y"),
        factor: numberIn(source.factor, -CONTROL_BOUND, CONTROL_BOUND, 1),
        offset: numberIn(source.offset, -CONTROL_BOUND, CONTROL_BOUND, 0),
      };
    })
    .filter(present);
}

function controls(raw: unknown, nodeCount: number): ExposedParam[] {
  const seen = new Set<string>();

  return list(raw, LIMITS.freeformControls)
    .map((entry, index) => {
      const source = record(entry);
      if (!source) return null;

      const key = text(source.key, 24, `param${index + 1}`).replace(/[^\w-]/g, "");
      if (!key || seen.has(key)) return null;

      const min = numberIn(source.min, -CONTROL_BOUND, CONTROL_BOUND, 0);
      const max = numberIn(source.max, -CONTROL_BOUND, CONTROL_BOUND, min + 1);
      if (max <= min) return null;

      const bound = bindings(source.bindings, nodeCount);
      if (bound.length === 0) return null;

      seen.add(key);

      /* Rounded to the same four decimals `snap` works in. The clamp above can
         knock a clean step off by one ULP — half of `0.3 - 0.1` is
         `0.09999999999999999` — and the panel derives its display precision
         from the step's own digits, so the readout would grow to seventeen
         decimals over an invisible difference. */
      const step = Math.max(
        0.0001,
        Number(
          numberIn(source.step, 0.001, (max - min) / 2, (max - min) / 100).toFixed(4),
        ),
      );

      return {
        key,
        label: text(source.label, 32, key),
        min,
        max,
        step,
        default: clamp(numberIn(source.default, min, max, (min + max) / 2), min, max),
        bindings: bound,
      };
    })
    .filter(present);
}

function freeformValues(
  raw: unknown,
  defs: ExposedParam[],
): Record<string, number> {
  const source = record(raw) ?? {};
  const out: Record<string, number> = {};

  for (const def of defs) {
    out[def.key] = clamp(
      numberIn(source[def.key], def.min, def.max, def.default),
      def.min,
      def.max,
    );
  }

  return out;
}

/* ------------------------------------------------------------------ pitch */

function pitchSteps(raw: unknown) {
  const steps = list(raw, LIMITS.pitchSteps)
    .map((entry) => {
      const source = record(entry);
      if (!source) return null;
      const title = text(source.title, 80);
      if (!title) return null;
      return { title, detail: text(source.detail, LIMITS.textChars) };
    })
    .filter(present);

  return steps;
}

function strings(raw: unknown, max: number, chars: number): string[] {
  return list(raw, max)
    .map((entry) => text(entry, chars))
    .filter((entry) => entry.length > 0);
}

/* --------------------------------------------------------------- entrypoint */

/**
 * The one way a spec enters the app. Returns `null` only when the input is not
 * a spec at all — every recoverable problem is clamped rather than rejected,
 * because a visitor who nudged a number in the URL should still see their tool.
 */
export function parseSpec(input: unknown): MinitoolSpec | null {
  const source = record(input);
  if (!source) return null;

  const template = source.template;
  if (
    typeof template !== "string" ||
    !(TEMPLATE_IDS as readonly string[]).includes(template)
  ) {
    return null;
  }

  const base = { version: 1 as const, meta: meta(source.meta) };

  switch (template as TemplateId) {
    case "facade":
      return {
        ...base,
        template: "facade",
        params: {
          ...FACADE_DEFAULTS,
          ...params(PARAM_REGISTRY.facade, source.params),
        } as FacadeParams,
      };

    case "massing":
      return {
        ...base,
        template: "massing",
        params: {
          ...MASSING_DEFAULTS,
          ...params(PARAM_REGISTRY.massing, source.params),
        } as MassingParams,
        program: programBands(source.program),
      };

    case "layout":
      return {
        ...base,
        template: "layout",
        params: {
          ...LAYOUT_DEFAULTS,
          ...params(PARAM_REGISTRY.layout, source.params),
        } as LayoutParams,
        spaces: layoutSpaces(source.spaces),
      };

    case "freeform": {
      const scene = sceneNodes(source.scene);
      if (scene.length === 0) return null;

      const defs = controls(source.controls, scene.length);
      const spec: FreeformSpec = {
        ...base,
        template: "freeform",
        scene,
        controls: defs,
        params: freeformValues(source.params, defs),
      };
      return spec;
    }

    case "pitch": {
      const approach = pitchSteps(source.approach);
      /* Without steps there is no proposal to show, only a heading — better to
         fall through to the invalid state than to render an empty page. */
      if (approach.length === 0) return null;

      return {
        ...base,
        template: "pitch",
        problem: text(source.problem, LIMITS.pitchChars),
        approach,
        stack: strings(source.stack, LIMITS.pitchStack, LIMITS.stackItemChars),
        deliverables: strings(
          source.deliverables,
          LIMITS.pitchDeliverables,
          LIMITS.deliverableChars,
        ),
        timelineHint: text(source.timelineHint, 120),
      };
    }
  }
}

/** Slider definitions for a spec, whether they are fixed or model-supplied. */
export function paramDefsFor(spec: MinitoolSpec): readonly ParamDef[] {
  switch (spec.template) {
    case "facade":
    case "massing":
    case "layout":
      return PARAM_REGISTRY[spec.template];
    case "freeform":
      return spec.controls.map((control) => ({
        kind: "number" as const,
        key: control.key,
        label: control.label,
        min: control.min,
        max: control.max,
        step: control.step,
        default: control.default,
      }));
    case "pitch":
      return [];
  }
}

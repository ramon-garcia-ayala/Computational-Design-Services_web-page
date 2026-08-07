/**
 * The JSON Schemas the spec model fills in.
 *
 * One schema per archetype rather than a single discriminated union: the
 * router has already chosen the template, so handing the model only the shape
 * it needs is both a tighter target and a smaller prompt.
 *
 * The parameter properties are generated from `registry.ts`, which is what
 * keeps the ranges the model is told about identical to the ones the sliders
 * offer and `validate.ts` clamps to. Structured outputs rejects numeric
 * `minimum`/`maximum`, so the bounds travel in the descriptions and are
 * enforced after the fact — the model is being guided here, not constrained.
 */

import {
  LIMITS,
  PARAM_REGISTRY,
  type NumberParamDef,
  type OptionParamDef,
  type ParamDef,
} from "./registry";
import { PROGRAM_USES, type TemplateId } from "./spec";

type JsonSchema = Record<string, unknown>;

function numberProperty(def: NumberParamDef): JsonSchema {
  const unit = def.unit ? ` (${def.unit})` : "";
  return {
    type: "number",
    description: `${def.label}${unit}. Between ${def.min} and ${def.max}.`,
  };
}

function optionProperty(def: OptionParamDef): JsonSchema {
  return { type: "string", enum: [...def.options], description: def.label };
}

function paramsSchema(defs: readonly ParamDef[]): JsonSchema {
  const properties: Record<string, JsonSchema> = {};

  for (const def of defs) {
    properties[def.key] =
      def.kind === "number" ? numberProperty(def) : optionProperty(def);
  }

  return {
    type: "object",
    properties,
    required: defs.map((def) => def.key),
    additionalProperties: false,
  };
}

const META_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: `What the tool is, four to eight words. Up to ${LIMITS.titleChars} characters.`,
    },
    tagline: {
      type: "string",
      description: "One line naming the specific thing this configuration represents.",
    },
    pitch: {
      type: "string",
      description:
        "Two or three sentences on what the tool computes and which parameter to move first.",
    },
  },
  required: ["title", "tagline", "pitch"],
  additionalProperties: false,
};

function specSchema(template: TemplateId, extra: Record<string, JsonSchema>): JsonSchema {
  return {
    type: "object",
    properties: {
      template: { type: "string", enum: [template] },
      meta: META_SCHEMA,
      ...extra,
    },
    required: ["template", "meta", ...Object.keys(extra)],
    additionalProperties: false,
  };
}

const FACADE_SCHEMA = specSchema("facade", {
  params: paramsSchema(PARAM_REGISTRY.facade),
});

const MASSING_SCHEMA = specSchema("massing", {
  params: paramsSchema(PARAM_REGISTRY.massing),
  program: {
    type: "array",
    description: `The stack from the ground up, up to ${LIMITS.programBands} bands.`,
    items: {
      type: "object",
      properties: {
        use: { type: "string", enum: [...PROGRAM_USES] },
        floors: {
          type: "integer",
          description:
            "Relative weight of this band, not an absolute count. Two bands of 3 and 1 mean three quarters and one quarter of the building.",
        },
      },
      required: ["use", "floors"],
      additionalProperties: false,
    },
  },
});

const LAYOUT_SCHEMA = specSchema("layout", {
  params: paramsSchema(PARAM_REGISTRY.layout),
  spaces: {
    type: "array",
    description: `The rooms on the floor, up to ${LIMITS.layoutSpaces}.`,
    items: {
      type: "object",
      properties: {
        name: { type: "string", description: "What the visitor would call this room." },
        ratio: {
          type: "number",
          description: "Relative share of the usable area. A room at 3 is three times one at 1.",
        },
        use: { type: "string", enum: [...PROGRAM_USES] },
      },
      required: ["name", "ratio", "use"],
      additionalProperties: false,
    },
  },
});

const PITCH_SCHEMA = specSchema("pitch", {
  problem: {
    type: "string",
    description: "The visitor's problem, restated so they can see it was understood.",
  },
  approach: {
    type: "array",
    description: `Three to five steps, in the order the work would happen. Maximum ${LIMITS.pitchSteps}.`,
    items: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short imperative name for the step." },
        detail: { type: "string", description: "One or two sentences on what it involves." },
      },
      required: ["title", "detail"],
      additionalProperties: false,
    },
  },
  stack: {
    type: "array",
    description: `Real tools and libraries, up to ${LIMITS.pitchStack}.`,
    items: { type: "string" },
  },
  deliverables: {
    type: "array",
    description: `What would be handed over, up to ${LIMITS.pitchDeliverables}. Keep each one a short phrase, under a dozen words.`,
    items: { type: "string" },
  },
  timelineHint: {
    type: "string",
    description: "A range, such as \"two to three weeks to a working prototype\".",
  },
});

/* Structured outputs wants every property listed in `required`, so the fields
   a node may legitimately omit are declared nullable instead of optional. */
function nullable(schema: JsonSchema): JsonSchema {
  return { anyOf: [schema, { type: "null" }] };
}

const VEC3_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    z: { type: "number" },
  },
  required: ["x", "y", "z"],
  additionalProperties: false,
};

const PROFILE_SCHEMA: JsonSchema = {
  type: "array",
  description: `Outline points, up to ${LIMITS.profilePoints}. For \`lathe\` these are radius (x) against height (y), revolved around the Y axis. For \`prism\` they are the plan outline, extruded along Z. Null for the other shapes.`,
  items: {
    type: "object",
    properties: { x: { type: "number" }, y: { type: "number" } },
    required: ["x", "y"],
    additionalProperties: false,
  },
};

const REPEAT_SCHEMA: JsonSchema = {
  type: "object",
  description: "Copies of this node. Null for a single one.",
  properties: {
    mode: {
      type: "string",
      enum: ["linear", "radial"],
      description: "`linear` steps along the offset; `radial` sweeps around the origin.",
    },
    count: {
      type: "integer",
      description: `How many copies in total, up to ${LIMITS.repeatCount}.`,
    },
    offset: nullable(VEC3_SCHEMA),
    angleDeg: nullable({
      type: "number",
      description: "Total sweep for `radial`. 360 for a full turn.",
    }),
  },
  required: ["mode", "count", "offset", "angleDeg"],
  additionalProperties: false,
};

const SCENE_NODE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    shape: {
      type: "string",
      enum: ["box", "cylinder", "sphere", "lathe", "prism"],
      description:
        "`cylinder` uses size.x as diameter and size.y as height; `sphere` uses size.x as diameter.",
    },
    size: VEC3_SCHEMA,
    position: VEC3_SCHEMA,
    rotationDeg: nullable(VEC3_SCHEMA),
    scale: nullable(VEC3_SCHEMA),
    material: {
      type: "string",
      enum: ["solid", "wire", "ghost"],
      description: "`wire` reads as structure, `ghost` as glazing or volume.",
    },
    profile: nullable(PROFILE_SCHEMA),
    repeat: nullable(REPEAT_SCHEMA),
  },
  required: [
    "shape",
    "size",
    "position",
    "rotationDeg",
    "scale",
    "material",
    "profile",
    "repeat",
  ],
  additionalProperties: false,
};

const CONTROL_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    key: { type: "string", description: "Short identifier, letters and digits." },
    label: { type: "string", description: "What the slider is called on screen." },
    min: { type: "number" },
    max: { type: "number", description: "Must be greater than min." },
    step: { type: "number" },
    default: { type: "number", description: "Between min and max." },
    bindings: {
      type: "array",
      description: `What the slider drives, up to ${LIMITS.bindingsPerControl} targets.`,
      items: {
        type: "object",
        properties: {
          node: {
            type: "integer",
            description: "Index into `scene`, counting from zero.",
          },
          property: {
            type: "string",
            enum: [
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
            ],
          },
          factor: {
            type: "number",
            description: "The property becomes value × factor + offset. Use 1 for a direct set.",
          },
          offset: { type: "number" },
        },
        required: ["node", "property", "factor", "offset"],
        additionalProperties: false,
      },
    },
  },
  required: ["key", "label", "min", "max", "step", "default", "bindings"],
  additionalProperties: false,
};

const FREEFORM_SCHEMA = specSchema("freeform", {
  scene: {
    type: "array",
    description: `The model, built from primitives. Up to ${LIMITS.sceneNodes} nodes, positioned around the origin in consistent units — they are scaled to fit the view afterwards.`,
    items: SCENE_NODE_SCHEMA,
  },
  controls: {
    type: "array",
    description: `Up to ${LIMITS.freeformControls} sliders. Give the visitor the moves that make the design feel parametric rather than every number in it. An empty list is allowed.`,
    items: CONTROL_SCHEMA,
  },
});

const SCHEMAS: Partial<Record<TemplateId, JsonSchema>> = {
  facade: FACADE_SCHEMA,
  massing: MASSING_SCHEMA,
  layout: LAYOUT_SCHEMA,
  freeform: FREEFORM_SCHEMA,
  pitch: PITCH_SCHEMA,
};

export function specSchemaFor(template: TemplateId): JsonSchema | null {
  return SCHEMAS[template] ?? null;
}

# Wiring an archetype

The ten edit points, in dependency order. `xxx` stands for the archetype id
throughout; keep it short, lowercase and a noun (`facade`, `massing`, `wfc`).

## Contents

1. [`schema/spec.ts` — the types](#1-schemaspects--the-types)
2. [`schema/registry.ts` — the controls](#2-schemaregistryts--the-controls)
3. [`lib/xxx.ts` — the rule](#3-libxxxts--the-rule)
4. [`schema/validate.ts` — parsing and clamping](#4-schemavalidatets--parsing-and-clamping)
5. [`schema/json-schema.ts` — what the model fills in](#5-schemajson-schemats--what-the-model-fills-in)
6. [`components/viewer/templates/` — the component](#6-componentsviewertemplates--the-component)
7. [`data/copy.ts` — the words](#7-datacopyts--the-words)
8. [`data/presets/` — the example](#8-datapresets--the-example)
9. [`server/prompts.ts` — the router entry](#9-serverpromptsts--the-router-entry)
10. [Optional edges](#10-optional-edges)

---

## 1. `schema/spec.ts` — the types

Three edits, and a fourth only if the archetype does not mount a canvas.

```ts
export const TEMPLATE_IDS = ["facade", "massing", "layout", "freeform", "pitch", "xxx"] as const;

/** Archetypes the router may pick. */
export const ROUTABLE_TEMPLATE_IDS = [
  "facade", "massing", "layout", "freeform", "pitch", "xxx",
] as const satisfies readonly TemplateId[];
```

These are two lists on purpose. `ROUTABLE_TEMPLATE_IDS` is the router's enum;
leaving an id out of it keeps the archetype renderable from a link while
hiding it from the assistant — which is how you stage one that is not ready.

Then the params bag and the spec, following the section comment style already
in the file:

```ts
/* -------------------------------------------------------------------------
   6. xxx — one line on what it is
   Covers <the requests this archetype answers>.
------------------------------------------------------------------------- */

export type XxxParams = {
  /** Metres. Comment anything whose unit is not obvious from the name. */
  span: number;
  mode: "beam" | "truss";
};

export type XxxSpec = SpecBase & {
  template: "xxx";
  params: XxxParams;
  /* Anything the visitor cannot change goes beside `params`, not in it —
     `massing.program` and `layout.spaces` are the precedent. */
};

export type MinitoolSpec = FacadeSpec | MassingSpec | LayoutSpec | FreeformSpec | PitchSpec | XxxSpec;
```

`ViewerSpec` is `Exclude<MinitoolSpec, PitchSpec>`, so a new archetype is
included automatically. If yours does **not** mount a canvas, widen that
`Exclude` and `isViewerSpec` too, and branch in `ToolViewerPage` the way
`pitch` does.

## 2. `schema/registry.ts` — the controls

This file is the single source of truth for ranges: the sliders, the clamping
in `validate.ts` and the bounds written into the JSON Schema all come from
here. Widen a range here, not in three places.

```ts
const xxxParams = [
  { kind: "option", key: "mode", label: "Type", options: ["beam", "truss"], default: "beam" },
  { kind: "number", key: "span", label: "Span", min: 6, max: 40, step: 0.5, default: 18, unit: "m" },
] as const satisfies readonly ParamDef[];
```

Five entries at most. Then two edits people miss, both silent:

```ts
export const PARAM_REGISTRY: Record<
  //                                                          ↓ widen this
  Extract<TemplateId, "facade" | "massing" | "layout" | "xxx">,
  readonly ParamDef[]
> = { facade: facadeParams, massing: massingParams, layout: layoutParams, xxx: xxxParams };

export const XXX_DEFAULTS = defaultsOf(xxxParams) as unknown as XxxParams;
```

That double cast is load-bearing and unchecked: nothing verifies the registry
keys match `XxxParams`. Read them side by side once before moving on, because
a typo here produces a slider that edits a key nothing renders.

Add any hard limits your archetype needs to `LIMITS` in the same file — the
count of anything the model can size freely. They are enforced on decode, not
just on generation, because the URL is untrusted input.

## 3. `lib/xxx.ts` — the rule

Whatever your archetype computes goes here: a solver, a subdivision, a packing,
an analysis. Plain TypeScript, no React, no three.js imports if you can avoid
them. Keeping it out of the component means you can reason about it on its own,
and it is where the "the model writes data, never code" rule is actually kept.

Two things already exist and are worth reusing rather than rewriting:

- **`rng(seed)` in `lib/subdivide.ts`** — a small deterministic PRNG. Anything
  with a seed slider should use it, so the same link always renders the same
  thing. `Math.random()` in a render path is a bug: it makes the tool a
  different tool on every frame.
- **`lib/palette.ts`** — the colours the rest of the module draws with.

Determinism is not a nicety here. The whole product claim is that the URL
carries the tool; a scene that differs between two loads of the same link is a
broken link that looks like it works.

## 4. `schema/validate.ts` — parsing and clamping

A `case` in `parseSpec`. The switch is exhaustive over `TemplateId`, so the
compiler will point at it.

```ts
case "xxx":
  return {
    version: 1,
    template: "xxx",
    meta: meta(source.meta),
    params: { ...XXX_DEFAULTS, ...params(PARAM_REGISTRY.xxx, source.params) },
  };
```

`params()` iterates the registry defs, never the input's keys, so nothing extra
survives from a hand-edited URL and nothing is missing. The spread of
`XXX_DEFAULTS` is technically redundant and kept as a safety net for the day
registry and type drift apart.

Return `null` only when there is genuinely nothing to render — `freeform` does
it for an empty scene, `pitch` for an empty plan. If your archetype can always
produce something from defaults, it should never return `null`; clamping a
nonsense number is a better outcome than the invalid-link screen.

Then the `case` in `paramDefsFor`:

```ts
case "xxx":
  return PARAM_REGISTRY.xxx;
```

## 5. `schema/json-schema.ts` — what the model fills in

```ts
const XXX_SCHEMA = specSchema("xxx", {
  params: paramsSchema(PARAM_REGISTRY.xxx),
});

const SCHEMAS: Partial<Record<TemplateId, JsonSchema>> = { /* …, */ xxx: XXX_SCHEMA };
```

Two things about this file that will bite otherwise:

**Numeric bounds do not exist here.** Structured outputs rejects `minimum` and
`maximum`, so `numberProperty()` writes the range into the *description*
instead — "Span (m). Between 6 and 40." The model treats it as guidance and
`validate.ts` does the enforcing. Never add `minimum`/`maximum` to make the
schema look tidier; the API will refuse the whole request.

**Optional fields have to be declared, not omitted.** Structured outputs wants
everything in `required`, so an optional field is `nullable(schema)` — an
`anyOf` with `{ type: "null" }` — and stays in the required list.

**The first build of a new archetype can take minutes.** The API compiles a new
JSON Schema once and then caches it for about a day; the pitch schema has been
observed at 110 seconds on first use. This is expected, it is already handled
in three places (the failure restores the confirmation card, `closingLine`
drops the seconds figure above 30 s, and the preset now stands in), and it is
not a bug to go looking for. Just do not be surprised by it during
verification.

## 6. `components/viewer/templates/` — the component

Write `XxxMesh.tsx`, then add the case:

```tsx
export function TemplateScene({ spec }: { spec: ViewerSpec }) {
  switch (spec.template) {
    // …
    case "xxx":
      return <XxxMesh spec={spec} />;
  }
}
```

Everything about writing the component itself is in `references/scene.md`.

## 7. `data/copy.ts` — the words

```ts
export const templateLabels: Record<TemplateId, string> = {
  // …
  xxx: "a structural span study",   // reads after "I have enough to build …"
};

export function progressMessages(template: TemplateId): string[] {
  switch (template) {
    // …
    case "xxx":
      return ["Reading your brief…", "Sizing the members…", "Running the load case…", ...closing];
  }
}
```

The progress lines are read while Sonnet works, and the last one holds until
the tool lands, so it has to survive being stared at. Name the real stages of
your archetype rather than writing four synonyms for "working".

## 8. `data/presets/` — the example

One file, one export, registered in `presets/index.ts`. What makes a good
preset is in `references/router.md`; two mechanical constraints belong here:

- **Import only types.** `import type { XxxSpec } from "../../schema/spec";`
  and nothing else. `scripts/minitool-link.mjs` loads preset files directly
  through Node's type stripping, and a runtime import breaks that — Node's ESM
  resolver will not follow this codebase's extensionless paths.
- **The defaults have to agree with the geometry.** If the preset's `params`
  say `span: 18` then the scene it describes must be the scene an 18 m span
  produces. A preset whose defaults disagree with its own data teaches the
  model that they need not line up, and the tool then jumps the first time
  anything is touched.

Presets go through `parseSpec` at module load and a failure is logged and
dropped rather than thrown, so watch the dev server console the first time.

## 9. `server/prompts.ts` — the router entry

One bullet in the archetype list of `ROUTER_SYSTEM`, in the two-part form the
rest of the list uses. See `references/router.md` — this is prose, and it is
the difference between an archetype that gets used and one that does not.

## 10. Optional edges

Only if they apply:

- `ToolViewerPage.tsx` — `legendFor` if the archetype has a program or legend
  worth listing beside the canvas; `withParam` if its live values do not live
  in `spec.params`.
- `lib/palette.ts` — new colours.
- `lib/inquiry.ts` — only if the prewritten email should say something the
  generic parameter list does not already cover. It reads `paramDefsFor`, so
  most archetypes need nothing here.
- `widgetCopy.suggestions` in `data/copy.ts` — the three starter prompts under
  the empty chat. Adding a fourth is a product decision, not a wiring step.

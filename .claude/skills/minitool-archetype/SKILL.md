---
name: minitool-archetype
description: >-
  Adds a new archetype to the hero assistant's mini tools in `src/minitools` —
  a new kind of live parametric 3D tool the chat can generate on demand, such
  as wave function collapse, structural analysis, topology graphs, terrain
  platforms, packing or subdivision studies. Use this skill whenever anyone
  wants the assistant to be able to build a new kind of thing: a new tool,
  template, archetype, generator, solver or simulator for the chat; a new
  entry in `TEMPLATE_IDS`; a new page under `/labs/tool`; or a new preset for
  the mini tools. It applies even when the request never says "archetype" —
  "make the chat able to do X", "add a WFC tool", "I want a Karamba-style
  demo" and "the assistant should generate topology diagrams" are all this
  skill. It also applies when an existing archetype needs its controls,
  preset or router entry reworked.
---

# Adding a mini tool archetype

The assistant in the hero (`src/minitools/`) turns a short conversation into a
live parametric tool. It does that by picking one of a small set of
*archetypes* — `facade`, `massing`, `layout`, `freeform`, `pitch` and whatever
has been added since — and having Sonnet fill in a configuration for it against
a JSON Schema. The model writes data; the archetype's own component turns that
data into geometry.

Adding one is about ten files. Four of the edits are switches TypeScript will
force you to complete, and two are registries that will fail silently in
production if you forget them. That asymmetry is the main thing this skill
exists to stop you walking into.

## First: does this need a new archetype at all?

The router's accuracy falls off as the list grows, so an archetype has to earn
its line. Three outcomes, and only one of them is work:

- **The thing is a static object** — a pavilion, a vessel, a piece of furniture,
  a structural bay, a schematic house — that a handful of primitives and one
  repeat can describe. That is `freeform`, and it already exists. Write a
  preset for it if you want that shape reachable, but do not add an archetype.
- **The thing needs the visitor's own file or dataset** — an IFC model, a DWG,
  a point cloud, their production data. That is `pitch`. No browser demo is
  honest here, and pretending otherwise is worse than scoping the work.
- **The thing computes something the visitor can watch respond** — a solver, a
  subdivision, an analysis, an aggregation, a simulation, anything where the
  interesting part is the *rule* rather than the *shape*. That is a new
  archetype. Build it.

If you cannot tell which of the three you are in, you are still deciding what
the tool is. Finish that first.

## The rules, and why they are rules

**Five controls, maximum, and each one has to change the design.** The panel is
a 340px column with no scroll and no collapse (`ToolViewerPage.tsx`), so a
longer list just stretches the page — and a visitor faced with ten dials moves
none of them. The number to hold to is `LIMITS.freeformControls`. When you are
over, the cut is almost always the same one: drop the controls that *resize*
and keep the ones that *reconfigure*. Nobody was ever impressed by a width
slider.

**The model writes data, never code.** This is the only reason it is safe to
render generated content on this domain: there is no evaluator anywhere in the
module, and there must not be one. Every rule your archetype needs lives in a
typed module under `src/minitools/lib/`; the spec only chooses between the
behaviours you wrote. If you find yourself wanting a formula field, an
expression string or an eval, the design is wrong — parameterise the behaviour
instead.

**Clamp on decode, not only on generation.** The spec arrives from two places:
the model, and the URL fragment, which anyone can edit. `parseSpec` is the
single gate both pass through, and it *clamps rather than rejects* — somebody
who edits a number in the address bar should still see their tool. The one
exception worth copying: a number that ends up as a **loop bound** has to be
re-clamped where it is applied as well, because a value can be legal in the
spec and ruinous after arithmetic. `repeat.count` in `lib/scene.ts` is the
precedent. Everything else lands in a transform, where an absurd number is only
absurd to look at.

**No new dependencies.** `three`, `@react-three/fiber` and `@react-three/drei`
are already here, and the hero's whole performance argument rests on not
shipping more. A solver you need is a solver you write; they are shorter than
they look.

**The archetype ships with its preset.** A preset is one hand-written spec in
`src/minitools/data/presets/`. It is the few-shot example Sonnet sees, the
fallback when generation fails, and the fastest way for you to look at your own
work. Without one the archetype is only half-built, and you will find that out
during verification when you have nothing to open.

## Order of work

**1. Write the router entry before you write any code.** One line saying what
the archetype is, and one clause saying which *existing* archetype it is not
and why. If you cannot write the second clause, the archetype does not exist
yet — you have a variation on something already here. This is the same check
the router itself now has to pass before it can propose anything, and it is
cheaper to fail it now. See `references/router.md`.

**2. Choose the controls.** Name them, give each a range and a default, and say
in one phrase what moving it does to the model. Five at most. Doing this before
the geometry stops the usual failure, which is a beautiful scene with four
sliders bolted onto whatever happened to be easy to expose.

**3. Write the types**, then **4. the geometry module**, then **5. the
component**, then **6. the rest of the wiring**, then **7. the preset**. The
checklist below is in dependency order; `references/wiring.md` has the code for
each step, taken from the archetypes already here.

**8. Verify in a browser.** Not optional, and not replaceable by the build:
the characteristic failure of this module is a scene that compiles perfectly
and renders nothing. `references/verify.md` is the sequence.

## The wiring checklist

TypeScript catches the first group. It does **not** catch the second.

**Loud — the compiler will stop you:**

- `schema/spec.ts` — add the id to `TEMPLATE_IDS` and `ROUTABLE_TEMPLATE_IDS`,
  define `XxxParams` and `XxxSpec`, add it to the `MinitoolSpec` union.
- `schema/validate.ts` — a `case` in `parseSpec`, and a `case` in
  `paramDefsFor`.
- `components/viewer/templates/index.tsx` — a `case` in `TemplateScene`.
- `data/copy.ts` — an entry in `templateLabels`, a `case` in
  `progressMessages`.

**Silent — nothing will tell you these are missing:**

- `schema/registry.ts` — the param defs, **widening the `Extract<>` in
  `PARAM_REGISTRY`**, the `XXX_DEFAULTS` export, and any new `LIMITS`. Miss the
  `Extract<>` and `paramDefsFor` returns nothing: the tool renders with an
  empty parameter panel and no error anywhere.
- `schema/json-schema.ts` — `XXX_SCHEMA` and its entry in `SCHEMAS`. That map
  is `Partial`, so a missing entry compiles fine and then `specSchemaFor`
  returns `null` at runtime, which the visitor experiences as every single
  build failing.
- `server/prompts.ts` — the router entry from step 1. Without it the archetype
  exists and is unreachable.
- `data/presets/` — the preset and its line in `presets/index.ts`.

## Where to read next

Read the one you need when you get to it, not all four up front.

- `references/wiring.md` — the ten edit points in dependency order, with the
  code pattern for each and the two cost notes that catch people out (schema
  compilation time, and why numeric bounds live in descriptions).
- `references/scene.md` — how to write the R3F component: the fitting
  convention, instancing, and the five failure modes of this canvas listed by
  *symptom*, so you can diagnose backwards from what you are seeing.
- `references/router.md` — how to write the router entry and the preset, which
  are the two pieces of prose that decide whether the archetype is ever
  actually used.
- `references/verify.md` — build, link, browser, and what each step is really
  testing.

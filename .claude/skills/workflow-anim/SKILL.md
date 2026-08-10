---
name: workflow-anim
description: Generate conceptual workflow animations — animated SVG plus GIF, white background, in the studio's visual language — for client proposals and the marketing site. Use this whenever someone wants to show HOW a computational-design or AEC-technology workflow works: a diagram of a pipeline, a 2D-to-3D or model-generation sequence, an optioneering study, or how a set of tools (Rhino, Grasshopper, Revit, Excel, Power BI, IFC) exchange data. Use it for any request mentioning a proposal header image, a workflow diagram, a process animation, a concept GIF, "show the client how this works", or explaining automation to architects, engineers or contractors — even when the words "animation" or "diagram" are never used and they just describe a process they want pictured.
---

# Conceptual workflow animations

You describe a workflow as data; a bundled renderer draws it in the studio's
visual language and emits an animated SVG, a static poster, a GIF and a metadata
sidecar. The animation goes into a client proposal at
`r2ch.tech/<slug>`, or onto the marketing site.

The audience is architects, engineers and construction people. They read plans,
sections and axonometrics fluently and they do not read code. The diagram's job
is to make a technical process legible to them and to make the value obvious
without overclaiming.

## The one rule that shapes everything else

**You write data. You never write SVG, CSS or drawing code.**

A spec is 40–80 lines of JSON: what the stages are, what they are called, who
owns them, what travels between them. It carries no colours, no coordinates, no
sizes, no fonts, no durations per element. Everything visual belongs to the
renderer, which is what makes every animation look like the same studio made it
and what keeps a spec cheap to write.

If you find yourself wanting a colour or a position in the spec, the answer is
either a different archetype or a change to the renderer — not a field.

## Workflow

1. **Understand the actual process.** Ask what the client hands over, what comes
   back, and which steps a person still does. Guessing produces a diagram that
   contradicts the proposal text.
2. **Pick an archetype** (below). Picking wrong wastes the whole attempt.
3. **Write the spec** to a `.json` file. Follow the worked example.
4. **Render:**

   ```bash
   node .claude/skills/workflow-anim/scripts/render.mjs <spec.json> \
     --out public/proposals/<slug>/anim/<name>
   ```

   Options: `--frames <n>` (default 24), `--no-gif`, `--quiet`.
5. **Read the warnings.** The validator clamps and truncates rather than
   refusing, and it names everything it changed. A truncated label is a defect,
   not a formatting detail — fix the spec and render again.
6. **Look at the poster.** Open `<id>.poster.svg`. If the composition is wrong
   you will see it there in one glance, without watching a loop.
7. **Wire it in.** The CLI prints a paste-ready `figure` block. Put it in the
   proposal's `blocks` array in `src/data/proposals/<slug>/index.ts`.

## The four archetypes

Pick by what you are trying to say, not by what the data looks like.

**`pipeline`** — *"you give us this, these steps run, you get that back."* Stages
left to right with the artifact named on each connector. The workhorse; most
requests are this. **3–6 stages**, five is comfortable. Solid means we automate
it, dashed means it stays with the client.

**`transform`** — *"the same information, re-expressed, without redrawing it."*
An isometric site that arrives as flat plates, gains height, and resolves into a
massing. This is the one that lands hardest with architects, because redrawing
is the cost they already feel. **Exactly 3 stages** — a fourth always turns out
to be indecision about what the transformation is.

**`iterate`** — *"we generated many, scored them, and you chose."* Option tiles
appear, score bars fill, one is marked. Reach for this when the client's unspoken
worry is that the computer decides. **4–12 tiles, ≤3 criteria.** Use `total` when
more options were studied than tiles shown — nine tiles standing for forty is
honest as long as the figure says forty.

**`exchange`** — *"here is the toolchain and what moves through it."* Named tools
on a ring, each link labelled with its payload, a packet animating along. **3–7
nodes, hard cap at 7.** If you cannot name what travels along a link, you do not
know the workflow well enough to draw it.

Nothing here is a good fit for real analysis output (a solar study, a cost
curve). Those need real data, and an invented one inside a document that also
carries pricing is a liability. Say so and put the finding in the proposal's
text instead.

**Not this skill:** anything the reader should be able to *change*. A diagram
with sliders belongs in `src/minitools/`. This skill makes a fixed narrative
that has to travel — into an email, a PDF, a slide.

## A worked spec

```json
{
  "archetype": "pipeline",
  "id": "quantities-to-cost",
  "duration": 7200,
  "meta": {
    "title": "Quantities to cost and sequence",
    "kicker": "Cost and 4D",
    "subtitle": "One model, two deliverables",
    "description": "Your model and your rate library produce a cost estimate and a 4D sequence, refreshed on every design update.",
    "alt": "Animated diagram on a white background showing five stages left to right, joined by arrows with the file passing between them labelled on each line. A Revit model arrives from the client; quantities are read from it; they are priced against the client's rate library; two outputs follow, a cost estimate and a Navisworks sequence.",
    "caption": "Both outputs regenerate from the same run. No re-entry between them.",
    "tags": ["revit", "quantities", "cost-estimation", "navisworks", "4d"]
  },
  "stages": [
    { "id": "model",   "label": "Revit model",   "sub": "Your live model",    "kind": "input",   "owner": "client" },
    { "id": "takeoff", "label": "Quantities",    "sub": "Element by element", "kind": "process" },
    { "id": "price",   "label": "Priced",        "sub": "Your rate library",  "kind": "process" },
    { "id": "cost",    "label": "Cost estimate", "sub": "A spreadsheet",      "kind": "output"  },
    { "id": "seq",     "label": "4D sequence",   "sub": "Navisworks",         "kind": "output"  }
  ],
  "flows": [
    { "from": "model",   "to": "takeoff", "label": "Model file", "owner": "client" },
    { "from": "takeoff", "to": "price",   "label": "Element list" },
    { "from": "price",   "to": "cost",    "label": "Priced items" },
    { "from": "cost",    "to": "seq",     "label": "Dated tasks" }
  ]
}
```

`owner` is `automated` (default), `manual` or `client`. `kind` is `input`,
`process`, `output` or `decision`. Omit `flows` entirely and the stages chain in
order. `duration` is 4200–9600 ms; the default 6400 is right for most.

`meta.kicker` is the two-word label the proposal's side index shows. It is
derived from the title if you leave it out, but the derivation cannot know which
half of "Cost estimate and 4D sequence" matters — set it whenever the title does
not shorten gracefully.

Four complete examples, one per archetype, are in `examples/`. Copy the closest
one rather than writing from scratch.

## Writing for this audience

**Name the tool, name the deliverable, never name the technique.** An architect
trusts "Grasshopper → Revit → cost model". They do not need to know a solver ran,
and saying so makes them wonder what else they are paying for.

| Don't write | Write |
|---|---|
| hyperparameter sweep, solution space | parametric variants, options studied |
| API / SDK integration | direct link to Revit, reads the model file |
| script, algorithm, code | automated step, routine |
| schema, data model | the information each element carries |
| JSON / CSV export | a spreadsheet the team can open |
| headless Revit | runs without opening Revit |
| ML inference | trained estimate |
| mesh, BREP, NURBS | geometry, surface, solid |
| optimise | compare against your criteria |
| CI pipeline | checks that run on every update |

**Show** the file the client hands over, a tool they recognise, the moment a
human decides, the artifact that comes out. **Abstract** anything between an
input and an output that has no name they would recognise — one box labelled
"geometry engine" beats four labelled parse / tessellate / solve / serialise.
Four boxes look like more work and read as less clarity, and clients pay for
clarity.

**Never** put our file names, module names or class names in a client
animation. Note this cuts against the `flow` block in the proposal data, whose
`meta` field deliberately *does* carry the module — that block addresses a
technical reader and is a different register. Don't copy its habits here.

**Labels.** Noun phrase or verb phrase, never a sentence: "Extract floor areas",
not "The system extracts the floor areas". Primary label ≤24 characters, sub-line
≤40 — and much shorter once there are five stages, because the card is a fifth
of the canvas. Push detail down into `sub` rather than lengthening the label.

**Units always.** "12 min", not "fast". "3 → 40 options", not "many options". An
architect reads quantities; a diagram without one reads as marketing.

## Two failures to check for before you render

**The org chart.** If there is no direction of travel, it is a taxonomy, not a
workflow, and it tells the client nothing about what they are buying. Every
archetype needs an unambiguous reading direction. `exchange` refuses to render
without links for exactly this reason.

**The magic box.** Client input goes into something unnamed and value comes out.
Name the middle, even when the honest name is vague: "rule set agreed with you in
Phase 1" is a real answer, "processing" is not.

## The honesty rule

Every stage in an animation must correspond to something named in the proposal's
own `flow`, `steps` or `timeline` blocks. Inside a document that also carries
pricing, a diagram is a representation of what is being sold. If it is not in the
text, it does not go in the picture — and if it belongs in the picture, add it to
the text first.

This is the one rule no validator can enforce, which is why the CLI prints it on
every run.

## What you get back

```
public/proposals/<slug>/anim/<name>/
  <id>.svg          animated, white, CSS keyframes, no JS   10–60 KB
  <id>.gif          800×400, for email and slide decks      20–90 KB
  <id>.poster.svg   the end state, static — print, reduced motion
  <id>.json         the sidecar: title, description, alt, caption, tags
  spec.json         your input, for regenerating later
```

`meta.alt` is **required** and the render fails without it. That is deliberate:
a diagram whose whole job is explaining something must be explicable in words,
and if you cannot write the alt text the diagram is not communicating. Describe
what a reader sees *and* what it means, naming each stage.

`tags` come from a controlled vocabulary — see `references/tags.md`. Unknown tags
are dropped with a warning rather than invented.

## Aesthetic rules you can reach from a spec

Almost none, and that is the point. The only one worth knowing: **lime is never a
line, always a plane.** The brand accent `#c8f94e` sits at about 1.4:1 on white
and vanishes as a stroke. The renderer only ever uses it as a fill under black
ink, and it spends it sparingly — on the stage that is active, the option that
was chosen, the roofs of a finished model. If an animation looks like a
highlighter, that is a renderer bug, not a spec one.

## Verification

```bash
node .claude/skills/workflow-anim/scripts/selftest.mjs
```

Checks the four invariants across every example: that the animated SVG's declared
attributes are its *end* state (so it rasterizes to the finished diagram rather
than a blank rectangle in a PDF), that labels stay inside the canvas even when
the font substitutes 15% wider, that the density caps hold, and that the GIF
plays for its stated duration. Run it after changing anything under `scripts/`.

## Read these when you need them

- `references/archetypes.md` — the full field-by-field schema for all four, with
  a worked example each. Read before writing an archetype you have not used.
- `references/aec-translation.md` — the long vocabulary map and worked
  before/after rewrites. Read when the source material is written by engineers.
- `references/design-system.md` — palette, type, isometric projection, the shared
  chrome. Read only to change the renderer.
- `references/output-formats.md` — the sidecar schema, GIF tuning, font
  embedding, and the librsvg constraints the pipeline is built around.
- `references/tags.md` — the controlled tag vocabulary.
- `references/proposal-integration.md` — the `figure` block, and how it differs
  from attaching the file to a `docs` block.

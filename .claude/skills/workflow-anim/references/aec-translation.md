# Writing for architects and construction people

The source material for these diagrams is usually written by whoever built the
thing. That register is wrong for the reader in two directions at once: it names
techniques they do not care about, and it skips the deliverables they do.

This file is the translation layer. Read it when the input is engineer-written,
or when a diagram feels accurate but flat.

## Who is reading

An architect, an engineer, a cost consultant, a contractor's BIM lead. What is
true of all of them:

- **They read drawings fluently.** An axonometric, a hatch, a dashed line for
  something proposed — these are their native notation, not a metaphor. Solid
  versus dashed carries meaning to them before you explain it.
- **They read quantities.** "Three weeks to two days" lands; "much faster" does
  not. A diagram without a number in it reads as marketing.
- **They have been sold software before.** Several times. Something that claims
  to be effortless is suspicious; something that names what they still have to
  do is credible.
- **They are responsible for the outcome.** The fear is not that the automation
  is bad, it is that it is opaque and they will have to defend it. Naming the
  moment a person checks the work is worth more than any capability claim.
- **They do not know our stack and should not have to.** Naming it costs
  goodwill: every unfamiliar word is a reminder that they cannot verify what
  they are buying.

## The rule

**Name the tool, name the deliverable, never name the technique.**

"Grasshopper → Revit → cost model" is three things they can picture and check.
"Constraint solver over a parametric graph" is one thing they cannot, and it
raises the question of what else is hidden.

The exception is when the technique *is* the deliverable — a client buying a
Dynamo script needs to see Dynamo. The test: would they write this word in an
email to their own director?

## Vocabulary

| Don't write | Write | Why |
|---|---|---|
| hyperparameter sweep | parametric variants | The first names a method; the second names what they get. |
| solution space exploration | options studied | Same. |
| API / SDK integration | direct link to Revit | "Integration" is a category, "reads your model" is a fact. |
| script, algorithm, code | automated step, routine | "Script" implies fragile and personal. |
| schema, data model | the information each element carries | They already think in element parameters. |
| JSON, CSV, XML export | a spreadsheet the team can open | The format matters to us, the openability to them. |
| headless Revit | runs without opening Revit | Literally the same claim, one is legible. |
| ML inference, model prediction | trained estimate | Sets the right expectation: an estimate, from examples. |
| optimise | compare against your criteria | "Optimise" implies we picked the objective. We did not. |
| mesh, BREP, NURBS, tessellation | geometry, surface, solid | Precision they cannot use. |
| CI pipeline, build | checks that run on every update | |
| version control, git | revision history | |
| refactor, technical debt | *(never appears on a client diagram)* | Internal concerns. |
| middleware, service layer | the link between them | |
| ETL | reads, cleans, writes | Three verbs beat one acronym. |
| validation rules engine | the checks you agreed | Ownership matters more than architecture. |
| point cloud registration | aligning the scans | |
| clash detection algorithm | clash checks | They already run these. |
| generative design | options generated to your rules | "Generative" now reads as image generation. |
| digital twin | live model linked to site data | The phrase has been spent. Say the mechanism. |
| interoperability layer | what moves between the tools | |
| parametric model | a model that updates when the inputs change | Only spell this out for a non-technical client. |
| solver, optimiser | works out the arrangement | |
| batch process | runs on all of them at once | The value is "all", not "batch". |
| cloud compute | runs on our machines, not yours | Answers the question they have. |
| IFC round-trip | exports and re-imports cleanly | |
| LOD 300 | *(keep — they know it)* | Not everything needs translating. |

That last row matters. Over-translating is its own failure: writing "detail
level" for LOD, or "3D program" for Revit, is patronising and they will notice.
The line is domain vocabulary versus *our* vocabulary. Revit, IFC, LOD, takeoff,
RFI, clash, as-built — theirs, keep them. Schema, endpoint, pipeline-as-in-CI,
serialise — ours, translate them.

## Show, abstract, never show

**Show:**
- The file they hand over, by name and format.
- A tool they recognise, with its real name.
- The moment a person decides or checks.
- The artifact that comes out, in terms of what they will do with it.
- The thing that used to take a week.

**Abstract:** everything between an input and an output that has no name they
would recognise. One box labelled "geometry engine" beats four labelled parse /
tessellate / solve / serialise. Four boxes look like more work and read as less
clarity, and a diagram that is hard to follow makes the *service* look hard to
follow.

**Never show:** our file names, module names, class names, repository names,
cloud vendors, model names, library versions.

This last one cuts directly against the `flow` block in the proposal data, whose
`meta` field deliberately carries the module a stage lives in. That block is
written for a technical reader evaluating the build; an animation is written for
whoever signs. Same proposal, two registers. Do not carry the habit across.

## Worked rewrites

**Before.** *"Our Python service ingests the IFC, runs a rules engine over the
element schema, and emits a normalised JSON payload consumed by the cost API."*

Five nouns the reader cannot check, and no deliverable. As a `pipeline`:

| stage | label | sub | owner |
|---|---|---|---|
| 1 | IFC export | From your model | client |
| 2 | Checked | The rules you agreed | automated |
| 3 | Priced | Your rate library | automated |
| 4 | Cost estimate | A spreadsheet | automated |

Flows: "Model file" (client) → "Element list" → "Priced items". Same process,
and now stage 2 says the rules are *theirs*, which the original hid.

---

**Before.** *"Genetic algorithm optimises the façade panelisation against a
multi-objective fitness function combining daylight autonomy and fabrication
cost."*

The word "optimises" is doing damage: it says we chose what "best" means. As an
`iterate`: `criteria: ["Daylight", "Panel cost", "Repeat count"]`, `total: 120`,
twelve tiles, `selectedBy: "Shortlisted with your façade consultant"`. The
algorithm is not mentioned and nothing is lost — the client can see 120 options
were studied against three named criteria and a person they trust picked.

---

**Before.** *"Automated BIM."*

The opposite failure: no technique, but also no content. This is the magic box.
What arrives? What comes back? Who still touches it? If the answer is genuinely
unknown, the diagram is premature — the conversation has not happened yet, and
drawing it now commits the studio to something nobody has scoped.

## Density, because "keep it simple" is not actionable

- `pipeline`: 3–5 stages, 6 absolute ceiling. Below 3 it is an arrow.
- `transform`: exactly 3.
- `iterate`: 6–12 tiles, ≤3 criteria.
- `exchange`: 4–7 nodes, each one nameable by the client.
- **Global: at most about 7 labels visible at any one instant.** Not in total —
  staged reveal is how a diagram carries fifteen labels while never showing
  seven at once. This is what the animation buys you over a static diagram, and
  the only reason it is worth animating at all.
- 5–8 seconds, looping.

## Two anti-patterns

**The org chart.** No direction of travel. Boxes connected by plain lines, or a
hierarchy. It is a taxonomy, and a taxonomy tells a client nothing about what
they are buying. Every archetype here has a reading direction — enforce it in the
content, not just the layout.

**The magic box.** Client input goes into something unnamed and value comes out.
Always name the middle, even when the honest name is vague. "Rule set agreed with
you in Phase 1" is a real answer. "Processing", "AI", "our platform" are not.

## The honesty rule

Every stage in the animation must correspond to something named in the
proposal's own `flow`, `steps` or `timeline` blocks.

A diagram inside a document that carries pricing is a representation of what is
being sold. Drawing a stage the text does not commit to is the easiest way for a
proposal to promise something nobody costed. If a stage belongs in the picture,
put it in the text first — then draw it.

# Tag vocabulary

Tags exist so that a year and thirty proposals from now, "have we drawn this
before?" is a question with an answer. Free text does not survive that; a
controlled list does.

Up to 8 per animation. Anything not on this list is dropped with a warning
rather than invented — if a genuinely new term is needed, add it here first.

Format: lowercase, hyphenated, 2–29 characters.

## Tools

```
revit  rhino  grasshopper  dynamo  navisworks  autocad  civil-3d  tekla
archicad  sketchup  blender  speckle  ifc  excel  power-bi  bim360
aconex  procore  unreal  twinmotion  python  csharp
```

Name a tool only if it appears in the diagram. A tag is a search key, not a
capability claim.

## Disciplines

```
architecture  structures  mep  facade  civil  landscape  interiors
cost  planning  logistics  sustainability  acoustics  fire
```

## Deliverables

```
model-generation  quantities  cost-estimation  4d  5d  clash-detection
drawing-production  schedules  dashboards  reporting  specifications
as-built  handover  feasibility  massing  panelisation  rebar
fabrication  setting-out
```

## Techniques

```
automation  parametric  optioneering  interoperability  data-exchange
validation  qa  migration  digitisation  scan-to-bim  simulation
daylight  energy  structural-analysis  geometry  scripting  api
machine-learning  generative
```

These are for *our* retrieval, not for the client's eyes — they never appear in
the rendered animation. So `machine-learning` is a fine tag on a diagram whose
visible label says "trained estimate".

## Stage

```
concept  schematic  detailed-design  tender  construction  operation
proposal  pilot  rollout
```

---

## Choosing

Aim for four to six spanning more than one group: a tool, a deliverable, a
technique. `["revit", "quantities", "cost-estimation", "automation"]` finds the
right diagram later. `["automation", "parametric", "bim"]` finds forty.

Prefer the deliverable over the technique when you can only have one. What gets
searched for is "the cost estimate one", not "the parametric one".

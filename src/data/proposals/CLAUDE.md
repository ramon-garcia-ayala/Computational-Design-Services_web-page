# Proposal Pages — How to Create a New One

Client proposals are served as static pages at `/<slug>` (e.g. `/29.06.2026_ecogen`).
Each proposal lives in its own data file. No component changes needed for a new proposal.

---

## Slug format

```
DD.MM.YYYY_clientname
```

Examples: `29.06.2026_ecogen`, `28.06.2026_reparametrize`

Use today's date and a lowercase client/project identifier (no spaces, no special chars except underscore).

---

## Steps to create a new proposal

**0. MANDATORY — Ask the user for `headerStages` before writing any code**

Before creating the data file, ALWAYS ask the user:

> "¿Cuáles son los pasos del pipeline para el header animado?
> Dímelos en orden: `2D → paso 2 → paso 3 → … → output final`.
> Para cada paso necesito: nombre corto (label), herramienta/detalle (sublabel), y si es input / proceso / output."

Do NOT proceed until the user provides this information. Use the answer to populate `headerStages` with the appropriate `kind` values (see the "Header diagram" section below for the `kind` → drawing mapping).

If the user cannot define the stages yet, propose a default set based on the project type and ask for confirmation before writing the file.

**1. Create the data file**

```
src/data/proposals/DD.MM.YYYY_clientname.ts
```

Copy the structure from `29.06.2026_ecogen.ts` as a starting point.

**2. Register it in the index**

Open `src/data/proposals/index.ts` and uncomment or add:

```ts
"29.06.2026_clientname": () => import("./29.06.2026_clientname"),
```

**3. Run `npm run build`** to confirm the new route appears under `/[slug]`.

---

## ProposalData fields

All fields are in `src/data/proposals/types.ts`.

### Required

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | Must match the file name and registry key exactly |
| `client` | `string` | Client or company name shown on the page |
| `projectTitle` | `string` | Main H1 heading |
| `projectSubtitle` | `string` | One-line description below the title |
| `date` | `string` | Human-readable date, e.g. `"June 29, 2026"` |
| `preparedBy` | `string` | Usually `"Computational Design Services"` |
| `headerImage` | `string?` | Optional. Path to a concept GIF/image shown in the hero, e.g. `"/proposals/ecogen-header.gif"`. See "Header concept GIF" below. |
| `summary` | `string` | 2-3 sentence executive summary |
| `challenge` | `string` | The client's problem, pain point, or bottleneck |
| `approach` | `string` | How CDS will solve it, at a high level |
| `services` | `ProposalService[]` | 2-4 service cards (name + description) |
| `phases` | `ProposalPhase[]` | Project phases with deliverables |
| `investment` | object | Total price, currency, note, optional breakdown |
| `nextSteps` | `string[]` | 3-5 action items for the client |
| `validUntil` | `string` | Expiry date, e.g. `"July 15, 2026"` |

### Optional (enable visual diagrams)

| Field | Type | Description |
|---|---|---|
| `headerStages` | `HeaderStage[]` | ⭐ **Animated SVG hero diagram** (preferred). Renders `HeaderPipeline` — a looping, storyboard-driven pipeline. Each stage has `kind`, `label`, `sublabel`, `role`. Takes priority over `headerImage`. See "Header diagram" section below. |
| `headerImage` | `string` | Legacy static GIF path (e.g. `"/proposals/ecogen-header.gif"`). Only used when `headerStages` is absent. |
| `workflow` | `WorkflowStep[]` | Mid-page "How the System Works" cards. Each step has `label`, `sublabel`, and `role: "input" \| "process" \| "output"` |
| `techStack` | `TechItem[]` | Badge grid split into Primary / Alternative stacks. Each item has `name` and `category: "primary" \| "alternative"` |
| `phases[n].startWeek` | `number` | Start week for the Gantt chart |
| `phases[n].endWeek` | `number` | End week for the Gantt chart. If any phase has these, the Gantt renders automatically |

---

## Available diagram components

All live in `src/components/proposal/`.

### WorkflowDiagram

Horizontal pipeline with color-coded roles:
- `"input"` — blue top border
- `"process"` — indigo (accent) top border
- `"output"` — emerald top border

Triggered by: `data.workflow` being defined.

### TechStack

Badge grid split into "Primary Stack" (accent badges) and "Alternative Workflow" (grey badges).

Triggered by: `data.techStack` being defined.

### GanttChart

Animated horizontal bar chart showing phase timing across weeks.

Triggered by: any phase having `startWeek` and `endWeek`.
Colors cycle: blue (phase 01), indigo/accent (phase 02), emerald (phase 03), amber (phase 04).

---

## Header diagram — `headerStages` (preferred) vs `headerImage` (legacy GIF)

### ⭐ Use `headerStages` for all new proposals

`headerStages` renders a fully animated, looping SVG pipeline (`HeaderPipeline` component) directly in the browser — no Python, no file generation, no static asset needed. It **takes priority over `headerImage`** when both are defined.

The example below is for a **2D-to-BIM automation** project. Every proposal must define its own stages — never copy another proposal's `headerStages` verbatim. The number of stages, the `kind` selection, and the copy all depend on what THAT specific project is about.

```ts
// Example: ecogen (2D site plan → BIM automation, 6 stages)
headerStages: [
  { kind: "plan2d",   label: "2D Site Plan",    sublabel: "DWG / PDF layout",       role: "input"   },
  { kind: "plugin",   label: "UI Plugin",        sublabel: "pyRevit · one click",    role: "process" },
  { kind: "bim3d",    label: "BIM 3D Model",     sublabel: "parametric families",    role: "process" },
  { kind: "metadata", label: "Metadata",          sublabel: "type · qty · capacity",  role: "process" },
  { kind: "cost",     label: "Cost Estimate",     sublabel: "auto quantity takeoff",  role: "output"  },
  { kind: "schedule", label: "Schedule",          sublabel: "phased timeline",        role: "output"  },
],

// Example: reparametrize (service model proposal, 4 stages)
headerStages: [
  { kind: "plan2d",   label: "Your Projects",     sublabel: "Villas · Landscape · Web",          role: "input"   },
  { kind: "plugin",   label: "CDS as Your Team",  sublabel: "remote · embedded · zero overhead", role: "process" },
  { kind: "bim3d",    label: "Parametric Output", sublabel: "Grasshopper · web tools · scripts", role: "process" },
  { kind: "schedule", label: "Flexible Billing",  sublabel: "monthly retainer or per-project",   role: "output"  },
],
```

**Each stage has its own hand-drawn SVG diagram** that animates in when the stage becomes active. Stages cycle automatically (every ~2.6 s); hovering pauses the loop. A storyboard strip at the bottom shows progress.

#### `kind` values and what they draw

| `kind` | Drawing | Best for |
|---|---|---|
| `"plan2d"` | Grid of 2D footprints (capsules/modules) with north arrow and dimension tick | Any workflow that starts from a 2D plan, site layout, or CAD drawing |
| `"plugin"` | pyRevit/tool UI window with parameter fields and animated RUN button | Revit API plugins, Grasshopper scripts, any user-triggered tool |
| `"bim3d"` | 4×3 isometric grid of extruded boxes (battery modules / BIM elements) | 3D Revit model output, massing studies, any 3D BIM deliverable |
| `"metadata"` | Isometric cube with a Properties panel and callout line | Data export, schedule tagging, COBie, parameter population |
| `"cost"` | Cost breakdown table + grouped bar chart (amber palette) | Quantity takeoffs, cost estimates, budget deliverables |
| `"schedule"` | Gantt chart with week columns, colored phase bars, NOW marker | Project timelines, phased delivery, any schedule output |

#### Color per role

| `role` | Color | Use when |
|---|---|---|
| `"input"` | Blue `#60a5fa` | First step: what the client provides |
| `"process"` | Indigo `#6366f1` / `#818cf8` | Transformation steps in the middle |
| `"output"` | Emerald `#34d399` | Final deliverable the client receives |

#### Design rules for new stages

- **Every proposal gets its own stages.** Never copy `headerStages` from another proposal. Each project has a different concept, a different number of steps, and different relevant `kind` combinations. Two proposals will never look the same.
- **Narrative arc matters.** The stages must tell the specific story of THIS project: what the client brings, what CDS transforms, what the client receives. For a service-model proposal (like "hire us instead of an employee"), the stages describe the engagement, not a data pipeline.
- **3 to 5 stages is the sweet spot.** 3 is compact and punchy. 4–5 is the most common. 6 is the maximum — only when every step is genuinely distinct. Never add a stage just to fill space.
- **`kind` picks the drawing; copy makes it yours.** Never change the SVG `kind` drawings — instead rewrite `label` and `sublabel` to fit the project narrative. The same `"bim3d"` drawing works for any 3D output (BIM, massing, landscape model, etc.).
- **Choose `kind` by CONCEPT, not by tool name.** `"plugin"` = any user-triggered interface or tool (Grasshopper, a web form, a Dynamo script). `"plan2d"` = any starting document or brief (DWG, site survey, client requirements). `"schedule"` = any timeline or delivery structure (Gantt, roadmap, sprint plan). Pick the one that visually matches the idea, not the literal technology.
- **Order input → process(es) → output.** Even if the real workflow has parallel steps, the display is linear — simplify for clarity and impact.

#### Adding a new `kind` (drawing type)

If none of the 6 existing kinds fits the new proposal:

1. Open `src/components/proposal/HeaderPipeline.tsx`
2. Add the new `kind` to the `HeaderStage["kind"]` union in `src/data/proposals/types.ts`
3. Add a color entry in `KIND_COLOR`
4. Write a new SVG function (`function MyNewDiagram(...)`) following the same pattern as the others — use `motion.g`, `motion.rect`, `motion.line`, etc. with the shared variants (`fadeUp`, `pop`, `rise`, `growX`, `growY`)
5. Add a `case` in the `Diagram` switch

All SVG geometry is hand-coded in the `VB_W=800 × VB_H=440` viewBox. Keep diagrams centered in the ~200–600 x / 100–360 y zone (the label lives at top-left, the storyboard at the bottom).

### Legacy: `headerImage` (static GIF)

Still supported for old proposals. Set `headerImage: "/proposals/<slug>-header.gif"` and generate with `python scripts/gen_proposal_header.py`. Do not use for new proposals — use `headerStages` instead.

## Copy rules

- No em dashes (`—`) anywhere in proposal copy. Use commas, colons, or rewrite the sentence.
- No hourly billing language. CDS prices by deliverable/milestone.
- Payment structure: 3 milestone payments is the default. Suggested split: 30% / 35% / 35%.
- `validUntil` should be 2-3 weeks from the proposal date.
- Phases use week numbers in duration (e.g. `"Weeks 1 – 3"`). Add `startWeek`/`endWeek` as integers to enable the Gantt.
- All monetary amounts in format: `"USD X,XXX"` (currency separate from total field).
- Metadata: proposals are `robots: noindex` by default (handled in the route's `generateMetadata`).

---

## Investment structure template

```ts
investment: {
  total: "15,000",
  currency: "USD",
  note: "Billed in three milestone payments...",
  breakdown: [
    { label: "Phase 01: Kickoff & Foundation  (due on contract signing)", amount: "USD X,XXX" },
    { label: "Phase 02: MVP Delivery  (due at end of Month 2)",           amount: "USD X,XXX" },
    { label: "Phase 03: Final Delivery & Handover",                       amount: "USD X,XXX" },
  ],
},
```

---

## Page layout (rendered order)

1. Header bar (company name, date, ref slug)
2. Hero (client name, title, subtitle, summary)
3. Challenge vs Approach (2-col grid)
4. Automation Pipeline / WorkflowDiagram (if `data.workflow`)
5. Services Involved (cards grid)
6. Tools & Technology / TechStack (if `data.techStack`)
7. Project Phases with GanttChart (if weeks defined) + detailed phase list
8. Investment / Pricing
9. Next Steps
10. Footer (valid until, email)

---

## File locations

```
src/
  app/
    (proposals)/
      [slug]/
        layout.tsx     # Minimal layout, no site Navbar/Footer
        page.tsx       # Dynamic route: reads slug, loads data, renders ProposalPage
  components/
    proposal/
      ProposalPage.tsx       # Main template — renders headerStages (HeaderPipeline) or headerImage
      HeaderPipeline.tsx     # ⭐ Animated SVG pipeline (6 stage kinds, auto-loop, storyboard strip)
      WorkflowDiagram.tsx    # Static horizontal pipeline cards (mid-page "How it works" section)
      TechStack.tsx          # Tech badge grid
      GanttChart.tsx         # Phase Gantt chart
  data/
    proposals/
      types.ts               # All TypeScript interfaces
      index.ts               # Registry — add new proposals here
      CLAUDE.md              # This file
      29.06.2026_ecogen.ts   # Example proposal
```

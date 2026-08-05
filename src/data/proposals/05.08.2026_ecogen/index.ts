import { contactHref } from "@/data/site";
import type { Proposal } from "../types";

/**
 * EcoGen / Fluence — Automation Pipeline for Revit.
 * Phase 1 (Discovery), issued and reviewed 5 August 2026, final delivery on
 * the 7th.
 *
 * All the copy of the document lives here. Provisional internal figures (unit
 * rates, crew rates, markups) are deliberately left out: what the client is
 * asked for is to validate them, not to inherit them from our estimates.
 */
export const ecogenFluence: Proposal = {
  slug: "05.08.2026_ecogen",
  client: "EcoGen / Fluence",
  project: "Automation Pipeline for Revit",
  phase: "Phase 1 — Discovery",
  dateLabel: "August 5, 2026",
  reviewLabel: "Final delivery · August 7, 2026",
  confidential: true,
  summary:
    "Discovery findings, the technical process, and the open questions for the automated pipeline from 2D site layout to cost estimate and construction schedule.",

  hero: {
    kicker: "Phase 1 — Discovery",
    title:
      "From site layout to cost and schedule — one continuous pipeline",
    accent: "one continuous pipeline",
    lead: "A technical exploration into automating the path from a 2D site drawing to a coordinated 3D model, and from that model directly into cost and schedule deliverables — all of it driven from a tab inside Revit 2027. Prepared for review with EcoGen and Fluence.",
  },

  blocks: [
    /* ------------------------------------------------------------------ 01 */
    {
      kind: "prose",
      id: "brief",
      kicker: "The brief",
      title: "What Phase 1 was asked to deliver",
      lead: "Discovery ran from July 27 to August 7, 2026. This document is the deliverable, and each requirement maps to a section below.",
      checklist: [
        {
          label:
            "Concrete research on the process to be automated — see Research and Findings.",
          href: "#research",
        },
        {
          label:
            "A website documenting the process, with the tools, licenses and software involved — this document, and the Stack section.",
          href: "#stack",
        },
        {
          label:
            "A precise definition of the technical process to be developed in the following phases — see Technical process and Roadmap.",
          href: "#pipeline",
        },
        {
          label:
            "The open items that have to be closed before Phase 2 can start — see Open questions.",
          href: "#questions",
        },
      ],
      body: [
        "Discovery was not a paper exercise. Roughly 60% of the pipeline — layer validation, model data extraction, cost decomposition and both Excel writers — is already built and tested against real files. What is documented here is therefore a working system with two known gaps, not a proposal for one.",
      ],
    },

    /* ------------------------------------------------------------------ 02 */
    {
      kind: "stats",
      id: "research",
      kicker: "Research",
      title: "What we studied",
      lead: "Every conclusion in this document is derived from real project files, not from assumptions about how the process might work.",
      stats: [
        {
          value: "3",
          label: "Real site drawings analysed",
          note: "Two clean layout variants plus one export from the custom layout generator.",
        },
        {
          value: "315 vs 16",
          label: "Two incompatible layer conventions",
          note: "The same site can arrive as a 16-layer drawing or as a 315-layer export. They cannot be read by the same rules.",
        },
        {
          value: "11",
          label: "Revit families and models reviewed",
          note: "The existing BESS library: enclosures, beams, pole bases, fixtures, fencing, roads and conduits.",
        },
        {
          value: "7 pages",
          label: "Reference construction schedule",
          note: "A Primavera P6 export, used as the exact target format for the generated schedule.",
        },
        {
          value: "16 columns",
          label: "Reference estimate structure",
          note: "The detailed estimate layout was reproduced column by column, including its subtotal and markup blocks.",
        },
        {
          value: "121",
          label: "Automated tests passing",
          note: "The estimate tests read column names from the reference workbook itself, so the schema cannot drift silently.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 03 */
    {
      kind: "cards",
      id: "findings",
      kicker: "Findings",
      title: "What the drawings and workbooks told us",
      lead: "Five findings shaped the design of the pipeline. Two of them are good news, three of them are the reason the open questions exist.",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "Two drawing dialects, not one",
          body: "Site layouts reach us in two very different shapes: a clean drawing with around sixteen named layers, and a generator export carrying over three hundred, mixing site layout with structural shop-drawing content. Automation can handle either, but it has to be told which one is the production format.",
        },
        {
          icon: "cropMarks",
          title: "The layouts use placed blocks",
          body: "Elements appear as inserted blocks at known points rather than exploded geometry. This is the single most important thing working in our favour: position, rotation and identity can be read directly instead of being inferred from loose lines.",
        },
        {
          icon: "mapPin",
          title: "The origin appears to be fixed",
          body: "In every drawing reviewed so far, coordinates are tied to a known reference point on the site. If that holds for future drawings, models land in the right place with no manual alignment. If it does not, an alignment step has to be designed in.",
        },
        {
          icon: "spreadsheet",
          title: "Source workbooks carry inconsistencies",
          body: "The reference estimate contains broken cross-references between its summary and detail sheets, and a subtotal that silently compensates for double-counted rows. The conclusion is a design rule: the pipeline computes every figure in code and writes values, never inherited formulas.",
        },
        {
          icon: "cube",
          title: "One instance is not one estimate line",
          body: "A single placed component routinely produces several priced lines — a grade beam is concrete, rebar and formwork at once. Any schema that assumes one element equals one line breaks immediately, which is why the model carries raw measurements only.",
        },
        {
          icon: "route",
          title: "Both deliverables share one source",
          body: "Estimate and schedule are generated from the same component records. That is what makes the numbers agree by construction, and what makes the 4D link to the model possible without a second data path.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 04 */
    {
      kind: "steps",
      id: "process",
      kicker: "The process",
      title: "How a site drawing becomes a schedule",
      lead: "Five stages, each one feeding the next automatically. No step requires re-entering data by hand.",
      layout: "flow",
      steps: [
        {
          number: "01",
          title: "Site layout",
          body: "The starting point is the 2D site drawing produced during design — the same drawing already used across the project today.",
        },
        {
          number: "02",
          title: "Automated reading",
          body: "Every element on the drawing is read and identified automatically: what it is, where it sits, and how it is oriented.",
        },
        {
          number: "03",
          title: "3D model population",
          body: "Each identified element becomes a coordinated 3D component in the Revit model, carrying its own data along with it.",
        },
        {
          number: "04",
          title: "Metadata extraction",
          body: "The finished model becomes the single source of truth — everything downstream is read from it, not re-entered.",
        },
        {
          number: "05",
          title: "Deliverables",
          body: "A cost estimate and a construction schedule are generated directly from the model, in the formats already in use.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 05 */
    {
      kind: "flow",
      id: "pipeline",
      kicker: "Technical process",
      title: "The pipeline, stage by stage",
      lead: "The same process in engineering terms: six modules, the configuration each one reads, and what it hands to the next.",
      note: "Stage 04 is the only code that touches the Revit API. Everything after it runs as plain Python against a documented data structure, so costing and both writers can be developed and verified without opening Revit — which also means a change to the pricing rules never risks the model.",
      nodes: [
        {
          id: "input",
          title: "2D site layout · DWG or DXF",
          status: "artifact",
        },
        {
          id: "preflight",
          stage: "01",
          title: "Layer validation",
          meta: "dxf_preflight/",
          status: "stage",
          detail:
            "Reads the drawing's layer table and reports missing or unexpected layers before anything else runs, so a malformed drawing fails immediately with a readable message instead of halfway through.",
        },
        {
          id: "layers-config",
          title: "expected_layers.json",
          meta: "Layer contract",
          status: "config",
        },
        {
          id: "preflight-out",
          title: "Validation result",
          status: "artifact",
        },
        {
          id: "parsing",
          stage: "02",
          title: "Drawing parsing",
          meta: "input_parsing/",
          status: "stage",
          detail:
            "Classifies drawing entities into component categories and emits one record per element with its insertion point, rotation, outline and source layer.",
        },
        {
          id: "primitives",
          title: "Layout primitives",
          status: "artifact",
        },
        {
          id: "placement",
          stage: "03",
          title: "Family placement",
          meta: "placement_engine/",
          status: "stage",
          detail:
            "Resolves each category to a Revit family, applies spacing and clearance rules, derives dependent components, and writes the shared parameters that carry the measurements.",
        },
        {
          id: "families",
          title: "Family library · *.rfa",
          meta: "One file per component type",
          status: "config",
        },
        {
          id: "document",
          title: "Coordinated Revit model",
          status: "artifact",
        },
        {
          id: "extract",
          stage: "04",
          title: "Model data extraction",
          meta: "document_reader",
          status: "stage",
          detail:
            "Walks the open model and reads the shared parameters off every placed instance. The only module that talks to the Revit API.",
        },
        {
          id: "spec",
          title: "spec.json",
          meta: "Shared parameter contract",
          status: "config",
        },
        {
          id: "raw",
          title: "Raw instance measurements",
          status: "artifact",
        },
        {
          id: "costing",
          stage: "05",
          title: "Costing engine",
          meta: "decomposition → aggregation → pricing → sequencing",
          status: "stage",
          detail:
            "Breaks each instance into its priced lines, merges the ones that belong on a single row, applies unit costs and wastage, and resolves construction phase and predecessors.",
        },
        {
          id: "costbook",
          title: "cost_book.json",
          meta: "Unit costs, wastage, rates, markups",
          status: "config",
        },
        {
          id: "records",
          title: "Priced component records",
          status: "artifact",
        },
        {
          id: "excel",
          stage: "06",
          title: "Deliverable writers",
          meta: "estimate/ + schedule/",
          status: "stage",
          detail:
            "Writes both workbooks from the same records, and refuses to save if the two independent roll-ups of the estimate total disagree.",
        },
        {
          id: "estimate-out",
          title: "Estimate breakdown · xlsx",
          status: "artifact",
        },
        {
          id: "schedule-out",
          title: "Construction schedule · xlsx",
          status: "artifact",
        },
        {
          id: "fourd",
          stage: "07",
          title: "Navisworks 4D integration",
          meta: "revit_output/ + TimeLiner",
          status: "stage",
          detail:
            "Saves the coordinated model, exports the Navisworks cache and links it to the generated schedule, so the build sequence plays back against the model. It draws the model from stage 03 and the dates from stage 06 — the same records, so what runs on screen and what is in the workbook cannot drift apart.",
        },
        {
          id: "fourd-out",
          title: "4D sequence · nwd",
          status: "artifact",
        },
      ],
      edges: [
        { from: "input", to: "preflight" },
        { from: "layers-config", to: "preflight", kind: "config" },
        { from: "preflight", to: "preflight-out" },
        { from: "preflight-out", to: "parsing" },
        { from: "parsing", to: "primitives" },
        { from: "primitives", to: "placement" },
        { from: "families", to: "placement", kind: "config" },
        { from: "placement", to: "document" },
        { from: "document", to: "extract" },
        { from: "spec", to: "extract", kind: "config" },
        { from: "extract", to: "raw" },
        { from: "raw", to: "costing" },
        { from: "costbook", to: "costing", kind: "config" },
        { from: "costing", to: "records" },
        { from: "records", to: "excel" },
        { from: "excel", to: "estimate-out" },
        { from: "excel", to: "schedule-out" },
        { from: "document", to: "fourd" },
        { from: "schedule-out", to: "fourd" },
        { from: "fourd", to: "fourd-out" },
      ],
    },

    /* ------------------------------------------------------------------ 06 */
    {
      kind: "cards",
      id: "contracts",
      kicker: "Data contracts",
      title: "The four inputs that govern the pipeline",
      lead: "Each of these is a declared input rather than logic buried in code. They are the points where EcoGen's answers enter the system, and changing behaviour usually means editing one of them, not rewriting a module.",
      columns: 2,
      cards: [
        {
          icon: "layers",
          title: "Layer contract",
          body: "Declares which drawing layers are required, which are recognised but optional, and which are deliberately out of scope. It is what turns an unfamiliar drawing into a clear error instead of a wrong model. Currently derived from the sample drawings and awaiting confirmation of the production format.",
        },
        {
          icon: "nested",
          title: "Family library",
          body: "One Revit family per component type, and the map from a drawing category to the family and type placed for it. This is the input EcoGen owns most directly: the families themselves set what the model is able to represent, so covering a new component type means supplying its family, not changing the placement code.",
        },
        {
          icon: "window",
          title: "Shared parameter contract",
          body: "Defines exactly which measurements each family carries — concrete volume, formwork area, rebar weight, surface area, fence length, and so on. It is authored as one new standard applied identically to every family, not inherited from the conventions each one happens to carry today, because a name or unit that varies between components lands as an inconsistency in the workbook. Deliberately raw quantities only: the model reports what it physically is, and classification, pricing and sequencing are decided downstream where they can be changed without touching the model.",
        },
        {
          icon: "spreadsheet",
          title: "Cost book",
          body: "Unit costs, wastage, crew rates, markups and default construction sequencing in one place. Its values were back-derived from the reference estimate to make the pipeline run end to end, and are explicitly marked provisional until EcoGen validates them. The book records one source for the whole set today; giving each figure its own origin and the component it prices is what makes a number in the workbook traceable back to the object that produced it.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 07 */
    {
      kind: "split",
      id: "status",
      kicker: "Progress",
      title: "Where this stands today",
      lead: "Solid lines mark what has already been tested against real data. Dashed lines mark what is planned next — the same convention a drawing itself uses for built versus proposed.",
      columns: [
        {
          title: "Validated",
          tone: "solid",
          items: [
            "Real site drawings can be read and classified reliably, end to end",
            "Tested against multiple real layout variants, not just one",
            "A data inconsistency in the source drawings was caught during Discovery",
            "Model data extraction runs against a live Revit document",
            "Costing produces the full priced line set from raw measurements",
            "Both workbooks generate in seconds, in the client's own formats",
            "The estimate refuses to save if its two totals disagree",
          ],
        },
        {
          title: "Next phase",
          tone: "dashed",
          items: [
            "Reading the drawing into structured layout records",
            "Placing the 3D components inside the model",
            "Building the standalone family library",
            "Running the full chain against one real layout, start to finish",
            "Packaging the tool for installation on EcoGen machines",
            "Model and Navisworks export, and the 4D link to the schedule",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 08 */
    {
      kind: "cards",
      id: "deliverables",
      kicker: "Deliverables",
      title: "What the pipeline produces",
      lead: "It all ships as one extension for Revit 2027 — the team works from a tab on the ribbon and never leaves Revit. The output formats were reverse-engineered from EcoGen's own reference files, so the results drop into the existing process rather than replacing it.",
      columns: 3,
      cards: [
        {
          icon: "cpu",
          title: "A Revit 2027 extension",
          body: "The deliverable itself: a tab on the Revit ribbon with one button to generate the model and one to export the workbooks. No second application to open, no manual export step, nothing to wire up per project. It installs once per machine and the team stays where it already works.",
        },
        {
          icon: "spreadsheet",
          title: "Cost estimate breakdown",
          body: "A workbook with a summary sheet rolled up by CSI division and a detailed estimate reproducing the reference column structure line by line: quantities, wastage, unit and total material cost, manhours, crew rate, labour cost and item total, closing with subtotals, markups and the total bid.",
        },
        {
          icon: "calendar",
          title: "Construction schedule",
          body: "A three-level work breakdown — project, construction phase, activity — with durations, calculated start and finish dates, and total float from a standard critical-path pass. Working calendar is configurable at five, six or seven days per week with an explicit holiday list.",
        },
        {
          icon: "cube",
          title: "Coordinated Revit model",
          body: "The populated model itself, with every placed component carrying its own measurements. It is the single source of truth the two workbooks are read from, and it remains usable as an ordinary Revit model.",
        },
        {
          icon: "route",
          title: "4D Navisworks integration",
          body: "The coordinated model exported as a Navisworks cache and linked to the generated schedule in TimeLiner, so the construction sequence can be played back against the model. Because both come from the same component records, the simulation and the workbook cannot disagree.",
        },
        {
          icon: "grid",
          title: "Fill-in templates",
          body: "The values that change between projects — unit costs, crew rates, durations, the working calendar — live in plain templates your team edits, not in code. Blank versions ship with the extension, so updating a rate or a holiday list never needs a developer.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 09 */
    {
      kind: "table",
      id: "stack",
      kicker: "Stack",
      title: "Tools, licenses and software",
      lead: "Everything the pipeline runs on, what it costs, and who it belongs to. All of it is EcoGen's: the automation adds no new commercial licence, it is built on the Autodesk software EcoGen already runs plus open-source components, and the code written for this engagement is transferred to EcoGen rather than licensed back.",
      columns: [
        { key: "component", label: "Component", emphasis: true },
        { key: "version", label: "Version" },
        { key: "license", label: "License" },
        { key: "cost", label: "Cost to EcoGen" },
        { key: "provider", label: "Owned by" },
        { key: "purpose", label: "Used for" },
      ],
      rows: [
        {
          component: "Autodesk Revit",
          version: "2027",
          license: "Commercial subscription",
          cost: "Existing licence",
          provider: "EcoGen / Fluence",
          purpose: "Host application for the model and the automation add-in",
        },
        {
          component: "pyRevit",
          version: "Current release",
          license: "Open source (GPL-3.0)",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Runs the automation from a Revit ribbon tab, no compiled add-in required",
        },
        {
          component: "Python",
          version: "3.9 or later",
          license: "Open source (PSF)",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Language of the pipeline, outside and inside Revit",
        },
        {
          component: "openpyxl",
          version: "3.1 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Writes both workbooks without needing Excel installed",
        },
        {
          component: "ezdxf",
          version: "1.1 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Reads the site drawing and its layer table",
        },
        {
          component: "pytest",
          version: "7.4 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Automated test suite — development only, not installed on EcoGen machines",
        },
        {
          component: "Autodesk Navisworks Manage",
          version: "Matching Revit 2027",
          license: "Commercial subscription",
          cost: "Existing licence",
          provider: "EcoGen / Fluence",
          purpose: "4D sequencing: links the generated schedule to the model in TimeLiner",
        },
        {
          component: "AutoCAD or ODA File Converter",
          version: "Current release",
          license: "Commercial / free converter",
          cost: "Only if drawings arrive as DWG",
          provider: "EcoGen / Fluence",
          purpose: "Conversion step if the production format is DWG rather than DXF",
        },
        {
          component: "Git and a private repository",
          version: "—",
          license: "Hosted service",
          cost: "Free",
          provider: "EcoGen / Fluence",
          purpose: "Version control and controlled storage of project material",
        },
        {
          component: "Automation pipeline code",
          version: "0.1.0",
          license: "Proprietary — transferred to EcoGen",
          cost: "Included in the engagement",
          provider: "EcoGen / Fluence",
          purpose: "The automation itself: validation, extraction, costing and both writers",
        },
      ],
      note: "On ownership: the subscriptions, the installed copies, the repository and everything produced for this engagement — pipeline code, Revit families, configuration files — belong to EcoGen. R2ch-Tech retains no licence over them and nothing is rented back. The open-source components stay under their own upstream licences, shown in the License column, which is what makes them free to use and to keep. Two technical constraints are worth noting now rather than at handover. First, the target is Revit 2027 — a release recent enough that pyRevit support for it needs to be confirmed before Phase 2 hardens; pyRevit support for a given Revit release usually arrives after that release ships, and this is the risk item to track. Second, pyRevit runs its own bundled Python interpreter, separate from the system installation, so the spreadsheet library has to be installed into that interpreter as part of the deployment step.",
    },

    /* ------------------------------------------------------------------ 10 */
    {
      kind: "timeline",
      id: "roadmap",
      kicker: "Roadmap",
      title: "The three phases of the engagement",
      lead: "Seven weeks end to end. Phase 2 cannot start cleanly until the five blocking questions below are answered — everything after that is sequencing, not uncertainty.",
      phases: [
        {
          label: "Phase 1",
          dates: "July 27 – August 7, 2026",
          title: "Discovery",
          state: "active",
          items: [
            "Presentation of concrete research on the process to be automated",
            "A website documenting the process, including a list of tools, licenses and software to be used",
            "Precise definition of the technical process to be developed in the subsequent phases",
            "Review session: August 5, 2026",
            "Final delivery: August 7, 2026",
          ],
        },
        {
          label: "Phase 2",
          dates: "August 10 – 28, 2026",
          title: "MVP / core automation",
          state: "next",
          items: [
            "Development of a Minimum Viable Product: a pipeline and/or stack of scripts automating the requested process",
            "A functional demonstration of the system",
            "Verification that the system operates in accordance with the requirements defined in Phase 1",
            "Review session: August 28, 2026",
          ],
        },
        {
          label: "Phase 3",
          dates: "August 31 – September 18, 2026",
          title: "Refinement and handover",
          state: "next",
          items: [
            "Refinement of the developed system",
            "Delivery of scripts ready for implementation (plug-and-play), fully documented and operating at 100% functionality",
            "Metadata-driven quantity, cost and construction-schedule exports (CSV/Excel), generated automatically from the model metadata",
            "A training and handover session with the EcoGen team",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 11 */
    {
      kind: "checklist",
      id: "requests",
      kicker: "Material",
      title: "What we need from EcoGen",
      lead: "Files and access, so that Phase 2 starts on solid ground. These are separate from the questions in the next section: this is what we need to receive, that is what we need confirmed.",
      note: "None of these has to arrive all at once. The drawing items are the ones that gate the start of Phase 2; the cost and schedule data can follow while geometry work is under way, as long as it lands before the numbers are quoted anywhere.",
      groups: [
        {
          id: "drawings",
          category: "Drawings",
          items: [
            {
              title: "Consistent layer naming",
              body: "Confirmation that every site drawing follows the same naming convention we have tested against.",
            },
            {
              title: "The final production DXF, and a date for it",
              body: "The drawing every future project will follow, covering every element type expected on a real site rather than only the most common ones. Everything downstream is standardised against it — the layer contract, the parser, the element mapping — so the sooner it is fixed, the sooner the workflow stops being written against a moving target.",
            },
            {
              title: "Confirmation of drawing style",
              body: "That future drawings are produced the same way — placed components, not raw exploded geometry.",
            },
          ],
        },
        {
          id: "components",
          category: "Components",
          items: [
            {
              title: "Confirmed element-to-component mapping",
              body: "Which drawing elements correspond to which 3D components, confirmed once and locked in.",
            },
            {
              title: "Clean, self-contained component families",
              body: "Each component delivered as one standalone family file, with its adjustable properties exposed, rather than an entire project broken up and divided across multiple linked or nested families. We would then add our own shared parameter set on top, applied identically across every family, and leave the geometry as you built it.",
            },
            {
              title: "Cabling and connection logic",
              body: "How the equipment is actually wired together: which runs connect to what, the routing and clearance rules the conduit follows, and the sizing conventions behind them. Phase 2 needs it to model the connections rather than only the objects, and it is what turns the raceway scope question into geometry that can be placed.",
            },
          ],
        },
        {
          id: "figures",
          category: "Cost and schedule",
          items: [
            {
              title: "Your cost data, and where each figure comes from",
              body: "The unit costs, crew rates, wastage and markups you actually bid with — and, alongside each one, its origin and the component it attaches to. That list is what lets a family be wired to the cost lines it produces, so every number in the workbook traces back to an object in the model instead of to figures we reverse-engineered from one reference sample.",
            },
            {
              title: "Your sequencing data, and what drives each duration",
              body: "Real durations and predecessor logic per activity type, with the basis behind each one and the component or quantity that drives it. Same reason as the cost list: the schedule a family feeds has to be built on your construction logic, not on placeholders, and each date has to trace back to something in the model.",
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 12 */
    {
      kind: "qa",
      id: "questions",
      kicker: "Open questions",
      title: "Questions to resolve with EcoGen",
      lead: "These are the decisions only EcoGen can make. Each one is tied to a specific part of the pipeline, and each answer either unblocks work or replaces a provisional value with a real one. Five of them block the start of Phase 2.",
      note: "This list is the agenda for the August 5 review session. Until the blocking items are answered, geometry work cannot start against a stable target; until the costing and schedule items are answered, the numbers the pipeline produces remain structurally correct but based on provisional inputs.",
      groups: [
        {
          id: "dxf",
          category: "Drawing format",
          questions: [
            {
              id: "Q-01",
              priority: "Blocking",
              question:
                "When can we have the final production DXF — the one every future drawing will follow?",
              why: "This is not a question of which sample is the better one. The layer contract, the parser and the element mapping are all standardised against a single format, and the whole workflow is written once against it. What we need is that file, and a date for it.",
            },
            {
              id: "Q-02",
              priority: "Blocking",
              question:
                "What is the layer naming convention used in production, and is it enforced across projects?",
              why: "Element identification runs off layer names. If they vary per project or per author, the parser needs a mapping step rather than a fixed contract. A convention that is genuinely enforced also settles the question above: it is what makes any drawing following it the production format.",
            },
          ],
        },
        {
          id: "scope",
          category: "Scope",
          questions: [
            {
              id: "Q-03",
              priority: "Blocking",
              question:
                "Are the families we already have the final ones, and if not, when is the finished library ready?",
              why: "Phase 2 places what the library contains, so it has to be written against the final version. If the components we hold are still provisional, or more are on the way, every placement rule and every parameter written against them is redone when they change. A date for the finished library is what makes the geometry work schedulable.",
            },
            {
              id: "Q-04",
              priority: "High",
              question:
                "Are the cabling rules ready — families, types and connection logic — or does that work start with us?",
              why: "Phase 2 has to model connections, not only objects. If the routing rules, the cable and conduit types and the connection logic already exist, we implement them. If they do not, defining them becomes part of the phase and has to be planned as such.",
            },
            {
              id: "Q-05",
              priority: "High",
              question:
                "Can we author the family metadata to our own standard, rather than keeping whatever conventions the families carry today?",
              why: "The measurements a family exposes have to be identical in name and unit across every component, or the inconsistency lands straight in the workbooks. We would add one shared parameter set, applied the same way everywhere, and leave the geometry untouched.",
            },
            {
              id: "Q-06",
              priority: "Medium",
              question:
                "Are transformers and electrical raceway in scope for this estimate?",
              why: "They exist in the drawings and in the family library but are currently excluded. Including them adds a CSI division, new families and new cost lines.",
            },
            {
              id: "Q-07",
              priority: "Medium",
              question:
                "Can we treat the DXF as the single source of truth for the site?",
              why: "That is the assumption the pipeline is built on: the drawing is read, and the model, the estimate and the schedule all follow from it. It works in our favour — one file drives everything — but it also means any change to the drawing convention, however small, propagates through the whole chain.",
            },
          ],
        },
        {
          id: "cost",
          category: "Cost basis",
          questions: [
            {
              id: "Q-08",
              priority: "Blocking",
              question:
                "Can you share the complete list of where each of your costs comes from?",
              why: "Every figure in the cost book today was back-derived from a single reference workbook, and the book records one source for all of it. A list of the actual origins — price book, supplier quote, subcontractor bid, historical job — is what lets each figure be traced, updated and defended instead of inherited.",
            },
            {
              id: "Q-09",
              priority: "High",
              question: "Which CSI divisions should the estimate cover in full?",
              why: "The reference sample only exercises four. Any division that appears on a real project but not in the sample needs its classification and lines defined before it can be priced.",
            },
            {
              id: "Q-10",
              priority: "High",
              question:
                "What does each of those costs attach to physically — which component, and measured how?",
              why: "This is the link the whole estimate is built on: object → measurement → cost line → row in the workbook. Once each cost is keyed to a component and a unit, every number in the output can be traced back to the thing in the model that produced it, and a price change becomes one edit rather than a re-derivation.",
            },
            {
              id: "Q-11",
              priority: "Medium",
              question:
                "Should general requirements stay as lump sums, or be broken into manhour-driven lines?",
              why: "Lump sums are simpler and match the sample. Manhour-driven lines make mobilisation and supervision scale with project size instead of staying fixed.",
            },
          ],
        },
        {
          id: "schedule",
          category: "Schedule",
          questions: [
            {
              id: "Q-12",
              priority: "Blocking",
              question:
                "What are the real activity durations and predecessor relationships per activity type?",
              why: "Current values are placeholders. They produce a structurally valid schedule with critical path and float, but the dates themselves are not yet meaningful, so nothing generated from them can be issued.",
            },
            {
              id: "Q-13",
              priority: "High",
              question:
                "Can you share the complete list of how each duration and each precedence is arrived at?",
              why: "The same ask as on the cost side, for the other half of the output. Knowing whether a figure comes from crew productivity, a historical job, a subcontractor commitment or a standard template is what lets it be defended and updated rather than re-guessed.",
            },
            {
              id: "Q-14",
              priority: "High",
              question:
                "What drives each activity's duration — which component, and which quantity?",
              why: "This closes the same loop the cost questions open: object → quantity → activity → row in the schedule. Without it, durations have to be typed in per project; with it, the schedule is generated from the model exactly like the estimate, and the two cannot drift apart.",
            },
            {
              id: "Q-15",
              priority: "Medium",
              question:
                "What is the project start date, the site holiday list, and the working week — five, six or seven days?",
              why: "Every date in the schedule is derived from the working calendar. There is no configuration file for this yet, so it has to be supplied on every run until it is fixed.",
            },
          ],
        },
        {
          id: "placement",
          category: "Placement rules",
          questions: [
            {
              id: "Q-16",
              priority: "High",
              question:
                "What are the real spacing and clearance rules between components — enclosure separation, fence offset, pole spacing?",
              why: "The placement engine has to enforce them when it positions families. Without them it can only reproduce whatever the drawing already shows, and cannot validate or derive anything.",
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 13 */
    {
      kind: "note",
      id: "risks",
      tone: "flag",
      /* A note draws no eyebrow, so the kicker only ever reaches the side
         index — which is what keeps this entry from running the full width of
         the rail. */
      kicker: "Assumptions",
      title: "Assumptions this document rests on",
      body: "Cost and sequencing values in the pipeline today were derived from EcoGen's own reference files so the system could be built and tested end to end. They are structurally correct and arithmetically verified, but they are not validated numbers and should not be quoted from. The same applies to the layer contract and the shared parameter contract: both are provisional until confirmed. Every one of these is covered by a question above.",
    },

    /* ------------------------------------------------------------------ 14 */
    {
      kind: "prose",
      id: "next",
      kicker: "Next step",
      title: "Review on August 5, final delivery on August 7",
      lead: "One session, working through the questions above in priority order, and two days to fold the answers back in.",
      body: [
        "The five blocking items open Phase 2; the costing and schedule items convert the pipeline's provisional inputs into real ones. Answers to the rest can follow in writing afterwards without holding anything up.",
        "If it is useful, we can run the current pipeline live during the session — from a sample drawing's layer validation through to both generated workbooks — so the discussion is about real output rather than description.",
        "Whatever is settled on the 5th is incorporated into the final Phase 1 package delivered on August 7. Anything still open by then is carried into Phase 2 as a named assumption rather than left implicit.",
      ],
      cta: {
        label: "Reply with your questions",
        href: contactHref("EcoGen · Phase 1 review"),
        external: true,
      },
    },
  ],
};

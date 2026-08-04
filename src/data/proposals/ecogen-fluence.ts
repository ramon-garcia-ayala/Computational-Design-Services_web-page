import { contactHref } from "@/data/site";
import type { Proposal } from "./types";

/**
 * EcoGen / Fluence — Automation Pipeline for Revit.
 * Fase 1 (Discovery), entrega del 5 de agosto de 2026, revisión el día 7.
 *
 * Todo el copy del documento vive aquí. Las cifras internas provisionales
 * (unitarios, crew rates, markups) se dejan fuera a propósito: lo que se pide
 * al cliente es que las valide, no que las herede de nuestras estimaciones.
 */
export const ecogenFluence: Proposal = {
  slug: "05.08.2026_ecogen",
  client: "EcoGen / Fluence",
  project: "Automation Pipeline for Revit",
  phase: "Phase 1 — Discovery",
  dateLabel: "August 5, 2026",
  reviewLabel: "Review session · August 7, 2026",
  confidential: true,
  summary:
    "Discovery findings, the technical process, and the open questions for the automated pipeline from 2D site layout to cost estimate and construction schedule.",

  hero: {
    kicker: "Phase 1 — Discovery",
    title:
      "From site layout to cost and schedule — one continuous pipeline",
    accent: "one continuous pipeline",
    lead: "A technical exploration into automating the path from a 2D site drawing to a coordinated 3D model, and from that model directly into cost and schedule deliverables. Prepared for review with EcoGen and Fluence.",
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
          value: "4",
          label: "Real site drawings analysed",
          note: "Two clean layout variants plus one export from the custom layout generator and its recovery file.",
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
          body: "Estimate and schedule are generated from the same component records. That is what makes the numbers agree by construction, and what later makes a 4D link to the model possible without a second data path.",
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
      lead: "The same five stages in engineering terms, with the configuration files that govern each one and the current build status of every component. Solid means built and tested against real data; dashed means defined but not yet built.",
      note: "The extraction stage is the only code that touches the Revit API. Everything downstream of it runs as plain Python against a documented data structure, which is why costing and both writers could be built and tested before the geometry side exists.",
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
          status: "built",
          detail:
            "Reads the drawing's layer table and reports missing or unexpected layers before anything else runs, so a malformed drawing fails immediately with a readable message instead of halfway through.",
        },
        {
          id: "layers-config",
          title: "expected_layers.json",
          meta: "Layer contract · not yet confirmed",
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
          status: "pending",
          owner: "Geometry",
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
          status: "pending",
          owner: "Geometry",
          detail:
            "Resolves each category to a Revit family, places the instance, applies spacing and clearance rules, derives dependent components and writes the shared parameters that carry the measurements.",
        },
        {
          id: "families",
          title: "Family library · *.rfa",
          meta: "One standalone family per component type",
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
          status: "built",
          detail:
            "Walks the open model and reads the shared parameters off every placed instance. This is the only file in the system that talks to the Revit API.",
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
          status: "built",
          detail:
            "Breaks each instance into its priced lines, merges the ones that belong on a single row, applies unit costs and wastage, and resolves construction phase and predecessors.",
        },
        {
          id: "costbook",
          title: "cost_book.json",
          meta: "Unit costs, wastage, crew rates, markups · provisional",
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
          status: "built",
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
          id: "revitout",
          stage: "07",
          title: "Model export",
          meta: "revit_output/",
          status: "deferred",
          owner: "Geometry",
          detail:
            "Saves the coordinated model and exports the Navisworks cache for 4D sequencing. Only needed if Navisworks is confirmed as part of the deliverable.",
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
        { from: "document", to: "revitout", kind: "optional" },
      ],
    },

    /* ------------------------------------------------------------------ 06 */
    {
      kind: "cards",
      id: "contracts",
      kicker: "Data contracts",
      title: "The four files that govern the pipeline",
      lead: "Each of these is a plain, readable file rather than logic buried in code. They are the points where EcoGen's answers enter the system, and changing behaviour usually means editing one of them, not rewriting a module.",
      columns: 2,
      cards: [
        {
          icon: "layers",
          title: "Layer contract",
          body: "Declares which drawing layers are required, which are recognised but optional, and which are deliberately out of scope. It is what turns an unfamiliar drawing into a clear error instead of a wrong model. Currently derived from the sample drawings and awaiting confirmation of the production format.",
        },
        {
          icon: "window",
          title: "Shared parameter contract",
          body: "Defines exactly which measurements each family carries — concrete volume, formwork area, rebar weight, surface area, fence length, and so on. Deliberately raw quantities only: the model reports what it physically is, and classification, pricing and sequencing are decided downstream where they can be changed without touching the model.",
        },
        {
          icon: "spreadsheet",
          title: "Cost book",
          body: "Unit costs, wastage, crew rates, markups and default construction sequencing in one place. Its values were back-derived from the reference estimate to make the pipeline run end to end, and are explicitly marked provisional until EcoGen validates them.",
        },
        {
          icon: "cube",
          title: "Component record",
          body: "The structure that joins the two halves of the system. It carries identification, CSI classification, quantities, cost inputs and sequencing for one priced line. Because it is a documented structure rather than a live Revit connection, the entire downstream half runs and is tested in seconds without opening Revit.",
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
            "Model and Navisworks export, if 4D is confirmed as in scope",
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
      lead: "The output formats were reverse-engineered from EcoGen's own reference files, so the results drop into the existing process rather than replacing it.",
      columns: 2,
      cards: [
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
          title: "Optional 4D handover",
          body: "A Navisworks cache or IFC export for linking the generated schedule to the model in TimeLiner. Deferred until the scope question on Navisworks is answered, and not a prerequisite for anything above.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 09 */
    {
      kind: "table",
      id: "stack",
      kicker: "Stack",
      title: "Tools, licenses and software",
      lead: "Everything the pipeline runs on, what it costs, and who provides it. The automation itself adds no new commercial licence: it is built on the Autodesk software EcoGen already runs, plus open-source components.",
      columns: [
        { key: "component", label: "Component", emphasis: true },
        { key: "version", label: "Version" },
        { key: "license", label: "License" },
        { key: "cost", label: "Cost to EcoGen" },
        { key: "provider", label: "Provided by" },
        { key: "purpose", label: "Used for" },
      ],
      rows: [
        {
          component: "Autodesk Revit",
          version: "Target version to be confirmed",
          license: "Commercial subscription",
          cost: "Existing licence",
          provider: "EcoGen",
          purpose: "Host application for the model and the automation add-in",
        },
        {
          component: "pyRevit",
          version: "Current release",
          license: "Open source (GPL-3.0)",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Runs the automation from a Revit ribbon tab, no compiled add-in required",
        },
        {
          component: "Python",
          version: "3.9 or later",
          license: "Open source (PSF)",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Language of the pipeline, outside and inside Revit",
        },
        {
          component: "openpyxl",
          version: "3.1 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Writes both workbooks without needing Excel installed",
        },
        {
          component: "ezdxf",
          version: "1.1 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Reads the site drawing and its layer table",
        },
        {
          component: "pytest",
          version: "7.4 or later",
          license: "Open source (MIT)",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Automated test suite — development only, not installed on EcoGen machines",
        },
        {
          component: "Autodesk Navisworks Manage",
          version: "Matching the Revit version",
          license: "Commercial subscription",
          cost: "Only if 4D is confirmed",
          provider: "EcoGen",
          purpose: "Optional 4D sequencing from the generated schedule",
        },
        {
          component: "AutoCAD or ODA File Converter",
          version: "Current release",
          license: "Commercial / free converter",
          cost: "Only if drawings arrive as DWG",
          provider: "EcoGen",
          purpose: "Conversion step if the production format is DWG rather than DXF",
        },
        {
          component: "Git and a private repository",
          version: "—",
          license: "Hosted service",
          cost: "Free",
          provider: "R2ch-Tech",
          purpose: "Version control and controlled storage of project material",
        },
        {
          component: "R2ch-Tech pipeline code",
          version: "0.1.0",
          license: "Proprietary",
          cost: "Usage terms to be agreed",
          provider: "R2ch-Tech",
          purpose: "The automation itself: validation, extraction, costing and both writers",
        },
      ],
      note: "Two technical constraints worth noting now rather than at handover. First, pyRevit support for a given Revit release usually arrives after that release ships, so the target Revit version needs confirming before Phase 2 hardens. Second, pyRevit runs its own bundled Python interpreter, separate from the system installation, so the spreadsheet library has to be installed into that interpreter as part of the deployment step.",
    },

    /* ------------------------------------------------------------------ 10 */
    {
      kind: "timeline",
      id: "roadmap",
      kicker: "Roadmap",
      title: "How the remaining work is phased",
      lead: "Phase 2 cannot start cleanly until the four blocking questions below are answered. Everything after that is sequencing, not uncertainty.",
      phases: [
        {
          label: "Phase 1",
          dates: "July 27 – August 7, 2026",
          title: "Discovery",
          state: "active",
          items: [
            "Research on the real drawings, families and reference workbooks",
            "Definition of the technical process and its data contracts",
            "This documentation site",
            "Review session on August 7",
          ],
        },
        {
          label: "Phase 2",
          dates: "Following Discovery sign-off",
          title: "Geometry and model generation",
          state: "next",
          items: [
            "Drawing parser: entities and layers into structured layout records",
            "Standalone family library, one file per component type",
            "Placement engine with confirmed spacing and clearance rules",
            "Shared parameters bound inside each family so they travel with it",
          ],
        },
        {
          label: "Phase 3",
          dates: "After the first generated model",
          title: "Integration and validation",
          state: "next",
          items: [
            "Full chain run against one real layout, drawing to workbooks",
            "Estimate and schedule reconciled against a known EcoGen project",
            "Cost book and sequencing values replaced with validated data",
            "Error handling hardened against real-world drawing variation",
          ],
        },
        {
          label: "Phase 4",
          dates: "Handover",
          title: "Packaging and rollout",
          state: "next",
          items: [
            "Installable Revit extension package for EcoGen machines",
            "Operating documentation and a walkthrough session",
            "Optional Navisworks export for 4D sequencing",
            "Agreed support and update path",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 11 */
    {
      kind: "cards",
      id: "requests",
      kicker: "Material",
      title: "What we need from EcoGen",
      lead: "Files and access, so that Phase 2 starts on solid ground. These are separate from the questions in the next section: this is what we need to receive, that is what we need confirmed.",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "Consistent layer naming",
          body: "Confirmation that every site drawing follows the same naming convention we have tested against.",
        },
        {
          icon: "grid",
          title: "A more complete sample drawing",
          body: "One that includes every element type expected in a real project, not just the most common ones.",
        },
        {
          icon: "cropMarks",
          title: "Confirmed element-to-component mapping",
          body: "Which drawing elements correspond to which 3D components, confirmed once and locked in.",
        },
        {
          icon: "rules",
          title: "Confirmation of drawing style",
          body: "That future drawings are produced the same way — placed components, not raw exploded geometry.",
        },
        {
          icon: "window",
          title: "Access to the real component library",
          body: "The component types actually used on projects, and their key adjustable properties.",
        },
        {
          icon: "mapPin",
          title: "Confirmation of a fixed reference point",
          body: "Whether every site drawing's origin is tied to a known, fixed point on the site — the way it appeared in the drawings reviewed so far — or whether that is not guaranteed going forward.",
        },
        {
          icon: "nested",
          title: "Clean, self-contained component families",
          body: "Each component delivered as one standalone family file, rather than an entire project broken up and divided across multiple linked or nested families.",
        },
        {
          icon: "spreadsheet",
          title: "One completed reference project",
          body: "A finished estimate and schedule for a project we can run the pipeline against, so the generated numbers can be reconciled against a known result.",
        },
        {
          icon: "cpu",
          title: "A test machine or environment",
          body: "One workstation with the target Revit version where the extension can be installed and validated before rollout.",
        },
      ],
    },

    /* ------------------------------------------------------------------ 12 */
    {
      kind: "qa",
      id: "questions",
      kicker: "Open questions",
      title: "Questions to resolve with EcoGen",
      lead: "These are the decisions only EcoGen can make. Each one is tied to a specific part of the pipeline, and each answer either unblocks work or replaces a provisional value with a real one. Four of them block the start of Phase 2.",
      note: "This list is the agenda for the August 7 review session. Until the blocking items are answered, geometry work cannot start against a stable target; until the costing and schedule items are answered, the numbers the pipeline produces remain structurally correct but based on provisional inputs.",
      groups: [
        {
          id: "dxf",
          category: "Drawing format",
          questions: [
            {
              id: "Q-01",
              priority: "Blocking",
              question:
                "Which drawing format is the production one — the clean sixteen-layer layout, or the export from the custom layout generator?",
              why: "The two differ by nearly three hundred layers and mix different kinds of content. The parser has to be written against one of them, and the layer contract has to match it.",
            },
            {
              id: "Q-02",
              priority: "Blocking",
              question:
                "What is the layer naming convention used in production, and is it enforced across projects?",
              why: "Element identification runs off layer names. If they vary per project or per author, the parser needs a mapping step rather than a fixed contract.",
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
                "Are transformers and electrical raceway in scope for this estimate?",
              why: "They exist in the drawings and in the family library but are currently excluded. Including them adds a CSI division, new families and new cost lines, so it changes the shape of Phase 2 rather than just its volume.",
            },
            {
              id: "Q-04",
              priority: "High",
              question:
                "Are the battery enclosure and the light fixture themselves in the contractor's cost scope, or owner-supplied equipment?",
              why: "Today the pipeline prices only the concrete work under them. If the units are in scope, they need their own cost lines and their own procurement sequencing.",
            },
          ],
        },
        {
          id: "placement",
          category: "Placement rules",
          questions: [
            {
              id: "Q-05",
              priority: "Blocking",
              question:
                "What are the real spacing and clearance rules between components — enclosure separation, fence offset, pole spacing?",
              why: "The placement engine has to enforce them when it positions families. Without them it can only reproduce whatever the drawing already shows, and cannot validate or derive anything.",
            },
          ],
        },
        {
          id: "cost",
          category: "Cost basis",
          questions: [
            {
              id: "Q-06",
              priority: "High",
              question:
                "Which CSI divisions should the estimate cover in full?",
              why: "The reference sample only exercises four. Any division that appears on a real project but not in the sample needs its classification and lines defined before it can be priced.",
            },
            {
              id: "Q-07",
              priority: "High",
              question:
                "What are the current crew rates, and do they vary by trade, shift or region?",
              why: "Labour cost is crew rate multiplied by manhours on every single line. A rate structure that varies means the cost book needs a dimension it does not have today.",
            },
            {
              id: "Q-08",
              priority: "High",
              question:
                "What wastage percentage applies to each material family?",
              why: "Wastage is applied before pricing, so it moves both material and labour totals. The current values were inferred from the sample and are effectively one flat figure.",
            },
            {
              id: "Q-09",
              priority: "High",
              question:
                "What are the current markup rates, and does the tax line apply to material only?",
              why: "Markups are applied per division and again on the project roll-up. Whether tax applies to material alone changes both the division totals and the final bid.",
            },
            {
              id: "Q-10",
              priority: "High",
              question:
                "What rebar density should be assumed per component category?",
              why: "Rebar weight is derived from concrete volume where it is not modelled explicitly. The current densities were back-derived from the sample and are the least defensible numbers in the cost book.",
            },
            {
              id: "Q-11",
              priority: "Medium",
              question:
                "Should the medium-voltage skid pad carry its own rebar line, or is that already embedded in its concrete unit cost?",
              why: "Getting this wrong double-counts reinforcement on every skid in the project.",
            },
            {
              id: "Q-12",
              priority: "Medium",
              question:
                "Should general requirements stay as lump sums, or be broken into manhour-driven lines?",
              why: "Lump sums are simpler and match the sample. Manhour-driven lines make mobilisation and supervision scale with project size instead of staying fixed.",
            },
            {
              id: "Q-13",
              priority: "Medium",
              question:
                "What escalation or bid-validity date are the unit costs pegged to?",
              why: "Without a reference date, a generated estimate carries no indication of how long its pricing is good for.",
            },
            {
              id: "Q-14",
              priority: "Low",
              question:
                "How should excavation split between backfill and haul-off?",
              why: "Excavation is aggregated site-wide into a single line, and there is no example in the reference material from which to derive the ratio.",
            },
          ],
        },
        {
          id: "schedule",
          category: "Schedule",
          questions: [
            {
              id: "Q-15",
              priority: "High",
              question:
                "What are the real activity durations and predecessor relationships per activity type?",
              why: "Current values are placeholders. They produce a structurally valid schedule with critical path and float, but the dates themselves are not yet meaningful.",
            },
            {
              id: "Q-16",
              priority: "High",
              question:
                "What is the project start date, the site holiday list, and the working week — five, six or seven days?",
              why: "Every date in the schedule is derived from the working calendar. There is no configuration file for this yet, so it has to be supplied on every run until it is fixed.",
            },
            {
              id: "Q-17",
              priority: "Medium",
              question:
                "Does the schedule need resource loading, or are dates and float enough?",
              why: "Resource loading means carrying crew assignments through from the estimate into the schedule, which is additional scope rather than a setting.",
            },
          ],
        },
        {
          id: "delivery",
          category: "Delivery",
          questions: [
            {
              id: "Q-18",
              priority: "Medium",
              question:
                "Which Revit version should the tool target, and is Navisworks part of the deliverable?",
              why: "The Revit version determines which pyRevit release is usable and when the extension can be validated. The Navisworks answer decides whether the model export stage is built at all.",
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
      title: "Assumptions this document rests on",
      body: "Cost and sequencing values in the pipeline today were derived from EcoGen's own reference files so the system could be built and tested end to end. They are structurally correct and arithmetically verified, but they are not validated numbers and should not be quoted from. The same applies to the layer contract and the shared parameter contract: both are provisional until confirmed. Every one of these is covered by a question above.",
    },

    /* ------------------------------------------------------------------ 14 */
    {
      kind: "prose",
      id: "next",
      kicker: "Next step",
      title: "The August 7 review",
      lead: "One session, working through the questions above in priority order.",
      body: [
        "The four blocking items open Phase 2; the costing and schedule items convert the pipeline's provisional inputs into real ones. Answers to the rest can follow in writing afterwards without holding anything up.",
        "If it is useful, we can run the current pipeline live during the session — from a sample drawing's layer validation through to both generated workbooks — so the discussion is about real output rather than description.",
      ],
      cta: {
        label: "Reply with your questions",
        href: contactHref("EcoGen · Phase 1 review"),
        external: true,
      },
    },
  ],
};

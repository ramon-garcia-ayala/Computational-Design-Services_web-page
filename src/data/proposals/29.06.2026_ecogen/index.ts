import { contactHref } from "@/data/site";
import type { Proposal } from "../types";

/**
 * Ecogen — Automated 3D Revit Model Generation from 2D Solar+BESS Layouts.
 * Issued 29 June 2026, valid until 15 July 2026.
 *
 * This is the original commercial proposal, ported from the previous site into
 * the block system. It is the engagement that the Phase 1 Discovery document of
 * 5 August reports back on — keep both: this one states what was sold, that one
 * states what was found.
 */
export const ecogen20260629: Proposal = {
  slug: "29.06.2026_ecogen",
  client: "Ecogen",
  project: "Automated 3D Revit Model Generation",
  phase: "Commercial proposal",
  dateLabel: "June 29, 2026",
  reviewLabel: "Valid until July 15, 2026",
  confidential: true,
  summary:
    "Parametric automation pipeline for Battery Energy Storage System site design: from 2D site plan to coordinated BIM model in minutes.",

  hero: {
    kicker: "Commercial proposal",
    title: "From a 2D site plan to a coordinated BIM model in minutes",
    accent: "in minutes",
    lead: "Parametric automation for Solar+BESS site design. We propose a system that reads your 2D layout and generates the 3D Revit model automatically — no manual modelling, no re-work between design iterations.",
  },

  blocks: [
    {
      kind: "prose",
      id: "summary",
      kicker: "Summary",
      title: "What we propose to build",
      body: [
        "We propose building an automation system that takes a 2D site layout — such as Ecogen's Solar+BESS installation drawings — and generates a conceptual 3D Revit model automatically. The system identifies repeatable battery module footprints from the input drawing, places parametric Revit families at the correct positions, and produces a structured BIM model ready for coordination and client presentations.",
        "No manual 3D modelling. No re-work between design iterations.",
      ],
    },

    {
      kind: "prose",
      id: "challenge",
      kicker: "The problem",
      title: "Every iteration rebuilds the model by hand",
      body: [
        "Solar+BESS site design involves placing dozens of identical battery capsule units in precise spatial configurations. Every design iteration requires manually rebuilding the 3D Revit model from scratch — a process that is slow, error-prone, and creates persistent discrepancies between the 2D CAD layout and the 3D BIM representation.",
      ],
    },

    {
      kind: "prose",
      id: "approach",
      kicker: "Approach",
      title: "One script, re-run on every layout change",
      body: [
        "We will build a script-driven pipeline using the Revit API (Python and pyRevit) that reads a 2D DWG or a structured coordinate input and programmatically places parametric Revit families for each module. All battery capsule types will be modelled as intelligent, reusable families: change the 2D layout, re-run the script, get an updated 3D model.",
        "As an advanced option, we can also deliver a Grasshopper and Rhino.Inside.Revit workflow for teams that prefer a visual programming environment.",
      ],
    },

    {
      kind: "figure",
      id: "model-generation",
      kicker: "In one picture",
      title: "Automated model generation",
      lead: "A 2D site layout becomes a coordinated Revit model without anyone redrawing it.",
      src: "/proposals/29.06.2026_ecogen/anim/model-generation/model-generation.svg",
      poster:
        "/proposals/29.06.2026_ecogen/anim/model-generation/model-generation.poster.svg",
      download: {
        label: "Animation (GIF)",
        file: "/proposals/29.06.2026_ecogen/anim/model-generation/model-generation.gif",
      },
      alt: "Animated diagram on a white background. Flat plates appear one by one across an isometric site grid, then rise into three-dimensional volumes of varying height, resolving into a massing model. Three labelled stages run in sequence: 2D site layout, extruding geometry, 3D Revit model.",
      caption:
        "Each stage is a scripted step. The layout you send is the only input.",
      tags: ["revit", "automation", "geometry", "massing", "model-generation"],
    },

    {
      kind: "steps",
      id: "workflow",
      kicker: "Workflow",
      title: "How the pipeline runs",
      lead: "Four stages, from the drawing you already produce to the model you can coordinate with.",
      layout: "flow",
      steps: [
        {
          number: "01",
          title: "2D site plan",
          body: "The input: a DWG, a PDF, or a structured set of coordinates — the drawing already produced during design.",
        },
        {
          number: "02",
          title: "Input parser",
          body: "Python and ezdxf read the drawing and extract module positions, orientations and types into a clean placement manifest.",
        },
        {
          number: "03",
          title: "Placement engine",
          body: "The Revit API, driven from pyRevit, places the parametric family for each module at the right position, orientation and elevation.",
        },
        {
          number: "04",
          title: "3D Revit model",
          body: "A structured BIM model, ready for coordination and client presentation, regenerated in full on every layout change.",
        },
      ],
    },

    {
      kind: "split",
      id: "stack",
      kicker: "Stack",
      title: "Tools and licenses",
      lead: "The primary stack is what we build on. The alternatives are available if your team prefers a visual programming environment.",
      columns: [
        {
          title: "Primary",
          tone: "solid",
          items: [
            "Python 3 — the language of the pipeline",
            "pyRevit — runs the automation from the Revit ribbon, open source",
            "Revit API — creates and places the model elements",
            "ezdxf — reads the 2D drawing and its layers, open source",
          ],
        },
        {
          title: "Alternatives on request",
          tone: "dashed",
          items: [
            "Grasshopper — visual programming, if preferred over scripts",
            "Rhino.Inside.Revit — Grasshopper driving Revit directly",
            "Dynamo — Revit's own visual environment",
          ],
        },
      ],
    },

    {
      kind: "cards",
      id: "services",
      kicker: "Scope",
      title: "What is included",
      columns: 2,
      cards: [
        {
          icon: "cpu",
          title: "Revit API development",
          body: "Python scripts using pyRevit and the Revit API to programmatically create, place and configure Revit elements from external input data.",
        },
        {
          icon: "cube",
          title: "Parametric BIM family creation",
          body: "Custom Revit families for Solar+BESS modules — battery capsules, inverters, step-up transformers — with adjustable parameters for dimensions and configurations.",
        },
        {
          icon: "layers",
          title: "2D input parsing",
          body: "Logic to extract module positions, orientations and types from DWG files or from a structured data format (CSV/JSON) derived from the 2D site plan.",
        },
        {
          icon: "route",
          title: "End-to-end automation pipeline",
          body: "Integrated workflow: load the 2D input, validate it, place the Revit families, generate a model report. Built to run repeatedly with minimal user intervention.",
        },
      ],
    },

    {
      kind: "timeline",
      id: "phases",
      kicker: "Delivery",
      title: "Three phases over twelve weeks",
      phases: [
        {
          label: "Phase 01",
          dates: "Weeks 1 – 3",
          title: "Discovery & technical foundation",
          state: "next",
          items: [
            {
              title: "Kickoff & specification",
              body: "Define battery module types, Revit family requirements, input format and target Revit version.",
            },
            {
              title: "2D plan analysis",
              body: "Map the provided Solar+BESS drawings to identify module placement logic and coordinate system.",
            },
            {
              title: "Dev environment setup",
              body: "pyRevit configuration, project repository and coding conventions established.",
            },
            {
              title: "Prototype Revit family",
              body: "First parametric battery capsule family with core parameters, delivered for client review.",
            },
          ],
        },
        {
          label: "Phase 02",
          dates: "Weeks 4 – 8",
          title: "MVP: core automation",
          state: "next",
          items: [
            {
              title: "2D input parser",
              body: "Script that reads DWG or structured coordinates and outputs a clean placement manifest.",
            },
            {
              title: "Placement engine",
              body: "Revit API automation that places battery capsule families at the correct positions, orientations and elevations.",
            },
            {
              title: "MVP delivery",
              body: "Live demonstration: generate a 3D Revit model from the sample 2D Solar+BESS plan in real time.",
            },
            {
              title: "Feedback session",
              body: "Review session with the Ecogen team to validate output and collect refinement notes.",
            },
          ],
        },
        {
          label: "Phase 03",
          dates: "Weeks 9 – 12",
          title: "Full automation, testing & handover",
          state: "next",
          items: [
            {
              title: "Multi-module support",
              body: "Extend the pipeline to handle multiple module types, ancillary equipment and site-level elements.",
            },
            {
              title: "Robustness & validation",
              body: "Input validation, error messages and edge case handling for production-ready use.",
            },
            {
              title: "User documentation",
              body: "Step-by-step guide: how to prepare the 2D input, run the tool, and extend it with new module types.",
            },
            {
              title: "Training & handover",
              body: "Live walkthrough session with the Ecogen team. All source code and Revit families transferred.",
            },
          ],
        },
      ],
    },

    {
      kind: "pricing",
      id: "investment",
      kicker: "Investment",
      title: "Fixed price, three milestones",
      total: {
        amount: "15,000",
        currency: "USD",
        note: "Billed in three milestone payments. No hourly billing, no surprises — you pay for results, not time logged. Each payment is tied to a concrete deliverable, so you always know what you are getting before the next invoice.",
        breakdown: [
          {
            label: "Phase 01 — Kickoff & foundation, due on contract signing",
            amount: "USD 4,500",
          },
          {
            label: "Phase 02 — MVP delivery, due at end of month 2",
            amount: "USD 5,250",
          },
          {
            label: "Phase 03 — Final delivery & handover",
            amount: "USD 5,250",
          },
        ],
      },
    },

    {
      kind: "docs",
      id: "attachments",
      kicker: "Attachments",
      title: "Files with this proposal",
      docs: [
        {
          label: "Pipeline concept animation",
          file: "/proposals/29.06.2026_ecogen/header.gif",
          note: "The proposed flow, from 2D site plan through the plugin to cost estimate and schedule.",
        },
      ],
    },

    {
      kind: "steps",
      id: "next",
      kicker: "Next steps",
      title: "How to start",
      steps: [
        {
          number: "01",
          body: "Schedule a call this Wednesday to review this proposal and answer any questions.",
        },
        {
          number: "02",
          body: "Approve the proposal and sign the service agreement.",
        },
        {
          number: "03",
          body: "Submit the Phase 01 payment (USD 4,500) to initiate work. The kickoff meeting is booked immediately after.",
        },
        {
          number: "04",
          body: "Share any additional 2D layout files, DWG samples or project references ahead of the kickoff.",
        },
        {
          number: "05",
          body: "Kickoff meeting: finalise battery module specs, Revit version, preferred input format and delivery schedule.",
        },
      ],
    },

    {
      kind: "prose",
      id: "contact",
      kicker: "Questions",
      title: "Talk to us before you decide",
      lead: "This proposal is valid until July 15, 2026.",
      cta: {
        label: "Reply to this proposal",
        href: contactHref("Ecogen · 3D Revit automation proposal"),
        external: true,
      },
    },
  ],
};

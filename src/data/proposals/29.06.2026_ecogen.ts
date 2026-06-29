import type { ProposalData } from "./types";

const proposal: ProposalData = {
  slug: "29.06.2026_ecogen",
  client: "Ecogen",
  projectTitle: "Automated 3D Revit Model Generation from 2D Solar+BESS Layouts",
  projectSubtitle:
    "Parametric automation pipeline for Battery Energy Storage System site design: from 2D site plan to coordinated BIM model in minutes.",
  date: "June 29, 2026",
  preparedBy: "Computational Design Services",
  headerImage: "/proposals/ecogen-header.gif",
  headerStages: [
    { kind: "plan2d", label: "2D Site Plan", sublabel: "DWG / PDF layout", role: "input" },
    { kind: "plugin", label: "UI Plugin", sublabel: "pyRevit · one click", role: "process" },
    { kind: "bim3d", label: "BIM 3D Model", sublabel: "parametric families", role: "process" },
    { kind: "metadata", label: "Metadata", sublabel: "type · qty · capacity", role: "process" },
    { kind: "cost", label: "Cost Estimate", sublabel: "auto quantity takeoff", role: "output" },
    { kind: "schedule", label: "Schedule", sublabel: "phased timeline", role: "output" },
  ],
  summary:
    "We propose building an automation system that takes a 2D site layout (such as Ecogen's Solar+BESS installation drawings) and generates a conceptual 3D Revit model automatically. The system will identify repeatable battery module footprints from the input drawing, place parametric Revit families at the correct positions, and produce a structured BIM model ready for coordination and client presentations. No manual 3D modeling. No re-work between design iterations.",

  challenge:
    "Solar+BESS site design involves placing dozens of identical battery capsule units in precise spatial configurations. Every design iteration requires manually rebuilding the 3D Revit model from scratch, a process that is slow, error-prone, and creates persistent discrepancies between the 2D CAD layout and the 3D BIM representation.",

  approach:
    "We will build a script-driven pipeline using the Revit API (Python/pyRevit) that reads a 2D DWG or structured coordinate input and programmatically places parametric Revit families for each module. All battery capsule types will be modeled as intelligent, reusable families: change the 2D layout, re-run the script, get an updated 3D model. As an advanced option, we can also deliver a Grasshopper + Rhino.Inside.Revit workflow for teams that prefer a visual programming environment.",

  workflow: [
    {
      label: "2D Site Plan",
      sublabel: "DWG / PDF / Coordinates",
      role: "input",
    },
    {
      label: "Input Parser",
      sublabel: "Python · ezdxf",
      role: "process",
    },
    {
      label: "Placement Engine",
      sublabel: "Revit API · pyRevit",
      role: "process",
    },
    {
      label: "3D Revit Model",
      sublabel: "BIM Output · RVT",
      role: "output",
    },
  ],

  techStack: [
    { name: "Python 3", category: "primary" },
    { name: "pyRevit", category: "primary" },
    { name: "Revit API", category: "primary" },
    { name: "ezdxf", category: "primary" },
    { name: "Grasshopper", category: "alternative" },
    { name: "Rhino.Inside.Revit", category: "alternative" },
    { name: "Dynamo", category: "alternative" },
  ],

  services: [
    {
      name: "Revit API Development",
      description:
        "Python scripts using pyRevit and the Revit API to programmatically create, place, and configure Revit elements from external input data.",
    },
    {
      name: "Parametric BIM Family Creation",
      description:
        "Custom Revit families for Solar+BESS modules (battery capsules, inverters, step-up transformers) with adjustable parameters for dimensions and configurations.",
    },
    {
      name: "2D Input Parsing",
      description:
        "Logic to extract module positions, orientations, and types from DWG files or a structured data format (CSV/JSON) derived from the 2D site plan.",
    },
    {
      name: "End-to-End Automation Pipeline",
      description:
        "Integrated workflow: load 2D input, validate, place Revit families, generate model report. Built to run repeatedly with minimal user intervention.",
    },
  ],

  phases: [
    {
      number: "01",
      title: "Discovery & Technical Foundation",
      duration: "Weeks 1 – 3",
      startWeek: 1,
      endWeek: 3,
      deliverables: [
        {
          title: "Kickoff & Specification",
          description:
            "Define battery module types, Revit family requirements, input format, and target Revit version.",
        },
        {
          title: "2D Plan Analysis",
          description:
            "Map the provided Solar BESS 2D drawings to identify module placement logic and coordinate system.",
        },
        {
          title: "Dev Environment Setup",
          description:
            "pyRevit configuration, project repository, and coding conventions established.",
        },
        {
          title: "Prototype Revit Family",
          description:
            "First parametric battery capsule family with core parameters, delivered for client review.",
        },
      ],
    },
    {
      number: "02",
      title: "MVP: Core Automation",
      duration: "Weeks 4 – 8",
      startWeek: 4,
      endWeek: 8,
      deliverables: [
        {
          title: "2D Input Parser",
          description:
            "Script that reads DWG or structured coordinates and outputs a clean placement manifest.",
        },
        {
          title: "Placement Engine",
          description:
            "Revit API automation that places battery capsule families at correct positions, orientations, and elevations.",
        },
        {
          title: "MVP Delivery",
          description:
            "Live demonstration: generate a 3D Revit model from the sample 2D Solar BESS plan in real time.",
        },
        {
          title: "Feedback Session",
          description:
            "Review session with Ecogen team to validate output and collect refinement notes.",
        },
      ],
    },
    {
      number: "03",
      title: "Full Automation, Testing & Handover",
      duration: "Weeks 9 – 12",
      startWeek: 9,
      endWeek: 12,
      deliverables: [
        {
          title: "Multi-Module Support",
          description:
            "Extend the pipeline to handle multiple module types, ancillary equipment, and site-level elements.",
        },
        {
          title: "Robustness & Validation",
          description:
            "Input validation, error messages, and edge case handling for production-ready use.",
        },
        {
          title: "User Documentation",
          description:
            "Step-by-step guide: how to prepare the 2D input, run the tool, and extend it with new module types.",
        },
        {
          title: "Training & Handover",
          description:
            "Live walkthrough session with the Ecogen team. All source code and Revit families transferred.",
        },
      ],
    },
  ],

  investment: {
    total: "15,000",
    currency: "USD",
    note:
      "Billed in three milestone payments, no hourly billing, no surprises. You pay for results, not time logged. Each payment is tied to a concrete deliverable so you always know what you are getting before the next invoice.",
    breakdown: [
      {
        label: "Phase 01: Kickoff & Foundation  (due on contract signing)",
        amount: "USD 4,500",
      },
      {
        label: "Phase 02: MVP Delivery  (due at end of Month 2)",
        amount: "USD 5,250",
      },
      {
        label: "Phase 03: Final Delivery & Handover",
        amount: "USD 5,250",
      },
    ],
  },

  nextSteps: [
    "Schedule a call this Wednesday to review this proposal and answer any questions.",
    "Approve the proposal and sign the service agreement.",
    "Submit the Phase 01 payment (USD 4,500) to initiate work. Kickoff meeting booked immediately after.",
    "Share any additional 2D layout files, DWG samples, or project references ahead of the kickoff.",
    "Kickoff meeting: finalize battery module specs, Revit version, preferred input format, and delivery schedule.",
  ],

  validUntil: "July 15, 2026",
};

export default proposal;

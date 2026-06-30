import type { ProposalData } from "./types";

const proposal: ProposalData = {
  slug: "29.06.2026_reparametrize",
  client: "Reparametrize",
  projectTitle: "Computational Design as a Service",
  projectSubtitle:
    "Embedded expertise for parametric design, landscape automation, and client-facing web tools — without the overhead of a full-time hire.",
  date: "June 29, 2026",
  preparedBy: "Computational Design Services",

  headerStages: [
    { kind: "plan2d",   label: "Your Projects",      sublabel: "Villas · Landscape · Web tools",        role: "input"   },
    { kind: "plugin",   label: "CDS as Your Team",   sublabel: "remote · embedded · zero overhead",     role: "process" },
    { kind: "bim3d",    label: "Parametric Output",  sublabel: "Grasshopper · Rhino · web platforms",   role: "process" },
    { kind: "schedule", label: "Transparent Billing",  sublabel: "more projects = more budget, always",   role: "output"  },
  ],

  summary:
    "Reparametrize is looking to expand its computational capabilities without the commitment and overhead of a full-time hire. We propose three engagement models structured around a simple rule: more complexity and more parallel projects means more budget. Choose a focused single-project retainer, a studio retainer that covers concurrent complex work, or a per-project arrangement with a fixed price locked at signing.",

  challenge:
    "Hiring a computational designer in-house means salary, benefits, onboarding time, and a long-term commitment before you know whether the workload justifies it. At the same time, outsourcing project by project to freelancers means inconsistent quality, context loss between engagements, and no institutional knowledge of your studio's standards and toolset.",

  approach:
    "CDS integrates directly into Reparametrize's workflow as an embedded remote team. We learn your project types, your Grasshopper environment, your client presentation style. Whether you engage us monthly or per project, you get senior computational expertise with zero management overhead, no HR costs, and the ability to scale up or down as your pipeline demands.",

  workflow: [
    {
      label: "Studio Brief",
      sublabel: "project type · scale · timeline",
      role: "input",
    },
    {
      label: "CDS Scoping",
      sublabel: "define deliverables + tools",
      role: "process",
    },
    {
      label: "Design & Build",
      sublabel: "Grasshopper · Rhino · web",
      role: "process",
    },
    {
      label: "Review & Iterate",
      sublabel: "live sessions · async feedback",
      role: "process",
    },
    {
      label: "Delivery",
      sublabel: "files · scripts · documentation",
      role: "output",
    },
  ],

  techStack: [
    { name: "Grasshopper", category: "primary" },
    { name: "Rhino 3D", category: "primary" },
    { name: "Python / GHPython", category: "primary" },
    { name: "Next.js", category: "primary" },
    { name: "Revit API", category: "alternative" },
    { name: "Three.js", category: "alternative" },
    { name: "Speckle", category: "alternative" },
  ],

  services: [
    {
      name: "Landscape & Villa Parametric Design",
      description:
        "Grasshopper-driven site layout, terrain modeling, and villa massing for VIP residential projects. Iterative, presentation-ready 3D output on every round.",
    },
    {
      name: "Client-Facing Web Tools",
      description:
        "Interactive configurators and design explorers that let your clients participate in the design process — embedded in your website or delivered as a standalone URL.",
    },
    {
      name: "Grasshopper Script Organization",
      description:
        "Audit, document, refactor, and version-control your existing script library. We turn ad-hoc files into a reusable, searchable toolkit your whole team can use.",
    },
    {
      name: "Automated Drawing & Documentation",
      description:
        "Scripts that generate plans, sections, schedules, and presentation sheets directly from your Rhino/Revit model — eliminating manual redraw between design iterations.",
    },
  ],

  phases: [
    {
      number: "01",
      title: "Onboarding & Audit",
      duration: "Week 1 – 2",
      startWeek: 1,
      endWeek: 2,
      deliverables: [
        {
          title: "Studio Kickoff",
          description:
            "Call to map current tools, project types, recurring pain points, and team workflow.",
        },
        {
          title: "Script Library Audit",
          description:
            "Review existing Grasshopper files: identify reusable components, document dependencies, flag obsolete logic.",
        },
        {
          title: "Priority List",
          description:
            "Ranked backlog of automation and web tool opportunities, agreed with the Reparametrize team.",
        },
      ],
    },
    {
      number: "02",
      title: "First Deliverable Sprint",
      duration: "Weeks 3 – 6",
      startWeek: 3,
      endWeek: 6,
      deliverables: [
        {
          title: "VIP Landscape Prototype",
          description:
            "Parametric site layout tool for the Villa project: terrain, module placement, sun/shadow analysis.",
        },
        {
          title: "Script Reorganization v1",
          description:
            "Top-priority scripts refactored, documented, and delivered in a shared repository.",
        },
        {
          title: "Web Tool Mockup",
          description:
            "Clickable prototype of the client configurator (design exploration or project presentation tool).",
        },
      ],
    },
    {
      number: "03",
      title: "Ongoing Partnership",
      duration: "Month 3+",
      startWeek: 7,
      endWeek: 12,
      deliverables: [
        {
          title: "Monthly Delivery Cycle",
          description:
            "Under the retainer model, a recurring sprint of designs, scripts, and tool updates aligned to your active projects.",
        },
        {
          title: "Web Tool Launch",
          description:
            "Live client-facing configurator deployed and integrated with Reparametrize's website or client portal.",
        },
        {
          title: "Quarterly Review",
          description:
            "Assessment of delivered value, backlog reprioritization, and discussion of scope adjustments.",
        },
      ],
    },
  ],

  // investment requerido por el tipo pero reemplazado por pricingModels
  investment: {
    total: "See below",
    currency: "USD",
    note: "Choose the model that fits your current workflow.",
  },

  pricingModels: [
    {
      tag: "Option A — Focus Retainer",
      title: "Single-Project Retainer",
      subtitle: "One active deliverable at a time. Scope is ironclad.",
      price: "USD 2,000 / mo",
      priceNote: "billed monthly, cancel with 30 days notice",
      features: [
        "One (1) active deliverable per month: scripts, tools, OR web work",
        "Up to 40 hours applied to that single deliverable",
        "Parallel projects are quoted separately at per-project rates",
        "Complexity ceiling: lightweight to mid-complexity tools (not full villa suites)",
        "Monthly strategy call and async Slack support",
        "Shared version-controlled script library",
        "All source files and documentation included",
      ],
    },
    {
      tag: "Option B — Recommended for active studios",
      title: "Studio Retainer",
      subtitle: "Two concurrent deliverables. Full complexity included.",
      price: "USD 3,500 / mo",
      priceNote: "billed monthly, cancel with 30 days notice",
      highlight: true,
      features: [
        "Up to two (2) active deliverables running in parallel",
        "Up to 60 hours per month across all active work",
        "Full complexity: large parametric tools, web configurators, landscape suites",
        "Priority turnaround when client deadlines shift",
        "Monthly strategy call plus weekly async check-ins",
        "Shared script library and version control for your team",
        "All source files and documentation included",
      ],
    },
    {
      tag: "Option C — Fixed Scope",
      title: "Per Project",
      subtitle: "One deliverable. Price locked at signing. No overruns.",
      price: "USD 1,500 – 12,000",
      priceNote: "price does not change with iteration count, not hourly",
      features: [
        "Small automation or script: USD 1,500 – 3,000",
        "Grasshopper parametric tool: USD 3,000 – 6,000",
        "Client-facing web configurator: USD 4,000 – 9,000",
        "Full VIP landscape parametric suite: USD 8,000 – 12,000",
        "3 milestone payments: 30 / 35 / 35%",
        "Scope change = new quote, no silent overruns",
        "Source files and documentation on final delivery",
      ],
    },
  ],

  nextSteps: [
    "Schedule a 45-minute call this week to review this proposal and decide which option fits your current workload: single-project retainer, studio retainer, or per-project.",
    "Share 2-3 active projects or pain points you want addressed in Month 1 — we will scope the first sprint around those.",
    "Sign the service agreement and submit the first payment: Option A or B first month, or the 30% deposit for Option C to kick off the onboarding.",
    "We set up a shared workspace: repository for scripts, a Slack channel, and a project board to track deliverables.",
    "Kickoff call: audit your Grasshopper library, align on the VIP landscape brief, and define the web tool MVP.",
  ],

  validUntil: "July 20, 2026",
};

export default proposal;

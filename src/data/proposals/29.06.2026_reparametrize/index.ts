import { contactHref } from "@/data/site";
import type { Proposal } from "../types";

/**
 * Reparametrize — Computational Design as a Service.
 * Issued 29 June 2026, valid until 20 July 2026.
 *
 * Ported from the previous site. Unlike the Ecogen proposals, this one sells
 * capacity rather than a fixed scope, so the commercial section compares three
 * engagement models instead of stating one total.
 */
export const reparametrize20260629: Proposal = {
  slug: "29.06.2026_reparametrize",
  client: "Reparametrize",
  project: "Computational Design as a Service",
  phase: "Commercial proposal",
  dateLabel: "June 29, 2026",
  reviewLabel: "Valid until July 20, 2026",
  confidential: true,
  summary:
    "Embedded computational design expertise for parametric design, landscape automation and client-facing web tools — without the overhead of a full-time hire.",

  hero: {
    kicker: "Commercial proposal",
    title: "Senior computational expertise, without the full-time hire",
    accent: "without the full-time hire",
    lead: "Three engagement models built on one simple rule: more complexity and more parallel projects means more budget. Choose a focused single-project retainer, a studio retainer covering concurrent work, or a per-project arrangement with the price locked at signing.",
  },

  blocks: [
    {
      kind: "prose",
      id: "summary",
      kicker: "Summary",
      title: "What we propose",
      body: [
        "Reparametrize is looking to expand its computational capabilities without the commitment and overhead of a full-time hire. We propose three engagement models structured around a simple rule: more complexity and more parallel projects means more budget.",
        "Choose a focused single-project retainer, a studio retainer that covers concurrent complex work, or a per-project arrangement with a fixed price locked at signing.",
      ],
    },

    {
      kind: "prose",
      id: "challenge",
      kicker: "The problem",
      title: "Hiring is a commitment; freelancing loses context",
      body: [
        "Hiring a computational designer in-house means salary, benefits, onboarding time and a long-term commitment — before you know whether the workload justifies it.",
        "At the same time, outsourcing project by project to freelancers means inconsistent quality, context loss between engagements, and no institutional knowledge of your studio's standards and toolset.",
      ],
    },

    {
      kind: "prose",
      id: "approach",
      kicker: "Approach",
      title: "An embedded remote team, not a vendor",
      body: [
        "We integrate directly into Reparametrize's workflow as an embedded remote team. We learn your project types, your Grasshopper environment, your client presentation style.",
        "Whether you engage us monthly or per project, you get senior computational expertise with zero management overhead, no HR costs, and the ability to scale up or down as your pipeline demands.",
      ],
    },

    {
      kind: "steps",
      id: "workflow",
      kicker: "Workflow",
      title: "How an engagement runs",
      steps: [
        {
          number: "01",
          title: "Studio brief",
          body: "You bring the project: its type, its scale and its timeline.",
        },
        {
          number: "02",
          title: "Scoping",
          body: "We define the deliverables and the tools before any work starts, so the scope is agreed rather than discovered.",
        },
        {
          number: "03",
          title: "Design & build",
          body: "The work itself, in Grasshopper, Rhino or on the web, depending on what the deliverable needs.",
        },
        {
          number: "04",
          title: "Review & iterate",
          body: "Live sessions plus async feedback. Iteration count does not change the price on a fixed-scope project.",
        },
        {
          number: "05",
          title: "Delivery",
          body: "Files, scripts and documentation — yours to keep and to extend.",
        },
      ],
    },

    {
      kind: "split",
      id: "stack",
      kicker: "Stack",
      title: "Tools we work in",
      lead: "The primary stack is where most of the work happens. The rest we bring in when a project calls for it.",
      columns: [
        {
          title: "Primary",
          tone: "solid",
          items: [
            "Grasshopper — parametric modelling and automation",
            "Rhino 3D — geometry and presentation output",
            "Python / GHPython — logic beyond what components cover",
            "Next.js — client-facing web tools and configurators",
          ],
        },
        {
          title: "As needed",
          tone: "dashed",
          items: [
            "Revit API — when the deliverable has to land in BIM",
            "Three.js — 3D in the browser for web configurators",
            "Speckle — moving models between tools and stakeholders",
          ],
        },
      ],
    },

    {
      kind: "cards",
      id: "services",
      kicker: "Services",
      title: "What we take on",
      columns: 2,
      cards: [
        {
          icon: "cube",
          title: "Landscape & villa parametric design",
          body: "Grasshopper-driven site layout, terrain modelling and villa massing for VIP residential projects. Iterative, presentation-ready 3D output on every round.",
        },
        {
          icon: "window",
          title: "Client-facing web tools",
          body: "Interactive configurators and design explorers that let your clients participate in the design process — embedded in your website or delivered as a standalone URL.",
        },
        {
          icon: "grid",
          title: "Grasshopper script organisation",
          body: "Audit, document, refactor and version-control your existing script library. We turn ad-hoc files into a reusable, searchable toolkit your whole team can use.",
        },
        {
          icon: "file",
          title: "Automated drawing & documentation",
          body: "Scripts that generate plans, sections, schedules and presentation sheets directly from your Rhino or Revit model — eliminating manual redraw between design iterations.",
        },
      ],
    },

    {
      kind: "timeline",
      id: "phases",
      kicker: "Onboarding",
      title: "How the first months go",
      phases: [
        {
          label: "Phase 01",
          dates: "Weeks 1 – 2",
          title: "Onboarding & audit",
          state: "next",
          items: [
            {
              title: "Studio kickoff",
              body: "Call to map current tools, project types, recurring pain points and team workflow.",
            },
            {
              title: "Script library audit",
              body: "Review existing Grasshopper files: identify reusable components, document dependencies, flag obsolete logic.",
            },
            {
              title: "Priority list",
              body: "Ranked backlog of automation and web tool opportunities, agreed with the Reparametrize team.",
            },
          ],
        },
        {
          label: "Phase 02",
          dates: "Weeks 3 – 6",
          title: "First deliverable sprint",
          state: "next",
          items: [
            {
              title: "VIP landscape prototype",
              body: "Parametric site layout tool for the villa project: terrain, module placement, sun and shadow analysis.",
            },
            {
              title: "Script reorganisation v1",
              body: "Top-priority scripts refactored, documented and delivered in a shared repository.",
            },
            {
              title: "Web tool mockup",
              body: "Clickable prototype of the client configurator — design exploration or project presentation tool.",
            },
          ],
        },
        {
          label: "Phase 03",
          dates: "Month 3 onwards",
          title: "Ongoing partnership",
          state: "next",
          items: [
            {
              title: "Monthly delivery cycle",
              body: "Under the retainer model, a recurring sprint of designs, scripts and tool updates aligned to your active projects.",
            },
            {
              title: "Web tool launch",
              body: "Live client-facing configurator deployed and integrated with Reparametrize's website or client portal.",
            },
            {
              title: "Quarterly review",
              body: "Assessment of delivered value, backlog reprioritisation, and discussion of scope adjustments.",
            },
          ],
        },
      ],
    },

    {
      kind: "pricing",
      id: "pricing",
      kicker: "Investment",
      title: "Three ways to engage",
      lead: "One rule behind all three: more complexity and more parallel projects means more budget. Pick the one that matches your current pipeline — you can move between them as it changes.",
      note: "Retainers are billed monthly and cancellable with 30 days notice. On a per-project engagement the price is locked at signing and does not change with iteration count; a change of scope produces a new quote rather than a silent overrun.",
      options: [
        {
          tag: "Option A — Focus retainer",
          title: "Single-project retainer",
          subtitle: "One active deliverable at a time. Scope is ironclad.",
          price: "USD 2,000 / mo",
          priceNote: "billed monthly · 30 days notice",
          features: [
            "One active deliverable per month: scripts, tools or web work",
            "Up to 40 hours applied to that single deliverable",
            "Parallel projects quoted separately at per-project rates",
            "Complexity ceiling: lightweight to mid-complexity tools, not full villa suites",
            "Monthly strategy call and async Slack support",
            "Shared version-controlled script library",
            "All source files and documentation included",
          ],
        },
        {
          tag: "Option B — Recommended for active studios",
          title: "Studio retainer",
          subtitle: "Two concurrent deliverables. Full complexity included.",
          price: "USD 3,500 / mo",
          priceNote: "billed monthly · 30 days notice",
          highlight: true,
          features: [
            "Up to two active deliverables running in parallel",
            "Up to 60 hours per month across all active work",
            "Full complexity: large parametric tools, web configurators, landscape suites",
            "Priority turnaround when client deadlines shift",
            "Monthly strategy call plus weekly async check-ins",
            "Shared script library and version control for your team",
            "All source files and documentation included",
          ],
        },
        {
          tag: "Option C — Fixed scope",
          title: "Per project",
          subtitle: "One deliverable. Price locked at signing. No overruns.",
          price: "USD 1,500 – 12,000",
          priceNote: "per project · not hourly",
          features: [
            "Small automation or script: USD 1,500 – 3,000",
            "Grasshopper parametric tool: USD 3,000 – 6,000",
            "Client-facing web configurator: USD 4,000 – 9,000",
            "Full VIP landscape parametric suite: USD 8,000 – 12,000",
            "Three milestone payments: 30 / 35 / 35%",
            "Scope change means a new quote, never a silent overrun",
            "Source files and documentation on final delivery",
          ],
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
          body: "Schedule a 45-minute call this week to review this proposal and decide which option fits your current workload.",
        },
        {
          number: "02",
          body: "Share two or three active projects or pain points you want addressed in month 1 — we will scope the first sprint around those.",
        },
        {
          number: "03",
          body: "Sign the service agreement and submit the first payment: the first month for Option A or B, or the 30% deposit for Option C.",
        },
        {
          number: "04",
          body: "We set up a shared workspace: a repository for scripts, a Slack channel, and a project board to track deliverables.",
        },
        {
          number: "05",
          body: "Kickoff call: audit your Grasshopper library, align on the VIP landscape brief, and define the web tool MVP.",
        },
      ],
    },

    {
      kind: "prose",
      id: "contact",
      kicker: "Questions",
      title: "Talk to us before you decide",
      lead: "This proposal is valid until July 20, 2026.",
      cta: {
        label: "Reply to this proposal",
        href: contactHref("Reparametrize · Computational design proposal"),
        external: true,
      },
    },
  ],
};

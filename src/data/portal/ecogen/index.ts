import type { PortalClient } from "../types";

/**
 * EcoGen / Fluence's portal entry.
 *
 * Both existing proposals (`05.08.2026_ecogen`, the protected one; and
 * `29.06.2026_ecogen`) are referenced from `documents` rather than
 * duplicated — the portal points at the document, it does not re-author it.
 */
export const ecogenPortal: PortalClient = {
  slug: "ecogen",
  name: "EcoGen / Fluence",
  contactName: "EcoGen team",
  projects: [
    {
      id: "revit-automation",
      name: "Automation Pipeline for Revit",
      phase: "Phase 1 · Discovery",
      state: "active",
      summary:
        "A continuous pipeline from site layout to cost and schedule, replacing the manual handoffs between design, take-off and estimating.",
      startLabel: "August 2026",
      nextMilestone: { label: "Discovery findings review", date: "Sept 12, 2026" },

      kpis: [
        {
          id: "manual-steps",
          label: "Manual steps removed",
          value: 4,
          target: 12,
          unit: "steps",
          state: "on-track",
          note: "Of the 16 steps mapped in discovery.",
        },
        {
          id: "cycle-time",
          label: "Estimate cycle time",
          value: 3,
          target: 1,
          unit: "days",
          higherIsBetter: false,
          state: "at-risk",
          note: "Baseline was 5 days; target is same-day turnaround.",
        },
        {
          id: "discovery-coverage",
          label: "Discovery coverage",
          value: 80,
          target: 100,
          format: "percent",
          state: "on-track",
        },
      ],

      timeline: [
        {
          id: "discovery",
          label: "Phase 1",
          dates: "Aug 5 – Sept 12, 2026",
          title: "Discovery",
          state: "active",
          items: [
            { title: "Process mapping", body: "16 manual steps documented across design, take-off and estimating." },
            { title: "Data audit", body: "Revit model structure and existing schedules reviewed for automation fit." },
          ],
        },
        {
          id: "pipeline",
          label: "Phase 2",
          dates: "Sept – Nov 2026",
          title: "Pipeline build",
          state: "next",
          items: ["Site layout ingestion", "Cost and schedule generation", "Internal QA pass"],
        },
        {
          id: "rollout",
          label: "Phase 3",
          dates: "Dec 2026",
          title: "Rollout",
          state: "next",
          items: ["Team training", "Handover documentation"],
        },
      ],

      scope: [
        {
          id: "included",
          category: "Included",
          items: [
            { title: "Site layout ingestion", body: "Automated read of the Revit model into the pipeline's data contract." },
            { title: "Cost and schedule generation", body: "One continuous run from layout to a priced, scheduled output." },
            { title: "Team training", body: "A working session so your team can run and adjust the pipeline unassisted." },
          ],
        },
      ],

      todos: [
        {
          id: "client-todo",
          owner: "client",
          label: "Waiting on you",
          items: [
            { id: "sample-models", title: "Share three representative Revit models", done: true },
            { id: "cost-sheet", title: "Send the current estimating spreadsheet template", done: false, dueLabel: "Due Sept 5" },
          ],
        },
        {
          id: "studio-todo",
          owner: "studio",
          label: "Waiting on us",
          items: [
            { id: "findings-doc", title: "Deliver discovery findings document", done: false, dueLabel: "Due Sept 12" },
          ],
        },
      ],

      documents: [
        { id: "discovery-proposal", label: "Discovery proposal", kind: "proposal", source: "link", href: "/05.08.2026_ecogen" },
        { id: "prior-proposal", label: "Initial engagement proposal", kind: "proposal", source: "link", href: "/29.06.2026_ecogen" },
      ],

      budget: {
        currency: "USD",
        total: "24,000",
        paid: "8,000",
        note: "Phase 1 (Discovery) is billed on delivery of the findings document.",
        breakdown: [
          { label: "Phase 1 · Discovery", amount: "8,000", state: "active" },
          { label: "Phase 2 · Pipeline build", amount: "12,000", state: "next" },
          { label: "Phase 3 · Rollout", amount: "4,000", state: "next" },
        ],
      },

      updates: [
        {
          id: "u2",
          date: "Aug 28, 2026",
          title: "Process mapping complete",
          body: "All 16 manual steps across design, take-off and estimating are documented and reviewed.",
        },
        {
          id: "u1",
          date: "Aug 5, 2026",
          title: "Discovery kicked off",
          body: "Engagement started with a walkthrough of the current Revit-to-estimate workflow.",
        },
      ],
    },
  ],
};

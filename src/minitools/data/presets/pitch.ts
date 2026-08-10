import type { PitchSpec } from "../../schema/spec";

/**
 * The request `pitch` exists for: a model federation job that needs the
 * client's own IFC files and therefore cannot be faked in a browser. Written
 * as the sequence the work would genuinely follow, because the failure mode
 * here is a generic four-step consulting process that could be pasted under
 * any brief — the visitor is an engineer and reads it as one.
 */
export const pitchPreset: PitchSpec = {
  version: 1,
  template: "pitch",
  problem:
    "Coordination models arrive from four consultants in different IFC exports, the clash report is rebuilt by hand every fortnight, and by the time it circulates half of it is already out of date.",
  approach: [
    {
      title: "Read the four exports as they actually arrive",
      detail:
        "We open your last two issues of each model with IfcOpenShell and record what is really in them — the property sets that are populated, the ones that are empty, and where the naming diverges between consultants. This is the step that decides whether the rest is a week or a month.",
    },
    {
      title: "Normalise into one federated model",
      detail:
        "A mapping per consultant brings storeys, systems and classification onto one schema, with the mapping kept as data you can read and amend rather than buried in a script.",
    },
    {
      title: "Run the clash rules headlessly",
      detail:
        "Your existing rule set, plus the tolerances you already argue about, executed on every new issue without anyone opening Navisworks. Results are grouped by cause, not by geometry, so one badly placed riser is one item rather than sixty.",
    },
    {
      title: "Publish the report the meeting needs",
      detail:
        "A dated delta against the previous issue — new, resolved, still open — as BCF for the consultants and a short PDF for the client. The point is that nobody rebuilds it by hand.",
    },
  ],
  stack: ["IfcOpenShell", "Python", "BCF 3.0", "Speckle", "GitHub Actions"],
  deliverables: [
    "A federation and clash pipeline that runs on every issue, unattended",
    "Per-consultant mapping files you can amend without us",
    "Dated BCF issue sets, plus a one-page delta report per cycle",
    "A half-day handover with your BIM lead",
  ],
  timelineHint: "Four to six weeks to the first automated cycle, depending on how far the four exports diverge.",
  meta: {
    title: "Automated IFC clash coordination",
    tagline: "Four consultant models federated and clash-checked on every issue, without a manual rebuild.",
    pitch:
      "This one needs your actual IFC files to demonstrate — the interesting part is the mismatch between the four exports, and that is not something a browser can invent. So this is a scope instead: what we would read first, what we would automate, and what lands in your hands at the end of each cycle.",
  },
};

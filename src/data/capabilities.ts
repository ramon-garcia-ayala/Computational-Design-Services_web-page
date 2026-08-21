import type { MotifKind } from "@/components/design-lab/ServiceMotif";

export type Capability = {
  id: string;
  motif: MotifKind;
  title: string;
  body: string;
};

/**
 * The capabilities that join the four core offers in one grid on `/services`.
 *
 * They read as one continuous set with the four, so each carries an animated
 * motif of its own rather than a static glyph — a card with a still icon next
 * to one that moves looks unfinished rather than secondary.
 *
 * These are deliberately the capabilities the core four do *not* already
 * cover. AI Workflows & Agents, Grasshopper & Algorithms and Custom Tools were
 * on the original list and are left off: each is the substance of one of the
 * four above it, and repeating them would make the page look longer without
 * saying anything new.
 */
export const capabilities: Capability[] = [
  {
    id: "machine-learning",
    motif: "learning" as const,
    title: "Machine Learning",
    body: "Models trained on your own project data — classification, prediction and pattern-finding over drawings, schedules and performance records.",
  },
  {
    id: "bim-automation",
    motif: "model" as const,
    title: "BIM Automation",
    body: "Model audits, data enrichment, sheet production and exchange between platforms, running without anyone opening the file.",
  },
  {
    id: "dashboards",
    motif: "dashboard" as const,
    title: "Real-time KPIs & Dashboards",
    body: "Live figures pulled from the model and the schedule, so progress, cost and performance are read rather than assembled.",
  },
  {
    id: "fabrication",
    motif: "fabrication" as const,
    title: "Digital Fabrication & 3D Printing",
    body: "Geometry prepared for the machine that will cut or print it, with tolerances and constraints built into the definition.",
  },
  {
    id: "cloud",
    motif: "cloud" as const,
    title: "Cloud Apps & Platforms",
    body: "Tools that live in a browser instead of on one workstation, so the whole team runs the same version against the same data.",
  },
  {
    id: "training",
    motif: "training" as const,
    title: "Parametric Training",
    body: "Your team taught to extend what we built, in your own files and workflows, so the tooling keeps moving after we step back.",
  },
];

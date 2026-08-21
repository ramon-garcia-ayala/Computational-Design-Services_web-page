export type CapabilityIcon =
  | "learning"
  | "model"
  | "dashboard"
  | "fabrication"
  | "cloud"
  | "training";

export type Capability = {
  id: string;
  icon: CapabilityIcon;
  title: string;
  body: string;
};

/**
 * The secondary row on `/services`, under the four core offers.
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
    icon: "learning",
    title: "Machine Learning",
    body: "Models trained on your own project data — classification, prediction and pattern-finding over drawings, schedules and performance records.",
  },
  {
    id: "bim-automation",
    icon: "model",
    title: "BIM Automation",
    body: "Model audits, data enrichment, sheet production and exchange between platforms, running without anyone opening the file.",
  },
  {
    id: "dashboards",
    icon: "dashboard",
    title: "Real-time KPIs & Dashboards",
    body: "Live figures pulled from the model and the schedule, so progress, cost and performance are read rather than assembled.",
  },
  {
    id: "fabrication",
    icon: "fabrication",
    title: "Digital Fabrication & 3D Printing",
    body: "Geometry prepared for the machine that will cut or print it, with tolerances and constraints built into the definition.",
  },
  {
    id: "cloud",
    icon: "cloud",
    title: "Cloud Apps & Platforms",
    body: "Tools that live in a browser instead of on one workstation, so the whole team runs the same version against the same data.",
  },
  {
    id: "training",
    icon: "training",
    title: "Parametric Training",
    body: "Your team taught to extend what we built, in your own files and workflows, so the tooling keeps moving after we step back.",
  },
];

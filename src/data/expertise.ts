export type ExpertiseArea = {
  id: string;
  title: string;
  body: string;
  /** Concrete capabilities of the area, listed inside the panel. */
  capabilities: string[];
};

/**
 * Expertise areas on /about.
 * Shown as an accordion on mobile and as tabs from `lg` upwards.
 */
export const expertiseAreas: ExpertiseArea[] = [
  {
    id: "parametric",
    title: "Parametric design pipelines",
    body: "Design logic encoded once and reused across every revision, from massing studies to fabrication output.",
    capabilities: [
      "Grasshopper and Dynamo definitions built for handover",
      "Rhino.Compute and headless geometry services",
      "Configurators and option studies in the browser",
      "Fabrication and CNC-ready export",
    ],
  },
  {
    id: "bim",
    title: "BIM automation",
    body: "Model work that runs on its own: audits, data enrichment, sheet production and exchange between platforms.",
    capabilities: [
      "Revit and IFC tooling via API",
      "Automated model quality audits",
      "Parameter and classification management",
      "Drawing and schedule generation",
    ],
  },
  {
    id: "data",
    title: "Data and integration",
    body: "The connective work that lets project data move between the tools your teams already use.",
    capabilities: [
      "Custom connectors and ETL between platforms",
      "Project dashboards and reporting",
      "Common data environment integration",
      "Cost, programme and model data joined up",
    ],
  },
  {
    id: "ai",
    title: "AI-driven systems",
    body: "Applied AI where it earns its place: document-heavy, judgement-light work with a human reviewing the output.",
    capabilities: [
      "Document and drawing extraction",
      "Retrieval over technical archives and standards",
      "Agents for takeoff, compliance and review support",
      "Evaluation harnesses so quality stays measurable",
    ],
  },
];

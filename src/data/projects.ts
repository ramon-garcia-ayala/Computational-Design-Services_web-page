export type ProjectPanel = {
  id: string;
  /** Etiqueta corta que ordena el recorrido: "01 · Context", "02 · System"... */
  kicker: string;
  title: string;
  body: string;
  /** Datos sueltos que se pintan como lista en el panel. Opcional. */
  facts?: { label: string; value: string }[];
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  /** Disciplina o tipo de encargo, se pinta como chips. */
  tags: string[];
  /** Frase de una línea para el grid. */
  summary: string;
  /** Párrafo de apertura en la página de detalle. */
  intro: string;
  /** Marca los que salen en el grid de destacados del home. */
  featured?: boolean;
  /** Imagen de portada en /public. Sin ella se pinta un placeholder con retícula. */
  cover?: string;
  /** Paneles que recorre el scroll horizontal de la página de detalle. */
  panels: ProjectPanel[];
};

/**
 * Proyectos de EJEMPLO. Sustituir por los reales manteniendo la forma del tipo.
 * `slug` alimenta las rutas estáticas de /projects/[slug].
 */
export const projects: Project[] = [
  {
    slug: "parametric-facade-engine",
    title: "Parametric Facade Engine",
    client: "Nordhaus",
    year: "2025",
    tags: ["Grasshopper", "Rhino.Compute", "Web app"],
    summary:
      "A browser-based configurator that turns facade rulesets into fabrication-ready geometry.",
    intro:
      "The team was rebuilding facade panel layouts by hand for every design revision. We replaced that loop with a rule-driven engine that generates, validates and prices panel sets in seconds.",
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Every revision reset the panel layout",
        body: "Facade layouts lived in a mix of Rhino files and spreadsheets. A single change to the grid meant three days of manual rework and a fresh round of quantity checks.",
        facts: [
          { label: "Manual rework", value: "~3 days per revision" },
          { label: "Files in the loop", value: "Rhino + 4 spreadsheets" },
        ],
      },
      {
        id: "system",
        kicker: "02 · System",
        title: "One ruleset, many outputs",
        body: "We encoded the facade logic once as a parametric definition and exposed it through a compute service. The same ruleset now drives geometry, panel schedules and cost estimates.",
      },
      {
        id: "interface",
        kicker: "03 · Interface",
        title: "A configurator the design team actually opens",
        body: "Designers adjust the grid, opening ratio and material in the browser. Results stream back in seconds, with fabrication constraints validated before anything is exported.",
      },
      {
        id: "outcome",
        kicker: "04 · Outcome",
        title: "Revisions in minutes, not days",
        body: "Panel schedules stay in sync with the model automatically, and the estimating team works from a single source of truth.",
        facts: [
          { label: "Revision time", value: "3 days → 20 minutes" },
          { label: "Panels generated", value: "48,000+" },
        ],
      },
    ],
  },
  {
    slug: "bim-qa-pipeline",
    title: "BIM QA Pipeline",
    client: "Beton Group",
    year: "2025",
    tags: ["Revit API", "Python", "CI"],
    summary:
      "Automated model audits that run on every commit and flag issues before coordination.",
    intro:
      "Model quality was checked manually, late, and inconsistently. We moved the audit upstream and made it run on its own.",
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Quality checks arrived too late",
        body: "Audits happened right before coordination meetings, so problems surfaced when they were most expensive to fix.",
      },
      {
        id: "rules",
        kicker: "02 · Rules",
        title: "Standards written as code",
        body: "Naming conventions, parameter completeness and classification rules were translated into a versioned rule library the team can extend.",
        facts: [
          { label: "Rules encoded", value: "140+" },
          { label: "Owned by", value: "BIM management team" },
        ],
      },
      {
        id: "automation",
        kicker: "03 · Automation",
        title: "Audits on every model publish",
        body: "The pipeline runs headless on each publish and posts a readable report with the offending elements linked by id.",
      },
      {
        id: "outcome",
        kicker: "04 · Outcome",
        title: "Coordination starts from a clean model",
        body: "Issues are caught the day they are introduced, and coordination meetings shifted from finding errors to making decisions.",
      },
    ],
  },
  {
    slug: "site-logistics-simulator",
    title: "Site Logistics Simulator",
    client: "Vector Civil",
    year: "2024",
    tags: ["Simulation", "Optimisation", "Dashboards"],
    summary:
      "A scheduling sandbox that tests crane, delivery and storage strategies before mobilisation.",
    intro:
      "Logistics plans were argued over in meetings with no way to test them. We built a sandbox where each strategy can be run and compared.",
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Plans that could not be tested",
        body: "Crane positions, delivery windows and laydown areas were decided from experience alone, with no feedback until the site was already running.",
      },
      {
        id: "model",
        kicker: "02 · Model",
        title: "The site as a system",
        body: "Deliveries, equipment and storage were modelled as constrained resources so any plan could be simulated against the real programme.",
      },
      {
        id: "outcome",
        kicker: "03 · Outcome",
        title: "Strategies compared before mobilisation",
        body: "The team now walks into planning sessions with measured scenarios instead of opinions.",
        facts: [
          { label: "Scenarios per plan", value: "12 on average" },
          { label: "Idle crane time", value: "Reduced by 18%" },
        ],
      },
    ],
  },
  {
    slug: "structural-takeoff-agent",
    title: "Structural Takeoff Agent",
    client: "Meridian",
    year: "2024",
    tags: ["LLM", "IFC", "Estimating"],
    summary:
      "An AI-assisted takeoff that reads models and drawings and drafts the quantity schedule.",
    intro:
      "Quantity takeoff consumed senior engineering time on work that was mostly transcription. We automated the first draft and left the judgement to people.",
    featured: false,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Senior time spent transcribing",
        body: "Every tender started with days of reading drawings and copying quantities into a schedule by hand.",
      },
      {
        id: "system",
        kicker: "02 · System",
        title: "Model first, drawings second",
        body: "The agent extracts what it can from the IFC model, then falls back to the drawing set for anything missing, always citing where a number came from.",
      },
      {
        id: "outcome",
        kicker: "03 · Outcome",
        title: "A reviewable first draft",
        body: "Estimators start from a draft schedule with sources attached, and spend their time on the assumptions that actually matter.",
        facts: [
          { label: "Draft turnaround", value: "Under 1 hour" },
          { label: "Every line item", value: "Traceable to a source" },
        ],
      },
    ],
  },
];

/** Proyectos destacados del home, en el orden del array. */
export const featuredProjects = projects.filter((project) => project.featured);

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Siguiente proyecto, con vuelta al principio, para la navegación del detalle. */
export function getNextProject(slug: string): Project {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

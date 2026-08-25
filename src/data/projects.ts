import { projectMedia, type ProjectAsset } from "./projects/media";

export type ProjectPanel = {
  id: string;
  /** Short label that orders the walkthrough: "01 · Context", "02 · System"... */
  kicker: string;
  title: string;
  body: string;
  /** Loose data points rendered as a list in the panel. Optional. */
  facts?: { label: string; value: string }[];
  /**
   * Indices into the project's `assets` that follow this panel in the track.
   *
   * Indices rather than filenames because the order is the portfolio's, not
   * the folder's — see `scripts/project-media.mjs` for why the two disagree.
   * `assetRange` is the readable way to write one.
   */
  media?: number[];
};

export type Project = {
  slug: string;
  title: string;
  /**
   * Where the work was done. Not a client: these are research projects, and
   * inventing a commissioning company for one would be a lie on a page whose
   * whole job is to be believed.
   */
  context: string;
  year: string;
  /** Discipline or type of engagement, rendered as chips. */
  tags: string[];
  /** One-line sentence for the grid. */
  summary: string;
  /** Opening paragraph on the detail page. */
  intro: string;
  /**
   * The project brief, quoted from ramyayoub.net rather than rewritten.
   *
   * Everything else on this page is redrafted for a studio selling a service;
   * this is the one field that stays in the author's own words, because it is
   * the description of the work itself.
   */
  brief: string[];
  /** Marks the ones that appear in the home page featured grid. */
  featured?: boolean;
  /** Panels the horizontal scroll of the detail page travels through. */
  panels: ProjectPanel[];
};

/** `assetRange(0, 3)` → `[0, 1, 2]`. Half-open, like `slice`. */
function assetRange(from: number, to: number): number[] {
  return Array.from({ length: to - from }, (_, i) => from + i);
}

/**
 * The real work, in the order it appears on /projects.
 *
 * `slug` matches its folder under `public/projects/projects-tabs/` and its `id`
 * in the portfolio snapshot, which is what lets `assets()` below join the copy
 * to the generated media manifest.
 */
export const projects: Project[] = [
  {
    slug: "spatial-flow-ai-driven-industrial-layout-agent",
    title: "Spatial Flow",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Reinforcement learning", "Python", "Spatial analysis"],
    summary:
      "An AI agent that lays out machines, workstations and circulation, then proves which arrangement runs better.",
    intro:
      "Industrial layout is decided early, by hand, and then lived with for a decade. Spatial Flow turns it into something you can search: the agent generates layouts, scores them against how the work actually moves, and hands back the trade-offs.",
    brief: [
      "Spatial Flow is an AI-driven industrial layout agent developed to optimize the placement of machines, workstations, and circulation paths within production environments. The system combines computational design, spatial analysis, and reinforcement learning to generate and evaluate multiple layout configurations based on factors such as travel distance, operational sequence, accessibility, and collision avoidance. Through state graphs, stress testing, and benchmarking, the project explores how AI can support faster and more informed planning decisions while allowing designers to compare solutions and improve overall spatial and production efficiency.",
    ],
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "The layout is guessed once, then lived with",
        body: "Production layouts are set at the start of a project, from experience rather than measurement, and rarely revisited. The cost of a poor arrangement is paid every shift afterwards, in metres walked and sequences that double back on themselves.",
        media: assetRange(0, 5),
      },
      {
        id: "agent",
        kicker: "02 · Agent",
        title: "Reinforcement learning over the floor plan",
        body: "The agent places machines, workstations and circulation, then scores what it built against travel distance, operational sequence, accessibility and collisions. Each attempt informs the next, so the search concentrates where the gains are instead of sampling at random.",
        media: assetRange(5, 11),
      },
      {
        id: "evaluation",
        kicker: "03 · Evaluation",
        title: "State graphs, stress tests, benchmarks",
        body: "A layout that scores well once proves nothing. Configurations are pushed through state graphs and stress tests so the comparison holds under changing volumes, and benchmarking keeps the agent honest against arrangements a planner would have drawn.",
        facts: [
          { label: "Scored against", value: "Travel · sequence · access · collisions" },
          { label: "Output", value: "Ranked layouts, not one answer" },
        ],
        media: assetRange(11, 15),
      },
      {
        id: "outcome",
        kicker: "04 · Outcome",
        title: "Comparison, not a verdict",
        body: "The designer is left with several defensible layouts and the reasoning behind each. That is the useful form: planning decisions get made faster because the trade-offs are explicit, not because a black box picked one.",
        media: assetRange(15, 19),
      },
    ],
  },
  {
    slug: "morphing-sands",
    title: "Morphing Sands",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Grasshopper", "Monoceros / WFC", "Environmental analysis"],
    summary:
      "A climate-responsive modular system for Jeddah, where solar and wind data drive the massing directly.",
    intro:
      "Densifying a hot–humid coastal city means fighting the climate or working with it. Morphing Sands reads Al-Balad's vernacular logic — courtyards, shaded streets, layered façades — as a rule set, then lets solar and wind data resolve it into built form.",
    brief: [
      "Featured on the official website of MONOCEROS: https://www.monoceros.tools/project23/",
      "Morphing Sands is a climate-responsive mixed-use architectural system developed for Jeddah, Saudi Arabia, addressing urban densification in a hot–humid coastal environment. Inspired by the historic fabric of Al-Balad, the project reinterprets Hijazi principles—such as courtyards, shaded streets, and layered façades—through a modular and computational design approach.",
      "The project organizes commercial functions horizontally at the lower levels and residential units vertically above, forming a courtyard-based typology that promotes social interaction, ventilation, and daylight control. Environmental performance drives the design logic: building orientation, massing, and height are parametrically defined using solar and wind data to maximize shading, cross-ventilation, and thermal comfort.",
      "A rule-based aggregation system using modular pods generates adaptable spatial configurations across different site sizes and densities. Structurally, precast pods integrate load transfer, self-shading, and thermal mass. Combined with passive ventilation and façade-integrated energy strategies, Morphing Sands proposes a scalable architectural system rooted in vernacular intelligence and optimized through computation.",
    ],
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Densifying Jeddah without air-conditioning the problem away",
        body: "Al-Balad solved a hot–humid coast with courtyards, shaded streets and layered façades. The project treats those as working principles rather than ornament, and asks what they become at the density the city now needs.",
        media: assetRange(0, 4),
      },
      {
        id: "system",
        kicker: "02 · System",
        title: "Climate data drives the massing",
        body: "Orientation, massing and height are parametrically defined from solar and wind data, so shading, cross-ventilation and thermal comfort are settled by the form itself. Commercial functions run horizontally below, residential stacks vertically above, around a courtyard typology.",
        media: assetRange(4, 9),
      },
      {
        id: "aggregation",
        kicker: "03 · Aggregation",
        title: "Modular pods, resolved by rules",
        body: "A rule-based aggregation system assembles modular pods into configurations that adapt across site sizes and densities. Precast pods carry load transfer, self-shading and thermal mass at once, so the structural and environmental arguments are the same argument.",
        facts: [
          { label: "Driven by", value: "Solar + wind data" },
          { label: "Scales across", value: "Site size and density" },
        ],
        media: assetRange(9, 13),
      },
      {
        id: "outcome",
        kicker: "04 · Outcome",
        title: "Vernacular intelligence, optimised",
        body: "The result is a scalable system rather than a single building: passive ventilation and façade-integrated energy strategies combined with a geometry that already knows what its climate asks of it.",
        media: assetRange(13, 16),
      },
    ],
  },
  {
    slug: "flat-dream",
    title: "Flat Dream",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["LoRA training", "ComfyUI", "LM Studio", "Interface design"],
    summary:
      "Two custom-trained LoRA models and an interface that takes Archigram's visual language from prompt to 3D mesh.",
    intro:
      "Generative image tools stop at the picture. Flat Dream trains its own models on a specific architectural language, then keeps going — into a magazine builder, a mesh converter and a model viewer, so the output stays usable.",
    brief: [
      "FlatDream is an interface inspired by the book Learning from Las Vegas, built on 2 custom-trained LoRA models, fine-tuned on the visual language of the Archigram movement. It connects directly to ComfyUI and LM Studio to generate architectural imagery from text, image references, and multi-input compositions, with outputs that feed into a magazine builder, 3D mesh converter, and model viewer.",
    ],
    featured: true,
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "Learning from Las Vegas, by way of Archigram",
        body: "A general image model has no particular architecture in it. Flat Dream starts from a stated position — Archigram's visual language, read through Learning from Las Vegas — and fine-tunes two LoRA models on it, so the output argues from somewhere.",
        media: assetRange(0, 5),
      },
      {
        id: "system",
        kicker: "02 · System",
        title: "Wired straight into ComfyUI and LM Studio",
        body: "The interface drives ComfyUI and LM Studio directly, generating from text, image references and multi-input compositions. Running against local models keeps the loop fast enough to iterate in, and keeps the work off someone else's server.",
        facts: [
          { label: "Custom models", value: "2 LoRA, fine-tuned" },
          { label: "Inputs", value: "Text · reference · composition" },
        ],
        media: assetRange(5, 10),
      },
      {
        id: "outputs",
        kicker: "03 · Outputs",
        title: "Past the image, into geometry",
        body: "Generated imagery feeds a magazine builder, a 3D mesh converter and a model viewer. That last step is the point: an image is a mood, a mesh is something you can measure, and the tool carries the idea across that line.",
        media: assetRange(10, 14),
      },
    ],
  },
  {
    slug: "nyc-urban-land-use",
    title: "NYC — Urban Land Use",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Machine learning", "Python", "GIS", "Urban data"],
    summary:
      "Can a model tell commercial from residential using built form alone? A grid-classification study across New York.",
    intro:
      "Land use is recorded, but slowly and unevenly. This project asks whether built-form morphology, environmental data and proximity to city features carry enough signal to predict it — and how much data a model needs before it starts being right.",
    brief: [
      "NYC – Urban Land Use investigates whether machine learning can classify urban areas as commercial or residential using built-form morphology, environmental data, and proximity to surrounding city features. The project reframes land-use prediction as a spatial grid-classification problem, combining expanded urban datasets to identify the conditions required for accurate prediction at the city scale.",
      "“Can we predict the land use of a space based on existing environmental information from official and unofficial sources?”",
      "What’s the sweet spot for a Machine Learning model to start predicting accurately at an urban level?",
    ],
    panels: [
      {
        id: "question",
        kicker: "01 · Question",
        title: "Predicting land use from what a place looks like",
        body: "The question is whether official and unofficial environmental information is enough to say what a space is used for. Built-form morphology, environmental readings and proximity to surrounding city features are the only inputs; the label is what has to be inferred.",
        media: assetRange(0, 6),
      },
      {
        id: "method",
        kicker: "02 · Method",
        title: "Land use as a grid-classification problem",
        body: "Reframing the city as a spatial grid turns an ambiguous urban question into a classification task with a clear unit of analysis. Expanded urban datasets are joined onto that grid, so every cell carries the same feature vocabulary.",
        media: assetRange(6, 13),
      },
      {
        id: "findings",
        kicker: "03 · Findings",
        title: "Where the model starts being right",
        body: "The useful result is not a single accuracy figure but a threshold: how much data, at what resolution, before prediction becomes trustworthy at city scale. Below it the model is confidently wrong, which is the failure mode that matters.",
        facts: [
          { label: "Classes", value: "Commercial vs residential" },
          { label: "Unit", value: "Spatial grid cell" },
        ],
        media: assetRange(13, 21),
      },
    ],
  },
  {
    slug: "la-cite-radieuse",
    title: "La Cité Radieuse",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Graph analysis", "Machine learning", "Python"],
    summary:
      "Le Corbusier's Unité d'Habitation converted into spatial graphs, to test whether a room's function is predictable from its position.",
    intro:
      "A famously modular building is a good place to ask what modularity actually does to circulation. Floor plans become graphs, and the graph gets interrogated at three scales — many floors, one floor, one apartment.",
    brief: [
      "La Cité Radieuse investigates how the spatial organization of Le Corbusier’s Unité d’Habitation shapes circulation, accessibility, and connectivity between apartments and rooms. Floor plans are converted into spatial graphs and examined at three scales: multiple floors, a single floor, and an individual apartment. Graph-based measurements reveal recurring patterns within the building’s modular organization, while machine-learning models test whether room functions can be predicted from their position, connectivity, and relationships within the overall spatial network.",
    ],
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "A modular building, read as a network",
        body: "The Unité d'Habitation organises circulation, accessibility and connectivity through repetition. Converting its floor plans into spatial graphs makes that organisation measurable rather than described.",
        media: assetRange(0, 5),
      },
      {
        id: "scales",
        kicker: "02 · Scales",
        title: "Many floors, one floor, one apartment",
        body: "The same graph measurements are applied at three scales, which is what separates a property of the building from a property of an apartment. Recurring patterns surface where the modular logic repeats, and break where it does not.",
        media: assetRange(5, 10),
      },
      {
        id: "prediction",
        kicker: "03 · Prediction",
        title: "Can position tell you what a room is for?",
        body: "Machine-learning models are given a room's position, connectivity and relationships within the network, and asked for its function. Where they succeed, the plan's logic is legible in its topology alone.",
        facts: [
          { label: "Scales analysed", value: "3" },
          { label: "Predicted from", value: "Position · connectivity · relations" },
        ],
        media: assetRange(10, 15),
      },
    ],
  },
  {
    slug: "breathing-mass-hb01-structural-facade",
    title: "Breathing Mass — HB01",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Topology optimisation", "Alpaca", "Grasshopper", "Radiation analysis"],
    summary:
      "A Santiago tower whose core cleans the city's air, with a lattice grown by stress analysis rather than drawn.",
    intro:
      "The Hyper Lung takes the tower's least interesting element — the core — and gives it the building's main job. Around it, a topology-optimised skeleton thickens where load demands and thins where it does not.",
    brief: [
      "A vertical ecosystem in Santiago where architecture, wind, and energy converge. The Hyper Lung captures, cleans, and redistributes polluted air through a breathing core, transforming the tower into living infrastructure that breathes with the city.",
    ],
    featured: true,
    panels: [
      {
        id: "concept",
        kicker: "01 · Concept",
        title: "The core does the breathing",
        body: "Santiago's air is the site condition. The tower captures, cleans and redistributes it through a breathing core, which turns a building into a piece of civic infrastructure rather than a neighbour to it.",
        media: assetRange(0, 3),
      },
      {
        id: "structure",
        kicker: "02 · Structure",
        title: "A skeleton grown from its own stresses",
        body: "The primary lattice is topology-optimised: Alpaca stress analysis drives density up at high-load junctions and tapers it through low-stress zones. Plugin masses are distributed along that lattice by incident radiation, so structure and thermal performance are resolved together.",
        facts: [
          { label: "Lattice density", value: "Driven by stress analysis" },
          { label: "Mass placement", value: "Driven by incident radiation" },
        ],
        media: assetRange(3, 7),
      },
      {
        id: "outcome",
        kicker: "03 · Outcome",
        title: "Three cores, one self-braced system",
        body: "Load runs from volume to core to foundation, with three cores forming a triangle that turns vertical mass into a self-braced structural system — the arrangement the whole geometry is organised to make possible.",
        media: assetRange(7, 10),
      },
    ],
  },
  {
    slug: "collaborative-workflow-structure-facade-hb01",
    title: "Collaborative Workflow — Structure/Facade",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Automation", "Speckle", "Grasshopper", "Interoperability"],
    summary:
      "An automated pipeline that extracts and distributes model data between structural and façade teams, replacing manual file exchange.",
    intro:
      "Coordination between disciplines usually means somebody exporting a file and somebody else waiting for it. This workflow removes the person from the middle: a new model version publishes, and the data reaches whoever needs it.",
    brief: [
      "This project develops an automated collaborative workflow that extracts, organizes, and distributes data from newly published 3D model versions, reducing manual file exchange and coordination delays. The workflow connects structural and façade information within a shared pipeline, with future development focused on linking façade geometry and opening areas to environmental radiation data for more informed design decisions.",
    ],
    panels: [
      {
        id: "context",
        kicker: "01 · Context",
        title: "The delay is the file exchange",
        body: "Structural and façade teams work from the same model and still wait on each other, because the model moves between them by hand. Every exchange is a chance for a version to go stale without anyone noticing.",
        media: assetRange(0, 2),
      },
      {
        id: "pipeline",
        kicker: "02 · Pipeline",
        title: "Publish once, distribute automatically",
        body: "A newly published model version triggers extraction: the data is organised and pushed to the teams that depend on it, inside one shared pipeline. Coordination stops being an activity and becomes a property of the system.",
        facts: [
          { label: "Replaces", value: "Manual file exchange" },
          { label: "Triggered by", value: "A published model version" },
        ],
        media: assetRange(2, 4),
      },
      {
        id: "next",
        kicker: "03 · Next",
        title: "Radiation data into façade decisions",
        body: "The development in progress links façade geometry and opening areas to environmental radiation data, so the same pipeline that keeps teams in sync also tells them which openings are worth having.",
        media: assetRange(4, 6),
      },
    ],
  },
  {
    slug: "le-monstre-merveille",
    title: "Le Monstre Merveille",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Parametric design", "Rhino", "Grasshopper", "Adaptive reuse"],
    summary:
      "A new system inserted into an existing structure like a parasite — monstrous outside, controlled and humane within.",
    intro:
      "The name carries the argument. A form that reads as complex, almost monstrous from outside produces a delicate and controlled interior, and it does so by adapting to the existing building rather than clearing it.",
    brief: [
      "The name Le Monstre Merveille reflects the duality: a structure that appears complex and almost monstrous in form, yet creates a delicate, controlled, and humane interior experience. Rather than replacing the existing structure, the concept focuses on preserving the order and hierarchy of the original architecture, while inserting a new system that acts almost like a parasite, adapting, wrapping, and growing within it.",
    ],
    panels: [
      {
        id: "duality",
        kicker: "01 · Duality",
        title: "Monstrous outside, humane inside",
        body: "The exterior is deliberately difficult — complex, almost monstrous. What it produces internally is the opposite: delicate, controlled, humane. The project treats that contradiction as the design rather than a problem to resolve.",
        media: assetRange(0, 4),
      },
      {
        id: "insertion",
        kicker: "02 · Insertion",
        title: "Parasite, not replacement",
        body: "The original architecture's order and hierarchy are preserved. The new system adapts, wraps and grows within it, taking the existing structure as a host with rules to be respected rather than a site to be cleared.",
        media: assetRange(4, 7),
      },
      {
        id: "outcome",
        kicker: "03 · Outcome",
        title: "Two logics, one building",
        body: "What results reads as a single building carrying two structural arguments at once — the original's hierarchy still legible beneath a geometry that could not have been drawn without it.",
        media: assetRange(7, 10),
      },
    ],
  },
  {
    slug: "lightweave-pavilion",
    title: "Lightweave Pavilion",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Parametric design", "Grasshopper", "Fabrication"],
    summary:
      "One triangulated steel module, repeated — shifts in height and density do the rest.",
    intro:
      "A single repeated module is a constraint that pays for itself in fabrication. The pavilion spends its variation elsewhere: in height and density, which is where it changes how the space is read.",
    brief: [
      "The pavilion uses a repeated triangulated steel module to form both structure and enclosure, with shifts in height and density shaping circulation, light, and spatial perception.",
    ],
    panels: [
      {
        id: "module",
        kicker: "01 · Module",
        title: "One part, structure and enclosure at once",
        body: "A triangulated steel module does both jobs, which removes the usual second system and everything that has to be coordinated with it. Repetition is what makes it fabricable at all.",
        media: assetRange(0, 4),
      },
      {
        id: "variation",
        kicker: "02 · Variation",
        title: "Height and density carry the design",
        body: "With the part fixed, the remaining variables are how tall and how dense. Those two shifts shape circulation, light and spatial perception — the whole experience, from a component that never changes.",
        facts: [
          { label: "Distinct parts", value: "One module, repeated" },
          { label: "Varied by", value: "Height and density" },
        ],
        media: assetRange(4, 10),
      },
    ],
  },
];

/** Featured projects on the home page, in array order. */
export const featuredProjects = projects.filter((project) => project.featured);

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Next project, wrapping around to the first, for the detail page nav. */
export function getNextProject(slug: string): Project {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

/** Grid-card cover for a project, from the generated manifest. */
export function coverOf(slug: string) {
  return projectMedia[slug]?.cover;
}

/** Every asset of a project, in portfolio order. */
export function assetsOf(slug: string): ProjectAsset[] {
  return projectMedia[slug]?.assets ?? [];
}

export type TrackEntry =
  | { kind: "panel"; key: string; panel: ProjectPanel }
  | { kind: "media"; key: string; asset: ProjectAsset; index: number };

/**
 * The horizontal track: each text panel followed by the assets it claims.
 *
 * Anything no panel claimed is appended rather than dropped. A file added to a
 * folder and not yet written into the copy should be visible and obviously
 * unplaced, not silently missing from a sequence nobody is counting.
 */
export function trackOf(project: Project): TrackEntry[] {
  const assets = assetsOf(project.slug);
  const claimed = new Set<number>();
  const entries: TrackEntry[] = [];

  for (const panel of project.panels) {
    entries.push({ kind: "panel", key: `panel-${panel.id}`, panel });
    for (const index of panel.media ?? []) {
      const asset = assets[index];
      if (!asset || claimed.has(index)) continue;
      claimed.add(index);
      entries.push({ kind: "media", key: `media-${index}`, asset, index });
    }
  }

  assets.forEach((asset, index) => {
    if (claimed.has(index)) return;
    entries.push({ kind: "media", key: `media-${index}`, asset, index });
  });

  return entries;
}

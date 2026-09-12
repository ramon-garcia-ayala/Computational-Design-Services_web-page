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
    slug: "hyper-builder-vertical-community-generator",
    title: "Hyper Builder",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Grasshopper", "Web app", "Cloud data management"],
    summary:
      "A web-based parametric app that turns building massing and program into something you compose in real time, not wait hours to see.",
    intro:
      "Urban design has always oscillated between a static CAD drawing and a simulation that takes hours to update, and that lag kills creativity. Hyper Builder closes the gap: a Grasshopper backend behind a browser interface, so the model reruns as fast as a slider moves.",
    brief: [
      "Hyperbuilder is a web-based parametric design app that transforms complex architectural modeling into a seamless, rapid-iteration process. Powered by a Grasshopper backend, it allows users to effortlessly generate, evaluate, and configure complex building massings and program distributions through a highly intuitive, simple interface.",
    ],
    panels: [
      {
        id: "vision",
        kicker: "01 · Vision",
        title: "Vertical communities, quantified",
        body: "The industry is obsessed with the final render and has been ignoring the space between the sketch and the BIM model. Hyper Builder bridges that gap with a real-time, cloud-based environment where data doesn't just follow the design — it drives it.",
        media: assetRange(0, 3),
      },
      {
        id: "controls",
        kicker: "02 · Controls",
        title: "Composing, not drawing",
        body: "A project grid, towers added or removed with a click, height and program mix on sliders that update the 3D model instantly, and site context imported straight from a 3DM file. Every input is live, so the model is always the current answer, never a stale export.",
        facts: [
          { label: "Backend", value: "Grasshopper" },
          { label: "Update latency", value: "Instant, on every slider move" },
        ],
        media: assetRange(3, 5),
      },
      {
        id: "analytics",
        kicker: "03 · Analytics",
        title: "The dashboard that catches the ratio before export",
        body: "A donut chart tracks the overall program split; bar charts break it down tower by tower. If the retail-to-residential ratio is off, it shows up on screen long before anyone hits export — and a version history panel keeps every iteration browsable and reversible.",
        media: assetRange(5, 7),
      },
    ],
  },
  {
    slug: "geometry-of-intelligence-hb01",
    title: "The Geometry of Intelligence",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Grasshopper", "Speckle", "Computational design", "BIM"],
    summary:
      "Hyper Building One's geometry stops being a shape and becomes a carrier of over ten embedded metadata points.",
    intro:
      "A one-million-square-metre tower can't stay agile if its blueprint is a static snapshot that starts ageing the moment it's drawn. This phase of HB-01 asks how raw geometry becomes live data — and answers it capsule by capsule.",
    brief: [
      "Hyperbuilding One is a data-driven ecosystem that achieves seamless connectivity between Static and Kinetic spaces through an optimized large-scale integrated environment.",
    ],
    panels: [
      {
        id: "system",
        kicker: "01 · System",
        title: "Static body, kinetic cells",
        body: "The tower splits into two systems in constant dialogue: a permanent infrastructural body carrying the skeletal and circulatory logic, and a series of hexagonal plug-in capsules — the Abyss, the Groot, the Recycler, the Boss — that exchange air, water and energy. Hexagonal packing keeps it gapless and maximises sunlight.",
        media: assetRange(0, 3),
      },
      {
        id: "metadata",
        kicker: "02 · Metadata",
        title: "Every capsule carries its own dataset",
        body: "Generated through the Grasshopper and Speckle pipeline, a capsule is never just a 3D model — it's a container for over ten metadata points: programmatic function, precise weight and embodied carbon, and its spatial relationship to the core and to its neighbours.",
        facts: [
          { label: "Metadata points per capsule", value: "10+" },
          { label: "Pipeline", value: "Grasshopper → Speckle" },
        ],
        media: assetRange(3, 5),
      },
      {
        id: "validation",
        kicker: "03 · Validation",
        title: "KPIs instead of guesses",
        body: "Space utilisation against the one-million-square-metre target, spatial proximity between interdependent functions, and the exact energy demand of each cluster — validated in real time rather than assumed, and checked against the city below through shadow and daylight analysis so the tower stays a good neighbour.",
        media: assetRange(5, 6),
      },
    ],
  },
  {
    slug: "automated-metadata-extraction-hb01",
    title: "Automated Metadata Extraction — HB01",
    context: "IAAC · Barcelona",
    year: "2026",
    tags: ["Speckle", "Automation", "Data pipelines", "BIM"],
    summary:
      "A Speckle automation that turns a newly published model into a structured spreadsheet of KPIs, with no one exporting a file by hand.",
    intro:
      "Coordination across a large design team breaks down at data translation — too many file formats, too much room for miscommunication. This pipeline extracts a model's KPIs the moment a new version is published and pushes them into one format every team can read.",
    brief: [
      "An automated pipeline that transforms raw 3D model metadata into structured cloud spreadsheets. This makes complex geometric data easily accessible and adaptable for various end-uses, from simple data reading to feeding live web platforms.",
    ],
    panels: [
      {
        id: "problem",
        kicker: "01 · Problem",
        title: "The bottleneck is translation, not measurement",
        body: "The geometric, textual and numerical data a design team generates is enormous, and the missing link isn't better analysis — it's a single, legible format everyone downstream can actually use. The Studio's Data Team needed raw geometry to arrive already structured for its KPI database.",
        media: assetRange(0, 1),
      },
      {
        id: "pipeline",
        kicker: "02 · Pipeline",
        title: "Speckle extracts, the report writes itself",
        body: "The automation pulls architectural KPIs — areas, use ratios, evacuation distances — straight from the 3D model and processes them into a structured Excel or Google Sheet, with summary matrices by tower, level and program ready for immediate validation.",
        facts: [
          { label: "Extracted", value: "Areas · use ratios · evacuation distances" },
          { label: "Output", value: "Structured spreadsheet, by tower/level/program" },
        ],
        media: assetRange(1, 4),
      },
      {
        id: "validation",
        kicker: "03 · Validation",
        title: "Every version checked against the last",
        body: "The tables run from a per-geometry summary to validation tables that flag errors and version-to-version changes — matching, missing or modified — so a stale export is caught before it reaches anyone who'd act on it.",
        media: assetRange(4, 5),
      },
    ],
  },
  {
    slug: "geomorphing-terrascape-chihuahua",
    title: "Geomorphing Terrascape",
    context: "IAAC · Barcelona",
    year: "2025",
    tags: ["Monoceros / WFC", "Grasshopper", "Environmental analysis", "3D-printed adobe"],
    summary:
      "Chihuahua's informal barrio, encoded as an aggregation system — dignifying its survival logic rather than replacing it with a grid.",
    intro:
      "The barrio in Chihuahua's rugged topography isn't just housing; it's a morphological catalyst, a vernacular intelligence of incremental growth built to survive an extreme desert climate. Terrascape reads that logic as a rule set and lets Monoceros grow from it, rather than imposing an order from outside.",
    brief: [
      "Terrascape does not impose an external order; it encodes the survival logic of the Mexican informal barrio to transform it into a dignified, resilient, and dynamic housing system.",
    ],
    panels: [
      {
        id: "strategy",
        kicker: "01 · Strategy",
        title: "Encoding the barrio, not erasing it",
        body: "Three computational concepts translate the barrio's spontaneous survival logic: Wave Function Collapse for rule-based rather than gridded growth, a topographical agent that interweaves with Chihuahua's hills, and modular dignification — structural safety and climate resilience without losing the self-built essence.",
        media: assetRange(0, 3),
      },
      {
        id: "typology",
        kicker: "02 · Typology",
        title: "The Tianguis: a little bit of everything",
        body: "Organised like the traditional open-air market, clusters stay under six modules to hold a human scale. Housing modules go subterranean for thermal inertia or open to voids above for ventilation; functional modules carry commerce and rainwater harvesting; circulation modules — cores and bridges — adapt to the slope.",
        media: assetRange(3, 6),
      },
      {
        id: "workflow",
        kicker: "03 · Workflow",
        title: "TSP path, then Monoceros aggregation",
        body: "The terrain is read first, a Traveling Salesman solve finds the shortest path between points of interest, and that route projects onto the module grid for Monoceros to aggregate against. The result reports its own area, BCR, FAR and population density as it forms.",
        facts: [
          { label: "Primary structure", value: "3D-printed adobe" },
          { label: "Water yield", value: "3–10 L/m² per day" },
        ],
        media: assetRange(6, 9),
      },
      {
        id: "validation",
        kicker: "04 · Validation",
        title: "Stress-tested across five sites",
        body: "From a steep mountain periphery demanding an organic response to a flat urban lot suited to grid logic, the aggregation was tested across five extreme topographical conditions — proving the system holds regardless of slope or scale.",
        media: assetRange(9, 15),
      },
    ],
  },
  {
    slug: "materia-assente",
    title: "Materia Assente",
    context: "IAAC · Barcelona",
    year: "2025",
    tags: ["Kangaroo", "Crystallon", "Alpaca FEA", "Galapagos"],
    summary:
      "A lattice pavilion that weighs 202 kg and displaces 0.16 mm — engineering the memory of a form rather than its mass.",
    intro:
      "What happens when a pavilion is designed for the memory of a building instead of the building itself? Materia Assente reconstructs an architectural volume as a wire-mesh lattice: poetic in concept, resolved entirely through finite element analysis and evolutionary optimisation.",
    brief: [
      "Materia Assente explores the intersection of poetic parametric design and rigorous structural integrity. The project seeks to answer a complex question: how can we create a structure that feels like a ghost — evoking ancient forms — while maintaining the structural stability required for a real-world pavilion?",
    ],
    panels: [
      {
        id: "concept",
        kicker: "01 · Concept",
        title: "Absent matter, present structure",
        body: "Instead of solid walls, complex lattice structures reconstruct the volume of an architectural form, filtering the landscape through a wire-mesh transparency. The concept is poetic; the execution is purely mathematical.",
        media: assetRange(0, 1),
      },
      {
        id: "workflow",
        kicker: "02 · Workflow",
        title: "Five steps from void to verified lattice",
        body: "Boolean form-finding carves the ghost geometry; Crystallon voxelises it into a BC Cubic cell topology chosen for its stability; the lattice is trimmed and loaded; Alpaca 4D runs the FEA; Galapagos refines the geometry to minimise displacement.",
        facts: [
          { label: "Beams", value: "18,000+ curves" },
          { label: "Nodes", value: "37,000+ intersections" },
        ],
        media: assetRange(1, 3),
      },
      {
        id: "results",
        kicker: "03 · Results",
        title: "Light in mass, stiff under load",
        body: "Fit inside an 8 × 6 × 4.5 m envelope with over 6 km of linear beams, glass-reinforced recycled-PET pipes, the structure weighs 202.22 kg total. Under combined gravity and wind loads it holds global displacement to 0.16 mm, peaking at 67.26 mm under maximum combined load.",
        media: assetRange(3, 5),
      },
      {
        id: "tradeoff",
        kicker: "04 · Trade-off",
        title: "Density against transparency",
        body: "Galapagos found the densest configurations were also the strongest — and the least habitable, closing off both circulation and the ghost aesthetic the project is named for. The final geometry negotiates that trade-off rather than maximising either side of it.",
        media: assetRange(5, 7),
      },
    ],
  },
  {
    slug: "pneumatical-incrustation",
    title: "The Pneumatical Incrustation",
    context: "IAAC · Barcelona",
    year: "2025",
    tags: ["Kangaroo", "Digital fabrication", "Panelisation", "Adaptive reuse"],
    summary:
      "Inflated pneumatic forms grafted onto a decaying market's existing grid — soft geometry defining a space traditionally held by solid walls.",
    intro:
      "How can something low in inherent solidity still be structurally present and define architectural space? Developed for the Complex Forming Seminar, the project pushes that question through Cairo's Bab El-Louk market, using the site's own structural grid as the foundation for a soft, inflated transformation.",
    brief: [
      "How can an object low in inherent solidity still be structurally present and define architectural space? This question lies at the heart of The Pneumatical Incrustation, exploring the fundamental contrast between the solid and the soft — a dialogue between the rigidity of traditional architecture and the fluidity of pneumatic structures.",
    ],
    panels: [
      {
        id: "challenge",
        kicker: "01 · Challenge",
        title: "From free-form simulation to a panelisable system",
        body: "Early Kangaroo explorations produced compelling free-form geometry that couldn't be standardised for construction. The fix was a pseudo-code membrane that hangs downward into columns while simultaneously inflating upward into domes — complexity traded for quantifiability.",
        media: assetRange(0, 2),
      },
      {
        id: "process",
        kicker: "02 · Process",
        title: "Eight steps, from frame to pillowy panel",
        body: "A horizontal frame subdivides along the site grid, extrudes down to anchor the form, relaxes into a membrane, inflates upward under negative load, and trims to open shopfronts. A Kangaroo circle-packing solve joins into hexagonal panels, each one extruded along its normal and smoothed into the finished pneumatic surface.",
        media: assetRange(2, 3),
      },
      {
        id: "parameters",
        kicker: "03 · Parameters",
        title: "Four dials, a family of forms",
        body: "Column descent, dome inflation, panelisation density and per-panel inflation magnitude are all adjustable, letting the system respond to structural weight and constraint without a redesign.",
        facts: [
          { label: "Adjustable parameters", value: "4" },
          { label: "Site", value: "Bab El-Louk market, Cairo" },
        ],
        media: assetRange(3, 4),
      },
      {
        id: "context",
        kicker: "04 · Context",
        title: "Revival, not demolition",
        body: "The existing structural grid becomes the foundation rather than an obstacle. From outside, the inflated volumes read as extrusions hinting at the commerce below; inside, the upper faces filter daylight while the lower faces descend to sculpt intimate shops and corridors.",
        media: assetRange(4, 9),
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

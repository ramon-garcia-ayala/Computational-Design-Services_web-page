export type ApproachStep = {
  id: string;
  /** Numeración visible. Se escribe a mano para poder saltar o reordenar pasos. */
  number: string;
  title: string;
  body: string;
};

/** Metodología en pasos. Bloque "Our Approach" de /about. */
export const approachSteps: ApproachStep[] = [
  {
    id: "map",
    number: "01",
    title: "Map the bottleneck",
    body: "We sit with the people doing the work and trace where hours actually go. No tooling decisions until the constraint is on paper.",
  },
  {
    id: "prototype",
    number: "02",
    title: "Prototype in days",
    body: "A rough working version lands within the first sprint. It is faster to argue with something real than with a specification.",
  },
  {
    id: "build",
    number: "03",
    title: "Build for handover",
    body: "Tools ship documented, versioned and testable, so your team can extend them without calling us back for every change.",
  },
  {
    id: "measure",
    number: "04",
    title: "Measure and iterate",
    body: "We instrument what we build. If a workflow is not measurably faster, it is not finished.",
  },
];

/** Manifiesto corto del home. */
export const manifesto = {
  kicker: "What we do",
  lead: "AEC teams lose their best hours to work that software should be doing.",
  body: "We are a computational studio embedded in architecture, engineering and construction. We build the parametric pipelines, model automations and AI-driven systems that take repetitive work off your team, and we hand them over documented so they keep running without us.",
};

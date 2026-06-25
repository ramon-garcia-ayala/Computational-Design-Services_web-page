export type Phase = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  highlight?: boolean;
};

export const phases: Phase[] = [
  {
    number: "01",
    title: "MVP Phase",
    subtitle: "Functional initial delivery",
    description:
      "We build the minimum viable version of the project: functional, presentable, and ready to validate with real users or stakeholders.",
    features: [
      "Scope and key objective definition",
      "Core feature delivery",
      "Rapid iterations and early feedback",
      "Technical and business validation",
    ],
    highlight: true,
  },
  {
    number: "02",
    title: "Improvement & Implementation",
    subtitle: "Scaling and refinement",
    description:
      "With the MVP validated, we expand, optimize, and integrate. This phase transforms the prototype into a robust, production-ready solution.",
    features: [
      "Performance and UX optimization",
      "Integration with existing systems",
      "New features per monthly roadmap",
      "Testing, QA, and technical documentation",
    ],
    highlight: false,
  },
  {
    number: "03",
    title: "Team Training",
    subtitle: "Knowledge transfer",
    description:
      "We accompany your team through adoption. The goal is for your organization to independently operate, maintain, and evolve the delivered tools.",
    features: [
      "Personalized training sessions",
      "Operational and technical documentation",
      "Workflow workshops",
      "Post-delivery support and maintenance",
    ],
    highlight: false,
  },
];

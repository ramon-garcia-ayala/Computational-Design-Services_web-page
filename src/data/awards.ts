export type Award = {
  id: string;
  title: string;
  issuer: string;
  year: string;
};

export type Metric = {
  id: string;
  label: string;
  value: string;
};

/** Reconocimientos de /about. Valores de EJEMPLO. */
export const awards: Award[] = [
  { id: "award-1", title: "Digital Innovation in Construction", issuer: "AEC Awards", year: "2025" },
  { id: "award-2", title: "Best Computational Workflow", issuer: "BuildTech Summit", year: "2025" },
  { id: "award-3", title: "Emerging Studio of the Year", issuer: "Design Systems Forum", year: "2024" },
];

/** Métricas de estudio, en formato texto libre (no se animan como los contadores). */
export const studioMetrics: Metric[] = [
  { id: "metric-1", label: "Average payback on a tool", value: "< 6 months" },
  { id: "metric-2", label: "Projects handed over fully documented", value: "100%" },
  { id: "metric-3", label: "Countries worked in", value: "9" },
  { id: "metric-4", label: "Longest running client engagement", value: "3 years" },
];

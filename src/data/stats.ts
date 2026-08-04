export type Stat = {
  id: string;
  label: string;
  /** Final numeric value. The counter animates from 0 up to this number. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to show during and after the animation. */
  decimals?: number;
};

/**
 * The 5 home page metrics. PLACEHOLDER values, replace with real figures.
 * Adding or removing entries does not break the layout: the grid adapts.
 */
export const stats: Stat[] = [
  {
    id: "meshes",
    label: "Meshes generated",
    value: 1200000,
    suffix: "+",
  },
  {
    id: "enterprise-clients",
    label: "Enterprise clients served",
    value: 24,
    suffix: "",
  },
  {
    id: "automations",
    label: "Automations delivered",
    value: 180,
    suffix: "+",
  },
  {
    id: "savings",
    label: "Estimated client savings",
    value: 4.2,
    prefix: "$",
    suffix: "M",
    decimals: 1,
  },
  {
    // Fifth slot is free: swap label and value for the definitive metric.
    id: "hours-reclaimed",
    label: "Engineering hours reclaimed",
    value: 96000,
    suffix: "+",
  },
];

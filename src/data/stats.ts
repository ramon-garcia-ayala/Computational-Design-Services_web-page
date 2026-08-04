export type Stat = {
  id: string;
  label: string;
  /** Valor numérico final. El contador anima de 0 a este número. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimales a mostrar durante y después de la animación. */
  decimals?: number;
};

/**
 * Las 5 métricas del home. Valores de EJEMPLO, sustituir por cifras reales.
 * Añadir o quitar entradas no rompe el layout: la grilla se adapta.
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
    // Quinto slot libre: cambiar label y value por la métrica definitiva.
    id: "hours-reclaimed",
    label: "Engineering hours reclaimed",
    value: 96000,
    suffix: "+",
  },
];

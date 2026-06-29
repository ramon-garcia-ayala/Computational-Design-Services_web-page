export interface ProposalDeliverable {
  title: string;
  description: string;
}

export interface ProposalPhase {
  number: string;
  title: string;
  duration: string;
  startWeek?: number;
  endWeek?: number;
  deliverables: ProposalDeliverable[];
}

export interface ProposalService {
  name: string;
  description: string;
}

export interface WorkflowStep {
  label: string;
  sublabel: string;
  role: "input" | "process" | "output";
}

export interface TechItem {
  name: string;
  category: "primary" | "alternative";
}

/**
 * Etapa del diagrama animado de encabezado (HeaderPipeline).
 * `kind` selecciona el dibujo/diagrama; `label`/`sublabel` son el copy (viven en data).
 */
export interface HeaderStage {
  kind: "plan2d" | "plugin" | "bim3d" | "metadata" | "cost" | "schedule";
  label: string;
  sublabel: string;
  role: "input" | "process" | "output";
}

/**
 * Tarjeta de comparación de modelo de precios.
 * Se usa en pricingModels[] para renderizar PricingComparison.
 */
export interface PricingModel {
  tag: string;
  title: string;
  subtitle: string;
  price: string;
  priceNote?: string;
  highlight?: boolean;
  features: string[];
  /** Si es true, la tarjeta se renderiza como "alternativa inferior" (estilo comparativo/tachado). */
  isComparisonBaseline?: boolean;
}

export interface ProposalData {
  slug: string;
  client: string;
  projectTitle: string;
  projectSubtitle: string;
  date: string;
  preparedBy: string;
  /** Ruta a un GIF/imagen conceptual de encabezado, p.ej. "/proposals/ecogen-header.gif" */
  headerImage?: string;
  /**
   * Diagrama animado de encabezado (SVG, en vez de un GIF estatico).
   * Si esta definido, el hero renderiza <HeaderPipeline> con estas etapas en orden
   * y tiene prioridad sobre `headerImage`.
   */
  headerStages?: HeaderStage[];
  summary: string;
  challenge: string;
  approach: string;
  workflow?: WorkflowStep[];
  techStack?: TechItem[];
  services: ProposalService[];
  phases: ProposalPhase[];
  investment: {
    total: string;
    currency: string;
    note: string;
    breakdown?: { label: string; amount: string }[];
  };
  nextSteps: string[];
  validUntil: string;
  /**
   * Comparación de modelos de precio (reemplaza la sección Investment estándar cuando está definido).
   * Renderiza PricingComparison — 3 columnas: Retainer / Por proyecto / vs. empleado.
   */
  pricingModels?: PricingModel[];
}

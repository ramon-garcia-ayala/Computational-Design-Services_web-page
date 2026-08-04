import type { IconName } from "@/components/proposal/icons";

/**
 * Modelo de datos de las propuestas de cliente.
 *
 * Una propuesta es un documento heterogéneo: narrativa, diagramas, tablas y
 * preguntas abiertas. En vez de una página a medida por cliente, se describe
 * como una lista de bloques tipados que `ProposalRenderer` mapea a componentes.
 * Igual que en `data/projects.ts`, aquí vive todo el copy.
 */

/* --------------------------------------------------------------------------
   Diagrama de flujo
   Convención heredada del propio dibujo técnico: sólido = construido,
   discontinuo = propuesto.
-------------------------------------------------------------------------- */

export type NodeStatus =
  /** Construido y probado contra datos reales. */
  | "built"
  /** Definido pero todavía sin construir. */
  | "pending"
  /** Fuera del alcance inmediato, fase posterior. */
  | "deferred"
  /** Fichero de configuración: el contrato de datos de una etapa. */
  | "config"
  /** Artefacto que viaja entre etapas (un fichero, una estructura). */
  | "artifact";

export type FlowNode = {
  id: string;
  /** Número de etapa en la espina principal. Los config/artifact no lo llevan. */
  stage?: string;
  title: string;
  /** Segunda línea: el nombre técnico del módulo o del fichero. */
  meta?: string;
  status: NodeStatus;
  /** Quién es responsable de construirlo, si aún no existe. */
  owner?: string;
  detail?: string;
};

export type FlowEdge = {
  from: string;
  to: string;
  /** `config` y `optional` se dibujan discontinuos. */
  kind?: "flow" | "config" | "optional";
};

/* --------------------------------------------------------------------------
   Preguntas abiertas
-------------------------------------------------------------------------- */

export type Priority = "Blocking" | "High" | "Medium" | "Low";

export type Question = {
  /** Referencia corta y estable para citarla en la reunión: "Q-01". */
  id: string;
  priority: Priority;
  question: string;
  /** Por qué importa la respuesta. Una frase. */
  why: string;
};

export type QuestionGroup = {
  id: string;
  category: string;
  questions: Question[];
};

/* --------------------------------------------------------------------------
   Bloques
-------------------------------------------------------------------------- */

type BlockBase = {
  /** Ancla de la sección y clave del índice lateral. */
  id: string;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Oculta la sección del índice lateral (para bloques de apoyo). */
  unlisted?: boolean;
};

export type ProseBlockData = BlockBase & {
  kind: "prose";
  body?: string[];
  /** Lista de comprobación con ancla, para mapear requisitos a secciones. */
  checklist?: { label: string; href?: string }[];
  cta?: { label: string; href: string; external?: boolean };
};

export type StepsBlockData = BlockBase & {
  kind: "steps";
  steps: { number: string; title: string; body: string }[];
};

export type FlowBlockData = BlockBase & {
  kind: "flow";
  nodes: FlowNode[];
  edges: FlowEdge[];
  note?: string;
};

export type SplitBlockData = BlockBase & {
  kind: "split";
  columns: { title: string; tone: "solid" | "dashed"; items: string[] }[];
};

export type CardsBlockData = BlockBase & {
  kind: "cards";
  columns?: 2 | 3;
  cards: { icon: IconName; title: string; body: string }[];
};

export type QaBlockData = BlockBase & {
  kind: "qa";
  groups: QuestionGroup[];
  note?: string;
};

export type TableBlockData = BlockBase & {
  kind: "table";
  columns: { key: string; label: string; emphasis?: boolean }[];
  rows: Record<string, string>[];
  note?: string;
};

export type StatsBlockData = BlockBase & {
  kind: "stats";
  stats: { value: string; label: string; note?: string }[];
};

export type TimelineBlockData = BlockBase & {
  kind: "timeline";
  phases: {
    label: string;
    dates: string;
    title: string;
    state: "done" | "active" | "next";
    items: string[];
  }[];
};

export type NoteBlockData = BlockBase & {
  kind: "note";
  tone: "info" | "flag";
  title: string;
  body: string;
};

export type ProposalBlock =
  | ProseBlockData
  | StepsBlockData
  | FlowBlockData
  | SplitBlockData
  | CardsBlockData
  | QaBlockData
  | TableBlockData
  | StatsBlockData
  | TimelineBlockData
  | NoteBlockData;

/* --------------------------------------------------------------------------
   Propuesta
-------------------------------------------------------------------------- */

export type Proposal = {
  /** Es también la URL: r2ch.tech/<slug>. Formato DD.MM.YYYY_cliente. */
  slug: string;
  client: string;
  project: string;
  phase: string;
  dateLabel: string;
  reviewLabel: string;
  /** Muestra el tag CONFIDENTIAL en la cabecera. */
  confidential?: boolean;
  /** Resumen para el <title> y la metadata. */
  summary: string;
  hero: {
    kicker: string;
    title: string;
    /** Fragmento del título que se pinta en acento. Debe aparecer en `title`. */
    accent?: string;
    lead: string;
  };
  blocks: ProposalBlock[];
};

import type { IconName } from "@/components/proposal/icons";

/**
 * Data model for the client proposals.
 *
 * A proposal is a heterogeneous document: narrative, diagrams, tables and open
 * questions. Instead of a bespoke page per client, it is described as a list of
 * typed blocks that `ProposalRenderer` maps to components. Just like in
 * `data/projects.ts`, all the copy lives here.
 */

/* --------------------------------------------------------------------------
   Flow diagram
   Convention inherited from technical drawing itself: solid = built,
   dashed = proposed.
-------------------------------------------------------------------------- */

/**
 * What a node *is*, not how far along it is. Build status belongs in the
 * "where this stands today" block; a diagram whose job is to define the process
 * should not be arguing about what exists yet.
 */
export type NodeStatus =
  /** A step in the chain. */
  | "stage"
  /** Configuration file: the data contract a stage reads. */
  | "config"
  /** What travels from one stage to the next: a file, a structure. */
  | "artifact";

export type FlowNode = {
  id: string;
  /** Stage number on the spine. config and artifact nodes do not carry one. */
  stage?: string;
  title: string;
  /** Set alongside the title: the module or file this stage lives in. */
  meta?: string;
  status: NodeStatus;
  detail?: string;
};

export type FlowEdge = {
  from: string;
  to: string;
  /** `config` and `optional` are drawn dashed. */
  kind?: "flow" | "config" | "optional";
};

/* --------------------------------------------------------------------------
   Open questions
-------------------------------------------------------------------------- */

export type Priority = "Blocking" | "High" | "Medium" | "Low";

export type Question = {
  /** Short, stable reference for citing it in the meeting: "Q-01". */
  id: string;
  priority: Priority;
  question: string;
  /** Why the answer matters. One sentence. */
  why: string;
};

export type QuestionGroup = {
  id: string;
  category: string;
  questions: Question[];
};

/* --------------------------------------------------------------------------
   Blocks
-------------------------------------------------------------------------- */

type BlockBase = {
  /** Section anchor and key in the side index. */
  id: string;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Hides the section from the side index (for supporting blocks). */
  unlisted?: boolean;
};

export type ProseBlockData = BlockBase & {
  kind: "prose";
  body?: string[];
  /** Checklist with anchors, to map requirements to sections. */
  checklist?: { label: string; href?: string }[];
  cta?: { label: string; href: string; external?: boolean };
};

export type StepsBlockData = BlockBase & {
  kind: "steps";
  /**
   * `flow` lays the steps out as a horizontal chain from `lg` up — right for a
   * pipeline, where the point is that each step feeds the next. `list` is the
   * default: a numbered column, right for actions the reader has to take.
   */
  layout?: "list" | "flow";
  /** `title` is optional so the same block serves plain ordered lists. */
  steps: { number: string; title?: string; body: string }[];
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

/**
 * Commercial terms. Two shapes, and a proposal may use either or both: side by
 * side `options` when the client picks between engagement models, and a single
 * `total` with its milestone breakdown when the scope is fixed.
 */
export type PricingBlockData = BlockBase & {
  kind: "pricing";
  options?: {
    /** Short label above the title: "Option B — Recommended". */
    tag: string;
    title: string;
    subtitle?: string;
    price: string;
    priceNote?: string;
    /** Draws the card in accent. Use on at most one option. */
    highlight?: boolean;
    features: string[];
  }[];
  total?: {
    amount: string;
    currency: string;
    note?: string;
    breakdown?: { label: string; amount: string }[];
  };
  note?: string;
};

/**
 * Files that travel with the proposal. `file` is a path under /public, usually
 * `/proposals/<slug>/<name>`, so each proposal's attachments sit together.
 */
export type DocsBlockData = BlockBase & {
  kind: "docs";
  docs: { label: string; file: string; note?: string }[];
};

export type TimelineBlockData = BlockBase & {
  kind: "timeline";
  phases: {
    label: string;
    dates: string;
    title: string;
    state: "done" | "active" | "next";
    /** A bare line, or a named deliverable with its description. */
    items: (string | { title: string; body: string })[];
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
  | PricingBlockData
  | DocsBlockData
  | TimelineBlockData
  | NoteBlockData;

/* --------------------------------------------------------------------------
   Proposal
-------------------------------------------------------------------------- */

export type Proposal = {
  /** Also the URL: r2ch.tech/<slug>. Format DD.MM.YYYY_client. */
  slug: string;
  client: string;
  project: string;
  phase: string;
  dateLabel: string;
  /** What happens next: a review date, a validity date, a decision point. */
  reviewLabel: string;
  /** Shows the CONFIDENTIAL tag in the header. */
  confidential?: boolean;
  /** Summary for the <title> and the metadata. */
  summary: string;
  hero: {
    kicker: string;
    title: string;
    /** Fragment of the title rendered in the accent colour. Must appear in `title`. */
    accent?: string;
    lead: string;
  };
  blocks: ProposalBlock[];
};

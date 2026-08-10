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

/**
 * A checklist of things to be handed over, grouped by topic. Distinct from
 * `cards`: these are items to tick off, so they read as a list with the count
 * visible, not as a grid of equal-weight statements.
 */
export type ChecklistBlockData = BlockBase & {
  kind: "checklist";
  groups: {
    id: string;
    category: string;
    items: { title: string; body: string }[];
  }[];
  note?: string;
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

/**
 * A conceptual diagram, shown in the document rather than attached to it.
 *
 * Distinct from `docs` on purpose. `docs` is for things that leave the page — a
 * drawing set, a spreadsheet, a PDF. A diagram that *is* the argument belongs in
 * the argument; a link the reader has to click to reach the explanation is a
 * link most of them will not click.
 *
 * Generated by the `workflow-anim` skill, which also prints this block filled
 * in. Every field here comes from the sidecar next to the image, so the two
 * cannot drift: fix the spec and re-render rather than editing `alt` by hand.
 */
export type FigureBlockData = BlockBase & {
  kind: "figure";
  /** Path under /public. An SVG that animates itself; no JS, no dependencies. */
  src: string;
  /**
   * The static end state. Printed instead of `src`, because a browser prints
   * whichever frame the animation happens to be on.
   */
  poster?: string;
  /** The raster twin, for email and slide decks. */
  download?: { label: string; file: string };
  /** Required: what a reader sees and what it means. Also the accessible text. */
  alt: string;
  caption?: string;
  /** For our own retrieval across proposals. Never rendered. */
  tags?: string[];
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
  | ChecklistBlockData
  | QaBlockData
  | TableBlockData
  | StatsBlockData
  | PricingBlockData
  | DocsBlockData
  | FigureBlockData
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

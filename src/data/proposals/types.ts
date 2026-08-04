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

export type NodeStatus =
  /** Built and tested against real data. */
  | "built"
  /** Defined but not built yet. */
  | "pending"
  /** Outside the immediate scope, a later phase. */
  | "deferred"
  /** Configuration file: the data contract of a stage. */
  | "config"
  /** Artifact travelling between stages (a file, a structure). */
  | "artifact";

export type FlowNode = {
  id: string;
  /** Stage number on the main spine. config/artifact nodes do not carry one. */
  stage?: string;
  title: string;
  /** Second line: the technical name of the module or the file. */
  meta?: string;
  status: NodeStatus;
  /** Who is responsible for building it, if it does not exist yet. */
  owner?: string;
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
   Proposal
-------------------------------------------------------------------------- */

export type Proposal = {
  /** Also the URL: r2ch.tech/<slug>. Format DD.MM.YYYY_client. */
  slug: string;
  client: string;
  project: string;
  phase: string;
  dateLabel: string;
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

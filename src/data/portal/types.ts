/**
 * Data model for the client portal.
 *
 * Same shape as `data/proposals/types.ts`: one client is a folder, all its
 * copy lives in that folder's `index.ts`, and a component never hardcodes a
 * string. The portal reuses the proposal system's status vocabulary
 * (`"done" | "active" | "next"`) so the two documents read as one language
 * rather than two dashboards that happen to share a colour.
 */

/* --------------------------------------------------------------------------
   KPIs
-------------------------------------------------------------------------- */

/**
 * A KPI's state is data, not a colour read off a chart. The accessibility
 * guidance behind this is explicit: label every qualitative range and target
 * with text, colour is supplementary. Every chip built from this renders the
 * word, never the colour alone.
 */
export type PortalKpiState = "on-track" | "at-risk" | "off-track";

export type PortalKpi = {
  id: string;
  label: string;
  value: number;
  target: number;
  unit?: string;
  format?: "number" | "percent" | "currency" | "duration";
  /** Whether crossing above `target` is the good direction. Defaults to true. */
  higherIsBetter?: boolean;
  state: PortalKpiState;
  note?: string;
};

/* --------------------------------------------------------------------------
   Timeline — same three states the proposal `timeline` block already uses.
-------------------------------------------------------------------------- */

export type PortalPhaseState = "done" | "active" | "next";

export type PortalPhase = {
  id: string;
  label: string;
  dates: string;
  title: string;
  state: PortalPhaseState;
  items: (string | { title: string; body: string })[];
};

/* --------------------------------------------------------------------------
   Scope
-------------------------------------------------------------------------- */

export type PortalScopeGroup = {
  id: string;
  category: string;
  items: { title: string; body: string }[];
};

/* --------------------------------------------------------------------------
   To-do — grouped by who owns the next move, so the client sees at a glance
   what is waiting on them versus on us.
-------------------------------------------------------------------------- */

export type PortalTodoOwner = "client" | "studio";

export type PortalTodoItem = {
  id: string;
  title: string;
  body?: string;
  done: boolean;
  dueLabel?: string;
};

export type PortalTodoGroup = {
  id: string;
  owner: PortalTodoOwner;
  label: string;
  items: PortalTodoItem[];
};

/* --------------------------------------------------------------------------
   Documents — a private file under private/portal/<slug>/, or an external
   link (including a link to an existing proposal page).
-------------------------------------------------------------------------- */

export type PortalDocumentKind =
  | "proposal"
  | "budget"
  | "deliverable"
  | "reference";

type PortalDocumentBase = {
  id: string;
  label: string;
  date?: string;
  note?: string;
  kind: PortalDocumentKind;
};

/**
 * A real discriminant (`source`) rather than relying on which of `file` /
 * `href` is present: TypeScript's control-flow narrowing does not reliably
 * follow presence checks through an intersection type like `Base & {...}`,
 * so a truthiness check on `doc.file` would leave `doc.href` typed as
 * `string | undefined` everywhere it is actually used. `source` removes the
 * ambiguity outright.
 */
export type PortalDocument =
  | (PortalDocumentBase & {
      source: "file";
      /** Path under private/portal/<slug>/, served through the file route. */
      file: string;
    })
  | (PortalDocumentBase & {
      source: "link";
      /** An external destination, or a page already on this site (e.g. a proposal). */
      href: string;
      external?: boolean;
    });

/* --------------------------------------------------------------------------
   Budget
-------------------------------------------------------------------------- */

export type PortalBudget = {
  currency: string;
  total: string;
  paid?: string;
  note?: string;
  breakdown?: { label: string; amount: string; state?: PortalPhaseState }[];
};

/* --------------------------------------------------------------------------
   Updates — a dated log, most recent first.
-------------------------------------------------------------------------- */

export type PortalUpdate = {
  id: string;
  date: string;
  title: string;
  body: string;
};

/* --------------------------------------------------------------------------
   Project / Client
-------------------------------------------------------------------------- */

export type PortalProjectState = "active" | "paused" | "complete";

export type PortalProject = {
  id: string;
  name: string;
  phase: string;
  state: PortalProjectState;
  summary: string;
  startLabel: string;
  nextMilestone?: { label: string; date: string };
  kpis: PortalKpi[];
  timeline: PortalPhase[];
  scope: PortalScopeGroup[];
  todos: PortalTodoGroup[];
  documents: PortalDocument[];
  budget?: PortalBudget;
  updates?: PortalUpdate[];
};

export type PortalClient = {
  /** Internal id. Also the subject signed into the session cookie. */
  slug: string;
  name: string;
  contactName?: string;
  projects: PortalProject[];
};

/**
 * Spec validation.
 *
 * The contract is the one src/minitools/schema/validate.ts already sets in this
 * repo: clamp and truncate, do not reject. A spec with eight stages should give
 * you a diagram of six and a warning, not an error and no diagram — the person
 * running this is mid-way through assembling a proposal.
 *
 * The one departure: truncation is LOUD. It names what it dropped and why.
 * Silently rendering five of a client's eight steps is worse than refusing,
 * because nobody notices until the client does.
 *
 * `alt` is the only required field, and that is deliberate. A diagram whose
 * entire job is explaining something has to be explicable in words; if the alt
 * text cannot be written, the diagram is not communicating. It is the cheapest
 * quality gate in the skill.
 */

import { DURATION } from "./tokens.mjs";
import { clip } from "./layout.mjs";

/** Per-archetype density caps. Above these a diagram stops being read and
    starts being scanned; the numbers come from how many labels the eye takes in
    at one glance, not from what fits on the canvas. */
export const CAPS = {
  pipeline: { stages: { min: 3, max: 6, ideal: 5 }, flows: 10 },
  transform: { stages: { min: 3, max: 3, ideal: 3 }, cells: 24 },
  iterate: { variants: { min: 4, max: 12, ideal: 9 }, criteria: 3 },
  exchange: { nodes: { min: 3, max: 7, ideal: 6 }, links: 12 },
};

export const ARCHETYPES = Object.keys(CAPS);

/** Character budgets. A label longer than this stops being a label. */
export const TEXT = { label: 24, sub: 40, artifact: 22, title: 34, subtitle: 46, legend: 12 };

export const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{1,28}$/;

class Report {
  constructor() {
    this.warnings = [];
    this.errors = [];
  }
  warn(msg) {
    this.warnings.push(msg);
  }
  fail(msg) {
    this.errors.push(msg);
  }
  get ok() {
    return this.errors.length === 0;
  }
}

const str = (v) => (typeof v === "string" ? v.trim() : "");
const arr = (v) => (Array.isArray(v) ? v : []);
const clamp = (v, lo, hi, dflt) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

/** Truncate a list to a cap, naming what fell off. */
function cap(list, max, what, rep) {
  if (list.length <= max) return list;
  const dropped = list.slice(max).map((x) => str(x.label ?? x.id ?? x.name) || "(unnamed)");
  rep.warn(
    `${what}: ${list.length} given, ${max} is the cap — dropped ${dropped.join(", ")}. ` +
      `Split this into two animations rather than shrinking the labels.`,
  );
  return list.slice(0, max);
}

/** Truncate a string to a budget, naming it. */
function fit(value, max, what, rep) {
  const s = str(value);
  if (s.length <= max) return s;
  rep.warn(`${what}: "${s}" is ${s.length} chars, trimmed to ${max}.`);
  return clip(s, max);
}

const slug = (s) =>
  str(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/* -------------------------------------------------------------------------- */

export function parseSpec(raw) {
  const rep = new Report();
  const input = raw && typeof raw === "object" ? raw : {};

  const archetype = ARCHETYPES.includes(input.archetype) ? input.archetype : null;
  if (!archetype) {
    rep.fail(
      `archetype must be one of ${ARCHETYPES.join(", ")} — got ${JSON.stringify(input.archetype)}. ` +
        `See references/archetypes.md for which one fits.`,
    );
    return { spec: null, report: rep };
  }

  const meta = input.meta && typeof input.meta === "object" ? input.meta : {};

  const alt = str(meta.alt);
  if (!alt) {
    rep.fail(
      `meta.alt is required. Describe what a reader sees and what it means, in one or two ` +
        `sentences — if it cannot be said in words, the diagram is not explaining anything.`,
    );
  } else if (alt.length < 40) {
    rep.warn(`meta.alt is only ${alt.length} chars. Name each stage and what comes out.`);
  }

  const title = fit(meta.title || "Untitled", TEXT.title, "meta.title", rep);
  const id = slug(input.id || meta.title) || archetype;

  const tags = arr(meta.tags)
    .map((t) => slug(t))
    .filter((t) => {
      if (TAG_PATTERN.test(t)) return true;
      if (t) rep.warn(`tag "${t}" dropped — see references/tags.md for the vocabulary.`);
      return false;
    })
    .slice(0, 8);
  if (!tags.length) rep.warn(`no tags. They are what makes a library of these searchable later.`);

  const spec = {
    version: 1,
    id,
    archetype,
    meta: {
      title,
      /**
       * The side-index label. Derived from the title when absent, but the
       * derivation cannot know that "Cost estimate and 4D sequence" is really
       * about the estimate — so when the title does not shorten gracefully,
       * say the two words you want.
       */
      kicker: fit(meta.kicker || "", 18, "meta.kicker", rep),
      subtitle: fit(meta.subtitle || "", TEXT.subtitle, "meta.subtitle", rep),
      description: str(meta.description),
      alt,
      caption: str(meta.caption),
      tags,
    },
    duration: clamp(input.duration, DURATION.min, DURATION.max, DURATION.default),
    body: null,
    /**
     * Layout-time complaints. Some things cannot be judged from the spec alone:
     * whether a label fits depends on how many stages there are, which is only
     * known once the archetype has done its arithmetic. Builders append here and
     * the CLI prints it, so a clipped label is still reported rather than
     * quietly shipped.
     */
    notes: [],
  };

  if (!spec.meta.description) {
    rep.warn(`meta.description is empty — it becomes the figure block's lead line.`);
  }

  spec.body = BODY[archetype](input, rep);
  return { spec, report: rep };
}

/* --------------------------------------------------------------------------
   Per-archetype bodies
-------------------------------------------------------------------------- */

const OWNERS = ["automated", "manual", "client"];
const owner = (v) => (OWNERS.includes(v) ? v : "automated");

const STAGE_KINDS = ["input", "process", "output", "decision"];

const BODY = {
  pipeline(input, rep) {
    let stages = arr(input.stages).map((s, i) => ({
      id: slug(s.id) || `s${i}`,
      label: fit(s.label, TEXT.label, `stages[${i}].label`, rep),
      sub: fit(s.sub || "", TEXT.sub, `stages[${i}].sub`, rep),
      kind: STAGE_KINDS.includes(s.kind) ? s.kind : i === 0 ? "input" : "process",
      owner: owner(s.owner),
    }));

    const c = CAPS.pipeline.stages;
    if (stages.length < c.min) {
      rep.fail(
        `pipeline needs at least ${c.min} stages — ${stages.length} given. ` +
          `Two boxes and an arrow is not a pipeline; if that is genuinely the workflow, ` +
          `it belongs in the proposal's text, not in an animation.`,
      );
    }
    stages = cap(stages, c.max, "stages", rep);
    if (stages.length > c.ideal) {
      rep.warn(`${stages.length} stages reads as busy; ${c.ideal} is the comfortable ceiling.`);
    }

    const ids = new Set(stages.map((s) => s.id));
    let flows = arr(input.flows)
      .map((f, i) => ({
        from: slug(f.from),
        to: slug(f.to),
        label: fit(f.label || "", TEXT.artifact, `flows[${i}].label`, rep),
        owner: owner(f.owner),
      }))
      .filter((f) => {
        if (ids.has(f.from) && ids.has(f.to)) return true;
        rep.warn(`flow ${f.from} -> ${f.to} dropped: no such stage.`);
        return false;
      });

    // A pipeline with no declared flows is the common case — chain them.
    if (!flows.length && stages.length > 1) {
      flows = stages.slice(1).map((s, i) => ({
        from: stages[i].id,
        to: s.id,
        label: "",
        owner: s.owner,
      }));
    }
    flows = cap(flows, CAPS.pipeline.flows, "flows", rep);

    return { stages, flows };
  },

  transform(input, rep) {
    let stages = arr(input.stages).map((s, i) => ({
      label: fit(s.label, TEXT.label, `stages[${i}].label`, rep),
      legend: fit(s.legend || s.label, TEXT.legend, `stages[${i}].legend`, rep),
      mode: ["plan", "extrude", "model"].includes(s.mode)
        ? s.mode
        : ["plan", "extrude", "model"][Math.min(i, 2)],
    }));

    if (stages.length !== 3) {
      if (stages.length < 3) {
        rep.fail(
          `transform is exactly three stages: what arrives flat, the moment it gains height, ` +
            `what it becomes. ${stages.length} given. A fourth reads as indecision about what ` +
            `the transformation actually is.`,
        );
      } else {
        stages = cap(stages, 3, "stages", rep);
      }
    }

    const grid = input.subject && typeof input.subject === "object" ? input.subject : {};
    const cols = clamp(grid.cols, 2, 7, 5);
    const rows = clamp(grid.rows, 2, 6, 4);

    // Heights: either given, or a plausible varied massing. Never random at
    // render time — a GIF that differs between two runs of the same spec is not
    // reproducible, and reproducibility is the whole promise of keeping spec.json.
    const given = arr(grid.heights).map((h) => clamp(h, 1, 6, 2));
    const cells = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const i = z * cols + x;
        cells.push({ x, z, h: given[i] ?? 1 + ((i * 7 + z * 3) % 4) });
      }
    }
    if (cells.length > CAPS.transform.cells) {
      rep.warn(`${cells.length} cells is dense for 800x400; ${CAPS.transform.cells} is the cap.`);
    }

    return { stages, cols, rows, cells: cells.slice(0, CAPS.transform.cells) };
  },

  iterate(input, rep) {
    const c = CAPS.iterate.variants;
    let variants = arr(input.variants).map((v, i) => ({
      id: slug(v.id) || `v${i}`,
      label: fit(v.label || String(i + 1).padStart(2, "0"), 6, `variants[${i}].label`, rep),
      score: clamp(v.score, 0, 1, 0.5),
    }));

    if (variants.length < c.min) {
      rep.fail(
        `iterate needs at least ${c.min} variants — ${variants.length} given. The point of the ` +
          `diagram is that there were many and one was chosen.`,
      );
    }
    variants = cap(variants, c.max, "variants", rep);

    const criteria = arr(input.criteria)
      .map((x, i) => fit(x, 18, `criteria[${i}]`, rep))
      .filter(Boolean)
      .slice(0, CAPS.iterate.criteria);
    if (arr(input.criteria).length > CAPS.iterate.criteria) {
      rep.warn(`criteria capped at ${CAPS.iterate.criteria}; more than three cannot be read.`);
    }

    let winner = slug(input.winner);
    if (!variants.some((v) => v.id === winner)) {
      // Highest score, and say so — a silent pick would be a lie about who chose.
      const best = variants.reduce((a, b) => (b.score > a.score ? b : a), variants[0]);
      if (winner) rep.warn(`winner "${winner}" is not a variant; using the top-scoring one.`);
      winner = best?.id ?? null;
    }

    // The tiles are a sample of the field, not the field. A studio that ran 40
    // options should say 40 even when nine will fit — so the count is its own
    // number, and it can never be smaller than what is drawn.
    const total = Math.max(variants.length, clamp(input.total, variants.length, 9999, variants.length));

    return {
      variants,
      criteria,
      winner,
      total,
      selectedBy: str(input.selectedBy) || "Reviewed with you",
    };
  },

  exchange(input, rep) {
    const ROLES = ["authoring", "compute", "store", "view", "client"];
    const c = CAPS.exchange.nodes;
    let nodes = arr(input.nodes).map((n, i) => ({
      id: slug(n.id) || `n${i}`,
      label: fit(n.label, 16, `nodes[${i}].label`, rep),
      sub: fit(n.sub || "", 20, `nodes[${i}].sub`, rep),
      role: ROLES.includes(n.role) ? n.role : "compute",
    }));

    if (nodes.length < c.min) {
      rep.fail(`exchange needs at least ${c.min} nodes — ${nodes.length} given.`);
    }
    if (nodes.length > c.max) {
      rep.warn(
        `${nodes.length} tools is past the point where the diagram reads as a hairball. ` +
          `Ask whether two of them are really one node to the client.`,
      );
    }
    nodes = cap(nodes, c.max, "nodes", rep);

    const ids = new Set(nodes.map((n) => n.id));
    const links = cap(
      arr(input.links)
        .map((l, i) => ({
          from: slug(l.from),
          to: slug(l.to),
          payload: fit(l.payload || "", TEXT.artifact, `links[${i}].payload`, rep),
          both: l.direction === "both",
          owner: owner(l.owner),
        }))
        .filter((l) => {
          if (ids.has(l.from) && ids.has(l.to) && l.from !== l.to) return true;
          rep.warn(`link ${l.from} -> ${l.to} dropped: unknown or self-referential node.`);
          return false;
        }),
      CAPS.exchange.links,
      "links",
      rep,
    );

    if (nodes.length && !links.length) {
      rep.fail(
        `exchange with no links is an org chart, not a workflow. Every diagram needs a ` +
          `direction of travel: say what actually moves between these tools.`,
      );
    }

    return { nodes, links, hub: slug(input.hub) || null };
  },
};

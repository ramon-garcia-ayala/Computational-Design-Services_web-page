/**
 * exchange — the tools, and what actually moves between them.
 *
 * The interoperability diagram, and the one most likely to go wrong. Asked to
 * "show how everything connects", the natural output is a hairball: every node
 * joined to every other, no direction of travel, nothing named on the lines. At
 * that point it has stopped being a workflow and become a taxonomy, and a
 * taxonomy tells the client nothing about what they are buying.
 *
 * Three decisions keep it honest:
 *
 *   - Nodes sit on a ring, hub in the middle, so the reading direction is
 *     outside-in rather than left-to-right-and-also-diagonally.
 *   - Every link carries a payload label. If you cannot name what travels, the
 *     link is a guess and does not belong in a document with a price on it.
 *   - A packet animates along each link in turn, which is what turns a static
 *     graph into a statement about direction.
 */

import { C, TYPE, STROKE, RADIUS } from "../lib/tokens.mjs";
import { rect, text, line, circle, textWidth } from "../lib/draw.mjs";
import { track, enter } from "../lib/timeline.mjs";
import { stage, heading, legend, baseline, paper, fitText } from "../lib/layout.mjs";

const NODE_H = 40;

/** What the role says about the box, beyond its label. */
const ROLE = {
  authoring: { fill: C.wash, note: "AUTHORING" },
  compute: { fill: C.lime, note: "AUTOMATED" },
  store: { fill: C.paper, note: "DATA" },
  view: { fill: C.wash, note: "REVIEW" },
  client: { fill: C.paper, note: "YOURS" },
};

export function buildExchange(spec) {
  const { nodes, links, hub } = spec.body;
  const S = stage();
  const D = spec.duration;
  const out = [paper(), baseline()];

  const hubNode = nodes.find((n) => n.id === hub) ?? null;
  const ring = order(nodes.filter((n) => n !== hubNode), links);

  const cx = S.x + S.w / 2;
  const cy = S.y + S.h / 2 - 2;
  const rx = Math.min(S.w / 2 - 76, 272);
  const ry = Math.min(S.h / 2 - 18, 118);

  const pos = new Map();

  ring.forEach((n, i) => {
    // Start at the top and go clockwise. An ellipse rather than a circle,
    // because the canvas is 2:1 and a circle would waste both sides.
    const a = -Math.PI / 2 + (i / ring.length) * Math.PI * 2;
    // The box is sized to the wider of its two lines, capped so a long sub-line
    // cannot push a node into its neighbour. Anything past the cap is stepped
    // down by fitText below rather than overflowing the border, which is what
    // "Coordinated model" did to the Revit box on the first pass.
    const w = Math.min(
      148,
      Math.max(
        88,
        textWidth(n.label.toUpperCase(), TYPE.label.size, TYPE.label.tracking) + 26,
        textWidth(n.sub, TYPE.sub.size, TYPE.sub.tracking) + 20,
      ),
    );
    const y = cy + Math.sin(a) * ry;
    pos.set(n.id, {
      x: cx + Math.cos(a) * rx,
      y,
      w,
      node: n,
      // Which side of the ring this node sits on, so its role caption can be
      // placed pointing away from the centre. Captions placed uniformly above
      // the box collide with the link labels crossing the ring's lower half —
      // that was the single worst artefact in the first draft.
      outward: y >= cy ? 1 : -1,
    });
  });
  if (hubNode) {
    const w = Math.max(
      104,
      textWidth(hubNode.label.toUpperCase(), TYPE.label.size, TYPE.label.tracking) + 30,
    );
    pos.set(hubNode.id, { x: cx, y: cy, w, node: hubNode, outward: -1 });
  }

  const linkAt = (i) => Math.round(D * 0.3 + (i / Math.max(1, links.length)) * D * 0.52);

  /* ---- links, behind the nodes ---- */

  links.forEach((l, i) => {
    const a = pos.get(l.from);
    const b = pos.get(l.to);
    if (!a || !b) return;
    const t0 = linkAt(i);

    // Stop each end at the box edge rather than its centre, so the line does not
    // run under the label.
    const [p1, p2] = trim(a, b);
    const automated = l.owner === "automated";

    out.push(
      line({
        points: [p1, p2],
        stroke: automated ? C.ink2 : C.ink3,
        width: automated ? STROKE.thin : STROKE.hair,
        dashPattern: automated ? null : "5 4",
        z: 4,
        ...(automated
          ? { drawOn: { at: t0, dur: 520 } }
          : { track: enter(t0, { dur: 400, dy: 0 }) }),
      }),
    );

    if (l.payload) {
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;
      const label = l.payload.toUpperCase();
      const w = textWidth(label, TYPE.artifact.size, TYPE.artifact.tracking) + 10;
      out.push(
        rect({
          x: mx - w / 2,
          y: my - 7,
          w,
          h: 14,
          rx: RADIUS.chip,
          fill: C.paper,
          z: 5,
          track: enter(t0 + 240, { dur: 340, dy: 0 }),
        }),
        text({
          x: mx,
          y: my + 3,
          value: label,
          ...TYPE.artifact,
          anchor: "middle",
          z: 6,
          track: enter(t0 + 240, { dur: 340, dy: 0 }),
        }),
      );
    }

    // The packet. This is what makes it a workflow rather than a diagram of
    // boxes: something is visibly going somewhere.
    out.push(
      circle({
        cx: p1[0],
        cy: p1[1],
        r: 2.5,
        fill: C.ink,
        origin: [p1[0], p1[1]],
        z: 7,
        track: track({
          opacity: [
            { t: t0 + 300, v: 0, ease: "linear" },
            { t: t0 + 400, v: 1, ease: "linear" },
            { t: t0 + 1000, v: 1, ease: "linear" },
            { t: t0 + 1120, v: 0 },
          ],
          tx: [
            { t: t0 + 400, v: 0, ease: "inOut" },
            { t: t0 + 1000, v: p2[0] - p1[0] },
          ],
          ty: [
            { t: t0 + 400, v: 0, ease: "inOut" },
            { t: t0 + 1000, v: p2[1] - p1[1] },
          ],
        }),
      }),
    );
  });

  /* ---- nodes ---- */

  [...ring, ...(hubNode ? [hubNode] : [])].forEach((n, i) => {
    const p = pos.get(n.id);
    const role = ROLE[n.role] ?? ROLE.compute;
    const isHub = n === hubNode;
    const t0 = Math.round((i / nodes.length) * D * 0.26);
    const h = n.sub ? NODE_H + 12 : NODE_H;
    const x = p.x - p.w / 2;
    const y = p.y - h / 2;

    out.push(
      rect({
        x,
        y,
        w: p.w,
        h,
        rx: RADIUS.card,
        fill: role.fill,
        stroke: n.role === "client" ? C.ink2 : C.ink,
        width: isHub ? STROKE.base : STROKE.thin,
        dashPattern: n.role === "client" ? "5 4" : null,
        z: 10,
        origin: [p.x, p.y],
        track: {
          ...enter(t0, { dur: 480, dy: 0 }),
          ...track({ scale: [{ t: t0, v: 0.9, ease: "out" }, { t: t0 + 520, v: 1 }] }),
        },
      }),
      text({
        x: p.x,
        y: p.y + (n.sub ? -1 : 4),
        ...TYPE.label,
        ...fitText(n.label.toUpperCase(), TYPE.label, p.w, { padding: 10 }),
        anchor: "middle",
        z: 12,
        track: enter(t0 + 120, { dur: 420, dy: 4 }),
      }),
    );

    if (n.sub) {
      out.push(
        text({
          x: p.x,
          y: p.y + 13,
          ...TYPE.sub,
          ...fitText(n.sub, TYPE.sub, p.w, { padding: 7, min: 7 }),
          anchor: "middle",
          z: 12,
          track: enter(t0 + 180, { dur: 420, dy: 4 }),
        }),
      );
    }

    // Whose tool it is, set on the outward side of the ring. One word, and it is
    // what answers the question the client is actually asking: how much of this
    // do I have to run?
    out.push(
      text({
        x: p.x,
        y: p.outward > 0 ? y + h + 13 : y - 7,
        value: role.note,
        ...TYPE.legend,
        anchor: "middle",
        fill: n.role === "compute" ? C.ink : C.ink3,
        z: 12,
        track: enter(t0 + 240, { dur: 400, dy: 4 }),
      }),
    );
  });

  out.push(
    ...heading(spec.meta.title, spec.meta.subtitle),
    ...legend(
      [
        { label: "Tools", at: 0 },
        { label: "Links", at: Math.round(D * 0.3) },
        { label: "Data", at: linkAt(0) + 400 },
      ],
      D,
    ),
  );

  return out;
}

/**
 * Walk the link graph and lay the ring out in the order things actually travel.
 *
 * Placing nodes in the order they happen to appear in the spec makes every link
 * a chord across the middle, and six chords is the hairball this archetype is
 * supposed to avoid. Following the chain instead puts consecutive steps next to
 * each other, so most links become short arcs around the rim and the reader can
 * see the direction of travel without tracing anything.
 */
function order(nodes, links) {
  if (nodes.length < 4) return nodes;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const next = new Map();
  for (const l of links) {
    if (!byId.has(l.from) || !byId.has(l.to)) continue;
    if (!next.has(l.from)) next.set(l.from, []);
    next.get(l.from).push(l.to);
  }

  // Start where nothing points, so the chain reads from its source.
  const targeted = new Set(links.map((l) => l.to));
  const start = nodes.find((n) => !targeted.has(n.id)) ?? nodes[0];

  const seen = new Set();
  const out = [];
  const walk = (id) => {
    if (seen.has(id) || !byId.has(id)) return;
    seen.add(id);
    out.push(byId.get(id));
    for (const t of next.get(id) ?? []) walk(t);
  };
  walk(start.id);
  // Anything the walk could not reach keeps its declared order at the end.
  for (const n of nodes) if (!seen.has(n.id)) out.push(n);
  return out;
}

/** Shorten a segment so it starts and ends on the boxes' edges, not centres. */
function trim(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ra = a.w / 2 + 8;
  const rb = b.w / 2 + 8;
  // Elliptical inset: the boxes are much wider than tall, so backing off by the
  // half-width alone leaves a gap on the vertical links. Blend by direction.
  const insetA = Math.abs(ux) * ra + Math.abs(uy) * (NODE_H / 2 + 12);
  const insetB = Math.abs(ux) * rb + Math.abs(uy) * (NODE_H / 2 + 12);
  return [
    [a.x + ux * insetA, a.y + uy * insetA],
    [b.x - ux * insetB, b.y - uy * insetB],
  ];
}

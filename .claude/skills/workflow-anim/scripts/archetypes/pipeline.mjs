/**
 * pipeline — input, process, output, with the data travelling the connectors.
 *
 * The workhorse: most of what a computational-design studio sells is "you give
 * us this, a step runs, you get that back". The diagram's whole job is to make
 * the direction of travel unambiguous and to name what comes out.
 *
 * Two conventions borrowed from the site's own FlowDiagram, so the animation and
 * the static diagram in the same proposal speak one language:
 *
 *   - The artifact label sits ON the connector, not between two cards. A rail
 *     that gets interrupted by a word stops reading as a rail.
 *   - Solid is ours and automatic, dashed is theirs and manual. A connector that
 *     draws itself on reads as something happening by itself; a dashed one fades
 *     in instead, because it is a handover, not an execution.
 */

import { C, TYPE, STROKE, RADIUS, OWNER } from "../lib/tokens.mjs";
import { rect, text, line, circle, textWidth } from "../lib/draw.mjs";
import { track, enter } from "../lib/timeline.mjs";
import { stage, columns, heading, legend, baseline, paper, fitText, words } from "../lib/layout.mjs";

/** A card's second line is optional, so the card is one of two heights. */
const CARD_H = 62;

export function buildPipeline(spec) {
  const { stages, flows } = spec.body;
  const S = stage();
  const D = spec.duration;
  const out = [paper(), baseline()];

  // Timing. Each stage gets an equal slice, with a tail left over so the last
  // output sits finished on screen before the loop restarts — a diagram whose
  // final state is never visible has not communicated its conclusion.
  const tail = Math.max(700, D * 0.16);
  const slice = (D - tail) / stages.length;
  const at = (i) => Math.round(i * slice);

  const cols = columns(stages.length, S, stages.length > 4 ? 30 : 40);
  const cy = S.y + S.h / 2 - 10;

  const pos = new Map();
  stages.forEach((s, i) => {
    const col = cols[i];
    pos.set(s.id, { ...col, cy, top: cy - CARD_H / 2, bottom: cy + CARD_H / 2 });
  });

  /* ---- connectors first, so cards paint over their ends ---- */

  for (const f of flows) {
    const a = pos.get(f.from);
    const b = pos.get(f.to);
    if (!a || !b) continue;
    const i = stages.findIndex((s) => s.id === f.to);
    const t0 = at(i) - slice * 0.34;

    const x1 = a.x + a.w;
    const x2 = b.x;
    const style = OWNER[f.owner];
    const automated = f.owner === "automated";

    out.push(
      line({
        points: [
          [x1 + 6, cy],
          [x2 - 10, cy],
        ],
        stroke: style.stroke,
        width: style.width,
        dashPattern: automated ? null : style.dash,
        z: 5,
        // Solid connectors draw themselves on; dashed ones fade. They cannot do
        // both — stroke-dasharray can only mean one thing at a time — and the
        // distinction happens to be exactly the right one.
        ...(automated
          ? { drawOn: { at: t0, dur: slice * 0.5 } }
          : { track: enter(t0, { dur: 420, dy: 0 }) }),
      }),
      // The arrowhead as two strokes rather than a marker: markers inherit
      // stroke-dasharray in librsvg and come out dotted.
      line({
        points: [
          [x2 - 15, cy - 4],
          [x2 - 10, cy],
          [x2 - 15, cy + 4],
        ],
        stroke: style.stroke,
        width: style.width,
        z: 6,
        track: enter(t0 + slice * 0.42, { dur: 260, dy: 0 }),
      }),
    );

    if (f.label) {
      const mid = (x1 + x2) / 2;
      const label = f.label.toUpperCase();
      const w = textWidth(label, TYPE.artifact.size, TYPE.artifact.tracking) + 12;
      const gap = x2 - x1;
      const tin = enter(t0 + slice * 0.3, { dur: 340, dy: 0 });

      if (w <= gap - 8) {
        // It fits between the cards, so it goes on the rail itself, in a
        // paper-coloured pill — the site's own convention, where the artifact
        // label sits ON the connector so the rail is never interrupted.
        out.push(
          rect({ x: mid - w / 2, y: cy - 8, w, h: 16, rx: RADIUS.chip, fill: C.paper, z: 7, track: tin }),
          text({ x: mid, y: cy + 3, value: label, ...TYPE.artifact, anchor: "middle", z: 8, track: tin }),
        );
      } else {
        // Five stages leave about thirty pixels between cards, and no artifact
        // worth naming fits in thirty pixels. Rather than shrink the word to
        // illegibility or drop it, lift it clear of the row and tie it back to
        // the rail with a tick. Still unambiguously attached to this connector,
        // and it can be as long as it needs to be.
        const ly = cy - CARD_H / 2 - 12;
        out.push(
          text({ x: mid, y: ly, value: label, ...TYPE.artifact, anchor: "middle", z: 8, track: tin }),
          line({
            points: [
              [mid, ly + 5],
              [mid, cy - 5],
            ],
            stroke: C.rule,
            width: STROKE.hair,
            z: 7,
            track: tin,
          }),
        );
      }
    }
  }

  /* ---- cards ---- */

  stages.forEach((s, i) => {
    const p = pos.get(s.id);
    const t0 = at(i);
    const style = OWNER[s.owner];
    const isClient = s.owner !== "automated";

    // The card is drawn twice: a permanent outline, and a lime plate over it
    // that fades in for this stage's window and stays. So the diagram
    // accumulates rather than blinking, and the reader can see how far along it
    // is at any instant — which is what a looping animation needs.
    out.push(
      rect({
        x: p.x,
        y: p.top,
        w: p.w,
        h: CARD_H,
        rx: RADIUS.card,
        fill: C.paper,
        stroke: style.stroke,
        width: style.width,
        dashPattern: isClient ? style.dash : null,
        z: 10,
        track: enter(t0, { dur: 520 }),
      }),
      rect({
        x: p.x,
        y: p.top,
        w: p.w,
        h: CARD_H,
        rx: RADIUS.card,
        fill: s.kind === "output" ? C.lime : C.wash,
        stroke: style.stroke,
        width: style.width,
        dashPattern: isClient ? style.dash : null,
        z: 11,
        track: track({
          opacity: [
            { t: 0, v: 0, ease: "linear" },
            { t: t0 + 180, v: 0, ease: "out" },
            { t: t0 + 700, v: 1, ease: "linear" },
            { t: D, v: 1 },
          ],
        }),
      }),
    );

    // The kind marker: a small square top-left of the card. Input and output are
    // the two the reader has to find first, so only those get one.
    if (s.kind === "input" || s.kind === "output") {
      out.push(
        rect({
          x: p.x + 10,
          y: p.top + 10,
          w: 5,
          h: 5,
          fill: s.kind === "output" ? C.ink : C.ink3,
          z: 14,
          track: enter(t0 + 200, { dur: 300, dy: 0 }),
        }),
      );
    }

    // Card width falls out of the stage count, so a label inside the character
    // budget can still be too wide for a fifth of the canvas. Step the size down
    // rather than clip: a point smaller than its neighbours is invisible, a
    // truncated word is not.
    const lab = fitText(s.label.toUpperCase(), TYPE.label, p.w);
    if (lab.clipped) {
      spec.notes.push(
        `"${s.label}" does not fit a card ${Math.round(p.w)}px wide — shown as ` +
          `"${lab.value}". With ${stages.length} stages a label has room for about ` +
          `${lab.value.length - 1} characters. Move the detail into \`sub\`.`,
      );
    }
    out.push(
      text({
        x: p.cx,
        y: p.top + (s.sub ? 30 : 36),
        ...TYPE.label,
        ...lab,
        anchor: "middle",
        z: 15,
        track: enter(t0 + 120, { dur: 460, dy: 6 }),
      }),
    );
    if (s.sub) {
      const sub = fitText(s.sub, TYPE.sub, p.w, { padding: 8, min: 7 });
      if (sub.clipped) {
        spec.notes.push(`Sub-line "${s.sub}" was clipped to "${sub.value}".`);
      }
      out.push(
        text({
          x: p.cx,
          y: p.top + 45,
          ...TYPE.sub,
          ...sub,
          anchor: "middle",
          z: 15,
          track: enter(t0 + 200, { dur: 460, dy: 6 }),
        }),
      );
    }

    // Ownership, spelled out under the client's own steps. One word, and it
    // stops the client reading their own homework as something we do for them.
    if (isClient) {
      out.push(
        text({
          x: p.cx,
          y: p.bottom + 16,
          value: s.owner === "client" ? "YOU PROVIDE" : "MANUAL",
          ...TYPE.legend,
          anchor: "middle",
          fill: C.ink3,
          z: 15,
          track: enter(t0 + 300, { dur: 400, dy: 4 }),
        }),
      );
    }
  });

  /* ---- a dot travelling the whole chain, once, after everything is up ---- */

  const first = pos.get(stages[0].id);
  const last = pos.get(stages[stages.length - 1].id);
  const runStart = at(stages.length - 1) + 420;
  if (runStart < D - 500) {
    out.push(
      circle({
        cx: first.x + first.w + 6,
        cy,
        r: 3,
        fill: C.ink,
        z: 20,
        origin: [first.x + first.w + 6, cy],
        track: track({
          opacity: [
            { t: runStart - 100, v: 0, ease: "linear" },
            { t: runStart, v: 1, ease: "linear" },
            { t: D - 260, v: 1, ease: "linear" },
            { t: D - 60, v: 0 },
          ],
          tx: [
            { t: runStart, v: 0, ease: "inOut" },
            { t: D - 260, v: last.x - first.x - first.w - 6 },
          ],
        }),
      }),
    );
  }

  out.push(
    ...heading(spec.meta.title, spec.meta.subtitle),
    ...legend(
      stages.map((s, i) => ({ label: words(s.label, 12), at: at(i) })),
      D,
    ),
  );

  return out;
}

/**
 * iterate — many options generated, compared, one chosen.
 *
 * The diagram a sceptical client needs. The fear behind "computational design"
 * is that the computer decides; what actually happens is that the computer
 * produces the field and a person picks from it. So the animation is built
 * around the moment of selection: the variants fan out, the bars fill, and then
 * one is marked — with the line that says who marked it.
 *
 * That last label is not decoration. Without it the diagram says the machine
 * chose, which is both untrue and the thing the reader was worried about.
 */

import { C, TYPE, STROKE, RADIUS } from "../lib/tokens.mjs";
import { rect, text, circle, textWidth } from "../lib/draw.mjs";
import { track, enter, grow } from "../lib/timeline.mjs";
import { stage, heading, legend, baseline, paper } from "../lib/layout.mjs";

export function buildIterate(spec) {
  const { variants, criteria, winner, selectedBy, total } = spec.body;
  const S = stage();
  const D = spec.duration;
  const out = [paper(), baseline()];

  const n = variants.length;
  // Rows of at most 6 keep each tile wide enough for a score bar to be readable.
  const perRow = n <= 6 ? n : Math.ceil(n / 2);
  const rowCount = Math.ceil(n / perRow);

  const gap = 14;
  const tileW = (S.w - gap * (perRow - 1)) / perRow;
  const tileH = Math.min(96, (S.h - gap * (rowCount - 1) - 34) / rowCount);
  const gridH = tileH * rowCount + gap * (rowCount - 1);
  const top = S.y + (S.h - gridH - 30) / 2;

  // Three acts: generate, score, select. The select act gets the longest tail —
  // a decision the reader does not have time to register has not been shown.
  const genEnd = D * 0.34;
  const scoreEnd = D * 0.66;
  const pickAt = Math.round(scoreEnd + 160);

  const place = (i) => {
    const r = Math.floor(i / perRow);
    const c = i % perRow;
    const inRow = Math.min(perRow, n - r * perRow);
    // Centre a short last row rather than leaving it flush left.
    const rowW = inRow * tileW + (inRow - 1) * gap;
    const x0 = S.x + (S.w - rowW) / 2;
    return { x: x0 + c * (tileW + gap), y: top + r * (tileH + gap) };
  };

  variants.forEach((v, i) => {
    const p = place(i);
    const isWinner = v.id === winner;
    const genAt = Math.round((i / n) * genEnd * 0.82);
    const scoreAt = Math.round(genEnd + (i / n) * (scoreEnd - genEnd) * 0.8);

    out.push(
      rect({
        x: p.x,
        y: p.y,
        w: tileW,
        h: tileH,
        rx: RADIUS.card,
        fill: C.paper,
        stroke: C.rule,
        width: STROKE.thin,
        z: 10,
        track: enter(genAt, { dur: 480, dy: 8 }),
      }),
    );

    // A silhouette standing in for the option: three stacked bars whose profile
    // is derived from the variant's own id and score. A single grey rectangle
    // reads as an unloaded image placeholder — the point of the grid is that the
    // options differ, so they have to look different at a glance.
    const baseY = p.y + tileH - 30;
    const maxG = tileH - 46;
    const seed = hash(v.id);
    const bw = Math.min(16, (tileW - 34) / 3);
    for (let b = 0; b < 3; b++) {
      const f = 0.35 + ((seed >> (b * 3)) & 7) / 10 + v.score * 0.32;
      const gh = Math.max(6, Math.min(maxG, maxG * f));
      out.push(
        rect({
          x: p.x + tileW / 2 - (bw * 3 + 4) / 2 + b * (bw + 2),
          y: baseY - gh,
          w: bw,
          h: gh,
          fill: C.paper,
          stroke: C.ink3,
          width: STROKE.hair,
          origin: [p.x, baseY],
          z: 11,
          track: {
            ...enter(genAt + 100 + b * 60, { dur: 420, dy: 0 }),
            ...grow(genAt + 100 + b * 60, "y", { dur: 460 }),
          },
        }),
      );
    }

    // Score bar along the bottom. scaleX from the left edge — the same transform
    // channel the extrusion uses, for the same parity reason.
    const barY = p.y + tileH - 18;
    const barW = tileW - 20;
    out.push(
      rect({
        x: p.x + 10,
        y: barY,
        w: barW,
        h: 3,
        fill: C.ruleSoft,
        z: 12,
        track: enter(genAt + 200, { dur: 360, dy: 0 }),
      }),
      rect({
        x: p.x + 10,
        y: barY,
        w: barW * v.score,
        h: 3,
        // Ink on the winner, because by then its tile is lime and limeDeep on
        // lime is a bar you cannot see.
        fill: isWinner ? C.ink : C.ink3,
        origin: [p.x + 10, barY],
        z: 13,
        track: grow(scoreAt, "x", { dur: 520 }),
      }),
      text({
        x: p.x + 10,
        y: p.y + 16,
        value: v.label.toUpperCase(),
        ...TYPE.legend,
        z: 14,
        track: enter(genAt + 140, { dur: 360, dy: 4 }),
      }),
    );

    if (isWinner) {
      // The selection: a lime plate over the tile's own white fill but under its
      // contents, and an ink outline over everything. Lime as a plane, never as
      // a line — on white a lime stroke is invisible. The z matters: painted
      // under the tile it would be covered by the tile's opaque paper fill and
      // the selection would simply never appear.
      out.push(
        rect({
          x: p.x,
          y: p.y,
          w: tileW,
          h: tileH,
          rx: RADIUS.card,
          fill: C.lime,
          z: 10.5,
          track: track({
            opacity: [
              { t: 0, v: 0, ease: "linear" },
              { t: pickAt, v: 0, ease: "out" },
              { t: pickAt + 420, v: 1, ease: "linear" },
              { t: D, v: 1 },
            ],
          }),
        }),
        rect({
          x: p.x - 3,
          y: p.y - 3,
          w: tileW + 6,
          h: tileH + 6,
          rx: RADIUS.card + 2,
          fill: "none",
          stroke: C.ink,
          width: STROKE.base,
          origin: [p.x + tileW / 2, p.y + tileH / 2],
          z: 20,
          track: track({
            opacity: [
              { t: 0, v: 0, ease: "linear" },
              { t: pickAt, v: 0, ease: "out" },
              { t: pickAt + 300, v: 1, ease: "linear" },
              { t: D, v: 1 },
            ],
            scale: [
              { t: pickAt, v: 1.12, ease: "out" },
              { t: pickAt + 480, v: 1 },
            ],
          }),
        }),
      );
    }
  });

  /* ---- who chose, and against what ---- */

  const footY = top + gridH + 22;

  // The count is the total studied, not the number of tiles. Nine tiles standing
  // for forty options is honest as long as the figure says forty — and an
  // architect reads quantities, so a diagram that says "many options" says
  // nothing. `total` exists precisely so the tile count never has to lie.
  const countLabel = `${total} OPTIONS${total > n ? `, ${n} SHOWN` : ""}`;

  out.push(
    text({
      x: S.x,
      y: footY,
      value: countLabel,
      ...TYPE.figure,
      z: 30,
      track: enter(Math.round(genEnd * 0.2), { dur: 420, dy: 4 }),
    }),
  );

  if (criteria.length) {
    let cx = S.x + textWidth(countLabel, TYPE.figure.size, TYPE.figure.tracking) + 22;
    criteria.forEach((c, i) => {
      const label = c.toUpperCase();
      const w = textWidth(label, TYPE.legend.size, TYPE.legend.tracking);
      out.push(
        circle({
          cx: cx + 2,
          cy: footY - 3,
          r: 2,
          fill: C.ink3,
          z: 30,
          track: enter(genEnd + i * 120, { dur: 320, dy: 0 }),
        }),
        text({
          x: cx + 9,
          y: footY,
          value: label,
          ...TYPE.legend,
          z: 30,
          track: enter(genEnd + i * 120, { dur: 380, dy: 4 }),
        }),
      );
      cx += 9 + w + 20;
    });
  }

  out.push(
    text({
      x: S.x + S.w,
      y: footY,
      value: `${selectedBy.toUpperCase()} > 1`,
      ...TYPE.legend,
      fill: C.ink,
      anchor: "end",
      z: 30,
      track: enter(pickAt + 200, { dur: 460, dy: 4 }),
    }),
  );

  out.push(
    ...heading(spec.meta.title, spec.meta.subtitle),
    ...legend(
      [
        { label: "Generate", at: 0 },
        { label: "Score", at: Math.round(genEnd) },
        { label: "Select", at: pickAt },
      ],
      D,
    ),
  );

  return out;
}

/**
 * A stable integer from the variant's id.
 *
 * Deliberately not Math.random: the same spec has to produce the same bytes on
 * every run, or `spec.json` sitting next to the output is a promise the
 * generator cannot keep. Silhouettes vary because the ids do.
 */
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

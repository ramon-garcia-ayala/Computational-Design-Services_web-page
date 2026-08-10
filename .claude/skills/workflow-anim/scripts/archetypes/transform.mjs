/**
 * transform — the same information, automatically re-expressed.
 *
 * This is the archetype the studio's original header.gif used, and it is the
 * most persuasive of the four for an architect, because it shows the one thing
 * they already know is expensive: redrawing something that already exists.
 *
 * Exactly three stages, and the validator enforces it. Flat plates arrive on a
 * site grid; they gain height; the massing resolves. A fourth stage always turns
 * out to be indecision about what the transformation actually is.
 *
 * The extrusion is a scaleY about each volume's own base. That matters for more
 * than economy: it means the growth is a CSS transform, so the animated SVG and
 * the sampled GIF frames are computing the same number rather than each having
 * their own idea of how tall the box is at 1.4 seconds.
 */

import { C, TYPE } from "../lib/tokens.mjs";
import { path, text, rect, textWidth } from "../lib/draw.mjs";
import { track, enter } from "../lib/timeline.mjs";
import { stage, heading, legend, baseline, paper } from "../lib/layout.mjs";
import { box, plate, ground, project, sortBoxes, extent } from "../lib/iso.mjs";

export function buildTransform(spec) {
  const { stages, cols, rows, cells } = spec.body;
  const S = stage();
  const D = spec.duration;
  const out = [paper(), baseline()];



  // Three windows across the loop, with a tail so the finished massing is on
  // screen for a beat before it restarts.
  const tail = D * 0.18;
  const slice = (D - tail) / 3;
  const T = [0, Math.round(slice), Math.round(slice * 2)];

  /* ---- fit the grid to the stage box ---- */

  const maxH = Math.max(...cells.map((c) => c.h));
  const probe = extent(cols, rows, maxH, 1);
  const unit = Math.min((S.w * 0.9) / probe.w, (S.h * 1.02) / probe.h);
  const ext = extent(cols, rows, maxH, unit);
  const ox = S.x + S.w / 2 - (ext.minX + ext.maxX) / 2;
  const oy = S.y + S.h / 2 - (ext.minY + ext.maxY) / 2;
  const iso = { s: unit, ox, oy };

  /* ---- the site grid, always there, faint ---- */

  const g = ground(cols, rows, { ...iso, z: -20 });
  out.push(
    path({
      d: g.d,
      stroke: g.stroke,
      width: g.width,
      z: g.z,
      track: enter(0, { dur: 620, dy: 6 }),
    }),
  );

  /* ---- per cell: a flat plate, then a volume that grows out of it ---- */

  // Painting order is ascending (x + y + z), which for axis-aligned boxes on a
  // grid at 30 degrees is provably back-to-front. No centroid sort, so no
  // frame-to-frame flicker — which also keeps the GIF's inter-frame deltas small.
  const ordered = sortBoxes(cells.map((c) => ({ ...c, y: 0 })));

  ordered.forEach((c, i) => {
    // Stagger by position rather than by index, so the plates sweep across the
    // site the way a hand would lay them out, instead of popping in list order.
    const wave = (c.x + c.z) / (cols + rows);
    const plateAt = T[0] + wave * slice * 0.72;
    const riseAt = T[1] + wave * slice * 0.66;

    out.push(
      // The plates are the lime moment at the front of the arc: a site plan the
      // eye reads as one figure. The volumes then rise out of them in white and
      // the accent returns on the roofs at the end. Lime, white, lime.
      plate(
        { x: c.x, z: c.z, w: 0.86, d: 0.86 },
        {
          ...iso,
          fill: C.lime,
          stroke: C.ink,
          z: -10 + i * 0.001,
          track: enter(plateAt, { dur: 420, dy: 8 }),
        },
      ),
    );

    // The volume. Declared at full height and scaled down to nothing at the
    // start — the declared-end-state rule, which is what stops the GIF and any
    // PDF import rendering an empty site.
    const base = project(c.x + 0.43, 0, c.z + 0.43, unit, ox, oy);
    const rise = track({
      scaleY: [
        { t: 0, v: 0.001, ease: "linear" },
        { t: riseAt, v: 0.001, ease: "out" },
        { t: riseAt + 620, v: 1 },
      ],
      opacity: [
        { t: 0, v: 0, ease: "linear" },
        { t: riseAt, v: 0, ease: "linear" },
        { t: riseAt + 200, v: 1 },
      ],
    });

    // The volumes are drawn as an axonometric would be: near-white faces, grey
    // sides from the same shading multipliers, ink edges. Twenty lime blocks on
    // white is a highlighter, not a drawing — and it spends the accent before
    // the diagram has anything to say with it.
    for (const face of box(
      { x: c.x, y: 0, z: c.z, w: 0.86, h: c.h, d: 0.86 },
      { ...iso, base: C.paper, z: i * 0.01 },
    )) {
      out.push({ ...face, track: rise, origin: base });
    }

    // Lime lands on the roofs, and only once the third stage says the model is
    // built. That is the accent doing work: it marks the moment the massing
    // stops being geometry and becomes the deliverable.
    const roof = box(
      { x: c.x, y: 0, z: c.z, w: 0.86, h: c.h, d: 0.86 },
      { ...iso, base: C.lime, z: i * 0.01 + 0.005 },
    )[0];
    out.push({
      ...roof,
      origin: base,
      track: track({
        scaleY: [
          { t: 0, v: 0.001, ease: "linear" },
          { t: riseAt, v: 0.001, ease: "out" },
          { t: riseAt + 620, v: 1 },
        ],
        opacity: [
          { t: 0, v: 0, ease: "linear" },
          { t: T[2] + wave * slice * 0.5, v: 0, ease: "out" },
          { t: T[2] + wave * slice * 0.5 + 420, v: 1, ease: "linear" },
          { t: D, v: 1 },
        ],
      }),
    });
  });

  /* ---- the stage caption, swapped in place ---- */

  const capY = S.y - 16;
  stages.forEach((st, i) => {
    const label = st.label.toUpperCase();
    const w = textWidth(label, TYPE.label.size, TYPE.label.tracking);
    const next = i < 2 ? T[i + 1] : null;

    out.push(
      text({
        x: S.x + S.w - w,
        y: capY,
        value: label,
        ...TYPE.label,
        z: 90,
        // Each caption holds its window and then hands over. The last one stays
        // to the end, because that is the sentence the reader should be left on.
        track: track({
          opacity: [
            { t: 0, v: 0, ease: "linear" },
            { t: Math.max(0, T[i] - 120), v: 0, ease: "out" },
            { t: T[i] + 240, v: 1, ease: "linear" },
            ...(next
              ? [
                  { t: next - 200, v: 1, ease: "out" },
                  { t: next + 40, v: 0, ease: "linear" },
                  { t: D, v: 0 },
                ]
              : [{ t: D, v: 1 }]),
          ],
          ty: [
            { t: Math.max(0, T[i] - 120), v: 6, ease: "out" },
            { t: T[i] + 240, v: 0 },
          ],
        }),
      }),
      // A short rule under the caption that grows with it — the one place the
      // eye is told "this is the current state", without a colour change.
      rect({
        x: S.x + S.w - w,
        y: capY + 7,
        w,
        h: 1.5,
        fill: C.lime,
        origin: [S.x + S.w - w, capY + 7],
        z: 89,
        track: track({
          scaleX: [
            { t: 0, v: 0, ease: "linear" },
            { t: T[i], v: 0, ease: "out" },
            { t: T[i] + 520, v: 1, ease: "linear" },
            ...(next ? [{ t: next, v: 1, ease: "out" }, { t: next + 260, v: 0 }] : [{ t: D, v: 1 }]),
          ],
        }),
      }),
    );
  });

  out.push(
    ...heading(spec.meta.title, spec.meta.subtitle),
    ...legend(
      stages.map((st, i) => ({ label: st.legend, at: T[i] })),
      D,
    ),
  );

  return out;
}

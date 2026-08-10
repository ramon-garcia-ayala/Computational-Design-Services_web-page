/**
 * Layout, and the shared chrome every archetype is framed by.
 *
 * The chrome is the reason four archetypes look like one family: status dot,
 * tracked title, subtitle, and a stage legend along the bottom whose dots light
 * as the animation advances. Each archetype then only has to lay out the middle.
 *
 * The legend is not decoration. A looping animation is joined halfway by most
 * readers, and the lit dots are the only thing that says where in the story
 * they landed.
 */

import { C, TYPE, CANVAS, STROKE, RADIUS } from "./tokens.mjs";
import { rect, circle, text, line, textWidth } from "./draw.mjs";
import { track, enter } from "./timeline.mjs";

/** The rectangle an archetype may draw inside. */
export function stage() {
  const { width, height, pad } = CANVAS;
  return {
    x: pad.left,
    y: pad.top,
    w: width - pad.left - pad.right,
    h: height - pad.top - pad.bottom,
    cx: pad.left + (width - pad.left - pad.right) / 2,
    cy: pad.top + (height - pad.top - pad.bottom) / 2,
  };
}

/**
 * Split a horizontal band into n columns with a fixed gutter. Used by every
 * archetype that lays things out left to right, so the rhythm is shared.
 */
export function columns(n, { x, w }, gutter = 26) {
  const cw = (w - gutter * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: x + i * (cw + gutter),
    w: cw,
    cx: x + i * (cw + gutter) + cw / 2,
  }));
}

/**
 * Does a label fit in a box, allowing for the font substituting wider?
 *
 * Nothing here measures text. Boxes are sized from the mono advance ratio and
 * checked against a pessimistic scale, because librsvg's fallback mono and the
 * browser's JetBrains Mono differ by about 10% and we would rather find that
 * out now than in the client's inbox.
 */
export const fits = (value, size, tracking, boxWidth, padding = 16, tolerance = 1.15) =>
  textWidth(value, size, tracking) * tolerance <= boxWidth - padding * 2;

/**
 * Shrink a label until it fits its box, then give up and clip.
 *
 * Character caps alone cannot prevent overflow, because the box width depends on
 * how many stages there are: "PRICED AGAINST RATES" is within the 24-character
 * budget and still 30% too wide for a fifth of the canvas. Stepping the size
 * down two or three points is invisible next to its neighbours and keeps the
 * whole label; clipping is the last resort, not the first.
 *
 * The tolerance is what absorbs the ~10% the font can substitute wider between
 * a browser with JetBrains Mono and librsvg's bundled fallback.
 */
export function fitText(value, type, boxWidth, { padding = 12, min = 8, tolerance = 1.12 } = {}) {
  const avail = boxWidth - padding * 2;
  let size = type.size;
  while (size > min && textWidth(value, size, type.tracking) * tolerance > avail) {
    size -= 0.5;
  }
  if (textWidth(value, size, type.tracking) * tolerance <= avail) return { value, size };
  // Even at the floor it does not fit. Clip to what will, and let the caller
  // decide whether to warn — a clipped label on a client's diagram is a defect,
  // not a rendering detail.
  const perChar = size * 0.6 + type.tracking;
  const room = Math.max(3, Math.floor(avail / (perChar * tolerance)));
  return { value: clip(value, room), size, clipped: true };
}

/** Truncate to a character budget, loudly — the caller reports what it dropped. */
export function clip(value, max) {
  const s = String(value ?? "").trim();
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

/** Whole words up to a character budget. Slicing mid-word turns "Cost estimate"
    into "Cost estimat", which reads as a bug rather than as an abbreviation. */
export function words(value, max) {
  const parts = String(value ?? "").split(/\s+/).filter(Boolean);
  let out = "";
  for (const w of parts) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return out || clip(parts[0] ?? "", max);
}

/* --------------------------------------------------------------------------
   Chrome
-------------------------------------------------------------------------- */

/**
 * Title, subtitle and the status dot, top-left. The dot is lime with an ink
 * ring: the one place lime appears at this size, and it works because it is a
 * filled disc rather than a stroke.
 */
export function heading(title, subtitle) {
  const x = CANVAS.pad.left;
  const out = [
    circle({
      cx: x + 4,
      cy: 30,
      r: RADIUS.dot,
      fill: C.lime,
      stroke: C.ink,
      width: STROKE.hair,
      z: 90,
      track: track({ opacity: [{ t: 0, v: 0 }, { t: 320, v: 1 }] }),
    }),
    text({
      x: x + 16,
      y: 34,
      value: String(title).toUpperCase(),
      ...TYPE.title,
      z: 90,
      track: enter(80, { dur: 460, dy: 6 }),
    }),
  ];
  if (subtitle) {
    out.push(
      text({
        x: x + 16,
        y: 50,
        value: String(subtitle).toUpperCase(),
        ...TYPE.subtitle,
        z: 90,
        track: enter(180, { dur: 460, dy: 6 }),
      }),
    );
  }
  return out;
}

/**
 * The stage legend along the bottom.
 *
 * Each entry is a dot plus a word. The dot fills lime and the word darkens to
 * ink while that stage is running, then both settle back — so at any instant the
 * legend answers "which step am I watching".
 *
 * `stages` is [{ label, at, until }] in ms.
 */
export function legend(stages, duration) {
  const y = CANVAS.height - 30;
  let x = CANVAS.pad.left;
  const out = [];

  for (const s of stages) {
    const label = String(s.label).toUpperCase();
    const w = textWidth(label, TYPE.legend.size, TYPE.legend.tracking);

    // Two overlaid dots: the inactive ring is always there, the lime disc fades
    // in over it for the stage's window. Cheaper than animating a fill, and a
    // fill is not interpolable the same way in both backends.
    out.push(
      circle({ cx: x + 3, cy: y - 3, r: 3, fill: "none", stroke: C.ink3, width: STROKE.hair, z: 90 }),
      circle({
        cx: x + 3,
        cy: y - 3,
        r: 3,
        fill: C.lime,
        stroke: C.ink,
        width: STROKE.hair,
        z: 91,
        track: track({
          opacity: [
            { t: 0, v: 0, ease: "linear" },
            { t: s.at, v: 0, ease: "out" },
            { t: s.at + 260, v: 1, ease: "linear" },
            { t: duration, v: 1 },
          ],
        }),
      }),
      text({
        x: x + 12,
        y,
        value: label,
        ...TYPE.legend,
        z: 90,
        track: track({
          opacity: [
            { t: 0, v: 0.35, ease: "linear" },
            { t: s.at, v: 0.35, ease: "out" },
            { t: s.at + 260, v: 1, ease: "linear" },
            { t: duration, v: 1 },
          ],
        }),
      }),
    );

    x += 12 + w + 26;
  }
  return out;
}

/** A hairline above the legend, tying the composition to the bottom edge. */
export function baseline() {
  return line({
    points: [
      [CANVAS.pad.left, CANVAS.height - 46],
      [CANVAS.width - CANVAS.pad.right, CANVAS.height - 46],
    ],
    stroke: C.ruleSoft,
    width: STROKE.hair,
    z: -5,
  });
}

/** The paper. Always first, always opaque — this is what makes the background
    white in every context including a GIF, which has no concept of transparency
    the way an SVG does. */
export function paper() {
  return rect({
    x: 0,
    y: 0,
    w: CANVAS.width,
    h: CANVAS.height,
    fill: C.paper,
    z: -1000,
  });
}

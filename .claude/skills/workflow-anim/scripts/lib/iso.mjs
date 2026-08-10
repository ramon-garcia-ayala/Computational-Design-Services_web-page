/**
 * Isometric projection — a three-dimensional look with no 3D dependency.
 *
 * True 30° axonometric rather than the 2:1 pixel-isometric of game art. Two
 * reasons: we rasterize at 2x with antialiasing, so the pixel-crispness argument
 * for 2:1 does not apply; and 30° is the axonometric an architect already reads
 * off a drawing sheet, which is the whole audience.
 *
 * Coordinates are right-handed with +y up:
 *   x -> right and down the page   z -> left and down the page   y -> up
 */

import { C, FACE, STROKE } from "./tokens.mjs";
import { poly } from "./draw.mjs";

const COS30 = Math.cos(Math.PI / 6); // 0.8660254
const SIN30 = 0.5;

/** World -> screen. `s` is the unit cell size in px. */
export function project(x, y, z, s = 18, ox = 0, oy = 0) {
  return [ox + (x - z) * COS30 * s, oy + (x + z) * SIN30 * s - y * s];
}

/**
 * Depth order without a sorter.
 *
 * Centroid sorting is the obvious approach and it is wrong here: it fails on
 * interlocking boxes and, worse, it can swap two nearly-equal centroids between
 * consecutive frames, which flickers on screen and destroys the frame-to-frame
 * coherence a GIF compresses on.
 *
 * Restricting solids to axis-aligned boxes on an integer grid buys a provably
 * correct order instead: painting in ascending (x + y + z) puts every box behind
 * everything that occludes it. No ties, no BSP tree, and the order is stable
 * across frames because it depends only on grid position, never on the animation.
 */
export const depthKey = (b) => b.x + b.y + b.z;
export const sortBoxes = (boxes) => [...boxes].sort((a, b) => depthKey(a) - depthKey(b));

/** Darken a hex by a multiplier. Used only for the three faces of a box. */
export function shade(hex, mul) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v * mul))),
  );
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * One box as its three visible parallelograms: top, left, right.
 *
 * Returns drawables, not markup — they go through the same renderDrawable as
 * everything else, so an isometric volume animates with exactly the machinery a
 * flat rectangle does.
 *
 * `ghost: true` draws the same three faces unfilled and dashed. That is the
 * repo's own convention rather than a new one: solid is built, dashed is
 * proposed, and anyone who reads drawings already knows it.
 */
export function box(b, opts = {}) {
  const { s = 18, ox = 0, oy = 0, base = C.lime, ghost = false, track = null, z = 0 } = opts;
  const { x, y, z: bz, w = 1, h = 1, d = 1 } = b;

  const p = (dx, dy, dz) => project(x + dx, y + dy, bz + dz, s, ox, oy);

  const faces = [
    // top
    { pts: [p(0, h, 0), p(w, h, 0), p(w, h, d), p(0, h, d)], mul: FACE.top },
    // left  (facing -z, toward the viewer's lower-left)
    { pts: [p(0, 0, d), p(w, 0, d), p(w, h, d), p(0, h, d)], mul: FACE.left },
    // right (facing +x, toward the viewer's lower-right)
    { pts: [p(w, 0, 0), p(w, 0, d), p(w, h, d), p(w, h, 0)], mul: FACE.right },
  ];

  // A shared origin means the three faces scale as one solid rather than drifting
  // apart. The base corner is where an extrusion should grow from.
  const origin = p(w / 2, 0, d / 2);

  return faces.map((f, i) =>
    poly({
      points: f.pts,
      fill: ghost ? "none" : shade(base, f.mul),
      stroke: ghost ? C.ink3 : C.ink,
      width: ghost ? STROKE.hair : STROKE.hair,
      dashPattern: ghost ? "3 3" : null,
      track,
      origin,
      z: z + i * 0.01,
    }),
  );
}

/** A flat plate on the ground plane: the "2D" state a volume extrudes out of. */
export function plate(b, opts = {}) {
  const { s = 18, ox = 0, oy = 0, fill = C.lime, stroke = C.ink, track = null, z = 0 } = opts;
  const { x, y = 0, z: bz, w = 1, d = 1 } = b;
  const p = (dx, dz) => project(x + dx, y, bz + dz, s, ox, oy);
  return poly({
    points: [p(0, 0), p(w, 0), p(w, d), p(0, d)],
    fill,
    stroke,
    width: STROKE.hair,
    track,
    origin: p(w / 2, d / 2),
    z,
  });
}

/**
 * The ground grid, as one `<path>` rather than 200 lines. Cheap in bytes, cheap
 * in the GIF's colour count, and it reads as a site plan under the massing.
 */
export function ground(cols, rows, opts = {}) {
  const { s = 18, ox = 0, oy = 0, stroke = C.rule, track = null, z = -10 } = opts;
  const seg = [];
  for (let i = 0; i <= cols; i++) {
    const a = project(i, 0, 0, s, ox, oy);
    const b = project(i, 0, rows, s, ox, oy);
    seg.push(`M${fmt(a)}L${fmt(b)}`);
  }
  for (let j = 0; j <= rows; j++) {
    const a = project(0, 0, j, s, ox, oy);
    const b = project(cols, 0, j, s, ox, oy);
    seg.push(`M${fmt(a)}L${fmt(b)}`);
  }
  return { d: seg.join(""), stroke, width: STROKE.hair, track, z };
}

const fmt = ([x, y]) => `${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`;

/** Bounding box of a projected grid, so an archetype can centre the composition. */
export function extent(cols, rows, height, s) {
  const pts = [];
  for (const x of [0, cols]) {
    for (const zz of [0, rows]) {
      for (const y of [0, height]) pts.push(project(x, y, zz, s));
    }
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

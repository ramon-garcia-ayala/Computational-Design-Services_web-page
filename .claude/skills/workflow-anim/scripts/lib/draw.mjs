/**
 * The primitives, and the one function that turns a drawable into markup.
 *
 * This module is the reason the animated SVG and the GIF cannot drift apart.
 * There is exactly one `renderDrawable`, and the two backends differ only in
 * what they pass it:
 *
 *   emit/svg.mjs     renderDrawable(d, null)        -> declared END state + a class
 *   emit/frames.mjs  renderDrawable(d, sample(t))   -> a resolved transform
 *
 * Neither backend knows how to draw a rectangle. So a primitive one of them
 * supports and the other does not is not a bug that can be written.
 *
 * A drawable:
 *   { id, kind, z, track, origin: [x,y], ...geometry, ...style }
 *
 * `z` is paint order — SVG has no z-index, so drawables are sorted before
 * emission. `origin` is the point transforms happen about, in user units.
 */

import { MONO_ADVANCE } from "./tokens.mjs";
import { transformAttr, transformCss } from "./timeline.mjs";

const r = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);

/** XML-escape. Client copy contains ampersands and quotes more often than you
    would hope, and an unescaped one silently truncates the whole document. */
export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* --------------------------------------------------------------------------
   Constructors. Archetypes call these rather than writing object literals, so
   defaults live in one place and a typo in a key name fails loudly here.
-------------------------------------------------------------------------- */

let seq = 0;
const nextId = (kind) => `${kind}${(seq++).toString(36)}`;

const base = (kind, p) => ({
  id: p.id ?? nextId(kind),
  kind,
  z: p.z ?? 0,
  track: p.track ?? null,
  origin: p.origin ?? null,
  opacity: p.opacity ?? 1,
  fill: p.fill ?? "none",
  stroke: p.stroke ?? "none",
  width: p.width ?? 1,
  dashPattern: p.dashPattern ?? null,
  /** Path length, when the track draws the line on. Set by the constructor. */
  len: p.len ?? null,
  cap: p.cap ?? "round",
});

export const rect = (p) => ({ ...base("rect", p), x: p.x, y: p.y, w: p.w, h: p.h, rx: p.rx ?? 0 });

export const circle = (p) => ({ ...base("circle", p), cx: p.cx, cy: p.cy, r: p.r });

export const path = (p) => ({ ...base("path", p), d: p.d });

export const poly = (p) => ({ ...base("poly", p), points: p.points, closed: p.closed !== false });

/**
 * A straight or elbowed connector. `len` is computed so a `dash` track draws it
 * on. Note the interaction: a drawable cannot both draw itself on AND look
 * dashed, because both need `stroke-dasharray`. A "manual / client-owned"
 * connector is dashed and fades in; an automated one is solid and draws on.
 * That constraint is not a limitation — it is the visual grammar, since a line
 * that draws itself reads as something happening automatically.
 */
export function line(p) {
  const pts = p.points;
  let raw = 0;
  for (let i = 1; i < pts.length; i++) {
    raw += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  const len = Math.ceil(raw) + 1;
  const d = pts.map((pt, i) => `${i ? "L" : "M"}${r(pt[0])} ${r(pt[1])}`).join(" ");

  // `drawOn` rather than a caller-supplied track, because the dash animation has
  // to use THIS line's length. A caller passing its own estimate is off by the
  // few pixels the endpoints were inset by, and stroke-dashoffset wraps modulo
  // stroke-dasharray — so an offset larger than the array does not hide the
  // line, it reveals a stub of exactly the difference. The symptom is a short
  // floating dash sitting in the gap for the whole first half of the animation.
  const track = p.drawOn
    ? { dash: [{ t: p.drawOn.at, v: len, ease: p.drawOn.ease ?? "inOut" }, { t: p.drawOn.at + (p.drawOn.dur ?? 620), v: 0 }] }
    : p.track;

  return { ...base("path", { ...p, len, track }), d };
}

export const text = (p) => ({
  ...base("text", { ...p, fill: p.fill ?? "#0a0c0b" }),
  x: p.x,
  y: p.y,
  value: p.value,
  size: p.size ?? 10,
  tracking: p.tracking ?? 0,
  weight: p.weight ?? 400,
  family: p.family,
  anchor: p.anchor ?? "start",
});

/** Width a mono string will occupy. Never measured — see tokens.MONO_ADVANCE. */
export const textWidth = (s, size, tracking = 0) =>
  String(s).length * (size * MONO_ADVANCE + tracking) - tracking;

/* --------------------------------------------------------------------------
   Rendering
-------------------------------------------------------------------------- */

function geometry(d) {
  switch (d.kind) {
    case "rect":
      return `<rect x="${r(d.x)}" y="${r(d.y)}" width="${r(d.w)}" height="${r(d.h)}"${
        d.rx ? ` rx="${r(d.rx)}"` : ""
      }`;
    case "circle":
      return `<circle cx="${r(d.cx)}" cy="${r(d.cy)}" r="${r(d.r)}"`;
    case "path":
      return `<path d="${d.d}"`;
    case "poly": {
      const pts = d.points.map((p) => `${r(p[0])},${r(p[1])}`).join(" ");
      return `<${d.closed ? "polygon" : "polyline"} points="${pts}"`;
    }
    case "text":
      return `<text x="${r(d.x)}" y="${r(d.y)}"`;
    default:
      throw new Error(`unknown drawable kind: ${d.kind}`);
  }
}

function paint(d) {
  const a = [];
  if (d.fill && d.fill !== "none") a.push(`fill="${d.fill}"`);
  else if (d.kind !== "text") a.push(`fill="none"`);
  if (d.stroke && d.stroke !== "none") {
    a.push(`stroke="${d.stroke}"`, `stroke-width="${r(d.width)}"`);
    if (d.cap) a.push(`stroke-linecap="${d.cap}"`, `stroke-linejoin="round"`);
  }
  // A track on `dash` owns stroke-dasharray; a style dash uses the pattern.
  if (d.track && "dash" in d.track) a.push(`stroke-dasharray="${d.len}"`);
  else if (d.dashPattern) a.push(`stroke-dasharray="${d.dashPattern}"`);
  return a.join(" ");
}

function typography(d) {
  const a = [
    `font-family="${d.family}"`,
    `font-size="${r(d.size)}"`,
    `fill="${d.fill}"`,
  ];
  if (d.weight !== 400) a.push(`font-weight="${d.weight}"`);
  if (d.tracking) a.push(`letter-spacing="${r(d.tracking)}"`);
  if (d.anchor !== "start") a.push(`text-anchor="${d.anchor}"`);
  // Kept out of CSS on purpose: librsvg honours the presentation attribute and
  // is inconsistent about the same property arriving through a stylesheet.
  return a.join(" ");
}

/**
 * One drawable, as markup.
 *
 * `state` is always a resolved set of channel values — there is no "unset"
 * variant, because both backends need the attributes written out. What differs
 * is `animated`:
 *
 *   animated: false  a single frame. Attributes only.
 *   animated: true   the same attributes, PLUS the class the stylesheet drives.
 *                    The caller passes the state at t = duration, so a renderer
 *                    that ignores CSS still sees the finished diagram.
 *
 * That both paths bake their state through the same code is the whole point:
 * a frame of the GIF and the animated file's declared state cannot disagree,
 * because they are the same three lines.
 */
export function renderDrawable(d, state, { animated = false } = {}) {
  const tag = geometry(d);
  const style = d.kind === "text" ? typography(d) : paint(d);

  const attrs = [tag, style];

  const o = state.opacity * d.opacity;
  if (o !== 1) attrs.push(`opacity="${r(o)}"`);
  // transformAttr returns "" when the state is at rest, so a static drawable
  // emits exactly the same bytes in both backends — which is what lets the
  // selftest compare them.
  const t = transformAttr(state, d.origin);
  if (t) attrs.push(`transform="${t}"`);
  if ("dash" in (d.track ?? {})) attrs.push(`stroke-dashoffset="${r(state.dash)}"`);

  if (animated && d.track) {
    attrs.push(`class="a ${animClass(d)}"`);
    // The CSS transform replaces the attribute one, so the origin has to travel
    // with it. `transform-box: view-box` (set on `.a`) makes these user units.
    if (d.origin) {
      attrs.push(`style="transform-origin:${r(d.origin[0])}px ${r(d.origin[1])}px"`);
    }
  }

  const open = attrs.filter(Boolean).join(" ");
  return d.kind === "text" ? `${open}>${esc(d.value)}</text>` : `${open}/>`;
}

export const animClass = (d) => `k-${d.id}`;

/** Paint order. Stable, so the GIF's frame-to-frame deltas stay small. */
export const sortDrawables = (list) =>
  list.map((d, i) => [d, i]).sort((a, b) => a[0].z - b[0].z || a[1] - b[1]).map(([d]) => d);

export { transformCss };

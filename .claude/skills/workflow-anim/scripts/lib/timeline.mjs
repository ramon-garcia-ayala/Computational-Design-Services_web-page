/**
 * The declarative animation timeline, and the two ways it is read.
 *
 * A drawable carries a `track`: a set of channels, each a list of keyframes at
 * absolute times in ms. The SVG backend turns a track into one `@keyframes` rule;
 * the GIF backend samples it at each frame time. Both read the same numbers
 * through the same easing table, so a change to one is a change to both.
 *
 * Every drawable shares the one loop period, so a key's percentage is just
 * t / duration. No per-element phase bookkeeping, no drift between the browser's
 * clock and ours.
 */

import { cssEase, ease } from "./easing.mjs";

/**
 * The channels. Deliberately few: these are the transforms a diagram needs, and
 * each has an exact CSS counterpart so the two backends describe the same thing.
 *
 *   opacity      0..1
 *   tx, ty       px, applied as translate()
 *   scale        multiplier about the drawable's own origin
 *   rotate       degrees about the drawable's own origin
 *   dash         stroke-dashoffset in px — how a line draws itself
 *   scaleX/scaleY  axis-independent scale, about the drawable's own origin
 *
 * There is deliberately no general-purpose "progress" channel that an archetype
 * interprets for itself. Such a channel could not be expressed as CSS, so the
 * SVG would have to re-emit that drawable per frame while the GIF sampled it —
 * two code paths for one effect, which is exactly the divergence this module
 * exists to prevent. Everything a diagram needs is reachable from a transform
 * about a chosen origin: a bar grows with scaleX from its left edge, a volume
 * extrudes with scaleY from its base.
 */
export const CHANNELS = ["opacity", "tx", "ty", "scale", "scaleX", "scaleY", "rotate", "dash"];

export const REST = {
  opacity: 1,
  tx: 0,
  ty: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  dash: 0,
};

/**
 * Build a track. `keys` maps channel -> [{ t, v, ease? }], times in ms.
 * Times need not be sorted; they are sorted here so an archetype can append.
 */
export function track(keys = {}) {
  const out = {};
  for (const [ch, list] of Object.entries(keys)) {
    if (!CHANNELS.includes(ch)) throw new Error(`unknown channel: ${ch}`);
    if (!list?.length) continue;
    out[ch] = [...list].sort((a, b) => a.t - b.t).map((k) => ({
      t: k.t,
      v: k.v,
      ease: k.ease ?? "out",
    }));
  }
  return out;
}

/** The commonest track by far: fade and rise into place. */
export function enter(at, { dur = 520, dy = 10, ease: e = "out" } = {}) {
  return track({
    opacity: [{ t: at, v: 0, ease: e }, { t: at + dur, v: 1 }],
    ty: [{ t: at, v: dy, ease: e }, { t: at + dur, v: 0 }],
  });
}

/** Draw a line on, from nothing to its full length. `len` is the path length. */
export function draw(at, len, { dur = 620, ease: e = "inOut" } = {}) {
  return track({
    dash: [{ t: at, v: len, ease: e }, { t: at + dur, v: 0 }],
  });
}

/** Grow along one axis from the drawable's origin: bars, extrusions, rules. */
export function grow(at, axis = "y", { dur = 560, ease: e = "out" } = {}) {
  const ch = axis === "x" ? "scaleX" : "scaleY";
  return track({ [ch]: [{ t: at, v: 0, ease: e }, { t: at + dur, v: 1 }] });
}

/** Merge tracks; later channels win outright rather than interleaving, because
    two curves on one channel is a bug the caller should see, not blend. */
export function merge(...tracks) {
  const out = {};
  for (const t of tracks) for (const [ch, keys] of Object.entries(t ?? {})) out[ch] = keys;
  return out;
}

/* -------------------------------------------------------------------------- */

/** The value of one channel at time t, in ms. */
export function sampleChannel(keys, t, fallback) {
  if (!keys?.length) return fallback;
  if (t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const p = span === 0 ? 1 : (t - a.t) / span;
      return a.v + (b.v - a.v) * ease(a.ease, p);
    }
  }
  return last.v;
}

/** The whole resolved state of a track at time t. What the frame backend draws. */
export function sample(trk, t) {
  const s = { ...REST };
  for (const [ch, keys] of Object.entries(trk ?? {})) s[ch] = sampleChannel(keys, t, REST[ch]);
  return s;
}

/* -------------------------------------------------------------------------- */

/**
 * A track as one `@keyframes` rule spanning the whole loop.
 *
 * The rule that makes this safe outside a browser: the element is *declared* at
 * its end state and the animation runs toward it with `animation-fill-mode:
 * backwards`. librsvg, PDF importers and reduced-motion readers all render the
 * declared attributes and ignore the animation — so they get the finished
 * diagram rather than a blank rectangle. This mirrors the site's own rule that
 * settling means writing the end state, never clearing the transform.
 */
export function toKeyframes(name, trk, duration) {
  // Gather every distinct time across channels, so each stop can set all of them.
  const times = new Set([0, duration]);
  for (const keys of Object.values(trk)) for (const k of keys) times.add(clamp(k.t, 0, duration));
  const sorted = [...times].sort((a, b) => a - b);

  const stops = sorted.map((t) => {
    const pct = duration === 0 ? 0 : (t / duration) * 100;
    const s = sample(trk, t);

    const props = [];
    if ("opacity" in trk) props.push(`opacity:${round(s.opacity)}`);
    if (hasTransform(trk)) props.push(`transform:${transformCss(s)}`);
    if ("dash" in trk) props.push(`stroke-dashoffset:${round(s.dash)}`);

    // The timing function belongs to the segment that *starts* here.
    const seg = segmentEaseAt(trk, t);
    if (seg && seg !== "out") props.push(`animation-timing-function:${cssEase(seg)}`);

    return `${round(pct)}%{${props.join(";")}}`;
  });

  return `@keyframes ${name}{${stops.join("")}}`;
}

const TRANSFORM_CHANNELS = ["tx", "ty", "scale", "scaleX", "scaleY", "rotate"];

export const hasTransform = (trk) => TRANSFORM_CHANNELS.some((ch) => ch in trk);

/**
 * One transform string, built from a sampled state. Both backends call this, so
 * the order of operations — translate, then rotate, then scale — is stated once.
 * The origin is supplied separately: CSS gets `transform-origin`, the frame path
 * brackets the transform with translate(±origin). Same result, same order.
 */
export function transformCss(s) {
  const parts = [];
  if (s.tx || s.ty) parts.push(`translate(${round(s.tx)}px,${round(s.ty)}px)`);
  if (s.rotate) parts.push(`rotate(${round(s.rotate)}deg)`);
  if (s.scale !== 1) parts.push(`scale(${round(s.scale)})`);
  if (s.scaleX !== 1 || s.scaleY !== 1) parts.push(`scale(${round(s.scaleX)},${round(s.scaleY)})`);
  return parts.length ? parts.join(" ") : "none";
}

/** The same transform for an SVG `transform` attribute, which takes no units
    and no transform-origin, so the origin is bracketed by hand. */
export function transformAttr(s, origin) {
  // At rest, emit nothing at all: a static drawable then produces byte-identical
  // markup in both backends, which is what the parity check in selftest relies on.
  if (s.tx === 0 && s.ty === 0 && s.scale === 1 && s.scaleX === 1 && s.scaleY === 1 && s.rotate === 0) {
    return "";
  }
  const parts = [];
  const [ox, oy] = origin ?? [0, 0];
  if (ox || oy) parts.push(`translate(${round(ox)},${round(oy)})`);
  if (s.tx || s.ty) parts.push(`translate(${round(s.tx)},${round(s.ty)})`);
  if (s.rotate) parts.push(`rotate(${round(s.rotate)})`);
  if (s.scale !== 1) parts.push(`scale(${round(s.scale)})`);
  if (s.scaleX !== 1 || s.scaleY !== 1) parts.push(`scale(${round(s.scaleX)},${round(s.scaleY)})`);
  if (ox || oy) parts.push(`translate(${round(-ox)},${round(-oy)})`);
  return parts.join(" ");
}

/** Which curve governs the segment beginning at t. If channels disagree the
    first one wins — archetypes are written so they do not disagree. */
function segmentEaseAt(trk, t) {
  for (const keys of Object.values(trk)) {
    const k = keys.find((x) => Math.abs(x.t - t) < 0.5);
    if (k && k !== keys[keys.length - 1]) return k.ease;
  }
  return null;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v) => Math.round(v * 1000) / 1000;

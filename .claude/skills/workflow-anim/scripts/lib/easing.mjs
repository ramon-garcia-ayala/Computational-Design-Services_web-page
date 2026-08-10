/**
 * Easing — the one place the CSS backend and the frame backend could drift apart.
 *
 * Everything else in this renderer shares a single drawing function, so the two
 * outputs cannot diverge structurally. Timing is the exception: the browser
 * interpolates a `cubic-bezier(...)` itself, and the GIF path has to compute the
 * same curve in JS. So both come out of one table below, and nothing else in the
 * codebase is allowed to name a curve.
 *
 * Four curves is enough. A fifth would be a fifth chance for the two backends to
 * disagree about what "smooth" means.
 */

const CURVES = {
  linear: [0, 0, 1, 1],
  /** The workhorse: fast out, long settle. Things arriving. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric. Things moving from one place to another. */
  inOut: [0.65, 0, 0.35, 1],
  /** Not a curve — a hard switch at the end. State changes with no in-between. */
  step: null,
};

export const EASE_NAMES = Object.keys(CURVES);

/** The literal the SVG's `animation-timing-function` gets. */
export function cssEase(name) {
  if (name === "step") return "steps(1,end)";
  const c = CURVES[name] ?? CURVES.out;
  return `cubic-bezier(${c.join(",")})`;
}

/* --------------------------------------------------------------------------
   The numeric side. Standard cubic-bezier-for-CSS: the curve is parametric in
   t, but we are given x (progress through the segment) and need y. So solve
   x(t) = x for t first, then evaluate y(t).
-------------------------------------------------------------------------- */

const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
const B = (a1, a2) => 3 * a2 - 6 * a1;
const Cc = (a1) => 3 * a1;

const bez = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + Cc(a1)) * t;
const slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + Cc(a1);

function solveT(x, x1, x2) {
  // Newton-Raphson converges in a handful of steps for the curves we use; the
  // bisection fallback covers the flat-slope case at the ends.
  let t = x;
  for (let i = 0; i < 8; i++) {
    const s = slope(t, x1, x2);
    if (Math.abs(s) < 1e-6) break;
    const err = bez(t, x1, x2) - x;
    if (Math.abs(err) < 1e-6) return t;
    t -= err / s;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 24; i++) {
    const err = bez(t, x1, x2) - x;
    if (Math.abs(err) < 1e-6) break;
    if (err > 0) hi = t;
    else lo = t;
    t = (lo + hi) / 2;
  }
  return t;
}

/** Ease a normalised 0..1 progress. The GIF path's only timing authority. */
export function ease(name, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (name === "step") return 0;
  if (name === "linear") return x;
  const c = CURVES[name] ?? CURVES.out;
  return bez(solveT(x, c[0], c[2]), c[1], c[3]);
}

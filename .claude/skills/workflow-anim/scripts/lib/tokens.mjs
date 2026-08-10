/**
 * The light palette, the type stacks and the metrics.
 *
 * Derived from the `@theme` block in src/app/globals.css, inverted for paper.
 * The site is carbon; these diagrams are white, because they get printed, pasted
 * into slide decks and emailed, and a dark rectangle does none of those well.
 *
 * The one rule that governs the palette: LIME IS NEVER A LINE, ALWAYS A PLANE.
 * #c8f94e on white is about 1.4:1 — as a stroke it is invisible, as a fill under
 * black ink it is the brand. Every place lime appears below is a fill.
 */

export const C = {
  /** Background. Not off-white: white keeps the GIF palette small and prints clean. */
  paper: "#ffffff",

  /** carbon, unchanged. Every stroke, every primary label. This is the brand. */
  ink: "#0a0c0b",
  /** fg-muted, darkened for white. Secondary labels, connector captions. */
  ink2: "#4a524d",
  /** fg-muted, unchanged. Ghost strokes, inactive legend dots, "not yet". */
  ink3: "#8a918c",

  /** line, inverted in lightness. The isometric ground grid, hairlines, ticks. */
  rule: "#d8dcd6",
  /** line-soft, inverted. Pattern fills, the frame border. */
  ruleSoft: "#eceee9",

  /** accent, unchanged — FILL ONLY. */
  lime: "#c8f94e",
  /** The only legal lime stroke: a 1px outline containing a lime fill so it does
      not bleed into white. 2.6:1 — fine for a border, never for text. */
  limeDeep: "#8fb52e",

  /** Lime at ~6% over paper. The "done" / inactive plate fill. */
  wash: "#f4f6f1",
  /** Card fill behind a stage label. */
  surface: "#f7f8f6",
};

/**
 * Semantic states. The spec sets state, never colour — that is what stops four
 * archetypes drifting into four palettes, and it is why a spec is 60 lines.
 */
export const STATE = {
  /** The stage the animation is currently on. */
  active: { fill: C.lime, stroke: C.ink, dash: null, text: C.ink },
  /** A stage already passed. */
  done: { fill: C.wash, stroke: C.ink, dash: null, text: C.ink },
  /** A stage not reached yet. */
  pending: { fill: "none", stroke: C.ink3, dash: "4 4", text: C.ink3 },
};

/**
 * Who owns the step. This pair earns more than any colour: one diagram says
 * "this becomes automatic, this stays yours" with no legend at all.
 * Inherited from technical drawing, and from the site's own FlowDiagram:
 * solid = built/ours, dashed = proposed/theirs.
 */
export const OWNER = {
  automated: { stroke: C.ink, dash: null, width: 1.5 },
  manual: { stroke: C.ink2, dash: "5 4", width: 1.25 },
  client: { stroke: C.ink2, dash: "5 4", width: 1.25 },
};

/**
 * Type.
 *
 * Everything is mono, uppercase and tracked. That is not a style choice, it is
 * the mechanism that keeps the SVG and the GIF looking alike: librsvg has no
 * JetBrains Mono and falls back to a bundled mono face, which is ~10% narrower
 * than Consolas — while a proportional stack drifts 33% between Arial and its
 * fallback. Measured, not assumed.
 *
 * `system-ui` is deliberately absent: librsvg resolves it to the same default as
 * a font name that does not exist, so the display stack names Segoe UI and Arial
 * explicitly or the GIF gets the generic fallback.
 */
export const FONT = {
  mono: "'JetBrains Mono','Cascadia Mono',Consolas,'DejaVu Sans Mono',ui-monospace,monospace",
  display: "'Sora','Segoe UI',Arial,Helvetica,sans-serif",
};

/** Advance width of one mono glyph as a fraction of font-size. Every label box
    is sized from this rather than measured, so a font substitution makes text
    slightly wider inside a box that was already generous — nothing collides. */
export const MONO_ADVANCE = 0.6;

export const TYPE = {
  /** The animation title, top-left. */
  title: { size: 13, tracking: 2.2, weight: 700, family: FONT.mono, fill: C.ink },
  /** The line under it. */
  subtitle: { size: 9, tracking: 1.6, weight: 400, family: FONT.mono, fill: C.ink3 },
  /** A stage name inside its card. */
  label: { size: 11, tracking: 1.1, weight: 600, family: FONT.mono, fill: C.ink },
  /** The second line inside a card. */
  sub: { size: 8.5, tracking: 0.8, weight: 400, family: FONT.mono, fill: C.ink2 },
  /** What travels along a connector, set on the line itself. */
  artifact: { size: 8, tracking: 1, weight: 400, family: FONT.mono, fill: C.ink2 },
  /** The legend along the bottom. */
  legend: { size: 8, tracking: 1.4, weight: 500, family: FONT.mono, fill: C.ink3 },
  /** Numbers: scores, counts, durations. */
  figure: { size: 10, tracking: 0.6, weight: 700, family: FONT.mono, fill: C.ink },
};

/** Canvas and the chrome that frames every archetype. */
export const CANVAS = {
  width: 800,
  height: 400,
  /** Where the archetype may draw. Everything outside belongs to the chrome. */
  pad: { top: 76, right: 40, bottom: 62, left: 40 },
};

export const STROKE = {
  hair: 0.75,
  thin: 1,
  base: 1.5,
  bold: 2,
};

export const RADIUS = { card: 4, chip: 3, dot: 3.5 };

/** Total loop length, in ms. Under 4s a reader cannot finish before it restarts
    — the commonest failure of this kind of GIF. Over 10s nobody watches twice. */
export const DURATION = { min: 4200, default: 6400, max: 9600 };

/** GIF encoding. Flat-colour art dithers badly and dithering roughly triples the
    file, so dither is off and the palette is small. */
export const GIF = { frames: 24, colours: 32, dither: 0, scale: 2 };

/** Multipliers for the three visible faces of an isometric box. A 3D look for
    three paths and no lighting model. */
export const FACE = { top: 1.0, left: 0.86, right: 0.72 };

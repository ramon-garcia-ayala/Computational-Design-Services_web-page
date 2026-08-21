/**
 * The home preloader: the glyph scramble that resolves into the logo.
 *
 * Timings are in milliseconds and run on one clock, so the whole sequence is
 * `forceAll + hold + fade` — about 2.75s.
 */
export const preloader = {
  /** Announced once to screen readers; the grid itself is decorative. */
  label: "Loading",

  /* Built by `scripts/logo-mask.mjs` from `public/logo/logo.png`. The ratio
     is the source asset's own 3103x611, not the 760x149 the design referenced:
     `mask-size: 100% 100%` stretches the mask to whatever box it is given, so
     a ratio that disagrees with the file stretches the letterforms. */
  mask: {
    src: "/logo/logo-mask.png",
    width: 3103,
    height: 611,
    /** Cap on the rendered logo width. */
    maxWidth: 600,
  },

  /* The scramble alphabet. Backslash is escaped, not doubled. */
  glyphs: "{}<>/\\;:#01*+=~",

  /* Grid density. The wide variant exists because 52x10 reads coarse once the
     logo is 600px across; it is a straight cell-count trade, and every cell
     costs a `textContent` write per frame until it resolves, so raising these
     much further is what would make the scramble stutter rather than sparkle. */
  grid: {
    narrow: { columns: 52, rows: 10 },
    wide: { columns: 64, rows: 12 },
    /** Viewport width at which the wide grid takes over (the `lg` breakpoint). */
    wideFrom: 1024,
  },

  timing: {
    /** Each cell picks its own resolve moment in this window. */
    resolveMin: 250,
    resolveMax: 1500,
    /** Everything still scrambling is forced solid here: the clean logo state. */
    forceAll: 1600,
    /** Beat on the finished logo before it leaves. */
    hold: 550,
    /** Cross-fade to the hero. */
    fade: 600,
    /** Reduced motion: no scramble, just the logo and a shorter beat. */
    reducedHold: 500,
    reducedFade: 400,
  },

  /* Ceiling on waiting for fonts before the fade starts. The wait runs from
     mount and has the whole scramble to finish, so it is all but always
     settled by then; this only stops a stalled font from holding the site
     hostage behind a black screen. */
  fontTimeout: 800,
} as const;

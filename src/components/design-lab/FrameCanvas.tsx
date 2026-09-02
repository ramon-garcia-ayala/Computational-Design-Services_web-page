"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { designLab, framePath } from "@/data/design-lab";
import { cn } from "@/lib/utils";

/** Fraction of the stage the plate is fitted into. The rest is edge-extended. */
const PLATE_WIDTH = 0.86;
const PLATE_HEIGHT = 0.8;

/** Retina is worth paying for on a still plate; beyond 2x is not. */
const MAX_DPR = 2;

/**
 * Keeps the geodesic's own mesh clear of the hero text flanking it on a
 * laptop-width viewport, where `PLATE_WIDTH`/`PLATE_HEIGHT` alone are not
 * enough.
 *
 * The plate above fits the frame to a *fraction* of the stage, so its edges
 * move in step with the viewport — but the text beside it (`HeroOverlay`'s
 * lockup, then its two statements once the lockup fades) is set in CSS px
 * that stay put once the viewport clears `sm`. On a wide desktop screen
 * there is room to spare on both sides; on a laptop panel (1280–1440 CSS px
 * is a common native width, not just a narrow browser window) the
 * fixed-size text is a much bigger fraction of a much smaller screen, and
 * the object's own mesh — not just its plate — ends up under it. Measured
 * on a 1366×768 viewport, not eyeballed.
 *
 * `GEOMETRY_EDGE_FRAC` is the closest the mesh ever gets to either of the
 * frame's own edges (as a fraction of the frame's width), sampled every 4th
 * frame across the whole sequence. It happens to be almost exactly
 * symmetric — 0.1731 from the left at its worst, 0.1743 from the right —
 * which is what lets one constant and one scale cap protect both sides:
 * `HeroOverlay`'s two statements sit one on each side (`side: "right"` /
 * `"left"`), and although they are staged rather than concurrent, the plate
 * is sized once for the whole runway, so it has to clear whichever of them
 * is widest. `LOCKUP_SAFE_RIGHT`/`LOCKUP_MARGIN` are that widest ink plus a
 * clearance — the statements' own `font-mono` at its clamp ceiling, which
 * measures wider per character than the headline and so is the one that
 * actually governs. `PLATE_FLOOR` stops the margin chase from shrinking the
 * object into insignificance on a viewport too narrow to fit all three
 * (model, left text, right text) at full size — past that point some
 * crowding is the lesser problem.
 *
 * **`LOCKUP_SAFE_RIGHT` is a measurement, not a taste call — re-measure it
 * whenever the statement copy changes.** It was 440 when the longest line
 * was "Hours back, every week.", which renders 370px at the 28px ceiling;
 * the 70px on top is the `lg:px-16` gutter plus slack. "Design that scales
 * itself." measures 419px in the same conditions, hence 490. Measure with
 * the real font rather than a per-character estimate: JetBrains Mono at
 * `tracking-tight` is -0.7px a character, which is 18px across a line this
 * long.
 */
const GEOMETRY_EDGE_FRAC = 0.173;
const LOCKUP_SAFE_RIGHT = 490;
const LOCKUP_MARGIN = 40;
const PLATE_FLOOR = 0.45;
/** Below this the lockup stacks above the model instead of beside it (see
    `HeroOverlay`), so the horizontal margin no longer applies. */
const STACKED_BREAKPOINT = 640;

/**
 * The geodesic sequence, scrubbed frame by frame against scroll position.
 *
 * Smoothness is decided by the preload, not by the tween: an image that has
 * to decode while the scrub is already running is exactly what makes these
 * sequences stutter. So every frame is decoded up front — `img.decode()`
 * rather than `onload`, since `onload` fires before the bitmap is ready and
 * hands the jank back on first draw — and the ScrollTrigger is not created
 * until they are all in. Frame 1 is loaded and drawn on its own first, so
 * the page shows the image immediately instead of an empty plate.
 *
 * **The canvas is full-bleed and the plate is drawn inside it, not the other
 * way round.** The frames are not flat: their backdrop carries a gradient,
 * measured from `#a7a5a3` at the bottom-left corner to `#c3bebb` at the
 * top-right. A page painted one flat colour therefore cannot meet it without
 * a seam on at least two sides — the earlier version showed the plate as a
 * distinct rectangle for exactly that reason, and no choice of colour fixes
 * it. Instead the gutters are filled by stretching the frame's own outermost
 * row and column outwards, so the value at the join is the frame's own and
 * the seam cannot exist by construction, on every frame and at any viewport.
 *
 * The scroll runway is a tall wrapper with the stage `sticky top-0`, not
 * ScrollTrigger's `pin: true`: sticky needs no pin-spacer, which is one less
 * thing to fight when content is added below this section later.
 *
 * Under reduced motion the tree itself changes rather than just the tween —
 * leaving the runway in place would strand the reader in two viewports of
 * empty scroll with nothing moving.
 *
 * **The runway is 260svh, and the number is set by how long the canvas has
 * to stay centred — not by taste.** All 96 frames play across whatever the
 * wrapper is tall, so the height is really a speed control: a shorter
 * wrapper moves the frames faster against the wheel, the same trade
 * `PIN_RATIO` makes on the project pages.
 *
 * What fixes the height is the sticky stage. It is `100svh` inside an
 * `H`-tall wrapper, so it stays centred for exactly `H - 100svh` and then
 * scrolls away with the document. Everything `HeroOverlay` wants a visitor
 * to *read* has to finish inside that window, and both statements plus
 * their fades need about 160svh of it:
 *
 *     lockup out 47svh · statement 1 held 31svh · statement 2 held 18svh
 *
 * `H - 100 = 160` is where 260 comes from. At the 140svh this was for a
 * while, the window is 40svh — not enough to read one line, let alone two,
 * and the second statement finished animating after it had already left the
 * top of the screen, so it was never seen at all. 140 was set when the
 * statements ran concurrently to the last frame and were carried into the
 * panel rather than read in place; staging them again is what costs the
 * scroll back. Frames 57-96 still play during the exit, which is what the
 * `end` note below is about.
 *
 * If the statement timings in `data/design-lab.ts` change, re-derive this
 * height from them rather than nudging it.
 *
 * **`end: "bottom top"`, not `"bottom bottom"`.** The two read as
 * interchangeable and are not: with a sticky child the same height as the
 * viewport, `"top top"`→`"bottom bottom"` only spans `H - V` of scroll (V
 * = one viewport height) — the exact window the child stays natively
 * pinned for — while `"top top"`→`"bottom top"` spans the wrapper's full
 * `H`. This file used the shorter one, so the 96-frame tween finished the
 * instant the canvas *un-pinned*, not the instant it actually left the
 * screen. Everything after that — a full extra viewport height of scroll,
 * during which the canvas keeps scrolling normally rather than staying
 * pinned, and during which the first panel is simultaneously rising to
 * cover it — showed the same last frame, static, the entire time: the
 * geodesic looked frozen for the last leg of its own reveal, which is
 * exactly what it looked like to a visitor scrolling through it. `"bottom
 * top"` keeps the tween running for that whole extra viewport height too,
 * so the last frame lands exactly when the canvas is gone — covered or
 * scrolled past, whichever comes first — never before.
 *
 * `HeroOverlay`'s own runway-driven timeline has to use the identical
 * `end`, or its statements would fade on a different scroll-to-progress
 * scale than the frames they are timed against.
 *
 * ## The breathing scale
 *
 * `herobreath` gives the object a slow 8s swell so it is not dead still
 * while the page is not being scrolled. **It is a CSS transform on the
 * canvas element, deliberately not a change to `render`'s own `scale`.**
 * The two are orthogonal by construction: the scroll scrub decides *which
 * frame is painted*, this decides *how the painted result is displayed*, so
 * they cannot contend for the same value and the swell never restarts,
 * stutters or gets cut when a scroll begins or ends. Driving it through
 * `render` instead would mean a full-viewport `drawImage` plus four gutter
 * blits every animation frame, and would fight the `painted` cache that
 * exists to stop exactly that.
 *
 * **The swell only ever goes up, never below 1.** The canvas is
 * `inset-0` and its gutters are filled with the frame's own edge pixels; at
 * any scale under 1 those edges pull inward and expose the greige `html`
 * behind, which is a slightly different colour from the frame's own
 * gradient — the precise seam the edge-extension above exists to make
 * impossible. Scaling up only ever crops.
 *
 * **1.2% is a ceiling set by the hero text, not a taste call.** The scale
 * multiplies every distance from the canvas centre, the mesh's included.
 * At its worst the mesh sits at `LOCKUP_SAFE_RIGHT + LOCKUP_MARGIN` = 530
 * CSS px from centre, so 1.012 carries it 6.4px further out — 6.4px off a
 * 40px clearance. Raising the amplitude spends the rest of that margin and
 * puts the mesh back under the statements on a laptop panel, which is the
 * whole thing `GEOMETRY_EDGE_FRAC` above was measured to prevent.
 *
 * No reduced-motion branch here, and the `100%` keyframe is why: it is the
 * rest state, `scale(1)`, not the top of the swell. `globals.css` collapses
 * every animation to `0.01ms` with one iteration under that preference, so
 * the object settles at its true size rather than parked mid-breath. Same
 * discipline as `ScrollCue`. Applying the class conditionally instead would
 * hit the hydration trap in CLAUDE.md — the hook reads `false` on the first
 * render — and flash the animation on before removing it.
 */
export function FrameCanvas({ children }: { children?: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const { count, width, height } = designLab.sequence;

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const stage = stageRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !ctx || !stage || !wrapper) return;

      let cancelled = false;
      let tween: gsap.core.Tween | null = null;
      const images: HTMLImageElement[] = [];

      // `current` is the frame the scroll position asks for; `painted` is the
      // one on screen at the canvas's present size. They differ on a resize,
      // when the same frame has to be redrawn at new dimensions.
      let current = 0;
      let painted = -1;
      // CSS px, not the backing store's device px — `render` needs this to
      // read `LOCKUP_SAFE_RIGHT` (set in CSS px, same as the hero text) and
      // to know whether the lockup is even beside the model right now.
      let cssWidth = 0;

      const sizeCanvas = () => {
        const rect = stage.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        cssWidth = rect.width;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (canvas.width === w && canvas.height === h) return false;
        // Assigning either dimension clears the canvas, so the caller repaints.
        canvas.width = w;
        canvas.height = h;
        return true;
      };

      const render = (image: HTMLImageElement) => {
        const cw = canvas.width;
        const ch = canvas.height;
        const dpr = cssWidth > 0 ? cw / cssWidth : 1;

        let scale = Math.min(
          (cw * PLATE_WIDTH) / width,
          (ch * PLATE_HEIGHT) / height,
        );

        if (cssWidth >= STACKED_BREAKPOINT) {
          // One cap protects both flanks: the plate is centred, so shrinking
          // it for the safe inset on one side pulls the opposite edge back
          // by very nearly the same amount, and `GEOMETRY_EDGE_FRAC` is the
          // worst case measured on either side.
          const safeInset = (LOCKUP_SAFE_RIGHT + LOCKUP_MARGIN) * dpr;
          const marginScale =
            (cw / 2 - safeInset) / (width * (0.5 - GEOMETRY_EDGE_FRAC));
          const floorScale = (cw * PLATE_FLOOR) / width;
          scale = Math.min(scale, Math.max(marginScale, floorScale));
        }

        const dw = Math.round(width * scale);
        const dh = Math.round(height * scale);
        const dx = Math.round((cw - dw) / 2);
        const dy = Math.round((ch - dh) / 2);
        const right = dx + dw;
        const bottom = dy + dh;

        ctx.drawImage(image, dx, dy, dw, dh);

        /* Fill the gutters with the frame's own edge pixels: one column
           stretched left and right, one row stretched up and down, and the
           four corner pixels into the corners. The colour at every join is
           the frame's own, so the plate has no detectable boundary — which a
           flat background cannot achieve against a gradient. */
        if (dx > 0) {
          ctx.drawImage(image, 0, 0, 1, height, 0, dy, dx, dh);
          ctx.drawImage(image, width - 1, 0, 1, height, right, dy, cw - right, dh);
        }
        if (dy > 0) {
          ctx.drawImage(image, 0, 0, width, 1, dx, 0, dw, dy);
          ctx.drawImage(image, 0, height - 1, width, 1, dx, bottom, dw, ch - bottom);
        }
        if (dx > 0 && dy > 0) {
          ctx.drawImage(image, 0, 0, 1, 1, 0, 0, dx, dy);
          ctx.drawImage(image, width - 1, 0, 1, 1, right, 0, cw - right, dy);
          ctx.drawImage(image, 0, height - 1, 1, 1, 0, bottom, dx, ch - bottom);
          ctx.drawImage(image, width - 1, height - 1, 1, 1, right, bottom, cw - right, ch - bottom);
        }
      };

      const paint = (value: number, force = false) => {
        const index = Math.min(count - 1, Math.max(0, Math.round(value)));
        current = index;
        // Scrub ticks far more often than the rounded frame changes, and
        // re-blitting a full-viewport canvas for the same bitmap is not cheap.
        if (index === painted && !force) return;
        const image = images[index];
        if (!image?.complete) return;
        render(image);
        painted = index;
      };

      const load = async (index: number) => {
        const image = new Image();
        images[index] = image;
        image.src = framePath(index + 1);
        try {
          // decode() resolves once the bitmap is ready to paint; onload does
          // not. Older browsers without it fall back to the event.
          if (typeof image.decode === "function") await image.decode();
          else
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
            });
        } catch {
          // One frame failing to decode must not hold the whole gate shut.
          // `paint` skips an incomplete image, so the previous one stays up.
        }
      };

      sizeCanvas();

      const observer = new ResizeObserver(() => {
        if (sizeCanvas()) paint(current, true);
      });
      observer.observe(stage);

      void (async () => {
        await load(0);
        if (cancelled) return;
        paint(0, true);

        // Reduced motion needs the first frame and nothing else.
        if (reducedMotion) return;

        await Promise.all(
          Array.from({ length: count - 1 }, (_, i) => load(i + 1)),
        );
        if (cancelled) return;

        const state = { frame: 0 };
        tween = gsap.to(state, {
          frame: count - 1,
          ease: "none",
          onUpdate: () => paint(state.frame),
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            // Not "bottom bottom" — see the file doc comment. This spans the
            // wrapper's full height rather than stopping the instant the
            // canvas un-pins, so the last frame lands when it actually
            // leaves the screen instead of a viewport-height early.
            end: "bottom top",
            // A touch of lag rather than `true`: under Lenis the catch-up is
            // what reads as smooth instead of mechanically locked to the wheel.
            scrub: 0.5,
          },
        });

        // The trigger is born after the images resolved, so it measured a
        // layout that may since have settled.
        tween.scrollTrigger?.refresh();
      })();

      return () => {
        cancelled = true;
        observer.disconnect();
        // Created inside a promise, so it is outside the gsap context's
        // automatic collection and has to be killed by hand.
        tween?.scrollTrigger?.kill();
        tween?.kill();
      };
    },
    { scope: wrapperRef, dependencies: [reducedMotion, count, width, height] },
  );

  return (
    /* `data-sequence-runway` is how the hero overlay finds this element to
       hang its own ScrollTrigger on. It has to be *this* element and not the
       sticky stage below: the stage is pinned, so its position no longer
       tracks scroll and progress read from it would be meaningless. */
    <div
      ref={wrapperRef}
      data-sequence-runway
      className={cn(!reducedMotion && "h-[260svh]")}
    >
      <div
        ref={stageRef}
        className={cn(
          "relative w-full overflow-hidden",
          reducedMotion ? "h-[100svh]" : "sticky top-0 h-[100svh]",
        )}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Geodesic field study"
          className="absolute inset-0 h-full w-full animate-[herobreath_8s_ease-in-out_infinite]"
        />
        <style>{`
          @keyframes herobreath {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.012); }
            100% { transform: scale(1); }
          }
        `}</style>
        {/* Anything that has to sit over the sequence and stay with it while
            it is pinned — the hero lockup and the scroll statements. */}
        {children}
      </div>
    </div>
  );
}

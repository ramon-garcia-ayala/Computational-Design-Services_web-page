"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { designLab, framePath } from "@/data/design-lab";
import { cn } from "@/lib/utils";

/** Fraction of the stage the plate is fitted into. The rest is edge-extended. */
const PLATE_WIDTH = 0.86;
const PLATE_HEIGHT = 0.8;

/**
 * How far the object closes on the viewer across the whole runway, on top of
 * whatever frame is painted. See "The scroll dolly" in the doc comment below.
 */
const DOLLY = 0.05;

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
 * ## Two layers, so the frames cross-fade instead of stepping
 *
 * 96 frames across a 260svh runway is about 18px of scroll per frame, and
 * `paint` used to round to the nearest one — so the sequence advanced in
 * visible steps however smooth the scrub value was underneath.
 *
 * The fix is two stacked canvases holding adjacent frames, with the upper
 * one's **opacity** set to the fractional part of the position. **The blend
 * is the compositor's, not the canvas's**, and that is the whole reason
 * this is affordable: alpha-compositing two frames inside 2D context would
 * mean a second full-viewport `drawImage` plus its eight gutter blits on
 * every scrub tick — 60-120 times a second while scrolling, against the
 * roughly 96 redraws the whole runway costs now. Here a redraw still only
 * happens when the *pair* changes; sliding between two frames writes one
 * `style.opacity` and the GPU blends two textures it already holds.
 *
 * `claim` is what keeps it at one redraw per frame rather than two: the
 * base frame is claimed first and told to keep the frame it is fading
 * toward, so advancing by one step reuses the layer that already holds it
 * and only the vacated layer is repainted.
 *
 * The cost is a second canvas's worth of GPU memory, which is the trade
 * being made deliberately.
 *
 * ## The scroll dolly
 *
 * `DOLLY` closes the object on the viewer by 5% across the runway, scrubbed
 * on the *same* `onUpdate` as the frames, off the same progress value — so
 * it cannot drift out of step with the frame it belongs to, and it needs no
 * second ScrollTrigger to keep in sync.
 *
 * **It exists because the honest lever was blocked.** To make the scroll
 * read as more motion the frames would have to advance further per wheel
 * turn, and the only control for that is the runway height, which is not
 * free: it is derived from the 160svh the two statements need to be read in
 * (see below), and shortening it is the exact regression that once left the
 * second statement finishing after it had already left the screen. Making
 * the frames finish early instead just trades that for a static tail, which
 * is the other documented bug. So the extra motion is added alongside the
 * sequence rather than taken out of its timing.
 *
 * **It is on its own element, not the canvas.** The breath below is an
 * infinite CSS animation on `transform`; a scrubbed GSAP write to the same
 * property on the same element would clobber it every tick. Nested
 * elements multiply instead, which is also what makes the two independently
 * adjustable.
 *
 * Worst case for the hero text is the two together. The statements are on
 * screen over roughly progress 0.2–0.6, where the dolly is 1.01–1.03; with
 * the breath at its 1.04 peak that is 1.07, putting the mesh's half-extent
 * at ~227px against the statements' 230px at 1440 — still clear. The
 * product only exceeds the clearance in the last stretch of the runway,
 * after both statements have gone.
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
 * **The amplitude is bounded by the hero text, and the budget is smaller
 * than `LOCKUP_MARGIN` suggests.** The scale multiplies the mesh's own
 * half-extent, which is `width * (0.5 - GEOMETRY_EDGE_FRAC) * scale` — not
 * the 530px safe inset, which is a distance from the *screen edge*. Worked
 * out at the sizes that matter, with the statements' ink reaching
 * `LOCKUP_SAFE_RIGHT` from centre:
 *
 *     1440x731   mesh half 211.9   text at 230.0   clear +18.1   0 at 1.085
 *     1366x768   mesh half 201.0   text at 193.0   clear  -8.0   0 at 0.960
 *     1920x1000  mesh half 348.8   text at 470.0   clear +121    0 at 1.347
 *
 * So 4% is comfortable on a wide screen and spends half the remaining
 * clearance at 1440. **At 1366 and below the mesh already crosses the
 * statements' ink at rest** — that is `PLATE_FLOOR` doing its documented
 * job of refusing to shrink the object into insignificance, and the swell
 * makes an existing overlap about 8px worse rather than creating one. Past
 * ~8% the object starts touching the text at 1440 too, which is where this
 * stops being a free knob.
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
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const dollyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { count, width, height } = designLab.sequence;

  useGSAP(
    () => {
      const canvasA = canvasARef.current;
      const canvasB = canvasBRef.current;
      const dolly = dollyRef.current;
      const ctxA = canvasA?.getContext("2d");
      const ctxB = canvasB?.getContext("2d");
      const stage = stageRef.current;
      const wrapper = wrapperRef.current;
      if (!canvasA || !canvasB || !ctxA || !ctxB || !stage || !wrapper || !dolly)
        return;

      /* Two layers holding adjacent frames. `index` is the frame each one
         currently carries, `-1` for "nothing drawn yet". */
      const slots = [
        { canvas: canvasA, ctx: ctxA, index: -1 },
        { canvas: canvasB, ctx: ctxB, index: -1 },
      ];

      let cancelled = false;
      let tween: gsap.core.Tween | null = null;
      const images: HTMLImageElement[] = [];

      // `current` is the fractional frame position the scroll asks for —
      // fractional, so a resize repaint restores the same blend rather than
      // snapping to the base frame. `painted` is the base frame the layers
      // are currently set up for.
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
        if (canvasA.width === w && canvasA.height === h) return false;
        // Assigning either dimension clears the canvas, so the caller
        // repaints — and both layers have to be invalidated, not just sized.
        for (const slot of slots) {
          slot.canvas.width = w;
          slot.canvas.height = h;
          slot.index = -1;
        }
        return true;
      };

      const render = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        image: HTMLImageElement,
      ) => {
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

      /** Draws `index` into whichever layer is not already holding `keep`. */
      const claim = (index: number, keep: number) => {
        let slot = slots.find((s) => s.index === index);
        if (slot) return slot;
        slot = slots.find((s) => s.index !== keep) ?? slots[0];
        const image = images[index];
        if (!image?.complete) return null;
        render(slot.ctx, slot.canvas, image);
        slot.index = index;
        return slot;
      };

      const paint = (value: number, force = false) => {
        const clamped = Math.min(count - 1, Math.max(0, value));
        const base = Math.floor(clamped);
        const next = Math.min(count - 1, base + 1);
        const mix = next === base ? 0 : clamped - base;

        current = clamped;

        /* Only the *pair* of frames on screen decides whether a redraw is
           needed. Sliding within one pair moves nothing but an opacity,
           which is why the fade is nearly free. */
        if (base === painted && !force) {
          const top = slots.find((s) => s.index === next);
          if (top) top.canvas.style.opacity = `${mix}`;
          return;
        }

        // `base` is drawn first and told to keep `next`, so an advance of one
        // frame reuses the layer that already holds it and redraws only one.
        const baseSlot = claim(base, next);
        if (!baseSlot) return;
        const nextSlot = claim(next, base);

        baseSlot.canvas.style.opacity = "1";
        baseSlot.canvas.style.zIndex = "0";

        if (nextSlot && nextSlot !== baseSlot) {
          nextSlot.canvas.style.zIndex = "1";
          nextSlot.canvas.style.opacity = `${mix}`;
        } else {
          /* No distinct frame to fade toward — the last frame, or one whose
             successor has not decoded yet. The other layer still holds an
             older frame at whatever opacity and z-index the previous pair
             left it, so it has to be put away explicitly: without this the
             sequence ends showing frame 94 stacked over 95. */
          const other = slots.find((slot) => slot !== baseSlot);
          if (other) other.canvas.style.opacity = "0";
        }

        painted = base;
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
          onUpdate: () => {
            paint(state.frame);
            /* Same tick, same progress value, so the dolly can never drift
               out of step with the frame it belongs to. */
            const progress = state.frame / (count - 1);
            dolly.style.transform = `scale(${1 + DOLLY * progress})`;
          },
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
        {/* The dolly and the breath are on two different elements on
            purpose: both are transforms, and one element cannot hold a
            scrubbed GSAP value and an infinite CSS animation of the same
            property without one clobbering the other. Nested, they simply
            multiply. */}
        <div ref={dollyRef} className="absolute inset-0 will-change-transform">
          {/* The breath moves to this wrapper now that there are two
              canvases: both layers have to swell as one object, and an
              animation per canvas would be two clocks for one form. */}
          <div
            role="img"
            aria-label="Geodesic field study"
            className="absolute inset-0 animate-[herobreath_8s_ease-in-out_infinite]"
          >
            <canvas
              ref={canvasARef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
            />
            <canvas
              ref={canvasBRef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full opacity-0"
            />
          </div>
        </div>
        <style>{`
          @keyframes herobreath {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.04); }
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

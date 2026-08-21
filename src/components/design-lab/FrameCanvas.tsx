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
 * leaving the 400svh runway in place would strand the reader in three
 * viewports of empty scroll with nothing moving.
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

      const sizeCanvas = () => {
        const rect = stage.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
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

        const scale = Math.min(
          (cw * PLATE_WIDTH) / width,
          (ch * PLATE_HEIGHT) / height,
        );
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
            end: "bottom bottom",
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
      className={cn(!reducedMotion && "h-[400svh]")}
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
          className="absolute inset-0 h-full w-full"
        />
        {/* Anything that has to sit over the sequence and stay with it while
            it is pinned — the hero lockup and the scroll statements. */}
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { preloader } from "@/data/preloader";
import { holdScrollGate } from "@/lib/scroll-gate";

/**
 * Module scope, so it survives client-side navigation and is reset only by a
 * full document load — which is exactly the "fresh load of Home" rule. Going
 * to /about and back leaves this `true`, so the overlay never plays again.
 *
 * It is never written during render, only from the effect, so the server's
 * copy of this module stays `false` for every request. Were it set while
 * rendering, the first visitor to hit the server would consume it for
 * everyone until the process restarted.
 */
let hasPlayed = false;

/**
 * The home intro: coding glyphs scramble inside the logo's letterforms, then
 * resolve into the solid mark and fade to reveal the hero.
 *
 * **The letterform clipping is a CSS mask, not a drawn shape.** The grid is a
 * plain rectangle of cells; `mask-image` is what makes it read as the logo,
 * so the glyphs appear only where there is ink. That is also why the mask has
 * to be decoded before the grid is shown — until it is, the mask is not yet
 * applied and the grid renders as the bare 64x12 rectangle it really is.
 * Hence the grid starts at `opacity: 0` and is revealed on decode, rather
 * than being shown and clipped a frame later.
 *
 * The scramble is driven by one `requestAnimationFrame` loop that mutates
 * `textContent` directly. It deliberately does not go through React: at 768
 * cells a state update per frame would be ~46,000 reconciliations a second.
 * The cells are built imperatively for the same reason, and because the grid
 * density depends on `window.innerWidth`, which the server cannot know — so
 * rendering them in JSX would mean a hydration mismatch on every wide screen.
 *
 * The loop also shrinks as it runs: `pending` holds only the cells still
 * scrambling, and a cell that resolves is dropped from it. By the halfway
 * point roughly half the work per frame is already gone.
 */
export function Preloader() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* Decided once per mount and kept in a ref. A `useState` initialiser would
     be double-invoked under StrictMode: the first call would consume the one
     play and the second would be told it had already happened. */
  const playRef = useRef<boolean | null>(null);
  if (playRef.current === null) playRef.current = !hasPlayed;
  const shouldPlay = playRef.current;

  const [finished, setFinished] = useState(false);

  /* Scroll is locked for the duration. Same approach as MenuOverlay: with
     `overflow: hidden` on the document there is nowhere to scroll, so Lenis
     has nothing to move either and no second instance is involved.
     `scrollTo` covers a reload part-way down the page, where the browser
     restores the old offset and the hero would otherwise be revealed already
     scrolled past.
     
     Two things guard the case where the URL carries a hash:
     
     - **The reset is skipped.** A restored offset is an accident of reloading;
       a fragment is a destination the visitor asked for, and sending it to the
       top is not "covering" it, it is discarding it. This is what keeps a deep
       link working on the reduced-motion path, where Lenis is never
       instantiated and the browser's own fragment scroll is all there is.
     - **The gate is held for the whole sequence.** `SmoothScroll` waits on it
       before jumping. The lock alone would be reason enough, but the deciding
       one is that this component waits on `document.fonts.ready` before it
       fades: the display face swapping in reflows every heading below the
       fold, so a jump measured before the swap is pointing at an element that
       has since moved. Releasing only once the overlay is gone means the jump
       reads a layout that has stopped changing.
     
     The hold is released from this effect's cleanup, which covers all three
     ways the overlay can end — finishing, unmounting, and the reduced-motion
     re-run — so the gate cannot be left latched shut with nothing to open it. */
  useEffect(() => {
    if (!shouldPlay || finished) return;

    const release = holdScrollGate();
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    if (window.location.hash.length <= 1) window.scrollTo(0, 0);

    return () => {
      html.style.overflow = previous;
      release();
    };
  }, [shouldPlay, finished]);

  useGSAP(
    () => {
      if (!shouldPlay) return;
      const root = rootRef.current;
      const grid = gridRef.current;
      if (!root || !grid) return;

      hasPlayed = true;

      const { glyphs, timing, mask, grid: density } = preloader;

      let cancelled = false;
      let raf = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let fade: gsap.core.Tween | null = null;

      /* The hook returns `false` on the hydration render, so this effect can
         run once as if there were no reduction and then re-run for real.
         Everything it touches is therefore rebuilt from scratch here rather
         than appended to. */
      grid.replaceChildren();
      gsap.set(root, { opacity: 1 });

      const { columns, rows } =
        window.innerWidth >= density.wideFrom ? density.wide : density.narrow;
      const total = columns * rows;

      grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

      const cells: HTMLElement[] = [];
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const cell = document.createElement("div");
        // Typography is inherited from the grid; only the centring is per cell.
        cell.style.cssText =
          "display:flex;align-items:center;justify-content:center";
        fragment.appendChild(cell);
        cells.push(cell);
      }
      grid.appendChild(fragment);

      const solidify = (cell: HTMLElement) => {
        cell.textContent = "";
        // `var(--color-fg)`, not a hardcoded `#ffffff` — the token is
        // #f2f4f0, near-white but not pure white, and reading the variable
        // rather than duplicating its value is what keeps this in step with
        // it if it ever changes.
        cell.style.background = "var(--color-fg)";
      };

      /* Waiting for fonts is what keeps the reveal seamless: the hero's copy
         is already in the HTML, so the only thing that can still change under
         the overlay is the typeface swapping in. The wait starts now, not at
         the end, so the scramble absorbs it. */
      const fontsReady = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, preloader.fontTimeout)),
      ]);

      const leave = (duration: number) => {
        fade = gsap.to(root, {
          opacity: 0,
          duration: duration / 1000,
          ease: "power2.out",
          onComplete: () => {
            if (!cancelled) setFinished(true);
          },
        });
      };

      const settle = (hold: number, duration: number) => {
        void fontsReady.then(() => {
          if (cancelled) return;
          timer = setTimeout(() => {
            if (!cancelled) leave(duration);
          }, hold);
        });
      };

      void (async () => {
        // The mask has to be in the cache before the grid is visible.
        try {
          const image = new Image();
          image.src = mask.src;
          if (typeof image.decode === "function") await image.decode();
          else
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
            });
        } catch {
          // A mask that will not decode leaves the grid unclipped, which is
          // ugly but still resolves to a white block and still fades out.
          // Better than holding the site behind a black screen.
        }
        if (cancelled) return;
        grid.style.opacity = "1";

        if (reducedMotion) {
          // No scramble at all: the finished mark, a beat, then the fade.
          cells.forEach(solidify);
          settle(timing.reducedHold, timing.reducedFade);
          return;
        }

        const span = timing.resolveMax - timing.resolveMin;
        const resolveAt = Array.from(
          { length: total },
          () => timing.resolveMin + Math.random() * span,
        );
        let pending = cells.map((_, i) => i);

        const started = performance.now();

        const frame = (now: number) => {
          const elapsed = now - started;

          if (elapsed >= timing.forceAll) {
            for (const i of pending) solidify(cells[i]);
            pending = [];
            settle(timing.hold, timing.fade);
            return;
          }

          const next: number[] = [];
          for (const i of pending) {
            if (elapsed >= resolveAt[i]) {
              solidify(cells[i]);
            } else {
              cells[i].textContent =
                glyphs[(Math.random() * glyphs.length) | 0];
              next.push(i);
            }
          }
          pending = next;

          raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
      })();

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
        // Born inside a promise, so outside the context's own collection.
        fade?.kill();
      };
    },
    { scope: rootRef, dependencies: [shouldPlay, reducedMotion] },
  );

  if (!shouldPlay || finished) return null;

  const { mask } = preloader;

  return (
    <>
      {/* Without scripting nothing would ever take the overlay away, and the
          site would sit behind a black screen for good. */}
      <noscript>
        <style>{`[data-preloader]{display:none!important}`}</style>
      </noscript>

      <div
        ref={rootRef}
        data-preloader
        role="status"
        aria-label={preloader.label}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon px-6"
      >
        <div
          ref={gridRef}
          aria-hidden="true"
          className="w-full opacity-0 transition-opacity duration-150"
          style={{
            display: "grid",
            maxWidth: `${mask.maxWidth}px`,
            aspectRatio: `${mask.width} / ${mask.height}`,
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
            fontSize: "11px",
            lineHeight: 1,
            color: "var(--color-fg)",
            WebkitMaskImage: `url('${mask.src}')`,
            maskImage: `url('${mask.src}')`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
      </div>
    </>
  );
}

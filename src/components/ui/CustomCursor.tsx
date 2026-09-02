"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide crosshair cursor: a full-height vertical rule and a full-width
 * horizontal one, crossing at the pointer, with a coordinate readout beside
 * the intersection. A drafting reticle rather than an arrow — the same
 * instrument register as `grid-bg` and the proposal `FlowDiagram`s, on the
 * one element that is present no matter which page or panel is on screen.
 *
 * **Fine pointers only.** `matchMedia("(pointer: fine)")` gates the whole
 * thing at mount: a touch screen has no hovering pointer to attach a
 * crosshair to, and there is nothing to replace there in the first place. A
 * device that changes pointer type mid-session (a laptop with a mouse
 * unplugged) is re-checked on the query's own `change` event.
 *
 * **Every element writes through refs, never React state.** `mousemove`
 * fires far faster than a component should re-render for, and a `setState`
 * per pixel would fight the browser for the same frame this is meant to
 * track smoothly. Position lands directly on `style.transform` and the
 * label's `textContent`, the same imperative-DOM discipline the rest of the
 * site reserves for GSAP.
 *
 * **White with `mix-blend-mode: difference`**, the exact device
 * `ScrollProgress` and `BackToTop` already use for a fixed element that has
 * to stay legible over a page running from pale greige to near-black panels
 * without tracking which one is currently underneath.
 *
 * **No `prefers-reduced-motion` branch.** Like `ScrollProgress`, this
 * reports a value — here, pointer position — rather than animating for its
 * own sake; it moves exactly as far and as fast as the hand already did.
 * There is nothing here for that preference to object to.
 *
 * **The native cursor is hidden globally, not just under this mark.**
 * `document.documentElement` gets a `custom-cursor` class on mount, and
 * `globals.css` turns that into `cursor: none !important` — a crosshair
 * that only replaced the system arrow's dead centre while a differently
 * shaped native cursor kept showing beside it would read as two cursors
 * fighting, not one redesigned. The class comes off on unmount and while
 * the pointer is outside the viewport, so a hover into a chrome-less iframe
 * or a window switch never leaves the visitor without any cursor at all.
 */
export function CustomCursor() {
  const vLineRef = useRef<HTMLDivElement>(null);
  const hLineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    if (!query.matches) return;

    const html = document.documentElement;
    const vLine = vLineRef.current;
    const hLine = hLineRef.current;
    const label = labelRef.current;
    const root = rootRef.current;
    if (!vLine || !hLine || !label || !root) return;

    html.classList.add("custom-cursor");

    const show = () => {
      root.style.opacity = "1";
    };
    const hide = () => {
      root.style.opacity = "0";
    };

    const onMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;
      vLine.style.transform = `translateX(${x}px)`;
      hLine.style.transform = `translateY(${y}px)`;
      /* Offset clear of the lines themselves, and flipped past the halfway
         point of each axis so the readout never runs off the edge of the
         screen it is closest to — it sits above/left of the crosshair once
         the pointer passes into the right or bottom half of the viewport. */
      const flipX = x > window.innerWidth / 2;
      const flipY = y > window.innerHeight / 2;
      label.style.transform =
        `translate(${x}px, ${y}px) ` +
        `translate(${flipX ? "-100%" : "14px"}, ${flipY ? "-100%" : "14px"})`;
      label.textContent =
        `X ${String(Math.round(x)).padStart(4, "0")} · ` +
        `Y ${String(Math.round(y)).padStart(4, "0")}`;
      show();
    };

    // A device that is only sometimes a mouse (a convertible, an external
    // mouse unplugged mid-session) re-evaluates rather than sticking with
    // whatever was true on mount.
    const onPointerTypeChange = () => {
      if (query.matches) {
        html.classList.add("custom-cursor");
      } else {
        html.classList.remove("custom-cursor");
        hide();
      }
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    query.addEventListener("change", onPointerTypeChange);

    return () => {
      html.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
      query.removeEventListener("change", onPointerTypeChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[110] opacity-0 transition-opacity duration-150 ease-out"
    >
      <div
        ref={vLineRef}
        className="absolute top-0 left-0 h-full w-px bg-white mix-blend-difference"
      />
      <div
        ref={hLineRef}
        className="absolute top-0 left-0 h-px w-full bg-white mix-blend-difference"
      />
      <div
        ref={labelRef}
        className="absolute top-0 left-0 font-mono text-[10px] whitespace-nowrap text-white uppercase tracking-widest mix-blend-difference"
      />
    </div>
  );
}

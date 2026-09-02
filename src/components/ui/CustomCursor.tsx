"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide crosshair cursor: a small four-armed reticle with a gap at its
 * centre, and the pointer's viewport coordinates set beside it. A drafting
 * mark rather than an arrow — the same instrument register as `grid-bg` and
 * the proposal `FlowDiagram`s, on the one element present no matter which
 * page or panel is on screen.
 *
 * **The centre is a gap, not a crossing.** The arms stop 4px short of the
 * point on every side, so the pixel actually being pointed at is never
 * covered by the thing pointing at it. It is also what keeps a 20px mark
 * reading as an instrument instead of a plus sign.
 *
 * **White with `mix-blend-mode: difference` is the colour rule**, not a
 * stand-in for one. Difference inverts whatever is behind it, so the mark
 * is white over the near-black panels and black over the greige hero and
 * the pale pages, per pixel — an arm crossing an edge inverts on each side
 * of it. Any fixed token would be right on one ground and invisible on
 * another; this is the same device `ScrollProgress` and `BackToTop` use.
 *
 * **There is exactly one element, and it carries the blend, the transform
 * and the `fixed` together.** That is not tidiness, it is the only
 * arrangement that inverts. `mix-blend-mode` blends an element against the
 * backdrop of its nearest ancestor *stacking context*, and `position:
 * fixed` creates one unconditionally — so with the mark inside a fixed
 * wrapper, whether the blend sat on the arms or on an inner transformed
 * group, it resolved against that wrapper's own empty backdrop and the
 * reticle came out plain white on the greige, inverting nothing. Blending
 * the fixed element itself resolves against the page behind it.
 *
 * Keeping it one small element rather than a `fixed inset-0` layer (which
 * does work) is the cheap version: a viewport-sized blended layer makes
 * the compositor re-blend the whole screen on every frame the pointer
 * moves, over an R3F canvas and a scroll-driven frame sequence. The
 * blended group here is only the pixels the reticle paints.
 *
 * **Fine pointers only.** `matchMedia("(pointer: fine)")` gates the whole
 * thing: a touch screen has no hovering pointer to attach a crosshair to,
 * and nothing to replace. The query's own `change` event re-checks it, so
 * unplugging a mouse mid-session hands the real cursor back.
 *
 * **Everything writes through refs, never React state.** `pointermove`
 * fires far faster than a component should re-render for, and a `setState`
 * per pixel would fight the browser for the frame this exists to track.
 * One transform on the wrapper carries the mark and the readout together;
 * only the label's own offset and text are written separately.
 *
 * **No `prefers-reduced-motion` branch.** Like `ScrollProgress`, this
 * reports a value — pointer position — rather than animating for its own
 * sake, and moves exactly as far and as fast as the hand already did.
 *
 * **Hiding the native cursor and drawing this one are a single state**, and
 * the invariant is that there is never a moment with neither. The
 * `custom-cursor` class on `<html>` (which `globals.css` turns into
 * `cursor: none !important`) goes on with the first pointer event — not at
 * mount, which left a page loaded without the mouse moving showing no
 * cursor at all — and comes off whenever the mark hides: pointer out of the
 * viewport, window unfocused, pointer type no longer fine, unmount. Hiding
 * the mark while leaving the class on stranded the pointer invisible over a
 * page it was still sitting on, every time focus moved to devtools.
 */

/** Arm length, the gap from centre to where each arm starts, in px. */
const ARM = 6;
const GAP = 4;

export function CustomCursor() {
  const markRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");

    const html = document.documentElement;
    const mark = markRef.current;
    const label = labelRef.current;
    if (!mark || !label) return;

    let active = false;

    const show = () => {
      if (active || !query.matches) return;
      active = true;
      html.classList.add("custom-cursor");
      mark.style.opacity = "1";
    };

    const hide = () => {
      if (!active) return;
      active = false;
      html.classList.remove("custom-cursor");
      mark.style.opacity = "0";
    };

    const onMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;

      // One write moves the reticle and the readout together.
      mark.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      /* The readout flips to the inside once the pointer passes the middle
         of an axis, so it is never the thing that runs off the edge the
         pointer is heading for. */
      const flipX = x > window.innerWidth / 2;
      const flipY = y > window.innerHeight / 2;
      label.style.transform = `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`;
      label.style.left = flipX ? `${-GAP - ARM}px` : `${GAP + ARM}px`;
      label.style.top = flipY ? `${-GAP - ARM}px` : `${GAP + ARM}px`;

      label.textContent = `${Math.round(x)},${Math.round(y)}`;
      show();
    };

    const onPointerTypeChange = () => {
      // Only ever hands the cursor back here. Taking it away again is
      // `show`'s job, on the next pointer event, so the mark still never
      // appears before it knows where to draw itself.
      if (!query.matches) hide();
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    query.addEventListener("change", onPointerTypeChange);

    return () => {
      hide();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
      query.removeEventListener("change", onPointerTypeChange);
    };
  }, []);

  /* Each arm is its own 1px element rather than one bordered box, so the
     centre stays genuinely empty rather than covered by a transparent-but-
     present box. */
  const arm = "absolute bg-white";

  return (
    <div
      ref={markRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[110] opacity-0 mix-blend-difference transition-opacity duration-100 ease-out will-change-transform"
    >
      {/* left, right, top, bottom — each starting GAP from the point */}
      <span
        className={arm}
        style={{ height: 1, width: ARM, left: -(GAP + ARM), top: 0 }}
      />
      <span className={arm} style={{ height: 1, width: ARM, left: GAP, top: 0 }} />
      <span
        className={arm}
        style={{ width: 1, height: ARM, top: -(GAP + ARM), left: 0 }}
      />
      <span className={arm} style={{ width: 1, height: ARM, top: GAP, left: 0 }} />

      <span
        ref={labelRef}
        className="absolute font-mono text-[9px] leading-none tracking-tight whitespace-nowrap text-white tabular-nums sm:text-[10px]"
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Feather for a contained clip, so it has no frame.
 *
 * The clip is a subject on a plate, and the plate is the problem: it is the
 * same greige the page uses but not evenly — its corners run #a1a09e to
 * #c5c0bd against the page's flat #b8b4b1 — so wherever the video's rectangle
 * ends, a faint edge appears, lighter on one side and darker on the other.
 * The fix is to stop the plate ever reaching its own boundary.
 *
 * Two linear gradients intersected rather than one ellipse. The subject sits
 * at x 20.6–75.6% and y 12.8–87.6% of the frame — measured, not guessed — so
 * it needs far more vertical room than horizontal. An ellipse fades both axes
 * on one schedule, which meant either clipping the top and bottom of the form
 * or leaving the left and right edges too crisp. Crossed linear gradients set
 * each axis independently: solid through the subject, transparent well before
 * the frame edge on all four sides.
 */
const CONTAINED_FEATHER = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 17%, #000 83%, transparent 100%), " +
    "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 17%, #000 83%, transparent 100%), " +
    "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
  // Both masks must apply, not stack: `intersect` is what makes the corners
  // fade too. WebKit's older spelling of the same thing is `source-in`.
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

/**
 * A looping background clip behind a panel's content (spec §13.3, §13.6).
 *
 * Muted, autoplaying, looping and `playsInline` — the last of those matters
 * on iOS, which otherwise takes any playing video fullscreen and throws the
 * visitor out of the page.
 *
 * A missing `src` makes the element request a path that 404s; it then renders
 * nothing and the panel simply shows its own plate. Nothing throws and no
 * layout shifts, because the element is absolutely positioned and never
 * contributes height. `onError` is handled explicitly so a missing file
 * cannot leave a broken poster frame behind.
 *
 * It sits *under* the panel's content: the wrapper is `absolute inset-0` with
 * the content marked `relative` beside it, so no z-index bookkeeping is
 * needed. A scrim rides on top of the video so type stays legible whatever
 * the clip happens to be doing behind it — **both variants get one now**. The
 * contained clip originally shipped without any: it sits on the greige plate
 * the Labs panel's own dark-ink heading and eyebrow render directly onto, with
 * nothing between the text and full-opacity moving footage. The wash is
 * `--color-lab-bg` rather than the full-bleed scrim's charcoal, so it settles
 * the clip toward the plate's own tone instead of introducing a mismatched
 * dark rectangle.
 *
 * With `prefers-reduced-motion` no video is mounted at all — a continuously
 * looping background is exactly what that preference is asking us not to do.
 */
export function PanelVideo({
  src,
  /**
   * Centre the clip at its own proportions instead of covering the panel.
   * The Labs loop reads as a framed object the way the hero sequence does —
   * `object-cover` cropped it to the panel and made it read as wallpaper.
   */
  contained = false,
  /**
   * Play the clip out and then back in, instead of cutting to the first
   * frame. For a loop whose last frame does not meet its first, the cut is
   * the only thing on the panel that moves discontinuously, and the eye
   * finds it every time round.
   *
   * There is no `playbackRate = -1` to reach for — the spec allows a
   * negative rate and no browser implements one — so the return leg is
   * driven by hand, off `requestAnimationFrame`, walking `currentTime` back
   * in wall-clock time so it takes exactly as long as the way out.
   *
   * The alternative was baking the reversed tail into the file and keeping
   * the native `loop`, which costs nothing at runtime. It also doubles the
   * asset, and this one is already 9.4 MB behind a 65% scrim.
   */
  boomerang = false,
}: {
  src: string;
  contained?: boolean;
  boomerang?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  /* `autoplay` is a request, not a guarantee: it is refused often enough —
     iOS Low Power Mode, some privacy settings, and any headless browser — to
     be worth asking again once the element is mounted and muted. Measured
     paused with the attribute alone. A refusal is fine and deliberately
     swallowed: the panel reads perfectly well on a still frame. */
  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt) attempt.catch(() => {});
  }, [reducedMotion, src]);

  /* The return leg. `loop` is off for a boomerang, which is the only reason
     `ended` fires at all — a looping element seeks to zero and keeps going
     without ever ending. */
  useEffect(() => {
    if (reducedMotion || !boomerang) return;
    const video = videoRef.current;
    if (!video) return;

    let frame = 0;
    let previous = 0;

    const rewind = (now: number) => {
      if (!previous) previous = now;

      /* Skip the write while a seek is still outstanding rather than
         queueing another: stepping backwards decodes from the nearest
         keyframe every time, and this clip only completes about 11 of those
         a second against a 121Hz frame callback, so queueing them turns the
         rewind into a stall.

         `previous` therefore only advances on a frame that actually wrote.
         Resetting it on a skipped frame throws that frame's slice of time
         away, and with nine in ten frames skipped the return leg ran at a
         tenth of real speed — measured at 0.096x before this line moved. */
      if (!video.seeking) {
        const elapsed = (now - previous) / 1000;
        previous = now;
        const next = video.currentTime - elapsed;
        if (next <= 0) {
          video.currentTime = 0;
          previous = 0;
          frame = 0;
          const attempt = video.play();
          if (attempt) attempt.catch(() => {});
          return;
        }
        video.currentTime = next;
      }

      frame = requestAnimationFrame(rewind);
    };

    const onEnded = () => {
      video.pause();
      previous = 0;
      frame = requestAnimationFrame(rewind);
    };

    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ended", onEnded);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion, boomerang, src]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        contained && "flex items-center justify-center",
      )}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop={!boomerang}
        muted
        playsInline
        preload="auto"
        onError={(event) => {
          // If the clip will not decode, leave nothing rather than a broken
          // poster frame. Silent by design: the panel still reads without it.
          event.currentTarget.style.display = "none";
        }}
        className={cn(
          contained
            ? "h-auto max-h-[88%] w-auto max-w-[94%] object-contain opacity-70"
            : "h-full w-full object-cover opacity-45",
        )}
        style={contained ? CONTAINED_FEATHER : undefined}
      />
      {contained ? (
        <div className="absolute inset-0 bg-lab-bg/35" />
      ) : (
        <div className="absolute inset-0 bg-panel/65" />
      )}
    </div>
  );
}

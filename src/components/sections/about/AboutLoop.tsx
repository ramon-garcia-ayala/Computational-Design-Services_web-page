"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The loop beside the founding story.
 *
 * Absolutely positioned inside a stretched grid cell, so its height is
 * whatever the column next to it comes to and the two stay aligned however
 * the copy reflows. `object-cover` is what lets it do that without the frame
 * distorting.
 *
 * Playback is asked for from an effect as well as declared on the element:
 * `autoplay` is a request browsers refuse often enough — iOS Low Power Mode,
 * privacy settings, any headless browser — that the attribute alone leaves
 * clips paused. Measured that way on the panel loops.
 *
 * Nothing is mounted under `prefers-reduced-motion`: a video looping forever
 * beside body copy is exactly what that preference is asking us not to do,
 * and the story reads without it.
 *
 * **Its edges are feathered, and that is why it carries no frame.** The clip's
 * backdrop averages #b8b3b0 against the page's #b8b4b1 — the same colour to
 * within a step — but its corners run #a5a3a1 to #cac5c0, so any hard boundary
 * shows a seam that is darker down one side and lighter down the other. No
 * single page colour can match a gradient. Fading the outer band away removes
 * the boundary instead of trying to colour-match it, which is the same fix the
 * Labs clip needed.
 */

/* Two crossed linear gradients rather than one ellipse, so each axis fades on
   its own schedule — the clip is much taller than it is wide here, and an
   ellipse would over-fade the short axis to reach the long one. */
const FEATHER = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), " +
    "linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), " +
    "linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  /* Both masks must apply, not stack: "intersect" is what fades the corners
     too. WebKit's older spelling of the same operation is "source-in". */
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

export function AboutLoop({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt) attempt.catch(() => {});
  }, [reducedMotion, src]);

  if (reducedMotion) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      style={FEATHER}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

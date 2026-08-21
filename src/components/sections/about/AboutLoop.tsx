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
 */
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
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

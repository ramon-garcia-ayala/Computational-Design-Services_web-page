"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A looping background clip behind a panel's content (spec §13.3, §13.6).
 *
 * Muted, autoplaying, looping and `playsInline` — the last of those matters
 * on iOS, which otherwise takes any playing video fullscreen and throws the
 * visitor out of the page.
 *
 * **The files are not supplied yet (§13.8).** A missing `src` makes the
 * element request a path that 404s; it then renders nothing and the panel
 * simply shows its own plate. Nothing throws and no layout shifts, because
 * the element is absolutely positioned and never contributes height — so
 * dropping the real clips into `public/videos/panels/` is the only step left.
 * `onError` is handled explicitly so a missing file cannot leave a broken
 * poster frame behind.
 *
 * It sits *under* the panel's content: the wrapper is `absolute inset-0` with
 * the content marked `relative` beside it, so no z-index bookkeeping is
 * needed. A scrim rides on top of the video so type stays legible whatever
 * the clip happens to be doing behind it.
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
}: {
  src: string;
  contained?: boolean;
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
        loop
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
            ? "max-h-[76%] w-auto max-w-[80%] object-contain opacity-70"
            : "h-full w-full object-cover opacity-45",
        )}
      />
      {/* Scrim: the panel plate at partial strength, so the copy above keeps
          its contrast no matter what the loop is showing. Lighter over a
          contained clip, which is already inset and less assertive. */}
      <div className={cn("absolute inset-0", contained ? "bg-panel/45" : "bg-panel/65")} />
    </div>
  );
}

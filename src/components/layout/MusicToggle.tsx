"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Optional track. Drop the file in /public and uncomment to enable it. */
const AUDIO_SRC: string | null = null; // e.g. "/audio/ambient.mp3"

/**
 * Music button in the header.
 *
 * Phase 1: the button works but no track is loaded. When `AUDIO_SRC` is null it
 * behaves as a visual switch (the bars animate) without touching the audio DOM,
 * so there is no 404 and no rejected playback promises.
 */
/**
 * `variant` mirrors `Header`'s: `"dark"` is the original and is what every
 * live page gets by leaving the prop off. `"light"` exists for `/design-lab`,
 * where the dark border and muted grey would all but vanish on the greige
 * plate. It cannot be done with `className` alone — the level bars and the
 * On/Off label carry their own colours and are out of reach from outside.
 */
export function MusicToggle({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const light = variant === "light";
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      // The browser may block playback: if it fails, we revert.
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <button
      type="button"
      onClick={() => setPlaying((value) => !value)}
      aria-pressed={playing}
      aria-label={playing ? "Turn sound off" : "Turn sound on"}
      className={cn(
        "group flex items-center gap-2 rounded-control border px-3 py-1.5 transition-colors",
        light
          ? "border-edge hover:border-lab-ink"
          : "border-edge hover:border-accent-ink",
        className,
      )}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              "w-[2px] origin-bottom transition-all duration-300",
              light
                ? "bg-lab-ink/60 group-hover:bg-lab-ink"
                : "bg-fg-muted group-hover:bg-accent",
              playing && (light ? "animate-pulse bg-lab-ink" : "animate-pulse bg-accent"),
            )}
            style={{
              height: playing ? `${6 + index * 3}px` : "4px",
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-widest transition-colors",
          light
            ? "text-lab-ink-muted group-hover:font-bold group-hover:text-lab-ink"
            : "text-fg-muted group-hover:text-accent-ink",
        )}
      >
        {playing ? "On" : "Off"}
      </span>
      {AUDIO_SRC ? <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" /> : null}
    </button>
  );
}

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
export function MusicToggle({ className }: { className?: string }) {
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
        "group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-accent",
        className,
      )}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              "w-[2px] origin-bottom bg-fg-muted transition-all duration-300 group-hover:bg-accent",
              playing ? "animate-pulse bg-accent" : "",
            )}
            style={{
              height: playing ? `${6 + index * 3}px` : "4px",
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors group-hover:text-accent">
        {playing ? "On" : "Off"}
      </span>
      {AUDIO_SRC ? <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" /> : null}
    </button>
  );
}

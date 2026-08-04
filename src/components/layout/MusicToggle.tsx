"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Pista opcional. Colocar el archivo en /public y descomentar para activarla. */
const AUDIO_SRC: string | null = null; // p.ej. "/audio/ambient.mp3"

/**
 * Botón de música del header.
 *
 * Fase 1: el botón es funcional pero no hay pista cargada. Si `AUDIO_SRC` es
 * null se comporta como un interruptor visual (las barras se animan) sin tocar
 * el DOM de audio, así que no hay 404 ni promesas de reproducción rechazadas.
 */
export function MusicToggle({ className }: { className?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      // El navegador puede bloquear la reproducción: si falla, revertimos.
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

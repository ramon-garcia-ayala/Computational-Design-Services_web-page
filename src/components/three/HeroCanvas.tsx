"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * three.js, R3F y drei viajan en su propio chunk gracias a este import
 * dinámico con `ssr: false`. Nada de esto entra en la carga inicial.
 */
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * Envoltorio de la escena decorativa del hero.
 *
 * Dos salvaguardas para no tocar el LCP:
 *  1. La escena no se importa hasta que el navegador está ocioso
 *     (`requestIdleCallback`, con fallback a `setTimeout`).
 *  2. Con `prefers-reduced-motion` no se monta nada y queda solo el fondo CSS.
 *
 * Es puramente decorativa: `aria-hidden` y sin eventos de puntero.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {ready ? <HeroScene /> : null}
    </div>
  );
}

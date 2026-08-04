"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * three.js, R3F and drei ship in their own chunk thanks to this dynamic import
 * with `ssr: false`. None of it lands in the initial load.
 */
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * Wrapper around the hero's decorative scene.
 *
 * Two safeguards to keep the LCP untouched:
 *  1. The scene is not imported until the browser is idle
 *     (`requestIdleCallback`, falling back to `setTimeout`).
 *  2. `prefers-reduced-motion` mounts nothing, leaving only the CSS backdrop.
 *
 * It is purely decorative: `aria-hidden` and no pointer events.
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

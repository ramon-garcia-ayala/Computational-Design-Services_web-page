"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** En servidor asumimos "sin reducción" para que el HTML estático sea el normal. */
function getServerSnapshot() {
  return false;
}

/**
 * Única fuente de verdad para `prefers-reduced-motion` en el sitio.
 *
 * Al devolver `true` el proyecto desactiva tres cosas:
 *  1. Lenis no se instancia y el scroll vuelve a ser nativo (SmoothScroll.tsx)
 *  2. Los tweens de GSAP se sustituyen por su estado final, sin scrub ni pin
 *  3. La escena de React Three Fiber del hero no se monta (HeroCanvas.tsx)
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

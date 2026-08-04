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

/** On the server we assume "no reduction" so the static HTML is the normal one. */
function getServerSnapshot() {
  return false;
}

/**
 * Single source of truth for `prefers-reduced-motion` across the site.
 *
 * When it returns `true` the project disables three things:
 *  1. Lenis is not instantiated and scrolling falls back to native (SmoothScroll.tsx)
 *  2. GSAP tweens are replaced by their end state, with no scrub and no pin
 *  3. The hero's React Three Fiber scene is not mounted (HeroCanvas.tsx)
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

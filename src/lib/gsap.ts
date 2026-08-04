"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Single registration point for GSAP plugins.
 *
 * ALWAYS import `gsap` and `ScrollTrigger` from here, never from the package
 * directly: registering the plugin in more than one place creates duplicate
 * instances and leaves ScrollTriggers that are never cleaned up.
 *
 * `useGSAP` is re-exported for convenience. Use it with `{ scope: ref }` so
 * cleanup happens automatically on unmount and across StrictMode's double
 * render.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };

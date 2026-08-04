"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Smooth scroll global (Lenis) acoplado a GSAP.
 *
 * Puntos importantes:
 *  - Lenis se instancia UNA sola vez y se conduce desde el ticker de GSAP.
 *    Si cada librería corriese su propio requestAnimationFrame el scroll y los
 *    ScrollTriggers se desincronizarían un frame.
 *  - `lenis.on("scroll", ScrollTrigger.update)` mantiene los triggers al día,
 *    porque Lenis no dispara el evento scroll nativo del documento.
 *  - Con `prefers-reduced-motion` no se instancia nada: scroll nativo del navegador.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Curva de salida suave; sin overshoot para que el pin no vibre.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // El ticker de GSAP normalmente limita el delta; aquí estorba.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

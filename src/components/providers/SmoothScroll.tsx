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
 *  - Los saltos a anclas TIENEN que pasar por Lenis. Un salto nativo mueve el
 *    documento sin que Lenis lo sepa, así que ScrollTrigger sigue creyendo que
 *    estamos arriba y nada de lo que anima llega a revelarse: la página se ve
 *    en blanco. De ahí `anchors` y el salto inicial de abajo.
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
      // Lenis intercepta los clics en enlaces internos y los anima él mismo.
      anchors: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // El ticker de GSAP normalmente limita el delta; aquí estorba.
    gsap.ticker.lagSmoothing(0);

    /* Entrada directa a una URL con hash: el navegador ya ha saltado por su
       cuenta antes de que Lenis existiera. Se rehace el salto a través de él
       para que su posición y la del documento vuelvan a coincidir. */
    const { hash } = window.location;
    if (hash.length > 1) {
      const target = document.querySelector(hash);
      if (target) {
        window.scrollTo(0, 0);
        lenis.scrollTo(target as HTMLElement, { immediate: true });
        ScrollTrigger.refresh();
      }
    }

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

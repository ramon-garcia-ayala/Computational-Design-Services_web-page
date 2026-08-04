"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  /**
   * Selector de los hijos a escalonar (p. ej. `"[data-reveal]"`). Si se omite,
   * se anima el propio contenedor como un bloque.
   *
   * Al usarlo, los hijos deben llevar la clase `reveal-init`; el contenedor no.
   */
  stagger?: string;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "ul" | "li";
};

/**
 * Entrada estándar de sección: fade + subida de 24px al entrar en viewport,
 * una sola vez. Es la única forma en que el sitio anima apariciones, para no
 * repetir configuración de ScrollTrigger en cada sección.
 *
 * Los elementos parten con `reveal-init` (opacidad 0 en CSS), así que no hay
 * flash de contenido antes de que corra el tween. Con `prefers-reduced-motion`
 * esa clase se neutraliza desde globals.css y aquí no se crea ningún trigger.
 */
export function Reveal({
  children,
  stagger,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const targets: Element[] = stagger
        ? Array.from(root.querySelectorAll(stagger))
        : [root];
      if (targets.length === 0) return;

      if (reducedMotion) {
        // Sin animación: se deja el estado final y se limpia la clase inicial.
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(!stagger && "reveal-init", className)}
    >
      {children}
    </Tag>
  );
}

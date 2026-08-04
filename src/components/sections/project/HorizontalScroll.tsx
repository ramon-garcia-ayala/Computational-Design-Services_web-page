"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ProjectPanel } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Recorrido horizontal del caso de estudio.
 *
 * De `lg` en adelante la sección se fija (pin) y la fila de paneles se desplaza
 * en X siguiendo el scroll vertical. Por debajo de 1024px, o con
 * `prefers-reduced-motion`, los paneles se apilan en vertical y no se crea
 * ningún ScrollTrigger: el contenido es el mismo, solo cambia la forma de
 * recorrerlo.
 *
 * `gsap.matchMedia` es quien decide: al cruzar el breakpoint revierte lo creado
 * en la condición anterior, sin listeners de resize a mano.
 */
export function HorizontalScroll({ panels }: { panels: ProjectPanel[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // La condición incluye la preferencia del sistema a propósito: se evalúa
      // en el momento del efecto, así que el pin nunca llega a crearse con
      // reduced motion, ni siquiera en el render de hidratación (donde el hook
      // todavía no puede conocer la preferencia real).
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = trackRef.current;
          const section = sectionRef.current;
          if (!track || !section) return;

          // Distancia real a recorrer; se recalcula en cada refresh por si
          // cambian tipografías o el ancho de la ventana.
          const getDistance = () => track.scrollWidth - window.innerWidth;

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Case study"
      className={cn(
        "relative border-t border-line",
        // Solo la variante animada necesita ocupar la ventana completa.
        !reducedMotion && "lg:h-screen lg:overflow-hidden",
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex flex-col",
          !reducedMotion && "lg:h-full lg:flex-row lg:items-center lg:will-change-transform",
        )}
      >
        {panels.map((panel, index) => (
          <article
            key={panel.id}
            className={cn(
              "flex shrink-0 flex-col justify-center border-b border-line px-5 py-16 sm:px-8 sm:py-20",
              "lg:border-b-0 lg:px-12",
              !reducedMotion && "lg:h-full lg:w-[min(46rem,80vw)] lg:border-r lg:border-line",
              reducedMotion && "lg:px-12",
              index === 0 && "lg:pl-12",
            )}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {panel.kicker}
            </p>
            <h2 className="mt-6 max-w-xl font-display text-2xl leading-tight font-semibold tracking-tight text-fg sm:text-3xl lg:text-4xl">
              {panel.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted">
              {panel.body}
            </p>

            {panel.facts ? (
              <dl className="mt-10 grid max-w-xl gap-6 sm:grid-cols-2">
                {panel.facts.map((fact) => (
                  <div key={fact.label} className="border-t border-line pt-4">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-lg font-semibold text-fg">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Stat } from "@/data/stats";

function format(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Métrica con contador animado.
 *
 * El valor final se renderiza en servidor, así que es correcto sin JS y para
 * lectores de pantalla. La animación solo reescribe el textContent del nodo.
 * Con `prefers-reduced-motion` no se anima nada.
 */
export function StatItem({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const decimals = stat.decimals ?? 0;

  useGSAP(
    () => {
      const node = ref.current?.querySelector<HTMLElement>("[data-counter]");
      if (!node) return;

      if (reducedMotion) {
        // Restaura el valor final explícitamente: en el render de hidratación
        // el hook todavía devuelve false, así que el tween puede haber puesto
        // ya el contador a 0 antes de que la preferencia se conozca.
        node.textContent = format(stat.value, decimals);
        return;
      }

      const counter = { value: 0 };
      node.textContent = format(0, decimals);

      gsap.to(counter, {
        value: stat.value,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          node.textContent = format(counter.value, decimals);
        },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={ref}
      className="reveal-init border-t border-line pt-5"
      data-reveal
    >
      <p className="font-mono text-2xl font-medium tracking-tight text-fg tabular-nums sm:text-3xl lg:text-4xl">
        {stat.prefix}
        <span data-counter>{format(stat.value, decimals)}</span>
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm text-fg-muted">{stat.label}</p>
    </div>
  );
}

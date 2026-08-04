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
 * Metric with an animated counter.
 *
 * The final value is rendered on the server, so it is correct without JS and
 * for screen readers. The animation only rewrites the node's textContent.
 * With `prefers-reduced-motion` nothing animates.
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
        // Restore the final value explicitly: on the hydration render the hook
        // still returns false, so the tween may already have set the counter
        // to 0 before the preference became known.
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

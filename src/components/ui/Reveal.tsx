"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  /**
   * Selector for the children to stagger (e.g. `"[data-reveal]"`). If omitted,
   * the container itself is animated as a single block.
   *
   * When used, the children must carry the `reveal-init` class; the container
   * must not.
   */
  stagger?: string;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "ul" | "li";
};

/**
 * Standard section entrance: fade + 24px rise when it enters the viewport, once
 * only. This is the only way the site animates reveals, so ScrollTrigger setup
 * is not repeated in every section.
 *
 * Elements start out with `reveal-init` (opacity 0 in CSS), so there is no
 * flash of content before the tween runs. With `prefers-reduced-motion` that
 * class is neutralised from globals.css and no trigger is created here.
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
        // No animation: settle on the final state and clear the initial class.
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

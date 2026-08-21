"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * "Explore more" — the way out of the Services panel and into `/services`.
 *
 * Its own file rather than living in `Panels.tsx`, because the looping chevron
 * needs `useGSAP` and therefore a client boundary; putting it here keeps the
 * four panel bodies as Server Components.
 *
 * The chevron loops on a short y-offset. It is `aria-hidden` — the link text
 * already says where this goes, and a screen reader gaining a stray arrow
 * character adds nothing.
 */
export function ExploreMore({
  href = "/services",
  label = "Explore more",
}: {
  href?: string;
  label?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // A perpetual loop is exactly what the preference asks us to drop, so
      // under reduced motion the chevron simply sits where it is.
      if (reducedMotion) return;

      const tween = gsap.to("[data-chevron]", {
        y: 5,
        duration: 0.85,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      return () => {
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className="mt-[6svh] flex justify-center">
      <Link
        href={href}
        className="group inline-flex flex-col items-center gap-3 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-fg transition-colors duration-200 hover:text-accent sm:text-sm"
      >
        <span className="border-b border-fg/30 pb-1 transition-colors duration-200 group-hover:border-accent">
          {label}
        </span>
        <svg
          data-chevron
          aria-hidden="true"
          viewBox="0 0 24 14"
          className="h-3.5 w-6 text-accent"
        >
          <path
            d="M2 2l10 10L22 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

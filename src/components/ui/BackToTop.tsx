"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTop } from "@/lib/lenis";
import { cn } from "@/lib/utils";

/** How far down the page the control appears, as a fraction of the viewport. */
const APPEAR_AFTER = 0.6;

/**
 * Returns the page to the top from anywhere on it.
 *
 * Three things here are not the obvious implementation, and two share a root
 * cause — Lenis owns the scroll on this site.
 *
 * **The click goes through `scrollToTop()`, never `window.scrollTo`.** A native
 * scroll moves the document behind Lenis's back and leaves the two disagreeing
 * about where the page is; ScrollTrigger believes the stale position and every
 * reveal below stops firing. The rationale lives in `lib/lenis.ts`.
 *
 * **Visibility comes from a ScrollTrigger, not a scroll listener.** Lenis never
 * emits the document's native scroll event, so `addEventListener("scroll", …)`
 * would never fire while smooth scroll is on — and would spring to life the
 * moment reduced motion disabled Lenis, which is the kind of bug that looks
 * like it works. ScrollTrigger is fed by Lenis when it is running and by the
 * browser when it is not, so it is right in both.
 *
 * **The trigger uses numeric scroll positions and no `trigger` element.** An
 * earlier version wrote `trigger: document.documentElement, start: "top -90%"`,
 * which reads as "after 90% of a viewport" and never fired: a negative scroller
 * percentage against a trigger whose top sits at scroll 0 is not the same
 * measurement, and it fails silently — the control simply stays hidden with no
 * error to find. Numbers are absolute scroll offsets and cannot be misread.
 */
export function BackToTop({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        start: () => window.innerHeight * APPEAR_AFTER,
        /* `end` has to stay above `start` or the range is degenerate and never
           activates — which is the same silent failure as before on any page
           short enough that max scroll is under one viewport. */
        end: () =>
          Math.max(
            window.innerHeight * APPEAR_AFTER + 1,
            ScrollTrigger.maxScroll(window),
          ),
        onToggle: (self) => setShown(self.isActive),
        /* Landing already scrolled — a reload part-way down, or a back
           navigation — fires no toggle, so the state is taken from the trigger
           on every refresh as well. */
        onRefresh: (self) => setShown(self.isActive),
        invalidateOnRefresh: true,
      });

      /* These pages grow after mount: the home page as its frame sequence
         decodes and its panels mount, a project as its media resolves. The
         height measured on the first pass is not the real one. */
      ScrollTrigger.refresh();

      return () => trigger.kill();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed right-5 bottom-5 z-[70] sm:right-8 sm:bottom-8",
        /* White inverted against whatever is behind it. The home page runs a
           pale greige hero into near-black panels, so a fixed control in any
           single colour disappears over half the page — the same reason
           `ScrollProgress` blends, and the same answer. */
        "mix-blend-difference",
        // Hidden means gone: not clickable, not focusable, not announced.
        !shown && "pointer-events-none",
        className,
      )}
      aria-hidden={!shown}
    >
      <button
        type="button"
        onClick={scrollToTop}
        tabIndex={shown ? undefined : -1}
        className={cn(
          "group flex items-center gap-2.5 rounded-full border border-white/40 px-4 py-3",
          "font-mono text-[10px] tracking-widest text-white uppercase",
          "transition-[opacity,transform,background-color] duration-300 ease-out",
          "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
          shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {/* Drawn rather than typed: a glyph would take the body font and sit
            off-centre against mono capitals. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
        Back to top
      </button>
    </div>
  );
}

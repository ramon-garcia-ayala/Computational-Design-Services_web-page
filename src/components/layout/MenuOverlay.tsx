"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { labsLink, navLinks } from "@/data/nav";
import { site, socialLinks } from "@/data/site";
import { cn } from "@/lib/utils";

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Id of the button that opens the menu, to return focus to it on close. */
  labelledBy: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * Fullscreen menu. It is always mounted and hidden through `pointer-events`
 * and visibility so the exit can be animated; while closed it stays out of the
 * accessibility tree (`aria-hidden` + `inert`).
 */
export function MenuOverlay({ open, onClose, labelledBy }: MenuOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Escape closes it, and background scroll is locked while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;

      // Focus trap: tabbing cycles only within the overlay.
      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    // The first link takes focus on open.
    const firstItem =
      containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstItem?.focus();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Staggered entrance for the links. With reduced motion there is no tween.
  useGSAP(
    () => {
      if (!open || reducedMotion) return;

      gsap.fromTo(
        "[data-menu-item]",
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
        },
      );
      gsap.fromTo(
        "[data-menu-aside]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: "power2.out" },
      );
    },
    { scope: containerRef, dependencies: [open, reducedMotion] },
  );

  return (
    <div
      ref={containerRef}
      id="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open ? true : undefined}
      className={cn(
        "font-display fixed inset-0 z-40 flex flex-col bg-panel transition-opacity duration-500",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-20" aria-hidden="true" />

      {/* `justify-start` with `my-auto` on the children, not `justify-center`
          — the same fix `PanelSection` documents at length, for the same
          failure. With `justify-center`, content taller than the box overflows
          it *symmetrically* and the top half goes out of reach: at 320x568 the
          menu's first link, "Home", was drawn underneath the header, and there
          was no way to get to it. Auto margins distribute *free* space, so
          they centre when it fits and collapse to zero when it does not, which
          sends the overflow downward — and `overflow-y-auto` then makes it
          reachable rather than merely clipped somewhere less bad.

          `pt-20` rather than `pt-24`: the header is a fixed 64px, so 80 clears
          it at every height and returns 16px to a column that was running out.

          The nav loses `flex-1` below `lg`. It was there for the desktop row,
          where it pushes the aside to the far edge; stacked, all it did was
          grow the nav to fill the leftover height and strand the newsletter
          160px below the last link. */}
      <div className="shell relative flex min-h-0 flex-1 flex-col justify-start gap-10 overflow-y-auto pt-20 pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:overflow-visible lg:pt-24 lg:pb-20">
        <nav aria-labelledby={labelledBy} className="my-auto lg:my-0 lg:flex-1">
          <ul className="flex flex-col gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <li key={link.label} className="overflow-hidden">
                {link.external ? (
                  <a
                    data-menu-item
                    href={link.href}
                    onClick={onClose}
                    className="block text-[clamp(1.65rem,4.6svh,2.25rem)] leading-[1.1] font-semibold tracking-tight text-fg transition-colors hover:text-accent-ink sm:text-6xl lg:text-7xl"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    data-menu-item
                    href={link.href}
                    onClick={onClose}
                    className="block text-[clamp(1.65rem,4.6svh,2.25rem)] leading-[1.1] font-semibold tracking-tight text-fg transition-colors hover:text-accent-ink sm:text-6xl lg:text-7xl"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div
          data-menu-aside
          className="my-auto flex w-full flex-col gap-6 lg:my-0 lg:max-w-sm lg:gap-8 lg:pb-4"
        >
          {/* Newsletter: UI only at this phase, no backend wired up. */}
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => event.preventDefault()}
          >
            <label
              htmlFor="newsletter-email"
              className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
            >
              Newsletter
            </label>
            <div className="flex items-center gap-2 border-b border-panel-line pb-2 focus-within:border-accent-ink">
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
              />
              <button
                type="submit"
                /* 15px tall as bare text. `min-h-11` with the negative
                    margin keeps it on the field's own baseline while giving
                    it a real box — it sits beside a text input, so it is the
                    one control here a thumb has to find precisely. */
                className="-my-3 inline-flex min-h-11 shrink-0 items-center font-mono text-[10px] whitespace-nowrap uppercase tracking-widest text-accent-ink transition-opacity hover:opacity-70"
              >
                Sign up
              </button>
            </div>
            <p className="text-xs text-fg-muted">
              Occasional notes on automation in AEC. No backend wired yet.
            </p>
          </form>

          <Link
            href={labsLink.href}
            onClick={onClose}
            className="group flex items-center justify-between rounded-surface border border-panel-line bg-carbon/40 px-4 py-4 transition-colors hover:border-accent-ink"
          >
            <span>
              <span className="block text-lg font-semibold text-fg">
                {labsLink.label}
              </span>
              <span className="block text-xs text-fg-muted">
                {labsLink.description}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-accent-ink transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          {/* `gap-x-2` with the padding inside each link instead of between
              them: these were 13px tall and 20px apart, which is two targets
              under the floor separated by a gap that did not help. */}
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="-mx-2 inline-flex min-h-9 items-center px-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-accent-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            {site.location}
          </p>
        </div>
      </div>
    </div>
  );
}

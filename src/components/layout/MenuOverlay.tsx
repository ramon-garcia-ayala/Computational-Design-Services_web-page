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
  /** Id del botón que abre el menú, para devolverle el foco al cerrar. */
  labelledBy: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * Menú fullscreen. Se monta siempre y se oculta con `pointer-events` y
 * visibilidad para poder animar la salida; cuando está cerrado queda fuera del
 * árbol de accesibilidad (`aria-hidden` + `inert`).
 */
export function MenuOverlay({ open, onClose, labelledBy }: MenuOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Cierre con Escape y bloqueo del scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;

      // Trampa de foco: el tabulador circula solo dentro del overlay.
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

    // El primer enlace recibe el foco al abrir.
    const firstItem =
      containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstItem?.focus();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Entrada escalonada de los enlaces. Con reduced motion no hay tween.
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
        "fixed inset-0 z-40 flex flex-col bg-carbon transition-opacity duration-500",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="shell relative flex min-h-0 flex-1 flex-col justify-center gap-12 pt-24 pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-20">
        <nav aria-labelledby={labelledBy} className="flex-1">
          <ul className="flex flex-col gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <li key={link.label} className="overflow-hidden">
                {link.external ? (
                  <a
                    data-menu-item
                    href={link.href}
                    onClick={onClose}
                    className="block font-display text-4xl leading-[1.1] font-semibold tracking-tight text-fg transition-colors hover:text-accent sm:text-6xl lg:text-7xl"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    data-menu-item
                    href={link.href}
                    onClick={onClose}
                    className="block font-display text-4xl leading-[1.1] font-semibold tracking-tight text-fg transition-colors hover:text-accent sm:text-6xl lg:text-7xl"
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
          className="flex w-full flex-col gap-8 lg:max-w-sm lg:pb-4"
        >
          {/* Newsletter: solo UI en esta fase, sin backend conectado. */}
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
            <div className="flex items-center gap-2 border-b border-line pb-2 focus-within:border-accent">
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 font-mono text-[10px] whitespace-nowrap uppercase tracking-widest text-accent transition-opacity hover:opacity-70"
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
            className="group flex items-center justify-between rounded-lg border border-line bg-graphite px-4 py-4 transition-colors hover:border-accent"
          >
            <span>
              <span className="block font-display text-lg font-semibold text-fg">
                {labsLink.label}
              </span>
              <span className="block text-xs text-fg-muted">
                Experiments and open tools
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-accent transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-accent"
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

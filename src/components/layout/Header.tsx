"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuOverlay } from "./MenuOverlay";
import { MusicToggle } from "./MusicToggle";
import { mailtoHref, site } from "@/data/site";
import { cn } from "@/lib/utils";

const MENU_BUTTON_ID = "menu-trigger";

/**
 * Header fijo: logo a la izquierda, descriptor al centro, controles a la derecha
 * (música, "let's talk" y el disparador del menú fullscreen).
 *
 * El estado del menú vive aquí porque el disparador y el overlay tienen que
 * compartirlo y devolverse el foco entre sí.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Cambiar de ruta cierra el menú. Se ajusta durante el render (patrón de
  // estado derivado de React) en vez de con un efecto, que provocaría un
  // segundo render en cascada.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Degradado de legibilidad: el header flota sobre el contenido, sin él
            los controles se pierden al pasar secciones claras por debajo. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-carbon via-carbon/80 to-transparent"
          aria-hidden="true"
        />

        <div className="shell relative flex items-center justify-between gap-4 py-5">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
            aria-label={`${site.nameFlat} home`}
          >
            R<sup className="text-accent">2</sup>ch-Tech
          </Link>

          <p className="hidden max-w-xs text-center text-xs leading-tight text-fg-muted lg:block">
            {site.descriptor}
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            <MusicToggle className="hidden sm:flex" />

            <a
              href={mailtoHref}
              className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-xs"
            >
              Let&apos;s talk
            </a>

            <button
              id={MENU_BUTTON_ID}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-overlay"
              className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-xs"
            >
              <span className="flex w-4 flex-col gap-[3px]" aria-hidden="true">
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-300",
                    menuOpen && "translate-y-[4px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-300",
                    menuOpen && "-translate-y-[3px] -rotate-45",
                  )}
                />
              </span>
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          document.getElementById(MENU_BUTTON_ID)?.focus();
        }}
        labelledBy={MENU_BUTTON_ID}
      />
    </>
  );
}

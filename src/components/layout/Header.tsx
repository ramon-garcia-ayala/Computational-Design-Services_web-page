"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuOverlay } from "./MenuOverlay";
import { MusicToggle } from "./MusicToggle";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const MENU_BUTTON_ID = "menu-trigger";

/* The wordmark as a CSS mask, for the light header only. Hardcoded rather
   than read from `data/design-lab.ts` so this shared component keeps no
   dependency on the sandbox route's data — the asset itself is the site's,
   built by `scripts/logo-mask.mjs`. Ratio is the source PNG's own. */
const LOGO = { src: "/logo/logo-mask.png", width: 3103, height: 611 };

/**
 * Fixed header: logo on the left, descriptor in the middle, controls on the
 * right (music, "let's talk" and the fullscreen menu trigger).
 *
 * The menu state lives here because the trigger and the overlay have to share
 * it and hand focus back to each other.
 *
 * `variant` exists for `/design-lab`, whose hero is a light greige plate: the
 * default near-white type and carbon legibility gradient all but vanish on
 * it. `"dark"` is the original and is what every live page gets by leaving
 * the prop off, so this is additive — nothing on the live site changes.
 */
export function Header({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const light = variant === "light";
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Changing route closes the menu. Adjusted during render (React's derived
  // state pattern) instead of in an effect, which would trigger a second
  // cascading render.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      {/* `data-site-pale` when light: the header's `light` variant only ever
          sits on the pale/greige plate (Home's hero, and the gradient band
          every (site) route inherits from the layout above) — never inside
          the `[data-site-pale]` div itself, since it renders one level above
          it. Without this, its focus ring stayed hardwired to amber-on-
          greige (1.00:1) even after /about and /contact were fixed, because
          the header sits outside the div those pages wrap their content in.
          Safe to stamp broadly: every light-branch class in this file and in
          `MusicToggle` reads `lab-*` tokens, never the ones this scope
          redefines. */}
      <header
        data-site-pale={light || undefined}
        className="font-display fixed inset-x-0 top-0 z-50"
      >
        {/* Legibility gradient: the header floats over the content, and without
            it the controls get lost as light sections scroll underneath. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent",
            light
              ? "from-lab-bg via-lab-bg/80"
              : "from-carbon via-carbon/80",
          )}
          aria-hidden="true"
        />

        {/* The light header runs edge to edge rather than inside `.shell`:
            its logo sits flush left and its controls flush right, so the
            chrome frames the full-bleed hero instead of floating in a
            narrower column over it. The dark header keeps `.shell`, which is
            what every live page uses. */}
        <div
          className={cn(
            "relative flex items-center justify-between gap-4 py-5",
            light ? "px-6 sm:px-8 lg:px-10" : "shell",
          )}
        >
          <Link
            href="/"
            className={cn(
              "shrink-0 opacity-100 transition-opacity hover:opacity-70",
            )}
            aria-label={`${site.nameFlat} home`}
          >
            {/* The real wordmark on every page. It used to be set type outside the
                light variant, which meant the logo changed shape depending on
                which route you were on. `variant` decides its ink, nothing
                more: dark on the hero's pale plate, light on the panel ground
                the rest of the site sits on. */}
            <span
              className={cn(
                "block w-[132px] sm:w-[150px]",
                light ? "bg-lab-ink" : "bg-fg",
              )}
              style={{
                aspectRatio: `${LOGO.width} / ${LOGO.height}`,
                WebkitMaskImage: `url('${LOGO.src}')`,
                maskImage: `url('${LOGO.src}')`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            />
          </Link>

          {/* Centred on the viewport, not merely between its neighbours: as a
              flex child its position would shift with the width of the logo
              and the control cluster, which are not the same size. Absolute
              centring makes it independent of both. One line, never wrapped. */}
          <p
            className={cn(
              "hidden text-center text-xs leading-tight lg:block",
              light
                ? "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lab-ink-muted"
                : "max-w-xs text-fg-muted",
            )}
          >
            {site.descriptor}
          </p>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <MusicToggle className="hidden sm:flex" variant={variant} />

            {/* `/contact`, not a mailto. A `mailto:` does nothing at all for
                a visitor with no desktop mail client configured — which is
                most people on webmail — so the primary CTA silently did
                nothing for them. The contact page carries a working form
                *and* offers the mailto to anyone who prefers it, so nobody
                loses a route. Label matches every other primary CTA
                site-wide — `site.contactLabel`, not its own wording. */}
            <Link
              href="/contact"
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors sm:px-4 sm:text-xs",
                light
                  ? "border-lab-ink/25 text-lab-ink/80 hover:border-lab-ink hover:font-bold hover:text-lab-ink"
                  : "border-line text-fg hover:border-accent hover:text-accent",
              )}
            >
              {site.contactLabel}
            </Link>

            <button
              id={MENU_BUTTON_ID}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-overlay"
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors sm:px-4 sm:text-xs",
                light
                  ? "border-lab-ink/25 text-lab-ink/80 hover:border-lab-ink hover:font-bold hover:text-lab-ink"
                  : "border-line text-fg hover:border-accent hover:text-accent",
              )}
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

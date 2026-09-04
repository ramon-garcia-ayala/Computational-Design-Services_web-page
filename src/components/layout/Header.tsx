"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuOverlay } from "./MenuOverlay";
import { portalLink } from "@/data/nav";
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
 * right (the portal pill, "get in touch" and the fullscreen menu trigger).
 *
 * A sound on/off toggle used to open that cluster. It was a switch with no
 * track behind it — `AUDIO_SRC` was never set — so it animated three bars
 * and did nothing else, which is a control that lies about being one.
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
      {/* `data-site-pale-chrome`, not `data-site-pale`, when light: the
          header's `light` variant sits on the pale/greige plate (Home's
          hero, and the gradient band every (site) route inherits from the
          layout above) and needs that scope's token values — `--color-focus`
          for its keyboard focus ring, `--color-edge` for its control
          borders. It used to stamp the plain `data-site-pale` attribute,
          which also matches `html:has([data-site-pale])`'s background-color
          rule — and since this header renders on *every* `(site)` route,
          that repainted the whole page's `html`/`body` background pale
          greige everywhere, not just on /about and /contact, where a page's
          own content wrapper stamps the same attribute on purpose. The
          `-chrome` variant reaches the identical token values (see
          `globals.css`) without that side effect. */}
      <header
        data-site-pale-chrome={light || undefined}
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
            /* `py-2.5` below `sm`. The pills now set their own 44px height,
               so the row's padding no longer has to make it: at `py-5` the
               two together stood the header at 84px and left the hero's
               headline 4px of clearance under it. 44 + 20 puts the row back
               at 64 and the gap at 24. */
            "relative flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-5",
            /* `px-4` below `sm`. At `px-6` the row needed 392px of a 360px
               screen and the Menu pill's right edge landed at x=368 —
               8px off the side of the phone, clipped with no scrollbar to
               reveal it. */
            light ? "px-4 sm:px-8 lg:px-10" : "shell",
          )}
        >
          <Link
            href="/"
            /* `min-w-0` and shrinkable, where this was `shrink-0`. The
                control cluster stays `shrink-0`, so at any width narrower
                than the row wants, the *wordmark* gives and the buttons
                stay on screen. A clipped logo is legible; a clipped button
                is unreachable, and there is no width at which the old
                arrangement chose correctly between them. */
            className={cn(
              /* `min-h-11` for the same reason as the pills beside it: the
                 mask is 23px tall, so the link's box was a pixel under
                 WCAG 2.2's 24px floor and nowhere near a thumb. It costs
                 the row nothing — the controls already stand 44. */
              "inline-flex min-h-11 min-w-0 items-center opacity-100 transition-opacity hover:opacity-70",
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
                /* 116 below `sm`, was 132: the 16px is what buys the row
                    its clearance at 360 without touching the controls.
                    `max-w-full` is what lets the shrink above actually
                    resize the mask rather than overflow its box. */
                "block w-[116px] max-w-full sm:w-[150px]",
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
              centring makes it independent of both. One line, never wrapped.

              `max-w` is the guard that centring costs. An absolutely
              positioned element is out of flow, so nothing stops it growing
              under the controls — which is exactly what the old 78-character
              descriptor did, hiding its own tail behind the control cluster
              from `lg` up. The cluster measures ~30rem at its widest and
              the logo ~10rem; reserving 44rem leaves the descriptor the
              middle and truncates rather than overlapping if the copy ever
              grows again. `site.descriptor` is short enough that the ellipsis
              never appears — this is the belt to its braces. */}
          <p
            className={cn(
              "hidden text-center text-xs leading-tight lg:block",
              light
                ? "absolute left-1/2 max-w-[calc(100vw-44rem)] -translate-x-1/2 truncate text-lab-ink-muted"
                : "max-w-xs text-fg-muted",
            )}
          >
            {site.descriptor}
          </p>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Discreet on purpose: visible from `sm` up, never competing
                with the primary "Get in touch" CTA. It is not in `navLinks`
                either — a returning client's bookmark, not a route the menu
                needs to surface — so below `sm` it drops out entirely rather
                than moving into the overlay. `rounded-control` here, not the
                `rounded-full` literal its sibling still carries: same value
                today, but this one is the token.

                It used to keep the sound toggle's compact geometry — `py-1.5`,
                a 12px mark and `text-[10px]` with no `sm:` step — so that it
                read as visibly secondary beside the contact CTA. It now
                matches its neighbours' height and type instead: at 29px
                against their 44 it did not read as *secondary*, it read as
                *unfinished*, a control someone had forgotten to size. It stays
                the lesser of the three the way the rest of the site marks
                hierarchy — by its ink and its position in the cluster, not by
                being smaller than the things beside it. The mark follows the
                site's line-icon convention (24 viewBox, 1.5 stroke,
                `currentColor`, no fill), so it inherits the label's colour on
                both grounds and introduces no palette of its own. */}
            <Link
              href={portalLink.href}
              className={cn(
                "group hidden min-h-11 items-center gap-2 rounded-control border px-3 transition-colors sm:inline-flex sm:px-4",
                light
                  ? "border-edge text-lab-ink hover:border-lab-ink"
                  : "border-edge text-fg hover:border-accent-ink hover:text-accent-ink",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest transition-colors sm:text-xs",
                  light && "group-hover:font-bold",
                )}
              >
                {portalLink.label}
              </span>
            </Link>

            {/* `/contact`, not a mailto. A `mailto:` does nothing at all for
                a visitor with no desktop mail client configured — which is
                most people on webmail — so the primary CTA silently did
                nothing for them. The contact page carries a working form
                *and* offers the mailto to anyone who prefers it, so nobody
                loses a route. Label matches every other primary CTA
                site-wide — `site.contactLabel`, not its own wording.

                Both branches used to end their hover in `text-accent`/
                `border-accent`. On the light branch that measures 1.00:1
                against this ground — identical luminance — so the link went
                invisible on hover, on every route that mounts this header
                except Home, where the greige never runs this far right. Rest
                state and hover now both resolve through tokens this ground
                actually clears: `border-edge`/`text-lab-ink` at rest,
                `accent-ink` on the dark branch's hover. */}
            <Link
              href="/contact"
              className={cn(
                /* `min-h-11` is 44px, the touch-target floor.
                    `rounded-control`, not `rounded-full`: same 9999px, but
                    the site has exactly two radius tokens and any other
                    `rounded-*` is a regression by the shape rule.

                    Hidden below `sm`, like the portal pill beside it, so a
                    phone's header is the wordmark and the menu and nothing
                    else. `/contact` does not become unreachable: it is the
                    last entry in `navLinks`, so the overlay still carries
                    it — which is exactly the test the portal pill fails and
                    the reason that one stays header-only. */
                "hidden min-h-11 items-center rounded-control border px-3 font-mono text-[10px] uppercase tracking-widest transition-colors sm:inline-flex sm:px-4 sm:text-xs",
                light
                  ? "border-edge text-lab-ink hover:border-lab-ink hover:font-bold"
                  : "border-edge text-fg hover:border-accent-ink hover:text-accent-ink",
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
                "group flex min-h-11 items-center gap-2 rounded-control border px-3 font-mono text-[10px] uppercase tracking-widest transition-colors sm:px-4 sm:text-xs",
                light
                  ? "border-edge text-lab-ink hover:border-lab-ink hover:font-bold"
                  : "border-edge text-fg hover:border-accent-ink hover:text-accent-ink",
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

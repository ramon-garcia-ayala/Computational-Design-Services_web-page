import { designLab } from "@/data/design-lab";

/**
 * Four figures in the gap between the hero and the first panel.
 *
 * A Server Component: the hover glow is plain CSS, so nothing here needs a
 * client boundary.
 *
 * **The type is dark, not `text-fg`.** This bar sits on the page's greige
 * plate rather than on a panel, and `--color-fg` is near-white — it would be
 * the same low-contrast problem as the amber it replaced, only worse.
 * `--color-lab-ink` is the token the hero already uses for type on this
 * background, so at rest the numbers are the darkest thing here and the amber
 * arrives only on hover, which is what makes the glow read as a change of
 * state rather than as the default.
 *
 * Its placement is load-bearing rather than decorative: the hero fades into
 * this same greige and the first panel rises out of it, so the bar occupies
 * ground both transitions already share. Nothing new has to blend.
 *
 * It spent a while inside the document band instead, set left-aligned in a
 * bordered strip, on the reasoning that in this gap it was readable for about
 * one gesture before the panel rose over it. Centred here is the version that
 * was asked for back; the figures are the first hard evidence on the page
 * that there is a company behind the animation, and they read as a set only
 * when they are centred under each other.
 */
export function StatsBar() {
  const { stats } = designLab;

  return (
    <section
      aria-label="Studio at a glance"
      className="relative bg-lab-bg py-[7svh]"
    >
      <div className="font-display mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <ul className="grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-y-0">
          {stats.map((stat) => (
            <li
              key={stat.id}
              className="group flex flex-col items-center text-center"
            >
              <p
                className={
                  "font-semibold leading-none tracking-tight text-lab-ink " +
                  /* Its own clamp rather than a step off the shared scale:
                     the scale's nearest max (h1, 3.9rem) overshoots what
                     these four figures want to be, and `display` is the
                     section-heading size. The coefficient ends the ramp at
                     ~1920px (3.6rem/3vw) for the same reason the shared
                     scale does — at the original 4.6vw it hit full size by
                     1252px, so a 14" laptop got the 32" monitor's figures on
                     a canvas half as wide. See §3.1 of the brand guidelines. */
                  "text-[clamp(2.1rem,3vw,3.6rem)] " +
                  /* The glow is a transition on `text-shadow`, so it needs a
                     transparent shadow at rest to interpolate *from* — going
                     straight from `none` snaps instead of easing. */
                  "[text-shadow:0_0_0_rgb(232_169_74_/_0)] " +
                  "transition-[text-shadow,color] duration-500 ease-out " +
                  "group-hover:[text-shadow:0_0_22px_rgb(232_169_74_/_0.85),0_0_44px_rgb(232_169_74_/_0.45)] " +
                  /* The glow is decoration, not information — nothing is
                     conveyed by it that the figure does not already say — so
                     reduced motion simply drops the transition rather than
                     needing an end state written for it. */
                  "motion-reduce:transition-none"
                }
              >
                {stat.value}
              </p>

              <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.25em] text-lab-ink-muted sm:text-[11px]">
                {stat.label}
              </span>

              {/* Printed under the label, not swapped in for it on hover.
                  The original bar revealed this on `group-hover` in a
                  fixed-height slot; a hover-only reveal on a non-focusable
                  element has no keyboard or touch equivalent, so the content
                  was simply unreachable for anyone not using a mouse. The
                  glow above keeps its hover because it carries no
                  information; this line carries all of it. */}
              {"detail" in stat && stat.detail ? (
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-lab-ink sm:text-[11px]">
                  {stat.detail}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

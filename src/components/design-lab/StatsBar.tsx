import { designLab } from "@/data/design-lab";

/**
 * Four figures in the gap between the hero and the first panel.
 *
 * A Server Component: the hover glow and the country reveal are both plain
 * CSS, so nothing here needs a client boundary.
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
 */
export function StatsBar() {
  const { stats } = designLab;

  return (
    <section
      aria-label="Studio at a glance"
      className="relative bg-lab-bg py-[11svh]"
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
                  "text-h1 font-semibold text-lab-ink " +
                  /* The glow is a transition on `text-shadow`, so it needs a
                     transparent shadow at rest to interpolate *from* — going
                     straight from `none` snaps instead of easing. */
                  "[text-shadow:0_0_0_rgb(232_169_74_/_0)] " +
                  "transition-[text-shadow,color] duration-500 ease-out " +
                  "group-hover:[text-shadow:0_0_22px_rgb(232_169_74_/_0.85),0_0_44px_rgb(232_169_74_/_0.45)]"
                }
              >
                {stat.value}
              </p>

              {/* Fixed-height slot so swapping the label for the country list
                  cannot nudge the row. */}
              <span className="relative mt-4 block h-4 w-full">
                <span className="absolute inset-0 block font-mono text-[10px] uppercase tracking-[0.25em] text-lab-ink-muted transition-opacity duration-300 group-hover:opacity-0 sm:text-[11px]">
                  {stat.label}
                </span>

                {"detail" in stat && stat.detail ? (
                  <span className="absolute inset-0 block whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-lab-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-[11px]">
                    {stat.detail}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

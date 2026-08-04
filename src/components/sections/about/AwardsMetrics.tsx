import { Reveal } from "@/components/ui/Reveal";
import { awards, studioMetrics } from "@/data/awards";

/** Bloque de reconocimientos y métricas de estudio de /about. */
export function AwardsMetrics() {
  return (
    <section
      aria-labelledby="awards-heading"
      className="border-t border-line py-20 sm:py-28"
    >
      <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2
            id="awards-heading"
            className="font-mono text-[10px] uppercase tracking-widest text-accent"
          >
            Recognition
          </h2>

          <Reveal stagger="[data-reveal]" className="mt-8">
            <ul>
              {awards.map((award) => (
                <li
                  key={award.id}
                  className="reveal-init flex items-baseline justify-between gap-6 border-b border-line py-5"
                  data-reveal
                >
                  <span>
                    <span className="block text-sm text-fg">{award.title}</span>
                    <span className="mt-1 block text-xs text-fg-muted">
                      {award.issuer}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-fg-muted">
                    {award.year}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Studio metrics
          </h2>

          <Reveal
            stagger="[data-reveal]"
            className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2"
          >
            {studioMetrics.map((metric) => (
              <div
                key={metric.id}
                className="reveal-init border-t border-line pt-5"
                data-reveal
              >
                <p className="font-mono text-2xl font-medium tracking-tight text-fg">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-fg-muted">{metric.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

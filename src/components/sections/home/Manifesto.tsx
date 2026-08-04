import { Reveal } from "@/components/ui/Reveal";
import { manifesto } from "@/data/approach";

/** Short manifesto between the hero and the metrics. */
export function Manifesto() {
  return (
    <section className="border-t border-line py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {manifesto.kicker}
          </p>

          <div className="max-w-3xl">
            <p className="font-display text-2xl leading-snug font-semibold tracking-tight text-fg sm:text-3xl lg:text-4xl">
              {manifesto.lead}
            </p>
            <p className="mt-8 text-base leading-relaxed text-fg-muted sm:text-lg">
              {manifesto.body}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

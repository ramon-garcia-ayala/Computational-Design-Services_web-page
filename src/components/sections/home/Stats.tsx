import { Reveal } from "@/components/ui/Reveal";
import { StatItem } from "@/components/ui/StatItem";
import { stats } from "@/data/stats";

/**
 * Bloque de métricas del home. El número de columnas se deriva del array, así
 * que añadir o quitar métricas en data/stats.ts no obliga a tocar nada aquí.
 */
export function Stats() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="border-t border-line py-20 sm:py-24"
    >
      <div className="shell">
        <h2
          id="stats-heading"
          className="font-mono text-[10px] uppercase tracking-widest text-accent"
        >
          By the numbers
        </h2>

        <Reveal
          stagger="[data-reveal]"
          className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5"
        >
          {stats.map((stat) => (
            <StatItem key={stat.id} stat={stat} />
          ))}
        </Reveal>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Placeholder figures · replace in src/data/stats.ts
        </p>
      </div>
    </section>
  );
}

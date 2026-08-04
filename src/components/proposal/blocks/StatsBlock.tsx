import { Reveal } from "@/components/ui/Reveal";
import type { StatsBlockData } from "@/data/proposals";
import { BlockShell } from "./BlockShell";

/**
 * Cifras del alcance de la investigación. A diferencia de `StatItem`, aquí los
 * valores no son números que se puedan contar hacia arriba ("315 → 16"), así
 * que se renderizan estáticos con la misma tipografía.
 */
export function StatsBlock({ block }: { block: StatsBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal
        stagger="[data-reveal]"
        as="ul"
        className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {block.stats.map((stat) => (
          <li
            key={stat.label}
            className="reveal-init border-t border-line pt-5"
            data-reveal
          >
            <p className="font-mono text-2xl font-medium tracking-tight text-fg tabular-nums sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-3 text-sm text-fg">{stat.label}</p>
            {stat.note ? (
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {stat.note}
              </p>
            ) : null}
          </li>
        ))}
      </Reveal>
    </BlockShell>
  );
}

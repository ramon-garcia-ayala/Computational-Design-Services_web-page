import { Reveal } from "@/components/ui/Reveal";
import type { CardsBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";
import { cardGrid } from "./cardGrid";

export function CardsBlock({ block }: { block: CardsBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      {/* Was `border-line bg-line` (1.38:1) — the grid's dividers were
          background showing through a 1px gap, and at this ratio the gap
          reads as no gap at all. */}
      <Reveal
        stagger="[data-reveal]"
        className={cn(
          "mt-14 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge",
          cardGrid(block.cards.length, block.columns ?? 2),
        )}
      >
        {block.cards.map((card) => (
          <article
            key={card.title}
            className="reveal-init flex flex-col gap-4 bg-carbon p-8 lg:p-10"
            data-reveal
          >
            <Icon name={card.icon} className="h-7 w-7 text-accent-ink" />
            <h3 className="font-display text-lg font-semibold tracking-tight text-fg">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed text-fg-muted">{card.body}</p>
          </article>
        ))}
      </Reveal>
    </BlockShell>
  );
}

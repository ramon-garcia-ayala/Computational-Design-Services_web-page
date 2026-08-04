import { Reveal } from "@/components/ui/Reveal";
import type { CardsBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";

export function CardsBlock({ block }: { block: CardsBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal
        stagger="[data-reveal]"
        className={cn(
          "mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2",
          block.columns === 3 && "lg:grid-cols-3",
        )}
      >
        {block.cards.map((card) => (
          <article
            key={card.title}
            className="reveal-init flex flex-col gap-4 bg-carbon p-8 lg:p-10"
            data-reveal
          >
            <Icon name={card.icon} className="h-7 w-7 text-accent" />
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

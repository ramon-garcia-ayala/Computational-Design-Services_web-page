import { Reveal } from "@/components/ui/Reveal";
import type { PricingBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";
import { cardGrid } from "./cardGrid";

/**
 * Commercial terms. Options render as comparison cards; a fixed scope renders
 * as one figure with its milestone breakdown. The price is the thing being read
 * here, so it gets the same weight the site gives to a headline figure.
 */
export function PricingBlock({ block }: { block: PricingBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
      grid
    >
      {block.options ? (
        /* Was `bg-line` for both the outer frame and the gaps between cards
           — 1.38:1 against the `bg-carbon` cards it separates, so the grid
           read as one unbroken block rather than distinct options. `edge` is
           the token built to stay visible at this weight. */
        <Reveal
          stagger="[data-reveal]"
          className={cn(
            "mt-14 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge",
            cardGrid(block.options.length, 3),
          )}
        >
          {block.options.map((option) => (
            <article
              key={option.title}
              className={cn(
                "reveal-init flex flex-col bg-carbon p-8 lg:p-10",
                /* `bg-graphite` alone was the entire "highlighted" treatment
                   — 1.09:1 against the sibling cards' `bg-carbon`, close
                   enough to read as the same fill. A top accent bar is a
                   difference every card in the row actually shows. */
                option.highlight && "border-t-2 border-accent-ink bg-graphite",
              )}
              data-reveal
            >
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  option.highlight ? "text-accent-ink" : "text-fg-muted",
                )}
              >
                {option.tag}
              </p>

              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-fg">
                {option.title}
              </h3>

              {option.subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {option.subtitle}
                </p>
              ) : null}

              <p
                className={cn(
                  "mt-8 font-mono text-2xl font-medium tracking-tight tabular-nums sm:text-3xl",
                  option.highlight ? "text-accent-ink" : "text-fg",
                )}
              >
                {option.price}
              </p>

              {option.priceNote ? (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  {option.priceNote}
                </p>
              ) : null}

              <ul className="mt-8 flex flex-col gap-3 border-t border-edge pt-6">
                {option.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Icon
                      name="check"
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        option.highlight ? "text-accent-ink" : "text-fg-muted",
                      )}
                    />
                    <span className="text-sm leading-relaxed text-fg-muted">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      ) : null}

      {block.total ? (
        <Reveal className="mt-14 max-w-2xl">
          <div className="rounded-surface border border-edge bg-graphite p-8 lg:p-10">
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Total
            </p>
            <p className="mt-3 font-mono text-3xl font-medium tracking-tight text-accent-ink tabular-nums sm:text-4xl">
              {block.total.currency} {block.total.amount}
            </p>

            {block.total.note ? (
              <p className="mt-5 text-sm leading-relaxed text-fg-muted">
                {block.total.note}
              </p>
            ) : null}

            {/* Was `border-t border-line` / `border-b border-line-soft`
                (1.38:1 / 1.17:1) — the breakdown's own line items, invisible
                against each other. */}
            {block.total.breakdown ? (
              <ul className="mt-8 border-t border-edge">
                {block.total.breakdown.map((line) => (
                  <li
                    key={line.label}
                    className="flex flex-col gap-1 border-b border-edge py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="text-sm leading-relaxed text-fg-muted">
                      {line.label}
                    </span>
                    <span className="font-mono text-sm whitespace-nowrap text-fg tabular-nums">
                      {line.amount}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      {block.note ? (
        <Reveal className="mt-10">
          <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">
            {block.note}
          </p>
        </Reveal>
      ) : null}
    </BlockShell>
  );
}

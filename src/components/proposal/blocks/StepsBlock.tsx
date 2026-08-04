import { Reveal } from "@/components/ui/Reveal";
import type { StepsBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { BlockShell } from "./BlockShell";

export function StepsBlock({ block }: { block: StepsBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      {block.layout === "flow" ? (
        <FlowSteps block={block} />
      ) : (
        <ListSteps block={block} />
      )}
    </BlockShell>
  );
}

/**
 * A pipeline read left to right: each step is a numbered marker with the rail
 * running out of it towards the next one, and its text sitting underneath.
 * Below `lg` the same markup stacks into a column, where the rail would be
 * meaningless, so it is dropped.
 */
function FlowSteps({ block }: { block: StepsBlockData }) {
  return (
    <Reveal
      stagger="[data-reveal]"
      as="ul"
      className="mt-12 flex flex-col gap-8 lg:flex-row lg:gap-0"
    >
      {block.steps.map((step, index) => (
        <li
          key={step.number}
          className="reveal-init flex-1 lg:pr-6 lg:last:pr-0"
          data-reveal
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-carbon font-mono text-xs text-accent">
              {step.number}
            </span>
            {index < block.steps.length - 1 ? (
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            ) : null}
          </div>

          {step.title ? (
            <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-fg">
              {step.title}
            </h3>
          ) : null}

          <p
            className={cn(
              "max-w-sm text-sm leading-relaxed text-fg-muted",
              step.title ? "mt-2" : "mt-5",
            )}
          >
            {step.body}
          </p>
        </li>
      ))}
    </Reveal>
  );
}

/** A numbered column, chained by a vertical rail. */
function ListSteps({ block }: { block: StepsBlockData }) {
  return (
    <div className="relative mt-12 max-w-3xl">
      <div
        className="absolute top-5 bottom-5 left-5 w-px bg-line"
        aria-hidden="true"
      />

      <Reveal stagger="[data-reveal]" as="ul" className="relative">
        {block.steps.map((step) => (
          <li
            key={step.number}
            className="reveal-init grid grid-cols-[2.5rem_1fr] gap-5 pb-8 last:pb-0"
            data-reveal
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-carbon font-mono text-xs text-accent">
              {step.number}
            </span>

            <div className="pt-2">
              {step.title ? (
                <h3 className="font-display text-base font-semibold tracking-tight text-fg">
                  {step.title}
                </h3>
              ) : null}
              <p
                className={cn(
                  "max-w-xl text-sm leading-relaxed text-fg-muted",
                  step.title && "mt-2",
                )}
              >
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </Reveal>
    </div>
  );
}

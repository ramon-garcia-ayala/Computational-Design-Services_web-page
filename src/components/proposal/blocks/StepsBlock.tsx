import { Reveal } from "@/components/ui/Reveal";
import type { StepsBlockData } from "@/data/proposals";
import { BlockShell } from "./BlockShell";

/** Los pasos del proceso en lenguaje llano, encadenados por un riel vertical. */
export function StepsBlock({ block }: { block: StepsBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <div className="relative mt-14 max-w-3xl">
        <div
          className="absolute top-6 bottom-6 left-6 w-px bg-line"
          aria-hidden="true"
        />

        <Reveal stagger="[data-reveal]" as="ul" className="relative">
          {block.steps.map((step) => (
            <li
              key={step.number}
              className="reveal-init grid grid-cols-[3rem_1fr] gap-6 pb-12 last:pb-0"
              data-reveal
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent bg-carbon font-mono text-xs text-accent">
                {step.number}
              </span>

              <div className="pt-3">
                <h3 className="font-display text-xl font-semibold tracking-tight text-fg">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </BlockShell>
  );
}

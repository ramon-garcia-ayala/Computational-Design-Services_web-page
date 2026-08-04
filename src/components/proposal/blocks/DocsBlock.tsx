import { Reveal } from "@/components/ui/Reveal";
import type { DocsBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";
import { cardGrid } from "./cardGrid";

/** Files attached to the proposal. Opens in a new tab; the browser decides
    whether to preview or download. */
export function DocsBlock({ block }: { block: DocsBlockData }) {
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
        className={cn(
          "mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line",
          cardGrid(block.docs.length),
        )}
      >
        {block.docs.map((doc) => (
          <li key={doc.file} className="reveal-init bg-carbon" data-reveal>
            <a
              href={doc.file}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex h-full items-start gap-4 p-8 transition-colors hover:bg-graphite lg:p-10"
            >
              <Icon name="file" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="flex flex-col gap-2">
                <span className="font-display text-base font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
                  {doc.label}
                </span>
                {doc.note ? (
                  <span className="text-sm leading-relaxed text-fg-muted">
                    {doc.note}
                  </span>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </Reveal>
    </BlockShell>
  );
}

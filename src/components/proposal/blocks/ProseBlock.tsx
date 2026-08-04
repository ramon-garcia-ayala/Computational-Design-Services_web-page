import { Reveal } from "@/components/ui/Reveal";
import { CTALink } from "@/components/ui/CTALink";
import type { ProseBlockData } from "@/data/proposals";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";

export function ProseBlock({ block }: { block: ProseBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      {block.body ? (
        <Reveal stagger="[data-reveal]" className="mt-12 max-w-2xl">
          {block.body.map((paragraph) => (
            <p
              key={paragraph}
              className="reveal-init mt-6 text-base leading-relaxed text-fg-muted first:mt-0"
              data-reveal
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      ) : null}

      {block.checklist ? (
        <Reveal
          stagger="[data-reveal]"
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2"
        >
          {block.checklist.map((item) => (
            <li
              key={item.label}
              className="reveal-init flex items-start gap-4 bg-carbon p-6 lg:p-8"
              data-reveal
            >
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              />
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm leading-relaxed text-fg-muted transition-colors hover:text-accent"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-sm leading-relaxed text-fg-muted">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </Reveal>
      ) : null}

      {block.cta ? (
        <Reveal className="mt-12">
          <CTALink
            href={block.cta.href}
            variant="solid"
            size="lg"
            external={block.cta.external}
          >
            {block.cta.label}
          </CTALink>
        </Reveal>
      ) : null}
    </BlockShell>
  );
}

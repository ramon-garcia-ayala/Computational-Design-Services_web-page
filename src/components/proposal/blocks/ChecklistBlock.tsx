import { Reveal } from "@/components/ui/Reveal";
import type { ChecklistBlockData } from "@/data/proposals";
import { BlockShell } from "./BlockShell";

/**
 * A handover checklist: what the client still has to send us, grouped by topic.
 *
 * Deliberately a list and not a card grid. Cards give every item the same
 * weight and hide how many there are; here the point is that this is work to be
 * ticked off, so each item carries an empty box and each group carries its
 * count. The category sits in its own rail from `lg` up, which keeps the items
 * reading as one continuous column instead of restarting at every heading.
 */
export function ChecklistBlock({ block }: { block: ChecklistBlockData }) {
  const total = block.groups.reduce(
    (count, group) => count + group.items.length,
    0,
  );

  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal className="mt-10">
        <span className="inline-flex rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {total} items to receive
        </span>
      </Reveal>

      <ol className="mt-10">
        {block.groups.map((group, groupIndex) => (
          <Reveal key={group.id} as="li" stagger="[data-reveal]">
            <div className="grid gap-6 border-t border-line py-10 lg:grid-cols-[13rem_1fr] lg:gap-12">
              <div className="reveal-init flex items-baseline gap-3 lg:flex-col lg:gap-1" data-reveal>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {String(groupIndex + 1).padStart(2, "0")} · {group.category}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  {group.items.length} items
                </p>
              </div>

              <ul className="flex flex-col gap-6">
                {group.items.map((item) => (
                  <li
                    key={item.title}
                    className="reveal-init grid grid-cols-[1.125rem_1fr] gap-4"
                    data-reveal
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 h-[1.125rem] w-[1.125rem] rounded-[3px] border border-line-soft"
                    />
                    <div>
                      <h3 className="font-display text-base leading-snug font-semibold tracking-tight text-fg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>

      {block.note ? (
        <Reveal>
          <p className="max-w-2xl border-t border-line pt-7 text-sm leading-relaxed text-fg-muted">
            {block.note}
          </p>
        </Reveal>
      ) : null}
    </BlockShell>
  );
}

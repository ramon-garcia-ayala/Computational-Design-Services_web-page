import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { cardGrid } from "@/components/proposal/blocks/cardGrid";
import { Icon } from "@/components/proposal/icons";
import { PortalSection } from "./PortalSection";
import type { PortalTodoGroup } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/**
 * Read-only status, not an editable checklist — marking an item done is out
 * of scope for this version (it needs a database; see the plan's own note on
 * what was deliberately left out). The box communicates state, it is not a
 * control: no `<input>`, no click handler.
 */
export function TodoSection({ groups }: { groups: PortalTodoGroup[] }) {
  const copy = portalCopy.sections.todos;
  const totalOpen = groups.reduce(
    (count, group) => count + group.items.filter((item) => !item.done).length,
    0,
  );

  return (
    <PortalSection
      id="todos"
      kicker={copy.kicker}
      title={copy.title}
      empty={groups.length === 0 ? copy.empty : undefined}
    >
      <Reveal className="mt-8">
        <span className="inline-flex rounded-control border border-edge px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {totalOpen} outstanding
        </span>
      </Reveal>

      <div className={cn("mt-8 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge", cardGrid(groups.length))}>
        {groups.map((group) => (
          <Reveal key={group.id} className="reveal-init bg-carbon p-6 lg:p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
              {copy.counts[group.owner]}
            </p>
            <ul className="mt-5 flex flex-col gap-4">
              {group.items.map((item) => (
                <li key={item.id} className="grid grid-cols-[1.125rem_1fr] gap-3">
                  {item.done ? (
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-surface border border-accent-ink bg-accent-ink/10"
                    >
                      <Icon name="check" className="h-3 w-3 text-accent-ink" />
                    </span>
                  ) : (
                    <span aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded-surface border border-edge" />
                  )}
                  <div>
                    <p className={cn("text-sm font-semibold", item.done ? "text-fg-muted line-through" : "text-fg")}>
                      {item.done ? <span className="sr-only">Done: </span> : null}
                      {item.title}
                    </p>
                    {item.body ? <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.body}</p> : null}
                    {item.dueLabel && !item.done ? (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">{item.dueLabel}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </PortalSection>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/proposal/icons";
import { PortalSection } from "./PortalSection";
import type { PortalScopeGroup } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/** What the service includes, grouped by category — same rail layout as the
 *  proposal's `ChecklistBlock`, but a check mark rather than an empty box:
 *  these are commitments already made, not items waiting to be ticked off. */
export function ScopeSection({ groups }: { groups: PortalScopeGroup[] }) {
  const copy = portalCopy.sections.scope;

  return (
    <PortalSection
      id="scope"
      kicker={copy.kicker}
      title={copy.title}
      empty={groups.length === 0 ? copy.empty : undefined}
    >
      <ol className="mt-8">
        {groups.map((group, groupIndex) => (
          <Reveal key={group.id} as="li" stagger="[data-reveal]">
            <div className="grid gap-6 border-t border-edge py-8 lg:grid-cols-[13rem_1fr] lg:gap-10">
              <div className="reveal-init flex items-baseline gap-3 lg:flex-col lg:gap-1" data-reveal>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
                  {String(groupIndex + 1).padStart(2, "0")} · {group.category}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  {group.items.length} items
                </p>
              </div>

              <ul className="flex flex-col gap-5">
                {group.items.map((item) => (
                  <li key={item.title} className="reveal-init grid grid-cols-[1.125rem_1fr] gap-4" data-reveal>
                    <Icon name="check" className="mt-1 h-[1.125rem] w-[1.125rem] shrink-0 text-accent-ink" />
                    <div>
                      <h3 className="font-display text-base leading-snug font-semibold tracking-tight text-fg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>
    </PortalSection>
  );
}

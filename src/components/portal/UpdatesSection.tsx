import { Reveal } from "@/components/ui/Reveal";
import { PortalSection } from "./PortalSection";
import type { PortalUpdate } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/** A dated log, most recent first — the order the data is expected to arrive
 *  in, so this renders it as given rather than re-sorting. */
export function UpdatesSection({ updates }: { updates: PortalUpdate[] }) {
  const copy = portalCopy.sections.updates;

  return (
    <PortalSection id="updates" kicker={copy.kicker} title={copy.title} empty={updates.length === 0 ? copy.empty : undefined}>
      <Reveal as="ul" stagger="[data-reveal]" className="mt-8 flex flex-col">
        {updates.map((update) => (
          <li key={update.id} className="reveal-init grid gap-2 border-t border-edge py-6 sm:grid-cols-[9rem_1fr] sm:gap-6" data-reveal>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{update.date}</p>
            <div>
              <p className="text-sm font-semibold text-fg">{update.title}</p>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">{update.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </PortalSection>
  );
}

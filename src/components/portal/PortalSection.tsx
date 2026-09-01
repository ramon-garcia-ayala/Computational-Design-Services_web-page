import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * The panel's section shell — `BlockShell`'s dense sibling.
 *
 * A proposal is read once; this panel is checked back into repeatedly, often
 * for one line of status. `BlockShell`'s `py-20 sm:py-28 lg:py-32` rhythm was
 * tuned for a document meant to be read start to finish, and at seven
 * sections it turns "did the discovery findings ship yet" into a multi-page
 * scroll. This shell trims that to `py-14 sm:py-16 lg:py-20` and tightens
 * card padding to `p-6 lg:p-8` — a deliberate departure from the proposal
 * rhythm, not a shortcut someone forgot to fix later.
 */
export function PortalSection({
  id,
  kicker,
  title,
  lead,
  empty,
  className,
  children,
}: {
  id: string;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Rendered instead of `children` when the section has nothing yet. */
  empty?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn("relative border-t border-line py-14 sm:py-16 lg:py-20", className)}
    >
      <div className="shell relative">
        {title ? (
          <Reveal>
            <SectionHeading kicker={kicker} title={title} lead={lead} className="max-w-3xl" />
          </Reveal>
        ) : null}

        {empty ? (
          <Reveal className="mt-10">
            <p className="rounded-surface border border-dashed border-edge bg-graphite/30 p-6 text-sm leading-relaxed text-fg-muted lg:p-8">
              {empty}
            </p>
          </Reveal>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

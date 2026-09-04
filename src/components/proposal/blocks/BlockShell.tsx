import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/** Shared shell for every section of the document: rhythm and heading. */
export function BlockShell({
  id,
  kicker,
  title,
  lead,
  grid,
  className,
  children,
}: {
  id: string;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Adds the background grid. Reserved for the heaviest sections. */
  grid?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn(
        /* `scroll-mt` because every one of these is an anchor target — the
           whole `ProposalIndex` rail points at them — and an anchor lands a
           section's top edge at the top of the viewport, behind the fixed
           header. Measured on `/29.06.2026_ecogen`, the three sections a rail
           link jumps to came to rest 31px, 92px and 64px *above* the viewport
           top, so the jump appeared to land mid-section. Lenis reads the
           computed `scroll-margin-top` in its own `scrollTo`, so this covers
           the smooth path, the native path under reduced motion, and a URL
           that arrives with the hash already on it. */
        "relative border-t border-line py-20 scroll-mt-24 sm:py-28 lg:py-32",
        className,
      )}
    >
      {grid ? (
        <div
          className="grid-bg absolute inset-0 opacity-30"
          aria-hidden="true"
        />
      ) : null}

      <div className="shell relative">
        {title ? (
          <Reveal>
            <SectionHeading
              kicker={kicker}
              title={title}
              lead={lead}
              className="max-w-3xl"
            />
          </Reveal>
        ) : null}

        {children}
      </div>
    </section>
  );
}

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
        "relative border-t border-line py-20 sm:py-28 lg:py-32",
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

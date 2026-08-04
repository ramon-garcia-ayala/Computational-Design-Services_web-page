import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/** Carcasa común de todas las secciones del documento: ritmo y cabecera. */
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
  /** Añade la retícula de fondo. Reservado a las secciones de más peso. */
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

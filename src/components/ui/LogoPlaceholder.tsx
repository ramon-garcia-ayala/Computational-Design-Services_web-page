import type { Client } from "@/data/clients";
import { cn } from "@/lib/utils";

/**
 * Placeholder gris para los logos de cliente.
 *
 * En cuanto exista el SVG real basta con rellenar `logo` en data/clients.ts:
 * este componente pasa a pintar la imagen y el bloque gris desaparece.
 */
export function LogoPlaceholder({
  client,
  className,
}: {
  client: Client;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-16 w-full items-center justify-center rounded border border-line bg-graphite px-4 grayscale transition-all duration-300 hover:border-line hover:grayscale-0",
        className,
      )}
      title={client.name}
    >
      {client.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos externos sin dimensiones conocidas
        <img
          src={client.logo}
          alt={client.name}
          className="max-h-8 w-auto opacity-70"
        />
      ) : (
        <span className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
          {client.name}
        </span>
      )}
    </div>
  );
}

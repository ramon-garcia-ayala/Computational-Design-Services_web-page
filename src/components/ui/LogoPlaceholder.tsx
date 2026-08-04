import type { Client } from "@/data/clients";
import { cn } from "@/lib/utils";

/**
 * Grey placeholder for the client logos.
 *
 * As soon as the real SVG exists, just fill in `logo` in data/clients.ts: this
 * component then paints the image and the grey block disappears.
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
        // eslint-disable-next-line @next/next/no-img-element -- external logos with unknown dimensions
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

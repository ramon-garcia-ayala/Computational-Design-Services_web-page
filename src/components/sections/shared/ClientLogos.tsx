import { Reveal } from "@/components/ui/Reveal";
import { LogoPlaceholder } from "@/components/ui/LogoPlaceholder";
import { clients } from "@/data/clients";

/** Band of client logos. Used the same way on the home page and on /about. */
export function ClientLogos({ title = "Trusted by teams building the built world" }) {
  return (
    <section
      aria-label="Clients"
      className="border-t border-line py-16 sm:py-20"
    >
      <div className="shell">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {title}
        </p>

        <Reveal
          stagger="[data-reveal]"
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {clients.map((client) => (
            <div key={client.id} className="reveal-init" data-reveal>
              <LogoPlaceholder client={client} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

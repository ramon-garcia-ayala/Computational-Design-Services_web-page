import { HeroCanvas } from "@/components/three/HeroCanvas";
import { ChatPlaceholder } from "@/components/ui/ChatPlaceholder";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { CTALink } from "@/components/ui/CTALink";
import { mailtoHref, site } from "@/data/site";

/**
 * Hero del home.
 *
 * Es un Server Component a propósito: tagline, subcopy y el hueco del chat se
 * envían ya renderizados en el HTML, así que el LCP no depende de JavaScript.
 * Lo único cliente es `HeroCanvas`, que se monta después del primer paint.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 sm:pt-32">
      {/* Fondo: retícula CSS siempre presente + escena R3F opcional encima */}
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(200,249,78,0.07),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative grid w-full items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Computational automation · AEC
          </p>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
            We automate AEC.
            <br />
            <span className="text-fg-muted">You ship faster.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {site.subcopy}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <CTALink href={mailtoHref} variant="solid" size="lg" external>
              Let&apos;s talk
            </CTALink>
            <CTALink href="/projects" size="lg">
              See our work
            </CTALink>
          </div>

          <ScrollCue className="mt-14 hidden sm:flex" />
        </div>

        {/* Columna derecha: hueco del chat con la escena decorativa detrás */}
        <div className="relative">
          <HeroCanvas className="-inset-12 lg:-inset-20" />
          <ChatPlaceholder className="relative z-10" />
        </div>
      </div>
    </section>
  );
}

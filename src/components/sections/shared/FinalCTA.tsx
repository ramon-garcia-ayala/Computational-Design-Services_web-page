import { Reveal } from "@/components/ui/Reveal";
import { CTALink } from "@/components/ui/CTALink";
import { mailtoHref, site } from "@/data/site";

/**
 * CTA de cierre, justo antes del footer. Se reutiliza en varias páginas, por eso
 * el título es configurable.
 */
export function FinalCTA({
  title = "Tell us where your team loses its hours.",
  body = "Send a short note about the workflow that keeps eating your week. We reply with a concrete first step, not a brochure.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="border-t border-line">
      <div className="shell relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />

        <Reveal className="relative max-w-3xl">
          <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {body}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CTALink href={mailtoHref} variant="solid" size="lg" external>
              {site.contactLabel}
            </CTALink>
            <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              {site.location}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

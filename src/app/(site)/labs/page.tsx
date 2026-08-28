import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTALink } from "@/components/ui/CTALink";
import { site } from "@/data/site";
import { labsCopy } from "@/data/labs";

export const metadata: Metadata = {
  title: "Labs",
  description: "Experiments, prototypes and open tools from R²XTECH. Coming soon.",
};

/**
 * Studio playground. Placeholder until there is real content — not the Home
 * page's chat assistant, which is a separate thing entirely (see
 * `src/data/labs.ts`).
 */
export default function LabsPage() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-24">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,color-mix(in_srgb,var(--color-accent)_6%,transparent),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <span className="inline-flex rounded-control border border-edge px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            {labsCopy.badge}
          </span>

          <SectionHeading
            as="h1"
            className="mt-5"
            kicker={labsCopy.kicker}
            title={labsCopy.title}
            lead={labsCopy.lead}
          />

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <CTALink href="/projects" size="lg">
              See client work instead
            </CTALink>
            <CTALink href="/contact" variant="ghost" size="lg">
              {site.contactLabel}
            </CTALink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTALink } from "@/components/ui/CTALink";
import { mailtoHref } from "@/data/site";

export const metadata: Metadata = {
  title: "Labs",
  description: "Experiments, prototypes and open tools from R2ch-Tech. Coming soon.",
};

/** Playground del estudio. Placeholder hasta que haya contenido real. */
export default function LabsPage() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-24">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(200,249,78,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            as="h1"
            kicker="Labs · coming soon"
            title="A playground for the things we build between projects"
            lead="Prototypes, geometry experiments and small open tools. We are still deciding which ones survive contact with the public."
          />

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <CTALink href="/projects" size="lg">
              See client work instead
            </CTALink>
            <CTALink href={mailtoHref} variant="ghost" size="lg" external>
              Tell us what to build
            </CTALink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

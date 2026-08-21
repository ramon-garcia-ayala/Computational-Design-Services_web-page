import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTALink } from "@/components/ui/CTALink";
import { ServiceMotif } from "@/components/design-lab/ServiceMotif";
import { designLab } from "@/data/design-lab";
import { mailtoHref, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: `What ${site.nameFlat} builds for AEC teams: computational design, design automation, AI-driven tools and custom software.`,
};

/**
 * The Services page, reached from the "Explore more" button on Home and from
 * the menu and footer.
 *
 * **The copy is the Home panel's copy, read from the same place.** Four names
 * and four blurbs already exist in `data/design-lab.ts`; writing a second
 * version here would give the site two answers to the same question and let
 * them drift apart. Each entry keeps its own `ServiceMotif` too, so a service
 * is recognisably the same thing in both places.
 *
 * It lives in the `(site)` group, so it wears the same dark header and footer
 * as `/about`, `/projects` and `/labs` rather than Home's own chrome.
 */
export default function ServicesPage() {
  const { services } = designLab.panels;

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(232,169,74,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            as="h1"
            kicker={services.kicker}
            title={services.title}
            lead="Four ways we plug into a studio's work. Most engagements start with one and grow into the others once the pipeline is in place."
          />
        </Reveal>

        <Reveal stagger="[data-service]" className="mt-16">
          <ul className="grid gap-px bg-line sm:grid-cols-2">
            {services.items.map((item) => (
              <li
                key={item.name}
                data-service
                className="reveal-init flex flex-col bg-carbon p-8 sm:p-10"
              >
                <div className="flex justify-center text-accent/70">
                  <ServiceMotif kind={item.motif} />
                </div>
                <h2 className="mt-8 font-display text-xl font-semibold leading-snug text-fg sm:text-2xl">
                  {item.name}
                </h2>
                <p className="mt-4 text-justify text-sm leading-relaxed text-fg-muted sm:text-base">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-16">
          <div className="flex flex-wrap items-center gap-4">
            <CTALink href={mailtoHref} variant="solid" size="lg" external>
              {site.contactLabel}
            </CTALink>
            <CTALink href="/projects" size="lg">
              See the work
            </CTALink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

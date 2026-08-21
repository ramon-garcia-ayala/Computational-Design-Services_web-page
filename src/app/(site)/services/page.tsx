import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceMotif } from "@/components/design-lab/ServiceMotif";
import { CapabilityIcon } from "@/components/sections/services/CapabilityIcon";
import { Approach } from "@/components/sections/services/Approach";
import { Expertise } from "@/components/sections/services/Expertise";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";
import { capabilities } from "@/data/capabilities";
import { designLab } from "@/data/design-lab";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: `What ${site.nameFlat} builds for AEC teams: computational design, design automation, AI-driven tools, custom software, and the capabilities around them.`,
};

/**
 * The Services page, reached from the "Explore more" button on Home and from
 * the menu and footer.
 *
 * **The four core offers are the Home panel's, read from the same place.**
 * Their names and blurbs already exist in `data/design-lab.ts`; a second copy
 * here would give the site two answers to the same question and let them
 * drift. Each keeps its own `ServiceMotif`, so a service is recognisably the
 * same thing in both places.
 *
 * `Approach` and `Expertise` moved here from `/about`. They describe how the
 * work is done and what it covers, which is what someone on this page is
 * asking — on the About page they sat between the studio's story and its
 * clients, answering a question nobody had reached yet.
 *
 * Every colour is a site token. The reference grids this was drawn from
 * carry another product's palette, and matching them would have made this
 * the one page that looks like somewhere else.
 */
export default function ServicesPage() {
  const { services } = designLab.panels;

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
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
              lead="Four ways we plug into a studio's work, and the capabilities around them. Most engagements start with one and grow into the others once the pipeline is in place."
            />
          </Reveal>
        </div>
      </section>

      {/* The four core offers, same copy as Home's panel. */}
      <section className="relative pb-20 sm:pb-28">
        <div className="shell">
          <Reveal stagger="[data-service]">
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
        </div>
      </section>

      {/* Secondary row. Lighter treatment than the four above on purpose:
          these are capabilities rather than offers, and giving them the same
          weight would flatten the distinction the page is built on. */}
      <section className="relative border-t border-line py-20 sm:py-28">
        <div className="shell">
          <Reveal>
            <SectionHeading
              kicker="Also"
              title="Additional capabilities"
              lead="The work that surrounds a pipeline once it is running."
            />
          </Reveal>

          <Reveal stagger="[data-capability]" className="mt-14">
            <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <li
                  key={capability.id}
                  data-capability
                  className="reveal-init border-t border-line pt-6"
                >
                  <span className="block text-accent">
                    <CapabilityIcon kind={capability.icon} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-fg">
                    {capability.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    {capability.body}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Both moved from /about. */}
      <Approach />
      <Expertise />

      <FinalCTA
        title="Have a workflow that should not be manual?"
        body="Describe it in three lines. We will tell you whether it is worth automating and what the first step looks like."
      />
    </>
  );
}

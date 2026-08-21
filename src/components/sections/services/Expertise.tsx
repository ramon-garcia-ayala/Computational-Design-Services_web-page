import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { expertiseAreas } from "@/data/expertise";

/** Expertise areas: accordion on mobile, tabs on desktop. */
export function Expertise() {
  return (
    <section
      aria-labelledby="expertise-heading"
      className="border-t border-line py-20 sm:py-28 lg:py-32"
    >
      <div className="shell">
        <Reveal>
          <SectionHeading kicker="Expertise" title="Where we go deep" />
        </Reveal>

        <Reveal className="mt-14">
          <Accordion items={expertiseAreas} />
        </Reveal>
      </div>
    </section>
  );
}

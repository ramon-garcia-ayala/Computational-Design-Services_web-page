import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectsGrid } from "@/components/sections/projects/ProjectsGrid";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Automation systems and computational workflows R2ch-Tech built for AEC firms.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="shell relative">
          <Reveal>
            <SectionHeading
              as="h1"
              kicker="Projects"
              title="Tools that stayed in production"
              lead="Each case follows the same arc: the bottleneck, the system we built, and what changed once it shipped."
            />
          </Reveal>
        </div>
      </section>

      <ProjectsGrid />
      <FinalCTA />
    </>
  );
}

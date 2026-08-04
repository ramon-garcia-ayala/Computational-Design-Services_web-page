import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Approach } from "@/components/sections/about/Approach";
import { Expertise } from "@/components/sections/about/Expertise";
import { AwardsMetrics } from "@/components/sections/about/AwardsMetrics";
import { ClientLogos } from "@/components/sections/shared/ClientLogos";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";

export const metadata: Metadata = {
  title: "About us",
  description:
    "How R2ch-Tech works with AEC teams: methodology, expertise areas and studio track record.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="shell relative">
          <Reveal>
            <SectionHeading
              as="h1"
              kicker="About us"
              title="A computational studio that stays inside the workflow"
              lead="We are engineers and computational designers who build the tools AEC teams keep using after we leave."
            />
          </Reveal>
        </div>
      </section>

      <Approach />
      <ClientLogos title="Teams we have worked with" />
      <AwardsMetrics />
      <Expertise />
      <FinalCTA
        title="Have a workflow that should not be manual?"
        body="Describe it in three lines. We will tell you whether it is worth automating and what the first step looks like."
      />
    </>
  );
}

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AwardsMetrics } from "@/components/sections/about/AwardsMetrics";
import { ClientLogos } from "@/components/sections/shared/ClientLogos";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Who R²XTECH is: the studio behind the computational tooling, the teams we have worked with, and the track record. Methodology and expertise areas now live on the services page.",
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
              lead="We are engineers and computational designers who build the tools AEC teams keep using after we leave. How we run an engagement, and what we go deep on, live on the services page."
            />
          </Reveal>
        </div>
      </section>

      <ClientLogos title="Teams we have worked with" />
      <AwardsMetrics />
      <FinalCTA
        title="Have a workflow that should not be manual?"
        body="Describe it in three lines. We will tell you whether it is worth automating and what the first step looks like."
      />
    </>
  );
}

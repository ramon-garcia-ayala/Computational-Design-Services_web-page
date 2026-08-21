import { Hero } from "@/components/sections/home/Hero";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Stats } from "@/components/sections/home/Stats";
import { ClientLogos } from "@/components/sections/shared/ClientLogos";
import { FeaturedProjects } from "@/components/sections/home/FeaturedProjects";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";
import { Preloader } from "@/components/ui/Preloader";

export default function HomePage() {
  return (
    <>
      {/* Home only, and only on a full document load — it decides that for
          itself, so mounting it here is the whole wiring. */}
      <Preloader />
      <Hero />
      <Manifesto />
      <Stats />
      <ClientLogos />
      <FeaturedProjects />
      <FinalCTA />
    </>
  );
}

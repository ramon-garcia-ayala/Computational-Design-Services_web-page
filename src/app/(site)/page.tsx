import { Hero } from "@/components/sections/home/Hero";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Stats } from "@/components/sections/home/Stats";
import { ClientLogos } from "@/components/sections/shared/ClientLogos";
import { FeaturedProjects } from "@/components/sections/home/FeaturedProjects";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Stats />
      <ClientLogos />
      <FeaturedProjects />
      <FinalCTA />
    </>
  );
}

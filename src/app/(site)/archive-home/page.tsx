import type { Metadata } from "next";
import { Hero } from "@/components/sections/home/Hero";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Stats } from "@/components/sections/home/Stats";
import { ClientLogos } from "@/components/sections/shared/ClientLogos";
import { FeaturedProjects } from "@/components/sections/home/FeaturedProjects";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";

/**
 * The previous Home page, kept reachable after the scroll-driven design
 * replaced it at `/`.
 *
 * It stays inside the `(site)` route group deliberately: that layout supplies
 * the dark header and footer it was designed against, so this renders exactly
 * as the old Home did rather than as an approximation of it. Nothing links
 * here and it is kept out of the index — it exists to be compared against the
 * new Home in a browser, which git history alone cannot do.
 *
 * The `Preloader` is intentionally absent: it now belongs to the real Home,
 * and mounting it here would let a visit to the archive consume the
 * once-per-load play that the live page expects to own.
 *
 * Safe to delete once the new Home is settled. The components it renders are
 * still the live ones used elsewhere, so removing this file removes nothing
 * else.
 */
export const metadata: Metadata = {
  title: "Archive — previous Home",
  description: "The previous Home page, retained for reference.",
  robots: { index: false, follow: false },
};

export default function ArchiveHomePage() {
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

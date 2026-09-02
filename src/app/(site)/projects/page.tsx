import type { Metadata } from "next";
import { BackToTop } from "@/components/ui/BackToTop";
import { ProjectIndex } from "@/components/sections/projects/ProjectIndex";
import { FinalCTA } from "@/components/sections/shared/FinalCTA";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Automation systems and computational workflows R²XTECH built for AEC firms.",
};

export default function ProjectsPage() {
  return (
    <div data-site-pale>
      {/* The page opens straight onto the index — no kicker, no headline, no
          lead. The `h1` stays in the document rather than being deleted with
          them: a page whose main content has no heading has no accessible
          name, and the crawler that reads this route would find the first
          project title as the page's own. It is drawn nowhere. */}
      <h1 className="sr-only">Projects</h1>

      <ProjectIndex projects={projects} />
      <FinalCTA />
      <BackToTop />
    </div>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CTALink } from "@/components/ui/CTALink";
import { featuredProjects } from "@/data/projects";

/** Grid de destacados del home, a 2 columnas desde `lg`. */
export function FeaturedProjects() {
  return (
    <section
      aria-labelledby="featured-heading"
      className="border-t border-line py-20 sm:py-28 lg:py-32"
    >
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="Selected work"
            title="Systems we built for AEC teams"
          />
          <CTALink href="/projects">All projects</CTALink>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-16"
        >
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

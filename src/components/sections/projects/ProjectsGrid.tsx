import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/data/projects";

/** Full /projects grid: 1 column on mobile, 2 from `lg` up. */
export function ProjectsGrid() {
  return (
    <section aria-label="All projects" className="pb-24 sm:pb-32">
      <div className="shell">
        <Reveal
          stagger="[data-reveal]"
          className="grid gap-10 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20"
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

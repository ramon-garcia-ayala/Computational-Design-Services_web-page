import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Project } from "@/data/projects";

/** Header of a project's detail page. */
export function ProjectIntro({ project }: { project: Project }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="shell relative">
        <Reveal>
          <Link
            href="/projects"
            className="font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-accent"
          >
            ← All projects
          </Link>

          <h1 className="mt-8 max-w-4xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
            {project.title}
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {project.intro}
          </p>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-3"
        >
          <div className="reveal-init" data-reveal>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Client
            </p>
            <p className="mt-2 text-sm text-fg">{project.client}</p>
          </div>
          <div className="reveal-init" data-reveal>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Year
            </p>
            <p className="mt-2 text-sm text-fg">{project.year}</p>
          </div>
          <div className="reveal-init" data-reveal>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Stack
            </p>
            <p className="mt-2 text-sm text-fg">{project.tags.join(" · ")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

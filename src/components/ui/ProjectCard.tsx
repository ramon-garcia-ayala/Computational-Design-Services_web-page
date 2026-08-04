import Link from "next/link";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de proyecto del grid (home y /projects).
 *
 * Sin `cover` pinta un bloque con retícula en vez de una imagen, para que el
 * proyecto funcione sin ningún asset real.
 */
export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group reveal-init flex flex-col",
        className,
      )}
      data-reveal
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-graphite">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- portadas de dimensiones variables
          <img
            src={project.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid-bg absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-105" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest text-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          View case →
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
            {project.summary}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {project.year}
        </span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}

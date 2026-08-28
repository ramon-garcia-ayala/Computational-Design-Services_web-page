import Image from "next/image";
import Link from "next/link";
import { coverOf, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Project card used in the grid (home and /projects).
 *
 * The cover comes from the generated media manifest, so its dimensions are
 * known and it can go through `next/image`. Without one it paints a
 * grid-textured block instead, so a project still works with no asset at all.
 */
export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const cover = coverOf(project.slug);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group reveal-init flex flex-col",
        className,
      )}
      data-reveal
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-surface border border-line bg-graphite">
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid-bg absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-105" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* The card is itself the `<Link>`, so it is already a natural focus
            target — `group-focus-visible` reaches this exactly the way
            `group-hover` does, at no extra cost, unlike a hover reveal on a
            non-interactive element (see `StatsBar`). */}
        <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest text-accent-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          View case →
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-fg transition-colors group-hover:text-accent-ink sm:text-2xl">
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
            className="rounded-control border border-edge px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}

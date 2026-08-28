import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { coverOf, type Project } from "@/data/projects";

/** Header of a project's detail page. */
export function ProjectIntro({ project }: { project: Project }) {
  const cover = coverOf(project.slug);

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

          <h1 className="mt-8 max-w-4xl text-display font-display font-semibold text-fg">
            {project.title}
          </h1>

          <p className="text-justify hyphens-auto mt-8 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {project.intro}
          </p>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-3"
        >
          <div className="reveal-init" data-reveal>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Context
            </p>
            <p className="mt-2 text-sm text-fg">{project.context}</p>
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

        {cover ? (
          <Reveal className="mt-16">
            {/* Capped for the same reason as the walkthrough media: one cover
                is 1254x1313, which at full shell width would be a screen and a
                half tall before the brief below it started. */}
            <div
              className="relative max-h-[72vh] w-full overflow-hidden rounded-lg border border-line bg-graphite"
              style={{ aspectRatio: `${cover.width} / ${cover.height}` }}
            >
              {/* The LCP of a project page, so it loads eagerly and is the one
                  image here given `priority`. */}
              <Image
                src={cover.src}
                alt={project.title}
                fill
                sizes="(min-width: 1440px) 1200px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}

        {/* The brief, in the author's own words. Set narrower and in body type
            rather than as a second lead: it is the long read under the hook
            above, not a repeat of it. */}
        <Reveal stagger="[data-reveal]" className="mt-20 max-w-2xl">
          <p className="reveal-init font-mono text-[10px] uppercase tracking-widest text-accent" data-reveal>
            Brief
          </p>
          {project.brief.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="reveal-init text-justify hyphens-auto mt-6 text-base leading-relaxed text-fg-muted"
              data-reveal
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

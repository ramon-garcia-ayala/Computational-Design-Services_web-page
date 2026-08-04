import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Project } from "@/data/projects";

/** Jump to the next project at the end of the detail page. */
export function ProjectFooterNav({ next }: { next: Project }) {
  return (
    <section className="border-t border-line">
      <Reveal>
        <Link href={`/projects/${next.slug}`} className="group block">
          <div className="shell flex flex-col gap-6 py-20 sm:flex-row sm:items-end sm:justify-between sm:py-28">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Next project
              </p>
              <p className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight text-fg transition-colors group-hover:text-accent sm:text-5xl">
                {next.title}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="font-mono text-2xl text-accent transition-transform duration-300 group-hover:translate-x-2"
            >
              →
            </span>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}

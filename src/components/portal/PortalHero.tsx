import { Reveal } from "@/components/ui/Reveal";
import { StatusChip, type PortalStatus } from "./StatusChip";
import type { PortalProject } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

/**
 * The panel's opening screen: which project, what phase, and the two dates
 * that answer "where are we".
 *
 * Type is on the shared fluid scale (`text-h1`) rather than the
 * `text-3xl sm:text-5xl lg:text-6xl` step ladder it carried. Same reason the
 * sign-in page moved: `globals.css` documents one scale for the whole site,
 * and a heading that changes *behaviour* by route is the thing it exists to
 * stop. The old ladder also jumped 3rem→3.75rem at exactly 1024px, which is
 * where a laptop lands.
 *
 * The amber radial wash is gone, here and on the sign-in page — it is not in
 * the site's vocabulary anywhere, and on this route group's warm ground it
 * read as a smudge. `grid-bg` stays.
 *
 * The meta row is capped at `max-w-4xl`. Left uncapped its two columns sat
 * 700px apart on a 1440px screen, so "Started · August 2026" and "Next
 * milestone · Sept 12" read as two unrelated notes rather than as one pair.
 */
export function PortalHero({ project }: { project: PortalProject }) {
  const meta = [
    { label: portalCopy.hero.startedLabel, value: project.startLabel },
    ...(project.nextMilestone
      ? [
          {
            label: portalCopy.hero.nextMilestoneLabel,
            value: `${project.nextMilestone.label} · ${project.nextMilestone.date}`,
          },
        ]
      : []),
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="shell relative">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4">
            {/* The landing's kicker idiom: `tracking-[0.3em]`, sized off the
                type scale rather than pinned at 10px. */}
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
              {project.phase}
            </p>
            <StatusChip status={project.state as PortalStatus}>
              {portalCopy.projectState[project.state]}
            </StatusChip>
          </div>

          <h1 className="mt-5 max-w-4xl text-h1 font-display font-semibold text-fg">
            {project.name}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {project.summary}
          </p>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-12 grid max-w-4xl gap-8 border-t border-line pt-8 sm:grid-cols-2"
        >
          {meta.map((item) => (
            <div key={item.label} className="reveal-init" data-reveal>
              <p className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
                {item.label}
              </p>
              <p className="mt-2 text-sm text-fg">{item.value}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

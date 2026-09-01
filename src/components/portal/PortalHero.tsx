import { Reveal } from "@/components/ui/Reveal";
import { StatusChip, type PortalStatus } from "./StatusChip";
import type { PortalProject } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

export function PortalHero({ project }: { project: PortalProject }) {
  const meta = [
    { label: portalCopy.hero.startedLabel, value: project.startLabel },
    ...(project.nextMilestone
      ? [{ label: portalCopy.hero.nextMilestoneLabel, value: `${project.nextMilestone.label} · ${project.nextMilestone.date}` }]
      : []),
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,color-mix(in_srgb,var(--color-accent)_7%,transparent),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">{project.phase}</p>
            <StatusChip status={project.state as PortalStatus}>
              {portalCopy.projectState[project.state]}
            </StatusChip>
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-3xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            {project.name}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {project.summary}
          </p>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2"
        >
          {meta.map((item) => (
            <div key={item.label} className="reveal-init" data-reveal>
              <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{item.label}</p>
              <p className="mt-2 text-sm text-fg">{item.value}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

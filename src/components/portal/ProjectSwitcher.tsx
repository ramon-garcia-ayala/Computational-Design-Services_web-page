import Link from "next/link";
import { cn } from "@/lib/utils";
import { portalCopy } from "@/data/portal/copy";
import type { PortalProject } from "@/data/portal/types";

/**
 * Which project is showing lives in the URL (`?project=<id>`), not in client
 * state — the dashboard page is a Server Component and this stays a plain set
 * of links, no JS required to switch. Renders nothing for a single-project
 * client: a switcher with one option is not a control, it's decoration.
 */
export function ProjectSwitcher({
  projects,
  activeId,
}: {
  projects: PortalProject[];
  activeId: string;
}) {
  if (projects.length < 2) return null;

  return (
    <nav aria-label={portalCopy.chrome.projectSwitcherLabel} className="flex items-center gap-2">
      {projects.map((project) => {
        const active = project.id === activeId;
        return (
          <Link
            key={project.id}
            href={`/portal/dashboard?project=${encodeURIComponent(project.id)}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              /* 44px, matching `SignOutButton` beside it — these two sit 12px
                 apart in the header and were both ~25px tall. */
              "inline-flex min-h-11 items-center rounded-control border px-4 font-mono text-[11px] uppercase tracking-widest transition-colors sm:text-xs",
              active
                ? "border-accent-ink text-accent-ink"
                : "border-edge text-fg-muted hover:border-accent-ink hover:text-accent-ink",
            )}
          >
            {project.name}
          </Link>
        );
      })}
    </nav>
  );
}

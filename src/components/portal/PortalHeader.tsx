import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { ProjectSwitcher } from "./ProjectSwitcher";
import type { PortalClient, PortalProject } from "@/data/portal/types";

/** Fixed panel bar. No site navigation: the client should not wander off. */
export function PortalHeader({
  client,
  activeProject,
}: {
  client: PortalClient;
  activeProject: PortalProject;
}) {
  return (
    <header
      data-portal-chrome
      className="fixed inset-x-0 top-0 z-50 border-b border-line-soft bg-carbon/80 backdrop-blur-sm"
    >
      <div className="shell flex h-14 flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-tight text-fg transition-colors hover:text-accent-ink"
          >
            R<sup className="text-accent-ink">2</sup>&#967;TECH
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-fg-muted sm:inline">
            {client.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ProjectSwitcher projects={client.projects} activeId={activeProject.id} />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

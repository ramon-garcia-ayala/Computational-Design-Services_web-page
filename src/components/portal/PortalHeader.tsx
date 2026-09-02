import { SignOutButton } from "./SignOutButton";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { PortalWordmark } from "./PortalWordmark";
import type { PortalClient, PortalProject } from "@/data/portal/types";

/**
 * Fixed panel bar. No site navigation: the client should not wander off, so
 * the lockup is the only way back and it goes to the site root.
 *
 * The lockup is the real asset through `PortalWordmark`, not the hand-set
 * `R²χTECH` this used to print — see that component for why the typed version
 * was spelling the studio's name with the wrong letterform.
 */
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
          <PortalWordmark />
          {/* `text-[11px]`, the site's own chrome size — the panel had every
              label a step smaller than the same label elsewhere. */}
          <span className="hidden font-mono text-[11px] uppercase tracking-widest text-fg-muted sm:inline">
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

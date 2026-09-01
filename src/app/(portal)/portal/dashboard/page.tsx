import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPortalClient } from "@/data/portal";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SLUG_COOKIE,
  getPortalSecret,
  verifySessionToken,
} from "@/lib/portal-auth";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalIndex, type PortalIndexEntry } from "@/components/portal/PortalIndex";
import { PortalHero } from "@/components/portal/PortalHero";
import { KpiSection } from "@/components/portal/KpiSection";
import { TimelineSection } from "@/components/portal/TimelineSection";
import { ScopeSection } from "@/components/portal/ScopeSection";
import { TodoSection } from "@/components/portal/TodoSection";
import { DocumentsSection } from "@/components/portal/DocumentsSection";
import { BudgetSection } from "@/components/portal/BudgetSection";
import { UpdatesSection } from "@/components/portal/UpdatesSection";
import { portalCopy } from "@/data/portal/copy";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `Project panel · ${site.nameFlat}` },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ project?: string }> };

/**
 * This page revalidates the session itself rather than trusting that
 * `src/proxy.ts` already ran. Belt-and-braces: a page this sensitive should
 * not depend solely on network-edge routing to stay closed, the same
 * discipline `getSecret()`/`getPortalSecret()` already apply to every other
 * secret in this codebase. `force-dynamic` because the content is per-session
 * and must never be cached or prerendered.
 */
export const dynamic = "force-dynamic";

export default async function PortalDashboardPage({ searchParams }: PageProps) {
  const { project: projectId } = await searchParams;
  const cookieStore = await cookies();

  const secret = getPortalSecret();
  const slug = cookieStore.get(PORTAL_SLUG_COOKIE)?.value;
  const token = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;

  if (!secret || !slug || !(await verifySessionToken(token, slug, secret))) {
    redirect("/portal");
  }

  const client = getPortalClient(slug);
  if (!client || client.projects.length === 0) {
    redirect("/portal");
  }

  const project = client.projects.find((p) => p.id === projectId) ?? client.projects[0];

  const entries: PortalIndexEntry[] = [
    { id: "overview", label: portalCopy.sections.overview.kicker },
    { id: "timeline", label: portalCopy.sections.timeline.kicker },
    { id: "scope", label: portalCopy.sections.scope.kicker },
    { id: "todos", label: portalCopy.sections.todos.kicker },
    { id: "documents", label: portalCopy.sections.documents.kicker },
    { id: "budget", label: portalCopy.sections.budget.kicker },
    { id: "updates", label: portalCopy.sections.updates.kicker },
  ];

  return (
    <>
      <PortalHeader client={client} activeProject={project} />
      <PortalIndex entries={entries} />
      <PortalHero project={project} />

      <KpiSection kpis={project.kpis} />
      <TimelineSection phases={project.timeline} />
      <ScopeSection groups={project.scope} />
      <TodoSection groups={project.todos} />
      <DocumentsSection documents={project.documents} slug={client.slug} />
      <BudgetSection budget={project.budget} />
      <UpdatesSection updates={project.updates ?? []} />

      <p className="sr-only">
        Private project panel prepared by {site.nameFlat} for {client.name}.
      </p>
    </>
  );
}

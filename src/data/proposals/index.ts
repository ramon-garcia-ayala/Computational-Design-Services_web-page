import type { ProposalData } from "./types";

// Registro central: añade aquí cada nueva propuesta
const proposalRegistry: Record<string, () => Promise<{ default: ProposalData }>> = {
  "29.06.2026_ecogen": () => import("./29.06.2026_ecogen"),
  "29.06.2026_reparametrize": () => import("./29.06.2026_reparametrize"),
};

export async function getProposal(slug: string): Promise<ProposalData | null> {
  const loader = proposalRegistry[slug];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

export function getAllProposalSlugs(): string[] {
  return Object.keys(proposalRegistry);
}

export type { ProposalData };

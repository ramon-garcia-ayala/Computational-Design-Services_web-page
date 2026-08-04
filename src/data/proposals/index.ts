import { ecogenFluence } from "./ecogen-fluence";
import type { Proposal } from "./types";

export type * from "./types";

/** Una entrada por propuesta. Añadir aquí genera su ruta estática. */
export const proposals: Proposal[] = [ecogenFluence];

export const proposalSlugs = proposals.map((proposal) => proposal.slug);

export function getProposalBySlug(slug: string): Proposal | undefined {
  return proposals.find((proposal) => proposal.slug === slug);
}

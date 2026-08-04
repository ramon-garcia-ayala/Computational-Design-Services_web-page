import { ecogenFluence } from "./ecogen-fluence";
import type { Proposal } from "./types";

export type * from "./types";

/** One entry per proposal. Adding one here generates its static route. */
export const proposals: Proposal[] = [ecogenFluence];

export const proposalSlugs = proposals.map((proposal) => proposal.slug);

export function getProposalBySlug(slug: string): Proposal | undefined {
  return proposals.find((proposal) => proposal.slug === slug);
}
